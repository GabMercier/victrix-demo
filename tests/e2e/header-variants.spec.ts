import { test, expect } from '@playwright/test';

// P-04 — variantes d'en-tête/pied de page des campagnes. Preuves de la fiche :
// une campagne « allégée » ne montre que logo + CTA ; une campagne SANS bloc
// `header` garde le chrome complet ; les autres pages sont inchangées.
test.describe('variantes header/footer des campagnes (P-04)', () => {
  test('campagne allégée : logo + CTA seulement, pied de page réduit', async ({ page }) => {
    await page.goto('/fr/campagnes/evaluation-securite/');

    // Chrome de campagne présent.
    await expect(page.locator('header.campaign-header')).toBeVisible();
    await expect(page.locator('.campaign-header__brand')).toBeVisible();
    await expect(page.getByRole('link', { name: 'Demander mon évaluation' }).first()).toBeVisible();

    // Chrome complet ABSENT — nav, méga-menus, recherche, annonce, tiroir.
    await expect(page.locator('header.site-header')).toHaveCount(0);
    await expect(page.locator('nav.primary-nav')).toHaveCount(0);
    await expect(page.locator('.site-header__search')).toHaveCount(0);
    await expect(page.locator('[data-nav-toggle]')).toHaveCount(0);
    await expect(page.locator('[data-announcement]')).toHaveCount(0);
    // Allégé strict (fiche P-04) : pas de sélecteur de langue ni de recherche.
    await expect(page.locator('.lang-switch')).toHaveCount(0);
    await expect(page.locator('.campaign-header__search')).toHaveCount(0);

    // Pied de page réduit : barre légale sans colonnes de liens.
    await expect(page.locator('footer.campaign-footer')).toBeVisible();
    await expect(page.locator('footer.site-footer')).toHaveCount(0);
    await expect(page.locator('.footer-col')).toHaveCount(0);
  });

  test('campagne sans bloc header : chrome complet (parité)', async ({ page }) => {
    await page.goto('/fr/campagnes/demo-sections/');
    await expect(page.locator('header.site-header')).toBeVisible();
    await expect(page.locator('nav.primary-nav')).toBeVisible();
    await expect(page.locator('footer.site-footer')).toBeVisible();
    await expect(page.locator('header.campaign-header')).toHaveCount(0);
  });

  test('accueil : chrome complet inchangé', async ({ page }) => {
    await page.goto('/fr/');
    await expect(page.locator('header.site-header')).toBeVisible();
    await expect(page.locator('.site-header__search')).toBeVisible();
    await expect(page.locator('footer.site-footer')).toBeVisible();
    await expect(page.locator('header.campaign-header')).toHaveCount(0);
  });
});
