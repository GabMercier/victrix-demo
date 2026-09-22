#!/usr/bin/env node
/**
 * Rétro-remplissage des clés de section absentes du contenu (2026-09-18).
 *
 * Le problème : CloudCannon n'affiche un champ que si sa CLÉ existe dans le
 * fichier. Quand un champ est ajouté à un composant (ex. « Fond de section »,
 * étendu à 17 blocs le 17/09), les sections NOUVELLES le reçoivent du
 * `blueprint`, mais les sections DÉJÀ posées ne l'ont pas : le site se rend
 * correctement (le zod applique le défaut au build), et pourtant l'éditrice
 * ne voit aucune liste déroulante à cet endroit. Constat du 18/09 : 86
 * sections sur 321 sans clé `fond` (67 « appel à l'action ») — pris à tort
 * pour une régression.
 *
 *   node scripts/backfill-section-keys.mjs --check   # liste, code 1 s'il en manque
 *   node scripts/backfill-section-keys.mjs           # écrit
 *
 * Garantie ZÉRO changement visuel : la valeur écrite est EXACTEMENT le défaut
 * du schéma zod (lu dans src/content.config.ts pour le `type` de la section)
 * — celui que le build appliquait déjà en silence. Un composant dont le
 * défaut n'est pas lisible est ignoré et signalé, jamais deviné.
 *
 * Portée : la liste `KEYS` ci-dessous (`fond`, et `image` depuis le
 * 2026-09-21 — insigne de la carte distinction). Y ajouter une clé
 * quand un champ à défaut LITTÉRAL est ajouté à des sections existantes — le
 * lot « CTA de section » devra y passer. La clé est insérée à la place que lui
 * donne le `blueprint` du composant (l'éditeur affiche les champs dans l'ordre
 * du fichier).
 */
import { readFileSync, writeFileSync, readdirSync, existsSync } from 'node:fs';
import { join, resolve, dirname, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import yaml from 'js-yaml';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const CHECK_ONLY = process.argv.includes('--check');
const KEYS = ['fond', 'image'];

/**
 * Clés IMBRIQUÉES (2026-09-22) — le script ne descendait QUE d'un niveau, sur
 * la section elle-même. Or CloudCannon n'affiche un champ que si sa clé
 * existe : un champ ajouté à un ITEM de tableau ou à un sous-objet restait
 * donc invisible dans toutes les sections déjà posées, quoi qu'on écrive dans
 * le blueprint. C'est ce qui s'est passé avec l'icône des cartes numérotées et
 * le logo de la carte « Happy At Work » de Découvrir.
 *
 * `chemin` = clé du tableau OU du sous-objet à l'intérieur de la section.
 * Défaut toujours '' : ces champs sont des chaînes optionnelles.
 */
const KEYS_IMBRIQUEES = [
  { type: 'numbered-cards', chemin: 'items', cles: ['icon', 'image', 'imageAlt'] },
  { type: 'benefits', chemin: 'items', cles: ['image', 'imageAlt'] },
  { type: 'feature-boxes', chemin: 'boxes', cles: ['icon', 'image', 'imageAlt'] },
  { type: 'bento-metrics', chemin: 'aside', cles: ['image', 'imageAlt'] },
];

/** Ajoute les clés manquantes dans un objet ; renvoie le nombre d'ajouts. */
function completer(cible, cles) {
  if (!cible || typeof cible !== 'object' || Array.isArray(cible)) return 0;
  let n = 0;
  for (const cle of cles) {
    if (cle in cible) continue;
    cible[cle] = '';
    n += 1;
  }
  return n;
}

function walk(dir, out = []) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const abs = join(dir, entry.name);
    if (entry.isDirectory()) walk(abs, out);
    else out.push(abs);
  }
  return out;
}

// ---- Défauts du schéma, par type de section et par clé ---------------------------------
// On découpe src/content.config.ts en blocs « type: z.literal('<type>') … » et on lit
// `<clé>: <quelque chose>.default('<valeur>')` dans le bloc.
const schemaSource = readFileSync(join(ROOT, 'src/content.config.ts'), 'utf8');
const blocks = schemaSource.split(/type:\s*z\.literal\('/).slice(1);
/** @type {Map<string, Map<string, string>>} */
const defaults = new Map();
for (const block of blocks) {
  const type = block.slice(0, block.indexOf("'"));
  const found = defaults.get(type) ?? new Map();
  for (const key of KEYS) {
    if (found.has(key)) continue;
    const match = block.match(new RegExp(`\\n\\s*${key}:\\s*[\\w.]+(?:\\([^)]*\\))?\\.default\\('([^']*)'\\)`));
    if (match) found.set(key, match[1]);
  }
  if (!defaults.has(type)) defaults.set(type, found);
}

// ---- Ordre des clés : blueprint de chaque composant ---------------------------------------
const COMPONENTS = join(ROOT, 'component-library/src/components');
/** @type {Map<string, string[]>} */
const blueprintOrder = new Map();
const thumbErrors = [];
for (const name of readdirSync(COMPONENTS)) {
  const spec = join(COMPONENTS, name, `${name}.bookshop.yml`);
  if (!existsSync(spec)) continue;
  const parsed = yaml.load(readFileSync(spec, 'utf8')) ?? {};
  blueprintOrder.set(name, Object.keys(parsed.blueprint ?? {}));
  // Vignette du sélecteur de sections : @bookshop/generate ne reloge QUE
  // `<composant>.preview.*` (pas `preview.*` — 40 vignettes perdues jusqu'au
  // 2026-09-18), et la spec doit pointer exactement le fichier relogé.
  const expected = `/_cloudcannon/bookshop_thumbs/${name}/${name}.preview.png`;
  if (!existsSync(join(COMPONENTS, name, `${name}.preview.png`))) thumbErrors.push(`${name} : ${name}.preview.png absent`);
  else if (parsed.spec?.picker_preview?.image !== expected) thumbErrors.push(`${name} : picker_preview.image ≠ ${expected}`);
}

/** Réinsère `key` dans `section` à la place indiquée par le blueprint. */
function insertKey(section, key, value, order) {
  const position = order.indexOf(key);
  const before = new Set(position >= 0 ? order.slice(0, position) : []);
  const entries = Object.entries(section);
  // Dernière clé existante qui PRÉCÈDE `key` dans le blueprint (`_bookshop_name` compte toujours).
  let anchor = entries.findIndex(([k]) => k === '_bookshop_name');
  entries.forEach(([k], i) => {
    if (before.has(k)) anchor = Math.max(anchor, i);
  });
  entries.splice(anchor + 1, 0, [key, value]);
  return Object.fromEntries(entries);
}

const files = walk(join(ROOT, 'src/content')).filter((f) => f.endsWith('.json'));
let added = 0;
let touched = 0;
const skipped = new Map();

for (const file of files) {
  const text = readFileSync(file, 'utf8');
  let data;
  try {
    data = JSON.parse(text);
  } catch {
    continue;
  }
  if (!data || !Array.isArray(data.sections)) continue;
  let changed = false;
  data.sections = data.sections.map((section) => {
    const name = section?._bookshop_name;
    const order = blueprintOrder.get(name);
    if (!order) return section;
    let next = section;
    for (const key of KEYS) {
      if (!order.includes(key) || key in next) continue;
      const value = defaults.get(section.type ?? name)?.get(key);
      if (value === undefined) {
        skipped.set(`${name}.${key}`, (skipped.get(`${name}.${key}`) ?? 0) + 1);
        continue;
      }
      next = insertKey(next, key, value, order);
      added += 1;
      changed = true;
    }

    // Deuxième passe : les clés imbriquées (items de tableau, sous-objets).
    for (const regle of KEYS_IMBRIQUEES) {
      if ((next.type ?? name) !== regle.type) continue;
      const cible = next[regle.chemin];
      const ajouts = Array.isArray(cible)
        ? cible.reduce((somme, entree) => somme + completer(entree, regle.cles), 0)
        : completer(cible, regle.cles);
      if (ajouts > 0) {
        added += ajouts;
        changed = true;
      }
    }

    return next;
  });
  if (!changed) continue;
  touched += 1;
  const out = JSON.stringify(data, null, 2) + '\n';
  if (!CHECK_ONLY) writeFileSync(file, out);
}

console.log(
  `[backfill] ${added} clé(s) ${CHECK_ONLY ? 'manquante(s)' : 'ajoutée(s)'} dans ${touched} fichier(s) — clés suivies : ${KEYS.join(', ')} ; imbriquées : ${KEYS_IMBRIQUEES.map((r) => `${r.type}.${r.chemin}[${r.cles.join('/')}]`).join(', ')}.`,
);
for (const [what, n] of skipped) console.log(`  ⚠ ${what} : défaut du schéma illisible — ${n} section(s) laissée(s) telles quelles.`);
if (thumbErrors.length) {
  console.log(`
VIGNETTES du sélecteur de sections (${thumbErrors.length}) :`);
  for (const e of thumbErrors) console.log(`  ✗ ${e}`);
}
if (CHECK_ONLY && (added > 0 || thumbErrors.length > 0)) process.exit(1);
