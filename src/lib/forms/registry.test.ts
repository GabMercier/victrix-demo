import { describe, expect, it } from 'vitest';
import {
  buildRegistry,
  resolveForm,
  requiredFieldNames,
  emailFieldNames,
  checkboxFieldNames,
  selectFieldViolations,
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

// ---- P-05 : types étendus, conditions, cases, liste blanche des selects ----

// Définition « riche » simulant un fichier CMS avec les formes vides que pose
// l'éditeur CloudCannon (options: [], value: '', showIf {field:''}).
const RICH_MODULES = {
  '../../data/forms/fr/evaluation.json': {
    default: {
      name: 'Évaluation',
      fields: [
        { label: 'Nom complet', type: 'text', required: true, options: [], value: '', showIf: { field: '', equals: '' } },
        { label: "Taille de l'entreprise", type: 'select', required: true, options: ['Moins de 50', 'Autre'] },
        { label: 'Précisez la taille', type: 'text', required: true, showIf: { field: "Taille de l'entreprise", equals: 'Autre' } },
        { label: 'Je consens (Loi 25)', type: 'checkbox', required: true },
        { label: 'Infolettre', type: 'checkbox', required: false },
        { label: 'Page d’origine', type: 'hidden', required: true, value: '{{page.titre}}' },
        { label: 'Bidon', type: 'zeppelin', required: 'oui', options: ['', '  '] },
      ],
    },
  },
};
const rich = buildRegistry(RICH_MODULES)['fr/evaluation'] as FormDef;

describe('buildRegistry — normalisation des clés étendues (P-05)', () => {
  it('normalise les formes vides CloudCannon à ABSENT (options/value/showIf)', () => {
    const nom = rich.fields[0];
    expect(nom.options).toBeUndefined();
    expect(nom.value).toBeUndefined();
    expect(nom.showIf).toBeUndefined();
  });

  it('conserve une condition active et les options non vides', () => {
    expect(rich.fields[2].showIf).toEqual({ field: "Taille de l'entreprise", equals: 'Autre' });
    expect(rich.fields[1].options).toEqual(['Moins de 50', 'Autre']);
  });

  it('neutralise le junk : type inconnu → text, required non booléen → false, options vides → absent', () => {
    const bidon = rich.fields[6];
    expect(bidon.type).toBe('text');
    expect(bidon.required).toBe(false);
    expect(bidon.options).toBeUndefined();
  });
});

describe('requiredFieldNames — hidden et conditionnels (P-05)', () => {
  it("exclut toujours les champs cachés, même marqués requis", () => {
    expect(requiredFieldNames(rich)).not.toContain('page-d-origine');
  });

  it('sans valeurs soumises (usage historique), un requis conditionnel est exigé', () => {
    expect(requiredFieldNames(rich)).toContain('precisez-la-taille');
  });

  it('condition non satisfaite → le champ requis n’est pas exigé', () => {
    const submitted = { 'taille-de-l-entreprise': 'Moins de 50' };
    expect(requiredFieldNames(rich, submitted)).not.toContain('precisez-la-taille');
  });

  it('condition satisfaite (espaces tolérés) → le champ requis est exigé', () => {
    expect(requiredFieldNames(rich, { 'taille-de-l-entreprise': ' Autre ' })).toContain(
      'precisez-la-taille',
    );
  });

  it('pilote checkbox : « oui » soumis satisfait, absent ne satisfait pas', () => {
    const withCheckboxPilot = buildRegistry({
      '../../data/forms/fr/c.json': {
        default: {
          fields: [
            { label: 'Infolettre', type: 'checkbox', required: false },
            { label: 'Courriel', type: 'email', required: true, showIf: { field: 'Infolettre', equals: 'oui' } },
          ],
        },
      },
    })['fr/c'] as FormDef;
    expect(requiredFieldNames(withCheckboxPilot, { infolettre: 'oui' })).toContain('courriel');
    expect(requiredFieldNames(withCheckboxPilot, {})).not.toContain('courriel');
  });
});

describe('checkboxFieldNames', () => {
  it('liste les noms HTML des cases (et rien d’autre)', () => {
    expect(checkboxFieldNames(rich)).toEqual(['je-consens-loi-25', 'infolettre']);
  });
});

describe('selectFieldViolations — liste blanche', () => {
  it('accepte une valeur de la liste et la valeur vide', () => {
    expect(selectFieldViolations(rich, { 'taille-de-l-entreprise': 'Autre' })).toEqual([]);
    expect(selectFieldViolations(rich, {})).toEqual([]);
  });

  it('trime les options de la définition (espace de bordure invisible — revue P-05)', () => {
    const def = buildRegistry({
      '../../data/forms/fr/t.json': {
        default: { fields: [{ label: 'Choix', type: 'select', required: true, options: ['Autre '] }] },
      },
    })['fr/t'] as FormDef;
    expect(def.fields[0].options).toEqual(['Autre']);
    expect(selectFieldViolations(def, { choix: 'Autre ' })).toEqual([]);
    expect(selectFieldViolations(def, { choix: 'Autre' })).toEqual([]);
  });

  it('rejette une valeur hors liste et des valeurs répétées jointes', () => {
    expect(selectFieldViolations(rich, { 'taille-de-l-entreprise': 'inventée' })).toEqual([
      'valeur hors liste: taille-de-l-entreprise',
    ]);
    expect(selectFieldViolations(rich, { 'taille-de-l-entreprise': 'Autre, Autre' })).toHaveLength(1);
  });
});
