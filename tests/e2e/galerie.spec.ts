import { test, expect, type Page } from '@playwright/test';

/**
 * Galerie d'images — la visionneuse sans script (revue R3, constats 3, 4 et 6
 * — 2026-09-24).
 *
 *  3. Les libellés (« Fermer », « Image suivante », « Agrandir l'image n sur
 *     N ») suivent la LANGUE DE LA PAGE ; ils étaient en français partout.
 *  4. Chaque vue agrandie porte `role="dialog"` et un nom accessible qui dit
 *     quelle image est ouverte — sans `aria-modal` (le focus n'est pas piégé,
 *     l'annoncer modale serait mentir).
 *  6. L'identifiant de la section vient de son RANG dans la page
 *     (`galerie-<n>`) : deux galeries identiques ne partagent plus leurs
 *     ancres, et aucun id n'est en double dans le document.
 *
 * DÉCOUPLÉ DU CONTENU (constat 5) : la page testée est la première fiche du
 * catalogue qui porte une galerie ; aucun slug, aucun libellé éditable ici.
 */

const LIBELLES = {
  fr: { agrandir: /^Agrandir l’image 1 sur \d+/, vue: /^Image 1 sur \d+/, fermer: 'Fermer', suivante: 'Image suivante' },
  en: { agrandir: /^Enlarge image 1 of \d+/, vue: /^Image 1 of \d+/, fermer: 'Close', suivante: 'Next image' },
};

/** Première fiche de `lang` qui porte une galerie (lien vers une ancre `#galerie-…`), sinon null. */
async function premiereFicheAvecGalerie(page: Page, lang: 'fr' | 'en'): Promise<string | null> {
  await page.goto(`/${lang}/solutions`);
  const fiches = await page
    .locator(`main a[href^="/${lang}/solutions/"]`)
    .evaluateAll((els) => els.map((el) => (el as HTMLAnchorElement).getAttribute('href') ?? ''));
  for (const href of [...new Set(fiches)]) {
    await page.goto(href);
    if ((await page.locator('a[href^="#galerie-"]').count()) > 0) return href;
  }
  return null;
}

for (const lang of ['fr', 'en'] as const) {
  test.describe(`galerie (${lang})`, () => {
    test('vignette → vue agrandie : rôle dialog, nom accessible et libellés dans la langue de la page', async ({
      page,
    }) => {
      const fiche = await premiereFicheAvecGalerie(page, lang);
      test.skip(fiche === null, `${lang} : aucune fiche du catalogue ne porte de galerie`);
      const t = LIBELLES[lang];

      // La vignette est un lien nommé, dans la langue de la page.
      const vignette = page.locator('a[href^="#galerie-"][href$="-1"]').first();
      await expect(vignette).toHaveAttribute('aria-label', t.agrandir);

      // Avant le clic : aucune vue n'est affichée.
      await expect(page.locator('[role="dialog"]:visible')).toHaveCount(0);

      await vignette.click();
      await expect(page).toHaveURL(/#galerie-\d+-1$/);

      const vue = page.locator('[role="dialog"]:visible');
      await expect(vue).toHaveCount(1);
      await expect(vue).toHaveAttribute('aria-label', t.vue);
      // Pas de `aria-modal` : le focus n'est pas piégé (limite assumée, guide-edition § Galerie).
      await expect(vue).not.toHaveAttribute('aria-modal', /.*/);

      // Libellés de la visionneuse, dans la langue de la page.
      const fermer = vue.getByRole('link', { name: t.fermer });
      await expect(fermer).toBeVisible();
      if ((await vue.locator('a[href^="#galerie-"]').count()) > 1) {
        await expect(vue.getByRole('link', { name: t.suivante })).toBeVisible();
      }

      // « Fermer » ramène à la section : plus aucune vue affichée.
      await fermer.click();
      await expect(page.locator('[role="dialog"]:visible')).toHaveCount(0);
    });

    test('identifiants : un par rang de section, aucun doublon dans la page', async ({ page }) => {
      const fiche = await premiereFicheAvecGalerie(page, lang);
      test.skip(fiche === null, `${lang} : aucune fiche du catalogue ne porte de galerie`);

      const sections = page.locator('section[id^="galerie-"]');
      const ids = await sections.evaluateAll((els) => els.map((el) => el.id));
      expect(ids.length).toBeGreaterThan(0);
      for (const id of ids) expect(id, 'id = rang de la section dans la page').toMatch(/^galerie-\d+$/);

      // Aucun id en double dans tout le document (sections ET vues agrandies).
      const doublons = await page.evaluate(() => {
        const vus = new Map<string, number>();
        for (const el of document.querySelectorAll('[id]')) vus.set(el.id, (vus.get(el.id) ?? 0) + 1);
        return [...vus.entries()].filter(([, n]) => n > 1).map(([id]) => id);
      });
      expect(doublons, 'identifiants en double').toEqual([]);
    });
  });
}
