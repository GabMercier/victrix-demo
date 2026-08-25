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
 * annonces la refuse au build — l'éditeur ne peut pas en publier une.
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

export interface AnnounceCandidate {
  id: string;
  enabled: boolean;
  startAt?: string;
  endAt?: string;
}

/**
 * Choisit LA bannière à afficher parmi la bibliothèque (collection
 * `annonces`) : parmi les bannières « Affichée » dont la fenêtre couvre
 * `now`, la plus récemment COMMENCÉE gagne (startAt le plus tardif ; "" =
 * commencée depuis toujours, donc perd contre toute bannière datée). Égalité
 * → id alphabétique, et l'ordre d'entrée est indifférent (l'ordre du loader
 * n'est pas un contrat). `staticOnly` (éditeur visuel CloudCannon) : première
 * bannière « Affichée » par id, fenêtre IGNORÉE — l'éditeur voit toujours
 * quelque chose à modifier ; `enabled: false` reste exclu (interrupteur
 * maître). `undefined` = aucune bannière (le site n'en rend pas).
 */
export function pickActiveAnnounce<T extends AnnounceCandidate>(
  entries: readonly T[],
  now: Date,
  staticOnly = false,
): T | undefined {
  const enabled = entries
    .filter((e) => e.enabled)
    .sort((a, b) => a.id.localeCompare(b.id));
  if (staticOnly) return enabled[0];
  const startTime = (e: T) => parseBound(e.startAt ?? '')?.valueOf() ?? -Infinity;
  return enabled
    .filter((e) => isWithinWindow(now, e.startAt, e.endAt))
    // Tri STABLE (garanti ES2019) : les égalités de startAt gardent l'ordre
    // alphabétique établi ci-dessus.
    .sort((a, b) => startTime(b) - startTime(a))[0];
}
