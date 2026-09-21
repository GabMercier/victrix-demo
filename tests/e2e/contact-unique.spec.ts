import { test, expect } from '@playwright/test';

/**
 * 2026-09-21 — UN SEUL formulaire de demande sur le site.
 *
 * La page Cybersécurité hébergeait un second formulaire (« évaluation de
 * posture de sécurité ») : deuxième collecte, deuxième consentement, et la
 * seule question qui lui était propre — la taille de l'entreprise — n'existait
 * nulle part ailleurs. Elle est devenue une section de qualification qui
 * renvoie vers le formulaire Contact, déjà rempli.
 *
 * Invariants testés, sans figer un seul libellé éditable au CMS :
 *  1. la page Cybersécurité n'héberge plus de formulaire ;
 *  2. cliquer une tranche mène au Contact avec service ET tranche remplis ;
 *  3. le champ de tranche n'apparaît QUE pour le service qui le demande, et
 *     reste hors du formulaire (désactivé) le reste du temps ;
 *  4. un CTA de carrière ne laisse plus « Service » (obligatoire) vide.
 */
test.describe('page Cybersécurité → formulaire Contact unique', () => {
  test('la page de service ne porte plus de formulaire', async ({ page }) => {
    await page.goto('/fr/services/cybersecurite');
    await expect(page.locator('form')).toHaveCount(0);
  });

  test('une tranche mène au Contact avec le service ET la tranche préremplis', async ({ page }) => {
    await page.goto('/fr/services/cybersecurite');
    const tranche = page.locator('a[href*="/fr/contact?"][href*="taille="]').first();
    const libelle = (await tranche.textContent())?.trim();
    expect(libelle).toBeTruthy();
    await tranche.click();
    await expect(page).toHaveURL(/\/fr\/contact\?/);

    // Service : rempli par le script de provenance (data-contact-service).
    const service = page.locator('#expertise');
    await expect(service).not.toHaveValue('');
    // Tranche : reprise de ?taille=, et le champ est visible + soumissible.
    const taille = page.locator('#company-size');
    await expect(taille).toBeVisible();
    await expect(taille).toBeEnabled();
    await expect(taille).toHaveValue(libelle!);
  });

  test('le champ de tranche disparaît — et sort du formulaire — pour un autre service', async ({ page }) => {
    await page.goto('/fr/contact');
    const service = page.locator('#expertise');
    const taille = page.locator('#company-size');
    // État d'arrivée : aucun service choisi, donc pas de question de tranche.
    await expect(taille).toBeHidden();
    await expect(taille).toBeDisabled();

    // Le service qui la demande est celui que porte la définition.
    const attendu = await page.locator('#company-size-row').getAttribute('data-showif-equals');
    await service.selectOption(attendu!);
    await expect(taille).toBeVisible();
    await expect(taille).toBeEnabled();

    // Un autre service : masquée, désactivée (donc jamais soumise) et vidée.
    const autre = await service
      .locator(`option:not([value="${attendu}"]):not([value=""])`)
      .first()
      .getAttribute('value');
    await service.selectOption(autre!);
    await expect(taille).toBeHidden();
    await expect(taille).toBeDisabled();
    await expect(taille).toHaveValue('');
  });
});

test.describe('« Service » n’arrive plus jamais vide', () => {
  for (const lang of ['fr', 'en'] as const) {
    test(`${lang} : un CTA de la page Carrières remplit le service (RH)`, async ({ page }) => {
      await page.goto(`/${lang}/carrieres`);
      // DANS le contenu : le script de provenance ignore volontairement les
      // liens de l'en-tête, de la navigation et du pied de page.
      const cta = page.locator(`main a[href^="/${lang}/contact"]`).first();
      await cta.click();
      await expect(page).toHaveURL(new RegExp(`/${lang}/contact`));
      // Les deux listes obligatoires sont servies remplies.
      await expect(page.locator('#subject')).not.toHaveValue('');
      await expect(page.locator('#expertise')).not.toHaveValue('');
    });
  }
});
