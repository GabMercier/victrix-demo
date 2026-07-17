# Plan de prompts — exécution multi-modèles (document vivant)

> **Le tableau de bord d'exécution du projet.** Créé le 17 juillet 2026,
> mis à jour à CHAQUE session (déléguée ou de pilotage). Sources :
> `plan-services-formulaires.md` (chantiers A–E), `revue-cahier-des-charges.md`
> (écarts), et l'estimé enrichi — fichier EXTERNE au dépôt :
> `C:\Repo\Victrix\Refontee site web Victrix - Estimé haut niveau – Copie.xlsx`
> (les codes F-xx / N-x ci-dessous renvoient à ses lignes [Astro]).

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
| P-01 | Navigation éditable (menu, méga-menu, annonce, bouton portail → `src/data/navigation/`) | ~~Opus 4.8~~ **Fable 5** | — | 7 h | 1 | 🟡 | Fait 17/07 (Fable 5). Gate vert (lint 0 err, 62/62, type-check 0 err, 2 builds en copie isolée), parité DOM header+mobile FR/EN prouvée, test négatif OK (lien invalide → build cassé avec message nommant le champ). Bonus CMS : interrupteurs annonce + portail. À REVOIR puis committer. |
| P-02 | 4 sections palette : Témoignage, Bandeau logos, Chiffres, Vidéo (façade) | Sonnet 5 (exception patron) | P-01 (ou ∥ worktree) | 7 h | 1 | ⬜ | Fiche complète §6.2 |
| P-03 | Formulaires v2 cœur : collection `src/data/forms/` + réf. + destinataire par formulaire | **Opus 4.8** | P-02 | 7 h | 1 | ⬜ | Fiche complète §6.3 |
| P-04 | Header de landing par page (complet/allégé/personnalisé) | Sonnet 5 | P-01; en V2 après P-07 | 3,5 h | 2 | ⬜ | §7 |
| P-05 | Champs étendus (checkbox Loi 25, select, tel, hidden) + conditionnels + `formatSubmissionText` | **Opus 4.8** | P-03 | 7 h | 2 | ⬜ | §7 |
| P-06 | Pagefind (build, page résultats, entrée header) | Sonnet 5 | P-04 (Header.astro) | 7 h | 2 | ⬜ | §7 |
| P-07 | Collection `services` composable + migration IA + méga-menu dynamique (E.3) + section ressources liées | **Opus 4.8** | P-01+P-02+P-05 | 10,5 h | 2 | ⬜ | §7 |
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

## 6. Fiches complètes — vague 1

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

## 7. Fiches condensées (vagues 2–4) — texte final rédigé par le pilotage au lancement

- **P-04** : frontmatter landing + objet `header` (zod), select mode
  complet/allégé/personnalisé, liens bornés, CTA, switches annonce/langue;
  `Header.astro` accepte une config optionnelle (défaut = navigation P-01);
  route campagnes la passe. Done : une campagne en mode allégé ne montre que
  logo + CTA; les autres pages inchangées.
- **P-05** : étendre l'union des types de champ (checkbox/select/tel/hidden)
  dans les 4 contrats + `formatSubmissionText` reflète l'état coché
  (exigence Loi 25) + conditionnels (`showIf` : {field, equals}) en
  progressive enhancement — le serveur revalide tout, le conditionnel est
  ergonomie seulement.
- **P-06** : Pagefind au build (STATIC_ONLY ET build prod), page
  `/[lang]/recherche/`, entrée header (données P-01), filtres par type si
  simple. Note : l'UI Pagefind charge ses assets localement (CSP-safe).
- **P-07** : collection `services` composable (patron accueil : sections +
  enrich), migration expertise IA = 1er service (script, patron
  `migrate-home-to-sections.mjs`), route `/[lang]/services/[slug]/`
  (URLs provisoires si architecture non confirmée — préfixe configurable),
  méga-menu construit depuis la collection + ordre de `navigation/` (E.3),
  section « ressources liées » par étiquettes. Garder
  `/expertises/intelligence-artificielle` fonctionnelle (redirection viendra
  en P-17).
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
| 2026-07-17 | Fable 5 — création de ce plan (vérifié par 3 agents : faits/couverture/séquencement) | Backlog initial, vague 1 prête |
| 2026-07-17 | Fable 5 — **P-01 exécuté** (l'utilisateur a demandé d'avancer pendant les crédits Fable 5). Fichiers : `src/data/navigation/{fr,en}.json` (nouveaux), `src/content.config.ts` (collection `navigation` + navHref zod), `src/components/Header.astro` (getEntry + interrupteurs annonce/portail), `src/i18n/ui.ts` (nav/announce réduits aux chaînes a11y), `cloudcannon.config.yml` (collection Navigation + `_structures.nav_links`/`nav_columns`). Convention : liens SANS préfixe de langue (l'inverse des ctaHref de sections — commenté partout). | Gate vert, parité prouvée, statut 🟡 (revue humaine + commit) |
