#!/usr/bin/env node
/**
 * fetch-maquette-images.mjs — Rapatriement des images des maquettes finales
 * (docs/design/Export HTML/*.html).
 *
 * POURQUOI : les exports Figma référencent des images hébergées sur
 * lh3.googleusercontent.com (chemins /aida/ et /aida-public/), des URLs
 * ÉPHÉMÈRES — sans rapatriement, les maquettes deviennent illisibles quand
 * Google les purge, et la Phase 5 (re-skin) perd ses visuels de référence.
 *
 * FAIT (rejouable, skip-existing) :
 *  1. extrait toutes les URLs lh3.googleusercontent.com des 5 exports
 *     (attributs src="…" ET background-image: url("…")) ;
 *  2. télécharge chaque URL UNIQUE vers docs/design/Export HTML/assets/
 *     (nom = <page-de-première-occurrence>-<nn>.<ext>, ext du content-type) ;
 *  3. écrit assets/manifest.json (url → fichier local + pages consommatrices) ;
 *  4. écrit des copies OFFLINE dans Export HTML/offline/<page>.html où les URLs
 *     distantes sont réécrites vers ../assets/… — les originaux livrés ne sont
 *     JAMAIS modifiés (ce sont des livrables design, pas notre code).
 *
 * Usage : node scripts/design/fetch-maquette-images.mjs
 */
import { readFileSync, writeFileSync, mkdirSync, readdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const ROOT = process.cwd();
const EXPORT_DIR = join(ROOT, 'docs', 'design', 'Export HTML');
const ASSETS_DIR = join(EXPORT_DIR, 'assets');
const OFFLINE_DIR = join(EXPORT_DIR, 'offline');
const MANIFEST = join(ASSETS_DIR, 'manifest.json');

const URL_RE = /https:\/\/lh3\.googleusercontent\.com\/[A-Za-z0-9_\-/]+/g;
const EXT_BY_TYPE = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp', 'image/gif': 'gif', 'image/svg+xml': 'svg' };

const pages = readdirSync(EXPORT_DIR).filter((f) => f.endsWith('.html'));
if (pages.length === 0) {
  console.error(`Aucun export HTML dans ${EXPORT_DIR}`);
  process.exit(1);
}

// url → { file, pages: Set } — première page rencontrée nomme le fichier.
const manifest = existsSync(MANIFEST) ? JSON.parse(readFileSync(MANIFEST, 'utf8')) : {};
const byUrl = new Map(Object.entries(manifest).map(([url, e]) => [url, { file: e.file, pages: new Set(e.pages) }]));
const htmlByPage = new Map();

for (const page of pages) {
  const html = readFileSync(join(EXPORT_DIR, page), 'utf8');
  htmlByPage.set(page, html);
  for (const url of html.match(URL_RE) ?? []) {
    if (!byUrl.has(url)) byUrl.set(url, { file: null, pages: new Set() });
    byUrl.get(url).pages.add(page);
  }
}

mkdirSync(ASSETS_DIR, { recursive: true });
mkdirSync(OFFLINE_DIR, { recursive: true });

let downloaded = 0;
let skipped = 0;
let failed = 0;
const counters = new Map(); // slug de page → prochain index

for (const [url, entry] of byUrl) {
  if (entry.file && existsSync(join(ASSETS_DIR, entry.file))) {
    skipped++;
    continue;
  }
  const firstPage = [...entry.pages][0].replace(/\.html$/, '').toLowerCase();
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const ext = EXT_BY_TYPE[res.headers.get('content-type')?.split(';')[0]] ?? 'bin';
    const n = (counters.get(firstPage) ?? 0) + 1;
    counters.set(firstPage, n);
    const file = `${firstPage}-${String(n).padStart(2, '0')}.${ext}`;
    writeFileSync(join(ASSETS_DIR, file), Buffer.from(await res.arrayBuffer()));
    entry.file = file;
    downloaded++;
    console.log(`✓ ${file}  ←  …${url.slice(-24)} (${[...entry.pages].join(', ')})`);
  } catch (err) {
    failed++;
    console.error(`✗ ÉCHEC ${url} : ${err.message}`);
  }
}

writeFileSync(
  MANIFEST,
  JSON.stringify(Object.fromEntries([...byUrl].map(([url, e]) => [url, { file: e.file, pages: [...e.pages].sort() }])), null, 2) + '\n',
  'utf8',
);

// Copies offline — réécriture des URLs résolues seulement (une URL en échec
// reste distante dans la copie, signalée ci-dessus).
for (const [page, html] of htmlByPage) {
  const offline = html.replace(URL_RE, (url) => {
    const e = byUrl.get(url);
    return e?.file ? `../assets/${e.file}` : url;
  });
  writeFileSync(join(OFFLINE_DIR, page), offline, 'utf8');
}

console.log(`\n${downloaded} téléchargée(s), ${skipped} déjà locale(s), ${failed} échec(s) — manifest: ${MANIFEST}`);
console.log(`Copies offline : ${OFFLINE_DIR}\\*.html (originaux intacts)`);
if (failed > 0) process.exit(1);
