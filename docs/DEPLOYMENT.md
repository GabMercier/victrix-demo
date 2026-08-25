# Deployment runbook — Victrix site

Static marketing site built with Astro 5.

**Production path (decided 2026-07-17, activated 2026-08-25): CloudCannon is
CMS *and* host.** Two CloudCannon sites on one repo:

| Stage | Branch | CloudCannon site | URL |
|---|---|---|---|
| Editing (staging) | `spike/cloudcannon` | « Vic-demo » (existing) | lawful-hare.cloudvent.net (noindex) |
| Production | `main` | production site (setup: `operations.md` §6) | overt-pineapple.cloudvent.net; real domain at DNS cutover |

Editors **Save** to staging; the **Publish** button in CloudCannon merges
`spike/cloudcannon` into `main` and rebuilds the production site. Day-to-day
ritual: `docs/operations.md` §5–§6. The live victrix.ca (WordPress) stays
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

Nothing manual. Push to `spike/cloudcannon` → CloudCannon rebuilds the staging
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
- The 6 forms keys — parked until the forms-backend decision
  (`operations.md` §7ter). **Never set `PUBLIC_FORMS_ENABLED` on any
  CloudCannon build** — the POST would have no receiver.
- Portal variables — none are read today (mock removed 2026-08-18); they
  arrive with the real portal work (`docs/portail-auth.md` §7).

## 4. Post-publish checklist

- [ ] `/` redirects to `/fr` on the Cloudflare preview (CloudCannon: pending
      `routing.json`, see §6); `/fr` and `/en` load styled.
- [ ] FR⇄EN language switch lands on the mirrored page.
- [ ] `/fr/portail` renders the visual login page (button disabled — the
      interactive portal is out of scope for this version).
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
  **`.cloudcannon/routing.json`** (repo root; `headers` + `routes` arrays —
  see cloudcannon.com/documentation/articles/configure-custom-routing/).
  Consequence today, on the cloudvent URLs: the CMS-edited redirects
  (`src/data/redirects.json` → `dist/_redirects`) and the security headers
  (CSP/HSTS in `public/_headers`) are **not applied**. To close before
  go-live: emit `routing.json` from those same sources (extend the
  `victrix:redirects` integration in `astro.config.mjs`).
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
- [ ] Generate `.cloudcannon/routing.json` (redirects from
      `src/data/redirects.json` + headers mirroring `public/_headers`) and
      verify 301s + CSP/HSTS on the production URL.
- [ ] Decide + wire the forms backend (`operations.md` §7ter); set the 6 keys
      there; only then set `PUBLIC_FORMS_ENABLED` on the production build.
- [ ] `astro.config.mjs` `site:` → real domain; `public/robots.txt` `Sitemap:`
      line; re-validate canonical/OG URLs and share cards.
- [ ] Custom domain on the CloudCannon production site; DNS + 301s from the old
      WordPress URLs (ADO **#1438** — domaine + DNS + rollback).
- [ ] `REBUILD_HOOK_URL` GitHub secret → production-site build hook
      (`operations.md` §7bis) so scheduled content publishes daily.
- [ ] Optional: rename branch `spike/cloudcannon` → `staging` (re-bind the
      CloudCannon editing site; update docs/URLs).
- [ ] Decommission: Cloudflare Pages project `victrix-demo` + the old Sveltia
      OAuth worker (`sveltia-cms-auth.…workers.dev`, tombstone note in
      `public/_headers`).
- [ ] Final WordPress export before decommission: Gravity Forms entries + the 5
      protected PDFs (see `docs/content-inventory.md` / migration notes).
