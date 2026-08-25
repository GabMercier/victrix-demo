// Compression EN PLACE des images public/wp-content > 300 Ko (2026-08-18).
// Mêmes noms de fichiers (aucune référence à réécrire) :
//  - resize à 1600 px de large max (usage max : carte vedette ~810 px CSS,
//    donc 1600 couvre le 2x retina) ;
//  - .jpg → JPEG progressif mozjpeg q75 ;
//  - .png → PNG palette (lossy, façon pngquant) q80 — les photos migrées de
//    WordPress en PNG plein RVB sont l'essentiel du poids.
// Un fichier n'est réécrit que si le résultat est PLUS PETIT.
// NOTE Windows : sharp(<chemin>) échoue à OUVRIR certains fichiers (« unknown
// error, open ») alors que fs.readFileSync les lit sans problème — on passe
// donc TOUJOURS par un Buffer.
import sharp from 'sharp';
import { readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { join, extname } from 'node:path';

const ROOT = 'public/wp-content';
const MIN = 300 * 1024;
const files = [];
(function walk(d) {
  for (const e of readdirSync(d, { withFileTypes: true })) {
    const p = join(d, e.name);
    if (e.isDirectory()) walk(p);
    else if (/\.(jpe?g|png)$/i.test(e.name) && statSync(p).size > MIN) files.push(p);
  }
})(ROOT);

let before = 0, after = 0, done = 0;
for (const p of files) {
  const orig = statSync(p).size;
  try {
    const img = sharp(readFileSync(p), { limitInputPixels: 1e9 })
      .rotate()
      .resize({ width: 1600, withoutEnlargement: true });
    const ext = extname(p).toLowerCase();
    const buf = ext === '.png'
      ? await img.png({ palette: true, quality: 80, compressionLevel: 9 }).toBuffer()
      : await img.jpeg({ quality: 75, progressive: true, mozjpeg: true }).toBuffer();
    if (buf.length < orig) {
      writeFileSync(p, buf);
      before += orig; after += buf.length; done++;
    }
  } catch (e) {
    console.error('SKIP', p, e.message);
  }
}
console.log(`compressed ${done}/${files.length} files: ${(before / 1048576).toFixed(1)} MB -> ${(after / 1048576).toFixed(1)} MB`);
