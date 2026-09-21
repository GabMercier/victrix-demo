import { test, expect } from '@playwright/test';

/**
 * BANC D'ESSAI (2026-09-21, TEMPORAIRE — à supprimer avec
 * src/styles/banc-essai.css quand la police et le bleu seront tranchés).
 *
 * Le point le plus important est le PREMIER test : sans paramètre, le banc
 * doit être totalement inerte — aucun attribut, aucune requête vers Google
 * Fonts, aucune étiquette. C'est ce qui permet de le laisser en place pendant
 * l'arbitrage sans rien changer pour les visiteurs.
 */
const couleurDe = (css: string) => css.replace(/\s/g, '');

test('sans paramètre : le banc est inerte (aucun visiteur ne le voit)', async ({ page }) => {
  const versGoogle: string[] = [];
  page.on('request', (r) => {
    if (/fonts\.(googleapis|gstatic)\.com/.test(r.url())) versGoogle.push(r.url());
  });
  await page.goto('/fr/');
  await page.waitForLoadState('networkidle');

  await expect(page.locator('html')).not.toHaveAttribute('data-police', /./);
  await expect(page.locator('html')).not.toHaveAttribute('data-bleu', /./);
  await expect(page.locator('.banc-essai-etiquette')).toHaveCount(0);
  expect(versGoogle, 'aucune requête ne doit partir vers Google Fonts').toEqual([]);
});

test('?bleu=figma rebascule toute la palette bleue sur celle des maquettes', async ({ page }) => {
  await page.goto('/fr/?bleu=figma');
  await expect(page.locator('html')).toHaveAttribute('data-bleu', 'figma');

  const primary = await page.evaluate(() =>
    getComputedStyle(document.documentElement).getPropertyValue('--color-primary'),
  );
  expect(couleurDe(primary)).toBe('#002fc7');

  // Et un élément qui consomme réellement le jeton (pas seulement la variable).
  const rendu = await page.evaluate(() => {
    const el = document.createElement('div');
    el.className = 'bg-primary';
    document.body.appendChild(el);
    const c = getComputedStyle(el).backgroundColor;
    el.remove();
    return c;
  });
  expect(rendu).toBe('rgb(0, 47, 199)');

  // L'étiquette dit ce qu'on regarde.
  await expect(page.locator('.banc-essai-etiquette')).toContainText('figma');
});

test('?police=montserrat charge la police et l’applique', async ({ page }) => {
  await page.goto('/fr/?police=montserrat');
  await expect(page.locator('html')).toHaveAttribute('data-police', 'montserrat');
  await expect(page.locator('#banc-essai-police')).toHaveAttribute('href', /Montserrat/);
  const famille = await page.evaluate(() => getComputedStyle(document.body).fontFamily);
  expect(famille).toContain('Montserrat');
});

test('le choix survit à la navigation, et ?banc=off le retire', async ({ page }) => {
  await page.goto('/fr/?police=hanken&bleu=figma');
  await expect(page.locator('html')).toHaveAttribute('data-bleu', 'figma');

  // Navigation interne SANS paramètre : le choix est mémorisé.
  await page.goto('/fr/contact');
  await expect(page.locator('html')).toHaveAttribute('data-bleu', 'figma');
  await expect(page.locator('html')).toHaveAttribute('data-police', 'hanken');

  await page.goto('/fr/contact?banc=off');
  await expect(page.locator('html')).not.toHaveAttribute('data-bleu', /./);
  await expect(page.locator('html')).not.toHaveAttribute('data-police', /./);
  await expect(page.locator('.banc-essai-etiquette')).toHaveCount(0);
});
