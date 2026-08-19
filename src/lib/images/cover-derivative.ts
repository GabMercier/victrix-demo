/**
 * Dérivé 800 px d'une image publique (2026-08-19, Lighthouse) — pendant
 * BUILD-TIME du script scripts/blog-cover-derivatives.mjs : si le fichier
 * `<nom>-800.<ext>` existe dans public/, on le sert aux emplacements ≤ 800 px
 * (cartes, colonnes latérales) ; sinon l'ORIGINAL est servi tel quel (cas
 * d'une couverture fraîchement téléversée au CMS, avant la prochaine passe du
 * script). Import node:fs : ce module ne doit être appelé QUE depuis le
 * frontmatter Astro (exécuté au build) — jamais depuis un script client ni un
 * composant rendu par l'éditeur visuel CloudCannon.
 */
import { existsSync } from 'node:fs';

const DERIVABLE = /\.(png|jpe?g)$/i;

/** Chemin du dérivé 800 px s'il existe, sinon `null`. */
export function coverSmall(publicPath: string | undefined): string | null {
  if (!publicPath || !publicPath.startsWith('/')) return null;
  const ext = publicPath.match(DERIVABLE)?.[0];
  if (!ext) return null;
  const derivative = `${publicPath.slice(0, -ext.length)}-800${ext}`;
  return existsSync(`public${derivative}`) ? derivative : null;
}

/** Le dérivé quand il existe, sinon l'original — pour les emplacements ≤ 800 px. */
export function coverForCard(publicPath: string): string {
  return coverSmall(publicPath) ?? publicPath;
}
