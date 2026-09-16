# Alignement du backlog Azure DevOps — v2, audit AC du 2026-08-17

**Quoi** : l'état de chaque work item du projet ADO « Victrix - Refonte site
Web » (org `Victrix-clients`) audité **contre ses critères d'acceptation
réels** — extraits par l'API (WIQL + workitemsbatch, script
`scratchpad/dump-ado.mjs`) — et contre le dépôt (branche `spike/cloudcannon`,
semaine « fermeture maximale » livrée le 17). **Remplace** la v1 du 12 août
(mapping par titres) et son addendum : la passe 1 est **déjà appliquée** — les
CPT, gabarits, méga-menu, nav mobile, bilinguisme, headers, Loi 25, meta,
recherche et les obsolètes WordPress sont Closed/Removed dans ADO. Ce document
liste ce qui reste, par condition de fermeture.

Backlog vivant côté dépôt : `docs/plan-prompts.md` (P-xx). Guide de pose des
clés : `docs/operations.md §7ter`.

> **Mise à jour 2026-08-25** (dépôt à `63ebf6f`, poussé) : les deltas depuis
> l'audit sont notés en place, marqués « MàJ 25/08 ». Contexte : **flux deux
> étages CloudCannon ACTIVÉ** — site prod créé sur `main`
> (overt-pineapple.cloudvent.net), 1er Publish fait ; prod est 2 commits en
> retard sur staging (re-Publish à faire). **Backend formulaires DÉCIDÉ** :
> spike CloudCannon Forms d'abord, fallback Worker Cloudflare
> (operations.md §7ter) ; comptes SMTP2GO/Turnstile encore à créer.

## Mise à jour 2026-09-10 — retour de recette éditeur (rencontre du 09/09)

L'équipe d'exploitation (Julie, Walter, Clément, Ben) a passé le CMS en revue le
2026-09-09. Réponse point-par-point (fait / à faire / décisions) :
**`docs/retour-rencontre-2026-09-09.md`** — les lots de dev y sont chiffrés
(lot 0 **fait le 10/09** : bug alt service-hero, gabarits blog pré-remplis
seoTitle/noindex, libellé « Pages générales », Navigation regroupée sous
« Contenu du site » ; lots 1-4 ≈ 3-3,5 j ; lot 5 = config après le plan
d'architecture de Walter). Rappel : **prod en retard sur staging → re-Publish**
avant que l'équipe re-navigue. Les consignes de la rencontre placent les
commentaires de recette sous l'**Epic 4** ; les capacités nouvelles vont à
l'Epic 2 (assumé : ça le rouvre — features ≠ recette).

*Ajouts du 10/09 (demandes Gabriel, doc retour §T6)* : **section « Ligne du
temps » LIVRÉE** (serpentin, jalons accentués — appliquée à Découvrir fr+en +
page démo, vignette de palette incluse ; aucune story à créer) ; **vérification
des landing pages dans l'export : FAITE et concluante** (doc retour annexe C —
9 fiches fournisseurs + Landing Démo O bureau à recomposer, 3 décisions, 3
brouillons à abandonner) ; tableaux d'articles : AC de la story « nettoyage »
élargie (conversion en Markdown éditable) ; banque d'icônes : nouvelle story
Epic 2 après choix de la banque (Lucide recommandé).

### A. Items existants à amender (compléments à coller dans la description)

| ID | Story | Complément à coller |
|---|---|---|
| #1438 | Migration staging → production | Ajout recette 09/09 : trancher la forme canonique du domaine (**www vs apex** — demande : sans www) et l'inscrire ici ; à la bascule : DNS + 301 www→apex, remplacer les placeholders `site:` (astro.config.mjs) et `Sitemap:` (robots.txt), normaliser les cibles absolues `https://www.victrix.ca/...` de la matrice 301. Détail : retour-rencontre-2026-09-09.md annexe B. |
| #1445 / #1447 | Inventaire URLs / Matrice 301 | Nouvelle dépendance : **plan d'architecture cible de Walter** (structure + URL + redirections), incluant le reclassement « Productivité » sous Expertises et la future section Expertises. Ne rien fermer avant réception. |
| #1483 | Migration de contenu (responsable/volume) | Vérification des landing pages FAITE le 10/09 (retour-rencontre-2026-09-09.md annexe C, source `docs/migration/urls-contenus.csv`) : tout ce qui existait au 2026-07-23 est dans l'export. À migrer : 9 fiches fournisseurs Approvisionnement TI fr+en (brizy — recomposition ≈2-3 j) + Landing Démo O bureau (→ Campagnes) ; décisions : Vœux des fêtes, Liste de prix Check Point, Documents O bureau (protégée) ; à abandonner : 3 brouillons jamais publiés. Les pages M365 citées en rencontre = pages services déjà migrées. La vérification back-office de Clément reste utile pour le contenu créé APRÈS le 2026-07-23 (export final au décommission). |
| #1622 | CloudCannon licence payante (task) | Priorité ↑ (rencontre 09/09) : 3 sièges insuffisants (siège Gabriel retiré pour Julie ; besoin exprimé ≥ 4, ~10 $/siège), bloque les invitations et la formation #1440 ; CloudCannon Forms (backend retenu) dépend possiblement du palier. Ajouter : **remplacer la carte de crédit personnelle de Gabriel par une carte d'organisation** (Organization Settings → Billing). |
| #1440 | Formation Ilyes + Walter | Ajouter au matériel : la réponse « lier une page FR à sa page EN quand les URL diffèrent » (appariement par nom de fichier + champ Slug par langue) — retour-rencontre-2026-09-09.md annexe A ; c'était l'action « à clarifier avec Gabriel » de la rencontre. |
| #1435 | Cross-browser + 5 tailles | Consigner les remarques responsivité de la rencontre (gabarits communiqués/personnalisation) comme cas à couvrir par la recette. |

### B. Nouvelles stories à créer — Epic 4 (correctifs de recette)

| Story (titre à créer) | AC / description à coller | Lot |
|---|---|---|
| Recette éditeur — barre latérale CloudCannon alignée sur l'architecture du site | Les groupes/l'ordre de la barre latérale reflètent l'architecture validée (plan Walter), incl. un regroupement « Expertises ». Déjà livré le 10/09 : libellé « Pages générales », Navigation rangée avec le contenu du site. Config pure (cloudcannon.config.yml), zéro risque site. **Bloquée par le plan d'architecture.** | 5 (~0,5 j) |
| Recette SEO — métadonnées éditables sur toutes les pages | Titre SEO, description et noindex éditables sur : accueil (titre/description aujourd'hui codés en dur), campagnes (pas de titre SEO), contact, carrières, solutions ; méta description d'article distincte de l'extrait (repli sur l'extrait — rien à ressaisir) ; garde-fou anti-noindex sur l'accueil. Gabarits blog pré-remplis livrés le 10/09. | 1 (~1 j) |
| Recette a11y — texte alternatif éditable sur toutes les images | Les ~14 emplacements d'images restants exposent un champ « Texte alternatif » câblé au rendu (héros campagne, sections accueil, bento, solutions exclusives, témoignages, affiche vidéo, couvertures d'articles, vignettes solutions, bureaux contact, témoignages carrières, image vedette du méga-menu). Aucune image n'est en fond CSS — l'alt est possible partout. Bug service-hero (alt saisi ignoré) corrigé le 10/09. | 2 (~0,5-1 j) |
| Recette contenu — garde-fou H1 + styles h4-h6 | Le build avertit quand une page publie 0 ou 2 `<h1>` (aujourd'hui : le héros porte le seul h1, sans garde-fou si absent/doublé) ; `.prose` couvre h4-h6 (utilisés par les articles migrés). | 3 (~0,5 j) |
| Recette blog — nettoyage des 14 articles migrés | Tableaux HTML **convertis en tableaux Markdown natifs** (modifiables dans l'éditeur de contenu CloudCannon — ajout 10/09) et stylés `.prose table` (+ défilement horizontal mobile), `src` d'images absolues `www.victrix.ca` rapatriées, CTA `.article-cta` harmonisés — sur les 14 articles concernés. | 4 (~0,5-1 j) |
| Médiathèque — stratégie et convention de rangement des images | Décision préalable (consolider vers une racine commune, prospectif seulement — ne pas déplacer l'existant référencé par 60+ articles — ou assumer le rangement par surface) ; puis convention documentée dans guide-edition.md § Médias et chemins d'upload ajustés. | après décision 🟠 |

### C. Nouvelles stories optionnelles — Epic 2 (capacités, jamais fusionnées à la recette)

| Story (titre à créer) | AC / description à coller | Effort |
|---|---|---|
| Articles — snippets insérables sans HTML (bouton, bannière CTA, citation) | L'éditeur de contenu propose des snippets CloudCannon : bouton/CTA stylé, bannière CTA d'article « propre » (remplace la classe `.article-cta` à écrire à la main), citation. Répond aux points « composants sans code » + « bannière CTO esthétique » de la rencontre. | ~1 j |
| Landing — menu rétréci à liens d'ancrage | Les campagnes peuvent afficher un menu réduit à ancres naviguant vers les sections de la page (« Découvrir Victrix », « Pourquoi nous choisir? »…). | ~1 j |
| Sections — niveau de titre configurable | Sur les sections qui le justifient, choix du niveau (h2/h3/h4) et désignation du H1 (titre vs surtitre du héros) sans changer le style. À cadrer après le garde-fou H1 (lot 3). | ~1 j |
| Sections — banque d'icônes éditable (ajout 10/09) | Une banque d'icônes commune (sous-ensemble ~40 icônes SVG inline d'une bibliothèque MIT — **Lucide recommandé** ; alternatives Phosphor, Material Symbols) remplace les petits jeux fermés dessinés à la main ; chaque section à icônes (cartes à icônes, bento, valeurs…) offre un menu déroulant à libellés FR. **Bloquée par le choix de la banque (décision Gabriel/équipe).** | ~1 j |

### D. Nouvelle story — migration de contenu (Epic 0 / F3.1, ajout 10/09)

| Story (titre à créer) | AC / description à coller | Effort |
|---|---|---|
| Rapatriement des landing pages restantes de l'export | Les 9 fiches fournisseurs Approvisionnement TI (Check Point, Microsoft, ServiceNow, CrowdStrike Falcon, Zscaler, Cisco, Palo Alto Networks, Dell Technologies, HPE Networking) sont recomposées fr+en avec la recette (contenu = export WP, brizy non convertible automatiquement) ; la Landing Démo O bureau devient une campagne ; les décisions Vœux des fêtes / Liste de prix Check Point / Documents O bureau sont tranchées et exécutées ; les 3 brouillons jamais publiés sont retirés de l'inventaire. Source : retour-rencontre-2026-09-09.md annexe C. | ≈2-3 j |

## 1. Fermables MAINTENANT (clic direct)

| ID | Story | État | Note à coller |
|---|---|---|---|
| #1439 | Documentation technique + guide d'édition | In Progress | AC satisfaite : guide de prise en main + procédures (docs/operations.md, DEPLOYMENT.md, formulaires.md, seo-strategie.md) et guide d'édition non-technique complet (docs/guide-edition.md, à jour 2026-08-17). La formation reste suivie par #1440. |
| #1486 | schema.org (LocalBusiness, Organization, Service, FAQPage, Article) | New | Les 5 types de l'AC sont émis : Organization (toutes pages), Article (BlogPosting pour centre de ressource), FAQPage (section FAQ), Service (pages services indexables, 2026-08-17), LocalBusiness ×3 bureaux (page Contact, 2026-08-17). Validation Rich Results possible sur la préversion. |
| #1459 | Breadcrumbs sur toutes les pages internes | New | Fil d'Ariane visible + BreadcrumbList JSON-LD sur TOUTES les pages internes (2026-08-17) : articles, services (parent inclus sur les enfants), pages génériques, Contact, Carrières, Solutions, index Ressources. Accessible (nav aria-label, aria-current). |
| #1419 | F2.1 — Modèle de contenu (feature) | New | Conteneur : les 4 stories enfants sont fermées. |
| #1423 | F2.2 — Gabarits (feature) | New | Conteneur : story enfant fermée (15 gabarits livrés). |
| #1468 | F2.6 — Bilinguisme (feature) | New | Conteneur : les 2 stories enfants sont fermées. |
| #1471 | F2.7 — Sécurité (feature) | New | Conteneur : headers fermés, clauses WordPress retirées. |
| #1476 | F2.8 — Loi 25 (feature) | New | Conteneur : les 2 stories + task Axeptio fermées. |

**À confirmer par toi (2 stories du designer — je ne tranche pas à sa place)** :

| ID | Story | État | Fermable si… |
|---|---|---|---|
| #1408 | Rafraîchissement de la charte | In Progress | …tu considères l'export2 (tokens + composants v3, appliqués au prototype `47c1a19`) comme LA charte modernisée livrée. AC : « charte modernisée sans rebranding » — c'est le cas. |
| #1409 | Conception des maquettes | In Progress | …Victrix a bien l'accès ÉDITABLE aux fichiers Figma (l'AC ne porte que là-dessus). Le `.fig` est dans le dépôt (docs/design) — si l'accès Figma est acquis, ferme. |

## 2. Fermables dès les clés posées (§7ter) + vérif préversion

Pose SMTP2GO + Turnstile + `PUBLIC_GA4_ID` dans Cloudflare Pages, redéploie,
puis une passe de vérification (~15 min) ferme le bloc :

> **MàJ 25/08** : les comptes SMTP2GO et Turnstile n'existent pas encore —
> les créer d'abord (operations.md §7ter, « Où créer les comptes/clés »).
> La vérification se fait toujours sur la préversion Cloudflare
> (victrix-demo.pages.dev) ; la destination DÉFINITIVE des 6 clés
> formulaires = l'issue du spike CloudCannon Forms. `PUBLIC_GA4_ID` peut en
> plus être posée dès maintenant sur le build du site CloudCannon de prod.

| ID | Story | État | Vérification qui ferme |
|---|---|---|---|
| #1430 | Confirmation visuelle + email automatique | New | Soumettre le formulaire → /merci + courriel équipe + courriel visiteur (P-08 livré). |
| #1491 | GA4 + GTM + événements de conversion | New | GA4 DebugView : `generate_lead` après une soumission (le 303 vers /merci = 1 conversion par envoi — AC « sur chaque soumission » couverte pour tous les formulaires). Marquer l'événement clé dans l'admin GA4. |
| #1492 | Site Search tracking | New | DebugView : événement `search` en tapant dans /recherche. |
| #1462 | Suivi GA4 (Site Search) | New | Doublon assumé de #1492 — même vérification. |
| #1428 | Page de résultats stylisée + filtres par type | New | Sur la PRÉVERSION (l'index Pagefind n'existe qu'au build) : le groupe « Type » (Service/Article/Page) apparaît et filtre. |
| #1436 | Tests formulaires + moteur de recherche | New | `npm run test:e2e` vert (**MàJ 25/08 : 13/13 constaté les 20-25/08**) + un envoi réel sur la préversion. |

*Note : #1429 (Formulaires contextuels) et #1467 (Consentement + reCAPTCHA)
sont déjà fermés — cette même passe de vérification les rend VRAIS en
production (formulaire « Évaluation posture sécurité » posé sur Cybersécurité
FR/EN, Turnstile visible dès la clé).*

## 3. Fermable après un coup d'œil à la préversion

| ID | Story | État | Note |
|---|---|---|---|
| #1489 | Maillage interne Services ↔ Ressources | New | Livré : champ « Thèmes » sur les 60 articles + 27 bandes « Ressources liées » sur les services, cartes réelles prouvées au build. Un coup d'œil visuel et c'est fermé. |

## 4. Décisions à trancher (2 minutes, puis fermer)

| ID | Story | État | Proposition |
|---|---|---|---|
| #1451 | Trancher les outils ouverts (recherche, SEO, heatmap) | New | 2 des 3 sont tranchés ET livrés : recherche = Pagefind (local, Loi 25-friendly), SEO = natif Astro. Reste heatmap → proposer « aucun en v1, réévalué post-lancement » et fermer. |
| #1494 | Heatmaps / A/B testing (optionnel) | New | Si la décision ci-dessus = pas de v1 → Removed (ou fermer avec la note). Sinon, reste ouvert lié aux clés GTM. |
| #1483 | Confirmer responsable et volume de la migration | New | Décision d'affaires — le dépôt est prêt (gabarits + scripts rejouables, 25/29 services déjà réels). |

## 5. Reste ouvert — avec l'état réel face à l'AC

### Design (Epic 1)
- **#1407 Maquettes Figma Desktop+Mobile** (Active) — AC : 6 pages. Partiel :
  l'export2 couvre 5 composants + 5 photos ; les maquettes de pages complètes
  restent chez le designer.
- **#1412 Composants réutilisables** (Active) — re-skin v3 en cours (header,
  méga, footer, cartes faits ; 2026-08-18 : hero/benefits/form/strategic-value/
  callout alignés sur les maquettes FINALES landing + contact) ; normalisation
  boutons à finaliser. **MàJ 25/08** : +2 composants recette catalogue
  (`product-hero`, `bento-metrics`, maquette produits.css) + champ
  `imagePosition` sur service-hero.
- **#1452 Visuels authentiques** (New) — avancé 2026-08-18 : les **9 images du
  catalogue Solutions sont CÂBLÉES** (public/images/solutions/, 18 JSON fr+en —
  vedette o-bureau incluse). Restent : les 5 photos export2/Images (Lot 6) et
  les visuels « intrant Victrix ». ⚠️ Tous les exports font 512 px de large —
  flous en pleine largeur ≥1920 ; demander des exports ≥1920 px au designer
  (héros Carrières/services surtout). **MàJ 25/08** : héros Découvrir remplacé
  par une photo d'équipe réelle 1920 px (decouvrir-hero.jpg, dérivée de
  design/homepage-team-victrix.jpg).
- **#1453 Validation des maquettes** (Active) — gate parties prenantes ;
  2026-08-18 : landing « Licences Power Platform » et Contact appliqués sur
  les maquettes FINALES (landing-pagefinal.txt, contactfinal.css) → prêts
  pour la validation.

### Inventaire & migration (Epic 0 / F3.1)
- **#1445 Inventaire URLs** (Active) — ⚠️ la task « Export screaming frog et
  sitemap » (#1542) est FERMÉE : l'export existe. Récupérer le fichier et le
  déposer dans le dépôt (docs/migration/) → P-18 peut se terminer (statut,
  langue, cible par URL).
- **#1447 Matrice 301 exhaustive** (Active) — mécanisme livré ; la matrice
  attend #1445 ; validation Julie.
- **#1448 Incohérences CDC** (Active) — atelier.
- **#1480 Intégration contenu Services** (New) — 25/29 services réels ; = P-19.
  **MàJ 25/08** : les 29/29 pages services sont STYLÉES à la recette
  (batch 24-25/08, fr+en) ; 3 restent placeholder CONTENU
  (services-applicatifs, projets-en-ia, infrastructure — noindex, contenu à
  fournir).
- **#1481 Rapatriement O Studio** (New) — AC exige page /services/o-studio/ au
  design system + formulaire dédié + 301 du vieux domaine = P-17.
  **MàJ 25/08 : page O Studio réelle (9 sections recette) + formulaire dédié
  `o-studio` LIVRÉS (`dd629ed`)** — restent : décision d'URL
  `/services/o-studio/` (AC) vs imbriquée actuelle, et le 301 du vieux
  domaine (OPS DNS).
- **#1488 Matrice 301 implémentée ; zéro 404** (New) — dépend #1445/#1447.

### SEO / analytics restants
- **#1487 Sitemap soumis GSC + Bing** (New) + **#1493 GSC + Bing configurés**
  (New) — le sitemap bilingue est livré ; la soumission attend le domaine
  final.
- **#1496 WebP/AVIF + srcset + lazy** (New) — lazy ✓ ; WebP/AVIF + srcset à
  faire (après visuels finaux).

### Formulaires restants
- **#1465 Gating livres blancs** (New) — pas de PDF fourni ; le pipeline
  (formulaire + GA4) est prêt à l'accueillir.
- **#1466 Améliorations UX formulaires** (New) — labels permanents ✓ ; reste :
  messages d'erreur ARIA par champ, focus ≥ 3px à vérifier, multi-étapes
  (P-22) si besoin.

### Recette & mise en ligne (Epic 4)
- **#1435 Cross-browser + 5 tailles** (New) — recette manuelle à planifier.
- **#1498 Tests automatisés a11y** (New) — Lighthouse/axe à outiller (reporté
  cette semaine) ; lint jsx-a11y déjà au CI.
- **#1499 Tests manuels a11y + AA documentée** (New) — recette.
- **#1501 Performance** (New) — AC à reformuler (WP Rocket sans objet) ; cibles
  Lighthouse/LCP/CLS mesurables sur la préversion.
- **#1503 Validation 301/hreflang/sitemap** (New) — à la bascule.
- **#1504 Grade ≥ B securityheaders** (New) — testable DÈS MAINTENANT sur
  victrix-demo.pages.dev (headers durcis + CSP posée) ; clauses wp-config /
  CF7 / admins sans objet — reformuler en fermant.
- **#1438 Migration staging → production** (New) — domaine + DNS + rollback.
  **MàJ 25/08** : flux deux étages ACTIVÉ (site prod `main` =
  overt-pineapple.cloudvent.net, 1er Publish fait) ; restent le domaine/DNS
  et les 3 blocages go-live (DEPLOYMENT.md §7 : routing.json, scission
  STATIC_ONLY, câblage backend formulaires).
- **#1440 Formation Ilyes + Walter** (New) — matériel prêt (guide d'édition) ;
  lié à l'ouverture des accès.
- **#1622 Task — CloudCannon licence payante** (New) — préalable à
  l'invitation des gestionnaires (sièges) ; vérifier compte de service
  marketing + gestion du domaine (la question posée dans la task).
  **MàJ 25/08** : plus urgent — DEUX sites CloudCannon actifs désormais
  (staging + prod), et CloudCannon Forms (backend retenu) dépend
  probablement du palier de licence.

### Conteneurs
Les 5 Epics et les features F0.2, F0.3, F1.1, F1.2, F2.3, F2.4, F2.5, F3.x,
F4.x restent ouverts tant que leurs enfants le sont — fermer chaque feature en
même temps que sa dernière story.

## Projection

Déjà fermé/retiré par toi : ~27 items. Section 1 : **+8 à +10**. Sections 2-4
(clés + vérifs + 3 décisions) : **+9 à +10**. → Le backlog de développement
(Epic 2) sera entièrement fermé ; il restera l'inventaire/migration de contenu,
le design en cours, la recette et la mise en ligne.
