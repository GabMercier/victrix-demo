/**
 * Registre des formulaires — les définitions CMS (src/data/forms/<lang>/<id>.json)
 * embarquées AU BUILD dans le endpoint /api/forms via import.meta.glob.
 *
 * SÉCURITÉ (le point du chantier « formulaires v2 ») : le POST du navigateur
 * n'envoie qu'un identifiant (`_formId`). Le serveur résout destinataire,
 * sujet et listes de champs requis/courriel DEPUIS CE REGISTRE — jamais depuis
 * la soumission. Le registre est de fait la liste blanche : seul un fichier
 * commité dans src/data/forms/ peut router un courriel, et un `_formId`
 * inconnu est un échec de validation.
 *
 * Pur (aucun import Astro, aucun accès disque) : le module reçoit le résultat
 * d'import.meta.glob en paramètre — testable en node nu (registry.test.ts) et
 * identique dans workerd. Les définitions elles-mêmes sont validées au build
 * par la collection `forms` (src/content.config.ts) : ici on normalise, on ne
 * revalide pas.
 */
import { fieldName } from './field-name';

export interface FormFieldShowIf {
  /**
   * LIBELLÉ exact du champ pilote (contrat éditeur — le build valide
   * l'existence, le type select|checkbox et l'absence de chaînage :
   * formFieldRules dans src/content.config.ts).
   */
  field: string;
  equals: string;
}

export interface FormFieldDef {
  label: string;
  type: 'text' | 'email' | 'tel' | 'textarea' | 'select' | 'checkbox' | 'hidden';
  required: boolean;
  /** select seulement : les choix offerts — liste blanche côté serveur. */
  options?: string[];
  /** hidden seulement : valeur émise (jetons — voir hidden-tokens.ts). */
  value?: string;
  /** Condition d'affichage ACTIVE (field non vide) — sinon absent. */
  showIf?: FormFieldShowIf;
}

export interface FormDef {
  /** Nom interne affiché aux éditeurs (jamais aux visiteurs). */
  name: string;
  /** Destinataire de la notification; '' → repli FORMS_TO_EMAIL. */
  toEmail: string;
  /** Objet du courriel; '' → objet générique du endpoint. */
  subject: string;
  submitLabel: string;
  consentText: string;
  fields: FormFieldDef[];
}

/** Clé : `<lang>/<id>` — ex. "fr/contact" (id = nom du fichier sans .json). */
export type FormRegistry = Record<string, FormDef>;

/** Types de champ admis — même liste que FORM_FIELD_TYPES (content.config.ts). */
const FIELD_TYPES: ReadonlySet<string> = new Set([
  'text',
  'email',
  'tel',
  'textarea',
  'select',
  'checkbox',
  'hidden',
]);

/**
 * Normalise UN champ de définition — champ par champ depuis P-05 : les clés
 * étendues (options/value/showIf) sont optionnelles et l'éditeur CloudCannon
 * pose des « formes vides » (options: [], value: '', showIf {field:''}) qui
 * normalisent à ABSENT. showIf.field est conservé tel quel (non trimé) : la
 * résolution du pilote se fait par égalité EXACTE de libellé, comme le
 * garde-fou de build (formFieldRules).
 */
function normalizeField(raw: unknown): FormFieldDef {
  const f = (raw ?? {}) as Partial<FormFieldDef> & { showIf?: Partial<FormFieldShowIf> };
  const def: FormFieldDef = {
    label: typeof f.label === 'string' ? f.label : '',
    type:
      typeof f.type === 'string' && FIELD_TYPES.has(f.type)
        ? (f.type as FormFieldDef['type'])
        : 'text',
    required: f.required === true,
  };
  if (Array.isArray(f.options)) {
    // Options TRIMÉES : un espace de bordure invisible (saisie CloudCannon)
    // rendrait l'option insoumissible — selectFieldViolations trime la valeur
    // soumise, les deux côtés doivent l'être (même règle que showIfSatisfied).
    const options = f.options
      .filter((o): o is string => typeof o === 'string')
      .map((o) => o.trim())
      .filter((o) => o !== '');
    if (options.length > 0) def.options = options;
  }
  if (typeof f.value === 'string' && f.value !== '') def.value = f.value;
  const showIfField = typeof f.showIf?.field === 'string' ? f.showIf.field : '';
  if (showIfField.trim() !== '') {
    def.showIf = {
      field: showIfField,
      equals: typeof f.showIf?.equals === 'string' ? f.showIf.equals : '',
    };
  }
  return def;
}

/**
 * Construit le registre depuis un `import.meta.glob('…/forms/**' + '/*.json',
 * { eager: true })`. Les chemins hors du motif `<fr|en>/<id>.json` sont
 * ignorés (un fichier égaré ne crée pas d'entrée fantôme).
 */
export function buildRegistry(modules: Record<string, unknown>): FormRegistry {
  const registry: FormRegistry = {};
  for (const [path, mod] of Object.entries(modules)) {
    const match = path.replace(/\\/g, '/').match(/forms\/(fr|en)\/([^/]+)\.json$/);
    if (!match) continue;
    // Vite expose le JSON en `default`; un objet nu (tests) passe tel quel.
    const data = (((mod as { default?: unknown }).default ?? mod) ?? {}) as Partial<FormDef>;
    registry[`${match[1]}/${match[2]}`] = {
      name: typeof data.name === 'string' ? data.name : match[2],
      toEmail: typeof data.toEmail === 'string' ? data.toEmail : '',
      subject: typeof data.subject === 'string' ? data.subject : '',
      submitLabel: typeof data.submitLabel === 'string' ? data.submitLabel : '',
      consentText: typeof data.consentText === 'string' ? data.consentText : '',
      fields: Array.isArray(data.fields) ? data.fields.map(normalizeField) : [],
    };
  }
  return registry;
}

/** Résolution stricte `<lang>/<id>` — pas de repli inter-langues. */
export function resolveForm(
  registry: FormRegistry,
  lang: 'fr' | 'en',
  formId: string,
): FormDef | undefined {
  return registry[`${lang}/${formId}`];
}

/**
 * Vrai si la condition d'affichage du champ est satisfaite par la soumission.
 * Pilote résolu par LIBELLÉ exact (contrat éditeur) puis converti en nom HTML
 * via la dérivation partagée — la comparaison trime les deux côtés (un espace
 * de saisie dans « valeur attendue » ne doit pas casser une condition).
 * Pilote introuvable = condition réputée satisfaite (le build l'a déjà
 * validée; purement défensif).
 */
function showIfSatisfied(
  def: FormDef,
  showIf: FormFieldShowIf,
  submitted: Record<string, string>,
): boolean {
  const pilotIndex = def.fields.findIndex((f) => f.label === showIf.field);
  if (pilotIndex === -1) return true;
  const pilotName = fieldName(def.fields[pilotIndex].label, pilotIndex);
  return (submitted[pilotName] ?? '').trim() === showIf.equals.trim();
}

/**
 * Noms HTML des champs requis — même dérivation que la section « form ».
 * Depuis P-05 :
 *  - un champ `hidden` n'est JAMAIS requis (un jeton peut légitimement se
 *    résoudre en chaîne vide — l'exiger casserait toute soumission);
 *  - avec `submittedFields`, un champ requis dont la condition d'affichage
 *    n'est pas satisfaite n'est PAS exigé — évalué DEPUIS LA DÉFINITION avec
 *    les valeurs soumises, jamais depuis une liste envoyée par le client;
 *  - sans `submittedFields` (usage historique), toute condition est réputée
 *    satisfaite.
 */
export function requiredFieldNames(
  def: FormDef,
  submittedFields?: Record<string, string>,
): string[] {
  return def.fields
    .map((field, i) => {
      if (!field.required || field.type === 'hidden') return null;
      if (field.showIf && submittedFields && !showIfSatisfied(def, field.showIf, submittedFields)) {
        return null;
      }
      return fieldName(field.label, i);
    })
    .filter((name): name is string => name !== null);
}

/** Noms HTML des champs courriel — même dérivation que la section « form ». */
export function emailFieldNames(def: FormDef): string[] {
  return def.fields
    .map((field, i) => (field.type === 'email' ? fieldName(field.label, i) : null))
    .filter((name): name is string => name !== null);
}

/**
 * Noms HTML des cases à cocher — pour refléter « oui »/« non » dans le
 * courriel (une case non cochée est ABSENTE d'un POST urlencoded : sans cette
 * liste, le serveur ne peut pas distinguer « non cochée » de « inexistante »).
 */
export function checkboxFieldNames(def: FormDef): string[] {
  return def.fields
    .map((field, i) => (field.type === 'checkbox' ? fieldName(field.label, i) : null))
    .filter((name): name is string => name !== null);
}

/**
 * Liste blanche des selects : toute valeur soumise non vide hors des
 * `options` de la définition est une violation (le registre est la source de
 * vérité — un POST forgé ne choisit pas ses propres réponses). La valeur vide
 * reste l'affaire du contrôle des requis. Des valeurs répétées jointes par
 * « , » (parseFormBody) échouent naturellement — une option contenant une
 * virgule est déconseillée (commentaire CloudCannon assorti).
 */
export function selectFieldViolations(
  def: FormDef,
  submitted: Record<string, string>,
): string[] {
  const violations: string[] = [];
  def.fields.forEach((field, i) => {
    if (field.type !== 'select') return;
    const name = fieldName(field.label, i);
    const value = (submitted[name] ?? '').trim();
    if (value === '') return;
    if (!(field.options ?? []).includes(value)) violations.push(`valeur hors liste: ${name}`);
  });
  return violations;
}
