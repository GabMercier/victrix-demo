---
slug: licences-power-platform
# Page campagne « Licences Power Platform » — MAQUETTE FINALE 2026-08-18
# (docs/design/export2/landing-pagefinal.txt + capture « Landing page ») :
# CHROME COMPLET (header 5 entrées + footer 4+1 colonnes — la maquette finale
# abandonne le chrome allégé), héros clair IVOIRE sans eyebrow (accent bleu
# conservé, 2 CTA, image sur halo), bénéfices en tête compacte 32/700 +
# liseré, section Ø Studio IVOIRE (strategic-value « vitrine »), formulaire
# carte sur bande SABLE lié à la DÉFINITION campagne-guide-licences (case
# consentement Loi 25 + champs cachés UTM), bandeau bleu final (callout
# banner). L'image Ø Studio est un STAND-IN du dépôt (bureaux) — la photo
# exacte de la maquette n'est pas dans les assets export.
title: "Licences Microsoft Power Platform : comment s'y retrouver ?"
description: "Guide complet pour choisir les bonnes licences Microsoft Power Platform : types de licences, paliers de service et alignement sur vos besoins d'affaires."
noindex: true
# Chrome COMPLET : blocs header/footerMode ABSENTS (défaut de la route) — la
# maquette finale montre la navigation et le pied de page du site entiers.
sections:
  - _bookshop_name: hero
    type: hero
    fond: ivoire
    title: "Licences Microsoft Power Platform : comment s'y retrouver ?"
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
    fond: ivoire
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
    fond: sable
    title: "Téléchargez notre guide"
    intro: "Complétez le formulaire ci-dessous pour recevoir le guide immédiatement par courriel."
    # Formulaire LIÉ (2026-08-18) : champs, bouton, consentement et case Loi 25
    # viennent de src/data/forms/fr/campagne-guide-licences.json (+ champs
    # cachés Page d'origine / UTM) — les champs inline historiques sont retirés.
    formId: campagne-guide-licences
    submitLabel: "Recevoir le guide"
    fields: []
  - _bookshop_name: callout
    type: callout
    layout: banner-green
    title: "Besoin d'un accompagnement sur mesure ?"
    body: "Nos experts sont disponibles pour discuter de vos projets spécifiques."
    ctaLabel: "Rencontrez nos experts"
    ctaHref: "/fr/contact"
---
