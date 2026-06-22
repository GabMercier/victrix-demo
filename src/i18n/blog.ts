/**
 * Blog helpers for the locale-split collection.
 *
 * Posts live in src/content/blog/<locale>/<slug>.md, so each entry id is
 * "<locale>/<slug>" (e.g. "fr/cinq-pratiques-cybersecurite-pme"). These helpers
 * pull the locale and the bare slug back out, and list posts for one language.
 * A translation pair shares the same slug across fr/ and en/.
 */

import { getCollection, type CollectionEntry } from 'astro:content';
import type { Locale } from './config';

export type BlogPost = CollectionEntry<'blog'>;

/** The locale segment of a post id, or null if malformed. */
export function postLocale(entry: BlogPost): Locale | null {
  const seg = entry.id.split('/')[0];
  return seg === 'fr' || seg === 'en' ? seg : null;
}

/** The bare slug (id without the leading "<locale>/"). */
export function postSlug(entry: BlogPost): string {
  const i = entry.id.indexOf('/');
  return i === -1 ? entry.id : entry.id.slice(i + 1);
}

/** All posts for a locale, newest first. */
export async function getPostsByLocale(lang: Locale): Promise<BlogPost[]> {
  const all = await getCollection('blog');
  return all
    .filter((p) => postLocale(p) === lang)
    .sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf());
}
