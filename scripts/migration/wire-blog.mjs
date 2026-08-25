#!/usr/bin/env node
/**
 * wire-blog.mjs — BRANCHE les articles de la zone de staging
 * (docs/migration/staging/blog) dans la collection live (src/content/blog).
 * Étape « câblage » de la Phase 6 (après revue humaine du staging).
 *
 * Décisions utilisateur (session 2026-07-29) appliquées par défaut :
 *  - PAIRES COMPLÈTES PUBLIÉES SEULEMENT : les brouillons (draft: true) et les
 *    contenus sans traduction (fichier homonyme absent dans l'autre langue)
 *    restent en staging (--include-drafts / --include-untranslated pour élargir) ;
 *  - médias conservés sous /wp-content/uploads/… (les corps y réfèrent déjà) —
 *    rapatriement par scripts/migration/fetch-media.mjs.
 *
 * Transformations au passage (le staging reste INTACT — source rejouable) :
 *  - ligne-commentaire « Champs de transition » retirée ;
 *  - `author` abandonné (valeur unique « admin@victrix » sans valeur éditoriale) ;
 *  - suffixe « | Victrix » retiré de seoTitle (BaseLayout appose déjà le nom du site) ;
 *  - première image du corps retirée si IDENTIQUE à coverImage (doublon
 *    WordPress : l'image mise en avant était répétée en tête d'article) ;
 *  - CTA : une ligne composée UNIQUEMENT d'un lien Markdown (patron des appels
 *    à l'action WordPress) devient `<a class="article-cta">` — la page article
 *    la style en bouton (parité victrix.ca). Détection au câblage plutôt qu'en
 *    CSS : `:only-child` ignore les nœuds texte, il boutonniserait des liens
 *    en fin de phrase.
 *
 * Sécurité : refuse d'écraser un fichier existant de src/content/blog sans
 * --force (les 3 articles démo doivent être retirés au préalable — voir le
 * rapport ; ce script ne supprime jamais rien).
 *
 * Usage :
 *   node scripts/migration/wire-blog.mjs
 *     [--in docs/migration/staging/blog] [--out src/content/blog]
 *     [--include-drafts] [--include-untranslated] [--force] [--dry-run]
 *
 * Rapport : docs/migration/staging/blog/rapport-branchement.md
 */
import { readdirSync, readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const args = process.argv.slice(2);
const has = (f) => args.includes(f);
const getArg = (name, def) => {
  const i = args.indexOf(name);
  return i >= 0 && args[i + 1] ? args[i + 1] : def;
};
const IN_DIR = getArg('--in', 'docs/migration/staging/blog');
const OUT_DIR = getArg('--out', 'src/content/blog');
const INCLUDE_DRAFTS = has('--include-drafts');
const INCLUDE_UNTRANSLATED = has('--include-untranslated');
const FORCE = has('--force');
const DRY = has('--dry-run');

const listMd = (dir) => {
  try {
    return readdirSync(dir).filter((f) => f.endsWith('.md'));
  } catch {
    return [];
  }
};

const files = { fr: listMd(join(IN_DIR, 'fr')), en: listMd(join(IN_DIR, 'en')) };
const stats = { wired: [], drafts: [], untranslated: [], skippedExisting: [], dedupCover: [] };

for (const locale of ['fr', 'en']) {
  const other = locale === 'fr' ? 'en' : 'fr';
  for (const file of files[locale]) {
    const src = readFileSync(join(IN_DIR, locale, file), 'utf8');
    const isDraft = /^draft:\s*true\s*$/m.test(src);
    const hasPair = files[other].includes(file);

    if (isDraft && !INCLUDE_DRAFTS) {
      stats.drafts.push(`${locale}/${file}`);
      continue;
    }
    if (!hasPair && !INCLUDE_UNTRANSLATED) {
      stats.untranslated.push(`${locale}/${file}`);
      continue;
    }
    // Une paire dont le côté FR est brouillon : l'EN publié seul casserait la
    // règle « paires complètes » — on l'écarte aussi (symétrie de la décision).
    if (!INCLUDE_DRAFTS && hasPair) {
      const pairSrc = readFileSync(join(IN_DIR, other, file), 'utf8');
      if (/^draft:\s*true\s*$/m.test(pairSrc)) {
        stats.drafts.push(`${locale}/${file} (paire de ${other}/${file} en brouillon)`);
        continue;
      }
    }

    let out = src;
    // Frontmatter : retirer la ligne-commentaire de transition et `author`.
    out = out.replace(/^# --- Champs de transition[^\n]*\n/m, '');
    out = out.replace(/^author:[^\n]*\n/m, '');
    // seoTitle : retirer le suffixe « | Victrix » (BaseLayout appose le site).
    out = out.replace(/^(seoTitle:\s*")([^"]*?)\s*\|\s*Victrix\s*(")/m, '$1$2$3');
    // Corps : PARAGRAPHES-CTA (un bloc composé d'un seul lien Markdown) →
    // <a class="article-cta">, stylé en bouton par la page article. Par BLOC,
    // pas par ligne : une ligne-lien À L'INTÉRIEUR d'un paragraphe (sans ligne
    // vide autour) resterait un lien de texte — un bouton en pleine phrase
    // lirait mal.
    {
      const end = out.indexOf('---', 4) + 3;
      const body = out
        .slice(end)
        .split('\n\n')
        .map((block) => {
          const m = block.trim().match(/^\[([^\]]+)\]\((\/[^)\s]+|https?:[^)\s]+)\)$/);
          return m ? `<a class="article-cta" href="${m[2]}">${m[1]}</a>` : block;
        })
        .join('\n\n');
      out = out.slice(0, end) + body;
    }

    // Corps : retirer la 1re image si identique à coverImage (doublon WP).
    const cover = out.match(/^coverImage:\s*"([^"]+)"/m)?.[1];
    if (cover) {
      const end = out.indexOf('---', 4) + 3;
      const body = out.slice(end);
      const dedup = body.replace(
        new RegExp(`^\\s*!\\[[^\\]]*\\]\\(${cover.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\)\\s*\\n`),
        '\n',
      );
      if (dedup !== body) {
        out = out.slice(0, end) + dedup;
        stats.dedupCover.push(`${locale}/${file}`);
      }
    }

    const dest = join(OUT_DIR, locale, file);
    if (existsSync(dest) && !FORCE) {
      stats.skippedExisting.push(`${locale}/${file}`);
      continue;
    }
    if (!DRY) {
      mkdirSync(join(OUT_DIR, locale), { recursive: true });
      writeFileSync(dest, out, 'utf8');
    }
    stats.wired.push(`${locale}/${file}`);
  }
}

const lines = [];
const w = (s = '') => lines.push(s);
w('# Rapport de branchement — blog (staging → src/content/blog)');
w();
w(`> Généré par \`scripts/migration/wire-blog.mjs\`${DRY ? ' (DRY-RUN — rien écrit)' : ''}.`);
w(`> Politique : paires complètes publiées seulement${INCLUDE_DRAFTS ? ' + brouillons' : ''}${INCLUDE_UNTRANSLATED ? ' + non-traduits' : ''}.`);
w();
w(`## Branchés (${stats.wired.length})`);
w();
for (const f of stats.wired) w(`- ${f}`);
w();
w(`## Écartés — brouillons (${stats.drafts.length}) : restent en staging`);
w();
for (const f of stats.drafts) w(`- ${f}`);
w();
w(`## Écartés — sans traduction (${stats.untranslated.length}) : restent en staging`);
w();
for (const f of stats.untranslated) w(`- ${f}`);
w();
if (stats.skippedExisting.length) {
  w(`## ⚠️ Non écrits — fichier déjà présent dans la collection (${stats.skippedExisting.length}) — relancer avec --force pour écraser`);
  w();
  for (const f of stats.skippedExisting) w(`- ${f}`);
  w();
}
w(`## Doublon couverture retiré du corps (${stats.dedupCover.length})`);
w();
for (const f of stats.dedupCover) w(`- ${f}`);
w();

if (!DRY) writeFileSync(join(IN_DIR, 'rapport-branchement.md'), lines.join('\n') + '\n', 'utf8');
console.log(
  `Branchés : ${stats.wired.length} | brouillons écartés : ${stats.drafts.length} | sans traduction : ${stats.untranslated.length} | déjà présents (non écrits) : ${stats.skippedExisting.length}`,
);
if (stats.skippedExisting.length && !FORCE)
  console.log('⚠️ Cibles existantes non écrasées — voir le rapport, relancer avec --force au besoin.');
