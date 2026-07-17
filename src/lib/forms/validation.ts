/**
 * Forms — pure validation logic for POST /api/forms (contract « formulaires »).
 *
 * Deliberately framework-free (no Astro imports, no fetch): everything here is
 * a pure function over parsed form fields, so it unit-tests in a plain node
 * environment (see validation.test.ts) and runs identically in workerd
 * (Cloudflare Pages Function) and in `astro dev`.
 *
 * The submitting <form> is CMS-defined (the Bookshop « form » section), so the
 * server cannot hard-code a field list. The wire contract with the form
 * component (documented in docs/formulaires.md) is:
 *   - hidden `lang`   — "fr" | "en" (anything else falls back to "fr")
 *   - hidden `source` — path of the page hosting the form (redirect target on
 *     validation failure); sanitized here against open redirects
 *   - hidden `website` — HONEYPOT. Humans never see it; bots fill it. A filled
 *     honeypot is reported as `spam: true` and the endpoint pretends success.
 *   - hidden `_requis` (optional) — comma-separated names of required fields;
 *     each must be non-empty after trim
 *   - hidden `_courriels` (optional) — comma-separated names of email fields;
 *     additionally, any field whose NAME contains "email"/"courriel" is treated
 *     as an email field (heuristic fallback when `_requis`/`_courriels` are
 *     absent — the endpoint must stay safe even if the form omits them)
 *   - `cf-turnstile-response` — the Turnstile token (verified elsewhere;
 *     treated as a meta field here so it never leaks into the message body)
 */

/** Honeypot field name — a bot-bait "website" input humans never fill. */
export const HONEYPOT_FIELD = 'website';

/** Optional hidden field: comma-separated names of required fields. */
export const REQUIRED_LIST_FIELD = '_requis';

/** Optional hidden field: comma-separated names of email fields. */
export const EMAIL_LIST_FIELD = '_courriels';

/** Turnstile's auto-injected hidden input (see docs/formulaires.md). */
export const TURNSTILE_TOKEN_FIELD = 'cf-turnstile-response';

/**
 * Optional hidden field: id of a form DEFINITION from src/data/forms/ (« forms
 * v2 »). When present, /api/forms resolves recipient/subject/field lists from
 * the build-embedded registry (src/lib/forms/registry.ts) — never from the
 * client — and an unknown id is a validation failure.
 */
export const FORM_ID_FIELD = '_formId';

/**
 * Plumbing fields — never part of the visitor's message. Everything else in
 * the payload is user content and lands in the notification email.
 */
export const META_FIELDS: ReadonlySet<string> = new Set([
  'lang',
  'source',
  HONEYPOT_FIELD,
  REQUIRED_LIST_FIELD,
  EMAIL_LIST_FIELD,
  TURNSTILE_TOKEN_FIELD,
  FORM_ID_FIELD,
]);

/** Hard limits (contract): total payload < 25 KB, each value < 5000 chars. */
export const MAX_PAYLOAD_BYTES = 25 * 1024;
export const MAX_VALUE_LENGTH = 5000;

/**
 * RFC-*basic* email shape: something@something.tld, no whitespace. Full RFC
 * 5322 validation is a fool's errand — the goal is only to catch obvious typos
 * and garbage before an email is fired off.
 */
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export type FormLang = 'fr' | 'en';

/** Parsed fields: name → value (repeated names joined, see parseFormBody). */
export type SubmissionFields = Record<string, string>;

export type ValidationResult =
  | {
      ok: true;
      /** true = honeypot tripped: pretend success upstream, send nothing. */
      spam: boolean;
      /** User-content fields only (meta fields stripped), ready for the email. */
      data: SubmissionFields;
    }
  | {
      ok: false;
      /** Machine-readable reasons — for server logs, never shown to visitors. */
      errors: string[];
    };

/**
 * Parse an application/x-www-form-urlencoded body into a name → value map.
 * Repeated names (radio groups can't, but checkbox groups can) are joined with
 * ", " so no submitted value is silently dropped.
 */
export function parseFormBody(body: string): SubmissionFields {
  const fields: SubmissionFields = {};
  for (const [name, value] of new URLSearchParams(body)) {
    fields[name] = name in fields ? `${fields[name]}, ${value}` : value;
  }
  return fields;
}

/** "fr" | "en", anything else (missing, tampered) falls back to "fr". */
export function sanitizeLang(value: string | undefined): FormLang {
  return value === 'en' ? 'en' : 'fr';
}

/**
 * Sanitize the `source` hidden field into a safe same-site redirect target.
 * The value round-trips through the visitor's browser, so treat it as hostile:
 *   - must start with "/" but not "//" ("//evil.com" is protocol-relative and
 *     would leave the site — the classic open-redirect footgun)
 *   - must not contain a backslash ANYWHERE: browsers normalize "\" to "/"
 *     while resolving a Location header, so "/\evil.com" navigates off-site
 *     exactly like "//evil.com" does (WHATWG URL — empirically:
 *     new URL('/\\evil.com?erreur=1', base).href === 'https://evil.com/?erreur=1')
 *   - query/fragment are stripped (the endpoint appends its own "?erreur=1")
 * Anything unusable falls back to the locale home.
 */
export function sanitizeSourcePath(value: string | undefined, lang: FormLang): string {
  const fallback = `/${lang}/`;
  if (!value || !value.startsWith('/') || value.startsWith('//') || value.includes('\\')) {
    return fallback;
  }
  const path = value.split(/[?#]/, 1)[0];
  // Belt and braces: only path characters survive — 0x5c (backslash) is carved
  // out of the printable-ASCII range (see the open-redirect note above), and
  // CR/LF header tricks never match (the Fetch API would reject them in a
  // Location header, but never rely on it).
  if (!/^\/[\x21-\x5b\x5d-\x7e]*$/.test(path)) return fallback;
  return path;
}

/** Split a comma-separated hidden-field value into trimmed, non-empty names. */
function parseNameList(value: string | undefined): string[] {
  if (!value) return [];
  return value
    .split(',')
    .map((name) => name.trim())
    .filter((name) => name.length > 0);
}

/** Heuristic: a field name that *looks* like an email field is treated as one. */
function looksLikeEmailField(name: string): boolean {
  const lower = name.toLowerCase();
  return lower.includes('email') || lower.includes('courriel');
}

/**
 * Validate a parsed submission (contract order — cheapest checks first):
 *   1. honeypot filled → ok + spam (the endpoint pretends success, sends nothing)
 *   2. size limits — each value < 5000 chars, total < 25 KB (the endpoint also
 *      rejects oversized RAW bodies before parsing; this re-check keeps the
 *      pure function safe on its own)
 *   3. required fields (`_requis` list) non-empty after trim
 *   4. at least one user-content field non-empty — a completely empty
 *      submission is never a legitimate message
 *   5. email fields (`_courriels` list + name heuristic) match the basic RFC
 *      shape when non-empty (emptiness is the *required* check's business)
 */
export function validateSubmission(fields: SubmissionFields): ValidationResult {
  // 1. Honeypot — report as spam; the caller pretends success and does nothing.
  if ((fields[HONEYPOT_FIELD] ?? '').trim() !== '') {
    return { ok: true, spam: true, data: {} };
  }

  const errors: string[] = [];

  // 2. Size limits.
  let totalBytes = 0;
  for (const [name, value] of Object.entries(fields)) {
    totalBytes += name.length + value.length;
    if (value.length >= MAX_VALUE_LENGTH) {
      errors.push(`champ trop long: ${name}`);
    }
  }
  if (totalBytes >= MAX_PAYLOAD_BYTES) {
    errors.push('charge utile trop volumineuse');
  }

  // 3. Required fields — declared by the form via `_requis`.
  for (const name of parseNameList(fields[REQUIRED_LIST_FIELD])) {
    if ((fields[name] ?? '').trim() === '') {
      errors.push(`champ requis manquant: ${name}`);
    }
  }

  // 4. Empty-submission guard — independent of `_requis` so the endpoint stays
  // meaningful even when the form doesn't declare its required fields.
  const hasContent = Object.entries(fields).some(
    ([name, value]) => !META_FIELDS.has(name) && value.trim() !== '',
  );
  if (!hasContent) {
    errors.push('soumission vide');
  }

  // 5. Email shape — declared fields + heuristic on the name.
  const emailFields = new Set(parseNameList(fields[EMAIL_LIST_FIELD]));
  for (const name of Object.keys(fields)) {
    if (META_FIELDS.has(name)) continue;
    if (!emailFields.has(name) && !looksLikeEmailField(name)) continue;
    const value = (fields[name] ?? '').trim();
    if (value !== '' && !EMAIL_RE.test(value)) {
      errors.push(`courriel invalide: ${name}`);
    }
  }

  if (errors.length > 0) return { ok: false, errors };

  // Strip the plumbing — only user content reaches the notification email.
  const data: SubmissionFields = {};
  for (const [name, value] of Object.entries(fields)) {
    if (!META_FIELDS.has(name)) data[name] = value;
  }
  return { ok: true, spam: false, data };
}

/**
 * Render the notification email's plain-text body. Pure string work — the same
 * output is logged in demo mode and sent via SMTP2GO in production, so what
 * you see in the logs is exactly what the inbox would receive.
 */
export function formatSubmissionText(
  data: SubmissionFields,
  meta: { lang: FormLang; source: string },
): string {
  const lines = [
    `Nouvelle soumission de formulaire — victrix (${meta.lang})`,
    `Page source : ${meta.source}`,
    '',
    ...Object.entries(data).map(([name, value]) => `${name} : ${value}`),
  ];
  return lines.join('\n');
}
