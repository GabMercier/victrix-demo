# Plan de prompts — exécution multi-modèles (document vivant)

> **Le tableau de bord d'exécution du projet.** Créé le 17 juillet 2026,
> mis à jour à CHAQUE session (déléguée ou de pilotage). Sources :
> `plan-services-formulaires.md` (chantiers A–E), `revue-cahier-des-charges.md`
> (écarts), et l'estimé enrichi — fichier EXTERNE au dépôt :
> `C:\Repo\Victrix\Refontee site web Victrix - Estimé haut niveau – Copie.xlsx`
> (les codes F-xx / N-x ci-dessous renvoient à ses lignes [Astro]).

## 0. État au 28 juillet (vague 2 — P-05/P-06/P-07 fermés côté code, P-04 prochain)

**VAGUE 1 fermée** (P-01/P-02/P-03 ✅). **P-05 fermé** (`41203b6` +
hotfixes `dccdcf8`/`f13b7da`, poussés). **P-07 fermé** (`39fdd63` poussé,
8 constats de revue corrigés).

**P-06 EXÉCUTÉ 🟡 (28/07, Fable 5 en session directe — demande utilisateur
« moteur de recherche interne optimisé »)** : Pagefind au build (les 2 modes),
page `/[lang]/recherche/`, icône header + lien tiroir mobile, index optimisé
(portée `<main>` des pages indexables seulement, langues fr-CA/en-CA
partitionnées avec racinisation, exclusions noindex/portail/404, ignore des
« ressources liées », meta+tri par date des articles), CSP `'wasm-unsafe-eval'`
appliquée (ligne OPS). Gate vert. NOTE D'ORDRE : P-06 est passé AVANT P-04
(décision utilisateur — priorité recherche); P-04 devra composer avec l'icône
recherche dans ses modes de header (voir fiche §7 amendée). Détails : ligne
P-06 et journal 28/07. NOUVEAU DOC : [seo-strategie.md](seo-strategie.md)
(équivalence Yoast→Astro, argumentaire marketing, backlog SEO priorisé).

**PROCHAIN LOT : P-04** — header de landing par page (complet/allégé/
personnalisé). **Modèle : Sonnet 5** (tâche patronée : frontmatter + zod +
prop de chrome, aucune logique serveur — fiche §7). UNE session déléguée à la
fois (zones de collision §3) ; au retour de chaque lot : gate + revue du diff
AVANT le commit (utilisateur = maître des commits/push). En parallèle (autre
piste) : Phase 0 du [plan de convergence](plan-convergence-migration.md) —
**Node 20 à installer par l'utilisateur** (terminal admin), prérequis Tailwind.

**Restes OPS** (humain) : vérifs CloudCannon post-rebuild (7 types de champ
+ « + Ajouter » des Options fonctionnel sur `campagne-evaluation`; après
commit P-06 : page Recherche fonctionnelle sur la préversion — taper un terme,
vérifier résultats FR seulement sur /fr/recherche); réconciliation estimé xlsx
(script prêt au scratchpad, relancer quand Excel est fermé).

## 1. Gouvernance — qui fait quoi

| Modèle | Rôle | Sessions types |
|---|---|---|
| **Fable 5** | Pilotage : revue critique de chaque diff, gate, mise à jour de ce doc, réconciliation de l'estimé, rédaction du texte final des prompts, tout le non-délégable (ligne OPS) | Session de gestion (prompt §2) |
| **Opus 4.8** | Chantiers complexes : logique serveur (`src/pages/api/`, `src/lib/forms/`), tâches multi-contrats non patronées, architecture | P-01, P-03, P-05, P-07, P-08, P-10 |
| **Sonnet 5** | Tâches patronées bien bornées : réplication d'un patron éprouvé, pages simples, intégrations documentées | P-02, P-04, P-06, P-11 à P-20 |

**Règle d'escalade Sonnet → Opus** : dès qu'un prompt touche de la logique
serveur ou plusieurs contrats de façon NON patronée. **Exception écrite** :
l'ajout d'une section suivant le patron éprouvé (12 composants existants dans
`component-library/src/components/`) reste Sonnet — les 4 contrats y sont le
gabarit répétitif lui-même.

**Cadence** : 1 prompt = 1 session dédiée. Au retour : la session de pilotage
Fable 5 revoit le diff AVANT le commit (que l'utilisateur fait lui-même).
**Une seule session active par zone de collision** (voir §3, préambule,
point « zones »). Parallélisme réel = worktree git isolé seulement.

## 2. Prompt de pilotage (à coller en début de session Fable 5)

```
Lis docs/GUIDE-PROJET.md et docs/plan-prompts.md. Fais le point :
1. Diffs en attente de revue → revue critique + gate complet; annote le suivi.
2. Coche/mets à jour le tableau de suivi (statuts, notes de session).
3. Si un lot ferme : réconcilie l'estimé xlsx (chemin en tête de doc).
4. Rédige le texte final du prochain prompt à lancer (fiche + préambule §3),
   selon les dépendances, les zones de collision et les décisions ouvertes.
```

## 3. Préambule standard (à coller VERBATIM en tête de chaque prompt délégué)

```
CONTEXTE OBLIGATOIRE — lis avant de coder :
- docs/GUIDE-PROJET.md (le projet), docs/plan-services-formulaires.md (les
  chantiers), et ta fiche dans docs/plan-prompts.md.

CONTRAINTES NON NÉGOCIABLES DU DÉPÔT :
1. 4 contrats synchronisés pour toute section/champ de contenu :
   src/content.config.ts (fonction sectionsSchema, union discriminée `type`)
   → component-library/src/components/<nom>/<nom>.astro + <nom>.bookshop.yml
   → cloudcannon.config.yml (_structures/_inputs)
   → schemas/*.md (gabarits « + Ajouter », si collection à création libre).
2. Composants de section : aucun import astro:* ni module non exécutable dans
   le navigateur (astro:assets, astro:content, i18n interdits — le bundle
   d'édition live doit compiler). Les imports relatifs browser-safe sont
   permis (précédent : faq.astro importe JsonLd.astro). Les données
   build-only passent par le seam `enrich` de
   component-library/src/shared/astro/page.astro.
3. Liaison live : la variable des props de getStaticPaths doit s'appeler
   LITTÉRALEMENT `frontmatter` (commentaire load-bearing dans
   src/pages/[lang]/campagnes/[slug].astro:43-50). Après build STATIC_ONLY,
   vérifie dans dist/ que le marqueur bookshop-live a params(...) NON vide.
4. Zones de collision (n'y touche que si ta fiche le prévoit) :
   src/content.config.ts, cloudcannon.config.yml, src/i18n/ui.ts,
   src/components/Header.astro.
5. public/_headers est GELÉ : ne le modifie JAMAIS. Si ta tâche exige un
   changement CSP, documente-le dans ta note de session (patron :
   docs/formulaires.md §7) — Fable 5 l'appliquera.
6. GATE COMPLET avant de terminer : npm run lint (0 erreur), npm test (62+
   tests verts), npm run type-check (0 erreur — le script s'appelle
   type-check), npm run build ET STATIC_ONLY=1 npm run build. Si un serveur
   dev tourne, fais les builds dans une copie isolée (docs/operations.md
   §3.1).
7. Ne committe JAMAIS (l'utilisateur committe après revue). Laisse l'arbre de
   travail propre et lisible.
8. En fin de session : mets à jour ta ligne du tableau de suivi de
   docs/plan-prompts.md (statut + note de 2-3 lignes : fait, restes, pièges).
```

## 4. Tableau de suivi

Statuts : ⬜ à faire · 🔵 en cours · 🟡 en revue (diff à revoir par Fable 5) ·
✅ fermé (gate vert + commité) · ⏸️ bloqué · — sans objet

| ID | Tâche | Modèle | Dép. | Est. | Vague | Statut | Notes |
|---|---|---|---|---|---|---|---|
| P-01 | Navigation éditable (menu, méga-menu, annonce, bouton portail → `src/data/navigation/`) | ~~Opus 4.8~~ **Fable 5** | — | 7 h | 1 | ✅ | Fermé — commit `9aa6547`, poussé. Gate vert, parité DOM prouvée, test négatif OK. Interrupteurs CMS annonce + portail en bonus. |
| P-02 | 4 sections palette : Témoignage, Bandeau logos, Chiffres, Vidéo (façade) | ~~Sonnet 5~~ **Fable 5** | P-01 | 7 h | 1 | ✅ | Fermé — commits `a18b60c` + `fa6b1ce`, poussés. 16 structures, live editing 7 pages, page démo, parité prouvée. Bonus : duplication FR↔EN (guide + `victrix:i18n-pairing`), `.env.example` périmètre, décision hébergement. |
| P-03 | Formulaires v2 cœur : collection `src/data/forms/` + réf. + destinataire par formulaire | ~~Opus 4.8~~ **Fable 5** | P-02 | 7 h | 1 | ✅ | Fermé — commit `ec065b3`, poussé. Gate vert (69/69 tests dont 7 registre); parité mode inline IDENTIQUE; formId inconnu casse le build; e2e démo prouvé (destinataire/objet/requis résolus PAR LE SERVEUR depuis le registre). 4 défs seed, collection CC « Formulaires », doc §4 _formId. `landing/fr/test.md` supprimé. VAGUE 1 COMPLÈTE. |
| P-04 | Header de landing par page (complet/allégé/personnalisé) | Sonnet 5 | P-01; en V2 après P-07 | 3,5 h | 2 | ⬜ | §7 |
| P-05 | Champs étendus (checkbox Loi 25, select, tel, hidden) + conditionnels + auto-peuplés (volet D) | ~~Opus 4.8~~ **Fable 5** | P-03 | 7 h | 2 | ✅ | Fermé — commits `41203b6` + hotfixes `dccdcf8` (script jamais seul enfant d'une expression JSX — regex du moteur Bookshop) et `f13b7da` (`options[*]` type d'entrée), poussés. Gate vert (95 tests), parité BYTE prouvée, e2e curl + navigateur 11/11, revue adversariale (2 corrigés). Détails : journal 17-20/07. |
| P-06 | Pagefind (build, page résultats, entrée header) | ~~Sonnet 5~~ **Fable 5** | ~~P-04~~ (inversé — P-06 AVANT P-04, décision utilisateur 28/07) | 7 h | 2 | 🟡 | Exécuté 28/07 (session directe). Intégration `victrix:pagefind` (astro.config.mjs, les 2 modes de build, garde-fou 0 page, exclusion worker `/pagefind/*`), page `[lang]/recherche.astro` (noindex, hors sitemap, PagefindUI locale + trad FR/EN via ui.ts, `?q=` supporté pour P-11, repli dev server), icône header desktop + lien tiroir mobile, périmètre d'index = `data-pagefind-body` sur `<main>` quand !noindex (BaseLayout) → 16 pages (8 fr-CA + 8 en-CA, wasm racinisation par langue), 0 fuite portail/merci/campagnes (vérifié fragments), `data-pagefind-ignore` sur ressources liées, `data-pagefind-meta/sort` date sur articles. BONUS : noindex ajouté à 404 + 2 pages portail (aligné plan convergence Phase 3). **CSP modifiée (OPS)** : `'wasm-unsafe-eval'` sur /fr/* et /en/* (wasm local Pagefind, commenté dans _headers). Gate : lint 0 err/8 warns préexistants, 100 tests, type-check 0 err/4 hints (1 nouveau bénin define:vars), build prod + STATIC_ONLY verts en copie isolée (piège robocopy : `/XD dist` relatif exclut node_modules/*/dist — chemins ABSOLUS requis). Reste : commit utilisateur + vérif préversion. |
| P-07 | Collection `services` composable + migration IA + méga-menu dynamique (E.3) + section ressources liées | **Opus 4.8** | P-01+P-02+P-05 | 10,5 h | 2 | ✅ | **Fermé — committé `08d060e` → rebasé sur 2 commits CloudCannon → `39fdd63` poussé.** Exécuté (Opus 4.8). 7 sections génériques (service-hero/numbered-cards/feature-boxes/tech-columns/callout/rich-text + related-posts), route `services/[slug]` (frontmatter+enrich form&related+build-gate formId), migration IA→service par script (`scripts/migrate-expertise-to-service.mjs`, 11 sections, image héros→public/images/sections), méga-menu E.3 (champ nav `service` + garde-fou `src/lib/navigation/service-links.ts` + test). Gate vert : lint 0, **100 tests** (+5), type-check 0, build + STATIC_ONLY (**27 pages**). Preuves : parité expertise+header **byte-identique**, marqueur `params(contentBlocks:sections)` non vide, DOM service = contenu expertise + ressources liées (vraies cartes résolues), **formulaire lié POST→303 /merci en direct** + jetons `{{page.*}}` résolus, garde-fous formId & méga-menu (builds négatifs). Piège : `getStaticPaths` hors portée frontmatter → préfixe **importé** (`SERVICE_URL_PREFIX`). Accueil/campagnes : hash bundle CSS `[slug]` change (palette +7, attendu, aucune régression de contenu). **Revue P-07 (20/07) : 8 constats corrigés** — 5 gardes-fous build prouvés par builds négatifs (parentHref orphelin, related-posts hors-service, double related-posts, href+espace, href+service), champ CMS `service` exposé (menu + méga-menu), grille vide masquée, `victrix:i18n-pairing` étendu aux services ; gate re-vert (lint 0, **100 tests**, type-check 0, build + STATIC_ONLY 27 pages), **expertise + accueil + campagnes + blogue byte-identiques** (seules les 2 pages services diffèrent d'espaces inter-balises inertes). Voir journal 20/07. Re-vérifié par l'utilisateur (lint 0/100 tests/type-check 0/build Complete!). Reste (hors P-07) : décision archi URLs P-17/P-18. |
| P-08 | Courriel de confirmation visiteur (2ᵉ envoi SMTP2GO) | **Opus 4.8** | P-05 | 3,5 h | 3 | ⬜ | §7 — serveur |
| P-09 | — fusionné dans P-05 (conditionnels = mêmes contrats) | — | — | — | — | — | |
| P-10 | Bandeau Loi 25 minimal (tokens) + mécanique de gating | **Opus 4.8** | — (GO utilisateur 17/07) | 10,5 h | 3 | ⬜ | §7 |
| P-11 | Pose GA4/GTM/Clarity + événements conversion + Site Search + objectifs | Sonnet 5 | P-10 + P-06 + OPS-CSP | 7 h | 3 | ⬜ | §7 |
| P-12 | Fil d'Ariane + BreadcrumbList JSON-LD | Sonnet 5 | — | 3,5 h | 3 | ⬜ | §7 |
| P-13 | Footer 3 bureaux + carte façade | Sonnet 5 | P-01 (zone ui.ts) | 3,5 h | 3 | ⬜ | §7 |
| P-14 | RSS + partage social sans témoins | Sonnet 5 | — | 3,5 h | 3 | ⬜ | §7 |
| P-15 | Page style-guide (tokens + vitrine palette, noindex) | Sonnet 5 | P-02 | 3,5 h | 3 | ⬜ | §7 — prépare le redesign |
| P-16 | Contrôle attributs (select charte, verrous, hex en dur) + `guide-edition.md` | Sonnet 5 | P-02+P-03+P-07 | 3,5 h | 3 | ⬜ | §7 — ferme la vague 3 |
| P-17 | Landing O Studio + formulaire dédié + matrice 301 + redirections expertises→services | Sonnet 5 | P-03+P-07+P-18+arch. | 7 h | 4 | ⬜ | §7 |
| P-18 | Inventaire URLs victrix.ca + ancien domaine O Studio → matrice zéro-404 | Sonnet 5 | — | 7 h | 4 | ⬜ | §7 — livrable = la matrice |
| P-19 | Migration contenu restant (sessions multiples) | Sonnet 5 | P-07 | 14 h | 4 | ⬜ | §7 |
| P-20 | Extension QA Playwright | Sonnet 5 | vagues 1–3 | 7 h | 4 | ⬜ | §7 |
| P-21 | Démo processus complet (env. de test + sécurité) + vidéo | **Fable 5 + humain** | P-03+P-07+clés+préversions | 3,5 h | 4 | ⬜ | §7 |
| P-22 | Formulaires multi-étapes (état par étape côté client, sans backend de session) | **Opus 4.8** | P-05 | 14 h | backlog | ⬜ | §7 — décision utilisateur 17/07 (rouvre le « non par défaut » des 3 docs); à lancer sur besoin marketing confirmé |
| OPS | Fil rouge (voir §5) | **Fable 5 + humain** | décisions | — | — | 🔵 | continu |

**Séquencement encodé** :
- **V1** : P-01 → P-02 → P-03 (P-01∥P-02 possible UNIQUEMENT si P-02 tourne
  dans un worktree git isolé, fusion après revue).
- **V2** : P-05 → P-07 → P-04 → P-06 (chaîne content.config/cloudcannon,
  puis Header.astro).
- **V3** : P-08 ∥ P-10 possibles (zones disjointes); P-12/P-14 libres; P-13
  après P-01; P-15 après P-02; P-16 ferme la vague; P-11 exige OPS-CSP.
- **V4** : P-18 → P-17; P-19/P-20 libres; P-21 clôt.

## 5. Ligne OPS (Fable 5 + humain, jamais délégué)

- Clés/secrets : SMTP2GO (compte + expéditeur vérifié + API key), Turnstile
  (widget + clés) — matrice dans `formulaires.md` §3.
- **Toute modification CSP** (`public/_headers` gelé) : Turnstile
  (`challenges.cloudflare.com`) ET analytics (domaines GA4/GTM/Clarity) —
  requis AVANT P-11.
- Réglages CloudCannon UI (Publishing → main, rôles éditeur/publieur, palier).
- Choix hébergeur cible (Azure Static Web Apps vs bundle CloudCannon).
- DNS/registrar de l'ancien domaine O Studio (301 hors dépôt).
- GSC + Bing Webmaster + suivi mensuel (au lancement).
- Décision protection des préversions (Cloudflare Access ou équivalent).
- Atelier contenus marketing (N4) — humain, doc `atelier-contenus.md` prêt.

## 6. Fiches complètes — texte final des prompts (le pilotage ajoute chaque fiche ici au lancement; 6.1–6.3 = vague 1, ✅ exécutées le 17 juil.)

### 6.1 P-01 — Navigation éditable (Opus 4.8)

**Objectif** : le menu principal, le méga-menu, la barre d'annonce et le
bouton portail deviennent éditables dans CloudCannon, sans double saisie
FR/EN ni régression visuelle.

**Prompt à coller** (précédé du préambule §3) :

```
TÂCHE : rendre la navigation éditable au CMS.

État actuel : src/components/Header.astro construit le menu depuis
useTranslations(lang) → t.nav et t.announce (src/i18n/ui.ts, codé en dur).
Formes exactes : nav.items = [{label, href}] (6 entrées); nav.mega =
{parentHref, ariaLabel, columns:[{title, href, icon, links:[{label,href}]}]}
(5 colonnes, icônes strategy|cloud|security|productivity|managed — les SVG
restent dans Header.astro); nav.portal = libellé du bouton; announce =
{before, strong, after, linkLabel, linkHref, close}.

À faire :
1. Crée src/data/navigation/fr.json et en.json portant : items, mega
   (colonnes/liens), announce (+ interrupteur `enabled`), portal ({label,
   visible}). Les chaînes d'accessibilité (brandAria, openMenu, closeMenu,
   langGroupAria, announce.close) RESTENT dans ui.ts (interface, pas contenu).
2. Valide ces fichiers au build avec zod (patron du dépôt : garde-fou qui
   FAIT ÉCHOUER le build avec un message nommant l'erreur — même philosophie
   que 'victrix:redirects' dans astro.config.mjs). Champs href : doivent
   commencer par « / » ou « https:// ».
3. Header.astro (et le tiroir mobile, même fichier) lit ces données au build
   au lieu de t.nav/t.announce — zéro régression : mêmes classes, même DOM,
   mega inchangé. Le sélecteur d'icône du méga-menu se limite aux 5 clés
   existantes.
4. cloudcannon.config.yml : nouvelle collection `navigation` sur
   src/data/navigation (patron de la collection `redirects` : disable_add,
   disable_file_actions, éditeur data en premier), libellés français,
   _inputs bornés (icon = select des 5 valeurs; enabled/visible = switch),
   structures pour items/columns/links (patron _structures existants).
5. Retire nav/announce de ui.ts UNIQUEMENT après le branchement (une seule
   source de vérité), en gardant les clés d'accessibilité.

DONE = gate complet vert + les deux pages d'accueil FR/EN rendent un DOM de
header identique à avant (diff visuel nul) + la collection « Navigation »
apparaît dans CloudCannon avec libellés FR et valeurs bornées + un lien
invalide dans fr.json casse le build avec un message clair.
```

### 6.2 P-02 — 4 sections de palette (Sonnet 5)

**Objectif** : enrichir la palette partagée (landings + accueil + futurs
services) de 4 sections exigées par le cahier des charges.

**Prompt à coller** (précédé du préambule §3) :

```
TÂCHE : ajouter 4 sections composables à la palette Bookshop, en suivant
EXACTEMENT le patron des 12 composants existants de
component-library/src/components/ (dossier <nom>/<nom>.astro +
<nom>.bookshop.yml, specs en français, styles via tokens).

Sections (types zod à ajouter à l'union sectionsSchema de
src/content.config.ts — partagée landing + home) :
1. `testimonial` — Témoignage : citation, nom, titre/poste, organisation,
   photo optionnelle (string — pas d'astro:assets dans un composant).
2. `logo-banner` — Bandeau logos partenaires : titre optionnel + items
   [{name, logo (string, optionnel — fallback texte stylé), description
   courte optionnelle}] + badge optionnel (ex. « Microsoft Cloud Network »).
   ATTENTION : DISTINCT de la section `home-partners` existante (liste de
   NOMS seulement, content.config.ts) — ne pas la modifier, ne pas dupliquer
   son type. Ta section est la version riche (logos + descriptifs + badge).
3. `stats` — Victrix en chiffres : titre + items [{number, label, suffix?}].
4. `video` — Vidéo embarquée en FAÇADE : image d'aperçu (string) + URL
   vidéo + titre. Le composant ne charge AUCUN script tiers au rendu; la
   façade est un lien/bouton. CONTRAINTE CSP : public/_headers est gelé et
   n'autorise pas frame-src YouTube — la v1 ouvre la vidéo dans un nouvel
   onglet; prépare le mode « iframe au clic » derrière un commentaire
   documenté et note l'entrée CSP requise (patron formulaires.md §7) dans ta
   note de session pour Fable 5.

Pour CHAQUE section : entrée d'union zod (champs optionnels = .optional(),
defaults en chaîne vide — voir le commentaire _structures de
cloudcannon.config.yml sur les null) + composant browser-safe + spec
.bookshop.yml (structures: [sections], labels/preview français) + si un
sous-tableau a une forme propre, structure dédiée dans cloudcannon.config.yml
(patron faq_items : re-pointer l'items du spec vers la bonne structure).

DONE = gate complet vert + STATIC_ONLY build : les 4 nouvelles entrées
apparaissent dans la palette générée (vérifie la sortie de npx
@bookshop/generate : « 16 structures » attendues ou équivalent) + une page
de démonstration de campagne utilisant les 4 sections rend correctement.
```

### 6.3 P-03 — Formulaires v2 cœur (Opus 4.8)

**Objectif** : les formulaires deviennent des données réutilisables avec
destinataire propre, sans jamais faire confiance au client pour le routage.

**Prompt à coller** (précédé du préambule §3) :

```
TÂCHE : refondre la définition des formulaires en données réutilisables.
Lis d'abord docs/formulaires.md EN ENTIER (architecture v1, contrat §4).

1. Nouvelle collection src/data/forms/*.json : {id, name (FR, pour
   l'éditeur), toEmail, subject, fields:[{name, label, type, required}],
   submitLabel, consentText}. Un fichier = un formulaire, réutilisable sur
   plusieurs pages. Crée 2 formulaires réels : « contact » et
   « campagne-evaluation » (reprendre les champs de la landing démo).
2. La section Bookshop « form » référence un formulaire par `formId` (select
   CloudCannon alimenté par la collection — utilise data_config/valeurs si
   possible, sinon select des ids documenté) au lieu de porter ses champs.
   Compat : conserver le rendu si des champs inline existent encore
   (dépréciation douce, note dans le spec).
3. SÉCURITÉ — endpoint src/pages/api/forms.ts : construis au build un
   registre embarqué des formulaires (import.meta.glob eager sur
   src/data/forms/*.json). Le POST envoie formId; le serveur résout
   toEmail/subject/champs requis DEPUIS LE REGISTRE — jamais depuis le
   client. FORMS_TO_EMAIL devient le repli si un formulaire n'a pas de
   toEmail. Un formId inconnu = échec de validation (303 ?erreur=1).
4. Valide src/data/forms/ au build (zod, même garde-fou que P-01 :
   toEmail au format courriel, ids uniques, champs non vides).
5. cloudcannon.config.yml : collection « Formulaires » (libellés FR,
   création autorisée AVEC schéma gabarit schemas/form.md valide,
   _inputs/_structures bornés — type de champ = select text|email|textarea
   pour l'instant, P-05 étendra).
6. Tests : étends src/lib/forms/validation.test.ts (registre : formId
   inconnu, résolution destinataire, repli) — les 62 tests existants restent
   verts.

DONE = gate complet vert + parcours complet en mode démo (astro dev,
PUBLIC_FORMS_ENABLED=1 sans clés SMTP2GO) : soumission → journal du courriel
simulé avec le BON destinataire par formulaire → /merci + un formId inconnu
rejeté + collection Formulaires éditable dans la config CloudCannon.
```

### 6.4 P-05 — Champs étendus + consentement Loi 25 (~~Opus 4.8~~ **Fable 5**) — VAGUE 2

**Objectif** : les formulaires savent poser une vraie case de consentement
(exigence Loi 25 du cahier des charges — écart confirmé de la revue), des
listes déroulantes, des téléphones et des champs cachés; le courriel de
notification reflète fidèlement l'état coché; des champs conditionnels
simples améliorent l'ergonomie sans jamais remplacer la validation serveur.

**Amendements du 17 juil. (décisions utilisateur, exécution Fable 5 en
session directe — plan approuvé)** :
- **Volet D ajouté — champs cachés auto-peuplés par la page hôte** : le
  `value` d'un champ `hidden` accepte des jetons `{{page.titre}}`,
  `{{page.chemin}}`, `{{page.slug}}`, `{{page.langue}}` (résolus au build via
  le seam enrich de la route campagnes → prop `pageContext`) et
  `{{url.<param>}}` EXACT (ex. `{{url.utm_source}}` — rempli au chargement
  par mini-script inline, CSP gelée respectée). Nouveau module partagé
  browser-safe `src/lib/forms/hidden-tokens.ts`.
- **Contrôle des champs obligatoires** : déjà couvert (interrupteur
  « Obligatoire » par champ + `_requis`/registre côté serveur) — rien à
  ajouter, demande vérifiée.
- **Multi-étapes** : PAS dans ce lot → **P-22** (backlog, choix explicite de
  l'utilisateur via question).

**Prompt à coller** (précédé du préambule §3) :

```
TÂCHE : étendre les types de champs des formulaires (v2).
Lis d'abord docs/formulaires.md EN ENTIER (contrats §4–5), puis
src/lib/forms/{field-name,registry,validation}.ts et l'entête de
component-library/src/components/form/form.astro (les contrats y sont
commentés — parité à l'octet, éditeur visuel, import.meta.env ?? {}).

Nouveaux types de champ : `checkbox`, `select`, `tel`, `hidden` (en plus de
text|email|textarea = 7 types). L'union vit à 6 endroits à synchroniser :
1. src/content.config.ts — DEUX enums distincts : champs inline de la
   section form (~l.114) ET collection `forms` (~l.429). Nouvelles clés
   zod sur un champ : `options: z.array(z.string())` (select — exigée non
   vide quand type=select, via superRefine/refine), `value: z.string()`
   (hidden — la valeur émise), `showIf: z.object({field, equals}).optional()`
   (conditionnel, permis sur tout champ visible).
2. src/lib/forms/registry.ts — FormFieldDef + normalisation
   options/value/showIf dans buildRegistry.
3. component-library/src/components/form/form.astro — rendu : checkbox
   (input + label cliquable, value="oui"; required = doit être cochée),
   select (options + première option vide « Choisir… »), tel
   (input type=tel), hidden (input type=hidden, jamais affiché, exclu du
   rendu des labels). PARITÉ : les formulaires existants (text/email/
   textarea) rendent un HTML IDENTIQUE à avant — prouve-le (diff dist/).
4. cloudcannon.config.yml — _structures.form_fields : select « Type de
   champ » étendu aux 7 types; nouvelles clés (options/value/showIf)
   éditables avec commentaires FR clairs; defaults en chaînes vides/
   tableaux vides — JAMAIS null (voir le commentaire _structures).
5. schemas/form-fr.json + schemas/form-en.json — gabarits à jour.
6. docs/formulaires.md §4–5 — contrat de champs mis à jour.

LOI 25 — le point dur : une case NON cochée est ABSENTE d'un POST
urlencoded. Le courriel de notification doit pourtant montrer l'état réel :
- Serveur : dérive les noms des cases depuis la DÉFINITION (registre) quand
  `_formId` est présent; en mode inline, nouvelle liste cachée `_cases`
  (même patron que `_requis`/`_courriels` — ajoute-la à META_FIELDS et au
  contrat §4).
- formatSubmissionText : chaque case affiche « oui »/« non » — jamais
  d'omission silencieuse. Une case required non cochée = champ requis
  manquant (la mécanique actuelle le donne presque gratuitement : absente
  → '' → échec requis; vérifie-le par un test).

CONDITIONNELS (`showIf: {field, equals}`) — ergonomie SEULEMENT :
- Navigateur : mini-script is:inline (CSP GELÉE : 'unsafe-inline' est déjà
  permis sur /fr/*|/en/* — AUCUN script externe, aucun changement de
  public/_headers) qui masque/affiche le champ selon la valeur du champ
  pilote; un champ masqué est aussi `disabled` (il ne se soumet pas).
  Patron data-astro-rerun + bloc { } de la bannière d'erreur (form.astro).
- Serveur : quand `_formId` est présent, évalue showIf DEPUIS LA DÉFINITION
  avec les valeurs soumises pour calculer la liste des requis (un champ
  requis dont la condition n'est pas remplie n'est PAS exigé) — zéro
  confiance dans le client, aucune liste conditionnelle envoyée par lui.
- Sans JavaScript : champs conditionnels visibles et non exigés si leur
  condition dépend d'une interaction — comportement documenté (progressive
  enhancement, §5).

SÉCURITÉ select : avec `_formId`, une valeur soumise hors de `options` est
un échec de validation (le registre est la source de vérité).

Seed : ajoute au formulaire « campagne-evaluation » (fr ET en) une case de
consentement REQUISE (texte Loi 25) et un select (ex. taille d'entreprise);
laisse « contact » inchangé (témoin de compatibilité).

Tests : étends validation.test.ts + registry.test.ts (case cochée/non
cochée dans le texte, case requise non cochée, valeur select hors liste,
requis conditionnel exigé/non exigé, hidden). Les 69 tests existants
restent verts.

DONE = gate complet vert + parité HTML des formulaires existants prouvée +
e2e démo (astro dev, PUBLIC_FORMS_ENABLED=1 sans clés) : case cochée →
journal « … : oui »; case requise non cochée → ?erreur=1; valeur select
falsifiée (curl) → rejet; champ requis sous condition non remplie → succès
+ dans la config CloudCannon, le « Type de champ » propose les 7 types
avec libellés FR.
```

### 6.5 P-07 — Collection `services` composable + méga-menu dynamique (Opus 4.8) — PROCHAIN LOT

**Objectif** : les 6 services du cahier des charges deviennent des pages
composables éditables au CMS (patron accueil/campagnes), l'expertise IA
migre comme premier service, et le méga-menu se construit depuis la
collection — sans casser l'existant.

**Prompt à coller** (précédé du préambule §3 VERBATIM) :

```
TÂCHE : collection `services` composable + migration IA + méga-menu
dynamique (E.3) + section « ressources liées ».
Lis d'abord EN ENTIER : src/pages/[lang]/campagnes/[slug].astro (LE modèle
de route à répliquer — commentaires load-bearing : variable `frontmatter`,
seam enrich, build-gate formId), docs/plan-services-formulaires.md
(chantiers A et E.3), scripts/migrate-home-to-sections.mjs (patron de
migration), src/pages/[lang]/expertises/intelligence-artificielle.astro +
src/content/expertises/ (la source à migrer), src/components/Header.astro +
src/data/navigation/fr.json (le méga-menu), et l'entête de
component-library/src/shared/astro/page.astro (seam enrich).

1. Collection `services` : src/content/services/{fr,en}/<slug>.json —
   patron EXACT de `landing` (mêmes `sections` partagées via sectionsSchema)
   MAIS pages PUBLIQUES INDEXABLES : pas de noindex par défaut (l'inverse
   des campagnes — décision explicite, commente-la). Même nom de fichier =
   paire de traduction. Zod : title, description, sections (+ ce que la
   migration exige).
2. Route src/pages/[lang]/services/[slug].astro : réplique du patron
   campagnes, AVEC TOUT ce qui y est load-bearing : variable LITTÉRALE
   `frontmatter` + <Page bookshop:live contentBlocks={frontmatter.sections}>,
   enrich.form = { resolvedForms, pageContext } (les formulaires liés et les
   jetons {{page.*}} de P-05 doivent fonctionner sur un service AUSSI),
   build-gate formId (throw nommant page+fichier), altLocalePath par fichier
   homonyme. Préfixe d'URL en CONSTANTE commentée (architecture
   d'information non confirmée — « services » provisoire, P-17/P-18
   trancheront les redirections).
3. Migration : l'expertise IA devient le service `intelligence-artificielle`
   par SCRIPT commité (scripts/, patron migrate-home-to-sections.mjs :
   machine-fidèle, rejouable). Si un bloc de la page expertise n'a pas
   d'équivalent dans la palette (17 composants), crée la ou les sections
   manquantes en suivant les 4 contrats — browser-safe, données build via
   enrich. /expertises/intelligence-artificielle RESTE fonctionnelle et
   inchangée (la redirection viendra en P-17) : ne supprime RIEN.
4. Méga-menu dynamique (E.3) : Header.astro construit les liens de services
   du méga-menu depuis la COLLECTION, dans l'ORDRE défini par
   src/data/navigation/<lang>.json (la navigation reste la source d'ordre et
   de libellés; garde-fou build : un lien de méga-menu pointant vers un
   service inexistant CASSE le build avec un message clair — patron des
   garde-fous existants). Parité DOM du header : identique à avant tant que
   la navigation ne référence pas de nouveau service (prouve-le).
5. Section « ressources liées » (nouveau type, ex. `related-posts`) : titre
   + étiquettes (tags du blogue) → au build, la route résout les articles
   correspondants via le seam enrich (patron EXACT de home-latest :
   cartes pré-résolues, repli factice documenté dans l'éditeur visuel).
   4 contrats complets (zod partagé, composant browser-safe, spec
   .bookshop.yml, structure/inputs CloudCannon si sous-tableau).
6. cloudcannon.config.yml : collection « Services » (libellés FR, éditeurs
   visual+data, création AVEC gabarits schemas/service-fr.json +
   service-en.json — patron de la collection forms : schéma par langue,
   création dans le bon dossier). RÈGLE DU FICHIER : defaults en chaînes
   vides, jamais null; un tableau seedé vide DOIT déclarer son type
   d'entrée (`nom[*]`) ou une structure (leçon P-05, 20/07).
7. RÈGLE BOOKSHOP (leçon P-05, 20/07, commentée dans form.astro) : dans un
   composant de section, JAMAIS un <script> comme unique enfant d'une
   expression JSX {cond && (…)} — le moteur retire les scripts par regex
   avant compilation, le « ( ) » orphelin casse le build CloudCannon.

DONE = gate complet vert (npm run lint 0 err, npm test 95+ verts, npm run
type-check 0 err, npm run build ET STATIC_ONLY=1 npm run build — copie
isolée si un dev server tourne, docs/operations.md §3.1) +
/fr/services/intelligence-artificielle/ et /en/… rendent le MÊME CONTENU
que la page expertise (comparaison DOM structurée) + la page expertise
existante est BYTE-identique à avant + le header est BYTE-identique à avant
+ marqueur bookshop-live params(...) NON vide sur les pages services (build
STATIC_ONLY) + un formulaire lié posé sur un service fonctionne en mode
démo (PUBLIC_FORMS_ENABLED=1 : POST → /merci, jetons {{page.*}} résolus) +
collection « Services » éditable dans la config CloudCannon + garde-fou
méga-menu prouvé par un test négatif.
```

## 7. Fiches condensées (vagues 2–4) — texte final rédigé par le pilotage au lancement

- **P-04** : frontmatter landing + objet `header` (zod), select mode
  complet/allégé/personnalisé, liens bornés, CTA, switches annonce/langue;
  `Header.astro` accepte une config optionnelle (défaut = navigation P-01);
  route campagnes la passe. AMENDEMENT 28/07 (P-06 passé avant) : le header
  porte maintenant une icône recherche (`site-header__search`) + un lien
  « Recherche » dans le tiroir mobile — décider de son sort par mode (proposé :
  visible en complet, absente en allégé/personnalisé sauf opt-in) et le
  couvrir dans les preuves de parité. Done : une campagne en mode allégé ne
  montre que logo + CTA; les autres pages inchangées.
- **P-05** : → fiche finale rédigée, voir **§6.4**.
- **P-06** : ✅ exécuté (28/07, Fable 5) — voir la ligne du tableau §4.
  Extension future (post-migration Phase 6, si besoin) : filtres par type de
  contenu via `data-pagefind-filter` sur les gabarits (services/articles/
  pages) — l'UI Pagefind les affiche automatiquement; non requis pour la v1.
- **P-07** : → fiche finale rédigée, voir **§6.5**.
- **P-08** : second envoi SMTP2GO au soumetteur (gabarit texte par langue,
  adresse du visiteur = champ email du formulaire), échec d'envoi de
  confirmation non bloquant (journalisé). Serveur → Opus.
- **P-10** : composant bandeau (tokens, Accepter/Refuser, lien politique),
  état de consentement (localStorage + classe/évènement), gating générique
  des scripts (aucun script analytique chargé sans consentement), pages
  FR/EN, a11y (focus, clavier). Design minimal ASSUMÉ (décision 17/07) —
  re-stylé au redesign via tokens.
- **P-11** : pose des scripts sous consentement (P-10), événements :
  soumission de formulaire (page /merci en repli), recherche interne
  (P-06), objectifs GA4; documentation des ID dans `.env.example`;
  PRÉREQUIS : entrées CSP appliquées par Fable 5 (OPS).
- **P-12** : composant fil d'Ariane + BreadcrumbList JSON-LD (patron JsonLd
  existant), intégré aux gabarits internes (pas l'accueil).
- **P-13** : `ui.ts` footer + `Footer.astro` : 3 bureaux (Québec · Montréal ·
  Paris — adresses à confirmer, placeholders balisés), carte = façade
  statique cliquable (pas d'embed Google : témoins/Loi 25).
- **P-14** : flux RSS des ressources (natif Astro), boutons de partage =
  liens simples sans script tiers, image OG par contenu si champ présent.
- **P-15** : page `/style-guide/` noindex : tokens (couleurs, typo, espaces)
  + vitrine des sections de la palette avec données factices. Sert de page
  de contrôle visuel pour le redesign (« re-peau »).
- **P-16** : `accent` (cartes expertise) → select des couleurs de charte;
  audit des hex en dur (PortalLogin.astro:263); verrous répliqués sur
  `forms`/`services`; mise à jour `guide-edition.md` (ce que l'éditeur peut
  / ne peut pas changer).
- **P-17** : landing `/services/o-studio/` (palette) + formulaire dédié
  (fichier src/data/forms/) + implémentation de la matrice 301 de P-18 dans
  `redirects.json` + redirections expertises→services (post-architecture).
- **P-18** : crawl/inventaire des URLs publiées de victrix.ca ET de l'ancien
  domaine O Studio → livrable : matrice CSV/JSON ancienne URL → nouvelle
  (zéro-404). P-17 l'implémente.
- **P-19** : port du contenu restant vers les collections (par lots,
  plusieurs sessions; priorités de l'atelier contenus).
- **P-20** : specs Playwright : soumission de formulaire (mode démo),
  navigation/méga-menu, rendu services, bandeau consentement.
- **P-21** : scénario de démo chantier D (`plan-services-formulaires.md`) :
  édition → préversion branche (env. de test) → build-gate → Publish par
  rôle → rollback. Capture vidéo. Fable 5 + humain.
- **P-22** (backlog — décision utilisateur 17/07, sort du « non par défaut »
  d'analyse-criteres/atelier-contenus/revue-cahier-des-charges) : formulaires
  multi-étapes — découpage d'une définition en étapes (contrats P-05 comme
  base), navigation client en progressive enhancement SANS état serveur (une
  seule soumission finale, validation serveur inchangée), compat éditeur
  visuel + mode maquette. À chiffrer finement et lancer seulement sur besoin
  marketing confirmé (formulaire long réel).

## 8. Mapping estimé [Astro] → prompts (auditable)

| Ligne estimé | P-xx |
|---|---|
| F0.1 (fait), F1.2 (fait), F2.2 (fait), F3.4 (fait), F1.1 (reporté) | — |
| F0.2 inventaire zéro-404 | P-18 |
| F0.3 décisions | OPS |
| F2.1 (a/b/c types de contenus) | P-02 (sections), P-07 (services), P-19 + atelier (instances) |
| F2.3 footer 3 bureaux + carte | P-13 |
| F2.4 recherche | P-06 |
| F2.5 formulaires (restant) | P-03, P-05, P-08 |
| F2.7 CSP Turnstile (restant 1 h) | OPS |
| F2.8 Loi 25 | P-10 |
| F3.1 migration contenu | P-19 |
| F3.2 fil d'Ariane | P-12 |
| F3.3 analytics | P-11 |
| F4.1 QA (extension Playwright) | P-20 (partiel — QA manuelle hors backlog, vague finale) |
| F4.2 / F4.3 / F4.4 audits | hors backlog (vague finale, après contenu) |
| F4.5 mise en ligne | OPS (DNS, GSC/Bing, hébergeur) + P-17/P-18 (301) |
| N1 O Studio | P-17 |
| N2 RSS/social | P-14 |
| N3 style-guide | P-15 |
| N4 atelier contenus | OPS (humain) |
| N5 portail | hors périmètre (estimé séparé) |

## 9. Journal des sessions

| Date | Session | Résultat |
|---|---|---|
| 2026-07-29 (3) | Fable 5 — **Migration : 55 expertises SiteOrigin → staging services**. `lib-wxr.mjs` factorisée (balancedEnd/extractBlocks/rewriteUrl… — preuve de non-régression : re-run articles = staging byte-identique) + `convert-expertises.mjs` : flux ordonné blocs éditeur + **widgets custom MAG** (le vrai contenu : ~470 `[siteorigin_widget]` avec JSON encodé **mal échappé** → moisson regex à terminateurs structurels, réparation des `\n` amputés `>nChez`), mapping v1 service-hero (widget Intro_Text_Img → lead+image) + rich-text (h2/headline = titres de section, listes équilibrées, liens réécrits), hiérarchie en chemins fr/<parent>/<enfant>.json, paires Polylang homonymes. Sortie : 55 JSON + rapport (23 Brizy reportées, 5 brouillons, 6 sans traduction, 142 médias, 9 pages à formulaires GF, 2 quasi vides). Piège PS : `-match` insensible à la casse → fausse alerte artefacts (`-cmatch`). | Staging expertises ✅ (revue user); reste : Brizy (23), pages (27), menus/redirections |
| 2026-07-29 (2) | Fable 5 — **Phase 0 ✅ + Phase 1 🟡 convergence**. Phase 0 : Node 20.20.2 activé, `npm ci` (3 processus node zombies du vieux dev server tués — verrouillaient node_modules), gate baseline vert. Phase 1 (pilote Tailwind v4) : plugin `@tailwindcss/vite`, `src/styles/theme.css` (imports granulaires sans preflight, tokens @theme « Luminous Precision » à noms non-collisionnels : nuit/royal/céleste/givre…, ombres, radius), Hanken Grotesk variable auto-hébergée (34,7 Ko), `testimonial.astro` 100 % utilitaires (zéro CSS scopé). Preuves : gate vert, builds dans vvbuild (EBUSY AV récidivant sur dist en repo), **parité 37/39 pages byte** (seules les demo-sections diffèrent — attendu), tokens/utilitaires/@font-face dans le CSS de build, marqueur live non vide. Reste : vérif humaine éditeur visuel CloudCannon (LE risque de phase) → GO/NO-GO Phase 5. | Phase 0 ✅, Phase 1 🟡 (commit user + vérif CC) |
| 2026-07-29 | Fable 5 — **Migration : articles convertis en staging** (Phase 6 amorcée sans branchement). Nouveau script rejouable `scripts/migration/convert-articles.mjs` : 64 posts WXR → `docs/migration/staging/blog/{fr,en}/` (30 paires, 2 FR sans traduction, 2 brouillons `draft: true`, slug par langue en frontmatter, fichiers homonymes = convention du dépôt) + `rapport-articles.md` (75 médias, 7 articles vidéo iframes→liens CSP, avertissements par article). Robustesse acquise en cours de route : balayage ÉQUILIBRÉ des blocs (listes imbriquées — la regex non-gourmande fermait au premier `</ul>`/`</li>`) et reconstruction des `<li>` orphelins (widgets SiteOrigin gardant le `<ul>` dans l'habillage). Champs de transition dans le frontmatter (coverImage chemin public, seoTitle Yoast, author, wpUrl) à trancher au branchement. Reste avant port vers `src/content/blog/` : décisions §16 Q1/Q2, schéma blog (coverImage/seoTitle), rapatriement médias. | Staging articles ✅ (revue user); P-19 dé-risqué |
| 2026-07-28 | Fable 5 — **P-06 exécuté** (session directe, demande utilisateur : recherche interne optimisée + assurance SEO marketing). Fichiers : `astro.config.mjs` (+`victrix:pagefind` : index au build dans les 2 modes, garde-fou 0 page, exclusion `/pagefind/*` du worker; sitemap −`/recherche/`), `src/pages/[lang]/recherche.astro` (nouvelle, noindex, PagefindUI locale, trad FR/EN, `?q=`, repli dev), `src/i18n/ui.ts` (bloc `search` fr/en), `src/components/Header.astro` (icône desktop + lien tiroir), `src/layouts/BaseLayout.astro` (`data-pagefind-body` sur `<main>` quand !noindex), `404.astro` + 2 pages portail (noindex — aligné Phase 3 convergence), `related-posts.astro` (`data-pagefind-ignore`), `ressources/[slug].astro` (meta/tri date), `public/_headers` (**CSP OPS : +`'wasm-unsafe-eval'`** /fr/* /en/*), `package.json` (+`pagefind` dev). Preuves : index = 16 pages exactement (8 fr-CA + 8 en-CA, wasm par langue), 0 fuite portail/merci dans les fragments, icône+lien dans le DOM buildé, sitemap sans /recherche/, `_routes.json` exclut `/pagefind/*`. Gate vert (lint 0/100 tests/type-check 0/build+STATIC_ONLY, copie isolée vvbuild — piège : `/XD` robocopy en chemins ABSOLUS sinon les `dist` de node_modules sautent). NOUVEAU DOC `docs/seo-strategie.md` (équivalence Yoast→natif, migration métadonnées, gouvernance CMS, backlog SEO priorisé). Plans mis à jour (ordre P-06↔P-04 inversé, fiche P-04 amendée). | P-06 🟡 (commit utilisateur); prochain : P-04 (Sonnet 5) + Node 20 (humain, Phase 0 convergence) |
| 2026-07-20 (soir) | Utilisateur + Opus 4.8 — **P-07 COMMITTÉ & POUSSÉ (clôture)**. L'utilisateur a commité P-07 avec les 8 correctifs de revue (`08d060e`), puis — remote avancé par 2 commits éditeur CloudCannon (`demo-sections.md` fr/en + `campagne-evaluation.json`, aucun chevauchement) — rebasé proprement → **`39fdd63` poussé** sur spike/cloudcannon. Re-vérifié par l'utilisateur : lint 0 err/8 warns pré-existants, **100 tests**, type-check 0 err, `npm run build` **Complete!** (27 pages prérendues, services + expertises incluses). Pièges consignés : rebase avec dev server actif → verrou Windows intermittent sur les fichiers source (récupération sûre `git rebase --quit` + `git checkout -f <branche>`, le commit reste dans le reflog) ; « help me push » = préparer le rebase MAIS laisser le `git push` final à l'utilisateur. Pas de revue Fable 5 (décision utilisateur). | **P-07 ✅ fermé** — vague 2 : **P-04 prochain (Sonnet 5)** |
| 2026-07-20 | Opus 4.8 (1M) — **revue P-07 : 8 constats corrigés** (branche `spike/cloudcannon`, non commité). BLOQUANTS — (#1) champ `service` des liens de nav exposé au CMS : `service: ''` dans `_structures.nav_links.value` (sert menu ET colonnes du méga-menu via `_inputs.links`) + `_inputs.service` (texte + aide FR « SOIT lien SOIT service ») ; (#2) garde-fou build dans le renderer partagé `component-library/src/shared/astro/page.astro` — une section `related-posts` sans cartes résolues (posée hors route services) CASSE le build au lieu d'expédier les cartes factices (**choix « garde-fou » vs « alimenter 3 routes » : aligné sur le patron build-gate formId/navHref/service, et évite la redite related-posts↔home-latest**) ; (#3) `Header.astro` — accroche du méga-menu comparée sur les URLs RÉSOLUES (un item converti en `service` garde son méga-menu) + garde-fou « parentHref orphelin ». IMPORTANTS — (#4) `related-posts.astro` ne rend RIEN quand 0 article résolu (plus de titre + CTA sur grille vide ; maquette éditeur intacte) ; (#5) garde-fou build « >1 `related-posts` par page » (route services). MINEURS — (#6) `content.config.ts` : le superRefine `navLink` valide la valeur BRUTE de `href` (« ␣/contact » précédé d'une espace échoue de nouveau — régression P-01 refermée) ; (#7) `href` ET `service` remplis = rejet build (message FR) + test `service-links` reformulé (précédence de resolveNavHref = filet défensif, plus un mode d'écriture supporté) ; (#8) `./src/content/services` ajouté au rapport `victrix:i18n-pairing` (extension `.json` portée par collection). VÉRIFS (copie isolée, dev server actif :4399) : lint 0 err/8 warns pré-existants, **100 tests**, type-check 0 err/3 hints, build prod + STATIC_ONLY **27 pages** verts ; **5 builds négatifs** prouvent chaque garde (#2/#3/#5/#6/#7) ; **parité dist : page expertise + accueil + campagnes + blogue byte-identiques** (35/37 HTML), seules les 2 pages services diffèrent d'espaces inter-balises inertes (wrapping conditionnel #4 — identiques après normalisation). | 8 constats corrigés, gate + 5 négatifs verts, statut 🟡 (revue Fable 5 / commit utilisateur) |
| 2026-07-20 | Opus 4.8 (1M) — **P-07 exécuté** (services composables). 7 sections génériques (service-hero, numbered-cards, feature-boxes, tech-columns, callout, rich-text, related-posts) + route `src/pages/[lang]/services/[slug].astro` (réplique campagnes : `frontmatter`, enrich form+related-posts, build-gate formId) + `scripts/migrate-expertise-to-service.mjs` (IA→service, machine-fidèle, image héros→public) + méga-menu E.3 (champ nav `service` optionnel + `src/lib/navigation/service-links.ts` pur/testé) + collection CloudCannon « Services » (+`_structures.numbered_card_items`/`tech_groups`) + `schemas/service-{fr,en}.json`. Gate vert : lint 0 err, **100 tests** (dont 5 `service-links`, négatif inclus), type-check 0 err, build prod + STATIC_ONLY (**27 pages**). Preuves : page expertise + header **byte-identiques** (diff dist), marqueur bookshop-live `params(contentBlocks:sections)` non vide sur les services, comparaison DOM (service = tout le contenu expertise, dans l'ordre, + « ressources liées » aux **vraies cartes** résolues au build), **formulaire lié POST→303 /fr/merci en direct** (mode démo, objet résolu serveur) + contre-preuve consentement Loi 25 → ?erreur=1, garde-fous formId & méga-menu prouvés par builds négatifs. Piège consigné : `getStaticPaths` s'exécute dans une portée SÉPARÉE (pas d'accès aux const du frontmatter) → préfixe d'URL importé depuis service-links.ts. Accueil/campagnes : seul le hash du bundle CSS `[slug]` change (palette +7 composants, attendu — contenu inchangé). | Gate vert + preuves, statut 🟡 (revue Fable 5) |
| 2026-07-20 | Fable 5 — pilotage : P-05 fermé ✅ (commits `41203b6`/`dccdcf8`/`f13b7da` poussés par l'utilisateur). Fiche finale **P-07 rédigée (§6.5)** — délégation reprend (Opus/Sonnet, revue Fable 5 au retour). §0 et §7 rafraîchis. | P-07 prêt à lancer (Opus 4.8) |
| 2026-07-20 | Fable 5 — **correctif éditeur** : tableau « Options (liste déroulante) » signalé « misconfigured » quand vide (le clonage exige une entrée existante). Fix : type d'entrée du tableau via la notation documentée `options[*]: {type: text}` (cloudcannon.config.yml, niveau structure). NB : distinct du gotcha « fields[*].type inerte » (chemins imbriqués non supportés) — `nom[*]` au premier niveau EST la config officielle du type d'entrée. | Correctif config à committer |
| 2026-07-20 | Fable 5 — **correctif build CloudCannon post-commit P-05** (`41203b6` cassait le postbuild Bookshop). Cause racine : astro-engine retire les `<script>…</script>` PAR REGEX avant de compiler (builder.js l.205) → un script UNIQUE enfant d'une expression `{cond && (…)}` laisse un « ( ) » orphelin; localement invisible (compilateur plus récent → échec DANS le try → repli texte complet l.211), chez CloudCannon le vieux compilateur imbriqué tolère le gabarit amputé et esbuild meurt l.214 hors try. Correctif : les 2 mini-scripts P-05 rendus inconditionnels dans le fragment formsEnabled (inertes sans conditionnel/jeton url), règle documentée dans l'entête de form.astro. Prouvé : harnais rejouant les DEUX chemins du moteur (amputé + complet) vert, contre-preuve HEAD reproduit le « && ( ) », gate + generate 16 structures/6 pages verts. | Correctif à committer (hotfix P-05) |
| 2026-07-18 | Fable 5 — **P-05 exécuté** (+ volet D auto-peuplé, décision user; multi-étapes → P-22 backlog). Fichiers : `src/lib/forms/hidden-tokens.ts` (+test, jetons page/url), `content.config.ts` (formFieldCore partagé 7 types + formFieldRules build-gate FR), `registry.ts` (normalisation, requis conditionnels évalués serveur, `_cases`, liste blanche select — options trimées), `validation.ts` (reflectCheckboxes oui/non), `api/forms.ts`, `form.astro` (rendu 7 types, 2 scripts inline DANS le fragment formsEnabled — parité; hidden via display inline, .lp-form__field flex bat l'attribut hidden), `[slug].astro` (enrich.pageContext), cloudcannon.config.yml + schemas + form.bookshop.yml (forme complète), seeds campagne-evaluation, docs §4-5-10 + guide-edition. Pièges consignés : cache `.astro` périmé → 500 dev sur campagnes (purger); artefact cp1252 du harnais curl (faux rejet accents). | Gate vert + e2e + navigateur + revue adversariale (2 corrigés), statut 🟡 |
| 2026-07-17 | Fable 5 — **pilotage : ouverture de la vague 2.** P-03 fermé (commit `ec065b3` poussé par l'utilisateur) → vague 1 ✅ complète. Fiche finale P-05 rédigée (§6.4) après relecture du code livré (field-name/registry/validation/form.astro/cloudcannon). Restes OPS notés en §0 : vérifs CloudCannon post-push + réconciliation estimé xlsx (~21 h vague 1). | Vague 2 ouverte — P-05 prêt à lancer (Opus 4.8) |
| 2026-07-17 | Fable 5 — création de ce plan (vérifié par 3 agents : faits/couverture/séquencement) | Backlog initial, vague 1 prête |
| 2026-07-17 | Fable 5 — **P-03 exécuté** (vague 1 complète). Fichiers : `src/lib/forms/{field-name,registry,registry.test}.ts` (logique de noms PARTAGÉE composant/serveur + registre-liste-blanche), `src/data/forms/{fr,en}/{contact,campagne-evaluation}.json`, `schemas/form-{fr,en}.json`, collection `forms` (content.config.ts) + `formId` sur la section form, `validation.ts` (+`_formId` méta), `api/forms.ts` (import.meta.glob registre, destinataire/objet/listes depuis la définition), `form.astro` (résolution via enrich, parité inline préservée, note éditeur), `[slug].astro` (enrich + build-gate formId), `form.bookshop.yml`, cloudcannon.config.yml (collection Formulaires), pages démo (form par référence), formulaires.md §4. Supprimé : `landing/fr/test.md`. | Gate vert, e2e démo prouvé, statut 🟡 |
| 2026-07-17 | Fable 5 — **P-02 exécuté** + 2 ajouts utilisateur. Fichiers : 4 composants `component-library/src/components/{testimonial,logo-banner,stats,video}/` (+ specs FR), union zod +4 types (`content.config.ts`), `_structures.logo_items/stat_items` (cloudcannon.config.yml), pages démo `src/content/landing/{fr,en}/demo-sections.md`, `.env.example` réécrit (périmètre : CloudCannon bundle, Azure alt., pas d'Entra/Dataverse), `guide-edition.md` (sections Traduire/dupliquer + Navigation + palette à jour), `astro.config.mjs` (+`victrix:i18n-pairing`, avertissement non bloquant), GUIDE-PROJET (décision hébergement 17 juil.). Constat : `landing/fr/test.md` sans traduction EN (reliquat de test CloudCannon) — à supprimer ou traduire (décision utilisateur). | Gate vert, 16 structures, 7 pages live, parité OK, statut 🟡 |
| 2026-07-17 | Fable 5 — **P-01 exécuté** (l'utilisateur a demandé d'avancer pendant les crédits Fable 5). Fichiers : `src/data/navigation/{fr,en}.json` (nouveaux), `src/content.config.ts` (collection `navigation` + navHref zod), `src/components/Header.astro` (getEntry + interrupteurs annonce/portail), `src/i18n/ui.ts` (nav/announce réduits aux chaînes a11y), `cloudcannon.config.yml` (collection Navigation + `_structures.nav_links`/`nav_columns`). Convention : liens SANS préfixe de langue (l'inverse des ctaHref de sections — commenté partout). | Gate vert, parité prouvée, statut 🟡 (revue humaine + commit) |
