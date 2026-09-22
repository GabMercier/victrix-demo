import { readFileSync } from 'node:fs';
import { join, relative } from 'node:path';
import { describe, expect, it } from 'vitest';
import {
  CIBLES,
  type NomCollection,
  ROOT,
  chaines,
  cheminDIssue,
  fichiersJson,
  normaliser,
  remplaceA,
  schemaDe,
  supprimeA,
  valeurA,
  videA,
} from '../tests/helpers/contenu-editable';

/**
 * UN SELECT EFFACÉ AU CMS NE CASSE PLUS LE BUILD (2026-09-22, lot L-selects).
 *
 * Troisième porte de la même panne. Le `null` du CMS était réglé
 * (`nullsToEmpty`), le texte vidé aussi (lot L01, `.min(1)` → `.default('')`) —
 * restaient les LISTES FERMÉES : `z.enum([...]).default('ivoire')` refuse `''`,
 * donc un menu déroulant remis à blanc dans CloudCannon rouvrait très
 * exactement l'incident du 18/09 (20 sauvegardes de Julie non publiées).
 *
 * Le correctif tient en une phrase, et ce test en vérifie les DEUX moitiés —
 * c'est tout son intérêt, parce que le réflexe (`.catch('<défaut>')`) n'en
 * donne qu'une et abîme l'autre :
 *
 *  1. VIDE → le champ retombe sur SON PROPRE `.default(…)`, celui qui est écrit
 *     à côté de lui dans le schéma (et non une valeur inventée ailleurs) ;
 *  2. INCONNU → toujours REFUSÉ, bruyamment. `fond: "beig"` doit continuer de
 *     faire échouer la validation : une faute de frappe qui retomberait en
 *     silence sur le défaut donnerait une section au mauvais fond que personne
 *     ne verrait jamais passer.
 *
 * Les listes fermées ne sont pas listées à la main ici : elles sont DÉCOUVERTES
 * dans le contenu réel — un champ est une liste fermée si, en y mettant une
 * valeur impossible, zod répond `invalid_enum_value` sur ce chemin-là. C'est le
 * verdict de zod, pas notre propre logique : si la normalisation de
 * `content.config.ts` se trompait, le test ne se tromperait pas avec elle.
 */

/** Valeur qu'aucune liste fermée du site ne contient — et aucun texte libre non plus. */
const IMPOSSIBLE = 'zzz-valeur-impossible-9f3a';

/**
 * Listes fermées qu'AUCUN défaut ne peut sauver : le champ vide n'a alors pas
 * de repli possible, et l'échec de validation est le bon comportement.
 */
const SANS_REPLI_POSSIBLE: Record<string, string> = {
  'sections[].type':
    'discriminant de la section : vidé, plus aucun composant à rendre (jamais saisi — choisi au sélecteur de sections)',
  // Le défaut EXISTE (« text ») et suffit à la plupart des champs — mais un
  // champ PILOTE d'affichage conditionnel doit rester une liste déroulante ou
  // une case à cocher : retombé sur « text », la règle croisée du formulaire
  // refuse, en nommant le champ et la condition. Le cas nominal (champ non
  // pilote) est couvert par le test explicite en fin de fichier.
  'fields[].type':
    'type d’un champ PILOTE de condition : aucun défaut ne peut le rendre valide (règle croisée du formulaire)',
};

type ListeFermee = {
  fichier: string;
  chemin: string;
  cle: string;
  donnees: unknown;
  collection: NomCollection;
  /** Les valeurs admises, telles que zod les a énumérées dans son erreur. */
  valeurs: ReadonlyArray<unknown>;
};

/**
 * Toutes les listes fermées ATTEINTES par le contenu réel — chaque occurrence,
 * sans regroupement : `sections[].fond` n'est pas la même liste dans un `hero`
 * (10 fonds clairs) et dans un `rich-text` (palette étendue, fonds sombres), et
 * n'examiner qu'une occurrence par chemin ferait dépendre le verdict de l'ordre
 * de lecture des fichiers.
 */
function listesFermees(): ListeFermee[] {
  const trouvees: ListeFermee[] = [];
  for (const { dossier, collection } of CIBLES) {
    const schema = schemaDe(collection);
    for (const fichier of fichiersJson(join(ROOT, dossier))) {
      const donnees = JSON.parse(readFileSync(fichier, 'utf8'));
      for (const [chemin] of chaines(donnees)) {
        const resultat = schema.safeParse(remplaceA(donnees, chemin, IMPOSSIBLE));
        if (resultat.success) continue; // texte libre : rien à prouver ici
        const issue = resultat.error.issues.find(
          (i) => i.code === 'invalid_enum_value' && cheminDIssue(i.path) === chemin,
        );
        if (issue)
          trouvees.push({
            fichier,
            chemin,
            cle: normaliser(chemin),
            donnees,
            collection,
            valeurs: (issue as unknown as { options: ReadonlyArray<unknown> }).options,
          });
      }
    }
  }
  return trouvees;
}

const LISTES = listesFermees();
/** Les listes que le correctif vise : `''` n'y est PAS une valeur admise. */
const SANS_VIDE = LISTES.filter((l) => !l.valeurs.includes(''));
/** Celles où `''` EST une valeur (aucune icône, fond « défaut du bloc »). */
const AVEC_VIDE = LISTES.filter((l) => l.valeurs.includes(''));
const nomCourt = (fichier: string) => relative(ROOT, fichier).split('\\').join('/');

/**
 * Planchers de couverture. Ils ne décrivent pas un objectif : ils empêchent un
 * test de passer À VIDE. Sans eux, une régression qui ferait AUSSI disparaître
 * les listes de la découverte (typiquement le `.catch()` écarté : il avale la
 * valeur impossible, donc plus rien n'est reconnu comme liste fermée) rendrait
 * les quatre balayages vacieux — et tout vert. C'est arrivé pendant l'écriture
 * du lot, sur une injection de panne : le test restait vert en n'examinant plus
 * rien. Mesuré le 2026-09-22 : 298 occurrences sans vide, 136 avec ; planchers
 * posés au tiers en dessous, pour que supprimer une page ne fasse pas rougir
 * la CI.
 */
const PLANCHER_SANS_VIDE = 200;
const PLANCHER_AVEC_VIDE = 90;
/** Le test des fautes de frappe écarte les défauts d'une seule lettre (`columns: '3'`) : 189 cas. */
const PLANCHER_FAUTES = 120;

describe('un select effacé au CMS ne casse plus le build', () => {
  it('le contenu réel expose bien les deux familles de listes fermées', () => {
    expect(
      SANS_VIDE.length,
      'listes fermées SANS « vide » trouvées dans le contenu',
    ).toBeGreaterThan(PLANCHER_SANS_VIDE);
    expect(AVEC_VIDE.length, 'listes fermées où « vide » est une valeur').toBeGreaterThan(
      PLANCHER_AVEC_VIDE,
    );
  });

  it('effacer une liste fermée garde le contenu valide', () => {
    const refus: string[] = [];
    let exerces = 0;
    for (const { fichier, chemin, cle, donnees, collection } of SANS_VIDE) {
      if (cle in SANS_REPLI_POSSIBLE) continue;
      exerces += 1;
      const resultat = schemaDe(collection).safeParse(videA(donnees, chemin));
      if (!resultat.success) refus.push(`${nomCourt(fichier)} → ${chemin}`);
    }
    expect(
      refus,
      `${refus.length} liste(s) fermée(s) refusent encore le vide.\n` +
        `Chacune est un build rouge en attente : un select effacé dans CloudCannon suffit.\n` +
        `Donner au champ un .default('…') dans src/content.config.ts (la normalisation\n` +
        `en tête de fichier s'en sert), ou l'inscrire dans SANS_REPLI_POSSIBLE avec sa raison.\n  ` +
        refus.join('\n  '),
    ).toEqual([]);
    expect(exerces, 'balayage passé à vide').toBeGreaterThan(PLANCHER_SANS_VIDE);
  });

  it('effacer une liste fermée applique LE DÉFAUT DU CHAMP, pas une valeur inventée', () => {
    const ecarts: string[] = [];
    let exerces = 0;
    for (const { fichier, chemin, cle, donnees, collection } of SANS_VIDE) {
      if (cle in SANS_REPLI_POSSIBLE) continue;
      exerces += 1;
      const schema = schemaDe(collection);
      const vide = schema.safeParse(videA(donnees, chemin));
      const absent = schema.safeParse(supprimeA(donnees, chemin));
      if (!vide.success || !absent.success) continue; // couvert par le test précédent
      const valeurVide = valeurA(vide.data, chemin);
      const valeurAbsente = valeurA(absent.data, chemin);
      if (valeurVide !== valeurAbsente) {
        ecarts.push(
          `${nomCourt(fichier)} → ${chemin} : vidé donne ${JSON.stringify(valeurVide)}, ` +
            `absent donne ${JSON.stringify(valeurAbsente)}`,
        );
      }
    }
    expect(
      ecarts,
      `Un champ vidé doit valoir exactement ce qu'il vaut quand sa clé est ABSENTE —\n` +
        `c'est la seule façon de ne pas inventer de valeur de repli.\n  ` +
        ecarts.join('\n  '),
    ).toEqual([]);
    expect(exerces, 'balayage passé à vide').toBeGreaterThan(PLANCHER_SANS_VIDE);
  });

  it('une valeur INCONNUE reste refusée (la faute de frappe ne passe pas en silence)', () => {
    // La moitié du correctif qu'un `.catch()` aurait supprimée. On n'essaie pas
    // `IMPOSSIBLE` (c'est lui qui a servi à découvrir les champs, ce serait
    // circulaire) mais une faute PLAUSIBLE : le défaut du champ amputé d'une
    // lettre — « beig » pour « beige », exactement ce qu'on tape à la main.
    const avales: string[] = [];
    let exerces = 0;
    for (const { fichier, chemin, cle, donnees, collection } of SANS_VIDE) {
      if (cle in SANS_REPLI_POSSIBLE) continue;
      const schema = schemaDe(collection);
      const attendu = valeurA(schema.safeParse(videA(donnees, chemin)).data ?? {}, chemin);
      if (typeof attendu !== 'string' || attendu.length < 2) continue;
      exerces += 1;
      const faute = attendu.slice(0, -1);
      if (schema.safeParse(remplaceA(donnees, chemin, faute)).success) {
        avales.push(`${nomCourt(fichier)} → ${chemin} : « ${faute} » accepté en silence`);
      }
    }
    expect(
      avales,
      `${avales.length} liste(s) fermée(s) avalent une clé mal orthographiée.\n` +
        `C'est ce qu'un .catch('<défaut>') aurait produit : la section rend un autre\n` +
        `fond que celui demandé et rien ne le signale. La normalisation ne doit\n` +
        `traiter QUE la chaîne vide.\n  ` +
        avales.join('\n  '),
    ).toEqual([]);
    expect(exerces, 'balayage passé à vide').toBeGreaterThan(PLANCHER_FAUTES);
  });

  it('les listes où le vide est une VALEUR (pictogramme, fond « défaut du bloc ») gardent ‘’', () => {
    // `pictogramme` ('' = aucune icône) et `fondClairOuVide` ('' = rendu
    // historique du bloc) contiennent `''` dans leur liste : la normalisation
    // ne doit pas les toucher — sinon « aucune icône » deviendrait une icône.
    const ecrases: string[] = [];
    let exerces = 0;
    for (const { fichier, chemin, donnees, collection } of AVEC_VIDE) {
      const resultat = schemaDe(collection).safeParse(videA(donnees, chemin));
      if (!resultat.success) continue;
      exerces += 1;
      const obtenu = valeurA(resultat.data, chemin);
      if (obtenu !== '') {
        ecrases.push(`${nomCourt(fichier)} → ${chemin} : '' devenu ${JSON.stringify(obtenu)}`);
      }
    }
    expect(
      ecrases,
      `Une liste qui accepte '' doit garder '' : c'est une valeur, pas une absence —\n` +
        `« aucune icône » ne doit pas devenir une icône, ni « fond par défaut du bloc »\n` +
        `un fond choisi.\n  ` +
        ecrases.join('\n  '),
    ).toEqual([]);
    expect(exerces, 'balayage passé à vide').toBeGreaterThan(PLANCHER_AVEC_VIDE);
  });

  it('cas nominal du type de champ : vidé sur un champ ORDINAIRE, il devient « text »', () => {
    // `fields[].type` est écarté des balayages ci-dessus à cause des champs
    // PILOTES (voir SANS_REPLI_POSSIBLE) ; son cas nominal se vérifie ici, sur
    // une définition minimale sans affichage conditionnel.
    const formulaire = {
      name: 'Démonstration',
      submitLabel: 'Envoyer',
      fields: [{ label: 'Votre nom', type: '', required: false }],
    };
    const resultat = schemaDe('forms').safeParse(formulaire);
    expect(resultat.success, JSON.stringify(resultat.success ? '' : resultat.error.issues)).toBe(
      true,
    );
    expect(valeurA(resultat.data, 'fields[0].type')).toBe('text');
  });
});
