/**
 * MockAuthProvider — a zero-secret stand-in for the real IdP.
 *
 * It runs the SAME redirect→callback→session-cookie flow as a real OIDC
 * provider, so the routes, middleware, and UI are exercised exactly as they
 * will be in production — only the "authenticate at the IdP" step is faked:
 *
 *   login()          → redirect to /auth/callback?provider=mock  (no real IdP hop)
 *   handleCallback() → mint a fake-but-signed session cookie
 *   getSession()     → verify + read that cookie
 *   logout()         → clear it
 *
 * To go live, flip `src/lib/auth/index.ts` to the Entra provider (see entra.ts).
 */

import type { AuthProvider, Session } from './types';
import {
  SESSION_TTL_MS,
  createSessionCookie,
  clearSessionCookie,
  readSession,
  isSecureRequest,
} from './session-cookie';

/** The demo client every mock sign-in becomes. */
const DEMO_USER = {
  id: 'demo-client-001',
  name: 'Camille Tremblay',
  email: 'camille.tremblay@ville-saint-aubin.qc.ca',
} as const;

const DASHBOARD = '/mon-portail/tableau-de-bord';

/** Keep redirect targets local (open-redirect guard) — only same-site paths. */
function safeReturnTo(value: string | null | undefined): string {
  if (value && value.startsWith('/') && !value.startsWith('//')) return value;
  return DASHBOARD;
}

export class MockAuthProvider implements AuthProvider {
  readonly name = 'mock';

  async login(opts: { returnTo?: string }): Promise<{ redirectUrl: string }> {
    // A real provider would build the IdP authorize URL here. The mock skips the
    // IdP entirely and bounces straight to our callback, preserving returnTo.
    const params = new URLSearchParams({
      provider: 'mock',
      returnTo: safeReturnTo(opts.returnTo),
    });
    return { redirectUrl: `/auth/callback?${params.toString()}` };
  }

  async handleCallback(
    request: Request,
  ): Promise<{ session: Session; setCookie: string; returnTo: string }> {
    const url = new URL(request.url);
    const returnTo = safeReturnTo(url.searchParams.get('returnTo'));

    const session: Session = {
      user: { ...DEMO_USER },
      expiresAt: Date.now() + SESSION_TTL_MS,
    };
    const setCookie = await createSessionCookie(session, isSecureRequest(request));
    return { session, setCookie, returnTo };
  }

  async getSession(request: Request): Promise<Session | null> {
    return readSession(request);
  }

  async logout(request: Request): Promise<{ redirectUrl: string; setCookie: string }> {
    return {
      redirectUrl: '/mon-portail',
      setCookie: clearSessionCookie(isSecureRequest(request)),
    };
  }
}
