# Plan de livraison finale — tout ce qu'il reste, lot par lot (2026-09-18)

> **But.** Finir le site avec un budget de modèle serré : **Opus fait le
> travail** (un lot = une session neuve = un prompt ci-dessous), **Fable est
> réservé** à quatre revues de code ciblées et aux urgences (≈ 20 % restants).
> Les règles communes (commits, gate, pièges, rituel de fin) vivent dans
> `CLAUDE.md`, chargé d'office : les prompts restent courts.
>
> **Source.** Azure DevOps interrogé en direct le 18/09 (42 éléments ouverts),
> `docs/plan-2026-09-18.md` § Revue, les plans par chantier, et les constats
> de la passe du 18/09 (garde-fou des liens, incident `staging`).

## 0. Où on en est (18/09, soir)

Livré et poussé sur `dev` (`57a8243`) : palette raffinée + uniformité des
cartes · préremplissage « Service » depuis le catalogue · lien « Gérer mes
témoins » · héros d'accueil lisible · garde-fou des liens internes (75 cibles
fautives → 0) · outil de fusion JSON · **`staging` fusionné dans `dev`** (16
conflits → 0). `dev` a 25 commits d'avance sur `staging` ; `staging` n'a plus
rien que `dev` n'ait.

**Encore rouge : le site de Julie.** `staging` échoue en CI depuis le commit
`8251d7b` (méta description de la page Merci vidée). Se règle par H1 ou H2.

## 1. À faire par un humain, sans modèle (aujourd'hui)

| # | Action | Détail |
| --- | --- | --- |
| H1 | **Débloquer Julie** | CloudCannon (`staging`) → Pages système → Merci → remettre un texte dans « méta description », FR et EN → Save. Inutile si H2 se fait dans l'heure. |
| H2 | **PR `dev` → `staging`** | GitHub → New pull request, base `staging`, compare `dev`. Attendre la CI verte. Fusionner **quand Julie ne sauvegarde pas** (la prévenir). Livre d'un coup : texte enrichi, aperçus des services enfants, banque d'icônes, nouveau design, schéma tolérant. |
| H3 | **Ménage Azure DevOps** | Commandes du § 6. |
| H4 | **Trancher D1 à D8** | Tableau du § 2 — chaque décision débloque un lot. |
| H5 | **Relancer** Marjorie (#1634, rencontre Ø Studio → prix publics) et le client (#1633, livre blanc). | |

Après H2, et ensuite **chaque fois que `staging` a des sauvegardes que `dev`
n'a pas** (serveur de dev arrêté) :

```powershell
git fetch origin; git merge --no-commit --no-ff origin/staging
node scripts/merge-content-json.mjs      # « VRAIS CONFLITS » listés = à relire
node scripts/migrate-fonds-chauds.mjs    # depuis le 21/09 : blanc → ivoire, givre → beige revenus de staging
npm run build; npm run fix:links; npm run build; npm run check:links -- --strict
git add -A; git commit -m "merge: staging -> dev"; git push origin dev
```

## 2. Décisions à prendre (H4)

| # | Décision | Recommandation | Débloque |
| --- | --- | --- | --- |
| D1 | Pages mères EN `intelligence-artificielle`, `services-applicatifs`, `projets-en-ia`, `infrastructure` : slug français alors que leurs enfants sont sous `/en/services/artificial-intelligence/…` | **Traduire les 4 slugs** (Julie écrit déjà des liens vers les slugs traduits ; la règle 301 `/en/expertise/*` les suppose) | L03 |
| D2 | H1 des pages : champ caché « H1 SEO » ou grand titre visible | **Option B : retirer `seoH1`**, H1 = grand titre | L04 |
| D3 | 49 pages en `noindex` (dont Découvrir, Expertises, Services) | Lever le `noindex` sur les pages prêtes, liste validée par Julie | L05 |
| D4 | Logos de marque : qui fournit les fichiers (Microsoft, AWS, ServiceNow, Check Point, Happy At Work) et où on les affiche | Marketing fournit les SVG à jour ; bandeau défilant sur Conseil stratégique + futur gabarit Expertises | L07 |
| D5 | Page Cybersécurité : formulaire « Évaluation posture sécurité » et 1er bouton du CTA final jamais validés | Décision marketing : garder ou retirer | L08 |
| D6 | Consentement : catégories (ZoomInfo / Clarity reviennent-ils ?), durée du témoin, rechargement au retrait, registre | v1 : analytique seule, 6 mois, rechargement, sans registre serveur | L09 |
| D7 | 3 pages « document » de WordPress (2 livres blancs, 1 webinaire) citées par 3 articles, non migrées | Les recréer avec le gating de #1465 ; d'ici là, exceptions du garde-fou | L12 |
| D8 | Espace client (#1691) : page de connexion visuelle livrée ; implémentation réelle (Entra + Dataverse, `docs/portail-auth.md`) | Hors périmètre du lancement → fermer #1691 avec une story de suite | L13 |
| — | Déjà prises le 18/09 : catalogue Ø Studio (fiches par sections, formulaire `o-studio`, sujet dédié, prix en `noindex` jusqu'à #1634, FR d'abord) | | L10, L11 |
| D9 | **Police** : Inter (en place) / Montserrat (site actuel) / Nunito / Hanken (maquettes) — banc d'essai `?police=…` sur toutes les pages | Banc d'essai RETIRÉ le 2026-09-22 (lot L-polices) ; il reste à trancher la police, puis à appliquer la recette de `docs/design/polices-et-bleu.md`. Si une police Google est retenue, la rapatrier en LOCAL avant la prod (Loi 25 — pas d'appel à fonts.google.com) | design, puis retrait du banc |
| D10 | Libellé du champ : **« Expertise » (maquette) ou « Service » (site, Julie)** | Une seule source : le libellé de la définition de formulaire. Julie tranche | Contact, L06 |
| D11 | **Formulaires orphelins** : `campagne-evaluation` (plus utilisé depuis le lot « un seul formulaire »), `campagne-guide-licences` (jamais utilisé), et le sort d'`o-studio` (3ᵉ formulaire de demande) | Supprimer les deux orphelins ; garder `o-studio` tant que L10/L11 ne l'ont pas remplacé | L12, L17 |
| D12 | **Liste de prix Check Point** : les 191 SKU restent-ils **éditables au CMS** (`src/data/prix/`, remplacés par un export du marketing) ou **figés côté code** ? Et la mention de bas de page (validité des prix, PDSF) reste à rédiger — l'astérisque du titre n'est expliqué nulle part sur la page source | Éditables : c'est une donnée qui change sans développeur. Mention obligatoire avant d'indexer la page | L-prix |
| D13 | **2 articles FR sans traduction EN** (`societe-conseil-lambda-victrix`, `une-journee-dans-la-vie-secops`) — avertissement à chaque build | Assumer (le sélecteur de langue retombe sur l'index EN) ou faire traduire. Décision de contenu | — |
| D14 | **Pictogramme du bouton** : la page Contact a un bouton sans avion en papier, la section « form » en a un | Uniformiser dans un sens ou l'autre — écart assumé aujourd'hui | L06 |
| D15 | **Les 4 pages encore `noindex`** après la passe du 22/09 : Centre de confiance (135 mots — contenu trop mince pour être indexé tel quel), Tarification (attend les prix #1634), politique de confidentialité et conditions d'utilisation (`noindex` aussi sur l'ancien site) | Enrichir le Centre de confiance puis l'indexer ; garder Tarification `noindex` jusqu'à #1634 ; les deux pages légales peuvent rester `noindex` (parité) — Julie confirme | L05 (reste) |
| D16 | **Pages mères de services trop minces pour être indexées** : `infrastructure` (111 mots), `projets-en-ia` (121), `services-applicatifs` (152) sont `noindex` alors que leurs enfants sont indexés — mauvais pour le silo SEO | Les enrichir (200-300 mots) puis lever le `noindex` ; ne PAS indexer en l'état | L05 (reste), contenu |
| D17 | **Règle 404 attrape-tout dans `routing.json`** : CloudCannon recommande de router tout sous-chemin inconnu vers la page 404 | À tester sur le site dev AVANT la prod : une règle attrape-tout mal comprise détournerait tout le trafic. Non posée pour l'instant | L15 (reste) |
| D18 | **Les 4 « documents » WordPress** (réponse à Julie, 23/09) : pages de téléchargement à formulaire. Julie propose de ne remettre QUE le replay du webinaire Copilot (sept. 2025) ; le guide Licences (2024) et les 2 one-pagers (2022-2023) sont périmés | **D'accord.** Webinaire = une page « ressource à télécharger » (L12 réduit, PDF à obtenir de Julie) ; les 3 autres passent de 302 d'attente à 301 définitive (services gérés, page SOC, fiche Ø Studio ou campagne Licences) ; 6 liens d'articles à corriger ; 4 entrées `ALLOW` à retirer. Détail : `docs/migration/statut-import.md` § 5 | L12 |
| D19 | **7 articles « à supprimer et rediriger » dans le classeur de Julie** (nominations CEO/COO, Meilleures pratiques 1-2-3, Réalité étendue, Une journée SecOps — ce dernier remis par nous le 21/09) : retirer les fichiers FR + EN et poser les 301 qu'elle indique, ou garder en `draft` | Retirer + 301 (elle a tranché dans le classeur) ; Conseil Lambda reste (déjà dans `dev`) | L21 (reste) |

## 3. Budget des modèles

| Modèle | Usage | Nombre |
| --- | --- | --- |
| **Opus** | Tous les lots L00 à L26 — une session neuve par lot (`/model opus`, puis coller le prompt) | 26 prompts (L25 et L26 partagent un prompt) |
| **Fable** | **R1** après L06 (CTA : ~12 composants + schémas) · **R2** après L09 (consentement : portée légale) · **R3** après L11 (catalogue : nouvelle route, 16 pages) · **R4** après L15 + L16 (redirections, en-têtes de sécurité, brouillons en prod) | 4 revues |
| **Fable** | Urgences : build rouge sur `staging`/`main`, régression visible en production, fusion qui tourne mal — gabarit § 5 | réserve |

Règles d'économie pour Fable : une revue porte sur **une plage de commits**,
jamais sur le dépôt ; elle **ne corrige rien** (les correctifs repartent chez
Opus avec la liste des constats) ; sortie bornée à 10 constats classés.
Ne pas utiliser Fable pour : rédiger, explorer, planifier, générer du contenu.

## 4. Les lots — prompts prêts à coller (Opus)

Convention : chaque prompt suppose `CLAUDE.md` chargé. « Rituel » = le rituel
de fin de lot du `CLAUDE.md`. Estimés en jours de travail assisté.

### Phase 1 — Stabiliser (≈ 1 j)

#### L00 — Réponses à Julie + description de la PR (0,5 h) · #1762

```text
Lot L00 de docs/plan-livraison-finale.md. Aucun code.
Lis docs/plan-2026-09-18.md (§ « Les 13 nouveaux commentaires de #1762 ») et la
mémoire julie-comments-1762. Produis, en français, prêts à coller :
1. la description de la PR dev → staging (ce qui arrive pour l'éditrice, en
   langage non technique, puis la liste technique courte) ;
2. une réponse par commentaire de Julie dans #1762 : livré (où le voir), à
   venir (dans quel lot du plan), ou décision attendue d'elle (D3, D5).
Écris le tout dans docs/reponses-1762.md. Ne touche ni au code ni à ADO.
```

#### L01 — Tolérance aux champs vidés (1–1,5 h) · story à créer

```text
Lot L01 de docs/plan-livraison-finale.md.
Contexte : le 18/09 un champ vidé dans CloudCannon (`merci.metaDescription`) a
mis `staging` au rouge pendant 20 sauvegardes (mémoire
cloudcannon-null-build-break). Il reste des dizaines de `z.string().min(1)`
sur des champs ÉDITABLES dans src/content.config.ts (collections pagesSysteme,
site, contact, carrieres, navigation…).
À faire :
1. Pour chaque `.min(1)` d'un champ éditable : le garder SEULEMENT si le vide
   casse vraiment la page (titre de page, libellé de bouton, href) ; sinon
   `.default('')` + repli au rendu (vérifie le gabarit qui consomme le champ).
2. Un test vitest « champs vidés » : charge chaque fichier de src/data et de
   src/content/pages, vide tour à tour chaque chaîne non structurelle, valide
   contre le schéma — échoue en nommant le champ. La liste des champs
   structurels est explicite dans le test.
3. docs/guide-edition.md : un paragraphe « un champ vidé ne casse plus le site ».
Hors périmètre : les collections landing (contrat gelé) sauf défaut avéré.
Rituel. Story ADO à créer : « Robustesse du build face aux champs vidés » sous #1434.
```

#### L02 — Rétro-remplissage générique des clés de section (1–2 h)

```text
Lot L02 de docs/plan-livraison-finale.md.
Contexte : CloudCannon n'affiche un champ que si sa CLÉ existe dans le fichier.
scripts/backfill-section-keys.mjs (18/09) ne suit que `fond` (86 sections
réparées). D'autres champs ajoutés après coup sont sûrement invisibles dans
les sections déjà posées (headingStyle, numerotation, overlay, imagePosition,
eyebrowStyle, contactSujet/contactService au niveau page…).
1. Inventaire : pour chaque composant, clés du `blueprint` absentes d'au moins
   une section du contenu — tableau composant · clé · nb de sections · défaut
   zod lisible ou non. Montre-le-moi avant d'écrire.
2. Étends le script : toutes les clés à défaut LITTÉRAL (chaîne, booléen), y
   compris dans les tableaux d'items (structures nommées) ; jamais de valeur
   devinée. Preuve de non-régression : dist/ identique avant/après (diff des
   HTML), à faire dans une copie isolée si le serveur de dev tourne.
Rituel.
```

#### L03 — Slugs anglais traduits (1–2 h) · décision D1 · story à créer

```text
Lot L03 de docs/plan-livraison-finale.md (décision D1 prise : traduire).
Les pages EN src/content/services/en/{intelligence-artificielle,
services-applicatifs,projets-en-ia,infrastructure}.json portent un `slug`
français alors que leurs enfants sont déjà sous des slugs traduits.
1. Propose les 4 slugs (cohérents avec les enfants et avec la règle 301
   `/en/expertise/*` de src/data/redirects.json) — attends ma validation.
2. Applique : champ `slug`, puis toutes les références (src/data/navigation/
   en.json, src/data/site/en.json, src/content/home/en, pages EN, table MANUAL
   de scripts/fix-internal-links.mjs qui pointe aujourd'hui vers les slugs
   français). Conventions de préfixe : voir CLAUDE.md § Liens.
3. Vérifie fil d'Ariane, hreflang/alternate FR↔EN et le méga-menu EN.
Preuve : build + `npm run check:links -- --strict` à 0 ; e2e verts.
Rituel. Story : « Slugs EN des pages mères de service » sous #1484.
```

#### L04 — H1 : retirer « H1 SEO » (1 h) · décision D2

```text
Lot L04 de docs/plan-livraison-finale.md (décision D2 prise : option B).
Retire le champ `seoH1` : H1 = grand titre visible du héros, partout.
Touche : src/content.config.ts, component-library/src/shared/astro/page.astro
(prop h1Taken), les héros qui lisent h1Taken, cloudcannon.config.yml (input),
schemas/*.json, et les contenus qui portent la clé (la retirer proprement,
JSON reformaté à l'identique). src/lib/h1-guard.test.ts doit rester vert : une
page = un seul <h1>. Mets à jour docs/guide-edition.md (« Bien référencer »).
Rituel. Répond au commentaire de Julie sur les surtitres (#1762).
```

#### L05 — Passe `noindex` (1 h) · décision D3

```text
Lot L05 de docs/plan-livraison-finale.md.
1. Liste toutes les pages générées avec leur état d'indexation (source : champ
   `noindex` des contenus + défauts des schémas) → docs/inventaire-indexation.md,
   tableau : URL · langue · noindex · recommandation (indexer / garder caché /
   à décider) avec la raison (page démo, campagne, page système, prix…).
2. ARRÊTE-TOI là et demande-moi la liste validée.
3. Applique seulement la liste validée ; vérifie sitemap et robots dans dist/.
Rituel.
```

### Phase 2 — Demandes marketing (≈ 3 j)

#### L06 — Appels à l'action, cartes cliquables, boutons dans le texte (1–1,5 j) → revue R1

```text
Lot L06 de docs/plan-livraison-finale.md. Lis d'abord
docs/plan-icones-cta-apercus.md § 3 et § 4, et docs/plan-2026-09-18.md
(« Chantier 2 révisé »). Trois besoins de Julie (#1762) :
1. CTA de section OPTIONNEL (bouton primaire + secondaire) dans les ~12
   sections du tableau du plan — un seul patron : champs `ctaLabel/ctaHref/
   cta2Label/cta2Href`, rendu seulement si libellé ET lien, mêmes classes de
   bouton partout (reprends celles de offer-cards).
2. Lien optionnel PAR CARTE (`href`) : seules les cartes liées deviennent
   cliquables (carte entière = lien, focus visible, pas de lien imbriqué).
   Blocs : benefits, realisations, feature-boxes, numbered-cards, value-tiles.
3. 1 ou 2 boutons insérables DANS un texte enrichi (classes `btn`/`btn-outline`
   déjà prévues par component-library/src/shared/rich.ts et global.css) :
   l'offrir dans l'éditeur (styles/snippet CloudCannon) et le documenter.
Commence par me proposer le plan court (liste exacte des sections et des
champs) et attends mon accord. Chaque champ = composant + bookshop.yml + zod
+ RÉTRO-REMPLISSAGE (CLAUDE.md règle 6) : sans lui, les nouveaux champs CTA
seraient invisibles dans toutes les sections existantes.
Tests : un e2e « carte cliquable » + un « CTA absent si champ vide ».
Rituel (+ `npm run design:previews`). Story : « CTA de section + cartes
cliquables + boutons dans le texte enrichi » sous #1457.
```

#### L07 — Icônes Lucide, logos de marque, bandeau défilant (1 j) · #1797 · D4

```text
Lot L07 de docs/plan-livraison-finale.md. Lis docs/plan-icones-cta-apercus.md
§ 2 et component-library/src/shared/icons.ts (banque unique, 34 pictogrammes,
format 24 px trait 2 = format Lucide).
1. #1797 : script de conversion d'un jeu Lucide choisi (cercle/rect/ligne →
   tracés `d`) vers la banque ; propose-moi la liste des icônes à ajouter
   (≤ 40, par thème) avant d'écrire. Puis entrée icons.ts + _select_data.icones
   + `npm run cms:previews`.
2. Logos : famille « logos » (fichiers SVG dans public/images/logos/, source =
   docs/migration/urls-medias.csv pour ceux de la médiathèque actuelle).
   N'invente aucun logo : liste ce qui manque.
3. Bandeau de logos DÉFILANT (demande de Julie, page Conseil stratégique) :
   étendre logo-banner/tech-marquee — pause au survol, prefers-reduced-motion,
   contenu doublé aria-hidden. Aucun script.
Rituel. Stories : #1797 (à rattacher sous #1410) + « Logos de marque et
bandeau défilant » sous #1410.
```

#### L08 — Petits retours de Julie (0,5 j) · #1762 · D5

```text
Lot L08 de docs/plan-livraison-finale.md. Lis la mémoire julie-comments-1762
et docs/reponses-1762.md. Traite, un par un, en me montrant chaque diff :
1. Libellés du centre de Ressources (« Lot 8 »).
2. Logo FR : constat du bogue ; si le SVG manque, dis exactement quel fichier
   demander et à quelles dimensions.
3. Formulaire de bas de page d'Approvisionnement TI : crée la DÉFINITION
   (src/data/forms/<lang>/) et pose la section — champs à me proposer d'abord.
4. FAQ d'Accompagnement IA : les 8 réponses n'ont plus aucun lien — liste les
   liens de l'ancienne page (docs/migration/) pour que Julie les remette.
5. Page Cybersécurité selon D5 : retirer ou garder le formulaire « Évaluation »
   et le 1er bouton du CTA final.
Rituel. Pas de story : répondre dans #1762.
```

### Phase 3 — Conformité et contenu (≈ 5 j)

#### L09 — Consentement Loi 25, remplacement d'Axeptio (1 j) · D6 → revue R2

> **NE PAS LANCER CE PROMPT — fait autrement le 2026-09-21** : bandeau maison
> fini sans bibliothèque (`src/lib/consent/record.ts`, décision en tête de
> `docs/plan-consentement-loi25.md`). Le prompt ci-dessous ne redevient utile
> que si un deuxième traceur revient (ZoomInfo, Clarity).

```text
Lot L09 de docs/plan-livraison-finale.md. Lis EN ENTIER
docs/plan-consentement-loi25.md (dont § 5, ma revue R1–R7) et
src/components/ConsentBanner.astro (contrat : localStorage `victrix-consent`,
classe `consent-analytics`, évènement `victrix:consent`, scripts
`type="text/plain" data-consent`, lien « Gérer mes témoins » déjà livré).
Décisions D6 : [coller ici mes réponses]. Exécute les lots du plan dans
l'ordre, en gardant le contrat existant (les scripts déjà balisés ne doivent
pas changer). Exigences : refus aussi simple que l'acceptation, retrait à tout
moment, aucune requête analytique avant consentement (test e2e avec un faux ID
GA4 qui échoue si une requête part), piège de focus correct, textes éditables
(« Textes du site »), politique de confidentialité qui ne nomme plus Axeptio.
Rituel. Story : « Consentement Loi 25 — remplacement d'Axeptio » sous #1502.
```

#### L10 — Catalogue Ø Studio A : export + galerie (1 j)

```text
Lot L10 de docs/plan-livraison-finale.md. Lis docs/plan-import-catalogue-
ostudio.md (décisions prises en tête du § 6) et la mémoire
ostudio-catalogue-import (API WordPress ouverte, User-Agent navigateur
obligatoire, 16 fiches, 75 images sans alt, 2 fiches aux mêmes images).
Lots 1 et 3 du plan :
1. scripts/migration/export-catalogue-ostudio.mjs — idempotent : textes (H1,
   intro, 4 faits, phrase d'invitation), images originales vers
   public/images/solutions/<slug>/, rapport docs/migration/catalogue-ostudio.md
   (anomalies, textes `alt` à faire rédiger par Julie).
2. Composant Bookshop `galerie` (grille + visionneuse SANS script si possible ;
   sinon, dis-le avant), spec, vignette, zod.
Ne génère pas encore les fiches (L11). Rituel.
```

#### L11 — Catalogue Ø Studio B : fiches, route, « Découvrir » (1,5 j) → revue R3

```text
Lot L11 de docs/plan-livraison-finale.md (suite de L10 ; lots 2 et 4 du plan).
1. Schéma : les fiches de `solutions` deviennent des pages PAR SECTIONS
   (product-hero, bento-metrics avec les 4 faits, galerie, formulaire
   `o-studio` dont le champ caché « Page d'origine » marche déjà).
2. Route src/pages/[lang]/solutions/[slug].astro + collection CloudCannon
   (URL d'aperçu : vérifie avec @cloudcannon/reader, mémoire
   cloudcannon-reader-url-check).
3. « Découvrir » mène à la FICHE ; garder `contactService` par fiche pour le
   bouton de contact de la fiche.
4. Génère les 16 fiches FR depuis l'export ; `noindex: true` tant que #1634
   n'a pas validé les prix ; EN = fiches absentes → carte EN vers Contact.
5. Garde-fou des liens à 0, e2e : catalogue → fiche → formulaire.
Rituel. Story : « Import du catalogue Ø Studio » sous #1479.
```

#### L12 — Livres blancs à accès conditionnel (0,5–1 j) · #1465 · #1633 · D7

```text
Lot L12 de docs/plan-livraison-finale.md.
Constat : 3 liens d'articles pointent vers des pages « document » de WordPress
non migrées (constante ALLOW de scripts/check-internal-links.mjs). #1465
(gating : formulaire → téléchargement + évènement GA4) est Active ; #1633
attend le livre blanc du client.
1. Dis-moi ce qui existe déjà pour #1465 (formulaire campagne-guide-licences,
   page /merci, jetons cachés) — sans rien réécrire.
2. Propose le gabarit minimal d'une « ressource à télécharger » réutilisant ces
   briques ; attends mon accord.
3. Implémente, recrée les 3 pages si les fichiers sont fournis, retire les
   entrées correspondantes de ALLOW, évènement GA4 derrière le consentement.
Rituel.
```

#### L13 — Page des prix et Espace client : constat et clôture (1 h) · #1690 · #1691 · D8

```text
Lot L13 de docs/plan-livraison-finale.md. Aucun développement sans mon accord.
1. #1690 « Page liste des prix » (In Progress) : src/content/pages/*/tarification.json
   existe — compare à la story (az boards work-item show --id 1690), liste les écarts.
2. #1691 « Espace client » : page de connexion visuelle livrée (mémoire
   portal-next-step) ; réel = docs/portail-auth.md. Rédige la note de clôture
   et le texte d'une story de suite.
Livrable : docs/cloture-1690-1691.md + commandes az prêtes. Rituel allégé.
```

#### L14 — Parité avec le site actuel : registre + garde-fou (0,5 j) · #1765 · #1503

> **ÉLARGI le 2026-09-22, à la demande de Gabriel, et REMONTÉ avant L06.** La
> version d'origine ne produisait qu'un document. Elle absorbe désormais la
> moitié MACHINE de L21 (`check-old-urls.mjs`), parce que c'est la même
> question posée deux fois : « chaque page de l'ancien site a-t-elle un
> remplaçant, et son URL y mène-t-elle ? ». Le document seul vieillit dès la
> semaine suivante ; le script, lui, se rejoue. Le reste de L21 (hreflang,
> plan de site, balayage du jour J) RESTE en phase 4.
>
> **Ce qui est déjà prouvé** (ne pas le refaire) : aucune des 175 redirections
> ne mène à un 404 (`npm run check:redirects -- --dist`, en CI) et 0 lien
> interne cassé sur 15 431 (`check:links --strict`). **Ce qui ne l'est pas** :
> le SENS INVERSE — qu'une URL de l'ancien site soit couverte par une page ou
> une règle — les chaînes 301 → 301, et le sort des 20 slugs dérivés / 3 URL
> orphelines du rapport de parité (dernière passe le 21/09, avant L05 et L15).

```text
Lot L14 de docs/plan-livraison-finale.md. PÉRIMÈTRE tranché par Gabriel le
22/09 : l'UNION des 150 URL du plan de site en ligne (docs/migration/
urls-live.csv) et des 174 contenus de l'export WordPress (urls-contenus.csv)
— les deux jeux existent déjà, et l'union attrape les pages non indexées
encore en circulation (les 2 `/document/*` orphelins en sont). Les 943
médias sont HORS périmètre de cette passe.

Lis d'abord : docs/migration/parite-live.md, docs/migration/
correspondance-urls.json (les décisions déjà prises : manuel, abandonnees,
temporaires, ignorer, deja_dans_astro_config), docs/content-inventory.md et
scripts/build-redirects.mjs. Ne redécouvre pas ce qui y est écrit.

1. scripts/check-old-urls.mjs — garde-fou REJOUABLE. Pour chaque URL du
   périmètre, contre `dist/` et la matrice de redirections : elle finit sur
   une page qui EXISTE, en UNE SEULE redirection (signaler les chaînes
   301 → 301). Sortie : docs/migration/validation-301.md.
   PREMIÈRE PASSE = RAPPORT SEUL, code de sortie 0 même s'il reste des cas :
   Gabriel tranche d'abord les douteux, la liste d'exceptions assumées
   s'écrit ensuite, et le script passe bloquant au gate + CI dans un second
   temps (même marche que check:prefill).
2. docs/inventaire-pages.md — le REGISTRE, support de validation de Julie
   (#1765) : une ligne par URL ancienne → nouvelle URL, ou redirection, ou
   « abandonnée » AVEC SA RAISON. Colonnes : URL en ligne, destination,
   mécanisme (page / 301 / abandon), FR, EN, source du contenu. Trié pour
   qu'une éditrice s'y retrouve, pas pour qu'un script le relise.
   Signale à part : pages sans destination, pages EN manquantes, pages de
   DÉMO à retirer avant le lancement.
3. Rejoue `python scripts/migration/check-parite-live.py` (le rapport date du
   21/09, donc d'avant L05 et L15) et dis ce qui a bougé.

Aucun changement de contenu ni de rendu. Si le registre révèle des pages à
produire, tu les LISTES — tu ne les écris pas dans ce lot.
```

#### L-restaure-pages — Ce que les PAGES ont perdu à la migration : héros, liens, blocs (1,5–2 j)

> Ouvert le 2026-09-23 sur la demande de Gabriel (« on peut reformuler et
> formater avec notre gabarit, mais il ne faut rien perdre »). Le rapport
> `docs/migration/blocs-manquants-pages.md` (nouvel outil rejouable) mesure
> l'écart page par page ; `docs/migration/statut-import.md` le lit.

```text
Lot L-restaure-pages de docs/plan-livraison-finale.md. Lis d'abord
docs/migration/statut-import.md (§ 1 et § 2), puis relance
`npm run build` et `python scripts/migration/blocs-manquants-pages.py --json`
(le rapport doit être celui de TON build). Consigne : on reformule si on veut,
on ne perd RIEN. Aucun fichier de src/content n'est réécrit en masse : chaque
remise est un diff que tu me montres par page, dans cet ordre :
1. IMAGES DE HÉROS (17) : rapatrier l'image d'origine (`extract-source-page.py
   --images`, ou fetch-media.mjs) sous public/wp-content/… (convention du
   dépôt), la poser dans le champ `image` du héros avec son `alt` d'origine,
   FR et EN quand la source est la même ; puis `npm run optimize:images`.
2. LIENS PERDUS (106) : remettre chaque lien dans le texte enrichi, ou dans
   le `href` de la carte si le bloc est devenu une carte (L06 en prépare le
   champ ; en attendant, texte enrichi). Cibles = nouvelles URL (CLAUDE.md
   § Liens). Exclus : /categorie/*, /contact/, les widgets.
3. BLOCS LONGS ABSENTS (41 pages) puis AMPUTÉS (103) : remettre le texte dans
   la section qui l'accueille, mot pour mot ou reformulé SANS perte ; quand
   aucune section ne convient (avis Gartner Peer Insights des fiches Appro
   TI, témoignages d'employés, questions de la page Loi 25), propose le
   composant ou l'assume — ne l'invente pas.
4. LOGOS / CERTIFICATIONS (246) : pose ceux qui existent dans
   public/images/logos ; liste le reste pour D4 / L07. N'invente aucun logo.
5. Ce qui est ASSUMÉ (widgets, /fr/merci/, blocs abandonnés) s'écrit dans
   docs/migration/correspondance-urls.json (clé `blocs_assumes` : page cible
   → raison), et le script l'exclut du décompte.
Preuve : chiffres du rapport avant/après ; `check:links --strict` à 0 ;
`check:parite-texte --strict` vert ; e2e. Rituel.
```

#### Session de nuit du 2026-09-24 — 4 lots enchaînés (prompt unique)

> Réponses de Gabriel (24/09) : D18 = suivre Julie, mais garder le travail
> d'hébergement déjà fait (page de campagne Licences + définition de
> formulaire) ; D19 = `draft`, avec un filtre pour les retrouver ; héros =
> photo d'origine partout, et on GARDE toutes les photos de l'ancien site pour
> les réutiliser ; articles = créer ce qu'il faut (composants, HTML, snippets)
> pour reproduire le style, tableaux compris.

```text
SESSION DE NUIT — quatre lots à la suite, dans cet ordre, un gate complet entre
chaque (CLAUDE.md § Gate, chiffres réels). Aucun commit, aucun push, aucun
merge : je commite le matin. Commence par `git fetch` et
`git log --oneline HEAD..origin/dev` : s'il y a des commits, ne fusionne pas,
note-le et continue sur l'état local. Si un lot bloque (décision, fichier
absent, gate rouge non résolu en 30 min), saute-le, écris pourquoi dans
docs/migration/nuit-2026-09-24.md et passe au suivant. Termine par ce fichier
de compte rendu (par lot : fait, chiffres du gate, écarts, questions), la
mémoire project-status, les lignes § 7 du plan, et les commandes git prêtes
à coller (une seule série pour toute la nuit).

LOT 1 — Revue R3, constats 3 à 8 (≈ 2 h). Ligne « R3-1/R3-2 » du § 7 du
plan : libellés de la visionneuse, role="dialog", e2e couplés au contenu, id
de galerie, repli de langue, String.fromCharCode. Cherche les constats dans
le composant galerie et la route src/pages/[lang]/solutions/[slug].astro ;
corrige chacun avec un test quand c'est testable. Rien d'autre.

LOT 2 — L16, statique vs aperçu d'édition (≈ 0,5 j). Prompt L16 du plan,
tel quel. Il passe AVANT le lot 3 parce que les 301 des articles retirés ne
doivent s'émettre que dans un build sans aperçu d'édition (les éditrices
doivent encore voir les brouillons).

LOT 3 — Décisions D18, D19 et héros (≈ 2 h).
D18 (documents) : les PDF n'ont jamais été récupérés (ils étaient derrière un
formulaire Gravity). Garde la page de campagne
src/content/landing/fr/licences-power-platform.md et sa définition de
formulaire : c'est le gabarit d'hébergement d'un document à formulaire, il
servira au webinaire Copilot quand Julie fournira le PDF. Passe les 3 autres
adresses /document/* de `temporaires` à des 301 définitives dans
docs/migration/correspondance-urls.json : pourquoi-gerez-vous-encore-vos-ti →
/fr/services/services-ti-geres/, cybersecurite → la page SEvOC,
webinaire-copilot-buzz-impact → /fr/ressources/copilot-vs-chatgpt/ (en
attendant le PDF). Corrige les 6 liens d'articles qui pointent vers
/document/* (grep dans src/content/blog) : guide Licences → la campagne ;
CTA de tendances-ti → services gérés ; bannière du webinaire dans
copilot-vs-chatgpt → retire le lien, garde une phrase « replay bientôt
disponible » ; les 2 liens de une-journee-secops tombent avec l'article
(D19). Retire les 4 entrées ALLOW de scripts/check-internal-links.mjs ;
`check:links --strict` et `check:redirects --dist` à 0.
D19 (7 articles) : draft: true, FR ET EN, sur annonce-nomination-ceo,
nomination-dominic-lajoie, partie-1/2/3-meilleures-pratiques…,
realite-etendue-xr-partenariat-agc, une-journee-dans-la-vie-secops. 301
depuis leurs URL vers les cibles du classeur de Julie (nominations →
/fr/decouvrir/, parties 1-2-3 et secops → page SEvOC, réalité étendue →
/fr/services/intelligence-artificielle/ ; équivalents EN), émises seulement
hors aperçu d'édition (lot 2). Filtre : dans cloudcannon.config.yml, rends le
statut brouillon visible dans la liste des articles (métadonnée de carte,
tri par statut si le schéma le permet) — vérifie avec @cloudcannon/reader
(mémoire cloudcannon-reader-url-check). Le sélecteur de langue et les
articles liés ne doivent plus proposer un brouillon en production (test).
HÉROS : remets la photo d'origine sur les 13 pages restantes du rapport
blocs-manquants-pages.md (accueil FR/EN, Carrières FR/EN, Découvrir FR/EN,
Ø Studio FR/EN, centre de ressources, Azure, AWS, campagne Licences, démo
Ø Bureau EN) — pour l'accueil, vérifie la lisibilité du héros (lot
L-seo-accueil : texte sur photo) et signale si la photo d'origine la casse.
Ne supprime aucune photo actuelle. Rapatrie TOUTES les photos de l'ancien
site (`extract-source-page.py --images` sur chaque adresse de
docs/migration/cache-source/_index.json), garde-les sous public/wp-content/
pour qu'elles soient dans la médiathèque de CloudCannon, passe
`npm run optimize:images`, et donne le poids ajouté à dist/ ; si c'est plus
de 15 Mo, dis-le sans rien retirer.

LOT 4 — Forme des articles, le vrai blocage de Julie (≈ 1 j).
Mesuré : 49 bannières CTA en HTML brut (class="article-cta") dans 25
articles, 6 encadrés « Le saviez-vous », les FAQ d'article en gras (remises
par restaure-blocs-articles.py), 24 <table> dans 14 articles sans style.
1. Propose 4 patrons rendus par src/styles/global.css sous .prose (jetons
   de theme.css, contraste AA, border-solid, m-0) : bouton d'appel à
   l'action (reprend les classes btn / btn-outline de rich.ts), encadré
   « Le saviez-vous » (aside), FAQ dépliante (details/summary, sans script),
   tableau lisible (en-tête, zébrage, défilement horizontal sur mobile).
   Écris-les d'abord dans docs/plan-forme-articles.md avec un exemple HTML
   de chacun, puis exécute — je relirai le matin.
2. Snippets CloudCannon (_snippets dans cloudcannon.config.yml, avec
   `npm run check:bookshop` toujours vert) pour que Julie INSÈRE ces 4
   patrons dans l'éditeur de texte enrichi ; aperçu vérifié dans un build.
3. Outil rejouable scripts/migration/restaure-forme-articles.py (essai =
   diffs, --apply, --only) qui convertit l'existant : chaque
   <a class="article-cta"> vers le patron bouton, les encadrés, les
   questions en gras des FAQ vers details/summary, les <table> vers le
   patron tableau. AUCUN texte modifié, seulement la forme ; rapport
   article par article.
4. Un article de démonstration qui use des 4 patrons dans
   tests/e2e (axe-core : 0 violation) + docs/guide-edition.md
   (« mettre en forme un article »). Rituel.
```

### Phase 4 — Mise en ligne (≈ 5–6 j)

#### L15 — `routing.json` : redirections et en-têtes de sécurité (0,5–1 j) · #1503 · #1504

```text
Lot L15 de docs/plan-livraison-finale.md. Lis docs/DEPLOYMENT.md § 6–7 et la
mémoire deploy-checklist : l'hébergement CloudCannon IGNORE `_redirects` et
`_headers` ; il lit `.cloudcannon/routing.json` (tableaux `routes` et
`headers`). Aujourd'hui cloudvent ne renvoie AUCUN en-tête de sécurité.
1. Génère routing.json AU BUILD depuis src/data/redirects.json (splats
   compris) et public/_headers — une seule source, un test qui compare.
2. CSP : pars de celle de _headers ; vérifie Turnstile, GA4, Pagefind, polices
   locales, l'éditeur CloudCannon.
3. Le garde-fou des liens doit traiter ces règles comme il traite _redirects.
Preuve à fournir après déploiement sur le site dev : sortie de `curl -I` et
note securityheaders.com visée ≥ B. Rituel. Revue R4 après L16.
```

#### L16 — Séparer « build statique » et « aperçu d'édition » (0,5 j) → revue R4

```text
Lot L16 de docs/plan-livraison-finale.md. Lis docs/DEPLOYMENT.md § 6 :
`STATIC_ONLY=1` sert à la fois de « build 100 % statique » et de « politique
d'aperçu » (brouillons et articles à date future visibles — src/i18n/blog.ts ;
fenêtres du bandeau d'annonce ignorées — src/lib/announce.ts ; Bookshop
attaché). Le site de PRODUCTION CloudCannon build en STATIC_ONLY=1 → il
publierait les brouillons.
Introduis `EDITOR_PREVIEW=1` (sites d'édition seulement), garde STATIC_ONLY
pour l'adaptateur. Tests unitaires des deux combinaisons ; tableau des
variables par site dans docs/operations.md. Rituel.
```

#### L17 — Formulaires et mesure d'audience (0,5 j, surtout du réglage) · #1430 · #1491 · #1492 · #1493

```text
Lot L17 de docs/plan-livraison-finale.md. Lis
docs/plan-formulaires-inbox-captcha-analytics.md (lots 2 à 4) et la mémoire
cloudcannon-forms-inbox. Presque tout est du RÉGLAGE de comptes : guide-moi
pas à pas, et vérifie après chaque étape (curl / lecture du HTML construit).
1. Turnstile : widget, fournisseur sur la boîte CloudCannon, clé de site.
2. #1430 : confirmation visuelle (faite ?) et courriel automatique au
   visiteur en mode inbox — dis ce que CloudCannon permet, sinon l'option.
3. GA4 (#1491), recherche interne (#1492 ; #1462 est son doublon), évènements
   de conversion derrière le consentement. 4. GSC + Bing (#1493).
Livrable : docs/operations.md à jour + liste des clés par site. Rituel.
```

#### L18 — QA responsive et multi-navigateurs (0,5–1 j) · #1435 · #1436

```text
Lot L18 de docs/plan-livraison-finale.md.
Étends Playwright : projets chromium + firefox + webkit, 5 largeurs (390, 768,
1024, 1440, 1920). Test générique sur TOUTES les pages de dist : pas de
défilement horizontal, gouttière ≥ 16 px, aucun texte coupé dans les héros,
aucune erreur console. #1436 : formulaires + recherche sont déjà couverts
(tests/e2e) — complète ce qui manque. Rapporte les défauts trouvés en liste ;
ne corrige que les défauts de moins de 15 minutes, propose le reste.
```

#### L19 — Accessibilité WCAG 2.1 AA (1 j) · #1498 · #1499

```text
Lot L19 de docs/plan-livraison-finale.md.
1. @axe-core/playwright sur toutes les pages (fr + en) : zéro violation
   sérieuse ou critique ; corrige. 4 avertissements eslint a11y connus
   (liens `href` vides, label du formulaire Contact) : règle-les.
2. Grille de tests MANUELS pour moi (clavier, lecteur d'écran NVDA, zoom
   200 %, contrastes de la nouvelle palette #fcf9f5/#f6f3ef) : une page, cases
   à cocher. 3. docs/declaration-accessibilite.md (niveau visé, écarts connus).
Rituel.
```

#### L20 — Performance (0,5–1 j) · #1501

```text
Lot L20 de docs/plan-livraison-finale.md. État connu : Lighthouse perf 86, LCP
simulé 3,8 s (cible ≤ 2,5 s). Mesure d'abord (accueil, une page de service, un
article, fr), identifie l'élément LCP de chacune, puis corrige dans l'ordre du
gain : image du héros (dimensions, format, preload, fetchpriority), police
(sous-ensemble déjà fait), CSS bloquant. Donne avant/après chiffrés. Rituel.
```

#### L21 — Zéro 404 : redirections 301, hreflang, sitemap (0,5 j) · #1503

```text
Lot L21 de docs/plan-livraison-finale.md.
Script scripts/check-old-urls.mjs : chaque URL de l'ancien site
(docs/migration/*.csv) doit, contre dist/ + les règles de redirection, finir
sur une page qui existe (une seule redirection, pas de chaîne). Vérifie aussi :
chaque page a son alternate hreflang réciproque, le sitemap ne liste aucune
page noindex ni démo. Rapport docs/migration/validation-301.md + ajout en CI.
Les sous-domaines (o-studio-catalogue) passent par DNS/Cloudflare : liste-les.
```

#### L22 — Documentation et formation (0,5 j) · #1439 · #1440

```text
Lot L22 de docs/plan-livraison-finale.md.
1. Relis docs/guide-edition.md d'un œil d'éditrice : date de version, sections
   périmées, captures à faire (liste précise). 2. Support de formation de 60
   minutes pour Julie et Walter : déroulé, 6 exercices sur le site `staging`,
   aide-mémoire d'une page (« j'ai cassé quelque chose : que faire »).
Livrables : docs/formation-editeurs.md. Aucun code.
```

#### L23 — Jour J (accompagnement) · F4.5

```text
Lot L23 de docs/plan-livraison-finale.md. Lis docs/DEPLOYMENT.md § 7 et
docs/operations.md § 5–6. Transforme la checklist en déroulé minuté avec, pour
chaque étape : la commande ou l'écran, la vérification, le retour arrière.
Couvre : `site:` et robots.txt vers le vrai domaine, domaine sur le site de
production CloudCannon, DNS + 301 des sous-domaines, REBUILD_HOOK_URL, boîtes
de formulaires de production, cartes de partage (LinkedIn, X, Facebook),
export final de WordPress (entrées Gravity Forms), décommission de Cloudflare
Pages et du worker Sveltia. N'exécute rien : tu me guides.
```

### Options (après le lancement, ou en lot tampon)

#### L24 — Héros animés v1 (1 j)

```text
Lot L24 de docs/plan-livraison-finale.md. Lis docs/plan-hero-anime.md : exécute
la v1 (CSS scroll-driven, « flottantes + parallaxe », accueil), décisions du
§ 6 à me poser d'abord. prefers-reduced-motion, aucun script, tests du § 5.
```

#### L25 — Édition visuelle des routes fixes · L26 — Médiathèque

```text
Lot L25/L26 de docs/plan-livraison-finale.md. Lis docs/plan-pivot-editeur.md
(phases restantes) ou docs/plan-mediatheque.md (décisions D1–D6 du § 2).
Ne code rien : résume en 15 lignes ce qui reste, ce qui est déjà couvert
depuis, l'estimé révisé, et les décisions à me poser.
```

## 5. Prompts Fable (à n'utiliser que là)

### Revue de code R1–R4

```text
Revue de code bornée — lot [L06 | L09 | L11 | L15+L16].
Plage : `git diff <commit-avant>..<commit-après>` — lis CE diff, rien d'autre,
sauf le fichier appelant quand un constat l'exige. Ne corrige rien.
Cherche dans cet ordre : (1) ce qui casse le build ou une page quand
l'éditrice vide/renomme un champ ; (2) écarts composant ↔ bookshop.yml ↔ zod ↔
cloudcannon.config.yml ; (3) régressions d'accessibilité et de liens ;
(4) [R2] toute requête réseau avant consentement ; [R4] règle de redirection
ou CSP trop large, brouillon publiable en production.
Sortie : 10 constats au plus, du plus grave au moins grave — fichier:ligne,
scénario concret d'échec, correctif en une phrase. Termine par « prêt à
fusionner : oui/non ».
```

### Urgence

```text
URGENCE — [symptôme en une ligne ; branche ; depuis quand].
Diagnostique d'abord, sans rien modifier : état de la CI de la branche
(curl de l'API GitHub, voir CLAUDE.md), dernier commit vert, diff entre les
deux. Donne la cause en 3 lignes et le correctif le plus petit possible — si
c'est du contenu, l'action exacte dans CloudCannon ; si c'est du code, le diff.
Attends mon accord avant d'écrire.
```

## 6. Azure DevOps

**Correspondance des 42 éléments ouverts.**

| Élément | Traitement |
| --- | --- |
| Epics #1405 #1418 #1431 #1433 · features #1406 #1434 #1437 #1463 #1479 #1490 #1497 #1500 #1502 | Conteneurs — se ferment quand leurs enfants le sont |
| #1444 F0.2 · #1461 F2.4 · #1462 (doublon de #1492) | **Fermer maintenant** |
| #1410 F1.2 · #1457 F2.3 · #1484 F3.2 · #1495 F3.4 | **Garder ouverts** : ils reçoivent les nouvelles stories (révise la liste « fermables » du 16/09) |
| #1762 | L00, L04, L06, L08 — fermer après les réponses |
| #1797 | L07 (à rattacher sous #1410 : son parent #1423 est fermé) |
| #1430 #1491 #1492 #1493 | L17 |
| #1465 #1633 | L12 (bloqué par le client) |
| #1690 #1691 | L13 |
| #1765 | L14 |
| #1503 #1504 | L15, L21 |
| #1435 #1436 | L18 |
| #1498 #1499 | L19 |
| #1501 | L20 |
| #1439 #1440 | L22 |
| #1634 | Marjorie — relance H5 ; débloque les prix publics du catalogue |
| #1452 | Clément — QA des pages sur le site dev après chaque lot visuel |

**Commandes (H3).**

```powershell
foreach ($id in 1444,1461,1462) { az boards work-item update --id $id --state Closed --output none }
az boards work-item relation remove --id 1797 --relation-type parent --target-id 1423 --yes
az boards work-item relation add    --id 1797 --relation-type parent --target-id 1410

$stories = @(
  @{ t = "Garde-fou des liens internes (CI + postbuild) - LIVRE le 18/09"; p = 1502 },
  @{ t = "Robustesse du build face aux champs vides";                       p = 1434 },
  @{ t = "Slugs EN des pages meres de service";                             p = 1484 },
  @{ t = "CTA de section + cartes cliquables + boutons dans le texte enrichi"; p = 1457 },
  @{ t = "Logos de marque et bandeau defilant";                             p = 1410 },
  @{ t = "Consentement Loi 25 - remplacement d'Axeptio";                    p = 1502 },
  @{ t = "Import du catalogue O Studio - 16 fiches de solutions";           p = 1479 },
  @{ t = "routing.json + separation build statique / apercu d'edition";     p = 1437 }
)
foreach ($s in $stories) {
  $id = az boards work-item create --type "User Story" --title $s.t --query id --output tsv
  az boards work-item relation add --id $id --relation-type parent --target-id $s.p --output none
  "cree #$id -> parent #$($s.p) : $($s.t)"
}
```

## 7. Suivi

| Lot | Titre | Estimé | Dépend de | Revue | Fait le |
| --- | --- | --- | --- | --- | --- |
| H1–H5 | Actions humaines | — | — | | H2 fait le 21/09 (PR #1 fusionnée, `staging` = `64e58e4`) |
| L-fonds | Fonds chauds : canevas ivoire, bandes ivoire/beige, blanc réservé aux cartes (maquette « page produit - enfant ») | 0,5 j | — | | 2026-09-21 |
| L-fond2 | « Fond de section » sur les 17 sections qui ne l’avaient pas (accueil comprise) + 138 clés rétro-remplies | 2 h | — | | 2026-09-21 |
| L-pages | Pages de l’ancien site jamais reprises : 18 pages fournisseurs (Approvisionnement TI, FR+EN), campagne « Accompagnement en IA » (FR+EN), campagne « Démo O bureau » (FR+EN), 2 articles FR sans traduction ; lien du titre sur `tech-columns` | 1 j | — | **R3 élargie** | 2026-09-21 |
| L-bleu | Fond « bleu électrique » (5 sections qui inversent leurs textes), en-tête du centre de ressources retiré + palette chaude sur la page, CTA visible sur les tuiles « image » de « Nos services » | 0,5 j | — | | 2026-09-21 |
| L-contact | UN SEUL formulaire de demande : le formulaire « évaluation de sécurité » de la page Cybersécurité devient une section de qualification (tranche d'effectif) qui renvoie vers le Contact prérempli ; option de service « Ressources humaines » + repli « Autre » (« Service », obligatoire, n'arrive plus vide) ; champ « Taille de l'entreprise » conditionnel dans le Contact | 0,5 j | — | | 2026-09-21 |
| L-a11y | Accessibilité mesurée : `@axe-core/playwright` sur 9 gabarits dans le gate (WCAG 2.0/2.1 AA) + 4 familles de contrastes corrigées (pastilles 10px, compteurs 01–05, blanc 80 % sur l'aplat bleu, pastilles partenaires). **Avance L19** ; reste hors lot : conversion de l'échelle typographique en `rem`, ordre de tabulation, QA responsive | 0,5 j | — | | 2026-09-21 |
| L-typo | Typographie : plancher 14px (plus de 10/12px) et échelle en `rem` — le réglage « taille de police » du navigateur agit enfin (`scripts/migrate-typo-rem.mjs`, 219 occurrences / 40 fichiers + 9 jetons de theme.css) ; champs de saisie en `min-h` ; garde-fou `tests/e2e/typographie.spec.ts`. **Achève L19** côté typo | 0,5 j | — | | 2026-09-21 |
| L-banc | **BANC D'ESSAI TEMPORAIRE** — `?police=inter\|montserrat\|nunito\|hanken` et `?bleu=export2\|figma` sur toutes les pages, pour trancher deux écarts maquettes/site : le bleu (`#002fc7` du Design System et de TOUTES les maquettes vs `#1a5bff` du site, remappé en août « à confirmer avec le designer », jamais confirmé) et la police (Hanken des maquettes, Montserrat du site actuel, Inter en place). Inerte sans paramètre. **RETIRÉ le 2026-09-22** (lot L-polices) — la recette d'application survit dans `docs/design/polices-et-bleu.md` | 2 h | **décision designer + client** | | 2026-09-21 |
| L-polices | **Banc d'essai RETIRÉ** : `src/styles/banc-essai.css`, son import et son script en ligne de `BaseLayout`, `tests/e2e/banc-essai.spec.ts` et `docs/design/banc-essai.md` — **3 268 octets de script en moins sur chacune des 186 pages** (1 293 o compressés ; 594 Ko à l'échelle du site), plus 5,3 Ko de CSS hors du paquet. La MÉTHODE survit dans `docs/design/polices-et-bleu.md` (3 piles `--font-sans` prêtes à coller, `@font-face` + `preload` à changer ensemble, rapatriement local obligatoire pour la Loi 25, 2 specs à rejouer) + l'historique de l'écart de bleu. **D9 reste à trancher** : la police. 0 trace dans `dist/` (`data-police`, `data-bleu`, `.banc-essai-etiquette`, `victrix-banc-essai`, `fonts.googleapis.com`) | 1 h | D9 (partiel) | | 2026-09-22 |
| L-bleu2 | **BLEU DE MARQUE TRANCHÉ** : `--color-primary` passe au `#002fc7` du Design System Figma (famille complète + couche héritée `tokens.css`). L'ancien `#1a5bff` est CONSERVÉ — primitive `bleu-500` et fond « Bleu électrique » ; nouveau fond « Bleu Victrix ». Révélé et corrigé au passage : `global.css` force `color: navy` sur les h1-h4, qui bat la couleur héritée d'un parent (titre 1,9:1 sur aplat bleu dans `photo-features`) | 2 h | — | | 2026-09-21 |
| L-contact2 | **Page Contact redessinée** d'après `contact maquette redesign.txt` : surtitre rétabli (champ CMS `heroEyebrow`), H1 au `#00105B` exact de la maquette, bande beige / cartes blanches (inversé), grille des numéros par bureau rétablie, champs à bordure `contour` rayon 4, bouton en largeur auto sans pictogramme, libellé du bouton réaligné (« Soumettre » → « Envoyer le message », il contredisait la définition) | 3 h | L-bleu2 | | 2026-09-21 |
| L-fonds3 | Fonds bleus ouverts à 5 sections d'accroche de plus (10 au total) : `home-experts` (rien à inverser, son texte vit dans un panneau), `benefits`, `feature-boxes` (cartes blanches → seuls titre/chapeau), `value-tiles` et `text-photo` (tout sur le fond : titres, icônes, bordures). Inversion vers le BLANC — `primary-fixed-dim` ne donne que 3,1:1 sur le bleu électrique. Vérifié par un essai axe sur les deux aplats, contenu d'essai restauré | 2 h | L-bleu2 | | 2026-09-21 |
| L-prix | **À FAIRE** — Liste de prix Check Point (`/liste-prix-check-point/`, `/en/check-point-price-list/`) : c’est un OUTIL (tableaux de prix + « ajouter à ma commande » + formulaire), pas une page de contenu → décision : le reprendre, le remplacer par un PDF + formulaire, ou le retirer | ? | décision marketing | | |
| L-prefill | **Chaque CTA arrive sur un formulaire prérempli.** Bogue confirmé (Gabriel, 21/09, page Secteurs) : la route des pages générales pose `sujet: page.data.contactSujet` SANS repli, contrairement à celle des services (`|| 'projet'`) → 9 pages générales sur 11 n'ont pas de `contactSujet`, soit 18 liens vers /contact qui arrivent vides. (1) repli de sujet dans `src/pages/[lang]/[...slug].astro` ; (2) GARDE-FOU rejouable : parcourir tous les liens `/contact` du site CONSTRUIT et vérifier que chacun porte `sujet=` et `expertise=` (même esprit que `check-internal-links.mjs`), exceptions documentées pour en-tête/nav/pied de page, volontairement exclus ; (3) le formulaire SURLIGNE les champs obligatoires encore VIDES à l'arrivée — 4 quand on vient d'un CTA, les 6 quand on arrive par le menu, le pied de page ou une URL tapée (le script ignore volontairement les liens de chrome, donc les deux listes sont alors vides et le comportement dynamique est le bon) | 0,5 j | — | **R1** | 2026-09-22 |
| L-bleu3 | **CODES OFFICIELS DE LA MARQUE** (Gabriel : « il y avait une erreur dans la maquette ») — BLEU NUIT `#000D2E`, BLEU ÉLECTRIQUE `#1D46F3`. Clôt une valse de TROIS valeurs : `#1a5bff` (bascule export2 d'août) et `#002fc7` (lu sur les maquettes le 21/09, lot L-bleu2) étaient tous deux faux ; `#1D46F3` était déjà dans le dépôt mais comme couleur de SURVOL. `--color-primary`, `--color-accent-blue`, `--color-bleu-500`, `--color-royal` et `--color-surface-tint` passent à `#1D46F3` ; nouveau survol `#1738c2` (assombrissement 0,8, 8,82:1). `--color-navy` s'aligne sur `#000D2E` (+ navy-700 `#001855`, navy-900 `#000718`, `--color-nuit`, `--color-grey-dark`), donc `--color-logo-nuit` — créé la veille — est SUPPRIMÉ : un seul bleu nuit. `theme-color` corrigé (`#0d1430`, une TROISIÈME valeur orpheline). **Les deux fonds bleus FUSIONNENT** : `bleu-profond` disparaît de `fonds.ts` et du `_select_data`, sans risque — 0 section du contenu en portait (mesuré). Contrastes : 6,52:1 sur blanc (AA ; mieux que les 5,27:1 de l'ancien fond, moins bien que les 9,41:1 de #002fc7). **INTERDIT : bleu électrique en texte sur bleu nuit = 2,94:1.** | 3 h | — | | 2026-09-22 |
| L00 | Réponses #1762 + PR | 0,5 h | H2 | | |
| L01 | Tolérance aux champs vidés — 39 champs passés de `.min(1)` à `.default('')` + 18 replis au rendu ; test `content.config.champs-vides` (vide CHAQUE chaîne de src/data et src/content/pages, 94 champs structurels listés avec leur raison, détecte aussi les entrées périmées). La question laissée ouverte (listes fermées) est **tranchée par L-selects**, ci-dessous | 1,5 h | — | | 2026-09-22 |
| L-selects | **Un select effacé au CMS ne casse plus le build.** Troisième porte de l'incident du 18/09, mesurée : sans correctif, **220 occurrences** de listes fermées refusent la chaîne vide, et **13 sélecteurs sont effaçables** dans l'éditeur (8 de section — `callout.layout`, `cta.variant`, `form.variant`, les 4 de `numbered-cards`, `timeline.tone` — plus `mode`, `footerMode`, `icon` du méga-menu, `type` et `width` des formulaires) ; les 38 autres ne tiennent que par `allow_empty: false`, une garde d'interface du même genre qu'`empty_type: string`, qui n'avait pas suffi. **L'arbitrage** : pas de `.catch('<défaut>')` — il aurait AUSSI avalé une clé mal orthographiée. Normalisation guidée par le schéma, en un seul endroit comme `nullsToEmpty` : le champ vide est EFFACÉ avant validation, donc zod applique `.default(…)` — le sien, écrit à côté de lui — tandis qu'une valeur inconnue reste refusée. Aucune liste à tenir à jour : elle est lue dans le schéma. Test `content.config.listes-fermees` (298 occurrences sans vide, 136 où le vide est une valeur : le défaut appliqué est bien celui du champ, `fond: "beig"` échoue toujours, `''` de « aucune icône » n'est pas écrasé) | 2 h | — | | 2026-09-22 |
| L02 | Rétro-remplissage générique des clés | 2 h | — | | |
| L03 | Slugs EN — FAIT le 21/09 (D1 : `artificial-intelligence`, `application-services`, `ai-projects` ; `infrastructure` inchangé ; le méga-menu suit le champ `slug` de la page) | 2 h | D1 | | 2026-09-21 |
| L04 | H1 | 1 h | D2 | | |
| L05 | `noindex` — **FAIT le 22/09** : levé sur Découvrir, Expertises, Nos services, Secteurs, Produits (FR+EN, 10 fichiers). **Et un trou majeur trouvé et corrigé** : la page mère `pages/*/services.json` étant `noindex`, son chemin `/fr/services/` était CONTENU dans celui de chacun de ses enfants → le filtre du plan de site (`includes`) retirait les ~100 pages de services, **72 URL annoncées sur 186 pages** ; correspondance devenue exacte + parcours récursif (les campagnes cachées imbriquées ne filent plus au sitemap). Restent `noindex` en attente de Julie : Centre de confiance, Tarification (prix #1634), politique de confidentialité et conditions d'utilisation (parité : `noindex` sur l'ancien site) | 1 h | D3 | | 2026-09-22 |
| L06 | CTA, cartes cliquables, boutons | 1,5 j | — | **R1** | |
| L07 | Lucide, logos, bandeau | 1 j | D4 | | |
| L08 | Petits retours de Julie | 0,5 j | D5 | | |
| L09 | Consentement Loi 25 — FAIT AUTREMENT : bandeau maison fini, sans bibliothèque (D6 tranchée : mesure d'audience seule, 182 jours, rechargement au retrait, sans registre serveur). Reste : texte de la politique (Julie + juridique), `PUBLIC_GA4_ID` | 2 h | — | R2 facultative | 2026-09-21 |
| L10 | **Catalogue Ø Studio A — export + galerie.** (1) `scripts/migration/export-catalogue-ostudio.mjs`, rejouable et idempotent : **16 fiches, 70 images (9,8 Mo), 2 pages de texte libre** (accueil du catalogue 746 mots, « À propos » 209) rapatriées de `o-studio-catalogue.victrix.ca`. Écrit `docs/migration/catalogue-ostudio/` (un JSON par fiche + le **cache brut de l'API**, la copie qui survivra au démantèlement du sous-domaine, même raisonnement que `cache-source/`), le rapport `docs/migration/catalogue-ostudio.md` et `public/images/solutions/<fiche>/NN.ext` (allégées avec les réglages d'`optimize:images` — 1 600 px, JPEG q80, **PNG sans perte**). **Il n'écrit RIEN dans `src/content/`** : L11 génère les fiches à partir de l'export, pas du réseau — l'import reste donc rejouable sans écraser ce que l'éditrice aura retouché. **Leçon L-restaure appliquée** : toute structure inattendue (H1 absent, ≠ 4 faits, libellé de fait inconnu, page hors table) sort en code 1 ; les pages Markdown ont un garde-fou de déperdition à 2 % des mots. Pièges payés : `<strong><strong>X</strong>.</strong>` de Gutenberg casse une regex non gourmande (balayage équilibré, comme les `<ul>` de `lib-wxr`), et l'API répond 403 sans User-Agent de navigateur. **4 anomalies de contenu relevées** : 3 images partagées par `gestion-idees` et `legacy-vers-power-apps` (connu), **`macbook-mockup2-1.jpg` partagée par `registre-applications` et `portail-requetes-citoyennes`** (NOUVEAU) et l'introduction de `portail-requetes-citoyennes` qui est **celle des horaires étudiants**, copiée-collée — à trancher avec Ø Studio. (2) Composant Bookshop **`galerie`** (+ spec, vignette, zod, `_structures.galerie_items`) : grille 2/3/4 colonnes, image montrée ENTIÈRE (`object-contain` — les captures sont souvent en portrait, 828 × 1792), légende et `alt` par image. **Agrandissement SANS une ligne de script** : ancres `:target`, donc compatible avec la règle browser-safe et avec l'éditeur visuel. Vérifié au navigateur : ouverture/fermeture/suivant-précédent, premier `Tab` sur « Fermer », **axe-core 0 violation** la visionneuse ouverte. Limites assumées et écrites dans le guide : pas de fermeture par Échap, focus non piégé, la page défile derrière (~15 lignes de JS les lèveraient — décision de périmètre) | 1 j | — | | 2026-09-23 |
| L11 | **Catalogue Ø Studio B — les 16 fiches ont leur page.** La collection `solutions` accepte des `sections` : une entrée qui en porte a sa page (`/fr/solutions/<slug>/`, route `src/pages/[lang]/solutions/[slug].astro`, patron exact des services — variable LITTÉRALE `frontmatter`, seam `enrich`, garde-fou de `formId`, `altLocalePath`) ; une entrée sans sections reste une simple carte, **c’est l’état des 9 fiches EN** (traduction = travail de contenu) et rien ne casse. **« Découvrir » mène à la fiche** ; `href` devient une SURCHARGE — celui qui valait `/contact` est vidé, celui d’`o-bureau` (page de service plus riche) est gardé. Les 16 fiches FR sont générées par `scripts/migration/genere-fiches-solutions.mjs`, rejouable et **create-only** : une fiche déjà composée est SAUTÉE (`--force` pour écraser, ce qui efface les retouches du CMS). Composition : `product-hero` + `bento-metrics` (« En bref », les 4 faits en pastilles — vérifié sur le pire cas, « Dynamics 365, Power Platform, Power Pages, Copilot Studio, SharePoint » s’enroule proprement) + `galerie` + `form` (`o-studio`). **Le champ caché « Page d’origine » nomme la solution dans le courriel sans qu’un seul champ ait été ajouté** — c’est ce que verrouille le nouveau `tests/e2e/catalogue-fiche.spec.ts` (6 cas : catalogue → fiche, un seul H1 + fil d’Ariane vers le catalogue, bouton → ancre `#formulaire`, champ caché, `noindex` maintenu, cartes EN toujours vers le Contact prérempli). CloudCannon : la collection `solutions` est SCINDÉE en `solutions_fr` (éditeur visuel rouvert, `url: /fr/solutions/[full_slug]/`) et `solutions_en` (données seules, aperçu sur le catalogue tant qu’aucune fiche EN n’existe) — templates vérifiés hors ligne au `@cloudcannon/reader`, même forme que `services_fr` qui marche en production. **16 fiches en `noindex`** jusqu’à la validation des prix (#1634). 7 secteurs/types proposés à relire, « Santé » = seule valeur de filtre nouvelle | 1,5 j | L10 | **R3** | 2026-09-23 |
| L12 | Livres blancs — **4 pages** `/document/*` (pas 3 : + `/document/cybersecurite/`, livre blanc SEvOC) ; `licences-microsoft-power-platform` existe déjà en campagne | 1 j | D7, #1633 | | |
| L13 | Prix + Espace client | 1 h | D8 | | |
| L14 | **FAIT le 23/09** — Parité avec le site actuel. `scripts/check-old-urls.mjs` (+ `npm run check:old-urls`) rejoue le PARCOURS de chaque adresse entrante contre les artefacts livrés — `dist/_cloudcannon/routing.json` (375 routes) et `dist/` — et non plus seulement les règles écrites : c'est le premier garde-fou qui teste le DÉCLENCHEMENT d'une règle. **172 des 173 adresses du périmètre arrivent sur une page** (2 sans bouger, 170 en un saut, 0 chaîne, 0 cible absente) ; le seul reste est `/cache/`, un rebut WordPress sans destination. Les 10 « redirections vers une page absente » du 22/09 sont closes par `67f9337` (les règles exactes, émises sous leurs deux formes, passent désormais avant le joker `/expertise/(.*)`). **Deux nuances mesurées** : les 170 cibles sans barre finale ne coûtent AUCUN saut de plus (vérifié au `curl` sur vocal-wren : 200 direct — la décision 6 du §8 de `plan-redirections.md` est donc « ne rien changer ») ; 0 arrivée générique par joker. Livrables : `docs/migration/validation-301.md` + le registre `docs/inventaire-pages.md` dont la colonne « État mesuré » est maintenant RÉGÉNÉRÉE par le script (108 mentions de 404 → 15). `check-parite-live.py` rejoué : retrouvées 127 → **134**, slugs dérivés 20 → **13**, 3 sans équivalent (`/cache/` + les 2 `/document/*` en 302 d'attente, L12). Rapport seul, code 0 — `--strict` le rendra bloquant une fois les douteux tranchés | 0,5 j | — | | 2026-09-23 |
| L-seo-accueil | **SEO de l'accueil OUVERT AU CMS** — c'était la seule page du site sans titre ni description éditables : le schéma `home` n'avait que `seoH1` + `sections`, la route ne passait aucun `title` (donc `<title>Victrix</title>` tout court) et la description était codée en dur dans `index.astro`, hors de portée de l'éditrice. Lighthouse notait pourtant 100 — son audit `document-title` ne juge que la PRÉSENCE de la balise. Ajout de `seoTitle` + `metaDescription` (et NON `description` : les `_inputs` de `cloudcannon.config.yml` sont indexés par nom de champ et cascadent, une clé `description` à la racine aurait hérité du libellé générique des items de section), préremplis avec le titre et la méta description du site EN LIGNE (continuité SEO). `.default('')` + repli au rendu. 4 `seoTitle` vides remplis au passage (Carrières et Découvrir, FR+EN) — `/fr/decouvrir` rendait « Découvrir Victrix — Victrix » | 1 h | — | | 2026-09-23 |
| L-perf-images | **Poids des images** — `scripts/optimize-images.mjs` (+ `optimize:images` / `check:images`), rejouable et idempotent. **34 fichiers allégés, 7,3 Mo → 3,7 Mo.** Réduction et réencodage SUR PLACE (même chemin, même nom, même format) : aucune référence à réécrire, aucun risque pour la médiathèque CloudCannon. Deux pièges payés : `png({ effort })` bascule sharp en quantification 256 couleurs SANS le dire (97 % des pixels opaques modifiés sur `sevoc.png`, écart max 130/255, visible à l'œil) — l'outil ne fait donc que du PNG sans perte, et le gain PNG vient du seul redimensionnement ; et passer un CHEMIN à sharp fait mmap le fichier par libvips, si bien que réécrire le même chemin échoue en « UNKNOWN » sur les 30 JPEG (l'outil annonçait « 4 allégées » sans dire que le reste avait été refusé — d'où le décompte des échecs au bilan). **NON FAIT, chiffré** : la conversion en WebP vaudrait ~81 % au lieu de ~49 %, mais exige de réécrire ~165 références de contenu — décision de périmètre | 2 h | — | | 2026-09-23 |
| L-contenu-perdu | **Contenu perdu à la migration, restauré** (source : les pages EN LIGNE via `extract-source-page.py`). Découvrir FR+EN : « Notre mission » et « Notre écosystème » (les 72 mots sur Alan Allman Associates, introuvables ailleurs dans `src/content`) en `text-photo`, « Parole d'experts » en `related-posts` (recalculé à chaque build, 3 cartes rendues), et les **3 liens de la frise** rétablis sans champ nouveau (`items[].text` passe déjà par `inlineHtml`, liste blanche `<a>` comprise ; le `title`, lui, est rendu en texte brut). « Nos valeurs » passe de `benefits` à `value-tiles` : les 5 items n'ont aucune description, `benefits` rendait donc 5 grandes cartes vides numérotées « 01 » à « 05 », alors que `value-tiles` sert DÉJÀ aux mêmes 5 valeurs sur Carrières. Accueil FR+EN : bandeau ISO (`home-iso`) et carrousel de **12 logos partenaires** (`logo-banner` — `home-partners` ne rend que des pastilles de TEXTE) ; 4 logos rapatriés de l'ancien site (AlgoSec, Proofpoint, OVHcloud, ServiceNow simple) | 3 h | — | | 2026-09-23 |
| L-grand-ecran | **ÉCRANS TRÈS LARGES** (mesures fournies par Gabriel : portable `innerWidth 1280 / dpr 1.5`, grand écran `innerWidth 2560 / dpr 1` — donc à zoom 100 %, et non 125 % comme le rapport du 22/09 le supposait). Au-delà de 1920 px la racine grandit progressivement jusqu'à +25 %, et le cadran suit parce qu'il passe en `rem` (`--spacing-container-max: 120rem`, `--container-max`). Mesuré : à 2560 la bande passe de 1920 à **2400 px**, le corps de 16 à **20 px**, la largeur utile de 67 % à **86 %**. **Strictement sans effet à 1920 px et en dessous** — le portable de Gabriel ne bouge pas. Variante à INTERPOLATION CONTINUE et non media query : un seuil dur rend le zoom non monotone (sur un 2560, zoomer à 150 % repasse sous le seuil et RÉTRÉCIT le texte). Deux pièges d'écriture évités : borne basse en `100%` et jamais en px (sinon le réglage « taille de police » du navigateur est annulé — acquis du lot L-typo), et aucune division longueur ÷ longueur (CSS Values 4, navigateurs 2024). Régression associée corrigée : `home-solutions` passait aussi en `h-[500px] overflow-hidden` avec son texte en bas. Garde-fous NEUFS : 4 tests de paliers + monotonie dans `typographie.spec.ts`, et **axe rejoué à 2560 px** sur 3 gabarits — les 62 specs existantes tournent à 1280 et n'auraient jamais vu ce mode | 2 h | mesures de Gabriel | | 2026-09-23 |
| L-articles-accueil | **Choisir les 3 articles de l'accueil** (demande du marketing pour une démo). La bande « Ressources et actualités » prenait les 3 articles les PLUS RÉCENTS, sans moyen de choisir autrement qu'en trafiquant les dates. Nouveau champ `vedettes` sur `home-latest` : une liste de NOMS DE FICHIERS (`postKey`), l'identifiant qui APPARIE FR et EN — **une seule liste sert aux deux langues**, chacune affichant sa traduction et son slug. Vide = comportement historique. Trois garde-fous parce que c'est saisi au CMS : un identifiant inconnu est ignoré ET signalé au build (jamais fatal — mémoire `cloudcannon-null-build-break`), la grille est complétée par les plus récents, le surplus est coupé à 3. Volontairement PAS une liste fermée au sens de la règle 5 : les articles sont du contenu vivant, un `_select_data` devrait être régénéré à chaque publication. Posé : certifications ISO, IA et ServiceNow, mise en place d'un SOC. Les 3 visuels fournis par Gabriel sont rapatriés dans `public/images/ressources/` en **1200 × 750** (le ratio des cartes : en 2:1 `object-cover` rognait les côtés et coupait le texte) — sur les articles **FR seulement**, les visuels portant du texte français | 2 h | — | | 2026-09-23 |
| L-cartes-chiffres | **Cartes de chiffres qui débordaient sous la photo** (signalé par Gabriel, capture à 1280). Piège flexbox classique : les cartes étaient en `flex-1`, donc `flex: 1 1 0%`, mais `min-width` vaut `auto` par défaut — une carte ne peut pas rétrécir sous son mot le plus long. Avec 4 cartes dans la demi-colonne de texte (≈ 460 px dès `lg`), la part tombe à ≈ 100 px alors que « SÉCURISATION » en `uppercase tracking-[1.2px]` en mesure ≈ 105 : la rangée sortait de sa colonne et passait sous l'image. **Pas propre à la page Cybersécurité : 41 sections portent ces cartes, dont 20 avec QUATRE cartes ET une image.** Correctif au COMPOSANT : grille à 2 colonnes au plus quand une image occupe l'autre moitié, 4 seulement en pleine largeur, `min-w-0` en filet (`min-w-0` seul n'aurait pas suffi — le mot aurait débordé DANS la carte). Vérifié à 390/768/1024/1280/1440/1920/2560 sur 4 pages : débordement 0 partout. Au passage, le 4ᵉ paragraphe de la section FR RÉPÉTAIT les trois premiers (liste WordPress aplatie en un bloc de `<li>` dans un champ `paragraphs` ; la version EN était saine) — cas unique du dépôt, vérifié sur les 41 sections | 1 h | — | | 2026-09-23 |
| L-logos | **Un logo posé remplace le libellé à l’écran** (demande Gabriel sur « Nos partenaires et technologies », page Cybersécurité). Écrire « Palo Alto » sous le logo Palo Alto disait deux fois la même chose ; le libellé devient le **texte de remplacement** du logo — invisible à l’écran, toujours lu par les lecteurs d’écran et les moteurs (`alt = imageAlt || label`), donc **aucune perte d’accessibilité ni de SEO** : `check:parite-texte` reste à 3 pages signalées, inchangé. Une boîte SANS logo est intacte — c’est tout le contenu des 22 sections purement textuelles (« Notre approche », « Ce qui est inclus »…) et des partenaires dont le logo manque (ZScaler, Juniper). **Portée mesurée : 50 tuiles à logo dans 6 sections** (cybersécurité, cybersécurité santé, services infonuagiques × FR/EN) sur 28 sections `feature-boxes`. `feature-boxes` était le SEUL composant à afficher les deux : `logo-banner` fait déjà exactement cela depuis sa création, et `benefits` / `numbered-cards` / `bento-metrics` ne sont pas concernés — leur titre porte du sens en plus du logo, pas le nom d’une marque (0 carte à logo dans le contenu aujourd’hui). Vérifié au navigateur sur les deux sections à logos : grille régulière, **axe-core 0 violation**. **Non fait, signalé** : `algosec.svg`, `proofpoint.png` et `ovhcloud.png` sont dans `/images/logos/` mais ne sont posés sur aucune des deux pages — 3 tuiles restent en texte alors que le logo existe (contenu, donc décision/CMS) | 1 h | — | | 2026-09-23 |
| L-correctifs | **Correctifs vérifiés** — (1) `benefits.astro` ne rendait JAMAIS le champ `image` : il existait en zod, dans le blueprint, dans `_structures.benefit_items` et dans le rétro-remplissage depuis le 22/09, et le guide de l'éditrice l'annonçait — seul le rendu manquait, Julie aurait déposé un logo invisible. (2) `home-expertises.astro:68` `h-[300px]` → `min-h-[300px]` : avec le plancher typographique à 16 px la réserve tombait de 100 à 50 px, une phrase un peu longue était rognée par `overflow-hidden` sans barre de défilement (WCAG 1.4.4). (3) Carrières EN : les deux témoignages portaient la MÊME photo. (4) Accueil EN : « Cloud », « environments.. », et 2 cartes qui pointaient sur la page mère générique alors que la page dédiée existe et répond 200 | 1 h | — | | 2026-09-23 |
| L-parite-texte | **Le TEXTE de l'ancien site est-il arrivé ?** — `scripts/migration/check-parite-texte.py` (+ `npm run check:parite-texte`), rejouable : une ligne par page CIBLE construite (151), source = la page EN LIGNE (cache `docs/migration/cache-source/`, 157 pages, 8,6 Mo — la copie de l'ancien site qui survivra à sa mise hors ligne), cible = `<main>` de `dist/` ; ratio de mots et titres H2/H3 absents, en distinguant le **bloc perdu** (titre ET texte absents) du titre seulement reformulé — sans cette distinction, 119 pages sur 151 étaient signalées pour des titres raccourcis. **Résultat : 24 pages signalées** (13 sous le ratio 0,7, 20 avec un bloc perdu), 97 avec des titres reformulés seulement, 9 adresses hors comparaison (décisions). **Perte SYSTÉMATIQUE révélée** : la conversion des articles (juillet) a laissé tomber les FAQ, les encadrés « Le saviez-vous? » et les sous-sections « Copilot dans… » — 9 articles × 2 langues, de 90 à 700 mots chacun, pages en ligne datées d'AVANT l'export (8–14 juillet) ; plus 2 blocs de la page Productivité (FR+EN), un paragraphe de la campagne Licences Power Platform, et deux pages « Merci » volontairement réduites (25 liens de services sur l'ancienne). Liste à trancher dans `docs/journal-nuit-2026-09-23.md` → lot **L-restaure**. Rapport seul, code 0 ; `--strict` bloquant une fois `parite_texte_assumee` écrit dans `correspondance-urls.json` | 0,5 j | arbre commité | | 2026-09-23 |
| L-restaure | **Contenu perdu a la migration, RESTAURE** — ce que `check:parite-texte` avait revele. **21 fichiers, ~3 500 mots remis mot pour mot depuis le cache de l'ancien site**, jamais reformules : les FAQ en accordeon de 6 articles (Copilot vs ChatGPT, Loi 25, IoT, NIS2, ransomware, SOC), les encadres « Le saviez-vous ? » de 3 articles (agents Copilot Studio, realite etendue, SOC), les sous-sections « Copilot dans Word / PowerPoint / Excel / Teams / Outlook / Copilot Studio » et « Les avantages d'un assistant IA Copilot » — 9 articles x FR/EN — plus 2 blocs de la page Productivite FR et 4 EN (`rich-text`, composant existant, aucun champ neuf) et le paragraphe du guide de la campagne Licences Power Platform (`benefits.intro`, champ existant). L'article `fonctionnalites-microsoft-copilot` est passe de **270 a 998 mots** en FR : il avait perdu les trois quarts de son texte ET tous ses titres. **CAUSE RACINE etablie sans relancer la conversion** (l'editrice a touche des articles depuis) : `extractBlocks` (`lib-wxr.mjs`) ne garde du contenu exporte que les blocs `siteorigin-widget-tinymce textwidget` ; le contenu des widgets TIERS n'est pas rendu en HTML dans l'export mais dort en JSON dans un champ cache de raccourci — accordeons (FAQ, resumes rapides, « Copilot dans... »), encadres vitres (« Le saviez-vous ? ») et widgets de titre (les H2/H3, d'ou un article sans aucun titre). L'abandon a ete **SILENCIEUX** : l'avertissement « widget SiteOrigin non-editeur ignore » cherche une classe `so-widget-sow-…` que seuls les widgets DEJA rendus portent, donc 0 avertissement au rapport de conversion. **3 exceptions assumees** ecrites dans `parite_texte_assumee` (2 pages « Merci » redessinees, Conseil strategique FR) → `check:parite-texte -- --strict` sort en 0 et **entre au gate** (CLAUDE.md + operations.md). Mesure : **24 pages signalees → 3, toutes assumees** ; liens internes 15 446 → 15 467, 0 casse. Aucun composant, aucun champ, aucune image, aucun changement de rendu | 0,5 j | L-parite-texte tranche par Gabriel | | 2026-09-23 |
| L15 | `routing.json` — **redirections et en-têtes FAITS le 22/09** : l'intégration `victrix:redirects` écrit `dist/_cloudcannon/routing.json` (schéma officiel `routes`/`headers`, forme documentée par CloudCannon pour un fichier généré au build, prioritaire sur le fichier source). 191 routes (13 d'`astro.config` en `forced`, 3 de l'éditrice, 175 de la matrice de migration ; jokers traduits `*`→`(.*)`, `:splat`→`$1`) et 5 règles d'en-têtes dérivées de `public/_headers` SANS RECOUVREMENT (le bloc `/*` est recopié dans chaque règle précise — sinon /fr/ perdrait HSTS ou recevrait `nosniff, nosniff`). **Reste de L15** : vérifier les en-têtes de l'extérieur après le premier déploiement (`curl -I`), et trancher la règle 404 attrape-tout | 1 j | — | | redirections + en-têtes 2026-09-22 |
| L16 | Statique vs aperçu : `EDITOR_PREVIEW` (politique d'aperçu : brouillons, programmés, fenêtres des bannières, 301 des articles retirés, Bookshop) séparé de `STATIC_ONLY` (adaptateur) — `scripts/lib/build-mode.mjs` testé, tableau des variables par site (operations.md § 6). **Reste UI** : poser `EDITOR_PREVIEW=1` sur les sites dev + Édition | 0,5 j | — | **R4** | 2026-09-24 (nuit) |
| L17 | Formulaires + GA4 | 0,5 j | comptes | | |
| L18 | QA responsive | 1 j | L06–L11 | | |
| L19 | Accessibilité — **entamé le 21/09 (L-a11y)** : axe-core dans le gate, 0 violation sur 9 gabarits, contrastes corrigés. Reste : échelle typographique en `rem` (le réglage « grande police » du navigateur n'agit pas — le zoom, si), ordre de tabulation, textes de remplacement, QA lecteur d'écran | 0,5 j restant | L06–L11 | | partiel 2026-09-21 |
| L20 | Performance | 1 j | — | | |
| L21 | Zéro 404 — **l'essentiel est fait le 22/09** (matrice de 175 redirections, cibles vérifiées dans `dist/` en CI, 9 slugs d'articles alignés sur le site en ligne, 10 anciennes URL de services qui répondaient encore 200). `check-old-urls.mjs` est **passé à L14** le 22/09 (même question, et le registre de Julie en dépend). Reste ici : `hreflang`, plan de site après la levée des `noindex`, et le balayage final du jour J | 0,5 j → 2 h | L03, L15, L14 | | partiel 2026-09-22 |
| L22 | Doc + formation | 0,5 j | tout | | |
| L23 | Jour J | — | tout | | |
| L24–L26 | Options | 1 j + | — | | |
| L-articles-blocs | **Contenu manquant dans les articles, REMIS** (urgence Julie, #1762). Rapport `blocs-manquants-articles.py` corrigé dans les deux sens (page source dans l'autre langue écartée ; titres jugés mot pour mot ; blocs courts « à vérifier ») : 158 blocs / 1 536 mots / 27 articles au lieu de 61 / 853 / 11. Remise OUTILLÉE par `scripts/migration/restaure-blocs-articles.py` (ordre de la source → place dans le Markdown) : **198 blocs dans 26 articles** + 4 retouches à la main ; rapport à 0 après build ; `check:parite-texte --strict` inchangé (3 assumées). À relire par Julie : liens non reconstitués dans les blocs remis, FAQ/questions en gras (forme = sujet B) | 0,5 j | — | | 2026-09-23 |
| R3-1/R3-2 | **Revue R3, constats 1 et 2** : slug des fiches de solutions normalisé (`src/lib/solutions/slug.ts`, une règle pour la route ET le catalogue) et dédoublonné par langue (build en échec nommant les fichiers ; 6 tests) ; rétro-remplissage des 9 fiches EN (`backfill-section-keys.mjs`, 3e passe « clés de page » — 88 clés, `noindex` repris de la jumelle FR ; `check:sections` le garde). **R3-3 à R3-8 faits le 2026-09-24 (nuit)** : libellés FR/EN de la visionneuse, `role="dialog"` + nom accessible, e2e découplés du contenu (`catalogue-fiche`, nouveau `galerie.spec.ts`), id de galerie par rang de section, repli vers le catalogue + dossier de langue inconnu = erreur de build, échappements `\u` (field-name + slug) | 2 h | — | | 2026-09-23 |
| D18/D19/héros | **Documents, 7 articles retirés, héros** (nuit du 24/09) : 3 `/document/*` en 301 définitives + 4 liens d'articles corrigés + `ALLOW` vidé ; 13 articles en `draft: true` (+ `draft: false` rétro-rempli sur 49, gabarits), 31 adresses `articles_retires` → 301 émises hors aperçu d'édition, carte + tri « Brouillons d'abord » au CMS, `brouillons.spec.ts` ; photo d'origine remise sur 12 héros (le 13e n'en est pas un), 393 photos rapatriées (`rapatrie-images-source.py`, +37 Mo dans dist — à trancher). Détail : `docs/migration/nuit-2026-09-24.md` | 2 h | L16 | | 2026-09-24 (nuit) |
| L-forme-articles | **Forme des articles** : 4 patrons sous `.prose` (bouton `btn`, encadré, FAQ `details`, tableau défilant — `docs/plan-forme-articles.md`), `restaure-forme-articles.py` appliqué (32 articles : 49 CTA, 10 encadrés, 6 FAQ, 24 tableaux ; texte inchangé), démo `/fr/style-guide/forme-articles/` (axe 0) + `forme-articles.spec.ts`, guide § « Mettre en forme un article ». **Snippets CloudCannon NON FAITS** (aucun gabarit HTML pour du `.md` — `.mdx` ou modèles collés, à trancher) | 1 j | — | | 2026-09-24 (nuit) |
| L-statut-import | **Statut de l'importation + validation « on ne perd rien »** (demande de Gabriel, page IA en exemple). NOUVEL OUTIL rejouable `scripts/migration/blocs-manquants-pages.py` : le pendant de l'outil des articles pour les 89 pages hors articles, plus les paragraphes amputés, les IMAGES (par nom de fichier) et les LIENS internes. Première passe : 87/89 pages avec un écart — **17 images de héros remplacées, 106 liens perdus, 216 blocs absents (143 courts), 103 paragraphes amputés, 123 photos + 246 logos absents** ; 340 blocs seulement reformulés (hors décompte). Lecture, réponses à Julie (Lambda déjà dans `dev` ; 4 « documents » → D18 ; 7 articles à retirer → D19 ; `staging` a 42 commits de retard sur `dev` = la vraie cause de ses « non intégrée ») et suites dans `docs/migration/statut-import.md`. Aucun contenu modifié. Lot de remise = L-restaure-pages (prompt en phase 3) | 0,5 j | — | | 2026-09-23 |
| L-restaure-pages (1re passe) | **Remise du contenu perdu sur les PAGES** — ordre du classeur de Julie (visible + indexable d'abord), FR + EN, 5 lots : IA, accueil/SEvOC/Loi 25/Carrières/Conseil/Cyber, Productivité/Infonuagique/Intranet/Ø Studio/Appro TI/Services gérés, 11 pages enfants, 18 fiches fournisseurs. **Blocs 216 → 100, amputés 103 → 82, liens 106 → 13, héros 17 → 13 (restants = design/assumés).** Remis : 6 héros d'origine, ~90 liens, avis Gartner complets (note globale, note + date par avis, citations entières), 14 badges de certification (Cyber), désignations Microsoft (Azure, D365), logos manquants (AlgoSec, Proofpoint, OVH, Zscaler, Juniper), infographies (Harmony SASE, schéma intranet), phrases amputées. 3 composants retouchés (tech-columns items = liens, bento aside = HTML, testimonial-cards.intro + rétro-remplissage 66 fichiers). Reste (§ 7 de statut-import.md) : logos de la page Productivité (bandeau texte), photos sans emplacement, Licences (D18), Découvrir/Merci/Ressources assumées | 1 j | — | | 2026-09-24 |

**Total Opus ≈ 14–15 jours assistés · Fable : 4 revues + réserve d'urgence.**
Ordre conseillé si le temps manque : L01 → L06 → L09 → L15 → L16 → L10 → L11,
puis la phase 4 ; L03/L04/L05/L08 se glissent entre deux gros lots.

**Mise à jour du 2026-09-22** — L01, L09 et le gros de L15 sont faits. L'ordre
qui reste est donc **L14 → L06 → L16 → L10 → L11**, puis la phase 4. L14 passe
devant parce qu'il est court (0,5 j), qu'il dé-risque la mise en ligne, et que
son registre peut révéler des pages à produire — mieux vaut le savoir AVANT
d'ouvrir L06 (1,5 j) que pendant.

**Mise à jour du 2026-09-23 (soir)** — la validation « on ne perd rien » a
produit `docs/migration/statut-import.md`. L'ordre devient : **PR `dev` →
`staging`** (Julie valide un site vieux de 3 jours) → D18/D19 → R3-3…8 →
**L-restaure-pages** (1,5–2 j) → L12 réduit → L08 (reste) → L06 → L16 → phase 4.

**Mise à jour du 2026-09-24 (nuit)** — L-restaure-pages : première passe FAITE
(voir § 7). Le rapport `blocs-manquants-pages.md` ne contient plus que des
écarts assumés ou de forme ; ordre inchangé : **PR `dev` → `staging`** → D18/D19
→ R3-3…8 → L12 réduit → L08 (reste) → L06 → L16 → phase 4.

**Mise à jour du 2026-09-24 (nuit, 2e session)** — R3-3…8, L16, D18/D19/héros
et la forme des articles sont FAITS (compte rendu : `docs/migration/nuit-2026-09-24.md`,
questions du matin en fin de document). Ordre restant : **commit + PR `dev` →
`staging`** → `EDITOR_PREVIEW=1` dans l'UI CloudCannon (dev + Édition) → décisions
du matin (poids des photos, snippets `.mdx` ou modèles, FAQ en titres) → L12
réduit → L08 (reste) → L06 → phase 4.

**Mise à jour du 2026-09-25 (matin)** — la nuit est commitée et poussée
(`f897438`). Revérification du contenu des articles sur l'arbre poussé : texte
à 0 bloc perdu (hors D18 et reformulations de Julie), parité 3 assumées,
188/188 redirections, 13 brouillons D19, Lambda présent. **Deux trous
trouvés** : (1) les IMAGES du corps des articles n'ont jamais été mesurées ni
remises — nouvel outil `images-manquantes-articles.py` : 44 images de contenu
absentes dans 26 articles (infographies ServiceNow ITOM et SOC, bannières
Copilot Studio et webinaire, photos), toutes déjà sous `public/wp-content/`,
plus 36 `<img>` de NIS2 FR/EN encore servies par `https://www.victrix.ca`
(casseront à la mise hors ligne) → lot **L-images-articles** proposé en
option (≈ 0,5 j, outillé comme `restaure-blocs-articles.py`), À FAIRE APRÈS la
fusion dans `staging` (Julie édite déjà des articles là-bas). (2) Julie a
réécrit elle-même `agents-copilot-studio.md` sur `staging` le 23/09 (coquilles,
« Planifiez une consultation », bannière, titre FAQ) — sa version porte
l'ancienne classe `article-cta` supprimée cette nuit, un lien vers l'ancien
site et une image sous `/src/assets/uploads/` que le build ne sert pas ; ses
retouches sont **absorbées dans `dev`** (17 remplacements, non commité), à
retenir côté `dev` au moment de résoudre le conflit de la PR (25 autres
conflits = JSON de services → `node scripts/merge-content-json.mjs`). Au
passage : titre d'encadré français dans l'article EN corrigé. Ordre inchangé.
