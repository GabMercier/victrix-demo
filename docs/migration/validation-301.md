# Validation des adresses de l'ancien site

> Généré par `npm run check:old-urls` — **ne pas modifier à la main.**
> Mesuré contre le build `.\dist` et ses 375 routes
> (`dist/_cloudcannon/routing.json`, ce que lira l'hébergement de production).

La question posée, adresse par adresse : **si quelqu'un la tape aujourd'hui,
où arrive-t-il ?** Les liens entrants (Google, LinkedIn, courriels, signets)
ne passent par aucun des autres garde-fous du dépôt.

## Bilan

| | Nombre |
| --- | --- |
| Adresses au périmètre | 173 |
| Arrivent sur une page | **172** |
| dont sans bouger (la page existe à la même adresse) | 2 |
| dont par une redirection, en un saut | 170 |
| N'arrivent pas | **1** |
| dont chaîne de redirections (un saut de trop) | 0 |
| dont redirigées vers une page absente | 0 |
| dont aucune règle | 1 |

## Deux nuances derrière le mot « arrivent »

**170 redirections visent une adresse sans barre oblique finale** (`/fr/contact`),
et c'est **sans conséquence** : vérifié au `curl` sur le site déployé le
2026-09-23, ces adresses répondent **200 directement**, sans 307 de
canonisation. La crainte d'un saut supplémentaire — décision 6 du § 8 de
`plan-redirections.md` — est donc levée, et la décision est : **ne rien**
**changer**. Le 307 observé la veille portait sur un chemin à la casse
différente (`/Decouvrir-Victrix`), qui ne correspond à aucune règle.

**0 adresses n'arrivent que par une règle à joker**, c'est-à-dire sur la
page d'accueil d'une rubrique et non sur la page qui les remplace vraiment.
Pour un visiteur c'est un détour ; pour Google c'est un *soft 404*, et le
référencement de l'ancienne page ne se transfère pas. À regarder quand une
page précise existe bel et bien dans la refonte.

_Aucune._

## Chaînes de redirections

Google ne suit qu'un petit nombre de sauts et dilue le référencement à
chacun. Une chaîne se corrige en faisant pointer la première règle
directement sur la destination finale.

_Aucune._

## Redirigées vers une page absente

La règle part bien, mais la page d'arrivée n'existe pas dans le build.

_Aucune._

## Aucune règle

Rien n'est prévu pour ces adresses : elles rendront la page 404.

| Adresse de l'ancien site | Parcours | Vue par |
| --- | --- | --- |
| `/cache/` | — | plan de site en ligne |
