/**
 * Plugin rehype — espaces insécables devant les signes doubles dans le CORPS
 * des contenus Markdown (articles du centre de ressources, campagnes).
 *
 * POURQUOI ICI, et pas dans le renderer partagé. Les sections passent toutes
 * par `component-library/src/shared/astro/page.astro`, qui applique déjà la
 * règle (`typographieFr`). Les ARTICLES, eux, sont du Markdown rendu par
 * `<Content />` : aucune chaîne à transformer au passage. Un plugin rehype
 * agit à l'endroit exact où il faut — sur l'arbre du document, une fois le
 * Markdown converti.
 *
 * SÛRETÉ : on ne visite que les nœuds de TEXTE. Les attributs (donc les URL,
 * `href`, `src`) ne sont jamais touchés, et `<code>`/`<pre>` sont sautés — on
 * ne réécrit pas du code affiché. Sans effet sur l'anglais, qui colle ses
 * deux-points au mot : mesuré, 0 occurrence dans le contenu anglais soigné.
 *
 * Branché dans astro.config.mjs (`markdown.rehypePlugins`).
 */

/** Les signes qui demandent une espace AVANT eux en français. */
const AVANT = / ([:;!?»])/g;
/** `«` demande une espace APRÈS lui. */
const APRES = /(«) /g;

/** Éléments dont le texte ne doit pas être retouché. */
const SAUTES = new Set(['code', 'pre', 'kbd', 'samp', 'script', 'style']);

export function insecablesTexte(texte) {
  return texte.replace(AVANT, ' $1').replace(APRES, '$1 ');
}

export default function rehypeInsecables() {
  return (arbre) => {
    const visite = (noeud) => {
      if (!noeud || typeof noeud !== 'object') return;
      if (noeud.type === 'element' && SAUTES.has(noeud.tagName)) return;
      if (Array.isArray(noeud.children)) {
        for (const enfant of noeud.children) {
          if (enfant.type === 'text' && typeof enfant.value === 'string') {
            enfant.value = insecablesTexte(enfant.value);
          } else {
            visite(enfant);
          }
        }
      }
    };
    visite(arbre);
  };
}
