import { describe, it, expect, vi } from 'vitest';

// blog.ts imports `getCollection` from the `astro:content` virtual module, which
// only exists inside Astro's build pipeline. Stub it so the pure helpers can be
// unit-tested in a plain node environment (getPostsByLocale isn't exercised here).
vi.mock('astro:content', () => ({ getCollection: async () => [] }));

import {
  postLocale,
  postKey,
  postUrlSlug,
  findCounterpart,
  isDraftVisible,
  filterPublished,
  type BlogPost,
} from './blog';

// Minimal stand-in for a content entry — only the fields the helpers read.
function post(id: string, data: Partial<BlogPost['data']> = {}): BlogPost {
  return { id, data } as unknown as BlogPost;
}

describe('postLocale', () => {
  it('extracts the locale segment from the id', () => {
    expect(postLocale(post('fr/foo'))).toBe('fr');
    expect(postLocale(post('en/bar'))).toBe('en');
  });
  it('returns null for an unknown or malformed locale', () => {
    expect(postLocale(post('de/foo'))).toBeNull();
    expect(postLocale(post('foo'))).toBeNull();
  });
});

describe('postKey', () => {
  it('is the filename without the locale segment', () => {
    expect(postKey(post('fr/cinq-pratiques-cybersecurite-pme'))).toBe('cinq-pratiques-cybersecurite-pme');
  });
  it('is identical across locales, so it pairs translations', () => {
    expect(postKey(post('fr/x'))).toBe(postKey(post('en/x')));
  });
});

describe('postUrlSlug', () => {
  it('uses the slug frontmatter when set (EN gets its English URL)', () => {
    const en = post('en/cinq-pratiques-cybersecurite-pme', { slug: 'five-cybersecurity-practices-for-smbs' });
    expect(postUrlSlug(en)).toBe('five-cybersecurity-practices-for-smbs');
  });
  it('falls back to the filename when slug is unset (FR keeps its URL)', () => {
    expect(postUrlSlug(post('fr/cinq-pratiques-cybersecurite-pme'))).toBe('cinq-pratiques-cybersecurite-pme');
  });
});

describe('isDraftVisible / filterPublished', () => {
  const published = post('fr/publie');
  const explicitlyPublished = post('fr/publie-explicite', { draft: false });
  const draft = post('fr/brouillon', { draft: true });
  const all = [published, explicitlyPublished, draft];

  it('hides drafts on the public build (STATIC_ONLY unset)', () => {
    expect(isDraftVisible(false)).toBe(false);
    expect(filterPublished(all, false)).toEqual([published, explicitlyPublished]);
  });

  it('shows drafts in the STATIC_ONLY (CloudCannon editing) build', () => {
    expect(isDraftVisible(true)).toBe(true);
    expect(filterPublished(all, true)).toEqual(all);
  });

  it('shows drafts when DRAFTS_VISIBLE opts a build in (CF Pages Preview env)', () => {
    // The shareable-preview escape hatch: branch previews build WITHOUT
    // STATIC_ONLY, so without this flag a shared draft link would 404.
    expect(isDraftVisible(false, true)).toBe(true);
    expect(filterPublished(all, false, true)).toEqual(all);
  });

  it('treats a post without the draft field as published (schema default: false)', () => {
    // Zod supplies `draft: false` at build time; the helper must also cope with
    // the field being absent (stand-in entries, historical data).
    expect(filterPublished([published], false)).toEqual([published]);
  });

  it('reads the build environment by default (STATIC_ONLY is unset under vitest)', () => {
    expect(isDraftVisible()).toBe(false);
    expect(filterPublished(all)).toEqual([published, explicitlyPublished]);
  });
});

describe('articles programmés (date future = publication différée)', () => {
  const now = new Date('2026-07-30T12:00:00Z');
  const past = post('fr/passe', { date: new Date('2026-07-01') });
  const scheduled = post('fr/programme', { date: new Date('2026-09-01') });
  const atNow = post('fr/pile-maintenant', { date: now });
  const all = [past, scheduled, atNow];

  it('cache un article daté dans le futur sur le build public', () => {
    expect(filterPublished(all, false, false, now)).toEqual([past, atNow]);
  });

  it('date atteinte = publié (borne incluse)', () => {
    expect(filterPublished([atNow], false, false, now)).toEqual([atNow]);
  });

  it("le build d'édition (STATIC_ONLY) montre les articles programmés", () => {
    expect(filterPublished(all, true, false, now)).toEqual(all);
  });

  it('DRAFTS_VISIBLE (préversions) montre aussi les programmés', () => {
    expect(filterPublished(all, false, true, now)).toEqual(all);
  });

  it('un brouillon futur reste un brouillon (les deux filtres se cumulent)', () => {
    const draftFuture = post('fr/brouillon-futur', { draft: true, date: new Date('2026-09-01') });
    expect(filterPublished([draftFuture], false, false, now)).toEqual([]);
  });
});

describe('findCounterpart', () => {
  const fr = post('fr/cinq-pratiques-cybersecurite-pme');
  const en = post('en/cinq-pratiques-cybersecurite-pme', { slug: 'five-cybersecurity-practices-for-smbs' });
  const lonely = post('fr/only-in-french');
  const all = [fr, en, lonely];

  it('finds the translation in the other locale by filename', () => {
    expect(findCounterpart(fr, all)).toBe(en);
    expect(findCounterpart(en, all)).toBe(fr);
  });
  it('returns null when there is no counterpart', () => {
    expect(findCounterpart(lonely, all)).toBeNull();
  });
});
