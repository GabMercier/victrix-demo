---
title: "Forme des articles — les quatre patrons"
---

Cet article de démonstration use des quatre patrons de mise en forme du corps
d'un article (`docs/plan-forme-articles.md`). Il est rendu sur la page interne
`/fr/style-guide/forme-articles/` (noindex, hors plan de site), scanné par
axe-core dans `tests/e2e/accessibilite.spec.ts` et verrouillé par
`tests/e2e/forme-articles.spec.ts`. **Ne pas y mettre de vrai contenu.**

## 1. Bouton d'appel à l'action

Un lien autonome sur sa propre ligne, avec la classe `btn` (plein) ou
`btn-outline` (contour) — les mêmes classes que dans le texte enrichi des
sections.

<a class="btn" href="/fr/contact/">Parlez à un expert</a>

<a class="btn-outline" href="/fr/services/cybersecurite/">Découvrir la cybersécurité</a>

## 2. Encadré « Le saviez-vous »

<aside class="article-encadre">
<p class="article-encadre__titre">Le saviez-vous ?</p>

**10 millions d'euros.** C'est l'amende maximale à laquelle vous vous exposez
en cas de non-conformité à NIS2 — et le Markdown reste éditable à l'intérieur :
[un lien](/fr/services/cybersecurite/), du *gras*, une liste :

- premier point ;
- second point.

</aside>

## 3. FAQ dépliante

<details class="article-faq">
<summary>Qu'est-ce que la réglementation DORA ?</summary>

DORA est l'acronyme de *Digital Operational Resilience Act*. Il s'agit du
règlement sur la résilience opérationnelle numérique des services financiers
établi par la Commission européenne.

</details>

<details class="article-faq">
<summary>À qui s'applique la réglementation DORA ?</summary>

Au secteur des services financiers de l'Union européenne : banques,
assureurs, sociétés d'investissement et leurs fournisseurs TIC critiques.

</details>

<details class="article-faq">
<summary>Quelle est la date d'entrée en vigueur ?</summary>

Entré en vigueur le 16 janvier 2023, le règlement s'applique depuis le
17 janvier 2025.

</details>

## 4. Tableau lisible

<div class="article-tableau">
<table>
<thead>
<tr><th>Critères décisifs</th><th>ChatGPT</th><th>Microsoft 365 Copilot</th></tr>
</thead>
<tbody>
<tr><td><strong>Intégration native à Microsoft 365</strong></td><td>Non disponible</td><td>Intégration transparente</td></tr>
<tr><td><strong>Limites d'utilisation</strong></td><td>Accès limité, surtout lors de pics d'usage</td><td>Accès stable et immédiat</td></tr>
<tr><td><strong>Sécurité et confidentialité des données</strong></td><td>Faible</td><td>Sécurité intégrée à Microsoft</td></tr>
<tr><td><strong>Support linguistique (FR-CA, FR-EU, EN)</strong></td><td>Oui, général</td><td>Oui, optimisé pour l'entreprise</td></tr>
</tbody>
</table>
</div>

Un paragraphe de conclusion, pour vérifier le rythme vertical après le
tableau.
