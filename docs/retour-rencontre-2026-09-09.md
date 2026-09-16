# Retour de recette éditeur — rencontre du 2026-09-09

> Document de travail interne (Gabriel + Claude). Point-par-point des ~23 commentaires
> soulevés par l'équipe d'exploitation (Julie, Walter, Clément, Ben) lors de la
> présentation de CloudCannon : ce qui est **déjà fait**, ce qui **reste à faire**, et
> qui décide quoi. État du code au 2026-09-10 (branche `spike/cloudcannon`).
> Une **version partageable pour l'équipe** sera préparée à partir de ce doc avant la
> prochaine rencontre. Le volet Azure DevOps est dans `ado-alignement.md`
> (section « Mise à jour 2026-09-10 »).

**Légende** : ✅ fait · 🟡 partiel (le socle existe, des trous restent) · 🔴 à faire ·
🟠 décision à trancher avant d'agir · **Lot n** = lot de travail (récapitulatif en fin de doc).

---

## Synthèse express (pour le récap 30 min avec Clément)

**Compteurs (27 points, tableaux T1-T6) : 8 ✅ · 9 🟡 · 6 🔴 · 4 🟠** — 4 points corrigés le
10/09 (Lot 0), la **ligne du temps « Notre histoire » livrée** le même jour (T6 #24), et la
**vérification des landing pages dans l'export : concluante** (annexe C).

**Trois messages clés :**

1. **Le socle SEO/bilingue demandé est déjà livré** : champs Titre SEO/description/noindex,
   sitemap FR+EN avec hreflang, données structurées (Organization, fil d'Ariane, Article,
   Service, LocalBusiness, **FAQ**), campagnes noindex sans navigation, appariement FR↔EN.
   L'essentiel du reste, ce sont des **champs à exposer dans plus de gabarits** — pas une
   architecture à refaire. Cœur du travail dev restant : **≈ 3 à 3,5 jours** (lots 1-4).
2. **La question des traductions (URL différentes FR/EN) a déjà sa réponse** — appariement
   par nom de fichier + champ « Slug » par langue (annexe A). C'était l'action « à
   clarifier avec Gabriel » : ce doc la règle, à présenter à Julie/Clément.
3. **Quatre décisions hors code conditionnent la suite** : architecture cible validée
   (plan de Walter), www vs apex, stratégie médiathèque, gouvernance d'approbation du
   contenu. Plus 2 actions admin : sièges CloudCannon (#1622) et carte de crédit
   d'organisation. Et **re-Publish de la prod tout de suite** (elle est en retard sur le
   staging — l'équipe re-signalera des points déjà corrigés sinon).

**⚠️ À dire à l'éditrice SEO** : les redirections qu'elle saisit dans CloudCannon sont
validées et versionnées, mais **pas encore appliquées par l'hébergement CloudCannon**
(chantier `routing.json`, blocage go-live connu, #1438). Elles fonctionnent sur la
préversion Cloudflare en attendant.

---

## T1 — Référencement (SEO)

| # | Point soulevé | Statut | Réponse | Suite | ADO |
|---|---|---|---|---|---|
| 1 | Outil pour les métas (équivalent Yoast) dans articles et pages | 🟡 | « Titre SEO (surcharge) », « Description » et l'interrupteur « Masquer des moteurs de recherche » existent déjà sur articles, services et pages générales (`seo-strategie.md` §5, `guide-edition.md` § Bien référencer). Manquent : campagnes (pas de titre SEO), accueil (titre/description codés en dur), méta description d'article distincte de l'extrait, noindex sur accueil/contact/carrières/solutions. | **Lot 1** | story « méta complète » |
| 2 | Titre affiché ≠ titre pour les moteurs (55 vs 70-75 car.) | ✅ | C'est exactement le champ « Titre SEO (surcharge) » : le `<title>` envoyé aux moteurs remplace le titre affiché sans le modifier. Guide d'édition : viser ≤ 60 caractères. | — | — |
| 3 | Schémas identifiés automatiquement (FAQ, types de pages) pour accessibilité/moteurs | ✅ | JSON-LD émis automatiquement : Organization (partout), fil d'Ariane, Article de blogue, Service (pages services), LocalBusiness (contact) et **FAQPage** (chaque section FAQ le génère seule). | — | #1486 (fermable) |
| 4 | Pages de campagne : noindex + sans navigation principale | ✅ | Les campagnes naissent avec « Masquer des moteurs de recherche » activé, sont exclues du sitemap, et l'en-tête se règle par page : complet / allégé / personnalisé. | — | — |
| 5 | L'éditrice doit pouvoir gérer les redirections | 🟡 | La collection « Redirections » (groupe Configuration) lui permet déjà de saisir 301/302 avec garde-fous (une entrée invalide bloque la publication). **Mais** l'hébergement CloudCannon ne les applique pas encore (chantier `routing.json` — blocage go-live déjà connu). | chantier go-live | #1438 |
| 6 | Attribuer le H1 à un élément (ex. surtitre) sans changer son style ; contrôler H1-H6 | 🔴 | Aujourd'hui la hiérarchie est figée dans les composants : le héros porte le seul H1, les sections des H2, les cartes des H3 ; le surtitre est un `<p>`. Bonne base (hiérarchie propre garantie), mais aucun choix éditeur, aucun garde-fou si un héros manque (page sans H1) ou est doublé (2 H1), et h4-h6 non stylés dans les articles. | **Lot 3** (garde-fou + h4-h6) ; niveaux configurables = option Epic 2 | stories « garde-fou H1 » + option |

## T2 — Édition dans CloudCannon

| # | Point soulevé | Statut | Réponse | Suite | ADO |
|---|---|---|---|---|---|
| 7 | Travailler l'appellation « Pages » | ✅ **corrigé (Lot 0)** | La collection s'appelle maintenant « **Pages générales** » (Découvrir, Secteurs, Tarification, légales…) — l'ancien libellé laissait croire que toutes les pages du site vivaient là. | poussé au prochain commit | — |
| 8 | Header et footer au niveau « Contenu du site » | ✅ **corrigé (Lot 0)** | « Navigation » (méga-menu) déménage du groupe Marketing vers « Contenu du site », juste à côté de « Textes du site » qui porte le pied de page. | poussé au prochain commit | — |
| 9 | Reprendre l'architecture des pages dans la barre latérale + section « Expertises » manquante | 🟠 → Lot 5 | Les « expertises » ont été volontairement fusionnées dans Services le 2026-07-30 (avec 301). Recréer un regroupement « Expertises » dans la barre latérale est faisable en config **une fois l'architecture cible validée** (plan de Walter : structure + URL + redirections). Refaire la barre avant = double travail. | attend le plan Walter, puis **Lot 5** (config seule) | #1445/#1447 amendés + story « sidebar » |
| 10 | Centraliser la bibliothèque média (banque d'images) | 🟠 | Les téléversements sont volontairement rangés par surface (~8 destinations : articles, sections, solutions, nav…) pour que chaque champ propose le bon dossier (`guide-edition.md` § Médias). Pas de vue unique aujourd'hui. Décision à prendre : consolider vers une racine commune (**prospectif seulement** — déplacer l'existant casserait les 60+ articles migrés) et/ou documenter la convention. | décision, puis story dédiée | story « médiathèque » |
| 11 | Balise alt/titre sur toutes les images, y compris les fonds | 🟡 | Bonne nouvelle : **aucune image n'est en fond CSS** — tout est `<img>`, l'alt est donc possible partout. Aujourd'hui 3 composants ont le champ (héros service — **bug corrigé aujourd'hui** : la valeur saisie était ignorée —, héros produit, valeur stratégique) ; ~14 autres emplacements n'ont pas de champ (couvertures d'articles, accueil, bento, témoignages, vignettes solutions…). | **Lot 2** | story « alt éditable partout » |

## T3 — Articles et contenus

| # | Point soulevé | Statut | Réponse | Suite | ADO |
|---|---|---|---|---|---|
| 12 | Intégration HTML : tableaux importés pas esthétiques, images coupées, boutons au milieu du texte — et **non modifiables dans l'éditeur** (ajout 10/09) | 🔴 | 14 articles migrés contiennent des tableaux HTML sans styles (rendu navigateur + styles WordPress résiduels) et quelques images pointant encore en absolu vers `www.victrix.ca`. Comme ce sont des blocs HTML bruts, l'éditeur de contenu CloudCannon ne les ouvre pas en édition riche. À faire : **convertir en tableaux Markdown natifs** (éditables dans l'éditeur de contenu), styler `.prose table` (+ défilement mobile), corriger les `src` absolues. | **Lot 4** | story « nettoyage articles » |
| 13 | Ajouter boutons/CTA sans écrire de HTML ; bannière CTA d'article plus propre | 🔴 (option) | Le corps d'article accepte Markdown + HTML brut ; le seul bouton disponible est une classe à écrire à la main. Solution propre : *snippets* CloudCannon (bouton, bannière CTA, citation) insérables depuis l'éditeur de contenu. Nouvelle capacité, pas un correctif. | option **Epic 2** (~1 j) | story optionnelle « snippets/CTA » |
| 14 | Landing pages pas toutes reprises (M365…) ; menu rétréci à ancres | 🟡 **vérifié 10/09** | **Vérification faite dans l'export** (voir annexe C) : oui, toutes les landing pages du site actuel y figurent (inventaire tiré du dump SQL du 2026-07-23). À rapatrier : 9 pages fournisseurs Approvisionnement TI (fr+en) + Landing Démo O bureau ; 3 décisions (Vœux des fêtes, Liste de prix Check Point, Documents O bureau) ; 3 brouillons jamais publiés à abandonner. Les pages M365 citées = pages **services** déjà migrées. Le menu à ancres = nouvelle capacité. | annexe C ; menu ancré : option **Epic 2** | #1483 amendé + story migration |

## T4 — Traductions FR/EN

| # | Point soulevé | Statut | Réponse | Suite | ADO |
|---|---|---|---|---|---|
| 15 | Comment lier une page FR à sa page EN quand les URL diffèrent | ✅ | **C'était LA question restée ouverte — la réponse existe déjà** : même nom de fichier dans `fr/` et `en/` = pages appariées ; le champ « Slug (URL) » donne à chaque langue son URL propre (ex. `productivite` → EN affiche `/services/productivity-consulting/`). Sélecteur de langue et hreflang suivent tout seuls ; une traduction manquante est signalée au build. Détail en **annexe A** ; procédure éditeur : `guide-edition.md` § Traduire. | présenter à l'équipe (formation #1440) | — |
| 16 | « Productivité » classée sous « Conseil stratégique » au lieu des expertises | 🟡 | Inexact dans le contenu : Productivité est un service **racine** avec 7 sous-pages (O bureau, O Studio, Copilot…). La confusion vient du texte de la page Conseil stratégique (« couvre toutes nos expertises… productivité ») et du méga-menu, où la colonne Expertises ne liste pas Productivité (ses produits sont dans la colonne Produits). Le reclassement est une donnée de navigation **éditable dans le CMS** — à faire selon l'architecture validée. | avec le plan Walter (voir #9) | #1445/#1447 |

## T5 — Mise en ligne et administration

| # | Point soulevé | Statut | Réponse | Suite | ADO |
|---|---|---|---|---|---|
| 17 | URL sans « www » — comment configurer | 🟠 | Rien n'est tranché ni configuré (le domaine réel n'est pas encore branché). Décision = choisir l'URL canonique (apex `victrix.ca` recommandable, impact SEO faible — Walter a raison : **ce qui compte, ce sont les redirections**). Ce que ça implique : DNS + redirection www→apex, `site:` d'Astro et `robots.txt` (placeholders à remplacer de toute façon), matrice 301 (le CSV de migration cible `https://www.victrix.ca/...` en absolu). Détail en **annexe B**. | décision, puis intégrer à la bascule DNS | #1438 amendé |
| 18 | Processus de publication (travailler en « démo », puis publier) | ✅ | Confirmé et documenté : **Save = staging** (lawful-hare), **Publish = production** (overt-pineapple) — `operations.md` §6. ⚠️ La prod est **en retard sur le staging** : faire un Publish avant que l'équipe re-navigue le site. | re-Publish maintenant | — |
| 19 | Licence limitée à 3 utilisateurs (siège de Gabriel retiré) ; ~10 $/siège ; besoin de 4+ | 🟡 | Déjà tracké : task #1622 « CloudCannon licence payante », à prioriser — elle conditionne les invitations (formation #1440), et possiblement CloudCannon Forms (backend retenu pour les formulaires). | action Victrix | #1622 (priorité ↑) |
| 20 | Carte de crédit personnelle de Gabriel sur le compte | 🔴 | À remplacer par une carte d'organisation (Victrix/Cédric) avant la mise en ligne — CloudCannon → Organization Settings → Billing. | action admin Victrix | note dans #1622 |
| 21 | Google Analytics pas intégré ; données dans le tableau de bord | 🟡 | Côté code, tout est prêt (CSP ouverte, consentement Loi 25 branché) : il reste à créer la propriété GA4 et poser `PUBLIC_GA4_ID` sur le build du site de prod (`operations.md` §7ter). L'affichage GA dans le tableau de bord CloudCannon : à vérifier selon le palier de licence. | clés §7ter | #1491/#1492 |
| 22 | Gouvernance d'approbation du contenu (accueil non approuvé, rôle de Stéphanie) | 🟠 | Hors du dépôt — décision d'organisation Victrix. Le CMS supporte les deux niveaux d'accès constatés en rencontre (Walter = config, Julie = éditrice). | décision Victrix | — |
| 23 | Responsivité des gabarits (communiqués, personnalisation) | 🟡 | Couvert par la recette prévue : #1435 (cross-browser + 5 tailles d'écran) — à planifier ; les points précis relevés alimenteront cette story. | recette Epic 4 | #1435 |

## T6 — Ajouts du 2026-09-10 (Gabriel, post-rencontre)

| # | Demande | Statut | Réponse | Suite | ADO |
|---|---|---|---|---|---|
| 24 | « Notre histoire » (Découvrir, fr+en) : ligne du temps en serpentin, cases par année, jalons accentués (2003, 2007, 2016, 2019, 2023) | ✅ **livré 10/09** | Nouveau composant de section « **Ligne du temps** » (palette CloudCannon, vignette incluse) : serpentin 4 colonnes desktop (la ligne descend et repart en sens inverse), colonne verticale mobile, cases Bleu nuit + gros point pour les jalons `accent` (interrupteur « Mettre en évidence » par jalon). Appliqué à Découvrir fr+en avec les 5 années demandées en évidence ; aussi sur la page démo. Plafond : 24 jalons. | à pousser + Publish | — (livré) |
| 25 | Tableaux d'articles : modifiables dans l'éditeur + plus beaux | 🔴 | Intégré au point 12 : conversion HTML→Markdown natif (l'éditeur de contenu sait alors les modifier) + styles. | **Lot 4** | story « nettoyage articles » (AC élargie) |
| 26 | Rapatrier toutes les landing pages — sont-elles dans l'export ? | ✅ vérifié / 🔴 à migrer | Oui (annexe C) : tout ce qui existait au 2026-07-23 est dans l'export ; 9 pages fournisseurs + Landing Démo O bureau à recomposer, 3 décisions, 3 brouillons à abandonner. Réserve : contenu créé côté WP APRÈS le 2026-07-23 → couvert par l'export final au décommission (déjà au checklist) et la vérification back-office de Clément. | planifier la vague (≈2-3 j si 9 fournisseurs) | story migration + #1483 |
| 26b | Page Portail client épurée : formulaire seul, sans mention de démo ; bouton actif sans destination (parité site actuel) ; vue « Mot de passe oublié » (courriel seul) | ✅ **livré 10/09** | `PortalLogin.astro` réécrit : titre « Portail client », courriel + mot de passe (validation native), « Connexion » actif mais intercepté (aucune donnée soumise — champs sans `name`), bascule vers « Entrez le courriel associé avec votre compte pour réinitialiser le mot de passe » + retour. E2e mis à jour (3 tests portail). | à pousser + Publish | — (livré) |
| 27 | Icônes modifiables dans les sections, avec une banque d'icônes définie (« les actuelles ne satisfont pas ») | 🟠 + 🔴 | Aujourd'hui : petits jeux fermés d'icônes SVG dessinées à la main, par composant (clés « dossier », « groupe », « ampoule »…) — choix limité, cohérence moyenne. Proposition : adopter une banque MIT en SVG inline (sous-ensemble ~40 icônes TI/affaires) dans un module partagé + menus déroulants CMS à libellés FR sur toutes les sections à icônes. **Candidate recommandée : Lucide** (trait 2 px cohérent avec l'existant, moderne) ; alternatives : Phosphor (6 graisses), Material Symbols (assorti à CloudCannon, look Google). | décision (choix de la banque), puis ~1 j | story Epic 2 « banque d'icônes » |

---

## À trancher / à faire par Victrix (le « à eux »)

1. **Plan d'architecture cible** (Walter) : structure, URL, redirections — incl. le
   classement de Productivité et la future section Expertises. Débloque #9, #16 et le Lot 5.
2. **www vs apex** (annexe B) — débloque la partie domaine de #1438.
3. **Stratégie médiathèque** : consolidation prospective ou convention par surface documentée.
4. **Gouvernance d'approbation du contenu** (dont la page d'accueil — Stéphanie).
5. **Admin compte CloudCannon** : sièges/palier (#1622) + carte d'organisation.
6. Fournir le **contenu final** des 3 services placeholder et des pages générales
   (`contenu-a-fournir.md`) — indépendant du CMS.

## Tes actions cette semaine (issues des tâches de suivi de la rencontre)

- **Re-Publish prod** (2 min, UI CloudCannon) — avant toute re-navigation par l'équipe.
- **Réponse traductions** : présenter l'annexe A à Clément/Julie (c'était « à clarifier avec Gabriel »).
- **Statut vendredi PM** avec Clément : ce doc = support ; compteurs en synthèse.
- **ADO** : coller les textes de `ado-alignement.md` § 2026-09-10 (amendements + nouvelles stories).

---

## Lots de travail (dev)

| Lot | Contenu | Effort | Quand |
|---|---|---|---|
| **0 ✔ fait 2026-09-10** | Bug alt du héros service corrigé (la saisie CMS est maintenant rendue) ; gabarits d'articles pré-remplis avec Titre SEO + noindex ; libellé « Pages générales » ; Navigation regroupée sous « Contenu du site ». | ~1 h | fait, à commiter/pousser |
| **1 — Métadonnées complètes** | Titre SEO sur campagnes ; titre/description de l'accueil éditables ; méta description d'article distincte (repli sur l'extrait — rien à ressaisir) ; noindex sur accueil (avec garde-fou anti-bourde), contact, carrières, solutions. Option +0,5 j : image de partage (og:image) par page. | ~1 j | 1er |
| **2 — Alt partout** | Champ « Texte alternatif » + câblage sur les ~14 emplacements restants : héros campagne, héros/expertises/solution(s) de l'accueil, bento expertises, solutions exclusives, témoignages, affiche vidéo, couvertures d'articles (cartes + page article + articles liés), vignettes solutions, photos bureaux (contact), témoignages carrières, image vedette du méga-menu. | ~0,5-1 j | 2e |
| **3 — Hiérarchie de titres** | Garde-fou au build : avertir si une page a 0 ou 2 `<h1>` ; styles `.prose` pour h4-h6 (utilisés par les articles migrés). | ~0,5 j | 3e |
| **4 — Nettoyage articles migrés** | Conversion des tableaux HTML en **tableaux Markdown éditables** dans l'éditeur de contenu, styles `.prose table` (+ défilement horizontal mobile), correction des `src` absolues `www.victrix.ca`, harmonisation des CTA existants — 14 articles. | ~0,5-1 j | 4e |
| **5 — Sidebar = architecture + médiathèque** | Miroir de l'architecture validée dans la barre latérale (groupes/ordre, regroupement Expertises) + consolidation des destinations d'upload. **Config pure, zéro risque site.** | ~0,5 j | après plan Walter + décision médiathèque |
| **Epic 2 (options, sur demande)** | Snippets/bannière CTA insérables dans les articles (~1 j) ; menu à ancres pour landings (~1 j) ; niveaux de titres configurables par section (~1 j, à cadrer). | — | si retenus |

---

## Annexe A — Lier une page FR à sa page EN quand les URL diffèrent

Le mécanisme (aucun réglage à faire, c'est la convention du dépôt) :

1. **Le nom de fichier est la clé d'appariement.** `fr/services-ti-geres.json` et
   `en/services-ti-geres.json` sont la même page dans les deux langues.
2. **Le champ « Slug (URL) » donne l'URL propre à chaque langue.** Le fichier EN garde le
   nom FR mais porte par ex. `slug: "managed-services"` → l'URL publiée est
   `/en/services/managed-services/`. Un slug peut contenir `/` pour les pages imbriquées
   (ex. `cybersecurity/zero-trust`).
3. **Tout le reste suit automatiquement** : le bouton FR/EN pointe vers la bonne page,
   les balises hreflang aussi (donc Google apparie les deux versions), le sitemap liste
   les alternates.
4. **Traduction manquante** : le build affiche un avertissement (`[victrix:i18n-pairing]`)
   et le bouton de langue retombe sur l'accueil de l'autre langue en attendant.

Procédure pas-à-pas pour l'équipe : `guide-edition.md` § « Traduire : créer en FR,
dupliquer vers EN ». (Le comportement de duplication observé en rencontre — lien de
traduction copié automatiquement — décrivait l'ancien site WordPress, pas CloudCannon.)

## Annexe B — www vs apex : ce que la décision implique

- **Impact SEO du choix lui-même : faible** (Clément a raison) — à condition que **toutes**
  les variantes redirigent en 301 vers la forme canonique (Walter a raison : le vrai
  chantier, c'est la matrice de redirections).
- Si on retient l'apex `victrix.ca` (forme demandée) :
  1. DNS : pointer l'apex vers CloudCannon (le registraire doit supporter ANAME/ALIAS ou
     CNAME flattening à la racine) + garder `www` en CNAME redirigé 301 vers l'apex
     (CloudCannon gère la redirection du domaine secondaire).
  2. Repo (à la bascule, déjà au checklist go-live) : `site:` dans `astro.config.mjs` et la
     ligne `Sitemap:` de `public/robots.txt` — aujourd'hui encore des placeholders
     `victrix-demo.pages.dev` → deviendraient `https://victrix.ca`.
  3. Matrice 301 : `docs/migration/redirections.csv` cible `https://www.victrix.ca/...` en
     absolu — normaliser vers la forme canonique en générant la matrice finale (#1447).
  4. L'ancien domaine O Studio (`o-studio-catalogue.victrix.ca`) suit le même traitement (#1481).
- Tout ceci s'exécute **le jour de la bascule DNS** (checklist `DEPLOYMENT.md` §7) — la
  seule chose à faire maintenant est de **trancher la forme canonique** et de la noter
  dans #1438.

## Annexe C — Landing pages du site actuel : vérification dans l'export (2026-09-10)

Source : `docs/migration/urls-contenus.csv` (inventaire complet tiré du dump SQL WordPress
du **2026-07-23**) + `content-inventory.md`. Verdict : **oui, tout ce qui existait à cette
date est dans l'export.** Réserve : ce qui a été créé côté WP **après** le 2026-07-23 n'y
est pas — c'est couvert par l'export final prévu au décommission (checklist `DEPLOYMENT.md`
§7) et c'est là que la vérification back-office de Clément garde sa valeur.

**À rapatrier (recomposition avec nos gabarits — le contenu brizy ne se convertit pas
automatiquement) :**

| Pages (fr+en) | IDs WP | État | Destination proposée |
|---|---|---|---|
| 9 fiches fournisseurs Approvisionnement TI : Check Point, Microsoft, ServiceNow, CrowdStrike Falcon, Zscaler, Cisco, Palo Alto Networks, Dell Technologies, HPE Networking | 7849-13489 | publiées, brizy | pages `services` sous approvisionnement-ti (recette service-hero/product-hero) — déjà listées « pas migrées » dans `contenu-a-fournir.md` |
| Landing Démo O bureau | 9770/10079 | publiée, brizy | collection **Campagnes** (vraie landing de conversion, formulaire démo) |

**Décisions à prendre :**

| Page | IDs | Note |
|---|---|---|
| Vœux des fêtes / Holiday Wishes | 8085/8138 | saisonnière (déc. 2025) — reprendre comme campagne ou archiver |
| Liste de prix Check Point | 11508/11515 | noindex, tableau `[victrix_table]` — déjà au registre des « sans équivalent statique » (content-inventory §14) |
| Documents O bureau (page protégée) | 13963 | à traiter avec les 5 PDF protégés au décommission |

**À abandonner (brouillons jamais publiés, événements passés)** : Diner Victrix ×
Palo Alto (3743), « Êtes-vous en sécurité ? » (4989), Évènement Victrix × Cask ×
ServiceNow mai 2025 (7126) — sauf avis contraire de l'équipe.

**Déjà couvert** : les « landing pages Microsoft 365 » évoquées en rencontre sont des
pages *expertise* (Copilot M365, Maximisez M365, Plateforme employé) **déjà migrées** en
pages services ; 3 campagnes existent déjà dans le repo (demo-sections,
evaluation-securite, licences-power-platform).
