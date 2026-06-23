import { describe, it, expect } from 'vitest';
import { localizePath, swapLocale, isLocale, otherLocale, localePaths } from './config';

describe('localizePath', () => {
  it('prefixes root-relative paths with the locale', () => {
    expect(localizePath('/contact', 'fr')).toBe('/fr/contact');
    expect(localizePath('/contact', 'en')).toBe('/en/contact');
    expect(localizePath('/ressources/x', 'en')).toBe('/en/ressources/x');
  });
  it('maps "/" to the locale root', () => {
    expect(localizePath('/', 'fr')).toBe('/fr');
    expect(localizePath('/', 'en')).toBe('/en');
  });
  it('leaves external links, anchors and mailto/tel untouched', () => {
    expect(localizePath('https://x.com', 'fr')).toBe('https://x.com');
    expect(localizePath('mailto:a@b.ca', 'en')).toBe('mailto:a@b.ca');
    expect(localizePath('#section', 'fr')).toBe('#section');
  });
});

describe('swapLocale', () => {
  it('swaps the locale segment of a prefixed path', () => {
    expect(swapLocale('/fr/contact', 'en')).toBe('/en/contact');
    expect(swapLocale('/en/ressources/x', 'fr')).toBe('/fr/ressources/x');
  });
  it('handles the bare locale root', () => {
    expect(swapLocale('/en', 'fr')).toBe('/fr');
    expect(swapLocale('/fr', 'en')).toBe('/en');
  });
  it('falls back to the other locale home for non-prefixed paths', () => {
    expect(swapLocale('/mon-portail', 'en')).toBe('/en');
  });
});

describe('isLocale / otherLocale / localePaths', () => {
  it('validates locales', () => {
    expect(isLocale('fr')).toBe(true);
    expect(isLocale('en')).toBe(true);
    expect(isLocale('de')).toBe(false);
    expect(isLocale(undefined)).toBe(false);
  });
  it('knows the opposite locale', () => {
    expect(otherLocale.fr).toBe('en');
    expect(otherLocale.en).toBe('fr');
  });
  it('emits one static path per locale', () => {
    const paths = localePaths();
    expect(paths.map((p) => p.params.lang).sort()).toEqual(['en', 'fr']);
  });
});
