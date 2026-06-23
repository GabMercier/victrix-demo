import { describe, it, expect } from 'vitest';
import { createSessionCookie, readSession, clearSessionCookie } from './session-cookie';
import type { Session } from './types';

const baseSession: Session = {
  user: { id: 'demo-1', name: 'Test Client', email: 'test@example.qc.ca' },
  expiresAt: Date.now() + 60_000,
};

/** Turn a `Set-Cookie` value into a request carrying that cookie. */
function requestWith(setCookie: string): Request {
  const pair = setCookie.split(';')[0]; // "name=value"
  return new Request('https://victrix.test/', { headers: { cookie: pair } });
}

describe('session-cookie', () => {
  it('round-trips a valid signed session', async () => {
    const setCookie = await createSessionCookie(baseSession, true);
    const session = await readSession(requestWith(setCookie));
    expect(session?.user.id).toBe('demo-1');
    expect(session?.user.email).toBe('test@example.qc.ca');
  });

  it('rejects a tampered signature', async () => {
    const setCookie = await createSessionCookie(baseSession, true);
    const pair = setCookie.split(';')[0];
    const tampered = pair.slice(0, -4) + (pair.endsWith('aaaa') ? 'bbbb' : 'aaaa');
    const session = await readSession(
      new Request('https://victrix.test/', { headers: { cookie: tampered } }),
    );
    expect(session).toBeNull();
  });

  it('rejects an expired session', async () => {
    const setCookie = await createSessionCookie(
      { ...baseSession, expiresAt: Date.now() - 1000 },
      true,
    );
    expect(await readSession(requestWith(setCookie))).toBeNull();
  });

  it('returns null when no cookie is present', async () => {
    expect(await readSession(new Request('https://victrix.test/'))).toBeNull();
  });

  it('clear cookie expires immediately', () => {
    expect(clearSessionCookie(true)).toContain('Max-Age=0');
  });

  it('omits Secure on non-secure (localhost dev) cookies', async () => {
    const setCookie = await createSessionCookie(baseSession, false);
    expect(setCookie).not.toContain('Secure');
    expect(setCookie).toContain('HttpOnly');
  });
});
