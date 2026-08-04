# Arbitrages design à trancher — refonte Victrix.ca

> **Document à transmettre à l'équipe design** (2026-08-04). La livraison finale
> (`Maquette + Design System2.fig` + 5 exports HTML + design system) contient des
> contradictions internes qui **bloquent l'écriture du thème définitif** du site.
> 5 décisions sont nécessaires ; pour chacune : le constat (vérifié par audit
> automatisé — `docs/design/audit-tokens-figma.md`), les options, et notre
> recommandation. Sans réponse, nous avancerons sur les recommandations ✅ en
> les marquant « provisoires ».

| # | Sujet | Recommandation courte |
|---|---|---|
| 1 | Palette de référence (3 versions divergentes) | Le frontmatter du design system (= ce que consomme le code) fait foi |
| 2 | `Accueil.html` hors-norme | Ré-export aligné sur les 4 autres pages |
| 3 | Échelle de rayons (code ≠ charte) | La charte (4px boutons / 8px cartes / `full` rond) |
| 4 | Rôle de `secondary` + navy des overlays | CTA = `primary` ; définir un token pour le navy `#000D2E` |
| 5 | Graisses des titres (planche ≠ code) | Le code (700/800) fait foi |

---

## 1. Quelle palette fait foi ? — BLOQUANT

Trois jeux de couleurs incompatibles coexistent dans la livraison :

| Source | Primaire | Foncé | Surfaces |
|---|---|---|---|
| Planche `DesignSystemVictrix.png` (« Chaud et humain ») | Bleu Victrix `#1A5BFF` | Bleu nuit `#0D1430` | Ivoire `#FAF7F3` / Beige `#F2ECE4` / Sable `#E9E1D6` |
| Frontmatter `VictrixModernWeb-DesignSystenm.md` (**= ce que le code des maquettes utilise réellement**) | `primary #002FC7` + `primary-container #1D46F3` | `on-primary-fixed #00105B` | `surface #FCF9F5` → `#E5E2DE` (échelle chaude) |
| Prose du même document (§Colors) | `#1D46F3` | `#000D2E` | `#F4F7F9` (gris FROID — contredit tout le reste) |

**Aucun hex de la planche n'apparaît dans le code livré.** Les 4 pages
Carrieres/Contact/PageExpertise/PageSolution consomment fidèlement le
frontmatter ; la direction « chaude » (ivoire) y est bien réelle.

**Question** : le frontmatter est-il la palette approuvée, et la planche une
illustration directionnelle (hex arrondis) ? Ou faut-il corriger le code vers
les hex de la planche (`#1A5BFF`…) ?

**✅ Recommandation** : adopter le **frontmatter** comme référence machine
(cohérent, complet — 47 tokens — et déjà appliqué dans 4 pages sur 5), et
reléguer planche + prose au rang d'illustrations. Merci de confirmer, idéalement
en vérifiant les styles de couleur dans le `.fig`.

## 2. `Accueil.html` est-il valide ? — BLOQUANT

L'export Accueil **diverge des 4 autres pages sur ~10 axes** (l'audit automatisé
liste tout) : polices **Manrope + Inter** déclarées (jamais chargées par la page
→ rendu réel en police de secours du navigateur !), `headline-lg` 32px vs 40px,
`body-lg` 16px vs 18px, graisses 600 vs 700, espacement parallèle
(`section-gap` 128px vs 80px, `gutter` 24px via une autre unité), CTA sur
`secondary` (ardoise) là où les 4 autres pages utilisent `primary` (bleu).

**Question** : Accueil provient-il d'une génération antérieure ? Peut-on avoir
un ré-export aligné sur le système des 4 autres pages ?

**✅ Recommandation** : ré-exporter Accueil ; d'ici là nous traitons le système
des 4 pages alignées comme normatif et adaptons la maquette Accueil à ce
système (aucune raison métier apparente d'avoir 2 familles de police non
chargées et une échelle d'espacement parallèle sur une seule page).

## 3. Échelle de rayons — BLOQUANT

Les **5 exports** partagent la même échelle dans leur code, **décalée d'un cran**
par rapport à la charte du design system :

| Usage | Charte (`rounded`) | Code des 5 exports |
|---|---|---|
| Boutons / petits composants | `DEFAULT` 0.25rem (4px) | 0.125rem (2px) |
| Cartes / grands conteneurs | `lg` 0.5rem (8px) | 0.25rem (4px) |
| — | `xl` 0.75rem | 0.5rem |
| Pastilles / avatars / chips | `full` 9999px (rond) | **0.75rem** ⚠️ |

Le `full: 0.75rem` du code **casserait toutes les formes rondes** (avatars,
pastilles, chips « pilule » pourtant décrits dans la charte) — bug d'export
quasi certain. La prose de la charte (« 4px boutons, 8px cartes ») confirme la
colonne charte.

**✅ Recommandation** : la **charte** fait foi (0.25/0.5/0.75/`full` rond) ; le
code des exports est un artefact du générateur.

## 4. Rôle de `secondary` et couleur des overlays — BLOQUANT

Deux incohérences liées :
- Le token `secondary` vaut **`#515D82` (ardoise désaturée)** dans la palette,
  mais la prose décrit « Secondary » comme **`#000D2E` (navy ultra-profond)**
  pour les fonds de cartes service, footers et sections contrastées — et ce
  navy **n'a aucun token** dans la palette machine.
- Accueil pose ses CTA en `bg-secondary` ; les 4 autres pages en `bg-primary`.

**Questions** : (a) les CTA sont-ils bleu `primary` (recommandé, 4 pages sur 5) ?
(b) quel hex officiel pour l'overlay navy des cartes service et les sections
sombres — `#000D2E` (prose), `#00105B` (`on-primary-fixed` de la palette) ou
`#0D1430` (planche) ? Il nous faut UN token nommé. À noter : dans le code des
maquettes, les overlays des tuiles expertise et la bande technologies utilisent
déjà `on-primary-fixed` (`#00105B`).

**✅ Recommandation** : CTA = `primary` ; officialiser `#00105B`
(`on-primary-fixed`, déjà utilisé par le code) comme surface sombre — ou nous
donner l'hex retenu, que nous nommerons (ex. `surface-navy`).

## 5. Graisses des titres — planche vs code

La planche typographie indique **SemiBold** (600) pour les Headlines et Button
16px/Medium ; le design system machine et les 4 pages alignées disent
**700/800** et Button 14px/600. Le tracking des labels diverge aussi
(0.12em planche vs 0.1em code).

**✅ Recommandation** : le **code** (700/800, button 14/600, labels 0.1em) fait
foi — c'est ce que les maquettes HTML rendent réellement ; la planche est un
spécimen. Merci de confirmer.

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

## Annexe B — trous de périmètre constatés (non bloquants pour le thème, à planifier)

1. **Aucune maquette** : article de blog, listing Ressources, pages campagnes,
   résultats de recherche, page merci, 404, portail client — le site en
   production a 60 articles et 48 pages de services qui en dépendent.
2. **Aucune maquette EN** (site bilingue à parité complète) ; le sélecteur de
   langue n'est pas conçu (« FR | EN » en texte statique sur Accueil seulement).
3. La nav des maquettes contient « Secteurs » et « À propos » — pages sans
   maquette ni équivalent actuel ; à confirmer au plan de navigation.
4. **Carrières sans liste de postes** : la maquette n'a pas de section offres
   d'emploi — ATS externe, page dédiée, ou hors périmètre ?
5. **Responsive** : aucun artboard mobile ; les exports contiennent très peu de
   variantes ≤ `md`. Nous extrapolerons depuis la charte (marges 16px mobile,
   pile 1 colonne) — signaler toute intention contraire.
