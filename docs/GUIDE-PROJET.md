# Guide du projet — refonte victrix.ca

> **Point d'entrée unique.** Ce document répond à « qu'est-ce qu'on est en train
> de faire, où en est-on, et où est le reste ? ». État au **14 juillet 2026**.

## La vision en trois phrases

Remplacer le site WordPress actuel par une fondation moderne — **Astro (site
statique) + CloudCannon (édition visuelle) + Cloudflare Pages (hébergement)** —
qui donne au marketing son autonomie d'édition, une vitesse et une sécurité
maximales par construction, et un coût récurrent quasi nul. La stratégie est
**« fonctionnel d'abord »** : livrer une v1 complète sur le design actuel, puis
appliquer la refonte graphique comme une « re-peau » (tout le visuel est
centralisé dans des design tokens — `src/styles/tokens.css`). Le choix de pile
est argumenté face aux sceptiques dans `analyse-criteres.md`.

## Décisions structurantes (journal)

| Date | Décision | Où c'est documenté |
|---|---|---|
| Juin 2026 | Pile Astro statique + éditeur Git, réalisation interne (vs 2 soumissions agence WordPress) | `Proposition-Refonte-victrix.docx` |
| 13 juil. | Analyse des 10 critères marketing : 7 natifs/plus forts, 2 chantiers, 1 compromis | `critères.md` + `analyse-criteres.md` |
| 13 juil. | Estimation révisée **26–34 j** (+4–7 j éditeur visuel) après lecture du cahier des charges | `analyse-criteres.md` |
| 13 juil. | Pivot éditeur visuel : **CloudCannon d'abord** (spike balisé), Tina en relève, Sveltia à retirer après verdict | `plan-pivot-editeur.md` |
| 13 juil. | Pas de nouveau dépôt : spike sur branche, dépôt de prod semé de la branche gagnante plus tard | `plan-pivot-editeur.md` |
| 14 juil. | CloudCannon connecté (site « Vic-demo », branche `spike/cloudcannon`), premier build réussi | `spike-cloudcannon.md` |
| 14 juil. | **Pas de maquettes pour l'instant** : v1 fonctionnelle sur le design actuel, refonte graphique ultérieure via tokens | ce document + `plan-2026-07-15.md` |
| 14 juil. | Stratégie de publication CloudCannon retenue : **Publishing → main** (le marketing édite sur `spike/cloudcannon`, le bouton Publish avance `main`, qui redéploie la prod) ; options éditeur/hébergement pour des décisions futures documentées (réversibilité : CloudCannon/Tina/Sveltia et Cloudflare/Azure sont deux choix indépendants) | `options-editeur-hebergement.md` + `operations.md` |
| 17 juil. | **Hébergement cible : CloudCannon en bundle (CMS + hébergement) pour cette version; Azure Static Web Apps = l'alternative documentée.** Cloudflare Pages reste l'infra du spike/démo seulement. **Entra External ID et Dataverse : hors périmètre de cette version** (le portail demeure un prototype maquetté). | `.env.example` + `options-editeur-hebergement.md` |
| 24 juil. | **Migration WordPress→Astro cadrée** : inventaire de contenu généré (174 URLs, 78 expertises, 64 articles, 85 redirections, métadonnées Yoast extraites) + plan de convergence 7 phases (~12–17 j). Décisions : évolution du dépôt actuel (pas de rescaffold), **FR à la racine**, **Tailwind v4** (prérequis Node 20), CloudCannon Forms (spike d'abord). | `content-inventory.md` + `plan-convergence-migration.md` |
| 28 juil. | **Recherche interne livrée (P-06, Pagefind)** — index statique au build, FR/EN séparés, page `/recherche` + icône header; passée AVANT P-04 (priorité utilisateur). **Stratégie SEO sans plugins documentée** pour le marketing. CSP : ajout ciblé `'wasm-unsafe-eval'` (wasm local Pagefind). | `seo-strategie.md` + ligne P-06 de `plan-prompts.md` |
| 30 juil. | **Architecture consolidée : les expertises SONT les services** (collection legacy supprimée, 301 vers `/services/…`, menu « Services ») — préfixe d'URL FINAL à trancher en Phase 2 (`/expertise` WP vs `/services`). **Sveltia retiré** (Phase 3). **Planification marketing livrée** : bannière promo à fenêtre de dates + articles à date future différés + rebuild quotidien (secret OPS `REBUILD_HOOK_URL` à brancher). Barre latérale CloudCannon groupée. | journal `plan-prompts.md` 30/07 + `operations.md` §7bis + digest `docs/digests/` |
| 4 août | **Maquettes finales + design system reçus** (`docs/design/` : .fig, 5 exports HTML, planche) ; images rapatriées en local (5 déjà mortes côté Google, à ré-exporter du .fig). **Références de la refonte tranchées (v2)** : STRUCTURE des pages = exports HTML · SYSTÈME visuel = planche `DesignSystemVictrix.png` — rôles Material conservés, valeurs ré-ancrées sur les 6 couleurs de la planche (Bleu Victrix `#1A5BFF`, Bleu nuit, ivoire/beige/sable, anthracite ; dérivés à valider) ; `rounded-full` reste rond (artefact d'export signalé). **Pipeline Figma→Tailwind v4 REVALIDÉ** sur un port complet, puis **BASCULE GLOBALE DU SITE sur le nouveau système** (le WordPress reste la prod publique ; notre version EST la refonte) : tokens legacy re-mappés sur les ancres (re-peau instantanée de toutes les pages), Hanken Grotesk partout (Montserrat retirée), collisions `tokens.css`/@theme levées par renommage, **design-lab PURGÉ** — la page `/fr/style-guide` devient la référence vivante « Design System Victrix ». Reste : re-skin fin composant par composant (accents hérités, nouvelles sections des maquettes). | `arbitrages-design-a-trancher.md` (v2) + `analyse-reception-maquettes-finales.md` + `audit-tokens-figma.md` §5 |

## Ce qui fonctionne aujourd'hui (démontrable)

- **Site bilingue FR/EN** fidèle au site actuel : accueil, expertise IA,
  ressources (blogue), contact, 404 — slugs par langue, hreflang, sitemap
  bilingue, redirections 301 des anciennes URLs.
- **Landing pages composables** (`/fr|en/campagnes/…`) : le marketing assemble
  hero / bénéfices / FAQ / formulaire / appel à l'action depuis une palette
  dans CloudCannon, avec `noindex` par défaut (critère 4 + 5).
- **Édition CloudCannon** : collections Blogue, Accueil, Expertises, Campagnes,
  **Navigation, Formulaires**, Redirections en français; éditeur visuel par
  défaut; gabarits « + Ajouter » qui ne peuvent pas produire de fichier
  invalide. **Le menu, le méga-menu et la barre d'annonce sont éditables**
  (17 juil.); duplication FR↔EN documentée (`guide-edition.md`) avec rappel
  des traductions manquantes au build.
- **Palette de 9 sections** (17 juil.) : héros, bénéfices, FAQ, formulaire,
  appel à l'action + témoignage, bandeau logos partenaires, « Victrix en
  chiffres », vidéo en façade — démonstration : `/fr/campagnes/demo-sections/`.
- **Formulaires v2** (17 juil., en revue) : définitions réutilisables avec
  **destinataire par formulaire résolu côté serveur** (registre-liste blanche
  embarqué au build) — voir `formulaires.md` §4.
- **Pipeline formulaires** (critère 6) : endpoint `/api/forms` (validation,
  pot de miel, Turnstile optionnel, envoi SMTP2GO, pages `/merci`) — **inerte
  tant que les clés ne sont pas posées** (voir `formulaires.md`).
- **SEO technique** (critère 7) : JSON-LD Organization partout, BlogPosting sur
  les articles, FAQPage via la section FAQ — sans plugin ni licence. Équivalence
  complète Yoast→natif + gouvernance : `seo-strategie.md`.
- **Recherche interne** (28 juil., en revue) : moteur Pagefind sans service
  tiers — page `/recherche` FR/EN + icône dans l'en-tête; index régénéré à
  chaque build (les contenus migrés seront cherchables automatiquement),
  aucune requête externe (aligné Loi 25).
- **Planification marketing** (30 juil., en revue) : bannière d'annonce à
  fenêtre « Diffuser / Retirer à partir de », articles à date future différés
  (politique brouillons), reconstruction quotidienne automatique (workflow
  GitHub — secret OPS à brancher). Voir `guide-edition.md` § Planifier.
- **Une seule collection de pages « Services »** (30 juil.) : création par
  gabarit FR/EN (« + Ajouter »), méga-menu re-lié, anciennes URLs expertises
  en 301; barre latérale CloudCannon groupée (Contenu / Marketing / Config).
- **Brouillons** (critère 2) : interrupteur « Brouillon » sur les articles —
  visibles dans l'aperçu CloudCannon, exclus du site public; chaque branche a
  son URL de préversion partageable non indexée.
- **Portail client** : prototype maquetté (auth simulée forme OIDC/PKCE) — voir
  `portail-auth.md`. Ne pas présenter comme fonctionnel.
- **Qualité encadrée** : ESLint, 23+ tests unitaires, `astro check`, CI GitHub
  Actions, en-têtes de sécurité durcis (CSP, HSTS…), deux modes de build
  vérifiés (Cloudflare + `STATIC_ONLY` pour CloudCannon).

## Carte des documents (`docs/`)

| Document | Une ligne |
|---|---|
| `GUIDE-PROJET.md` | Ce document — point d'entrée. |
| `plan-prompts.md` | **Tableau de bord d'exécution** : backlog P-01..P-22, statuts, journal des sessions. |
| `content-inventory.md` | Inventaire complet du contenu WordPress à migrer (+ annexes `migration/`, scripts `scripts/migration/`). |
| `plan-convergence-migration.md` | Plan 7 phases : faire de ce dépôt le site de production (Tailwind v4, FR racine, conversion de contenu). |
| `seo-strategie.md` | SEO sans plugins WP : équivalence Yoast→natif, migration des métadonnées, gouvernance marketing, backlog priorisé. |
| `guide-edition.md` | Guide de l'éditeur (marketing) : publier au quotidien. |
| `atelier-contenus.md` | Atelier types de contenus : couverture vs cahier des charges, fiches à remplir par le marketing, suggestions, LIMITES de la pile. |
| `revue-cahier-des-charges.md` | Traçabilité 23/23 diapos du cahier des charges : état par exigence, spotlights diapos 14–15, écarts chiffrés (~5–6 j), équivalences outils. |
| `critères.md` | Les 10 attentes marketing/webmestre + état WordPress actuel. |
| `analyse-criteres.md` | Réponse critère par critère + arguments anti-WP + estimation révisée. |
| `plan-pivot-editeur.md` | Le plan du pivot éditeur visuel (CloudCannon/Tina) — **exécuté, gate close 2026-08-07** (conservé pour l'historique). |
| `spike-cloudcannon.md` | Réglages CloudCannon + grille de gate — **remplie, close 2026-08-07** (reste : vidéo → P-21). |
| `formulaires.md` | Architecture des formulaires, variables d'env, étapes d'activation. |
| `plan-2026-07-15.md` | Plan de la journée : clore la gate, décisions en attente. |
| `reunion-marketing-2026-07-09.md` | Déroulé de la démo marketing + objections/réponses. |
| `roadmap.md` | Feuille de route par jalons (M0→M4) — **OBSOLÈTE** (antérieure au pivot ; bannière posée le 2026-08-07 — ne rien planifier depuis ce fichier). |
| `portail-auth.md` | Plan directeur du portail client (Entra External ID). |
| `i18n-architecture.md` | Architecture bilingue (URLs, slugs, SEO). |
| `DEPLOYMENT.md` | Déploiement Cloudflare Pages. |
| `Proposition-Refonte-victrix.docx` | La proposition d'origine (options A/B/C, TCO 4 ans). |

## Les 10 critères marketing — état réel

| # | Critère | État |
|---|---|---|
| 1 | Éditeur visuel | ✅ Validé — grille formelle cochée et **gate close le 2026-08-07** (`spike-cloudcannon.md`); reste le clip vidéo (replié dans P-21) |
| 2 | Preview / partage non public | ✅ Préversions par branche (noindex auto) + brouillons d'articles |
| 3 | Types de contenus | ✅ Collections typées (blogue, accueil, services, solutions, campagnes, formulaires, navigation, redirections) — en ajouter = 1 schéma + 1 gabarit |
| 4 | Landing pages | ✅ Palette de **30 sections** avec vignettes d'aperçu, autonome au CMS |
| 5 | URLs + indexation | ✅ Slugs par langue, noindex par page, sitemap cohérent |
| 6 | Formulaires | 🔶 Pipeline construit + **v2 : définitions réutilisables, destinataire par formulaire (résolu serveur)**; activation = poser les clés (SMTP2GO + Turnstile, voir `formulaires.md`) |
| 7 | SEO / schema | ✅ JSON-LD par gabarit (Organization, BlogPosting, FAQPage) |
| 8 | Redirections | ✅ Éditables au CMS, validées au build |
| 9 | Clarity + images | 🔶 Images natives (Sharp au build); Clarity attend le bandeau de consentement Loi 25 (décision design) |
| 10 | Responsive | ✅ Garanti par les gabarits |

> Traçabilité complète face au **cahier des charges de l'agence** (23 diapos,
> exigence par exigence, écarts chiffrés ~5–6 j) : `revue-cahier-des-charges.md`.

## Prochains jalons

> Exécution pilotée par **`plan-prompts.md`** (backlog P-01..P-21 multi-modèles;
> vague 1 — navigation, palette, formulaires v2 — livrée le 17 juil.).

1. **Vagues 1–2 fermées ; vague 3 aux ¾** (`plan-prompts.md`, état §0 du
   07/08) : P-04/P-06/P-10/P-12/P-14/P-15 ✅ commités et poussés. Prochains :
   **P-16** (contrôle d'attributs + finalisation guide-edition — ferme la
   vague 3), **P-13** (footer 3 bureaux — à combiner avec « footer éditable au
   CMS », il vit encore dans ui.ts), P-08 ; P-11 bloqué sur OPS-CSP + clés.
1bis. **Convergence migration** (`plan-convergence-migration.md`) : Phases 0
   et 3 ✅ ; Phase 1 exécutée (reste la vérif humaine de l'éditeur visuel) ;
   **Phase 5 : socle + re-skin de la palette complète FAITS (2026-08-06)**,
   pages Accueil/Contact/Carrières/Expertise/Produit fidèles aux maquettes ;
   Phase 6 : articles convertis ET branchés (30 FR + 30 EN). Restent :
   **Phase 2 (FR à la racine)** et **Phase 4 (spike CloudCannon Forms)**.
2. ~~Clore formellement la gate CloudCannon~~ ✅ **FAIT le 2026-08-07**
   (grille remplie, `spike-cloudcannon.md`) — restes non bloquants : vidéo
   (P-21) + note du palier tarifaire (OPS).
3. Décisions/OPS restantes : clés formulaires (SMTP2GO/Turnstile), CSP
   (Turnstile + analytics), **secret `REBUILD_HOOK_URL`** (sans lui, aucune
   publication programmée automatique), protection des préversions,
   décommission du worker OAuth Sveltia (le retrait DANS le dépôt est fait).
4. Atelier contenus marketing, puis port complet du contenu (P-19).
5. Ensuite : dépôt de production semé de la branche gagnante.

## Reprendre le contexte (nouvelle conversation, nouvelle personne)

- **Nouvelle conversation Claude** : rien à préparer — la mémoire persistante
  du projet est mise à jour en continu et se charge automatiquement; ce
  document est le point d'entrée lisible. Dire « lis docs/GUIDE-PROJET.md »
  suffit à ancrer n'importe quelle session.
- **Nouvelle personne** : lire ce document, puis `analyse-criteres.md` (le
  pourquoi), puis `guide-edition.md` (le comment éditeur) ou
  `plan-pivot-editeur.md` (le comment technique).
- **État du code** : `git log --oneline` sur la branche `spike/cloudcannon`;
  les conventions sont dans les commentaires du code lui-même
  (`astro.config.mjs` et `cloudcannon.config.yml` sont les plus denses).
