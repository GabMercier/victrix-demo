# Statut de l'importation du site existant — 2026-09-23

> Réponse à la question de Gabriel : « a-t-on bel et bien importé TOUT le
> contenu ? » — avec la page Intelligence artificielle en exemple, le classeur
> `architecture-refonte.xlsx` de Julie (feuille unique, 115 lignes, à jour du
> 23/09) et son message sur les articles et les « Documents ».
> Consigne retenue : **on peut reformuler et formater avec notre gabarit, mais
> on ne perd rien** (texte, images, liens).

## 1. La réponse courte

| Maille | Outil (rejouable) | État au 23/09 |
| --- | --- | --- |
| Chaque ADRESSE de l'ancien site mène à une page | `npm run check:old-urls`, `check:redirects --dist` | 175 redirections, 0 vers un 404 |
| Chaque PAGE a son texte (volume + titres H2/H3) | `npm run check:parite-texte -- --strict` | 151 pages, 3 assumées, 0 signalée |
| Chaque BLOC des ARTICLES est là | `blocs-manquants-articles.py` + `restaure-blocs-articles.py` | **0 bloc absent** (198 remis le 23/09) |
| Chaque BLOC, IMAGE et LIEN des PAGES est là | **`blocs-manquants-pages.py` — NOUVEAU (cette session)** | **87 pages sur 89 ont un écart** — tableau ci-dessous |

Donc : aucune page de l'ancien site n'a été oubliée, et aucun article n'a plus
de bloc manquant. Ce qui manque encore est **fin** — et c'est exactement ce
que Gabriel a vu sur la page IA : une image de héros remplacée par une photo
générique, une fin de phrase tombée, un lien perdu. Le nouveau rapport le
mesure page par page, prêt à coller.

### Le rapport des pages (hors articles) — `docs/migration/blocs-manquants-pages.md`

| | Services (66 pages) | Pages (18) | Campagnes (5) | Total |
| --- | ---: | ---: | ---: | ---: |
| Blocs de texte absents | 163 | 45 | 8 | **216** (1 757 mots ; 143 sont des blocs courts « à vérifier ») |
| Paragraphes retrouvés mais amputés (≥ 3 mots significatifs perdus) | 90 | 8 | 5 | **103** |
| Photos absentes | 79 | 36 | 8 | **123**, dont **17 images de héros** |
| Logos, pictos, certifications absents | 212 | 33 | 1 | **246** |
| Liens internes perdus | 95 | 10 | 1 | **106** |
| Blocs seulement reformulés (hors décompte) | | | | 340 |

Comment le lire, par ordre d'importance :

1. **17 images de héros remplacées** — accueil FR/EN, Productivité FR/EN,
   Carrières FR/EN, Découvrir FR/EN, Ø Studio FR/EN, IA FR/EN, Migration Azure,
   AWS, centre de ressources, campagne Licences, démo Ø Bureau EN. La photo
   d'origine n'a pas été rapatriée ; une image de dépôt (souvent générique) est
   posée à la place. C'est le premier écart visible par Julie.
2. **106 liens perdus** dans des blocs pourtant retrouvés : les pages mères
   (Cybersécurité ×7, Appro TI ×7, IA EN ×7, Services gérés EN ×6, Conseil
   stratégique ×5) ont perdu le maillage vers leurs enfants et vers les
   articles (`/audit-cybersecurite/`, `/zero-trust-network-access-ztna/`,
   `/sase-cloud/`, `/ia-servicenow/`…). La page EN d'IA n'a plus AUCUN lien
   dans son texte. Mauvais pour le SEO interne, et c'est ce que L08 (4) avait
   déjà vu sur la FAQ d'Accompagnement IA.
3. **41 pages avec au moins un bloc long absent** — les plus nets : les avis
   Gartner Peer Insights des 9 fiches Appro TI (« Note globale 4,3 ⭐ — 2 056
   avis », 3 citations clients par fiche), les 2 questions de la page Loi 25,
   le paragraphe d'accroche de l'accueil (43 mots), les 2 témoignages
   d'employés de Découvrir, le paragraphe « bien-être » de Carrières, 4 blocs du
   SEvOC. `/fr/merci/` (21 blocs) est déjà assumée : page redessinée.
4. **103 paragraphes amputés** : présents, mais une phrase ou une fin de phrase
   a sauté. Le rapport nomme les mots absents ; une partie sont des synonymes
   (« identifier » → « repérez »), à trier d'un coup d'œil.
5. **246 logos et certifications** : les 13 badges de certification de
   Cybersécurité (CISM, CISA, ISO 27001…), les 10 pictos d'outils M365 de
   Productivité, les logos Azure/AWS, Gartner. Julie les réclame dans son
   classeur (L33, L34, L28, L49). Dépend de D4 (fichiers de logos).

Hors décompte, par décision : le carrousel « Rencontrez nos experts » et
l'intitulé du formulaire « Parlons de vos projets » (14 occurrences), les
catégories WordPress du centre de ressources (`/categorie/*`), la page Merci.

## 2. La page Intelligence artificielle, en exemple

Source : <https://www.victrix.ca/expertise/intelligence-artificielle/> (50 blocs)
→ `src/content/services/fr/intelligence-artificielle.json` (11 sections).

| Écart | Source | Chez nous |
| --- | --- | --- |
| Image de héros | `istock-1494104649-scaled.jpg` (bulles « AI », 2048 px) | `/images/sections/intelligence-artificielle-hero.png` (photo de code générique, 768 px) |
| Fin de phrase (adoption de l'IA générative) | « …la mise en valeur des meilleures pratiques **et des recommandations pour le déploiement et l'optimisation de la donnée** » | s'arrête à « …en mettant de l'avant les meilleures pratiques » |
| Lien | « ServiceNow AI Platform » → `/ia-servicenow/` | libellé nu |
| Bouton | « Échangez avec un expert en IA », « Consultez nos experts » | « Planifiez une consultation » ×4 (reformulation assumable) |
| Widget | H2 « Rencontrez nos experts » (carrousel d'équipe) | absent (décision de gabarit) |
| Titres | 12 titres reformulés (« Nous mettons l'IA au service… » → « L'IA au service… ») | texte là — conforme à la consigne |

La version EN a les mêmes écarts, plus **7 liens perdus** (cybersécurité,
services gérés, Copilot 365, Copilot Studio, les 2 fiches enfants, l'article
ServiceNow AI) : son texte enrichi n'a plus un seul lien.

Sur cette page, rien n'a été « oublié » : elle a été **réécrite** dans le
gabarit en juillet (P-07), en perdant ces détails. Le même schéma se répète
sur les 66 pages de services — d'où l'intérêt d'un rapport, pas d'une relecture.

## 3. Ce que Julie voit dans CloudCannon ≠ ce qui existe dans `dev`

Le classeur de Julie pointe le site **`staging`** (`lawful-hare`). Or `dev` a
**42 commits** que `staging` n'a pas (depuis le 21/09) — et `staging` a 26
sauvegardes CloudCannon que `dev` n'a pas encore absorbées. Presque toutes ses
lignes « N'a pas été intégrée » sont faites dans `dev` :

| Ligne du classeur | Julie voit | État réel dans `dev` |
| --- | --- | --- |
| L46 Campagne Accompagnement en IA | « N'a pas été intégrée » | faite le 21/09 (L-pages), FR + EN |
| L51–L59 les 9 fiches Approvisionnement TI | « N'a pas été intégrée » ×9 | faites le 21/09 (18 pages FR + EN) |
| L62–L69 les 8 fiches Ø Studio « aucun aperçu » | `/fr/solutions/` sans fiche | 16 fiches avec leur page (L11, 22/09), `noindex` jusqu'à #1634 |
| L70–L76 les 7 fiches « non rapatriées, c'est voulu ? » | absentes | **rapatriées** (16/16 dans `src/content/solutions/fr/`) — à confirmer à Julie |
| L78 Campagne démo Ø Bureau | « N'a pas été intégrée encore » | faite le 21/09, FR + EN |
| L81 Liste de prix Check Point | « N'a pas été intégrée » | 191 SKU exportés (`src/data/prix/`), page = lot L-prix, bloqué par D12 |
| L115 article Conseil Lambda | « Article manquant » | **présent** dans `dev` depuis le 21/09 (`src/content/blog/fr/societe-conseil-lambda-victrix.md`, FR seul) |
| L114 Une journée dans la vie SecOps | « à supprimer et rediriger » | remis dans `dev` le 21/09 — **contradiction** à trancher (D19) |

**L'action qui débloque tout : la PR `dev` → `staging`** (H2 du plan), après
avoir absorbé les 26 sauvegardes de Julie (recette § 1 du plan :
`git merge origin/staging` + `merge-content-json.mjs` + `migrate-fonds-chauds.mjs`).
Tant qu'elle n'est pas faite, Julie valide un site vieux de trois jours.

Autres constats du classeur, à réponse simple :

- L5 Carrières « manque Greenhouse » → jeton Greenhouse attendu (décision en suspens).
- L30 Services infonuagiques « manque une section de 5 cartes » → confirmé par
  le rapport (blocs « Éléments à analyser » et 6 paragraphes amputés).
- L35 Tests d'intrusion « manque le formulaire pentest », L37 Loi 25 « manque le
  formulaire », L50 Appro TI « manque formulaire personnalisé » → même réponse
  que L-contact : UN formulaire de demande prérempli (`contactSujet`) ; à
  expliquer à Julie, ou à rouvrir si elle veut des champs spécifiques.
- L23/L25/L27/L45/L77 pages « nécessaires à l'architecture, en draft » → ce
  sont des pages intermédiaires de fil d'Ariane de SA nouvelle arborescence
  (`/services/applications/microsoft/…`) — voir `revue-classeur-julie.md` § 3 :
  réorganisation du graphe, pas faite, à décider AVANT la mise en ligne
  (redirections 301 en cascade sinon).

## 4. Articles — les deux « manquants » de Julie, et six autres

- **Conseil Lambda** : rien à faire côté code, il est dans `dev` (FR seul,
  avertissement de build assumé — D13). Arrive chez Julie avec la PR.
- **Une journée dans la vie SecOps** : Julie veut le supprimer et rediriger
  vers la page SOC. Nous l'avons remis le 21/09 (L-pages). Il cite en plus le
  livre blanc `/document/cybersecurite/` (2 liens).
- Son classeur marque aussi **« à supprimer et rediriger »** : L85 Annonce
  nomination CEO, L99 Nomination Dominic Lajoie, L100–L102 Meilleures pratiques
  (parties 1-2-3), L105 Réalité étendue. Les 6 existent FR + EN dans
  `src/content/blog/`. À trancher (D19) : retirer les fichiers + 301 vers les
  cibles qu'elle indique (`/decouvrir-victrix/`, `/services/cybersecurite/soc/`,
  `/services/ia/`), ou garder en `draft`.

## 5. Les 4 « Documents » WordPress — avis demandé par Julie

Ce sont des **pages de téléchargement à formulaire** (Gravity Forms) : un
texte d'accroche, une image, le formulaire, et le fichier envoyé par courriel.
Le fichier lui-même n'est pas dans le site — il faut le demander à Julie.

| Page | Contenu | Cité par | Aujourd'hui | Avis |
| --- | --- | --- | --- | --- |
| `/document/licences-microsoft-power-platform/` (2024) | guide PDF Ø Studio | articles Gouvernance Power Platform FR + EN | 301 → `/fr/campagnes/licences-power-platform/` (campagne reprise, même formulaire) | **d'accord avec Julie : ne pas remettre le guide 2024.** Garder la campagne ? Elle date aussi. Sinon 301 vers la fiche Ø Studio |
| `/document/pourquoi-gerez-vous-encore-vos-ti/` (2023) | one-pager services gérés | article Tendances TI (CTA « Téléchargez le guide ») | 302 d'attente → `/fr/ressources/` | **ne pas remettre** → 301 vers `/fr/services/services-ti-geres/` ; retirer le CTA de l'article |
| `/document/cybersecurite/` (2022) | livre blanc SEvOC | article SecOps (2 liens) | 302 d'attente → `/fr/ressources/` | **ne pas remettre** → 301 vers la page SOC ; l'article est lui-même à retirer (§ 4) |
| `/document/webinaire-copilot-buzz-impact/` (sept. 2025) | présentation PDF du webinaire, bannière LinkedIn | article Copilot vs ChatGPT (bannière + lien) | 302 d'attente → `/fr/ressources/` | **le seul à remettre**, comme Julie : une page « ressource à télécharger » = le gabarit minimal de L12 (formulaire → téléchargement + évènement GA4), il faut le PDF |

Conséquence sur le plan : **D7 se réduit à UN document** ; L12 tombe de 1 j à
≈ 0,5 j (un gabarit, une page, 3 redirections définitives, 6 liens d'articles à
corriger, retrait des 4 entrées `ALLOW` du garde-fou des liens).

Note : la copie locale `C:\Repo\Victrix\architecture-refonte.xlsx` n'a qu'une
feuille (`Feuil1`) — la section « Documents » de la capture d'écran est dans une
feuille de priorité que cette copie ne contient pas. Les 4 URL sont bien celles
ci-dessus.

## 6. Prochaines étapes, dans l'ordre

| # | Quoi | Qui | Effort |
| --- | --- | --- | --- |
| 1 | Absorber `staging` dans `dev`, puis **PR `dev` → `staging`** (Julie prévenue) | Gabriel | 1 h |
| 2 | Répondre à Julie : Lambda déjà là, Documents (§ 5), fiches Ø Studio rapatriées, formulaires = un seul prérempli | Gabriel | 15 min |
| 3 | Trancher **D19** (7 articles à retirer + 301) et **D7** réduit (webinaire seul) | Gabriel + Julie | — |
| 4 | **Lot L-restaure-pages** : héros (17), liens (106), blocs longs (41 pages), amputés (103), depuis le rapport — prompt dans le plan | Opus | 1,5–2 j |
| 5 | Logos et certifications (246) — avec D4 (fichiers) : lot L07 | Marketing puis Opus | 1 j |
| 6 | R3-3…8, L12 réduit, L08 reste, L06, L16, phase 4 | | inchangé |

Le rapport se rejoue après chaque lot : `npm run build` puis
`python scripts/migration/blocs-manquants-pages.py` — l'objectif est un
rapport où il ne reste que des écarts assumés et nommés.
