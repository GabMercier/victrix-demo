# Recensement des pages de campagne et des pages cachées de victrix.ca

> Fait le 2026-09-21 à la demande de Gabriel, à partir de l'exemple
> `/expertise/intelligence-artificielle/accompagnement-ia/`. Trois sources
> croisées, aucune supposition :
>
> 1. **l'export WXR** du 23/07 (174 contenus, brouillons et pages cachées
>    compris) ;
> 2. **l'API REST de victrix.ca** (`/wp-json/wp/v2/pages`) — elle liste les
>    pages publiées **y compris celles en `noindex`**, que le plan de site
>    n'expose pas ;
> 3. **un balayage du site en ligne** : 203 URL visitées en suivant les liens
>    depuis les 150 URL du plan de site
>    (`scripts/migration/check-parite-live.py`, cache
>    `docs/migration/urls-live.csv`).

## 1. Ce qui est prouvé : le recensement est clos (ou presque)

| Type de contenu | Export 23/07 | En ligne aujourd'hui | Verdict |
| --- | --- | --- | --- |
| Pages (`page`) | 24 publiées | **24** (API REST) | ✅ aucune page nouvelle ni disparue |
| Pages de service (`expertise`) | 73 publiées | 70 indexées **+ 3 en `noindex`** | ✅ les 3 manquantes sont exactement les 3 pages cachées connues |
| Articles (`post`) | 62 publiés | 62 **+ `/cache/`** (rebut) | ✅ aucun article nouveau — mais **9 slugs ont été renommés** (§ 4) |
| Documents (`dlm_download`) | 4 publiés | 4 | ⏳ = lot L12 |

**Il n'y a donc pas de page de campagne inconnue dans l'export.** Le balayage
le confirme par l'autre bout : en suivant tous les liens du site, on ne trouve
que **9 URL en `noindex`**, toutes déjà identifiées. Les pages de campagne ne
sont liées de nulle part — c'est pour ça qu'on ne les trouve qu'en connaissant
leur URL (exactement le cas de celle que tu m'as donnée).

## 2. Les 14 pages non indexées, une par une

État « ✅ reprise » = déjà dans le dépôt (lot du 21/09).

| Page de l'ancien site | Moteur | Mots | État | Recommandation |
| --- | --- | --- | --- | --- |
| `/expertise/intelligence-artificielle/accompagnement-ia/` | Brizy | ~2 400 | ✅ **reprise** → `src/content/services/fr/intelligence-artificielle/accompagnement-ia.json` (10 sections) | rien à faire — **c'est la page de ton exemple** |
| `/en/expertise/artificial-intelligence/landing-ai-consulting/` | Brizy | ~2 400 | ✅ reprise → jumelle EN (slug conservé) | rien à faire |
| `/expertise/productivite/o-bureau/demo-o-bureau/` | Brizy | — | ✅ reprise | rien à faire |
| `/en/expertise/productivity-consulting/office-booking/landing-demo-obureau/` | Brizy | — | ✅ reprise | rien à faire |
| `/voeux-des-fetes/` | Brizy | 81 blocs, 17 images | ❌ non reprise | **campagne VIVANTE, pas un vestige** : le contenu parle du Train des fêtes « de retour en 2025 », images déposées en novembre 2025. Page saisonnière que le marketing remet à jour chaque année → **à reprendre**, en page de campagne (`landing`) |
| `/en/holiday-wishes/` | Brizy | 82 blocs, 17 images | ❌ non reprise | idem, jumelle EN |
| `/liste-prix-check-point/` | Brizy | 5 blocs, 1 image, ~9 900 mots servis | ❌ non reprise | ce n'est **pas une page vitrine** : un H1, deux tableaux de prix et un formulaire Gravity = un **outil de commande**. Décision marketing (déjà listée comme « reste à faire » dans la mémoire du projet) |
| `/en/check-point-price-list/` | Brizy | idem | ❌ non reprise | idem |
| `/expertise/productivite/o-bureau/documents-o-bureau/` | Brizy | 0 bloc lisible | ❌ non reprise | **protégée par mot de passe** : le corps n'est pas servi sans le mot de passe → relève du lot L12 (accès conditionnel), contenu à récupérer dans l'export ou auprès de Julie |
| `/page-de-remerciement/` + `/en/thank-you-page/` | SiteOrigin | ~1 300 | ✅ équivalent = route `merci.astro` | vérifier que la nôtre liste bien les mêmes liens (l'ancienne sert de plan de site officieux) |
| `/politique-de-confidentialite/`, `/conditions-dutilisation/` + jumelles EN | — | — | ✅ reprises | rien à faire |
| `/no-access/` + `/en/no-access/` | — | — | ✅ équivalent portail | rien à faire |

Et **3 brouillons** de l'export, jamais publiés, donc invisibles en ligne :
« Dîner Victrix et Palo Alto », « Événement Victrix × Cask × ServiceNow
(20 mai 2025) », « "Êtes-vous en sécurité ?" ». Ce sont des événements passés
→ **abandonner**, sauf avis contraire. Leur contenu n'existe que dans l'export
(l'outil d'extraction ne les voit pas : WordPress ne sert pas les brouillons).

## 3. Contenu déjà extrait, prêt à relire

`scripts/migration/extract-source-page.py` (nouveau, rejouable) écrit le texte
d'une page de l'ancien site bloc par bloc, avec ses images et leurs `alt` :

```powershell
python scripts/migration/extract-source-page.py /voeux-des-fetes/
python scripts/migration/extract-source-page.py --images /voeux-des-fetes/   # + télécharge les images
```

Déjà produit dans `docs/migration/campagnes/` :

- `voeux-des-fetes.md` — 81 blocs, 17 images (les 12 idées, une par section,
  chacune signée par un employé avec un lien LinkedIn)
- `en-holiday-wishes.md` — 82 blocs, 17 images
- `liste-prix-check-point.md` et `en-check-point-price-list.md` — confirment
  que la page n'est qu'un formulaire + des tableaux
- `expertise-productivite-o-bureau-documents-o-bureau.md` — vide (mot de passe)

## 4. Ce que le balayage a trouvé en plus — et c'est le plus urgent

### 4.1 Neuf articles ont changé de slug depuis l'export

Julie a fait une passe SEO après le 23/07. **Notre dépôt utilise les anciens
slugs** : au lancement, les URL qui circulent aujourd'hui (Google, LinkedIn,
courriels) tomberaient en 404.

| URL qui circule aujourd'hui | Slug dans notre dépôt |
| --- | --- |
| `/meilleures-pratiques-en-securite-operationnelle-la-maintenance/` | `partie-1-meilleures-pratiques-…-la-maintenance` |
| `/meilleures-pratiques-en-securite-operationnelle-la-surveillance/` | `partie-2-…-la-surveillance` |
| `/meilleures-pratiques-en-securite-operationnelle-la-defense/` | `partie-3-…-la-defense` |
| `/en/best-practices-in-operational-security-monitoring/` | `part-2-best-practices-in-operational-security-monitoring` |
| `/en/best-practices-in-operational-security-defense/` | `part-3-best-practices-in-operational-security-defense` |
| `/externalisation-du-soc-avantages-inconvenients/` | `externalisation-soc-avantages-inconvenients` |
| `/en/soc-outsourcing-for-smbs-pros-cons/` | `soc-outsourcing-pros-cons` |
| `/zero-trust-network-access-ztna-modele-de-cybersecurite-optimal/` | `zero-trust-network-access-ztna` |
| `/en/zero-trust-network-access-ztna-ultimate-cybersecurity-model/` | `zero-trust-network-access-ztna` |

À trancher : **soit** on adopte les nouveaux slugs (meilleur pour le SEO
acquis), **soit** on garde les nôtres et on écrit 9 redirections. Recommandation
: adopter les slugs en ligne, et rediriger les anciens.

Preuve que le renommage est récent : le site en ligne lui-même a **2 liens
cassés** vers les anciens slugs — `/en/soc-outsourcing-pros-cons/` et
`/externalisation-soc-avantages-inconvenients/` répondent 404 aujourd'hui,
depuis 3 pages chacun.

### 4.2 Dix anciennes URL de services répondent encore 200

Trouvées en suivant les liens de la page de remerciement, qui les utilise
encore. Elles ne sont pas dans le plan de site, et la règle générique
`/expertise/*` → `/fr/services/:splat` les enverrait vers des pages **qui
n'existent pas chez nous** → 404. Les cibles ci-dessous viennent de la balise
`canonical` de chaque page (donc de WordPress lui-même) :

| Ancienne URL (200 aujourd'hui) | Cible canonique | Notre page |
| --- | --- | --- |
| `/expertise/securite-informatique/` | `/expertise/cybersecurite/` | `services/fr/cybersecurite.json` |
| `/expertise/securite-informatique/zero-trust/` | `/expertise/cybersecurite/zero-trust/` | existe |
| `/expertise/securite-informatique/test-intrusion-pentest/` | `/expertise/cybersecurite/test-intrusion-pentest/` | existe |
| `/expertise/securite-informatique/centre-operationnel-de-securite-evolutif/` | `/expertise/cybersecurite/centre-operationnel-de-securite-evolutif/` | existe |
| `/expertise/loi-25-etes-vous-en-conformite/` | `/expertise/conseil-strategique/conformite-loi-25/` | existe |
| `/expertise/fournisseur-services-geres-ti/` | `/expertise/services-ti-geres/` | existe |
| `/expertise/productivite/plateforme-employe-microsoft-viva-365/` | `/expertise/productivite/plateforme-employe-intranet/` | existe |
| `/en/expertise/ai-opportunity-analysis/` | `/en/expertise/artificial-intelligence/ai-opportunity-analysis/` | existe |
| `/en/expertise/it-managed-services-provider/` | `/en/expertise/managed-it-services/` | existe |
| `/solution/migration/` | `/expertise/services-infonuagiques/migration-vers-azure/` | existe |

`/solution/migration/` révèle en plus un **ancien type de contenu `/solution/`**
dont il reste au moins cette URL en ligne.

→ Ces 10 lignes + les 9 du § 4.1 sont des **redirections explicites** à ajouter
à `src/data/redirects.json` (aujourd'hui : 3 règles seulement). C'est le lot
L15/L21 du plan de livraison, mais la liste, elle, est faite.

### 4.3 Anomalies du site actuel, à signaler à Julie

- **`/cache/`** — un article intitulé « cache », 971 mots, modifié le
  2026-08-10, **présent dans le plan de site donc indexable** : rebut de test à
  supprimer dans WordPress (ne pas migrer).
- La page `/en/zero-trust-network-access-ztna-ultimate-cybersecurity-model/`
  déclare une **canonique vers la version FR** : erreur Yoast/Polylang qui dit
  à Google d'ignorer la page anglaise.
- `/xmlrpc.php` est lié depuis 190 pages (en-tête WordPress) et répond 403 —
  sans objet après la migration, mais c'est ce qui explique les alertes de
  scan de sécurité.

## 5. Le seul angle mort qui reste

Une page qui serait à la fois **créée après le 23/07**, **en `noindex`**, **de
type `expertise`** (le seul type que l'API REST n'expose pas) et **liée de
nulle part** échapperait aux trois sources. Le compte des `expertise` (73 dans
l'export = 70 indexées + 3 cachées en ligne) rend ce cas peu probable, mais il
n'est pas mathématiquement exclu.

**Une seule question à poser** — et elle ne porte plus sur « toutes les
campagnes », seulement sur ce résidu :

> Depuis la fin juillet, avez-vous créé une page de destination (campagne,
> événement, webinaire, liste de prix) qui n'apparaît pas dans le menu du site ?
> J'ai déjà retrouvé : accompagnement IA, démo O bureau, les vœux des fêtes et
> les listes de prix Check Point.

## 6. Suite proposée (lot P4 de `docs/plan-parite-et-raffinage.md`)

1. Tu tranches les 4 décisions du § 2 : vœux des fêtes (je recommande de
   reprendre), listes de prix Check Point, documents O bureau, 3 brouillons
   d'événements.
2. Import scripté des pages retenues dans la collection `landing`
   (route `/campagnes/`), sur le modèle de
   `scripts/migration/import-landing-accompagnement-ia.py` : sections
   existantes, `noindex: true`, `slug` conservé pour garder l'ancienne URL.
3. Les 19 redirections du § 4 entrent dans `src/data/redirects.json` (lot L15)
   — et le choix « adopter les nouveaux slugs d'articles » est à faire AVANT,
   parce qu'il change 9 fichiers de contenu.
