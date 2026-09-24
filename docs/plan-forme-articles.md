# Forme des articles — 4 patrons pour le corps Markdown (lot 4, nuit du 2026-09-24)

> Le vrai blocage de Julie : les articles migrés de WordPress portent leur
> mise en forme en HTML BRUT (`<a class="article-cta">`, `<table style=…>`),
> que l'éditeur de texte CloudCannon ne sait ni afficher ni reproduire. Ce
> plan fixe QUATRE patrons — un seul rendu chacun, dans `src/styles/global.css`
> sous `.prose` (jetons de `src/styles/theme.css`, contraste AA, `border-solid`,
> `m-0`) — puis l'outillage pour convertir l'existant et pour que Julie
> INSÈRE ces patrons depuis l'éditeur (snippets CloudCannon).
>
> Mesuré avant le lot : 49 bannières `article-cta` dans 25 articles, 10
> encadrés « Le saviez-vous » (FR + EN), 9 questions de FAQ en gras (DORA,
> agents Copilot Studio), 24 `<table>` dans 14 articles avec 8 variantes
> d'attributs `style`/`border`/`cellpadding`.

## Règles communes

- Le patron est du **HTML dans le Markdown** : un bloc HTML de CommonMark
  (balise ouvrante en début de ligne), une **ligne vide**, du Markdown
  ordinaire, une ligne vide, la balise fermante. Le Markdown à l'intérieur
  reste éditable (gras, liens, listes) — c'est ce que l'éditeur de contenu
  CloudCannon sait faire.
- **Aucun script.** La FAQ dépliante repose sur `<details>/<summary>` natifs.
- **Une seule classe par patron**, préfixée `article-` (le préfixe existant
  de `article-cta`), et rendue UNIQUEMENT dans `global.css` sous `.prose`
  (plus aucun style scoped dans `src/pages/[lang]/ressources/[slug].astro`).
- Couleurs = jetons : texte `--color-encre` (#21242a) sur ivoire/beige/blanc
  ≥ 12:1 ; bouton blanc sur `--color-primary` (#1d46f3) = 7,4:1 ; bordures
  `--color-contour`, rayon `--radius-m` (8 px).
- **Aucun texte modifié** par la conversion : seules les balises et leurs
  attributs changent ; les attributs de fusion de cellules (`colspan`,
  `rowspan`) sont conservés.

## 1. Bouton d'appel à l'action — `btn` / `btn-outline`

Reprend les classes que `component-library/src/shared/rich.ts` autorise déjà
sur un lien du texte enrichi des sections (`ALLOWED_LINK_CLASSES`) : un seul
vocabulaire pour l'éditrice, dans les sections comme dans les articles. Le
rendu global `a.btn` existe ; `.prose` y ajoute la neutralisation du
soulignement et de la couleur de lien, un rythme vertical, et la variante
`btn-outline`.

```html
<a class="btn" href="/fr/contact/">Parlez à un expert</a>

<a class="btn-outline" href="/fr/services/cybersecurite/">Découvrir la cybersécurité</a>
```

Conversion : `<a class="article-cta" href="…">texte</a>` → `<a class="btn"
href="…">texte</a>` (49 occurrences). La règle scoped `.article__body
:global(.article-cta)` de la route disparaît avec la dernière occurrence.

## 2. Encadré « Le saviez-vous » — `<aside class="article-encadre">`

Fond beige (`--color-surface-container`), filet gauche bleu, titre en
petites capitales navy ; le contenu reste du Markdown.

```html
<aside class="article-encadre">
<p class="article-encadre__titre">Le saviez-vous ?</p>

**10 millions d'euros.** C'est l'amende maximale à laquelle vous vous exposez
en cas de non-conformité à NIS2.

</aside>
```

Conversion : un titre `#### Le saviez-vous ?` / `#### Did You Know?` (ou
`### ![ampoule](…)Le saviez-vous?` — l'icône WordPress est retirée, elle est
purement décorative) et TOUT ce qui suit jusqu'au prochain titre `#` entrent
dans l'encadré. Le titre passe de `<h4>` à `<p class="…__titre">` : un
encadré n'est pas une section du plan de l'article (les H2/H3 restent des
titres).

## 3. FAQ dépliante — `<details class="article-faq">`

Natif, sans script, accessible au clavier (le `<summary>` est focusable et
annoncé « bouton dépliable » par les lecteurs d'écran). Un chevron en CSS
(`::after`) remplace le triangle par défaut.

```html
<details class="article-faq">
<summary>Qu'est-ce que la réglementation DORA ?</summary>

DORA est l'acronyme de *Digital Operational Resilience Act*. Il s'agit du
règlement sur la résilience opérationnelle numérique des services financiers.

</details>
```

Conversion : une ligne `**Question ?**` (gras seul, terminée par `?`) et les
paragraphes qui la suivent jusqu'à la prochaine question en gras, au prochain
titre ou au prochain bloc HTML. Les FAQ déjà en titres `### Question ?` sous
un `## FAQ` ne sont PAS converties : ce sont des titres, ils comptent pour le
référencement (FAQ structurée) — décision à prendre séparément si Julie les
veut dépliantes aussi.

## 4. Tableau lisible — `<div class="article-tableau">`

Défilement horizontal sur mobile (le conteneur, pas la page), en-tête
distinct, zébrage, bordures fines, cellules aérées.

```html
<div class="article-tableau">
<table>
<thead>
<tr><th>Critères décisifs</th><th>ChatGPT</th><th>Microsoft 365 Copilot</th></tr>
</thead>
<tbody>
<tr><td><strong>Intégration native à Microsoft 365</strong></td><td>Non disponible</td><td>Intégration transparente</td></tr>
<tr><td><strong>Limites d'utilisation</strong></td><td>Accès limité</td><td>Accès stable</td></tr>
</tbody>
</table>
</div>
```

Conversion : tous les attributs de présentation (`style`, `border`,
`cellpadding`, `class`, `width`, `height`, `align`) sont retirés de `table`,
`thead`, `tbody`, `tr`, `td`, `th` ; `colspan`/`rowspan` sont gardés. Une
première ligne dont TOUTES les cellules ne contiennent qu'un titre
(`<h3>`/`<h4>`) ou un `<strong>` devient un `<thead>` de `<th>` (le titre
imbriqué disparaît, son texte reste). Le tout est enveloppé dans le
conteneur défilant.

## Exécution (dans l'ordre)

1. `src/styles/global.css` : les 4 patrons sous `.prose` ; retrait de la
   règle scoped `article-cta` de la route des articles.
2. `cloudcannon.config.yml` : `_snippets` (4 entrées) pour que Julie insère
   chaque patron depuis l'éditeur de contenu ; `npm run check:bookshop`
   reste vert (les snippets ne touchent pas aux composants).
   **NON FAIT (2026-09-24) — bloqué par CloudCannon** : un snippet
   personnalisé DOIT hériter d'un gabarit (`template`), et les gabarits
   existants sont tous liés à un moteur (Hugo/Jekyll/Eleventy shortcodes,
   composants MDX et Docusaurus, extensions python-markdown) — aucun n'émet
   du HTML dans un fichier `.md` ordinaire (vérifié : documentation
   « What is a snippet », « Snippets using MDX components », schéma
   configuration-types). Deux options, à trancher : (a) passer les articles
   en `.mdx` et déclarer 4 composants (`_snippets_imports: mdx` +
   `template: mdx_paired_component`), ≈ 0,5 j, avec les risques MDX sur le
   contenu migré ; (b) rester en `.md` : Julie colle les modèles du guide
   (§ « Mettre en forme un article »). Le guide décrit (b) en attendant.
3. `scripts/migration/restaure-forme-articles.py` : essai = diffs, `--apply`,
   `--only a,b` ; rapport article par article (nb de CTA, encadrés, FAQ,
   tableaux convertis) ; aucun texte modifié (vérifié par comparaison du
   texte nu avant/après).
4. Article de démonstration qui use des 4 patrons :
   `src/data/demo/forme-articles.md` (hors des collections : ni CMS, ni
   ressources, ni RSS), rendu par `src/pages/[lang]/style-guide/forme-articles.astro` sur
   `/fr/style-guide/forme-articles/` (page interne, noindex, hors sitemap
   comme le reste du style guide) ; scanné par `tests/e2e/accessibilite.spec.ts`
   (axe-core : 0 violation) ; comportement (FAQ dépliante sans script,
   tableau défilant) verrouillé par `tests/e2e/forme-articles.spec.ts`.
5. `docs/guide-edition.md` § « Mettre en forme un article » ; rituel.

## Ce que le plan ne fait pas (à trancher au matin)

- Les FAQ en titres `### Question ?` (Copilot vs ChatGPT, ServiceNow ITSM,
  IoT) restent des titres — voir § 3.
- Les tableaux gardent leurs fusions de cellules ; un tableau « en escalier »
  (rowspan sur 3 lignes, SOC) reste tel quel, seulement stylé.
- L'image « ampoule » des encadrés NIS2 est retirée (décorative) ; elle reste
  sous `public/wp-content/` si on la veut en icône CSS plus tard.
