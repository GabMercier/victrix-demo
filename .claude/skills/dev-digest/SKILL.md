---
name: dev-digest
description: Produce a structured digest of a software-development conversation at its end, to file into the project's Project and reload later across claude.ai and Claude Code. Use this whenever a conversation's substance is dev work on a software project. architecture, building features, debugging, technical spikes, schema and data-model design, flow and integration work, or code review and refactoring. Covers Power Platform work (Power Pages, Code Sites / SPAs, Dataverse, Power Automate, model-driven and canvas apps, ALM) and front-end / full-stack work (Astro, Cloudflare, React, Rust, Azure). Trigger on the usual wind-down signals (let's digest this, save the context, wrap this up, close this out, make the project summary), or when a dev session is clearly ending before a fresh chat or Claude Code session on the project. Supersedes conversation-digest planning and debugging templates for software work. If mainly personal reflection use conversation-digest; if travel logistics use trip-digest.
---

# Dev Digest

Turn a development conversation into a compact, decision-complete record that a future session can load
and act on without re-deriving anything. The bias is toward what survives: what was decided and why,
what was built, what is still open, what to do next, and the durable technical facts learned along the way.

Run this at the end of the conversation, while the full exchange is still in context. That is the only
point where "nothing important lost" is achievable, because reconstructing a chat later only recovers fragments.

## What this skill is for, and what it is not

- **Is for:** the convergent, technical layer of project work. Decisions with rationale, what changed in
  the code and the data model, environment specifics, problems hit and how they were resolved, what is
  verified, what is open, what is next.
- **Is not for:** personal or emotional processing. A dev session sometimes passes through a rough patch
  or a frustration vent. Do not reproduce that here. Capture it in one neutral line under **Continuity
  note** only if future context genuinely needs it, and point to the personal-reflection Project.
- Voice / verbatim excerpts are intentionally omitted from this template. Code, decisions, and facts are
  the record; how someone phrased their frustration is not.

## Two artifacts, kept distinct

There are two different things, and conflating them loses information.

- **This digest** is a record of one conversation: what changed, what was decided, what is still open as
  of that session. Dated, immutable, filed.
- **The living project docs** are the cumulative master documents for the whole project. They get
  regenerated as decisions land. A suggested set is below.

The digest's job is to capture the deltas from the conversation and to flag whether the living docs now
need regenerating to absorb them. Always end with an explicit yes/no on that, and name which doc.

### Suggested living-doc layout

A starting structure for a project, kept at the repo root or under `docs/`. Adapt freely. Omit any doc the
project does not need yet. The point is that these are what a fresh Claude Code session (or a fresh
claude.ai chat with the Project loaded) reads first, before any individual digest.

- **`PROJECT.md`** scope, goals, what is in and out, phase / current ship slice, stakeholders, constraints.
- **`ARCHITECTURE.md`** how the system fits together: the SPA, the data layer, flows, integrations, auth,
  hosting. The shape, not the history.
- **`DECISIONS.md`** the running decision log (ADR style). Digests feed this. One entry per decision:
  what, why, what it rules out, status.
- **`SCHEMA.md`** the data model. For Dataverse: tables, columns (logical names, not just display names),
  relationships, choice sets, autonumber formats, key web roles / security. For other stacks: the
  equivalent (DB tables, types, API contracts).
- **`STATUS.md`** current state: what is shipped, what is in progress, what is next, known issues. The
  one doc most likely to need regenerating after every session.

The digests live alongside these, under `docs/digests/`. Keep the same files in the repo and in the
Project knowledge so claude.ai and Claude Code share one source of truth.

## Workflow

1. Confirm it is a dev conversation tied to a project (see the description boundary). If it is genuinely
   mixed with real personal-reflection content, digest the dev work here and route the personal layer to
   conversation-digest. Say so.
2. Detect the session sub-flavor (see below). State it in the header. Let the user override.
3. Write the common header.
4. Apply the dev session template, omitting any section with no real content rather than padding it.
5. Apply the house style throughout.
6. Name the filing destination (which project Project). Filing is manual: the user pastes the digest into
   the Project knowledge and drops the same file into `docs/digests/` in the repo.
7. State whether the living docs need regenerating, and which ones.
8. Save as `digest-YYYY-MM-DD-NN-topic-slug.md`, where `NN` is the 2-digit sequence within the day (01,
   02, ...) and `topic-slug` is a short lowercase hyphenated tag (2 to 4 words) naming the session's main
   subject, e.g. `digest-2026-06-29-01-intelcom-bulk-case-upload.md`. Use the conversation's date. Dev
   digests are non-sensitive, so the filename is descriptive on purpose: the slug makes the relevant
   thread easy to find at a glance, in the repo and in the Project. Present it.

## Session sub-flavor detection

One adaptive template covers all of these. The sub-flavor just tells you which sections carry the weight
and which get omitted. A session can be mixed; name a primary and, if real, a secondary.

- **Planning / architecture** scoping, deciding approach, designing structure. Weight on Decisions,
  Architecture, Open questions.
- **Build / implementation** writing the feature. Weight on What was built, Environment specifics,
  Verification, Next steps.
- **Debugging / troubleshooting** a stated bug or blocker. Weight on Problems hit (symptom, root cause,
  fix, dead ends), Verification.
- **Spike / research** feasibility, evaluating options, "can the platform do X". Weight on Decisions
  (with the finding), Durable findings, Open questions. Flag capability claims for web-search verification.
- **Review / refactor** reviewing or restructuring existing code. Weight on Decisions, What was changed,
  Tech debt.

Judge by where the durable value sits, not by the opening message.

## Common header (every dev digest)

- **Date:** the conversation date (single session, or a range if it spanned days).
- **Type:** Dev session, sub-flavor (primary, and secondary if real), e.g. "Dev session (build; secondary:
  debugging)".
- **Project:** the project name and, if useful, the current phase or ship slice.
- **In one line:** what this session moved, in one plain sentence.
- **File under:** the project Project (and the `docs/digests/` path in the repo).
- **Subjects covered:** short list of what was actually touched.
- **Scope of this session:** which feature, layer, or component was worked, and explicitly what was NOT
  touched, so the next session knows where the edge was.

## Dev session template

Omit any section with no real content. Do not pad.

- **Goal / scope of this session.** What we set out to do and where it fits in the project arc (which ship
  slice, which phase). Brief.

- **Decisions made.** The most important section for a long-lived project. Each as: the decision, the
  reasoning behind it, what it rules out, and status (firm / tentative / revisit-if-X). A decision without
  its reasoning is half-recorded, because the next session cannot tell whether new information should
  reopen it. These entries are what feed `DECISIONS.md`.

- **What was built or changed.** The concrete artifacts, specific enough to locate and reproduce. List
  components, files (with paths), flows, tables, columns, scripts, queries. Mark each with state:
  - **done** (working),
  - **scaffolded** (stubbed, not functional yet),
  - **designed** (decided, not built).
  This is the section that lets a fresh Claude Code session pick up the thread. Be precise with names.

- **Architecture / how it fits.** The current shape of the relevant part of the system after this session:
  how the pieces connect (e.g. SPA to Dataverse Web API to Power Automate to SharePoint, auth via web
  roles, hosting). The shape now, not the forty steps that produced it.

- **Environment / stack specifics.** The painful-to-re-derive facts. Capture exactly:
  - environment names / URLs, solution name, publisher prefix,
  - Dataverse schema names (tables, columns as **logical names**, choice set option values, autonumber
    formats), web roles and table permissions in play,
  - connection references, app registrations, auth config (Entra External ID, custom consent, etc.),
  - API / library / framework versions, PAC CLI version, Node version,
  - build, deploy, and upload commands actually used.
  Getting a logical name wrong costs a debugging cycle later. Write them down.

- **Problems hit and how resolved.** For debugging that happened mid-session: symptom, root cause once
  found, the fix with enough detail to reproduce. Include the **dead ends**: approaches tried that did not
  work, with why, so they are not retried. Name dead ends plainly.

- **Verification / test state.** What is confirmed working and how it was confirmed. What is untested.
  What is known-broken. Do not imply something works if it was only written, not run.

- **Open questions / decisions pending.** Forks not yet resolved, each stated as a real choice with the
  options. Includes capability unknowns ("does Power Pages SPA support X") flagged for web-search
  verification before they are answered from memory.

- **Risks / dependencies / blockers.** What a decision or a piece of work is waiting on (a client input, a
  permission, a teammate's UX or migration work, a Microsoft feature reaching GA), and what would actually
  break the plan. Name the dependency and the thing it gates.

- **Tech debt / deferred.** Work parked on purpose, each with the reason, so it is not re-litigated or
  forgotten.

- **Next steps.** The ordered short list of what to do next. Where it matters, note which surface fits:
  some steps need Claude Code (filesystem, PAC CLI, running code), some are pure planning or design that
  either surface can do. Note what the next ship slice is.

- **Durable findings (secondary).** Reusable technical facts that outlast this slice: Power Platform
  quirks, version-specific behavior, gotchas, a FetchXML or Liquid pattern that worked, a Cloudflare or
  Astro detail. Note the source where it matters and flag anything whose scope was uncertain. These feed
  cross-project knowledge, not just this project.

- **Continuity note (one line, only if needed).** Any non-technical thing a future session must hold, in a
  single neutral line. Personal-reflection material is redirected to the personal Project, not reproduced.

- **Living docs status.** Explicit: do the living project docs need regenerating to absorb this session? If
  yes, name which (`PROJECT.md`, `ARCHITECTURE.md`, `DECISIONS.md`, `SCHEMA.md`, `STATUS.md`) and list
  what changed that each must reflect.

## House style (apply to every dev digest)

- Markdown.
- No em dashes. Use commas, periods, colons, or parentheses instead.
- No AI-style phrasing. Avoid "not just X, it's actually Y", affirm-then-pivot openers, and aphoristic
  closers. Plain, varied sentence structure.
- Keep what was decided separate from the discussion that produced it. Record the landing.
- Bullets and small tables are good here; this is reference material meant to be scanned. Keep each bullet
  substantive.
- Preserve status markers in use (done / scaffolded / designed; firm / tentative; verified / untested /
  broken). They carry real information.
- Be exact with identifiers: file paths, logical names, flow names, solution names, versions. Vague is
  worse than absent, because a vague identifier reads as authoritative and sends the next session down the
  wrong path.
- Lead with the simplest real version of anything. Flag uncertainty and dead ends explicitly.
- Do not fabricate. Leave a section out rather than inventing content. Do not present a guess as a fact,
  and flag anything uncertain (a fix not yet verified, a capability assumed but not confirmed).

## Dual-surface note (claude.ai + Claude Code)

This skill exists to keep one project's context coherent across two surfaces.

- The **living docs** are the shared brain. Claude Code reads them at the start of a repo session;
  claude.ai reads them via the Project. Regenerate them when a digest flags it, and keep the repo copy and
  the Project copy identical.
- The **digests** are the audit trail. When the living docs say a thing is true but not why, the dated
  digest under `docs/digests/` holds the reasoning. Grep the digests for the decision, not the transcript.
- Filenames are descriptive on purpose (the slug), so a digest is findable from either surface without a
  hunt.

## How the user wants dev help to run (operating agreement)

Not part of the saved digest, but it governs the conversation that produces it.

- Concise and direct. Skip the basics on the Power Platform; a refresher on advanced topics or
  implementation strategy is welcome. Say less when there is nothing to add.
- Code with detailed comments explaining the approach.
- For Power Platform capability questions, verify with a web search before suggesting a workaround. Name
  dead ends immediately. Lead with the simplest real answer.
- Ship-slice oriented: build in slices, name the current one, keep the next one in view.
- Do not manufacture disagreement. Push back only on a real, specific problem. Own errors cleanly.

## Extending this skill

If a project type needs sections this template lacks, add them rather than forcing content. If the sub-
flavors diverge enough that one template gets unwieldy, split per-flavor blocks into a `references/`
folder and point to the right one after detection, so only the relevant block loads. If a project grows
its own living-doc conventions, record them in that project's `PROJECT.md`, not here.
