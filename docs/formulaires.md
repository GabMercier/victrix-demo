# Formulaires — architecture, variables d'environnement et mise en service

> Statut : **implémenté, invisible par défaut.** Sans aucune variable
> d'environnement, le site rendu est identique à avant : les sections « form »
> restent une maquette non fonctionnelle et `/api/forms` tourne en « mode
> démo ». Tout s'active par configuration, rien par déploiement de code.

## 1. Pourquoi cette architecture

Le site est statique (Astro, Cloudflare Pages) ; il n'y a pas de PHP/WordPress
pour recevoir un POST. La solution reprend l'idiome déjà en place pour le
portail client : **une seule route à la demande** (Pages Function) reçoit les
soumissions, tout le reste demeure des fichiers statiques servis du edge.

Choix structurants :

- **Formulaire no-JS d'abord.** La section Bookshop « form » soumet un
  `<form method="POST" action="/api/forms">` classique
  (`application/x-www-form-urlencoded`). Aucun JavaScript requis côté visiteur ;
  Turnstile est une couche optionnelle par-dessus. Le `<form>` porte
  `data-astro-reload` : sans lui, le routeur de transitions (ClientRouter,
  BaseLayout) intercepte la soumission et enverrait le corps en
  `multipart/form-data` — il ne passe en urlencoded que si l'attribut
  `enctype` est explicitement posé (vérifié dans
  `node_modules/astro/dist/transitions/router.js`) — format que le endpoint
  ne lit pas. L'attribut rend la soumission au navigateur : POST urlencoded
  natif, vrai suivi du 303.
- **Redirection, jamais d'erreur HTML.** Le endpoint répond toujours par un
  `303 See Other` (le code standard POST-redirect-GET) : vers `/<lang>/merci/`
  en cas de succès, vers la page d'origine + `?erreur=1` en cas d'échec de
  validation. Un visiteur ne voit jamais une page d'erreur brute. Au retour
  d'un échec, la section « form » affiche une **bannière d'erreur** bilingue
  (cachée par défaut, révélée par un mini-script en ligne qui lit
  `?erreur=1`) — sans elle, le visiteur verrait la page se recharger sans
  explication, réponses perdues. Compatible avec la CSP actuelle : le
  `script-src` de `/fr/*` et `/en/*` contient déjà `'unsafe-inline'`
  (`public/_headers` gelé, aucune modification requise).
- **Anti-pourriel en couches.** Pot de miel (champ caché `website`) toujours
  actif ; Cloudflare Turnstile en plus quand les clés sont configurées.
- **Envoi par API (SMTP2GO)**, pas de serveur SMTP : une Pages Function ne peut
  faire que du `fetch`.

## 2. Parcours d'une soumission

```
Page campagne (section « form », PUBLIC_FORMS_ENABLED=1)
        |
        |  POST application/x-www-form-urlencoded
        v
/api/forms (Pages Function, prerender = false)
   1. garde-fou taille (< 25 Ko, valeurs < 5000 caractères)
   2. pot de miel `website` rempli ?  --> 303 /<lang>/merci/  (succès simulé, rien d'envoyé)
   3. validation (champs requis, courriels, voir §5)
        échec --> 303 <source>?erreur=1
   4. TURNSTILE_SECRET_KEY définie ? vérification siteverify du jeton
        échec --> 303 <source>?erreur=1   (échec réseau = échec : « fail closed »)
   5. SMTP2GO configuré ?
        non --> MODE DÉMO : journalise le courriel simulé, 303 /<lang>/merci/
        oui --> envoi API SMTP2GO, puis 303 /<lang>/merci/
                (échec d'envoi = problème d'exploitation : journalisé, le
                 visiteur est quand même remercié — pas de double soumission)
```

`GET /api/forms` renvoie un petit statut JSON (`{"service":"forms","status":"ok"}`).
Nécessaire au build STATIC_ONLY (CloudCannon) qui force le prérendu de toutes
les routes : sans GET, un endpoint POST-seulement n'émettrait aucun fichier.

## 3. Matrice des variables d'environnement

| Variable | Côté | Effet si définie | Effet si absente |
| --- | --- | --- | --- |
| `PUBLIC_FORMS_ENABLED` | build (client) | `"1"` → les sections « form » deviennent de vrais formulaires POST `/api/forms` | maquette actuelle : bouton désactivé, zéro changement visuel |
| `PUBLIC_TURNSTILE_SITE_KEY` | build (client) | avec formulaires actifs : le widget Turnstile s'affiche (script `challenges.cloudflare.com/turnstile/v0/api.js`) | pas de widget |
| `TURNSTILE_SECRET_KEY` | exécution (Function) | `/api/forms` vérifie le jeton via `siteverify` | vérification sautée (pot de miel seul) |
| `SMTP2GO_API_KEY` | exécution (Function) | envoi réel (avec les deux suivantes) | **mode démo** (voir §6) |
| `FORMS_TO_EMAIL` | exécution (Function) | destinataire de la notification | mode démo |
| `FORMS_FROM_EMAIL` | exécution (Function) | expéditeur — doit être **vérifié** dans SMTP2GO | mode démo |

Côté « exécution », les valeurs sont lues selon le modèle documenté de
l'adaptateur Cloudflare (Astro 5) : `locals.runtime.env` d'abord (workerd n'a
pas de `process.env`), puis `import.meta.env` (`astro dev` / `.env`), puis
`process.env` en dernier recours. En production : variables et secrets du
projet Cloudflare Pages (`wrangler secret put` pour les clés).

## 4. Contrat de champs (formulaire → endpoint)

Champs cachés que la section « form » envoie avec les champs visibles :

| Champ | Obligatoire | Rôle |
| --- | --- | --- |
| `lang` | oui | `fr` \| `en` — choisit la page /merci et la langue des redirections ; toute autre valeur retombe sur `fr` |
| `source` | oui | chemin de la page hébergeant le formulaire — cible du retour en cas d'erreur ; assaini côté serveur (doit commencer par `/`, pas `//`, aucune barre oblique inversée `\` — les navigateurs la normalisent en `/`, même risque de redirection ouverte — requête/fragment retirés) |
| `website` | oui (vide) | **pot de miel** : masqué aux humains (CSS), rempli par les robots ; rempli → succès simulé, rien d'envoyé |
| `_requis` | non | noms des champs requis, séparés par des virgules — chacun doit être non vide après trim. **P-05** : un champ requis CONDITIONNEL (`showIf`) n'y figure pas — sans la définition, le serveur ne peut pas évaluer la condition (garanti en v2 seulement, voir §5) |
| `_courriels` | non | noms des champs courriel, séparés par des virgules — format RFC de base exigé |
| `_cases` | non | **P-05** : noms des cases à cocher, séparés par des virgules. Une case non cochée est ABSENTE d'un POST urlencoded — cette liste permet au serveur de refléter l'état réel (« oui »/« non ») dans le courriel (exigence Loi 25), jamais d'omission silencieuse. Avec `_formId`, écrasée depuis le registre comme `_requis`/`_courriels` |
| `cf-turnstile-response` | (auto) | injecté par le widget Turnstile ; jamais repris dans le courriel |
| `_formId` | non | **Formulaires v2 (17 juil.)** : identifiant d'une définition de `src/data/forms/<lang>/` (collection CloudCannon « Formulaires »). Présent → le serveur résout **destinataire, objet et listes requis/courriel/cases depuis le REGISTRE embarqué au build** (`src/lib/forms/registry.ts`) — les listes annoncées par le client sont écrasées, un id inconnu est un échec de validation (le registre est la liste blanche). **P-05** : les requis sont évalués AVEC les valeurs soumises (un requis conditionnel dont le `showIf` n'est pas satisfait n'est pas exigé) et toute valeur de `select` hors des `options` de la définition est rejetée. La section « form » le pose automatiquement quand son champ « Formulaire lié » est rempli ; `toEmail` vide dans la définition = repli sur `FORMS_TO_EMAIL`. |

Filet de sécurité si `_requis`/`_courriels` sont absents : le serveur refuse
une soumission entièrement vide, et tout champ dont le NOM contient `email` ou
`courriel` est validé comme courriel. Le endpoint reste donc sûr même si le
formulaire n'annonce rien.

### 4.1 Champs cachés auto-peuplés (P-05)

Le `value` d'un champ de type `hidden` accepte des **jetons** (logique :
`src/lib/forms/hidden-tokens.ts`, partagée avec l'éditeur visuel) :

| Jeton | Résolu | Valeur |
| --- | --- | --- |
| `{{page.titre}}` | au build (seam `enrich` de la route campagnes) | titre de la page hôte |
| `{{page.chemin}}` | au build | chemin de la page (ex. `/fr/campagnes/demo-sections/`) |
| `{{page.slug}}` | au build | slug de la page |
| `{{page.langue}}` | au build | `fr` \| `en` |
| `{{url.utm_source}}` (ou tout `{{url.<param>}}`) | dans le NAVIGATEUR au chargement (mini-script, tronqué à 200 caractères) | paramètre de l'adresse visitée |

Règles : les jetons `{{page.*}}` se mélangent librement à du texte fixe ; un
jeton `{{url.*}}` doit être **seul et entier** dans la valeur ; tout jeton
inconnu (ou hors contexte — éditeur visuel) se résout en chaîne vide, jamais
en jeton brut. **Confiance limitée assumée** : la valeur voyage dans le POST
comme n'importe quel champ et le serveur ne peut pas la re-résoudre (le
registre connaît les formulaires, pas les pages) — c'est une valeur
**informative** du courriel de notification, soumise aux limites du §5, rien
de plus. Un champ `hidden` n'est jamais requis (un jeton peut légitimement se
résoudre en chaîne vide).

## 5. Validation côté serveur (limites du contrat)

- charge utile totale < **25 Ko** (vérifiée sur le corps brut avant analyse,
  puis revérifiée dans la fonction pure) ;
- chaque valeur < **5000 caractères** ;
- champs requis non vides ; courriels au format RFC de base
  (`quelquechose@quelquechose.tld`, sans espace) ;
- champs répétés (cases à cocher) joints par `", "` — rien n'est perdu.

Ajouts **P-05** (types étendus) :

- **cases à cocher** : le courriel montre chaque case en « oui »/« non »
  (`reflectCheckboxes`) — une case non cochée apparaît « non » en fin de
  courriel, une valeur falsifiée est normalisée « oui ». Une case REQUISE non
  cochée = champ requis manquant. Un libellé = une case unique (les groupes de
  cases partageant un libellé sont hors périmètre — même limite que « deux
  libellés identiques », §4) ;
- **select** : avec `_formId`, toute valeur hors des `options` de la
  définition est rejetée (liste blanche — le POST forgé ne choisit pas ses
  réponses). Éviter une option contenant une virgule (collision avec la
  jointure des champs répétés) ;
- **conditionnels (`showIf {field, equals}`)** : pure ergonomie navigateur
  (le champ masqué est aussi `disabled`, donc non soumis). Le serveur
  ré-évalue la condition DEPUIS LA DÉFINITION avec les valeurs soumises pour
  décider si un champ requis est exigé — **garanti pour les formulaires liés
  (`_formId`) seulement** : en mode inline, les requis conditionnels sont
  exclus de `_requis` (comportement assumé ; les filets du §4 demeurent).
  Sans JavaScript, les champs conditionnels restent visibles et, de fait,
  facultatifs (progressive enhancement). Le pilote d'une condition est une
  liste déroulante ou une case (validé au build), sans chaînage ;
- **`tel`** : aucun format imposé côté serveur (les formats de téléphone
  varient trop — champ libre court).

La logique vit dans `src/lib/forms/validation.ts` et
`src/lib/forms/registry.ts` (fonctions pures, sans dépendance Astro),
couvertes par `validation.test.ts`, `registry.test.ts` et
`hidden-tokens.test.ts` (`npm test`).

## 6. Mode démo (aucune variable SMTP2GO)

Si `SMTP2GO_API_KEY`, `FORMS_TO_EMAIL` ou `FORMS_FROM_EMAIL` manque, le
endpoint **journalise** le courriel qui aurait été envoyé (visible dans les
journaux de la Pages Function, ou dans la console `astro dev`) puis redirige
quand même vers `/<lang>/merci/`. Le parcours complet se démontre donc sans
aucun compte externe.

## 7. Turnstile — mise en service

1. Tableau de bord Cloudflare → **Turnstile** → *Add site* (widget « Managed »),
   domaine `victrix-demo.pages.dev`.
2. Reporter la **clé de site** dans `PUBLIC_TURNSTILE_SITE_KEY` (variable de
   build Pages) et la **clé secrète** dans `TURNSTILE_SECRET_KEY` (secret Pages).
3. Clés de test officielles (fonctionnent sur n'importe quel domaine, y compris
   localhost ; jetons factices `XXXX.DUMMY.TOKEN.XXXX`) :
   - site « toujours valide » : `1x00000000000000000000AA`
   - site « toujours refusé » : `2x00000000000000000000AB`
   - secret « toujours valide » : `1x0000000000000000000000000000000AA`
   - secret « toujours refusé » : `2x0000000000000000000000000000000AA`
   - secret « jeton déjà utilisé » : `3x0000000000000000000000000000000AA`
4. Un jeton ne se vérifie qu'**une seule fois** (rejeu → `timeout-or-duplicate`).
   Échec réseau vers `siteverify` = refus (« fail closed ») : un robot ne doit
   pas passer parce que Cloudflare tousse.

### CSP — modification APPLIQUÉE (2026-08-17)

`public/_headers` autorise désormais Turnstile sur `/fr/*` et `/en/*` :
`script-src`, `frame-src` et `connect-src` incluent
`https://challenges.cloudflare.com` (édition OPS-CSP planifiée, faite en même
temps que les entrées GA4 — voir `docs/operations.md` §7ter).
`PUBLIC_TURNSTILE_SITE_KEY` peut donc être posée sans autre changement ; sans
la clé, rien ne change (widget absent, pot de miel seul).

## 8. SMTP2GO — mise en service

1. Créer un compte (l'offre gratuite suffit largement pour un formulaire de
   contact : 1 000 courriels/mois, 200/jour, 25/heure tant que le domaine
   expéditeur n'est pas vérifié).
2. **Vérifier l'expéditeur** (Sender domains / Single sender emails) — sans
   quoi tout envoi est refusé. `FORMS_FROM_EMAIL` doit être cette adresse.
3. Créer une clé API (`Settings → API Keys`) → `SMTP2GO_API_KEY` (secret Pages).
4. L'appel API (encapsulé dans `src/lib/forms/smtp2go.ts`) :
   `POST https://api.smtp2go.com/v3/email/send`, en-tête
   `X-Smtp2go-Api-Key`, charge `{ sender, to: […], subject, text_body }` —
   texte brut seulement, pas de HTML (aucune injection de contenu possible).

## 9. Fichiers du chantier

| Fichier | Rôle |
| --- | --- |
| `src/pages/api/forms.ts` | endpoint GET (statut) + POST (traitement) |
| `src/lib/forms/validation.ts` | validation pure + mise en forme du courriel |
| `src/lib/forms/turnstile.ts` | vérification `siteverify` (fetch injectable) |
| `src/lib/forms/smtp2go.ts` | client d'envoi SMTP2GO (fetch injectable) |
| `src/lib/forms/*.test.ts` | tests unitaires (vitest, `npm test`) |
| `src/pages/[lang]/merci.astro` | page de remerciement FR/EN, `noindex` |
| `.env.example` | matrice des variables, commentée |

Hors de ce chantier (contrats partagés) : la section Bookshop « form »
(rendu du vrai formulaire + widget quand les variables `PUBLIC_*` sont
définies) et l'exclusion de `/merci` du sitemap (`astro.config.mjs`).

## 10. Suivis planifiés (hors périmètre de ce chantier)

- **Formulaire de la page Contact — PORTÉ le 2026-08-17** : la page suit
  désormais les DEUX MODES de la section « Formulaire » (maquette sans clés /
  vrai POST avec `PUBLIC_FORMS_ENABLED=1`), avec `_formId: contact` — le
  serveur dérive requis/courriels/cases et la liste blanche des selects de
  `src/data/forms/<lang>/contact.json`. Les `name` des champs sont dérivés de
  la définition (fieldName partagé) et DEUX GARDE-FOUS DE BUILD cassent la
  compilation si la page et la définition divergent (libellé manquant, options
  de select désalignées) — en cas d'erreur au build, réaligner les deux
  fichiers nommés par le message. **P-08 fait aussi** : `/api/forms` envoie un
  2e courriel de confirmation au visiteur (gabarit fixe par langue,
  `src/lib/forms/confirmation.ts`, échec non bloquant journalisé). Ancien
  suivi (pour mémoire) : (« pipeline prouvé sur les landings ;
  portage de la page Contact = petit suivi »).
- ~~**Case à cocher de consentement (Loi 25)**~~ — **LIVRÉ (P-05, 17 juil.)** :
  le type `checkbox` existe dans les 6 contrats synchronisés, une case requise
  doit être cochée, et le courriel reflète chaque case en « oui »/« non »
  (voir §4 `_cases` et §5). `consentText` demeure comme avis d'information
  au-dessus du bouton ; le consentement affirmatif se capture par une case
  requise dans la définition du formulaire (exemple seed :
  `campagne-evaluation`).
