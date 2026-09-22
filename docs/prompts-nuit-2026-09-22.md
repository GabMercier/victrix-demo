# Lots restants et prompts prêts à coller — préparé le 2026-09-21 (nuit)

> **À qui ça s'adresse.** À Gabriel, pour lancer des sessions d'agent sans
> avoir à rédiger les consignes, et aux agents eux-mêmes : chaque prompt est
> autonome et se colle tel quel dans une session neuve.
>
> **Comment s'en servir.** Un lot = **une session neuve** (`/model opus`) =
> **un** prompt ci-dessous. `CLAUDE.md` est chargé d'office : les prompts n'y
> reviennent pas. Ils supposent tous le **rituel de fin de lot** du `CLAUDE.md`
> (gate complet avec chiffres réels, docs à jour, plan coché, mémoire
> `project-status` mise à jour, commandes prêtes à coller — **jamais
> exécutées**).
>
> **Complète** `docs/plan-livraison-finale.md` (§ 7 Suivi = l'état de chaque
> lot) et `docs/plan-parite-et-raffinage.md`. En cas de désaccord entre les
> trois, le § Suivi du plan de livraison fait foi.

## 1. Ce qu'un agent peut faire seul la nuit — et ce qu'il ne peut pas

Le critère n'est pas la difficulté, c'est **l'absence de décision humaine et
la réversibilité**.

| Peut tourner sans surveillance | Pourquoi |
|---|---|
| **L-prefill**, **L-polices**, **L-libelle**, **L01**, **L02**, **L04**, **L14**, **L20**, **L-parite5** | périmètre fermé, critère de fin mécanique, tout est vérifié par le gate |
| **Ne pas lancer la nuit** | |
| **L06, L07, L08, L10, L11, L12, L13** | demandent des arbitrages de contenu, des fichiers (logos) ou des décisions marketing |
| **L16, L17, L22, L23** | touchent la mise en production, des comptes tiers ou de la formation |
| **L-prix** | décision marketing pure, aucun code |

**Trois règles pour une session de nuit**, à rappeler à l'agent si besoin :

1. **Ne jamais commiter ni pousser** — laisser l'arbre sale, finir par les
   commandes prêtes à coller. C'est la règle 1 du `CLAUDE.md`.
2. **Un seul lot par session.** Si l'agent voit un autre défaut, il le
   *signale* dans sa réponse finale ; il ne l'attrape pas au passage.
3. **Port 4321** — si un serveur de dev tourne, pas de `build`/`type-check`
   dans le dépôt (§ 3.1 de `docs/operations.md`). Un `npm run dev` lancé par
   un agent **survit au `npm` parent** : le tuer avec
   `Get-NetTCPConnection -LocalPort 4321 -State Listen` puis `Stop-Process`.

## 2. Décisions qui n'attendent que Gabriel

Aucun agent ne peut avancer dessus. Chacune débloque un lot.

| # | Décision | Débloque |
|---|---|---|
| **Police** | Comparer avec `?police=montserrat`, `?police=nunito`, `?police=hanken` sur `/fr/` et `/fr/campagnes/licences-power-platform/`, puis trancher. Une police Google retenue = la rapatrier en local avant la prod (Loi 25). | L-polices |
| **Formulaires orphelins** | `campagne-evaluation` (plus utilisé depuis le 21/09) et `campagne-guide-licences` (jamais utilisé) : supprimer ou garder. Et le sort d'`o-studio`, 3ᵉ formulaire de demande. | — |
| **Liste de prix Check Point** | Reprendre l'outil, le remplacer par un PDF + formulaire, ou le retirer. | L-prix |
| **D2 / D3 / D4 / D7** | H1, `noindex` restants, logos de marque, pages `/document/*`. Voir § 2 du plan de livraison. | L04, L05, L07, L12 |

---

## 3. Les prompts

### L-prefill — Chaque CTA arrive sur un formulaire prérempli · **à faire en premier**

Défaut de conversion confirmé par Gabriel le 21/09, mesuré : **9 pages
générales sur 11 n'ont pas de `contactSujet`, soit 18 liens vers `/contact`
qui arrivent vides.**

```text
Lot L-prefill. Défaut de conversion confirmé sur vocal-wren :
/fr/contact?cta=Planifiez+une+consultation&de=Secteurs+d'activité arrive avec
« De quoi souhaitez-vous parler ? » ET « Service » VIDES — deux champs pourtant
obligatoires.

CAUSE, déjà trouvée (ne pas la rechercher) : la route des SERVICES pose
`sujet: page.data.contactSujet || 'projet'` (repli), mais la route des PAGES
GÉNÉRALES, src/pages/[lang]/[...slug].astro (~l.212), pose
`sujet: page.data.contactSujet` SANS repli. Sur secteurs.json les deux clés
sont vides → <body> ne porte aucun data-contact-* → le script « provenance des
CTA » de BaseLayout n'ajoute ni ?sujet= ni ?expertise=, seulement cta= et de=.
Le repli SUJET_SERVICE_FALLBACK de src/lib/contact/presets.ts ne couvre pas ce
cas : il ne s'applique que si un sujet est DÉJÀ résolu.

À faire :
1. Repli de sujet dans la route des pages générales, aligné sur celle des
   services. Vérifier que le repli « carrière → Ressources humaines / sinon
   Autre » de presets.ts s'enchaîne alors correctement.
2. GARDE-FOU rejouable, dans l'esprit de scripts/check-internal-links.mjs :
   parcourir TOUS les liens vers /<lang>/contact du site CONSTRUIT (dist/) et
   échouer si l'un d'eux n'arrive pas prérempli. Exceptions à documenter dans
   une constante : les liens de header/nav/footer, que le script de BaseLayout
   ignore VOLONTAIREMENT (leur libellé « Contact » n'apporte rien).
   L'ajouter au portail qualité de docs/operations.md.
3. Le formulaire Contact SURLIGNE au chargement les champs OBLIGATOIRES encore
   VIDES : prénom, nom, courriel, message quand les deux listes sont
   préremplies ; les six quand on arrive sans contexte (menu, URL tapée). Le
   surlignage est dynamique — il ne doit rien supposer du chemin d'arrivée. Il
   disparaît dès que le champ est rempli. Ne pas utiliser :invalid seul (il
   marque un champ jamais touché comme fautif) : viser un repère visuel calme,
   pas une alerte d'erreur.
4. Tests e2e : un parcours par gabarit de page (service, page générale,
   catalogue, carrières) qui vérifie que #subject et #expertise ne sont jamais
   vides après un clic sur un CTA de contenu ; et un test du surlignage.

Contraintes : les deux listes sont des champs obligatoires — ne jamais poser
une valeur qui n'est pas une option RÉELLE (presets.ts est tolérant par
conception : une option renommée au CMS ne doit pas casser le build).
Rituel. Story ADO à créer : « Préremplissage garanti des CTA vers le Contact ».
```

### L-polices — Retirer le banc d'essai, garder la recette

Décidé par Gabriel le 21/09 : le banc disparaît, la méthode reste écrite.

```text
Lot L-polices. Le banc d'essai a joué son rôle : le BLEU est tranché et déjà
appliqué (#002fc7 du Design System, theme.css + tokens.css). Le choix de la
POLICE reste ouvert, mais Gabriel ne veut plus du banc — seulement la recette,
pour appliquer en une fois le jour venu.

À faire :
1. Dans docs/design/banc-essai.md, remplacer le mode d'emploi du banc par une
   RECETTE courte : les trois piles `--font-sans` prêtes à coller (Montserrat,
   Nunito Sans, Hanken Grotesk), la ligne de chargement de la police, et les
   deux étapes d'application (jeton dans theme.css + rapatriement du fichier
   en local — une police servie par Google est une requête tierce, donc un
   sujet Loi 25 que le bandeau de consentement ne couvre pas). Garder la
   section « Historique de l'écart » : elle explique pourquoi le bleu a changé.
   Renommer le fichier docs/design/polices-et-bleu.md si le titre n'a plus de
   sens.
2. Supprimer src/styles/banc-essai.css, son import dans BaseLayout, le bloc
   <script is:inline> du banc dans le <head> de BaseLayout, et
   tests/e2e/banc-essai.spec.ts.
3. Vérifier qu'il ne reste AUCUNE trace : ni data-police, ni data-bleu, ni
   .banc-essai-etiquette, ni victrix-banc-essai dans dist/.

NE PAS TOUCHER au fond de section « Bleu électrique » (#1a5bff, clé
bleu-electrique → bg-bleu-500 dans component-library/src/shared/fonds.ts) :
il est PERMANENT et n'a aucun rapport avec le banc. C'est le choix de couleur
que Julie utilise section par section. Le banc, lui, repeignait tout le site
d'un coup — c'est ça, et seulement ça, qui disparaît.

Gain attendu : ~3,1 Ko de script en moins par page (1,2 Ko compressé).
Rituel.
```

### L-libelle — « Service ou expertise » dans le formulaire

```text
Lot L-libelle. La maquette « contact redesign » appelle le 2e select
« Expertise » ; le site l'appelle « Service ». Décision Gabriel : un libellé
qui contient les deux mots, p. ex. « Service ou expertise ».

PIÈGE À CONNAÎTRE AVANT DE TOUCHER QUOI QUE CE SOIT : ce libellé est la CLÉ
d'alignement entre src/data/contact/<lang>.json (ce que la page affiche) et
src/data/forms/<lang>/contact.json (la liste blanche du serveur), et c'est lui
qui dérive le `name` HTML du champ (src/lib/forms/field-name.ts). Le changer
d'un seul côté casse le build — volontairement (assertSameOptions et nameFor
dans src/pages/[lang]/contact.astro).

À faire : changer le libellé dans les DEUX fichiers, en FR et en EN, vérifier
que les tests e2e du contact passent (le nom HTML du champ change, donc les
sélecteurs qui s'appuient dessus aussi), et mettre docs/guide-edition.md à
jour. Ne pas toucher aux OPTIONS de la liste ni aux clés de presets.ts.
Rituel.
```

### L-parite5 — Fidélité des 5 pages ciblées

```text
Lot L-parite5. Gabriel a ciblé cinq pages du site actuel et pensait qu'elles
manquaient. VÉRIFIÉ LE 21/09 : elles existent toutes, en FR et en EN, sont
construites, indexables et liées. L'ancienne URL /expertise/… est simplement
devenue /services/… :
  services-infonuagiques/services-aws (6 sections, ~709 mots)
  services-infonuagiques/migration-vers-azure (7 sections)
  cybersecurite/centre-operationnel-de-securite-evolutif (7 sections)
  cybersecurite/test-intrusion-pentest (7 sections)
  cybersecurite/internet-des-objets-service-iot (7 sections)

La vraie question est donc la FIDÉLITÉ du contenu, pas l'existence.

À faire :
1. `python scripts/migration/check-parite-live.py` puis lire
   docs/migration/parite-live.md pour ces cinq pages.
2. Pour chacune, `python scripts/migration/extract-source-page.py <url source>`
   et comparer bloc par bloc avec notre version : ce qui manque, ce qui a été
   reformulé, ce qui a été volontairement retiré.
3. Combler ce qui manque en réutilisant les SECTIONS EXISTANTES du catalogue
   Bookshop — ne pas créer de composant pour l'occasion.
4. Produire un tableau de constat dans docs/migration/parite-live.md : par
   page, ce qui a été repris, ce qui reste écarté et pourquoi.

Les cinq URL sources sont sous https://www.victrix.ca/expertise/…
Rituel.
```

### L01 — Tolérance aux champs vidés

Le prompt complet est déjà écrit dans `docs/plan-livraison-finale.md` § 4
(Phase 1). Le rappel utile : un champ vidé au CMS a déjà mis `staging` au
rouge pendant 20 sauvegardes (mémoire `cloudcannon-null-build-break`), et la
récidive du 18/09 portait sur `''` avec `.min(1)`, pas sur `null`.

### L02 — Rétro-remplissage générique des clés de section

Prompt dans `docs/plan-livraison-finale.md` § 4. Depuis, `KEYS` suit `fond` et
`image` ; le lot doit le rendre générique (toute clé ajoutée à un
`*.bookshop.yml` devrait être rétro-remplie sans édition du script).

### L04 — H1

Bloqué par **D2** (retirer `seoH1` ou garder le champ caché). Prompt dans le
plan § 4. État : `seoH1` est encore posé dans 84 entrées.

### L14 — Inventaire des pages

```text
Lot L14 de docs/plan-livraison-finale.md. Aucun changement de rendu.
Produire l'inventaire complet des pages du site construit : URL, titre, langue,
gabarit (route qui la produit), noindex, présence d'un H1 unique, page miroir
dans l'autre langue, et provenance WordPress si connue (champ wpUrl ou
docs/migration/correspondance-urls.json).
Sortie : docs/content-inventory.md régénéré, plus un script rejouable
(scripts/inventaire-pages.mjs) qui le reconstruit depuis dist/ — le document
doit pouvoir être refait après chaque build sans travail manuel.
Signaler, sans les corriger : les pages orphelines (aucun lien entrant), les
pages sans miroir de traduction, et les noindex restants.
Rituel.
```

### L20 — Performance

```text
Lot L20 de docs/plan-livraison-finale.md.
Mesurer, puis corriger ce qui se corrige sans arbitrage.

Mesure : Lighthouse sur un BUILD DE PRODUCTION (jamais sur le serveur de dev —
bundles non minifiés, HMR : les chiffres ne veulent rien dire), ou sur
vocal-wren. Chromium de Playwright est déjà installé ; passer son binaire à
Lighthouse via CHROME_PATH plutôt que d'installer Chrome.
Couvrir 4 gabarits : accueil, page de service, article, catalogue.

Corriger sans arbitrage : images non dimensionnées ou servies trop grandes
(signalement connu : les exports du designer font 512px de large et sont
étirés), polices préchargées inutilement, scripts inline qui pourraient être
différés, CSS non utilisée.
NE PAS toucher : le bandeau de consentement (portée légale) ni le découpage
des routes (lot L16).
Rapporter les scores AVANT/APRÈS par gabarit, chiffres réels.
Rituel.
```

### Lots à ne PAS lancer la nuit — pour mémoire

| Lot | Ce qui manque |
|---|---|
| **L06** CTA, cartes cliquables, boutons | prolonge L-prefill ; revue **R1** prévue après |
| **L07** Lucide, logos, bandeau | **D4** : qui fournit les SVG des marques |
| **L08** Petits retours de Julie | **D5** + arbitrages de contenu |
| **L10 / L11** Catalogue Ø Studio | décisions prises, mais 16 fiches à relire — revue **R3** |
| **L12** Livres blancs (4 pages `/document/*`) | **D7** + gating de #1465 |
| **L13** Prix + Espace client | **D8** |
| **L16** Statique vs aperçu | touche la publication — revue **R4** |
| **L17** Formulaires + GA4 | comptes tiers (Turnstile, GA4) |
| **L18** QA responsive | jugement visuel humain |
| **L22 / L23** Doc + formation, Jour J | humain |

## 4. Ce que la journée du 21/09 laisse derrière elle

À signaler à tout agent qui reprend, pour qu'il ne rouvre pas ces sujets :

- **Le bleu est tranché** (`#002fc7`, Design System Figma) et appliqué dans
  `theme.css` + `tokens.css`. L'ancien `#1a5bff` survit comme primitive
  `bleu-500` et comme fond « Bleu électrique ». Ne pas y revenir.
- **Plancher typographique 14px** et échelle en `rem` : verrouillés par
  `tests/e2e/typographie.spec.ts`. Les maquettes descendent à 10–12px — c'est
  un écart **assumé**, pas un oubli.
- **`global.css` impose `color: var(--color-navy)` à tous les h1–h4** et bat la
  couleur héritée d'un parent. Un titre sur aplat sombre doit porter
  lui-même sa classe (`text-on-primary`), sinon il reste bleu nuit sur bleu.
- **Dix sections** acceptent un fond sombre (`_select_data.fonds_etendus`).
  Pour en ouvrir une de plus : regarder ce qui est posé DIRECTEMENT sur le
  fond. Cartes blanches → seuls titre et chapeau ; pas de carte → aussi les
  icônes et les bordures. Sur fond sombre, **tout passe au blanc** :
  `primary-fixed-dim` ne donne que 3,1:1 sur le bleu électrique.
- **Écart assumé non tranché** : le bouton du Contact n'a pas de pictogramme
  (fidélité maquette), celui de la section « form » garde son avion en papier.
- **Deux articles FR sans traduction EN** (`societe-conseil-lambda-victrix`,
  `une-journee-dans-la-vie-secops`) — avertissement à chaque build.

## 5. Pièges d'outillage qui ont coûté du temps le 21/09

- **`git stash` avec le serveur de dev en marche** périme
  `.astro/data-store.json` pour la collection touchée : le fichier sur disque
  est bon, la page rend sans le champ. Remède : `rm -f .astro/data-store.json`
  et redémarrer. Ne pas utiliser `git stash` pour comparer un lint.
- Après une restauration de contenu **à chaud**, le serveur de dev peut servir
  une `TypeError` et faire échouer `design:previews` (« 0 enfant de
  #main-content ») **pendant que le build est vert**. Même remède.
- Le serveur de dev met **jusqu'à deux minutes** à répondre au premier appel
  après un cache vidé : ne pas conclure trop vite qu'il est mort.
- Un `npm run dev` lancé par un agent **survit au `npm` parent** et à un Ctrl+C
  dans un autre terminal. Le tuer par le port.
- **Vignettes** : toute passe qui change le rendu oblige à
  `npm run design:previews` (serveur de dev requis) → ~4 Mo de PNG dans le
  commit. Normal, mais c'est ce qui donne l'impression d'un « gros paquet ».
