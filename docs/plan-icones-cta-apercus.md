# Plan — aperçus des services enfants, banque d'icônes unique, appels à l'action

> Diagnostic et plan du 2026-09-18 (demande de Gabriel, après la revue de
> Clément sur le site dev). Trois chantiers indépendants, chacun livrable
> seul. Rien n'est commencé : décisions attendues en §4.

## 1. Aperçus absents sur les services enfants — diagnostic

**Symptôme.** Dans CloudCannon, les services imbriqués (ex.
`fr/productivite/plateforme-employe-intranet.json`) n'ont ni vignette dans la
collection ni éditeur visuel : la page d'aperçu est vide.

**Cause (confirmée le 2026-09-18 sur vocal-wren).** Le gabarit d'URL de la
collection `services` est `/[relative_base_path]/services/[slug]/`. Pour un
fichier imbriqué, `[relative_base_path]` vaut `fr/productivite`, donc
CloudCannon cherche `/fr/productivite/services/plateforme-employe-intranet/`
→ **404**, alors que la vraie page est
`/fr/services/productivite/plateforme-employe-intranet/` (200). Vignette et
éditeur visuel chargent tous deux cette URL : les deux échouent. Les 18
services enfants FR et les 18 EN sont touchés ; les services de premier niveau
sont corrects. La limite était consignée dans `cloudcannon.config.yml`
(commentaire « LIMITE CONNUE », 2026-07-29) en attendant un gabarit par
données.

**Ce que CloudCannon permet aujourd'hui** (docs relues le 2026-09-18) :
espaces réservés fixes `[relative_base_path]`, `[slug]`, `[full_slug]`,
`[collection]`… ; espaces réservés **par données** `{cle}` avec filtres
(`default=`, `if=`, `unless=`, `slugify`…) ; filtres aussi sur les fixes
depuis juillet 2025 (`[full_slug|unless=permalink]`) ; une collection peut
porter un `glob` (déjà utilisé pour `redirects`). Aucun filtre ne sait
extraire le « premier segment » d'un chemin.

**Correctif APPLIQUÉ le 2026-09-18 (config seule, à confirmer au premier
build CloudCannon).** La collection `services` est scindée en deux, une par
langue, chacune sur son dossier : `services_fr` (`src/content/services/fr`,
`url: /fr/services/[full_slug]/` — le chemin du fichier, sous-dossier compris)
et `services_en` (`src/content/services/en`, `url: /en/services/{slug}/` — le
champ « Adresse de la page », désormais obligatoire en EN ; les 6 pages EN
qui n'en avaient pas ont reçu leur nom de fichier, URL inchangée). Entrées
CMS écrites une fois (ancre YAML `&services_inputs`). Point à vérifier sur
le site dev : les « / » d'un slug EN imbriqué ne doivent pas ressortir
encodés (`%2F`) dans l'URL d'aperçu ; si c'est le cas, appliquer le plan de
repli ci-dessous.

**Plan de repli (~2-3 h, déterministe) — si le correctif ci-dessus échoue.**
1. Scinder par `glob`, même dossier : `services` garde `*/*.json` (gabarit
   inchangé) ; nouvelle collection `services_enfants` = `*/*/*.json`, nom
   « Services enfants », mêmes `_inputs`/schémas (bloc partagé par ancre
   YAML), gabarit d'URL par données : `url: "{permalink}"`.
2. Champ `permalink` (URL finale, ex. `/fr/services/productivite/…/`) posé
   par un script `npm run cms:permalinks` sur les 36 fichiers enfants
   (calcul = celui de la route `[...slug].astro` : `data.slug || chemin`),
   input `hidden` pour Julie.
3. Garde-fou au build (patron `h1-guard`) : `permalink` absent ou différent
   de l'URL calculée → **avertissement** avec la commande à lancer (pas
   d'erreur : un aperçu manquant ne doit pas rougir le build).
4. Grouper « Services » et « Services enfants » dans la barre latérale
   (`collection_groups`).

**Essai « sans `url` » — abandonné** (il aurait fallu tester à l'aveugle sur le site dev) ; pour mémoire : retirer `url:` de la collection
`services` et laisser CloudCannon apparier la sortie du build (la doc dit
qu'il « détermine l'URL de sortie probable après chaque build »). Si les
36 enfants ET les 12 parents obtiennent un aperçu, le correctif ci-dessus
est inutile. Si seuls les parents marchent, appliquer le correctif.

## 2. Banque d'icônes unique — état et plan

**État.** 11 sections ont une icône, chacune avec SA liste fermée
(`_select_data.icones_cartes`, `_bento`, `_outils`, `_expertises`,
`_solutions`, `_puces`, `_realisations`, `_chiffres`, `_carrieres_valeurs`,
`_carrieres_atouts`) et SON dictionnaire SVG inline dans le composant
(`ICONS`). 44 vignettes, ~33 dessins distincts. Sept clés existent dans
plusieurs listes avec des dessins DIFFÉRENTS (`bouclier` ×3, `groupe` ×3,
`croissance` ×3, `ampoule`, `document`, `etoile`, `insigne`). Aucun logo de
marque dans le dépôt (Microsoft, AWS, ServiceNow, Check Point, Happy At
Work) : « Happy At Work » n'apparaît qu'en texte (Découvrir, Carrières).
Julie demande la même chose (#1762, Lot 7).

**Cible.** UN sélecteur « Icône » identique partout, offrant toute la banque
avec vignette, en deux familles : **pictogrammes** (trait monochrome, teinté
par la section — l'existant) et **logos** (fichiers de marque rendus tels
quels, jamais teintés).

**Plan (~1,5-2 j).**
1. Module partagé `component-library/src/shared/icons.ts` (browser-safe) =
   un seul dictionnaire, clés uniques ; les doublons de dessin prennent une
   clé qualifiée (`bouclier-coche`, `groupe-mains`, `croissance-courbe`…).
2. Script de migration du contenu (≈ 600 valeurs, dont `coche` ×264) :
   par type de section, ancienne clé → clé unique. Rendu identique après
   migration (vérification : diff du `dist` avant/après, zéro changement).
3. Une seule liste `_select_data.icones` (libellé + vignette + famille) ;
   les 11 selects pointent dessus ; `generate-cms-previews.mjs` lit le
   module partagé (un dossier `public/images/cms/icones/<cle>.svg`).
4. Logos : dossier `public/images/cms/logos/`, entrée de la banque
   `{ cle: 'logo-microsoft', famille: 'logo', fichier }` ; les composants
   rendent `<img>` pour la famille logo (taille de la tuile conservée). **Les
   fichiers viennent de Victrix** (kit partenaire Microsoft = règles d'usage
   strictes ; Happy At Work = kit de l'organisme). En attendant : clés
   réservées, rendu vide.
5. Option : icônes Lucide supplémentaires (Lot 7 Julie) ajoutées au même
   dictionnaire — 0 changement de composant.

## 3. Appel à l'action dans les sections existantes

**État.** 16 composants ont `ctaLabel`/`ctaHref` ; 23 n'en ont pas. Dans
l'exemple de Gabriel (bento « Réinventez votre intranet », page Plateforme
employé), la carte claire a DÉJÀ un lien optionnel (`linkLabel`/`linkHref`,
vides dans le contenu → rien ne s'affiche) ; la carte sombre n'a rien.

**Cible.** Un bloc CTA optionnel (bouton primaire + bouton secondaire, même
patron que les héros ; vide = absent, rendu inchangé) sur les sections où un
appel à l'action a du sens :

| Section | Où | Note |
| --- | --- | --- |
| bento-metrics | carte sombre (bouton) | la carte claire garde son lien à flèche |
| benefits, value-tiles, photo-features, feature-boxes | bas de section | CTA de section, centré |
| strategic-value, text-photo | sous le texte | |
| stats, realisations, expertise-bento, timeline | bas de section | |
| award-card, testimonial(-cards), faq, tech-columns | bas de section | à confirmer, moins évident |

Hors périmètre : form, rich-text, logo-banner, tech-marquee, home-partners,
home-iso, solutions-catalogue (déjà des liens par item).

**Plan (~1 j pour 10-12 sections).** Partiel partagé
`component-library/src/shared/astro/cta-buttons.astro` (mêmes classes que
les héros, rendu nul si vide) ; props `ctaLabel/ctaHref/cta2Label/cta2Href`
+ entrées CMS (`_inputs` communes) ; provenance des CTA (`?cta=&de=`) déjà
automatique pour tout lien vers Contact. Zod : chaînes optionnelles null → "".

## 4. Décisions

1. Aperçus : correctif appliqué (collections par langue) — à CONFIRMER
   au premier build dev, y compris un service enfant EN (slug avec « / »).
   Repli `permalink` seulement si l'aperçu EN reste cassé.
2. Banque d'icônes : clés qualifiées pour les 7 doublons (migration) ou
   garder un seul dessin par clé (perte de 10 dessins) ? (recommandé :
   qualifier.)
3. Logos : qui fournit les fichiers (marketing Victrix) et lesquels
   (Microsoft Solutions Partner, AWS, ServiceNow, Check Point, Happy At
   Work, Alan Allman) ?
4. CTA : liste des sections du tableau à confirmer ; bouton seul ou double
   bouton ?
5. Ordre : aperçus (petit, bloque la revue de Clément) → CTA → banque
   d'icônes (le plus gros, à faire avant les logos).
