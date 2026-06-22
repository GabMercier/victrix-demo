/**
 * i18n core — locales, types, and the small set of helpers every page/component
 * uses. Keep this framework-agnostic and dependency-free.
 *
 * URL scheme: both locales are prefixed — `/fr/…` and `/en/…` (see astro.config).
 * Internal links are stored WITHOUT a locale and prefixed at render time via
 * `localizePath()`, so the same content/href works for both languages.
 */

export const locales = ['fr', 'en'] as const;
export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = 'fr';

/** The "other" language — used by the language switch. */
export const otherLocale: Record<Locale, Locale> = { fr: 'en', en: 'fr' };

/** <html lang> + Intl locale (Canadian variants). */
export const htmlLang: Record<Locale, string> = { fr: 'fr-CA', en: 'en-CA' };

export function isLocale(value: string | undefined | null): value is Locale {
  return value === 'fr' || value === 'en';
}

/** getStaticPaths helper for every `src/pages/[lang]/…` route. */
export function localePaths() {
  return locales.map((lang) => ({ params: { lang }, props: { lang } }));
}

/**
 * Prefix a site-internal, root-relative path with the locale.
 * `('/contact', 'en')` → `/en/contact`; `('/', 'fr')` → `/fr`.
 * Leaves external links, anchors, and `mailto:`/`tel:` untouched.
 */
export function localizePath(path: string, lang: Locale): string {
  if (!path.startsWith('/')) return path;
  if (path === '/') return `/${lang}`;
  return `/${lang}${path}`;
}

/**
 * Swap the locale segment of a pathname — for the language switch.
 * `('/fr/contact', 'en')` → `/en/contact`; an unprefixed path → that locale's home.
 */
export function swapLocale(pathname: string, to: Locale): string {
  const match = pathname.match(/^\/(fr|en)(\/.*)?$/);
  if (match) return `/${to}${match[2] ?? ''}`;
  return `/${to}`;
}
