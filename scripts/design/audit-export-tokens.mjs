#!/usr/bin/env node
/**
 * audit-export-tokens.mjs — Audit des écarts entre un export Figma (plugin
 * Tailwind, format v3 : Play CDN + `tailwind.config` inline) et les tokens du
 * repo (Tailwind v4 CSS-first : `@theme` de src/styles/theme.css) + les
 * variables legacy de src/styles/tokens.css (risque de collision @layer).
 *
 * Rejouable pour chaque futur export livré par l'équipe design.
 *
 * Usage :
 *   node scripts/design/audit-export-tokens.mjs
 *     [--export "C:/Repo/Victrix/Design/Maquette & Front End/Export - Homepage"]...
 *     [--html "docs/design/Export HTML/Accueil.html"]...
 *     [--design "docs/design/Design system/VictrixModernWeb-DesignSystenm.md"]
 *     [--out docs/design/audit-tokens-figma.md]
 *   (--export et --html sont répétables ; défaut = la livraison FINALE
 *   2026-08-04 si docs/design/Export HTML existe — 5 exports HTML plats + UN
 *   design system partagé — sinon les deux anciens dossiers Export - *)
 *
 * Sources croisées, par export :
 *  - code.html   : blob `tailwind.config = {...}` (palette générée, spacing,
 *                  fontSize sémantiques, radii) + classes RÉELLEMENT utilisées
 *                  dans le markup (un token défini mais jamais utilisé n'a pas
 *                  le même poids qu'un token porteur du rendu) ;
 *  - DESIGN.md   : frontmatter YAML (tokens machine) + hex de la prose (charte
 *                  rédigée) — les DEUX peuvent se contredire, et se contredire
 *                  avec code.html : ces conflits sont des CONSTATS à documenter,
 *                  pas à résoudre en silence.
 *
 * Sections du rapport :
 *  1. Équivalents (renommés)  — même valeur, nom différent dans theme.css ;
 *  2. Manquants dans theme.css — à couvrir par theme-semantique.css (A2) ;
 *  3. Valeurs en conflit       — incohérences internes de l'export ;
 *  4. Collisions legacy        — noms sémantiques dont la variable @theme v4
 *     (--color-*, --radius-*, …) existe déjà NON-COUCHÉE dans tokens.css : la
 *     variable legacy gagnerait EN SILENCE sur @layer theme (danger Phase 5).
 */
import { readFileSync, writeFileSync, mkdirSync, existsSync, readdirSync } from 'node:fs';
import { join, dirname, basename } from 'node:path';

const args = process.argv.slice(2);
const exportDirs = [];
const htmlFiles = [];
for (let i = 0; i < args.length; i++) {
  if (args[i] === '--export' && args[i + 1]) exportDirs.push(args[++i]);
  if (args[i] === '--html' && args[i + 1]) htmlFiles.push(args[++i]);
}
const getArg = (name, def) => {
  const i = args.indexOf(name);
  return i >= 0 && args[i + 1] ? args[i + 1] : def;
};
const OUT = getArg('--out', 'docs/design/audit-tokens-figma.md');
// Livraison finale (2026-08-04) : exports HTML PLATS + un design system
// PARTAGÉ (l'ancien format = un dossier par export avec son DESIGN.md).
if (exportDirs.length === 0 && htmlFiles.length === 0) {
  const finalDir = 'docs/design/Export HTML';
  if (existsSync(finalDir)) {
    for (const f of readdirSync(finalDir))
      if (f.endsWith('.html')) htmlFiles.push(join(finalDir, f));
  } else {
    const base = 'C:/Repo/Victrix/Design/Maquette & Front End';
    exportDirs.push(`${base}/Export - Homepage`, `${base}/Export - expertise-productivite`);
  }
}
const sharedMd = htmlFiles.length
  ? readFileSync(getArg('--design', 'docs/design/Design system/VictrixModernWeb-DesignSystenm.md'), 'utf8')
  : null;

// ---------------------------------------------------------------------------
// Parseurs
// ---------------------------------------------------------------------------

/** Blob `tailwind.config = {...}` de code.html (objet JS, pas JSON strict).
 *  Fichier local de confiance (livrable design) → évaluation directe. */
function parseInlineConfig(html) {
  const m = html.match(/tailwind\.config\s*=\s*(\{[\s\S]*?\});?\s*<\/script>/);
  if (!m) throw new Error('blob tailwind.config introuvable dans code.html');
  return new Function(`return (${m[1]})`)();
}

/** Frontmatter YAML de DESIGN.md — sous-ensemble suffisant : maps imbriquées
 *  par indentation, valeurs scalaires (pas de listes dans ce format). */
function parseFrontmatter(md) {
  const m = md.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!m) throw new Error('frontmatter introuvable dans DESIGN.md');
  const root = {};
  const stack = [{ indent: -1, node: root }];
  for (const raw of m[1].split(/\r?\n/)) {
    if (!raw.trim() || raw.trim().startsWith('#')) continue;
    const indent = raw.length - raw.trimStart().length;
    const line = raw.trim();
    const kv = line.match(/^([^:]+):\s*(.*)$/);
    if (!kv) continue;
    const key = kv[1].trim();
    let value = kv[2].trim();
    while (stack[stack.length - 1].indent >= indent) stack.pop();
    const parent = stack[stack.length - 1].node;
    if (value === '') {
      parent[key] = {};
      stack.push({ indent, node: parent[key] });
    } else {
      parent[key] = value.replace(/^['"]|['"]$/g, '');
    }
  }
  return root;
}

/** Variables d'un fichier CSS : { nom (sans --) : valeur }. */
function parseCssVars(css) {
  const vars = {};
  for (const m of css.matchAll(/--([\w-]+)\s*:\s*([^;]+);/g)) vars[m[1]] = m[2].trim();
  return vars;
}

/** Hex mentionnés dans la prose de DESIGN.md (hors frontmatter). */
function proseHexes(md) {
  const prose = md.replace(/^---[\s\S]*?---/, '');
  const out = new Map(); // hex → contexte (bout de phrase)
  for (const m of prose.matchAll(/([^.\n]*?)(#[0-9a-fA-F]{6})\b/g)) {
    const hex = m[2].toLowerCase();
    if (!out.has(hex)) out.set(hex, m[1].trim().slice(-60));
  }
  return out;
}

/** Classes utilisées dans le markup (attributs class="…"), et les racines de
 *  tokens qu'elles consomment (couleurs, spacing, text-*, font-*, rounded-*). */
/** Sections de config normalisées (un export peut omettre une section —
 *  divergence signalée dans le rapport, mais l'audit ne doit pas planter). */
const cfgSections = (cfg) => ({
  colors: cfg.theme?.extend?.colors ?? {},
  spacing: cfg.theme?.extend?.spacing ?? {},
  fontSize: cfg.theme?.extend?.fontSize ?? {},
  fontFamily: cfg.theme?.extend?.fontFamily ?? {},
  borderRadius: cfg.theme?.extend?.borderRadius ?? {},
});

function usedTokens(html, cfg) {
  const classes = new Set();
  for (const m of html.matchAll(/class="([^"]+)"/g))
    for (const c of m[1].split(/\s+/)) classes.add(c.replace(/^(dark|hover|focus|group-hover|md|lg|sm|xl):/g, ''));

  const used = { colors: new Set(), spacing: new Set(), text: new Set(), font: new Set(), rounded: new Set() };
  const s = cfgSections(cfg);
  const colorNames = Object.keys(s.colors);
  const spacingNames = Object.keys(s.spacing);
  const textNames = Object.keys(s.fontSize);
  const fontNames = Object.keys(s.fontFamily);
  const radiusNames = Object.keys(s.borderRadius);
  for (const c of classes) {
    for (const n of colorNames)
      if (new RegExp(`^(bg|text|border|ring|fill|stroke|outline|decoration|divide|from|to|via)-${n}(/\\d+)?$`).test(c))
        used.colors.add(n);
    for (const n of spacingNames)
      if (new RegExp(`^-?(p|px|py|pt|pb|pl|pr|m|mx|my|mt|mb|ml|mr|gap|gap-x|gap-y|space-x|space-y|inset|top|bottom|left|right|w|h|size)-${n}$`).test(c))
        used.spacing.add(n);
    for (const n of textNames) if (c === `text-${n}`) used.text.add(n);
    for (const n of fontNames) if (c === `font-${n}`) used.font.add(n);
    for (const n of radiusNames)
      if (c === (n === 'DEFAULT' ? 'rounded' : `rounded-${n}`)) used.rounded.add(n);
  }
  return used;
}

// ---------------------------------------------------------------------------
// Lecture des sources
// ---------------------------------------------------------------------------

const themeVars = parseCssVars(readFileSync('src/styles/theme.css', 'utf8'));
const legacyVars = parseCssVars(readFileSync('src/styles/tokens.css', 'utf8'));

/* Tokens couleur du @theme actuel : { nom : hex } (hex uniquement). */
const themeColors = {};
for (const [k, v] of Object.entries(themeVars))
  if (k.startsWith('color-') && /^#[0-9a-fA-F]{6}$/.test(v)) themeColors[k.slice(6)] = v.toLowerCase();

const exportsData = [
  ...exportDirs.map((dir) => {
    const html = readFileSync(join(dir, 'code.html'), 'utf8');
    const md = readFileSync(join(dir, 'DESIGN.md'), 'utf8');
    const cfg = parseInlineConfig(html);
    return { name: basename(dir), cfg, fm: parseFrontmatter(md), prose: proseHexes(md), used: usedTokens(html, cfg), html, md };
  }),
  ...htmlFiles.map((file) => {
    const html = readFileSync(file, 'utf8');
    const cfg = parseInlineConfig(html);
    return { name: basename(file, '.html'), cfg, fm: parseFrontmatter(sharedMd), prose: proseHexes(sharedMd), used: usedTokens(html, cfg), html, md: sharedMd };
  }),
];

// ---------------------------------------------------------------------------
// Analyses (les DESIGN.md sont identiques entre exports ; les configs peuvent
// différer — on analyse par export et on signale si les configs divergent)
// ---------------------------------------------------------------------------

const lines = [];
const w = (s = '') => lines.push(s);

w('# Audit tokens — exports Figma vs repo (`theme.css` / `tokens.css`)');
w();
w(`> Généré par \`scripts/design/audit-export-tokens.mjs\` — rejouable à chaque nouvel export.`);
w(`> Exports audités : ${exportsData.map((e) => `\`${e.name}\``).join(', ')}.`);
w();

// Fusion des configs (union) + détection des divergences entre exports.
// Un même token défini avec DEUX valeurs différentes selon l'écran est un
// conflit de premier ordre pour un design system.
const divergences = [];
const merged = { colors: {}, spacing: {}, fontSize: {}, fontFamily: {}, borderRadius: {} };
for (const e of exportsData) {
  const s = cfgSections(e.cfg);
  for (const section of Object.keys(merged)) {
    for (const [k, v] of Object.entries(s[section])) {
      const val = section === 'colors' ? String(v).toLowerCase() : v;
      if (k in merged[section]) {
        if (JSON.stringify(merged[section][k]) !== JSON.stringify(val))
          divergences.push(`\`${section}.${k}\` : \`${JSON.stringify(merged[section][k])}\` vs \`${JSON.stringify(val)}\` (${e.name})`);
      } else merged[section][k] = val;
    }
  }
}
if (exportsData.length > 1) {
  const [a, ...rest] = exportsData;
  const sameFm = rest.every((e) => JSON.stringify(e.fm) === JSON.stringify(a.fm));
  const missingSections = exportsData
    .map((e) => {
      const s = cfgSections(e.cfg);
      const miss = Object.keys(merged).filter((k) => Object.keys(s[k]).length === 0 && Object.keys(merged[k]).length > 0);
      return miss.length ? `\`${e.name}\` sans section ${miss.join('/')}` : null;
    })
    .filter(Boolean);
  if (divergences.length === 0 && sameFm && missingSections.length === 0)
    w(`**Constat préalable** : les ${exportsData.length} exports embarquent une config Tailwind et un DESIGN.md **identiques** — système de tokens stable d'un écran à l'autre (bon signe pour le pipeline).`);
  else {
    w(`**⚠️ Constat préalable** : les exports ne sont pas identiques entre eux :`);
    if (!sameFm) w(`- les DESIGN.md diffèrent ;`);
    for (const m of missingSections) w(`- ${m} (l'audit travaille sur l'UNION des configs) ;`);
    for (const d of divergences) w(`- valeur divergente ${d} ;`);
  }
  w();
}

const ex = exportsData[0]; // pour la prose DESIGN.md et le frontmatter
const cfgColors = merged.colors;

// --- 1. Équivalents ---------------------------------------------------------
w('## 1. Équivalents — même valeur, autre nom dans `theme.css`');
w();
w('| Token export (sémantique) | Valeur | Token repo (`theme.css`) |');
w('|---|---|---|');
const matchedThemeColors = new Set();
for (const [name, hex] of Object.entries(cfgColors)) {
  const eq = Object.entries(themeColors).filter(([, v]) => v === hex).map(([k]) => k);
  if (eq.length) {
    eq.forEach((k) => matchedThemeColors.add(k));
    w(`| \`${name}\` | \`${hex}\` | \`--color-${eq.join('`, `--color-')}\` |`);
  }
}
// Radii / ombres / police — correspondances par valeur (frontmatter DESIGN.md).
const fmRounded = ex.fm.rounded ?? {};
for (const [name, val] of Object.entries(fmRounded)) {
  const eq = Object.entries(themeVars).filter(([k, v]) => k.startsWith('radius-') && v === String(val)).map(([k]) => k);
  if (eq.length) w(`| \`rounded-${name}\` (DESIGN.md) | \`${val}\` | \`--${eq.join('`, `--')}\` |`);
}
// Ombres : correspondances propres à l'ANCIEN DESIGN.md — émises seulement si
// la prose auditée les contient encore (la charte finale préfère les couches
// tonales + bordures 1px, ombre hover `0px 4px 20px` à 5 %).
if (ex.md.includes('0 4px 12px')) {
  w('| ombre Level 2 (prose) | `0 4px 12px rgb(0 27 68 / .05)` | `--shadow-ambiante` |');
  w('| ombre Level 3 (prose) | `0 12px 32px rgb(0 27 68 / .1)` | `--shadow-surelevee` |');
}
const famAliases = Object.entries(merged.fontFamily);
const hankenAliases = famAliases.filter(([, v]) => (Array.isArray(v) ? v : [v]).includes('Hanken Grotesk'));
if (hankenAliases.length)
  w(`| \`fontFamily.*\` (Hanken Grotesk ×${hankenAliases.length} alias) | — | \`--font-grotesk\` (un seul token) |`);
w();
const unmatchedTheme = Object.keys(themeColors).filter((k) => !matchedThemeColors.has(k));
if (unmatchedTheme.length)
  w(
    `Tokens couleur de \`theme.css\` **sans équivalent** dans la palette générée de l'export : ` +
      unmatchedTheme.map((k) => `\`--color-${k}\` (\`${themeColors[k]}\`)`).join(', ') +
      ' — voir §3 (conflits).'
  );
w();

// --- 2. Manquants -----------------------------------------------------------
w('## 2. Manquants dans `theme.css` — à couvrir par `theme-semantique.css`');
w();
w('Les tokens marqués **[utilisé]** portent le rendu du markup des exports ;');
w('les autres sont définis par le plugin mais non consommés (palette Material générée).');
w();
const themeHexes = new Set(Object.values(themeColors));
w('### Couleurs');
w('| Token | Valeur | Statut |');
w('|---|---|---|');
const usedColors = new Set(exportsData.flatMap((e) => [...e.used.colors]));
for (const [name, hex] of Object.entries(cfgColors)) {
  if (themeHexes.has(hex)) continue; // déjà en §1
  w(`| \`${name}\` | \`${hex}\` | ${usedColors.has(name) ? '**[utilisé]**' : 'défini seulement'} |`);
}
w();
w('### Échelle d’espacement nommée (absente de `theme.css` — spacing Tailwind par défaut)');
w('| Token | Valeur | Statut |');
w('|---|---|---|');
const usedSpacing = new Set(exportsData.flatMap((e) => [...e.used.spacing]));
for (const [name, val] of Object.entries(merged.spacing))
  w(`| \`${name}\` | \`${val}\` | ${usedSpacing.has(name) ? '**[utilisé]**' : 'défini seulement'} |`);
w();
w('### Échelle typographique sémantique (absente de `theme.css`)');
w('| Token | Taille / interligne / graisse / espacement | Statut |');
w('|---|---|---|');
const usedText = new Set(exportsData.flatMap((e) => [...e.used.text]));
for (const [name, def] of Object.entries(merged.fontSize)) {
  const [size, opts = {}] = def;
  const detail = [size, opts.lineHeight, opts.fontWeight, opts.letterSpacing].filter(Boolean).join(' / ');
  w(`| \`${name}\` | \`${detail}\` | ${usedText.has(name) ? '**[utilisé]**' : 'défini seulement'} |`);
}
w();
w('### Divers');
w('- **Dark mode** : `darkMode: "class"` + classes `dark:` dans le markup — aucune stratégie dark dans le repo (à rendre inerte via `@custom-variant` en A2, décision réelle en Phase 5).');
w('- **Material Symbols** : police d’icônes (Google Fonts dans l’export) — le repo utilise des SVG inline. Auto-hébergement pour le design-lab ; adoption site-wide = décision Phase 5.');
w('- **Plugins Play CDN** : `forms`, `container-queries` — non installés dans le repo (v4 : container queries natifs ; `@tailwindcss/forms` à évaluer seulement si des formulaires arrivent dans un export).');
w();

// --- 3. Conflits ------------------------------------------------------------
w('## 3. Valeurs en conflit — incohérences INTERNES de l’export');
w();
w('À arbitrer avec l’équipe design, pas à résoudre en silence :');
w();
// 3a. Prose vs palette générée
w('| # | Constat | Détail |');
w('|---|---|---|');
let ci = 0;
const paletteHexes = new Set(Object.values(cfgColors));
for (const [hex, ctx] of ex.prose) {
  if (!paletteHexes.has(hex)) {
    const inTheme = Object.entries(themeColors).find(([, v]) => v === hex);
    w(
      `| ${++ci} | \`${hex}\` cité dans la prose du DESIGN.md mais ABSENT de la palette générée | « …${ctx} »${
        inTheme ? ` — le repo l'a pourtant retenu (\`--color-${inTheme[0]}\`)` : ''
      } |`
    );
  }
}
// 3b. Radii code.html vs DESIGN.md
const cfgRadii = merged.borderRadius;
for (const [name, val] of Object.entries(cfgRadii)) {
  const fmVal = fmRounded[name];
  if (fmVal !== undefined && String(fmVal) !== String(val))
    w(`| ${++ci} | Rayon \`${name}\` : \`code.html\` dit \`${val}\`, \`DESIGN.md\` dit \`${fmVal}\` | l'échelle de radii du markup et celle de la charte divergent |`);
}
// 3c. Charte (frontmatter) vs configs des exports — même token, autre valeur.
for (const [name, val] of Object.entries(ex.fm.colors ?? {})) {
  const cfgVal = cfgColors[name];
  if (cfgVal && cfgVal !== String(val).toLowerCase())
    w(`| ${++ci} | Couleur \`${name}\` : la charte (frontmatter) dit \`${val}\`, les exports disent \`${cfgVal}\` | le code et la charte machine divergent |`);
}
for (const [name, val] of Object.entries(ex.fm.spacing ?? {})) {
  const cfgVal = merged.spacing[name];
  if (cfgVal !== undefined && String(cfgVal) !== String(val))
    w(`| ${++ci} | Espacement \`${name}\` : la charte dit \`${val}\`, les exports disent \`${cfgVal}\` | le code et la charte machine divergent |`);
}
for (const [name, def] of Object.entries(ex.fm.typography ?? {})) {
  const cfgDef = merged.fontSize[name];
  if (cfgDef && String(cfgDef[0]) !== String(def.fontSize))
    w(`| ${++ci} | Taille \`${name}\` : la charte dit \`${def.fontSize}\`, les exports disent \`${cfgDef[0]}\` | le code et la charte machine divergent |`);
}
// 3d. Familles de police hors charte (la charte = Hanken Grotesk exclusif).
for (const [alias, v] of famAliases) {
  for (const fam of (Array.isArray(v) ? v : [v]).filter((f) => f !== 'sans-serif' && f !== 'Hanken Grotesk'))
    w(`| ${++ci} | \`fontFamily.${alias}\` déclare \`${fam}\` | famille HORS charte — non chargée par le \`<link>\` des exports (fallback navigateur silencieux) |`);
}
// 3e. Hex des <style> embarqués hors palette générée ET hors prose de la charte.
const styleHexes = new Map(); // hex → export de première occurrence
for (const e of exportsData)
  for (const sm of e.html.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/g))
    for (const hm of sm[1].matchAll(/#[0-9a-fA-F]{6}\b/g)) {
      const hex = hm[0].toLowerCase();
      if (!styleHexes.has(hex)) styleHexes.set(hex, e.name);
    }
for (const [hex, page] of styleHexes)
  if (!paletteHexes.has(hex) && !ex.prose.has(hex))
    w(`| ${++ci} | CSS embarqué de \`${page}\` utilise \`${hex}\` | hex hors palette générée ET hors prose de la charte |`);
w();

// --- 4. Collisions legacy ---------------------------------------------------
w('## 4. Collisions avec `tokens.css` (legacy, non-couché) — danger Phase 5');
w();
w('En Tailwind v4, chaque token `@theme` devient une variable CSS (`--color-*`,');
w('`--radius-*`, `--text-*`, `--spacing-*`, `--font-*`). `tokens.css` définit des');
w('variables de MÊME NOM dans un `:root` **non-couché**, qui gagne silencieusement');
w('contre `@layer theme` : l’utilitaire compile, mais résout vers la valeur legacy.');
w();
w('| Variable @theme v4 (si adoption verbatim) | Valeur export | Valeur legacy (`tokens.css`) |');
w('|---|---|---|');
const candidates = [
  ...Object.keys(cfgColors).map((n) => [`color-${n}`, cfgColors[n]]),
  ...Object.entries(merged.spacing).map(([n, v]) => [`spacing-${n}`, v]),
  ...Object.entries(fmRounded).map(([n, v]) => [n === 'DEFAULT' ? 'radius' : `radius-${n}`, v]),
  ...Object.entries(merged.fontSize).map(([n, d]) => [`text-${n}`, d[0]]),
  ...Object.keys(merged.fontFamily).map((n) => [`font-${n}`, 'Hanken Grotesk']),
];
let collisions = 0;
for (const [name, val] of candidates) {
  if (name in legacyVars) {
    collisions++;
    w(`| \`--${name}\` | \`${val}\` | \`${legacyVars[name]}\` |`);
  }
}
w();
w(`**${collisions} collision(s).** Décision Phase 5 recommandée : renommer ces variables`);
w('legacy dans `tokens.css` + usages (mécanique, vérifiable au grep), puis fusionner');
w('`theme-semantique.css` dans `theme.css`. Alternative écartée : préfixer tous les');
w('tokens sémantiques (chaque futur export exigerait une passe de renommage à vie).');
w();

// --- Verdict pipeline — section MANUELLE, préservée entre les exécutions ----
w('## 5. Verdict pipeline (vérification visuelle du design-lab)');
w();
let verdict = '_À compléter après comparaison `/fr/design-lab` vs `screen.png`._';
try {
  const prev = readFileSync(OUT, 'utf8');
  const kept = prev.match(/## 5\. Verdict pipeline[^\n]*\n\n([\s\S]*?)\s*$/);
  if (kept) verdict = kept[1].trim();
} catch {
  /* premier passage — pas de rapport antérieur */
}
w(verdict);
w();

mkdirSync(dirname(OUT), { recursive: true });
writeFileSync(OUT, lines.join('\n') + '\n', 'utf8');
console.log(`Rapport écrit : ${OUT}`);
console.log(`Exports audités : ${exportsData.map((e) => e.name).join(' | ')}`);
console.log(`Collisions legacy détectées : ${collisions}`);
