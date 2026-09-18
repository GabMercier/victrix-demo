# Digest 2026-09-18-01 : aperçus des services enfants, banque de pictogrammes, zone lisible des héros, quatre plans

- **Date :** 2026-09-18 (une seule session, journée entière).
- **Type :** Dev session (build ; secondaire : debugging et planification).
- **Project :** Démo Victrix (Astro 5 + Bookshop + CloudCannon), refonte victrix.ca. Branches : `dev` (intégration, site CloudCannon vocal-wren), `staging` (édition Julie, lawful-hare), `main` (production, overt-pineapple).
- **In one line :** cinq livraisons sur `dev` (Turnstile en mode inbox, aperçus CloudCannon des 36 services enfants, banque de pictogrammes unique, zone lisible des voiles de héros) et quatre plans écrits (héros animés, icônes/CTA/aperçus, catalogue Ø Studio, remplacement d'Axeptio), plus une revue Azure DevOps et marketing qui réordonne la suite.
- **File under :** Project Victrix Demo, `docs/digests/`.
- **Subjects covered :** lot 2 Turnstile côté code, scission de la collection `services` par langue, banque de pictogrammes partagée (34 icônes, 11 sélecteurs), zone lisible des voiles de `service-hero`, plans `plan-hero-anime.md` / `plan-icones-cta-apercus.md` / `plan-import-catalogue-ostudio.md` / `plan-consentement-loi25.md` / `plan-2026-09-18.md`, analyse du catalogue Ø Studio (API WordPress), revue des 13 nouveaux commentaires de Julie (#1762) et de #1797, divergence `dev` / `staging`, deux blocages de synchro CloudCannon.
- **Scope of this session :** `src/lib/forms/mode.ts` (+ test), `component-library/src/components/form/form.astro`, `src/pages/[lang]/contact.astro`, `src/pages/[lang]/ressources/index.astro`, `cloudcannon.config.yml` (collections services, banque `_select_data.icones`), 6 fichiers `src/content/services/en/*.json` (champ `slug`), `component-library/src/shared/icons.ts` (nouveau), 10 composants à icônes, `src/content.config.ts`, `scripts/design/generate-cms-previews.mjs`, `scripts/migrate-icons-bank.mjs` (nouveau), `src/lib/icons.test.ts` (nouveau), `component-library/src/components/service-hero/service-hero.astro`, `tests/e2e/hero-zone-lisible.spec.ts` (nouveau), `tests/e2e/formulaires-recherche.spec.ts`, docs (`formulaires`, `operations`, `guide-edition`, plans). PAS touché : `home-hero` (même défaut de voile, laissé exprès), les 23 composants sans CTA, `src/content/solutions/**`, le contenu de `staging`, Azure DevOps (aucune story créée ni fermée), aucun réglage CloudCannon ou Cloudflare.

## Goal / scope

Trois demandes en cascade : (1) noter une idée d'animation de héros pour plus tard, (2) faire le point sur le projet, finir la phase en cours et planifier ; (3) corriger ce que la revue de Clément et les retours de Julie font remonter (aperçus manquants, icônes et logos, appels à l'action), puis planifier le remplacement d'Axeptio et l'import du catalogue Ø Studio. La session se termine sur une revue Azure DevOps et marketing qui fixe l'ordre de la suite.

## Decisions made

- **Turnstile s'affiche aussi en mode inbox.** Le widget n'était rendu que pour le backend `worker`. Raison : la boîte CloudCannon vérifie elle-même le jeton, donc le widget doit exister avant d'activer « Require CAPTCHA », sinon toute soumission reçoit la page 401. Écarte l'idée d'un captcha propre au worker seulement. **Firm.**
- **Ordre obligatoire de mise en service du captcha :** widget Cloudflare créé, fournisseur réglé sur la boîte, `PUBLIC_TURNSTILE_SITE_KEY` posée, build, PUIS « Require CAPTCHA ». Consigné dans `docs/formulaires.md` §7. **Firm.**
- **La collection `services` est scindée en deux collections par langue** (`services_fr` sur `src/content/services/fr` avec `url: /fr/services/[full_slug]/`, `services_en` sur `.../en` avec `url: /en/services/{slug}/`), entrées partagées par ancre YAML `&services_inputs`. Raison : un seul gabarit ne peut pas décrire les deux conventions d'URL (FR suit le chemin de fichier, EN suit le champ `slug`). Écarte le repli prévu (glob `services_enfants` + champ `permalink` + script + garde-fou), gardé en réserve. **Firm**, vérifié en production sur le site dev.
- **Le champ « Adresse de la page » devient obligatoire en anglais.** Conséquence directe du point précédent : sans lui, l'aperçu d'une page EN est cassé. Six fichiers EN l'ont reçu (valeur = nom de fichier, URL inchangée), et le commentaire CMS le dit. **Firm.**
- **Une seule banque de pictogrammes pour tout le site** (`component-library/src/shared/icons.ts`, 34 clés), offerte en entier par les 11 sélecteurs d'icône. Raison : demande de Gabriel et de Julie (#1762), et demande de Clément (#1797). Écarte les dix listes par section. **Firm.**
- **Les clés en doublon sont qualifiées plutôt que perdues** (`groupe-mains`, `engrenage-horloge`, `croissance-pleine`, `etincelle`), et six dessins quasi identiques sont fusionnés (insigne vers coche, trois boucliers, engrenage, graphique, document). Raison : garder 34 dessins distincts utilisables partout sans homonymes. Coût assumé : 25 pages sur 173 changent d'un dessin. **Firm**, validé visuellement paire par paire.
- **Les trois clés disparues restent acceptées** (`insigne`, `personnes`, `engrenages` via `LEGACY_ICON_ALIASES`). Raison : une sauvegarde CloudCannon faite depuis `staging`, pas encore migrée, ne doit pas casser un build. Leçon des incidents `null` et « clés supprimées » de septembre. **Firm.**
- **Chaque composant garde sa taille et son épaisseur de trait.** La banque ne décide que du mode (trait ou plein), du `viewBox` et des tracés, via `iconFor` et `iconSvgAttrs`. Raison : fidélité aux maquettes, et preuve par diff du site construit. **Firm.**
- **Le texte d'un héros ne sort jamais de la zone où le voile couvre assez la photo.** Le voile et la colonne de texte changent ensemble, par paliers disjoints. Raison : les voiles « blanc » et « degrade » s'estompent en pourcentage de la largeur alors que le texte faisait 688 px. Écarte les solutions qui ne touchent qu'au texte ou qu'au voile. **Firm** pour `service-hero`, **en attente** pour `home-hero` (même défaut, non corrigé).
- **Remplacement d'Axeptio : `vanilla-cookieconsent` intégré par nous**, pas le paquet `@jop-software/astro-cookieconsent`. Raison : ce paquet passe sa configuration par `JSON.stringify` (donc aucun rappel `onConsent`, rien pour le ClientRouter), vise Astro 1.x et est en GPL-3.0. **Tentative**, décisions du lot 0 en attente.
- **Le site n'aura pas de registre de consentement côté serveur en v1**, contrairement à Axeptio. Raison : l'hébergement CloudCannon est statique, un registre demanderait un service externe. À écrire tel quel dans la politique de confidentialité. **Tentative**, à rouvrir si le juridique l'exige.
- **Les fiches du catalogue Ø Studio deviendront des pages par sections**, comme les services, avec le formulaire `o-studio` existant. Raison : éditeur visuel pour Julie, et le champ caché « Page d'origine » fait déjà voyager le nom de la solution. **Tentative.**
- **Les 16 solutions n'entreront pas dans la liste des sujets du formulaire Contact.** Raison : cette liste sert tout le site, existe en deux langues et est gardée à trois endroits par `assertSameOptions` ; le nom de la solution voyage déjà par `?produit=`. Option retenue à la place : un seul sujet « Une solution du catalogue ». **Tentative.**
- **Ordre des chantiers :** icônes et logos, puis CTA, puis consentement, puis catalogue, héros animés en lot tampon. Révisé en fin de session par la revue (voir Next steps). **Firm** sur le principe « un chantier à la fois, commité avant le suivant ».
- **Avant tout commit, absorber les sauvegardes CloudCannon.** Règle posée par Gabriel, enregistrée en mémoire projet. **Firm.**

## What was built or changed

Livré et poussé sur `dev` (cinq commits de la journée, plus une sauvegarde CloudCannon).

| Commit | Contenu | État |
| --- | --- | --- |
| `83265b6` 11:33 | Lot 2 Turnstile côté code + trois plans | done |
| `c2f3fe2` 12:12 | Collections Services FR/EN, slugs EN | done, vérifié sur le site dev |
| `eaadd7b` 12:51 | Plan d'import du catalogue Ø Studio | done |
| `d9a76d0` 14:20 | Banque de pictogrammes + plan consentement | done, vérifié sur le site dev |
| `efcdeec` 15:27 | Zone lisible des voiles de héros + test e2e | done, vérifié sur le site dev |
| `0e0721c` 20:04 | Sauvegarde CloudCannon (3 fichiers) qui a débloqué la synchro | done |

- **`src/lib/forms/mode.ts`** : fonction `resolveTurnstileSiteKey(backend, env)` (vide en maquette, clé de site en `worker` et en `inbox`), plus un cas de test. Les trois gabarits (`form.astro`, `contact.astro`, `ressources/index.astro`) l'utilisent. **done**
- **`tests/e2e/formulaires-recherche.spec.ts`** : assertion « aucun widget Turnstile en maquette ». **done**
- **`cloudcannon.config.yml`** : collections `services_fr` et `services_en` (remplacent `services`), `_inputs` partagés par ancre YAML `&services_inputs` / `*services_inputs`, `collection_groups` mis à jour, commentaire d'entête expliquant la cause du 404. **done**
- **Six fichiers `src/content/services/en/*.json`** (`demo-produit`, `demo-sections`, `infrastructure`, `intelligence-artificielle`, `projets-en-ia`, `services-applicatifs`) : champ `slug` ajouté, valeur = nom de fichier, URL inchangée. **done**
- **`component-library/src/shared/icons.ts`** (nouveau, 313 lignes) : 34 pictogrammes rangés par thème, type `IconDef`, `ICON_KEYS`, `iconFor`, `iconSvgAttrs`, `LEGACY_ICON_ALIASES`. Browser-safe, même patron que `fonds.ts` et `rich.ts`. **done**
- **Dix composants recâblés** (`benefits`, `bento-metrics`, `exclusive-tools`, `expertise-bento`, `home-solutions`, `offer-cards`, `photo-features`, `realisations`, `stats`, `value-tiles`) : cartes `ICONS` / `FILL_ICONS` / `WATERMARKS` supprimées, `iconFor` + `iconSvgAttrs` à la place, en-têtes de commentaires réécrits. 304 lignes retirées, 76 ajoutées. **done**
- **`src/content.config.ts`** : `const pictogramme = z.enum(['', ...ICON_KEYS, ...LEGACY_ICON_KEYS])` remplace les 11 énumérations par section. **done**
- **`cloudcannon.config.yml`** : une liste `_select_data.icones` (34 entrées) remplace les dix listes par section ; les 11 sélecteurs y pointent, y compris le filigrane du bento (qui était une liste en dur dans sa spec Bookshop) ; quatre specs Bookshop mises à jour. **done**
- **`scripts/design/generate-cms-previews.mjs`** : lit la banque partagée au lieu des dix composants, génère `public/images/cms/icones/<cle>.svg` à plat, supprime les vignettes orphelines, garde-fou réécrit (mêmes clés, même ordre, aucune ancienne liste `icones_*`). **done**
- **`scripts/migrate-icons-bank.mjs`** (nouveau) : renomme les valeurs d'icônes par type de section, rejouable, option `--check`. A migré 30 valeurs dans 22 fichiers. **done**
- **`src/lib/icons.test.ts`** (nouveau, 6 tests) : santé de la banque, `iconFor`, attributs de trait et de plein, alias hérités, et balayage de tout `src/content` pour qu'aucune valeur ne sorte de la banque. **done**
- **`component-library/src/components/service-hero/service-hero.astro`** : `veilClass` et `textZoneClass` calculés ensemble, trois paliers (`max-md`, `md:max-lg`, `lg`), la largeur du texte soustrait la gouttière réelle `clamp(2rem, 3.75vw, 96px)`. **done**
- **`tests/e2e/hero-zone-lisible.spec.ts`** (nouveau, 7 tests) : part de largeur occupée par le texte à 820, 1100 et 1440 px sur deux pages, plus la forme du voile à 390 px. **done**
- **Documentation** : `docs/formulaires.md` (§3 et nouveau §7 « Mode inbox », six étapes), `docs/operations.md` (banque d'icônes, recette de migration), `docs/guide-edition.md` (deux collections Services, champ Adresse obligatoire en EN, sélecteur d'icône unique). **done**
- **Plans écrits** : `docs/plan-hero-anime.md`, `docs/plan-icones-cta-apercus.md`, `docs/plan-import-catalogue-ostudio.md`, `docs/plan-consentement-loi25.md`, `docs/plan-2026-09-18.md` (feuille de route des quatre chantiers, plus la revue de fin de session). **done**, sauf la section « Revue » du dernier, **non commitée**.

Conçu, pas construit : composant `galerie` pour les fiches du catalogue, famille « logos » dans la banque, bloc CTA partagé, socle de consentement.

## Architecture / how it fits

- **Icônes.** `component-library/src/shared/icons.ts` est la source unique. Trois consommateurs : les composants Bookshop (rendu, y compris dans l'éditeur visuel), `src/content.config.ts` (validation zod), et `scripts/design/generate-cms-previews.mjs` (vignettes du CMS, plus garde-fou d'alignement avec `_select_data.icones`). Même triangle que `fonds.ts` depuis le 17 septembre.
- **Collections CloudCannon.** Une collection par dossier de langue, avec un gabarit d'URL adapté à la convention de chaque langue. L'URL calculée sert à la fois la vignette de la liste et l'éditeur visuel, ce qui explique que les deux échouaient ensemble.
- **Héros.** Le voile et la colonne de texte sont deux éléments distincts qui partagent désormais un contrat de paliers. Le voile uniforme (25 pages) n'est pas concerné, puisqu'il couvre toute la largeur.

## Environment / stack specifics

- **Site CloudCannon dev :** vocal-wren.cloudvent.net, branche `dev`, boîte `dev-marketing-contact`, variables `PUBLIC_FORMS_ENABLED=inbox` et `PUBLIC_FORMS_INBOX_KEY`.
- **Clés de test Turnstile** (valables sur tout domaine) : site `1x00000000000000000000AA`, secret `1x0000000000000000000000000000000AA`.
- **Espaces réservés d'URL CloudCannon :** `[full_slug]` vaut `<dossier relatif>/<nom sans extension>` ; les barres obliques doubles sont réduites ; un `{champ}` de données garde ses barres obliques sans les encoder ; les ancres YAML fonctionnent dans `cloudcannon.config.yml`.
- **Vérification hors ligne des URL :** `npx --yes @cloudcannon/reader --output ../_ccreader --quiet` puis lire `_cloudcannon/info.json`. La sortie doit être un chemin RELATIF. Sur Windows, les URL construites sur `[full_slug]` sortent mal (barres inverses) : artefact local seulement, correct sur les machines de build Linux.
- **Catalogue Ø Studio :** WordPress (Gutenberg, thème assembler, Jetpack, Fluent Forms n° 3), API REST ouverte sans authentification (`/wp-json/wp/v2/pages?per_page=100`, 18 pages ; `/wp-json/wp/v2/media`, 131 médias). Les originaux se téléchargent depuis `/wp-content/uploads/`. Il faut un en-tête User-Agent de navigateur : `urllib` de Python reçoit 403, `curl -A` passe.
- **`vanilla-cookieconsent` 3.1.0 :** licence MIT, 10 151 octets gzip de JS et 5 354 de CSS, évènements `cc:onConsent` / `cc:onChange` / `cc:onFirstConsent`, attribut `data-cc="show-preferencesModal"`, options `manageScriptTags`, `autoClear`, `language.autoDetect`, `setLanguage()`, et `translations` accepte une URL ou une fonction asynchrone.
- **Commandes du gate** utilisées telles quelles : `npm run lint`, `npm test`, `npm run check:bookshop`, `npm run cms:previews:check`, `npm run type-check`, `STATIC_ONLY=1 npm run build`, `npx playwright test`.

## Problems hit and how resolved

- **Aperçus absents sur les 36 services enfants.** Symptôme : « No preview available » et aucun éditeur visuel. Cause : le gabarit `/[relative_base_path]/services/[slug]/` donnait `/fr/productivite/services/x/` (404) au lieu de `/fr/services/productivite/x/` (200), vérifié par requête sur le site dev. Fix : scission par langue. Impasse à ne pas refaire : j'ai d'abord demandé à Gabriel de vider le gabarit d'URL dans l'interface CloudCannon, ce qui n'existe pas (le gabarit vit dans le fichier du dépôt). Deuxième erreur de lecture : après le premier correctif, son « c'est exactement pareil » venait d'une vérification faite avant la fin du build.
- **Synchro CloudCannon en pause, deux fois.** Symptôme : `cloudcannon files pull` fait son `git fetch` puis affiche « Failed to connect to your sync provider. Remote changes would overwrite files that are open in the editor ». Cause : un fichier touché par le commit entrant avait des modifications non sauvegardées dans l'éditeur (les modifications non sauvegardées sont partagées entre les membres de l'équipe). Ce n'est pas un problème de dépôt : pousser à nouveau ne fait qu'allonger la file. Fix : dans l'interface, Save, puis la fenêtre « Review changes », rubrique « Needs attention », puis Save selected ou Discard selected. Résolu vers 20 h par une sauvegarde (commit `0e0721c`, trois fichiers), suivie du build.
- **Test e2e de la zone lisible en échec à 1100 px.** Cause : la règle est écrite en `vw` (fenêtre) alors que je mesurais contre la largeur du héros, et surtout la largeur maximale ne soustrayait pas la gouttière du conteneur. Fix : `calc(55vw - clamp(2rem,3.75vw,96px))` et mesure contre la fenêtre.
- **Un test unitaire en échec une fois, puis vert trois fois.** Survenu pendant qu'une copie isolée se construisait en parallèle. Aucune trace d'erreur au rejeu. Attribué à la concurrence de fichiers, pas à une régression.
- **Pièges d'outillage rencontrés :** l'outil PowerShell refuse `robocopy /E` (il le lit comme une suppression de chemin système) ; depuis Bash il faut `MSYS2_ARG_CONV_EXCL="*"` sinon `/E` devient un chemin ; `node script.mjs "/fr/..."` convertit aussi l'argument, d'où `MSYS_NO_PATHCONV=1` ; les heredocs Python cassent sur les antislashs (`f.replace('\\','/')`), donc passer par le Write tool ou éviter.

## Verification / test state

- **Gate complet, vert** après chaque livraison : lint 0 erreur (4 avertissements préexistants), vitest 165 tests dans 18 fichiers, `check:bookshop` 41/41, `cms:previews:check` aligné, type-check 0 erreur (5 indices), build `STATIC_ONLY` 162 pages et 173 fichiers HTML, e2e 21/21.
- **Preuve de non-régression des icônes :** build avant et après comparé page par page sur 173 pages. 142 identiques à l'octet, 6 différences de balisage sans changement de dessin, 25 pages où seuls les six dessins fusionnés changent (tailles, épaisseurs et classes conservées).
- **Tolérance des anciennes clés vérifiée par build réel :** un `"icon": "insigne"` réinjecté dans un fichier de contenu construit sans erreur et rend le bon dessin.
- **Site dev vérifié en fin de journée** (build du 18/09 20:07) : `/images/cms/icones/coche.svg` répond 200 (banque livrée) et la classe `55vw` est présente sur `/fr/expertises/` (zone lisible livrée).
- **Après la sauvegarde CloudCannon `0e0721c` :** `node scripts/migrate-icons-bank.mjs --check` ne trouve rien à migrer, donc aucune ancienne clé n'est revenue.
- **Héros vérifiés visuellement** à 390, 480, 640, 820 et 1100 px sur Expertises, et à 390, 820 et 1100 px sur la variante sombre (Copilot Studio).
- **Non testé :** le rendu des sélecteurs d'icône dans l'éditeur visuel CloudCannon (Gabriel devait le faire après le build), l'envoi réel d'un courriel avec Turnstile actif, et tout le plan de consentement (rien n'est installé).

## Open questions / decisions pending

- **H1 :** Julie demande de pouvoir mettre le surtitre en H1 sur certaines pages. Attention, elle a posé « Services » comme surtitre sur plusieurs pages le 18/09, ce qui donnerait des H1 dupliqués. Options : garder la règle actuelle (H1 = grand titre), retirer le champ « H1 SEO » caché, ou ajouter un choix par page.
- **Logos :** qui fournit les fichiers (kit partenaire Microsoft, AWS, ServiceNow, Check Point, Happy At Work), lesquels, et où les afficher. La médiathèque de victrix.ca en contient une quinzaine, dont plusieurs badges de 2022 et 2023 possiblement périmés.
- **CTA :** liste des sections à équiper, bouton simple ou double, et extension au bloc de texte enrichi (demande de Julie du 16/09).
- **Consentement :** catégories (ZoomInfo revient-il ? Clarity ?), durée du témoin, rechargement de page au retrait, registre de consentement.
- **Catalogue :** publication des prix (dépend de la rencontre #1634), traduction anglaise des 16 fiches, sujet « Une solution du catalogue » dans Contact.
- **Page Cybersécurité :** le formulaire « Évaluation posture sécurité » et le premier bouton du CTA final n'ont jamais été validés par marketing (question de Julie du 18/09).
- **`home-hero` :** appliquer la même règle de zone lisible ou non.

## Risks / dependencies / blockers

- **Divergence `dev` / `staging`.** `staging` a 19 commits de Julie du 18/09 absents de `dev`, et `dev` a 21 commits absents de `staging`. Fusion d'essai en worktree jetable : 12 fichiers en conflit, tous mécaniques (bloc de clés en tête de fichier, plus une section CTA insérée sur Cybersécurité). Plus l'attente dure, plus la fusion grossit.
- **Julie ne voit rien de ce qui est livré.** Texte enrichi, contrôle du H1, aperçus des services enfants et banque d'icônes sont sur `dev` ; son site est `staging`. Six de ses treize commentaires tombent dès qu'une PR passe.
- **Huit liens internes cassés dans le contenu de `staging`**, dont trois écrits le 18/09 : anciennes adresses WordPress (`/expertise/cybersecurite`), préfixe de langue manquant (`/services/o-studio/`), espace dans une URL (`/en/services/managed services`). Deuxième occurrence du même type de faute.
- **La synchro CloudCannon peut repauser** à chaque push qui touche des fichiers de contenu pendant qu'une édition est ouverte.
- **Dépendances externes :** comptes Cloudflare Turnstile et propriété GA4 (bloquent les lots 2 et 3 des formulaires), validation juridique de la politique de confidentialité, rencontre #1634 pour les prix du catalogue, fichiers de logos de marque.

## Tech debt / deferred

- **`home-hero`** garde le défaut de voile corrigé sur `service-hero`.
- **Repli des aperçus** (glob + `permalink` + script + garde-fou) écrit dans le plan, à activer seulement si un slug EN imbriqué ressort encodé.
- **Les liens de la FAQ Accompagnement IA** sont à ressaisir : le champ accepte le texte enrichi, mais les huit réponses ne contiennent aucun lien.
- **`_select_data.icones` est maintenue à la main** en regard de `icons.ts`. Le garde-fou échoue en cas de divergence, mais ne génère pas la liste.
- **Aucune story Azure DevOps créée** pour les chantiers de la journée. Restent fermables : #1439, les features vides #1410, #1444, #1457, #1461, #1484, #1495, et le doublon #1462. #1797 a pour parent #1423, qui est fermée.

## Next steps

Ordre révisé par la revue de fin de session (`docs/plan-2026-09-18.md`, section Revue).

1. **Vérifier le site dev** maintenant que le build est passé : sélecteur d'icône dans une carte bento, héros d'Expertises en largeur téléphone, aperçu d'un service enfant FR et EN. (Gabriel, interface.)
2. **Fusionner `staging` dans `dev`** par fusion sémantique scriptée des 12 fichiers (le texte de Julie gagne, les clés ajoutées par `dev` restent), rejouer `migrate-icons-bank.mjs`, corriger les 8 liens, gate, pousser, puis ouvrir la PR `dev` vers `staging` pendant que Julie ne sauvegarde pas. (Claude Code, environ 30 minutes.)
3. **Garde-fou des liens internes** au build et en CI : tout lien du contenu qui ne mène à aucune page générée est listé (avertissement côté CloudCannon, erreur en CI). Environ 2 à 3 heures. (Claude Code.)
4. **Chantier 2 révisé** : boutons dans le bloc de texte enrichi, lien optionnel par carte (cartes cliquables), CTA de section. Environ 1 à 1,5 jour. (Claude Code.)
5. **Suite du chantier 1** : jeu Lucide pour #1797, famille logos, bandeau de logos défilant. Environ 1 jour, dépend des fichiers de marque.
6. **Chantier 3** (consentement Loi 25) puis **chantier 4** (catalogue Ø Studio), ensuite les phases 3 à 6 du plan éditeur et les lots go-live.
7. **Hygiène Azure DevOps** : répondre aux 13 commentaires de #1762 après la PR, fermer les huit items fermables, créer les stories manquantes.

## Durable findings (secondary)

- **CloudCannon calcule l'URL d'aperçu à partir du gabarit `url` de la collection**, et la même URL sert à la vignette et à l'éditeur visuel : les deux tombent ensemble. Le gabarit vit dans `cloudcannon.config.yml`, pas dans l'interface.
- **`@cloudcannon/reader` est le programme que CloudCannon exécute sur ses machines de build** pour les sites Astro. Le lancer localement donne l'URL calculée pour chaque fichier de chaque collection, sans pousser ni attendre un build. Recette et pièges dans la mémoire projet.
- **Modifications non sauvegardées partagées.** Dans CloudCannon, les éditions non sauvegardées sont visibles par toute l'équipe (la fenêtre « Review changes » les range sous My changes, Other changes et Needs attention) et bloquent la synchro entrante. Dernier recours : Site Settings, Syncing, Reset from Git, qui supprime toutes les éditions non sauvegardées du site.
- **Tailwind 4 accepte les variantes de plafond et les paliers empilés** (`max-md:`, `md:max-lg:`) et les génère bien dans le CSS produit. Une règle écrite en `vw` doit soustraire explicitement la gouttière du conteneur, sinon le bord droit dépasse la part visée.
- **Une API REST WordPress ouverte reste la voie la plus simple pour un export**, même sans identifiants : pages, contenu rendu, médias et dimensions. Prévoir un en-tête User-Agent de navigateur.
- **Comparer deux builds page par page est une preuve utilisable** pour un refactor à grande échelle : neutraliser les noms de fichiers hachés, séparer le balisage des `svg`, puis regrouper les différences par signature de dessin.

## Continuity note

Gabriel a demandé en fin de session de basculer sur Opus 5 avec contexte long. Rien d'autre à reporter.

## Living docs status

Oui, plusieurs documents vivants doivent absorber cette session.

- **`docs/GUIDE-PROJET.md`** : ajouter le journal du 18 septembre (cinq livraisons, quatre plans, revue) et l'état des chantiers.
- **`docs/plan-prompts.md`** : inscrire les quatre chantiers de `plan-2026-09-18.md` comme entrées suivies, avec leur état.
- **`docs/operations.md`** : déjà mis à jour pour la banque d'icônes ; à compléter avec la recette `@cloudcannon/reader` et la procédure de synchro en pause.
- **`docs/guide-edition.md`** : déjà mis à jour (deux collections Services, adresse obligatoire en EN, sélecteur unique) ; à compléter quand les CTA et les logos arriveront.
- **`docs/formulaires.md`** : à jour pour Turnstile en mode inbox ; le reste suit la mise en service des comptes.
- **Mémoire projet** (`.claude/.../memory/`) : `project-status.md`, `julie-comments-1762.md`, `cloudcannon-sync-paused.md`, `cloudcannon-reader-url-check.md`, `pull-cloudcannon-before-commit.md`, `ostudio-catalogue-import.md` et `idee-hero-anime-cloudcannon.md` sont à jour au 18/09 16 h.
