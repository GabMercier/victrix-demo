# Plan « Médiathèque » — images et fichiers du site (2026-09-17)

> **Statut : plan à valider** (rien d'exécuté). Reprend la phase 5 du plan
> éditeur du 16 sept. (digest `docs/digests/digest-2026-09-16-01-…`), le
> point n° 10 du retour de rencontre du 9 sept. (`docs/retour-rencontre-2026-09-09.md`)
> et l'item « Médiathèque » de `docs/ado-alignement.md` (après décision 🟠).
> Décideurs : Gabriel (technique), Julie (édition), Walter (plan IA / arborescence).

## 1. Où en est-on

| Constat | Détail | Source |
|---|---|---|
| Uploads rangés **par surface** (~8 dossiers) | articles → `public/wp-content/uploads/cms` ; sections → `public/images/sections` ; solutions → `public/images/solutions` ; contact → `public/images/contact` ; carrières → `public/images/carrieres` ; nav → `public/images/nav` ; accueil → `src/content/home` (image optimisée) ; repli global → `src/assets/uploads` | `cloudcannon.config.yml` (`paths.uploads` par input), guide § Médias |
| Pas de vue unique des médias dans CloudCannon | Chaque sélecteur d'image ne montre que son dossier ; réutiliser un visuel = recopier son chemin | recette 09/09, point 10 |
| Médias migrés WordPress | 120 fichiers rapatriés dans `public/wp-content/uploads/…` (`scripts/migration/fetch-media.mjs`, `docs/migration/rapport-medias.md`) sur 943 recensés (`docs/migration/urls-medias.csv`) ; chemins publics conservés = zéro redirection média | digest 2026-07-29, plan-convergence §Phase 6 |
| Export final WP à faire | copie SFTP de `wp-content/uploads/` (inclut `dlm_uploads/` des 5 PDF protégés) AVANT décommission ; Outils → Exporter ne sort que le XML | `docs/DEPLOYMENT.md` §7 |
| Noms de fichiers | non normalisés (uploads CloudCannon = nom d'origine ; WP = slugs) ; consigne SEO du guide : « nommer en mots réels » | guide § SEO |
| Poids | images de sections servies telles quelles (pas d'optimisation au build hors accueil/couvertures blog dérivées 800 px) | `scripts/blog-cover-derivatives.mjs`, digest 2026-08-19 |
| Textes alternatifs | champ `alt` seulement sur product-hero / strategic-value / service-hero ; ~14 emplacements sans champ (lot 2 recette) | digest 2026-09-10 |

## 2. Décisions à prendre (avant toute tâche)

| # | Décision | Options | Recommandation |
|---|---|---|---|
| D1 | **Racine unique ou rangement par surface ?** | (a) consolider PROSPECTIVEMENT sous `public/images/cms/<surface>/` (l'existant reste en place, rien ne bouge — 60+ articles et 400 sections y pointent) ; (b) assumer le rangement actuel et le documenter seulement | **(a)** : une seule racine à parcourir dans le DAM CloudCannon, sans migration risquée |
| D2 | **DAM CloudCannon** (vue « Fichiers » de la barre latérale) | activer la navigation `public/images/cms` comme **collection de fichiers** (CloudCannon : « File collections ») pour voir/renommer/téléverser hors d'une page | activer, groupe « Configuration » → « Médias » |
| D3 | **Nommage** | `uploads_filename` CloudCannon : `{{ filename | slugify }}` (+ date ?) | slugify seul (lisible, SEO), pas de préfixe date |
| D4 | **Optimisation** | (a) rien (statu quo, consigne « < 300 ko ») ; (b) passe build `sharp` sur `public/images/cms/**` → dérivés 800/1600 comme les couvertures blog ; (c) `astro:assets` (déplace les uploads dans `src/`, change tous les composants) | **(b)** en phase 2, (c) exclu (contrat Bookshop browser-safe) |
| D5 | **Médias WordPress restants** (823 non rapatriés) | (a) copier tout `wp-content/uploads/` à l'export final et le servir tel quel ; (b) ne servir que les fichiers référencés | **(a)** : coût nul, zéro lien mort, tri ultérieur possible |
| D6 | **Alt obligatoire ?** | champ `alt` sur tous les emplacements image (lot 2) + comment (« vide = décoratif ») | oui, lot 2 de la recette (déjà chiffré 0,5-1 j) |

## 3. Tâches (une fois D1-D6 tranchées)

| # | Tâche | Contenu | Estimation | Dépend de |
|---|---|---|---|---|
| M1 | **Config uploads** | `paths.uploads` de chaque input image → `public/images/cms/<surface>` (sections, solutions, contact, carrieres, nav, blog reste `wp-content/uploads/cms` ou bascule ?) ; `uploads_filename` global ; repli global `paths.uploads` → `public/images/cms/divers` (fin de `src/assets/uploads`) | 0,25 j | D1, D3 |
| M2 | **Collection « Médias »** | collection de fichiers CloudCannon sur `public/images/cms` (+ `public/wp-content/uploads` en lecture) ; groupe barre latérale ; icône ; guide § Médias réécrit (« une seule maison, réutiliser = parcourir ») | 0,25 j | D2 |
| M3 | **Story ADO** | reprendre l'item « Médiathèque — stratégie et convention » avec les décisions consignées ; fermer après M1-M2 | 0,1 j | D1-D3 |
| M4 | **Export final WP** | copie SFTP `wp-content/uploads/` → `public/wp-content/uploads/` (ou stockage à part si trop lourd — mesurer d'abord : 943 fichiers) ; vérifier les 5 PDF `dlm_uploads` ; item DEPLOYMENT §7 coché | 0,5 j + accès hébergeur | accès SFTP (Victrix) |
| M5 | **Alt partout** (lot 2) | champ `imageAlt` sur les ~14 emplacements sans alt (héros, bento, cartes, témoignages, solutions, contact, carrières), rendu `alt={…}`, comment CMS | 0,5-1 j | D6 |
| M6 | **Optimisation build** (phase 2) | script `scripts/cms-image-derivatives.mjs` (recette compress-wp-images : palette/mozjpeg, garde-fou « plus petit que l'original ») + `srcset` dans les composants qui affichent de grandes images ; garde-fou poids > 1 Mo en avertissement | 1 j | D4, M1 |
| M7 | **Guide + formation** | § Médias du guide (nouvelle arborescence, nommage, alt, poids) ; 15 min de démo à Julie | 0,25 j | M1-M2 |

Total phase 1 (M1-M3, M7) ≈ **1 j** ; M4 dépend d'un accès ; M5-M6 ≈ 1,5-2 j.

## 4. Ce qui ne bouge PAS

- Les chemins existants (`/wp-content/uploads/…`, `/images/sections/…`) : les
  60 articles et ~400 sections continuent de pointer dessus ; aucune
  redirection média, aucune réécriture de contenu.
- Le contrat Bookshop : les composants reçoivent des **chemins publics**
  (chaînes), jamais des images `astro:assets` (édition live en navigateur).
- L'image d'accueil « Solution » (optimisée au build depuis `src/content/home`)
  — cas particulier assumé.

## 5. Commandes / vérifications prévues

```
npm run cms:previews:check        # inchangé — pastilles/icônes éditeur
node scripts/migration/fetch-media.mjs --all   # à écrire pour M4 si la copie SFTP est impossible
npm run build && STATIC_ONLY=1 npm run build    # les chemins d'upload n'affectent que l'éditeur
```

Vérification CloudCannon (site dev) après M1-M2 : téléverser une image depuis
une section, une fiche solution et un article → les trois atterrissent sous
la racine choisie ; la collection « Médias » les liste ; le chemin recopié
dans un autre champ affiche l'image.
