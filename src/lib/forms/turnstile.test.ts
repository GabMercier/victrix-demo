import { describe, it, expect, vi } from 'vitest';

import { verifyTurnstileToken } from './turnstile';

/** Stub fetch returning a canned siteverify response. */
function fetchReturning(status: number, json: unknown): typeof fetch {
  return vi.fn(async () =>
    new Response(JSON.stringify(json), { status }),
  ) as unknown as typeof fetch;
}

describe('verifyTurnstileToken', () => {
  it('POSTs secret + response (+ remoteip) to siteverify as form data', async () => {
    const fetchImpl = fetchReturning(200, { success: true });
    await verifyTurnstileToken('SECRET', 'TOKEN', '203.0.113.7', fetchImpl);

    const [url, init] = (fetchImpl as unknown as ReturnType<typeof vi.fn>).mock.calls[0] as [
      string,
      RequestInit,
    ];
    expect(url).toBe('https://challenges.cloudflare.com/turnstile/v0/siteverify');
    const body = init.body as URLSearchParams;
    expect(body.get('secret')).toBe('SECRET');
    expect(body.get('response')).toBe('TOKEN');
    expect(body.get('remoteip')).toBe('203.0.113.7');
  });

  it('passes on { success: true }', async () => {
    const result = await verifyTurnstileToken('S', 'T', undefined, fetchReturning(200, { success: true }));
    expect(result.ok).toBe(true);
  });

  it('fails with the error codes on { success: false }', async () => {
    const result = await verifyTurnstileToken(
      'S',
      'T',
      undefined,
      fetchReturning(200, { success: false, 'error-codes': ['timeout-or-duplicate'] }),
    );
    expect(result).toEqual({ ok: false, errorCodes: ['timeout-or-duplicate'] });
  });

  it('short-circuits without a network call when the token is missing', async () => {
    const fetchImpl = fetchReturning(200, { success: true });
    const result = await verifyTurnstileToken('S', '', undefined, fetchImpl);
    expect(result.ok).toBe(false);
    expect((fetchImpl as unknown as ReturnType<typeof vi.fn>).mock.calls).toHaveLength(0);
  });

  it('fails CLOSED on a network failure (bots must not ride outages)', async () => {
    const fetchImpl = vi.fn(async () => {
      throw new Error('ENETUNREACH');
    });
    const result = await verifyTurnstileToken('S', 'T', undefined, fetchImpl as unknown as typeof fetch);
    expect(result.ok).toBe(false);
    expect(result.errorCodes).toEqual(['ENETUNREACH']);
  });
});
