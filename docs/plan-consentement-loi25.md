# Plan — remplacer Axeptio : gestion du consentement Loi 25

> Plan rédigé le 2026-09-18 (session de planification dédiée), revu le même
> jour contre le code et contre le paquet `vanilla-cookieconsent@3.1.0`
> (§5 « Revue »). Le site WordPress actuel utilise **Axeptio** (SaaS) ; le
> nouveau site a déjà un bandeau maison (`ConsentBanner.astro`, P-10) qui
> couvre l'essentiel mais pas le retrait du consentement. Rien n'est commencé.

> **DÉCISION DU 2026-09-21 (Gabriel) : on FINIT le bandeau maison, sans
> bibliothèque.** GA4 est le seul traceur prévu : une fenêtre de préférences par
> catégorie n'aurait rien à montrer, et la bibliothèque coûtait +15 Ko et ≈ 15
> chaînes CMS. Livré le 21/09 : choix DATÉ (`src/lib/consent/record.ts`) qui
> périme après 182 jours et se redemande, `revision` à incrémenter si la portée
> change, témoins `_ga*` effacés au refus (hôte + domaines parents), deux
> boutons de même poids visuel, peau sombre chaude, 8 tests unitaires + 6
> scénarios e2e (`tests/e2e/catalogue-temoins.spec.ts`). **Le reste de ce plan
> (Vanilla CookieConsent) ne s'applique que si un deuxième traceur revient**
> (ZoomInfo, Clarity — §5-R2). Restent hors code : R1 (pas de registre serveur,
> à écrire dans la politique), R7 (la politique nomme encore Axeptio), GA4
> branché (`PUBLIC_GA4_ID`), validation juridique.

## 1. Ce qui existe déjà

`src/components/ConsentBanner.astro` : bandeau non bloquant, Accepter/Refuser
d'égale facilité, choix en `localStorage` (`victrix-consent`), et surtout un
**contrat de gel des scripts** (`<script type="text/plain"
data-consent="analytics">`) que `BaseLayout.astro` utilise pour GA4, avec
réactivation après chaque navigation ClientRouter. Textes éditables dans
« Textes du site » (5 chaînes).

Les manques listés au §4 de `tests-seo-et-loi25-avant-deploiement.md` sont ce
que **Vanilla CookieConsent v3** (MIT) apporte :

| Manque Loi 25 | Ce que la v3 donne |
| --- | --- |
| Retrait du consentement en tout temps | modale de préférences + `data-cc="show-preferencesModal"` sur un lien de pied de page |
| Granularité + effacement des témoins au refus | catégories + `autoClear` (supprime `_ga*` au retrait de la mesure d'audience) |
| Trace du consentement | témoin horodaté (`consentId`, `revision`, catégories acceptées) — **côté navigateur seulement**, voir §5-R1 |
| Apparence « minimal assumé » à revoir | ≈ 50 variables CSS `--cc-*` → re-peau sur les jetons de la charte |

## 2. Choix d'intégration

**Retenu : `vanilla-cookieconsent` seul, intégré par nous.** Le paquet
`@jop-software/astro-cookieconsent@3.0.1` est écarté : 12 lignes qui passent
la config par `JSON.stringify` (donc aucun rappel `onConsent`/`onChange`, rien
pour le ClientRouter), dernière publication octobre 2024 pour Astro 1.x,
licence GPL-3.0. Écrire l'équivalent coûte le même temps et lève ces limites.

## 3. Points techniques tranchés

- **ClientRouter** : `run()` s'exécute une fois par session ; sur
  `astro:page-load` on (a) réactive les balises GA4 regelées par le swap (ou
  on rejoue `gtag('config')` si `window.gtag` existe), (b) appelle
  `setLanguage()` si `<html lang>` a changé (le swap recopie les attributs de
  `<html>` : le sélecteur FR/EN change la langue sans rechargement).
- **Un seul propriétaire de l'activation** : `manageScriptTags: false` ; on
  garde la logique éprouvée `activateGatedScripts`, déplacée dans
  `src/lib/consent/`, déclenchée par `cc:onConsent` / `cc:onChange` (émis sur
  `window` — vérifié dans le bundle) et `astro:page-load`.
- **Bilingue sans duplication** : textes issus de « Textes du site »
  (`src/data/site/fr.json`, `en.json`), `language.autoDetect: 'document'`.
- **CSP inchangée pour la bibliothèque** : tout est auto-hébergé (CSS groupé
  par Vite, icônes en `data:`).
- **Poids mesuré** : +10,1 Ko gzip de JS et +5,4 Ko gzip de CSS, contre ≈ 1 Ko
  aujourd'hui. C'est le vrai coût de l'opération.

## 4. Lots

**Lot 0 — décisions (15 min, Gabriel)**
- Catégories : `necessary` (Turnstile, témoin de consentement, fermeture de la
  barre d'annonce) + `analytics` (GA4). Voir §5-R2 pour Clarity et ZoomInfo.
- Nom et durée du témoin : `victrix-consent`, 182 jours (défaut) ou 12 mois.
- Au retrait : `autoClear` des `_ga*` seul, ou `autoClear` + rechargement
  (recommandé : avec rechargement, les scripts déjà en mémoire s'arrêtent).

**Lot 1 — socle technique (~3 h)** : `npm i vanilla-cookieconsent` ; module
d'initialisation `src/lib/consent/init.ts` (run + évènements + ClientRouter) ;
`src/styles/consent.css` (variables `--cc-*` → jetons) ; remplacement de
`ConsentBanner.astro` ; bascule des balises GA4 ; bouton « Gérer mes témoins »
dans `Footer.astro` et `CampaignFooter.astro` (un `<button
data-cc="show-preferencesModal">` après la liste légale — pas une entrée CMS de
lien, `navHref` refuse `#` ; le LIBELLÉ, lui, est au CMS).

**Lot 2 — textes CMS bilingues (~3 h)** : la bibliothèque demande une
quinzaine de chaînes là où le schéma en a 5 : `consent` élargi dans
`content.config.ts`, `_inputs` dans `cloudcannon.config.yml`, valeurs FR/EN,
§ « Textes du site » de `guide-edition.md`. Pièges connus : `_inputs` de
collection à plat (noms de clés distincts, jamais `title`/`text` nus) et
`empty_type: string` partout (champ vidé = `null`). Les libellés purement
a11y restent dans `ui.ts`.

**Lot 3 — vérification (~2 h)** : `tests/e2e/consentement.spec.ts` couvrant
les 8 scénarios du §4 de la doc Loi 25, build `STATIC_ONLY` + build normal,
Lighthouse a11y avec le bandeau ouvert, mise à jour du §4 de la doc.

**Total ≈ 1 jour**, hors politique de confidentialité (validation juridique +
retrait du `noindex` — le vrai point bloquant) et hors GA4 branché
(`PUBLIC_GA4_ID`). Réserve : ce lot comble le retrait du consentement et la
granularité ; il ne rend pas le site « conforme » à lui seul — le reste est
éditorial (politique, EFVP pour l'hébergement GA4 hors Québec).

## 5. Revue du 2026-09-18 (vérifiée dans le dépôt et dans le paquet)

Confirmé dans `vanilla-cookieconsent@3.1.0` : licence MIT ; 10 151 et 5 354
octets gzip ; évènements `cc:onConsent`, `cc:onChange`, `cc:onFirstConsent` ;
attribut `data-cc="show-preferencesModal"` ; options `manageScriptTags`,
`autoClear` (avec `reloadPage`), `language.autoDetect: 'document'`,
`setLanguage()` ; `translations` accepte un objet, **une URL** ou une fonction
asynchrone. Le plan tient. Sept amendements :

- **R1 — Registre de consentement.** Axeptio conserve un registre côté
  serveur ; la v3 n'écrit qu'un témoin dans le navigateur du visiteur :
  Victrix ne peut pas le produire comme preuve. Un registre demanderait un
  point de collecte (`onFirstConsent`/`onChange` → POST), impossible sur
  l'hébergement statique CloudCannon sans service externe. Décision Lot 0 :
  v1 sans registre (à écrire tel quel dans la politique et l'EFVP), à revoir
  si le juridique l'exige.
- **R2 — Traceurs du site actuel.** victrix.ca charge aujourd'hui **Microsoft
  Clarity et ZoomInfo** en plus d'Axeptio (`content-inventory.md` §14). Seul
  GA4 est prévu ici ; Clarity a été retiré de la v1 (#1451/#1494). À trancher
  au Lot 0 : ZoomInfo revient-il ? Si oui : catégorie distincte `marketing`
  (technologie d'identification : désactivée par défaut, art. 8.1) + entrées
  CSP. Ajouter une catégorie plus tard = incrémenter `revision` (tout le monde
  est redemandé).
- **R3 — Pas d'intégration Astro.** Un composant `ConsentManager.astro` avec
  un `<script>` groupé par Vite fait la même chose que trois `injectScript` :
  exécuté une fois avec le ClientRouter, CSS importé dans le script, même
  patron que `Header.astro` et l'actuel `ConsentBanner.astro`. `astro.config`
  ne grossit pas.
- **R4 — Traductions par URL, pas par import.** Importer `src/data/site/*.json`
  dans le script client contourne la normalisation zod (`null` → `""`, le bug
  CloudCannon du 15/09) et risque d'embarquer tout le fichier. Émettre deux
  points statiques (`/consent/fr.json`, `/consent/en.json`) depuis
  `getSiteText()` et donner leurs URL à `language.translations` : chargement
  paresseux de la seule langue utile, `setLanguage()` va chercher l'autre.
  `connect-src 'self'` suffit.
- **R5 — Clavier.** Vérifié dans le bundle : une fois le focus DANS le
  bandeau, Tab y boucle jusqu'au choix (sémantique de dialogue), même avec
  `disablePageInteraction: false`. Le scénario 7 (« pas de piège de focus »)
  doit être réécrit et testé au clavier + NVDA ; garder la disposition
  `bar`/`bottom`, `equalWeightButtons: true`, aucune catégorie précochée.
- **R6 — Tests.** Le serveur e2e n'a pas d'identifiant GA4, donc les balises
  gelées n'existent pas et les scénarios 2 à 5 ne se testent pas. Poser
  `PUBLIC_GA4_ID=G-E2E0000000` dans le job e2e du CI et intercepter
  `googletagmanager.com` avec `page.route` ; en local, passer par un build
  statique en copie isolée (`operations.md` §3.1).
- **R7 — Contenu à corriger.** La politique de confidentialité (FR et EN,
  section CMP) **nomme Axeptio** et renvoie vers axept.io : à réécrire en même
  temps que la bascule (Julie + juridique), sinon la politique décrit un outil
  qui n'existe plus.

Options non retenues par défaut : charger la bibliothèque seulement pour les
visiteurs sans choix ou au clic sur « Gérer mes témoins » (l'activation étant
à nous, un visiteur qui a déjà choisi n'a pas besoin des 10 Ko) — à mesurer
d'abord ; ne pas lancer `run()` dans l'éditeur visuel CloudCannon.
