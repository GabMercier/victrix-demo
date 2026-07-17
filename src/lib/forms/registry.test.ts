import { describe, expect, it } from 'vitest';
import {
  buildRegistry,
  resolveForm,
  requiredFieldNames,
  emailFieldNames,
  type FormDef,
} from './registry';
import { fieldName } from './field-name';

// Simule la forme d'un import.meta.glob eager (modules avec `default`).
const MODULES = {
  '../../data/forms/fr/contact.json': {
    default: {
      name: 'Contact',
      toEmail: 'ventes@victrix.ca',
      subject: 'Message du site',
      submitLabel: 'Envoyer',
      consentText: '',
      fields: [
        { label: 'Nom complet', type: 'text', required: true },
        { label: 'Courriel professionnel', type: 'email', required: true },
        { label: 'Message', type: 'textarea', required: false },
      ],
    },
  },
  '../../data/forms/en/contact.json': {
    default: { name: 'Contact', fields: [] },
  },
  // Hors motif <fr|en>/<id>.json → ignoré.
  '../../data/forms/notes.json': { default: { name: 'égaré' } },
};

describe('fieldName', () => {
  it('retire les accents et normalise en slug', () => {
    expect(fieldName('Courriel professionnel', 0)).toBe('courriel-professionnel');
    expect(fieldName('Téléphone (bureau)', 2)).toBe('telephone-bureau');
  });
  it('replie sur un nom positionnel quand le libellé est vide', () => {
    expect(fieldName('', 2)).toBe('champ-3');
  });
});

describe('buildRegistry', () => {
  const registry = buildRegistry(MODULES);

  it('dérive la clé <lang>/<id> du chemin et ignore les fichiers hors motif', () => {
    expect(Object.keys(registry).sort()).toEqual(['en/contact', 'fr/contact']);
  });

  it('normalise les champs absents en valeurs sûres', () => {
    const en = registry['en/contact'];
    expect(en.toEmail).toBe('');
    expect(en.subject).toBe('');
    expect(en.fields).toEqual([]);
  });
});

describe('resolveForm', () => {
  const registry = buildRegistry(MODULES);

  it('résout par langue exacte, sans repli inter-langues', () => {
    expect(resolveForm(registry, 'fr', 'contact')?.toEmail).toBe('ventes@victrix.ca');
    expect(resolveForm(registry, 'en', 'contact')?.toEmail).toBe('');
  });

  it('retourne undefined pour un id inconnu (liste blanche)', () => {
    expect(resolveForm(registry, 'fr', 'inexistant')).toBeUndefined();
    expect(resolveForm(registry, 'fr', '../fr/contact')).toBeUndefined();
  });
});

describe('requiredFieldNames / emailFieldNames', () => {
  const def = buildRegistry(MODULES)['fr/contact'] as FormDef;

  it('dérive les mêmes noms HTML que la section « form »', () => {
    expect(requiredFieldNames(def)).toEqual(['nom-complet', 'courriel-professionnel']);
    expect(emailFieldNames(def)).toEqual(['courriel-professionnel']);
  });
});
