// =============================================================================
// Migration MACHINE-FIDÈLE : accueil.json (objet imbriqué) → { sections: [...] }
//
// Transforme le contenu d'accueil du modèle « panneau de données » (objet
// hero/iso/expertises/…) vers le modèle « sections composables » (tableau
// `sections`, comme la collection `landing`), rendu par le renderer Bookshop
// partagé avec édition visuelle live. AUCUN texte n'est retapé : chaque valeur
// est lue depuis le fichier existant puis recopiée telle quelle.
//
// - Les liens (`ctaHref`, `href`) sont stockés AVEC le préfixe de langue
//   (`/fr/…`, `/en/…`) — exactement ce que produisait `localizePath()` au
//   rendu de l'ancienne page. Les composants reçoivent les sections telles
//   quelles (aucune localisation au rendu), comme les campagnes.
// - Chaque section porte `_bookshop_name` (clé id_key de la palette générée par
//   @bookshop/generate) + `type` (discriminant du contrat, masqué dans
//   l'éditeur). Zod ignore `_bookshop_name`.
// - `learnMore` (libellé du bouton des cartes d'expertise) était fourni par le
//   dictionnaire UI (t.home.learnMore) ; il devient un champ de contenu pour
//   que le composant reste autonome dans le navigateur (aucun import i18n).
//
// Idempotent : si le fichier contient déjà `sections`, il est laissé tel quel.
// Usage : `node scripts/migrate-home-to-sections.mjs`
// =============================================================================
import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');

// Libellé du bouton « En savoir plus » par langue — repris du dictionnaire UI
// (src/i18n/ui.ts, `home.learnMore`). Seule constante hors des fichiers de
// contenu ; ce n'est pas du contenu éditorial mais un libellé de chrome.
const LEARN_MORE = { fr: 'En savoir plus', en: 'Learn more' };

/** Réplique localizePath() : préfixe un chemin racine-relatif avec la langue. */
function localize(path, lang) {
  if (typeof path !== 'string' || !path.startsWith('/')) return path;
  if (path === '/') return `/${lang}`;
  return `/${lang}${path}`;
}

/** Construit le tableau `sections` à partir de l'ancien objet imbriqué. */
function toSections(data, lang) {
  const { hero, iso, expertises, solutions, partners, experts, articles } = data;
  return [
    {
      _bookshop_name: 'home-hero',
      type: 'home-hero',
      eyebrow: hero.eyebrow ?? '',
      title: hero.title,
      subtitle: hero.subtitle,
      ctaLabel: hero.ctaLabel,
      ctaHref: localize(hero.ctaHref, lang),
    },
    {
      _bookshop_name: 'home-iso',
      type: 'home-iso',
      title: iso.title,
      subtitle: iso.subtitle,
    },
    {
      _bookshop_name: 'home-expertises',
      type: 'home-expertises',
      sectionTitle: expertises.sectionTitle,
      learnMore: LEARN_MORE[lang],
      items: expertises.items.map((it) => ({
        number: it.number,
        title: it.title,
        accent: it.accent,
        description: it.description,
        href: localize(it.href, lang),
      })),
    },
    {
      _bookshop_name: 'home-solution',
      type: 'home-solution',
      eyebrow: solutions.eyebrow,
      title: solutions.title,
      body: solutions.body,
      ctaLabel: solutions.ctaLabel,
      ctaHref: localize(solutions.ctaHref, lang),
      image: solutions.image,
    },
    {
      _bookshop_name: 'home-partners',
      type: 'home-partners',
      title: partners.title,
      names: partners.names,
    },
    {
      _bookshop_name: 'home-experts',
      type: 'home-experts',
      title: experts.title,
      subtitle: experts.subtitle,
      ctaLabel: experts.ctaLabel,
      ctaHref: localize(experts.ctaHref, lang),
    },
    {
      _bookshop_name: 'home-latest',
      type: 'home-latest',
      title: articles.title,
      ctaLabel: articles.ctaLabel,
      ctaHref: localize(articles.ctaHref, lang),
    },
  ];
}

for (const lang of ['fr', 'en']) {
  const file = resolve(root, 'src/content/home', lang, 'accueil.json');
  const data = JSON.parse(await readFile(file, 'utf-8'));
  if (Array.isArray(data.sections)) {
    console.log(`• ${lang}/accueil.json : déjà migré (sections présentes) — ignoré`);
    continue;
  }
  const out = { sections: toSections(data, lang) };
  await writeFile(file, JSON.stringify(out, null, 2) + '\n', 'utf-8');
  console.log(`✓ ${lang}/accueil.json : ${out.sections.length} sections écrites`);
}
