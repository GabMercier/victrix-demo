/**
 * « Fond de section » — LA palette des fonds clairs, source unique (2026-09-17).
 *
 * Avant : chaque composant Bookshop portait sa propre carte `FONDS` (5 clés) et
 * chaque spec *.bookshop.yml sa propre liste `values` — ajouter une teinte
 * voulait dire toucher ~30 fichiers. Désormais :
 *  - les COMPOSANTS importent `FOND_CLASSES` (clé → utilitaire Tailwind) et
 *    le type `FondKey` ;
 *  - le SCHÉMA zod (src/content.config.ts) importe `FOND_KEYS` ;
 *  - l'ÉDITEUR CloudCannon lit `_select_data.fonds` (cloudcannon.config.yml,
 *    liste d'objets {cle, libelle, couleur, apercu}) référencée par les specs —
 *    la liste ci-dessous et `_select_data.fonds` DOIVENT rester alignées
 *    (garde-fou : src/lib/fonds.test.ts compare les deux) ;
 *  - les pastilles de couleur de l'éditeur (public/images/cms/fonds/*.svg)
 *    sont générées par scripts/design/generate-cms-previews.mjs depuis
 *    `FOND_SWATCHES`.
 *
 * Règle inchangée (esprit P-16) : un select borné, jamais de couleur libre ;
 * fonds CLAIRS seulement (textes/liens lisibles sans re-design) ; les peaux
 * sombres restent des `variant` par composant (cta « nuit », etc.).
 *
 * Teintes : les gris viennent de l'échelle neutre export2 (theme.css), les
 * bleus de bleu-50/100, les chauds des secondaires Figma (ivoire, beige) —
 * « sable » a été RÉ-ACCORDÉ le 2026-09-17 (demande user : trop orangé ; le
 * jeton Figma #ebe0d5 devient #e9e2d9, un grège plus neutre) et « pierre »
 * (#dcd5cc) ajouté comme grège plus soutenu. PALETTE RAFFINÉE le 2026-09-18
 * (demande user) : les DEUX fonds chauds du nouveau système sont « ivoire »
 * #fcf9f5 (le chaud) et « beige » #f6f3ef (le gris chaud) — mêmes clés, donc
 * les sections déjà posées suivent ; sable/pierre restent des accents plus
 * soutenus. Ce fichier est browser-safe
 * (aucune dépendance) : il est aussi compilé dans le bundle d'édition live.
 *
 * FONDS SOMBRES : UN SEUL aplat bleu depuis le 2026-09-22 — « Bleu électrique »
 * #1D46F3 (clé `bleu-electrique`) = `bg-primary`. Les codes officiels de la
 * marque (BLEU NUIT #000D2E, BLEU ÉLECTRIQUE #1D46F3) ont montré que la
 * maquette du 21/09 était fautive : les deux aplats qu'elle avait fait naître,
 * « Bleu Victrix » #002fc7 et « Bleu électrique » #1a5bff, portaient deux
 * valeurs erronées du MÊME bleu. Ils fusionnent donc, et la clé `bleu-profond`
 * est SUPPRIMÉE — sans risque : aucune section du contenu ne portait l'un ou
 * l'autre (0 occurrence mesurée avant le retrait).
 * Un fond sombre EXIGE que le composant inverse
 * ses textes — il n'est donc offert QUE dans les sections qui savent le faire
 * (`_select_data.fonds_etendus`). Elles sont DIX depuis le 2026-09-21 :
 * rich-text, callout, stats, logo-banner, faq (première vague) puis
 * home-experts, benefits, value-tiles, feature-boxes, text-photo (sections
 * d'accroche, demande Gabriel). Les autres gardent `_select_data.fonds`, la
 * palette claire. Sur fond sombre, tout passe au BLANC : les accents clairs du
 * Design System (`primary-fixed-dim`) ne donnent que 3,1:1 sur le bleu
 * électrique, sous le seuil AA. Le BLEU NUIT est proscrit comme texte sur le
 * bleu électrique et réciproquement : 2,94:1, mesuré le 22/09. Le garde-fou de scripts/design/generate-cms-previews.mjs compare les
 * DEUX listes à ce fichier.
 */

/** Clés fermées, dans l'ORDRE d'affichage du sélecteur (blancs/gris, bleus, chauds). */
export const FOND_KEYS = [
  'blanc',
  'givre',
  'perle',
  'brume',
  'bleu-pale',
  'bleu-clair',
  'ivoire',
  'beige',
  'sable',
  'pierre',
] as const;

export type FondKey = (typeof FOND_KEYS)[number];

/**
 * Fonds SOMBRES — texte INVERSÉ par le composant (voir `estFondSombre`).
 * Réservés aux sections qui gèrent l'inversion ; jamais dans `FOND_KEYS`.
 */
export const FOND_KEYS_SOMBRES = ['bleu-electrique'] as const;

export type FondSombreKey = (typeof FOND_KEYS_SOMBRES)[number];

/** Palette claire + fonds sombres — l'ordre du sélecteur « étendu ». */
export const FOND_KEYS_ETENDUS = [...FOND_KEYS, ...FOND_KEYS_SOMBRES] as const;

export type FondEtenduKey = FondKey | FondSombreKey;

/** Vrai si la clé demande des textes clairs (repli : fond clair). */
export function estFondSombre(fond?: string | null): boolean {
  return (FOND_KEYS_SOMBRES as readonly string[]).includes(fond ?? '');
}

/** Clé → utilitaire Tailwind (classes LITTÉRALES : le JIT ne voit que ce qui est écrit). */
export const FOND_CLASSES: Record<FondEtenduKey, string> = {
  blanc: 'bg-white',
  givre: 'bg-givre',
  perle: 'bg-neutral-100',
  brume: 'bg-neutral-200',
  'bleu-pale': 'bg-bleu-50',
  'bleu-clair': 'bg-bleu-100',
  ivoire: 'bg-ivoire',
  beige: 'bg-beige',
  sable: 'bg-sable',
  pierre: 'bg-pierre',
  // 2026-09-22 : un seul aplat bleu, sur le jeton de marque `primary`.
  'bleu-electrique': 'bg-primary',
};

/**
 * Clé → { libellé éditeur, hex } — miroir des jetons de src/styles/theme.css.
 * Sert aux pastilles de l'éditeur et à la documentation, PAS au rendu (le
 * rendu passe par les classes ci-dessus, donc par les jetons CSS).
 */
export const FOND_SWATCHES: Record<FondEtenduKey, { libelle: string; couleur: string }> = {
  blanc: { libelle: 'Blanc', couleur: '#ffffff' },
  givre: { libelle: 'Givre (gris très pâle)', couleur: '#f9fafb' },
  perle: { libelle: 'Perle (gris pâle)', couleur: '#f3f4f7' },
  brume: { libelle: 'Brume (gris clair)', couleur: '#e5e7eb' },
  'bleu-pale': { libelle: 'Bleu pâle', couleur: '#f2f5fd' },
  'bleu-clair': { libelle: 'Bleu clair', couleur: '#dfe7fb' },
  ivoire: { libelle: 'Ivoire (chaud)', couleur: '#fcf9f5' },
  beige: { libelle: 'Beige (gris chaud)', couleur: '#f6f3ef' },
  sable: { libelle: 'Sable (grège)', couleur: '#e9e2d9' },
  pierre: { libelle: 'Pierre (grège soutenu)', couleur: '#dcd5cc' },
  'bleu-electrique': { libelle: 'Bleu électrique (texte blanc)', couleur: '#1d46f3' },
};
