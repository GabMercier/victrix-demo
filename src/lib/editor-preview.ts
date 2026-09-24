/**
 * `EDITOR_PREVIEW` — la politique d'APERÇU D'ÉDITION, lue UNE fois ici (lot
 * L16, 2026-09-24). Avant L16, c'était `STATIC_ONLY` qui la portait, en plus
 * de son vrai rôle (build sans adaptateur) — et le site de PRODUCTION
 * CloudCannon, construit lui aussi en STATIC_ONLY=1, publiait les brouillons.
 *
 * Ce que le drapeau commande (chaque consommateur documente le sien) :
 *  - src/i18n/blog.ts     : brouillons et articles à date future construits ;
 *  - src/lib/announce.ts  : fenêtres de diffusion des bannières ignorées ;
 *  - astro.config.mjs     : Bookshop attaché (avec STATIC_ONLY), redirections
 *                           des articles retirés NON émises — via
 *                           scripts/lib/build-mode.mjs (process.env).
 *
 * Posé UNIQUEMENT sur les sites d'ÉDITION CloudCannon (dev, staging), jamais
 * sur la production — tableau des variables : docs/operations.md § 6.
 *
 * GOTCHA (hérité de blog.ts) : Astro ne substitue les variables non PUBLIC_
 * que pour l'expression membre EXACTE `import.meta.env.NOM` dans le code
 * serveur — jamais via destructuration ni objet env passé en paramètre. D'où
 * cette constante de module, et pas une fonction qui lirait l'env. Sous
 * vitest la variable est absente : `false` (comportement production), les
 * tests injectent le drapeau en paramètre.
 */
export const EDITOR_PREVIEW_BUILD = Boolean(import.meta.env.EDITOR_PREVIEW);
