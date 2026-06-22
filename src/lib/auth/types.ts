/**
 * Auth contracts shared by every provider.
 *
 * The rest of the app (middleware, pages, routes) depends ONLY on these
 * interfaces — never on a concrete provider. Swapping the mock for real Entra
 * External ID is therefore a one-line change in `./index.ts`, plus filling the
 * Entra config. See docs/portail-auth.md §7 ("Mock → real swap points").
 *
 * Design notes:
 * - Tokens NEVER live in `Session` on the client. The browser only ever holds
 *   an httpOnly session cookie; access/refresh tokens stay server-side.
 * - Providers are framework-agnostic: they take a standard `Request` and return
 *   `Set-Cookie` strings, so they can be unit-tested and reused outside Astro.
 */

export interface SessionUser {
  id: string;
  name: string;
  email: string;
}

export interface Session {
  user: SessionUser;
  /** Expiry as epoch milliseconds. */
  expiresAt: number;
}

export interface AuthProvider {
  /** Human-readable id, handy for diagnostics/logging (e.g. "mock", "entra"). */
  readonly name: string;

  /**
   * Begin sign-in. Returns the URL to redirect the browser to:
   * - real IdP: the OIDC `authorize` endpoint (with PKCE challenge, state, nonce);
   * - mock: straight to `/auth/callback` so the same callback flow is exercised.
   *
   * `setCookie` is optional and used by real providers to persist the short-lived
   * PKCE `code_verifier` + `state`/`nonce` (httpOnly) until the callback.
   */
  login(opts: { returnTo?: string }): Promise<{ redirectUrl: string; setCookie?: string }>;

  /**
   * Handle the IdP redirect back to `/auth/callback`: validate state, exchange
   * the code for tokens (PKCE), then mint our own session cookie. Returns the
   * session, the `Set-Cookie` header value, and where to send the user next.
   */
  handleCallback(
    request: Request,
  ): Promise<{ session: Session; setCookie: string; returnTo: string }>;

  /** Read + validate the session cookie from the request. Null if absent/invalid/expired. */
  getSession(request: Request): Promise<Session | null>;

  /** Clear the session (and, for real providers, optionally hit the IdP end-session endpoint). */
  logout(request: Request): Promise<{ redirectUrl: string; setCookie: string }>;
}
