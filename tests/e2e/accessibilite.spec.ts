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
];

/** Mêmes familles de règles que Lighthouse : WCAG 2.0 et 2.1, niveaux A et AA. */
const NORMES = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'];

for (const { url, nom } of PAGES) {
  test(`aucune violation d'accessibilité — ${nom}`, async ({ page }) => {
    await page.goto(url);
    // Le bandeau de consentement se pose au chargement et couvre la page :
    // il fait partie de ce qu'un visiteur voit en premier, on le scanne donc
    // AVEC le reste, une fois qu'il a fini de s'afficher.
    await page.waitForLoadState('networkidle');
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
