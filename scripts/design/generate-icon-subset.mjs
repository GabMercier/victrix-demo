#!/usr/bin/env node
/**
 * generate-icon-subset.mjs — Sous-ensemble Material Symbols Outlined pour les
 * pages laboratoire de la REFONTE (auto-hébergé : la CSP du site interdit le
 * CDN Google Fonts).
 *
 * FAIT (rejouable) :
 *  1. moissonne les noms d'icônes des 5 exports finaux (docs/design/Export
 *     HTML/*.html, contenu texte des .material-symbols-outlined) ;
 *  2. ajoute les icônes passées en --extra a,b,c (celles des prototypes) ;
 *  3. interroge l'API css2 (icon_names= triés alphabétiquement, axes figés
 *     opsz 24 / wght 400 / FILL 0 / GRAD 0, UA Chrome sinon l'API sert du TTF
 *     complet) et télécharge le woff2 subsetté vers
 *     public/fonts/MaterialSymbolsOutlined-Refonte.woff2.
 *
 * Le sous-ensemble HISTORIQUE (MaterialSymbolsOutlined-Subset.woff2, 16 icônes
 * de l'ancien export Homepage) reste intact — /fr/design-lab s'en sert.
 * ⚠️ Toute nouvelle icône dans un prototype exige de rejouer ce script
 * (une icône absente du sous-ensemble rend son NOM en toutes lettres).
 *
 * Usage : node scripts/design/generate-icon-subset.mjs [--extra chip_extraction,search]
 */
import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const ROOT = process.cwd();
const EXPORT_DIR = join(ROOT, 'docs', 'design', 'Export HTML');
const OUT = join(ROOT, 'public', 'fonts', 'MaterialSymbolsOutlined-Refonte.woff2');

const args = process.argv.slice(2);
const extraIdx = args.indexOf('--extra');
const extras = extraIdx >= 0 && args[extraIdx + 1] ? args[extraIdx + 1].split(',') : [];

const icons = new Set(extras.map((s) => s.trim()).filter(Boolean));
for (const f of readdirSync(EXPORT_DIR).filter((f) => f.endsWith('.html'))) {
  const html = readFileSync(join(EXPORT_DIR, f), 'utf8');
  // Contenu texte immédiat d'un élément portant la classe (span ou button).
  for (const m of html.matchAll(/class="[^"]*material-symbols-outlined[^"]*"[^>]*>\s*([a-z0-9_]+)\s*</g)) icons.add(m[1]);
}
const names = [...icons].sort();
if (names.length === 0) {
  console.error('Aucune icône trouvée — rien à générer.');
  process.exit(1);
}

const cssUrl =
  'https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@24,400,0,0' +
  `&icon_names=${names.join(',')}&display=block`;
const UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36';

const cssRes = await fetch(cssUrl, { headers: { 'User-Agent': UA } });
if (!cssRes.ok) {
  console.error(`API css2 : HTTP ${cssRes.status}`);
  process.exit(1);
}
const css = await cssRes.text();
// Les sous-ensembles d'icônes sont servis via fonts.gstatic.com/l/font?kit=…
// (pas d'extension .woff2 dans l'URL — le binaire est bien du woff2).
const woff2 = css.match(/src:\s*url\((https:[^)]+)\)/)?.[1];
if (!woff2) {
  console.error('URL woff2 introuvable dans la réponse css2 (UA non reconnu ?).');
  process.exit(1);
}
const fontRes = await fetch(woff2, { headers: { 'User-Agent': UA } });
if (!fontRes.ok) {
  console.error(`Téléchargement woff2 : HTTP ${fontRes.status}`);
  process.exit(1);
}
const buf = Buffer.from(await fontRes.arrayBuffer());
writeFileSync(OUT, buf);
console.log(`${names.length} icônes : ${names.join(', ')}`);
console.log(`Écrit : ${OUT} (${(buf.length / 1024).toFixed(1)} Ko)`);
