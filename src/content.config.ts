import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

/**
 * Content collections (Astro Content Layer).
 *  - `blog` — Markdown articles in src/content/blog (folder collection, Sveltia).
 *  - `home` — singleton homepage content in src/content/home/accueil.json (Sveltia).
 *  - `landing` — section-based campaign pages in src/content/landing, edited
 *    visually in CloudCannon (cloudcannon.config.yml at the repo root); Sveltia
 *    does not manage this collection.
 *  - `expertises` — per-locale JSON for the expertise pages (today: the AI page,
 *    migrated out of src/i18n/content/ai.ts so CloudCannon can edit it); Sveltia
 *    does not manage this collection either.
 *
 * Field names are kept clean to mirror the CMS configs (public/admin/config.yml
 * for Sveltia, cloudcannon.config.yml for CloudCannon).
 */

const blog = defineCollection({
  loader: glob({
    pattern: '**/*.md',
    base: './src/content/blog',
    // Derive the entry id from the FILE PATH only ("<locale>/<filename>").
    // Astro's default generateId uses a `slug` frontmatter field AS the id when
    // present — which would strip the "<locale>/<filename>" pairing key the blog
    // helpers depend on (postLocale, postKey, findCounterpart). Here `slug` is a
    // URL-only field, so we ignore it for id generation. See src/i18n/blog.ts.
    generateId: ({ entry }) => entry.replace(/\\/g, '/').replace(/\.[^/.]+$/, ''),
  }),
  // Clean, Sveltia-friendly field names — mirror these in the CMS config.
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      date: z.coerce.date(),
      excerpt: z.string(),
      coverImage: image(),
      tags: z.array(z.string()).default([]),
      // Optional per-locale URL slug (SEO). When unset the filename is used, so
      // FR can keep its filename-based URLs while EN sets an English slug. The
      // filename still pairs the FR/EN translations — see src/i18n/blog.ts.
      slug: z.string().optional(),
      // Draft flag (CloudCannon switch « Brouillon »). Drafts are EXCLUDED from
      // routes/listings on the public site, but the STATIC_ONLY (CloudCannon
      // editing) build keeps them so editors can preview before publishing —
      // the single switch lives in filterPublished() (src/i18n/blog.ts).
      // `.default(false)` keeps every existing post published without touching
      // its frontmatter.
      draft: z.boolean().default(false),
    }),
});

/**
 * Shared `sections` palette — ONE discriminated union used by BOTH the `home`
 * and `landing` collections, so CloudCannon's single generated `sections`
 * palette (the per-component .bookshop.yml specs under component-library, all
 * tagged `structures: [sections]`) is valid in either collection: home
 * sections can appear on a
 * campaign and vice-versa (a deliberate single-palette choice).
 *
 * Discriminated on `type` (the same key the pages switch on, the renderer keys
 * on, and CloudCannon uses as id_key). `_bookshop_name` is stripped like every
 * unknown key — do NOT add .strict() (it would fail the build mid-edit, when
 * CloudCannon's visual editor adds that key). Optional string fields use
 * .optional() and the components treat "" as absent, so a freshly-added blank
 * section never fails validation.
 *
 * `image` is threaded in from the collection's `schema: ({ image }) => …`
 * context (the only place Astro exposes the image() helper). The home-solution
 * image accepts a resolved image OR a plain string ("" on a fresh section, or a
 * not-yet-uploaded path) so adding the section never breaks the build; the page
 * resolves it with getImage only when it is a real image.
 */
function sectionsSchema(image: () => z.ZodTypeAny) {
  return z.discriminatedUnion('type', [
    // ---- Campaign landing sections (frozen contract) ----
    z.object({
      type: z.literal('hero'),
      eyebrow: z.string().optional(),
      title: z.string(),
      subtitle: z.string().optional(),
      ctaLabel: z.string().optional(),
      ctaHref: z.string().optional(),
    }),
    z.object({
      type: z.literal('benefits'),
      title: z.string(),
      intro: z.string().optional(),
      items: z.array(z.object({ title: z.string(), description: z.string() })),
    }),
    z.object({
      type: z.literal('cta'),
      title: z.string(),
      body: z.string().optional(),
      ctaLabel: z.string(),
      ctaHref: z.string(),
      variant: z.enum(['light', 'dark']).default('light'),
    }),
    z.object({
      type: z.literal('form'),
      title: z.string(),
      intro: z.string().optional(),
      submitLabel: z.string(),
      consentText: z.string().optional(),
      fields: z.array(
        z.object({
          label: z.string(),
          type: z.enum(['text', 'email', 'textarea']),
          required: z.boolean(),
        }),
      ),
    }),
    z.object({
      type: z.literal('faq'),
      title: z.string(),
      items: z.array(z.object({ question: z.string(), answer: z.string() })),
    }),
    // ---- Home sections (composable home — mirror the home-* components) ----
    z.object({
      type: z.literal('home-hero'),
      eyebrow: z.string().optional(),
      title: z.string(),
      subtitle: z.string(),
      ctaLabel: z.string(),
      ctaHref: z.string(),
    }),
    z.object({
      type: z.literal('home-iso'),
      title: z.string(),
      subtitle: z.string(),
    }),
    z.object({
      type: z.literal('home-expertises'),
      sectionTitle: z.string(),
      learnMore: z.string(),
      items: z.array(
        z.object({
          number: z.string(),
          title: z.string(),
          accent: z.string(), // hex, kept ≥3:1 on white for accessible titles
          description: z.string(),
          href: z.string(),
        }),
      ),
    }),
    z.object({
      type: z.literal('home-solution'),
      eyebrow: z.string(),
      title: z.string(),
      body: z.string(),
      ctaLabel: z.string(),
      ctaHref: z.string(),
      // Resolved image when the path is real; plain string ("") otherwise.
      image: z.union([image(), z.string()]),
    }),
    z.object({
      type: z.literal('home-partners'),
      title: z.string(),
      names: z.array(z.string()),
    }),
    z.object({
      type: z.literal('home-experts'),
      title: z.string(),
      subtitle: z.string(),
      ctaLabel: z.string(),
      ctaHref: z.string(),
    }),
    z.object({
      type: z.literal('home-latest'),
      title: z.string(),
      ctaLabel: z.string(),
      ctaHref: z.string(),
    }),
  ]);
}

// Editable homepage content (singleton per locale). Migrated from a nested data
// object to a `sections` array (see scripts/migrate-home-to-sections.mjs) so the
// home is composed and live-edited in CloudCannon through the shared Bookshop
// renderer, exactly like the campaign landings. Rendered by
// src/pages/[lang]/index.astro. Stored as JSON (still a "file" collection).
const home = defineCollection({
  loader: glob({ pattern: '**/*.json', base: './src/content/home' }),
  schema: ({ image }) =>
    z.object({
      sections: z.array(sectionsSchema(image)),
    }),
});

/**
 * Campaign landing pages ("campagnes") — the frozen landing section contract.
 *
 * Each entry is src/content/landing/<locale>/<slug>.md and renders at
 * /<locale>/campagnes/<slug>/ (src/pages/[lang]/campagnes/[slug].astro). The
 * page is built ONLY from `sections`; the Markdown body is ignored. Sections
 * map 1:1 onto the Bookshop components in component-library/src/components —
 * keep this schema, the components' Props, and the CloudCannon structures
 * palette (cloudcannon.config.yml) in sync.
 *
 * Gotchas:
 *  - Sections are spread verbatim into their components (no localizePath
 *    pass), so `ctaHref` values are stored as FINAL URLs — locale prefix
 *    included (e.g. "/fr/contact", not "/contact").
 *  - CloudCannon's visual editor adds an extra `_bookshop_name` key to
 *    inserted sections. Zod objects STRIP unknown keys by default — do not
 *    add .strict() here, it would fail the build mid-edit.
 *  - Optional string fields use .optional(): CloudCannon structure defaults
 *    must use empty strings (""), not blank YAML values (which parse to null
 *    and null fails .optional()). The components treat "" as absent.
 */
const landing = defineCollection({
  loader: glob({
    pattern: '**/*.md',
    base: './src/content/landing',
    // Same id trick as `blog`: "<locale>/<filename>", so the shared filename
    // pairs FR/EN translations. Landing has no per-locale `slug` frontmatter
    // (yet) — the filename IS the URL slug in both locales.
    generateId: ({ entry }) => entry.replace(/\\/g, '/').replace(/\.[^/.]+$/, ''),
  }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      description: z.string().optional(),
      // Campaign pages are UNINDEXED unless a page explicitly opts in — paid
      // traffic destinations shouldn't leak into organic search results.
      noindex: z.boolean().default(true),
      // Shared `sections` union (see sectionsSchema above) — the same palette
      // the home page uses; the campaign route (src/pages/[lang]/campagnes/
      // [slug].astro) renders it through the shared Bookshop renderer.
      sections: z.array(sectionsSchema(image)),
    }),
});

/**
 * Expertise pages — per-locale JSON, one file per expertise (like `home`, one
 * entry per locale; ids are "<locale>/<filename>", e.g.
 * "fr/intelligence-artificielle"). Rendered by the matching hand-built template
 * under src/pages/[lang]/expertises/. The shape mirrors the old aiContent
 * object 1:1 so the template markup did not change during the migration.
 *
 * Gotchas:
 *  - `lead`, `sIntro`, `p1`, `p2` may contain <strong> and are rendered with
 *    set:html (trusted, in-repo content — same policy as before the migration).
 *  - Adding a JSON file does NOT create a page: each expertise has its own
 *    template. The CloudCannon collection therefore disables add/delete.
 */
const expertises = defineCollection({
  loader: glob({ pattern: '**/*.json', base: './src/content/expertises' }),
  schema: z.object({
    metaTitle: z.string(),
    metaDescription: z.string(),
    hero: z.object({
      eyebrow: z.string(),
      titleAccent: z.string(),
      titleRest: z.string(),
      lead: z.string(),
      cta: z.string(),
    }),
    fromStrategy: z.object({
      blockTitle: z.string(),
      leadCardTitle: z.string(),
      leadCardText: z.string(),
    }),
    interventions: z.array(
      z.object({ n: z.string(), title: z.string(), text: z.string() }),
    ),
    collaboration: z.object({
      sHead: z.string(),
      sIntro: z.string(),
      items: z.array(
        z.object({ n: z.string(), title: z.string(), text: z.string(), cta: z.string() }),
      ),
    }),
    cta1: z.object({ title: z.string(), text: z.string(), cta: z.string() }),
    areas: z.object({
      sHead: z.string(),
      sSub: z.string(),
      items: z.array(z.string()),
    }),
    multiTech: z.object({
      sHead: z.string(),
      col1Title: z.string(),
      col2Title: z.string(),
      col3Title: z.string(),
      openLocalLabel: z.string(),
    }),
    cta2: z.object({ title: z.string(), cta: z.string() }),
    expertsPanel: z.object({
      sHead: z.string(),
      items: z.array(z.object({ n: z.string(), title: z.string(), text: z.string() })),
    }),
    closing: z.object({ blockTitle: z.string(), p1: z.string(), p2: z.string() }),
    greenCta: z.object({ title: z.string(), text: z.string(), cta: z.string() }),
  }),
});

export const collections = { blog, home, landing, expertises };
