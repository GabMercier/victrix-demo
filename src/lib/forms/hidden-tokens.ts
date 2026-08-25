/**
 * Jetons des champs cachés (« champs auto-peuplés », P-05) — LOGIQUE PARTAGÉE
 * consommée par la section Bookshop « form » (component-library/.../form/
 * form.astro, rendue dans le NAVIGATEUR par l'éditeur visuel CloudCannon).
 *
 * Uniquement des opérations de chaînes, AUCUN import : ce module doit rester
 * exécutable tel quel dans le bundle d'édition en direct de CloudCannon
 * (même règle que field-name.ts).
 *
 * Deux familles de jetons dans le `value` d'un champ `hidden` :
 *  - `{{page.titre}}`, `{{page.chemin}}`, `{{page.slug}}`, `{{page.langue}}` —
 *    résolus AU BUILD depuis le contexte de la page hôte (injecté par la route
 *    via le seam enrich; absent dans l'éditeur visuel → chaîne vide). Ils se
 *    mélangent librement à du texte fixe.
 *  - `{{url.<param>}}` — la valeur ENTIÈRE du champ, rien d'autre (restriction
 *    délibérée : garde le script client trivial). Rendu en hidden vide +
 *    attribut data-url-param; un mini-script le remplit au chargement depuis
 *    la barre d'adresse (ex. utm_source). Mêlé à du texte, il se résout en
 *    chaîne vide comme tout jeton inconnu.
 *
 * Tout jeton `{{…}}` non reconnu se résout en chaîne vide — un courriel de
 * notification ne doit JAMAIS montrer un jeton brut.
 */

export interface PageTokenContext {
  titre?: string;
  chemin?: string;
  slug?: string;
  langue?: string;
}

/** `{{url.<param>}}` seul et entier — param minuscule/chiffres/underscore. */
const URL_TOKEN_RE = /^\{\{\s*url\.([a-z0-9_]{1,32})\s*\}\}$/;

/** Tout jeton `{{…}}` (clé en minuscules, points/underscores permis). */
const TOKEN_RE = /\{\{\s*([a-z0-9_.]+)\s*\}\}/g;

export function resolveHiddenValue(
  raw: string,
  ctx: PageTokenContext,
): { value: string; urlParam: string | null } {
  const urlMatch = URL_TOKEN_RE.exec((raw ?? '').trim());
  if (urlMatch) return { value: '', urlParam: urlMatch[1] };
  const value = (raw ?? '').replace(TOKEN_RE, (_token, key: string) => {
    switch (key) {
      case 'page.titre':
        return ctx.titre ?? '';
      case 'page.chemin':
        return ctx.chemin ?? '';
      case 'page.slug':
        return ctx.slug ?? '';
      case 'page.langue':
        return ctx.langue ?? '';
      default:
        return '';
    }
  });
  return { value, urlParam: null };
}
