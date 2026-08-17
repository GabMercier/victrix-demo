# Alignement du backlog Azure DevOps — état au 2026-08-12 (+ addendum du 17)

> **⚠️ Mise à jour 2026-08-17** : voir l'**addendum en fin de document** — la
> semaine « fermeture maximale » a livré P-08, P-11 (code), le portage du
> formulaire Contact, le formulaire Évaluation sur Cybersécurité, le fil
> d'Ariane visible, les schémas Service/LocalBusiness, les filtres de
> recherche et le maillage : plusieurs stories « Garder » deviennent
> fermables. La leçon F2.5 (critères d'acceptation à vérifier clause par
> clause) a aussi RETIRÉ deux stories de la liste « Fermer » du 12 :
> « Formulaires contextuels par page » et « Consentement Loi 25 + reCAPTCHA »
> ne se ferment qu'après la pose des clés (voir l'addendum).

**Quoi** : la correspondance entre les user stories du projet ADO « Victrix -
Refonte site Web Team » et l'état réel du prototype Astro + CloudCannon
(branche `spike/cloudcannon`, gate CloudCannon fermée le 2026-08-07).
**Pourquoi** : le backlog ADO a été rédigé pour la refonte WordPress d'origine ;
le pivot vers Astro/CloudCannon a livré beaucoup de ces stories sous une autre
forme et en a rendu certaines obsolètes. **Comment l'utiliser** : appliquer les
états recommandés dans ADO (colonne « Recommandé »), en collant la note comme
commentaire de fermeture. Le backlog vivant côté dépôt reste
`docs/plan-prompts.md` (P-01…P-23) — les correspondances P-xx sont indiquées.

Légende des recommandations :

- **Fermer** — livré dans le prototype (la preuve dit où).
- **Retirer** — obsolète depuis le pivot (spécifique à WordPress) ; état ADO
  « Removed » (ou fermer avec la note, selon votre convention d'équipe).
- **Garder** — reste à faire ; la note précise ce qui existe déjà et le blocage.

## Epic 0 — Cadrage & pré-requis

| Story | ADO | Recommandé | Note à coller |
|---|---|---|---|
| Inventaire exhaustif des URLs Victrix + O Studio | Active | Garder (Active) | = P-18 du dépôt. Préalable à la matrice 301 exhaustive et à la landing Ø Studio (P-17). |
| Matrice de redirections 301 exhaustive | Active | Garder (Active) | Mécanisme LIVRÉ (2 couches : règles dev + collection Redirections éditable au CMS, wildcards `/expertise/*` actifs). Reste la matrice exhaustive — dépend de l'inventaire P-18. |
| Résoudre les incohérences du CDC (Produits, Expertis…) | Active | Garder (Active) | Décision d'affaires — hors dépôt. |
| Trancher les outils ouverts (recherche, SEO, heatmap) | New | Garder + note | 2 des 3 tranchés et livrés : recherche = **Pagefind** (local, zéro tiers, conforme Loi 25) ; SEO = **natif Astro** (pas de plugin — voir docs/seo-strategie.md). Reste heatmap/analytics à trancher (lié à P-11). |

## Epic 1 — Design & Design System

Aucun changement d'état : l'epic reflète la réalité — **en attente de l'export
Tailwind/Figma et des visuels du designer externe**. À son arrivée, le point
d'entrée technique est `scripts/design/audit-export-tokens.mjs` (réconciliation
des tokens — les exports Figma reçus à ce jour sont incohérents entre eux :
Manrope vs Hanken Grotesk, tailles divergentes — voir
`docs/design/audit-tokens-figma.md`).

| Story | ADO | Recommandé | Note à coller |
|---|---|---|---|
| F1.2 — Design System (feature) | New | Passer In Progress | Base livrée dans le prototype : thème Tailwind v4 (`src/styles/theme.css`, ancré sur les 6 couleurs de la planche), page /style-guide interne, 30 sections composables. Finalisation à l'arrivée de l'export Figma. |

## Epic 2 — Développement

### F2.1 — Modèle de contenu (CPT & taxonomies) — **Fermer les 4 stories**

Les « CPT WordPress » sont devenus des **collections de contenu Astro**
(éditables dans CloudCannon) — l'intention de la feature est entièrement
couverte :

| Story | Recommandé | Note à coller |
|---|---|---|
| CPT Expertises | Fermer | Les expertises sont des pages de la collection `services` (29 par langue, 2 niveaux d'URL), composables par sections et éditables au CMS. |
| CPT Ressources | Fermer | Collection `blog` : 30 articles FR + 30 EN migrés de WordPress, brouillons, SEO par article, RSS par langue. |
| CPT Services (migré depuis les Expertises actuelles) | Fermer | Migration /expertise/ → /services/ réalisée (collection `services` + redirections 301 wildcard). |
| Taxonomies configurées (secteurs, technologies, type) | Fermer | Étiquettes du blogue (catégories dynamiques : filtres + méga-menu Ressources générés des étiquettes réelles) ; catalogue de solutions filtré par Secteur d'activité + Type de solution. |

### F2.2 — Gabarits — **Fermer**

| Story | Recommandé | Note à coller |
|---|---|---|
| Construire les 7 gabarits | Fermer | 15 gabarits livrés (accueil, page générique, service 2 niveaux, campagne, liste/article blogue, contact, carrières, catalogue solutions, recherche, merci, 404, portail…) + 30 sections composables réutilisables. |

### F2.3 — Navigation & transverses

| Story | ADO | Recommandé | Note à coller |
|---|---|---|---|
| Méga-menu simplifié (6 services, max 2 niveaux, <= 3…) | New | Fermer | Méga-menu 3 colonnes / 13 liens / 2 niveaux, partagé par 3 entrées du menu + méga-menu Ressources auto-généré du blogue. Éditable au CMS (collection Navigation) avec garde-fou build (lien invalide = publication bloquée). |
| Header sticky + CTA contact persistant | New | Fermer | Header sticky, CTA « Contact » persistant, barre d'annonce planifiable. |
| Navigation mobile entièrement refaite | New | Fermer | Tiroir plein écran : focus trap, verrou de défilement, recherche, CTA, langue. |
| Breadcrumbs sur toutes les pages internes | New | Garder | Fait : fil d'Ariane visible sur les articles + BreadcrumbList JSON-LD sur articles/services/pages. Reste : le fil VISIBLE sur services et pages génériques. |
| Footer (3 bureaux, partenaires, mentions légales / Loi…) | New | Garder | Footer livré et ÉDITABLE AU CMS (4 colonnes, contact, sociaux, mentions légales, © auto). Reste le design « 3 bureaux + partenaires » = P-13 (les 3 bureaux existent déjà comme contenu CMS sur la page Contact). |

### F2.4 — Moteur de recherche interne

| Story | ADO | Recommandé | Note à coller |
|---|---|---|---|
| Plugin de recherche indexant les 3 CPT | New | Fermer | Pagefind (local, sans service tiers) : tout le contenu indexable FR/EN, pages noindex exclues, build bloqué si l'index sort vide. |
| Page de résultats stylisée + filtres par type | New | Garder | Page /recherche livrée (FR/EN, `?q=` partageable). Reste : filtres par type de contenu. |
| Suivi GA4 (Site Search) | New | Garder | = P-11, bloqué clés + CSP (OPS). Le paramètre `?q=` est déjà propagé pour ce suivi. |
| Task — Vérifier l'indexation des SearchTerm | New | Retirer | Concept du plugin WordPress — remplacé par Pagefind + le suivi Site Search de P-11. |

### F2.5 — Formulaires dynamiques & conversion

| Story | ADO | Recommandé | Note à coller |
|---|---|---|---|
| Formulaires contextuels par page | New | Fermer | Section « Formulaire » posable sur toute page + formulaires réutilisables (collection Formulaires), champs conditionnels, champs cachés auto (page, UTM). Backend /api/forms testé (SMTP2GO), activation prod = clés (OPS). |
| Confirmation visuelle + email automatique après soumission | New | Garder | Confirmation visuelle LIVRÉE (redirection /merci, éditable au CMS). Reste le courriel de confirmation au visiteur = P-08, bloqué clés SMTP2GO. |
| Gating livres blancs (téléchargement + GA4) | New | Garder | Non commencé. Dépend de P-11 (GA4) pour la mesure. |
| Améliorations UX formulaires (multi-étapes, labels, AR…) | New | Garder | Labels/ARIA/validation livrés au re-skin. Reste multi-étapes = P-22 (sur besoin marketing). |
| Consentement Loi 25 + reCAPTCHA sur chaque formulaire | New | Fermer (avec variance) | Consentement livré sur chaque formulaire (case + lien politique, texte éditable au CMS). Anti-spam : **Turnstile retenu à la place de reCAPTCHA** (meilleur profil Loi 25/vie privée) + honeypot, vérif côté serveur. Activation prod = clés + entrée CSP (OPS). |

### F2.6 — Bilinguisme — **Fermer les 2 stories**

| Story | Recommandé | Note à coller |
|---|---|---|
| FR/EN, préfixe /en/, sélecteur de langue dans le header | Fermer | i18n complet `/fr` + `/en`, sélecteur desktop + mobile, appariement FR⇄EN par fichier vérifié au build. |
| hreflang + canonical corrects | Fermer | canonical + hreflang fr-CA/en-CA/x-default + og:locale sur toutes les pages (BaseLayout). |

### F2.7 — Sécurité : durcissement

| Story | ADO | Recommandé | Note à coller |
|---|---|---|---|
| Headers HTTP (CSP, X-Frame-Options, X-Content-Typ…) | New | Fermer | Livré via `public/_headers` Cloudflare : nosniff, SAMEORIGIN, Referrer-Policy, Permissions-Policy, HSTS, CSP sur /fr/* et /en/*. Suite planifiée : retirer 'unsafe-inline' + entrées Turnstile/analytics (OPS-CSP). |
| 6 admins -> <= 2 ; wp-admin protégé ; XML-RPC off ;… | New | Retirer | Obsolète — plus de WordPress. Équivalent nouveau monde : accès CloudCannon par siège nommé + dépôt Git (2 mainteneurs). |
| SecuPress ; reCAPTCHA ; limitation des connexions | New | Retirer | Obsolète — extensions WordPress. Équivalents natifs : Turnstile + honeypot (formulaires), Cloudflare devant le site, aucune surface de connexion publique (site statique). |

### F2.8 — Loi 25 (implémentation)

| Story | ADO | Recommandé | Note à coller |
|---|---|---|---|
| Bandeau de consentement cookies personnalisable + … | New | Fermer | Bandeau natif livré, texte/boutons ÉDITABLES AU CMS (Textes du site), contrat de consentement prêt pour les analytics (scripts gelés tant que non accepté). Une seule catégorie (analytique) — granularité à revoir si un 2ᵉ type de témoin apparaît. |
| Cases de consentement + lien politique sur les formul… | New | Fermer | Case requise + lien politique sur chaque formulaire ; formulation éditable au CMS. |
| Task — Analyser Axeptio | New | Retirer | Sans objet : bandeau construit nativement, aucun service tiers (rien à déclarer, zéro dépendance). |

## Epic 3 — Contenu, migration & SEO

### F3.1 — Migration de contenu

| Story | ADO | Recommandé | Note à coller |
|---|---|---|---|
| Intégration du contenu Services (CPT) | New | Passer Active | 25 services réels migrés et indexables (sur 29) ; 4 placeholders officiels noindex. Reste = P-19 (~14 h, sessions multiples). |
| Rapatriement O Studio -> /services/o-studio/ (homog…) | New | Garder | Catalogue de solutions livré (collection + filtres). Reste landing Ø Studio + 301 du vieux domaine = P-17 (dépend P-18). |
| Migration /expertise/ -> /services/ + 301 (valider Julie) | New | Fermer (valider Julie) | Fait dans le prototype : collection services + 301 (`/expertises/*` règles dev + `/expertise/*` wildcard CMS). La validation Julie porte sur la matrice exhaustive (P-18). |
| Confirmer responsable et volume de la migration | New | Garder | Décision d'affaires — le dépôt est prêt (gabarits + scripts de migration rejouables). |

### F3.2 — SEO on-page & technique

| Story | ADO | Recommandé | Note à coller |
|---|---|---|---|
| Meta titles/descriptions normés sur toutes les pages | New | Fermer | Normés par gabarit (patron « {titre} — Victrix ») + surcharge SEO par page/article éditable au CMS + guide (docs/guide-edition.md §SEO). |
| schema.org (LocalBusiness, Organization, Service, FAQ…) | New | Garder | Fait : Organization (toutes pages), BlogPosting, BreadcrumbList, FAQPage. Reste : LocalBusiness (3 bureaux) et Service. |
| Sitemap XML bilingue soumis GSC + Bing | New | Garder | Sitemap bilingue LIVRÉ (alternates fr-CA/en-CA, exclusions noindex automatiques). Reste la soumission GSC/Bing = tâche de mise en ligne (domaine final requis). |
| Matrice 301 implémentée ; zéro 404 sur URLs existantes | New | Garder | Mécanisme livré + zéro lien mort interne (audit 2026-08-11). La matrice exhaustive = P-17/P-18 (doublon assumé avec Epic 0). |
| Maillage interne Services <-> Ressources | New | Garder | Section « Ressources liées » livrée (cartes par étiquettes, résolues au build) mais posée sur 2 services seulement — à généraliser lors de P-19. |

### F3.3 — Analytics — tout Garder (bloqué OPS)

Les 4 stories restent : GA4 + GTM + événements = **P-11**, bloqué clés + CSP
(le contrat de consentement Loi 25 est prêt côté site) ; Site Search tracking
(le `?q=` est déjà propagé) ; GSC + Bing (mise en ligne) ; Heatmaps/A-B
(optionnel — à trancher avec la story F0.3).

### F3.4 — Images & médias

| Story | ADO | Recommandé | Note à coller |
|---|---|---|---|
| WebP/AVIF + srcset + lazy loading | New | Garder | Lazy loading + decoding async systématiques, fonts optimisées. Reste WebP/AVIF + srcset généralisé (1 image srcset à ce jour) — bon candidat post-export design (les visuels vont changer). |

## Epic 4 — Recette, conformité & Go Live

| Story | ADO | Recommandé | Note à coller |
|---|---|---|---|
| Cross-browser + 5 tailles d'écran + marges >= 16px | New | Garder | Playwright en place (2 specs) ; extension = P-20. |
| Tests formulaires + moteur de recherche | New | Garder | 122 tests unitaires verts (formulaires serveur couverts) ; e2e formulaires/recherche = P-20. |
| Tests automatisés (WAVE, axe, Lighthouse A11Y >= 90…) | New | Garder | Lint a11y (jsx-a11y) actif au CI ; audits outillés à ajouter. |
| Tests manuels (clavier, contraste) + corrections + AA | New | Garder | — |
| Mesures cibles + corrections performance | New | Garder | Site statique + fonts optimisées : bonne base, mesures à faire. |
| Validation 301 / hreflang / sitemap (zéro 404) | New | Garder | Outillé en continu (garde-fous build + audit zéro lien mort) ; validation finale à la mise en ligne. |
| Grade >= B securityheaders ; <= 2 admins ; CF7 désin… | New | Garder (reformuler) | Headers posés (voir F2.7) — mesurer le grade en prod. Les clauses WordPress (admins, CF7) sont sans objet. |
| Migration staging -> production (zéro interruption) + … | New | Garder | Prototype déployé en continu sur Cloudflare Pages ; la bascule production = décision domaine + DNS. |
| Documentation technique + guide d'édition | New | Fermer | docs/ complet (opérations, déploiement, formulaires, SEO, guide projet) + guide de l'éditeur non-technique (docs/guide-edition.md, à jour 2026-08-12). |
| Formation de l'équipe interne (Ilyes + Walter) | New | Garder | Matériel prêt (guide d'édition) ; session à planifier avec l'ouverture des accès CloudCannon (voir docs/contenu-a-fournir.md). |
| Sauvegardes automatiques quotidiennes (UpdraftPlus,…) | New | Retirer | Obsolète (extension WordPress). Le contenu EST le dépôt Git (versionné, restaurable commit par commit) ; l'hébergement statique n'a pas de base de données. |

## Récapitulatif

- **Fermer : 16 stories** (F2.1 ×4, F2.2, F2.3 ×3, F2.4 ×1, F2.5 ×2, F2.6 ×2,
  F2.7 ×1, F2.8 ×2, F3.2 ×1 — + F3.1 « migration /expertise/ » et F4.5
  « documentation » = **18** si vous fermez aussi ces deux-là).
- **Retirer (obsolètes WordPress) : 5** — wp-admin/6 admins, SecuPress,
  SearchTerm, Axeptio, UpdraftPlus.
- **Passer In Progress/Active : 2** — F1.2 Design System, Intégration contenu
  Services.
- **Le reste demeure ouvert**, avec les correspondances P-xx du dépôt :
  P-08 (courriel), P-11 (analytics), P-13 (footer bureaux), P-17/P-18
  (Ø Studio + inventaire URLs), P-19 (migration contenu), P-20 (QA), P-22
  (multi-étapes), P-23 (planification par section).

---

## Addendum — semaine du 2026-08-17 (« fermeture maximale »)

### Correction sur la liste du 12 (leçon AC de F2.5)

Le critère d'acceptation de « Formulaires contextuels par page » exige, sur la
page Cybersécurité : le formulaire « Évaluation posture sécurité » (pas le
générique), labels permanents, consentement + captcha PRÉSENTS, événement de
conversion GA4 à la soumission, confirmation visuelle + courriel automatique.
Deux stories sortent donc de la liste « Fermer maintenant » du 12 et passent
dans le tableau ci-dessous : **« Formulaires contextuels par page »** et
**« Consentement Loi 25 + reCAPTCHA »**. Décompte du 12 corrigé : **20 Fermer
+ 5 Retirer**.

### Livré cette semaine (dépôt, branche spike/cloudcannon)

- Formulaire **« Évaluation posture sécurité »** posé sur la page service
  Cybersécurité FR + EN (`formId: campagne-evaluation`).
- **Page Contact portée sur /api/forms** (2 modes ; `_formId: contact` ;
  définitions réécrites miroir de la page ; garde-fous de build page ↔
  définition).
- **P-08** : courriel de confirmation au visiteur (2ᵉ envoi SMTP2GO, gabarit
  fixe FR/EN, échec non bloquant ; +4 tests).
- **P-11 (code)** : gtag GELÉ sous consentement Loi 25 dans BaseLayout
  (inerte sans `PUBLIC_GA4_ID`), conversion `generate_lead` sur /merci,
  Site Search sur /recherche (`?q=` + saisie Pagefind) ; **CSP appliquée**
  (Turnstile + GA4) dans `public/_headers`.
- **Fil d'Ariane VISIBLE** sur services (parent inclus) et pages génériques —
  aligné au JSON-LD (même tableau).
- **Schémas** : `Service` (services indexables) + `LocalBusiness` ×3 bureaux
  (page Contact).
- **Filtre « Type »** dans la recherche interne (Service / Article / Page).
- **Maillage F3.2** : champ `topics` du blogue (distinct des catégories), 54
  fichiers d'articles thématisés, 27 bandes « Ressources liées » sur les
  services (26 posées + l'existante IA qui matche désormais).
- **E2e +6** : formulaires (maquette + validation), formulaire lié sur
  service, fil d'Ariane, recherche, merci (`tests/e2e/formulaires-recherche`).

### Passe 2 de fermetures — conditions

| Story ADO | Fermable quand | Reste à faire |
|---|---|---|
| Formulaires contextuels par page (F2.5) | Clés posées + vérif préversion | OPS §7ter (SMTP2GO, Turnstile, GA4) puis test réel : widget visible, POST → /merci, 2 courriels, événement GA4 |
| Consentement Loi 25 + reCAPTCHA (F2.5) | idem | idem (le captcha doit être VISIBLE en prod) |
| Confirmation visuelle + email (F2.5) | idem | idem — P-08 livré, activation = clés |
| GA4 + GTM + événements de conversion (F3.3) | Clés + vérif DebugView | Poser `PUBLIC_GA4_ID`, marquer `generate_lead` événement clé dans GA4 |
| Site Search tracking (F3.3) | idem | Vérifier l'événement `search` en DebugView |
| Suivi GA4 Site Search (F2.4) | idem | Doublon assumé de la précédente |
| Breadcrumbs sur toutes les pages internes (F2.3) | Vérif visuelle préversion | Livré (services + pages ; articles déjà faits) — valider le rendu |
| schema.org LocalBusiness/Organization/Service/FAQ (F3.2) | Maintenant | Tout est émis — valider au Rich Results Test si souhaité |
| Page de résultats stylisée + filtres par type (F2.4) | Vérif sur un BUILD | Le filtre n'apparaît que sur un build (index Pagefind) — vérifier sur préversion |
| Maillage interne Services <-> Ressources (F3.2) | Vérif visuelle préversion | Bandes livrées partout ; ajuster les thèmes au besoin (guide §blogue) |
| Tests formulaires + moteur de recherche (F4.1) | E2e vert | Redémarrer le dev server puis `npm run test:e2e` |

### Toujours ouvert après cette semaine

Gating livres blancs (pas de PDF fourni) · GSC/Bing + Heatmaps (domaine /
décision) · WebP/AVIF (F3.4) · P-13 footer bureaux (l'export2 n'a PAS le bloc
— dépendance design) · audits Lighthouse/axe + tests manuels (F4.2/F4.3) ·
migration contenu (P-17/18/19) · mise en ligne (F4.5) · Cloud Cannon licence
payante (Task — préalable à l'invitation des gestionnaires).
