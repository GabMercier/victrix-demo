import { test, expect } from '@playwright/test';

/**
 * TYPOGRAPHIE — plancher de lisibilité et échelle fluide (2026-09-21).
 *
 * Deux garde-fous, nés du même constat de Gabriel : « du 12px sur un grand
 * écran, c'est beaucoup trop petit ».
 *
 * 1. PLANCHER : plus aucun texte visible sous 16px. Le site descendait à 10px
 *    (étiquettes de catégorie) et 12px (compteurs, surtitres) ; le plancher a
 *    d'abord été posé à 14px le 21/09, puis RELEVÉ À 16px le 22/09 (décision
 *    Gabriel, en même temps que le passage à Hanken Grotesk). C'est `text-sm`
 *    de Tailwind qui portait l'essentiel du 14px — 109 usages ; il est écrasé
 *    à 1rem dans `@theme`, donc le plancher est structurel et non déclaratif.
 * 2. FLUIDE : le réglage « taille de police » du navigateur doit agir. Il
 *    n'agissait pas, parce que l'échelle du design system était en PIXELS.
 *    Le zoom (Ctrl +) marchait déjà — c'est pour ça que WCAG 1.4.4 passait et
 *    que Lighthouse ne signalait rien : ce test couvre ce qu'aucun des deux
 *    ne mesure.
 *
 * Simuler le réglage du navigateur = changer la taille de police de la RACINE,
 * ce qu'il fait exactement. Les `rem` en dépendent, les `px` l'ignorent.
 */
const PAGES = ['/fr/', '/fr/services/cybersecurite', '/fr/contact', '/fr/campagnes/licences-power-platform/'];

/** Tailles calculées de tous les éléments qui portent du texte visible. */
const taillesVisibles = (page: import('@playwright/test').Page) =>
  page.evaluate(() => {
    const vus: { taille: number; texte: string; classe: string }[] = [];
    for (const el of Array.from(document.body.querySelectorAll<HTMLElement>('*'))) {
      // Seulement les éléments qui rendent EUX-MÊMES du texte.
      const propre = Array.from(el.childNodes)
        .filter((n) => n.nodeType === Node.TEXT_NODE)
        .map((n) => (n.textContent ?? '').trim())
        .join('');
      if (!propre) continue;
      const style = getComputedStyle(el);
      if (style.visibility === 'hidden' || style.display === 'none' || style.opacity === '0') continue;
      if (!el.getClientRects().length) continue;
      vus.push({ taille: parseFloat(style.fontSize), texte: propre.slice(0, 40), classe: el.className?.toString().slice(0, 80) ?? '' });
    }
    return vus;
  });

for (const url of PAGES) {
  test(`aucun texte sous 16px — ${url}`, async ({ page }) => {
    await page.goto(url);
    await page.waitForLoadState('networkidle');
    // 15.9 et non 16 : les `rem` arrondis peuvent rendre 15.984px.
    const trop = (await taillesVisibles(page)).filter((t) => t.taille < 15.9);
    const detail = trop
      .slice(0, 8)
      .map((t) => `  • ${t.taille}px — « ${t.texte} » (${t.classe})`)
      .join('\n');
    expect(trop.length, `${url} :\n${detail}`).toBe(0);
  });
}

test('le réglage « taille de police » du navigateur agit sur tout le texte', async ({ page }) => {
  await page.goto('/fr/');
  await page.waitForLoadState('networkidle');

  const mesurer = () =>
    page.evaluate(() => {
      const h = document.querySelector('h1, h2');
      const p = document.querySelector('main p');
      return {
        titre: h ? parseFloat(getComputedStyle(h).fontSize) : 0,
        para: p ? parseFloat(getComputedStyle(p).fontSize) : 0,
      };
    });

  const avant = await mesurer();
  expect(avant.titre, 'un titre doit être trouvé').toBeGreaterThan(0);
  expect(avant.para, 'un paragraphe doit être trouvé').toBeGreaterThan(0);

  // Réglage « Grande police » : 16px → 20px à la racine.
  await page.evaluate(() => {
    document.documentElement.style.fontSize = '20px';
  });
  const apres = await mesurer();

  // Tout doit grossir d'un quart. Une marge tient compte des clamp() fluides
  // de la couche héritée, qui plafonnent certaines tailles.
  expect(apres.para / avant.para, 'le corps de texte doit suivre le réglage').toBeGreaterThan(1.15);
  expect(apres.titre / avant.titre, 'les titres doivent suivre le réglage').toBeGreaterThan(1.1);
});
