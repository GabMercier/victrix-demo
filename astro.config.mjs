// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import cloudflare from '@astrojs/cloudflare';

// Attach the Cloudflare adapter ONLY for the production build. Its dev-server
// hook loads wrangler/undici, which needs the global `File` (Node 20+); this
// project runs on Node 18, so `astro dev` would crash with "File is not defined".
// `astro dev` renders the on-demand portal routes natively without an adapter,
// and `astro build` (the deploy path) still gets the adapter + Pages worker.
const isBuild = process.argv.includes('build');

// https://astro.build/config
export default defineConfig({
  // Served at the root on Cloudflare Pages — no `base` subpath.
  // IMPORTANT: set this to the real deployment URL after the first deploy —
  // it drives canonical URLs, the sitemap, and Open Graph image/URLs.
  site: 'https://victrix-demo.pages.dev',

  // The marketing site stays fully prerendered (static). `output: 'static'` is
  // the default and means EVERY page is prerendered UNLESS it opts out with
  // `export const prerender = false`. Only the client-portal + auth routes do
  // that, so they run on demand as a Cloudflare Pages Function while the rest of
  // the site is served as static assets from the edge — unchanged behaviour.
  output: 'static',

  // The Cloudflare adapter lets the few on-demand routes run on Pages. Build-only
  // (see `isBuild` above); `imageService: 'compile'` optimizes images with sharp
  // at build time so the worker never needs sharp at runtime.
  adapter: isBuild ? cloudflare({ imageService: 'compile' }) : undefined,

  // Bilingual site. FR + EN, both prefixed (/fr/…, /en/…). Pages live under
  // src/pages/[lang]/ and opt every locale in via getStaticPaths.
  i18n: {
    locales: ['fr', 'en'],
    defaultLocale: 'fr',
    routing: {
      // Every locale carries a prefix — including the default (/fr/…).
      prefixDefaultLocale: true,
    },
  },

  // Preserve the old (pre-i18n) root URLs by sending them to their /fr/ home.
  // `/` → `/fr`. The portal keeps its own localized entry points untouched.
  redirects: {
    '/': '/fr',
    '/contact': '/fr/contact',
    '/ressources': '/fr/ressources',
    '/expertises/intelligence-artificielle': '/fr/expertises/intelligence-artificielle',
    // Preserve the three pre-i18n article URLs (explicit, not a dynamic pattern —
    // a dynamic `[slug]` redirect has no source route and breaks the build).
    '/ressources/ia-au-service-de-la-productivite': '/fr/ressources/ia-au-service-de-la-productivite',
    '/ressources/cinq-pratiques-cybersecurite-pme': '/fr/ressources/cinq-pratiques-cybersecurite-pme',
    '/ressources/reussir-sa-migration-infonuagique': '/fr/ressources/reussir-sa-migration-infonuagique',
    // Portal moved under the locale prefix.
    '/mon-portail': '/fr/portail',
    '/en/customer-portal': '/en/portail',
  },

  integrations: [
    sitemap({
      i18n: {
        defaultLocale: 'fr',
        locales: { fr: 'fr-CA', en: 'en-CA' },
      },
    }),
  ],

  // Image handling. Astro's built-in Sharp service optimizes images imported
  // from `src/assets/` via the `astro:assets` API (<Image /> / <Picture />).
  // Listed explicitly for clarity; this is the default service.
  image: {
    service: { entrypoint: 'astro/assets/services/sharp' },
  },
});
