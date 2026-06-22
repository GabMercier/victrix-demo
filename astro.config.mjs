// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
  // Served at the root on Cloudflare Pages — no `base` subpath.
  // IMPORTANT: set this to the real deployment URL after the first deploy —
  // it drives canonical URLs, the sitemap, and Open Graph image/URLs.
  site: 'https://demo-victrix.pages.dev',

  // Fully static prototype.
  output: 'static',

  integrations: [sitemap()],

  // Image handling. Astro's built-in Sharp service optimizes images imported
  // from `src/assets/` via the `astro:assets` API (<Image /> / <Picture />).
  // Listed explicitly for clarity; this is the default service.
  image: {
    service: { entrypoint: 'astro/assets/services/sharp' },
  },
});
