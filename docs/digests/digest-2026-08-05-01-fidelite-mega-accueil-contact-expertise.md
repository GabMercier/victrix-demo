# Digest : méga partagé sans fondu, puis fidélité maquette page par page (Accueil, Contact, Expertise mère)

- **Date :** 2026-08-04 (soir) au 2026-08-05 (nuit), session unique en quatre lots
- **Type :** Dev session (build ; secondaire : debugging, un bug d'enum attrapé par le build isolé et un data-store dev wedgé)
- **Projet :** Refonte victrix.ca : Astro + CloudCannon, branche `spike/cloudcannon`. Phase 5 (re-skin par lots), méthode « une page à la fois avec capture Figma + CSS extrait » pleinement engagée.
- **En une ligne :** Le méga-menu devient un panneau UNIQUE partagé entre Expertises, Services et Produits (zéro fermer/rouvrir), puis trois pages sont reproduites fidèlement sur leurs exports CSS : l'accueil (6 sections, nouveau composant home-solutions), la page Contact (réécrite Tailwind, selects Sujet/Expertise), et la page Expertise mère Productivité (re-skin service-hero/benefits/cta + 3 nouvelles sections partagées expertise-bento, tech-marquee, exclusive-tools).
- **Classer dans :** Project « Victrix refonte » + `docs/digests/` du repo.
- **Sujets couverts :** panneau méga partagé (ancrage DOM, accessibilité clavier) ; neutres froids verbatim vs tokens chauds (frontière posée) ; refonte accueil.json fr/en ; variants de cartes bento ; page Contact sans feuille scopée ; démarrage du re-skin services ; keyframes marquee au thème ; piège data-store services stale ; gate par build isolé vvbuild.
- **Portée de la session :** chrome (méga), pages Accueil, Contact, service parent Productivité, sections partagées P-07 (service-hero, benefits, cta re-skinnés). NON touché : autres pages services (contenu seulement à composer désormais), Carrières/Solutions, formulaire Contact vers /api/forms (toujours en mode démo), preflight Tailwind, previews (bloqués par le dev server à redémarrer).

## Objectif de la session

Reprendre après le lot chrome/formulaires : régler le comportement du méga (le user voyait un fondu fermer/rouvrir entre les trois onglets qui partagent le même panneau), répondre à « pourquoi le formulaire Contact n'utilise pas les nouveaux styles », puis dérouler la méthode page-par-page sur les exports fournis dans la session : `docs/design/megamenu.css`, `accueil.css`, `contact.css`, `expertise-mere.css` (+ captures).

## Décisions prises

| Décision | Raison | Exclut | Statut |
|---|---|---|---|
| **Méga = panneau rendu UNE FOIS par clé** (`data-mega-panel="main\|ressources"`), partagé entre ses déclencheurs (`li[data-mega="<clé>"]`) ; état `data-open` sur le PANNEAU (utilitaires `data-[open]:*`) | Chaque `<li>` rendait sa propre copie : passer d'un onglet à l'autre fermait/rouvrait des panneaux identiques (fondu) | L'état `data-mega-open` par `<li>` (`group-data-*`) | Ferme |
| **Le panneau vit dans le DERNIER `<li>` déclencheur** (megaPanelAnchor), pas après le `<ul>` | Ordre de tabulation : rendu après le menu, le panneau serait inatteignable au clavier (Tab traverserait Carrière/Ressources qui le ferment/remplacent) | Panneaux frères du `<ul>` | Ferme |
| Fermetures du méga : contenu qui change, entrée SANS sous-menu (souris ET clavier, sélecteur `:scope > ul > li:not([data-mega])`), sortie du header, focus hors nav, Escape | Demande user (« only when the content changes or when there is no sub menu ») ; le collant sur logo/bouton Contact est conservé | Fermeture au mouseleave du `<li>` | Ferme |
| **Neutres froids de la maquette repris VERBATIM là où l'export les montre ; bleus/navy toujours sur les tokens planche** | Retour user (« still not really the same ») sur le méga : la différence perceptible était la température (beige tokens vs blanc/gris froids) ; règle appliquée ensuite à l'accueil (export froid) et aux bordures #C4C5D9/#C3C6D7 des exports chauds | Le remap intégral froid→chaud de l'arbitrage v2 pour ces surfaces ; consigné §2.e avec question « généraliser les froids au chrome ? » | Ferme (à confirmer équipe design) |
| Formulaire de la page Contact : PAS un patch du style seulement, mais le LOT PAGE complet à la réception de la capture (fait dans cette session) ; le portage backend /api/forms reste séparé | Décision antérieure maintenue puis exécutée ; les champs réels (2 selects) viennent de la maquette | Patch partiel du seul formulaire | Ferme, exécuté |
| **Accueil = les 6 sections de la maquette, home-iso et home-partners RETIRÉS de la page** mais gardés à la palette et rendus sur campagnes/demo-sections.md (couverture previews) | La maquette ne les montre pas ; le garde-fou du script d'aperçus échoue sur un type sans rendu | Leur suppression de la palette | Ferme |
| Doublon « Services Gérés » (cartes 2 et 6 du bento accueil) reproduit tel quel | C'est la maquette ; reproduction fidèle demandée | Déduplication éditoriale | Ferme (à signaler au design au besoin) |
| Bento accueil : `items[].variant` EXPLICITE (image/claire/bleue/nuit) + `linkLabel` de surcharge ; bento expertise : `peau` (blanche/bleue/ardoise) × `taille` (grande/haute/large/petite) | Aucune heuristique de position fiable ; éditable CloudCannon (selects de structure) | Variants déduits de l'index | Ferme |
| Bento expertise : grille CSS `grid-cols-4 auto-rows-[96px] gap-4`, disposition obtenue par AUTO-PLACEMENT dans l'ordre des items | Reproduit exactement la maquette (grande 2×3, haute 1×2, large 2×1, petite 1×1) sans coordonnées par carte | Un champ position/coordonnées | Ferme |
| **Le re-skin des pages services passe par les sections P-07 partagées** : service-hero/benefits/cta re-skinnés (contrats intacts, additifs seulement), 3 sections neuves plutôt que des composants par page | Les campagnes profitent gratuitement du re-skin benefits/cta ; les autres pages services deviennent du travail de CONTENU | Des composants spécifiques à la page Productivité | Ferme |
| Marquee : keyframes au THÈME (`@theme --animate-marquee` dans theme.css), contenu doublé aria-hidden + liste sr-only | La règle no-hybride interdit le CSS scopé ; les keyframes appartiennent au design system | Un `<style>` scopé dans le composant | Ferme |
| Gate de cette passe par BUILD ISOLÉ vvbuild (pas par le dev server) | Le data-store services du dev server est resté stale après la réécriture des JSON (piège connu) ; le build a attrapé un vrai bug | Faire confiance au rendu dev pour valider le lot services | Ferme |

## Construit / modifié

- **`src/components/Header.astro`** (fait) : refactor méga partagé — `navItems[].megaKey`, `megaPanelAnchor` (dernier déclencheur), panneaux `#mega-main`/`#mega-ressources` avec `aria-controls`, `aria-expanded=true` sur TOUS les déclencheurs du panneau ouvert ; JS réécrit (openMega par clé = no-op si déjà ouvert, closeAllMegas, focusout de la nav entière, Escape par panneau avec refocus du déclencheur, Escape global module inchangé). Fidélité megamenu.css : panneau bg-white, carte vedette #F8F9FA bordure #C5C6D0 + halo bleu flouté (`relative overflow-hidden` + span -top-8 -right-8 blur), bandeau #EDEEEF, hover liens #F8F9FA, icône tête+engrenage PLEINE (fill-rule evenodd, engrenage en creux), CTA/image mt-6. Prouvé par script Playwright 17 assertions (MutationObserver : 0 fermeture entre les 3 onglets ; Tab atteint le panneau ; Escape refocalise).
- **Accueil** (fait) : `home-hero` (dégradé blanc gauche→droite, `titleAccent` = mot bleu dans le titre, 60/800, 2 CTA rayon 4), `home-expertises` = bento 6 cartes 300px à `variant` + lien de section, `home-solution` (« Libérez votre équipe » : badge flottant liseré bleu 4px, `features[]` 2 tuiles, CTA cercle-flèche 48px, eyebrow conditionnel), **NOUVEAU `home-solutions`** (3 cartes sombres 500px photo + dégradé noir, icônes ecran/bouclier/nuage, rendu automatique par le renderer partagé via import.meta.glob), `home-latest` (+`subtitle`, +`readMoreLabel` contenu, cartes blanches rayon 12, chip catégorie = tags[0] texte nu 10/900 #9CA3AF, flèche ↗, date plus rendue), `home-experts` (panneau #F3F4F6 rayon 16, bouton 14/900 majuscules). `src/content/home/{fr,en}/accueil.json` réécrits ordre maquette. Images : `src/content/home/equipe.jpg` (copie d'expertise-services-geres, pour l'enrich getImage), `public/images/home/sevoc.png`.
- **`src/pages/[lang]/contact.astro`** (fait, réécrit, feuille scopée ~250 l. supprimée) : héros centré (« Nous joindre » / « Contactez-nous ! » 56/800), carte Coordonnées blanche (rangées icône, filet, mini-grille villes avec labels `block`), 3 cartes bureaux photo/ville/adresse/tél (grille `1.5fr_1fr_1fr_1fr`), formulaire 2 colonnes : gauche titre 40/700 + 3 puces cochées bleues ; droite panneau #F0EDEA bordé #C4C5D9 avec Prénom/Nom, Courriel/Téléphone, selects Sujet/Expertise (chevron custom, remplacent les radios), « Précisez votre demande », Message, consentement `<label for>`, bouton primaire rayon 2. Mode DÉMO conservé (hooks `data-contact-form`/`data-form-status`, script preventDefault). `src/i18n/content/contact.ts` restructuré (heroEyebrow, formBullets, subjectOptions, expertiseOptions, offices avec image ; liens sociaux « # » supprimés → warnings lint 7→5). Photos bureaux : `public/images/contact/bureau-{quebec,montreal,paris}.jpg` copiées de `docs/design/Export HTML/assets/contact-0{1,2,3}.jpg`.
- **Sections P-07 re-skinnées** (fait, 100 % Tailwind) : `service-hero` (photo de fond + voile Bleu nuit 40 %, l'image n'est PLUS à droite ; +`cta2Label`/`cta2Href` bouton verre backdrop-blur), `benefits` (+`items[].icon` dossier/personne/groupe, tête centrée, cartes bordées #C3C6D7), `cta` (panneau arrondi 8 dans le conteneur ; dark = primary + décor cercles tireté/plein + bouton blanc ; light = beige + bouton primaire ; contrat gelé intact).
- **3 NOUVELLES sections partagées** (fait) : `expertise-bento`, `tech-marquee` (+ `--animate-marquee` et keyframes dans `src/styles/theme.css`), `exclusive-tools` (carte vedette badge/titre/texte/lien/image + cartes outils icône calendrier/etoile).
- **`src/content/services/{fr,en}/productivite.json`** (fait, réécrits) : hero → benefits (approche humaine) → expertise-bento (vision 360°) → tech-marquee (10 outils) → exclusive-tools (Ø Studio vedette + O bureau + Plateforme employé) → cta dark. Les 7 rich-text WordPress remplacés. EN garde `slug: productivity-consulting`. Images : `public/images/services/hero-productivite.jpg` (pageexpertise-01), `bento-intranet.jpg` (pageexpertise-02) ; **Ø Studio = `/wp-content/uploads/2023/09/bg-o-studio-1-scaled.jpg` (poulpe, existait déjà)**.
- **Couverture previews** : les 3 nouveaux types services ajoutés à `src/content/services/fr/demo-sections.json` ; home-iso/home-partners ajoutés à `src/content/landing/fr/demo-sections.md`.
- **Chaîne P-05 synchronisée** (fait) : `content.config.ts` (titleAccent ; variants/linkLabel/cta bento accueil ; features ; home-solutions ; subtitle/readMoreLabel ; cta2 héros ; benefits icon ; expertise-bento/tech-marquee/exclusive-tools) ; bookshop.yml ×9 (5 mis à jour, 4 créés) ; `cloudcannon.config.yml` (+_structures solution_items/solution_features/bento_items/tool_items avec `_inputs` DE STRUCTURE, benefit_items +icon, expertise_items +variant/linkLabel, home _inputs titleAccent/intro/readMoreLabel/features ; note collision `items` home-solutions vs expertise_items résolue au niveau structure).
- **`docs/design/arbitrages-design-a-trancher.md`** (fait) : §2.e révisé — neutres froids verbatim dans le méga, question « généraliser ? ».

## Environnement / stack

- Inchangé : `astro@^5.18.2` épinglé, `tailwindcss@4.3.3`, Node 20.20.2, Playwright ^1.61.0. Dev server user actif sur :4321 toute la session.
- Build isolé `C:\Users\gmercierblouin\vvbuild` rafraîchi par `robocopy /MIR` ciblé (src, component-library, public, schemas) ; prod **128 pages** Pagefind, STATIC_ONLY **132 pages**. Vérification visuelle du lot services sur `dist` servi statiquement (python http.server :4399, arrêté ensuite).
- Nouveaux assets : voir « Construit ». Les exports CSS de référence : `docs/design/{megamenu,accueil,contact,expertise-mere}.css`.

## Problèmes rencontrés et résolus

- **🔑 Data-store services STALE dans le dev server** : après la réécriture de `productivite.json`, le composant service-hero se mettait à jour (HMR) mais le CONTENU servi restait l'ancien ; `touch` du JSON et de la route inefficaces. Piège documenté (avoid-concurrent-astro : réécriture en masse de contenu pendant que le dev server tourne). Faux positif au diagnostic : grep « animate-marquee » matchait le CSS du thème inliné dans TOUTES les pages dev, pas le nouveau contenu. Contournement : gate par build isolé ; remède réel : REDÉMARRER le dev server (action user).
- **Le build isolé a attrapé un vrai bug** : `taille: 'haute'` utilisé par le composant et les contenus mais ABSENT de l'enum zod (écrit avant la conception finale de la grille). `InvalidContentEntryDataError` sur en/productivite ; enum corrigée (grande/haute/large/petite). Leçon : le build isolé n'est pas que de la parité, il valide les schémas.
- **Accessibilité clavier du panneau partagé** : premier jet avec panneaux après le `</ul>` = panneau inatteignable au Tab (les déclencheurs suivants le ferment). Résolu par l'ancrage dans le dernier `<li>` déclencheur.
- **Sélecteur des entrées sans sous-menu** : `ul > li:not([data-mega])` attrapait AUSSI les `<li>` des listes de liens DANS les panneaux (survoler un lien aurait fermé son propre panneau) → `:scope > ul > li:not([data-mega])`.
- Labels des villes de la carte Coordonnées rendus inline (span non-block) → `block` ajouté.
- Zones d'images blanches sur les captures pleine page (Ø Studio, vignettes blog) : artefact lazy-load connu, images vérifiées rendues (element screenshot + naturalWidth).

## Vérification / état des tests

- Gate après chaque lot : lint 0 erreur (7→5 warnings, liens sociaux « # » partis), 122/122 tests unitaires, e2e 7/7.
- Méga : script Playwright scratchpad 17/17 (unicité du panneau, 0 fermeture entre les 3 onglets par MutationObserver, aria-expanded ×3, fermetures attendues, collant, clavier complet, Escape).
- Accueil/Contact : FR + EN 200 sur le dev server (avant le wedge), captures conformes aux maquettes.
- Lot services : builds isolés prod + STATIC_ONLY verts ; capture de la page construite conforme (hero sombre, bento, marquee, outils, cta bleu).
- Previews : 24/24 après le lot accueil (home-solutions inclus). **PAS régénérés après le lot services** (le script lit le dev server, dont le data-store services est stale) → 27 attendus au prochain run.
- NON testé : éditeur visuel CloudCannon (tous les nouveaux champs/structures de la session), marquee en interaction réelle (pause hover vérifiée visuellement seulement), rendu mobile des nouvelles pages.

## Questions ouvertes

- Neutres froids verbatim (méga, accueil, bordures #C4C5D9/#C3C6D7) vs tokens chauds : généraliser au chrome ou ré-ancrer ? Consigné §2.e, à trancher par l'équipe design.
- Doublon « Services Gérés » du bento accueil : voulu par le design ou artefact de maquette ?
- Liens du bento accueil et de la page expertise vers des pages mortes assumées (/expertises, /produits) : périmètre des pages à créer inchangé.
- Le user parle d'un « proper tailwind export » à venir : la passe pixel-perfect finale se fera sur cet export.

## Risques / dépendances / bloqueurs

- **Dev server à redémarrer avant toute vérif locale du lot services et avant `design:previews`** (data-store stale).
- Vérifs humaines CloudCannon accumulées (accueil : variants bento, solutions phares ; services : bento/marquee/outils ; navigation : rien de neuf cette passe).
- Signalements design §2.e toujours à envoyer (s'accumulent depuis le lot chrome).

## Dette / différé

- Portage du formulaire Contact vers POST /api/forms (PUBLIC_FORMS_ENABLED) : inchangé, docs/formulaires.md §10.
- Previews 27 à régénérer (post-redémarrage).
- Autres pages services à composer sur les nouvelles sections (travail de contenu) ; Carrières/Solutions ; preflight Tailwind en fin de re-skin ; scroll-shrink header ; 5e colonne footer.
- EN de services/demo-sections.json non enrichi des 3 nouveaux types (FR seul porte la couverture previews).

## Prochaines étapes

1. User : redémarrer le dev server ; vérifier /fr/, /fr/contact/, /fr/services/productivite/ ; `npm run design:previews` (27) ; commit+push (suggestion : un commit méga, un accueil, un contact, un expertise-mère + previews).
2. Vérifs CloudCannon (éditeur visuel accueil + services, nouvelles structures).
3. Envoyer les signalements design (§2.e + antérieurs).
4. Lot suivant au choix : composer les autres pages expertises mères (contenu seulement), ou nouvelle maquette (page service enfant, Carrières).

## Constats durables

- **Un panneau partagé entre plusieurs déclencheurs doit vivre dans le DERNIER déclencheur du DOM** : l'ordre de tabulation est l'ordre du document ; un panneau rendu après la liste des onglets est inatteignable au clavier dès que les onglets suivants le ferment. L'état par clé sur le panneau (`data-open` + `data-[open]:*`) rend le survol d'un co-déclencheur no-op, donc zéro re-fondu.
- **`:scope > ul > li` obligatoire** quand un panneau contenant ses propres `ul > li` vit dans le même sous-arbre que la nav qu'on cible.
- **Astro 5 / Windows : réécrire en masse les JSON d'une collection pendant que le dev server tourne wedge le data-store pour CETTE collection** (le composant HMR se met à jour, le contenu non ; touch inefficace). Vérifier via build isolé ; redémarrer le serveur. Corollaire : en dev, le CSS du thème est inliné dans chaque page, donc grep d'un nom d'utilitaire/keyframe dans le HTML est un faux positif de présence de contenu.
- **Le build isolé attrape les erreurs de schéma zod des contenus** (InvalidContentEntryDataError) que le dev server stale masque : c'est un gate de validation, pas seulement de parité.
- Tailwind v4 : `@theme` accepte `--animate-*` + `@keyframes` imbriqués → animation en pur utilitaire (`animate-marquee` + `hover:[animation-play-state:paused]` + `motion-reduce:animate-none`), compatible no-hybride.
- Grille bento reproductible par auto-placement CSS seul : tailles en col-span/row-span sur `auto-rows` fixes, l'ordre des items suffit (flux sparse) ; pas besoin de coordonnées.
- SVG plein avec découpe : `fill-rule="evenodd"` et des sous-chemins disjoints (cercle + ticks) font un « engrenage en creux » sans masque.
- Les assets des exports Figma déjà rapatriés (`docs/design/Export HTML/assets/`) contiennent des images de PAGES entières réutilisables (contact-0X = photos des villes, pageexpertise-0X) ; vérifier là avant de chercher ailleurs. Le poulpe Ø Studio vivait déjà dans `/wp-content/uploads/`.
- Figma copy-as-CSS : reconstruire une grille à partir des `left/right/top` absolus des cartes (positions → colonnes/rangées/gouttières) fonctionne bien ; les exports d'une même livraison peuvent différer de palette (accueil froid/Inter vs contact/expertise chauds/Hanken) — mapper par export, pas globalement.

## Statut des documents vivants

Régénération nécessaire : OUI.

- `docs/GUIDE-PROJET.md` : journal 4-5 août à compléter (méga partagé, lots Accueil/Contact/Expertise mère).
- `docs/plan-convergence-migration.md` : Phase 5 — accueil ✅ fidélité, contact ✅, PREMIER service ✅ (productivite) ; restent les autres services (contenu), Carrières/Solutions, preflight.
- `docs/design/arbitrages-design-a-trancher.md` : à jour (§2.e révisé en session).
- `docs/formulaires.md` : inchangé (le formulaire Contact reste en démo ; noter éventuellement que la page est re-skinnée).
- `docs/plan-prompts.md` : P-07 (sections services re-skinnées + 3 nouvelles) à rafraîchir au prochain passage docs.
