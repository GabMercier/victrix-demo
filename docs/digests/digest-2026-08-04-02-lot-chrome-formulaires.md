# Digest : lot chrome + centrage, fidélité maquette Figma (header/méga/footer), méga collant, re-skin formulaires

- **Date :** 2026-08-04 (soir, session unique en trois passes)
- **Type :** Dev session (build ; secondaire : debugging, un bug de cascade CSS majeur découvert et corrigé)
- **Projet :** Refonte victrix.ca : Astro + CloudCannon, branche `spike/cloudcannon`. Phase 5 (re-skin par lots), lot chrome exécuté.
- **En une ligne :** Le chrome complet du site (bannière, header, méga-menus, footer, campagnes) et les deux sections home restantes sont re-skinnés fidèlement aux exports Figma fournis par le user, le centrage des sections est unifié, un bug de cascade qui neutralisait tous les utilitaires Tailwind est corrigé à la racine, le méga-menu devient « collant » sur toute la zone du header, et la section formulaire est réécrite avec deux variantes (carte / panneau).
- **Classer dans :** Project « Victrix refonte » + `docs/digests/` du repo.
- **Sujets couverts :** utilitaire `container-site` ; fix cascade `@layer base` ; piège no-preflight `border-solid` ; réécriture Header/Footer/CampaignHeader/CampaignFooter ; schéma navigation (featured, stripe, parentHrefs, cta) ; re-skin home-latest/home-partners ; IA de navigation maquette (liens morts assumés) ; comportement méga collant ; re-skin form.astro (variantes + width) ; chaîne de contrat P-05.
- **Portée de la session :** chrome + accueil + section formulaire. NON touché : pages services (re-skin fin à venir), page Contact (lot « page » à venir, la maquette form2 a d'autres champs), pages Carrières/Solutions (à créer), Logo.astro (legacy assumé), preflight Tailwind (fin de re-skin), Phase 2 FR-racine.

## Objectif de la session

Reprendre après la bascule design system : corriger le centrage des sections de l'accueil et re-skinner ce qui ne l'était pas (bannière, header, footer). En cours de route, le user a fourni trois nouvelles références Figma (copies CSS, le plugin Tailwind lui est indisponible) qui ont recadré le lot : `docs/design/composants.css` (méga-menu, header TopAppBar, footer clair), puis trois captures header/méga/footer, puis `docs/design/form1.css` et `form2.css` (deux styles de formulaire). Méthode annoncée pour la suite : une page à la fois, avec capture Figma + CSS extrait.

## Décisions prises

| Décision | Raison | Exclut | Statut |
|---|---|---|---|
| **`composants.css` prouve que les exports HTML étaient incomplets** : le design final INCLUT méga-menus, recherche, FR/EN, CTA. La structure du site était conforme, seule la peau change | Fichier Figma « Composants » fourni par le user | La nav plate des 5 exports HTML comme cible | Ferme |
| Valeurs du composants.css mappées sur les tokens planche per arbitrage v2 (bleus #0038E6/#3256FF → primary #1A5BFF, gris froids → neutres chauds) ; divergences consignées §2.e des arbitrages | Règle établie : structure = exports, système = planche | L'adoption verbatim des hex de l'export | Ferme, à signaler à l'équipe design |
| **Gouttière unique 16px mobile / 32px ≥768px partout** via `@utility container-site` (+ `--container-pad` legacy aligné) | Les sections re-skinnées (32px fixe) et le legacy (24px) divergeaient de 8px/côté ; le Figma est lui-même incohérent (40 vs 48) | Les gouttières par-artboard du Figma | Ferme |
| **Base globale en `@layer base`** (reset + typo d'éléments de global.css) | Découverte à la vérif : la feuille non-couchée battait TOUS les utilitaires (`* {margin:0}` tuait m-*, `h2 {font-size}` tuait text-*, `p {max-width}` tuait max-w-none) ; le lot accueil précédent en souffrait en silence | Le statu quo « :not([class]) au cas par cas » pour les éléments | Ferme (les blocs classes, :focus-visible et prefers-reduced-motion restent non-couchés) |
| Nav maquette : Découvrir Victrix · Expertises · Services · Produits · Carrière · Ressources ; **Contact devient LE bouton bleu** (nouveau champ `cta` du schéma nav), **Portail client devient un lien texte**, sélecteur de langue = l'AUTRE langue seule (« EN » sur FR) | Captures Figma header | Contact dans la nav centrale ; le portail en bouton (repli conservé : sans `cta`, le portail redevient bouton) | Ferme (choix user) |
| **Le même panneau méga s'ouvre sous Expertises + Services + Produits** : nouveau `mega.parentHrefs[]` au schéma + garde-fou parents orphelins | Choix user (AskUserQuestion) ; les 3 colonnes du panneau couvrent les 3 domaines | Un panneau par onglet | Ferme |
| **Liens sans page = « morts assumés »**, mappés au plus proche quand évident | Choix user ; cohérent avec les /decouvrir, /carrieres déjà morts du prototype | Retirer les entrées sans page (moins fidèle) | Ferme ; liste consignée (voir Environnement) |
| **Méga « collant »** : ouvert tant que le pointeur est dans le header OU le panneau ; fermé à la sortie réelle de la zone, à Escape, ou quand le focus sort | Demande user (le panneau se fermait dès que le curseur quittait l'onglet) | L'ouverture CSS pure group-hover (incapable d'exprimer « toute la zone ») | Ferme |
| Footer : chip = **Portail client** (pas « Nous joindre »), pas d'adresse, wordmark TEXTE « Victrix » en barre basse, retour-haut sur sa propre rangée, Facebook avant LinkedIn | Capture Figma footer | L'adresse au footer (reste sur la page Contact) ; le logo SVG en barre basse (il reste dans le header) | Ferme |
| Formulaires : **2 variantes** sur la section `form` (`variant: carte` défaut = form1 ; `panneau` = form2) + **`fields[].width: plein/demi`** (présentation seulement, serveur ignore) | Deux styles Figma fournis ; le contrat de champs est générique | Une heuristique automatique de pairage des champs (échoue sur form1 : Entreprise et Courriel restent pleine largeur) | Ferme |
| Les contraintes « parité à l'octet » de form.astro sont OBSOLÈTES (feuille scopée supprimée, re-skin Tailwind complet) | La parité visuelle n'est plus un gate depuis la bascule ; la mécanique fonctionnelle est intégralement conservée | Le maintien de la feuille gelée P-05 | Ferme |
| Page Contact : PAS re-skinnée dans cette session | La maquette form2 porte d'autres champs que le formulaire actuel (2 selects « De quoi souhaitez-vous parler ? » / « Expertise ») : c'est un lot « page » complet | Un patch partiel du formulaire de contact | Ferme (lot à venir) |
| Différés explicites : scroll-shrink header (80→64px), 5e colonne footer éditoriale, placeholders de champs | Hors du chemin critique ; placeholders absents du contrat de champ | | Ferme |

## Construit / modifié

- **Fondation centrage** (fait) : `src/styles/theme.css` (+`@utility container-site` : 1280px, 16px mobile / 32px ≥48rem) ; `src/styles/tokens.css` (`--container-pad` 24→16px + média 768px→32px) ; `src/styles/global.css` (reset + typo de base enveloppés dans `@layer base` ; `scroll-padding-top` 96px) ; migration des 5 sections du lot accueil vers `container-site`.
- **`src/components/Header.astro`** (fait, réécrit ~2 fois) : bannière re-skinnée ; barre sticky h-20 `bg-surface` ; nav 14/500 avec actif primary souligné ; méga = panneau blanc 3 colonnes (les colonnes JSON coulent en grille 3 pistes) + carte mise en avant (icône, titre, corps, CTA uppercase, image APRÈS le CTA) + bandeau bas ; actions = EN seul · loupe · Portail texte · bouton Contact ; drawer mobile re-skinné (+ bouton Contact, classe `mobile-nav__cta` ajoutée au sélecteur de fermeture du script). Méga collant : attribut `data-mega-open` sur le `<li>` + utilitaires `group-data-[mega-open]:*`, ouverture au mouseenter/focusin, fermeture au `mouseleave` du `<header>` (le panneau en est un descendant), Escape global au NIVEAU MODULE (jamais dans bindHeader : il s'empilerait à chaque swap ClientRouter) + Escape par li avec flag `data-mega-closed` anti-réouverture. Hooks e2e/JS/global.css préservés en classes nues.
- **Schéma navigation** (`src/content.config.ts`) (fait) : `mega.featured{title,body,ctaLabel,href,image}` et `mega.stripe{text,links≤2}` optionnels ; `mega.parentHrefs[]` (+ garde-fou build orphelins dans Header.astro) ; `cta{label,href}` optionnel au niveau racine ; `columns[].icon` conservé au contrat mais plus rendu (`megaIcons` supprimé).
- **`src/data/navigation/{fr,en}.json`** (fait, réécrits) : items maquette, méga 3 colonnes (Expertises/Services/Produits), featured « Projets en IA » (image `/images/home/expertise-intelligence-artificielle.jpg`), stripe « Expertise québécoise reconnue à l'international » + Études de cas / Livre blanc 2024, cta Contact.
- **`src/components/Footer.astro`** (fait, réécrit) : footer CLAIR 5 colonnes (`bg-surface-container-low rounded-t-xl`), chip Portail client (icône connexion), courriel souligné, tél « +1 514 879-1919 », « Suivez-nous sur : » Facebook | LinkedIn en liens texte, séparateur, barre basse (wordmark texte, légal, © Victrix 2026), retour-haut rond `href="#"` sur sa propre rangée. Import Logo retiré.
- **`src/i18n/ui.ts`** (fait) : footer.columns = 4 colonnes maquette (Expertises/Services/Produits/À propos), `contactCta` = Portail client → /portail, `social` = [Facebook, LinkedIn] (hrefs « # », URLs réelles à fournir), `backToTop` ; `facebookAria`/`linkedinAria` retirés du footer (la page Contact garde les siens).
- **`src/components/CampaignHeader.astro` / `CampaignFooter.astro`** (fait) : portés aux mêmes recettes (classes copiées verbatim, composants autonomes) ; chaîne CTA campagne inchangée (chrome.cta ?? portail).
- **`component-library/src/components/home-latest/home-latest.astro`** (fait) : re-skin Tailwind complet, rangée de tête idiome home-expertises, grille 3 colonnes, cartes avec lien étiré ; contrat frontmatter (seam `cards`) intact. **`home-partners`** (fait) : titre label-caps discret centré, noms atténués, py-section-gap. **`home-experts`** : panneau p-12/20 → p-8/12. **`home-iso`** : `border-0` ajouté au `border-y` (piège préexistant).
- **`component-library/src/components/form/form.astro`** (fait, réécrit) : 100 % Tailwind, variantes carte (form1 : carte blanche max-w-736, liseré bleu 4px, entête 16px centré DANS la carte, champs `border-outline` rayon 2px h-50px, select à chevron custom, bouton pleine largeur + icône envoi) et panneau (form2 : `bg-surface-container`, `border-outline-variant` rayon 4px, gaps 16, bouton auto) ; grille `sm:grid-cols-2` pilotée par `width` ; TOUTE la mécanique conservée (modes PUBLIC_FORMS_ENABLED/Turnstile, honeypot, bannière ?erreur=1, showIf, jetons, forms v2, gotcha Bookshop scripts-par-regex).
- **Chaîne P-05 synchronisée** (fait) : `content.config.ts` (formFieldCore + `width`, section form + `variant`) ; `form.bookshop.yml` (blueprint + _inputs `variant` au niveau STRUCTURE, prime sur le `variant` light/dark de la section cta) ; `cloudcannon.config.yml` (`_structures.form_fields` value + _inputs `width` ; _inputs nav : `cta`, `parentHrefs`, `featured`, `stripe`) ; `schemas/form-{fr,en}.json` (+width). `src/lib/forms/registry.ts` PAS touché (normalizeField écarte width, sans objet côté serveur).
- **`docs/design/arbitrages-design-a-trancher.md`** (fait) : nouvelle section §2.e (divergences du composants.css, gouttières unifiées, footer clair, scroll-shrink différé).
- **Previews** : 23/23 régénérés deux fois (`npm run design:previews`), à committer.

## Architecture après la session

Le chrome est 100 % Tailwind sur les recettes du design system ; le conteneur unique `container-site` aligne header, sections et footer sur la même grille 1280/1216px (16px mobile). La cascade est désormais saine : `@layer base` (global.css, éléments) < `@layer theme` < `@layer utilities` ; le CSS scopé legacy non-couché bat toujours tout (inchangé). La navigation est entièrement pilotée par `src/data/navigation/*.json` (éditable CloudCannon) : items, méga multi-parents, carte mise en avant, bandeau, bouton Contact. Le méga est piloté par JS (data-attributs) avec le survol CSS retiré. La section formulaire offre deux peaux via `variant` sans toucher au contrat serveur.

## Environnement / stack

- Inchangé : `tailwindcss@4.3.3`, `astro@^5.18.2` (épinglé v5, Node 18 compat), Node session 20.20.2, `@playwright/test@^1.61.0`.
- Build isolé `C:\Users\gmercierblouin\vvbuild` (robocopy /E + /MIR ciblé) ; prod = 128 pages Pagefind, STATIC_ONLY = 132 pages (Bookshop actif). Dev server user actif sur :4321 pendant toute la session (e2e et captures le réutilisent ; jamais de build dans le repo).
- **Liens « morts assumés » introduits (pages à créer, liste pour l'équipe)** : `/expertises`, `/secteurs`, `/services/infrastructure`, `/services/services-applicatifs`, `/services/projets-en-ia`, `/centre-de-confiance` (+ les préexistants `/decouvrir`, `/produits`, `/carrieres`, `/tarification`). Mappés vers l'existant : O bureau → `/services/productivite/o-bureau`, Plateforme employé → `/services/productivite/plateforme-employe-intranet`, Approvisionnement TI → `/services/approvisionnement-ti`, Infonuagique → `/services/services-infonuagiques`, Services gérés → `/services/services-ti-geres`, Conseil stratégique → `/services/conseil-strategique`, IA → service ref `intelligence-artificielle`.
- URLs réelles des services (pas de slug override) : les noms de fichiers de `src/content/services/fr/` FONT les URLs ; les anciens liens nav `/services/consultation-strategique`, `/services/infonuagique`, `/services/services-geres` étaient eux-mêmes morts.

## Problèmes rencontrés et résolus

- **🔑 Cascade : la feuille globale non-couchée battait TOUS les utilitaires.** Symptôme : « NOS PARTENAIRES » rendu 48px/700 navy au lieu de label-caps 12px ; diagnostic par getComputedStyle : `* {margin:0}` neutralisait aussi tous les `m-*`/`mb-*` (mb-12 = 0px) et `p {max-width:70ch}` battait `max-w-none`, depuis le lot accueil. Cause : les couches (@layer theme/utilities) perdent contre le CSS non-couché quelle que soit la spécificité. Fix : reset + typo d'éléments de global.css dans `@layer base`, déclarée avant les imports Tailwind (global.css chargé avant theme.css dans BaseLayout → ordre base < theme < utilities). Le legacy scopé non-couché garde exactement sa priorité.
- **Piège no-preflight #3 : `border-solid` seul allume les 4 côtés à la largeur UA « medium » (3px).** Symptôme : les têtes de colonnes du méga encadrées d'une boîte au lieu d'un simple filet bas. Sans preflight, `border-b` pose la largeur du bas seulement ; `border-solid` pose le style sur les 4 côtés dont la largeur par défaut UA n'est pas 0. Fix : `border-0 border-b|t|y border-solid` sur toute bordure un-côté (Header, Footer, home-iso).
- **Escape ne fermait pas le méga ouvert à la souris** : le gestionnaire keydown vit sur le `<li>` et ne reçoit que les événements du focus. Fix : écouteur Escape global au niveau module (une seule fois, requête le DOM courant ; dans bindHeader il s'empilerait à chaque navigation ClientRouter).
- **Carte mise en avant étirée sur toute la hauteur de grille** (row-span-2) : `self-start` la ramène à sa hauteur naturelle.
- Dead end assumé : pairage automatique des champs demi-largeur par heuristique de type (échoue sur form1 où Entreprise/Courriel, pourtant courts, restent pleine largeur) → champ explicite `width`.

## Vérification / état des tests

- Gate vert après chaque passe : lint 0 erreur (7 warnings, était 8 : les 2 pastilles sociales `#` de l'ancien footer parties, le retour-haut `href="#"` arrivé), 122/122 tests unitaires, e2e 7/7 (le test de bascule FR→EN fonctionne avec le lien EN unique : il cible `getByRole('link', {name:'EN'})`).
- Builds isolés verts ×2 (prod 128 pages + STATIC_ONLY 132) après la passe fidélité ; les gardes navigation passent avec les nouveaux champs.
- **Méga collant prouvé par script Playwright 11 assertions** : ouvert au survol, survit logo/bouton Contact/panneau, bascule Expertises→Ressources, fermé hors zone, Escape souris ET clavier, focus clavier ouvre/ferme, Tab vers l'onglet suivant ouvre son panneau.
- Captures conformes aux références : accueil FR pleine page (alignement gouttières), méga sous les 3 onglets, méga Ressources, footer, campagnes allégé/complet, drawer mobile, carte formulaire (evaluation-securite).
- NON testé : éditeur visuel CloudCannon (nouveaux champs nav + sélecteurs formulaire), variante `panneau` en rendu réel (aucun contenu ne l'utilise encore), rendu mobile réel au-delà du drawer.
- Le bouton du formulaire apparaît atténué : mode maquette désactivé (PUBLIC_FORMS_ENABLED absent), comportement existant voulu.

## Questions ouvertes

- URLs réelles LinkedIn/Facebook (footer + méga éventuel) : à fournir (héritées « # »).
- `placeholder` par champ de formulaire : les maquettes en montrent (« Votre prénom », « votre@courriel.com ») mais le contrat de champ n'en a pas. Ajouter la clé sur la chaîne P-05 si voulu (petit).
- Bleus du composants.css (#0038E6/#3256FF) vs Bleu Victrix planche (#1A5BFF) : évolution voulue de la palette ou artefact ? Consigné §2.e, à trancher par l'équipe design.
- Pages des liens morts assumés : périmètre et priorités (Secteurs, Infrastructure, Services applicatifs, Projets en IA, Centre de confiance, Expertises index).
- Ordre du lot « page par page » : suggestion faite de commencer par une page service ou Contact (le user fournira capture + CSS).

## Risques / dépendances

- Vérifs humaines CloudCannon accumulées après push : éditeur visuel accueil, collection Navigation (Carte mise en avant, Bandeau bas, Bouton d'action, Liens parents supplémentaires), sélecteurs Style du formulaire / Largeur du champ, préversion (mégas, bannière, drawer).
- Équipe design : réponses §2.e + les points antérieurs (dérivés palette, images mortes, a11y #1A5BFF).
- OPS inchangés : secret `REBUILD_HOOK_URL`, décommission worker OAuth Sveltia.

## Dette / différé

- Scroll-shrink du header (80→64px au défilement) : différé (présent dans PageExpertise.html et l'audit).
- 5e colonne éditoriale du footer (la grille est prête, contenu ui.ts à ajouter).
- Page Contact complète (form2 avec ses vrais champs, panneau bleu, bureaux) : lot « page » à venir.
- Re-skin fin des pages services + Carrières/Solutions ; preflight Tailwind en fin de re-skin ; adresse du footer retirée (vit sur Contact seulement).
- Animations d'entrée du drawer abandonnées (parité motion-reduce gratuite).

## Prochaines étapes

1. User : `git add -A` ; commit (suggestion : un commit « lot chrome + centrage + fix cascade », un commit « fidélité maquette + méga collant », un commit « formulaires ») ; push.
2. Vérifs CloudCannon listées ci-dessus ; fournir les URLs sociales.
3. Envoyer les signalements design (§2.e + antérieurs).
4. Lot suivant : une page à la fois, capture Figma + CSS extrait fournis par le user (Contact ou une page service en premier).

## Constats durables

- **Cascade CSS : une feuille d'auteur NON-couchée bat TOUTES les couches (@layer), spécificité comprise.** Un reset global (`* {margin:0}`, `h2 {font-size}`) non-couché neutralise silencieusement les utilitaires Tailwind v4 (couches theme/utilities). Fix générique : envelopper la base d'éléments dans `@layer base` déclarée AVANT les imports Tailwind ; le CSS scopé legacy non-couché conserve sa priorité. Diagnostiquer par getComputedStyle, pas à l'œil.
- **No-preflight : `border-solid` seul = bordures 3px sur les 4 côtés** (style posé partout, largeur UA « medium » par défaut). Toute bordure un-côté exige `border-0 border-b|t|x|y`. Troisième piège de la famille (après `a:not([class])` et `no-underline`).
- Tailwind v4 : variantes `group-data-[attr]:*` + `li.dataset.x` = machine à états propre pour un menu piloté JS ; `mouseleave` d'un élément couvre ses descendants positionnés en absolu (un panneau enfant du `<header>` compte comme « dans le header »).
- ClientRouter Astro : un écouteur document/module ajouté dans un handler re-exécuté par navigation S'EMPILE ; les écouteurs globaux vivent au niveau module et requêtent le DOM courant à l'événement.
- CloudCannon : les `_inputs` d'une STRUCTURE priment sur ceux de la collection (déjà exploité pour le `type` de champ ; ré-exploité pour le `variant` de la section form vs le `variant` light/dark de cta). Un nom de champ réutilisé entre sections se résout à ce niveau, pas en renommant le contrat.
- Figma « copy as CSS » (sans plugin Tailwind) : exploitable tel quel comme référence, en ignorant les positions absolues d'artboard et en ne gardant que typo/couleurs/espacements/rayons ; les polices Inter/Manrope résiduelles y sont des artefacts de génération.
- Playwright : `locator.focus()` est strict (un texte partagé entre trigger et têtes de colonnes ambiguïse le sélecteur : préciser `a[aria-haspopup]`) ; un script scratchpad ESM résout les paquets du repo via `createRequire('c:/Repo/.../package.json')`.

## Statut des documents vivants

Régénération nécessaire : OUI.

- `docs/GUIDE-PROJET.md` : journal du 4 août (soir) à compléter (lot chrome, fix cascade, formulaires).
- `docs/plan-convergence-migration.md` : §Phase 5 : chrome ✅, home-latest/partners ✅, formulaires ✅ ; restent services/pages/preflight.
- `docs/formulaires.md` : À METTRE À JOUR : nouveaux `variant` (section) et `width` (champ) au contrat de présentation ; la note « feuille gelée » de form.astro est obsolète.
- `docs/operations.md` : rien de neuf (recette vvbuild inchangée).
- `docs/design/arbitrages-design-a-trancher.md` : à jour (§2.e ajoutée en session).
- `docs/plan-prompts.md` : mention P-05 (width/variant) et P-04 (chrome campagnes re-skinné) à rafraîchir au prochain passage docs.
