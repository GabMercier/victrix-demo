# Pages — les blocs, images et liens de l’ancien site qui ne sont pas chez nous

> Généré par `python scripts/migration/blocs-manquants-pages.py` (après un
> `npm run build`). Source : le cache des pages EN LIGNE, `docs/migration/cache-source/`.
> Articles exclus (voir `blocs-manquants-articles.md`). **Aucun fichier de contenu n’est modifié.**

| | |
| --- | --- |
| Pages comparées | **89** |
| Pages avec au moins un écart (bloc, phrase, image ou lien) | **86** |
| Blocs de texte absents | **100** (631 mots) |
| … dont blocs courts « à vérifier » | 64 |
| Paragraphes retrouvés mais AMPUTÉS (≥ 3 mots significatifs perdus) | **82** |
| Images de la source absentes de la cible | **251** : 116 photos (dont 13 images de héros) + 135 logos, pictos ou certifications |
| Liens internes de la source absents de la cible | **13** |
| Blocs seulement REFORMULÉS (≥ 60 % des mots présents) — listés, non comptés | 390 |
| Widgets de l’ancien thème (carrousel d’équipe, intitulé du formulaire) — hors décompte | 14 |

**Comment lire.** Mêmes règles que pour les articles : un paragraphe ou un item
est « absent » quand moins de 50 % de ses mots significatifs (≥ 5 lettres) sont dans
la page construite ; un titre, dès qu’il n’est pas retrouvé mot pour mot ; un bloc
court non retrouvé est « à vérifier ». Comme la consigne autorise la reformulation,
un bloc absent dont ≥ 60 % des mots de 4 lettres et plus sont dans la page est classé
« reformulé » : listé en une ligne, hors décompte. À l’inverse, un paragraphe jugé
présent auquel il manque ≥ 3 mots significatifs est « amputé » : une phrase ou une
fin de phrase a sauté — les mots absents sont nommés. Une IMAGE est absente quand
aucun fichier de même nom (suffixe de taille WordPress et extension ignorés) n’est
servi dans le `<main>` de la cible — la première image de la source est l’image de
héros ; logos et icônes ne comptent pas. Un LIEN est absent quand un bloc retrouvé
portait un lien interne que la cible ne porte plus dans son CONTENU (ni tel quel,
ni vers sa destination après redirection ; articles liés et fil d’Ariane exclus).

**Ce que ce rapport ne dit pas** : il juge le TEXTE, pas la FORME ni le choix
éditorial. Un titre absent peut être un widget abandonné volontairement
(« Rencontrez nos experts » = carrousel d’équipe) : Gabriel et Julie tranchent.

## Services — 66 pages, 65 avec un écart

| Page cible | Blocs absents | Mots | Amputés | Images absentes | Liens absents | Fichier |
| --- | ---: | ---: | ---: | ---: | ---: | --- |
| `/en/services/productivity-consulting/` | 1 | 5 | 5 | 14 | 0 | `src/content/services/en/productivite.json` |
| `/fr/services/productivite/` | 1 | 6 | 2 | 14 | 0 | `src/content/services/fr/productivite.json` |
| `/en/services/strategic-advice/` | 4 | 28 | 0 | 7 | 0 | `src/content/services/en/conseil-strategique.json` |
| `/fr/services/conseil-strategique/` | 4 | 24 | 0 | 7 | 0 | `src/content/services/fr/conseil-strategique.json` |
| `/en/services/cloud-services-provider/` | 3 | 13 | 5 | 4 | 0 | `src/content/services/en/services-infonuagiques.json` |
| `/en/services/productivity-consulting/o-studio/` | 2 | 15 | 2 | 5 (héros) | 0 | `src/content/services/en/productivite/o-studio.json` |
| `/en/services/cybersecurity/zero-trust/` | 2 | 32 | 0 | 0 | 0 | `src/content/services/en/cybersecurite/zero-trust.json` |
| `/fr/services/productivite/o-studio/` | 1 | 2 | 6 | 5 (héros) | 0 | `src/content/services/fr/productivite/o-studio.json` |
| `/en/services/it-procurement/microsoft-solutions/` | 0 | 0 | 0 | 9 | 0 | `src/content/services/en/approvisionnement-ti/solutions-microsoft.json` |
| `/fr/services/approvisionnement-ti/solutions-microsoft/` | 0 | 0 | 0 | 9 | 0 | `src/content/services/fr/approvisionnement-ti/solutions-microsoft.json` |
| `/fr/services/cybersecurite/centre-operationnel-de-securite-evolutif/` | 3 | 10 | 1 | 5 | 0 | `src/content/services/fr/cybersecurite/centre-operationnel-de-securite-evolutif.json` |
| `/fr/services/services-infonuagiques/` | 1 | 3 | 6 | 4 | 0 | `src/content/services/fr/services-infonuagiques.json` |
| `/en/services/cybersecurity/scalable-security-operations-center/` | 3 | 11 | 0 | 5 | 0 | `src/content/services/en/cybersecurite/centre-operationnel-de-securite-evolutif.json` |
| `/fr/services/cybersecurite/internet-des-objets-service-iot/` | 2 | 9 | 4 | 2 | 0 | `src/content/services/fr/cybersecurite/internet-des-objets-service-iot.json` |
| `/fr/services/productivite/copilot-studio/` | 2 | 12 | 2 | 2 | 0 | `src/content/services/fr/productivite/copilot-studio.json` |
| `/fr/services/services-ti-geres/` | 5 | 20 | 1 | 0 | 0 | `src/content/services/fr/services-ti-geres.json` |
| `/en/services/it-procurement/` | 3 | 15 | 2 | 0 | 0 | `src/content/services/en/approvisionnement-ti.json` |
| `/en/services/it-procurement/palo-alto-networks/` | 0 | 0 | 0 | 6 | 0 | `src/content/services/en/approvisionnement-ti/palo-alto-networks.json` |
| `/fr/services/approvisionnement-ti/palo-alto-networks/` | 0 | 0 | 0 | 6 | 0 | `src/content/services/fr/approvisionnement-ti/palo-alto-networks.json` |
| `/en/services/cybersecurity/internet-of-things-iot/` | 1 | 4 | 3 | 2 | 0 | `src/content/services/en/cybersecurite/internet-des-objets-service-iot.json` |
| `/en/services/productivity-consulting/copilot-studio/` | 2 | 8 | 1 | 2 | 0 | `src/content/services/en/productivite/copilot-studio.json` |
| `/fr/services/services-infonuagiques/migration-vers-azure/` | 0 | 0 | 5 | 2 (héros) | 0 | `src/content/services/fr/services-infonuagiques/migration-vers-azure.json` |
| `/en/services/it-procurement/hpe-networking/` | 0 | 0 | 0 | 5 | 0 | `src/content/services/en/approvisionnement-ti/hpe-networking.json` |
| `/fr/services/approvisionnement-ti/hpe-networking/` | 0 | 0 | 0 | 5 | 0 | `src/content/services/fr/approvisionnement-ti/hpe-networking.json` |
| `/en/services/cloud-services-provider/azure-migration/` | 0 | 0 | 4 | 2 | 0 | `src/content/services/en/services-infonuagiques/migration-vers-azure.json` |
| `/en/services/cybersecurity/cybersecurity-healthcare/` | 1 | 5 | 0 | 3 | 0 | `src/content/services/en/cybersecurite/cybersecurite-sante.json` |
| `/en/services/productivity-consulting/dynamics-365-field-service/` | 0 | 0 | 2 | 3 | 0 | `src/content/services/en/productivite/dynamics-365-field-service.json` |
| `/en/services/productivity-consulting/office-booking/` | 1 | 7 | 0 | 2 | 0 | `src/content/services/en/productivite/o-bureau.json` |
| `/fr/services/cybersecurite/cybersecurite-sante/` | 0 | 0 | 2 | 3 | 0 | `src/content/services/fr/cybersecurite/cybersecurite-sante.json` |
| `/fr/services/productivite/dynamics-365-field-service/` | 0 | 0 | 2 | 3 | 0 | `src/content/services/fr/productivite/dynamics-365-field-service.json` |
| `/fr/services/approvisionnement-ti/` | 1 | 4 | 4 | 0 | 0 | `src/content/services/fr/approvisionnement-ti.json` |
| `/fr/services/conseil-strategique/conformite-loi-25/` | 1 | 12 | 0 | 0 | 0 | `src/content/services/fr/conseil-strategique/conformite-loi-25.json` |
| `/en/services/artificial-intelligence/consulting/` | 0 | 0 | 1 | 2 | 1 | `src/content/services/en/intelligence-artificielle/accompagnement.json` |
| `/en/services/productivity-consulting/copilot-for-microsoft-365/` | 2 | 10 | 0 | 0 | 0 | `src/content/services/en/productivite/copilot-microsoft-365.json` |
| `/en/services/it-procurement/check-point/` | 0 | 0 | 0 | 3 | 0 | `src/content/services/en/approvisionnement-ti/check-point.json` |
| `/en/services/it-procurement/cisco/` | 0 | 0 | 0 | 3 | 0 | `src/content/services/en/approvisionnement-ti/cisco.json` |
| `/en/services/it-procurement/crowdstrike-falcon/` | 0 | 0 | 0 | 3 | 0 | `src/content/services/en/approvisionnement-ti/crowdstrike-falcon.json` |
| `/en/services/it-procurement/servicenow/` | 0 | 0 | 0 | 3 | 0 | `src/content/services/en/approvisionnement-ti/servicenow.json` |
| `/en/services/it-procurement/zscaler/` | 0 | 0 | 0 | 3 | 0 | `src/content/services/en/approvisionnement-ti/zscaler.json` |
| `/en/services/strategic-advice/law-25-compliance/` | 1 | 9 | 0 | 0 | 0 | `src/content/services/en/conseil-strategique/conformite-loi-25.json` |
| `/fr/services/approvisionnement-ti/check-point/` | 0 | 0 | 0 | 3 | 0 | `src/content/services/fr/approvisionnement-ti/check-point.json` |
| `/fr/services/approvisionnement-ti/cisco/` | 0 | 0 | 0 | 3 | 0 | `src/content/services/fr/approvisionnement-ti/cisco.json` |
| `/fr/services/approvisionnement-ti/crowdstrike-falcon/` | 0 | 0 | 0 | 3 | 0 | `src/content/services/fr/approvisionnement-ti/crowdstrike-falcon.json` |
| `/fr/services/approvisionnement-ti/servicenow/` | 0 | 0 | 0 | 3 | 0 | `src/content/services/fr/approvisionnement-ti/servicenow.json` |
| `/fr/services/approvisionnement-ti/zscaler/` | 0 | 0 | 0 | 3 | 0 | `src/content/services/fr/approvisionnement-ti/zscaler.json` |
| `/fr/services/productivite/o-bureau/` | 1 | 3 | 0 | 2 | 0 | `src/content/services/fr/productivite/o-bureau.json` |
| `/en/services/cybersecurity/` | 0 | 0 | 1 | 2 | 0 | `src/content/services/en/cybersecurite.json` |
| `/fr/services/cybersecurite/` | 0 | 0 | 1 | 2 | 0 | `src/content/services/fr/cybersecurite.json` |
| `/fr/services/intelligence-artificielle/accompagnement/` | 0 | 0 | 0 | 2 | 1 | `src/content/services/fr/intelligence-artificielle/accompagnement.json` |
| `/fr/services/services-infonuagiques/services-aws/` | 0 | 0 | 1 | 2 (héros) | 0 | `src/content/services/fr/services-infonuagiques/services-aws.json` |
| `/en/services/cloud-services-provider/aws-services/` | 0 | 0 | 0 | 2 | 0 | `src/content/services/en/services-infonuagiques/services-aws.json` |
| `/en/services/it-procurement/dell-technologies/` | 0 | 0 | 0 | 2 | 0 | `src/content/services/en/approvisionnement-ti/dell-technologies.json` |
| `/fr/services/approvisionnement-ti/dell-technologies/` | 0 | 0 | 0 | 2 | 0 | `src/content/services/fr/approvisionnement-ti/dell-technologies.json` |
| `/fr/services/intelligence-artificielle/analyse-opportunites-ia/` | 1 | 6 | 0 | 0 | 0 | `src/content/services/fr/intelligence-artificielle/analyse-opportunites-ia.json` |
| `/fr/services/services-ti-geres/maximisez-lutilisation-de-votre-ecosysteme-m365/` | 1 | 3 | 0 | 1 | 0 | `src/content/services/fr/services-ti-geres/maximisez-lutilisation-de-votre-ecosysteme-m365.json` |
| `/en/services/artificial-intelligence/ai-opportunity-analysis/` | 1 | 5 | 0 | 0 | 0 | `src/content/services/en/intelligence-artificielle/analyse-opportunites-ia.json` |
| `/en/services/managed-it-services/` | 1 | 3 | 1 | 0 | 0 | `src/content/services/en/services-ti-geres.json` |
| `/fr/services/cybersecurite/test-intrusion-pentest/` | 0 | 0 | 1 | 1 | 0 | `src/content/services/fr/cybersecurite/test-intrusion-pentest.json` |
| `/fr/services/cybersecurite/zero-trust/` | 0 | 0 | 2 | 0 | 0 | `src/content/services/fr/cybersecurite/zero-trust.json` |
| `/fr/services/intelligence-artificielle/` | 0 | 0 | 2 | 0 | 0 | `src/content/services/fr/intelligence-artificielle.json` |
| `/fr/services/productivite/plateforme-employe-intranet/` | 1 | 4 | 0 | 0 | 0 | `src/content/services/fr/productivite/plateforme-employe-intranet.json` |
| `/en/services/cybersecurity/pentest/` | 0 | 0 | 0 | 1 | 0 | `src/content/services/en/cybersecurite/test-intrusion-pentest.json` |
| `/en/services/managed-it-services/maximize-the-use-of-your-m365-ecosystem/` | 0 | 0 | 0 | 1 | 0 | `src/content/services/en/services-ti-geres/maximisez-lutilisation-de-votre-ecosysteme-m365.json` |
| `/en/services/productivity-consulting/employee-platform-intranet/` | 0 | 0 | 0 | 1 | 0 | `src/content/services/en/productivite/plateforme-employe-intranet.json` |
| `/fr/services/productivite/copilot-microsoft-365/` | 0 | 0 | 1 | 0 | 0 | `src/content/services/fr/productivite/copilot-microsoft-365.json` |

## Pages — 18 pages, 16 avec un écart

| Page cible | Blocs absents | Mots | Amputés | Images absentes | Liens absents | Fichier |
| --- | ---: | ---: | ---: | ---: | ---: | --- |
| `/fr/merci/` | 21 | 121 | 0 | 0 | 0 | `(gabarit de page)` |
| `/fr/decouvrir/` | 2 | 46 | 0 | 3 (héros) | 0 | `src/content/pages/fr/decouvrir.json` |
| `/en/decouvrir/` | 2 | 41 | 0 | 3 (héros) | 0 | `src/content/pages/en/decouvrir.json` |
| `/en/` | 1 | 9 | 3 | 8 (héros) | 0 | `src/content/home/en/accueil.json` |
| `/fr/` | 1 | 10 | 2 | 8 (héros) | 0 | `src/content/home/fr/accueil.json` |
| `/en/merci/` | 3 | 34 | 0 | 0 | 0 | `(gabarit de page)` |
| `/en/carrieres/` | 0 | 0 | 2 | 8 (héros) | 0 | `src/content/pages/en/carrieres.json` |
| `/fr/ressources/` | 0 | 0 | 0 | 6 (héros) | 5 | `(gabarit de page)` |
| `/en/ressources/` | 0 | 0 | 0 | 5 | 5 | `(gabarit de page)` |
| `/fr/carrieres/` | 0 | 0 | 0 | 8 (héros) | 0 | `src/content/pages/fr/carrieres.json` |
| `/en/contact/` | 3 | 7 | 0 | 0 | 0 | `(gabarit de page)` |
| `/fr/contact/` | 2 | 4 | 0 | 0 | 0 | `(gabarit de page)` |
| `/en/conditions-utilisation/` | 1 | 3 | 0 | 0 | 0 | `src/content/pages/en/conditions-utilisation.json` |
| `/en/politique-confidentialite/` | 1 | 3 | 0 | 0 | 0 | `src/content/pages/en/politique-confidentialite.json` |
| `/fr/conditions-utilisation/` | 1 | 3 | 0 | 0 | 0 | `src/content/pages/fr/conditions-utilisation.json` |
| `/fr/politique-confidentialite/` | 1 | 3 | 0 | 0 | 0 | `src/content/pages/fr/politique-confidentialite.json` |

## Campagnes — 5 pages, 5 avec un écart

| Page cible | Blocs absents | Mots | Amputés | Images absentes | Liens absents | Fichier |
| --- | ---: | ---: | ---: | ---: | ---: | --- |
| `/fr/campagnes/licences-power-platform/` | 4 | 46 | 5 | 2 (héros) | 1 | `src/content/landing/fr/licences-power-platform.md` |
| `/en/services/artificial-intelligence/landing-ai-consulting/` | 2 | 6 | 0 | 3 | 0 | `src/content/services/en/intelligence-artificielle/accompagnement-ia.json` |
| `/fr/services/intelligence-artificielle/accompagnement-ia/` | 1 | 5 | 0 | 3 | 0 | `src/content/services/fr/intelligence-artificielle/accompagnement-ia.json` |
| `/en/services/productivity-consulting/office-booking/landing-demo-obureau/` | 0 | 0 | 0 | 3 (héros) | 0 | `src/content/services/en/productivite/o-bureau/demo-o-bureau.json` |
| `/fr/services/productivite/o-bureau/demo-o-bureau/` | 1 | 2 | 0 | 2 | 0 | `src/content/services/fr/productivite/o-bureau/demo-o-bureau.json` |

## Le détail, page par page (du plus touché au moins touché)

### `/fr/merci/` — `(gabarit de page)`

Source : <https://www.victrix.ca/page-de-remerciement/> (26 blocs, 0 images)

- **[P]** (19 mots, 11 % retrouvé)

  > Votre demande de contact a bien été prise en compte. Un expert Victrix vous contactera dans les 24 heures.

- **[LI]** (5 mots — court, à vérifier)

  > Audit et analyse de risques

- **[LI]** (9 mots, 0 % retrouvé)

  > Gestion des identités et accès (modèle Zero Trust ZTNA)

- **[LI]** (4 mots — court, à vérifier)

  > Internet des objets (IOT)

- **[LI]** (5 mots — court, à vérifier)

  > Conformité à la Loi 25

- **[LI]** (4 mots — court, à vérifier)

  > Feuille de route multicloud

- **[LI]** (6 mots — court, à vérifier)

  > Étude d’opportunités (IAAS, PAAS et SAAS)

- **[LI]** (4 mots — court, à vérifier)

  > Adoption du modèle SASE

- **[LI]** (9 mots, 0 % retrouvé)

  > Migration vers une plateforme infonuagique adaptée (AWS, Microsoft Azure)

- **[LI]** (8 mots, 0 % retrouvé)

  > Conception et développement d’applications d’entreprise (Power Platform/Power Apps)

- **[LI]** (3 mots — court, à vérifier)

  > Plateforme intranet moderne

- **[LI]** (5 mots — court, à vérifier)

  > Intelligence d’affaires (BI & Power BI)

- **[LI]** (5 mots — court, à vérifier)

  > Application de réservation de bureau

- **[LI]** (4 mots — court, à vérifier)

  > Exploration et analyse d'opportunités

- **[LI]** (8 mots — court, à vérifier)

  > Développement de solutions et d'agents IA sur mesure

- **[LI]** (5 mots — court, à vérifier)

  > Intelligence d’affaires (BI & Power BI)

- **[LI]** (3 mots — court, à vérifier)

  > Adoption de l'IA

- **[P]** (3 mots — court, à vérifier)

  > Services Gérés TI

- **[LI]** (4 mots — court, à vérifier)

  > Sécurité informatique et cloud

- **[LI]** (2 mots — court, à vérifier)

  > Surveillance 24/7

- **[LI]** (6 mots, 0 % retrouvé)

  > Centre opérationnel de sécurité évolutif (SevOC)

- Reformulés (texte là, hors décompte) : [H1] « Merci de votre confiance! »

### `/fr/campagnes/licences-power-platform/` — `src/content/landing/fr/licences-power-platform.md`

Source : <https://www.victrix.ca/document/licences-microsoft-power-platform/> (17 blocs, 2 images)

- **[LI]** (8 mots, 40 % retrouvé)

  > Alignez vos besoins métiers avec la bonne licence

- **[LI]** (12 mots, 43 % retrouvé)

  > Une expertise pointue et d’un engagement envers l’excellence avec +100 projets réussis

- **[LI]** (21 mots, 36 % retrouvé)

  > Un accompagnement sur vos besoins de manière efficace et personnalisée grâce à une équipe de +30 spécialistes bilingues basés au Québec

- **[P]** (5 mots — court, à vérifier)

  > Merci de compléter le formulaire.

- **[P AMPUTÉ]** (28 mots ; mots absents : souvent, voire, devenir, organisations)

  > S’y retrouver dans les différentes licences de Microsoft Power Platform peut souvent sembler complexe pour les directions informatiques, voire même peut devenir un vrai défi pour les organisations.

- **[P AMPUTÉ]** (11 mots ; mots absents : auront, aucun, mystere)

  > Les licences Microsoft Power Platform n’auront plus aucun mystère pour vous.

- **[P AMPUTÉ]** (39 mots ; mots absents : victrix, repondre, affaires, tribu, multidisciplinaires, accompagnons)

  > Ø Studio est le studio de création technologique de Victrix, pour répondre à tous vos besoins d’affaires. Avec une tribu de spécialistes multidisciplinaires, nous vous accompagnons dans la gestion et le développement de Microsoft Power Platform et Dynamics 365.

- **[LI AMPUTÉ]** (16 mots ; mots absents : amelioration, grace, innovantes, adaptees)

  > Une amélioration de l’expérience utilisateur grâce à des solutions innovantes et adaptées à vos besoins spécifiques

- **[LI AMPUTÉ]** (26 mots ; mots absents : projet, permettre, tirer, meilleur, parti)

  > Un processus d’apprentissage continu tout au long du projet, avec des ateliers de partage d’expertise pour vous permettre de tirer le meilleur parti de votre investissement.

- **[LOGO / PICTO]** `/wp-content/uploads/2023/09/bg-o-studio-1-1024x1024.jpg` — alt : « logo o studio »
- **[IMAGE DE HÉROS]** `/wp-content/uploads/2024/03/image-landing-page-victrix.jpg` — alt : « Présentation du guide Victrix sur les licences Microsoft Power Platform »
- **[LIEN]** `/fr/services/productivite/o-studio/` — porté par « Ø Studio est le studio de création technologique de Victrix, pour répondre à tous vos beso… »
- Reformulés (texte là, hors décompte) : [H2] « Découvrez le guide simplifié sur les licences Microsoft Power Platform » · [H3] « Pourquoi télécharger ce guide ? »

### `/en/services/productivity-consulting/` — `src/content/services/en/productivite.json`

Source : <https://www.victrix.ca/en/expertise/productivity-consulting/> (51 blocs, 15 images)

- **[P]** (5 mots — court, à vérifier)

  > Let's talk about your projects!

- **[P AMPUTÉ]** (34 mots ; mots absents : experts, refined, handle, different, continuous, steps, analysis)

  > Are you looking for productivity consulting experts to help you improve your company’s efficiency? With years of experience, Victrix has refined how we handle the different continuous improvement process steps, from analysis to implementation.

- **[P AMPUTÉ]** (29 mots ; mots absents : centred, takes, account)

  > Our human and customer-oriented approach is user-centred and takes into account your business needs. Find out how we help companies boost productivity with our know-how and exclusive productivity applications.

- **[P AMPUTÉ]** (41 mots ; mots absents : experts, trust, reconcile, project)

  > Our IT strategic consulting specialists and business productivity experts use a proactive approach to help you maximize the value of every working hour. Trust our team to reconcile the realities, needs, and objectives of the three main stakeholders in your project.

- **[P AMPUTÉ]** (28 mots ; mots absents : propel, yourself, towards, adapted, rapid)

  > Propel yourself towards the Power Platform with support adapted to your needs. The Ø Studio offers rapid development and increased delivery capacity to migrate applications or automate processes.

- **[P AMPUTÉ]** (17 mots ; mots absents : simplifies, meeting, office, improves, automates)

  > O bureau simplifies the schedule meeting and office booking process, improves management, and automates office usage reports.

- **[LOGO / PICTO]** `/wp-content/uploads/2022/05/techno-1-ms-onenote.svg` — alt : « OneNote »
- **[LOGO / PICTO]** `/wp-content/uploads/2022/05/techno-2-ms-stream.svg` — alt : « Stream »
- **[LOGO / PICTO]** `/wp-content/uploads/2022/05/techno-3-power-bi.svg` — alt : « Power BI »
- **[LOGO / PICTO]** `/wp-content/uploads/2022/05/techno-4-ms-teams.svg` — alt : « Teams »
- **[LOGO / PICTO]** `/wp-content/uploads/2022/05/techno-5-ms-sharepoint.svg` — alt : « SharePoint »
- **[LOGO / PICTO]** `/wp-content/uploads/2022/05/techno-6-ms-forms.svg` — alt : « Forms »
- **[LOGO / PICTO]** `/wp-content/uploads/2022/05/techno-7-ms-planner.svg` — alt : « Planner »
- **[LOGO / PICTO]** `/wp-content/uploads/2022/05/techno-8-ms-onedrive.svg` — alt : « OneDrive »
- **[LOGO / PICTO]** `/wp-content/uploads/2022/05/techno-9-ms-powerapps.svg` — alt : « Power Apps »
- **[LOGO / PICTO]** `/wp-content/uploads/2022/05/techno-10-ms-power-automate.svg` — alt : « Power Automate »
- **[LOGO / PICTO]** `/wp-content/uploads/2023/09/bg-o-studio-24x.png` — alt : « O studio logo »
- **[IMAGE]** `/wp-content/uploads/2023/08/mia-baker-jjhvyxm34ny-unsplash-scaled-e1698140417136.jpg` — alt : « Les bureaux à réserver avec l'application Ø Bureau de Victrix. »
- **[IMAGE]** `/wp-content/uploads/2023/11/office.png` — alt : « professional multiethnic young businesspeople working in office »
- **[IMAGE]** `/wp-content/uploads/2022/05/istock-996082438-scaled.jpg` — alt : « Victrix- Équipe de développement de logiciels. »
- Reformulés (texte là, hors décompte) : [H1] « Productivity Consulting & Tools for Businesses » · [H2] « Our Productivity Expertise » · [P] « Process management and automation » · [H2] « Our Top Productivity Solutions » · [P] « Enhance productivity with Ø Studio » · [H3] « O bureau - Office Booking app » · [P] « Increase efficiency with our office booking app »
- Widgets de l’ancien thème non repris (hors décompte) : « Meet Our Experts »

### `/fr/decouvrir/` — `src/content/pages/fr/decouvrir.json`

Source : <https://www.victrix.ca/decouvrir-victrix/> (40 blocs, 5 images)

- **[P]** (22 mots, 11 % retrouvé)

  > Victrix me permet de sortir de ma zone de confort et de relever de nouveaux défis sur le plan personnel et professionnel.

- **[P]** (24 mots, 17 % retrouvé)

  > Victrix me permet de faire de la formation continue. Le parcours est étonamment bonifié et me permet de devenir encore meilleur dans mon domaine.

- **[IMAGE DE HÉROS]** `/wp-content/uploads/2022/05/istock-996082438-scaled.jpg` — alt : « Victrix- Équipe de développement de logiciels. »
- **[IMAGE]** `/wp-content/uploads/2022/05/portrait-temoignage-1.png` — alt : « témoignage employé Victrix »
- **[IMAGE]** `/wp-content/uploads/2022/05/portrait-temoignage-2.png` — alt : « portrait d'un employé Victrix »

### `/fr/services/productivite/` — `src/content/services/fr/productivite.json`

Source : <https://www.victrix.ca/expertise/productivite/> (44 blocs, 15 images)

- **[P]** (6 mots — court, à vérifier)

  > Gérez la réservation de bureaux efficacement

- **[P AMPUTÉ]** (35 mots ; mots absents : experts, concilier, projet)

  > Nos spécialistes utilisent une approche proactive pour vous aider à tirer le maximum des heures travaillées. Faites confiance à nos experts pour concilier les réalités, besoins et objectifs des trois grands acteurs de votre projet.

- **[P AMPUTÉ]** (25 mots ; mots absents : exclusive, outil, utiliser)

  > O bureau est une application de productivité exclusive à Victrix. Notre outil de gestion de réservation de bureaux est facile à utiliser et à implémenter.

- **[LOGO / PICTO]** `/wp-content/uploads/2022/05/techno-1-ms-onenote.svg` — alt : « OneNote »
- **[LOGO / PICTO]** `/wp-content/uploads/2022/05/techno-2-ms-stream.svg` — alt : « Stream »
- **[LOGO / PICTO]** `/wp-content/uploads/2022/05/techno-3-power-bi.svg` — alt : « Power BI »
- **[LOGO / PICTO]** `/wp-content/uploads/2022/05/techno-4-ms-teams.svg` — alt : « Teams »
- **[LOGO / PICTO]** `/wp-content/uploads/2022/05/techno-5-ms-sharepoint.svg` — alt : « SharePoint »
- **[LOGO / PICTO]** `/wp-content/uploads/2022/05/techno-6-ms-forms.svg` — alt : « Forms »
- **[LOGO / PICTO]** `/wp-content/uploads/2022/05/techno-7-ms-planner.svg` — alt : « Planner »
- **[LOGO / PICTO]** `/wp-content/uploads/2022/05/techno-8-ms-onedrive.svg` — alt : « OneDrive »
- **[LOGO / PICTO]** `/wp-content/uploads/2022/05/techno-9-ms-powerapps.svg` — alt : « Power Apps »
- **[LOGO / PICTO]** `/wp-content/uploads/2022/05/techno-10-ms-power-automate.svg` — alt : « Power Automate »
- **[LOGO / PICTO]** `/wp-content/uploads/2023/09/bg-o-studio-24x.png` — alt : « O studio logo »
- **[IMAGE]** `/wp-content/uploads/2023/08/mia-baker-jjhvyxm34ny-unsplash-scaled-e1698140417136.jpg` — alt : « Les bureaux à réserver avec l'application Ø Bureau de Victrix. »
- **[IMAGE]** `/wp-content/uploads/2023/11/office.png` — alt : « professional multiethnic young businesspeople working in office »
- **[IMAGE]** `/wp-content/uploads/2022/05/istock-996082438-scaled.jpg` — alt : « Victrix- Équipe de développement de logiciels. »
- Reformulés (texte là, hors décompte) : [H1] « Améliorer la Productivité en entreprise » · [H2] « Nos expertises en productivité » · [P] « Gestion et automatisation des processus » · [P] « Élevez votre taux de productivité avec Ø Studio » · [P] « Déployer un intranet moderne »
- Widgets de l’ancien thème non repris (hors décompte) : « Rencontrez nos experts »

### `/en/decouvrir/` — `src/content/pages/en/decouvrir.json`

Source : <https://www.victrix.ca/en/discover-victrix/> (39 blocs, 5 images)

- **[P]** (19 mots, 17 % retrouvé)

  > Victrix allows me to step out of my comfort zone and take on new challenges both personally and professionally.

- **[P]** (22 mots, 11 % retrouvé)

  > Victrix allows me to do further training. The course is surprisingly good and allows me to become even better in my field.

- **[IMAGE DE HÉROS]** `/wp-content/uploads/2022/05/istock-996082438-scaled.jpg` — alt : « Victrix- Équipe de développement de logiciels. »
- **[IMAGE]** `/wp-content/uploads/2022/05/portrait-temoignage-1.png` — alt : « témoignage employé Victrix »
- **[IMAGE]** `/wp-content/uploads/2022/05/portrait-temoignage-2.png` — alt : « portrait d'un employé Victrix »

### `/en/services/strategic-advice/` — `src/content/services/en/conseil-strategique.json`

Source : <https://www.victrix.ca/en/expertise/strategic-advice/> (60 blocs, 8 images)

- **[P]** (5 mots — court, à vérifier)

  > Let’s talk about your projects

- **[H2]** (3 mots, 50 % retrouvé)

  > Life at Victrix

- **[P]** (15 mots, 29 % retrouvé)

  > Victrix offers a human approach and has at heart the well being of its teams.

- **[P]** (5 mots — court, à vérifier)

  > Be part of the team

- **[IMAGE]** `/wp-content/uploads/2022/02/conseil-strategique-strategies.jpg` — alt : « stratégie - conseil stratégique »
- **[IMAGE]** `/wp-content/uploads/2022/02/conseil-strategique-roadmap.jpg` — alt : « conseil stratégique feuille de route »
- **[IMAGE]** `/wp-content/uploads/2022/02/conseil-strategique-positionnement.jpg` — alt : « conseil stratégique représenté par une boussole »
- **[LOGO / PICTO]** `/wp-content/uploads/2022/05/logo-microsoft.svg` — alt : « Microsoft »
- **[LOGO / PICTO]** `/wp-content/uploads/2022/02/logo-amazon.svg` — alt : « Amazon »
- **[LOGO / PICTO]** `/wp-content/uploads/2022/02/logo-red-hat.svg` — alt : « Red Hat »
- **[IMAGE]** `/wp-content/uploads/2022/04/home-a-propos.jpg` — alt : « Victrix, expert cybersécurité, infonuagique et productivité, continue d'innover. »
- Widgets de l’ancien thème non repris (hors décompte) : « Meet our experts »

### `/fr/services/conseil-strategique/` — `src/content/services/fr/conseil-strategique.json`

Source : <https://www.victrix.ca/expertise/conseil-strategique/> (60 blocs, 8 images)

- **[H2]** (3 mots, 50 % retrouvé)

  > Ils nous fontconfiance

- **[H2]** (3 mots, 50 % retrouvé)

  > Vie chez Victrix

- **[P]** (14 mots, 29 % retrouvé)

  > Victrix propose une approche humaine ayant à coeur le bien être de ses équipes.

- **[P]** (4 mots — court, à vérifier)

  > Faites partie de l'équipe

- **[IMAGE]** `/wp-content/uploads/2022/02/conseil-strategique-strategies.jpg` — alt : « stratégie - conseil stratégique »
- **[IMAGE]** `/wp-content/uploads/2022/02/conseil-strategique-roadmap.jpg` — alt : « conseil stratégique feuille de route »
- **[IMAGE]** `/wp-content/uploads/2022/02/conseil-strategique-positionnement.jpg` — alt : « conseil stratégique représenté par une boussole »
- **[LOGO / PICTO]** `/wp-content/uploads/2022/05/logo-microsoft.svg` — alt : « Microsoft »
- **[LOGO / PICTO]** `/wp-content/uploads/2022/02/logo-amazon.svg` — alt : « Amazon »
- **[LOGO / PICTO]** `/wp-content/uploads/2022/02/logo-red-hat.svg` — alt : « Red Hat »
- **[IMAGE]** `/wp-content/uploads/2022/04/home-a-propos.jpg` — alt : « Victrix, expert cybersécurité, infonuagique et productivité, continue d'innover. »
- Reformulés (texte là, hors décompte) : [H3] « Assurez le succès de vos projets stratégiques avec Victrix »
- Widgets de l’ancien thème non repris (hors décompte) : « Parlons de vos projets » · « Rencontrez nos experts »

### `/en/` — `src/content/home/en/accueil.json`

Source : <https://www.victrix.ca/en/> (22 blocs, 17 images)

- **[P]** (9 mots — court, à vérifier)

  > Don’t hesitate to contact us to discuss your projects

- **[P AMPUTÉ]** (34 mots ; mots absents : improve, optimize, benefit, industry, leading, drive, technological)

  > Improve your cybersecurity and optimize your processes with Victrix. Benefit from our industry-leading expertise in managed IT, cloud, and AI governance to drive your business and stay at the technological forefront of your industry.

- **[P AMPUTÉ]** (22 mots ; mots absents : offers, automate, carry)

  > Ø Studio offers a multidisciplinary team to automate your business processes as well as carry out your application development at high speed!

- **[P AMPUTÉ]** (30 mots ; mots absents : transition, based, first, steps)

  > Victrix accelerates your transition to Azure. Our methodology based on the Microsoft Cloud Adoption Framework, we help you take your first steps in the migration of your applications and servers.

- **[IMAGE DE HÉROS]** `/wp-content/uploads/2022/11/victrix-est-expert-en-solutions-de-cybersecurite-de-productivite-et-de-services-geres-scaled.jpg` — alt : « Canada's Leading IT Services Company. Victrix »
- **[LOGO / PICTO]** `/wp-content/uploads/2023/11/certified_iso_eng.png` — alt : « Victrix certified ISO 27001  »
- **[IMAGE]** `/wp-content/uploads/2022/03/istock-1272592927-1-3-1.png` — alt : « Accélération numérique »
- **[IMAGE]** `/wp-content/uploads/2022/02/solution-sevoc-intro.jpg` — alt : « Introduction à un système evolutif de gestion de sécurité - Victrix »
- **[IMAGE]** `/wp-content/uploads/2022/02/solution-migration-illus-scaled.jpg` — alt : « Solution TI pour entreprise - Migration - Victrix »
- **[LOGO / PICTO]** `/wp-content/uploads/2022/05/logo-microsoft.svg` — alt : « Microsoft 365 »
- **[LOGO / PICTO]** `/wp-content/uploads/2022/05/logo-imprivata.svg` — alt : « Imprivata »
- **[IMAGE]** `/wp-content/uploads/2023/11/logo_ovh.png` — alt : « OVH Cloud »
- Reformulés (texte là, hors décompte) : [H1] « Victrix, Your Trusted IT Consulting and Services Firm »
- Widgets de l’ancien thème non repris (hors décompte) : « Meet our experts »

### `/fr/` — `src/content/home/fr/accueil.json`

Source : <https://www.victrix.ca/> (21 blocs, 17 images)

- **[P]** (10 mots — court, à vérifier)

  > N’hésitez pas à nous contacter pour parler de vos projets

- **[P AMPUTÉ]** (43 mots ; mots absents : ameliorez, optimisez, grace, beneficiez, expertise, informatique, propulser, demeurer, avant, technologique, industrie)

  > Améliorez votre cybersécurité et optimisez vos processus grâce à Victrix. Bénéficiez de notre expertise de pointe en sécurité informatique et en infonuagique, en services TI gérés et en gouvernance de l’IA pour propulser votre entreprise et demeurer à l’avant-plan technologique de votre industrie.

- **[P AMPUTÉ]** (31 mots ; mots absents : passage, basee, premiers)

  > Victrix accélère votre passage vers Azure. Notre méthodologie basée sur le Cloud Adoption Framework de Microsoft vous permet de faire vos premiers pas dans la migration de vos applications et serveurs.

- **[IMAGE DE HÉROS]** `/wp-content/uploads/2022/11/victrix-est-expert-en-solutions-de-cybersecurite-de-productivite-et-de-services-geres-scaled.jpg` — alt : « Canada's Leading IT Services Company. Victrix »
- **[LOGO / PICTO]** `/wp-content/uploads/2023/11/victrix_certifie_iso.png` — alt : « Victrix certified ISO 27001  »
- **[IMAGE]** `/wp-content/uploads/2022/03/istock-1272592927-1-3-1.png` — alt : « Accélération numérique »
- **[IMAGE]** `/wp-content/uploads/2022/02/solution-sevoc-intro.jpg` — alt : « Introduction à un système evolutif de gestion de sécurité - Victrix »
- **[IMAGE]** `/wp-content/uploads/2022/02/solution-migration-illus-scaled.jpg` — alt : « Solution TI pour entreprise - Migration - Victrix »
- **[LOGO / PICTO]** `/wp-content/uploads/2022/05/logo-microsoft.svg` — alt : « Microsoft 365 »
- **[IMAGE]** `/wp-content/uploads/2023/11/logo_ovh.png` — alt : « OVH Cloud  »
- **[IMAGE]** `/wp-content/uploads/2024/07/1200px-proofpoint_r_logo.png` — alt : « ProofPoint »
- Reformulés (texte là, hors décompte) : [P] « Découvrez Ø Studio »
- Widgets de l’ancien thème non repris (hors décompte) : « Rencontrez nos experts »

### `/en/services/cloud-services-provider/` — `src/content/services/en/services-infonuagiques.json`

Source : <https://www.victrix.ca/en/expertise/cloud-services-provider/> (110 blocs, 16 images)

- **[P]** (5 mots — court, à vérifier)

  > Dematerialization of Data Processing Centers

- **[H3]** (3 mots, 0 % retrouvé)

  > Elements to Analyze

- **[P]** (5 mots — court, à vérifier)

  > Get in touch with us!

- **[P AMPUTÉ]** (28 mots ; mots absents : tailored, objectives, offers)

  > Modernize your IT with cloud services and solutions tailored to your organizational needs and objectives. Victrix offers a personalized approach, based on acceleration, from project start-up to completion.

- **[P AMPUTÉ]** (21 mots ; mots absents : simplify, tailored, growth)

  > Victrix helps you simplify your IT management with customized cloud solutions and services tailored to your challenges and your organization's growth.

- **[P AMPUTÉ]** (23 mots ; mots absents : process, minimizes, disruption, reduces)

  > You can rely on our team for a smooth, secure, and efficient migration process that minimizes disruption and reduces the risk of downtime.

- **[P AMPUTÉ]** (36 mots ; mots absents : offers, particularly, center, specific)

  > A planned migration strategy ensures a smooth transition with minimal impact on your environment. Victrix offers unique expertise in cloud services, particularly in data center migration. We can meet any migration challenges in your specific context.

- **[P AMPUTÉ]** (19 mots ; mots absents : distinctive, allows, accelerate, center, offering, agile, quality)

  > Our distinctive approach allows us to accelerate data center dematerialization by offering agile, high-quality services through our multi-cloud practice.

- **[LOGO / PICTO]** `/wp-content/uploads/2023/10/azuree3.png` — alt : « azure logo »
- **[LOGO / PICTO]** `/wp-content/uploads/2023/10/aws4.png` — alt : « aws logo »
- **[IMAGE]** `/wp-content/uploads/2023/11/logo_ovh.png` — alt : « OVH Cloud  »
- **[IMAGE]** `/wp-content/uploads/2023/11/service-now-logo.png` — alt : « Service Now »
- Reformulés (texte là, hors décompte) : [P] « Workload Migration to the Cloud » · [P] « Identity Management and Security » · [H3] « Microsoft Azure Cloud Services » · [H3] « Amazon Web Services (AWS) » · [P] « Modern desk VDI/AVD/W365 » · [H3] « Preparation of Opportunity and Feasability Analysis » · [H3] « Scaling the Proof of Concept »

### `/en/merci/` — `(gabarit de page)`

Source : <https://www.victrix.ca/en/thank-you-page/> (9 blocs, 0 images)

- **[P]** (15 mots, 0 % retrouvé)

  > Your contact request has been processed. A Victrix expert will contact you within 24 hours.

- **[P]** (10 mots, 0 % retrouvé)

  > Strategic consulting, OpenShift POC, Microsoft Security Roadmap, PaaS opportunity study

- **[P]** (9 mots, 0 % retrouvé)

  > BI & Power BI M365 Development Process Management and Automation

- Reformulés (texte là, hors décompte) : [H1] « Thank you for your trust! »

### `/en/services/productivity-consulting/o-studio/` — `src/content/services/en/productivite/o-studio.json`

Source : <https://www.victrix.ca/en/expertise/productivity-consulting/o-studio/> (47 blocs, 6 images)

- **[P]** (4 mots — court, à vérifier)

  > Browse our app store

- **[LI]** (11 mots, 44 % retrouvé)

  > Reduce costs effectively (license and resource management to minimize unnecessary expenses)

- **[P AMPUTÉ]** (21 mots ; mots absents : benefit, customized, sustainable, challenges)

  > Benefit from Ø Studio’s expertise to develop and implement customized, sustainable and scalable digital solutions to meet all your business challenges.

- **[P AMPUTÉ]** (21 mots ; mots absents : specialists, optimize, leverage, their)

  > Our specialists will help you optimize your Dynamics 365 and Power Platform tools so that you can leverage their full potential.

- **[LOGO / PICTO]** `/wp-content/uploads/2023/09/o-studio-victrix-white-1-300x95.png` — alt : « O studio white logo »
- **[IMAGE DE HÉROS]** `/wp-content/uploads/2023/09/macbook-mockup-1-scaled.jpg` — alt : « macbook mockup »
- **[IMAGE]** `/wp-content/uploads/2023/09/victrix-img-02.png` — alt : « consultants chez Victrix au travail »
- **[IMAGE]** `/wp-content/uploads/2023/09/victrix-img-01.png` — alt : « Développement applicatif O studio »
- **[IMAGE]** `/wp-content/uploads/2023/09/boook.png` — alt : « o studio book »
- Reformulés (texte là, hors décompte) : [P] « Request a consultation  Browse our app store » · [LI] « Manage roles, access, and approvals »

### `/en/services/cybersecurity/zero-trust/` — `src/content/services/en/cybersecurite/zero-trust.json`

Source : <https://www.victrix.ca/en/expertise/cybersecurity/zero-trust/> (32 blocs, 2 images)

- **[P]** (14 mots — court, à vérifier)

  > Do you have a question or a project? Do not hesitate to contact us!

- **[P]** (18 mots, 40 % retrouvé)

  > Our cyber experts are available to answer your questions and guide you towards the best solution. *Gartner statistics

- Reformulés (texte là, hors décompte) : [H3] « 1. Seamless user experience 2. Continuous auditing 3. Least privilege … » · [H3] « By 2025, 60% of enterprises will use Zero Trust solutions instead of V… » · [P] « Implement Zero Trust » · [H3] « Discover Harmony Connect, Check Point's SASE Solution » · [H2] « Victrix, Your Strategic Partner for Continuously Improving Your Securi… »

### `/fr/services/productivite/o-studio/` — `src/content/services/fr/productivite/o-studio.json`

Source : <https://www.victrix.ca/expertise/productivite/o-studio/> (47 blocs, 6 images)

- **[LI]** (2 mots — court, à vérifier)

  > Facilité d’adoption

- **[P AMPUTÉ]** (40 mots ; mots absents : veritable, createur, optimiser, travail)

  > Ø Studio est un véritable créateur de valeur pour votre organisation. Nous vous offrons rapidité de développement et gain en capacité de livraison pour moderniser vos solutions d’affaires, développer la gouvernance de vos outils et optimiser vos flux de travail.

- **[P AMPUTÉ]** (24 mots ; mots absents : durables, repondre, defis)

  > Bénéficiez de l’expertise Ø Studio pour développer et mettre en œuvre des applications personnalisées, durables et évolutives pour répondre à tous vos défis d’affaires.

- **[P AMPUTÉ]** (36 mots ; mots absents : preparez, augmenter, performance)

  > Avec le Ø Studio à vos côtés, le développement Power Apps, l’automatisation de processus et la gouvernance de vos outils sont des objectifs facilement réalisables. Préparez-vous à augmenter la performance et la productivité de vos équipes!

- **[P AMPUTÉ]** (49 mots ; mots absents : specialistes, aideront, optimiser, tirer, plein)

  > Plus qu’une simple offre de conseil et de services de développement d’applications, l’équipe Ø Studio maitrise parfaitement les outils Power Platform: Power Apps, Power Automate, Power BI et Power Pages. Nos spécialistes vous aideront à optimiser vos outils Dynamics 365 et Power Platform afin d'en tirer le plein potentiel.

- **[P AMPUTÉ]** (44 mots ; mots absents : voici, suivre, assurer, succes)

  > Qu’il s’agisse d’un développement d’applications à code lourd ou de la création d’applications no code low code, une bonne planification avant la conception est nécessaire. Voici les 5 étapes à suivre pour assurer le succès de votre développement Microsoft Power Platform et Microsoft Dynamics.

- **[LI AMPUTÉ]** (13 mots ; mots absents : minimiser, depenses, inutiles)

  > Réduction des coûts (gestion des licences et ressources pour minimiser les dépenses inutiles)

- **[LOGO / PICTO]** `/wp-content/uploads/2023/09/o-studio-victrix-white-1-300x95.png` — alt : « Logo o studio blanc »
- **[IMAGE DE HÉROS]** `/wp-content/uploads/2023/09/macbook-mockup-1-scaled.jpg` — alt : « macbook mockup »
- **[IMAGE]** `/wp-content/uploads/2023/09/victrix-img-02.png` — alt : « consultants chez Victrix au travail »
- **[IMAGE]** `/wp-content/uploads/2023/09/victrix-img-01.png` — alt : « Développement applicatif O studio »
- **[IMAGE]** `/wp-content/uploads/2023/09/boook.png` — alt : « o studio book »
- Reformulés (texte là, hors décompte) : [H2] « FAQ — Développement d’applications Microsoft Power Platform & Dynamics… » · [LI] « Présentation d’une démonstration ou preuve de valeurs »

### `/en/carrieres/` — `src/content/pages/en/carrieres.json`

Source : <https://www.victrix.ca/en/careers/> (30 blocs, 8 images)

- **[P AMPUTÉ]** (22 mots ; mots absents : participatory, which, express, themselves, daily)

  > This label is awarded following a participatory survey, which allows employees to express themselves anonymously on their daily experience in the company.

- **[P AMPUTÉ]** (22 mots ; mots absents : further, course, surprisingly, become)

  > Victrix allows me to do further training. The course is surprisingly good and allows me to become even better in my field.

- **[IMAGE DE HÉROS]** `/wp-content/uploads/2022/05/istock-1028705006-scaled.jpg` — alt : « Faites carrière chez Victrix, découvrez nos offres d'emploi »
- **[IMAGE]** `/wp-content/uploads/2022/03/happy-at-work-index-1.png` — alt : « Happy At Work »
- **[IMAGE]** `/wp-content/uploads/2022/04/carrieres-nous-rejoindre.jpg` — alt : « rejoindre l'équipe victrix »
- **[IMAGE]** `/wp-content/uploads/2022/05/portrait-temoignage-1.png` — alt : « témoignage employé Victrix »
- **[IMAGE]** `/wp-content/uploads/2022/05/portrait-temoignage-2.png` — alt : « portrait d'un employé Victrix »
- **[IMAGE]** `/wp-content/uploads/2022/04/carrieres-engagement-rse-scaled.jpg` — alt : « une équipe engagée »
- **[IMAGE]** `/wp-content/uploads/2024/07/avenir_ti_rgb_bleu-fi11915996x314.png` — alt : « Mon Avenir TI »
- **[IMAGE]** `/wp-content/uploads/2024/06/2560px-logo_cegep_de_la_pocatiere-svg.png` — alt : « Cegep de La Pocathière »
- Reformulés (texte là, hors décompte) : [P] « Browse our job vacancies and find the opportunity you’ve been waiting … » · [LI] « Personal and Professional Development » · [LI] « Career Development » · [LI] « Well-being in the workplace » · [H3] « Our CSR commitments and activities » · [P] « Drop us a line or schedule a meeting with our teams! »

### `/fr/ressources/` — `(gabarit de page)`

Source : <https://www.victrix.ca/ressources/> (15 blocs, 6 images)

- **[IMAGE DE HÉROS]** `/wp-content/uploads/2025/03/design-sans-titre-2-1024x683.png` — alt : « Intelligence artificielle »
- **[IMAGE]** `/wp-content/uploads/2025/08/victrix_agc-press-release-01-1024x512.png` — alt : « Partenariat exclusif avec Auger Groupe Conseil AGC »
- **[IMAGE]** `/wp-content/uploads/2025/08/image-article-exchange-se_01-1-1024x512.png` — alt : « Windows 10 to 11 migration »
- **[IMAGE]** `/wp-content/uploads/2025/09/copie-de-bannieres-linkedin-8.png` — alt : « bannière webinaire copilot »
- **[LOGO / PICTO]** `/wp-content/uploads/2025/07/cover-article_certification-iso_fr-1-1024x512.png` — alt : « Bannière communiqué ISO 27001 et ISO 9001 »
- **[IMAGE]** `/wp-content/uploads/2022/02/solution-sevoc-pourquoi-1024x683.jpg` — alt : « Mise en place d'une équipe SOC »
- **[LIEN]** `/categorie/nos-actualites/` — porté par « Nos actualités… »
- **[LIEN]** `/categorie/articles/` — porté par « Nos articles… »
- **[LIEN]** `/categorie/etudes-de-cas/` — porté par « Nos études de cas… »
- **[LIEN]** `/categorie/livres-blancs/` — porté par « Nos livres blancs… »
- **[LIEN]** `/categorie/videos/` — porté par « Nos vidéos… »
- Reformulés (texte là, hors décompte) : [LI] « Nos études de cas » · [LI] « Nos livres blancs » · [H3] « Webinaire Copilot – Du buzz à l’impact réel »

### `/en/services/it-procurement/microsoft-solutions/` — `src/content/services/en/approvisionnement-ti/solutions-microsoft.json`

Source : <https://www.victrix.ca/en/expertise/it-procurement/microsoft-solutions/> (63 blocs, 10 images)

- **[LOGO / PICTO]** `/wp-content/uploads/2022/05/logo-victrix-english_white.png` — alt : « Logo victrix »
- **[LOGO / PICTO]** `/wp-content/uploads/2022/05/microsoft-logo_rgb_c-wht.png` — alt : « Logo microsoft »
- **[LOGO / PICTO]** `/wp-content/uploads/2022/05/microsoft-1.png` — alt : « Microsoft logo »
- **[LOGO / PICTO]** `/wp-content/uploads/2022/05/microsoft-dynamics.png` — alt : « Microsoft Dynamics 365 logo »
- **[LOGO / PICTO]** `/wp-content/uploads/2022/05/microsoft_power_platform_logo-svg.png` — alt : « Power Platform logo »
- **[LOGO / PICTO]** `/wp-content/uploads/2022/05/microsoft-azure-logo.png` — alt : « Microsoft Azure logo »
- **[LOGO / PICTO]** `/wp-content/uploads/2022/05/microsoft_copilot_icon.png` — alt : « Microsoft copilot logo »
- **[LOGO / PICTO]** `/wp-content/uploads/2022/05/copilot-studio-logo-150x150.png` — alt : « Copilot studio logo »
- **[LOGO / PICTO]** `/wp-content/uploads/2022/05/peer-insights-r-tm-rgb-for-white-bkgrnd.svg` — alt : « gartner peer insights logo »
- Reformulés (texte là, hors décompte) : [H5] « Overall user rating: ⭐⭐⭐⭐⭐—October 27, 2025 » · [H5] « Overall user rating: ⭐⭐⭐⭐—October 23 , 2025 » · [H5] « Overall user rating: ⭐⭐⭐⭐—October 8, 2025 » · [H2] « Request Your Microsoft Solutions »

### `/fr/services/approvisionnement-ti/solutions-microsoft/` — `src/content/services/fr/approvisionnement-ti/solutions-microsoft.json`

Source : <https://www.victrix.ca/expertise/approvisionnement-ti/solutions-microsoft/> (63 blocs, 10 images)

- **[LOGO / PICTO]** `/wp-content/uploads/2022/05/logo-victrix_blanc.png` — alt : « Logo victrix »
- **[LOGO / PICTO]** `/wp-content/uploads/2022/05/microsoft-logo_rgb_c-wht.png` — alt : « Logo microsoft »
- **[LOGO / PICTO]** `/wp-content/uploads/2022/05/microsoft-1.png` — alt : « Microsoft logo »
- **[LOGO / PICTO]** `/wp-content/uploads/2022/05/microsoft-dynamics.png` — alt : « Microsoft Dynamics 365 logo »
- **[LOGO / PICTO]** `/wp-content/uploads/2022/05/microsoft_power_platform_logo-svg.png` — alt : « Power Platform logo »
- **[LOGO / PICTO]** `/wp-content/uploads/2022/05/microsoft-azure-logo.png` — alt : « Microsoft Azure logo »
- **[LOGO / PICTO]** `/wp-content/uploads/2022/05/microsoft_copilot_icon.png` — alt : « Microsoft copilot logo »
- **[LOGO / PICTO]** `/wp-content/uploads/2022/05/copilot-studio-logo-150x150.png` — alt : « Copilot studio logo »
- **[LOGO / PICTO]** `/wp-content/uploads/2022/05/peer-insights-r-tm-rgb-for-white-bkgrnd.svg` — alt : « gartner peer insights logo »
- Reformulés (texte là, hors décompte) : [H5] « Note globale de l'utilisateur : ⭐⭐⭐⭐⭐—27 octobre 2025 » · [H5] « Note globale de l'utilisateur : ⭐⭐⭐⭐—23 octobre 2025 » · [H5] « Note globale de l'utilisateur : ⭐⭐⭐⭐—8 octobre 2025 » · [H2] « Obtenir des solutions Microsoft »

### `/fr/services/cybersecurite/centre-operationnel-de-securite-evolutif/` — `src/content/services/fr/cybersecurite/centre-operationnel-de-securite-evolutif.json`

Source : <https://www.victrix.ca/expertise/cybersecurite/centre-operationnel-de-securite-evolutif/> (68 blocs, 6 images)

- **[P]** (4 mots — court, à vérifier)

  > SEvOC en chiffres clés

- **[H2]** (3 mots, 0 % retrouvé)

  > Intéressés ? Des questions ?

- **[H2]** (3 mots, 50 % retrouvé)

  > Une offre adaptative

- **[P AMPUTÉ]** (29 mots ; mots absents : consultez, decouvrir, prenez, rendez)

  > Consultez les experts de notre centre de sécurité opérationnel évolutif (SEvOC) pour découvrir comment nous modulons notre offre SOC en fonction des besoins uniques de votre organisation. Prenez rendez-vous

- **[IMAGE]** `/wp-content/uploads/2025/06/victrix-secov-fr.png` — alt : « Victrix SEvOC »
- **[IMAGE]** `/wp-content/uploads/2022/05/sevoc-methodo-1.png` — alt : « SEvOC infographic concept »
- **[IMAGE]** `/wp-content/uploads/2022/05/sevoc-methodo-2.png` — alt : « SEvOC infographic concept »
- **[IMAGE]** `/wp-content/uploads/2022/05/sevoc-methodo-3.png` — alt : « SEvOC infographic concept »
- **[LOGO / PICTO]** `/wp-content/uploads/2025/06/sevoc-certification.png` — alt : « SEvOC certification »
- Reformulés (texte là, hors décompte) : [P] « • Partenariat Microsoft Sentinel — +30 clients. » · [H2] « Bénéficiez de notre centre opérationnel de sécurité évolutif dédié »
- Widgets de l’ancien thème non repris (hors décompte) : « Parlons de vos projets »

### `/fr/services/services-infonuagiques/` — `src/content/services/fr/services-infonuagiques.json`

Source : <https://www.victrix.ca/expertise/services-infonuagiques/> (109 blocs, 16 images)

- **[H3]** (3 mots, 0 % retrouvé)

  > Éléments à analyser

- **[P AMPUTÉ]** (33 mots ; mots absents : objectifs, organisationnels, offre)

  > Modernisez votre informatique avec des solutions et services infonuagiques adaptés à vos besoins et objectifs organisationnels. Victrix vous offre une approche sur mesure, basée sur l’accélération, du démarrage du projet à sa réalisation.

- **[P AMPUTÉ]** (25 mots ; mots absents : unique, soutenir, atteinte, objectifs)

  > Découvrez tous les avantages de nos services infonuagiques pour entreprise et la méthodologie unique de Victrix pour soutenir votre organisation dans l’atteinte de vos objectifs.

- **[P AMPUTÉ]** (22 mots ; mots absents : optimiser, productivite, espaces, bureaux)

  > Bénéficiez du stockage Azure sécurisé et de toutes les fonctions innovantes de Microsoft pour optimiser votre productivité et vos espaces de bureaux.

- **[P AMPUTÉ]** (25 mots ; mots absents : processus, fluide, minimise, perturbations, reduit, risque, equipe)

  > Pour un processus de migration fluide, sécurisé et efficace qui minimise les perturbations et réduit le risque de temps d’arrêt, faites confiance à notre équipe.

- **[P AMPUTÉ]** (50 mots ; mots absents : propose, unique, matiere, particulierement, sommes, selon)

  > Une stratégie de migration planifiée garantit une transition sans heurt avec un impact minimal sur vos environnements. Victrix propose une expertise unique en matière de services infonuagiques, et plus particulièrement en migration de centres de données. Nous sommes en mesure de répondre à vos enjeux de migration selon votre contexte.

- **[P AMPUTÉ]** (43 mots ; mots absents : utilisant, utilisons, ainsi)

  > Notre mission est de garantir votre excellence opérationnelle en utilisant les meilleures pratiques de conformité, de sécurité des données et de performance. Nous utilisons ainsi les modèles Well Architected Framework (WAF) et Cloud Adoption Framework (CAF) pour tous vos projets de migration infonuagique.

- **[LOGO / PICTO]** `/wp-content/uploads/2023/10/azuree3.png` — alt : « azure logo »
- **[LOGO / PICTO]** `/wp-content/uploads/2023/10/aws4.png` — alt : « aws logo »
- **[IMAGE]** `/wp-content/uploads/2023/11/logo_ovh.png` — alt : « OVH Cloud  »
- **[IMAGE]** `/wp-content/uploads/2023/11/service-now-logo.png` — alt : « Service Now »
- Reformulés (texte là, hors décompte) : [P] « Migration des charges dans le nuage » · [P] « Dématérialisation des centres de traitement des données » · [H3] « Amazon Web Services (AWS) » · [LI] « Prérequis techniques et autres » · [LI] « Compréhension des enjeux technologiques et affaires » · [LI] « Réalisation de la preuve de concept » · [H3] « Gradation de la preuve de concept » · [LI] « Gradation de systèmes » · [H3] « Rencontrez nos experts en solutions infonuagiques »
- Widgets de l’ancien thème non repris (hors décompte) : « Parlons de vos projets » · « Parlons de vos projets »

### `/en/services/cybersecurity/scalable-security-operations-center/` — `src/content/services/en/cybersecurite/centre-operationnel-de-securite-evolutif.json`

Source : <https://www.victrix.ca/en/expertise/cybersecurity/scalable-security-operations-center/> (70 blocs, 6 images)

- **[P]** (3 mots — court, à vérifier)

  > SEvOC Key Figures

- **[H2]** (4 mots, 0 % retrouvé)

  > Interested? Have Any Questions?

- **[H2]** (4 mots, 33 % retrouvé)

  > An Adaptative Cybersecurity Solution

- **[IMAGE]** `/wp-content/uploads/2025/06/victrix-secov-en.png` — alt : « Victrix SEvOC »
- **[IMAGE]** `/wp-content/uploads/2022/05/sevoc-methodo-1.png` — alt : « SEvOC infographic concept »
- **[IMAGE]** `/wp-content/uploads/2022/05/sevoc-methodo-2.png` — alt : « SEvOC infographic concept »
- **[IMAGE]** `/wp-content/uploads/2022/05/sevoc-methodo-3.png` — alt : « SEvOC infographic concept »
- **[LOGO / PICTO]** `/wp-content/uploads/2025/06/sevoc-certification.png` — alt : « SEvOC certification »
- Reformulés (texte là, hors décompte) : [H1] « Scalable Security Operations Center (SOC) » · [P] « ➜ Respond rapidly to security alerts »

### `/en/ressources/` — `(gabarit de page)`

Source : <https://www.victrix.ca/en/resources-center/> (15 blocs, 6 images)

- **[LOGO / PICTO]** `/wp-content/uploads/2025/08/victrix_agc-press-release-en-1024x512.png` — alt : « Exclusive partnership announcement with Auger Groupe Conseil »
- **[IMAGE]** `/wp-content/uploads/2025/08/image-article-exchange-se_01-1-1024x512.png` — alt : « Windows 10 to 11 migration »
- **[LOGO / PICTO]** `/wp-content/uploads/2025/07/cover-article_certification-iso_en-1-1024x512.png` — alt : « Banner Press Release ISO 27001 and ISO 9001 »
- **[IMAGE]** `/wp-content/uploads/2022/02/solution-sevoc-pourquoi-1024x683.jpg` — alt : « Mise en place d'une équipe SOC »
- **[IMAGE]** `/wp-content/uploads/2025/07/cover-article-victrix.jpg` — alt : « agent intelligent Copilot Studio »
- **[LIEN]** `/en/category/posts/` — porté par « Our articles… »
- **[LIEN]** `/en/category/case-studies/` — porté par « Our case studies… »
- **[LIEN]** `/en/category/our-news/` — porté par « Our news… »
- **[LIEN]** `/en/category/videos/` — porté par « Our videos… »
- **[LIEN]** `/en/category/white-papers/` — porté par « Our white papers… »
- Reformulés (texte là, hors décompte) : [LI] « Our case studies » · [LI] « Our white papers »

### `/fr/carrieres/` — `src/content/pages/fr/carrieres.json`

Source : <https://www.victrix.ca/carriere/> (30 blocs, 8 images)

- **[IMAGE DE HÉROS]** `/wp-content/uploads/2022/05/istock-1028705006-scaled.jpg` — alt : « Faites carrière chez Victrix, découvrez nos offres d'emploi »
- **[IMAGE]** `/wp-content/uploads/2022/03/happy-at-work-index-1.png` — alt : « Happy At Work »
- **[IMAGE]** `/wp-content/uploads/2022/04/carrieres-nous-rejoindre.jpg` — alt : « rejoindre l'équipe victrix »
- **[IMAGE]** `/wp-content/uploads/2022/05/portrait-temoignage-1.png` — alt : « témoignage employé Victrix »
- **[IMAGE]** `/wp-content/uploads/2022/05/portrait-temoignage-2.png` — alt : « portrait d'un employé Victrix »
- **[IMAGE]** `/wp-content/uploads/2022/04/carrieres-engagement-rse-scaled.jpg` — alt : « une équipe engagée »
- **[IMAGE]** `/wp-content/uploads/2024/06/2560px-logo_cegep_de_la_pocatiere-svg.png` — alt : « Cegep de La Pocathière »
- **[IMAGE]** `/wp-content/uploads/2024/07/avenir_ti_rgb_bleu-fi11915996x314.png` — alt : « Mon Avenir TI »
- Reformulés (texte là, hors décompte) : [P] « Nous vous offrons: » · [LI] « Développement personnel et professionnel »

### `/fr/services/cybersecurite/internet-des-objets-service-iot/` — `src/content/services/fr/cybersecurite/internet-des-objets-service-iot.json`

Source : <https://www.victrix.ca/expertise/cybersecurite/internet-des-objets-service-iot/> (40 blocs, 3 images)

- **[P]** (5 mots — court, à vérifier)

  > Parlez à un expert IoT

- **[P]** (4 mots — court, à vérifier)

  > degrés d'expertise en TI

- **[P AMPUTÉ]** (38 mots ; mots absents : inclut, mesures, avancees, reduire, personnelles)

  > Notre service IoT et OT inclut l’analyse de vos besoins, la mise en œuvre de mesures de sécurité avancées et une surveillance continue en temps réel pour réduire le risque d’attaques et garantir l’intégrité de vos données personnelles.

- **[P AMPUTÉ]** (25 mots ; mots absents : offrons, aussi, inclut)

  > Nous offrons aussi un soutien technique complet qui inclut des plans de maintenance proactive et la mise à jour régulière de vos logiciels de sécurité.

- **[P AMPUTÉ]** (20 mots ; mots absents : employes, familiarisent, concernant)

  > Grâce à l’organisation de sessions de formation pour vos équipes, vos employés se familiarisent avec les meilleures pratiques concernant l’IoT.

- **[P AMPUTÉ]** (16 mots ; mots absents : durant, cette, phase, transition, egalement)

  > Notre accompagnement personnalisé durant cette phase de transition assure également le succès d’adoption des nouvelles technologies.

- **[IMAGE]** `/wp-content/uploads/2024/07/ales-nesetril-im7lzjxelhg-unsplash-1.png` — alt : « Un ordinateur portable est un bon exemple d'appareil connecté et de l'internet des objets (IoT). »
- **[IMAGE]** `/wp-content/uploads/2024/07/istock-1462139281-1.png` — alt : « Des employés utilisant une tablette électronique (objet connecté) dans leur organisation. »
- Reformulés (texte là, hors décompte) : [H1] « Sécurité des objects connectés (IoT et OT) » · [H2] « Victrix assure la sécurité des systèmes IoT et OT » · [P] « Évaluation et inventaire IoT » · [P] « Formation et accompagnement personnalisé aux organisations » · [H2] « Expertise sectorielle en OT/IoT et cybersécurité »

### `/fr/services/productivite/copilot-studio/` — `src/content/services/fr/productivite/copilot-studio.json`

Source : <https://www.victrix.ca/expertise/productivite/copilot-studio/> (25 blocs, 3 images)

- **[P]** (5 mots — court, à vérifier)

  > Discutez avec un expert Copilot

- **[P]** (7 mots — court, à vérifier)

  > Prendre rendez-vous avec un de nos experts

- **[P AMPUTÉ]** (12 mots ; mots absents : installer, necessite, adaptee)

  > Installer Microsoft Copilot nécessite une approche stratégique et adaptée à votre organisation.

- **[P AMPUTÉ]** (17 mots ; mots absents : offre, adaptable, besoins)

  > Victrix vous offre un accompagnement adaptable basé sur vos priorités et vos besoins en lien avec l'IA.

- **[LOGO / PICTO]** `/wp-content/uploads/2024/08/evolution.png` — alt : « logo evolution »
- **[LOGO / PICTO]** `/wp-content/uploads/2024/08/evaluation.png` — alt : « logo evaluation »
- Reformulés (texte là, hors décompte) : [P] « Les réalisations Copilot Studio de Victrix » · [P] « Juridique: automatisation de la gestion documentaire »

### `/fr/services/services-ti-geres/` — `src/content/services/fr/services-ti-geres.json`

Source : <https://www.victrix.ca/expertise/services-ti-geres/> (101 blocs, 1 images)

- **[P]** (4 mots — court, à vérifier)

  > Échangez avec un expert

- **[P]** (7 mots — court, à vérifier)

  > Demandez une évaluation de vos besoins TI

- **[LI]** (3 mots — court, à vérifier)

  > ÉLEVÉ ET VARIABLE

- **[LI]** (3 mots — court, à vérifier)

  > RIGIDITÉ ET DÉLAIS

- **[H2]** (3 mots, 50 % retrouvé)

  > Intéressés ? Des questions ?

- **[LI AMPUTÉ]** (20 mots ; mots absents : ayant, competences, specialisees)

  > Extension de votre équipe avec des experts certifiés ayant des compétences spécialisées en infonuagique, sécurité, infrastructure, productivité et conseil stratégique.

- Reformulés (texte là, hors décompte) : [H4] « Découvrez comment notre offre de services gérés TI permet à vos équipe… » · [H2] « Une couverture de services gérés axée sur la sécurité et l’amélioratio… » · [H2] « Victrix: une prise en charge qui résout vos défis de gestion TI » · [H2] « En savoir plus sur nos services gérés TI » · [H3] « Comparer les services gérés de Victrix à la gestion interne » · [LI] « MOINS DE 24H » · [LI] « CONFORMITÉ ET VEILLE CONTINUE » · [LI] « DÉPENDANCES AUX RESSOURCES INTERNES » · [H2] « Quelles certifications reconnues possèdent Victrix? »

### `/en/services/it-procurement/` — `src/content/services/en/approvisionnement-ti.json`

Source : <https://www.victrix.ca/en/expertise/it-procurement/> (123 blocs, 1 images)

- **[P]** (4 mots — court, à vérifier)

  > Talk to an expert

- **[H2]** (8 mots, 57 % retrouvé)

  > Need Expert Guidance with Your IT Hardware Purchases?

- **[H2]** (3 mots, 0 % retrouvé)

  > Request IT Solution

- **[P AMPUTÉ]** (16 mots ; mots absents : choose, consult, specialist)

  > With Victrix, you choose a partner that combines technical know-how, security, and governance. Consult a specialist

- **[P AMPUTÉ]** (12 mots ; mots absents : approach, ensures, effective, predictable)

  > Our approach ensures your business continuity, compliance, and cost-effective, predictable IT expenses.

- Reformulés (texte là, hors décompte) : [H3] « Strategic, Secure, and Managed IT Procurement with Victrix » · [H2] « Technology Solutions and Partnerships for a High-Performance, Resilien… » · [P] « Explore Check Point solutions » · [P] « Explore CrowdStrike solutions » · [P] « Explore Palo Alto Networks solutions » · [P] « Explore Zscaler solutions » · [P] « Explore Microsoft solutions » · [P] « Explore Cisco solutions » · [P] « Explore HPE Networking solutions » · [P] « → Power Platform: Power Apps, Power Automate, Power BI et Power Pages » · [P] « Explore Microsoft solutions » · [P] « Explore ServiceNow solutions » · [P] « Explore Dell Technologies solutions » · [H2] « IT Procurement and Management Services for Your Licenses and Equipment » · [P] « Our IT asset management service covers: » · [H2] « Victrix: Your Trusted Partner for Acquiring and Managing IT Licenses a… »

### `/en/services/it-procurement/palo-alto-networks/` — `src/content/services/en/approvisionnement-ti/palo-alto-networks.json`

Source : <https://www.victrix.ca/en/expertise/it-procurement/palo-alto-networks/> (60 blocs, 7 images)

- **[LOGO / PICTO]** `/wp-content/uploads/2022/05/logo-victrix-english_white.png` — alt : « Logo victrix »
- **[LOGO / PICTO]** `/wp-content/uploads/2022/05/prisma-primary.png` — alt : « Logo Prisma Palo Alto Networks »
- **[LOGO / PICTO]** `/wp-content/uploads/2022/05/strata_tagline_logo_rgb.png` — alt : « Logo Strata Palo Alto Networks »
- **[LOGO / PICTO]** `/wp-content/uploads/2022/05/cortex-primary.png` — alt : « Logo cortex Palo Alto Networks »
- **[LOGO / PICTO]** `/wp-content/uploads/2022/05/unit42-logo-rgb_color.png` — alt : « Palo Alto Networks Unit 42 logo »
- **[LOGO / PICTO]** `/wp-content/uploads/2022/05/peer-insights-r-tm-rgb-for-white-bkgrnd.svg` — alt : « gartner peer insights logo »
- Reformulés (texte là, hors décompte) : [H4] « Fewer Tools. Better Control. » · [H5] « Overall user rating: ⭐⭐⭐⭐⭐ » · [H5] « Overall user rating:⭐⭐⭐⭐⭐ » · [H5] « Overall user rating:⭐⭐⭐⭐⭐ » · [H2] « Request Your Palo Alto Networks Solution »

### `/fr/services/approvisionnement-ti/palo-alto-networks/` — `src/content/services/fr/approvisionnement-ti/palo-alto-networks.json`

Source : <https://www.victrix.ca/expertise/approvisionnement-ti/palo-alto-networks/> (57 blocs, 7 images)

- **[LOGO / PICTO]** `/wp-content/uploads/2022/05/logo-victrix_blanc.png` — alt : « Logo victrix »
- **[LOGO / PICTO]** `/wp-content/uploads/2022/05/prisma-primary.png` — alt : « Logo Prisma Palo Alto Networks »
- **[LOGO / PICTO]** `/wp-content/uploads/2022/05/strata_tagline_logo_rgb.png` — alt : « Logo Strata Palo Alto Networks »
- **[LOGO / PICTO]** `/wp-content/uploads/2022/05/cortex-primary.png` — alt : « Logo cortex Palo Alto Networks »
- **[LOGO / PICTO]** `/wp-content/uploads/2022/05/unit42-logo-rgb_color.png` — alt : « Palo Alto Networks Unit 42 logo »
- **[LOGO / PICTO]** `/wp-content/uploads/2022/05/peer-insights-r-tm-rgb-for-white-bkgrnd.svg` — alt : « gartner peer insights logo »
- Reformulés (texte là, hors décompte) : [H4] « Moins d’outils. Plus de contrôle. » · [H5] « Note globale de l'utilisateur : ⭐⭐⭐⭐⭐—22 janvier 2026 » · [H5] « Note globale de l'utilisateur : ⭐⭐⭐⭐⭐—16 janvier 2026 » · [H5] « Note globale de l'utilisateur : ⭐⭐⭐⭐⭐—30 novembre 2025 » · [P] « Obtenir des solutions Palo Alto Networks »

### `/en/services/cybersecurity/internet-of-things-iot/` — `src/content/services/en/cybersecurite/internet-des-objets-service-iot.json`

Source : <https://www.victrix.ca/en/expertise/cybersecurity/internet-of-things-iot/> (40 blocs, 3 images)

- **[P]** (4 mots — court, à vérifier)

  > degrees of IT expertise

- **[P AMPUTÉ]** (34 mots ; mots absents : includes, advanced, measures, personal)

  > Our OT and IOT security service includes analysis of your needs, implementation of advanced security measures and continuous real-time monitoring to reduce the risk of attacks and guarantee the integrity of your personal data.

- **[P AMPUTÉ]** (15 mots ; mots absents : organizing, employees, become, familiar)

  > By organizing training sessions for your teams, your employees become familiar with IoT best practices.

- **[P AMPUTÉ]** (14 mots ; mots absents : during, transition, phase)

  > Our personalized support during this transition phase also ensures successful adoption of new technologies.

- **[IMAGE]** `/wp-content/uploads/2024/06/ales-nesetril-im7lzjxelhg-unsplash-1.png` — alt : « A laptop is a good example of a connected device linked to the Internet of Things (IoT). »
- **[IMAGE]** `/wp-content/uploads/2024/06/istock-1462139281-1.png` — alt : « Employees using an electronic tablet (connected object) in their organization. »
- Reformulés (texte là, hors décompte) : [P] « How Victrix Assesses Your Level of OT and IoT Security » · [P] « Benefits of our OT and IoT Security Services for Organizations » · [P] « IoT Inventory and Assessment » · [P] « Training and Personalized Support for Organizations »

### `/en/services/productivity-consulting/copilot-studio/` — `src/content/services/en/productivite/copilot-studio.json`

Source : <https://www.victrix.ca/en/expertise/productivity-consulting/copilot-studio/> (22 blocs, 3 images)

- **[P]** (4 mots — court, à vérifier)

  > Identification of Use Cases

- **[P]** (4 mots — court, à vérifier)

  > Human Resources: Conversational Agent

- **[P AMPUTÉ]** (11 mots ; mots absents : flexible, based, related, needs)

  > Victrix offers flexible support based on your AI-related priorities and needs.

- **[LOGO / PICTO]** `/wp-content/uploads/2024/08/evolution.png` — alt : « logo evolution »
- **[LOGO / PICTO]** `/wp-content/uploads/2024/08/evaluation.png` — alt : « logo evaluation »
- Reformulés (texte là, hors décompte) : [LI] « Define priorities and objectives » · [P] « Copilot Studio Projects by Victrix » · [P] « Health: Intelligent Document Search » · [P] « Legal: Automated Document Management »

### `/fr/services/services-infonuagiques/migration-vers-azure/` — `src/content/services/fr/services-infonuagiques/migration-vers-azure.json`

Source : <https://www.victrix.ca/expertise/services-infonuagiques/migration-vers-azure/> (104 blocs, 5 images)

- **[P AMPUTÉ]** (37 mots ; mots absents : aidons, adopter, beneficier)

  > Accélérez votre passage vers la plateforme Azure avec le soutien de nos experts en solutions infonuagiques. Nous vous aidons à adopter l’infonuagique afin de bénéficier d’une agilité et d’une accessibilité accrues et d’une posture de sécurité rehaussée.

- **[P AMPUTÉ]** (23 mots ; mots absents : lorsqu, parle, efficacement, specifiques)

  > Lorsqu’on parle des avantages d’Azure, la flexibilité et la rentabilité sont en tête de liste. Azure répond efficacement aux besoins spécifiques en matière:

- **[P AMPUTÉ]** (37 mots ; mots absents : recherche, gagner, cette)

  > Si vous êtes à la recherche d’une solution infonuagique de bout en bout, vous avez tout à gagner avec la migration vers Microsoft Azure. Cette solution est réputée mondialement pour sa réponse efficace à divers besoins technologiques.

- **[P AMPUTÉ]** (45 mots ; mots absents : reconnue, repondre, avons, demontre, capacites, experience, competences, fournir, probants, utilisant)

  > Victrix est reconnue pour répondre aux normes les plus strictes de Microsoft en matière de sécurité infonuagique et de protection contre les menaces. Nous avons démontré nos capacités techniques, notre expérience et nos compétences pour fournir des résultats probants aux clients utilisant les solutions Microsoft.

- **[P AMPUTÉ]** (13 mots ; mots absents : possede, statut, domaines, suivants)

  > Victrix possède le statut de Partenaire de solutions Microsoft pour les domaines suivants :

- **[IMAGE DE HÉROS]** `/wp-content/uploads/2023/08/mirosoft_azure.png` — alt : « Experts infonuagique travaillant sur les solutions aws  »
- **[LOGO / PICTO]** `/wp-content/uploads/2023/08/microsoftlogo.png` — alt : « Experts infonuagique travaillant sur les solutions aws  »
- Reformulés (texte là, hors décompte) : [H2] « En savoir plus sur les services infonuagiques Microsoft Azure » · [LI] « D'infrastructure » · [LI] « D’analyse et de sauvegarde de données » · [LI] « De développement d’applications sur mesure » · [H2] « Nos services Microsoft Azure » · [P] « Solutions de migration de données » · [H2] « Partenaire de solutions Microsoft et services Azure gérés » · [H3] « Stratégie — Planification — Déploiement — Gouvernance — Sécurité » · [LI] « Accélération de l’adoption de la plateforme infonuagique » · [LI] « Renforcement des meilleures pratiques (itérations) »
- Widgets de l’ancien thème non repris (hors décompte) : « Parlons de vos projets »

### `/en/services/artificial-intelligence/landing-ai-consulting/` — `src/content/services/en/intelligence-artificielle/accompagnement-ia.json`

Source : <https://www.victrix.ca/en/expertise/artificial-intelligence/landing-ai-consulting/> (94 blocs, 4 images)

- **[P]** (3 mots — court, à vérifier)

  > WHO ARE YOU?

- **[P]** (3 mots — court, à vérifier)

  > WHAT YOU GAIN

- **[LOGO / PICTO]** `/wp-content/uploads/2022/05/logo-victrix-english_white.png` — alt : « Logo victrix »
- **[IMAGE]** `/wp-content/uploads/2026/07/smiling-colleagues-sitting-on-steps-in-office-2026-03-25-03-17-09-utc-1-scaled.jpg` — alt : « Des bénéfices concrets pour chacun, de la direction aux TI et lignes d'affaires. »
- **[IMAGE]** `/wp-content/uploads/2026/07/happy-colleagues-at-modern-office-workplace-lookin-2026-01-09-09-28-57-utc-1-scaled.jpg` — alt : « Des consultants en intelligence artificielle chez Victrix, mobilisés chez un client. »
- Reformulés (texte là, hors décompte) : [P] « A structured, responsible, and pragmatic approach » · [P] « Expertise mobilized around your real needs » · [P] « A true partner, close to your teams » · [H2] « Schedule an AI consultation »

### `/en/services/it-procurement/hpe-networking/` — `src/content/services/en/approvisionnement-ti/hpe-networking.json`

Source : <https://www.victrix.ca/en/expertise/it-procurement/hpe-networking/> (77 blocs, 6 images)

- **[LOGO / PICTO]** `/wp-content/uploads/2022/05/logo-victrix-english_white.png` — alt : « Logo victrix »
- **[LOGO / PICTO]** `/wp-content/uploads/2022/05/hpe_light_logo.png` — alt : « Logo HPE »
- **[LOGO / PICTO]** `/wp-content/uploads/2022/05/hpe-juniper.png` — alt : « HPE Juniper logo »
- **[LOGO / PICTO]** `/wp-content/uploads/2022/05/hpe-aruba-networking.png` — alt : « HPE aruba networking logo »
- **[LOGO / PICTO]** `/wp-content/uploads/2022/05/peer-insights-r-tm-rgb-for-white-bkgrnd.svg` — alt : « gartner peer insights logo »
- Reformulés (texte là, hors décompte) : [H4] « Autonomous, Secure Networks Powered by AIOps » · [H5] « Overall user rating:⭐⭐⭐⭐⭐—January 31, 2026 » · [H5] « Overall user rating: ⭐⭐⭐⭐—February 4, 2026 » · [H5] « Overall user rating: ⭐⭐⭐⭐—February 11, 2026 » · [H2] « Request Your HPE Networking Solutions »

### `/fr/services/approvisionnement-ti/hpe-networking/` — `src/content/services/fr/approvisionnement-ti/hpe-networking.json`

Source : <https://www.victrix.ca/expertise/approvisionnement-ti/hpe-networking/> (77 blocs, 6 images)

- **[LOGO / PICTO]** `/wp-content/uploads/2022/05/logo-victrix_blanc.png` — alt : « Logo victrix »
- **[LOGO / PICTO]** `/wp-content/uploads/2022/05/hpe_light_logo.png` — alt : « Logo HPE »
- **[LOGO / PICTO]** `/wp-content/uploads/2022/05/hpe-juniper.png` — alt : « HPE Juniper logo »
- **[LOGO / PICTO]** `/wp-content/uploads/2022/05/hpe-aruba-networking.png` — alt : « HPE aruba networking logo »
- **[LOGO / PICTO]** `/wp-content/uploads/2022/05/peer-insights-r-tm-rgb-for-white-bkgrnd.svg` — alt : « gartner peer insights logo »
- Reformulés (texte là, hors décompte) : [H5] « Note globale de l'utilisateur :⭐⭐⭐⭐⭐—31 janvier 2026 » · [H5] « Note globale de l'utilisateur : ⭐⭐⭐⭐—4 février 2026 » · [H5] « Note globale de l'utilisateur : ⭐⭐⭐⭐—11 février 2026 » · [H2] « Obtenir des solutions HPE Networking »

### `/en/services/cloud-services-provider/azure-migration/` — `src/content/services/en/services-infonuagiques/migration-vers-azure.json`

Source : <https://www.victrix.ca/en/expertise/cloud-services-provider/azure-migration/> (104 blocs, 5 images)

- **[P AMPUTÉ]** (22 mots ; mots absents : effectively, specific, terms)

  > When we talk about the benefits of Azure, flexibility and cost-effectiveness top the list. Azure effectively meets specific needs in terms of:

- **[P AMPUTÉ]** (31 mots ; mots absents : leaders, greatly, migrating)

  > Business leaders looking for end-to-end cloud-based solutions will benefit greatly from migrating to Microsoft Azure. This solution has been recognized worldwide for its effective response to a variety of technological needs.

- **[P AMPUTÉ]** (32 mots ; mots absents : meeting, demonstrated, capabilities, experience, expertise, delivering, proven, customers, using)

  > Victrix is recognized for meeting Microsoft's highest standards for cloud security and threat protection. We have demonstrated our technical capabilities, experience, and expertise in delivering proven results to customers using Microsoft solutions.

- **[P AMPUTÉ]** (10 mots ; mots absents : holds, status, following, areas)

  > Victrix holds Microsoft Solution Partner status in the following areas:

- **[IMAGE]** `/wp-content/uploads/2023/08/mirosoft_azure-138x300-2.png` — alt : « Migrate Your Organization to Microsoft Azure »
- **[LOGO / PICTO]** `/wp-content/uploads/2023/08/microsoftlogo.png` — alt : « Microsoft logo »
- Reformulés (texte là, hors décompte) : [H1] « Accelerate Your Migration to Microsoft Azure » · [H2] « Learn More About Microsoft Azure Cloud Services » · [LI] « Custom applicatoin development » · [H2] « Our Microsoft Azure Services » · [P] « Data migration solutions » · [H2] « Microsoft Solution Partner and Azure Managed Services » · [LI] « Modern Workplace Solutions Partner » · [LI] « Security Solutions Partner » · [H3] « Strategy — Planning — Deployment — Governance — Security » · [LI] « Accelerating the adoption of the cloud platform » · [LI] « Estimated costs per workload » · [LI] « Design of the cloud foundation » · [LI] « Prioritization of workloads to migrate » · [LI] « Alignment with business priorities » · [LI] « Planning for new roles required » · [LI] « Strengthening best practices (iterations) »

### `/en/services/cybersecurity/cybersecurity-healthcare/` — `src/content/services/en/cybersecurite/cybersecurite-sante.json`

Source : <https://www.victrix.ca/en/expertise/cybersecurity/cybersecurity-healthcare/> (33 blocs, 12 images)

- **[H3]** (5 mots, 50 % retrouvé)

  > Take Advantage of Personalized Support

- **[LOGO / PICTO]** `/wp-content/uploads/2023/11/certified_iso_eng.png` — alt : « ISO 27001:2022 certification banner »
- **[IMAGE]** `/wp-content/uploads/2023/11/service-now-logo.png` — alt : « ServiceNow »
- **[IMAGE]** `/wp-content/uploads/2024/07/1200px-proofpoint_r_logo.png` — alt : « Proofpoint »
- Reformulés (texte là, hors décompte) : [H2] « Cybersecurity Challenges in the Healthcare Sector » · [LI] « Being able to conduct a cyber risk self-assessment* » · [H2] « Victrix Provides First-Class Cybersecurity and Confidentiality for Hea… » · [P] « Cloud & Application Optimization »

### `/fr/services/intelligence-artificielle/accompagnement-ia/` — `src/content/services/fr/intelligence-artificielle/accompagnement-ia.json`

Source : <https://www.victrix.ca/expertise/intelligence-artificielle/accompagnement-ia/> (95 blocs, 4 images)

- **[P]** (5 mots — court, à vérifier)

  > CE QUE VOUS Y GAGNEZ

- **[LOGO / PICTO]** `/wp-content/uploads/2022/05/logo-victrix_blanc.png` — alt : « Logo victrix »
- **[IMAGE]** `/wp-content/uploads/2026/07/smiling-colleagues-sitting-on-steps-in-office-2026-03-25-03-17-09-utc-1-scaled.jpg` — alt : « Des bénéfices concrets pour chacun, de la direction aux TI et lignes d'affaires. »
- **[IMAGE]** `/wp-content/uploads/2026/07/happy-colleagues-at-modern-office-workplace-lookin-2026-01-09-09-28-57-utc-1-scaled.jpg` — alt : « Des consultants en intelligence artificielle chez Victrix, mobilisés chez un client. »
- Reformulés (texte là, hors décompte) : [P] « QUI ÊTES-VOUS ? » · [P] « Une approche structurée, responsable et pragmatique » · [P] « Un vrai partenaire proche de vos équipes » · [H2] « Planifiez une consultation IA »

### `/en/services/productivity-consulting/dynamics-365-field-service/` — `src/content/services/en/productivite/dynamics-365-field-service.json`

Source : <https://www.victrix.ca/en/expertise/productivity-consulting/dynamics-365-field-service/> (94 blocs, 6 images)

- **[P AMPUTÉ]** (25 mots ; mots absents : these, especially, acute)

  > These challenges are especially acute for organizations with heavy field operations, such as advanced manufacturing, energy, utilities, telecommunications, the public sector and municipalities, and healthcare.

- **[LI AMPUTÉ]** (18 mots ; mots absents : rather, switching, blindly)

  > A proven model and a transparent approach, where we build with you rather than switching on features blindly.

- **[IMAGE]** `/wp-content/uploads/2026/06/construction-workers-collaborate-on-project-at-bui-2026-03-16-22-44-53-utc-1-scaled.jpg` — alt : « Employés de construction qui rencontrent certains enjeux sur le terrain. »
- **[IMAGE]** `/wp-content/uploads/2024/11/plan-de-travailfzecscq5-100-scaled.jpg` — alt : « Plan de travail avec ServiceNow »
- **[IMAGE]** `/wp-content/uploads/2026/06/smiling-construction-worker-at-building-site-with-2026-03-17-01-20-41-utc-1-scaled.jpg` — alt : « Un travailleur de la construction soutenu sur le terrain avec Dynamics 365 Field Service. »
- Reformulés (texte là, hors décompte) : [H2] « Field Service Management Challenges for Canadian Organizations » · [H2] « Why Choose Victrix for Your Dynamics 365 Field Service Implementation » · [H2] « Dynamics 365 Field Service: Manage, Structure and Optimize Your Field … » · [H3] « Dynamics 365 Field Service Implementation: Before and After » · [H2] « An Enhanced Field Experience for Your Technicians on the Road » · [H3] « What's Included in Our Dynamics 365 Field Service Implementation Servi… »

### `/en/services/productivity-consulting/office-booking/` — `src/content/services/en/productivite/o-bureau.json`

Source : <https://www.victrix.ca/en/expertise/productivity-consulting/office-booking/> (33 blocs, 8 images)

- **[LI]** (7 mots — court, à vérifier)

  > Autonomous management and evolution of the solution

- **[IMAGE]** `/wp-content/uploads/2022/05/obureau-en.png` — alt : « office booking app visualization »
- **[IMAGE]** `/wp-content/uploads/2023/08/experience-gestionnaire-obureau.png` — alt : « interface expérience gestionnaire o'bureau »
- Reformulés (texte là, hors décompte) : [H3] « THE BENEFITS OF OUR OFFICE RESERVATION APPLICATION INCLUDE » · [LI] « Rapid deployment » · [LI] « Bilingual app, french/english »

### `/fr/services/cybersecurite/cybersecurite-sante/` — `src/content/services/fr/cybersecurite/cybersecurite-sante.json`

Source : <https://www.victrix.ca/expertise/cybersecurite/cybersecurite-sante/> (35 blocs, 12 images)

- **[P AMPUTÉ]** (21 mots ; mots absents : centre, integre, declinaison, regionaux)

  > Ministère de la santé et des services sociaux Québec CISSS (centre intégré de santé et de services sociaux) + déclinaison par régionaux

- **[P AMPUTÉ]** (14 mots ; mots absents : repondrons, questions, grand, plaisir)

  > Contactez notre équipe d’experts et nous répondrons à toutes vos questions avec grand plaisir.

- **[LOGO / PICTO]** `/wp-content/uploads/2023/11/victrix_certifie_iso.png` — alt : « Victrix est certifié ISO 27001 »
- **[IMAGE]** `/wp-content/uploads/2023/11/service-now-logo.png` — alt : « ServiceNow »
- **[IMAGE]** `/wp-content/uploads/2024/07/1200px-proofpoint_r_logo.png` — alt : « Proofpoint »
- Reformulés (texte là, hors décompte) : [H1] « Cybersécurité dans le secteur de la santé » · [P] « Élevez votre cybersécurité » · [H2] « Les enjeux de cybersécurité dans le secteur de la santé » · [P] « + Centres intégrés universitaire » · [H3] « Bénéficiez d’un accompagnement personnalisé » · [H2] « Victrix assure une cybersécurité et confidentialité de premier ordre p… » · [P] « Infonuagique & optimisation des applications »

### `/fr/services/productivite/dynamics-365-field-service/` — `src/content/services/fr/productivite/dynamics-365-field-service.json`

Source : <https://www.victrix.ca/expertise/productivite/dynamics-365-field-service/> (94 blocs, 6 images)

- **[P AMPUTÉ]** (31 mots ; mots absents : touchent, particulierement, telles)

  > Ces enjeux touchent particulièrement les organisations à fortes opérations terrain telles que le secteur manufacturier avancé, l’énergie, les services publics, les télécommunications, le secteur public et les municipalités, et la santé.

- **[LI AMPUTÉ]** (19 mots ; mots absents : approche, transparente, plutot, aveugle)

  > Un modèle éprouvé et une approche transparente, où l'on bâtit avec vous plutôt que d'activer des fonctionnalités à l'aveugle.

- **[IMAGE]** `/wp-content/uploads/2026/06/construction-workers-collaborate-on-project-at-bui-2026-03-16-22-44-53-utc-1-scaled.jpg` — alt : « Employés de construction qui rencontrent certains enjeux sur le terrain. »
- **[IMAGE]** `/wp-content/uploads/2024/11/plan-de-travailfzecscq5-100-scaled.jpg` — alt : « Plan de travail avec ServiceNow »
- **[IMAGE]** `/wp-content/uploads/2026/06/smiling-construction-worker-at-building-site-with-2026-03-17-01-20-41-utc-1-scaled.jpg` — alt : « Un travailleur de la construction soutenu sur le terrain avec Dynamics 365 Field Service. »
- Reformulés (texte là, hors décompte) : [H2] « Les enjeux de gestion des opérations terrain pour les organisations qu… » · [H2] « Pourquoi choisir Victrix pour votre implémentation Dynamics 365 Field … » · [LI] « Une livraison en français ou bilingue, par une équipe d'ici. » · [H2] « Dynamics 365 Field Service: encadrer, structurer et optimiser vos inte… » · [H3] « Avant et après l'implémentation Dynamics 365 Field Service » · [H2] « Une expérience terrain rehaussée pour vos techniciens sur la route » · [P] « de productivité des techniciens une fois implémenté » · [H3] « Ce qui est inclus dans notre offre d'implémentation Dynamics 365 Field… »

### `/fr/services/approvisionnement-ti/` — `src/content/services/fr/approvisionnement-ti.json`

Source : <https://www.victrix.ca/expertise/approvisionnement-ti/> (123 blocs, 1 images)

- **[P]** (4 mots — court, à vérifier)

  > Échangez avec un expert

- **[P AMPUTÉ]** (17 mots ; mots absents : choisissez, consultez, specialiste)

  > Avec Victrix, vous choisissez un partenaire capable de conjuguer expertise technique, sécurité et gouvernance. Consultez un spécialiste

- **[P AMPUTÉ]** (14 mots ; mots absents : approche, assure, reste)

  > Notre approche assure que votre environnement TI reste cohérent, conforme et facile à gérer.

- **[P AMPUTÉ]** (20 mots ; mots absents : approche, assure, respect)

  > Notre approche assure la continuité de vos opérations, le respect de la conformité et la prévisibilité de vos dépenses TI.

- **[P AMPUTÉ]** (33 mots ; mots absents : prenons, charge, maintenir)

  > Après la mise en service, nous prenons en charge le support, la gestion des garanties, les mises à niveau et le suivi technique pour maintenir la performance et la conformité de vos systèmes.

- Reformulés (texte là, hors décompte) : [H3] « Un approvisionnement TI stratégique, sécurisé et géré avec Victrix » · [H2] « Solutions technologiques et partenariats pour une infrastructure perfo… » · [P] « Explorez les solutions Check Point » · [P] « Explorez les solutions CrowdStrike » · [P] « Explorez les solutions Palo Alto Networks » · [P] « Explorez les solutions Zscaler » · [P] « Explorez les solutions Microsoft » · [P] « Explorez les solutions Cisco » · [P] « Explorez les solutions HPE Networking » · [P] « Explorez les solutions Microsoft » · [P] « Explorez les solutions ServiceNow » · [P] « Explorez les solutions Dell Technologies » · [H2] « Vous avez besoin d'aide pour la sélection et l'achat de votre matériel… » · [H2] « Services d'approvisionnement TI et de gestion pour vos licences et équ… » · [H2] « Victrix : votre partenaire de confiance pour l'acquisition et la gesti… » · [H2] « Vous êtes prêts à acheter le matériel et les licences TI adaptés à vos… »

### `/fr/services/conseil-strategique/conformite-loi-25/` — `src/content/services/fr/conseil-strategique/conformite-loi-25.json`

Source : <https://www.victrix.ca/expertise/conseil-strategique/conformite-loi-25/> (8 blocs, 1 images)

- **[H2]** (12 mots, 43 % retrouvé)

  > Évaluez la conformité de votre organisation en répondant à ces questions clés :

- Reformulés (texte là, hors décompte) : [H1] « Loi 25 : Votre entreprise est-elle conforme? » · [P] « Assurez votre conformité » · [H2] « Contactez-nous pour une évaluation personnalisée ! »

### `/en/services/artificial-intelligence/consulting/` — `src/content/services/en/intelligence-artificielle/accompagnement.json`

Source : <https://www.victrix.ca/en/expertise/artificial-intelligence/consulting/> (121 blocs, 4 images)

- **[P AMPUTÉ]** (24 mots ; mots absents : governing, protecting, keeping)

  > • Cybersecurity and infrastructure in our DNA: a real edge for governing how you use AI, protecting your data, and keeping it all under control.

- **[IMAGE]** `/wp-content/uploads/2025/10/freepik__adjust__18305-1.png` — alt : « Concept de l'IA »
- **[IMAGE]** `/wp-content/uploads/2026/07/smiling-colleagues-sitting-on-steps-in-office-2026-03-25-03-17-09-utc-1-scaled.jpg` — alt : « Des bénéfices concrets pour chacun, de la direction aux TI et lignes d'affaires. »
- **[LIEN]** `/en/services/productivity-consulting/` — porté par « • Business lines: renewed ownership of business processes, real productivity gains, sharpe… »
- Reformulés (texte là, hors décompte) : [P] « Schedule an AI consultation » · [H2] « Examples of Initiatives From Our Strategic, Applied AI Consulting » · [H3] « Artificial Intelligence Consulting That Delivers Real Gains for Everyo… »

### `/en/services/productivity-consulting/copilot-for-microsoft-365/` — `src/content/services/en/productivite/copilot-microsoft-365.json`

Source : <https://www.victrix.ca/en/expertise/productivity-consulting/copilot-for-microsoft-365/> (28 blocs, 1 images)

- **[H2]** (7 mots, 50 % retrouvé)

  > Challenges in Adopting Copilot for Microsoft 365

- **[P]** (3 mots — court, à vérifier)

  > Justifying the Investment

- Reformulés (texte là, hors décompte) : [H1] « Implementation & Adoption of Copilot for Microsoft 365 » · [H2] « Our Structured Adoption Strategy to Ensure Your Success with Copilot f… » · [P] « Define Scenarios & Deploy » · [P] « • Continuity plan • Customization opportunities » · [H2] « Develop Tailored Copilots to Maximize Efficiency »

### `/en/services/it-procurement/check-point/` — `src/content/services/en/approvisionnement-ti/check-point.json`

Source : <https://www.victrix.ca/en/expertise/it-procurement/check-point/> (69 blocs, 4 images)

- **[LOGO / PICTO]** `/wp-content/uploads/2022/05/logo-victrix-english_white.png` — alt : « Logo victrix »
- **[LOGO / PICTO]** `/wp-content/uploads/2022/05/check-point-2024-logo-reversed.png` — alt : « Check Point logo »
- **[LOGO / PICTO]** `/wp-content/uploads/2022/05/peer-insights-r-tm-rgb-for-white-bkgrnd.svg` — alt : « gartner peer insights logo »
- Reformulés (texte là, hors décompte) : [H4] « Take Control of Your Organization's Security » · [H5] « Overall user rating: ⭐⭐⭐⭐⭐ » · [H5] « Overall user rating: ⭐⭐⭐⭐ » · [H5] « Overall user rating: ⭐⭐⭐⭐ » · [H2] « Request Your Check Point Cybersecurity Solutions »

### `/en/services/it-procurement/cisco/` — `src/content/services/en/approvisionnement-ti/cisco.json`

Source : <https://www.victrix.ca/en/expertise/it-procurement/cisco/> (55 blocs, 4 images)

- **[LOGO / PICTO]** `/wp-content/uploads/2022/05/logo-victrix-english_white.png` — alt : « Logo victrix »
- **[LOGO / PICTO]** `/wp-content/uploads/2022/05/id8yezkxqd_1768236541241.svg` — alt : « cisco logo »
- **[LOGO / PICTO]** `/wp-content/uploads/2022/05/peer-insights-r-tm-rgb-for-white-bkgrnd.svg` — alt : « gartner peer insights logo »
- Reformulés (texte là, hors décompte) : [H4] « A Reliable and Secure Infrastructure to Support Your Evolution » · [H5] « Overall user rating:⭐⭐⭐⭐⭐—December 19, 2025 » · [H5] « Overall user rating:⭐⭐⭐⭐⭐—December 17, 2025 » · [H5] « Overall user rating:⭐⭐⭐⭐— August 18, 2025 » · [H2] « Request Your Cisco Solutions »

### `/en/services/it-procurement/crowdstrike-falcon/` — `src/content/services/en/approvisionnement-ti/crowdstrike-falcon.json`

Source : <https://www.victrix.ca/en/expertise/it-procurement/crowdstrike-falcon/> (61 blocs, 4 images)

- **[LOGO / PICTO]** `/wp-content/uploads/2022/05/logo-victrix-english_white.png` — alt : « Logo victrix »
- **[LOGO / PICTO]** `/wp-content/uploads/2022/05/crowdstrike_logo_2023_primary_white.png` — alt : « CrowdStrike logo »
- **[LOGO / PICTO]** `/wp-content/uploads/2022/05/peer-insights-r-tm-rgb-for-white-bkgrnd.svg` — alt : « gartner peer insights logo »
- Reformulés (texte là, hors décompte) : [H4] « An AI-Enhanced Cybersecurity Platform Powered by World-Class Threat In… » · [H5] « Overall user rating:⭐⭐⭐⭐—November 25, 2025 » · [H5] « Overall user rating:⭐⭐⭐⭐⭐ » · [H5] « Overall user rating:⭐⭐⭐⭐⭐ » · [H2] « Request Your CrowdStrike Falcon Solution »

### `/en/services/it-procurement/servicenow/` — `src/content/services/en/approvisionnement-ti/servicenow.json`

Source : <https://www.victrix.ca/en/expertise/it-procurement/servicenow/> (83 blocs, 4 images)

- **[LOGO / PICTO]** `/wp-content/uploads/2022/05/logo-victrix-english_white.png` — alt : « Logo victrix »
- **[LOGO / PICTO]** `/wp-content/uploads/2022/05/sn-logo-white-scaled.webp` — alt : « Logo servicenow »
- **[LOGO / PICTO]** `/wp-content/uploads/2022/05/peer-insights-r-tm-rgb-for-white-bkgrnd.svg` — alt : « gartner peer insights logo »
- Reformulés (texte là, hors décompte) : [H4] « All Your Business Processes on a Single Services Platform » · [H5] « Overall user rating: ⭐⭐⭐⭐⭐—November 18, 2025 » · [H5] « Overall user rating: ⭐⭐⭐⭐⭐ » · [H5] « Overall user rating: ⭐⭐⭐⭐⭐ —September 16, 2025 » · [H2] « Request Your ServiceNow Solutions »

### `/en/services/it-procurement/zscaler/` — `src/content/services/en/approvisionnement-ti/zscaler.json`

Source : <https://www.victrix.ca/en/expertise/it-procurement/zscaler/> (65 blocs, 4 images)

- **[LOGO / PICTO]** `/wp-content/uploads/2022/05/logo-victrix-english_white.png` — alt : « Logo victrix »
- **[LOGO / PICTO]** `/wp-content/uploads/2022/05/7_zscaler_logo.png` — alt : « zscaler logo »
- **[LOGO / PICTO]** `/wp-content/uploads/2022/05/peer-insights-r-tm-rgb-for-white-bkgrnd.svg` — alt : « gartner peer insights logo »
- Reformulés (texte là, hors décompte) : [H4] « Activate AI-Enhanced Zero Trust Security » · [H5] « Overall user rating: ⭐⭐⭐⭐⭐—October 31, 2025 » · [H5] « Overall user rating: ⭐⭐⭐⭐—June 22, 2025 » · [H5] « Overall user rating: ⭐⭐⭐⭐⭐ » · [H2] « Request Your Zscaler Zero Trust Solutions »

### `/en/services/productivity-consulting/office-booking/landing-demo-obureau/` — `src/content/services/en/productivite/o-bureau/demo-o-bureau.json`

Source : <https://www.victrix.ca/en/expertise/productivity-consulting/office-booking/landing-demo-obureau/> (10 blocs, 3 images)

- **[LOGO / PICTO]** `/wp-content/uploads/2022/05/logo-victrix-english_white.png` — alt : « Logo victrix »
- **[IMAGE DE HÉROS]** `/wp-content/uploads/2023/08/obureau-mobile-1.png` — alt : « mobile user interface for o'bureau »
- **[IMAGE]** `/wp-content/uploads/2022/05/obureau-en.png` — alt : « office booking app visualization »
- Reformulés (texte là, hors décompte) : [LI] « Client: Muliti-Sector »

### `/en/services/strategic-advice/law-25-compliance/` — `src/content/services/en/conseil-strategique/conformite-loi-25.json`

Source : <https://www.victrix.ca/en/expertise/strategic-advice/law-25-compliance/> (7 blocs, 1 images)

- **[H2]** (9 mots, 43 % retrouvé)

  > Assess your organization's compliance by answering these key questions:

- Reformulés (texte là, hors décompte) : [H1] « Law 25: Is Your Organization Compliant? » · [P] « Ensure Law 25 compliance with Victrix » · [H2] « Contact us for a personalized assessment! »

### `/fr/services/approvisionnement-ti/check-point/` — `src/content/services/fr/approvisionnement-ti/check-point.json`

Source : <https://www.victrix.ca/expertise/approvisionnement-ti/check-point/> (65 blocs, 4 images)

- **[LOGO / PICTO]** `/wp-content/uploads/2022/05/logo-victrix_blanc.png` — alt : « Logo victrix »
- **[LOGO / PICTO]** `/wp-content/uploads/2022/05/check-point-2024-logo-reversed.png` — alt : « Check Point logo »
- **[LOGO / PICTO]** `/wp-content/uploads/2022/05/peer-insights-r-tm-rgb-for-white-bkgrnd.svg` — alt : « gartner peer insights logo »
- Reformulés (texte là, hors décompte) : [H4] « Prenez le contrôle de la sécurité de votre organisation » · [LI] « le réseau » · [LI] « le nuage » · [LI] « la gestion de l'exposition » · [LI] « les opérations de sécurité » · [H5] « Note globale de l'utilisateur : ⭐⭐⭐⭐⭐— 5 mai 2026 » · [H5] « Note globale de l'utilisateur : ⭐⭐⭐⭐—20 février 2026 » · [H5] « Note globale de l'utilisateur : ⭐⭐⭐⭐— 17 février 2026 » · [H2] « Obtenir des solutions Check Point »

### `/fr/services/approvisionnement-ti/cisco/` — `src/content/services/fr/approvisionnement-ti/cisco.json`

Source : <https://www.victrix.ca/expertise/approvisionnement-ti/cisco/> (55 blocs, 4 images)

- **[LOGO / PICTO]** `/wp-content/uploads/2022/05/logo-victrix_blanc.png` — alt : « Logo victrix »
- **[LOGO / PICTO]** `/wp-content/uploads/2022/05/id8yezkxqd_1768236541241.svg` — alt : « cisco logo »
- **[LOGO / PICTO]** `/wp-content/uploads/2022/05/peer-insights-r-tm-rgb-for-white-bkgrnd.svg` — alt : « gartner peer insights logo »
- Reformulés (texte là, hors décompte) : [H4] « Une infrastructure fiable et sécurisée pour accompagner votre évolutio… » · [H5] « Note globale de l'utilisateur :⭐⭐⭐⭐⭐—19 décembre 2025 » · [H5] « Note globale de l'utilisateur :⭐⭐⭐⭐⭐—17 décembre 2025 » · [H5] « Note globale de l'utilisateur :⭐⭐⭐⭐—18 août 2025 » · [H2] « Obtenir des solutions Cisco »

### `/fr/services/approvisionnement-ti/crowdstrike-falcon/` — `src/content/services/fr/approvisionnement-ti/crowdstrike-falcon.json`

Source : <https://www.victrix.ca/expertise/approvisionnement-ti/crowdstrike-falcon/> (59 blocs, 4 images)

- **[LOGO / PICTO]** `/wp-content/uploads/2022/05/logo-victrix_blanc.png` — alt : « Logo victrix »
- **[LOGO / PICTO]** `/wp-content/uploads/2022/05/crowdstrike_logo_2023_primary_white.png` — alt : « CrowdStrike logo »
- **[LOGO / PICTO]** `/wp-content/uploads/2022/05/peer-insights-r-tm-rgb-for-white-bkgrnd.svg` — alt : « gartner peer insights logo »
- Reformulés (texte là, hors décompte) : [H4] « Une plateforme de cybersécurité renforcée par l'IA et une intelligence… » · [H5] « Note globale de l'utilisateur :⭐⭐⭐⭐—25 novembre 2025 » · [H5] « Note globale de l'utilisateur :⭐⭐⭐⭐⭐—22 novembre 2025 » · [H5] « Note globale de l'utilisateur :⭐⭐⭐⭐⭐—13 novembre 2025 » · [H2] « Obtenir des solutions CrowdStrike Falcon »

### `/fr/services/approvisionnement-ti/servicenow/` — `src/content/services/fr/approvisionnement-ti/servicenow.json`

Source : <https://www.victrix.ca/expertise/approvisionnement-ti/servicenow/> (83 blocs, 4 images)

- **[LOGO / PICTO]** `/wp-content/uploads/2022/05/logo-victrix_blanc.png` — alt : « Logo victrix »
- **[LOGO / PICTO]** `/wp-content/uploads/2022/05/sn-logo-white-scaled.webp` — alt : « Logo servicenow »
- **[LOGO / PICTO]** `/wp-content/uploads/2022/05/peer-insights-r-tm-rgb-for-white-bkgrnd.svg` — alt : « gartner peer insights logo »
- Reformulés (texte là, hors décompte) : [H4] « Tous vos processus d'entreprise sur une seule plateforme de services » · [H5] « Note globale de l'utilisateur : ⭐⭐⭐⭐⭐—18 novembre 2025 » · [H5] « Note globale de l'utilisateur : ⭐⭐⭐⭐⭐—12 juin 2024 » · [H5] « Note globale de l'utilisateur : ⭐⭐⭐⭐⭐—16 septembre 2025 » · [H2] « Obtenir des solutions ServiceNow »

### `/fr/services/approvisionnement-ti/zscaler/` — `src/content/services/fr/approvisionnement-ti/zscaler.json`

Source : <https://www.victrix.ca/expertise/approvisionnement-ti/zscaler/> (64 blocs, 4 images)

- **[LOGO / PICTO]** `/wp-content/uploads/2022/05/logo-victrix_blanc.png` — alt : « Logo victrix »
- **[LOGO / PICTO]** `/wp-content/uploads/2022/05/7_zscaler_logo.png` — alt : « zscaler logo »
- **[LOGO / PICTO]** `/wp-content/uploads/2022/05/peer-insights-r-tm-rgb-for-white-bkgrnd.svg` — alt : « gartner peer insights logo »
- Reformulés (texte là, hors décompte) : [H4] « Activez la sécurité zéro confiance renforcée par l’IA » · [H5] « Note globale de l'utilisateur : ⭐⭐⭐⭐⭐—31 octobre 2025 » · [H5] « Note globale de l'utilisateur : ⭐⭐⭐⭐—22 juin 2025 » · [H5] « Note globale de l'utilisateur : ⭐⭐⭐⭐⭐—21 juin 2025 » · [H2] « Obtenir des solutions Zscaler »

### `/fr/services/productivite/o-bureau/` — `src/content/services/fr/productivite/o-bureau.json`

Source : <https://www.victrix.ca/expertise/productivite/o-bureau/> (33 blocs, 8 images)

- **[P]** (3 mots — court, à vérifier)

  > Demandez une démonstration

- **[IMAGE]** `/wp-content/uploads/2022/05/obureau.png` — alt : « interface utilisateur obureau »
- **[IMAGE]** `/wp-content/uploads/2023/08/experience-gestionnaire-obureau.png` — alt : « interface expérience gestionnaire o'bureau »
- Reformulés (texte là, hors décompte) : [H1] « O bureau, notre application de réservation de bureau » · [H3] « LES AVANTAGES DE NOTRE APPLICATION DE RÉSERVATION DE BUREAU » · [LI] « Autonomie de pilotage et d’évolution de la solution » · [LI] « Application bilingue français/anglais »

### `/en/services/cybersecurity/` — `src/content/services/en/cybersecurite.json`

Source : <https://www.victrix.ca/en/expertise/cybersecurity/> (53 blocs, 26 images)

- **[P AMPUTÉ]** (28 mots ; mots absents : deliver, spans, aspects)

  > At Victrix, cybersecurity is a strategic capability embedded in every project we deliver. Our expertise spans all core aspects of cybersecurity — asset protection, risk management, and regulatory compliance.

- **[IMAGE]** `/wp-content/uploads/2023/11/service-now-logo.png` — alt : « ServiceNow »
- **[IMAGE]** `/wp-content/uploads/2024/07/1200px-proofpoint_r_logo.png` — alt : « Proofpoint »
- Reformulés (texte là, hors décompte) : [H1] « Cybersecurity Services That Strengthen Your Business » · [H2] « Sector-Specific Expertise for Your Cybersecurity Services » · [H3] « Looking for Cybersecurity Services Tailored to the Healthcare Sector? » · [P] « Complete List of Our Cybersecurity Offerings for Organizations »

### `/fr/services/cybersecurite/` — `src/content/services/fr/cybersecurite.json`

Source : <https://www.victrix.ca/expertise/cybersecurite/> (51 blocs, 26 images)

- **[P AMPUTÉ]** (33 mots ; mots absents : couvre, ensemble, aspects)

  > Chez Victrix, la cybersécurité est un atout stratégique intégré dans tous nos projets. Notre expertise couvre l’ensemble des aspects de la cybersécurité — sécurisation des actifs, gestion des risques et mise en conformité réglementaire.

- **[IMAGE]** `/wp-content/uploads/2023/11/service-now-logo.png` — alt : « ServiceNow »
- **[IMAGE]** `/wp-content/uploads/2024/07/1200px-proofpoint_r_logo.png` — alt : « Proofpoint »
- Reformulés (texte là, hors décompte) : [H1] « Un service de cybersécurité au service de vos affaires » · [P] « Renforcez votre cybersécurité » · [P] « Parmi nos offres de cybersécurité, retrouvez : » · [LI] « Les tests d’intrusion (Pentest) » · [LI] « L’audit GRC (gestion du risque et de la conformité) » · [LI] « Le développement de plan de continuité et de relève (PCA/PRA) » · [LI] « La mise en place du modèle Zero Trust » · [LI] « La gestion des identités et accès avec le modèle SASE »
- Widgets de l’ancien thème non repris (hors décompte) : « Parlons de vos projets »

### `/fr/services/intelligence-artificielle/accompagnement/` — `src/content/services/fr/intelligence-artificielle/accompagnement.json`

Source : <https://www.victrix.ca/expertise/intelligence-artificielle/accompagnement/> (121 blocs, 4 images)

- **[IMAGE]** `/wp-content/uploads/2025/10/freepik__adjust__18305-1.png` — alt : « Concept de l'IA »
- **[IMAGE]** `/wp-content/uploads/2026/07/smiling-colleagues-sitting-on-steps-in-office-2026-03-25-03-17-09-utc-1-scaled.jpg` — alt : « Des bénéfices concrets pour chacun, de la direction aux TI et lignes d'affaires. »
- **[LIEN]** `/fr/services/productivite/` — porté par « • Pour les lignes d'affaires : une réappropriation des processus d'entreprise, des gains d… »
- Reformulés (texte là, hors décompte) : [P] « Planifiez une consultation IA » · [LI] « un manque de visibilité sur ce que vos équipes font déjà avec l’IA. » · [H2] « Exemples d'initiatives découlant de notre accompagnement stratégique e… » · [H2] « Notre démarche d'accompagnement en intelligence artificielle : de la v… » · [H3] « Un accompagnement en IA où chacun bénéficie de gains concrets » · [P] « • respect des droits et liberté »

### `/fr/services/productivite/o-bureau/demo-o-bureau/` — `src/content/services/fr/productivite/o-bureau/demo-o-bureau.json`

Source : <https://www.victrix.ca/expertise/productivite/o-bureau/demo-o-bureau/> (10 blocs, 3 images)

- **[LI]** (2 mots — court, à vérifier)

  > Client : Muliti-Secteur

- **[LOGO / PICTO]** `/wp-content/uploads/2022/05/logo-victrix_blanc.png` — alt : « Logo victrix »
- **[IMAGE]** `/wp-content/uploads/2022/05/obureau.png` — alt : « interface utilisateur obureau »
- Reformulés (texte là, hors décompte) : [LI] « Délais de personnalisation : 1 mois »

### `/fr/services/services-infonuagiques/services-aws/` — `src/content/services/fr/services-infonuagiques/services-aws.json`

Source : <https://www.victrix.ca/expertise/services-infonuagiques/services-aws/> (82 blocs, 4 images)

- **[P AMPUTÉ]** (30 mots ; mots absents : specifiquement, repondre, entreprises, matiere)

  > Amazon Web Services (AWS) est une plateforme infonuagique populaire auprès d’organisations de toutes tailles. Elle offre des services et solutions conçus spécifiquement pour répondre aux besoins des entreprises en matière:

- **[IMAGE DE HÉROS]** `/wp-content/uploads/2023/10/priscilla-du-preez-nnmba7y1ymk-unsplash-1-scaled-e1699542797747.jpg` — alt : « Experts infonuagique travaillant sur les solutions aws  »
- **[IMAGE]** `/wp-content/uploads/2023/10/public-sector1-150x150.png` — alt : « partenariat secteur public AWS »
- Reformulés (texte là, hors décompte) : [H2] « En savoir plus sur la solution infonuagique AWS » · [LI] « D'infrastructure infonuagique » · [LI] « D’analyse de données » · [LI] « De développement d’applications sur mesure » · [P] « Sécurisation des appareils, terminaux et des applications » · [H2] « Assurez une migration fluide, sécuritaire et efficace avec Victrix, vo… » · [H3] « Analyse complète — Recommandations basée sur notre expertise AWS — Acc… » · [P] « Fiabilisation des charges de travail et applications » · [P] « Fournir une vue globale sur l’état de la migration » · [P] « Contactez un expert AWS pour en discuter! »

### `/en/contact/` — `(gabarit de page)`

Source : <https://www.victrix.ca/en/contact/> (18 blocs, 0 images)

- **[H2]** (3 mots, 50 % retrouvé)

  > Formulaire de contact

- **[P]** (2 mots — court, à vérifier)

  > +1 418-780-8181

- **[P]** (2 mots — court, à vérifier)

  > +1 514-879-1919

- Reformulés (texte là, hors décompte) : [H2] « You have a question or a project? Do not hesitate to contact us! » · [P] « Québec 1/3 » · [P] « Montréal 2/3 » · [P] « Paris 3/3 »

### `/en/services/cloud-services-provider/aws-services/` — `src/content/services/en/services-infonuagiques/services-aws.json`

Source : <https://www.victrix.ca/en/expertise/cloud-services-provider/aws-services/> (82 blocs, 4 images)

- **[IMAGE]** `/wp-content/uploads/2023/10/priscilla-du-preez-nnmba7y1ymk-unsplash-1-scaled-e1699542797747.jpg` — alt : « Experts infonuagique travaillant sur les solutions aws  »
- **[LOGO / PICTO]** `/wp-content/uploads/2023/10/public-sector1-150x150.png` — alt : « aws partner public sector logo »
- Reformulés (texte là, hors décompte) : [H2] « Learn More About the AWS Cloud Solution » · [H2] « Ensure Smooth, Secure and Efficient Migration with Victrix, Your AWS S… » · [P] « Analysis & Assessment of the Technological Situation »

### `/en/services/it-procurement/dell-technologies/` — `src/content/services/en/approvisionnement-ti/dell-technologies.json`

Source : <https://www.victrix.ca/en/expertise/it-procurement/dell-technologies/> (62 blocs, 3 images)

- **[LOGO / PICTO]** `/wp-content/uploads/2022/05/logo-victrix-english_white.png` — alt : « Logo victrix »
- **[LOGO / PICTO]** `/wp-content/uploads/2022/05/peer-insights-r-tm-rgb-for-white-bkgrnd.svg` — alt : « gartner peer insights logo »
- Reformulés (texte là, hors décompte) : [H4] « A Coherent Approach to Your Infrastructure and Workstations » · [H5] « Overall user rating:⭐⭐⭐⭐—December 2, 2025 » · [H5] « Overall user rating:⭐⭐⭐⭐—January 29, 2026 » · [H5] « Overall user rating:⭐⭐⭐⭐⭐ » · [H2] « Request Your Dell Technologies Solutions »

### `/fr/services/approvisionnement-ti/dell-technologies/` — `src/content/services/fr/approvisionnement-ti/dell-technologies.json`

Source : <https://www.victrix.ca/expertise/approvisionnement-ti/dell-technologies/> (61 blocs, 3 images)

- **[LOGO / PICTO]** `/wp-content/uploads/2022/05/logo-victrix_blanc.png` — alt : « Logo victrix »
- **[LOGO / PICTO]** `/wp-content/uploads/2022/05/peer-insights-r-tm-rgb-for-white-bkgrnd.svg` — alt : « gartner peer insights logo »
- Reformulés (texte là, hors décompte) : [H4] « Une approche cohérente pour vos infrastructures et postes de travail » · [H5] « Note globale de l'utilisateur :⭐⭐⭐⭐—2 décembre 2025 » · [H5] « Note globale de l'utilisateur :⭐⭐⭐⭐—29 janvier 2026 » · [H5] « Note globale de l'utilisateur :⭐⭐⭐⭐⭐—11 février 2026 » · [H2] « Obtenir des solutions Dell Technologies »

### `/fr/services/intelligence-artificielle/analyse-opportunites-ia/` — `src/content/services/fr/intelligence-artificielle/analyse-opportunites-ia.json`

Source : <https://www.victrix.ca/expertise/intelligence-artificielle/analyse-opportunites-ia/> (29 blocs, 1 images)

- **[P]** (6 mots — court, à vérifier)

  > Échangez avec un expert en IA

- Reformulés (texte là, hors décompte) : [H2] « Pourquoi explorer vos opportunité en IA ? » · [H3] « Identifier les utilisations de l'IA en entreprise pour accélérer vos p… » · [H2] « Vous vous demandez comment commencer à utiliser l’IA au sein de votre … » · [P] « Réduction des risques et adoption de l'IA facilitée »
- Widgets de l’ancien thème non repris (hors décompte) : « Rencontrez nos experts »

### `/fr/services/services-ti-geres/maximisez-lutilisation-de-votre-ecosysteme-m365/` — `src/content/services/fr/services-ti-geres/maximisez-lutilisation-de-votre-ecosysteme-m365.json`

Source : <https://www.victrix.ca/expertise/services-ti-geres/maximisez-lutilisation-de-votre-ecosysteme-m365/> (32 blocs, 2 images)

- **[LI]** (3 mots — court, à vérifier)

  > Réduire vos coûts

- **[IMAGE]** `/wp-content/uploads/2022/05/istock-1356386941.jpg` — alt : « Maximisez l'utilisation de Microsoft 365 »
- Reformulés (texte là, hors décompte) : [LI] « Accéder à des compétences qui ne sont pas disponibles » · [LI] « Améliorer votre sécurité » · [LI] « Augmenter votre capacité d’innovation »

### `/en/services/artificial-intelligence/ai-opportunity-analysis/` — `src/content/services/en/intelligence-artificielle/analyse-opportunites-ia.json`

Source : <https://www.victrix.ca/en/expertise/artificial-intelligence/ai-opportunity-analysis/> (29 blocs, 1 images)

- **[P]** (5 mots — court, à vérifier)

  > Talk to an AI expert

- Reformulés (texte là, hors décompte) : [H2] « Not sure how to start integrating AI into your business? » · [P] « Reduced risks and easier adoption of AI » · [H3] « Let's Meet »

### `/en/services/managed-it-services/` — `src/content/services/en/services-ti-geres.json`

Source : <https://www.victrix.ca/en/expertise/managed-it-services/> (101 blocs, 1 images)

- **[LI]** (3 mots — court, à vérifier)

  > RIGID WITH DELAY

- **[P AMPUTÉ]** (24 mots ; mots absents : drive, innovation, company, growth)

  > We help you reduce risks, enhance the reliability of your systems, and free up resources to drive innovation and support your company's long-term growth.

- Reformulés (texte là, hors décompte) : [H3] « Discover How Our Managed IT Services Empower Your Teams to Focus on Co… » · [H3] « Compare Victrix Managed Services vs. In-House IT Management » · [P] « VICTRIX MANAGED SERVICES » · [LI] « CONTINUOUS COMPLIANCE AND VIGILANCE » · [LI] « INCREASE RISK WITHOUT EXPERTISE »

### `/fr/services/cybersecurite/test-intrusion-pentest/` — `src/content/services/fr/cybersecurite/test-intrusion-pentest.json`

Source : <https://www.victrix.ca/expertise/cybersecurite/test-intrusion-pentest/> (42 blocs, 2 images)

- **[P AMPUTÉ]** (23 mots ; mots absents : maitrisent, mesure, faire, guider, correctifs)

  > Nos équipes maitrisent les meilleures pratiques de test d'intrusion et sont en mesure de vous faire des recommandations priorisées pour guider vos correctifs.

- **[LOGO / PICTO]** `/wp-content/uploads/2024/05/certification-test-pentest-300x26.png` — alt : « Certification réalisation de tests d'intrusion »
- Reformulés (texte là, hors décompte) : [H1] « Services de test d’intrusion pour organisations » · [H2] « Pourquoi utiliser un service de test d'intrusion? » · [P] « Effectuer des tests d’intrusion est essentiel pour: » · [H2] « Demandez votre campagne de tests d'intrusion »

### `/fr/contact/` — `(gabarit de page)`

Source : <https://www.victrix.ca/contact/> (18 blocs, 0 images)

- **[P]** (2 mots — court, à vérifier)

  > +1 418-780-8181

- **[P]** (2 mots — court, à vérifier)

  > +1 514-879-1919

- Reformulés (texte là, hors décompte) : [H2] « Formulaire de contact » · [P] « Québec 1/3 » · [P] « Montréal 2/3 » · [P] « Paris 3/3 »

### `/fr/services/cybersecurite/zero-trust/` — `src/content/services/fr/cybersecurite/zero-trust.json`

Source : <https://www.victrix.ca/expertise/cybersecurite/zero-trust/> (30 blocs, 2 images)

- **[P AMPUTÉ]** (40 mots ; mots absents : veillant, soient, ainsi)

  > Le modèle Zero Trust adopte une approche « ne jamais faire confiance, toujours vérifier », en veillant à ce que chaque utilisateur et chaque appareil soient vérifiés et autorisés en continu, minimisant ainsi les risques de sécurité et les possibilités d’attaques réussies.

- **[P AMPUTÉ]** (20 mots ; mots absents : cyber, disponibles, guider, statistique)

  > Nos experts cyber sont disponibles pour répondre à vos questions et vous guider vers la meilleure solution. *Statistique de Gartner

- Reformulés (texte là, hors décompte) : [H3] « En 2025, 60 % des entreprises utiliseront des solutions « Zero Trust »… » · [H2] « Victrix: Sécurisez vos données avec le modèle Zero Trust » · [H3] « Découvrez Harmony Connect, la solution SASE de Check Point » · [H2] « Victrix, votre partenaire stratégique pour l'amélioration continue de … »

### `/fr/services/intelligence-artificielle/` — `src/content/services/fr/intelligence-artificielle.json`

Source : <https://www.victrix.ca/expertise/intelligence-artificielle/> (50 blocs, 1 images)

- **[P AMPUTÉ]** (27 mots ; mots absents : identifier, prioriser, porteurs, concevoir, amorcer, actions)

  > Identifier et prioriser les cas d’usage de l’IA les plus porteurs, puis concevoir une feuille de route claire pour amorcer vos premières actions concrètes en intelligence artificielle.

- **[P AMPUTÉ]** (35 mots ; mots absents : fonction, delais, conformes)

  > Nous mobilisons nos experts en IA pour vos projets spécifiques, en ajustant notre accompagnement en fonction de vos priorités et délais, pour vous offrir une aide ciblée qui garantit des résultats conformes à vos attentes.

- Reformulés (texte là, hors décompte) : [H2] « Nous mettons l’intelligence artificielle au service des entreprises et… » · [P] « L’exploration et l’analyse d’opportunités » · [P] « Le développement d’agents IA et de solutions sur mesure » · [P] « L’adoption sécurisée de l’IA générative » · [H3] « Comment Victrix collabore avec vos équipes pour une adoption de l’IA f… » · [P] « Accompagnement sur mesure » · [H2] « Vous avez des questions concernant un projet en intelligence artificie… » · [P] « Sécurité et conformité de la donnée » · [H3] « Notre expertise multitechnologie » · [H2] « Êtes-vous prêts à démarrer votre projet d’intelligence artificielle ? » · [H2] « Des interventions structurées et ciblées, portées par un bassin divers… » · [P] « Expertise de solutions »
- Widgets de l’ancien thème non repris (hors décompte) : « Rencontrez nos experts »

### `/fr/services/productivite/plateforme-employe-intranet/` — `src/content/services/fr/productivite/plateforme-employe-intranet.json`

Source : <https://www.victrix.ca/expertise/productivite/plateforme-employe-intranet/> (32 blocs, 2 images)

- **[P]** (4 mots — court, à vérifier)

  > Discutez avec un expert

- Reformulés (texte là, hors décompte) : [H3] « Agent conversationnel pour les ressources humaines avec l'IA » · [H2] « La plateforme pour une expérience employé unifiée et moderne »

### `/en/conditions-utilisation/` — `src/content/pages/en/conditions-utilisation.json`

Source : <https://www.victrix.ca/en/terms-of-use/> (20 blocs, 0 images)

- **[P]** (3 mots — court, à vérifier)

  > Table des matières


### `/en/politique-confidentialite/` — `src/content/pages/en/politique-confidentialite.json`

Source : <https://www.victrix.ca/en/privacy-policy/> (49 blocs, 0 images)

- **[P]** (3 mots — court, à vérifier)

  > Table des matières


### `/en/services/cybersecurity/pentest/` — `src/content/services/en/cybersecurite/test-intrusion-pentest.json`

Source : <https://www.victrix.ca/en/expertise/cybersecurity/pentest/> (42 blocs, 2 images)

- **[LOGO / PICTO]** `/wp-content/uploads/2024/05/certification-test-pentest-300x26.png` — alt : « Certification réalisation de tests d'intrusion »
- Reformulés (texte là, hors décompte) : [H2] « Request Your Penetration Testing Services » · [H2] « Our Penetration Testing Approaches » · [P] « The tester has no information about the organisation »

### `/en/services/managed-it-services/maximize-the-use-of-your-m365-ecosystem/` — `src/content/services/en/services-ti-geres/maximisez-lutilisation-de-votre-ecosysteme-m365.json`

Source : <https://www.victrix.ca/en/expertise/managed-it-services/maximize-the-use-of-your-m365-ecosystem/> (32 blocs, 2 images)

- **[IMAGE]** `/wp-content/uploads/2022/05/istock-1356386941.jpg` — alt : « Maximisez l'utilisation de Microsoft 365 »
- Reformulés (texte là, hors décompte) : [P] « Allows your team to focus on the core business of your organization »

### `/en/services/productivity-consulting/employee-platform-intranet/` — `src/content/services/en/productivite/plateforme-employe-intranet.json`

Source : <https://www.victrix.ca/en/expertise/productivity-consulting/employee-platform-intranet/> (33 blocs, 3 images)

- **[LOGO / PICTO]** `/wp-content/uploads/2023/08/plan-de-travail-1.jpg` — alt : « Microsoft Partner et Copilot logo »
- Reformulés (texte là, hors décompte) : [P] « Lack of commitment » · [H3] « Human Resources Conversational Agent with AI »

### `/fr/conditions-utilisation/` — `src/content/pages/fr/conditions-utilisation.json`

Source : <https://www.victrix.ca/conditions-dutilisation/> (25 blocs, 0 images)

- **[P]** (3 mots — court, à vérifier)

  > Table des matières

- Reformulés (texte là, hors décompte) : [LI] « Notre politique de confidentialité »

### `/fr/politique-confidentialite/` — `src/content/pages/fr/politique-confidentialite.json`

Source : <https://www.victrix.ca/politique-de-confidentialite/> (51 blocs, 0 images)

- **[P]** (3 mots — court, à vérifier)

  > Table des matières

- Reformulés (texte là, hors décompte) : [LI] « Nos conditions d’utilisation »

### `/fr/services/productivite/copilot-microsoft-365/` — `src/content/services/fr/productivite/copilot-microsoft-365.json`

Source : <https://www.victrix.ca/expertise/productivite/copilot-microsoft-365/> (28 blocs, 1 images)

- **[P AMPUTÉ]** (21 mots ; mots absents : analyser, identifier, augmenter)

  > Analyser les expériences en continu et identifier les opportunités de personnalisation pour augmenter la productivité et maximiser le ROI de Copilot.

- Reformulés (texte là, hors décompte) : [H2] « Les enjeux à l’adoption de Copilot pour Microsoft 365 » · [P] « Protéger les données sensibles » · [H3] « Choisissez les licences Copilot pour Microsoft 365 adaptées à votre or… » · [H2] « Notre stratégie d’adoption structurée pour assurer votre réussite avec… » · [P] « • Plan de continuité • Opportunités de personnalisation » · [H2] « Développez des Copilots personnalisés pour maximiser votre efficacité »

