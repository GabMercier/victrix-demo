/**
 * Les FORMES d'un chemin source dans `.cloudcannon/routing.json` — logique
 * PURE, extraite d'astro.config.mjs le 2026-09-22 pour être testée
 * (src/lib/routing-formes.test.ts), comme scripts/lib/sitemap-filter.mjs.
 *
 * POURQUOI cette extraction, et le chiffre qui l'a déclenchée. Sondage au
 * `curl` du site CloudCannon déployé le 2026-09-22 : **105 des 184 anciennes
 * URL rendaient un 404**. Les règles existaient toutes et leurs cibles
 * existaient toutes ; elles ne se déclenchaient simplement jamais.
 *
 * La cause est une seule décision de conception. `build-redirects.mjs`
 * applique `sansBarre()` au champ « de » (lignes 88 et 229), et cette passe
 * faisait de même pour les destinations — si bien que les 189 `from` partaient
 * SANS barre oblique finale. Or l'hébergement CloudCannon compare le chemin
 * EXACT, barre comprise, et canonise VERS la barre (mesuré :
 * `/Decouvrir-Victrix` rend un 307 vers `/Decouvrir-Victrix/`). L'ancien site
 * canonisait aussi vers la barre (`/contact` → 301 `/contact/`) : **100 % des
 * URL indexées en portent une**. Donc :
 *
 *     /decouvrir-victrix   → 301 (la règle marchait)
 *     /decouvrir-victrix/  → 404 (la forme que Google avait indexée)
 *
 * Aucun garde-fou ne pouvait le voir : `check:redirects --dist` valide que la
 * CIBLE existe, jamais que la règle se DÉCLENCHE ; `check:links --strict` ne
 * regarde que les liens INTERNES, pas les liens entrants.
 *
 * Le correctif retenu — émettre les DEUX formes de chaque chemin source —
 * plutôt qu'un motif tolérant `(/?)$` : un groupe de capture supplémentaire
 * décalerait la numérotation de `$1` dans les jokers, et le dépôt lui-même
 * hésite entre « motif glob » (le commentaire de routing.json) et l'exemple
 * officiel en `(.*)`. Deux formes explicites ne dépendent d'aucune sémantique
 * non documentée.
 *
 * `_redirects` (Cloudflare Pages, infra héritée) n'a PAS besoin de ce
 * dédoublement — Cloudflare normalise la barre lui-même, et doubler ses lignes
 * rapprocherait le plafond de 100 règles de `_routes.json`. Le dédoublement est
 * donc appliqué au seul `routing.json`.
 */

/**
 * Traduit la syntaxe de joker Cloudflare vers celle de CloudCannon.
 * `/expertise/*` + `/fr/services/:splat` → `/expertise/(.*)` + `/fr/services/$1`.
 *
 * @param {string} de
 * @param {string} vers
 * @returns {{ from: string, to: string }}
 */
export function versMotifCloudCannon(de, vers) {
  if (!de.includes('*')) return { from: de, to: vers };
  return {
    from: de.replace(/\*/g, '(.*)'),
    to: vers.replace(/:splat/g, '$1'),
  };
}

/**
 * Les DEUX formes d'une même règle : chemin source sans barre oblique finale,
 * puis avec. L'ordre est stable (sans d'abord) pour que le fichier se relise
 * facilement ; les deux étant des chemins distincts, la règle « première
 * correspondance » de CloudCannon n'est pas affectée.
 *
 * Trois cas gardent UNE seule forme :
 *   - un joker `(.*)` : sa capture avale déjà la barre finale, et dédoubler
 *     produirait `/expertise/(.*)/` qui ne correspond plus à rien d'utile ;
 *   - la racine `/` : elle n'a pas de variante ;
 *   - un `from` qui n'est pas un chemin (garde-fou, ne devrait pas arriver).
 *
 * @template {{ from: string }} T
 * @param {T} route
 * @returns {T[]}
 */
export function lesDeuxFormes(route) {
  const { from } = route;
  if (typeof from !== 'string' || !from.startsWith('/')) return [route];
  if (from.includes('(.*)')) return [route];
  const sans = from.length > 1 ? from.replace(/\/+$/, '') : from;
  if (sans === '' || sans === '/') return [{ ...route, from: '/' }];
  return [
    { ...route, from: sans },
    { ...route, from: `${sans}/` },
  ];
}
