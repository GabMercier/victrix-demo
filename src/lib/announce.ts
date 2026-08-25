/**
 * Bannière d'annonce active — colle build entre la collection `annonces`
 * (bibliothèque de bannières planifiables, src/data/annonces/*.json) et ses
 * consommateurs (Header.astro, CampaignHeader.astro, BaseLayout.astro). Un
 * seul endroit lit la collection, le drapeau STATIC_ONLY et « maintenant »,
 * pour que les trois rendent LA MÊME bannière.
 */

import { getCollection } from 'astro:content';
import type { Locale } from '../i18n/config';
import { localizePath } from '../i18n/config';
import { pickActiveAnnounce } from './schedule';

/**
 * STATIC_ONLY (build d'édition CloudCannon) — même gotcha d'expression membre
 * EXACTE que src/i18n/blog.ts : lire `import.meta.env.STATIC_ONLY` une fois
 * ici, jamais via destructuration ni objet env passé en paramètre.
 */
const STATIC_ONLY_BUILD = Boolean(import.meta.env.STATIC_ONLY);

/**
 * Un seul « maintenant » pour TOUT le build : une borne franchie pendant la
 * génération ne doit pas faire basculer la bannière entre deux pages (le
 * script anti-flash de BaseLayout compare l'id — il doit être constant).
 */
const BUILD_NOW = new Date();

export interface ActiveAnnounce {
  /** Id de fichier (ex. « promo-o-studio ») — clé de fermeture sessionStorage. */
  id: string;
  before: string;
  strong: string;
  after: string;
  linkLabel: string;
  /** Lien localisé, prêt à rendre (ex. /fr/produits). */
  href: string;
}

/** La bannière à afficher pour cette langue, ou `null` (aucune active). */
export async function getActiveAnnounce(lang: Locale): Promise<ActiveAnnounce | null> {
  const entries = await getCollection('annonces');
  const active = pickActiveAnnounce(
    entries.map((e) => ({ id: e.id, ...e.data })),
    BUILD_NOW,
    STATIC_ONLY_BUILD,
  );
  if (!active) return null;
  const text = active[lang];
  return { id: active.id, ...text, href: localizePath(active.linkHref, lang) };
}

/**
 * L'id de la bannière active (indépendant de la langue) — pour le script
 * anti-flash de BaseLayout. `null` = aucune bannière ce build.
 */
export async function getActiveAnnounceId(): Promise<string | null> {
  const entries = await getCollection('annonces');
  return (
    pickActiveAnnounce(
      entries.map((e) => ({ id: e.id, ...e.data })),
      BUILD_NOW,
      STATIC_ONLY_BUILD,
    )?.id ?? null
  );
}
