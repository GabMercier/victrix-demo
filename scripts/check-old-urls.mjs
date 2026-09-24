/**
 * `check:old-urls` — une adresse de l'ANCIEN site mène-t-elle quelque part ?
 *
 * LA QUESTION QUE PERSONNE NE POSAIT. Le dépôt avait déjà deux garde-fous sur
 * les redirections, et aucun des deux ne pouvait voir le défaut qui a coûté le
 * plus cher :
 *   - `check:redirects --dist` vérifie que la CIBLE d'une règle existe. Il ne
 *     vérifie jamais que la règle se DÉCLENCHE.
 *   - `check:links --strict` vérifie les liens INTERNES du site construit. Il
 *     ne connaît pas les liens ENTRANTS — ceux de Google, de LinkedIn, des
 *     courriels, des signets.
 * Résultat mesuré le 2026-09-22 : 105 des 184 anciennes URL rendaient un 404
 * sur le site déployé, avec 100 % des règles écrites et 100 % des cibles
 * existantes. La cause (barre oblique finale) est corrigée depuis — mais rien
 * n'empêchait la régression de revenir. C'est ce que ce script ferme.
 *
 * CE QU'IL FAIT. Pour chaque adresse du périmètre il rejoue le PARCOURS que
 * ferait un visiteur, contre les artefacts RÉELLEMENT livrés :
 *   - `dist/_cloudcannon/routing.json` — les règles telles que l'hébergement
 *     de production les lira (première correspondance gagne) ;
 *   - `dist/` — les pages telles qu'elles sont construites.
 * Il classe chaque adresse en : page directe · redirection en UN saut ·
 * CHAÎNE (301 → 301, un saut de trop, Google n'en suit qu'un petit nombre) ·
 * redirection vers une page ABSENTE · AUCUNE règle.
 *
 * PÉRIMÈTRE (tranché avec Gabriel le 2026-09-22) : l'UNION du plan de site en
 * ligne (docs/migration/urls-live.csv) et des contenus publiés de l'export
 * WordPress (docs/migration/urls-contenus.csv). L'union, et non l'un ou
 * l'autre, parce qu'elle attrape les pages NON INDEXÉES encore en circulation.
 * Les 943 médias sont hors périmètre de cette passe.
 *
 * RAPPORT SEUL — CODE DE SORTIE 0. Première marche volontaire, la même que
 * `check:prefill` en son temps : Gabriel tranche d'abord les cas douteux, la
 * liste d'exceptions assumées s'écrit ensuite, et le script devient bloquant
 * au gate et en CI dans un second temps (décision 8 du §8 de
 * docs/migration/plan-redirections.md). Un rapport qu'on peut lire vaut mieux
 * qu'un verrou qu'on contourne.
 *
 * Usage :
 *   node scripts/check-old-urls.mjs                  # dist/ du dépôt
 *   node scripts/check-old-urls.mjs --dist <chemin>  # build isolé (serveur de dev actif)
 *   node scripts/check-old-urls.mjs --strict         # code 1 s'il reste un cas non résolu
 */
import { readFileSync, existsSync, writeFileSync, mkdirSync } from 'node:fs';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const RACINE = join(dirname(fileURLToPath(import.meta.url)), '..');
const STRICT = process.argv.includes('--strict');
const iDist = process.argv.indexOf('--dist');
const DIST = resolve(RACINE, iDist !== -1 ? (process.argv[iDist + 1] ?? 'dist') : 'dist');
const RAPPORT = join(RACINE, 'docs', 'migration', 'validation-301.md');

/** Au-delà, on considère qu'on tourne en rond. */
const SAUTS_MAX = 5;

/* ------------------------------------------------------------------ CSV */

/** Découpe une ligne CSV en respectant les guillemets (les titres en ont). */
function decoupe(ligne) {
  const champs = [];
  let courant = '';
  let dansGuillemets = false;
  for (let i = 0; i < ligne.length; i++) {
    const c = ligne[i];
    if (c === '"') {
      if (dansGuillemets && ligne[i + 1] === '"') {
        courant += '"';
        i++;
      } else dansGuillemets = !dansGuillemets;
    } else if (c === ',' && !dansGuillemets) {
      champs.push(courant);
      courant = '';
    } else courant += c;
  }
  champs.push(courant);
  return champs;
}

function lireCsv(chemin) {
  const lignes = readFileSync(chemin, 'utf8').split(/\r?\n/).filter(Boolean);
  const entetes = decoupe(lignes[0]).map((h) => h.replace(/^"|"$/g, ''));
  return lignes.slice(1).map((l) => {
    const champs = decoupe(l);
    return Object.fromEntries(entetes.map((h, i) => [h, (champs[i] ?? '').replace(/^"|"$/g, '')]));
  });
}

/* ------------------------------------------------------------- périmètre */

/** Normalise vers la forme INDEXÉE : barre oblique finale, jamais de double. */
function normalise(chemin) {
  if (!chemin) return '';
  let p = chemin.trim();
  if (!p.startsWith('/')) p = '/' + p;
  p = p.replace(/\/{2,}/g, '/');
  if (!p.endsWith('/') && !/\.[a-z0-9]{2,5}$/i.test(p)) p += '/';
  return p;
}

const perimetre = new Map(); // chemin -> Set des origines

function ajoute(chemin, origine) {
  const p = normalise(chemin);
  // Médias hors périmètre de cette passe (décision du 2026-09-22).
  if (!p || p.startsWith('/wp-content/uploads/')) return;
  if (!perimetre.has(p)) perimetre.set(p, new Set());
  perimetre.get(p).add(origine);
}

for (const r of lireCsv(join(RACINE, 'docs', 'migration', 'urls-live.csv'))) {
  ajoute(r.chemin, 'plan de site en ligne');
}
for (const r of lireCsv(join(RACINE, 'docs', 'migration', 'urls-contenus.csv'))) {
  // Les brouillons ne sont pas en ligne : ils n'ont pas d'adresse à honorer.
  if (r.statut === 'publish') ajoute(r.chemin, `export WordPress (${r.type})`);
}

/* ---------------------------------------------------------- les artefacts */

const cheminRouting = join(DIST, '_cloudcannon', 'routing.json');
if (!existsSync(cheminRouting)) {
  console.error(
    `[check:old-urls] ${cheminRouting} est introuvable.\n` +
      "Ce garde-fou relit les artefacts LIVRÉS : il faut un build. Lance `npm run build`,\n" +
      'ou, si le serveur de dev tourne (port 4321), builde dans une copie isolée\n' +
      '(docs/operations.md § 3.1) puis passe `--dist <chemin>/dist`.',
  );
  process.exit(2);
}
const routing = JSON.parse(readFileSync(cheminRouting, 'utf8'));
const routes = routing.routes ?? [];

/**
 * Une règle correspond-elle ? `from` est écrit soit en chemin EXACT, soit avec
 * le joker `(.*)` de l'exemple officiel CloudCannon, `to` reprenant `$1`.
 * Première correspondance gagne — c'est la sémantique documentée, et c'est
 * elle qui fait qu'un joker `/expertise/(.*)` placé trop tôt masquerait les
 * règles précises (raison pour laquelle build-redirects.mjs écrit les jokers
 * EN DERNIER).
 */
const echappe = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/** Cache des expressions compilées : `applique` est appelée ~1 000 fois. */
const motifs = new Map();
function motifDe(from) {
  if (!motifs.has(from)) {
    // On découpe sur le joker LITTÉRAL `(.*)` et on échappe le reste : écrire
    // un échappement qui épargne `(` et `)` produirait `(\.*)`, un groupe qui
    // ne capture que des points — faute commise et corrigée ici même.
    const morceaux = from.split('(.*)').map(echappe);
    motifs.set(from, new RegExp('^' + morceaux.join('(.*)') + '$'));
  }
  return motifs.get(from);
}

function applique(chemin) {
  for (const r of routes) {
    if (r.from === chemin) return { regle: r, vers: r.to };
    if (r.from.includes('(.*)')) {
      const m = motifDe(r.from).exec(chemin);
      if (m) return { regle: r, vers: r.to.replace('$1', m[1] ?? '') };
    }
  }
  return null;
}

/** La page existe-t-elle dans le build ? (statique Astro : dossier/index.html) */
const cachePages = new Map();
function pageExiste(chemin) {
  if (cachePages.has(chemin)) return cachePages.get(chemin);
  const p = chemin.split('#')[0].split('?')[0];
  const candidats = p.endsWith('/')
    ? [join(DIST, p, 'index.html'), join(DIST, p.slice(0, -1) + '.html')]
    : [join(DIST, p), join(DIST, p + '.html'), join(DIST, p, 'index.html')];
  const trouve = candidats.some((c) => existsSync(c));
  cachePages.set(chemin, trouve);
  return trouve;
}

/* ------------------------------------------------------------- le parcours */

const RESULTATS = {
  page: [],          // l'adresse n'a pas bougé
  unSaut: [],        // une redirection, une page
  chaine: [],        // 301 -> 301 -> … : un saut de trop
  cibleAbsente: [],  // la règle part, la page d'arrivée n'existe pas
  sansRegle: [],     // rien n'est prévu
};

for (const [chemin, origines] of [...perimetre].sort()) {
  const source = [...origines].join(', ');

  if (pageExiste(chemin)) {
    RESULTATS.page.push({ chemin, source });
    continue;
  }

  const sauts = [];
  let courant = chemin;
  let statut = 'sansRegle';
  for (let i = 0; i < SAUTS_MAX; i++) {
    const r = applique(courant);
    if (!r) {
      statut = sauts.length === 0 ? 'sansRegle' : 'cibleAbsente';
      break;
    }
    sauts.push({ de: courant, vers: r.vers, code: r.regle.status });
    courant = r.vers;
    if (pageExiste(courant)) {
      statut = sauts.length === 1 ? 'unSaut' : 'chaine';
      break;
    }
    // La cible est-elle elle-même source d'une règle ? Si non, c'est un 404.
    if (!applique(courant)) {
      statut = 'cibleAbsente';
      break;
    }
  }
  RESULTATS[statut].push({ chemin, source, sauts, arrivee: courant });
}

/* ------------------------------------------------- deux nuances mesurées */

/**
 * (a) CIBLE SANS BARRE FINALE — VÉRIFIÉ, ET SANS CONSÉQUENCE.
 * `build-redirects.mjs` écrit les destinations sans barre oblique
 * (`/fr/contact`). On a d'abord cru que l'hôte ajouterait un 307 de
 * canonisation, donc un saut de plus par adresse. C'est FAUX, et c'était la
 * décision 6 du §8 de plan-redirections.md : mesuré au `curl` sur
 * vocal-wren.cloudvent.net le 2026-09-23, `/fr/decouvrir`, `/fr/carrieres`,
 * `/fr/contact`, `/en/services` et `/fr/services/cybersecurite` répondent tous
 * **200 directement**, sans redirection. Le 307 observé la veille portait sur
 * un chemin à la CASSE différente (`/Decouvrir-Victrix`), qui ne correspond à
 * aucune règle et tombe sur la canonisation de l'hôte — une autre situation.
 * On compte quand même ces cibles, pour que le chiffre soit au rapport et que
 * personne n'ait à refaire la mesure.
 */
const cibleSansBarre = [...RESULTATS.unSaut, ...RESULTATS.chaine].filter((e) => {
  const a = e.arrivee.split('#')[0].split('?')[0];
  return !a.endsWith('/') && !/\.[a-z0-9]{2,5}$/i.test(a);
});

/**
 * (b) ARRIVÉE GÉNÉRIQUE. Une règle à joker (`/expertise/(.*)` → `/fr/services`)
 * renvoie TOUT un rayon sur une page d'accueil de rubrique. Techniquement
 * l'adresse « arrive quelque part » ; pour le référencement c'est un soft 404 :
 * la page précise existe peut-être, la règle ne l'atteint jamais.
 */
const arriveeGenerique = [...RESULTATS.unSaut, ...RESULTATS.chaine].filter((e) =>
  e.sauts.some((s) => routes.find((r) => r.to === s.vers && r.from.includes('(.*)'))),
);

/* ---------------------------------------------------------------- rapport */

const total = perimetre.size;
const ok = RESULTATS.page.length + RESULTATS.unSaut.length;
const casse = RESULTATS.chaine.length + RESULTATS.cibleAbsente.length + RESULTATS.sansRegle.length;

function tableau(entrees, colonneParcours) {
  if (!entrees.length) return '_Aucune._\n';
  const l = ['| Adresse de l\'ancien site | ' + colonneParcours + ' | Vue par |', '| --- | --- | --- |'];
  for (const e of entrees) {
    const parcours = e.sauts?.length
      ? e.sauts.map((s) => `${s.code} → \`${s.vers}\``).join(' puis ')
      : '—';
    l.push(`| \`${e.chemin}\` | ${parcours} | ${e.source} |`);
  }
  return l.join('\n') + '\n';
}

const lignes = [
  '# Validation des adresses de l\'ancien site',
  '',
  '> Généré par `npm run check:old-urls` — **ne pas modifier à la main.**',
  `> Mesuré contre le build \`${DIST.replace(RACINE, '.')}\` et ses ${routes.length} routes`,
  '> (`dist/_cloudcannon/routing.json`, ce que lira l\'hébergement de production).',
  '',
  'La question posée, adresse par adresse : **si quelqu\'un la tape aujourd\'hui,',
  'où arrive-t-il ?** Les liens entrants (Google, LinkedIn, courriels, signets)',
  'ne passent par aucun des autres garde-fous du dépôt.',
  '',
  '## Bilan',
  '',
  '| | Nombre |',
  '| --- | --- |',
  `| Adresses au périmètre | ${total} |`,
  `| Arrivent sur une page | **${ok}** |`,
  `| dont sans bouger (la page existe à la même adresse) | ${RESULTATS.page.length} |`,
  `| dont par une redirection, en un saut | ${RESULTATS.unSaut.length} |`,
  `| N'arrivent pas | **${casse}** |`,
  `| dont chaîne de redirections (un saut de trop) | ${RESULTATS.chaine.length} |`,
  `| dont redirigées vers une page absente | ${RESULTATS.cibleAbsente.length} |`,
  `| dont aucune règle | ${RESULTATS.sansRegle.length} |`,
  '',
  '## Deux nuances derrière le mot « arrivent »',
  '',
  `**${cibleSansBarre.length} redirections visent une adresse sans barre oblique finale** (\`/fr/contact\`),`,
  'et c\'est **sans conséquence** : vérifié au `curl` sur le site déployé le',
  '2026-09-23, ces adresses répondent **200 directement**, sans 307 de',
  'canonisation. La crainte d\'un saut supplémentaire — décision 6 du § 8 de',
  '`plan-redirections.md` — est donc levée, et la décision est : **ne rien**',
  '**changer**. Le 307 observé la veille portait sur un chemin à la casse',
  'différente (`/Decouvrir-Victrix`), qui ne correspond à aucune règle.',
  '',
  `**${arriveeGenerique.length} adresses n'arrivent que par une règle à joker**, c'est-à-dire sur la`,
  'page d\'accueil d\'une rubrique et non sur la page qui les remplace vraiment.',
  'Pour un visiteur c\'est un détour ; pour Google c\'est un *soft 404*, et le',
  'référencement de l\'ancienne page ne se transfère pas. À regarder quand une',
  'page précise existe bel et bien dans la refonte.',
  '',
  tableau(arriveeGenerique.slice(0, 40), 'Parcours (arrivée générique)'),
  '## Chaînes de redirections',
  '',
  'Google ne suit qu\'un petit nombre de sauts et dilue le référencement à',
  'chacun. Une chaîne se corrige en faisant pointer la première règle',
  'directement sur la destination finale.',
  '',
  tableau(RESULTATS.chaine, 'Parcours'),
  '## Redirigées vers une page absente',
  '',
  'La règle part bien, mais la page d\'arrivée n\'existe pas dans le build.',
  '',
  tableau(RESULTATS.cibleAbsente, 'Parcours'),
  '## Aucune règle',
  '',
  'Rien n\'est prévu pour ces adresses : elles rendront la page 404.',
  '',
  tableau(RESULTATS.sansRegle, 'Parcours'),
];

mkdirSync(dirname(RAPPORT), { recursive: true });
writeFileSync(RAPPORT, lignes.join('\n'), 'utf8');

/* -------------------------------------- rafraîchissement du registre de Julie
 * docs/inventaire-pages.md est le support de VALIDATION de l'éditrice (#1765).
 * Sa colonne « État mesuré » datait du 2026-09-22 AVANT le correctif de barre
 * finale (`67f9337`) : 105 lignes y annonçaient un 404 qui n'existe plus. Un
 * registre qui ment est pire que pas de registre — on remet donc la colonne à
 * jour depuis la mesure qu'on vient de faire, au lieu de la laisser vieillir.
 * Les autres colonnes (destination, mécanisme, source du contenu) sont le
 * travail éditorial de la passe du 22/09 : on n'y touche pas.
 */
const REGISTRE = join(RACINE, 'docs', 'inventaire-pages.md');
if (existsSync(REGISTRE)) {
  const etatPar = new Map();
  for (const e of RESULTATS.page) etatPar.set(e.chemin, '**200** — même adresse');
  for (const e of RESULTATS.unSaut) etatPar.set(e.chemin, '**200** en 1 saut');
  for (const e of RESULTATS.chaine) etatPar.set(e.chemin, `**200** en ${e.sauts.length} sauts — chaîne`);
  for (const e of RESULTATS.cibleAbsente) etatPar.set(e.chemin, '**404** — redirigée vers une page absente');
  for (const e of RESULTATS.sansRegle) etatPar.set(e.chemin, '**404** — aucune règle');

  /** Remplace le corps d'une section `## Titre` jusqu'au prochain `## `. */
  function remplaceSection(texte, titre, corps) {
    const debut = texte.indexOf(`\n## ${titre}\n`);
    if (debut === -1) return texte;
    const apres = texte.indexOf('\n## ', debut + 1);
    const fin = apres === -1 ? texte.length : apres;
    return texte.slice(0, debut) + `\n## ${titre}\n\n` + corps.trimEnd() + '\n' + texte.slice(fin);
  }

  let touchees = 0;
  const majRegistre = readFileSync(REGISTRE, 'utf8')
    .split('\n')
    .map((ligne) => {
      // Lignes de registre : | `/chemin/` | LANGUE | ... | mécanisme | état | source |
      const m = /^\| `([^`]+)` \| (FR|EN) \| (.*) \| ([^|]*) \| ([^|]*) \|\s*$/.exec(ligne);
      if (!m) return ligne;
      const etat = etatPar.get(normalise(m[1]));
      if (!etat) return ligne;
      touchees++;
      return `| \`${m[1]}\` | ${m[2]} | ${m[3]} | ${etat} | ${m[5]} |`;
    })
    .join('\n')
    .replace(
      /Ce que le site \*\*déployé\*\* répond vraiment, mesuré le [^.]+\./,
      'Ce que le parcours donne contre le dernier build, mesuré par ' +
        '`npm run check:old-urls` (rapport détaillé : `docs/migration/validation-301.md`).',
    );

  const verdict = [
    casse === 0
      ? `**Les ${total} adresses de l'ancien site mènent toutes quelque part.**`
      : `**${casse} des ${total} adresses de l'ancien site ne mènent nulle part.**`,
    '',
    'Mesuré par `npm run check:old-urls`, qui rejoue le parcours de chaque',
    'adresse contre les règles réellement livrées (`dist/_cloudcannon/routing.json`)',
    'et les pages réellement construites. Rapport détaillé :',
    '`docs/migration/validation-301.md`.',
    '',
    '| | Nombre |',
    '| --- | --- |',
    `| Adresses de l'ancien site inventoriées | ${total} |`,
    `| Arrivent sur une page | **${ok}** |`,
    `| dont sans bouger | ${RESULTATS.page.length} |`,
    `| dont par une redirection, en un saut | ${RESULTATS.unSaut.length} |`,
    `| Ne mènent nulle part | **${casse}** |`,
    `| dont chaînes de redirections | ${RESULTATS.chaine.length} |`,
    `| dont redirigées vers une page absente | ${RESULTATS.cibleAbsente.length} |`,
    `| dont aucune règle | ${RESULTATS.sansRegle.length} |`,
  ].join('\n');

  const cibleAbsenteSection = RESULTATS.cibleAbsente.length
    ? [
        'Une redirection vers une page absente est **pire** qu\'une page absente :',
        'Google suit la redirection, ne trouve rien, et l\'ancienne page perd son',
        'référencement sans rien transmettre.',
        '',
        tableau(RESULTATS.cibleAbsente, 'Parcours'),
      ].join('\n')
    : [
        '**Aucune.** Les 10 cas relevés le 2026-09-22 — tous des anciennes adresses',
        '`/expertise/…` que le joker `/expertise/(.*)` avalait avant que leur règle',
        'précise ne se déclenche — sont réglés depuis le commit `67f9337` (les règles',
        'exactes sont émises sous leurs deux formes, avec et sans barre finale, et',
        'passent donc avant le joker).',
      ].join('\n');

  const registreFinal = remplaceSection(
    remplaceSection('\n' + majRegistre, 'Verdict', verdict),
    'À part : les redirections qui mènent à une page absente',
    cibleAbsenteSection,
  ).replace(/^\n/, '');

  if (touchees) {
    writeFileSync(REGISTRE, registreFinal, 'utf8');
    console.log(`  Registre : ${touchees} ligne(s) d'état rafraîchie(s) dans ./docs/inventaire-pages.md`);
  }
}

console.log('check:old-urls — parcours des adresses de l\'ancien site');
console.log('');
console.log(`  Périmètre            : ${total} adresses (plan de site en ligne ∪ export WordPress, médias exclus)`);
console.log(`  Routes lues          : ${routes.length} (${cheminRouting.replace(RACINE, '.')})`);
console.log(`  Arrivent sur une page: ${ok}  (${RESULTATS.page.length} sans bouger, ${RESULTATS.unSaut.length} en un saut)`);
console.log(`  N'arrivent pas       : ${casse}  (${RESULTATS.chaine.length} chaînes, ${RESULTATS.cibleAbsente.length} cibles absentes, ${RESULTATS.sansRegle.length} sans règle)`);
console.log('');
console.log(`  Nuance 1 — cible sans barre finale : ${cibleSansBarre.length} (vérifié au curl : 200 direct, aucun saut de plus)`);
console.log(`  Nuance 2 — arrivée générique (joker) : ${arriveeGenerique.length} (soft 404 pour Google)`);
console.log('');
console.log(`  Rapport : ${RAPPORT.replace(RACINE, '.')}`);

if (STRICT && casse > 0) {
  console.error(`\n  --strict : ${casse} adresse(s) n'arrivent nulle part.`);
  process.exit(1);
}
// Rapport seul par défaut — voir l'en-tête.
process.exit(0);
