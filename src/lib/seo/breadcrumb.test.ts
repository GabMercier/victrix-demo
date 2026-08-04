import { describe, it, expect } from 'vitest';
import { breadcrumbSchema } from './breadcrumb';

describe('breadcrumbSchema (BreadcrumbList JSON-LD, P-12)', () => {
  it('numérote les positions et absolutise les URLs', () => {
    const schema = breadcrumbSchema(
      [
        { name: 'Accueil', path: '/fr/' },
        { name: 'Ressources', path: '/fr/ressources/' },
        { name: 'Mon article' },
      ],
      'https://victrix-demo.pages.dev',
    ) as { itemListElement: Array<Record<string, unknown>> };

    expect(schema.itemListElement).toHaveLength(3);
    expect(schema.itemListElement[0]).toMatchObject({
      position: 1,
      name: 'Accueil',
      item: 'https://victrix-demo.pages.dev/fr/',
    });
    expect(schema.itemListElement[1].item).toBe('https://victrix-demo.pages.dev/fr/ressources/');
  });

  it('la page courante (sans path) omet `item` (recommandation Google)', () => {
    const schema = breadcrumbSchema(
      [{ name: 'Accueil', path: '/fr/' }, { name: 'Page courante' }],
      new URL('https://example.com'),
    ) as { itemListElement: Array<Record<string, unknown>> };
    expect(schema.itemListElement[1]).not.toHaveProperty('item');
    expect(schema.itemListElement[1].name).toBe('Page courante');
  });
});
