// @ts-check
import { defineConfig } from 'astro/config';

// https://astro.build/config
export default defineConfig({
  // Served at the root on Cloudflare Pages — no `base` subpath.
  // Update `site` to the real deployment URL when known (used for canonical
  // URLs, sitemaps, etc.).
  site: 'https://demo-victrix.pages.dev',

  // Fully static prototype.
  output: 'static',

  // Image handling. Astro's built-in Sharp service optimizes images imported
  // from `src/assets/` via the `astro:assets` API (<Image /> / <Picture />).
  // Listed explicitly for clarity; this is the default service.
  image: {
    service: { entrypoint: 'astro/assets/services/sharp' },
  },
});
