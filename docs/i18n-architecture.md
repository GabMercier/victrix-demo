# Bilingual URL & SEO architecture

How the FR/EN site is structured for URLs and SEO, the decisions behind it, and
the planned long-term refinements.

## Current structure (implemented)

- **Both locales are prefixed** (`prefixDefaultLocale: true`): `/fr/…` and `/en/…`.
  `/` 301-redirects to `/fr`; old pre-i18n top-level URLs redirect to their `/fr/…`
  equivalents (see `astro.config.mjs` `redirects`).
- **One template per page** under `src/pages/[lang]/…`; copy comes from the UI
  dictionary (`src/i18n/ui.ts`), per-page modules (`src/i18n/content/*`), and the
  content collections.
- **Blog** is locale-split: `src/content/blog/<locale>/<slug>.md`. FR and EN versions
  are **paired by identical filename** — that pairing is what makes Sveltia's
  `multiple_folders` i18n show both languages **side-by-side** in one editor, and
  what lets the article language switch find a post's translation.
- **SEO already in place**: per-page `<link rel="canonical">` + `hreflang` alternates
  (BaseLayout), `og:locale`(+`alternate`), and `@astrojs/sitemap` with i18n.
- **Known gap** (the reason for the slug rework): EN reuses FR slugs
  (`/en/ressources/cinq-pratiques-…`), which is poor for SEO and user trust.

## Decision: per-locale article slug (CMS-editable)

Add an optional **`slug` frontmatter field** to the blog schema. It is the SEO best
practice for bilingual article URLs and is **editable in the CMS** (one value per
language, since the field is `i18n: true`).

Rules:
- The **filename stays identical** across `blog/fr/` and `blog/en/` → CMS pairing +
  the article language switch keep working (they key off the filename, not the URL).
- The **URL slug** = `data.slug` if set, else the filename (so FR can omit it and keep
  its current URLs; EN sets an English slug).
- The article language switch maps a post to its translation **by filename**, then
  links to the counterpart's localized URL (`localizePath('/ressources/' + counterpartSlug, otherLocale)`).
- Old `/ressources/<filename>` URLs keep 301-redirecting to `/fr/…` (FR slug = filename, unchanged).

### Implementation checklist (the slug rework) — ✅ done
1. `src/content.config.ts` — add `slug: z.string().optional()` to the blog schema.
   **Gotcha:** the glob loader's default `generateId` uses a `slug` frontmatter
   field *as the entry id*, which would strip the `<locale>/<filename>` pairing
   key (so EN posts collapsed under `/fr/`). The fix is a custom `generateId`
   that derives the id from the file path only:
   `generateId: ({ entry }) => entry.replace(/\\/g, '/').replace(/\.[^/.]+$/, '')`.
2. `src/i18n/blog.ts` — `postKey` (filename, pairing key), `postUrlSlug` (`data.slug ?? key`),
   and `findCounterpart` (other locale, same key).
3. `src/pages/[lang]/ressources/[slug].astro` — `getStaticPaths` uses `postUrlSlug`
   for `params.slug` and computes `altLocalePath` = the counterpart's localized URL
   (trailing slash kept, to match the counterpart's canonical), passed to
   `BaseLayout` so the language switch **and** `hreflang` are correct.
4. `src/components/BlogCard.astro` — build links from `postUrlSlug`.
5. EN posts — add `slug:` (English) to the three `src/content/blog/en/*.md`.
6. `public/admin/config.yml` — add a `slug` field (`i18n: true`, optional) to the blog
   collection. Safe: the collection-level `slug: "{{slug}}"` filename template still
   derives from the title; a field named `slug` would need `{{fields.slug}}` to be
   referenced, so it does not change filename generation.

> Example EN slugs (implemented): `ai-for-organizational-productivity`,
> `five-cybersecurity-practices-for-smbs`, `cloud-migration-four-step-guide`.

## Long-term: localize the section slugs too

Best practice goes one step further — localize the **path segments**, not just the
article slug: `/fr/ressources` ↔ `/en/resources`,
`/fr/expertises/intelligence-artificielle` ↔ `/en/expertise/artificial-intelligence`.

This is a **larger change** and is intentionally deferred (own session): a single
`src/pages/[lang]/ressources/…` folder emits the *same* sub-path for both locales, so
true localization needs one of:
- a **central route map** (`{ resources: { fr: 'ressources', en: 'resources' }, … }`) +
  a `localizedPath(key, lang)` helper, with pages resolved via a catch-all
  `[...path].astro` that matches the map, **or**
- explicit per-locale page files.

Recommended target: the route-map approach (one source of truth for every localized
path, used by nav/footer/links/sitemap). Until then, section segments stay FR-derived
under `/en/` — acceptable, with article slugs localized as the high-value first step.

## SEO checklist (keep current)
- [x] canonical + `hreflang` (fr-CA / en-CA / x-default) per page
- [x] sitemap with i18n alternates
- [x] localized article slugs (this rework)
- [ ] localized section slugs (long-term)
- [ ] JSON-LD (Organization/LocalBusiness + BlogPosting) — roadmap M1
- [ ] robots.txt generated from `site` — roadmap M2
