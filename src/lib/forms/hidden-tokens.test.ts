import { describe, it, expect } from 'vitest';

import { resolveHiddenValue } from './hidden-tokens';

const CTX = {
  titre: 'Évaluation de sécurité',
  chemin: '/fr/campagnes/demo-sections/',
  slug: 'demo-sections',
  langue: 'fr',
};

describe('resolveHiddenValue — jetons {{page.*}}', () => {
  it('résout les quatre jetons de page, mêlés à du texte fixe', () => {
    expect(resolveHiddenValue('{{page.titre}} ({{page.chemin}})', CTX)).toEqual({
      value: 'Évaluation de sécurité (/fr/campagnes/demo-sections/)',
      urlParam: null,
    });
    expect(resolveHiddenValue('{{page.slug}}|{{page.langue}}', CTX)).toEqual({
      value: 'demo-sections|fr',
      urlParam: null,
    });
  });

  it('tolère les espaces internes du jeton', () => {
    expect(resolveHiddenValue('{{ page.titre }}', CTX).value).toBe('Évaluation de sécurité');
  });

  it('résout un jeton inconnu en chaîne vide (jamais de jeton brut)', () => {
    expect(resolveHiddenValue('x-{{page.inexistant}}-y', CTX).value).toBe('x--y');
    expect(resolveHiddenValue('{{nimporte.quoi}}', CTX).value).toBe('');
  });

  it('résout en chaîne vide quand le contexte est absent (éditeur visuel)', () => {
    expect(resolveHiddenValue('{{page.titre}}', {}).value).toBe('');
  });

  it('laisse intacte une valeur sans jetons', () => {
    expect(resolveHiddenValue('campagne-ete-2026', CTX)).toEqual({
      value: 'campagne-ete-2026',
      urlParam: null,
    });
  });
});

describe('resolveHiddenValue — jetons {{url.*}}', () => {
  it('reconnaît {{url.<param>}} seul et entier (espaces tolérés)', () => {
    expect(resolveHiddenValue('{{url.utm_source}}', CTX)).toEqual({
      value: '',
      urlParam: 'utm_source',
    });
    expect(resolveHiddenValue('  {{ url.utm_campaign }}  ', CTX)).toEqual({
      value: '',
      urlParam: 'utm_campaign',
    });
  });

  it('mêlé à du texte : traité comme jeton inconnu (vide, pas de urlParam)', () => {
    expect(resolveHiddenValue('src={{url.utm_source}}', CTX)).toEqual({
      value: 'src=',
      urlParam: null,
    });
  });

  it('rejette un nom de paramètre invalide (majuscules, longueur, caractères)', () => {
    expect(resolveHiddenValue('{{url.UTM_SOURCE}}', CTX).urlParam).toBeNull();
    expect(resolveHiddenValue(`{{url.${'a'.repeat(33)}}}`, CTX).urlParam).toBeNull();
    expect(resolveHiddenValue('{{url.pa-ram}}', CTX).urlParam).toBeNull();
  });
});
