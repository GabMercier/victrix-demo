/**
 * UI / chrome dictionary — INTERFACE strings only (accessibility labels,
 * header entries, Pagefind UI, article share controls). Page and chrome
 * CONTENT has been progressively moved to CMS-editable collections: footer/
 * consent/404 → `site` (2026-08-11), blog index & RSS / search page / merci →
 * `pagesSysteme`, Contact → `contact`, Carrières → `carrieres` (2026-08-12).
 *
 * `fr` is the source of truth; `en` is typed against it (`UI`), so the two
 * locales can never drift out of shape — a missing/extra key fails the build.
 * Internal hrefs are stored without a locale and prefixed at render via
 * `localizePath()`. Page-body copy lives in `src/i18n/content/*` and the
 * `home`/`blog` content collections, not here.
 *
 * Navigation CONTENT (menu items, mega menu, announcement bar, portal button)
 * was migrated to src/data/navigation/<lang>.json — the `navigation`
 * collection (src/content.config.ts), editable in CloudCannon. Only
 * accessibility strings (interface, not content) remain under `nav`/`announce`.
 */

import type { Locale } from './config';

const fr = {
  siteName: 'Victrix',
  defaultDescription:
    'Victrix — services-conseils en TI et solutions de productivité pour les entreprises et les organisations publiques.',
  skipLink: 'Aller au contenu principal',

  nav: {
    brandAria: 'Victrix — Accueil',
    openMenu: 'Ouvrir le menu',
    closeMenu: 'Fermer le menu',
    langGroupAria: 'Choix de la langue',
  },

  announce: {
    close: 'Fermer l’annonce',
  },

  // Recherche interne (P-06) — entrée du header + interface Pagefind. Les
  // TEXTES de la page /recherche (titre, intro, noscript…) sont DÉMÉNAGÉS vers
  // la collection `pagesSysteme` (src/data/pages-systeme/{fr,en}.json, bloc
  // `recherche`, éditable au CMS — 2026-08-12). Restent ici : l'entrée du
  // header (interface) et le bloc `ui`, passé tel quel aux traductions de
  // l'interface Pagefind (clés officielles de PagefindUI; [SEARCH_TERM]/
  // [COUNT] = jetons Pagefind).
  search: {
    navLabel: 'Recherche',
    navAria: 'Rechercher sur le site',
    ui: {
      placeholder: 'Rechercher…',
      clear_search: 'Effacer',
      load_more: 'Afficher plus de résultats',
      search_label: 'Rechercher sur ce site',
      filters_label: 'Filtres',
      zero_results: 'Aucun résultat pour [SEARCH_TERM]',
      many_results: '[COUNT] résultats pour [SEARCH_TERM]',
      one_result: '[COUNT] résultat pour [SEARCH_TERM]',
      alt_search: 'Aucun résultat pour [SEARCH_TERM]. Résultats pour [DIFFERENT_TERM] :',
      search_suggestion: 'Aucun résultat pour [SEARCH_TERM]. Essayez :',
      searching: 'Recherche de [SEARCH_TERM]…',
    },
  },

  // Pied de page : CONTENU (colonnes, coordonnées, réseaux, mentions légales)
  // DÉMÉNAGÉ vers la collection `site` (src/data/site/{fr,en}.json, éditable au
  // CMS — 2026-08-11) : le pied de page est transversal, il n'appartient à
  // aucune page. Seule l'ÉTIQUETTE D'ACCESSIBILITÉ reste ici.
  footer: {
    backToTop: 'Retour en haut de page',
  },

  // Bandeau de consentement Loi 25 (P-10) : FORMULATION déménagée vers la
  // collection `site` (éditable au CMS — 2026-08-11 ; portée légale). Seule
  // l'étiquette de région (accessibilité) reste ici.
  consent: {
    ariaLabel: 'Consentement aux témoins',
  },

  // Index du blogue : les TEXTES (surtitre, titre, intro, libellé « Tous »)
  // sont DÉMÉNAGÉS vers la collection `pagesSysteme` (bloc `ressources`,
  // éditable au CMS — 2026-08-12) ; ce bloc alimente aussi le fil d'Ariane des
  // articles et le flux RSS. Seule l'étiquette d'accessibilité reste ici.
  blog: {
    filterAria: 'Filtrer par catégorie',
  },

  article: {
    back: '← Toutes les ressources',
    shareLabel: 'Partager :',
    shareLinkedin: 'Partager sur LinkedIn',
    shareX: 'Partager sur X',
    shareFacebook: 'Partager sur Facebook',
    copyLink: 'Copier le lien',
    copied: 'Lien copié !',
    backBtn: '← Retour aux ressources',
    latestTitle: 'Nos derniers articles',
    readMore: 'Lire l’article',
    breadcrumbHome: 'Accueil',
    breadcrumbAria: 'Fil d’Ariane',
  },

  home: {
    learnMore: 'En savoir plus',
  },

  // merci : DÉMÉNAGÉ vers la collection `pagesSysteme` (src/data/pages-systeme/
  // {fr,en}.json, bloc `merci`, éditable au CMS — 2026-08-12).
  // notFound : DÉMÉNAGÉ vers la collection `site` (src/data/site/{fr,en}.json,
  // éditable au CMS — 2026-08-11). src/pages/404.astro lit la collection.
};

type UI = typeof fr;

const en: UI = {
  siteName: 'Victrix',
  defaultDescription:
    'Victrix — IT consulting services and productivity solutions for businesses and public organizations.',
  skipLink: 'Skip to main content',

  nav: {
    brandAria: 'Victrix — Home',
    openMenu: 'Open menu',
    closeMenu: 'Close menu',
    langGroupAria: 'Language',
  },

  announce: {
    close: 'Dismiss announcement',
  },

  // Internal search (P-06) — header entry + Pagefind UI. The /recherche page
  // texts moved to the `pagesSysteme` collection (see the FR comments). The
  // `ui` block is handed verbatim to the Pagefind UI translations.
  search: {
    navLabel: 'Search',
    navAria: 'Search this site',
    ui: {
      placeholder: 'Search…',
      clear_search: 'Clear',
      load_more: 'Load more results',
      search_label: 'Search this site',
      filters_label: 'Filters',
      zero_results: 'No results for [SEARCH_TERM]',
      many_results: '[COUNT] results for [SEARCH_TERM]',
      one_result: '[COUNT] result for [SEARCH_TERM]',
      alt_search: 'No results for [SEARCH_TERM]. Showing results for [DIFFERENT_TERM] instead:',
      search_suggestion: 'No results for [SEARCH_TERM]. Try one of the following:',
      searching: 'Searching for [SEARCH_TERM]…',
    },
  },

  // Footer content + consent wording moved to the `site` collection — see the
  // FR comments. Only the accessibility strings remain here.
  footer: {
    backToTop: 'Back to top',
  },

  consent: {
    ariaLabel: 'Cookie consent',
  },

  // Blog index texts moved to the `pagesSysteme` collection (see FR comments).
  blog: {
    filterAria: 'Filter by category',
  },

  article: {
    back: '← All resources',
    shareLabel: 'Share:',
    shareLinkedin: 'Share on LinkedIn',
    shareX: 'Share on X',
    shareFacebook: 'Share on Facebook',
    copyLink: 'Copy link',
    copied: 'Link copied!',
    backBtn: '← Back to resources',
    latestTitle: 'Our latest articles',
    readMore: 'Read article',
    breadcrumbHome: 'Home',
    breadcrumbAria: 'Breadcrumb',
  },

  home: {
    learnMore: 'Learn more',
  },

  // merci: moved to the `pagesSysteme` collection (see the FR comments).
  // notFound : voir la collection `site` (miroir du commentaire FR).
};

export const ui: Record<Locale, UI> = { fr, en };

/** Get the chrome strings for a locale. */
export function useTranslations(lang: Locale): UI {
  return ui[lang];
}
