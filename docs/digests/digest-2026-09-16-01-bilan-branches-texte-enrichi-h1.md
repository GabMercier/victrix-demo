# Digest 2026-09-16-01 : bilan exhaustif, déblocage du staging, trois branches, texte enrichi, contrôle du H1

- **Date :** 2026-09-16 (une seule session, journée entière).
- **Type :** Dev session (build ; secondaire : debugging et planification).
- **Project :** Démo Victrix (Astro 5 + Bookshop + CloudCannon), refonte victrix.ca, branche de travail `dev` (nouvelle), édition `staging` (ex-`spike/cloudcannon`), production `main`.
- **In one line :** le staging cassé par les sauvegardes CloudCannon est réparé à la racine (champs `null`, clés supprimées par les gabarits, listes du formulaire Contact), le dépôt passe à trois branches, et les deux premières phases du plan « éditeur » sont livrées sur `dev` (texte enrichi sur 45 champs, contrôle du H1 sur les héros avec garde-fou au build).
- **File under :** Project Victrix Demo, `docs/digests/`.
- **Subjects covered :** audit d'état (dépôt, deux sites CloudCannon, Azure DevOps en direct, 23 commentaires de Julie #1762), correctifs CMS (null, `remove_extra_inputs`, options Contact), renommage `spike/cloudcannon` → `staging` + création de `dev`, CI sur les trois branches, artefacts « Cap go-live Victrix » et « Guide express CloudCannon », Phase 1 texte enrichi, Phase 2 contrôle du H1, garde-fou H1, styles `.rich`/`.prose h4-h6`, mémoire projet.
- **Scope of this session :** `src/content.config.ts` (wrapper defineCollection), `cloudcannon.config.yml` (empty_type, remove_extra_inputs, slug services, 7 structures html), 13 gabarits `schemas/*`, 28 composants + 32 specs `component-library/src/components/**`, nouveau `component-library/src/shared/rich.ts`, `scripts/lib/h1-guard.mjs`, `astro.config.mjs` (intégration `victrix:h1-guard`), `src/styles/global.css`, `public/styles/editor-styles.css`, tests `src/lib/rich.test.ts` + `src/lib/h1-guard.test.ts`, `tests/e2e/formulaires-recherche.spec.ts`, `.github/workflows/ci.yml`, docs (`operations`, `DEPLOYMENT`, `GUIDE-PROJET`, `guide-edition`, `ado-alignement` inchangé), contenu : 26 `null` remis à `""`, 26 clés restaurées (slugs EN, seoTitle), 7 liens accueil, listes Contact. PAS touché : routes non live (contact, carrières, ressources, merci, solutions, portail), CampaignHeader/Footer, blog markdown, médiathèque, redirections/routing.json, contenu migré (tableaux d'articles), Azure DevOps (rien collé).

## Goal / scope

Trois demandes en cascade : (1) un état des lieux exhaustif croisé avec le backlog Azure DevOps et un plan de fin de projet ; (2) débloquer le staging CloudCannon (build rouge depuis les sauvegardes de Julie des 11-15 sept.) et absorber son contenu sans rien perdre ; (3) lancer le chantier « éditeur » demandé par Julie : texte enrichi partout, contrôle du H1 pour le SEO, aperçu live sur toutes les pages, mise en forme perdue à la migration, médiathèque, redirections. Les phases 1 et 2 sont livrées ; 3 à 6 restent.

## Decisions made

- **Trois branches** : `main` (production, avance uniquement par Publish CloudCannon), `staging` (édition, ex-`spike/cloudcannon`, sauvegardes CloudCannon directes, les devs n'y arrivent que par PR depuis `dev`), `dev` (intégration des devs, `feat/*` → PR → `dev` → PR → `staging`). Raison : trois push rejetés et deux builds rouges dans la journée à cause de la cohabitation devs/éditeurs sur une branche. Exclut le rebase et le force-push sur `staging`/`main`. Protection de branche : bloquer seulement force-push et suppression (une règle « PR obligatoire » bloquerait les sauvegardes CloudCannon et le Publish). **Firm.** Renommage exécuté : CloudCannon rebindé sur `staging`, `spike/cloudcannon` supprimée sur GitHub, `dev` poussée.
- **Site CloudCannon pour `dev`** : oui, à créer par le user avant la Phase 3 (le plan Standard n'a pas de plafond de sites ; Team Members 3/3 est le seul mur, membres supplémentaires facturés au prorata sans changer de palier). La PR GitHub reste la voie de promotion ; pas de lien Publishing dev → staging. **Firm.**
- **`null` toléré partout** : un champ vidé dans CloudCannon s'enregistre `null` ; un pré-traitement récursif `null → ""` dans un wrapper de `defineCollection` (un seul endroit, toutes les collections) plutôt que 200 `.nullable()`. Objets simples seulement (les `Date` du frontmatter blog ne doivent pas être aplatis). Complété par `empty_type: string` sur 222 entrées text/textarea/select/image. **Firm.**
- **Gabarits complets + `remove_extra_inputs: false`** sur les 13 entrées `schemas.*` : CloudCannon supprime à l'enregistrement toute clé absente du gabarit (23 clés perdues en 22 fichiers : slugs EN, seoTitle). Les gabarits portent désormais toutes les clés (services : +slug +seoTitle ; pages : +seoTitle ; blog : +topics +wpUrl). **Firm**, vérifié sur une vraie sauvegarde de Julie après le correctif (clés conservées).
- **Listes Sujet/Service du Contact** : alignées sur la page (Julie a renommé « Expertise » → « Service » et changé les choix) ; le garde-fou `assertSameOptions` reste (liste blanche serveur). Amélioration candidate : la page lit ses options depuis la définition (source unique). **Firm** sur le correctif, **tentative** sur la source unique (Lot 8).
- **Texte enrichi = HTML stocké dans le JSON**, entrées CloudCannon `type: html`, deux presets (inline : bold/italic/link/format p ; block : + listes/blockquote/format p h3 h4), rendu par deux helpers browser-safe (`inlineHtml` retire l'emballage `<p>` et joint par `<br>` ; `blockHtml` enveloppe le texte nu dans `<p>` et rend dans `<div class="rich">` qui hérite la typographie), filtre liste-blanche `sanitizeRichHtml` AU BUILD sur toute chaîne contenant `<`. Écarté : Markdown pour les champs de section (le corps des articles reste Markdown), bibliothèque de rendu (aucune dépendance, live editing Bookshop oblige). **Firm.** Boutons dans le texte : classes `btn`/`btn-outline` autorisées sur `<a>` + option `styles: /styles/editor-styles.css` sur les presets block : **tentative**, clé d'option non confirmée dans la doc CloudCannon, à vérifier dans l'éditeur ; repli = snippet CloudCannon (≈0,5 j).
- **Contrôle du H1 sans H1 caché** : select `h1Element` sur les quatre héros (`titre` par défaut ; `surtitre` sur hero/home-hero/service-hero, `badge` sur product-hero) : l'élément choisi prend la balise `<h1>` avec ses classes existantes, le grand titre passe en `<h2>`, rien ne bouge à l'écran ; surtitre vide = le titre reste H1. Écarté : un champ « H1 SEO » invisible (cloaking, a11y). Complété par le garde-fou `victrix:h1-guard` (≥ 2 H1 = build rouge, 0 = avertissement ; hors périmètre : stubs meta refresh, 404, recherche, portail, style-guide). **Firm.**
- **Cloudflare Pages** : conservé mais re-pointé sur `dev` par le user (préversion adaptateur) ; le check GitHub « Cloudflare Pages » rouge venait du projet hérité. Décommission au go-live ou après le spike Forms. **Firm.**
- **Test e2e du contact ciblé par rôle** (`button[type=submit]`) et non par libellé : les libellés sont éditables au CMS (Julie a changé « Envoyer le message » → « Soumettre », CI rouge depuis 17 h 30). **Firm.** Trois autres tests restent liés à des libellés (fil d'Ariane « Accueil », lien de /merci, CTA campagne sécurité) : à durcir en Lot 8.

## What was built or changed

| Artefact | État | Détail |
|---|---|---|
| Artefact « Cap go-live Victrix » | done | https://claude.ai/artifact/4F41jvU1Hefohk9xgXqCTT : état vérifié, dérive ADO, tri des 23 commentaires Julie, plan 5 phases (avant le plan éditeur), hygiène ADO, décisions Victrix. |
| Artefact « Guide express CloudCannon » | done | https://claude.ai/artifact/4SR7WD6nToFvLZHzdoqqrw, v0.1 pour Julie, à faire évoluer (journal des versions). |
| `src/content.config.ts` | done | Wrapper `defineCollection` (cast `typeof astroDefineCollection`) : `nullsToEmpty` récursif sur objets simples + `sanitizeRichHtml` sur toute chaîne avec `<` ; `solutions.order` preprocess `"" → undefined` ; `h1Element` enum ×4 héros. |
| `cloudcannon.config.yml` | done | `options.empty_type: string` sur 222 entrées ; `remove_extra_inputs: false` sur 13 schémas + règle en commentaire au-dessus du premier `schemas:` ; `_inputs.slug` déclaré sur la collection services ; `type: html` + preset inline sur 7 `_structures` (bento_items, tool_items, realisation_items, solution_items, solution_features, numbered_card_items, timeline_items). |
| `schemas/*` | done | service-{fr,en}.json +slug +seoTitle ; page-{fr,en}.json +seoTitle ; blog-{fr,en}.md +topics +wpUrl. |
| Contenu | done, poussé sur staging | 26 `null` → `""` (13 fichiers) ; 23 clés restaurées depuis `63ebf6f` + 3 sur analyse-opportunites-ia ; 7 hrefs accueil fr/en réécrits vers les vraies routes ; Découvrir fr/en : timeline conservée + libellés Julie portés ; `src/data/forms/{fr,en}/contact.json` label « Service » + nouvelle liste, « Cloud » trimé côté page EN. |
| `component-library/src/shared/rich.ts` | done | `inlineHtml`, `blockHtml`, `hasRichText`, `sanitizeRichHtml` (liste blanche p/br/strong/b/em/i/u/s/a/ul/ol/li/h3/h4/blockquote/span/sub/sup ; attributs href/target/rel/title/class sur `<a>` seulement ; classes btn/btn-outline ; script/style/iframe supprimés avec contenu ; « a < b » intact). 20 tests. |
| 28 composants `*.astro` | done | 34 rendus : champs bloc → `<div class="rich …">` + `blockHtml`, champs inline → `set:html={inlineHtml(x)}` ; import `../../shared/rich`. FAQ : JSON-LD sans balises. |
| 28 specs `*.bookshop.yml` | done | 38 entrées `type: html` (deux presets) + `styles: /styles/editor-styles.css` sur les 24 presets block ; `h1Element` blueprint + select sur hero/home-hero/service-hero/product-hero. |
| Héros ×4 | done | prop `h1Element`, balises dynamiques `EyebrowTag`/`BadgeTag` (h1 ou p) et `TitleTag` (h2 ou h1), classes inchangées. Prouvé au build sur demo-sections fr. |
| `scripts/lib/h1-guard.mjs` + `astro.config.mjs` | done | `countH1`, `isRedirectStub`, `h1Verdict`, `auditPages` (4 tests) ; intégration `victrix:h1-guard` en `astro:build:done`, en tête du tableau `integrations`. Résultat : 156 pages OK, 0 sans, 17 hors périmètre. |
| `src/styles/global.css` | done | `.rich` (rythme, listes, h3/h4, blockquote, liens), `a.btn`/`a.btn-outline`, `.prose h4-h6`. |
| `public/styles/editor-styles.css` | scaffolded | Feuille pour le menu Styles de l'éditeur (non vérifié côté CloudCannon). |
| `.github/workflows/ci.yml` | done | Déclencheurs push/PR sur `main`, `staging`, `dev`. |
| `tests/e2e/formulaires-recherche.spec.ts` | done | Bouton d'envoi par rôle. |
| Docs | done | `operations.md` §1 (trois branches), §4 (PR dev → staging), §5, §6 ; `DEPLOYMENT.md` tableau + §2 + §7 ; `GUIDE-PROJET.md` journal 16 sept. ; `guide-edition.md` (Contact deux endroits, texte enrichi, élément H1, version 16 sept.). |
| Branches / dépôt | done | `staging` = ex-`spike/cloudcannon` (CloudCannon rebindé, builds verts) ; `dev` créée et poussée ; `spike/cloudcannon` supprimée ; Phase 1 commitée `65a9924` + merge `fd167bd` sur `dev`. |
| Phase 2 | done, **NON commité** | 14 fichiers dans la copie de travail de `dev` (héros ×4 .astro + .bookshop.yml, content.config.ts, astro.config.mjs, scripts/lib/h1-guard.mjs, src/lib/h1-guard.test.ts, global.css, guide-edition.md). Commit + push + PR dev → staging à faire par le user. |

## Architecture / how it fits

- Édition : CloudCannon (site « Vic-demo », à renommer « Victrix · Édition ») sauvegarde sur `staging` → build `STATIC_ONLY=1` + postbuild Bookshop → aperçu lawful-hare.cloudvent.net. Publish = merge `staging` → `main` → site prod overt-pineapple.cloudvent.net (dernier Publish 25/08, en retard de tout le mois).
- Développement : `dev` (intégration) ← `feat/*` ; promotion par PR GitHub vers `staging` (fusion côté serveur, CI requis). Préversion Cloudflare Pages (adaptateur) sur `dev`. Site CloudCannon « Victrix · Dev » à créer (branche `dev`, même config).
- Contenu : JSON/Markdown validés par Zod via un `defineCollection` enveloppé (null → "", HTML filtré). Les composants rendent le HTML des champs texte via deux helpers sans dépendance, donc aussi dans l'éditeur visuel (Bookshop live) ; les routes live sont `[...slug]`, campagnes, index, services ; les six autres routes restent statiques (Phase 3).
- Garde-fous de build : formId, navHref, i18n-pairing, redirects, contact options, H1 (nouveau). Un garde-fou rouge bloque l'aperçu du staging mais jamais la production.

## Environment / stack specifics

- Dépôt `GabMercier/victrix-demo`, Node 20.20.2 (`.nvmrc` 20), Astro 5, Bookshop, Playwright (webServer auto), vitest (`src/**/*.test.ts`, environnement node). `gh` absent ; API GitHub publique utilisée pour les runs/checks.
- Azure DevOps interrogeable en direct : `az` 2.86 + extension `azure-devops`, org `https://dev.azure.com/Victrix-clients`, projet « Victrix - Refonte site Web ». `az boards query --wiql … --output json > fichier` (fichier en cp1252) ; `az boards work-item show --id N` ; commentaires : REST `GET …/_apis/wit/workItems/N/comments?api-version=7.1-preview.4` avec `az account get-access-token --resource 499b84ac-1321-427f-aa17-267ca6975798`.
- CloudCannon plan Standard mensuel : Team Members 3/3 (extra facturés au prorata), bandwidth 110 Go, 5 domaines, 4 site mountings, pas de plafond de sites affiché. Build : « Added live editing to N page(s) » = postbuild OK. Dashboard = page « Status », bouton Build.
- Commandes de gate : `npm run lint` ; `npm run type-check` ; `npm run test` ; `STATIC_ONLY=1 npm run build` (PowerShell : `$env:STATIC_ONLY="1"`, à retirer ensuite) ; `npm run test:e2e` (démarre son dev server ; ne pas builder pendant qu'un dev server tourne).
- Presets CloudCannon html (clés supposées) : inline `bold italic link undo redo format: p` + `bulletedlist/numberedlist/blockquote: false` ; block `format: p h3 h4` + listes/blockquote true ; communs : underline/strike/image/table/code/embed/horizontalrule/snippet false, `remove_custom_markup: true`, `empty_type: string`, block : `styles: /styles/editor-styles.css`.

## Problems hit and how resolved

- **Build CloudCannon rouge « InvalidContentEntryDataError »** : champs vidés enregistrés `null` (26 en 13 fichiers). Fix : wrapper null → "" + empty_type + valeurs remises à "". Preuve : `astro sync` passe avec un null injecté, échoue sur l'ancien schéma. Dead end évité : `.nullable()` champ par champ.
- **Blog cassé par le wrapper** : les `Date` du frontmatter étaient aplatis en `{}` (récursion sur tout objet). Fix : récursion sur objets simples seulement (`Object.getPrototypeOf(v) === Object.prototype`).
- **Merge commité avec marqueurs de conflit** : le user avait `git add` les deux Découvrir sans résoudre (`3c96258`). Fix dans la copie de travail (timeline conservée, libellés Julie portés) ; commit suivant propre ; jamais poussé cassé.
- **Deuxième build rouge « options de « Service » désalignées »** : Julie a renommé le champ et changé les choix côté page seulement. Fix : définitions alignées + avertissement dans le guide.
- **Clés supprimées à chaque sauvegarde** (slug EN → URL EN retombée sur le chemin FR ; seoTitle disparus, donc champ invisible pour Julie, ce qu'elle a signalé). Cause : `remove_extra_inputs` par défaut true + gabarits incomplets. Fix ci-dessus ; vérifié sur la sauvegarde suivante de Julie (approvisionnement-ti : clés conservées).
- **CI e2e rouge sur toutes les exécutions du jour** : libellé du bouton Contact changé par Julie. Fix : sélecteur par rôle. Vert ensuite.
- **Push rejetés ×3** : sauvegardes CloudCannon entre pull et push. Fix structurel : trois branches.
- **Changement de branche CloudCannon non persistant** : une sauvegarde non enregistrée (nouvelle campagne « Demo new sections ») bloquait la bascule ; après Discard et rebascule, `staging` a tenu.
- **Aperçu de l'en-tête de campagne inchangé** : l'en-tête est hors de la frontière `bookshop:live` (rendu par la route), donc visible seulement après Save + build ; en plus le build n'avait pas tourné après le push de retry de CloudCannon. Fix : rebuild ; en-tête live = Phase 3.
- **Outillage** : le Bash tool dé-échappe les backslashes et bute sur certaines apostrophes dans les heredocs python ; `\b`/`\1` sont devenus des octets de contrôle dans une regex TS. Dead end : corriger via heredoc. Fix : écrire les scripts dans le scratchpad (Write tool) puis `python fichier`, et écrire les fichiers TS avec Write.
- **`az devops invoke` échoue** (« could not convert '7.1.4' ») ; `--fields` sur `work-item show` échoue. Fix : REST direct avec jeton.

## Verification / test state

- Phase 1 (commitée) : 140 tests, lint 0 erreur (4 warnings préexistants), type-check 0, build STATIC_ONLY 173 pages Pagefind, 0 `<p><p>` imbriqué dans dist, `<strong>` conservés, e2e 14/14.
- Phase 2 (non commitée) : 144 tests, lint 0, type-check 0 (après `@param {string} d`), build avec garde-fou (156/0/17), swap surtitre → `<h1 class="text-xs …">` et titre → `<h2 …>` prouvé sur demo-sections fr puis fichier restauré, e2e 14/14.
- Staging : dernières sauvegardes de Julie (approvisionnement-ti fr/en) conservent slug + seoTitle, 0 null. CI `staging` vert depuis 18 h 18.
- **Untested** : toolbar CloudCannon des entrées html (clés d'options supposées), menu « Styles » bouton, rendu live des `div.rich` et du select H1 dans l'éditeur visuel (aucune vérification CloudCannon de Phase 1/2 encore : Julie n'a rien vu), option `styles`. Phase 2 non commitée au moment du digest.

## Open questions / decisions pending

- Boutons dans le texte enrichi : l'option `styles` marche-t-elle sur les entrées html ? Sinon snippet CloudCannon (à confirmer par recherche doc : `_snippets` avec template HTML libre).
- Julie : photos des témoignages Carrières inversées (voulu ?) ; Expertises fr/en passées en noindex (voulu ?).
- H1 par section (niveau h2/h3 configurable) : reste une option Epic 2 après le contrôle du héros.
- Contact : page lisant ses options depuis la définition (source unique) — Lot 8.
- Site CloudCannon « Victrix · Dev » : à créer par le user (décidé oui).
- Textes ADO du 10/09 + nouvelles stories (Lot 6 texte enrichi, Lot 7 icônes, Greenhouse, libellés Ressources, logo FR, bascule DNS, compte CloudCannon) toujours PAS collés ; #1762 à fermer après conversion.
- Décisions Victrix inchangées : plan d'architecture (Walter), www vs apex, médiathèque, gouvernance, comptes/carte, banque d'icônes (Lucide), Greenhouse, logo FR.

## Risks / dependencies / blockers

- Toute vérification éditeur des phases 1-2 dépend d'une PR dev → staging (ou du site dev à créer). Un preset html mal nommé serait visible par Julie sur staging.
- Julie édite en continu : pauses à demander pour les fusions ; la promotion par PR (fusion serveur) réduit le risque.
- Le rich text stocke du HTML : tout nouveau composant doit passer par `inlineHtml`/`blockHtml`, sinon les balises s'affichent en clair.
- Cloudflare Pages re-pointé sur `dev` : la préversion utilise le build adaptateur (drafts cachés), pas STATIC_ONLY.

## Tech debt / deferred

- Items Carrières (`carriere_feature_items.text`, `carriere_testimonial_items.quote`) et pages data (contact/carrières) exclus du texte enrichi : Phase 3 (pages non live).
- 4 nulls des pages services fr/en laissés puis remis à "" ; harmless.
- Tests e2e liés à des libellés éditables (3) : Lot 8.
- Audit « clés du gabarit vs clés des fichiers » : script ad hoc de la session, à porter en CI (≈1 h).
- `wpUrl`/`topics` exposés dans les gabarits blog : `wpUrl` visible comme champ (déclaré en `_inputs`), acceptable.
- Formatage JSON des définitions de formulaire Contact reformaté par `json.dumps` (indentation), diff bruyant une fois.

## Next steps

1. User : `git add -A ; git commit` (Phase 2) ; `git push origin dev` ; PR `dev → staging` ; CI vert ; merge ; vérifier dans CloudCannon sur une page démo : gras/lien/liste dans un champ, menu Styles sur un lien, select « Élément qui porte le H1 ». (Claude Code : rien.)
2. User : créer le site CloudCannon « Victrix · Dev » (branche `dev`, config copiée du staging) et transmettre l'URL cloudvent ; règles de protection `main`/`staging` (force-push, suppression) ; Cloudflare Pages : préversions désactivées si le check gêne.
3. Phase 3 (Claude Code, `dev`) : rendre live Contact, Carrières, Ressources index, Merci, Solutions, portail (composants Bookshop liés aux données) + CampaignHeader/Footer live pour les modes allégé/personnalisé ; 2-3 j.
4. Phase 4 : 14 articles (tableaux HTML → Markdown éditable + `.prose table`), 25 `.article-cta` → bouton, 12 `style=`, 2 images absolues ; pages légales : listes réelles via texte enrichi ; 1 j.
5. Phase 5 : médiathèque (`paths.uploads` racine commune `public/images/cms/<surface>`, `uploads_filename` slugifié, existant intact) ; 0,5 j + décision.
6. Phase 6 : `.cloudcannon/routing.json` (redirections CMS + en-têtes) et chargement de la matrice 301 (#1503) ; 0,5-1 j.
7. En parallèle : coller les textes ADO, mettre à jour l'artefact Cap go-live §04 avec le plan éditeur, guide express v0.2 après vérification CloudCannon.

## Durable findings (secondary)

- CloudCannon écrit `null` pour un champ texte vidé ; `options.empty_type: string` par entrée (pas de défaut global) ; valable pour text, textarea, code, color, url, select, rich text, date/time, file, choice.
- CloudCannon supprime à l'enregistrement toute clé absente du gabarit (`schemas.*.remove_extra_inputs`, défaut true) ; un champ dont la clé manque dans le fichier n'apparaît plus dans l'éditeur. Un gabarit doit porter toutes les clés possibles.
- Bookshop live (astro-bookshop) : seule la frontière `bookshop:live` se re-rend en direct ; les composants de la bibliothèque peuvent importer des modules TS relatifs (déjà le cas pour form.astro) tant qu'ils restent browser-safe.
- Astro : balises dynamiques via variables capitalisées (`const TitleTag = cond ? 'h2' : 'h1'; <TitleTag class=…>`), compatibles Bookshop.
- Astro : le wrapper `defineCollection` casté `as typeof astroDefineCollection` conserve les types générés (`InferEntrySchema`) tout en pré-traitant les données à l'exécution.
- Le Bash tool de Claude Code (Windows/Git Bash) dé-échappe les backslashes dans les heredocs : écrire regex et scripts via le Write tool.
- `az boards query` sort en cp1252 sous Windows ; `az devops invoke` cassé sur la version d'API ; REST direct avec jeton fonctionne.
- CloudCannon Standard : membres au-delà du plan facturés au prorata (pas de changement de palier nécessaire pour ajouter des éditeurs).

## Continuity note

Julie édite en continu sur staging et n'a encore vu ni le texte enrichi ni le contrôle du H1 ; prévenir avant la fusion et lui laisser l'aperçu demo-sections comme terrain d'essai.

## Living docs status

**Oui, à régénérer :**

- `docs/GUIDE-PROJET.md` : journal 16 sept. déjà ajouté (trois branches, correctifs) ; ajouter le plan éditeur en 6 phases et l'état Phase 1/2.
- `docs/DEPLOYMENT.md` et `docs/operations.md` : à jour pour les branches ; ajouter le site CloudCannon dev quand créé.
- `docs/guide-edition.md` : sections ajoutées (texte enrichi, H1, Contact) ; à relire après vérification CloudCannon ; version datée 16 sept.
- `docs/ado-alignement.md` : NON mis à jour ce jour ; ajouter les stories Lot 6/7/8, la story « Bascule DNS et blocages go-live », la tâche compte CloudCannon, le portage 301 dans #1503, et la note « membres au prorata » sur #1622.
- `docs/plan-prompts.md` : ajouter les phases éditeur comme P-25 à P-30 (ou équivalent) avec état.
- `docs/retour-rencontre-2026-09-09.md` : marquer T1 #6 (H1) et T2 #11/T3 #12 partiellement livrés ; référencer #1762.
- Mémoire Claude Code : `project-status.md` à jour au moment du digest (index MEMORY.md aussi).

## Addendum (2026-09-16, 18 h) : H1 SEO au niveau de la page, remplace le select des héros

- **Décision (ferme, demande explicite de Gabriel)** : le contrôle du H1 est UN champ de page,
  `seoH1` (libellé « H1 SEO (optionnel) »), à côté de « Titre SEO » dans les réglages de la page,
  pas un réglage par section. Vide = le grand titre du héros reste le `<h1>`. Renseigné = la page
  rend un `<h1 class="sr-only">` avec ce texte (component-library/src/shared/astro/page.astro,
  dans la frontière bookshop:live) et passe `h1Taken` aux sections : les quatre héros rendent leur
  grand titre en `<h2>`, styles inchangés. Le select `h1Element` (Phase 2, commit e23ff99) est
  RETIRÉ des 4 héros, specs, zod et guide. Réserve dite une fois : texte masqué à l'écran, Google
  le lit mais lui donne moins de poids qu'un titre visible.
- **Portée** : zod `seoH1: z.string().optional()` sur home, landing, services, pages ; input
  CloudCannon sur les 4 collections ; gabarits page/service/landing ; clé `"seoH1": ""` posée sur
  les 86 fichiers de contenu (règle « la clé doit exister dans le fichier pour que le champ
  apparaisse ») ; les 4 routes passent `seoH1={frontmatter.seoH1}` à `<Page>`.
- **Cause probable du « je ne vois pas le texte enrichi »** : 392 des 546 sections (services et
  pages générales) n'avaient pas `_bookshop_name`, la clé id_key de la palette générée ; sans elle,
  CloudCannon devine le composant par comparaison des clés (doc structures-reference, repli
  officiel) et rate souvent, d'où des champs texte bruts et le libellé de collection
  « Titre / Titre de la page (onglet + SEO)… » sur toutes les sections. Normalisé : chaque section
  porte maintenant `_bookshop_name` = `type`. Vérifié localement que `npx @bookshop/generate`
  (stub `_cloudcannon/info.json`) produit bien 33 structures avec les entrées `html` et leurs
  options. À confirmer dans CloudCannon dev après build.
- **Vérification** : lint 0 erreur, vitest 144/144, astro check 0 erreur, build STATIC_ONLY dans une
  copie isolée (robocopy + jonction node_modules, dev server sur 4321) : garde-fou H1 = 156 pages
  avec un seul H1, 0 sans. Démo : `seoH1` posé sur decouvrir FR → `<h1 class="sr-only">…</h1>` +
  grand titre en `<h2>`. Non commité.
- **Piège script** : sur les fichiers CRLF, une regex `^    \{?$` avec insertion après
  `m.end()` laisse un `` orphelin (`{
`) ; git classe alors le fichier binaire et le diff
  devient « fichier entier ». Corrigé (22 fichiers). Insérer avant `m.start()` de la ligne
  suivante, ou ne pas consommer le ``.
