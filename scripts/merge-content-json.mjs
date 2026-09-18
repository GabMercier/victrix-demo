#!/usr/bin/env node
/**
 * Fusion SÉMANTIQUE des fichiers de contenu JSON en conflit (2026-09-18).
 *
 * Pourquoi : l'équipe marketing édite `staging` dans CloudCannon pendant que
 * les développeurs livrent sur `dev`. Les deux côtés touchent les MÊMES
 * fichiers JSON — l'un change des textes, l'autre ajoute des clés (seoH1,
 * contactSujet…) ou migre des valeurs (banque de pictogrammes, liens). Git
 * fusionne par LIGNES : deux ajouts voisins dans le bloc de clés de tête, ou
 * une section insérée, et c'est un conflit — 16 fichiers le 18/09, tous
 * « mécaniques », aucun désaccord réel. Ce script refait la fusion par
 * STRUCTURE : clé par clé, élément par élément, à trois voies.
 *
 *   git merge --no-commit --no-ff origin/staging      # laisse les conflits
 *   node scripts/merge-content-json.mjs               # les résout + git add
 *   node scripts/merge-content-json.mjs --check       # liste sans écrire
 *   … --prefer ours                                   # défaut : theirs
 *   … --cwd <chemin>                                  # autre worktree
 *
 * Règles (base = ancêtre commun, ours = branche courante, theirs = fusionnée) :
 *  - un seul côté a changé une valeur → on prend ce côté ;
 *  - les deux ont fait le MÊME changement → tel quel ;
 *  - les deux ont changé DIFFÉREMMENT la même valeur → VRAI CONFLIT : le côté
 *    `--prefer` gagne (défaut `theirs` — en fusionnant staging dans dev, le
 *    texte de l'éditrice gagne) et le conflit est LISTÉ pour relecture ;
 *  - clé ajoutée d'un côté → gardée ; clé supprimée d'un côté et intacte de
 *    l'autre → supprimée ; supprimée d'un côté et modifiée de l'autre → gardée
 *    (listée) ;
 *  - tableaux de même longueur des trois côtés → fusion élément par élément ;
 *    sinon alignement par SIGNATURE (`_bookshop_name`, puis `type`, `title`,
 *    `question`, `label`) — une section insérée d'un côté s'insère sans
 *    déranger les modifications de l'autre.
 * L'ordre des clés suit `ours` ; les clés propres à `theirs` s'ajoutent à la
 * suite. Sortie : JSON indenté de 2 espaces + saut de ligne final (le format
 * du dépôt et de CloudCannon).
 *
 * Après la fusion, rejouer les migrations mécaniques — elles ne survivent pas
 * à un vrai conflit que l'autre côté gagne :
 *   node scripts/migrate-icons-bank.mjs     npm run build && npm run fix:links
 */
import { execFileSync } from 'node:child_process';
import { writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';

const args = process.argv.slice(2);
const flag = (name) => {
  const i = args.indexOf(name);
  return i >= 0 ? args[i + 1] : undefined;
};
const CWD = resolve(flag('--cwd') ?? process.cwd());
const PREFER = flag('--prefer') === 'ours' ? 'ours' : 'theirs';
const CHECK_ONLY = args.includes('--check');

const git = (...a) => execFileSync('git', a, { cwd: CWD, encoding: 'utf8', maxBuffer: 256 * 1024 * 1024 });
const stage = (n, path) => {
  try {
    return JSON.parse(git('show', `:${n}:${path}`));
  } catch {
    return undefined; // absent de ce côté (ajout/suppression de fichier)
  }
};

const isObj = (v) => v !== null && typeof v === 'object' && !Array.isArray(v);
const eq = (a, b) => JSON.stringify(a) === JSON.stringify(b);
const clip = (v) => {
  const s = typeof v === 'string' ? v : JSON.stringify(v);
  return s === undefined ? '(absent)' : s.length > 90 ? s.slice(0, 87) + '…' : s;
};

/** @type {{file:string,path:string,base:unknown,ours:unknown,theirs:unknown}[]} */
const conflicts = [];
let currentFile = '';
const pick = (path, base, ours, theirs) => {
  conflicts.push({ file: currentFile, path, base, ours, theirs });
  return PREFER === 'ours' ? ours : theirs;
};

function merge3(base, ours, theirs, path) {
  if (eq(ours, theirs)) return ours;
  if (eq(ours, base)) return theirs;
  if (eq(theirs, base)) return ours;
  if (isObj(ours) && isObj(theirs)) return mergeObject(isObj(base) ? base : {}, ours, theirs, path);
  if (Array.isArray(ours) && Array.isArray(theirs)) return mergeArray(Array.isArray(base) ? base : [], ours, theirs, path);
  return pick(path, base, ours, theirs);
}

function mergeObject(base, ours, theirs, path) {
  const out = {};
  const keys = [...Object.keys(ours), ...Object.keys(theirs).filter((k) => !(k in ours))];
  for (const key of keys) {
    const p = path ? `${path}.${key}` : key;
    const inB = key in base;
    const inO = key in ours;
    const inT = key in theirs;
    if (inO && inT) out[key] = merge3(base[key], ours[key], theirs[key], p);
    else if (inO) {
      // absent de theirs : ajout d'ours (garder) ou suppression de theirs
      if (!inB) out[key] = ours[key];
      else if (!eq(ours[key], base[key])) out[key] = pick(`${p} (supprimée par theirs, modifiée par ours — gardée)`, base[key], ours[key], undefined) ?? ours[key];
    } else if (inT) {
      if (!inB) out[key] = theirs[key];
      else if (!eq(theirs[key], base[key])) out[key] = theirs[key]; // supprimée par ours, modifiée par theirs → gardée
    }
  }
  return out;
}

const signature = (v) =>
  isObj(v) ? String(v._bookshop_name ?? v.type ?? v.title ?? v.question ?? v.label ?? JSON.stringify(v)) : JSON.stringify(v);

/** Plus longue sous-suite commune des signatures → Map(indice a → indice b). */
function lcsMatch(a, b) {
  const sa = a.map(signature);
  const sb = b.map(signature);
  const dp = Array.from({ length: a.length + 1 }, () => new Array(b.length + 1).fill(0));
  for (let i = a.length - 1; i >= 0; i--)
    for (let j = b.length - 1; j >= 0; j--)
      dp[i][j] = sa[i] === sb[j] ? dp[i + 1][j + 1] + 1 : Math.max(dp[i + 1][j], dp[i][j + 1]);
  const map = new Map();
  let i = 0;
  let j = 0;
  while (i < a.length && j < b.length) {
    if (sa[i] === sb[j]) map.set(i++, j++);
    else if (dp[i + 1][j] >= dp[i][j + 1]) i++;
    else j++;
  }
  return map;
}

function mergeArray(base, ours, theirs, path) {
  if (base.length === ours.length && ours.length === theirs.length) {
    return ours.map((_, i) => merge3(base[i], ours[i], theirs[i], `${path}[${i}]`));
  }
  const baseToOurs = lcsMatch(base, ours);
  const baseToTheirs = lcsMatch(base, theirs);
  const theirsToBase = new Map([...baseToTheirs].map(([b, t]) => [t, b]));
  const oursToBase = new Map([...baseToOurs].map(([b, o]) => [o, b]));
  /** @type {{value:unknown, baseIndex:number|null}[]} */
  const out = [];
  // 1. L'ordre de theirs fait foi (insertions et suppressions de l'éditrice).
  theirs.forEach((item, t) => {
    const b = theirsToBase.get(t);
    if (b === undefined) return void out.push({ value: item, baseIndex: null }); // inséré par theirs
    const o = baseToOurs.get(b);
    if (o !== undefined) out.push({ value: merge3(base[b], ours[o], item, `${path}[${signature(item)}]`), baseIndex: b });
    else if (!eq(item, base[b])) out.push({ value: item, baseIndex: b }); // supprimé par ours, modifié par theirs → gardé
  });
  // 2. Insertions d'ours : juste après leur voisin précédent commun.
  ours.forEach((item, o) => {
    if (oursToBase.has(o)) return;
    let anchor = -1;
    for (let k = o - 1; k >= 0 && anchor < 0; k--) {
      const b = oursToBase.get(k);
      if (b !== undefined) anchor = out.findIndex((e) => e.baseIndex === b);
    }
    out.splice(anchor + 1, 0, { value: item, baseIndex: null });
  });
  return out.map((e) => e.value);
}

// ---- Fichiers en conflit ------------------------------------------------------------
const unmerged = git('diff', '--name-only', '--diff-filter=U')
  .split('\n')
  .map((l) => l.trim())
  .filter(Boolean);
const jsonFiles = unmerged.filter((f) => f.endsWith('.json'));
const others = unmerged.filter((f) => !f.endsWith('.json'));

if (unmerged.length === 0) {
  console.log('[merge:json] aucun fichier en conflit.');
  process.exit(0);
}

let resolved = 0;
for (const file of jsonFiles) {
  currentFile = file;
  const base = stage(1, file);
  const ours = stage(2, file);
  const theirs = stage(3, file);
  if (ours === undefined || theirs === undefined) {
    console.log(`  ⚠ ${file} : supprimé d'un côté — à trancher à la main.`);
    continue;
  }
  const before = conflicts.length;
  const merged = merge3(base ?? {}, ours, theirs, '');
  const real = conflicts.length - before;
  console.log(`  ${CHECK_ONLY ? '·' : '✓'} ${file}${real ? ` — ${real} vrai(s) conflit(s), « ${PREFER} » gagne` : ''}`);
  if (!CHECK_ONLY) {
    writeFileSync(join(CWD, file), JSON.stringify(merged, null, 2) + '\n');
    git('add', '--', file);
  }
  resolved += 1;
}

console.log(`\n[merge:json] ${resolved}/${jsonFiles.length} fichier(s) JSON ${CHECK_ONLY ? 'résolubles' : 'résolus et indexés'}.`);
if (others.length) console.log(`Restent à la main (pas du JSON) :\n  ${others.join('\n  ')}`);
if (conflicts.length) {
  console.log(`\nVRAIS CONFLITS (${conflicts.length}) — les deux côtés ont changé la même valeur ; « ${PREFER} » a gagné. À relire :`);
  for (const c of conflicts) {
    console.log(`\n  ${c.file}\n    ${c.path}`);
    console.log(`      base   : ${clip(c.base)}`);
    console.log(`      ours   : ${clip(c.ours)}`);
    console.log(`      theirs : ${clip(c.theirs)}`);
  }
}
