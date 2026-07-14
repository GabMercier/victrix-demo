/**
 * UI / chrome dictionary — everything outside the page bodies & content
 * collections: header, footer, blog index, article controls, 404.
 *
 * `fr` is the source of truth; `en` is typed against it (`UI`), so the two
 * locales can never drift out of shape — a missing/extra key fails the build.
 * Internal hrefs are stored without a locale and prefixed at render via
 * `localizePath()`. Page-body copy lives in `src/i18n/content/*` and the
 * `home`/`blog` content collections, not here.
 */

import type { Locale } from './config';

const fr = {
  siteName: 'Victrix',
  defaultDescription:
    'Victrix — services-conseils en TI et solutions de productivité pour les entreprises et les organisations publiques.',
  skipLink: 'Aller au contenu principal',

  nav: {
    items: [
      { label: 'Découvrir Victrix', href: '/decouvrir' },
      { label: 'Expertises', href: '/expertises' },
      { label: 'Produits', href: '/produits' },
      { label: 'Carrière', href: '/carrieres' },
      { label: 'Contact', href: '/contact' },
      { label: 'Ressources', href: '/ressources' },
    ],
    portal: 'Portail client',
    brandAria: 'Victrix — Accueil',
    openMenu: 'Ouvrir le menu',
    closeMenu: 'Fermer le menu',
    langGroupAria: 'Choix de la langue',
    // Mega menu under "Expertises" (desktop) — mirrors victrix.ca's dropdown.
    // `parentHref` matches the nav item above; `icon` keys map to the inline
    // SVGs in Header.astro.
    mega: {
      parentHref: '/expertises',
      ariaLabel: 'Sous-menu Expertises',
      columns: [
        {
          title: 'Conseil stratégique',
          href: '/expertises/consultation-strategique',
          icon: 'strategy',
          links: [
            { label: 'Conformité Loi 25', href: '/expertises/consultation-strategique/conformite-loi-25' },
          ],
        },
        {
          title: 'Infonuagique',
          href: '/expertises/infonuagique',
          icon: 'cloud',
          links: [
            { label: 'Microsoft Azure', href: '/expertises/infonuagique/microsoft-azure' },
            { label: 'Amazon Web Services', href: '/expertises/infonuagique/amazon-web-services' },
          ],
        },
        {
          title: 'Cybersécurité',
          href: '/expertises/cybersecurite',
          icon: 'security',
          links: [
            { label: 'Centre opérationnel de sécurité (SOC) évolutif', href: '/expertises/cybersecurite/soc-evolutif' },
            { label: 'Tests d’intrusion', href: '/expertises/cybersecurite/tests-intrusion' },
            { label: 'IoT et OT', href: '/expertises/cybersecurite/iot-ot' },
          ],
        },
        {
          title: 'Productivité',
          href: '/expertises/productivite',
          icon: 'productivity',
          links: [
            { label: 'Ø Studio', href: '/produits' },
            { label: 'Intelligence artificielle', href: '/expertises/intelligence-artificielle' },
            { label: 'Plateforme employé et intranet', href: '/produits/intranet' },
            { label: 'ServiceNow', href: '/expertises/productivite/servicenow' },
            { label: 'Dynamics 365 Field Service', href: '/expertises/productivite/dynamics-365-field-service' },
            { label: 'Copilot pour Microsoft 365', href: '/expertises/productivite/copilot-microsoft-365' },
            { label: 'Copilot Studio', href: '/expertises/productivite/copilot-studio' },
            { label: 'O bureau', href: '/produits/reservation-bureau' },
          ],
        },
        {
          title: 'Services gérés',
          href: '/expertises/services-geres',
          icon: 'managed',
          links: [
            { label: 'Services TI gérés', href: '/expertises/services-geres/services-ti-geres' },
            { label: 'Environnement Microsoft 365', href: '/expertises/services-geres/environnement-microsoft-365' },
          ],
        },
      ],
    },
  },

  announce: {
    before: 'Découvrez ',
    strong: 'Ø Studio',
    after:
      ', notre catalogue d’applications et de services pour accélérer votre productivité.',
    linkLabel: 'En savoir plus →',
    linkHref: '/produits',
    close: 'Fermer l’annonce',
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
    socialLabel: 'Suivez-nous :',
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
    shareLabel: 'Partager :',
    shareLinkedin: 'Partager sur LinkedIn',
    shareX: 'Partager sur X',
    shareFacebook: 'Partager sur Facebook',
    copyLink: 'Copier le lien',
    copied: 'Lien copié !',
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
    text: 'La page que vous cherchez n’est pas encore en ligne — ou n’existe pas. Ce site est un prototype : plusieurs sections sont toujours en cours de réalisation. Merci de votre patience !',
    requestedLabel: 'Adresse demandée :',
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
    items: [
      { label: 'Discover Victrix', href: '/decouvrir' },
      { label: 'Expertise', href: '/expertises' },
      { label: 'Products', href: '/produits' },
      { label: 'Careers', href: '/carrieres' },
      { label: 'Contact', href: '/contact' },
      { label: 'Resources', href: '/ressources' },
    ],
    portal: 'Client portal',
    brandAria: 'Victrix — Home',
    openMenu: 'Open menu',
    closeMenu: 'Close menu',
    langGroupAria: 'Language',
    mega: {
      parentHref: '/expertises',
      ariaLabel: 'Expertise submenu',
      columns: [
        {
          title: 'Strategic consulting',
          href: '/expertises/consultation-strategique',
          icon: 'strategy',
          links: [
            { label: 'Law 25 compliance', href: '/expertises/consultation-strategique/conformite-loi-25' },
          ],
        },
        {
          title: 'Cloud computing',
          href: '/expertises/infonuagique',
          icon: 'cloud',
          links: [
            { label: 'Microsoft Azure', href: '/expertises/infonuagique/microsoft-azure' },
            { label: 'Amazon Web Services', href: '/expertises/infonuagique/amazon-web-services' },
          ],
        },
        {
          title: 'Cybersecurity',
          href: '/expertises/cybersecurite',
          icon: 'security',
          links: [
            { label: 'Scalable Security Operations Centre (SOC)', href: '/expertises/cybersecurite/soc-evolutif' },
            { label: 'Penetration testing', href: '/expertises/cybersecurite/tests-intrusion' },
            { label: 'IoT and OT', href: '/expertises/cybersecurite/iot-ot' },
          ],
        },
        {
          title: 'Productivity',
          href: '/expertises/productivite',
          icon: 'productivity',
          links: [
            { label: 'Ø Studio', href: '/produits' },
            { label: 'Artificial intelligence', href: '/expertises/intelligence-artificielle' },
            { label: 'Employee platform and intranet', href: '/produits/intranet' },
            { label: 'ServiceNow', href: '/expertises/productivite/servicenow' },
            { label: 'Dynamics 365 Field Service', href: '/expertises/productivite/dynamics-365-field-service' },
            { label: 'Copilot for Microsoft 365', href: '/expertises/productivite/copilot-microsoft-365' },
            { label: 'Copilot Studio', href: '/expertises/productivite/copilot-studio' },
            { label: 'O bureau', href: '/produits/reservation-bureau' },
          ],
        },
        {
          title: 'Managed services',
          href: '/expertises/services-geres',
          icon: 'managed',
          links: [
            { label: 'Managed IT services', href: '/expertises/services-geres/services-ti-geres' },
            { label: 'Microsoft 365 environment', href: '/expertises/services-geres/environnement-microsoft-365' },
          ],
        },
      ],
    },
  },

  announce: {
    before: 'Discover ',
    strong: 'Ø Studio',
    after: ', our catalogue of apps and services to accelerate your productivity.',
    linkLabel: 'Learn more →',
    linkHref: '/produits',
    close: 'Dismiss announcement',
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
    text: "The page you're looking for isn't online yet — or doesn't exist. This site is a prototype: several sections are still being built. Thanks for your patience!",
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
