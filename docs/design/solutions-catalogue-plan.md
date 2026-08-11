# Catalogue de solutions Ø Studio — base livrée et plan d'organisation

> 2026-08-05 — la maquette (`solutions-catalogue.css` + capture « Ø Studio -
> Catalogue de solutions ») n'est **pas finale** selon le user. La BASE
> ci-dessous est en place ; les suites sont listées §3 et à arbitrer §4.

## 1. Base livrée (2026-08-05)

| Pièce | Fichier |
| --- | --- |
| Collection `solutions` (schéma zod) | `src/content.config.ts` |
| Entrées de démonstration (9 FR + 9 EN, appariées par nom de fichier) | `src/content/solutions/{fr,en}/*.json` |
| Page catalogue FR/EN | `src/pages/[lang]/solutions.astro` |
| Libellés du chrome de page (FR/EN) | `src/i18n/content/solutions.ts` |

Rendu : barre outil (titre + **recherche client**), panneau **vedette** bleu
nuit (`featured: true`, première par `order`), **filtres** Secteurs/Types
(selects alimentés par les valeurs distinctes des entrées, `?secteur=&type=`
maintenus à l'URL), grille de cartes, panneau CTA bas. Mapping couleurs :
froids de la maquette **verbatim** (#F8F9FA/#F3F4F5/#C5C6D0/#00020A/#44474F/
#EDEEEF/#EAEAFF — précédents accueil/méga), bleus = **tokens** (#0038E6→
primary, #001B44→on-primary-fixed, #D8E2FF→primary-fixed).

### Modèle de données (une entrée)

```json
{
  "title": "…",
  "description": "…",
  "image": "",                  // chemin public ; "" = vignette grise
  "sector": "Municipalité",     // chip du haut + filtre « Secteurs d'activité »
  "solutionType": "Dynamics 365", // chip du pied + filtre « Types de solution »
  "featured": false,             // true = panneau vedette
  "order": 10,                   // tri croissant
  "href": "/contact",            // SANS préfixe de langue (convention navigation)
  "docHref": ""                  // bouton « Voir la documentation » (vedette)
}
```

`sector`/`solutionType` sont des chaînes LIBRES : les filtres se construisent
tout seuls — pas d'enum à maintenir tant que la taxonomie n'est pas actée.

## 2. Décisions prises (à confirmer)

- **Route `/[lang]/solutions`** (FR = EN, comme /contact et /carrieres). La
  maquette se présente comme une app à part (barre propre, rail gauche 97 px,
  bouton clavardage) → intégrée ICI sous le chrome du site, barre outil en
  tête de contenu. Le rail et le clavardage ne sont PAS repris.
- **Pas de pages de détail** : « Découvrir » pointe vers `href` (démo :
  /contact ; Ø Bureau → /services/productivite/o-bureau). Le jour venu, un
  `[slug].astro` sous /solutions/ + `href` vide = lien auto vers le détail.
- **Images des cartes absentes** de la livraison design (URLs Google de la
  maquette non exportées) → vignettes grises en attendant.
- Boutons maquette « Filtres » et bascule de vue (grille/liste) NON repris
  dans la base (valeur faible tant que le catalogue est petit).

## 3. Suites planifiées

1. ~~**CloudCannon** : déclarer la collection `solutions`~~ → ✅ **FAIT
   (2026-08-07)** : collection déclarée dans `cloudcannon.config.yml` (éditeur
   data, carte preview, gabarits `schemas/solution-{fr,en}.json`, `_inputs`
   FR, uploads `public/images/solutions/`), groupe « Contenu du site ».
2. **Pages de détail** (`/solutions/<slug>`) quand le contenu existera —
   réutiliser les sections composables (service-hero, strategic-value,
   offer-cards, realisations, cta) plutôt qu'un gabarit dédié.
3. **Images réelles** des vignettes + visuel vedette (Ø Bureau) à exporter du
   .fig → `public/images/solutions/`.
4. ~~**Navigation**~~ ✅ **TRANCHÉ ET FAIT (2026-08-11, décision user)** :
   « Catalogue de solutions » ajouté à la colonne PRODUITS du méga-menu
   (`src/data/navigation/{fr,en}.json`) ET du pied de page (`src/i18n/ui.ts`),
   FR + EN. PAS d'entrée top-level (le header reste fidèle à la maquette Figma,
   6 entrées).
5. **Recherche interne** : les cartes ne sont pas des pages → hors Pagefind ;
   si le catalogue doit remonter dans /recherche, créer les pages de détail
   d'abord.
6. Si la taxonomie se fige : passer `sector`/`solutionType` en **enums** zod +
   selects CloudCannon (la page n'a pas à changer).

## 4. À trancher avec le design (maquette non finale)

- Chrome : le catalogue garde-t-il le header/footer du site (choix actuel) ou
  devient-il une application autonome (rail, clavardage) ?
- Chip type en pied de carte : la maquette code `rgba(234,234,255,0.1)`
  (quasi invisible sur blanc) — rendu ici en `#EAEAFF/60` d'après la capture.
- Le 8ᵉ secteur (carte « Gestion des formations ») est illisible sur la
  capture → « RH » posé en attendant.
- Typo du panneau CTA bas (30/700) vs têtes 40/700 du reste du site.
