# Articles — les blocs de l’ancien site qui ne sont pas chez nous

> Généré par `python scripts/migration/blocs-manquants-articles.py`
> (après un `npm run build`). Source : le cache des pages EN LIGNE,
> `docs/migration/cache-source/`. **Aucun fichier de contenu n’est modifié.**

| | |
| --- | --- |
| Articles comparés | **50** |
| Articles avec au moins un bloc absent | **0** |
| Blocs absents au total | **0** |
| Mots concernés | **0** |
| Articles sans source comparable | 7 |
| Articles écartés — source entière dans l’autre langue | 5 |

**Comment lire.** Un paragraphe ou un item de liste est « absent » quand moins
de 50 % de ses mots significatifs (≥ 5 lettres) se retrouvent dans la page
construite. Un TITRE est « absent » dès qu’il n’est pas retrouvé mot pour mot
(ses mots pris un à un se retrouvent presque toujours ailleurs) — le pourcentage
indiqué est alors celui de ses mots de 4 lettres et plus, à titre indicatif.
Un bloc court (moins de 5 mots significatifs, au moins 3 mots : la question
d’une FAQ, l’intitulé d’un encadré) non retrouvé mot pour mot est signalé
« à vérifier » ; les intitulés de boutons ne le sont jamais.

**Ce que ce rapport ne dit pas** : il juge le TEXTE, pas la FORME. Un encadré
« Le saviez-vous ? » rendu en paragraphe simple, une FAQ aplatie en titres ou
un bouton devenu un lien nu comptent comme présents — leur texte est là. La
mise en forme de ces éléments est un sujet distinct.

## Articles écartés — la page source est dans l’autre langue

L’ancien site servait ces pages `/en/…` EN FRANÇAIS ; nos articles anglais
sont des traductions faites depuis. Rien n’y est perdu, mais rien n’y est
comparable bloc par bloc non plus : à relire avec la version FR à côté.

- `src/content/blog/en/partie-1-meilleures-pratiques-en-securite-operationnelle-la-maintenance.md` — source <https://www.victrix.ca/en/best-practices-in-operational-safety-maintenance/> en FR
- `src/content/blog/en/sase-cloud.md` — source <https://www.victrix.ca/en/ressources/sase-cloud/> en FR
- `src/content/blog/en/servicenow-itom.md` — source <https://www.victrix.ca/en/ressources/servicenow-itom/> en FR
- `src/content/blog/en/servicenow-itsm.md` — source <https://www.victrix.ca/en/ressources/servicenow-itsm/> en FR
- `src/content/blog/en/zero-trust-network-access-ztna.md` — source <https://www.victrix.ca/en/zero-trust-network-access-ztna/> en FR

## Articles sans source comparable

- `src/content/blog/fr/externalisation-soc-avantages-inconvenients.md` — source absente du cache (statut 404)
- `src/content/blog/fr/partie-1-meilleures-pratiques-en-securite-operationnelle-la-maintenance.md` — source absente du cache (statut 404)
- `src/content/blog/fr/partie-2-meilleures-pratiques-en-securite-operationnelle-la-surveillance.md` — source absente du cache (statut 404)
- `src/content/blog/fr/partie-3-meilleures-pratiques-en-securite-operationnelle-la-defense.md` — source absente du cache (statut 404)
- `src/content/blog/en/externalisation-soc-avantages-inconvenients.md` — source absente du cache (statut 404)
- `src/content/blog/en/partie-2-meilleures-pratiques-en-securite-operationnelle-la-surveillance.md` — source absente du cache (statut 404)
- `src/content/blog/en/partie-3-meilleures-pratiques-en-securite-operationnelle-la-defense.md` — source absente du cache (statut 404)

