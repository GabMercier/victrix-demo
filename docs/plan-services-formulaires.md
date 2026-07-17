# Plan — Services, formulaires v2, menus éditables, contrôle éditorial et démo « environnement de test »

> Cadrage des chantiers de la phase contenus, décidés le 17 juillet.
> **SUIVI D'EXÉCUTION : `plan-prompts.md`** (le tableau de bord vivant). État
> au 17 juil. soir : lot 1 (sections palette) ✅, lot 6 (navigation éditable) ✅,
> lot 3 (formulaires v2 cœur) en revue; hébergement tranché = bundle
> CloudCannon (Azure en alternative), Entra/Dataverse hors périmètre v1.
> Intrant connu : **les expertises deviennent des services** (architecture
> d'information finale en attente de confirmation — on prépare sans se bloquer).
> Compléments : `atelier-contenus.md` (types + limites), `formulaires.md`
> (pipeline v1), `revue-cahier-des-charges.md` (exigences sources).

## Chantier A — Expertises → Services

**Ce qu'on sait déjà** : 6 services au cahier des charges (Cybersécurité,
Services gérés TI, Infonuagique, Productivité & ServiceNow, IA, Conseil
stratégique) ; la page expertise actuelle (`src/content/expertises/`) devient
un service parmi d'autres. **Ce qu'on attend** : l'architecture d'information
confirmée (arborescence, méga-menu, URLs définitives).

**Recommandation structurante : les services seront COMPOSABLES (sections),
pas un gabarit figé.** Le patron est prouvé deux fois (landings, accueil
converti). Le cahier impose une structure narrative (héros → problème →
solution → bénéfices → preuves → CTA) : chaque bloc devient une section de la
palette partagée, le marketing garde la main, la charte reste bornée.

Travaux préparables dès maintenant (sans l'architecture confirmée) :

1. **Collection `services`** : schéma zod `sections` (union discriminée
   partagée — le même mécanisme que l'accueil), champs SEO, `slug` par langue.
   L'expertise IA existante est migrée comme premier service (script de
   migration, comme `migrate-home-to-sections.mjs`).
2. **Sections nouvelles pour la palette** (réutilisables partout — landings,
   services, accueil) : Témoignage ⚑, Bandeau logos partenaires ⚑, « Victrix
   en chiffres » ⚑, Vidéo embarquée (façade cliquable), FAQ (existe déjà),
   Formulaire contextuel (voir chantier B).
3. **Redirections** : matrice `/fr|en/expertises/*` → `/fr|en/services/*`
   dans `src/data/redirects.json` (mécanisme existant, validé au build).
4. **En attente de confirmation** : URLs finales, méga-menu, ordre des
   services, O Studio (`/services/o-studio/` — landing composable prévue).

## Chantier B — Formulaires v2 (plus complexes) 

Le pipeline v1 (`formulaires.md`) est volontairement minimal : champs
`text|email|textarea`, destinataire global, un formulaire par landing.
La v2 vise les « formulaires dynamiques » du cahier (diapo 14) :

1. **Formulaires comme DONNÉES réutilisables** : nouvelle collection
   `src/data/forms/` (un fichier = un formulaire : champs, destinataire,
   textes, langue). Les sections « Formulaire » référencent un formulaire par
   son id au lieu de porter leurs champs — un même formulaire sert plusieurs
   pages (service, landing, contact), et « formulaire contextuel par
   service » = un fichier par service. Destinataire PAR FORMULAIRE (lève la
   limite `FORMS_TO_EMAIL` global — validé côté serveur contre une liste
   blanche de destinataires pour empêcher l'injection).
2. **Types de champs étendus** : `checkbox` (consentement Loi 25 — exigence,
   gap confirmé), `select` (liste bornée), `tel`, `hidden` (campagne/UTM).
   Chaque ajout traverse les 4 contrats synchronisés : zod →
   `form.astro` → `.bookshop.yml` → `_structures.form_fields`.
3. **Courriel de confirmation au visiteur** (gap cahier) : second envoi
   SMTP2GO vers le soumetteur, gabarit texte par langue.
4. **Champs conditionnels** (afficher X si Y coché) : progressive
   enhancement JS léger, validation serveur inchangée (le serveur revalide
   tout, le conditionnel n'est qu'ergonomie).
5. **Multi-étapes : position par défaut NON** (limites assumées,
   `atelier-contenus.md` §4) — à chiffrer seulement sur besoin réel confirmé.

## Chantier C — Contrôle des attributs et composants

Objectif : prouver que « liberté bornée » est un choix, pas une limite. Le
mécanisme existe déjà (cascade `_inputs` + structures CloudCannon — ex. le
select `type` des champs de formulaire) ; on le systématise :

1. **Valeurs bornées partout où c'est de la charte** : `variant` (select
   light/dark — fait), `accent` → remplacer le texte hex libre par un select
   de couleurs de la charte (tokens), icônes → liste fermée.
2. **Verrous par collection** : singletons non supprimables (fait sur
   accueil/expertises), `type` de section caché (fait), gabarits « + Ajouter »
   qui ne peuvent pas produire de fichier invalide (fait) — à répliquer sur
   `services` et `forms`.
3. **Le vrai garde-fou reste le build** : zod refuse tout contenu hors
   contrat — une erreur d'éditeur ne peut JAMAIS atteindre la prod. C'est le
   message de la démo sécurité (chantier D).
4. À documenter dans `guide-edition.md` : ce que l'éditeur PEUT changer
   (contenus, ordre des sections, valeurs bornées) vs ce qui est verrouillé
   (structure, charte, code).

## Chantier E — Menus éditables + header spécifique aux landings (retour équipe, 17 juil.)

**Constat actuel** : la navigation (menu principal, méga-menu, barre d'annonce,
bouton portail) vit dans le dictionnaire i18n codé en dur (`src/i18n/ui.ts`,
consommé par `src/components/Header.astro`) — invisible au CMS. Les landings
reçoivent le même header complet que le site, ce qui nuit à la conversion
(portes de sortie) et ne répond pas au besoin exprimé.

1. **Navigation comme DONNÉES éditables** — nouvelle collection
   `src/data/navigation/` (`fr.json` / `en.json`) couvrant : entrées du menu
   principal (libellé + lien + ordre), colonnes du méga-menu (titre, icône
   — select borné aux 5 icônes existantes —, liens), barre d'annonce (texte,
   lien, activable), bouton portail (libellé, visible ou non). Même patron
   que la migration expertises (TS → JSON + collection CloudCannon), schéma
   zod = build-gate (un lien vide casse la préversion, pas la prod). Le
   menu mobile se dérive des mêmes données (aucune double saisie).
2. **Header de landing distinct et contrôlable par page** — le frontmatter
   des campagnes gagne un objet `header` éditable dans CloudCannon :
   - `mode` (select borné) : `complet` (header du site) · `allégé` (logo +
     CTA seul — recommandé par défaut pour les campagnes : pas de portes de
     sortie) · `personnalisé` (liens propres à la campagne) ;
   - `liens` (structure bornée label + href) en mode personnalisé ;
   - `cta` (libellé + lien) — le bouton d'action du header ;
   - interrupteurs : barre d'annonce, sélecteur de langue.
   Implémentation : `Header.astro` accepte une config optionnelle (défaut =
   navigation globale) ; la route campagnes la passe depuis le frontmatter.
   Le header reste du CHROME (panneau de données dans l'éditeur visuel), pas
   une section de la palette — il encadre la page, il n'en fait pas partie.
3. **Extension naturelle aux services** (chantier A) : le méga-menu
   « Services » se construit alors depuis la collection `services` +
   l'ordre défini dans `navigation/` — cohérence automatique.

## Chantier D — Démo « processus de mise à jour » avec environnement de test et sécurité

Scénario de démonstration (à capturer en vidéo, réutilisable pour les
sceptiques) :

1. **Édition** : modifier un service dans CloudCannon (éditeur visuel).
2. **Environnement de test** : la sauvegarde committe sur la branche
   d'édition → build automatique → **URL de préversion de branche**
   (`<branche>.victrix-demo.pages.dev`, `X-Robots-Tag: noindex`) — partageable
   aux réviseurs sans toucher à la prod.
3. **Garde-fou** : démontrer qu'un contenu invalide (ex. redirection sans
   « / ») fait ÉCHOUER le build de préversion avec un message nommant
   l'erreur — la prod n'est pas atteignable par un contenu cassé.
4. **Publication contrôlée** : bouton **Publish** CloudCannon (Publishing →
   `main`) = seule porte vers la prod ; qui peut publier est un RÔLE
   CloudCannon (éditeur ≠ publieur).
5. **Traçabilité/retour arrière** : chaque changement = commit Git nominatif ;
   rollback = revert d'un commit, redéploiement en minutes.

Sécurité à mettre en scène : préversions non indexées, publication par rôle,
build-gate zod, historique Git complet, site statique (surface d'attaque
minimale), secrets hors dépôt (variables d'environnement).
Option à décider : protéger l'accès aux préversions par
authentification (Cloudflare Access sur `*.pages.dev`, ou l'équivalent selon
l'hébergeur cible retenu) — les URLs de préversion sont non indexées mais
devinables.

## Ordre d'exécution proposé et chiffrage

| # | Lot | Dépend de | Estimé |
|---|---|---|---|
| 1 | Sections palette nouvelles (témoignage, logos, chiffres, vidéo) | — | ~7 h |
| 2 | Collection `services` composable + migration expertise IA + redirections | Arch. confirmée pour les URLs (le reste se prépare avant) | ~10,5 h |
| 3 | Formulaires v2 : collection `forms` + checkbox/select + destinataire par formulaire | — | ~10,5 h |
| 4 | Courriel de confirmation visiteur + champs conditionnels | 3 | ~7 h |
| 5 | Contrôle attributs (selects charte, verrous, doc éditeur) | 1–2 | ~3,5 h |
| 6 | Navigation éditable (menu, méga-menu, annonce → `src/data/navigation/`) | — | ~7 h |
| 7 | Header de landing par page (mode/liens/CTA au frontmatter) | 6 | ~3,5 h |
| 8 | Démo processus complet (scénario + vidéo) | 2–3 + clés formulaires | ~3,5 h |

Total nouveau : **~52,5 h** (dont ~14 h déjà comptées dans l'estimé enrichi :
F2.1a Services 7 h, F2.5 restant 3,5 h, N4 3,5 h — le NET ajouté est ~38,5 h :
formulaires v2, sections de palette, navigation éditable + header de landing).
À réconcilier dans le fichier d'estimé après validation de ce plan.

## Décisions à faire confirmer (bloquantes par lot)

1. **Architecture d'information** : URLs `/services/`, méga-menu, ordre — bloque
   le lot 2 (URLs) seulement.
2. **Destinataires réels des formulaires** (par service ? par type de
   demande ?) — bloque la config des formulaires réels, pas la mécanique.
3. **Textes de consentement Loi 25** (juridique/marketing) — bloque le contenu
   de la checkbox, pas son implémentation.
4. **Protection des préversions** (Cloudflare Access ou équivalent) — décision
   sécurité pour la démo D.
