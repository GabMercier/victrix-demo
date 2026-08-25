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

## 1. Fermables MAINTENANT (clic direct)

| ID | Story | État | Note à coller |
|---|---|---|---|
| #1439 | Documentation technique + guide d'édition | In Progress | AC satisfaite : guide de prise en main + procédures (docs/operations.md, DEPLOYMENT.md, formulaires.md, seo-strategie.md) et guide d'édition non-technique complet (docs/guide-edition.md, à jour 2026-08-17). La formation reste suivie par #1440. |
| #1486 | schema.org (LocalBusiness, Organization, Service, FAQPage, Article) | New | Les 5 types de l'AC sont émis : Organization (toutes pages), Article (BlogPosting sur le blogue), FAQPage (section FAQ), Service (pages services indexables, 2026-08-17), LocalBusiness ×3 bureaux (page Contact, 2026-08-17). Validation Rich Results possible sur la préversion. |
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

| ID | Story | État | Vérification qui ferme |
|---|---|---|---|
| #1430 | Confirmation visuelle + email automatique | New | Soumettre le formulaire → /merci + courriel équipe + courriel visiteur (P-08 livré). |
| #1491 | GA4 + GTM + événements de conversion | New | GA4 DebugView : `generate_lead` après une soumission (le 303 vers /merci = 1 conversion par envoi — AC « sur chaque soumission » couverte pour tous les formulaires). Marquer l'événement clé dans l'admin GA4. |
| #1492 | Site Search tracking | New | DebugView : événement `search` en tapant dans /recherche. |
| #1462 | Suivi GA4 (Site Search) | New | Doublon assumé de #1492 — même vérification. |
| #1428 | Page de résultats stylisée + filtres par type | New | Sur la PRÉVERSION (l'index Pagefind n'existe qu'au build) : le groupe « Type » (Service/Article/Page) apparaît et filtre. |
| #1436 | Tests formulaires + moteur de recherche | New | `npm run test:e2e` vert (12/13 constaté, flake portail corrigé — attendu 13/13) + un envoi réel sur la préversion. |

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
  boutons à finaliser.
- **#1452 Visuels authentiques** (New) — avancé 2026-08-18 : les **9 images du
  catalogue Solutions sont CÂBLÉES** (public/images/solutions/, 18 JSON fr+en —
  vedette o-bureau incluse). Restent : les 5 photos export2/Images (Lot 6) et
  les visuels « intrant Victrix ». ⚠️ Tous les exports font 512 px de large —
  flous en pleine largeur ≥1920 ; demander des exports ≥1920 px au designer
  (héros Carrières/services surtout).
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
- **#1481 Rapatriement O Studio** (New) — AC exige page /services/o-studio/ au
  design system + formulaire dédié + 301 du vieux domaine = P-17 (le
  formulaire dédié est facile désormais : collection Formulaires + formId).
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
- **#1440 Formation Ilyes + Walter** (New) — matériel prêt (guide d'édition) ;
  lié à l'ouverture des accès.
- **#1622 Task — CloudCannon licence payante** (New) — préalable à
  l'invitation des gestionnaires (sièges) ; vérifier compte de service
  marketing + gestion du domaine (la question posée dans la task).

### Conteneurs
Les 5 Epics et les features F0.2, F0.3, F1.1, F1.2, F2.3, F2.4, F2.5, F3.x,
F4.x restent ouverts tant que leurs enfants le sont — fermer chaque feature en
même temps que sa dernière story.

## Projection

Déjà fermé/retiré par toi : ~27 items. Section 1 : **+8 à +10**. Sections 2-4
(clés + vérifs + 3 décisions) : **+9 à +10**. → Le backlog de développement
(Epic 2) sera entièrement fermé ; il restera l'inventaire/migration de contenu,
le design en cours, la recette et la mise en ligne.
