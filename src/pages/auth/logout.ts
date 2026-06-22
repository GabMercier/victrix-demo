/**
 * POST /auth/logout — ends the session.
 *
 * POST (not GET) so it can't be triggered by a prefetch, link crawler, or
 * <img> tag. The dashboard sign-out control is a small POST form.
 */
import type { APIRoute } from 'astro';
import { auth } from '../../lib/auth';

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  const { redirectUrl, setCookie } = await auth.logout(request);
  const headers = new Headers({ Location: redirectUrl });
  headers.append('Set-Cookie', setCookie);
  return new Response(null, { status: 302, headers });
};
