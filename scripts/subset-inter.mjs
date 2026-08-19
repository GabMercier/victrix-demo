// Sous-ensemble d'InterVariable (2026-08-19, Lighthouse — le woff2 complet de
// 345 Ko retardait le LCP texte du héros). Génère
// public/fonts/InterVariable-subset.woff2 (~107 Ko, axe de graisse conservé)
// à partir des caractères RÉELLEMENT présents dans le contenu/les données du
// site, unis aux plages latines complètes (ASCII, Latin-1, Latin étendu-A,
// ponctuation générale, €, flèches). Un glyphe manquant retombe sur la police
// système — relancer ce script si du contenu introduit un alphabet nouveau.
//
// Dépendance NON déclarée au package.json (outil ponctuel) :
//   npm i --no-save subset-font   puis   node scripts/subset-inter.mjs
import subsetFont from 'subset-font';
import { readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const chars = new Set();
function walk(d) {
  for (const e of readdirSync(d, { withFileTypes: true })) {
    const p = join(d, e.name);
    if (e.isDirectory()) walk(p);
    else if (/\.(md|mdx|json|ts|astro)$/.test(e.name)) {
      for (const ch of readFileSync(p, 'utf8')) chars.add(ch);
    }
  }
}
for (const d of ['src/content', 'src/data', 'src/i18n', 'src/pages', 'src/components', 'component-library']) {
  try { walk(d); } catch { /* dossier absent — ignorer */ }
}
const add = (a, b) => { for (let c = a; c <= b; c++) chars.add(String.fromCodePoint(c)); };
add(0x20, 0x7e);   // ASCII
add(0xa0, 0xff);   // Latin-1 (accents FR, « », NBSP)
add(0x100, 0x17f); // Latin étendu-A (Œ œ …)
add(0x2010, 0x2027); // tirets, guillemets typographiques, puce, ellipse
add(0x2030, 0x203a); // ‰ ′ ″ ‹ ›
for (const c of '€←→') chars.add(c);

const text = [...chars].filter((c) => c.codePointAt(0) >= 0x20).join('');
const buf = readFileSync('public/fonts/InterVariable.woff2');
const out = await subsetFont(buf, text, { targetFormat: 'woff2' });
writeFileSync('public/fonts/InterVariable-subset.woff2', out);
console.log(`${text.length} caractères — ${(buf.length / 1024).toFixed(0)} Ko -> ${(out.length / 1024).toFixed(0)} Ko`);
