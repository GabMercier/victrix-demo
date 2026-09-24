import { test, expect } from '@playwright/test';

/**
 * Forme des articles — les 4 patrons (lot 4, 2026-09-24), sur la page de
 * démonstration interne /fr/style-guide/forme-articles/ (rend
 * src/data/demo/forme-articles.md dans le conteneur des articles).
 *
 *  1. le bouton (a.btn) n'est pas souligné et porte la couleur d'action ;
 *  2. l'encadré et le tableau ont un fond (ils se distinguent du texte) ;
 *  3. la FAQ se déplie et se replie SANS script (details/summary natifs),
 *     au clic comme au clavier ;
 *  4. sur téléphone (390 px) le tableau défile dans SON conteneur et la
 *     page ne défile pas horizontalement (CLAUDE.md : gouttière, pas de
 *     débordement).
 * L'accessibilité (axe-core) de la même page est dans accessibilite.spec.ts.
 */
const PAGE = '/fr/style-guide/forme-articles/';

test.describe('forme des articles', () => {
  test('bouton, encadré, tableau : rendus par global.css sous .prose', async ({ page }) => {
    await page.goto(PAGE);
    const bouton = page.locator('.prose a.btn').first();
    await expect(bouton).toBeVisible();
    await expect(bouton).toHaveCSS('text-decoration-line', 'none');
    const fond = await bouton.evaluate((el) => getComputedStyle(el).backgroundColor);
    expect(fond, 'le bouton doit avoir un fond (couleur d’action)').not.toBe('rgba(0, 0, 0, 0)');

    const encadre = page.locator('.prose .article-encadre').first();
    await expect(encadre).toBeVisible();
    expect(await encadre.evaluate((el) => getComputedStyle(el).backgroundColor)).not.toBe('rgba(0, 0, 0, 0)');
    await expect(encadre.locator('.article-encadre__titre')).toHaveText(/Le saviez-vous/);

    const th = page.locator('.prose .article-tableau thead th').first();
    await expect(th).toBeVisible();
    expect(await th.evaluate((el) => getComputedStyle(el).backgroundColor)).not.toBe('rgba(0, 0, 0, 0)');
  });

  test('la FAQ se déplie et se replie sans script, à la souris et au clavier', async ({ page }) => {
    // Aucun script de page ne doit être nécessaire : on coupe JavaScript.
    await page.context().route('**/*.js', (route) => route.abort());
    await page.goto(PAGE);
    const faq = page.locator('.prose details.article-faq');
    expect(await faq.count()).toBeGreaterThanOrEqual(2);

    const premiere = faq.first();
    const reponse = premiere.locator('p').first();
    await expect(premiere).not.toHaveAttribute('open', /.*/);
    await expect(reponse).toBeHidden();

    await premiere.locator('summary').click();
    await expect(premiere).toHaveAttribute('open', /.*/);
    await expect(reponse).toBeVisible();

    // Clavier : Tab jusqu'au résumé de la deuxième, Entrée l'ouvre, Espace la ferme.
    const seconde = faq.nth(1);
    await seconde.locator('summary').focus();
    await page.keyboard.press('Enter');
    await expect(seconde).toHaveAttribute('open', /.*/);
    await page.keyboard.press('Space');
    await expect(seconde).not.toHaveAttribute('open', /.*/);
  });

  test('téléphone : le tableau défile dans son conteneur, la page ne déborde pas', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(PAGE);
    const conteneur = page.locator('.prose .article-tableau').first();
    await expect(conteneur).toHaveCSS('overflow-x', 'auto');
    const mesures = await conteneur.evaluate((el) => ({
      scroll: el.scrollWidth,
      client: el.clientWidth,
    }));
    expect(mesures.scroll, 'le tableau doit être plus large que son conteneur (sinon rien à tester)').toBeGreaterThan(
      mesures.client,
    );
    const debordement = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    );
    expect(debordement, 'la page ne doit pas défiler horizontalement').toBeLessThanOrEqual(0);
  });
});
