/**
 * Mode « inbox » (boîtes de réception CloudCannon, PUBLIC_FORMS_ENABLED=inbox)
 * — objet du courriel de notification et clés de classement.
 *
 * DÉCISION 2026-09-17 (Gabriel) : un objet DIFFÉRENT par message — sinon
 * Gmail/Outlook enfilent toutes les notifications (« New message on
 * <site> ») dans une seule conversation — avec un PRÉFIXE stable entre
 * crochets pour les règles de classement de la boîte courriel (étiquettes
 * Gmail, dossiers/catégories Outlook, transfert automatique par catégorie) :
 *
 *   [contact/carriere] Une carrière · Services applicatifs — Prénom Nom
 *   [infolettre] marie@exemple.com
 *   [campagne-evaluation] Marie Tremblay
 *
 * Le crochet = clés NEUTRES (identifiant du formulaire + clé du sujet, mêmes
 * clés que src/lib/contact/presets.ts) : UNE règle « objet contient
 * [contact/carriere] » classe les messages FR et EN, et renommer une option
 * de liste au CMS ne casse aucun filtre. La partie lisible = libellés de la
 * langue du visiteur + son nom (c'est elle qui rend chaque objet unique).
 * CloudCannon lit l'objet dans le champ spécial `_subject` et le Reply-To
 * dans `_replyto` (docs/formulaires.md §4.2).
 *
 * Deux temps :
 *  - au BUILD, les gabarits émettent `_subject` = valeur STATIQUE
 *    (inboxSubjectStatic : « [contact] Message du site — formulaire de
 *    contact ») — l'objet sans JavaScript, toujours filtrable ;
 *  - à la SOUMISSION, inbox-client.ts (navigateur) recompose l'objet avec les
 *    valeurs saisies (composeInboxSubject) et pose `_replyto`.
 *
 * PUR (aucun import, opérations de chaînes seulement) : importé par form.astro,
 * donc compilé dans le bundle navigateur de l'éditeur visuel CloudCannon —
 * même règle que field-name.ts. Testé par inbox.test.ts.
 */

/** Longueur maximale d'un objet composé (au-delà : coupé, terminé par « … »). */
export const INBOX_SUBJECT_MAX = 150;

/** Clé neutre : minuscules ASCII, chiffres et tirets (accents retirés). */
export function inboxSlug(raw: string | undefined): string {
  return (raw ?? '')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Clé du formulaire dans le crochet : l'identifiant de la définition
 * (`formId` = nom du fichier de la collection Formulaires), sinon le titre de
 * la section (formulaire inline), sinon « formulaire ».
 */
export function inboxFormKey(formId: string | undefined, title: string | undefined): string {
  return inboxSlug(formId) || inboxSlug(title) || 'formulaire';
}

/** Objet STATIQUE émis au build : « [clé] objet de la définition » (ou « [clé] » seul). */
export function inboxSubjectStatic(key: string, definitionSubject: string | undefined): string {
  const subject = clean(definitionSubject);
  return subject ? `[${key}] ${subject}` : `[${key}]`;
}

export interface InboxSubjectParts {
  /** Clé du formulaire (inboxFormKey). */
  key: string;
  /** Clé neutre du sujet choisi (ex. « carriere ») — ajoutée « /clé » au crochet. */
  sujetKey?: string;
  /** Valeurs lisibles (libellés des listes choisies), jointes par « · ». */
  details?: string[];
  /** Nom du visiteur (prénom + nom) ; vide → `fallback`. */
  name?: string;
  /** Repli quand le nom manque (le courriel, en pratique). */
  fallback?: string;
  /** Objet statique (valeur d'origine du champ) — rendu si rien n'est saisi. */
  staticSubject: string;
}

/** Objet composé à la soumission — format en entête. */
export function composeInboxSubject(parts: InboxSubjectParts): string {
  const key = inboxSlug(parts.key) || 'formulaire';
  const sujet = inboxSlug(parts.sujetKey);
  const bracket = `[${sujet ? `${key}/${sujet}` : key}]`;
  const details = (parts.details ?? []).map(clean).filter(Boolean).join(' · ');
  const who = clean(parts.name) || clean(parts.fallback);
  const body = [details, who].filter(Boolean).join(' — ');
  if (!body) return parts.staticSubject;
  const subject = `${bracket} ${body}`;
  return subject.length > INBOX_SUBJECT_MAX ? `${subject.slice(0, INBOX_SUBJECT_MAX - 1)}…` : subject;
}

/** Une valeur saisie : sur une ligne, sans crochets (réservés au préfixe). */
function clean(raw: string | undefined): string {
  return (raw ?? '')
    .replace(/[\r\n[\]]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}
