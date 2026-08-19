# Deployment runbook — Victrix site

Static marketing site + on-demand client portal, built with Astro 5 and deployed
to **Cloudflare Pages**.

## Prerequisites

- **Node 20+** (`.nvmrc` pins 20). The Cloudflare adapter's dev hook needs the
  Node-20 global `File`; build also expects 20+.
- A Cloudflare Pages project (current: `victrix-demo` → `victrix-demo.pages.dev`).

## 1. Verify locally before shipping

```bash
nvm use            # Node 20
npm ci
npm run lint       # ESLint (a11y + TS)
npm run type-check # astro check
npm run test       # Vitest unit tests
npm run build      # production build (attaches the Cloudflare adapter)
npm run preview    # smoke-test the built output
```

> Do **not** run `astro build`/`preview`/`check` while `npm run dev` is running —
> on Windows they fight over the `.astro` cache (EPERM). Stop dev first.

## 2. Deploy

**Today: Cloudflare Pages Git integration.** Pages watches the repo and builds on
push to `main`. Project settings:

- Build command: `npm run build`
- Output directory: `dist`
- Environment variable: `NODE_VERSION = 20` (or rely on `.nvmrc`)

**Optional CI-driven deploys (recommended next):** switch to GitHub Actions +
`cloudflare/wrangler-action` for per-PR preview URLs and to decouple from the
dashboard Git link. Add repo secrets `CLOUDFLARE_API_TOKEN` + `CLOUDFLARE_ACCOUNT_ID`,
then add a deploy job to `.github/workflows/ci.yml` (a stub note is already there).

> Git-disconnect gotcha: if Pages loses the repo link, re-link it in the Pages
> dashboard (Settings → Builds & deployments → Git).

## 3. Environment variables & secrets

Set in the Pages dashboard (Settings → Environment variables) or via Wrangler.
See `.env.example` for the full list.

> 2026-08-18 : le portail MOCK est retiré (reste la page de connexion
> visuelle) — AUCUNE des variables portail ci-dessous n'est lue aujourd'hui.
> Elles arriveront avec l'implémentation réelle (docs/portail-auth.md §7).

| Name | Type | When |
|---|---|---|
| `PORTAL_SESSION_SECRET` | **secret** | real portal (cookie signing) |
| `ENTRA_AUTHORITY` / `ENTRA_CLIENT_ID` | var | real auth |
| `ENTRA_CLIENT_SECRET` | **secret** | real auth (confidential client) |
| `DATAVERSE_API_URL` | var | real data |

```bash
# Secrets (never commit):
wrangler pages secret put PORTAL_SESSION_SECRET --project-name victrix-demo
```

## 4. Post-deploy checklist

- [ ] `astro.config.mjs` `site` points at the **real** production domain (drives
      canonical URLs, sitemap, OG, and `robots`/sitemap references).
- [ ] `/` redirects to `/fr`; `/fr` and `/en` load styled.
- [ ] FR⇄EN language switch lands on the mirrored page.
- [ ] Portal: `/fr/portail` → *Se connecter* → dashboard → sign out.
- [ ] `sitemap-index.xml` lists FR + EN pages; `hreflang`/canonical present in `<head>`.
- [ ] Security headers present: `curl -sI https://<domain>/ | grep -iE 'content-security|strict-transport'`.
- [ ] `/admin/` loads the CMS (its looser CSP) and is `noindex`.

## 5. Rollback

- Cloudflare Pages → Deployments → pick the last good build → **Rollback**, or
- `git revert <bad commit>` and let Pages rebuild.

## 6. Known constraints

- **Adapter is build-only** (`astro.config.mjs`) so `astro dev` works on Node 18;
  once everyone is on Node 20 this can be simplified to always attach the adapter.
- `npm audit` shows highs transitively via `wrangler` (build tooling); the clean
  fix needs `@astrojs/cloudflare` v14 (Astro 7). Tracked in `docs/roadmap.md`.
