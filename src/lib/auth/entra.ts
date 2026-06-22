/**
 * EntraAuthProvider — STUB for Microsoft Entra External ID (CIAM).
 *
 * This is the real production target (the client runs on Microsoft/Dynamics).
 * The OIDC Authorization Code + PKCE *shape* is implemented here so going live
 * is a small, well-scoped change: fill the `ENTRA` config below, implement the
 * three `TODO(real)` blocks, then flip `src/lib/auth/index.ts` to this provider
 * (e.g. set `AUTH_PROVIDER=entra`). Nothing else in the app changes.
 *
 * Why this design (see docs/portail-auth.md §3):
 * - PKCE means NO client secret in the browser.
 * - The browser never sees tokens — after the code exchange we mint our OWN
 *   httpOnly session cookie (same `session-cookie.ts` helper the mock uses), so
 *   middleware + SSR can read the session without MSAL on the client.
 * - `state` + `nonce` are validated to stop CSRF / replay.
 */

import type { AuthProvider, Session } from './types';
import { readSession, clearSessionCookie, isSecureRequest } from './session-cookie';

/**
 * TODO(real): fill from the Entra External ID app registration. Store the
 * tenant/clientId as build/runtime env, NEVER hard-code secrets in the repo.
 * With PKCE there is no client secret for a public client.
 */
const ENTRA = {
  // e.g. "https://<tenant>.ciamlogin.com/<tenant>.onmicrosoft.com/v2.0"
  authority: '' /* TODO(real): Entra External ID authority */,
  clientId: '' /* TODO(real): application (client) id */,
  // Must exactly match a redirect URI registered in Entra.
  redirectUri: 'https://victrix-demo.pages.dev/auth/callback',
  // openid/profile/email for identity; add your API scope(s) for data calls.
  scopes: ['openid', 'profile', 'email'],
};

/** A short-lived httpOnly cookie holding the PKCE verifier + state + nonce. */
const PKCE_COOKIE = 'victrix_portal_pkce';

export class EntraAuthProvider implements AuthProvider {
  readonly name = 'entra';

  async login(opts: { returnTo?: string }): Promise<{ redirectUrl: string; setCookie: string }> {
    const codeVerifier = randomString(64);
    const codeChallenge = await s256Challenge(codeVerifier);
    const state = randomString(24);
    const nonce = randomString(24);

    const authorizeUrl = new URL(`${ENTRA.authority}/authorize`);
    authorizeUrl.search = new URLSearchParams({
      client_id: ENTRA.clientId,
      response_type: 'code',
      redirect_uri: ENTRA.redirectUri,
      response_mode: 'query',
      scope: ENTRA.scopes.join(' '),
      state,
      nonce,
      code_challenge: codeChallenge,
      code_challenge_method: 'S256',
    }).toString();

    // Persist what we need to validate/exchange on the callback (httpOnly).
    const pkcePayload = JSON.stringify({
      codeVerifier,
      state,
      nonce,
      returnTo: opts.returnTo ?? '/mon-portail/tableau-de-bord',
    });
    const setCookie =
      `${PKCE_COOKIE}=${btoa(pkcePayload)}; Path=/; HttpOnly; SameSite=Lax; Max-Age=600; Secure`;

    return { redirectUrl: authorizeUrl.toString(), setCookie };
  }

  async handleCallback(
    _request: Request,
  ): Promise<{ session: Session; setCookie: string; returnTo: string }> {
    // TODO(real): implement the Authorization Code + PKCE exchange:
    //   1. Read `${PKCE_COOKIE}` → { codeVerifier, state, nonce, returnTo }.
    //   2. Compare `state` to the `state` query param (reject on mismatch).
    //   3. POST to `${ENTRA.authority}/token` with:
    //        grant_type=authorization_code, code, redirect_uri, client_id,
    //        code_verifier  (no client secret — public PKCE client).
    //   4. Validate the id_token signature, issuer, audience, and `nonce`.
    //   5. Map id_token claims → Session.user; set expiresAt from token/our TTL.
    //   6. Mint our httpOnly session cookie via createSessionCookie(session, secure)
    //      and clear the PKCE cookie.
    //   Keep access/refresh tokens SERVER-SIDE (KV / encrypted) — never in Session.
    throw new Error(
      'EntraAuthProvider.handleCallback is not implemented yet. ' +
        'Fill the ENTRA config and the token-exchange TODO, then enable AUTH_PROVIDER=entra.',
    );
  }

  async getSession(request: Request): Promise<Session | null> {
    // Once handleCallback mints the same signed session cookie, this is enough.
    return readSession(request);
  }

  async logout(request: Request): Promise<{ redirectUrl: string; setCookie: string }> {
    // TODO(real): optionally redirect to the Entra end-session endpoint with
    // post_logout_redirect_uri so the IdP session is cleared too.
    return {
      redirectUrl: '/mon-portail',
      setCookie: clearSessionCookie(isSecureRequest(request)),
    };
  }
}

/* ---- PKCE helpers (Web Crypto; run in Workers + Node 18+) ----------------- */

function randomString(bytes: number): string {
  const buf = new Uint8Array(bytes);
  crypto.getRandomValues(buf);
  let s = '';
  for (const b of buf) s += (b % 36).toString(36);
  return s;
}

async function s256Challenge(verifier: string): Promise<string> {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(verifier));
  let binary = '';
  for (const b of new Uint8Array(digest)) binary += String.fromCharCode(b);
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}
