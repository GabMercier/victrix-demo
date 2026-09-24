import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

/**
 * Accessibilité — mesure automatisée (2026-09-21, demande Gabriel « score
 * parfait »).
 *
 * axe-core est le moteur qui alimente l'onglet Accessibilité de Lighthouse :
 * ce que ce test laisse passer, Lighthouse le note 100. L'inverse n'est pas
 * vrai — Lighthouse n'exécute qu'un sous-ensemble des règles — donc on est
 * ici PLUS strict que le score visé, volontairement.
 *
 * Ce qu'aucun outil ne mesure, et qui reste à vérifier à la main : l'ordre de
 * tabulation réel, la pertinence des textes de remplacement, et le fait que
 * l'échelle typographique est en PIXELS — le zoom du navigateur fonctionne
 * (WCAG 1.4.4), mais le réglage « taille de police » de Chrome n'agit pas sur
 * le site. Voir docs/operations.md § Accessibilité.
 *
 * Les pages couvertes sont une par GABARIT (accueil, service, formulaire,
 * catalogue, liste, page générale, anglais) : les composants se répètent d'une
 * page à l'autre, pas les gabarits.
 */
const PAGES = [
  { url: '/fr/', nom: 'accueil' },
  { url: '/fr/services/', nom: 'liste des services' },
  { url: '/fr/services/cybersecurite', nom: 'service (+ renvoi vers le contact)' },
  { url: '/fr/contact', nom: 'formulaire de contact' },
  { url: '/fr/solutions', nom: 'catalogue de solutions' },
  { url: '/fr/ressources', nom: 'centre de ressources' },
  { url: '/fr/carrieres', nom: 'carrières' },
  { url: '/fr/expertises', nom: 'expertises' },
  { url: '/en/', nom: 'accueil (anglais)' },
  // Forme des articles (lot 4, 2026-09-24) : les 4 patrons du corps d'un
  // article (bouton, encadré, FAQ dépliante, tableau) sur la page interne.
  { url: '/fr/style-guide/forme-articles/', nom: 'forme des articles (démo)' },
];

/** Mêmes familles de règles que Lighthouse : WCAG 2.0 et 2.1, niveaux A et AA. */
const NORMES = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'];

for (const { url, nom } of PAGES) {
  test(`aucune violation d'accessibilité — ${nom}`, async ({ page }) => {
    // STABILITÉ (2026-09-22) : le catalogue de solutions a été vu rouge UNE
    // fois puis vert seul et vert à la reprise. axe lit les couleurs
    // CALCULÉES à l'instant du scan : surpris pendant une transition (le
    // bandeau de consentement qui se pose, un `transition-colors` de carte),
    // il mesure une teinte intermédiaire qui n'existe qu'une fraction de
    // seconde. On coupe donc les animations à la source, par le média que le
    // site respecte déjà (global.css § prefers-reduced-motion) plutôt que par
    // une attente arbitraire.
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto(url);
    // Le bandeau de consentement se pose au chargement et couvre la page :
    // il fait partie de ce qu'un visiteur voit en premier, on le scanne donc
    // AVEC le reste, une fois qu'il a fini de s'afficher.
    await page.waitForLoadState('networkidle');
    // Les polices changent la mise en page, donc les chevauchements et les
    // cibles tactiles : attendre qu'elles soient posées.
    await page.evaluate(() => document.fonts.ready);
    const { violations } = await new AxeBuilder({ page }).withTags(NORMES).analyze();

    // Message lisible : la règle, son impact et le premier élément fautif —
    // de quoi corriger sans relancer l'outil.
    const detail = violations
      .map((v) => {
        const cible = v.nodes[0]?.target?.join(' ') ?? '?';
        return `  • [${v.impact}] ${v.id} — ${v.help}\n      ${v.nodes.length} élément(s), p. ex. ${cible}`;
      })
      .join('\n');
    expect(violations.length, `${nom} (${url}) :\n${detail}`).toBe(0);
  });
}

/**
 * LE TIROIR MOBILE OUVERT (L-menu-mobile, 2026-09-24) — un gabarit de plus :
 * à 390 px, le menu est un tiroir dont chaque entrée à sous-menu est un
 * accordéon natif <details>. Fermés, leurs liens sont hors du DOM rendu et
 * axe ne les verrait pas : on ouvre le tiroir, puis TOUS ses accordéons, et
 * on scanne (contrastes des têtes de colonne, des liens de second niveau, du
 * chevron ; cibles tactiles ; noms accessibles). Le comportement du tiroir
 * lui-même est dans menu-mobile.spec.ts.
 */
for (const { url, nom } of [
  { url: '/fr/', nom: 'tiroir mobile ouvert (390px)' },
  { url: '/en/', nom: 'tiroir mobile ouvert (390px, anglais)' },
]) {
  test(`aucune violation d'accessibilité — ${nom}`, async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto(url);
    await page.waitForLoadState('networkidle');
    await page.evaluate(() => document.fonts.ready);

    await page.locator('[data-nav-toggle]').click();
    const tiroir = page.locator('#mobile-nav');
    await expect(tiroir).toBeVisible();
    // Garde-fou du garde-fou : sans accordéon, ce test scannerait l'ancien
    // tiroir à un niveau en croyant tester le nouveau.
    const accordeons = tiroir.locator('details');
    expect(await accordeons.count(), 'le tiroir doit porter des accordéons').toBeGreaterThan(0);
    await accordeons.evaluateAll((els) => els.forEach((el) => ((el as HTMLDetailsElement).open = true)));
    await expect(tiroir.locator('details:not([open])')).toHaveCount(0);

    const { violations } = await new AxeBuilder({ page }).withTags(NORMES).analyze();
    const detail = violations
      .map((v) => {
        const cible = v.nodes[0]?.target?.join(' ') ?? '?';
        return `  • [${v.impact}] ${v.id} — ${v.help}\n      ${v.nodes.length} élément(s), p. ex. ${cible}`;
      })
      .join('\n');
    expect(violations.length, `${nom} (${url}) :\n${detail}`).toBe(0);
  });
}

/**
 * LE MODE « GRAND ÉCRAN » (2026-09-23) — au-delà de 1920px la racine grandit
 * jusqu'à 20px et le cadran jusqu'à 2400px (global.css, theme.css).
 *
 * Les scans ci-dessus tournent au viewport par défaut de Playwright (1280),
 * où cette règle est désarmée : le gate serait donc resté vert sans avoir
 * jamais mesuré le mode que Gabriel a sur son écran. L'arithmétique dit que
 * le risque de contraste est nul (aucune couleur ne change, aucun texte ne
 * peut rétrécir, et la règle AA se DÉTEND — plus de texte franchit les seuils
 * 24px / 18,66px gras). Restent les chevauchements, les cibles tactiles et
 * les textes rognés, qu'axe voit et que l'arithmétique ne dit pas.
 *
 * Trois gabarits suffisent : ce sont ceux qui portent les mises en page à
 * hauteur contrainte (cartes de l'accueil, colonnes du service, champs du
 * formulaire).
 */
for (const { url, nom } of [
  { url: '/fr/', nom: 'accueil' },
  { url: '/fr/services/cybersecurite', nom: 'service (+ renvoi vers le contact)' },
  { url: '/fr/contact', nom: 'formulaire de contact' },
]) {
  test(`aucune violation d'accessibilité à 2560px — ${nom}`, async ({ page }) => {
    await page.setViewportSize({ width: 2560, height: 1440 });
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto(url);
    await page.waitForLoadState('networkidle');
    await page.evaluate(() => document.fonts.ready);

    // Garde-fou du garde-fou : si la règle « grand écran » cessait de
    // s'appliquer, ce test scannerait le mode ordinaire en croyant tester
    // l'autre, et passerait pour de mauvaises raisons.
    const racine = await page.evaluate(() =>
      parseFloat(getComputedStyle(document.documentElement).fontSize),
    );
    expect(racine, 'la règle « grand écran » doit être active à 2560px').toBeCloseTo(20, 1);

    const { violations } = await new AxeBuilder({ page }).withTags(NORMES).analyze();
    const detail = violations
      .map((v) => {
        const cible = v.nodes[0]?.target?.join(' ') ?? '?';
        return `  • [${v.impact}] ${v.id} — ${v.help}\n      ${v.nodes.length} élément(s), p. ex. ${cible}`;
      })
      .join('\n');
    expect(violations.length, `${nom} (${url}) à 2560px :\n${detail}`).toBe(0);
  });
}
