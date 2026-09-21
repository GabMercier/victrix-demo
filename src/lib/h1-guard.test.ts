import { describe, expect, it } from 'vitest';
import { auditPages, countH1, h1Verdict, isRedirectStub } from '../../scripts/lib/h1-guard.mjs';

const page = (h1s: number) =>
  `<html><body>${'<h1 class="x">T</h1>'.repeat(h1s)}<h2>s</h2></body></html>`;

describe('garde-fou H1 (Phase 2)', () => {
  it('compte les <h1> ouvrants, attributs ou non', () => {
    expect(countH1('<h1>a</h1>')).toBe(1);
    expect(countH1('<h1 class="t">a</h1><h1>b</h1>')).toBe(2);
    expect(countH1('<h10>x</h10><h2>y</h2>')).toBe(0);
  });

  it('reconnaît un stub de redirection', () => {
    expect(isRedirectStub('<meta http-equiv="refresh" content="0;url=/fr/">')).toBe(true);
    expect(isRedirectStub(page(1))).toBe(false);
  });

  it('verdict : ok / warn / error / skip', () => {
    expect(h1Verdict('fr/services/cybersecurite/index.html', page(1))).toBe('ok');
    expect(h1Verdict('fr/produits/index.html', page(0))).toBe('warn');
    expect(h1Verdict('fr/produits/index.html', page(2))).toBe('error');
    expect(h1Verdict('fr/style-guide/index.html', page(4))).toBe('skip');
    expect(h1Verdict('fr/portail/index.html', page(0))).toBe('skip');
    expect(h1Verdict('404.html', page(0))).toBe('skip');
    expect(h1Verdict('index.html', '<meta http-equiv="refresh" content="0;url=/fr/">')).toBe('skip');
  });

  it('audite un lot de pages', () => {
    const r = auditPages([
      { path: 'fr/index.html', html: page(1) },
      { path: 'fr/a/index.html', html: page(0) },
      { path: 'fr/b/index.html', html: page(3) },
      { path: 'fr/recherche/index.html', html: page(0) },
    ]);
    expect(r.ok).toBe(1);
    expect(r.warnings).toEqual(['fr/a/index.html']);
    expect(r.errors).toEqual(['fr/b/index.html (3 H1)']);
    expect(r.skipped).toBe(1);
  });
});
