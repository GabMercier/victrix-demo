/**
 * Préremplissage du formulaire Contact par les appels à l'action (2026-09-17).
 *
 * Demande client : « chaque bouton qui mène au formulaire de contact doit
 * arriver sur un formulaire déjà rempli » — le libellé du bouton et la page
 * d'origine (?cta= / ?de=, script de BaseLayout, 2026-09-16) ET les deux
 * listes déroulantes « De quoi souhaitez-vous parler ? » (?sujet=) et
 * « Service » (?expertise=), lues côté client par contact.astro (2026-08-18).
 *
 * Le contenu ne stocke JAMAIS un libellé de liste (ils diffèrent par langue
 * et Julie les a déjà renommés une fois — build cassé le 16/09) mais une CLÉ
 * neutre : `contactSujet` / `contactService` sur les pages (services, pages
 * générales), résolue ici en libellé DE LA LANGUE puis vérifiée contre les
 * options réelles de src/data/contact/<lang>.json (tolérant : une option
 * disparue → pas de préremplissage, jamais d'échec de build). Les clés de
 * service suivent les FAMILLES de services (1er segment du chemin de fichier
 * dans src/content/services/<lang>/) : une page de service hérite de la sienne
 * sans rien configurer.
 *
 * Fichier PUR (aucune dépendance Astro) : testé par presets.test.ts et
 * importé par content.config.ts (enums zod) et BaseLayout.
 */
import type { Locale } from '../../i18n/config';

export const CONTACT_SUJET_KEYS = ['projet', 'expertise', 'carriere', 'autre'] as const;
export type ContactSujetKey = (typeof CONTACT_SUJET_KEYS)[number];

export const CONTACT_SERVICE_KEYS = [
  'cybersecurite',
  'intelligence-artificielle',
  'infonuagique',
  'services-applicatifs',
  'services-geres',
  'autre',
] as const;
export type ContactServiceKey = (typeof CONTACT_SERVICE_KEYS)[number];

/** Clé → libellé attendu dans « De quoi souhaitez-vous parler ? » (par langue). */
export const CONTACT_SUJET_LABELS: Record<Locale, Record<ContactSujetKey, string>> = {
  fr: { projet: 'Un projet', expertise: 'Une expertise', carriere: 'Une carrière', autre: 'Autre' },
  en: { projet: 'A project', expertise: 'An area of expertise', carriere: 'A career', autre: 'Other' },
};

/** Clé → libellé attendu dans « Service » (par langue). */
export const CONTACT_SERVICE_LABELS: Record<Locale, Record<ContactServiceKey, string>> = {
  fr: {
    cybersecurite: 'Cybersécurité',
    'intelligence-artificielle': 'Intelligence artificielle',
    infonuagique: 'Infonuagique',
    'services-applicatifs': 'Services applicatifs',
    'services-geres': 'Services gérés',
    autre: 'Autre',
  },
  en: {
    cybersecurite: 'Cybersecurity',
    'intelligence-artificielle': 'Artificial intelligence',
    infonuagique: 'Cloud',
    'services-applicatifs': 'Application services',
    'services-geres': 'Managed services',
    autre: 'Other',
  },
};

/**
 * Famille de service (1er segment du chemin de fichier, identique FR/EN) →
 * clé de service. Familles ABSENTES à dessein (aucune option du formulaire ne
 * leur correspond — l'éditeur peut fixer `contactService` sur la page) :
 * conseil-strategique, approvisionnement-ti, demo-*.
 */
export const SERVICE_FAMILY_PRESET: Record<string, ContactServiceKey> = {
  cybersecurite: 'cybersecurite',
  'intelligence-artificielle': 'intelligence-artificielle',
  'projets-en-ia': 'intelligence-artificielle',
  'services-infonuagiques': 'infonuagique',
  infrastructure: 'infonuagique',
  'services-applicatifs': 'services-applicatifs',
  productivite: 'services-applicatifs',
  'services-ti-geres': 'services-geres',
};

/** Clé de service héritée du chemin de fichier d'un service (`cybersecurite/zero-trust` → cybersecurite). */
export function serviceFamilyPreset(filePath: string): ContactServiceKey | '' {
  const family = filePath.replace(/^\/+/, '').split('/')[0] ?? '';
  return SERVICE_FAMILY_PRESET[family] ?? '';
}

export interface ContactPresetKeys {
  sujet?: ContactSujetKey | '' | undefined;
  service?: ContactServiceKey | '' | undefined;
}

export interface ContactOptions {
  subjectOptions: readonly string[];
  expertiseOptions: readonly string[];
}

export interface ContactPresetLabels {
  /** Libellé exact d'une option de « De quoi souhaitez-vous parler ? », ou ''. */
  sujet: string;
  /** Libellé exact d'une option de « Service », ou ''. */
  service: string;
}

/**
 * Clés → libellés DE LA LANGUE, gardés seulement s'ils existent dans les
 * options réelles de la page Contact (sinon '' : préremplissage silencieux
 * plutôt qu'un build rouge quand une option est renommée au CMS).
 */
export function resolveContactPreset(
  lang: Locale,
  keys: ContactPresetKeys,
  options: ContactOptions,
): ContactPresetLabels {
  const sujetLabel = keys.sujet ? (CONTACT_SUJET_LABELS[lang][keys.sujet] ?? '') : '';
  const serviceLabel = keys.service ? (CONTACT_SERVICE_LABELS[lang][keys.service] ?? '') : '';
  return {
    sujet: options.subjectOptions.includes(sujetLabel) ? sujetLabel : '',
    service: options.expertiseOptions.includes(serviceLabel) ? serviceLabel : '',
  };
}
