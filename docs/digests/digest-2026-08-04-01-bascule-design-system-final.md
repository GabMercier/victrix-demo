# Digest : réception des maquettes finales, références tranchées, bascule du site sur le design system, lot accueil

- **Date :** 2026-08-04 (une session continue : nuit, matin, après-midi)
- **Type :** Session dev (build ; secondaire : décisions d'architecture design et debugging)
- **Projet :** Refonte victrix.ca : Astro + CloudCannon, branche `spike/cloudcannon`. Phase : Phase 5 (design system) OUVERTE, socle appliqué.
- **En une ligne :** Les maquettes finales sont reçues et analysées, la hiérarchie de référence est tranchée (structure = exports HTML, système visuel = planche DesignSystemVictrix.png), le pipeline Figma→Tailwind est revalidé sur un port complet, puis le site entier bascule sur le design system final (tokens re-mappés, Hanken partout, design-lab purgé, `/fr/style-guide` = page Design System) et la page d'accueil est reconstruite sur les patrons de la maquette Accueil.
- **Classer dans :** Project « Victrix refonte » + `docs/digests/` du repo.
- **Sujets couverts :** fix JSON-LD P-12 (slot head) ; rapatriement des images de maquettes ; re-audit tokens sur la livraison plate ; arbitrages design v1 puis v2 ; theme-refonte puis fusion dans theme.css ; renommage des collisions legacy ; purge design-lab ; page Design System Victrix ; lot accueil (5 composants re-skinnés + schémas + contenus FR/EN) ; recette vvbuild corrigée.
- **Portée de la session :** design system et accueil. NON touché : home-latest et home-partners (restyle fin), chrome Header/Footer (structure maquette), pages services (re-skin fin), pages Carrières/Solutions (à créer), contenus blog/services, portail, Phase 2 FR-racine.

## Objectif de la session

Au départ : débloquer `design:previews` (échec de comptage) et committer le lot « pendant l'absence ». En cours de route, trois pivots demandés par le user : (1) analyser la livraison finale des maquettes et préparer la refonte ; (2) trancher la référence design ; (3) appliquer le design system au site réel (« notre version EST la nouvelle version, le WordPress reste la prod publique ») et refaire l'accueil sur la maquette en conservant son vibe.

## Décisions prises

| Décision | Raison | Exclut | Statut |
|---|---|---|---|
| JSON-LD de page via `<JsonLd slot="head">` (nouveau `<slot name="head" />` dans BaseLayout), jamais dans le slot par défaut | Le slot par défaut atterrit dans `#main-content` : le script devenait un enfant compté par le garde du script d'aperçus (8≠7) et décalait l'indexation ; le head est aussi le bon endroit SEO | Tout JsonLd de page en slot par défaut (routes services et ressources corrigées) | Ferme (règle commentée dans BaseLayout) |
| ~~v1 : « les exports HTML seuls font foi »~~ | Postérieurs aux artefacts de décision | (annulée le jour même) | ANNULÉE par v2 |
| **v2 : STRUCTURE des pages = exports HTML ; SYSTÈME visuel = planche `DesignSystemVictrix.png`** ; on garde ce qui correspond, on transforme le reste | Les exports sont incohérents entre eux (Accueil ≠ les 4 autres sur ~10 axes) ; la planche est la source la plus cohérente ; les rôles Material des exports restent le vocabulaire du markup | La palette frontmatter comme valeurs finales ; les graisses 700/800 et le button 14/600 des exports | Ferme (choix user) |
| `rounded-full` reste ROND (pas de `--radius-full`) | `full: 0.75rem` des 5 configs d'export écraserait 10 éléments réellement circulaires (pastilles, photos d'équipe) ; les chips « pilule » de la planche confirment le rond ; échelle non-monotone = artefact du générateur | L'application verbatim du `full` des exports | Ferme (choix user, signalé à l'équipe design) |
| **Le site Astro EST la nouvelle version** : bascule globale immédiate du design system, la parité visuelle avec l'ancien design est abandonnée | Le vrai victrix.ca (WordPress) reste la prod publique ; notre « live » est la refonte elle-même | Le maintien du look WP-parité ; les doubles builds de parité visuelle comme gate | Ferme (choix user) |
| Re-peau globale par RE-MAPPAGE des valeurs de `tokens.css` (composants legacy inchangés), puis re-skin fin composant par composant | Tout le site consomme `var(--token)` : une passe de valeurs re-skinne 100 % des pages d'un coup ; le re-skin Tailwind par lots suit la règle no-hybride existante | Une réécriture big-bang de tous les composants ; l'activation du preflight (reportée à la fin du re-skin) | Ferme |
| Collisions `tokens.css` vs `@theme` levées par RENOMMAGE : `--color-surface`→`--color-band`, `--radius-sm/md/lg`→`--radius-s/m/l`, `--shadow-sm/md/lg`→`--shadow-1/2/3` | Le `:root` non-couché bat `@layer theme` en silence (audit §4) ; les ombres collisionnent avec les défauts v4, pas seulement avec nos tokens | Le préfixage de tous les tokens sémantiques | Ferme (règle en entête de tokens.css) |
| Design-lab PURGÉ ; **`/fr/style-guide` devient la page « Design System Victrix »** (référence web unique) | Demande user ; le style-guide P-15 rendait déjà les tokens en direct ; une seule page à maintenir | Les 4 pages design-lab, theme-semantique.css, theme-refonte.css (fusionné) | Ferme (choix user) |
| Accueil : **la maquette Accueil.html = le bon design** ; conserver son vibe, corriger ses incohérences en la normalisant sur le système (Manrope→Hanken, CTA secondary→primary, échelle parallèle→tokens) | Précision user après la bascule ; le token-remap seul laissait l'ancienne structure | L'adaptation de l'accueil au « système des 4 pages » sans reprendre sa structure | Ferme (choix user) |
| Champs hérités `number` et `accent` des cartes expertises : conservés au contrat, retirés du rendu | Compatibilité du contenu existant (CloudCannon) sans multicolore hors système | La suppression des champs (migration de contenu) | Ferme |
| Navy des surfaces sombres = `on-primary-fixed` ré-ancré `#0D1430` (Bleu nuit planche) | C'est le rôle que le code des maquettes emploie pour les overlays ; la planche fournit l'hex | Un token `surface-navy` séparé (proposé mais non retenu pour l'instant) | Ferme ; hex à confirmer côté design |

## Construit / modifié

- **Fix P-12 + garde previews** (fait) : `src/layouts/BaseLayout.astro` (slot head), `src/pages/[lang]/services/[...slug].astro`, `src/pages/[lang]/ressources/[slug].astro`, `scripts/design/generate-section-previews.mjs` (comptage `:not(script):not(style):not(link)` + `.nth()`). 23/23 aperçus régénérés.
- **Outillage maquettes** (fait) : `scripts/design/fetch-maquette-images.mjs` (rapatriement 20/25, manifest, copies offline ; 5 URLs déjà mortes) ; `scripts/design/generate-icon-subset.mjs` (sous-ensemble Material Symbols 33 icônes, axe FILL variable 0..1, 7,5 Ko → `public/fonts/MaterialSymbolsOutlined-Refonte.woff2`) ; `scripts/design/audit-export-tokens.mjs` adapté à la livraison plate (`--html`/`--design`, conflits charte-vs-code génériques) et rejoué.
- **Docs design** (fait) : `docs/design/analyse-reception-maquettes-finales.md` ; `docs/design/arbitrages-design-a-trancher.md` (v2 : référence retenue + points à signaler) ; `docs/design/audit-tokens-figma.md` régénéré + §5 réécrit (revalidation consignée).
- **Thème final** (fait) : `src/styles/theme.css` = fusion (47 rôles Material ré-ancrés planche, typo sémantique avec graisses planche, spacing, rayons planche, alias français re-valués, `@custom-variant dark` inerte) ; `src/styles/tokens.css` re-mappé (anciennes valeurs en commentaires) ; `src/styles/global.css` (Montserrat retirée ; règle liens `a:not([class])`) ; préloads BaseLayout → Hanken variable ; theme-color `#0d1430`.
- **Purges** (fait) : `src/pages/[lang]/design-lab/` (4 pages), `design-lab.css`, `design-lab-refonte.css`, `theme-semantique.css`, `theme-refonte.css`, `public/images/design-lab/`, Montserrat ×5, ancien subset icônes ; dérogation eslint design-lab ; filtre sitemap design-lab.
- **Page Design System** (fait) : `src/pages/[lang]/style-guide.astro` : sections 6 ancres (rendu live des vars du thème), typo sémantique, primitives (boutons, chip pilule, champ), iconographie (subset chargé par cette page seulement), tokens legacy relabellisés, vitrine 23 sections conservée.
- **Lot accueil** (fait) : `component-library/src/components/home-hero`, `home-iso`, `home-expertises`, `home-solution`, `home-experts` : `.astro` réécrits 100 % Tailwind (browser-safe) + `.bookshop.yml` enrichis ; `src/content.config.ts` (champs optionnels `.default('')`) ; `cloudcannon.config.yml` (`_structures.expertise_items` +image, labels « hérité ») ; `src/content/home/{fr,en}/accueil.json` enrichis ; visuels provisoires copiés sous `public/images/home/` (hero + 6 tuiles, images de maquette).
- **Port de validation** (fait puis purgé avec le design-lab) : `/fr/design-lab/page-expertise`, port verbatim 8 sections qui a revalidé le pipeline sur la livraison finale ; le verdict reste consigné dans l'audit §5.
- Restyle léger `home-latest` / `home-partners` : designed (différé, voir dette).

## Architecture après la session

Une seule chaîne de style : `BaseLayout` charge `global.css` (reset léger + `tokens.css` legacy re-mappé, règles de base sur les éléments non classés) puis `theme.css` (@theme Tailwind v4 : rôles Material + alias français + utilitaires, sans preflight). Les composants non re-skinnés consomment `var(--token)` (valeurs déjà planche) ; les composants re-skinnés (testimonial, les 5 home-*) n'utilisent que des utilitaires. L'éditeur visuel CloudCannon recompile les composants pour le navigateur : ils restent sans import, les images de contenu sont des chemins publics, `home-solution` garde son seam `resolvedImage` (enrich de `index.astro`). La page `/fr/style-guide` est la référence vivante du système.

## Environnement / stack

- `tailwindcss@4.3.3`, `astro@^5.18.2` (épinglé v5, Node 18 compat), Node session 20.20.2, `@playwright/test@^1.61.0`.
- Sous-ensemble icônes : API css2 `family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@24,400,0..1,0&icon_names=...` avec UA Chrome ; l'URL du woff2 est servie via `fonts.gstatic.com/l/font?kit=...` SANS extension.
- Build isolé : robocopy plein `/E` (exclusions ABSOLUES `.git`, `dist`, `dist-static`, `.astro`, `node_modules\.vite`) PUIS `/MIR` sur `src`, `public`, `component-library`, `schemas`, `scripts` (le `/E` seul ne purge pas les fichiers supprimés), puis `npm run build` dans `C:\Users\gmercierblouin\vvbuild`.
- Commandes utilisées : `npm run design:previews` (dev server requis), `node scripts/design/fetch-maquette-images.mjs`, `node scripts/design/generate-icon-subset.mjs`, gate `npm run lint ; npm test ; npm run test:e2e` (e2e réutilise le dev server local, pas de build).

## Problèmes rencontrés et résolus

- **Comptage previews 8≠7** : symptôme = échec nommé du garde ; cause = JsonLd P-12 en slot par défaut (enfant de `#main-content`) ; fix = slot head + garde filtré. Le garde a fonctionné comme prévu.
- **Page servie SANS CSS** (`page-expertise`) : une expression JSX (même un commentaire `{/* */}`) entre `<!doctype html>` et `<html>` fait perdre à Astro le chemin « document complet » : l'injection des `<style>` disparaît en silence. Les captures précédentes passaient grâce au cache HMR. Fix : commentaire déplacé dans le frontmatter. Diagnostic utile : `curl | grep -c '<style'` par page.
- **Boutons pleins bleu-sur-bleu** après re-skin : `global.css` NON-COUCHÉE (`a { color: var(--color-link) }`) bat `text-on-primary` (@layer utilities). Fix : `a:not([class])` (un lien porteur de classes gère sa couleur). Corollaire sans preflight : `no-underline` obligatoire sur tout lien-bouton re-skinné.
- **Échec du build vvbuild** : route fantôme `services/[slug].astro` (supprimée du repo, jamais purgée de la copie) ; robocopy `/E` ne retire pas les fichiers supprimés. Fix : `/MIR` ciblé sur les dossiers sources.
- **`generate-icon-subset` : woff2 introuvable** : le regex exigeait `.woff2` dans l'URL ; l'endpoint icônes sert `fonts.gstatic.com/l/font?kit=...`. Fix : regex assoupli.
- **Mapping images EN raté à moitié** : la casse des titres EN (« Cloud Computing ») différait du FR ; deuxième passe idempotente.
- **Impasse évitée** : une phrase du CTA de PageExpertise avait été paraphrasée de mémoire au lieu d'être relue ; corrigée après relecture. Règle : un port verbatim se relit à la source, section par section.
- **5 images de maquette mortes côté Google** (400/403 définitifs) : logo, badge Loi 25, visuel Services gérés, héros PageExpertise, capture O Studio ; stand-ins locaux marqués, ré-export du `.fig` demandé (Annexe A des signalements).

## Vérification / état des tests

- Gate re-passé vert après CHAQUE étage (fix P-12, thème v2, bascule, lot accueil) : lint 0 erreur (8 warnings préexistants), 122/122 tests unitaires, e2e 7/7.
- Build de production ISOLÉ vert ×2 (avant et après le lot accueil) : 128 pages indexées Pagefind, toutes intégrations passées.
- Vérifié en captures Playwright : accueil FR (vibe maquette, boutons lisibles), article, style-guide, pages lab avant purge. JSON-LD confirmé dans `<head>` (services + article) via curl.
- NON testé : build STATIC_ONLY (CloudCannon) après la bascule ; éditeur visuel CloudCannon (5 sections re-skinnées + nouveaux champs) ; accueil EN (200 seulement, pas de capture) ; rendu mobile réel (extrapolé, pas d'artboard). Les vignettes « vides » de `home-latest` en capture pleine page = `loading="lazy"` sans défilement, pas une régression.

## Questions ouvertes

- Les ~40 valeurs DÉRIVÉES de la palette (interpolations entre les 6 ancres, marquées « dérivé » dans theme.css et sur /fr/style-guide) : à valider par l'équipe design.
- Contraste a11y : blanc sur `#1A5BFF` ≈ 4:1 (limite AA texte normal) : valider l'usage sur petits libellés.
- Iconographie site-wide : Material Symbols (subset auto-hébergé) vs SVG inline (convention actuelle) : à trancher pendant le re-skin.
- `Accueil.html` : ré-export aligné souhaité ; en attendant, structure maquette + système normalisé (fait pour l'accueil).
- Périmètre maquettes manquantes : article/listing blog, campagnes, recherche, merci, 404, portail ; « Secteurs » et « À propos » dans la nav ; liste de postes Carrières (ATS ?).

## Risques / dépendances

- Équipe design : réponses aux signalements (`arbitrages-design-a-trancher.md` v2), ré-export Accueil, 5 images mortes, vrais visuels des tuiles accueil (les actuels sont des images de maquette génériques).
- Vérifs humaines CloudCannon accumulées (éditeur visuel accueil, modale sections avec images, en-tête campagne, bandeau Loi 25) : à faire après push.
- OPS inchangés : secret `REBUILD_HOOK_URL`, décommission du worker OAuth Sveltia.

## Dette / différé

- `home-latest` et `home-partners` : restyle fin différé (CSS scopé avec replis d'anciennes valeurs ; le rendu du site est correct via tokens, les replis ne jouent que dans l'éditeur).
- Chrome Header/Footer : structure maquette différée (le nôtre garde méga-menus et e2e ; couleurs déjà système).
- Re-skin fin des pages services + nouvelles sections (tuiles, marquee, bureaux, valeurs) + pages Carrières/Solutions : lots suivants (patrons validés, consignés plan-convergence §Phase 5).
- `preview.png` ×23 : à régénérer EN FIN de re-skin (`npm run design:previews`).
- `yaml` en devDependency (le script previews dépend d'une transitive Bookshop) : lot outillage futur.
- Décision preflight Tailwind : en fin de re-skin.
- Replis `var(--token, ancienne-valeur)` dans les composants non re-skinnés : périmés dans l'éditeur visuel seulement ; se résorbent avec le re-skin par lots.

## Prochaines étapes

1. User : `git add -A`, commit (message proposé dans la session), push ; puis vérifs CloudCannon (surtout l'éditeur visuel sur l'accueil) et préversion.
2. Envoyer les signalements design (v2 §2 + Annexe A) à l'équipe.
3. Lot suivant du re-skin : `home-latest` + `home-partners`, puis chrome, puis services (Claude Code).
4. Re-tester le build STATIC_ONLY avant la prochaine échéance CloudCannon.
5. Quand les vrais visuels arrivent : remplacer `public/images/home/*` (champs déjà éditables CMS).

## Constats durables

- Astro : AUCUNE expression JSX entre `<!doctype html>` et `<html>` d'une page document-complet, sinon l'injection des styles disparaît sans erreur. Vérifier sur compile propre, pas sur le rendu HMR.
- Tailwind v4 : un `:root` non-couché bat `@layer` (theme ET utilities) ; les collisions de noms se règlent par renommage du legacy, et les règles d'éléments d'une feuille globale non-couchée (ex. `a { color }`) doivent viser `:not([class])` pour cohabiter avec des utilitaires.
- Tailwind v4 (source vérifiée dans dist) : `rounded` nu lit `--radius` (défaut « deprecated » 0.25rem) ; `--radius-full` EST résolu avant le repli statique `calc(infinity*1px)` : le définir retargette `rounded-full`.
- API css2 icônes : `icon_names=` triés + UA Chrome obligatoires ; axes variables possibles (`FILL@0..1`) ; le woff2 sort sur `fonts.gstatic.com/l/font` sans extension.
- robocopy `/E` ne supprime jamais rien : toute copie de build incrémentale doit purger (`/MIR` ciblé) sous peine de builds fantômes.
- Le `cd` d'un appel Bash du harnais PERSISTE entre appels : préfixer les scripts de `cd` absolu.
- Play CDN v3 `theme.extend` merge avec les défauts v3 : l'échelle effective d'un export Figma n'est pas son objet `borderRadius` seul.

## Statut des documents vivants

Régénération nécessaire : OUI, partiellement faite en session.

- `docs/GUIDE-PROJET.md` : à jour (journal 4 août complété, bascule incluse).
- `docs/plan-convergence-migration.md` : à jour (§Phase 5 : socle appliqué + lots restants).
- `docs/plan-prompts.md` : À METTRE À JOUR : P-15 (le style-guide est devenu la page Design System), journal de session 4 août, et le fait que la parité visuelle n'est plus un gate.
- `docs/operations.md` : À METTRE À JOUR : recette de copie isolée corrigée (§3.1 : ajouter l'étape `/MIR` ciblé, sinon builds fantômes).
- `docs/design/*` : à jour (analyse, arbitrages v2, audit §5).
