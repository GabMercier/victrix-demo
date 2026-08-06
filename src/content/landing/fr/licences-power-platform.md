---
# Page campagne « Licences Power Platform » — VITRINE de la landing maquette
# (docs/design/landing-page.css + capture « Landing page », 2026-08-05) :
# héros clair 2 colonnes (accent bleu, 2 CTA, image sur halo), bénéfices en
# tête compacte + liseré, section Ø Studio (strategic-value « vitrine »),
# formulaire carte (form1) ancré #formulaire, bandeau bleu final (callout
# banner). Mêmes conventions que evaluation-securite.md (contrat gelé).
# L'image Ø Studio est un STAND-IN du dépôt (bureaux) — la photo exacte de la
# maquette n'est pas dans les assets export.
title: "Licences Microsoft Power Platform : comment s'y retrouver ?"
description: "Guide complet pour choisir les bonnes licences Microsoft Power Platform : types de licences, paliers de service et alignement sur vos besoins d'affaires."
noindex: true
header:
  mode: allege
  links: []
  ctaLabel: "Parler à un expert"
  ctaHref: "/fr/contact"
  showAnnounce: false
  showLangSwitch: true
  showSearch: false
footerMode: allege
sections:
  - _bookshop_name: hero
    type: hero
    eyebrow: "Ressources • Guide complet"
    eyebrowIcon: livre
    title: "Licences Microsoft Power Platform : comment s'y retrouver ?"
    titleAccent: "Power Platform"
    subtitle: "S'y retrouver dans les différentes licences peut sembler complexe pour les directions informatiques. Notre guide simplifie vos choix stratégiques pour optimiser vos investissements."
    ctaLabel: "Télécharger le guide"
    ctaIcon: telechargement
    ctaHref: "#formulaire"
    cta2Label: "Parler à un expert"
    cta2Href: "/fr/contact"
    image: "/images/services/valeur-copilot-studio.jpg"
  - _bookshop_name: benefits
    type: benefits
    headingStyle: compact
    title: "Pourquoi consulter ce guide ?"
    items:
      - title: "Connaissance approfondie"
        description: "Obtenez rapidement une vision claire des types de licences et des avantages concrets pour la structure de votre organisation."
        icon: ampoule
      - title: "Maximiser l'investissement"
        description: "Évitez les dépenses inutiles en sélectionnant précisément les paliers de service adaptés à vos utilisateurs et applications."
        icon: croissance
      - title: "Alignement métier"
        description: "Assurez-vous que vos besoins opérationnels sont parfaitement couverts par les fonctionnalités techniques de vos licences Microsoft."
        icon: losange
  - _bookshop_name: strategic-value
    type: strategic-value
    variant: vitrine
    badge: "Innovation"
    title: "Ø Studio, une technologie créative à votre service"
    paragraphs:
      - "Notre studio de création technologique multidisciplinaire vous accompagne dans la gestion et le développement de Microsoft Power Platform et Dynamics 365."
    stats:
      - value: "+100"
        label: "Projets réussis"
      - value: "+30"
        label: "Spécialistes"
    bullets:
      - "Expérience utilisateur (UX) centrée sur l'humain et l'innovation."
      - "Accompagnement personnalisé et bilingue basé au Québec."
      - "Processus d'apprentissage continu et ateliers de partage."
    image: "/images/services/hero-productivite.jpg"
    imageAlt: ""
    cardTitle: "Expertise Québécoise"
    cardText: "Un accompagnement de proximité pour des solutions qui font vraiment la différence."
  - _bookshop_name: form
    type: form
    variant: carte
    title: "Téléchargez notre guide"
    intro: "Complétez le formulaire ci-dessous pour recevoir le guide immédiatement par courriel."
    submitLabel: "Recevoir le guide"
    consentText: "En soumettant ce formulaire, vous consentez à recevoir des communications de Victrix et acceptez sa politique de confidentialité."
    fields:
      - label: "Prénom"
        type: text
        required: true
        width: demi
      - label: "Nom"
        type: text
        required: true
        width: demi
      - label: "Entreprise"
        type: text
        required: true
      - label: "Courriel Professionnel"
        type: email
        required: true
  - _bookshop_name: callout
    type: callout
    layout: banner-green
    title: "Besoin d'un accompagnement sur mesure ?"
    body: "Nos experts sont disponibles pour discuter de vos projets spécifiques."
    ctaLabel: "Rencontrez nos experts"
    ctaHref: "/fr/contact"
---
