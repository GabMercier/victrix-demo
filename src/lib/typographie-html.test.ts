import { describe, expect, it } from 'vitest';
import { insecablesTexte, typographieHtml } from '../../scripts/lib/typographie-html.mjs';

/**
 * La typographie française est appliquée au HTML CONSTRUIT, et non dans le
 * renderer des sections — parce qu'y toucher a coûté les crayons de l'éditeur
 * visuel CloudCannon le 2026-09-23 (le plugin Bookshop trace le chemin des
 * données jusqu'aux composants ; passer les blocs par une fonction coupe ce
 * fil : 2 marqueurs `bookshop-live` avant, 0 après).
 *
 * Ce fichier verrouille donc les deux propriétés qui rendent la passe sûre :
 * elle transforme le TEXTE, et elle ne touche à RIEN d'autre — ni aux
 * attributs (donc ni aux marqueurs d'édition, ni aux URL), ni au code affiché.
 */

const NBSP = ' ';

describe('insecablesTexte — la règle, sur du texte nu', () => {
  it('colle le signe double au mot qui le précède', () => {
    expect(insecablesTexte('Notre offre : la suite')).toBe(`Notre offre${NBSP}: la suite`);
    expect(insecablesTexte('Vraiment ?')).toBe(`Vraiment${NBSP}?`);
    expect(insecablesTexte('« Le saviez-vous ? »')).toBe(`«${NBSP}Le saviez-vous${NBSP}?${NBSP}»`);
  });

  it("ne touche pas l'anglais, qui colle déjà ses deux-points", () => {
    const en = 'ServiceNow ITSM: Business-Led Strategy';
    expect(insecablesTexte(en)).toBe(en);
  });
});

describe('typographieHtml — sur un document', () => {
  it('transforme le texte des titres et des paragraphes', () => {
    const html = '<h1>Notre offre : la suite</h1><p>Et alors : voilà.</p>';
    expect(typographieHtml(html)).toBe(
      `<h1>Notre offre${NBSP}: la suite</h1><p>Et alors${NBSP}: voilà.</p>`,
    );
  });

  it('NE TOUCHE PAS aux attributs — donc ni aux marqueurs d’édition, ni aux URL', () => {
    const html =
      '<div data-bookshop-live="sections[0].title" title="Titre : x"><a href="https://victrix.ca/a b">Lien : ici</a></div>';
    const sortie = typographieHtml(html);
    // Les attributs sont rendus mot pour mot…
    expect(sortie).toContain('data-bookshop-live="sections[0].title"');
    expect(sortie).toContain('title="Titre : x"');
    expect(sortie).toContain('href="https://victrix.ca/a b"');
    // …et seul le texte du lien a changé.
    expect(sortie).toContain(`Lien${NBSP}: ici`);
  });

  it('laisse intact le contenu de script, style, pre et code', () => {
    const html =
      '<script>const a = { b : 1 };</script><style>.x { color : red }</style>' +
      '<pre>a : b</pre><code>if (x) { y : z }</code><p>Texte : oui</p>';
    const sortie = typographieHtml(html);
    expect(sortie).toContain('const a = { b : 1 };');
    expect(sortie).toContain('.x { color : red }');
    expect(sortie).toContain('<pre>a : b</pre>');
    expect(sortie).toContain('<code>if (x) { y : z }</code>');
    expect(sortie).toContain(`Texte${NBSP}: oui`);
  });

  it('est idempotente — repasser sur une page déjà traitée ne change rien', () => {
    const une = typographieHtml('<h2>Stratégie : IaaS ; SaaS</h2>');
    expect(typographieHtml(une)).toBe(une);
  });

  it('laisse un document sans signe double strictement inchangé', () => {
    const html = '<h1>Hello world</h1><p>Nothing to do here.</p>';
    expect(typographieHtml(html)).toBe(html);
  });
});
