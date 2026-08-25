/**
 * Accès aux « Textes du site » (collection `site`, src/data/site/<lang>.json).
 *
 * PÉRIMÈTRE (décision user 2026-08-11) : uniquement le texte TRANSVERSAL —
 * pied de page et bandeau de consentement, visibles sur toutes les pages sans
 * appartenir à aucune (+ la page 404, sans collection d'accueil). Le texte
 * propre à une page s'édite avec sa page. Les chaînes d'accessibilité restent
 * dans ./ui.ts.
 *
 * Le garde-fou vivait en ligne dans src/pages/404.astro ; il est factorisé ici
 * car quatre fichiers lisent désormais la collection.
 */
import { getCollection } from 'astro:content';
import type { Locale } from './config';

/**
 * Textes du site pour une langue. Échoue le build avec un message nommé si le
 * fichier de la langue manque — même philosophie que les autres garde-fous du
 * dépôt (une erreur d'édition ne peut pas atteindre la production).
 */
export async function getSiteText(lang: Locale) {
  const entries = await getCollection('site');
  const entry = entries.find((e) => e.id === lang);
  if (!entry) {
    throw new Error(
      `[site] src/data/site/${lang}.json introuvable — la collection « Textes du site » exige un fichier par langue.`,
    );
  }
  return entry.data;
}
