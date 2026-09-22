# Plan de redirection du trafic : ancien site vers la refonte

> Lot L14, passe de préparation du 2026-09-22. **Aucun code n'a été modifié.**
> Ce document dit ce qu'on va faire et pourquoi ; la mise en œuvre est la passe
> suivante. Le registre des adresses, lui, est déjà produit :
> [`docs/inventaire-pages.md`](../inventaire-pages.md).
>
> **Suite du 2026-09-22 (après-midi)** : le classeur d'URL de Julie propose une
> RÉORGANISATION de l'arborescence qui change 39 des 175 cibles de la matrice.
> Lire [`revue-classeur-julie.md`](revue-classeur-julie.md) **avant** d'engager
> l'étape 1 — elle confirme que le correctif de la barre finale est réutilisable
> tel quel (il agit sur le champ `de`, des chemins WordPress gelés), corrige le
> § 9 ci-dessous, et ajoute une décision à l'étape 1 (le sort du joker).

## 1. Ce que la passe a trouvé, en une phrase

Les règles de redirection existent presque toutes et leurs cibles existent
toutes — mais elles sont écrites **sans la barre oblique finale**, alors que
l'hébergement compare l'adresse exacte, barre comprise. **105 des 184 adresses
de l'ancien site rendent un 404** sur le site déployé aujourd'hui.

Ce n'est pas une accumulation de petits oublis. C'est **une seule décision de
conception**, appliquée deux fois dans le code, et son correctif fait une
dizaine de lignes.

### La mesure

Balayage des adresses telles qu'elles circulent — avec leur barre finale, parce
que c'est la forme que Google a indexée — contre le site CloudCannon déployé
`https://vocal-wren.cloudvent.net`, le 2026-09-22 :

| Jeu d'adresses | Total | Aboutit (200) | Ne mène nulle part |
| --- | --- | --- | --- |
| Plan de site en ligne | 150 | 77 | **73** |
| Union inventoriée (plan de site + export WordPress + décisions) | 184 | 79 | **105** |
| Clés de `correspondance-urls.json` (les renommages voulus) | 32 | 0 | **32** |
| Sources du plugin Redirection de WordPress | 85 | 1 | **84** |

Parmi les 105 : **10 sont des redirections qui aboutissent sur une page
absente**, ce qui est pire qu'un 404 — Google suit la redirection, ne trouve
rien, et l'ancienne page perd son référencement sans rien transmettre.

### Pourquoi personne ne l'avait vu

Trois garde-fous tournent au vert et aucun ne pose cette question :

| Garde-fou | Ce qu'il prouve | Ce qu'il ne regarde pas |
| --- | --- | --- |
| `check:redirects --dist` | les 175 cibles de la matrice existent dans `dist/` | si la règle **se déclenche** pour l'adresse réelle |
| `check:links --strict` | 0 lien cassé sur 15 431 liens **internes** | les liens **entrants**, qui viennent de l'extérieur |
| `check-parite-live.py` | quelle page du dépôt correspond à quelle URL en ligne | ce que l'hébergement **répond** |

Tous les trois valident la matrice — les règles qu'on écrit. Aucun ne valide le
parcours — ce que reçoit un visiteur. C'est exactement le garde-fou manquant
que ce lot doit produire.

## 2. La mécanique, telle qu'elle est mesurée

Quatre comportements de l'hébergement, tous vérifiés au `curl` et aucun
documenté dans le dépôt :

1. **La comparaison est exacte, barre comprise.**
   `/decouvrir-victrix` → 301 (la règle marche) ·
   `/decouvrir-victrix/` → **404** (la même adresse avec sa barre).
2. **L'hôte canonise *vers* la barre, pas dans l'autre sens.**
   `/Decouvrir-Victrix` → 307 vers `/Decouvrir-Victrix/`. La normalisation
   existe, mais elle va dans le sens qui ne nous sauve pas.
3. **L'ancien site canonise aussi vers la barre.**
   `www.victrix.ca/contact` → 301 vers `/contact/`. Donc **100 % des adresses
   indexées portent la barre.** C'est la conjonction de 1 et 3 qui fait mal.
4. **Les paramètres de requête sont ignorés dans la comparaison et recopiés.**
   `/decouvrir-victrix?utm_source=nl` → 301 avec le paramètre conservé.
   `?utm_`, `?fbclid=`, `?gclid=` ne sont donc **pas** un sujet.

### D'où vient la barre manquante

Deux endroits, la même intention :

- [`scripts/build-redirects.mjs:88`](../../scripts/build-redirects.mjs#L88) —
  `sansBarre()`, appliqué ligne 229 aux **deux** champs `de` et `vers` ;
- `astro.config.mjs:409-414` — « Normalize internal destinations to the
  adapter's slash-less form ».

La normalisation était juste pour les **destinations** (l'adaptateur Cloudflare
l'attend) et fausse pour les **sources**.

### L'ironie du joker

Les 71 adresses qui fonctionnent aujourd'hui ne fonctionnent **que par
accident**. Ce sont les `/expertise/...`, et ce n'est pas leur règle précise qui
les capte — c'est le joker de fin de liste `/expertise/(.*)`, dont la capture
`$1` avale la barre finale au passage.

Conséquence : le joker **écrase** les règles précises qui existaient justement
pour le battre, et il translittère sans connaître les renommages. D'où les 10
redirections vers une page absente — les 9 renommages `securite-informatique` →
`cybersecurite` et compagnie, plus `documents-o-bureau`.

> **À retenir :** le mécanisme qu'on pourrait croire dangereux est le seul qui
> marche, et il marche pour la mauvaise raison. Une fois la barre corrigée, les
> règles précises reprendront la main — y compris les 10 qui échouent.

## 3. Un défaut indépendant : deux redirections vers la mauvaise page

Celui-ci n'a rien à voir avec la barre finale, et **aucun garde-fou ne peut le
voir** puisque la page d'arrivée existe :

| Adresse ancienne | Part vers | Devrait aller vers |
| --- | --- | --- |
| `/expertise/productivite/servicenow/` | `/fr/services/approvisionnement-ti/servicenow/` | `/fr/services/productivite/servicenow/` |
| `/en/expertise/productivity-consulting/servicenow/` | `/en/services/it-procurement/servicenow/` | `/en/services/productivity-consulting/servicenow/` |

**Cause :** `build-redirects.mjs` rapproche par **dernier segment d'URL**, avec
« le premier trouvé gagne ». `servicenow` existe dans deux catégories ; c'est
`approvisionnement-ti` qui sort premier de la lecture du dossier.

Trois segments sont ambigus aujourd'hui : `servicenow` (le vrai défaut),
`o-bureau` (rattrapé par `wpUrl`, correct), `demo-sections` (pages de démo,
sans adresse ancienne). Le correctif tient en deux parties : comparer le
**chemin complet** avant de se rabattre sur le dernier segment, et **refuser**
un rapprochement quand le segment est ambigu, au lieu d'en choisir un.

## 4. Les changements d'architecture, famille par famille

C'est la partie que tu voulais voir couverte en entier. Six familles.

| # | Ancien motif | Nouveau motif | Combien | Transformation |
| --- | --- | --- | --- | --- |
| 1 | `/expertise/<cat>/<page>/` | `/<lang>/services/<cat>/<page>/` | 85 | **mécanique** sauf 10 |
| 2 | `/<slug>/` et `/en/<slug>/` (racine) | `/<lang>/ressources/<slug>/` | 76 | **une règle par article** |
| 3 | `/document/<slug>/` | `/<lang>/campagnes/…` ou `/ressources/` | 5 | cas par cas |
| 4 | `/solution/<slug>/` | `/<lang>/services/…` | 6 | cas par cas |
| 5 | pages uniques renommées | `/<lang>/<nouveau-slug>/` | 20 | cas par cas |
| 6 | rubriques **neuves** | `/solutions/`, `/secteurs/`, `/produits/`… | — | rien à capter |

### Famille 1 — expertise devient services

Le segment de catégorie est **identique** dans les deux architectures pour les
7 catégories FR et les 7 EN. Un joker suffirait donc… sauf pour deux
renommages de génération plus ancienne :

| Ancien segment | Nouveau segment |
| --- | --- |
| `securite-informatique` | `cybersecurite` |
| `managed-security-service-provider` | `cybersecurity` |

Plus 8 pages renommées individuellement (`loi-25-etes-vous-en-conformite` →
`conseil-strategique/conformite-loi-25`, `fournisseur-services-geres-ti` →
`services-ti-geres`, `plateforme-employe-microsoft-viva-365` →
`plateforme-employe-intranet`, etc.).

**Ces 10 cas sont exactement les 10 redirections qui aboutissent sur un 404.**
Ce n'est pas une coïncidence : ce sont les seuls où le joker et la règle précise
divergent, donc les seuls que l'écrasement rend visibles.

### Famille 2 — les articles quittent la racine

76 adresses. Le joker est **impossible** : la racine de l'ancien site héberge à
la fois les 64 articles et une vingtaine de pages. Il faut une règle par
article — elles existent déjà, elles souffrent seulement de la barre.

### Famille 6 — attention au piège inverse

`/fr/expertises/` (avec un S) et `/fr/services/` **coexistent** dans la refonte.
Et trois adresses de l'ancien site vivent **sous** `/fr/services/`, qui est le
préfixe du nouveau site : `/fr/services/nsx/`, `/fr/services/bilan-securite/`,
`/fr/services/ems/`. Elles ne peuvent pas être redirigées par un joker sur
`/fr/services/` sans casser le site : il faut des règles nominatives.

## 5. Ce que l'inventaire ne voit pas — et qu'il faut trancher

Le périmètre retenu (union du plan de site en ligne et de l'export WordPress)
laisse passer **quatre familles**. Toutes répondent `200` sur le site actuel.

### 5.1 Les 98 redirections du plugin WordPress — 41 381 clics mesurés

[`docs/migration/redirections.csv`](redirections.csv) contient les règles du
plugin Redirection, **avec leur compteur de clics**. Ce fichier est *produit*
par `scripts/migration/build-inventory.mjs` et **lu par aucun script de
redirection**.

Ces règles vivent dans WordPress. Le jour où WordPress s'éteint, elles
s'éteignent avec lui. Sur les 98 entrées, 85 portent un chemin (les 13 autres
sont des règles de « slug » sans adresse et sans compteur). Sondage sur le site
déployé : **84 des 85 ne mènent nulle part — 40 739 clics sur 41 381.**

Les plus gros volumes perdus :

| Clics | Adresse | État mesuré |
| --- | --- | --- |
| 4 144 | `/solution/centre-operationnel-de-securite/` | 404 |
| 3 523 | `/en/solution/scalable-security-operations-center/` | 404 |
| 3 025 | `/en/solution/o-studio/` | 404 |
| 2 732 | `/solution/migration/` | 404 |
| 2 699 | `/en/solution/migration/` | 404 |
| 2 190 | `/expertise/securite-informatique/` | **301 vers un 404** |
| 2 020 | `/solution/studio/` | 404 |
| 1 462 | `/en/expertise/managed-security-service-provider/` | **301 vers un 404** |
| 1 363 | `/en/expertise/it-managed-services-provider/` | **301 vers un 404** |
| 1 174 | `/en/capacites-ia-servicenow/` | 404 |
| 1 094 | `/expertise/fournisseur-services-geres-ti/` | **301 vers un 404** |

Familles concernées : `/solution/*` et `/en/solution/*` (génération
pré-2023), `/fr/*` (préfixe Polylang : `/fr/nouvelles/`,
`/fr/equipe-direction/`, `/fr/solutions/`, `/fr/nous-joindre/`), et 18 anciens
communiqués à la racine — exactement le genre de page citée par des médias.

Sept d'entre elles vivent **sous les préfixes du nouveau site**, ce qui interdit
tout joker : `/fr/services/nsx/` (190), `/fr/services/bilan-securite/` (187),
`/fr/services/ems/` (73), `/fr/solutions/plateforme-sociale-entreprise/` (643),
`/fr/solutions/guichet-reinitialisation-mot-de-passe/` (349),
`/fr/expertise/infrastructure/` (171), `/fr/expertise/securite/` (128). Noter
aussi que les jokers sont `/expertise/(.*)` et `/en/expertise/(.*)`, **pas**
`/fr/expertise/(.*)` : les deux dernières ne sont captées par rien.

> **Piège à ne pas reproduire :** la cible écrite dans `redirections.csv` est
> une adresse de **l'ancien** site (parfois absolue,
> `https://www.victrix.ca/...`). Il faut réécrire la cible **finale** de la
> refonte, sinon on crée des chaînes. Et `/fr/` → `/` ne doit **pas** être
> reprise : sur la refonte, `/fr/` *est* l'accueil et `/` → `/fr` existe déjà —
> ce serait une boucle.

**Décision attendue : charger ce fichier comme quatrième source de la matrice,
ou assumer la perte ?** Recommandation : le charger, en priorisant par clics.
Deux documents du dépôt se contredisent là-dessus
(`plan-parite-et-raffinage.md:139` contre `seo-strategie.md:89`), il faut
trancher une fois.

### 5.2 Les URL systémiques de WordPress

`scripts/migration/check-parite-live.py:47-48` **saute délibérément** les
sous-plans de site `category` et `author`. `urls-live.csv` est donc un plan de
site filtré. Vérifié en ligne aujourd'hui :

| Famille | Combien | Ancien site | Site déployé | Proposition |
| --- | --- | --- | --- | --- |
| `/categorie/*`, `/en/category/*` | 7 | 200 | **404** | 301 vers `/<lang>/ressources/` |
| `/auteur/*` | 3 | 200 | **404** | 301 vers `/<lang>/ressources/` |
| `/feed/`, `/en/feed/` | 2 + un par catégorie | 200 | **404** | 301 vers `/<lang>/rss.xml` (il existe déjà) |
| `/ressources/page/N/` | ~7 | 200 | **404** | 301 vers `/<lang>/ressources/` |
| `/sitemap_index.xml`, `/post-sitemap.xml`… | 6 | 200 | **404** | 301 vers `/sitemap-index.xml` |
| `/wp-json/*` | — | 200 | **404** | laisser en 404 |
| `/xmlrpc.php` | 1 | 403 | 404 | rien à faire |

Les 7 archives de catégories, nominativement : `/categorie/nos-actualites/`,
`/categorie/articles/`, `/categorie/livres-blancs/`, `/categorie/videos/`,
`/en/category/posts/`, `/en/category/our-news/`, `/en/category/videos/`.

Le `/sitemap_index.xml` mérite une mention : **c'est l'adresse enregistrée dans
Google Search Console depuis des années** (Yoast, avec un souligné), et la
refonte sert `/sitemap-index.xml` (avec un trait d'union). Une règle d'une
ligne évite une erreur de couverture pendant toute la transition.

### 5.3 Les fichiers téléversés

`urls-medias.csv` catalogue 943 fichiers, **dont 43 PDF** ; `dist/wp-content`
en conserve 174. Sondage de 9 adresses du catalogue : **les 9 rendent 404 sur le
site déployé**, alors que sur l'ancien site les images répondent 200 et les PDF
répondent 200 ou 403 (les téléchargements sous condition).

Les images pèsent peu : elles ne comptent que pour des pages tierces qui les
affichent encore. Les **43 PDF** sont un autre sujet — un PDF est un document
indexé par Google, envoyé par courriel et cité dans des appels d'offres.

Les médias étaient hors périmètre de l'inventaire, ce qui se défend. Mais
**aucune autre étape ne les couvre**, donc le plan doit porter la décision :
conserver les chemins, ou une 410 assumée sur `/wp-content/uploads/(.*)`.
Recommandation : traiter les **43 PDF** nominativement et assumer le reste.

### 5.4 L'hôte canonique — hors de la matrice, mais capable de tout annuler

`astro.config.mjs:826` code en dur `site: 'https://victrix-demo.pages.dev'`.
Les `canonical`, les `hreflang` et le plan de site partent donc vers le domaine
de démonstration. Mesuré sur l'ancien site : `http://www.victrix.ca` → 301 vers
`https://www.victrix.ca` et `https://victrix.ca` → 301 vers
`https://www.victrix.ca`. **L'hôte canonique historique est `www` + `https`.**

Trois décisions, qu'aucun document ne porte aujourd'hui, et qui ne relèvent
**pas** de `routing.json` (il ne compare qu'un chemin) :

1. quelle valeur de `site` au lancement, et qui la pose (variable de build
   CloudCannon ou code) ;
2. apex → `www` ou l'inverse, et par quel mécanisme (DNS / hôte) ;
3. `http` → `https`.

Si l'un des trois manque au basculement, le référencement se scinde en deux
hôtes — indépendamment de la qualité de la matrice.

## 6. Un avertissement de méthode : `dist/` n'est pas la production

`docs/DEPLOYMENT.md:44` est explicite : les deux sites CloudCannon buildent en
`STATIC_ONLY=1`. Le `dist/` présent dans le dépôt est un build **avec
l'adaptateur Cloudflare** (`_worker.js`, `_routes.json`). Les deux sorties
diffèrent : `/contact/` rend `200` avec un `<meta http-equiv="refresh">` sur le
site déployé, alors que `dist/contact/index.html` n'existe pas.

Conséquences pour la suite :

- l'inventaire du nouveau site (185 pages) est mesuré sur une sortie qui n'est
  pas celle de production — l'ordre de grandeur est bon, le détail est à
  reconfirmer ;
- 4 des 6 adresses qui rendent `200` ne sont pas des pages mais des **pages de
  rafraîchissement méta** — dégradées pour le référencement ;
- le garde-fou doit tourner sur une sortie `STATIC_ONLY`, et un mode « sonde le
  site déployé » n'est pas un luxe : c'est le seul qui dit la vérité.

## 7. Ce qu'on fait, dans l'ordre

Rien de ce qui suit n'est engagé : c'est la proposition.

### Étape 1 — corriger la barre finale (le correctif qui rend 105 adresses)

Émettre **les deux formes** de chaque `from` dans `routing.json` : sans barre et
avec. 187 règles exactes → 374 routes. Une dizaine de lignes dans
`astro.config.mjs`, là où se remplit la liste des routes exactes.

Pourquoi les deux formes plutôt qu'un motif tolérant `(/?)$` : le motif ajoute
un groupe de capture qui décale la numérotation de `$1`, et le dépôt lui-même
hésite entre « motif glob » et l'exemple officiel en `(.*)`. Les deux formes
sont bêtes et sûres.

Point à vérifier avant : **le plafond de routes** de `routing.json` n'est pas
documenté. Un essai à 374 routes sur le site dev tranche en un déploiement.

**Ajout du 2026-09-22 : trancher le sort du joker dans la même passe.** Le joker
`/expertise/(.*)` est aujourd'hui ce qui fait fonctionner 71 adresses **et** ce
qui fabrique les 10 « 301 vers un 404 » — une fois les deux formes émises, les
82 règles précises reprennent la main et il n'a plus d'utilité. Sous
l'architecture proposée par Julie il devient franchement nuisible (sa
transformation ne donne la cible voulue que 2 fois sur 37). Deux options : le
**supprimer**, ou le **re-pointer vers le hub `/services/`** comme filet neutre.

### Étape 2 — corriger les rapprochements par dernier segment

Chemin complet d'abord, dernier segment en repli, et **refus** quand le segment
est ambigu. Corrige les 2 `servicenow` et empêche la récidive.

### Étape 3 — le garde-fou `scripts/check-old-urls.mjs`

Deux modes, parce que deux questions différentes :

- **hors ligne** (CI) : résout les adresses contre
  `dist/_cloudcannon/routing.json` dans l'ordre réel, en comparaison **exacte**,
  et vérifie la cible dans `dist/`. Prouve la matrice.
- **`--live <base>`** : balaie les adresses telles qu'elles circulent, suit
  jusqu'à 5 sauts, compare le code final. Prouve le parcours.

Sortie : `docs/migration/validation-301.md`, verdict chiffré en première ligne.
**Première passe en rapport seul, code de sortie 0** — tu tranches les douteux,
la liste d'exceptions s'écrit, puis le script passe bloquant au gate et en CI
(même marche que `check:prefill`).

Les quatre prototypes de cette passe sont fonctionnels et servent de brouillon.

### Étape 4 — trancher les décisions ouvertes

Récapitulées au § 8.

### Étape 5 — régénérer le registre et vérifier

Régénérer `docs/inventaire-pages.md`, rejouer `check-parite-live.py` (son
rapport date du 21/09, donc d'avant L05 et L15), et refaire la sonde. La cible
est simple : **0 adresse morte parmi les adresses inventoriées.**

## 8. Les décisions qui t'appartiennent

| # | Décision | Recommandation |
| --- | --- | --- |
| 1 | Barre finale : émettre les deux formes, ou un motif tolérant ? | **les deux formes** — déterministe, et ça rend les 10 règles écrasées |
| 2 | Charger `redirections.csv` (41 381 clics) comme 4ᵉ source ? | **oui**, par ordre de clics décroissant |
| 3 | Les URL systémiques (`/categorie/`, `/feed/`, pagination, ancien plan de site) ? | **oui**, ~25 règles, dont le plan de site qui protège Search Console |
| 4 | Les `/wp-content/uploads/` : conserver les chemins ou 410 assumée ? | à trancher — les **PDF** sont le vrai enjeu, pas les images |
| 5 | Les 5 redirections 302 partent-elles en 302 ? | **non pour les 2 `check-point`** (cible définitive → 301) ; 302 pour les 3 `/document/` **avec une date**, sinon 301 |
| 6 | Les destinations doivent-elles porter la barre (un saut de moins) ? | un `curl -sIL` sur le site dev tranche ; sans conséquence si l'hôte répond 200 direct |
| 7 | Hôte canonique : valeur de `site`, apex ↔ `www`, `http` → `https` | à trancher hors `routing.json` — c'est du DNS et de la configuration d'hôte |
| 8 | `check:old-urls` au gate du CLAUDE.md, et quand il devient bloquant ? | après l'étape 1, une ligne après `check:links` |

## 9. Deux choses trouvées en passant

Hors périmètre des redirections, mais du même lot de vérification :

- ~~**7 pages liées depuis le pied de page de tout le site portent
  `noindex: true`** à tort~~ — **CORRIGÉ le 2026-09-22 après réception du
  classeur d'URL de Julie : ce constat était FAUX.** Aucune des 7 n'est en
  `noindex` à tort : elle veut la politique de confidentialité et les conditions
  d'utilisation **non indexables**, et ne veut la tarification et le centre de
  confiance **pas en ligne du tout**. Le mécanisme est sain (les 35 pages
  `noindex` sont exactement les 35 absentes du plan de site, symétrie FR/EN
  parfaite, 3 désaccords seulement sur 53 lignes comparables). **Le vrai défaut
  est l'inverse** : le pied de page de toutes les pages pointe vers 5 pages
  qu'elle ne veut pas en ligne — correctif dans `src/data/site/{fr,en}.json`,
  pas dans `noindex`. Détail et tableau :
  [`revue-classeur-julie.md`](revue-classeur-julie.md) § 12.
- **122 des 150 adresses ne portent aucun `hreflang`** : `@astrojs/sitemap`
  n'apparie que les chemins identiques, et nos slugs sont traduits. C'est du
  ressort de L21, mais le constat est ici.

Deux corrections au passage : les « 20 slugs dérivés » de
[`parite-live.md`](parite-live.md) sont un **faux positif** (la colonne « Slug
du dépôt » affiche le `wpUrl`, pas le slug publié — les deux formes sont
couvertes), et `/xmlrpc.php` rend déjà 403 : il n'y a rien à bloquer sur un site
statique.
