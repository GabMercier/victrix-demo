import { test, expect } from '@playwright/test';

test.describe('routing & i18n', () => {
  test('root redirects to /fr', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveURL(/\/fr\/?$/);
  });

  test('language switch goes from FR to EN home', async ({ page }) => {
    await page.goto('/fr');
    await page.getByRole('link', { name: 'EN', exact: true }).first().click();
    await expect(page).toHaveURL(/\/en\/?$/);
    await expect(page.locator('html')).toHaveAttribute('lang', 'en-CA');
  });
});

// 2026-08-18 : le portail MOCK (tableau de bord, routes /auth/*, middleware,
// session) est RETIRÉ — seule la page de connexion VISUELLE subsiste,
// prérendue, bouton désactivé (l'intégration Entra réelle suivra
// docs/portail-auth.md).
test.describe('client portal (login page only)', () => {
  test('login page renders with a disabled sign-in button', async ({ page }) => {
    await page.goto('/fr/portail');
    await expect(page.getByRole('heading', { name: 'Mon portail' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Se connecter' })).toBeDisabled();
  });

  test('the old dashboard route is gone', async ({ page }) => {
    const response = await page.goto('/fr/portail/tableau-de-bord');
    expect(response?.status()).toBe(404);
  });
});
