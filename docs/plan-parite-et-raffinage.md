# Plan — parité de contenu, raffinage Accueil/Découvrir, campagnes et catalogue Ø Studio

> Rédigé le 2026-09-21 pendant qu'un autre lot tourne (bleu Figma + page
> Contact) : **rien n'a été modifié dans le code ni dans le contenu**. Ce
> document répond à la question « avons-nous tout ce qu'il nous faut ? », liste
> les lots dans l'ordre, et pose le **contenu déjà rédigé** pour la page
> Découvrir et l'Accueil.
>
> Complète `docs/plan-livraison-finale.md` (les lots L10, L11 et L14 y sont
> déjà écrits — ils sont repris ici sans être réécrits).

## 1. Réponse courte

**Oui, sauf trois choses**, et aucune n'est bloquante pour commencer.

| Ce qu'il faut | État |
| --- | --- |
| Texte + structure de TOUTES les pages de l'ancien site | ✅ Export WXR complet, 18 XML du 2026-07-23, `C:\Repo\Victrix\siteWP\export\` — pages publiées, **brouillons et pages cachées comprises** |
| Données des widgets SiteOrigin (valeurs, histoire, témoignages, carrousels) | ✅ présentes en `wp:postmeta` → `panels_data` (JSON) dans l'export ; extractibles |
| Pages Brizy (campagnes, Check Point, vœux, démos) | ✅ présentes dans l'export (10 fichiers en contiennent) ; deux ont déjà été reprises par script |
| Le site actuel en ligne, pour recouper | ✅ `https://www.victrix.ca/` répond **200** (vérifié aujourd'hui) |
| Catalogue Ø Studio | ✅ API WordPress ouverte, **200** vérifié aujourd'hui (`/wp-json/wp/v2/pages`), 16 fiches + 75 images ; plan et décisions déjà écrits |
| Médias de l'ancien site | ✅ 943 fichiers inventoriés (`docs/migration/urls-medias.csv`), `fetch-media.mjs` rapatrie à la demande |
| **① Carte ancienne URL → nouvelle URL** | 🟡 **amorcée le 21/09** : `scripts/migration/check-parite-live.py` compare le site EN LIGNE au dépôt et écrit `docs/migration/parite-live.md` — 150 URL examinées, 127 retrouvées, **20 renommages à rediriger**, **3 sans équivalent**. À finir en lot P1 (le rapport ne couvre pas encore les pages `noindex`, absentes du plan de site). `docs/migration/redirections.csv` ne sert PAS de carte : ce sont les 98 redirections **internes au WordPress** (ancienne → ancienne) |
| **② Liste des campagnes ACTIVES** | ✅ **faite le 21/09 sans attendre Julie** → `docs/inventaire-campagnes.md` : 14 pages `noindex` recensées par trois sources croisées (export, API REST du site, balayage de 203 URL), 4 déjà reprises, 4 à décider. Reste une seule question de contrôle, bornée (§ 5 de l'inventaire) |
| **③ Textes `alt`, prix validés, logos de marque** | ❌ humains : `alt` des 75 images Ø Studio (Julie), prix publics (#1634, Marjorie), fichiers de logos à jour (D4) |

## 2. Ce que j'ai constaté dans le dépôt aujourd'hui

### Découvrir (`src/content/pages/{fr,en}/decouvrir.json`)

Sections actuelles : `service-hero` · `strategic-value` « Notre culture » ·
`bento-metrics` « Victrix en un coup d'œil » · `benefits` « Nos valeurs » ·
`timeline` « Notre histoire » · `cta` « Nous recrutons ».

Écarts avec le site actuel :

1. **« Notre écosystème » (Galaxie Alan Allman Associates) n'existe pas chez
   nous.** Seule une phrase du bento le mentionne. C'est un bloc entier du site
   actuel (quinzaine de cabinets, 4 pôles, 3 300 experts, présence
   internationale) → contenu rédigé au § 5.1.
2. **Les 5 valeurs n'ont aucune description** (`description: ""` × 5). Le site
   actuel n'en a pas non plus — donc soit on assume les mots seuls, soit on
   écrit le texte : proposition au § 5.2.
3. **« Notre mission » a été fondue dans le chapeau du bento.** Le texte
   officiel en deux paragraphes n'est plus affiché tel quel → § 5.3.
4. Le widget **Témoignages** et le **carrousel d'articles** de la page actuelle
   n'ont pas d'équivalent sur notre page (leurs données sont dans
   `panels_data`).

### Accueil (`src/content/home/{fr,en}/accueil.json`)

Sections actuelles (FR et EN identiques) : `home-hero` · `home-expertises` ·
`home-solution` · `home-solutions` · `home-latest` · `home-experts`.

L'accueil actuelle de victrix.ca aligne : intro + image · expertises ·
carrousel texte/image · **carrousel de logos** · appel à l'expert · carrousel
d'articles · image de preuve. Donc **ce qui manque, c'est la preuve** :

1. **Aucune bande de logos** — c'est exactement la demande déjà formulée
   (logos en noir et blanc, couleur au survol). Les composants
   `home-partners` (noms en texte) et `logo-banner` (vrais logos + badge)
   existent mais **ne sont utilisés sur aucune des deux accueils**.
2. **Aucune preuve institutionnelle** : `home-iso` (« Ils nous font
   confiance », ISO 27001:2022 / 9001:2015, HappyIndex AtWork) existe dans la
   bibliothèque et n'est posé nulle part sur l'accueil.
3. **Aucun témoignage client** sur l'accueil (`testimonial` et
   `testimonial-cards` existent, servent ailleurs).
4. Rappel d'un défaut connu non corrigé : la **zone lisible du héros
   d'accueil** (dégradé blanc gauche→droite) déborde sur la photo à 390 et
   820 px — la correction a été faite sur `service-hero`, proposée puis
   **pas** faite sur `home-hero`.

### Campagnes

Route `/[lang]/campagnes/[slug]` et collection `landing` = **3 pages**
(`demo-sections`, `evaluation-securite`, `licences-power-platform`), FR + EN.
Recensé dans l'ancien site, non repris à ce jour :

| Page de l'ancien site | Statut WP | Proposition |
| --- | --- | --- |
| Liste de prix Check Point FR + EN (Brizy) | publié | **décision marketing** : c'est un outil de commande, pas une page vitrine |
| Vœux des fêtes FR + EN (Brizy) | publié | **à reprendre** — vérifié le 21/09 : la page est à jour pour 2025 (17 images déposées en novembre 2025), c'est une campagne saisonnière vivante, pas un vestige |
| « Êtes-vous en sécurité ? » | brouillon | abandonner ou refaire en campagne |
| Dîner Victrix × Palo Alto | brouillon | abandonner (événement passé) |
| Événement Victrix × Cask × ServiceNow (20 mai 2025) | brouillon | abandonner (événement passé) |
| « Protégé : Documents O bureau » | publié, mot de passe | dépend de L12 (accès conditionnel) |
| 4 documents `dlm_download` (livres blancs, webinaire) | publié | = L12 |
| Landing Démo O bureau FR + EN | publié | ✅ déjà repris (21/09) |
| Landing AI Consulting / Accompagnement IA FR + EN | publié, caché | ✅ déjà repris (21/09) |

➜ Recensement complet, méthode et décisions : **`docs/inventaire-campagnes.md`**
(21/09). Conclusion : aucune campagne inconnue dans l'export **ni** en ligne ;
en revanche 9 articles ont changé de slug depuis l'export et 10 anciennes URL
de services répondent encore 200 → 19 redirections à écrire.

### Catalogue Ø Studio

Rien à changer au plan : `docs/plan-import-catalogue-ostudio.md` + lots **L10**
et **L11** de `docs/plan-livraison-finale.md` sont prêts, décisions prises, et
la source répond encore. 9 des 16 fiches existent en carte seulement ; 7 fiches
sont à créer ; les fiches EN n'existent pas (décidé : carte EN → Contact).

## 3. Les lots, dans l'ordre

Chacun est une session neuve (CLAUDE.md chargé). Estimés en jours assistés.

### P1 — Filet de parité : « on n'a rien perdu », prouvé par un script (0,5 j)

Le plus important : il rend les trois lots suivants vérifiables. C'est le L14
du plan de livraison, mais outillé plutôt que rédigé à la main.

**Déjà en place** (21/09) : `scripts/migration/check-parite-live.py` compare le
site EN LIGNE au dépôt (`docs/migration/parite-live.md`, cache
`docs/migration/urls-live.csv`) et `scripts/migration/extract-source-page.py`
extrait le contenu d'une page source. Ce qui reste à faire en P1 : couvrir
l'export WXR (donc les pages `noindex` et les brouillons), compter les mots, et
brancher le tout sur le gate.

```text
Lot P1 de docs/plan-parite-et-raffinage.md.
But : un rapport qui prouve, ligne par ligne, que rien de l'ancien site n'est
perdu — et qui se rejoue. Pars de scripts/migration/check-parite-live.py
(déjà écrit : plan de site en ligne → dépôt, table ALIAS des renommages, table
ROUTES des pages sans fichier de contenu) et de docs/inventaire-campagnes.md.
1. Étends-le pour lire aussi l'export WXR
   (C:\Repo\Victrix\siteWP\export\*.xml, 174 contenus : pages, expertises,
   articles, dlm_download, brouillons ET pages cachées comprises) et le
   contenu du dépôt ; sort docs/inventaire-pages.md = une ligne par URL de
   l'ancien site → nouvelle URL, ou « redirigée vers … », ou « abandonnée
   (motif) », avec l'état FR/EN. Table de correspondance EXPLICITE dans un
   JSON à part (les slugs EN diffèrent : /en/expertise/cloud-services-provider
   → /en/services/…), pas de devinette par slug.
2. Le script compte aussi les MOTS de la source et de la cible et signale les
   pages dont le texte a fondu de plus de 30 % (repérage des sections
   oubliées, comme l'écosystème de Découvrir).
3. npm run check:parite ; sortie non nulle si une URL est « sans destination ».
Ne modifie aucun contenu. Rituel.
Note : docs/migration/redirections.csv ne sert PAS de carte (ce sont les
redirections internes de l'ancien WordPress).
```

### P2 — Page Découvrir complétée (0,5 j)

```text
Lot P2 de docs/plan-parite-et-raffinage.md § 5.1 à 5.3.
1. Ajoute la section « Notre écosystème » (strategic-value) aux deux fichiers
   decouvrir.json, FR et EN, entre `timeline` et `cta` — contenu et JSON au
   § 5.1, clés complètes (le CMS n'affiche que les clés présentes).
2. Rapatrie l'image de la galaxie Alan Allman (elle EXISTE, vérifié :
   `2024/01/galaxie-v12-bleu-1-scaled.jpg` — média 6175, attaché à la page
   Découvrir EN ; variante PNG détourée : `2024/01/galaxie-alan-allman-
   associates-png.png`, média 6170) vers public/images/sections/, en WebP
   comme le héros d'accueil.
3. Remplis les descriptions des 5 valeurs (§ 5.2) et le bloc mission (§ 5.3) —
   ces textes sont des PROPOSITIONS : marque-les dans la réponse finale comme
   « à valider par Julie ».
4. Vérifie le rendu FR et EN sur le serveur de dev, contraste AA compris.
Rituel.
```

### P3 — Accueil : la preuve (0,5–1 j)

Dépend de la décision D4 (quels fichiers de logos). Les 8 SVG de l'ancien site
sont rapatriables tout de suite ; 3 PNG sont à refaire par le marketing.

```text
Lot P3 de docs/plan-parite-et-raffinage.md § 5.4.
1. Rapatrie les logos de partenaires (8 SVG listés dans
   docs/migration/urls-medias.csv : microsoft, cisco, checkpoint, crowdstrike,
   paloalto, algosec, zscaler, aws) vers public/images/partenaires/.
2. logo-banner : ajoute l'option « logos en nuances de gris, couleur au
   survol » — utilitaires Tailwind uniquement (grayscale / hover:grayscale-0 /
   transition), champ booléen `nuances` au composant + spec + zod + backfill
   (scripts/backfill-section-keys.mjs puis npm run fix:sections).
3. Pose sur l'accueil FR et EN : logo-banner après home-expertises, home-iso
   (preuve ISO + HappyIndex) après home-solutions. Contenu au § 5.4.
4. Mesure l'effet sur le poids de la page ; garde la bande accessible
   (les logos ne sont pas des liens, alt = nom de la marque).
Hors périmètre sauf accord : témoignage client sur l'accueil, correction de la
zone lisible du héros d'accueil (les deux sont au § 6 en option).
Rituel.
```

### P4 — Campagnes : recenser, décider, importer (0,5–1 j)

**P4 est aux trois quarts fait.** Recensement (21/09) et décisions de Gabriel
(21/09) dans `docs/inventaire-campagnes.md` § 6 : vœux des fêtes **non
reprises**, documents O bureau **non repris** (les deux redirigés), listes de
prix Check Point **reprises tel quel avec notre système de design**, et la
continuité SEO traitée (matrice de 175 redirections, 9 slugs d'articles
alignés sur le site en ligne). **Reste uniquement la page de prix Check
Point** : données déjà extraites (191 SKU FR/EN dans `src/data/prix/`), forme
proposée au § 7 de l'inventaire, une question ouverte (prix éditables au CMS
ou figés).

```text
Lot P4 (reste) de docs/plan-parite-et-raffinage.md : la page de prix Check Point.
Lis docs/inventaire-campagnes.md § 7 (forme proposée, mécanisme de l'ancienne
page, question ouverte) et src/data/prix/check-point.fr.json (191 SKU, déjà
extraits — ne pas re-télécharger : scripts/migration/export-prix-check-point.py
est rejouable si les prix changent).
1. Dis-moi d'abord si les prix restent en données éditables (src/data/prix/) ou
   figés, et ATTENDS ma réponse — ça change le schéma.
2. Composant Bookshop `price-table` : 100 % utilitaires Tailwind, AUCUN script
   (règle 6), tableau accessible (<caption>, en-têtes de colonnes, lecture au
   clavier, défilement horizontal annoncé), colonne Action = lien vers
   /fr/contact/?sujet=…&produit=<SKU>. Lignes fournies par le seam `enrich` de
   la route, comme les formulaires. Spec + zod + vignette + backfill.
3. Pages FR et EN, `noindex: true` tant que le marketing n'a pas fourni la
   mention de bas de page (validité des prix, PDSF) — l'astérisque du titre
   n'est expliqué nulle part sur la page source.
4. Retirer les deux entrées de `temporaires` (302) de
   docs/migration/correspondance-urls.json au profit d'une 301 vers les
   nouvelles pages, puis `npm run build:redirects`.
5. e2e : la page rend les 191 lignes, un clic sur Action arrive sur /contact
   avec le SKU prérempli.
Rituel.
```

### P5 — Catalogue Ø Studio : L10 puis L11 (2,5 j)

Inchangés — prendre les prompts **L10** puis **L11** dans
`docs/plan-livraison-finale.md`. Sources revérifiées le 21/09 : l'API répond.
Revue Fable **R3** après L11 (nouvelle route, 16 pages).

## 4. Ordre conseillé

P1 (le filet) → P2 (Découvrir, le plus visible et le plus rapide) → P4
(campagnes : la décision de Julie arrive pendant P2/P3) → P3 (accueil, dès que
D4 est tranchée) → P5 (Ø Studio, le plus gros).

## 5. Contenu prêt à poser

### 5.1 Découvrir — section « Notre écosystème »

Texte repris **mot pour mot** du site actuel (rien d'inventé sauf les trois
tuiles de chiffres, qui reformulent le paragraphe).

```json
{
  "_bookshop_name": "strategic-value",
  "type": "strategic-value",
  "title": "Notre écosystème",
  "paragraphs": [
    "<strong>Alan Allman Associates</strong> est un écosystème dynamique regroupant un portefeuille d'une quinzaine de cabinets de conseil, répartis autour de quatre pôles d'expertises clés : haute technologie, transformation industrielle, stratégie et gestion, ainsi que marketing numérique.",
    "Avec une communauté de plus de 3 300 experts à la fin de 2024, notre présence s'étend à l'international, notamment en France, au Benelux, dans la péninsule ibérique, en Asie et en Amérique du Nord."
  ],
  "image": "/images/sections/galaxie-alan-allman.jpg",
  "imageAlt": "La galaxie Alan Allman Associates",
  "stats": [
    { "value": "15", "label": "cabinets de conseil" },
    { "value": "4", "label": "pôles d'expertises" },
    { "value": "3 300+", "label": "experts dans le monde" }
  ],
  "variant": "produit",
  "badge": "",
  "bullets": [],
  "cardTitle": "",
  "cardText": "",
  "fond": "ivoire"
}
```

EN (traduction à faire relire — la page `/en/discover-victrix/` de l'ancien
site contient la version officielle, à préférer si elle est extractible) :

```json
{
  "_bookshop_name": "strategic-value",
  "type": "strategic-value",
  "title": "Our ecosystem",
  "paragraphs": [
    "<strong>Alan Allman Associates</strong> is a dynamic ecosystem of some fifteen consulting firms, organized around four key areas of expertise: high technology, industrial transformation, strategy and management, and digital marketing.",
    "With a community of more than 3,300 experts as of the end of 2024, our presence extends internationally — France, Benelux, the Iberian Peninsula, Asia and North America."
  ],
  "image": "/images/sections/galaxie-alan-allman.jpg",
  "imageAlt": "The Alan Allman Associates galaxy",
  "stats": [
    { "value": "15", "label": "consulting firms" },
    { "value": "4", "label": "areas of expertise" },
    { "value": "3,300+", "label": "experts worldwide" }
  ],
  "variant": "produit",
  "badge": "",
  "bullets": [],
  "cardTitle": "",
  "cardText": "",
  "fond": "ivoire"
}
```

### 5.2 Découvrir — descriptions des 5 valeurs

**Texte neuf** (le site actuel n'affiche que les mots) — à valider par Julie.

| Valeur | FR | EN |
| --- | --- | --- |
| Excellence | Livrer des solutions de grande qualité et tenir la promesse faite au client, sur chaque mandat. | Delivering high-quality solutions and keeping the promise we made to the client, on every mandate. |
| Collaboration | Travailler avec nos clients et nos partenaires comme une seule équipe, du diagnostic à la mise en service. | Working with our clients and partners as one team, from assessment to go-live. |
| Innovation | Chercher la meilleure façon de faire plutôt que la plus habituelle, et la mettre à l'épreuve du terrain. | Looking for the best way of doing things rather than the usual one, then proving it in the field. |
| Engagement | Prendre la responsabilité du résultat, pas seulement celle de la tâche. | Taking responsibility for the outcome, not just for the task. |
| Intégrité | Dire ce que nous faisons et faire ce que nous disons, y compris quand c'est inconfortable. | Saying what we do and doing what we say, even when it is uncomfortable. |

### 5.3 Découvrir — bloc « Notre mission »

Texte officiel, à replacer tel quel (aujourd'hui raccourci dans le chapeau du
bento). Section `rich-text` ou `callout` juste après le héros :

> **Notre mission**
>
> Victrix s'est engagée à être l'entreprise de services TI la plus réputée au
> Canada en matière de productivité d'affaires, en façonnant une culture
> d'entreprise où ses employés, partenaires et clients peuvent aller au bout de
> leurs ambitions.
>
> En offrant des solutions technologiques de grande qualité et une expérience
> client de premier ordre, Victrix se distingue en contribuant de façon
> significative à la performance et la compétitivité de ses clients.

### 5.4 Accueil — les deux sections manquantes

**Bande de logos** (`logo-banner`, après `home-expertises`, fond ivoire) —
8 marques rapatriables immédiatement ; 3 autres (Proofpoint, Juniper,
ServiceNow) attendent des fichiers à jour :

| Marque | Fichier source (ancien site) |
| --- | --- |
| Microsoft | `logo-microsoft.svg` |
| Cisco | `logo-cisco.svg` |
| Check Point | `logo-checkpoint.svg` |
| CrowdStrike | `logo-crowdstrike.svg` |
| Palo Alto Networks | `logo-paloalto.svg` |
| AlgoSec | `logo-algosec.svg` |
| Zscaler | `logo-zscaler.svg` |
| AWS | `logo-aws.svg` |

Titre FR « Nos partenaires technologiques » / EN « Our technology partners ».
Badge : à confirmer (les badges partenaires 2022-2023 sont peut-être périmés —
c'est la décision D4).

**Preuve institutionnelle** (`home-iso`, après `home-solutions`) :

```json
{
  "_bookshop_name": "home-iso",
  "type": "home-iso",
  "fond": "blanc",
  "title": "Ils nous font confiance",
  "subtitle": "La sécurité de l'information au cœur de toutes nos pratiques.",
  "items": [
    { "value": "ISO/IEC 27001:2022", "label": "sécurité de l'information" },
    { "value": "ISO 9001:2015", "label": "management de la qualité" },
    { "value": "Depuis 2003", "label": "au service des organisations d'ici" },
    { "value": "HappyIndex® AtWork", "label": "entreprise où l'on est heureux de travailler" }
  ]
}
```

EN : « They trust us » / « Information security at the heart of everything we
do. » — mêmes valeurs, `label` traduits.

## 6. Options, à décider par Gabriel (pas glissées dans les lots)

1. **Témoignage client sur l'accueil** — les citations existent dans
   `panels_data` de l'ancien site ; composant `testimonial` disponible.
2. **Zone lisible du héros d'accueil** (défaut connu à 390 et 820 px) : même
   correction à 3 paliers que `service-hero`, ~2 h + tests.
3. **Carrousel d'articles** de l'ancien Découvrir : notre `related-posts`
   pourrait le remplacer.
4. **Liste de prix Check Point** : reprise ou abandon (outil de commande).

## 7. À demander aux humains (à lancer maintenant, délai externe)

| # | Qui | Quoi |
| --- | --- | --- |
| ② | Julie / Clément | La liste des **URL de campagnes actives** (pages `noindex`, hors plan de site) — sans elle, P4 ne peut pas être complet |
| ③a | Julie | Les **textes alternatifs** des 75 images du catalogue Ø Studio (L10 produit la liste) |
| ③b | Marjorie (#1634) | **Prix publics** du catalogue Ø Studio — tant qu'ils ne sont pas validés, les fiches restent `noindex` |
| ③c | Marketing (D4) | Fichiers **logos de marque** à jour + validité des badges partenaires |
| — | Julie | Validation des **textes neufs** des § 5.2 et 5.3 |
