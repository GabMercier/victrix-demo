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

  // Footer — contenu des colonnes ALIGNÉ sur la maquette Figma « Composants »
  // (2026-08-04). Cibles « mortes assumées » (pages à créer, décision user,
  // comme /decouvrir — /carrieres existe depuis 2026-08-05) :
  // /services/infrastructure, /secteurs,
  // /services/services-applicatifs, /services/projets-en-ia,
  // /centre-de-confiance, /tarification.
  footer: {
    columns: [
      {
        title: 'Expertises',
        links: [
          { label: 'Conseil stratégique', href: '/services/conseil-strategique' },
          { label: 'Intelligence artificielle', href: '/services/intelligence-artificielle' },
          { label: 'Infrastructure', href: '/services/infrastructure' },
          { label: 'Secteurs d’activité', href: '/secteurs' },
        ],
      },
      {
        title: 'Services',
        links: [
          { label: 'Services applicatifs', href: '/services/services-applicatifs' },
          { label: 'Infonuagique', href: '/services/services-infonuagiques' },
          { label: 'Cybersécurité', href: '/services/cybersecurite' },
          { label: 'Projets en IA', href: '/services/projets-en-ia' },
          { label: 'Services gérés', href: '/services/services-ti-geres' },
        ],
      },
      {
        title: 'Produits',
        links: [
          { label: 'Application de réservation de bureau', href: '/services/productivite/o-bureau' },
          { label: 'Plateforme employé', href: '/services/productivite/plateforme-employe-intranet' },
          { label: 'Approvisionnement TI', href: '/services/approvisionnement-ti' },
          { label: 'Catalogue de solutions', href: '/solutions' },
          { label: 'Tarification', href: '/tarification' },
        ],
      },
      {
        title: 'À propos',
        links: [
          { label: 'Découvrir Victrix', href: '/decouvrir' },
          { label: 'Carrière', href: '/carrieres' },
          { label: 'Centre de confiance', href: '/centre-de-confiance' },
          { label: 'Ressources', href: '/ressources' },
          { label: 'Actualités', href: '/ressources' },
        ],
      },
    ],
    contactTitle: 'Contact',
    addressName: 'Les Solutions Victrix',
    addressLines: ['1100, boul. René-Lévesque Ouest, bureau 1900', 'Montréal (Québec) H3B 4N4'],
    socialLabel: 'Suivez-nous sur :',
    // Chip du footer = accès au PORTAIL (maquette) ; liens sociaux TEXTE.
    // URLs sociales réelles à fournir (héritées « # » de l'ancien footer).
    contactCta: { label: 'Portail client', href: '/portail' },
    social: [
      { label: 'Facebook', href: '#' },
      { label: 'LinkedIn', href: '#' },
    ],
    backToTop: 'Retour en haut de page',
    legal: [
      { label: 'Conditions d’utilisation', href: '/conditions-utilisation' },
      { label: 'Politique de confidentialité', href: '/politique-confidentialite' },
    ],
  },

  // Bandeau de consentement Loi 25 (P-10) — design minimal ASSUMÉ (décision
  // 17/07), re-stylé au redesign via tokens. Aucun script analytique ne se
  // charge sans « Accepter » (gating générique — voir ConsentBanner.astro).
  consent: {
    ariaLabel: 'Consentement aux témoins',
    text: 'Nous utilisons des témoins (cookies) à des fins de mesure d’audience, conformément à la Loi 25.',
    policyLabel: 'Politique de confidentialité',
    policyHref: '/politique-confidentialite',
    accept: 'Accepter',
    refuse: 'Refuser',
  },

  blog: {
    eyebrow: 'Ressources',
    title: 'Le blogue Victrix',
    intro:
      'Analyses, bonnes pratiques et points de vue de nos experts pour accompagner la transformation numérique de votre organisation.',
    filterAll: 'Tous',
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
          { label: 'Strategic consulting', href: '/services/conseil-strategique' },
          { label: 'Artificial intelligence', href: '/services/intelligence-artificielle' },
          { label: 'Infrastructure', href: '/services/infrastructure' },
          { label: 'Sectors', href: '/secteurs' },
        ],
      },
      {
        title: 'Services',
        links: [
          { label: 'Application services', href: '/services/services-applicatifs' },
          { label: 'Cloud computing', href: '/services/services-infonuagiques' },
          { label: 'Cybersecurity', href: '/services/cybersecurite' },
          { label: 'AI projects', href: '/services/projets-en-ia' },
          { label: 'Managed services', href: '/services/services-ti-geres' },
        ],
      },
      {
        title: 'Products',
        links: [
          { label: 'Desk booking app', href: '/services/productivite/o-bureau' },
          { label: 'Employee platform', href: '/services/productivite/plateforme-employe-intranet' },
          { label: 'IT procurement', href: '/services/approvisionnement-ti' },
          { label: 'Solutions catalogue', href: '/solutions' },
          { label: 'Pricing', href: '/tarification' },
        ],
      },
      {
        title: 'About',
        links: [
          { label: 'Discover Victrix', href: '/decouvrir' },
          { label: 'Careers', href: '/carrieres' },
          { label: 'Trust centre', href: '/centre-de-confiance' },
          { label: 'Resources', href: '/ressources' },
          { label: 'News', href: '/ressources' },
        ],
      },
    ],
    contactTitle: 'Contact',
    addressName: 'Les Solutions Victrix',
    addressLines: ['1100, boul. René-Lévesque Ouest, Suite 1900', 'Montréal (Québec) H3B 4N4'],
    socialLabel: 'Follow us on:',
    contactCta: { label: 'Client portal', href: '/portail' },
    social: [
      { label: 'Facebook', href: '#' },
      { label: 'LinkedIn', href: '#' },
    ],
    backToTop: 'Back to top',
    legal: [
      { label: 'Terms of use', href: '/conditions-utilisation' },
      { label: 'Privacy policy', href: '/politique-confidentialite' },
    ],
  },

  // Law 25 consent banner (P-10) — deliberately minimal design (17/07
  // decision), restyled via tokens at the redesign.
  consent: {
    ariaLabel: 'Cookie consent',
    text: 'We use cookies for audience measurement, in accordance with Quebec’s Law 25.',
    policyLabel: 'Privacy policy',
    policyHref: '/politique-confidentialite',
    accept: 'Accept',
    refuse: 'Refuse',
  },

  blog: {
    eyebrow: 'Resources',
    title: 'The Victrix blog',
    intro:
      "Analysis, best practices and insights from our experts to support your organization's digital transformation.",
    filterAll: 'All',
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
