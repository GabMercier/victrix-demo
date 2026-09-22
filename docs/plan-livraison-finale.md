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

#### L14 — Inventaire des pages et contenus (1–2 h) · #1765

```text
Lot L14 de docs/plan-livraison-finale.md.
Génère docs/inventaire-pages.md à partir de dist/ (après un build) et de
docs/content-inventory.md + docs/migration/ : une ligne par URL de l'ancien
site → nouvelle URL (ou redirection, ou « abandonnée »), état FR/EN, texte
provisoire ou validé si détectable. Signale : pages de l'ancien site sans
destination, pages EN manquantes, pages démo à retirer avant le lancement.
C'est le support de validation de Julie pour #1765. Aucun changement de code.
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
| L-banc | **BANC D'ESSAI TEMPORAIRE** — `?police=inter\|montserrat\|nunito\|hanken` et `?bleu=export2\|figma` sur toutes les pages, pour trancher deux écarts maquettes/site : le bleu (`#002fc7` du Design System et de TOUTES les maquettes vs `#1a5bff` du site, remappé en août « à confirmer avec le designer », jamais confirmé) et la police (Hanken des maquettes, Montserrat du site actuel, Inter en place). Inerte sans paramètre. **À retirer après arbitrage** — `docs/design/banc-essai.md` | 2 h | **décision designer + client** | | 2026-09-21 |
| L-bleu2 | **BLEU DE MARQUE TRANCHÉ** : `--color-primary` passe au `#002fc7` du Design System Figma (famille complète + couche héritée `tokens.css`). L'ancien `#1a5bff` est CONSERVÉ — primitive `bleu-500` et fond « Bleu électrique » ; nouveau fond « Bleu Victrix ». Révélé et corrigé au passage : `global.css` force `color: navy` sur les h1-h4, qui bat la couleur héritée d'un parent (titre 1,9:1 sur aplat bleu dans `photo-features`) | 2 h | — | | 2026-09-21 |
| L-contact2 | **Page Contact redessinée** d'après `contact maquette redesign.txt` : surtitre rétabli (champ CMS `heroEyebrow`), H1 au `#00105B` exact de la maquette, bande beige / cartes blanches (inversé), grille des numéros par bureau rétablie, champs à bordure `contour` rayon 4, bouton en largeur auto sans pictogramme, libellé du bouton réaligné (« Soumettre » → « Envoyer le message », il contredisait la définition) | 3 h | L-bleu2 | | 2026-09-21 |
| L-fonds3 | Fonds bleus ouverts à 5 sections d'accroche de plus (10 au total) : `home-experts` (rien à inverser, son texte vit dans un panneau), `benefits`, `feature-boxes` (cartes blanches → seuls titre/chapeau), `value-tiles` et `text-photo` (tout sur le fond : titres, icônes, bordures). Inversion vers le BLANC — `primary-fixed-dim` ne donne que 3,1:1 sur le bleu électrique. Vérifié par un essai axe sur les deux aplats, contenu d'essai restauré | 2 h | L-bleu2 | | 2026-09-21 |
| L-prix | **À FAIRE** — Liste de prix Check Point (`/liste-prix-check-point/`, `/en/check-point-price-list/`) : c’est un OUTIL (tableaux de prix + « ajouter à ma commande » + formulaire), pas une page de contenu → décision : le reprendre, le remplacer par un PDF + formulaire, ou le retirer | ? | décision marketing | | |
| L00 | Réponses #1762 + PR | 0,5 h | H2 | | |
| L01 | Tolérance aux champs vidés | 1,5 h | — | | |
| L02 | Rétro-remplissage générique des clés | 2 h | — | | |
| L03 | Slugs EN — FAIT le 21/09 (D1 : `artificial-intelligence`, `application-services`, `ai-projects` ; `infrastructure` inchangé ; le méga-menu suit le champ `slug` de la page) | 2 h | D1 | | 2026-09-21 |
| L04 | H1 | 1 h | D2 | | |
| L05 | `noindex` | 1 h | D3 | | |
| L06 | CTA, cartes cliquables, boutons | 1,5 j | — | **R1** | |
| L07 | Lucide, logos, bandeau | 1 j | D4 | | |
| L08 | Petits retours de Julie | 0,5 j | D5 | | |
| L09 | Consentement Loi 25 — FAIT AUTREMENT : bandeau maison fini, sans bibliothèque (D6 tranchée : mesure d'audience seule, 182 jours, rechargement au retrait, sans registre serveur). Reste : texte de la politique (Julie + juridique), `PUBLIC_GA4_ID` | 2 h | — | R2 facultative | 2026-09-21 |
| L10 | Catalogue A — export, galerie | 1 j | — | | |
| L11 | Catalogue B — fiches, route | 1,5 j | L10 | **R3** | |
| L12 | Livres blancs — **4 pages** `/document/*` (pas 3 : + `/document/cybersecurite/`, livre blanc SEvOC) ; `licences-microsoft-power-platform` existe déjà en campagne | 1 j | D7, #1633 | | |
| L13 | Prix + Espace client | 1 h | D8 | | |
| L14 | Inventaire des pages | 2 h | — | | |
| L15 | `routing.json` | 1 j | — | | |
| L16 | Statique vs aperçu | 0,5 j | — | **R4** | |
| L17 | Formulaires + GA4 | 0,5 j | comptes | | |
| L18 | QA responsive | 1 j | L06–L11 | | |
| L19 | Accessibilité — **entamé le 21/09 (L-a11y)** : axe-core dans le gate, 0 violation sur 9 gabarits, contrastes corrigés. Reste : échelle typographique en `rem` (le réglage « grande police » du navigateur n'agit pas — le zoom, si), ordre de tabulation, textes de remplacement, QA lecteur d'écran | 0,5 j restant | L06–L11 | | partiel 2026-09-21 |
| L20 | Performance | 1 j | — | | |
| L21 | Zéro 404 | 0,5 j | L03, L15 | | |
| L22 | Doc + formation | 0,5 j | tout | | |
| L23 | Jour J | — | tout | | |
| L24–L26 | Options | 1 j + | — | | |

**Total Opus ≈ 14–15 jours assistés · Fable : 4 revues + réserve d'urgence.**
Ordre conseillé si le temps manque : L01 → L06 → L09 → L15 → L16 → L10 → L11,
puis la phase 4 ; L03/L04/L05/L08 se glissent entre deux gros lots.
