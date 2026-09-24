#!/usr/bin/env node
/**
 * Garde-fou des LIENS INTERNES (2026-09-18).
 *
 * Pourquoi : deux incidents en trois jours (7 liens le 15/09, 8 le 18/09) —
 * des liens saisis dans l'éditeur qui ne mènent nulle part : ancienne URL
 * WordPress (`/expertise/cybersecurite`), préfixe de langue oublié
 * (`/services/o-studio/`), slug traduit à la main (`/en/services/managed
 * services`, avec une espace). Rien ne les arrêtait : le schéma zod valide une
 * chaîne, pas une destination.
 *
 * Ce que fait le script : il lit le site CONSTRUIT (`dist/`), relève chaque
 * `<a href>` interne de chaque page et vérifie que la cible existe dans
 * `dist/`. Il travaille sur le rendu, pas sur les sources : un lien est jugé
 * tel que le visiteur le recevra (préfixe de langue ajouté par
 * `localizePath`, liens des composants, de la navigation et du texte enrichi
 * compris), et aucun champ de contenu n'a besoin d'être déclaré ici.
 *
 *   npm run build && npm run check:links            # liste, code 0
 *   npm run check:links -- --strict                 # code 1 s'il y a un lien cassé (CI)
 *   node scripts/check-internal-links.mjs --json    # sortie machine (correcteur)
 *
 * Trois verdicts :
 *  - OK        la cible est une page ou un fichier de `dist/` ;
 *  - REDIRIGÉ  la cible n'existe pas mais une règle de `dist/_redirects` la
 *              rattrape — AVERTISSEMENT seulement : l'hébergement CloudCannon
 *              ignore `_redirects` tant que `.cloudcannon/routing.json` n'est
 *              pas généré (DEPLOYMENT.md §6), le lien y est donc bel et bien
 *              cassé. À corriger à la source ;
 *  - CASSÉ     rien ne répond — ERREUR en mode strict.
 *
 * Pour chaque cible fautive, le script nomme les fichiers de CONTENU où la
 * chaîne apparaît (src/content, src/data) : c'est là que l'éditrice corrige.
 *
 * Où il tourne : CI (strict, après le build) et postbuild CloudCannon
 * (avertissement dans le journal de build, jamais bloquant — une sauvegarde
 * de contenu ne doit pas faire échouer l'hébergeur pour un lien).
 */
import { readFileSync, readdirSync, existsSync, statSync } from 'node:fs';
import { join, resolve, dirname, posix, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const DIST = join(ROOT, 'dist');
const STRICT = process.argv.includes('--strict');
// --json : sortie machine (consommée par scripts/fix-internal-links.mjs).
const JSON_OUT = process.argv.includes('--json');

// Préfixes servis par autre chose qu'un fichier de dist (fonction, index de
// recherche généré après coup) : jamais vérifiés.
const SKIP_PREFIXES = ['/api/', '/pagefind/', '/_cloudcannon/', '/cdn-cgi/'];
// Cibles connues et assumées (une par ligne, avec la raison).
// Liens tolérés (vide depuis le 2026-09-24 : les 4 pages « document » de
// l'ancien WordPress ont été tranchées — D18 — et les articles corrigés).
// N'y mettre une adresse que le temps d'une décision de contenu, jamais pour
// faire passer le gate.
const ALLOW = new Set([]);

if (!existsSync(DIST)) {
  console.error('[check:links] dist/ introuvable — lancer `npm run build` d\'abord.');
  process.exit(STRICT ? 1 : 0);
}

/** Tous les fichiers d'un dossier, récursivement. */
function walk(dir, out = []) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const abs = join(dir, entry.name);
    if (entry.isDirectory()) walk(abs, out);
    else out.push(abs);
  }
  return out;
}

/** Chemin d'URL d'une page de dist (`fr/contact/index.html` → `/fr/contact/`). */
function pageUrl(file) {
  const rel = relative(DIST, file).split('\\').join('/');
  return '/' + rel.replace(/index\.html$/, '');
}

/** Une cible existe-t-elle dans dist ? (fichier, dossier avec index, ou .html) */
function existsInDist(pathname) {
  let decoded;
  try {
    decoded = decodeURIComponent(pathname);
  } catch {
    return false;
  }
  const abs = join(DIST, decoded);
  if (!abs.startsWith(DIST)) return false;
  if (existsSync(abs)) {
    if (statSync(abs).isFile()) return true;
    return existsSync(join(abs, 'index.html'));
  }
  return existsSync(abs.replace(/[\\/]$/, '') + '.html');
}

/** Règles de dist/_redirects : [{ from, splat }] (seule la source compte ici). */
function loadRedirects() {
  const file = join(DIST, '_redirects');
  if (!existsSync(file)) return [];
  return readFileSync(file, 'utf8')
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith('#'))
    .map((line) => line.split(/\s+/)[0])
    .map((from) => (from.endsWith('/*') ? { from: from.slice(0, -1), splat: true } : { from, splat: false }));
}

const redirects = loadRedirects();
const isRedirected = (pathname) => {
  const bare = pathname.replace(/\/$/, '') || '/';
  return redirects.some((rule) =>
    rule.splat ? pathname.startsWith(rule.from) : rule.from.replace(/\/$/, '') === bare || rule.from === pathname,
  );
};

// ---- Relevé ---------------------------------------------------------------------
const HREF = /<a\b[^>]*?\bhref\s*=\s*(?:"([^"]*)"|'([^']*)')/gi;
/** cible → { verdict, pages: Set } */
const faulty = new Map();
let pages = 0;
let links = 0;

for (const file of walk(DIST)) {
  if (!file.endsWith('.html')) continue;
  pages += 1;
  const from = pageUrl(file);
  const html = readFileSync(file, 'utf8');
  for (const match of html.matchAll(HREF)) {
    const raw = (match[1] ?? match[2] ?? '').replace(/&amp;/g, '&').trim();
    if (!raw || raw.startsWith('#')) continue;
    if (/^[a-z][a-z0-9+.-]*:/i.test(raw) || raw.startsWith('//')) continue; // externe, mailto:, tel:…
    // Relatif → absolu par rapport à la page ; on ne garde que le chemin.
    const base = from.endsWith('/') ? from : posix.dirname(from) + '/';
    const pathname = (raw.startsWith('/') ? raw : posix.join(base, raw)).split('#')[0].split('?')[0];
    if (!pathname || SKIP_PREFIXES.some((prefix) => pathname.startsWith(prefix)) || ALLOW.has(pathname)) continue;
    links += 1;
    if (existsInDist(pathname)) continue;
    const verdict = isRedirected(pathname) ? 'redirige' : 'casse';
    const entry = faulty.get(pathname) ?? { verdict, pages: new Set() };
    entry.pages.add(from);
    faulty.set(pathname, entry);
  }
}

// ---- Où corriger : fichiers de contenu qui portent la chaîne -----------------------
const SOURCES = ['src/content', 'src/data'].map((dir) => join(ROOT, dir)).filter(existsSync);
const sourceFiles = SOURCES.flatMap((dir) => walk(dir)).filter((f) => /\.(json|md|mdx|ya?ml)$/.test(f));
const sourceText = new Map(sourceFiles.map((f) => [f, readFileSync(f, 'utf8')]));

/** Le contenu stocke souvent le lien SANS préfixe de langue, ou sans barre finale. */
function variants(pathname) {
  const bare = pathname.replace(/\/$/, '');
  const noLang = bare.replace(/^\/(fr|en)(?=\/|$)/, '');
  let decoded = bare;
  try {
    decoded = decodeURIComponent(bare);
  } catch {
    /* garde la forme encodée */
  }
  return [...new Set([bare, noLang, decoded, decoded.replace(/^\/(fr|en)(?=\/|$)/, '')])].filter((v) => v.length > 1);
}

function whereInContent(pathname) {
  const needles = variants(pathname).flatMap((v) => [`"${v}"`, `"${v}/"`, `(${v})`, `(${v}/)`, `\\"${v}\\"`, `\\"${v}/\\"`]);
  const hits = [];
  for (const [file, text] of sourceText) {
    if (needles.some((needle) => text.includes(needle))) hits.push(relative(ROOT, file).split('\\').join('/'));
  }
  return hits;
}

// ---- Rapport ------------------------------------------------------------------------
const broken = [...faulty].filter(([, e]) => e.verdict === 'casse');
const redirected = [...faulty].filter(([, e]) => e.verdict === 'redirige');

function report(title, rows) {
  if (rows.length === 0) return;
  console.log(`\n${title}`);
  for (const [target, entry] of rows.sort(([a], [b]) => a.localeCompare(b))) {
    const from = [...entry.pages].sort();
    console.log(`  ${target}`);
    console.log(`      sur ${from.length} page(s) : ${from.slice(0, 4).join(', ')}${from.length > 4 ? ', …' : ''}`);
    const files = whereInContent(target);
    console.log(
      files.length
        ? `      à corriger dans : ${files.slice(0, 6).join(', ')}${files.length > 6 ? ', …' : ''}`
        : '      à corriger dans : (pas trouvé dans src/content ni src/data — lien d\'un composant ou de la navigation)',
    );
  }
}

if (JSON_OUT) {
  const rows = [...faulty].map(([target, e]) => ({ target, verdict: e.verdict, pages: [...e.pages].sort() }));
  process.stdout.write(JSON.stringify({ pages, links, faulty: rows }));
  process.exit(0);
}

console.log(`[check:links] ${pages} pages, ${links} liens internes vérifiés.`);
report(`LIENS CASSÉS (${broken.length}) — aucune page ne répond :`, broken);
report(
  `LIENS REDIRIGÉS (${redirected.length}) — rattrapés par _redirects, ignoré par l'hébergement CloudCannon : corriger à la source`,
  redirected,
);
if (broken.length === 0 && redirected.length === 0) console.log('[check:links] aucun lien interne cassé.');

if (broken.length > 0 && STRICT) {
  console.error(`\n[check:links] ${broken.length} lien(s) cassé(s) — échec (mode strict).`);
  process.exit(1);
}
