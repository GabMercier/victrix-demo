# SEO sans plugins WordPress — stratégie, couverture et preuves

> Créé le 2026-07-28. Public cible : **l'équipe marketing** (et toute personne qui se demande
> « comment fait-on du SEO sans Yoast ? »). Document de référence technique ET argumentaire.
> Inventaire factuel vérifié dans le code à la date de création; les ID P-xx renvoient au
> backlog de [plan-prompts.md](plan-prompts.md), les phases au
> [plan de convergence](plan-convergence-migration.md).

## 1. L'essentiel en 5 points

1. **Yoast n'est pas le SEO.** Yoast est une *interface de saisie* qui injecte des balises
   (title, meta description, sitemap, canonical, Open Graph…) dans les pages WordPress. Sur le
   nouveau site, **ces mêmes balises sont générées par le code du site lui-même** — elles sont
   déjà en place, versionnées dans Git, et vérifiées à chaque build. Il n'y a rien à installer,
   rien à licencier, rien qui peut « se désactiver ».
2. **Tout ce que Yoast faisait chez Victrix a son équivalent natif** — le tableau §2 le montre
   fonction par fonction, avec l'état réel de chaque élément.
3. **Le socle technique est structurellement meilleur** que WordPress sur les critères que
   Google mesure : site 100 % statique (Core Web Vitals), zéro script tiers, polices
   auto-hébergées, images optimisées au build, en-têtes de sécurité (§3).
4. **Les métadonnées Yoast existantes sont migrées, pas perdues** : l'inventaire a extrait les
   154 titres SEO, 163 meta descriptions et 14 noindex de la base WordPress; ils seront
   reversés tels quels dans le nouveau site (Phase 6), et les 85 redirections 301 du plugin
   Redirection sont déjà exportées (§4).
5. **L'édition reste dans les mains du marketing** : titre SEO, description et indexation se
   modifient page par page dans CloudCannon, comme dans Yoast — avec en plus un filet que
   WordPress n'a pas : une valeur invalide **bloque la publication** au lieu de casser le site
   en silence (§5).

## 2. Équivalence Yoast/plugins WP → natif Astro, fonction par fonction

Le site WordPress actuel utilise **Yoast SEO 24.9** (titles, meta descriptions, sitemap) et le
plugin **Redirection** (301). État vérifié dans le code du nouveau site :

| Fonction (plugin WP) | Équivalent nouveau site | État |
|---|---|---|
| Titre SEO + meta description par page | Champs de contenu (`title`/`description`, `metaTitle`/`metaDescription` selon la collection) rendus par le gabarit central `BaseLayout.astro` | ✅ en place |
| Balise canonique | Générée sur chaque page depuis l'URL canonique du site | ✅ en place |
| `noindex` par page (Yoast « Autoriser les moteurs… ») | Champ `noindex` par page/collection → `<meta name="robots" content="noindex, nofollow">` | ✅ en place (campagnes noindex par défaut, services indexables par défaut) |
| Sitemap XML (Yoast) | `@astrojs/sitemap` : généré à chaque build, bilingue (hreflang fr-CA/en-CA), exclusions automatiques des pages noindex (campagnes, merci, recherche) | ✅ en place |
| robots.txt | `public/robots.txt` (+ lien sitemap) | ✅ en place |
| Open Graph / Twitter Cards (Yoast) | OG complet (type, locale, image 1200×630, article:published_time, article:tag) + Twitter `summary_large_image` sur chaque page | ✅ en place |
| hreflang bilingue (Polylang) | Natif : `fr-CA`, `en-CA` et `x-default` sur chaque page + dans le sitemap | ✅ en place |
| Données structurées (schema.org) | JSON-LD `Organization` (toutes pages), `BlogPosting` (articles), `FAQPage` (sections FAQ) | ✅ en place — mieux que le Yoast de base |
| Fil d'Ariane + `BreadcrumbList` | Composant + JSON-LD | ✅ **fait (P-12, 2026-07-30)** — JSON-LD sur articles + services ; fil VISIBLE sur les articles, extension aux autres gabarits reportée au fil du redesign |
| Redirections 301 (plugin Redirection) | `src/data/redirects.json`, éditable dans CloudCannon, **validé au build** (boucle, doublon, code invalide = publication bloquée avec message clair) | ✅ mécanique en place; les 85 règles WP exportées, à charger en Phase 6 |
| Flux RSS (WordPress) | Flux natif Astro | ✅ **fait (P-14, 2026-07-30)** — `/fr/rss.xml` + `/en/rss.xml`, découverte auto (`rel=alternate`) |
| Recherche interne (SearchWP/relevanssi…) | **Pagefind** — index statique généré au build, FR/EN séparés | ✅ **fait (P-06, 2026-07-28)** — voir §6 |
| Analytics / Site Search / conversions | GA4 + GTM + Clarity sous bandeau de consentement Loi 25 | 🔶 bandeau de consentement ✅ fait (P-10, 2026-07-30) ; pose des scripts 📋 planifiée (P-11 — bloquée sur OPS-CSP + clés) |
| « Feux verts » d'analyse de lisibilité Yoast | Pas d'équivalent embarqué — remplacé par la checklist de rédaction §5.3 et des audits périodiques (Lighthouse/GSC) | ⚠️ différence assumée |

**La seule vraie perte fonctionnelle est la pastille verte de Yoast** (l'analyse de lisibilité
dans l'éditeur). C'est un confort, pas un facteur de classement — Google n'a jamais lu les
pastilles Yoast. La checklist §5.3 et la Search Console couvrent le besoin réel.

## 3. Ce que le nouveau socle fait MIEUX que WordPress

Arguments positifs pour l'équipe marketing — mesurables, pas des promesses :

- **Core Web Vitals** (facteur de classement confirmé) : pages 100 % statiques servies d'un
  CDN, **zéro script tiers** au chargement, polices auto-hébergées et préchargées (pas de
  Google Fonts), images converties/redimensionnées au build (`astro:assets` + sharp), assets
  en cache immuable 1 an, préchargement des liens au survol (navigation quasi instantanée).
  Un WordPress + page builder (SiteOrigin/Brizy, comme l'actuel) ne peut pas rivaliser :
  chaque plugin ajoute JS/CSS; ici la page n'embarque que ce qu'elle utilise.
- **Fiabilité des balises** : sur WP, une mise à jour de plugin peut silencieusement changer
  ou casser le balisage. Ici les balises sont du code revu et versionné; toute modification
  passe par une préversion et un build qui **échoue si une donnée est invalide** (redirection
  en boucle, lien de navigation cassé, formulaire inexistant…). Le SEO technique est *testé*.
- **Sécurité = confiance des moteurs** : en-têtes stricts (CSP, HSTS…), aucune surface
  d'attaque PHP/plugins — pas de risque de hack qui injecte du spam SEO (cause réelle et
  fréquente de pénalités sur WordPress).
- **Pas de dérive de coûts ni de dette** : la liste de plugins du cahier des charges WP
  représentait ~750–1 200 $/an de licences et autant de mises à jour à suivre. Ici : zéro.
- **Bilinguisme propre** : hreflang généré par le même code qui génère les pages — pas de
  désynchronisation Polylang/Yoast possible entre les deux langues.

## 4. Migration : rien ne se perd

Chaîne déjà outillée (inventaire commité, scripts rejouables dans `scripts/migration/`) :

1. **Métadonnées Yoast extraites** de la base WP : `seo_title` (154), `seo_metadesc` (163),
   `noindex` (14) — colonnes de `docs/migration/urls-contenus.csv`. En Phase 6, les
   convertisseurs les reversent dans le frontmatter de chaque page migrée. Les 14 contenus
   noindex de WP (pages légales, remerciements, listes de prix…) restent noindex.
2. **Zéro-404** : les 174 URLs publiées sont inventoriées; les URLs du nouveau site seront
   alignées (FR à la racine, décision du 24/07) et **chaque URL de l'inventaire sera vérifiée
   automatiquement** contre le build (critère de sortie de la Phase 2/6). Les 85 redirections
   301 du plugin Redirection sont exportées (`docs/migration/redirections.csv`) et seront
   chargées dans le mécanisme de redirections validé au build.
3. **Bascule** (Phase 7) : resoumission du sitemap dans Google Search Console + Bing Webmaster
   Tools, suivi des rapports de couverture pendant la période de transition. Le domaine et les
   URLs étant conservés, il n'y a **pas de « re-départ à zéro » SEO** : c'est le scénario de
   migration le moins risqué qui existe (mêmes URLs, contenu identique, socle plus rapide).

## 5. Gouvernance éditoriale du SEO (comment marketing garde la main)

### 5.1 Ce qui s'édite dans CloudCannon, page par page

- **Titre** et **description** (balise title, meta description, aperçus de partage OG).
- **Indexation** (`noindex`) là où la collection l'expose — avec des défauts sûrs :
  campagnes payantes noindex par défaut, pages de services indexables par défaut.
- **Redirections** : collection « Redirections » (301/302) — une entrée invalide bloque la
  publication avec un message en français au lieu de créer une boucle silencieuse.
- Les balises techniques (canonical, hreflang, OG, JSON-LD, sitemap) sont **automatiques** :
  personne n'a à y penser, personne ne peut les casser depuis l'éditeur.

### 5.2 Ce qui est mesuré (au lancement)

- **Google Search Console + Bing Webmaster Tools** (ligne OPS) : couverture, requêtes,
  Core Web Vitals réels.
- **GA4 + suivi de la recherche interne** (P-11) : les termes cherchés par les visiteurs dans
  la recherche du site (§6) = mine d'or éditoriale (quels contenus manquent, quels mots
  emploient les clients).

### 5.3 Checklist de rédaction (remplace les pastilles Yoast)

✅ Intégrée au guide d'édition (`guide-edition.md`, section « Bien référencer
une page », 2026-08-07) : 1 sujet = 1 page; titre ≤ 60 caractères portant le mot-clé
principal; description 120–155 caractères orientée clic; un seul H1, sous-titres H2/H3
descriptifs; liens internes vers les services/articles liés; texte alternatif des images;
nommer les fichiers d'images en mots réels; vérifier l'aperçu de partage avant publication.

## 6. Recherche interne (fait — P-06) et « fine pointe »

- **Pagefind** (2026-07-28) : moteur de recherche interne **sans serveur ni service tiers** —
  l'index est un artefact statique généré à chaque build, téléchargé par fragments (quelques
  dizaines de Ko par requête, même avec des milliers de pages). Français et anglais sont des
  index séparés avec racinisation propre à chaque langue (chercher « migrations » trouve
  « migration »). Page `/recherche` dans les deux langues + icône dans l'en-tête. Seul le
  contenu utile est indexé (jamais les menus/pieds de page, jamais les pages noindex, jamais
  le portail). **Quand la migration ajoutera les ~150 contenus WP, ils seront indexés
  automatiquement au build suivant — coût marginal : zéro.** Vie privée : aucune requête ne
  sort du site (aligné Loi 25, aucun consentement requis pour chercher).
- **Ce qu'on ne fait PAS, en connaissance de cause** (être à la fine pointe, c'est aussi ne
  pas faire ce qui est périmé) : le balisage `SearchAction`/« sitelinks searchbox » (retiré
  par Google en 2024); les meta keywords (ignorées depuis 2009); le bourrage de
  données structurées non affichables.
- **Reste à faire, priorisé** (petits chantiers connus, aucun bloquant — statuts au 2026-08-07) :
  1. ~~`BreadcrumbList` + fil d'Ariane (P-12)~~ ✅ fait (articles + services).
  2. ~~RSS + partage social (P-14)~~ ✅ fait.
  3. Analytics sous consentement + suivi site search — bandeau ✅ (P-10) ; pose des scripts (P-11) bloquée sur OPS-CSP + clés.
  3bis. **Image de partage (og:image) par page** : défaut global `/og-image.png` ; seuls les articles la surchargent (couverture). Champ dédié par contenu à ajouter (suggestion atelier-contenus §GAP).
  4. Finitions signalées par l'inventaire technique : logo `Organization` en ≥112 px (le
     favicon 32 px actuel est un bouche-trou), `dateModified` sur les articles, hôte du
     sitemap dans robots.txt dérivé de la config, URL de production définitive dans
     `astro.config.mjs` (aujourd'hui `victrix-demo.pages.dev`) — à faire au changement de
     domaine, AVANT la bascule.
  5. À évaluer au lancement : fichier `llms.txt` et lisibilité pour les moteurs génératifs
     (GEO) — notre site statique au HTML propre part déjà gagnant sur ce terrain; IndexNow
     (Bing) pour la découverte instantanée des mises à jour.

## 7. Réponse courte aux objections types

- *« Sans Yoast on va perdre notre référencement. »* → Yoast ne référence pas : il écrit des
  balises. Les mêmes balises existent, en mieux testé (§2), sur les mêmes URLs (§4).
- *« Qui va gérer le SEO au quotidien ? »* → Les mêmes personnes, dans CloudCannon (§5.1);
  la technique est automatique et verrouillée.
- *« Comment saura-t-on que ça marche ? »* → Search Console/Bing dès la bascule + Core Web
  Vitals réels + suivi des recherches internes (§5.2). Métriques, pas pastilles.
- *« Et si Google change ses règles ? »* → Le site est du code sous notre contrôle : une
  évolution SEO = une tâche de développement ordinaire, pas l'attente d'une mise à jour de
  plugin tiers.
