import { test, expect } from '@playwright/test';

// 2026-09-18 — deux parcours réparés le même jour.
//
// 1. Catalogue de solutions → Contact : « Découvrir » arrivait sur un
//    formulaire dont le champ OBLIGATOIRE « Service » restait vide. Le lien
//    porte désormais ?expertise= (clé `contactService` de la fiche, repli sur
//    celle de la page du catalogue) et le sujet dédié « Une solution du
//    catalogue ». Les valeurs sont LUES sur la page (pas de libellé en dur) :
//    ce sont des textes éditables au CMS — seul l'invariant est testé : aucun
//    champ obligatoire prérempli ne reste vide.
// 2. Loi 25 : « Gérer mes témoins » (pied de page) rouvre le bandeau de
//    consentement après un choix — retirer son consentement doit être aussi
//    simple que le donner.
test.describe('catalogue → contact prérempli', () => {
  for (const lang of ['fr', 'en'] as const) {
    test(`${lang} : « Découvrir » préremplit sujet, SERVICE et précision`, async ({ page }) => {
      await page.goto(`/${lang}/solutions/`);
      const discover = page.locator(`a[href^="/${lang}/contact?"][href*="produit="]`).first();
      const href = await discover.getAttribute('href');
      expect(href).toContain('expertise=');
      expect(href).toContain('sujet=');
      await page.goto(href!);
      // Les trois champs pilotés par l'URL sont remplis — dont « Service » (requis).
      await expect(page.locator('#subject')).not.toHaveValue('');
      await expect(page.locator('#expertise')).not.toHaveValue('');
      await expect(page.locator('#request')).not.toHaveValue('');
      // …et chaque valeur est une VRAIE option de la liste (sinon le select l'ignore).
      const params = new URL(href!, 'http://localhost').searchParams;
      await expect(page.locator('#subject')).toHaveValue(params.get('sujet')!);
      await expect(page.locator('#expertise')).toHaveValue(params.get('expertise')!);
    });
  }
});

test.describe('consentement — « Gérer mes témoins »', () => {
  test('le lien du pied de page rouvre le bandeau après un refus', async ({ page }) => {
    await page.goto('/fr/');
    const banner = page.locator('[data-consent-banner]');
    await expect(banner).toBeVisible();
    await banner.locator('[data-consent-refuse]').click();
    await expect(banner).toBeHidden();
    // Choix mémorisé : le bandeau ne revient pas tout seul…
    await page.reload();
    await expect(banner).toBeHidden();
    // …mais le visiteur peut le rouvrir, et changer d'avis.
    await page.locator('footer [data-consent-manage]').click();
    await expect(banner).toBeVisible();
    await banner.locator('[data-consent-accept]').click();
    await expect(banner).toBeHidden();
    expect(await page.evaluate(() => localStorage.getItem('victrix-consent'))).toBe('accepted');
  });

  test('passer d’« accepté » à « refusé » recharge la page (les scripts déjà exécutés ne se déchargent pas)', async ({
    page,
  }) => {
    await page.goto('/fr/');
    await page.locator('[data-consent-accept]').click();
    await page.locator('footer [data-consent-manage]').click();
    await Promise.all([page.waitForEvent('load'), page.locator('[data-consent-refuse]').click()]);
    expect(await page.evaluate(() => localStorage.getItem('victrix-consent'))).toBe('refused');
    await expect(page.locator('html')).not.toHaveClass(/consent-analytics/);
  });
});
