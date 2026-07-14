// @ts-check
import { promises as fs } from 'node:fs';
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import cloudflare from '@astrojs/cloudflare';

// Attach the Cloudflare adapter ONLY for the production build. Its dev-server
// hook loads wrangler/undici, which needs the global `File` (Node 20+); this
// project runs on Node 18, so `astro dev` would crash with "File is not defined".
// `astro dev` renders the on-demand portal routes natively without an adapter,
// and `astro build` (the deploy path) still gets the adapter + Pages worker.
const isBuild = process.argv.includes('build');

// STATIC_ONLY mode — a fully-static build for CloudCannon's editing environment.
// CloudCannon builds the site to drive its visual editor and has no Cloudflare
// Pages runtime, so in this mode (a) the Cloudflare adapter stays OFF even
// during `astro build`, and (b) the handful of on-demand routes (portal + auth)
// are force-prerendered so the build can succeed with no adapter at all.
// Cloudflare Pages production builds are UNCHANGED — STATIC_ONLY is unset
// there, the adapter still attaches, and the portal still runs on demand.
// Enable with `STATIC_ONLY=1 astro build` (any non-empty value).
//
// What force-prerendering does to those routes in the STATIC_ONLY output (the
// verification agent proves this empirically; expectations from Astro's source):
//   - /fr/portail + /en/portail: no cookies exist at build time, so the session
//     check finds nothing and the plain login screen is baked. Fine for editing.
//   - the dashboard: the no-session redirect gets baked as a
//     <meta http-equiv="refresh"> page pointing at the login — for EVERY
//     visitor of that build. Never ship a STATIC_ONLY build to production.
//   - /auth/login + /auth/callback: prerendered endpoints keep only the
//     response BODY (status codes and Set-Cookie headers are dropped), so the
//     mock sign-in flow does not function in a STATIC_ONLY build.
//   - /auth/logout exports only POST; Astro logs a "No API Route handler
//     exists for the method \"GET\"" warning and emits no file. Expected.
//   - the sitemap gains the portal pages in this mode (they became
//     prerendered) — harmless, the editing build is never served to crawlers.
const staticOnly = Boolean(process.env.STATIC_ONLY);

/**
 * STATIC_ONLY inline integration. Two jobs:
 *
 * 1. `astro:route:setup` — the documented hook for flipping a route's
 *    prerender flag (an explicit `export const prerender = false` in the file
 *    arrives as the default and may be overridden here; runs before bundling).
 *    We flip EVERY route so a future on-demand route can't silently break the
 *    CloudCannon build either.
 *
 * 2. Prerendering a *dynamic* route requires `getStaticPaths()` — Astro
 *    hard-errors with GetStaticPathsRequired otherwise (see
 *    node_modules/astro/dist/core/routing/validation.js) — but the two portal
 *    pages (src/pages/[lang]/portail/*.astro) are on-demand by design and have
 *    none, and those files belong to the auth workstream (frozen — must not be
 *    edited). So we shim it in from outside: Astro's compiler plugin is
 *    `enforce: 'pre'`, meaning a plain Vite plugin's `transform` receives the
 *    COMPILED JS of .astro modules and can safely append one extra export.
 */
function staticOnlyMode() {
  return {
    name: 'victrix:static-only',
    hooks: {
      /** @param {{ route: { component: string, prerender?: boolean } }} options */
      'astro:route:setup': ({ route }) => {
        route.prerender = true;
      },
      /** @param {{ updateConfig: (config: object) => void }} options */
      'astro:config:setup': ({ updateConfig }) => {
        updateConfig({
          vite: {
            plugins: [
              {
                name: 'victrix:static-only-getstaticpaths',
                /**
                 * @param {string} code
                 * @param {string} id
                 */
                transform(code, id) {
                  // Vite ids use forward slashes on every OS; the `$` anchor
                  // skips the compiler's ?astro&type=style/script subrequests.
                  if (!/\/src\/pages\/\[lang\]\/portail\/[^/?#]+\.astro$/.test(id)) return;
                  // Safety: never double-export if a real one appears someday.
                  if (code.includes('getStaticPaths')) return;
                  return {
                    code:
                      code +
                      "\nexport function getStaticPaths() { return [{ params: { lang: 'fr' } }, { params: { lang: 'en' } }]; }\n",
                    map: null,
                  };
                },
              },
            ],
          },
        });
      },
    },
  };
}

// Bookshop registers the component library (component-library/**) with Astro so
// CloudCannon's visual editor can live-render sections. STATIC_ONLY builds ONLY:
// Bookshop's Vite plugin (@bookshop/vite-plugin-astro-bookshop) re-parses and
// REWRITES the compiled JS of every .astro module (prop introspection, injected
// data-binding paths) — including the on-demand portal routes that ship as the
// Cloudflare Pages Function. The production build and `astro dev` must stay
// byte-identical to the pre-Bookshop pipeline, so the integration is gated to
// the CloudCannon editing build (which always runs with STATIC_ONLY=1 — live
// editing keeps working). Loaded dynamically and guarded: a static import would
// crash with ERR_MODULE_NOT_FOUND before `npm install` has brought the package
// in. Package name comes verbatim from CloudCannon's Astro guide.
let bookshop;
if (staticOnly) {
  try {
    bookshop = (await import('@bookshop/astro-bookshop')).default;
  } catch {
    // Not installed (yet) — the editing build proceeds without live components;
    // the site itself renders identically either way.
  }
}

/**
 * Editor-managed redirects → Cloudflare Pages `_redirects` file.
 *
 * src/data/redirects.json is the editable source of truth (CloudCannon exposes
 * it with French labels): an array of { de, vers, code } entries — `de` a path
 * starting with "/", `vers` a path or absolute https URL, `code` 301
 * (permanent) or 302 (temporary). This integration reads that file in
 * `astro:build:done` and writes the entries into dist/_redirects in the
 * Cloudflare Pages format ("/source /destination 301").
 *
 * Guardrails — this replaces WordPress's Redirection plugin, which silently
 * accepts loops and duplicates; here bad data FAILS the build with a French
 * message naming the offending entry: `de` must start with "/", `vers` must be
 * non-empty, no self-redirect (de === vers), no duplicate `de`, `code` must be
 * 301|302, and neither field may contain whitespace (a space would corrupt the
 * space-separated `_redirects` line format).
 *
 * Runs in BOTH build modes. `_redirects` is Cloudflare-specific and inert in
 * the STATIC_ONLY (CloudCannon) output, but generating it there too keeps the
 * two builds consistent and — more useful — surfaces invalid entries to
 * editors immediately: a bad save fails the CloudCannon build instead of
 * shipping a broken redirect to production.
 *
 * APPEND semantics: Astro unshifts the adapter to the FRONT of the
 * integrations list (node_modules/astro/dist/integrations/hooks.js), so the
 * Cloudflare adapter's own `astro:build:done` runs before this one and has
 * already appended the astro.config `redirects` map (the pre-i18n URLs above)
 * into dist/_redirects. We only ever append after it — never overwrite. In
 * STATIC_ONLY builds (no adapter) the file doesn't exist yet and gets created.
 * Our entries miss the adapter's _routes.json exclusion pass (it ran first),
 * which is fine: they don't match the worker's include list, so Cloudflare
 * serves them from static-asset routing where `_redirects` applies.
 */
function redirectsFile() {
  return {
    name: 'victrix:redirects',
    hooks: {
      /** @param {{ dir: URL, logger: import('astro').AstroIntegrationLogger }} options */
      'astro:build:done': async ({ dir, logger }) => {
        // Every validation failure throws — an error in astro:build:done
        // propagates and fails the whole build, which is the point.
        /** @type {(raison: string) => never} */
        const fail = (raison) => {
          throw new Error(`[victrix:redirects] ${raison}`);
        };

        // Read the JSON FRESH from disk on every build. A JS `import` of the
        // file would go through Node's module cache and could serve stale
        // data if a rebuild ever reuses the process.
        const source = new URL('./src/data/redirects.json', import.meta.url);
        let raw;
        try {
          raw = await fs.readFile(source, 'utf-8');
        } catch {
          fail(
            'src/data/redirects.json est introuvable ou illisible. Le fichier doit exister (au minimum un tableau vide : []).'
          );
        }
        let entries;
        try {
          entries = JSON.parse(raw);
        } catch {
          fail('src/data/redirects.json ne contient pas du JSON valide.');
        }
        if (!Array.isArray(entries)) {
          fail('src/data/redirects.json doit contenir un tableau d’entrées { "de", "vers", "code" }.');
        }

        const lines = [];
        const seen = new Set();
        for (const entry of entries) {
          // Every message names the offending entry so an editor can fix it.
          const badEntry = ` Entrée fautive : ${JSON.stringify(entry)}`;
          if (typeof entry !== 'object' || entry === null || Array.isArray(entry)) {
            fail(`chaque entrée doit être un objet { "de", "vers", "code" }.${badEntry}`);
          }
          const { de, vers, code } = entry;
          if (typeof de !== 'string' || !de.startsWith('/')) {
            fail(`« de » doit être un chemin commençant par « / ».${badEntry}`);
          }
          if (typeof vers !== 'string' || vers.length === 0) {
            fail(`« vers » ne doit pas être vide (chemin ou URL https).${badEntry}`);
          }
          // `code`: JSON numbers 301|302 are the contract, but CloudCannon's
          // Data-Editor select (cloudcannon.config.yml, collection
          // « redirections ») may round-trip its numeric options as STRINGS
          // ("301") — its docs only show string values, and the behaviour is
          // unverified in-editor. A valid pick from the dropdown must NEVER
          // fail the build, so the exact strings "301"/"302" are accepted and
          // normalized back to numbers. Anything else (303, "301 ", true,
          // null…) still fails loudly — that's the guardrail working.
          /** @type {301 | 302 | null} */
          let codeNumber = null;
          if (code === 301 || code === '301') codeNumber = 301;
          else if (code === 302 || code === '302') codeNumber = 302;
          if (codeNumber === null) {
            fail(`« code » doit être 301 (permanent) ou 302 (temporaire).${badEntry}`);
          }
          if (/\s/.test(de) || /\s/.test(vers)) {
            fail(`« de » et « vers » ne doivent pas contenir d’espaces.${badEntry}`);
          }
          if (de === vers) {
            fail(`redirection vers elle-même (boucle infinie).${badEntry}`);
          }
          if (seen.has(de)) {
            fail(`« de » en double — chaque chemin source ne peut être redirigé qu’une seule fois.${badEntry}`);
          }
          seen.add(de);
          lines.push(`${de} ${vers} ${codeNumber}`);
        }

        // Empty list: nothing to write — leave whatever the adapter produced
        // (or didn't) untouched.
        if (lines.length === 0) return;

        // `dir` is the client output root — dist/ in BOTH modes here: with the
        // adapter attached, buildOutput is "server" and dir = build.client,
        // which the Cloudflare adapter points back at outDir (no `base`
        // subpath); without the adapter (STATIC_ONLY) dir = outDir directly.
        // That root is exactly where Cloudflare Pages looks for `_redirects`.
        const target = new URL('./_redirects', dir);
        let existing = '';
        try {
          existing = await fs.readFile(target, 'utf-8');
        } catch {
          // No file yet (STATIC_ONLY build, or nothing appended by the
          // adapter) — created below.
        }
        const block = `${lines.join('\n')}\n`;
        const content =
          existing.length === 0
            ? block
            : `${existing}${existing.endsWith('\n') ? '' : '\n'}${block}`;
        await fs.writeFile(target, content, 'utf-8');
        logger.info(`${lines.length} redirection(s) de src/data/redirects.json écrites dans _redirects`);
      },
    },
  };
}

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
  // at build time so the worker never needs sharp at runtime. STATIC_ONLY builds
  // (CloudCannon editing — see above) run adapter-less: everything prerenders.
  adapter: isBuild && !staticOnly ? cloudflare({ imageService: 'compile' }) : undefined,

  // Prefetch links on hover (default strategy) — near-instant navigation.
  // Pairs with <ClientRouter /> in BaseLayout for SPA-like page transitions.
  prefetch: true,

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
  // Developer-owned redirects only — editor-managed ones live in
  // src/data/redirects.json (see the 'victrix:redirects' integration above).
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
    // CloudCannon editing build only — see the STATIC_ONLY block above.
    ...(staticOnly ? [staticOnlyMode()] : []),
    // Bookshop component library — STATIC_ONLY (CloudCannon) builds only, and
    // only once the package is installed. Never in the production build (see
    // the gate above the dynamic import).
    ...(staticOnly && bookshop ? [bookshop()] : []),
    sitemap({
      i18n: {
        defaultLocale: 'fr',
        locales: { fr: 'fr-CA', en: 'en-CA' },
      },
      // Campaign landing pages (/{fr,en}/campagnes/…) are noindex by default —
      // listing them in the sitemap would contradict that and invite crawlers
      // to URLs that exist only for paid/targeted traffic. Same reasoning for
      // the /{fr,en}/merci/ thank-you pages (noindex via BaseLayout): they
      // only make sense right after a form submission. `page` is the FULL
      // URL (site domain included), so a substring check is enough.
      filter: (page) => !page.includes('/campagnes/') && !page.includes('/merci/'),
    }),
    // Editor-managed redirects (src/data/redirects.json) → dist/_redirects.
    // Deliberately UNCONDITIONAL — both the production build and the
    // STATIC_ONLY (CloudCannon) build run it; see the function's doc block.
    redirectsFile(),
  ],

  // Image handling. Astro's built-in Sharp service optimizes images imported
  // from `src/assets/` via the `astro:assets` API (<Image /> / <Picture />).
  // Listed explicitly for clarity; this is the default service.
  image: {
    service: { entrypoint: 'astro/assets/services/sharp' },
  },
});
