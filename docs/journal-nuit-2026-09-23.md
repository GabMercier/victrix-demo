# Journal de nuit — 2026-09-23

> Session sans surveillance. Aucune commande git qui écrit, aucun accès à
> Azure DevOps. Un lot = une entrée, écrite dès le lot fini (ou arrêté).

## Point d'état (début de session)

- HEAD : `bcdcbab` (« feat: parité des URL, SEO/contenu de l'accueil, images,
  etc. »), c'est-à-dire APRÈS `bce519e` : les 8 lots du 23/09 sont commités.
- `git status` : arbre PROPRE au départ.
- Port 4321 : LIBRE → build et type-check dans le dépôt lui-même, pas besoin
  de copie isolée.
- Décisions ouvertes (plan du 23/09 § 6) qui touchent cette session : aucune
  ne bloque L-parite-texte. D7 (L12), D12 (L-prix), #1634, #1633, jeton
  Greenhouse, domaine canonique restent en attente de Gabriel.

## L-parite-texte — TERMINÉ

### Ce qui a été fait

Le filet qui manquait : `scripts/migration/check-parite-texte.py` (+ `npm run
check:parite-texte`) compare, page cible par page cible (151), le TEXTE de la
page EN LIGNE de victrix.ca à `<main>` du build — ratio de mots et titres H2/H3
absents — en réutilisant le parseur existant (`Blocks`), le parcours de
`check:old-urls` (routing.json + dist/) et les décisions de
`correspondance-urls.json`. Les 157 pages source sont en cache dans
`docs/migration/cache-source/` (allégées des scripts, styles et SVG : 8,6 Mo).
Rapport : `docs/migration/parite-texte.md`. Rien n'a été restauré.

**Résultat : 24 pages signalées sur 151** (13 sous le ratio 0,7, 20 avec un
bloc perdu), 97 pages avec des titres seulement reformulés, 9 adresses hors
comparaison (les décisions déjà prises : vœux des fêtes, documents O bureau,
prix Check Point, 3 `/document/*`, `/cache/`).

### Écart assumé par rapport au prompt

Le prompt signalait « ratio < 0,7 OU ≥ 1 titre perdu ». À la première passe,
**119 pages sur 151** étaient signalées, presque toutes parce que la refonte a
RACCOURCI des titres (« Gradation de la preuve de concept » → « Gradation »,
« Rencontrez nos experts en solutions infonuagiques » → CTA standard) : le
texte, lui, était là. Le script distingue donc le **bloc perdu** (titre absent
ET moins de 50 % des mots significatifs de ses paragraphes retrouvés dans la
cible — ✗) du **titre reformulé** (texte retrouvé — ≈). Seul le bloc perdu
signale la page ; les titres reformulés restent listés dans la colonne.
Vérifié sur Découvrir et l'Accueil (restaurés par L-contenu-perdu) : propres.

### Passe à la main — les 24 signalées, toutes relues (pas seulement 10)

Trois verdicts possibles : (i) contenu perdu à restaurer, (ii) bloc abandonné
volontairement, (iii) faux positif du parseur. **Aucun (iii) parmi les 24.**

**(i) Perte SYSTÉMATIQUE dans les articles — 9 articles × 2 langues.** Les
blocs manquants sont absents des `.md` (vérifié par recherche de texte), et
les pages en ligne datent des 8–14 juillet, AVANT l'export du 23/07 : c'est
la conversion des articles (`convert-articles.mjs`, juillet) qui a laissé
tomber les FAQ, les encadrés et certaines sous-sections. Mots source → cible :

| # | Article (FR / EN) | Bloc perdu, nommé | Ampleur |
| --- | --- | --- | --- |
| 1 | `fonctionnalites-microsoft-copilot` — FR 998 → 270, EN 833 → 238 | « Copilot dans … » (Word, PowerPoint, Excel, Teams, Outlook, Copilot Studio) ET « Les avantages d'un assistant IA Copilot pour toutes vos tâches » (accélération, créativité, sécurité) | ≈ 700 mots par langue — **le plus gros trou** |
| 2 | `copilot-vs-chatgpt` — FR 1 292 → 773, EN 1 172 → 708 | « Les modèles gratuits » (3 sous-blocs, 215 mots) et « FAQ — Copilot vs ChatGPT » (6 questions, 245 mots) ; « Les modèles payants » retrouvé à 53 % seulement ; les TABLEAUX comparatifs ne sont pas comptés côté source (cellules hors parseur) — à vérifier à la main | ≈ 500 mots |
| 3 | `loi-25-donnees-personnelles-guide` — FR 824 → 494, EN 662 → 385 | « Résumé Loi 25 : guide rapide » — 4 questions-réponses (qu'est-ce que la loi 25, à qui elle s'applique, employés, en vigueur depuis quand) | 310 mots |
| 4 | `securite-iot-defis` — FR 663 → 421, EN 550 → 350 | « Questions fréquentes sur l'Internet des objets » — 4 Q/R + les menaces | 229 mots |
| 5 | `directive-nis2` — FR 827 → 567, EN 680 → 432 | « Résumé rapide sur la directive NIS2 » — définition, citation de l'ANSSI, « êtes-vous concerné » (+1 000 entités, +18 secteurs), date d'entrée en vigueur | 256 mots |
| 6 | `ransomware-rancongiciels` — FR 2 518 → 1 979, EN 2 173 → 1 691 | « Quelques questions fréquentes sur les attaques par ransomware » — 5 Q/R | 548 mots |
| 7 | `mise-en-place-soc` — FR 1 511 → 1 738, EN 1 313 → 1 479 (cible plus longue, et pourtant) | « Comment choisir votre fournisseur de services SOC ? » — 4 critères | 122 mots |
| 8 | `agents-copilot-studio` — FR 1 311 → 958, EN 1 177 → 841 | encadré « Le saviez-vous ? » — étude Cornell, chiffres | 90 mots |
| 9 | `realite-etendue-xr-partenariat-agc` — FR 1 085 → 840, EN 972 → 739 | encadré « Le saviez-vous ? » — définitions RV / RA / RM | 219 mots |

**(i) Services et campagne :**

| # | Page | Bloc perdu, nommé | Ampleur |
| --- | --- | --- | --- |
| 10 | `/fr/services/productivite/` (526 → 372) et `/en/services/productivity-consulting/` (574 → 334) — `src/content/services/*/productivite.json` | « Victrix soutient les entreprises dans l'amélioration de la productivité » (2 paragraphes) et « Gagnez du temps grâce aux meilleures applications de productivité » (2 paragraphes) ; en EN aussi l'intro de « Our Technologies » et « Employee Platform & Intranet » (41 % retrouvés). Même cas que Découvrir : sections existantes (`rich-text` / `text-photo`), aucun champ nouveau | 120 mots FR, 250 EN |
| 12 | `/fr/campagnes/licences-power-platform/` (277 → 202) — `src/content/landing/fr/licences-power-platform.md` | paragraphe « Découvrez le guide simplifié… » : « Nos experts Ø Studio ont travaillé sur un guide explicatif… » | 41 mots |

**(ii) Abandon volontaire probable — à confirmer :**

| # | Page | Bloc absent | Pourquoi (ii) |
| --- | --- | --- | --- |
| 11 | `/fr/services/conseil-strategique/` (322 → 307) | « Vie chez Victrix » (18 mots : « approche humaine… Faites partie de l'équipe ») et « Ils nous font confiance » (bandeau de logos, sans texte) | teaser Carrières + logos (D4) ; la page EN n'est pas signalée |
| 13 | `/fr/merci/` (131 → 14) et `/en/merci/` (46 → 18) — `src/data/pages-systeme/*.json` | l'ancienne page liste ≈ 25 liens de services (plan de site officieux) et promet un expert « dans les 24 heures » ; la nôtre : une phrase + 2 boutons | page système redessinée ; `inventaire-campagnes.md` § 2 demandait seulement de « vérifier les liens » |

Si Gabriel confirme (ii) pour 11 et 13, ces trois pages s'écrivent dans
`correspondance-urls.json` → `parite_texte_assumee` et `--strict` peut entrer
au gate.

### Fichiers touchés

- `scripts/migration/check-parite-texte.py` (nouveau)
- `docs/migration/parite-texte.md` (nouveau, généré)
- `docs/migration/cache-source/` (nouveau : `_index.json` + 157 `.html`, 8,6 Mo —
  **décision : committer** ; c'est la copie de l'ancien site qui survivra à sa
  mise hors ligne, et le garde-fou tourne alors sans réseau)
- `package.json` (`check:parite-texte`)
- `docs/operations.md` (ligne du gate + paragraphe + commande)
- `docs/plan-livraison-finale.md` (§ 7, ligne L-parite-texte)
- `docs/journal-nuit-2026-09-23.md` (ce journal)
- `docs/guide-edition.md` : rien à changer (aucun champ ni comportement pour
  l'éditrice)

### Gate (chiffres réels, arbre entier, port 4321 libre → dans le dépôt)

| Commande | Résultat |
| --- | --- |
| `npm run lint` | 0 erreur, 4 avertissements a11y préexistants |
| `npm test` | 25 fichiers, **227 / 227** |
| `npm run type-check` | 186 fichiers, 0 erreur, 0 avertissement (indices seulement) |
| `npm run build` | OK — 186 pages (`_cloudcannon/routing.json` : 375 routes, 5 règles d'en-têtes) |
| `npm run check:links -- --strict` | 186 pages, 15 446 liens internes, **0 cassé** |
| `npm run check:sections` | 0 clé manquante |
| `npm run test:e2e` | **69 / 69** en 43,7 s (lancé APRÈS la chaîne de build : Playwright démarre `npm run dev` sur 4321) |
| `npm run check:bookshop` | **42 / 42** |
| `npm run cms:previews:check` | 11 pastilles, 34 pictogrammes, alignés |
| `npm run check:redirects` | 175 règles, 0 sans cible, 0 doublon |
| `node scripts/build-redirects.mjs --dist` | **175 / 175** cibles dans `dist/` |
| `npm run check:old-urls` | 172 / 173 (inchangé ; régénère `validation-301.md` : seule la ligne « Mesuré contre le build » change, chemin isolé → `.\dist` — **pas ajouté au lot**) |
| `npm run check:parite-texte` | 151 comparées, 24 signalées (13 / 20), 97 reformulées, 9 hors comparaison, code 0 |

### Vu ailleurs, NON corrigé (hors périmètre)

- `convert-articles.mjs` (juillet) a laissé tomber des blocs entiers (FAQ,
  encadrés « Le saviez-vous ? », sous-sections) : la cause racine est à
  regarder dans L-restaure — les blocs manquants se lisent maintenant dans le
  cache source (`docs/migration/cache-source/<slug>.html`), sans l'export WXR.
- Les tableaux HTML des pages source (`<td>`) ne sont comptés ni par le
  parseur ni dans ce rapport : `copilot-vs-chatgpt` en a trois.
- `check:old-urls` régénère `docs/migration/validation-301.md` et la colonne
  d'état de `docs/inventaire-pages.md` à chaque gate : s'ils apparaissent
  modifiés dans `git status`, c'est lui, pas ce lot.

### Décisions à prendre par Gabriel

1. Committer le cache source (8,6 Mo) ou l'ajouter à `.gitignore`.
2. Trancher les 13 lignes ci-dessus : recommandation = restaurer 1–10 et 12,
   assumer 11 et 13.
3. Lot suivant : **L-restaure** (la liste est longue : 9 articles × 2 langues,
   plus Productivité FR/EN et 1 campagne), avant L10.

### Commandes prêtes à coller (rien n'a été exécuté)

```powershell
git fetch
git log --oneline HEAD..origin/dev        # sauvegardes CloudCannon à absorber ?
git pull --no-rebase
git add scripts/migration/check-parite-texte.py package.json docs/operations.md docs/plan-livraison-finale.md docs/migration/parite-texte.md docs/journal-nuit-2026-09-23.md
git add docs/migration/cache-source       # 158 fichiers, 8,6 Mo — la copie de l'ancien site (ou : l'ajouter à .gitignore)
git commit -m "feat(parite): garde-fou check:parite-texte - le texte de l'ancien site est-il arrive ? (151 pages, 24 signalees) + cache des pages source" -m "Une ligne par page cible : ratio de mots et titres H2/H3 absents, bloc perdu (titre + texte) distingue du titre reformule. Revele une perte systematique dans 9 articles x 2 langues (FAQ, encadres, sous-sections) a la conversion de juillet, 2 blocs de Productivite FR/EN, 1 paragraphe de campagne. Rapport docs/migration/parite-texte.md ; verdicts et liste a trancher dans docs/journal-nuit-2026-09-23.md. Rapport seul, code 0 ; --strict bloquant une fois parite_texte_assumee ecrit." -m "Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
git push
# NE PAS ajouter : docs/migration/validation-301.md (régénéré par le gate) ni scripts/migration/__pycache__/*.pyc

# Story du lot (parent #1502 = garde-fous, comme check:links — à confirmer)
$id = az boards work-item create --type "User Story" --title "Garde-fou de parite du TEXTE avec l'ancien site (check:parite-texte) - LIVRE le 23/09" --query id --output tsv
az boards work-item relation add --id $id --relation-type parent --target-id 1502 --output none
az boards work-item update --id $id --state Closed --output none
# Story du lot suivant
$id2 = az boards work-item create --type "User Story" --title "Restaurer le contenu perdu a la migration : FAQ et encadres de 9 articles, Productivite FR/EN, campagne Licences" --query id --output tsv
az boards work-item relation add --id $id2 --relation-type parent --target-id 1502 --output none
```

## L-restaure — TERMINÉ

### Ce qui a été fait

Le périmètre tranché par Gabriel (lignes 1–10 et 12 de la liste ci-dessus) est
restauré : **21 fichiers, 197 blocs, ≈ 7 850 mots remis MOT POUR MOT** depuis
`docs/migration/cache-source/`, jamais reformulés. Aucun composant, aucun champ,
aucune image, aucun changement de rendu.

- **9 articles × FR/EN** (`src/content/blog/`) : les FAQ en accordéon (Copilot
  vs ChatGPT, Loi 25, IoT, NIS2, ransomware), les encadrés « Le saviez-vous ? »
  (agents Copilot Studio, réalité étendue, SOC), le « Comment choisir votre
  fournisseur de services SOC ? » et ses 4 critères, et surtout les
  sous-sections « Copilot dans Word / PowerPoint / Excel / Teams / Outlook /
  Copilot Studio » + « Les avantages d'un assistant IA Copilot ».
  `fonctionnalites-microsoft-copilot` FR passe de **270 à 998 mots** : il avait
  perdu les trois quarts de son texte ET la totalité de ses titres.
- **Productivité** (`src/content/services/{fr,en}/productivite.json`) : 2 blocs
  en FR, 4 en EN, posés en sections `rich-text` — composant EXISTANT, contrat
  `{_bookshop_name, type, title, fond, paragraphs}`, aucun champ neuf.
- **Campagne Licences Power Platform** : le paragraphe du guide, dans
  `benefits.intro` — champ existant du schéma.
- **Tableaux de `copilot-vs-chatgpt`** (hors du décompte du parseur) : les 3
  tableaux HTML bruts de chaque langue ont été relus cellule par cellule contre
  la source. Complets, rien à compléter.

### Cause racine (lue, pas devinée — conversion NON relancée)

`extractBlocks` (`scripts/migration/lib-wxr.mjs`) ne garde du `content:encoded`
exporté que les blocs `siteorigin-widget-tinymce textwidget`. Or le contenu des
widgets TIERS n'est pas rendu en HTML dans l'export : il dort en JSON dans un
`<input type="hidden">` de raccourci `[siteorigin_widget class="…"]`. Vérifié
dans l'export du 23/07, widget par widget : `MAG_Accordion_Image_register_Widget`
portait les FAQ, les « Résumé rapide » et les « Copilot dans… » ;
`MAG_Glass_Contents_register_Widget` les encadrés « Le saviez-vous ? » ;
`SiteOrigin_Widget_Headline_Widget` les titres H2/H3 — d'où un article arrivé
sans le moindre titre. **L'abandon a été SILENCIEUX** : l'avertissement « widget
SiteOrigin non-éditeur ignoré » cherche une classe `so-widget-sow-…` que seuls
les widgets DÉJÀ rendus portent, jamais un raccourci tiers — zéro avertissement
dans `rapport-articles.md`, alors que 18 articles étaient amputés.
`convert-articles.mjs` n'a PAS été relancé (l'éditrice a modifié des articles
depuis) : tout a été remis à la main, bloc par bloc.

### Exceptions assumées + `--strict` au gate

`docs/migration/correspondance-urls.json` reçoit la clé `parite_texte_assumee`
(page cible → raison, affichée dans le rapport) pour les 3 pages hors
périmètre : `/fr/merci/` et `/en/merci/` (l'ancienne page de remerciement
servait de plan de site officieux, ≈ 25 liens de services) et
`/fr/services/conseil-strategique/` (« Vie chez Victrix » = teaser Carrières,
« Ils nous font confiance » = bandeau de logos, décision D4).
`npm run check:parite-texte -- --strict` sort donc en **0** et **entre au gate**
du `CLAUDE.md` et de `docs/operations.md`, qui reçoit aussi la recette de
restauration (réutiliser `blocs_source`, ne jamais relancer la conversion).

### Gate (chiffres réels, port 4321 libre → dans le dépôt)

| Commande | Résultat |
| --- | --- |
| `npm run lint` | 0 erreur, 4 avertissements a11y préexistants |
| `npm test` | 25 fichiers, **227 / 227** |
| `npm run type-check` | 186 fichiers, 0 erreur, 0 avertissement, 8 indices |
| `npm run build` | OK — 186 pages, 375 routes, 5 règles d'en-têtes |
| `npm run check:links -- --strict` | 186 pages, **15 467** liens internes (15 446 avant : +21 liens restaurés), **0 cassé** |
| `npm run check:sections` | 0 clé manquante |
| `npm run test:e2e` | **69 / 69** en 39,2 s |
| `npm run check:bookshop` | **42 / 42** |
| `npm run cms:previews:check` | 11 pastilles, 34 pictogrammes, alignés |
| `npm run check:redirects` | 175 règles, 0 sans cible, 0 doublon |
| `node scripts/build-redirects.mjs --dist` | **175 / 175** cibles dans `dist/` |
| `npm run check:old-urls` | 172 / 173 (inchangé) |
| `npm run check:parite-texte -- --strict` | 151 comparées, **24 signalées → 3, toutes assumées**, 100 titres reformulés, **code 0** |

### Écarts assumés par rapport au prompt

1. **Un bloc restauré a été RETIRÉ après coup.** L'agent chargé de Productivité
   EN avait ajouté une 5ᵉ section `rich-text` sans titre (« We offer our
   expertise in a host of aspects… », 46 mots) qui n'est nommée dans AUCUNE des
   lignes tranchées par Gabriel : le rapport la classait « ≈ reformulée », son
   texte vivant déjà en version condensée dans le chapeau de `expertise-bento`
   juste au-dessus. Remise telle quelle, la page disait deux fois la même chose.
   Retirée. Productivité EN garde les 4 blocs nommés à la ligne 10 ; ratio 0,98.
2. **Fidélité au mot près, coquilles de la source comprises.** « Savez vous »
   sans trait d'union dans le bloc Excel, et des `<strong>` qui démarrent au
   milieu d'un mot (« l'I**A générative dans Microsoft Teams** »). Corriger,
   c'était reformuler : laissé tel quel, à signaler à Julie si elle veut
   nettoyer.
3. **Aucune image rapatriée** (règle du lot). Les illustrations des blocs
   restaurés sont listées dans les rapports d'agents — dont une bannière
   promotionnelle datée (« webinaire Copilot, rediffusion ») dont la remise en
   ligne est une décision éditoriale, pas une restauration.
4. **Niveau de titre des sous-sections « Copilot dans … »** : la source les rend
   en simples paragraphes (widget « headline »). Écrites en `####` pour les
   subordonner au `###` parent, convention déjà en usage dans
   `ia-servicenow.md` et `audit-cybersecurite.md`. À confirmer.

### À trancher par un humain

- Les coquilles de la source conservées (point 2 ci-dessus) : nettoyer ou non.
- La bannière promotionnelle du webinaire Copilot : la remettre ou non.
- Le titre hérité « Copilot dans ... » (trois points) : le garder tel quel ou
  l'écrire proprement.

### Vu ailleurs, NON corrigé (hors périmètre)

- `src/content/blog/fr/fonctionnalites-microsoft-copilot.md` : le lien de
  clôture n'est pas séparé du paragraphe précédent par une ligne vide (défaut
  PRÉEXISTANT, hors des blocs restaurés).
- `.prose` n'a aucun style de `table` : les 3 tableaux de `copilot-vs-chatgpt`
  rendent sans bordure ni rythme. Antérieur au lot, aucun changement de rendu
  n'étant permis ici.
- 2 articles FR sans traduction EN (`societe-conseil-lambda-victrix`,
  `une-journee-dans-la-vie-secops`) — avertissement de build préexistant.
