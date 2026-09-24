# Catalogue Ø Studio — rapport d’export

> Généré par `scripts/migration/export-catalogue-ostudio.mjs` depuis https://o-studio-catalogue.victrix.ca
> (WordPress FR, API REST ouverte). Le sous-domaine est démantelé au go-live :
> `docs/migration/catalogue-ostudio/` est la copie qui survit. Cache du 2026-09-23.

Les fiches du site (sections, route, CloudCannon) sont générées par le lot **L11**
à partir de cet export — pas du réseau. Ce rapport sert à la relecture humaine :
textes `alt` à écrire, images partagées, prix publics à valider (#1634).

- Fiches exportées : **16** (9 existantes + 7 nouvelles)
- Images : **70** rapatriées — 9.8 Mo
- Textes libres : `_accueil-catalogue.md` (746 mots), `_a-propos.md` (209 mots)
- Erreurs d’extraction : **0** · anomalies de contenu : **5**

## Correspondance source → chez nous

| Fiche source | Chez nous | État | Images | Client | Coût | Délai |
| --- | --- | --- | --- | --- | --- | --- |
| [144-2](https://o-studio-catalogue.victrix.ca/144-2/) | `o-bureau` | carte existante | 6 | Multi-Secteur | Entre 10.000 et 25.000 $ CAD | 1 mois |
| [portail-de-gestion-des-requetes-citoyennes](https://o-studio-catalogue.victrix.ca/portail-de-gestion-des-requetes-citoyennes/) | `portail-requetes-citoyennes` | carte existante | 3 | Secteur municipal | 300.000 $ CAD | Entre 3 et 12 mois |
| [portail-de-gestion-des-requetes-pour-lombudsman](https://o-studio-catalogue.victrix.ca/portail-de-gestion-des-requetes-pour-lombudsman/) | `portail-ombudsman` | carte existante | 6 | Secteur de la Santé, Municipal, Public | Entre 100.000 et 250.000 $CAD | Entre 3 et 12 mois |
| [portail-de-gestion-des-subventions](https://o-studio-catalogue.victrix.ca/portail-de-gestion-des-subventions/) | `portail-subventions` | carte existante | 11 | Secteur public, secteur bancaire | Entre 200.000 et 300.000 $CAD | Entre 3 et 12 mois |
| [gestion-des-idees](https://o-studio-catalogue.victrix.ca/gestion-des-idees/) | `gestion-idees` | carte existante | 3 | Multi-Secteur | Entre 10k et 25k $CAD | 1 mois |
| [gestion-des-horaires-pour-les-etudiants](https://o-studio-catalogue.victrix.ca/gestion-des-horaires-pour-les-etudiants/) | `horaires-etudiants` | carte existante | 2 | Secteur scolaire | Entre 100 000 et 150 000 $CAD | Entre 1 et 3 mois |
| [application-legacy-vers-power-apps](https://o-studio-catalogue.victrix.ca/application-legacy-vers-power-apps/) | `legacy-vers-power-apps` | carte existante | 3 | Multi-Secteur (Municipal, Public, Industriel, etc.) | Entre 100k et 500k $ CAD | Entre 3 et 12 mois |
| [feuille-de-temps-chantier](https://o-studio-catalogue.victrix.ca/feuille-de-temps-chantier/) | `feuille-temps-chantier` | carte existante | 5 | Secteur construction | Entre 50.000 et 100.000 $CAD | Entre 1 et 3 mois |
| [gestion-des-formations-pour-les-employes](https://o-studio-catalogue.victrix.ca/gestion-des-formations-pour-les-employes/) | `gestion-formations` | carte existante | 6 | Secteur industriel | 35.000 $CAD | 1 mois |
| [gouvernance-des-outils-power-platform](https://o-studio-catalogue.victrix.ca/gouvernance-des-outils-power-platform/) | `gouvernance-power-platform` | **à créer** | 12 | Multi-Secteur (Municipal, Public, Industriel, etc.) | Entre 25.000 et 50.000 $CAD | Entre 1 et 3 mois |
| [registre-des-applications-organisationnelles](https://o-studio-catalogue.victrix.ca/registre-des-applications-organisationnelles/) | `registre-applications` | **à créer** | 3 | Secteur Industriel | Entre 25.000 et 50.000 $ CAD | Entre 1 et 3 mois |
| [automatisation-du-processus-de-gestion-contractuelle](https://o-studio-catalogue.victrix.ca/automatisation-du-processus-de-gestion-contractuelle/) | `gestion-contractuelle` | **à créer** | 6 | Secteur de la Santé | Entre 25k et 50k $CAD | Entre 1 et 3 mois |
| [gestion-du-processus-de-recrutement](https://o-studio-catalogue.victrix.ca/gestion-du-processus-de-recrutement/) | `gestion-recrutement` | **à créer** | 1 | Secteur public | 50.000 à 100.000 $CAD | Entre 2 et 4 mois |
| [gestion-du-onboarding-dun-nouvel-employe](https://o-studio-catalogue.victrix.ca/gestion-du-onboarding-dun-nouvel-employe/) | `onboarding-employe` | **à créer** | 1 | Secteur manufacturier | Entre 25.000 et 50.000 $CAD | Entre 2 et 4 mois |
| [gestion-des-comptes-de-depenses](https://o-studio-catalogue.victrix.ca/gestion-des-comptes-de-depenses/) | `comptes-depenses` | **à créer** | 1 | Secteur Construction | Entre 25k et 50k $CAD | Entre 1 et 3 mois |
| [automatisation-du-processus-de-traitement-des-factures](https://o-studio-catalogue.victrix.ca/automatisation-du-processus-de-traitement-des-factures/) | `traitement-factures` | **à créer** | 1 | Secteur municipal | 50.000 $CAD | 1 mois |

## Textes `alt` à rédiger (Julie)

Les 75 images de la source n’ont **aucun** texte alternatif. L’export pose un alt
PROVISOIRE, générique et honnête, déduit de la nature du fichier. Chaque ligne est à
réécrire dans CloudCannon (section « Galerie d’images » de la fiche) : décrire ce que
l’image MONTRE, en une phrase, sans répéter le titre de la fiche.

| Image | Nature | Dimensions | Poids | Alt provisoire |
| --- | --- | --- | --- | --- |
| `/images/solutions/o-bureau/01.jpg` | maquette | 1600×1200 | 178 Ko | Maquette de présentation — Ø Bureau — Réservation de bureaux |
| `/images/solutions/o-bureau/02.png` | capture | 459×241 | 34 Ko | Capture d’écran de l’application — Ø Bureau — Réservation de bureaux |
| `/images/solutions/o-bureau/03.png` | capture | 481×267 | 35 Ko | Capture d’écran de l’application — Ø Bureau — Réservation de bureaux |
| `/images/solutions/o-bureau/04.png` | capture | 686×370 | 75 Ko | Capture d’écran de l’application — Ø Bureau — Réservation de bureaux |
| `/images/solutions/o-bureau/05.png` | capture | 475×213 | 25 Ko | Capture d’écran de l’application — Ø Bureau — Réservation de bureaux |
| `/images/solutions/o-bureau/06.jpg` | capture | 196×383 | 12 Ko | Capture d’écran de l’application — Ø Bureau — Réservation de bureaux |
| `/images/solutions/portail-requetes-citoyennes/01.jpg` | maquette | 1600×1200 | 195 Ko | Maquette de présentation — Portail de gestion des requêtes citoyennes |
| `/images/solutions/portail-requetes-citoyennes/02.png` | capture | 1917×957 | 80 Ko | Capture d’écran de l’application — Portail de gestion des requêtes citoyennes |
| `/images/solutions/portail-requetes-citoyennes/03.png` | capture | 1899×941 | 73 Ko | Capture d’écran de l’application — Portail de gestion des requêtes citoyennes |
| `/images/solutions/portail-ombudsman/01.png` | maquette | 1600×902 | 1136 Ko | Maquette de présentation — Portail de gestion des requêtes pour l’Ombudsman |
| `/images/solutions/portail-ombudsman/02.jpg` | capture | 1600×623 | 33 Ko | Capture d’écran de l’application — Portail de gestion des requêtes pour l’Ombudsman |
| `/images/solutions/portail-ombudsman/03.jpg` | capture | 1600×733 | 58 Ko | Capture d’écran de l’application — Portail de gestion des requêtes pour l’Ombudsman |
| `/images/solutions/portail-ombudsman/04.jpg` | capture | 1600×759 | 111 Ko | Capture d’écran de l’application — Portail de gestion des requêtes pour l’Ombudsman |
| `/images/solutions/portail-ombudsman/05.jpg` | capture | 1600×761 | 131 Ko | Capture d’écran de l’application — Portail de gestion des requêtes pour l’Ombudsman |
| `/images/solutions/portail-ombudsman/06.jpg` | capture | 1600×815 | 127 Ko | Capture d’écran de l’application — Portail de gestion des requêtes pour l’Ombudsman |
| `/images/solutions/portail-subventions/01.jpg` | maquette | 1600×1200 | 168 Ko | Maquette de présentation — Portail de gestion des subventions |
| `/images/solutions/portail-subventions/02.png` | capture | 1280×612 | 348 Ko | Capture d’écran de l’application — Portail de gestion des subventions |
| `/images/solutions/portail-subventions/03.png` | capture | 1280×613 | 55 Ko | Capture d’écran de l’application — Portail de gestion des subventions |
| `/images/solutions/portail-subventions/04.png` | capture | 1280×609 | 54 Ko | Capture d’écran de l’application — Portail de gestion des subventions |
| `/images/solutions/portail-subventions/05.png` | capture | 1280×610 | 161 Ko | Capture d’écran de l’application — Portail de gestion des subventions |
| `/images/solutions/portail-subventions/06.png` | capture | 1280×609 | 147 Ko | Capture d’écran de l’application — Portail de gestion des subventions |
| `/images/solutions/portail-subventions/07.png` | capture | 1280×612 | 113 Ko | Capture d’écran de l’application — Portail de gestion des subventions |
| `/images/solutions/portail-subventions/08.png` | capture | 1280×608 | 96 Ko | Capture d’écran de l’application — Portail de gestion des subventions |
| `/images/solutions/portail-subventions/09.png` | capture | 1280×609 | 119 Ko | Capture d’écran de l’application — Portail de gestion des subventions |
| `/images/solutions/portail-subventions/10.png` | capture | 1280×601 | 81 Ko | Capture d’écran de l’application — Portail de gestion des subventions |
| `/images/solutions/portail-subventions/11.png` | capture | 1280×608 | 142 Ko | Capture d’écran de l’application — Portail de gestion des subventions |
| `/images/solutions/gestion-idees/01.jpg` | maquette | 1600×1067 | 248 Ko | Maquette de présentation — Gestion des idées |
| `/images/solutions/gestion-idees/02.png` | capture | 1917×865 | 86 Ko | Capture d’écran de l’application — Gestion des idées |
| `/images/solutions/gestion-idees/03.png` | capture | 828×1792 | 90 Ko | Capture d’écran de l’application — Gestion des idées |
| `/images/solutions/horaires-etudiants/01.jpg` | maquette | 1600×1200 | 140 Ko | Maquette de présentation — Gestion des horaires pour les étudiants |
| `/images/solutions/horaires-etudiants/02.png` | capture | 1911×900 | 71 Ko | Capture d’écran de l’application — Gestion des horaires pour les étudiants |
| `/images/solutions/legacy-vers-power-apps/01.jpg` | maquette | 1600×1067 | 248 Ko | Maquette de présentation — Application Legacy vers Power Apps |
| `/images/solutions/legacy-vers-power-apps/02.png` | capture | 1917×865 | 86 Ko | Capture d’écran de l’application — Application Legacy vers Power Apps |
| `/images/solutions/legacy-vers-power-apps/03.png` | capture | 828×1792 | 90 Ko | Capture d’écran de l’application — Application Legacy vers Power Apps |
| `/images/solutions/feuille-temps-chantier/01.jpg` | maquette | 1600×1200 | 305 Ko | Maquette de présentation — Feuille de temps chantier |
| `/images/solutions/feuille-temps-chantier/02.png` | capture | 522×921 | 39 Ko | Capture d’écran de l’application — Feuille de temps chantier |
| `/images/solutions/feuille-temps-chantier/03.png` | capture | 518×920 | 47 Ko | Capture d’écran de l’application — Feuille de temps chantier |
| `/images/solutions/feuille-temps-chantier/04.png` | capture | 522×923 | 40 Ko | Capture d’écran de l’application — Feuille de temps chantier |
| `/images/solutions/feuille-temps-chantier/05.png` | capture | 523×921 | 33 Ko | Capture d’écran de l’application — Feuille de temps chantier |
| `/images/solutions/gestion-formations/01.jpg` | maquette | 1600×1200 | 258 Ko | Maquette de présentation — Gestion des formations pour les employés |
| `/images/solutions/gestion-formations/02.png` | capture | 1531×860 | 85 Ko | Capture d’écran de l’application — Gestion des formations pour les employés |
| `/images/solutions/gestion-formations/03.png` | capture | 1532×860 | 77 Ko | Capture d’écran de l’application — Gestion des formations pour les employés |
| `/images/solutions/gestion-formations/04.png` | capture | 1530×860 | 73 Ko | Capture d’écran de l’application — Gestion des formations pour les employés |
| `/images/solutions/gestion-formations/05.png` | capture | 1531×860 | 72 Ko | Capture d’écran de l’application — Gestion des formations pour les employés |
| `/images/solutions/gestion-formations/06.png` | capture | 1532×861 | 79 Ko | Capture d’écran de l’application — Gestion des formations pour les employés |
| `/images/solutions/gouvernance-power-platform/01.jpg` | maquette | 1600×1200 | 157 Ko | Maquette de présentation — Gouvernance des outils Power Platform |
| `/images/solutions/gouvernance-power-platform/02.png` | capture | 1460×819 | 67 Ko | Capture d’écran de l’application — Gouvernance des outils Power Platform |
| `/images/solutions/gouvernance-power-platform/03.png` | capture | 1920×931 | 371 Ko | Capture d’écran de l’application — Gouvernance des outils Power Platform |
| `/images/solutions/gouvernance-power-platform/04.png` | capture | 1914×927 | 344 Ko | Capture d’écran de l’application — Gouvernance des outils Power Platform |
| `/images/solutions/gouvernance-power-platform/05.png` | capture | 1465×819 | 437 Ko | Capture d’écran de l’application — Gouvernance des outils Power Platform |
| `/images/solutions/gouvernance-power-platform/06.png` | capture | 1465×819 | 508 Ko | Capture d’écran de l’application — Gouvernance des outils Power Platform |
| `/images/solutions/gouvernance-power-platform/07.png` | capture | 1438×1528 | 357 Ko | Capture d’écran de l’application — Gouvernance des outils Power Platform |
| `/images/solutions/gouvernance-power-platform/08.png` | capture | 1460×1528 | 175 Ko | Capture d’écran de l’application — Gouvernance des outils Power Platform |
| `/images/solutions/gouvernance-power-platform/09.png` | capture | 1920×931 | 127 Ko | Capture d’écran de l’application — Gouvernance des outils Power Platform |
| `/images/solutions/gouvernance-power-platform/10.png` | capture | 1909×924 | 123 Ko | Capture d’écran de l’application — Gouvernance des outils Power Platform |
| `/images/solutions/gouvernance-power-platform/11.png` | capture | 1461×816 | 73 Ko | Capture d’écran de l’application — Gouvernance des outils Power Platform |
| `/images/solutions/gouvernance-power-platform/12.png` | capture | 1438×813 | 63 Ko | Capture d’écran de l’application — Gouvernance des outils Power Platform |
| `/images/solutions/registre-applications/01.jpg` | maquette | 1600×1200 | 195 Ko | Maquette de présentation — Registre des applications organisationnelles |
| `/images/solutions/registre-applications/02.png` | capture | 1555×876 | 146 Ko | Capture d’écran de l’application — Registre des applications organisationnelles |
| `/images/solutions/registre-applications/03.png` | capture | 1558×877 | 128 Ko | Capture d’écran de l’application — Registre des applications organisationnelles |
| `/images/solutions/gestion-contractuelle/01.jpg` | maquette | 1600×1067 | 89 Ko | Maquette de présentation — Automatisation du processus de gestion contractuelle |
| `/images/solutions/gestion-contractuelle/02.jpg` | capture | 1235×809 | 36 Ko | Capture d’écran de l’application — Automatisation du processus de gestion contractuelle |
| `/images/solutions/gestion-contractuelle/03.jpg` | capture | 1235×809 | 44 Ko | Capture d’écran de l’application — Automatisation du processus de gestion contractuelle |
| `/images/solutions/gestion-contractuelle/04.jpg` | capture | 1235×809 | 36 Ko | Capture d’écran de l’application — Automatisation du processus de gestion contractuelle |
| `/images/solutions/gestion-contractuelle/05.jpg` | capture | 1235×809 | 58 Ko | Capture d’écran de l’application — Automatisation du processus de gestion contractuelle |
| `/images/solutions/gestion-contractuelle/06.jpg` | capture | 1235×809 | 54 Ko | Capture d’écran de l’application — Automatisation du processus de gestion contractuelle |
| `/images/solutions/gestion-recrutement/01.jpg` | banque | 1600×1016 | 125 Ko | Photographie d’illustration — Gestion du processus de recrutement |
| `/images/solutions/onboarding-employe/01.jpg` | banque | 1600×1067 | 178 Ko | Photographie d’illustration — Gestion du onboarding d’un nouvel employé |
| `/images/solutions/comptes-depenses/01.jpg` | banque | 1600×1067 | 135 Ko | Photographie d’illustration — Gestion des comptes de dépenses |
| `/images/solutions/traitement-factures/01.jpg` | banque | 1600×1067 | 94 Ko | Photographie d’illustration — Automatisation du processus de traitement des factures |

## Anomalies de contenu (source)

Faits de la source, pas des échecs d’import : à trancher avec Ø Studio / le marketing.

- portail-requetes-citoyennes + registre-applications — même image dans 2 fiches : macbook-mockup2-1.jpg — à confirmer avec Ø Studio
- gestion-idees + legacy-vers-power-apps — même image dans 2 fiches : 1.-main-file-1.jpg — à confirmer avec Ø Studio
- gestion-idees + legacy-vers-power-apps — même image dans 2 fiches : capex2.png — à confirmer avec Ø Studio
- gestion-idees + legacy-vers-power-apps — même image dans 2 fiches : capex.png — à confirmer avec Ø Studio
- portail-requetes-citoyennes + horaires-etudiants — introduction IDENTIQUE sur 2 fiches — texte à réécrire

## Points d’attention connus

- **Prix publics** : les fiches affichent des fourchettes de coûts (10 k$ → 500 k$).
  Décision prise : publication en `noindex` jusqu’à la validation Ø Studio (ADO #1634).
- **Photos de banque** (nature « banque », horodatage Envato dans le nom) : licence à
  confirmer avant publication.
- **Anglais** : la source est FR seulement. Les 16 fiches EN demandent une traduction
  de contenu (Victrix) ; sans fichier EN, le sélecteur de langue retombe sur l’accueil.
- **Redirections** : les 16 URL de `o-studio-catalogue.victrix.ca` se redirigent côté
  DNS/Cloudflare, pas dans `routing.json` (#1503).

