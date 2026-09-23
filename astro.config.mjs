// @ts-check
import { promises as fs } from 'node:fs';
import { readdirSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { auditPages } from './scripts/lib/h1-guard.mjs';
import { entreAuSitemap } from './scripts/lib/sitemap-filter.mjs';
import rehypeInsecables from './scripts/lib/rehype-insecables.mjs';
import { lesDeuxFormes, versMotifCloudCannon } from './scripts/lib/routing-formes.mjs';
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
// during `astro build`, and (b) toute route à la demande est force-prérendue
// pour que le build passe sans adaptateur. Cloudflare Pages production builds
// are UNCHANGED — STATIC_ONLY is unset there and the adapter still attaches.
// Enable with `STATIC_ONLY=1 astro build` (any non-empty value).
//
// Seule route à la demande restante : /api/forms (le portail mock et /auth/*
// ont été RETIRÉS le 2026-08-18). Force-prérendu, un endpoint ne garde que le
// CORPS de la réponse (statuts et en-têtes perdus) — d'où la consigne de ne
// JAMAIS poser PUBLIC_FORMS_ENABLED dans l'environnement de build CloudCannon
// (docs/formulaires.md).
const staticOnly = Boolean(process.env.STATIC_ONLY);

/**
 * STATIC_ONLY inline integration — `astro:route:setup` is the documented hook
 * for flipping a route's prerender flag (an explicit `export const prerender
 * = false` in the file arrives as the default and may be overridden here; runs
 * before bundling). We flip EVERY route so a future on-demand route can't
 * silently break the CloudCannon build either. Aujourd'hui la seule route à
 * la demande est /api/forms (le portail mock et ses routes /auth/* ont été
 * RETIRÉS le 2026-08-18 — la page de connexion restante est prérendue) ;
 * l'ancien shim getStaticPaths des pages portail est parti avec.
 */
function staticOnlyMode() {
  return {
    name: 'victrix:static-only',
    hooks: {
      /** @param {{ route: { component: string, prerender?: boolean } }} options */
      'astro:route:setup': ({ route }) => {
        route.prerender = true;
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
 * `.cloudcannon/routing.json` — les redirections et les en-têtes TELS QUE
 * L'HÉBERGEMENT DE PRODUCTION les comprend (2026-09-22, lot L15 / #1503-#1504).
 *
 * CloudCannon héberge les deux sites (édition et production) et **ignore
 * `_redirects` et `_headers`** : ce sont des conventions Netlify/Cloudflare.
 * Il lit `.cloudcannon/routing.json`. Sa documentation prévoit explicitement
 * le cas d'un fichier GÉNÉRÉ au build : il doit alors s'écrire dans
 * `_cloudcannon/routing.json` DANS LA SORTIE du site, et il prime sur le
 * fichier source. C'est ce que fait cette passe — rien à committer, rien à
 * maintenir en double.
 *
 * Schéma officiel (CloudCannon/configuration-types, src/routing.ts) :
 *   routes:  [{ from, to, status, forced?, substitutions? }]  — première règle
 *            qui correspond, comme `_redirects` ; `from` en motif glob, les
 *            segments capturés sont réinjectés dans `to`.
 *   headers: [{ match, headers: [{ name, value }] }]
 *
 * Deux traductions nécessaires, d'où ce code plutôt qu'une copie :
 *
 *  1. SYNTAXE DES JOKERS. La collection « Redirections » stocke la syntaxe
 *     Cloudflare (`/expertise/*` → `/fr/services/:splat`). CloudCannon attend
 *     la forme de son exemple officiel : `/expertise/(.*)` → `/fr/services/$1`.
 *
 *  2. EN-TÊTES NON RECOUVRANTS. `public/_headers` pose un bloc `/*` (sécurité)
 *     PUIS des blocs plus précis (`/fr/*` pour la CSP). Cloudflare fusionne
 *     les blocs qui correspondent ; CloudCannon documente « la première règle
 *     qui correspond » pour les routes et reste muet pour les en-têtes. Une
 *     page de /fr/ risquerait donc de perdre HSTS et nosniff (lecture
 *     « première règle »), ou de recevoir `nosniff, nosniff` (lecture
 *     « fusion », que Chrome rejette). On génère donc des règles SANS
 *     RECOUVREMENT : le bloc `/*` sert de SOCLE, recopié dans chaque règle
 *     précise, et n'est jamais émis seul. `public/_headers` reste la source
 *     unique — on ne duplique pas la politique, on la transforme.
 *
 * Les redirections de `astro.config` (bloc `redirects` ci-dessous) partent
 * AVEC `forced: true` : en sortie statique Astro écrit à ces chemins une page
 * HTML de rafraîchissement méta, donc un fichier EXISTE et une règle non
 * forcée ne se déclencherait pas — le visiteur aurait un 200 puis un saut,
 * au lieu d'un vrai 301.
 *
 * À VÉRIFIER DE L'EXTÉRIEUR après le premier déploiement (la sémantique des
 * en-têtes n'est pas documentée) — `docs/operations.md` § Redirections donne
 * la commande `curl -I`.
 */
const STATUTS_ROUTING = new Set([200, 301, 302, 303, 307, 308, 404, 410]);

/*
 * `versMotifCloudCannon` (syntaxe des jokers) et `lesDeuxFormes` (barre oblique
 * finale) vivent dans scripts/lib/routing-formes.mjs depuis le 2026-09-22 :
 * logique pure, donc testée (src/lib/routing-formes.test.ts). Le module porte
 * la mesure qui a motivé le dédoublement — 105 des 184 anciennes URL rendaient
 * un 404 parce que les `from` partaient sans barre finale.
 */

/**
 * En-têtes que l'hébergement CloudCannon accepte dans `routing.json`
 * (2026-09-22). Sa validation REFUSE le build — pas un avertissement, un échec
 * net : « 'headers[2].headers[5].name' Cache-Control is not a supported header
 * name ». Les blocs `/_astro/*` et `/fonts/*` de `public/_headers` ne portent
 * que du cache, destiné à Cloudflare : ils gardent leur place dans ce fichier,
 * mais leur `Cache-Control` est écarté de routing.json (CloudCannon gère lui
 * -même le cache des fichiers à empreinte).
 *
 * Liste BLANCHE volontairement : un en-tête inconnu est écarté plutôt que
 * d'être envoyé à l'aveugle — mais jamais en silence, `reglesEntetes` le
 * signale au build (voir l'avertissement plus bas). Ajouter un en-tête de
 * sécurité ici après l'avoir vérifié dans la documentation CloudCannon.
 */
const ENTETES_CLOUDCANNON = new Set([
  'content-security-policy',
  'content-security-policy-report-only',
  'strict-transport-security',
  'x-content-type-options',
  'x-frame-options',
  'referrer-policy',
  'permissions-policy',
  'cross-origin-opener-policy',
  'cross-origin-embedder-policy',
  'cross-origin-resource-policy',
]);

/**
 * Lit `public/_headers` (format Cloudflare) et rend des règles CloudCannon
 * sans recouvrement. Voir le commentaire ci-dessus pour le pourquoi.
 * @param {string} texte contenu de public/_headers
 * @param {string[]} cheminsDuSocle chemins qui ne correspondent à aucun bloc précis
 */
function reglesEntetes(texte, cheminsDuSocle) {
  /** @typedef {{ match: string, headers: { name: string, value: string }[] }} BlocEntetes */
  /** @type {BlocEntetes[]} */
  const blocs = [];
  /** @type {BlocEntetes | null} */
  let courant = null;
  for (const ligneBrute of texte.split(/\r?\n/)) {
    const ligne = ligneBrute.replace(/\s+$/, '');
    if (ligne.length === 0 || ligne.trimStart().startsWith('#')) continue;
    if (!/^\s/.test(ligne)) {
      courant = { match: ligne.trim(), headers: [] };
      blocs.push(courant);
      continue;
    }
    const sep = ligne.indexOf(':');
    if (courant && sep > 0) {
      courant.headers.push({
        name: ligne.slice(0, sep).trim(),
        value: ligne.slice(sep + 1).trim(),
      });
    }
  }
  // Filtrage CloudCannon — voir ENTETES_CLOUDCANNON. On le fait AVANT de
  // composer les règles, pour qu'un en-tête écarté ne se retrouve ni dans le
  // socle recopié ni dans un bloc précis.
  const ecartes = new Set();
  for (const bloc of blocs) {
    bloc.headers = bloc.headers.filter((h) => {
      if (ENTETES_CLOUDCANNON.has(h.name.toLowerCase())) return true;
      ecartes.add(h.name);
      return false;
    });
  }
  if (ecartes.size > 0) {
    console.log(
      `[victrix:redirects] en-tête(s) non repris dans routing.json (non supportés par CloudCannon) : ${[...ecartes].join(', ')} — ils restent dans public/_headers pour Cloudflare.`,
    );
  }

  const socle = blocs.find((b) => b.match === '/*');
  const precis = blocs.filter((b) => b.match !== '/*');
  const base = socle ? socle.headers : [];
  const regles = precis.map((b) => ({
    match: b.match,
    // Le socle d'abord, puis les en-têtes propres au bloc (aucun doublon de
    // nom dans public/_headers aujourd'hui ; si ça changeait, le bloc précis
    // doit gagner — d'où l'ordre et le filtre).
    headers: [...base.filter((h) => !b.headers.some((p) => p.name === h.name)), ...b.headers],
  }));
  for (const chemin of cheminsDuSocle) {
    if (base.length > 0) regles.push({ match: chemin, headers: base });
  }
  // Une règle SANS en-tête n'a pas de sens et serait refusée par la validation
  // CloudCannon : elle peut apparaître si un bloc de `public/_headers` ne
  // portait que des en-têtes écartés ci-dessus et que le socle est vide.
  // Les chemins concernés gardent quand même le socle quand il existe, ce qui
  // est l'essentiel : CloudCannon applique la PREMIÈRE règle qui correspond,
  // sans fusionner — sans cette recopie, /_astro/* perdrait toute la sécurité.
  return regles.filter((r) => r.headers.length > 0);
}

/**
 * Editor-managed redirects → Cloudflare Pages `_redirects` file.
 *
 * DEUX sources depuis le 2026-09-22 : src/data/redirects.json (saisie de
 * l'éditrice, prioritaire) et src/data/redirects-migration.json (matrice de la
 * migration WordPress, générée par `npm run build:redirects` — voir
 * scripts/build-redirects.mjs et docs/migration/correspondance-urls.json).
 * Même contrat, même validation ; les règles à joker sont écrites en dernier.
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
  /**
   * Bloc `redirects` d'astro.config, récupéré au moment où Astro a résolu la
   * configuration (plus fiable que de relire le fichier).
   * @type {Record<string, string>}
   */
  let redirectionsAstro = {};
  return {
    name: 'victrix:redirects',
    hooks: {
      /** @param {{ config: import('astro').AstroConfig }} options */
      'astro:config:done': ({ config }) => {
        /** @type {Record<string, string>} */
        const plat = {};
        for (const [de, vers] of Object.entries(config.redirects ?? {})) {
          // Astro normalise en { status, destination } ; on ne garde que les
          // redirections déclarées en chaîne (les nôtres).
          const cible = typeof vers === 'string' ? vers : vers?.destination;
          if (typeof cible === 'string') plat[de] = cible;
        }
        redirectionsAstro = plat;
      },
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
        /** @param {string} chemin @param {boolean} obligatoire */
        const lireListe = async (chemin, obligatoire) => {
          const source = new URL(`./${chemin}`, import.meta.url);
          let raw;
          try {
            raw = await fs.readFile(source, 'utf-8');
          } catch {
            if (!obligatoire) return [];
            fail(
              `${chemin} est introuvable ou illisible. Le fichier doit exister (au minimum un tableau vide : []).`
            );
          }
          let liste;
          try {
            liste = JSON.parse(raw);
          } catch {
            fail(`${chemin} ne contient pas du JSON valide.`);
          }
          if (!Array.isArray(liste)) {
            fail(`${chemin} doit contenir un tableau d’entrées { "de", "vers", "code" }.`);
          }
          return liste;
        };

        // DEUX sources, une seule sortie (2026-09-22) :
        //  - src/data/redirects.json = la collection « Redirections » de
        //    CloudCannon, saisie À LA MAIN par l'éditrice. Elle GAGNE sur
        //    l'autre liste (c'est l'humain qui tranche).
        //  - src/data/redirects-migration.json = la matrice de la migration
        //    WordPress (#1503), GÉNÉRÉE par `npm run build:redirects` depuis
        //    docs/migration/correspondance-urls.json et le contenu. Absente =
        //    pas d'erreur (le dépôt tourne sans).
        const entriesCms = await lireListe('src/data/redirects.json', true);
        const entriesMigration = await lireListe('src/data/redirects-migration.json', false);
        const entries = [...entriesCms, ...entriesMigration];

        /** @type {string[]} */
        const lines = [];
        /**
         * Règles à joker (`*`) — écrites APRÈS les règles exactes.
         * @type {string[]}
         */
        const lignesJoker = [];
        /** @type {{ from: string, to: string, status: number }[]} */
        const routesExactes = [];
        /** @type {{ from: string, to: string, status: number }[]} */
        const routesJoker = [];
        const seen = new Set();
        /** Sources déjà servies par l'éditrice : la migration ne les écrase pas. */
        const sourcesCms = new Set(
          entriesCms.map((e) => (typeof e?.de === 'string' ? e.de : null)).filter(Boolean)
        );
        let ignoreesMigration = 0;
        for (const [index, entry] of entries.entries()) {
          const vientDeLaMigration = index >= entriesCms.length;
          if (vientDeLaMigration && typeof entry?.de === 'string' && sourcesCms.has(entry.de)) {
            ignoreesMigration += 1;
            continue;
          }
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
          // ORDRE (2026-09-22) : `_redirects` (comme routing.json) applique la
          // PREMIÈRE correspondance. Les jokers partent donc à la fin, sinon
          // `/expertise/*` masquerait les règles exactes de la migration
          // (/expertise/securite-informatique → /fr/services/cybersecurite, et
          // non vers /fr/services/securite-informatique qui n'existe pas).
          (de.includes('*') ? lignesJoker : lines).push(`${de} ${versNormalise} ${codeNumber}`);
          // Même liste, forme CloudCannon (voir routing.json plus bas).
          (de.includes('*') ? routesJoker : routesExactes).push({
            ...versMotifCloudCannon(de, versNormalise),
            status: codeNumber,
          });
        }
        lines.push(...lignesJoker);

        // Empty list: nothing to append to _redirects — on laisse ce que
        // l'adaptateur a produit (ou non) intact, mais on écrit quand même
        // routing.json plus bas (il porte aussi les en-têtes).
        if (lines.length > 0) {
          // `dir` is the client output root — dist/ in BOTH modes here: with
          // the adapter attached, buildOutput is "server" and dir =
          // build.client, which the Cloudflare adapter points back at outDir
          // (no `base` subpath); without the adapter (STATIC_ONLY) dir =
          // outDir directly. That root is exactly where Cloudflare Pages looks
          // for `_redirects`.
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
          logger.info(
            `${lines.length} redirection(s) écrites dans _redirects (${entriesCms.length} de src/data/redirects.json, ${entriesMigration.length - ignoreesMigration} de la matrice de migration` +
              `${ignoreesMigration > 0 ? `, ${ignoreesMigration} écartée(s) car déjà saisie(s) par l’éditrice` : ''})`
          );
        }

        // ---- .cloudcannon/routing.json (hébergement de PRODUCTION) --------
        // Voir le long commentaire au-dessus de STATUTS_ROUTING. Écrit dans
        // les DEUX modes de build : c'est le mode STATIC_ONLY qui alimente les
        // sites CloudCannon.
        const routesAstro = Object.entries(redirectionsAstro).map(([de, vers]) => ({
          ...versMotifCloudCannon(de, vers),
          status: 301,
          // Astro écrit une page de rafraîchissement méta à ces chemins.
          forced: true,
        }));
        // BARRE OBLIQUE FINALE (2026-09-22) — chaque règle exacte est émise
        // sous ses DEUX formes, `/x` et `/x/`. Sans ce dédoublement, 105 des
        // 184 anciennes URL rendaient un 404 sur le site déployé : l'hôte
        // compare le chemin exact, barre comprise, et 100 % des URL indexées en
        // portent une. Le « pourquoi » complet est dans
        // scripts/lib/routing-formes.mjs ; les jokers sont laissés intacts
        // (leur capture avale déjà la barre).
        const routesCloudCannon = [...routesAstro, ...routesExactes, ...routesJoker]
          .flatMap(lesDeuxFormes)
          .filter((r, i, tout) => {
            // « Duplicate rules are ignored » côté CloudCannon ; on les retire
            // ici pour que le fichier dise la vérité.
            if (!STATUTS_ROUTING.has(r.status)) {
              fail(`statut ${r.status} refusé par CloudCannon. Entrée fautive : ${JSON.stringify(r)}`);
            }
            return tout.findIndex((autre) => autre.from === r.from) === i;
          });

        /** @type {{ match: string, headers: { name: string, value: string }[] }[]} */
        let entetes = [];
        try {
          const brut = await fs.readFile(new URL('./public/_headers', import.meta.url), 'utf-8');
          // Chemins servis qui ne tombent sous aucun bloc précis de
          // public/_headers : sans eux, la page 404 perdrait les en-têtes de
          // sécurité (voir « EN-TÊTES NON RECOUVRANTS »).
          entetes = reglesEntetes(brut, ['/404.html']);
        } catch {
          logger.warn(
            '[victrix:redirects] public/_headers est introuvable — routing.json partira sans en-têtes (CSP/HSTS absents en production).'
          );
        }

        const routingCible = new URL('./_cloudcannon/routing.json', dir);
        await fs.mkdir(new URL('./_cloudcannon/', dir), { recursive: true });
        await fs.writeFile(
          routingCible,
          `${JSON.stringify({ routes: routesCloudCannon, headers: entetes }, null, 2)}\n`,
          'utf-8'
        );
        const nbJokers = routesCloudCannon.filter((r) => r.from.includes('(.*)')).length;
        const nbAvecBarre = routesCloudCannon.filter((r) => r.from !== '/' && r.from.endsWith('/')).length;
        logger.info(
          `_cloudcannon/routing.json écrit — ${routesCloudCannon.length} route(s) et ${entetes.length} règle(s) d’en-têtes ` +
            `(${routesCloudCannon.length - nbJokers - nbAvecBarre} sans barre finale + ${nbAvecBarre} avec + ${nbJokers} joker(s) ; ` +
            `hébergement CloudCannon — _redirects/_headers y sont ignorés)`
        );

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
        let exclude = Array.isArray(routes.exclude) ? routes.exclude : [];
        // COMPACTION (2026-07-29) : depuis le branchement du contenu migré,
        // l'adaptateur liste INDIVIDUELLEMENT les ~120 médias
        // /wp-content/uploads/… et sature à lui seul le plafond de 100 règles
        // (les sources de redirection n'entraient plus). Aucune route dynamique
        // ne vit sous ces préfixes — un glob par dossier d'actifs est
        // strictement équivalent et libère le budget. (C'est la consolidation
        // annoncée par le commentaire ci-dessus.)
        const ASSET_PREFIXES = ['/wp-content/', '/images/', '/fonts/'];
        for (const prefix of ASSET_PREFIXES) {
          if (exclude.some((e) => e.startsWith(prefix))) {
            exclude = [...exclude.filter((e) => !e.startsWith(prefix)), `${prefix}*`];
          }
        }
        routes.exclude = exclude;
        const budget = 100 - (Array.isArray(routes.include) ? routes.include.length : 0) - exclude.length;
        const manquants = [...seen].filter((de) => !exclude.includes(de));
        const ajoutes = manquants.slice(0, Math.max(0, budget));
        if (ajoutes.length < manquants.length) {
          // Depuis la matrice de migration (2026-09-22) il y a ~175 sources :
          // le plafond est structurellement dépassé sur Cloudflare Pages, qui
          // n'est plus que l'INFRA HÉRITÉE (préversions + POST /api/forms).
          // La PRODUCTION est hébergée chez CloudCannon, qui ignore
          // `_redirects` et lit `.cloudcannon/routing.json` — sans plafond de
          // ce genre (lot L15). Avertissement borné pour rester lisible.
          const restants = manquants.slice(ajoutes.length);
          logger.warn(
            `[victrix:redirects] limite Cloudflare de 100 règles _routes.json atteinte — ${restants.length} source(s) non exclue(s) du worker (sans effet sur la production CloudCannon, cf. L15/routing.json). Exemples : ${restants.slice(0, 5).join(', ')}${restants.length > 5 ? ` … et ${restants.length - 5} autres` : ''}`
          );
        }
        // Écriture inconditionnelle : la compaction seule doit persister même
        // sans nouvelle source de redirection à ajouter.
        routes.exclude = [...exclude, ...ajoutes];
        await fs.writeFile(routesTarget, JSON.stringify(routes, null, 2), 'utf-8');
        if (ajoutes.length > 0) {
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
          // Pages génériques (2026-08-11) : même contrat que services.
          { root: './src/content/pages', ext: '.json' },
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

/**
 * Chemins d'URL des pages composables NOINDEX (collections `pages` et
 * `services`) — consommés par le filtre du sitemap ci-dessous. Lecture
 * SYNCHRONE des JSON au chargement de la config (build seulement, quelques
 * dizaines de fichiers) : la liste suit le champ `noindex` des contenus, rien
 * à entretenir à la main. Défauts alignés sur les schémas zod
 * (src/content.config.ts) : pages → noindex TRUE par défaut (placeholders),
 * services → FALSE (pages publiques).
 */
function collectNoindexComposablePaths() {
  /** @type {string[]} */
  const paths = [];
  for (const { root, urlPrefix, defaultNoindex } of [
    { root: './src/content/pages', urlPrefix: '', defaultNoindex: true },
    { root: './src/content/services', urlPrefix: 'services/', defaultNoindex: false },
    // Fiches du catalogue Ø Studio (2026-09-23, lot L11) : elles ont une page
    // depuis qu'elles portent des `sections`, et les 16 fiches FR sont
    // `noindex` en attendant la validation des prix (#1634). Sans cette
    // entrée, le plan de site les annonçait TOUTES aux moteurs — exactement la
    // contradiction que le filtre existe pour éviter. Les fichiers EN n'ont
    // pas de page : les chemins qu'ils produisent ici ne correspondent à
    // aucune URL du sitemap, donc ils n'y changent rien.
    { root: './src/content/solutions', urlPrefix: 'solutions/', defaultNoindex: false },
  ]) {
    for (const locale of ['fr', 'en']) {
      /**
       * Parcours RÉCURSIF (2026-09-22) : les services sont imbriqués sur deux
       * niveaux (fr/cybersecurite/zero-trust.json) depuis le branchement du
       * contenu migré. La version à plat ignorait ces fichiers — les pages de
       * campagne cachées (accompagnement-ia, demo-o-bureau) auraient donc
       * filé au sitemap malgré leur noindex.
       * @param {string} sousChemin
       */
      const parcours = (sousChemin) => {
        let entrees = [];
        try {
          entrees = readdirSync(
            fileURLToPath(new URL(`${root}/${locale}/${sousChemin}`, import.meta.url)),
            { withFileTypes: true },
          );
        } catch {
          return; // dossier absent = rien à exclure
        }
        for (const entree of entrees) {
          if (entree.isDirectory()) {
            parcours(`${sousChemin}${entree.name}/`);
            continue;
          }
          if (!entree.name.endsWith('.json')) continue;
          const data = JSON.parse(
            readFileSync(
              fileURLToPath(new URL(`${root}/${locale}/${sousChemin}${entree.name}`, import.meta.url)),
              'utf8',
            ),
          );
          const noindex = typeof data.noindex === 'boolean' ? data.noindex : defaultNoindex;
          if (!noindex) continue;
          const slug = data.slug || `${sousChemin}${entree.name.replace(/\.json$/, '')}`;
          paths.push(`/${locale}/${urlPrefix}${slug}/`);
        }
      };
      parcours('');
    }
  }
  return paths;
}
const noindexComposablePaths = collectNoindexComposablePaths();

// https://astro.build/config
/**
 * Garde-fou H1 (Phase 2, 2026-09-16 — recette éditeur 09/09 pt 6, Lot 3).
 * Chaque page publique porte EXACTEMENT un <h1> (le héros, titre ou surtitre
 * selon `h1Element`). Après le build : ≥ 2 H1 sur une page → le build ÉCHOUE
 * (deux héros empilés par un éditeur — le site en ligne reste intact) ; 0 H1
 * → avertissement dans le journal. Logique pure et testée :
 * scripts/lib/h1-guard.mjs (stubs de redirection, 404, recherche, portail et
 * style-guide sont hors périmètre).
 */
function h1Guard() {
  return {
    name: 'victrix:h1-guard',
    hooks: {
      /** @param {{ dir: URL, logger: import('astro').AstroIntegrationLogger }} options */
      'astro:build:done': async ({ dir, logger }) => {
        const root = fileURLToPath(dir);
        /** @type {{ path: string, html: string }[]} */
        const pages = [];
        /** @param {string} d */
        const walk = (d) => {
          for (const entry of readdirSync(d, { withFileTypes: true })) {
            const full = `${d}/${entry.name}`;
            if (entry.isDirectory()) walk(full);
            else if (entry.name.endsWith('.html')) {
              pages.push({ path: full.slice(root.length).replace(/\\/g, '/').replace(/^\//, ''), html: readFileSync(full, 'utf8') });
            }
          }
        };
        walk(root.replace(/[\\/]$/, ''));
        const r = auditPages(pages);
        for (const p of r.warnings) logger.warn(`aucun <h1> sur ${p} — la page n'a pas de héros ?`);
        if (r.errors.length) {
          throw new Error(
            `[victrix:h1-guard] ${r.errors.length} page(s) avec PLUSIEURS <h1> (deux héros sur la même page ?) : ${r.errors.join(', ')}`,
          );
        }
        logger.info(`${r.ok} page(s) avec un seul <h1>, ${r.warnings.length} sans, ${r.skipped} hors périmètre`);
      },
    },
  };
}

export default defineConfig({
  // Served at the root on Cloudflare Pages — no `base` subpath.
  // IMPORTANT: set this to the real deployment URL after the first deploy —
  // it drives canonical URLs, the sitemap, and Open Graph image/URLs.
  site: 'https://victrix-demo.pages.dev',

  // The marketing site stays fully prerendered (static). `output: 'static'` is
  // the default and means EVERY page is prerendered UNLESS it opts out with
  // `export const prerender = false`. Only /api/forms does that (the mock
  // portal's on-demand routes were removed 2026-08-18), so it runs on demand
  // as a Cloudflare Pages Function while the rest of the site is served as
  // static assets from the edge.
  output: 'static',

  // The Cloudflare adapter lets the on-demand route run on Pages. Build-only
  // (see `isBuild` above); `imageService: 'compile'` optimizes images with sharp
  // at build time so the worker never needs sharp at runtime. STATIC_ONLY builds
  // (CloudCannon editing — see above) run adapter-less: everything prerenders.
  adapter: isBuild && !staticOnly ? cloudflare({ imageService: 'compile' }) : undefined,

  // Prefetch links on hover (default strategy) — near-instant navigation.
  // Pairs with <ClientRouter /> in BaseLayout for SPA-like page transitions.
  prefetch: true,

  // TYPOGRAPHIE FRANÇAISE du corps des contenus Markdown (2026-09-23) :
  // espaces insécables devant « : ; ! ? » » et après « « », pour qu'un signe
  // double ne se retrouve jamais seul en tête de ligne. Les SECTIONS sont
  // traitées ailleurs (renderer partagé, `typographieFr`) ; ce plugin couvre
  // les articles du centre de ressources et les campagnes, dont le corps vient
  // du Markdown. Il ne visite que les nœuds de TEXTE — jamais les attributs,
  // donc jamais les URL — et saute `<code>`/`<pre>`.
  markdown: {
    rehypePlugins: [rehypeInsecables],
  },

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
    // Expertises → services (consolidation 2026-07-30, confirmation utilisateur :
    // les expertises SONT les services dans la nouvelle architecture). L'ancienne
    // page artisanale /expertises/intelligence-artificielle est retirée; ses URLs
    // (pré-i18n ET localisées) redirigent vers le service composable équivalent.
    '/expertises/intelligence-artificielle': '/fr/services/intelligence-artificielle',
    '/fr/expertises/intelligence-artificielle': '/fr/services/intelligence-artificielle',
    // 2026-09-22 : la cible EN suit le slug TRADUIT depuis le lot L03
    // (`artificial-intelligence`) — cette redirection pointait encore vers
    // l'ancien slug français et menait à un 404, relevé par check:links.
    '/en/expertises/intelligence-artificielle': '/en/services/artificial-intelligence',
    // Les trois articles DÉMO du prototype ont été retirés au branchement du
    // vrai blogue (2026-07-29) — leurs URLs pré-i18n pointent maintenant vers
    // l'index Ressources (supprimer la règle ferait un 404 sur les vieux liens).
    '/ressources/ia-au-service-de-la-productivite': '/fr/ressources',
    '/ressources/cinq-pratiques-cybersecurite-pme': '/fr/ressources',
    '/ressources/reussir-sa-migration-infonuagique': '/fr/ressources',
    // Portal moved under the locale prefix.
    '/mon-portail': '/fr/portail',
    '/en/customer-portal': '/en/portail',
  },

  integrations: [
    // Garde-fou H1 (Phase 2) : 2 H1 = build rouge, 0 H1 = avertissement.
    h1Guard(),
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
      // /style-guide : page « Design System Victrix » (noindex, interne —
      // remplace l'ancien design-lab, purgé le 2026-08-04) ;
      // /services/demo-sections : service de démonstration (noindex) servant
      // aux captures d'aperçus de la palette — ni l'un ni l'autre au sitemap.
      // + exclusion DYNAMIQUE des pages composables noindex (2026-08-11) : les
      // placeholders des collections `pages` et `services` naissent
      // noindex:true — les lister au sitemap contredirait le noindex. La liste
      // est lue des JSON au chargement de la config (build seulement) : passer
      // un placeholder à noindex:false le fait entrer au sitemap tout seul,
      // aucune liste à entretenir ici.
      // Logique PURE et testée : scripts/lib/sitemap-filter.mjs (+
      // src/lib/sitemap-filter.test.ts). Extraite le 2026-09-22 après le
      // bogue des 72 URL annoncées pour 186 pages — le détail est dans le
      // bloc de doc du module. Les préfixes exclus y vivent aussi.
      filter: (page) => entreAuSitemap(page, noindexComposablePaths),
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
