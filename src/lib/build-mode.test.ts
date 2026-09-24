import { describe, expect, it } from 'vitest';
import { filtreRedirectionsSelonMode, resolveBuildMode } from '../../scripts/lib/build-mode.mjs';

/**
 * Lot L16 (2026-09-24) — `STATIC_ONLY` (adaptateur) et `EDITOR_PREVIEW`
 * (politique d'aperçu) sont deux variables : les quatre combinaisons, et ce
 * que chacune commande. Le site de PRODUCTION CloudCannon est la combinaison
 * « statique sans aperçu » — celle qui, avant L16, n'existait pas.
 */
describe('resolveBuildMode — les quatre combinaisons', () => {
  it('production Cloudflare / build local : rien de posé → adaptateur, pas d’aperçu, pas de Bookshop', () => {
    expect(resolveBuildMode({})).toEqual({
      staticOnly: false,
      editorPreview: false,
      attachBookshop: false,
      avertissements: [],
    });
  });

  it('site de PRODUCTION CloudCannon : STATIC_ONLY seul → statique, SANS aperçu ni Bookshop', () => {
    expect(resolveBuildMode({ STATIC_ONLY: '1' })).toEqual({
      staticOnly: true,
      editorPreview: false,
      attachBookshop: false,
      avertissements: [],
    });
  });

  it('site d’ÉDITION CloudCannon : les deux → statique, aperçu, Bookshop attaché', () => {
    expect(resolveBuildMode({ STATIC_ONLY: '1', EDITOR_PREVIEW: '1' })).toEqual({
      staticOnly: true,
      editorPreview: true,
      attachBookshop: true,
      avertissements: [],
    });
  });

  it('EDITOR_PREVIEW sans STATIC_ONLY : aperçu de contenu, mais Bookshop refusé et un avertissement', () => {
    const mode = resolveBuildMode({ EDITOR_PREVIEW: '1' });
    expect(mode.staticOnly).toBe(false);
    expect(mode.editorPreview).toBe(true);
    expect(mode.attachBookshop).toBe(false);
    expect(mode.avertissements).toHaveLength(1);
    expect(mode.avertissements[0]).toMatch(/EDITOR_PREVIEW.*sans STATIC_ONLY/);
  });

  it('toute valeur non vide vaut « posé », la chaîne vide vaut « absent »', () => {
    expect(resolveBuildMode({ STATIC_ONLY: 'true', EDITOR_PREVIEW: 'oui' }).attachBookshop).toBe(true);
    expect(resolveBuildMode({ STATIC_ONLY: '', EDITOR_PREVIEW: '' })).toMatchObject({
      staticOnly: false,
      editorPreview: false,
    });
  });
});

describe('filtreRedirectionsSelonMode — 301 des articles retirés (D19)', () => {
  const regles = [
    { de: '/annonce-nomination-ceo', vers: '/fr/decouvrir', code: 301, retire: true },
    { de: '/decouvrir-victrix', vers: '/fr/decouvrir', code: 301 },
  ];

  it('production (pas d’aperçu) : toutes les règles sont émises', () => {
    expect(filtreRedirectionsSelonMode(regles, false)).toEqual({ gardees: regles, retenues: 0 });
  });

  it('aperçu d’édition : les règles « retire » sont retenues, les autres émises', () => {
    expect(filtreRedirectionsSelonMode(regles, true)).toEqual({ gardees: [regles[1]], retenues: 1 });
  });
});
