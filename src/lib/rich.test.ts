import { describe, expect, it } from 'vitest';
import { blockHtml, hasRichText, inlineHtml, sanitizeRichHtml } from '../../component-library/src/shared/rich';

describe('sanitizeRichHtml — filet de sécurité au build', () => {
  it('laisse passer le texte nu et les balises autorisées', () => {
    expect(sanitizeRichHtml('Texte simple')).toBe('Texte simple');
    expect(sanitizeRichHtml('<p>Un <strong>mot</strong> et <em>un autre</em></p>')).toBe(
      '<p>Un <strong>mot</strong> et <em>un autre</em></p>',
    );
    expect(sanitizeRichHtml('<ul><li>a</li><li>b</li></ul>')).toBe('<ul><li>a</li><li>b</li></ul>');
  });

  it('retire les balises et attributs hors liste blanche en gardant le texte', () => {
    expect(sanitizeRichHtml('<div style="color:red"><p class="x">ok</p></div>')).toBe('<p>ok</p>');
    expect(sanitizeRichHtml('<script>alert(1)</script>bonjour')).toBe('bonjour');
    expect(sanitizeRichHtml('<p style="margin:0" data-x="1">ok</p>')).toBe('<p>ok</p>');
    expect(sanitizeRichHtml('<table><tr><td>cell</td></tr></table>')).toBe('cell');
  });

  it('garde href/target/rel sur les liens, refuse javascript: et les classes inconnues', () => {
    expect(sanitizeRichHtml('<a href="/fr/contact" target="_blank" rel="noopener" onclick="x()">lien</a>')).toBe(
      '<a href="/fr/contact" target="_blank" rel="noopener">lien</a>',
    );
    expect(sanitizeRichHtml('<a href="javascript:alert(1)">x</a>')).toBe('<a>x</a>');
    expect(sanitizeRichHtml('<a class="btn foo" href="/x">Bouton</a>')).toBe('<a class="btn" href="/x">Bouton</a>');
    expect(sanitizeRichHtml('<a class="weird" href="/x">l</a>')).toBe('<a href="/x">l</a>');
  });

  it('ne touche pas aux chaînes sans balise ni aux comparaisons', () => {
    expect(sanitizeRichHtml('a < b et c > d')).toBe('a < b et c > d');
    expect(sanitizeRichHtml('')).toBe('');
  });
});

describe('inlineHtml — champ rendu dans un <p> existant', () => {
  it('retire l’emballage <p> de l’éditeur', () => {
    expect(inlineHtml('<p>Un <strong>chapeau</strong></p>')).toBe('Un <strong>chapeau</strong>');
  });
  it('joint plusieurs paragraphes par <br>', () => {
    expect(inlineHtml('<p>a</p><p>b</p>')).toBe('a<br>b');
    expect(inlineHtml('<p>a</p>\n<p>b</p>')).toBe('a<br>b');
  });
  it('rend le texte nu tel quel et tolère vide/null', () => {
    expect(inlineHtml('texte')).toBe('texte');
    expect(inlineHtml('')).toBe('');
    expect(inlineHtml(null)).toBe('');
  });
  it('aplatit une liste collée par erreur en gardant le texte', () => {
    expect(inlineHtml('<ul><li>a</li><li>b</li></ul>')).toBe('a<br>b');
  });
});

describe('blockHtml — champ rendu dans un <div class="rich">', () => {
  it('enveloppe un texte nu dans un <p>', () => {
    expect(blockHtml('Intro simple')).toBe('<p>Intro simple</p>');
    expect(blockHtml('Un <strong>mot</strong>')).toBe('<p>Un <strong>mot</strong></p>');
  });
  it('laisse le HTML bloc tel quel', () => {
    expect(blockHtml('<p>a</p><ul><li>b</li></ul>')).toBe('<p>a</p><ul><li>b</li></ul>');
  });
  it('vide → chaîne vide', () => {
    expect(blockHtml('')).toBe('');
    expect(blockHtml(undefined)).toBe('');
  });
});

describe('hasRichText', () => {
  it('détecte un contenu visible derrière les balises', () => {
    expect(hasRichText('<p></p>')).toBe(false);
    expect(hasRichText('<p>&nbsp;</p>')).toBe(false);
    expect(hasRichText('<p>x</p>')).toBe(true);
    expect(hasRichText('')).toBe(false);
  });
});
