/**
 * Chrome copy for the Solutions catalogue page, FR + EN. Template:
 * src/pages/[lang]/solutions.astro (entries live in the `solutions`
 * collection — src/content/solutions/<locale>/*.json). FIDÉLITÉ MAQUETTE
 * 2026-08-05 (docs/design/solutions-catalogue.css + capture « Ø Studio -
 * Catalogue de solutions ») — organisation complète planifiée dans
 * docs/design/solutions-catalogue-plan.md.
 */

import type { Locale } from '../config';

const fr = {
  metaTitle: 'Catalogue de solutions',
  metaDescription:
    'Parcourez le catalogue de solutions Ø Studio : applications Power Platform et Dynamics 365 prêtes à déployer, par secteur d’activité et type de solution.',
  toolbarTitle: 'Catalogue de solutions',
  searchPlaceholder: 'Rechercher une application...',
  searchAria: 'Rechercher une application dans le catalogue',
  featuredBadge: 'Application vedette',
  featuredCta: 'Découvrir l’application',
  featuredDoc: 'Voir la documentation',
  sectorLabel: 'Secteurs d’activité',
  sectorAll: 'Tous les secteurs',
  typeLabel: 'Types de solution',
  typeAll: 'Toutes les solutions',
  discover: 'Découvrir',
  emptyMessage: 'Aucune solution ne correspond à vos filtres.',
  ctaTitle: 'Vous ne trouvez pas la solution parfaite ?',
  ctaText:
    'Nos experts ont déjà développé plus de 100 solutions personnalisées pour répondre aux défis uniques de nos clients. Ensemble, créons celle qu’il vous faut !',
  ctaPhone: '+1 418-780-8181',
  ctaPhoneHref: 'tel:+14187808181',
  ctaButton: 'Contacter un expert',
};

type SolutionsContent = typeof fr;

const en: SolutionsContent = {
  metaTitle: 'Solutions catalogue',
  metaDescription:
    'Browse the Ø Studio solutions catalogue: ready-to-deploy Power Platform and Dynamics 365 applications, by industry and solution type.',
  toolbarTitle: 'Solutions catalogue',
  searchPlaceholder: 'Search for an application...',
  searchAria: 'Search for an application in the catalogue',
  featuredBadge: 'Featured application',
  featuredCta: 'Discover the application',
  featuredDoc: 'View the documentation',
  sectorLabel: 'Industries',
  sectorAll: 'All industries',
  typeLabel: 'Solution types',
  typeAll: 'All solutions',
  discover: 'Discover',
  emptyMessage: 'No solution matches your filters.',
  ctaTitle: 'Can’t find the perfect solution?',
  ctaText:
    'Our experts have already built more than 100 custom solutions to meet our clients’ unique challenges. Together, let’s create the one you need!',
  ctaPhone: '+1 418-780-8181',
  ctaPhoneHref: 'tel:+14187808181',
  ctaButton: 'Contact an expert',
};

export const solutionsContent: Record<Locale, SolutionsContent> = { fr, en };
