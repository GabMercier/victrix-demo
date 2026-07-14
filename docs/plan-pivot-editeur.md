# Plan — pivot vers un éditeur visuel (CloudCannon d'abord, Tina en relève)

> Décision issue de l'analyse des critères marketing (`docs/analyse-criteres.md`,
> critère 1). Constat : sans édition visuelle, la nouvelle pile sera perçue comme
> un recul par l'équipe marketing — risque réel d'échec du projet. Sveltia est
> donc retiré du rôle d'éditeur cible; il reste en place jusqu'à la fin du spike.

## Décision recommandée

**CloudCannon en candidat principal, validé par un spike balisé de ~2 jours —
pas d'annonce à l'équipe avant que le spike passe.** Tina est la solution de
relève, montée uniquement si CloudCannon échoue sur nos critères.

Pourquoi CloudCannon en premier :

1. **Maturité** : produit commercial établi (Jamstack depuis ~2014); l'édition
   visuelle est son cœur de métier, pas une fonctionnalité récente. Le support
   Astro de Tina est encore qualifié d'expérimental par des tiers.
2. **Composition de pages** : Bookshop (open source, MIT) fournit exactement le
   scénario « Elementor avec garde-fous » — le marketing compose une page à
   partir d'une palette de composants, réordonne visuellement, édite en
   cliquant. C'est la réponse directe aux critères 1 et 4.
3. **Le mode d'échec du projet est politique** : une démo d'éditeur qui
   accroche devant les sceptiques coûte plus cher que 500 $/an d'écart de
   licence. On choisit le cheval le plus sûr, pas le moins cher.
4. **Réversibilité intacte** : le contenu reste dans le dépôt Git de Victrix
   (CloudCannon synchronise le dépôt). Si CloudCannon déçoit ou augmente ses
   prix, on rebranche Tina/Sveltia sur les mêmes fichiers.

Coûts à valider au spike : CloudCannon ~45 $US/mois et + (palier exact requis
pour l'édition visuelle à confirmer à l'inscription, essai gratuit disponible);
Tina 0 → 49 $US/mois. Les deux restent sous la facture de licences WordPress du
cahier des charges (~750–1 200 $/an).

## Nouveau dépôt : non — et voici pourquoi

Repartir d'un build Astro neuf rejouerait des problèmes déjà payés et
documentés dans le code actuel :

- la bascule adaptateur Cloudflare **build-only** (Node 18 en dev, sinon crash) ;
- le piège des CSP **combinées** de Cloudflare Pages (`/admin` vs pages) ;
- le `generateId` des collections (le champ `slug` qui écrasait l'appariement
  FR/EN) ;
- la re-liaison des scripts avec les View Transitions (`astro:page-load`) ;
- i18n complet : slugs par langue, hreflang, sitemap bilingue, 301.

Surtout : **le spike doit être fait sur ce dépôt pour avoir une valeur de
test.** Un dépôt neuf « passerait » trivialement le spike et ne nous apprendrait
rien sur les vrais points de friction (routes `[lang]`, collections avec images,
transitions). Et une démo sur *notre* contenu réel est politiquement plus forte
qu'un lorem ipsum.

**Le bon moment pour un dépôt propre** : au lancement du projet de production,
en le **semant depuis la branche gagnante** (élaguer le contenu démo, garder la
plomberie résolue, historique neuf si souhaité, hébergement Git de production —
GitHub org Victrix ou Azure DevOps). Créer le dépôt de prod est une étape du
projet, pas un préalable au spike.

## Critères de réussite du spike (à figer AVANT de commencer)

Le spike est réussi si, sur nos pages réelles :

1. **Édition visuelle** fonctionne sur l'accueil (collection JSON), un article
   (Markdown, slug par langue) et la page expertise.
2. **FR/EN** : édition propre par langue sans casser l'appariement des
   traductions (fichiers miroirs).
3. **Composition de page** : ajouter/réordonner des sections d'une landing
   depuis une palette (4 sections Bookshop : hero, bénéfices, CTA, formulaire
   factice) sans toucher au code.
4. **Images** : téléversement + pipeline `astro:assets` intacts en production;
   comportement en aperçu live documenté (limitation connue de Bookshop sur
   certains composants — prévoir un rendu de repli si nécessaire).
5. **Publication** : sauvegarde → commit dans le dépôt → build Cloudflare Pages
   → en ligne en minutes (pipeline actuel inchangé; CloudCannon ne devient PAS
   l'hébergeur).
6. **Brouillon/partage** : édition sur branche + URL de prévisualisation
   partageable (critère 2 du marketing).
7. **Pas de régression** : transitions de vue, en-têtes, portail mock intacts.
8. **Test du regard marketing** : courte capture vidéo de l'édition — est-ce
   que ça soutient la comparaison avec Elementor devant un sceptique ?

Échec = un critère 1, 3 ou 5 non atteignable sans contournement lourd.

## Phases

### Phase 0 — Préparation (0,5 j)
- Branche `spike/cloudcannon` sur CE dépôt (pas de nouveau dépôt).
- Compte d'essai CloudCannon, connexion au dépôt GitHub, config build
  (version Node, commande de build).
- **Point d'intégration connu à traiter d'emblée** : le build CloudCannon doit
  produire du statique pur — ajouter une bascule d'environnement (p. ex.
  `STATIC_ONLY=1`) qui saute l'adaptateur Cloudflare et exclut les routes
  portail à la demande, sinon la sortie worker fera échouer leur build.

### Phase 1 — Spike CloudCannon (1,5–2 j) → GATE
- `cloudcannon.config.yml` : collections blog + home (miroir de
  `content.config.ts`).
- Init Bookshop; convertir 4 composants existants (Hero, Expertises, Solutions,
  Partenaires) en composants Bookshop (`.bookshop.yml`).
- Collection `landing` + gabarit rendant des sections Bookshop; monter une
  landing de démonstration.
- Dérouler les 8 critères; noter les écarts; capture vidéo.
- **Gate** : ✅ passe → adopter, aller en phase 2. ⚠️ partiel → phase 1b.
  ❌ échec → phase 1b.

### Phase 1b — Relève Tina (1–1,5 j, seulement si nécessaire)
- Branche `spike/tina`; `@tinacms/astro` (édition visuelle sans React),
  mêmes 8 critères, mêmes composants.
- Comparer et trancher sur pièces. Si les deux échouent : retour à Sveltia +
  bibliothèque de sections landing (l'architecture du contenu reste bonne) et
  réévaluation (CloudCannon/Tina évoluent vite).

### Phase 2 — Portage complet et retrait de Sveltia (2–3 j, sur le gagnant)
- Parité de schéma complète (toutes les collections), y compris les nouvelles
  (services, expertises) au fil de leur création.
- Retrait de Sveltia : supprimer `public/admin/`, simplifier le bloc CSP
  `/admin` de `public/_headers`, retirer le worker OAuth de la config de prod.
- Flux éditorial : publication par branche + URL de prévisualisation,
  documenté en français pour le marketing (remplace le guide Sveltia).
- Mettre à jour `docs/analyse-criteres.md` : critère 1 ⚠️ → ✅ avec preuves.

### Phase 3 — Préparation démo équipe (1 j)
- Scénario calqué sur `docs/reunion-marketing-2026-07-09.md` : modifier le hero
  visuellement, composer une landing en direct devant la salle, publier,
  partager une URL de prévisualisation.
- C'est CETTE démo qui répond aux sceptiques — pas un argumentaire.

## Effort et impact sur l'estimation

Total : **4–5 jours** (chemin heureux CloudCannon) à **6–7 jours** (si la
relève Tina doit être montée). La ligne « option éditeur visuel : +3–5 j » de
l'estimation révisée (`docs/analyse-criteres.md`) passe à **+4–7 j**; le total
projet révisé devient **30–41 jours**. La ligne de licences de l'argumentaire
TCO passe à « 0–~1 100 $ CAD/an selon l'éditeur retenu » — toujours sous la
facture d'extensions WordPress.

## Risques connus et parades

| Risque | Parade |
|---|---|
| Build CloudCannon incompatible avec l'adaptateur Cloudflare (routes portail) | Bascule `STATIC_ONLY` dès la phase 0; le portail reste servi par notre pipeline |
| Rendu live Bookshop limité sur composants utilisant `astro:assets` | Rendu de repli documenté; jugé au critère 4 du spike |
| UX d'édition FR/EN moins guidée que le côte-à-côte Sveltia | Évalué au critère 2; structurer les collections par langue si besoin |
| Palier tarifaire réel de l'édition visuelle | Vérifié à l'inscription, avant la gate |
| Verrouillage perçu envers CloudCannon | Contenu dans notre dépôt + Bookshop open source; démonstration de réversibilité dans la doc |
| Node : dépôt épinglé Node 18 en dev / engines ≥20 | Fixer la version Node du build CloudCannon = celle du build CF Pages |
