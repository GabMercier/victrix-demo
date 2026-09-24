import { test, expect } from '@playwright/test';

/**
 * Menu mobile — second niveau (L-menu-mobile, 2026-09-24).
 *
 * Bug corrigé : le tiroir (src/components/Header.astro § « Mobile drawer »)
 * ne rendait que les six entrées d'en-tête + Recherche — aucune colonne du
 * méga-menu (Expertises / Services / Produits), aucune catégorie Ressources.
 * Désormais chaque entrée à sous-menu est un accordéon natif <details> /
 * <summary> SANS script : le lien de la page mère en tête, puis les liens de
 * sa colonne ; Ressources = le lien vers le centre + les catégories du blogue.
 *
 * Ce que ces tests vérifient, à 390 px (téléphone) :
 *  1. FR : ouvrir le tiroir, déplier « Services », atteindre
 *     /fr/services/cybersecurite/ — et le tiroir se referme (script existant) ;
 *  2. EN : même parcours, mêmes données (navigation JSON, rien de codé en dur) ;
 *  3. les entrées sans sous-menu (Carrière) restent des liens simples ; la
 *     colonne Expertises expose « Intelligence artificielle » résolue par la
 *     collection Services (lien en mode « service », FR et EN) ;
 *  4. Ressources : le lien vers le centre + au moins une catégorie ;
 *  5. clavier : Entrée sur le <summary> déplie, le focus est visible ;
 *  6. aria-current : sur une page de service, la rubrique est dépliée d'office,
 *     la page mère et la page courante sont marquées.
 * L'accessibilité (axe-core) du tiroir ouvert est dans accessibilite.spec.ts.
 */
const TELEPHONE = { width: 390, height: 844 };

/** Ouvre le tiroir et le renvoie (visible). */
async function ouvrirTiroir(page: import('@playwright/test').Page, url: string) {
  await page.setViewportSize(TELEPHONE);
  await page.goto(url);
  await page.locator('[data-nav-toggle]').click();
  const tiroir = page.locator('#mobile-nav');
  await expect(tiroir).toBeVisible();
  return tiroir;
}

test.describe('menu mobile — second niveau', () => {
  for (const cas of [
    {
      lang: 'fr',
      accueil: '/fr/',
      rubrique: 'Services',
      lien: 'Cybersécurité',
      cible: /\/fr\/services\/cybersecurite\/?$/,
    },
    {
      lang: 'en',
      accueil: '/en/',
      rubrique: 'Services',
      lien: 'Cybersecurity',
      cible: /\/en\/services\/cybersecurity\/?$/,
    },
  ]) {
    test(`${cas.lang.toUpperCase()} : déplier « ${cas.rubrique} » et atteindre « ${cas.lien} »`, async ({ page }) => {
      const tiroir = await ouvrirTiroir(page, cas.accueil);

      const accordeon = tiroir.locator('details').filter({
        has: page.locator('summary', { hasText: new RegExp(`^\\s*${cas.rubrique}\\s*$`) }),
      });
      await expect(accordeon).toHaveCount(1);
      await expect(accordeon).not.toHaveAttribute('open');

      // Replié : le lien de second niveau n'est pas visible.
      const lien = accordeon.getByRole('link', { name: cas.lien, exact: true });
      await expect(lien).toBeHidden();

      await accordeon.locator('summary').click();
      await expect(accordeon).toHaveAttribute('open');
      await expect(lien).toBeVisible();

      // Le premier lien de l'accordéon est la page mère.
      const premierLien = accordeon.getByRole('link').first();
      await expect(premierLien).toHaveText(cas.rubrique);
      await expect(premierLien).toHaveAttribute('href', new RegExp(`^/${cas.lang}/services/?$`));

      await lien.click();
      await expect(page).toHaveURL(cas.cible);
      // Fermeture au clic d'un lien (script existant) : la page arrivée rend
      // son tiroir fermé.
      await expect(page.locator('#mobile-nav')).toBeHidden();
    });
  }

  test('FR : entrées simples, colonne Expertises, Ressources', async ({ page }) => {
    const tiroir = await ouvrirTiroir(page, '/fr/');

    // Quatre entrées à sous-menu (Expertises, Services, Produits, Ressources) ;
    // Découvrir et Carrière restent des liens directs du premier niveau.
    await expect(tiroir.locator('details')).toHaveCount(4);
    const premierNiveau = tiroir.locator('nav > ul > li > a.mobile-nav__link');
    await expect(premierNiveau.filter({ hasText: 'Carrière' })).toHaveCount(1);
    await expect(tiroir.locator('summary').filter({ hasText: 'Carrière' })).toHaveCount(0);

    // Colonne Expertises : ses 4 liens, dont « Intelligence artificielle »
    // (lien en mode « service » dans navigation/fr.json — l'adresse vient de
    // la collection Services, pas d'un href).
    const expertises = tiroir.locator('details').filter({
      has: page.locator('summary', { hasText: /^\s*Expertises\s*$/ }),
    });
    await expertises.locator('summary').click();
    await expect(expertises.locator('a.mobile-nav__link')).toHaveCount(5); // page mère + 4
    await expect(expertises.getByRole('link', { name: 'Intelligence artificielle' })).toHaveAttribute(
      'href',
      /^\/fr\/services\/intelligence-artificielle\/?$/,
    );

    // Ressources : le lien vers le centre en tête, puis les catégories.
    const ressources = tiroir.locator('details').filter({
      has: page.locator('summary', { hasText: /^\s*Ressources\s*$/ }),
    });
    await ressources.locator('summary').click();
    const centre = ressources.getByRole('link').first();
    await expect(centre).toHaveText('Centre de ressources');
    await expect(centre).toHaveAttribute('href', /^\/fr\/ressources\/?$/);
    const categories = ressources.locator('a[href*="?categorie="]');
    expect(await categories.count(), 'au moins une catégorie du blogue').toBeGreaterThan(0);
  });

  test('EN : « Artificial intelligence » suit le slug anglais de la page', async ({ page }) => {
    const tiroir = await ouvrirTiroir(page, '/en/');
    const expertise = tiroir.locator('details').filter({
      has: page.locator('summary', { hasText: /^\s*Expertise\s*$/ }),
    });
    await expertise.locator('summary').click();
    await expect(expertise.getByRole('link', { name: 'Artificial intelligence' })).toHaveAttribute(
      'href',
      /^\/en\/services\/artificial-intelligence\/?$/,
    );
  });

  test('clavier : Entrée sur le résumé déplie, le focus est visible', async ({ page }) => {
    const tiroir = await ouvrirTiroir(page, '/fr/');
    const produits = tiroir.locator('details').filter({
      has: page.locator('summary', { hasText: /^\s*Produits\s*$/ }),
    });
    const resume = produits.locator('summary');
    await resume.focus();
    // Le focus posé par script ne déclenche pas :focus-visible partout : on
    // passe par le clavier (Tab arrière puis avant) pour l'obtenir.
    await page.keyboard.press('Shift+Tab');
    await page.keyboard.press('Tab');
    await expect(resume).toBeFocused();
    const anneau = await resume.evaluate((el) => {
      const s = getComputedStyle(el);
      return { style: s.outlineStyle, largeur: parseFloat(s.outlineWidth) };
    });
    expect(anneau.style, 'anneau de focus visible').not.toBe('none');
    expect(anneau.largeur).toBeGreaterThan(0);

    await page.keyboard.press('Enter');
    await expect(produits).toHaveAttribute('open');
    await expect(produits.getByRole('link', { name: 'Copilot Studio' })).toBeVisible();
  });

  test('aria-current : sur une page de service, la rubrique est dépliée et marquée', async ({ page }) => {
    const tiroir = await ouvrirTiroir(page, '/fr/services/cybersecurite/');
    const services = tiroir.locator('details').filter({
      has: page.locator('summary', { hasText: /^\s*Services\s*$/ }),
    });
    await expect(services).toHaveAttribute('open');
    await expect(services.getByRole('link', { name: 'Services', exact: true })).toHaveAttribute(
      'aria-current',
      'page',
    );
    await expect(services.getByRole('link', { name: 'Cybersécurité' })).toHaveAttribute('aria-current', 'page');
    // Les voisines de la même rubrique ne le sont pas.
    await expect(services.getByRole('link', { name: 'Infonuagique' })).not.toHaveAttribute('aria-current');
  });
});
