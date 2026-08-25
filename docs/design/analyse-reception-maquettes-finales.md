# Analyse de réception — maquettes finales + design system (2026-08-04)

> Livraison reçue dans `docs/design/` : `Refonte Victrix.ca - Maquette + Design System2.fig`
> (5,53 Mo, source), `Export HTML/{Accueil, Carrieres, Contact, PageExpertise, PageSolution}.html`,
> `Design system/{VictrixModernWeb-DesignSystenm.md, DesignSystemVictrix.png}`.
> Ce document est l'analyse de réception : ce que contient la livraison, ce qui diverge,
> ce qui manque, et les arbitrages à obtenir **avant** d'écrire le `@theme` définitif
> (déclencheur prévu par `audit-tokens-figma.md` §5, décision du 29/07).

---

## 1. Constat transversal majeur — quatre sources de vérité divergentes

| # | Source | Palette | Statut |
|---|---|---|---|
| 1 | `DesignSystemVictrix.png` (planche approuvée) | Ivoire/beige/sable + Bleu Victrix `#1A5BFF` + Bleu nuit `#0D1430` | Direction créative « Chaud et humain » |
| 2 | Frontmatter de `VictrixModernWeb-DesignSystenm.md` (L3-50) | 47 tokens Material, `surface #fcf9f5`, `primary #002fc7` | Ce que les exports HTML consomment |
| 3 | Prose §Colors du même `.md` (L124-127) | `#1D46F3` / `#000D2E` / `#1D1D1B` / `#F4F7F9` | Contredit son propre frontmatter |
| 4 | Repo — `src/styles/theme-semantique.css` | Material « Luminous Precision » froid, `surface #f8f9fa` | Provisoire, à remplacer |

**Aucun des 6 hex de la planche PNG n'apparaît dans le frontmatter ni dans les exports.**
C'est le scénario anticipé par `audit-tokens-figma.md` §3 : les conflits internes de
l'export se sont **déplacés**, pas résolus.

**Précision issue du re-audit automatisé (2026-08-04, voir audit §5)** : les 4 pages
Carrieres/Contact/PageExpertise/PageSolution sont **alignées entre elles ET avec le
frontmatter** — seul `Accueil.html` diverge ; et l'échelle de rayons décalée est
**uniforme sur les 5 exports** (conflit code-vs-charte pur, pas une dérive de page).

**➡️ DÉCISION v2 (2026-08-04, remplace la v1 « exports seuls » du matin)** : vu les
incohérences internes des exports, la **planche `DesignSystemVictrix.png` arbitre le
SYSTÈME visuel** (palette 6 ancres, graisses, rayons, chips pilule) et les **exports
restent la référence de STRUCTURE** (markup, rôles de tokens, layout, spacing). Les
rôles Material sont conservés, leurs valeurs ré-ancrées sur la planche (dérivés à
valider). Résolution détaillée et points à signaler :
`docs/design/arbitrages-design-a-trancher.md` (v2).

## 2. Résumé du design system livré

### 2.1 Palette (planche PNG, hex lus sur image — à reconfirmer sur le .fig)

| Nom | Hex | Rôle affiché |
|---|---|---|
| Ivoire chaud | `#FAF7F3` | Surfaces chaleureuses |
| Beige doux | `#F2ECE4` | Surfaces chaleureuses |
| Sable clair | `#E9E1D6` | Surfaces chaleureuses |
| Anthracite | `#1A1F28` | Texte et hiérarchie forte |
| Bleu Victrix | `#1A5BFF` | Actions, liens, marque |
| Bleu nuit | `#0D1430` | Profondeur, contrastes premium |

Frontmatter `.md` (consommé par les exports) : `primary #002fc7`, `primary-container #1d46f3`
(le Bleu Royal actuel survit sous ce rôle), `secondary #515d82` (ardoise), toute l'échelle
`surface-*` passe au **chaud** (`#fcf9f5` → `#e5e2de`), famille `error-*` inchangée.

### 2.2 Typographie — Hanken Grotesk partout (8 styles, `.md` L51-95)

`display` 56/1.1/800 · `headline-lg` 40/1.2/700 · `headline-lg-mobile` 32 · `headline-md`
24/1.3/700 · `body-lg` 18/1.6 · `body-md` 16/1.6 · `label-caps` 12/700/0.1em ·
`button` 14/600/0.02em. **Le PNG diverge** : graisses SemiBold (600) vs 700/800, Button
16/Medium vs 14/600, tracking label 0.12em vs 0.1em — arbitrage requis (§5.1 pt 5).
La police est déjà réglée côté repo : Hanken Grotesk variable 100-900 auto-hébergée
(`public/fonts/HankenGrotesk-Variable.woff2`, OFL).

### 2.3 Espacement / rayons (`.md` L96-110 + prose)

- `container-max 1280px` · `gutter 24px` · `margin-x 32px` · `section-gap 80px` ·
  `stack-sm/md/lg 8/16/32px`. Grille 12 col, base 8px, marges mobiles 16px (prose —
  contredit `margin-x` unique).
- Rayons frontmatter : `DEFAULT .25rem / lg .5 / xl .75 / full 9999px` — **mais les configs
  des 5 exports décalent tout d'un cran** (`DEFAULT .125 / lg .25 / xl .5`) et posent
  `full: 0.75rem` (casserait `rounded-full` — bug d'export probable). Conflits #4-6 de
  l'audit **non résolus, déplacés**.
- Élévation : pas d'ombres lourdes — couches tonales + bordures 1px `#E0E0E0` ; hover
  `0 4px 20px` à 5 %.

### 2.4 Composants spécifiés (prose `.md` L158-163 + planche §4)

Buttons (rect 4px, primaire bleu plein / secondaire outline), Cards (fond blanc, bordure
1px, `label-caps` ; cartes service = image pleine + overlay navy), Inputs outlined 4px
label au-dessus, Chips pilule beige, Teaser de contenu, iconographie linéaire monochrome
(Material Symbols — sous-ensemble 3,4 Ko actuel à régénérer, nouvelles icônes utilisées).

## 3. Les 5 exports HTML — correspondances et gaps

Tous `lang="fr"`, Tailwind Play CDN, images **distantes** (`lh3.googleusercontent.com`,
URLs éphémères → rapatriement obligatoire), `darkMode:"class"` (1 seule classe `dark:`
réelle sur les 5 pages → stratégie `@custom-variant` inerte tient).

| Maquette | Route existante | Sections → composants (✅ appariement / ⛔ gap) |
|---|---|---|
| `Accueil.html` ⚠️ | ✅ `[lang]/index` | Hero→`home-hero` · TrustBar→`home-iso`/`stats` · 6 cartes services (overlay)→`home-expertises` (pattern différent) · Feature+**carte flottante 24/7 ⛔** · Solutions→`home-solution` · Articles→`home-latest` · CTA→`cta` |
| `PageExpertise.html` | ✅ `[lang]/services/[...slug]` | Hero→`service-hero` · Approche→`rich-text` · **Bento grid 6 tuiles ⛔** · **Marquee technos défilant ⛔** (`logo-banner` statique) · Outils→`home-solution` · CTA (formes décoratives ⛔) |
| `PageSolution.html` | ⛔ **route à créer** (footer i18n pointe déjà `/produits/*`, lien mort) | Hero→`hero` · Valeur→`benefits` · Offres→✅ `numbered-cards` · **Bento 4 cartes ⛔** · CTA→`cta` |
| `Carrieres.html` | ⛔ **route à créer** (`/carrieres` lié dans ui.ts FR+EN, lien mort) | Hero→`hero` · HappyAtWork→`callout` · **Nos valeurs ⛔** · Pourquoi nous→`benefits` · Témoignages 2-up→✅ `testimonial` · RSE (partners placeholder) · CTA. **Aucune liste de postes** (ATS ? à clarifier) |
| `Contact.html` ⚠️ incomplet | ✅ `[lang]/contact` | Header/Footer = **coquilles vides** · Hero→`hero` · **3 cartes bureaux (Québec/Montréal/Paris) ⛔** · Formulaire 2 col→`form` (7 types + Loi 25 déjà en place ; 2 selects en cascade à valider) |

**Maquettes manquantes** : article de blog, listing Ressources, campagnes, recherche,
merci, 404, portail — alors que 60 articles + 48 services migrés en dépendent. Nav des
maquettes : « Secteurs » et « À propos » n'ont ni route ni maquette.

### ⚠️ `Accueil.html` est hors-norme (génération antérieure/parallèle probable)

Seul des 5 avec : familles **Manrope + Inter** (non chargées par le `<link>` → fallback
silencieux), échelle spacing parallèle (`section-gap 8rem` vs `80px`), CTA en
`bg-secondary` (ardoise) là où les 4 autres utilisent `primary`, tokens custom
`border-subtle`/`surface-alt`, `headline-lg` 32 vs 40, `body-lg` 16 vs 18.
**Le porter tel quel = 2 familles de police en plus et une sémantique CTA contradictoire.**
→ Demander un ré-export aligné, ou acter une échelle propre à l'accueil.

## 4. Delta tokens vs provisoire (`theme-semantique.css`)

- **Couleurs** : quasi-totalité change (froid → chaud). Inversions de rôle notables :
  `primary` `#00020a`→`#002fc7`, `primary-container` `#001b44`→`#1d46f3`,
  `secondary` `#0038e6`→`#515d82`. **Disparus sans équivalent** : céleste `#86cefa`,
  givre `#f8f9fa`, royal-profond `#0038e6` ; `#e5e7eb` ne survit que dans Accueil
  (`border-subtle`). Seule la famille `error-*` est inchangée.
- **Typo** : `headline-xl`, `label-md`, `label-sm` sortent ; `display`, `button`,
  `label-caps` entrent ; tous les line-heights passent de px à ratios (réécriture
  mécanique intégrale des 12 alias `--font-*` → 11).
- **Spacing** : tout le bloc provisoire supprimé sauf `gutter 24px` ; nouveaux
  `container-max/section-gap/stack-*`. ✅ La suppression de `--spacing-lg/xl` **annule le
  piège v4** documenté (masquage `--container-*` → `max-w-lg/xl` cassés) ; ⚠️ mais
  `--spacing-container-max` recrée le même risque pour `max-w-container-max`.
- **Collisions legacy toujours ouvertes** (audit §4) : `--color-surface`,
  `--radius-sm/md/lg` de `tokens.css` (`:root` non-couché) gagneraient silencieusement
  contre le `@theme` — **renommage legacy à faire avant fusion** dans `theme.css`.
- Le script `scripts/design/audit-export-tokens.mjs` est **rejouable tel quel** sur les
  5 exports (recette §5 de l'audit ; l'étape « piège max-w » devient sans objet).

## 5. Arbitrages et questions ouvertes

### 5.1 Bloquants — à trancher avec l'équipe design avant d'écrire le `@theme`

1. **Quelle palette fait foi ?** PNG (`#1A5BFF`/`#0D1430`) vs frontmatter
   (`#002fc7`/`#1d46f3`) vs prose (`#1D46F3`/`#000D2E`). Relire les hex dans le `.fig`.
2. **`Accueil.html` est-il valide ?** (8 axes divergents — §3.)
3. **Échelle de rayons** : frontmatter vs exports décalés d'un cran + `full 0.75rem`.
4. **Rôle de `secondary`** : ardoise `#515d82` en palette, mais CTA `bg-secondary` sur
   l'accueil vs `bg-primary` ailleurs.
5. **Graisses typo** : SemiBold (PNG) vs 700/800 (`.md`).

### 5.2 Périmètre / contenu

6. **Parité FR/EN** : aucune maquette EN ; libellés EN plus longs à tester (boutons
   `whitespace-nowrap`). Sélecteur de langue non conçu (« FR | EN » statique).
7. **Routes à créer** : `/carrieres`, solutions/produits ; « Secteurs », « À propos » ?
8. **Maquettes manquantes** : blog (article + listing), campagnes, recherche, 404, portail.
9. **Composants sans usage dans les maquettes** : `faq`, `video`, `tech-columns`,
   `home-experts`, `home-partners`, `related-posts` — conservés ou dépréciés ?
10. **Responsive quasi absent** : pas d'artboard mobile ; `md:`/`lg:` épars, pas de `sm:`,
    `headline-lg-mobile` utilisé sur 1 page sur 5 ; 4 conventions de hauteur de hero.

### 5.3 Dette / pipeline

11. Images des exports **toutes distantes et éphémères** → rapatriement.
12. Sous-ensemble Material Symbols à régénérer (ou bascule SVG inline — décision Phase 5).
13. Montserrat (~326 Ko `public/fonts/`) + `--font-sans` legacy = poids mort au re-skin.
14. Preflight Tailwind : à trancher pour le re-skin complet (absent du site, présent en
    design-lab).
15. `.fig` 5,53 Mo en binaire dans git (pas de LFS) — à surveiller si itérations.
16. **Les 23 `preview.png` CloudCannon devront être régénérés après re-skin**
    (`npm run design:previews`).

## 6. Prochaines étapes proposées (groundwork Phase 5)

1. **Envoyer les 5 arbitrages à l'équipe design** — bloquants pour le thème
   (document prêt : `docs/design/arbitrages-design-a-trancher.md`).
2. Rejouer `audit-export-tokens.mjs` sur les 5 exports finaux → mettre à jour
   `audit-tokens-figma.md` (décision 29/07 : l'export final = référence unique).
3. Renommer les 4 tokens legacy en collision (`tokens.css`) puis écrire le **thème
   définitif** dans `theme.css` (fusion de `theme-semantique.css`, variante chaude).
4. Prototyper les **gaps structurants** (bento grid, marquee, cartes bureaux, valeurs,
   carte flottante) en design-lab avant d'en faire des composants Bookshop.
5. Re-skin par lots (recette de l'audit §5), previews régénérés à la fin.
