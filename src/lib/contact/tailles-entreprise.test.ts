/**
 * Garde-fou des tranches d'effectif (2026-09-21) — la liste fermée a UNE
 * source (component-library/src/shared/tailles-entreprise.ts) et deux copies
 * de données qui doivent lui rester identiques, VALEUR PAR VALEUR :
 *
 *  - src/data/contact/<lang>.json       → ce que la page Contact affiche ;
 *  - src/data/forms/<lang>/contact.json → la liste blanche du serveur.
 *
 * L'accord est sur les LIBELLÉS et pas sur des clés parce qu'ils voyagent
 * dans l'adresse : la section « Renvoi vers le contact » écrit
 * `?taille=<libellé>` et la page Contact ne présélectionne l'option que si la
 * valeur correspond EXACTEMENT. Une reformulation d'un seul côté ne casserait
 * rien de visible — le préremplissage cesserait, en silence. D'où ce test.
 */
import { describe, expect, it } from 'vitest';
import { TAILLES_ENTREPRISE, taillesPourHref } from '../../../component-library/src/shared/tailles-entreprise';
import contactFr from '../../data/contact/fr.json';
import contactEn from '../../data/contact/en.json';
import defFr from '../../data/forms/fr/contact.json';
import defEn from '../../data/forms/en/contact.json';

const pages = { fr: contactFr, en: contactEn } as const;
const definitions = { fr: defFr, en: defEn } as const;

describe('tranches d’effectif — une seule source', () => {
  it('la page Contact affiche exactement les tranches de la source (fr + en)', () => {
    for (const lang of ['fr', 'en'] as const) {
      expect(pages[lang].companySizeOptions, lang).toEqual([...TAILLES_ENTREPRISE[lang]]);
    }
  });

  it('la définition serveur porte les mêmes tranches, sur un champ conditionnel au service (fr + en)', () => {
    for (const lang of ['fr', 'en'] as const) {
      const champ = definitions[lang].fields.find(
        (f) => f.label === pages[lang].labels.companySize,
      );
      expect(champ, `${lang} : champ « ${pages[lang].labels.companySize} » absent de la définition`).toBeDefined();
      expect(champ?.options, lang).toEqual([...TAILLES_ENTREPRISE[lang]]);
      // Le pilote doit être le select « Service » et sa valeur une option RÉELLE.
      expect(champ?.showIf?.field, lang).toBe(pages[lang].labels.expertise);
      expect(pages[lang].expertiseOptions, lang).toContain(champ?.showIf?.equals);
    }
  });

  it('la langue des tranches suit l’URL de contact de la section', () => {
    expect(taillesPourHref('/en/contact')).toEqual([...TAILLES_ENTREPRISE.en]);
    expect(taillesPourHref('/en/contact/')).toEqual([...TAILLES_ENTREPRISE.en]);
    expect(taillesPourHref('/fr/contact')).toEqual([...TAILLES_ENTREPRISE.fr]);
    // Repli FR : URL vide, relative ou inattendue (jamais d'exception).
    expect(taillesPourHref('')).toEqual([...TAILLES_ENTREPRISE.fr]);
    expect(taillesPourHref('/english/contact')).toEqual([...TAILLES_ENTREPRISE.fr]);
  });

  it('aucune tranche « Autre » : les bornes couvrent tout l’éventail', () => {
    for (const lang of ['fr', 'en'] as const) {
      for (const tranche of TAILLES_ENTREPRISE[lang]) {
        expect(tranche.trim()).not.toBe('');
        expect(['Autre', 'Other']).not.toContain(tranche);
      }
    }
  });
});
