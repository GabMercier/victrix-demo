#!/usr/bin/env node
/**
 * parse-wxr.mjs — Parse les fichiers d'export WordPress (WXR XML) de victrix.ca
 * et produit un JSON consolidé de tous les items (pages, articles, expertises,
 * téléchargements, attachements, contenus Brizy) avec les champs utiles à la
 * migration : URLs, statuts, hiérarchie, langue Polylang, métas Yoast,
 * moteur de contenu détecté, shortcodes.
 *
 * Usage : node scripts/migration/parse-wxr.mjs --in <dossier-export> --out <fichier.json>
 */
import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const args = process.argv.slice(2);
const getArg = (name, def) => {
  const i = args.indexOf(name);
  return i >= 0 && args[i + 1] ? args[i + 1] : def;
};
const IN_DIR = getArg('--in', 'C:/Repo/Victrix/siteWP/export');
const OUT_FILE = getArg('--out', 'wxr-items.json');

// Clés de postmeta dont on conserve la valeur (courtes / utiles à l'inventaire)
const META_KEEP = new Set([
  '_yoast_wpseo_title',
  '_yoast_wpseo_metadesc',
  '_yoast_wpseo_meta-robots-noindex',
  '_yoast_wpseo_meta-robots-nofollow',
  '_yoast_wpseo_primary_category',
  '_yoast_wpseo_focuskw',
  '_thumbnail_id',
  '_wp_page_template',
  'cta_text',
  'cta_link',
  '_version',
  '_download_count',
  '_files',
]);
// Clés répétables → toujours en tableau
const META_MULTI = new Set(['_wp_old_slug', '_files']);
// Clés dont seule la présence compte (valeurs énormes)
const META_FLAGS = new Set([
  'panels_data',
  'brizy',
  'brizy-compiled-sections',
  'brizy_post_uid',
  'hefo_before',
  'hefo_after',
  '_post_authors',
]);

/** Dés-échappe les CDATA imbriqués du WXR ( ]]> écrit ]]]]><![CDATA[> ) */
const unescapeCdata = (s) => s.replaceAll(']]]]><![CDATA[>', ']]>');

const decodeEntities = (s) =>
  s
    .replaceAll('&lt;', '<')
    .replaceAll('&gt;', '>')
    .replaceAll('&quot;', '"')
    .replaceAll('&#039;', "'")
    .replaceAll('&amp;', '&');

/** Extrait le contenu d'une balise (CDATA ou texte brut), première occurrence. */
function tag(xml, name) {
  const re = new RegExp(`<${name}(?:\\s[^>]*)?>([\\s\\S]*?)</${name}>`);
  const m = xml.match(re);
  if (!m) return null;
  let v = m[1];
  const cd = v.match(/^\s*<!\[CDATA\[([\s\S]*)\]\]>\s*$/);
  return cd ? unescapeCdata(cd[1]) : decodeEntities(v.trim());
}

function parseCategories(itemXml) {
  const out = [];
  const re = /<category domain="([^"]+)" nicename="([^"]+)"><!\[CDATA\[([\s\S]*?)\]\]><\/category>/g;
  let m;
  while ((m = re.exec(itemXml))) out.push({ domain: m[1], nicename: m[2], name: unescapeCdata(m[3]) });
  return out;
}

function parsePostmeta(itemXml) {
  const meta = {};
  const flags = {};
  const re =
    /<wp:postmeta>\s*<wp:meta_key><!\[CDATA\[([\s\S]*?)\]\]><\/wp:meta_key>\s*<wp:meta_value><!\[CDATA\[([\s\S]*?)\]\]><\/wp:meta_value>\s*<\/wp:postmeta>/g;
  let m;
  while ((m = re.exec(itemXml))) {
    const key = m[1];
    const val = unescapeCdata(m[2]);
    if (META_FLAGS.has(key)) {
      flags[key] = (flags[key] ?? 0) + 1;
      if (key === 'brizy') flags.brizyEnabled = /"brizy-enabled";b:1|brizy_enabled/.test(val) || flags.brizyEnabled;
    } else if (META_MULTI.has(key)) {
      (meta[key] ??= []).push(val);
    } else if (META_KEEP.has(key)) {
      meta[key] = val;
    }
  }
  return { meta, flags };
}

function detectEngine(content, flags) {
  const c = content ?? '';
  const trimmed = c.trim();
  if (c.includes('brz-root__container') || (flags.brizy && !c.includes('panel-layout')))
    return 'brizy';
  if (flags.panels_data || c.includes('panel-layout')) return 'siteorigin';
  if (c.includes('<!-- wp:')) return 'gutenberg';
  if (trimmed.length === 0) return 'vide';
  if (/^(\[[^\]]+\]\s*)+$/.test(trimmed)) return 'shortcode-seul';
  return 'html';
}

function collectShortcodes(content) {
  const counts = {};
  const re = /\[([a-zA-Z][a-zA-Z0-9_-]*)(?=[\s\]=/])/g;
  let m;
  while ((m = re.exec(content ?? ''))) counts[m[1]] = (counts[m[1]] ?? 0) + 1;
  return counts;
}

function parseItem(itemXml, file) {
  const type = tag(itemXml, 'wp:post_type');
  const content = tag(itemXml, 'content:encoded') ?? '';
  const { meta, flags } = parsePostmeta(itemXml);
  const cats = parseCategories(itemXml);

  const langCat = cats.find((c) => c.domain === 'language');
  const link = tag(itemXml, 'link');
  const lang = langCat?.nicename ?? (link?.includes('/en/') ? 'en' : 'fr');

  const translations = {};
  const trCat = cats.find((c) => c.domain === 'post_translations');
  if (trCat) {
    // valeur sérialisée PHP incluse dans le CDATA du <category> ? Non : les IDs
    // sont dans la description sérialisée du terme, absente du WXR ; on garde le
    // nicename (pll_xxx) comme identifiant de groupe de traduction.
    translations.group = trCat.nicename;
  }

  const gfIds = [];
  let gm;
  // 1) shortcode [gravityform id="13"], y compris id=\&quot;13\&quot; dans le JSON de widgets
  const gfRe = /\[gravityform[^\]]*?id[^\d\]]{0,12}(\d+)/g;
  while ((gm = gfRe.exec(content))) gfIds.push(Number(gm[1]));
  // 2) widget SiteOrigin « formulaire » : &quot;form&quot;:&quot;1&quot;
  const gfWidgetRe = /&quot;form&quot;:&quot;(\d+)&quot;/g;
  while ((gm = gfWidgetRe.exec(content))) gfIds.push(Number(gm[1]));

  return {
    file,
    type,
    id: Number(tag(itemXml, 'wp:post_id')),
    title: tag(itemXml, 'title'),
    url: link,
    slug: tag(itemXml, 'wp:post_name'),
    status: tag(itemXml, 'wp:status'),
    password: tag(itemXml, 'wp:post_password') || null,
    parent: Number(tag(itemXml, 'wp:post_parent') ?? 0),
    menuOrder: Number(tag(itemXml, 'wp:menu_order') ?? 0),
    author: tag(itemXml, 'dc:creator'),
    date: tag(itemXml, 'wp:post_date'),
    lang,
    translationGroup: translations.group ?? null,
    categories: cats
      .filter((c) => c.domain === 'category')
      .map((c) => ({ slug: c.nicename, name: c.name })),
    attachmentUrl: tag(itemXml, 'wp:attachment_url'),
    meta,
    flags,
    engine: type === 'attachment' ? null : detectEngine(content, flags),
    contentLength: content.length,
    shortcodes: collectShortcodes(content),
    gravityFormIds: gfIds,
  };
}

// ---------------------------------------------------------------------------
const files = readdirSync(IN_DIR).filter((f) => f.endsWith('.xml'));
const items = [];
let channel = null;
const perFile = {};

for (const file of files) {
  const xml = readFileSync(join(IN_DIR, file), 'utf8');
  if (!channel) {
    channel = {
      title: tag(xml, 'title'),
      link: tag(xml, 'link'),
      language: tag(xml, 'language'),
      baseSiteUrl: tag(xml, 'wp:base_site_url'),
    };
  }
  const re = /<item>([\s\S]*?)<\/item>/g;
  let m;
  let count = 0;
  while ((m = re.exec(xml))) {
    items.push(parseItem(m[1], file));
    count++;
  }
  perFile[file] = count;
}

const byType = {};
for (const it of items) byType[it.type] = (byType[it.type] ?? 0) + 1;

const out = { channel, perFile, byType, generatedFrom: IN_DIR, items };
writeFileSync(OUT_FILE, JSON.stringify(out, null, 1), 'utf8');

console.log('Fichiers lus :', files.length);
console.log('Items par type :', JSON.stringify(byType, null, 2));
console.log('Écrit :', OUT_FILE, `(${items.length} items)`);
