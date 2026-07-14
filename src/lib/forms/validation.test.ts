import { describe, it, expect } from 'vitest';

import {
  parseFormBody,
  sanitizeLang,
  sanitizeSourcePath,
  validateSubmission,
  formatSubmissionText,
  MAX_VALUE_LENGTH,
  MAX_PAYLOAD_BYTES,
} from './validation';

// Convenience: a minimally-valid submission the individual tests mutate.
// (lang/source/website are meta fields; message is the user content.)
function baseFields(overrides: Record<string, string> = {}): Record<string, string> {
  return {
    lang: 'fr',
    source: '/fr/campagnes/audit-securite',
    website: '', // honeypot, empty = human
    message: 'Bonjour, j’aimerais un audit.',
    ...overrides,
  };
}

describe('parseFormBody', () => {
  it('parses urlencoded pairs into a name → value map', () => {
    expect(parseFormBody('a=1&b=deux%20trois')).toEqual({ a: '1', b: 'deux trois' });
  });
  it('joins repeated names (checkbox groups) instead of dropping values', () => {
    expect(parseFormBody('interet=cloud&interet=securite')).toEqual({
      interet: 'cloud, securite',
    });
  });
  it('returns an empty object for an empty body', () => {
    expect(parseFormBody('')).toEqual({});
  });
});

describe('sanitizeLang', () => {
  it('accepts the two locales', () => {
    expect(sanitizeLang('fr')).toBe('fr');
    expect(sanitizeLang('en')).toBe('en');
  });
  it('falls back to fr for anything else (missing or tampered)', () => {
    expect(sanitizeLang(undefined)).toBe('fr');
    expect(sanitizeLang('de')).toBe('fr');
    expect(sanitizeLang('EN')).toBe('fr');
  });
});

describe('sanitizeSourcePath', () => {
  it('keeps a plain same-site path', () => {
    expect(sanitizeSourcePath('/fr/campagnes/audit', 'fr')).toBe('/fr/campagnes/audit');
  });
  it('strips query and fragment (the endpoint appends its own ?erreur=1)', () => {
    expect(sanitizeSourcePath('/fr/contact?x=1#form', 'fr')).toBe('/fr/contact');
  });
  it('rejects absolute URLs and protocol-relative open redirects', () => {
    expect(sanitizeSourcePath('https://evil.example', 'fr')).toBe('/fr/');
    expect(sanitizeSourcePath('//evil.example/path', 'en')).toBe('/en/');
  });
  it('rejects backslash open redirects (browsers normalize "\\" to "/")', () => {
    // new URL('/\\evil.example', base) resolves to https://evil.example/ —
    // the backslash twin of the protocol-relative "//" case above.
    expect(sanitizeSourcePath('/\\evil.example', 'fr')).toBe('/fr/');
    expect(sanitizeSourcePath('/\\/evil.example', 'en')).toBe('/en/');
    expect(sanitizeSourcePath('/fr/page\\evil.example', 'fr')).toBe('/fr/');
  });
  it('falls back to the locale home when missing or malformed', () => {
    expect(sanitizeSourcePath(undefined, 'en')).toBe('/en/');
    expect(sanitizeSourcePath('relative/path', 'fr')).toBe('/fr/');
    expect(sanitizeSourcePath('/fr/bad\npath', 'fr')).toBe('/fr/');
  });
});

describe('validateSubmission — honeypot', () => {
  it('reports spam (ok, no data) when the honeypot is filled', () => {
    const result = validateSubmission(baseFields({ website: 'https://spam.example' }));
    expect(result).toEqual({ ok: true, spam: true, data: {} });
  });
  it('ignores a whitespace-only honeypot (autofill artefacts)', () => {
    const result = validateSubmission(baseFields({ website: '  ' }));
    expect(result.ok).toBe(true);
    expect(result.ok && result.spam).toBe(false);
  });
});

describe('validateSubmission — required fields (_requis)', () => {
  it('fails when a declared required field is missing or blank', () => {
    for (const fields of [
      baseFields({ _requis: 'nom' }), // absent
      baseFields({ _requis: 'nom', nom: '' }), // empty
      baseFields({ _requis: 'nom', nom: '   ' }), // whitespace only
    ]) {
      const result = validateSubmission(fields);
      expect(result.ok).toBe(false);
      expect(!result.ok && result.errors.join()).toContain('nom');
    }
  });
  it('passes when all declared required fields are filled', () => {
    const result = validateSubmission(
      baseFields({ _requis: 'nom, message', nom: 'Gabrielle' }),
    );
    expect(result.ok).toBe(true);
  });
});

describe('validateSubmission — empty submission guard', () => {
  it('fails when no user-content field carries anything', () => {
    const result = validateSubmission({
      lang: 'fr',
      source: '/fr/',
      website: '',
      message: '   ',
    });
    expect(result.ok).toBe(false);
  });
});

describe('validateSubmission — email fields', () => {
  it('fails on a malformed value in a field named like an email', () => {
    for (const bad of ['pas-un-courriel', 'a@b', 'a b@c.d', '@c.d']) {
      const result = validateSubmission(baseFields({ email: bad }));
      expect(result.ok).toBe(false);
    }
  });
  it('accepts a basic well-formed address (email/courriel heuristic)', () => {
    expect(validateSubmission(baseFields({ email: 'a@b.ca' })).ok).toBe(true);
    expect(validateSubmission(baseFields({ courriel: 'x.y@z.example' })).ok).toBe(true);
  });
  it('validates fields declared via _courriels even with an opaque name', () => {
    const result = validateSubmission(
      baseFields({ _courriels: 'lp-form-contact-1', 'lp-form-contact-1': 'invalide' }),
    );
    expect(result.ok).toBe(false);
  });
  it('leaves emptiness to the required check (empty email field passes)', () => {
    expect(validateSubmission(baseFields({ email: '' })).ok).toBe(true);
  });
});

describe('validateSubmission — size limits', () => {
  it(`fails when one value reaches ${MAX_VALUE_LENGTH} chars`, () => {
    const result = validateSubmission(baseFields({ message: 'x'.repeat(MAX_VALUE_LENGTH) }));
    expect(result.ok).toBe(false);
  });
  it('accepts a value just under the limit', () => {
    const result = validateSubmission(
      baseFields({ message: 'x'.repeat(MAX_VALUE_LENGTH - 1) }),
    );
    expect(result.ok).toBe(true);
  });
  it(`fails when the total payload reaches ${MAX_PAYLOAD_BYTES} bytes`, () => {
    // Six fields under the per-value cap that together cross the total cap.
    const fields = baseFields();
    for (let i = 0; i < 6; i++) fields[`champ${i}`] = 'x'.repeat(MAX_VALUE_LENGTH - 1);
    expect(validateSubmission(fields).ok).toBe(false);
  });
});

describe('validateSubmission — data extraction', () => {
  it('strips meta fields, keeps user content', () => {
    const result = validateSubmission(
      baseFields({
        'cf-turnstile-response': 'XXXX.DUMMY.TOKEN.XXXX',
        _requis: 'message',
        nom: 'Gabrielle',
      }),
    );
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.data).toEqual({
        message: 'Bonjour, j’aimerais un audit.',
        nom: 'Gabrielle',
      });
    }
  });
});

describe('formatSubmissionText', () => {
  it('renders the source page, locale, and every field on its own line', () => {
    const text = formatSubmissionText(
      { nom: 'Gabrielle', message: 'Allô' },
      { lang: 'fr', source: '/fr/contact' },
    );
    expect(text).toContain('(fr)');
    expect(text).toContain('Page source : /fr/contact');
    expect(text).toContain('nom : Gabrielle');
    expect(text).toContain('message : Allô');
  });
});
