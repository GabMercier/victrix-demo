# Digest — recherche interne, migration de contenu, convergence (Phases 0-3)

- **Date :** 2026-07-28 au 2026-07-30 (un fil continu sur 3 jours)
- **Type :** Session dev (build ; secondaires : migration de contenu, débogage)
- **Projet :** Refonte victrix.ca, Astro 5 + CloudCannon, branche `spike/cloudcannon`. Phase : convergence du prototype vers le site de production (vague 2 CMS + Phases 0-3 du plan de convergence).
- **En une ligne :** la recherche interne est livrée, 119 des ~150 contenus WordPress sont convertis en staging, Node 20/Tailwind v4 sont en place (pilote fait), l'architecture « services » est consolidée et la planification marketing (bannière, articles) fonctionne.
- **Classer dans :** Projet « Victrix » (claude.ai) + `docs/digests/` (ce fichier).
- **Sujets couverts :** P-06 Pagefind ; doc SEO marketing ; convertisseurs WXR (articles, expertises) ; Phase 0 Node 20 ; Phase 1 pilote Tailwind ; hotfix éditeur visuel ; consolidation expertises→services ; retrait Sveltia ; groupes CloudCannon ; planification (bannière + articles) ; workflow de rebuild.
- **Périmètre de la session — PAS touché :** les 23 pages Brizy, les 27 pages WP, menus/redirections/formulaires GF (conversion), P-04 (header de landing), Phase 2 (FR à la racine), Phase 5 (re-skin des 23 composants), rapatriement des médias.

## Décisions prises

| Décision | Raison | Statut |
|---|---|---|
| P-06 (recherche) exécuté AVANT P-04, ordre de la vague 2 inversé | Priorité utilisateur explicite ; P-04 devra gérer l'icône recherche dans ses modes de header (fiche §7 amendée) | ferme |
| CSP : ajout de `'wasm-unsafe-eval'` sur /fr/* et /en/* | Le WASM local de Pagefind l'exige sur Chrome ; n'autorise que la compilation wasm, pas eval JS | ferme |
| Tailwind v4 SANS preflight + tokens à noms non-collisionnels (nuit, royal, celeste, givre, bordure, encre, `--font-grotesk`) | Le reset changerait tout le site existant ; les tokens legacy (`--color-surface`, `--font-sans`, `--radius-*`) gagneraient en silence contre les couches `@layer` | ferme jusqu'à la Phase 5 (préflight à réévaluer au re-skin complet) |
| Expertises = Services : collection/route/contenus `expertises` SUPPRIMÉS, 301 vers `/services/intelligence-artificielle`, menu renommé « Services » | Confirmation utilisateur (30/07) : c'est la nouvelle architecture ; anticipe une partie de P-17 | ferme ; MAIS voir question ouverte sur le préfixe d'URL final |
| Migration en STAGING d'abord (`docs/migration/staging/`), rien de branché dans `src/content/` | Revue humaine + décisions §16 requises avant le port ; conversion rejouable | ferme |
| Planification = fenêtres évaluées AU BUILD + rebuild quotidien planifié | Réalité d'un site statique ; pas de scheduling natif CloudCannon | ferme ; extension aux sections = P-23 (backlog) |
| Chemins médias `/wp-content/uploads/...` conservés (champs de transition) | Zéro redirection média ; recommandation de l'inventaire | tentatif (à confirmer Phase 6) |
| Sveltia retiré (public/admin, CSP /admin, robots) | Phase 3 du plan ; CloudCannon est l'éditeur validé | ferme |
| Appariement FR/EN du staging : nom de fichier = slug (ou chaîne hiérarchique) FR pour les DEUX langues, slug réel dans le frontmatter | Convention du dépôt (fichiers homonymes = paire de traduction) | ferme pour le staging |

## Ce qui a été construit ou changé

Tout est **fait (vérifié)** sauf mention contraire.

**Recherche interne (P-06)** : intégration `victrix:pagefind` dans `astro.config.mjs` (les 2 modes de build, garde-fou 0 page, exclusion `/pagefind/*` de `_routes.json`) ; page `src/pages/[lang]/recherche.astro` (noindex, hors sitemap, PagefindUI locale, traductions via bloc `search` de `src/i18n/ui.ts`, `?q=` supporté, repli dev server) ; icône header + lien tiroir (`src/components/Header.astro`) ; périmètre d'index = `data-pagefind-body` sur `<main>` quand !noindex (`src/layouts/BaseLayout.astro`) ; noindex ajouté à `404.astro` et aux 2 pages portail ; `data-pagefind-ignore` sur `related-posts` ; méta/tri de date sur les articles ; `public/_headers` (wasm).

**SEO** : `docs/seo-strategie.md` (équivalence Yoast→natif, migration des métadonnées, gouvernance CMS, backlog priorisé).

**Migration (staging, non branché)** : `scripts/migration/lib-wxr.mjs` (helpers partagés) ; `convert-articles.mjs` → `docs/migration/staging/blog/{fr,en}/` (64 articles : 30 paires, 2 FR seuls, 2 brouillons) + `rapport-articles.md` ; `convert-expertises.mjs` → `docs/migration/staging/services/{fr,en}/<hiérarchie>.json` (55 SiteOrigin ; 23 Brizy reportées) + `rapport-expertises.md` ; 142 + 75 médias recensés.

**Convergence** : Phase 0 faite (Node 20.20.2 actif, `npm ci`, gate baseline vert). Phase 1 faite côté build : `src/styles/theme.css` (@theme Luminous Precision), plugin `@tailwindcss/vite`, `public/fonts/HankenGrotesk-Variable.woff2` (34,7 Ko, latin, 100-900), `testimonial.astro` re-skinné 100 % utilitaires. Phase 3 faite : Sveltia retiré.

**Hotfix éditeur** : `component-library/src/shared/astro/page.astro`, garde-fou related-posts conditionné à `isBuildRender = Boolean((import.meta.env ?? {}).SSR)`.

**CMS + planification** : `collection_groups` (Contenu du site / Marketing / Configuration) dans `cloudcannon.config.yml` ; `src/lib/schedule.ts` + `schedule.test.ts` ; `announce.startAt/endAt` (zod `scheduleBound`, entrées datetime CMS) ; articles à date future différés (`filterPublished` de `src/i18n/blog.ts`, param `now` testable) ; `.github/workflows/rebuild-planifie.yml` (cron 06:17 UTC + manuel) ; docs (`operations.md` §7bis, `guide-edition.md` sections « Planifier » et « Créer une page Services »).

**Liens re-câblés** : `src/data/navigation/{fr,en}.json` (menu « Services », méga-menu `/services/*`, lien IA via champ `service`), footer de `ui.ts`, cartes de `src/content/home/{fr,en}/accueil.json`, redirections dans `astro.config.mjs`.

## Environnement / faits de pile

- Node **20.20.2** (nvm-windows ; `nvm use` a fonctionné sans terminal admin, mais `node` est introuvable dans la MÊME invocation shell, ouvrir une nouvelle invocation). Astro **5.18.x** (rester en v5). Tailwind **v4** (`@tailwindcss/vite`, pas de tailwind.config). Pagefind **1.5.2** (devDependency `pagefind`).
- Tests : **110** (vitest). Gate : `npm run lint` ; `npm test` ; `npm run type-check` ; `npm run build` ; `STATIC_ONLY=1 npm run build`.
- Builds de vérification : copie isolée `C:\Users\gmercierblouin\vvbuild` (robocopy `/MIR` avec `/XD` en CHEMINS ABSOLUS ; l'EBUSY antivirus sur `c:\Repo\...\dist` persiste sous Node 20, la copie isolée est la voie fiable).
- Sources migration : WXR `C:\Repo\Victrix\siteWP\export\*.xml` ; SQL `victrix_bdd.sql` ; maquettes `C:\Repo\Victrix\Design\Maquette & Front End\*\DESIGN.md`.
- CloudCannon : build `STATIC_ONLY=1`, postbuild `npx @bookshop/generate` ; schémas de création `schemas/service-{fr,en}.json`.
- Secret GitHub à créer (OPS) : `REBUILD_HOOK_URL` (build hook CloudCannon ou deploy hook Cloudflare) pour le workflow de rebuild.
- URL de site provisoire partout : `https://victrix-demo.pages.dev` (canonical/sitemap/robots, à changer avant bascule).

## Problèmes rencontrés et résolutions (avec impasses)

- **robocopy `/XD dist` relatif** exclut TOUS les `dist` du sous-arbre, y compris `node_modules/astro/dist` : chemins absolus obligatoires (déjà documenté operations.md §3.1, revécu quand même).
- **`page_count` de l'API Pagefind = pages DÉCOUVERTES, pas indexées** (39 vs 16) : vérifier `dist/pagefind/pagefind-entry.json`, pas le log.
- **`npm ci` EPERM sur rollup natif** : 3 processus node ZOMBIES d'un ancien `astro dev` verrouillaient node_modules alors que rien n'écoutait sur le port (netstat vide ne prouve pas l'absence de verrou). Diagnostic : `Get-CimInstance Win32_Process` filtré sur la ligne de commande ; ne tuer que les processus du dépôt.
- **Corpus expertises : le contenu vit dans ~470 widgets custom du thème MAG** (`[siteorigin_widget class="MAG_*"]` + `<input hidden value="JSON encodé">`), pas dans les blocs éditeur (6 seulement). Ce JSON est MAL ÉCHAPPÉ (guillemets internes sans antislash) : `JSON.parse` impossible, moisson par regex à terminateurs structurels. Les `\n` du JSON ont perdu leur antislash dans la base (`</h1>nChez`) : réparation heuristique `>n` devant majuscule.
- **Listes imbriquées et `<li>` orphelins** : toute regex non-gourmande `[\s\S]*?</tag>` casse sur l'imbrication : balayage équilibré (`balancedEnd`) partout ; certains widgets gardent le `<ul>` dans l'habillage, les runs de `<li>` orphelins sont reconstruits.
- **« Error rendering page! » dans l'éditeur visuel des services** : le garde-fou related-posts jetait aussi dans le re-rendu navigateur (où `enrich` est TOUJOURS absent). Fix : garde limité au rendu SSR ; l'éditeur montre la maquette factice. Contre-preuve rejouée : le build négatif casse toujours.
- **`Set-Content -Encoding utf8` (PowerShell 5.1) écrit un BOM** : le loader glob d'Astro (`JSON.parse`) casse sur les JSON réécrits. Fix : `[System.IO.File]::WriteAllText` avec `UTF8Encoding($false)`.
- Divers PowerShell : `$home` est une variable RÉSERVÉE (lecture seule) ; `-match` est insensible à la casse (`-cmatch` pour les vérifications) ; import ESM Windows exige une URL `file:///C:/...`.
- **Police Google Fonts** : le premier `url()` du CSS css2 n'est pas le bon subset (1,7 Ko) ; prendre le bloc `@font-face` contenant `U+0000-00FF`.

## Vérification / état des tests

- **Vérifié** : gate complet vert à chaque bloc (final : lint 0 err/8 warns préexistants, 110 tests, type-check 0 err, build prod + STATIC_ONLY) ; parité 37/39 pages à l'octet pour le pilote Tailwind (seules les 2 demo-sections diffèrent) ; refactor lib-wxr prouvé par staging byte-identique ; index Pagefind = exactement les pages voulues (fragments inspectés, 0 fuite) ; build négatif related-posts (exit 1, message intact) ; redirections expertises→services et liens re-câblés vérifiés dans le dist.
- **Non vérifié (humain, en attente)** : 4 vérifications CloudCannon après push : (1) hotfix éditeur sur le service IA, (2) témoignage Tailwind sur demo-sections (= GO/NO-GO Phase 5), (3) barre latérale groupée + « + Ajouter » Service, (4) champs Diffuser/Retirer sur la bannière. Plus : `/fr/recherche` sur la préversion Cloudflare (WASM/CSP en conditions réelles).
- **Écrit mais jamais exécuté** : `.github/workflows/rebuild-planifie.yml` (tournera à vide tant que le secret n'existe pas, c'est voulu).

## Questions ouvertes

1. **Préfixe d'URL final : `/expertise/` (WordPress, recommandation zéro-404 du plan) vs `/services/` (démo consolidée)**. La consolidation 30/07 a basculé la démo sur `/services/` ; la Phase 2 devra trancher : soit adopter `/services/` et générer les 301 depuis les 174 URLs `/expertise/...` de l'inventaire, soit revenir à `/expertise/` comme préfixe de la collection. À décider avant la Phase 2/6.
2. **§16 Q1** : migrer les brouillons (2 articles, 5 expertises) ?
3. **§16 Q2** : assumer les contenus FR sans traduction (2 articles, quelques expertises) ?
4. **Médias** : confirmer la conservation de l'arborescence `/wp-content/uploads/` puis rapatrier (142 + 75 fichiers listés).
5. **Schéma blog au branchement** : coverImage en chemin public vs asset `image()` ; ajouter seoTitle/author à la collection ?

## Risques / dépendances / bloqueurs

- La **vérification CloudCannon du témoignage** conditionne la Phase 5 (re-skin 23 composants).
- Le **secret `REBUILD_HOOK_URL`** conditionne la planification réelle (sinon les contenus programmés ne paraissent qu'au prochain push).
- **OPS hors dépôt** : décommissionner le worker OAuth Sveltia (`sveltia-cms-auth.gabriel-mercier-blouin.workers.dev`).
- **Avant décommission WordPress** (Phase 7) : exporter les 5 200 entrées Gravity Forms + les PDF `dlm_uploads/`.
- Machine : EBUSY antivirus sur `c:\Repo` (builds en copie isolée), envisager une exclusion Defender.

## Dette technique / reporté

- 23 pages **Brizy** (extracteur dédié, HTML compilé `brz-*`) ; 27 **pages** WP ; menus→navigation ; 85 redirections→`redirects.json` ; 8 formulaires GF→`src/data/forms/` ; recomposition éditoriale des rich-text en sections riches (numbered-cards, feature-boxes).
- `'unsafe-inline'` dans script-src (durcissement par hash, TODO documenté) ; logo Organization ≥112 px ; `dateModified` sur BlogPosting ; hôte du sitemap en dur dans robots.txt ; purge de `demo-sections` à la vraie mise en prod.
- Backlog : P-04 (header de landing, fiche amendée), P-22 (formulaires multi-étapes), P-23 (planification des sections).

## Prochaines étapes (ordre)

1. Utilisateur : commit + push du bloc auto (consolidation, Sveltia, planification, hotfix, digest).
2. Vérifications CloudCannon (les 4) + `/fr/recherche` sur la préversion. → GO/NO-GO Phase 5.
3. OPS : secret `REBUILD_HOOK_URL` + décommission worker Sveltia.
4. Si GO : Phase 5 par lots (chrome d'abord, maquette Homepage) ; sinon P-04 (Sonnet 5).
5. Décisions §16 + préfixe d'URL → brancher le staging blog dans `src/content/blog/`.
6. Extracteur Brizy + conversion des 27 pages + menus/redirections/formulaires.
7. Phase 2 (FR à la racine) avec la décision d'URL prise ; vérification zéro-404 contre le CSV.

## Constats durables (réutilisables)

- **Pagefind** : partition par `<html lang>` avec wasm de racinisation par langue ; exige `'wasm-unsafe-eval'` en CSP ; `data-pagefind-body` sur UNE page exclut toutes celles qui ne l'ont pas ; pages `noindex` ignorées nativement.
- **Bookshop/CloudCannon** : le re-rendu navigateur de l'éditeur n'a JAMAIS les props `enrich` du build ; tout garde-fou du renderer partagé doit être conditionné à `import.meta.env.SSR` (accès défensif, l'objet env peut manquer dans le bundle navigateur).
- **Tailwind v4 en cohabitation** : les tokens `@theme` vivent dans des couche(s) `@layer` qui PERDENT contre le CSS non-couché ; nommer les tokens sans collision avec les variables existantes, sinon résolution legacy silencieuse. Sans preflight : `border-solid` explicite, `m-0` manuels.
- **WordPress/SiteOrigin (thème MAG)** : le contenu réel est dans les widgets custom au JSON mal échappé ; moisson regex, jamais `JSON.parse` ; toujours balayer les balises en équilibrant (imbrication).
- **PowerShell 5.1** : `Set-Content/Out-File -Encoding utf8` = BOM (utiliser .NET `UTF8Encoding($false)` pour tout fichier lu par un outil) ; `$home` réservé ; `-match` insensible à la casse ; robocopy `/XD` relatif = piège.
- **nvm-windows** : `nvm use` peut réussir hors admin ; le PATH du processus courant ne voit pas `node` avant une nouvelle invocation.

## Statut des documents vivants

Ce dépôt a ses propres documents vivants, tenus À JOUR pendant la session (convention du projet) :
`GUIDE-PROJET.md` (rôle PROJECT+STATUS), `plan-prompts.md` (DECISIONS+journal), `plan-convergence-migration.md` (phases), `operations.md`, `seo-strategie.md`, mémoire agent.

**Régénération nécessaire : OUI, une retouche** à `GUIDE-PROJET.md` : le bloc auto du 30/07 (consolidation services, retrait Sveltia, planification) n'y est pas encore reflété (journal des décisions + « démontrable »). Tout le reste est déjà absorbé.
