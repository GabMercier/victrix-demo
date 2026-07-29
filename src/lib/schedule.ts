/**
 * Fenêtre de diffusion planifiée (2026-07-30 — demande marketing : programmer
 * l'affichage/retrait de la bannière d'annonce; le même utilitaire servira à
 * toute planification future).
 *
 * RÉALITÉ D'UN SITE STATIQUE — à garder en tête partout où on l'utilise : la
 * fenêtre est évaluée AU MOMENT DU BUILD, pas au moment de la visite. Un
 * contenu programmé n'apparaît/disparaît qu'à la prochaine reconstruction du
 * site — d'où le rebuild quotidien planifié (.github/workflows/
 * rebuild-planifie.yml + docs/operations.md § « Publication planifiée »).
 *
 * Bornes : début INCLUS (now >= startAt), fin EXCLUE (now < endAt) — « retirer
 * le 1er août » signifie que la bannière ne se voit plus au build du 1er août.
 * Chaîne vide = pas de borne. Une date invalide est traitée comme « pas de
 * borne » ICI (fonction défensive), mais le schéma zod de la collection
 * navigation la refuse au build — l'éditeur ne peut pas en publier une.
 * Les dates sans fuseau (« 2026-08-01T09:00 ») sont interprétées dans le
 * fuseau de la machine de build (UTC chez CloudCannon/Cloudflare).
 */

/** `null` si vide/invalide, sinon la date. */
function parseBound(value: string): Date | null {
  const trimmed = (value ?? '').trim();
  if (trimmed === '') return null;
  const d = new Date(trimmed);
  return Number.isNaN(d.valueOf()) ? null : d;
}

/** L'instant `now` est-il dans la fenêtre [startAt, endAt) ? */
export function isWithinWindow(now: Date, startAt = '', endAt = ''): boolean {
  const start = parseBound(startAt);
  if (start && now < start) return false;
  const end = parseBound(endAt);
  if (end && now >= end) return false;
  return true;
}
