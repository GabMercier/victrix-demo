#!/usr/bin/env node
/**
 * Correcteur des LIENS INTERNES hérités de WordPress (2026-09-18) — pendant
 * REJOUABLE du garde-fou scripts/check-internal-links.mjs (même esprit que
 * migrate-icons-bank.mjs : une passe mécanique, vérifiable, sans risque).
 *
 *   npm run build                                   # dist/ frais, OBLIGATOIRE
 *   node scripts/fix-internal-links.mjs --check     # liste ce qui changerait
 *   node scripts/fix-internal-links.mjs             # réécrit les sources
 *
 * D'où viennent les liens fautifs : les articles et plusieurs pages de service
 * ont été importés de victrix.ca avec leurs liens d'ORIGINE —
 *   /certification-iso-27001-iso-9001/   (article à la racine, à la WordPress)
 *   /en/expertise/cybersecurity/         (ancienne arborescence « expertise »)
 *   /contact/                            (sans préfixe de langue)
 * alors que le site sert /fr/ressources/<slug>/, /en/services/<slug>/,
 * /fr/contact/.
 *
 * Règle de réécriture — pour chaque cible fautive du garde-fou, on essaie dans
 * l'ordre, et on ne retient un candidat QUE s'il existe dans dist/ :
 *   1. le même chemin avec le préfixe de langue du fichier   (/contact/ → /fr/contact/)
 *   2. l'article de même slug sous /<langue>/ressources/      (articles WordPress)
 *   3. la destination de la règle de dist/_redirects qui l'attrape (splat compris)
 * Aucun candidat valable → la cible est listée « À LA MAIN », jamais devinée.
 *
 * Ce qui est réécrit :
 *  - cible AVEC préfixe de langue (/en/expertise…) : partout où la chaîne
 *    apparaît entre délimiteurs de lien — Markdown `](…)`, HTML `href="…"`,
 *    valeur JSON `"…"` ;
 *  - cible SANS préfixe (/contact/, /<slug>/) : SEULEMENT dans du Markdown ou
 *    du HTML (`](…)`, `href=…`), JAMAIS dans une valeur JSON nue — la
 *    navigation et les fiches de solutions stockent exprès leurs liens sans
 *    préfixe (localizePath l'ajoute au rendu) : `"href": "/contact"` y est
 *    CORRECT et ne doit pas bouger.
 * L'ancre (#…) et la requête (?…) qui suivent sont conservées.
 *
 * TABLE `MANUAL` : les cibles qu'aucune règle ne peut deviner (slug traduit à
 * la main, page renommée, arborescence inventée) — destination repérée dans
 * dist/ par un humain, consignée ici pour que la passe reste REJOUABLE (une
 * fusion de `staging` ramène les mêmes liens). Chaque règle a une portée
 * (expression régulière sur le chemin du fichier) et n'est appliquée que si sa
 * destination existe dans dist/.
 */
import { execFileSync } from 'node:child_process';
import { readFileSync, writeFileSync, readdirSync, existsSync, statSync } from 'node:fs';
import { join, resolve, dirname, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const DIST = join(ROOT, 'dist');
const CHECK_ONLY = process.argv.includes('--check');

const report = JSON.parse(
  execFileSync(process.execPath, [join(ROOT, 'scripts/check-internal-links.mjs'), '--json'], {
    encoding: 'utf8',
    maxBuffer: 64 * 1024 * 1024,
  }),
);

function walk(dir, out = []) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const abs = join(dir, entry.name);
    if (entry.isDirectory()) walk(abs, out);
    else out.push(abs);
  }
  return out;
}

function existsInDist(pathname) {
  let decoded;
  try {
    decoded = decodeURIComponent(pathname);
  } catch {
    return false;
  }
  const abs = join(DIST, decoded);
  if (!abs.startsWith(DIST)) return false;
  if (existsSync(abs)) return statSync(abs).isFile() || existsSync(join(abs, 'index.html'));
  return false;
}

// Règles de dist/_redirects, destination comprise.
const redirectRules = existsSync(join(DIST, '_redirects'))
  ? readFileSync(join(DIST, '_redirects'), 'utf8')
      .split('\n')
      .map((line) => line.trim())
      .filter((line) => line && !line.startsWith('#'))
      .map((line) => line.split(/\s+/))
      .filter((cols) => cols.length >= 2)
      .map(([from, to]) => ({ from, to }))
  : [];

function followRedirect(pathname) {
  const bare = pathname.replace(/\/$/, '') || '/';
  for (const { from, to } of redirectRules) {
    if (from.endsWith('/*')) {
      const prefix = from.slice(0, -1);
      if (pathname.startsWith(prefix)) return to.replace(':splat', pathname.slice(prefix.length));
    } else if ((from.replace(/\/$/, '') || '/') === bare) {
      return to;
    }
  }
  return null;
}

const withSlash = (p) => (p.endsWith('/') || /\.[a-z0-9]+$/i.test(p) ? p : p + '/');

/** Meilleure destination EXISTANTE pour une cible fautive, vue d'un fichier de langue `lang`. */
function replacementFor(target, lang) {
  const bare = target.replace(/\/$/, '');
  const prefixed = bare.match(/^\/(fr|en)(\/.*|$)/);
  const candidates = [];
  if (prefixed) {
    candidates.push(`/${prefixed[1]}/ressources${prefixed[2]}`);
  } else {
    candidates.push(`/${lang}${bare}`, `/${lang}/ressources${bare}`);
  }
  const redirected = followRedirect(target) ?? followRedirect(bare);
  if (redirected) candidates.push(redirected);
  for (const candidate of candidates.map(withSlash)) {
    if (existsInDist(candidate)) return candidate;
  }
  return null;
}

const escapeRe = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const SOURCES = ['src/content', 'src/data'].map((dir) => join(ROOT, dir)).filter(existsSync);
const files = SOURCES.flatMap((dir) => walk(dir)).filter((f) => /\.(json|md|mdx)$/.test(f));
const langOf = (file) => (/[\\/]en[\\/]|[\\/]en\.json$/.test(file) ? 'en' : 'fr');

// Les cibles les plus longues d'abord : /en/expertise/cybersecurity/pentest
// avant /en/expertise/cybersecurity.
const targets = report.faulty
  .map((row) => row.target)
  .filter((target) => target !== '/')
  .sort((a, b) => b.length - a.length);

let changedFiles = 0;
let changedLinks = 0;
const fixedTargets = new Set();

for (const file of files) {
  const lang = langOf(file);
  const before = readFileSync(file, 'utf8');
  let text = before;
  for (const target of targets) {
    const bare = target.replace(/\/$/, '');
    let literal = bare;
    try {
      literal = decodeURIComponent(bare);
    } catch {
      /* forme encodée conservée */
    }
    if (!text.includes(literal)) continue;
    const replacement = replacementFor(target, lang);
    if (!replacement) continue;
    const hasLang = /^\/(fr|en)(\/|$)/.test(bare);
    // Avec préfixe : tout délimiteur de lien. Sans préfixe : Markdown/HTML seulement.
    const lookbehind = hasLang ? `(?<=[("'])` : `(?<=\\]\\(|href=\\\\?["'])`;
    const pattern = new RegExp(`${lookbehind}${escapeRe(literal)}/?(?=[)"'#?\\\\ ])`, 'g');
    text = text.replace(pattern, () => {
      changedLinks += 1;
      fixedTargets.add(target);
      return replacement;
    });
  }
  if (text !== before) {
    changedFiles += 1;
    if (!CHECK_ONLY) writeFileSync(file, text);
    console.log(`  ${CHECK_ONLY ? 'à corriger' : 'corrigé'} : ${relative(ROOT, file).split('\\').join('/')}`);
  }
}

// ---- Table manuelle ------------------------------------------------------------------
/** @type {{scope: RegExp, from: string, to: string, bare?: boolean}[]} */
const MANUAL = [
  { scope: /pages\/en\/services\.json$/, from: '/en/expertise', to: '/en/expertises/' },
  { scope: /pages\/en\/services\.json$/, from: '/en/services/artificial-intelligence', to: '/en/services/intelligence-artificielle/' },
  { scope: /pages\/en\/services\.json$/, from: '/en/services/application-services', to: '/en/services/services-applicatifs/' },
  { scope: /pages\/en\/services\.json$/, from: '/en/services/managed services', to: '/en/services/managed-it-services/' },
  { scope: /pages\/fr\/services\.json$/, from: '/fr/services/services-geres', to: '/fr/services/services-ti-geres/' },
  { scope: /pages\/en\/conditions-utilisation\.json$/, from: '/en/privacy-policy', to: '/en/politique-confidentialite/' },
  { scope: /\/en\//, from: '/en/expertise/artificial-intelligence/ai-opportunity-analysis', to: '/en/services/artificial-intelligence/ai-opportunity-analysis/' },
  { scope: /\/en\//, from: '/en/expertise/ai-opportunity-analysis', to: '/en/services/artificial-intelligence/ai-opportunity-analysis/' },
  { scope: /\/en\//, from: '/en/expertise/artificial-intelligence', to: '/en/services/intelligence-artificielle/' },
  { scope: /blog\/fr\//, from: '/decouvrir-victrix', to: '/fr/decouvrir/' },
  { scope: /blog\/en\//, from: '/en/discover-victrix', to: '/en/decouvrir/' },
  { scope: /content\/(services|pages)\/fr\//, from: '/expertise/cybersecurite', to: '/fr/services/cybersecurite/' },
  { scope: /content\/(services|pages)\/fr\//, from: '/fr/nos-expertises/cybersecurite', to: '/fr/services/cybersecurite/' },
  { scope: /content\/services\/fr\//, from: '/services/o-studio', to: '/fr/services/productivite/o-studio/' },
  { scope: /content\/services\/en\//, from: '/en/services/o-studio', to: '/en/services/productivity-consulting/o-studio/' },
  // Sections de page : URL FINALE attendue (l'inverse de la navigation) — un
  // « /contact/ » nu dans une page de service est un préfixe de langue oublié.
  { scope: /content\/(services|pages)\/fr\//, from: '/contact', to: '/fr/contact/' },
  { scope: /content\/(services|pages)\/en\//, from: '/contact', to: '/en/contact/' },
  // Fiche du catalogue : convention SANS préfixe (localizePath l'ajoute) → destination sans préfixe.
  { scope: /solutions\/en\/o-bureau\.json$/, from: '/services/productivite/o-bureau', to: '/services/productivity-consulting/office-booking', bare: true },
];
for (const file of files) {
  const rel = relative(ROOT, file).split('\\').join('/');
  const before = readFileSync(file, 'utf8');
  let text = before;
  for (const rule of MANUAL) {
    if (!rule.scope.test(rel) || !text.includes(rule.from)) continue;
    const lang = langOf(file);
    const probe = rule.bare ? `/${lang}${rule.to}/` : rule.to;
    if (!existsInDist(probe)) continue; // destination disparue : ne rien écrire de faux
    const pattern = new RegExp(`(?<=[("'])${escapeRe(rule.from)}/?(?=[)"'#?\\\\ ])`, 'g');
    text = text.replace(pattern, () => {
      changedLinks += 1;
      fixedTargets.add(rule.from);
      fixedTargets.add(rule.from + '/');
      fixedTargets.add(`/${lang}${rule.from}`);
      return rule.to;
    });
  }
  if (text !== before) {
    changedFiles += 1;
    if (!CHECK_ONLY) writeFileSync(file, text);
    console.log(`  ${CHECK_ONLY ? 'à corriger' : 'corrigé'} (table manuelle) : ${rel}`);
  }
}

const manual = report.faulty.filter((row) => row.target !== '/' && !fixedTargets.has(row.target));
console.log(
  `\n[fix:links] ${changedLinks} lien(s) dans ${changedFiles} fichier(s) ${CHECK_ONLY ? 'à réécrire' : 'réécrit(s)'} — ${report.faulty.length - manual.length} cible(s) fautive(s) sur ${report.faulty.length} traitée(s).`,
);
if (manual.length) {
  console.log(`\nÀ LA MAIN (${manual.length}) — aucune destination existante trouvée, ou lien stocké sans préfixe dans un champ JSON :`);
  for (const row of manual) console.log(`  [${row.verdict}] ${row.target}   ← ${row.pages.slice(0, 3).join(', ')}`);
}
if (!CHECK_ONLY && changedFiles > 0) console.log('\nRelancer `npm run build` puis `npm run check:links` pour confirmer.');
if (CHECK_ONLY && changedFiles > 0) process.exit(1);
