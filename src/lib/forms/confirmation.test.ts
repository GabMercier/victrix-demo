import { describe, expect, it } from 'vitest';
import { confirmationEmail } from './confirmation';

/**
 * P-08 — gabarit du courriel de confirmation visiteur. Le contenu est un texte
 * FIXE par langue (jamais de recopie de la soumission) : ces tests verrouillent
 * la langue servie et le repli FR.
 */
describe('confirmationEmail', () => {
  it('sert le gabarit français pour « fr »', () => {
    const mail = confirmationEmail('fr');
    expect(mail.subject).toContain('Victrix');
    expect(mail.subject).toContain('reçu');
    expect(mail.textBody).toContain('Bonjour');
    expect(mail.textBody).toContain('Loi 25');
  });

  it('sert le gabarit anglais pour « en »', () => {
    const mail = confirmationEmail('en');
    expect(mail.subject).toContain('received');
    expect(mail.textBody).toContain('Hello');
    expect(mail.textBody).toContain('Law 25');
  });

  it('replie sur le français pour une langue inconnue', () => {
    expect(confirmationEmail('de')).toEqual(confirmationEmail('fr'));
  });

  it('les deux gabarits portent le sans-frais de la page Contact', () => {
    expect(confirmationEmail('fr').textBody).toContain('1-888-680-8181');
    expect(confirmationEmail('en').textBody).toContain('1-888-680-8181');
  });
});
