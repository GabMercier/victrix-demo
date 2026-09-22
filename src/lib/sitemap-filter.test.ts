import { describe, expect, it } from 'vitest';
import { PREFIXES_HORS_SITEMAP, entreAuSitemap } from '../../scripts/lib/sitemap-filter.mjs';

const site = 'https://victrix-demo.pages.dev';
const url = (chemin: string) => `${site}${chemin}`;

describe('filtre du plan de site', () => {
  it('garde les pages publiques', () => {
    expect(entreAuSitemap(url('/fr/'))).toBe(true);
    expect(entreAuSitemap(url('/fr/services/cybersecurite/'))).toBe(true);
    expect(entreAuSitemap(url('/en/ressources/dora-regulation/'))).toBe(true);
  });

  it('exclut les familles entières par préfixe', () => {
    for (const prefixe of PREFIXES_HORS_SITEMAP) {
      expect(entreAuSitemap(url(`/fr${prefixe}quelque-chose/`))).toBe(false);
    }
    expect(entreAuSitemap(url('/fr/campagnes/licences-power-platform/'))).toBe(false);
    expect(entreAuSitemap(url('/en/merci/'))).toBe(false);
    expect(entreAuSitemap(url('/fr/portail/'))).toBe(false);
  });

  it('exclut une page noindex par correspondance EXACTE', () => {
    const noindex = ['/fr/tarification/', '/en/tarification/'];
    expect(entreAuSitemap(url('/fr/tarification/'), noindex)).toBe(false);
    expect(entreAuSitemap(url('/en/tarification/'), noindex)).toBe(false);
    expect(entreAuSitemap(url('/fr/decouvrir/'), noindex)).toBe(true);
  });

  // LE bogue du 22/09, verrouillé : la page mère /fr/services/ était noindex,
  // et un `includes` retirait du plan de site TOUTES ses pages enfants —
  // 72 URL annoncées pour 186 pages, tout le catalogue de services absent.
  it('le noindex d’une page mère ne désindexe PAS ses enfants', () => {
    const noindex = ['/fr/services/', '/en/services/'];
    expect(entreAuSitemap(url('/fr/services/'), noindex)).toBe(false);
    expect(entreAuSitemap(url('/fr/services/cybersecurite/'), noindex)).toBe(true);
    expect(entreAuSitemap(url('/fr/services/productivite/o-studio/'), noindex)).toBe(true);
    expect(entreAuSitemap(url('/en/services/managed-it-services/'), noindex)).toBe(true);
  });

  it('un service enfant noindex sort, sans emporter ses voisins', () => {
    const noindex = ['/fr/services/intelligence-artificielle/accompagnement-ia/'];
    expect(entreAuSitemap(url('/fr/services/intelligence-artificielle/accompagnement-ia/'), noindex)).toBe(
      false
    );
    expect(entreAuSitemap(url('/fr/services/intelligence-artificielle/'), noindex)).toBe(true);
    expect(entreAuSitemap(url('/fr/services/intelligence-artificielle/accompagnement/'), noindex)).toBe(
      true
    );
  });

  it('tolère un chemin relatif (hors contexte de build)', () => {
    expect(entreAuSitemap('/fr/tarification/', ['/fr/tarification/'])).toBe(false);
    expect(entreAuSitemap('/fr/decouvrir/', ['/fr/tarification/'])).toBe(true);
  });
});
