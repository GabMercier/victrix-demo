#!/usr/bin/env node
/**
 * Aperçus pour l'éditeur CloudCannon (2026-09-17) : pastilles de couleur de la
 * palette « Fond de section » et vignettes des pictogrammes à clés fermées.
 *
 *   node scripts/design/generate-cms-previews.mjs          # génère + vérifie
 *   node scripts/design/generate-cms-previews.mjs --check  # vérifie seulement
 *
 * Sorties (versionnées, servies telles quelles par Astro) :
 *   public/images/cms/fonds/<cle>.svg   ← FOND_SWATCHES (shared/fonds.ts)
 *   public/images/cms/icones/<cle>.svg  ← BANQUE de pictogrammes (shared/icons.ts)
 *
 * BANQUE UNIQUE (2026-09-18) : les tracés vivent dans
 * component-library/src/shared/icons.ts (`export const ICONS = { … }`), plus
 * dans chaque composant. Ce script extrait le littéral par expression
 * régulière et l'évalue (objets littéraux, sans code — le fichier est du
 * TypeScript, Node ne peut pas l'importer tel quel). Ajouter un pictogramme =
 * une entrée dans icons.ts + une entrée dans `_select_data.icones`
 * (cloudcannon.config.yml), puis relancer ce script : il génère la vignette ET
 * échoue si la liste de l'éditeur et la banque divergent. Le zod
 * (content.config.ts) importe ICON_KEYS : rien à y toucher.
 *
 * Garde-fou : `_select_data.fonds` et `_select_data.icones` doivent lister
 * EXACTEMENT les clés dessinées, dans le MÊME ordre ; chaque entrée `apercu`
 * doit pointer un fichier généré ici ; aucune ancienne liste
 * `_select_data.icones_<groupe>` ne doit subsister.
 */
import { readFileSync, writeFileSync, mkdirSync, existsSync, readdirSync, rmSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import yaml from 'js-yaml';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..');
const CHECK_ONLY = process.argv.includes('--check');

const ICONS_FILE = 'component-library/src/shared/icons.ts';

const BLEU = '#1a5bff';
const SIZE = 48;

const read = (rel) => readFileSync(resolve(ROOT, rel), 'utf8');

/** Extrait et évalue le littéral `export const ICONS = { … } satisfies …;` de la banque. */
function extractBank(source) {
  const m = source.match(/export const ICONS = (\{[\s\S]*?\n\}) satisfies /);
  if (!m) throw new Error(`[cms-previews] banque ICONS introuvable dans ${ICONS_FILE}`);
  return new Function(`return (${m[1]});`)();
}

/** Vignette d'un pictogramme de la banque : trait 2 ou plein, selon l'entrée. */
function iconSvg(entry) {
  const paths = entry.paths;
  const viewBox = entry.viewBox ?? '0 0 24 24';
  const fill = entry.plein === true;
  const stroke = 2;
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

// ---- Vignettes de la banque de pictogrammes ----------------------------------
const bank = extractBank(read(ICONS_FILE));
const bankKeys = Object.keys(bank);
for (const cle of bankKeys) emit(`public/images/cms/icones/${cle}.svg`, iconSvg(bank[cle]));
// Ménage : anciennes vignettes par groupe (sous-dossiers) et fichiers orphelins.
const ICON_DIR = resolve(ROOT, 'public/images/cms/icones');
if (existsSync(ICON_DIR)) {
  for (const e of readdirSync(ICON_DIR, { withFileTypes: true })) {
    const keep = e.isFile() && bankKeys.includes(e.name.replace(/\.svg$/, ''));
    if (keep) continue;
    if (CHECK_ONLY) throw new Error(`[cms-previews] public/images/cms/icones/${e.name} est orphelin — relancer sans --check`);
    rmSync(resolve(ICON_DIR, e.name), { recursive: true, force: true });
  }
}

// ---- Garde-fou : _select_data ↔ dessins ------------------------------------
const config = yaml.load(read('cloudcannon.config.yml'));
const selectData = config._select_data ?? {};
const errors = [];
const listed = (name) => (selectData[name] ?? []).map((v) => v.cle);

// DEUX listes depuis le 2026-09-21 : `fonds` = palette claire (toutes les
// sections), `fonds_etendus` = palette claire + fonds SOMBRES (les sections
// qui savent inverser leurs textes). Les clés sombres sont lues dans fonds.ts.
const sombresDrawn = [...(fondsSrc.match(/FOND_KEYS_SOMBRES = \[([^\]]*)\]/)?.[1] ?? '').matchAll(/'([a-z-]+)'/g)].map(
  (m) => m[1],
);
const fondsDrawn = [...swatches.keys()].filter((c) => !sombresDrawn.includes(c));
const etendusDrawn = [...swatches.keys()];
for (const [nom, attendu] of [
  ['fonds', fondsDrawn],
  ['fonds_etendus', etendusDrawn],
]) {
  const listee = listed(nom);
  if (listee.join() !== attendu.join()) {
    errors.push(`_select_data.${nom} = [${listee}] ≠ fonds.ts = [${attendu}] (même ordre attendu)`);
  }
  for (const v of selectData[nom] ?? []) {
    if (v.apercu !== `/images/cms/fonds/${v.cle}.svg`) errors.push(`${nom}.${v.cle}: apercu attendu /images/cms/fonds/${v.cle}.svg`);
    if (v.couleur !== swatches.get(v.cle)) errors.push(`${nom}.${v.cle}: couleur ${v.couleur} ≠ fonds.ts ${swatches.get(v.cle)}`);
  }
}

const iconsListed = listed('icones');
if (iconsListed.join() !== bankKeys.join()) {
  const missing = bankKeys.filter((k) => !iconsListed.includes(k));
  const extra = iconsListed.filter((k) => !bankKeys.includes(k));
  errors.push(`_select_data.icones ≠ banque icons.ts (même ordre attendu) — manquantes [${missing}] · sans dessin [${extra}]`);
}
for (const v of selectData.icones ?? []) {
  if (v.apercu !== `/images/cms/icones/${v.cle}.svg`) errors.push(`icones.${v.cle}: apercu attendu /images/cms/icones/${v.cle}.svg`);
}
for (const name of Object.keys(selectData)) {
  if (name.startsWith('icones_')) errors.push(`_select_data.${name}: ancienne liste par section — la banque unique est _select_data.icones`);
}

if (errors.length) {
  console.error('[cms-previews] désalignement :\n - ' + errors.join('\n - '));
  process.exit(1);
}
console.log(`[cms-previews] ${swatches.size} pastilles, ${bankKeys.length} pictogrammes (banque unique) — alignés avec _select_data.`);
