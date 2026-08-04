/**
 * Résolution de la configuration d'en-tête/pied de page des campagnes (P-04).
 *
 * Une campagne (collection `landing`) peut porter un bloc `header` optionnel
 * en frontmatter — trois modes :
 *  - « complet » (ou bloc absent) : l'en-tête normal du site, à l'octet près ;
 *  - « allege »  : logo + UN bouton d'appel à l'action, STRICTEMENT (fiche
 *    P-04) — annonce, navigation, recherche, sélecteur de langue et tiroir
 *    mobile absents, quels que soient les interrupteurs ;
 *  - « personnalise » : liens bornés (sans méga-menus) + CTA + interrupteurs
 *    annonce / sélecteur de langue / icône recherche (amendement 28/07 :
 *    recherche OPT-IN, absente par défaut hors mode complet).
 *
 * Convention CloudCannon : les champs optionnels arrivent en chaîne VIDE («
 * jamais null ») — un CTA `{ label: "", href: "" }` compte comme absent, et
 * l'absence de CTA retombe sur le bouton portail (nav.portal), comme le header
 * complet. Logique PURE (aucun import Astro) → testable en vitest.
 */

export type HeaderMode = 'complet' | 'allege' | 'personnalise';

export interface HeaderLink {
  label: string;
  /** URL FINALE, préfixe de langue inclus (convention des sections landing). */
  href: string;
}

/** Bloc `header` du frontmatter landing (voir content.config.ts). CTA plat
 *  (ctaLabel/ctaHref) — mêmes noms que les sections, pour hériter des _inputs
 *  CloudCannon existants. */
export interface LandingHeaderConfig {
  mode?: HeaderMode;
  links?: HeaderLink[];
  ctaLabel?: string;
  ctaHref?: string;
  showAnnounce?: boolean;
  showLangSwitch?: boolean;
  showSearch?: boolean;
}

/** Drapeaux consommés par Header.astro — toute la politique est ICI. */
export interface ResolvedHeaderConfig {
  mode: HeaderMode;
  /** Navigation complète (menu + méga-menus + tiroir mobile) — mode complet. */
  showNav: boolean;
  /** Liens simples du mode personnalisé (déjà bornés à 5 par le zod). */
  links: HeaderLink[];
  /** CTA sur mesure ; null = retomber sur le bouton portail (nav.portal). */
  cta: HeaderLink | null;
  showAnnounce: boolean;
  showLangSwitch: boolean;
  showSearch: boolean;
}

const FULL: ResolvedHeaderConfig = {
  mode: 'complet',
  showNav: true,
  links: [],
  cta: null,
  showAnnounce: true,
  showLangSwitch: true,
  showSearch: true,
};

/** CTA sur mesure seulement si libellé ET lien non vides (convention ""). */
function resolveCta(ctaLabel?: string, ctaHref?: string): HeaderLink | null {
  const label = ctaLabel?.trim() ?? '';
  const href = ctaHref?.trim() ?? '';
  return label && href ? { label, href } : null;
}

export function resolveHeaderConfig(config?: LandingHeaderConfig): ResolvedHeaderConfig {
  const mode = config?.mode ?? 'complet';
  if (mode === 'complet') return FULL;

  if (mode === 'allege') {
    return {
      mode,
      showNav: false,
      links: [],
      cta: resolveCta(config?.ctaLabel, config?.ctaHref),
      // « Logo + CTA » strict : les interrupteurs sont IGNORÉS (fiche P-04).
      showAnnounce: false,
      showLangSwitch: false,
      showSearch: false,
    };
  }

  return {
    mode: 'personnalise',
    showNav: false,
    links: config?.links ?? [],
    cta: resolveCta(config?.ctaLabel, config?.ctaHref),
    showAnnounce: config?.showAnnounce ?? false,
    showLangSwitch: config?.showLangSwitch ?? true,
    showSearch: config?.showSearch ?? false,
  };
}

export type FooterMode = 'complet' | 'allege';

/**
 * Pied de page : « allege » = logo + barre légale (liens légaux + ©) seuls.
 * Champ frontmatter PLAT `footerMode` (voir content.config.ts — collision de
 * cascade CloudCannon avec le `mode` de l'en-tête sinon).
 */
export function resolveFooterMode(mode?: FooterMode): FooterMode {
  return mode ?? 'complet';
}
