# Opérations — routine CloudCannon + Cloudflare Pages

> Le processus complet, au jour le jour : synchroniser, développer, vérifier,
> publier. Complète `docs/DEPLOYMENT.md` (hébergement, contraintes, liste
> go-live) et `docs/spike-cloudcannon.md` (réglages CloudCannon, grille de gate). Toutes
> les commandes ci-dessous ont été exécutées une fois pour vérifier ce
> document (14 juillet 2026).

## 1. Avant de commencer une session

**Trois branches depuis le 2026-09-16** (une journée de collisions entre
sauvegardes CloudCannon et pushs de dev a tranché) :

| Branche | Rôle | Qui y écrit | Comment |
|---|---|---|---|
| `main` | production (site CloudCannon de prod) | personne à la main | avance uniquement par le bouton **Publish** (§6) |
| `staging` (ex-`spike/cloudcannon`) | édition (site CloudCannon d'édition, aperçu lawful-hare) | Julie et les éditeurs via CloudCannon — **chaque sauvegarde = un commit direct** | les devs n'y arrivent que par **PR depuis `dev`** (fusion côté GitHub : plus de push rejeté) ; correctif d'une ligne toléré en direct |
| `dev` | intégration des développeurs | Gabriel et tout futur dev | branches courtes `feat/*` → PR → `dev` ; aperçu Cloudflare `dev.victrix-demo.pages.dev` (infra héritée) |

Règles : **jamais** de `rebase` ni de `push --force` sur `staging`/`main` ; le
contenu et le code vivent dans les mêmes branches (on fusionne, on ne réécrit
pas l'historique de l'édition) ; ramener `staging` dans `dev` (`git merge`)
avant chaque promotion pour résoudre les conflits de son côté.

Avant de travailler :

```
git switch dev
git pull --no-rebase origin dev
git merge origin/staging      # le contenu des éditeurs, toujours à jour
npm install
```

`npm install` seulement si `package.json`/`package-lock.json` a changé depuis
la dernière fois (un `git pull` qui les touche, ou une installation manuelle).

## 2. Développement local

```
npm run dev
```

Node 18 fonctionne en local — l'adaptateur Cloudflare ne s'attache qu'au
build de production (voir `docs/DEPLOYMENT.md`). **Pendant que `npm run dev`
tourne, ne PAS lancer `astro build` / `astro preview` / `astro check` dans le
même dépôt** : les deux processus écrivent le même cache `.astro/`, ce qui
provoque un `EPERM` sous Windows et laisse le serveur de dev sur une
configuration périmée (« Continuing with previous valid configuration »).
Voir §3.1 pour vérifier sans arrêter le serveur de dev.

## 3. Portail qualité avant de pousser

Sept commandes, dans cet ordre — toutes doivent sortir propres :

```
npm run lint
npm test
npm run cms:previews:check
npm run check:bookshop
npm run type-check
npm run build
STATIC_ONLY=1 npm run build
```

`check:bookshop` (2026-09-17, `scripts/check-bookshop-strip.mjs`) rejoue sur
chaque composant de `component-library/` l'étape que SEUL le build
CloudCannon exécute (`postbuild` → `@bookshop/generate` → moteur Astro de
Bookshop : retrait des scripts par regex, compilation Astro, esbuild). Un
composant qui passe `npm run build` mais casse le build CloudCannon (§8 :
balise script ouvrante écrite dans un commentaire) est attrapé ici, avant le
push.

`cms:previews:check` — depuis le 2026-09-21, il compare DEUX listes de fonds :
`_select_data.fonds` (les 10 fonds clairs, offerts partout) et
`_select_data.fonds_etendus` (les mêmes + les fonds SOMBRES de
`FOND_KEYS_SOMBRES`, réservés aux sections qui inversent leurs textes).
**Elles sont DIX depuis le 2026-09-21**, pas cinq — la liste d'origine
(rich-text, callout, stats, logo-banner, faq) a été élargie par le lot
`L-fonds3` à benefits, feature-boxes, home-experts, text-photo et value-tiles.
La source qui fait foi reste la liste des specs qui référencent
`_select_data.fonds_etendus` ; ne pas recopier un décompte à la main.
Ajouter un fond sombre = une clé
dans `FOND_KEYS_SOMBRES` + sa classe et sa pastille dans `fonds.ts`, une entrée
en fin de `fonds_etendus`, `npm run cms:previews`, et l'inversion des textes
dans les composants qui l'offrent (`estFondSombre`).

`cms:previews:check` (2026-09-17) vérifie que les pastilles de la palette
« Fond de section » et les vignettes d'icônes de l'éditeur
(`public/images/cms/`) sont à jour et que les listes `_select_data` de
`cloudcannon.config.yml` correspondent EXACTEMENT — mêmes clés, même ordre —
aux deux sources partagées : `component-library/src/shared/fonds.ts` (fonds)
et, depuis le 2026-09-18, `component-library/src/shared/icons.ts` (**banque
de pictogrammes unique** : une seule liste `_select_data.icones`, offerte par
tous les sélecteurs d'icône). Ajouter un pictogramme = une entrée dans
`icons.ts` + une entrée dans `_select_data.icones`, puis `npm run
cms:previews` (génère `public/images/cms/icones/<cle>.svg`) et committer
`public/images/cms/` ; le zod importe `ICON_KEYS`, rien à y toucher. Une
ancienne clé réapparue après une sauvegarde CloudCannon antérieure à la
bascule se corrige avec `node scripts/migrate-icons-bank.mjs` (rejouable ;
`--check` pour lister sans écrire).

| Commande | Attendu | Constaté au 14 juillet 2026 |
|---|---|---|
| `npm run lint` | 0 erreur (des avertissements a11y pré-existants sont tolérés) | 0 erreur, 6 avertissements (liens `href` vides, `contact.astro`/`Footer.astro`) |
| `npm test` | tous les tests verts | 62/62 |
| `npm run type-check` | 0 erreur | 0 erreur, 3 indices (`hints`) sans gravité |
| `npm run build` | build Cloudflare complet (`dist/_worker.js` + `_redirects` + `_routes.json`) | OK — `_worker.js` présent, 1 redirection CMS écrite et exclue du worker |
| `STATIC_ONLY=1 npm run build` | build 100 % statique (aucun `_worker.js`), 23 pages | OK — 23 page(s) built, aucun `_worker.js` dans `dist/` |
| `npm run check:links` (après le build ; `-- --strict` en CI) | 0 lien interne cassé dans `dist/` | 18 sept. 2026 : 75 cibles fautives à l'introduction (liens d'origine WordPress dans les articles), 0 après `npm run fix:links` |
| `npm run check:prefill` (après le build) | 0 CTA de contenu qui arrive sur une liste obligatoire vide | 22 sept. 2026 : 171 liens fautifs à l'introduction, 0 après le lot L-prefill — 822 liens vers le Contact, dont 449 de contenu et 373 de chrome (ignorés) |
| `npm run check:old-urls` (après le build) | rapport seul, code 0 — chaque adresse de l'ancien site arrive sur une page | 23 sept. 2026 : 172 des 173 adresses arrivent (2 sans bouger, 170 en un saut) ; reste `/cache/`, un rebut WordPress |
| `npm run check:images` | rapport seul, code 0 — aucune image référencée n'est allégeable | 23 sept. 2026 : 0 après la passe (34 fichiers allégés, 3,5 Mo) |
| `npm run check:parite-texte -- --strict` (après le build ; Python) | **BLOQUANT depuis le lot L-restaure** — 0 page signalée hors exceptions assumées | 23 sept. 2026, après L-restaure : 151 pages comparées, **3 signalées, toutes assumées** (les 2 pages « Merci » et Conseil stratégique FR), 100 avec seulement des titres reformulés, code 0. Avant L-restaure : 24 signalées |

**Adresses de l'ancien site (2026-09-23).** `scripts/check-old-urls.mjs` rejoue
le PARCOURS d'un lien entrant (Google, LinkedIn, courriel, signet) contre les
artefacts livrés : `dist/_cloudcannon/routing.json` pour les règles,
`dist/` pour les pages. C'est le seul garde-fou qui teste le DÉCLENCHEMENT
d'une règle — `check:redirects` ne valide que la cible, `check:links` que les
liens internes. Aucun des deux ne pouvait voir le défaut de barre oblique
finale qui mettait 105 des 184 anciennes adresses en 404 (corrigé par
`67f9337`). Il écrit `docs/migration/validation-301.md` **et rafraîchit la
colonne « État mesuré » de `docs/inventaire-pages.md`**, le registre de
validation de Julie. **Rapport seul, code 0** (comme `check:prefill` à ses
débuts) : `--strict` le rend bloquant, une fois les cas douteux tranchés.
Serveur de dev actif → `node scripts/check-old-urls.mjs --dist <copie>/dist`.

**Texte de l'ancien site (2026-09-23).** `npm run check:parite-texte`
(`scripts/migration/check-parite-texte.py`) pose la question que
`check:old-urls` ne pose pas : l'adresse arrive, mais **le texte est-il arrivé
entier ?** Une ligne par page CIBLE construite : la source est la page EN
LIGNE de victrix.ca (téléchargée une fois, cache
`docs/migration/cache-source/` — 157 pages allégées de leurs scripts et
styles, 8,6 Mo, à committer : c'est aussi la copie de l'ancien site qui
survivra à sa mise hors ligne), la cible est `<main>` dans `dist/`. Il compare
les VOLUMES (ratio cible / source) et les TITRES H2/H3 de la source absents de
la cible, en distinguant le **bloc perdu** (titre ET texte absents, ✗) du
**titre reformulé** (texte retrouvé, ≈). Signalé si ratio < 0,7 ou ≥ 1 bloc
perdu ; une cible plus longue n'est pas un défaut. Rapport :
`docs/migration/parite-texte.md`, du pire au meilleur, par rubrique.
`--refresh` re-télécharge les sources ; `--dist <copie>/dist` si le serveur de
dev tourne. Sous Git Bash, préfixer par `MSYS_NO_PATHCONV=1` quand on passe un
chemin commençant par `/`.

**`--strict` est BLOQUANT depuis le lot L-restaure (2026-09-23)** : il sort en 1
dès qu'une page est signalée sans exception assumée. Quand il casse, deux issues,
jamais une troisième :

1. **le texte manque vraiment** → le restaurer depuis le cache, à sa place. La
   page source se lit avec le parseur DÉJÀ ÉCRIT, jamais un parseur neuf :
   `blocs_source()` de `scripts/migration/check-parite-texte.py` rend la liste
   des blocs (`h2`, `h3`, `p`, `li`, `img`) d'un fichier de
   `docs/migration/cache-source/` ;
2. **le raccourcissement est voulu** → écrire la page cible dans
   `parite_texte_assumee` de `docs/migration/correspondance-urls.json`, avec la
   RAISON en toutes lettres (elle s'affiche dans le rapport, colonne « ☑ assumée »).

Les 3 exceptions écrites le 2026-09-23 : les deux pages « Merci » (l'ancienne
servait de plan de site officieux, ≈ 25 liens de services) et Conseil stratégique
FR (teaser Carrières + bandeau de logos, décision D4).

**Restaurer du contenu perdu (recette du lot L-restaure, 2026-09-23).** La
migration de juillet a laissé tomber, EN SILENCE, tout ce qui n'était pas un
widget « éditeur » de l'ancien constructeur de pages : FAQ en accordéon,
encadrés « Le saviez-vous ? », titres de section et sous-sections entières —
9 articles × 2 langues, plus la page Productivité et une campagne. La cause est
dans `extractBlocks` (`scripts/migration/lib-wxr.mjs`), qui ne garde du contenu
exporté que les blocs `siteorigin-widget-tinymce textwidget` ; l'avertissement
censé signaler un widget ignoré cherche une classe `so-widget-sow-…` que les
widgets tiers n'ont jamais, d'où zéro avertissement au rapport de conversion.
**Ne pas relancer `convert-articles.mjs`** : l'éditrice a modifié des articles
depuis. On restaure à la main, depuis le cache, bloc par bloc.

**Quels blocs manquent, article par article (2026-09-23, demande de Julie).**
`python scripts/migration/blocs-manquants-articles.py` (après un `npm run build`)
écrit `docs/migration/blocs-manquants-articles.md` : pour chacun des 62
articles, les blocs de la page EN LIGNE qui ne se retrouvent pas dans la page
construite, **avec leur texte, prêt à coller**. Il n'écrit rien dans
`src/content` — la remise reste un geste humain.

Pourquoi un outil de plus, alors que `check:parite-texte` existe : ce dernier
juge à la maille de la PAGE (ratio de mots) et ne compare individuellement que
les blocs qui SUIVENT un titre H2/H3. Un encadré de 40 mots perdu dans un
article de 1 200 ne fait pas tomber le ratio, et s'il ne suit pas un titre, il
n'est comparé nulle part — c'est exactement ce que Julie trouvait à la main.

**Le piège, payé au premier essai : la LANGUE.** Sans filtre, l'outil
annonçait 185 blocs perdus (4 641 mots), dont 170 sur quatre articles anglais.
Aucun n'avait rien perdu : les pages `/en/…` de l'ancien site étaient restées
EN FRANÇAIS, et nos articles anglais sont traduits — chaque bloc français était
donc introuvable dans une cible anglaise. Un détecteur de langue par
mots-outils écarte ces blocs (compteur séparé dans le rapport). Première
lecture : 61 blocs, 853 mots, 11 articles.

**Deuxième passe (2026-09-23, soir) — le rapport se trompait dans les deux
sens.** (1) Le filtre PAR BLOC laissait passer les items de liste et les
titres courts des mêmes quatre articles anglais (46 faux « perdus » de plus) :
on tranche maintenant d'abord à la maille de la PAGE SOURCE — si elle est
entière dans l'autre langue, l'article est écarté et listé à part. (2) Les
TITRES étaient sous-déclarés : un H2 de quatre mots n'atteignait pas les cinq
mots significatifs du jugement par sac de mots, et ses mots pris un à un se
retrouvent toujours ailleurs dans la page. Un titre est désormais « absent »
dès qu'il n'est pas retrouvé mot pour mot ; un bloc court (question de FAQ,
intitulé d'encadré) non retrouvé mot pour mot est signalé « à vérifier ».
**Verdict réel : 158 blocs, 1 536 mots, 27 articles** — presque tous des
H2 que la conversion WordPress avait laissés tomber, plus les FAQ.

**La remise est OUTILLÉE :** `python scripts/migration/restaure-blocs-articles.py`
(essai : les diffs, rien d'écrit ; `--apply` écrit `src/content/blog` ;
`--only <slug>,<slug>`). Il marche les blocs de la page source DANS L'ORDRE,
repère dans le Markdown la ligne où chaque bloc retrouvé vit, et insère un
bloc absent juste après la dernière ligne repérée — `## `/`### ` pour un
titre, `- ` pour un item, gras pour un bloc court. Trois garde-fous appris en
le faisant : un item de liste ne se cherche que sur une ligne de liste
(Markdown ou `<li>`), un titre que mot pour mot, et un bloc « présent dans la
page » qui ne vit dans aucune ligne du fichier est repêché (le rapport juge
sur le sac de mots de la page entière). Les liens du bloc d'origine ne sont
pas reconstitués (source lue en texte nu). Rejouable : un bloc remis est
retrouvé, donc ignoré. Résultat du 23/09 : **198 blocs remis dans 26
articles**, puis rapport à 2 blocs (remis à la main), et 4 retouches
manuelles (un titre vide, une ligne « . », un H2 déplacé, 4 étiquettes → liste).

L'outil juge le TEXTE, pas la FORME : un encadré rendu en paragraphe simple,
une FAQ aplatie en titres ou une bannière devenue un lien nu comptent comme
présents. C'est un sujet distinct (composants d'article).

**Import du catalogue Ø Studio (lot L10, 2026-09-23).**
`scripts/migration/export-catalogue-ostudio.mjs` rapatrie
`o-studio-catalogue.victrix.ca` (WordPress FR, API REST ouverte) : les textes
des 16 fiches, leurs 70 images, et les deux pages de texte libre (accueil du
catalogue, « À propos ») en Markdown pour le marketing.

```powershell
node scripts/migration/export-catalogue-ostudio.mjs                # tout (réseau)
node scripts/migration/export-catalogue-ostudio.mjs --hors-ligne   # depuis le cache local
node scripts/migration/export-catalogue-ostudio.mjs --check        # n'écrit rien, code 1 si écart
node scripts/migration/export-catalogue-ostudio.mjs --sans-images  # textes seuls (rapide)
node scripts/migration/export-catalogue-ostudio.mjs --force-images # retélécharge les images
```

Il écrit `docs/migration/catalogue-ostudio/` (un JSON par fiche + le cache brut
de l'API + les deux Markdown) et le rapport `docs/migration/catalogue-ostudio.md`.
Quatre choses à savoir :

- **Il n'écrit RIEN dans `src/content/`.** Les fiches du site sont générées par
  le lot L11 **à partir de cet export**, jamais du réseau : l'import reste
  rejouable sans écraser ce que l'éditrice aura retouché au CMS. C'est
  exactement ce que `convert-articles.mjs` ne permet plus.
- **Le cache EST la copie qui survit** (`_source-api.json`, ~260 Ko) : le
  sous-domaine est démantelé au go-live. Même raisonnement que
  `docs/migration/cache-source/`.
- **Aucun abandon silencieux** (leçon L-restaure) : une structure inattendue —
  H1 absent, ≠ 4 faits, libellé de fait inconnu, page hors de la table de
  correspondance — est une **erreur**, le script sort en code 1 en la nommant.
  Les anomalies de *contenu* (deux fiches qui partagent des images, une
  introduction copiée-collée, photos de banque, `alt` absents) vont au rapport
  sans faire échouer l'export. Les pages Markdown ont en plus un garde-fou de
  déperdition : un écart de plus de 2 % entre les mots de la source et ceux de
  la sortie est une erreur.
- **User-Agent de navigateur obligatoire** : le WordPress répond 403 sans lui
  (y compris pour les fichiers d'images).

Les images sont allégées à l'écriture, avec les réglages de
`optimize:images` (1 600 px, JPEG q80 mozjpeg, **PNG sans perte**) : 9,8 Mo
pour 70 fichiers dans `public/images/solutions/<fiche>/`.

**Poser les fiches sur le site (lot L11, 2026-09-23).**
`scripts/migration/genere-fiches-solutions.mjs` transforme l'export en fiches
de la collection `solutions` — **sans jamais toucher au réseau** (la source est
l'export, ce qui reste vrai après le démantèlement du sous-domaine).

```powershell
node scripts/migration/genere-fiches-solutions.mjs           # écrit les fiches
node scripts/migration/genere-fiches-solutions.mjs --check    # n'écrit rien, code 1 s'il en manque
node scripts/migration/genere-fiches-solutions.mjs --force    # RÉÉCRIT les sections existantes
```

**Il ne réécrit jamais une fiche déjà composée** : dès qu'un fichier porte des
`sections`, il est sauté et signalé — le contenu appartient alors à l'éditrice.
`--force` est le seul moyen d'écraser, et il efface les retouches faites au
CMS. C'est la leçon de `convert-articles.mjs`, appliquée à l'envers : un
générateur qu'on ne peut relancer sans dégât n'est plus un outil.

Ce qu'il compose (docs/plan-import-catalogue-ostudio.md §4) : `product-hero`
(titre, introduction, maquette, bouton vers `#formulaire`), `bento-metrics`
(« En bref » : les 4 faits en pastilles + renvoi vers la page de service
Ø Studio), `galerie` (les captures restantes — absente quand la source n'a
qu'une image), `form` (`formId: o-studio`). Les 9 fiches existantes **gardent
tous leurs champs de carte** (titre, description, vignette, secteur, type,
ordre, vedette) ; les 7 nouvelles reçoivent un secteur et un type **proposés**,
à relire (table `PROPOSITIONS` du script — « Santé » est la seule valeur de
filtre nouvelle). Le champ `href` qui valait `/contact` est vidé : « Découvrir »
mène alors à la fiche. Un `href` qui pointe ailleurs est une surcharge voulue
et reste intact (`o-bureau` garde sa page de service).

**Typographie française — et le piège de l'éditeur visuel (2026-09-23).**
Les espaces insécables devant `: ; ! ? »` (et après `«`) sont posées **après le
build**, sur le HTML : intégration `victrix:typographie` d'`astro.config.mjs`,
logique pure dans `scripts/lib/typographie-html.mjs` (testée). Elle ne
transforme que le TEXTE entre `>` et `<`, met `script/style/pre/code` de côté,
et est idempotente. 202 pages traitées, 70 titres sur 70.

**NE PAS la remettre dans le renderer des sections.** C'est la première
tentative, et elle a coûté les crayons de l'éditeur visuel CloudCannon sur
TOUTES les sections : le plugin Bookshop trace le chemin des données
(`contentBlocks` → `{...block}` → composant) pour savoir quel champ un clic
doit ouvrir, et interposer une fonction dans
`component-library/src/shared/astro/page.astro` coupe ce fil.

**Comment le vérifier** — le build normal ne montre rien, Bookshop n'y tourne
pas. Il faut rejouer le build de CloudCannon :

```powershell
STATIC_ONLY=1 npm run build
# puis compter les marqueurs d'édition live sur une page à sections :
(Select-String -Path distr\services\cybersecurite\index.html -Pattern 'bookshop-live' -AllMatches).Matches.Count
```

Mesuré : **2 avant, 0 avec la transformation dans le renderer, 2 après le
correctif**. Tout changement touchant `page.astro` ou la façon dont les blocs
arrivent aux composants doit passer par ce contrôle.

**Poids des images (2026-09-23).** `npm run optimize:images` réduit et
réencode SUR PLACE les images de `public/` — même chemin, même nom, même
format, donc aucune référence à réécrire et aucun risque pour la médiathèque
CloudCannon. Il ne redimensionne qu'au-delà de 1 600 px, n'écrit que si le
gain dépasse 5 % (d'où son idempotence : un second passage ne dégrade rien),
et ne touche PAS aux images orphelines. `npm run check:images` est le même
outil en lecture seule. **Deux pièges payés en l'écrivant** : `png({ effort })`
bascule silencieusement sharp en quantification 256 couleurs (perte réelle et
visible — l'outil n'utilise donc que du PNG sans perte, et le vrai levier pour
les photos en PNG reste le WebP, non fait) ; et passer un CHEMIN à sharp fait
projeter le fichier en mémoire par libvips, si bien que réécrire le même
chemin échoue en « UNKNOWN: unknown error » sur les JPEG — l'outil lit donc
le fichier en mémoire d'abord.

**Liens internes (2026-09-18).** `scripts/check-internal-links.mjs` relève chaque
`<a href>` interne du site CONSTRUIT et vérifie que la cible existe dans
`dist/` : CASSÉ (erreur en mode strict — CI) ou REDIRIGÉ (rattrapé par
`_redirects`, que l'hébergement CloudCannon ignore — avertissement). Pour chaque
cible il nomme les fichiers de contenu à corriger. Sur CloudCannon il tourne dans
`.cloudcannon/postbuild` en simple avertissement (journal de build). Réparation
mécanique et rejouable : `npm run fix:links` (`-- --check` pour lister sans
écrire) — ne retient une destination que si elle existe dans `dist/`, et ne
touche jamais aux liens stockés SANS préfixe de langue dans un champ JSON
(navigation, fiches de solutions). Exceptions documentées : constante `ALLOW` du
garde-fou (aujourd'hui les trois pages « document » de WordPress non migrées).

**Préremplissage des CTA vers le Contact (2026-09-22).**
`scripts/check-contact-prefill.mjs` répond à une question que ni zod ni
`check:links` ne posent : le lien existe, mais **arrive-t-il sur un formulaire
utilisable ?** « De quoi souhaitez-vous parler ? » et « Service » sont tous deux
OBLIGATOIRES ; un CTA qui les laisse vides redemande au visiteur ce que la page
savait déjà. Le script rejoue sur `dist/` la mécanique d'exécution du site
(`src/layouts/BaseLayout.astro`, script « provenance des CTA ») :

```text
sujet final   = ?sujet=     du lien   OU  <body data-contact-sujet>
service final = ?expertise= du lien   OU  <body data-contact-service>
```

Les deux doivent être non vides, sinon il nomme la page et le lien et sort en
erreur (CI, après le build). **Exceptions assumées, dans la constante
`CHROME_TAGS` :** les liens de `<header>`, `<nav>` et `<footer>` — le site les
ignore VOLONTAIREMENT (leur libellé « Contact » n'apporte aucun contexte), et le
formulaire surligne alors ses six champs obligatoires vides. Toute autre
exception s'ajoute là, avec sa raison.

**Piège payé en l'écrivant :** chercher la première occurrence de `<body` dans
le HTML tombe sur un **commentaire de script en ligne** du `<head>` (« *le
ClientRouter remplace `<body>`* ») — le script lisait une balise sans attribut et
déclarait 449 CTA fautifs sur 449. Il repart donc de `</head>` et ne relève que
le CORPS du document. Même risque pour `<header>`/`<nav>`/`<footer>` et pour un
`<a href>` cité dans une chaîne de script : la découpe les règle tous.

> **Piège CloudCannon — les en-têtes de `routing.json` (2026-09-22).** Sa
> validation **fait ÉCHOUER le build**, pas un avertissement : « `'headers[2]
> .headers[5].name' Cache-Control is not a supported header name` ». Elle
> n'accepte qu'une liste restreinte d'en-têtes de sécurité. `public/_headers`
> garde ses blocs de cache `/_astro/*` et `/fonts/*` pour Cloudflare, mais
> `astro.config.mjs` les écarte de `routing.json` via la liste blanche
> `ENTETES_CLOUDCANNON` — jamais en silence, le build affiche la liste des
> en-têtes non repris. Les chemins concernés reçoivent quand même le socle de
> sécurité (CloudCannon applique la PREMIÈRE règle qui correspond, sans
> fusionner : sans cette recopie, `/_astro/*` n'aurait aucun en-tête).
> Ajouter un en-tête = l'ajouter à cette liste **après** l'avoir vérifié dans
> la documentation CloudCannon.

**Redirections de la migration (2026-09-22).** Deux listes alimentent
`_redirects` (et, au lot L15, `.cloudcannon/routing.json`) :

| Fichier | Qui l'écrit | Portée |
|---|---|---|
| `src/data/redirects.json` | l'éditrice, dans la collection « Redirections » | ses règles à la main ; **prioritaire** en cas de source en double |
| `src/data/redirects-migration.json` | **généré** par `npm run build:redirects` | la matrice WordPress → refonte (175 règles au 22 sept.) |

Les décisions de correspondance vivent dans
`docs/migration/correspondance-urls.json` (renommages voulus, anciennes URL
encore servies, pages non reprises, pages à recréer en 302). Tout le reste est
rapproché automatiquement par le champ `wpUrl` du contenu ou par le dernier
segment de l'URL, dans la même langue.

```powershell
npm run build:redirects              # régénère la matrice
npm run check:redirects              # CI : échoue si la matrice est périmée
                                     #      ou si une ancienne URL n'a pas de cible
node scripts/build-redirects.mjs --dist   # après un build : échoue si une
                                          # redirection pointe vers une page absente
python scripts/migration/check-parite-live.py   # compare le site EN LIGNE au dépôt
npm run check:parite-texte -- --strict          # après le build : le TEXTE de chaque page est-il arrivé ? (BLOQUANT)
```

Une **301 vers un 404 est pire qu'un 404** (la page d'origine perd son
référencement sans rien transmettre) : d'où le mode `--dist`, à jouer après le
build. Les règles à joker (`/expertise/*`) sont écrites **en dernier** dans
`_redirects` — la première correspondance gagne, et les règles exactes de la
migration doivent passer avant (`/expertise/securite-informatique` →
`/fr/services/cybersecurite`, et non vers un slug qui n'existe pas).

Sur Cloudflare Pages (infra héritée) le plafond de 100 règles de
`_routes.json` est désormais dépassé : l'intégration avertit et n'exclut du
worker que les premières sources. Sans effet sur la production CloudCannon.

**Ce qui s'applique VRAIMENT en production (2026-09-22).** L'hébergement
CloudCannon ignore `_redirects` et `_headers` : il lit `routing.json`. Le build
en écrit un à chaque fois — `dist/_cloudcannon/routing.json`, la forme
documentée par CloudCannon pour un fichier généré, prioritaire sur
`.cloudcannon/routing.json`. Rien à committer, rien à tenir en double :

- **375 routes** = 189 règles, dont **187 exactes émises sous leurs DEUX formes
  de barre oblique finale** (`/x` et `/x/`), plus 2 jokers. Les 189 : les 11
  d'`astro.config.mjs` (en `forced: true`, parce qu'Astro écrit à ces chemins
  une page de rafraîchissement méta et qu'une règle non forcée ne se
  déclencherait pas) + les 3 de l'éditrice + les 175 de la matrice. Le compte
  tombe à 375 et non 376 parce que la racine `/` n'a pas de variante.

  > **Pourquoi les deux formes (2026-09-22).** Sondage au `curl` du site dev :
  > **105 des 184 anciennes URL rendaient un 404.** Les règles existaient et
  > leurs cibles existaient — elles ne se déclenchaient jamais, parce que les
  > `from` partaient sans barre finale alors que l'hôte compare le chemin
  > EXACT et canonise VERS la barre (`/Decouvrir-Victrix` → 307
  > `/Decouvrir-Victrix/`). L'ancien site canonisait aussi vers la barre :
  > 100 % des URL indexées en portent une. Le « pourquoi » complet et la
  > logique testée sont dans `scripts/lib/routing-formes.mjs` ; après
  > correctif, 182 des 184 résolvent en un saut (les 2 restantes, `/cache/` et
  > `/xmlrpc.php/`, sont dans la liste `ignorer` assumée).

- **2 jokers**, traduits en `/expertise/(.*)` et `/en/expertise/(.*)`, et
  placés en DERNIER (positions 373-374) pour ne jamais masquer une règle
  exacte. Depuis le 2026-09-22 ils pointent vers le **hub** (`/fr/services`,
  `/en/services`) et non plus vers `:splat` : translittérer un chemin inconnu
  fabriquait des 301 vers des 404 — mesuré sur 17 anciennes URL du plugin
  WordPress, dont `/en/expertise/managed-security-service-provider/` et ses
  1 462 clics. Un filet doit mener à une page qui existe.
- **5 règles d'en-têtes** dérivées de `public/_headers`, qui reste la source
  unique. Elles sont **sans recouvrement** : le bloc `/*` est recopié dans
  chaque règle précise (`/fr/*`, `/en/*`, `/_astro/*`, `/fonts/*`, `/404.html`)
  et n'est jamais émis seul — selon que CloudCannon fusionne les règles ou
  garde la première, une page de `/fr/` perdrait sinon HSTS ou recevrait
  `nosniff, nosniff`, que Chrome rejette.

**À vérifier de l'extérieur après le premier déploiement** (la sémantique des
en-têtes n'est pas documentée chez CloudCannon) — d'abord sur le site dev :

```powershell
curl.exe -sI https://vocal-wren.cloudvent.net/fr/ | Select-String -Pattern "strict-transport|content-security|x-content-type"
curl.exe -sI https://vocal-wren.cloudvent.net/decouvrir-victrix/   # doit rendre 301 vers /fr/decouvrir
curl.exe -sI https://vocal-wren.cloudvent.net/expertise/securite-informatique/   # 301 vers /fr/services/cybersecurite
```

Si les en-têtes ne répondent pas : essayer `"match": "*"` (la forme de
l'exemple officiel) au lieu de `"/fr/*"` dans `reglesEntetes`
(`astro.config.mjs`) — c'est le seul point non tranché par la documentation.

**Accessibilité (2026-09-21).** `tests/e2e/accessibilite.spec.ts` passe
**axe-core** sur neuf pages, une par gabarit (accueil, liste de services,
service, formulaire de contact, catalogue, centre de ressources, carrières,
expertises, accueil anglais), avec les règles `wcag2a`, `wcag2aa`, `wcag21a`
et `wcag21aa`. C'est le moteur qui alimente l'onglet Accessibilité de
Lighthouse : **ce que ce test laisse passer, Lighthouse le note 100**.
L'inverse n'est pas vrai — Lighthouse n'exécute qu'un sous-ensemble des
règles — donc le garde-fou est volontairement plus strict que le score visé.
Il tourne avec les autres e2e (`npm run test:e2e`). Un échec nomme la règle,
son impact et le premier élément fautif.

Deux limites à connaître, qu'aucun outil ne mesure :

1. **Lighthouse Performance et SEO ne veulent rien dire sur le serveur de
   dev** (bundles non minifiés, HMR) : les mesurer sur un build de production
   ou sur le site déployé (vocal-wren), jamais sur `localhost:4321`.
2. axe ne juge ni l'ordre de tabulation réel, ni la pertinence des textes de
   remplacement.

**Typographie — plancher et unités (2026-09-21).** Deux règles, tenues par
`tests/e2e/typographie.spec.ts` (dans `npm run test:e2e`) :

1. **Aucun texte sous 14px.** Le site descendait à 10px (étiquettes de
   catégorie) et 12px (compteurs, surtitres). Écart assumé avec les maquettes
   du designer, qui descendent à 10px — arbitrage Gabriel.
2. **Tailles ET interlignes en `rem`**, jamais l'un sans l'autre : un texte
   qui grossit dans un `leading-[14px]` figé se chevauche. C'est ce qui rend
   enfin effectif le réglage « taille de police » du navigateur — le zoom
   (Ctrl +) marchait déjà, donc WCAG 1.4.4 passait et Lighthouse ne signalait
   rien : ce test couvre ce qu'aucun des deux ne mesure.

Les utilitaires Tailwind de base (`text-sm`, `text-base`…) étaient déjà en
`rem` ; c'étaient les jetons de `theme.css` (`--text-display` et compagnie) et
les valeurs arbitraires `text-[Npx]` / `leading-[Npx]` qui étaient en pixels.

Conversion mécanique et rejouable — à relancer après une fusion
`staging` → `dev`, une reprise de maquette ou un nouveau composant :

```
node scripts/migrate-typo-rem.mjs            # convertit
node scripts/migrate-typo-rem.mjs --check    # liste sans écrire (sortie 1 s'il reste du px)
```

Il ne touche PAS aux dimensions de boîte (`h-[]`, `w-[]`) : ce sont des choix
de mise en page. Point de vigilance qui reste manuel — un conteneur de texte à
hauteur FIXE déborde quand la police grossit ; les champs de saisie ont été
repris en `min-h-[…rem]`, à refaire pour tout nouveau gabarit.

**Changer la police du site :** le banc d'essai `?police=` / `?bleu=` a été
RETIRÉ le 2026-09-22 (lot L-polices) — le bleu est tranché, et la méthode pour
appliquer une police en une fois vit dans `docs/design/polices-et-bleu.md`
(piles `--font-sans` prêtes à coller, rapatriement local obligatoire pour la
Loi 25, et les deux specs à rejouer ensuite).

Rejouer seulement l'accessibilité :

```
npx playwright test tests/e2e/accessibilite.spec.ts
```

**Rapatrier la police (Hanken Grotesk) :**

```
node scripts/fetch-hanken-grotesk.mjs            # telecharge dans public/fonts/
node scripts/fetch-hanken-grotesk.mjs --check    # verifie la presence (sortie 1)
```

**Toujours en local, jamais un `<link>` vers Google.** Un `@font-face` servi par
`fonts.gstatic.com` envoie l'adresse IP du visiteur a un tiers AVANT tout
bandeau de consentement : la Loi 25 l'interdit, et la CSP de `public/_headers`
n'autorise pas ce domaine. Le script lit les URL dans la feuille que Google
genere, donc une nouvelle version se rapatrie sans le modifier ; il refuse tout
fichier dont la signature n'est pas `wOF2`.

Quatre fichiers (normal + italique x latin + latin-ext), 110 Ko au total, servis
**a la demande** par `unicode-range`. Seul `latin` est precharge dans
`BaseLayout` : il couvre la totalite du francais et de l'anglais.

**PLANCHER DE 16 px (2026-09-22).** Plus aucun texte sous 16 px. Le plancher est
STRUCTUREL, pas declaratif : `--text-xs` et `--text-sm` sont ecrases a `1rem`
dans le `@theme` de `theme.css`, donc une classe `text-sm` ecrite demain ne peut
plus repasser sous 16 px. Seule faille possible : une valeur ARBITRAIRE ecrite
en dur dans le balisage (`text-[0.875rem]`) — il y en avait 6, toutes relevees.
Garde-fou : `tests/e2e/typographie.spec.ts`.

**ÉCRANS TRÈS LARGES (2026-09-23).** Au-delà de **1920 px** de large, la racine
grandit progressivement jusqu'à **+25 %** à 2560 px, et le cadran suit parce
qu'il est désormais exprimé en `rem` (`--spacing-container-max: 120rem` dans
`theme.css`, `--container-max` dans `tokens.css`). Mesuré : à 2560 px la bande
passe de 1920 à **2400 px** et le corps de texte de 16 à **20 px** — la largeur
utile monte de 67 % à 86 % de l'écran. C'est exactement ce que Gabriel obtenait
en zoomant son navigateur à 125 %, le zoom dilatant lui aussi la typographie ET
le cadran.

Trois décisions à ne pas défaire :

1. **Interpolation continue, pas de media query à seuil.** Un seuil dur rend le
   zoom NON MONOTONE : sur un 2560, zoomer à 125 % donne un viewport de 2048
   (au-dessus du seuil, texte agrandi) mais zoomer à 150 % donne 1707 (en
   dessous — la règle se désarme et le texte RÉTRÉCIT quand on zoome).
   Verrouillé par le test « l'agrandissement des grands écrans est MONOTONE ».
2. **La borne basse est `100%`, jamais des `px`.** Poser `font-size: 16px` sur
   la racine annulerait le réglage « taille de police » du navigateur, que le
   lot L-typo avait justement rétabli.
3. **Aucune division de longueur par une longueur.** Le quotient de deux
   longueurs ne donne un nombre qu'avec CSS Values 4 (navigateurs 2024) : la
   formule ne divise que par un nombre — `(100vw - 1920px) / 160`.

La règle est **strictement sans effet à 1920 px et en dessous** : rien ne bouge
sur un portable. Mesures de référence des deux machines de Gabriel (2026-09-23) :
portable `innerWidth 1280, devicePixelRatio 1.5` ; grand écran
`innerWidth 2560, devicePixelRatio 1`. Garde-fous :
`tests/e2e/typographie.spec.ts` (paliers 1280 / 1920 / 2560 + monotonie) et
`tests/e2e/accessibilite.spec.ts` (axe rejoué **à 2560 px** sur 3 gabarits — les
62 autres specs tournent à 1280 et n'auraient jamais vu ce mode).

**Piège associé** : une hauteur FIGÉE en px qui contient du texte se met à
rogner quand la racine grandit. Deux corrigés le 2026-09-23
(`home-expertises`, `home-solutions` : `h-[…]` → `min-h-[…]`). Chercher
`h-\[[0-9]+px\]` avec `overflow-hidden` avant d'en ajouter un.

**Nettoyer une clé de fond RETIRÉE de la palette :**

```
node scripts/migrate-fonds-bleus.mjs            # réécrit le contenu
node scripts/migrate-fonds-bleus.mjs --check    # liste sans écrire (sortie 1)
```

**À rejouer après chaque fusion `staging` → `dev`**, comme
`migrate-fonds-chauds.mjs` et pour la même raison : l'éditrice écrit en
continu, et une session CloudCannon peut encore offrir une valeur qu'on vient
de retirer. C'est exactement ce qui a cassé le build de production le
2026-09-22 — `bleu-profond` retiré à 15 h 07, réécrit par une sauvegarde à
19 h 36. Le schéma TOLÈRE désormais les clés retirées (`FOND_ALIAS` dans
`component-library/src/shared/fonds.ts`, même mécanisme que
`LEGACY_ICON_ALIASES`) : le build ne casse plus, ce script ne fait que
nettoyer. **Retirer une valeur d'une liste fermée sans passer par `FOND_ALIAS`
est un changement cassant** — « zéro occurrence » au moment du retrait ne
prouve rien.

**Refabriquer les images de marque (favicon, logo du JSON-LD, image de partage) :**

```
npm run build:brand            # écrit les 7 fichiers dans public/
npm run build:brand -- --check # n'écrit rien, sort 1 si un fichier a dérivé
```

Tout dérive des DEUX SVG de `src/assets/victrix-logo-{fr,en}.svg`, eux-mêmes
normalisés depuis le kit officiel `02_Logos` (l'en-tête de chaque SVG liste
les trois seules modifications ; aucun tracé n'a été touché) :

| Fichier | Fabriqué à partir de |
| --- | --- |
| `favicon.svg` · `favicon.ico` (16/32/48) · `favicon-16x16.png` · `-32x32.png` | le « V » seul, blanc sur aplat Bleu Victrix `#002fc7` |
| `apple-touch-icon.png` (180) | idem, mais **plein bord** — iOS pose son propre masque arrondi |
| `images/logo-victrix.png` (1200×422) | logo FR complet, bleu nuit `#000d2e` sur blanc — c'est le `logo` du JSON-LD |
| `og-image.png` | la composition existante, dont SEUL le verrouillage du logo est remplacé |

**Ne pas retoucher ces fichiers à la main** : la commande les réécrirait.

Deux points à connaître. Le logo est **différent par langue** — la signature
est traduite (« Une marque » en FR, « Powered by » en EN) : `Logo.astro` prend
une prop `lang`, tout nouvel appel doit la passer. Et les hauteurs
`[--logo-height:…]` des en-têtes ont été relevées de 4 px au passage au kit
officiel : son verrouillage réserve plus de place à la signature, donc à
hauteur de boîte égale le mot-symbole rendait 20 px au lieu de 22. La hauteur
de l'en-tête, elle, n'a pas bougé (72 px — le plus haut élément de la barre
fait 44 px, pas le logo).

Ces commandes ne touchent ni `.astro/` ni `dist/` : elles se lancent sans
problème pendant qu'un `npm run dev` tourne.

### 3.1 — Si `npm run dev` tourne déjà (le cas courant)

Les trois dernières commandes du tableau ci-dessus touchent `.astro/` ou
`dist/` — **à exécuter dans une copie isolée**, pas dans le dépôt de travail,
si un `npm run dev` est actif (se vérifie : port 4321 en écoute). C'est le
contournement EBUSY déjà documenté en mémoire projet, formalisé ici :

```powershell
# 1. Copier le dépôt (sans .git/dist/.astro) vers un chemin court, HORS du
#    dépôt — voir le piège de robocopy plus bas avant d'adapter cette ligne.
robocopy "c:\Repo\Victrix\Demo-victrix" "C:\Users\<vous>\vvbuild" /E `
  /XD "c:\Repo\Victrix\Demo-victrix\.git" "c:\Repo\Victrix\Demo-victrix\dist" `
      "c:\Repo\Victrix\Demo-victrix\dist-static" "c:\Repo\Victrix\Demo-victrix\.astro"

# 2. Lancer les commandes dans la copie
cd C:\Users\<vous>\vvbuild
npm run type-check
npm run build
STATIC_ONLY=1 npm run build

# 3. Nettoyer une fois la vérification terminée
Remove-Item -Recurse -Force C:\Users\<vous>\vvbuild
```

**Deux pièges constatés en écrivant ce document (14 juillet 2026), les deux
avec le même symptôme (`astro check`/`build` échoue avec
`ERR_MODULE_NOT_FOUND`, `node_modules/astro/dist/` entier manquant dans la
copie) mais des causes différentes :**

1. **`/XD "dist"` (nom seul, sans chemin) exclut TOUS les dossiers `dist` du
   sous-arbre, pas seulement celui du dépôt** — y compris
   `node_modules/astro/dist/` et ceux de dizaines d'autres paquets (presque
   chaque paquet npm publie un `dist/`). Robocopy compte ça comme des
   répertoires « Ignoré », sans erreur. **Solution : toujours passer le
   chemin complet à `/XD`** (voir la commande ci-dessus), jamais juste le nom.
2. **`/MT` (copie multi-thread) a fait perdre des répertoires en silence** sur
   ce même dépôt, de façon reproductible, même une fois le piège n°1 corrigé
   pour un sous-ensemble — constaté en comparant une copie mono-thread
   (fiable) à une copie `/MT:16` du même dossier. **Solution : ne pas utiliser
   `/MT` pour copier `node_modules`** — plus lent (environ 1 min 30 pour ~460
   Mo / 35 000 fichiers en mono-thread sur cette machine), mais fiable.
   Le préfixe long-path `\\?\` a aussi été essayé et rejeté par cette version
   de robocopy (erreur de syntaxe sur le chemin source) — pas une solution ici.

**Toujours vérifier après coup** (les deux pièges ci-dessus échouent
silencieusement, sans « ÉCHEC » dans le résumé robocopy) :
`Test-Path C:\Users\<vous>\vvbuild\node_modules\astro\dist\cli\index.js`
doit renvoyer `True` avant de faire confiance à la copie.

## 4. Publier (commit + push + PR vers `staging`)

Aucun commit/push automatique — vous gardez la main sur l'historique Git.
Une fois le portail qualité vert, sur `dev` (ou une branche `feat/*`) :

```
git add <fichiers>
git commit -m "…"
git push origin dev
```

Puis **promotion vers l'édition** : PR GitHub `dev → staging` (CI vert requis ;
GitHub fusionne côté serveur, même si Julie a sauvegardé entre-temps — un
conflit réel se résout dans `dev` après `git merge origin/staging`). La fusion
déclenche le build du site d'édition (§5) ; relecture sur lawful-hare, puis
**Publish** (§6). Un correctif d'une ligne peut aller directement sur
`staging`, suivi d'un `git merge origin/staging` dans `dev`.

## 5. Ce qui se passe automatiquement après le push

- **CloudCannon — site d'édition (staging)** : tire le nouveau commit et
  reconstruit le site (`STATIC_ONLY=1 npm run build`, puis
  `.cloudcannon/postbuild` → `npx @bookshop/generate`) — c'est l'aperçu des
  éditeurs ET le site servi sur le domaine de test `lawful-hare.cloudvent.net`
  (en-tête `noindex` automatique). Voir §7. Rien ne part en production sans le
  bouton Publish (§6).
- **Cloudflare Pages (infra héritée du spike)** : tant que le projet
  `victrix-demo` reste connecté au dépôt, chaque push construit aussi une
  préversion de branche à `https://staging.victrix-demo.pages.dev` (et
  `https://dev.victrix-demo.pages.dev` pour la branche d'intégration)
  (build avec adaptateur — pas `STATIC_ONLY`). Conservée pour une raison
  précise : c'est le seul endroit où un vrai POST `/api/forms` peut tourner
  (§8) et où `_redirects`/`_headers` sont appliqués (contrainte routage :
  `docs/DEPLOYMENT.md` §6). À décommissionner au go-live.

### Vérifications après un push (exemples)

```
curl -I https://lawful-hare.cloudvent.net/fr/merci/
curl -I https://staging.victrix-demo.pages.dev/demo-redirection
```

Attendu : `/fr/merci/` → `200` avec `x-robots-tag: noindex` (le domaine de
test cloudvent est toujours noindex) ; `/demo-redirection` → `301` vers `/fr`
(la redirection éditée au CMS, `src/data/redirects.json`) — **sur la
préversion Cloudflare seulement** : l'hébergement CloudCannon ignore
`_redirects` (convention Netlify/Cloudflare) et lira `.cloudcannon/routing.json`
une fois généré (chantier go-live, `docs/DEPLOYMENT.md` §6).

## 6. Le bouton Publish — deux sites CloudCannon (staging → production)

Stratégie retenue (journal de décisions de `GUIDE-PROJET.md`, 17 juil. + 25
août) : CloudCannon est CMS **et** hébergeur. Deux sites CloudCannon sur le
même dépôt ; le vrai victrix.ca (WordPress) reste en ligne pendant toute la
transition.

| Étage | Branche | Site CloudCannon | URL |
|---|---|---|---|
| Édition (staging) | `staging` (ex-`spike/cloudcannon`, renommée le 2026-09-16) | « Victrix · Édition » (ex-« Vic-demo ») | `lawful-hare.cloudvent.net` |
| Production | `main` | créé le 2026-08-25 (mise en place ci-dessous) | `overt-pineapple.cloudvent.net` ; domaine réel au go-live |

Mise en place (une fois, dans l'UI CloudCannon) :

1. **Créer le site de production** : Add Site → même dépôt GitHub
   (`GabMercier/victrix-demo`) → branche `main`. Recopier les réglages de
   build du site d'édition : `STATIC_ONLY=1` (obligatoire, §7), sortie
   `dist`, même version Node. Tant que le premier Publish n'a pas eu lieu, ce
   site construit la démo pré-spike du 9 juillet (`main` est ~90 commits en
   retard) — apparence datée attendue, ignorer.
2. **Lier la publication** : sur le site d'édition → Site Settings → Files →
   Publishing → choisir le site `main` comme cible. Le bouton **Publish**
   apparaît alors pour les éditeurs.
3. **Premier Publish** : fusionne `staging` dans `main` et
   reconstruit le site de production. Sans aucun effet sur le vrai
   victrix.ca ; l'URL cloudvent de production est noindex de toute façon.

Au quotidien : **Save = staging ; Publish = production.** Retour arrière =
`git revert` du commit de fusion sur `main` (une publication CloudCannon est
une fusion Git ordinaire), puis reconstruction du site de production.

⚠️ **Limite connue tant que `STATIC_ONLY` n'est pas scindé** : ce drapeau
porte aujourd'hui DEUX choses — « build 100 % statique » ET la politique
« aperçu d'édition » (brouillons et articles à date future construits,
`src/i18n/blog.ts` ; fenêtres de dates des barres d'annonce ignorées,
`src/lib/announce.ts` ; Bookshop attaché). Le site de production CloudCannon
(construit `STATIC_ONLY=1`) hérite donc de ce comportement d'aperçu.
Acceptable pendant la transition (URL noindex, pas le vrai site) ;
**bloquant pour le go-live** — la scission (p. ex. un `EDITOR_PREVIEW=1`
posé seulement sur le site d'édition) est dans la liste go-live de
`docs/DEPLOYMENT.md` §7.

## 7. CloudCannon — où regarder

- **Journal de build** : dans le tableau de bord du site, chaque build liste
  ses étapes. Deux lignes à surveiller dans le postbuild
  (`npx @bookshop/generate`, source exacte : `@bookshop/generate/lib/
  live-connector.js`) :
  - `Added live editing to N page(s) containing Bookshop components` — sain,
    l'édition visuelle « clic sur composant » est branchée.
  - `No live editing connected as no pages contained Bookshop components` —
    régression : une page qui devrait rendre `<Page bookshop:live …>` ne le
    fait plus (voir `component-library/src/shared/astro/page.astro` et
    `src/pages/[lang]/campagnes/[slug].astro` — corrigé une première fois le
    14 juillet, commit `d541ec6`).
  - Ces deux lignes ne peuvent être observées que dans un **vrai build
    CloudCannon** : `npx @bookshop/generate` lancé seul (hors de
    l'environnement CloudCannon) s'arrête plus tôt avec « Could not find any
    output sites » — il cherche un fichier `_cloudcannon/info.json` que seul
    CloudCannon génère. Rien à corriger, c'est attendu en local.
- **Bouton Sync/Pull** : force CloudCannon à retirer le dernier commit avant
  le prochain build planifié — utile après un push si l'aperçu semble figé.
- **Piège « Building Locked »** : un interrupteur qui bloque tout nouveau
  build tant qu'il est actif (rencontré activé par défaut à la connexion
  initiale, voir `spike-cloudcannon.md`) — à vérifier en premier si un push
  ne déclenche aucun build.
- **Variable d'environnement obligatoire** : `STATIC_ONLY=1` (build settings)
  — sans elle, CloudCannon construit le worker Cloudflare et Bookshop ne se
  charge pas.
- **Téléversements** : chemin global `src/assets/uploads/` (`cloudcannon.
  config.yml`, clé `paths.uploads`, ajouté le 14 juillet 2026) — avant ce
  réglage, tout téléversement sans chemin propre à sa collection atterrissait
  à la racine du dépôt (`uploads/`, voir le fichier de test
  `uploads/yw3ziw8k83bh1.jpeg`, laissé committé — supprimable depuis le
  navigateur de fichiers CloudCannon si désiré, aucun code n'en dépend). Les
  champs image du blogue et de l'accueil gardent leur propre chemin relatif
  (inchangé, nécessaire pour `astro:assets`).
- **Partage** : Site Sharing (accès complet à l'éditeur) vs Client Sharing
  (lien de revue restreint) — Site Settings → Sharing. Domaine de test
  CloudCannon disponible pour prévisualiser sans exposer l'URL Cloudflare.

## 7bis. Publication planifiée (contenus programmés)

Un site statique n'applique les règles de dates **qu'au moment d'un build** —
la « planification » repose donc sur trois pièces (2026-07-30) :

1. **Ce qui se planifie déjà** :
   - **Articles de blogue** : une date FUTURE dans le champ « Date » = l'article
     est invisible des builds publiés jusqu'à sa date (les préversions et
     l'éditeur CloudCannon le montrent — même politique que les brouillons).
   - **Barres d'annonce (bibliothèque, 2026-08-20)** : collection « Barres
     d'annonce » (groupe Marketing) — une fiche par bannière
     (src/data/annonces/*.json), champs « Diffuser à partir de » / « Retirer à
     partir de ». Fenêtre [début, fin), heure UTC; vide = pas de borne. Une
     seule s'affiche à la fois : parmi les bannières « Affichée » dont la
     fenêtre couvre le build, la plus récemment COMMENCÉE gagne (startAt vide
     = « depuis toujours », perd contre toute bannière datée; égalité → nom de
     fichier) — sélection dans src/lib/announce.ts + pickActiveAnnounce
     (src/lib/schedule.ts, testé). Une date invalide casse le build (garde-fou
     zod, collection `annonces`). L'éditeur visuel montre toujours une
     bannière « Affichée ». Supprimer TOUTES les fiches est toléré (site sans
     bannière + avertissement glob au build) — en garder au moins une.
2. **Le rebuild quotidien** : `.github/workflows/rebuild-planifie.yml` (06:17
   UTC + bouton manuel dans l'onglet Actions). **Branchement OPS requis une
   fois** : créer le secret GitHub `REBUILD_HOOK_URL` avec un build hook
   CloudCannon **du site de production** (site `main` → Site Settings →
   Builds → Build Hooks) — c'est le site publié qui doit ré-appliquer les
   fenêtres de dates chaque jour ; le site d'édition se reconstruit déjà à
   chaque Save. (Nécessite que le site de production existe — §6.) Sans
   secret, le workflow tourne à vide sans échouer.
3. **Granularité** : un passage par jour. Pour une parution à heure précise,
   lancer le workflow manuellement (Actions → « Reconstruction planifiée » →
   Run workflow) ou ajouter un second cron.

Étendre la planification à d'autres surfaces (sections de l'accueil, campagnes)
= réutiliser `src/lib/schedule.ts` + deux champs de dates (patron de la
bannière); chantier au backlog (P-23, plan-prompts.md).

## 7ter. Activer formulaires + analytics (les clés — OPS, après la décision « backend formulaires »)

La CSP (`public/_headers`) autorise **depuis le 2026-08-17** Turnstile
(`challenges.cloudflare.com`) et GA4 (`googletagmanager.com`,
`*.google-analytics.com`) — les clés peuvent donc être posées sans autre
changement de code. Tout est **inerte tant que les variables sont absentes** :
sans clés, le site est strictement identique.

**Où poser les clés (mis à jour 2026-08-25, production = CloudCannon)** :
l'hébergement CloudCannon est 100 % statique — le endpoint `/api/forms` (une
Pages Function Cloudflare) n'y tourne pas. Répartition :

- **`PUBLIC_GA4_ID`** : variable de build du **site CloudCannon de
  production** (site `main` → Site Settings → Builds). Posable dès que ce
  site existe — balises gelées, elles ne s'exécutent qu'après le
  consentement Loi 25.
- **Les 6 clés formulaires** (le reste du tableau) : **décision prise le
  2026-08-25 — spike CloudCannon Forms d'abord, fallback Worker Cloudflare.**
  Le spike (~0,5 j, `docs/plan-convergence-migration.md` Phase 4) vérifie :
  destinataire par formulaire, redirect `/merci` PAR LANGUE, stockage des
  soumissions au dashboard, anti-pourriel + impact CSP, case Loi 25, tokens
  `{{page.*}}`/`{{url.*}}`. Points à ne pas perdre silencieusement (forces
  du `/api/forms` actuel) : validation serveur des requis, whitelist des
  `select`, sujet résolu de la définition, courriel de confirmation
  visiteur (P-08). Si un point bloque → fallback : Worker Cloudflare dédié
  réutilisant `src/pages/api/forms.ts` + SMTP2GO tel quel (une modif alors
  requise : 303 `/merci` en URL ABSOLUE vers le site de production, sinon
  le visiteur reste sur le domaine du worker). Les 6 clés atterrissent là
  où le spike conclut. **État des comptes au 2026-08-25 : NI SMTP2GO NI
  Turnstile créés** (voir « Où créer les comptes/clés » ci-dessous). En
  attendant, la vérification de bout en bout reste possible sur la
  préversion Cloudflare `victrix-demo.pages.dev` (poser les clés dans
  Pages → redéployer). **Sur un build CloudCannon, ne jamais poser `PUBLIC_FORMS_ENABLED=1`**
  (hébergement statique, aucun `/api/forms`) — poser
  `PUBLIC_FORMS_ENABLED=inbox` + `PUBLIC_FORMS_INBOX_KEY=<clé>` une fois une
  boîte de réception (Inbox) attachée au site (spike démarré le 2026-09-16 sur
  le site dev, boîte `dev-marketing-contact`).

Référence des variables (inchangée) :

| Variable | Valeur | Effet |
|---|---|---|
| `PUBLIC_FORMS_ENABLED` | `1` ou `inbox` | `1` : vrais formulaires POST vers `/api/forms` (worker) ; `inbox` : vrais formulaires POST captés par les boîtes de réception CloudCannon du site (action = page Merci) — **c'est la valeur pour les sites CloudCannon** |
| `PUBLIC_FORMS_INBOX_KEY` | clé de la boîte (ex. `dev-marketing-contact`) | Mode `inbox` : boîte par défaut du site ; un formulaire peut la surcharger (champ « Boîte de réception CloudCannon ») |
| `PUBLIC_TURNSTILE_SITE_KEY` | clé de site Turnstile | Widget anti-pourriel affiché |
| `TURNSTILE_SECRET_KEY` | clé secrète Turnstile | Vérification serveur du jeton |
| `SMTP2GO_API_KEY` | clé API SMTP2GO | Envoi réel des courriels |
| `FORMS_FROM_EMAIL` | expéditeur **vérifié** dans SMTP2GO | Adresse d'envoi |
| `FORMS_TO_EMAIL` | boîte de réception équipe | Destinataire par défaut (un formulaire peut la surcharger) |
| `PUBLIC_GA4_ID` | `G-XXXXXXXXXX` | Balises GA4 **gelées** émises ; elles ne s'exécutent qu'après acceptation du bandeau Loi 25 |

Où créer les comptes/clés : Turnstile → tableau de bord Cloudflare → Turnstile
→ Add site (domaine final + domaine de test au besoin — le service Turnstile
est indépendant de l'hébergeur) ; SMTP2GO → Settings → API Keys + Sender
domains (vérifier le domaine de `FORMS_FROM_EMAIL`) ; GA4 → admin Google
Analytics → propriété → flux Web → ID de mesure. Après la pose : reconstruire
(build hook ou push) — les variables ne s'appliquent qu'aux builds suivants.

Vérifications (sur l'URL de test du backend formulaires retenu) : widget
Turnstile visible sous le formulaire ; soumission → `/fr/merci/` + courriel
reçu ; **aucune requête google-analytics avant d'accepter le bandeau**,
requêtes `collect` après acceptation (onglet Réseau) ; GA4 DebugView montre
les événements.

## 8. Dépannage

| Symptôme | Cause | Solution |
|---|---|---|
| `EPERM … rename '.astro\content-assets.mjs.tmp'` | Build/`astro check` lancé pendant que `npm run dev` tourne (même cache `.astro/`) | Arrêter `npm run dev`, ou vérifier dans une copie isolée (§3.1) |
| `astro check`/`build` échoue avec `ERR_MODULE_NOT_FOUND` dans une copie isolée, `node_modules/astro/dist/` manquant | `/XD "dist"` (sans chemin complet) exclut tous les `dist/` du sous-arbre, y compris ceux de `node_modules` ; `/MT` peut aussi perdre des répertoires en silence | Voir §3.1 — chemins `/XD` complets, pas de `/MT` sur `node_modules`, vérifier `node_modules\astro\dist\cli\index.js` après coup |
| `npx @bookshop/generate` local dit « Could not find any output sites » | Normal hors de CloudCannon — cherche `_cloudcannon/info.json`, généré seulement par leur environnement de build | Rien à corriger ; se fier au journal de build CloudCannon (§7) pour cette vérification précise |
| Build CloudCannon rouge à l'étape `postbuild` (Bookshop) : `Expected "*/" to terminate multi-line comment` sur un composant `.astro`, alors que `npm run build` est vert | Une balise script **ouvrante** écrite en toutes lettres (chevron + `script`) dans un commentaire du composant : `@bookshop/astro-engine` retire les scripts par regex (`<script…>…</script>`, `builder.js`) AVANT de compiler, et la correspondance part de ce faux départ jusqu'au premier vrai `</script>` du fichier — la fermeture `*/` du commentaire disparaît avec (2026-09-17, `solutions-catalogue.astro`) | Écrire « balise script » en toutes lettres dans les commentaires des composants Bookshop (`component-library/`) ; une paire ouvrante + fermante sur la même ligne est tolérée mais fragile. `npm run check:bookshop` (§3, CI) rejoue l'étape localement et nomme le composant fautif |
| Content Editor de CloudCannon affiche une page blanche | Normal pour les landings (frontmatter seul, pas de corps markdown) | Basculer sur l'éditeur **Visuel** via les icônes en haut à droite |
| Palette de sections avec des doublons | `_structures.sections` écrit à la main en double avec les entrées générées par `@bookshop/generate` | Ne jamais lister les sections vous-même dans `cloudcannon.config.yml` — seules les clés `style`/`remove_extra_inputs` sont à nous, voir le commentaire au-dessus de `_structures.sections` |
| Redirection CMS servie en `200` au lieu de `301` | `_routes.json` (adaptateur Cloudflare) n'exclut pas la source — le worker (`include: "/*"`) intercepte avant `_redirects` | Déjà corrigé dans `astro.config.mjs` (intégration `victrix:redirects`, exclusion automatique) — si ça revient, vérifier que le build de prod (pas `STATIC_ONLY`) a bien tourné après l'ajout d'une redirection |
| `/api/forms` répond `405` sur le domaine de test CloudCannon | Attendu : le build `STATIC_ONLY` ne peut émettre qu'un stub GET statique pour cette route (pas de Pages Function en dehors de Cloudflare) | Rien à corriger — tester le vrai POST sur une préversion de branche Cloudflare (infra héritée du spike, §5), pas sur CloudCannon |
| Widget Turnstile absent malgré `PUBLIC_TURNSTILE_SITE_KEY` posée | Avant 2026-08-17 : la CSP ne listait pas `challenges.cloudflare.com`. C'est **appliqué** depuis (voir §7ter) — si le widget manque encore, vérifier que le build servi date d'après la pose des variables | Redéployer après la pose des clés ; vérifier la console navigateur pour un éventuel blocage CSP résiduel |
| Un fichier texte édité en PowerShell (`.gitignore`, `.env`…) devient illisible / git le traite comme binaire | `>>`/`echo "…" >> fichier` en PowerShell écrit en **UTF-16LE** par défaut ; ajouté à un fichier existant en UTF-8, ça corrompt le fichier (rencontré sur `.gitignore` le 14 juillet 2026 — `git diff` l'a montré en « Bin » au lieu d'un diff texte) | Éditer avec un éditeur de texte, ou `Add-Content -Encoding utf8`/`Set-Content -Encoding utf8` — jamais `>>` nu sur un fichier UTF-8 existant |

## 9. Fichiers liés

| Fichier | Rôle |
|---|---|
| `docs/DEPLOYMENT.md` | Hébergement CloudCannon (staging → production), infra Cloudflare héritée, contraintes de routage, liste go-live |
| `docs/spike-cloudcannon.md` | Réglages CloudCannon à la connexion + grille de gate à 8 critères |
| `docs/options-editeur-hebergement.md` | Ce qui dépend de CloudCannon vs ce qui est portable (Tina/Sveltia, Azure) |
| `docs/formulaires.md` | Variables d'environnement des formulaires, CSP Turnstile |
| `.cloudcannon/postbuild` | Le script qui lance `npx @bookshop/generate` sur les builds CloudCannon |
