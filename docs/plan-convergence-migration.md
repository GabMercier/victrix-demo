# Plan de convergence — Demo-victrix → site cible victrix.ca

> Créé le 2026-07-24. Fait suite à [content-inventory.md](content-inventory.md) (inventaire WordPress validé comme base de travail).
> Objectif : faire évoluer **ce repo** (pas de nouveau scaffold) jusqu'à ce qu'il devienne le site de production, sans rien perdre du contenu WordPress ni des acquis CMS (P-01→P-07).

## Décisions actées (2026-07-24)

| # | Décision | Conséquence |
|---|---|---|
| 1 | **Évolution du repo existant** (pas de rescaffold) | Les acquis CloudCannon/Bookshop/forms v2/i18n sont conservés ; un repo « prod » propre pourra être seedé à la fin si désiré |
| 2 | **FR à la racine** (`/expertise/…`), EN sous `/en/…` | Alignement exact sur les URLs WordPress = zéro-404 ; refonte du routing `[lang]/` |
| 3 | **Tailwind v4 — adoption définitive** | Les maquettes Figma seront exportées avec un plugin Tailwind ; prérequis **Node 20** |
| 4 | **CloudCannon Forms** pour les soumissions | Aligné avec l'hébergement bundle CloudCannon (décision 17/07) ; **spike de validation d'abord**, repli = worker séparé réutilisant `/api/forms.ts` |

## Phases

L'ordre est pensé pour dé-risquer tôt (outillage, pilote Tailwind, URLs) avant les gros volumes (re-skin, conversion de contenu). Chaque phase peut être découpée en fiches P-2x dans [plan-prompts.md](plan-prompts.md). Les phases 5 et 6 peuvent avancer en parallèle (zones de collision différentes : composants vs contenu/scripts).

### Phase 0 — Prérequis outillage (~0,5 j) — ✅ FAITE (2026-07-29)

> Node 20.20.2 installé et activé (nvm), `npm ci` (rebuild ABI — a nécessité l'arrêt de 3 processus node zombies de l'ancien serveur dev qui verrouillaient node_modules), **gate complet vert sous Node 20** : lint 0 err/8 warns préexistants, 100 tests, type-check 0 err/4 hints, build prod (26 pages indexées Pagefind) + `STATIC_ONLY` — c'est la **baseline de parité** pour les phases suivantes. Phase 1 (pilote Tailwind v4) DÉBLOQUÉE.

- **Node 18 → 20** sur la machine de dev (`nvm install 20` + `nvm use`, terminal admin requis par nvm-windows) ; `.nvmrc`=20 et `engines>=20.3.0` sont déjà en place.
- `npm ci` après bascule (rebuild sharp/esbuild pour le nouvel ABI), redémarrer le dev server.
- Revalider le gate complet sur la base inchangée : lint, 100 tests, type-check, build normal + `STATIC_ONLY` (copie isolée si dev server actif — voir operations.md §3.1). → **baseline de parité** pour toute la suite.
- Note : l'épinglage Astro v5 tenait à Node 18 ; on **reste sur Astro 5** pour la convergence (une montée Astro éventuelle = chantier séparé, après).

### Phase 1 — Pilote Tailwind v4 (~1–1,5 j) — 🟡 EXÉCUTÉE (2026-07-29, vérif CloudCannon humaine restante)

> FAIT : `tailwindcss` + `@tailwindcss/vite` (plugin vite dans astro.config.mjs), `src/styles/theme.css` (**imports granulaires SANS preflight** — le reset changerait tout le site; conséquences documentées dans l'entête : `border-solid` explicite, `m-0` où le navigateur met des marges), tokens `@theme` Luminous Precision à **noms distincts des legacy** (nuit/royal/céleste/givre/bordure/encre + `--font-grotesk`, ombres ambiantes, radius carte/contrôle — une collision avec `--color-surface`/`--font-sans`/`--radius-*` de tokens.css ferait perdre les couches en silence), **Hanken Grotesk variable auto-hébergée** (`public/fonts/HankenGrotesk-Variable.woff2`, 34,7 Ko latin 100–900, pas de CDN — CSP), `testimonial.astro` re-skinné 100 % utilitaires (zéro CSS scopé, carte Level 2 de la charte).
> PREUVES : gate vert (lint 0/100 tests/type-check 0, build prod + STATIC_ONLY — dans vvbuild : l'EBUSY AV sur `c:\Repo\...\dist` a récidivé, la copie isolée reste la voie fiable), **parité 37/39 pages à l'octet** (modulo hash des bundles — seules les 2 landings demo-sections, hôtes du témoignage, diffèrent), utilitaires + tokens + @font-face présents dans le CSS de build, marqueur `bookshop-live params(contentBlocks:sections)` non vide.
> RESTE (humain, = LE risque de la phase) : après push, ouvrir une landing demo-sections dans l'éditeur VISUEL CloudCannon et confirmer que le témoignage rend avec le style Luminous Precision et reste éditable en live. Si oui → GO Phase 5 par lots.

But : prouver Tailwind v4 **dans la chaîne complète** (build Astro + Bookshop + éditeur visuel CloudCannon) avant d'y engager les 23 composants.

- Intégration : `@tailwindcss/vite` dans `astro.config.mjs` (pas de `tailwind.config` — v4 se configure en CSS).
- **Tokens Luminous Precision → `@theme`** dans un `src/styles/theme.css` : palette (surface/primary `#00020a`/primary-container `#001B44`/secondary `#0038e6`/tertiary céleste, états on-*), police **Hanken Grotesk** (self-hostée, pas de Google Fonts CDN — CSP), radius (0.25/0.5/0.75/1 rem), spacing 4px, typo headline-xl→label-sm. Source de vérité : `C:\Repo\Victrix\Design\Maquette & Front End\*\DESIGN.md`.
- Pilote sur **1 composant Bookshop** (suggestion : `testimonial`, petit et isolé) : classes Tailwind dans le markup, retrait du CSS scopé.
- Critères de sortie : gate vert, `STATIC_ONLY` vert, **live editing CloudCannon revalidé sur le composant pilote** (le CSS Tailwind est du CSS build-time chargé par l'éditeur — à prouver, c'est LE risque de la phase), parité byte du reste du site.
- Pièges attendus : globs de détection de classes couvrant `component-library/**` ; coexistence utilitaires ↔ CSS scopé existant (règle : un composant est soit re-skinné Tailwind, soit intact — pas d'hybride).

### Phase 2 — FR à la racine (~1,5–2 j)

But : les URLs du repo = les URLs de l'inventaire ([urls-contenus.csv](migration/urls-contenus.csv)).

- Refonte du routing `src/pages/[lang]/…` → FR sans préfixe, EN sous `/en/` (approche à trancher en début de session : catch-all `[...lang]` avec segment vide pour fr, ou duplication de routes racine + `en/` fines wrappers ; garder la logique commune factorisée).
- Impacts à traiter dans la même phase : `getStaticPaths` de toutes les routes, liens internes/`ctaHref`, sélecteur de langue, `hreflang`, sitemap, redirections `/fr/*` → `/*` (les URLs du prototype circulent déjà : préversions, CloudCannon), intégration `victrix:i18n-pairing`, tests (les 100 existants encodent des chemins `/fr/…`).
- Alignement de nommage à décider ici (c'était P-17/P-18) : le préfixe provisoire `services` vs `expertise` du site actuel. **Recommandation : adopter `/expertise/…` tel quel** (zéro redirection sur le contenu le plus profond du site).
- Critère de sortie : les URLs publiées de l'inventaire résolvent en 200 sur un build local (script de vérification à écrire contre le CSV).

### Phase 3 — Ménage prototype (~0,5–1 j)

- Retirer **Sveltia** (`public/admin/`, bloc CSP `/admin`, worker OAuth) — CloudCannon est l'éditeur.
- Purger les contenus de démo (`demo-sections` fr/en, reliquats de test), décider du sort des pages campagnes de démo.
- **Portail client** : reste mock, derrière noindex (périmètre inchangé — décision inventaire Q7 à confirmer).
- Adapter Cloudflare : conservé en build-only tant que la préversion CF sert de démo ; la cible d'hébergement est CloudCannon (`STATIC_ONLY`).

### Phase 4 — Formulaires → CloudCannon Forms (spike ~0,5 j + intégration ~0,5 j)

- **Spike** : brancher le `form.astro` existant (POST) sur CloudCannon Forms et vérifier point par point : notification par **destinataire par formulaire**, redirection vers `/merci` par langue, stockage des soumissions au dashboard (remplace le stockage Gravity Forms), anti-spam (honeypot/captcha et son impact CSP), champ consentement Loi 25 conservé, jetons `{{page.*}}`/`{{url.*}}`.
- Points de vigilance connus (forces de l'actuel `/api/forms.ts` à ne pas perdre silencieusement) : validation des requis **côté serveur**, liste blanche des selects, objet du courriel résolu depuis la définition, courriel de confirmation au visiteur (si CloudCannon ne le fait pas → décider : abandon assumé ou repli).
- **Repli si bloquant** : worker Cloudflare séparé réutilisant `/api/forms.ts` + SMTP2GO tel quel.
- Hors périmètre CloudCannon Forms : le **gating des PDF** (échange lead ↔ document, inventaire Q4) — décision séparée (libérer les PDF ou petit worker de liens signés).

### Phase 5 — Design system Luminous Precision (par lots, en parallèle de la 6)

- Re-skin des 23 composants Bookshop **par lots**, dans l'ordre des maquettes disponibles : (1) chrome — header/footer/nav (maquette Homepage) ; (2) sections d'accueil ; (3) sections service/expertise (maquette expertise-productivite) ; (4) le reste + nouvelles sections issues des exports Figma→Tailwind.
- Parité **fonctionnelle** exigée (tests, contrats de sections, live editing) ; parité **visuelle** non exigée — c'est le but du re-skin. Les 4 contrats par section et les specs `.bookshop.yml` restent inchangés sauf ajout de champs.
- Les exports Figma+plugin Tailwind arrivent comme **matière première** (markup de référence), pas comme composants finaux : ils passent par le moule Bookshop (browser-safe, frontmatter-bindé, tokens `@theme` au lieu de valeurs codées en dur).

### Phase 6 — Conversion de contenu (le gros morceau, s'appuie sur `scripts/migration/`)

Prérequis : décisions §16 de l'inventaire (brouillons, contenus sans traduction, archives catégories, landings d'événements).

- Étendre les scripts existants en **convertisseurs** rejouables (patron de `migrate-expertise-to-service.mjs`) :
  - 78 expertises → collection `services` (arborescence 3 niveaux, sections depuis SiteOrigin d'abord, Brizy ensuite — HTML en clair dans le WXR) ;
  - 64 articles → collection blog (catégories, dates, auteurs, paires de traduction) ;
  - pages → collections/landings selon le cas (légales = rich-text ; Ressources = à recomposer, contenu dans le thème Blade → récupérer du live) ;
  - SEO : `seo_title`/`seo_metadesc`/`noindex` du CSV → frontmatter ;
  - [menus.json](migration/menus.json) → collections navigation ; [redirections.csv](migration/redirections.csv) → `src/data/redirects.json` ;
  - 8 formulaires actifs → `src/data/forms/` ;
  - 943 médias rapatriés (arborescence à décider : conserver `/wp-content/uploads/…` en chemins publics = zéro redirection média, ou re-arborer + règles de redirection).
- Ordre de conversion : articles (les plus réguliers) → expertises SiteOrigin → expertises Brizy → pages.
- **✅ AVANCÉ (2026-07-29) — articles convertis en STAGING** : `scripts/migration/convert-articles.mjs` (rejouable) → `docs/migration/staging/blog/{fr,en}/` (64 articles : 30 paires FR/EN + 2 publiés FR seuls + 2 brouillons FR) + `rapport-articles.md` (75 médias référencés, 7 articles vidéo avec iframes→liens, avertissements par article). Déshabillage SiteOrigin (blocs `textwidget`), HTML→Markdown (listes imbriquées et `<li>` orphelins gérés), URLs internes relativisées (structure FR racine), images ramenées aux originaux (`/wp-content/` conservé), slug d'URL par langue en frontmatter (fichiers homonymes fr/en). **PAS branché dans `src/content/blog/`** — prérequis avant le port : décisions Q1 (brouillons) et Q2 (sans-traduction) du §16, choix du schéma (coverImage en chemin public vs asset, seoTitle/author à ajouter à la collection), et rapatriement des médias.
- Critère de sortie : chaque URL de l'inventaire rend une page avec le contenu migré ; vérification automatique contre le CSV.

### Phase 7 — Bascule (plus tard, hors périmètre immédiat)

DNS, activation des redirections legacy, resoumission sitemap (GSC/Bing), **export des 5 200 entrées Gravity Forms + PDF `dlm_uploads/` AVANT** décommission WordPress. Avant la bascule : URL de production définitive dans `astro.config.mjs` (`site:`) + hôte du sitemap dans `robots.txt` (checklist §6.3 de [seo-strategie.md](seo-strategie.md)).

## Transversal — recherche interne et SEO (ajout 2026-07-28)

- **Recherche interne : ✅ FAITE (P-06, Pagefind)** — index statique généré au build (les deux modes), page `/recherche` FR/EN, entrée header, index par langue avec racinisation. **Impact sur ce plan : nul en effort, positif en valeur** — l'index se régénère à chaque build, donc les contenus migrés en Phase 6 deviennent cherchables automatiquement. Deux points de vigilance seulement : (a) tout nouveau gabarit de page doit passer par `BaseLayout` (c'est lui qui pose `data-pagefind-body`); (b) en Phase 2 (FR à la racine), le chemin `/recherche` suit le régime commun des URLs — rien de spécifique. Option post-migration : filtres par type de contenu (`data-pagefind-filter` sur les gabarits) si le volume le justifie.
- **SEO : couverture et argumentaire dans [seo-strategie.md](seo-strategie.md)** (équivalence Yoast→natif, gouvernance CloudCannon, checklist rédaction, backlog priorisé). Rappels d'ancrage dans ce plan : les champs `seo_title`/`seo_metadesc`/`noindex` du CSV sont reversés en frontmatter en **Phase 6** (déjà prévu ci-dessus), les 85 redirections en Phase 6, la vérification zéro-404 est le critère de sortie des Phases 2 et 6, la resoumission GSC/Bing est en Phase 7. Écarts restants à planifier hors convergence : P-12 (fil d'Ariane + BreadcrumbList), P-14 (RSS), P-10/P-11 (analytics + suivi site search sous consentement).

## Gate par phase

Chaque phase se termine par : lint 0 err · tests verts (mis à jour si la phase change des contrats) · type-check 0 err · build normal + `STATIC_ONLY` · vérification CloudCannon (live editing) quand des composants/collections bougent · parité (byte ou fonctionnelle selon la phase) contre la baseline de la phase 0. Builds en copie isolée si le dev server tourne ([[avoid-concurrent-astro]]).

## Estimation grossière

| Phase | Effort |
|---|---|
| 0 — Outillage Node 20 | 0,5 j |
| 1 — Pilote Tailwind v4 | 1–1,5 j |
| 2 — FR à la racine | 1,5–2 j |
| 3 — Ménage | 0,5–1 j |
| 4 — CloudCannon Forms | 1 j |
| 5 — Re-skin design system | 3–5 j (par lots) |
| 6 — Conversion de contenu | 4–6 j (scripts + reprise manuelle) |
| **Total convergence** | **~12–17 j** (hors bascule/DNS) |

À réconcilier avec l'estimé DevOps externe et le backlog P-2x de plan-prompts.md.
