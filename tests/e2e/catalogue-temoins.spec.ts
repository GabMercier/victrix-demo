import { test, expect, type Page } from '@playwright/test';

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

/** Choix mémorisé — le format daté vit dans src/lib/consent/record.ts. */
const storedChoice = (page: Page) =>
  page.evaluate(() => JSON.parse(localStorage.getItem('victrix-consent') ?? 'null')?.choice ?? null);

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
    expect(await storedChoice(page)).toBe('accepted');
  });

  test('passer d’« accepté » à « refusé » recharge la page (les scripts déjà exécutés ne se déchargent pas)', async ({
    page,
  }) => {
    await page.goto('/fr/');
    await page.locator('[data-consent-accept]').click();
    await page.locator('footer [data-consent-manage]').click();
    await Promise.all([page.waitForEvent('load'), page.locator('[data-consent-refuse]').click()]);
    expect(await storedChoice(page)).toBe('refused');
    await expect(page.locator('html')).not.toHaveClass(/consent-analytics/);
  });

  test('aucun script de mesure ne s’exécute avant « Accepter » ; il s’exécute juste après', async ({ page }) => {
    await page.goto('/fr/');
    // Même contrat que les balises GA4 de BaseLayout : script INERTE tant que
    // le visiteur n'a pas accepté (le serveur e2e n'a pas d'identifiant GA4,
    // on pose donc un témoin du contrat).
    await page.evaluate(() => {
      const inert = document.createElement('script');
      inert.type = 'text/plain';
      inert.dataset.consent = 'analytics';
      inert.textContent = 'window.__mesure = true;';
      document.head.append(inert);
    });
    expect(await page.evaluate(() => (window as unknown as { __mesure?: boolean }).__mesure)).toBeUndefined();
    await page.locator('[data-consent-accept]').click();
    expect(await page.evaluate(() => (window as unknown as { __mesure?: boolean }).__mesure)).toBe(true);
    await expect(page.locator('html')).toHaveClass(/consent-analytics/);
  });

  test('refuser efface les témoins de mesure déjà posés, et eux seuls', async ({ page }) => {
    await page.goto('/fr/');
    await page.evaluate(() => {
      document.cookie = '_ga=GA1.1.1.1; path=/';
      document.cookie = '_ga_E2E0000000=GS1.1.1; path=/';
      document.cookie = 'autre=garde; path=/';
    });
    await page.locator('[data-consent-refuse]').click();
    const cookies = await page.evaluate(() => document.cookie);
    expect(cookies).not.toContain('_ga');
    expect(cookies).toContain('autre=garde');
  });

  test('le choix est daté : périmé (≈ 6 mois) ou à l’ancien format, il est redemandé', async ({ page }) => {
    await page.goto('/fr/');
    const banner = page.locator('[data-consent-banner]');
    await banner.locator('[data-consent-accept]').click();
    const record = JSON.parse((await page.evaluate(() => localStorage.getItem('victrix-consent'))) ?? '{}');
    expect(record.choice).toBe('accepted');
    expect(Number.isNaN(Date.parse(record.date))).toBe(false);

    // Vieillir le choix de 200 jours → le bandeau revient, rien n'est activé.
    await page.evaluate((r) => {
      const old = new Date(Date.now() - 200 * 86_400_000).toISOString();
      localStorage.setItem('victrix-consent', JSON.stringify({ ...r, date: old }));
    }, record);
    await page.reload();
    await expect(banner).toBeVisible();
    await expect(page.locator('html')).not.toHaveClass(/consent-analytics/);

    // Ancien format (chaîne nue, sans date) → redemandé aussi.
    await page.evaluate(() => localStorage.setItem('victrix-consent', 'accepted'));
    await page.reload();
    await expect(banner).toBeVisible();
  });

  test('les deux boutons ont le même poids visuel (refuser aussi simple qu’accepter)', async ({ page }) => {
    await page.goto('/fr/');
    const look = (sel: string) =>
      page.locator(sel).evaluate((el) => {
        const c = getComputedStyle(el);
        return [c.backgroundColor, c.color, c.borderTopColor, c.fontSize, c.fontWeight, c.paddingLeft].join('|');
      });
    expect(await look('[data-consent-accept]')).toBe(await look('[data-consent-refuse]'));
  });
});
