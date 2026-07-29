#!/usr/bin/env node
/**
 * convert-expertises.mjs — Convertit les expertises WordPress (CPT `expertise`,
 * moteur SiteOrigin) en entrées de la collection `services` (pages composables),
 * dans une ZONE DE STAGING — revue humaine avant tout branchement
 * (plan-convergence-migration.md, Phase 6 : « expertises SiteOrigin d'abord »).
 *
 * Usage :
 *   node scripts/migration/convert-expertises.mjs
 *     [--in C:/Repo/Victrix/siteWP/export]
 *     [--out docs/migration/staging/services]
 *
 * ANATOMIE DU CONTENU SOURCE (recensement 2026-07-29 sur les 78 expertises) :
 * le vrai contenu ne vit PAS dans les blocs éditeur (6 seulement) mais dans
 * ~470 WIDGETS CUSTOM du thème MAG rendus `[siteorigin_widget class="X"]`
 * suivis d'un `<input type="hidden" value="JSON-encodé">`. ⚠️ Ce JSON est
 * MAL ÉCHAPPÉ (guillemets internes en &quot; non \&quot;) → JSON.parse est
 * impossible; on moissonne les champs texte PAR REGEX sur le texte ENCODÉ,
 * avec des terminateurs structurels (`&quot;` suivi d'une clé, `}` ou `]`).
 *
 * Mapping v1 (conservateur — la recomposition fine vers numbered-cards/
 * feature-boxes/callout est un travail éditorial ultérieur) :
 *  - MAG_Intro_Text_Img (1/page) → alimente le `service-hero` (lead + image);
 *  - SiteOrigin_Widget_Headline + <h2> des blocs éditeur → TITRES de section;
 *  - autres widgets (Features, Contents_Blocs, Glass, Tabs, Accordion,
 *    Call_Expert, Logos…) → paragraphes `rich-text` (HTML nettoyé, liens
 *    conservés) dans la section courante — le titre propre d'un widget ouvre
 *    une nouvelle section;
 *  - GFWidget → formId collecté (rapport, → src/data/forms/); images →
 *    collectées (héros ou transition.imagesNonPlacees).
 *  - Hiérarchie 3 niveaux conservée en chemins (fr/<parent>/<enfant>.json);
 *    paires FR/EN par groupe Polylang : même chemin de fichier (celui du FR).
 *  - Brizy (23) : reportées (itération dédiée); brouillons convertis + marqués.
 *
 * Rapport : docs/migration/staging/services/rapport-expertises.md.
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import {
  tag,
  decodeEntities,
  parseCategories,
  metaValue,
  balancedEnd,
  makeUrlRewriter,
  slugify,
  forEachItem,
  collectAttachments,
} from './lib-wxr.mjs';

const args = process.argv.slice(2);
const getArg = (name, def) => {
  const i = args.indexOf(name);
  return i >= 0 && args[i + 1] ? args[i + 1] : def;
};
const IN_DIR = getArg('--in', 'C:/Repo/Victrix/siteWP/export');
const OUT_DIR = getArg('--out', 'docs/migration/staging/services');

const { rewriteUrl, mediaRefs } = makeUrlRewriter();

// --- Nettoyage inline (HTML conservé — paragraphes rich-text rendus tels quels)
function cleanInline(html, warn, collectImg) {
  let s = html;
  s = s.replace(/<img\b[^>]*>/gi, (t) => {
    const src = t.match(/src="([^"]+)"/i)?.[1];
    if (src) collectImg(rewriteUrl(src, { image: true }));
    return '';
  });
  s = s.replace(/<iframe\b[^>]*>[\s\S]*?<\/iframe>/gi, (t) => {
    const src = t.match(/src="([^"]+)"/i)?.[1];
    warn(`iframe converti en lien : ${src ?? '(sans src)'}`);
    return src ? `<a href="${src}">Voir la vidéo</a>` : '';
  });
  s = s.replace(/<a\b[^>]*>([\s\S]*?)<\/a>/gi, (t, inner) => {
    const href = t.match(/href="([^"]+)"/i)?.[1];
    if (!href) return inner;
    return `<a href="${rewriteUrl(href)}">${inner}</a>`;
  });
  s = s.replace(/<(strong|b)\b[^>]*>/gi, '<strong>').replace(/<\/(strong|b)>/gi, '</strong>');
  s = s.replace(/<(em|i)\b[^>]*>/gi, '<em>').replace(/<\/(em|i)>/gi, '</em>');
  s = s.replace(/<br\s*\/?>/gi, '<br>');
  s = s.replace(/<\/?span\b[^>]*>/gi, '');
  s = s.replace(/<li\b[^>]*>/gi, '<li>').replace(/<(ul|ol)\b[^>]*>/gi, '<$1>');
  s = s.replace(/<\/?(u|sup|sub|small|font|div|p|figure|figcaption|h[1-6])\b[^>]*>/gi, ' ');
  s = s.replace(/<(?!\/?(strong|em|a|br|ul|ol|li|table|tbody|thead|tr|td|th)\b)[^>]+>/gi, (t) => {
    warn(`balise inattendue retirée : ${t.slice(0, 40)}`);
    return ' ';
  });
  return decodeEntities(s).replace(/[ \t]+/g, ' ').trim();
}

/** Texte nu (lead / description). */
const plainText = (html) =>
  decodeEntities(html.replace(/<[^>]+>/g, ' '))
    .replace(/\s+/g, ' ')
    .trim();

// --- Flux ordonné du contenu : blocs éditeur + widgets custom ---------------
function parseContentStream(content) {
  if (!content.includes('panel-layout')) return [{ kind: 'editor', html: content }];
  const events = [];
  // Blocs éditeur (sow-editor) — plage [start,end) pour dédupliquer les widgets.
  const marker = 'siteorigin-widget-tinymce textwidget';
  const editorRanges = [];
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
    events.push({ pos: i, kind: 'editor', html: content.slice(start, j) });
    editorRanges.push([i, j]);
    i = j;
  }
  // Widgets custom : shortcode + input caché (la valeur ne contient JAMAIS de
  // guillemet brut — tout est encodé &quot; — donc [^"]* est sûr).
  const wRe = /\[siteorigin_widget class="([A-Za-z_]+)"\]\s*<input type="hidden"[^>]*value="([^"]*)"/g;
  let wm;
  while ((wm = wRe.exec(content))) {
    const inEditor = editorRanges.some(([a, b]) => wm.index >= a && wm.index < b);
    if (!inEditor) events.push({ pos: wm.index, kind: 'widget', cls: wm[1], encoded: wm[2] });
  }
  return events.sort((a, b) => a.pos - b.pos);
}

// --- Moisson des champs texte d'un widget (sur texte ENCODÉ — voir entête) --
const HARVEST_KEYS =
  'title|subtitle|sub_title|text|content|description|desc|label|button_text|btn_text|question|answer|name|link_text';
function harvestStrings(encoded) {
  const out = [];
  const re = new RegExp(
    `&quot;(${HARVEST_KEYS})&quot;:&quot;([\\s\\S]*?)&quot;(?=,&quot;[a-z0-9_]+&quot;:|\\}|\\])`,
    'g',
  );
  let m;
  while ((m = re.exec(encoded))) {
    let value = decodeEntities(decodeEntities(m[2])); // double encodage (attr + HTML interne)
    // Séquences \n /\r\n du JSON source dont l'antislash s'est PERDU dans la
    // base : il reste un « n »/« rn » collé après une balise fermante
    // (« </h1>nChez … »). Réparation heuristique aux frontières de balises.
    value = value
      .replace(/>rn(?=\s*<)/g, '>')
      .replace(/>n(?=\s*<)/g, '>')
      .replace(/>rn(?=[A-ZÀ-Þ0-9(«])/g, '> ')
      .replace(/>n(?=[A-ZÀ-Þ0-9(«])/g, '> ');
    if (plainText(value)) out.push({ key: m[1], value });
  }
  return out;
}
function harvestImages(encoded, attachments) {
  const out = [];
  const re = /&quot;(image|image_url|background_image|img|logo)&quot;:(?:(\d+)|&quot;((?:https?:|\/)[^&]*?)&quot;)/g;
  let m;
  while ((m = re.exec(encoded))) {
    const url = m[2] ? attachments.get(Number(m[2])) : m[3];
    if (url) out.push(rewriteUrl(url, { image: true }));
  }
  return out;
}
function harvestLinks(encoded) {
  // boutons : {"url":"…"} / {"link":"…"}
  const out = [];
  const re = /&quot;(url|link|button_url|btn_url)&quot;:&quot;((?:https?:|\/)[^&]*?)&quot;/g;
  let m;
  while ((m = re.exec(encoded))) out.push(rewriteUrl(decodeEntities(m[2])));
  return out;
}

// --- Assemblage en sections --------------------------------------------------
function streamToSections(events, attachments, warn, collectImg) {
  const sections = [];
  let current = null;
  let hero = null; // depuis MAG_Intro_Text_Img
  const push = (para) => {
    if (!para) return;
    if (!current) current = { title: '', paragraphs: [] };
    current.paragraphs.push(para);
  };
  // Une section sans paragraphes (titre orphelin — p. ex. headline suivie
  // d'un widget qui ouvre sa propre section) est du bruit : abandonnée.
  const open = (title) => {
    if (current && current.paragraphs.length) sections.push(current);
    current = { title, paragraphs: [] };
  };
  const close = () => {
    if (current && current.paragraphs.length) sections.push(current);
    current = null;
  };

  for (const ev of events) {
    if (ev.kind === 'editor') {
      editorHtmlInto(ev.html, { push, open }, warn, collectImg);
      continue;
    }
    const cls = ev.cls;
    if (cls === 'GFWidget') continue; // formulaires : collectés globalement
    const images = harvestImages(ev.encoded, attachments);
    if (cls === 'MAG_ImageAdvanced_register_Widget' || cls === 'SiteOrigin_Widget_Image_Widget') {
      images.forEach(collectImg);
      continue;
    }
    if (cls === 'MAG_Intro_Text_Img_register_Widget' && !hero) {
      const fields = harvestStrings(ev.encoded);
      hero = {
        lead: plainText(fields.find((f) => f.key !== 'title')?.value ?? ''),
        image: images[0] ?? '',
      };
      images.slice(1).forEach(collectImg);
      continue;
    }
    if (cls === 'SiteOrigin_Widget_Headline_Widget') {
      const fields = harvestStrings(ev.encoded);
      const t = plainText(fields[0]?.value ?? '');
      if (t) open(t);
      continue;
    }
    // Widgets de contenu génériques (Features, Contents_Blocs, Glass, Tabs,
    // Accordion, Call_Expert, Logos_Carrousel…) : le `title` de PREMIER niveau
    // ouvre une section; le reste devient des paragraphes nettoyés.
    const fields = harvestStrings(ev.encoded);
    images.forEach(collectImg);
    if (fields.length === 0) {
      warn(`widget ${cls} sans texte exploitable`);
      continue;
    }
    let first = true;
    for (const f of fields) {
      const cleaned = cleanInline(f.value, warn, collectImg);
      if (!cleaned) continue;
      if (first && f.key === 'title' && plainText(cleaned).length <= 120) {
        open(plainText(cleaned));
      } else if (f.key === 'title' || f.key === 'question' || f.key === 'name') {
        push(`<strong>${plainText(cleaned)}</strong>`);
      } else {
        push(cleaned);
      }
      first = false;
    }
    const links = harvestLinks(ev.encoded);
    if (cls === 'MAG_Call_Expert_register_Widget' && links[0]) {
      const label = plainText(fields.find((f) => f.key.includes('text') || f.key.includes('label'))?.value ?? 'Consultez un expert');
      push(`<a href="${links[0]}">${label}</a>`);
    }
  }
  close();
  return { sections, hero };
}

/** HTML d'un bloc éditeur → sections (découpe aux h1/h2, listes équilibrées). */
function editorHtmlInto(block, { push, open }, warn, collectImg) {
  const openRe = /<(h[1-6]|ul|ol|blockquote|table|li)\b[^>]*>/gi;
  let last = 0;
  const flushText = (txt) => {
    for (const para of txt.split(/\n\s*\n/)) push(cleanInline(para, warn, collectImg));
  };
  let m;
  while ((m = openRe.exec(block))) {
    if (m.index < last) continue;
    flushText(block.slice(last, m.index));
    const name = m[1].toLowerCase();
    if (name === 'li') {
      warn('liste <li> sans <ul> englobant — reconstruite');
      let runEnd = balancedEnd(block, 'li', m.index + m[0].length);
      let nm;
      while ((nm = /^\s*<li\b[^>]*>/i.exec(block.slice(runEnd)))) {
        runEnd = balancedEnd(block, 'li', runEnd + nm[0].length);
      }
      push(`<ul>${cleanInline(block.slice(m.index, runEnd), warn, collectImg)}</ul>`);
      last = runEnd;
      continue;
    }
    const end = balancedEnd(block, name, m.index + m[0].length);
    const el = block.slice(m.index, end);
    const inner = el.replace(/^<[^>]+>/, '').replace(/<\/[^>]+>$/, '');
    if (name === 'h1' || name === 'h2') {
      open(plainText(inner));
    } else if (name.startsWith('h')) {
      push(`<strong>${plainText(inner)}</strong>`);
    } else if (name === 'ul' || name === 'ol') {
      push(`<${name}>${cleanInline(inner, warn, collectImg)}</${name}>`);
    } else if (name === 'blockquote') {
      push(cleanInline(inner, warn, collectImg));
    } else {
      warn('table HTML conservée telle quelle (à vérifier au rendu)');
      push(cleanInline(el, warn, collectImg));
    }
    last = end;
  }
  flushText(block.slice(last));
}

// --- Lecture ----------------------------------------------------------------
const items = [];
const attachments = collectAttachments(IN_DIR);
forEachItem(IN_DIR, (item) => {
  if (tag(item, 'wp:post_type') !== 'expertise') return;
  const status = tag(item, 'wp:status');
  if (status === 'trash') return;
  const cats = parseCategories(item);
  const content = tag(item, 'content:encoded') ?? '';
  const gfIds = new Set();
  for (const g of content.matchAll(/\[gravityform[^\]]*?id[^\d\]]{0,12}(\d+)/g)) gfIds.add(Number(g[1]));
  for (const g of content.matchAll(/&quot;form&quot;:&quot;(\d+)&quot;/g)) gfIds.add(Number(g[1]));
  const isBrizy =
    content.includes('brz-root__container') ||
    (metaValue(item, 'brizy_post_uid') !== null && !content.includes('panel-layout'));
  items.push({
    id: Number(tag(item, 'wp:post_id')),
    parent: Number(tag(item, 'wp:post_parent') ?? 0),
    title: tag(item, 'title'),
    slug: tag(item, 'wp:post_name') || slugify(tag(item, 'title')),
    url: tag(item, 'link'),
    status,
    password: tag(item, 'wp:post_password') || null,
    lang: cats.find((c) => c.domain === 'language')?.nicename ?? 'fr',
    group: cats.find((c) => c.domain === 'post_translations')?.nicename ?? null,
    engine: isBrizy ? 'brizy' : content.includes('panel-layout') ? 'siteorigin' : content.trim() ? 'html' : 'vide',
    content,
    seoTitle: metaValue(item, '_yoast_wpseo_title'),
    seoDesc: metaValue(item, '_yoast_wpseo_metadesc'),
    noindex: metaValue(item, '_yoast_wpseo_meta-robots-noindex') === '1',
    thumbId: Number(metaValue(item, '_thumbnail_id') ?? 0),
    ctaText: metaValue(item, 'cta_text'),
    ctaLink: metaValue(item, 'cta_link'),
    victrixTable: /\[victrix_table/.test(content),
    formIds: [...gfIds],
  });
});

// Chaîne hiérarchique de slugs (dans la langue de l'item).
const byId = new Map(items.map((it) => [it.id, it]));
function chainOf(it) {
  const parts = [it.slug];
  let cur = it;
  while (cur.parent && byId.has(cur.parent)) {
    cur = byId.get(cur.parent);
    parts.unshift(cur.slug);
  }
  return parts.join('/');
}

// --- Écriture ---------------------------------------------------------------
mkdirSync(OUT_DIR, { recursive: true });
const report = {
  skippedBrizy: [],
  drafts: [],
  untranslated: [],
  protectedPages: [],
  warnings: new Map(),
  forms: new Map(),
  tables: [],
  emptyish: [],
};
const groups = new Map();
for (const it of items) {
  const key = it.group ?? `solo-${it.id}`;
  (groups.get(key) ?? groups.set(key, []).get(key)).push(it);
}

let filesWritten = 0;
for (const groupItems of groups.values()) {
  const fr = groupItems.find((i) => i.lang === 'fr');
  const en = groupItems.find((i) => i.lang === 'en');
  if (!fr || !en) report.untranslated.push(`${(fr ?? en).lang}/${chainOf(fr ?? en)}`);
  const fileBase = fr ? chainOf(fr) : chainOf(en);

  for (const it of groupItems) {
    const label = `${it.lang}/${chainOf(it)}`;
    if (it.engine === 'brizy') {
      report.skippedBrizy.push(label);
      continue;
    }
    if (it.password) report.protectedPages.push(label);
    if (it.status !== 'publish') report.drafts.push(label);
    if (it.victrixTable) report.tables.push(label);
    if (it.formIds.length) report.forms.set(label, it.formIds);

    const warnings = [];
    const warn = (msg) => warnings.push(msg);
    const images = [];
    const collectImg = (src) => src && images.push(src);

    const events = parseContentStream(it.content);
    const { sections: richSections, hero } = streamToSections(events, attachments, warn, collectImg);

    let lead = hero?.lead ?? '';
    if (!lead && richSections.length && !richSections[0].title && richSections[0].paragraphs.length) {
      lead = plainText(richSections[0].paragraphs[0]);
      richSections[0].paragraphs.shift();
      if (richSections[0].paragraphs.length === 0) richSections.shift();
    }

    const cover = it.thumbId && attachments.get(it.thumbId);
    const heroImage = hero?.image || (cover ? rewriteUrl(cover, { image: true }) : '');
    const totalParas = richSections.reduce((n, s) => n + s.paragraphs.length, 0);
    if (totalParas < 2) report.emptyish.push(`${label} (${totalParas} paragraphes)`);

    const doc = {
      title: it.title,
      description: it.seoDesc ?? lead.slice(0, 160),
      ...(it.noindex ? { noindex: true } : {}),
      sections: [
        {
          type: 'service-hero',
          eyebrow: '',
          titleAccent: '',
          title: it.title,
          lead,
          ctaLabel: it.ctaText ?? '',
          ctaHref: it.ctaLink ? rewriteUrl(it.ctaLink) : '',
          image: heroImage,
          imageAlt: '',
        },
        ...richSections.map((s) => ({ type: 'rich-text', title: s.title, paragraphs: s.paragraphs })),
      ],
      transition: {
        wpUrl: rewriteUrl(it.url ?? ''),
        seoTitle: it.seoTitle ?? '',
        engine: it.engine,
        draft: it.status !== 'publish',
        translationGroup: it.group ?? '',
        imagesNonPlacees: images.filter((src) => src !== heroImage),
        formIds: it.formIds,
      },
    };

    const outPath = join(OUT_DIR, it.lang, `${fileBase}.json`);
    mkdirSync(dirname(outPath), { recursive: true });
    writeFileSync(outPath, JSON.stringify(doc, null, 2) + '\n', 'utf8');
    filesWritten++;
    if (warnings.length) report.warnings.set(label, warnings);
  }
}

// --- Rapport ----------------------------------------------------------------
const dedupe = (arr) => [...new Set(arr)];
const lines = [
  '# Rapport de conversion — expertises WordPress → staging services',
  '',
  `> Généré par \`scripts/migration/convert-expertises.mjs\` — rejouable. Sortie : \`${OUT_DIR}/{fr,en}/<hiérarchie>.json\`.`,
  "> ⚠️ ZONE DE STAGING : rien n'est branché. Mapping v1 : service-hero (widget Intro_Text_Img) + rich-text",
  '> (blocs éditeur découpés aux <h2> + moisson des widgets custom MAG — voir entête du script).',
  '> La recomposition en sections riches (numbered-cards, feature-boxes, callout…) = travail éditorial ultérieur.',
  '',
  `- Expertises source (hors corbeille) : **${items.length}** · converties : **${filesWritten}** · Brizy reportées (itération dédiée) : **${report.skippedBrizy.length}**`,
  `- Brouillons convertis (décision §16 Q1) : ${report.drafts.length} (${report.drafts.join(', ') || '—'})`,
  `- Sans traduction : ${report.untranslated.length} (${report.untranslated.join(', ') || '—'})`,
  `- Pages protégées par mot de passe : ${report.protectedPages.join(', ') || '—'}`,
  `- Pages avec \`[victrix_table]\` (plugin custom à réimplémenter) : ${report.tables.join(', ') || '—'}`,
  `- Pages quasi vides après conversion (à inspecter) : ${report.emptyish.join(', ') || '—'}`,
  `- Médias référencés (héros + corps) : **${mediaRefs.size}**`,
  '',
  '## Formulaires Gravity Forms référencés (→ mapper vers src/data/forms/)',
  '',
  ...(report.forms.size === 0
    ? ['Aucun.']
    : [...report.forms.entries()].map(([p, ids]) => `- ${p} : GF #${dedupe(ids).join(', #')}`)),
  '',
  '## Pages Brizy reportées',
  '',
  ...report.skippedBrizy.map((p) => `- ${p}`),
  '',
  '## Avertissements par page',
  '',
  ...(report.warnings.size === 0
    ? ['Aucun.']
    : [...report.warnings.entries()].map(([p, ws]) => {
        const counts = new Map();
        for (const w of ws) counts.set(w, (counts.get(w) ?? 0) + 1);
        return `- **${p}** : ${[...counts.entries()].map(([w, n]) => (n > 1 ? `${w} ×${n}` : w)).join(' · ')}`;
      })),
  '',
  '## Médias référencés',
  '',
  ...[...mediaRefs].sort().map((u) => `- ${u}`),
  '',
].join('\n');
writeFileSync(join(OUT_DIR, 'rapport-expertises.md'), lines, 'utf8');

console.log(`Expertises : ${items.length} · converties : ${filesWritten} · Brizy reportées : ${report.skippedBrizy.length}`);
console.log(`Brouillons : ${report.drafts.length} · sans traduction : ${report.untranslated.length} · quasi vides : ${report.emptyish.length} · médias : ${mediaRefs.size}`);
console.log(`Rapport : ${join(OUT_DIR, 'rapport-expertises.md')}`);
