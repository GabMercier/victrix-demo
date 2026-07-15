# Atelier contenus — ce que le marketing définit, ce qu'on construit, nos limites

> Document de travail pour la séance avec le marketing / gestion de contenu.
> Objectif : transformer les « CPT » du cahier des charges en collections et
> gabarits concrets, définis PAR les équipes qui les rempliront. Le design
> viendra après leurs réponses. À remplir en séance, colonne par colonne.

## 1. Couverture actuelle des types de contenus du cahier des charges

| Type (cahier des charges) | État | Ce qui manque | À définir par le marketing |
|---|---|---|---|
| **Services** (6 : Cybersécurité, Services gérés TI, Infonuagique, Productivité & ServiceNow, IA, Conseil stratégique) | 🔧 À construire (patron « expertises » prêt à répliquer) | Schéma + gabarit + méga-menu | Valider la structure narrative (héros → problème → solution → bénéfices → preuves → CTA), la FAQ par service, le formulaire contextuel par service, les ressources liées |
| **Expertises** (vide au lancement selon le cahier) | ✅ Structure en place (1 page migrée, éditable) | Taxonomies (secteurs, technologies) | Liste des expertises à terme, qui les rédige, cadence |
| **Ressources — articles de blogue** | ✅ Complet (FR/EN, brouillons, slugs, JSON-LD, éditeur) | — | Catégories/étiquettes réelles, auteurs affichés ou non |
| **Ressources — livres blancs (gated)** | 🔧 Pipeline formulaires prêt; type de contenu à créer | Collection + gabarit + flux « télécharger contre courriel » | Lesquels sont réservés, quelle information collecter (Loi 25 : minimum nécessaire), où vont les prospects |
| **Ressources — webinaires** | 🔧 À créer | Collection + gabarit (embed vidéo + inscription) | Plateforme source (Teams ? YouTube ?), replay public ou gated, calendrier |
| **Ressources — balado** | 🔧 À créer | Collection + gabarit (lecteur audio embarqué) | Plateforme d'hébergement audio (le site INTÈGRE, il n'héberge pas — voir limites), flux RSS existant ? |
| **Ressources — études de cas** | 🔧 À créer | Collection + gabarit | Structure type (client, défi, solution, résultats chiffrés), validation client requise ? |
| **Témoignages / vidéos** | 🔧 À créer (aussi utile comme SECTION de landing/service) | Section Bookshop + collection | Format (citation, vidéo, logo + citation), qui collecte |
| **Équipe** | 🔧 À créer | Collection + gabarit | Profils individuels ou présentation d'ensemble ? (question ouverte de la proposition) Photos réelles exigées par le cahier des charges |
| **Partenaires** | ✅ Éditable sur l'accueil (liste de noms) | Collection dédiée si logos + pages | Fréquence de changement, logos officiels + autorisations |
| **Carrières / offres** | 🔧 À créer | Collection OU intégration RH | Les offres viennent-elles d'un système RH externe ? (si oui : intégration, pas collection) |
| **Landing pages de campagne** | ✅ Complet (palette 5 sections, noindex, éditeur visuel live) | Extensions de palette (voir §3) | Sections manquantes pour leurs campagnes types |
| **Pages légales** (confidentialité, CGU, témoins, plan de site) | 🔧 À créer (simple) | Gabarit page libre + contenu | Textes juridiques (intrant Victrix) |
| **Navigation / méga-menu** | ✅ Mécanique en place | Entrées finales | Priorisation des entrées (≤ 3 clics partout, exigence du cahier) |
| **Formulaires** (contact, devis, gating, contextuels) | ✅ Pipeline complet (validation, anti-pourriel, notifications, merci) — en attente des clés | Activation + formulaires réels; ⚠️ à ajouter : courriel de confirmation au visiteur + case de consentement (checkbox) — voir `revue-cahier-des-charges.md` §5 | Combien de formulaires, champs de chacun, destinataires des notifications, textes de consentement |
| **Recherche interne** ⚑ exigence | 🔧 À créer (Pagefind prévu à la proposition; filtres par type inclus) | Intégration + gabarit résultats + entrée header | Quels contenus indexer en priorité |
| **O Studio** ⚑ exigence CRITIQUE (diapo 5 du cahier) | 🔧 Landing composable `/services/o-studio/` (palette existante) + formulaire dédié | Page + matrice 301 depuis l'ANCIEN domaine O Studio (tâche DNS hors dépôt, inventaire d'URLs à faire) | Contenu de la page, ton (« design homogène, pas de distinction »), destinataire du formulaire |
| **Carte des bureaux** ⚑ exigence (Québec · Montréal · Paris) | 🔧 À créer — proposer façade cliquable/carte statique (embed Google direct = témoins tiers, friction Loi 25) | Composant + adresses | Confirmation des 3 adresses officielles |
| **Fil d'Ariane (breadcrumbs)** ⚑ exigence WCAG | 🔧 À créer sur toutes pages internes (+ BreadcrumbList JSON-LD, patron existant) | Composant + intégration gabarits | — |
| **Page style guide interne** ⚑ exigence | 🔧 À créer (page noindex : tokens + palette de sections) | Petit gabarit | — |
| **Footer 3 bureaux + partenaires + mentions légales** ⚑ exigence | 🔧 Footer actuel = 1 adresse | Mise à jour composant | Textes des 3 bureaux, liens légaux |

**Lecture honnête : la mécanique est là (éditeur visuel, collections typées,
bilinguisme, SEO, formulaires); le travail restant est du MODÉLISME — un schéma
+ un gabarit par type — et il est répétitif, pas risqué.** Le patron est prouvé
trois fois (blogue, expertises, campagnes).

## 2. Fiche à remplir PAR TYPE de contenu (en séance)

Pour chaque type retenu, faire remplir :

1. **Nom** (FR/EN) et exemple RÉEL de contenu (un vrai, pas un lorem).
2. **Champs** : quelles informations chaque entrée porte-t-elle ? (titre,
   résumé, image, fichier joint, date, auteur, client, tags…)
3. **Qui édite / qui approuve** — et à quelle fréquence.
4. **Bilinguisme** : toujours FR+EN, ou FR d'abord ?
5. **Visibilité** : indexé ? listé ? gated ? partagé sur les réseaux ?
6. **Où ça apparaît** : page dédiée, liste, section d'accueil, méga-menu ?
7. **Volume attendu** sur 12 mois (dimensionne la pagination/recherche).

## 3. Nos suggestions à apporter à la table

> ⚑ = en réalité une EXIGENCE du cahier des charges (diapos 14–15 et 12), pas
> une simple suggestion — traçabilité complète dans `revue-cahier-des-charges.md`.

- **Sections de landing supplémentaires** : ⚑ Témoignage, ⚑ Bandeau logos
  partenaires (Microsoft · AWS · Cisco · ServiceNow + descriptifs + badge MCN),
  ⚑ « Victrix en chiffres » (preuves sociales exigées), Vidéo embarquée,
  Étape/processus. Chaque ajout = 1 composant réutilisable partout (landings,
  services, accueil).
- **Multimédia** : composant vidéo (YouTube/Vimeo/Stream — embed léger, façade
  cliquable pour la performance), lecteur balado (embed du fournisseur),
  galerie d'images optimisées automatiquement.
- **Partage** : Open Graph par page (déjà en place globalement — à enrichir
  d'une image OG par contenu), ⚑ boutons de partage sans témoins (simples liens,
  conformes Loi 25), ⚑ flux RSS des ressources (natif Astro).
- **Capture de prospects** : le pipeline formulaires sert aussi à l'infolettre
  (capture courriel + consentement → notification/CRM plus tard — le widget
  Power Automate/Dataverse est déjà dans la feuille de route de la proposition).
- ⚑ **Contenus liés** : « ressources liées » automatiques par étiquettes sur
  services et articles (maillage interne + « contenus connexes » — exigences du
  cahier des charges).
- **Fil d'Ariane + données structurées** par type (déjà le patron JSON-LD :
  Service, Article, FAQPage… sans licence).

## 4. NOS LIMITES — à connaître avant de promettre (usage interne)

Le principe : **tout ce qui est contenu publié à l'avance est notre terrain de
jeu; tout ce qui exige un serveur par visiteur demande la couche « fonctions »
(qu'on a) ou un service tiers (à choisir).** En clair :

| Demande potentielle | Verdict | Ce qu'on répond |
|---|---|---|
| Héberger des VIDÉOS sur le site | ❌ Pas dans le dépôt (poids). | On EMBARQUE (YouTube/Vimeo/Stream) — meilleur pour la performance et les sous-titres. |
| Fichiers lourds (PDF, balados) | ⚠️ Raisonnable seulement (le contenu vit dans Git). | PDF de quelques Mo : oui. Audio/vidéo : hébergement dédié + intégration. |
| Contenu personnalisé par visiteur (recommandations, géolocalisation) | ⚠️ Pas en statique pur. | Possible via la couche fonctions/edge — à chiffrer si le besoin est réel. |
| Espace membre / contenu derrière connexion | ⚠️ Workstream séparé. | Le portail client prototypé est exactement ça (Entra ID) — pas un plugin, un projet. |
| Gating « dur » des livres blancs | ⚠️ Le gating standard est déclaratif (courriel → lien). | Le lien reste techniquement public; un gating cryptographique (URL signées) est faisable via fonctions si exigé. |
| Commentaires / avis d'utilisateurs | ❌ Pas natif. | Service tiers embarquable si le besoin émerge; rarement utile en B2B. |
| Mise en ligne en SECONDES | ⚠️ La publication prend 1 à 3 minutes (build). | C'est le prix de la vitesse/sécurité du statique. Pour du « live », on en reparle (fonctions). |
| Milliers de pages | ✅ OK (le build s'allonge, reste en minutes). | Astro tient très bien à l'échelle d'un site corporatif, même x10. |
| Éditeurs simultanés | ✅ CloudCannon gère par fichier. | Deux personnes sur LE MÊME contenu au même moment = à éviter (dernier sauvé gagne). |
| Infolettres / envois de masse | ❌ Pas le rôle du site. | Le site CAPTE (formulaires); l'envoi = Mailchimp/Brevo/Dynamics. |
| Paiement / e-commerce | ❌ Hors périmètre. | Service dédié si un jour requis. |
| A/B testing | ⚠️ Basique possible (variantes de landing + campagnes distinctes). | Suffisant pour des campagnes; au-delà → outillage dédié. |
| Liberté de mise en page totale (« comme Elementor ») | ⚠️ VOLONTAIREMENT bornée à la palette de sections. | C'est le garde-fou qui protège la charte — on AJOUTE des sections sur demande, vite. |
| Éditer depuis un téléphone | ⚠️ CloudCannon est utilisable mais pensé bureau. | Correctifs rapides : oui; production de contenu : bureau. |
| Formulaires multi-étapes (« à évaluer » au cahier) | ⚠️ Non conçu dans le pipeline actuel. | Position par défaut : un formulaire court convertit mieux; on le conçoit si un besoin réel le justifie (chiffrage à ce moment). |

Contraintes DEV (invisibles au marketing, mais à respecter chez nous) :
- Les composants de section doivent rester **rendables dans le navigateur**
  (édition live) : pas de code serveur dans une section; binding via la
  variable `frontmatter` (bug du 15 juillet, documenté dans le code).
- Chaque nouveau type = schéma zod + config CloudCannon + gabarit — 0,5 à
  1,5 jour par type selon le gabarit, palette de sections réutilisée.

## 5. Après l'atelier

1. Remplir ce document en séance (colonnes « à définir »).
2. Prioriser : quels types pour la v1 ? (recommandation : Services + livres
   blancs + études de cas d'abord — ce sont les pages de VENTE).
3. On chiffre par lot et on construit type par type (patron répétitif).
4. LEURS réponses deviennent l'intrant des choix de design (gabarits).
