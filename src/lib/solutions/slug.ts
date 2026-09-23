/**
 * Slug d'URL d'une fiche du catalogue de solutions — UNE règle, partagée par
 * la route des fiches (src/pages/[lang]/solutions/[slug].astro) et par le
 * catalogue qui pointe vers elles (seam `solutions-catalogue` de
 * src/pages/[lang]/[...slug].astro).
 *
 * Revue R3 (2026-09-23), constat 1 : le champ « Adresse de la page » (`slug`)
 * est saisi par l'éditrice, sans normalisation ni dédoublonnage. Deux fiches au
 * même slug s'écrasaient l'une l'autre en silence au build ; un slug avec une
 * majuscule, un accent ou une espace donnait une adresse qui ne ressemblait
 * pas à celles du site — et le lien du catalogue et la route auraient pu
 * diverger si l'un des deux avait normalisé sans l'autre.
 *
 *  - `normaliseSlug` : minuscules, sans accents, tout ce qui n'est pas
 *    lettre/chiffre devient un tiret, les `/` restent (sous-dossiers). Vide
 *    reste vide (le nom de fichier prend alors le relais dans slugDeSolution).
 *  - `slugDeSolution` : le `slug` saisi, sinon le CHEMIN DE FICHIER (ce qui
 *    apparie FR et EN), normalisé.
 *  - `conflitsDeSlug` : les doublons par langue, à faire ÉCHOUER le build en
 *    nommant les fichiers — plutôt qu'une page qui en remplace une autre.
 */

export function normaliseSlug(brut: string): string {
  return brut
    .split('/')
    .map((segment) =>
      segment
        .normalize('NFKD')
        .replace(/[̀-ͯ]/g, '')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, ''),
    )
    .filter(Boolean)
    .join('/');
}

export interface EntreeSolution {
  /** id de la collection : `<langue>/<chemin sans extension>`. */
  id: string;
  data: { slug?: string };
}

export function cheminDeFichier(entry: EntreeSolution): string {
  return entry.id.slice(entry.id.indexOf('/') + 1);
}

export function slugDeSolution(entry: EntreeSolution): string {
  return normaliseSlug(entry.data.slug || cheminDeFichier(entry));
}

export interface ConflitDeSlug {
  langue: string;
  slug: string;
  fichiers: string[];
}

/**
 * Les slugs portés par plus d'une entrée DANS LA MÊME LANGUE. `entries` est
 * la liste des entrées qui ont une page (celles qui portent des sections) :
 * une carte sans page ne réserve pas d'adresse.
 */
export function conflitsDeSlug(entries: EntreeSolution[]): ConflitDeSlug[] {
  const parAdresse = new Map<string, string[]>();
  for (const entry of entries) {
    const langue = entry.id.slice(0, entry.id.indexOf('/'));
    const cle = `${langue}/${slugDeSolution(entry)}`;
    parAdresse.set(cle, [...(parAdresse.get(cle) ?? []), entry.id]);
  }
  return [...parAdresse.entries()]
    .filter(([, fichiers]) => fichiers.length > 1)
    .map(([cle, fichiers]) => ({
      langue: cle.slice(0, cle.indexOf('/')),
      slug: cle.slice(cle.indexOf('/') + 1),
      fichiers,
    }));
}
