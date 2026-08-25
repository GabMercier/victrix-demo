/**
 * lib-wxr.mjs — Helpers PARTAGÉS des convertisseurs de contenu WordPress
 * (WXR → staging). Extraits de convert-articles.mjs quand convert-expertises
 * est arrivé (2026-07-29); les leçons durement acquises vivent ici :
 *
 *  - balancedEnd : TOUT balisage imbriqué (ul dans ul, li dans li, div de
 *    widgets) casse une regex non-gourmande — balayer en ÉQUILIBRANT les
 *    ouvertures/fermetures, jamais `[\s\S]*?</tag>`.
 *  - extractBlocks : les contenus SiteOrigin gardent le vrai contenu dans les
 *    blocs `siteorigin-widget-tinymce textwidget`; le reste est de l'habillage.
 *    Certains widgets gardent même le <ul> DANS l'habillage (li orphelins —
 *    géré par les convertisseurs).
 *  - makeUrlRewriter : URLs internes relativisées (structure FR à la racine,
 *    décision 24/07), variantes d'images WordPress (-WxH) ramenées à
 *    l'original, chemins /wp-content/ conservés et COLLECTÉS pour le
 *    rapatriement des médias.
 */
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

export const unescapeCdata = (s) => s.replaceAll(']]]]><![CDATA[>', ']]>');

export function decodeEntities(s) {
  return s
    .replaceAll('&nbsp;', ' ')
    .replaceAll('&#8217;', '’')
    .replaceAll('&#8216;', '‘')
    .replaceAll('&#8220;', '“')
    .replaceAll('&#8221;', '”')
    .replaceAll('&#8211;', '–')
    .replaceAll('&#8212;', '—')
    .replaceAll('&#8230;', '…')
    .replaceAll('&#038;', '&')
    .replaceAll('&#039;', "'")
    .replaceAll('&lt;', '<')
    .replaceAll('&gt;', '>')
    .replaceAll('&quot;', '"')
    .replaceAll('&amp;', '&');
}

/** Extrait le contenu d'une balise (CDATA ou texte), première occurrence. */
export function tag(xml, name) {
  const re = new RegExp(`<${name}(?:\\s[^>]*)?>([\\s\\S]*?)</${name}>`);
  const m = xml.match(re);
  if (!m) return null;
  const v = m[1];
  const cd = v.match(/^\s*<!\[CDATA\[([\s\S]*)\]\]>\s*$/);
  return cd ? unescapeCdata(cd[1]) : decodeEntities(v.trim());
}

export function parseCategories(itemXml) {
  const out = [];
  const re = /<category domain="([^"]+)" nicename="([^"]+)"><!\[CDATA\[([\s\S]*?)\]\]><\/category>/g;
  let m;
  while ((m = re.exec(itemXml))) out.push({ domain: m[1], nicename: m[2], name: unescapeCdata(m[3]) });
  return out;
}

export function metaValue(itemXml, key) {
  const re = new RegExp(
    `<wp:postmeta>\\s*<wp:meta_key><!\\[CDATA\\[${key}\\]\\]></wp:meta_key>\\s*<wp:meta_value><!\\[CDATA\\[([\\s\\S]*?)\\]\\]></wp:meta_value>\\s*</wp:postmeta>`,
  );
  const m = itemXml.match(re);
  return m ? unescapeCdata(m[1]) : null;
}

/** Fin ÉQUILIBRÉE d'un élément ouvert juste avant `openEnd` (imbrication OK). */
export function balancedEnd(html, name, openEnd) {
  const re = new RegExp(`<${name}\\b|</${name}>`, 'gi');
  re.lastIndex = openEnd;
  let depth = 1;
  let m;
  while (depth > 0 && (m = re.exec(html))) {
    depth += m[0].startsWith('</') ? -1 : 1;
  }
  return m ? m.index + m[0].length : html.length;
}

/**
 * Blocs de contenu utile d'une page SiteOrigin (widgets éditeur, dans
 * l'ordre); contenu non-SiteOrigin → un seul bloc. Widgets non-éditeur
 * signalés via warn().
 */
export function extractBlocks(content, warn) {
  if (!content.includes('panel-layout')) return [content];
  const blocks = [];
  const marker = 'siteorigin-widget-tinymce textwidget';
  const soRe = /class="so-widget-(sow-[a-z-]+?)\s/g;
  let sm;
  while ((sm = soRe.exec(content))) {
    if (sm[1] !== 'sow-editor') warn(`widget SiteOrigin non-éditeur ignoré : ${sm[1]}`);
  }
  let i = 0;
  while ((i = content.indexOf(marker, i)) !== -1) {
    const start = content.indexOf('>', i) + 1;
    let depth = 1;
    let j = start;
    const re = /<div[\s>]|<\/div>/g;
    re.lastIndex = start;
    let m;
    while (depth > 0 && (m = re.exec(content))) {
      depth += m[0].startsWith('</') ? -1 : 1;
      j = m.index;
    }
    blocks.push(content.slice(start, j));
    i = j;
  }
  return blocks;
}

const SITE = /^https?:\/\/(www\.)?victrix\.ca/;

/** Réécriture d'URLs + collecte des médias référencés (un jeu par exécution). */
export function makeUrlRewriter() {
  const mediaRefs = new Set();
  const rewriteUrl = (url, { image = false } = {}) => {
    let u = url;
    if (SITE.test(u)) u = u.replace(SITE, '') || '/';
    if (image) {
      u = u.replace(/-\d{2,4}x\d{2,4}(\.[a-z]{3,4})$/i, '$1');
      if (u.startsWith('/wp-content/')) mediaRefs.add(u);
    }
    return u;
  };
  return { rewriteUrl, mediaRefs };
}

/** Slug de repli (brouillons WordPress sans post_name). */
export function slugify(title) {
  return (title ?? 'sans-titre')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60);
}

/** Itère chaque <item> de chaque WXR du dossier : cb(itemXml, fichier). */
export function forEachItem(inDir, cb) {
  for (const file of readdirSync(inDir).filter((f) => f.endsWith('.xml'))) {
    const xml = readFileSync(join(inDir, file), 'utf8');
    const re = /<item>([\s\S]*?)<\/item>/g;
    let m;
    while ((m = re.exec(xml))) cb(m[1], file);
  }
}

/** Carte des attachements (id → URL) — image à la une des contenus. */
export function collectAttachments(inDir) {
  const attachments = new Map();
  forEachItem(inDir, (item) => {
    if (tag(item, 'wp:post_type') !== 'attachment') return;
    const id = Number(tag(item, 'wp:post_id'));
    const url = tag(item, 'wp:attachment_url');
    if (id && url) attachments.set(id, url);
  });
  return attachments;
}
