// =============================================================================
// scripts/migration/import-logos-partenaires.mjs — rapatrie les logos de
// marques partenaires depuis la médiathèque WordPress de l'ancien site.
//
// Ils y sont déjà (ils étaient publiés sur victrix.ca) et répondent encore :
// c'est la source la plus fiable, et la seule qui ne demande rien à personne.
// Recensés depuis docs/migration/urls-medias.csv.
//
//   node scripts/migration/import-logos-partenaires.mjs            télécharge
//   node scripts/migration/import-logos-partenaires.mjs --check    vérifie
//
// Destination : public/images/logos/<marque>.<ext>, servie telle quelle
// (/images/logos/…). Les noms sont NORMALISÉS (le WordPress avait
// « logo-ms-azure.svg », « awsss-1.png », « partneranddynamics.svg »…).
//
// DROIT D'USAGE : ces fichiers sont des logos de marques TIERCES. Victrix les
// affichait déjà publiquement, donc l'usage est de fait ; mais le marketing
// reste maître de la liste finale (décision D4). Ce script ne fait que
// rapatrier ce qui existait — il ne décide pas de ce qu'on affiche.
// =============================================================================

import { mkdirSync, writeFileSync, existsSync, readFileSync, statSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const RACINE = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const DEST = join(RACINE, 'public/images/logos');
const CHECK = process.argv.includes('--check');
const BASE = 'https://www.victrix.ca/wp-content/uploads';

/** nom normalisé → chemin dans la médiathèque WordPress. */
const LOGOS = {
  // Fournisseurs — SVG (vectoriels, détourés : la meilleure source)
  // ATTENTION au dossier : la première vague est sous 2022/02, PAS 2022/05.
  // Se tromper ne lève aucune erreur — WordPress sert sa page 404 en HTTP 200
  // (163 002 octets de HTML). D'où le contrôle de signature plus bas.
  'microsoft.svg': '2022/05/logo-microsoft.svg',
  'checkpoint.svg': '2022/05/logo-checkpoint.svg',
  'crowdstrike.svg': '2022/05/logo-crowdstrike.svg',
  'paloalto.svg': '2022/05/logo-paloalto.svg',
  'cisco.svg': '2022/05/logo-cisco.svg',
  'aruba.svg': '2022/05/logo-aruba.svg',
  'imprivata.svg': '2022/05/logo-imprivata.svg',
  'pulse-secure.svg': '2022/05/logo-pulse-secure.svg',
  'aws.svg': '2022/02/logo-aws.svg',
  'amazon.svg': '2022/02/logo-amazon.svg',
  'azure.svg': '2022/02/logo-ms-azure.svg',
  'red-hat.svg': '2022/02/logo-red-hat.svg',
  'redhat-openshift.svg': '2022/02/logo-redhat-openshift.svg',
  // Badges de partenariat
  'servicenow-partner.png': '2024/11/servicenow-partner.png',
  'microsoft-dynamics-partner.svg': '2023/08/partneranddynamics.svg',
  'microsoft-fasttrack-partner.png': '2023/08/fasttrack_partner.png',
  'aws-partner-consulting.png': '2023/10/aws-partner-consulting.png',
  'aws-partner-public-sector.png': '2023/10/aws-partner-public-sector.png',
  'o-studio.png': '2022/10/logo-ostudio-e1665650581352.png',
};

/**
 * WordPress répond 200 avec sa page 404 quand le chemin est faux. Un contrôle
 * de TAILLE ne suffit pas : on vérifie la SIGNATURE réelle du fichier.
 */
function signatureValide(nom, buf) {
  const tete = buf.subarray(0, 512).toString('utf8').trimStart().toLowerCase();
  if (tete.startsWith('<!doctype html') || tete.startsWith('<html')) return 'page HTML, pas une image';
  if (nom.endsWith('.svg')) {
    return tete.startsWith('<?xml') || tete.startsWith('<svg') ? null : 'ce n’est pas un SVG';
  }
  if (nom.endsWith('.png')) {
    return buf.subarray(1, 4).toString('latin1') === 'PNG' ? null : 'ce n’est pas un PNG';
  }
  return null;
}

/**
 * Un SVG qui n'a QUE `viewBox` n'a pas de taille intrinsèque — seulement un
 * rapport. Posé dans une boîte sans hauteur définie, il s'effondre à 0x0 : deux
 * des logos livrés (checkpoint, microsoft) l'ont fait. On leur pose `width` et
 * `height` déduits du `viewBox`, pour qu'ils se comportent comme les autres
 * quel que soit le gabarit qui les affiche.
 */
function normaliserSvg(nom, buf) {
  if (!nom.endsWith('.svg')) return buf;
  const texte = buf.toString('utf8');
  const balise = texte.match(/<svg\b[^>]*>/);
  if (!balise || /\swidth\s*=/.test(balise[0])) return buf;
  const vb = balise[0].match(/viewBox\s*=\s*["']\s*[-\d.]+\s+[-\d.]+\s+([\d.]+)\s+([\d.]+)/);
  if (!vb) return buf;
  const remplace = balise[0].replace(/^<svg\b/, `<svg width="${vb[1]}" height="${vb[2]}"`);
  console.log(`  ${''.padEnd(34)}  ↳ ${nom} : width/height ajoutés (${vb[1]}x${vb[2]})`);
  return Buffer.from(texte.replace(balise[0], remplace), 'utf8');
}

mkdirSync(DEST, { recursive: true });

const resultats = { ok: 0, deja: 0, manquants: [], erreurs: [] };

for (const [nom, chemin] of Object.entries(LOGOS)) {
  const cible = join(DEST, nom);

  if (CHECK) {
    if (existsSync(cible)) resultats.ok += 1;
    else resultats.manquants.push(nom);
    continue;
  }

  if (existsSync(cible) && statSync(cible).size > 0) {
    resultats.deja += 1;
    continue;
  }

  const url = `${BASE}/${chemin}`;
  try {
    const rep = await fetch(url, { redirect: 'follow' });
    if (!rep.ok) {
      resultats.erreurs.push(`${nom} — HTTP ${rep.status} sur ${url}`);
      continue;
    }
    const buf = Buffer.from(await rep.arrayBuffer());
    if (buf.length === 0) {
      resultats.erreurs.push(`${nom} — réponse vide`);
      continue;
    }
    const faute = signatureValide(nom, buf);
    if (faute) {
      resultats.erreurs.push(`${nom} — ${faute} (${buf.length} o) — chemin probablement faux : ${url}`);
      continue;
    }
    writeFileSync(cible, normaliserSvg(nom, buf));
    resultats.ok += 1;
    console.log(`  ${nom.padEnd(34)} ${String(buf.length).padStart(7)} o`);
  } catch (e) {
    resultats.erreurs.push(`${nom} — ${e.message}`);
  }
}

if (CHECK) {
  console.log(
    `[logos] ${resultats.ok}/${Object.keys(LOGOS).length} présent(s) dans public/images/logos/.`,
  );
  if (resultats.manquants.length) {
    console.error(`  MANQUANTS : ${resultats.manquants.join(', ')}`);
    console.error(`  Rejouer : node scripts/migration/import-logos-partenaires.mjs`);
    process.exit(1);
  }
} else {
  console.log(
    `\n[logos] ${resultats.ok} téléchargé(s), ${resultats.deja} déjà là, ${resultats.erreurs.length} en échec.`,
  );
  for (const e of resultats.erreurs) console.error(`  ✗ ${e}`);
}
