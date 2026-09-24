# Parité avec le site EN LIGNE

> Généré par `scripts/migration/check-parite-live.py` à partir des plans
> de site de victrix.ca. **Les pages `noindex` (campagnes cachées) n'y sont
> pas** : le plan de site les exclut par construction.

| | Nombre |
| --- | --- |
| URL en ligne examinées | 150 |
| Retrouvées dans le dépôt | 134 |
| **Slug différent** (redirection à écrire) | **13** |
| **Sans équivalent trouvé** | **3** |

## 1. URL en ligne sans équivalent dans le dépôt

| Type | URL en ligne | Modifiée le |
| --- | --- | --- |
| post | `/cache/` | 2026-08-10 |
| dlm_download | `/document/pourquoi-gerez-vous-encore-vos-ti/` | 2026-07-07 |
| dlm_download | `/document/webinaire-copilot-buzz-impact/` | 2026-07-08 |

## 2. Slug qui a dérivé entre le site en ligne et le dépôt

Chaque ligne est une **redirection 301 à écrire** : l'URL de gauche est
celle qui circule aujourd'hui (Google, LinkedIn, courriels).

| URL en ligne | Fichier du dépôt | Slug du dépôt |
| --- | --- | --- |
| `/zero-trust-network-access-ztna-modele-de-cybersecurite-optimal/` | `src/content/blog/fr/zero-trust-network-access-ztna.md` | `zero-trust-network-access-ztna-modele-de-cybersecurite-optimal` |
| `/en/zero-trust-network-access-ztna-ultimate-cybersecurity-model/` | `src/content/blog/en/zero-trust-network-access-ztna.md` | `zero-trust-network-access-ztna-ultimate-cybersecurity-model` |
| `/` | `src/content/home/fr/accueil.json` | `accueil` |
| `/en/customer-portal/` | `src/pages/[lang]/portail/` | `connexion` |
| `/en/resources-center/` | `src/pages/[lang]/ressources/` | `ressources` |
| `/en/thank-you-page/` | `src/pages/[lang]/merci.astro` | `merci` |
| `/decouvrir-victrix/` | `src/content/pages/fr/decouvrir.json` | `decouvrir` |
| `/en/discover-victrix/` | `src/content/pages/en/decouvrir.json` | `decouvrir` |
| `/carriere/` | `src/content/pages/fr/carrieres.json` | `carrieres` |
| `/en/careers/` | `src/content/pages/en/carrieres.json` | `carrieres` |
| `/en/` | `src/content/home/en/accueil.json` | `accueil` |
| `/mon-portail/` | `src/pages/[lang]/portail/` | `connexion` |
| `/document/licences-microsoft-power-platform/` | `src/content/landing/fr/licences-power-platform.md` | `licences-power-platform` |

## 3. Contenus du dépôt qui ne correspondent à aucune URL en ligne

Normal pour : pages neuves de la refonte, pages de campagne `noindex`,
démos. À relire quand même.

- `src/content/landing/en/demo-sections.md`
- `src/content/landing/en/evaluation-securite.md`
- `src/content/landing/en/licences-power-platform.md`
- `src/content/landing/fr/demo-sections.md`
- `src/content/landing/fr/evaluation-securite.md`
- `src/content/pages/en/centre-de-confiance.json`
- `src/content/pages/en/conditions-utilisation.json`
- `src/content/pages/en/expertises.json`
- `src/content/pages/en/politique-confidentialite.json`
- `src/content/pages/en/produits.json`
- `src/content/pages/en/secteurs.json`
- `src/content/pages/en/services.json`
- `src/content/pages/en/solutions.json`
- `src/content/pages/en/tarification.json`
- `src/content/pages/fr/centre-de-confiance.json`
- `src/content/pages/fr/conditions-utilisation.json`
- `src/content/pages/fr/expertises.json`
- `src/content/pages/fr/politique-confidentialite.json`
- `src/content/pages/fr/produits.json`
- `src/content/pages/fr/secteurs.json`
- `src/content/pages/fr/services.json`
- `src/content/pages/fr/solutions.json`
- `src/content/pages/fr/tarification.json`
- `src/content/services/en/demo-produit.json`
- `src/content/services/en/demo-sections.json`
- `src/content/services/en/infrastructure.json`
- `src/content/services/en/intelligence-artificielle/accompagnement-ia.json`
- `src/content/services/en/productivite/servicenow.json`
- `src/content/services/en/projets-en-ia.json`
- `src/content/services/en/services-applicatifs.json`
- `src/content/services/fr/demo-produit.json`
- `src/content/services/fr/demo-sections.json`
- `src/content/services/fr/infrastructure.json`
- `src/content/services/fr/intelligence-artificielle/accompagnement-ia.json`
- `src/content/services/fr/productivite/servicenow.json`
- `src/content/services/fr/projets-en-ia.json`
- `src/content/services/fr/services-applicatifs.json`
- `src/content/solutions/en/feuille-temps-chantier.json`
- `src/content/solutions/en/gestion-formations.json`
- `src/content/solutions/en/gestion-idees.json`
- `src/content/solutions/en/horaires-etudiants.json`
- `src/content/solutions/en/legacy-vers-power-apps.json`
- `src/content/solutions/en/o-bureau.json`
- `src/content/solutions/en/portail-ombudsman.json`
- `src/content/solutions/en/portail-requetes-citoyennes.json`
- `src/content/solutions/en/portail-subventions.json`
- `src/content/solutions/fr/feuille-temps-chantier.json`
- `src/content/solutions/fr/gestion-formations.json`
- `src/content/solutions/fr/gestion-idees.json`
- `src/content/solutions/fr/horaires-etudiants.json`
- `src/content/solutions/fr/legacy-vers-power-apps.json`
- `src/content/solutions/fr/o-bureau.json`
- `src/content/solutions/fr/portail-ombudsman.json`
- `src/content/solutions/fr/portail-requetes-citoyennes.json`
- `src/content/solutions/fr/portail-subventions.json`
