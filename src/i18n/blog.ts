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
import { EDITOR_PREVIEW_BUILD } from '../lib/editor-preview';

export type BlogPost = CollectionEntry<'blog'>;

/**
 * EDITOR_PREVIEW (la politique d'aperçu des sites d'ÉDITION CloudCannon — lot
 * L16, 2026-09-24 ; auparavant portée par STATIC_ONLY, que le site de
 * PRODUCTION pose aussi : il publiait les brouillons) — lue UNE fois dans
 * src/lib/editor-preview.ts, en expression membre exacte. GOTCHA : Astro ne
 * substitue les variables non PUBLIC_ que pour la forme exacte
 * `import.meta.env.NOM` dans le code serveur — jamais via destructuration ni
 * objet env passé en paramètre. Sous vitest la variable est absente : `false`
 * (comportement production), les tests injectent le drapeau en paramètre.
 */

/**
 * DRAFTS_VISIBLE — same exact-member-expression gotcha as EDITOR_PREVIEW.
 * Opt-in escape hatch for SHAREABLE draft previews: the CloudCannon editing
 * build (EDITOR_PREVIEW=1) shows drafts, but Cloudflare Pages branch previews
 * build WITHOUT it, so a « Brouillon » article would 404 on the
 * https://<branche>.victrix-demo.pages.dev link an editor shares for review.
 * Set DRAFTS_VISIBLE=1 (any non-empty value) as a build variable on the
 * Cloudflare Pages *Preview* environment ONLY — NEVER on Production, or drafts
 * go public. Unset everywhere by default (see .env.example).
 */
const DRAFTS_VISIBLE_BUILD = Boolean(import.meta.env.DRAFTS_VISIBLE);

/**
 * Are draft posts visible in this build? True for the EDITOR_PREVIEW
 * (CloudCannon editing) build, so editors can preview a draft in the visual
 * editor, and for builds that opt in via DRAFTS_VISIBLE (Cloudflare Pages
 * Preview environment — see above); the public production build — INCLUDING
 * the CloudCannon production site, built STATIC_ONLY=1 WITHOUT EDITOR_PREVIEW
 * — never routes or lists drafts. The parameters exist for unit tests
 * (import.meta.env is baked at build/module load — it can't be flipped from
 * inside a test).
 */
export function isDraftVisible(
  editorPreview: boolean = EDITOR_PREVIEW_BUILD,
  draftsVisible: boolean = DRAFTS_VISIBLE_BUILD,
): boolean {
  return editorPreview || draftsVisible;
}

/**
 * The publishable subset of `posts` — the ONE gate every surface that routes
 * or lists posts goes through (ressources index + article routes via the
 * pages, the homepage's latest-articles strip via getPostsByLocale below).
 * Two filters, same visibility policy (editing/preview builds see everything):
 *  - drafts (« Brouillon » switch);
 *  - ARTICLES PROGRAMMÉS (2026-07-30, demande marketing) : une date FUTURE =
 *    publication différée — l'article est exclu des builds publiés jusqu'à ce
 *    qu'un build postérieur à sa date le fasse apparaître (rebuild quotidien
 *    planifié : operations.md § « Publication planifiée »). Les dates de
 *    frontmatter sans heure valent minuit UTC — l'article du « 2026-08-01 »
 *    paraît au premier build du 1er août UTC.
 * `now` est un paramètre pour les tests; en build il vaut l'instant du build.
 */
export function filterPublished(
  posts: BlogPost[],
  editorPreview: boolean = EDITOR_PREVIEW_BUILD,
  draftsVisible: boolean = DRAFTS_VISIBLE_BUILD,
  now: Date = new Date(),
): BlogPost[] {
  // `?? 0` : zod garantit `date` sur toute vraie entrée; les doublures de test
  // et données historiques sans date restent « publiées » (même tolérance que
  // pour `draft` absent).
  return isDraftVisible(editorPreview, draftsVisible)
    ? posts
    : posts.filter(
        (post) => !post.data.draft && (post.data.date?.valueOf() ?? 0) <= now.valueOf(),
      );
}

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
 * filename. All seeded posts now set it explicitly (FR = the filename, EN = an
 * English slug like "ai-for-organizational-productivity") so CloudCannon's
 * `{slug}`-based preview URL template is exact for every entry.
 */
export function postUrlSlug(entry: BlogPost): string {
  // `||`, not `??`: CloudCannon's blog schema seeds new posts with `slug: ""` —
  // treat the empty string as "unset" so a fresh post keeps its filename URL
  // (two fresh posts must not collide on the same empty slug in getStaticPaths).
  return entry.data.slug || postKey(entry);
}

/**
 * All publishable posts for a locale, newest first. Drafts are filtered HERE
 * (see filterPublished) so every caller — the ressources index AND the
 * homepage's latest-articles strip — gets the same draft policy for free.
 */
export async function getPostsByLocale(lang: Locale): Promise<BlogPost[]> {
  const all = await getCollection('blog');
  return filterPublished(all)
    .filter((p) => postLocale(p) === lang)
    .sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf());
}

/**
 * Catégories du blogue = étiquettes DISTINCTES des articles fournis, dans
 * l'ordre de première apparition (liste triée du plus récent au plus ancien →
 * l'ordre suit l'actualité, stable d'un build à l'autre). Source PARTAGÉE du
 * méga-menu Ressources (Header.astro) et des onglets de filtre de l'index
 * Ressources — les deux surfaces listent donc toujours les mêmes catégories.
 * Le contenu migré porte une étiquette de catégorie WordPress par article
 * (« Nos articles », « Nos actualités », « Nos vidéos »…) ; une nouvelle
 * étiquette saisie au CMS devient automatiquement une catégorie.
 */
export function blogCategories(posts: BlogPost[]): string[] {
  const seen = new Set<string>();
  for (const post of posts) for (const tag of post.data.tags) seen.add(tag);
  return [...seen];
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
