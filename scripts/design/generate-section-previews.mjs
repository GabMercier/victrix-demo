#!/usr/bin/env node
/**
 * generate-section-previews.mjs — Capture d'aperçus visuels pour la palette de
 * sections CloudCannon (modale « + Ajouter »).
 *
 * MÉCANISME (vérifié dans @bookshop/generate lib/structure-builder.js) : le
 * générateur Bookshop globbe les fichiers `@(preview|icon).*` posés À CÔTÉ de
 * chaque `*.bookshop.yml`, pose `preview_image` sur la structure générée et
 * reloge l'image dans la sortie du build CloudCannon
 * (`/_cloudcannon/bookshop_thumbs/<composant>/preview.<ext>`). Il suffit donc
 * de COMMETTRE un `preview.png` par dossier de composant — aucune modification
 * des specs ni de cloudcannon.config.yml.
 *
 * REJOUABLE après le redesign (« re-peau ») : dev server lancé, puis
 *   npm run design:previews  [-- --base http://localhost:4321]
 * et commettre les preview.png régénérés.
 *
 * Sources d'aperçu (premier rendu FR trouvé, dans l'ordre ci-dessous) : les
 * sections sont des ENFANTS DIRECTS de <main id="main-content"> (renderer
 * partagé component-library/src/shared/astro/page.astro — « no wrapper element
 * on purpose »), d'où la capture par index d'enfant. Un garde-fou de comptage
 * (nb d'enfants === nb de sections du fichier) fait échouer la capture d'une
 * page dont un composant rendrait 0 ou >1 élément racine — échec nommé plutôt
 * que capture décalée.
 *
 * Garde-fou de couverture : tout composant de component-library sans
 * occurrence dans les pages sources fait échouer le script (ajouter alors une
 * section à la page de démo, comme faq le 2026-07-30).
 */
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { parse as parseYaml } from 'yaml';
import { chromium } from '@playwright/test';
import sharp from 'sharp';

const args = process.argv.slice(2);
const getArg = (name, def) => {
  const i = args.indexOf(name);
  return i >= 0 && args[i + 1] ? args[i + 1] : def;
};
const BASE = getArg('--base', 'http://localhost:4321').replace(/\/$/, '');
const ROOT = process.cwd();
const COMPONENTS_DIR = join(ROOT, 'component-library', 'src', 'components');

// ---------------------------------------------------------------------------
// Pages sources (FR) — fichier de contenu → URL rendue. L'union couvre TOUS
// les types de la palette (30 au 2026-08-07) ; le garde-fou plus bas le
// prouve à chaque exécution.
// ---------------------------------------------------------------------------
const SOURCES = [
  { file: 'src/content/landing/fr/demo-sections.md', url: '/fr/campagnes/demo-sections/' },
  { file: 'src/content/landing/fr/evaluation-securite.md', url: '/fr/campagnes/evaluation-securite/' },
  { file: 'src/content/home/fr/accueil.json', url: '/fr/' },
  { file: 'src/content/services/fr/demo-sections.json', url: '/fr/services/demo-sections/' },
];

/** Sections (frontmatter YAML ou JSON) d'un fichier de contenu. */
function readSections(relPath) {
  const raw = readFileSync(join(ROOT, relPath), 'utf8');
  if (relPath.endsWith('.json')) return JSON.parse(raw).sections ?? [];
  const m = raw.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!m) throw new Error(`frontmatter introuvable : ${relPath}`);
  return parseYaml(m[1]).sections ?? [];
}

// Manifeste type → { url, index, total } (première occurrence).
const manifest = new Map();
for (const source of SOURCES) {
  const sections = readSections(source.file);
  sections.forEach((section, index) => {
    const type = section.type ?? section._bookshop_name;
    if (type && !manifest.has(type)) {
      manifest.set(type, { url: source.url, index, total: sections.length, file: source.file });
    }
  });
}

// Garde-fou de couverture : chaque composant de la bibliothèque doit avoir une
// occurrence — sinon, échec nommé avec la liste (ajouter une section de démo).
const allTypes = readdirSync(COMPONENTS_DIR, { withFileTypes: true })
  .filter((e) => e.isDirectory())
  .map((e) => e.name)
  .filter((name) => existsSync(join(COMPONENTS_DIR, name, `${name}.bookshop.yml`)));
const missing = allTypes.filter((t) => !manifest.has(t));
if (missing.length > 0) {
  console.error(
    `ÉCHEC couverture : aucun rendu trouvé pour ${missing.length} composant(s) : ${missing.join(', ')}.\n` +
      `Ajouter une section de ce type à une page source (ex. demo-sections) puis relancer.`,
  );
  process.exit(1);
}

// ---------------------------------------------------------------------------
// Capture
// ---------------------------------------------------------------------------
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });

// Ping de la cible avant tout — message actionnable si le dev server est éteint.
try {
  await page.goto(`${BASE}/fr/`, { waitUntil: 'domcontentloaded', timeout: 15000 });
} catch {
  console.error(`ÉCHEC : ${BASE} ne répond pas. Lancer « npm run dev » puis relancer.`);
  await browser.close();
  process.exit(1);
}

// Regrouper par URL pour ne charger chaque page qu'une fois.
const byUrl = new Map();
for (const [type, loc] of manifest) {
  if (!byUrl.has(loc.url)) byUrl.set(loc.url, []);
  byUrl.get(loc.url).push({ type, ...loc });
}

let captured = 0;
for (const [url, entries] of byUrl) {
  await page.goto(`${BASE}${url}`, { waitUntil: 'networkidle', timeout: 30000 });
  // Chrome hors-section masqué pendant la capture : la barre d'outils dev
  // d'Astro flotte en bas du viewport et l'en-tête du site est collant
  // (sticky) — les deux déborderaient sur les sections capturées.
  await page.addStyleTag({
    content: 'astro-dev-toolbar, header.site-header, footer { display: none !important; }',
  });
  // Seuls les éléments RENDUS comptent : une balise métadonnée (script JSON-LD,
  // style, link) projetée dans <main> n'occupe aucun index visuel — l'exclure
  // garde comptage et indexation alignés sur les sections. [data-crumbs] : le
  // fil d'Ariane visible (src/components/Breadcrumbs.astro, 2026-08-17) vit en
  // enfant direct de <main> AVANT les sections — exclu par attribut pour la
  // même raison.
  const rendered = page.locator(
    '#main-content > :not(script):not(style):not(link):not([data-crumbs])',
  );
  const childCount = await rendered.count();
  const expected = entries[0].total;
  if (childCount !== expected) {
    console.error(
      `ÉCHEC comptage sur ${url} : ${childCount} enfant(s) de #main-content pour ` +
        `${expected} section(s) dans ${entries[0].file}. Un composant rend 0 ou >1 ` +
        `élément racine — corriger avant de capturer (indexation fiable impossible).`,
    );
    await browser.close();
    process.exit(1);
  }
  for (const entry of entries) {
    const element = rendered.nth(entry.index);
    const png = await element.screenshot({ animations: 'disabled' });
    const out = join(COMPONENTS_DIR, entry.type, 'preview.png');
    // ~800 px de large : lisible dans la modale, léger dans le repo.
    await sharp(png).resize({ width: 800 }).png({ compressionLevel: 9 }).toFile(out);
    captured++;
    console.log(`✓ ${entry.type}  ←  ${url} (section ${entry.index + 1}/${entry.total})`);
  }
}

await browser.close();
console.log(`\n${captured}/${allTypes.length} aperçus écrits dans component-library/src/components/*/preview.png`);
console.log('Prochaine étape : commettre les preview.png (le build CloudCannon les reloge).');
