/**
 * GET /auth/login — starts sign-in.
 *
 * Delegates to the active AuthProvider: real provider → 302 to the IdP authorize
 * endpoint (PKCE); mock → 302 to /auth/callback. Any PKCE/state cookie the
 * provider returns is set here before redirecting.
 */
import type { APIRoute } from 'astro';
import { auth } from '../../lib/auth';

// On-demand: this route needs the request and must not be prerendered.
export const prerender = false;

export const GET: APIRoute = async ({ url }) => {
  const returnTo = url.searchParams.get('returnTo') ?? '/mon-portail/tableau-de-bord';
  const { redirectUrl, setCookie } = await auth.login({ returnTo });

  const headers = new Headers({ Location: redirectUrl });
  if (setCookie) headers.append('Set-Cookie', setCookie);
  return new Response(null, { status: 302, headers });
};
