# Police et bleu de marque — recette d'application

**Le bleu est tranché ; la police reste ouverte.** Ce document ne sert plus qu'à
deux choses : appliquer un choix de police **en une fois** le jour où il est
fait, et garder la trace de l'écart de bleu qui a occupé deux journées — pour
que personne ne le rouvre.

> **Le banc d'essai a été retiré le 2026-09-22** (lot L-polices, décision de
> Gabriel du 21/09). Il avait joué son rôle : `?police=` / `?bleu=` sur
> n'importe quelle page, choix mémorisé, étiquette de rappel. Ce qui disparaît
> avec lui : `src/styles/banc-essai.css`, son import et son script en ligne dans
> `src/layouts/BaseLayout.astro`, et `tests/e2e/banc-essai.spec.ts` — **~3,1 Ko
> de script en moins sur CHAQUE page** (~1,2 Ko compressé), parce que le script
> était inconditionnel même quand il ne faisait rien.
> Pour le retrouver : `git log -- src/styles/banc-essai.css`.

## Où vit la police, aujourd'hui

Trois endroits, et c'est tout :

| Quoi | Où |
|---|---|
| Le `@font-face` | `src/styles/theme.css` (en tête) — Inter variable **auto-hébergée** |
| Le fichier | `public/fonts/InterVariable-subset.woff2` (107 Ko, sous-ensemble produit par `scripts/subset-inter.mjs` ; l'original complet reste à côté) |
| Le préchargement | `src/layouts/BaseLayout.astro`, `<link rel="preload">` |
| Les jetons | `--font-sans` (`src/styles/tokens.css`) ; `--font-inter` et l'alias historique `--font-grotesk` (`src/styles/theme.css`, bloc `@theme`) |

## La recette — appliquer une police, en deux étapes

### 1. Rapatrier le fichier en local (**non négociable**)

Une police servie par Google Fonts est une **requête vers un tiers** : c'est un
sujet Loi 25 que notre bandeau de consentement **ne couvre pas**, et la CSP de
`public/_headers` n'autorise pas `fonts.googleapis.com`. Le banc d'essai s'en
accommodait parce qu'il ne servait qu'à regarder, sur demande explicite. Une
mise en production, non.

```powershell
# Récupérer le .woff2 variable depuis le dépôt officiel de la fonte, le déposer
# dans public/fonts/, puis (optionnel) le sous-ensembler comme Inter :
node scripts/subset-inter.mjs   # à adapter : il est écrit pour Inter
```

Puis remplacer le `@font-face` de `src/styles/theme.css` :

```css
@font-face {
  font-family: 'Montserrat';            /* ou 'Nunito Sans', 'Hanken Grotesk' */
  font-style: normal;
  font-weight: 100 900;                 /* fonte variable : garder la plage */
  font-display: swap;
  src: url('/fonts/<le-fichier>.woff2') format('woff2');
}
```

…et le `preload` de `src/layouts/BaseLayout.astro`, qui doit pointer **le même
fichier** (sinon la police est téléchargée deux fois).

### 2. Poser le jeton

Les trois piles sont prêtes à coller. Remplacer `--font-sans` dans
`src/styles/tokens.css`, **et** `--font-inter` / `--font-grotesk` dans le bloc
`@theme` de `src/styles/theme.css` (l'alias `font-grotesk` est encore utilisé
dans le markup re-skinné : le laisser pointer sur la police courante évite une
passe de renommage).

```css
/* Montserrat — la police du site ACTUEL victrix.ca, retirée le 2026-08-04 */
--font-sans: 'Montserrat', system-ui, -apple-system, 'Segoe UI', Roboto,
  Helvetica, Arial, sans-serif;

/* Nunito Sans — piste proposée par Gabriel */
--font-sans: 'Nunito Sans', system-ui, -apple-system, 'Segoe UI', Roboto,
  Helvetica, Arial, sans-serif;

/* Hanken Grotesk — la police de TOUTES les maquettes du designer */
--font-sans: 'Hanken Grotesk', system-ui, -apple-system, 'Segoe UI', Roboto,
  Helvetica, Arial, sans-serif;
```

### 3. Vérifier

Changer de police modifie la **hauteur d'œil perçue** : Montserrat et Nunito
Sans paraissent plus grandes qu'Inter à taille égale. Deux garde-fous existent
déjà, les passer avant de conclure :

- `npx playwright test tests/e2e/typographie.spec.ts` — plancher de 14 px et
  échelle en `rem` (aucun texte ne doit descendre sous 14 px) ;
- `npx playwright test tests/e2e/accessibilite.spec.ts` — axe-core sur
  9 gabarits ; une police plus large peut déplacer un texte hors de sa zone
  voilée et faire tomber un contraste.

Et juger sur des **pages réelles**, pas sur un échantillon.

## Ce qui NE dépend pas de ce choix

Les **tailles** de texte : traitées séparément le 2026-09-21 (plancher 14 px et
échelle en `rem` — `scripts/migrate-typo-rem.mjs`, `docs/operations.md`
§ Accessibilité). Et le **fond de section « Bleu électrique »**, qui offre
`#1a5bff` de façon PERMANENTE, section par section
(`component-library/src/shared/fonds.ts`) : il n'a aucun rapport avec le banc,
qui repeignait tout le site d'un coup. Le banc disparaît, ce fond reste.

## Le bleu — TRANCHÉ le 2026-09-21, ne pas rouvrir

`--color-primary` vaut `#002fc7`, avec toute la famille de rôles du Design
System (`primary-container` `#1d46f3`, `on-primary-fixed` `#00105b`…), dans
`theme.css` ET dans la couche héritée `tokens.css`. **L'ancien bleu n'est pas
supprimé** : il reste `--color-bleu-500` et garde sa place dans la palette de
l'éditrice sous « Bleu électrique » (`bleu-electrique` → `bg-bleu-500`), à côté
du nouveau « Bleu Victrix » (`bleu-profond` → `bg-primary`). Les sections déjà
posées n'ont donc pas changé de couleur.

Effet de bord utile : le H1 de la page Contact peut enfin porter le `#00105B`
exact de sa maquette, au lieu du repli `bleu-800` posé en août.

Ce que la bascule a révélé, corrigé le même jour : `global.css` impose
`color: var(--color-navy)` à tous les `h1`-`h4`, ce qui **bat la couleur héritée
d'un parent**. Un titre sur aplat bleu doit donc porter lui-même sa classe
(`text-on-primary`), sinon il reste bleu nuit sur bleu — 1,9:1. Vérifié par
`tests/e2e/accessibilite.spec.ts`.

### Historique de l'écart

| Source | Bleu |
|---|---|
| Design System Figma (`docs/design/Design system/VictrixModernWeb-DesignSystenm.md`) | `#002fc7` |
| `landing page maquette.css` (2026-09-21) | `#002fc7` |
| `page produit - enfant.css` (2026-09-21) | `#002fc7` |
| Le site, du 2026-08-14 au 2026-09-21 | `#1a5bff` |

L'écart vient de la bascule export2 du 2026-08-14. `reception-export2.md`
(§ Mappings) l'assume explicitement : « `#002FC7` est lu comme **calque hérité
de l'ancienne planche** » → remappé sur `#1a5bff`, avec la mention **« à
confirmer avec le designer »**, jamais levée. Les deux maquettes reçues le
2026-09-21 sont encore en `#002fc7` : l'hypothèse du calque hérité était donc
fausse, et c'est ce qui a tranché.

Pour mémoire, les deux éléments qui ont servi à décider :

- **Contraste.** `#002fc7` donne 9,41:1 sur blanc, contre 5,27:1 pour
  `#1a5bff`. Les deux passent AA, mais le bleu des maquettes est nettement plus
  confortable, et il a rendu inutile le passage de `text-white/80` à `/90` fait
  le même jour sur les aplats bleus.
- **Effort.** Le bleu est un jeton unique (`--color-primary`) que 38 composants
  consomment par `bg-primary` / `text-primary`. L'adopter a demandé : la famille
  de rôles dans `theme.css`, la pastille d'aperçu du fond « bleu électrique »
  (`shared/fonds.ts`, `couleur:`), et les trois valeurs de repli de
  `global.css`. Rien de plus.
