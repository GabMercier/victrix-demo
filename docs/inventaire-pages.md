# Registre des pages : de l'ancien site à la refonte

> Généré le 2026-09-22 (lot L14). **Ne pas modifier à la main** : ce fichier
> se régénère. Les décisions, elles, se prennent dans
> `docs/migration/correspondance-urls.json`.

Ce registre répond à une seule question, pour chaque adresse de l'ancien
site : **si quelqu'un la tape aujourd'hui, où arrive-t-il ?**

## Comment lire ce tableau

| Colonne | Ce qu'elle dit |
| --- | --- |
| **URL en ligne** | L'adresse telle qu'elle circule : dans Google, dans LinkedIn, dans les courriels. Avec sa barre oblique finale, parce que c'est sous cette forme qu'elle est indexée. |
| **Destination** | La page de la refonte qui doit la remplacer. |
| **Mécanisme** | « page » = même adresse, rien à faire · « redirection 301 » = déménagement définitif · « redirection 302 » = page à recréer · « AUCUNE règle » = rien n'est prévu. |
| **État mesuré** | Ce que le site **déployé** répond vraiment, mesuré le 2026-09-22 sur `https://vocal-wren.cloudvent.net`. C'est la colonne qui compte. |
| **Source du contenu** | Le fichier que l'éditrice ouvre dans CloudCannon pour modifier la page d'arrivée. |

## Verdict

**105 des 184 adresses de l'ancien site ne mènent nulle part** sur le
site déployé aujourd'hui. Ce n'est pas parce que les règles manquent — elles
existent presque toutes — mais parce qu'elles sont écrites **sans la barre
oblique finale**, alors que l'hébergement compare l'adresse exacte. Le
détail, et le correctif, sont dans **docs/migration/plan-redirections.md**.

| | Nombre |
| --- | --- |
| Adresses de l'ancien site inventoriées | 184 |
| Arrivent sur une page (200) | 79 |
| Ne mènent nulle part | **105** |
| dont : redirigées vers une page absente | **10** |
| Pages de la refonte (build du 21/09) | 185 — 94 FR, 91 EN |

## Le registre, rubrique par rubrique

### Services — 85 adresses

| URL en ligne | Langue | Destination | Mécanisme | État mesuré | Source du contenu |
| --- | --- | --- | --- | --- | --- |
| `/en/check-point-price-list/` | EN | `/en/services/it-procurement/check-point/` | redirection 302 | **404** | `src/content/services/en/approvisionnement-ti/check-point.json` |
| `/en/expertise/ai-opportunity-analysis/` | EN | `/en/services/artificial-intelligence/ai-opportunity-analysis/` | redirection 301 | **404** — 301 vers un 404 | `src/content/services/en/intelligence-artificielle/analyse-opportunites-ia.json` |
| `/en/expertise/artificial-intelligence/` | EN | `/en/services/artificial-intelligence/` | redirection 301 | **200** en 1 saut | `src/content/services/en/intelligence-artificielle.json` |
| `/en/expertise/artificial-intelligence/ai-opportunity-analysis/` | EN | `/en/services/artificial-intelligence/ai-opportunity-analysis/` | redirection 301 | **200** en 1 saut | `src/content/services/en/intelligence-artificielle/analyse-opportunites-ia.json` |
| `/en/expertise/artificial-intelligence/consulting/` | EN | `/en/services/artificial-intelligence/consulting/` | redirection 301 | **200** en 1 saut | `src/content/services/en/intelligence-artificielle/accompagnement.json` |
| `/en/expertise/artificial-intelligence/landing-ai-consulting/` | EN | `/en/services/artificial-intelligence/landing-ai-consulting/` | redirection 301 | **200** en 1 saut | `src/content/services/en/intelligence-artificielle/accompagnement-ia.json` |
| `/en/expertise/cloud-services-provider/` | EN | `/en/services/cloud-services-provider/` | redirection 301 | **200** en 1 saut | `src/content/services/en/services-infonuagiques.json` |
| `/en/expertise/cloud-services-provider/aws-services/` | EN | `/en/services/cloud-services-provider/aws-services/` | redirection 301 | **200** en 1 saut | `src/content/services/en/services-infonuagiques/services-aws.json` |
| `/en/expertise/cloud-services-provider/azure-migration/` | EN | `/en/services/cloud-services-provider/azure-migration/` | redirection 301 | **200** en 1 saut | `src/content/services/en/services-infonuagiques/migration-vers-azure.json` |
| `/en/expertise/cybersecurity/` | EN | `/en/services/cybersecurity/` | redirection 301 | **200** en 1 saut | `src/content/services/en/cybersecurite.json` |
| `/en/expertise/cybersecurity/cybersecurity-healthcare/` | EN | `/en/services/cybersecurity/cybersecurity-healthcare/` | redirection 301 | **200** en 1 saut | `src/content/services/en/cybersecurite/cybersecurite-sante.json` |
| `/en/expertise/cybersecurity/internet-of-things-iot/` | EN | `/en/services/cybersecurity/internet-of-things-iot/` | redirection 301 | **200** en 1 saut | `src/content/services/en/cybersecurite/internet-des-objets-service-iot.json` |
| `/en/expertise/cybersecurity/pentest/` | EN | `/en/services/cybersecurity/pentest/` | redirection 301 | **200** en 1 saut | `src/content/services/en/cybersecurite/test-intrusion-pentest.json` |
| `/en/expertise/cybersecurity/scalable-security-operations-center/` | EN | `/en/services/cybersecurity/scalable-security-operations-center/` | redirection 301 | **200** en 1 saut | `src/content/services/en/cybersecurite/centre-operationnel-de-securite-evolutif.json` |
| `/en/expertise/cybersecurity/zero-trust/` | EN | `/en/services/cybersecurity/zero-trust/` | redirection 301 | **200** en 1 saut | `src/content/services/en/cybersecurite/zero-trust.json` |
| `/en/expertise/it-managed-services-provider/` | EN | `/en/services/managed-it-services/` | redirection 301 | **404** — 301 vers un 404 | `src/content/services/en/services-ti-geres.json` |
| `/en/expertise/it-procurement/` | EN | `/en/services/it-procurement/` | redirection 301 | **200** en 1 saut | `src/content/services/en/approvisionnement-ti.json` |
| `/en/expertise/it-procurement/check-point/` | EN | `/en/services/it-procurement/check-point/` | redirection 301 | **200** en 1 saut | `src/content/services/en/approvisionnement-ti/check-point.json` |
| `/en/expertise/it-procurement/cisco/` | EN | `/en/services/it-procurement/cisco/` | redirection 301 | **200** en 1 saut | `src/content/services/en/approvisionnement-ti/cisco.json` |
| `/en/expertise/it-procurement/crowdstrike-falcon/` | EN | `/en/services/it-procurement/crowdstrike-falcon/` | redirection 301 | **200** en 1 saut | `src/content/services/en/approvisionnement-ti/crowdstrike-falcon.json` |
| `/en/expertise/it-procurement/dell-technologies/` | EN | `/en/services/it-procurement/dell-technologies/` | redirection 301 | **200** en 1 saut | `src/content/services/en/approvisionnement-ti/dell-technologies.json` |
| `/en/expertise/it-procurement/hpe-networking/` | EN | `/en/services/it-procurement/hpe-networking/` | redirection 301 | **200** en 1 saut | `src/content/services/en/approvisionnement-ti/hpe-networking.json` |
| `/en/expertise/it-procurement/microsoft-solutions/` | EN | `/en/services/it-procurement/microsoft-solutions/` | redirection 301 | **200** en 1 saut | `src/content/services/en/approvisionnement-ti/solutions-microsoft.json` |
| `/en/expertise/it-procurement/palo-alto-networks/` | EN | `/en/services/it-procurement/palo-alto-networks/` | redirection 301 | **200** en 1 saut | `src/content/services/en/approvisionnement-ti/palo-alto-networks.json` |
| `/en/expertise/it-procurement/servicenow/` | EN | `/en/services/it-procurement/servicenow/` | redirection 301 | **200** en 1 saut | `src/content/services/en/approvisionnement-ti/servicenow.json` |
| `/en/expertise/it-procurement/zscaler/` | EN | `/en/services/it-procurement/zscaler/` | redirection 301 | **200** en 1 saut | `src/content/services/en/approvisionnement-ti/zscaler.json` |
| `/en/expertise/managed-it-services/` | EN | `/en/services/managed-it-services/` | redirection 301 | **200** en 1 saut | `src/content/services/en/services-ti-geres.json` |
| `/en/expertise/managed-it-services/maximize-the-use-of-your-m365-ecosystem/` | EN | `/en/services/managed-it-services/maximize-the-use-of-your-m365-ecosystem/` | redirection 301 | **200** en 1 saut | `src/content/services/en/services-ti-geres/maximisez-lutilisation-de-votre-ecosysteme-m365.json` |
| `/en/expertise/productivity-consulting/` | EN | `/en/services/productivity-consulting/` | redirection 301 | **200** en 1 saut | `src/content/services/en/productivite.json` |
| `/en/expertise/productivity-consulting/copilot-for-microsoft-365/` | EN | `/en/services/productivity-consulting/copilot-for-microsoft-365/` | redirection 301 | **200** en 1 saut | `src/content/services/en/productivite/copilot-microsoft-365.json` |
| `/en/expertise/productivity-consulting/copilot-studio/` | EN | `/en/services/productivity-consulting/copilot-studio/` | redirection 301 | **200** en 1 saut | `src/content/services/en/productivite/copilot-studio.json` |
| `/en/expertise/productivity-consulting/dynamics-365-field-service/` | EN | `/en/services/productivity-consulting/dynamics-365-field-service/` | redirection 301 | **200** en 1 saut | `src/content/services/en/productivite/dynamics-365-field-service.json` |
| `/en/expertise/productivity-consulting/employee-platform-intranet/` | EN | `/en/services/productivity-consulting/employee-platform-intranet/` | redirection 301 | **200** en 1 saut | `src/content/services/en/productivite/plateforme-employe-intranet.json` |
| `/en/expertise/productivity-consulting/o-studio/` | EN | `/en/services/productivity-consulting/o-studio/` | redirection 301 | **200** en 1 saut | `src/content/services/en/productivite/o-studio.json` |
| `/en/expertise/productivity-consulting/office-booking/` | EN | `/en/services/productivity-consulting/office-booking/` | redirection 301 | **200** en 1 saut | `src/content/services/en/productivite/o-bureau.json` |
| `/en/expertise/productivity-consulting/office-booking/landing-demo-obureau/` | EN | `/en/services/productivity-consulting/office-booking/landing-demo-obureau/` | redirection 301 | **200** en 1 saut | `src/content/services/en/productivite/o-bureau/demo-o-bureau.json` |
| `/en/expertise/productivity-consulting/servicenow/` | EN | `/en/services/it-procurement/servicenow/` | redirection 301 | **200** en 1 saut | `src/content/services/en/approvisionnement-ti/servicenow.json` |
| `/en/expertise/strategic-advice/` | EN | `/en/services/strategic-advice/` | redirection 301 | **200** en 1 saut | `src/content/services/en/conseil-strategique.json` |
| `/en/expertise/strategic-advice/law-25-compliance/` | EN | `/en/services/strategic-advice/law-25-compliance/` | redirection 301 | **200** en 1 saut | `src/content/services/en/conseil-strategique/conformite-loi-25.json` |
| `/expertise/approvisionnement-ti/` | FR | `/fr/services/approvisionnement-ti/` | redirection 301 | **200** en 1 saut | `src/content/services/fr/approvisionnement-ti.json` |
| `/expertise/approvisionnement-ti/check-point/` | FR | `/fr/services/approvisionnement-ti/check-point/` | redirection 301 | **200** en 1 saut | `src/content/services/fr/approvisionnement-ti/check-point.json` |
| `/expertise/approvisionnement-ti/cisco/` | FR | `/fr/services/approvisionnement-ti/cisco/` | redirection 301 | **200** en 1 saut | `src/content/services/fr/approvisionnement-ti/cisco.json` |
| `/expertise/approvisionnement-ti/crowdstrike-falcon/` | FR | `/fr/services/approvisionnement-ti/crowdstrike-falcon/` | redirection 301 | **200** en 1 saut | `src/content/services/fr/approvisionnement-ti/crowdstrike-falcon.json` |
| `/expertise/approvisionnement-ti/dell-technologies/` | FR | `/fr/services/approvisionnement-ti/dell-technologies/` | redirection 301 | **200** en 1 saut | `src/content/services/fr/approvisionnement-ti/dell-technologies.json` |
| `/expertise/approvisionnement-ti/hpe-networking/` | FR | `/fr/services/approvisionnement-ti/hpe-networking/` | redirection 301 | **200** en 1 saut | `src/content/services/fr/approvisionnement-ti/hpe-networking.json` |
| `/expertise/approvisionnement-ti/palo-alto-networks/` | FR | `/fr/services/approvisionnement-ti/palo-alto-networks/` | redirection 301 | **200** en 1 saut | `src/content/services/fr/approvisionnement-ti/palo-alto-networks.json` |
| `/expertise/approvisionnement-ti/servicenow/` | FR | `/fr/services/approvisionnement-ti/servicenow/` | redirection 301 | **200** en 1 saut | `src/content/services/fr/approvisionnement-ti/servicenow.json` |
| `/expertise/approvisionnement-ti/solutions-microsoft/` | FR | `/fr/services/approvisionnement-ti/solutions-microsoft/` | redirection 301 | **200** en 1 saut | `src/content/services/fr/approvisionnement-ti/solutions-microsoft.json` |
| `/expertise/approvisionnement-ti/zscaler/` | FR | `/fr/services/approvisionnement-ti/zscaler/` | redirection 301 | **200** en 1 saut | `src/content/services/fr/approvisionnement-ti/zscaler.json` |
| `/expertise/conseil-strategique/` | FR | `/fr/services/conseil-strategique/` | redirection 301 | **200** en 1 saut | `src/content/services/fr/conseil-strategique.json` |
| `/expertise/conseil-strategique/conformite-loi-25/` | FR | `/fr/services/conseil-strategique/conformite-loi-25/` | redirection 301 | **200** en 1 saut | `src/content/services/fr/conseil-strategique/conformite-loi-25.json` |
| `/expertise/cybersecurite/` | FR | `/fr/services/cybersecurite/` | redirection 301 | **200** en 1 saut | `src/content/services/fr/cybersecurite.json` |
| `/expertise/cybersecurite/centre-operationnel-de-securite-evolutif/` | FR | `/fr/services/cybersecurite/centre-operationnel-de-securite-evolutif/` | redirection 301 | **200** en 1 saut | `src/content/services/fr/cybersecurite/centre-operationnel-de-securite-evolutif.json` |
| `/expertise/cybersecurite/cybersecurite-sante/` | FR | `/fr/services/cybersecurite/cybersecurite-sante/` | redirection 301 | **200** en 1 saut | `src/content/services/fr/cybersecurite/cybersecurite-sante.json` |
| `/expertise/cybersecurite/internet-des-objets-service-iot/` | FR | `/fr/services/cybersecurite/internet-des-objets-service-iot/` | redirection 301 | **200** en 1 saut | `src/content/services/fr/cybersecurite/internet-des-objets-service-iot.json` |
| `/expertise/cybersecurite/test-intrusion-pentest/` | FR | `/fr/services/cybersecurite/test-intrusion-pentest/` | redirection 301 | **200** en 1 saut | `src/content/services/fr/cybersecurite/test-intrusion-pentest.json` |
| `/expertise/cybersecurite/zero-trust/` | FR | `/fr/services/cybersecurite/zero-trust/` | redirection 301 | **200** en 1 saut | `src/content/services/fr/cybersecurite/zero-trust.json` |
| `/expertise/fournisseur-services-geres-ti/` | FR | `/fr/services/services-ti-geres/` | redirection 301 | **404** — 301 vers un 404 | `src/content/services/fr/services-ti-geres.json` |
| `/expertise/intelligence-artificielle/` | FR | `/fr/services/intelligence-artificielle/` | redirection 301 | **200** en 1 saut | `src/content/services/fr/intelligence-artificielle.json` |
| `/expertise/intelligence-artificielle/accompagnement-ia/` | FR | `/fr/services/intelligence-artificielle/accompagnement-ia/` | redirection 301 | **200** en 1 saut | `src/content/services/fr/intelligence-artificielle/accompagnement-ia.json` |
| `/expertise/intelligence-artificielle/accompagnement/` | FR | `/fr/services/intelligence-artificielle/accompagnement/` | redirection 301 | **200** en 1 saut | `src/content/services/fr/intelligence-artificielle/accompagnement.json` |
| `/expertise/intelligence-artificielle/analyse-opportunites-ia/` | FR | `/fr/services/intelligence-artificielle/analyse-opportunites-ia/` | redirection 301 | **200** en 1 saut | `src/content/services/fr/intelligence-artificielle/analyse-opportunites-ia.json` |
| `/expertise/loi-25-etes-vous-en-conformite/` | FR | `/fr/services/conseil-strategique/conformite-loi-25/` | redirection 301 | **404** — 301 vers un 404 | `src/content/services/fr/conseil-strategique/conformite-loi-25.json` |
| `/expertise/productivite/` | FR | `/fr/services/productivite/` | redirection 301 | **200** en 1 saut | `src/content/services/fr/productivite.json` |
| `/expertise/productivite/copilot-microsoft-365/` | FR | `/fr/services/productivite/copilot-microsoft-365/` | redirection 301 | **200** en 1 saut | `src/content/services/fr/productivite/copilot-microsoft-365.json` |
| `/expertise/productivite/copilot-studio/` | FR | `/fr/services/productivite/copilot-studio/` | redirection 301 | **200** en 1 saut | `src/content/services/fr/productivite/copilot-studio.json` |
| `/expertise/productivite/dynamics-365-field-service/` | FR | `/fr/services/productivite/dynamics-365-field-service/` | redirection 301 | **200** en 1 saut | `src/content/services/fr/productivite/dynamics-365-field-service.json` |
| `/expertise/productivite/o-bureau/` | FR | `/fr/services/productivite/o-bureau/` | redirection 301 | **200** en 1 saut | `src/content/services/fr/productivite/o-bureau.json` |
| `/expertise/productivite/o-bureau/demo-o-bureau/` | FR | `/fr/services/productivite/o-bureau/demo-o-bureau/` | redirection 301 | **200** en 1 saut | `src/content/services/fr/productivite/o-bureau/demo-o-bureau.json` |
| `/expertise/productivite/o-bureau/documents-o-bureau/` | FR | `/fr/services/productivite/o-bureau/` | redirection 301 | **404** — 301 vers un 404 | `src/content/services/fr/productivite/o-bureau.json` |
| `/expertise/productivite/o-studio/` | FR | `/fr/services/productivite/o-studio/` | redirection 301 | **200** en 1 saut | `src/content/services/fr/productivite/o-studio.json` |
| `/expertise/productivite/plateforme-employe-intranet/` | FR | `/fr/services/productivite/plateforme-employe-intranet/` | redirection 301 | **200** en 1 saut | `src/content/services/fr/productivite/plateforme-employe-intranet.json` |
| `/expertise/productivite/plateforme-employe-microsoft-viva-365/` | FR | `/fr/services/productivite/plateforme-employe-intranet/` | redirection 301 | **404** — 301 vers un 404 | `src/content/services/fr/productivite/plateforme-employe-intranet.json` |
| `/expertise/productivite/servicenow/` | FR | `/fr/services/approvisionnement-ti/servicenow/` | redirection 301 | **200** en 1 saut | `src/content/services/fr/approvisionnement-ti/servicenow.json` |
| `/expertise/securite-informatique/` | FR | `/fr/services/cybersecurite/` | redirection 301 | **404** — 301 vers un 404 | `src/content/services/fr/cybersecurite.json` |
| `/expertise/securite-informatique/centre-operationnel-de-securite-evolutif/` | FR | `/fr/services/cybersecurite/centre-operationnel-de-securite-evolutif/` | redirection 301 | **404** — 301 vers un 404 | `src/content/services/fr/cybersecurite/centre-operationnel-de-securite-evolutif.json` |
| `/expertise/securite-informatique/test-intrusion-pentest/` | FR | `/fr/services/cybersecurite/test-intrusion-pentest/` | redirection 301 | **404** — 301 vers un 404 | `src/content/services/fr/cybersecurite/test-intrusion-pentest.json` |
| `/expertise/securite-informatique/zero-trust/` | FR | `/fr/services/cybersecurite/zero-trust/` | redirection 301 | **404** — 301 vers un 404 | `src/content/services/fr/cybersecurite/zero-trust.json` |
| `/expertise/services-infonuagiques/` | FR | `/fr/services/services-infonuagiques/` | redirection 301 | **200** en 1 saut | `src/content/services/fr/services-infonuagiques.json` |
| `/expertise/services-infonuagiques/migration-vers-azure/` | FR | `/fr/services/services-infonuagiques/migration-vers-azure/` | redirection 301 | **200** en 1 saut | `src/content/services/fr/services-infonuagiques/migration-vers-azure.json` |
| `/expertise/services-infonuagiques/services-aws/` | FR | `/fr/services/services-infonuagiques/services-aws/` | redirection 301 | **200** en 1 saut | `src/content/services/fr/services-infonuagiques/services-aws.json` |
| `/expertise/services-ti-geres/` | FR | `/fr/services/services-ti-geres/` | redirection 301 | **200** en 1 saut | `src/content/services/fr/services-ti-geres.json` |
| `/expertise/services-ti-geres/maximisez-lutilisation-de-votre-ecosysteme-m365/` | FR | `/fr/services/services-ti-geres/maximisez-lutilisation-de-votre-ecosysteme-m365/` | redirection 301 | **200** en 1 saut | `src/content/services/fr/services-ti-geres/maximisez-lutilisation-de-votre-ecosysteme-m365.json` |
| `/liste-prix-check-point/` | FR | `/fr/services/approvisionnement-ti/check-point/` | redirection 302 | **404** | `src/content/services/fr/approvisionnement-ti/check-point.json` |
| `/solution/migration/` | FR | `/fr/services/services-infonuagiques/migration-vers-azure/` | redirection 301 | **404** | `src/content/services/fr/services-infonuagiques/migration-vers-azure.json` |

### Ressources (articles) — 76 adresses

| URL en ligne | Langue | Destination | Mécanisme | État mesuré | Source du contenu |
| --- | --- | --- | --- | --- | --- |
| `/agents-copilot-studio/` | FR | `/fr/ressources/agents-copilot-studio/` | redirection 301 | **404** | `src/content/blog/fr/agents-copilot-studio.md` |
| `/annonce-nomination-ceo/` | FR | `/fr/ressources/annonce-nomination-ceo/` | redirection 301 | **404** | `src/content/blog/fr/annonce-nomination-ceo.md` |
| `/applications-microsoft-viva-demystifier-viva/` | FR | `/fr/ressources/applications-microsoft-viva-demystifier-viva/` | redirection 301 | **404** | `src/content/blog/fr/applications-microsoft-viva-demystifier-viva.md` |
| `/audit-cybersecurite/` | FR | `/fr/ressources/audit-cybersecurite/` | redirection 301 | **404** | `src/content/blog/fr/audit-cybersecurite.md` |
| `/certification-iso-27001-iso-9001/` | FR | `/fr/ressources/certification-iso-27001-iso-9001/` | redirection 301 | **404** | `src/content/blog/fr/certification-iso-27001-iso-9001.md` |
| `/copilot-vs-chatgpt/` | FR | `/fr/ressources/copilot-vs-chatgpt/` | redirection 301 | **404** | `src/content/blog/fr/copilot-vs-chatgpt.md` |
| `/developpement-offre-cybersecurite-france/` | FR | `/fr/ressources/developpement-offre-cybersecurite-france/` | redirection 301 | **404** | `src/content/blog/fr/developpement-offre-cybersecurite-france.md` |
| `/directive-nis2/` | FR | `/fr/ressources/directive-nis2/` | redirection 301 | **404** | `src/content/blog/fr/directive-nis2.md` |
| `/document/cybersecurite/` | FR | `/fr/ressources/` | redirection 302 | **404** | (gabarit de page) |
| `/document/pourquoi-gerez-vous-encore-vos-ti/` | FR | `/fr/ressources/` | redirection 302 | **404** | (gabarit de page) |
| `/document/webinaire-copilot-buzz-impact/` | FR | `/fr/ressources/` | redirection 302 | **404** | (gabarit de page) |
| `/en/appointment-ceo/` | EN | `/en/ressources/appointment-ceo/` | redirection 301 | **404** | `src/content/blog/en/annonce-nomination-ceo.md` |
| `/en/best-practices-in-operational-safety-maintenance/` | EN | `/en/ressources/best-practices-in-operational-safety-maintenance/` | redirection 301 | **404** | `src/content/blog/en/partie-1-meilleures-pratiques-en-securite-operationnelle-la-maintenance.md` |
| `/en/best-practices-in-operational-security-defense/` | EN | `/en/ressources/best-practices-in-operational-security-defense/` | redirection 301 | **404** | `src/content/blog/en/partie-3-meilleures-pratiques-en-securite-operationnelle-la-defense.md` |
| `/en/best-practices-in-operational-security-monitoring/` | EN | `/en/ressources/best-practices-in-operational-security-monitoring/` | redirection 301 | **404** | `src/content/blog/en/partie-2-meilleures-pratiques-en-securite-operationnelle-la-surveillance.md` |
| `/en/chatgpt-vs-copilot/` | EN | `/en/ressources/chatgpt-vs-copilot/` | redirection 301 | **404** | `src/content/blog/en/copilot-vs-chatgpt.md` |
| `/en/copilot-studio-agents/` | EN | `/en/ressources/copilot-studio-agents/` | redirection 301 | **404** | `src/content/blog/en/agents-copilot-studio.md` |
| `/en/cybersecurity-risk-audit/` | EN | `/en/ressources/cybersecurity-risk-audit/` | redirection 301 | **404** | `src/content/blog/en/audit-cybersecurite.md` |
| `/en/dominic-lajoie-appointed/` | EN | `/en/ressources/dominic-lajoie-appointed/` | redirection 301 | **404** | `src/content/blog/en/nomination-dominic-lajoie.md` |
| `/en/dora-regulation/` | EN | `/en/ressources/dora-regulation/` | redirection 301 | **404** | `src/content/blog/en/reglementation-dora.md` |
| `/en/expands-cybersecurity-offering-france/` | EN | `/en/ressources/expands-cybersecurity-offering-france/` | redirection 301 | **404** | `src/content/blog/en/developpement-offre-cybersecurite-france.md` |
| `/en/extended-reality-xr-agc-partnership/` | EN | `/en/ressources/extended-reality-xr-agc-partnership/` | redirection 301 | **404** | `src/content/blog/en/realite-etendue-xr-partenariat-agc.md` |
| `/en/internet-of-things-security/` | EN | `/en/ressources/internet-of-things-security/` | redirection 301 | **404** | `src/content/blog/en/securite-internet-des-objets.md` |
| `/en/iot-security-challenges/` | EN | `/en/ressources/iot-security-challenges/` | redirection 301 | **404** | `src/content/blog/en/securite-iot-defis.md` |
| `/en/iso-27001-iso-9001-certifications/` | EN | `/en/ressources/iso-27001-iso-9001-certifications/` | redirection 301 | **404** | `src/content/blog/en/certification-iso-27001-iso-9001.md` |
| `/en/it-trends/` | EN | `/en/ressources/it-trends/` | redirection 301 | **404** | `src/content/blog/en/tendances-ti.md` |
| `/en/law-25-personal-data-guide/` | EN | `/en/ressources/law-25-personal-data-guide/` | redirection 301 | **404** | `src/content/blog/en/loi-25-donnees-personnelles-guide.md` |
| `/en/microsoft-copilot-features/` | EN | `/en/ressources/microsoft-copilot-features/` | redirection 301 | **404** | `src/content/blog/en/fonctionnalites-microsoft-copilot.md` |
| `/en/microsoft-viva-apps/` | EN | `/en/ressources/microsoft-viva-apps/` | redirection 301 | **404** | `src/content/blog/en/applications-microsoft-viva-demystifier-viva.md` |
| `/en/migration-windows-11-microsoft-exchange/` | EN | `/en/ressources/migration-windows-11-microsoft-exchange/` | redirection 301 | **404** | `src/content/blog/en/migration-windows-11-microsoft-exchange.md` |
| `/en/nis2-directive/` | EN | `/en/ressources/nis2-directive/` | redirection 301 | **404** | `src/content/blog/en/directive-nis2.md` |
| `/en/part-2-best-practices-in-operational-security-monitoring/` | EN | `/en/ressources/best-practices-in-operational-security-monitoring/` | redirection 301 | **404** | `src/content/blog/en/partie-2-meilleures-pratiques-en-securite-operationnelle-la-surveillance.md` |
| `/en/part-3-best-practices-in-operational-security-defense/` | EN | `/en/ressources/best-practices-in-operational-security-defense/` | redirection 301 | **404** | `src/content/blog/en/partie-3-meilleures-pratiques-en-securite-operationnelle-la-defense.md` |
| `/en/penetration-testing/` | EN | `/en/ressources/penetration-testing/` | redirection 301 | **404** | `src/content/blog/en/pentest-cybersecurite.md` |
| `/en/power-platform-governance-advice/` | EN | `/en/ressources/power-platform-governance-advice/` | redirection 301 | **404** | `src/content/blog/en/gouvernance-power-platform-conseils.md` |
| `/en/ransomware-protection-tips/` | EN | `/en/ressources/ransomware-protection-tips/` | redirection 301 | **404** | `src/content/blog/en/ransomware-rancongiciels.md` |
| `/en/resources-center/` | EN | `/en/ressources/` | redirection 301 | **404** | (gabarit de page) |
| `/en/sase-cloud/` | EN | `/en/ressources/sase-cloud/` | redirection 301 | **404** | `src/content/blog/en/sase-cloud.md` |
| `/en/servicenow-ai/` | EN | `/en/ressources/servicenow-ai/` | redirection 301 | **404** | `src/content/blog/en/ia-servicenow.md` |
| `/en/servicenow-itom/` | EN | `/en/ressources/servicenow-itom/` | redirection 301 | **404** | `src/content/blog/en/servicenow-itom.md` |
| `/en/servicenow-itsm/` | EN | `/en/ressources/servicenow-itsm/` | redirection 301 | **404** | `src/content/blog/en/servicenow-itsm.md` |
| `/en/setting-up-a-soc/` | EN | `/en/ressources/setting-up-a-soc/` | redirection 301 | **404** | `src/content/blog/en/mise-en-place-soc.md` |
| `/en/soc-outsourcing-for-smbs-pros-cons/` | EN | `/en/ressources/soc-outsourcing-for-smbs-pros-cons/` | redirection 301 | **404** | `src/content/blog/en/externalisation-soc-avantages-inconvenients.md` |
| `/en/soc-outsourcing-pros-cons/` | EN | `/en/ressources/soc-outsourcing-for-smbs-pros-cons/` | redirection 301 | **404** | `src/content/blog/en/externalisation-soc-avantages-inconvenients.md` |
| `/en/zero-trust-network-access-ztna-ultimate-cybersecurity-model/` | EN | `/en/ressources/zero-trust-network-access-ztna-ultimate-cybersecurity-model/` | redirection 301 | **404** | `src/content/blog/en/zero-trust-network-access-ztna.md` |
| `/en/zero-trust-network-access-ztna/` | EN | `/en/ressources/zero-trust-network-access-ztna-ultimate-cybersecurity-model/` | redirection 301 | **404** | `src/content/blog/en/zero-trust-network-access-ztna.md` |
| `/externalisation-du-soc-avantages-inconvenients/` | FR | `/fr/ressources/externalisation-du-soc-avantages-inconvenients/` | redirection 301 | **404** | `src/content/blog/fr/externalisation-soc-avantages-inconvenients.md` |
| `/externalisation-soc-avantages-inconvenients/` | FR | `/fr/ressources/externalisation-du-soc-avantages-inconvenients/` | redirection 301 | **404** | `src/content/blog/fr/externalisation-soc-avantages-inconvenients.md` |
| `/fonctionnalites-microsoft-copilot/` | FR | `/fr/ressources/fonctionnalites-microsoft-copilot/` | redirection 301 | **404** | `src/content/blog/fr/fonctionnalites-microsoft-copilot.md` |
| `/gouvernance-power-platform-conseils/` | FR | `/fr/ressources/gouvernance-power-platform-conseils/` | redirection 301 | **404** | `src/content/blog/fr/gouvernance-power-platform-conseils.md` |
| `/ia-servicenow/` | FR | `/fr/ressources/ia-servicenow/` | redirection 301 | **404** | `src/content/blog/fr/ia-servicenow.md` |
| `/loi-25-donnees-personnelles-guide/` | FR | `/fr/ressources/loi-25-donnees-personnelles-guide/` | redirection 301 | **404** | `src/content/blog/fr/loi-25-donnees-personnelles-guide.md` |
| `/meilleures-pratiques-en-securite-operationnelle-la-defense/` | FR | `/fr/ressources/meilleures-pratiques-en-securite-operationnelle-la-defense/` | redirection 301 | **404** | `src/content/blog/fr/partie-3-meilleures-pratiques-en-securite-operationnelle-la-defense.md` |
| `/meilleures-pratiques-en-securite-operationnelle-la-maintenance/` | FR | `/fr/ressources/meilleures-pratiques-en-securite-operationnelle-la-maintenance/` | redirection 301 | **404** | `src/content/blog/fr/partie-1-meilleures-pratiques-en-securite-operationnelle-la-maintenance.md` |
| `/meilleures-pratiques-en-securite-operationnelle-la-surveillance/` | FR | `/fr/ressources/meilleures-pratiques-en-securite-operationnelle-la-surveillance/` | redirection 301 | **404** | `src/content/blog/fr/partie-2-meilleures-pratiques-en-securite-operationnelle-la-surveillance.md` |
| `/migration-windows-11-microsoft-exchange/` | FR | `/fr/ressources/migration-windows-11-microsoft-exchange/` | redirection 301 | **404** | `src/content/blog/fr/migration-windows-11-microsoft-exchange.md` |
| `/mise-en-place-soc/` | FR | `/fr/ressources/mise-en-place-soc/` | redirection 301 | **404** | `src/content/blog/fr/mise-en-place-soc.md` |
| `/nomination-dominic-lajoie/` | FR | `/fr/ressources/nomination-dominic-lajoie/` | redirection 301 | **404** | `src/content/blog/fr/nomination-dominic-lajoie.md` |
| `/partie-1-meilleures-pratiques-en-securite-operationnelle-la-maintenance/` | FR | `/fr/ressources/meilleures-pratiques-en-securite-operationnelle-la-maintenance/` | redirection 301 | **404** | `src/content/blog/fr/partie-1-meilleures-pratiques-en-securite-operationnelle-la-maintenance.md` |
| `/partie-2-meilleures-pratiques-en-securite-operationnelle-la-surveillance/` | FR | `/fr/ressources/meilleures-pratiques-en-securite-operationnelle-la-surveillance/` | redirection 301 | **404** | `src/content/blog/fr/partie-2-meilleures-pratiques-en-securite-operationnelle-la-surveillance.md` |
| `/partie-3-meilleures-pratiques-en-securite-operationnelle-la-defense/` | FR | `/fr/ressources/meilleures-pratiques-en-securite-operationnelle-la-defense/` | redirection 301 | **404** | `src/content/blog/fr/partie-3-meilleures-pratiques-en-securite-operationnelle-la-defense.md` |
| `/pentest-cybersecurite/` | FR | `/fr/ressources/pentest-cybersecurite/` | redirection 301 | **404** | `src/content/blog/fr/pentest-cybersecurite.md` |
| `/ransomware-rancongiciels/` | FR | `/fr/ressources/ransomware-rancongiciels/` | redirection 301 | **404** | `src/content/blog/fr/ransomware-rancongiciels.md` |
| `/realite-etendue-xr-partenariat-agc/` | FR | `/fr/ressources/realite-etendue-xr-partenariat-agc/` | redirection 301 | **404** | `src/content/blog/fr/realite-etendue-xr-partenariat-agc.md` |
| `/reglementation-dora/` | FR | `/fr/ressources/reglementation-dora/` | redirection 301 | **404** | `src/content/blog/fr/reglementation-dora.md` |
| `/ressources/` | FR | `/fr/ressources/` | redirection 301 | **200** direct | (gabarit de page) |
| `/sase-cloud/` | FR | `/fr/ressources/sase-cloud/` | redirection 301 | **404** | `src/content/blog/fr/sase-cloud.md` |
| `/securite-internet-des-objets/` | FR | `/fr/ressources/securite-internet-des-objets/` | redirection 301 | **404** | `src/content/blog/fr/securite-internet-des-objets.md` |
| `/securite-iot-defis/` | FR | `/fr/ressources/securite-iot-defis/` | redirection 301 | **404** | `src/content/blog/fr/securite-iot-defis.md` |
| `/servicenow-itom/` | FR | `/fr/ressources/servicenow-itom/` | redirection 301 | **404** | `src/content/blog/fr/servicenow-itom.md` |
| `/servicenow-itsm/` | FR | `/fr/ressources/servicenow-itsm/` | redirection 301 | **404** | `src/content/blog/fr/servicenow-itsm.md` |
| `/societe-conseil-lambda-victrix/` | FR | `/fr/ressources/societe-conseil-lambda-victrix/` | redirection 301 | **404** | `src/content/blog/fr/societe-conseil-lambda-victrix.md` |
| `/tendances-ti/` | FR | `/fr/ressources/tendances-ti/` | redirection 301 | **404** | `src/content/blog/fr/tendances-ti.md` |
| `/une-journee-dans-la-vie-secops/` | FR | `/fr/ressources/une-journee-dans-la-vie-secops/` | redirection 301 | **404** | `src/content/blog/fr/une-journee-dans-la-vie-secops.md` |
| `/zero-trust-network-access-ztna-modele-de-cybersecurite-optimal/` | FR | `/fr/ressources/zero-trust-network-access-ztna-modele-de-cybersecurite-optimal/` | redirection 301 | **404** | `src/content/blog/fr/zero-trust-network-access-ztna.md` |
| `/zero-trust-network-access-ztna/` | FR | `/fr/ressources/zero-trust-network-access-ztna-modele-de-cybersecurite-optimal/` | redirection 301 | **404** | `src/content/blog/fr/zero-trust-network-access-ztna.md` |

### Pages uniques — 20 adresses

| URL en ligne | Langue | Destination | Mécanisme | État mesuré | Source du contenu |
| --- | --- | --- | --- | --- | --- |
| `/` | FR | `/fr/` | redirection 301 | **200** en 1 saut | `src/content/home/fr/accueil.json` |
| `/carriere/` | FR | `/fr/carrieres/` | redirection 301 | **404** | `src/content/pages/fr/carrieres.json` |
| `/conditions-dutilisation/` | FR | `/fr/conditions-utilisation/` | redirection 301 | **404** | `src/content/pages/fr/conditions-utilisation.json` |
| `/contact/` | FR | `/fr/contact/` | redirection 301 | **200** direct | (gabarit de page) |
| `/decouvrir-victrix/` | FR | `/fr/decouvrir/` | redirection 301 | **404** | `src/content/pages/fr/decouvrir.json` |
| `/en/` | EN | `/en/` | page (même URL) | **200** direct | `src/content/home/en/accueil.json` |
| `/en/careers/` | EN | `/en/carrieres/` | redirection 301 | **404** | `src/content/pages/en/carrieres.json` |
| `/en/contact/` | EN | `/en/contact/` | page (même URL) | **200** direct | (gabarit de page) |
| `/en/customer-portal/` | EN | `/en/portail/` | redirection 301 | **200** direct | (gabarit de page) |
| `/en/discover-victrix/` | EN | `/en/decouvrir/` | redirection 301 | **404** | `src/content/pages/en/decouvrir.json` |
| `/en/holiday-wishes/` | EN | `/en/` | redirection 301 | **404** | `src/content/home/en/accueil.json` |
| `/en/no-access/` | EN | `/en/portail/` | redirection 301 | **404** | (gabarit de page) |
| `/en/privacy-policy/` | EN | `/en/politique-confidentialite/` | redirection 301 | **404** | `src/content/pages/en/politique-confidentialite.json` |
| `/en/terms-of-use/` | EN | `/en/conditions-utilisation/` | redirection 301 | **404** | `src/content/pages/en/conditions-utilisation.json` |
| `/en/thank-you-page/` | EN | `/en/merci/` | redirection 301 | **404** | (gabarit de page) |
| `/mon-portail/` | FR | `/fr/portail/` | redirection 301 | **200** direct | (gabarit de page) |
| `/no-access/` | FR | `/fr/portail/` | redirection 301 | **404** | (gabarit de page) |
| `/page-de-remerciement/` | FR | `/fr/merci/` | redirection 301 | **404** | (gabarit de page) |
| `/politique-de-confidentialite/` | FR | `/fr/politique-confidentialite/` | redirection 301 | **404** | `src/content/pages/fr/politique-confidentialite.json` |
| `/voeux-des-fetes/` | FR | `/fr/` | redirection 301 | **404** | `src/content/home/fr/accueil.json` |

### Campagnes — 1 adresses

| URL en ligne | Langue | Destination | Mécanisme | État mesuré | Source du contenu |
| --- | --- | --- | --- | --- | --- |
| `/document/licences-microsoft-power-platform/` | FR | `/fr/campagnes/licences-power-platform/` | redirection 301 | **404** | `src/content/landing/fr/licences-power-platform.md` |

### Sans destination — 2 adresses

| URL en ligne | Langue | Destination | Mécanisme | État mesuré | Source du contenu |
| --- | --- | --- | --- | --- | --- |
| `/cache/` | FR | — | ignorée (404 assumé) | **404** | — |
| `/xmlrpc.php/` | FR | — | ignorée (404 assumé) | **404** | — |

## À part : les adresses sans destination

| URL en ligne | Pourquoi | Décision |
| --- | --- | --- |
| `/cache/` | ignorée (404 assumé) | volontairement ignorée |
| `/xmlrpc.php/` | ignorée (404 assumé) | volontairement ignorée |

## À part : les redirections qui mènent à une page absente

Une redirection vers une page absente est **pire** qu'une page absente :
Google suit la redirection, ne trouve rien, et l'ancienne page perd son
référencement sans rien transmettre.

| URL en ligne | Aboutit sur | Destination VOULUE |
| --- | --- | --- |
| `/en/expertise/ai-opportunity-analysis/` | `/en/services/ai-opportunity-analysis/` | `/en/services/artificial-intelligence/ai-opportunity-analysis/` |
| `/en/expertise/it-managed-services-provider/` | `/en/services/it-managed-services-provider/` | `/en/services/managed-it-services/` |
| `/expertise/fournisseur-services-geres-ti/` | `/fr/services/fournisseur-services-geres-ti/` | `/fr/services/services-ti-geres/` |
| `/expertise/loi-25-etes-vous-en-conformite/` | `/fr/services/loi-25-etes-vous-en-conformite/` | `/fr/services/conseil-strategique/conformite-loi-25/` |
| `/expertise/productivite/o-bureau/documents-o-bureau/` | `/fr/services/productivite/o-bureau/documents-o-bureau/` | `/fr/services/productivite/o-bureau/` |
| `/expertise/productivite/plateforme-employe-microsoft-viva-365/` | `/fr/services/productivite/plateforme-employe-microsoft-viva-365/` | `/fr/services/productivite/plateforme-employe-intranet/` |
| `/expertise/securite-informatique/` | `/fr/services/securite-informatique/` | `/fr/services/cybersecurite/` |
| `/expertise/securite-informatique/centre-operationnel-de-securite-evolutif/` | `/fr/services/securite-informatique/centre-operationnel-de-securite-evolutif/` | `/fr/services/cybersecurite/centre-operationnel-de-securite-evolutif/` |
| `/expertise/securite-informatique/test-intrusion-pentest/` | `/fr/services/securite-informatique/test-intrusion-pentest/` | `/fr/services/cybersecurite/test-intrusion-pentest/` |
| `/expertise/securite-informatique/zero-trust/` | `/fr/services/securite-informatique/zero-trust/` | `/fr/services/cybersecurite/zero-trust/` |

## À part : la parité française / anglaise

Sur 97 contenus, **2 n'existent qu'en français**
et 0 qu'en anglais. L'écart de pages construites (94 FR contre 91 EN)
s'explique entièrement : ces contenus, plus `/fr/style-guide/` qui n'est
produit qu'en français.

| Contenu | Fichier français | Version anglaise |
| --- | --- | --- |
| blog/societe-conseil-lambda-victrix | `src/content/blog/fr/societe-conseil-lambda-victrix.md` | absente |
| blog/une-journee-dans-la-vie-secops | `src/content/blog/fr/une-journee-dans-la-vie-secops.md` | absente |

Ces deux articles étaient **déjà** en français seulement sur l'ancien site :
ce n'est pas une régression de la refonte.

## À part : les pages de démonstration à retirer avant le lancement

| Page | Source | Dans le plan de site ? | Ancienne URL ? | À faire |
| --- | --- | --- | --- | --- |
| `/fr/style-guide/` | `src/pages/[lang]/style-guide.astro` | non | non | retirer |
| `/fr/services/demo-produit/` | `src/content/services/fr/demo-produit.json` | non (noindex) | non | retirer |
| `/en/services/demo-produit/` | `src/content/services/en/demo-produit.json` | non (noindex) | non | retirer |
| `/fr/services/demo-sections/` | `src/content/services/fr/demo-sections.json` | non (noindex) | non | retirer |
| `/en/services/demo-sections/` | `src/content/services/en/demo-sections.json` | non (noindex) | non | retirer |
| `/fr/campagnes/demo-sections/` | `src/content/landing/fr/demo-sections.md` | non (noindex) | non | retirer |
| `/en/campagnes/demo-sections/` | `src/content/landing/en/demo-sections.md` | non (noindex) | non | retirer |
| `/fr/services/productivite/o-bureau/demo-o-bureau/` | `src/content/services/fr/productivite/o-bureau/demo-o-bureau.json` | non (noindex) | **OUI** `/expertise/productivite/o-bureau/demo-o-bureau/` | **GARDER** — vraie page indexée |
| `/en/services/productivity-consulting/office-booking/landing-demo-obureau/` | `src/content/services/en/productivity-consulting/office-booking/landing-demo-obureau.json` | non (noindex) | **OUI** `/en/expertise/productivity-consulting/office-booking/landing-demo-obureau/` | **GARDER** — vraie page indexée |

Le nom « démo » est trompeur : les deux dernières sont de vraies pages de
l'ancien site, présentes dans son plan de site. Les retirer créerait deux
404. **7 pages à retirer, pas 9.**

## À part : les adresses anciennes qui ne sont dans AUCUNE source

L'inventaire ci-dessus vient de deux fichiers : le plan de site en ligne et
l'export WordPress. Trois familles d'adresses leur échappent **par
construction**, et elles répondent toutes `200` sur le site actuel.

| Famille | Exemples | Combien | Règle aujourd'hui |
| --- | --- | --- | --- |
| Redirections du plugin WordPress | `/solution/centre-operationnel-de-securite/` (4 144 clics) | 98 règles, 41 381 clics | aucune |
| Archives de catégories | `/categorie/articles/`, `/en/category/posts/` | 7 | aucune |
| Pages d'auteur | `/auteur/julieroy/` | 3 | aucune |
| Flux RSS | `/feed/`, `/en/feed/` | 2 + par catégorie | aucune |
| Pagination | `/ressources/page/2/` | ~7 | aucune |
| Ancien plan de site | `/sitemap_index.xml`, `/post-sitemap.xml` | 6 | aucune |
| Fichiers téléversés | `/wp-content/uploads/…` | 943 catalogués, 174 conservés | aucune |

Le détail et la décision à prendre pour chacune : **`docs/migration/plan-redirections.md`**.

