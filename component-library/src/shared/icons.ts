/**
 * Banque de pictogrammes — source UNIQUE de tous les pictogrammes des sections
 * (2026-09-18, demande client : « chaque section à icône offre TOUTE la banque
 * dans une liste déroulante, pas seulement les icônes de cette section »).
 *
 * Avant : dix composants portaient chacun leur carte `ICONS` (47 entrées, 40
 * dessins dont plusieurs redites quasi identiques — trois boucliers, deux
 * engrenages…) et dix listes `_select_data.icones_<groupe>`. Désormais, même
 * patron que `fonds.ts` :
 *  - les COMPOSANTS importent `iconFor` + `iconSvgAttrs` et gardent leur
 *    propre <svg> (taille, classes, épaisseur de trait de LEUR maquette) ;
 *  - le SCHÉMA zod (src/content.config.ts) importe `ICON_KEYS` ;
 *  - l'ÉDITEUR CloudCannon lit UNE liste `_select_data.icones`
 *    ({cle, libelle, apercu}) référencée par tous les sélecteurs d'icône ;
 *  - les vignettes public/images/cms/icones/<cle>.svg sont générées par
 *    scripts/design/generate-cms-previews.mjs, qui ÉCHOUE si la liste de
 *    l'éditeur et cette banque divergent (clés ou ordre).
 *
 * Ajouter un pictogramme = une entrée ici + une entrée dans
 * `_select_data.icones` + `npm run cms:previews`. Rien d'autre : il devient
 * disponible dans TOUTES les sections.
 *
 * Deux familles de tracés :
 *  - trait (défaut) : viewBox 24, `stroke="currentColor"`, l'épaisseur vient du
 *    composant (1,2 à 2 selon la maquette de la section) ;
 *  - `plein: true` : `fill="currentColor"` ; `viewBox` / `w` / `h` propres
 *    quand le glyphe a été fourni tel quel par le client (page Expertises).
 *
 * Clés en français, minuscules et traits d'union ; l'ORDRE est celui du
 * sélecteur (par thème). Migration du 2026-09-18 (scripts/migrate-icons-bank.mjs)
 * — redites fusionnées sur un seul dessin : insigne → coche ; les trois
 * « bouclier », les deux « engrenage », « graphique » et « document » ;
 * renommées pour lever les homonymes : etoile (outils) → etincelle, personnes →
 * groupe, groupe (chiffres) → groupe-mains, engrenages → engrenage-horloge,
 * croissance (atouts, pleine) → croissance-pleine.
 *
 * Browser-safe (aucune dépendance) : compilé aussi dans le bundle d'édition
 * live Bookshop, comme fonds.ts et rich.ts.
 */

export interface IconDef {
  /** Attributs `d` des tracés, dans l'ordre de dessin. */
  paths: string[];
  /** Glyphe plein (fill currentColor) au lieu du trait. */
  plein?: boolean;
  /** viewBox propre ; défaut « 0 0 24 24 ». */
  viewBox?: string;
  /** Taille native (px) d'un glyphe plein fourni par le client. */
  w?: number;
  h?: number;
}

export const ICONS = {
  // Personnes et relations
  personne: {
    paths: [
      'M12 11a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Z',
      'M5 20c.8-3.2 3.6-5 7-5s6.2 1.8 7 5',
    ],
  },
  groupe: {
    paths: [
      'M9 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z',
      'M3.5 19c.6-2.7 2.7-4.5 5.5-4.5s4.9 1.8 5.5 4.5',
      'M15.5 5.6a3 3 0 0 1 0 4.8M17.5 14.9c1.6.6 2.7 1.9 3 4.1',
    ],
  },
  'groupe-mains': {
    paths: [
      'M9 8.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z',
      'M15 8.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z',
      'M5.5 13.5c.5-2 1.9-3 3.5-3s3 1 3.5 3M11.5 13.5c.5-2 1.9-3 3.5-3s3 1 3.5 3',
      'M3 16.5c1.5 1.5 3 2.5 4.5 3M21 16.5c-1.5 1.5-3 2.5-4.5 3M7.5 19.5h9',
    ],
  },
  porteur: {
    paths: [
      'M8 8C6.9 8 5.95833 7.60833 5.175 6.825C4.39167 6.04167 4 5.1 4 4C4 2.9 4.39167 1.95833 5.175 1.175C5.95833 0.391667 6.9 0 8 0C9.1 0 10.0417 0.391667 10.825 1.175C11.6083 1.95833 12 2.9 12 4C12 5.1 11.6083 6.04167 10.825 6.825C10.0417 7.60833 9.1 8 8 8ZM12 16V9.6C12.4167 9.73333 12.825 9.875 13.225 10.025C13.625 10.175 14.0167 10.35 14.4 10.55C14.9 10.8 15.2917 11.1625 15.575 11.6375C15.8583 12.1125 16 12.6333 16 13.2V16H12ZM6 12.5V9.15C6.33333 9.1 6.66667 9.0625 7 9.0375C7.33333 9.0125 7.66667 9 8 9C8.33333 9 8.66667 9.0125 9 9.0375C9.33333 9.0625 9.66667 9.1 10 9.15V12.5H6ZM0 16V13.2C0 12.6333 0.141667 12.1125 0.425 11.6375C0.708333 11.1625 1.1 10.8 1.6 10.55C1.98333 10.35 2.375 10.175 2.775 10.025C3.175 9.875 3.58333 9.73333 4 9.6V16H0Z',
    ],
    plein: true,
    viewBox: '0 0 16 16',
    w: 16,
    h: 16,
  },
  destinataire: {
    paths: [
      'M0 12V10.425C0 9.70833 0.366667 9.125 1.1 8.675C1.83333 8.225 2.8 8 4 8C4.21667 8 4.425 8.00417 4.625 8.0125C4.825 8.02083 5.01667 8.04167 5.2 8.075C4.96667 8.425 4.79167 8.79167 4.675 9.175C4.55833 9.55833 4.5 9.95833 4.5 10.375V12H0ZM6 12V10.375C6 9.84167 6.14583 9.35417 6.4375 8.9125C6.72917 8.47083 7.14167 8.08333 7.675 7.75C8.20833 7.41667 8.84583 7.16667 9.5875 7C10.3292 6.83333 11.1333 6.75 12 6.75C12.8833 6.75 13.6958 6.83333 14.4375 7C15.1792 7.16667 15.8167 7.41667 16.35 7.75C16.8833 8.08333 17.2917 8.47083 17.575 8.9125C17.8583 9.35417 18 9.84167 18 10.375V12H6ZM19.5 12V10.375C19.5 9.94167 19.4458 9.53333 19.3375 9.15C19.2292 8.76667 19.0667 8.40833 18.85 8.075C19.0333 8.04167 19.2208 8.02083 19.4125 8.0125C19.6042 8.00417 19.8 8 20 8C21.2 8 22.1667 8.22083 22.9 8.6625C23.6333 9.10417 24 9.69167 24 10.425V12H19.5ZM4 7C3.45 7 2.97917 6.80417 2.5875 6.4125C2.19583 6.02083 2 5.55 2 5C2 4.43333 2.19583 3.95833 2.5875 3.575C2.97917 3.19167 3.45 3 4 3C4.56667 3 5.04167 3.19167 5.425 3.575C5.80833 3.95833 6 4.43333 6 5C6 5.55 5.80833 6.02083 5.425 6.4125C5.04167 6.80417 4.56667 7 4 7ZM20 7C19.45 7 18.9792 6.80417 18.5875 6.4125C18.1958 6.02083 18 5.55 18 5C18 4.43333 18.1958 3.95833 18.5875 3.575C18.9792 3.19167 19.45 3 20 3C20.5667 3 21.0417 3.19167 21.425 3.575C21.8083 3.95833 22 4.43333 22 5C22 5.55 21.8083 6.02083 21.425 6.4125C21.0417 6.80417 20.5667 7 20 7ZM12 6C11.1667 6 10.4583 5.70833 9.875 5.125C9.29167 4.54167 9 3.83333 9 3C9 2.15 9.29167 1.4375 9.875 0.8625C10.4583 0.2875 11.1667 0 12 0C12.85 0 13.5625 0.2875 14.1375 0.8625C14.7125 1.4375 15 2.15 15 3C15 3.83333 14.7125 4.54167 14.1375 5.125C13.5625 5.70833 12.85 6 12 6Z',
    ],
    plein: true,
    viewBox: '0 0 24 12',
    w: 24,
    h: 12,
  },
  poignee: {
    paths: [
      'm11 17 2 2a1 1 0 1 0 3-3',
      'm14 14 2.5 2.5a1 1 0 1 0 3-3l-3.9-3.9a3 3 0 0 0-4.2 0l-.9.9a1 1 0 1 1-3-3l2.8-2.8a5.8 5.8 0 0 1 7.1-.9l.5.3a2 2 0 0 0 1.4.2L21 4',
      'm21 3 1 11h-2',
      'M3 3 2 14l6.5 6.5a1 1 0 1 0 3-3',
      'M3 4h8',
    ],
  },
  coeur: {
    paths: [
      'M12 20.7C7.3 17.6 3 14.2 3 9.9 3 7.2 5.1 5 7.8 5c1.6 0 3.2.8 4.2 2.1C13 5.8 14.6 5 16.2 5 18.9 5 21 7.2 21 9.9c0 4.3-4.3 7.7-9 10.8Z',
    ],
    plein: true,
  },
  // Affaires et pilotage
  dossier: {
    paths: [
      'M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7Z',
    ],
  },
  document: {
    paths: [
      'M6 3h8l4 4v14H6V3Z',
      'M14 3v4h4',
      'M9 12h6M9 16h6',
    ],
  },
  organisation: {
    paths: [
      'M0 18V0H10V4H20V18H0ZM2 16H8V14H2V16ZM2 12H8V10H2V12ZM2 8H8V6H2V8ZM2 4H8V2H2V4ZM10 16H18V6H10V16ZM12 10V8H16V10H12ZM12 14V12H16V14H12Z',
    ],
    plein: true,
    viewBox: '0 0 20 18',
    w: 20,
    h: 18,
  },
  croissance: {
    paths: [
      'm3.5 17.5 5.5-5.5 4 4 7-7.5',
      'M15 8.5h5v5',
    ],
  },
  'croissance-pleine': {
    paths: [
      'M16 6h5v5l-1.87-1.87L14 14.3l-4-4-5.6 5.6L3 14.5l7-7 4 4 4.13-4.13L16 6Z',
    ],
    plein: true,
  },
  progression: {
    paths: [
      'M12 4a8 8 0 1 0 8 8h-2a6 6 0 1 1-1.76-4.24L14 10h6V4l-2.35 2.35A8 8 0 0 0 12 4Z',
    ],
    plein: true,
  },
  graphique: {
    paths: [
      'M4 20h16',
      'M7 20v-6',
      'M12 20V8',
      'M17 20V9',
    ],
  },
  cible: {
    paths: [
      'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Z',
      'M12 17a5 5 0 1 0 0-10 5 5 0 0 0 0 10Z',
      'M12 13a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z',
    ],
  },
  carte: {
    paths: [
      'm9 4-6 2v14l6-2 6 2 6-2V4l-6 2-6-2Z',
      'M9 4v14',
      'M15 6v14',
    ],
  },
  calendrier: {
    paths: [
      'M4 6h16v15H4V6Z',
      'M4 10h16M8 3v5M16 3v5',
    ],
  },
  // Idées, qualité, reconnaissance
  ampoule: {
    paths: [
      'M12 3a6 6 0 0 0-3.4 10.9c.8.6 1.4 1.6 1.4 2.6h4c0-1 .6-2 1.4-2.6A6 6 0 0 0 12 3Z',
      'M9.5 19.5h5',
      'M10.5 22h3',
    ],
  },
  etoile: {
    paths: [
      'm12 3.5 2.5 5.2 5.7.7-4.2 4 1.1 5.6-5.1-2.8-5.1 2.8 1.1-5.6-4.2-4 5.7-.7L12 3.5Z',
    ],
  },
  etincelle: {
    paths: ['M12 3v18M4.2 7.5l15.6 9M19.8 7.5l-15.6 9'],
  },
  eclair: {
    paths: ['M13 2 4.5 13.5h6L11 22l8.5-11.5h-6L13 2Z'],
  },
  coche: {
    paths: [
      'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Z',
      'm8.5 12.5 2.5 2.5 4.5-5.5',
    ],
  },
  losange: {
    paths: [
      'M12 3 4 9.5 12 21l8-11.5L12 3Z',
      'm8 9.5 4 4.5 4-4.5',
      'M4 9.5h16',
    ],
  },
  formation: {
    paths: [
      'm12 3 10 4.6-10 4.6L2 7.6 12 3Z',
      'M5 12v4.3c0 1.5 3.1 2.7 7 2.7s7-1.2 7-2.7V12l-7 3.2L5 12Z',
    ],
    plein: true,
  },
  // Technologie et sécurité
  bouclier: {
    paths: [
      'M12 3 5 5.5v5c0 4.4 3 8.1 7 9.5 4-1.4 7-5.1 7-9.5v-5L12 3Z',
      'm9.5 11.8 1.9 1.9 3.4-3.6',
    ],
  },
  engrenage: {
    paths: [
      'M12 15.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Z',
      'M19.4 15a1.7 1.7 0 0 0 .34 1.87l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.7 1.7 0 0 0-1.87-.34 1.7 1.7 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09a1.7 1.7 0 0 0-1.1-1.51 1.7 1.7 0 0 0-1.87.34l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.7 1.7 0 0 0 .34-1.87 1.7 1.7 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09a1.7 1.7 0 0 0 1.51-1.1 1.7 1.7 0 0 0-.34-1.87l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.7 1.7 0 0 0 1.87.34h.09a1.7 1.7 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.7 1.7 0 0 0 1 1.51 1.7 1.7 0 0 0 1.87-.34l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.7 1.7 0 0 0-.34 1.87v.09a1.7 1.7 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.7 1.7 0 0 0-1.51 1Z',
    ],
  },
  'engrenage-horloge': {
    paths: [
      'M9 21a5 5 0 1 0 0-10 5 5 0 0 0 0 10Z',
      'M9 9.5v-1.5M9 22.5V21M3.5 16H2M16 16h-1.5M5.1 12.1l-1-1M13.9 19.9l-1-1M12.9 12.1l1-1M5.1 19.9l-1 1',
      'M16.5 11.5a4.5 4.5 0 1 0 0-9 4.5 4.5 0 0 0 0 9Z',
      'M16.5 4.5V7l1.8 1.2',
    ],
  },
  ecran: {
    paths: [
      'M4 5h16a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1Z',
      'M9 21h6M12 17v4',
    ],
  },
  fenetre: {
    paths: [
      'M3 5h18v14H3V5Z',
      'M3 9h18M8 5v4',
    ],
  },
  code: {
    paths: [
      'm8 8-4 4 4 4M16 8l4 4-4 4',
      'm13 5-2 14',
    ],
  },
  nuage: {
    paths: [
      'M7 18a4.5 4.5 0 1 1 .7-8.95A6 6 0 0 1 19 10.5 3.75 3.75 0 0 1 18.25 18H7Z',
    ],
  },
  // Secteurs
  trousse: {
    paths: [
      'M4 8h16v12H4V8Z',
      'M9 8V6a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2',
      'M12 11.5v5M9.5 14h5',
    ],
  },
  casque: {
    paths: [
      'M5 13a7 7 0 0 1 14 0',
      'M4 14h3v5H5a1 1 0 0 1-1-1v-4Z',
      'M20 14h-3v5h2a1 1 0 0 0 1-1v-4Z',
      'M17 19a3 3 0 0 1-3 3h-2',
    ],
  },
  marteau: {
    paths: [
      'm14 13-7.5 7.5a1.6 1.6 0 0 1-3-1 1.6 1.6 0 0 1 .8-1.2L11 11.5',
      'm8 8 5-5 8 8-5 5-8-8Z',
      'M13 21h8',
    ],
  },
} satisfies Record<string, IconDef>;

export type IconKey = keyof typeof ICONS;

/** Clés dans l'ordre du sélecteur — tuple non vide pour `z.enum`. */
export const ICON_KEYS = Object.keys(ICONS) as [IconKey, ...IconKey[]];

/**
 * Anciennes clés (listes par section d'avant le 2026-09-18) ENCORE TOLÉRÉES :
 * une sauvegarde CloudCannon faite sur une branche pas encore migrée (staging,
 * ou dev avant le build) ne doit pas casser le build — leçon des incidents
 * `null` et « clés supprimées » de septembre. `iconFor` les résout, le zod les
 * accepte, `scripts/migrate-icons-bank.mjs` les réécrit. Seules les clés
 * DISPARUES figurent ici ; les homonymes restés valides (groupe, etoile,
 * croissance) ne cassent rien et sont corrigés par le script, par section.
 */
export const LEGACY_ICON_ALIASES: Record<string, IconKey> = {
  insigne: 'coche',
  personnes: 'groupe',
  engrenages: 'engrenage-horloge',
};
export const LEGACY_ICON_KEYS = Object.keys(LEGACY_ICON_ALIASES) as [string, ...string[]];

/** Pictogramme d'une clé de contenu ; clé vide ou inconnue → null (rien ne rend). */
export function iconFor(key: string | null | undefined): IconDef | null {
  if (!key) return null;
  const bank = ICONS as Record<string, IconDef>;
  return bank[LEGACY_ICON_ALIASES[key] ?? key] ?? null;
}

/**
 * Attributs de tracé du <svg>, à ÉTALER après width/height/class — le composant
 * garde la taille et l'épaisseur de SA maquette, la banque décide du mode
 * (trait ou plein) et du viewBox. L'ordre des clés reproduit le balisage
 * historique des composants (HTML inchangé pour les pictogrammes au trait).
 */
export function iconSvgAttrs(icon: IconDef, strokeWidth: number | string): Record<string, string> {
  const viewBox = icon.viewBox ?? '0 0 24 24';
  if (icon.plein) return { viewBox, fill: 'currentColor' };
  return {
    viewBox,
    fill: 'none',
    stroke: 'currentColor',
    'stroke-width': String(strokeWidth),
    'stroke-linecap': 'round',
    'stroke-linejoin': 'round',
  };
}
