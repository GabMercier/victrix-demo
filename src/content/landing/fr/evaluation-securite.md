---
slug: evaluation-securite
# Page campagne (collection « landing ») — rendue UNIQUEMENT à partir de
# `sections` par src/pages/[lang]/campagnes/[slug].astro ; le corps Markdown
# est ignoré. Conventions (contrat gelé) :
#  - le héros reste en PREMIÈRE position : il porte le seul <h1> de la page ;
#  - les liens (ctaHref) sont stockés AVEC le préfixe de langue (/fr/…) — les
#    sections sont passées telles quelles aux composants, sans localizePath ;
#  - même nom de fichier dans en/ = la traduction (bascule de langue) ;
#  - noindex: true — les pages de campagne restent hors des moteurs de recherche ;
#  - chaque section porte `_bookshop_name` : la clé (id_key) que la palette
#    `sections` générée par @bookshop/generate utilise pour reconnaître la
#    section dans CloudCannon. Zod ignore cette clé (les objets suppriment les
#    clés inconnues) — elle n'atteint jamais les composants.
title: "Évaluation de votre posture de sécurité"
description: "Obtenez un portrait clair de vos défenses actuelles : une évaluation menée par les experts Victrix, des constats concrets et un plan d'action priorisé."
noindex: true
# P-04 — chrome allégé (campagne payante) : logo + un bouton, pied de page
# réduit à la barre légale. ctaLabel/ctaHref vides → bouton portail ; ici un
# CTA de conversion dédié.
header:
  mode: allege
  links: []
  ctaLabel: "Demander mon évaluation"
  ctaHref: "/fr/contact"
  showAnnounce: false
  showLangSwitch: true
  showSearch: false
footerMode: allege
sections:
  - _bookshop_name: hero
    type: hero
    eyebrow: "Cybersécurité"
    title: "Évaluation de votre posture de sécurité"
    subtitle: "Savez-vous où se trouvent vos vulnérabilités ? Nos experts dressent un portrait complet de vos défenses et vous remettent un plan d'action priorisé, adapté à votre réalité d'affaires."
    ctaLabel: "Demander mon évaluation"
    ctaHref: "/fr/contact"
  - _bookshop_name: benefits
    type: benefits
    title: "Ce que couvre l'évaluation"
    intro: "Une démarche structurée, menée par des conseillers certifiés, qui va bien au-delà du simple balayage automatisé."
    items:
      - title: "Analyse des vulnérabilités"
        description: "Revue de vos systèmes, de vos accès et de vos configurations afin de repérer les failles exploitables — avant qu'elles ne le soient."
      - title: "Conformité et gouvernance"
        description: "Évaluation de vos pratiques au regard des exigences réglementaires, dont la Loi 25, et des cadres reconnus comme ISO 27001."
      - title: "Plan d'action priorisé"
        description: "Des recommandations concrètes, classées par impact et par effort, pour investir là où l'effet sur votre risque est le plus grand."
  - _bookshop_name: form
    type: form
    title: "Demandez votre évaluation"
    intro: "Remplissez le formulaire et un membre de notre équipe communiquera avec vous d'ici deux jours ouvrables."
    submitLabel: "Envoyer ma demande"
    consentText: "En soumettant ce formulaire, vous consentez à ce que Victrix recueille et utilise les renseignements fournis uniquement pour traiter votre demande, conformément à la Loi 25 sur la protection des renseignements personnels dans le secteur privé."
    fields:
      - label: "Nom complet"
        type: text
        required: true
      - label: "Courriel professionnel"
        type: email
        required: true
      - label: "Message"
        type: textarea
        required: false
  - _bookshop_name: cta
    type: cta
    title: "Prêt à renforcer votre posture de sécurité ?"
    body: "Nos experts accompagnent les organisations québécoises à chaque étape : évaluation, plan d'action et mise en œuvre."
    ctaLabel: "Planifier un appel"
    ctaHref: "/fr/contact"
    variant: dark
---
