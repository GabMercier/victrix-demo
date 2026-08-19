// Dérivés 800 px des couvertures d'articles (2026-08-19, Lighthouse).
// POURQUOI : les cartes du centre de ressources affichent ~400 px CSS — servir
// le fichier 1600 px y double le poids pour rien, et la simulation mobile de
// Lighthouse fait attendre le LCP derrière ces octets. Ce script lit les
// `coverImage` du frontmatter des articles (src/content/blog/**/*.md) et pose
// un dérivé `<nom>-800.<ext>` À CÔTÉ de l'original dans public/ (largeur
// 800 px, même format). Les pages choisissent le dérivé quand il existe
// (src/lib/images/cover-derivative.ts) et retombent sur l'original sinon —
// une couverture téléversée au CMS sans dérivé reste servie telle quelle.
// Relancer après l'ajout d'articles, puis committer les dérivés.
import sharp from 'sharp';
import { existsSync, readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const covers = new Set();
(function walk(d) {
  for (const e of readdirSync(d, { withFileTypes: true })) {
    const p = join(d, e.name);
    if (e.isDirectory()) walk(p);
    else if (/\.mdx?$/.test(e.name)) {
      const m = readFileSync(p, 'utf8').match(/^coverImage:\s*['"]?([^'"\r\n]+)/m);
      if (m && m[1].startsWith('/')) covers.add(m[1].trim());
    }
  }
})('src/content/blog');

let made = 0, skipped = 0;
for (const cover of covers) {
  const ext = cover.match(/\.(png|jpe?g)$/i)?.[0];
  if (!ext) { skipped++; continue; }
  const src = `public${cover}`;
  const out = `public${cover.slice(0, -ext.length)}-800${ext}`;
  if (!existsSync(src) || existsSync(out)) { skipped++; continue; }
  // Buffer obligatoire — sharp(<chemin>) échoue sur certains fichiers Windows
  // (voir compress-wp-images.mjs). MÊME recette de compression que
  // compress-wp-images.mjs : sans elle, redimensionner un PNG déjà en palette
  // produit un fichier RVB PLUS GROS que l'original 1600 px.
  const img = sharp(readFileSync(src), { limitInputPixels: 1e9 })
    .rotate()
    .resize({ width: 800, withoutEnlargement: true });
  const buf = /\.png$/i.test(ext)
    ? await img.png({ palette: true, quality: 80, compressionLevel: 9 }).toBuffer()
    : await img.jpeg({ quality: 75, progressive: true, mozjpeg: true }).toBuffer();
  // Un dérivé plus gros que l'original n'aide personne — on ne le garde que
  // s'il fait réellement maigrir la réponse.
  const origSize = statSync(src).size;
  if (buf.length >= origSize) { skipped++; continue; }
  writeFileSync(out, buf);
  made++;
}
console.log(`${covers.size} couvertures — ${made} dérivés créés, ${skipped} ignorés (déjà présents, absents ou format non géré)`);
