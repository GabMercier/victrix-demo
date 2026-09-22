// =============================================================================
// scripts/migrate-fonds-bleus.mjs — remplace les clés de fond RETIRÉES par
// celle en vigueur, dans tout le contenu.
//
//   node scripts/migrate-fonds-bleus.mjs            réécrit
//   node scripts/migrate-fonds-bleus.mjs --check    liste sans écrire (sortie 1)
//
// POURQUOI. Le 2026-09-22, les codes officiels de la marque ont montré que
// « Bleu Victrix » #002fc7 et « Bleu électrique » #1a5bff étaient deux valeurs
// FAUSSES du même bleu. Ils ont fusionné, et la clé `bleu-profond` a été
// retirée de la palette — après vérification qu'aucune section ne la portait.
//
// Ça n'a pas suffi : QUATRE HEURES plus tard, une sauvegarde CloudCannon a
// écrit `bleu-profond` (l'éditeur avait encore l'option en session) et le build
// de production a cassé. Leçon : une liste fermée est éditée EN CONTINU, donc
// « 0 occurrence au moment du retrait » ne prouve rien.
//
// La tolérance vit maintenant dans le schéma (`FOND_ALIAS`, shared/fonds.ts) :
// le build ne cassera plus. Ce script, lui, NETTOIE le contenu.
// À REJOUER après chaque fusion `staging` → `dev` — même consigne que
// migrate-fonds-chauds.mjs, et pour la même raison.
// =============================================================================

import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { dirname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const RACINE = join(dirname(fileURLToPath(import.meta.url)), '..');
const CHECK = process.argv.includes('--check');

/**
 * La table d'alias est LUE dans sa source unique plutôt que recopiée ici —
 * `migrate-fonds-chauds.mjs` code la sienne en dur, et c'est précisément le
 * genre de duplication qui dérive en silence. Node ne sait pas importer un
 * `.ts` : on extrait le bloc au texte.
 */
function lireAlias() {
  const src = readFileSync(join(RACINE, 'component-library/src/shared/fonds.ts'), 'utf8');
  const bloc = src.match(/export const FOND_ALIAS[^=]*=\s*\{([\s\S]*?)\n\};/);
  if (!bloc) throw new Error('FOND_ALIAS introuvable dans component-library/src/shared/fonds.ts');
  const alias = {};
  for (const m of bloc[1].matchAll(/['"]([\w-]+)['"]\s*:\s*['"]([\w-]+)['"]/g)) {
    alias[m[1]] = m[2];
  }
  if (Object.keys(alias).length === 0) throw new Error('FOND_ALIAS est vide — rien à migrer ?');
  return alias;
}

const FOND_ALIAS = lireAlias();

function fichiers(dir, out = []) {
  let entrees;
  try {
    entrees = readdirSync(dir, { withFileTypes: true });
  } catch {
    return out;
  }
  for (const e of entrees) {
    const abs = join(dir, e.name);
    if (e.isDirectory()) fichiers(abs, out);
    else if (e.name.endsWith('.json')) out.push(abs);
  }
  return out;
}

/** Remplace récursivement toute valeur de clé `fond` qui est un alias périmé. */
function migrer(noeud, trouvailles) {
  if (Array.isArray(noeud)) {
    for (const v of noeud) migrer(v, trouvailles);
    return;
  }
  if (!noeud || typeof noeud !== 'object') return;
  for (const [cle, valeur] of Object.entries(noeud)) {
    if (cle === 'fond' && typeof valeur === 'string' && FOND_ALIAS[valeur]) {
      trouvailles.push({ avant: valeur, apres: FOND_ALIAS[valeur] });
      noeud[cle] = FOND_ALIAS[valeur];
    } else {
      migrer(valeur, trouvailles);
    }
  }
}

let total = 0;
const touches = [];

for (const racine of ['src/content', 'src/data']) {
  for (const f of fichiers(join(RACINE, racine))) {
    let data;
    const texte = readFileSync(f, 'utf8');
    try {
      data = JSON.parse(texte);
    } catch {
      continue;
    }
    const trouvailles = [];
    migrer(data, trouvailles);
    if (trouvailles.length === 0) continue;
    total += trouvailles.length;
    touches.push({ fichier: relative(RACINE, f), trouvailles });
    if (!CHECK) writeFileSync(f, JSON.stringify(data, null, 2) + '\n');
  }
}

for (const { fichier, trouvailles } of touches) {
  const detail = trouvailles.map((t) => `${t.avant} → ${t.apres}`).join(', ');
  console.log(`  ${CHECK ? 'À MIGRER' : 'migré  '}  ${fichier}  (${detail})`);
}

console.log(
  `[fonds-bleus] ${total} fond(s) ${CHECK ? 'à migrer' : 'migré(s)'} dans ${touches.length} fichier(s)` +
    ` — alias suivis : ${Object.entries(FOND_ALIAS).map(([a, b]) => `${a}→${b}`).join(', ')}.`,
);

if (CHECK && total > 0) {
  console.error('\nRejouer : node scripts/migrate-fonds-bleus.mjs');
  process.exit(1);
}
