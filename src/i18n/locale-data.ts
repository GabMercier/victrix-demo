/**
 * Accès générique aux collections « un JSON par langue » (src/data/<collection>/
 * {fr,en}.json) : `contact`, `carrieres`, `pagesSysteme`… Même garde-fou que
 * getSiteText (./site.ts, resté dédié à la collection `site` et à sa règle de
 * périmètre) : un fichier de langue manquant échoue le build avec un message
 * nommé — une erreur d'édition ne peut pas atteindre la production.
 *
 * GOTCHA Bookshop (voir src/pages/[lang]/merci.astro) : dans une page, garder
 * la déclaration en appel nu — `const c = await getLocaleData('contact', lang)`
 * — et atteindre `c.bloc.champ` aux points d'usage.
 */
import { getCollection, type CollectionEntry, type CollectionKey } from 'astro:content';
import type { Locale } from './config';

/**
 * Données d'une collection par-langue pour `lang`. Échoue si le fichier manque.
 *
 * Le type de retour est annoté EXPLICITEMENT : laissé à l'inférence, TS résout
 * `entry.data` sur la CONTRAINTE de C (l'union des 12 collections) au lieu de
 * rester paramétrique — chaque page recevait « blog | home | … » et le
 * type-check tombait (92 erreurs, constat 2026-08-12). L'annotation
 * `CollectionEntry<C>['data']` garde l'accès indexé différé jusqu'au site
 * d'appel, où C est un littéral.
 */
export async function getLocaleData<C extends CollectionKey>(
  collection: C,
  lang: Locale,
): Promise<CollectionEntry<C>['data']> {
  const entries: CollectionEntry<C>[] = await getCollection(collection);
  const entry = entries.find((e) => e.id === lang);
  if (!entry) {
    throw new Error(
      `[${collection}] fichier « ${lang} » introuvable — cette collection exige un fichier par langue (fr, en).`,
    );
  }
  return entry.data;
}
