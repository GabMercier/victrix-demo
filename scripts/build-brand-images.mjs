// =============================================================================
// scripts/build-brand-images.mjs — fabrique TOUTES les images dérivées du logo
// de marque officiel : le jeu d'icônes (favicon, onglet, iOS), le logo du
// JSON-LD, et l'image de partage Open Graph.
//
// Pourquoi un script et pas des fichiers déposés à la main : la marque vient
// de bouger, et le site en portait encore une version fautive à trois endroits
// (X bicolore, signature « Powered by » en français, verrouillage périmé). Si
// elle rebouge, on rejoue une commande au lieu de refaire huit exports à la
// main et d'en oublier deux.
//
//   npm run build:brand            écrit les fichiers dans public/
//   npm run build:brand -- --check n'écrit rien, sort 1 si un fichier a dérivé
//
// SOURCE UNIQUE : src/assets/victrix-logo-fr.svg (et -en.svg), eux-mêmes
// normalisés depuis le kit `02_Logos` — voir l'en-tête de ces fichiers pour
// la liste exacte des modifications (aucun tracé touché).
// =============================================================================

import sharp from 'sharp';
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { dirname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const RACINE = join(dirname(fileURLToPath(import.meta.url)), '..');
const PUBLIC = join(RACINE, 'public');
const CHECK = process.argv.includes('--check');

// --- Couleurs de marque (doivent suivre src/styles/theme.css) ---------------

const NUIT = '#000d2e'; //  --color-logo-nuit — bleu nuit du kit
const PACIFIQUE = '#083957'; //  bleu pacifique du kit = fond de l'image de partage
const BLEU_VICTRIX = '#002fc7'; //  --color-primary — aplat du favicon
const BLANC = '#ffffff';

// --- 1. Le jeu d'icônes -----------------------------------------------------

/**
 * Premier glyphe (« V ») du mot-symbole, recopié tel quel depuis le kit.
 * C'est le monogramme : à 16 px le X se referme et devient une croix banale,
 * alors que le V reste lisible.
 */
const V = 'M50.23,12.52h-8.89l-9.8,26.4-9.8-26.4h-9.1l15.15,37.75h7.28l15.15-37.75h0Z';
const V_BOITE = [12.64, 12.52, 37.59, 37.75];

/**
 * Le V est un triangle pointe en bas : son centre géométrique tombe plus bas
 * que son centre optique. On le remonte très légèrement.
 */
const NUDGE_OPTIQUE = -0.018;

const arrondi = (n) => Math.round(n * 100) / 100;

function pastilleSvg({ marge = 0.16, rayon = 0.2 } = {}) {
  const [x, y, l, h] = V_BOITE;
  const cote = Math.max(l, h);
  const pad = cote * marge;
  const total = cote + pad * 2;
  const dx = x - pad - (cote - l) / 2;
  const dy = y - pad - (cote - h) / 2 + total * NUDGE_OPTIQUE;
  return (
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${arrondi(dx)} ${arrondi(dy)} ${arrondi(total)} ${arrondi(total)}">` +
    `<rect x="${arrondi(dx)}" y="${arrondi(dy)}" width="${arrondi(total)}" height="${arrondi(total)}" rx="${arrondi(rayon * total)}" fill="${BLEU_VICTRIX}"/>` +
    `<path d="${V}" fill="${BLANC}"/></svg>`
  );
}

/**
 * Assemble un .ico depuis des PNG déjà encodés. Le format accepte des PNG
 * bruts depuis Vista : on s'en tient à ça, c'est lu partout où le .ico sert.
 */
function assembleIco(images) {
  const entete = Buffer.alloc(6);
  entete.writeUInt16LE(0, 0);
  entete.writeUInt16LE(1, 2); // type 1 = icône
  entete.writeUInt16LE(images.length, 4);

  let offset = 6 + 16 * images.length;
  const entrees = images.map(({ taille, donnees }) => {
    const e = Buffer.alloc(16);
    e.writeUInt8(taille >= 256 ? 0 : taille, 0);
    e.writeUInt8(taille >= 256 ? 0 : taille, 1);
    e.writeUInt16LE(1, 4); // plans
    e.writeUInt16LE(32, 6); // bits par pixel
    e.writeUInt32LE(donnees.length, 8);
    e.writeUInt32LE(offset, 12);
    offset += donnees.length;
    return e;
  });
  return Buffer.concat([entete, ...entrees, ...images.map((i) => i.donnees)]);
}

const pngCarre = (svg, taille) =>
  sharp(Buffer.from(svg), { density: 1200 })
    .resize(taille, taille)
    .png({ compressionLevel: 9 })
    .toBuffer();

/**
 * Onglets : coins arrondis, transparent hors du carré. Marge SERRÉE (0,16) —
 * épreuve du 2026-09-22 à 16 px : au-delà de 0,20 les branches du V passent
 * sous le pixel et le glyphe devient mou ; en-deçà de 0,16 il touche les bords.
 */
const SVG_ARRONDI = pastilleSvg({ rayon: 0.2, marge: 0.16 });
/**
 * apple-touch-icon : PLEIN BORD, coins vifs. iOS applique SON PROPRE masque
 * arrondi ; lui donner un carré déjà arrondi produit un double arrondi et
 * remplit de noir les coins transparents.
 */
const SVG_PLEIN = pastilleSvg({ rayon: 0, marge: 0.22 });

// --- 2. Les images dérivées du logo complet ---------------------------------

/** Charge un logo normalisé et lui impose une couleur de remplissage. */
function logoColore(lang, couleur) {
  const src = readFileSync(join(RACINE, `src/assets/victrix-logo-${lang}.svg`), 'utf8');
  return src
    .replace(/<svg /, `<svg fill="${couleur}" `)
    .replace(/<!--[\s\S]*?-->/g, ''); // les commentaires d'en-tête, inutiles au rendu
}

/** Hauteur du MOT-SYMBOLE dans le viewBox normalisé, en unités utilisateur. */
const HAUTEUR_MOT_SYMBOLE = 37.63;
/** Hauteur totale du contenu (mot-symbole + signature), même repère. */
const HAUTEUR_CONTENU = 77.09;
const RATIO_LOGO = 219.45 / HAUTEUR_CONTENU; // ≈ 2,846

// --- Fabrication ------------------------------------------------------------

const sorties = [];

for (const taille of [16, 32]) {
  sorties.push({ nom: `favicon-${taille}x${taille}.png`, donnees: await pngCarre(SVG_ARRONDI, taille) });
}
sorties.push({ nom: 'apple-touch-icon.png', donnees: await pngCarre(SVG_PLEIN, 180) });
sorties.push({ nom: 'favicon.svg', donnees: Buffer.from(SVG_ARRONDI, 'utf8') });

// Les navigateurs demandent /favicon.ico d'office, même sans <link> : sans le
// fichier, c'est une 404 à chaque visite. On le sert.
sorties.push({
  nom: 'favicon.ico',
  donnees: assembleIco(
    await Promise.all([16, 32, 48].map(async (t) => ({ taille: t, donnees: await pngCarre(SVG_ARRONDI, t) }))),
  ),
});

// Logo du JSON-LD Organization (BaseLayout) — schema.org veut une URL absolue
// vers une image ; fond BLANC, c'est la seule variante sûre pour un agrégateur
// qui la posera sur n'importe quel fond.
{
  const LARGEUR = 1200;
  const hauteur = Math.round(LARGEUR / RATIO_LOGO);
  sorties.push({
    nom: 'images/logo-victrix.png',
    donnees: await sharp(Buffer.from(logoColore('fr', NUIT)), { density: 1200 })
      .resize(LARGEUR, hauteur)
      .flatten({ background: BLANC })
      .png({ compressionLevel: 9 })
      .toBuffer(),
  });
}

// Image de partage Open Graph — on REPREND la composition existante (fond
// bleu pacifique du kit, bande verte en haut, ligne de services en bas) et on
// remplace UNIQUEMENT le verrouillage du logo, qui portait encore le X gris et
// « Powered by » en français. Repères mesurés sur l'image d'origine :
//   bande verte      y 0 → 49
//   mot-symbole      y 205 → 310, x 300 → 899
//   signature        y 334 → 394
//   ligne de services y 446 → 476, x 174 → 1027   (INTACTE)
{
  const SRC = join(PUBLIC, 'og-image.png');
  if (!existsSync(SRC)) throw new Error('public/og-image.png absent — impossible de le recomposer');

  const MOT_SYMBOLE_HAUT = 205;
  const MOT_SYMBOLE_GAUCHE = 300;
  const MOT_SYMBOLE_HAUTEUR = 106; // conserve exactement la présence d'origine

  const echelle = MOT_SYMBOLE_HAUTEUR / HAUTEUR_MOT_SYMBOLE;
  const hauteurRendue = Math.round(HAUTEUR_CONTENU * echelle);
  const largeurRendue = Math.round(hauteurRendue * RATIO_LOGO);

  // Décalage du mot-symbole sous le bord haut du viewBox normalisé (12,52 - 11,86).
  const decalageHaut = Math.round(0.66 * echelle);

  const logo = await sharp(Buffer.from(logoColore('fr', BLANC)), { density: 2400 })
    .resize(largeurRendue, hauteurRendue)
    .png()
    .toBuffer();

  // Effacer l'ancien verrouillage (marge large : il débordait jusqu'à x 899 / y 394).
  const gomme = await sharp({
    create: { width: 700, height: 240, channels: 4, background: PACIFIQUE },
  })
    .png()
    .toBuffer();

  sorties.push({
    nom: 'og-image.png',
    donnees: await sharp(SRC)
      .composite([
        { input: gomme, left: 280, top: 185 },
        { input: logo, left: MOT_SYMBOLE_GAUCHE, top: MOT_SYMBOLE_HAUT - decalageHaut },
      ])
      .png({ compressionLevel: 9 })
      .toBuffer(),
  });
}

// --- Écriture ou vérification ----------------------------------------------

if (!existsSync(PUBLIC)) mkdirSync(PUBLIC, { recursive: true });

let derives = 0;
for (const { nom, donnees } of sorties) {
  const chemin = join(PUBLIC, nom);
  const avant = existsSync(chemin) ? readFileSync(chemin) : null;
  const identique = avant !== null && avant.equals(donnees);

  if (CHECK) {
    if (!identique) {
      derives++;
      console.error(`  DÉRIVE  ${relative(RACINE, chemin)} — ${avant === null ? 'absent' : 'contenu différent'}`);
    }
    continue;
  }

  if (identique) {
    console.log(`  inchangé  ${relative(RACINE, chemin)}`);
  } else {
    mkdirSync(dirname(chemin), { recursive: true });
    writeFileSync(chemin, donnees);
    console.log(
      `  écrit     ${relative(RACINE, chemin)}  (${donnees.length} o)${avant === null ? '  [nouveau]' : ''}`,
    );
  }
}

if (CHECK) {
  if (derives > 0) {
    console.error(
      `\n${derives} image(s) de marque ne correspondent plus au logo officiel.` +
        `\nRejouer : npm run build:brand`,
    );
    process.exit(1);
  }
  console.log('Images de marque conformes au logo officiel.');
}
