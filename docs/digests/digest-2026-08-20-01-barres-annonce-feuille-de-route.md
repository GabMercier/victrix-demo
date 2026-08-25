# Digest : bibliothèque de barres d'annonce + feuille de route d'équipe

- **Date :** 2026-08-20
- **Type :** Dev session (build ; secondaire : planification/synthèse)
- **Projet :** Demo-victrix, spike CloudCannon (branche `spike/cloudcannon`)
- **En une ligne :** la bannière d'annonce unique devient une bibliothèque de bannières planifiables au CMS (bogue des contrôles de dates corrigé au passage), et un artifact « Feuille de route Victrix » consolide ce qui reste à planifier + l'explication analytics/plugins WP pour l'équipe.
- **Classer sous :** Project Victrix (refonte site) ; `docs/digests/` du dépôt.
- **Sujets couverts :** collection `annonces`, sélecteur de bannière active, fermeture par id, config CloudCannon, gap analysis cahier des charges/ADO, artifact de présentation.
- **Périmètre de la session :** chrome du site (bannière) + documentation de cadrage. PAS touché : formulaires, contenu migré, portail, perf images, CI.

## Objectif

1. Répondre à « je ne vois pas la planification de la bannière dans le CMS » ; le diagnostic a révélé un bogue réel et un besoin plus large (plusieurs bannières enregistrées, chacune planifiable).
2. Préparer une présentation d'équipe : reste à planifier (cahier des charges + ADO) et fonctionnement analytics + remplacement des plugins WordPress.

## Décisions prises

- **Bibliothèque = collection dédiée, pas un array dans Navigation.** Raison : « + Ajouter » depuis la barre latérale, une fiche par bannière avec nom interne, et surtout le gabarit `schemas/annonce.json` garantit que TOUTES les clés existent dans chaque fichier (le bogue d'origine venait de clés absentes). Exclut : liste `announce[]` par langue dans navigation/*.json (schedules à synchroniser fr/en à la main). Statut : ferme, livré.
- **FR et EN dans le MÊME fichier de bannière, fenêtre partagée.** Les deux blocs sont obligatoires (zod), pas de repli silencieux. Statut : ferme.
- **Règle de sélection : une seule bannière affichée ; parmi les « Affichée » dont la fenêtre couvre le build, la plus récemment COMMENCÉE gagne** (startAt vide = « depuis toujours », perd contre toute bannière datée ; égalité = id alphabétique, ordre d'entrée indifférent). Permet le patron « permanente sans dates + campagnes datées par-dessus ». Statut : ferme, testé.
- **STATIC_ONLY (éditeur visuel CloudCannon) : fenêtre ignorée, interrupteur `enabled` respecté** ; première bannière « Affichée » par id. Statut : ferme.
- **Fermeture par visiteur mémorisée PAR ID** : clé `sessionStorage` inchangée (`victrix-announce`), la valeur devient l'id de la bannière fermée. Une nouvelle bannière réapparaît malgré une fermeture antérieure ; valeur héritée `'closed'` ne matche plus rien (réapparition unique, assumée). Statut : ferme.
- **Livrable de présentation = artifact web privé** (choix utilisateur via question), niveau vulgarisé avec annexes techniques en `<details>`. Statut : ferme, publié.

## Ce qui a été construit ou changé

Tout est **done** et **commité par l'utilisateur** dans `88be985`.

- `src/data/annonces/promo-o-studio.json` : bannière migrée (Ø Studio), clés `startAt`/`endAt` explicites vides.
- `schemas/annonce.json` : gabarit « + Ajouter » (toutes les clés, `enabled: false` par défaut, `linkHref: "/"`).
- `src/data/navigation/{fr,en}.json` : objet `announce` retiré.
- `src/content.config.ts` : collection `annonces` (glob JSON, réutilise `scheduleBound` et `navHref`), `announce` retiré du schéma navigation, export `collections` mis à jour.
- `src/lib/schedule.ts` : `pickActiveAnnounce(entries, now, staticOnly)` + interface `AnnounceCandidate` ; en-tête du module réajusté (la validation zod vit dans la collection `annonces` désormais).
- `src/lib/schedule.test.ts` : 8 nouveaux tests (vide/désactivé, fenêtre, chevauchement, startAt vide, égalité alphabétique, staticOnly, date invalide).
- `src/lib/announce.ts` (NOUVEAU) : `getActiveAnnounce(lang)` et `getActiveAnnounceId()` ; un seul `BUILD_NOW` par build ; `STATIC_ONLY` lu en expression membre exacte (gotcha blog.ts).
- `src/components/Header.astro` et `CampaignHeader.astro` : calcul remplacé par `getActiveAnnounce`, `data-announce-id` sur `[data-announcement]`, handlers de fermeture stockent l'id ; garde `chrome.showAnnounce` conservée côté campagnes ; balisage inchangé.
- `src/layouts/BaseLayout.astro` : script anti-flash pré-peinture compare la valeur stockée à l'id de la bannière courante (`define:vars`, id constant build-wide donc script identique sur toutes les pages, propriété ClientRouter préservée).
- `cloudcannon.config.yml` : collection « Barres d'annonce » (groupe Marketing, `icon: campaign`, `disable_url`, data editor, `schemas.default` avec `create.path: '{title|slugify}.json'`, `_inputs` fr) ; `_inputs` announce retirés de navigation ; descriptions ajustées.
- `docs/guide-edition.md` (§ « Barres d'annonce (bibliothèque planifiable) », § Planifier réécrit) et `docs/operations.md` §7bis (règle de sélection, garder au moins un fichier).
- Hors dépôt : artifact « Feuille de route Victrix » (<https://claude.ai/code/artifact/95a1e6c9-35e8-4a58-986e-8ffd2e5073cf>), 3 sections : reste à planifier (goulot clés §7ter, 12 décisions, chaîne SEO/301, contenu/design/recette/bascule), analytics vulgarisé + annexe technique, plugins WP par statut.

## Architecture (forme actuelle)

Bannière : `src/data/annonces/*.json` (collection zod `annonces`) → `src/lib/announce.ts` (un `getCollection` + `pickActiveAnnounce`, partagé) → rendus par Header/CampaignHeader (texte par langue, lien localisé) et BaseLayout (id pour l'anti-flash). Fenêtres appliquées au BUILD ; le cron quotidien `rebuild-planifie.yml` reste la mécanique d'application (inchangée, toujours en attente du secret `REBUILD_HOOK_URL`).

## Problèmes rencontrés et résolution

- **Symptôme d'origine : aucuns contrôles de dates dans le CMS.** Cause : `_inputs` CloudCannon définis mais clés `startAt`/`endAt` absentes des JSON ; l'éditeur de données n'affiche que les clés présentes dans le fichier. Fix structurel : gabarits avec toutes les clés. Leçon générique consignée dans la config (commentaire au-dessus de `schemas:`).
- **Faux positif de vérification :** grep `data-announcement` matchait la chaîne dans le script de fermeture inline des pages campagne allégées ; le vrai critère est `class="announcement` (0 sur allégé, 1 sur personnalisé). Aussi : PowerShell mange le « Ø » sans lecture UTF-8 explicite.
- **Flake e2e `/fr/merci/`** : « An error occurred » en second h1 pendant que le dev server rechargeait la config contenu (que je venais de modifier) ; page 200 au re-test, test vert au re-run. Pas un bogue du code.

## Vérification / état des tests

- vitest 128/128 (120 + 8 nouveaux) ; eslint 0 erreur (4 warnings préexistants) ; `astro check` 0 erreur.
- Build complet + build STATIC_ONLY exécutés dans une **copie isolée** (recette operations.md §3.1, robocopy sans /MT, copie vérifiée puis supprimée) car le dev server tournait sur 4321 : bannière fr/en rendue avec liens localisés, campagne allégée sans bannière, personnalisée avec, STATIC_ONLY + `startAt: 2030` = bannière visible.
- e2e 13/13 (après re-run du flake ci-dessus).
- **Non vérifié :** l'interface CloudCannon réelle après push (collection visible, contrôles de dates, création via gabarit) ; à faire au prochain passage dans le CMS.

## Questions ouvertes / décisions en attente

Consolidées dans l'artifact ; les principales : heatmap/Clarity v1 (#1451/#1494), GTM vs gtag, ZoomInfo, gating des PDF (#1465), multi-étapes (P-22), doublon /expertises vs /services/productivite, hébergeur cible, licence CloudCannon (#1622), RACI, protection des préversions, `[victrix_table]`, page protégée documents-o-bureau, et la contradiction documentaire « spike CloudCannon Forms (jamais exécuté) vs moteur maison livré » à acter.

## Risques / dépendances / bloqueurs

- Les 7 clés §7ter + `REBUILD_HOOK_URL` gatent : formulaires réels, analytics, publication planifiée (donc l'utilité réelle des fenêtres de bannières), ~9 fermetures ADO.
- Chaîne séquentielle : export Screaming Frog (existe, task #1542) → P-18 → matrice 301 (validation Julie) → #1488 → P-17.
- Sessions parallèles actives sur la même branche (migration de contenu le 20 août) : vérifier `git log` avant de toucher navigation/annonces.

## Dette / reporté

Inchangé depuis le digest 08-18-02 (CSS critique inline si audit < 95, automatisation des passes images, Lot 6 photos, durcissement CSP, ARIA #1466, P-22/P-23, WebP/AVIF). Rien de nouveau parqué cette session.

## Prochaines étapes

1. Vérif CloudCannon post-push : Marketing → Barres d'annonce, contrôles de dates visibles, création via « + Ajouter » (surface : navigateur, 10 min).
2. L'ordre des deux prochaines semaines proposé dans l'artifact : clés §7ter + `REBUILD_HOOK_URL`, puis Screaming Frog + P-18, produits-enfants ×6, P-19 + onboarding, perf, P-13/P-20/P-21.
3. Présenter l'artifact à l'équipe (partage depuis le menu de la page) ; retouches republiables à la même URL sur demande.

## Constats durables

- **CloudCannon (data editor) n'affiche que les clés présentes dans le fichier** ; les `_inputs` seuls ne créent pas de champs. Tout gabarit `schemas/*.json` doit porter la totalité des clés, y compris vides. C'est un patron à appliquer à toute future collection.
- Un tri `Array.prototype.sort` stable (garanti ES2019) après un tri alphabétique donne des égalités déterministes sans clé composite.
- `define:vars` sur un script `is:inline` reste compatible avec la propriété « script identique sur toutes les pages » du ClientRouter tant que la variable injectée est constante pour tout le build.
- La recette de build isolé (operations.md §3.1) refonctionne telle quelle : robocopy exit 1 = succès, vérifier `node_modules/astro/dist/cli/index.js` avant de faire confiance à la copie.
- Playwright réutilise le dev server local (reuseExistingServer) : un test qui frappe le serveur pendant un rechargement de `content.config.ts` peut échouer en transitoire ; re-tester avant de chercher un bogue.

## Statut des living docs

**Oui, à régénérer :**

- `docs/guide-edition.md` et `docs/operations.md` : déjà à jour (faits dans cette session, commités).
- Équivalent STATUS (mémoire projet `project-status.md`) : à jour (session consignée, commit `88be985` noté).
- `docs/plan-prompts.md` / `docs/revue-cahier-des-charges.md` : PAS touchés cette session ; l'artifact « Feuille de route Victrix » constitue une photo consolidée du 20 août mais ne remplace pas ces docs. Si l'équipe adopte l'ordre proposé, reporter les décisions prises en réunion dans `ado-alignement.md` et `plan-prompts.md` §4.
