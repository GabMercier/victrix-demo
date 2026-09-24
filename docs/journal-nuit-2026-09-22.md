# Journal de nuit — 2026-09-22

> Session d'agent sans surveillance, lancée le soir du 2026-09-22 avec
> l'en-tête de nuit de `docs/prompts-nuit-2026-09-22.md` § 2bis.
> Lots demandés, dans l'ordre : **L-prefill**, **L01**, **L-polices**.
>
> Aucune commande git qui écrit n'a été lancée. L'arbre est laissé sale,
> c'est voulu. Azure DevOps n'a pas été touché.

## Contexte au démarrage

- Branche `dev`, arbre **propre** au départ (`git status` vide), HEAD =
  `7cfd254 fix(build): routing.json cache control`.
- **Le serveur de dev tourne** : port 4321 en écoute (PID 27632). Donc
  `build` / `type-check` / `check:links` dans une copie isolée
  (`docs/operations.md` § 3.1), le serveur n'a pas été tué.

---

## L-prefill — TERMINÉ

**Ce qui a été fait.** Les CTA du site arrivent désormais tous sur un formulaire
Contact dont les deux listes OBLIGATOIRES (« De quoi souhaitez-vous parler ? » et
« Service ») sont remplies. Le trou était plus large que les 18 liens annoncés :
le garde-fou mesure **171 liens de contenu** fautifs avant le lot, parce que
l'accueil, les campagnes, les articles et le centre de ressources ne passaient
AUCUN préremplissage — la route des pages générales n'était qu'un cas sur cinq.
Le formulaire surligne en plus, à l'arrivée, les champs obligatoires encore
vides (quatre depuis un CTA, six sans contexte).

**Comment.** Trois pièces, une seule source de vérité pour le repli :

1. `CONTACT_SUJET_DEFAULT` (= `projet`) dans `src/lib/contact/presets.ts` ; la
   route des services l'utilise à la place de son littéral `'projet'`.
2. Repli **explicite** dans la route des pages générales (ce que le prompt
   demandait) **et** filet **général** dans `BaseLayout` : un gabarit qui ne
   passe rien préremplit quand même. C'est le filet qui répare l'accueil, les
   campagnes, les articles et le centre de ressources sans leur inventer un
   champ d'éditeur ni deviner un contenu à la place de Julie. Un gabarit qui
   voudrait ne rien préremplir passe `contactPreset={{}}`.
3. Garde-fou rejouable `scripts/check-contact-prefill.mjs`
   (`npm run check:prefill`) : il rejoue sur `dist/` la mécanique d'exécution du
   site (`sujet final = ?sujet= du lien OU <body data-contact-sujet>`, idem pour
   le service) et échoue en nommant page et lien. Exceptions assumées dans la
   constante `CHROME_TAGS` : `<header>`, `<nav>`, `<footer>` — les liens que le
   site ignore volontairement. Ajouté au portail qualité de
   `docs/operations.md` ET à la CI (`.github/workflows/ci.yml`, après
   `check:links`).

**Le garde-fou a été PROUVÉ, pas seulement écrit vert** : j'ai rejoué le bogue
d'origine dans la copie isolée (repli retiré des deux endroits), rebuild →
`449 → 278` liens préremplis, **76 pages / 80 liens distincts** signalés, code de
sortie 1. Puis copie réalignée sur le dépôt et rebuild → 449/449, code 0.

**Surlignage.** Halo `ring-2 ring-primary/60` posé par le script du module de
`contact.astro`, après le préremplissage par l'URL. Classes déclarées dans le
frontmatter (`emptyMarkClass`) et transmises par `data-empty-mark` : écrites dans
le script, Tailwind pourrait ne pas les générer. `ring-*` et non un fond ou une
bordure — zéro conflit avec `inputClass`, donc aucune dépendance à l'ordre des
utilitaires, aucun décalage de mise en page, et le contraste du texte que mesure
axe ne bouge pas. Pas de `:invalid`. La case de consentement est exclue (geste à
poser, pas champ à remplir) : six champs obligatoires, pas sept.

**Fichiers touchés.**

- `src/lib/contact/presets.ts` (constante + son pourquoi)
- `src/pages/[lang]/[...slug].astro` (repli des pages générales)
- `src/pages/[lang]/services/[...slug].astro` (littéral → constante)
- `src/layouts/BaseLayout.astro` (filet général)
- `src/pages/[lang]/contact.astro` (surlignage : `emptyMarkClass`,
  `data-empty-mark`, bloc de script)
- `scripts/check-contact-prefill.mjs` (**nouveau**)
- `tests/e2e/contact-prefill.spec.ts` (**nouveau**, 10 tests)
- `package.json` (`check:prefill`), `.github/workflows/ci.yml`
- `docs/operations.md` (portail qualité + le piège ci-dessous),
  `docs/guide-edition.md` (3 passages), `docs/plan-livraison-finale.md` (§ 7)

**Gate — chiffres réels.** Serveur de dev en marche (port 4321, PID 27632) :
`build` / `type-check` / `check:links` / `check:prefill` / `check:redirects`
tournés dans la copie isolée `C:\Users\gmercierblouin\vvbuild`
(`docs/operations.md` § 3.1, robocopy mono-thread, `/XD` en chemins COMPLETS —
37 743 fichiers, 0 échec, `node_modules/astro/dist` vérifié présent).

| Commande | Résultat |
|---|---|
| `npm run lint` | 0 erreur, 4 avertissements a11y pré-existants (dont `contact.astro:532`, le libellé de consentement en `set:html`) |
| `npm test` | **189/189**, 21 fichiers |
| `npm run type-check` | **0 erreur**, 0 avertissement, 7 indices pré-existants (173 fichiers) |
| `npm run build` | OK — 186 pages, h1-guard 180 avec un seul `<h1>` / 0 sans, Pagefind 186 |
| `npm run check:links -- --strict` | **0 lien cassé** sur 15 431 liens / 186 pages |
| `npm run check:prefill` | **OK** — 822 liens vers le Contact : 449 préremplis, 373 chrome ignorés, 0 fautif |
| `npm run check:sections` | 0 clé manquante dans 0 fichier (clés suivies : `fond`, `image`) |
| `npm run test:e2e` | **67/67** (57 existants + 10 nouveaux), 27,1 s |
| `npm run check:bookshop` | 42 composants rejoués, 0 en échec |
| `npm run cms:previews:check` | 12 pastilles, 34 pictogrammes — alignés |
| `npm run check:redirects` | OK — 175 règles, 0 URL sans cible, 0 doublon |
| `node scripts/build-redirects.mjs --dist` | 175/175 cibles existent dans `dist/` |

`npm run design:previews` **non lancé** : aucune vignette de section ne change
(le halo ne vit que sur la page Contact, qui n'est pas une section Bookshop).

**Piège payé, à ne pas repayer** (écrit aussi dans `docs/operations.md`) :
chercher la première occurrence de `<body` dans le HTML construit tombe sur un
**commentaire de script en ligne** du `<head>` (« le ClientRouter remplace
`<body>` », script du banc d'essai) — le garde-fou lisait une balise sans
attribut et annonçait **449 CTA fautifs sur 449**. Il repart maintenant de
`</head>`, ce qui règle du même coup `<header>`/`<nav>`/`<footer>` et les
`<a href>` cités dans une chaîne de script.

**Ce qui reste / à valider par un humain.**

- Le repli mécanique est « Un projet » + « Autre » partout où rien n'est fixé.
  C'est correct mais générique : `expertises.json` gagnerait « Une expertise »,
  `produits.json` / `solutions.json` « Une solution du catalogue ». Je ne l'ai
  pas fait — c'est un choix de contenu, il se règle au CMS sans code (champs
  « Contact — sujet / service présélectionné »).
- Le halo n'a pas été jugé à l'œil par un humain : `ring-2 ring-primary/60`
  (≈ 3,7:1 sur blanc) est mon arbitrage de « calme mais visible ».
- Revue **R1** prévue au plan pour ce lot, avec L06.

**Décision à prendre par Gabriel.**

1. Le gate du `CLAUDE.md` énumère les commandes : y ajouter `check:prefill` ?
   Je ne l'ai pas modifié (fichier de règles, hors périmètre du lot) — c'est une
   ligne à ajouter après `check:links`.
2. Story ADO à créer : « Préremplissage garanti des CTA vers le Contact »
   (commande prête à coller dans la réponse finale, **non exécutée**).

---

## L01 — TERMINÉ

**Ce qui a été fait.** Un champ vidé au CMS ne fait plus échouer le build :
**39 champs** sont passés de `z.string().min(1)` à `.default('')` (sur 99
occurrences de `.min(1)` au départ — il en reste 60, toutes justifiées), avec
**18 replis au rendu** dans les six gabarits qui les consomment. Un test vide
ensuite **chaque chaîne** de `src/data` et `src/content/pages`, tour à tour, et
échoue en nommant le fichier et le champ.

**La règle, tranchée et écrite** (en tête de `src/content.config.ts`, et c'est
la même liste que dans le test) : `.min(1)` ne survit que si le champ vide
produirait un élément **sans nom accessible** ou **sans destination** —
destinations (`href`, `mailto`, `tel`), intitulés de commandes, `aria-label`,
titre visible de la page et `<title>`, contrat des formulaires. Tout le reste
(méta descriptions, surtitres, chapeaux, corps de texte, intitulés décoratifs,
textes de substitution, confirmations) devient tolérant.

**Ce que la vérification du gabarit a rattrapé** — la consigne « vérifie le
gabarit qui consomme le champ » a évité quatre régressions d'accessibilité que
la lecture du schéma seul ne montrait pas :

- `footer.columns[].title` et `footer.contactTitle` ne sont pas que des `<h2>` :
  ils sont aussi l'`aria-label` d'un repère `<nav>`. Vidés, deux repères du pied
  de page perdaient leur nom → **gardés structurels**.
- `ressources.searchPlaceholder` et `newsletter.emailPlaceholder` sont rendus en
  `sr-only` et servent de **libellé** à leur champ de saisie → **gardés**.
- `footer.phone` est le TEXTE du lien `tel:` → **gardé**.
- `ressources.eyebrow` nomme la section dans le fil d'Ariane des articles et
  dans le flux RSS → **gardé**.

**Replis au rendu ajoutés** (patron du dépôt, `{valeur && <élément>}`) : titres
et blocs décorés seulement — un `<p>` vide ne produit rien de visible et n'a pas
besoin de garde. `Header.astro` 4 (titre du bloc en vedette, texte du bandeau,
deux intitulés du panneau Ressources) · `Footer.astro` 1 (`socialLabel`) ·
`contact.astro` 8 (titre Coordonnées, 2 intitulés de rangée, ville ×2, titre du
formulaire, + filtrage des lignes d'adresse et des puces vides) ·
`ressources/index.astro` 5 · `recherche.astro` 3 · `merci.astro` 1.
**Non guardé volontairement** : les trois `<p>` de la 404 — ils portent les
attributs `data-nf-*` que le script de bascule EN cible, un garde les ferait
disparaître et la version anglaise ne s'écrirait plus nulle part.

**Le test.** `src/content.config.champs-vides.test.ts`, 16 cas. Il valide contre
les schémas **réels** de `src/content.config.ts` — pas une copie qui dériverait :
`astro:content` étant un module virtuel du pipeline Astro, deux doublures
minimales (`tests/stubs/`) l'aiguillent vers `astro/zod`, déclarées dans
`vitest.config.ts`. Il travaille dans les **deux sens** :

1. un champ qui refuse le vide sans être déclaré structurel → ÉCHEC ;
2. une entrée déclarée structurelle qui accepte désormais le vide → ÉCHEC aussi
   (l'entrée est périmée, elle ment sur le contrat).

Et un troisième cas vérifie qu'aucun dossier de `src/data` n'échappe à la table
de correspondance (les trois qui n'appartiennent à aucune collection y sont
listés avec leur raison). **94 champs structurels** sont inventoriés, chacun avec
sa raison en clair.

**Le test a été PROUVÉ** : `statusMessage` remis en `.min(1)` → échec nommant
`src/data/contact/en.json → statusMessage` et son homologue FR ; remis en
`.default('')` → 16/16.

**Fichiers touchés.**

- `src/content.config.ts` (39 champs + 2 tableaux de texte libre + la règle en
  en-tête)
- `src/components/Header.astro`, `src/components/Footer.astro`,
  `src/pages/[lang]/contact.astro`, `src/pages/[lang]/ressources/index.astro`,
  `src/pages/[lang]/recherche.astro`, `src/pages/[lang]/merci.astro` (replis)
- `src/content.config.champs-vides.test.ts` (**nouveau**, 16 cas)
- `tests/stubs/astro-content.ts`, `tests/stubs/astro-loaders.ts` (**nouveaux**)
- `vitest.config.ts` (aiguillage des doublures)
- `docs/guide-edition.md` (section « Un champ vidé ne casse plus le site »),
  `docs/plan-livraison-finale.md` (§ 7)

**Gate — chiffres réels.** Même dispositif que L-prefill (serveur de dev en
marche → copie isolée resynchronisée par robocopy pour `type-check` / `build` /
les contrôles sur `dist/`).

| Commande | Résultat |
|---|---|
| `npm run lint` | 0 erreur, 4 avertissements a11y pré-existants |
| `npm test` | **205/205**, 22 fichiers (189 + 16 nouveaux) |
| `npm run type-check` | **0 erreur**, 0 avertissement, 7 indices (176 fichiers) |
| `npm run build` | OK — 186 pages, h1-guard 180 / 0 sans, Pagefind 186 |
| `npm run check:links -- --strict` | **0 lien cassé** sur 15 431 liens |
| `npm run check:prefill` | OK — 449 préremplis, 373 chrome, 0 fautif |
| `npm run check:sections` | 0 clé manquante dans 0 fichier |
| `npm run test:e2e` | **67/67**, 25,8 s |
| `npm run check:bookshop` | 42 composants, 0 en échec |
| `npm run cms:previews:check` | 12 pastilles, 34 pictogrammes — alignés |
| `npm run check:redirects` | OK — 175 règles, 0 sans cible, 0 doublon |
| `node scripts/build-redirects.mjs --dist` | 175/175 cibles existent |

`npm run design:previews` non lancé : les replis ne changent le rendu d'aucune
section Bookshop (ils vivent dans le chrome et les pages système), et aucun
contenu actuel n'a de champ vide à masquer — `dist/` est donc inchangé côté
sections.

**Ce qui reste / ce qui bloque.** Rien pour le périmètre demandé.

**DÉCISION À PRENDRE PAR GABRIEL — la plus importante de la nuit.**

Le test a mis au jour une **deuxième famille**, que le lot ne couvrait pas et
que je n'ai donc PAS touchée : les **listes fermées** (`z.enum([...])`) refusent
elles aussi la chaîne vide. Si CloudCannon permet d'effacer un select, c'est
**exactement la panne du 18/09** qui revient, par une autre porte. Recensé :

| Où | Champs | Occurrences |
|---|---|---|
| `src/content/pages` (sections) | `fond`, `variant`, `headingStyle`, `eyebrowStyle`, `overlay`, `imagePosition`, `tone`, `columns`, `cardStyle` | ~211 |
| `src/data/forms` | `fields[].type`, `fields[].width` | 101 |
| `src/data/navigation` | `mega.columns[].icon` | 6 |

**Correctif : une ligne par champ.** Tous ces enums portent DÉJÀ un
`.default('…')` — il suffit d'ajouter `.catch('<le même défaut>')` pour qu'un
select effacé retombe sur l'apparence par défaut au lieu de rougir le build. Le
dépôt a même déjà un précédent : `fondClairOuVide = z.enum(['', ...FOND_KEYS])`.

**Le contre-argument, qui est la vraie raison de te le demander** : `.catch()`
avalerait aussi une clé MAL ORTHOGRAPHIÉE par un développeur (ou laissée
derrière par un renommage), qui est aujourd'hui un échec bruyant. C'est le même
arbitrage que pour la banque de pictogrammes, où le choix a été « tolérer au
build, garder par un test ».

**Deux exceptions à ne PAS rendre tolérantes**, quelle que soit la décision :
`sections[].type` (le discriminant — sans lui il n'y a aucun composant à rendre,
et il n'est jamais saisi au clavier : il vient du sélecteur de sections) et le
contrat des formulaires (`fields[].label`, `fields[].type`) — un formulaire
silencieusement accepté ferait rejeter de vraies soumissions par le serveur.

**À vérifier avant de trancher, en 2 minutes dans CloudCannon** (je ne peux pas
le faire d'ici) : ouvrir une section sur le site dev, essayer d'**effacer**
« Fond de section », sauvegarder, et regarder si le build passe au rouge. Si le
select n'est pas effaçable, le risque est théorique et la décision peut attendre.

> **TRANCHÉ le 22 sept. 2026 — lot L-selects.** La vérification a été faite
> dans le dépôt plutôt que dans l'éditeur : `allow_empty` a été relevé sur les
> 26 sélecteurs de `cloudcannon.config.yml` et les 47 des specs Bookshop.
> **13 sont effaçables** (la valeur par défaut d'`allow_empty` est `true`) —
> 8 sélecteurs de section, plus `mode`, `footerMode`, `icon` du méga-menu,
> `type` et `width` des formulaires. Le risque n'était donc pas théorique. Les
> 38 autres ne tiennent que par `allow_empty: false`, une garde d'interface du
> même genre qu'`empty_type: string`, sur laquelle le schéma ne doit pas
> compter. **Le `.catch()` a été écarté** pour la raison donnée ci-dessus : la
> normalisation retenue n'efface que la chaîne vide, laisse zod appliquer le
> `.default(…)` du champ, et continue de refuser une clé mal orthographiée
> (`fond: "beig"` échoue toujours). Détail dans `src/content.config.ts`
> (« LISTES FERMÉES VIDÉES AU CMS ») et dans
> `src/content.config.listes-fermees.test.ts`.

---

## L-polices — TERMINÉ

**Ce qui a été fait.** Le banc d'essai est retiré, la méthode reste écrite. Le
document `docs/design/banc-essai.md` est devenu **`docs/design/polices-et-bleu.md`**
(renommé : son titre ne voulait plus rien dire) et contient maintenant une
recette d'application au lieu d'un mode d'emploi. Le fond de section « Bleu
électrique » n'a pas été touché — il est permanent et n'a rien à voir avec le
banc.

**Supprimé.** `src/styles/banc-essai.css` (5 302 o) · son import et le bloc
`<script is:inline>` de 88 lignes dans le `<head>` de
`src/layouts/BaseLayout.astro` · `tests/e2e/banc-essai.spec.ts` ·
`docs/design/banc-essai.md`. Tout est récupérable par
`git log -- src/styles/banc-essai.css`, et le nouveau document le dit.

**Gain MESURÉ** (le prompt annonçait « ~3,1 Ko, 1,2 Ko compressé » — c'est juste) :

| | Octets |
|---|---|
| Script en ligne retiré, par page | **3 268** |
| Le même, compressé (gzip -9) | **1 293** |
| À l'échelle du site (186 pages) | **594 Ko** |
| Feuille sortie du paquet CSS | 5 302 |

Le script était **inconditionnel** : il partait sur chaque page même sans
paramètre, pour ne rien faire dans 100 % des visites réelles.

**Aucune trace — vérifié sur le site construit**, comme le demandait le point 3
du prompt (`dist/` rebâti dans la copie isolée, puis balayé) :

| Motif cherché | Fichiers de `dist/` |
|---|---|
| `data-police` | 0 |
| `data-bleu` | 0 |
| `banc-essai-etiquette` | 0 |
| `victrix-banc-essai` | 0 |
| `banc-essai` | 0 |
| `fonts.googleapis.com` | 0 |
| `Hanken` · `Montserrat` · `Nunito` | 0 · 0 · 0 |

**Le nouveau document** (`docs/design/polices-et-bleu.md`) tient en trois parties :

1. **Où vit la police aujourd'hui** — un tableau de 4 lignes : le `@font-face`
   (`theme.css`), le fichier (`public/fonts/InterVariable-subset.woff2`), le
   `preload` (`BaseLayout`), et les jetons (`--font-sans` dans `tokens.css`,
   `--font-inter` et l'alias historique `--font-grotesk` dans `theme.css`). Ce
   tableau n'existait pas : le banc ne disait pas où appliquer un choix.
2. **La recette** — rapatriement local d'abord (avec la raison : la CSP de
   `public/_headers` n'autorise pas `fonts.googleapis.com`, et une police servie
   par Google est une requête tierce que le bandeau de consentement ne couvre
   pas), le `@font-face` et le `preload` à changer **ensemble** (sinon la police
   est téléchargée deux fois), les **trois piles `--font-sans` prêtes à coller**,
   et les deux specs à rejouer ensuite (`typographie` pour le plancher de 14 px,
   `accessibilite` parce qu'une police plus large peut pousser un texte hors de
   sa zone voilée et faire tomber un contraste).
3. **L'historique de l'écart de bleu**, gardé intégralement comme demandé —
   c'est ce qui empêche de rouvrir le sujet. Reformulé au passé : le site n'est
   plus en `#1a5bff`.

**Fichiers touchés.**

- `src/layouts/BaseLayout.astro` (import + bloc de 88 lignes retirés)
- `src/styles/banc-essai.css` (**supprimé**)
- `tests/e2e/banc-essai.spec.ts` (**supprimé**)
- `docs/design/banc-essai.md` (**supprimé**) →
  `docs/design/polices-et-bleu.md` (**nouveau**)
- `docs/operations.md` (§ Accessibilité : le paragraphe du banc renvoie
  maintenant à la recette), `docs/plan-livraison-finale.md` (décision **D9** +
  ligne de suivi **L-banc** corrigée + nouvelle ligne **L-polices**)

**Gate — chiffres réels.**

| Commande | Résultat |
|---|---|
| `npm run lint` | 0 erreur, 4 avertissements a11y pré-existants |
| `npm test` | **205/205**, 22 fichiers |
| `npm run type-check` | **0 erreur**, 0 avertissement, 7 indices (175 fichiers — un de moins, la feuille du banc) |
| `npm run build` | OK — 186 pages, h1-guard 180 / 0 sans, Pagefind 186 |
| `npm run check:links -- --strict` | **0 lien cassé** sur 15 431 liens |
| `npm run check:prefill` | OK — 449 préremplis, 373 chrome, 0 fautif |
| `npm run check:sections` | 0 clé manquante dans 0 fichier |
| `npm run test:e2e` | **62/62** — 67 moins les 5 tests du banc, supprimés avec lui |
| `npm run check:bookshop` | 42 composants, 0 en échec |
| `npm run cms:previews:check` | 12 pastilles, 34 pictogrammes — alignés |
| `npm run check:redirects` | OK — 175 règles, 0 sans cible, 0 doublon |
| `node scripts/build-redirects.mjs --dist` | 175/175 cibles existent |

`npm run design:previews` non lancé : le banc était inerte sans paramètre, donc
le rendu par défaut des sections est **identique** — les vignettes n'ont pas
bougé.

**À signaler — le piège de L-prefill vient de disparaître.** Le faux `<body>`
qui avait fait annoncer « 449 CTA fautifs sur 449 » était le **commentaire du
script du banc**. Il n'existe plus. La parade du garde-fou (repartir de
`</head>`) reste en place et c'est voulu : n'importe quel autre script en ligne
peut réintroduire le même piège, et `check:prefill` donne toujours 449/449
après ce lot.

**Ce qui reste.**

- **D9 n'est pas tranchée** : le choix de la police reste ouvert, et c'est
  normal — le lot demandait de retirer l'outil, pas de décider. Quand le choix
  sera fait, la recette s'applique en une fois.
- `docs/prompts-nuit-2026-09-22.md` cite encore `docs/design/banc-essai.md`
  (dans le texte du prompt L-polices lui-même). **Laissé tel quel à dessein** :
  c'est la feuille de consignes de cette nuit, un document historique — la
  réécrire ferait perdre la trace de ce qui avait été demandé.

**Aucune décision à prendre pour ce lot.**

---

## Clôture de la nuit

**Les trois lots demandés sont TERMINÉS**, dans l'ordre, chacun avec le gate
complet du `CLAUDE.md` passé APRÈS lui (et non une seule fois à la fin).

| Lot | État | Gate |
|---|---|---|
| **L-prefill** | TERMINÉ | vert — 189 tests, 67 e2e, 449/449 CTA préremplis |
| **L01** | TERMINÉ | vert — 205 tests (16 nouveaux), 67 e2e |
| **L-polices** | TERMINÉ | vert — 205 tests, 62 e2e (5 du banc supprimés avec lui) |

### Ce qui n'a PAS été fait, volontairement

- **Aucune commande git qui écrit.** Ni `commit`, ni `push`, ni `merge`, ni
  `stash`, ni `checkout --`, ni `restore`, ni `clean`, ni `reset`, ni `tag`.
  Seuls `git status`, `git diff`, `git log` et `git show` ont servi. L'arbre est
  sale, c'est voulu.
- **Azure DevOps n'a pas été touché.** Les commandes de stories sont dans la
  réponse finale, prêtes à coller, jamais exécutées.
- **Le serveur de dev n'a pas été tué** (port 4321, PID 27632). `build`,
  `type-check` et les contrôles sur `dist/` ont tourné dans la copie isolée
  `C:\Users\gmercierblouin\vvbuild` (`docs/operations.md` § 3.1 : robocopy
  mono-thread, `/XD` en chemins COMPLETS — 37 743 fichiers, 0 échec,
  `node_modules/astro/dist` vérifié présent après chaque copie). La copie a été
  resynchronisée entre les lots, puis **supprimée** en fin de session.
- **Rien hors périmètre.** Deux défauts vus au passage ont été NOTÉS et non
  corrigés : la famille des listes fermées (`z.enum`) qui refusent le vide
  (décision L01 ci-dessus), et le repli de sujet « générique » sur certaines
  pages générales (décision L-prefill ci-dessus).
- **`npm run design:previews` n'a été lancé pour aucun lot**, et la raison est
  écrite lot par lot : aucun des trois ne change le rendu par défaut d'une
  section Bookshop. Les ~4 Mo de PNG ne sont donc pas dans l'arbre.

### Les deux décisions qui attendent Gabriel

1. ~~**L01 — les listes fermées**~~ — **TRANCHÉE le 22/09 (lot L-selects)** :
   le risque était réel (13 sélecteurs effaçables, mesurés dans les specs plutôt
   qu'à la main dans l'éditeur), et le `.catch()` a été écarté au profit d'une
   normalisation qui n'efface que la chaîne vide — le vide retombe sur le
   `.default(…)` du champ, une clé mal orthographiée échoue toujours. Détail au
   lot L01 ci-dessus (encadré « TRANCHÉ ») et dans `src/content.config.ts`.
2. **L-prefill — `check:prefill` dans le gate du `CLAUDE.md`** : le garde-fou
   est dans la CI et dans le portail qualité de `docs/operations.md`, mais je
   n'ai pas modifié `CLAUDE.md` (fichier de règles, hors périmètre). Une ligne
   à ajouter après `check:links`.

**D9 (police)** reste ouverte, et c'est normal : L-polices demandait de retirer
l'outil, pas de décider. La recette de `docs/design/polices-et-bleu.md`
s'applique en une fois le jour venu.

### Trois garde-fous nouveaux, et ils ont été PROUVÉS

Aucun des trois n'a été « écrit puis constaté vert » : chacun a été mis en échec
exprès, pour vérifier qu'il mord.

| Garde-fou | Preuve |
|---|---|
| `npm run check:prefill` | bogue d'origine rejoué dans la copie → 449 → 278 préremplis, 76 pages / 80 liens signalés, code 1 |
| `content.config.champs-vides` | `statusMessage` remis en `.min(1)` → échec nommant les deux fichiers fautifs |
| `tests/e2e/contact-prefill.spec.ts` | 10 tests, dont le gabarit exact (`/fr/secteurs`) qui portait le bogue |
