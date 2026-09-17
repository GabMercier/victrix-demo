import { describe, expect, it } from 'vitest';
import {
  CONTACT_SERVICE_KEYS,
  CONTACT_SERVICE_LABELS,
  CONTACT_SUJET_KEYS,
  CONTACT_SUJET_LABELS,
  resolveContactPreset,
  serviceFamilyPreset,
} from './presets';
import contactFr from '../../data/contact/fr.json';
import contactEn from '../../data/contact/en.json';

const options = {
  fr: { subjectOptions: contactFr.subjectOptions, expertiseOptions: contactFr.expertiseOptions },
  en: { subjectOptions: contactEn.subjectOptions, expertiseOptions: contactEn.expertiseOptions },
} as const;

describe('préremplissage contact — clés → libellés', () => {
  it('chaque clé de sujet et de service correspond à une option RÉELLE de la page Contact (fr + en)', () => {
    for (const lang of ['fr', 'en'] as const) {
      for (const key of CONTACT_SUJET_KEYS) {
        expect(options[lang].subjectOptions, `${lang}/sujet/${key}`).toContain(CONTACT_SUJET_LABELS[lang][key]);
      }
      for (const key of CONTACT_SERVICE_KEYS) {
        expect(options[lang].expertiseOptions, `${lang}/service/${key}`).toContain(
          CONTACT_SERVICE_LABELS[lang][key],
        );
      }
    }
  });

  it('résout dans la langue demandée', () => {
    expect(resolveContactPreset('fr', { sujet: 'projet', service: 'cybersecurite' }, options.fr)).toEqual({
      sujet: 'Un projet',
      service: 'Cybersécurité',
    });
    expect(resolveContactPreset('en', { sujet: 'carriere', service: 'infonuagique' }, options.en)).toEqual({
      sujet: 'A career',
      service: 'Cloud',
    });
  });

  it("clé vide ou absente → '' ; option renommée au CMS → '' (tolérant, jamais d'erreur)", () => {
    expect(resolveContactPreset('fr', {}, options.fr)).toEqual({ sujet: '', service: '' });
    expect(resolveContactPreset('fr', { sujet: '', service: '' }, options.fr)).toEqual({ sujet: '', service: '' });
    const renamed = { subjectOptions: ['Un mandat'], expertiseOptions: ['Sécurité'] };
    expect(resolveContactPreset('fr', { sujet: 'projet', service: 'cybersecurite' }, renamed)).toEqual({
      sujet: '',
      service: '',
    });
  });

  it('famille de service = 1er segment du chemin de fichier', () => {
    expect(serviceFamilyPreset('cybersecurite/zero-trust')).toBe('cybersecurite');
    expect(serviceFamilyPreset('cybersecurite')).toBe('cybersecurite');
    expect(serviceFamilyPreset('productivite/o-studio')).toBe('services-applicatifs');
    expect(serviceFamilyPreset('services-ti-geres')).toBe('services-geres');
    expect(serviceFamilyPreset('projets-en-ia')).toBe('intelligence-artificielle');
    expect(serviceFamilyPreset('conseil-strategique/conformite-loi-25')).toBe('');
    expect(serviceFamilyPreset('demo-sections')).toBe('');
  });
});
