---
# Gabarit CloudCannon (« + Ajouter » → Article (FR) — voir
# cloudcannon.config.yml, collections_config.blog.schemas). Le fichier créé
# atterrit dans src/content/blog/fr/ et son front matter DOIT satisfaire le
# schéma Zod du blogue (title, date, excerpt requis) : un fichier vide ferait
# échouer le build Astro du commit poussé par CloudCannon.
#  - coverImage est un CHEMIN PUBLIC servi tel quel (ex.
#    /wp-content/uploads/2025/07/….jpg — convention du contenu migré) et peut
#    rester vide (article sans image mise en avant) ;
#  - slug reste vide au départ : l'URL retombe alors sur le nom de fichier
#    (src/i18n/blog.ts). Le renseigner (FR = nom de fichier) pour que le lien
#    d'aperçu CloudCannon ({slug} dans l'URL de la collection) soit exact.
title: "Nouvel article"
slug: ""
date: 2026-01-01
excerpt: ""
coverImage: ""
tags: []
---

Contenu de l'article…
