# Banc d'essai — police et bleu commutables

**Temporaire.** Ce dispositif existe pour trancher deux écarts entre les
maquettes et le site. Une fois les arbitrages rendus, on applique le choix
dans `theme.css` et on supprime `src/styles/banc-essai.css`, le script du
`<head>` de `BaseLayout.astro`, `tests/e2e/banc-essai.spec.ts` et ce document.

Créé le 2026-09-21 à la demande de Gabriel : « le bleu du Figma n'est pas
celui qu'on a en ligne, non ? » — c'est exact, et ce n'est pas une illusion
d'écran.

## Comment s'en servir

Ajouter les paramètres à **n'importe quelle** page :

| Paramètre | Valeurs | Défaut |
|---|---|---|
| `?police=` | `inter` · `montserrat` · `nunito` · `hanken` | `inter` (le site) |
| `?bleu=` | `figma` · `export2` | **`figma` (le site, depuis le 2026-09-21)** |
| `?banc=off` | — | remet tout à zéro |

**Le bleu a été TRANCHÉ le 2026-09-21** : Gabriel a retenu celui du Design
System Figma, qui est devenu le bleu du site (`theme.css`, `tokens.css`).
`?bleu=figma` ne fait donc plus rien — c'est le rendu normal ; ce qui reste
commutable, c'est l'ANCIEN bleu, avec `?bleu=export2`, utile pour montrer
l'avant/après. **Le choix de la police, lui, reste ouvert.**

Exemples :

```
/fr/?bleu=export2
/fr/campagnes/licences-power-platform/?police=montserrat
/fr/services/cybersecurite?police=hanken
/fr/?banc=off
```

Le choix est **mémorisé** : on peut ensuite naviguer normalement dans le site,
la variante suit. Une étiquette discrète en bas à droite rappelle ce qu'on
regarde — à vérifier avant toute capture d'écran destinée au client.

**Sans paramètre, le banc est totalement inerte** : aucun attribut, aucune
police téléchargée, aucune requête vers Google Fonts, aucun octet pour un
visiteur. C'est ce qui permet de le laisser en place, y compris sur le site
dev, pendant toute la durée de l'arbitrage. Le premier test de
`tests/e2e/banc-essai.spec.ts` verrouille cette propriété.

## Arbitrage 1 — le bleu · **TRANCHÉ le 2026-09-21 : c'est le bleu Figma**

`--color-primary` vaut désormais `#002fc7`, avec toute la famille de rôles du
Design System (`primary-container` `#1d46f3`, `on-primary-fixed` `#00105b`…),
dans `theme.css` ET dans la couche héritée `tokens.css`. **L'ancien bleu n'est
pas supprimé** : il reste `--color-bleu-500` et garde sa place dans la palette
de l'éditrice sous « Bleu électrique » (`bleu-electrique` → `bg-bleu-500`), à
côté du nouveau « Bleu Victrix » (`bleu-profond` → `bg-primary`). Les sections
déjà posées n'ont donc pas changé de couleur.

Effet de bord utile : le H1 de la page Contact peut enfin porter le `#00105B`
exact de sa maquette, au lieu du repli `bleu-800` posé en août.

Ce que la bascule a révélé, corrigé le même jour : `global.css` impose
`color: var(--color-navy)` à tous les `h1`-`h4`, ce qui **bat la couleur
héritée d'un parent**. Un titre sur aplat bleu doit donc porter lui-même sa
classe (`text-on-primary`), sinon il reste bleu nuit sur bleu — 1,9:1.
Vérifié par `tests/e2e/accessibilite.spec.ts`.

### Historique de l'écart

| Source | Bleu |
|---|---|
| Design System Figma (`docs/design/Design system/VictrixModernWeb-DesignSystenm.md`) | `#002fc7` |
| `landing page maquette.css` (2026-09-21) | `#002fc7` |
| `page produit - enfant.css` (2026-09-21) | `#002fc7` |
| Le site | `#1a5bff` |

L'écart vient de la bascule export2 du 2026-08-14. `reception-export2.md`
(§ Mappings) l'assume explicitement : « `#002FC7` est lu comme **calque hérité
de l'ancienne planche** » → remappé sur `#1a5bff`, avec la mention **« à
confirmer avec le designer »**, jamais levée. Les deux maquettes reçues le
2026-09-21 sont encore en `#002fc7` : l'hypothèse du calque hérité est donc
démentie.

Deux éléments pour la décision :

- **Contraste.** `#002fc7` donne 9,41:1 sur blanc, contre 5,27:1 pour
  `#1a5bff`. Les deux passent le niveau AA, mais le bleu des maquettes est
  nettement plus confortable, et il rendrait inutile le passage de
  `text-white/80` à `/90` fait le même jour sur les aplats bleus.
- **Effort.** Le bleu est un jeton unique (`--color-primary`) que 38
  composants consomment par `bg-primary` / `text-primary`. Adopter `#002fc7`
  pour de bon = la famille de rôles dans `theme.css`, la pastille d'aperçu du
  fond « bleu électrique » (`shared/fonds.ts`, `couleur:`), et les trois
  valeurs de repli de `global.css`. Rien de plus.

## Arbitrage 2 — la police

| Candidate | D'où elle vient |
|---|---|
| **Inter** | le site aujourd'hui (export2, 2026-08-14) |
| **Montserrat 400** | la police du site ACTUEL victrix.ca, retirée le 2026-08-04 |
| **Nunito Sans 400** | piste proposée par Gabriel |
| **Hanken Grotesk** | la police de TOUTES les maquettes du designer |

Inter est servie depuis le dépôt (`public/fonts/InterVariable-subset.woff2`).
Les trois autres viennent de Google Fonts **et seulement quand on les
demande**. Si le choix se porte sur l'une d'elles, il faudra la rapatrier en
local avant la mise en production : une police servie par Google est une
requête vers un tiers, donc un sujet Loi 25 que le bandeau de consentement ne
couvre pas aujourd'hui.

## Ce que le banc ne change pas

Les **tailles** de texte. Elles ont été traitées séparément le même jour
(plancher 14px et échelle en `rem` — voir `scripts/migrate-typo-rem.mjs` et
`docs/operations.md` § Accessibilité). Changer de police modifie la hauteur
d'œil perçue : Montserrat et Nunito Sans paraissent plus grandes qu'Inter à
taille égale. En juger sur des pages réelles, pas sur un échantillon.
