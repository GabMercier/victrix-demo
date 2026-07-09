# Rencontre marketing — 9 juillet 2026 (PM)

> Préparation : points clés, déroulé de démo (~15 min) et questions pour ouvrir la
> discussion. S'appuie sur `Proposition-Refonte-victrix.docx` (le document de
> référence remis) et sur l'état réel du prototype.

## Objectif de la rencontre

Pas de vendre un design — il viendra plus tard. L'objectif est de **démontrer la
nouvelle fondation** (Astro + Sveltia + hébergement statique) et de **récolter la
façon de travailler du marketing** pour orienter la suite : quels contenus ils
modifient, à quelle fréquence, avec quels irritants aujourd'hui.

## Points clés (5 minutes, avant la démo)

1. **Ce qui existe déjà, concrètement.** Quelques pages du site actuel reproduites
   fidèlement sur la nouvelle pile, bilingue FR/EN, avec un éditeur de contenu en
   place et un déploiement automatisé (chaque publication est en ligne en minutes).
   Ce n'est pas une maquette : c'est le vrai socle technique proposé.
2. **Le message central de la proposition.** Le choix de fondation compte plus que
   l'apparence : autonomie (publier sans billet d'agence), vitesse (chargement quasi
   instantané → SEO et conversion), fiabilité (presque rien à pirater ou à casser),
   budget (pas de licences ni de rétainer).
3. **Contenu vs mise en page.** L'éditeur protège la structure : le marketing modifie
   textes, images, articles; les gabarits garantissent la forme. Personne ne casse la
   page par accident — et les changements de structure passent par Ø Studio, en
   réactif, pas par un prestataire.
4. **Le design viendra se poser dessus.** Tout le visuel est centralisé (design
   tokens) : la refonte graphique à venir est une « re-peau », pas une
   reconstruction. Rien de ce qu'on valide aujourd'hui ne sera jeté.
5. **Qualité déjà encadrée.** Tests automatisés, vérifications d'accessibilité et de
   performance à chaque changement — la qualité ne dépend pas de la vigilance de
   quelqu'un.

## Déroulé de démo (~15 min)

> ⚠️ **Avant la rencontre** : commit + déploiement requis pour que l'admin en ligne
> soit corrigé (les icônes de l'éditeur étaient bloquées par la politique de
> sécurité — corrigé dans `public/_headers`). Vérifier https://victrix-demo.pages.dev/admin/
> 10 minutes après le push. **Plan B** : démo locale (`npm run dev` → `/admin/` →
> « Work with Local Repository », navigateur Chromium).

1. **Le site public** (https://victrix-demo.pages.dev) — 3 min
   - Page d'accueil : fidèle au site actuel, mais remarquer la vitesse de navigation.
   - Bascule FR ⇄ EN : chaque page a son miroir dans l'autre langue.
   - Section Ressources : liste d'articles + un article ouvert (mobile aussi, si
     possible — ouvrir les outils de dev en vue mobile ou son téléphone).
2. **L'éditeur de contenu** (`/admin`) — 8 min, le cœur de la démo
   - Se connecter, montrer la vue d'ensemble : collections « Articles de blogue »
     et « Page d'accueil ».
   - **Modification simple** : changer le titre du hero de la page d'accueil,
     sauvegarder → montrer que le changement part en publication tout seul.
     (Prévoir de le remettre après, ou faire la démo sur un texte secondaire.)
   - **Article bilingue** : ouvrir un article, montrer l'édition FR/EN côte à côte,
     l'aperçu en direct, le glisser-déposer d'image de couverture.
   - **Créer un brouillon d'article** en direct avec un titre proposé par la salle —
     bon moment participatif.
3. **Ce que ça remplace** — 2 min
   - Rappel du quotidien actuel (constructeur, billets d'agence, délais) vs ce
     qu'ils viennent de voir : édition directe, structure protégée, en ligne en
     minutes.
4. **Aperçu de la suite** — 2 min
   - Mentionner (sans démo longue) : portail client prototypé, recherche interne,
     flux RSS, analytique sans témoins (Loi 25) — la fondation est pensée pour ça.

## Questions pour la discussion

Reprendre celles de la proposition, dans l'ordre du document :

**Le quotidien d'édition**
- Quelles mises à jour faites-vous le plus souvent aujourd'hui ?
- Lesquelles aimeriez-vous faire sans dépendre d'un prestataire ?
- Qu'est-ce qui vous ralentit le plus dans l'outil actuel ?
- Combien de personnes éditeront le contenu ? Qui approuve avant publication ?
- L'édition « visuelle » directement sur la page (style constructeur) est-elle
  importante, ou un éditeur de formulaire clair suffit-il ? (→ choix Sveltia/Tina)

**Le contenu, section par section** (voir le tableau de la proposition)
- Accueil : quels messages mettre en avant en premier ?
- Services/Produits/Expertises : un gabarit commun ou un par famille ?
- Blogue/Ressources : quels types de contenu (articles, livres blancs, webinaires) ?
  Certains réservés/téléchargeables contre courriel ?
- Partenaires : à quelle fréquence la liste change-t-elle ?
- Carrières : les offres viennent-elles d'un système RH externe ?
- Contact : combien de formulaires, et les soumissions vont où (courriel, CRM) ?

**Pour la suite**
- Où en est le cahier des charges v3.0 et l'audit AAA-ADN ? (plusieurs chiffres de
  la proposition sont « à confirmer »)
- Qui, côté marketing, serait pilote pour tester l'éditeur sur du vrai contenu ?
- Échéancier souhaité pour la refonte graphique (l'intrant design) ?

## Objections probables — réponses courtes

| Objection | Réponse |
|---|---|
| « On perd le glisser-déposer d'Elementor » | On sépare contenu et forme : le courant se fait sans code; si l'édition visuelle est prioritaire, l'option Tina la fournit (à discuter — c'est justement une des questions). |
| « Ça a l'air dépendant d'un développeur » | Pour les changements de *structure* seulement — à l'interne et réactif, vs un billet d'agence facturable. Le contenu courant est 100 % autonome. |
| « Et le SEO pendant la migration ? » | URLs préservées + redirections 301, sitemap bilingue, hreflang déjà en place dans le prototype. Aucun recul prévu — c'est mesurable. |
| « C'est encore un prototype » | Oui, et c'est le but : valider la fondation avant le design. Tests, CI, sécurité déjà en place — ce socle est celui de la production. |

## Note interne (pas pour la rencontre)

- Traduction automatique dans Sveltia : disponible mais exige une clé API
  (paramètres de l'éditeur) — ne pas la promettre en démo si non configurée.
- Le portail client est un **mock** (auth simulée) — le mentionner comme prototype,
  ne pas le présenter comme fonctionnel.
