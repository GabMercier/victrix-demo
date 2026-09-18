import { describe, expect, it } from 'vitest';
import { formAction, formsBackend, resolveInboxKey, resolveTurnstileSiteKey } from './mode';

describe('mode des formulaires (PUBLIC_FORMS_ENABLED)', () => {
  it("absente ou inconnue = maquette ('none')", () => {
    expect(formsBackend({})).toBe('none');
    expect(formsBackend({ PUBLIC_FORMS_ENABLED: '' })).toBe('none');
    expect(formsBackend({ PUBLIC_FORMS_ENABLED: 'oui' })).toBe('none');
  });

  it("'1' = worker, 'inbox' = boîte CloudCannon (insensible à la casse/espaces)", () => {
    expect(formsBackend({ PUBLIC_FORMS_ENABLED: '1' })).toBe('worker');
    expect(formsBackend({ PUBLIC_FORMS_ENABLED: 'inbox' })).toBe('inbox');
    expect(formsBackend({ PUBLIC_FORMS_ENABLED: ' Inbox ' })).toBe('inbox');
  });

  it('action : aucune en maquette, /api/forms côté worker, Merci de la langue côté inbox', () => {
    expect(formAction('none', 'fr')).toBeUndefined();
    expect(formAction('worker', 'en')).toBe('/api/forms');
    expect(formAction('inbox', 'fr')).toBe('/fr/merci/');
    expect(formAction('inbox', 'en')).toBe('/en/merci/');
    expect(formAction('inbox', 'xx')).toBe('/fr/merci/');
  });

  it('clé de boîte : définition du formulaire > variable du site > vide', () => {
    expect(resolveInboxKey('rh-carrieres', { PUBLIC_FORMS_INBOX_KEY: 'dev-marketing-contact' })).toBe('rh-carrieres');
    expect(resolveInboxKey('  ', { PUBLIC_FORMS_INBOX_KEY: 'dev-marketing-contact' })).toBe('dev-marketing-contact');
    expect(resolveInboxKey(undefined, {})).toBe('');
  });

  it('clé Turnstile : worker ET inbox rendent le widget, jamais la maquette', () => {
    const env = { PUBLIC_TURNSTILE_SITE_KEY: ' 1x00000000000000000000AA ' };
    expect(resolveTurnstileSiteKey('worker', env)).toBe('1x00000000000000000000AA');
    expect(resolveTurnstileSiteKey('inbox', env)).toBe('1x00000000000000000000AA');
    expect(resolveTurnstileSiteKey('none', env)).toBe('');
    expect(resolveTurnstileSiteKey('inbox', {})).toBe('');
  });
});
