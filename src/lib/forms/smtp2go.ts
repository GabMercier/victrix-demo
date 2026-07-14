/**
 * SMTP2GO client — the ONLY place that knows how to talk to SMTP2GO.
 *
 * Isolated from the endpoint so it is trivially mockable (unit tests inject
 * `fetchImpl`; the endpoint mocks this whole module). Uses the current
 * documented API surface (developers.smtp2go.com):
 *   - POST https://api.smtp2go.com/v3/email/send
 *   - auth via the `X-Smtp2go-Api-Key` header (NOT the legacy `api_key` body
 *     field)
 *   - required payload: sender (string), to (array of strings), subject;
 *     text_body carries the message (no HTML — a plain-text notification
 *     cannot be used for content injection)
 *
 * Gotchas (provisioning notes in docs/formulaires.md):
 *   - `sender` must be a VERIFIED sender/domain in the SMTP2GO account,
 *     otherwise sends are rejected.
 *   - Free plan: 1 000 emails/month, 200/day, 25/hour until the sender domain
 *     is verified — fine for a contact form, but a reason the endpoint treats
 *     a failed send as an ops problem (log) rather than a visitor error.
 *
 * Never throws: network/API failures come back as { ok: false, error } so the
 * caller can decide what the visitor sees (never a raw HTML error page).
 */

const SEND_ENDPOINT = 'https://api.smtp2go.com/v3/email/send';

export interface SendEmailInput {
  /** SMTP2GO API key (`api-…`) — from the runtime env, never hard-coded. */
  apiKey: string;
  /** Verified sender address (FORMS_FROM_EMAIL). */
  from: string;
  /** Notification recipient (FORMS_TO_EMAIL). */
  to: string;
  subject: string;
  /** Plain-text body (see formatSubmissionText in validation.ts). */
  textBody: string;
}

export interface SendEmailResult {
  ok: boolean;
  /** Diagnostic for server logs — never surfaced to the visitor. */
  error?: string;
}

/**
 * Send one plain-text email. `fetchImpl` defaults to the global fetch
 * (available in workerd, `astro dev`, and Node 18+) and exists purely so unit
 * tests can stub the network without patching globals.
 */
export async function sendEmail(
  input: SendEmailInput,
  fetchImpl: typeof fetch = fetch,
): Promise<SendEmailResult> {
  try {
    const response = await fetchImpl(SEND_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Smtp2go-Api-Key': input.apiKey,
      },
      body: JSON.stringify({
        sender: input.from,
        to: [input.to],
        subject: input.subject,
        text_body: input.textBody,
      }),
    });

    // Success shape: { request_id, data: { succeeded: 1, failed: 0, … } }.
    // Error shape (HTTP 4xx): { request_id, data: { error, error_code } }.
    const payload = (await response.json().catch(() => null)) as {
      data?: { succeeded?: number; error?: string; error_code?: string };
    } | null;

    if (response.ok && (payload?.data?.succeeded ?? 0) >= 1) {
      return { ok: true };
    }
    return {
      ok: false,
      error:
        payload?.data?.error ??
        payload?.data?.error_code ??
        `SMTP2GO HTTP ${response.status}`,
    };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : String(err) };
  }
}
