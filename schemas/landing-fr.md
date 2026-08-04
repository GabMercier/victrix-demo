---
# Gabarit CloudCannon (« + Ajouter » → Campagne (FR) — voir
# cloudcannon.config.yml, collections_config.landing.schemas). Le fichier créé
# atterrit dans src/content/landing/fr/ (create.path du schéma) et son front
# matter DOIT satisfaire le contrat landing gelé (title + sections requis dans
# src/content.config.ts) : un fichier vide ferait échouer le build Astro du
# commit poussé par CloudCannon. `_bookshop_name` = clé de correspondance de
# la palette générée par @bookshop/generate (Zod l'ignore).
title: "Nouvelle campagne"
description: ""
noindex: true
# P-04 — en-tête/pied de page de campagne : « complet » = chrome normal du
# site. Chaînes vides, jamais null (règle CloudCannon/zod du dépôt).
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
    title: "Titre de la campagne"
    subtitle: ""
    ctaLabel: ""
    ctaHref: ""
---
