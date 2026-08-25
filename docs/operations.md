# Opérations — routine CloudCannon + Cloudflare Pages

> Le processus complet, au jour le jour : synchroniser, développer, vérifier,
> publier. Complète `docs/DEPLOYMENT.md` (hébergement, contraintes, liste
> go-live) et `docs/spike-cloudcannon.md` (réglages CloudCannon, grille de gate). Toutes
> les commandes ci-dessous ont été exécutées une fois pour vérifier ce
> document (14 juillet 2026).

## 1. Avant de commencer une session

CloudCannon committe directement sur `spike/cloudcannon` (chaque sauvegarde
dans l'éditeur visuel devient un commit) — toujours tirer avant de travailler
pour ne pas repartir d'une base périmée :

```
git pull --rebase origin spike/cloudcannon
npm install
```

`npm install` seulement si `package.json`/`package-lock.json` a changé depuis
la dernière fois (un `git pull` qui les touche, ou une installation manuelle).

## 2. Développement local

```
npm run dev
```

Node 18 fonctionne en local — l'adaptateur Cloudflare ne s'attache qu'au
build de production (voir `docs/DEPLOYMENT.md`). **Pendant que `npm run dev`
tourne, ne PAS lancer `astro build` / `astro preview` / `astro check` dans le
même dépôt** : les deux processus écrivent le même cache `.astro/`, ce qui
provoque un `EPERM` sous Windows et laisse le serveur de dev sur une
configuration périmée (« Continuing with previous valid configuration »).
Voir §3.1 pour vérifier sans arrêter le serveur de dev.

## 3. Portail qualité avant de pousser

Cinq commandes, dans cet ordre — toutes doivent sortir propres :

```
npm run lint
npm test
npm run type-check
npm run build
STATIC_ONLY=1 npm run build
```

| Commande | Attendu | Constaté au 14 juillet 2026 |
|---|---|---|
| `npm run lint` | 0 erreur (des avertissements a11y pré-existants sont tolérés) | 0 erreur, 6 avertissements (liens `href` vides, `contact.astro`/`Footer.astro`) |
| `npm test` | tous les tests verts | 62/62 |
| `npm run type-check` | 0 erreur | 0 erreur, 3 indices (`hints`) sans gravité |
| `npm run build` | build Cloudflare complet (`dist/_worker.js` + `_redirects` + `_routes.json`) | OK — `_worker.js` présent, 1 redirection CMS écrite et exclue du worker |
| `STATIC_ONLY=1 npm run build` | build 100 % statique (aucun `_worker.js`), 23 pages | OK — 23 page(s) built, aucun `_worker.js` dans `dist/` |

### 3.1 — Si `npm run dev` tourne déjà (le cas courant)

Les trois dernières commandes du tableau ci-dessus touchent `.astro/` ou
`dist/` — **à exécuter dans une copie isolée**, pas dans le dépôt de travail,
si un `npm run dev` est actif (se vérifie : port 4321 en écoute). C'est le
contournement EBUSY déjà documenté en mémoire projet, formalisé ici :

```powershell
# 1. Copier le dépôt (sans .git/dist/.astro) vers un chemin court, HORS du
#    dépôt — voir le piège de robocopy plus bas avant d'adapter cette ligne.
robocopy "c:\Repo\Victrix\Demo-victrix" "C:\Users\<vous>\vvbuild" /E `
  /XD "c:\Repo\Victrix\Demo-victrix\.git" "c:\Repo\Victrix\Demo-victrix\dist" `
      "c:\Repo\Victrix\Demo-victrix\dist-static" "c:\Repo\Victrix\Demo-victrix\.astro"

# 2. Lancer les commandes dans la copie
cd C:\Users\<vous>\vvbuild
npm run type-check
npm run build
STATIC_ONLY=1 npm run build

# 3. Nettoyer une fois la vérification terminée
Remove-Item -Recurse -Force C:\Users\<vous>\vvbuild
```

**Deux pièges constatés en écrivant ce document (14 juillet 2026), les deux
avec le même symptôme (`astro check`/`build` échoue avec
`ERR_MODULE_NOT_FOUND`, `node_modules/astro/dist/` entier manquant dans la
copie) mais des causes différentes :**

1. **`/XD "dist"` (nom seul, sans chemin) exclut TOUS les dossiers `dist` du
   sous-arbre, pas seulement celui du dépôt** — y compris
   `node_modules/astro/dist/` et ceux de dizaines d'autres paquets (presque
   chaque paquet npm publie un `dist/`). Robocopy compte ça comme des
   répertoires « Ignoré », sans erreur. **Solution : toujours passer le
   chemin complet à `/XD`** (voir la commande ci-dessus), jamais juste le nom.
2. **`/MT` (copie multi-thread) a fait perdre des répertoires en silence** sur
   ce même dépôt, de façon reproductible, même une fois le piège n°1 corrigé
   pour un sous-ensemble — constaté en comparant une copie mono-thread
   (fiable) à une copie `/MT:16` du même dossier. **Solution : ne pas utiliser
   `/MT` pour copier `node_modules`** — plus lent (environ 1 min 30 pour ~460
   Mo / 35 000 fichiers en mono-thread sur cette machine), mais fiable.
   Le préfixe long-path `\\?\` a aussi été essayé et rejeté par cette version
   de robocopy (erreur de syntaxe sur le chemin source) — pas une solution ici.

**Toujours vérifier après coup** (les deux pièges ci-dessus échouent
silencieusement, sans « ÉCHEC » dans le résumé robocopy) :
`Test-Path C:\Users\<vous>\vvbuild\node_modules\astro\dist\cli\index.js`
doit renvoyer `True` avant de faire confiance à la copie.

## 4. Publier (commit + push)

Aucun commit/push automatique — vous gardez la main sur l'historique Git.
Une fois le portail qualité vert :

```
git add <fichiers>
git commit -m "…"
git push
```

## 5. Ce qui se passe automatiquement après le push

- **CloudCannon — site d'édition (staging)** : tire le nouveau commit et
  reconstruit le site (`STATIC_ONLY=1 npm run build`, puis
  `.cloudcannon/postbuild` → `npx @bookshop/generate`) — c'est l'aperçu des
  éditeurs ET le site servi sur le domaine de test `lawful-hare.cloudvent.net`
  (en-tête `noindex` automatique). Voir §7. Rien ne part en production sans le
  bouton Publish (§6).
- **Cloudflare Pages (infra héritée du spike)** : tant que le projet
  `victrix-demo` reste connecté au dépôt, chaque push construit aussi une
  préversion de branche à `https://spike-cloudcannon.victrix-demo.pages.dev`
  (build avec adaptateur — pas `STATIC_ONLY`). Conservée pour une raison
  précise : c'est le seul endroit où un vrai POST `/api/forms` peut tourner
  (§8) et où `_redirects`/`_headers` sont appliqués (contrainte routage :
  `docs/DEPLOYMENT.md` §6). À décommissionner au go-live.

### Vérifications après un push (exemples)

```
curl -I https://lawful-hare.cloudvent.net/fr/merci/
curl -I https://spike-cloudcannon.victrix-demo.pages.dev/demo-redirection
```

Attendu : `/fr/merci/` → `200` avec `x-robots-tag: noindex` (le domaine de
test cloudvent est toujours noindex) ; `/demo-redirection` → `301` vers `/fr`
(la redirection éditée au CMS, `src/data/redirects.json`) — **sur la
préversion Cloudflare seulement** : l'hébergement CloudCannon ignore
`_redirects` (convention Netlify/Cloudflare) et lira `.cloudcannon/routing.json`
une fois généré (chantier go-live, `docs/DEPLOYMENT.md` §6).

## 6. Le bouton Publish — deux sites CloudCannon (staging → production)

Stratégie retenue (journal de décisions de `GUIDE-PROJET.md`, 17 juil. + 25
août) : CloudCannon est CMS **et** hébergeur. Deux sites CloudCannon sur le
même dépôt ; le vrai victrix.ca (WordPress) reste en ligne pendant toute la
transition.

| Étage | Branche | Site CloudCannon | URL |
|---|---|---|---|
| Édition (staging) | `spike/cloudcannon` | « Vic-demo » (existant) | `lawful-hare.cloudvent.net` |
| Production | `main` | créé le 2026-08-25 (mise en place ci-dessous) | `overt-pineapple.cloudvent.net` ; domaine réel au go-live |

Mise en place (une fois, dans l'UI CloudCannon) :

1. **Créer le site de production** : Add Site → même dépôt GitHub
   (`GabMercier/victrix-demo`) → branche `main`. Recopier les réglages de
   build du site d'édition : `STATIC_ONLY=1` (obligatoire, §7), sortie
   `dist`, même version Node. Tant que le premier Publish n'a pas eu lieu, ce
   site construit la démo pré-spike du 9 juillet (`main` est ~90 commits en
   retard) — apparence datée attendue, ignorer.
2. **Lier la publication** : sur le site d'édition → Site Settings → Files →
   Publishing → choisir le site `main` comme cible. Le bouton **Publish**
   apparaît alors pour les éditeurs.
3. **Premier Publish** : fusionne `spike/cloudcannon` dans `main` et
   reconstruit le site de production. Sans aucun effet sur le vrai
   victrix.ca ; l'URL cloudvent de production est noindex de toute façon.

Au quotidien : **Save = staging ; Publish = production.** Retour arrière =
`git revert` du commit de fusion sur `main` (une publication CloudCannon est
une fusion Git ordinaire), puis reconstruction du site de production.

⚠️ **Limite connue tant que `STATIC_ONLY` n'est pas scindé** : ce drapeau
porte aujourd'hui DEUX choses — « build 100 % statique » ET la politique
« aperçu d'édition » (brouillons et articles à date future construits,
`src/i18n/blog.ts` ; fenêtres de dates des barres d'annonce ignorées,
`src/lib/announce.ts` ; Bookshop attaché). Le site de production CloudCannon
(construit `STATIC_ONLY=1`) hérite donc de ce comportement d'aperçu.
Acceptable pendant la transition (URL noindex, pas le vrai site) ;
**bloquant pour le go-live** — la scission (p. ex. un `EDITOR_PREVIEW=1`
posé seulement sur le site d'édition) est dans la liste go-live de
`docs/DEPLOYMENT.md` §7.

## 7. CloudCannon — où regarder

- **Journal de build** : dans le tableau de bord du site, chaque build liste
  ses étapes. Deux lignes à surveiller dans le postbuild
  (`npx @bookshop/generate`, source exacte : `@bookshop/generate/lib/
  live-connector.js`) :
  - `Added live editing to N page(s) containing Bookshop components` — sain,
    l'édition visuelle « clic sur composant » est branchée.
  - `No live editing connected as no pages contained Bookshop components` —
    régression : une page qui devrait rendre `<Page bookshop:live …>` ne le
    fait plus (voir `component-library/src/shared/astro/page.astro` et
    `src/pages/[lang]/campagnes/[slug].astro` — corrigé une première fois le
    14 juillet, commit `d541ec6`).
  - Ces deux lignes ne peuvent être observées que dans un **vrai build
    CloudCannon** : `npx @bookshop/generate` lancé seul (hors de
    l'environnement CloudCannon) s'arrête plus tôt avec « Could not find any
    output sites » — il cherche un fichier `_cloudcannon/info.json` que seul
    CloudCannon génère. Rien à corriger, c'est attendu en local.
- **Bouton Sync/Pull** : force CloudCannon à retirer le dernier commit avant
  le prochain build planifié — utile après un push si l'aperçu semble figé.
- **Piège « Building Locked »** : un interrupteur qui bloque tout nouveau
  build tant qu'il est actif (rencontré activé par défaut à la connexion
  initiale, voir `spike-cloudcannon.md`) — à vérifier en premier si un push
  ne déclenche aucun build.
- **Variable d'environnement obligatoire** : `STATIC_ONLY=1` (build settings)
  — sans elle, CloudCannon construit le worker Cloudflare et Bookshop ne se
  charge pas.
- **Téléversements** : chemin global `src/assets/uploads/` (`cloudcannon.
  config.yml`, clé `paths.uploads`, ajouté le 14 juillet 2026) — avant ce
  réglage, tout téléversement sans chemin propre à sa collection atterrissait
  à la racine du dépôt (`uploads/`, voir le fichier de test
  `uploads/yw3ziw8k83bh1.jpeg`, laissé committé — supprimable depuis le
  navigateur de fichiers CloudCannon si désiré, aucun code n'en dépend). Les
  champs image du blogue et de l'accueil gardent leur propre chemin relatif
  (inchangé, nécessaire pour `astro:assets`).
- **Partage** : Site Sharing (accès complet à l'éditeur) vs Client Sharing
  (lien de revue restreint) — Site Settings → Sharing. Domaine de test
  CloudCannon disponible pour prévisualiser sans exposer l'URL Cloudflare.

## 7bis. Publication planifiée (contenus programmés)

Un site statique n'applique les règles de dates **qu'au moment d'un build** —
la « planification » repose donc sur trois pièces (2026-07-30) :

1. **Ce qui se planifie déjà** :
   - **Articles de blogue** : une date FUTURE dans le champ « Date » = l'article
     est invisible des builds publiés jusqu'à sa date (les préversions et
     l'éditeur CloudCannon le montrent — même politique que les brouillons).
   - **Barres d'annonce (bibliothèque, 2026-08-20)** : collection « Barres
     d'annonce » (groupe Marketing) — une fiche par bannière
     (src/data/annonces/*.json), champs « Diffuser à partir de » / « Retirer à
     partir de ». Fenêtre [début, fin), heure UTC; vide = pas de borne. Une
     seule s'affiche à la fois : parmi les bannières « Affichée » dont la
     fenêtre couvre le build, la plus récemment COMMENCÉE gagne (startAt vide
     = « depuis toujours », perd contre toute bannière datée; égalité → nom de
     fichier) — sélection dans src/lib/announce.ts + pickActiveAnnounce
     (src/lib/schedule.ts, testé). Une date invalide casse le build (garde-fou
     zod, collection `annonces`). L'éditeur visuel montre toujours une
     bannière « Affichée ». Supprimer TOUTES les fiches est toléré (site sans
     bannière + avertissement glob au build) — en garder au moins une.
2. **Le rebuild quotidien** : `.github/workflows/rebuild-planifie.yml` (06:17
   UTC + bouton manuel dans l'onglet Actions). **Branchement OPS requis une
   fois** : créer le secret GitHub `REBUILD_HOOK_URL` avec un build hook
   CloudCannon **du site de production** (site `main` → Site Settings →
   Builds → Build Hooks) — c'est le site publié qui doit ré-appliquer les
   fenêtres de dates chaque jour ; le site d'édition se reconstruit déjà à
   chaque Save. (Nécessite que le site de production existe — §6.) Sans
   secret, le workflow tourne à vide sans échouer.
3. **Granularité** : un passage par jour. Pour une parution à heure précise,
   lancer le workflow manuellement (Actions → « Reconstruction planifiée » →
   Run workflow) ou ajouter un second cron.

Étendre la planification à d'autres surfaces (sections de l'accueil, campagnes)
= réutiliser `src/lib/schedule.ts` + deux champs de dates (patron de la
bannière); chantier au backlog (P-23, plan-prompts.md).

## 7ter. Activer formulaires + analytics (les clés — OPS, après la décision « backend formulaires »)

La CSP (`public/_headers`) autorise **depuis le 2026-08-17** Turnstile
(`challenges.cloudflare.com`) et GA4 (`googletagmanager.com`,
`*.google-analytics.com`) — les clés peuvent donc être posées sans autre
changement de code. Tout est **inerte tant que les variables sont absentes** :
sans clés, le site est strictement identique.

**Où poser les clés (mis à jour 2026-08-25, production = CloudCannon)** :
l'hébergement CloudCannon est 100 % statique — le endpoint `/api/forms` (une
Pages Function Cloudflare) n'y tourne pas. Répartition :

- **`PUBLIC_GA4_ID`** : variable de build du **site CloudCannon de
  production** (site `main` → Site Settings → Builds). Posable dès que ce
  site existe — balises gelées, elles ne s'exécutent qu'après le
  consentement Loi 25.
- **Les 6 clés formulaires** (le reste du tableau) : en attente de la
  décision « backend formulaires » — où fera-t-on tourner `/api/forms` au
  go-live ? Options : (a) conserver un déploiement Cloudflare minimal
  SEULEMENT pour ce endpoint (les formulaires pointent alors une URL
  absolue) ; (b) porter vers Azure Functions
  (`docs/options-editeur-hebergement.md` §3.3) ; (c) service SaaS de
  formulaires. **Ne poser `PUBLIC_FORMS_ENABLED` sur AUCUN build tant que
  cette décision n'est pas prise** — les sections « form » deviendraient de
  vrais POST sans récepteur.

Référence des variables (inchangée) :

| Variable | Valeur | Effet |
|---|---|---|
| `PUBLIC_FORMS_ENABLED` | `1` | Les sections « form » deviennent de vrais formulaires POST |
| `PUBLIC_TURNSTILE_SITE_KEY` | clé de site Turnstile | Widget anti-pourriel affiché |
| `TURNSTILE_SECRET_KEY` | clé secrète Turnstile | Vérification serveur du jeton |
| `SMTP2GO_API_KEY` | clé API SMTP2GO | Envoi réel des courriels |
| `FORMS_FROM_EMAIL` | expéditeur **vérifié** dans SMTP2GO | Adresse d'envoi |
| `FORMS_TO_EMAIL` | boîte de réception équipe | Destinataire par défaut (un formulaire peut la surcharger) |
| `PUBLIC_GA4_ID` | `G-XXXXXXXXXX` | Balises GA4 **gelées** émises ; elles ne s'exécutent qu'après acceptation du bandeau Loi 25 |

Où créer les comptes/clés : Turnstile → tableau de bord Cloudflare → Turnstile
→ Add site (domaine final + domaine de test au besoin — le service Turnstile
est indépendant de l'hébergeur) ; SMTP2GO → Settings → API Keys + Sender
domains (vérifier le domaine de `FORMS_FROM_EMAIL`) ; GA4 → admin Google
Analytics → propriété → flux Web → ID de mesure. Après la pose : reconstruire
(build hook ou push) — les variables ne s'appliquent qu'aux builds suivants.

Vérifications (sur l'URL de test du backend formulaires retenu) : widget
Turnstile visible sous le formulaire ; soumission → `/fr/merci/` + courriel
reçu ; **aucune requête google-analytics avant d'accepter le bandeau**,
requêtes `collect` après acceptation (onglet Réseau) ; GA4 DebugView montre
les événements.

## 8. Dépannage

| Symptôme | Cause | Solution |
|---|---|---|
| `EPERM … rename '.astro\content-assets.mjs.tmp'` | Build/`astro check` lancé pendant que `npm run dev` tourne (même cache `.astro/`) | Arrêter `npm run dev`, ou vérifier dans une copie isolée (§3.1) |
| `astro check`/`build` échoue avec `ERR_MODULE_NOT_FOUND` dans une copie isolée, `node_modules/astro/dist/` manquant | `/XD "dist"` (sans chemin complet) exclut tous les `dist/` du sous-arbre, y compris ceux de `node_modules` ; `/MT` peut aussi perdre des répertoires en silence | Voir §3.1 — chemins `/XD` complets, pas de `/MT` sur `node_modules`, vérifier `node_modules\astro\dist\cli\index.js` après coup |
| `npx @bookshop/generate` local dit « Could not find any output sites » | Normal hors de CloudCannon — cherche `_cloudcannon/info.json`, généré seulement par leur environnement de build | Rien à corriger ; se fier au journal de build CloudCannon (§7) pour cette vérification précise |
| Content Editor de CloudCannon affiche une page blanche | Normal pour les landings (frontmatter seul, pas de corps markdown) | Basculer sur l'éditeur **Visuel** via les icônes en haut à droite |
| Palette de sections avec des doublons | `_structures.sections` écrit à la main en double avec les entrées générées par `@bookshop/generate` | Ne jamais lister les sections vous-même dans `cloudcannon.config.yml` — seules les clés `style`/`remove_extra_inputs` sont à nous, voir le commentaire au-dessus de `_structures.sections` |
| Redirection CMS servie en `200` au lieu de `301` | `_routes.json` (adaptateur Cloudflare) n'exclut pas la source — le worker (`include: "/*"`) intercepte avant `_redirects` | Déjà corrigé dans `astro.config.mjs` (intégration `victrix:redirects`, exclusion automatique) — si ça revient, vérifier que le build de prod (pas `STATIC_ONLY`) a bien tourné après l'ajout d'une redirection |
| `/api/forms` répond `405` sur le domaine de test CloudCannon | Attendu : le build `STATIC_ONLY` ne peut émettre qu'un stub GET statique pour cette route (pas de Pages Function en dehors de Cloudflare) | Rien à corriger — tester le vrai POST sur une préversion de branche Cloudflare (infra héritée du spike, §5), pas sur CloudCannon |
| Widget Turnstile absent malgré `PUBLIC_TURNSTILE_SITE_KEY` posée | Avant 2026-08-17 : la CSP ne listait pas `challenges.cloudflare.com`. C'est **appliqué** depuis (voir §7ter) — si le widget manque encore, vérifier que le build servi date d'après la pose des variables | Redéployer après la pose des clés ; vérifier la console navigateur pour un éventuel blocage CSP résiduel |
| Un fichier texte édité en PowerShell (`.gitignore`, `.env`…) devient illisible / git le traite comme binaire | `>>`/`echo "…" >> fichier` en PowerShell écrit en **UTF-16LE** par défaut ; ajouté à un fichier existant en UTF-8, ça corrompt le fichier (rencontré sur `.gitignore` le 14 juillet 2026 — `git diff` l'a montré en « Bin » au lieu d'un diff texte) | Éditer avec un éditeur de texte, ou `Add-Content -Encoding utf8`/`Set-Content -Encoding utf8` — jamais `>>` nu sur un fichier UTF-8 existant |

## 9. Fichiers liés

| Fichier | Rôle |
|---|---|
| `docs/DEPLOYMENT.md` | Hébergement CloudCannon (staging → production), infra Cloudflare héritée, contraintes de routage, liste go-live |
| `docs/spike-cloudcannon.md` | Réglages CloudCannon à la connexion + grille de gate à 8 critères |
| `docs/options-editeur-hebergement.md` | Ce qui dépend de CloudCannon vs ce qui est portable (Tina/Sveltia, Azure) |
| `docs/formulaires.md` | Variables d'environnement des formulaires, CSP Turnstile |
| `.cloudcannon/postbuild` | Le script qui lance `npx @bookshop/generate` sur les builds CloudCannon |
