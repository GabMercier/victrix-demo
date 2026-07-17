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

export interface FormFieldDef {
  label: string;
  type: 'text' | 'email' | 'textarea';
  required: boolean;
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
      fields: Array.isArray(data.fields) ? (data.fields as FormFieldDef[]) : [],
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

/** Noms HTML des champs requis — même dérivation que la section « form ». */
export function requiredFieldNames(def: FormDef): string[] {
  return def.fields
    .map((field, i) => (field.required ? fieldName(field.label, i) : null))
    .filter((name): name is string => name !== null);
}

/** Noms HTML des champs courriel — même dérivation que la section « form ». */
export function emailFieldNames(def: FormDef): string[] {
  return def.fields
    .map((field, i) => (field.type === 'email' ? fieldName(field.label, i) : null))
    .filter((name): name is string => name !== null);
}
