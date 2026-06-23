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

test.describe('client portal (mock)', () => {
  test('sign in lands on the dashboard, then sign out', async ({ page }) => {
    await page.goto('/fr/portail');
    await page.getByRole('button', { name: 'Se connecter' }).click();

    await expect(page).toHaveURL(/\/fr\/portail\/tableau-de-bord/);
    await expect(page.getByRole('heading', { name: 'Mes contrats' })).toBeVisible();

    await page.getByRole('button', { name: 'Se déconnecter' }).click();
    await expect(page).toHaveURL(/\/fr\/portail/);
  });

  test('dashboard is guarded when signed out', async ({ page }) => {
    await page.goto('/fr/portail/tableau-de-bord');
    // Middleware bounces unauthenticated users back to the login.
    await expect(page).toHaveURL(/\/fr\/portail\?returnTo=/);
  });
});
