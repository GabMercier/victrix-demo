import { describe, expect, it } from 'vitest';
import {
  INBOX_SUBJECT_MAX,
  composeInboxSubject,
  inboxFormKey,
  inboxSlug,
  inboxSubjectStatic,
} from './inbox';

describe('mode inbox — objet du courriel (décision 2026-09-17)', () => {
  it('clé du formulaire : formId > titre de section (slug ASCII) > « formulaire »', () => {
    expect(inboxFormKey('contact', 'Parlez-nous de votre projet')).toBe('contact');
    expect(inboxFormKey('', 'Évaluation de sécurité — gratuite')).toBe('evaluation-de-securite-gratuite');
    expect(inboxFormKey(undefined, '')).toBe('formulaire');
    expect(inboxSlug('Une carrière')).toBe('une-carriere');
  });

  it('objet statique (sans JavaScript) : « [clé] objet de la définition »', () => {
    expect(inboxSubjectStatic('contact', 'Message du site — formulaire de contact')).toBe(
      '[contact] Message du site — formulaire de contact',
    );
    expect(inboxSubjectStatic('infolettre', '')).toBe('[infolettre]');
    expect(inboxSubjectStatic('infolettre', undefined)).toBe('[infolettre]');
  });

  it('composé : crochet neutre + libellés « · » + nom — le format validé', () => {
    expect(
      composeInboxSubject({
        key: 'contact',
        sujetKey: 'carriere',
        details: ['Une carrière', 'Services applicatifs'],
        name: 'Gabriel Mercier-Blouin',
        staticSubject: '[contact] Message du site',
      }),
    ).toBe('[contact/carriere] Une carrière · Services applicatifs — Gabriel Mercier-Blouin');
  });

  it('replis : le courriel quand le nom manque ; l’objet statique quand rien n’est saisi', () => {
    expect(
      composeInboxSubject({ key: 'infolettre', fallback: 'marie@exemple.com', staticSubject: '[infolettre]' }),
    ).toBe('[infolettre] marie@exemple.com');
    expect(
      composeInboxSubject({
        key: 'campagne-evaluation',
        details: [' ', ''],
        name: '  ',
        staticSubject: '[campagne-evaluation] Évaluation de sécurité',
      }),
    ).toBe('[campagne-evaluation] Évaluation de sécurité');
    // Sans clé de sujet : pas de « / » dans le crochet.
    expect(composeInboxSubject({ key: 'contact', name: 'Marie Tremblay', staticSubject: '' })).toBe(
      '[contact] Marie Tremblay',
    );
  });

  it('valeurs saisies sur une ligne, sans crochets (réservés au préfixe) ; clé de sujet normalisée', () => {
    expect(
      composeInboxSubject({
        key: 'Contact',
        sujetKey: 'Carrière',
        details: ['[x]\nligne 2'],
        name: 'A  B',
        staticSubject: '',
      }),
    ).toBe('[contact/carriere] x ligne 2 — A B');
  });

  it(`coupe à ${INBOX_SUBJECT_MAX} caractères, terminé par « … »`, () => {
    const subject = composeInboxSubject({ key: 'contact', name: 'x'.repeat(300), staticSubject: '' });
    expect(subject.length).toBe(INBOX_SUBJECT_MAX);
    expect(subject.endsWith('…')).toBe(true);
  });
});
