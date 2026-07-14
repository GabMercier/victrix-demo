/**
 * Ambient module declaration for @bookshop/astro-bookshop.
 *
 * The package ships no TypeScript types (plain main.js), so `astro check`
 * fails astro.config.mjs (which is `// @ts-check`ed) with ts(7016) on the
 * dynamic `import('@bookshop/astro-bookshop')`. There is no published
 * @types/bookshop__astro-bookshop either. Declaring the module here types the
 * default export as an Astro-integration factory, which is exactly how
 * astro.config.mjs consumes it (`bookshop()` inside `integrations: []`).
 */
declare module '@bookshop/astro-bookshop' {
  import type { AstroIntegration } from 'astro';
  const bookshop: (options?: Record<string, unknown>) => AstroIntegration;
  export default bookshop;
}
