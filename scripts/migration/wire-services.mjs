#!/usr/bin/env node
/**
 * wire-services.mjs — BRANCHE les services de la zone de staging
 * (docs/migration/staging/services) dans la collection live
 * (src/content/services). Étape « câblage » de la Phase 6, pendant services
 * de wire-blog.mjs.
 *
 * Décisions utilisateur (session 2026-07-29) appliquées par défaut :
 *  - PAIRES COMPLÈTES PUBLIÉES SEULEMENT : brouillons (transition.draft) et
 *    entrées sans traduction restent en staging (--include-drafts /
 *    --include-untranslated pour élargir) ; la page test
 *    (conseil-strategique-test) est toujours écartée ;
 *  - URLs sous /services/ (préfixe actuel) — les 301 depuis /expertise/* sont
 *    DEUX règles génériques dans src/data/redirects.json (voir plus bas) : ce
 *    script VÉRIFIE pour chaque entrée branchée que l'ancien chemin WP se
 *    conserve tel quel sous le nouveau préfixe (hypothèse du :splat) et
 *    signale toute exception qui exigerait une règle explicite.
 *
 * Appariement : chemin de fichier homonyme fr/↔en/ (convention du dépôt),
 * avec REPLI par transition.translationGroup (Polylang) — un EN apparié par
 * groupe à un chemin FR différent est REPOSITIONNÉ sous le chemin FR
 * (l'appariement par fichier homonyme est ce que consomment la route et le
 * rapport i18n), son URL anglaise étant préservée par `slug`.
 *
 * Transformations (le staging reste INTACT — source rejouable) :
 *  - NETTOYAGE des échappements doublés hérités du moissonnage SiteOrigin
 *    (12 fichiers) : séquences LITTÉRALES « \n » → espace et « \" » → « " »
 *    dans toutes les chaînes (elles s'affichaient telles quelles sur la page) ;
 *  - `slug` : sous-chemin d'URL dérivé de transition.wpUrl quand il diffère du
 *    chemin de fichier (fichiers EN surtout) ;
 *  - `seoTitle` : repris de transition.seoTitle, suffixe « | Victrix » retiré ;
 *  - bloc `transition` RETIRÉ des fichiers branchés (l'éditeur CloudCannon
 *    l'afficherait) — son contenu est PRÉSERVÉ dans le manifeste
 *    manifest-branchement.json (redirections Phase 2, passe éditoriale) ;
 *  - fr|en/intelligence-artificielle.json SAUTÉS (entrées live curées P-07).
 *
 * Sécurité : refuse d'écraser un fichier existant sans --force.
 *
 * Usage :
 *   node scripts/migration/wire-services.mjs
 *     [--in docs/migration/staging/services] [--out src/content/services]
 *     [--include-drafts] [--include-untranslated] [--force] [--dry-run]
 *
 * Rapport : docs/migration/staging/services/rapport-branchement.md
 * Manifeste : docs/migration/staging/services/manifest-branchement.json
 */
import { readdirSync, readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';

const args = process.argv.slice(2);
const has = (f) => args.includes(f);
const getArg = (name, def) => {
  const i = args.indexOf(name);
  return i >= 0 && args[i + 1] ? args[i + 1] : def;
};
const IN_DIR = getArg('--in', 'docs/migration/staging/services');
const OUT_DIR = getArg('--out', 'src/content/services');
const INCLUDE_DRAFTS = has('--include-drafts');
const INCLUDE_UNTRANSLATED = has('--include-untranslated');
const FORCE = has('--force');
const DRY = has('--dry-run');

// Entrées curées vivantes (P-07) — le staging ne les écrase jamais.
const CURATED = new Set(['fr/intelligence-artificielle', 'en/intelligence-artificielle']);
// Pages test — jamais branchées.
const TEST_PAGES = new Set(['fr/conseil-strategique-test']);

// --- Lecture récursive du staging -------------------------------------------
/** @returns {{locale:string, relPath:string, data:any}[]} */
function readTree(locale) {
  const out = [];
  const walk = (dir, prefix) => {
    let entries;
    try {
      entries = readdirSync(join(IN_DIR, locale, dir), { withFileTypes: true });
    } catch {
      return;
    }
    for (const e of entries) {
      if (e.isDirectory()) walk(join(dir, e.name), `${prefix}${e.name}/`);
      else if (e.name.endsWith('.json')) {
        const relPath = `${prefix}${e.name.replace(/\.json$/, '')}`;
        const data = JSON.parse(readFileSync(join(IN_DIR, locale, dir, e.name), 'utf8'));
        out.push({ locale, relPath, data });
      }
    }
  };
  walk('', '');
  return out;
}
const entries = { fr: readTree('fr'), en: readTree('en') };

// --- Appariement : chemin homonyme, repli translationGroup ------------------
const byPath = { fr: new Map(), en: new Map() };
const byGroup = { fr: new Map(), en: new Map() };
for (const locale of ['fr', 'en'])
  for (const e of entries[locale]) {
    byPath[locale].set(e.relPath, e);
    const g = e.data.transition?.translationGroup;
    if (g) byGroup[locale].set(g, e);
  }

/** Contrepartie d'une entrée (ou null) + repositionnement éventuel. */
function counterpartOf(e) {
  const other = e.locale === 'fr' ? 'en' : 'fr';
  return (
    byPath[other].get(e.relPath) ??
    (e.data.transition?.translationGroup
      ? (byGroup[other].get(e.data.transition.translationGroup) ?? null)
      : null)
  );
}

/**
 * Nettoyage récursif des échappements doublés du moissonnage SiteOrigin :
 * les chaînes contiennent des séquences LITTÉRALES backslash-n / backslash-"
 * (JSON mal échappé à la source) qui s'affichent telles quelles sur la page.
 * `\n` → espace (texte de paragraphe — un saut de ligne HTML n'y ferait rien),
 * `\"` → `"`, espaces multiples repliés.
 */
function cleanEscapes(value, touched) {
  if (typeof value === 'string') {
    const cleaned = value
      .replace(/\\n/g, ' ')
      .replace(/\\"/g, '"')
      .replace(/ {2,}/g, ' ')
      .trim();
    if (cleaned !== value) touched.flag = true;
    return cleaned;
  }
  if (Array.isArray(value)) return value.map((v) => cleanEscapes(v, touched));
  if (value && typeof value === 'object')
    return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, cleanEscapes(v, touched)]));
  return value;
}

/** Slug d'URL dérivé de wpUrl (/`en/`?expertise/<chemin>/) — null si non dérivable. */
function slugFromWpUrl(wpUrl, locale) {
  if (!wpUrl) return null;
  const m = wpUrl.match(locale === 'en' ? /^\/en\/expertise\/(.+?)\/?$/ : /^\/expertise\/(.+?)\/?$/);
  return m ? m[1] : null;
}

const stats = {
  wired: [],
  drafts: [],
  untranslated: [],
  testPages: [],
  curated: [],
  skippedExisting: [],
  repositioned: [],
  splatMismatch: [],
  quasiEmpty: [],
  cleanedEscapes: [],
};
const manifest = [];

for (const locale of ['fr', 'en']) {
  for (const e of entries[locale]) {
    const id = `${locale}/${e.relPath}`;
    if (CURATED.has(id)) {
      stats.curated.push(id);
      continue;
    }
    if (TEST_PAGES.has(id)) {
      stats.testPages.push(id);
      continue;
    }
    const t = e.data.transition ?? {};
    const pair = counterpartOf(e);
    if (t.draft === true && !INCLUDE_DRAFTS) {
      stats.drafts.push(id);
      continue;
    }
    if (!pair && !INCLUDE_UNTRANSLATED) {
      stats.untranslated.push(id);
      continue;
    }
    // Symétrie « paires complètes publiées » : contrepartie en brouillon →
    // la paire entière reste en staging.
    if (pair && pair.data.transition?.draft === true && !INCLUDE_DRAFTS) {
      stats.drafts.push(`${id} (paire ${pair.locale}/${pair.relPath} en brouillon)`);
      continue;
    }

    // Chemin de destination : TOUJOURS le chemin FR de la paire (convention
    // d'appariement par fichier homonyme). Un EN apparié par groupe à un
    // chemin différent est repositionné.
    const frPath = locale === 'fr' ? e.relPath : (pair?.locale === 'fr' ? pair.relPath : e.relPath);
    if (locale === 'en' && frPath !== e.relPath) stats.repositioned.push(`${id} → en/${frPath}`);

    // Slug d'URL : dérivé de wpUrl ; posé seulement s'il diffère du chemin de
    // fichier de destination (FR : normalement identique → pas de champ).
    const derived = slugFromWpUrl(t.wpUrl, locale);
    const slug = derived && derived !== frPath ? derived : undefined;

    // Vérification de l'hypothèse :splat des 301 génériques — l'ancien chemin
    // WP doit se conserver TEL QUEL sous /services/. Une entrée sans wpUrl
    // dérivable (brouillon WP sans permalien) est signalée aussi.
    const finalSlug = slug ?? frPath;
    if (!derived) stats.splatMismatch.push(`${id} : wpUrl non dérivable (${t.wpUrl ?? 'absent'})`);
    else if (derived !== finalSlug)
      stats.splatMismatch.push(`${id} : ${t.wpUrl} ≠ /services/${finalSlug} — règle explicite requise`);

    // Fichier branché : staging moins `transition`, plus slug/seoTitle,
    // chaînes nettoyées des échappements doublés.
    const touched = { flag: false };
    const wired = cleanEscapes({ ...e.data }, touched);
    if (touched.flag) stats.cleanedEscapes.push(id);
    delete wired.transition;
    if (slug) wired.slug = slug;
    if (t.seoTitle) wired.seoTitle = t.seoTitle.replace(/\s*\|\s*Victrix\s*$/, '');

    if ((wired.sections ?? []).length <= 1) stats.quasiEmpty.push(id);

    manifest.push({
      id: `${locale}/${frPath}`,
      urlSlug: finalSlug,
      wpUrl: t.wpUrl ?? null,
      seoTitle: t.seoTitle ?? null,
      translationGroup: t.translationGroup || null,
      imagesNonPlacees: t.imagesNonPlacees ?? [],
      formIds: t.formIds ?? [],
    });

    const dest = join(OUT_DIR, locale, `${frPath}.json`);
    if (existsSync(dest) && !FORCE) {
      stats.skippedExisting.push(id);
      continue;
    }
    if (!DRY) {
      mkdirSync(dirname(dest), { recursive: true });
      writeFileSync(dest, JSON.stringify(wired, null, 2) + '\n', 'utf8');
    }
    stats.wired.push(`${id}${slug ? ` (slug: ${slug})` : ''}`);
  }
}

// --- Rapport + manifeste -----------------------------------------------------
const lines = [];
const w = (s = '') => lines.push(s);
w('# Rapport de branchement — services (staging → src/content/services)');
w();
w(`> Généré par \`scripts/migration/wire-services.mjs\`${DRY ? ' (DRY-RUN — rien écrit)' : ''}.`);
w(`> Politique : paires complètes publiées seulement${INCLUDE_DRAFTS ? ' + brouillons' : ''}${INCLUDE_UNTRANSLATED ? ' + non-traduits' : ''}. URLs sous /services/ (301 génériques /expertise/* → voir src/data/redirects.json).`);
w();
const section = (title, items) => {
  w(`## ${title} (${items.length})`);
  w();
  for (const f of items) w(`- ${f}`);
  w();
};
section('Branchés', stats.wired);
section('Écartés — brouillons (restent en staging)', stats.drafts);
section('Écartés — sans traduction (restent en staging)', stats.untranslated);
section('Écartés — pages test', stats.testPages);
section('Sautés — entrées live curées (P-07)', stats.curated);
if (stats.skippedExisting.length)
  section('⚠️ Non écrits — fichier déjà présent (relancer avec --force pour écraser)', stats.skippedExisting);
section('Repositionnés sous le chemin FR (appariement par groupe Polylang)', stats.repositioned);
section('⚠️ Hors hypothèse :splat des 301 génériques', stats.splatMismatch);
section('Quasi vides (≤ 1 section — passe éditoriale à prioriser)', stats.quasiEmpty);
section('Échappements doublés nettoyés (\\n, \\" littéraux du moissonnage)', stats.cleanedEscapes);

if (!DRY) {
  writeFileSync(join(IN_DIR, 'rapport-branchement.md'), lines.join('\n') + '\n', 'utf8');
  writeFileSync(
    join(IN_DIR, 'manifest-branchement.json'),
    JSON.stringify(manifest, null, 2) + '\n',
    'utf8',
  );
}
console.log(
  `Branchés : ${stats.wired.length} | brouillons : ${stats.drafts.length} | sans traduction : ${stats.untranslated.length} | test : ${stats.testPages.length} | curés sautés : ${stats.curated.length}`,
);
if (stats.splatMismatch.length)
  console.log(`⚠️ ${stats.splatMismatch.length} entrée(s) hors hypothèse :splat — voir le rapport.`);
if (stats.skippedExisting.length && !FORCE)
  console.log('⚠️ Cibles existantes non écrasées — relancer avec --force au besoin.');
