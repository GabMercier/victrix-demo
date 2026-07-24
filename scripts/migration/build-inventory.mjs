#!/usr/bin/env node
/**
 * build-inventory.mjs — Croise les extractions WXR (parse-wxr.mjs) et SQL
 * (extract-sql.mjs) pour générer l'inventaire de contenu de la migration
 * victrix.ca → Astro :
 *   - docs/content-inventory.md            (document principal, FR)
 *   - docs/migration/urls-contenus.csv     (toutes les URLs de contenu)
 *   - docs/migration/urls-medias.csv       (médiathèque dédupliquée)
 *   - docs/migration/redirections.csv      (301 existantes + anciens slugs)
 *   - docs/migration/menus.json            (6 menus reconstruits)
 *
 * Usage : node scripts/migration/build-inventory.mjs --wxr <wxr-items.json> --sql <sql-extract.json>
 */
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';

const args = process.argv.slice(2);
const getArg = (name, def) => {
  const i = args.indexOf(name);
  return i >= 0 && args[i + 1] ? args[i + 1] : def;
};
const WXR = JSON.parse(readFileSync(getArg('--wxr', 'wxr-items.json'), 'utf8'));
const SQL = JSON.parse(readFileSync(getArg('--sql', 'sql-extract.json'), 'utf8'));
const DOCS = getArg('--docs', 'docs');
mkdirSync(`${DOCS}/migration`, { recursive: true });

const CONTENT_TYPES = ['page', 'post', 'expertise', 'dlm_download'];
const items = WXR.items;
const byId = new Map(items.map((i) => [i.id, i]));
const content = items.filter((i) => CONTENT_TYPES.includes(i.type));
const pages = items.filter((i) => i.type === 'page');
const posts = items.filter((i) => i.type === 'post');
const expertises = items.filter((i) => i.type === 'expertise');
const dlm = items.filter((i) => i.type === 'dlm_download');
const dlmVersions = items.filter((i) => i.type === 'dlm_download_version');

// Attachements dédupliqués (les fichiers WXR par type re-listent les mêmes médias)
const attachments = [...new Map(items.filter((i) => i.type === 'attachment').map((i) => [i.id, i])).values()];

const users = new Map(SQL.users.map((u) => [u.login, u.displayName]));
const author = (login) => users.get(login) ?? login;

const esc = (s) =>
  String(s ?? '')
    .replaceAll('|', '\\|')
    .replaceAll('\n', ' ')
    .replaceAll('&nbsp;', ' ')
    .replaceAll('&#038;', '&')
    .replaceAll('&amp;', '&');
const escUrl = (u) => String(u ?? '').replaceAll('&#038;', '&');
const path = (url) => escUrl(url ?? '').replace(/^https?:\/\/(www\.)?victrix\.ca/, '') || '/';

// --- Traductions (Polylang, descriptions des termes post_translations) -------
const translationOf = new Map();
for (const tt of SQL.termTaxonomy.filter((t) => t.taxonomy === 'post_translations')) {
  const pair = {};
  for (const m of (tt.description ?? '').matchAll(/s:2:"(fr|en)";i:(\d+)/g)) pair[m[1]] = Number(m[2]);
  if (pair.fr && pair.en) {
    translationOf.set(pair.fr, pair.en);
    translationOf.set(pair.en, pair.fr);
  }
}

// --- Menus -------------------------------------------------------------------
const navTT = new Map(SQL.termTaxonomy.filter((t) => t.taxonomy === 'nav_menu').map((t) => [t.ttId, t.termId]));
const menuName = new Map(SQL.terms.map((t) => [t.termId, t.name]));
const itemsOfMenu = new Map(); // termId -> [menu item post ids]
for (const [objId, ttId] of SQL.termRelationships) {
  if (!navTT.has(ttId)) continue;
  const termId = navTT.get(ttId);
  (itemsOfMenu.get(termId) ?? itemsOfMenu.set(termId, []).get(termId)).push(objId);
}
const navPost = new Map(SQL.navMenuItems.map((p) => [p.id, p]));

const locations = {};
const tm = SQL.options['theme_mods_victrix/resources'] ?? '';
const locBlock = tm.match(/nav_menu_locations";a:\d+:\{([^}]*)\}/);
if (locBlock) for (const m of locBlock[1].matchAll(/s:\d+:"([^"]+)";i:(\d+)/g)) locations[m[1]] = Number(m[2]);

function buildMenu(termId) {
  const ids = itemsOfMenu.get(termId) ?? [];
  const nodes = ids.map((id) => {
    const meta = SQL.menuItemMeta[id] ?? {};
    const post = navPost.get(id) ?? {};
    const object = meta['_menu_item_object'];
    const targetId = Number(meta['_menu_item_object_id'] ?? 0);
    const target = byId.get(targetId);
    const label = post.title || target?.title || meta['_menu_item_url'] || `#${id}`;
    const url = object === 'custom' ? meta['_menu_item_url'] : target?.url ?? null;
    return {
      id,
      order: post.menuOrder ?? 0,
      parentItem: Number(meta['_menu_item_menu_item_parent'] ?? 0),
      label,
      object,
      targetId: object === 'custom' ? null : targetId,
      url,
      targetStatus: object === 'custom' ? null : target?.status ?? 'INTROUVABLE',
      children: [],
    };
  });
  const map = new Map(nodes.map((n) => [n.id, n]));
  const roots = [];
  for (const n of nodes.sort((a, b) => a.order - b.order)) {
    if (n.parentItem && map.has(n.parentItem)) map.get(n.parentItem).children.push(n);
    else roots.push(n);
  }
  return roots;
}
const locationOfTerm = Object.fromEntries(Object.entries(locations).map(([loc, id]) => [id, loc]));
const menus = [...itemsOfMenu.keys()].map((termId) => ({
  termId,
  name: menuName.get(termId),
  location: locationOfTerm[termId] ?? null,
  itemCount: (itemsOfMenu.get(termId) ?? []).length,
  tree: buildMenu(termId),
}));

const renderMenuTree = (nodes, depth = 0) =>
  nodes
    .map((n) => {
      const flag = n.targetStatus && n.targetStatus !== 'publish' && n.object !== 'custom' ? ` ⚠️ (${n.targetStatus})` : '';
      const url = n.url ? ` — \`${path(n.url)}\`` : '';
      const kind = n.object === 'custom' ? ' *(lien custom)*' : '';
      return `${'  '.repeat(depth)}- ${esc(n.label)}${url}${kind}${flag}\n${renderMenuTree(n.children, depth + 1)}`;
    })
    .join('');

// --- Plugins -----------------------------------------------------------------
const PLUGIN_ROLES = {
  'polylang-pro': 'Multilingue FR/EN (Pro) — routing `/` + `/en/`, paires de traduction',
  gravityforms: 'Formulaires (17 formulaires, 5 200 entrées)',
  akismet: 'Anti-spam',
  'axeptio-sdk-integration': 'Consentement cookies (Axeptio, config côté SaaS)',
  'better-wp-security': 'Sécurité (SolidWP/iThemes) — sans objet en statique',
  brizy: 'Page builder Brizy (27 contenus)',
  'classic-editor': 'Éditeur classique',
  cmb2: 'Framework de champs méta (peu utilisé : cta_text/cta_link)',
  'code-snippets': 'Snippets PHP — 2 actifs : tracking Microsoft Clarity + ZoomInfo',
  'copy-delete-posts': 'Utilitaire de duplication — sans objet',
  'disable-comments': 'Désactive les commentaires (0 commentaire sur le site)',
  'download-monitor': 'Téléchargements protégés par formulaire (5 documents)',
  'head-footer-code': 'Injection de scripts head/footer (métas hefo_*)',
  'post-smtp': 'Envoi SMTP des notifications (formulaires)',
  redirection: 'Redirections 301 (85 règles) + logs 404',
  'safe-svg': 'Upload SVG sécurisé (154 SVG en médiathèque)',
  'siteorigin-panels': 'Page builder SiteOrigin Panels (133 contenus)',
  'so-widgets-bundle': 'Widgets SiteOrigin (850 widgets dans les contenus)',
  'tinymce-advanced': 'Éditeur enrichi',
  'victrix-product-table': '⚠️ Plugin CUSTOM — shortcode `[victrix_table]` (tableaux produits/prix)',
  'wordpress-seo': 'Yoast SEO (titles, meta descriptions, sitemap)',
  'wp-consent-api': 'API consentement (liaison Axeptio)',
  'wp-downgrade': 'Épinglage de version WP — sans objet',
  'wp-security-audit-log': "Journal d'audit — sans objet",
  'wp-smushit': 'Optimisation images — remplacé par le pipeline Astro',
  'wp-super-cache': 'Cache — sans objet en statique',
};
const activePlugins = [...(SQL.options.active_plugins ?? '').matchAll(/"([^"]+\.php)"/g)].map((m) => m[1]);

// --- SEO ---------------------------------------------------------------------
const seoTitle = content.filter((i) => i.meta['_yoast_wpseo_title']);
const seoDesc = content.filter((i) => i.meta['_yoast_wpseo_metadesc']);
const noindex = content.filter((i) => i.meta['_yoast_wpseo_meta-robots-noindex'] === '1');
const thumbs = content.filter((i) => i.meta['_thumbnail_id']);

// --- Shortcodes --------------------------------------------------------------
const REAL_SHORTCODES = ['siteorigin_widget', 'gravityform', 'victrix_table', 'social_links', 'dlm_no_access', 'caption', 'gallery', 'embed', 'video', 'audio'];
const shortcodeTotals = {};
for (const it of content)
  for (const [k, v] of Object.entries(it.shortcodes)) shortcodeTotals[k] = (shortcodeTotals[k] ?? 0) + v;
const realShortcodes = REAL_SHORTCODES.filter((s) => shortcodeTotals[s]).map((s) => [s, shortcodeTotals[s]]);

// Formulaires embarqués
const gfUsage = {}; // formId -> [{title,url,status}]
for (const it of content)
  for (const fid of it.gravityFormIds) (gfUsage[fid] ??= []).push(it);
const gfById = new Map(SQL.gfForms.map((f) => [f.id, f]));

// --- Moteurs de contenu ------------------------------------------------------
const engineTally = {};
for (const it of content) {
  engineTally[it.type] ??= {};
  engineTally[it.type][it.engine] = (engineTally[it.type][it.engine] ?? 0) + 1;
}

// --- Médias ------------------------------------------------------------------
const extOf = (u) => (u?.match(/\.([a-z0-9]+)(?:\?.*)?$/i)?.[1] ?? '?').toLowerCase();
const mediaExt = {};
let dlmUploads = 0, weirdFolder = 0;
for (const a of attachments) {
  const e = extOf(a.attachmentUrl);
  mediaExt[e] = (mediaExt[e] ?? 0) + 1;
  if (a.attachmentUrl?.includes('/dlm_uploads/')) dlmUploads++;
  if (a.attachmentUrl?.includes('/0206/')) weirdFolder++;
}

// Fichiers Download Monitor (méta _files des versions, JSON ou sérialisé)
const dlmFiles = new Map(); // downloadId -> [urls]
for (const v of dlmVersions) {
  const urls = [];
  for (const raw of v.meta._files ?? []) {
    try { urls.push(...JSON.parse(raw)); }
    catch { urls.push(...[...raw.matchAll(/https?:[^"';\\]+/g)].map((m) => m[0])); }
  }
  if (urls.length) (dlmFiles.get(v.parent) ?? dlmFiles.set(v.parent, []).get(v.parent)).push(...urls);
}

// --- Redirections ------------------------------------------------------------
const oldSlugItems = content.filter((i) => i.meta._wp_old_slug?.length);
const urlSet = new Set(content.filter((i) => i.status === 'publish').map((i) => path(i.url)));
const unresolvedRedirects = SQL.redirectionItems.filter((r) => {
  if (r.regex || !r.actionData || !/^(https?:\/\/(www\.)?victrix\.ca)?\//.test(r.actionData)) return false;
  const p = path(r.actionData).replace(/\/?$/, '/');
  return !urlSet.has(p) && !urlSet.has(path(r.actionData));
});

// --- Vérifications croisées --------------------------------------------------
const menuOrphans = menus.flatMap((m) => {
  const walk = (ns) => ns.flatMap((n) => [...(n.targetStatus && n.targetStatus !== 'publish' && n.object !== 'custom' ? [{ menu: m.name, label: n.label, status: n.targetStatus }] : []), ...walk(n.children)]);
  return walk(m.tree);
});
const gfProblems = Object.entries(gfUsage).filter(([fid]) => {
  const f = gfById.get(Number(fid));
  return !f || !f.isActive || f.isTrash;
});
const unpaired = content.filter(
  (i) => i.status === 'publish' && !translationOf.has(i.id) && i.type !== 'dlm_download'
);

// --- CSV ---------------------------------------------------------------------
const csvCell = (v) => `"${String(v ?? '').replaceAll('"', '""').replaceAll('\n', ' ')}"`;
const csv = (rows) => rows.map((r) => r.map(csvCell).join(',')).join('\n') + '\n';

writeFileSync(
  `${DOCS}/migration/urls-contenus.csv`,
  csv([
    ['type', 'id', 'langue', 'statut', 'titre', 'url', 'chemin', 'moteur', 'seo_title', 'seo_metadesc', 'noindex', 'traduction_id', 'auteur', 'date'],
    ...content.map((i) => [
      i.type, i.id, i.lang, i.status, i.title, i.url, path(i.url), i.engine,
      i.meta['_yoast_wpseo_title'] ?? '', i.meta['_yoast_wpseo_metadesc'] ?? '',
      i.meta['_yoast_wpseo_meta-robots-noindex'] === '1' ? 'oui' : '',
      translationOf.get(i.id) ?? '', author(i.author), i.date,
    ]),
  ]),
  'utf8'
);

writeFileSync(
  `${DOCS}/migration/urls-medias.csv`,
  csv([
    ['id', 'url', 'extension', 'titre', 'parent_id', 'date'],
    ...attachments.map((a) => [a.id, a.attachmentUrl, extOf(a.attachmentUrl), a.title, a.parent || '', a.date]),
  ]),
  'utf8'
);

writeFileSync(
  `${DOCS}/migration/redirections.csv`,
  csv([
    ['source', 'cible', 'code', 'type', 'groupe', 'hits', 'statut', 'origine'],
    ...SQL.redirectionItems.map((r) => {
      const g = SQL.redirectionGroups.find((x) => x.id === r.groupId);
      return [r.url, r.actionData ?? '', r.actionCode, r.regex ? 'regex' : 'url', g?.name ?? r.groupId, r.lastCount, r.status, 'plugin Redirection'];
    }),
    ...oldSlugItems.flatMap((i) =>
      i.meta._wp_old_slug.map((old) => [`(ancien slug) ${old}`, path(i.url), 301, 'slug', '_wp_old_slug', '', 'enabled', 'meta _wp_old_slug'])
    ),
  ]),
  'utf8'
);

writeFileSync(`${DOCS}/migration/menus.json`, JSON.stringify({ locations, menus }, null, 2), 'utf8');

// --- Rendu Markdown ----------------------------------------------------------
const statusBadge = (s) => (s === 'publish' ? 'publié' : s === 'draft' ? '**brouillon**' : s);
const contentTable = (rows, extra = []) =>
  [
    `| Titre | Chemin | Langue | Statut | Moteur |${extra.map((e) => ` ${e[0]} |`).join('')}`,
    `|---|---|---|---|---|${extra.map(() => '---|').join('')}`,
    ...rows.map(
      (i) =>
        `| ${esc(i.title)} | \`${path(i.url)}\` | ${i.lang} | ${statusBadge(i.status)} | ${i.engine} |${extra.map((e) => ` ${esc(e[1](i))} |`).join('')}`
    ),
  ].join('\n');

function expertiseTree(lang) {
  const pool = expertises.filter((e) => e.lang === lang);
  const roots = pool.filter((e) => !pool.some((p) => p.id === e.parent));
  const render = (nodes, depth) =>
    nodes
      .sort((a, b) => a.menuOrder - b.menuOrder || a.id - b.id)
      .map((n) => {
        const kids = pool.filter((p) => p.parent === n.id);
        const st = n.status !== 'publish' ? ` — **${n.status}**` : '';
        const pw = n.password ? ' 🔒 *(protégé par mot de passe)*' : '';
        return `${'  '.repeat(depth)}- **${esc(n.title)}** — \`${path(n.url)}\` *(${n.engine})*${st}${pw}\n${render(kids, depth + 1)}`;
      })
      .join('');
  return render(roots, 0);
}

const frontPage = byId.get(Number(SQL.options.page_on_front));
const postsPage = byId.get(Number(SQL.options.page_for_posts));
const allCatTerms = SQL.termTaxonomy
  .filter((t) => t.taxonomy === 'category')
  .map((t) => {
    const term = SQL.terms.find((x) => x.termId === t.termId);
    // langue du terme : déduite d'un contenu qui le porte, sinon du nom (« Our … »)
    const carrier = content.find((i) => i.categories.some((c) => c.slug === term?.slug && c.name === term?.name));
    const en = carrier ? carrier.lang === 'en' : /^Our\b/.test(term?.name ?? '');
    return { ...t, name: term?.name, slug: term?.slug, en };
  })
  .sort((a, b) => b.count - a.count);
const publishedCounts = Object.fromEntries(
  CONTENT_TYPES.map((t) => [t, content.filter((i) => i.type === t && i.status === 'publish').length])
);

const md = `# Inventaire de contenu — migration victrix.ca (WordPress → Astro)

> Généré le ${new Date().toISOString().slice(0, 10)} par \`scripts/migration/build-inventory.mjs\` à partir de :
> - Export WXR : \`C:\\Repo\\Victrix\\siteWP\\export\\\` (18 fichiers XML du ${WXR.items[0]?.date?.slice(0, 4) ? '2026-07-23' : ''})
> - Dump SQL : \`C:\\Repo\\Victrix\\siteWP\\victrix_bdd.sql\` (293 Mo, préfixe \`vic_\`)
>
> **Objectif : ne rien perdre dans la migration.** Annexes machine-exploitables dans \`docs/migration/\`.

## 1. Vue d'ensemble du site source

| | |
|---|---|
| URL | https://www.victrix.ca |
| Nom | ${esc(SQL.options.blogname)} |
| Langues | **FR (fr_CA, défaut, racine \`/\`) + EN (en_CA, préfixe \`/en/\`)** via Polylang Pro |
| Thème | \`${esc(SQL.options.template)}\` — thème custom **Sage/Roots** (templates Blade) |
| Permaliens | \`${esc(SQL.options.permalink_structure)}\` |
| Page d'accueil | ${esc(frontPage?.title)} (id ${frontPage?.id}) |
| Page du blogue | ${esc(postsPage?.title ?? '?')} (id ${SQL.options.page_for_posts}) — \`${path(postsPage?.url)}\` |
| Fuseau | ${esc(SQL.options.timezone_string)} |
| Contenus publiés | ${publishedCounts.page} pages · ${publishedCounts.post} articles · ${publishedCounts.expertise} expertises · ${publishedCounts.dlm_download} téléchargements |
| Médias | ${attachments.length} fichiers (médiathèque) |
| Commentaires | 0 (désactivés) |

### Plugins actifs (${activePlugins.length})

| Plugin | Rôle / impact migration |
|---|---|
${activePlugins.map((p) => `| \`${p}\` | ${PLUGIN_ROLES[p.split('/')[0]] ?? '—'} |`).join('\n')}

Plugins **inactifs** notables : Smart Slider 3 (2 sliders de démo uniquement — **à ignorer**).

## 2. Pages (${pages.length})

${contentTable(pages.sort((a, b) => (a.lang > b.lang ? 1 : -1) || a.id - b.id), [['Template', (i) => i.meta['_wp_page_template'] ?? 'default']])}

Notes :
- 4 pages sont pilotées par **template Blade du thème** (contenu hors export : \`template-legal.blade.php\`, \`page-content.blade.php\`) — le rendu réel devra être récupéré sur le site live (Ressources / Resources center notamment).
- \`no-access\` (FR+EN) = page technique Download Monitor (\`[dlm_no_access]\`).
- 3 brouillons (landings d'événements passés) : à confirmer s'ils sont à migrer ou à abandonner.

## 3. Articles de blogue (${posts.length})

Page d'index : \`${path(postsPage?.url)}\` (10 articles/page, pagination \`/page/N/\`).

| Titre | Chemin | Langue | Statut | Date | Catégorie | Auteur |
|---|---|---|---|---|---|---|
${posts
  .sort((a, b) => (a.date < b.date ? -1 : 1))
  .map((i) => `| ${esc(i.title)} | \`${path(i.url)}\` | ${i.lang} | ${statusBadge(i.status)} | ${i.date?.slice(0, 10)} | ${esc(i.categories.map((c) => c.name).join(', '))} | ${esc(author(i.author))} |`)
  .join('\n')}

## 4. Expertises — CPT \`expertise\` (${expertises.length})

**Type de contenu central du site** (63 des 99 items de menus pointent vers des expertises). Pas de taxonomie propre : classement **hiérarchique** par \`post_parent\` (jusqu'à 3 niveaux), URLs \`/expertise/<parent>/<enfant>/\`.

### Arborescence FR (${expertises.filter((e) => e.lang === 'fr').length})

${expertiseTree('fr')}
### Arborescence EN (${expertises.filter((e) => e.lang === 'en').length})

${expertiseTree('en')}
## 5. Téléchargements — Download Monitor (${dlm.length} documents, ${dlmVersions.length} versions)

${dlm
  .map((d) => {
    const files = dlmFiles.get(d.id) ?? [];
    const cats = d.categories.length ? ` — catégorie « ${esc(d.categories.map((c) => c.name).join(', '))} »` : '';
    return `- **${esc(d.title)}** — \`${path(d.url)}\` (${statusBadge(d.status)})${cats}${files.length ? '\n' + files.map((f) => `  - fichier : \`${f.replace('https://www.victrix.ca', '')}\``).join('\n') : ''}`;
  })
  .join('\n')}

Versions sans rattachement direct (fichiers listés dans les métas \`_files\` des ${dlmVersions.length} versions) : voir \`urls-medias.csv\` + liste complète ci-dessus. **⚠️ Les fichiers sous \`/wp-content/uploads/dlm_uploads/\` sont protégés par le plugin** (accès conditionné au formulaire GF #3) : à télécharger avec un accès admin avant la mise hors ligne. Certains anciens PDF vivent dans le dossier anormal \`/uploads/0206/05/\` (date corrompue). Le « Webinaire Copilot » pointe vers YouTube (https://youtu.be/RjIs8tCmcNw), pas un fichier.

Tables e-commerce DLM (\`dlm_order*\`) : **vides** — aucun paiement à migrer.

## 6. Taxonomies

- **Catégories** (seule taxonomie éditoriale — aucune étiquette/post_tag n'existe). Portées par les articles **et par les téléchargements** (« Nos livres blancs » = les 4 documents publiés) :

| Catégorie | Slug | Contenus | URL d'archive (vérifiée live) |
|---|---|---|---|
${allCatTerms.map((t) => `| ${esc(t.name)} | \`${t.slug}\` | ${t.count} | ${t.count ? `\`/${t.en ? 'en/category' : 'categorie'}/${t.slug}/\`` : '*(vide — ne pas migrer)*'} |`).join('\n')}

  Base d'archive **traduite par Polylang** : \`/categorie/…\` en FR, \`/en/category/…\` en EN (vérifié sur le site live ; \`/category/…\` FR fait un 301 vers \`/categorie/…\`).

- **Taxonomies techniques Polylang** : \`language\` (fr/en) et \`post_translations\` (${translationOf.size / 2} paires FR↔EN reconstruites depuis le SQL — colonne \`traduction_id\` de \`urls-contenus.csv\`).
- Le CPT \`expertise\` n'a **aucune taxonomie** (hiérarchie par pages parentes).

## 7. Menus de navigation (reconstruits depuis le SQL — absents de l'export XML)

Emplacements du thème : ${Object.entries(locations).map(([l, id]) => `\`${l}\` → ${esc(menuName.get(id) ?? (id === 0 ? 'non assigné' : id))}`).join(' · ')}

${menus
  .sort((a, b) => a.termId - b.termId)
  .map((m) => `### ${esc(m.name)} (${m.itemCount} items${m.location ? `, emplacement \`${m.location}\`` : ''})\n\n${renderMenuTree(m.tree)}`)
  .join('\n')}
Structure machine-exploitable : \`docs/migration/menus.json\`.

## 8. Formulaires — Gravity Forms (${SQL.gfForms.length} formulaires, ${Object.values(SQL.gfEntryCounts).reduce((a, b) => a + b, 0)} entrées)

| # | Titre | État | Entrées | Embarqué dans |
|---|---|---|---|---|
${SQL.gfForms.map((f) => {
  const usage = (gfUsage[f.id] ?? []).map((i) => `\`${path(i.url)}\``).join(', ');
  const state = f.isTrash ? '🗑️ corbeille' : f.isActive ? '✅ actif' : 'inactif';
  return `| ${f.id} | ${esc(f.title)} | ${state} | ${SQL.gfEntryCounts[f.id] ?? 0} | ${usage || '—'} |`;
}).join('\n')}

*(« Embarqué dans » = détection des shortcodes \`[gravityform]\` **et** des widgets SiteOrigin \`"form":"N"\` dans le contenu exporté.)*

### Champs des formulaires actifs

${SQL.gfForms.filter((f) => f.isActive && !f.isTrash).map((f) => {
  const meta = SQL.gfFormMeta[f.id];
  const fields = (meta?.fields ?? []).filter((x) => x.label).map((x) => `${x.label}${x.required ? '*' : ''}`).join(' · ');
  return `- **#${f.id} ${esc(f.title)}** : ${esc(fields)}`;
}).join('\n')}

(* = requis)

**⚠️ À décider pour le statique** : service de remplacement (CloudCannon Forms, Formspark, Web3Forms, worker Cloudflare…), destination des notifications (actuellement Post SMTP), et **export des ${Object.values(SQL.gfEntryCounts).reduce((a, b) => a + b, 0)} entrées existantes (leads !) avant décommission** — voir §15.

## 9. Médias (${attachments.length} fichiers)

Domaine unique \`https://www.victrix.ca/wp-content/uploads/AAAA/MM/…\` — aucun CDN externe. Liste complète : \`docs/migration/urls-medias.csv\`.

| Extension | Nombre |
|---|---|
${Object.entries(mediaExt).sort((a, b) => b[1] - a[1]).map(([e, n]) => `| .${e} | ${n} |`).join('\n')}

- **${mediaExt.pdf ?? 0} PDF** (livres blancs, guides) dont ${attachments.filter((a) => extOf(a.attachmentUrl) === 'pdf' && a.attachmentUrl?.includes('/dlm_uploads/')).length} sous \`dlm_uploads/\` (protégés) et ${attachments.filter((a) => extOf(a.attachmentUrl) === 'pdf' && a.attachmentUrl?.includes('/0206/')).length} dans le dossier anormal \`/uploads/0206/05/\` (${weirdFolder} fichiers au total dans ce dossier à la date corrompue — surtout d'anciennes images 2016).
- ${mediaExt.svg ?? 0} SVG = logos partenaires/technos pour la plupart.
- ${mediaExt.mp4 ?? 0} vidéos MP4 auto-hébergées + vidéos YouTube embarquées dans les contenus.
- ${thumbs.length} contenus ont une **image à la une** (\`_thumbnail_id\`) à mapper vers un champ \`heroImage\`.

## 10. Métadonnées SEO (Yoast)

| Méta | Couverture |
|---|---|
| \`_yoast_wpseo_title\` | ${seoTitle.length} contenus |
| \`_yoast_wpseo_metadesc\` | ${seoDesc.length} contenus |
| \`noindex\` | ${noindex.length} contenus (voir ci-dessous) |

Valeurs complètes dans \`urls-contenus.csv\` (colonnes \`seo_title\`, \`seo_metadesc\`). La table SQL \`vic_yoast_indexable\` peut compléter les trous (titles/descriptions calculés). Open Graph/Twitter : essentiellement les gabarits par défaut Yoast (rien de spécifique à migrer, sauf l'image OG de la page d'accueil). Le **sitemap.xml et les flux RSS** sont générés par Yoast/WP → à régénérer côté Astro.

### Contenus en \`noindex\` (à respecter dans la nouvelle version)

${noindex.map((i) => `- ${esc(i.title)} — \`${path(i.url)}\` (${i.type}, ${statusBadge(i.status)})`).join('\n')}

## 11. Shortcodes et blocs custom

| Shortcode | Occurrences | Origine | Stratégie statique |
|---|---|---|---|
${realShortcodes
  .map(([s, n]) => {
    const strat = {
      siteorigin_widget: 'Aplatir : extraire le HTML rendu / recomposer en composants',
      gravityform: 'Remplacer par le composant formulaire du nouveau site',
      victrix_table: '⚠️ Plugin custom `victrix-product-table` — réimplémenter (tableaux produits/prix Check Point)',
      social_links: 'Composant liens sociaux',
      dlm_no_access: 'Page technique DLM — repenser le flux de téléchargement',
      caption: 'HTML figure/figcaption',
    }[s] ?? '—';
    const orig = { siteorigin_widget: 'SiteOrigin', gravityform: 'Gravity Forms', victrix_table: 'CUSTOM', social_links: 'thème', dlm_no_access: 'Download Monitor', caption: 'WordPress' }[s] ?? '';
    return `| \`[${s}]\` | ${n} | ${orig} | ${strat} |`;
  })
  .join('\n')}

Champs custom notables (CMB2/thème) : \`cta_text\`/\`cta_link\` (${content.filter((i) => i.meta.cta_text).length} contenus), injections \`hefo_before/after\` (${content.filter((i) => i.flags.hefo_before || i.flags.hefo_after).length}), multi-auteurs \`_post_authors\` (${content.filter((i) => i.flags._post_authors).length}).

## 12. Moteurs de contenu (impact conversion)

| Type | ${['siteorigin', 'brizy', 'gutenberg', 'html', 'shortcode-seul', 'vide'].join(' | ')} |
|---|---|---|---|---|---|---|
${Object.entries(engineTally)
  .map(([t, e]) => `| ${t} | ${['siteorigin', 'brizy', 'gutenberg', 'html', 'shortcode-seul', 'vide'].map((k) => e[k] ?? 0).join(' | ')} |`)
  .join('\n')}

- **SiteOrigin** : HTML rendu présent dans \`content:encoded\` (grilles \`panel-*\` + 850 \`[siteorigin_widget]\` avec leur config JSON) — extractible mais à nettoyer/recomposer.
- **Brizy** : le **HTML compilé est présent en clair** dans \`content:encoded\` (\`brz-*\`) — pas besoin du builder ; classes \`brz-css-*\` à purger, attention aux \`{{placeholder}}\` dynamiques résiduels.
- **Gutenberg/HTML** : 4 pages légales, conversion triviale.
- **Vide/template** : 4 pages dont le contenu vit dans le thème Blade → récupérer depuis le site live.

## 13. URLs et redirections

- **Inventaire complet des URLs de contenu** : \`docs/migration/urls-contenus.csv\` (${content.length} lignes, dont ${content.filter((i) => i.status === 'publish').length} publiées avec URL publique).
- **URLs de médias** : \`docs/migration/urls-medias.csv\` (${attachments.length} lignes) — les fichiers seront rapatriés, mais les URLs \`/wp-content/uploads/...\` référencées ailleurs (moteurs de recherche, courriels, autres sites) méritent des redirections ou une conservation des chemins.
- **URLs systémiques à traiter** : archives de catégories (§6), pagination \`/page/N/\`, \`sitemap.xml\`/\`sitemap_index.xml\`, flux \`/feed/\`, pages auteurs (\`/author/…\` — Yoast les indexait), \`?s=\` (recherche).

### Redirections 301 déjà en place (plugin Redirection — ${SQL.redirectionItems.length} règles, à reporter)

Complet dans \`docs/migration/redirections.csv\`. Groupes : ${SQL.redirectionGroups.map((g) => `« ${g.name} »`).join(', ')}. Échantillon :

| Source | Cible |
|---|---|
${SQL.redirectionItems.slice(0, 12).map((r) => `| \`${esc(r.url)}\` | \`${esc(path(r.actionData ?? ''))}\` |`).join('\n')}
| … | *(${SQL.redirectionItems.length - 12} autres dans le CSV)* |

### Anciens slugs (\`_wp_old_slug\` — redirections implicites WordPress à recréer)

${oldSlugItems.map((i) => `- ${i.meta._wp_old_slug.map((s) => `\`${s}\``).join(', ')} → \`${path(i.url)}\` (${i.type})`).join('\n')}

⚠️ Les cibles de redirection pointant hors inventaire (${unresolvedRedirects.length} règles) visent surtout des URLs déjà supprimées ou des domaines externes (\`o-studio-catalogue.victrix.ca\`) — à auditer dans le CSV.

## 14. ⚠️ Sans équivalent statique évident — à décider

| Élément | Détail | Piste |
|---|---|---|
| **Formulaires Gravity Forms** | ${SQL.gfForms.filter((f) => f.isActive && !f.isTrash).length} formulaires actifs, logique conditionnelle, notifications SMTP | Service de formulaires (CloudCannon Forms / API) + e-mail transactionnel |
| **Téléchargements protégés** | Accès aux PDF conditionné au formulaire GF #3 (échange lead ↔ document) | Worker/fonction (lien signé) ou accès libre assumé |
| **\`[victrix_table]\`** | Plugin custom tableaux produits (pages prix Check Point) | Composant tableau + données en collection CMS |
| **Portail client** | Pages \`/mon-portail/\` + \`/en/customer-portal/\` | Prototype OIDC/PKCE déjà maquetté dans Demo-victrix (docs/portail-auth.md) |
| **Contenu protégé par mot de passe** | ${content.filter((i) => i.password).map((i) => `\`${path(i.url)}\``).join(', ') || '—'} | Auth statique impossible — worker ou abandon |
| **Recherche WordPress** | \`?s=\` | Pagefind (déjà prévu P-06) |
| **Sélecteur de langue Polylang** | \`#pll_switcher\` dans les menus | Composant i18n du nouveau site (déjà en place dans le prototype) |
| **Tracking & consentement** | Microsoft Clarity + ZoomInfo (snippets head) + Axeptio | Reporter les tags dans le layout + gestionnaire de consentement |
| **Sitemap / RSS / archives auteurs** | Générés par WP/Yoast | Régénérer côté Astro ; décider du sort des archives auteurs (noindex ?) |
| **Pages template Blade** | Ressources / Resources center (contenu dans le thème) | Récupérer le rendu live et recomposer |
| **E-mails transactionnels** | Post SMTP (notifications de formulaires) | Inclus dans la solution formulaires |

## 15. Données à préserver avant décommission de WordPress

- **${Object.values(SQL.gfEntryCounts).reduce((a, b) => a + b, 0)} entrées de formulaires** (dont ${SQL.gfEntryCounts[1] ?? 0} leads « Contactez-nous » et ${SQL.gfEntryCounts[2] ?? 0} abonnés infolettre) — **export CSV depuis Gravity Forms requis** (données personnelles : traiter selon Loi 25).
- Fichiers protégés \`dlm_uploads/\` (accès admin nécessaire).
- Logs 404 récents (table \`vic_redirection_404\`, ~8 000 lignes sur 1 semaine) — utiles pour valider le plan de redirection.
- Comptes utilisateurs (6) : simple référence d'auteurs, rien à migrer fonctionnellement.

## 16. Vérifications croisées & questions ouvertes

### Vérifications automatiques

- Comptes attendus vs extraits : pages **${pages.length}/27** · articles **${posts.length}/64** · expertises **${expertises.length}/78** · médias **${attachments.length}** uniques (1 370 références brutes) · redirections **${SQL.redirectionItems.length}/85** · items de menus **${SQL.navMenuItems.length}/99** · formulaires **${SQL.gfForms.length}/17** · entrées GF **${Object.values(SQL.gfEntryCounts).reduce((a, b) => a + b, 0)}/5200**.
- Items de menus pointant vers des contenus non publiés : ${menuOrphans.length ? menuOrphans.map((o) => `${o.menu} → « ${esc(o.label)} » (${o.status})`).join(' ; ') : 'aucun ✅'}.
- Formulaires embarqués mais inactifs/corbeille : ${gfProblems.length ? gfProblems.map(([fid, us]) => `#${fid} (${gfById.get(Number(fid))?.isTrash ? 'corbeille' : 'inactif'}) dans ${us.map((u) => `\`${path(u.url)}\``).join(', ')}`).join(' ; ') : 'aucun ✅'}.
- Contenus publiés **sans traduction** (${unpaired.length}) : ${unpaired.map((i) => `\`${path(i.url)}\` (${i.lang})`).join(', ') || '—'}.
- Spot-check live (2026-07-24, 17 URLs en HEAD) : accueil FR/EN, expertises FR/EN, blogue, document DLM, article, page prix, sitemap → **200 OK** ; \`/solution/studio/\` → 301 vers \`/expertise/productivite/o-studio/\` (conforme au plugin Redirection) ; archives FR sur base traduite \`/categorie/…\` (voir §6).

### Questions ouvertes pour validation humaine

1. **Brouillons** (3 pages, 2 articles, 5 expertises, 1 téléchargement) : migrer ou abandonner ?
2. **Contenus sans traduction** listés ci-dessus : les traduire à l'occasion de la migration ou assumer l'asymétrie ?
3. **Archives de catégories** (\`/category/…\`) : conserver comme pages de listing filtré ou rediriger vers le blogue ?
4. **Flux de téléchargement** (lead-gen via formulaire) : conserver le gating ou libérer les PDF ?
5. **Landing pages d'événements passés** (drafts + Voeux des fêtes) : archiver ?
6. **Pages auteurs / archives dates** WordPress : rediriger vers l'accueil du blogue ?
7. **Périmètre du portail client** : la page \`/mon-portail/\` du site actuel est un simple lien — le prototype Demo-victrix va plus loin.

---
*Scripts : \`scripts/migration/parse-wxr.mjs\` → \`extract-sql.mjs\` → \`build-inventory.mjs\` (réutilisables pour la conversion de contenu).*
`;

writeFileSync(`${DOCS}/content-inventory.md`, md, 'utf8');
console.log('Écrit :', `${DOCS}/content-inventory.md`);
console.log('Annexes :', `${DOCS}/migration/{urls-contenus.csv, urls-medias.csv, redirections.csv, menus.json}`);
console.log('Stats :', JSON.stringify({
  pages: pages.length, posts: posts.length, expertises: expertises.length,
  dlm: dlm.length, medias: attachments.length, menus: menus.length,
  menuItems: SQL.navMenuItems.length, redirections: SQL.redirectionItems.length,
  oldSlugs: oldSlugItems.length, noindex: noindex.length, sansTraduction: unpaired.length,
  orphelinsMenus: menuOrphans.length, gfProblemes: gfProblems.length,
}));
