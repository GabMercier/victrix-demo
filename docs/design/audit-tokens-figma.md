# Audit tokens — exports Figma vs repo (`theme.css` / `tokens.css`)

> Généré par `scripts/design/audit-export-tokens.mjs` — rejouable à chaque nouvel export.
> Exports audités : `Accueil`, `Carrieres`, `Contact`, `PageExpertise`, `PageSolution`.

**⚠️ Constat préalable** : les exports ne sont pas identiques entre eux :
- valeur divergente `spacing.section-gap` : `"8rem"` vs `"80px"` (Carrieres) ;
- valeur divergente `spacing.gutter` : `"1.5rem"` vs `"24px"` (Carrieres) ;
- valeur divergente `fontSize.headline-md` : `["24px",{"lineHeight":"1.3","fontWeight":"600"}]` vs `["24px",{"lineHeight":"1.3","fontWeight":"700"}]` (Carrieres) ;
- valeur divergente `fontSize.body-md` : `["16px",{"lineHeight":"1.5","fontWeight":"400"}]` vs `["16px",{"lineHeight":"1.6","fontWeight":"400"}]` (Carrieres) ;
- valeur divergente `fontSize.headline-lg` : `["32px",{"lineHeight":"1.2","fontWeight":"700"}]` vs `["40px",{"lineHeight":"1.2","letterSpacing":"-0.01em","fontWeight":"700"}]` (Carrieres) ;
- valeur divergente `fontSize.label-caps` : `["12px",{"lineHeight":"1.0","letterSpacing":"0.1em","fontWeight":"700"}]` vs `["12px",{"lineHeight":"1.2","letterSpacing":"0.1em","fontWeight":"700"}]` (Carrieres) ;
- valeur divergente `fontSize.body-lg` : `["16px",{"lineHeight":"1.5","fontWeight":"400"}]` vs `["18px",{"lineHeight":"1.6","fontWeight":"400"}]` (Carrieres) ;
- valeur divergente `fontFamily.body-md` : `["Manrope"]` vs `["Hanken Grotesk"]` (Carrieres) ;
- valeur divergente `fontFamily.label-caps` : `["Manrope"]` vs `["Hanken Grotesk"]` (Carrieres) ;
- valeur divergente `spacing.section-gap` : `"8rem"` vs `"80px"` (Contact) ;
- valeur divergente `spacing.gutter` : `"1.5rem"` vs `"24px"` (Contact) ;
- valeur divergente `fontSize.body-md` : `["16px",{"lineHeight":"1.5","fontWeight":"400"}]` vs `["16px",{"lineHeight":"1.6","fontWeight":"400"}]` (Contact) ;
- valeur divergente `fontSize.headline-md` : `["24px",{"lineHeight":"1.3","fontWeight":"600"}]` vs `["24px",{"lineHeight":"1.3","fontWeight":"700"}]` (Contact) ;
- valeur divergente `fontSize.label-caps` : `["12px",{"lineHeight":"1.0","letterSpacing":"0.1em","fontWeight":"700"}]` vs `["12px",{"lineHeight":"1.2","letterSpacing":"0.1em","fontWeight":"700"}]` (Contact) ;
- valeur divergente `fontSize.body-lg` : `["16px",{"lineHeight":"1.5","fontWeight":"400"}]` vs `["18px",{"lineHeight":"1.6","fontWeight":"400"}]` (Contact) ;
- valeur divergente `fontSize.headline-lg` : `["32px",{"lineHeight":"1.2","fontWeight":"700"}]` vs `["40px",{"lineHeight":"1.2","letterSpacing":"-0.01em","fontWeight":"700"}]` (Contact) ;
- valeur divergente `fontFamily.body-md` : `["Manrope"]` vs `["Hanken Grotesk"]` (Contact) ;
- valeur divergente `fontFamily.label-caps` : `["Manrope"]` vs `["Hanken Grotesk"]` (Contact) ;
- valeur divergente `spacing.section-gap` : `"8rem"` vs `"80px"` (PageExpertise) ;
- valeur divergente `spacing.gutter` : `"1.5rem"` vs `"24px"` (PageExpertise) ;
- valeur divergente `fontSize.label-caps` : `["12px",{"lineHeight":"1.0","letterSpacing":"0.1em","fontWeight":"700"}]` vs `["12px",{"lineHeight":"1.2","letterSpacing":"0.1em","fontWeight":"700"}]` (PageExpertise) ;
- valeur divergente `fontSize.headline-md` : `["24px",{"lineHeight":"1.3","fontWeight":"600"}]` vs `["24px",{"lineHeight":"1.3","fontWeight":"700"}]` (PageExpertise) ;
- valeur divergente `fontSize.body-md` : `["16px",{"lineHeight":"1.5","fontWeight":"400"}]` vs `["16px",{"lineHeight":"1.6","fontWeight":"400"}]` (PageExpertise) ;
- valeur divergente `fontSize.headline-lg` : `["32px",{"lineHeight":"1.2","fontWeight":"700"}]` vs `["40px",{"lineHeight":"1.2","letterSpacing":"-0.01em","fontWeight":"700"}]` (PageExpertise) ;
- valeur divergente `fontSize.body-lg` : `["16px",{"lineHeight":"1.5","fontWeight":"400"}]` vs `["18px",{"lineHeight":"1.6","fontWeight":"400"}]` (PageExpertise) ;
- valeur divergente `fontFamily.label-caps` : `["Manrope"]` vs `["Hanken Grotesk"]` (PageExpertise) ;
- valeur divergente `fontFamily.body-md` : `["Manrope"]` vs `["Hanken Grotesk"]` (PageExpertise) ;
- valeur divergente `spacing.gutter` : `"1.5rem"` vs `"24px"` (PageSolution) ;
- valeur divergente `spacing.section-gap` : `"8rem"` vs `"80px"` (PageSolution) ;
- valeur divergente `fontSize.body-md` : `["16px",{"lineHeight":"1.5","fontWeight":"400"}]` vs `["16px",{"lineHeight":"1.6","fontWeight":"400"}]` (PageSolution) ;
- valeur divergente `fontSize.body-lg` : `["16px",{"lineHeight":"1.5","fontWeight":"400"}]` vs `["18px",{"lineHeight":"1.6","fontWeight":"400"}]` (PageSolution) ;
- valeur divergente `fontSize.label-caps` : `["12px",{"lineHeight":"1.0","letterSpacing":"0.1em","fontWeight":"700"}]` vs `["12px",{"lineHeight":"1.2","letterSpacing":"0.1em","fontWeight":"700"}]` (PageSolution) ;
- valeur divergente `fontSize.headline-md` : `["24px",{"lineHeight":"1.3","fontWeight":"600"}]` vs `["24px",{"lineHeight":"1.3","fontWeight":"700"}]` (PageSolution) ;
- valeur divergente `fontSize.headline-lg` : `["32px",{"lineHeight":"1.2","fontWeight":"700"}]` vs `["40px",{"lineHeight":"1.2","letterSpacing":"-0.01em","fontWeight":"700"}]` (PageSolution) ;
- valeur divergente `fontFamily.body-md` : `["Manrope"]` vs `["Hanken Grotesk"]` (PageSolution) ;
- valeur divergente `fontFamily.label-caps` : `["Manrope"]` vs `["Hanken Grotesk"]` (PageSolution) ;

## 1. Équivalents — même valeur, autre nom dans `theme.css`

| Token export (sémantique) | Valeur | Token repo (`theme.css`) |
|---|---|---|
| `primary-container` | `#1d46f3` | `--color-royal` |
| `border-subtle` | `#e5e7eb` | `--color-bordure` |
| `surface-alt` | `#f8f9fa` | `--color-givre` |
| `rounded-lg` (DESIGN.md) | `0.5rem` | `--radius-controle` |
| `fontFamily.*` (Hanken Grotesk ×10 alias) | — | `--font-grotesk` (un seul token) |

Tokens couleur de `theme.css` **sans équivalent** dans la palette générée de l'export : `--color-nuit` (`#001b44`), `--color-royal-profond` (`#0038e6`), `--color-celeste` (`#86cefa`), `--color-encre` (`#191c1d`), `--color-encre-douce` (`#44474f`) — voir §3 (conflits).

## 2. Manquants dans `theme.css` — à couvrir par `theme-semantique.css`

Les tokens marqués **[utilisé]** portent le rendu du markup des exports ;
les autres sont définis par le plugin mais non consommés (palette Material générée).

### Couleurs
| Token | Valeur | Statut |
|---|---|---|
| `surface` | `#fcf9f5` | **[utilisé]** |
| `on-tertiary-fixed-variant` | `#434749` | défini seulement |
| `inverse-on-surface` | `#f3f0ec` | défini seulement |
| `secondary` | `#515d82` | **[utilisé]** |
| `inverse-surface` | `#31302e` | défini seulement |
| `on-secondary` | `#ffffff` | défini seulement |
| `on-primary-fixed` | `#00105b` | **[utilisé]** |
| `secondary-fixed-dim` | `#b9c6ef` | défini seulement |
| `surface-variant` | `#e5e2de` | **[utilisé]** |
| `error` | `#ba1a1a` | défini seulement |
| `primary-fixed-dim` | `#bac3ff` | **[utilisé]** |
| `tertiary-fixed-dim` | `#c4c7c9` | défini seulement |
| `surface-container-high` | `#ebe8e4` | **[utilisé]** |
| `secondary-fixed` | `#dae2ff` | défini seulement |
| `on-primary-fixed-variant` | `#002fc8` | défini seulement |
| `inverse-primary` | `#bac3ff` | défini seulement |
| `surface-container-low` | `#f6f3ef` | **[utilisé]** |
| `on-primary` | `#ffffff` | **[utilisé]** |
| `error-container` | `#ffdad6` | défini seulement |
| `on-surface` | `#1c1c1a` | **[utilisé]** |
| `surface-dim` | `#dcdad6` | **[utilisé]** |
| `on-secondary-container` | `#4e5b7f` | défini seulement |
| `on-background` | `#1c1c1a` | **[utilisé]** |
| `on-error` | `#ffffff` | défini seulement |
| `tertiary` | `#424648` | défini seulement |
| `primary` | `#002fc7` | **[utilisé]** |
| `on-tertiary-fixed` | `#181c1e` | défini seulement |
| `surface-bright` | `#fcf9f5` | défini seulement |
| `tertiary-fixed` | `#e0e3e5` | défini seulement |
| `surface-container` | `#f0edea` | **[utilisé]** |
| `primary-fixed` | `#dee0ff` | **[utilisé]** |
| `surface-container-highest` | `#e5e2de` | **[utilisé]** |
| `outline-variant` | `#c4c5d9` | **[utilisé]** |
| `on-secondary-fixed-variant` | `#394669` | défini seulement |
| `background` | `#fcf9f5` | **[utilisé]** |
| `secondary-container` | `#c6d3fe` | **[utilisé]** |
| `on-secondary-fixed` | `#0c1a3b` | défini seulement |
| `surface-tint` | `#1e47f4` | défini seulement |
| `on-tertiary-container` | `#d4d7d9` | défini seulement |
| `on-surface-variant` | `#444656` | **[utilisé]** |
| `surface-container-lowest` | `#ffffff` | **[utilisé]** |
| `on-tertiary` | `#ffffff` | défini seulement |
| `on-error-container` | `#93000a` | défini seulement |
| `outline` | `#747688` | **[utilisé]** |
| `tertiary-container` | `#5a5e60` | défini seulement |
| `on-primary-container` | `#d0d5ff` | défini seulement |

### Échelle d’espacement nommée (absente de `theme.css` — spacing Tailwind par défaut)
| Token | Valeur | Statut |
|---|---|---|
| `unit` | `8px` | défini seulement |
| `section-gap-lg` | `120px` | **[utilisé]** |
| `margin-mobile` | `16px` | défini seulement |
| `section-gap-sm` | `64px` | défini seulement |
| `gutter` | `1.5rem` | **[utilisé]** |
| `margin-desktop` | `40px` | **[utilisé]** |
| `container-max` | `1280px` | défini seulement |
| `margin-page` | `4rem` | défini seulement |
| `section-gap` | `8rem` | **[utilisé]** |
| `md` | `16px` | défini seulement |
| `xs` | `4px` | défini seulement |
| `xl` | `32px` | défini seulement |
| `sm` | `8px` | défini seulement |
| `base` | `8px` | défini seulement |
| `lg` | `24px` | défini seulement |
| `stack-md` | `16px` | **[utilisé]** |
| `stack-sm` | `8px` | **[utilisé]** |
| `margin-x` | `32px` | **[utilisé]** |
| `stack-lg` | `32px` | **[utilisé]** |

### Échelle typographique sémantique (absente de `theme.css`)
| Token | Taille / interligne / graisse / espacement | Statut |
|---|---|---|
| `display-lg` | `56px / 1.1 / 800 / -0.02em` | **[utilisé]** |
| `headline-lg` | `32px / 1.2 / 700` | **[utilisé]** |
| `headline-md` | `24px / 1.3 / 600` | **[utilisé]** |
| `body-lg` | `16px / 1.5 / 400` | **[utilisé]** |
| `body-md` | `16px / 1.5 / 400` | **[utilisé]** |
| `label-md` | `14px / 1 / 500` | **[utilisé]** |
| `display-lg-mobile` | `36px / 1.2 / 800` | défini seulement |
| `caption` | `12px / 1.4 / 400` | **[utilisé]** |
| `label-caps` | `12px / 1.0 / 700 / 0.1em` | **[utilisé]** |
| `headline-sm` | `24px / 1.3 / 700` | défini seulement |
| `button-text` | `14px / 1.0 / 600` | défini seulement |
| `display` | `56px / 1.1 / 800 / -0.02em` | **[utilisé]** |
| `button` | `14px / 1 / 600 / 0.02em` | **[utilisé]** |
| `headline-lg-mobile` | `32px / 1.2 / 700` | **[utilisé]** |

### Divers
- **Dark mode** : `darkMode: "class"` + classes `dark:` dans le markup — aucune stratégie dark dans le repo (à rendre inerte via `@custom-variant` en A2, décision réelle en Phase 5).
- **Material Symbols** : police d’icônes (Google Fonts dans l’export) — le repo utilise des SVG inline. Auto-hébergement pour le design-lab ; adoption site-wide = décision Phase 5.
- **Plugins Play CDN** : `forms`, `container-queries` — non installés dans le repo (v4 : container queries natifs ; `@tailwindcss/forms` à évaluer seulement si des formulaires arrivent dans un export).

## 3. Valeurs en conflit — incohérences INTERNES de l’export

À arbitrer avec l’équipe design, pas à résoudre en silence :

| # | Constat | Détail |
|---|---|---|
| 1 | `#000d2e` cité dans la prose du DESIGN.md mais ABSENT de la palette générée | « …- **Secondary ( » |
| 2 | `#1d1d1b` cité dans la prose du DESIGN.md mais ABSENT de la palette générée | « …- **Neutral ( » |
| 3 | `#f4f7f9` cité dans la prose du DESIGN.md mais ABSENT de la palette générée | « …- **Surface ( » |
| 4 | `#e0e0e0` cité dans la prose du DESIGN.md mais ABSENT de la palette générée | « …- **Borders:** Use 1px solid borders in light gray ( » |
| 5 | Rayon `DEFAULT` : `code.html` dit `0.125rem`, `DESIGN.md` dit `0.25rem` | l'échelle de radii du markup et celle de la charte divergent |
| 6 | Rayon `lg` : `code.html` dit `0.25rem`, `DESIGN.md` dit `0.5rem` | l'échelle de radii du markup et celle de la charte divergent |
| 7 | Rayon `xl` : `code.html` dit `0.5rem`, `DESIGN.md` dit `0.75rem` | l'échelle de radii du markup et celle de la charte divergent |
| 8 | Rayon `full` : `code.html` dit `0.75rem`, `DESIGN.md` dit `9999px` | l'échelle de radii du markup et celle de la charte divergent |
| 9 | Espacement `gutter` : la charte dit `24px`, les exports disent `1.5rem` | le code et la charte machine divergent |
| 10 | Espacement `section-gap` : la charte dit `80px`, les exports disent `8rem` | le code et la charte machine divergent |
| 11 | Taille `headline-lg` : la charte dit `40px`, les exports disent `32px` | le code et la charte machine divergent |
| 12 | Taille `body-lg` : la charte dit `18px`, les exports disent `16px` | le code et la charte machine divergent |
| 13 | `fontFamily.display-lg-mobile` déclare `Manrope` | famille HORS charte — non chargée par le `<link>` des exports (fallback navigateur silencieux) |
| 14 | `fontFamily.caption` déclare `Inter` | famille HORS charte — non chargée par le `<link>` des exports (fallback navigateur silencieux) |
| 15 | `fontFamily.display-lg` déclare `Manrope` | famille HORS charte — non chargée par le `<link>` des exports (fallback navigateur silencieux) |
| 16 | `fontFamily.body-md` déclare `Manrope` | famille HORS charte — non chargée par le `<link>` des exports (fallback navigateur silencieux) |
| 17 | `fontFamily.label-caps` déclare `Manrope` | famille HORS charte — non chargée par le `<link>` des exports (fallback navigateur silencieux) |
| 18 | `fontFamily.headline-sm` déclare `Manrope` | famille HORS charte — non chargée par le `<link>` des exports (fallback navigateur silencieux) |
| 19 | `fontFamily.button-text` déclare `Manrope` | famille HORS charte — non chargée par le `<link>` des exports (fallback navigateur silencieux) |

## 4. Collisions avec `tokens.css` (legacy, non-couché) — danger Phase 5

En Tailwind v4, chaque token `@theme` devient une variable CSS (`--color-*`,
`--radius-*`, `--text-*`, `--spacing-*`, `--font-*`). `tokens.css` définit des
variables de MÊME NOM dans un `:root` **non-couché**, qui gagne silencieusement
contre `@layer theme` : l’utilitaire compile, mais résout vers la valeur legacy.

| Variable @theme v4 (si adoption verbatim) | Valeur export | Valeur legacy (`tokens.css`) |
|---|---|---|
| `--color-surface` | `#fcf9f5` | `var(--color-grey-50)` |
| `--radius-sm` | `0.125rem` | `4px` |
| `--radius-md` | `0.375rem` | `8px` |
| `--radius-lg` | `0.5rem` | `16px` |

**4 collision(s).** Décision Phase 5 recommandée : renommer ces variables
legacy dans `tokens.css` + usages (mécanique, vérifiable au grep), puis fusionner
`theme-semantique.css` dans `theme.css`. Alternative écartée : préfixer tous les
tokens sémantiques (chaque futur export exigerait une passe de renommage à vie).

## 5. Verdict pipeline (vérification visuelle du design-lab)

> **RE-AUDIT 2026-08-04 — LIVRAISON FINALE** (5 exports `docs/design/Export
> HTML/` + design system partagé). La décision du 2026-07-29 (« l'export final
> = RÉFÉRENCE UNIQUE, conflits réglés à sa réception ») s'applique MAINTENANT :
> les arbitrages ouverts sont consignés dans
> `docs/design/arbitrages-design-a-trancher.md` (5 bloquants) et l'analyse
> complète dans `docs/design/analyse-reception-maquettes-finales.md`.

**Lecture du Constat préalable ci-dessus (importante)** : la fusion prend les
valeurs du PREMIER export lu (`Accueil`, ordre alphabétique) — les ~40 lignes de
divergence montrent en réalité que **Carrieres, Contact, PageExpertise et
PageSolution sont ALIGNÉS entre eux ET avec le frontmatter de la charte** ;
`Accueil` seul diverge (spacing parallèle, `headline-lg` 32 vs 40, `body-lg`
16/1.5 vs 18/1.6, graisses `headline-md` 600 vs 700, Manrope/Inter jusque dans
`body-md`/`label-caps`). Dans les tableaux §2/§3, les valeurs « exports » des
tokens homonymes sont donc CELLES D'ACCUEIL (gutter `1.5rem`, section-gap
`8rem`…) — scorie probable d'une génération antérieure, voir arbitrage #2.
Les RADII (§3 #5-8) font exception : les 5 exports partagent la MÊME échelle
décalée (`DEFAULT .125` → `full .75rem`) contre la charte — conflit
code-vs-charte uniforme, `full: 0.75rem` casserait `rounded-full`.

**✅ PIPELINE VALIDÉ** (2026-07-29, ANCIEN export Homepage, `/fr/design-lab` vs
`screen.png`, viewport 1440) : mise en page, grilles, typo sémantique, palette,
ombres, icônes Material Symbols auto-hébergées et Hanken Grotesk locale
conformes. **Revalidation sur la livraison FINALE : en attente** — à faire en
portant une page finale (PageExpertise recommandé : la plus riche en patterns
nouveaux) dans le design-lab avec le thème candidat `theme-refonte.css`.

**Recette de conversion d'un export** (à rejouer pour chaque écran) :
1. retirer Play CDN + config inline + liens Google Fonts (le pipeline les remplace) ;
2. rapatrier les images distantes (`/aida/` ET `/aida-public/`) en local et
   réécrire les `src` (+`data-alt`→`alt`) — `scripts/design/fetch-maquette-images.mjs`
   l'a fait pour les 5 exports (20/25 ; 5 URLs DÉJÀ MORTES côté Google, listées
   dans l'analyse de réception — à ré-exporter du `.fig`) ;
3. retirer les scripts embarqués (décoratifs, `href="#"` non valides) ;
4. ⚠️ piège v4 (découvert sur l'ancien export) : une échelle d'espacement nommée
   qui recouvre un nom de taille (`--spacing-lg/xl`… vs `--container-*`) MASQUE
   `max-w-*` → la charte finale n'a plus `lg/xl` mais `--spacing-container-max`
   recrée le risque pour `max-w-container-max` — vérifier au portage ;
5. si nouvelles icônes : régénérer le sous-ensemble Material Symbols
   (`icon_names=` de l'API css2, triés alphabétiquement) — les 5 exports
   utilisent des icônes ABSENTES du sous-ensemble actuel (3,4 Ko).

