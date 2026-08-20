#!/usr/bin/env node
/**
 * convert-legal-pages.mjs — Porte les pages légales de l'ancien site
 * (export WXR) vers la collection `pages` du nouveau site :
 *
 *   politique-de-confidentialite → src/content/pages/fr/politique-confidentialite.json
 *   privacy-policy               → src/content/pages/en/politique-confidentialite.json
 *   conditions-dutilisation      → src/content/pages/fr/conditions-utilisation.json
 *   terms-of-use                 → src/content/pages/en/conditions-utilisation.json
 *
 * Contenu source propre (Gutenberg/HTML : h1 titre + sections h2 + p/ul).
 * Conversion : une section `rich-text` par <h2> (titre = texte du h2,
 * paragraphes = <p> nettoyés, inline <a>/<strong>/<em> conservés ; <ul> →
 * un paragraphe « • item<br>• item »). Le JSON existant garde son héros et
 * son CTA final — seul le corps est remplacé. `noindex` reste à true :
 * l'équipe le bascule au CMS après validation juridique.
 *
 * Usage : node scripts/migration/convert-legal-pages.mjs [--in <dossier-export>]
 */
import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const args = process.argv.slice(2);
const getArg = (name, def) => {
  const i = args.indexOf(name);
  return i >= 0 && args[i + 1] ? args[i + 1] : def;
};
const IN_DIR = getArg('--in', 'C:/Repo/Victrix/siteWP/export');

const PAGES = [
  { slug: 'politique-de-confidentialite', lang: 'fr', file: 'src/content/pages/fr/politique-confidentialite.json' },
  { slug: 'privacy-policy', lang: 'en', file: 'src/content/pages/en/politique-confidentialite.json' },
  { slug: 'conditions-dutilisation', lang: 'fr', file: 'src/content/pages/fr/conditions-utilisation.json' },
  { slug: 'terms-of-use', lang: 'en', file: 'src/content/pages/en/conditions-utilisation.json' },
];

// --- 1. Récupérer content:encoded des 4 pages dans l'export -------------------
const wanted = new Map(PAGES.map((p) => [p.slug, p]));
const contents = new Map(); // slug → html
for (const f of readdirSync(IN_DIR)) {
  if (!f.endsWith('.xml')) continue;
  const xml = readFileSync(join(IN_DIR, f), 'utf8');
  let idx = 0;
  while ((idx = xml.indexOf('<item>', idx)) !== -1) {
    const end = xml.indexOf('</item>', idx);
    if (end === -1) break;
    const item = xml.slice(idx, end);
    idx = end + 7;
    const slug = item.match(/<wp:post_name><!\[CDATA\[(.*?)\]\]><\/wp:post_name>/)?.[1];
    const type = item.match(/<wp:post_type><!\[CDATA\[(.*?)\]\]><\/wp:post_type>/)?.[1];
    const status = item.match(/<wp:status><!\[CDATA\[(.*?)\]\]><\/wp:status>/)?.[1];
    if (type !== 'page' || status !== 'publish' || !wanted.has(slug) || contents.has(slug)) continue;
    const c = item.match(/<content:encoded><!\[CDATA\[([\s\S]*?)\]\]><\/content:encoded>/)?.[1];
    if (c) contents.set(slug, c);
  }
}

// --- 2. Nettoyage HTML --------------------------------------------------------
// Liens internes de l'ancien site → routes localisées du nouveau. Le domaine
// de préproduction victrix.ontest.net apparaît dans un href du texte source
// (fuite d'époque) — on le traite comme victrix.ca.
const SLUG_MAP = {
  'conditions-dutilisation': 'conditions-utilisation',
  'terms-of-use': 'conditions-utilisation',
  'politique-de-confidentialite': 'politique-confidentialite',
  'privacy-policy': 'politique-confidentialite',
  contact: 'contact',
  'en/contact': 'contact',
};
function rewriteHref(href, lang) {
  const m = href.match(/^https?:\/\/(?:www\.)?(?:victrix\.ca|victrix\.ontest\.net)\/(.*?)\/?$/);
  if (!m) return href;
  const path = m[1];
  if (path === '' || path === 'en') return `/${lang}/`;
  const slug = path.replace(/^en\//, '');
  return SLUG_MAP[slug] ? `/${lang}/${SLUG_MAP[slug]}` : href;
}

const cleanInline = (html, lang) =>
  html
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/<\/?span[^>]*>/g, '')
    .replace(/<a\s[^>]*href="([^"]*)"[^>]*>/g, (_, h) => `<a href="${rewriteHref(h, lang)}">`)
    .replace(/<(strong|em|b|i)\s[^>]*>/g, '<$1>')
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

const stripTags = (html) => cleanInline(html, 'fr').replace(/<[^>]*>/g, '').trim();

// --- 3. HTML → sections rich-text --------------------------------------------
function toSections(html, lang) {
  const body = html.replace(/<!--[\s\S]*?-->/g, '').replace(/<h1[^>]*>[\s\S]*?<\/h1>/, '');
  // Frontière de section = le plus HAUT niveau de titre présent : les pages
  // « politique » balisent leurs sections en <h2>, les « conditions » en <h3>
  // (aucun h2). L'avant-premier titre (ex. date d'entrée en vigueur) devient
  // une section sans titre.
  const lvl = /<h2[^>]*>/.test(body) ? '2' : '3';
  const parts = body.split(new RegExp(`<h${lvl}[^>]*>`));
  const closeTag = `</h${lvl}>`;
  const sections = [];
  for (let i = 0; i < parts.length; i++) {
    let title = '';
    let chunk = parts[i];
    if (i > 0) {
      const hEnd = chunk.indexOf(closeTag);
      title = stripTags(chunk.slice(0, hEnd));
      chunk = chunk.slice(hEnd + closeTag.length);
    }
    const paragraphs = [];
    for (const m of chunk.matchAll(/<(p|ul|ol|h3)[^>]*>([\s\S]*?)<\/\1>/g)) {
      const [, tag, inner] = m;
      if (tag === 'ul' || tag === 'ol') {
        const items = [...inner.matchAll(/<li[^>]*>([\s\S]*?)<\/li>/g)]
          .map((li) => `• ${cleanInline(li[1], lang)}`)
          .filter((li) => li.length > 2);
        if (items.length) paragraphs.push(items.join('<br>'));
        continue;
      }
      const text = cleanInline(inner, lang);
      if (!text) continue;
      // Rares <h3> : conservés en paragraphe fort (le composant ne rend que
      // <p>, un vrai h3 casserait la hiérarchie h1 héros → h2 sections).
      paragraphs.push(tag === 'h3' ? `<strong>${text}</strong>` : text);
    }
    // Repli wpautop : les pages « conditions » sont du texte NU entre les
    // titres (aucun <p> — WordPress ajoutait les paragraphes au rendu, ligne
    // vide = frontière de paragraphe).
    if (paragraphs.length === 0) {
      for (const block of chunk.split(/\n\s*\n/)) {
        const text = cleanInline(block, lang);
        if (text) paragraphs.push(text);
      }
    }
    if (!title && paragraphs.length === 0) continue;
    sections.push({
      _bookshop_name: 'rich-text',
      type: 'rich-text',
      ...(title ? { title } : {}),
      paragraphs,
    });
  }
  return sections;
}

// --- 4. Fusion dans les JSON existants ---------------------------------------
for (const p of PAGES) {
  const html = contents.get(p.slug);
  if (!html) {
    console.error(`✗ ${p.slug} introuvable dans l'export — page sautée`);
    continue;
  }
  const json = JSON.parse(readFileSync(p.file, 'utf8'));
  const hero = json.sections.filter((s) => s.type === 'hero');
  const cta = json.sections.filter((s) => s.type === 'cta');
  const rich = toSections(html, p.lang);
  json.sections = [...hero, ...rich, ...cta];
  writeFileSync(p.file, JSON.stringify(json, null, 2) + '\n', 'utf8');
  console.log(
    `✓ ${p.file} : ${rich.length} sections rich-text (${rich.reduce((n, s) => n + s.paragraphs.length, 0)} paragraphes) — noindex conservé (${json.noindex})`,
  );
}
console.log('\nRappel : contenu d\'époque (2023) — faire re-valider juridiquement avant de retirer « Masquer des moteurs de recherche ».');
