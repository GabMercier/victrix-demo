# Analyse des critères marketing/webmestre — nouvelle pile vs WordPress

> Réponse au document `critères.md` (13 juillet 2026), croisée avec le
> [cahier des charges de l'agence](https://alanallman.madebywalter.com/cahier-des-charges-victrix-final.html)
> (WordPress + Elementor Pro) et la `Proposition-Refonte-victrix.docx` (Astro +
> Sveltia). Chaque critère est évalué honnêtement : ce qui est natif, ce qui est
> à construire, et ce qui est un vrai compromis.

## Synthèse

| # | Critère | Verdict | En bref |
|---|---|---|---|
| 1 | Éditeur visuel complet | ⚠️ Compromis — plan B validé | Éditeur structuré avec aperçu en direct (déjà en place); édition visuelle sur la page = Tina, désormais sans React sur Astro (gratuit → 49 $US/mois), à valider par un spike |
| 2 | Mode preview / partage non public | ✅ Point fort | URL de prévisualisation par branche, partageable, non indexée, protégeable par mot de passe — offert par l'hébergement |
| 3 | Types de contenus (services, expertises…) | ✅ Natif | Collections typées Astro = l'équivalent des CPT, sans plugin; blog + accueil déjà en place |
| 4 | Landing pages | 🔧 À construire une fois | Collection « landing » à sections composables; ensuite le marketing est autonome |
| 5 | URLs + contrôle d'indexation | ✅ Point fort | Slugs par langue déjà implémentés; drapeau `noindex` par page (méta + exclusion sitemap) |
| 6 | Formulaires style Gravity Forms | 🔧 Le vrai chantier | Rendu + fonction d'envoi (Turnstile, SMTP2GO, notifications, page de remerciement); à noter : le GF actuel est bogué |
| 7 | SEO personnalisé (schema.org) | ✅ Point fort | JSON-LD sur mesure par gabarit, sans Schema Pro ni Yoast Premium; hreflang/canonical/sitemap déjà en prod sur le prototype |
| 8 | Redirections personnalisables | ✅ Natif | Fichier `_redirects` versionné (déjà utilisé); collection « redirections » exposable dans l'éditeur pour l'autonomie marketing |
| 9 | Clarity + compression d'images | ✅ Natif | Clarity = une balise script (via bandeau de consentement Loi 25); Smush inutile : Sharp convertit WebP/AVIF au build |
| 10 | Responsive + règles d'affichage | ✅ Par construction | Le responsive est garanti par les gabarits, testé une fois, hérité partout — personne n'a à le gérer page par page |

**Bilan : 7 critères natifs ou plus forts que WordPress, 2 chantiers ciblés
(landing pages, formulaires), 1 compromis assumé avec plan B (édition visuelle).**

---

## Analyse critère par critère

### 1) Éditeur visuel assez complet — ⚠️ le seul vrai compromis

**Ce qui existe déjà** : Sveltia est configuré sur le prototype — édition FR/EN
côte à côte, aperçu en direct pendant la frappe, glisser-déposer d'images,
champs structurés (le hero, les expertises, les partenaires de l'accueil sont
déjà éditables).

**L'écart honnête** : ce n'est pas un constructeur de page. On ne glisse pas des
blocs pour composer une mise en page libre.

**Pourquoi c'est voulu** : le cahier des charges de l'agence exige lui-même « un
seul style de bouton », une palette documentée, des espacements normalisés — un
design system. Or c'est la liberté du constructeur qui a produit le site actuel
(pages jusqu'à 55 Mo, incohérences relevées par l'audit). L'éditeur structuré
*garantit* le design system que le cahier des charges réclame ; Elementor le
*recommande* et laisse chacun le casser.

**Plan B — désormais validé techniquement** : **Tina** offre le
clic-sur-la-page avec aperçu temps réel, sur la même architecture (Astro +
Git). Depuis `@tinacms/astro`, l'édition visuelle fonctionne **sans React**
dans les pages (Astro re-rend la section éditée pendant la frappe), et Astro
est devenu le starter par défaut de TinaCMS. Coût : gratuit jusqu'à 2
utilisateurs ; forfait Team 29 $US/mois (3 sièges) ; Team Plus 49 $US/mois
ajoute le **workflow éditorial** (brouillons, file de révision, préproduction
par branche — voir critère 2). Le contenu reste dans le dépôt Git de Victrix ;
Tina Cloud n'héberge que l'authentification et l'API d'édition. Réserve : le
support Astro est récent — un **spike de 1 à 2 jours** sur nos gabarits réels
(routes [lang], transitions de vue, méga-menu) avant d'annoncer le pivot.
Comparateur à inclure dans le spike : **CloudCannon** (45 $US+/mois), dont
l'outillage Bookshop est conçu précisément pour la composition visuelle de
pages Astro à partir d'une bibliothèque de composants. On change d'éditeur,
pas de fondation — les collections, schémas et gabarits sont réutilisés tels
quels.

### 2) Mode preview / partage de contenu non public — ✅ plus fort que WordPress

Chaque branche du dépôt produit automatiquement une **URL de prévisualisation
complète du site** (`https://<branche>.victrix-demo.pages.dev`) :

- partageable par lien à n'importe qui (interne, direction, client) ;
- **non indexée automatiquement** (en-tête `X-Robots-Tag: noindex` sur les
  déploiements de prévisualisation) ;
- protégeable par authentification (Cloudflare Access) au besoin ;
- identique au site final au pixel près — ce n'est pas un « aperçu », c'est le
  vrai site construit à partir de la branche.

À comparer : dans WordPress, un lien de prévisualisation exige une session
connectée (ou un plugin de plus, type Public Post Preview). Un drapeau
`brouillon` dans l'éditeur complète le flux : exclu du build de production,
visible dans l'aperçu CloudCannon, et visible sur les préversions de branche
**si** la variable de build `DRAFTS_VISIBLE` est posée sur l'environnement de
préversion Cloudflare Pages (jamais en production — voir `.env.example`).

### 3) Facilité de créer différents types de contenus — ✅ natif

Le plan de l'agence (CPT Services, CPT Expertises, CPT Ressources) se transpose
exactement en **collections de contenu Astro** — mais typées et validées : un
champ manquant ou une image absente **bloque la publication avec un message
clair**, au lieu de casser silencieusement une page en production.

Déjà en place : collections `blog` et `home` (schéma + éditeur + gabarits).
Ajouter « services », « expertises », « équipe » = un schéma + un gabarit
chacun, puis le marketing crée les entrées à volonté dans l'éditeur. Dans
WordPress, la même chose exige un plugin (ACF/CPT UI) ou du code de thème — que
Victrix ne possèderait pas.

### 4) Création de landing pages — 🔧 à construire une fois, ensuite autonome

Le patron proposé : une collection « landing » dont chaque entrée est une liste
de **sections composables** (hero, bénéfices, témoignage, FAQ, formulaire,
bandeau CTA…). Le marketing choisit et ordonne les sections dans l'éditeur,
remplit les champs ; le gabarit garantit la forme.

Chaque landing obtient : son URL au choix, ses métadonnées propres, son drapeau
`noindex` (voir #5), son formulaire contextuel (voir #6). C'est le « page
builder avec garde-fous » : la souplesse d'Elementor pour composer, sans la
possibilité de casser la charte. Effort : un chantier d'un ou deux jours pour la
bibliothèque de sections initiale, extensible ensuite section par section.

### 5) Gestion des URLs et de l'indexation — ✅ plus fin que Yoast

- **URLs** : déjà implémenté au prototype — chaque contenu a son slug par langue
  (le FR garde ses URLs actuelles, l'EN a les siennes), les anciennes URLs sont
  redirigées en 301.
- **Indexation** : un champ `noindex` par page/landing dans l'éditeur →
  méta `robots` + **exclusion du sitemap**, les deux en cohérence garantie
  (générés du même drapeau). Exactement le besoin « campagnes internes non
  indexées ». `robots.txt` déjà en place (exclut `/admin/`).
- Bonus : tout changement d'URL ou d'indexation est **versionné et relisible**
  (qui, quand, quoi) — dans WordPress c'est une case Yoast modifiable sans trace.

### 6) Formulaires style Gravity Forms — 🔧 le vrai chantier, entièrement réalisable

Le besoin réel du cahier des charges : contact, demande de devis, téléchargement
de livres blancs (gating), formulaires contextuels par service — avec
notifications, page de remerciement, anti-pourriel, consentement Loi 25.

L'architecture proposée (sans licence) :

1. **Formulaires définis comme du contenu** dans l'éditeur (champs, libellés,
   validations, destinataire des notifications, page de remerciement) — le
   marketing compose ses formulaires comme dans Gravity Forms.
2. **Rendu accessible** par un composant unique (labels, erreurs ARIA, champs
   requis — exigences WCAG du cahier des charges).
3. **Envoi via une fonction serveur** (Pages Functions sur l'hébergement
   actuel; équivalent Azure Functions si Azure) : anti-pourriel **Turnstile**
   (gratuit, sans case à cocher — remplace reCAPTCHA), notification courriel
   via l'API **SMTP2GO** (compte déjà connu de Victrix, 1000 courriels/mois
   gratuits), copie de confirmation au visiteur, redirection vers la page de
   remerciement.
4. Optionnel : archivage des soumissions (tableau consultable) et relais vers
   Power Automate / Dataverse — déjà dans la feuille de route de la proposition.

**À rappeler aux sceptiques** : le Gravity Forms actuel a sa **redirection de
remerciement cassée** et le **SMTP n'est pas configuré** (voir `critères.md`) —
la solution « clé en main » ne livre pas ces fonctions aujourd'hui. Ici, elles
font partie de la conception initiale.

**Concession honnête** : pour du multi-étapes complexe, des paiements ou des
centaines de formulaires, Gravity Forms reste plus riche. Le besoin Victrix
(3 à 6 formulaires corporatifs) est très en deçà de ce seuil.

### 7) SEO personnalisé, schema et structured data — ✅ point fort

Le cahier des charges demande LocalBusiness, Organization, Service, FAQPage,
Article — et prévoit d'acheter **Schema Pro + Yoast Premium** pour les produire.
Sur la nouvelle pile, le JSON-LD est **émis par les gabarits à partir du contenu
structuré lui-même** : chaque page service émet son bloc `Service` + `FAQPage`,
chaque article son bloc `Article` + fil d'Ariane, automatiquement, sans licence,
et sans risque de désynchronisation entre le contenu et son balisage.

Déjà en production sur le prototype : hreflang FR/EN, canoniques, sitemap
bilingue, Open Graph. Le SEO actuel étant le point fort du site (92), la
migration le **préserve** (URLs + 301, voir #5) puis l'**améliore** (Core Web
Vitals, voir plus bas — la vitesse est un facteur de classement).

### 8) Outil de redirection personnalisable — ✅ natif

Trois niveaux, déjà partiellement en service :

1. Fichier **`_redirects`** (301/302, jokers, par langue) — le mécanisme de
   l'hébergement, déjà utilisé pour les URLs pré-bilinguisme du prototype.
2. **Collection « redirections » dans l'éditeur** : le marketing ajoute
   `ancienne URL → nouvelle URL` dans une interface simple, le build la
   convertit et **valide** (cible existante, pas de boucle) — un garde-fou que
   le plugin Redirection n'offre pas.
3. Redirections en masse au niveau DNS/CDN pour les cas de domaine.

Chaque redirection est versionnée — l'historique complet de la matrice 301
exigée par le cahier des charges, gratuit.

### 9) Microsoft Clarity + compression d'images — ✅ natif, et révélateur

- **Clarity** : une balise script — fonctionne sur n'importe quel HTML. Elle
  sera branchée au **bandeau de consentement Loi 25** (Clarity enregistre les
  sessions → consentement requis), ce que le cahier des charges exige de toute
  façon.
- **Compression d'images** : Smush existe **parce que** WordPress ne le fait pas
  nativement. Sur la nouvelle pile, le pipeline (Sharp) convertit en WebP/AVIF,
  génère les tailles responsives et le chargement différé **au build,
  systématiquement** — c'est ce qui corrige le LCP de ~50 s constaté sur le
  sous-domaine Ø Studio. Sveltia optimise aussi les images à l'upload. Résultat :
  la fonction de Smush Pro (payant), sans outil, sans oubli possible.

Ce critère illustre le fond du débat : **on nous demande des outils dont le rôle
est de compenser WordPress. La nouvelle pile rend la compensation inutile.**

### 10) Affichages mobile/tablette/desktop et règles — ✅ par construction

Dans Elementor, le responsive est **à la charge de l'éditeur** : réglages par
widget et par point de rupture, à refaire page par page, cassables à chaque
modification (le cahier des charges exige d'ailleurs « responsive 5 tailles
d'écran » comme livrable à vérifier).

Sur la nouvelle pile, le responsive est **conçu une fois par gabarit** (tokens,
typographie fluide, grilles adaptatives), testé, puis **hérité par toutes les
pages** — y compris celles créées dans deux ans. Le marketing n'a jamais à gérer
un point de rupture ; c'est une charge qui disparaît, pas une capacité perdue.
Pour les besoins réels de règles d'affichage (masquer une section sur mobile,
variante de CTA), les sections exposent des options explicites dans l'éditeur.

---

## Arguments pour la discussion de pile

### 1. Le cahier des charges WordPress est le meilleur argument contre WordPress

À lire attentivement, une part importante de ses exigences **P1 (bloquantes)**
consiste à réparer ou contenir la plateforme elle-même :

- corriger les permissions 777, supprimer `ALLOW_UNFILTERED_UPLOADS`, réduire
  6 comptes admin à 2, désactiver XML-RPC, masquer la version WordPress,
  protéger wp-admin (IP/2FA), ajouter un pare-feu applicatif, reCAPTCHA partout ;
- instaurer un calendrier de mises à jour **mensuel** (staging → prod),
  des sauvegardes **quotidiennes** avec rétention 30 jours, des alertes SSL ;
- acheter des extensions pour atteindre les cibles : WP Rocket (cache),
  Smush Pro/Imagify (images), SecuPress/Wordfence (sécurité), Schema Pro
  (données structurées), Yoast Premium (SEO), Elementor Pro, Polylang Pro,
  Gravity Forms.

Sur un site statique, ces catégories ne sont pas « résolues » — **elles
n'existent pas** : pas de wp-admin à protéger, pas de PHP à patcher, pas de base
de données à sauvegarder chaque nuit, pas d'extension à surveiller chaque mois.
Le budget sert à créer de la valeur, pas à compenser la plateforme.

### 2. Leurs cibles sont sous notre plancher

Critères d'acceptation du cahier des charges : Lighthouse **≥ 80** mobile,
LCP **< 2,5 s**, sécurité **grade ≥ B**. Le prototype actuel : Lighthouse
95–100, LCP < 2 s, et les en-têtes déjà déployés (CSP, HSTS, X-Frame-Options,
Referrer-Policy, Permissions-Policy) donnent un grade A. **La cible finale du
projet WordPress est en dessous du point de départ du prototype** — et chez eux
c'est un objectif à maintenir à coups d'extensions ; chez nous c'est une
propriété de l'architecture.

### 3. La liste des plugins actuels est un aveu

Relire le tableau de `critères.md` : **WP Super Cache** (faire semblant d'être
statique), **WP Downgrade** (épingler une vieille version du noyau parce que les
mises à jour cassent), **Solid Security** (durcir), **UpdraftPlus** (sauvegarder
la base). Quatre plugins dont la seule fonction est de compenser l'architecture.
Et les deux bogues connus du site actuel — redirection de remerciement Gravity
Forms cassée, bannières EN affichées en FR — sont des bogues d'intégration entre
plugins. Le second est structurellement impossible sur le prototype : chaque
page FR a son miroir EN explicite.

### 4. Coût total sur 4 ans

Soumissions agence : 15 000–20 000 $ + taxes de réalisation, licences
récurrentes, rétainer ~3 000–6 000 $/an, reconstruction tous les 3–4 ans →
**~40 000–80 000 $ sur 4 ans, et le code n'appartient pas à Victrix**. À noter :
l'Annexe A de la proposition estimait les licences WordPress à 300–600 $/an sur
4 extensions ; la liste réelle du cahier des charges en compte **8** (Elementor
Pro, Polylang Pro, Gravity Forms, WP Rocket, Schema Pro, Smush Pro/Imagify,
SecuPress/Wordfence, Yoast Premium), soit plutôt **750–1 200 $/an** — l'annexe
était conservatrice *en faveur* de WordPress.

Réalisation interne : **26–34 jours d'effort révisés** (voir « Estimation
révisée » ci-dessous), licences **0 à ~800 $/an selon l'éditeur retenu**
(Sveltia 0 $ ; Tina Team/Team Plus 29–49 $US/mois) — au plus la moitié de la
facture de licences WordPress —, **0 $ de rétainer, hébergement quasi nul**, et
un actif propriété de Victrix.

### 5. Cohérence de positionnement

Victrix vend de la posture de cybersécurité. Sa vitrine est en **grade D**, sur
une pile dont le propre cahier des charges exige WAF, 2FA et calendrier de
correctifs pour atteindre péniblement un grade B. L'alternative : une surface
d'attaque quasi nulle par construction. Pour un client qui vérifie, c'est un
argument de vente — dans les deux sens.

### 6. « WordPress en 2026 » — l'argument mesuré

WordPress n'est pas « mort » (~40 % du web) ; l'argument n'est pas la mode, mais
**l'adéquation** : pour un site vitrine bilingue d'environ 48 pages tenu par une
petite équipe, le statique gagne sur tous les axes mesurables (vitesse,
sécurité, coût, réversibilité). S'y ajoutent des risques d'écosystème réels et
récents : la gouvernance (conflit Automattic / WP Engine en 2024–2025, incluant
la prise de contrôle forcée du plugin ACF — un précédent de chaîne
d'approvisionnement), et le cycle des constructeurs — le site actuel est en
SiteOrigin, l'agence propose Elementor, dans 4 ans ce sera autre chose, et les
gabarits ne survivent pas au changement. La nouvelle pile repose sur les
standards du web ; le contenu, sur des fichiers texte.

### 7. La réversibilité est asymétrique

Le contenu de la nouvelle pile = des fichiers Markdown/JSON dans un dépôt Git
propriété de Victrix. Migrer vers n'importe quelle plateforme future (y compris
WordPress !) est un script d'une journée. Dans l'autre sens : un export
WordPress = une base MySQL truffée de shortcodes Elementor propriétaires —
c'est un projet. **Choisir la nouvelle pile est l'option la moins engageante des
deux.** Le cahier des charges impose d'ailleurs Git + child theme « obligatoires »
à WordPress — la nouvelle pile est native Git, contenu compris.

### 8. Les critères 3, 4, 5, 7, 8 sont des demandes de contrôle

Types de contenus, landing pages, URLs, indexation, schema, redirections : le
webmestre demande du **contrôle fin**. C'est précisément ce que le statique +
Git donne (tout est explicite, versionné, validé au build) et ce que WordPress
disperse dans les réglages de dix plugins qui s'ignorent.

---

## Les deux vrais compromis — à assumer, pas à cacher

1. **Édition visuelle** (critère 1) : l'éditeur structuré n'est pas Elementor.
   Réponse : pilote Sveltia avec de vrais contenus marketing ; si le
   clic-sur-la-page est jugé indispensable, Tina le fournit sur la même
   fondation. Et rappeler que le design system exigé par le cahier des charges
   est *garanti* par notre approche, *espéré* par la leur.
2. **Formulaires** (critère 6) : Gravity Forms est un produit mûr ; notre
   équivalent est un chantier à part entière (3–4 jours dans l'estimation
   révisée ci-dessous). Réponse : le besoin réel est de 3 à 6 formulaires
   corporatifs ; l'architecture proposée les couvre, notifications et
   remerciements compris — fonctions aujourd'hui **cassées ou non configurées**
   sur le site actuel.

## Estimation révisée (après lecture du cahier des charges)

L'estimation initiale de la proposition (17–21 jours) a été produite **avant**
le cahier des charges et la liste de critères. La relire sans la réviser serait
exactement le reproche qu'on fait au modèle d'agence. Révision par poste, en
jours de 7,5 h :

| Poste | Proposition | Révisé | Ce qui a changé |
|---|---|---|---|
| Cadrage et design system | 2–3 j | 2–3 j | Inchangé (tokens déjà amorcés au prototype) |
| Intégration des gabarits | 6–7 j | 8–10 j | 14 gabarits confirmés + fil d'Ariane, méga-menu, design system documenté exigés |
| Modèle de contenu, migration, recherche, Ø Studio | 3–4 j | 5–6 j | Modèle plus riche que prévu : 6 services, expertises, ressources en 4+ types, équipe, carrières; ~48 pages × 2 langues |
| Formulaires | (1 formulaire, inclus ci-dessus) | 3–4 j | Contact, devis, gating livres blancs, variantes contextuelles par service, consentement, événements GA4 |
| Bibliothèque de sections landing | — | 1–2 j | Critère 4 de l'équipe marketing |
| Accessibilité, perf, SEO, analytique | 3–4 j | 4–5 j | + GA4/GTM/Clarity, suivi conversions, bandeau Loi 25 |
| Recette et mise en ligne | ~2 j | ~2 j | Inchangé |
| Documentation et formation | 1–2 j | 1–2 j | Inchangé |
| **Total** | **17–21 j** | **26–34 j** | **+50 % environ** |
| Option éditeur visuel (spike + intégration Tina) | — | +3–5 j | Si le pivot est retenu |

Points de repère et réserves :

- **L'ancrage agence** : une soumission chiffrait 189 h (~25 jours) pour le
  build WordPress. L'estimation révisée (195–255 h) est du même ordre — pour un
  résultat au-dessus de leurs propres critères d'acceptation, sans licences,
  sans rétainer, sans cycle de reconstruction, code propriété de Victrix.
- **Déjà fait au prototype** (dé-risque l'estimation) : i18n FR/EN complet,
  slugs par langue + 301, CI, en-têtes de sécurité, éditeur configuré, 5–6
  gabarits en version fidèle au site actuel, portail maquetté.
- **Maquettes — tranché le 14 juillet : « fonctionnel d'abord ».** La v1 se
  livre sur le design actuel (reproduit fidèlement); la refonte graphique
  viendra ensuite comme « re-peau » via les design tokens, sans reconstruction.
  L'estimation ci-dessus n'inclut donc PAS de phase design; si une refonte
  graphique est commandée plus tard, la chiffrer à ce moment (intrant design
  interne ou externe). Réponse au sceptique : c'est l'avantage structurel de la
  pile — le visuel est une couche, pas une fondation.
- L'effort reste réparti autour des mandats clients (calendrier ≠ effort),
  comme dans la proposition.

## Suggestion de prochaine étape

Transformer le scepticisme en test : un **pilote de 2 semaines** où une personne
du marketing gère de vrais contenus (un article, une retouche d'accueil, une
landing de campagne) sur le prototype. Les critères 1 et 6 se jugent sur pièce,
pas sur PowerPoint. En parallèle, chiffrer le chantier formulaires et la
bibliothèque de sections landing pour retirer les deux dernières inconnues.
