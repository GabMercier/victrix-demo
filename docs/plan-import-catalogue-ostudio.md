# Plan — importer le catalogue Ø Studio (fiches de solutions)

> Analyse du 2026-09-18 de https://o-studio-catalogue.victrix.ca/ (demande de
> Gabriel). Objectif : quand on clique « Découvrir » dans notre catalogue de
> solutions, arriver sur une **petite page d'information** (comme sur le site
> Ø Studio) au lieu d'atterrir directement sur le formulaire Contact ; le
> formulaire du site Ø Studio est remplacé par le nôtre, prérempli. Rien n'est
> commencé : décisions en §6.

## 1. La source — constats vérifiés

- **WordPress** (Gutenberg, thème « assembler », Jetpack, Fluent Forms,
  Akismet), français seulement.
- **API REST ouverte, sans authentification** :
  `/wp-json/wp/v2/pages?per_page=100` renvoie les 18 pages avec leur HTML
  (`content.rendered`) ; `/wp-json/wp/v2/media` liste 131 médias. Les images
  originales se téléchargent directement depuis `/wp-content/uploads/…`
  (pas besoin du proxy Jetpack `i0.wp.com`).
- **16 fiches de solutions** + l'accueil du catalogue (720 mots : arguments,
  gouvernance, « book de réalisations », FAQ) + « À propos » (162 mots :
  +30 spécialistes, +100 solutions).
- **Chaque fiche a la même structure** : un H1, un paragraphe d'introduction
  (≈ 50 mots), **quatre faits** (Client, Coût, Délais de personnalisation,
  Technologies utilisées), une phrase d'invitation, **le même formulaire**
  Fluent Forms n° 3 (Nom, Courriel, Message, consentement) et un diaporama
  Jetpack de 1 à 12 images. 75 images au total, **aucun texte alternatif**.

| Fiche source (slug WordPress) | Chez nous | Images | Client | Coût affiché | Délai |
| --- | --- | --- | --- | --- | --- |
| 144-2 (Ø Bureau) | `o-bureau` | 6 | Multi-secteur | 10 000 – 25 000 $ | 1 mois |
| portail-de-gestion-des-requetes-citoyennes | `portail-requetes-citoyennes` | 3 | Municipal | 300 000 $ | 3 – 12 mois |
| portail-de-gestion-des-requetes-pour-lombudsman | `portail-ombudsman` | 6 | Santé, municipal, public | 100 000 – 250 000 $ | 3 – 12 mois |
| portail-de-gestion-des-subventions | `portail-subventions` | 11 | Public, bancaire | 200 000 – 300 000 $ | 3 – 12 mois |
| gestion-des-idees | `gestion-idees` | 3 ⚠ | Multi-secteur | 10 000 – 25 000 $ | 1 mois |
| gestion-des-horaires-pour-les-etudiants | `horaires-etudiants` | 2 | Scolaire | 100 000 – 150 000 $ | 1 – 3 mois |
| application-legacy-vers-power-apps | `legacy-vers-power-apps` | 3 ⚠ | Multi-secteur | 100 000 – 500 000 $ | 3 – 12 mois |
| feuille-de-temps-chantier | `feuille-temps-chantier` | 5 | Construction | 50 000 – 100 000 $ | 1 – 3 mois |
| gestion-des-formations-pour-les-employes | `gestion-formations` | 6 | Industriel | 35 000 $ | 1 mois |
| gouvernance-des-outils-power-platform | **à créer** | 12 | Multi-secteur | 25 000 – 50 000 $ | 1 – 3 mois |
| registre-des-applications-organisationnelles | **à créer** | 3 | Industriel | 25 000 – 50 000 $ | 1 – 3 mois |
| automatisation-du-processus-de-gestion-contractuelle | **à créer** | 6 | Santé | 25 000 – 50 000 $ | 1 – 3 mois |
| gestion-du-processus-de-recrutement | **à créer** | 1 | Public | 50 000 – 100 000 $ | 2 – 4 mois |
| gestion-du-onboarding-dun-nouvel-employe | **à créer** | 1 | Manufacturier | 25 000 – 50 000 $ | 2 – 4 mois |
| gestion-des-comptes-de-depenses | **à créer** | 1 | Construction | 25 000 – 50 000 $ | 1 – 3 mois |
| automatisation-du-processus-de-traitement-des-factures | **à créer** | 1 | Municipal | 50 000 $ | 1 mois |

⚠ « Gestion des idées » et « Legacy vers Power Apps » affichent **les trois
mêmes images** (`1.-main-file-1.jpg`, `capex.png`, `capex2.png`) : l'une des
deux fiches a des images d'emprunt — à faire confirmer par Ø Studio.

## 2. Ce que notre site a déjà

- Collection `solutions` : **9 des 16** fiches, en cartes seulement (titre,
  description, vignette, secteur, type, ordre, vedette), FR + EN.
- Page `/fr/solutions/` = une section `solutions-catalogue` ; « Découvrir »
  mène à `/fr/contact/?sujet=Un projet&produit=<titre>` — la page Contact
  préremplit la liste « De quoi… » et le champ « Précisez votre demande ».
- Page service Ø Studio (`services/productivite/o-studio`) avec le formulaire
  **`o-studio`** (Nom, Courriel, Organisation, Votre besoin, Message…) qui porte
  déjà un champ caché **« Page d'origine » = titre + chemin de la page**.

## 3. L'export — méthode

Script rejouable `scripts/migration/export-catalogue-ostudio.mjs` (même
famille que `convert-articles.mjs`, `fetch-media.mjs`) :

1. Lit l'API REST (pages + médias), garde les 16 fiches.
2. Extrait de `content.rendered` : titre, introduction, les quatre faits
   (liste `wp-block-list`), les URL d'images du diaporama, dans l'ordre.
3. Télécharge les originaux vers `public/images/solutions/<slug>/NN.<ext>`
   (noms propres, compressés par la recette de `compress-wp-images.mjs`,
   1600 px max).
4. **Fusionne** dans `src/content/solutions/fr/<slug>.json` : les 9 fiches
   existantes gardent leurs champs soignés (secteur, type, vignette, ordre) ;
   les 7 nouvelles reçoivent secteur/type proposés (à relire) et `order` à la
   suite. Ne réécrit jamais un champ déjà modifié au CMS (rejouable sans
   danger, comme la migration des articles).
5. Écrit un rapport `docs/migration/catalogue-ostudio.md` (tableau source →
   cible, images, anomalies) et exporte les textes de l'accueil et de « À
   propos » en Markdown pour Julie (matière pour la page Ø Studio et le
   chrome du catalogue — pas d'import automatique).

## 4. La cible sur le site

**Fiches = pages par sections, comme les services** (recommandé) : la
collection `solutions` reçoit un tableau `sections` (même union que services
et pages, donc éditeur visuel CloudCannon) et une route
`src/pages/[lang]/solutions/[slug].astro` calquée sur celle des services (fil
d'Ariane Accueil → Catalogue → fiche, JSON-LD, formulaires résolus). Le script
d'export génère pour chaque fiche :

1. `product-hero` — titre, introduction, première image (maquette), bouton
   « Parler à un expert » vers l'ancre du formulaire ;
2. `bento-metrics` — carte sombre « En bref » avec les quatre faits en puces
   (Client, Coût, Délai, Technologies), carte claire avec lien vers la page
   Ø Studio ;
3. **`galerie`** — NOUVEAU petit composant (grille d'images responsive,
   légende et alt par image, browser-safe) : aucun composant actuel n'accepte
   une liste d'images libre, et le texte enrichi n'autorise pas les images ;
4. `form` avec `formId: o-studio` — le formulaire existant ; son champ caché
   « Page d'origine » donne **le nom de la solution dans le courriel sans rien
   ajouter**. En mode inbox, l'objet devient `[o-studio] Prénom Nom`.

**Catalogue** : « Découvrir » pointe vers la fiche (`/fr/solutions/<slug>/`) ;
le champ `href` de la solution reste une surcharge optionnelle (vide = la
fiche). Le bouton Contact du bas de catalogue ne change pas.

**Sujets du formulaire Contact** — ajouter les 16 solutions à « De quoi
souhaitez-vous parler ? » est déconseillé : la liste sert à tout le site, elle
existe en deux langues et à trois endroits gardés par `assertSameOptions`.
Deux options légères à la place :
- (a) rien à faire : le nom de la solution voyage déjà (`?produit=` sur
  Contact, « Page d'origine » sur la fiche) ;
- (b) UNE option « Une solution du catalogue » (clé neutre `solution`) : les
  courriels sortent avec l'objet `[contact/solution] …`, donc une règle de
  boîte les route vers l'équipe Ø Studio. ≈ 1 h (presets.ts, données Contact
  FR/EN, définition du formulaire).

## 5. Points d'attention

- **Prix et délais publics** : les fiches affichent des fourchettes de coûts.
  À faire valider par Ø Studio avant publication — c'est l'objet de la tâche
  ADO #1634 (« meeting avec client O'studio pour valider contenu », Active).
- **Anglais** : la source est française seulement. Nos 9 cartes EN existent ;
  les 16 fiches EN demandent une traduction (Julie/marketing, ou brouillon
  automatique en `noindex`). Sans fichier EN, le sélecteur de langue retombe
  sur l'accueil EN (comportement des services) : rien ne casse.
- **Textes alternatifs** : 75 images sans alt → le script pose un alt
  provisoire (« Capture d'écran — <solution> ») à réviser au CMS ; plusieurs
  images sont des photos de banque (Envato) — licence à confirmer.
- **Redirections** : `o-studio-catalogue.victrix.ca` est un autre hôte ; ses
  16 URL se redirigent côté DNS/Cloudflare (ou sur le WordPress), pas dans
  notre `routing.json`. À ajouter à la matrice 301 (#1503).
- **Aperçus CloudCannon** : appliquer d'emblée la leçon du 2026-09-18
  (collections par langue, URL vérifiées avec `@cloudcannon/reader`).

## 6. Lots, estimés, décisions

| Lot | Contenu | Estimé |
| --- | --- | --- |
| 1 | **FAIT le 2026-09-23 (L10)** — Script d'export + images + rapport + textes pour Julie | 0,5 j |
| 2 | Schéma `sections`, route des fiches, config CloudCannon, lien « Découvrir », guide | 1 j |
| 3 | **FAIT le 2026-09-23 (L10)** — Composant `galerie` (+ spec Bookshop, vignette CMS) | 0,5 j |
| 4 | Génération des 16 fiches FR, relecture, gate complet | 0,5 j |
| 5 | **FAIT le 2026-09-18** — Option (b) sujet « Une solution du catalogue » | 1 h |
| — | Traduction EN des 16 fiches | contenu (Victrix) |

**État au 2026-09-23 — lots 1 et 3 livrés (lot L10).** L'export vit dans
`docs/migration/catalogue-ostudio/` (16 JSON + le cache brut de l'API + les
deux Markdown) ; le rapport est `docs/migration/catalogue-ostudio.md` ; les
70 images sont dans `public/images/solutions/<fiche>/`. Le composant
`galerie` est dans la palette de sections. **Rien n'est encore écrit dans
`src/content/solutions/`** : les fiches (sections, route, config CloudCannon,
« Découvrir » → la fiche) sont le lot **L11**, qui lit l'export et non le
réseau.

**Slugs des 7 nouvelles fiches**, arrêtés par l'export (forme courte des 9
existantes, ce sont aussi les URL publiques) : `gouvernance-power-platform`,
`registre-applications`, `gestion-contractuelle`, `gestion-recrutement`,
`onboarding-employe`, `comptes-depenses`, `traitement-factures`.

**Une anomalie de plus que celles listées au §1** : `macbook-mockup2-1.jpg`
sert à la fois à `registre-applications` et à `portail-requetes-citoyennes`
(même mécanisme que les 3 images partagées par « Gestion des idées » et
« Legacy vers Power Apps »), et l'introduction de la fiche « requêtes
citoyennes » est mot pour mot celle des « horaires étudiants ». À confirmer
avec Ø Studio avant publication.

> **DÉCISIONS PRISES le 2026-09-18 (Gabriel) — toutes les recommandations :**
> (1) fiches PAR SECTIONS ; (2) formulaire `o-studio` SUR la fiche ; (3) sujet
> « Une solution du catalogue » : **OUI — livré le jour même** (clé `solution`
> de `src/lib/contact/presets.ts`, options Contact FR/EN, plus le champ
> `contactService` par fiche qui préremplit « Service », jusque-là vide et
> obligatoire) ; (4) prix publiés, fiches en `noindex` jusqu'à #1634 ; (5) FR
> d'abord, EN = traduction de contenu ensuite ; (6) story ADO à créer. Les lots
> 1 à 4 (≈ 2,5 j) sont débloqués ; le lot 5 est fait.

Décisions : (1) fiches par sections (recommandé) ou gabarit fixe ; (2)
formulaire `o-studio` sur la fiche (recommandé) ou simple bouton vers Contact ;
(3) option (b) oui/non ; (4) prix publics — attendre #1634 ou publier en
`noindex` d'ici là ; (5) EN : traduction ou FR seulement au lancement ; (6)
créer la story ADO « Import catalogue Ø Studio » sous l'Epic 3 (#1481 est
fermée et ne couvrait que la page service).
