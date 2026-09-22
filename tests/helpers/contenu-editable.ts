/**
 * Outils partagés par les tests qui malmènent le CONTENU ÉDITABLE au CMS
 * (2026-09-22) : `src/content.config.champs-vides.test.ts` (un champ texte
 * vidé) et `src/content.config.listes-fermees.test.ts` (un select effacé).
 *
 * Ils vivent ici, et pas dans l'un des deux fichiers de test, pour une seule
 * raison : `CIBLES` — la carte « dossier de contenu → collection qui le
 * valide » — doit exister UNE fois. Dupliquée, elle dérive au premier dossier
 * ajouté, et le test qui ne l'a pas resterait vert en ne regardant rien.
 */
import { readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { z } from 'astro/zod';
import { collections } from '../../src/content.config';

export const ROOT = process.cwd();

/**
 * Doublure du helper `image()` d'Astro (le seul schéma-fonction touché ici est
 * celui de `pages`). Le contenu ne stocke que des CHEMINS PUBLICS : la branche
 * `z.string()` de `z.union([image(), z.string()])` les accepte, et cette
 * doublure reproduit fidèlement la forme d'un `ImageMetadata` pour que l'autre
 * branche se comporte comme en vrai.
 */
const imageStub = () =>
  z.object({ src: z.string(), width: z.number(), height: z.number(), format: z.string() });

export type NomCollection = keyof typeof collections;

/** Le schéma zod d'une collection, schémas-fonction résolus. */
export function schemaDe(nom: NomCollection): z.ZodTypeAny {
  const brut = (collections[nom] as { schema?: unknown }).schema;
  if (typeof brut === 'function') {
    return (brut as (ctx: { image: typeof imageStub }) => z.ZodTypeAny)({ image: imageStub });
  }
  return brut as z.ZodTypeAny;
}

/** Dossier de contenu → collection qui le valide. */
export const CIBLES: Array<{ dossier: string; collection: NomCollection }> = [
  { dossier: 'src/data/navigation', collection: 'navigation' },
  { dossier: 'src/data/annonces', collection: 'annonces' },
  { dossier: 'src/data/site', collection: 'site' },
  { dossier: 'src/data/contact', collection: 'contact' },
  { dossier: 'src/data/pages-systeme', collection: 'pagesSysteme' },
  { dossier: 'src/data/forms', collection: 'forms' },
  { dossier: 'src/content/pages', collection: 'pages' },
];

/**
 * Fichiers de `src/data` qui n'appartiennent à AUCUNE collection — ils ne
 * passent par aucun schéma zod, donc rien à prouver ici. Chacun avec sa raison :
 * s'ils devenaient éditables au CMS, ils rejoindraient CIBLES.
 */
export const HORS_COLLECTION = new Set([
  'redirects.json', // matrice de redirections, lue par scripts/build-redirects.mjs
  'redirects-migration.json', // idem (décisions de migration WordPress)
  'prix', // liste de prix Check Point (191 SKU) — lot L-prix, non branchée
]);

/** `footer.columns[0].links[2].label` → `footer.columns[].links[].label`. */
export const normaliser = (chemin: string) => chemin.replace(/\[\d+\]/g, '[]');

/** Tous les fichiers .json d'un dossier, récursivement. */
export function fichiersJson(dir: string, out: string[] = []): string[] {
  for (const nom of readdirSync(dir)) {
    const p = join(dir, nom);
    if (statSync(p).isDirectory()) fichiersJson(p, out);
    else if (nom.endsWith('.json')) out.push(p);
  }
  return out;
}

/** Chemins de toutes les chaînes d'une valeur (`a.b[0].c`). */
export function* chaines(valeur: unknown, chemin = ''): Generator<[string, string]> {
  if (typeof valeur === 'string') {
    yield [chemin, valeur];
    return;
  }
  if (Array.isArray(valeur)) {
    for (let i = 0; i < valeur.length; i += 1) yield* chaines(valeur[i], `${chemin}[${i}]`);
    return;
  }
  if (valeur && typeof valeur === 'object') {
    for (const [cle, v] of Object.entries(valeur as Record<string, unknown>)) {
      yield* chaines(v, chemin ? `${chemin}.${cle}` : cle);
    }
  }
}

/** Copie de `donnees` avec la chaîne située à `chemin` remplacée par `remplacant`. */
export function remplaceA(donnees: unknown, chemin: string, remplacant: unknown): unknown {
  const copie = structuredClone(donnees);
  const jetons = chemin.match(/[^.[\]]+/g) ?? [];
  let noeud: Record<string, unknown> = copie as Record<string, unknown>;
  for (const jeton of jetons.slice(0, -1)) noeud = noeud[jeton] as Record<string, unknown>;
  noeud[jetons[jetons.length - 1]] = remplacant;
  return copie;
}

/** Copie de `donnees` dont la clé située à `chemin` est ABSENTE. */
export function supprimeA(donnees: unknown, chemin: string): unknown {
  const copie = structuredClone(donnees);
  const jetons = chemin.match(/[^.[\]]+/g) ?? [];
  let noeud: Record<string, unknown> = copie as Record<string, unknown>;
  for (const jeton of jetons.slice(0, -1)) noeud = noeud[jeton] as Record<string, unknown>;
  delete noeud[jetons[jetons.length - 1]];
  return copie;
}

/** `['footer','columns',0,'title']` (chemin d'une issue zod) → `footer.columns[0].title`. */
export const cheminDIssue = (segments: ReadonlyArray<string | number>): string =>
  segments.reduce<string>(
    (acc, seg) =>
      typeof seg === 'number' ? `${acc}[${seg}]` : acc === '' ? String(seg) : `${acc}.${seg}`,
    '',
  );

/** Copie de `donnees` avec la chaîne située à `chemin` remplacée par ''. */
export const videA = (donnees: unknown, chemin: string): unknown => remplaceA(donnees, chemin, '');

/** Valeur à `chemin` dans une donnée déjà parsée (pour lire le défaut appliqué). */
export function valeurA(donnees: unknown, chemin: string): unknown {
  const jetons = chemin.match(/[^.[\]]+/g) ?? [];
  let noeud: unknown = donnees;
  for (const jeton of jetons) {
    if (noeud === null || typeof noeud !== 'object') return undefined;
    noeud = (noeud as Record<string, unknown>)[jeton];
  }
  return noeud;
}
