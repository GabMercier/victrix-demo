#!/usr/bin/env node
/**
 * Migration du 2026-09-21 — FONDS CHAUDS (maquette « page produit - enfant »).
 *
 * La maquette n'a plus de bande blanche : canevas et bandes = ivoire #fcf9f5,
 * bandes alternées = beige #f6f3ef, le blanc est réservé aux cartes. Les jetons
 * (src/styles/theme.css) et les défauts (zod, composants, specs Bookshop) ont
 * basculé ; ce script aligne le CONTENU déjà posé :
 *
 *   « blanc » → « ivoire »      « givre » → « beige »
 *
 * Les autres teintes (perle, brume, bleus, sable, pierre) sont des choix
 * délibérés : on n'y touche pas. Les 10 clés restent offertes dans l'éditeur.
 *
 *   node scripts/migrate-fonds-chauds.mjs          # applique
 *   node scripts/migrate-fonds-chauds.mjs --check  # liste sans écrire (exit 1 s'il reste du travail)
 *
 * Rejouable sans danger — à relancer après une fusion `staging` → `dev` si une
 * sauvegarde CloudCannon antérieure à la bascule a ramené une ancienne valeur.
 * Seule la valeur change : remplacement de texte ciblé, la mise en forme
 * CloudCannon (indentation, fins de ligne, échappements) est conservée.
 *
 * Signale aussi, page par page, les sections VOISINES de même teinte (deux
 * bandes ivoire ou deux bandes beige d'affilée) : à alterner à la main si le
 * rendu l'exige — simple avertissement, jamais un échec.
 */
import { readFileSync, writeFileSync, readdirSync, statSync } from 'node:fs';
import { join, resolve, dirname, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const CHECK = process.argv.includes('--check');
const VERBOSE = process.argv.includes('--voisins');

const REMAP = { blanc: 'ivoire', givre: 'beige' };

function* contentFiles(dir) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) yield* contentFiles(p);
    else if (/\.(json|md|mdx)$/.test(name)) yield p;
  }
}

// JSON : `"fond": "blanc"` — front matter YAML : `fond: blanc` / `fond: 'blanc'`.
const JSON_RE = /("fond":\s*")(blanc|givre)(")/g;
const YAML_RE = /^(\s*fond:\s*['"]?)(blanc|givre)(['"]?\s*)$/gm;

let files = 0;
let values = 0;
const voisins = [];
for (const base of ['src/content', 'src/data']) {
  for (const file of contentFiles(resolve(ROOT, base))) {
    const before = readFileSync(file, 'utf8');
    let count = 0;
    const swap = (_m, a, key, c) => {
      count += 1;
      return a + REMAP[key] + c;
    };
    const after = before.replace(file.endsWith('.json') ? JSON_RE : YAML_RE, swap);
    if (count) {
      files += 1;
      values += count;
      if (!CHECK) writeFileSync(file, after);
    }
    // Voisinage (JSON seulement) : teinte effective connue = clé `fond` présente.
    if (file.endsWith('.json')) {
      try {
        const sections = JSON.parse(after)?.sections;
        if (Array.isArray(sections)) {
          sections.forEach((s, i) => {
            const prev = sections[i - 1];
            if (prev?.fond && s?.fond && prev.fond === s.fond) {
              voisins.push(`${relative(ROOT, file)} : sections ${i} et ${i + 1} (${prev.type} / ${s.type}) = ${s.fond}`);
            }
          });
        }
      } catch {
        /* fichier non JSON valide : ignoré */
      }
    }
  }
}

console.log(
  `[fonds] ${values} valeur(s) ${CHECK ? 'à migrer' : 'migrée(s)'} dans ${files} fichier(s) — blanc → ivoire, givre → beige.`,
);
if (voisins.length) {
  console.log(`[fonds] ${voisins.length} paire(s) de sections voisines de même teinte${VERBOSE ? ' :' : ' (détail : --voisins).'}`);
  if (VERBOSE) for (const v of voisins) console.log(`  - ${v}`);
}
if (CHECK && values) process.exit(1);
