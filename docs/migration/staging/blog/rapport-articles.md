# Rapport de conversion — articles WordPress → staging blog

> Généré par `scripts/migration/convert-articles.mjs` — rejouable. Sortie : `docs/migration/staging/blog/{fr,en}/`.
> ⚠️ ZONE DE STAGING : rien n'est branché dans les collections. Revue humaine requise
> (questions §16 de l'inventaire : brouillons Q1, sans-traduction Q2) avant le port vers `src/content/blog/`.

- Articles convertis : **64** fichiers (64 posts source).
- Paires de traduction : 30 · sans traduction : 4 (fr/gestion-des-activites-de-recouvrement-amiable-et-contentieux, fr/organisme-sans-but-lucratif-en-information-juridique, fr/une-journee-dans-la-vie-secops, fr/societe-conseil-lambda-victrix)
- Brouillons (décision Q1) : 2 (fr/gestion-des-activites-de-recouvrement-amiable-et-contentieux, fr/organisme-sans-but-lucratif-en-information-juridique)
- Articles « vidéos » (iframes → liens, CSP sans frame-src) : 7 (fr/partie-1-meilleures-pratiques-en-securite-operationnelle-la-maintenance, en/best-practices-in-operational-safety-maintenance, fr/partie-2-meilleures-pratiques-en-securite-operationnelle-la-surveillance, en/part-2-best-practices-in-operational-security-monitoring, fr/partie-3-meilleures-pratiques-en-securite-operationnelle-la-defense, en/part-3-best-practices-in-operational-security-defense, fr/une-journee-dans-la-vie-secops)
- Médias référencés (originaux, chemins /wp-content/ conservés) : **75** — à rapatrier avec l'arborescence (décision Phase 6).

## Avertissements par article

- **fr/externalisation-soc-avantages-inconvenients** : balise inattendue retirée : <span class="NormalTextRun CommentStart  · balise inattendue retirée : </span> ×3 · balise inattendue retirée : <span class="NormalTextRun SCXW108337037 ×2
- **fr/sase-cloud** : balise inattendue retirée : <span class="NormalTextRun SCXW113406471 ×3 · balise inattendue retirée : </span> ×3
- **fr/ransomware-rancongiciels** : balise inattendue retirée : <strong> · balise inattendue retirée : </strong> · balise inattendue retirée : <span lang="FR-CA" xml:lang="FR-CA" data · balise inattendue retirée : </span>
- **en/expands-cybersecurity-offering-france** : balise inattendue retirée : <span class="NormalTextRun SCXW259795282 · balise inattendue retirée : </span>
- **fr/audit-cybersecurite** : balise inattendue retirée : <figure id="attachment_6571" aria-descri · balise inattendue retirée : <figcaption id="caption-attachment-6571" · balise inattendue retirée : </figcaption> · balise inattendue retirée : </figure>
- **fr/pentest-cybersecurite** : table HTML conservée telle quelle (à vérifier au rendu)
- **en/penetration-testing** : table HTML conservée telle quelle (à vérifier au rendu)
- **fr/directive-nis2** : table HTML conservée telle quelle (à vérifier au rendu)
- **en/nis2-directive** : table HTML conservée telle quelle (à vérifier au rendu)
- **fr/servicenow-itsm** : table HTML conservée telle quelle (à vérifier au rendu)
- **en/servicenow-itsm** : liste <li> sans <ul> englobant — reconstruite en liste à puces ×3 · table HTML conservée telle quelle (à vérifier au rendu)
- **fr/ia-servicenow** : table HTML conservée telle quelle (à vérifier au rendu) ×4
- **en/servicenow-ai** : table HTML conservée telle quelle (à vérifier au rendu) ×4
- **fr/copilot-vs-chatgpt** : table HTML conservée telle quelle (à vérifier au rendu) ×3
- **en/chatgpt-vs-copilot** : table HTML conservée telle quelle (à vérifier au rendu) ×3
- **fr/agents-copilot-studio** : liste <li> sans <ul> englobant — reconstruite en liste à puces ×2
- **en/copilot-studio-agents** : liste <li> sans <ul> englobant — reconstruite en liste à puces ×2
- **fr/mise-en-place-soc** : liste <li> sans <ul> englobant — reconstruite en liste à puces ×2 · table HTML conservée telle quelle (à vérifier au rendu)
- **en/setting-up-a-soc** : liste <li> sans <ul> englobant — reconstruite en liste à puces · table HTML conservée telle quelle (à vérifier au rendu)
- **fr/servicenow-itom** : table HTML conservée telle quelle (à vérifier au rendu)
- **en/servicenow-itom** : table HTML conservée telle quelle (à vérifier au rendu)

## Médias référencés

- /wp-content/uploads/0206/05/victrix-votre-cybersecurite.png
- /wp-content/uploads/2022/02/solution-sevoc-pourquoi.jpg
- /wp-content/uploads/2022/05/cover-artivle_partie-1-maintenance-scaled.jpg
- /wp-content/uploads/2022/05/cover-artivle_partie-2-surveillance-scaled.jpg
- /wp-content/uploads/2022/05/cover-artivle_partie-3-defense-scaled.jpg
- /wp-content/uploads/2022/09/banque-postale-logo-e1662489274392.png
- /wp-content/uploads/2022/10/1-scaled-e1666199091480.jpg
- /wp-content/uploads/2022/10/cover-livret.png
- /wp-content/uploads/2023/07/victrix-lambda.jpg
- /wp-content/uploads/2023/10/istock-1194430783.jpg
- /wp-content/uploads/2023/10/istock-1310129244-1.jpg
- /wp-content/uploads/2023/10/istock-1325680818.jpg
- /wp-content/uploads/2023/10/sevoc.png
- /wp-content/uploads/2023/10/ztna-victrix-1-scaled.jpg
- /wp-content/uploads/2023/10/ztna-victrix-1.jpg
- /wp-content/uploads/2023/10/ztna-victrix-scaled.jpg
- /wp-content/uploads/2023/10/ztna-victrix.jpg
- /wp-content/uploads/2023/11/ransomware-e1701148187185-1024x741-1.jpg
- /wp-content/uploads/2023/11/ransomware-e1701148187185-1024x741-1.png
- /wp-content/uploads/2023/11/ransomware-e1701148187185.png
- /wp-content/uploads/2023/11/ransomware2-1536x213-1.png
- /wp-content/uploads/2023/11/ransomware2.png
- /wp-content/uploads/2023/11/sase-victrix-1.png
- /wp-content/uploads/2023/11/sase-victrix-1024x576-1.jpg
- /wp-content/uploads/2023/11/sase-victrix.png
- /wp-content/uploads/2024/02/apps-microsoft-viva-1.png
- /wp-content/uploads/2024/02/apps-microsoft-viva.png
- /wp-content/uploads/2024/02/microsoft-viva_image-article-1.png
- /wp-content/uploads/2024/02/microsoft-viva_image-article-1024x623-1.jpg
- /wp-content/uploads/2024/02/microsoft-viva_image-article.png
- /wp-content/uploads/2024/05/power_platform_image-article.png
- /wp-content/uploads/2024/05/powerplatform.jpg
- /wp-content/uploads/2024/05/signature-mail.jpg
- /wp-content/uploads/2024/05/toolkit-powerplatform.png
- /wp-content/uploads/2024/06/signature-01-english.png
- /wp-content/uploads/2024/08/power_platform_image-article.png
- /wp-content/uploads/2024/09/design-sans-titre-7-1.jpg
- /wp-content/uploads/2024/09/design-sans-titre-7.jpg
- /wp-content/uploads/2024/09/image-1-v2-1-scaled.jpg
- /wp-content/uploads/2024/09/image-1-v2-1.jpg
- /wp-content/uploads/2024/09/image-landing-page-victrix.jpg
- /wp-content/uploads/2024/09/law25.jpg
- /wp-content/uploads/2024/10/business-corporate-protection-safety-security-concept-1-scaled.jpg
- /wp-content/uploads/2024/10/business-corporate-protection-safety-security-concept-1.jpg
- /wp-content/uploads/2024/10/business-corporate-protection-safety-security-concept-scaled.jpg
- /wp-content/uploads/2024/10/business-corporate-protection-safety-security-concept.jpg
- /wp-content/uploads/2024/10/computationally-intensive-tasks-servers-1-scaled.jpg
- /wp-content/uploads/2024/10/computationally-intensive-tasks-servers-1.jpg
- /wp-content/uploads/2024/10/computationally-intensive-tasks-servers-scaled.jpg
- /wp-content/uploads/2024/10/computationally-intensive-tasks-servers.jpg
- /wp-content/uploads/2024/10/programming-background-with-person-working-with-codes-computer-1-scaled.jpg
- /wp-content/uploads/2024/10/programming-background-with-person-working-with-codes-computer-1.jpg
- /wp-content/uploads/2024/10/programming-background-with-person-working-with-codes-computer-scaled.jpg
- /wp-content/uploads/2024/10/programming-background-with-person-working-with-codes-computer.jpg
- /wp-content/uploads/2024/11/ampoule.jpg
- /wp-content/uploads/2024/11/design-sans-titre.jpg
- /wp-content/uploads/2024/11/dominic-lajoie-1.jpg
- /wp-content/uploads/2024/11/servicenow-victrix.png
- /wp-content/uploads/2024/11/webinaire-microsoft-copilot-__post-linkedin-rediffusion.png
- /wp-content/uploads/2024/12/design-sans-titre-2.jpg
- /wp-content/uploads/2024/12/design-sans-titre-3.jpg
- /wp-content/uploads/2025/01/design-sans-titre-1.jpg
- /wp-content/uploads/2025/01/optical-fiber-background-600x600-1.jpg
- /wp-content/uploads/2025/01/optical-fiber-background-scaled.jpg
- /wp-content/uploads/2025/01/optical-fiber-background.jpg
- /wp-content/uploads/2025/02/victrix.png
- /wp-content/uploads/2025/03/design-sans-titre-1.png
- /wp-content/uploads/2025/03/design-sans-titre-2.png
- /wp-content/uploads/2025/03/linkedin_templates.png
- /wp-content/uploads/2025/07/cover-article-victrix.jpg
- /wp-content/uploads/2025/07/cover-article_certification-iso_en-1.png
- /wp-content/uploads/2025/07/cover-article_certification-iso_fr-1.png
- /wp-content/uploads/2025/08/image-article-exchange-se_01-1.png
- /wp-content/uploads/2025/08/victrix_agc-press-release-01.png
- /wp-content/uploads/2025/08/victrix_agc-press-release-en.png
