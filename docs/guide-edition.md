# Guide de l'éditeur — publier sur le site Victrix

> Pour l'équipe marketing. Version du **14 juillet 2026** (prototype
> `spike/cloudcannon`). Le principe à retenir : **vous éditez le contenu, les
> gabarits garantissent la forme** — vous ne pouvez pas casser la mise en page.
> Captures d'écran à ajouter.

## Se connecter

1. Ouvrir CloudCannon (l'URL du site « Vic-demo » vous est partagée par
   l'équipe technique, avec votre invitation).
2. La barre latérale gauche liste les contenus éditables : **Blogue, Accueil,
   Expertises, Campagnes, Navigation, Redirections**.

> 💡 Chaque sauvegarde crée une version dans l'historique Git : tout est
> traçable et réversible. Personne ne peut « perdre » le site.

## Modifier un article de blogue

1. **Blogue** → choisir l'article. Chaque article existe en deux fichiers
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
4. **Save** → l'article part en publication (en ligne en quelques minutes).

## Créer un article

1. **Blogue** → **+ Ajouter** → choisir le gabarit **FR** ou **EN**.
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
3. **+ Ajouter une section** propose la palette : **Héros, Bénéfices, FAQ,
   Formulaire, Appel à l'action, Témoignage, Bandeau logos partenaires,
   Victrix en chiffres, Vidéo** (+ les sections d'accueil). Glisser pour
   réordonner; chaque section a ses champs (textes, boutons, questions…).
   Une page de démonstration des nouvelles sections existe :
   `/fr/campagnes/demo-sections/`.
4. Par défaut la page est **non indexée** (invisible des moteurs de recherche —
   voulu pour les campagnes). L'interrupteur « noindex » est là si une page
   doit un jour être indexée.
5. **Save** → en ligne en quelques minutes à `/fr/campagnes/<nom>/`.

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
- **Méga-menu** : les colonnes du sous-menu Expertises (titres, liens, icône
  parmi la liste proposée).
- **Barre d'annonce** : textes, lien, et l'interrupteur **Affichée** pour la
  masquer complètement.
- **Bouton « Portail client »** : libellé et visibilité.

> ⚠️ Les liens de navigation s'écrivent **sans** préfixe de langue
> (`/contact`, pas `/fr/contact`) — le site ajoute `/fr` ou `/en` tout seul.
> C'est l'inverse des boutons de sections (qui prennent l'adresse complète);
> les infobulles des champs le rappellent. Un lien mal formé bloque la
> publication avec un message clair, comme pour les redirections.

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
page « Merci ». Les champs (nom, courriel, message…) se composent dans la
section, comme le reste.

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

## Ce qu'il ne faut pas toucher

- Le dossier `public/admin/` (l'ancien éditeur, en cours de retrait) et les
  fichiers techniques à la racine — l'éditeur ne vous les propose pas, c'est
  voulu.
- Les **noms de fichiers** des contenus existants (ils apparient FR ⇄ EN).
  Pour changer une adresse publique, utiliser le champ **Slug** + une
  redirection.
