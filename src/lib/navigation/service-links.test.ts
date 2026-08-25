import { describe, it, expect } from 'vitest';
import { resolveNavHref } from './service-links';

describe('resolveNavHref (méga-menu dynamique, P-07)', () => {
  const slugs = new Set(['intelligence-artificielle', 'cybersecurite']);

  it('localise un href simple (mode par défaut — comportement historique)', () => {
    expect(resolveNavHref({ href: '/contact' }, 'fr', slugs)).toBe('/fr/contact');
    expect(resolveNavHref({ href: '/contact' }, 'en', slugs)).toBe('/en/contact');
    expect(resolveNavHref({ href: '/expertises/intelligence-artificielle' }, 'fr', slugs)).toBe(
      '/fr/expertises/intelligence-artificielle',
    );
  });

  it('résout un service existant vers /<lang>/services/<slug>', () => {
    expect(resolveNavHref({ service: 'intelligence-artificielle' }, 'fr', slugs)).toBe(
      '/fr/services/intelligence-artificielle',
    );
    expect(resolveNavHref({ service: 'cybersecurite' }, 'en', slugs)).toBe(
      '/en/services/cybersecurite',
    );
  });

  it('FILET DÉFENSIF : service prime sur href si les deux arrivent (mais le schéma navLink REJETTE cette combinaison au build — content.config.ts, constat #7)', () => {
    // Un lien portant href ET service échoue désormais la validation zod (SOIT
    // l'un SOIT l'autre) : cette combinaison ne doit pas atteindre le build.
    // La précédence ci-dessous reste une sécurité si un tel lien franchissait
    // la validation — elle n'est PAS un mode d'écriture supporté.
    expect(
      resolveNavHref(
        { href: '/expertises/intelligence-artificielle', service: 'intelligence-artificielle' },
        'fr',
        slugs,
      ),
    ).toBe('/fr/services/intelligence-artificielle');
  });

  it('service vide ("" ou espaces) = pas de service → utilise href (convention chaîne vide)', () => {
    expect(resolveNavHref({ href: '/contact', service: '' }, 'fr', slugs)).toBe('/fr/contact');
    expect(resolveNavHref({ href: '/contact', service: '   ' }, 'fr', slugs)).toBe('/fr/contact');
  });

  it('GARDE-FOU (test négatif) : un service introuvable fait ÉCHOUER le build', () => {
    expect(() => resolveNavHref({ service: 'service-inexistant' }, 'fr', slugs)).toThrow(
      /service « service-inexistant » introuvable/,
    );
    // Le message nomme la langue et le fichier attendu.
    expect(() => resolveNavHref({ service: 'service-inexistant' }, 'fr', slugs)).toThrow(
      /src\/content\/services\/fr\/service-inexistant\.json/,
    );
    // La contrepartie EN pointe vers le dossier en/.
    expect(() => resolveNavHref({ service: 'service-inexistant' }, 'en', slugs)).toThrow(
      /src\/content\/services\/en\/service-inexistant\.json/,
    );
  });
});
