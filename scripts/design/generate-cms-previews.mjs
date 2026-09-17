#!/usr/bin/env node
/**
 * Aperçus pour l'éditeur CloudCannon (2026-09-17) : pastilles de couleur de la
 * palette « Fond de section » et vignettes des pictogrammes à clés fermées.
 *
 *   node scripts/design/generate-cms-previews.mjs          # génère + vérifie
 *   node scripts/design/generate-cms-previews.mjs --check  # vérifie seulement
 *
 * Sorties (versionnées, servies telles quelles par Astro) :
 *   public/images/cms/fonds/<cle>.svg          ← FOND_SWATCHES (shared/fonds.ts)
 *   public/images/cms/icones/<groupe>/<cle>.svg ← cartes ICONS des composants
 *
 * Les tracés SVG vivent DANS les composants (source unique du rendu) : ce
 * script les extrait par expression régulière (bloc `const NOM: Record<…> = {
 * … };`) et les évalue — les objets sont des littéraux, sans code. Ajouter une
 * icône = la dessiner dans le composant + l'ajouter au zod + à
 * `_select_data.icones_<groupe>` (cloudcannon.config.yml), puis relancer ce
 * script : il régénère la vignette ET échoue si les trois listes divergent.
 *
 * Garde-fou : `_select_data.fonds` et chaque `_select_data.icones_<groupe>`
 * de cloudcannon.config.yml doivent lister EXACTEMENT les clés dessinées ;
 * chaque entrée `apercu` doit pointer un fichier généré ici.
 */
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import yaml from 'js-yaml';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..');
const CHECK_ONLY = process.argv.includes('--check');
const COMP = 'component-library/src/components';

/** Groupes d'icônes : fichier source, nom de la carte, mode de tracé. */
const GROUPS = [
  { groupe: 'cartes', file: `${COMP}/benefits/benefits.astro`, map: 'ICONS', stroke: 2 },
  { groupe: 'cartes', file: `${COMP}/benefits/benefits.astro`, map: 'FILL_ICONS', fill: true },
  { groupe: 'bento', file: `${COMP}/bento-metrics/bento-metrics.astro`, map: 'ICONS', stroke: 1.8 },
  { groupe: 'outils', file: `${COMP}/exclusive-tools/exclusive-tools.astro`, map: 'ICONS', stroke: 2 },
  { groupe: 'expertises', file: `${COMP}/expertise-bento/expertise-bento.astro`, map: 'ICONS', stroke: 1.8 },
  { groupe: 'solutions', file: `${COMP}/home-solutions/home-solutions.astro`, map: 'ICONS', stroke: 2 },
  { groupe: 'puces', file: `${COMP}/offer-cards/offer-cards.astro`, map: 'ICONS', stroke: 2 },
  { groupe: 'realisations', file: `${COMP}/realisations/realisations.astro`, map: 'ICONS', stroke: 1.8 },
  { groupe: 'chiffres', file: `${COMP}/stats/stats.astro`, map: 'ICONS', stroke: 1.5 },
  // Ex-page Carrières (route fixe) convertie en sections le 2026-09-17 : les
  // groupes gardent leur nom historique (listes _select_data inchangées), seule
  // la source des tracés a changé de fichier.
  { groupe: 'carrieres-valeurs', file: `${COMP}/value-tiles/value-tiles.astro`, map: 'ICONS', stroke: 1.8 },
  { groupe: 'carrieres-atouts', file: `${COMP}/photo-features/photo-features.astro`, map: 'ICONS', fill: true },
];

const BLEU = '#1a5bff';
const SIZE = 48;

const read = (rel) => readFileSync(resolve(ROOT, rel), 'utf8');

/** Extrait et évalue `const <name>: Record<…> = { … };` (littéral sans code). */
function extractMap(source, name, file) {
  const re = new RegExp(`const ${name}: Record<[^=]+> = (\\{[\\s\\S]*?\\n\\});`);
  const m = source.match(re);
  if (!m) throw new Error(`[cms-previews] carte ${name} introuvable dans ${file}`);
  return new Function(`return (${m[1]});`)();
}

function iconSvg(entry, { stroke, fill }) {
  const paths = Array.isArray(entry) ? entry : [entry.d];
  const viewBox = Array.isArray(entry) ? '0 0 24 24' : entry.viewBox;
  const [, , vw, vh] = viewBox.split(' ').map(Number);
  // Icône centrée dans un carré blanc, marge ~15 %.
  const inner = SIZE * 0.7;
  const scale = inner / Math.max(vw, vh);
  const tx = (SIZE - vw * scale) / 2;
  const ty = (SIZE - vh * scale) / 2;
  const attrs = fill
    ? `fill="${BLEU}"`
    : `fill="none" stroke="${BLEU}" stroke-width="${stroke}" stroke-linecap="round" stroke-linejoin="round"`;
  const d = paths.map((p) => `<path d="${p}"/>`).join('');
  return (
    `<svg xmlns="http://www.w3.org/2000/svg" width="${SIZE}" height="${SIZE}" viewBox="0 0 ${SIZE} ${SIZE}">` +
    `<rect width="${SIZE}" height="${SIZE}" fill="#ffffff"/>` +
    `<g transform="translate(${tx.toFixed(2)} ${ty.toFixed(2)}) scale(${scale.toFixed(4)})" ${attrs}>${d}</g></svg>\n`
  );
}

function swatchSvg(hex) {
  return (
    `<svg xmlns="http://www.w3.org/2000/svg" width="${SIZE}" height="${SIZE}" viewBox="0 0 ${SIZE} ${SIZE}">` +
    `<rect width="${SIZE}" height="${SIZE}" fill="${hex}"/>` +
    `<rect x="0.5" y="0.5" width="${SIZE - 1}" height="${SIZE - 1}" fill="none" stroke="#cdd2da"/></svg>\n`
  );
}

function emit(rel, content) {
  const abs = resolve(ROOT, rel);
  if (CHECK_ONLY) {
    if (!existsSync(abs) || readFileSync(abs, 'utf8') !== content) {
      throw new Error(`[cms-previews] ${rel} absent ou périmé — relancer sans --check`);
    }
    return;
  }
  mkdirSync(dirname(abs), { recursive: true });
  writeFileSync(abs, content);
}

// ---- Pastilles de fonds ----------------------------------------------------
const fondsSrc = read('component-library/src/shared/fonds.ts');
const swatchRe = /^\s*'?([a-z-]+)'?: \{ libelle: '[^']*', couleur: '(#[0-9a-f]{6})' \},$/gm;
const swatches = new Map();
for (const m of fondsSrc.matchAll(swatchRe)) swatches.set(m[1], m[2]);
if (swatches.size === 0) throw new Error('[cms-previews] FOND_SWATCHES introuvable dans fonds.ts');
for (const [cle, hex] of swatches) emit(`public/images/cms/fonds/${cle}.svg`, swatchSvg(hex));

// ---- Vignettes d'icônes ----------------------------------------------------
const drawn = new Map(); // groupe → Set(cle)
for (const g of GROUPS) {
  const map = extractMap(read(g.file), g.map, g.file);
  const set = drawn.get(g.groupe) ?? new Set();
  for (const [cle, entry] of Object.entries(map)) {
    emit(`public/images/cms/icones/${g.groupe}/${cle}.svg`, iconSvg(entry, g));
    set.add(cle);
  }
  drawn.set(g.groupe, set);
}

// ---- Garde-fou : _select_data ↔ dessins ------------------------------------
const config = yaml.load(read('cloudcannon.config.yml'));
const selectData = config._select_data ?? {};
const errors = [];
const listed = (name) => (selectData[name] ?? []).map((v) => v.cle);

const fondsListed = listed('fonds');
const fondsDrawn = [...swatches.keys()];
if (fondsListed.join() !== fondsDrawn.join()) {
  errors.push(`_select_data.fonds = [${fondsListed}] ≠ FOND_SWATCHES = [${fondsDrawn}] (même ordre attendu)`);
}
for (const v of selectData.fonds ?? []) {
  if (v.apercu !== `/images/cms/fonds/${v.cle}.svg`) errors.push(`fonds.${v.cle}: apercu attendu /images/cms/fonds/${v.cle}.svg`);
  if (v.couleur !== swatches.get(v.cle)) errors.push(`fonds.${v.cle}: couleur ${v.couleur} ≠ fonds.ts ${swatches.get(v.cle)}`);
}

for (const [groupe, set] of drawn) {
  const name = `icones_${groupe.replace(/-/g, '_')}`;
  const keys = listed(name);
  const missing = [...set].filter((k) => !keys.includes(k));
  const extra = keys.filter((k) => !set.has(k));
  if (missing.length || extra.length) {
    errors.push(`_select_data.${name}: manquantes [${missing}] · sans dessin [${extra}]`);
  }
  for (const v of selectData[name] ?? []) {
    if (v.apercu !== `/images/cms/icones/${groupe}/${v.cle}.svg`) {
      errors.push(`${name}.${v.cle}: apercu attendu /images/cms/icones/${groupe}/${v.cle}.svg`);
    }
  }
}
for (const name of Object.keys(selectData)) {
  if (name.startsWith('icones_') && !drawn.has(name.slice(7).replace(/_/g, '-'))) {
    errors.push(`_select_data.${name}: aucun groupe de dessins correspondant`);
  }
}

if (errors.length) {
  console.error('[cms-previews] désalignement :\n - ' + errors.join('\n - '));
  process.exit(1);
}
const nIcons = [...drawn.values()].reduce((n, s) => n + s.size, 0);
console.log(`[cms-previews] ${swatches.size} pastilles, ${nIcons} icônes dans ${drawn.size} groupes — alignés avec _select_data.`);
