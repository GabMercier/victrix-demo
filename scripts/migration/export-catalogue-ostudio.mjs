#!/usr/bin/env node
/**
 * export-catalogue-ostudio.mjs — Rapatrie le catalogue Ø Studio
 * (https://o-studio-catalogue.victrix.ca, WordPress FR, API REST ouverte) :
 * les TEXTES des 16 fiches de solutions, leurs IMAGES, et les deux pages de
 * texte libre (accueil du catalogue, « À propos ») en Markdown pour Julie.
 *
 * Lot L10 de docs/plan-livraison-finale.md, lot 1 de
 * docs/plan-import-catalogue-ostudio.md. Le sous-domaine est démantelé au
 * go-live : cet export EST la copie qui survit (même raisonnement que
 * docs/migration/cache-source/ pour l'ancien site victrix.ca).
 *
 * CE QU'IL NE FAIT PAS : il n'écrit RIEN dans src/content/. Les fiches
 * (sections product-hero / bento-metrics / galerie / form) sont générées par
 * le lot L11 À PARTIR de cet export — pas du réseau. Séparer les deux garde
 * l'import rejouable sans jamais réécrire ce que l'éditrice aura retouché au
 * CMS (leçon convert-articles.mjs : un convertisseur qui réécrit du contenu
 * déjà édité est un convertisseur qu'on ne peut plus relancer).
 *
 * LEÇON L-restaure, APPLIQUÉE ICI. Le convertisseur d'articles abandonnait
 * en SILENCE tout bloc qu'il ne reconnaissait pas : 197 blocs perdus, vus
 * seulement trois semaines plus tard. Ici, toute structure inattendue est une
 * ERREUR D'EXTRACTION qui fait sortir le script en code 1, en la nommant.
 * Les anomalies de CONTENU (images partagées par deux fiches, textes
 * dupliqués, photos de banque, textes `alt` absents) sont, elles, des faits
 * de la source : elles vont au rapport, sans faire échouer l'export.
 *
 * Sorties :
 *   docs/migration/catalogue-ostudio/_source-api.json  cache brut de l'API
 *   docs/migration/catalogue-ostudio/<cible>.json      une fiche (16)
 *   docs/migration/catalogue-ostudio/_accueil-catalogue.md, _a-propos.md
 *   docs/migration/catalogue-ostudio.md                le rapport
 *   public/images/solutions/<cible>/NN.<ext>            images allégées
 *
 * Usage :
 *   node scripts/migration/export-catalogue-ostudio.mjs
 *   node scripts/migration/export-catalogue-ostudio.mjs --hors-ligne   # depuis le cache
 *   node scripts/migration/export-catalogue-ostudio.mjs --check        # n'écrit rien, code 1 si écart
 *   node scripts/migration/export-catalogue-ostudio.mjs --sans-images  # textes seuls
 *   node scripts/migration/export-catalogue-ostudio.mjs --force-images # retélécharge tout
 *
 * PIÈGE RÉSEAU (mémoire ostudio-catalogue-import) : le WordPress répond 403 à
 * un client sans User-Agent de navigateur. L'en-tête ci-dessous est
 * OBLIGATOIRE, y compris pour les fichiers d'images.
 */
import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';
import { balancedEnd, decodeEntities } from './lib-wxr.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const args = process.argv.slice(2);
const getArg = (nom, def) => {
  const i = args.indexOf(nom);
  return i >= 0 && args[i + 1] ? args[i + 1] : def;
};
const BASE = getArg('--base', 'https://o-studio-catalogue.victrix.ca').replace(/\/$/, '');
const HORS_LIGNE = args.includes('--hors-ligne');
const CHECK = args.includes('--check');
const SANS_IMAGES = args.includes('--sans-images');
const FORCE_IMAGES = args.includes('--force-images');

const UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36';

const DOSSIER_EXPORT = join(ROOT, 'docs/migration/catalogue-ostudio');
const CACHE = join(DOSSIER_EXPORT, '_source-api.json');
const RAPPORT = join(ROOT, 'docs/migration/catalogue-ostudio.md');
const IMAGES_ROOT = join(ROOT, 'public/images/solutions');
const IMAGES_URL = '/images/solutions';

// Aligné sur scripts/optimize-images.mjs (mêmes réglages, mêmes pièges) :
// 1600 px de large au plus, JPEG q80 mozjpeg progressif, PNG réencodé SANS
// PERTE (ni `palette`, ni `effort` — ils quantifient à 256 couleurs en
// silence et abîment le texte des captures d'écran).
const LARGEUR_MAX = 1600;

/**
 * Correspondance slug SOURCE → slug CHEZ NOUS. Les 9 premières existent déjà
 * dans src/content/solutions/{fr,en}/ (cartes du catalogue) : le nom de
 * fichier est celui qui apparie FR et EN, il ne change PAS. Les 7 suivantes
 * sont nouvelles ; leur slug suit la forme courte des existantes (pas de
 * « gestion-du-processus-de- » à rallonge — c'est aussi l'URL publique).
 *
 * Tout slug source hors de cette table, et toute entrée de la table absente
 * de la source, est une ERREUR : la source a changé, il faut la relire avant
 * de réimporter.
 */
const FICHES = [
  { source: '144-2', cible: 'o-bureau' },
  { source: 'portail-de-gestion-des-requetes-citoyennes', cible: 'portail-requetes-citoyennes' },
  { source: 'portail-de-gestion-des-requetes-pour-lombudsman', cible: 'portail-ombudsman' },
  { source: 'portail-de-gestion-des-subventions', cible: 'portail-subventions' },
  { source: 'gestion-des-idees', cible: 'gestion-idees' },
  { source: 'gestion-des-horaires-pour-les-etudiants', cible: 'horaires-etudiants' },
  { source: 'application-legacy-vers-power-apps', cible: 'legacy-vers-power-apps' },
  { source: 'feuille-de-temps-chantier', cible: 'feuille-temps-chantier' },
  { source: 'gestion-des-formations-pour-les-employes', cible: 'gestion-formations' },
  { source: 'gouvernance-des-outils-power-platform', cible: 'gouvernance-power-platform', nouvelle: true },
  { source: 'registre-des-applications-organisationnelles', cible: 'registre-applications', nouvelle: true },
  { source: 'automatisation-du-processus-de-gestion-contractuelle', cible: 'gestion-contractuelle', nouvelle: true },
  { source: 'gestion-du-processus-de-recrutement', cible: 'gestion-recrutement', nouvelle: true },
  { source: 'gestion-du-onboarding-dun-nouvel-employe', cible: 'onboarding-employe', nouvelle: true },
  { source: 'gestion-des-comptes-de-depenses', cible: 'comptes-depenses', nouvelle: true },
  { source: 'automatisation-du-processus-de-traitement-des-factures', cible: 'traitement-factures', nouvelle: true },
];

/** Les deux pages de texte libre — matière pour Julie, AUCUN import automatique. */
const PAGES_TEXTE = [
  {
    source: 'studio-de-creation-power-platform-dynamics-365',
    fichier: '_accueil-catalogue.md',
    titre: 'Accueil du catalogue Ø Studio',
    usage:
      'Matière pour le chrome de notre page /fr/solutions/ et pour la page de service ' +
      'Ø Studio (arguments, gouvernance, book de réalisations, FAQ).',
  },
  {
    source: 'a-propos',
    fichier: '_a-propos.md',
    titre: 'À propos de Ø Studio',
    usage: 'Matière pour la page de service Ø Studio (+30 spécialistes, secteurs, relève).',
  },
];

/**
 * Les QUATRE faits de chaque fiche. La source n'écrit pas toujours le même
 * libellé (« Délais de personnalisation », « Délais de réalisation »,
 * « Technologies utilisées », « Technologies »), ni toujours l'espace avant
 * le deux-points : on normalise vers une clé stable, et le libellé SOURCE est
 * conservé tel quel dans l'export (le rapport le montre).
 */
const FAITS = [
  { cle: 'client', motifs: [/^clients?$/], libelle: 'Client' },
  { cle: 'cout', motifs: [/^co[uû]ts?$/], libelle: 'Coût' },
  { cle: 'delai', motifs: [/^d[ée]lais?\b/], libelle: 'Délai' },
  { cle: 'technologies', motifs: [/^technologies?\b/], libelle: 'Technologies' },
];

const erreurs = [];
const anomalies = [];
const ecarts = [];
const erreur = (fiche, message) => erreurs.push(`${fiche} — ${message}`);
const anomalie = (fiche, message) => anomalies.push(`${fiche} — ${message}`);

// ---------------------------------------------------------------------------
// HTML → texte / Markdown
// ---------------------------------------------------------------------------

/** Entités numériques (&#916;, &#x2019;) — complète decodeEntities de lib-wxr. */
const decode = (s) =>
  decodeEntities(
    String(s)
      .replace(/&#(\d+);/g, (_, d) => String.fromCharCode(Number(d)))
      .replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCharCode(parseInt(h, 16)))
      .replace(/&rsquo;/g, '’')
      .replace(/&lsquo;/g, '‘')
      .replace(/&ldquo;/g, '“')
      .replace(/&rdquo;/g, '”')
      .replace(/&hellip;/g, '…')
      .replace(/&ndash;/g, '–')
      .replace(/&mdash;/g, '—'),
  );

/**
 * Texte nu d'un fragment HTML (balises retirées, espaces normalisés).
 *
 * Les balises deviennent une ESPACE (sinon `<p>A</p><p>B</p>` donnerait
 * « AB ») — d'où l'espace parasite que laisse un point sorti du gras, comme
 * dans `<strong>…instant</strong>.` : on la reprend devant la ponctuation
 * faible seulement. Jamais devant `: ; ! ? »`, qui prennent une espace en
 * typographie française.
 */
const texte = (html) =>
  decode(String(html).replace(/<[^>]+>/g, ' '))
    .replace(/ /g, ' ')
    .replace(/\s+/g, ' ')
    .replace(/\s+([.,)…])/g, '$1')
    .trim();

/** Mots significatifs — sert au garde-fou de déperdition des pages Markdown. */
const mots = (s) => (texte(s).toLowerCase().match(/[\p{L}\p{N}][\p{L}\p{N}'’-]*/gu) ?? []);

/**
 * HTML de bloc Gutenberg → Markdown. Volontairement PETIT : la source est du
 * Gutenberg propre (h2-h4, p, ul/ol, strong/em/a, figure). Toute balise de
 * bloc NON reconnue est signalée par `avertir` — jamais avalée en silence.
 */
function versMarkdown(html, avertir) {
  const sortie = [];
  const BLOCS = /<(h[1-6]|ul|ol|blockquote|figure|table)\b[^>]*>/gi;
  let curseur = 0;
  let m;

  const paragraphes = (fragment) => {
    for (const brut of fragment.split(/<\/p>/i)) {
      const t = enLigne(brut, avertir).trim();
      if (t) sortie.push(t);
    }
  };

  while ((m = BLOCS.exec(html))) {
    if (m.index < curseur) continue; // balise interne d'un bloc déjà consommé
    paragraphes(html.slice(curseur, m.index));
    const nom = m[1].toLowerCase();
    const debut = m.index + m[0].length;
    const fin = balancedEnd(html, nom, debut);
    const interne = html.slice(debut, fin).replace(new RegExp(`</${nom}>\\s*$`, 'i'), '');
    curseur = fin;

    if (/^h[1-6]$/.test(nom)) {
      const niveau = Number(nom[1]);
      const t = enLigne(interne, avertir).trim();
      if (t) sortie.push(`${'#'.repeat(niveau)} ${t}`);
    } else if (nom === 'ul' || nom === 'ol') {
      sortie.push(liste(interne, nom === 'ol', avertir));
    } else if (nom === 'blockquote') {
      const t = versMarkdown(interne, avertir)
        .split('\n')
        .map((l) => (l ? `> ${l}` : '>'))
        .join('\n');
      if (t.trim()) sortie.push(t);
    } else if (nom === 'figure') {
      const src = interne.match(/<img[^>]+src="([^"]+)"/i)?.[1];
      const alt = interne.match(/<img[^>]+alt="([^"]*)"/i)?.[1] ?? '';
      const legende = interne.match(/<figcaption[^>]*>([\s\S]*?)<\/figcaption>/i);
      if (src) sortie.push(`![${decode(alt)}](${urlOrigine(src)})`);
      if (legende) sortie.push(`*${texte(legende[1])}*`);
    } else if (nom === 'table') {
      // Aucune table dans la source d'aujourd'hui : on ne devine pas un
      // rendu Markdown, on signale et on garde le texte.
      avertir(`<table> converti en texte brut (${texte(interne).slice(0, 60)}…)`);
      sortie.push(texte(interne));
    }
  }
  paragraphes(html.slice(curseur));
  return sortie.filter(Boolean).join('\n\n');
}

function liste(html, ordonnee, avertir, retrait = '') {
  const items = [];
  const ouvre = /<li\b[^>]*>/gi;
  let consomme = 0;
  let n = 0;
  let m;
  while ((m = ouvre.exec(html))) {
    if (m.index < consomme) continue; // <li> d'une sous-liste déjà consommée
    const debut = m.index + m[0].length;
    const fin = balancedEnd(html, 'li', debut);
    let corps = html.slice(debut, fin).replace(/<\/li>\s*$/i, '');
    consomme = fin;
    n += 1;

    // Sous-listes extraites puis réindentées (piège balancedEnd de lib-wxr).
    let sous = '';
    const ouvreSous = /<(ul|ol)\b[^>]*>/gi;
    let coupe = 0;
    let reste = '';
    let s;
    while ((s = ouvreSous.exec(corps))) {
      if (s.index < coupe) continue;
      const sDebut = s.index + s[0].length;
      const sFin = balancedEnd(corps, s[1], sDebut);
      const interne = corps.slice(sDebut, sFin).replace(new RegExp(`</${s[1]}>\\s*$`, 'i'), '');
      sous += `\n${liste(interne, s[1].toLowerCase() === 'ol', avertir, `${retrait}  `)}`;
      reste += corps.slice(coupe, s.index);
      coupe = sFin;
    }
    reste += corps.slice(coupe);
    items.push(`${retrait}${ordonnee ? `${n}.` : '-'} ${enLigne(reste, avertir).trim()}${sous}`);
  }
  return items.join('\n');
}

/**
 * Remplace chaque `<nom>…</nom>` par `envelopper(contenu)`, en BALAYANT les
 * ouvertures/fermetures — jamais `[\s\S]*?</nom>`.
 *
 * Le piège est payé : la source écrit `<strong><strong>X</strong>.</strong>`
 * (Gutenberg empile le gras du bloc et celui de la sélection). Une regex non
 * gourmande ferme le gras au PREMIER `</strong>` et laisse une balise
 * orpheline dans le texte — c'est le même piège que les `<ul>` imbriqués, déjà
 * consigné dans lib-wxr.mjs. Le balisage de MÊME nom trouvé à l'intérieur est
 * aplati : deux gras imbriqués font un seul gras.
 */
function remplacerBalise(html, nom, envelopper) {
  const ouvre = new RegExp(`<${nom}\\b[^>]*>`, 'gi');
  let sortie = '';
  let curseur = 0;
  let m;
  while ((m = ouvre.exec(html))) {
    if (m.index < curseur) continue; // balise interne d'un élément déjà consommé
    const debut = m.index + m[0].length;
    const fin = balancedEnd(html, nom, debut);
    const interne = html
      .slice(debut, fin)
      .replace(new RegExp(`</${nom}>\\s*$`, 'i'), '')
      .replace(new RegExp(`</?${nom}\\b[^>]*>`, 'gi'), ''); // aplatissement
    sortie += html.slice(curseur, m.index) + envelopper(interne);
    curseur = fin;
    ouvre.lastIndex = fin;
  }
  return sortie + html.slice(curseur);
}

/** Balisage EN LIGNE → Markdown ; toute balise inattendue est signalée. */
function enLigne(html, avertir) {
  let s = String(html);
  s = s.replace(/<img\b[^>]*>/gi, (t) => {
    const src = t.match(/src="([^"]+)"/i)?.[1];
    const alt = t.match(/alt="([^"]*)"/i)?.[1] ?? '';
    return src ? `![${decode(alt)}](${urlOrigine(src)})` : '';
  });
  s = s.replace(/<a\b[^>]*>([\s\S]*?)<\/a>/gi, (t, inner) => {
    const href = t.match(/href="([^"]+)"/i)?.[1];
    const dedans = enLigne(inner, avertir).trim();
    return href ? `[${dedans}](${href})` : dedans;
  });
  for (const nom of ['strong', 'b']) {
    s = remplacerBalise(s, nom, (x) => {
      const inner = enLigne(x, avertir).trim();
      return inner ? `**${inner}**` : '';
    });
  }
  for (const nom of ['em', 'i']) {
    s = remplacerBalise(s, nom, (x) => {
      const inner = enLigne(x, avertir).trim();
      return inner ? `*${inner}*` : '';
    });
  }
  s = s.replace(/<br\s*\/?>/gi, '\n');
  s = s.replace(/<\/?(span|mark|p|div|u|sup|sub|small|font|figcaption)\b[^>]*>/gi, '');
  s = s.replace(/<hr\b[^>]*>/gi, '');
  s = s.replace(/<[^>]+>/g, (t) => {
    avertir(`balise inattendue retirée : ${t.slice(0, 48)}`);
    return ' ';
  });
  return decode(s)
    .replace(/ /g, ' ')
    .replace(/[ \t]+/g, ' ');
}

/**
 * URL de l'ORIGINAL. Le thème sert les images via le proxy Jetpack
 * (`i0.wp.com/<hôte>/wp-content/…?resize=…&ssl=1`) ; l'original se télécharge
 * directement depuis l'hôte, sans redimensionnement ni perte.
 */
function urlOrigine(src) {
  const proxy = String(src).match(/^https?:\/\/i\d\.wp\.com\/(.+?)(\?.*)?$/i);
  if (proxy) return `https://${proxy[1]}`;
  return String(src).replace(/\?.*$/, '');
}

// ---------------------------------------------------------------------------
// Source : réseau ou cache
// ---------------------------------------------------------------------------

async function json(url) {
  const res = await fetch(url, { headers: { 'User-Agent': UA, Accept: 'application/json' } });
  if (!res.ok) throw new Error(`HTTP ${res.status} sur ${url}`);
  return res.json();
}

async function chargerSource() {
  if (HORS_LIGNE) {
    if (!existsSync(CACHE)) {
      console.error(`ÉCHEC : --hors-ligne demandé mais le cache est absent (${rel(CACHE)}).`);
      process.exit(1);
    }
    const cache = JSON.parse(readFileSync(CACHE, 'utf8'));
    console.log(`Source : cache local du ${cache.recupere} (${cache.pages.length} pages).`);
    return cache;
  }
  const pages = await json(`${BASE}/wp-json/wp/v2/pages?per_page=100`);
  // Médias : source d'URL CANONIQUE pour chaque image (le HTML ne donne que
  // l'URL proxifiée). 2 pages de 100 suffisent aux 131 médias de la source.
  const medias = [];
  for (let page = 1; page <= 3; page += 1) {
    const lot = await json(`${BASE}/wp-json/wp/v2/media?per_page=100&page=${page}`).catch(() => []);
    if (!Array.isArray(lot) || lot.length === 0) break;
    medias.push(...lot);
    if (lot.length < 100) break;
  }
  console.log(`Source : ${BASE} — ${pages.length} pages, ${medias.length} médias.`);
  return {
    recupere: new Date().toISOString().slice(0, 10),
    base: BASE,
    pages: pages.map((p) => ({
      id: p.id,
      slug: p.slug,
      link: p.link,
      modified: p.modified,
      title: p.title?.rendered ?? '',
      content: p.content?.rendered ?? '',
    })),
    medias: medias.map((m) => ({
      id: m.id,
      source_url: m.source_url,
      alt_text: m.alt_text ?? '',
      title: m.title?.rendered ?? '',
      width: m.media_details?.width ?? null,
      height: m.media_details?.height ?? null,
    })),
  };
}

// ---------------------------------------------------------------------------
// Extraction d'une fiche
// ---------------------------------------------------------------------------

/** Le contenu utile s'arrête au formulaire Fluent Forms (bruit pur). */
function avantLeFormulaire(html) {
  const i = html.search(/<div class=['"]fluentform/i);
  return i >= 0 ? html.slice(0, i) : html;
}

function extraireImages(html, page, medias) {
  const out = [];
  for (const balise of html.match(/<img\b[^>]*>/gi) ?? []) {
    const src = balise.match(/src="([^"]+)"/i)?.[1];
    if (!src) {
      erreur(page.slug, '<img> sans attribut src');
      continue;
    }
    // Id du média : data-id (diaporama Jetpack) ou classe wp-image-<id>
    // (image posée seule). Les deux existent dans la source.
    const id = Number(balise.match(/data-id="(\d+)"/i)?.[1] ?? balise.match(/wp-image-(\d+)/i)?.[1] ?? 0);
    const media = medias.get(id);
    const url = media?.source_url ? urlOrigine(media.source_url) : urlOrigine(src);
    if (!media) {
      anomalie(page.slug, `image hors médiathèque (id ${id || 'absent'}) — URL déduite du HTML : ${url}`);
    }
    out.push({
      url,
      idMedia: id || null,
      altSource: decode(balise.match(/alt="([^"]*)"/i)?.[1] ?? ''),
      titreMedia: media ? texte(media.title) : '',
      diaporama: /slideshow/i.test(balise.match(/class="([^"]*)"/i)?.[1] ?? ''),
    });
  }
  return out;
}

function extraireFaits(html, slug) {
  const listes = [...html.matchAll(/<ul class="wp-block-list">([\s\S]*?)<\/ul>/gi)];
  if (listes.length !== 1) {
    erreur(slug, `${listes.length} liste(s) « wp-block-list » au lieu d'une seule (les 4 faits)`);
    if (listes.length === 0) return [];
  }
  const items = [...listes[0][1].matchAll(/<li\b[^>]*>([\s\S]*?)<\/li>/gi)].map((m) => m[1]);
  if (items.length !== 4) erreur(slug, `${items.length} fait(s) au lieu de 4`);

  const faits = [];
  for (const item of items) {
    const brut = texte(item);
    // « <strong>Client</strong> : Multi-Secteur » — le deux-points est parfois
    // collé au libellé, parfois précédé d'une espace insécable.
    const coupe = brut.match(/^(.+?)\s*[:：]\s*(.*)$/);
    if (!coupe) {
      erreur(slug, `fait sans deux-points, illisible : « ${brut.slice(0, 60)} »`);
      continue;
    }
    const libelleSource = coupe[1].trim();
    const valeur = coupe[2].trim();
    const normalise = libelleSource
      .toLowerCase()
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '')
      .trim();
    const connu = FAITS.find((f) => f.motifs.some((re) => re.test(normalise)));
    if (!connu) {
      erreur(slug, `fait au libellé inconnu : « ${libelleSource} » (attendus : Client, Coût, Délais, Technologies)`);
      continue;
    }
    if (!valeur) erreur(slug, `fait « ${libelleSource} » sans valeur`);
    faits.push({ cle: connu.cle, libelle: connu.libelle, libelleSource, valeur });
  }
  for (const attendu of FAITS) {
    if (!faits.some((f) => f.cle === attendu.cle)) erreur(slug, `fait « ${attendu.libelle} » absent`);
  }
  return faits;
}

function extraireFiche(page, medias) {
  const utile = avantLeFormulaire(page.content);

  const h1 = utile.match(/<h1\b[^>]*>([\s\S]*?)<\/h1>/i);
  const titre = h1 ? texte(h1[1]) : '';
  if (!titre) erreur(page.slug, '<h1> absent ou vide');

  const images = extraireImages(utile, page, medias);
  if (images.length === 0) erreur(page.slug, 'aucune image');

  // Les paragraphes du corps, hors chrome. L'INTRODUCTION est le premier
  // paragraphe substantiel ; l'INVITATION est celui en italique, en fin de
  // bloc (« Afin que cette application réponde… »).
  const paras = [...utile.matchAll(/<p\b[^>]*>([\s\S]*?)<\/p>/gi)].map((m) => ({
    html: m[1],
    texte: texte(m[1]),
    italique: /^\s*<em\b/i.test(m[1].trim()),
  }));
  const invitationPara = paras.find((p) => p.italique && p.texte.length > 20);
  const introPara = paras.find((p) => !p.italique && p.texte.length > 40);

  if (!introPara) erreur(page.slug, 'paragraphe d’introduction introuvable');
  if (!invitationPara) erreur(page.slug, 'phrase d’invitation (italique) introuvable');

  // DEUX formes de l'introduction, et c'est volontaire. La source met le
  // paragraphe ENTIER en gras (style de la maquette WordPress, pas du sens) :
  // `intro` est le texte nu, prêt à poser dans un chapeau ; `introMarkdown`
  // garde le balisage à la lettre pour qu'aucune nuance ne soit perdue si un
  // gras PARTIEL apparaît un jour (leçon L-restaure : ne rien jeter en route).
  const intro = introPara ? texte(introPara.html) : '';
  const introMarkdown = introPara ? enLigne(introPara.html, (m) => anomalie(page.slug, m)).trim() : '';
  const invitation = invitationPara ? texte(invitationPara.html) : '';

  return {
    titre,
    intro,
    introMarkdown,
    invitation,
    faits: extraireFaits(utile, page.slug),
    images,
  };
}

// ---------------------------------------------------------------------------
// Images : téléchargement + allègement
// ---------------------------------------------------------------------------

/**
 * Nature de l'image — sert au texte `alt` provisoire et au rapport. Un alt
 * faux est pire qu'un alt à réviser : il reste générique et honnête, Julie
 * les réécrit au CMS.
 *  - `banque`   : photo de stock Envato — le nom finit par un horodatage UTC
 *                 (ex. `…-2024-10-18-06-54-21-utc.jpg`). Licence à confirmer ;
 *  - `maquette` : rendu de présentation (MacBook/iPad/scène de bureau). C'est
 *                 TOUJOURS la première image du diaporama — vérifié sur les 12
 *                 fiches qui en ont un — et c'est celle que la fiche affichera
 *                 en tête (product-hero, lot L11). Le nom de fichier seul ne
 *                 suffit pas à la reconnaître (`ppp-1.jpg`, `1.-main-file-1.jpg`) ;
 *  - `capture`  : capture d'écran de l'application (le cas courant).
 */
function natureImage(url, index) {
  const nom = url.split('/').pop().toLowerCase();
  if (/-\d{4}-\d{2}-\d{2}-\d{2}-\d{2}-\d{2}-utc\.\w+$/.test(nom)) return 'banque';
  if (index === 0 || /mockup|custom-scene|workplace/.test(nom)) return 'maquette';
  return 'capture';
}

const ALT_PROVISOIRE = {
  banque: (titre) => `Photographie d’illustration — ${titre}`,
  maquette: (titre) => `Maquette de présentation — ${titre}`,
  capture: (titre) => `Capture d’écran de l’application — ${titre}`,
};

/** Extension normalisée (.jpeg → .jpg), format d'origine conservé. */
function extension(url) {
  const ext = (url.split('.').pop() ?? '').toLowerCase().replace(/[^a-z0-9]/g, '');
  return ext === 'jpeg' ? 'jpg' : ext;
}

async function telecharger(url) {
  const res = await fetch(url, { headers: { 'User-Agent': UA } });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return Buffer.from(await res.arrayBuffer());
}

/**
 * Allègement identique à scripts/optimize-images.mjs (mêmes réglages).
 *
 * Réencoder peut GROSSIR un fichier déjà bien compressé (c'est le cas de
 * plusieurs PNG de captures d'écran) : on garde alors l'ORIGINAL. Les
 * dimensions renvoyées sont donc TOUJOURS celles du fichier réellement écrit
 * — les lire sur le buffer réencodé alors qu'on écrit l'original rendait
 * l'export non rejouable : la relecture du fichier (au passage suivant)
 * trouvait d'autres dimensions, et `--check` signalait un écart fantôme sur
 * les 4 fiches concernées.
 */
async function alleger(source) {
  const meta = await sharp(source).metadata();
  if (!meta.width || !meta.height) throw new Error('image illisible (dimensions absentes)');
  let pipeline = sharp(source, { failOn: 'error' });
  if (meta.width > LARGEUR_MAX) pipeline = pipeline.resize({ width: LARGEUR_MAX, withoutEnlargement: true });
  const reencode =
    meta.format === 'png'
      ? await pipeline.png({ compressionLevel: 9, adaptiveFiltering: true }).toBuffer()
      : await pipeline.jpeg({ quality: 80, mozjpeg: true, progressive: true }).toBuffer();
  const buffer = reencode.length < source.length ? reencode : source;
  const apres = await sharp(buffer).metadata();
  return { buffer, largeur: apres.width, hauteur: apres.height };
}

// ---------------------------------------------------------------------------
// Exécution
// ---------------------------------------------------------------------------

const rel = (p) => p.replace(ROOT, '').replace(/^[\\/]/, '').replace(/\\/g, '/');
const ecrire = (chemin, contenu) => {
  const avant = existsSync(chemin) ? readFileSync(chemin, 'utf8') : null;
  if (avant === contenu) return 'inchange';
  if (CHECK) {
    ecarts.push(`${rel(chemin)} — ${avant === null ? 'absent' : 'différent de la source'}`);
    return 'ecart';
  }
  mkdirSync(dirname(chemin), { recursive: true });
  writeFileSync(chemin, contenu, 'utf8');
  return avant === null ? 'cree' : 'maj';
};

const source = await chargerSource();
const medias = new Map(source.medias.map((m) => [m.id, m]));
const parSlug = new Map(source.pages.map((p) => [p.slug, p]));

// Garde-fou d'appariement : la source ne doit ni perdre ni gagner de fiche
// sans qu'on le sache (une 17ᵉ fiche publiée passerait autrement inaperçue).
for (const f of FICHES) if (!parSlug.has(f.source)) erreur(f.source, 'fiche absente de la source');
const attendus = new Set([...FICHES.map((f) => f.source), ...PAGES_TEXTE.map((p) => p.source)]);
for (const p of source.pages) {
  if (!attendus.has(p.slug)) {
    erreur(p.slug, `page inconnue de la table de correspondance (« ${texte(p.title)} ») — table à mettre à jour`);
  }
}

// --- Fiches ---------------------------------------------------------------
const fiches = [];
for (const f of FICHES) {
  const page = parSlug.get(f.source);
  if (!page) continue;
  const extrait = extraireFiche(page, medias);
  fiches.push({ ...f, page, ...extrait });
}

// Anomalies de CONTENU, repérées d'un bout à l'autre du catalogue.
const parUrlImage = new Map();
for (const fiche of fiches) {
  for (const img of fiche.images) {
    if (!parUrlImage.has(img.url)) parUrlImage.set(img.url, []);
    parUrlImage.get(img.url).push(fiche.cible);
  }
}
const partagees = [...parUrlImage.entries()].filter(([, s]) => new Set(s).size > 1);
for (const [url, slugs] of partagees) {
  anomalie(
    [...new Set(slugs)].join(' + '),
    `même image dans ${new Set(slugs).size} fiches : ${url.split('/').pop()} — à confirmer avec Ø Studio`,
  );
}
const parIntro = new Map();
for (const fiche of fiches) {
  const cle = fiche.intro.toLowerCase().slice(0, 80);
  if (!cle) continue;
  if (!parIntro.has(cle)) parIntro.set(cle, []);
  parIntro.get(cle).push(fiche.cible);
}
for (const [, slugs] of parIntro) {
  if (slugs.length > 1) anomalie(slugs.join(' + '), `introduction IDENTIQUE sur ${slugs.length} fiches — texte à réécrire`);
}

// --- Images ---------------------------------------------------------------
const statsImages = { telechargees: 0, presentes: 0, echecs: 0, octets: 0, ecarts: 0 };
for (const fiche of fiches) {
  const dossier = join(IMAGES_ROOT, fiche.cible);
  fiche.imagesExport = [];
  let n = 0;
  for (const img of fiche.images) {
    n += 1;
    const ext = extension(img.url);
    if (!/^(jpg|png|gif|webp|avif)$/.test(ext)) {
      erreur(fiche.cible, `extension d'image inattendue : ${img.url}`);
      continue;
    }
    const nomFichier = `${String(n).padStart(2, '0')}.${ext}`;
    const chemin = join(dossier, nomFichier);
    const nature = natureImage(img.url, n - 1);
    const entree = {
      fichier: `${IMAGES_URL}/${fiche.cible}/${nomFichier}`,
      source: img.url,
      nature,
      // Les 75 images de la source n'ont AUCUN texte alternatif : celui-ci est
      // provisoire et attend la relecture de Julie (rapport § Textes `alt`).
      alt: ALT_PROVISOIRE[nature](fiche.titre),
      altSource: img.altSource,
      largeur: null,
      hauteur: null,
      octets: null,
    };

    if (SANS_IMAGES) {
      fiche.imagesExport.push(entree);
      continue;
    }
    if (existsSync(chemin) && !FORCE_IMAGES) {
      const buf = readFileSync(chemin);
      const meta = await sharp(buf).metadata();
      Object.assign(entree, { largeur: meta.width, hauteur: meta.height, octets: buf.length });
      statsImages.presentes += 1;
      statsImages.octets += buf.length;
      fiche.imagesExport.push(entree);
      continue;
    }
    if (CHECK) {
      statsImages.ecarts += 1;
      ecarts.push(`${rel(chemin)} — image absente`);
      fiche.imagesExport.push(entree);
      continue;
    }
    try {
      const brut = await telecharger(img.url);
      const { buffer, largeur, hauteur } = await alleger(brut);
      mkdirSync(dossier, { recursive: true });
      writeFileSync(chemin, buffer);
      Object.assign(entree, { largeur, hauteur, octets: buffer.length });
      statsImages.telechargees += 1;
      statsImages.octets += buffer.length;
      console.log(`  ↓ ${fiche.cible}/${nomFichier}  ${(buffer.length / 1024).toFixed(0)} Ko  ← ${img.url.split('/').pop()}`);
    } catch (e) {
      statsImages.echecs += 1;
      erreur(fiche.cible, `téléchargement échoué (${img.url}) : ${e.message}`);
    }
    fiche.imagesExport.push(entree);
  }

  // Images en trop dans le dossier (la source en a retiré une) : signalées,
  // jamais supprimées — un fichier peut avoir été ajouté à la main.
  if (existsSync(dossier)) {
    const attendues = new Set(fiche.imagesExport.map((i) => i.fichier.split('/').pop()));
    for (const nom of readdirSync(dossier)) {
      if (!attendues.has(nom)) anomalie(fiche.cible, `fichier en trop dans public${IMAGES_URL}/${fiche.cible}/ : ${nom}`);
    }
  }
}

// --- Écriture de l'export -------------------------------------------------
const resultats = [];
for (const fiche of fiches) {
  const contenu = {
    _genere_par: 'scripts/migration/export-catalogue-ostudio.mjs',
    _lire_aussi: 'docs/migration/catalogue-ostudio.md (rapport) · docs/plan-import-catalogue-ostudio.md (cible)',
    slug: fiche.cible,
    nouvelle: Boolean(fiche.nouvelle),
    source: {
      slug: fiche.page.slug,
      id: fiche.page.id,
      url: fiche.page.link,
      modifiee: fiche.page.modified,
    },
    titre: fiche.titre,
    intro: fiche.intro,
    introMarkdown: fiche.introMarkdown,
    faits: fiche.faits,
    invitation: fiche.invitation,
    images: fiche.imagesExport,
  };
  resultats.push(ecrire(join(DOSSIER_EXPORT, `${fiche.cible}.json`), `${JSON.stringify(contenu, null, 2)}\n`));
}

// --- Pages de texte libre (Markdown pour Julie) ---------------------------
const textes = [];
for (const p of PAGES_TEXTE) {
  const page = parSlug.get(p.source);
  if (!page) {
    erreur(p.source, 'page de texte absente de la source');
    continue;
  }
  const avertissements = [];
  const corps = versMarkdown(page.content, (m) => avertissements.push(m));
  // Garde-fou de DÉPERDITION (leçon L-restaure) : le Markdown doit contenir
  // autant de mots que la source. Un bloc avalé en silence se voit ici.
  const motsSource = mots(page.content).length;
  const motsSortie = mots(corps).length;
  const perte = motsSource ? (motsSource - motsSortie) / motsSource : 0;
  if (perte > 0.02) {
    erreur(p.source, `déperdition de texte : ${motsSource} mots à la source, ${motsSortie} exportés (${(perte * 100).toFixed(1)} %)`);
  }
  for (const a of new Set(avertissements)) anomalie(p.source, a);

  const entete = [
    `<!-- Export automatique — NE PAS ÉDITER : scripts/migration/export-catalogue-ostudio.mjs -->`,
    ``,
    `# ${p.titre}`,
    ``,
    `> Source : [${page.link}](${page.link}) — page « ${texte(page.title)} », modifiée le ${page.modified.slice(0, 10)}.`,
    `> ${p.usage}`,
    `> ${motsSortie} mots. Ce fichier est de la MATIÈRE pour l'équipe marketing : aucun import automatique.`,
    ``,
    `---`,
    ``,
  ].join('\n');
  textes.push({ ...p, mots: motsSortie });
  resultats.push(ecrire(join(DOSSIER_EXPORT, p.fichier), `${entete}${corps}\n`));
}

// --- Cache de la source ---------------------------------------------------
if (!HORS_LIGNE) {
  resultats.push(ecrire(CACHE, `${JSON.stringify(source, null, 2)}\n`));
}

// --- Rapport --------------------------------------------------------------
const ko = (n) => (n === null || n === undefined ? '—' : `${Math.round(n / 1024)} Ko`);
const lignes = [];
const w = (s = '') => lignes.push(s);

w('# Catalogue Ø Studio — rapport d’export');
w();
w(`> Généré par \`scripts/migration/export-catalogue-ostudio.mjs\` depuis ${source.base}`);
w('> (WordPress FR, API REST ouverte). Le sous-domaine est démantelé au go-live :');
w(`> \`docs/migration/catalogue-ostudio/\` est la copie qui survit. Cache du ${source.recupere}.`);
w();
w('Les fiches du site (sections, route, CloudCannon) sont générées par le lot **L11**');
w('à partir de cet export — pas du réseau. Ce rapport sert à la relecture humaine :');
w('textes `alt` à écrire, images partagées, prix publics à valider (#1634).');
w();
w(`- Fiches exportées : **${fiches.length}** (9 existantes + ${FICHES.filter((f) => f.nouvelle).length} nouvelles)`);
// Le rapport est un FICHIER SUIVI : il ne doit dépendre que de la source et
// du dépôt, jamais du mode d'exécution. « 70 téléchargées » au premier
// passage et « 70 déjà présentes » au suivant décriraient la même réalité
// avec deux textes — et `--check` signalerait un écart à chaque fois. Le
// détail par mode reste dans la sortie console, qui n'est pas un livrable.
w(`- Images : **${statsImages.telechargees + statsImages.presentes}** rapatriées — ${(statsImages.octets / 1048576).toFixed(1)} Mo${statsImages.echecs ? ` · **${statsImages.echecs} en échec**` : ''}`);
w(`- Textes libres : ${textes.map((t) => `\`${t.fichier}\` (${t.mots} mots)`).join(', ')}`);
w(`- Erreurs d’extraction : **${erreurs.length}** · anomalies de contenu : **${new Set(anomalies).size}**`);
w();

w('## Correspondance source → chez nous');
w();
w('| Fiche source | Chez nous | État | Images | Client | Coût | Délai |');
w('| --- | --- | --- | --- | --- | --- | --- |');
for (const f of fiches) {
  const fait = (cle) => f.faits.find((x) => x.cle === cle)?.valeur ?? '—';
  w(
    `| [${f.page.slug}](${f.page.link}) | \`${f.cible}\` | ${f.nouvelle ? '**à créer**' : 'carte existante'} | ` +
      `${f.imagesExport.length} | ${fait('client')} | ${fait('cout')} | ${fait('delai')} |`,
  );
}
w();

w('## Textes `alt` à rédiger (Julie)');
w();
w('Les 75 images de la source n’ont **aucun** texte alternatif. L’export pose un alt');
w('PROVISOIRE, générique et honnête, déduit de la nature du fichier. Chaque ligne est à');
w('réécrire dans CloudCannon (section « Galerie d’images » de la fiche) : décrire ce que');
w('l’image MONTRE, en une phrase, sans répéter le titre de la fiche.');
w();
w('| Image | Nature | Dimensions | Poids | Alt provisoire |');
w('| --- | --- | --- | --- | --- |');
for (const f of fiches) {
  for (const img of f.imagesExport) {
    w(
      `| \`${img.fichier}\` | ${img.nature} | ${img.largeur ? `${img.largeur}×${img.hauteur}` : '—'} | ` +
        `${ko(img.octets)} | ${img.alt} |`,
    );
  }
}
w();

const anomaliesUniques = [...new Set(anomalies)];
if (anomaliesUniques.length) {
  w('## Anomalies de contenu (source)');
  w();
  w('Faits de la source, pas des échecs d’import : à trancher avec Ø Studio / le marketing.');
  w();
  for (const a of anomaliesUniques) w(`- ${a}`);
  w();
}

w('## Points d’attention connus');
w();
w('- **Prix publics** : les fiches affichent des fourchettes de coûts (10 k$ → 500 k$).');
w('  Décision prise : publication en `noindex` jusqu’à la validation Ø Studio (ADO #1634).');
w('- **Photos de banque** (nature « banque », horodatage Envato dans le nom) : licence à');
w('  confirmer avant publication.');
w('- **Anglais** : la source est FR seulement. Les 16 fiches EN demandent une traduction');
w('  de contenu (Victrix) ; sans fichier EN, le sélecteur de langue retombe sur l’accueil.');
w('- **Redirections** : les 16 URL de `o-studio-catalogue.victrix.ca` se redirigent côté');
w('  DNS/Cloudflare, pas dans `routing.json` (#1503).');
w();

if (erreurs.length) {
  w('## Erreurs d’extraction');
  w();
  w('La structure de la source a changé — relire la page avant de réimporter.');
  w();
  for (const e of erreurs) w(`- ${e}`);
  w();
}

resultats.push(ecrire(RAPPORT, `${lignes.join('\n')}\n`));

// --- Verdict --------------------------------------------------------------
const compte = (etat) => resultats.filter((r) => r === etat).length;
console.log();
console.log(
  `Fiches : ${fiches.length} | fichiers écrits : ${compte('cree')} créé(s), ${compte('maj')} mis à jour, ` +
    `${compte('inchange')} inchangé(s) | images : ${statsImages.telechargees} téléchargées, ` +
    `${statsImages.presentes} présentes, ${statsImages.echecs} en échec`,
);
if (anomalies.length) console.log(`ℹ️  ${anomalies.length} anomalie(s) de contenu — voir ${rel(RAPPORT)}`);

if (CHECK && ecarts.length) {
  console.error(`\n✗ ${ecarts.length} écart(s) entre la source et le dépôt :`);
  for (const e of ecarts.slice(0, 20)) console.error(`  - ${e}`);
  if (ecarts.length > 20) console.error(`  … et ${ecarts.length - 20} autre(s)`);
  console.error('Rejouer sans --check pour les absorber.');
  process.exit(1);
}
if (erreurs.length) {
  console.error(`\n✗ ${erreurs.length} erreur(s) d’extraction — la source ne répond plus au patron attendu :`);
  for (const e of erreurs) console.error(`  - ${e}`);
  process.exit(1);
}
console.log('✓ Export conforme au patron attendu.');
