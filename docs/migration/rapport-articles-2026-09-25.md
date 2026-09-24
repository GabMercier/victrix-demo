# Articles — rapport des mises à jour demandées (2026-09-25)

> Pour Gabriel, à transmettre à Julie. État de `dev` au 25/09 (commit `d4e58b6`
> + corrections du jour). Périmètre : les 62 fichiers de `src/content/blog/`
> (31 FR, 31 EN). « Avant » = `bce519e` (22/09, veille des demandes) ;
> « après » = l'arbre de travail. Chiffres mesurés par script, pas à la main.

## 1. Ce que Julie a demandé, et ce qui a été livré

| Demande (source) | Livré | Où le voir |
| --- | --- | --- |
| « Certains éléments n'ont pas été transférés depuis l'ancien site, ex. une bulle *Le saviez-vous* » (#1762, 23/09) | **Tout le texte perdu à la conversion est remis mot pour mot** : FAQ, encadrés « Le saviez-vous ? », sous-sections « Copilot dans Word / Excel / … », titres H2/H3 tombés — 2 passes (23/09), 0 bloc absent au rapport | tableau § 3 ; `docs/migration/blocs-manquants-articles.md` |
| « Possible d'avoir un format FAQ plus design pour le blog ? » (#1762, 23/09) | **4 patrons de mise en forme** sous `.prose` : bouton, encadré, FAQ dépliante (sans script), tableau qui défile ; appliqués aux 32 articles concernés | démo `/fr/style-guide/forme-articles/` ; guide § « Mettre en forme un article » |
| Article Copilot Studio : « changer le bouton pour *Planifiez une consultation* », bannière (#1762, 23/09 + sa sauvegarde CloudCannon) | **Ses retouches sont conservées** (coquilles, 2 liens « Planifiez une consultation », bannière, titre FAQ) et fusionnées avec la mise en forme ; reste UN bouton HTML qu'elle ne peut pas éditer : lequel ? (capture dans le ticket) | `/fr/ressources/agents-copilot-studio/` |
| Classeur : « Article manquant » Conseil Lambda (L115) | présent depuis le 21/09, FR seul | `/fr/ressources/societe-conseil-lambda-victrix/` |
| Classeur : 7 articles « à supprimer et rediriger » (L85, L99–L102, L105, L114) | **13 fichiers en brouillon** (7 FR + 6 EN), 31 anciennes adresses en 301 vers ses cibles, invisibles en production, visibles dans l'éditeur (tri « Brouillons d'abord ») | liste des articles au CMS |
| Les 4 « documents » WordPress (D18) | 3 en 301 définitives, liens d'articles corrigés (guide Licences → campagne, Tendances TI → services gérés, webinaire → « rediffusion bientôt disponible ») ; le replay Copilot attend son PDF | `docs/migration/statut-import.md` § 5 |
| Libellé des cartes Ressources par catégorie (#1762, 11/09) | **pas fait** (lot L08, point 1) | — |
| Sélecteur d'étiquettes d'articles, bannières de blogue plus soignées (#1762, 23/09) | **pas fait** (à planifier) | — |

## 2. En chiffres (articles publiés, hors 13 brouillons)

| | Avant (22/09) | Après (25/09) |
| --- | ---: | ---: |
| Mots dans le corps des 49 articles | 39 400 | **48 370** (+8 970) |
| Titres H2/H3 | 307 | **580** |
| Articles touchés | | **45** sur 49 |
| Boutons d'appel à l'action mis en forme | 0 | 49 |
| Encadrés « Le saviez-vous ? » | 0 | 8 (+2 dans des brouillons) |
| FAQ dépliantes | 0 | 6 |
| Tableaux mis en forme | 0 | 24 |
| Blocs de l'ancien site encore absents | 158 (23/09) | **0** (3 signalés = 1 libellé remplacé par D18, 2 reformulations de Julie) |
| Images du corps des articles encore absentes | jamais mesuré (44 trouvées le 25/09 au matin) | **0** (+ 3 infographies FR de l'article ITOM EN, à refaire en anglais) — voir § 4 |

Le texte n'a **jamais été reformulé** : chaque bloc remis vient du cache de
la page en ligne, à sa place. Les retouches de Julie faites dans CloudCannon
priment sur la source (règle du 25/09 : ce qui a été changé dans la nouvelle
version se conserve, ce qui a été oublié se ramène).

## 3. Article par article

Mots et titres = corps de l'article (sans le front matter). « Forme » = ce que
la mise en forme du 24/09 a posé. Les articles dont rien n'a bougé sont
listés aussi, pour que la liste soit complète.

### Français

| Article | Mots avant → après | Titres | Forme | Note |
| --- | ---: | ---: | --- | --- |
| `fonctionnalites-microsoft-copilot` | 246 → **1007** (+761) | 0 → 8 | — | avait perdu ¾ de son texte et tous ses titres |
| `copilot-vs-chatgpt` | 757 → **1494** (+737) | 10 → 28 | 2 boutons, 3 tableaux | FAQ + tableaux ; lien du webinaire retiré (D18) |
| `ransomware-rancongiciels` | 1982 → **2542** (+560) | 13 → 19 | 2 boutons |  |
| `servicenow-itsm` | 1005 → **1392** (+387) | 12 → 14 | 2 boutons, 1 tableau |  |
| `agents-copilot-studio` | 938 → **1322** (+384) | 7 → 16 | 3 boutons, 1 encadré | retouches de Julie (staging) fusionnées ; bannière remise |
| `loi-25-donnees-personnelles-guide` | 476 → **827** (+351) | 7 → 15 | 1 bouton |  |
| `directive-nis2` | 563 → **910** (+347) | 7 → 18 | 1 bouton, 1 encadré, 1 tableau |  |
| `securite-internet-des-objets` | 749 → **1018** (+269) | 6 → 12 | 1 encadré |  |
| `securite-iot-defis` | 402 → **668** (+266) | 5 → 13 | 1 bouton |  |
| `mise-en-place-soc` | 1723 → **1971** (+248) | 3 → 16 | 4 boutons, 1 encadré, 1 tableau |  |
| `reglementation-dora` | 462 → **616** (+154) | 4 → 6 | 1 bouton, 3 FAQ |  |
| `sase-cloud` | 1098 → **1199** (+101) | 9 → 15 | — |  |
| `gouvernance-power-platform-conseils` | 1280 → **1352** (+72) | 9 → 15 | 1 bouton | lien du guide → campagne Licences (D18) |
| `migration-windows-11-microsoft-exchange` | 646 → **708** (+62) | 1 → 8 | — |  |
| `servicenow-itom` | 1470 → **1530** (+60) | 12 → 19 | 1 tableau |  |
| `zero-trust-network-access-ztna` | 874 → **934** (+60) | 4 → 8 | — |  |
| `applications-microsoft-viva-demystifier-viva` | 702 → **753** (+51) | 8 → 12 | 1 bouton |  |
| `ia-servicenow` | 1150 → **1201** (+51) | 6 → 9 | 2 boutons, 4 tableaux |  |
| `audit-cybersecurite` | 869 → **917** (+48) | 3 → 8 | — |  |
| `certification-iso-27001-iso-9001` | 378 → **426** (+48) | 0 → 6 | — |  |
| `pentest-cybersecurite` | 1245 → **1290** (+45) | 6 → 10 | 2 boutons, 1 tableau |  |
| `tendances-ti` | 883 → **919** (+36) | 14 → 17 | 2 boutons | CTA « Téléchargez le guide » → services gérés (D18) |
| `developpement-offre-cybersecurite-france` | 272 → **293** (+21) | 1 → 3 | — |  |
| `externalisation-soc-avantages-inconvenients` | 941 → **941** (=) | 8 → 8 | 1 bouton | source absente de l'ancien site (404) : rien à comparer |
| `societe-conseil-lambda-victrix` | 552 → **552** (=) | 1 → 1 | — | FR seul (pas de traduction) |

### Anglais

| Article | Mots avant → après | Titres | Forme | Note |
| --- | ---: | ---: | --- | --- |
| `copilot-vs-chatgpt` | 695 → **1351** (+656) | 10 → 28 | 1 bouton, 3 tableaux | FAQ + tableaux ; lien du webinaire retiré (D18) |
| `fonctionnalites-microsoft-copilot` | 218 → **834** (+616) | 0 → 8 | — | avait perdu ¾ de son texte et tous ses titres |
| `ransomware-rancongiciels` | 1694 → **2184** (+490) | 13 → 19 | — |  |
| `agents-copilot-studio` | 828 → **1173** (+345) | 7 → 15 | 3 boutons, 1 encadré | titre d'encadré « Did You Know? » corrigé |
| `directive-nis2` | 430 → **730** (+300) | 7 → 18 | 3 boutons, 1 encadré, 1 tableau |  |
| `loi-25-donnees-personnelles-guide` | 367 → **653** (+286) | 7 → 14 | 1 bouton |  |
| `mise-en-place-soc` | 1467 → **1695** (+228) | 3 → 16 | 4 boutons, 1 encadré, 1 tableau |  |
| `securite-internet-des-objets` | 594 → **818** (+224) | 6 → 12 | 1 encadré |  |
| `securite-iot-defis` | 333 → **547** (+214) | 5 → 12 | 2 boutons |  |
| `reglementation-dora` | 375 → **508** (+133) | 4 → 5 | 3 FAQ |  |
| `gouvernance-power-platform-conseils` | 1092 → **1154** (+62) | 9 → 15 | 1 bouton | lien du guide → campagne Licences (D18) |
| `migration-windows-11-microsoft-exchange` | 554 → **613** (+59) | 1 → 7 | — |  |
| `applications-microsoft-viva-demystifier-viva` | 625 → **667** (+42) | 8 → 12 | — |  |
| `certification-iso-27001-iso-9001` | 321 → **361** (+40) | 0 → 6 | — |  |
| `audit-cybersecurite` | 662 → **698** (+36) | 3 → 8 | — |  |
| `ia-servicenow` | 952 → **987** (+35) | 6 → 10 | 4 boutons, 4 tableaux |  |
| `pentest-cybersecurite` | 1117 → **1152** (+35) | 6 → 10 | 2 boutons, 1 tableau |  |
| `tendances-ti` | 710 → **742** (+32) | 11 → 14 | — | CTA « Téléchargez le guide » → services gérés (D18) |
| `developpement-offre-cybersecurite-france` | 251 → **269** (+18) | 1 → 3 | — |  |
| `externalisation-soc-avantages-inconvenients` | 838 → **838** (=) | 8 → 8 | — | source absente de l'ancien site (404) : rien à comparer |
| `sase-cloud` | 956 → **956** (=) | 9 → 9 | — | page source EN en français : non comparable, traduction relue |
| `servicenow-itom` | 1121 → **1121** (=) | 12 → 12 | 1 tableau | page source EN en français : non comparable, traduction relue |
| `servicenow-itsm` | 790 → **790** (=) | 11 → 11 | 2 boutons, 1 tableau | page source EN en français : non comparable, traduction relue |
| `zero-trust-network-access-ztna` | 747 → **747** (=) | 4 → 4 | — | page source EN en français : non comparable, traduction relue |

### Les 13 brouillons (retirés à la demande de Julie, D19)

| Article | Langue | Ancienne adresse → 301 vers |
| --- | --- | --- |
| `annonce-nomination-ceo` | EN | /decouvrir-victrix/ |
| `annonce-nomination-ceo` | FR | /decouvrir-victrix/ |
| `nomination-dominic-lajoie` | EN | /decouvrir-victrix/ |
| `nomination-dominic-lajoie` | FR | /decouvrir-victrix/ |
| `partie-1-meilleures-pratiques-en-securite-operationnelle-la-maintenance` | EN | page SOC |
| `partie-1-meilleures-pratiques-en-securite-operationnelle-la-maintenance` | FR | page SOC |
| `partie-2-meilleures-pratiques-en-securite-operationnelle-la-surveillance` | EN | page SOC |
| `partie-2-meilleures-pratiques-en-securite-operationnelle-la-surveillance` | FR | page SOC |
| `partie-3-meilleures-pratiques-en-securite-operationnelle-la-defense` | EN | page SOC |
| `partie-3-meilleures-pratiques-en-securite-operationnelle-la-defense` | FR | page SOC |
| `realite-etendue-xr-partenariat-agc` | EN | /services/ia/ |
| `realite-etendue-xr-partenariat-agc` | FR | /services/ia/ |
| `une-journee-dans-la-vie-secops` | FR | page SOC |

Ils restent dans CloudCannon (tri « Brouillons d'abord ») ; passer `draft` à
faux les republie, et la 301 correspondante tombe automatiquement.

## 4. Ce qui reste à faire sur les articles

1. **Images du corps des articles — FAIT le 25/09 après-midi** : 40 images
   reposées dans 25 articles (infographies ServiceNow ITOM et SOC, bannières
   Copilot Studio et webinaire, photos des articles pentest, audit, Loi 25,
   IoT, Windows 11, DORA, rançongiciels, bannière Victrix de ZTNA et SASE) et
   les 36 images de NIS2 FR/EN servies en local. Reste, à décider par Julie :
   les 3 infographies de l'article ServiceNow ITOM anglais n'existent qu'en
   français (non posées dans l'article EN) ; deux textes alternatifs hérités
   de l'ancien site sont faux (FAQ de NIS2 : « loi Dora » ; article IoT :
   « Loi 25 ») — à corriger dans l'éditeur.
2. **Liens à l'intérieur des blocs remis** : la remise du 23/09 lit la source
   en texte nu, les hyperliens de ces blocs ne sont pas reconstitués. À relire
   par Julie dans l'éditeur (bouton « lien »).
3. **Trois demandes de Julie ouvertes** : le bouton HTML de l'article Copilot
   Studio à relabeller (lequel ?), le sélecteur d'étiquettes, les bannières
   de blogue. Et le libellé des cartes Ressources par catégorie (L08).
4. **Snippets CloudCannon** pour insérer bouton / encadré / FAQ / tableau
   d'un clic : impossible en `.md` pur ; décision `.mdx` ou modèles à coller
   (décrits dans le guide).
5. Détail : 4 articles (certification ISO, Windows 11, FR + EN) ont leur
   délimiteur de front matter collé au premier titre ; ils se rendent, mais
   c'est fragile (4 retours à la ligne).

## 5. Comment le revérifier

```
npm run build
python scripts/migration/blocs-manquants-articles.py      # texte : 0 bloc absent attendu (3 assumés)
python scripts/migration/images-manquantes-articles.py    # images : 44 + 36 tant que L-images-articles n'est pas fait
npm run check:parite-texte -- --strict                   # exit 0
```
