---
# CloudCannon template ("+ Add" → Campaign (EN) — see cloudcannon.config.yml,
# collections_config.landing.schemas). The created file lands in
# src/content/landing/en/ (the schema's create.path) and its front matter MUST
# satisfy the frozen landing contract (title + sections required in
# src/content.config.ts): an empty file would break the Astro build of the
# commit CloudCannon pushes. `_bookshop_name` = the match key of the
# @bookshop/generate-built palette (Zod strips it).
title: "New campaign"
description: ""
noindex: true
# P-04 — campaign header/footer: "complet" = the site's normal chrome.
# Empty strings, never null (repo-wide CloudCannon/zod rule).
header:
  mode: complet
  links: []
  ctaLabel: ""
  ctaHref: ""
  showAnnounce: false
  showLangSwitch: true
  showSearch: false
footerMode: complet
sections:
  - _bookshop_name: hero
    type: hero
    eyebrow: ""
    title: "Campaign title"
    subtitle: ""
    ctaLabel: ""
    ctaHref: ""
---
