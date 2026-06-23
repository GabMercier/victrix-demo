/**
 * Blog helpers for the locale-split collection.
 *
 * Posts live in src/content/blog/<locale>/<slug>.md, so each entry id is
 * "<locale>/<filename>" (e.g. "fr/cinq-pratiques-cybersecurite-pme"). These
 * helpers pull the locale and the bare filename back out, list posts for one
 * language, resolve the public URL slug, and find a post's translation.
 *
 * Two distinct notions of "slug":
 *  - the **pairing key** = the filename (`postKey`). FR and EN translations share
 *    it; it is what pairs them in the CMS and the language switch.
 *  - the **URL slug** (`postUrlSlug`) = the CMS-editable `slug` frontmatter if set,
 *    else the filename. This lets EN use English URLs while FR keeps its filename.
 */

import { getCollection, type CollectionEntry } from 'astro:content';
import { type Locale, otherLocale } from './config';

export type BlogPost = CollectionEntry<'blog'>;

/** The locale segment of a post id, or null if malformed. */
export function postLocale(entry: BlogPost): Locale | null {
  const seg = entry.id.split('/')[0];
  return seg === 'fr' || seg === 'en' ? seg : null;
}

/**
 * The pairing key = the bare filename (id without the leading "<locale>/").
 * Identical across fr/ and en/, so it pairs translations. NOT necessarily the
 * URL slug — use `postUrlSlug` to build links.
 */
export function postKey(entry: BlogPost): string {
  const i = entry.id.indexOf('/');
  return i === -1 ? entry.id : entry.id.slice(i + 1);
}

/**
 * The public URL slug: the CMS-editable `slug` frontmatter when set, else the
 * filename. FR typically omits it (slug = filename, URLs unchanged); EN sets an
 * English slug (e.g. "ai-for-organizational-productivity").
 */
export function postUrlSlug(entry: BlogPost): string {
  return entry.data.slug ?? postKey(entry);
}

/** All posts for a locale, newest first. */
export async function getPostsByLocale(lang: Locale): Promise<BlogPost[]> {
  const all = await getCollection('blog');
  return all
    .filter((p) => postLocale(p) === lang)
    .sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf());
}

/**
 * A post's translation in the other locale — same pairing key (filename), or
 * null if it has no counterpart. Used by the article language switch to link to
 * the counterpart's localized URL instead of blindly swapping the path prefix.
 */
export function findCounterpart(entry: BlogPost, all: BlogPost[]): BlogPost | null {
  const lang = postLocale(entry);
  if (!lang) return null;
  const other = otherLocale[lang];
  const key = postKey(entry);
  return all.find((p) => postLocale(p) === other && postKey(p) === key) ?? null;
}
