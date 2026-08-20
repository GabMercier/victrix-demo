# Fiche des chiffres officiels — À FAIRE VALIDER

**Quoi** : toutes les affirmations factuelles (chiffres, certifications,
partenaires, coordonnées) trouvées sur le site au 2026-08-20, avec leurs
emplacements et leurs contradictions. **Pourquoi** : le site affiche
aujourd'hui des valeurs contradictoires (« 25+ » et « 30+ » années dans le
même fichier) et des chiffres jamais validés. Cette fiche devient la **source
unique** : la direction remplit la colonne « Valeur officielle », puis on
corrige les emplacements listés (presque tout s'édite au CMS).

**Statuts** : ⚠️ contradiction · ❓ à valider · 🎭 fictif (démo interne,
jamais publié) · ✅ présumé exact (confirmer quand même).

## 1. Chiffres d'entreprise

| Affirmation actuelle | Où | Statut | Valeur officielle |
|---|---|---|---|
| « 25+ années d'expérience » | landing démo interne (`demo-sections`, section stats) | ⚠️ contredit le 30+ ci-dessous — **et la ligne du temps officielle : création de Victrix en 2003** (source : page « Découvrir » de l'ancien site, migrée le 2026-08-20 → /decouvrir), soit 23 ans en 2026 | |
| « 30+ ans d'expertise » | même fichier, section ISO | ⚠️ idem — 2003 ne donne ni 25+ ni 30+ ; formulation exacte à choisir (« plus de 20 ans » ?) | |
| « 250+ experts » | landing démo interne (`demo-sections`) | ❓ jamais validé | |
| « **500+ Experts** » | **carte du héros /ressources — VISIBLE en ligne** (Pages système → Centre de ressources) | ❓ prioritaire | |
| « +30 spécialistes » (Ø Studio) | campagne Licences Power Platform (section Ø Studio) | ❓ chiffre du studio, pas de l'entreprise — cohabite avec les deux ci-dessus | |
| « +100 projets réussis » (Ø Studio) | même section | ❓ | |
| « 50 millions de dollars canadiens de chiffre d'affaires » | article blogue « Nomination du CEO » (contenu migré WordPress) | ✅ contenu d'époque — laisser tel quel ou dater | |
| « 3 bureaux — Québec, Montréal, Paris » | landing démo + page Contact | ✅ | |
| « +225 000 points de terminaison gérés à travers le Canada » | service Services TI gérés | ❓ | |
| « 99,9 % respect des accords de services (SLA) » | service Services TI gérés (aussi « 99,9 % disponibilité » dans la démo interne) | ❓ chiffre à portée contractuelle — valider la formulation | |
| « **ZÉRO attaque réussie** » | service Services TI gérés | ❓ affirmation forte — valider juridiquement la formulation | |
| « 24/7 Services gérés » | accueil (carte statistique) | ❓ | |

## 2. Certifications, prix et partenaires

| Affirmation actuelle | Où | Statut | Valeur officielle |
|---|---|---|---|
| Certification ISO 27001 | landing démo interne ; évoquée aussi dans la campagne Évaluation sécurité (« cadres reconnus comme ISO 27001 » — simple référence, OK) | ❓ Victrix est-elle certifiée, ou vise-t-elle la conformité ? | |
| Microsoft Solutions Partner | landing démo interne | ❓ niveau exact du partenariat ? | |
| HappyIndex® AtWork **2024** | page Carrières (héros) | ❓ millésime à rafraîchir (2026 ?) | |
| Partenaires nommés : Imprivata, AlgoSec, AWS, OVHcloud, ServiceNow | landing démo interne (section partenaires) | 🎭 valider commercialement AVANT tout affichage public | |
| Logos « Microsoft, AWS, Cisco, ServiceNow » (fichiers logos vides) | landing démo interne | 🎭 | |
| Témoignage « Marie Lavoie, VP TI » | landing démo interne | 🎭 personnage inventé — ne jamais publier ; remplacer par un vrai témoignage autorisé ou retirer | |
| Témoignages Mikaël et Daniel | page Carrières | ❓ confirmer l'accord des personnes (photos incluses) | |
| « Partner 1 / Partner 2 » (responsabilité sociale) | page Carrières | ❓ vrais noms + logos à fournir | |

## 3. Coordonnées

| Donnée actuelle | Où | Statut | Valeur officielle |
|---|---|---|---|
| +1 514 879-1919 · contact@victrix.ca | pied de page (Textes du site) | ✅ confirmer | |
| Québec — 330 Rue Saint-Vallier Est, #130, G1K 9C5 | page Contact | ✅ confirmer | |
| Montréal — 1100 Boul. René-Lévesque O, #1900, H3B 4N4 | page Contact | ✅ confirmer | |
| Paris — 9-15 rue Rouget de Lisle, Issy-les-Moulineaux, 92130 | page Contact | ✅ confirmer | |
| Facebook / LinkedIn : liens vides (`#`) | pied de page (Textes du site → Pied de page → Réseaux sociaux) | ❓ adresses réelles à fournir — l'édition CMS est déjà en place | |

## 4. Textes de consentement (validation juridique)

Les quatre formulaires ont maintenant chacun un texte — **tous à faire
valider par le conseiller juridique en une seule passe** :

| Formulaire | Texte actuel (FR) | Origine |
|---|---|---|
| Contact | « En soumettant ce formulaire, vous consentez à recevoir des communications de Victrix et acceptez sa politique de confidentialité. » (avec lien) | existant |
| Évaluation sécurité | « Les renseignements fournis sont recueillis et utilisés uniquement pour traiter votre demande, conformément à la Loi 25… » | existant |
| Guide licences | « En soumettant le formulaire, vous consentez à recevoir des communications de Victrix et acceptez sa politique de confidentialité (Loi 25). » | existant |
| **Infolettre** | « En vous inscrivant, vous consentez à recevoir l'infolettre de Victrix par courriel. Vous pouvez retirer votre consentement en tout temps. Vos renseignements sont traités conformément à la politique de confidentialité (Loi 25). » | **ébauche 2026-08-20 — à valider** |

Question juridique connexe : l'infolettre étant une communication commerciale
récurrente, confirmer que la mécanique de retrait (désabonnement) prévue
satisfait la LCAP (loi anti-pourriel) avant l'envoi du premier numéro.

## Après validation

1. Reporter les valeurs officielles dans le CMS (chaque « Où » ci-dessus est
   éditable, sauf le service Services TI gérés → collection Services).
2. La landing `demo-sections` reste une vitrine interne `noindex` — corriger
   ses chiffres quand même (elle sert de modèle aux futures campagnes).
3. Archiver cette fiche dans la décision de rencontre (date + qui a validé).
