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
    }),
});

// Editable homepage content (singleton). Stored as JSON so Sveltia can edit it
// as a "file" collection with nested fields; keep field names clean for the CMS.
const home = defineCollection({
  loader: glob({ pattern: '**/*.json', base: './src/content/home' }),
  schema: ({ image }) =>
    z.object({
      hero: z.object({
        eyebrow: z.string().optional(),
        title: z.string(),
        subtitle: z.string(),
        ctaLabel: z.string(),
        ctaHref: z.string(),
      }),
      iso: z.object({
        title: z.string(),
        subtitle: z.string(),
      }),
      expertises: z.object({
        sectionTitle: z.string(),
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
      solutions: z.object({
        eyebrow: z.string(),
        title: z.string(),
        body: z.string(),
        ctaLabel: z.string(),
        ctaHref: z.string(),
        image: image(),
      }),
      partners: z.object({
        title: z.string(),
        names: z.array(z.string()),
      }),
      experts: z.object({
        title: z.string(),
        subtitle: z.string(),
        ctaLabel: z.string(),
        ctaHref: z.string(),
      }),
      articles: z.object({
        title: z.string(),
        ctaLabel: z.string(),
        ctaHref: z.string(),
      }),
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
  schema: z.object({
    title: z.string(),
    description: z.string().optional(),
    // Campaign pages are UNINDEXED unless a page explicitly opts in — paid
    // traffic destinations shouldn't leak into organic search results.
    noindex: z.boolean().default(true),
    // Discriminated on `type` — the same key the campagnes page switches on
    // and the CloudCannon structures palette uses as id_key.
    sections: z.array(
      z.discriminatedUnion('type', [
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
          items: z.array(
            z.object({
              title: z.string(),
              description: z.string(),
            }),
          ),
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
      ]),
    ),
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
