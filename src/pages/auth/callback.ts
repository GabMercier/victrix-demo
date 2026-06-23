/**
 * GET /auth/callback — the OIDC redirect target.
 *
 * An ENDPOINT (not a page) on purpose: under the "prefix both" i18n routing,
 * non-locale-prefixed *pages* are 404'd, but endpoints are served — and the IdP
 * redirect URI must be a single, locale-neutral URL anyway.
 *
 * On success: mint the session cookie and 302 to returnTo (the dashboard).
 * On failure: bounce back to the portal login with an error flag.
 */
import type { APIRoute } from 'astro';
import { auth } from '../../lib/auth';

export const prerender = false;

export const GET: APIRoute = async ({ request, url }) => {
  // An explicit IdP error (e.g. user cancelled) → back to login.
  if (url.searchParams.get('error')) {
    return redirect('/fr/portail?error=1');
  }
  try {
    const { setCookie, returnTo } = await auth.handleCallback(request);
    const headers = new Headers({ Location: returnTo });
    headers.append('Set-Cookie', setCookie);
    return new Response(null, { status: 302, headers });
  } catch (err) {
    console.error('[auth/callback]', err);
    return redirect('/fr/portail?error=1');
  }
};

function redirect(location: string): Response {
  return new Response(null, { status: 302, headers: { Location: location } });
}
