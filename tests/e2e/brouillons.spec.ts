import { test, expect } from '@playwright/test';
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

/**
 * Brouillons d'articles hors du site PUBLIC (D19 + lot L16, 2026-09-24).
 *
 * Le serveur de développement que Playwright démarre n'a PAS `EDITOR_PREVIEW`
 * — il applique donc la politique publique, celle du site de production
 * CloudCannon. Ce test vérifie que ce qu'un brouillon (« draft: true ») ne
 * doit plus faire en production, il ne le fait pas :
 *  1. son adresse ne répond pas (404) ;
 *  2. la liste des ressources ne le propose pas ;
 *  3. aucune page publiée ne le lie (articles liés, « derniers articles »,
 *     sélecteur de langue / hreflang d'une traduction publiée).
 *
 * DÉCOUPLÉ DU CONTENU : les brouillons sont LUS dans src/content/blog (front
 * matter) ; retirer ou publier un article au CMS ne casse pas le test. Sans
 * aucun brouillon, les tests sautent avec le motif.
 */

interface Article {
  lang: 'fr' | 'en';
  fichier: string;
  slug: string;
  draft: boolean;
}

function lireArticles(): Article[] {
  const racine = join(process.cwd(), 'src', 'content', 'blog');
  const articles: Article[] = [];
  for (const lang of ['fr', 'en'] as const) {
    for (const nom of readdirSync(join(racine, lang)).filter((n) => n.endsWith('.md'))) {
      const texte = readFileSync(join(racine, lang, nom), 'utf-8');
      const fin = texte.indexOf('\n---', 4);
      const fm = texte.slice(4, fin);
      const slug = /^slug:\s*"?([^"\n]*)"?/m.exec(fm)?.[1]?.trim() || nom.replace(/\.md$/, '');
      const draft = /^draft:\s*true\s*$/m.test(fm);
      articles.push({ lang, fichier: nom.replace(/\.md$/, ''), slug, draft });
    }
  }
  return articles;
}

const ARTICLES = lireArticles();
const BROUILLONS = ARTICLES.filter((a) => a.draft);
const url = (a: Article) => `/${a.lang}/ressources/${a.slug}/`;

test.describe('brouillons hors du site public', () => {
  test('un brouillon n’a pas de page (404) et n’est pas listé dans les ressources', async ({ page }) => {
    test.skip(BROUILLONS.length === 0, 'aucun article en brouillon dans src/content/blog');
    for (const lang of ['fr', 'en'] as const) {
      const brouillons = BROUILLONS.filter((a) => a.lang === lang);
      if (brouillons.length === 0) continue;
      await page.goto(`/${lang}/ressources/`);
      for (const a of brouillons) {
        await expect(page.locator(`a[href="${url(a)}"]`), `${url(a)} listé dans les ressources`).toHaveCount(0);
      }
    }
    for (const a of BROUILLONS) {
      const reponse = await page.goto(url(a));
      expect(reponse?.status(), `${url(a)} devrait répondre 404`).toBe(404);
    }
  });

  test('aucune page publiée ne lie un brouillon (articles liés, derniers articles, hreflang)', async ({ page }) => {
    test.skip(BROUILLONS.length === 0, 'aucun article en brouillon dans src/content/blog');
    const cibles = new Set(BROUILLONS.map(url));
    // Pages les plus exposées : accueil (derniers articles), ressources, et
    // chaque article PUBLIÉ dont la traduction est un brouillon (sélecteur de
    // langue) — plus les deux premiers articles publiés de chaque langue
    // (bloc « articles liés »).
    const publies = ARTICLES.filter((a) => !a.draft);
    const jumeauBrouillon = publies.filter((a) =>
      BROUILLONS.some((b) => b.fichier === a.fichier && b.lang !== a.lang),
    );
    const pages = [
      '/fr/',
      '/en/',
      '/fr/ressources/',
      '/en/ressources/',
      ...jumeauBrouillon.map(url),
      ...publies.filter((a) => a.lang === 'fr').slice(0, 2).map(url),
      ...publies.filter((a) => a.lang === 'en').slice(0, 2).map(url),
    ];
    for (const chemin of [...new Set(pages)]) {
      await page.goto(chemin);
      const hrefs = await page
        .locator('a[href], link[rel="alternate"][href]')
        .evaluateAll((els) => els.map((el) => new URL((el as HTMLAnchorElement).href).pathname));
      const fautifs = hrefs.filter((h) => cibles.has(h.endsWith('/') ? h : `${h}/`));
      expect(fautifs, `${chemin} lie un brouillon`).toEqual([]);
    }
  });
});
