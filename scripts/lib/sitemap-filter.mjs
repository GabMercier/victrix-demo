/**
 * Décision « cette page entre-t-elle au plan de site ? » — logique PURE,
 * extraite d'astro.config.mjs le 2026-09-22 pour être testée
 * (src/lib/sitemap-filter.test.ts), comme scripts/lib/h1-guard.mjs.
 *
 * POURQUOI cette extraction. Le filtre mêlait deux natures de règles et les
 * traitait toutes en `includes`, ce qui a coûté cher : la page mère
 * `src/content/pages/<langue>/services.json` est `noindex`, son chemin est donc
 * `/fr/services/` — et `includes` le trouvait dans le chemin de CHACUN de ses
 * enfants. Résultat mesuré le 22/09 : **72 URL annoncées pour 186 pages**, tout
 * le catalogue de services absent du plan de site. Les deux natures sont
 * désormais explicites :
 *
 *   PRÉFIXES  — une famille entière d'URL sort du plan de site
 *               (`/campagnes/`, `/merci/`, `/portail`…) : `includes` est VOULU.
 *   EXACTS    — une page précise porte `noindex:true` : correspondance
 *               EXACTE sur le chemin, jamais `includes`. Le `noindex` d'une
 *               page mère ne doit pas désindexer ses enfants.
 */

/**
 * Familles d'URL hors plan de site, par PRÉFIXE (la sous-chaîne est voulue).
 * - `/campagnes/` : pages de destination `noindex` par défaut — les lister
 *   inviterait les moteurs sur des URL réservées au trafic payant ou ciblé.
 * - `/merci/` : n'a de sens qu'après l'envoi d'un formulaire.
 * - `/recherche/` : résultats de recherche interne (jamais indexés).
 * - `/style-guide` : page interne « Design System Victrix ».
 * - `/services/demo-sections` : service de démonstration, sert aux captures.
 * - `/portail` : page de connexion `noindex`, prérendue depuis le retrait du
 *   portail mock (2026-08-18).
 */
export const PREFIXES_HORS_SITEMAP = [
  '/campagnes/',
  '/merci/',
  '/recherche/',
  '/style-guide',
  '/services/demo-sections',
  '/portail',
];

/**
 * @param {string} page URL COMPLÈTE fournie par @astrojs/sitemap (domaine inclus)
 * @param {string[]} cheminsNoindex chemins exacts, barre oblique finale comprise
 *   (ex. `/fr/tarification/`), produits en lisant le contenu au build
 * @returns {boolean} true si la page doit figurer au plan de site
 */
export function entreAuSitemap(page, cheminsNoindex = []) {
  if (PREFIXES_HORS_SITEMAP.some((prefixe) => page.includes(prefixe))) return false;
  let chemin;
  try {
    chemin = new URL(page).pathname;
  } catch {
    // Pas une URL absolue : on se rabat sur la chaîne telle quelle, pour que
    // la fonction reste utilisable hors du contexte du build.
    chemin = page;
  }
  return !cheminsNoindex.includes(chemin);
}
