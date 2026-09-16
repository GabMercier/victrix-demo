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
// prérendue. 2026-09-10 (recette user) : carte épurée, bouton ACTIF mais sans
// destination (parité avec le site actuel), vue « Mot de passe oublié »
// (l'intégration Entra réelle suivra docs/portail-auth.md).
test.describe('client portal (login page only)', () => {
  test('login renders; sign-in is enabled but leads nowhere', async ({ page }) => {
    await page.goto('/fr/portail');
    await expect(page.getByRole('heading', { name: 'Portail client' })).toBeVisible();
    const submit = page.getByRole('button', { name: 'Connexion' });
    await expect(submit).toBeEnabled();
    // Champs remplis → le submit valide est intercepté : aucune navigation.
    await page.locator('#pl-email').fill('test@victrix.ca');
    await page.locator('#pl-password').fill('secret');
    await submit.click();
    await expect(page).toHaveURL(/\/fr\/portail\/?$/);
  });

  test('« Mot de passe oublié » shows the email-only reset form', async ({ page }) => {
    await page.goto('/fr/portail');
    await page.getByRole('button', { name: 'Mot de passe oublié' }).click();
    await expect(page.getByText('Entrez le courriel associé avec votre compte pour réinitialiser le mot de passe.')).toBeVisible();
    await expect(page.locator('#pl-reset-email')).toBeVisible();
    await expect(page.locator('#pl-password')).toBeHidden();
    // Retour à la connexion.
    await page.getByRole('button', { name: 'Retour à la connexion' }).click();
    await expect(page.locator('#pl-password')).toBeVisible();
  });

  test('the old dashboard route is gone', async ({ page }) => {
    const response = await page.goto('/fr/portail/tableau-de-bord');
    expect(response?.status()).toBe(404);
  });
});
