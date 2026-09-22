import { readdirSync, readFileSync } from 'node:fs';
import { join, relative } from 'node:path';
import { describe, expect, it } from 'vitest';
import {
  CIBLES,
  HORS_COLLECTION,
  ROOT,
  chaines,
  fichiersJson,
  normaliser,
  schemaDe,
  videA,
} from '../tests/helpers/contenu-editable';

/**
 * UN CHAMP VIDÉ NE CASSE PLUS LE SITE (2026-09-22, lot L01).
 *
 * L'incident : le 18 sept. 2026, `merci.metaDescription` vidée dans CloudCannon
 * a mis `staging` au rouge pendant 20 sauvegardes d'affilée — plus rien de ce
 * que Julie enregistrait n'était publié, pour une méta description. La cause
 * n'était pas le `null` du CMS (réglé en sept. par `nullsToEmpty`) mais le
 * `.min(1)` qui refusait la chaîne vide juste après.
 *
 * Ce test vide TOUR À TOUR chaque chaîne de chaque fichier de `src/data` et de
 * `src/content/pages`, revalide contre le schéma RÉEL de `src/content.config.ts`
 * et échoue en nommant le fichier et le champ. Deux directions, pour que la
 * liste ci-dessous ne pourrisse pas :
 *
 *  1. un champ qui refuse le vide SANS être déclaré structurel → ÉCHEC (c'est
 *     un build rouge en attente, celui de l'incident) ;
 *  2. un champ déclaré structurel qui accepte désormais le vide → ÉCHEC aussi
 *     (l'entrée est périmée, elle ment sur le contrat).
 *
 * La règle qui décide de la liste est écrite en tête de `src/content.config.ts`
 * (« QUAND GARDER `.min(1)` ») : reste structurel ce qui, vidé, produirait un
 * élément SANS NOM ACCESSIBLE ou SANS DESTINATION.
 *
 * Hors périmètre, décidé au lot : la collection `landing` (contrat gelé) et les
 * collections de pages rédigées (`blog`, `services`, `solutions`, `home`), dont
 * les champs ne sont pas le sujet de l'incident.
 */

/**
 * CHAMPS STRUCTURELS — la chaîne vide y est refusée À DESSEIN.
 *
 * Clé = chemin dans le fichier, indices de tableau réduits à `[]`. Regroupés
 * par la raison qui les garde (voir la règle en tête de content.config.ts) ;
 * une entrée sans raison lisible n'a pas sa place ici.
 */
const STRUCTURELS: Record<string, string> = {
  // --- 1. Destinations : vidé, le lien ne mène nulle part --------------------
  'items[].href': 'destination d’une entrée du menu principal',
  'items[].service': 'cible d’une entrée de menu par référence de service',
  'cta.href': 'destination du bouton d’action de l’en-tête',
  'mega.parentHref': 'entrée de menu sous laquelle le panneau s’ouvre',
  'mega.parentHrefs[]': 'entrée de menu SUPPLÉMENTAIRE ouvrant le même panneau',
  'mega.columns[].href': 'destination de la tête de colonne (c’est un lien)',
  'mega.columns[].links[].href': 'destination d’un lien du panneau',
  'mega.columns[].links[].service': 'cible d’un lien du panneau par référence de service',
  'mega.featured.href': 'destination du bloc en vedette',
  'mega.stripe.links[].href': 'destination d’un lien du bandeau',
  'megaRessources.parentHref': 'entrée de menu du panneau Ressources',
  linkHref: 'destination de la bannière d’annonce',
  'footer.columns[].links[].href': 'destination d’un lien du pied de page',
  'footer.phoneHref': 'numéro composable du lien tel:',
  'footer.email': 'adresse du lien mailto: du pied de page',
  'footer.contactCta.href': 'destination de la puce du pied de page',
  'footer.social[].href': 'destination d’un lien social',
  'footer.legal[].href': 'destination d’un lien légal',
  'consent.policyHref': 'destination de la politique de confidentialité',
  'notFound.links[].href': 'sortie de la page 404',
  'ressources.cta.primaryHref': 'destination du bouton principal du bandeau',
  'ressources.cta.secondaryHref': 'destination du bouton secondaire du bandeau',
  'merci.links[].href': 'sortie de la page de confirmation',

  // --- 2. Intitulés de commandes : vidé, la commande n'a plus de nom --------
  'items[].label': 'intitulé d’une entrée du menu principal',
  'portal.label': 'intitulé du lien vers le portail',
  'cta.label': 'intitulé du bouton d’action de l’en-tête',
  'mega.columns[].title': 'intitulé de la tête de colonne, qui est un lien',
  'mega.columns[].links[].label': 'intitulé d’un lien du panneau',
  'mega.featured.ctaLabel': 'intitulé du bouton du bloc en vedette',
  'mega.stripe.links[].label': 'intitulé d’un lien du bandeau',
  'megaRessources.ctaLabel': 'intitulé du bouton du panneau Ressources',
  'fr.linkLabel': 'intitulé du lien de la bannière (FR)',
  'en.linkLabel': 'intitulé du lien de la bannière (EN)',
  'footer.columns[].links[].label': 'intitulé d’un lien du pied de page',
  'footer.phone': 'TEXTE du lien tel: — vidé, le lien n’a plus de nom',
  'footer.contactCta.label': 'intitulé de la puce du pied de page',
  'footer.social[].label': 'intitulé d’un lien social',
  'footer.legal[].label': 'intitulé d’un lien légal',
  'consent.policyLabel': 'intitulé du lien de la politique',
  'consent.accept': 'intitulé du bouton « accepter »',
  'consent.refuse': 'intitulé du bouton « refuser »',
  'notFound.links[].label': 'intitulé d’une sortie de la 404',
  'merci.links[].label': 'intitulé d’une sortie de la confirmation',
  'ressources.filterAll': 'intitulé du filtre « tout »',
  'ressources.readMore': 'intitulé du lien « lire la suite »',
  'ressources.searchPlaceholder': 'rendu en sr-only : LIBELLÉ du champ de recherche',
  'ressources.newsletter.emailPlaceholder': 'rendu en sr-only : LIBELLÉ du champ courriel',
  'ressources.newsletter.submitLabel': 'intitulé du bouton d’abonnement',
  'ressources.cta.primaryLabel': 'intitulé du bouton principal du bandeau',
  'ressources.cta.secondaryLabel': 'intitulé du bouton secondaire du bandeau',
  'ressources.eyebrow': 'nom de la section dans le fil d’Ariane des articles et le flux RSS',
  submit: 'intitulé du bouton d’envoi du formulaire Contact',
  submitLabel: 'intitulé du bouton d’envoi d’un formulaire (définition)',
  consentText: 'LIBELLÉ de la case de consentement, qui est obligatoire',
  'subjectOptions[]': 'option de la liste blanche « sujet » (comparée au build)',
  'expertiseOptions[]': 'option de la liste blanche « service » (comparée au build)',
  'companySizeOptions[]': 'option de la liste blanche « taille d’entreprise »',

  // --- 3. aria-label : vidé, le repère perd son nom accessible --------------
  'mega.ariaLabel': 'nom accessible du panneau du méga-menu',
  'megaRessources.ariaLabel': 'nom accessible du panneau Ressources',
  'footer.columns[].title': 'nom accessible du repère <nav> de la colonne, en plus du <h2>',
  'footer.contactTitle': 'nom accessible du repère <nav> Contact, en plus du <h2>',

  // --- 4. Titre de la page : son <h1> et son <title> -----------------------
  'notFound.metaTitle': '<title> de la page 404',
  'notFound.title': '<h1> de la page 404',
  metaTitle: '<title> de la page Contact',
  heroTitle: '<h1> de la page Contact',
  'ressources.title': '<h1> du centre de ressources',
  'recherche.metaTitle': '<title> de la page de recherche',
  'recherche.title': '<h1> de la page de recherche',
  'merci.metaTitle': '<title> de la page de confirmation',
  'merci.title': '<h1> de la page de confirmation',
  title: 'identifiant de la bannière dans la LISTE du CMS — vidé, l’éditrice ne s’y retrouve plus',

  // --- 5. Contrat des formulaires ------------------------------------------
  // Le `name` HTML de chaque champ est DÉRIVÉ de son libellé
  // (src/lib/forms/field-name.ts) et deux garde-fous de build comparent la page
  // à la définition : vidé, le champ casse de toute façon, mais avec un message
  // qui dit quoi réaligner. Le rendre tolérant ferait accepter en silence un
  // formulaire dont le serveur rejetterait les soumissions.
  'labels.firstName': 'libellé dont le name HTML est dérivé',
  'labels.lastName': 'libellé dont le name HTML est dérivé',
  'labels.email': 'libellé dont le name HTML est dérivé',
  'labels.phone': 'libellé dont le name HTML est dérivé',
  'labels.subject': 'libellé dont le name HTML est dérivé',
  'labels.expertise': 'libellé dont le name HTML est dérivé',
  'labels.request': 'libellé dont le name HTML est dérivé',
  'labels.message': 'libellé dont le name HTML est dérivé',
  'fields[].label': 'libellé dont le name HTML est dérivé, côté définition',
  // Depuis L-selects (2026-09-22) le type vidé retombe sur « text » : la plupart des
  // champs sont donc tolérants. Restent NON tolérants les champs PILOTES d'un
  // affichage conditionnel — un pilote doit être une liste déroulante ou une
  // case à cocher, et la règle croisée refuse en nommant le champ et la
  // condition à réaligner. C'est le cas ici de « Votre besoin » (o-studio),
  // « Sujet » (contact) et « Type d'évaluation » (campagne-evaluation).
  'fields[].type':
    'type d’un champ PILOTE de condition : retombé sur « text », il ne peut plus piloter (règle croisée du formulaire, message explicite)',
  'fields[].showIf.equals': 'valeur qui déclenche l’affichage conditionnel — vide, la condition ne vaut plus rien',
  name: 'nom interne du formulaire (liste du CMS et objet des notifications)',

  // --- 6. Listes fermées choisies dans un MENU, jamais saisies --------------
  // Tout ce bloc a été RETIRÉ le 2026-09-22 (lot L-selects) : les listes fermées
  // acceptent désormais le select effacé et retombent sur leur `.default(…)`
  // (normalisation guidée par le schéma, en tête de content.config.ts) — une
  // clé mal orthographiée reste refusée. `src/content.config.listes-fermees.test.ts`
  // tient les deux bouts. Ne reste ici que ce qu'aucun défaut ne peut sauver :
  'sections[].type':
    'discriminant de la section — sans lui, aucun composant à rendre (jamais saisi : choisi au sélecteur)',
};

describe('un champ vidé au CMS ne casse plus le build', () => {
  it('toutes les collections éditables sont couvertes (aucun dossier oublié)', () => {
    const couverts = new Set(CIBLES.map((c) => c.dossier.split('/').pop()));
    const oublis = readdirSync(join(ROOT, 'src/data')).filter(
      (nom) => !couverts.has(nom) && !HORS_COLLECTION.has(nom),
    );
    expect(
      oublis,
      `dossier(s) de src/data sans cible : ${oublis.join(', ')} — les ajouter à CIBLES, ou à HORS_COLLECTION avec leur raison`,
    ).toEqual([]);
  });

  for (const { dossier, collection } of CIBLES) {
    describe(dossier, () => {
      const schema = schemaDe(collection);
      const fichiers = fichiersJson(join(ROOT, dossier));

      it('les fichiers actuels sont valides (référence)', () => {
        expect(fichiers.length).toBeGreaterThan(0);
        for (const fichier of fichiers) {
          const resultat = schema.safeParse(JSON.parse(readFileSync(fichier, 'utf8')));
          expect(
            resultat.success,
            `${relative(ROOT, fichier)} invalide EN L'ÉTAT : ${
              resultat.success ? '' : JSON.stringify(resultat.error.issues.slice(0, 3))
            }`,
          ).toBe(true);
        }
      });

      it('vider n’importe quel champ non structurel garde le contenu valide', () => {
        const refus: string[] = [];
        for (const fichier of fichiers) {
          const donnees = JSON.parse(readFileSync(fichier, 'utf8'));
          for (const [chemin, valeur] of chaines(donnees)) {
            if (valeur === '') continue; // déjà vide : rien à prouver
            if (schema.safeParse(videA(donnees, chemin)).success) continue;
            const cle = normaliser(chemin);
            if (cle in STRUCTURELS) continue;
            refus.push(`${relative(ROOT, fichier).split('\\').join('/')} → ${chemin}`);
          }
        }
        expect(
          refus,
          `${refus.length} champ(s) ÉDITABLE(S) refusent le vide sans être déclarés structurels.\n` +
            `Chacun est un build rouge en attente (incident du 18/09) : rendre le champ tolérant\n` +
            `dans src/content.config.ts (.default('') + repli au rendu), ou l'ajouter à\n` +
            `STRUCTURELS avec sa raison si le vide casse vraiment la page.\n  ` +
            refus.join('\n  '),
        ).toEqual([]);
      });
    });
  }

  it('aucune entrée périmée dans STRUCTURELS', () => {
    // Un champ déclaré structurel qui accepte désormais le vide fait mentir la
    // liste : on le voit ici plutôt que trois lots plus tard.
    const exerces = new Set<string>();
    const refuses = new Set<string>();
    for (const { dossier, collection } of CIBLES) {
      const schema = schemaDe(collection);
      for (const fichier of fichiersJson(join(ROOT, dossier))) {
        const donnees = JSON.parse(readFileSync(fichier, 'utf8'));
        for (const [chemin, valeur] of chaines(donnees)) {
          if (valeur === '') continue;
          const cle = normaliser(chemin);
          if (!(cle in STRUCTURELS)) continue;
          exerces.add(cle);
          if (!schema.safeParse(videA(donnees, chemin)).success) refuses.add(cle);
        }
      }
    }
    const perimes = [...exerces].filter((cle) => !refuses.has(cle));
    expect(
      perimes,
      `entrée(s) de STRUCTURELS qui acceptent maintenant le vide : ${perimes.join(', ')} — les retirer`,
    ).toEqual([]);
  });
});
