import { test, expect } from '@playwright/test';

// Zone lisible du voile des héros (2026-09-18, retour user sur /expertises en
// mobile). Les voiles « blanc » et « degrade » de service-hero s'estompent
// vers la droite : la colonne de texte ne doit JAMAIS dépasser la zone où le
// voile couvre assez la photo (62 % de la largeur entre md et lg, 55 % à
// partir de lg — voir l'entête « ZONE LISIBLE DU VOILE » du composant). Sous
// md le voile devient quasi uniforme et le texte peut prendre toute la largeur.
const PAGES = ['/fr/expertises/', '/fr/services/productivite/copilot-studio/'];
const TIERS = [
  { width: 820, maxShare: 0.62 },
  { width: 1100, maxShare: 0.55 },
  { width: 1440, maxShare: 0.55 }, // plafond 688 px : 54 + 688 = 51,5 %
];

for (const path of PAGES) {
  for (const { width, maxShare } of TIERS) {
    test(`héros ${path} à ${width}px : le texte reste dans la zone voilée`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 });
      await page.goto(path);
      const hero = page.locator('main section').first();
      const column = hero.locator('.container-site > div').first();
      const heroBox = await hero.boundingBox();
      const columnBox = await column.boundingBox();
      expect(heroBox).not.toBeNull();
      expect(columnBox).not.toBeNull();
      // La règle est écrite en `vw` (fenêtre, barre de défilement comprise) : on
      // mesure donc contre la largeur de la fenêtre ; le héros, lui, fait la
      // largeur du document (≈ 15 px de moins avec une barre classique), écart
      // sans effet sur la lisibilité.
      expect(heroBox!.width).toBeGreaterThan(width - 40);
      const rightShare = (columnBox!.x + columnBox!.width) / width;
      expect(rightShare).toBeLessThanOrEqual(maxShare + 0.005);
    });
  }
}

test('héros /fr/expertises/ à 390px : voile quasi uniforme, texte pleine largeur', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/fr/expertises/');
  const veil = page.locator('main section').first().locator('div[aria-hidden="true"]').first();
  const background = await veil.evaluate((el) => getComputedStyle(el).backgroundImage);
  // Un seul dégradé, sans arrêt transparent : la photo n'est jamais à nu sous le texte.
  expect(background).toContain('linear-gradient');
  expect(background).not.toContain('rgba(255, 255, 255, 0)');
  expect(background).toContain('0.88');
});

// Héros de l'ACCUEIL (home-hero, 2026-09-18) : même défaut, même règle — le
// dégradé blanc s'estompe vers la droite, la colonne de texte ne sort jamais de
// la zone voilée (62 % entre md et lg, 55 % à partir de lg, plafond 672 px).
for (const { width, maxShare } of TIERS) {
  test(`héros de l'accueil à ${width}px : le texte reste dans la zone voilée`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/fr/');
    const hero = page.locator('main section').first();
    const column = hero.locator('.container-site > div').first();
    const columnBox = await column.boundingBox();
    expect(columnBox).not.toBeNull();
    const rightShare = (columnBox!.x + columnBox!.width) / width;
    expect(rightShare).toBeLessThanOrEqual(maxShare + 0.005);
  });
}

test("héros de l'accueil à 390px : voile quasi uniforme", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/fr/');
  const veil = page.locator('main section').first().locator('div[aria-hidden="true"] > div').first();
  const background = await veil.evaluate((el) => getComputedStyle(el).backgroundImage);
  expect(background).toContain('linear-gradient');
  expect(background).not.toContain('rgba(255, 255, 255, 0)');
  expect(background).toContain('0.88');
});
