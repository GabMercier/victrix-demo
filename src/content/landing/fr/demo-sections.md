---
# Page de DÉMONSTRATION des 4 sections ajoutées le 17 juil. (P-02) :
# Témoignage, Bandeau logos partenaires, Victrix en chiffres, Vidéo (façade).
# Mêmes conventions que evaluation-securite.md (contrat gelé) : héros en
# première position (seul <h1>), ctaHref AVEC préfixe de langue, noindex,
# `_bookshop_name` sur chaque section, même nom de fichier dans en/ = la
# traduction. Sert aussi de banc d'essai pour le flux « créer en FR →
# dupliquer en EN » documenté dans docs/guide-edition.md.
title: "Démonstration — nouvelles sections"
description: "Page de démonstration des sections Témoignage, Logos partenaires, Chiffres et Vidéo."
noindex: true
sections:
  - _bookshop_name: hero
    type: hero
    eyebrow: "Démonstration"
    title: "Les nouvelles sections de la palette"
    subtitle: "Témoignage, bandeau de logos partenaires, chiffres en preuve sociale et vidéo en façade — quatre blocs réutilisables sur toute page composable."
    ctaLabel: "Nous joindre"
    ctaHref: "/fr/contact"
  - _bookshop_name: testimonial
    type: testimonial
    quote: "Victrix a transformé notre posture de sécurité en quelques mois — une équipe rigoureuse, à l'écoute, qui parle le langage des affaires."
    name: "Marie Lavoie"
    role: "Vice-présidente TI"
    organization: "Entreprise québécoise"
    photo: ""
  - _bookshop_name: logo-banner
    type: logo-banner
    title: "Nos partenaires technologiques"
    badge: "Membre Microsoft Cloud Network"
    items:
      - name: "Microsoft"
        logo: ""
        description: "Infonuagique, productivité et sécurité."
      - name: "AWS"
        logo: ""
        description: "Infrastructure infonuagique."
      - name: "Cisco"
        logo: ""
        description: "Réseautique et sécurité."
      - name: "ServiceNow"
        logo: ""
        description: "Flux de travail et TI."
  - _bookshop_name: stats
    type: stats
    title: "Victrix en chiffres"
    items:
      - number: "25+"
        label: "années d'expérience"
      - number: "3"
        label: "bureaux — Québec, Montréal, Paris"
      - number: "99,9 %"
        label: "de disponibilité pour nos services gérés"
  - _bookshop_name: video
    type: video
    title: "Découvrez Victrix en vidéo"
    intro: "Un aperçu de notre approche et de nos équipes."
    videoUrl: ""
    posterImage: ""
    ctaLabel: "Visionner la vidéo"
---
