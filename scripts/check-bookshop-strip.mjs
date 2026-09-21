#!/usr/bin/env node
/**
 * Garde-fou Bookshop (2026-09-17) — rejoue localement l'étape que SEUL le
 * build CloudCannon exécute (`.cloudcannon/postbuild` → `@bookshop/generate` →
 * `@bookshop/astro-engine`, lib/builder.js) sur CHAQUE composant `.astro` de
 * component-library/ :
 *   1. retrait des scripts par la regex EXACTE du moteur ;
 *   2. compilation Astro → TS (avec le même repli que le moteur : si la
 *      version sans scripts ne compile pas, il recompile l'original) ;
 *   3. esbuild (loader ts).
 *
 * Incident d'origine : une balise script OUVRANTE écrite en toutes lettres
 * dans un commentaire de solutions-catalogue.astro — la regex partait de ce
 * faux départ jusqu'au premier vrai script fermant du fichier et emportait
 * la fermeture du commentaire (« Expected end of multi-line comment ») :
 * `npm run build` vert, build CloudCannon rouge, invisible au gate local
 * (`npx @bookshop/generate` hors CloudCannon ne trouve aucun site de sortie).
 *
 * Usage : `npm run check:bookshop` (CI ci.yml + docs/operations.md §3).
 * Sortie 1 si un composant échoue, avec la première ligne de l'erreur.
 */
import fs from 'node:fs';
import path from 'node:path';
import { transform } from '@astrojs/compiler';
import * as esbuild from 'esbuild';

const ROOT = 'component-library/src';
// Copie conforme de node_modules/@bookshop/astro-engine/lib/builder.js.
const STRIP_SCRIPTS = /<script(.|\n)*?>(.|\n)*?<\/script>/g;
const ASTRO_OPTIONS = { internalURL: 'astro/runtime/server/index.js' };

const files = [];
(function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full);
    else if (entry.name.endsWith('.astro')) files.push(full);
  }
})(ROOT);

let failures = 0;
for (const file of files) {
  const text = fs.readFileSync(file, 'utf8');
  try {
    let compiled;
    try {
      compiled = await transform(text.replace(STRIP_SCRIPTS, ''), { ...ASTRO_OPTIONS, filename: file });
    } catch {
      compiled = await transform(text, { ...ASTRO_OPTIONS, filename: file });
    }
    await esbuild.transform(compiled.code, { loader: 'ts', target: 'esnext' });
  } catch (err) {
    failures++;
    const first = String(err?.message ?? err).split('\n')[0];
    console.error(`✗ ${file}\n    ${first}`);
  }
}

console.log(
  `[check:bookshop] ${files.length} composant(s) rejoués comme sur CloudCannon — ${failures} en échec`,
);
if (failures > 0) {
  console.error(
    '[check:bookshop] Cause typique : une balise script ouvrante écrite en toutes lettres dans un commentaire (voir docs/operations.md §8).',
  );
  process.exit(1);
}
