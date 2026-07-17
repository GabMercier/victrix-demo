---
# DEMO page for the 4 sections added July 17 (P-02) — English counterpart of
# fr/demo-sections.md (same filename = translation pair). Same frozen-contract
# conventions: hero first (only <h1>), ctaHref WITH locale prefix, noindex,
# `_bookshop_name` on every section.
title: "Demo — new sections"
description: "Demo page for the Testimonial, Partner logos, Stats and Video sections."
noindex: true
sections:
  - _bookshop_name: hero
    type: hero
    eyebrow: "Demo"
    title: "The new palette sections"
    subtitle: "Testimonial, partner logo banner, social-proof numbers and a video facade — four reusable blocks for any composable page."
    ctaLabel: "Contact us"
    ctaHref: "/en/contact"
  - _bookshop_name: testimonial
    type: testimonial
    quote: "Victrix transformed our security posture in a few months — a rigorous team that listens and speaks the language of business."
    name: "Marie Lavoie"
    role: "VP, Information Technology"
    organization: "Quebec-based company"
    photo: ""
  - _bookshop_name: logo-banner
    type: logo-banner
    title: "Our technology partners"
    badge: "Microsoft Cloud Network member"
    items:
      - name: "Microsoft"
        logo: ""
        description: "Cloud, productivity and security."
      - name: "AWS"
        logo: ""
        description: "Cloud infrastructure."
      - name: "Cisco"
        logo: ""
        description: "Networking and security."
      - name: "ServiceNow"
        logo: ""
        description: "Workflows and IT."
  - _bookshop_name: stats
    type: stats
    title: "Victrix in numbers"
    items:
      - number: "25+"
        label: "years of experience"
      - number: "3"
        label: "offices — Québec City, Montréal, Paris"
      - number: "99.9%"
        label: "uptime across our managed services"
  - _bookshop_name: video
    type: video
    title: "Discover Victrix on video"
    intro: "A glimpse of our approach and our teams."
    videoUrl: ""
    posterImage: ""
    ctaLabel: "Watch the video"
  # Form BY REFERENCE (forms v2): fields/button/consent/recipient come from
  # src/data/forms/en/campagne-evaluation.json.
  - _bookshop_name: form
    type: form
    title: "Request your assessment"
    intro: "Form linked by reference — forms v2 demo."
    formId: campagne-evaluation
    submitLabel: "Send"
    fields: []
---
