# Tests SEO et Loi 25 avant déploiement

> Rédigé le 2026-09-17 à la suite de deux questions de Julie : le H1 caché
> (champ « H1 SEO ») est-il bien perçu par les moteurs et les outils SEO, et
> que reste-t-il pour valider la bannière Loi 25 ? Réponses courtes d'abord,
> puis le plan de tests à dérouler avant la bascule du domaine.

## 1. Le H1 caché — verdict

**Ce que fait le site.** Le grand titre du héros est le `<h1>` de chaque page.
Le champ « H1 SEO » (réglages de page) est une **exception** : rempli, il
émet un `<h1>` masqué visuellement (classe `sr-only`, lu par les moteurs et
les lecteurs d'écran) et le grand titre passe en `<h2>`. Un garde-fou de
build refuse toute page à 0 ou 2 H1. Au 2026-09-17, le champ est rempli sur
**deux pages de démonstration seulement** (`demo-sections` FR/EN, non
indexées) : toutes les pages réelles ont leur H1 visible.

**Ce que disent les moteurs.**

- Google ne pénalise le texte masqué que s'il est **trompeur** (bourrage de
  mots-clés, texte invisible différent de ce que voit le visiteur). Un H1
  descriptif masqué pour une raison de mise en page n'enfreint pas les
  règles anti-spam. Google indique toutefois accorder **moins de poids** au
  texte non visible, et le H1 n'est qu'un signal mineur : le `<title>`, la
  description et le contenu comptent bien davantage.
- Les outils d'audit (Screaming Frog, Semrush, Ahrefs, Lighthouse) lisent le
  DOM : ils comptent ce H1, aucun « H1 manquant » ne sera signalé. Certains
  outils signalent un H1 non visible comme avertissement, pas comme erreur.

**Recommandation.** Garder la règle actuelle : **le H1 est le titre visible
du héros** (c'est déjà le cas partout). Réserver « H1 SEO » aux cas où le
titre marketing ne peut vraiment pas porter le mot-clé, et préférer alors
reformuler le titre visible. Si l'équipe veut zéro zone grise, deux options
à trancher : retirer le champ, ou le rendre **visible** en surtitre du héros
(l'approche « élément qui porte le H1 » retirée le 16 septembre).

**Options et coûts (mesurés le 2026-09-17 sur le code et le contenu).**

| Option | Ce que voit le visiteur | Coût | Avis |
|---|---|---|---|
| A. Statu quo : « H1 SEO » masqué, exception | rien ne change | 0 | zone grise, mais inutilisée sur les pages réelles |
| B. Retirer le champ : le H1 est toujours le grand titre du héros | rien ne change | ~1 h (page.astro, 4 schémas, 4 entrées CMS, 4 gabarits, clé retirée de 86 fichiers, guide) | **recommandé** : aucune ambiguïté, le mot-clé va dans le « Titre SEO » et le titre du héros |
| C. H1 sur le surtitre (petit texte au-dessus du titre), au choix par page | le petit surtitre devient le H1, le grand titre un H2 ; styles inchangés | ~½ j (recréer le select retiré le 16 sept. sur les 4 héros + schémas + spécifications + guide, et nettoyer le champ « H1 SEO ») | légitime techniquement (la taille CSS n'a aucune importance pour Google ni pour les lecteurs d'écran), mais **18 des 41 pages FR n'ont pas de surtitre** et « Écosystème Microsoft 365 » sert de surtitre à 6 pages, « Services » à 3 : des H1 identiques d'une page à l'autre, ce que les outils SEO signalent en « H1 dupliqué » |

Pourquoi B suffit : le H1 pèse peu ; ce qui compte est le `<title>` (champ
« Titre SEO »), la description et le contenu. La règle éditoriale du guide
(§ « Bien référencer une page ») demande déjà que le titre du héros porte le
mot-clé principal ; si un titre marketing ne le fait pas, c'est le titre
qu'on ajuste, pas la balise.

**Comment on le confirmera.** Après la bascule, Search Console →
Inspection de l'URL → « Afficher la page explorée » montre le HTML rendu par
Google, H1 compris. Dès maintenant, l'outil Google « Test des résultats
enrichis » (search.google.com/test/rich-results) sur
`https://vocal-wren.cloudvent.net/fr/services/demo-sections/` (la page démo
qui porte le H1 masqué ; l'en-tête noindex n'empêche pas le test) affiche
le HTML rendu par Google : chercher `<h1 class="sr-only">` dans l'onglet
« HTML ». Le crawl Screaming Frog (§3.1) donne la colonne H1-1 de chaque
page.

**Où tester le score SEO.** Aucune URL publique ne convient aujourd'hui :
les sites CloudCannon (`*.cloudvent.net`) portent l'en-tête noindex (§2), et
la préversion Cloudflare `victrix-demo.pages.dev`, qui n'a pas cet en-tête,
est **périmée** (404 sur les routes actuelles au 2026-09-17, lien avec le
dépôt vraisemblablement perdu) : ne pas s'y fier. Deux voies : la recette
locale du §2 (résultat ci-dessous), ou relier de nouveau le projet
Cloudflare Pages à la branche `dev` (tableau de bord Cloudflare, ~15 min),
en sachant que cette préversion est alors explorable et indexable par
Google (aucun en-tête noindex, `robots.txt` ouvert) — infrastructure
héritée à décommissionner à la bascule.

## 2. Pourquoi Lighthouse affiche ~70 en SEO sur cloudvent

Un seul audit échoue : **« is-crawlable »**, parce que l'hébergement
CloudCannon pose l'en-tête `X-Robots-Tag: noindex` sur tous les domaines
`*.cloudvent.net`. Tous les autres audits SEO passent. Ce score ne dit rien
du futur site sur `victrix.ca`. La preuve se fait en auditant **le même
build servi sans cet en-tête** (recette ci-dessous) — résultat du
2026-09-17 en §3.1.

Recette (copie isolée, serveur statique local, Chromium de Playwright) :

```powershell
# 1. copie + build statique (docs/operations.md §3.1)
cd C:\Users\<vous>\vvbuild ; $env:STATIC_ONLY = '1' ; npm run build
# 2. servir dist sans en-tête noindex
python -m http.server 4399 --directory dist
# 3. auditer (autre terminal)
npx lighthouse http://localhost:4399/fr/ --only-categories=seo,accessibility,best-practices `
  --chrome-path="$env:LOCALAPPDATA\ms-playwright\chromium-1228\chrome-win64\chrome.exe" `
  --chrome-flags="--headless=new" --output=json --output-path=lh-fr.json --quiet
```

## 3. Plan de tests SEO

### 3.1 Avant déploiement (sur le build, faisable dès maintenant)

| # | Test | Outil | Attendu |
|---|---|---|---|
| 1 | Lighthouse SEO / accessibilité / bonnes pratiques sur 5 pages types (accueil, service, article, contact, ressources) | recette §2 | SEO 100, a11y ≥ 95 |
| 2 | Un seul H1 par page | garde-fou `victrix:h1-guard` au build | « 0 sans » dans le journal de build |
| 3 | Inventaire des pages `noindex` | commande ci-dessous sur `dist` | liste = décision éditoriale (voir remarque) |
| 4 | Titres et descriptions : présents, uniques, longueur (≤ 60 / 120-155) | Screaming Frog (gratuit ≤ 500 URL) sur staging | 0 doublon, 0 vide |
| 5 | Canonical + hreflang FR/EN réciproques | Screaming Frog, onglet Hreflang | 0 erreur |
| 6 | Données structurées (Organization, LocalBusiness ×3, Article, FAQPage) | Test des résultats enrichis + Schema Markup Validator sur URL cloudvent | 0 erreur |
| 7 | Liens internes cassés, images sans alt | Screaming Frog | 0 lien 404 |
| 8 | Aperçus de partage | LinkedIn Post Inspector, X Card Validator, Facebook Debugger | image + titre corrects (déjà dans DEPLOYMENT §7) |

Inventaire `noindex` sur un build (PowerShell, dans `dist`) :

```powershell
Get-ChildItem -Recurse -Filter index.html | Where-Object { (Get-Content $_.FullName -Raw) -match 'name="robots" content="noindex' } | ForEach-Object { $_.DirectoryName.Replace((Get-Location).Path, '') }
```

Remarque importante : au 2026-09-17, **28 fichiers de contenu** portent
`noindex: true`, dont des pages qu'on voudra probablement indexer (Découvrir,
Expertises, Services, Produits, Secteurs, Tarification, Centre de confiance,
politiques). Certaines sont des ébauches, d'autres ont été passées en
noindex par précaution. **À revoir page par page avant la bascule** : c'est
la décision SEO la plus lourde de conséquence du go-live.

**Résultat de l'audit local du 2026-09-17** (build `cb04f6d`, `STATIC_ONLY`,
servi sans en-tête noindex, Lighthouse 12.8 / Chromium Playwright ; rapports
JSON conservés hors dépôt) :

| Page | SEO | Accessibilité | Bonnes pratiques | Constats |
|---|---|---|---|---|
| /fr/ (accueil) | 100 | 96 | 100 | contraste : étiquette de catégorie des cartes d'articles (gris #9CA3AF, 10 px) |
| /fr/services/cybersecurite/ | 100 | 96 | 100 | même étiquette + date `<time>` des cartes d'articles liés |
| /fr/ressources/audit-cybersecurite/ (article) | 100 | 98 | 100 | ordre des titres : un `<h4>` sous un `<h2>` dans le texte migré |
| /fr/contact/ | 100 | 96 | 100 | contraste : numéros de téléphone bleu `primary` sur les cartes beiges |
| /fr/ressources/ | 100 | 100 | 100 | — |
| /fr/services/demo-sections/ (page démo, H1 caché) | 69 | 96 | 100 | seul échec SEO = `is-crawlable`, dû au `noindex` **de la page**, pas au H1 ; aucun avertissement d'accessibilité sur les titres |

Lecture : le « 70 » vu sur cloudvent est exactement le cas de la dernière
ligne, généralisé à tout le site par l'en-tête de l'hébergeur. Les trois
constats d'accessibilité sont des retouches de design (deux couleurs, un
niveau de titre dans un article) — à traiter pour viser 100 partout, mais
sans effet sur l'indexation.

Inventaire `noindex` du même build : **49 pages** sur 162, dont les attendues
(merci, campagnes, recherche, portail, style-guide, stubs de redirection,
pages démo) **et** les pages de contenu listées plus haut (Découvrir,
Expertises, Services, Produits, Secteurs, Tarification, Centre de confiance,
politiques, trois services en ébauche). Pages à H1 masqué : les deux pages
démo seulement.

### 3.2 Le jour de la bascule

- `site:` dans `astro.config.mjs` et `Sitemap:` de `public/robots.txt` →
  domaine réel (aujourd'hui `victrix-demo.pages.dev`).
- `.cloudcannon/routing.json` en place : redirections 301 (matrice #1503)
  et en-têtes de sécurité ; vérifier `curl.exe -I https://victrix.ca/fr/` :
  **aucun** `X-Robots-Tag: noindex`, un `Content-Security-Policy` présent.
- Tester la matrice 301 (ancienne URL → nouvelle) par script, pas à la main.
- Soumettre `sitemap-index.xml` dans Google Search Console et Bing Webmaster
  Tools ; demander l'indexation de l'accueil FR/EN.
- Lighthouse sur le domaine réel : SEO 100 attendu.

### 3.3 Après la bascule (J+7 et J+30)

- Search Console : couverture (pages indexées vs exclues « noindex » —
  les exclues doivent être exactement la liste voulue : merci, campagnes,
  recherche, portail, style-guide), erreurs d'exploration, hreflang.
- Core Web Vitals réels (rapport « Expérience »), requêtes et pages
  d'atterrissage ; comparer au trafic WordPress des 3 mois précédents.
- Rich results : onglet « Améliorations » (FAQ, fil d'Ariane, Organisation).

## 4. Bannière Loi 25 — état et reste à faire

**En place (code)** : bandeau sur toutes les pages, textes éditables dans
« Textes du site », lien vers la politique de confidentialité, boutons
Accepter / Refuser d'égale facilité, choix mémorisé (`localStorage`),
**aucun script analytique chargé avant acceptation** (balises GA4 gelées,
activées seulement après « Accepter », y compris après une navigation
interne), refus = rien ne se charge, aucune police ni iframe tierce au
rendu (vidéos en « iframe au clic »), région nommée pour les lecteurs
d'écran, bandeau non bloquant.

**Reste à faire**

1. **Retrait ou modification du consentement** — la loi exige de pouvoir
   retirer son consentement en tout temps ; aujourd'hui, une fois le choix
   fait, rien ne permet de rouvrir le bandeau. À ajouter : un lien « Gérer
   mes témoins » dans le pied de page (à côté de Politique de
   confidentialité) qui efface le choix et réaffiche le bandeau ; au refus
   après acceptation, les scripts cessent au rechargement. Petit lot de
   code (~1 h).
2. **GA4 réellement branché** (`PUBLIC_GA4_ID`, lot 3 du plan formulaires)
   — sans lui, le bandeau ne gère rien de concret et la vérification réseau
   n'a pas d'objet.
3. **Validation juridique des textes** : le texte du bandeau (« Nous
   utilisons des témoins… conformément à la Loi 25 ») et la **politique de
   confidentialité**, encore le texte WordPress de 2023 et toujours en
   `noindex`. Points à couvrir dans la politique : liste des témoins et
   stockages (GA4 après consentement ; `victrix-consent` et fermeture de la
   barre d'annonce = fonctionnels, sans consentement), finalité de la mesure
   d'audience, hébergement des données GA4 hors Québec (transfert à
   documenter côté Victrix : évaluation des facteurs relatifs à la vie
   privée), durée de conservation, nom et coordonnées du responsable de la
   protection des renseignements personnels, droit de retrait. Puis retirer
   le `noindex` de la politique et des conditions.
4. **Anti-pourriel Turnstile** (lot 2) : à mentionner comme service
   strictement nécessaire (aucun consentement requis, aucun témoin de
   suivi), dans la politique.
5. **Apparence du bandeau** : design « minimal assumé » (jetons de la charte,
   feuille scopée) — à valider ou à refaire en utilitaires, décision design.

**Tests d'acceptation (à dérouler sur le site dev une fois GA4 posé)**

| # | Scénario | Attendu |
|---|---|---|
| 1 | Première visite, aucun choix | bandeau visible ; onglet Réseau : **aucune** requête `googletagmanager.com` ni `google-analytics.com` |
| 2 | Clic « Accepter » | bandeau disparaît ; requêtes `gtag/js` puis `collect` ; `localStorage.victrix-consent = accepted` |
| 3 | Rechargement puis navigation interne | bandeau absent ; `collect` à chaque page (suivi SPA) |
| 4 | Clic « Refuser » (autre navigateur/privé) | bandeau disparaît ; **aucune** requête analytique, même après navigation |
| 5 | « Gérer mes témoins » (après le lot 1 ci-dessus) | bandeau revient ; refus → plus de `collect` après rechargement |
| 6 | JavaScript désactivé | rien ne se charge ; le site reste lisible |
| 7 | Clavier + lecteur d'écran | région annoncée, deux boutons atteignables, pas de piège de focus |
| 8 | Page Merci après un envoi de formulaire (accepté) | événement `generate_lead` dans GA4 DebugView ; rien si refusé |
