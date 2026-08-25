# Inventaire de contenu — migration victrix.ca (WordPress → Astro)

> Généré le 2026-07-24 par `scripts/migration/build-inventory.mjs` à partir de :
> - Export WXR : `C:\Repo\Victrix\siteWP\export\` (18 fichiers XML du 2026-07-23)
> - Dump SQL : `C:\Repo\Victrix\siteWP\victrix_bdd.sql` (293 Mo, préfixe `vic_`)
>
> **Objectif : ne rien perdre dans la migration.** Annexes machine-exploitables dans `docs/migration/`.

## 1. Vue d'ensemble du site source

| | |
|---|---|
| URL | https://www.victrix.ca |
| Nom | Victrix |
| Langues | **FR (fr_CA, défaut, racine `/`) + EN (en_CA, préfixe `/en/`)** via Polylang Pro |
| Thème | `victrix/resources` — thème custom **Sage/Roots** (templates Blade) |
| Permaliens | `/%postname%/` |
| Page d'accueil | Accueil (id 2) |
| Page du blogue | Ressources (id 64) — `/ressources/` |
| Fuseau | America/Toronto |
| Contenus publiés | 24 pages · 62 articles · 73 expertises · 4 téléchargements |
| Médias | 943 fichiers (médiathèque) |
| Commentaires | 0 (désactivés) |

### Plugins actifs (26)

| Plugin | Rôle / impact migration |
|---|---|
| `polylang-pro/polylang.php` | Multilingue FR/EN (Pro) — routing `/` + `/en/`, paires de traduction |
| `gravityforms/gravityforms.php` | Formulaires (17 formulaires, 5 200 entrées) |
| `akismet/akismet.php` | Anti-spam |
| `axeptio-sdk-integration/axeptio-wordpress-plugin.php` | Consentement cookies (Axeptio, config côté SaaS) |
| `better-wp-security/better-wp-security.php` | Sécurité (SolidWP/iThemes) — sans objet en statique |
| `brizy/brizy.php` | Page builder Brizy (27 contenus) |
| `classic-editor/classic-editor.php` | Éditeur classique |
| `cmb2/init.php` | Framework de champs méta (peu utilisé : cta_text/cta_link) |
| `code-snippets/code-snippets.php` | Snippets PHP — 2 actifs : tracking Microsoft Clarity + ZoomInfo |
| `copy-delete-posts/copy-delete-posts.php` | Utilitaire de duplication — sans objet |
| `disable-comments/disable-comments.php` | Désactive les commentaires (0 commentaire sur le site) |
| `download-monitor/download-monitor.php` | Téléchargements protégés par formulaire (5 documents) |
| `head-footer-code/head-footer-code.php` | Injection de scripts head/footer (métas hefo_*) |
| `post-smtp/postman-smtp.php` | Envoi SMTP des notifications (formulaires) |
| `redirection/redirection.php` | Redirections 301 (85 règles) + logs 404 |
| `safe-svg/safe-svg.php` | Upload SVG sécurisé (154 SVG en médiathèque) |
| `siteorigin-panels/siteorigin-panels.php` | Page builder SiteOrigin Panels (133 contenus) |
| `so-widgets-bundle/so-widgets-bundle.php` | Widgets SiteOrigin (850 widgets dans les contenus) |
| `tinymce-advanced/tinymce-advanced.php` | Éditeur enrichi |
| `victrix-product-table/victrix-product-table.php` | ⚠️ Plugin CUSTOM — shortcode `[victrix_table]` (tableaux produits/prix) |
| `wordpress-seo/wp-seo.php` | Yoast SEO (titles, meta descriptions, sitemap) |
| `wp-consent-api/wp-consent-api.php` | API consentement (liaison Axeptio) |
| `wp-downgrade/wp-downgrade.php` | Épinglage de version WP — sans objet |
| `wp-security-audit-log/wp-security-audit-log.php` | Journal d'audit — sans objet |
| `wp-smushit/wp-smush.php` | Optimisation images — remplacé par le pipeline Astro |
| `wp-super-cache/wp-cache.php` | Cache — sans objet en statique |

Plugins **inactifs** notables : Smart Slider 3 (2 sliders de démo uniquement — **à ignorer**).

## 2. Pages (27)

| Titre | Chemin | Langue | Statut | Moteur | Template |
|---|---|---|---|---|---|
| Check Point Price List | `/en/check-point-price-list/` | en | publié | brizy | brizy-blank-template.php |
| Holiday Wishes | `/en/holiday-wishes/` | en | publié | brizy | brizy-blank-template.php |
| Thank you page | `/en/thank-you-page/` | en | publié | siteorigin | default |
| Contact us | `/en/contact/` | en | publié | siteorigin | default |
| Privacy Policy | `/en/privacy-policy/` | en | publié | gutenberg | views/template-legal.blade.php |
| Terms of use | `/en/terms-of-use/` | en | publié | html | views/template-legal.blade.php |
| No access | `/en/no-access/` | en | publié | vide | default |
| Customer Portal | `/en/customer-portal/` | en | publié | siteorigin | default |
| Resources center | `/en/resources-center/` | en | publié | vide | default |
| Careers | `/en/careers/` | en | publié | siteorigin | views/page-content.blade.php |
| Discover Victrix | `/en/discover-victrix/` | en | publié | siteorigin | views/page-content.blade.php |
| Home | `/en/` | en | publié | siteorigin | default |
| Liste de prix Check Point | `/liste-prix-check-point/` | fr | publié | brizy | brizy-blank-template.php |
| Voeux des fêtes | `/voeux-des-fetes/` | fr | publié | brizy | brizy-blank-template.php |
| Page de remerciement | `/page-de-remerciement/` | fr | publié | siteorigin | default |
| Évènement Victrix x Cask x Service Now - Mardi 20 mai 2025 | `/?page_id=7126` | fr | **brouillon** | siteorigin | default |
| « Êtes-vous en sécurité ? » Améliorez votre cybersécurité avec Victrix | `/?page_id=4989` | fr | **brouillon** | siteorigin | default |
| Diner Victrix et Palo Alto | `/?page_id=3743` | fr | **brouillon** | siteorigin | default |
| Accès interdit | `/no-access/` | fr | publié | shortcode-seul | default |
| Carrière | `/carriere/` | fr | publié | siteorigin | views/page-content.blade.php |
| Portail client | `/mon-portail/` | fr | publié | siteorigin | default |
| Ressources | `/ressources/` | fr | publié | vide | default |
| Contact | `/contact/` | fr | publié | siteorigin | default |
| Découvrir Victrix | `/decouvrir-victrix/` | fr | publié | siteorigin | views/page-content.blade.php |
| Conditions d'utilisation | `/conditions-dutilisation/` | fr | publié | html | views/template-legal.blade.php |
| Politique de confidentialité | `/politique-de-confidentialite/` | fr | publié | gutenberg | views/template-legal.blade.php |
| Accueil | `/` | fr | publié | siteorigin | default |

Notes :
- 4 pages sont pilotées par **template Blade du thème** (contenu hors export : `template-legal.blade.php`, `page-content.blade.php`) — le rendu réel devra être récupéré sur le site live (Ressources / Resources center notamment).
- `no-access` (FR+EN) = page technique Download Monitor (`[dlm_no_access]`).
- 3 brouillons (landings d'événements passés) : à confirmer s'ils sont à migrer ou à abandonner.

## 3. Articles de blogue (64)

Page d'index : `/ressources/` (10 articles/page, pagination `/page/N/`).

| Titre | Chemin | Langue | Statut | Date | Catégorie | Auteur |
|---|---|---|---|---|---|---|
| Meilleures pratiques en sécurité opérationnelle : La maintenance | `/partie-1-meilleures-pratiques-en-securite-operationnelle-la-maintenance/` | fr | publié | 2022-05-11 | Nos vidéos | admin@victrix |
| Meilleures pratiques en sécurité opérationnelle : La surveillance | `/partie-2-meilleures-pratiques-en-securite-operationnelle-la-surveillance/` | fr | publié | 2022-05-11 | Nos vidéos | admin@victrix |
| Meilleures pratiques en sécurité opérationnelle : La défense | `/partie-3-meilleures-pratiques-en-securite-operationnelle-la-defense/` | fr | publié | 2022-05-11 | Nos vidéos | admin@victrix |
| Best Practices in Operational Safety : Maintenance | `/en/best-practices-in-operational-safety-maintenance/` | en | publié | 2022-05-11 | Our videos | admin@victrix |
| Best Practices in Operational Security : Monitoring | `/en/part-2-best-practices-in-operational-security-monitoring/` | en | publié | 2022-05-11 | Our videos | admin@victrix |
| Best Practices in Operational Security : Defense | `/en/part-3-best-practices-in-operational-security-defense/` | en | publié | 2022-05-11 | Our videos | admin@victrix |
| Une journée dans la vie d’un analyste en sécurité des opérations | `/une-journee-dans-la-vie-secops/` | fr | publié | 2022-10-19 | Nos vidéos | BMI |
| Gestion des activités de recouvrement amiable et contentieux  | `/?p=3683` | fr | **brouillon** | 2022-10-26 | Nos articles | BMI |
| Organisme sans but lucratif en information juridique | `/?p=3975` | fr | **brouillon** | 2022-10-26 | Nos articles | BMI |
| Les équipes de la Société Conseil Lambda rejoignent les équipes Victrix | `/societe-conseil-lambda-victrix/` | fr | publié | 2023-07-05 | Nos actualités | BMI |
| Externalisation du SOC: avantages & inconvénients | `/externalisation-soc-avantages-inconvenients/` | fr | publié | 2023-10-04 | Nos articles | admin@victrix |
| SOC Outsourcing for SMBs: Pros & Cons | `/en/soc-outsourcing-pros-cons/` | en | publié | 2023-10-04 | Our articles | admin@victrix |
| Zero Trust Network Access (ZTNA): modèle de cybersécurité optimal | `/zero-trust-network-access-ztna/` | fr | publié | 2023-10-18 | Nos articles | admin@victrix |
| Zero Trust Network Access (ZTNA): Ultimate Cybersecurity Model | `/en/zero-trust-network-access-ztna/` | en | publié | 2023-10-18 | Our articles | admin@victrix |
| SASE Cloud: Qu’est-ce que le Secure Access Service Edge? | `/sase-cloud/` | fr | publié | 2023-11-02 | Nos articles | admin@victrix |
| SASE Cloud: What Is Secure Access Service Edge? | `/en/sase-cloud/` | en | publié | 2023-11-02 | Our articles | admin@victrix |
| Ransomware: 8 Ransomware Protection Tips for Organizations | `/en/ransomware-protection-tips/` | en | publié | 2023-11-30 | Our articles | admin@victrix |
| Ransomware (rançongiciels): 8 façons de se protéger | `/ransomware-rancongiciels/` | fr | publié | 2023-11-30 | Nos articles | admin@victrix |
| Démystifier les applications Microsoft Viva | `/applications-microsoft-viva-demystifier-viva/` | fr | publié | 2024-02-15 | Nos articles | admin@victrix |
| Demystifying All Microsoft Viva Apps | `/en/microsoft-viva-apps/` | en | publié | 2024-02-15 | Our articles | admin@victrix |
| Gouvernance Power Platform: Conseils et accompagnement | `/gouvernance-power-platform-conseils/` | fr | publié | 2024-05-03 | Nos articles | admin@victrix |
| Power Platform Governance: Advice and Support | `/en/power-platform-governance-advice/` | en | publié | 2024-08-15 | Our articles | admin@victrix |
| Loi 25: protection des renseignements personnels au Québec | `/loi-25-donnees-personnelles-guide/` | fr | publié | 2024-09-09 | Nos articles | admin@victrix |
| Law 25: Personal Data Protection in Quebec | `/en/law-25-personal-data-guide/` | en | publié | 2024-09-12 | Our articles | admin@victrix |
| Victrix développe son offre cybersécurité en France | `/developpement-offre-cybersecurite-france/` | fr | publié | 2024-09-16 | Nos actualités | admin@victrix |
| Victrix expands its cybersecurity offering in France | `/en/expands-cybersecurity-offering-france/` | en | publié | 2024-09-16 | Our news | admin@victrix |
| Sécurité IoT: Comprendre les défis pour les entreprises | `/securite-iot-defis/` | fr | publié | 2024-09-30 | Nos articles | admin@victrix |
| IoT Security: Understanding the Challenges for Enterprises | `/en/iot-security-challenges/` | en | publié | 2024-09-30 | Our articles | admin@victrix |
| Audit de cybersécurité: Gérer le risque et la conformité | `/audit-cybersecurite/` | fr | publié | 2024-10-08 | Nos articles | admin@victrix |
| Cybersecurity Risk Assessment Audit to Manage Risk & Compliance | `/en/cybersecurity-risk-audit/` | en | publié | 2024-10-08 | Our articles | admin@victrix |
| Réglementation DORA: mise en conformité du secteur financier | `/reglementation-dora/` | fr | publié | 2024-10-14 | Nos articles | admin@victrix |
| DORA Regulation: Compliance for the Financial Sector | `/en/dora-regulation/` | en | publié | 2024-10-14 | Our articles | admin@victrix |
| Pentest Cybersécurité: portrait complet de votre résilience | `/pentest-cybersecurite/` | fr | publié | 2024-10-17 | Nos articles | admin@victrix |
| Penetration Testing: A Holistic View of Your Resilience | `/en/penetration-testing/` | en | publié | 2024-10-17 | Our articles | admin@victrix |
| Nomination Dominic Lajoie - COO/CIO de Victrix | `/nomination-dominic-lajoie/` | fr | publié | 2024-11-14 | Nos articles | admin@victrix |
| Dominic Lajoie Appointed COO and CIO of Victrix | `/en/dominic-lajoie-appointed/` | en | publié | 2024-11-14 | Our news | admin@victrix |
| Comprendre la directive NIS2 pour assurer sa conformité | `/directive-nis2/` | fr | publié | 2024-11-27 | Nos articles | admin@victrix |
| Understanding the NIS2 Directive to Ensure Compliance | `/en/nis2-directive/` | en | publié | 2024-11-28 | Our articles | admin@victrix |
| Sécurité Internet des Objets: enjeux et solutions pour différents secteurs | `/securite-internet-des-objets/` | fr | publié | 2024-12-03 | Nos articles | admin@victrix |
| Internet of Things Security: Issues & Solutions for Diverse Sectors | `/en/internet-of-things-security/` | en | publié | 2024-12-04 | Our articles | admin@victrix |
| 8 Tendances TI en 2025: Repenser vos services TI pour plus d'efficacité | `/tendances-ti/` | fr | publié | 2025-01-17 | Nos articles | admin@victrix |
| 8 New Trends in IT in 2025: Rethinking Your IT Services for Greater Efficiency | `/en/it-trends/` | en | publié | 2025-01-17 | Our articles | Julie Roy |
| Démystifier les fonctionnalités de Microsoft Copilot et son intégration aux outils M365 | `/fonctionnalites-microsoft-copilot/` | fr | publié | 2025-01-29 | Nos articles | Julie Roy |
| Demystifying Microsoft Copilot Features and Integration with M365 Tools | `/en/microsoft-copilot-features/` | en | publié | 2025-01-29 | Our articles | Julie Roy |
| ServiceNow ITSM: Une stratégie axée affaires pour croître les opérations TI | `/servicenow-itsm/` | fr | publié | 2025-02-10 | Nos articles | Julie Roy |
| ServiceNow ITSM: Business-Led Strategy to Scale IT Operations | `/en/servicenow-itsm/` | en | publié | 2025-02-11 | Our articles | Julie Roy |
| Victrix announces the appointment of Dominic Lajoie as CEO | `/en/appointment-ceo/` | en | publié | 2025-03-05 | Our news | admin@victrix |
| Victrix annonce la nomination de Dominic Lajoie en tant que CEO | `/annonce-nomination-ceo/` | fr | publié | 2025-03-05 | Nos actualités | admin@victrix |
| Copilot vs ChatGPT: Adoptez l’IA la plus stratégique pour vos affaires | `/copilot-vs-chatgpt/` | fr | publié | 2025-03-18 | Nos articles | Julie Roy |
| Copilot vs ChatGPT: Adopt the Most Strategic AI for Your Business | `/en/chatgpt-vs-copilot/` | en | publié | 2025-03-18 | Our articles | Julie Roy |
| ServiceNow ITOM: modules, avantages, coût et ROI | `/servicenow-itom/` | fr | publié | 2025-05-07 | Nos articles | Julie Roy |
| ServiceNow ITOM: Modules, Benefits, Cost & ROI | `/en/servicenow-itom/` | en | publié | 2025-05-07 | Our articles | Julie Roy |
| Your Personalized Intelligent Agent: A Trusted AI Assistant | `/en/copilot-studio-agents/` | en | publié | 2025-07-03 | Our articles | Julie Roy |
| Votre agent intelligent sur mesure: votre assistant IA de confiance | `/agents-copilot-studio/` | fr | publié | 2025-07-03 | Nos articles | Julie Roy |
| Mise en place d’un SOC adapté à vos opérations TI  | `/mise-en-place-soc/` | fr | publié | 2025-07-10 | Nos articles | admin@victrix |
| Setting Up a SOC Aligned with Your IT Operations | `/en/setting-up-a-soc/` | en | publié | 2025-07-10 | Our articles | admin@victrix |
| Victrix Renews Its ISO 27001 and ISO 9001 Certifications: a Double Seal of Excellence and Trust | `/en/iso-27001-iso-9001-certifications/` | en | publié | 2025-07-29 | Our news | admin@victrix |
| Victrix renouvelle ses certifications ISO 27001 et ISO 9001 : un double sceau d’excellence et de confiance | `/certification-iso-27001-iso-9001/` | fr | publié | 2025-07-29 | Nos actualités | admin@victrix |
| Anticiper la fin du soutien de Windows 10 : une migration stratégique pour l’avenir de votre organisation | `/migration-windows-11-microsoft-exchange/` | fr | publié | 2025-08-04 | Nos articles | Julie Roy |
| Getting Ready For the End of Windows 10 Support: a Strategic Migration For the Future of Your Organization | `/en/migration-windows-11-microsoft-exchange/` | en | publié | 2025-08-04 | Our articles | Julie Roy |
| An Exclusive Partnership with a Canadian Leader in Extended Reality | `/en/extended-reality-xr-agc-partnership/` | en | publié | 2025-09-03 | Our news | admin@victrix |
| Un partenariat exclusif avec l'un des plus grands acteurs de la réalité étendue au Canada | `/realite-etendue-xr-partenariat-agc/` | fr | publié | 2025-09-03 | Nos actualités | admin@victrix |
| IA et ServiceNow: transformer la performance et la gouvernance IA de votre organisation | `/ia-servicenow/` | fr | publié | 2025-11-14 | Nos articles | Julie Roy |
| ServiceNow & AI: Transforming Your Organization’s Performance and AI Governance | `/en/servicenow-ai/` | en | publié | 2025-11-14 | Our articles | Julie Roy |

## 4. Expertises — CPT `expertise` (78)

**Type de contenu central du site** (63 des 99 items de menus pointent vers des expertises). Pas de taxonomie propre : classement **hiérarchique** par `post_parent` (jusqu'à 3 niveaux), URLs `/expertise/<parent>/<enfant>/`.

### Arborescence FR (41)

- **Conseil stratégique** — `/expertise/conseil-strategique/` *(siteorigin)*
  - **Loi 25: Êtes-vous en conformité?** — `/expertise/conseil-strategique/conformite-loi-25/` *(siteorigin)*
- **test- Conseil stratégique et informatique pour entreprise** — `/?post_type=expertise&p=5442` *(siteorigin)* — **draft**
- **Intelligence Artificielle** — `/expertise/intelligence-artificielle/` *(siteorigin)*
  - **Analyse des opportunités en intelligence artificielle** — `/expertise/intelligence-artificielle/analyse-opportunites-ia/` *(siteorigin)*
  - **Accompagnement en intelligence artificielle** — `/expertise/intelligence-artificielle/accompagnement/` *(siteorigin)*
  - **Landing – Accompagnement IA** — `/expertise/intelligence-artificielle/accompagnement-ia/` *(brizy)*
- **Licences et matériels** — `/expertise/approvisionnement-ti/` *(siteorigin)*
  - **Check Point** — `/expertise/approvisionnement-ti/check-point/` *(brizy)*
  - **Microsoft** — `/expertise/approvisionnement-ti/solutions-microsoft/` *(brizy)*
  - **ServiceNow** — `/expertise/approvisionnement-ti/servicenow/` *(brizy)*
  - **CrowdStrike** — `/expertise/approvisionnement-ti/crowdstrike-falcon/` *(brizy)*
  - **Zscaler** — `/expertise/approvisionnement-ti/zscaler/` *(brizy)*
  - **Solutions Cisco** — `/expertise/approvisionnement-ti/cisco/` *(brizy)*
  - **Palo Alto Networks FR** — `/expertise/approvisionnement-ti/palo-alto-networks/` *(brizy)*
  - **Dell Technologies FR** — `/expertise/approvisionnement-ti/dell-technologies/` *(brizy)*
  - **HPE Networking fr** — `/expertise/approvisionnement-ti/hpe-networking/` *(brizy)*
- **Services infonuagiques** — `/expertise/services-infonuagiques/` *(siteorigin)*
  - **Migration vers Microsoft Azure** — `/expertise/services-infonuagiques/migration-vers-azure/` *(siteorigin)*
  - **Services AWS par des experts infonuagiques** — `/expertise/services-infonuagiques/services-aws/` *(siteorigin)*
- **La cybersécurité au service de vos affaires** — `/expertise/cybersecurite/` *(siteorigin)*
  - **Sécurité informatique et réseau** — `/?post_type=expertise&p=112` *(siteorigin)* — **draft**
  - **Internet des objets (IoT) - Cybersécurité robuste avec Check Point** — `/?post_type=expertise&p=6323` *(siteorigin)* — **draft**
  - **Centre opérationnel de sécurité (SOC) évolutif** — `/expertise/cybersecurite/centre-operationnel-de-securite-evolutif/` *(siteorigin)*
  - **Pentest: testez votre sécurité informatique** — `/expertise/cybersecurite/test-intrusion-pentest/` *(siteorigin)*
  - **Internet des objets IdO/IoT & OT — sécurité des objets connectés** — `/expertise/cybersecurite/internet-des-objets-service-iot/` *(siteorigin)*
  - **Passez au modèle de cybersécurité Zero Trust** — `/expertise/cybersecurite/zero-trust/` *(siteorigin)*
  - **Portail Cybersécurité Votre outil d’évaluation intégré** — `/?post_type=expertise&p=5437` *(siteorigin)* — **draft**
  - **Cybersécurité dans le secteur de la santé** — `/expertise/cybersecurite/cybersecurite-sante/` *(siteorigin)*
- **Productivité** — `/expertise/productivite/` *(siteorigin)*
  - **Dynamics 365 Field Service** — `/expertise/productivite/dynamics-365-field-service/` *(siteorigin)*
  - **Ø Studio** — `/expertise/productivite/o-studio/` *(siteorigin)*
  - **Plateforme Expérience Employé** — `/expertise/productivite/plateforme-employe-intranet/` *(siteorigin)*
  - **Copilot pour Microsoft 365** — `/expertise/productivite/copilot-microsoft-365/` *(siteorigin)*
  - **Copilot Studio** — `/expertise/productivite/copilot-studio/` *(siteorigin)*
  - **ServiceNow** — `/expertise/productivite/servicenow/` *(siteorigin)*
  - **O bureau** — `/expertise/productivite/o-bureau/` *(siteorigin)*
    - **Landing Démo O bureau** — `/expertise/productivite/o-bureau/demo-o-bureau/` *(brizy)*
    - **Protégé : Documents O bureau** — `/expertise/productivite/o-bureau/documents-o-bureau/` *(brizy)* 🔒 *(protégé par mot de passe)*
- **Services Gérés** — `/expertise/services-ti-geres/` *(siteorigin)*
  - **Maximisez l’utilisation de votre écosystème M365** — `/expertise/services-ti-geres/maximisez-lutilisation-de-votre-ecosysteme-m365/` *(siteorigin)*

### Arborescence EN (37)

- **Strategic Consulting** — `/en/expertise/strategic-advice/` *(siteorigin)*
  - **Law 25: Are you compliant?** — `/en/expertise/strategic-advice/law-25-compliance/` *(siteorigin)*
- **Artificial Intelligence** — `/en/expertise/artificial-intelligence/` *(siteorigin)*
  - **Artificial Intelligence Opportunity Analysis** — `/en/expertise/artificial-intelligence/ai-opportunity-analysis/` *(siteorigin)*
  - **Artificial Intelligence Consulting** — `/en/expertise/artificial-intelligence/consulting/` *(siteorigin)*
  - **Landing – AI Consulting** — `/en/expertise/artificial-intelligence/landing-ai-consulting/` *(brizy)*
- **Licenses and Equipments** — `/en/expertise/it-procurement/` *(siteorigin)*
  - **Check Point** — `/en/expertise/it-procurement/check-point/` *(brizy)*
  - **Microsoft** — `/en/expertise/it-procurement/microsoft-solutions/` *(brizy)*
  - **ServiceNow** — `/en/expertise/it-procurement/servicenow/` *(brizy)*
  - **CrowdStrike Falcon** — `/en/expertise/it-procurement/crowdstrike-falcon/` *(brizy)*
  - **Zscaler Solutions** — `/en/expertise/it-procurement/zscaler/` *(brizy)*
  - **Cisco** — `/en/expertise/it-procurement/cisco/` *(brizy)*
  - **Palo Alto Networks** — `/en/expertise/it-procurement/palo-alto-networks/` *(brizy)*
  - **Dell Technologies** — `/en/expertise/it-procurement/dell-technologies/` *(brizy)*
  - **HPE Networking** — `/en/expertise/it-procurement/hpe-networking/` *(brizy)*
- **Cloud Services for Businesses** — `/en/expertise/cloud-services-provider/` *(siteorigin)*
  - **Acceleration of Your Azure Migration** — `/en/expertise/cloud-services-provider/azure-migration/` *(siteorigin)*
  - **AWS Services by Cloud Experts** — `/en/expertise/cloud-services-provider/aws-services/` *(siteorigin)*
- **Cybersecurity as a Business Asset** — `/en/expertise/cybersecurity/` *(siteorigin)*
  - **Scalable Security Operations Center** — `/en/expertise/cybersecurity/scalable-security-operations-center/` *(siteorigin)*
  - **Pentest: improve your security posture** — `/en/expertise/cybersecurity/pentest/` *(siteorigin)*
  - **Internet of Things — OT & IoT Security Services** — `/en/expertise/cybersecurity/internet-of-things-iot/` *(siteorigin)*
  - **Move to the Zero Trust Cybersecurity Model** — `/en/expertise/cybersecurity/zero-trust/` *(siteorigin)*
  - **Cybersecurity Portal Your Integrated Cybersecurity Tool** — `/en/?post_type=expertise&p=5579` *(siteorigin)* — **draft**
  - **Cybersecurity in the Healthcare Sector** — `/en/expertise/cybersecurity/cybersecurity-healthcare/` *(siteorigin)*
- **Productivity Consulting** — `/en/expertise/productivity-consulting/` *(siteorigin)*
  - **Dynamics 365 Field Service** — `/en/expertise/productivity-consulting/dynamics-365-field-service/` *(siteorigin)*
  - **Ø Studio** — `/en/expertise/productivity-consulting/o-studio/` *(siteorigin)*
  - **Office booking app** — `/en/expertise/productivity-consulting/office-booking/` *(siteorigin)*
    - **Landing Démo O bureau EN** — `/en/expertise/productivity-consulting/office-booking/landing-demo-obureau/` *(brizy)*
  - **EMPLOYEE EXPERIENCE PLATFORM** — `/en/expertise/productivity-consulting/employee-platform-intranet/` *(siteorigin)*
  - **Copilot for Microsoft 365** — `/en/expertise/productivity-consulting/copilot-for-microsoft-365/` *(siteorigin)*
  - **Copilot Studio** — `/en/expertise/productivity-consulting/copilot-studio/` *(siteorigin)*
  - **ServiceNow** — `/en/expertise/productivity-consulting/servicenow/` *(siteorigin)*
- **Managed Services** — `/en/expertise/managed-it-services/` *(siteorigin)*
  - **Maximize the use of your M365 ecosystem** — `/en/expertise/managed-it-services/maximize-the-use-of-your-m365-ecosystem/` *(siteorigin)*

## 5. Téléchargements — Download Monitor (5 documents, 21 versions)

- **Votre cybersécurité en accéléré -  SEvOC** — `/document/cybersecurite/` (publié) — catégorie « Nos livres blancs »
  - fichier : `/wp-content/uploads/0206/05/livret-victrix.pdf`
- **Pourquoi gérez-vous encore vos TI ?** — `/document/pourquoi-gerez-vous-encore-vos-ti/` (publié) — catégorie « Nos livres blancs »
  - fichier : `/wp-content/uploads/dlm_uploads/2023/02/livret-services-geres.pdf`
- **Licences Microsoft Power Platform: comment s’y retrouver?** — `/document/licences-microsoft-power-platform/` (publié) — catégorie « Nos livres blancs »
  - fichier : `/wp-content/uploads/dlm_uploads/2024/03/guide-licence-powerplatform-2024.pdf`
- **Microsoft Copilot : Cas pratiques et conseils pour une adoption réussie** — `/?post_type=dlm_download&p=6663` (**brouillon**) — catégorie « Nos vidéos »
  - fichier : `https://youtu.be/RjIs8tCmcNw`
- **Webinaire Copilot - Du buzz à l'impact réel** — `/document/webinaire-copilot-buzz-impact/` (publié) — catégorie « Nos livres blancs »
  - fichier : `/wp-content/uploads/dlm_uploads/2025/09/copilot-du-buzz-a-limpact-reel_support-presentation_2025-09-25_compressed.pdf`

Versions sans rattachement direct (fichiers listés dans les métas `_files` des 21 versions) : voir `urls-medias.csv` + liste complète ci-dessus. **⚠️ Les fichiers sous `/wp-content/uploads/dlm_uploads/` sont protégés par le plugin** (accès conditionné au formulaire GF #3) : à télécharger avec un accès admin avant la mise hors ligne. Certains anciens PDF vivent dans le dossier anormal `/uploads/0206/05/` (date corrompue). Le « Webinaire Copilot » pointe vers YouTube (https://youtu.be/RjIs8tCmcNw), pas un fichier.

Tables e-commerce DLM (`dlm_order*`) : **vides** — aucun paiement à migrer.

## 6. Taxonomies

- **Catégories** (seule taxonomie éditoriale — aucune étiquette/post_tag n'existe). Portées par les articles **et par les téléchargements** (« Nos livres blancs » = les 4 documents publiés) :

| Catégorie | Slug | Contenus | URL d'archive (vérifiée live) |
|---|---|---|---|
| Nos articles | `articles` | 23 | `/categorie/articles/` |
| Our articles | `posts` | 22 | `/en/category/posts/` |
| Nos actualités | `nos-actualites` | 5 | `/categorie/nos-actualites/` |
| Our news | `our-news` | 5 | `/en/category/our-news/` |
| Nos livres blancs | `livres-blancs` | 4 | `/categorie/livres-blancs/` |
| Nos vidéos | `videos` | 4 | `/categorie/videos/` |
| Our videos | `videos` | 3 | `/en/category/videos/` |
| Nos études de cas | `etudes-de-cas` | 0 | *(vide — ne pas migrer)* |
| Our white papers | `white-papers` | 0 | *(vide — ne pas migrer)* |
| Our case studies | `case-studies` | 0 | *(vide — ne pas migrer)* |

  Base d'archive **traduite par Polylang** : `/categorie/…` en FR, `/en/category/…` en EN (vérifié sur le site live ; `/category/…` FR fait un 301 vers `/categorie/…`).

- **Taxonomies techniques Polylang** : `language` (fr/en) et `post_translations` (83 paires FR↔EN reconstruites depuis le SQL — colonne `traduction_id` de `urls-contenus.csv`).
- Le CPT `expertise` n'a **aucune taxonomie** (hiérarchie par pages parentes).

## 7. Menus de navigation (reconstruits depuis le SQL — absents de l'export XML)

Emplacements du thème : `primary_navigation` → Menu principal · `footer_navigation` → Footer · `legal_navigation` → Legal · `surmenu_navigation` → non assigné · `footerapropos_navigation` → non assigné

### Menu principal (31 items, emplacement `primary_navigation`)

- Découvrir Victrix — `/decouvrir-victrix/`
- Expertises — `/expertise/conseil-strategique/`
  - Conseil stratégique — `/expertise/conseil-strategique/`
    - Conformité Loi 25 — `/expertise/conseil-strategique/conformite-loi-25/`
  - Infonuagique — `/expertise/services-infonuagiques/`
    - Microsoft Azure — `/expertise/services-infonuagiques/migration-vers-azure/`
    - Amazon Web Services — `/expertise/services-infonuagiques/services-aws/`
  - Cybersécurité — `/expertise/cybersecurite/`
    - Centre opérationnel de sécurité (SOC) évolutif — `/expertise/cybersecurite/centre-operationnel-de-securite-evolutif/`
    - Tests d’intrusion — `/expertise/cybersecurite/test-intrusion-pentest/`
    - IoT et OT — `/expertise/cybersecurite/internet-des-objets-service-iot/`
  - Productivité — `/expertise/productivite/`
    - Ø Studio — `/expertise/productivite/o-studio/`
    - Intelligence Artificielle — `/expertise/intelligence-artificielle/`
    - Plateforme employé et intranet — `/expertise/productivite/plateforme-employe-intranet/`
    - ServiceNow — `/expertise/productivite/servicenow/`
    - Dynamics 365 Field Service — `/expertise/productivite/dynamics-365-field-service/`
    - Copilot pour Microsoft 365 — `/expertise/productivite/copilot-microsoft-365/`
    - Copilot Studio — `/expertise/productivite/copilot-studio/`
    - O bureau — `/expertise/productivite/o-bureau/`
  - Services gérés — `/expertise/services-ti-geres/`
    - Services TI gérés — `/expertise/services-ti-geres/` *(lien custom)*
    - Environnement Microsoft 365 — `/expertise/services-ti-geres/maximisez-lutilisation-de-votre-ecosysteme-m365/`
- Produits — `https://o-studio-catalogue.victrix.ca` *(lien custom)*
  - Catalogue Ø Studio — `https://o-studio-catalogue.victrix.ca` *(lien custom)*
  - Licences et matériels — `/expertise/approvisionnement-ti/`
- Carrière — `/carriere/`
- Contact — `/contact/`
- Ressources — `/ressources/`
- Portail client — `/mon-portail/`
- Langues — `#pll_switcher` *(lien custom)*

### Legal (2 items, emplacement `legal_navigation`)

- Conditions d’utilisation — `/conditions-dutilisation/`
- Politique de confidentialité — `/politique-de-confidentialite/`

### Footer (16 items, emplacement `footer_navigation`)

- Expertises — `#` *(lien custom)*
  - Conseil stratégique — `/expertise/conseil-strategique/`
  - Infonuagique — `/expertise/services-infonuagiques/`
  - Cybersécurité — `/expertise/cybersecurite/`
  - Productivité — `/expertise/productivite/`
  - Intelligence artificielle — `/expertise/intelligence-artificielle/`
  - Services gérés — `/expertise/services-ti-geres/`
- Produits — `https://o-studio-catalogue.victrix.ca` *(lien custom)*
  - Licences et matériels — `/expertise/approvisionnement-ti/`
  - Plateforme employé et intranet — `/expertise/productivite/plateforme-employe-intranet/`
  - O bureau — `/expertise/productivite/o-bureau/`
-   — `#` *(lien custom)*
  - À propos — `/decouvrir-victrix/`
  - Carrière & Vie@Victrix — `/carriere/`
  - Ressources — `/ressources/`
  - Tarification — `/liste-prix-check-point/`

### Footer EN (16 items)

- Expertises — `#` *(lien custom)*
  - Strategic Consulting — `/en/expertise/strategic-advice/`
  - Cloud — `/en/expertise/cloud-services-provider/`
  - Cybersecurity — `/en/expertise/cybersecurity/`
  - Productivity — `/en/expertise/productivity-consulting/`
  - Artificial Intelligence — `/en/expertise/artificial-intelligence/`
  - Managed Services — `/en/expertise/managed-it-services/`
- Products — `https://o-studio-catalogue.victrix.ca` *(lien custom)*
  - Licenses and Equipments — `/en/expertise/it-procurement/`
  - Intranet—Employee Experience Platform — `/en/expertise/productivity-consulting/employee-platform-intranet/`
  - Office booking app — `/en/expertise/productivity-consulting/office-booking/`
-   — `#` *(lien custom)*
  - About us — `/en/discover-victrix/`
  - Careers & Life@Victrix — `/en/careers/`
  - Blog — `/en/resources-center/`
  - Pricing — `/en/check-point-price-list/`

### Legal EN (2 items)

- Terms of use — `/en/terms-of-use/`
- Privacy Policy — `/en/privacy-policy/`

### MainMenu EN (31 items)

- Discover Victrix — `/en/discover-victrix/`
- Expertises — `/en/expertise/strategic-advice/`
  - Strategic Consulting — `/en/expertise/strategic-advice/`
    - Law 25 Compliance — `/en/expertise/strategic-advice/law-25-compliance/`
  - Cloud — `/en/expertise/cloud-services-provider/`
    - Microsoft Azure — `/en/expertise/cloud-services-provider/azure-migration/`
    - Amazon Web Services — `/en/expertise/cloud-services-provider/aws-services/`
  - Cybersecurity — `/en/expertise/cybersecurity/`
    - Scalable Security Operations Center — `/en/expertise/cybersecurity/scalable-security-operations-center/`
    - OT and IoT — `/en/expertise/cybersecurity/internet-of-things-iot/`
    - Pentest — `/en/expertise/cybersecurity/pentest/`
  - Productivity — `/en/expertise/productivity-consulting/`
    - Ø Studio — `/en/expertise/productivity-consulting/o-studio/`
    - Artificial Intelligence — `/en/expertise/artificial-intelligence/`
    - Intranet — Employee Experience Platform — `/en/expertise/productivity-consulting/employee-platform-intranet/`
    - ServiceNow — `/en/expertise/productivity-consulting/servicenow/`
    - Dynamics 365 Field Service — `/en/expertise/productivity-consulting/dynamics-365-field-service/`
    - Copilot for Microsoft 365 — `/en/expertise/productivity-consulting/copilot-for-microsoft-365/`
    - Copilot Studio — `/en/expertise/productivity-consulting/copilot-studio/`
    - Office booking app — `/en/expertise/productivity-consulting/office-booking/`
  - Managed Services — `/en/expertise/managed-it-services/`
    - Managed IT Services — `/en/expertise/managed-it-services/` *(lien custom)*
    - M365 Ecosystem — `/en/expertise/managed-it-services/maximize-the-use-of-your-m365-ecosystem/`
- Products — `https://o-studio-catalogue.victrix.ca/` *(lien custom)*
  - Ø Studio App Store — `https://o-studio-catalogue.victrix.ca/` *(lien custom)*
  - Licenses and Equipments — `/en/expertise/it-procurement/`
- Careers — `/en/careers/`
- Contact — `/en/contact/`
- Resources — `/en/resources-center/`
- My Portal — `/en/customer-portal/`
- Langues — `#pll_switcher` *(lien custom)*

Structure machine-exploitable : `docs/migration/menus.json`.

## 8. Formulaires — Gravity Forms (17 formulaires, 5200 entrées)

| # | Titre | État | Entrées | Embarqué dans |
|---|---|---|---|---|
| 1 | Contactez-nous ! | ✅ actif | 2465 | `/contact/`, `/en/contact/` |
| 2 | Infolettre | inactif | 1776 | — |
| 3 | Téléchargement de documents | ✅ actif | 334 | — |
| 4 | Inscription événement du 20 mai 2025 : Victrix x Cask x ServiceNow | 🗑️ corbeille | 32 | `/?page_id=3743` |
| 5 | Loi 25 | inactif | 86 | — |
| 6 | Téléchargement - Licences Power Platform | 🗑️ corbeille | 0 | — |
| 7 | Test Loi 25 | ✅ actif | 370 | — |
| 8 | Demandez votre campagne de tests d'intrusion | ✅ actif | 51 | — |
| 9 | Formulaire Cyber - Google Ads | inactif | 20 | — |
| 10 | Contactez-nous ! (1) | 🗑️ corbeille | 1 | — |
| 11 | Inscription Evénement du 20 mai 2025 - Victrix x Cask x ServiceNow | 🗑️ corbeille | 0 | — |
| 12 | Inscription - Évènement IA & ServiceNow | inactif | 41 | `/?page_id=7126` |
| 13 | Approvisionnement en TI | ✅ actif | 3 | `/en/expertise/it-procurement/check-point/`, `/expertise/approvisionnement-ti/check-point/`, `/expertise/approvisionnement-ti/solutions-microsoft/`, `/en/expertise/it-procurement/microsoft-solutions/`, `/expertise/approvisionnement-ti/servicenow/`, `/en/expertise/it-procurement/servicenow/`, `/expertise/approvisionnement-ti/crowdstrike-falcon/`, `/en/expertise/it-procurement/crowdstrike-falcon/`, `/expertise/approvisionnement-ti/zscaler/`, `/en/expertise/it-procurement/zscaler/`, `/en/expertise/it-procurement/cisco/`, `/expertise/approvisionnement-ti/cisco/`, `/expertise/approvisionnement-ti/palo-alto-networks/`, `/en/expertise/it-procurement/palo-alto-networks/`, `/expertise/approvisionnement-ti/dell-technologies/`, `/en/expertise/it-procurement/dell-technologies/`, `/expertise/approvisionnement-ti/hpe-networking/`, `/en/expertise/it-procurement/hpe-networking/` |
| 14 | Demande de démo O bureau | ✅ actif | 4 | `/expertise/productivite/o-bureau/demo-o-bureau/`, `/en/expertise/productivity-consulting/office-booking/landing-demo-obureau/` |
| 15 | Approvisionnement TI Check Point | ✅ actif | 13 | `/liste-prix-check-point/`, `/en/check-point-price-list/` |
| 16 | Formulaire Consultation IA | 🗑️ corbeille | 0 | — |
| 17 | Planifiez une consultation IA | ✅ actif | 4 | `/expertise/intelligence-artificielle/accompagnement-ia/`, `/en/expertise/artificial-intelligence/landing-ai-consulting/` |

*(« Embarqué dans » = détection des shortcodes `[gravityform]` **et** des widgets SiteOrigin `"form":"N"` dans le contenu exporté.)*

### Champs des formulaires actifs

- **#1 Contactez-nous !** : Prénom* · Nom* · Courriel* · Téléphone · De quoi souhaitez-vous parler ?* · Expertise* · Précisez votre demande · Message*
- **#3 Téléchargement de documents** : Prénom* · Nom* · Entreprise* · Courriel Professionnel* · Document ID · Document Title
- **#7 Test Loi 25** : 1. Leadership et transparence : Avez-vous désigné une personne responsable de la protection des renseignements personnels (RPRP) et publié ses coordonnées ainsi que votre politique de confidentialité et de sécurité sur votre site web ?* · 2.	Consentement clair : Vos méthodes de collecte des données personnelles permettent-elles de conserver et de respecter les directives de consentement établies par la loi, et informez-vous clairement sur les finalités et les moyens de la collecte ?* · 3. Contrats avec les fournisseurs : Avez-vous audité et ajusté vos ententes avec les fournisseurs de services pour inclure des protections des données personnelles, surtout pour celles qui traversent les frontières, et avez-vous évalué les risques pour la vie privée ?* · 4. Préparation et réponse aux incidents : Disposez-vous d'un plan d'intervention rapide en cas d'incident de sécurité ou de confidentialité, tenez-vous un registre des incidents de confidentialité, et avez-vous mis en place des mesures de sensibilisation en cybersécurité pour vos employés ?* · 5.	Innovation et confidentialité : Vos technologies intègrent-elles les principes de confidentialité dès la conception et assurent-elles, par défaut, la protection des données des utilisateurs en matière d'identification, de localisation et de profilage, sans nécessiter d'intervention de l'utilisateur ?*
- **#8 Demandez votre campagne de tests d'intrusion** : Nom* · Fonction* · Entreprise* · Courriel professionnel*
- **#13 Approvisionnement en TI** : Prénom* · Nom* · Courriel* · Entreprise · Produit* · Message*
- **#14 Demande de démo O bureau** : Prénom* · Nom* · Courriel* · Entreprise · Message*
- **#15 Approvisionnement TI Check Point** : Prénom* · Nom* · Courriel* · Nom de l'organisation publique · Rôle* · Téléphone · SKU Sélectionné* · Quantité à commander* · Message*
- **#17 Planifiez une consultation IA** : Prénom* · Nom* · Courriel* · Entreprise · Votre contexte et vos ambitions IA*

(* = requis)

**⚠️ À décider pour le statique** : service de remplacement (CloudCannon Forms, Formspark, Web3Forms, worker Cloudflare…), destination des notifications (actuellement Post SMTP), et **export des 5200 entrées existantes (leads !) avant décommission** — voir §15.

## 9. Médias (943 fichiers)

Domaine unique `https://www.victrix.ca/wp-content/uploads/AAAA/MM/…` — aucun CDN externe. Liste complète : `docs/migration/urls-medias.csv`.

| Extension | Nombre |
|---|---|
| .png | 508 |
| .jpg | 217 |
| .svg | 154 |
| .pdf | 43 |
| .webp | 7 |
| .mp4 | 5 |
| .ics | 4 |
| .jpeg | 3 |
| .gif | 2 |

- **43 PDF** (livres blancs, guides) dont 4 sous `dlm_uploads/` (protégés) et 30 dans le dossier anormal `/uploads/0206/05/` (69 fichiers au total dans ce dossier à la date corrompue — surtout d'anciennes images 2016).
- 154 SVG = logos partenaires/technos pour la plupart.
- 5 vidéos MP4 auto-hébergées + vidéos YouTube embarquées dans les contenus.
- 105 contenus ont une **image à la une** (`_thumbnail_id`) à mapper vers un champ `heroImage`.

## 10. Métadonnées SEO (Yoast)

| Méta | Couverture |
|---|---|
| `_yoast_wpseo_title` | 154 contenus |
| `_yoast_wpseo_metadesc` | 163 contenus |
| `noindex` | 14 contenus (voir ci-dessous) |

Valeurs complètes dans `urls-contenus.csv` (colonnes `seo_title`, `seo_metadesc`). La table SQL `vic_yoast_indexable` peut compléter les trous (titles/descriptions calculés). Open Graph/Twitter : essentiellement les gabarits par défaut Yoast (rien de spécifique à migrer, sauf l'image OG de la page d'accueil). Le **sitemap.xml et les flux RSS** sont générés par Yoast/WP → à régénérer côté Astro.

### Contenus en `noindex` (à respecter dans la nouvelle version)

- Politique de confidentialité — `/politique-de-confidentialite/` (page, publié)
- Conditions d'utilisation — `/conditions-dutilisation/` (page, publié)
- Accès interdit — `/no-access/` (page, publié)
- No access — `/en/no-access/` (page, publié)
- Terms of use — `/en/terms-of-use/` (page, publié)
- Privacy Policy — `/en/privacy-policy/` (page, publié)
- Diner Victrix et Palo Alto — `/?page_id=3743` (page, **brouillon**)
- Évènement Victrix x Cask x Service Now - Mardi 20 mai 2025 — `/?page_id=7126` (page, **brouillon**)
- Page de remerciement — `/page-de-remerciement/` (page, publié)
- Liste de prix Check Point — `/liste-prix-check-point/` (page, publié)
- Check Point Price List — `/en/check-point-price-list/` (page, publié)
- Protégé : Documents O bureau — `/expertise/productivite/o-bureau/documents-o-bureau/` (expertise, publié)
- Landing – Accompagnement IA — `/expertise/intelligence-artificielle/accompagnement-ia/` (expertise, publié)
- Landing – AI Consulting — `/en/expertise/artificial-intelligence/landing-ai-consulting/` (expertise, publié)

## 11. Shortcodes et blocs custom

| Shortcode | Occurrences | Origine | Stratégie statique |
|---|---|---|---|
| `[siteorigin_widget]` | 850 | SiteOrigin | Aplatir : extraire le HTML rendu / recomposer en composants |
| `[gravityform]` | 25 | Gravity Forms | Remplacer par le composant formulaire du nouveau site |
| `[victrix_table]` | 4 | CUSTOM | ⚠️ Plugin custom `victrix-product-table` — réimplémenter (tableaux produits/prix Check Point) |
| `[social_links]` | 2 | thème | Composant liens sociaux |
| `[dlm_no_access]` | 1 | Download Monitor | Page technique DLM — repenser le flux de téléchargement |

Champs custom notables (CMB2/thème) : `cta_text`/`cta_link` (6 contenus), injections `hefo_before/after` (5), multi-auteurs `_post_authors` (20).

## 12. Moteurs de contenu (impact conversion)

| Type | siteorigin | brizy | gutenberg | html | shortcode-seul | vide |
|---|---|---|---|---|---|---|
| page | 15 | 4 | 2 | 2 | 1 | 3 |
| expertise | 55 | 23 | 0 | 0 | 0 | 0 |
| dlm_download | 0 | 0 | 0 | 5 | 0 | 0 |
| post | 63 | 0 | 0 | 1 | 0 | 0 |

- **SiteOrigin** : HTML rendu présent dans `content:encoded` (grilles `panel-*` + 850 `[siteorigin_widget]` avec leur config JSON) — extractible mais à nettoyer/recomposer.
- **Brizy** : le **HTML compilé est présent en clair** dans `content:encoded` (`brz-*`) — pas besoin du builder ; classes `brz-css-*` à purger, attention aux `{{placeholder}}` dynamiques résiduels.
- **Gutenberg/HTML** : 4 pages légales, conversion triviale.
- **Vide/template** : 4 pages dont le contenu vit dans le thème Blade → récupérer depuis le site live.

## 13. URLs et redirections

- **Inventaire complet des URLs de contenu** : `docs/migration/urls-contenus.csv` (174 lignes, dont 163 publiées avec URL publique).
- **URLs de médias** : `docs/migration/urls-medias.csv` (943 lignes) — les fichiers seront rapatriés, mais les URLs `/wp-content/uploads/...` référencées ailleurs (moteurs de recherche, courriels, autres sites) méritent des redirections ou une conservation des chemins.
- **URLs systémiques à traiter** : archives de catégories (§6), pagination `/page/N/`, `sitemap.xml`/`sitemap_index.xml`, flux `/feed/`, pages auteurs (`/author/…` — Yoast les indexait), `?s=` (recherche).

### Redirections 301 déjà en place (plugin Redirection — 85 règles, à reporter)

Complet dans `docs/migration/redirections.csv`. Groupes : « Redirections », « Articles modifiés ». Échantillon :

| Source | Cible |
|---|---|
| `/fr/nouvelles/nomination-joanne-hurens/` | `/decouvrir-victrix/` |
| `/fr/nouvelles/nomination-benoit-champagne/` | `/decouvrir-victrix/` |
| `/fr/equipe-direction/patrick-scantland/` | `/decouvrir-victrix/` |
| `/fr/equipe-direction/marco-vachon/` | `/decouvrir-victrix/` |
| `/fr/solutions/guichet-reinitialisation-mot-de-passe/` | `/expertise/cybersecurite/` |
| `/fr/solutions/plateforme-sociale-entreprise/` | `/expertise/productivite/plateforme-employe-intranet/` |
| `/plateforme-experience-employe/` | `/expertise/productivite/plateforme-employe-intranet/` |
| `/solution/studio/` | `/expertise/productivite/o-studio/` |
| `/solution/centre-operationnel-de-securite/` | `/expertise/cybersecurite/centre-operationnel-de-securite-evolutif/` |
| `/solution/migration/` | `/expertise/services-infonuagiques/migration-vers-azure/` |
| `/en/solution/migration/` | `/en/expertise/cloud-services-provider/azure-migration/` |
| `/en/solution/o-studio/` | `/en/expertise/productivity-consulting/o-studio/` |
| … | *(73 autres dans le CSV)* |

### Anciens slugs (`_wp_old_slug` — redirections implicites WordPress à recréer)

- `securite` → `/?post_type=expertise&p=112` (expertise)
- `cloud`, `cloud-services` → `/en/expertise/cloud-services-provider/` (expertise)
- `security` → `/en/expertise/cybersecurity/` (expertise)
- `productivity` → `/en/expertise/productivity-consulting/` (expertise)
- `7567`, `webinaire-copilot-2` → `/document/webinaire-copilot-buzz-impact/` (dlm_download)
- `capacites-ia-servicenow` → `/ia-servicenow/` (post)
- `capacites-ia-servicenow` → `/en/servicenow-ai/` (post)
- `setting-up-a-soc-aligned-with-your-it-operations` → `/en/setting-up-a-soc/` (post)
- `certification-iso-27001-iso-9001-2` → `/certification-iso-27001-iso-9001/` (post)
- `migration-windows-11-microsoft-exchange-2` → `/migration-windows-11-microsoft-exchange/` (post)
- `migration-windows-11-microsoft-exchange-2` → `/en/migration-windows-11-microsoft-exchange/` (post)

⚠️ Les cibles de redirection pointant hors inventaire (8 règles) visent surtout des URLs déjà supprimées ou des domaines externes (`o-studio-catalogue.victrix.ca`) — à auditer dans le CSV.

## 14. ⚠️ Sans équivalent statique évident — à décider

| Élément | Détail | Piste |
|---|---|---|
| **Formulaires Gravity Forms** | 8 formulaires actifs, logique conditionnelle, notifications SMTP | Service de formulaires (CloudCannon Forms / API) + e-mail transactionnel |
| **Téléchargements protégés** | Accès aux PDF conditionné au formulaire GF #3 (échange lead ↔ document) | Worker/fonction (lien signé) ou accès libre assumé |
| **`[victrix_table]`** | Plugin custom tableaux produits (pages prix Check Point) | Composant tableau + données en collection CMS |
| **Portail client** | Pages `/mon-portail/` + `/en/customer-portal/` | Prototype OIDC/PKCE déjà maquetté dans Demo-victrix (docs/portail-auth.md) |
| **Contenu protégé par mot de passe** | `/expertise/productivite/o-bureau/documents-o-bureau/` | Auth statique impossible — worker ou abandon |
| **Recherche WordPress** | `?s=` | Pagefind (déjà prévu P-06) |
| **Sélecteur de langue Polylang** | `#pll_switcher` dans les menus | Composant i18n du nouveau site (déjà en place dans le prototype) |
| **Tracking & consentement** | Microsoft Clarity + ZoomInfo (snippets head) + Axeptio | Reporter les tags dans le layout + gestionnaire de consentement |
| **Sitemap / RSS / archives auteurs** | Générés par WP/Yoast | Régénérer côté Astro ; décider du sort des archives auteurs (noindex ?) |
| **Pages template Blade** | Ressources / Resources center (contenu dans le thème) | Récupérer le rendu live et recomposer |
| **E-mails transactionnels** | Post SMTP (notifications de formulaires) | Inclus dans la solution formulaires |

## 15. Données à préserver avant décommission de WordPress

- **5200 entrées de formulaires** (dont 2465 leads « Contactez-nous » et 1776 abonnés infolettre) — **export CSV depuis Gravity Forms requis** (données personnelles : traiter selon Loi 25).
- Fichiers protégés `dlm_uploads/` (accès admin nécessaire).
- Logs 404 récents (table `vic_redirection_404`, ~8 000 lignes sur 1 semaine) — utiles pour valider le plan de redirection.
- Comptes utilisateurs (6) : simple référence d'auteurs, rien à migrer fonctionnellement.

## 16. Vérifications croisées & questions ouvertes

### Vérifications automatiques

- Comptes attendus vs extraits : pages **27/27** · articles **64/64** · expertises **78/78** · médias **943** uniques (1 370 références brutes) · redirections **85/85** · items de menus **99/99** · formulaires **17/17** · entrées GF **5200/5200**.
- Items de menus pointant vers des contenus non publiés : aucun ✅.
- Formulaires embarqués mais inactifs/corbeille : #4 (corbeille) dans `/?page_id=3743` ; #12 (inactif) dans `/?page_id=7126`.
- Contenus publiés **sans traduction** (3) : `/expertise/productivite/o-bureau/documents-o-bureau/` (fr), `/une-journee-dans-la-vie-secops/` (fr), `/societe-conseil-lambda-victrix/` (fr).
- Spot-check live (2026-07-24, 17 URLs en HEAD) : accueil FR/EN, expertises FR/EN, blogue, document DLM, article, page prix, sitemap → **200 OK** ; `/solution/studio/` → 301 vers `/expertise/productivite/o-studio/` (conforme au plugin Redirection) ; archives FR sur base traduite `/categorie/…` (voir §6).

### Questions ouvertes pour validation humaine

1. **Brouillons** (3 pages, 2 articles, 5 expertises, 1 téléchargement) : migrer ou abandonner ?
2. **Contenus sans traduction** listés ci-dessus : les traduire à l'occasion de la migration ou assumer l'asymétrie ?
3. **Archives de catégories** (`/category/…`) : conserver comme pages de listing filtré ou rediriger vers le blogue ?
4. **Flux de téléchargement** (lead-gen via formulaire) : conserver le gating ou libérer les PDF ?
5. **Landing pages d'événements passés** (drafts + Voeux des fêtes) : archiver ?
6. **Pages auteurs / archives dates** WordPress : rediriger vers l'accueil du blogue ?
7. **Périmètre du portail client** : la page `/mon-portail/` du site actuel est un simple lien — le prototype Demo-victrix va plus loin.

---
*Scripts : `scripts/migration/parse-wxr.mjs` → `extract-sql.mjs` → `build-inventory.mjs` (réutilisables pour la conversion de contenu).*
