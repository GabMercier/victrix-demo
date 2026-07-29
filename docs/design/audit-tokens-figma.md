# Audit tokens — exports Figma vs repo (`theme.css` / `tokens.css`)

> Généré par `scripts/design/audit-export-tokens.mjs` — rejouable à chaque nouvel export.
> Exports audités : `Export - Homepage`, `Export - expertise-productivite`.

**⚠️ Constat préalable** : les exports ne sont pas identiques entre eux :
- `Export - expertise-productivite` sans section spacing/fontSize (l'audit travaille sur l'UNION des configs) ;
- valeur divergente `fontFamily.headline` : `["Hanken Grotesk"]` vs `["Hanken Grotesk","sans-serif"]` (Export - expertise-productivite) ;
- valeur divergente `fontFamily.display` : `["Hanken Grotesk"]` vs `["Hanken Grotesk","sans-serif"]` (Export - expertise-productivite) ;
- valeur divergente `fontFamily.body` : `["Hanken Grotesk"]` vs `["Hanken Grotesk","sans-serif"]` (Export - expertise-productivite) ;
- valeur divergente `fontFamily.label` : `["Hanken Grotesk"]` vs `["Hanken Grotesk","sans-serif"]` (Export - expertise-productivite) ;
- valeur divergente `borderRadius.DEFAULT` : `"0.25rem"` vs `"0.5rem"` (Export - expertise-productivite) ;
- valeur divergente `borderRadius.lg` : `"0.5rem"` vs `"1rem"` (Export - expertise-productivite) ;
- valeur divergente `borderRadius.xl` : `"0.75rem"` vs `"1.5rem"` (Export - expertise-productivite) ;

## 1. Équivalents — même valeur, autre nom dans `theme.css`

| Token export (sémantique) | Valeur | Token repo (`theme.css`) |
|---|---|---|
| `on-surface-variant` | `#44474f` | `--color-encre-douce` |
| `surface` | `#f8f9fa` | `--color-givre` |
| `background` | `#f8f9fa` | `--color-givre` |
| `secondary` | `#0038e6` | `--color-royal-profond` |
| `on-background` | `#191c1d` | `--color-encre` |
| `primary-container` | `#001b44` | `--color-nuit` |
| `surface-bright` | `#f8f9fa` | `--color-givre` |
| `on-surface` | `#191c1d` | `--color-encre` |
| `rounded-DEFAULT` (DESIGN.md) | `0.5rem` | `--radius-controle` |
| `rounded-lg` (DESIGN.md) | `1rem` | `--radius-carte` |
| ombre Level 2 (prose) | `0 4px 12px rgb(0 27 68 / .05)` | `--shadow-ambiante` |
| ombre Level 3 (prose) | `0 12px 32px rgb(0 27 68 / .1)` | `--shadow-surelevee` |
| `fontFamily.*` (Hanken Grotesk ×12 alias) | — | `--font-grotesk` (un seul token) |

Tokens couleur de `theme.css` **sans équivalent** dans la palette générée de l'export : `--color-royal` (`#1d46f3`), `--color-celeste` (`#86cefa`), `--color-bordure` (`#e5e7eb`) — voir §3 (conflits).

## 2. Manquants dans `theme.css` — à couvrir par `theme-semantique.css`

Les tokens marqués **[utilisé]** portent le rendu du markup des exports ;
les autres sont définis par le plugin mais non consommés (palette Material générée).

### Couleurs
| Token | Valeur | Statut |
|---|---|---|
| `inverse-on-surface` | `#f0f1f2` | défini seulement |
| `tertiary` | `#000204` | défini seulement |
| `on-secondary-fixed` | `#00105b` | défini seulement |
| `on-primary-fixed` | `#001a42` | **[utilisé]** |
| `on-primary-fixed-variant` | `#314671` | défini seulement |
| `on-primary` | `#ffffff` | **[utilisé]** |
| `secondary-container` | `#3256ff` | **[utilisé]** |
| `primary-fixed-dim` | `#b1c6f9` | défini seulement |
| `on-secondary-container` | `#eaeaff` | **[utilisé]** |
| `tertiary-fixed-dim` | `#87cffb` | défini seulement |
| `surface-container` | `#edeeef` | **[utilisé]** |
| `primary` | `#00020a` | **[utilisé]** |
| `surface-container-highest` | `#e1e3e4` | **[utilisé]** |
| `outline-variant` | `#c5c6d0` | **[utilisé]** |
| `error` | `#ba1a1a` | défini seulement |
| `surface-tint` | `#495e8a` | défini seulement |
| `on-primary-container` | `#7084b3` | défini seulement |
| `surface-variant` | `#e1e3e4` | défini seulement |
| `on-tertiary-fixed-variant` | `#004c6a` | **[utilisé]** |
| `inverse-primary` | `#b1c6f9` | défini seulement |
| `surface-container-lowest` | `#ffffff` | **[utilisé]** |
| `tertiary-fixed` | `#c5e7ff` | défini seulement |
| `outline` | `#75777f` | **[utilisé]** |
| `on-error-container` | `#93000a` | défini seulement |
| `surface-container-low` | `#f3f4f5` | **[utilisé]** |
| `on-secondary` | `#ffffff` | **[utilisé]** |
| `secondary-fixed-dim` | `#bac3ff` | défini seulement |
| `secondary-fixed` | `#dee0ff` | **[utilisé]** |
| `on-tertiary` | `#ffffff` | défini seulement |
| `error-container` | `#ffdad6` | défini seulement |
| `surface-container-high` | `#e7e8e9` | défini seulement |
| `on-tertiary-container` | `#408cb5` | **[utilisé]** |
| `tertiary-container` | `#001f2e` | **[utilisé]** |
| `on-error` | `#ffffff` | défini seulement |
| `on-secondary-fixed-variant` | `#002fc8` | **[utilisé]** |
| `on-tertiary-fixed` | `#001e2d` | défini seulement |
| `inverse-surface` | `#2e3132` | défini seulement |
| `surface-dim` | `#d9dadb` | **[utilisé]** |
| `primary-fixed` | `#d8e2ff` | **[utilisé]** |

### Échelle d’espacement nommée (absente de `theme.css` — spacing Tailwind par défaut)
| Token | Valeur | Statut |
|---|---|---|
| `sm` | `8px` | **[utilisé]** |
| `base` | `4px` | **[utilisé]** |
| `xl` | `40px` | **[utilisé]** |
| `md` | `16px` | **[utilisé]** |
| `margin-mobile` | `16px` | défini seulement |
| `xs` | `4px` | **[utilisé]** |
| `lg` | `24px` | **[utilisé]** |
| `gutter` | `24px` | **[utilisé]** |
| `margin-desktop` | `48px` | **[utilisé]** |

### Échelle typographique sémantique (absente de `theme.css`)
| Token | Taille / interligne / graisse / espacement | Statut |
|---|---|---|
| `headline-xl` | `48px / 56px / 700 / -0.02em` | **[utilisé]** |
| `label-md` | `14px / 20px / 500 / 0.01em` | **[utilisé]** |
| `headline-lg` | `32px / 40px / 600 / -0.01em` | **[utilisé]** |
| `label-sm` | `12px / 16px / 600` | **[utilisé]** |
| `body-md` | `16px / 24px / 400` | **[utilisé]** |
| `headline-lg-mobile` | `28px / 36px / 600` | défini seulement |
| `headline-md` | `24px / 32px / 600` | **[utilisé]** |
| `body-lg` | `18px / 28px / 400` | **[utilisé]** |

### Divers
- **Dark mode** : `darkMode: "class"` + classes `dark:` dans le markup — aucune stratégie dark dans le repo (à rendre inerte via `@custom-variant` en A2, décision réelle en Phase 5).
- **Material Symbols** : police d’icônes (Google Fonts dans l’export) — le repo utilise des SVG inline. Auto-hébergement pour le design-lab ; adoption site-wide = décision Phase 5.
- **Plugins Play CDN** : `forms`, `container-queries` — non installés dans le repo (v4 : container queries natifs ; `@tailwindcss/forms` à évaluer seulement si des formulaires arrivent dans un export).

## 3. Valeurs en conflit — incohérences INTERNES de l’export

À arbitrer avec l’équipe design, pas à résoudre en silence :

| # | Constat | Détail |
|---|---|---|
| 1 | `#1d46f3` cité dans la prose du DESIGN.md mais ABSENT de la palette générée | « …- **Bleu Royal ( » — le repo l'a pourtant retenu (`--color-royal`) |
| 2 | `#86cefa` cité dans la prose du DESIGN.md mais ABSENT de la palette générée | « …- **Bleu Céleste ( » — le repo l'a pourtant retenu (`--color-celeste`) |
| 3 | `#e5e7eb` cité dans la prose du DESIGN.md mais ABSENT de la palette générée | « …**Level 2 (Raised):** White cards with a subtle border ( » — le repo l'a pourtant retenu (`--color-bordure`) |
| 4 | Rayon `DEFAULT` : `code.html` dit `0.25rem`, `DESIGN.md` dit `0.5rem` | l'échelle de radii du markup et celle de la charte divergent |
| 5 | Rayon `lg` : `code.html` dit `0.5rem`, `DESIGN.md` dit `1rem` | l'échelle de radii du markup et celle de la charte divergent |
| 6 | Rayon `xl` : `code.html` dit `0.75rem`, `DESIGN.md` dit `1.5rem` | l'échelle de radii du markup et celle de la charte divergent |
| 7 | `.accenture-border` (CSS custom de l'export) utilise `#0050cc` | hex hors palette ET hors charte — ni `secondary #0038e6` ni `royal #1d46f3` |

## 4. Collisions avec `tokens.css` (legacy, non-couché) — danger Phase 5

En Tailwind v4, chaque token `@theme` devient une variable CSS (`--color-*`,
`--radius-*`, `--text-*`, `--spacing-*`, `--font-*`). `tokens.css` définit des
variables de MÊME NOM dans un `:root` **non-couché**, qui gagne silencieusement
contre `@layer theme` : l’utilitaire compile, mais résout vers la valeur legacy.

| Variable @theme v4 (si adoption verbatim) | Valeur export | Valeur legacy (`tokens.css`) |
|---|---|---|
| `--color-surface` | `#f8f9fa` | `var(--color-grey-50)` |
| `--radius-sm` | `0.25rem` | `4px` |
| `--radius-md` | `0.75rem` | `8px` |
| `--radius-lg` | `1rem` | `16px` |

**4 collision(s).** Décision Phase 5 recommandée : renommer ces variables
legacy dans `tokens.css` + usages (mécanique, vérifiable au grep), puis fusionner
`theme-semantique.css` dans `theme.css`. Alternative écartée : préfixer tous les
tokens sémantiques (chaque futur export exigerait une passe de renommage à vie).

## 5. Verdict pipeline (vérification visuelle du design-lab)

> **DÉCISION (user, 2026-07-29)** : le design system FINAL n'est pas encore
> exporté. À la réception de l'export des maquettes finales, celui-ci devient
> la **RÉFÉRENCE UNIQUE** du thème des blocs réutilisables et des gabarits de
> page — les conflits du §3 (radii, Bleu Royal absent de la palette générée,
> #0050cc hors charte…) seront réglés À CE MOMENT-LÀ, pas avant. D'ici là :
> `theme-semantique.css` est un HARNAIS PROVISOIRE (design-lab seulement),
> la Phase 5 attend l'export final, et ce script d'audit se rejoue sur
> l'export final pour produire la version définitive de ce rapport.

**✅ PIPELINE VALIDÉ** (2026-07-29, `/fr/design-lab` vs `screen.png`, viewport 1440) :
le body de l'export Homepage compile et rend fidèlement contre le pipeline v4 du
repo (`design-lab.css` + `theme-semantique.css`) — mise en page, grilles, typo
sémantique (`headline-xl`…), palette, ombres, bordures accent, icônes Material
Symbols auto-hébergées (sous-ensemble 3 Ko) et Hanken Grotesk locale : conformes.

**Recette de conversion d'un export** (à rejouer pour chaque futur écran) :
1. retirer Play CDN + config inline + liens Google Fonts (le pipeline les remplace) ;
2. rapatrier les images `aida-public` en local et réécrire les `src` (+`data-alt`→`alt`) ;
3. retirer les scripts embarqués (décoratifs, `href="#"` non valides) ;
4. ⚠️ **piège v4 découvert par le test** : l'échelle d'espacement nommée
   (`--spacing-lg/xl`…) MASQUE les tailles nommées `--container-*` pour
   `max-w-*` → remplacer `max-w-lg`/`max-w-xl` par `max-w-[32rem]`/`max-w-[36rem]`
   (sinon colonne de 24/40 px) ; `max-w-2xl`/`7xl` non touchés (pas de spacing homonyme) ;
5. si nouvelles icônes : régénérer le sous-ensemble Material Symbols
   (`icon_names=` de l'API css2, triés alphabétiquement).

**Deltas mineurs assumés** (non bloquants) :
- `rounded` nu : 0.5rem (charte DESIGN.md, = `--radius-controle`) là où le
  code.html Homepage disait 0.25rem — conflit §3, la charte gagne ;
- `screen.png` rendu à 1600 px vs capture 1440 px : micro-écarts de retours de
  ligne (bouton « Ø Studio » sur 1 ligne au lieu de 2) ;
- antialiasing/graisse des icônes légèrement différents (axes figés opsz 24/wght 400).

