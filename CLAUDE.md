# CLAUDE.md — règles de travail du dépôt Victrix

Site vitrine Victrix : Astro 5 (Node 20), FR/EN (`/fr`, `/en`), composants
Bookshop dans `component-library/`, contenu JSON/Markdown dans `src/content` et
`src/data`, édité par l'équipe marketing dans **CloudCannon**. Langue de
travail, des docs et des commentaires de code : **français**.

Point d'entrée de toute session : la mémoire `project-status` (état du jour),
puis **`docs/plan-livraison-finale.md`** (lots restants, un prompt par lot).

## Branches

`dev` (intégration ; Clément y relit dans CloudCannon) → PR → `staging`
(édition de Julie, chaque sauvegarde = un commit) → bouton Publish → `main`
(production). Ne jamais travailler directement sur `staging` ni `main`.

## Règles non négociables

1. **Gabriel commite et pousse lui-même.** Ne jamais lancer `git commit`,
   `git push`, `git merge` ni modifier Azure DevOps : laisser les changements
   non commités et FINIR chaque réponse par les commandes prêtes à coller
   (+ les étapes d'interface CloudCannon s'il y en a).
2. **Avant tout commit** : `git fetch` puis `git log --oneline HEAD..origin/dev`
   — absorber les sauvegardes CloudCannon (`git pull --no-rebase`).
3. **Serveur de dev (port 4321) en marche → aucun `build`/`type-check` dans le
   dépôt** (verrou Windows sur `.astro` et `node_modules/.vite`). Vérifier le
   port ; s'il écoute, builder dans une copie isolée (recette :
   `docs/operations.md` §3.1 — robocopy mono-thread, chemins `/XD` COMPLETS).
   Ne jamais tuer le serveur de dev sans le demander.
4. **Plans courts, périmètre décidé par Gabriel** : faire ce qui est demandé ;
   proposer le reste en option, jamais glissé dans le lot.
5. **Le contenu est édité par des non-développeurs** : un champ vidé au CMS
   arrive en `''` — jamais de `z.string().min(1)` sauf si l'absence casse
   vraiment la page ; préférer `.default('')` + repli au rendu. Toute liste
   fermée (fonds, icônes, sujets de contact) a UNE source dans
   `component-library/src/shared/` ou `src/lib/` + un `_select_data` aligné
   dans `cloudcannon.config.yml`, avec un garde-fou qui compare les deux.
   Fonds : DEUX listes — `fonds` (10 clairs, toutes les sections) et
   `fonds_etendus` (+ les sombres, seulement les 5 sections qui inversent
   leurs textes : rich-text, callout, stats, logo-banner, faq).
6. **Composants Bookshop** : 100 % utilitaires Tailwind, zéro CSS scopé, aucun
   `<script>` ni import non « browser-safe » ; couleurs = jetons de
   `src/styles/theme.css` (bordure de carte = `border-contour`, rayon 8) —
   tout texte doit tenir le contraste AA 4,5:1 (3:1 en ≥ 24px ou ≥ 18,66px
   gras), y compris sous une opacité de conteneur : `tests/e2e/accessibilite.spec.ts`
   (axe-core, 9 gabarits) le vérifie et c'est ce que Lighthouse note ;
   pas de preflight → toujours `border-solid` et `m-0` explicites. Un champ
   ajouté = composant + `*.bookshop.yml` + zod (`src/content.config.ts`) **+
   rétro-remplissage** : CloudCannon n'affiche un champ que si sa CLÉ existe
   dans le fichier — ajouter la clé à `KEYS` de
   `scripts/backfill-section-keys.mjs` puis `npm run fix:sections`, sinon le
   champ reste invisible dans toutes les sections déjà posées. Vignette du
   sélecteur = `<composant>.preview.png` (jamais `preview.png`).
7. **Liens** : sections de page = URL FINALE (`/fr/...`) ; navigation et fiches
   de solutions = SANS préfixe de langue (`localizePath` l'ajoute).

## Gate avant de déclarer un lot terminé

`npm run lint` · `npm test` · `npm run type-check` · `npm run build` ·
`npm run check:links -- --strict` · `npm run check:sections` · `npm run test:e2e` ·
`npm run check:bookshop` · `npm run cms:previews:check` ·
`npm run check:redirects` (+ `node scripts/build-redirects.mjs --dist` après le
build) · `npm run check:parite-texte -- --strict` (après le build ; BLOQUANT
depuis le lot L-restaure — une page signalée de plus se restaure, ou s'assume
dans `parite_texte_assumee` de `docs/migration/correspondance-urls.json`).
Rapporter les chiffres réels ; si une étape n'a pas pu tourner, le dire.

## Rituel de fin de lot

1. Gate ci-dessus, chiffres réels.
2. Docs touchées par le lot mises à jour — `docs/guide-edition.md` dès qu'un
   champ ou un comportement change pour l'éditrice ; `docs/operations.md` pour
   une commande ou une procédure.
3. Cocher le lot dans `docs/plan-livraison-finale.md` (§ Suivi) avec la date.
4. Mettre à jour la mémoire `project-status` (ce qui est fait, non commité,
   prochaine action) — courte, factuelle.
5. Réponse finale : ce qui a changé, ce qui reste à valider par un humain,
   écarts assumés par rapport au prompt, puis les commandes : `git fetch` /
   `git add` / `git commit -m "…"` / `git push`, et les commandes
   `az boards` (création, fermeture) des stories du lot — prêtes à coller,
   jamais exécutées.

## Pièges connus (coûteux)

- Heredoc bash : les `\` sont dé-échappés → écrire les scripts avec l'outil
  d'écriture de fichier, pas dans un heredoc. Console Windows = cp1252
  (accents illisibles à l'écran, octets du fichier corrects).
- PowerShell `>>` écrit en UTF-16 : utiliser `Add-Content -Encoding utf8`.
- `az boards … --output json` sort en cp1252 ; `gh` n'est pas installé (CI :
  `curl https://api.github.com/repos/GabMercier/victrix-demo/actions/runs?branch=…`).
- Worktree + jonction `node_modules` : retirer la jonction (`cmd /c rmdir`)
  AVANT `git worktree remove`, sinon le vrai `node_modules` est vidé.
- Réécriture en masse du contenu pendant que le serveur de dev tourne →
  redémarrer le serveur ensuite.

## Outils maison (rejouables)

`npm run fix:links` (liens internes, après un build) · `npm run fix:sections`
(clés de section manquantes pour l'éditeur) ·
`node scripts/merge-content-json.mjs` (conflits JSON d'une fusion
`staging`↔`dev`) · `node scripts/migrate-icons-bank.mjs [--check]` ·
`node scripts/migrate-fonds-chauds.mjs [--check]` (blanc → ivoire, givre →
beige ; à rejouer après une fusion `staging` → `dev`) ·
`npm run cms:previews` (pastilles + vignettes d'icônes) ·
`npm run design:previews` (vignettes des sections, serveur de dev requis) ·
`npm run build:redirects` (matrice WordPress → refonte, décisions dans
`docs/migration/correspondance-urls.json` ; `check:redirects` en CI,
`--dist` après un build pour refuser une 301 vers un 404) ·
`python scripts/migration/check-parite-live.py` (compare le site EN LIGNE au
dépôt → `docs/migration/parite-live.md`) ·
`python scripts/migration/extract-source-page.py <url>` (contenu d'une page
source, bloc par bloc, `--images` pour rapatrier) ·
`python scripts/migration/blocs-manquants-articles.py` (après un build : les
blocs de l'ancien site absents de chaque article →
`docs/migration/blocs-manquants-articles.md`) ·
`python scripts/migration/restaure-blocs-articles.py [--apply] [--only a,b]`
(les remet à leur place dans `src/content/blog` ; sans `--apply` = diffs) ·
`python scripts/migration/export-prix-check-point.py` (191 SKU FR/EN →
`src/data/prix/`).

## Économie de contexte

Un lot = une session neuve. Lire d'abord les fichiers CITÉS par le prompt ;
n'explorer plus large que si un fait manque. Pas de sous-agents ni de workflow
sans demande explicite.
