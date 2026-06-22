/**
 * Signed session-cookie helpers (framework-agnostic, runtime-agnostic).
 *
 * Uses the Web Crypto API (`crypto.subtle`), which is available BOTH in the
 * Cloudflare Workers runtime and in Node 18+ — so the same code runs in
 * `astro dev` and on Cloudflare Pages.
 *
 * The cookie value is `base64url(payload) + "." + base64url(HMAC-SHA256(payload))`.
 * The browser can read the payload but cannot forge it without the signing key,
 * and we never trust an unsigned/invalid cookie. The cookie itself is httpOnly,
 * so page JavaScript can't read it either.
 */

import type { Session } from './types';

export const SESSION_COOKIE = 'victrix_portal_session';

/**
 * Prototype signing key. In production this MUST come from a secret env var
 * (Cloudflare: `wrangler secret put PORTAL_SESSION_SECRET`), never the repo.
 * TODO(real): replace with `import.meta.env.PORTAL_SESSION_SECRET` (or the
 * Cloudflare runtime binding) and rotate periodically.
 */
const DEV_SIGNING_KEY = 'victrix-portal-demo-signing-key-not-for-production';

/** Default session lifetime: 8 hours. */
export const SESSION_TTL_MS = 8 * 60 * 60 * 1000;

const encoder = new TextEncoder();
const decoder = new TextDecoder();

function bytesToBase64Url(bytes: Uint8Array): string {
  let binary = '';
  for (const b of bytes) binary += String.fromCharCode(b);
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function base64UrlToBytes(value: string): Uint8Array {
  const padded = value.replace(/-/g, '+').replace(/_/g, '/').padEnd(
    value.length + ((4 - (value.length % 4)) % 4),
    '=',
  );
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

async function importKey(): Promise<CryptoKey> {
  return crypto.subtle.importKey(
    'raw',
    encoder.encode(DEV_SIGNING_KEY),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign', 'verify'],
  );
}

async function sign(payloadB64: string): Promise<string> {
  const key = await importKey();
  const sig = await crypto.subtle.sign('HMAC', key, encoder.encode(payloadB64));
  return bytesToBase64Url(new Uint8Array(sig));
}

/** Serialize + sign a session into a `Set-Cookie` header value. */
export async function createSessionCookie(session: Session, secure: boolean): Promise<string> {
  const payloadB64 = bytesToBase64Url(encoder.encode(JSON.stringify(session)));
  const signature = await sign(payloadB64);
  const value = `${payloadB64}.${signature}`;
  const maxAge = Math.max(0, Math.floor((session.expiresAt - Date.now()) / 1000));
  return cookieString(value, { maxAge, secure });
}

/** A `Set-Cookie` value that immediately clears the session. */
export function clearSessionCookie(secure: boolean): string {
  return cookieString('', { maxAge: 0, secure });
}

/** Read the session from a request's Cookie header. Null if missing/forged/expired. */
export async function readSession(request: Request): Promise<Session | null> {
  const raw = getCookie(request.headers.get('cookie'), SESSION_COOKIE);
  if (!raw) return null;

  const [payloadB64, signature] = raw.split('.');
  if (!payloadB64 || !signature) return null;

  const expected = await sign(payloadB64);
  if (!timingSafeEqual(signature, expected)) return null;

  try {
    const session = JSON.parse(decoder.decode(base64UrlToBytes(payloadB64))) as Session;
    if (!session?.expiresAt || session.expiresAt < Date.now()) return null;
    if (!session.user?.id) return null;
    return session;
  } catch {
    return null;
  }
}

/** Build a hardened `Set-Cookie` string. */
function cookieString(value: string, opts: { maxAge: number; secure: boolean }): string {
  const parts = [
    `${SESSION_COOKIE}=${value}`,
    'Path=/',
    'HttpOnly',
    'SameSite=Lax',
    `Max-Age=${opts.maxAge}`,
  ];
  // `Secure` is required in production (https). Dropped on plain-http localhost
  // so the cookie still works in `astro dev`.
  if (opts.secure) parts.push('Secure');
  return parts.join('; ');
}

/** Parse a single cookie value out of a Cookie header. */
function getCookie(header: string | null, name: string): string | null {
  if (!header) return null;
  for (const pair of header.split(';')) {
    const eq = pair.indexOf('=');
    if (eq === -1) continue;
    if (pair.slice(0, eq).trim() === name) return pair.slice(eq + 1).trim();
  }
  return null;
}

/** Constant-time-ish string compare to avoid signature timing leaks. */
function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

/** True when the request is https (so the `Secure` cookie attribute applies). */
export function isSecureRequest(request: Request): boolean {
  return new URL(request.url).protocol === 'https:';
}
