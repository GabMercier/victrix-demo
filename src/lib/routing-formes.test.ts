import { describe, expect, it } from 'vitest';
import { lesDeuxFormes, versMotifCloudCannon } from '../../scripts/lib/routing-formes.mjs';

/**
 * Le bogue que ces tests verrouillent, mesuré au `curl` sur le site CloudCannon
 * déployé le 2026-09-22 : `/decouvrir-victrix` rendait un 301 et
 * `/decouvrir-victrix/` — la forme que Google avait indexée — un 404.
 * 105 des 184 anciennes URL étaient dans ce cas.
 */
describe('lesDeuxFormes — barre oblique finale', () => {
  it('émet les deux formes d’un chemin exact, sans barre d’abord', () => {
    expect(lesDeuxFormes({ from: '/decouvrir-victrix', to: '/fr/decouvrir', status: 301 })).toEqual([
      { from: '/decouvrir-victrix', to: '/fr/decouvrir', status: 301 },
      { from: '/decouvrir-victrix/', to: '/fr/decouvrir', status: 301 },
    ]);
  });

  it('part de la forme AVEC barre et retombe sur la même paire', () => {
    const sans = lesDeuxFormes({ from: '/carriere' });
    const avec = lesDeuxFormes({ from: '/carriere/' });
    expect(avec).toEqual(sans);
    expect(avec.map((r) => r.from)).toEqual(['/carriere', '/carriere/']);
  });

  it('couvre la forme indexée des 105 adresses qui rendaient un 404', () => {
    for (const chemin of [
      '/decouvrir-victrix',
      '/carriere',
      '/audit-cybersecurite',
      '/document/licences-microsoft-power-platform',
      '/en/resources-center',
      '/expertise/securite-informatique/zero-trust',
    ]) {
      const formes = lesDeuxFormes({ from: chemin }).map((r) => r.from);
      expect(formes).toContain(`${chemin}/`);
      expect(formes).toContain(chemin);
    }
  });

  it('conserve tous les autres champs de la règle', () => {
    const formes = lesDeuxFormes({ from: '/contact', to: '/fr/contact', status: 301, forced: true });
    expect(formes).toHaveLength(2);
    for (const r of formes) {
      expect(r.to).toBe('/fr/contact');
      expect(r.status).toBe(301);
      expect(r.forced).toBe(true);
    }
  });

  it('laisse un joker INTACT — sa capture avale déjà la barre', () => {
    const joker = { from: '/expertise/(.*)', to: '/fr/services', status: 301 };
    expect(lesDeuxFormes(joker)).toEqual([joker]);
  });

  it('laisse la racine intacte : elle n’a pas de variante', () => {
    expect(lesDeuxFormes({ from: '/', to: '/fr', status: 301 })).toEqual([
      { from: '/', to: '/fr', status: 301 },
    ]);
  });

  it('ne touche pas ce qui n’est pas un chemin (garde-fou)', () => {
    const externe = { from: 'https://exemple.test/x', to: '/fr', status: 301 };
    expect(lesDeuxFormes(externe)).toEqual([externe]);
  });

  it('produit des `from` DISTINCTS — la déduplication d’astro.config ne doit rien perdre', () => {
    const regles = ['/contact', '/carriere', '/decouvrir-victrix'].flatMap((from) => lesDeuxFormes({ from }));
    expect(new Set(regles.map((r) => r.from)).size).toBe(regles.length);
  });
});

describe('versMotifCloudCannon — syntaxe des jokers', () => {
  it('laisse un chemin exact tel quel', () => {
    expect(versMotifCloudCannon('/contact', '/fr/contact')).toEqual({
      from: '/contact',
      to: '/fr/contact',
    });
  });

  it('traduit `*` en `(.*)` et `:splat` en `$1`', () => {
    expect(versMotifCloudCannon('/expertise/*', '/fr/services/:splat')).toEqual({
      from: '/expertise/(.*)',
      to: '/fr/services/$1',
    });
  });

  it('traduit un joker SANS `:splat` dans la cible (filet vers le hub)', () => {
    expect(versMotifCloudCannon('/expertise/*', '/fr/services')).toEqual({
      from: '/expertise/(.*)',
      to: '/fr/services',
    });
  });
});
