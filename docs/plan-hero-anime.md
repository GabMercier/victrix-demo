# Plan — héros animés « façon CloudCannon » (accueil + Découvrir Victrix)

> Idée de Gabriel du 2026-09-17, planifiée le 2026-09-18. **Hors phase en
> cours** : à lancer après les lots formulaires/go-live (voir
> `plan-formulaires-inbox-captcha-analytics.md`) et le plan « éditeur »
> (digest 2026-09-16). Option à retenir ou non ; deux tailles chiffrées, la
> décision revient à Gabriel/Victrix.

## 1. L'effet visé

Référence : https://cloudcannon.com/ — dans la bannière, cinq icônes (bouclier,
fusée, pinceau, loupe, cadenas) flottent autour du visuel principal ; au
défilement, elles glissent vers le bas et viennent **se loger dans les cartes
de la section suivante**, dont elles sont l'icône. Chaque icône annonce donc
un sujet ou un appel à l'action plus bas dans la page. But : donner un aspect
« haute technologie » au site sans toucher aux textes ni aux maquettes.

## 2. Où ça s'applique

| Page | Héros | Section d'atterrissage | Ce que représentent les icônes |
| --- | --- | --- | --- |
| Accueil (`home` → `accueil.json`) | `home-hero` — photo, dégradé blanc à gauche, texte à gauche, **espace libre à droite** | `home-expertises` (cartes d'expertises) | une icône par carte d'expertise |
| Découvrir Victrix (`pages/*/decouvrir.json`) | `service-hero` — photo sombre + voile bleu nuit | `strategic-value` (Notre culture) puis `bento-metrics` | culture, chiffres clés, valeurs, histoire, recrutement |

Sur le héros sombre de Découvrir, des icônes « verre » (blanc 10 % + bordure
blanche 20 % + flou, style déjà utilisé par le 2e bouton de `service-hero`)
donnent l'effet high-tech sans nouveau vocabulaire visuel.

## 3. Contraintes du dépôt (vérifiées le 2026-09-17)

- **Composants Bookshop browser-safe** : les héros et sections sont rendus en
  direct dans l'éditeur visuel CloudCannon → aucun import Astro, pas de
  `astro:assets`. Seuls `form` et `solutions-catalogue` portent un script
  client aujourd'hui : l'animation en ajoutera un troisième (petit, hissé).
- **Règle « 100 % Tailwind, zéro CSS scopé »** : les images clés (keyframes)
  vont dans `src/styles/theme.css` comme `--animate-marquee` (tech-marquee) ;
  les positions/délais par icône passent par des utilitaires ou des variables
  CSS inline.
- **ClientRouter** (BaseLayout) : le script doit se lier sur
  `astro:page-load` (patron `inbox-client.ts`), sinon l'effet meurt après la
  première navigation.
- **`prefers-reduced-motion`** : le bloc global de `global.css` coupe toute
  animation → l'état sans animation doit être **valable** : icônes posées
  dans le héros, rien de cassé. Même règle sans JavaScript.
- **LCP** : la photo du héros reste l'élément LCP. Icônes = SVG inline,
  animation `transform`/`opacity` seulement, aucun `will-change` permanent.
- **Bilingue** : pages `/fr` et `/en` — les icônes sont sans texte, donc rien
  à traduire ; les `aria-hidden` restent vrais (décoratif).
- **Icônes** : le dépôt n'a pas de banque d'icônes générale (seulement 4 clés
  fermées dans `stats`). Julie a demandé une banque d'icônes (Lot 7,
  #1762) → **prendre la même banque** (Lucide) pour les deux chantiers.

## 4. Deux tailles

### v1 — « flottantes + parallaxe » (~1 j)

- 4 à 6 icônes positionnées en absolu dans le héros (droite sur l'accueil,
  réparties sur Découvrir), léger flottement (keyframe 6-8 s, décalages).
- Au défilement : parallaxe (translation Y moins rapide que la page) +
  fondu vers la section suivante. Implémentation **CSS pure** avec
  `animation-timeline: view()` (scroll-driven animations, pris en charge par
  Chrome/Edge/Safari 26/Firefox récents) ; navigateurs plus anciens = icônes
  posées, sans dégradation.
- Zéro script, zéro champ CMS : les icônes sont **dérivées** des sections
  présentes (`type` de section → icône). Éditeur : rien à faire.
- Livrable : `home-hero` et `service-hero` acceptent une liste d'icônes
  calculée par `shared/astro/page.astro` (qui voit toute la liste des
  sections) ; nouveau `src/lib/hero-icons.ts` (pur, testé) qui mappe types de
  sections → clés d'icônes ; keyframes dans `theme.css`.

### v2 — « accostage » dans les cartes (v1 + 2-3 j accueil, +1 j Découvrir)

- Chaque icône a une **cible** : l'emplacement d'icône d'une carte de la
  section d'atterrissage (`home-expertises` items, `strategic-value` badge,
  `bento-metrics` tuiles). Les cartes rendent ce même emplacement, vide tant
  que l'icône n'est pas arrivée (puis l'icône y est « posée » pour de bon,
  y compris sans JS).
- Technique FLIP : au chargement, mesure de la position de départ (héros) et
  d'arrivée (carte) ; au défilement, interpolation `transform` entre les deux
  (script hissé, `requestAnimationFrame`, `ResizeObserver` pour recalculer).
  Fallback : sans JS ou en motion réduite, l'icône est directement dans la
  carte et le héros n'affiche que le flottement statique.
- Champ CMS **optionnel** `heroIcon` par item de section (banque Lucide, même
  select à vignettes que Lot 7) pour remplacer l'icône dérivée ; vide =
  dérivée.
- Risque : l'atterrissage dépend de la mise en page de la section suivante ;
  un réordonnancement des sections au CMS change les cibles → le calcul doit
  être fait à partir du DOM réel, jamais de positions codées.

## 5. Tests d'acceptation (les deux tailles)

1. Lighthouse local (recette `tests-seo-et-loi25-avant-deploiement.md` §2) :
   performance et LCP inchangés à ±2 points sur `/fr/` et `/fr/decouvrir/`.
2. `prefers-reduced-motion: reduce` (DevTools → Rendering) : aucune
   animation, icônes visibles et alignées.
3. JavaScript désactivé (v2) : icônes dans les cartes, héros propre.
4. Navigation ClientRouter : accueil → Découvrir → accueil, l'effet rejoue.
5. Éditeur visuel CloudCannon : les héros et cartes se rendent (Bookshop live)
   sans erreur console ; `npm run check:bookshop` 41+/41+.
6. Mobile 400 px : icônes réduites ou masquées sous `md` (à décider : masquer
   sous 768 px est le choix le plus sûr pour le LCP mobile).
7. Gate habituel (operations.md §3) + e2e 14/14 (+1 test : icônes présentes
   sur `/fr/` en maquette).

## 6. Décisions à prendre avant de lancer

- v1 seule, ou v1 puis v2 ?
- Banque d'icônes commune avec le Lot 7 de Julie (recommandé) — donc lancer
  Lot 7 avant ou avec.
- Icônes dérivées automatiquement (défaut) ou choisies au CMS (v2 seulement).
- Mobile : masquer sous `md` (recommandé) ou version réduite.
- Calendrier : après go-live (amélioration) ou pendant l'attente des
  décisions Victrix (H1, noindex, Turnstile/GA4) — l'effet n'a aucune
  dépendance externe, c'est un bon « lot tampon ».
