# Spike CloudCannon — état, réglages et grille de décision

> **✅ GATE CLOSE — CloudCannon ADOPTÉ (constat formel du 2026-08-07).**
> L'adoption était acquise de facto depuis des semaines : Sveltia retiré le
> 2026-07-30 (Phase 3 du plan de convergence), tout le travail CMS construit
> sur CloudCannon depuis (palette de 30 sections, collections services/
> solutions/formulaires/navigation, accueil composable). La grille ci-dessous
> est remplie avec les preuves accumulées. **Restes NON bloquants** : la
> capture vidéo du critère 8 (repliée dans P-21, démo complète + vidéo) et la
> note du palier tarifaire/prix par siège (ligne OPS — à consigner depuis le
> compte CloudCannon). La relève Tina (phase 1b du plan pivot) est SANS OBJET.
>
> Compagnon d'exécution de `docs/plan-pivot-editeur.md` (phases 0–1).
> État initial au **13 juillet 2026** : fondations construites et vérifiées en
> local; restait la connexion CloudCannon et la session d'évaluation.

## Ce qui est en place (vérifié : lint 0 erreur, 23/23 tests, `astro check` 0 erreur, build Cloudflare normal intact, build `STATIC_ONLY` statique pur)

| Pièce | Où | Rôle |
|---|---|---|
| Mode `STATIC_ONLY` | `astro.config.mjs` | Build 100 % statique pour CloudCannon : adaptateur Cloudflare désactivé, routes portail force-prérendues (hook `astro:route:setup` + shim `getStaticPaths`), intégration Bookshop attachée **uniquement** dans ce mode (le build de prod et `astro dev` ne chargent jamais Bookshop) |
| Bibliothèque Bookshop | `component-library/src/` | 4 sections composables (Héros, Bénéfices, Appel à l'action, Formulaire factice), styles = tokens du site, specs `.bookshop.yml` en français |
| Collection `landing` | `src/content.config.ts` + `src/content/landing/` | Contrat zod (union discriminée sur `type` + `_bookshop_name`), `noindex: true` par défaut; démo FR/EN « Évaluation de votre posture de sécurité » |
| Route campagnes | `src/pages/[lang]/campagnes/[slug].astro` | `/fr|en/campagnes/<slug>/`, meta robots noindex via `BaseLayout`, exclue du sitemap |
| Config CloudCannon | `cloudcannon.config.yml` | Collections Blogue / Accueil / Expertises / Campagnes avec libellés français, URLs d'aperçu, uploads d'images (`src/content/blog/covers`, `src/content/home`), gabarits de création (`schemas/*.md`) |
| Hook post-build | `.cloudcannon/postbuild` | `npx @bookshop/generate` → la palette de sections de l'éditeur est générée des specs Bookshop |
| Page expertise migrée | `src/content/expertises/` (JSON FR/EN) | Le contenu vivait dans un module TS (`src/i18n/content/ai.ts`, supprimé) — désormais éditable au CMS comme l'accueil |
| Slugs blogue explicites | `src/content/blog/fr/*.md` | `slug:` posé sur les 3 articles FR → les URLs d'aperçu CloudCannon sont exactes |

## Réglages CloudCannon (à saisir dans leur UI à la connexion)

- **Dépôt / branche** : ce dépôt GitHub, branche `spike/cloudcannon`.
- **SSG** : Astro (dans leur liste). **Source folder** : racine du dépôt (le
  `cloudcannon.config.yml` préfixe déjà les chemins avec `src/` — ne PAS mettre
  `src` comme source).
- **Install command** : `npm ci` · **Build command** : `npm run build` ·
  **Output path** : `dist`.
- **Variable d'environnement** : `STATIC_ONLY` = `1` (obligatoire — sans elle le
  build sort le worker Cloudflare et Bookshop n'est pas chargé).
- **Node** : option « Use my .nvmrc file » (→ 20) ou sélecteur Node 20.
- Le post-build `.cloudcannon/postbuild` est détecté automatiquement.
- **À noter à l'inscription** : palier qui inclut l'éditeur visuel/Bookshop,
  durée d'essai, prix par siège → colonne « constats » ci-dessous.

## La gate : 8 critères (de `docs/plan-pivot-editeur.md`)

| # | Critère | Résultat | Constats (au 2026-08-07) |
|---|---|---|---|
| 1 | Édition visuelle sur accueil, un article, la page expertise | ✅ | Accueil converti en sections composables (éditeur visuel) ; articles en Content Editor + aperçu ; expertise → collection `services` (visuel). « Validé de facto » acté dans GUIDE-PROJET dès juillet. |
| 2 | Édition FR/EN propre sans casser l'appariement | ✅ | Fichiers miroirs fr/en + flux Duplicate documenté (guide-edition) + rappel `victrix:i18n-pairing` au build. |
| 3 | Composer une landing depuis la palette (ajouter/réordonner) | ✅ | Dépassé : palette de **30 sections** (vs 4 prévues au spike), vignettes d'aperçu générées, éditeur visuel live. |
| 4 | Images : upload + pipeline `astro:assets` intact | ✅ | Uploads par collection configurés ; repli documenté pour l'aperçu live (composants browser-safe, chemins publics). |
| 5 | Publier → commit → build CF Pages → en ligne en minutes | ✅ | Pipeline inchangé, éprouvé sur des dizaines de publications de la branche. |
| 6 | Brouillon sur branche + URL de prévisualisation partageable | ✅ | Préversions par branche (noindex) + brouillons d'articles + option `DRAFTS_VISIBLE`. |
| 7 | Aucune régression (transitions, en-têtes, portail) | ✅ | Gate permanent du dépôt (lint/tests/e2e/builds des 2 modes) vert à chaque lot. |
| 8 | Le regard marketing : soutient la comparaison Elementor ? (capturer une vidéo) | ☐ | **Seul reste** — capture vidéo à faire, repliée dans **P-21** (démo processus complet + vidéo). Ne conditionne plus l'adoption. |

Échec = critère 1, 3 ou 5 non atteignable sans contournement lourd → relève
Tina (`plan-pivot-editeur.md`, phase 1b). **Résultat : aucun critère en échec
— la relève Tina n'a jamais été montée (sans objet).**

## Points à vérifier expressément pendant la session

1. **Palette de sections** : exactement 4 entrées (Héros, Bénéfices, Appel à
   l'action, Formulaire), sans doublons — preuve que `@bookshop/generate` et
   les clés manuelles de `_structures.sections` fusionnent comme prévu.
2. **« + Ajouter »** sur Campagnes et Blogue : le fichier créé atterrit bien
   dans `fr/` ou `en/` avec un frontmatter valide (gabarits `schemas/*.md`) —
   un fichier à la racine de la collection casserait le build.
3. **Formulaire, type de champ** : dans une section Formulaire, vérifier que le
   `type` d'un champ (texte/courriel/zone de texte) est éditable via le select
   défini dans la structure `form_fields`.
4. **Accueil** : s'ouvre dans l'éditeur visuel (panneau de données + aperçu).
   Attente réaliste : PAS de clic-sur-le-composant sur l'accueil — ses 4
   sections ne sont pas (encore) des composants Bookshop; seule la landing a le
   plein « live editing ». Si le verdict marketing l'exige, la conversion de
   l'accueil est le premier chantier post-gate.
5. **Connexion CF Pages** : pousser un commit trivial et confirmer le
   déploiement auto + une URL de préversion de branche avec `X-Robots-Tag:
   noindex` (ce projet a déjà perdu silencieusement sa connexion GitHub par le
   passé).

## Restes connus (assumés pour le spike)

- **Pin `3.19.0-rc1`** sur les 4 paquets Bookshop = le `latest` actuel de npm
  (les commandes officielles `--save-exact` installent exactement ça). À
  réévaluer avant la décision de gate si une version stable sort.
- `react-dom` arrive en dépendance de pairs de Bookshop (rien ne l'utilise;
  poids d'installation seulement).
- Le build normal Cloudflare et `astro dev` sont prouvés inchangés (Bookshop
  jamais chargé hors `STATIC_ONLY`; vérifié par build complet des deux modes).
- ~~Sveltia (`public/admin/`) reste intact jusqu'au verdict de la gate.~~
  **RETIRÉ le 2026-07-30** (verdict rendu) ; reste OPS hors dépôt :
  décommissionner le worker OAuth `sveltia-cms-auth.…workers.dev`.
