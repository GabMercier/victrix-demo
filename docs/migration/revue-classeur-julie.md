# Revue du classeur d'URL de Julie (2026-09-22)

> Source : `URLs.xlsx`, feuille `Feuil1`, 93 lignes de données + une section
> « Priorités » (L85-L92) et une section « À ajouter éventuellement » (L94-L98).
> **Aucun code n'a été modifié par cette revue.** Elle prolonge
> [`plan-redirections.md`](plan-redirections.md) et la corrige sur un point.

## 1. Ce que ce classeur est — et ce qu'il n'est pas

C'est **trois documents dans un seul fichier**, et les traiter ensemble est
exactement ce qui coûterait le plus cher :

| | Contenu | Nature |
| --- | --- | --- |
| **a. Une architecture d'URL** | les 73 « Nouvelle URL » | une **refonte de l'arborescence**, pas une liste de redirections |
| **b. Une validation de contenu** | les colonnes Validée / Visible / Indexable, 55 commentaires | directement exploitable, et globalement cohérent avec le code |
| **c. Des questions ouvertes** | L88 à L92, et les 7 lignes sans destination | elle nous **renvoie** ces décisions |

La confusion à éviter : la colonne « Nouvelle URL » ressemble à une consigne de
redirection, mais c'est une **proposition d'arborescence**. Le nombre qui le
montre : sur les 73 URL voulues, **aucune ne répond aujourd'hui**, et le retrait
du préfixe `/fr/` n'en réglerait que **11**.

## 2. Le classement des 93 lignes

| Classe | Nombre | Ce que ça veut dire |
| --- | --- | --- |
| **A** — identique au préfixe `/fr/` près | 11 | rien à faire sauf trancher le préfixe |
| **B** — slug différent | 10 | `/carriere/` contre `/fr/carrieres/`, `/services/ia/` contre `/fr/services/intelligence-artificielle/` |
| **C** — chemin réorganisé | 33 | la page **existe**, ailleurs dans l'arbre |
| **D** — page absente | 19 → **13 réellement** | voir ci-dessous |
| **E** — pas une URL | 13 | les sections « Priorités » et « À ajouter » |
| **F** — destination non décidée | 7 | les 7 fiches Ø Studio « non rapatriées, c'est voulu ? » |

Trois des 19 « absentes » existent en fait, à un chemin différent : Centre de
confiance (`/fr/centre-de-confiance/`), Nos expertises (`/fr/expertises/`) et
Services applicatifs (`/fr/services/services-applicatifs/`). Sur les 13 qui
restent : 8 sont les fiches de solutions Ø Studio (leur **contenu existe**, il
n'y a **pas de route**), 3 sont les pages intermédiaires Microsoft du fil
d'Ariane, 2 sont de nouveaux hubs (`/campagne/`, `/produits/listes-prix-secteur-public/`).

**Le total qui compte : 43 renommages ou déplacements, 13 créations.**

## 3. Le vrai chantier n'est pas le préfixe — c'est le démembrement de trois catégories

C'est le point que j'ai mis le plus de temps à voir, et c'est celui qui décide
du coût.

| Catégorie actuelle | Devient | Ses enfants partent vers |
| --- | --- | --- |
| `productivite` (8 enfants) | `/nos-expertises/solutions-affaires-productivite/` | **4 arbres différents** : `/services/applications/microsoft/…`, `/services/applications/servicenow/`, `/services/ia/…`, `/produits/…` |
| `conseil-strategique` | `/nos-expertises/conseil-gouvernance-ti/` | son enfant Loi 25 **change de parent** pour cybersécurité |
| `services-ti-geres` | reste un hub `/services/ti-geres/` | cède son enfant M365 à `/services/applications/microsoft/m365/` |

Et **11 pages quittent `/services/` pour `/produits/`**, un pilier qui existe
comme page mais n'a aucun enfant aujourd'hui.

Ce n'est pas un renommage de préfixe : c'est une **réorganisation du graphe**.

## 4. Les trois écarts systémiques, à décider séparément

### 4.1 Le préfixe de langue — « URL de base ne doit pas avoir de /fr/ » (L87)

Le fond est acquis : c'est déjà la **décision n°2 du plan de convergence du
24/07**, dont la phase 2 n'a jamais été exécutée. Mais il faut dire l'ampleur
honnêtement.

Astro ne l'offre pas en basculant un drapeau. Sa documentation de type est
explicite : avec `prefixDefaultLocale: false`, « the defaultLocale will not show
a language prefix **and content files do not exist in a localized folder** ».
Nos 12 fichiers de route vivent tous sous `src/pages/[lang]/`. Il faut donc
restructurer.

Ce que ça touche, mesuré :

| Élément | Ampleur |
| --- | --- |
| `localizePath` (`src/i18n/config.ts:35`) | **1 fonction**, 87 appels — le point de passage unique, c'est la bonne nouvelle |
| Fichiers de route | 12, à sortir de `[lang]/` |
| Liens `/fr/` **dans le contenu** | 562 occurrences (outil existant : `npm run fix:links`) |
| Cibles de `routing.json` | 189 règles |
| `canonical`, `hreflang`, plan de site | configuration |
| Gabarits d'URL d'aperçu CloudCannon | 8 des 10 déduisent la langue du dossier — **vérifiable hors ligne** avec `npx @cloudcannon/reader` |

**Gain réel : 17 lignes du classeur sur 73** (11 de la classe A, plus 6 qui
deviennent des pages réelles sans redirection). Pas 73.

> **Le chiffre qui recadre la décision (mesuré le 22/09).** Sur les 173
> anciennes adresses publiées, servir le FR à la racine ne supprime que
> **3 redirections** : `/`, `/contact/` et `/ressources/`. Toutes les autres
> restent nécessaires, parce que la refonte a de toute façon renommé les slugs
> (`/carriere/` → `/carrieres/`, `/decouvrir-victrix/` → `/decouvrir/`) et
> déplacé les 64 articles de la racine vers `/ressources/<slug>/`.
>
> **Retirer le `/fr/` n'allège donc PAS la migration.** C'est une décision de
> *design d'URL* — des adresses plus courtes, et la structure que l'ancien site
> avait déjà (FR à la racine, EN sous `/en/`) — pas un levier sur les
> redirections. Il faut la prendre pour cette raison-là, ou pas du tout.

**Le coût réel n'est pas dans la configuration, il est dans les routes.** Les
11 fichiers sous `src/pages/[lang]/` totalisent ~2 900 lignes, dont
`contact.astro` (741), `ressources/index.astro` (583), `ressources/[slug].astro`
(547) et `style-guide.astro` (478). Les dupliquer en deux arbres (racine + `/en/`)
est exclu : il faudrait d'abord extraire les corps de page dans des modules
partagés.

**Ma recommandation : un essai d'une heure avant tout chiffrage.** Renommer une
seule route `[lang]` → `[...lang]` et builder dans une copie isolée.
`validateSegment` (`node_modules/astro/dist/core/routing/manifest/segment.js`)
n'interdit que le paramètre reste non autonome — pas deux paramètres reste dans
des segments distincts — et Astro documente `undefined` comme valeur de
paramètre reste. Si ça passe, le préfixe tombe en ~1 jour au lieu de 3 à 5, et
une seule route pose problème (`[lang]/[...slug].astro`, deux paramètres reste
adjacents). Puis la demi-journée de test `@cloudcannon/reader` sur les gabarits
d'URL.

### 4.2 L'apex sans `www` — déjà tranché par Victrix

Julie l'assume explicitement en L79 : « L'URL change puisque nous modifions le
domaine sans www ». Mesuré sur l'ancien site : `http://www.victrix.ca` → 301
`https://www.victrix.ca`, et `https://victrix.ca` → 301 `https://www.victrix.ca`.
**L'hôte canonique historique est `www`** : le basculement vers l'apex est un
événement de référencement en soi.

Bonne nouvelle : **ça ne touche aucune de nos 189 règles.** `routing.json`
n'utilise que `{from, to, status, forced}` — aucun champ d'hôte. Le basculement
se joue au DNS et dans le réglage de domaine du site CloudCannon. Un seul
endroit du dépôt est lié à l'hôte : `astro.config.mjs:826`.

Et L88 nous dit qui le porte : « **Plan de redirection à la charge de Victrix,
contacter Walter au besoin** ». À clarifier — voir § 9.

### 4.3 Le pilier `/produits/` — moins coûteux qu'il n'y paraît

La critique de cette passe a trouvé ce que j'avais manqué : **la seconde route
existe déjà**. `src/pages/[lang]/[...slug].astro` est un attrape-tout sur la
collection `pages`, sans préfixe d'URL, avec la même surcharge `slug` et un
paramètre reste de profondeur libre. Le dépôt le documente mot pour mot
(`src/content.config.ts:1670-1677`) : « Patron EXACT de la collection services …
seule l'URL change : **PAS de préfixe /services/** ». C'est déjà ce qui sert
`/fr/produits/`, `/fr/solutions/`, `/fr/secteurs/`, `/fr/tarification/`.

Les 13 pages qui quittent `/services/` n'exigent donc **ni constante par entrée
ni route nouvelle** : elles peuvent devenir des entrées de `pages`. Le coût
change de nature — migration de contenu entre deux schémas, pas du routage.

**Deux pièges à intégrer au chiffrage :**

- `pages` a `noindex` par défaut à **`true`** (`content.config.ts:1695`) contre
  **`false`** pour `services` (`:1338`) : une page migrée partirait en `noindex`
  **silencieusement** si on n'écrit pas la clé ;
- on perd les préréglages de famille de contact et le fil d'Ariane spécifique
  aux services.

## 5. Julie a relu un site en retard de 20 commits

C'est le malentendu le plus coûteux du classeur, et il se règle par une fusion.

Il y a **deux sites CloudCannon** : `vocal-wren.cloudvent.net` (dev, que
Clément relit) et `lawful-hare.cloudvent.net` (staging, la colonne « URL dans
CC » de Julie). Mesuré : **`origin/staging` est 20 commits derrière `origin/dev`**.

Conséquence directe sur sa priorité n°1 (L86, « 13 URLS qui n'ont pas été
ajoutées ») : **11 des 13 existent sur `dev`.** Les 9 fiches fournisseurs
d'approvisionnement TI répondent 200 dans le build de `dev` et 404 sur
`lawful-hare` — le commit qui les a introduites (`ac57620`) n'a jamais atteint
`staging`. Elle a raison pour **son** site, et tort pour `dev`.

**Seules deux de ses 13 manquent vraiment** : Documents Ø Bureau pour le MTMD et
la liste de prix Check Point.

> **À ne pas oublier avant la fusion** : `staging` est aussi **2 commits
> devant**, deux sauvegardes CloudCannon — `995cb74`
> (`src/content/services/fr/productivite/servicenow.json`, 29 insertions) et
> `ea912b2` (`src/content/solutions/fr/o-bureau.json`). Ce sont des éditions du
> client : il faut les rapatrier dans `dev` **avant** la PR (règle 2 du
> CLAUDE.md).
>
> Détail qui n'est pas une coïncidence : ces deux fichiers sont **exactement les
> deux que l'architecture de Julie déplace en premier** (L29 ServiceNow, L60
> Application de réservation de bureau).

## 6. Deux de ses remarques sont exactes et n'ont rien à voir avec le retard

**Les 9 fiches de solutions Ø Studio n'existent que comme cartes.** Le contenu
est là (`src/content/solutions/fr/*.json`, 9 fichiers) mais la route
attrape-tout ne parcourt que la collection `pages` — **il n'y a aucune route
`/fr/solutions/<slug>/`**. Son « aucun aperçu visuel pour valider » est
littéralement vrai : ces pages ne s'affichent nulle part. C'est le lot L11 du
plan de livraison (« Découvrir mène à la FICHE »).

**Les 7 fiches Ø Studio « non rapatriées » (L69-L75)** sont un chantier déjà
décidé le 18/09 et chiffré à 2,5 j, simplement pas commencé.

## 7. Ce que le classeur révèle de neuf pour les redirections

### 7.1 Un troisième nom d'hôte, absent de tout inventaire

`o-studio-catalogue.victrix.ca` — 16 lignes du classeur, **et zéro occurrence
dans `docs/inventaire-pages.md`, `urls-live.csv`, `urls-contenus.csv` ou
`correspondance-urls.json`**.

Mesuré aujourd'hui : le sous-domaine est **vivant**. Pas de
`/sitemap_index.xml`, mais un plan Jetpack `/sitemap.xml` → `/sitemap-1.xml` =
**25 adresses** (les 16 fiches + `/`, `/a-propos/`, `/144-2/`,
`/studio-de-creation-power-platform-dynamics-365/` et 6 articles de
démonstration du thème WordPress), plus 131 images.

Il résout vers **la même IP que `www.victrix.ca`** et tourne sur la même machine
(nginx + Plesk), mais c'est une **installation WordPress séparée**. Donc :
**éteindre le WordPress au lancement éteint le catalogue**, et aucune de nos 189
règles ne peut l'attraper — elles ne comparent qu'un chemin, pas un hôte.

Aggravant : **deux articles de la refonte pointent encore dessus** —
`src/content/blog/fr/gouvernance-power-platform-conseils.md:118` et son
équivalent EN ligne 112, tous deux vers `https://o-studio-catalogue.victrix.ca/#catalogue`.
`check:links` ne les voit pas : il ne traite que les liens internes.

### 7.2 Le joker `/expertise/(.*)` passe de filet à nuisance

Aujourd'hui, le joker est ce qui fait fonctionner 71 adresses (§ 2 du plan) —
et c'est aussi ce qui fabrique les 10 « 301 vers un 404 ».

Sous l'architecture de Julie, il devient **franchement nuisible** : sur les 37
lignes `/expertise/` du classeur, la transformation du joker
(`/expertise/X` → `/services/X`) ne donne sa cible que **2 fois sur 37**. Elle
re-slugue **les deux niveaux**. Le même joker produirait donc 35 redirections
vers des chemins inexistants.

**Décision à ajouter à l'étape 1 du plan : le supprimer, ou le re-pointer vers
le hub `/services/` comme filet neutre.**

### 7.3 L'ordre des opérations, chiffré

C'est la question que je me posais et elle a une réponse nette. En croisant les
58 paires ancienne → nouvelle du classeur avec les 175 entrées de
`src/data/redirects-migration.json` : **39 cibles doivent changer** sous
l'architecture de Julie (5 sont déjà conformes après retrait du `/fr`).

Mais le correctif de la barre finale agit sur le champ **`de`** — des chemins
WordPress **gelés**, que l'architecture de Julie ne peut pas modifier. Il est
donc **entièrement réutilisable**.

> **Conclusion : barre finale et sort du joker MAINTENANT. Ne pas réécrire
> `correspondance-urls.json` avant le gel de l'arborescence.**

## 8. Le trou : l'anglais

**Le classeur ne contient pas une seule URL anglaise.** Zéro occurrence de
`/en/` dans les trois colonnes d'URL ; les 47 entrées « URL dans CC » sont
toutes en `/fr/`.

Ce n'est pas un oubli — Julie le **signale** en L89 : « Liaison des URLS entre
FR et EN, comment c'est géré ? Comment je fais lors de l'ajout de nouvelles
pages ? ». C'est une question qu'elle nous renvoie.

L'enjeu chiffré : l'inventaire compte **84 lignes EN sur 184**, l'ancien site
avait **72 URL `/en/` indexées**, le build en compte **91 pages EN**. Or les
slugs EN sont indépendants par fichier (`it-procurement`,
`cloud-services-provider`…) : **aucune de ses décisions FR ne produit
mécaniquement un slug EN.** Geler l'architecture FR seule, c'est re-décider 91
pages après coup.

Le classeur couvre **48 des 184 adresses de l'inventaire, soit 26 %**. Les 40
articles FR non listés sont un choix assumé (sa règle L81 les couvre en bloc).

## 9. Ses questions, et ce qu'on peut déjà y répondre

| Ligne | Sa question | Réponse |
| --- | --- | --- |
| L87 | pas de `/fr/` dans l'URL de base | recevable, mais 4-6 j — voir § 4.1. Gain : 17 lignes sur 73 |
| L88 | « plan de redirection à la charge de Victrix, contacter Walter » | **à clarifier** : la matrice 301 vit dans NOTRE dépôt ; ce qui est chez Walter, c'est le DNS, l'apex et le `http→https` |
| L89 | liaison FR/EN | l'appariement existe, **par chemin de fichier** ; à documenter dans `guide-edition.md` |
| L90 | pages techniques du fil d'Ariane, « en draft, redirigeant vers le parent » | **impossible tel quel** — voir § 10 ; contre-proposition : le maillon non cliquable, qu'elle a elle-même formulé en L95 |
| L92 | catégories de ressources (livres blancs, webinaires) | différé par elle-même |

## 10. Les contraintes techniques qui contredisent ses demandes

Trois points où le code ne peut pas faire ce qu'elle décrit.

**Le fil d'Ariane ne remonte qu'un seul niveau.** La route ne calcule qu'un
parent, jamais la chaîne. C'est déjà visible : la page la plus profonde du site,
`/fr/services/productivite/o-bureau/demo-o-bureau/`, affiche « Accueil › O
bureau › Démo » — « Productivité » est sauté. Julie demande des chemins à 4
segments. **L'enjeu n'est pas 3 pages mais 42** : 42 de ses 73 cibles ont 3
segments ou plus et perdraient au moins un ancêtre.

**« En draft et rediriger vers le parent » n'est pas possible.** Le champ
`draft` n'existe **que** pour le blogue (`content.config.ts:275`) ; les
collections `pages`, `services`, `landing` et `solutions` n'en ont pas. Et une
page qui redirige ne peut pas être un maillon cliquable du fil.

> **Défaut sérieux trouvé en vérifiant ce point** : la règle de visibilité est
> `return staticOnly || draftsVisible` (`src/i18n/blog.ts:56`) — et
> `STATIC_ONLY=1` est une variable de build **obligatoire sur les deux sites
> CloudCannon, production comprise** (`DEPLOYMENT.md:44`). Donc le jour où Julie
> basculera l'interrupteur « Brouillon » d'un article, **cet article partira en
> production**. L'interface lui promet l'inverse de ce qui arrivera. Conséquence
> nulle aujourd'hui (0 fichier en `draft: true`), mais c'est un piège armé.
> C'est exactement l'objet du lot L16.

**Le re-parentage est un déplacement de fichiers, pas un champ `slug`.**
L'appariement FR/EN **et** le parent du fil d'Ariane sont calculés sur le chemin
de **fichier**, pas sur le champ `slug` (qui ne surcharge que l'URL). Changer
`slug` produirait une URL `/services/cybersecurite/conformite-loi-25` dont le
fil d'Ariane dirait encore « Conseil stratégique ». Les déplacements doivent
donc bouger les fichiers **FR et EN ensemble**.

> Et le garde-fou qui devrait le rattraper ne le rattrapera pas :
> `victrix:i18n-pairing` (`astro.config.mjs:578-618`) lit les dossiers **sans
> `{ recursive: true }`** — il ne voit que le premier niveau, donc ni les 9
> fiches fournisseurs ni la branche `productivite`, c'est-à-dire exactement les
> fichiers qui bougeraient. Et il appelle `logger.warn` : le build passe.

## 11. Quatre vrais défauts trouvés en vérifiant ses commentaires

1. **L'ancre `#formulaire` de Cybersécurité est morte, en FR et en EN.** Le
   dernier CTA porte `ctaHref: "#formulaire"`
   (`src/content/services/fr/cybersecurite.json:237`, et
   `en/cybersecurite.json:225`) mais aucune des deux pages n'a de section
   `form` : le HTML construit contient **0** `id="formulaire"` (contre 1 sur
   o-studio). `check:links --strict` ne peut pas le voir — il saute les `href`
   qui commencent par `#`. C'est littéralement ce que Julie demande en L33.
2. **Les 191 SKU Check Point sont un contenu orphelin.**
   `src/data/prix/check-point.{fr,en}.json` existent et **rien ne les lit**. Un
   fournisseur qui suit l'ancienne URL de la liste de prix arrive sur une page
   marketing sans un seul prix.
3. **Greenhouse ne demande aucun jeton.**
   `https://boards-api.greenhouse.io/v1/boards/victrix/jobs` répond **200 sans
   authentification**, avec de vraies offres. Ça lève l'hypothèse « décision
   Victrix (jeton) » qui bloquait cette demande depuis le 16 septembre — c'est
   la troisième fois que Julie la formule.
4. **Les formulaires qu'elle demande sont du contenu, pas du code.** Le
   formulaire pentest du site vivant a 4 champs (Nom, Fonction, Entreprise,
   Courriel professionnel) et l'autodiagnostic Loi 25 a 5 questions Oui/Non.
   Tous tiennent dans les types existants — à un détail près : il n'y a pas de
   type `radio`, donc 5 `select` Oui/Non. Le mécanisme existe (5 formulaires
   dans `src/data/forms/`, champ `formId` dans les sections) mais **une seule
   page de service l'utilise** aujourd'hui.

## 12. Correction à `plan-redirections.md`

Le § 9 de mon plan de ce matin est **faux** et doit être réécrit. Il affirmait
que « 7 pages liées depuis le pied de page portent `noindex: true` à tort ».
Confronté au classeur :

| Page | État réel | Julie | Verdict |
| --- | --- | --- | --- |
| Politique de confidentialité | `noindex` | indexable = **Non** | **`noindex` voulu** |
| Conditions d'utilisation | `noindex` | indexable = **Non** | **`noindex` voulu** |
| Tarification | `noindex` | visible = **Non**, « ne pas mettre en ligne » | **ne doit pas être en ligne** |
| Centre de confiance | `noindex` | visible = **Non** | ne doit pas être en ligne |
| Services applicatifs | `noindex` | validée = Non | doit exister sans être indexée |
| Infrastructure, Projets en IA | `noindex` | **absentes du classeur** | à lui demander |

**Aucune des 7 n'est en `noindex` à tort.** Le mécanisme est même sain : les 35
pages `noindex` du build sont **exactement** les 35 absentes du plan de site
(150 entrées pour 185 pages), et la symétrie FR/EN est parfaite. Sur les 53
lignes comparables, il n'y a que 3 désaccords, tous dans le même sens et tous
sur des lignes qu'elle marque `visible = Non`.

**Le vrai défaut est l'inverse de mon diagnostic** : le pied de page de *toutes*
les pages pointe vers 5 pages que Julie ne veut pas en ligne. Le correctif est
une édition de `src/data/site/{fr,en}.json`, pas un changement de `noindex`.

## 13. Ce que je recommande, dans l'ordre

| # | Action | Effort | Pourquoi maintenant |
| --- | --- | --- | --- |
| 1 | **Rapatrier les 2 sauvegardes CloudCannon de `staging`, puis fusionner `dev` → `staging`** | 0,5 h | invalide 11 des 13 constats de Julie et lui évite de remplir deux fois la même colonne |
| 2 | **Barre finale + sort du joker** (étape 1 du plan de ce matin) | 0,5 j | répare 104 adresses, supprime 10 « 301 vers 404 » ; **100 % réutilisable** quelle que soit la décision d'architecture |
| 3 | **Envoyer les questions à Julie** (§ 14) et lui donner les liens `vocal-wren`, pas `lawful-hare` | 1 h | se tromper ici = 4 à 6 j de reprise |
| 4 | **Test `@cloudcannon/reader` sur une collection** | 0,5 j | tranche le risque des 8 gabarits d'URL avant d'engager le chantier du préfixe |
| 5 | `astro.config.mjs:826` en variable de build + garde-fou de CI | 0,25 j | les deux sites cloudvent servent `Disallow: /` injecté par CloudCannon : **le défaut est invisible aujourd'hui et se déclenchera au premier build de production** |
| 6 | Récursion du fil d'Ariane + maillon non cliquable | 0,5 j | couvre les 42 cibles, pas seulement les 3 pages qu'elle demande |
| 7 | Les 4 formulaires + l'ancre morte de Cybersécurité | 0,5 j | contenu, pas code ; répond à 4 commentaires |
| 8 | Route des fiches de solutions (lot L11) | déjà chiffré | débloque 8 lignes « Si validée par Victrix » |

**Ne pas faire maintenant** : réécrire `correspondance-urls.json` (39 cibles
changeraient deux fois), et engager la restructuration du préfixe avant l'étape 4.

## 14. Les questions à poser à Julie

1. ~~« Validée = Non » sur 42 lignes : l'adresse n'est pas arrêtée, ou le contenu
   n'est pas relu ?~~ — **RÉPONDU en dépouillant la colonne Commentaires, il
   n'y a pas à le lui demander.** Sur les 42 « Non » : **32 disent qu'elle n'a
   pas pu valider** (« n'a pas été intégrée », « aucun aperçu visuel »,
   « page non créée », « non rapatriée »), 6 sont différées volontairement
   (« pas urgent », « ne pas mettre en ligne »), 2 sont des questions qu'elle
   nous pose, 1 est hors périmètre (le portail). **Une seule ligne est un vrai
   doute muet : L29 ServiceNow** (aucun commentaire, visible = Oui,
   indexable = Oui).
   Donc « Validée = Non » veut dire « je n'ai pas pu voir la page », pas « je
   refuse l'adresse ». Ce qu'il faut lui envoyer n'est pas une question, c'est
   **un site où elle peut tout voir** : la fusion `dev` → `staging` de l'action 1.
   Et une seule question : **L29 ServiceNow**.
2. **L'anglais** (sa question L89) : veut-elle un second classeur, ou qu'on
   dérive les slugs EN ? 91 pages en dépendent.
3. **`/fr/services/infrastructure/` et `/fr/services/projets-en-ia/`** : deux
   vraies pages, liées depuis le pied de page et la navigation de chaque page,
   **absentes de ses 93 lignes**. Qu'en fait-on ?
4. **L88** : que couvre exactement « plan de redirection à la charge de
   Victrix » ? La matrice 301 est dans notre dépôt ; le DNS et l'apex sont chez
   eux.
5. **Le sous-domaine `o-studio-catalogue.victrix.ca`** : 25 adresses vivantes,
   il meurt avec le WordPress. On le redirige, on le garde, on l'éteint ?
6. **`/campagne/vœux-fetes/`** : la ligature `œ` dans une URL. Son propre
   commentaire L11 écrit « voeux-des-fetes » et sa colonne L12 « vœux-fetes » —
   il faut trancher entre ses deux graphies. L'ancienne URL était déjà en ASCII
   (`/voeux-des-fetes/`) : aucun argument de parité. Et : singulier `/campagne/`
   au premier niveau mais pluriel `/campagnes/` sous chaque pilier (L45, L76) ?
7. **L37** : `/services/cybersecurite/conformite-loi-25` est la seule de ses 73
   URL **sans barre oblique finale** — et elle change aussi de parent. Confirmé ?
8. Les **7 fiches Ø Studio** (L69-L75) : elle demande « c'est voulu ? ». La
   réponse est oui pour l'instant (chantier chiffré, pas commencé) — le
   confirmer.

## 15. Les icônes et les logos de partenaires

Deux choses différentes, et elles ne sont pas au même stade.

**Les icônes sont faites.** La banque partagée
`component-library/src/shared/icons.ts` compte une trentaine de pictogrammes
(`personne`, `bouclier`, `nuage`, `engrenage`, `cible`, `ampoule`…) et
`public/images/cms/icones/` porte **34 vignettes** générées pour le sélecteur
CloudCannon (`npm run cms:previews`).

**Les logos de partenaires, non — et c'est un cas net de mécanisme construit
puis jamais utilisé.**

| | État |
| --- | --- |
| Composant Bookshop `logo-banner` | **complet** : `.astro`, `.bookshop.yml` (« Bandeau logos partenaires », badge de certification, `items[{name, logo, description}]`), `.preview.png` |
| Schéma zod | **présent** (`src/content.config.ts:589`) |
| Pages qui l'utilisent | **0 sur 185** |
| Fichiers de logo dans le dépôt | **0** — seul `public/images/logo-victrix.png` existe |

Les images, elles, **existent dans la médiathèque WordPress** — 97 entrées
contiennent « logo » dans `docs/migration/urls-medias.csv`, dont exactement ce
qu'il faut : `logo-microsoft.svg`, `logo-cisco.svg`, `logo-crowdstrike.svg`,
`logo-paloalto.svg`, `logo-checkpoint.svg`, `logo-aruba.svg`,
`zscaler-logo.svg`, `service-now-logo.png`, `algosec_logo.svg`,
`logo-imprivata.svg`, `juniper-logo.png`, `proofpoint_r_logo.png`, `logo_ovh.png`,
plus les désignations : `partner-aws-victrix.png`,
`aws-partner-public-sector.png`, `aws-partner-consulting.png`,
`fasttrack_partner.png`, `partneranddynamics.svg`, `servicenow-partner.png`,
`select-light-partner.png`.

`scripts/migration/fetch-media.mjs` rapatrie les médias **référencés par le
contenu** : il suffit donc d'écrire les sections, puis de le rejouer.

> **Défaut visible trouvé au passage.** La page Expertises **anglaise** porte une
> section `home-partners` (la variante « liste de noms », distincte de
> `logo-banner`) remplie avec le texte de remplissage **« Partenaire 1 »** — un
> libellé français, sur la page anglaise, **rendu dans le build**
> (`dist/en/expertises/index.html`, 1 occurrence). Et la page **française** n'a
> pas la section du tout. Source : `src/content/pages/en/expertises.json:78`.

Ce que Julie demande là-dessus, dans son classeur : les **logos de
certifications** sur Cybersécurité (L33) et sur le SOC (L34, où elle les juge
« pertinentes… le SEvOC est une offre singulière »), et les **désignations
Microsoft** sur Dynamics 365 Field Service (L28) et sur Plateforme expérience
employé (L48, « Microsoft Partner Copilot »).

**Le travail** : arrêter la liste des logos avec Victrix (droits de marque),
rapatrier les fichiers, écrire les sections `logo-banner`, et corriger le
« Partenaire 1 ». Estimation ~0,5 j une fois la liste arrêtée — le composant
n'a pas besoin d'être touché.
