#!/usr/bin/env node
/**
 * extract-gf-entries.mjs — Exporte les ENTRÉES Gravity Forms (leads, abonnés
 * infolettre…) depuis le dump MySQL de victrix.ca, en CSV par formulaire.
 *
 * Même parseur streaming que extract-sql.mjs (dump 293 Mo, jamais chargé en
 * entier). Tables lues : vic_gf_form (titres), vic_gf_form_meta (libellés de
 * champs, display_meta JSON), vic_gf_entry (entêtes d'entrée : date, statut,
 * URL source), vic_gf_entry_meta (valeurs de champs, meta_key = id de champ
 * GF, ex. « 1 », « 1.3 » pour un sous-champ de nom).
 *
 * ⚠️ DONNÉES PERSONNELLES (Loi 25) : la sortie va PAR DÉFAUT HORS du dépôt
 * (C:/Repo/Victrix/siteWP/export-gf-entries/) — ne jamais committer ces CSV.
 * Le dump est daté (2026-07-23) : refaire un export final (WP admin →
 * Forms → Import/Export → Export Entries, ou dump frais) au décommission.
 *
 * Usage : node scripts/migration/extract-gf-entries.mjs
 *         [--in <dump.sql>] [--out <dossier>] [--form <id>]
 */
import { createReadStream, writeFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';

const args = process.argv.slice(2);
const getArg = (name, def) => {
  const i = args.indexOf(name);
  return i >= 0 && args[i + 1] ? args[i + 1] : def;
};
const IN_FILE = getArg('--in', 'C:/Repo/Victrix/siteWP/victrix_bdd.sql');
const OUT_DIR = getArg('--out', 'C:/Repo/Victrix/siteWP/export-gf-entries');
const ONLY_FORM = getArg('--form', null);

const TABLES = new Set(['vic_gf_form', 'vic_gf_form_meta', 'vic_gf_entry', 'vic_gf_entry_meta']);

// --- Collecte ----------------------------------------------------------------
const forms = new Map(); // id → { title, isTrash }
const formFields = new Map(); // formId → [{ id, label, type, inputs:[{id,label}] }]
const entries = new Map(); // entryId → { formId, date, status, sourceUrl, ip, values: Map(metaKey → value) }

function field(cols, row, name) {
  const i = cols.indexOf(name);
  return i >= 0 ? row[i] : null;
}

function handleRow(table, cols, row) {
  switch (table) {
    case 'vic_gf_form':
      forms.set(Number(field(cols, row, 'id')), {
        title: field(cols, row, 'title'),
        isTrash: Number(field(cols, row, 'is_trash')),
      });
      return;
    case 'vic_gf_form_meta': {
      const fid = Number(field(cols, row, 'form_id'));
      const dm = field(cols, row, 'display_meta');
      if (!dm) return;
      try {
        const j = JSON.parse(dm);
        formFields.set(
          fid,
          (j.fields ?? []).map((f) => ({
            id: String(f.id),
            label: f.adminLabel || f.label || `champ ${f.id}`,
            type: f.type,
            inputs: Array.isArray(f.inputs)
              ? f.inputs.map((inp) => ({ id: String(inp.id), label: inp.label ?? '' }))
              : null,
          })),
        );
      } catch {
        /* display_meta illisible : les meta_keys bruts serviront d'entêtes */
      }
      return;
    }
    case 'vic_gf_entry': {
      const id = Number(field(cols, row, 'id'));
      entries.set(id, {
        formId: Number(field(cols, row, 'form_id')),
        date: field(cols, row, 'date_created'),
        status: field(cols, row, 'status'),
        sourceUrl: field(cols, row, 'source_url'),
        ip: field(cols, row, 'ip'),
        values: new Map(),
      });
      return;
    }
    case 'vic_gf_entry_meta': {
      const eid = Number(field(cols, row, 'entry_id'));
      const e = entries.get(eid);
      // L'ordre du dump met vic_gf_entry avant vic_gf_entry_meta ; si jamais
      // une meta arrive orpheline, on la jette (pas d'entrée correspondante).
      if (!e) return;
      const key = field(cols, row, 'meta_key');
      // Metas techniques GF (is_read, workflow…) : seules les clés numériques
      // « 1 », « 1.3 »… sont des valeurs de champ saisies par le visiteur.
      if (!/^\d+(\.\d+)?$/.test(key)) return;
      e.values.set(key, field(cols, row, 'meta_value'));
      return;
    }
  }
}

// --- Parseur streaming (patron extract-sql.mjs) -------------------------------
const MARKER = 'INSERT INTO `';
let mode = 'scan';
let buf = '';
let table = null;
let cols = null;
let inTuple = false;
let inString = false;
let cur = '';
let row = [];
let curIsString = false;

function processValues(chunk) {
  for (let i = 0; i < chunk.length; i++) {
    const c = chunk[i];
    if (inString) {
      if (c === '\\') {
        const n = chunk[i + 1];
        if (n === undefined) { cur += '\\'; continue; }
        i++;
        cur += n === 'n' ? '\n' : n === 'r' ? '\r' : n === 't' ? '\t' : n === '0' ? '\0' : n;
      } else if (c === "'") {
        if (chunk[i + 1] === "'") { cur += "'"; i++; }
        else { inString = false; }
      } else cur += c;
      continue;
    }
    if (!inTuple) {
      if (c === '(') { inTuple = true; row = []; cur = ''; curIsString = false; }
      else if (c === ';') return i;
      continue;
    }
    if (c === "'") {
      if (!curIsString) cur = '';
      inString = true; curIsString = true;
    } else if (c === ',' || c === ')') {
      const v = cur.trim();
      row.push(curIsString ? cur : v === 'NULL' ? null : v);
      cur = ''; curIsString = false;
      if (c === ')') {
        inTuple = false;
        handleRow(table, cols, row);
        row = [];
      }
    } else cur += c;
  }
  return -1;
}

const stream = createReadStream(IN_FILE, { encoding: 'utf8', highWaterMark: 4 * 1024 * 1024 });

stream.on('data', (chunk) => {
  buf += chunk;
  let progress = true;
  while (progress) {
    progress = false;
    if (mode === 'scan') {
      const idx = buf.indexOf(MARKER);
      if (idx === -1) { buf = buf.slice(-MARKER.length); break; }
      buf = buf.slice(idx + MARKER.length);
      mode = 'header';
      progress = true;
    } else if (mode === 'header') {
      const vIdx = buf.indexOf('VALUES');
      if (vIdx === -1) { if (buf.length > 1e6) { mode = 'scan'; } break; }
      const header = buf.slice(0, vIdx);
      const tEnd = header.indexOf('`');
      table = header.slice(0, tEnd);
      cols = [...header.slice(tEnd + 1).matchAll(/`([^`]+)`/g)].map((m) => m[1]);
      buf = buf.slice(vIdx + 'VALUES'.length);
      if (TABLES.has(table)) {
        mode = 'values';
        inTuple = false; inString = false; cur = ''; row = [];
      } else {
        mode = 'scan';
      }
      progress = true;
    } else if (mode === 'values') {
      let toProcess = buf;
      let carry = '';
      const tb = toProcess.match(/\\+$/);
      if (tb && tb[0].length % 2 === 1) {
        carry = '\\';
        toProcess = toProcess.slice(0, -1);
      }
      const end = processValues(toProcess);
      if (end === -1) { buf = carry; break; }
      buf = toProcess.slice(end + 1) + carry;
      mode = 'scan';
      progress = true;
    }
  }
});

// --- Écriture CSV -------------------------------------------------------------
const csvCell = (v) => {
  const s = v == null ? '' : String(v).replace(/\r?\n/g, ' ');
  return /[",]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};
const slugify = (s) =>
  (s ?? 'sans-titre')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .toLowerCase()
    .slice(0, 60);

stream.on('end', () => {
  mkdirSync(OUT_DIR, { recursive: true });

  // Regrouper les entrées par formulaire
  const byForm = new Map();
  for (const [eid, e] of entries) {
    if (ONLY_FORM && String(e.formId) !== ONLY_FORM) continue;
    (byForm.get(e.formId) ?? byForm.set(e.formId, []).get(e.formId)).push({ id: eid, ...e });
  }

  const summary = [];
  for (const [fid, rows] of [...byForm.entries()].sort((a, b) => a[0] - b[0])) {
    const form = forms.get(fid) ?? { title: `formulaire ${fid}`, isTrash: 0 };
    const fields = formFields.get(fid) ?? [];

    // Colonnes de champ : l'union des meta_keys rencontrées, ordonnée par id
    // numérique (« 1.3 » entre « 1 » et « 2 »), libellée depuis display_meta.
    const keys = [...new Set(rows.flatMap((r) => [...r.values.keys()]))].sort(
      (a, b) => parseFloat(a) - parseFloat(b),
    );
    const labelOf = (key) => {
      for (const f of fields) {
        if (f.id === key) return f.label;
        const inp = f.inputs?.find((i) => i.id === key);
        if (inp) return inp.label ? `${f.label} — ${inp.label}` : f.label;
        // Cases à cocher : meta_key « 5.1 », « 5.2 »… absentes de inputs
        if (key.startsWith(`${f.id}.`)) return `${f.label} (${key})`;
      }
      return `champ ${key}`;
    };

    const header = ['id', 'date', 'statut', 'page source', ...keys.map(labelOf)];
    const lines = [header.map(csvCell).join(',')];
    for (const r of rows.sort((a, b) => (a.date < b.date ? -1 : 1))) {
      lines.push(
        [r.id, r.date, r.status, r.sourceUrl, ...keys.map((k) => r.values.get(k))]
          .map(csvCell)
          .join(','),
      );
    }

    const name = `form-${String(fid).padStart(2, '0')}-${slugify(form.title)}.csv`;
    // BOM UTF-8 : Excel ouvre les accents correctement en double-clic.
    writeFileSync(join(OUT_DIR, name), '\uFEFF' + lines.join('\r\n'), 'utf8');
    const actifs = rows.filter((r) => r.status === 'active').length;
    summary.push({ fid, title: form.title, total: rows.length, actifs, fichier: name });
  }

  console.log(`Entrées lues : ${entries.size} — formulaires avec entrées : ${byForm.size}`);
  for (const s of summary)
    console.log(
      `  #${s.fid} ${s.title} : ${s.total} entrées (${s.actifs} actives) → ${s.fichier}`,
    );
  console.log(`\nDossier de sortie (HORS dépôt — ne pas committer) : ${OUT_DIR}`);
  console.log('Rappel : dump du 2026-07-23 — refaire un export final au décommission.');
});
stream.on('error', (e) => { console.error(e); process.exit(1); });
