# Référence design retenue & points à signaler — refonte Victrix.ca

> **DÉCISION (2026-08-04)** : les **exports HTML** (`docs/design/Export HTML/`)
> sont la **référence maîtresse** de la refonte — ils sont postérieurs aux
> artefacts du processus de décision (planche `DesignSystemVictrix.png`, prose
> du design system). Ce qui les contredit s'aligne sur eux ; ce qui en est
> absent ou douteux est **signalé à l'équipe design** (§2) sans bloquer le
> chantier. Ce document remplace la version « 5 arbitrages bloquants » du même
> jour ; l'analyse détaillée reste dans `analyse-reception-maquettes-finales.md`
> et l'audit automatisé dans `audit-tokens-figma.md`.

| Sujet | Statut | Valeur retenue |
|---|---|---|
| Palette | ✅ résolu | Frontmatter du design system (= consommé verbatim par les 4 exports alignés) |
| Typo / spacing | ✅ résolu | Frontmatter (= 4 exports alignés) : display 56/800, headline-lg 40/700, body-lg 18/1.6, gutter 24px, section-gap 80px… |
| Rayons | ✅ résolu | Configs des exports (identiques ×5) : `DEFAULT .125 / lg .25 / xl .5` — **sauf `full`**, voir §2.b |
| CTA / navy | ✅ résolu | CTA = `primary` ; overlays sombres = `on-primary-fixed #00105B` (usage du code) |
| Graisses | ✅ résolu | 700/800 (code) — la planche « SemiBold » est un spécimen |
| `Accueil.html` | 🔔 à signaler | Ré-export souhaité (hors-norme sur ~10 axes) |
| `rounded-full` | 🔔 à signaler | Artefact probable — nous gardons les formes RONDES |
| Images mortes | 🔔 à signaler | 5 visuels à ré-exporter du `.fig` (Annexe A) |
| Périmètre | 🔔 à signaler | Maquettes manquantes + routes à créer (Annexe B) |

---

## 1. Référence retenue (application dans le repo)

Le thème candidat `src/styles/theme-refonte.css` implémente cette référence :
47 couleurs + 8 styles typo + 7 espacements du frontmatter (identiques dans les
4 exports Carrieres/Contact/PageExpertise/PageSolution), rayons des configs
d'export. Les prototypes vivent sous `/fr/design-lab/` (refonte, palettes,
page-expertise) — jamais chargés par le site réel avant la Phase 5.

Détails d'échelle des rayons (merge `theme.extend` v3 du Play CDN, repris tel
quel) : `sm .125 / DEFAULT .125 / md .375 / lg .25 / xl .5 / 2xl 1 / 3xl 1.5`.
L'échelle est **non-monotone** (`lg` < `md`) — assumé, c'est ce que rendent les
maquettes.

## 2. Points à signaler à l'équipe design

### a. `Accueil.html` — ré-export souhaité 🔔

L'export Accueil diverge des 4 autres pages sur ~10 axes (audit automatisé) :
polices **Manrope + Inter** déclarées mais jamais chargées (rendu réel = police
de secours du navigateur), `headline-lg` 32px vs 40px, `body-lg` 16px/1.5 vs
18px/1.6, graisses 600 vs 700, échelle d'espacement parallèle (`section-gap`
128px vs 80px), CTA sur `secondary` (ardoise) là où les 4 autres pages posent
`primary`. Génération antérieure probable. **En attendant un ré-export, nous
traitons le système des 4 pages comme normatif et adapterons la maquette
Accueil à ce système.**

### b. `rounded-full: 0.75rem` — artefact probable, non repris 🔔

Les 5 configs posent `full: 0.75rem` (au lieu de « rond »). Appliqué à la
lettre, cela transforme en carrés arrondis **10 éléments réellement
circulaires** des maquettes : pastilles sociales des footers (PageExpertise,
PageSolution), pastilles d'icônes de la barre de confiance et bouton-flèche
rond (Accueil), **médaillon et photos d'équipe circulaires à bordure ronde
(Carrières)**. L'échelle non-monotone du même bloc renforce l'hypothèse d'un
artefact du générateur Figma→Tailwind. **Décision : nous gardons `rounded-full`
rond** ; merci de confirmer ou de corriger l'export.

### c. Navy des surfaces sombres — token à officialiser 🔔

Le code des maquettes pose ses overlays et bandes sombres en
`on-primary-fixed #00105B` ; la prose parle de `#000D2E`, la planche de
`#0D1430` — aucun de ces deux hex n'a de token. **Nous employons `#00105B`
comme le code** ; si un autre hex est voulu, il faudra le nommer dans la
palette.

### d. Artefacts mineurs de génération (corrigés au portage, pour info)

- `PageExpertise.html` : l'item de nav marqué ACTIF est « Secteurs » (page…
  Expertise) ; `md:row` (footer) au lieu de `md:flex-row` ; `viewbox` en
  minuscules dans le SVG décoratif du CTA.
- Sélecteur de langue : « FR | EN » en texte statique sur Accueil uniquement,
  absent des 4 autres pages.

---

## Annexe A — 5 images de maquette déjà mortes (à ré-exporter du `.fig`)

Les visuels des exports sont hébergés sur des URLs Google **éphémères** ; nous
avons rapatrié 20/25 images en local (`docs/design/Export HTML/assets/`), mais
5 renvoient déjà une erreur définitive (400/403) :

| Page | Image perdue |
|---|---|
| Accueil | Logo Victrix (en-tête) |
| Accueil | Badge/illustration « Loi 25 » |
| Accueil | Visuel de la section « Services Gérés » |
| PageExpertise | Image de fond du héros |
| PageExpertise | Capture d'écran « O Studio » (carte outil) |

Dans les prototypes, les deux images de PageExpertise sont remplacées par des
stand-ins locaux clairement marqués.

## Annexe B — trous de périmètre constatés (à planifier)

1. **Aucune maquette** : article de blog, listing Ressources, pages campagnes,
   résultats de recherche, page merci, 404, portail client — le site en
   production a 60 articles et 48 pages de services qui en dépendent.
2. **Aucune maquette EN** (site bilingue à parité complète) ; le sélecteur de
   langue n'est pas conçu.
3. La nav des maquettes contient « Secteurs » et « À propos » — pages sans
   maquette ni équivalent actuel ; à confirmer au plan de navigation.
4. **Carrières sans liste de postes** : ATS externe, page dédiée, ou hors
   périmètre ?
5. **Responsive** : aucun artboard mobile ; les exports contiennent très peu de
   variantes ≤ `md`. Nous extrapolerons depuis la charte (marges 16px mobile,
   pile 1 colonne) — signaler toute intention contraire.
