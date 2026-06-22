/**
 * Route guard for the client portal.
 *
 * Marketing/static pages: this middleware is a no-op (it runs at build time for
 * prerendered pages, but only acts on the protected subtree, so it never
 * touches them). Portal pages render on demand, so this runs at request time on
 * Cloudflare and enforces auth before the page renders.
 *
 * Protected:  /mon-portail/*   (e.g. the dashboard)
 * Public:     /mon-portail      (the login entry itself) + everything else
 */

import { defineMiddleware } from 'astro:middleware';
import { auth } from './lib/auth';

export const onRequest = defineMiddleware(async (context, next) => {
  // Normalize: drop a trailing slash so '/mon-portail/' matches the login entry.
  const path = context.url.pathname.replace(/\/+$/, '') || '/';

  // The login entry is public; only its sub-routes require a session.
  const isProtected = path.startsWith('/mon-portail/');
  if (!isProtected) return next();

  const session = await auth.getSession(context.request);
  if (!session) {
    const returnTo = encodeURIComponent(context.url.pathname + context.url.search);
    return context.redirect(`/mon-portail?returnTo=${returnTo}`);
  }

  // Expose the session to the page so it doesn't re-read the cookie.
  context.locals.session = session;
  return next();
});
