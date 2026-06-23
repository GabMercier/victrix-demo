import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

/**
 * Content collections (Astro Content Layer). Both are edited by Sveltia CMS:
 *  - `blog` — Markdown articles in src/content/blog (folder collection).
 *  - `home` — singleton homepage content in src/content/home/accueil.json.
 *
 * Field names are kept clean to mirror the Sveltia config (public/admin/config.yml).
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

export const collections = { blog, home };
