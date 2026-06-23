# Handoff prompt — Milestone 1 (UX & performance wins)

> Paste the block below into a new Claude Code conversation in this repo to continue.
> (Your file-based memory auto-loads, so this stays short and points at the docs.)

---

Continue the Victrix site project — now starting **Milestone 1 (UX & performance wins)**.

FIRST, read for context: `MEMORY.md` (esp. `project-status.md`), `docs/roadmap.md`,
`docs/i18n-architecture.md`, and `docs/portail-auth.md`. Skim `src/i18n/`, `src/layouts/
BaseLayout.astro`, `src/components/`, and `src/pages/[lang]/`.

CONTEXT (short): Astro 5 static site, bilingual FR/EN (`/fr`, `/en`, pages under
`src/pages/[lang]/`), Sveltia CMS, mock client portal at `/fr/portail`. No UI framework —
plain `.astro` + design tokens in `src/styles/tokens.css`. Deployed to Cloudflare Pages.
M0 (tests/lint/CI/CSP/Node-20 plan) is DONE and green (`npm test`, `npm run lint`).

TASK — implement Milestone 1 from `docs/roadmap.md`, roughly in this order
(verify with `npm run lint` / `npm test` / `tsc`; the Astro integrations are first-party
unless noted):
1. **View Transitions** — add `<ClientRouter />` to `BaseLayout`'s `<head>`; re-bind any
   inline init (announcement dismissal, future scroll/theme) on `astro:page-load`.
2. **Prefetch** — `prefetch: true` in `astro.config.mjs` (auto-on with ClientRouter).
3. **Images** — move remaining raw `<img>` to `astro:assets` `<Image>`/`<Picture>`
   (`layout="constrained"` in articles, `"full-width"` heroes); keep decorative `alt=""`.
4. **astro-icon** — consolidate the inline nav/social/portal SVGs into `<Icon>`.
5. **JSON-LD** — `Organization`/`LocalBusiness` sitewide + `BlogPosting` per article
   (data already exists in BaseLayout props + the blog schema).
6. **RSS** — `@astrojs/rss`, one feed per locale from the blog collection.
7. **Cloudflare Web Analytics** — cookieless tag (no consent banner; Law 25 friendly).
8. **Lighthouse CI** — add to the GitHub Actions workflow with a perf/SEO/a11y budget.
9. **Fonts** — evaluate `@fontsource-variable/montserrat` vs the current manual
   `/public/fonts` setup (the built-in Fonts API is experimental on Astro 5 → don't adopt yet).

CONSTRAINTS (important):
- Local dev runs on **Node 18** → the Cloudflare adapter is attached **build-only** in
  `astro.config.mjs`; `astro dev` works without it. (Node-20 move is planned, not done.)
- Do **NOT** `git commit`/push — leave changes uncommitted and summarize.
- Do **NOT** run `astro build`/`preview`/`astro check` while their `npm run dev` is running
  (Windows EPERM on the `.astro` cache). Ask them to stop dev first, or verify with
  `tsc --noEmit` / `vitest` / `eslint` (all dev-safe). To smoke-test in a browser, start a
  throwaway dev server on another port.
- Keep marketing pages static; keep everything bilingual + accessible + on-brand (tokens).
- After each integration, run `npm run lint` and `npm test`.

ALSO QUEUED (optional, if you prefer to clear it first): the **per-locale blog slug**
rework — full checklist in `docs/i18n-architecture.md` (add a CMS-editable `slug`
frontmatter field; keep identical filenames so CMS pairing + the article language switch
keep working).
