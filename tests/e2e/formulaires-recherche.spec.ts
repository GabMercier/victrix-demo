import { test, expect } from '@playwright/test';

// Semaine 2026-08-17 — e2e formulaires + recherche + fil d'Ariane (story ADO
// F4.1 « Tests formulaires + moteur de recherche », extension P-20).
//
// Le serveur e2e est `astro dev` SANS clés : les formulaires sont en MODE
// MAQUETTE (aucun envoi réel) et l'index Pagefind n'existe pas (artefact de
// build) — ces tests couvrent le rendu, la validation native et les
// invariants de gabarit. Le POST réel (Turnstile, courriels, 303 → /merci) se
// vérifie sur une préversion Cloudflare avec les clés posées
// (docs/operations.md §7ter) ; la logique serveur est couverte par les tests
// unitaires (validation/registry/turnstile/smtp2go/confirmation).
test.describe('formulaires (mode maquette) + recherche + fil d’Ariane', () => {
  test('contact : la validation native bloque, puis la maquette confirme', async ({ page }) => {
    await page.goto('/fr/contact/');
    // Mode maquette : [data-contact-form] présent (PUBLIC_FORMS_ENABLED absent
    // du dev), aucun envoi possible.
    const form = page.locator('form[data-contact-form]');
    await expect(form).toHaveCount(1);
    // Soumission vide → la validation native bloque, le statut reste caché.
    await page.getByRole('button', { name: 'Envoyer le message' }).click();
    await expect(page.locator('[data-form-status]')).toBeHidden();
    // Remplir tous les requis puis soumettre → confirmation simulée visible.
    await page.fill('#firstname', 'Test');
    await page.fill('#lastname', 'Playwright');
    await page.fill('#email', 'test@example.com');
    await page.selectOption('#subject', 'Un projet');
    await page.selectOption('#expertise', 'Cybersécurité');
    await page.fill('#message', 'Message de test e2e.');
    await page.check('#consent');
    await page.getByRole('button', { name: 'Envoyer le message' }).click();
    await expect(page.locator('[data-form-status]')).toBeVisible();
  });

  test('cybersécurité : le formulaire lié rend les champs de sa définition', async ({ page }) => {
    await page.goto('/fr/services/cybersecurite/');
    const form = page.locator('#formulaire form');
    await expect(form).toBeVisible();
    // Champs de la définition campagne-evaluation (résolue AU BUILD par la
    // route — seam enrich) : preuve que formId fonctionne sur un SERVICE.
    await expect(form.getByLabel(/Nom complet/)).toBeVisible();
    await expect(form.getByLabel(/Courriel professionnel/)).toBeVisible();
    // Maquette : bouton désactivé tant que les clés ne sont pas posées.
    await expect(form.getByRole('button', { name: /Envoyer ma demande/ })).toBeDisabled();
  });

  test('fil d’Ariane : service enfant → Accueil + parent cliquables', async ({ page }) => {
    await page.goto('/fr/services/cybersecurite/zero-trust/');
    const crumbs = page.locator('nav[data-crumbs]');
    await expect(crumbs).toBeVisible();
    await expect(crumbs.getByRole('link', { name: 'Accueil' })).toBeVisible();
    await expect(crumbs.getByRole('link', { name: /cybersécurité/i })).toBeVisible();
  });

  test('fil d’Ariane : page générique → Accueil + page courante', async ({ page }) => {
    await page.goto('/fr/tarification/');
    const crumbs = page.locator('nav[data-crumbs]');
    await expect(crumbs).toBeVisible();
    await expect(crumbs.getByRole('link', { name: 'Accueil' })).toBeVisible();
    await expect(crumbs.locator('[aria-current="page"]')).toBeVisible();
  });

  test('recherche : textes CMS + point de montage Pagefind', async ({ page }) => {
    await page.goto('/fr/recherche/');
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Rechercher sur le site');
    await expect(page.locator('#search')).toHaveCount(1);
  });

  test('merci : textes CMS + boutons localisés', async ({ page }) => {
    await page.goto('/fr/merci/');
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Merci !');
    await expect(page.getByRole('link', { name: 'Retour à l’accueil' })).toBeVisible();
  });
});
