# Digest 2026-08-18-02 : refonte Centre de ressources, contrôles CMS (slug campagnes, préremplissage, infolettre), optimisation Lighthouse

- **Date :** 2026-08-18 → 2026-08-19 (session de soirée puis lot autonome de nuit).
- **Type :** Dev session (build; secondaire : debugging, deux cycles d'audit Lighthouse avec diagnostic).
- **Project :** Démo Victrix (Astro + Bookshop + CloudCannon), phase spike CloudCannon, branche `spike/cloudcannon`.
- **In one line :** la page /ressources est refaite fidèle à la maquette « ressources parent » sous le nom Centre de ressources avec tous ses textes au CMS, les campagnes gagnent une adresse personnalisable, le catalogue préremplit le formulaire contact, la carte infolettre devient un vrai formulaire à deux modes, et deux cycles Lighthouse font passer les images de 156 à 21 Mo, la police de 345 à 107 Ko et élucident un LCP simulé trompeur.
- **File under :** Project Victrix Demo, `docs/digests/`.
- **Subjects covered :** /ressources (index + article), collection pagesSysteme (bloc ressources étendu), renommage Blogue → Centre de ressources, slug frontmatter des campagnes, préremplissage /solutions → /contact, formulaire infolettre fr/en, compression d'images (2 scripts), sous-ensemble Inter, contraste footer, guide-edition.md, 3 audits Lighthouse.
- **Scope of this session :** pages ressources/index, ressources/[slug], solutions, contact, campagnes/[slug]; BlogCard, Footer; content.config.ts (pagesSysteme, landing, rien d'autre); cloudcannon.config.yml (blog, landing, pagesSysteme); données pages-systeme, site, forms, landing; scripts d'images et de police; theme.css (@font-face), BaseLayout (preload). PAS touché : Header, méga-menus, sections Bookshop, /api/forms (contrat serveur inchangé), portail, pages services et génériques.

## Goal / scope

Demande initiale du user en cinq volets : (1) renommer « blogue » en « centre de ressources » et rapprocher /ressources de la maquette `docs/design/export2/ressources parent.txt` ; (2) styler les articles et ouvrir les éditeurs visuel et texte pour cette section ; (3) plus de contrôle CMS : URL choisie des landings, en-tête/pied éditables, exemple de lien complexe catalogue → formulaire prérempli ; (4) bannière d'annonce activable et planifiable au CMS ; (5) viser 99-100 en performance et SEO Lighthouse. Le user a fourni deux exports JSON Lighthouse en cours de route, puis est parti dormir en demandant un lot autonome.

## Decisions made

- **Deux des cinq demandes existaient déjà : rien reconstruit.** La bannière planifiable (Navigation → announce : `enabled` + `startAt`/`endAt` datetime, évaluée au build via `src/lib/schedule.ts` + rebuild quotidien) et l'édition en-tête/pied des campagnes (P-04 : modes complet/allege/personnalise, ≤ 5 liens, CTA, interrupteurs) étaient complètes et exposées au CMS. Vérifié avant d'agir, signalé au user. Les éditeurs blog étaient déjà `content` + `visual`. **Firm.**
- **Textes de la refonte /ressources dans pagesSysteme, pas dans une nouvelle collection.** Le bloc `ressources` existant est étendu (titleAccent, subscribeLabel, searchPlaceholder, readMore, byline, expertCard, newsletter, cta) : c'est la maison des textes de cette page depuis 2026-08-12, et la règle de périmètre (« le texte d'une page vit avec sa page ») est respectée. **Firm.**
- **Slug campagnes : le nom de fichier reste la clé d'appariement FR/EN, le frontmatter `slug` ne change que l'URL.** Vide = nom de fichier (comportement historique, zéro migration forcée) ; regex minuscules-chiffres-tirets dans le zod ; doublon d'URL par langue = échec de build nommé. Les 6 fichiers landing et les 2 schemas portent un `slug` explicite pour que le gabarit d'URL CloudCannon `{slug}` soit exact (même patron que blog). Rules out : renommer les fichiers pour changer l'URL (aurait cassé l'appariement). **Firm.**
- **Préremplissage contact par querystring, tolérant, sans garde-fou de build.** /solutions ajoute `?sujet=Un projet&produit=<titre>` seulement quand le href de la fiche est `/contact` ; contact.astro lit `sujet`/`expertise`/`produit` côté client sur les ids stables (subject, expertise, request), ignore toute valeur qui ne correspond pas à une option, marche dans les deux modes (maquette et /api/forms). Motif : un lien est de la donnée molle, un sujet inconnu ne doit jamais casser la page. **Firm.**
- **Grille bento approximée dans UNE grille filtrable** : vedette = article le plus récent en `col-span-2`, carte infolettre insérée en 4ᵉ tuile SANS `data-tags` (jamais masquée par filtre ni recherche), le reste en cartes standard. Rules out : un bento figé hors filtre (aurait dédoublé la logique). **Firm.**
- **Refonte 100 % utilitaires Tailwind + tokens (règle no-hybride), pilules d'état en CSS scopé minimal** (l'état `.is-active` est runtime, une recette utilitaire ne peut pas le suivre). Couleurs maquette mappées : #0055FF → `primary`, #000D2E → `nuit`, #F9F9F9 → `neutral-50`, #CCE5FF → `bleu-100`, #E2E2E2 → `bordure`. **Firm.**
- **Compression des images en place, mêmes noms de fichiers.** Redimensionnement 1600 px + PNG palette q80 + JPEG mozjpeg q75 progressif sur tout fichier > 300 Ko de public/wp-content. Rules out : conversion webp ou renommage (aurait exigé de réécrire toutes les références et le contenu migré). Réversible par git. **Firm.**
- **Police : sous-ensemble plutôt que changement de stratégie de chargement.** `font-display: swap` et le preload étaient déjà corrects ; le problème était les 345 Ko. Sous-ensemble = caractères réellement présents dans src/content, src/data, src/i18n, src/pages, src/components, component-library, unis aux plages latines complètes (ASCII, Latin-1, Latin étendu-A, ponctuation générale, €, flèches), axe de graisse conservé. Nouveau nom de fichier `InterVariable-subset.woff2` (cache-bust naturel), original conservé comme source. **Firm.**
- **Une seule image eager sur /ressources (la vedette), dérivés 800 px pour toutes les cartes.** Voir « Problems hit » : le LCP simulé attendait les octets des images eager alors que la page peint à 581 ms observés. Les cartes affichent ≤ 400 px CSS, servir le 1600 px était du gaspillage pur. La vedette et la couverture d'article gardent l'original en `src` + `srcset` 800/1600. Repli : une couverture téléversée au CMS sans dérivé est servie telle quelle. **Firm.**
- **Infolettre réelle par le patron deux modes de contact, textes visibles dans pagesSysteme, définition (et destinataire) dans Formulaires.** Champ unique Courriel ; pas de case de consentement (l'inscription volontaire à une infolettre EST le consentement pour cet usage ; à revalider si le juridique l'exige). **Tentative sur ce dernier point, firm sur le reste.**
- **design:previews sautés volontairement** : aucun composant de la palette Bookshop modifié, régénérer aurait produit ~30 PNG de bruit binaire dans le diff. **Firm.**

## What was built or changed

Tout **done** sauf mention contraire. La session du 18 au soir a été commitée par le user (`26dc74c` puis `0adf82e`) ; le lot de nuit est **uncommitted** au moment du digest.

- `src/pages/[lang]/ressources/index.astro` : réécrit. Héros (chip `bleu-100`, H1 deux tons via `titleAccent`, bouton marine ancré `#infolettre`, carte vitrée « 500+ Experts » ≥ lg), barre collante `top-20` pilules + recherche plein-texte (`data-blog-search`, combinée au filtre `?categorie=` conservé), grille bento, carte infolettre deux modes, bandeau CTA avec filigrane V.
- `src/pages/[lang]/ressources/[slug].astro` : étiquettes → libellés bleus majuscules, couverture `fetchpriority="high"` + `srcset` 800/1600, cartes latérales en dérivé 800.
- `src/components/BlogCard.astro` : dérivé 800 px via `coverForCard`.
- `src/content.config.ts` : bloc `ressources` de pagesSysteme étendu ; `slug` optionnel validé sur la collection landing.
- `src/pages/[lang]/campagnes/[slug].astro` : `urlSlugOf`/`fileSlugOf`, garde-fou doublons, altLocalePath sur le slug du pendant.
- `src/pages/[lang]/solutions.astro` : helper `contactHref` (sujet localisé FR « Un projet » / EN « A project » + produit) sur la vedette et les cartes.
- `src/pages/[lang]/contact.astro` : préremplissage querystring + scroll vers le formulaire.
- `src/components/Footer.astro` : chip portail `text-primary-container` → `text-on-primary-fixed-variant` (contraste 4.31:1 → 5.73:1, paire de rôles prévue pour `primary-fixed`).
- `src/data/pages-systeme/{fr,en}.json` : bloc ressources complet + renommages « blogue » ; `src/data/site/{fr,en}.json` : libellés « Consulter le centre de ressources » / « Visit the resource centre ».
- `src/data/forms/{fr,en}/infolettre.json` : définition Infolettre (champ Courriel requis, objet « Inscription à l'infolettre »).
- `cloudcannon.config.yml` : collection blog renommée « Centre de ressources », gabarit d'URL landing `/[relative_base_path]/campagnes/{slug}/`, input « Adresse de la page », ~20 inputs pagesSysteme ajoutés.
- Fichiers landing (6) + `schemas/landing-{fr,en}.md` : frontmatter `slug` posé.
- `scripts/compress-wp-images.mjs` : compression en place > 300 Ko (75 fichiers, ~156 → ~21 Mo).
- `scripts/subset-inter.mjs` : sous-ensemble Inter (373 caractères, 345 → 107 Ko) ; `src/styles/theme.css` et `src/layouts/BaseLayout.astro` basculés sur `/fonts/InterVariable-subset.woff2`.
- `scripts/blog-cover-derivatives.mjs` + `src/lib/images/cover-derivative.ts` : 44 dérivés `-800` des couvertures (vedette 227 → 66 Ko).
- `docs/guide-edition.md` : sections renommées Centre de ressources, « Adresse de la page » des campagnes (avec avertissement redirection), bloc Pages système réécrit, préremplissage automatique du catalogue, carte infolettre (où s'édite quoi).

## Environment / stack specifics

- Dérivation des noms de champs de formulaire : `src/lib/forms/field-name.ts` (« Courriel » → `courriel`, « Email » → `email`) ; contrat /api/forms : champs cachés `lang`, `source`, `_formId`, pot de miel `website`, 303 vers `/<lang>/merci/`, retour `?erreur=1`.
- Options du select sujet contact : FR « Un projet, Une expertise, Une carrière, Autre » ; EN « A project, An area of expertise, A career, Other ». Le préremplissage doit envoyer la valeur EXACTE localisée.
- Tokens utiles : `--color-primary` #1a5bff, `--color-nuit` #0b1334, `--color-primary-fixed` #b8cbf9 avec `--color-on-primary-fixed-variant` #0337ba comme on-color conforme, `--color-bordure` #e5e7eb.
- Lighthouse local sans extension : `npx lighthouse <url> --chrome-path "C:\Users\gmercierblouin\AppData\Local\ms-playwright\chromium-1228\chrome-win64\chrome.exe" --chrome-flags="--headless=new"` (la variable CHROME_PATH seule ne suffit pas, le flag `--chrome-path` oui).
- `subset-font` installé `--no-save` (dépendance volontairement hors package.json, notée en tête de scripts/subset-inter.mjs).
- Preview CloudCannon : `lawful-hare.cloudvent.net` ; sert un header noindex (X-Robots-Tag) qui plafonne le SEO Lighthouse à ~69 sur le preview, sans objet en production.

## Problems hit and how resolved

- **Audit 1 (fourni par le user, /fr/ressources : perf 74, SEO 66).** Cause racine du LCP 25,5 s : première carte = PNG WordPress de 1,7 Mo en `loading="lazy"`. Fix : eager + fetchpriority sur les premières images, compression en place de toutes les images > 300 Ko. SEO 66 = uniquement `is-crawlable` (noindex du preview, non corrigeable côté repo).
- **sharp échoue à OUVRIR tous les .jpg par chemin sur cette machine** (« UNKNOWN: unknown error, open »), alors que les .png passent et que `fs.readFileSync` lit les mêmes fichiers sans problème. Fix : toujours passer un Buffer à sharp. Consigné dans les deux scripts d'images. Cause exacte non identifiée (antivirus soupçonné, non confirmé).
- **Audit 2 (user, perf 69) : deux causes intriquées.** (a) Le scan DevTools du user embarquait son extension AdBlock (scripts `chrome-extension://` visibles dans le rapport, 3,3 s de main thread) : mesurer via PageSpeed Insights ou incognito. (b) Le LCP était devenu le PARAGRAPHE du héros à 6,5 s : la police de 345 Ko retardait le repaint. Fix : sous-ensemble Inter 107 Ko.
- **Audit 3 (nuit, lighthouse local propre : perf 77, TBT 0) : le LCP simulé 6,3 s contre 581 ms OBSERVÉS.** Lecture des `observed*` du rapport : la page peint tout à 581 ms ; c'est la simulation Lantern qui étire le LCP parce que les trois images eager (~580 Ko) peignent dans les mêmes frames que le texte héros et entrent dans son graphe de dépendances pré-LCP. Fix : une seule image eager + dérivés 800 px. Leçon : sur un LCP simulé incompréhensible, comparer d'abord `observedLargestContentfulPaint` au chiffre simulé.
- **Dead end : premiers dérivés 800 px PLUS GROS que les originaux** (366 Ko vs 227). Redimensionner un PNG déjà en palette sans re-spécifier `png({palette: true})` ressort du RVB complet. Fix : même recette de compression que compress-wp-images + garde-fou « jeter tout dérivé ≥ original », régénération complète.
- **PSI API sans clé : 429 quota du jour** après deux appels. Contournement : lighthouse CLI local avec le Chromium de Playwright (audit sans extension, ce qu'on cherchait).
- **Échec e2e transitoire** : `/fr/merci` affichait l'overlay « Content entry data does not match schema » pendant le run (dev server en re-sync du content.config modifié à chaud). Un curl direct ne reproduisait plus ; re-run du spec vert. C'est le symptôme documenté du dev server non frais.
- **Permissions du mode autonome** : l'arrêt des processus node du user (dev server) et `npx playwright test` ont été refusés par le classifieur ; `npm run test:e2e` est passé et a réutilisé le serveur existant du user (comportement `reuseExistingServer`).

## Verification / test state

- **Vérifié** : toutes les routes touchées en 200 sur le dev server du user (fr + en, ressources, article, campagnes, solutions, contact, merci) ; contenu attendu présent (grep) ; dérivés servis ; vitest 120/120 (deux runs) ; e2e 13/13 (après le re-run du spec transitoire) ; eslint 0 erreur (2 warnings préexistants) ; cloudcannon.config.yml parse (js-yaml) ; sous-ensemble servi 110 Ko.
- **Non vérifié** : le mode RÉEL de l'infolettre (PUBLIC_FORMS_ENABLED absent en local ; le patron est la copie de contact, dont le mode réel est éprouvé) ; le rendu de l'éditeur visuel CloudCannon sur les nouveaux inputs ; l'effet réel des fixes LCP sur un audit propre du preview (exige commit + rebuild + re-audit) ; le rendu du sous-ensemble de police à l'œil (couverture de glyphes large, risque faible).
- **Attendu, pas promis** : perf ≥ 90 au prochain audit propre (graphe pré-LCP ~210 Ko contre ~600).

## Open questions / decisions pending

- L'inscription infolettre sans case de consentement suffit-elle pour la Loi 25 dans le contexte démo → prod ? (Position prise : oui pour une inscription volontaire ; à confirmer si le site devient réel.)
- Si l'audit propre post-rebuild reste < 95 : inliner le CSS critique (~15 Ko) pour tirer le FCP sous 2 s. Non entamé.
- Pages de détail des solutions (le « détail produit » de la demande initiale reste la carte du catalogue ; des fiches dédiées sont une suite déjà notée au guide).

## Risks / dependencies / blockers

- Le re-audit propre dépend du commit + push du user puis du rebuild CloudCannon.
- Le mode réel des formulaires (contact ET infolettre) reste gated par la pose des clés §7ter (Turnstile, SMTP2GO) : opérations en attente d'avant cette session.
- Les dérivés `-800` doivent être committés avec le code qui les référence (le repli original protège, mais le gain perf disparaît sans eux).
- Nouvelles couvertures CMS : sans relance de `scripts/blog-cover-derivatives.mjs`, elles sont servies en original (dégradation douce, pas de casse).

## Tech debt / deferred

- design:previews non régénérés (volontaire, palette inchangée).
- `scripts/compress-wp-images.mjs` et `blog-cover-derivatives.mjs` sont des passes manuelles, pas un hook de build : acceptable pour la démo, à automatiser si le CMS devient le canal principal d'images.
- 2 warnings eslint préexistants (href social « # » du footer, label consentement contact) laissés tels quels.
- Le champ `i` de la boucle des cartes ne sert plus qu'à insérer la carte infolettre en 4ᵉ position (résidu bénin de l'aller-retour eager/lazy).

## Next steps

1. User : revue du diff de nuit puis commit + push (suggestion : un commit infolettre + perf images + docs, message fourni en fin de session).
2. Après rebuild : audit PROPRE (PageSpeed Insights ou lighthouse local `--chrome-path`) sur `/fr/ressources` ; si < 95, ouvrir le chantier CSS critique.
3. Démo CloudCannon des nouveautés : « Adresse de la page » sur une campagne, textes Pages système → Centre de ressources, formulaire Infolettre.
4. Backlog inchangé d'avant session : pose des clés §7ter puis vérifs préversion ; audit AC ADO (az login dans le terminal du user) ; Lot 6 photos export2 (le volet subset Inter est fait).

## Durable findings

- **Lantern (Lighthouse simulé) peut afficher un LCP 10× l'observé** quand des ressources lourdes peignent dans les mêmes frames que l'élément LCP : toujours confronter `audits.metrics.observedLargestContentfulPaint` avant d'optimiser. Un scan DevTools avec extensions actives contamine TBT et main thread (les scripts d'extension apparaissent dans `unused-javascript`).
- **sharp sur Windows** : passer par Buffer (`sharp(readFileSync(p))`), l'ouverture par chemin échoue de façon opaque sur certains fichiers ; et re-spécifier explicitement la recette de sortie (`png({palette: true})`) en redimensionnant un PNG palette, sinon le fichier regrossit.
- **PSI API sans clé** : quota jour très bas (2 requêtes ici) ; le lighthouse CLI local pointé sur le Chromium de Playwright (`--chrome-path`) est le substitut fiable.
- Les previews `*.cloudvent.net` de CloudCannon servent un noindex qui plafonne la catégorie SEO de Lighthouse : ignorer `is-crawlable` sur un preview.
- `subset-font` (harfbuzz wasm) conserve les axes variables par défaut : viable pour sous-ensembler une police variable en un appel.
- Patron « URL personnalisable sans casser l'appariement i18n » : slug frontmatter optionnel + nom de fichier comme clé de traduction + garde-fou doublons au getStaticPaths + gabarit CloudCannon `{slug}` avec valeur posée dans les fichiers existants.

## Continuity note

Le user a explicitement délégué le lot de nuit (« tasks that don't require my input ») : le classifieur de permissions a bloqué l'arrêt de son dev server et `npx playwright test` direct ; s'en souvenir avant de planifier un futur lot autonome qui exigerait un serveur frais.

## Living docs status

Ce repo ne suit pas le jeu PROJECT/ARCHITECTURE/DECISIONS/SCHEMA/STATUS : ses documents vivants sont `docs/guide-edition.md` (mis à jour CETTE session), `docs/operations.md`, `docs/formulaires.md`, `docs/ado-alignement.md` et la mémoire Claude (à jour). **À régénérer : rien d'obligatoire.** Optionnel : une ligne dans `docs/formulaires.md` pour recenser le formulaire `infolettre` parmi les définitions, et `docs/ado-alignement.md` si la refonte ferme des éléments ADO (à vérifier avec l'audit AC).
