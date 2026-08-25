# Réception export2 — design system appliqué (décision v3, 2026-08-14)

> Livraison reçue dans `docs/design/export2/` : `design-tokens.tokens.json`
> (export Figma Design Tokens — 24 styles de texte, palettes bleu/neutral/
> secondaires, effets), `Code/{header, footer, mega-menu, card-services,
> card-solutions}` (exports HTML+CSS par composant, avec screenshots) et
> `Images/` (5 photos). **Décision v3 (user, 2026-08-14)** : cette livraison
> est la RÉFÉRENCE UNIQUE du design system — elle remplace l'arbitrage v2 du
> 2026-08-04 (« SYSTÈME = planche DesignSystemVictrix.png »). Appliquée le
> jour même (ce document = trace de ce qui a été fait et de ce qui reste).

## 1. Ce que change la v3 (vs v2 « planche »)

| Axe | v2 (planche, 2026-08-04) | v3 (export2, appliqué) |
|---|---|---|
| Police | Hanken Grotesk variable | **Inter variable** (`public/fonts/InterVariable.woff2`, rsms.me, OFL — Hanken retirée) |
| Neutres | Échelle chaude ivoire/beige/sable | **Échelle froide `neutral-50…950`** (les gris « verbatim maquette » #F8F9FA/#C5C6D0/#EDEEEF… deviennent des tokens officiels) |
| Canvas | Ivoire #faf7f3 | **Blanc** (bandes claires = neutral-50/100) |
| Bleu | #1a5bff, hover #1348d6 | #1a5bff (bleu-500) inchangé, **hover #0043eb (bleu-600)** ; échelle complète bleu-50…900 |
| Bleu nuit | #0d1430 | **#0b1334** (`semantic.background.bleu`) |
| Chauds | Fond de tout le site | Survivent comme **accents** (`--color-ivoire/beige/sable`, hex export2 #faf7f4/#f1e8df/#ebe0d5) |
| Graisses | Display Bold 700, Headlines SemiBold 600 | **Display ExtraBold 800, Headings Bold 700**, overline/boutons SemiBold 600 |
| body-lg | 18px | **20px** (`body.regular.l` 20/28) |
| label-caps | 12px/500/0.12em | **14px/600/0.1em** (`label.overline.s`) |
| Ombres | teintées nuit | `effect.normal/hover/active` → `--shadow-controle(-survol/-active)` ; carte 0 4 12 rgb(28 27 27/5 %) → `--shadow-ambiante` |

Fichiers porteurs : `src/styles/theme.css` (échelles primitives + rôles
Material ré-ancrés + typo Inter), `src/styles/tokens.css` (couche legacy
re-mappée pour les composants pas encore re-skinnés),
`src/layouts/BaseLayout.astro` (preload Inter). Référence vivante :
`/fr/style-guide` (mise à jour).

## 2. Exports composant appliqués (5/5)

| Export | Composant repo | Application |
|---|---|---|
| `Code/header` | `src/components/Header.astro` | Barre 72px + ombre « normal », nav 16/400 neutral-600 (survol bleu + fond bleu 5 %), actions 16/600, recherche pastille ronde, CTA bleu rayon 4 px 24/12 14/600 |
| `Code/mega-menu` | `Header.astro` (panneaux) | Têtes de colonne 12/600 uppercase + filet neutral-500, liens 14 h-40 avec **barre bleue 6px au survol** (remplace la flèche), carte vedette neutral-50 bordée neutral-300 rayon 8 (titre 16/700, texte 14, lien 14/600), bandeau bas neutral-100 texte 14/600 |
| `Code/footer` | `src/components/Footer.astro` | Fond **neutral-50** (fin du footer blanc du 08-11), titres 18/700, liens 14 neutral-700, chip portail **bleu-200/bleu-600** rayon 4 + ombre, coordonnées 14 neutral-800, filet bas **neutral-500**, mentions 14/600, retour-haut bordure neutral-400 fond transparent |
| `Code/card-services` | `home-expertises` (peau « claire ») | Carte blanche bordée neutral-200 rayon 4 p-8 ombre ambiante, icône bleue 32, titre 20/700 neutral-900, texte 14 neutral-600, lien « En voir plus » 14/600 bleu + flèche qui glisse au survol. Autres peaux : hex froids → tokens (neutral-100/400/600, bleu-100) |
| `Code/card-solutions` | `home-solutions` | Rayon 4, p-40 desktop, dégradé noir 90 % → 60 % (mi-hauteur) → transparent, icône 32 + titre 24/700 blancs, texte 14 blanc, lien 14/600 blanc **souligné** (offset 4) + flèche, survol opacité 80 % |

Photos : copiées dans `public/images/design/` (carrieres-call-center,
carrieres-run, homepage-team-victrix, lp-team-ti, produit-enfant-brain) —
disponibles pour le CMS, câblage dans les pages à faire au contenu.

## 3. Correspondances hex export → token (pour les prochains portages)

Les exports composant contiennent quelques hex hors tokens.json — mappés au
plus proche : `#f8f9fa`→neutral-50 · `#edeeef`→neutral-100 · `#c5c6d0`→
neutral-300 · `#44474f`→neutral-700 · `#30353f`→neutral-800 · `#0043e0`→
bleu-600 · `#e5e2e1` (fallback carte solution)→neutral-200 · gris Tailwind
hérités (#6B7280/#9CA3AF/#F3F4F6/#DBEAFE)→neutral-600/400/100 + bleu-100.

## 4. Reste à faire / signalements

1. **Previews CloudCannon** : les `preview.png` des sections doivent être
   régénérés (`npm run design:previews`) — la peau a changé partout.
2. **Sous-ensemble Inter** : `InterVariable.woff2` complet = 344 Ko (vs 34 Ko
   pour l'ancien sous-ensemble Hanken latin). À sous-ensembler (pyftsubset,
   unicode-range latin) dans une passe perf.
3. **Composants non couverts par un export** (hero, bento, CTA, formulaires,
   témoignage…) : ils héritent du nouveau skin via les tokens ré-ancrés ;
   leurs commentaires « planche/Hanken » vieillissent — à rafraîchir au fil
   des lots. Demander au designer les exports manquants si divergence.
4. **`scripts/design/audit-export-tokens.mjs`** : écrit pour les exports v2
   (5 pages HTML + charte Hanken) — à adapter si on veut le rejouer sur le
   format tokens.json d'export2.
5. Divergences internes export2 (constat, pas bloquant) : le CSS des exports
   composant dit overline 12px là où le tokens.json dit 14/16 (retenu : 12px
   pour le méga — fidélité visuelle au screenshot) ; boutons 14/600 vs
   `label.bold.s` 700 (retenu : 600, valeur des 5 exports).

## 5. Livraison 2026-08-18 — maquettes FINALES landing + contact, images catalogue

Reçus : `landing-pagefinal.txt` (landing campagne Licences Power Platform),
`contactfinal.css` (page Contact), `hero catalogue.jpg` + 8 photos de
solutions (le fichier hash `2090b126….jpg` = « Gestion des idées », confirmé
visuellement). **Appliqués le jour même** (contact.astro ; landing
licences-power-platform fr+en + composants hero/benefits/form/strategic-value/
callout ; 9 images → `public/images/solutions/`, câblées dans les 18 JSON).

Mappings/arbitrages (décision user 2026-08-18 : teinte proche → token en
place, jamais de nouveau hex) :

- **`#002FC7`** (titres/icônes/liens des deux maquettes finales — les boutons
  y restent `#1A5BFF`) → **`primary #1a5bff`**. Le même export utilise les
  vrais tokens ailleurs (header/footer/form) ; `#002FC7` est lu comme calque
  hérité de l'ancienne planche. À confirmer avec le designer.
- `#1C1C1A`→on-surface `#21242a` · `#444656`→on-surface-variant `#545f71` ·
  `#00105B`→on-primary-fixed `#0b1334` (substitutions déjà en place).
- `#FAF7F4`→ivoire · `#F1E8DF`→beige · `#EBE0D5`→sable · `#AAB2C0`→
  neutral-400 · `#072C88`→bleu-800 (tous exacts).
- Purgés de contact.astro : les verbatims de l'ancienne maquette `#C4C5D9`,
  `#F0EDEA` (et le gris Tailwind `#6B7280` des chevrons).
- `#E5E2DE` (bordures cartes landing) : verbatim conservé (déjà en place,
  proche neutral-200 `#e5e7eb` — à trancher avec le designer).

Signalement ASSETS : **tous les exports image font 512 px de large** —
étirés pleine largeur à ≥1920 ils deviennent flous (héros Carrières,
héros services, vedette catalogue). Le lettrage cuit de
`produit-enfant-hero.jpg` (bas droite) se fait rogner sur les viewports
larges et bas quel que soit l'object-position. **Demander des exports
≥1920 px** (et idéalement le lettrage en HTML, pas cuit dans l'image).
Correctif posé : héros Carrières `object-[50%_25%]` (les visages ne sont
plus coupés sur grand écran).
