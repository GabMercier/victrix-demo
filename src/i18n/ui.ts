/**
 * UI / chrome dictionary — everything outside the page bodies & content
 * collections: header, footer, blog index, article controls, 404.
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

  // Recherche interne (P-06) — page /recherche + entrée du header. Le bloc
  // `ui` est passé tel quel aux traductions de l'interface Pagefind (clés
  // officielles de PagefindUI; [SEARCH_TERM]/[COUNT] = jetons Pagefind).
  search: {
    navLabel: 'Recherche',
    navAria: 'Rechercher sur le site',
    metaTitle: 'Recherche',
    metaDescription:
      'Recherchez dans l’ensemble du contenu du site Victrix : services, expertises, articles et pages.',
    eyebrow: 'Recherche',
    title: 'Rechercher sur le site',
    intro: 'Trouvez un service, une expertise, un article ou une page.',
    noscript:
      'La recherche nécessite JavaScript. Vous pouvez aussi parcourir le site via le menu ou consulter le blogue.',
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

  footer: {
    columns: [
      {
        title: 'Expertises',
        links: [
          { label: 'Consultation stratégique', href: '/expertises/consultation-strategique' },
          { label: 'Infonuagique', href: '/expertises/infonuagique' },
          { label: 'Cybersécurité', href: '/expertises/cybersecurite' },
          { label: 'Productivité', href: '/expertises/productivite' },
          { label: 'Intelligence artificielle', href: '/expertises/intelligence-artificielle' },
          { label: 'Services gérés', href: '/expertises/services-geres' },
        ],
      },
      {
        title: 'Produits',
        links: [
          { label: 'Licences et équipements', href: '/produits/licences-equipements' },
          { label: 'Intranet — Plateforme d’expérience employé', href: '/produits/intranet' },
          { label: 'Application de réservation de bureau', href: '/produits/reservation-bureau' },
        ],
      },
      {
        title: 'À propos',
        links: [
          { label: 'Carrières & Vie@Victrix', href: '/carrieres' },
          { label: 'Blogue', href: '/ressources' },
          { label: 'Tarification', href: '/tarification' },
        ],
      },
    ],
    contactTitle: 'Contact',
    addressName: 'Les Solutions Victrix',
    addressLines: ['1100, boul. René-Lévesque Ouest, bureau 1900', 'Montréal (Québec) H3B 4N4'],
    socialLabel: 'Suivez-nous :',
    facebookAria: 'Victrix sur Facebook',
    linkedinAria: 'Victrix sur LinkedIn',
    legal: [
      { label: 'Conditions d’utilisation', href: '/conditions-utilisation' },
      { label: 'Politique de confidentialité', href: '/politique-confidentialite' },
    ],
  },

  blog: {
    eyebrow: 'Ressources',
    title: 'Le blogue Victrix',
    intro:
      'Analyses, bonnes pratiques et points de vue de nos experts pour accompagner la transformation numérique de votre organisation.',
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
  },

  home: {
    learnMore: 'En savoir plus',
  },

  // Page /merci — atterrissage après une soumission de formulaire réussie
  // (redirection 303 de /api/forms, voir docs/formulaires.md). noindex.
  merci: {
    metaTitle: 'Merci',
    metaDescription: 'Votre message a bien été envoyé à l’équipe Victrix.',
    title: 'Merci !',
    text: 'Votre message a été envoyé. Notre équipe vous répondra dans les meilleurs délais.',
    links: [
      { label: 'Retour à l’accueil', href: '/', primary: true },
      { label: 'Consulter le blogue', href: '/ressources', primary: false },
    ],
  },

  notFound: {
    metaTitle: 'Page en construction',
    metaDescription:
      'Cette section du site Victrix est en cours de construction. Découvrez les pages déjà en ligne.',
    eyebrow: 'Erreur 404',
    title: 'Page en construction',
    text: 'La page que vous cherchez n’est pas encore en ligne — ou n’existe pas. Ce site est un prototype : plusieurs sections sont toujours en cours de réalisation. Merci de votre patience !',
    requestedLabel: 'Adresse demandée :',
    links: [
      { label: 'Retour à l’accueil', href: '/', primary: true },
      { label: 'Consulter le blogue', href: '/ressources', primary: false },
      { label: 'Nous joindre', href: '/contact', primary: false },
    ],
  },
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

  // Internal search (P-06) — /recherche page + header entry. The `ui` block is
  // handed verbatim to the Pagefind UI translations.
  search: {
    navLabel: 'Search',
    navAria: 'Search this site',
    metaTitle: 'Search',
    metaDescription:
      'Search all Victrix site content: services, expertise areas, articles and pages.',
    eyebrow: 'Search',
    title: 'Search the site',
    intro: 'Find a service, an expertise area, an article or a page.',
    noscript:
      'Search requires JavaScript. You can also browse the site through the menu or visit the blog.',
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

  footer: {
    columns: [
      {
        title: 'Expertise',
        links: [
          { label: 'Strategic consulting', href: '/expertises/consultation-strategique' },
          { label: 'Cloud computing', href: '/expertises/infonuagique' },
          { label: 'Cybersecurity', href: '/expertises/cybersecurite' },
          { label: 'Productivity', href: '/expertises/productivite' },
          { label: 'Artificial intelligence', href: '/expertises/intelligence-artificielle' },
          { label: 'Managed services', href: '/expertises/services-geres' },
        ],
      },
      {
        title: 'Products',
        links: [
          { label: 'Licensing and equipment', href: '/produits/licences-equipements' },
          { label: 'Intranet — Employee experience platform', href: '/produits/intranet' },
          { label: 'Desk booking app', href: '/produits/reservation-bureau' },
        ],
      },
      {
        title: 'About',
        links: [
          { label: 'Careers & Life@Victrix', href: '/carrieres' },
          { label: 'Blog', href: '/ressources' },
          { label: 'Pricing', href: '/tarification' },
        ],
      },
    ],
    contactTitle: 'Contact',
    addressName: 'Les Solutions Victrix',
    addressLines: ['1100, boul. René-Lévesque Ouest, Suite 1900', 'Montréal (Québec) H3B 4N4'],
    socialLabel: 'Follow us:',
    facebookAria: 'Victrix on Facebook',
    linkedinAria: 'Victrix on LinkedIn',
    legal: [
      { label: 'Terms of use', href: '/conditions-utilisation' },
      { label: 'Privacy policy', href: '/politique-confidentialite' },
    ],
  },

  blog: {
    eyebrow: 'Resources',
    title: 'The Victrix blog',
    intro:
      "Analysis, best practices and insights from our experts to support your organization's digital transformation.",
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
  },

  home: {
    learnMore: 'Learn more',
  },

  // /merci page — post-submission landing (303 redirect from /api/forms).
  merci: {
    metaTitle: 'Thank you',
    metaDescription: 'Your message has been sent to the Victrix team.',
    title: 'Thank you!',
    text: 'Your message has been sent. Our team will get back to you as soon as possible.',
    links: [
      { label: 'Back to home', href: '/', primary: true },
      { label: 'Visit the blog', href: '/ressources', primary: false },
    ],
  },

  notFound: {
    metaTitle: 'Page under construction',
    metaDescription:
      'This section of the Victrix site is under construction. Explore the pages already online.',
    eyebrow: 'Error 404',
    title: 'Page under construction',
    text: "The page you're looking for isn't online yet — or doesn't exist. This site is a prototype: several sections are still being built. Thanks for your patience!",
    requestedLabel: 'Requested address:',
    links: [
      { label: 'Back to home', href: '/', primary: true },
      { label: 'Visit the blog', href: '/ressources', primary: false },
      { label: 'Contact us', href: '/contact', primary: false },
    ],
  },
};

export const ui: Record<Locale, UI> = { fr, en };

/** Get the chrome strings for a locale. */
export function useTranslations(lang: Locale): UI {
  return ui[lang];
}
