# Revue de couverture — cahier des charges (23 diapositives) vs état réel

> Préparée pour la rencontre équipe. Source : cahier des charges Walter
> (alanallman.madebywalter.com, deck de 23 diapos), ré-extrait intégralement le
> 15 juillet. Posture : **on nomme nos écarts nous-mêmes** — la crédibilité de
> la démarche interne en dépend. Légende : ✅ couvert · 🔶 mécanisme prêt,
> instances à produire · 🔧 à construire (chiffré) · 👥 intrant contenu/marketing ·
> 🏢 tâche infra/ops · 🎨 phase design · ⏳ post-lancement.

## 1. Vue d'ensemble — les 23 diapos

| # | Diapo | État | Notes |
|---|---|---|---|
| 1–3 | Titre, contexte, à propos | — | Contexte partagé. |
| 4 | Diagnostic (7 axes audités) | ✅ | Notre fondation répond axe par axe — chiffres dans `analyse-criteres.md`. |
| 5 | **Intégration O Studio (CRITIQUE)** | 🔧 + 🏢 | Landing composable `/services/o-studio/` + formulaire dédié = ~1 j (palette existante). Matrice 301 **depuis l'ancien domaine** = config DNS/hébergement du domaine O Studio (hors dépôt, à inventorier). ÉTAIT ABSENT de nos docs — ajouté. |
| 6 | Vision stratégique | ✅ | Alignée (GUIDE-PROJET). |
| 7 | Identité visuelle & design | 🎨 👥 | « Fonctionnel d'abord » décidé; maquettes après validation de la pile; photos authentiques = intrant Victrix. |
| 8 | Pile technique (WordPress) | ✅ | Remplacée par équivalents supérieurs — table §4. |
| 9 | Pages & gabarits (~48 p., 14 gabarits) | 🔶 | Patron prouvé ×3 (blogue, expertises, campagnes); reste du modélisme répétitif (atelier-contenus §1). |
| 10 | CPT Services/Expertises/Ressources | 🔶 👥 | Collections typées; définitions en atelier marketing. |
| 11 | Périmètre in/out | ✅ | Même périmètre; rédaction contenu = Victrix (identique). |
| 12 | Exigences fonctionnelles | 🔶 | Détail par item dans atelier-contenus §1. |
| 13 | UX stratégique & arborescence | 👥 | Atelier arborescence à tenir (≤ 3 clics, ≤ 2 niveaux — mécanique méga-menu prête). |
| **14** | **Formulaires dynamiques & recherche** | 🔶 **+ 5 écarts nommés** | Spotlight §2 ci-dessous. |
| **15** | **Design & UI/UX** | 🔶 🎨 **+ 3 écarts nommés** | Spotlight §3 ci-dessous. |
| 16 | Accessibilité WCAG 2.1 AA | ✅ | Livrée comme base auditée (contrastes, clavier, ARIA, skip link, HTML5 sémantique); tests WAVE/axe/NVDA au gate de sortie. Sous-titres vidéos = 👥 règle éditoriale. |
| 17 | Performance & Core Web Vitals | ✅ | Leurs cibles (Lighthouse ≥80/90, LCP <2,5 s) sont SOUS notre plancher mesuré (95–100, <2 s) — par construction, sans WP Rocket/Smush. |
| 18 | SEO, GEO & Loi 25 | 🔶 | hreflang/canonical/sitemap/JSON-LD ✅; metas par page = 👥 (mots-clés prioritaires de la diapo 18 = intrant des pages Services); bandeau Loi 25 = écart n° 3 §5; matrice 301 = mécanisme ✅ + inventaire d'URLs à faire (🏢). |
| 19 | Sécurité (P1) | ✅ | Leur liste P1 corrige WordPress; chez nous ces catégories n'existent pas (statique). En-têtes durcis déjà en prod; grade ≥ B dépassé. Turnstile ≥ reCAPTCHA (écart clés à poser). |
| 20 | Phasage (0–4, 11–17 sem.) | ✅ | Notre séquence couvre les mêmes jalons — voir GUIDE-PROJET « Prochains jalons » + estimation 26–34 j. |
| 21 | Livrables | 🔶 | Guides déjà écrits (GUIDE-PROJET, guide-edition, operations, formulaires); formation + accès = à planifier; « maquettes Figma » remplacées par la décision fonctionnel-d'abord (re-peau tokens). |
| 22 | Gouvernance & RACI | 🏢 | RACI du cahier = modèle d'agence; à transposer au modèle interne (Ø Studio réalise; marketing édite; Julie valide SEO/301; direction approuve). Point à acter en rencontre. |
| 23 | Critères d'acceptation (DoD) | ✅ | Chaque seuil P1 est atteint ou dépassé par construction — sauf les items listés §5 (recherche, analytique, O Studio), qui sont exactement notre liste d'écarts. |

## 2. Spotlight diapo 14 — Formulaires dynamiques & moteur de recherche

| Exigence | État |
|---|---|
| Formulaires **contextuels par page** (Cyber→« Évaluation posture sécurité », IA, Infonuagique, O Studio, Contact, Livres blancs) | 🔶 La section formulaire composable rend exactement ça — notre landing démo EST leur exemple cybersécurité. Les instances par service suivent la création des pages Services (atelier). Activation réelle = clés SMTP2GO/Turnstile (docs/formulaires.md). |
| Labels permanents, erreurs ARIA, focus ≥ 3 px, champs requis marqués | ✅ Construit accessible dès le départ. |
| Validation temps réel | 🔶 Validation native HTML5 + serveur; validation JS « pendant la frappe » possible si jugée nécessaire (petite amélioration). |
| Confirmation visuelle + **courriel auto au visiteur** | ⚠️ ÉCART : page « Merci » ✅, notification interne ✅, mais PAS de courriel de confirmation au visiteur — à ajouter au pipeline (~0,25 j). |
| **Case de consentement Loi 25 explicite** | ⚠️ ÉCART CONFIRMÉ : le consentement est un texte affiché, pas une case à cocher; le type « checkbox » manque au contrat de champ (~0,25 j : schéma + rendu + exigence serveur). |
| reCAPTCHA | ✅ Mieux : Turnstile (gratuit, sans case, sans témoins-tiers → plus propre pour la Loi 25). |
| Formulaires **multi-étapes** (« à évaluer ») | ⚠️ Non conçu. Position par défaut : un formulaire court convertit mieux; à évaluer sur un besoin réel (limites, atelier-contenus §4). |
| **Moteur de recherche interne** (header, 3 CPT, résultats paginés, filtres par type) | 🔧 ÉCART : pas encore construit. Pagefind (prévu à la proposition) couvre tout : index statique au build, filtres/facettes par type, zéro serveur (~1 j avec gabarit de résultats). |
| Suivi GA4 (soumissions, Site Search, objectifs), heatmaps, A/B GTM | 🔧 ÉCART BLOC ANALYTIQUE : rien n'est câblé — VOLONTAIREMENT en attente du bandeau de consentement Loi 25 (décision design). Heatmaps = Clarity (répond à leur « outil à décider »). Séquence : bandeau → GA4/GTM + Clarity → événements (~1–2 j après décision). |

## 3. Spotlight diapo 15 — Design & UI/UX

| Exigence | État |
|---|---|
| Design system (couleurs/typos globales, composants réutilisables, espacements) | ✅ `tokens.css` = nos « Global Colors/Fonts »; composants = palette Bookshop (réutilisables partout, garantis par gabarits). |
| ≤ 2 familles de polices, 1 style de bouton (primary/secondary/ghost) | ✅ Tokens; à re-vérifier à la re-peau design. |
| **Style guide interne (page de référence)** | 🔧 ÉCART : à construire — page noindex rendant tokens + palette de sections (~0,5 j; servira aussi d'outil à la phase design). |
| Menu mobile clair, marges ≥ 16 px, responsive 3 paliers | ✅ Par gabarits; audit rapide au gate de sortie. |
| **Footer : 3 bureaux (Québec·Montréal·Paris), partenaires, mentions légales** | ⚠️ ÉCART : footer actuel = 1 adresse; contenu 3 bureaux = 👥, intégration ~0,25 j. Carte interactive des bureaux : proposer une **façade cliquable/carte statique** (Google Maps embed direct = témoins tiers → friction Loi 25). |
| Header sticky + CTA persistant | 🎨 Choix de design (mécanique triviale). |
| Accueil : héros/CTA, section Services, **preuves sociales, logos partenaires + descriptifs, badge MCN, « Victrix en chiffres », hub ressources** | 🔶 Héros/ressources ✅; les sections preuves sociales/chiffres/logos sont des EXIGENCES (requalifiées dans atelier-contenus) — nouvelles sections de palette, disponibles partout ensuite. L'accueil composable (en cours — prompt 2) est le prérequis parfait. |
| Pages services : structure imposée + FAQ + form contextuel + ressources liées | 🔶 Structure validée à l'atelier; FAQ ✅ (section existante), form ✅ (section), ressources liées = à construire avec les Services. |
| Photos authentiques (remplacer le stock) | 👥 Intrant Victrix — à commander tôt (délai photographe). |

## 4. Table d'équivalences (pour répondre à « et X ? » en rencontre)

| Leur outil (cahier) | Notre équivalent | Différence |
|---|---|---|
| Gravity Forms | Sections formulaire + pipeline `/api/forms` | Sans licence; anti-pourriel sans témoins; consentement intégré (case à ajouter — §5) |
| reCAPTCHA | Cloudflare Turnstile | Invisible, gratuit, aligné Loi 25 |
| SearchWP / Relevanssi | Pagefind (à construire) | Index statique au build, filtres par type, zéro serveur |
| WP Rocket + Smush/Imagify | Build Astro (Sharp, WebP/AVIF, srcset) | Natif, systématique, sans licence |
| Yoast Premium + Schema Pro | JSON-LD par gabarit + metas par page | Généré du contenu structuré, sans dérive |
| Polylang Pro | i18n Astro natif (slugs par langue, hreflang) | Sans licence; appariement FR/EN par fichier |
| Elementor Pro + Hello + child-theme + Git | Palette Bookshop + tokens + dépôt Git natif | Le garde-fou est structurel, pas conventionnel |
| UpdraftPlus (sauvegardes) | Git = historique complet | Restauration = revert |
| Staging + calendrier de mises à jour mensuel | Branches + préversions par branche | Pas de fenêtre de maintenance; pas de correctifs mensuels obligatoires |
| SecuPress/Wordfence + durcissement wp-admin | Surface statique + en-têtes durcis | Les catégories de risque n'existent pas |

## 5. LES ÉCARTS À COMBLER — la liste qu'on présente nous-mêmes

| # | Écart | Effort | Quand |
|---|---|---|---|
| 1 | **Moteur de recherche interne** (Pagefind : header, filtres par type, gabarit résultats) | ~1 j | Prochain lot technique |
| 2 | **Formulaires : courriel de confirmation au visiteur + case consentement (checkbox)** | ~0,5 j | Avec l'activation des clés |
| 3 | **Bloc analytique** : bandeau Loi 25 → GA4 + GTM + Clarity + événements conversion + Site Search. (Pixel Facebook et Matomo : « à valider avec l'équipe » au cahier — décisions à prendre en même temps que le bandeau.) | décision design + ~1–2 j | Après choix du bandeau (rencontre) |
| 4 | **O Studio** : landing `/services/o-studio/` + formulaire dédié | ~1 j | Avec le lot Services |
| 4b | O Studio : redirections 301 de l'ANCIEN DOMAINE | 🏢 tâche DNS/registrar + inventaire d'URLs | À inventorier maintenant |
| 5 | **Breadcrumbs** toutes pages internes + BreadcrumbList JSON-LD | ~0,5 j | Prochain lot technique |
| 6 | **Page style guide** interne (tokens + palette, noindex) | ~0,5 j | Avant la phase design |
| 7 | **Footer 3 bureaux** + carte des bureaux (façade Loi 25) | ~0,5 j + 👥 contenu | Avec le contenu |
| 8 | **RSS + partage social** sur ressources | ~0,5 j | Prochain lot technique |
| 9 | **Multi-étapes** : décision | — | Défaut : non; évaluer sur besoin réel |
| 10 | Inventaire d'URLs exhaustif (victrix.ca + O Studio) pour matrice 301 « zéro 404 » | 🏢 ~0,5 j (crawl) | Avant migration de contenu |
| 11 | GSC + Bing Webmaster + suivi mensuel | 🏢 ops (gratuit) | Au lancement |
| 12 | RACI transposé au modèle interne | Décision d'équipe | Rencontre |

**Total des écarts techniques : ~5–6 jours** — déjà à l'intérieur de l'estimation
révisée (26–34 j), dont ils consomment la ligne « contenu/SEO/analytique ».

## 6. Message pour la rencontre

1. **Tout le cahier des charges est tracé** — 23/23 diapos, chaque exigence a un
   état et un propriétaire (ce document).
2. **Les cibles d'acceptation (diapo 23) sont déjà dépassées par construction**
   là où WordPress devait les atteindre à coups d'extensions.
3. **Nous nommons nos écarts nous-mêmes** (§5) : ~5–6 jours de technique, aucun
   n'est structurel, deux dépendent de décisions (bandeau Loi 25, RACI).
4. **La preuve, pas la promesse** : éditeur visuel en direct (clip), landing
   composée en séance, publication en minutes.
5. **Prochaine étape** : l'atelier contenus (`atelier-contenus.md`) — leurs
   définitions deviennent l'intrant du design.
