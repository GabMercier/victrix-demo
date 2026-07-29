#!/usr/bin/env node
/**
 * fetch-media.mjs — Rapatrie EN LOCAL (public/wp-content/uploads/…) les médias
 * `/wp-content/uploads/…` référencés par le contenu BRANCHÉ (src/content/blog
 * et src/content/services), depuis le site WordPress encore en ligne.
 *
 * CIBLÉ délibérément : seuls les fichiers référencés sont téléchargés (~220),
 * pas les 943 médias de l'inventaire — la rapatriation complète est un suivi
 * (elle se fera avant le démantèlement de WordPress). Idempotent : un fichier
 * déjà présent n'est jamais retéléchargé (skip-existing).
 *
 * Résolution d'URL : le chemin local est réécrit vers
 * https://www.victrix.ca/wp-content/uploads/… ; l'annexe
 * docs/migration/urls-medias.csv sert de recoupement (signale les références
 * absentes de l'inventaire — probablement des dérivés de taille WordPress).
 *
 * Usage :
 *   node scripts/migration/fetch-media.mjs
 *     [--content src/content/blog,src/content/services]
 *     [--out public] [--base https://www.victrix.ca] [--dry-run]
 */
import { readdirSync, readFileSync, writeFileSync, mkdirSync, existsSync, statSync } from 'node:fs';
import { join, dirname } from 'node:path';

const args = process.argv.slice(2);
const getArg = (name, def) => {
  const i = args.indexOf(name);
  return i >= 0 && args[i + 1] ? args[i + 1] : def;
};
const CONTENT_DIRS = getArg('--content', 'src/content/blog,src/content/services').split(',');
const OUT_ROOT = getArg('--out', 'public');
const BASE = getArg('--base', 'https://www.victrix.ca').replace(/\/$/, '');
const DRY = args.includes('--dry-run');

// --- Collecte des références /wp-content/uploads/… dans le contenu branché ---
const refs = new Set();
function walk(dir) {
  let entries;
  try {
    entries = readdirSync(dir, { withFileTypes: true });
  } catch {
    return;
  }
  for (const e of entries) {
    const p = join(dir, e.name);
    if (e.isDirectory()) walk(p);
    else if (/\.(md|json)$/.test(e.name)) {
      const text = readFileSync(p, 'utf8');
      for (const m of text.matchAll(/\/wp-content\/uploads\/[^\s"')\\]+/g)) {
        // Nettoyage des terminateurs Markdown/JSON collés à l'URL.
        refs.add(m[0].replace(/[),.;!?]+$/, ''));
      }
    }
  }
}
CONTENT_DIRS.forEach((d) => walk(d.trim()));

// --- Recoupement avec l'inventaire des médias (annexe CSV) ------------------
const inventory = new Set();
try {
  const csv = readFileSync('docs/migration/urls-medias.csv', 'utf8');
  for (const m of csv.matchAll(/https?:\/\/[^"]+?(\/wp-content\/uploads\/[^"]+)/g)) inventory.add(m[1]);
} catch {
  console.warn('⚠️ docs/migration/urls-medias.csv introuvable — recoupement sauté.');
}

// --- Téléchargement (séquentiel — politesse envers le site en production) ---
const report = { fetched: [], present: [], failed: [], offInventory: [] };
for (const ref of [...refs].sort()) {
  const dest = join(OUT_ROOT, ref);
  if (inventory.size && !inventory.has(ref)) report.offInventory.push(ref);
  if (existsSync(dest) && statSync(dest).size > 0) {
    report.present.push(ref);
    continue;
  }
  if (DRY) {
    report.fetched.push(ref);
    continue;
  }
  try {
    const res = await fetch(BASE + ref);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const buf = Buffer.from(await res.arrayBuffer());
    mkdirSync(dirname(dest), { recursive: true });
    writeFileSync(dest, buf);
    report.fetched.push(ref);
  } catch (e) {
    report.failed.push(`${ref} — ${e.message}`);
  }
}

const lines = [];
const w = (s = '') => lines.push(s);
w('# Rapport de rapatriement des médias référencés');
w();
w(`> Généré par \`scripts/migration/fetch-media.mjs\`${DRY ? ' (DRY-RUN)' : ''} — source ${BASE}.`);
w(`> Contenu scanné : ${CONTENT_DIRS.join(', ')}.`);
w();
w(`- Références trouvées : ${refs.size}`);
w(`- Téléchargés : ${report.fetched.length}`);
w(`- Déjà présents (sautés) : ${report.present.length}`);
w(`- Échecs : ${report.failed.length}`);
w(`- Hors inventaire CSV (dérivés de taille WP probables) : ${report.offInventory.length}`);
w();
if (report.failed.length) {
  w('## Échecs');
  w();
  for (const f of report.failed) w(`- ${f}`);
  w();
}
if (report.offInventory.length) {
  w('## Hors inventaire (téléchargés quand même si accessibles)');
  w();
  for (const f of report.offInventory) w(`- ${f}`);
  w();
}
if (!DRY) writeFileSync('docs/migration/rapport-medias.md', lines.join('\n') + '\n', 'utf8');
console.log(
  `Références : ${refs.size} | téléchargés : ${report.fetched.length} | présents : ${report.present.length} | échecs : ${report.failed.length}`,
);
if (report.failed.length) console.log('⚠️ Échecs — voir docs/migration/rapport-medias.md');
