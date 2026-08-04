# Références design retenues (v2) & points à signaler — refonte Victrix.ca

> **DÉCISION v2 (2026-08-04, après examen des maquettes — remplace la v1 du
> même jour « les exports seuls font foi »)** : les exports HTML présentent des
> incohérences internes (Accueil ≠ les 4 autres pages, échelle de rayons
> suspecte) ; la planche **`DesignSystemVictrix.png` est la référence la plus
> cohérente**. Hiérarchie retenue :
> - **STRUCTURE des pages** (markup, rôles de tokens, layout, spacing) =
>   les 5 exports HTML (`docs/design/Export HTML/`) ;
> - **SYSTÈME visuel** (palette, typographie, style des composants, rayons) =
>   la planche `docs/design/Design system/DesignSystemVictrix.png`.
> On **garde les éléments qui correspondent, on transforme ce qui ne
> correspond pas**. Implémenté dans `src/styles/theme-refonte.css` ; visible
> sur `/fr/design-lab/{palettes, refonte, page-expertise}`.

| Sujet | Statut | Valeur retenue |
|---|---|---|
| Palette | ✅ tranché | 6 ancres planche projetées sur les rôles Material des exports (§1) — **dérivés à valider** |
| Typographie | ✅ tranché | Tailles/rôles des exports, **graisses de la planche** (Display Bold, Headlines SemiBold, Label/Button Medium) |
| Rayons | ✅ tranché | Échelle planche/charte : 4px boutons · 8px cartes · chips **pilule** (→ `rounded-full` rond) |
| Spacing / layout | ✅ tranché | Exports (= planche : base 8px, sections 80-120, conteneur 1280) |
| CTA | ✅ tranché | `primary` (Bleu Victrix) |
| Dérivés de palette | 🔔 à valider | Nos interpolations entre les 6 ancres (§2.a) |
| `Accueil.html` | 🔔 à signaler | Ré-export souhaité (hors-norme sur ~10 axes) |
| Contraste a11y | 🔔 à valider | Blanc sur `#1A5BFF` ≈ 4:1 (limite AA texte normal) |
| Images mortes | 🔔 à signaler | 5 visuels à ré-exporter du `.fig` (Annexe A) |
| Périmètre | 🔔 à signaler | Maquettes manquantes + routes à créer (Annexe B) |

---

## 1. Application — les 6 ancres planche projetées sur les rôles Material

Les NOMS de rôles restent ceux du frontmatter/exports (le markup les consomme) ;
les VALEURS sont ré-ancrées. Ancres : **Ivoire chaud `#FAF7F3`** · **Beige doux
`#F2ECE4`** · **Sable clair `#E9E1D6`** · **Anthracite `#1A1F28`** · **Bleu
Victrix `#1A5BFF`** · **Bleu nuit `#0D1430`**.

| Rôle (exports) | Avant (frontmatter) | Retenu | Source |
|---|---|---|---|
| `surface` / `background` | `#FCF9F5` | `#FAF7F3` | ancre Ivoire |
| `surface-container` | `#F0EDEA` | `#F2ECE4` | ancre Beige |
| `surface-container-highest` / `surface-variant` | `#E5E2DE` | `#E9E1D6` | ancre Sable |
| `surface-container-low` / `-high` / `-dim` | échelle froide | `#F7F2EB` / `#EEE7DB` / `#DED5C6` | dérivés |
| `on-surface` / `on-background` | `#1C1C1A` | `#1A1F28` | ancre Anthracite |
| `on-surface-variant` | `#444656` | `#4A5160` | dérivé |
| `outline` / `outline-variant` | `#747688` / `#C4C5D9` | `#767B87` / `#E0D8CA` | dérivés (bordures chaudes) |
| `primary` | `#002FC7` | `#1A5BFF` | ancre Bleu Victrix |
| `primary-container` | `#1D46F3` | `#1348D6` | dérivé (hover/états) |
| `primary-fixed` / `-fixed-dim` | `#DEE0FF` / `#BAC3FF` | `#DCE6FF` / `#9DB8FF` | dérivés |
| `on-primary-fixed` (overlays, bandes sombres) | `#00105B` | `#0D1430` | ancre Bleu nuit |
| `secondary` (+ famille) | `#515D82`… | `#47536E`… | dérivés (ardoise re-teintée nuit) |
| `tertiary` (+ famille) | `#424648`… | `#42464E`… | dérivés (gris anthracite) |
| `error` (famille) | `#BA1A1A`… | inchangée | aucune contradiction |

**Typographie** (planche §3) : `display` 56/1.1/**700**/-0.5 % · `headline-lg`
40/1.2/**600** · `headline-md` 24/1.3/**600** · `body-md` 16/1.6/400 (+
`body-lg` 18, extension des exports) · `label-caps` 12/**500**/0.12em ·
`button` **16/500**/0.02em. Les graisses 700/800 et le button 14/600 des
exports sont transformés.

**Rayons** (planche §Composants, recoupe la charte .md) : `rounded` 0.25rem
(boutons), `lg` 0.5rem (cartes), chips **pilule** → `rounded-full` garde le
rond natif ; l'échelle des configs d'export (décalée d'un cran, `full:
0.75rem`) est écartée comme artefact du générateur.

## 2. Points à signaler / valider avec l'équipe design

### a. Les valeurs DÉRIVÉES de la palette 🔔

La planche donne 6 ancres ; les ~40 autres rôles Material sont NOS
interpolations (marquées « dérivé » dans `theme-refonte.css` et sur
`/fr/design-lab/palettes`). À valider — en particulier `primary-container`
`#1348D6` (états/hover), `outline-variant` `#E0D8CA` (bordures de cartes sur
fonds chauds) et la famille `secondary` `#47536E`.

### b. Contraste d'accessibilité 🔔

Blanc sur Bleu Victrix `#1A5BFF` ≈ 4:1 — suffisant pour boutons/texte large
(AA 3:1), limite pour du texte normal (AA 4.5:1). À valider pour les liens et
petits libellés sur fond primaire.

### c. `Accueil.html` — ré-export souhaité 🔔

Diverge des 4 autres pages sur ~10 axes (Manrope/Inter jamais chargées,
échelle d'espacement parallèle, `headline-lg` 32 vs 40, CTA sur `secondary`).
Génération antérieure probable. En attendant : structure des 4 pages = normative.

### d. Artefacts de génération constatés (corrigés au portage, pour info)

- Échelle de rayons des 5 configs décalée d'un cran + `full: 0.75rem` (aurait
  écrasé 10 éléments réellement circulaires — les chips pilule de la planche
  confirment le rond) ;
- `PageExpertise.html` : nav active « Secteurs » (sur une page Expertise),
  `md:row` au lieu de `md:flex-row`, `viewbox` minuscule dans le SVG du CTA ;
- Sélecteur de langue : « FR | EN » statique sur Accueil uniquement.

---

## Annexe A — 5 images de maquette déjà mortes (à ré-exporter du `.fig`)

Les visuels des exports sont hébergés sur des URLs Google **éphémères** ; nous
avons rapatrié 20/25 images en local (`docs/design/Export HTML/assets/`), mais
5 renvoient déjà une erreur définitive (400/403) :

| Page | Image perdue |
|---|---|
| Accueil | Logo Victrix (en-tête) |
| Accueil | Badge/illustration « Loi 25 » |
| Accueil | Visuel de la section « Services Gérés » |
| PageExpertise | Image de fond du héros |
| PageExpertise | Capture d'écran « O Studio » (carte outil) |

Dans les prototypes, les deux images de PageExpertise sont remplacées par des
stand-ins locaux clairement marqués.

## Annexe B — trous de périmètre constatés (à planifier)

1. **Aucune maquette** : article de blog, listing Ressources, pages campagnes,
   résultats de recherche, page merci, 404, portail client — le site en
   production a 60 articles et 48 pages de services qui en dépendent.
2. **Aucune maquette EN** (site bilingue à parité complète) ; le sélecteur de
   langue n'est pas conçu.
3. La nav des maquettes contient « Secteurs » et « À propos » — pages sans
   maquette ni équivalent actuel ; à confirmer au plan de navigation.
4. **Carrières sans liste de postes** : ATS externe, page dédiée, ou hors
   périmètre ?
5. **Responsive** : aucun artboard mobile ; les exports contiennent très peu de
   variantes ≤ `md`. Nous extrapolerons depuis la charte (marges 16px mobile,
   pile 1 colonne) — signaler toute intention contraire.
