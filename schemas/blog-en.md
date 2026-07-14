---
# CloudCannon template ("+ Add" → Article (EN) — see cloudcannon.config.yml,
# collections_config.blog.schemas). The created file lands in
# src/content/blog/en/ and its front matter MUST satisfy the blog Zod schema
# (title, date, excerpt, coverImage required): an empty file would break the
# Astro build of the commit CloudCannon pushes.
#  - coverImage points at an EXISTING cover (Astro image() fails on a missing
#    path) — replace it through the image input;
#  - slug starts empty: the URL then falls back to the filename
#    (src/i18n/blog.ts). Fill it in (EN = the English slug) so the CloudCannon
#    preview link ({slug} in the collection URL) is exact. Pair the
#    translation by reusing the SAME FILENAME as the fr/ counterpart.
title: "New article"
slug: ""
date: 2026-01-01
excerpt: ""
coverImage: "../covers/ia-productivite.png"
tags: []
---

Article content…
