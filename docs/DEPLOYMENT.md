# Deployment runbook — Victrix site

Static marketing site built with Astro 5.

**Production path (decided 2026-07-17, activated 2026-08-25): CloudCannon is
CMS *and* host.** Two CloudCannon sites on one repo:

| Stage | Branch | CloudCannon site | URL |
|---|---|---|---|
| Dev integration | `dev` | none (Cloudflare branch preview `dev.victrix-demo.pages.dev`, legacy) | developers only: `feat/*` → PR → `dev` → PR → `staging` |
| Editing (staging) | `staging` (renamed from `spike/cloudcannon` 2026-09-16) | « Victrix · Édition » (ex-« Vic-demo ») | lawful-hare.cloudvent.net (noindex) |
| Production | `main` | production site (setup: `operations.md` §6) | overt-pineapple.cloudvent.net; real domain at DNS cutover |

Editors **Save** to `staging`; developers land on `staging` only through a
GitHub PR from `dev` (server-side merge — no more push races with CloudCannon
saves); the **Publish** button in CloudCannon merges `staging` into `main`
and rebuilds the production site. Day-to-day ritual: `docs/operations.md`
§4–§6. The live victrix.ca (WordPress) stays
untouched until DNS cutover.

**Cloudflare Pages (`victrix-demo` → victrix-demo.pages.dev) is legacy spike
infrastructure**, kept connected for two things only: automatic branch
previews (`https://<branch>.victrix-demo.pages.dev`, adapter build) and
testing real `/api/forms` POSTs — the one route needing a server runtime,
which CloudCannon's static hosting cannot provide. Decommission at go-live
(checklist, §7).

## Prerequisites

- **Node 20+** (`.nvmrc` pins 20). The Cloudflare adapter's dev hook needs the
  Node-20 global `File`; build also expects 20+.
- Access to the CloudCannon org (both sites). The Cloudflare account is only
  needed for the legacy Pages project and the Turnstile dashboard.

## 1. Verify locally before shipping

```bash
nvm use            # Node 20
npm ci
npm run lint       # ESLint (a11y + TS)
npm run type-check # astro check
npm run test       # Vitest unit tests
npm run build      # adapter build (what Cloudflare previews run)
STATIC_ONLY=1 npm run build  # static build (what BOTH CloudCannon sites run)
npm run preview    # smoke-test the built output
```

> Do **not** run `astro build`/`preview`/`check` while `npm run dev` is running —
> on Windows they fight over the `.astro` cache (EPERM). Stop dev first, or use
> the isolated-copy recipe (`operations.md` §3.1).

## 2. Deploy

Nothing manual. Merge into `staging` (PR from `dev`) → CloudCannon rebuilds the staging
site (`STATIC_ONLY=1` + Bookshop postbuild) and Cloudflare Pages builds a
legacy branch preview. **Publish** in CloudCannon (staging site → Site
Settings → Files → Publishing) advances `main` → the production site rebuilds.
First-time setup of the production site + Publishing link: `operations.md` §6.

> Git-disconnect gotcha (Cloudflare, legacy): if Pages loses the repo link,
> re-link it in the Pages dashboard (Settings → Builds & deployments → Git).

## 3. Environment variables & secrets

- `STATIC_ONLY=1` — mandatory **build** variable on BOTH CloudCannon sites
  (without it the build attaches the Cloudflare worker and Bookshop never
  loads). See the §7 caveat: this flag currently also carries the
  editor-preview content policy.
- `PUBLIC_GA4_ID` — may be set on the **production** CloudCannon site once it
  exists (`operations.md` §7ter).
- The 6 forms keys — backend decided 2026-08-25: CloudCannon Forms spike
  first, dedicated Cloudflare Worker as fallback (`operations.md` §7ter);
  the keys land wherever the spike concludes. Until then they may be set on
  the legacy Cloudflare Pages project for end-to-end verification. **Never
  set `PUBLIC_FORMS_ENABLED=1` on any CloudCannon build** — the POST would
  have no receiver. Set `PUBLIC_FORMS_ENABLED=inbox` (+ `PUBLIC_FORMS_INBOX_KEY`)
  instead once a CloudCannon Inbox is attached to the site (spike started
  2026-09-16 on the dev site).
- Portal variables — none are read today (mock removed 2026-08-18); they
  arrive with the real portal work (`docs/portail-auth.md` §7).

## 4. Post-publish checklist

- [ ] `/` redirects to `/fr` on the Cloudflare preview (CloudCannon: pending
      `routing.json`, see §6); `/fr` and `/en` load styled.
- [ ] FR⇄EN language switch lands on the mirrored page.
- [ ] `/fr/portail` renders the visual login page (sign-in button enabled but
      leads nowhere — parity with the current site; « Mot de passe oublié »
      swaps to the email-only reset form. The interactive portal is out of
      scope for this version).
- [ ] `sitemap-index.xml` lists FR + EN pages; `hreflang`/canonical present in `<head>`.
- [ ] Drafts/scheduled content: remember the §7 caveat — the production
      cloudvent URL currently shows drafts (STATIC_ONLY build). Acceptable
      while noindex; blocking for go-live.

## 5. Rollback

- A CloudCannon Publish is an ordinary Git merge into `main`:
  `git revert <merge commit> && git push` → the production site rebuilds.
- Legacy Cloudflare project only: Deployments → pick the last good build →
  **Rollback**.

## 6. Known constraints & gaps

- **CloudCannon hosting ignores `_redirects` and `_headers`** (they are
  Netlify/Cloudflare conventions). CloudCannon reads
  **`.cloudcannon/routing.json`** (`headers` + `routes` arrays — see
  cloudcannon.com/documentation/developer-articles/configure-custom-routing/
  and the official schema in CloudCannon/configuration-types `src/routing.ts`).
  **RÉGLÉ le 2026-09-22** : l'intégration `victrix:redirects`
  (`astro.config.mjs`) écrit `dist/_cloudcannon/routing.json` à chaque build —
  la forme que CloudCannon documente pour un fichier GÉNÉRÉ, et qui prime sur
  le fichier source. Rien à committer. Elle y met les **189 routes** (les 13
  d'`astro.config` en `forced: true` — Astro écrit à ces chemins une page de
  rafraîchissement méta, donc un fichier existe ; les 3 de l'éditrice ; les 175
  de la matrice de migration) et **5 règles d'en-têtes** dérivées de
  `public/_headers`. Deux traductions faites au passage : les jokers
  (`/expertise/*` → `/expertise/(.*)`, `:splat` → `$1`) et des règles
  d'en-têtes **sans recouvrement** (le bloc `/*` est recopié dans chaque règle
  précise : selon que CloudCannon fusionne les règles ou garde la première,
  une page de `/fr/` perdrait HSTS ou recevrait `nosniff, nosniff`).
  **Reste à faire** : vérifier de l'extérieur après le premier déploiement
  (`docs/operations.md`, § Redirections — commande `curl -I`), la sémantique
  des en-têtes n'étant pas documentée ; et décider de la règle 404 attrape-tout
  que CloudCannon recommande (D17 du plan — à tester sur le site dev d'abord,
  une règle attrape-tout mal comprise détournerait tout le trafic).
- **`STATIC_ONLY` conflates two roles** — "fully static build" AND
  "editor-preview content policy" (drafts + future-dated posts visible in
  `src/i18n/blog.ts`, announcement-bar date windows ignored in
  `src/lib/announce.ts`, Bookshop attached). The production CloudCannon site
  inherits the preview policy. Fix before go-live: introduce a separate flag
  (e.g. `EDITOR_PREVIEW=1`, set only on the *editing* site's build) and key
  the content policy + Bookshop on it.
- **Adapter is build-only** (`astro.config.mjs`) so `astro dev` works on
  Node 18; once everyone is on Node 20 this can be simplified.
- `npm audit` shows highs transitively via `wrangler` (build tooling); the
  clean fix needs `@astrojs/cloudflare` v14 (Astro 7). Tracked in
  `docs/roadmap.md`.

## 7. Go-live checklist (DNS cutover day — the real victrix.ca moves here)

- [ ] Split `STATIC_ONLY` from the editor-preview policy (constraint above) and
      set `EDITOR_PREVIEW=1` on the editing site's build only; verify drafts,
      scheduled posts, and announcement-bar windows behave on the production URL.
- [x] Generate `.cloudcannon/routing.json` — fait le 2026-09-22 (généré au
      build dans `dist/_cloudcannon/routing.json` : 189 routes + 5 règles
      d'en-têtes). **Reste la vérification EXTERNE** : sur le site dev
      (`vocal-wren.cloudvent.net`) puis en production —
      `curl -sI <url>/fr/ | grep -i "strict-transport\|content-security\|x-content-type"`
      et `curl -sI <url>/decouvrir-victrix/` doit rendre un **301** vers
      `/fr/decouvrir`.
- [ ] Wire the forms backend — decided 2026-08-25: CloudCannon Forms spike
      first, Cloudflare Worker fallback (`operations.md` §7ter); set the 6
      keys there; only then set `PUBLIC_FORMS_ENABLED` on the production
      build.
- [ ] **BLOQUANT — `astro.config.mjs` `site:` → real domain**; `public/robots.txt`
      `Sitemap:` line; re-validate canonical/OG URLs and share cards.

      **Mesuré le 2026-09-23, et c'est plus grave que « une ligne à changer ».**
      `site:` vaut `https://victrix-demo.pages.dev` (`astro.config.mjs:835`), et
      cette copie Cloudflare Pages **répond HTTP 200, publiquement, sans aucun
      en-tête `x-robots-tag`** — vérifié en direct. Or `site:` alimente TOUS les
      `canonical`, les `hreflang`, les `og:url` et les `og:image` du site. Tel
      quel, la production dirait à Google que la version canonique de chaque
      page est celle qui vit sur un domaine de démonstration, servi depuis un
      build périmé (`/fr/carrieres` y rend un 404). Une version morte du site
      s'auto-canonicalise en public.

      Décision de Gabriel le 2026-09-23 : **on documente, on ne change rien
      maintenant** — le domaine définitif se tranche avec le client (voir aussi
      la décision 7 du §8 de `docs/migration/plan-redirections.md` : apex ↔
      `www`, `http` → `https`). Deux gestes le jour J, dans cet ordre :
      1. `site:` sur le domaine réel AVANT le build de production ;
      2. désindexer ou fermer le projet Cloudflare Pages `victrix-demo`
         (ligne « Decommission » plus bas) — tant qu'il répond 200 sans
         `noindex`, il reste un duplicata indexable du site.
- [ ] Custom domain on the CloudCannon production site; DNS + 301s from the old
      WordPress URLs (ADO **#1438** — domaine + DNS + rollback).
- [ ] `REBUILD_HOOK_URL` GitHub secret → production-site build hook
      (`operations.md` §7bis) so scheduled content publishes daily.
- [x] Branch `spike/cloudcannon` renamed `staging` + `dev` created (2026-09-16).
- [ ] Decommission: Cloudflare Pages project `victrix-demo` + the old Sveltia
      OAuth worker (`sveltia-cms-auth.…workers.dev`, tombstone note in
      `public/_headers`).
- [ ] Final WordPress export before decommission: Gravity Forms entries + the 5
      protected PDFs + the **full media library** — copy `wp-content/uploads/`
      via SFTP/hosting file manager (includes `dlm_uploads/`; the 943-item
      inventory is `docs/migration/urls-medias.csv`). WP's Tools → Export only
      emits metadata XML, never the files (see `docs/content-inventory.md` /
      migration notes).
