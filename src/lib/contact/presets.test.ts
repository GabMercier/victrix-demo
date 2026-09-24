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
import { readFileSync } from 'node:fs';
// `yaml` (et non js-yaml) : c'est celui qui porte ses propres types, et il
// sert déjà à scripts/design/generate-section-previews.mjs.
import { parse as parseYaml } from 'yaml';

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
    // Catalogue de solutions (2026-09-18) : sujet dédié + service de la fiche.
    expect(resolveContactPreset('fr', { sujet: 'solution', service: 'services-applicatifs' }, options.fr)).toEqual({
      sujet: 'Une solution du catalogue',
      service: 'Services applicatifs',
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

  // 2026-09-21 — « Service » est OBLIGATOIRE : un CTA prérempli ne doit plus
  // jamais y arriver à vide (constat Gabriel sur « Postuler », page Carrières).
  it('le sujet choisit le service quand la page n’en fixe aucun : carrière → RH', () => {
    expect(resolveContactPreset('fr', { sujet: 'carriere' }, options.fr)).toEqual({
      sujet: 'Une carrière',
      service: 'Ressources humaines',
    });
    expect(resolveContactPreset('en', { sujet: 'carriere' }, options.en)).toEqual({
      sujet: 'A career',
      service: 'Human resources',
    });
  });

  it('tout autre sujet sans service retombe sur « Autre » (familles sans correspondance)', () => {
    // Pages conseil-strategique / approvisionnement-ti / demo-* : la route
    // pose le sujet « projet » et serviceFamilyPreset ne rend rien.
    expect(resolveContactPreset('fr', { sujet: 'projet', service: serviceFamilyPreset('conseil-strategique') }, options.fr)).toEqual({
      sujet: 'Un projet',
      service: 'Autre',
    });
    expect(resolveContactPreset('en', { sujet: 'projet', service: '' }, options.en)).toEqual({
      sujet: 'A project',
      service: 'Other',
    });
  });

  it('le service de la page l’emporte toujours sur le repli', () => {
    expect(resolveContactPreset('fr', { sujet: 'carriere', service: 'cybersecurite' }, options.fr).service).toBe(
      'Cybersécurité',
    );
  });

  it('sans sujet, rien n’est présélectionné : arriver sur /contact ne remplit pas « Service »', () => {
    expect(resolveContactPreset('fr', { service: '' }, options.fr)).toEqual({ sujet: '', service: '' });
  });

  // GARDE-FOU DE LISTE FERMÉE (ajouté 2026-09-21, il manquait) : les clés que
  // l'éditrice voit dans CloudCannon (_select_data) doivent être EXACTEMENT
  // celles que le code sait résoudre. Une clé en trop au CMS = un
  // préremplissage muet ; une clé manquante = une page qu'on ne peut plus
  // configurer. Même principe que la palette de fonds et la banque d'icônes.
  it('les listes _select_data de cloudcannon.config.yml correspondent aux clés du code', () => {
    const config = parseYaml(readFileSync('cloudcannon.config.yml', 'utf8')) as {
      _select_data: Record<string, { cle: string; libelle: string }[]>;
    };
    const cles = (nom: string) => config._select_data[nom].map((entry) => entry.cle);
    expect(cles('contact_sujets')).toEqual([...CONTACT_SUJET_KEYS]);
    expect(cles('contact_services')).toEqual([...CONTACT_SERVICE_KEYS]);
    // Le libellé du CMS porte les deux langues (« FR / EN ») : chacune doit
    // être celle que presets.ts résout, sinon l'éditrice choisit à l'aveugle.
    for (const entry of config._select_data.contact_services) {
      const key = entry.cle as (typeof CONTACT_SERVICE_KEYS)[number];
      expect(entry.libelle, key).toBe(
        `${CONTACT_SERVICE_LABELS.fr[key]} / ${CONTACT_SERVICE_LABELS.en[key]}`,
      );
    }
    for (const entry of config._select_data.contact_sujets) {
      const key = entry.cle as (typeof CONTACT_SUJET_KEYS)[number];
      expect(entry.libelle, key).toBe(
        `${CONTACT_SUJET_LABELS.fr[key]} / ${CONTACT_SUJET_LABELS.en[key]}`,
      );
    }
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
