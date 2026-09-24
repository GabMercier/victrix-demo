import { test, expect } from '@playwright/test';

/**
 * Forme des articles — les 5 patrons (lot 4, 2026-09-24 ; bandeau CTA :
 * lot L-cta-articles, 2026-09-24), sur la page de
 * démonstration interne /fr/style-guide/forme-articles/ (rend
 * src/data/demo/forme-articles.md dans le conteneur des articles).
 *
 *  1. le bouton (a.btn) n'est pas souligné et porte la couleur d'action ;
 *  2. l'encadré et le tableau ont un fond (ils se distinguent du texte) ;
 *  3. la FAQ se déplie et se replie SANS script (details/summary natifs),
 *     au clic comme au clavier ;
 *  4. sur téléphone (390 px) le tableau défile dans SON conteneur et la
 *     page ne défile pas horizontalement (CLAUDE.md : gouttière, pas de
 *     débordement) ;
 *  5. le bandeau CTA (div.article-cta) est un panneau sur fond, ses boutons
 *     partagent une rangée sur écran large et restent dans le panneau sur
 *     téléphone ; la peau marine inverse titre et boutons (blanc / bleu).
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

  test('bandeau CTA : panneau sur fond, titre, boutons en rangée ; peau marine inversée', async ({ page }) => {
    await page.goto(PAGE);
    const bandeaux = page.locator('.prose .article-cta');
    expect(await bandeaux.count()).toBeGreaterThanOrEqual(2);

    const ivoire = bandeaux.first();
    await expect(ivoire).toBeVisible();
    expect(await ivoire.evaluate((el) => getComputedStyle(el).backgroundColor)).not.toBe('rgba(0, 0, 0, 0)');
    await expect(ivoire.locator('.article-cta__surtitre')).toBeVisible();
    await expect(ivoire.locator('.article-cta__titre')).toHaveText(/posture de sécurité/);
    const boutons = ivoire.locator('a.btn, a.btn-outline');
    expect(await boutons.count()).toBe(2);
    await expect(boutons.nth(0)).toHaveCSS('text-decoration-line', 'none');
    const [b1, b2] = await Promise.all([boutons.nth(0).boundingBox(), boutons.nth(1).boundingBox()]);
    if (!b1 || !b2) throw new Error('boutons du bandeau sans boîte');
    expect(Math.abs(b1.y - b2.y), 'sur écran large, les deux boutons partagent la même rangée').toBeLessThan(2);
    expect(b2.x - (b1.x + b1.width), 'un espace sépare les deux boutons').toBeGreaterThanOrEqual(8);

    const marine = page.locator('.prose .article-cta--marine').first();
    await expect(marine).toBeVisible();
    await expect(marine).toHaveCSS('background-color', 'rgb(0, 13, 46)');
    await expect(marine.locator('.article-cta__titre')).toHaveCSS('color', 'rgb(255, 255, 255)');
    const plein = marine.locator('a.btn').first();
    await expect(plein).toHaveCSS('background-color', 'rgb(255, 255, 255)');
    await expect(plein).toHaveCSS('color', 'rgb(29, 70, 243)');
    const contour = marine.locator('a.btn-outline').first();
    await expect(contour).toHaveCSS('color', 'rgb(255, 255, 255)');
    await expect(contour).toHaveCSS('border-top-color', 'rgb(255, 255, 255)');
  });

  test('téléphone : les boutons du bandeau restent dans le panneau, la page ne déborde pas', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(PAGE);
    const ivoire = page.locator('.prose .article-cta').first();
    const boutons = ivoire.locator('a.btn, a.btn-outline');
    const [b1, b2, panneau] = await Promise.all([
      boutons.nth(0).boundingBox(),
      boutons.nth(1).boundingBox(),
      ivoire.boundingBox(),
    ]);
    if (!b1 || !b2 || !panneau) throw new Error('bandeau ou boutons sans boîte');
    for (const b of [b1, b2]) {
      expect(b.x, 'le bouton commence dans le panneau').toBeGreaterThanOrEqual(panneau.x);
      expect(b.x + b.width, 'le bouton finit dans le panneau').toBeLessThanOrEqual(panneau.x + panneau.width + 0.5);
    }
    const debordement = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    );
    expect(debordement, 'la page ne doit pas défiler horizontalement').toBeLessThanOrEqual(0);
  });
});
