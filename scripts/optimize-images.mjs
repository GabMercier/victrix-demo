/**
 * Allègement des images de `public/` — outil REJOUABLE.
 *
 * POURQUOI (2026-09-23). Lighthouse sur l'accueil : « Improve image delivery —
 * est. savings of 1 075 KiB » sur une seule page. Mesuré sur tout le dépôt :
 * 165 images matricielles RÉFÉRENCÉES pèsent 26,2 Mo, dont 71 fichiers de plus
 * de 150 Ko à elles seules 20,6 Mo. Elles sont servies BRUTES : elles vivent
 * dans `public/`, donc elles ne passent pas par `<Image>` d'Astro — ni
 * redimensionnement, ni réencodage. Plusieurs sont des captures WordPress de
 * 1 500 à 2 000 px de large affichées dans des cartes de 555 px.
 *
 * CE QUE FAIT L'OUTIL, ET CE QU'IL NE FAIT PAS.
 * Il réduit et réencode l'image SUR PLACE : même chemin, même nom, même
 * FORMAT. Aucune référence à réécrire, donc aucun risque pour le contenu que
 * l'équipe marketing édite dans CloudCannon, ni pour sa médiathèque.
 * Il ne convertit PAS en WebP : ce serait ~81 % de moins au lieu de ~45 %,
 * mais il faudrait changer l'extension de 165 références réparties dans
 * src/content, src/data et les articles Markdown — c'est une décision de
 * périmètre, pas une optimisation. Le chiffre est mesuré et consigné dans
 * docs/operations.md pour qu'elle puisse se prendre.
 *
 * IDEMPOTENCE. Le fichier n'est réécrit que si le réencodage fait gagner au
 * moins GAIN_MINIMAL. Repasser l'outil sur une image déjà traitée produit un
 * gain quasi nul → rien n'est écrit, donc aucune dégradation en cascade (le
 * piège classique du JPEG réencodé à chaque passage).
 *
 * ORPHELINES. 59 images (9,9 Mo) ne sont référencées NULLE PART — reliquats de
 * l'export WordPress. L'outil les COMPTE mais n'y touche pas : elles ne pèsent
 * sur aucune page, seulement sur le dépôt, et une image « non référencée » peut
 * très bien être une image que l'éditrice s'apprête à poser. Suppression =
 * décision humaine.
 *
 * Usage :
 *   node scripts/optimize-images.mjs            # applique
 *   node scripts/optimize-images.mjs --check    # rapport seul, n'écrit rien
 *   node scripts/optimize-images.mjs --tout     # inclut les orphelines
 *
 * `--check` sort TOUJOURS en code 0 : c'est un rapport, pas un verrou. Une
 * image lourde déposée au CMS ne doit pas mettre la branche d'édition au
 * rouge (mémoire cloudcannon-null-build-break — on a déjà payé ce prix).
 */
import sharp from 'sharp';
import { readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { join, relative, extname, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const RACINE = join(dirname(fileURLToPath(import.meta.url)), '..');
const PUBLIC = join(RACINE, 'public');

const CHECK = process.argv.includes('--check');
const TOUT = process.argv.includes('--tout');

/** Largeur maximale servie. Le plus large emplacement du site est la bande
 *  de contenu (1920 px) ; les images de contenu vivent dans des cartes de
 *  555 à 800 px. 1600 px couvre le double d'un emplacement de 800 px — au-delà
 *  on envoie des pixels que personne ne voit. */
const LARGEUR_MAX = 1600;

/** En dessous, on ne touche à rien : le gain ne vaut pas la perte de qualité. */
const SEUIL_OCTETS = 150 * 1024;

/** On n'écrit que si on gagne au moins ça — garant de l'idempotence. */
const GAIN_MINIMAL = 0.05;

const RASTER = new Set(['.png', '.jpg', '.jpeg']);
const IGNORER = new Set(['node_modules', '.git', 'dist', '.astro']);

function parcourir(dir, garder, acc = []) {
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    if (IGNORER.has(e.name)) continue;
    const p = join(dir, e.name);
    if (e.isDirectory()) parcourir(p, garder, acc);
    else if (garder(p)) acc.push(p);
  }
  return acc;
}

/** Corpus où une référence d'image peut vivre (contenu, données, composants,
 *  configuration de l'éditeur). Sert UNIQUEMENT à distinguer référencé /
 *  orphelin — l'outil ne réécrit jamais une référence. */
function corpusDesReferences() {
  const sources = [
    ...parcourir(join(RACINE, 'src'), (p) => /\.(json|ts|astro|md|mdx|js|mjs)$/.test(p)),
    ...parcourir(join(RACINE, 'component-library'), (p) => /\.(json|ts|astro|ya?ml)$/.test(p)),
    join(RACINE, 'cloudcannon.config.yml'),
  ];
  return sources
    .map((p) => {
      try {
        return readFileSync(p, 'utf8');
      } catch {
        return '';
      }
    })
    .join('\n');
}

const ko = (o) => (o / 1024).toFixed(0);
const mo = (o) => (o / 1048576).toFixed(1);

async function traiter(chemin) {
  // PIÈGE WINDOWS payé le 2026-09-23 : passer le CHEMIN à sharp fait projeter
  // le fichier en mémoire par libvips (mmap) pour les JPEG ; `writeFileSync`
  // sur ce même chemin échoue alors en « UNKNOWN: unknown error, open ». Les
  // PNG passaient, les 30 JPEG échouaient silencieusement — l'outil annonçait
  // « 4 allégées » sans dire que le reste avait été refusé par le système.
  // On lit donc le fichier EN MÉMOIRE : plus aucune poignée sur le disque.
  const source = readFileSync(chemin);
  const avant = source.length;
  const meta = await sharp(source).metadata();
  if (!meta.width || !meta.height) return null;

  const tropLarge = meta.width > LARGEUR_MAX;
  if (avant < SEUIL_OCTETS && !tropLarge) return null;

  let pipeline = sharp(source, { failOn: 'error' });
  if (tropLarge) pipeline = pipeline.resize({ width: LARGEUR_MAX, withoutEnlargement: true });

  const buffer =
    meta.format === 'png'
      ? // PNG : réencodage SANS PERTE uniquement.
        //
        // PIÈGE PAYÉ le 2026-09-23 : `png({ effort: 10 })` — et a fortiori
        // `palette: true` — fait basculer sharp sur une QUANTIFICATION à 256
        // couleurs, sans le dire, même quand on ne demande pas de palette.
        // Mesuré sur public/images/home/sevoc.png : 464 Ko -> 154 Ko, mais
        // 97 % des pixels OPAQUES modifiés, écart max 130/255, et un texte
        // magenta de la photo qui vire au gris à l'œil nu. Le même fichier en
        // réencodage réellement sans perte fait 740 Ko, soit PLUS que
        // l'original : ces PNG sont déjà bien compressés, il n'y a rien à
        // gratter sans perdre de la qualité.
        // Donc : ni `palette`, ni `effort`. Sur un PNG le seul gain honnête
        // vient du REDIMENSIONNEMENT. Le vrai levier pour les photos stockées
        // en PNG est le WebP — chiffré dans docs/operations.md, décision de
        // périmètre ouverte.
        await pipeline.png({ compressionLevel: 9, adaptiveFiltering: true }).toBuffer()
      : // JPEG : q80 mozjpeg progressif, le réglage de référence pour le web.
        await pipeline.jpeg({ quality: 80, mozjpeg: true, progressive: true }).toBuffer();

  const gain = (avant - buffer.length) / avant;
  // Réencoder peut GROSSIR un fichier déjà bien compressé : on ne l'écrit pas.
  if (gain < GAIN_MINIMAL) return null;

  if (!CHECK) writeFileSync(chemin, buffer);
  return {
    url: '/' + relative(PUBLIC, chemin).replace(/\\/g, '/'),
    avant,
    apres: buffer.length,
    dims: `${meta.width}x${meta.height}`,
    redimensionne: tropLarge,
  };
}

const images = parcourir(PUBLIC, (p) => RASTER.has(extname(p).toLowerCase()));
const corpus = corpusDesReferences();

const referencees = [];
const orphelines = [];
for (const p of images) {
  const url = '/' + relative(PUBLIC, p).replace(/\\/g, '/');
  (corpus.includes(url) ? referencees : orphelines).push(p);
}

const cibles = TOUT ? [...referencees, ...orphelines] : referencees;

const traites = [];
const echecs = [];
for (const p of cibles) {
  try {
    const r = await traiter(p);
    if (r) traites.push(r);
  } catch (e) {
    // Un échec est REMONTÉ dans le bilan, pas seulement en avertissement :
    // c'est exactement comme ça que la première version a annoncé « 4 images
    // allégées » alors que 30 avaient été refusées par le système de fichiers.
    echecs.push({ chemin: relative(RACINE, p), message: e.message });
  }
}

traites.sort((a, b) => b.avant - b.apres - (a.avant - a.apres));

const avant = traites.reduce((t, r) => t + r.avant, 0);
const apres = traites.reduce((t, r) => t + r.apres, 0);
const poidsOrphelines = orphelines.reduce((t, p) => t + statSync(p).size, 0);

console.log(CHECK ? 'IMAGES — rapport (aucune écriture)' : 'IMAGES — allègement appliqué');
console.log('');
for (const r of traites.slice(0, 25)) {
  const pc = (100 - (r.apres / r.avant) * 100).toFixed(0);
  console.log(
    `  ${ko(r.avant).padStart(6)} -> ${ko(r.apres).padStart(6)} Ko  (-${pc.padStart(2)} %)  ${r.dims}${r.redimensionne ? ` -> ${LARGEUR_MAX}px` : ''}  ${r.url}`,
  );
}
if (traites.length > 25) console.log(`  … et ${traites.length - 25} autres`);

console.log('');
console.log(`  Images référencées : ${referencees.length}`);
console.log(`  ${CHECK ? 'Allégeables' : 'Allégées'}        : ${traites.length}`);
console.log(
  `  Poids              : ${mo(avant)} Mo -> ${mo(apres)} Mo  (${avant ? (100 - (apres / avant) * 100).toFixed(0) : 0} % de moins, ${mo(avant - apres)} Mo économisés)`,
);
console.log(
  `  Orphelines         : ${orphelines.length} fichiers, ${mo(poidsOrphelines)} Mo — non référencées, NON touchées (suppression = décision humaine)`,
);

if (echecs.length) {
  console.log('');
  console.log(`  ÉCHECS : ${echecs.length} image(s) n'ont pas pu être traitées`);
  for (const e of echecs.slice(0, 10)) console.log(`    ! ${e.chemin} : ${e.message}`);
  if (echecs.length > 10) console.log(`    … et ${echecs.length - 10} autres`);
}

// Rapport, jamais un verrou : la branche d'édition ne doit pas rougir parce
// qu'une éditrice a déposé une photo lourde.
process.exit(0);
