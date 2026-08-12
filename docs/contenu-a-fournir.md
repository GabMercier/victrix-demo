# Contenu à fournir avant l'ouverture aux gestionnaires de contenu

**Quoi** : la liste de tout ce qui est encore en « langage officiel de
placeholder » (ou en donnée de démonstration) sur le prototype, avec qui doit
fournir le vrai contenu et où il s'éditera dans CloudCannon. **Pourquoi** :
c'est la dernière marche avant de donner l'accès CloudCannon à l'équipe
contenu — tout est éditable, il ne manque que la matière. Complète
l'inventaire de migration historique (`docs/content-inventory.md`) et la
liste de bord `docs/plan-prompts.md` (P-19 : migration du contenu restant).

Rappel d'état (2026-08-12) : **toutes les surfaces de contenu du site sont
éditables au CMS** — pages, services, blogue, accueil, campagnes, solutions,
Contact, Carrières, pages système, textes du site, navigation, formulaires,
redirections. Les placeholders naissent `noindex` : ils sont en ligne mais
masqués des moteurs ; **penser à désactiver « Masquer des moteurs de
recherche » quand le vrai contenu arrive**.

## 1. Pages générales en placeholder (collection « Pages », FR + EN)

9 pages par langue, toutes `noindex`. Priorité suggérée dans l'ordre du
tableau :

| Page (FR / EN) | Contenu attendu | Qui fournit |
|---|---|---|
| /politique-confidentialite | Texte légal réel (Loi 25) — **à faire valider juridiquement** ; le bandeau de consentement et tous les formulaires pointent dessus | Direction + conseiller juridique |
| /conditions-utilisation | Texte légal réel | Direction + conseiller juridique |
| /decouvrir | Présentation de Victrix (mission, équipe, historique) | Marketing |
| /expertises | Page d'atterrissage des expertises (peut réutiliser les sections bento/bénéfices) | Marketing |
| /services | Page d'atterrissage des services | Marketing |
| /produits | Page d'atterrissage des produits | Marketing |
| /secteurs | Secteurs d'activité desservis | Marketing |
| /tarification | Modèle de tarification / appel à contact | Direction + Marketing |
| /centre-de-confiance | Sécurité, conformité, certifications (ISO…) | Direction TI |

## 2. Services en placeholder (collection « Services », FR + EN)

| Service | État |
|---|---|
| /services/infrastructure | Placeholder noindex — contenu réel à rédiger (P-19) |
| /services/projets-en-ia | Placeholder noindex — idem |
| /services/services-applicatifs | Placeholder noindex — idem |
| /services/demo-sections | Page de démonstration interne — reste noindex, ne pas remplir |

Les 25 autres services sont réels et indexables. La passe P-19 (~14 h
estimées) couvre aussi la généralisation du maillage « Ressources liées » sur
chaque service.

## 3. Données réelles à remplacer (petites, mais visibles)

| Quoi | Où l'éditer | Qui fournit |
|---|---|---|
| Liens sociaux du pied de page (Facebook, LinkedIn — actuellement `#`) | Textes du site → Pied de page → Réseaux sociaux | Marketing |
| Pastilles « Partner 1 / Partner 2 » (page Carrières, responsabilité sociale) | Page Carrières → Responsabilité sociale → Partenaires | RH / Marketing |
| Fiches du catalogue de solutions : liens « Découvrir » / documentation (plusieurs pointent vers /contact ou sont vides) | Solutions → chaque fiche | Marketing / Produit |
| Témoignages Carrières (2 exemples de la maquette) | Page Carrières → Témoignages | RH |
| Textes légaux du consentement (bandeau + formulaires) — valider la formulation | Textes du site → Bandeau ; Formulaires → texte de consentement | Juridique |

## 4. Ce qui reste côté équipe technique (pas du contenu)

| Quoi | Référence |
|---|---|
| Brancher le formulaire Contact sur le backend réel (page encore en maquette ; /api/forms est prêt) | docs/formulaires.md §10 |
| Clés SMTP2GO + Turnstile + entrée CSP (activation des envois en prod) | docs/operations.md §OPS |
| Courriel de confirmation au visiteur | P-08 |
| Analytics GA4/GTM + Site Search (contrat de consentement déjà prêt) | P-11 |
| **Secret `REBUILD_HOOK_URL`** — sans lui, la publication planifiée (bannière promo datée, articles à date future) ne s'applique jamais | docs/operations.md § publication planifiée |
| Décommission du worker OAuth Sveltia | docs/GUIDE-PROJET.md § jalons |
| Photos authentiques (héros Carrières, équipe, RSE, visuels de sections) + re-skin final | attendus avec l'export design |
| Logo Organization (schema.org — actuellement le favicon 32×32) | BaseLayout (TODO en code) |

## 5. Ouvrir l'accès CloudCannon — pas à pas

1. **Avant d'inviter** (5-15 min, une fois) :
   - poser le secret `REBUILD_HOOK_URL` (hook de build CloudCannon ou
     Cloudflare) dans les secrets GitHub — la planification devient réelle ;
   - vérifier le **palier tarifaire CloudCannon** : la facturation est par
     siège — compter un siège par gestionnaire de contenu ;
   - protéger les préversions si elles doivent rester privées.
2. **Inviter** chaque gestionnaire dans CloudCannon (Settings → Members) avec
   un rôle SANS accès aux réglages du site (éditeur de contenu).
3. **Premier atterrissage** : leur transmettre `docs/guide-edition.md` (le
   guide est écrit pour eux, en français, section « Se connecter » en tête).
4. **Première tâche guidée** suggérée : remplir une page placeholder de la
   section 1 (bac à sable réel, sans risque — une erreur bloque la
   publication, jamais le site).
5. **Formation** (story ADO F4.5) : une session d'une heure suffit — création
   d'article, duplication FR→EN, édition d'une page par sections, publication
   et préversion.

## 6. Après l'export design (pour mémoire — hors périmètre contenu)

Re-skin des composants restants, visuels authentiques, validation visuelle
des sections non encore utilisées (bento/chiffres/témoignage sur l'accueil),
WebP/AVIF + srcset. Point d'entrée : `scripts/design/audit-export-tokens.mjs`.
