#!/usr/bin/env node
/**
 * Migration du 2026-09-18 — banque de pictogrammes UNIQUE
 * (component-library/src/shared/icons.ts).
 *
 * Avant, chaque section à icône avait sa propre liste fermée ; certaines clés
 * désignaient des dessins différents selon la section (« groupe », « etoile »…)
 * et plusieurs dessins quasi identiques coexistaient. La banque unique lève
 * les homonymes : ce script renomme, PAR TYPE DE SECTION, les valeurs `icon`
 * du contenu. Rejouable sans danger (une valeur déjà migrée n'est plus dans la
 * table) — à relancer après un `git pull` si une sauvegarde CloudCannon faite
 * avant la bascule a réintroduit une ancienne clé.
 *
 *   node scripts/migrate-icons-bank.mjs          # applique
 *   node scripts/migrate-icons-bank.mjs --check  # liste sans écrire (exit 1 s'il reste du travail)
 *
 * Seules les valeurs changent : le fichier est réécrit par remplacement de
 * texte ciblé (la mise en forme CloudCannon — indentation, fins de ligne,
 * échappements — est conservée telle quelle).
 */
import { readFileSync, writeFileSync, readdirSync, statSync } from 'node:fs';
import { join, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const CHECK = process.argv.includes('--check');

/** type de section → champ → ancienne clé → clé de la banque. */
const RENAMES = {
  'bento-metrics': { icon: { insigne: 'coche' } },
  'value-tiles': { icon: { insigne: 'coche' } },
  'exclusive-tools': { icon: { etoile: 'etincelle' } },
  'expertise-bento': { icon: { personnes: 'groupe' } },
  stats: { icon: { groupe: 'groupe-mains', engrenages: 'engrenage-horloge' } },
  'photo-features': { icon: { croissance: 'croissance-pleine' } },
};

function* jsonFiles(dir) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) yield* jsonFiles(p);
    else if (name.endsWith('.json')) yield p;
  }
}

/** Compte les valeurs à renommer dans une section (parcours récursif). */
function collect(node, table, found) {
  if (Array.isArray(node)) return node.forEach((n) => collect(n, table, found));
  if (!node || typeof node !== 'object') return;
  for (const [key, value] of Object.entries(node)) {
    if (typeof value === 'string' && table[key]?.[value]) found.push([key, value, table[key][value]]);
    else collect(value, table, found);
  }
}

let filesChanged = 0;
let valuesChanged = 0;
for (const base of ['src/content', 'schemas']) {
  for (const file of jsonFiles(resolve(ROOT, base))) {
    let text = readFileSync(file, 'utf8');
    let data;
    try {
      data = JSON.parse(text);
    } catch {
      continue;
    }
    const sections = Array.isArray(data?.sections) ? data.sections : [];
    let changed = 0;
    // Les sections se suivent dans le texte dans l'ordre du tableau : on avance
    // un curseur de section en section pour ne toucher QUE la bonne occurrence.
    let cursor = text.indexOf('"sections"');
    for (const section of sections) {
      const table = RENAMES[section?.type];
      const typeNeedle = `"type": ${JSON.stringify(section?.type ?? '')}`;
      const found = [];
      if (table) collect(section, table, found);
      // Étendue textuelle de la section = du curseur à la fin de sa sérialisation.
      const span = JSON.stringify(section, null, 2).length;
      if (found.length) {
        const typeAt = text.indexOf(typeNeedle, cursor);
        if (typeAt < 0) throw new Error(`${file}: section ${section.type} introuvable dans le texte`);
        // Bornes généreuses : la section contient son "type" ; on remplace dans
        // la fenêtre [début de section, début + taille sérialisée + marge].
        const from = text.lastIndexOf('{', typeAt);
        let to = from;
        for (const [key, oldValue, newValue] of found) {
          const needle = `"${key}": "${oldValue}"`;
          const at = text.indexOf(needle, Math.max(from, to - needle.length));
          const limit = from + span + 4000;
          if (at < 0 || at > limit) throw new Error(`${file}: ${needle} introuvable dans la section ${section.type}`);
          text = text.slice(0, at) + `"${key}": "${newValue}"` + text.slice(at + needle.length);
          to = at + 1;
          changed++;
        }
      }
      const next = text.indexOf(typeNeedle, cursor);
      if (next >= 0) cursor = next + typeNeedle.length;
    }
    if (changed) {
      filesChanged++;
      valuesChanged += changed;
      console.log(`${CHECK ? 'à migrer' : 'migré'}  ${file.slice(ROOT.length + 1).replace(/\\/g, '/')}  (${changed})`);
      if (!CHECK) {
        JSON.parse(text); // le résultat doit rester du JSON valide
        writeFileSync(file, text);
      }
    }
  }
}
console.log(`[icons-bank] ${valuesChanged} valeur(s) dans ${filesChanged} fichier(s)${CHECK ? ' à migrer' : ' migrées'}.`);
if (CHECK && valuesChanged) process.exit(1);
