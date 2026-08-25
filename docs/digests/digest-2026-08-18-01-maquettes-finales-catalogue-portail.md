# Digest 2026-08-18-01 : maquettes finales landing + contact, images catalogue, retrait du portail mock

- **Date :** 2026-08-18.
- **Type :** Dev session (build; secondaire : planning, la session a ouvert sur une planification complète du reste).
- **Project :** Démo Victrix (Astro + Bookshop + CloudCannon), phase corrections design post-export2 et fermetures ADO.
- **In one line :** les deux maquettes FINALES du designer (landing campagne, contact) sont appliquées, les 9 images du catalogue Solutions câblées, le cadrage des héros corrigé, le portail mock retiré au profit de la seule page de connexion, et l'alignement ADO mis à jour avec la feuille de route complète du reste.
- **File under :** Project Victrix Demo, `docs/digests/`.
- **Subjects covered :** contact.astro (restyle final), landing licences-power-platform (chrome complet, fonds, vraie définition de formulaire), champ `fond` étendu à hero et form, catalogue /solutions (images, dégradé chips, panneau vedette responsive), héros Carrières (object-position), retrait du portail mock, sitemap, ado-alignement, reception-export2 §5.
- **Scope of this session :** pages contact / landing licences / solutions / carrieres / portail, composants hero, benefits, form, strategic-value, callout, schéma contact et sections, config CloudCannon, astro.config, docs. PAS touché : pages produit-enfant (sauf rien), pages placeholder, blog, /api/forms (contrat serveur), header et footer du site (divergences signalées, non corrigées).

## Goal / scope

Session en deux vagues. Vague 1 (plan approuvé en plan mode) : appliquer `docs/design/export2/landing-pagefinal.txt` et `contactfinal.css`, câbler les 9 nouvelles images du catalogue, corriger le cadrage du héros Carrières (têtes coupées sur grand écran), mettre à jour `docs/ado-alignement.md`, et documenter la feuille de route de tout ce qui reste. Vague 2 (retours user sur captures) : affiner Contact (placeholders, H1, icône, astérisques), retirer le portail mock en ne gardant que la page de connexion, dégradé de lisibilité sur les cartes du catalogue, panneau vedette du catalogue repensé en responsive.

## Decisions made

- **Bleu #002FC7 des maquettes finales → tokens en place.** Les deux maquettes utilisent un 2e bleu (#002FC7) pour titres, icônes et liens, distinct du #1A5BFF des boutons. Décision user : la palette actuelle seulement, une teinte proche mappe sur le token existant. Résultat : #002FC7 → `primary` #1a5bff partout, divergence consignée dans reception-export2 §5 pour confirmation designer. Exception : le H1 Contact #00105B → `bleu-800` #072c88 (vague 2, le user a montré que `on-primary-fixed` #0b1334 rendait presque noir alors que la maquette est clairement bleu navy). **Firm.**
- **Landing licences : chrome COMPLET.** La capture de la maquette finale montre le header 5 entrées et le footer 4+1 colonnes, pas le chrome allégé campagne. Implémentation : blocs `header`/`footerMode` RETIRÉS du frontmatter (absent = complet, prouvé par header-config.test.ts). Rules out : le chrome allégé pour cette campagne. **Firm.**
- **Landing : vraie définition de formulaire + formId** (`src/data/forms/{fr,en}/campagne-guide-licences.json`) au lieu des champs inline, avec case de consentement Loi 25 requise et champs cachés Page d'origine + UTM source/campagne (patron campagne-evaluation). Motif : la maquette finale montre une vraie case à cocher et le formId apporte la validation serveur. **Firm.**
- **Champ `fond` étendu à `hero` (défaut `givre`) et `form` (défaut `''` = historique par variante, patron strategic-value).** Toujours borné à la palette (blanc, givre, ivoire, beige, sable), défauts = rendu historique, zéro churn sur l'existant. **Firm.**
- **Portail mock RETIRÉ, page de connexion seule (demande user, vague 2).** Supprimés : tableau de bord, routes `/auth/*`, middleware, `src/lib/auth`, `src/lib/data`. La page `/fr/portail` reste, purement visuelle (form sans action, bouton disabled), PRÉRENDUE. Le blueprint `docs/portail-auth.md` reste le plan de l'implémentation réelle Entra + Dataverse; l'ancien prototype vit dans l'historique git. Rules out : toute démo de connexion simulée. **Firm.**
- **Panneau vedette catalogue : image proportionnelle ≥lg, fond sous lavis <lg (demande user).** ≥lg : colonne image `minmax(0,7fr)_minmax(0,5fr)` remplace le 432px fixe (l'image était perdue à droite à 1920+). <lg : la photo devient le fond absolu du panneau sous un dégradé navy gauche→droite (`from-on-primary-fixed via-/90 to-/55`), au lieu de s'empiler sous le texte. **Firm.**
- **Contact : eyebrow du héros et mini-grille des villes SUPPRIMÉS du contrat** (schéma + cloudcannon + JSON fr/en), pas seulement du rendu, la maquette finale ne les a pas. Un champ CMS mort trompe l'éditeur (même logique que le retrait d'`icon` du 08-17). **Firm.**
- **Cadrage héros : `object-position` orienté visages, pas de refonte Carrières.** Le user voulait surtout que les têtes ne soient plus coupées à large viewport. `object-[50%_25%]` posé sur le héros Carrières (visages dans le tiers haut de la photo). service-hero laissé intact : expertises-hero a ses visages mi-cadre (sûr), et le lettrage cuit de produit-enfant-hero se rognera quel que soit l'object-position (problème d'asset, signalé). **Firm.**
- **ADO : MAJ doc + checklist à cliquer, le user clique lui-même** (pratique établie reconfirmée). **Firm.**

## What was built or changed

Tout **done** (vérifié dev server + build isolé), commits à faire par le user.

**Contact (`src/pages/[lang]/contact.astro`)** : bandes ivoire / blanc / ivoire; héros py-30 sans eyebrow, H1 `text-bleu-800`; grille 4 colonnes égales gap-4; carte Coordonnées rounded-lg ombre 0.25 sans bordure p-6, 2 rangées seulement (mini-grille villes supprimée); cartes bureaux `bg-beige` p-4 rounded-lg ombre, image `aspect-[252/128]`, ville/adresse flush, tél 18px; formulaire py-15, colonnes 376fr/792fr gap-4, panneau `bg-beige` sans bordure, inputs `border-neutral-400 rounded-sm text-on-surface-variant` + **placeholders** (nouvel objet `placeholders` dans `src/data/contact/{fr,en}.json` + schéma + input CC), demi-champs `gap-x-3 gap-y-6`, chevrons `text-on-surface-variant` 18px, textarea h-120, consentement 14px checkbox `border-neutral-600`, **submit pleine largeur h-56 `rounded` semi-gras + avion en papier**, astérisques collés aux libellés. Purgés : `#C4C5D9`, `#F0EDEA`, `#6B7280`, `cardBorder`, `cityLabelClass`.

**Landing (`src/content/landing/{fr,en}/licences-power-platform.md`)** : chrome complet (blocs retirés), héros `fond: ivoire` sans eyebrow (accent bleu conservé), strategic-value `fond: ivoire`, form `variant: carte` + `fond: sable` + `formId: campagne-guide-licences` + `fields: []`, NBSP avant « : » dans les deux titres FR. Nouvelles définitions `src/data/forms/{fr,en}/campagne-guide-licences.json` (Prénom/Nom demi, Entreprise, Courriel professionnel, checkbox Loi 25 requise, 3 hidden).

**Composants (component-library/src/components/)** : `hero` (prop `fond`, FONDS map, défaut givre + bookshop.yml select); `form` (prop `fond` '' par variante + bookshop.yml, carte : bordures `neutral-400`, strip `bg-bleu-800`, `p-6 sm:p-8`, titre 20/24 bold en carte, grille `gap-x-3 gap-y-6`, submit `rounded shadow-controle font-semibold`); `benefits` (compact : H2 32/39 bold, cartes `pb-14`, titre de carte `font-normal`); `strategic-value` (carte flottante `rounded`); `callout` (bandeau : titre `font-normal`). Schéma `src/content.config.ts` : `fond` sur hero et form, `placeholders` sur contact, eyebrow/villes retirés.

**Catalogue (`src/pages/[lang]/solutions.astro` + contenu)** : 9 images copiées vers `public/images/solutions/` (kebab-case; le hash `2090b126….jpg` = gestion-idees, collage d'ampoules confirmé visuellement), champ `image` renseigné dans les 18 JSON `src/content/solutions/{fr,en}/`; `hero-catalogue.jpg` = vedette o-bureau; dégradé `from-black/25` en tête des cartes (lisibilité des chips secteur); panneau vedette : colonnes 7fr/5fr ≥lg, photo en fond + lavis navy <lg (img de colonne `hidden lg:block`).

**Carrières** : héros `object-[50%_25%]` (`src/pages/[lang]/carrieres.astro`).

**Portail (retrait)** : supprimés `src/pages/[lang]/portail/tableau-de-bord.astro`, `src/pages/auth/{login,callback,logout}.ts`, `src/middleware.ts`, `src/lib/auth/` (6 fichiers dont session-cookie.test.ts), `src/lib/data/` (4 fichiers). `portail/index.astro` réécrit : `getStaticPaths = localePaths` (prérendu), plus de session ni returnTo. `PortalLogin.astro` : props réduits à `lang`, form sans action, bouton disabled (+ style), notes réécrites, CSS morts purgés. `astro.config.mjs` : shim getStaticPaths portail supprimé, commentaires STATIC_ONLY et output réécrits (seule route à la demande : /api/forms), **sitemap : exclusion `/portail`**. `public/_headers` : bloc `/auth/*` retiré. `src/env.d.ts` vidé. `tests/e2e/portal.spec.ts` réécrit (page rendue + bouton disabled + dashboard 404).

**Docs** : `docs/design/reception-export2.md` §5 (livraison 08-18, mappings, signalement assets 512px); `docs/ado-alignement.md` (#1412, #1452, #1453 avancés); `docs/guide-edition.md` (section « Fond de section »); `docs/portail-auth.md` (bannière retrait); `docs/DEPLOYMENT.md` §3 et `.env.example` (variables portail plus lues).

## Environment / stack specifics

- Dev server user actif sur 4321 toute la session : type-check et builds exécutés dans la copie isolée `C:\Users\gmercierblouin\vvbuild` (robocopy /E sans /MT, /XD chemins complets, recette operations.md §3.1), supprimée après chaque gate.
- `npm run design:previews` cible le dev server (défaut localhost:4321), sûr en concurrence.
- Après le retrait du portail : 160 pages au build (162 avant), tests unitaires 126 → **120** (les 6 tests session-cookie partis avec le mock), lint 5 → 4 warnings.

## Problems hit and how resolved

- **`perl -pe 's/…/\x{00A0}/'` écrit l'OCTET 0xA0 brut (latin-1), pas l'UTF-8 `C2 A0`** : fichier invalide. Une première réparation node en aller-retour binary/latin1 a laissé des `�NBSP�` (U+FFFD). Fix final : node en utf8 pur (`readFileSync(p,'utf8')` + replace + `writeFileSync(p,t,'utf8')`). À retenir : les NBSP dans les contenus FR se posent via node utf8, jamais via perl \x{} ni redirection shell.
- **Playwright : `browser.newPage({ viewportSize: … })` est ignoré** (l'option s'appelle `viewport`), toutes les « captures 1920/2560 » de la vague 1 étaient en fait à 1280. Reprises avec `viewport` : les vérifs tenaient quand même (le fix carrières validé à un vrai 2560).
- **Permission PowerShell** : un `Remove-Item` multi-chemins dans la même commande que robocopy a été bloqué par le classifier (« system path '/E' »). Contourné en s'en passant : la copie vvbuild précédente ayant été supprimée, un robocopy /E frais ne contient aucun fichier périmé, aucun miroir de suppressions nécessaire.
- **Sitemap vs portail prérendu** : rendre `/portail` statique l'aurait fait entrer au sitemap alors qu'il est noindex. Attrapé avant build, exclusion ajoutée au filtre sitemap d'astro.config.
- Dead end assumé : aucun object-position ne sauve le lettrage cuit en bas de `produit-enfant-hero.jpg` sur viewport large et bas; c'est un problème d'asset (exports 512px), remonté au designer.

## Verification / test state

- **Gate final (2 passes complètes, une par vague)** : lint 0 erreur (4 warnings pré-existants), **120/120 tests**, type-check 0 erreur (4 hints), `astro build` prod Complete + STATIC_ONLY 160 pages Complete en copie isolée; dist vérifié : `/fr/portail/index.html` prérendu, dashboard absent, portail hors sitemap.
- Vérifs visuelles Playwright sur dev server : contact conforme maquette (capture comparée par le user, retours appliqués puis revalidés), landing (chrome complet, fonds, checkbox Loi 25), catalogue 1920 (image proportionnelle) et 900 (photo en fond + lavis), carrières 2560 réel (visages entiers), portail (carte rendue, bouton grisé). NBSP vérifié dans le HTML rendu (octets C2 A0).
- Previews Bookshop 30/30 régénérés (vague 1; rien de bookshop touché en vague 2).
- **Non vérifié** : e2e (`npm run test:e2e`, dev server frais, portal.spec réécrit); rendu CloudCannon réel (fond hero/form, nouveau formulaire, build sans le shim portail); envoi réel du formulaire campagne (clés §7ter pas posées).

## Open questions / decisions pending

- Header du site : 6 entrées (avec Carrière) vs 5 sur toutes les maquettes finales; footer social « Facebook | LinkedIn » vs « LinkedIn | Facebook » maquette. Chrome global, non touché, à trancher avec le designer.
- Divergence #002FC7 (et #E5E2DE bordures cartes landing) à confirmer avec le designer.
- Toujours ouverts du 08-17 : /expertises vs /services/productivite (doublon), plafond 1920 vs 2560, 5 fonds clairs à valider.

## Risks / dependencies / blockers

- **Assets designer 512 px de large** : flous en pleine largeur ≥1920 (héros Carrières, héros services, vedette catalogue), lettrage cuit de produit-enfant-hero rogné sur viewports larges/bas. Demander des exports ≥1920 px (et le lettrage hors image). Gate la finition de #1452.
- Clés §7ter (7 vars Cloudflare Pages, OPS user) gatent les fermetures ADO #1430/#1491/#1492/#1462/#1428/#1436 et le test réel du formulaire campagne.
- Export Screaming Frog (existe, #1542 fermée) à déposer dans `docs/migration/` : gate P-18 → #1445/#1447/#1488 → P-17.

## Next steps

1. User : `npm run test:e2e` (dev server frais) puis commit + push (message fourni en conversation; `git rm` a déjà indexé les suppressions du portail).
2. Build CloudCannon : vérifier fond hero/form, formulaire campagne-guide-licences, `/fr/portail` bouton grisé, vignettes.
3. ADO : cliquer §1 (#1439, #1486, #1459, conteneurs #1419/#1423/#1468/#1471/#1476), trancher #1408/#1409/heatmap/#1483, récupérer l'export Screaming Frog.
4. Feuille de route documentée dans le plan de session : clés §7ter → P-18 inventaire URLs → produit-enfant ×6 (patron copilot-studio, fix o-bureau) → placeholders + P-19 → perf (WebP/AVIF, Inter subset) → P-13/P-20/P-21.

## Durable findings

- **`perl -pe 's/x/\x{00A0}/'` sur un fichier UTF-8 écrit l'octet 0xA0 brut** (encodage latin-1 par défaut), corrompant le fichier. Passer par node en utf8. S'ajoute au piège PowerShell `>>` UTF-16 déjà documenté.
- **Playwright : l'option de `newPage` est `viewport`, pas `viewportSize`** (silencieusement ignorée, défaut 1280×720). Toute capture « à largeur X » doit être confirmée par `page.viewportSize()`.
- Astro : une page `prerender = false` qui redevient statique entre au sitemap; si elle est noindex, l'exclure du filtre sitemap en même temps.
- Le pattern « fond de section '' = défaut par variante » (strategic-value) se réutilise proprement quand deux variantes ont des fonds historiques différents (form carte/panneau).
- Robocopy /E vers une destination inexistante n'exige aucun miroir de suppressions : la copie fraîche reflète l'état exact de la source (utile quand le classifier bloque Remove-Item multi-chemins).
- Le retrait d'une route à la demande peut résoudre un flake e2e de compilation à froid (le portail prérendu n'a plus de première-compilation lente).

## Living docs status

**Oui, à régénérer :**

- `docs/GUIDE-PROJET.md` (fait office de PROJECT/STATUS) : portail = page de connexion seule (mock retiré), catalogue avec visuels, maquettes finales appliquées, prochaine tranche = clés §7ter + P-18.
- `docs/portail-auth.md` : bannière posée cette session (fait), rien d'autre.
- `docs/ado-alignement.md` : mis à jour cette session (fait); re-toucher après les clics §1 du user.
- `docs/contenu-a-fournir.md` : ajouter la demande d'exports images ≥1920 px au designer; rayer « images du catalogue absentes ».
- Pas de SCHEMA.md formel; content.config.ts commenté reste la source.
