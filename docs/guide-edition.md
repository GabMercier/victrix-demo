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
     publier. Depuis le **24 sept. 2026**, le statut se voit **sur la carte**
     de l'article dans la liste (petite étiquette `true` = brouillon, `false`
     = publié) et la liste se trie par **« Brouillons d'abord »** (menu de
     tri en haut de la liste). Sept articles retirés à la demande de
     l'équipe marketing sont en brouillon (deux nominations, les trois
     « Meilleures pratiques en sécurité opérationnelle », « Réalité
     étendue », « Une journée dans la vie SecOps ») : leurs anciennes
     adresses redirigent vers la page la plus proche (Découvrir, SEvOC,
     Intelligence artificielle). Désactiver « Brouillon » les republie tels
     quels — la redirection tombe alors d'elle-même au build suivant.
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
   bleu pâle · bleu clair · ivoire (chaud) · beige (gris chaud) · sable
   (grège) · pierre (grège soutenu). Laisser la valeur par défaut = le rendu
   historique de la section ; aucune couleur libre n'est possible (c'est
   voulu — cohérence de la charte). Depuis le 17 sept. 2026, « sable » est un
   grège plus neutre (l'ancienne teinte tirait vers l'orange) : les pages qui
   l'utilisaient ont changé de teinte d'elles-mêmes, rien à refaire. **Le
   18 sept. 2026, la palette a été raffinée** : « ivoire » et « beige » sont
   désormais LES deux fonds chauds de la charte — un chaud très clair et un
   gris chaud. Là encore, les pages qui les utilisaient ont suivi toutes
   seules ; rien à refaire dans l'éditeur. **Le 21 sept. 2026, le site est
   passé aux fonds chauds** (maquette du designer) : la page elle-même est
   ivoire, les sections alternent **ivoire** et **beige**, et le **blanc est
   réservé aux cartes** posées sur ces fonds. Toutes les sections qui étaient
   « blanc » sont devenues « ivoire », toutes les « givre » sont devenues
   « beige » — rien à refaire. Règle simple pour une nouvelle section : laisser
   le fond proposé, ou alterner ivoire / beige avec la section voisine. Les dix
   teintes restent offertes, mais « blanc » et les gris froids (givre, perle,
   brume) tranchent maintenant sur le reste de la page : à réserver aux cas
   voulus. **Depuis le 21 sept. 2026, le sélecteur « Fond de section » existe
   sur TOUTES les sections à bande**, y compris celles de la page d’accueil
   (Nos services, Solution, Solutions phares, Ressources, Partenaires, Experts,
   bandeau ISO) et les cartes numérotées, colonnes de technologies, ligne du
   temps, encadré, outils exclusifs, grille d’expertise, ressources liées,
   bandeau de logos, vidéo et témoignage. Sur « cartes numérotées » et « ligne
   du temps », le fond peut rester vide : il suit alors le champ « Ton ».
   Seuls les héros (photo plein cadre), le bandeau défilant (sombre) et le
   catalogue de solutions n’en ont pas.
   **Bleu électrique (mis à jour le 22 sept. 2026 — `#1D46F3`, le code
   officiel de la marque)** : une onzième pastille, le bleu vif de
   la marque, s’ajoute — mais **seulement dans cinq sections** : texte enrichi,
   encadré, chiffres, bandeau de logos et FAQ. C’est un fond SOMBRE : ces cinq
   sections passent alors leurs titres et leurs textes en blanc toutes seules
   (les cartes, tuiles et panneaux posés dessus restent clairs). Les autres
   sections ne l’offrent pas, faute de savoir inverser leurs textes — demander
   à l’équipe technique pour en ajouter une. À utiliser comme un accent : une
   section bleue dans une page, pas trois.
   **Colonnes de technologies — lien du titre (facultatif)** : chaque colonne a
   un champ « Lien du titre ». Rempli (adresse complète, ex.
   `/fr/services/approvisionnement-ti/cisco/`), le titre devient un lien avec
   une flèche ; vide, rien ne change. C’est ce qui relie la page
   « Approvisionnement TI » à ses neuf pages fournisseurs.
   **Colonnes de technologies — lien sur un outil (facultatif)** : un item de
   la liste peut être écrit avec un lien, par exemple
   `<a href="/fr/ressources/ia-servicenow/">ServiceNow AI Platform</a>` ; le
   nom de l’outil devient alors cliquable. C’est ainsi que l’ancien site reliait
   « ServiceNow AI Platform » à son article. Sans balise, rien ne change.
   **Encart du bloc « Bento » (texte de l’encart)** : il accepte maintenant un
   lien ou du gras (`<a href="…">…</a>`, `<strong>`), comme le texte de la
   grande carte. Avant, une balise s’y affichait telle quelle.
   **Cartes témoignages — texte sous le titre (facultatif)** : une phrase sous
   le titre de la section ; les fiches fournisseurs y portent la note globale
   Gartner Peer Insights (« Note globale : 4,3 ⭐⭐⭐⭐ — 2 056 avis vérifiés en
   date de février 2026 »). La note et la date de chaque avis sont dans le
   champ « Rôle » de la carte, après le titre de poste.
5. **Icônes** : tous les champs « Icône » (cartes à icônes, tuiles bento et
   leur filigrane, réalisations, chiffres en style carte, puces d'offre, tuiles
   de valeurs, atouts…) ouvrent **la même liste déroulante** : la **banque de
   pictogrammes du site** au complet (34 au 2026-09-18), avec la **vignette**
   de chacun à côté de son nom, rangée par thème (personnes, affaires, idées,
   technologie, secteurs). N'importe quel pictogramme peut donc servir dans
   n'importe quelle section ; chaque section le dessine à sa taille et à son
   épaisseur de trait. Il manque un pictogramme ? Le demander à l'équipe
   technique : ajouté une fois à la banque, il apparaît dans toutes les listes.
   Depuis le 18 sept. 2026, la section « Cartes à icônes » pose le pictogramme
   **nu, en bleu** (la tuile bleu pâle a disparu) et ajoute un **compteur
   01 · 02 · 03** en haut à droite de chaque carte. L'interrupteur **« Afficher
   la numérotation »** (coché par défaut) permet de le retirer : à décocher
   quand la grille est un inventaire — la page Secteurs, par exemple — et non
   une démarche ordonnée.
   **Catalogue de solutions → Contact (18 sept. 2026).** Quand le lien d'une
   fiche mène à Contact, le bouton « Découvrir » préremplit trois champs : le
   sujet « Une solution du catalogue », la précision (nom de la solution) et
   **« Service »** — champ obligatoire qui restait vide auparavant. Le service
   vient du champ **« Contact — service présélectionné »** de la fiche ; vide,
   c'est celui réglé sur la page du catalogue (« Services applicatifs »).
   **Témoins (Loi 25).** Les pieds de page portent un lien **« Gérer mes
   témoins »** qui rouvre le bandeau de consentement pour changer d'avis ; son
   libellé s'édite dans « Textes du site » → Consentement (vide = lien masqué).
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

**Les espaces insécables, c'est le site qui s'en occupe** (2026-09-23). En
français, on met une espace avant `: ; ! ?` et autour des guillemets `« »`.
Avec une espace ordinaire, le navigateur a le droit de couper la ligne juste
avant le signe — et un « : » se retrouve seul en début de ligne, ce qui se voit
surtout dans les grands titres. **Tapez normalement, une espace simple** : au
moment d'afficher la page, le site la remplace par une espace insécable. Ça
vaut pour les titres et les textes des sections, et pour les articles du centre
de ressources. Rien à faire de votre côté, et rien à changer dans ce que vous
avez déjà écrit.

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

## Mettre en forme un article (bouton, encadré, FAQ, tableau, bandeau)

Depuis le **24 sept. 2026**, le corps d'un article connaît **cinq formes**
au-delà du texte courant, toutes rendues par le site (aucun réglage à faire,
aucune couleur à choisir). Elles se voient sur la page interne
`/fr/style-guide/forme-articles/` (site de travail). Les articles migrés de
WordPress ont été convertis à ces quatre formes le 24 sept.

Dans l'éditeur de contenu, chacune s'écrit **comme un bloc HTML** dans le
texte (l'éditeur l'affiche comme un bloc « HTML » et conserve ce qu'il y a
dedans). Pour en poser un : se placer sur une ligne vide, passer en
**source** (ou coller directement), et reprendre l'un des modèles ci-dessous
en remplaçant le texte. Laisser **une ligne vide** avant et après chaque
bloc, et une ligne vide entre la balise d'ouverture et le texte : c'est ce
qui permet de garder du Markdown (gras, liens, listes) à l'intérieur.

**1. Bouton d'appel à l'action** — un lien seul sur sa ligne, avec la
classe `btn` (plein) ou `btn-outline` (contour) :

```html
<a class="btn" href="/fr/contact/">Parlez à un expert</a>
```

**2. Encadré « Le saviez-vous »** :

```html
<aside class="article-encadre">
<p class="article-encadre__titre">Le saviez-vous ?</p>

**10 millions d'euros.** C'est l'amende maximale en cas de non-conformité.

</aside>
```

**3. Question dépliante (FAQ)** — une par question, à la suite :

```html
<details class="article-faq">
<summary>Qu'est-ce que la réglementation DORA ?</summary>

La réponse, en Markdown ordinaire.

</details>
```

**4. Tableau** — toujours dans son conteneur (il défile sur téléphone au lieu
de casser la page) ; la première ligne est l'en-tête :

```html
<div class="article-tableau">
<table>
<thead>
<tr><th>Critère</th><th>Option A</th><th>Option B</th></tr>
</thead>
<tbody>
<tr><td>Intégration</td><td>Non</td><td>Oui</td></tr>
</tbody>
</table>
</div>
```

**5. Bandeau d'appel à l'action** — un panneau complet (surtitre
facultatif, titre, texte, un ou deux boutons) sur un fond, comme la section
« Appel à l'action » des pages. Le surtitre et le titre restent des `<p>` (pas
des titres) ; les boutons vont sur UNE seule ligne, séparés par une espace :

```html
<div class="article-cta">
<p class="article-cta__surtitre">Cybersécurité</p>
<p class="article-cta__titre">Évaluez votre posture de sécurité</p>

Nos experts analysent vos pratiques et vous remettent un plan d'action priorisé.

<a class="btn" href="/fr/contact/">Parlez à un expert</a> <a class="btn-outline" href="/fr/services/cybersecurite/">Voir le service</a>

</div>
```

Pour le fond **bleu nuit** (textes en blanc, choisis par le site) : remplacer
la première ligne par `<div class="article-cta article-cta--marine">`. Pas de
surtitre = supprimer sa ligne ; un seul bouton = un seul lien.

À ne pas faire : mettre des couleurs ou des `style="…"` dans ces blocs (le
site les ignore ou les rejette), ou écrire un bouton avec l'ancienne classe
`article-cta` sur un lien (`<a class="article-cta">` : convertie en `btn`, plus
stylée — ce nom désigne maintenant le bandeau du modèle 5, sur un `<div>`). Un bouton « Insérer » dans la barre
d'outils de l'éditeur (snippets CloudCannon) est à l'étude : CloudCannon
n'offre pas encore de gabarit de snippet pour du HTML dans un article
Markdown — voir `docs/plan-forme-articles.md`.

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

## Choisir les 3 articles de la page d’accueil

La bande « Ressources et actualités » de l’accueil montre par défaut les
**trois articles les plus récents**, automatiquement. Depuis le 2026-09-23,
vous pouvez choisir lesquels.

**Accueil** → section « Ressources et actualités » → champ **« Articles en
vedette (optionnel) »**. Ajoutez une entrée par article, dans l’ordre où vous
voulez les voir. La valeur à écrire est le **nom de fichier de l’article, sans
son extension** — par exemple `certification-iso-27001-iso-9001`. C’est le nom
qui apparaît dans la liste du **Centre de ressources**, côté français.

Trois choses qui évitent les mauvaises surprises :

- **Une seule liste pour les deux langues.** Le nom de fichier est le même en
  français et en anglais ; chaque version de l’accueil affiche automatiquement
  sa propre traduction de l’article, avec son titre et son adresse anglaise.
  Vous n’avez donc rien à recopier dans l’accueil anglais — mais pensez à y
  poser la même liste si vous partez d’une page vierge.
- **Une faute de frappe ne casse rien.** Un nom introuvable est simplement
  ignoré, et la grille se complète avec les articles les plus récents. Vous
  aurez toujours trois cartes.
- **Laissez le champ vide** pour revenir au comportement automatique.

**Les images de couverture.** Ce sont celles de l’article lui-même (champ
« Image de couverture »). Attention si le visuel porte du **texte** : une
image fabriquée en français ne convient pas à l’article anglais, il en faut
une par langue. Les trois visuels posés le 2026-09-23 (certifications ISO,
IA et ServiceNow, mise en place d’un SOC) sont dans ce cas : ils sont posés
sur les articles **français** seulement, les anglais gardent leur couverture
précédente. Le bon format est **1200 × 750** (le cadre des cartes) : une image
plus large se fait rogner sur les côtés, et le texte avec.

## Modifier le menu

**Navigation** dans la barre latérale : un fichier par langue (`fr` / `en`).

- **Menu principal** : libellés, liens et ordre des entrées d'en-tête.
- **Méga-menu** : les colonnes du sous-menu Services (titres, liens, icône
  parmi la liste proposée). Un lien peut viser une **page Services** par son
  identifiant (champ « Service ») au lieu d'une adresse : le site calcule
  l'adresse et refuse de publier si la page n'existe pas.
- **Bouton « Portail client »** : libellé et visibilité.
- **Sur téléphone** (depuis le 2026-09-24), le menu est un tiroir où chaque
  entrée qui a un sous-menu (Expertises, Services, Produits, Ressources) se
  déplie d'un toucher : d'abord le lien de la page elle-même, puis les liens
  de sa colonne du méga-menu ; Ressources déplie le lien vers le centre puis
  les catégories du blogue. Rien à configurer — ce sont les mêmes colonnes
  et les mêmes libellés que sur grand écran. Seule différence : la carte
  « mise en avant » et le bandeau du bas du méga-menu ne sont pas repris sur
  téléphone.

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
  sujet / service présélectionné**) ; laissés vides, ils donnent depuis le
  22 sept. 2026 le repli « Un projet » + « Autre » — et non plus deux listes
  vides, alors qu'elles sont obligatoires (le libellé du bouton et la page
  d'origine, eux, ont toujours été transmis).

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
  et Pages générales), permettent de forcer un autre choix. Si une option des
  listes est renommée sur la page Contact, le préremplissage correspondant
  cesse silencieusement (jamais d'erreur) — prévenir l'équipe technique pour
  réaligner.
  **Les deux listes n'arrivent plus jamais vides** (depuis le 22 sept. 2026) :
  laisser ces deux champs vides ne donne plus un formulaire à moitié rempli,
  mais le repli « Un projet » + « Autre » — c'est vrai partout, y compris sur
  l'accueil, une campagne, un article et le centre de ressources, qui n'ont pas
  ces champs. Vous n'avez donc rien à faire pour qu'un bouton fonctionne ; les
  remplir sert à faire MIEUX que le repli, pas à le réparer. Un contrôle
  automatique (`npm run check:prefill`, à chaque build) refuse désormais tout
  bouton du site qui arriverait sur une liste obligatoire vide.
- **Carrières** — depuis le 17 sept. 2026, une page de **Pages générales**
  (`fr/carrieres`, `en/carrieres`) composée de sept sections, éditables dans
  l'éditeur visuel comme les autres pages : **héros photo** (photo, titre,
  sous-titre, bouton « Postulez »), **carte distinction** (Happy At Work :
  insigne, titre, chapeau, citation à liseré ; depuis le 21 sept. 2026 le
  champ **« Insigne de la distinction »** accepte le VRAI logo de la
  certification — téléversé dans `images/carrieres`. Laissé vide, la carte
  retombe sur le pictogramme « étoile » dessiné par le gabarit), **tuiles de valeurs** (surtitre,
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

**Accueil, « Nos services » — un lien visible sur CHAQUE tuile (21 sept.
2026).** Les tuiles en peau « image » (Cybersécurité, Infonuagique) affichent
désormais le même lien que les autres (« Découvrez le service → ») : il vient
du champ **« Libellé du bouton des cartes »** de la section, ou du champ
**« Libellé du lien (surcharge) »** de la tuile quand il est rempli. Comme
avant, toute la tuile reste cliquable.

**Centre de ressources — en-tête allégé (21 sept. 2026).** La page
`/ressources` n'a plus de grande bannière : il reste le titre (dont la fin
passe en bleu) et le chapeau, sur le fond ivoire, puis les filtres et la
grille d'articles. Deux champs ont disparu de « Pages système → Centre de
ressources » parce que plus rien ne les affichait : le bouton **« S'abonner à
l'infolettre »** (l'inscription se fait dans la carte infolettre de la grille,
toujours là) et la **carte décorative** (« 500+ Experts »). Le reste — titre,
fin de titre en bleu, chapeau, recherche, carte infolettre, bandeau d'appel à
l'action — s'édite comme avant. Les gris froids de la page ont été remplacés
par les fonds chauds de la charte (ivoire, beige) et les cadres par le
contour standard.

**Bannière de l'accueil — « Photo de fond » (corrigé le 21 sept. 2026).**
Jusqu'à cette date, une photo téléversée sur la bannière de l'accueil (ou sur
la section « Accueil — Solution ») était rangée à un endroit que le site ne
sert pas : l'éditeur affichait bien la nouvelle image, mais la page publiée
gardait l'ancienne, même après reconstruction. Les téléversements atterrissent
désormais dans `images/home`, comme pour les autres sections. Une photo
téléversée AVANT le correctif est à re-téléverser une fois.

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

### Chaque solution a maintenant sa page (2026-09-23)

« Découvrir » ne saute plus au formulaire de contact : il mène à la **page de
la solution** (`/fr/solutions/<nom-du-fichier>/`), où le visiteur trouve la
présentation, les informations clés, les captures d'écran et le formulaire.

- **La page se compose comme les autres**, dans **Solutions (FR)** → une fiche
  → éditeur visuel. Elle est faite de sections : héros produit, « En bref »
  (client, coût, délai, technologies), galerie d'images, formulaire.
- **Le champ « Lien de la carte » est maintenant une SURCHARGE.** Laissez-le
  **vide** : « Découvrir » ira sur la page de la solution. Ne le remplissez que
  pour envoyer ailleurs — c'est le cas d'**Ø Bureau**, dont la page de service
  est plus riche que sa fiche.
- **Une fiche sans section n'a pas de page** : sa carte reste dans le
  catalogue, et son lien doit alors être rempli (sinon la carte n'a pas de
  bouton). C'est l'état des **9 fiches anglaises** : elles continuent de mener
  au formulaire de contact prérempli, en attendant leur traduction. Depuis le
  23 septembre, ces fiches (**Solutions (EN)**) affichent les mêmes champs que
  les françaises — sections, adresse de la page, SEO, préremplissage du
  Contact : la traduction se fait donc au CMS, sans développeur, en posant des
  sections sur la fiche anglaise.
- **Adresse de la page (slug)** : minuscules, chiffres et traits d'union. Ce
  que vous tapez est normalisé automatiquement (accents retirés, espaces et
  majuscules converties) ; vide = le nom du fichier. **Deux fiches d'une même
  langue ne peuvent pas partager la même adresse** : la publication est
  bloquée avec un message qui nomme les deux fiches — corriger l'une des deux.
- **Les 16 fiches françaises sont masquées des moteurs de recherche**
  (« Masquer des moteurs de recherche » activé) : elles affichent des
  fourchettes de prix que Ø Studio doit valider. À décocher fiche par fiche
  quand le contenu est validé.
- **Le formulaire de la page dit de quelle solution il s'agit** : son champ
  caché « Page d'origine » porte le nom de la solution et l'adresse de sa page.
  Rien à configurer.
- **Les textes de remplacement des images sont provisoires** (voir « Galerie
  d'images ») : la liste à réécrire est dans
  `docs/migration/catalogue-ostudio.md`.
- Le catalogue est accessible aux visiteurs par **« Catalogue de solutions »**
  dans la colonne Produits du méga-menu et du pied de page.

## Galerie d'images (nouvelle section, 2026-09-23)

**« Galerie d'images »** dans le sélecteur « Ajouter une section » : une grille
de visuels que le visiteur **agrandit d'un clic**. C'est la seule section qui
accepte une liste d'images libre — elle est faite pour montrer des captures
d'écran d'application (les fiches du catalogue Ø Studio), mais elle marche sur
n'importe quelle page à sections.

Ce que vous remplissez :

- **Titre** et **Introduction** : optionnels. Vides, la grille commence
  directement.
- **Colonnes (grand écran)** : 2, 3 ou 4 images par rangée. Sur téléphone, la
  grille passe toujours à **une seule colonne** — inutile de s'en occuper.
- **Fond de section** : la palette habituelle.
- **Images** : autant que vous voulez, dans l'ordre d'affichage. Pour chacune :
  - **Image** — le visuel. Il est toujours montré **en entier**, jamais rogné :
    une capture en format portrait passe aussi bien qu'un paysage.
  - **Texte de remplacement (alt)** — ce que l'image **montre**, en une phrase,
    pour qui ne la voit pas (lecteur d'écran, image qui ne charge pas). Ne pas
    répéter le titre de la page. À laisser vide **seulement** si l'image est
    purement décorative.
  - **Légende** — optionnelle, affichée sous l'image pour tout le monde.

**Les images importées du catalogue Ø Studio ont un texte de remplacement
provisoire** (« Capture d'écran de l'application — … ») : la source n'en avait
aucun. La liste complète à réécrire est dans
`docs/migration/catalogue-ostudio.md` ; chacune se corrige directement dans la
section, au CMS.

**L'agrandissement, et ce qu'il ne fait pas.** Un clic sur une vignette ouvre
l'image en grand par-dessus la page, avec « Image précédente / suivante » et un
bouton **« Fermer »**. C'est fait sans une ligne de script (le site n'en charge
aucun pour cela) — en contrepartie : la touche **Échap ne ferme pas**, il faut
le bouton « Fermer » (qui est le premier élément atteignable au clavier), et la
page continue de défiler derrière. C'est un choix assumé, pas un oubli.

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

**La page d'accueil aussi, depuis le 2026-09-23.** Elle était la seule page du
site sans titre ni description modifiables : son onglet affichait « Victrix »
tout court, et la description servie à Google était écrite dans le code, hors
de votre portée. Ouvrez **Accueil** dans CloudCannon : deux champs
apparaissent en haut, **« Titre SEO (onglet et résultats Google) »** et
**« Description (moteurs de recherche) »**. Ils sont préremplis avec les
textes de l'ancien site, pour ne rien perdre du référencement acquis. Comme
partout, « — Victrix » est ajouté automatiquement à la fin du titre : ne
l'écrivez pas. Vider un des deux champs ne casse rien — un texte de repli
prend le relais.

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

**Les anciennes adresses du site WordPress sont déjà couvertes** (2026-09-22) :
175 redirections ont été écrites automatiquement, une par ancienne URL —
articles, pages, expertises, anciennes adresses encore en ligne. Vous n'avez
rien à saisir pour elles, et elles n'apparaissent pas dans votre liste (elles
sont maintenues par l'équipe technique). Votre liste reste **prioritaire** : si
vous saisissez une règle pour une adresse déjà couverte, c'est la vôtre qui
s'applique.

Neuf articles ont aussi retrouvé l'adresse qu'ils ont **aujourd'hui sur
victrix.ca** (les « Meilleures pratiques en sécurité opérationnelle », le SOC
externalisé et le ZTNA) : leur adresse sur le nouveau site est désormais la
même, et les deux anciennes versions redirigent vers elle.

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

### Icône ou logo sur les cartes (2026-09-22)

Quatre sections acceptent désormais un **visuel** par carte. Deux voies, au
même endroit, et **le logo l'emporte quand les deux sont remplis** :

- **Pictogramme** — une liste fermée, toute la banque du site.
- **Logo** — un fichier, pour une marque que la banque ne peut pas dessiner.

| Section | Ce qui a changé |
| --- | --- |
| **Cartes numérotées** | N'avait **aucun** visuel — elle en accepte un. C'est la section la plus posée du site (76 sections, 357 cartes). |
| **Boîtes de domaines** | Chaque boîte avait un simple libellé ; elle devient un vrai bloc avec libellé + pictogramme + logo. |
| **Cartes à icônes** | Le pictogramme y était déjà ; le logo s'ajoute. **Corrigé le 2026-09-23** : le champ Logo existait dans l'éditeur depuis le 22/09, mais la section ne l'affichait pas — un logo déposé restait invisible sur la page. Il s'affiche maintenant. |
| **Bento (chiffres clés)** | Sa carte de droite accepte un logo — c'est ce qui manquait à l'insigne HappyIndex® AtWork de la page Découvrir. |

**Les logos de nos partenaires sont déjà là.** 19 fichiers ont été rapatriés de
l'ancien site dans `/images/logos/` : Microsoft, AWS, Azure, Amazon, Cisco,
Check Point, CrowdStrike, Palo Alto, Red Hat, OpenShift, Aruba, Imprivata,
Pulse Secure, ServiceNow, Ø Studio, et les insignes de partenariat Microsoft
Dynamics, Microsoft FastTrack et AWS. Ils apparaissent dans le sélecteur
d'image, vous n'avez rien à téléverser.

**Quatre de plus le 2026-09-23** — AlgoSec, Proofpoint, OVHcloud et le logo
ServiceNow simple (l'insigne de partenariat existait déjà, pas le logo de la
marque) : ils figuraient bien dans la médiathèque de l'ancien site, sur le
carrousel de l'accueil, et ont été rapatriés avec lui. **Manquent encore** :
ZScaler et Juniper — à demander au marketing.

**Boîtes de domaines : un logo posé remplace le libellé à l'écran**
(2026-09-23). Écrire « Palo Alto » sous le logo Palo Alto disait deux fois la
même chose. Désormais, dès qu'une boîte a un logo, **seul le logo s'affiche** —
le libellé devient son **texte de remplacement** : invisible à l'écran,
toujours lu par les lecteurs d'écran et les moteurs de recherche. **Remplissez
donc le libellé dans tous les cas.** Une boîte **sans** logo n'a pas changé :
son libellé reste affiché (c'est le cas d'AlgoSec, Proofpoint, ZScaler et
Juniper sur la page Cybersécurité, et de toutes les sections purement
textuelles comme « Notre approche »). C'est déjà ainsi que fonctionne le
**bandeau de logos** de l'accueil.

Les trois autres sections (cartes numérotées, cartes à icônes, bento)
n'ont pas changé : leur titre n'est pas le nom de la marque, il porte du sens
en plus du logo.

**Texte de remplacement** : à laisser **vide** presque toujours — c'est le
libellé qui sert. Ne le remplissez que si le logo montre autre chose que le nom
(ex. « Partenaire certifié ServiceNow »).

### Un seul bleu dans la palette (2026-09-22)

Les codes officiels de la marque sont arrivés : **bleu nuit `#000D2E`** et
**bleu électrique `#1D46F3`**. Ils ont montré que la maquette de la veille
était fautive — les deux aplats bleus qu'elle avait fait apparaître dans votre
liste, « Bleu Victrix » et « Bleu électrique », étaient deux versions
**erronées du même bleu**.

Il n'en reste donc qu'un : **Bleu électrique**. « Bleu Victrix » a disparu de
la liste « Fond de section ». **Aucune de vos pages n'est touchée** : aucune
section n'utilisait l'un ou l'autre. Le bleu vif du site — boutons, liens,
pictogrammes — a légèrement changé de teinte au passage ; c'est normal, c'est
la bonne couleur de marque.

**Pourquoi les bleus n'apparaissent pas dans toutes les listes ?** Parce qu'un
fond sombre oblige la section à écrire ses textes en blanc, et toutes ne
savent pas le faire. Dix sections l'acceptent aujourd'hui :

| Depuis le 21/09 matin | Ajoutées le 21/09 soir |
|---|---|
| Texte enrichi · Encadré · Chiffres · Bandeau de logos · FAQ | Nos experts · Atouts · Tuiles de valeurs · Encadrés à puces · Texte & photo |

Les autres n'offrent que les dix teintes claires. Si vous en voulez une de
plus en bleu, demandez-le : c'est une petite intervention par section, jamais
un réglage à faire vous-même.

Les boutons, les liens et les icônes de tout le site suivent le nouveau bleu
automatiquement : vous n'avez rien à faire.

### La page Contact a été redessinée (2026-09-21)

D'après la maquette du designer. Trois choses y reviennent :

- un **surtitre** au-dessus du titre (« Nous joindre ») — nouveau champ dans
  Textes du site → Contact, vide = pas de surtitre ;
- les **numéros de chaque bureau** sous les coordonnées générales ; ils sont
  repris automatiquement des fiches de bureaux, rien à saisir ;
- les cartes sont **blanches sur une bande beige** (c'était l'inverse).

Le bouton du formulaire affiche maintenant « Envoyer le message » partout : il
disait « Soumettre » sur la page alors que le formulaire lui-même annonçait
« Envoyer le message ».

### Un seul formulaire de demande (2026-09-21)

Toutes les demandes passent désormais par **la page Contact**. La page
Cybersécurité hébergeait un second formulaire (« évaluation de posture de
sécurité ») : deux collectes séparées, deux consentements, et des
renseignements qu'on ne retrouvait nulle part ailleurs. Il a été remplacé par
la section **« Renvoi vers le contact (qualification) »**.

Cette section pose UNE question — la taille de l'entreprise — sous forme de
boutons. Le visiteur en choisit un et arrive sur le formulaire Contact **déjà
rempli** : le sujet, le service, sa tranche d'effectif et l'objet de sa
demande. Vous y réglez le titre, le texte, la question, le fond et le lien
vers la page Contact. **Les tranches d'effectif, elles, ne sont pas
modifiables** : leurs libellés voyagent dans l'adresse et doivent rester
identiques à ceux du formulaire — les reformuler d'un seul côté couperait le
préremplissage sans que rien ne le signale. Pour les faire changer, passez
par l'équipe technique.

Vous pouvez poser cette section sur n'importe quelle page. Pensez à mettre le
**lien du formulaire Contact** dans la bonne langue (`/fr/contact` ou
`/en/contact`) : c'est lui qui décide de la langue des tranches affichées.

**« Taille de l'entreprise » dans le formulaire Contact** : ce champ
n'apparaît que lorsque le visiteur choisit le service **Cybersécurité** — le
formulaire reste court pour tout le monde. Il est **facultatif** : il qualifie
la demande sans retenir quelqu'un qui pose une simple question. Vider son
libellé (Textes du site → Contact) le retire complètement du formulaire.

**« Service » n'arrive plus jamais vide.** C'est un champ obligatoire, et
certains boutons y menaient sans rien présélectionner — « Postuler », depuis
la page Carrières, en particulier. Désormais : le sujet « Une carrière »
choisit tout seul le service **Ressources humaines** (option ajoutée le même
jour), et toute page sans correspondance arrive sur **Autre**. Vous n'avez
rien à faire ; si une page mérite un service précis, fixez-le dans son champ
« Service (préremplissage du Contact) ».

**Le formulaire montre ce qui reste à remplir** (depuis le 22 sept. 2026).
À l'arrivée, les champs **obligatoires encore vides** portent un halo bleu
discret, qui s'éteint dès que le champ est rempli. Ce n'est pas un message
d'erreur : rien n'est signalé comme fautif, on indique simplement le chemin.
Concrètement, un visiteur venu d'un bouton du site voit **quatre** champs
surlignés (prénom, nom, courriel, message — les deux listes étant déjà
choisies) et un visiteur arrivé par le menu ou le pied de page en voit
**six**. Rien à régler au CMS : le halo suit la valeur des champs, pas le
chemin d'arrivée.

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
- **Corrigé le 24 sept. 2026** : le site de production de cette plateforme
  ne montre plus ni les brouillons ni les contenus à date future (il ne les
  a d'ailleurs jamais servis publiquement — son adresse de test n'est pas
  indexée). Seuls l'aperçu de l'éditeur et l'adresse de test du site de
  travail les montrent. (Reste une case à cocher côté technique dans les
  réglages de build CloudCannon — voir `docs/operations.md` § 6.)

## Un champ vidé ne casse plus le site

Depuis le **22 sept. 2026**, effacer le contenu d'un champ ne fait plus échouer
la publication : le texte disparaît simplement du site, et la page se
réorganise autour de lui — un titre de bloc vidé retire le titre, pas
l'espace ; une méta description vidée retombe sur celle du site ; une puce ou
une ligne d'adresse vidée n'apparaît plus dans sa liste. Vous pouvez donc vider
un champ pour voir, et revenir en arrière.

**Pourquoi c'est écrit ici.** Le 18 sept., une méta description effacée sur la
page de confirmation a bloqué la publication pendant **20 sauvegardes
d'affilée** : plus rien de ce que vous enregistriez n'arrivait sur le site, et
le message d'erreur ne disait pas quel champ était en cause. Un test
automatique vide maintenant, à chaque intégration, **chaque champ de chaque
fichier** et refuse tout champ qui ne supporterait pas le vide.

**Les champs qui refusent encore le vide** — et c'est voulu, parce que sans eux
l'élément n'existe plus vraiment :

| Ce que vous videz | Ce qui se passe |
|---|---|
| L'**adresse** d'un lien (menu, pied de page, bouton) | Refusé : un lien sans destination ne mène nulle part. |
| Le **texte** d'un lien ou d'un bouton | Refusé : le bouton deviendrait invisible pour un lecteur d'écran. Y compris le numéro de téléphone du pied de page, qui EST le texte de son lien. |
| Le **titre de la page** ou son **titre d'onglet** | Refusé : c'est ce que voient Google et les onglets du navigateur. |
| Les **intitulés du formulaire Contact** et les **options de ses listes** | Refusé : ils forment le contrat avec le serveur qui reçoit les messages. |
| Le **nom d'une barre d'annonce** | Refusé : c'est ce qui vous permet de la retrouver dans la liste. |

Dans tous ces cas, CloudCannon vous le dit **à la sauvegarde**, en nommant le
champ — et rien n'est publié à moitié.

**Et les menus déroulants ?** (22 sept. 2026) Même tranquillité. Effacer un
choix dans une liste — « Fond de section », « Variante », « Ton », « Nombre de
colonnes », « Style de titre », le type d'un champ de formulaire — **remet la
section à son réglage d'origine**, celui qu'elle avait avant que quelqu'un y
touche. Rien ne casse, rien n'est publié de travers : la section revient
simplement à son apparence par défaut, et vous pouvez rechoisir ensuite.

Deux exceptions à connaître :

- **Le pictogramme et le fond « au choix du bloc »** ne changent pas de
  comportement : chez eux, « vide » est un vrai choix (« aucune icône »,
  « le fond habituel de ce bloc »), et il est respecté tel quel.
- **Le type d'un champ de formulaire qui en commande un autre** (par exemple
  « Votre besoin », dont dépend l'affichage de « Précisez votre besoin ») ne
  peut pas être vidé : un champ qui en commande un autre doit rester une liste
  déroulante ou une case à cocher. CloudCannon vous le dira en nommant le champ
  et la condition à réajuster.

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
| Icônes (toutes les sections à icône) | UNE banque de pictogrammes dessinée pour le site, la même liste partout — la liste montre la vignette de chacun |
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
