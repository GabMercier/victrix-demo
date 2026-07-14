/**
 * Cloudflare Turnstile — server-side token verification (siteverify).
 *
 * The widget (rendered by the form component when PUBLIC_TURNSTILE_SITE_KEY is
 * set) injects a hidden `cf-turnstile-response` input; this module validates
 * that token against Cloudflare. Docs facts baked in:
 *   - endpoint: POST https://challenges.cloudflare.com/turnstile/v0/siteverify
 *   - params: secret (required), response (required), remoteip (optional) —
 *     sent as form data
 *   - response: { success: boolean, "error-codes": [...] , … }
 *   - each token verifies ONCE — a replay comes back as `timeout-or-duplicate`
 *
 * Testing keys (any domain, incl. localhost — see docs/formulaires.md):
 *   secret 1x0000000000000000000000000000000AA → always passes
 *   secret 2x0000000000000000000000000000000AA → always fails
 *   secret 3x0000000000000000000000000000000AA → "token already spent"
 *
 * Never throws; failure modes come back as { ok: false, … }. A siteverify
 * NETWORK failure is reported as a failure too (fail closed): the visitor can
 * resubmit, whereas failing open would let bots through whenever Cloudflare
 * hiccups — the wrong trade for an anti-spam control.
 */

const SITEVERIFY_ENDPOINT = 'https://challenges.cloudflare.com/turnstile/v0/siteverify';

export interface VerifyTokenResult {
  ok: boolean;
  /** Cloudflare `error-codes` (or a transport diagnostic) — for server logs. */
  errorCodes?: string[];
}

/**
 * Verify one Turnstile token. `remoteIp` (the `CF-Connecting-IP` header on
 * Pages) is optional but tightens the check. `fetchImpl` is injectable for
 * unit tests, like the SMTP2GO client.
 */
export async function verifyTurnstileToken(
  secret: string,
  token: string,
  remoteIp?: string,
  fetchImpl: typeof fetch = fetch,
): Promise<VerifyTokenResult> {
  // No token at all (widget bypassed / JS stripped) — no point calling out.
  if (!token) return { ok: false, errorCodes: ['missing-input-response'] };

  try {
    const body = new URLSearchParams({ secret, response: token });
    if (remoteIp) body.set('remoteip', remoteIp);

    const response = await fetchImpl(SITEVERIFY_ENDPOINT, { method: 'POST', body });
    const payload = (await response.json().catch(() => null)) as {
      success?: boolean;
      'error-codes'?: string[];
    } | null;

    if (payload?.success === true) return { ok: true };
    return { ok: false, errorCodes: payload?.['error-codes'] ?? [`HTTP ${response.status}`] };
  } catch (err) {
    return {
      ok: false,
      errorCodes: [err instanceof Error ? err.message : String(err)],
    };
  }
}
