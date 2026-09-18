# Guide de l'éditeur — publier sur le site Victrix

> Pour l'équipe marketing. Version du **16 septembre 2026** (branche
> `staging`, l'ancienne `spike/cloudcannon` renommée). Le principe à retenir : **vous éditez le contenu, les
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
     et sur l'adresse de test du site de travail, mais **absent du site
     public** (voir « Publier et partager un aperçu »). Désactiver pour
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
   d'offre, réalisations… et, depuis le 17 sept. 2026, les sections de la
   page Carrières : héros photo, carte distinction, tuiles de valeurs,
   photo + atouts, cartes témoignages, texte + photo), chacune avec sa
   **vignette d'aperçu** dans le
   sélecteur. Glisser pour réordonner; chaque section a ses champs (textes,
   boutons, questions…). Deux vitrines pour tout voir :
   `/fr/campagnes/demo-sections/` et `/fr/style-guide/`. Exception : la
   section **« Catalogue de solutions »** (chrome du catalogue, fiches
   automatiques) n'est valable que sur une **page générale** — posée sur une
   campagne ou un service, la publication est bloquée avec un message clair.
4. **Fond de section** : plusieurs sections (héros, cartes à icônes, appel à
   l'action, FAQ, chiffres, tuiles, texte riche, formulaire, valeur
   stratégique, cartes d'offre, réalisations, héros produit) offrent un
   sélecteur « Fond de section » **borné à la palette officielle** — dix
   fonds clairs, chacun avec sa **pastille de couleur** dans la liste :
   blanc · givre (gris très pâle) · perle (gris pâle) · brume (gris clair) ·
   bleu pâle · bleu clair · ivoire · beige · sable (grège) · pierre (grège
   soutenu). Laisser la valeur par défaut = le rendu historique de la
   section ; aucune couleur libre n'est possible (c'est voulu — cohérence de
   la charte). Depuis le 17 sept. 2026, « sable » est un grège plus neutre
   (l'ancienne teinte tirait vers l'orange) : les pages qui l'utilisaient
   ont changé de teinte d'elles-mêmes, rien à refaire.
5. **Icônes** : les champs « Icône » (cartes à icônes, tuiles bento,
   réalisations, chiffres en style carte, puces d'offre…) sont des listes
   déroulantes qui montrent la **vignette de chaque pictogramme** à côté de
   son nom. La bibliothèque est dessinée pour le site ; demander une icône
   manquante à l'équipe technique (elle est ajoutée au dessin ET à la liste).
6. Par défaut la page est **non indexée** (invisible des moteurs de recherche —
   voulu pour les campagnes). L'interrupteur « noindex » est là si une page
   doit un jour être indexée.
7. **Adresse de la page** : le champ « Adresse de la page (segment d'URL) »
   choisit le dernier segment de l'adresse (`/fr/campagnes/<segment>/`) —
   minuscules, chiffres et traits d'union seulement (ex.
   `offre-licences-2026`). Vide = le nom du fichier. Changer l'adresse ne
   brise **pas** l'appariement FR/EN (c'est le nom de fichier qui relie les
   traductions) ; deux campagnes d'une même langue ne peuvent pas partager la
   même adresse (la publication est bloquée avec un message clair). Sur une
   page déjà en ligne, prévoir une **redirection** de l'ancienne adresse
   (voir « Gérer les redirections »).
8. **Save** → en ligne en quelques minutes à `/fr/campagnes/<segment>/`.

> ⚠️ Si vous arrivez sur une **page blanche avec une barre d'outils de texte** :
> vous êtes dans l'éditeur de *contenu* (le corps de texte, vide sur une
> landing). Basculez sur l'**éditeur visuel** avec les icônes en haut à droite.

## Mettre en forme un texte (gras, italique, liens, listes)

Depuis le 16 septembre 2026, **les textes des sections se mettent en forme
sans HTML** : chapeau d'un héros, introduction d'une section, texte d'une
carte, citation, réponse de FAQ, paragraphes d'un bloc « Texte riche »… Le
champ affiche une petite barre d'outils.

- **Champs courts** (texte de carte, citation, chapeau de carte) : gras,
  italique, lien. Le texte reste sur un seul paragraphe — c'est voulu, il vit
  dans un élément dont la mise en page est fixe.
- **Champs longs** (introduction, texte d'appel à l'action, chapeau de héros,
  réponse de FAQ, paragraphes du bloc Texte riche) : en plus, paragraphes,
  listes à puces ou numérotées, citation, petits titres (niveau 3 et 4).
- **Liens** : bouton « lien » de la barre, adresse complète avec la langue
  (`/fr/services/cybersecurite`) ou adresse externe. Pour ouvrir dans un nouvel
  onglet, cocher l'option du lien.
- **Ce qui est retiré à la publication** : tout ce qui n'est pas dans la liste
  ci-dessus (couleurs, tailles, tableaux, images, code collé depuis Word). Le
  texte est conservé, la mise en page du site aussi. Coller du texte depuis
  Word ou un site fonctionne donc sans risque.
- **Boutons dans un texte** : un lien portant le style « bouton » s'affiche
  comme un bouton pilule de la charte (en cours de branchement dans la barre
  d'outils — en attendant, les sections gardent leurs champs « Bouton »).

La même barre d'outils (gras, italique, lien — un seul paragraphe) est
aussi sur les textes **hors sections** : sous-titre et texte d'appui de la
page **Contact**, la description des **Solutions**, les textes
d'introduction et d'appel des **Pages système** (centre de ressources,
recherche, merci) et le **texte de consentement** des formulaires — pratique
pour y glisser le lien vers la politique de confidentialité.

Le corps des articles du centre de ressources garde son éditeur de contenu
(Markdown), plus complet.

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

## Modifier le menu

**Navigation** dans la barre latérale : un fichier par langue (`fr` / `en`).

- **Menu principal** : libellés, liens et ordre des entrées d'en-tête.
- **Méga-menu** : les colonnes du sous-menu Services (titres, liens, icône
  parmi la liste proposée). Un lien peut viser une **page Services** par son
  identifiant (champ « Service ») au lieu d'une adresse : le site calcule
  l'adresse et refuse de publier si la page n'existe pas.
- **Bouton « Portail client »** : libellé et visibilité.

La barre d'annonce (bandeau bleu) a sa propre collection — voir ci-dessous.

## Barres d'annonce (bibliothèque planifiable)

**Barres d'annonce** dans la barre latérale (groupe Marketing) : une fiche par
bannière, **+ Ajouter** pour en créer autant que voulu à l'avance. Chaque fiche
contient :

- **Nom (interne)** : pour vous y retrouver dans la liste — jamais affiché.
- **Affichée** : interrupteur maître (désactivé = jamais montrée, dates ou pas).
- **Diffuser à partir de** / **Retirer à partir de** : la fenêtre de diffusion
  (commune aux deux langues). Vide = pas de borne.
- **Textes (FR)** et **Textes (EN)** : le message dans chaque langue (avant /
  partie en gras / après, libellé du lien).
- **Lien de l'annonce** : sans préfixe de langue (ex. `/produits`).

**Une seule bannière s'affiche à la fois.** Si plusieurs sont actives en même
temps, celle qui a **commencé le plus récemment** gagne (une bannière sans date
de début compte comme « depuis toujours » et cède donc la place aux bannières
datées). Pratique : garder une bannière permanente sans dates, et programmer
des bannières de campagne par-dessus — tout revient à la permanente à la fin.

## Planifier (bannière promo, articles)

- **Barres d'annonce** : chaque fiche porte « **Diffuser à partir de** » /
  « **Retirer à partir de** ». Laisser vide = pas de borne. La bannière
  apparaît/disparaît **au premier build suivant** la date (un passage
  automatique a lieu chaque nuit; heure en UTC — décalage de 4-5 h avec
  Montréal). Dans l'éditeur visuel, une bannière « Affichée » reste toujours
  visible pour que vous puissiez la modifier.
- **Article programmé** : donner à l'article une **date future** — il reste
  invisible du site public jusqu'à cette date (mais visible dans l'éditeur et
  les aperçus, comme un brouillon). Il paraît au premier build suivant sa date.
- Besoin de faire paraître tout de suite sans attendre la nuit ? Demander un
  déclenchement manuel (GitHub → Actions → « Reconstruction planifiée »).

## Créer une page Services (avec gabarit)

> **Depuis le 2026-09-18, deux collections** dans la barre latérale : « Services (FR) »
> et « Services (EN) », une par langue (dossiers `fr/` et `en/`). Rien ne change
> pour la traduction : le même nom de fichier dans les deux collections relie
> les versions. Cette scission rend l'aperçu et l'éditeur visuel exacts pour
> les services enfants (sous-dossiers, ex. `productivite/o-bureau`). **En EN,
> le champ « Adresse de la page » est obligatoire** : c'est lui qui donne
> l'adresse à CloudCannon (vide = aperçu cassé sur cette page seulement).

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

Réglages de la page (panneau latéral, sous les sections) : Titre, Adresse de
la page (segments d'URL — surtout pour l'EN), Description, Masquer des
moteurs, Titre SEO, H1 SEO, et les deux champs **Contact — sujet / service
présélectionné** (voir « Page Contact » : vides = « Un projet » + la famille
du service).

## Modifier les pages générales (Découvrir, Produits, Tarification…)

**Pages générales** dans la barre latérale : les pages générales du site —
Découvrir Victrix, Nos expertises, Nos services, Nos produits, Secteurs
d'activité, Tarification, Centre de confiance, **Carrières** (depuis le
17 sept. 2026) et les pages légales. Elles se composent par sections,
exactement comme les pages Services.

- Plusieurs de ces pages sont aujourd'hui des **placeholders** (texte
  d'attente officiel). Remplacer les sections par le vrai contenu, puis
  désactiver « **Masquer des moteurs de recherche** » : la page devient
  indexable et entre au sitemap automatiquement.
- Même règle de traduction que partout : le même nom de fichier dans `fr/` et
  `en/` relie les deux langues. Le champ **Adresse de la page** permet à la
  version EN d'avoir son propre segment d'URL (ex. `discover`) sans rompre
  l'appariement.
- Mêmes réglages de page que les Services (Titre SEO, H1 SEO, **Contact —
  sujet / service présélectionné**) ; sur une page générale, les deux champs
  Contact sont vides par défaut = aucun choix prérempli dans les listes (le
  libellé du bouton et la page d'origine, eux, sont toujours transmis).

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
page** (Pages générales — Carrières comprise —, Services, Solutions, Blogue —
et les collections **Page Contact** et **Pages système** ci-dessous) ; le
**bandeau promotionnel** du haut se modifie dans **Navigation**.

## Modifier les pages Contact et Carrières

**Page Contact** dans la barre latérale : tout le texte de la page, un fichier
par langue (`fr` / `en`). La mise en page, elle, est fixe — vous changez les
mots et les photos, le site garde sa forme. **Carrières**, elle, est depuis le
17 sept. 2026 une page de **Pages générales** composée de sections (voir la
puce plus bas).

- **Page Contact** — héros, intitulés de la carte Coordonnées, les trois
  cartes bureaux (ville, adresse, photo), la section formulaire (titre, texte
  d'appui, puces, libellés des champs, choix des listes Sujet/Service, texte
  de consentement, bouton). ⚠️ **Les deux listes déroulantes (Sujet, Service)
  et leurs libellés existent à DEUX endroits** : ici (ce que la page affiche)
  et dans **Formulaires → Contact** (ce que le serveur accepte — la liste
  blanche anti-pourriel). Modifier un libellé ou un choix d'un côté sans
  l'autre **bloque la publication** avec le message « options … désalignées »
  (arrivé le 16 sept. 2026 : « Expertise » renommé « Service » côté page
  seulement). Faites toujours la même modification aux deux endroits, dans le
  même ordre, sans espace en trop. **Garder l'ordre Québec, Montréal, Paris** des
  cartes bureaux : le téléphone affiché au bas de chaque carte est apparié par
  position. Les numéros de téléphone eux-mêmes (cliquables) sont gérés par
  l'équipe technique. Dans le texte de consentement, laisser `{privacy}` tel
  quel : il devient automatiquement le lien vers la politique de
  confidentialité dans la bonne langue.
  **Provenance des boutons** (depuis le 16 sept. 2026) : tout bouton ou lien
  du site qui mène à la page Contact (hors menu et pied de page) transmet le
  libellé cliqué et la page d'origine. Le champ « Précisez votre demande »
  arrive prérempli (ex. « Échangez avec un expert — Services gérés ») et le
  message reçu contient deux lignes « cta » et « provenance ». Rien à
  configurer : cela vaut aussi pour les liens que vous ajoutez dans un
  texte. Pour un formulaire de campagne (section « Formulaire »), le même
  suivi se fait avec un **champ caché** dont la valeur est `{{url.cta}}`.
  **Listes déroulantes préremplies** (depuis le 17 sept. 2026) : les deux
  listes « De quoi souhaitez-vous parler ? » et « Service » arrivent aussi
  déjà choisies. Sur une **page Services**, le sujet est « Un projet » et le
  service suit la famille de la page (Cybersécurité, Intelligence
  artificielle, Infonuagique, Services applicatifs [Productivité comprise],
  Services gérés) ; la page Carrières présélectionne « Une carrière » (via
  son champ « Contact — sujet présélectionné ») ; le catalogue
  de solutions « Un projet » + le nom de la solution. Deux champs de page,
  **« Contact — sujet présélectionné »** et **« Contact — service
  présélectionné »** (réglages de la page, à côté du H1 SEO — pages Services
  et Pages générales), permettent de forcer un autre choix ; vides = les
  défauts ci-dessus (aucun choix sur une page générale). Si une option des
  listes est renommée sur la page Contact, le préremplissage correspondant
  cesse silencieusement (jamais d'erreur) — prévenir l'équipe technique pour
  réaligner.
- **Carrières** — depuis le 17 sept. 2026, une page de **Pages générales**
  (`fr/carrieres`, `en/carrieres`) composée de sept sections, éditables dans
  l'éditeur visuel comme les autres pages : **héros photo** (photo, titre,
  sous-titre, bouton « Postulez »), **carte distinction** (Happy At Work :
  insigne, titre, chapeau, citation à liseré), **tuiles de valeurs** (surtitre,
  titre, tuiles icône à liste fermée + libellé), **photo + atouts** (photo,
  carte flottante bleue, titre, chapeau, grille 2×2 d'atouts icône + titre +
  texte), **cartes témoignages** (portrait, citation, prénom, rôle), **texte +
  photo** (responsabilité sociale : titre, chapeau, ligne d'engagement,
  pastilles partenaires, photo) et **appel à l'action** en variante
  « primaire » (aplat bleu, bouton blanc). **Toutes les photos** (héros,
  équipe, responsabilité sociale, portraits) sont maintenant des champs image
  — elles se téléversent dans `images/carrieres`. Mêmes réglages de page que
  les autres pages générales (Titre SEO, H1 SEO, Adresse, Masquer des
  moteurs) ; le champ **« Contact — sujet présélectionné »** est réglé sur
  « Une carrière » : les boutons « Postulez » et « Contactez-nous » mènent à
  la page Contact avec ce sujet déjà choisi (le changer ou le vider ici
  suffit). Les fonds gris des sections (carte distinction, témoignages) sont
  des « Fond de section » de la palette — modifiables, comme partout.

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

Le catalogue est en deux morceaux :

- **La page** (titre de la barre d'outils, texte d'invite de la recherche,
  libellés des filtres et de leur option « tous », badge et boutons de la
  solution vedette, message « aucune solution », appel à l'action du bas —
  titre, texte, bouton téléphone, bouton contact) s'édite dans **Pages
  générales → « Catalogue de solutions »**, dans l'éditeur visuel, comme
  toute page générale : la page contient une seule section **« Catalogue de
  solutions »** qui porte tous ces textes. Les réglages de page (titre,
  description, H1 SEO, « Sujet du formulaire de contact » — « Un projet »
  par défaut) s'appliquent aussi. Dans l'éditeur, les cartes et la vedette
  affichées sont des **exemples** (« Exemple : … ») : les vraies fiches
  apparaissent au build. Ne pas ajouter de deuxième section « Catalogue de
  solutions » (une seule par page), ni la poser sur une campagne ou un
  service (page générale seulement).
- **Les fiches** — **Solutions** dans la barre latérale : une fiche = une
  carte du catalogue (`/fr/solutions/`). Même règle de traduction que
  partout : le même nom de fichier dans `fr/` et `en/` relie les deux
  langues.

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
| Photos et portraits de la page Carrières (héros photo, photo + atouts, texte + photo, cartes témoignages) | `images/carrieres` |
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
- **H1 SEO (optionnel)** : dans les réglages de la page (panneau latéral, à
  côté de « Titre SEO »), pas dans les sections. Vide = le grand titre du
  héros est le H1 lu par les moteurs (défaut). Renseigné = ce texte devient
  le H1 de la page (invisible à l'écran, lu par Google et les lecteurs
  d'écran) et le grand titre passe en H2 : rien ne change visuellement.
  Utile quand le grand titre est une accroche et que le mot-clé doit être
  le H1. Un seul H1 par page : deux héros bloquent la publication.
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

**Boîtes de réception CloudCannon (mode retenu pour l'essai, sept. 2026)** :
les envois arrivent dans une « boîte de réception » (Inbox) du site
CloudCannon, qui les conserve et les transmet aux adresses réglées dans cette
boîte (Site → Inboxes). Dans ce mode, c'est LÀ que se règlent les
destinataires — le champ « Courriel destinataire » du formulaire ne sert
qu'au mode « worker ». Le champ **« Boîte de réception CloudCannon (clé) »**
d'un formulaire reste vide sauf pour envoyer CE formulaire vers une autre
boîte que celle du site (ex. les candidatures vers une boîte RH) : y coller
la clé affichée par CloudCannon dans la boîte visée.

**Composer un formulaire réutilisable** (collection **Formulaires** de la
barre latérale — recommandé) : un fichier = un formulaire, avec son
destinataire et son objet de courriel; les pages y font référence par le champ
« Formulaire lié » de la section.

**Objet des notifications (mode boîte CloudCannon)** : chaque message reçoit
un objet **unique**, préfixé d'une clé entre crochets, par exemple
`[contact/carriere] Une carrière · Services applicatifs — Prénom Nom`,
`[contact/projet] Un projet · Cybersécurité — Marie Tremblay`,
`[infolettre] marie@exemple.com`. La clé ne change jamais (même en anglais,
même si une option de liste est renommée) : c'est elle qui sert aux règles de
classement de la boîte courriel — Gmail : filtre « objet contient
`[contact/carriere]` » → libellé ; Outlook : règle → dossier ou catégorie,
ou transfert automatique (ex. les carrières vers les RH). Le champ « Objet du
courriel » du formulaire n'est que l'objet de repli. Répondre à une
notification répond directement au visiteur (Reply-To).

La **carte infolettre** du centre de ressources s'appuie sur le formulaire
« Infolettre » de cette collection : son **« Courriel destinataire »** est
l'adresse qui reçoit les inscriptions (vide = le destinataire global). Ses
textes visibles (titre, bouton, confirmation) s'éditent dans **Pages
système → Centre de ressources**, pas ici — à une exception près : la petite
ligne de consentement sous le bouton vient du champ **« Texte de
consentement »** du formulaire Infolettre (vide = pas de ligne ; le texte en
place est une ébauche à faire valider juridiquement, voir
`docs/chiffres-officiels.md` §4).

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

Le site vit en deux étages : un **site de travail** (là où toutes les
sauvegardes atterrissent) et un **site de production** (ce que verront les
visiteurs). Rien ne part en production tout seul.

- **Save = enregistrer sur le site de travail** : commit → construction →
  visible sur l'adresse de test en quelques minutes. La production ne bouge
  pas.
- **Publish = mettre en production** : le bouton **Publish** pousse d'un coup
  toutes les modifications accumulées du site de travail vers le site de
  production. C'est le geste conscient de mise en ligne — tant qu'on ne
  clique pas, la production reste telle quelle. (Et tout étant versionné,
  l'équipe technique peut annuler une publication au besoin.)
- **Partager une page non publique** : l'adresse de test du site de travail
  (domaine `cloudvent.net`, jamais indexée par les moteurs) se partage par
  lien — idéal pour faire valider une campagne avant de la publier. Les
  articles en **Brouillon** y sont visibles aussi (même politique que
  l'aperçu de l'éditeur) ; le lien partagé montre donc exactement ce qui
  attend d'être publié. Au besoin, l'équipe technique peut aussi créer un
  lien de revue restreint (Client Sharing).
- ⚠️ **Pendant la transition** (tant que le vrai victrix.ca WordPress est en
  ligne) : le site de production de cette plateforme n'est pas encore public
  (adresse de test non indexée) et montre lui aussi, temporairement, les
  brouillons et les contenus à date future — l'équipe technique corrigera ce
  comportement avant la vraie mise en ligne.

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
page (Carrières comprise, depuis le 17 sept. 2026 — photos incluses),
articles, fiches de solutions, page Contact, textes du site et pages système,
formulaires, menu et barres d'annonce, pied de page, redirections, réglages
SEO page par page. C'est le cœur du site et il est entre vos mains.

Deux exceptions, techniques ou temporaires, restent côté équipe : le
**chrome du catalogue de solutions** (titres et libellés de filtres de
`/solutions`) et les micro-textes d'interface (boutons de partage d'article,
interface de recherche, chaînes d'accessibilité). Sur la page Carrières, les
**pastilles « Partner 1 / 2 »** de la section texte + photo restent des textes
provisoires : les vrais logos des partenaires académiques viendront avec une
évolution de la section.

**Certaines valeurs sont des listes fermées** (un menu déroulant plutôt qu'un
champ libre). Ce n'est pas une limitation gratuite : chaque liste garantit la
**charte graphique** ou le bon fonctionnement du site.

| Champ | Pourquoi une liste fermée |
|---|---|
| Peau de carte (« claire / image / bleue / nuit ») | seules ces variantes existent dans le design |
| Icônes (cartes à icônes, réalisations…) | l'icône vient d'une bibliothèque dessinée pour le site — la liste montre la vignette de chacune |
| Fond de section | dix fonds clairs de la charte, pastille de couleur dans la liste |
| Contact — sujet / service présélectionné | les valeurs doivent exister dans les listes de la page Contact (fr et en) |
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
