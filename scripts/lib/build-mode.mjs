/**
 * Mode de build — les DEUX drapeaux d'environnement et ce qu'ils commandent
 * (lot L16, 2026-09-24). Logique PURE, testée par src/lib/build-mode.test.ts,
 * consommée par astro.config.mjs (qui ne peut pas importer de TypeScript).
 *
 * Avant L16, `STATIC_ONLY` portait deux rôles : « build 100 % statique » ET
 * « politique d'aperçu d'édition » (brouillons et articles à date future
 * construits, fenêtres des bannières ignorées, Bookshop attaché). Le site de
 * PRODUCTION CloudCannon, construit lui aussi en STATIC_ONLY=1, publiait donc
 * les brouillons. Les deux rôles sont maintenant deux variables :
 *
 *  - `STATIC_ONLY`     → l'adaptateur Cloudflare reste ÉTEINT et toute route
 *                        à la demande est force-prérendue. Les deux sites
 *                        CloudCannon (édition ET production) le posent.
 *  - `EDITOR_PREVIEW`  → la politique d'APERÇU : brouillons et articles
 *                        programmés visibles (src/i18n/blog.ts), fenêtres des
 *                        bannières ignorées (src/lib/announce.ts), redirections
 *                        des articles retirés NON émises (les éditrices
 *                        doivent encore voir les brouillons), Bookshop attaché.
 *                        SEULS les sites d'ÉDITION le posent — jamais la
 *                        production.
 *
 * Bookshop n'est attaché que si les DEUX sont posés : son plugin Vite réécrit
 * le JS compilé de chaque module .astro, y compris les routes à la demande
 * qui deviennent la Function Cloudflare — un aperçu d'édition avec adaptateur
 * n'a aucun sens et casserait le worker. Cette combinaison est signalée.
 *
 * Toute valeur NON VIDE vaut « posé » (même convention que les autres
 * variables de build du projet : `STATIC_ONLY=1`, `DRAFTS_VISIBLE=1`).
 */

/**
 * @param {Record<string, string | undefined>} env — `process.env` (ou un
 *   objet de test).
 * @returns {{ staticOnly: boolean, editorPreview: boolean, attachBookshop: boolean, avertissements: string[] }}
 */
export function resolveBuildMode(env) {
  const staticOnly = Boolean(env.STATIC_ONLY);
  const editorPreview = Boolean(env.EDITOR_PREVIEW);
  const avertissements = [];
  if (editorPreview && !staticOnly) {
    avertissements.push(
      '[build-mode] EDITOR_PREVIEW est posé sans STATIC_ONLY : Bookshop n’est PAS attaché (son plugin réécrirait le worker Cloudflare). ' +
        'Un site d’édition CloudCannon doit poser les DEUX variables (docs/operations.md § 6).',
    );
  }
  return {
    staticOnly,
    editorPreview,
    attachBookshop: staticOnly && editorPreview,
    avertissements,
  };
}

/**
 * Redirections à ÉMETTRE dans ce build. Une règle marquée `retire: true`
 * (article passé en brouillon — D19, générée par scripts/build-redirects.mjs
 * depuis `articles_retires` de docs/migration/correspondance-urls.json) ne
 * s'émet PAS dans un aperçu d'édition : la page y existe encore, une 301
 * la masquerait aux éditrices. Partout ailleurs (production, gate local), la
 * page n'est pas construite et la 301 prend le relais.
 *
 * @template {{ retire?: boolean }} T
 * @param {T[]} entries
 * @param {boolean} editorPreview
 * @returns {{ gardees: T[], retenues: number }}
 */
export function filtreRedirectionsSelonMode(entries, editorPreview) {
  if (!editorPreview) return { gardees: entries, retenues: 0 };
  const gardees = entries.filter((e) => !(e && e.retire === true));
  return { gardees, retenues: entries.length - gardees.length };
}
