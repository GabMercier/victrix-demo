# Digest — Pipeline Figma→Tailwind validé + branchement du contenu migré + parité Ressources

- **Date :** 2026-07-29 (une session continue, journée)
- **Type :** Session dev (build ; secondaire : spike — validation du pipeline d'export Figma)
- **Projet :** Refonte victrix.ca — Astro + CloudCannon, branche `spike/cloudcannon`. Phase : convergence migration (Phase 6 branchement entamée), pilote design (pré-Phase 5).
- **En une ligne :** Le pipeline export Figma→Tailwind v4 est validé de bout en bout (page laboratoire fidèle + audit des tokens), 60 articles et 48 services migrés sont branchés en collections live avec leurs 120 médias et leurs 301, et la section Ressources retrouve la parité victrix.ca (méga-menu, filtre par catégorie, mise en forme des articles).
- **Classer dans :** Project « Victrix refonte » + `docs/digests/` du repo.
- **Sujets couverts :** audit tokens Figma vs repo ; page /fr/design-lab ; theme-semantique.css ; câblage blog + services (wire-*.mjs) ; rapatriement médias ; redirections 301 génériques ; compaction _routes.json ; méga-menu Ressources ; filtre catégories ; mise en forme article.
- **Portée de la session :** design (harnais de test seulement, PAS le thème final), contenu blog + services (paires complètes publiées seulement), navigation Ressources, page article. NON touché : Brizy (23 pages), 27 pages WP, formulaires GF, menus WP, Phase 2 (FR racine), re-skin des composants (Phase 5), GUIDE-PROJET.md (modifs user en cours).

## Objectif de la session

Deux volets demandés puis un troisième en cours de route : (A) tester le pipeline « export Figma (plugin Tailwind) → repo » avec les deux exports existants et produire la comparaison avec le cahier des charges ; (B) finaliser la migration de contenu en branchant le staging (blog + services) dans les collections live ; (C) sur captures comparatives fournies par le user, ramener la parité victrix.ca sur la section Ressources.

## Décisions prises

| Décision | Raison | Exclut | Statut |
|---|---|---|---|
| URLs des services sous `/services/` (pas `/expertise/`) | Architecture actuelle du prototype conservée ; le coût = 301 depuis WP, réglé par 2 règles génériques | Le renommage de route `/expertise/` en Phase 2 reste possible (1 constante + 301 inverses) | Ferme (choix user) |
| Branchement « paires complètes publiées seulement » | Qualité : pas de brouillon ni de contenu monolingue en prod ; le reste demeure en staging rejouable | Publier du FR sans EN | Ferme (choix user) |
| Adoption du nommage sémantique Figma pour les tokens (surface, headline-xl, gutter…) ; noms français = alias | Les futurs exports se collent avec un minimum de renommage | Traduction manuelle de chaque export vers les noms français | Ferme (choix user) |
| **L'export du design system FINAL sera la RÉFÉRENCE UNIQUE du thème** (blocs réutilisables + gabarits). Les conflits de l'audit §3 (radii, #1d46f3 absent, #0050cc hors charte) se règlent À LA RÉCEPTION, pas avant | Les maquettes actuelles ne sont pas finales ; arbitrer maintenant serait du travail jeté | Toute fusion de `theme-semantique.css` dans `theme.css` avant l'export final ; le démarrage de la Phase 5 | Ferme (choix user, consigné dans audit-tokens-figma.md §5) |
| `theme-semantique.css` ISOLÉ (non importé par BaseLayout) | 4 collisions avec les variables non-couchées de `tokens.css` (`--color-surface`, `--radius-sm/md/lg`) : le legacy gagnerait en silence sur `@layer theme` | — | Ferme jusqu'à l'export final |
| 301 par DEUX règles génériques `:splat` (`/expertise/*` et `/en/expertise/*`) plutôt que ~100 règles unitaires | Les chemins WP se conservent tels quels sous `/services/` (vérifié entrée par entrée par wire-services : 0 exception) ; budget `_routes.json` Cloudflare préservé | — | Ferme |
| `coverImage` du blog = chaîne chemin public (plus d'`image()` Astro) | Les corps Markdown migrés référencent déjà `/wp-content/uploads/…` verbatim ; cohérence avec les images de sections ; les 3 articles démo (seuls consommateurs d'`image()`) sont retirés | Dérivés responsive astro:assets sur les couvertures (perte acceptée) | Ferme |
| CTA d'articles marqués AU CÂBLAGE (`<a class="article-cta">`) et non par heuristique CSS | `:only-child` ignore les nœuds texte → un lien en fin de phrase deviendrait un bouton ; la détection par BLOC Markdown (un bloc = un seul lien) est déterministe | `p:has(> a:only-child)` | Ferme |
| Méga-menu Ressources GÉNÉRÉ au build (catégories = étiquettes réelles, derniers articles = collection) ; seuls les textes éditables | Zéro liste à maintenir à la main ; une nouvelle étiquette CMS devient automatiquement une catégorie | Colonnes rédigées à la main comme le méga-menu Services | Ferme |
| Compaction des exclusions `_routes.json` par globs de dossiers d'actifs (`/wp-content/*`, `/images/*`, `/fonts/*`) | L'adaptateur listait les ~120 médias UN PAR UN et saturait seul le plafond de 100 règles ; aucune route dynamique sous ces préfixes | — | Ferme |

## Ce qui a été construit ou modifié

Volet A — pipeline Figma (tout **done**) :
- `scripts/design/audit-export-tokens.mjs` : audit rejouable (config inline de `code.html` + frontmatter `DESIGN.md` vs `theme.css`/`tokens.css`), union multi-exports avec détection de divergences, §5 verdict MANUEL préservé entre exécutions.
- `docs/design/audit-tokens-figma.md` : équivalences, manquants (avec marquage [utilisé] par scan des classes du markup), 7 conflits internes de l'export, 4 collisions legacy, recette de conversion, décision « référence unique » consignée.
- `src/styles/theme-semantique.css` : tokens sémantiques verbatim (palette Material complète, spacing nommé, échelle typo avec sous-tokens, `--radius: 0.5rem`), `@custom-variant dark` inerte. PROVISOIRE (harnais design-lab).
- `src/styles/design-lab.css` : entrée du laboratoire, AVEC preflight (répétition de la Phase 5), Material Symbols subset auto-hébergé.
- `src/pages/[lang]/design-lab/index.astro` : markup export Homepage verbatim (4 adaptations documentées en entête), FR seulement, noindex, hors sitemap (filtre astro.config), hors Pagefind, hors CloudCannon. À purger avant prod.
- Assets : `public/images/design-lab/*.jpg` (6), `public/fonts/MaterialSymbolsOutlined-Subset.woff2` (3 Ko, 16 icônes — régénérer via `icon_names=` si nouvelles icônes).
- `eslint.config.js` : dérogation `anchor-is-valid` pour `**/design-lab/*.astro`.

Volet B — branchement (tout **done**) :
- `scripts/migration/wire-blog.mjs` : staging → `src/content/blog/{fr,en}` (60 fichiers = 30 paires ; 2 brouillons + 2 FR-seuls restent en staging). Retire ligne de transition + `author`, suffixe « | Victrix » de seoTitle, doublon couverture en tête de corps ; paragraphes-CTA → `article-cta` (26). Idempotent, `--force` requis pour écraser.
- `scripts/migration/wire-services.mjs` : staging → `src/content/services/{fr,en}` (48 = 24 paires ; écartés : 4 brouillons, 1 page test, 2 curés IA). Slug EN dérivé de `transition.wpUrl` ; nettoyage des échappements doublés SiteOrigin (`\n`, `\"` littéraux, 12 fichiers) ; vérification de l'hypothèse `:splat` (0 exception) ; émet `docs/migration/staging/services/manifest-branchement.json` (wpUrl/translationGroup/imagesNonPlacees/formIds).
- `scripts/migration/fetch-media.mjs` : 120 médias rapatriés `public/wp-content/uploads/…` (0 échec, skip-existing, recoupé `urls-medias.csv`), rapport `docs/migration/rapport-medias.md`.
- Schémas (`src/content.config.ts`) : blog `coverImage` → `z.string().optional()`, + `seoTitle`/`noindex`/`wpUrl` ; services + `slug` (sous-chemin d'URL complet) + `seoTitle` ; navigation + `megaRessources` optionnel.
- Route services renommée `src/pages/[lang]/services/[...slug].astro` (rest param, imbrication 2 niveaux, contrepartie hreflang par chemin de fichier avec slug surchargé).
- Routes/composants blog adaptés au chemin public : `[slug].astro`, `BlogCard.astro`, `index.astro` (home-latest), `home-latest.astro`, `related-posts.astro` (img simple, srcset optionnel).
- `src/data/redirects.json` : + 2 règles génériques 301. `astro.config.mjs` : compaction `_routes.json` dans `victrix:redirects`, 3 redirections démo reciblées `/fr/ressources`, `/design-lab` hors sitemap.
- Articles démo supprimés (6 md + covers/) ; `cloudcannon.config.yml` : cover blog en image-path public (`static: public`, uploads `public/wp-content/uploads/cms`), gabarits `schemas/blog-fr|en.md` à jour.

Volet C — parité Ressources (tout **done**) :
- `src/i18n/blog.ts` : + `blogCategories()` (étiquettes distinctes, ordre de première apparition — source PARTAGÉE menu + filtre).
- `src/components/Header.astro` : méga-menu Ressources (intro + CTA, Catégories → `/ressources/?categorie=<tag>`, 4 derniers articles), garde-fou parentHref orphelin, styles `.mega-res*`.
- `src/data/navigation/{fr,en}.json` : bloc `megaRessources` ; `cloudcannon.config.yml` : _inputs correspondants.
- `src/pages/[lang]/ressources/index.astro` : onglets de filtre (masqués si ≤ 1 catégorie), `data-tags`, script `astro:page-load`, `?categorie=` lu/écrit (replaceState), repli « Tous » sur catégorie inconnue.
- `src/pages/[lang]/ressources/[slug].astro` : fil d'Ariane (remplace le lien retour), layout 2 colonnes ≥ 1100px, aside sticky « Nos derniers articles » (2 cartes, `data-pagefind-ignore`), h2 marine + liseré `--color-accent-green`, `.article-cta` en bouton marine.
- `src/i18n/ui.ts` : + `blog.filterAll/filterAria`, `article.latestTitle/readMore/breadcrumbHome/breadcrumbAria` (fr + en).

## Environnement / spécificités

- Node 20.20.2, Astro 5.18.2, Tailwind 4.3.3 (`@tailwindcss/vite`), Pagefind 1.5.2, Playwright dispo (`npx playwright`).
- Exports Figma : `C:\Repo\Victrix\Design\Maquette & Front End\Export - {Homepage,expertise-productivite}\{code.html,DESIGN.md,screen.png}` — format Tailwind v3 (Play CDN + config inline), généré via Google Stitch.
- Étiquettes réelles du blog : FR `Nos articles`/`Nos actualités`/`Nos vidéos` ; EN `Our articles`/`Our news`/`Our videos`. Les « études de cas »/« livres blancs » du menu WP sont d'autres types de contenu (non migrés).
- Commandes : `node scripts/migration/wire-blog.mjs [--force|--dry-run|--include-drafts|--include-untranslated]`, idem `wire-services.mjs`, `node scripts/migration/fetch-media.mjs`, `node scripts/design/audit-export-tokens.mjs [--export <dir>]...`.

## Problèmes rencontrés et résolus

- **v4 : l'échelle d'espacement nommée masque `max-w-*`** — `--spacing-lg/xl` définis → `max-w-lg/xl` résolvent vers 24/40 px (colonne cassée). Fix : `max-w-[32rem]`/`[36rem]` dans le markup du lab ; à rejouer sur chaque export (recette, audit §5). `max-w-2xl/7xl` intacts (pas de spacing homonyme).
- **`i18n.prefixDefaultLocale: true` → 404 sur toute page hors `[lang]`** — design-lab déplacé sous `src/pages/[lang]/design-lab/` avec `getStaticPaths` FR seul.
- **`_routes.json` saturé (100 règles)** — l'adaptateur Cloudflare liste chaque fichier public individuellement ; les 120 médias consommaient tout le budget et les sources de redirection n'entraient plus (301 morts en prod adaptateur). Fix : compaction par globs dans la passe `victrix:redirects` (14 règles finales).
- **Échappements doublés SiteOrigen dans le staging services** (`\n`, `\"` littéraux affichés sur la page, 12 fichiers) — nettoyage récursif au câblage ; staging intact.
- **Data-store `.astro` wedgé (EPERM/ENOENT)** après réécriture en masse du contenu pendant que le dev server tourne — redémarrer le serveur, connu et récurrent.
- **Zombies `astro dev`** : TaskStop d'un `npm run dev` en fond tue le wrapper npm mais PAS l'enfant astro (Windows). 5 zombies accumulés sur 4321-4325, dont un servant un overlay d'erreur périmé, pendant que le serveur frais partait sur 4326. Nettoyage par `Get-CimInstance Win32_Process` filtré sur `Demo-victrix.*astro`. Consigné en mémoire.
- Impasses de scripts : `Move-Item` sur chemins `[lang]` exige `-LiteralPath` (jokers PS silencieux) ; `Set-Content` PS 5.1 re-encode en ANSI (mojibake) ; souris Playwright résiduelle sur la nav garde le méga-menu ouvert (`mouse.move` avant clic).

## Vérification / état des tests

- Gate complet VERT (2 fois : après volet B, après volet C) : lint 0 erreur (8 warnings préexistants), 110 tests, `astro check` 0 erreur, build prod + STATIC_ONLY.
- Pagefind : 26 → **126 pages indexées** (prod) ; sitemap 116 URLs, sans design-lab ni brouillons.
- CSS : les utilitaires sémantiques n'apparaissent QUE dans le bundle design-lab (site principal vérifié intact).
- Vérifs visuelles Playwright : design-lab vs screen.png (fidèle), article migré (avec table/vidéo non testés individuellement mais rendus), service imbriqué FR/EN + hreflang croisés, méga-menu Ressources au survol, filtre par clic ET par `?categorie=`.
- NON vérifié : éditeur visuel CloudCannon sur le contenu branché (vérif humaine post-push), 301 `:splat` sur Cloudflare réel, rendu EN du méga-menu (structure identique, non capturé).

## Questions ouvertes / décisions en attente

- Réception de l'export du design system final : déclenche re-run de l'audit, thème définitif, arbitrage des conflits §3, puis Phase 5.
- Gabarit d'URL CloudCannon des services imbriqués/slug EN : lien d'aperçu inexact (limite commentée dans le config) — solution à trouver quand CloudCannon permettra un gabarit par données.
- Migration des types « études de cas » et « livres blancs » (téléchargements dlm) : où et sous quelle forme.

## Risques / dépendances / bloqueurs

- Phase 5 (re-skin 23 composants + gabarits) est BLOQUÉE par l'export final du design system (décision user).
- Le méga-menu Ressources et le filtre reflètent les étiquettes du contenu : une passe éditoriale qui renomme les étiquettes change menu et onglets (comportement voulu, à savoir).
- Vérifications humaines CloudCannon toujours en attente (les 4 d'avant + contenu branché) — GO/NO-GO éditorial.

## Dette technique / reporté

- `theme-semantique.css` provisoire : fusion dans `theme.css` + renommage des 4 variables legacy = ouverture de Phase 5 (après export final).
- Brizy (23 pages), 27 pages WP, menus WP → navigation, 8 formulaires GF, rapatriement des ~820 médias restants, export des 5 200 entrées GF avant démantèlement WP.
- Page design-lab + demo-sections : à purger avant prod.
- `wire-*.mjs --force` pendant dev server = data-store wedgé (procédural, pas corrigé).

## Prochaines étapes

1. User : commit + push (2 commits suggérés : pipeline design / branchement + parité Ressources — commandes en fin de conversation).
2. Vérifs CloudCannon post-rebuild : méga-menu Ressources FR+EN, clic catégorie → index filtré, champ « Méga-menu Ressources » (Navigation), éditeur visuel sur un service imbriqué + un article migré, + les 4 vérifs antérieures.
3. Préversion Cloudflare : `/expertise/cybersecurite/zero-trust/` → 301 `/fr/services/…` ; recherche `/fr/recherche` sur le nouveau contenu.
4. À réception de l'export final : `node scripts/design/audit-export-tokens.mjs --export <dossier final>`, thème définitif, Phase 5.
5. En parallèle possible : extracteur Brizy (Claude Code), P-04 header de landing.

## Constats durables

- **Tailwind v4** : les tokens `--spacing-<nom>` masquent les tailles nommées `--container-*` pour `max-w-*` (et vraisemblablement `w-*`) ; la valeur DEFAULT d'un namespace se déclare par la variable nue (`--radius: 0.5rem`) ; le bare `rounded` v4 ≠ v3 (renommages de l'upgrade guide).
- **Astro i18n `prefixDefaultLocale: true`** : 404 sur toute URL sans préfixe de langue, y compris les pages physiquement hors `[lang]` (dev server).
- **Adaptateur Cloudflare** : `_routes.json` liste chaque actif public individuellement ; un dossier de médias volumineux sature le plafond de 100 règles et tue silencieusement les redirections `_redirects` (le worker avale la requête). Compacter par globs de dossiers.
- **Google Fonts css2** : `icon_names=` (triés) subsettte Material Symbols (3 Ko vs plusieurs Mo) ; l'URL du woff2 servie est sans extension (`/l/font?kit=…`).
- **Claude Code sur Windows** : TaskStop d'un `npm run dev` laisse l'enfant `astro dev` zombie sur son port ; `Move-Item` sans `-LiteralPath` échoue en silence sur les chemins à crochets ; `Set-Content` PS 5.1 ré-encode en ANSI.
- **Exports Figma/Stitch** : la config Tailwind embarquée peut DIVERGER d'un écran à l'autre (radii, fontFamily) et de son propre DESIGN.md — auditer chaque livraison, ne jamais présumer la cohérence.

## Statut des documents vivants

**OUI, à régénérer** (après le commit user) :
- `docs/GUIDE-PROJET.md` (le STATUS.md du projet, actuellement modifié par le user) : journal 29/07 (pipeline validé, contenu branché, parité Ressources), démontrable (126 pages indexées, blogue réel, services imbriqués), jalon 1bis (Phase 6 branchement blog+services FAITE pour les paires complètes ; Phase 5 en attente de l'export final — décision « référence unique »).
- `docs/plan-convergence-migration.md` : Phase 6 partiellement exécutée (branchement fait, restes = Brizy/pages/menus/forms/médias) ; Phase 5 re-gated sur l'export final du design system ; noter la recette de conversion d'exports (audit §5).
- `docs/plan-prompts.md` : si le backlog y référence le branchement ou la Phase 5, refléter les mêmes statuts.
- Pas de SCHEMA.md dédié : les schémas vivent dans `content.config.ts` (commentés) ; rien d'autre à régénérer.
