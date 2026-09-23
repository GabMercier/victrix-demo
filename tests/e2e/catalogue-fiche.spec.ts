import { test, expect } from '@playwright/test';

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
 *  5. l'ANGLAIS n'a pas de fiche (traduction à venir) : ses cartes doivent
 *     continuer de mener au Contact prérempli, sans 404.
 *
 * Aucun libellé éditable au CMS n'est figé : on vise les rôles, les URL et le
 * contenu VENU DU CONTENU (le titre de la solution, lu sur la page elle-même).
 */

const SLUG = 'gestion-formations';
const FICHE = `/fr/solutions/${SLUG}/`;

test.describe('catalogue → fiche → formulaire', () => {
  test('« Découvrir » mène à la fiche de la solution', async ({ page }) => {
    await page.goto('/fr/solutions');
    const decouvrir = page.locator(`main a[href="${FICHE}"]`).first();
    await expect(decouvrir, 'aucune carte du catalogue ne pointe vers la fiche').toBeVisible();
    await decouvrir.click();
    await expect(page).toHaveURL(new RegExp(`${FICHE}$`));
  });

  test('la fiche est une vraie page : un seul H1, fil d’Ariane vers le catalogue', async ({ page }) => {
    await page.goto(FICHE);

    // Un seul <h1> par page (même règle que le garde-fou de build).
    await expect(page.locator('h1')).toHaveCount(1);

    // Le fil d'Ariane remonte au catalogue — son libellé vient de la page
    // catalogue (éditable au CMS), donc on vise le LIEN, pas le texte.
    // `[data-crumbs]` et non `nav` : l'en-tête du site porte lui aussi des
    // <nav aria-label>, et ils viennent avant dans le document.
    const filAriane = page.locator('[data-crumbs]');
    await expect(filAriane.locator('a[href="/fr/solutions/"]')).toBeVisible();
  });

  test('le bouton du héros descend à l’ancre du formulaire', async ({ page }) => {
    await page.goto(FICHE);
    const cta = page.locator('main a[href="#formulaire"]').first();
    await expect(cta).toBeVisible();
    await cta.click();
    await expect(page).toHaveURL(new RegExp('#formulaire$'));
    await expect(page.locator('#formulaire')).toBeInViewport();
  });

  test('le formulaire nomme la solution dans son champ caché « Page d’origine »', async ({ page }) => {
    await page.goto(FICHE);

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
    const origine = valeurs.find((v) => v.includes(FICHE));
    expect(origine, `aucun champ caché ne porte le chemin ${FICHE} — reçu : ${valeurs.join(' | ')}`).toBeTruthy();

    // La valeur est « <nom de la solution> (<chemin>) » : le nom doit être là,
    // sinon le courriel arrive sans dire de quelle solution il parle. On ne
    // fige PAS le libellé (il est éditable au CMS, et le titre de la CARTE est
    // volontairement plus court que le grand titre de la fiche) — on vérifie
    // qu'il existe et qu'il ressemble à un nom.
    const nom = (origine ?? '').replace(`(${FICHE})`, '').trim();
    expect(nom.length, `le champ caché ne porte aucun nom de solution : « ${origine} »`).toBeGreaterThan(3);
  });

  test('la fiche reste hors des moteurs tant que les prix ne sont pas validés', async ({ page }) => {
    // Décision du 2026-09-18 : les fourchettes de prix de la source doivent
    // être validées par Ø Studio (ADO #1634) avant indexation. Le jour où la
    // case est décochée fiche par fiche, ce test tombera — c'est voulu : il
    // demande alors une décision explicite, pas un oubli.
    await page.goto(FICHE);
    await expect(page.locator('head meta[name="robots"]')).toHaveAttribute(
      'content',
      /noindex/,
    );
  });

  test('l’anglais n’a pas de fiche : ses cartes mènent au Contact prérempli', async ({ page }) => {
    await page.goto('/en/solutions');
    // Aucune carte ne doit pointer vers une fiche EN (elles n'existent pas :
    // une URL /en/solutions/<slug>/ serait un 404).
    await expect(page.locator('main a[href^="/en/solutions/"]')).toHaveCount(0);

    // Les CARTES sont les liens qui transportent le nom du produit ; le CTA de
    // bas de catalogue pointe lui aussi vers /en/contact, mais sans paramètre.
    const carte = page.locator('main a[href*="/en/contact"][href*="produit="]').first();
    await expect(carte, 'aucune carte EN ne préremplit le formulaire').toBeVisible();
  });
});
