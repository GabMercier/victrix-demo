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
| `_requis` | non | noms des champs requis, séparés par des virgules — chacun doit être non vide après trim |
| `_courriels` | non | noms des champs courriel, séparés par des virgules — format RFC de base exigé |
| `cf-turnstile-response` | (auto) | injecté par le widget Turnstile ; jamais repris dans le courriel |

Filet de sécurité si `_requis`/`_courriels` sont absents : le serveur refuse
une soumission entièrement vide, et tout champ dont le NOM contient `email` ou
`courriel` est validé comme courriel. Le endpoint reste donc sûr même si le
formulaire n'annonce rien.

## 5. Validation côté serveur (limites du contrat)

- charge utile totale < **25 Ko** (vérifiée sur le corps brut avant analyse,
  puis revérifiée dans la fonction pure) ;
- chaque valeur < **5000 caractères** ;
- champs requis non vides ; courriels au format RFC de base
  (`quelquechose@quelquechose.tld`, sans espace) ;
- champs répétés (cases à cocher) joints par `", "` — rien n'est perdu.

La logique vit dans `src/lib/forms/validation.ts` (fonctions pures, sans
dépendance Astro) et est couverte par `validation.test.ts` (`npm test`).

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

### CSP — modification documentée, PAS appliquée

`public/_headers` est **gelé** (chantier CSP séparé). Le widget Turnstile exige
d'ajouter à la politique existante, le jour où on l'active :

```
Content-Security-Policy:
  script-src … https://challenges.cloudflare.com;
  frame-src  … https://challenges.cloudflare.com;
```

(Le mode « pre-clearance », non utilisé ici, demanderait en plus
`connect-src 'self'`.) Tant que la CSP n'est pas modifiée, ne PAS définir
`PUBLIC_TURNSTILE_SITE_KEY` en production : le script serait bloqué par la CSP
et le formulaire retomberait sur pot de miel seul.

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

- **Formulaire de la page Contact** (`src/pages/[lang]/contact.astro`) : encore
  la maquette historique (`<form data-contact-form>` sans `action`, confirmation
  simulée par script client) — le pipeline fonctionnel n'est branché que sur
  les sections « Formulaire » des landings de campagne. Le endpoint
  `/api/forms` est agnostique au formulaire : le portage est un travail de
  gabarit seulement — poser `method="POST" action="/api/forms"` +
  `data-astro-reload`, les champs cachés du §4 (`lang`, `source`, pot de miel
  `website`, `_requis`/`_courriels`) derrière le même drapeau
  `PUBLIC_FORMS_ENABLED`, et débrancher le script de confirmation simulée dans
  ce mode (il fait `preventDefault` sur le submit). Tant que ce n'est pas
  fait : cadrer la démo en conséquence (« pipeline prouvé sur les landings ;
  portage de la page Contact = petit suivi »).
- **Case à cocher de consentement (Loi 25)** : `consentText` est un
  consentement par avis (paragraphe affiché au-dessus du bouton), défendable
  pour un formulaire de contact, mais l'union des types de champs
  (`text|email|textarea` — `src/content.config.ts`) n'offre pas de `checkbox` :
  aucun consentement affirmatif n'est capturé ni reflété dans le courriel de
  notification. Feuille de route : ajouter `checkbox` à l'énumération du
  schéma landing + `form.astro` + `_structures.form_fields`
  (cloudcannon.config.yml), et refléter l'état coché dans
  `formatSubmissionText`.
