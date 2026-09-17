# Plan de match — formulaires CloudCannon (boîte), captcha, analytics

> Rédigé le 2026-09-17, après la validation du mode « inbox » sur le site dev
> (vocal-wren.cloudvent.net, boîte `dev-marketing-contact`). Cinq lots courts,
> chacun livrable et vérifiable seul. Les options sont listées à part : à
> retenir ou non, jamais imposées.

## Réponses aux questions du 2026-09-17

| Question | Réponse |
|---|---|
| Étiquettes dans la boîte CloudCannon ? | **Non.** La boîte n'offre que les onglets Tous / Envoyés / En attente / Pourriel / En erreur, un export et une modale par soumission (onglets Données / Cibles). Aucun tri par champ, aucune étiquette. |
| Pousser des infos à la soumission ? | **Oui**, tout champ caché voyage et s'affiche dans la boîte et le courriel. Aujourd'hui : `lang`, `source`, `cta`, `provenance`. À ajouter : `utm_*`, référent (lot 1, option). |
| Personnaliser le courriel ? | **Partiellement.** Deux champs spéciaux : `_subject` (objet) et `_replyto` (répondre au visiteur). Le corps (tableau des champs, dans l'ordre du formulaire, sous le `name` HTML) n'est pas modifiable. |
| Classement « par type » ? | Par l'objet structuré (`_subject`) → règles/étiquettes dans Gmail ou Outlook ; ou une boîte CloudCannon par famille (RH, marketing) via `inbox_key` ; ou une cible webhook (Zapier/Make/Slack) vers un CRM ou Teams. |
| Listes « De quoi… » et « Service » non préremplies ? | Le mécanisme (`contactSujet`/`contactService`, `data-contact-*` sur `<body>`, `src/lib/contact/presets.ts`) est **dans le dépôt local, non commité** : `origin/dev` = f3a7974 (cta + page d'origine seulement). Le site dev ne peut pas l'avoir. |

## Lot 0 — Déployer l'existant (0 code)

- [ ] Commiter/pousser le préremplissage des listes (BaseLayout, presets.ts, routes services et pages, content.config, cloudcannon.config, schémas).
- [ ] CloudCannon → Formulaires → Contact (FR) → vider « Boîte de réception CloudCannon (clé) » (`dev-marketing-contact` y est codé en dur : staging/prod viseraient la boîte dev). La variable `PUBLIC_FORMS_INBOX_KEY` de chaque site prend le relais.
- [ ] Vérifier sur le site dev : un bouton d'une page de service → Contact arrive avec « Un projet » + le service de la famille ; une page générale ne préremplit que si `contactSujet`/`contactService` sont réglés dans le CMS (onglet de la page).

Contrôle :
```powershell
curl.exe -s https://vocal-wren.cloudvent.net/fr/services/ | Select-String -Pattern 'data-contact-'
curl.exe -s https://vocal-wren.cloudvent.net/fr/contact/ | Select-String -Pattern 'inbox_key'
```

## Lot 1 — Courriel et boîte plus lisibles (mode inbox seulement, ~0,5 j)

Fichiers : `component-library/src/components/form/form.astro`,
`src/pages/[lang]/contact.astro`, `src/pages/[lang]/ressources/index.astro`,
`src/lib/forms/mode.ts` (+ tests).

- [ ] `_subject` : champ caché = `subject` de la définition (ex. « Message du site — formulaire de contact ») ; mini-script (même patron que la bannière d'erreur) qui compose à la soumission « [Contact] Une carrière · Services applicatifs — Prénom Nom ». Sans JS : l'objet fixe.
- [ ] `_replyto` : champ caché recopié depuis le champ courriel (mini-script). Répondre au courriel de notification répond au visiteur.
- [ ] Pot de miel : `website` → `_gotcha` en mode inbox (CloudCannon ne filtre que ce nom ; le nôtre est ignoré et s'affiche « left blank » dans le courriel).
- [ ] Champs cachés APRÈS les champs visibles (le courriel commence par prénom/nom, pas par lang/source) ; `_formId` retiré en mode inbox (propre au worker).
- [ ] Test : soumission dev → objet et Reply-To corrects, `_gotcha` rempli → onglet Pourriel.

Options (à décider) :
- `name` = libellé humain en mode inbox (« Prénom » au lieu de `prenom` dans le courriel). Coût faible, mais divergence avec le worker.
- Provenance enrichie : `utm_source`, `utm_medium`, `utm_campaign`, référent (`document.referrer`), page d'atterrissage — champs cachés remplis au chargement. Les sections « Formulaire » du CMS le font déjà avec `{{url.utm_source}}` ; la page Contact est codée à la main.
- Objet piloté par l'éditrice : `_subject` prend le nom d'un champ « Objet du courriel » de la définition (déjà présent : `subject`).

## Lot 2 — Captcha Turnstile (~0,5 j + comptes)

Recommandation : **Turnstile** (code déjà en place, pas de script Google avant consentement, Loi 25). reCAPTCHA v3 exigerait un script d'interception supplémentaire.

Code (avant tout réglage CloudCannon, sinon 401 sur toutes les soumissions) :
- [ ] Rendre le widget en mode inbox aussi (aujourd'hui `backend === 'worker'` dans les 3 gabarits) — `PUBLIC_TURNSTILE_SITE_KEY` posée ET backend ≠ none.
- [ ] `mode.ts` : fonction `turnstileSiteKey(backend, env)` partagée + tests ; commentaires d'entête mis à jour ; `docs/formulaires.md` §3/§7.
- [ ] E2E : le widget est absent en maquette (invariant existant), présent avec les deux variables.

CloudCannon / Cloudflare :
1. Cloudflare (compte Victrix) → Turnstile → Add widget « Managed », hostnames : `vocal-wren.cloudvent.net`, `lawful-hare.cloudvent.net`, `overt-pineapple.cloudvent.net`, `victrix.ca`.
2. Org Settings → Hosting → Forms → boîte → Manage → provider **Turnstile**, clé de site + clé secrète (remplace les clés reCAPTCHA stockées).
3. Site dev → Builds → `PUBLIC_TURNSTILE_SITE_KEY=<clé de site>` → build → widget visible sous le formulaire.
4. Site dev → Hosting → Forms → lien boîte → cocher **Require CAPTCHA**.
5. Test : soumission normale → /fr/merci/ ; soumission sans jeton (curl) → page 401 CloudCannon.

Limite à connaître : un échec captcha affiche une page 401 CloudCannon, pas notre bannière. Acceptable (cas robots) ; le widget « Managed » ne demande une interaction qu'aux visiteurs suspects.

## Lot 3 — Google Analytics 4 (0 code, ~2 h)

1. Admin GA4 → propriété « Victrix » → flux Web (victrix.ca) → ID de mesure `G-…`.
2. Site dev → Builds → `PUBLIC_GA4_ID=G-…` → build.
3. Vérifier (onglet Réseau) : aucune requête google-analytics avant d'accepter le bandeau ; requêtes `collect` après ; DebugView montre `page_view` et, après une soumission, `generate_lead` (page Merci).
4. Admin GA4 → Événements → marquer `generate_lead` comme événement clé.
5. Reporter la variable sur staging et prod au moment voulu (la même propriété ou une propriété de test : décision Victrix).

Options :
- Distinguer le formulaire dans GA : action = `/fr/merci/?f=contact` et `generate_lead` avec `form_id` (petit changement dans `mode.ts` + merci.astro).
- Mesure améliorée GA4 (`form_start`/`form_submit`) : réglage GA seulement.

## Lot 4 — Go-live (déjà au backlog, rappel)

- `.cloudcannon/routing.json` : les en-têtes CSP doivent garder `challenges.cloudflare.com` (Turnstile) et `googletagmanager.com` / `*.google-analytics.com` (GA4), déjà présents dans `public/_headers`. Aujourd'hui CloudCannon n'applique aucune CSP : rien ne bloque.
- Boîtes staging/prod : créer les boîtes (ex. `prod-marketing-contact`), cibles courriel validées, lien site ↔ boîte, variables de build par site.
- Limite CloudCannon : 2 250 soumissions/mois/boîte.

## Ordre proposé

Lot 0 → Lot 1 → Lot 2 → Lot 3 (les lots 1 à 3 sont indépendants ; 2 et 3 peuvent se faire en parallèle si les comptes sont prêts). Lot 4 suit le calendrier go-live existant.
