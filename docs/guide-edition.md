# Guide de l'éditeur — publier sur le site Victrix

> Pour l'équipe marketing. Version du **7 août 2026** (branche
> `spike/cloudcannon`). Le principe à retenir : **vous éditez le contenu, les
> gabarits garantissent la forme** — vous ne pouvez pas casser la mise en page.
> Captures d'écran à ajouter.

## Se connecter

1. Ouvrir CloudCannon (l'URL du site « Vic-demo » vous est partagée par
   l'équipe technique, avec votre invitation).
2. La barre latérale gauche liste les contenus éditables, en trois groupes :
   - **Contenu du site** : Accueil, Services, Solutions, Blogue ;
   - **Marketing** : Campagnes, Formulaires, Navigation ;
   - **Configuration** : Redirections.

> 💡 Chaque sauvegarde crée une version dans l'historique Git : tout est
> traçable et réversible. Personne ne peut « perdre » le site.

## Modifier un article du centre de ressources

1. **Centre de ressources** → choisir l'article. Chaque article existe en deux fichiers
   miroirs : `fr/` et `en/` (même nom de fichier = même article dans l'autre
   langue).
2. Modifier le texte dans l'éditeur; l'aperçu se met à jour.
3. Champs utiles dans le panneau :
   - **Brouillon** : activé = l'article est visible dans l'aperçu CloudCannon
     mais **absent du site public** — et absent aussi des adresses de
     préversion de branche, sauf option `DRAFTS_VISIBLE` activée par l'équipe
     technique (voir « Publier et partager un aperçu »). Désactiver pour
     publier.
   - **Image de couverture** : glisser-déposer; l'optimisation (format, tailles,
     compression) est automatique au moment de la publication.
   - **Slug** : l'adresse de la page (`/fr/ressources/<slug>/`). Chaque langue
     a le sien. Ne pas changer sur un article déjà publié sans prévoir une
     redirection (voir plus bas).
   - **Date de publication** : une date **future** programme l'article (voir
     « Planifier » plus bas).
   - **Étiquettes** vs **Thèmes (maillage Services)** : deux champs distincts.
     Les *étiquettes* sont les catégories du centre de ressources (pilules de
     filtre + méga-menu Ressources) — la **première** étiquette est la
     catégorie affichée sur la carte de l'article. Les *thèmes* relient l'article aux bandes
     « Ressources liées » des pages Services — reprendre exactement un nom
     d'expertise (Cybersécurité, Intelligence artificielle, Infonuagique,
     Productivité, Services gérés, Conseil stratégique ; équivalents anglais
     côté EN). Un article sans thème n'apparaît dans aucune bande.
   - **Titre SEO (surcharge)** et **Masquer des moteurs de recherche** : les
     réglages de référencement par article (voir « Bien référencer une page »).
4. **Save** → l'article part en publication (en ligne en quelques minutes).

## Créer un article

1. **Centre de ressources** → **+ Ajouter** → choisir le gabarit **FR** ou **EN**.
2. Le fichier arrive pré-rempli avec des champs valides — remplacer les textes,
   poser l'image, écrire.
3. Laisser **Brouillon** activé tant que ce n'est pas prêt; créer ensuite le
   miroir dans l'autre langue (même nom de fichier) pour la version traduite.

## Composer une landing de campagne

C'est la grande nouveauté : des pages construites par assemblage de sections.

1. **Campagnes** → **+ Ajouter** (gabarit FR ou EN) ou ouvrir la landing démo
   « Évaluation de votre posture de sécurité ».
2. La page s'ouvre dans l'**éditeur visuel** : la page rendue à droite, les
   sections à gauche.
3. **+ Ajouter une section** propose la palette : **une trentaine de
   sections** (héros, cartes à icônes, FAQ, formulaire, appel à l'action,
   témoignage, bandeau logos, chiffres, vidéo, grilles bento, tuiles, cartes
   d'offre, réalisations…), chacune avec sa **vignette d'aperçu** dans le
   sélecteur. Glisser pour réordonner; chaque section a ses champs (textes,
   boutons, questions…). Deux vitrines pour tout voir :
   `/fr/campagnes/demo-sections/` et `/fr/style-guide/`.
4. **Fond de section** : plusieurs sections (héros, cartes à icônes, appel à
   l'action, FAQ, chiffres, tuiles, texte riche, formulaire, valeur
   stratégique, cartes d'offre, réalisations) offrent un sélecteur « Fond de
   section » **borné à la palette officielle** : blanc · givre (gris très
   pâle) · ivoire · beige · sable. Laisser la valeur par défaut = le rendu
   historique de la section ; aucune couleur libre n'est possible (c'est
   voulu — cohérence de la charte).
5. Par défaut la page est **non indexée** (invisible des moteurs de recherche —
   voulu pour les campagnes). L'interrupteur « noindex » est là si une page
   doit un jour être indexée.
6. **Adresse de la page** : le champ « Adresse de la page (segment d'URL) »
   choisit le dernier segment de l'adresse (`/fr/campagnes/<segment>/`) —
   minuscules, chiffres et traits d'union seulement (ex.
   `offre-licences-2026`). Vide = le nom du fichier. Changer l'adresse ne
   brise **pas** l'appariement FR/EN (c'est le nom de fichier qui relie les
   traductions) ; deux campagnes d'une même langue ne peuvent pas partager la
   même adresse (la publication est bloquée avec un message clair). Sur une
   page déjà en ligne, prévoir une **redirection** de l'ancienne adresse
   (voir « Gérer les redirections »).
7. **Save** → en ligne en quelques minutes à `/fr/campagnes/<segment>/`.

> ⚠️ Si vous arrivez sur une **page blanche avec une barre d'outils de texte** :
> vous êtes dans l'éditeur de *contenu* (le corps de texte, vide sur une
> landing). Basculez sur l'**éditeur visuel** avec les icônes en haut à droite.

## Traduire : créer en FR, dupliquer vers EN (et inversement)

La règle unique : **même nom de fichier dans `fr/` et `en/` = même page dans
l'autre langue** (c'est ce qui relie le sélecteur FR|EN). Le flux le plus
rapide :

1. Créer et finaliser la page dans la première langue (FR ou EN).
2. Sur le fichier (Blogue ou Campagnes) : menu **⋯ → Duplicate**.
3. Dans la copie : ouvrir **⋯ → Rename / Move** et remplacer le dossier de
   langue dans le chemin (`fr/` → `en/`, ou l'inverse) en gardant **exactement
   le même nom de fichier** (retirer le suffixe ajouté par la duplication,
   ex. `-1`).
4. Traduire les textes dans la copie — la structure (sections, champs, image)
   est déjà en place. Sur le Blogue, ajuster aussi le **Slug** dans la langue
   cible.

Autre chemin : **+ Ajouter** avec le gabarit de l'autre langue, en tapant le
même nom de fichier — structure vierge, mais champs valides garantis.

> 💡 Filet de sécurité : à chaque publication, le système signale dans le
> journal de build les pages qui n'ont **pas encore de traduction** (aucun
> blocage — un simple rappel).

## Modifier le menu et la barre d'annonce

**Navigation** dans la barre latérale : un fichier par langue (`fr` / `en`).

- **Menu principal** : libellés, liens et ordre des entrées d'en-tête.
- **Méga-menu** : les colonnes du sous-menu Services (titres, liens, icône
  parmi la liste proposée). Un lien peut viser une **page Services** par son
  identifiant (champ « Service ») au lieu d'une adresse : le site calcule
  l'adresse et refuse de publier si la page n'existe pas.
- **Barre d'annonce** : textes, lien, et l'interrupteur **Affichée** pour la
  masquer complètement.
- **Bouton « Portail client »** : libellé et visibilité.

## Planifier (bannière promo, articles)

- **Bannière d'annonce** : Navigation → Barre d'annonce → « **Diffuser à partir
  de** » / « **Retirer à partir de** ». Laisser vide = pas de borne. La bannière
  apparaît/disparaît **au premier build suivant** la date (un passage
  automatique a lieu chaque nuit; heure en UTC — décalage de 4-5 h avec
  Montréal). Dans l'éditeur visuel, la bannière reste toujours visible pour
  que vous puissiez la modifier.
- **Article programmé** : donner à l'article une **date future** — il reste
  invisible du site public jusqu'à cette date (mais visible dans l'éditeur et
  les aperçus, comme un brouillon). Il paraît au premier build suivant sa date.
- Besoin de faire paraître tout de suite sans attendre la nuit ? Demander un
  déclenchement manuel (GitHub → Actions → « Reconstruction planifiée »).

## Créer une page Services (avec gabarit)

**Services** dans la barre latérale → **+ Ajouter** → choisir **Service (FR)**
ou **Service (EN)** : la page est créée dans la bonne langue avec un gabarit
valide (héros + sections d'exemple), impossible de produire un fichier cassé.
Composer ensuite par sections comme une campagne. Pour la traduction : créer
(ou Dupliquer) **le même nom de fichier** dans l'autre langue — c'est ce qui
relie les deux versions (voir « Traduire »).

> ⚠️ Les liens de navigation s'écrivent **sans** préfixe de langue
> (`/contact`, pas `/fr/contact`) — le site ajoute `/fr` ou `/en` tout seul.
> C'est l'inverse des boutons de sections (qui prennent l'adresse complète);
> les infobulles des champs le rappellent. Un lien mal formé bloque la
> publication avec un message clair, comme pour les redirections.

## Modifier les pages générales (Découvrir, Produits, Tarification…)

**Pages** dans la barre latérale : les pages générales du site — Découvrir
Victrix, Nos expertises, Nos services, Nos produits, Secteurs d'activité,
Tarification, Centre de confiance et les pages légales. Elles se composent par
sections, exactement comme les pages Services.

- Plusieurs de ces pages sont aujourd'hui des **placeholders** (texte
  d'attente officiel). Remplacer les sections par le vrai contenu, puis
  désactiver « **Masquer des moteurs de recherche** » : la page devient
  indexable et entre au sitemap automatiquement.
- Même règle de traduction que partout : le même nom de fichier dans `fr/` et
  `en/` relie les deux langues.

## Modifier les textes du site (pied de page, bandeau de consentement)

**Textes du site** dans la barre latérale : les textes qui s'affichent sur
**toutes les pages sans appartenir à aucune**. Un fichier par langue
(`fr` / `en`), trois blocs :

- **Pied de page** — les quatre colonnes de liens, le titre et les coordonnées
  de la colonne Contact, la pastille « Portail client », les réseaux sociaux
  et les mentions légales de la barre du bas. Le pied de page allégé des
  campagnes reprend automatiquement les mêmes mentions légales.
- **Bandeau de consentement (Loi 25)** — la phrase affichée en bas de l'écran
  au premier passage, le lien vers la politique et les deux boutons. Texte à
  **portée légale** : faire valider les changements.
- **Page « introuvable » (erreur 404)** — titre, message et boutons proposés
  quand un visiteur atteint une adresse inexistante.

Deux points d'attention :

- Les liens internes s'écrivent **sans préfixe de langue** (`/contact`, pas
  `/fr/contact`) — le site ajoute `/fr` ou `/en` tout seul. Les liens de
  réseaux sociaux, eux, sont des adresses externes complètes.
- Le **téléphone existe en deux champs** : celui qui s'affiche (avec espaces
  et tirets) et celui que compose un mobile (sans espace, indicatif compris,
  ex. `+15148791919`). Modifier les deux.

L'année du copyright se met à jour toute seule à chaque publication.

**Ce qui ne se trouve PAS ici** : le texte propre à une page s'édite **avec sa
page** (Pages, Services, Solutions, Blogue — et les collections **Page
Contact**, **Page Carrières** et **Pages système** ci-dessous) ; le **bandeau
promotionnel** du haut se modifie dans **Navigation**.

## Modifier les pages Contact et Carrières

**Page Contact** et **Page Carrières** dans la barre latérale : tout le texte
de ces deux pages, un fichier par langue (`fr` / `en`). La mise en page, elle,
est fixe — vous changez les mots et les photos, le site garde sa forme.

- **Page Contact** — héros, intitulés de la carte Coordonnées, les trois
  cartes bureaux (ville, adresse, photo), la section formulaire (titre, texte
  d'appui, puces, libellés des champs, choix des listes Sujet/Expertise, texte
  de consentement, bouton). **Garder l'ordre Québec, Montréal, Paris** des
  cartes bureaux : le téléphone affiché au bas de chaque carte est apparié par
  position. Les numéros de téléphone eux-mêmes (cliquables) sont gérés par
  l'équipe technique. Dans le texte de consentement, laisser `{privacy}` tel
  quel : il devient automatiquement le lien vers la politique de
  confidentialité dans la bonne langue.
- **Page Carrières** — héros, carte « Happy At Work », valeurs (icône à liste
  fermée + libellé), atouts « Pourquoi rejoindre » (icône + titre + texte),
  témoignages (portrait, citation, prénom, rôle), responsabilité sociale et
  appel à l'action final. Les **photos de section** (héros, équipe, RSE) sont
  gérées par l'équipe technique en attendant les visuels authentiques ; les
  **portraits des témoignages**, eux, se téléversent ici.

Comme partout : liens internes **sans préfixe de langue**, et une valeur
invalide (ex. une icône hors liste) **bloque la publication** avec un message
clair — le site en ligne reste intact.

## Modifier les pages système (centre de ressources, recherche, merci)

**Pages système** dans la barre latérale : les textes de trois pages « outils »
qui n'ont pas de fiche de contenu propre, un fichier par langue, trois blocs :

- **Centre de ressources** (`/ressources`) — tous les textes de la page :
  héros (chip, titre et sa **fin en bleu**, bouton d'abonnement, carte
  décorative « 500+ Experts »), texte indicatif de la recherche, lien « Lire
  l'article » des cartes, **carte infolettre** (titre, texte, bouton, message
  de confirmation) et **bandeau d'appel à l'action** du bas (titre, texte,
  deux boutons). Le surtitre (« Centre de ressources ») sert aussi de nom de
  section dans le **fil d'Ariane des articles** et de titre du **flux RSS** —
  un seul champ à changer, tout suit.
- **Page de recherche** (`/recherche`) — titre d'onglet, textes d'en-tête et
  message sans JavaScript. Les textes de l'interface de recherche elle-même
  (« Rechercher… », compteurs de résultats) sont gérés par l'équipe technique.
- **Page de confirmation** (`/merci`) — le message affiché après l'envoi d'un
  formulaire, et ses boutons.

## Gérer le catalogue de solutions

**Solutions** dans la barre latérale : une fiche = une carte du catalogue
(`/fr/solutions/`). Même règle de traduction que partout : le même nom de
fichier dans `fr/` et `en/` relie les deux langues.

- **Secteur d'activité** et **Type de solution** : ces deux champs alimentent
  les chips de la carte ET les **filtres** de la page. Reprendre **exactement**
  la graphie des autres fiches (accents et majuscules compris) — une variante
  crée un filtre séparé.
- **Solution vedette** : activée, la fiche remplit le grand panneau bleu nuit
  en tête de catalogue (une seule vedette; en cas de doublon, la première
  selon l'ordre d'affichage gagne).
- **Ordre d'affichage** : croissant (petits numéros d'abord).
- **Liens** : sans préfixe de langue (`/contact`), comme la navigation — le
  site ajoute `/fr` ou `/en` tout seul.
- **Lien vers `/contact` = formulaire prérempli** : quand le lien d'une fiche
  pointe vers la page contact, le site y transporte automatiquement le nom de
  la solution — le visiteur arrive sur un formulaire où le sujet (« Un
  projet ») et le champ « Précisez votre demande » sont déjà remplis. Rien à
  configurer : c'est automatique dès que le lien est `/contact`.
- Une fiche n'a pas (encore) de page propre : « Découvrir » mène au lien de la
  carte. Les pages de détail sont une suite planifiée.
- Le catalogue est accessible aux visiteurs par **« Catalogue de solutions »**
  dans la colonne Produits du méga-menu et du pied de page.

## Médias et images

Le sélecteur d'image de CloudCannon téléverse chaque visuel **dans le dossier
prévu pour son emplacement** — vous n'avez pas de chemin à choisir, l'éditeur
range pour vous :

| Où vous téléversez | Où le fichier atterrit |
|---|---|
| Couverture d'un article de blogue | `wp-content/uploads/cms` (à côté des médias migrés de WordPress) |
| Image de la page d'accueil (« Solution ») | avec le contenu de l'accueil (image optimisée au build) |
| Images de sections (héros, bento, cartes…) | `images/sections` |
| Fiche du catalogue de solutions | `images/solutions` |
| Cartes bureaux (Page Contact) | `images/contact` |
| Portraits de témoignages (Page Carrières) | `images/carrieres` |
| Carte du méga-menu (Navigation) | `images/nav` |

Trois règles simples :

- **Une image = un seul téléversement** : le même fichier sert au FR et à
  l'EN (téléverser dans une langue, recopier le chemin dans l'autre, ou
  utiliser la duplication FR → EN).
- Le sélecteur ne montre que le dossier de l'emplacement en cours — c'est
  voulu : chaque type d'image a sa maison. Pour réutiliser un visuel déjà
  téléversé ailleurs, recopier son **chemin** (ex. `/images/sections/photo.jpg`)
  dans le champ.
- Préférer des fichiers **légers** (JPG pour les photos, moins de ~300 ko si
  possible) : les images de sections sont servies telles quelles.

## Bien référencer une page (SEO)

Ce que vous contrôlez, page par page :

- **Titre** (et « Titre SEO (surcharge) » sur le blogue et les services) :
  ≤ 60 caractères, portant le mot-clé principal. Vide = le titre normal sert
  partout.
- **Description** (« Extrait » sur le blogue) : 120–155 caractères, orientée
  clic — c'est le texte affiché sous le lien dans Google et les partages.
- **Masquer des moteurs de recherche** (`noindex`) : campagnes masquées par
  défaut (trafic payant), tout le reste indexé par défaut. N'y toucher que
  pour retirer temporairement une page des résultats.
- **Redirections** : à chaque changement d'adresse d'une page publiée (voir
  la section suivante).

Le reste (balise canonique, hreflang FR/EN, sitemap, données structurées,
aperçus de partage) est **automatique** — personne n'a à y penser, personne ne
peut le casser depuis l'éditeur.

Checklist de rédaction (remplace les « pastilles vertes » de Yoast) : 1 sujet
= 1 page · un seul grand titre (le champ Titre), sous-titres descriptifs ·
liens internes vers les services/articles liés · texte alternatif des images
· nommer les fichiers d'images en mots réels (`audit-cybersecurite.jpg`, pas
`IMG_0034.jpg`) · vérifier l'aperçu de partage avant publication.

## Gérer les redirections

**Redirections** dans la barre latérale : une liste `Ancienne URL → Nouvelle
destination` avec le type (301 permanente / 302 temporaire).

- Ajouter une entrée à chaque changement d'adresse d'une page publiée.
- Une entrée invalide (boucle, URL mal formée) **bloque la publication avec un
  message clair** — c'est un garde-fou, pas un bogue : le site en ligne reste
  intact tant que l'erreur n'est pas corrigée.

## Formulaires

Les sections « Formulaire » des landings sont **en démonstration** tant que les
clés d'envoi ne sont pas configurées (action technique ponctuelle, voir
`docs/formulaires.md`). Une fois activées : anti-pourriel invisible,
notification courriel à l'adresse choisie, et redirection du visiteur vers la
page « Merci ».

**Composer un formulaire réutilisable** (collection **Formulaires** de la
barre latérale — recommandé) : un fichier = un formulaire, avec son
destinataire et son objet de courriel; les pages y font référence par le champ
« Formulaire lié » de la section.

La **carte infolettre** du centre de ressources s'appuie sur le formulaire
« Infolettre » de cette collection : son **« Courriel destinataire »** est
l'adresse qui reçoit les inscriptions (vide = le destinataire global). Ses
textes visibles (titre, bouton, confirmation) s'éditent dans **Pages
système → Centre de ressources**, pas ici.

> ⚠️ **« Courriel destinataire » est le champ le plus sensible de l'éditeur** :
> c'est l'adresse qui reçoit réellement les messages des visiteurs. Une faute
> de frappe les détourne silencieusement — vérifier deux fois avant de
> publier. Vide = le destinataire global du site (réglage technique).

Sept types de champ :

| Type | Usage |
|---|---|
| Texte court / Courriel / Téléphone / Texte long | les classiques (nom, courriel, message…) |
| Liste déroulante | choix borné — remplir « Options (liste déroulante) », une par ligne |
| Case à cocher | oui/non affirmatif — **c'est le type à utiliser pour le consentement Loi 25** (cocher « Obligatoire » : la demande ne part pas sans consentement, et le courriel indique « oui »/« non ») |
| Champ caché | invisible du visiteur, mais présent dans le courriel — utile pour tracer la provenance |

Deux raffinements optionnels :

- **Champ auto-rempli** (type « champ caché ») : la « Valeur (champ caché) »
  accepte des jetons remplacés automatiquement — `{{page.titre}}`,
  `{{page.chemin}}`, `{{page.slug}}`, `{{page.langue}}` (valeurs de la page
  qui héberge le formulaire) et `{{url.utm_source}}` (ou tout `{{url.…}}`,
  seul dans la valeur) pour capter les paramètres de campagne de l'adresse
  visitée. Le courriel de notification montre ces valeurs.
- **Condition d'affichage** : un champ peut n'apparaître que si un autre champ
  a une valeur précise (ex. « Précisez » ne s'affiche que si la liste vaut
  « Autre »). Remplir « Champ pilote » avec le **libellé exact** d'une liste
  déroulante ou d'une case du même formulaire, et « Valeur attendue » avec
  l'option visée (« oui » pour une case). Une faute de frappe dans le libellé
  **bloque la publication avec un message clair** — garde-fou, pas bogue.

Le formulaire de démonstration `campagne-evaluation` (FR et EN) illustre tout
cela : liste déroulante, champ conditionnel, case de consentement requise et
champs cachés auto-remplis. Les champs peuvent aussi rester composés
directement dans la section (mode historique), mais sans destinataire propre.

## Publier et partager un aperçu

- **Save = publier** (sur la branche de travail) : commit → construction →
  en ligne, le tout en quelques minutes.
- **Partager une page non publique** : chaque branche de travail a son adresse
  de préversion complète (`https://<branche>.victrix-demo.pages.dev/…`),
  partageable par lien, non indexée par les moteurs. Idéal pour faire valider
  une campagne avant sa vraie mise en ligne.
- ⚠️ **Cas particulier des articles en Brouillon** : la préversion de branche
  est construite comme le site public, donc un article encore en **Brouillon**
  n'y apparaît **pas** (le lien partagé mènerait à une page introuvable) — à
  moins que l'équipe technique n'ait activé `DRAFTS_VISIBLE` sur
  l'environnement de préversion (action ponctuelle, voir `.env.example`). Sans
  cette option : désactiver « Brouillon » sur la branche de travail (la
  branche joue alors le rôle de brouillon), faire valider par lien, puis
  fusionner pour publier.

## Les pièges connus (et pourquoi ce n'est pas grave)

| Situation | Explication |
|---|---|
| Page blanche à l'ouverture d'une landing | Mauvais éditeur — basculer sur l'éditeur visuel (icônes en haut à droite). |
| « Ma sauvegarde a échoué avec un message sur les redirections » | Une entrée de redirection est invalide — la corriger; le site public n'est pas affecté. |
| Le formulaire ne fait rien | Normal en mode démonstration (clés non posées). |
| L'accueil ne se modifie pas en cliquant sur la page | L'accueil s'édite par le panneau de champs à gauche (aperçu à droite). L'édition clic-sur-la-page y viendra si l'équipe la juge prioritaire. |
| Je veux annuler une modification | Tout est versionné — demander à l'équipe technique de restaurer, rien n'est perdu. |
| Boutons en anglais (« Add Bénéfices », « Save », « Publish »…) | L'interface de l'application CloudCannon est en anglais (pas d'option française à ce jour); tout NOTRE contenu (étiquettes de sections, champs, descriptions) est en français. Le mélange est cosmétique — comme utiliser Word en anglais pour écrire un texte français. |

## Ce que vous contrôlez — et ce qui est verrouillé (et pourquoi)

**Vous contrôlez le contenu** : textes, images, ordre des sections d'une
page, articles, fiches de solutions, pages Contact et Carrières, textes du
site et pages système, formulaires, menu et barre d'annonce, pied de page,
redirections, réglages SEO page par page. C'est le cœur du site et il est
entre vos mains.

Trois exceptions, techniques ou temporaires, restent côté équipe : le
**chrome du catalogue de solutions** (titres et libellés de filtres de
`/solutions`), certaines **photos de section** de la page Carrières (héros,
équipe, RSE — en attendant les visuels authentiques) et les micro-textes
d'interface (boutons de partage d'article, interface de recherche, chaînes
d'accessibilité).

**Certaines valeurs sont des listes fermées** (un menu déroulant plutôt qu'un
champ libre). Ce n'est pas une limitation gratuite : chaque liste garantit la
**charte graphique** ou le bon fonctionnement du site.

| Champ | Pourquoi une liste fermée |
|---|---|
| Peau de carte (« claire / image / bleue / nuit ») | seules ces variantes existent dans le design |
| Icônes (cartes à icônes, réalisations…) | l'icône vient d'une bibliothèque dessinée pour le site |
| Type de champ de formulaire | chaque type a son comportement serveur (validation, courriel) |
| Couleur d'accent | bornée aux couleurs de la **charte** — pas de couleur libre, la cohérence visuelle est garantie d'avance |

**Quelques champs sont « hérités »** : visibles dans l'éditeur avec la mention
« hérité — plus affiché » (couleur d'accent et numéro des cartes d'expertise,
icônes des colonnes du méga-menu). Ils viennent de l'ancien design et n'ont
plus d'effet visuel — les remplir ou non ne change rien au site.

**Le filet de sécurité final, c'est la construction du site** : chaque
publication est validée de bout en bout avant la mise en ligne. Une valeur
invalide **bloque la publication avec un message clair** — le site en ligne
reste intact. Autrement dit : vous ne pouvez pas casser le site en prod depuis
l'éditeur, au pire une publication est retardée le temps d'une correction.

## Ce qu'il ne faut pas toucher

- Les fichiers techniques à la racine du dépôt — l'éditeur ne vous les
  propose pas, c'est voulu. (L'ancien éditeur Sveltia a été retiré : CloudCannon
  est le seul outil d'édition.)
- Les **noms de fichiers** des contenus existants (ils apparient FR ⇄ EN).
  Pour changer une adresse publique, utiliser le champ **Slug** + une
  redirection.
