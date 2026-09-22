// =============================================================================
// scripts/fetch-hanken-grotesk.mjs — rapatrie Hanken Grotesk EN LOCAL.
//
//   node scripts/fetch-hanken-grotesk.mjs          télécharge dans public/fonts/
//   node scripts/fetch-hanken-grotesk.mjs --check  vérifie la présence (sortie 1)
//
// POURQUOI EN LOCAL, ET NON UN <link> VERS GOOGLE. La Loi 25 interdit d'envoyer
// l'adresse IP d'un visiteur québécois à un tiers sans consentement, et un
// `@font-face` servi par fonts.gstatic.com le fait à chaque chargement de page,
// AVANT tout bandeau de consentement. La CSP du site (public/_headers)
// n'autorise d'ailleurs pas ce domaine. Même règle que pour Inter, déjà
// auto-hébergée depuis le 2026-08-14.
//
// CE QU'ON PREND. Les fichiers VARIABLES (100–900 en un seul fichier), en
// `normal` et `italic`, sur les sous-ensembles `latin` et `latin-ext`. Le
// français et l'anglais tiennent dans `latin` (é à ç œ compris) ; `latin-ext`
// couvre les noms propres étrangers et ne coûte que quelques kilo-octets, servi
// uniquement si un caractère le réclame (`unicode-range`).
//
// Les URL ne sont PAS codées en dur : elles sont lues dans la feuille de style
// que Google génère, donc une nouvelle version de la police est rapatriée sans
// modifier ce script.
// =============================================================================

import { mkdirSync, writeFileSync, existsSync, statSync } from 'node:fs';
import { dirname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const RACINE = join(dirname(fileURLToPath(import.meta.url)), '..');
const DEST = join(RACINE, 'public/fonts');
const CHECK = process.argv.includes('--check');

const CSS_URL =
  'https://fonts.googleapis.com/css2?family=Hanken+Grotesk:ital,wght@0,100..900;1,100..900&display=swap';
// Sans cet en-tête, Google sert du TTF hérité au lieu du woff2.
const UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

/** Sous-ensembles retenus → nom de fichier local, par style. */
const VOULUS = [
  { sousEnsemble: 'latin', style: 'normal', nom: 'HankenGrotesk-latin.woff2' },
  { sousEnsemble: 'latin-ext', style: 'normal', nom: 'HankenGrotesk-latin-ext.woff2' },
  { sousEnsemble: 'latin', style: 'italic', nom: 'HankenGrotesk-latin-italic.woff2' },
  { sousEnsemble: 'latin-ext', style: 'italic', nom: 'HankenGrotesk-latin-ext-italic.woff2' },
];

if (CHECK) {
  const manquants = VOULUS.filter((v) => !existsSync(join(DEST, v.nom)) || statSync(join(DEST, v.nom)).size === 0);
  console.log(`[hanken] ${VOULUS.length - manquants.length}/${VOULUS.length} fichier(s) présent(s) dans public/fonts/.`);
  if (manquants.length) {
    console.error(`  MANQUANTS : ${manquants.map((m) => m.nom).join(', ')}`);
    console.error('  Rejouer : node scripts/fetch-hanken-grotesk.mjs');
    process.exit(1);
  }
  process.exit(0);
}

const rep = await fetch(CSS_URL, { headers: { 'User-Agent': UA } });
if (!rep.ok) throw new Error(`Feuille de style Google injoignable — HTTP ${rep.status}`);
const css = await rep.text();

/**
 * La feuille est une suite de blocs `/* <sous-ensemble> *\/ @font-face { … }`.
 * On découpe sur le commentaire qui nomme le sous-ensemble, puis on lit le
 * style et l'URL de chaque bloc.
 */
const blocs = [...css.matchAll(/\/\*\s*([a-z-]+)\s*\*\/\s*@font-face\s*\{([^}]*)\}/g)].map((m) => ({
  sousEnsemble: m[1],
  style: /font-style:\s*italic/.test(m[2]) ? 'italic' : 'normal',
  url: (m[2].match(/url\((https:\/\/[^)]+\.woff2)\)/) ?? [])[1],
  unicodeRange: (m[2].match(/unicode-range:\s*([^;]+);/) ?? [])[1]?.trim(),
}));

mkdirSync(DEST, { recursive: true });

let ecrits = 0;
const rangs = [];

for (const voulu of VOULUS) {
  const bloc = blocs.find((b) => b.sousEnsemble === voulu.sousEnsemble && b.style === voulu.style);
  if (!bloc?.url) {
    console.error(`  ✗ ${voulu.nom} — bloc « ${voulu.sousEnsemble} / ${voulu.style} » introuvable dans la feuille`);
    continue;
  }
  const reponse = await fetch(bloc.url, { headers: { 'User-Agent': UA } });
  if (!reponse.ok) {
    console.error(`  ✗ ${voulu.nom} — HTTP ${reponse.status}`);
    continue;
  }
  const buf = Buffer.from(await reponse.arrayBuffer());
  // Signature woff2 : « wOF2 ». Sans ce contrôle, une page d'erreur passerait.
  if (buf.subarray(0, 4).toString('latin1') !== 'wOF2') {
    console.error(`  ✗ ${voulu.nom} — ce n’est pas un woff2 (${buf.length} o)`);
    continue;
  }
  writeFileSync(join(DEST, voulu.nom), buf);
  ecrits += 1;
  rangs.push({ ...voulu, unicodeRange: bloc.unicodeRange });
  console.log(`  ${voulu.nom.padEnd(38)} ${String(buf.length).padStart(7)} o`);
}

console.log(`\n[hanken] ${ecrits}/${VOULUS.length} fichier(s) écrits dans ${relative(RACINE, DEST)}.`);
console.log('\nPlages Unicode à recopier dans les @font-face de src/styles/theme.css :');
for (const r of rangs) console.log(`  /* ${r.sousEnsemble} ${r.style} */ ${r.unicodeRange}`);
