/**
 * BreadcrumbList schema.org (P-12) — helper PUR (testable vitest, browser-safe).
 *
 * Décision d'implémentation (2026-07-30) : JSON-LD SEULEMENT sur les gabarits
 * internes — le fil d'Ariane VISIBLE n'existe que sur les articles (parité
 * victrix.ca) ; en ajouter ailleurs préempterait le redesign (Phase 5). Le
 * balisage, lui, est invisible et gagne les résultats enrichis dès maintenant.
 *
 * Règles schema.org appliquées :
 *  - URLs ABSOLUES (les consommateurs l'exigent — même règle que BlogPosting) ;
 *  - le DERNIER élément (la page courante) omet `item` (recommandation
 *    Google : l'URL courante est implicite).
 */

export interface BreadcrumbItem {
  name: string;
  /** Chemin RELATIF au site (ex. « /fr/ressources/ ») — absent = page courante. */
  path?: string;
}

export function breadcrumbSchema(items: BreadcrumbItem[], site: URL | string): object {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      ...(item.path ? { item: new URL(item.path, site).href } : {}),
    })),
  };
}
