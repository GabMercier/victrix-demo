import { test, expect, type Page } from '@playwright/test';

/**
 * 2026-09-22 — CHAQUE CTA ARRIVE SUR UN FORMULAIRE PRÉREMPLI (lot L-prefill).
 *
 * Le 21/09, `/fr/contact?cta=Planifiez+une+consultation&de=Secteurs+d'activité`
 * arrivait avec « De quoi souhaitez-vous parler ? » ET « Service » vides — deux
 * champs pourtant OBLIGATOIRES. Cause : la route des pages générales posait
 * `sujet: page.data.contactSujet` sans repli, et 9 pages générales sur 11 n'ont
 * pas rempli ce champ au CMS.
 *
 * Ce que ce fichier verrouille, un parcours par GABARIT (le garde-fou
 * `npm run check:prefill` couvre, lui, les ~200 pages du site construit — ici
 * on vérifie la mécanique VIVANTE, script de provenance compris) :
 *  1. service, page générale, catalogue de solutions, carrières : après un clic
 *     sur un CTA de CONTENU, #subject et #expertise ne sont jamais vides ;
 *  2. le surlignage des champs obligatoires encore vides : quatre champs quand
 *     on vient d'un CTA, les six quand on arrive sans contexte, et le repère
 *     disparaît dès que le champ est rempli.
 *
 * Aucun libellé éditable au CMS n'est figé : on n'affirme que « non vide ».
 */

/** Le repère de « reste à remplir » (src/pages/[lang]/contact.astro). */
const HALO = /ring-primary\/60/;

/**
 * Clique le premier CTA de CONTENU vers le Contact. `main` exclut l'en-tête,
 * les menus et le pied de page — les liens que le script de provenance de
 * BaseLayout ignore VOLONTAIREMENT (leur libellé « Contact » n'apporte rien).
 */
async function cliquerPremierCta(page: Page, url: string, lang: 'fr' | 'en' = 'fr') {
  await page.goto(url);
  const cta = page.locator(`main a[href*="/${lang}/contact"]`).first();
  await expect(cta, `aucun CTA de contenu vers le Contact sur ${url}`).toBeVisible();
  await cta.click();
  await expect(page).toHaveURL(new RegExp(`/${lang}/contact`));
}

/** Les deux listes obligatoires sont remplies. */
async function listesRemplies(page: Page) {
  await expect(page.locator('#subject')).not.toHaveValue('');
  await expect(page.locator('#expertise')).not.toHaveValue('');
}

test.describe('les CTA arrivent sur un formulaire prérempli', () => {
  test('gabarit service', async ({ page }) => {
    await cliquerPremierCta(page, '/fr/services/cybersecurite/test-intrusion-pentest');
    await listesRemplies(page);
  });

  test('gabarit page générale — la page qui portait le bogue', async ({ page }) => {
    await cliquerPremierCta(page, '/fr/secteurs');
    await listesRemplies(page);
  });

  test('gabarit catalogue de solutions', async ({ page }) => {
    // Ici les paramètres sont posés dans le href AU BUILD (?sujet=&expertise=
    // &produit=), pas au clic : les deux chemins doivent donner le même
    // résultat à l'arrivée.
    await cliquerPremierCta(page, '/fr/solutions');
    await listesRemplies(page);
  });

  test('gabarit carrières — « Service » retombe sur les ressources humaines', async ({ page }) => {
    await cliquerPremierCta(page, '/fr/carrieres');
    await listesRemplies(page);
  });

  test('gabarit article — un gabarit sans champ d’éditeur retombe sur le repli général', async ({
    page,
  }) => {
    // L'accueil, les campagnes, les articles et le centre de ressources ne
    // passent AUCUN préremplissage : c'est le repli de BaseLayout qui joue.
    await cliquerPremierCta(page, '/fr/ressources');
    await listesRemplies(page);
  });

  test('en anglais aussi', async ({ page }) => {
    await cliquerPremierCta(page, '/en/secteurs', 'en');
    await listesRemplies(page);
  });
});

test.describe('surlignage des champs obligatoires encore vides', () => {
  // Les six champs obligatoires du formulaire, dans l'ordre d'affichage. La
  // case de consentement est exclue à dessein : c'est un geste à poser.
  const OBLIGATOIRES = ['#firstname', '#lastname', '#email', '#subject', '#expertise', '#message'];

  test('arrivée sans contexte (URL tapée) : les six champs sont surlignés', async ({ page }) => {
    await page.goto('/fr/contact');
    for (const sel of OBLIGATOIRES) {
      await expect(page.locator(sel), `${sel} devrait être surligné`).toHaveClass(HALO);
    }
    // Un champ FACULTATIF ne réclame rien.
    await expect(page.locator('#phone')).not.toHaveClass(HALO);
    await expect(page.locator('#request')).not.toHaveClass(HALO);
  });

  test('arrivée depuis un CTA : seuls les quatre champs personnels sont surlignés', async ({
    page,
  }) => {
    await cliquerPremierCta(page, '/fr/secteurs');
    for (const sel of ['#firstname', '#lastname', '#email', '#message']) {
      await expect(page.locator(sel), `${sel} devrait être surligné`).toHaveClass(HALO);
    }
    // Les deux listes sont préremplies : elles ne réclament plus rien.
    await expect(page.locator('#subject')).not.toHaveClass(HALO);
    await expect(page.locator('#expertise')).not.toHaveClass(HALO);
  });

  test('le repère disparaît dès que le champ est rempli — et revient s’il est vidé', async ({
    page,
  }) => {
    await page.goto('/fr/contact');
    const prenom = page.locator('#firstname');
    await expect(prenom).toHaveClass(HALO);
    await prenom.fill('Gabriel');
    await expect(prenom).not.toHaveClass(HALO);
    // Dynamique : vidé à nouveau, le repère revient (aucune hypothèse sur le
    // chemin d'arrivée, seule la valeur compte).
    await prenom.fill('');
    await expect(prenom).toHaveClass(HALO);
  });

  test('choisir une valeur dans une liste éteint son repère', async ({ page }) => {
    await page.goto('/fr/contact');
    const sujet = page.locator('#subject');
    await expect(sujet).toHaveClass(HALO);
    const options = await sujet.locator('option').all();
    const valeurs = (await Promise.all(options.map((o) => o.getAttribute('value')))).filter(
      (v): v is string => !!v,
    );
    expect(valeurs.length).toBeGreaterThan(0);
    await sujet.selectOption(valeurs[0]);
    await expect(sujet).not.toHaveClass(HALO);
  });
});
