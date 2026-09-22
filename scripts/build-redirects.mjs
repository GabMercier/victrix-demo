/**
 * Génère la matrice de redirections de la MIGRATION (#1503).
 *
 * Pourquoi un fichier à part de `src/data/redirects.json` : ce dernier est la
 * collection « Redirections » de CloudCannon — l'éditrice y saisit ses règles
 * à la main, et on ne veut pas noyer son écran sous ~150 lignes mécaniques.
 * Ici, tout est DÉRIVÉ du contenu et des tables de décision, donc rejouable :
 *
 *   src/data/redirects-migration.json   ← généré, ne pas éditer à la main
 *   docs/migration/correspondance-urls.json ← les DÉCISIONS (renommages,
 *                                             anciennes URL, abandons)
 *
 * Sources d'URL anciennes :
 *   - docs/migration/urls-contenus.csv  (export WordPress du 23/07, 174 contenus)
 *   - docs/migration/urls-live.csv      (plan de site EN LIGNE — le site a bougé
 *                                        depuis l'export : 9 articles renommés)
 *     régénérable par `python scripts/migration/check-parite-live.py`
 *
 * Cible : l'hébergement de production (CloudCannon) ignore `_redirects` et lit
 * `.cloudcannon/routing.json` (lot L15). Les deux sorties partent de la même
 * liste : ce script produit la DONNÉE, L15 produira le routing.json.
 *
 *   node scripts/build-redirects.mjs            # écrit le fichier
 *   node scripts/build-redirects.mjs --check    # échoue si le fichier est périmé
 *                                               # ou si une URL reste sans cible
 */
import fs from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';

const RACINE = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SORTIE = path.join(RACINE, 'src', 'data', 'redirects-migration.json');
const DECISIONS = path.join(RACINE, 'docs', 'migration', 'correspondance-urls.json');

/** Préfixe d'URL des services (doit suivre src/lib/navigation/service-links.ts). */
const PREFIXE_SERVICES = 'services';

const verifie = process.argv.includes('--check');

/* ------------------------------------------------------------------ outils */

const lireJson = async (p) => JSON.parse(await fs.readFile(p, 'utf-8'));

/** Frontmatter YAML plat (title/slug/wpUrl…) — suffisant pour nos champs. */
function frontmatter(texte) {
  const m = /^---\r?\n([\s\S]*?)\r?\n---/.exec(texte);
  if (!m) return {};
  const out = {};
  for (const ligne of m[1].split(/\r?\n/)) {
    const mm = /^([A-Za-z0-9_]+):\s*(.*)$/.exec(ligne);
    if (mm) out[mm[1]] = mm[2].trim().replace(/^["']|["']$/g, '');
  }
  return out;
}

function csv(texte) {
  const lignes = texte.split(/\r?\n/).filter((l) => l.length > 0);
  const entete = decoupe(lignes[0]);
  return lignes.slice(1).map((l) => {
    const cellules = decoupe(l);
    return Object.fromEntries(entete.map((k, i) => [k, cellules[i] ?? '']));
  });
}

/** Découpe une ligne CSV en respectant les guillemets. */
function decoupe(ligne) {
  const out = [];
  let cur = '';
  let dans = false;
  for (let i = 0; i < ligne.length; i += 1) {
    const c = ligne[i];
    if (c === '"') {
      if (dans && ligne[i + 1] === '"') {
        cur += '"';
        i += 1;
      } else dans = !dans;
    } else if (c === ',' && !dans) {
      out.push(cur);
      cur = '';
    } else cur += c;
  }
  out.push(cur);
  return out;
}

const avecBarre = (u) => (u.endsWith('/') ? u : `${u}/`);
const sansBarre = (u) => (u.length > 1 && u.endsWith('/') ? u.replace(/\/+$/, '') : u);
const dernierSegment = (u) => {
  const parts = u.split('/').filter(Boolean);
  return (parts[parts.length - 1] ?? '').toLowerCase();
};
const langueDe = (u) => (u === '/en' || u.startsWith('/en/') ? 'en' : 'fr');

/* ------------------------------------------- index du contenu du nouveau site */

/** Toutes les entrées de contenu, avec leur URL FINALE et leurs clés de rapprochement. */
async function indexContenu() {
  const entrees = [];
  const racine = path.join(RACINE, 'src', 'content');

  async function parcours(dossier) {
    for (const e of await fs.readdir(dossier, { withFileTypes: true })) {
      const complet = path.join(dossier, e.name);
      if (e.isDirectory()) await parcours(complet);
      else if (/\.(md|json)$/.test(e.name)) await ajoute(complet);
    }
  }

  async function ajoute(complet) {
    const rel = path.relative(RACINE, complet).split(path.sep).join('/');
    const [, , collection, ...reste] = rel.split('/');
    if (!collection || reste.length === 0) return;
    const lang = ['fr', 'en'].includes(reste[0]) ? reste[0] : '';
    if (!lang) return; // solutions/*.json à la racine = vestiges, pas de route
    const cheminFichier = reste.slice(1).join('/').replace(/\.(md|json)$/, '');
    const texte = await fs.readFile(complet, 'utf-8');
    let donnees = {};
    if (rel.endsWith('.md')) donnees = frontmatter(texte);
    else {
      try {
        donnees = JSON.parse(texte);
      } catch {
        return;
      }
    }
    const slug = typeof donnees.slug === 'string' && donnees.slug ? donnees.slug : cheminFichier;
    let url = null;
    if (collection === 'blog') url = `/${lang}/ressources/${slug}/`;
    else if (collection === 'services') url = `/${lang}/${PREFIXE_SERVICES}/${slug}/`;
    else if (collection === 'solutions') url = `/${lang}/solutions/${slug}/`;
    else if (collection === 'landing') url = `/${lang}/campagnes/${slug}/`;
    else if (collection === 'pages') url = `/${lang}/${slug}/`;
    else if (collection === 'home') url = `/${lang}/`;
    if (!url) return;
    entrees.push({
      fichier: rel,
      collection,
      lang,
      cheminFichier,
      slug,
      url,
      wpUrl: typeof donnees.wpUrl === 'string' ? donnees.wpUrl : '',
    });
  }

  await parcours(racine);
  return entrees;
}

/* ------------------------------------------------------------------ principal */

const decisions = await lireJson(DECISIONS);
const contenu = await indexContenu();

// Index de rapprochement : par wpUrl, puis par dernier segment (par langue).
const parWpUrl = new Map();
const parSegment = new Map();
for (const e of contenu) {
  if (e.wpUrl) parWpUrl.set(avecBarre(e.wpUrl.toLowerCase()), e);
  for (const cle of [e.slug, e.cheminFichier]) {
    const k = `${e.lang}|${dernierSegment(cle)}`;
    if (!parSegment.has(k)) parSegment.set(k, e);
  }
}

// URL anciennes : export du 23/07 (publiées) + plan de site en ligne.
const anciennes = new Map(); // chemin -> { chemin, origine[] }
const ajouteAncienne = (chemin, origine) => {
  if (!chemin.startsWith('/') || chemin.includes('?')) return;
  const c = avecBarre(chemin);
  const dejaLa = anciennes.get(c);
  if (dejaLa) dejaLa.origine.push(origine);
  else anciennes.set(c, { chemin: c, origine: [origine] });
};

for (const r of csv(await fs.readFile(path.join(RACINE, 'docs/migration/urls-contenus.csv'), 'utf-8'))) {
  if (r.statut === 'publish') ajouteAncienne(r.chemin, `export:${r.type}`);
}
for (const r of csv(await fs.readFile(path.join(RACINE, 'docs/migration/urls-live.csv'), 'utf-8'))) {
  ajouteAncienne(r.chemin, `enligne:${r.type}`);
}
// URL anciennes trouvées hors plan de site (balayage du 21/09) et décisions.
for (const [de, vers] of Object.entries(decisions.manuel)) {
  ajouteAncienne(de, 'decision:manuel');
  void vers;
}
for (const de of Object.keys(decisions.abandonnees)) ajouteAncienne(de, 'decision:abandon');
for (const de of Object.keys(decisions.temporaires)) ajouteAncienne(de, 'decision:temporaire');

const regles = [];
const nonResolues = [];
const ignorees = new Set(decisions.ignorer);
const dejaAilleurs = new Set(Object.keys(decisions.deja_dans_astro_config));

for (const { chemin, origine } of [...anciennes.values()].sort((a, b) => a.chemin.localeCompare(b.chemin))) {
  if (ignorees.has(chemin) || dejaAilleurs.has(chemin) || dejaAilleurs.has(sansBarre(chemin))) continue;
  const lang = langueDe(chemin);
  let vers = null;
  let code = 301;
  let raison = '';

  if (decisions.manuel[chemin]) {
    vers = decisions.manuel[chemin];
    raison = 'décision';
  } else if (decisions.abandonnees[chemin]) {
    vers = decisions.abandonnees[chemin];
    raison = 'page non reprise';
  } else if (decisions.temporaires[chemin]) {
    vers = decisions.temporaires[chemin];
    code = 302;
    raison = 'page à recréer (302)';
  } else if (parWpUrl.has(chemin.toLowerCase())) {
    vers = parWpUrl.get(chemin.toLowerCase()).url;
    raison = 'wpUrl';
  } else {
    const e = parSegment.get(`${lang}|${dernierSegment(chemin)}`);
    if (e) {
      vers = e.url;
      raison = 'slug';
    }
  }

  if (!vers) {
    nonResolues.push({ chemin, origine });
    continue;
  }
  if (sansBarre(chemin) === sansBarre(vers)) continue; // rien à rediriger
  regles.push({ de: sansBarre(chemin), vers: sansBarre(vers), code, _raison: raison });
}

// Ordre : les chemins les plus profonds d'abord (une règle exacte ne doit
// jamais être masquée par une règle plus générale — `_redirects` et
// routing.json appliquent la PREMIÈRE correspondance).
regles.sort((a, b) => {
  const pa = a.de.split('/').length;
  const pb = b.de.split('/').length;
  return pb - pa || a.de.localeCompare(b.de);
});

const doublons = new Map();
for (const r of regles) doublons.set(r.de, (doublons.get(r.de) ?? 0) + 1);
const enDouble = [...doublons.entries()].filter(([, n]) => n > 1);

const sortie = `${JSON.stringify(
  regles.map(({ de, vers, code }) => ({ de, vers, code })),
  null,
  2
)}\n`;

const resume = `${regles.length} règle(s) — ${nonResolues.length} URL sans cible, ${enDouble.length} doublon(s)`;

/* ----------------------------------------- vérification des cibles dans dist/ */
// Une 301 vers un 404 est PIRE qu'un 404 : Google suit la redirection, trouve
// une page absente, et la page d'origine perd son référencement sans rien
// gagner. Ce mode exige donc un build (`--dist` après `npm run build`).
const iDist = process.argv.indexOf('--dist');
if (iDist !== -1) {
  const dossierDist = path.resolve(RACINE, process.argv[iDist + 1] ?? 'dist');
  const existe = async (p) => {
    try {
      await fs.access(p);
      return true;
    } catch {
      return false;
    }
  };
  const cassees = [];
  for (const r of regles) {
    if (!r.vers.startsWith('/')) continue; // URL externe
    const cible = r.vers === '/' ? 'index.html' : path.join(...r.vers.split('/').filter(Boolean), 'index.html');
    if (!(await existe(path.join(dossierDist, cible)))) cassees.push(r);
  }
  if (cassees.length > 0) {
    console.error(`[redirections] ${cassees.length} cible(s) ABSENTE(S) du site construit :`);
    for (const r of cassees) console.error(`  - ${r.de} -> ${r.vers}   (${r._raison})`);
    process.exit(1);
  }
  console.log(`[redirections] cibles vérifiées dans ${path.relative(RACINE, dossierDist)} : ${regles.length}/${regles.length} existent`);
  process.exit(0);
}

if (verifie) {
  let actuel = null;
  try {
    actuel = await fs.readFile(SORTIE, 'utf-8');
  } catch {
    /* absent */
  }
  const problemes = [];
  if (actuel !== sortie) problemes.push(`${path.relative(RACINE, SORTIE)} est périmé — relancer « npm run build:redirects »`);
  for (const n of nonResolues) problemes.push(`aucune cible pour ${n.chemin} (vu dans ${n.origine.join(', ')})`);
  for (const [de] of enDouble) problemes.push(`« de » en double : ${de}`);
  if (problemes.length > 0) {
    console.error('[redirections] ÉCHEC');
    for (const p of problemes) console.error(`  - ${p}`);
    process.exit(1);
  }
  console.log(`[redirections] OK — ${resume}`);
} else {
  await fs.writeFile(SORTIE, sortie, 'utf-8');
  console.log(`[redirections] ${path.relative(RACINE, SORTIE)} écrit — ${resume}`);
  const parRaison = {};
  for (const r of regles) parRaison[r._raison] = (parRaison[r._raison] ?? 0) + 1;
  for (const [k, v] of Object.entries(parRaison)) console.log(`    ${v} par ${k}`);
  if (nonResolues.length > 0) {
    console.log('  URL SANS CIBLE (à trancher dans docs/migration/correspondance-urls.json) :');
    for (const n of nonResolues) console.log(`    ${n.chemin}   [${n.origine.join(', ')}]`);
  }
}
