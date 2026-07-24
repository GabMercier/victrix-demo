#!/usr/bin/env node
/**
 * extract-sql.mjs — Extraction ciblée du dump MySQL de victrix.ca (293 Mo)
 * SANS chargement complet : lecture en streaming + tokenizer de tuples SQL.
 *
 * Extrait : menus de navigation (terms/taxonomies/relations + posts
 * nav_menu_item + leurs postmeta), formulaires Gravity Forms (display_meta),
 * volumes d'entrées GF, redirections (plugin Redirection), options WordPress
 * clés, utilisateurs.
 *
 * Usage : node scripts/migration/extract-sql.mjs --in <dump.sql> --out <fichier.json>
 */
import { createReadStream, writeFileSync } from 'node:fs';

const args = process.argv.slice(2);
const getArg = (name, def) => {
  const i = args.indexOf(name);
  return i >= 0 && args[i + 1] ? args[i + 1] : def;
};
const IN_FILE = getArg('--in', 'C:/Repo/Victrix/siteWP/victrix_bdd.sql');
const OUT_FILE = getArg('--out', 'sql-extract.json');

const OPTION_KEEP = new Set([
  'active_plugins', 'permalink_structure', 'page_on_front', 'page_for_posts',
  'show_on_front', 'blogname', 'blogdescription', 'posts_per_page', 'WPLANG',
  'template', 'stylesheet', 'category_base', 'tag_base', 'custom_logo',
  'polylang', 'timezone_string',
]);

// Tables à parser (les autres sont sautées sans tokenisation)
const TABLES = new Set([
  'vic_posts', 'vic_postmeta', 'vic_terms', 'vic_term_taxonomy',
  'vic_term_relationships', 'vic_options', 'vic_gf_form', 'vic_gf_form_meta',
  'vic_gf_entry', 'vic_redirection_items', 'vic_redirection_groups', 'vic_users',
]);

// --- Résultats ---------------------------------------------------------------
const out = {
  options: {},
  terms: [],
  termTaxonomy: [],
  termRelationships: [],
  navMenuItems: [],
  menuItemMeta: {},
  gfForms: [],
  gfFormMeta: {},
  gfEntryCounts: {},
  redirectionItems: [],
  redirectionGroups: [],
  users: [],
  stats: { tuplesSeen: {}, tablesSeen: [] },
};

function field(cols, row, name) {
  const i = cols.indexOf(name);
  return i >= 0 ? row[i] : null;
}

function handleRow(table, cols, row) {
  out.stats.tuplesSeen[table] = (out.stats.tuplesSeen[table] ?? 0) + 1;
  switch (table) {
    case 'vic_posts': {
      if (field(cols, row, 'post_type') !== 'nav_menu_item') return;
      out.navMenuItems.push({
        id: Number(field(cols, row, 'ID')),
        title: field(cols, row, 'post_title'),
        menuOrder: Number(field(cols, row, 'menu_order')),
        status: field(cols, row, 'post_status'),
      });
      return;
    }
    case 'vic_postmeta': {
      const key = field(cols, row, 'meta_key');
      if (!key?.startsWith('_menu_item_')) return;
      const pid = Number(field(cols, row, 'post_id'));
      (out.menuItemMeta[pid] ??= {})[key] = field(cols, row, 'meta_value');
      return;
    }
    case 'vic_terms':
      out.terms.push({
        termId: Number(field(cols, row, 'term_id')),
        name: field(cols, row, 'name'),
        slug: field(cols, row, 'slug'),
      });
      return;
    case 'vic_term_taxonomy': {
      const tax = field(cols, row, 'taxonomy');
      if (!['nav_menu', 'language', 'post_translations', 'category'].includes(tax)) return;
      out.termTaxonomy.push({
        ttId: Number(field(cols, row, 'term_taxonomy_id')),
        termId: Number(field(cols, row, 'term_id')),
        taxonomy: tax,
        count: Number(field(cols, row, 'count')),
        description: field(cols, row, 'description'),
      });
      return;
    }
    case 'vic_term_relationships':
      out.termRelationships.push([
        Number(field(cols, row, 'object_id')),
        Number(field(cols, row, 'term_taxonomy_id')),
      ]);
      return;
    case 'vic_options': {
      const name = field(cols, row, 'option_name');
      if (OPTION_KEEP.has(name) || name?.startsWith('theme_mods_'))
        out.options[name] = field(cols, row, 'option_value');
      return;
    }
    case 'vic_gf_form':
      out.gfForms.push({
        id: Number(field(cols, row, 'id')),
        title: field(cols, row, 'title'),
        isActive: Number(field(cols, row, 'is_active')),
        isTrash: Number(field(cols, row, 'is_trash')),
      });
      return;
    case 'vic_gf_form_meta': {
      const fid = Number(field(cols, row, 'form_id'));
      const dm = field(cols, row, 'display_meta');
      if (!dm) return;
      try {
        const j = JSON.parse(dm);
        out.gfFormMeta[fid] = {
          title: j.title,
          description: j.description ?? '',
          fields: (j.fields ?? []).map((f) => ({
            type: f.type,
            label: f.label,
            required: !!f.isRequired,
          })),
        };
      } catch {
        const labels = [...dm.matchAll(/"label":"((?:[^"\\]|\\.)*)"/g)].map((m) => m[1]);
        out.gfFormMeta[fid] = { title: null, fields: labels.map((l) => ({ label: l })) };
      }
      return;
    }
    case 'vic_gf_entry': {
      const fid = Number(field(cols, row, 'form_id'));
      out.gfEntryCounts[fid] = (out.gfEntryCounts[fid] ?? 0) + 1;
      return;
    }
    case 'vic_redirection_items':
      out.redirectionItems.push({
        id: Number(field(cols, row, 'id')),
        url: field(cols, row, 'url'),
        actionData: field(cols, row, 'action_data'),
        actionCode: Number(field(cols, row, 'action_code')),
        actionType: field(cols, row, 'action_type'),
        matchType: field(cols, row, 'match_type'),
        regex: Number(field(cols, row, 'regex')),
        groupId: Number(field(cols, row, 'group_id')),
        status: field(cols, row, 'status'),
        title: field(cols, row, 'title'),
        lastCount: Number(field(cols, row, 'last_count')),
      });
      return;
    case 'vic_redirection_groups':
      out.redirectionGroups.push({
        id: Number(field(cols, row, 'id')),
        name: field(cols, row, 'name'),
        status: field(cols, row, 'status'),
      });
      return;
    case 'vic_users':
      out.users.push({
        id: Number(field(cols, row, 'ID')),
        login: field(cols, row, 'user_login'),
        displayName: field(cols, row, 'display_name'),
        email: field(cols, row, 'user_email'),
      });
      return;
  }
}

// --- Parseur streaming --------------------------------------------------------
const MARKER = 'INSERT INTO `';

let mode = 'scan'; // scan | header | values
let buf = '';
let table = null;
let cols = null;
let keepTable = false;

// état du tokenizer de tuples
let inTuple = false;
let inString = false;
let cur = '';
let row = [];
let curIsString = false;

function processValues(chunk) {
  // Tokenise chunk caractère par caractère ; retourne l'index où le statement
  // se termine (après ';') ou -1 si le chunk est entièrement consommé.
  for (let i = 0; i < chunk.length; i++) {
    const c = chunk[i];
    if (inString) {
      if (c === '\\') {
        const n = chunk[i + 1];
        if (n === undefined) { cur += '\\'; continue; } // coupe de chunk sur l'échappement : rare, géré par carry
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
    // dans un tuple, hors chaîne
    if (c === "'") {
      if (!curIsString) cur = ''; // purge l'espace séparateur avalé avant l'ouverture
      inString = true; curIsString = true;
    }
    else if (c === ',' || c === ')') {
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
      keepTable = TABLES.has(table);
      if (keepTable && !out.stats.tablesSeen.includes(table)) out.stats.tablesSeen.push(table);
      buf = buf.slice(vIdx + 'VALUES'.length);
      if (keepTable) {
        mode = 'values';
        inTuple = false; inString = false; cur = ''; row = [];
      } else {
        mode = 'scan';
      }
      progress = true;
    } else if (mode === 'values') {
      // Si le chunk se termine par un nombre IMPAIR de backslashes, le dernier
      // est un échappement incomplet : on le retient pour le prochain chunk.
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

stream.on('end', () => {
  writeFileSync(OUT_FILE, JSON.stringify(out, null, 1), 'utf8');
  console.log('Tables parsées :', out.stats.tablesSeen.join(', '));
  console.log('Tuples par table :', JSON.stringify(out.stats.tuplesSeen));
  console.log('Menus items:', out.navMenuItems.length, '| metas item:', Object.keys(out.menuItemMeta).length,
    '| GF forms:', out.gfForms.length, '| redirections:', out.redirectionItems.length,
    '| users:', out.users.length, '| options:', Object.keys(out.options).length);
  console.log('Écrit :', OUT_FILE);
});
stream.on('error', (e) => { console.error(e); process.exit(1); });
