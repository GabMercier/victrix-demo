#!/usr/bin/env node
/**
 * migrate-typo-rem.mjs — typographie fluide + plancher de lisibilité
 * (2026-09-21, demande Gabriel : « du 12px sur un grand écran, c'est trop
 * petit », et le réglage « taille de police » du navigateur n'agissait pas).
 *
 * DEUX CHANGEMENTS, MÉCANIQUES ET REJOUABLES :
 *
 * 1. PLANCHER. Plus aucun texte sous 14px. `text-xs` (12px) devient `text-sm`,
 *    et les tailles arbitraires sous 14px (10px, 13px) remontent à 0.875rem.
 *    Écart ASSUMÉ avec les maquettes, qui descendent à 10px — arbitrage
 *    Gabriel du 2026-09-21.
 *
 * 2. UNITÉS. Les tailles ET LES INTERLIGNES en pixels passent en rem. Les
 *    deux ensemble, jamais l'un sans l'autre : un texte qui grossit dans un
 *    `leading-[14px]` figé se chevauche. C'est ce qui rend enfin effectif le
 *    réglage de police du navigateur (le zoom, lui, marchait déjà — WCAG 1.4.4
 *    était donc satisfait, mais pas l'usage réel des gens qui grossissent leur
 *    police système).
 *
 * NE TOUCHE PAS aux dimensions de boîte (`h-[]`, `w-[]`, `max-w-[]`) : ce sont
 * des choix de mise en page, pas de la typographie. Point de vigilance connu :
 * un conteneur de texte à hauteur FIXE peut déborder quand la police grossit —
 * les champs de saisie ont été repris à la main (min-h).
 *
 * Usage :
 *   node scripts/migrate-typo-rem.mjs [--check]
 * `--check` liste sans écrire (sortie 1 s'il reste quelque chose à convertir),
 * pour le portail qualité et après une fusion `staging` → `dev`.
 */
import { readFileSync, writeFileSync, readdirSync, statSync } from 'node:fs';
import { join, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const CHECK = process.argv.includes('--check');

/** Dossiers balayés — tout ce qui porte des classes Tailwind. */
const CIBLES = [
  'component-library/src',
  'src/components',
  'src/layouts',
  'src/pages',
];

/** Plus petite taille de texte tolérée, en pixels. */
const PLANCHER = 14;

/** px → rem, sans zéros inutiles (14 → 0.875, 32 → 2). */
function rem(px) {
  const valeur = px / 16;
  return `${parseFloat(valeur.toFixed(4))}rem`;
}

/**
 * Une ligne de composant → sa version convertie.
 * Les trois règles sont appliquées dans l'ordre; chacune est idempotente
 * (relancer le script ne change plus rien).
 */
export function convertir(texte) {
  let out = texte;

  // `text-xs` → `text-sm` (12px → 14px). Le mot doit être une classe entière :
  // on borne par des caractères qui ne font pas partie d'un nom de classe.
  out = out.replace(/(^|[\s"'`:[\]])text-xs(?=$|[\s"'`:[\]])/g, '$1text-sm');

  // Tailles arbitraires : plancher puis conversion.
  out = out.replace(/text-\[(\d+)px\]/g, (_, n) => {
    const px = Math.max(Number(n), PLANCHER);
    return `text-[${rem(px)}]`;
  });

  // Interlignes arbitraires : conversion seule (pas de plancher — un interligne
  // plus serré que la taille est un choix graphique légitime).
  out = out.replace(/leading-\[(\d+)px\]/g, (_, n) => `leading-[${rem(Number(n))}]`);

  return out;
}

function fichiers(dir, acc = []) {
  let entrees;
  try {
    entrees = readdirSync(dir, { withFileTypes: true });
  } catch {
    return acc;
  }
  for (const e of entrees) {
    const complet = join(dir, e.name);
    if (e.isDirectory()) fichiers(complet, acc);
    else if (/\.(astro|ts|tsx|mjs)$/.test(e.name) && !e.name.endsWith('.test.ts')) acc.push(complet);
  }
  return acc;
}

let touches = 0;
let restants = 0;
const details = [];

for (const cible of CIBLES) {
  const base = join(ROOT, cible);
  try {
    statSync(base);
  } catch {
    continue;
  }
  for (const f of fichiers(base)) {
    const avant = readFileSync(f, 'utf8');
    const apres = convertir(avant);
    if (avant === apres) continue;
    touches++;
    // Compte des occurrences réellement changées, pour un rapport honnête.
    const n =
      (avant.match(/(^|[\s"'`:[\]])text-xs(?=$|[\s"'`:[\]])/g) || []).length +
      (avant.match(/text-\[\d+px\]/g) || []).length +
      (avant.match(/leading-\[\d+px\]/g) || []).length;
    restants += n;
    details.push(`  ${f.replace(ROOT, '').replace(/^[\\/]/, '')} — ${n} occurrence(s)`);
    if (!CHECK) writeFileSync(f, apres, 'utf8');
  }
}

if (CHECK) {
  if (touches === 0) {
    console.log('[typo-rem] rien à convertir — plancher 14px et unités rem respectés.');
    process.exit(0);
  }
  console.error(`[typo-rem] ${restants} occurrence(s) à convertir dans ${touches} fichier(s) :`);
  console.error(details.join('\n'));
  console.error('Rejouer : node scripts/migrate-typo-rem.mjs');
  process.exit(1);
}

console.log(`[typo-rem] ${restants} occurrence(s) converties dans ${touches} fichier(s).`);
if (details.length) console.log(details.slice(0, 12).join('\n'));
if (details.length > 12) console.log(`  … et ${details.length - 12} autre(s) fichier(s).`);
