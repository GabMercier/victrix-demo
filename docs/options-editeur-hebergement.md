# Options éditeur visuel & hébergement — qui dépend de qui

> Répond à une question précise : « l'éditeur visuel avec éléments réutilisables
> fonctionne-t-il seulement avec un abonnement CloudCannon — et si on part en
> headless, ou si on héberge sur Azure ? ». Catalogue de décisions pour plus
> tard, pas un changement à faire maintenant. Contexte : `plan-pivot-editeur.md`
> (le pivot), `spike-cloudcannon.md` (réglages actuels, gate en cours).

## Réponse en une ligne

**L'éditeur visuel est un service par abonnement (CloudCannon, ou une
alternative) ; tout le reste — composants, contenu, gabarits, configuration —
appartient à Victrix, versionné dans son dépôt Git, et fonctionne avec
n'importe quel hébergeur.** Changer d'éditeur ou d'hébergeur, ce sont deux
décisions indépendantes, et ni l'une ni l'autre n'exige de réécrire le site.

## 1. Ce qui est à nous vs ce qui est à l'abonnement

| Chez Victrix (dépôt Git, aucune dépendance) | Chez le fournisseur (abonnement) |
|---|---|
| Composants Bookshop (`component-library/src/`) — licence **MIT**, code que nous possédons et modifions librement | L'application d'édition visuelle elle-même (l'éditeur « clic sur le composant ») |
| Collections et schémas de contenu (`src/content.config.ts`, `schemas/*.md`) | L'interface de palette (« + Ajouter une section ») et son rendu en direct |
| Le contenu (`src/content/`, `src/data/redirects.json`) — texte, images, structure | La bibliothèque de médias (DAM) et la gestion des téléversements dans l'UI |
| `cloudcannon.config.yml` — labels, structures, chemins d'upload | Le **build d'édition** (CloudCannon compile le site pour alimenter l'aperçu live) |
| Le site lui-même (Astro, gabarits, styles, pipeline de build) | Le partage de préversions (Site/Client Sharing, domaine de test) |

Conséquence directe : si CloudCannon disparaissait demain, le site continue de
se construire et de se déployer exactement pareil (`npm run build`) — seule
l'expérience d'édition change. C'est l'argument de réversibilité derrière
chacun des scénarios ci-dessous.

## 2. Les scénarios, en bref

| Scénario | Éditeur visuel | Hébergement production | Coût mensuel approx. | Effort de bascule |
|---|---|---|---|---|
| **A — Aujourd'hui** | CloudCannon Hosted | Cloudflare Pages | ~45–250 $US (CloudCannon, palier à confirmer) + Cloudflare Pages palier gratuit | — |
| **B — CloudCannon Headless** | ❌ perdu (voir §3.2) | Cloudflare Pages (ou ailleurs) | Similaire à A, pas d'économie garantie | Faible techniquement, **élevé fonctionnellement** (perte de l'éditeur) |
| **C — Hébergement Azure** | CloudCannon Hosted (inchangé) | Azure Static Web Apps (+ Front Door en option) | CloudCannon inchangé + Azure ~0–9 $US (palier Free ou Standard) | Moyen — 3 fichiers/mécanismes à porter (§3.3) |
| **D — Quitter CloudCannon** | Tina ou Sveltia | Inchangé (Cloudflare ou Azure) | Tina : 0 $ (2 usagers) à 49 $US ; Sveltia : 0 $ | Moyen à élevé selon l'outil (§3.4) |

Prix vérifiés le 14 juillet 2026 (CloudCannon, Tina, Azure Static Web Apps) —
**à reconfirmer à l'inscription** : les paliers évoluent, et le palier
CloudCannon exact qui inclut l'éditeur visuel/Bookshop n'est pas encore
confirmé (voir `spike-cloudcannon.md`).

## 3. Détail par scénario

### 3.1 — A. Aujourd'hui (référence)

CloudCannon en **Hosted Mode** : à chaque sauvegarde dans l'éditeur (ou chaque
push), CloudCannon construit le site (`npm run build`, `STATIC_ONLY=1`) pour
alimenter son propre aperçu et son éditeur visuel. La production est un
service **complètement séparé** : Cloudflare Pages surveille la même branche
Git et construit indépendamment pour publier le site réel. CloudCannon ne sert
jamais le trafic public — c'est le mécanisme qui rend les scénarios B et C
possibles sans toucher à l'édition.

### 3.2 — B. CloudCannon Headless

Documenté par CloudCannon lui-même : *« The Visual Editor is not available in
Headless Mode »* — en Headless, CloudCannon désactive ses propres builds
(le site se construit et s'héberge ailleurs), et sans build, il n'y a plus
d'aperçu en direct ni de clic-sur-composant. Il reste un éditeur de contenu
structuré (formulaires, collections) mais on perd exactement ce que le spike
visait à prouver (critère 1 : édition visuelle). **Non recommandé** tant que
l'argument de vente au marketing repose sur « comme Elementor, mais en plus
sûr » — Headless retire la partie « comme Elementor ».

Cas où B redevient pertinent : si le site passait un jour en rendu serveur
(SSR) chez un tiers et que CloudCannon ne peut plus le construire lui-même.
Pas la situation ici (le site reste statique).

### 3.3 — C. Hébergement Azure, CloudCannon inchangé

C'est un retour à l'hébergement prévu dans la proposition d'origine
(`Proposition-Refonte-victrix.docx`, Annexe B — *« Azure Static Web Apps par
défaut, code versionné dans Azure DevOps ou GitHub. Tout reste dans
l'écosystème Microsoft »*) : le projet a démarré sur Cloudflare Pages pour le
spike, mais rien n'empêche de revenir à Azure — CloudCannon ne sait même pas
quel hébergeur sert la production.

Trois pièces spécifiques à Cloudflare à porter :

| Pièce actuelle (Cloudflare) | Équivalent Azure |
|---|---|
| `public/_headers` (en-têtes de sécurité) + `dist/_redirects` (généré par `src/data/redirects.json`) | `staticwebapp.config.json` (en-têtes + routes + redirections, un seul fichier à la racine) |
| `/api/forms` — une Pages Function Cloudflare (`locals.runtime.env` pour les secrets, voir `formulaires.md`) | Azure Functions (liée ou managée par Static Web Apps) — même logique de validation (`src/lib/forms/`), nouvelle couche d'accès aux variables d'environnement |
| Déploiement au push (intégration Git Cloudflare Pages) | Pipeline Azure DevOps ou GitHub Actions + action de déploiement Static Web Apps |

Par extension (non chiffré ici, même mécanique) : les routes du portail
client (`src/pages/[lang]/portail/*`, `src/pages/auth/*`) tournent aussi
aujourd'hui comme fonctions Cloudflare Pages et suivraient le même chemin que
`/api/forms` vers Azure Functions. **Aucune de ces routes n'a été touchée**
dans ce document — c'est une note de portée, pas un changement.

Ce que ça NE change PAS : `cloudcannon.config.yml`, les composants Bookshop,
le contenu, le mode `STATIC_ONLY`, l'éditeur — CloudCannon continue de
construire depuis le même dépôt Git de la même façon.

### 3.4 — D. Quitter CloudCannon

Le contenu et les composants restent des fichiers dans le dépôt : quitter
CloudCannon ne migre aucune donnée, seulement l'outil qui les édite.

- **Tina** (`@tinacms/astro`) — édition visuelle « clic sur le texte », la
  plus proche de l'expérience CloudCannon/Elementor. Gratuit jusqu'à 2
  usagers ; 29 $US/mois (Team, usagers illimités) ; 49 $US/mois (Team Plus,
  ajoute un flux éditorial — brouillons, file de révision, mise en scène par
  branche). **Nuance** : le mécanisme de liaison live de Tina est spécifique
  à Tina, différent de la frontière `bookshop:live` de nos sections — les
  composants Astro/Bookshop restent réutilisables comme code, mais le
  branchement « édition en direct » serait à refaire, pas à copier tel quel.
  C'était déjà l'option de relève prévue par `plan-pivot-editeur.md` advenant
  un échec de gate.
- **Sveltia** (`public/admin/`) — déjà en place aujourd'hui pour le blogue et
  l'accueil, gratuit, open source, contenu dans le même dépôt Git. Éditeur
  structuré (formulaires, pas de clic-sur-composant) — recul sur l'édition
  visuelle des landing pages, mais zéro coût et zéro nouvelle dépendance.

Dans les deux cas, l'hébergement production (Cloudflare ou Azure, scénario A
ou C) ne change pas — c'est une bascule strictement côté édition.

## 4. Ce qui ne dépend PAS de ce choix

Indépendamment du scénario retenu : le bilinguisme FR/EN, le pipeline de
formulaires (`formulaires.md`), le schema.org, les redirections gérées au
CMS, et les gabarits eux-mêmes ne changent pas de mécanique — ils sont tous
implémentés dans le dépôt (Astro + Zod + Bookshop), pas dans CloudCannon.
