# Digest 2026-08-17-02 : corrections design (maquettes parent/enfant), CMS CloudCannon, viewport

- **Date :** 2026-08-17 (soir) au 2026-08-18.
- **Type :** Dev session (build ; secondaire : debugging CloudCannon).
- **Project :** Démo Victrix (Astro + Bookshop + CloudCannon), phase corrections design post-export2.
- **In one line :** série de corrections dirigées par le user sur captures : méga-menu, tuiles accueil, pages expertise-mère et produit-enfant alignées sur les nouvelles maquettes, champ « Fond de section » borné à la palette, vignettes et préversions CloudCannon réparées, conteneur élargi à 1920, méga-menu ajusté au viewport.
- **File under :** Project Victrix Demo, `docs/digests/`.
- **Subjects covered :** méga-menu Ressources et comportement plein écran, home-expertises sans icônes, page /expertises, /services/productivite (expertise mère), copilot-studio (produit enfant), fonds chauds accueil, renommage « Cartes à icônes », champ `fond`, vignettes du picker CloudCannon, préversion visuelle des collections données, largeur de conteneur, héros clair, navigation Produits.
- **Scope of this session :** couche présentation (composants Bookshop, contenu JSON, styles tokens, Header) + configuration CloudCannon. PAS touché : formulaires, API, portail, ADO, blog (sauf largeur de lecture épinglée), autres pages produit enfant (O bureau, Plateforme employé, etc. restent en rich-text).

## Goal / scope

Reprendre les user stories restantes en mode corrections : le user fournit des captures de maquettes (`docs/design/expertisesparent.css`, `homepage.css`, `produit-child.css` + images dans `docs/design/export2/Images/`) et pointe les écarts. Sept vagues de corrections dans la même session.

## Decisions made

- **Le champ `icon` des tuiles « Nos services » (home-expertises) est RETIRÉ du contrat**, pas seulement du rendu (composant, Zod, cloudcannon, bookshop, JSON fr+en). Raison : la maquette n'a pas d'icônes et un champ CMS mort trompe l'éditeur. Ferme : un futur retour des icônes serait un nouveau champ. **Firm.**
- **« Bénéfices » renommé « Cartes à icônes » en AFFICHAGE seulement** ; la clé technique `type: benefits` et `_structures.benefit_items` restent gelées (les renommer casserait contenu + schéma + bindings). **Firm.**
- **Couleurs au choix des éditeurs = select BORNÉ à la palette, jamais de couleur libre** (généralisation de P-16). Champ `fond` : 5 fonds CLAIRS (`blanc | givre | ivoire | beige | sable`), défaut = rendu historique du bloc (zéro churn). Décision user via AskUserQuestion : pilote 6 blocs + 5 clairs. Les peaux SOMBRES restent des `variant` designés par bloc (une inversion de textes ne se généralise pas). Étendu le jour même à 3 blocs produit quand produit-child.css a exigé des lavis chauds. **Firm.**
- **La maquette « expertisesparent.css » = la page /services/productivite** (expertise mère, déjà bâtie en août sur expertise-mere.css, textes quasi verbatim), pas l'index /expertises. Le user a ENSUITE demandé explicitement que /fr/expertises reçoive le même rendu : la page est un MIROIR des sections du parent (sans « Ressources liées »). Duplication assumée pour la démo ; à différencier ou rediriger plus tard. **Tentative (revisit : différenciation /expertises vs /services/productivite).**
- **Conteneur élargi 1280 → 1920 + gouttières proportionnelles `clamp(32px, 3.75vw, 96px)`** (3.75vw = les 48px de la planche 1280). Raison : les maquettes remplissent leur cadre ; à 2560 le site plafonné à 1280 flottait (48 % du viewport). Cadran unique `--spacing-container-max`. Refusé : fluidité totale sans plafond (les grilles à rangées fixes se déformeraient). **Firm, plafond ajustable.**
- **Méga-menu « jamais de défilement » : règle FIT-BASED, pas un breakpoint.** Première itération à 1300px rejetée par le user (une fenêtre large mais basse débordait aussi). À l'ouverture on mesure : déborde → mode ajusté (paddings compacts, image de la carte vedette masquée) + min-height jusqu'au bas du viewport, bandeau bas collé au bord ; tient → comportement inchangé. **Firm.**
- **Héros clair `overlay: "blanc"`** ajouté à service-hero (3e clé) au lieu de créer un nouveau composant : double dégradé verbatim maquette, titre foncé, accent `titleHighlight` en bleu-500 plein. Posé sur expertises + productivite fr+en. **Firm.**
- **Vignettes du picker : `picker_preview.image` EXPLICITE dans chaque spec** pointant l'URL déterministe `/_cloudcannon/bookshop_thumbs/<comp>/preview.png`. Raison : `preview_image` posé par @bookshop/generate est une clé LÉGALE que CloudCannon moderne ne documente plus (vérifié docs + source). **Firm.**
- **Préversion/éditeur visuel étendus aux collections données** (contact, carrieres, solutions, site, navigation) via `url` + `_enabled_editors: [visual, data]`, annulant les `disable_url` historiques. **Firm.**

## What was built or changed

Tout **done** (vérifié au dev server) sauf mention contraire. Commits `81840b7` et `db9fcb9` poussés par le user en cours de session ; le reste est uncommitted à la clôture.

**Méga-menu / Header (`src/components/Header.astro`)**
- « Derniers articles » : 2 cartes avec `coverImage` (16:9 + titre) au lieu de 4 titres en liste h-10 qui se chevauchaient.
- Comportement fit-based : `sizeMegaPanel()` module-level (pattern du Escape global, compatible ClientRouter), `data-fit` + `group/mega`, paddings compacts `group-data-[fit]/mega:py-6`, image carte vedette `group-data-[fit]/mega:hidden`, bandeau bas `mt-auto`, re-mesure au resize. Vérifié : 1440×640 et 1280×560 → bottom = viewport exact ; 2560×1100 → naturel.

**Composants (component-library/src/components/)**
- `home-expertises` : icônes retirées (contrat complet) ; peau nuit → `bg-anthracite` #1A2029 (« Noir Anthracite », homepage.css).
- `home-solution` → `bg-beige` ; `home-latest` → `bg-ivoire` ; `home-experts` → bande `bg-sable` (la carte grise #F3F4F6 était déjà bonne). Ex-`#F9FAFB`/blanc provisoires.
- `benefits` : 3 nouvelles clés d'icônes PLEINES `organisation | porteur | destinataire` (SVG client verbatim, `FILL_ICONS` avec viewBox propre 20×18 / 16×16 / 24×12) ; renommage palette « Cartes à icônes ».
- Champ `fond` (map FONDS verbatim par composant, règle composants autonomes) sur : benefits, cta (lavis derrière le panneau, la `variant` garde le panneau), faq, stats, feature-boxes, rich-text, offer-cards, realisations, strategic-value (`''` = défaut dépendant de la variante vitrine).
- `service-hero` : `overlay: "blanc"` (dégradés `linear-gradient(105deg,#F1E8DF…)` + `linear-gradient(90deg,#FFF…)`, titre neutral-900, accent `text-primary`, lead neutral-600, bouton 2 blanc 50 %/neutral-300, fond ivoire sans photo, min-h 600).
- `strategic-value` : variante produit inversée, TEXTE à gauche / image à droite (`order-2`, produit-child.css).

**Contenu (fr + en, miroirs)**
- `src/content/services/{fr,en}/productivite.json` : ordre maquette (héros→approche→marquee→outils→bento→cta→ressources), héros blanc + `titleHighlight` + photo `/images/sections/expertises-hero.jpg`, icônes approche client, icônes bento et outils exclusifs RETIRÉES (display:none dans la maquette), image Ø Studio `/images/sections/expertises-ostudio.png`.
- `src/content/pages/{fr,en}/expertises.json` : miroir des sections du parent (v1 à contenu inventé remplacée sur demande explicite), `noindex: false`.
- `src/content/services/{fr,en}/productivite/copilot-studio.json` : héros → `/images/sections/produit-enfant-hero.jpg` (lettrage « INTELLIGENCE. EFFICIENCY. AUTOMATION. » cuit dans l'image), `fond` ivoire/beige/ivoire, espace insécable avant le deux-points du titre FR.
- `src/content/home/{fr,en}/accueil.json` : clés `icon` des tuiles services retirées.
- `src/data/navigation/{fr,en}.json` : **Copilot Studio ajouté au méga Produits** ; 3 liens EN corrigés (404 → slugs traduits `productivity-consulting/office-booking`, `productivity-consulting/employee-platform-intranet`, `it-procurement`).

**Styles**
- `src/styles/theme.css` : `--spacing-container-max: 1920px` + gouttière `clamp(32px, 3.75vw, 96px)` dans `container-site`.
- `src/styles/tokens.css` : `--container-max: 1920px`, `--container-pad` clamp identique (pages legacy alignées).
- `src/pages/[lang]/ressources/[slug].astro` : `.article__inner` épinglé `min(var(--container-max), 1280px)` (la paire 800+300 en space-between se disloquerait à 1920).

**CloudCannon / CMS**
- 30 specs bookshop : `picker_preview.image` → `/_cloudcannon/bookshop_thumbs/<comp>/preview.png`.
- `cloudcannon.config.yml` : `url` + éditeurs visual/data sur contact (`/[slug]/contact/`), carrieres (`/[slug]/carrieres/`), solutions (catalogue `/[relative_base_path]/solutions/`), site et navigation (`/[slug]/`) ; structure `benefit_items` relabellée « Carte à icône » ; icône select benefits +3 clés ; `expertise_items` sans `icon`.
- `scripts/design/generate-section-previews.mjs` : `[data-consent-banner]` ajouté au masquage de capture (le bandeau Loi 25 photobombait les vignettes) ; 30/30 preview.png régénérés propres.
- Assets copiés : `expertises-hero.jpg`, `expertises-ostudio.png`, `produit-enfant-hero.jpg` → `public/images/sections/`.

**Schéma (`src/content.config.ts`)** : `fondClair` partagé + `fond` sur 9 sections ; `overlay` +`'blanc'` ; benefits icons +3 ; home-expertises `icon` retiré.

## Problems hit and how resolved

- **Vignettes « No preview available »** : cause racine = @bookshop/generate 3.19.0-rc1 émet `preview_image` (structure-builder.js:363), clé absente des docs CloudCannon actuelles (le picker lit `picker_preview.image`). Fix : clé explicite dans les specs, le PNG étant relogé à une URL déterministe au postbuild (`.cloudcannon/postbuild` → `npx @bookshop/generate`).
- **Thumbnail du site CC périmée** : le build EST bon (vérifié `lawful-hare.cloudvent.net/fr/` = redesign) ; la racine `/` est une page de redirection Astro (meta refresh → /fr) donc le bot de capture garde une vieille image. Non réglé côté repo ; options : Site Settings CC, ou rendre `/` réel.
- **Bouton « + Add \<premier item\> »** : comportement d'interface CloudCannon (raccourci d'ajout rapide), non configurable via nos specs (docs vérifiées).
- **3 liens EN du méga Produits en 404** (préexistant, découvert en ajoutant Copilot Studio) : hrefs FR alors que les pages EN vivent sous slugs traduits. Corrigés et vérifiés 200.
- **Deux-points orphelin** en tête de ligne dans le titre Copilot Studio FR : espace insécable U+00A0 avant « : ».
- **Dead end nommé** : breakpoint 1300px pour le méga plein écran — rejeté (fenêtres larges mais basses débordaient encore) ; remplacé par la mesure au moment de l'ouverture.
- **Piège scripts** : 9 specs bookshop sont en CRLF (callout, faq, feature-boxes, form, numbered-cards, related-posts, rich-text, service-hero, tech-columns) ; tout script d'édition par chaîne doit gérer `\r\n`.
- Un doublon `_enabled_editors` (contact) créé par mes edits puis attrapé par le parse YAML de validation ; corrigé.

## Verification / test state

- **126/126 tests unitaires verts** après chaque vague (dernière passe incluse).
- Vérifs visuelles Playwright sur le dev server du user (jamais de build — serveur actif) : accueil, /fr/expertises (2534 et 1280), parent productivite, copilot-studio, méga (2560×1100, 1440×640, 1280×560, 1280×700), fonds chauds, héros blanc, vignette benefits propre.
- URLs vérifiées 200 : copilot-studio fr/en, o-bureau/plateforme/it-procurement EN (post-fix).
- **Non vérifié : e2e** (`tests/e2e/header-variants.spec.ts` couvre le header/méga — à repasser sur dev server FRAIS avant push) ; rendu CloudCannon réel des vignettes et préversions (nécessite push + build CC) ; largeur 1920 sur pages legacy (contact/carrieres/recherche) survolée seulement.

## Open questions / decisions pending

- **/fr/expertises vs /services/productivite quasi identiques** : différencier, rediriger l'un vers l'autre, ou laisser tel quel pour la démo ? (Posé au user, resté sans réponse explicite ; le miroir a été fait sur sa demande.)
- **Étendre le template produit-enfant** aux autres enfants (O bureau, Plateforme employé, O studio, ServiceNow, Copilot M365, Dynamics 365 — tous encore en `service-hero + rich-text`) : proposé, ordre suggéré O bureau + Plateforme employé d'abord ; en attente du go.
- Étendre `fond` aux ~14 blocs restants ? Valider la liste des 5 fonds avec le designer ?
- Plafond conteneur : 1920 confirmé ou pousser à 2560 (edge-to-edge sur l'écran du user) ?
- Divergences designer à trancher : carte bleue IA #0055D4 (vs bleu-500 gardé), placeholder #C5C6D0, rayon bento 8 (homepage.css) vs 4 (card-services), CTA nuit #1C1C1A vs on-surface #21242A.
- Thumbnail CloudCannon : régler côté Site Settings ou rendre `/` réel ?

## Tech debt / deferred

- Pages produit enfant non converties (rich-text hérités WP).
- `/fr/produits` toujours placeholder (hero + rich-text + cta).
- `preview_image` légal toujours émis par @bookshop/generate (inoffensif, doublonné par notre clé) ; à nettoyer si une mise à jour Bookshop adopte la clé moderne.
- Sous-ensemble Inter (344 Ko), reporté depuis le 08-14.

## Next steps

1. User : `npm run test:e2e` (dev server frais) puis commit + push du lot en attente (message fourni en conversation).
2. Build CloudCannon : vérifier vignettes du picker, préversions contact/carrieres/solutions, nouveau nom « Cartes à icônes », menu Produits.
3. Trancher /expertises vs productivite ; go/no-go conversion O bureau + Plateforme employé (surface : Claude Code).
4. Poser la question thumbnail à CloudCannon ou décider de rendre `/` réel.

## Durable findings

- **CloudCannon moderne ignore `preview_image`** (clé légale que @bookshop/generate 3.19.0-rc1 émet encore) ; le picker lit `preview` / `picker_preview` avec `image`. Contournement stable : pointer `picker_preview.image` sur `/_cloudcannon/bookshop_thumbs/<comp>/preview.png`, l'URL de relogement de generate.
- **La thumbnail de site CloudCannon capture la racine `/`** ; une racine en redirection meta-refresh (pattern i18n Astro) la laisse périmée indéfiniment.
- Le bot de capture locale (design:previews) doit masquer TOUT élément fixe : la liste `addStyleTag` doit être revue à chaque nouvel overlay (le bandeau consentement ajouté après coup photobombait).
- **Espace insécable avant « : »** dans les titres FR à retenir pour tout heading composé au CMS.
- Tailwind v4 : `group-data-[fit]/mega:*` (groupe nommé + data-attribute) fonctionne bien pour un mode piloté par JS sans re-render ; `max-[1300px]:` accepté mais c'était la mauvaise ABSTRACTION ici (la contrainte était la hauteur, pas la largeur).
- Les liens `service:` de la navigation résolvent par ID de collection ; les URLs EN utilisent des slugs traduits → utiliser des `href` bruts pour les services traduits (les liens `service:` casseraient en EN tant que resolveNavHref ne mappe pas id→slug).
- Fenêtres CRLF : 9 des 30 specs bookshop ; les regex d'édition doivent tolérer `\r?\n`.

## Living docs status

**Oui, à régénérer :**
- `docs/design/reception-export2.md` : ajouter les 3 nouveaux exports reçus (homepage.css, expertisesparent.css → productivite, produit-child.css) et leurs mappings hex→token (#FCF9F5→ivoire, #F6F3EF→beige, #1A2029=anthracite, divergences en suspens listées ci-dessus).
- `docs/guide-edition.md` : documenter le champ « Fond de section » (où il existe, les 5 valeurs) et la préversion visuelle désormais disponible sur Contact/Carrières/Solutions/Textes du site/Navigation. (Le renommage « Cartes à icônes » y est déjà fait.)
- Pas de PROJECT/ARCHITECTURE/SCHEMA formels dans ce repo ; `docs/GUIDE-PROJET.md` peut absorber « conteneur 1920 » et « héros clair » à sa prochaine passe, non urgent.
