/**
 * POST /auth/logout — ends the session.
 *
 * POST (not GET) so it can't be triggered by a prefetch, link crawler, or
 * <img> tag. The dashboard sign-out control is a small POST form.
 */
import type { APIRoute } from 'astro';
import { auth } from '../../lib/auth';

export const prerender = false;

export const POST: APIRoute = async ({ request, url }) => {
  const { setCookie } = await auth.logout(request);
  // Return to the portal login in the user's language (dashboard form passes ?lang).
  const lang = url.searchParams.get('lang') === 'en' ? 'en' : 'fr';
  const headers = new Headers({ Location: `/${lang}/portail` });
  headers.append('Set-Cookie', setCookie);
  return new Response(null, { status: 302, headers });
};
