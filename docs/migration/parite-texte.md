# Parité du texte : l'ancien site est-il arrivé entier ?

> Généré par `npm run check:parite-texte` — **ne pas modifier à la main.**
> Mesuré contre le build `./dist` et les pages EN LIGNE de victrix.ca
> (cache `docs/migration/cache-source/`, 169 pages, téléchargées du 2026-09-23 au 2026-09-24).

La question posée, page par page : **le texte de l'ancienne page est-il**
**arrivé sur la page qui la remplace ?** `check:old-urls` prouve que chaque
adresse mène quelque part ; ce rapport compare les VOLUMES et les TITRES.

## Bilan

| | Nombre |
| --- | --- |
| Pages cibles comparées (une ligne par page construite) | 138 |
| **Signalées** (ratio < 0,7 ou ≥ 1 bloc perdu) | **3** |
| dont ratio cible / source < 0,7 | 2 |
| dont ≥ 1 bloc perdu (titre H2/H3 ET son texte absents de la cible) | 1 |
| Adresses anciennes hors comparaison (décisions, sources illisibles, sans page) | 24 |

Et 75 pages où un titre de la source est absent mais son texte retrouvé (≈ titre
reformulé ou raccourci par la refonte) : listées, **non signalées**.

Mots de la source : contenu principal lu par le parseur de `extract-source-page.py`
(titres, paragraphes, listes ; sans en-tête, pied, nav, formulaires, barre
promotionnelle, carrousel d'articles, bandeau de contact, fil d'Ariane).
Mots de la cible : `<main>` du build, sans nav, formulaires, scripts ni blocs
`data-pagefind-ignore` (fil d'Ariane, articles liés recalculés au build).
**Une cible plus longue n'est pas un défaut.** Un titre est « absent » quand,
normalisé (casse, accents, ponctuation), il n'apparaît nulle part dans `<main>`.
Il est ✗ **bloc perdu** si moins de 50 % des mots significatifs (≥ 5 lettres) des
paragraphes qui le suivent sont dans la cible (le pourcentage retrouvé est entre
parenthèses), ≈ **reformulé** sinon, ou si le bloc n'a pas de texte à perdre.

## Les 3 pires, toutes rubriques confondues

Pour la passe à la main : contenu perdu à restaurer, bloc abandonné
volontairement, ou faux positif du parseur — Gabriel tranche, la restauration
est le lot L-restaure.

| | Page cible | Adresse source | Mots source | Mots cible | Ratio | Titres H2/H3 absents de la cible | Fichier du dépôt |
| --- | --- | --- | ---: | ---: | ---: | --- | --- |
| ☑ assumée — Page système REDESSINÉE (lot L-restaure, 2026-09-23). L'ancienne page de remerciement servait de plan de site officieux : ≈ 25 liens de services et la promesse d'un rappel « dans les 24 heures ». La nôtre tient en une phrase et deux boutons, la navigation étant assurée par l'en-tête. docs/migration/inventaire-campagnes.md § 2 ne demandait que d'en vérifier les liens. | `/fr/merci/` | `/page-de-remerciement/` | 131 | 14 | 0,11 |  | (gabarit de page) |
| ☑ assumée — Page système REDESSINÉE (lot L-restaure, 2026-09-23) — même décision que /fr/merci/. | `/en/merci/` | `/en/thank-you-page/` | 46 | 18 | 0,39 |  | (gabarit de page) |
| ☑ assumée — Abandon VOLONTAIRE (lot L-restaure, 2026-09-23). L'ancienne page finissait par deux blocs que la refonte ne reprend pas : « Vie chez Victrix » (18 mots, teaser vers Carrières — la page Carrières porte maintenant ce contenu) et « Ils nous font confiance » (bandeau de logos sans texte, rattaché à la décision D4 sur les logos). La page EN équivalente n'est pas signalée. | `/fr/services/conseil-strategique/` | `/expertise/conseil-strategique/` | 322 | 309 | 0,96 | ✗ « Vie chez Victrix » (30 %)<br>≈ « Rencontrez nos experts » · « Ils nous fontconfiance » · « Assurez le succès de vos projets stratégiques avec Victrix » | `src/content/services/fr/conseil-strategique.json` |

## Services — 66 pages, 1 signalées

| | Page cible | Adresse source | Mots source | Mots cible | Ratio | Titres H2/H3 absents de la cible | Fichier du dépôt |
| --- | --- | --- | ---: | ---: | ---: | --- | --- |
|  | `/fr/services/services-infonuagiques/` | `/expertise/services-infonuagiques/` | 841 | 652 | 0,78 | ≈ « Amazon Web Services (AWS) » · « Éléments à analyser » · « Gradation de la preuve de concept » (+1) | `src/content/services/fr/services-infonuagiques.json` |
|  | `/en/services/cloud-services-provider/` | `/en/expertise/cloud-services-provider/` | 732 | 568 | 0,78 | ≈ « Microsoft Azure Cloud Services » · « Amazon Web Services (AWS) » · « Elements to Analyze » (+2) | `src/content/services/en/services-infonuagiques.json` |
|  | `/fr/services/approvisionnement-ti/` | `/expertise/approvisionnement-ti/` | 918 | 781 | 0,85 | ≈ « Un approvisionnement TI stratégique, sécurisé et géré ave… » · « Solutions technologiques et partenariats pour une infrast… » · « Vous avez besoin d'aide pour la sélection et l'achat de v… » (+3) | `src/content/services/fr/approvisionnement-ti.json` |
|  | `/en/services/it-procurement/` | `/en/expertise/it-procurement/` | 758 | 669 | 0,88 | ≈ « Strategic, Secure, and Managed IT Procurement with Victrix » · « Technology Solutions and Partnerships for a High-Performa… » · « Need Expert Guidance with Your IT Hardware Purchases? » (+3) | `src/content/services/en/approvisionnement-ti.json` |
|  | `/en/services/cybersecurity/zero-trust/` | `/en/expertise/cybersecurity/zero-trust/` | 272 | 243 | 0,89 | ≈ « 1. Seamless user experience 2. Continuous auditing 3. Lea… » · « By 2025, 60% of enterprises will use Zero Trust solutions… » · « Discover Harmony Connect, Check Point's SASE Solution » (+1) | `src/content/services/en/cybersecurite/zero-trust.json` |
|  | `/fr/services/cybersecurite/internet-des-objets-service-iot/` | `/expertise/cybersecurite/internet-des-objets-service-iot/` | 515 | 463 | 0,90 | ≈ « Victrix assure la sécurité des systèmes IoT et OT » · « Expertise sectorielle en OT/IoT et cybersécurité » | `src/content/services/fr/cybersecurite/internet-des-objets-service-iot.json` |
|  | `/fr/services/cybersecurite/zero-trust/` | `/expertise/cybersecurite/zero-trust/` | 318 | 286 | 0,90 | ≈ « En 2025, 60 % des entreprises utiliseront des solutions «… » · « Victrix: Sécurisez vos données avec le modèle Zero Trust » · « Découvrez Harmony Connect, la solution SASE de Check Point » (+1) | `src/content/services/fr/cybersecurite/zero-trust.json` |
|  | `/en/services/managed-it-services/` | `/en/expertise/managed-it-services/` | 841 | 759 | 0,90 | ≈ « Discover How Our Managed IT Services Empower Your Teams t… » · « Compare Victrix Managed Services vs. In-House IT Management » | `src/content/services/en/services-ti-geres.json` |
|  | `/fr/services/services-infonuagiques/migration-vers-azure/` | `/expertise/services-infonuagiques/migration-vers-azure/` | 973 | 889 | 0,91 | ≈ « En savoir plus sur les services infonuagiques Microsoft A… » · « Nos services Microsoft Azure » · « Partenaire de solutions Microsoft et services Azure gérés » (+1) | `src/content/services/fr/services-infonuagiques/migration-vers-azure.json` |
|  | `/en/services/cybersecurity/internet-of-things-iot/` | `/en/expertise/cybersecurity/internet-of-things-iot/` | 453 | 414 | 0,91 |  | `src/content/services/en/cybersecurite/internet-des-objets-service-iot.json` |
|  | `/en/services/cloud-services-provider/azure-migration/` | `/en/expertise/cloud-services-provider/azure-migration/` | 797 | 751 | 0,94 | ≈ « Learn More About Microsoft Azure Cloud Services » · « Our Microsoft Azure Services » · « Microsoft Solution Partner and Azure Managed Services » (+1) | `src/content/services/en/services-infonuagiques/migration-vers-azure.json` |
|  | `/fr/services/services-infonuagiques/services-aws/` | `/expertise/services-infonuagiques/services-aws/` | 715 | 675 | 0,94 | ≈ « En savoir plus sur la solution infonuagique AWS » · « Assurez une migration fluide, sécuritaire et efficace ave… » · « Analyse complète — Recommandations basée sur notre expert… » | `src/content/services/fr/services-infonuagiques/services-aws.json` |
|  | `/en/services/cloud-services-provider/aws-services/` | `/en/expertise/cloud-services-provider/aws-services/` | 585 | 559 | 0,96 | ≈ « Learn More About the AWS Cloud Solution » · « Ensure Smooth, Secure and Efficient Migration with Victri… » | `src/content/services/en/services-infonuagiques/services-aws.json` |
|  | `/en/services/strategic-advice/` | `/en/expertise/strategic-advice/` | 296 | 283 | 0,96 | ≈ « Meet our experts » · « Life at Victrix » | `src/content/services/en/conseil-strategique.json` |
| ☑ assumée — Abandon VOLONTAIRE (lot L-restaure, 2026-09-23). L'ancienne page finissait par deux blocs que la refonte ne reprend pas : « Vie chez Victrix » (18 mots, teaser vers Carrières — la page Carrières porte maintenant ce contenu) et « Ils nous font confiance » (bandeau de logos sans texte, rattaché à la décision D4 sur les logos). La page EN équivalente n'est pas signalée. | `/fr/services/conseil-strategique/` | `/expertise/conseil-strategique/` | 322 | 309 | 0,96 | ✗ « Vie chez Victrix » (30 %)<br>≈ « Rencontrez nos experts » · « Ils nous fontconfiance » · « Assurez le succès de vos projets stratégiques avec Victrix » | `src/content/services/fr/conseil-strategique.json` |
|  | `/fr/services/approvisionnement-ti/check-point/` | `/expertise/approvisionnement-ti/check-point/` | 993 | 960 | 0,97 | ≈ « Obtenir des solutions Check Point » | `src/content/services/fr/approvisionnement-ti/check-point.json` |
|  | `/fr/services/cybersecurite/centre-operationnel-de-securite-evolutif/` | `/expertise/cybersecurite/centre-operationnel-de-securite-evolutif/` (+1) | 637 | 618 | 0,97 | ≈ « Intéressés ? Des questions ? » · « Une offre adaptative » · « Bénéficiez de notre centre opérationnel de sécurité évolu… » | `src/content/services/fr/cybersecurite/centre-operationnel-de-securite-evolutif.json` |
|  | `/en/services/cybersecurity/scalable-security-operations-center/` | `/en/expertise/cybersecurity/scalable-security-operations-center/` | 572 | 555 | 0,97 | ≈ « Interested? Have Any Questions? » · « An Adaptative Cybersecurity Solution » | `src/content/services/en/cybersecurite/centre-operationnel-de-securite-evolutif.json` |
|  | `/en/services/it-procurement/check-point/` | `/en/expertise/it-procurement/check-point/` | 806 | 786 | 0,98 | ≈ « Request Your Check Point Cybersecurity Solutions » | `src/content/services/en/approvisionnement-ti/check-point.json` |
|  | `/fr/services/intelligence-artificielle/accompagnement/` | `/expertise/intelligence-artificielle/accompagnement/` | 1757 | 1726 | 0,98 | ≈ « Exemples d'initiatives découlant de notre accompagnement … » · « Notre démarche d'accompagnement en intelligence artificie… » · « Un accompagnement en IA où chacun bénéficie de gains conc… » | `src/content/services/fr/intelligence-artificielle/accompagnement.json` |
|  | `/fr/services/approvisionnement-ti/palo-alto-networks/` | `/expertise/approvisionnement-ti/palo-alto-networks/` | 758 | 748 | 0,99 |  | `src/content/services/fr/approvisionnement-ti/palo-alto-networks.json` |
|  | `/fr/services/approvisionnement-ti/crowdstrike-falcon/` | `/expertise/approvisionnement-ti/crowdstrike-falcon/` | 920 | 918 | 1,00 | ≈ « Obtenir des solutions CrowdStrike Falcon » | `src/content/services/fr/approvisionnement-ti/crowdstrike-falcon.json` |
|  | `/fr/services/services-ti-geres/` | `/expertise/services-ti-geres/` (+1) | 1023 | 1025 | 1,00 | ≈ « Une couverture de services gérés axée sur la sécurité et … » · « Victrix: une prise en charge qui résout vos défis de gest… » · « En savoir plus sur nos services gérés TI » (+3) | `src/content/services/fr/services-ti-geres.json` |
|  | `/fr/services/productivite/o-bureau/` | `/expertise/productivite/o-bureau/` | 258 | 259 | 1,00 | ≈ « LES AVANTAGES DE NOTRE APPLICATION DE RÉSERVATION DE BUREAU » | `src/content/services/fr/productivite/o-bureau.json` |
|  | `/fr/services/approvisionnement-ti/cisco/` | `/expertise/approvisionnement-ti/cisco/` | 931 | 935 | 1,00 | ≈ « Obtenir des solutions Cisco » | `src/content/services/fr/approvisionnement-ti/cisco.json` |
|  | `/fr/services/approvisionnement-ti/dell-technologies/` | `/expertise/approvisionnement-ti/dell-technologies/` | 1039 | 1044 | 1,00 | ≈ « Obtenir des solutions Dell Technologies » | `src/content/services/fr/approvisionnement-ti/dell-technologies.json` |
|  | `/fr/services/approvisionnement-ti/servicenow/` | `/expertise/approvisionnement-ti/servicenow/` (+1) | 1124 | 1134 | 1,01 | ≈ « Obtenir des solutions ServiceNow » | `src/content/services/fr/approvisionnement-ti/servicenow.json` |
|  | `/fr/services/approvisionnement-ti/zscaler/` | `/expertise/approvisionnement-ti/zscaler/` | 1075 | 1085 | 1,01 | ≈ « Obtenir des solutions Zscaler » | `src/content/services/fr/approvisionnement-ti/zscaler.json` |
|  | `/en/services/it-procurement/crowdstrike-falcon/` | `/en/expertise/it-procurement/crowdstrike-falcon/` | 718 | 725 | 1,01 | ≈ « Request Your CrowdStrike Falcon Solution » | `src/content/services/en/approvisionnement-ti/crowdstrike-falcon.json` |
|  | `/en/services/it-procurement/cisco/` | `/en/expertise/it-procurement/cisco/` | 851 | 860 | 1,01 | ≈ « Request Your Cisco Solutions » | `src/content/services/en/approvisionnement-ti/cisco.json` |
|  | `/en/services/it-procurement/dell-technologies/` | `/en/expertise/it-procurement/dell-technologies/` | 839 | 848 | 1,01 | ≈ « Request Your Dell Technologies Solutions » | `src/content/services/en/approvisionnement-ti/dell-technologies.json` |
|  | `/en/services/it-procurement/zscaler/` | `/en/expertise/it-procurement/zscaler/` | 874 | 884 | 1,01 | ≈ « Request Your Zscaler Zero Trust Solutions » | `src/content/services/en/approvisionnement-ti/zscaler.json` |
|  | `/en/services/artificial-intelligence/consulting/` | `/en/expertise/artificial-intelligence/consulting/` | 1510 | 1529 | 1,01 | ≈ « Examples of Initiatives From Our Strategic, Applied AI Co… » · « Artificial Intelligence Consulting That Delivers Real Gai… » | `src/content/services/en/intelligence-artificielle/accompagnement.json` |
|  | `/en/services/it-procurement/palo-alto-networks/` | `/en/expertise/it-procurement/palo-alto-networks/` | 659 | 668 | 1,01 | ≈ « Request Your Palo Alto Networks Solution » | `src/content/services/en/approvisionnement-ti/palo-alto-networks.json` |
|  | `/en/services/productivity-consulting/office-booking/` | `/en/expertise/productivity-consulting/office-booking/` | 205 | 208 | 1,01 | ≈ « THE BENEFITS OF OUR OFFICE RESERVATION APPLICATION INCLUDE » | `src/content/services/en/productivite/o-bureau.json` |
|  | `/en/services/it-procurement/hpe-networking/` | `/en/expertise/it-procurement/hpe-networking/` | 954 | 968 | 1,01 | ≈ « Request Your HPE Networking Solutions » | `src/content/services/en/approvisionnement-ti/hpe-networking.json` |
|  | `/fr/services/approvisionnement-ti/hpe-networking/` | `/expertise/approvisionnement-ti/hpe-networking/` | 1167 | 1185 | 1,02 | ≈ « Obtenir des solutions HPE Networking » | `src/content/services/fr/approvisionnement-ti/hpe-networking.json` |
|  | `/en/services/it-procurement/servicenow/` | `/en/expertise/it-procurement/servicenow/` (+1) | 905 | 920 | 1,02 | ≈ « Request Your ServiceNow Solutions » | `src/content/services/en/approvisionnement-ti/servicenow.json` |
|  | `/fr/services/approvisionnement-ti/solutions-microsoft/` | `/expertise/approvisionnement-ti/solutions-microsoft/` | 853 | 870 | 1,02 | ≈ « Obtenir des solutions Microsoft » | `src/content/services/fr/approvisionnement-ti/solutions-microsoft.json` |
|  | `/fr/services/productivite/o-studio/` | `/expertise/productivite/o-studio/` | 694 | 710 | 1,02 | ≈ « FAQ — Développement d’applications Microsoft Power Platfo… » | `src/content/services/fr/productivite/o-studio.json` |
|  | `/en/services/it-procurement/microsoft-solutions/` | `/en/expertise/it-procurement/microsoft-solutions/` | 701 | 720 | 1,03 | ≈ « Request Your Microsoft Solutions » | `src/content/services/en/approvisionnement-ti/solutions-microsoft.json` |
|  | `/en/services/artificial-intelligence/` | `/en/expertise/artificial-intelligence/` | 629 | 647 | 1,03 | ≈ « We put AI to Work for Businesses and Public Organizations » · « Do You Have Questions About an Artificial Intelligence Pr… » · « Expertise in Artificial Intelligence » (+4) | `src/content/services/en/intelligence-artificielle.json` |
|  | `/fr/services/intelligence-artificielle/` | `/expertise/intelligence-artificielle/` | 729 | 750 | 1,03 | ≈ « Nous mettons l’intelligence artificielle au service des e… » · « Comment Victrix collabore avec vos équipes pour une adopt… » · « Vous avez des questions concernant un projet en intellige… » (+4) | `src/content/services/fr/intelligence-artificielle.json` |
|  | `/fr/services/services-ti-geres/maximisez-lutilisation-de-votre-ecosysteme-m365/` | `/expertise/services-ti-geres/maximisez-lutilisation-de-votre-ecosysteme-m365/` | 218 | 225 | 1,03 |  | `src/content/services/fr/services-ti-geres/maximisez-lutilisation-de-votre-ecosysteme-m365.json` |
|  | `/fr/services/cybersecurite/test-intrusion-pentest/` | `/expertise/cybersecurite/test-intrusion-pentest/` | 324 | 337 | 1,04 | ≈ « Pourquoi utiliser un service de test d'intrusion? » · « Demandez votre campagne de tests d'intrusion » | `src/content/services/fr/cybersecurite/test-intrusion-pentest.json` |
|  | `/en/services/productivity-consulting/copilot-for-microsoft-365/` | `/en/expertise/productivity-consulting/copilot-for-microsoft-365/` | 298 | 310 | 1,04 | ≈ « Challenges in Adopting Copilot for Microsoft 365 » · « Our Structured Adoption Strategy to Ensure Your Success w… » · « Develop Tailored Copilots to Maximize Efficiency » | `src/content/services/en/productivite/copilot-microsoft-365.json` |
|  | `/fr/services/productivite/dynamics-365-field-service/` | `/expertise/productivite/dynamics-365-field-service/` | 1080 | 1133 | 1,05 | ≈ « Les enjeux de gestion des opérations terrain pour les org… » · « Pourquoi choisir Victrix pour votre implémentation Dynami… » · « Dynamics 365 Field Service: encadrer, structurer et optim… » (+3) | `src/content/services/fr/productivite/dynamics-365-field-service.json` |
|  | `/en/services/productivity-consulting/dynamics-365-field-service/` | `/en/expertise/productivity-consulting/dynamics-365-field-service/` | 980 | 1032 | 1,05 | ≈ « Field Service Management Challenges for Canadian Organiza… » · « Why Choose Victrix for Your Dynamics 365 Field Service Im… » · « Dynamics 365 Field Service: Manage, Structure and Optimiz… » (+3) | `src/content/services/en/productivite/dynamics-365-field-service.json` |
|  | `/en/services/managed-it-services/maximize-the-use-of-your-m365-ecosystem/` | `/en/expertise/managed-it-services/maximize-the-use-of-your-m365-ecosystem/` | 194 | 208 | 1,07 |  | `src/content/services/en/services-ti-geres/maximisez-lutilisation-de-votre-ecosysteme-m365.json` |
|  | `/fr/services/intelligence-artificielle/analyse-opportunites-ia/` | `/expertise/intelligence-artificielle/analyse-opportunites-ia/` | 373 | 404 | 1,08 | ≈ « Pourquoi explorer vos opportunité en IA ? » · « Identifier les utilisations de l'IA en entreprise pour ac… » · « Vous vous demandez comment commencer à utiliser l’IA au s… » (+1) | `src/content/services/fr/intelligence-artificielle/analyse-opportunites-ia.json` |
|  | `/en/services/artificial-intelligence/ai-opportunity-analysis/` | `/en/expertise/artificial-intelligence/ai-opportunity-analysis/` | 335 | 364 | 1,09 | ≈ « Not sure how to start integrating AI into your business? » · « Let's Meet » | `src/content/services/en/intelligence-artificielle/analyse-opportunites-ia.json` |
|  | `/fr/services/productivite/copilot-microsoft-365/` | `/expertise/productivite/copilot-microsoft-365/` | 341 | 373 | 1,09 | ≈ « Les enjeux à l’adoption de Copilot pour Microsoft 365 » · « Choisissez les licences Copilot pour Microsoft 365 adapté… » · « Notre stratégie d’adoption structurée pour assurer votre … » (+1) | `src/content/services/fr/productivite/copilot-microsoft-365.json` |
|  | `/en/services/productivity-consulting/o-studio/` | `/en/expertise/productivity-consulting/o-studio/` | 574 | 632 | 1,10 |  | `src/content/services/en/productivite/o-studio.json` |
|  | `/en/services/productivity-consulting/` | `/en/expertise/productivity-consulting/` | 574 | 641 | 1,12 | ≈ « Our Productivity Expertise » · « Our Top Productivity Solutions » · « O bureau - Office Booking app » (+1) | `src/content/services/en/productivite.json` |
|  | `/en/services/cybersecurity/pentest/` | `/en/expertise/cybersecurity/pentest/` | 264 | 296 | 1,12 | ≈ « Request Your Penetration Testing Services » · « Our Penetration Testing Approaches » | `src/content/services/en/cybersecurite/test-intrusion-pentest.json` |
|  | `/fr/services/productivite/` | `/expertise/productivite/` | 526 | 607 | 1,15 | ≈ « Nos expertises en productivité » · « Rencontrez nos experts » | `src/content/services/fr/productivite.json` |
|  | `/en/services/productivity-consulting/employee-platform-intranet/` | `/en/expertise/productivity-consulting/employee-platform-intranet/` | 376 | 439 | 1,17 | ≈ « Human Resources Conversational Agent with AI » | `src/content/services/en/productivite/plateforme-employe-intranet.json` |
|  | `/en/services/cybersecurity/` | `/en/expertise/cybersecurity/` | 427 | 540 | 1,26 | ≈ « Sector-Specific Expertise for Your Cybersecurity Services » · « Looking for Cybersecurity Services Tailored to the Health… » | `src/content/services/en/cybersecurite.json` |
|  | `/fr/services/productivite/plateforme-employe-intranet/` | `/expertise/productivite/plateforme-employe-intranet/` | 400 | 507 | 1,27 | ≈ « Agent conversationnel pour les ressources humaines avec l'IA » · « La plateforme pour une expérience employé unifiée et moderne » | `src/content/services/fr/productivite/plateforme-employe-intranet.json` |
|  | `/fr/services/conseil-strategique/conformite-loi-25/` | `/expertise/conseil-strategique/conformite-loi-25/` | 151 | 195 | 1,29 | ≈ « Évaluez la conformité de votre organisation en répondant … » · « Contactez-nous pour une évaluation personnalisée ! » | `src/content/services/fr/conseil-strategique/conformite-loi-25.json` |
|  | `/fr/services/productivite/copilot-studio/` | `/expertise/productivite/copilot-studio/` | 206 | 273 | 1,33 |  | `src/content/services/fr/productivite/copilot-studio.json` |
|  | `/en/services/productivity-consulting/copilot-studio/` | `/en/expertise/productivity-consulting/copilot-studio/` | 166 | 223 | 1,34 |  | `src/content/services/en/productivite/copilot-studio.json` |
|  | `/fr/services/cybersecurite/` | `/expertise/cybersecurite/` | 484 | 671 | 1,39 |  | `src/content/services/fr/cybersecurite.json` |
|  | `/en/services/strategic-advice/law-25-compliance/` | `/en/expertise/strategic-advice/law-25-compliance/` | 108 | 164 | 1,52 | ≈ « Assess your organization's compliance by answering these … » · « Contact us for a personalized assessment! » | `src/content/services/en/conseil-strategique/conformite-loi-25.json` |
|  | `/en/services/cybersecurity/cybersecurity-healthcare/` | `/en/expertise/cybersecurity/cybersecurity-healthcare/` | 246 | 444 | 1,80 | ≈ « Cybersecurity Challenges in the Healthcare Sector » · « Take Advantage of Personalized Support » · « Victrix Provides First-Class Cybersecurity and Confidenti… » | `src/content/services/en/cybersecurite/cybersecurite-sante.json` |
|  | `/fr/services/cybersecurite/cybersecurite-sante/` | `/expertise/cybersecurite/cybersecurite-sante/` | 319 | 586 | 1,84 | ≈ « Les enjeux de cybersécurité dans le secteur de la santé » · « Bénéficiez d’un accompagnement personnalisé » · « Victrix assure une cybersécurité et confidentialité de pr… » | `src/content/services/fr/cybersecurite/cybersecurite-sante.json` |

## Pages — 18 pages, 2 signalées

| | Page cible | Adresse source | Mots source | Mots cible | Ratio | Titres H2/H3 absents de la cible | Fichier du dépôt |
| --- | --- | --- | ---: | ---: | ---: | --- | --- |
| ☑ assumée — Page système REDESSINÉE (lot L-restaure, 2026-09-23). L'ancienne page de remerciement servait de plan de site officieux : ≈ 25 liens de services et la promesse d'un rappel « dans les 24 heures ». La nôtre tient en une phrase et deux boutons, la navigation étant assurée par l'en-tête. docs/migration/inventaire-campagnes.md § 2 ne demandait que d'en vérifier les liens. | `/fr/merci/` | `/page-de-remerciement/` | 131 | 14 | 0,11 |  | (gabarit de page) |
| ☑ assumée — Page système REDESSINÉE (lot L-restaure, 2026-09-23) — même décision que /fr/merci/. | `/en/merci/` | `/en/thank-you-page/` | 46 | 18 | 0,39 |  | (gabarit de page) |
|  | `/fr/politique-confidentialite/` | `/politique-de-confidentialite/` | 1574 | 1578 | 1,00 |  | `src/content/pages/fr/politique-confidentialite.json` |
|  | `/en/politique-confidentialite/` | `/en/privacy-policy/` | 1392 | 1402 | 1,01 |  | `src/content/pages/en/politique-confidentialite.json` |
|  | `/fr/conditions-utilisation/` | `/conditions-dutilisation/` | 608 | 613 | 1,01 |  | `src/content/pages/fr/conditions-utilisation.json` |
|  | `/en/conditions-utilisation/` | `/en/terms-of-use/` | 633 | 664 | 1,05 |  | `src/content/pages/en/conditions-utilisation.json` |
|  | `/en/carrieres/` | `/en/careers/` | 225 | 280 | 1,24 | ≈ « Our CSR commitments and activities » | `src/content/pages/en/carrieres.json` |
|  | `/fr/carrieres/` | `/carriere/` | 249 | 311 | 1,25 |  | `src/content/pages/fr/carrieres.json` |
|  | `/fr/decouvrir/` | `/decouvrir-victrix/` | 349 | 538 | 1,54 |  | `src/content/pages/fr/decouvrir.json` |
|  | `/en/contact/` | `/en/contact/` | 76 | 118 | 1,55 | ≈ « You have a question or a project? Do not hesitate to cont… » · « Formulaire de contact » | (gabarit de page) |
|  | `/en/decouvrir/` | `/en/discover-victrix/` | 308 | 499 | 1,62 |  | `src/content/pages/en/decouvrir.json` |
|  | `/fr/contact/` | `/contact/` | 73 | 123 | 1,68 | ≈ « Formulaire de contact » | (gabarit de page) |
|  | `/en/portail/` | `/en/customer-portal/` (+1) | 8 | 19 | 2,38 | ≈ « Log in to your customer area » | (gabarit de page) |
|  | `/en/` | `/en/` | 190 | 515 | 2,71 | ≈ « Meet our experts » | `src/content/home/en/accueil.json` |
|  | `/fr/portail/` | `/mon-portail/` (+1) | 7 | 20 | 2,86 |  | (gabarit de page) |
|  | `/fr/` | `/` | 192 | 581 | 3,03 | ≈ « Rencontrez nos experts » | `src/content/home/fr/accueil.json` |
|  | `/fr/ressources/` | `/ressources/` | 135 | 1044 | 7,73 | ≈ « Un partenariat exclusif avec l’un des plus grands acteurs… » · « Webinaire Copilot – Du buzz à l’impact réel » | (gabarit de page) |
|  | `/en/ressources/` | `/en/resources-center/` | 120 | 996 | 8,30 | ≈ « An Exclusive Partnership with a Canadian Leader in Extend… » | (gabarit de page) |

## Articles — 49 pages, 0 signalées

| | Page cible | Adresse source | Mots source | Mots cible | Ratio | Titres H2/H3 absents de la cible | Fichier du dépôt |
| --- | --- | --- | ---: | ---: | ---: | --- | --- |
|  | `/en/ressources/servicenow-itsm/` | `/en/servicenow-itsm/` | 1081 | 785 | 0,73 | ≈ « Understanding ITSM: Beyond Simple IT Support » · « Choosing the Right ServiceNow Partner for ITSM Implementa… » · « FAQ — ServiceNow ITSM » | `src/content/blog/en/servicenow-itsm.md` |
|  | `/en/ressources/sase-cloud/` | `/en/sase-cloud/` | 1041 | 962 | 0,92 | ≈ « What Is a SASE Solution? » · « SASE Architecture Elements in the Cloud » · « The Main Benefits of the Cloud-Based SASE Model » (+3) | `src/content/blog/en/sase-cloud.md` |
|  | `/en/ressources/zero-trust-network-access-ztna-ultimate-cybersecurity-model/` | `/en/zero-trust-network-access-ztna-ultimate-cybersecurity-model/` (+1) | 794 | 757 | 0,95 | ≈ « What Is the Zero Trust Network Access (ZTNA) Model in Cyb… » · « Business Cybersecurity: Why Choose Zero Trust Network Acc… » · « How Victrix Ensures Optimal Network Security with the ZTN… » (+1) | `src/content/blog/en/zero-trust-network-access-ztna.md` |
|  | `/en/ressources/soc-outsourcing-for-smbs-pros-cons/` | `/en/soc-outsourcing-for-smbs-pros-cons/` (+1) | 866 | 846 | 0,98 | ≈ « What do the acronyms SIEM & SOC stand for? » · « What Is a SOC service? » · « Why Set Up a SOC? » (+1) | `src/content/blog/en/externalisation-soc-avantages-inconvenients.md` |
|  | `/fr/ressources/externalisation-du-soc-avantages-inconvenients/` | `/externalisation-du-soc-avantages-inconvenients/` (+1) | 971 | 953 | 0,98 | ≈ « Que signifient les acronymes SIEM et SOC? » · « Qu'est-ce qu'un service SOC? » · « Pourquoi opter pour la mise en place d’un SOC dédié? » (+1) | `src/content/blog/fr/externalisation-soc-avantages-inconvenients.md` |
|  | `/en/ressources/it-trends/` | `/en/it-trends/` | 771 | 762 | 0,99 |  | `src/content/blog/en/tendances-ti.md` |
|  | `/en/ressources/servicenow-ai/` | `/en/servicenow-ai/` | 1001 | 997 | 1,00 |  | `src/content/blog/en/ia-servicenow.md` |
|  | `/en/ressources/ransomware-protection-tips/` | `/en/ransomware-protection-tips/` | 2173 | 2179 | 1,00 |  | `src/content/blog/en/ransomware-rancongiciels.md` |
|  | `/fr/ressources/tendances-ti/` | `/tendances-ti/` | 932 | 937 | 1,01 |  | `src/content/blog/fr/tendances-ti.md` |
|  | `/en/ressources/dora-regulation/` | `/en/dora-regulation/` | 518 | 521 | 1,01 |  | `src/content/blog/en/reglementation-dora.md` |
|  | `/en/ressources/penetration-testing/` | `/en/penetration-testing/` | 1151 | 1158 | 1,01 |  | `src/content/blog/en/pentest-cybersecurite.md` |
|  | `/en/ressources/copilot-studio-agents/` | `/en/copilot-studio-agents/` | 1177 | 1185 | 1,01 |  | `src/content/blog/en/agents-copilot-studio.md` |
|  | `/en/ressources/power-platform-governance-advice/` | `/en/power-platform-governance-advice/` | 1146 | 1154 | 1,01 |  | `src/content/blog/en/gouvernance-power-platform-conseils.md` |
|  | `/fr/ressources/ransomware-rancongiciels/` | `/ransomware-rancongiciels/` | 2518 | 2537 | 1,01 |  | `src/content/blog/fr/ransomware-rancongiciels.md` |
|  | `/fr/ressources/sase-cloud/` | `/sase-cloud/` | 1203 | 1213 | 1,01 |  | `src/content/blog/fr/sase-cloud.md` |
|  | `/en/ressources/internet-of-things-security/` | `/en/internet-of-things-security/` | 830 | 837 | 1,01 |  | `src/content/blog/en/securite-internet-des-objets.md` |
|  | `/en/ressources/migration-windows-11-microsoft-exchange/` | `/en/migration-windows-11-microsoft-exchange/` | 636 | 642 | 1,01 | ≈ « Why Act Now? » | `src/content/blog/en/migration-windows-11-microsoft-exchange.md` |
|  | `/en/ressources/microsoft-copilot-features/` | `/en/microsoft-copilot-features/` | 833 | 842 | 1,01 |  | `src/content/blog/en/fonctionnalites-microsoft-copilot.md` |
|  | `/en/ressources/cybersecurity-risk-audit/` | `/en/cybersecurity-risk-audit/` | 705 | 713 | 1,01 |  | `src/content/blog/en/audit-cybersecurite.md` |
|  | `/en/ressources/microsoft-viva-apps/` | `/en/microsoft-viva-apps/` | 667 | 675 | 1,01 |  | `src/content/blog/en/applications-microsoft-viva-demystifier-viva.md` |
|  | `/en/ressources/law-25-personal-data-guide/` | `/en/law-25-personal-data-guide/` | 662 | 670 | 1,01 |  | `src/content/blog/en/loi-25-donnees-personnelles-guide.md` |
|  | `/fr/ressources/gouvernance-power-platform-conseils/` | `/gouvernance-power-platform-conseils/` | 1346 | 1363 | 1,01 |  | `src/content/blog/fr/gouvernance-power-platform-conseils.md` |
|  | `/en/ressources/iot-security-challenges/` | `/en/iot-security-challenges/` | 550 | 558 | 1,01 |  | `src/content/blog/en/securite-iot-defis.md` |
|  | `/fr/ressources/servicenow-itsm/` | `/servicenow-itsm/` | 1376 | 1397 | 1,02 |  | `src/content/blog/fr/servicenow-itsm.md` |
|  | `/fr/ressources/agents-copilot-studio/` | `/agents-copilot-studio/` | 1311 | 1335 | 1,02 |  | `src/content/blog/fr/agents-copilot-studio.md` |
|  | `/fr/ressources/ia-servicenow/` | `/ia-servicenow/` | 1199 | 1222 | 1,02 |  | `src/content/blog/fr/ia-servicenow.md` |
|  | `/en/ressources/iso-27001-iso-9001-certifications/` | `/en/iso-27001-iso-9001-certifications/` | 378 | 386 | 1,02 |  | `src/content/blog/en/certification-iso-27001-iso-9001.md` |
|  | `/fr/ressources/zero-trust-network-access-ztna-modele-de-cybersecurite-optimal/` | `/zero-trust-network-access-ztna-modele-de-cybersecurite-optimal/` (+1) | 923 | 943 | 1,02 |  | `src/content/blog/fr/zero-trust-network-access-ztna.md` |
|  | `/fr/ressources/securite-internet-des-objets/` | `/securite-internet-des-objets/` | 1015 | 1037 | 1,02 |  | `src/content/blog/fr/securite-internet-des-objets.md` |
|  | `/fr/ressources/loi-25-donnees-personnelles-guide/` | `/loi-25-donnees-personnelles-guide/` | 824 | 843 | 1,02 |  | `src/content/blog/fr/loi-25-donnees-personnelles-guide.md` |
|  | `/fr/ressources/applications-microsoft-viva-demystifier-viva/` | `/applications-microsoft-viva-demystifier-viva/` | 741 | 759 | 1,02 |  | `src/content/blog/fr/applications-microsoft-viva-demystifier-viva.md` |
|  | `/fr/ressources/fonctionnalites-microsoft-copilot/` | `/fonctionnalites-microsoft-copilot/` | 998 | 1026 | 1,03 |  | `src/content/blog/fr/fonctionnalites-microsoft-copilot.md` |
|  | `/fr/ressources/securite-iot-defis/` | `/securite-iot-defis/` | 663 | 682 | 1,03 |  | `src/content/blog/fr/securite-iot-defis.md` |
|  | `/en/ressources/expands-cybersecurity-offering-france/` | `/en/expands-cybersecurity-offering-france/` | 270 | 278 | 1,03 |  | `src/content/blog/en/developpement-offre-cybersecurite-france.md` |
|  | `/fr/ressources/reglementation-dora/` | `/reglementation-dora/` | 611 | 630 | 1,03 |  | `src/content/blog/fr/reglementation-dora.md` |
|  | `/fr/ressources/societe-conseil-lambda-victrix/` | `/societe-conseil-lambda-victrix/` | 552 | 572 | 1,04 |  | `src/content/blog/fr/societe-conseil-lambda-victrix.md` |
|  | `/en/ressources/servicenow-itom/` | `/en/servicenow-itom/` | 1086 | 1127 | 1,04 | ≈ « What Is ITOM in ServiceNow? » · « More Than a Tool Suite: What Can Businesses Do With Servi… » · « ServiceNow ITOM Modules & Features — and What They Do » (+4) | `src/content/blog/en/servicenow-itom.md` |
|  | `/fr/ressources/migration-windows-11-microsoft-exchange/` | `/migration-windows-11-microsoft-exchange/` | 703 | 732 | 1,04 |  | `src/content/blog/fr/migration-windows-11-microsoft-exchange.md` |
|  | `/fr/ressources/developpement-offre-cybersecurite-france/` | `/developpement-offre-cybersecurite-france/` | 287 | 305 | 1,06 |  | `src/content/blog/fr/developpement-offre-cybersecurite-france.md` |
|  | `/fr/ressources/certification-iso-27001-iso-9001/` | `/certification-iso-27001-iso-9001/` | 425 | 452 | 1,06 |  | `src/content/blog/fr/certification-iso-27001-iso-9001.md` |
|  | `/en/ressources/nis2-directive/` | `/en/nis2-directive/` | 680 | 729 | 1,07 |  | `src/content/blog/en/directive-nis2.md` |
|  | `/fr/ressources/audit-cybersecurite/` | `/audit-cybersecurite/` | 861 | 933 | 1,08 |  | `src/content/blog/fr/audit-cybersecurite.md` |
|  | `/fr/ressources/servicenow-itom/` | `/servicenow-itom/` | 1407 | 1542 | 1,10 |  | `src/content/blog/fr/servicenow-itom.md` |
|  | `/fr/ressources/directive-nis2/` | `/directive-nis2/` | 827 | 907 | 1,10 |  | `src/content/blog/fr/directive-nis2.md` |
|  | `/fr/ressources/pentest-cybersecurite/` | `/pentest-cybersecurite/` | 1157 | 1284 | 1,11 |  | `src/content/blog/fr/pentest-cybersecurite.md` |
|  | `/en/ressources/chatgpt-vs-copilot/` | `/en/chatgpt-vs-copilot/` | 1172 | 1355 | 1,16 |  | `src/content/blog/en/copilot-vs-chatgpt.md` |
|  | `/fr/ressources/copilot-vs-chatgpt/` | `/copilot-vs-chatgpt/` (+1) | 1292 | 1505 | 1,16 |  | `src/content/blog/fr/copilot-vs-chatgpt.md` |
|  | `/en/ressources/setting-up-a-soc/` | `/en/setting-up-a-soc/` | 1313 | 1706 | 1,30 |  | `src/content/blog/en/mise-en-place-soc.md` |
|  | `/fr/ressources/mise-en-place-soc/` | `/mise-en-place-soc/` | 1511 | 1982 | 1,31 |  | `src/content/blog/fr/mise-en-place-soc.md` |

## Campagnes — 5 pages, 0 signalées

| | Page cible | Adresse source | Mots source | Mots cible | Ratio | Titres H2/H3 absents de la cible | Fichier du dépôt |
| --- | --- | --- | ---: | ---: | ---: | --- | --- |
|  | `/fr/campagnes/licences-power-platform/` | `/document/licences-microsoft-power-platform/` | 277 | 250 | 0,90 | ≈ « Découvrez le guide simplifié sur les licences Microsoft P… » · « Pourquoi télécharger ce guide ? » | `src/content/landing/fr/licences-power-platform.md` |
|  | `/en/services/artificial-intelligence/landing-ai-consulting/` | `/en/expertise/artificial-intelligence/landing-ai-consulting/` | 809 | 794 | 0,98 | ≈ « Schedule an AI consultation » | `src/content/services/en/intelligence-artificielle/accompagnement-ia.json` |
|  | `/fr/services/intelligence-artificielle/accompagnement-ia/` | `/expertise/intelligence-artificielle/accompagnement-ia/` | 928 | 911 | 0,98 | ≈ « Planifiez une consultation IA » | `src/content/services/fr/intelligence-artificielle/accompagnement-ia.json` |
|  | `/fr/services/productivite/o-bureau/demo-o-bureau/` | `/expertise/productivite/o-bureau/demo-o-bureau/` | 90 | 140 | 1,56 |  | `src/content/services/fr/productivite/o-bureau/demo-o-bureau.json` |
|  | `/en/services/productivity-consulting/office-booking/landing-demo-obureau/` | `/en/expertise/productivity-consulting/office-booking/landing-demo-obureau/` | 75 | 121 | 1,61 |  | `src/content/services/en/productivite/o-bureau/demo-o-bureau.json` |

## Hors comparaison — 24 adresses anciennes

Décisions déjà prises dans `correspondance-urls.json`, sources que le site en
ligne ne sert plus, adresses sans page construite.

| Adresse de l'ancien site | Pourquoi |
| --- | --- |
| `/annonce-nomination-ceo/` | article retiré (D19 : brouillon + 301 vers le plus proche) |
| `/cache/` | URL de l'ancien CMS sans équivalent (ignorée) |
| `/en/appointment-ceo/` | article retiré (D19 : brouillon + 301 vers le plus proche) |
| `/en/best-practices-in-operational-safety-maintenance/` | article retiré (D19 : brouillon + 301 vers le plus proche) |
| `/en/best-practices-in-operational-security-defense/` | article retiré (D19 : brouillon + 301 vers le plus proche) |
| `/en/best-practices-in-operational-security-monitoring/` | article retiré (D19 : brouillon + 301 vers le plus proche) |
| `/en/check-point-price-list/` | page à recréer (302 d'attente — L12 / L-prix) |
| `/en/dominic-lajoie-appointed/` | article retiré (D19 : brouillon + 301 vers le plus proche) |
| `/en/extended-reality-xr-agc-partnership/` | article retiré (D19 : brouillon + 301 vers le plus proche) |
| `/en/holiday-wishes/` | page abandonnée (décision : 301 vers le plus proche) |
| `/en/part-2-best-practices-in-operational-security-monitoring/` | article retiré (D19 : brouillon + 301 vers le plus proche) |
| `/en/part-3-best-practices-in-operational-security-defense/` | article retiré (D19 : brouillon + 301 vers le plus proche) |
| `/expertise/productivite/o-bureau/documents-o-bureau/` | page abandonnée (décision : 301 vers le plus proche) |
| `/liste-prix-check-point/` | page à recréer (302 d'attente — L12 / L-prix) |
| `/meilleures-pratiques-en-securite-operationnelle-la-defense/` | article retiré (D19 : brouillon + 301 vers le plus proche) |
| `/meilleures-pratiques-en-securite-operationnelle-la-maintenance/` | article retiré (D19 : brouillon + 301 vers le plus proche) |
| `/meilleures-pratiques-en-securite-operationnelle-la-surveillance/` | article retiré (D19 : brouillon + 301 vers le plus proche) |
| `/nomination-dominic-lajoie/` | article retiré (D19 : brouillon + 301 vers le plus proche) |
| `/partie-1-meilleures-pratiques-en-securite-operationnelle-la-maintenance/` | article retiré (D19 : brouillon + 301 vers le plus proche) |
| `/partie-2-meilleures-pratiques-en-securite-operationnelle-la-surveillance/` | article retiré (D19 : brouillon + 301 vers le plus proche) |
| `/partie-3-meilleures-pratiques-en-securite-operationnelle-la-defense/` | article retiré (D19 : brouillon + 301 vers le plus proche) |
| `/realite-etendue-xr-partenariat-agc/` | article retiré (D19 : brouillon + 301 vers le plus proche) |
| `/une-journee-dans-la-vie-secops/` | article retiré (D19 : brouillon + 301 vers le plus proche) |
| `/voeux-des-fetes/` | page abandonnée (décision : 301 vers le plus proche) |

## Adresses regroupées sur une même page cible — 11

Plusieurs anciennes adresses mènent à la même page : la source retenue est
celle du plan de site en ligne (sinon la plus fournie) ; les autres sont des
alias, anciens slugs ou pages fusionnées.

| Page cible | Source retenue | Autres adresses |
| --- | --- | --- |
| `/en/portail/` | `/en/customer-portal/` | `/en/no-access/` |
| `/en/ressources/soc-outsourcing-for-smbs-pros-cons/` | `/en/soc-outsourcing-for-smbs-pros-cons/` | `/en/soc-outsourcing-pros-cons/` |
| `/en/ressources/zero-trust-network-access-ztna-ultimate-cybersecurity-model/` | `/en/zero-trust-network-access-ztna-ultimate-cybersecurity-model/` | `/en/zero-trust-network-access-ztna/` |
| `/en/services/it-procurement/servicenow/` | `/en/expertise/it-procurement/servicenow/` | `/en/expertise/productivity-consulting/servicenow/` |
| `/fr/portail/` | `/mon-portail/` | `/no-access/` |
| `/fr/ressources/copilot-vs-chatgpt/` | `/copilot-vs-chatgpt/` | `/document/webinaire-copilot-buzz-impact/` |
| `/fr/ressources/externalisation-du-soc-avantages-inconvenients/` | `/externalisation-du-soc-avantages-inconvenients/` | `/externalisation-soc-avantages-inconvenients/` |
| `/fr/ressources/zero-trust-network-access-ztna-modele-de-cybersecurite-optimal/` | `/zero-trust-network-access-ztna-modele-de-cybersecurite-optimal/` | `/zero-trust-network-access-ztna/` |
| `/fr/services/approvisionnement-ti/servicenow/` | `/expertise/approvisionnement-ti/servicenow/` | `/expertise/productivite/servicenow/` |
| `/fr/services/cybersecurite/centre-operationnel-de-securite-evolutif/` | `/expertise/cybersecurite/centre-operationnel-de-securite-evolutif/` | `/document/cybersecurite/` |
| `/fr/services/services-ti-geres/` | `/expertise/services-ti-geres/` | `/document/pourquoi-gerez-vous-encore-vos-ti/` |
