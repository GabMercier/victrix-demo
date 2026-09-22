#!/usr/bin/env node
/**
 * Garde-fou du PRÉREMPLISSAGE des appels à l'action vers le Contact
 * (2026-09-22, lot L-prefill).
 *
 * Pourquoi : « De quoi souhaitez-vous parler ? » et « Service » sont tous deux
 * OBLIGATOIRES dans le formulaire Contact. Un CTA qui y arrive sans les
 * remplir demande au visiteur un travail que la page connaissait déjà — et
 * rien ne le signalait. Le 21/09, la page Secteurs envoyait
 * `/fr/contact?cta=Planifiez+une+consultation&de=Secteurs+d'activité` avec les
 * deux listes vides : la route des pages générales posait
 * `sujet: page.data.contactSujet` SANS repli, contrairement à celle des
 * services (`|| 'projet'`), et 9 pages générales sur 11 n'ont pas rempli ce
 * champ au CMS. Un schéma zod ne voit pas ça : le champ vide est valide.
 *
 * Ce que fait le script : il lit le site CONSTRUIT (`dist/`) et REJOUE, sur le
 * HTML, la mécanique d'exécution du site — même règle, même expression
 * régulière de chemin, même exclusion du chrome que le script « provenance des
 * CTA » de src/layouts/BaseLayout.astro :
 *
 *   valeur finale du sujet   = ?sujet=     du lien   OU  <body data-contact-sujet>
 *   valeur finale du service = ?expertise= du lien   OU  <body data-contact-service>
 *
 * Les deux doivent être non vides, sinon le lien arrive sur un formulaire
 * incomplet et le script ÉCHOUE en nommant la page et le lien.
 *
 *   npm run build && npm run check:prefill      # code 1 s'il reste un CTA vide
 *   node scripts/check-contact-prefill.mjs --verbose   # liste aussi les liens OK
 *
 * Il travaille sur le rendu et non sur les sources, pour la même raison que
 * scripts/check-internal-links.mjs : le préremplissage est le produit d'une
 * route, d'un champ de contenu, d'un repli et d'un script de mise en page —
 * seul le HTML final dit ce que le visiteur reçoit.
 */
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { join, resolve, dirname, posix, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const DIST = join(ROOT, 'dist');
const VERBOSE = process.argv.includes('--verbose');

/**
 * EXCEPTIONS ASSUMÉES — liens que le script de BaseLayout ignore
 * VOLONTAIREMENT, donc que ce garde-fou ignore aussi. Toute autre exception
 * doit être ajoutée ICI, avec sa raison : c'est la seule liste qui fait foi.
 *
 * 1. Le CHROME (`<header>`, `<nav>`, `<footer>`) — en-tête, méga-menu, menu
 *    mobile, pied de page. Leur libellé est « Contact » ou « Nous joindre » :
 *    il n'apporte aucun contexte, et la provenance serait celle de n'importe
 *    quelle page du site. Le visiteur qui passe par le menu choisit lui-même,
 *    et le formulaire SURLIGNE alors ses six champs obligatoires vides
 *    (src/pages/[lang]/contact.astro). Même sélecteur que le site :
 *    `a.closest('header, nav, footer')`.
 * 2. Rien d'autre à ce jour.
 */
const CHROME_TAGS = ['header', 'nav', 'footer'];

/** Chemin de page → raison, pour une page entière hors périmètre (aucune à ce jour). */
const PAGES_EXEMPTES = new Map();

if (!existsSync(DIST)) {
  console.error("[check:prefill] dist/ introuvable — lancer `npm run build` d'abord.");
  process.exit(1);
}

/** Tous les fichiers d'un dossier, récursivement. */
function walk(dir, out = []) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const abs = join(dir, entry.name);
    if (entry.isDirectory()) walk(abs, out);
    else out.push(abs);
  }
  return out;
}

/** Chemin d'URL d'une page de dist (`fr/contact/index.html` → `/fr/contact/`). */
function pageUrl(file) {
  const rel = relative(DIST, file).split('\\').join('/');
  return '/' + rel.replace(/index\.html$/, '');
}

/**
 * Intervalles [début, fin[ du HTML couverts par un `<header>`, `<nav>` ou
 * `<footer>` — l'équivalent statique de `a.closest('header, nav, footer')`.
 * Compteur de profondeur par nom de balise : les trois peuvent s'imbriquer
 * (un `<nav>` dans le `<header>`, un `<nav>` dans le `<footer>`).
 */
function chromeRanges(html) {
  const ranges = [];
  const open = new Map(CHROME_TAGS.map((tag) => [tag, []]));
  const TAG = new RegExp(`</?(?:${CHROME_TAGS.join('|')})\\b`, 'gi');
  for (const match of html.matchAll(TAG)) {
    const closing = match[0][1] === '/';
    const tag = match[0].replace(/^<\/?/, '').toLowerCase();
    const stack = open.get(tag);
    if (!closing) stack.push(match.index);
    else {
      const start = stack.pop();
      if (start !== undefined) ranges.push([start, match.index + match[0].length]);
    }
  }
  // Balises non fermées (HTML tronqué) : le reste du document est du chrome.
  for (const [, stack] of open) for (const start of stack) ranges.push([start, html.length]);
  return ranges;
}

const inRanges = (offset, ranges) => ranges.some(([a, b]) => offset >= a && offset < b);

/**
 * Le CORPS du document : de la balise <body> à la fin. Tout le relevé se fait
 * là-dedans, jamais sur le <head>.
 *
 * PIÈGE PAYÉ le 22/09 : chercher la PREMIÈRE occurrence de « <body » donne un
 * faux positif, parce que des scripts en ligne du <head> en parlent dans leurs
 * commentaires (« // Le ClientRouter remplace <body> … »). Le script lisait
 * donc une balise sans attribut et déclarait 449 CTA fautifs sur 449. Même
 * risque pour <header>/<nav>/<footer> et pour un `<a href>` cité dans une
 * chaîne de script — d'où la découpe unique ici, en repartant de `</head>`.
 */
function documentBody(html) {
  const afterHead = html.indexOf('</head>');
  const from = afterHead === -1 ? 0 : afterHead + '</head>'.length;
  const open = /<body\b[^>]*>/i.exec(html.slice(from));
  if (!open) return { tag: '', html: html.slice(from) };
  return { tag: open[0], html: html.slice(from + open.index) };
}

/** Valeur d'un attribut de la balise <body> (ou '' s'il est absent). */
function bodyAttr(bodyTag, attr) {
  const re = new RegExp(`\\b${attr}\\s*=\\s*(?:"([^"]*)"|'([^']*)')`, 'i');
  const match = re.exec(bodyTag);
  return (match?.[1] ?? match?.[2] ?? '').replace(/&amp;/g, '&').trim();
}

// ---- Relevé -----------------------------------------------------------------------
const HREF = /<a\b[^>]*?\bhref\s*=\s*(?:"([^"]*)"|'([^']*)')/gi;
// Même expression que le script de BaseLayout : seule la page Contact compte.
const CONTACT_PATH = /^\/(fr|en)\/contact\/?$/;

/** page → [{ href, manque }] */
const faulty = new Map();
let pagesLues = 0;
let pagesAvecCta = 0;
let liensVus = 0;
let liensChrome = 0;
let liensOk = 0;

for (const file of walk(DIST)) {
  if (!file.endsWith('.html')) continue;
  pagesLues += 1;
  const from = pageUrl(file);
  if (PAGES_EXEMPTES.has(from)) continue;
  const { tag: bodyTag, html } = documentBody(readFileSync(file, 'utf8'));
  if (!/\/(?:fr|en)\/contact/.test(html)) continue;

  const sujetBody = bodyAttr(bodyTag, 'data-contact-sujet');
  const serviceBody = bodyAttr(bodyTag, 'data-contact-service');
  let ranges = null; // calculé à la demande : le chrome coûte un balayage
  let pageCompte = false;

  for (const match of html.matchAll(HREF)) {
    const raw = (match[1] ?? match[2] ?? '').replace(/&amp;/g, '&').trim();
    if (!raw || raw.startsWith('#')) continue;
    if (/^[a-z][a-z0-9+.-]*:/i.test(raw) || raw.startsWith('//')) continue; // externe, mailto:, tel:…
    const base = from.endsWith('/') ? from : posix.dirname(from) + '/';
    const abs = raw.startsWith('/') ? raw : posix.join(base, raw);
    const [pathAndQuery] = abs.split('#');
    const [pathname, query = ''] = pathAndQuery.split('?');
    if (!CONTACT_PATH.test(pathname)) continue;

    liensVus += 1;
    ranges ??= chromeRanges(html);
    if (inRanges(match.index, ranges)) {
      liensChrome += 1;
      continue;
    }
    pageCompte = true;

    const params = new URLSearchParams(query);
    const sujet = (params.get('sujet') ?? '').trim() || sujetBody;
    const service = (params.get('expertise') ?? '').trim() || serviceBody;
    const manque = [];
    if (!sujet) manque.push('sujet (« De quoi souhaitez-vous parler ? »)');
    if (!service) manque.push('expertise (« Service »)');
    if (manque.length === 0) {
      liensOk += 1;
      continue;
    }
    const rows = faulty.get(from) ?? [];
    // Un même lien répété sur la page (haut/bas) ne se signale qu'une fois.
    if (!rows.some((r) => r.href === raw && r.manque.join() === manque.join())) {
      rows.push({ href: raw, manque });
    }
    faulty.set(from, rows);
  }
  if (pageCompte) pagesAvecCta += 1;
}

// ---- Rapport ----------------------------------------------------------------------
console.log(
  `[check:prefill] ${pagesLues} page(s) lue(s), ${pagesAvecCta} avec un CTA de contenu vers le Contact.`,
);
console.log(
  `[check:prefill] ${liensVus} lien(s) vers le Contact : ${liensOk} prérempli(s), ` +
    `${liensChrome} ignoré(s) (en-tête / menus / pied de page, exception assumée).`,
);

if (faulty.size === 0) {
  if (VERBOSE) console.log('[check:prefill] aucun CTA ne laisse une liste obligatoire vide.');
  console.log('[check:prefill] OK');
  process.exit(0);
}

console.error(`\n[check:prefill] CTA qui arrivent sur un formulaire INCOMPLET :`);
for (const [from, rows] of [...faulty].sort(([a], [b]) => a.localeCompare(b))) {
  console.error(`  ${from}`);
  for (const { href, manque } of rows) {
    console.error(`      ${href}`);
    console.error(`          manque : ${manque.join(' + ')}`);
  }
}
console.error(
  `\n  Où corriger : la route qui rend ces pages doit passer un \`contactPreset\`` +
    `\n  à BaseLayout (voir src/pages/[lang]/services/[...slug].astro), ou la page` +
    `\n  doit porter \`contactSujet\` / \`contactService\` au CMS. Le repli général` +
    `\n  vit dans src/layouts/BaseLayout.astro (CONTACT_SUJET_DEFAULT).`,
);
console.error(`\n[check:prefill] ÉCHEC — ${faulty.size} page(s) fautive(s).`);
process.exit(1);
