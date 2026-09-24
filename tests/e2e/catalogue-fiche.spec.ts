import { test, expect, type Page } from '@playwright/test';

/**
 * 2026-09-23 — LE PARCOURS CATALOGUE → FICHE → FORMULAIRE (lot L11).
 *
 * Jusqu'ici, « Découvrir » dans le catalogue sautait directement au formulaire
 * de contact : le visiteur n'avait aucune page pour se renseigner sur la
 * solution. Les 16 fiches Ø Studio rapatriées (lot L10) sont devenues des
 * pages composées de sections, et ce fichier verrouille le chemin complet.
 *
 * Ce qu'il vérifie, et pourquoi chaque point est là :
 *  1. le catalogue mène à la FICHE (et non plus au Contact) ;
 *  2. la fiche est une vraie page : un seul <h1>, un fil d'Ariane qui remonte
 *     au catalogue ;
 *  3. le bouton du héros descend à l'ANCRE du formulaire, sur la même page ;
 *  4. le champ caché « Page d'origine » du formulaire `o-studio` porte le NOM
 *     de la solution et le chemin de la fiche. C'est tout l'intérêt d'avoir
 *     réutilisé ce formulaire : le courriel nomme la solution sans qu'aucun
 *     champ n'ait été ajouté. Si ce fil casse, l'équipe Ø Studio reçoit des
 *     demandes anonymes — d'où l'assertion ;
 *  5. une carte SANS fiche (aujourd'hui : les 9 cartes anglaises, traduction à
 *     venir) mène au Contact prérempli, sans 404 ; une carte AVEC fiche y mène ;
 *  6. le sélecteur de langue d'une fiche sans traduction retombe sur le
 *     CATALOGUE de l'autre langue, jamais sur son accueil.
 *
 * DÉCOUPLÉ DU CONTENU (revue R3, constat 5 — 2026-09-24) : aucun slug n'est
 * écrit ici. La fiche testée est la PREMIÈRE que le catalogue de la langue
 * propose ; renommer, retirer ou traduire une fiche au CMS ne casse donc pas
 * le test — il se contente de suivre le site. Une langue sans aucune fiche
 * fait sauter les tests qui en ont besoin, avec le motif écrit.
 * Aucun libellé éditable au CMS n'est figé : on vise les rôles, les URL et le
 * contenu VENU DU CONTENU (le titre de la solution, lu sur la page elle-même).
 */

/** Chemin de la première fiche que le catalogue de `lang` propose, sinon null. */
async function premiereFiche(page: Page, lang: 'fr' | 'en'): Promise<string | null> {
  await page.goto(`/${lang}/solutions`);
  const lien = page.locator(`main a[href^="/${lang}/solutions/"]`).first();
  if ((await lien.count()) === 0) return null;
  return lien.getAttribute('href');
}

test.describe('catalogue → fiche → formulaire', () => {
  test('« Découvrir » mène à la fiche de la solution', async ({ page }) => {
    const fiche = await premiereFiche(page, 'fr');
    test.skip(fiche === null, 'aucune fiche FR dans le catalogue');
    const decouvrir = page.locator(`main a[href="${fiche}"]`).first();
    await expect(decouvrir, 'aucune carte du catalogue ne pointe vers la fiche').toBeVisible();
    await decouvrir.click();
    await expect(page).toHaveURL(new RegExp(`${fiche}$`));
  });

  test('la fiche est une vraie page : un seul H1, fil d’Ariane vers le catalogue', async ({ page }) => {
    const fiche = await premiereFiche(page, 'fr');
    test.skip(fiche === null, 'aucune fiche FR dans le catalogue');
    await page.goto(fiche!);

    // Un seul <h1> par page (même règle que le garde-fou de build). `main h1`
    // et non `h1` : en dev, la barre d'outils Astro ajoute ses propres <h1>
    // dans un shadow DOM, que les locators Playwright traversent.
    await expect(page.locator('main h1')).toHaveCount(1);

    // Le fil d'Ariane remonte au catalogue — son libellé vient de la page
    // catalogue (éditable au CMS), donc on vise le LIEN, pas le texte.
    // `[data-crumbs]` et non `nav` : l'en-tête du site porte lui aussi des
    // <nav aria-label>, et ils viennent avant dans le document.
    const filAriane = page.locator('[data-crumbs]');
    await expect(filAriane.locator('a[href="/fr/solutions/"]')).toBeVisible();
  });

  test('le bouton du héros descend à l’ancre du formulaire', async ({ page }) => {
    const fiche = await premiereFiche(page, 'fr');
    test.skip(fiche === null, 'aucune fiche FR dans le catalogue');
    await page.goto(fiche!);
    const cta = page.locator('main a[href="#formulaire"]').first();
    await expect(cta).toBeVisible();
    await cta.click();
    await expect(page).toHaveURL(new RegExp('#formulaire$'));
    await expect(page.locator('#formulaire')).toBeInViewport();
  });

  test('le formulaire nomme la solution dans son champ caché « Page d’origine »', async ({ page }) => {
    const fiche = await premiereFiche(page, 'fr');
    test.skip(fiche === null, 'aucune fiche FR dans le catalogue');
    await page.goto(fiche!);

    const formulaire = page.locator('#formulaire form');
    await expect(formulaire).toBeVisible();

    // Un champ caché porte « <titre> (<chemin de la fiche>) » — c'est le jeton
    // {{page.titre}} ({{page.chemin}}) du formulaire o-studio, résolu au build
    // par la route des solutions. Le `name` du champ est DÉRIVÉ du titre de la
    // section (src/lib/forms/field-name.ts) : on ne le fige pas.
    const caches = formulaire.locator('input[type="hidden"]');
    const valeurs = await caches.evaluateAll((els) =>
      els.map((el) => (el as HTMLInputElement).value),
    );
    const origine = valeurs.find((v) => v.includes(fiche!));
    expect(origine, `aucun champ caché ne porte le chemin ${fiche} — reçu : ${valeurs.join(' | ')}`).toBeTruthy();

    // La valeur est « <nom de la solution> (<chemin>) » : le nom doit être là,
    // sinon le courriel arrive sans dire de quelle solution il parle. On ne
    // fige PAS le libellé (il est éditable au CMS, et le titre de la CARTE est
    // volontairement plus court que le grand titre de la fiche) — on vérifie
    // qu'il existe et qu'il ressemble à un nom.
    const nom = (origine ?? '').replace(`(${fiche})`, '').trim();
    expect(nom.length, `le champ caché ne porte aucun nom de solution : « ${origine} »`).toBeGreaterThan(3);
  });

  test('la fiche reste hors des moteurs tant que les prix ne sont pas validés', async ({ page }) => {
    // Décision du 2026-09-18 : les fourchettes de prix de la source doivent
    // être validées par Ø Studio (ADO #1634) avant indexation. Le jour où la
    // case est décochée fiche par fiche, ce test tombera — c'est voulu : il
    // demande alors une décision explicite, pas un oubli.
    const fiche = await premiereFiche(page, 'fr');
    test.skip(fiche === null, 'aucune fiche FR dans le catalogue');
    await page.goto(fiche!);
    await expect(page.locator('head meta[name="robots"]')).toHaveAttribute(
      'content',
      /noindex/,
    );
  });

  test('le sélecteur de langue d’une fiche retombe sur une fiche ou sur le catalogue, jamais sur l’accueil', async ({
    page,
  }) => {
    const fiche = await premiereFiche(page, 'fr');
    test.skip(fiche === null, 'aucune fiche FR dans le catalogue');
    await page.goto(fiche!);
    // hreflang et sélecteur de langue partagent la même cible (BaseLayout).
    const alt = await page.locator('head link[rel="alternate"][hreflang="en-CA"]').getAttribute('href');
    expect(alt, 'pas d’alternate EN').toBeTruthy();
    const chemin = new URL(alt!).pathname;
    expect(chemin, 'le repli de langue doit rester dans le catalogue').toMatch(/^\/en\/solutions\//);
    // La cible existe (pas de 404 derrière le sélecteur de langue).
    const reponse = await page.goto(chemin);
    expect(reponse?.status()).toBe(200);
  });

  for (const lang of ['fr', 'en'] as const) {
    test(`${lang} : chaque carte mène à une fiche existante ou au Contact prérempli`, async ({ page }) => {
      await page.goto(`/${lang}/solutions`);
      const fiches = await page
        .locator(`main a[href^="/${lang}/solutions/"]`)
        .evaluateAll((els) => els.map((el) => (el as HTMLAnchorElement).getAttribute('href') ?? ''));
      // Les CARTES sont les liens qui transportent le nom du produit ; le CTA de
      // bas de catalogue pointe lui aussi vers /contact, mais sans paramètre.
      const contacts = await page.locator(`main a[href*="/${lang}/contact"][href*="produit="]`).count();
      expect(fiches.length + contacts, 'aucune carte dans le catalogue').toBeGreaterThan(0);

      // Chaque fiche liée existe (une carte vers une fiche EN non traduite
      // serait un 404 — c'est précisément ce que la route évite).
      for (const href of [...new Set(fiches)]) {
        const reponse = await page.goto(href);
        expect(reponse?.status(), `${href} ne répond pas 200`).toBe(200);
        await expect(page.locator('main h1')).toHaveCount(1);
      }
    });
  }
});
