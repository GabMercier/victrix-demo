/**
 * Résolution des liens de navigation vers des services — méga-menu dynamique
 * (P-07, chantier E.3). Fonction PURE et browser-safe (aucun import de module
 * non exécutable) : utilisée par src/components/Header.astro AU BUILD et
 * testable unitairement (le garde-fou est prouvé par un test négatif —
 * service-links.test.ts).
 *
 * Un lien de navigation (collection `navigation`) porte SOIT `href` (mode par
 * défaut — les liens actuels), SOIT `service` (identifiant d'un service de la
 * collection `services`). Quand `service` est non vide, l'URL finale est
 * CALCULÉE depuis la collection (/<lang>/services/<slug>) et un identifiant
 * introuvable FAIT ÉCHOUER le build : la navigation reste la source de l'ordre
 * et des libellés, la collection est la source de vérité des URLs et de
 * l'existence des services. La convention chaîne vide du dépôt s'applique :
 * `service: ""` (ou espaces) = pas de service → on utilise `href`.
 */
import { type Locale, localizePath } from '../../i18n/config';

// Préfixe d'URL des services — DOIT rester aligné avec la route
// src/pages/[lang]/services/[slug].astro (constante URL_PREFIX là-bas).
export const SERVICE_URL_PREFIX = 'services';

export interface NavLinkLike {
  href?: string;
  service?: string;
}

/**
 * URL finale localisée d'un lien de navigation.
 * - `service` non vide : /<lang>/services/<slug>, résolu contre `serviceSlugs`
 *   (l'ensemble des slugs de la collection `services` POUR CETTE LANGUE). Un
 *   slug absent lève une erreur nommant la langue et le fichier attendu — le
 *   build échoue, rien de cassé n'atteint le site.
 * - sinon : localizePath(href) — comportement historique inchangé.
 */
export function resolveNavHref(
  link: NavLinkLike,
  lang: Locale,
  serviceSlugs: ReadonlySet<string>,
): string {
  const service = (link.service ?? '').trim();
  if (service !== '') {
    if (!serviceSlugs.has(service)) {
      throw new Error(
        `[navigation] ${lang}.json : lien vers le service « ${service} » introuvable — ` +
          `attendu src/content/services/${lang}/${service}.json (collection Services). ` +
          `Corriger l'identifiant du lien, ou créer le service.`,
      );
    }
    return localizePath(`/${SERVICE_URL_PREFIX}/${service}`, lang);
  }
  return localizePath(link.href ?? '', lang);
}
