# Victrix site — development roadmap

> Purpose: turn the current faithful reproduction of victrix.ca into a production-grade
> base for the real thing. Marketing will deliver a **new design later**; until then we keep
> reproducing the existing site and invest in the foundations (quality, performance, the
> client portal) that survive a redesign.

## Guiding principles

1. **Marketing stays static; the portal stays isolated.** Don't let portal/auth concerns
   leak into the prerendered marketing pages.
2. **Design-refresh-ready.** Everything visual flows from `src/styles/tokens.css` and small
   `.astro` components, so the upcoming redesign is a re-skin, not a rebuild.
3. **Bilingual & accessible by default** (FR/EN, WCAG 2.1 AA) — bake it in now so it carries
   into the new design for free.
4. **Swap-points over rewrites.** The portal already hides auth/data behind `AuthProvider` /
   `PortalDataService` interfaces; keep that seam.
5. **Verify before shipping.** Tests + CI + Lighthouse budgets lock in quality as content and
   the redesign land.

## Where we are today (done)

- Astro 5 static marketing site + blog, bilingual FR/EN (`/fr`, `/en`), Sveltia CMS.
- On-demand client portal (`/fr/portail`, `/en/portail`) with **mock** auth + data behind
  pluggable providers; signed httpOnly session cookie; middleware guard.
- Cloudflare adapter (build-only on Node 18), sitemap (i18n), SEO/OG meta, security headers
  (no CSP yet), `prefers-reduced-motion` handling, focus-visible, skip link.

---

## Milestone 0 — Production foundations (do first)

> **Status: ✅ DONE (2026-06-23).** Vitest + 15 unit tests, ESLint (astro + jsx-a11y),
> `type-check` script, CSP + HSTS in `_headers` (+ CMS-safe `/admin`), GitHub Actions CI +
> Playwright e2e, `.nvmrc`/engines = Node 20, `.env.example`, and `docs/DEPLOYMENT.md`.
> Verified: `npm test` (15/15), `npm run lint` (0 errors), `tsc` (0). See also
> `docs/i18n-architecture.md` (URL/SEO + slug plan) and `docs/handoff-m1.md`.

Guardrails so everything after this is safe to change. Mostly invisible to users; high leverage.

- [ ] **CI/CD** — GitHub Actions: `npm ci` → type-check → lint → test → `npm audit` → build →
      deploy via `cloudflare/wrangler-action`; **per-PR preview URLs**. Decouples from the
      dashboard Git integration (see the known git-disconnect gotcha). *(medium)*
- [ ] **Unit tests (Vitest + Astro Container API)** — cover the security-relevant pure logic:
      `session-cookie` HMAC sign/verify/expiry/tamper, `i18n` helpers (`swapLocale`,
      `localizePath`, `useTranslations`), `BaseLayout` canonical/hreflang/OG output. *(medium)*
- [ ] **E2E tests (Playwright)** — the brittle cross-cutting paths: `/`→`/fr` + old-URL
      redirects, the FR⇄EN switch landing on the mirrored page, announcement dismissal, and the
      **portal login→callback→dashboard→logout** cookie flow. *(medium)*
- [ ] **Linting** — ESLint + `eslint-plugin-astro` `jsx-a11y` config (+ typescript-eslint),
      run in CI; add `@axe-core/playwright` runtime a11y checks to the e2e suite. *(low)*
- [ ] **Security headers** — add **CSP + HSTS** to `public/_headers` (it has the basics but no
      CSP). For a mostly-static site, hand-authored `_headers` CSP is correct — Astro's
      experimental CSP only covers on-demand pages. Extract/hash the one inline script
      (announcement dismissal in BaseLayout). Add `X-Robots-Tag: noindex` to `/admin` + `/auth`. *(medium)*
- [ ] **Secrets hygiene** — add `.env.example` documenting `AUTH_PROVIDER`, `PORTAL_DATA`,
      `PORTAL_SESSION_SECRET`, `ENTRA_*`, `DATAVERSE_*`; add early validation in the real
      provider stubs so missing config fails loudly. (Key actually moved to a secret in Portal P5.) *(low)*
- [ ] **Dependencies** — `npm audit` shows highs via transitive `wrangler`→`miniflare`
      (`ws`, `undici`). Pin safe versions via `overrides`, or take the Node 20 path below
      (adapter v14 needs Astro 7, so don't chase that on the v5 line). *(medium)*
- [ ] **Decision: Node 20+** — moving off Node 18 lets us attach the Cloudflare adapter in dev
      too (drop the build-only workaround) and clears several engine warnings. Add `.nvmrc`.
      *(See open decisions below.)*
- [ ] **`docs/DEPLOYMENT.md`** — build/preview, Cloudflare Pages setup, `wrangler secret put`,
      env vars, post-deploy checklist (hreflang/canonical/CSP/sitemap), rollback. *(low)*

## Milestone 1 — UX & performance quick wins

Low-effort, high-impact, and fully compatible with reproducing the current site.

| Add | What it buys us | Effort |
|---|---|---|
| **View Transitions — `<ClientRouter />`** (built-in) | Smooth SPA-like page transitions; persist header/nav across navigations; respects reduced-motion. Re-bind any inline init on `astro:page-load`. | low |
| **`prefetch: true`** (built-in) | Near-instant nav on hover/viewport; auto-on with ClientRouter; zero server cost. | low |
| **`<Image>` / `<Picture>` everywhere** (built-in `astro:assets`) | AVIF/WebP, lazy-load, no layout shift. `layout="constrained"` in articles, `"full-width"` for heros. Sharp already runs at build. | medium |
| **astro-icon** | One typed `<Icon>` for nav/social/portal; tree-shaken SVGs, a11y attrs forwarded; kills ad-hoc inline SVG. | low |
| **JSON-LD structured data** | `Organization`/`LocalBusiness` sitewide + `BlogPosting` per article (all data already exists). Drives rich results + AI-search citations. | low |
| **`@astrojs/rss`** (official) | One feed per locale from the blog collection; pairs with the existing sitemap. | low |
| **Cookieless analytics** (Cloudflare Web Analytics) | Baseline traffic before/after redesign, no cookie banner (Law 25 / GDPR friendly). | low |
| **Lighthouse CI budget** | Fail PRs that regress LCP/CLS/INP/JS-weight — protects perf through the redesign. | medium |
| **`@fontsource-variable/montserrat`** | Cleaner self-hosted fonts than the manual `/public/fonts` setup (the built-in Fonts API is still experimental on Astro 5 → evaluate-only). | low |

## Milestone 2 — Content & i18n polish

- [x] **Localized EN slugs** — EN articles now use English slugs (`/en/ressources/five-cybersecurity-practices-for-smbs`),
      via a CMS-editable `slug` frontmatter field; FR keeps its filename slugs. See `docs/i18n-architecture.md`.
      *(Optional follow-up: 301 the brief-lived `/en/ressources/<fr-slug>` URLs to the new EN slugs.)*
- [ ] **Pagefind on-site search** — static, per-locale search for the blog; no backend; post-build step. *(medium)*
- [ ] **`@astrojs/mdx`** — for hand-built marketing/landing pages that need components (callouts,
      CTAs, comparison tables). Keep CMS-authored posts as plain `.md`. *(medium)*
- [ ] **Server-render the 404 bilingually** — currently swaps to EN via client JS (breaks with JS
      off). Render both or use `:lang()` so it's robust. *(low)*
- [ ] **SEO completeness** — verify sitemap i18n hreflang in production; generate `robots.txt`
      from `site` so it can't point at the wrong host after the domain change. *(low)*
- [ ] **CMS hardening** — document/own the Sveltia OAuth worker; add a content preview branch +
      frontmatter validation; PR review on `src/content/`. *(medium)*

## Milestone 3 — Client portal: real auth + data (multi-phase)

The big track. Custom Astro path (not Power Pages), Entra External ID, data-source-agnostic.
The `AuthProvider`/`PortalDataService` interfaces mean **routes/middleware/UI don't change** —
only the providers get filled in.

### P1 — Entra External ID tenant + branded sign-in
Create an Entra External ID (CIAM) **external tenant**; a sign-up/sign-in user flow with
**email OTP / passwordless + social (Google/Apple/Facebook)** for a seamless experience.
Register the portal as a **confidential web app**, redirect URI `…/auth/callback`, scopes
`openid profile email offline_access`. Add a **custom sign-in domain** (`login.victrix.ca`) +
Victrix branding (FR-CA/EN-CA). *Risks: custom-domain verification + per-tenant branding take
time; each social IdP needs its own app/secret.*

### P2 — Real OIDC Authorization Code + PKCE callback
Implement `EntraAuthProvider.handleCallback`: validate `state`/`nonce` from the PKCE cookie,
exchange code for tokens at the token endpoint, validate the `id_token` (JWKS/issuer/audience/
nonce), map claims → `Session`, mint our existing signed cookie, keep tokens server-side.
Implement IdP end-session logout. Unit-test state/nonce/claim-mapping. Flip `AUTH_PROVIDER=entra`.
*Note: a server-side Worker exchanging the code should be a **confidential** client (reconcile
the current "public PKCE, no secret" comments); strengthen the PKCE/state random generator.*

### P3 — WordPress account migration
Passwords **cannot** transfer; accounts **can**. Default to **JIT/lazy**: on first Entra
sign-in, match the source record by **verified email** (`email_verified` required) and link it.
Alternative: **bulk pre-create** via Microsoft Graph. First-run UX = passwordless/SSPR, with
FR/EN messaging explaining the one-time re-verification. Define the stable `clientId` passed to
`PortalDataService` (Entra `oid` vs migrated key) and persist the mapping. *Risks: email
mismatches need an admin reconciliation list; never auto-link on an unverified email.*

### P4 — Data layer + editable contact form + token refresh
Keep `PortalDataService` source-agnostic (WordPress DB / CRM / Dynamics / new API all swappable).
Add `updateContact(clientId, patch)` + a localized `/[lang]/portail/coordonnees` page and a
state-changing POST endpoint (mirroring `/auth/logout`) with CSRF + validation, writing back
server-side as the signed-in user only. If the backend needs a delegated token, store
access/refresh tokens in **Cloudflare KV/Durable Object** keyed by session, and implement
**silent refresh** (rotate refresh tokens). *Risk: Pages Functions are stateless — refresh needs
a real store; don't over-fit the interface to Dataverse while the source is undecided.*

### P5 — Session & secret hardening
Replace `DEV_SIGNING_KEY` with a **Cloudflare secret** read from the runtime binding (this is a
refactor — `session-cookie.ts` must take the key as an argument, not a module constant); support
key rotation. Store Entra/backend secrets in Cloudflare too (`.dev.vars` locally). Confirm cookie
attributes, re-audit state/nonce + open-redirect guards, extend the `_headers` CSP to allow the
IdP redirect domain + HSTS.

### P6 — Cloudflare deploy, environments, observability, cutover
Per-environment env/secrets (prod + preview/staging with a non-prod Entra app + redirect URI);
register all redirect URIs; KV/DO bindings for the token store; structured logging + alerting on
auth/token errors (`@sentry/astro` auto-wraps the Pages worker on this exact stack). **Cutover:**
point "Mon portail" at the new portal, keep the WP portal alive during a JIT-migration coexistence
window, then 301 the old login and decommission.

## Milestone 4 — Design refresh (when marketing delivers)

Because visuals are token-driven, this is contained: remap `src/styles/tokens.css`, restyle the
small component set, optional **flashless dark mode** (token override + inline `is:inline` theme
script, re-applied on `astro:after-swap`), and re-skin the portal + Entra branding. Lighthouse/
a11y CI (M0/M1) guards the new design against regressions.

---

## Suggested sequencing

```
M0 (foundations)  ──►  M1 (UX/perf wins)  ──►  M2 (content/i18n)
                            │
                            └──►  M3 portal P1…P6  ──►  M4 design refresh
```
M0 first (cheap insurance). M1 is mostly a day or two of high-visibility wins. M3 (portal) can
start in parallel once M0's secrets/CSP groundwork exists, but is gated on the **data-source
decision**. M4 waits on marketing.

## Open decisions (need your input)

1. **Node 18 vs 20+** — staying on 18 keeps the build-only-adapter workaround and some audit
   warnings; moving to 20 simplifies config and dev/prod parity. Recommend planning the bump.
2. **EN slugs** — localize them (`/en/resources/…`) for SEO/UX, or accept FR slugs under `/en`?
3. **Portal data source** — where do client records actually live (WordPress DB / a CRM /
   Dynamics-Dataverse / a new API)? This gates Portal P4 and shapes `PortalDataService`.
4. **Scope of the demo vs real** — how far do we take auth/data as a *real* prototype now vs.
   waiting for the new design?

## Appendix — production-audit findings (prioritized)

| Sev | Area | Gap → action |
|---|---|---|
| High | Signing key | `DEV_SIGNING_KEY` hardcoded → Cloudflare secret + rotation (Portal P5). |
| High | Dependencies | `npm audit` highs via `wrangler` transitive (`ws`/`undici`) → overrides or Node-20 path. |
| High | Secrets/env | No `.env.example`/validation for `AUTH_PROVIDER`/`ENTRA_*`/`DATAVERSE_*` → document + fail-fast. |
| High | CSP | `_headers` has no CSP/HSTS → add (M0). |
| High | Tests / CI | None → Vitest + Playwright + GitHub Actions (M0). |
| Med | EN FR-slugs | EN uses FR slugs → localize + 301 (M2). |
| Med | Error handling | `/auth/callback` errors are opaque → error codes + Sentry (Portal P6). |
| Med | Node/adapter | Build-only adapter / Node 18 divergence → Node 20 decision. |
| Med | Sveltia OAuth | Personal OAuth worker undocumented → own/document it. |
| Med | Session cookie | Consider `SameSite=Strict`, inactivity window, key versioning (Portal P5). |
| Low | Open redirect | `returnTo` prefix check is defensive but ignores embedded query URLs → allow-list. |
| Low | robots.txt | Hardcoded sitemap host → generate from `site`. |

> Not a gap (audit false-positives, verified): `prefers-reduced-motion` **is** implemented in
> `global.css`; `dist/` **is** gitignored.
