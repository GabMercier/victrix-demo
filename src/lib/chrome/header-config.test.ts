import { describe, it, expect } from 'vitest';
import { resolveHeaderConfig, resolveFooterMode } from './header-config';

describe('resolveHeaderConfig (variantes header des campagnes, P-04)', () => {
  it('bloc absent → mode complet, tout visible (parité avec le header historique)', () => {
    const r = resolveHeaderConfig(undefined);
    expect(r.mode).toBe('complet');
    expect(r.showNav).toBe(true);
    expect(r.showAnnounce).toBe(true);
    expect(r.showLangSwitch).toBe(true);
    expect(r.showSearch).toBe(true);
    expect(r.cta).toBeNull();
  });

  it('mode complet explicite = bloc absent (les autres champs sont ignorés)', () => {
    const r = resolveHeaderConfig({ mode: 'complet', showSearch: false, links: [{ label: 'X', href: '/fr/x' }] });
    expect(r).toEqual(resolveHeaderConfig(undefined));
  });

  it('allégé : logo + CTA STRICTEMENT — interrupteurs ignorés (fiche P-04)', () => {
    const r = resolveHeaderConfig({
      mode: 'allege',
      showAnnounce: true,
      showLangSwitch: true,
      showSearch: true,
      links: [{ label: 'Ignoré', href: '/fr/x' }],
    });
    expect(r.showNav).toBe(false);
    expect(r.showAnnounce).toBe(false);
    expect(r.showLangSwitch).toBe(false);
    expect(r.showSearch).toBe(false);
    expect(r.links).toEqual([]);
  });

  it('allégé sans CTA → cta null (Header.astro retombe sur le bouton portail)', () => {
    expect(resolveHeaderConfig({ mode: 'allege' }).cta).toBeNull();
  });

  it('CTA en chaînes vides (convention CloudCannon "") = absent', () => {
    expect(resolveHeaderConfig({ mode: 'allege', ctaLabel: '', ctaHref: '' }).cta).toBeNull();
    expect(resolveHeaderConfig({ mode: 'allege', ctaLabel: '  ', ctaHref: '/fr/contact' }).cta).toBeNull();
  });

  it('CTA renseigné (libellé ET lien) → CTA sur mesure', () => {
    const r = resolveHeaderConfig({ mode: 'allege', ctaLabel: 'Évaluation', ctaHref: '/fr/contact' });
    expect(r.cta).toEqual({ label: 'Évaluation', href: '/fr/contact' });
  });

  it('personnalisé : liens bornés, recherche OPT-IN (amendement 28/07), langue par défaut', () => {
    const r = resolveHeaderConfig({
      mode: 'personnalise',
      links: [{ label: 'Offre', href: '/fr/campagnes/offre' }],
    });
    expect(r.showNav).toBe(false);
    expect(r.links).toHaveLength(1);
    expect(r.showSearch).toBe(false);
    expect(r.showLangSwitch).toBe(true);
    expect(r.showAnnounce).toBe(false);
  });

  it('personnalisé : les interrupteurs sont respectés', () => {
    const r = resolveHeaderConfig({
      mode: 'personnalise',
      showAnnounce: true,
      showLangSwitch: false,
      showSearch: true,
    });
    expect(r.showAnnounce).toBe(true);
    expect(r.showLangSwitch).toBe(false);
    expect(r.showSearch).toBe(true);
  });
});

describe('resolveFooterMode (variantes footer des campagnes, P-04)', () => {
  it('champ absent → complet', () => {
    expect(resolveFooterMode(undefined)).toBe('complet');
  });
  it('allégé explicite', () => {
    expect(resolveFooterMode('allege')).toBe('allege');
  });
});
