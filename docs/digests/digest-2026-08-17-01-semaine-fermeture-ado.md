# Digest : semaine « fermeture maximale » ADO (vague 4 CMS incluse)

- **Date :** 2026-08-12 au 2026-08-17 (deux journées de travail dans une même conversation : vague 4 CMS le 12, semaine de fermeture le 17).
- **Type :** Session dev (build ; secondaire : planification et revue du backlog ADO).
- **Projet :** Demo-victrix, prototype Astro + CloudCannon du site Victrix. Phase : fermer le backlog ADO Epic 2 au complet, activer formulaires et analytics, préparer l'ouverture aux gestionnaires de contenu.
- **En une ligne :** le backlog ADO a été audité contre ses vrais critères d'acceptation (extraits par l'API) et le dépôt livre tout ce qui manquait côté code : P-08, P-11, portage du formulaire Contact, fil d'Ariane partout, schémas, filtres de recherche, maillage éditorial.
- **Classer sous :** Projet Victrix (claude.ai) + `docs/digests/` dans le dépôt.
- **Sujets couverts :** éditabilité CMS (Contact, Carrières, pages système), checklist et audit ADO, CSP, formulaires bout en bout, GA4 sous consentement, breadcrumbs, schema.org, filtres Pagefind, maillage topics, e2e, incident GitHub.
- **Périmètre de la session :** code et docs du dépôt + lecture/audit ADO. Non touché : re-skin design v3 restant, P-13 (footer bureaux), gating livres blancs, WebP/AVIF, portail réel (Entra/Dataverse), fermetures ADO elles-mêmes (le user clique).

## Objectif

Le 12 : rendre éditable au CMS tout ce qui restait codé en dur (Contact, Carrières, chrome blogue/recherche/merci), nettoyer les médias, produire la première checklist ADO. Le 17 : plan de semaine approuvé pour fermer un maximum de stories, avec audit des critères d'acceptation réels avant toute recommandation (leçon F2.5 : les titres ne suffisent pas).

## Décisions

- **Fermer sur critères d'acceptation, pas sur titres** (ferme). Le user a montré l'AC de « Formulaires contextuels » : elle exigeait GA4, courriel, captcha actif. Deux stories ont été retirées de la liste « fermer » du 12. Tout l'audit du 17 est fait clause par clause sur les ACs extraits par l'API.
- **Contact et Carrières : fichiers de données, pas conversion en sections** (ferme, décision user du 12). Collections dédiées verrouillées (patron « Textes du site »), mise en page fixe. Écarte la conversion composable, qui rejouerait le travail au re-skin.
- **`testimonials.cards` au lieu de `items`** (ferme). La carte `_inputs` CloudCannon est plate par nom de champ : deux `items` de formes différentes dans la même collection entrent en collision.
- **Chrome blogue/recherche/merci dans une collection `pagesSysteme`** (ferme). Un bloc par page ; les chaînes d'accessibilité et l'interface Pagefind restent dans `ui.ts`. Le bloc `ressources` alimente aussi le fil d'Ariane des articles et le flux RSS (source unique).
- **`topics` distinct des `tags` sur le blogue** (ferme). Les tags sont les catégories WordPress (3 valeurs) qui alimentent filtres et méga-menu ; y verser des thèmes multiplierait les onglets. Nouveau champ `topics`, vocabulaire = les 6 noms d'expertises FR/EN. Le matcher des « Ressources liées » lit tags ∪ topics.
- **GA4 en gtag direct, gelé sous consentement** (ferme, variante GTM possible). Balises `type="text/plain" data-consent="analytics"` dans BaseLayout, dégelées par le contrat ConsentBanner existant. Rien n'est rendu sans `PUBLIC_GA4_ID`. Conversion = `generate_lead` sur /merci (le 303 après POST donne une conversion par soumission, tous formulaires).
- **Portage Contact : la définition de formulaire est la source serveur, la page garde sa mise en page** (ferme). `_formId: contact`, noms de champs dérivés de la définition via `fieldName` partagé, et deux garde-fous de build cassent la compilation si page et définition divergent (libellés, options des selects). Écarte la duplication du contrat de sécurité dans la page.
- **Courriel visiteur P-08 : gabarit fixe par langue, jamais de recopie de la soumission** (ferme). Non bloquant en cas d'échec (journalisé).
- **Breadcrumbs sur toutes les pages internes, littéralement** (ferme, imposé par l'AC #1459). Composant unique `Breadcrumbs.astro`, même tableau pour le fil visible et le JSON-LD, parent inclus sur les services enfants, exclu de l'index de recherche et du comptage des vignettes.
- **Fermetures ADO appliquées par le user, pas par CLI** (ferme, choix user). L'accès az sert à lire et auditer.
- **Proposé, en attente user :** heatmap « aucun en v1 » (#1451, fermerait aussi #1494) ; renommage éventuel du formulaire « Campagne évaluation » en « Évaluation posture sécurité » ; charte = export2 (#1408) ; accès Figma acquis (#1409).

## Construit ou modifié

Vague 4 (12 août, poussée `f757c35`) :

- **fait** Collections `contact`, `carrieres` (`src/data/{contact,carrieres}/{fr,en}.json`, migration 1:1), `pagesSysteme` (`src/data/pages-systeme/{fr,en}.json`) ; anciens `src/i18n/content/{contact,carrieres}.ts` supprimés.
- **fait** Helper générique `src/i18n/locale-data.ts` (`getLocaleData(collection, lang)`).
- **fait** `cloudcannon.config.yml` : 3 collections FR + 4 structures scopées ; fix chemin d'upload de l'image du méga-menu (`public/images/nav`) ; vestige `uploads/` supprimé.
- **fait** Docs : `docs/contenu-a-fournir.md` (nouveau), `docs/guide-edition.md` (+3 sections), `docs/ado-alignement.md` v1.

Semaine du 17 (commit `c69a8e5` poussé + 2 fichiers restants, voir Vérification) :

- **fait** CSP appliquée dans `public/_headers` (Turnstile : script/frame/connect ; GA4 : googletagmanager, `*.google-analytics.com`, `*.analytics.google.com` ; `frame-src` déclaré).
- **fait** `docs/operations.md` §7ter : guide de pose des 7 variables Cloudflare Pages ; `.env.example` +`PUBLIC_GA4_ID` ; `docs/formulaires.md` §CSP et §10 dé-périmés.
- **fait** Section form « Évaluation posture sécurité » (`formId: campagne-evaluation`) sur `src/content/services/{fr,en}/cybersecurite.json`.
- **fait** Portage `src/pages/[lang]/contact.astro` sur `/api/forms` (2 modes) ; définitions `src/data/forms/{fr,en}/contact.json` réécrites miroir de la page (9 champs).
- **fait** P-08 : `src/lib/forms/confirmation.ts` + branchement dans `src/pages/api/forms.ts` + `confirmation.test.ts` (4 tests, total 126).
- **fait** GA4 : loader gelé dans `src/layouts/BaseLayout.astro` ; conversion sur `[lang]/merci.astro` ; Site Search sur `[lang]/recherche.astro` (`?q=` + saisie Pagefind débouncée, garde anti-doublon d'écouteurs).
- **fait** `src/components/Breadcrumbs.astro` (`[data-crumbs]`, `data-pagefind-ignore`) posé sur : services (`[...slug].astro`, parent inclus via `filePath`), pages génériques, Contact, Carrières, Solutions, index Ressources. Sélecteur du comptage `scripts/design/generate-section-previews.mjs` étendu (`:not([data-crumbs])`).
- **fait** Schémas : `Service` (services indexables) et `LocalBusiness` ×3 (page Contact, données de la collection contact).
- **fait** Filtre Pagefind : prop `contentType` de BaseLayout stampée `Service`/`Article`/`Page` sur toutes les routes indexables (`data-pagefind-filter="Type[data-content-type]"`).
- **fait** Maillage : champ `topics` au schéma blog, 54 fichiers d'articles thématisés (27 slugs ×2 langues, 3 nouvelles corpo sans topic), matchers services+pages étendus, 26 bandes « Ressources liées » posées (script idempotent en scratchpad), input CloudCannon + note guide-edition.
- **fait** E2e : `tests/e2e/formulaires-recherche.spec.ts` (6 tests) ; timeout élargi à 15 s dans `portal.spec.ts` (flake).
- **fait** `docs/ado-alignement.md` réécrit v2 avec les IDs réels, par condition de fermeture.

## Architecture (état après session)

- Toute surface de contenu est éditable au CMS : 12 collections CloudCannon + le contrat Bookshop. Le texte d'interface restant dans `ui.ts` est volontaire (a11y, Pagefind, partage d'article).
- Formulaires : section Bookshop ou page Contact, tous deux POST `/api/forms` avec `_formId` ; le serveur dérive requis/courriels/cases et la liste blanche des selects de la définition ; Turnstile + honeypot ; deux envois SMTP2GO (équipe + visiteur). Tout est inerte sans les variables d'environnement.
- Analytics : contrat de consentement unique (ConsentBanner dégèle les scripts `data-consent="analytics"` à l'acceptation puis à chaque navigation) ; gtag re-configuré par navigation = page_view SPA.
- Recherche : Pagefind au build, filtre « Type » alimenté par attribut, interface affichée automatiquement dès que l'index porte des filtres (visible seulement sur un build, pas en dev).

## Environnement / spécificités

- **ADO :** org `https://dev.azure.com/Victrix-clients`, projet `Victrix - Refonte site Web`, hébergé par le tenant **79047b39-9f98-4da4-85a2-e0fd343721a7** (« Solutions Victrix Inc, les »). Le tenant 682e3239 (« Victrix ») exige MFA pour ARM et n'a aucun rapport avec ADO. Connexion : `az login --tenant 79047b39-… --allow-no-subscriptions` (extension `azure-devops` installée, defaults configurés). Extraction REST : jeton `az account get-access-token --resource 499b84ac-1321-427f-aa17-267ca6975798`, puis `wit/wiql` et `wit/workitemsbatch` (api-version 7.1, 200 ids max par lot). Ne pas mettre `@project` dans le WIQL passé à `az boards query` (le `--project` scope déjà ; le macro fait échouer en silence).
- **Variables Cloudflare Pages (§7ter) :** `PUBLIC_FORMS_ENABLED=1`, `PUBLIC_TURNSTILE_SITE_KEY`, `TURNSTILE_SECRET_KEY`, `SMTP2GO_API_KEY`, `FORMS_FROM_EMAIL` (expéditeur vérifié), `FORMS_TO_EMAIL`, `PUBLIC_GA4_ID`.
- **Stack :** Astro 5.18.2 (statique + adaptateur Cloudflare build seulement), Tailwind v4 (`@theme`), Pagefind 1.5.2, Vitest (126 tests), Playwright (13 e2e), Node 20.20.2 local.
- **Commits :** vague 4 = `f757c35`, design v3 export2 = `47c1a19`, semaine 17 = `c69a8e5` (poussé, confirmé par `git ls-remote`).
- **Gate isolé** (dev server actif sur 4321) : robocopy mono-thread vers `C:\Users\<user>\vvbuild` avec `/XD` en chemins absolus, puis type-check + `npm run build` + `STATIC_ONLY=1 npm run build` (recette `docs/operations.md` §3.1).

## Problèmes rencontrés et résolus

- **92 erreurs de type après `getLocaleData`.** Cause : le type de retour inféré de `entry.data` sur un générique `C extends CollectionKey` se résout sur la contrainte (l'union des 12 collections) au lieu de rester paramétrique. Correctif : annoter explicitement `Promise<CollectionEntry<C>['data']>`.
- **`az login --use-device-code` muet en arrière-plan.** stdout Python bufferisé hors terminal : préfixer `PYTHONUNBUFFERED=1`. Deux codes ont ensuite expiré sans auth (fenêtre ~15 min) ; la voie robuste est le login interactif dans le terminal du user, jeton partagé via `~/.azure`.
- **Trouver le tenant d'une org ADO sans être connecté :** suivre la redirection de connexion de `https://dev.azure.com/<org>` ; l'URL `login.microsoftonline.com/<guid>` révèle le tenant.
- **E2e portail rouge en suite complète, vert en solo.** Pas une régression : première compilation des routes à la demande (`/auth/login`, tableau de bord) sur dev server froid sous 6 workers dépasse le timeout de 5 s de `toHaveURL`. Correctif : timeout 15 s commenté dans le spec.
- **`execFileSync('az.cmd', …, {shell:false})` échoue (EINVAL).** Node 18+ bloque le spawn direct des `.cmd`. Voie propre : un seul `execSync` pour le jeton, puis `fetch` natif vers l'API. Leçon générale de la session : écrire des `.mjs`, pas des `node -e` imbriqués dans bash (trois échecs d'échappement).
- **Push GitHub « réussi » mais invisible.** Symptômes : « Cannot retrieve latest commit at this time » sur github.com, aucun build Cloudflare ni pull CloudCannon. Cause : panne GitHub majeure en cours (« Git Operations degraded », webhooks non émis). Vérification que le push est sain : `git ls-remote origin <branche>` répond le bon SHA directement du backend git. Rien à repousser.
- **CloudCannon « Sync failed, 2 pulls failed » avec boutons grisés.** Le bandeau « Syncing actions are disabled while there are unsaved changes » signifie que des modifications non sauvegardées dans l'éditeur bloquent tout retry : les jeter (ou sauvegarder) dans l'éditeur d'abord, puis « Retry » ou « Discard changes and retry » (les rejets sont sauvegardés dans Site Settings, récupérables). Non rejoué au moment du digest : GitHub encore en panne.
- **Impasse nommée :** générer les vignettes ou vérifier visuellement pendant que le dev server du user tourne sur des données périmées. Toute vérification visuelle attend un redémarrage du serveur.

## Vérification / état des tests

- **Vérifié :** lint 0 erreur (1 avertissement a11y pré-existant sur contact.astro) ; 126 tests unitaires ; type-check 0 erreur ; builds prod et STATIC_ONLY Complete (162 pages) en copie isolée ; preuves dans le HTML construit : fil d'Ariane avec parent cliquable (zero-trust), crumbs sur les 4 pages ajoutées, formulaire Évaluation sur Cybersécurité, bandes « Ressources liées » avec vraies cartes FR et EN, LocalBusiness ×3, schéma Service, zéro trace GA4 sans clé. E2e : 12/13 exécutés par le user (les 6 nouveaux verts), le 13e vert en solo après correctif.
- **Non vérifié :** flux réel avec clés (widget Turnstile, 2 courriels, DebugView GA4, filtre Type sur un build servi) ; interface CloudCannon des 3 collections du 12 ; suite e2e complète après correctif du timeout ; vignettes non régénérées.
- **État git au moment du digest :** `c69a8e5` poussé et confirmé sur le remote ; **2 fichiers restent non commités** (le commit du user est parti pendant les derniers correctifs) : `src/components/Breadcrumbs.astro` (data-pagefind-ignore) et `docs/ado-alignement.md` (v2). Ce digest s'ajoute à ce commit de suivi.

## Questions ouvertes

- #1408 : la charte modernisée = l'export2 appliqué ? (fermable si oui, décision côté designer/user).
- #1409 : Victrix a-t-il l'accès Figma éditable ? (seule clause de l'AC).
- Heatmap : accepter « aucun en v1 » ? (ferme #1451 et #1494).
- Renommer « Campagne évaluation de sécurité » en « Évaluation posture sécurité » dans la collection Formulaires ?
- Où est le fichier d'export Screaming Frog (task #1542 fermée) ? Le déposer dans `docs/migration/` débloque #1445/P-18 puis la matrice 301.
- GTM plutôt que gtag direct si le marketing veut gérer ses balises ? (le loader actuel est gtag ; bascule facile).

## Risques / dépendances / bloqueurs

- **Panne GitHub en cours au moment du digest** : bloque le build Cloudflare (webhook), le sync CloudCannon, et l'affichage du commit. Le push lui-même est sain.
- **Clés OPS (user)** : gate d'environ 9 fermetures ADO (sections 2 et 3 de `ado-alignement.md`).
- **Designer** : maquettes pages complètes (#1407), visuels restants (#1452), bloc footer 3 bureaux (P-13, absent de l'export2).
- **Julie (SEO)** : validation de la matrice 301.
- **Licence CloudCannon / sièges (#1622)** : préalable à l'invitation des gestionnaires.

## Dette / reporté

- Lighthouse/axe en CI (F4.2) : reporté après l'audit, à outiller.
- Lot 6 : régénérer les 30 vignettes (`npm run design:previews`), câbler les 5 photos export2, sous-ensembler Inter (344 Ko). Exige un dev server frais.
- Durcissement CSP `'unsafe-inline'` ; messages d'erreur ARIA par champ et focus ≥ 3 px (#1466) ; multi-étapes P-22 ; fenêtres de dates sur sections P-23 ; WebP/AVIF (après visuels finaux).

## Prochaines étapes

1. (User) Une fois GitHub vert : commit de suivi (2 fichiers + ce digest) et push, ce qui relance les webhooks ; sinon « Retry deployment » côté Cloudflare et déblocage du sync CloudCannon (jeter les unsaved changes, puis Retry).
2. (User) Cliquer la section 1 de `ado-alignement.md` (8 à 10 fermetures) ; trancher heatmap, #1483 ; confirmer #1408/#1409.
3. (User) Poser les clés (§7ter), redéployer ; puis (ensemble) passe de vérification préversion : Turnstile, 2 courriels, `generate_lead` en DebugView, filtre Type ; fermer les sections 2 et 3.
4. (User) Récupérer l'export Screaming Frog et me le donner (P-18, matrice 301).
5. (Claude Code) Redémarrer le dev server puis `npm run test:e2e` (13/13 attendu) et `npm run design:previews` ; Lot 6.
6. Tranche suivante : P-19 (migration de contenu restante) et onboarding CloudCannon des gestionnaires (`docs/contenu-a-fournir.md` §5).

## Constats durables

- Astro/TS : un helper générique sur `getCollection` doit annoter son retour `Promise<CollectionEntry<C>['data']>` ; l'inférence se résout sur la contrainte et propage l'union partout (92 erreurs pour une ligne).
- Le tenant AAD d'une org Azure DevOps se lit sans authentification dans la chaîne de redirection de connexion de l'org (`login.microsoftonline.com/<guid>`).
- L'accès Azure DevOps ne requiert aucun abonnement Azure : `az login --allow-no-subscriptions` + jeton sur la ressource `499b84ac-1321-427f-aa17-267ca6975798`.
- `az` sous pipe non-interactif : `PYTHONUNBUFFERED=1`, sinon le message device-code reste dans le tampon.
- Node 18+ refuse `execFileSync` d'un `.cmd` sans shell ; pour scripter az, prendre le jeton une fois et parler REST en `fetch`.
- Playwright + Astro dev : les routes `prerender = false` compilées à la demande font des faux négatifs sous charge froide ; élargir le timeout de la première assertion d'URL, ou réchauffer.
- Pagefind : `data-pagefind-filter="Nom[attribut]"` sur l'élément `data-pagefind-body` suffit, l'interface affiche le groupe automatiquement ; penser `data-pagefind-ignore` sur tout chrome ajouté dans `<main>` (fil d'Ariane).
- Panne GitHub : « Cannot retrieve latest commit » + webhooks muets pendant que `git ls-remote` répond correctement = incident côté GitHub, ne pas repousser ; les intégrations (Cloudflare, CloudCannon) repartent au prochain événement.
- CloudCannon : un sync en échec avec « unsaved changes » se débloque dans l'éditeur (save ou discard des fichiers marqués) avant que les boutons Retry ne s'activent ; « Discard changes and retry » garde une sauvegarde dans Site Settings.

## Statut des documents vivants

Oui, deux mises à jour restent à faire (le reste a été absorbé en session) :

- `docs/plan-prompts.md` : le §0 (« État au 7 août ») et le tableau de suivi §4 sont périmés ; refléter P-08 fait, P-11 fait côté code (activation = clés), P-20 avancé (6 e2e), et la bascule du pilotage vers `ado-alignement.md` pour les fermetures. Le journal §9 est à jour.
- `docs/contenu-a-fournir.md` §4 : retirer P-08 et P-11 de la colonne « reste côté technique » (faits), garder les clés et le REBUILD_HOOK_URL.

Déjà à jour pendant la session : `docs/ado-alignement.md` (v2), `docs/operations.md` (§7ter), `docs/guide-edition.md`, `docs/formulaires.md`, mémoire projet (`project-status.md`, `MEMORY.md`).
