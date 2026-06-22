# Client portal — architecture & implementation blueprint

> Status: **implemented (prototype, mock auth + mock data).** The structure below
> is live; the mock→real swap points in §7 are the remaining work to go to
> production. This document doubles as the stakeholder architecture note.

## 1. Why this exists

victrix.ca (WordPress today) has a same-domain **"Mon portail"** client login: authenticated
clients see tailored info (contracts, services). Moving to a static Astro site, we must
prove the static-first architecture can host an **on-domain authenticated client area**
without weakening the security or simplicity of the marketing site.

## 2. The split: static marketing + dynamic portal

- **Marketing pages stay prerendered (static).** Unchanged behaviour.
- **Only the portal routes render on demand** (they need a request/session).

How (current Astro 5 syntax):
1. Add the Cloudflare adapter: `npm i @astrojs/cloudflare`, then in `astro.config.mjs`
   keep `output: 'static'` (default) and add `adapter: cloudflare()`.
2. Mark **only** the portal routes on-demand with `export const prerender = false`
   in their frontmatter. Every existing page has no such export, so it stays static.

Result on Cloudflare Pages: static assets are served from the edge as today; the portal
routes run as a Pages Function (`_worker.js`). The marketing site is untouched.

## 3. Auth flow: OIDC Authorization Code + PKCE (redirect to a real IdP)

**We never handle passwords on the marketing domain.** The on-domain `/mon-portail` page
*looks* like the current login (email/password fields, "Mot de passe oublié", brand
background) but the primary action **starts the standard OIDC redirect** — credentials are
entered at the identity provider, not posted to us. This is the only defensible model for a
cybersecurity firm.

```
/mon-portail  --login()-->  IdP authorize endpoint  (PKCE code_challenge, state, nonce)
                                   |  user authenticates at the IdP
/auth/callback  <--redirect (code)--
   handleCallback(): exchange code + code_verifier -> tokens (PKCE, no client secret in browser)
   -> create session -> Set-Cookie (httpOnly, Secure, SameSite=Lax) -> redirect to dashboard
middleware: getSession(cookie) on every /mon-portail/* request; none -> /mon-portail
```

- **PKCE** removes the need for a client secret in the browser.
- The **session** is an httpOnly cookie (the browser never reads tokens via JS). For the
  prototype the cookie holds a signed mock session; in production it holds a session id or a
  short-lived validated token, with refresh handled server-side.
- **Primary IdP: Microsoft Entra External ID** (their stack is Microsoft/Dynamics) via
  `@azure/msal-browser` / OIDC. Kept behind a generic interface so Auth0/etc. swap in.
  - Note: MSAL.js is browser-side; because we also want server middleware + SSR dashboard,
    the cleanest bridge is to establish a **server session cookie** after the IdP callback
    (either exchange server-side on the Worker, or have the browser hand the validated token
    to a session-setup endpoint). This is the one nuance to settle at implementation; the
    `AuthProvider` interface below hides it from the rest of the app.

## 4. Module & route structure

```
src/lib/
  auth/
    types.ts            # AuthProvider, Session interfaces
    session-cookie.ts   # signed httpOnly session cookie (Web Crypto HMAC; shared)
    mock.ts             # MockAuthProvider — signs in a fake client, cookie session
    entra.ts            # EntraAuthProvider stub — real PKCE/URL build + token-exchange TODOs
    index.ts            # selects provider (mock by default; AUTH_PROVIDER=entra to swap)
  data/
    types.ts            # PortalDataService, Contract, ClientProfile
    mock.ts             # MockDataService — hardcoded contracts/profile
    dataverse.ts        # stub — where the Dynamics/Dataverse Web API plugs in (TODO)
    index.ts            # selects data service (PORTAL_DATA=dataverse to swap)
src/middleware.ts       # protects /mon-portail/* (no session -> redirect to /mon-portail)
src/components/
  PortalLogin.astro     # shared, localized (FR/EN) login card used by both entries
src/pages/
  mon-portail/
    index.astro             # login entry FR (prerender = false)
    tableau-de-bord.astro   # protected dashboard (prerender = false)
  en/customer-portal/
    index.astro             # EN parallel of the login (prerender = false)
  auth/
    login.ts                # GET — starts sign-in (auth.login → 302 to IdP/mock)
    callback.astro          # OIDC redirect handler (prerender = false; mocked for now)
    logout.ts               # POST — clears session
docs/portail-auth.md    # this file
```

> Note: the original map listed `logout.astro / .ts`; it was implemented as a
> POST-only `logout.ts` endpoint (state-changing → not a GET link). A small
> `/auth/login` endpoint and a shared `PortalLogin.astro` component were added
> beyond the original sketch; the adapter is `@astrojs/cloudflare@12` (the Astro 5
> line — v14 requires Astro 7).

### AuthProvider interface (server-side)
```ts
export interface Session {
  user: { id: string; name: string; email: string };
  expiresAt: number;            // tokens stay server-side, never in this object client-side
}
export interface AuthProvider {
  login(opts: { returnTo?: string }): Promise<{ redirectUrl: string }>;
  handleCallback(request: Request): Promise<{ session: Session; setCookie: string }>;
  getSession(request: Request): Promise<Session | null>;
  logout(request: Request): Promise<{ redirectUrl: string; setCookie: string }>;
}
```
- **MockAuthProvider** — `login()` sets a signed mock cookie and redirects straight to the
  dashboard; `getSession()` reads it; `logout()` clears it. Runs with **no tenant/secrets**.
- **EntraAuthProvider** (stub) — `login()` builds the Entra authorize URL (PKCE);
  `handleCallback()` does the code exchange; both marked with `// TODO` for:
  `clientId`, `authority`/tenant (e.g. `https://<tenant>.ciamlogin.com/<tenant>.onmicrosoft.com`),
  `redirectUri` (`/auth/callback`), `scopes` (`openid profile email` + any API scope).

### PortalDataService interface
```ts
export interface Contract {
  numero: string; service: string; statut: 'Actif' | 'En renouvellement' | 'Expiré';
  dateDebut: string; dateRenouvellement: string;
}
export interface PortalDataService {
  getProfile(clientId: string): Promise<{ name: string }>;
  getContracts(clientId: string): Promise<Contract[]>;
}
```
- **MockDataService** returns a few hardcoded contracts.
- **dataverse.ts** stub documents where the real source plugs in (Dynamics/Dataverse Web API,
  or another backend) — authenticated server-side with the client's identity.

## 5. What to build (checklist)

1. [x] Add `@astrojs/cloudflare`; `adapter: cloudflare()`; keep `output: 'static'`.
2. [x] `src/lib/auth/` — `types.ts`, `mock.ts`, `entra.ts` (stub + TODOs), `index.ts`
       (+ `session-cookie.ts` for the signed httpOnly cookie).
3. [x] `/mon-portail` (+ `/en/customer-portal`) login page — branded, accessible
       (labels, focus, error states, brand panel); primary action calls
       `auth.login()` via `/auth/login` (mock = instant sign-in). `prerender = false`.
4. [x] `/auth/callback` — calls `auth.handleCallback()`, sets cookie, redirects (mocked).
5. [x] `src/middleware.ts` — guard `/mon-portail/*`: no session → redirect to `/mon-portail`.
6. [x] `/mon-portail/tableau-de-bord` — profile header + "Mes contrats" table from
       `PortalDataService` (mock). Sign-out action. `prerender = false`.
7. [x] Header nav: **"Mon portail"** → `/mon-portail` (replaced the placeholder button).
8. [x] Keep this doc current.

## 6. Two production paths (for stakeholders)

- **A. Custom Astro + Entra External ID + a data API** (this prototype's path). On-domain
  login, OIDC/PKCE to Entra, portal data from a Dataverse/Dynamics Web API (or other backend)
  called server-side. Full control of UX; static marketing stays static.
- **B. Power Pages + Dataverse** — if the client data already lives in Dynamics, Microsoft's
  Power Pages gives a Dataverse-native authenticated portal out of the box. Less custom UX,
  tighter Dynamics integration. Could live at `portail.victrix.ca` while the marketing site
  stays on Astro.

## 7. Mock → real swap points (small, clearly marked)

1. **Auth provider**: flip `src/lib/auth/index.ts` from `MockAuthProvider` to
   `EntraAuthProvider` and fill the Entra config (clientId / authority / redirectUri / scopes).
   Register the redirect URI in Entra; store secrets as Cloudflare env vars, never in the repo.
2. **Data service**: flip `src/lib/data/index.ts` from mock to `dataverse.ts`; implement the
   Web API calls + token acquisition.
3. **Session/cookies**: confirm httpOnly/Secure/SameSite, signing key in env, and refresh.
Everything else (routes, middleware, UI, the static marketing site) stays the same.

## 8. Security notes
- No passwords ever touch the Victrix domain — auth is delegated to the IdP.
- PKCE; no client secret in the browser. Tokens are server-side; the browser holds only an
  httpOnly session cookie. Validate `state`/`nonce`. Static marketing pages carry no auth code.
