# Articles — les images de l’ancien site absentes de nos articles

> Généré par `python scripts/migration/images-manquantes-articles.py`.
> Source : le cache des pages EN LIGNE, `docs/migration/cache-source/`.
> **Aucun fichier de contenu n’est modifié.**

| | |
| --- | --- |
| Articles comparés | **47** |
| Articles avec une image de contenu absente ou servie par l’ancien domaine | **1** |
| Images de contenu absentes du Markdown (hors couverture) | **3** |
| Icônes décoratives absentes (choix de forme, hors décompte) | 6 |
| `<img>` encore servies par `https://www.victrix.ca` | **0** |
| Articles sans source comparable | 2 |

**Comment lire.** Une image est « absente » quand son NOM de fichier (suffixe
de vignette `-300x200` ignoré) n’apparaît ni dans un `![…](…)` ni dans un
`<img>` du corps de l’article. « dans public » = le fichier est déjà rapatrié
sous `public/wp-content/`, il ne reste qu’à le poser à sa place dans le texte.

## Articles à reprendre

| Article | Images de contenu absentes | Servies par l’ancien domaine | Source |
| --- | --- | --- | --- |
| `src/content/blog/en/servicenow-itom.md` | **3** / 3 |  | <https://www.victrix.ca/en/ressources/servicenow-itom/> |

## Le détail

### `src/content/blog/en/servicenow-itom.md`

- `victrix_infograhic-itom-servicenow-fr` — dans public
- `victrix_automation-statistics-fr` — dans public
- `victrix_diagramme-venn-itsmitom-victrix-fr` — dans public

## Articles sans source comparable

- `src/content/blog/en/externalisation-soc-avantages-inconvenients.md` — source absente du cache
- `src/content/blog/fr/externalisation-soc-avantages-inconvenients.md` — source absente du cache
