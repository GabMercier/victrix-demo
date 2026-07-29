// @ts-check
import { promises as fs } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import cloudflare from '@astrojs/cloudflare';
import tailwindcss from '@tailwindcss/vite';

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
 * _routes.json: Cloudflare documents that `_redirects` rules are NOT applied
 * to requests served by the Pages Function — and the worker's include list is
 * "/*", so every redirect source WOULD hit the worker unless excluded. The
 * adapter already excludes its own redirect sources (see /contact,
 * /en/customer-portal in dist/_routes.json); we do the same for the CMS
 * entries after appending to `_redirects`. Verified live (2026-07-14): without
 * the exclusion, /demo-redirection was served as a 200 rewrite of /fr/ instead
 * of a 301. STATIC_ONLY builds have no _routes.json — the pass is skipped.
 *
 * Destinations are normalized to the adapter's slash-less convention
 * ("/fr", not "/fr/") — avoids a second normalization hop on pages.dev and
 * keeps the file consistent. External https:// destinations pass through.
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
          // Normalize internal destinations to the adapter's slash-less form
          // ("/fr/" -> "/fr"); root "/" and external URLs are left as-is.
          const versNormalise =
            vers.startsWith('/') && vers.length > 1 && vers.endsWith('/')
              ? vers.replace(/\/+$/, '')
              : vers;
          lines.push(`${de} ${versNormalise} ${codeNumber}`);
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

        // _routes.json exclusion pass (normal Cloudflare build only — the file
        // does not exist in STATIC_ONLY builds). Without it the worker (include
        // "/*") swallows the request before `_redirects` is honoured — see the
        // header comment. Cloudflare caps include+exclude at 100 combined
        // rules; entries beyond the cap are dropped WITH A WARNING rather than
        // failing the build (the redirect data itself is valid — consolidate
        // into wildcard patterns if the site ever accumulates ~60+ redirects).
        const routesTarget = new URL('./_routes.json', dir);
        let routesRaw = null;
        try {
          routesRaw = await fs.readFile(routesTarget, 'utf-8');
        } catch {
          return; // STATIC_ONLY (or adapter-less) build — nothing to exclude.
        }
        /** @type {{ version: number, include: string[], exclude: string[] }} */
        let routes;
        try {
          routes = JSON.parse(routesRaw);
        } catch {
          fail('dist/_routes.json existe mais ne contient pas du JSON valide (adaptateur Cloudflare).');
        }
        const exclude = Array.isArray(routes.exclude) ? routes.exclude : [];
        const budget = 100 - (Array.isArray(routes.include) ? routes.include.length : 0) - exclude.length;
        const manquants = [...seen].filter((de) => !exclude.includes(de));
        const ajoutes = manquants.slice(0, Math.max(0, budget));
        if (ajoutes.length < manquants.length) {
          logger.warn(
            `[victrix:redirects] limite Cloudflare de 100 règles _routes.json atteinte — ${manquants.length - ajoutes.length} source(s) de redirection non exclue(s) du worker : ${manquants.slice(ajoutes.length).join(', ')}`
          );
        }
        if (ajoutes.length > 0) {
          routes.exclude = [...exclude, ...ajoutes];
          await fs.writeFile(routesTarget, JSON.stringify(routes, null, 2), 'utf-8');
          logger.info(`${ajoutes.length} source(s) de redirection exclue(s) du worker dans _routes.json`);
        }
      },
    },
  };
}

/**
 * Rapport d'appariement FR/EN — AVERTISSEMENT seulement, jamais bloquant.
 *
 * La règle du contenu bilingue : même nom de fichier dans fr/ et en/ = paire
 * de traduction (blogue et campagnes en .md, services en .json — flux
 * « Dupliquer » documenté dans docs/guide-edition.md, section « Traduire »).
 * Chaque collection déclare donc son extension. Cette intégration liste au
 * build les entrées sans contrepartie, pour que l'oubli de traduction se voie
 * dans le journal de build (CloudCannon comme préversions) au lieu d'être
 * découvert par un visiteur via le sélecteur de langue. Tourne dans les deux
 * modes de build.
 */
function i18nPairingReport() {
  return {
    name: 'victrix:i18n-pairing',
    hooks: {
      /** @param {{ logger: import('astro').AstroIntegrationLogger }} options */
      'astro:build:done': async ({ logger }) => {
        for (const { root, ext } of [
          { root: './src/content/blog', ext: '.md' },
          { root: './src/content/landing', ext: '.md' },
          // Services (P-07) : même contrat d'appariement fr/en homonymes, mais
          // fichiers .json (pas .md) — l'extension est portée par collection.
          { root: './src/content/services', ext: '.json' },
        ]) {
          /** @type {Record<string, string[]>} */
          const fichiers = {};
          for (const locale of ['fr', 'en']) {
            try {
              fichiers[locale] = (
                await fs.readdir(new URL(`${root}/${locale}/`, import.meta.url))
              ).filter((f) => f.endsWith(ext));
            } catch {
              fichiers[locale] = []; // dossier absent = rien à apparier
            }
          }
          const collection = root.split('/').pop();
          for (const [langue, cible] of [
            ['fr', 'en'],
            ['en', 'fr'],
          ]) {
            const orphelins = fichiers[langue].filter((f) => !fichiers[cible].includes(f));
            if (orphelins.length > 0) {
              logger.warn(
                `[victrix:i18n-pairing] ${collection} : ${orphelins.length} entrée(s) ${langue}/ sans traduction ${cible}/ — ${orphelins.join(', ')}`
              );
            }
          }
        }
      },
    },
  };
}

/**
 * Recherche interne (P-06) — index Pagefind généré APRÈS le build, dans les
 * DEUX modes (production Cloudflare ET STATIC_ONLY/CloudCannon : l'hébergement
 * cible est CloudCannon, la préversion est Cloudflare — les deux doivent
 * servir /pagefind/*).
 *
 * Périmètre d'indexation — piloté par le HTML, pas par cette intégration :
 *  - BaseLayout pose `data-pagefind-body` sur <main> des pages indexables
 *    (noindex = pas d'attribut). Dès qu'une page du site porte cet attribut,
 *    Pagefind EXCLUT ENTIÈREMENT toute page qui ne le porte pas — donc
 *    campagnes/merci/recherche/404/portail (noindex) sortent de l'index, et
 *    seul le contenu utile de <main> est indexé (jamais header/footer/menus).
 *  - Pagefind ignore aussi nativement toute page portant
 *    <meta name="robots" content="noindex"> (ceinture + bretelles).
 *  - Les langues sont partitionnées automatiquement par l'attribut
 *    <html lang> : les pages FR ne remontent que des résultats FR, idem EN.
 *
 * Garde-fou : un index construit sur 0 page = recherche silencieusement morte
 * → échec du build avec un message en français (philosophie du dépôt).
 *
 * Import dynamique guardé comme Bookshop : le paquet est une devDependency;
 * s'il manque, on échoue AVEC un message clair plutôt qu'un module introuvable.
 */
function pagefindIndex() {
  return {
    name: 'victrix:pagefind',
    hooks: {
      /** @param {{ dir: URL, logger: import('astro').AstroIntegrationLogger }} options */
      'astro:build:done': async ({ dir, logger }) => {
        /** @type {(raison: string) => never} */
        const fail = (raison) => {
          throw new Error(`[victrix:pagefind] ${raison}`);
        };

        let pagefind;
        try {
          pagefind = await import('pagefind');
        } catch {
          fail(
            'le paquet « pagefind » est introuvable — exécuter npm install (la recherche interne ne peut pas être construite sans lui).'
          );
        }

        // `dir` = racine de sortie client (dist/ dans les deux modes — même
        // convention que victrix:redirects ci-dessous).
        const outDir = fileURLToPath(dir);
        const { index, errors: createErrors } = await pagefind.createIndex({});
        if (!index) {
          fail(`création de l'index impossible : ${(createErrors ?? []).join(' | ')}`);
        }
        const { page_count: pageCount, errors: addErrors } = await index.addDirectory({
          path: outDir,
        });
        if (addErrors?.length) {
          fail(`indexation de ${outDir} en erreur : ${addErrors.join(' | ')}`);
        }
        if (!pageCount || pageCount === 0) {
          fail(
            '0 page indexée — data-pagefind-body absent du build ? La recherche serait vide; corriger avant de livrer.'
          );
        }
        const { errors: writeErrors } = await index.writeFiles({
          outputPath: `${outDir}/pagefind`,
        });
        if (writeErrors?.length) {
          fail(`écriture de l'index en erreur : ${writeErrors.join(' | ')}`);
        }
        await pagefind.close();
        logger.info(`index de recherche Pagefind : ${pageCount} pages indexées → /pagefind/`);

        // Build Cloudflare seulement : servir /pagefind/* en statique pur, sans
        // passer par le worker (même mécanique et même budget de 100 règles que
        // victrix:redirects — un seul motif ici, coût minime).
        const routesTarget = new URL('./_routes.json', dir);
        let routesRaw = null;
        try {
          routesRaw = await fs.readFile(routesTarget, 'utf-8');
        } catch {
          return; // STATIC_ONLY (sans adaptateur) — rien à exclure.
        }
        try {
          /** @type {{ version: number, include: string[], exclude: string[] }} */
          const routes = JSON.parse(routesRaw);
          const exclude = Array.isArray(routes.exclude) ? routes.exclude : [];
          if (!exclude.includes('/pagefind/*')) {
            routes.exclude = [...exclude, '/pagefind/*'];
            await fs.writeFile(routesTarget, JSON.stringify(routes, null, 2), 'utf-8');
            logger.info('/pagefind/* exclu du worker dans _routes.json');
          }
        } catch {
          fail('dist/_routes.json existe mais ne contient pas du JSON valide (adaptateur Cloudflare).');
        }
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
      // only make sense right after a form submission, and for the internal
      // search page /{fr,en}/recherche/ (noindex — best practice: never let
      // engines index internal search results). `page` is the FULL URL (site
      // domain included), so a substring check is enough.
      filter: (page) =>
        !page.includes('/campagnes/') && !page.includes('/merci/') && !page.includes('/recherche/'),
    }),
    // Editor-managed redirects (src/data/redirects.json) → dist/_redirects.
    // Deliberately UNCONDITIONAL — both the production build and the
    // STATIC_ONLY (CloudCannon) build run it; see the function's doc block.
    redirectsFile(),
    // Index de recherche interne (P-06) — les deux modes de build; voir le
    // bloc de doc de la fonction.
    pagefindIndex(),
    i18nPairingReport(),
  ],

  // Image handling. Astro's built-in Sharp service optimizes images imported
  // from `src/assets/` via the `astro:assets` API (<Image /> / <Picture />).
  // Listed explicitly for clarity; this is the default service.
  image: {
    service: { entrypoint: 'astro/assets/services/sharp' },
  },

  // Tailwind v4 (Phase 1 convergence — pilote « Luminous Precision »). Pas de
  // tailwind.config : la config vit en CSS (@theme dans src/styles/theme.css,
  // importé par BaseLayout). La détection des classes balaie tout le projet
  // (component-library/ inclus — pas dans .gitignore). Le CSS généré est du
  // CSS de build ordinaire : chargé tel quel par l'éditeur CloudCannon.
  vite: {
    plugins: [tailwindcss()],
  },
});
