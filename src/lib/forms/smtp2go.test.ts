import { describe, it, expect, vi } from 'vitest';

import { sendEmail, type SendEmailInput } from './smtp2go';

const input: SendEmailInput = {
  apiKey: 'api-TEST',
  from: 'site@victrix.example',
  to: 'ventes@victrix.example',
  subject: 'Nouvelle soumission',
  textBody: 'nom : Gabrielle',
};

/** Stub fetch returning a canned JSON response (typed loosely on purpose). */
function fetchReturning(status: number, json: unknown): typeof fetch {
  return vi.fn(async () =>
    new Response(JSON.stringify(json), { status }),
  ) as unknown as typeof fetch;
}

describe('sendEmail', () => {
  it('POSTs the documented payload with the X-Smtp2go-Api-Key header', async () => {
    const fetchImpl = fetchReturning(200, { data: { succeeded: 1, failed: 0 } });
    await sendEmail(input, fetchImpl);

    const [url, init] = (fetchImpl as unknown as ReturnType<typeof vi.fn>).mock.calls[0] as [
      string,
      RequestInit,
    ];
    expect(url).toBe('https://api.smtp2go.com/v3/email/send');
    expect(init.method).toBe('POST');
    expect((init.headers as Record<string, string>)['X-Smtp2go-Api-Key']).toBe('api-TEST');
    expect(JSON.parse(String(init.body))).toEqual({
      sender: 'site@victrix.example',
      to: ['ventes@victrix.example'],
      subject: 'Nouvelle soumission',
      text_body: 'nom : Gabrielle',
    });
  });

  it('resolves ok on the documented success shape', async () => {
    const result = await sendEmail(input, fetchReturning(200, { data: { succeeded: 1 } }));
    expect(result).toEqual({ ok: true });
  });

  it('reports the API error message on the documented error shape', async () => {
    const result = await sendEmail(
      input,
      fetchReturning(400, { data: { error: 'You do not have permission', error_code: 'E_X' } }),
    );
    expect(result.ok).toBe(false);
    expect(result.error).toContain('permission');
  });

  it('reports a diagnostic when the body is not JSON', async () => {
    const fetchImpl = vi.fn(async () => new Response('<html>oops</html>', { status: 502 }));
    const result = await sendEmail(input, fetchImpl as unknown as typeof fetch);
    expect(result.ok).toBe(false);
    expect(result.error).toContain('502');
  });

  it('never throws — a network failure comes back as { ok: false }', async () => {
    const fetchImpl = vi.fn(async () => {
      throw new Error('ECONNRESET');
    });
    const result = await sendEmail(input, fetchImpl as unknown as typeof fetch);
    expect(result).toEqual({ ok: false, error: 'ECONNRESET' });
  });
});
