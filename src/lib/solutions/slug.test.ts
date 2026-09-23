import { describe, expect, it } from 'vitest';
import { conflitsDeSlug, normaliseSlug, slugDeSolution } from './slug';

/**
 * Revue R3, constat 1 : le slug d'une fiche de solution est saisi au CMS.
 * Ces tests verrouillent (1) la normalisation — la même pour la route et pour
 * le catalogue — et (2) la détection des doublons, qui doit faire échouer le
 * build au lieu de laisser une fiche en écraser une autre.
 */
describe('normaliseSlug', () => {
  it('met en minuscules, retire les accents et remplace le reste par des tirets', () => {
    expect(normaliseSlug('Portail Requêtes Citoyennes')).toBe('portail-requetes-citoyennes');
    expect(normaliseSlug('  Gestion_des idées !')).toBe('gestion-des-idees');
  });

  it('garde les sous-dossiers et nettoie chaque segment', () => {
    expect(normaliseSlug('Productivité/O Bureau/')).toBe('productivite/o-bureau');
    expect(normaliseSlug('//a//b//')).toBe('a/b');
  });

  it('laisse intact un slug déjà propre, et vide reste vide', () => {
    expect(normaliseSlug('feuille-temps-chantier')).toBe('feuille-temps-chantier');
    expect(normaliseSlug('')).toBe('');
  });
});

describe('slugDeSolution', () => {
  it('prend le slug saisi, sinon le chemin de fichier', () => {
    expect(slugDeSolution({ id: 'en/o-bureau', data: { slug: 'Desk Booking' } })).toBe('desk-booking');
    expect(slugDeSolution({ id: 'fr/o-bureau', data: { slug: '' } })).toBe('o-bureau');
    expect(slugDeSolution({ id: 'fr/o-bureau', data: {} })).toBe('o-bureau');
  });
});

describe('conflitsDeSlug', () => {
  it('signale deux fichiers de la même langue qui arrivent au même slug', () => {
    const conflits = conflitsDeSlug([
      { id: 'fr/gestion-idees', data: { slug: 'Gestion des idées' } },
      { id: 'fr/boite-a-idees', data: { slug: 'gestion-des-idees' } },
      { id: 'fr/o-bureau', data: { slug: '' } },
    ]);
    expect(conflits).toEqual([
      { langue: 'fr', slug: 'gestion-des-idees', fichiers: ['fr/gestion-idees', 'fr/boite-a-idees'] },
    ]);
  });

  it('ne confond pas les langues : le même slug en FR et en EN est normal', () => {
    expect(
      conflitsDeSlug([
        { id: 'fr/o-bureau', data: {} },
        { id: 'en/o-bureau', data: {} },
      ]),
    ).toEqual([]);
  });
});
