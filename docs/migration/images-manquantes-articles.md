# Articles — les images de l’ancien site absentes de nos articles

> Généré par `python scripts/migration/images-manquantes-articles.py`.
> Source : le cache des pages EN LIGNE, `docs/migration/cache-source/`.
> **Aucun fichier de contenu n’est modifié.**

| | |
| --- | --- |
| Articles comparés | **47** |
| Articles avec une image de contenu absente ou servie par l’ancien domaine | **26** |
| Images de contenu absentes du Markdown (hors couverture) | **44** |
| Icônes décoratives absentes (choix de forme, hors décompte) | 6 |
| `<img>` encore servies par `https://www.victrix.ca` | **36** |
| Articles sans source comparable | 2 |

**Comment lire.** Une image est « absente » quand son NOM de fichier (suffixe
de vignette `-300x200` ignoré) n’apparaît ni dans un `![…](…)` ni dans un
`<img>` du corps de l’article. « dans public » = le fichier est déjà rapatrié
sous `public/wp-content/`, il ne reste qu’à le poser à sa place dans le texte.

## Articles à reprendre

| Article | Images de contenu absentes | Servies par l’ancien domaine | Source |
| --- | --- | --- | --- |
| `src/content/blog/en/agents-copilot-studio.md` | **4** / 5 |  | <https://www.victrix.ca/en/copilot-studio-agents/> |
| `src/content/blog/fr/mise-en-place-soc.md` | **4** / 5 |  | <https://www.victrix.ca/mise-en-place-soc/> |
| `src/content/blog/en/mise-en-place-soc.md` | **3** / 4 |  | <https://www.victrix.ca/en/setting-up-a-soc/> |
| `src/content/blog/en/servicenow-itom.md` | **3** / 3 |  | <https://www.victrix.ca/en/ressources/servicenow-itom/> |
| `src/content/blog/fr/agents-copilot-studio.md` | **3** / 5 |  | <https://www.victrix.ca/agents-copilot-studio/> |
| `src/content/blog/fr/servicenow-itom.md` | **3** / 3 |  | <https://www.victrix.ca/servicenow-itom/> |
| `src/content/blog/en/pentest-cybersecurite.md` | **2** / 4 |  | <https://www.victrix.ca/en/penetration-testing/> |
| `src/content/blog/en/zero-trust-network-access-ztna.md` | **2** / 2 |  | <https://www.victrix.ca/en/zero-trust-network-access-ztna/> |
| `src/content/blog/fr/fonctionnalites-microsoft-copilot.md` | **2** / 2 |  | <https://www.victrix.ca/fonctionnalites-microsoft-copilot/> |
| `src/content/blog/fr/pentest-cybersecurite.md` | **2** / 4 |  | <https://www.victrix.ca/pentest-cybersecurite/> |
| `src/content/blog/en/audit-cybersecurite.md` | **1** / 2 |  | <https://www.victrix.ca/en/ressources/cybersecurity-risk-audit/> |
| `src/content/blog/en/directive-nis2.md` | **1** / 20 | 18 | <https://www.victrix.ca/en/ressources/nis2-directive/> |
| `src/content/blog/en/fonctionnalites-microsoft-copilot.md` | **1** / 1 |  | <https://www.victrix.ca/en/microsoft-copilot-features/> |
| `src/content/blog/en/loi-25-donnees-personnelles-guide.md` | **1** / 2 |  | <https://www.victrix.ca/en/ressources/law-25-personal-data-guide/> |
| `src/content/blog/en/migration-windows-11-microsoft-exchange.md` | **1** / 1 |  | <https://www.victrix.ca/en/migration-windows-11-microsoft-exchange/> |
| `src/content/blog/en/ransomware-rancongiciels.md` | **1** / 2 |  | <https://www.victrix.ca/en/ressources/ransomware-protection-tips/> |
| `src/content/blog/en/reglementation-dora.md` | **1** / 2 |  | <https://www.victrix.ca/en/ressources/dora-regulation/> |
| `src/content/blog/en/sase-cloud.md` | **1** / 2 |  | <https://www.victrix.ca/en/ressources/sase-cloud/> |
| `src/content/blog/en/securite-iot-defis.md` | **1** / 1 |  | <https://www.victrix.ca/en/iot-security-challenges/> |
| `src/content/blog/fr/audit-cybersecurite.md` | **1** / 2 |  | <https://www.victrix.ca/audit-cybersecurite/> |
| `src/content/blog/fr/directive-nis2.md` | **1** / 20 | 18 | <https://www.victrix.ca/directive-nis2/> |
| `src/content/blog/fr/loi-25-donnees-personnelles-guide.md` | **1** / 2 |  | <https://www.victrix.ca/loi-25-donnees-personnelles-guide/> |
| `src/content/blog/fr/migration-windows-11-microsoft-exchange.md` | **1** / 1 |  | <https://www.victrix.ca/migration-windows-11-microsoft-exchange/> |
| `src/content/blog/fr/ransomware-rancongiciels.md` | **1** / 3 |  | <https://www.victrix.ca/ransomware-rancongiciels/> |
| `src/content/blog/fr/reglementation-dora.md` | **1** / 2 |  | <https://www.victrix.ca/reglementation-dora/> |
| `src/content/blog/fr/securite-iot-defis.md` | **1** / 1 |  | <https://www.victrix.ca/securite-iot-defis/> |

## Le détail

### `src/content/blog/en/agents-copilot-studio.md`

- `banniere-article-victrix` — dans public
- `mailing-offre-victrix_agent-intelligent-05` — dans public
- `mailing-offre-victrix_agent-intelligent-04-2` — dans public
- `mailing-offre-victrix_agent-intelligent-03` — dans public
- icônes décoratives non reprises : `idea`

### `src/content/blog/en/audit-cybersecurite.md`

- `group-successful-business-team-workplace-1-scaled` — dans public

### `src/content/blog/en/directive-nis2.md`

- `yellow-question-mark-scaled` — dans public
- icônes décoratives non reprises : `ampoule`
- **18 `<img>` pointent encore vers `https://www.victrix.ca`** (à réécrire en `/wp-content/…`)

### `src/content/blog/en/fonctionnalites-microsoft-copilot.md`

- `design-sans-titre-1-1-e1737989481531` — dans public

### `src/content/blog/en/loi-25-donnees-personnelles-guide.md`

- `faq-law-25` — dans public

### `src/content/blog/en/migration-windows-11-microsoft-exchange.md`

- `image-article-exchange-se_02-2` — dans public

### `src/content/blog/en/mise-en-place-soc.md`

- `soc-functions-2` — dans public
- `soc-team` — dans public
- `soc-target-operating-models-pie-chart` — dans public
- icônes décoratives non reprises : `idea`

### `src/content/blog/en/pentest-cybersecurite.md`

- `portrait-hacker-1-scaled` — dans public
- `online-security-dark-background-3d-illustration-1-scaled` — dans public

### `src/content/blog/en/ransomware-rancongiciels.md`

- `victrix_sevoc-1-e1701322153436` — dans public

### `src/content/blog/en/reglementation-dora.md`

- `yellow-question-mark-1-scaled` — dans public

### `src/content/blog/en/sase-cloud.md`

- `victrix-votre-cybersecurite` — dans public

### `src/content/blog/en/securite-iot-defis.md`

- `umberto-fewhpo4vc9y-unsplash` — dans public

### `src/content/blog/en/servicenow-itom.md`

- `victrix_infograhic-itom-servicenow-fr` — dans public
- `victrix_automation-statistics-fr` — dans public
- `victrix_diagramme-venn-itsmitom-victrix-fr` — dans public

### `src/content/blog/en/zero-trust-network-access-ztna.md`

- `ztna-victrix` — dans public
- `victrix-votre-cybersecurite` — dans public

### `src/content/blog/fr/agents-copilot-studio.md`

- `mailing-offre-victrix_agent-intelligent-01` — dans public
- `mailing-offre-victrix_agent-intelligent-05` — dans public
- `mailing-offre-victrix_agent-intelligent-04-2` — dans public
- icônes décoratives non reprises : `idea`

### `src/content/blog/fr/audit-cybersecurite.md`

- `group-successful-business-team-workplace-scaled` — dans public

### `src/content/blog/fr/directive-nis2.md`

- `yellow-question-mark-scaled` — dans public
- icônes décoratives non reprises : `ampoule`
- **18 `<img>` pointent encore vers `https://www.victrix.ca`** (à réécrire en `/wp-content/…`)

### `src/content/blog/fr/fonctionnalites-microsoft-copilot.md`

- `webinaire-microsoft-copilot-__banniere-mailing-rediffusion` — dans public
- `design-sans-titre-1-1-e1737989481531` — dans public

### `src/content/blog/fr/loi-25-donnees-personnelles-guide.md`

- `image-2-1-scaled` — dans public

### `src/content/blog/fr/migration-windows-11-microsoft-exchange.md`

- `image-article-exchange-se_02-2` — dans public

### `src/content/blog/fr/mise-en-place-soc.md`

- `solution-sevoc-pourquoi` — dans public
- `soc-functions-1` — dans public
- `equipe-soc` — dans public
- `diagramme-circulaire-des-modeles-operationnels-du-soc` — dans public
- icônes décoratives non reprises : `idea`

### `src/content/blog/fr/pentest-cybersecurite.md`

- `portrait-hacker-scaled` — dans public
- `online-security-dark-background-3d-illustration-scaled` — dans public

### `src/content/blog/fr/ransomware-rancongiciels.md`

- `victrix_sevoc-1-e1701322153436` — dans public

### `src/content/blog/fr/reglementation-dora.md`

- `yellow-question-mark-scaled` — dans public

### `src/content/blog/fr/securite-iot-defis.md`

- `image-2-1-scaled` — dans public

### `src/content/blog/fr/servicenow-itom.md`

- `victrix_infograhic-itom-servicenow-fr` — dans public
- `victrix_automation-statistics-fr` — dans public
- `victrix_diagramme-venn-itsmitom-victrix-fr` — dans public

## Articles sans source comparable

- `src/content/blog/en/externalisation-soc-avantages-inconvenients.md` — source absente du cache
- `src/content/blog/fr/externalisation-soc-avantages-inconvenients.md` — source absente du cache
