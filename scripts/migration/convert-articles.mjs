#!/usr/bin/env node
/**
 * convert-articles.mjs — Convertit les 64 articles WordPress (WXR) en fichiers
 * Markdown prêts pour la collection `blog`, dans une ZONE DE STAGING (revue
 * humaine avant tout branchement — voir plan-convergence-migration.md Phase 6).
 *
 * Usage :
 *   node scripts/migration/convert-articles.mjs
 *     [--in C:/Repo/Victrix/siteWP/export]
 *     [--out docs/migration/staging/blog]
 *
 * Ce que fait le script (machine-fidèle, rejouable, idempotent) :
 *  - re-parse les WXR (mêmes helpers que parse-wxr.mjs) en CONSERVANT le
 *    content:encoded des `post` + la carte des attachements (id → URL);
 *  - déshabille le squelette SiteOrigin : ne garde que les blocs
 *    `siteorigin-widget-tinymce textwidget` (le vrai contenu, dans l'ordre) —
 *    tout autre widget est signalé au rapport;
 *  - convertit le HTML d'éditeur classique en Markdown (paragraphes wpautop,
 *    h2–h6, listes, liens, images, gras/italique, blockquote); les iframes
 *    (vidéos) deviennent des liens — la CSP du site ne permet pas frame-src;
 *  - réécrit les URLs internes en chemins relatifs SANS domaine, tels quels
 *    (structure FR à la racine = décision du 24/07, alignée sur WordPress);
 *    les images perdent leur suffixe de taille WP (-300x300 → original);
 *  - apparie FR/EN par groupe Polylang : MÊME nom de fichier dans fr/ et en/
 *    (= convention du dépôt), slug d'URL par langue dans le frontmatter
 *    (champ `slug` par locale, déjà supporté par la collection blog);
 *  - frontmatter : title, date, excerpt (metadesc Yoast, sinon 1er paragraphe),
 *    tags (catégories WP sans la catégorie technique de langue), slug, draft,
 *    + champs DE TRANSITION à trancher au branchement (coverImage en chemin
 *    public, seoTitle Yoast, author, wpUrl) — la collection ne les valide pas
 *    encore, c'est voulu : le staging n'est pas branché;
 *  - écrit docs/migration/staging/blog/rapport-articles.md : comptes, paires,
 *    brouillons, sans-traduction, médias référencés, iframes, widgets ignorés.
 */
import { mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const args = process.argv.slice(2);
const getArg = (name, def) => {
  const i = args.indexOf(name);
  return i >= 0 && args[i + 1] ? args[i + 1] : def;
};
const IN_DIR = getArg('--in', 'C:/Repo/Victrix/siteWP/export');
const OUT_DIR = getArg('--out', 'docs/migration/staging/blog');

// --- Helpers WXR (copie volontaire de parse-wxr.mjs — scripts autonomes) ----
const unescapeCdata = (s) => s.replaceAll(']]]]><![CDATA[>', ']]>');
function tag(xml, name) {
  const re = new RegExp(`<${name}(?:\\s[^>]*)?>([\\s\\S]*?)</${name}>`);
  const m = xml.match(re);
  if (!m) return null;
  const v = m[1];
  const cd = v.match(/^\s*<!\[CDATA\[([\s\S]*)\]\]>\s*$/);
  return cd ? unescapeCdata(cd[1]) : decodeEntities(v.trim());
}
function decodeEntities(s) {
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
function parseCategories(itemXml) {
  const out = [];
  const re = /<category domain="([^"]+)" nicename="([^"]+)"><!\[CDATA\[([\s\S]*?)\]\]><\/category>/g;
  let m;
  while ((m = re.exec(itemXml))) out.push({ domain: m[1], nicename: m[2], name: unescapeCdata(m[3]) });
  return out;
}
function metaValue(itemXml, key) {
  const re = new RegExp(
    `<wp:postmeta>\\s*<wp:meta_key><!\\[CDATA\\[${key}\\]\\]></wp:meta_key>\\s*<wp:meta_value><!\\[CDATA\\[([\\s\\S]*?)\\]\\]></wp:meta_value>\\s*</wp:postmeta>`,
  );
  const m = itemXml.match(re);
  return m ? unescapeCdata(m[1]) : null;
}

// --- Extraction du contenu utile (déshabillage SiteOrigin) ------------------
/**
 * Retourne les blocs de contenu dans l'ordre du document. Un « bloc » est le
 * HTML intérieur d'un widget éditeur SiteOrigin; si la page n'est pas
 * SiteOrigin (1 article « html »), le contenu entier est un seul bloc.
 * Les widgets non-éditeur rencontrés sont listés pour le rapport.
 */
function extractBlocks(content, warn) {
  if (!content.includes('panel-layout')) return [content];
  const blocks = [];
  const marker = 'siteorigin-widget-tinymce textwidget';
  // Widgets non-éditeur : signalés (sow-image, sow-button, sow-video…)
  const soRe = /class="so-widget-(sow-[a-z-]+?)\s/g;
  let sm;
  while ((sm = soRe.exec(content))) {
    if (sm[1] !== 'sow-editor') warn(`widget SiteOrigin non-éditeur ignoré : ${sm[1]}`);
  }
  let i = 0;
  while ((i = content.indexOf(marker, i)) !== -1) {
    const start = content.indexOf('>', i) + 1;
    // Équilibrage des <div> pour trouver la fermeture du bloc (le contenu
    // d'éditeur peut lui-même contenir des div).
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

// --- Réécriture d'URLs ------------------------------------------------------
const SITE = /^https?:\/\/(www\.)?victrix\.ca/;
const mediaRefs = new Set();
function rewriteUrl(url, { image = false } = {}) {
  let u = url;
  if (SITE.test(u)) u = u.replace(SITE, '') || '/';
  if (image) {
    // -768x432.png → .png : viser l'original (les 943 médias inventoriés sont
    // les originaux; les variantes sont des dérivés WordPress).
    u = u.replace(/-\d{2,4}x\d{2,4}(\.[a-z]{3,4})$/i, '$1');
    if (u.startsWith('/wp-content/')) mediaRefs.add(u);
  }
  return u;
}

// --- HTML (éditeur classique) → Markdown ------------------------------------
function inlineToMd(html, warn) {
  let s = html;
  s = s.replace(/<img\b[^>]*>/gi, (tagHtml) => {
    const src = tagHtml.match(/src="([^"]+)"/i)?.[1];
    if (!src) return '';
    const alt = tagHtml.match(/alt="([^"]*)"/i)?.[1] ?? '';
    return `![${decodeEntities(alt)}](${rewriteUrl(src, { image: true })})`;
  });
  s = s.replace(/<iframe\b[^>]*>[\s\S]*?<\/iframe>/gi, (tagHtml) => {
    const src = tagHtml.match(/src="([^"]+)"/i)?.[1];
    warn(`iframe converti en lien : ${src ?? '(sans src)'}`);
    return src ? `[Voir la vidéo](${src})` : '';
  });
  s = s.replace(/<a\b[^>]*>([\s\S]*?)<\/a>/gi, (tagHtml, text) => {
    const href = tagHtml.match(/href="([^"]+)"/i)?.[1];
    const inner = inlineToMd(text, warn).trim();
    if (!href) return inner;
    return `[${inner}](${rewriteUrl(href)})`;
  });
  s = s.replace(/<(strong|b)\b[^>]*>([\s\S]*?)<\/\1>/gi, (_, _t, x) => `**${x.trim()}**`);
  s = s.replace(/<(em|i)\b[^>]*>([\s\S]*?)<\/\1>/gi, (_, _t, x) => `*${x.trim()}*`);
  s = s.replace(/<br\s*\/?>/gi, '\n');
  s = s.replace(/<span\b[^>]*>([\s\S]*?)<\/span>/gi, '$1'); // couleurs inline → texte nu
  s = s.replace(/<\/?(u|sup|sub|small|font|div|p)\b[^>]*>/gi, ' ');
  s = s.replace(/<[^>]+>/g, (t) => {
    warn(`balise inattendue retirée : ${t.slice(0, 40)}`);
    return ' ';
  });
  return decodeEntities(s).replace(/[ \t]+/g, ' ');
}
function listToMd(html, ordered, warn, indent = '') {
  // Découpage ÉQUILIBRÉ des <li> (une regex non-gourmande casse dès qu'un item
  // contient une sous-liste : le </li> interne ferme l'item trop tôt).
  const items = [];
  const openLi = /<li\b[^>]*>/gi;
  let consumed = 0;
  let n = 0;
  let m;
  while ((m = openLi.exec(html))) {
    if (m.index < consumed) continue; // <li> interne d'un item déjà consommé
    const start = m.index + m[0].length;
    const end = balancedEnd(html, 'li', start);
    let body = html.slice(start, end).replace(/<\/li>\s*$/i, '');
    consumed = end;
    n++;
    // Sous-listes : extraites (balayage équilibré aussi) puis indentées sous l'item.
    let sub = '';
    const openSub = /<(ul|ol)\b[^>]*>/gi;
    let cut = 0;
    let stripped = '';
    let sm;
    while ((sm = openSub.exec(body))) {
      if (sm.index < cut) continue;
      const sStart = sm.index + sm[0].length;
      const sEnd = balancedEnd(body, sm[1], sStart);
      const inner = body.slice(sStart, sEnd).replace(new RegExp(`</${sm[1]}>\\s*$`, 'i'), '');
      sub += `\n${listToMd(inner, sm[1].toLowerCase() === 'ol', warn, indent + '  ')}`;
      stripped += body.slice(cut, sm.index);
      cut = sEnd;
    }
    stripped += body.slice(cut);
    const bullet = ordered ? `${n}.` : '-';
    items.push(`${indent}${bullet} ${inlineToMd(stripped, warn).trim()}${sub}`);
  }
  return items.join('\n');
}
/**
 * Trouve la fin ÉQUILIBRÉE d'un élément (gère <ul> dans <ul>, <table> dans
 * <table>…) — la regex non-gourmande s'arrêtait à la première fermeture et
 * laissait des <li> orphelins sur les listes imbriquées.
 */
function balancedEnd(html, name, openEnd) {
  const re = new RegExp(`<${name}\\b|</${name}>`, 'gi');
  re.lastIndex = openEnd;
  let depth = 1;
  let m;
  while (depth > 0 && (m = re.exec(html))) {
    depth += m[0].startsWith('</') ? -1 : 1;
  }
  return m ? m.index + m[0].length : html.length;
}
function blockToMd(html, warn) {
  const out = [];
  // Découpe en éléments de bloc; le texte hors balise de bloc suit la règle
  // wpautop : les doubles sauts de ligne séparent les paragraphes.
  const openRe = /<(h[1-6]|ul|ol|blockquote|table|li)\b[^>]*>/gi;
  let last = 0;
  const flush = (txt) => {
    for (const para of txt.split(/\n\s*\n/)) {
      const t = inlineToMd(para, warn).trim();
      if (t) out.push(t);
    }
  };
  let m;
  while ((m = openRe.exec(html))) {
    if (m.index < last) continue; // balise interne d'un bloc déjà consommé
    flush(html.slice(last, m.index));
    const name = m[1].toLowerCase();
    if (name === 'li') {
      // <li> orphelins : dans certains widgets SiteOrigin le <ul> englobant
      // reste dans l'habillage (hors bloc extrait). On consomme la suite de
      // <li> consécutifs et on la reconstruit en liste à puces.
      warn('liste <li> sans <ul> englobant — reconstruite en liste à puces');
      let runEnd = balancedEnd(html, 'li', m.index + m[0].length);
      let nm;
      while ((nm = /^\s*<li\b[^>]*>/i.exec(html.slice(runEnd)))) {
        runEnd = balancedEnd(html, 'li', runEnd + nm[0].length);
      }
      out.push(listToMd(html.slice(m.index, runEnd), false, warn));
      last = runEnd;
      continue;
    }
    const end = balancedEnd(html, name, m.index + m[0].length);
    const el = html.slice(m.index, end);
    const inner = el.replace(/^<[^>]+>/, '').replace(/<\/[^>]+>$/, '');
    if (name.startsWith('h')) {
      const level = Number(name[1]);
      out.push(`${'#'.repeat(Math.max(2, level))} ${inlineToMd(inner, warn).trim()}`);
    } else if (name === 'ul' || name === 'ol') {
      out.push(listToMd(inner, name === 'ol', warn));
    } else if (name === 'blockquote') {
      out.push(
        blockToMd(inner, warn)
          .split('\n')
          .map((l) => `> ${l}`)
          .join('\n'),
      );
    } else {
      warn('table HTML conservée telle quelle (à vérifier au rendu)');
      out.push(el);
    }
    last = end;
  }
  flush(html.slice(last));
  return out.join('\n\n');
}

/** Slug de repli pour les brouillons (post_name vide chez WordPress). */
function slugify(title) {
  return (title ?? 'sans-titre')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60);
}

// --- Lecture des WXR --------------------------------------------------------
const posts = [];
const attachments = new Map(); // id → url
for (const file of readdirSync(IN_DIR).filter((f) => f.endsWith('.xml'))) {
  const xml = readFileSync(join(IN_DIR, file), 'utf8');
  const re = /<item>([\s\S]*?)<\/item>/g;
  let m;
  while ((m = re.exec(xml))) {
    const item = m[1];
    const type = tag(item, 'wp:post_type');
    if (type === 'attachment') {
      const id = Number(tag(item, 'wp:post_id'));
      const url = tag(item, 'wp:attachment_url');
      if (id && url) attachments.set(id, url);
      continue;
    }
    if (type !== 'post') continue;
    const cats = parseCategories(item);
    const status = tag(item, 'wp:status');
    if (status === 'trash') continue;
    posts.push({
      id: Number(tag(item, 'wp:post_id')),
      title: tag(item, 'title'),
      slug: tag(item, 'wp:post_name') || slugify(tag(item, 'title')),
      url: tag(item, 'link'),
      status,
      date: (tag(item, 'wp:post_date') ?? '').slice(0, 10),
      author: tag(item, 'dc:creator'),
      lang: cats.find((c) => c.domain === 'language')?.nicename ?? 'fr',
      group: cats.find((c) => c.domain === 'post_translations')?.nicename ?? null,
      categories: cats.filter((c) => c.domain === 'category').map((c) => c.name),
      content: tag(item, 'content:encoded') ?? '',
      seoTitle: metaValue(item, '_yoast_wpseo_title'),
      seoDesc: metaValue(item, '_yoast_wpseo_metadesc'),
      noindex: metaValue(item, '_yoast_wpseo_meta-robots-noindex') === '1',
      thumbId: Number(metaValue(item, '_thumbnail_id') ?? 0),
    });
  }
}

// --- Appariement FR/EN par groupe Polylang ----------------------------------
// Nom de fichier commun = slug FR (convention du dépôt : homonymes fr/ et en/).
const byGroup = new Map();
for (const p of posts) {
  const key = p.group ?? `solo-${p.id}`;
  (byGroup.get(key) ?? byGroup.set(key, []).get(key)).push(p);
}

// --- Écriture ---------------------------------------------------------------
mkdirSync(join(OUT_DIR, 'fr'), { recursive: true });
mkdirSync(join(OUT_DIR, 'en'), { recursive: true });

const report = {
  written: [],
  drafts: [],
  untranslated: [],
  warnings: new Map(), // slug → [messages]
  videos: [],
};
const yamlStr = (s) => `"${String(s ?? '').replaceAll('\\', '\\\\').replaceAll('"', '\\"')}"`;

let filesWritten = 0;
for (const groupPosts of byGroup.values()) {
  const fr = groupPosts.find((p) => p.lang === 'fr');
  const en = groupPosts.find((p) => p.lang === 'en');
  const fileBase = (fr ?? en).slug; // slug FR si présent, sinon EN (asymétrie signalée)
  if (!fr || !en) {
    report.untranslated.push(`${(fr ?? en).lang}/${(fr ?? en).slug}`);
  }
  for (const post of groupPosts) {
    const warnings = [];
    const warn = (msg) => warnings.push(msg);
    const blocks = extractBlocks(post.content, warn);
    const body = blocks
      .map((b) => blockToMd(b, warn))
      .filter(Boolean)
      .join('\n\n');
    const excerpt =
      post.seoDesc ??
      body
        .split('\n')
        .find((l) => l && !l.startsWith('#') && !l.startsWith('!'))
        ?.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
        .slice(0, 160) ??
      '';
    const cover = post.thumbId && attachments.get(post.thumbId);
    const isDraft = post.status !== 'publish';
    if (isDraft) report.drafts.push(`${post.lang}/${post.slug}`);
    if (post.categories.some((c) => /vidéo|video/i.test(c))) report.videos.push(`${post.lang}/${post.slug}`);

    const fm = [
      '---',
      `title: ${yamlStr(post.title)}`,
      `date: ${post.date}`,
      `excerpt: ${yamlStr(excerpt)}`,
      `tags: [${post.categories.map(yamlStr).join(', ')}]`,
      `slug: ${yamlStr(post.slug)}`,
      ...(isDraft ? ['draft: true'] : []),
      '# --- Champs de transition (à trancher au branchement — Phase 6) ---',
      ...(cover ? [`coverImage: ${yamlStr(rewriteUrl(cover, { image: true }))}`] : []),
      ...(post.seoTitle ? [`seoTitle: ${yamlStr(post.seoTitle)}`] : []),
      ...(post.noindex ? ['noindex: true'] : []),
      `author: ${yamlStr(post.author)}`,
      `wpUrl: ${yamlStr(rewriteUrl(post.url ?? ''))}`,
      '---',
      '',
    ].join('\n');

    writeFileSync(join(OUT_DIR, post.lang, `${fileBase}.md`), fm + body + '\n', 'utf8');
    filesWritten++;
    report.written.push(`${post.lang}/${fileBase}.md (${post.slug})`);
    if (warnings.length) report.warnings.set(`${post.lang}/${post.slug}`, warnings);
  }
}

// --- Rapport ----------------------------------------------------------------
const lines = [
  '# Rapport de conversion — articles WordPress → staging blog',
  '',
  `> Généré par \`scripts/migration/convert-articles.mjs\` — rejouable. Sortie : \`${OUT_DIR}/{fr,en}/\`.`,
  '> ⚠️ ZONE DE STAGING : rien n\'est branché dans les collections. Revue humaine requise',
  '> (questions §16 de l\'inventaire : brouillons Q1, sans-traduction Q2) avant le port vers `src/content/blog/`.',
  '',
  `- Articles convertis : **${filesWritten}** fichiers (${posts.length} posts source).`,
  `- Paires de traduction : ${[...byGroup.values()].filter((g) => g.length === 2).length} · sans traduction : ${report.untranslated.length} (${report.untranslated.join(', ') || '—'})`,
  `- Brouillons (décision Q1) : ${report.drafts.length} (${report.drafts.join(', ') || '—'})`,
  `- Articles « vidéos » (iframes → liens, CSP sans frame-src) : ${report.videos.length} (${report.videos.join(', ') || '—'})`,
  `- Médias référencés (originaux, chemins /wp-content/ conservés) : **${mediaRefs.size}** — à rapatrier avec l'arborescence (décision Phase 6).`,
  '',
  '## Avertissements par article',
  '',
  ...(report.warnings.size === 0
    ? ['Aucun.']
    : [...report.warnings.entries()].map(([slug, ws]) => {
        const counts = new Map();
        for (const w of ws) counts.set(w, (counts.get(w) ?? 0) + 1);
        return `- **${slug}** : ${[...counts.entries()].map(([w, n]) => (n > 1 ? `${w} ×${n}` : w)).join(' · ')}`;
      })),
  '',
  '## Médias référencés',
  '',
  ...[...mediaRefs].sort().map((u) => `- ${u}`),
  '',
].join('\n');
writeFileSync(join(OUT_DIR, 'rapport-articles.md'), lines, 'utf8');

console.log(`Articles : ${posts.length} · fichiers écrits : ${filesWritten} (fr+en)`);
console.log(`Sans traduction : ${report.untranslated.length} · brouillons : ${report.drafts.length}`);
console.log(`Médias référencés : ${mediaRefs.size}`);
console.log(`Rapport : ${join(OUT_DIR, 'rapport-articles.md')}`);
