/**
 * Flux RSS des ressources (P-14) — un flux par langue :
 * /fr/rss.xml et /en/rss.xml, généré au build via @astrojs/rss (paquet
 * officiel Astro). Mêmes sources et règles que l'index Ressources :
 * getPostsByLocale = articles PUBLIÉS de la langue, du plus récent au plus
 * ancien ; URLs canoniques AVEC barre oblique finale (la forme sans barre
 * fait un 308 sur Cloudflare Pages).
 */
import rss from '@astrojs/rss';
import type { APIRoute } from 'astro';
import { locales, type Locale, localizePath } from '../../i18n/config';
import { useTranslations } from '../../i18n/ui';
import { getPostsByLocale, postUrlSlug } from '../../i18n/blog';

export function getStaticPaths() {
  return locales.map((lang) => ({ params: { lang } }));
}

export const GET: APIRoute = async (context) => {
  const lang = context.params.lang as Locale;
  const t = useTranslations(lang);
  const posts = await getPostsByLocale(lang);

  return rss({
    title: `${t.siteName} — ${t.blog.eyebrow}`,
    description: t.blog.intro,
    // `site` = astro.config `site` (obligatoire pour des liens absolus).
    site: context.site!,
    items: posts.map((post) => ({
      title: post.data.title,
      description: post.data.excerpt,
      pubDate: post.data.date,
      link: localizePath(`/ressources/${postUrlSlug(post)}/`, lang),
    })),
    customData: `<language>${lang === 'fr' ? 'fr-ca' : 'en-ca'}</language>`,
  });
};
