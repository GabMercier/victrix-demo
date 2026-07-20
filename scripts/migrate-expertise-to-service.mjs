// =============================================================================
// Migration MACHINE-FIDÈLE : expertise « intelligence-artificielle » → service
// composable (P-07).
//
// Transforme le contenu de src/content/expertises/{fr,en}/intelligence-
// artificielle.json (modèle « objet plat », rendu par un gabarit Astro dédié)
// vers src/content/services/{fr,en}/intelligence-artificielle.json (modèle
// « sections composables », tableau `sections` rendu par le renderer Bookshop
// partagé avec édition visuelle live — comme les campagnes et l'accueil).
//
// AUCUN texte n'est retapé : chaque valeur est LUE depuis le fichier expertise
// existant puis recopiée telle quelle. Les 10 blocs de la page expertise
// tombent sur 6 sections génériques de la palette (port fidèle P-07) :
//   1. héros à image                    → service-hero
//   2. de la stratégie (carte + 3)      → numbered-cards (plain, 3 col, lead-card)
//   3. collaboration (2 cartes + CTA)   → numbered-cards (underline, tint, center)
//   4/7. encadrés d'appel à l'action    → callout (box)
//   5. domaines d'expertise             → feature-boxes
//   6. expertise multitechnologique     → tech-columns (+ sous-groupe)
//   8. bassin d'experts (4 cartes)      → numbered-cards (underline, tint, center)
//   9. conclusion                       → rich-text
//   10. bandeau vert                    → callout (banner-green)
// Une section « ressources liées » (nouveauté P-07) est ajoutée en fin de page.
//
// - Les liens (CTA) sont stockés AVEC le préfixe de langue (/fr/…, /en/…),
//   exactement ce que produisait localizePath() au rendu de la page expertise.
// - Chaque section porte `_bookshop_name` (clé id_key de la palette générée par
//   @bookshop/generate) + `type` (discriminant du contrat, masqué dans
//   l'éditeur). Zod ignore `_bookshop_name`.
// - L'image du héros (src/assets/ai-hero.png, jadis via astro:assets) est copiée
//   dans public/images/sections/ et référencée par un chemin PUBLIC (browser-
//   safe), comme les autres images de section (P-02).
// - Les noms de technologies du bloc « multitechnologique », jadis codés en dur
//   dans le gabarit expertise (neutres en langue), deviennent du CONTENU ici.
//
// Idempotent : si le fichier service contient déjà `sections`, il est laissé tel
// quel. La page expertise d'origine N'EST PAS touchée (redirection en P-17).
// Usage : `node scripts/migrate-expertise-to-service.mjs`
// =============================================================================
import { readFile, writeFile, mkdir, copyFile, access } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');

const SLUG = 'intelligence-artificielle';
// Image du héros servie telle quelle (public), copiée depuis src/assets.
const HERO_IMAGE_SRC = resolve(root, 'src/assets/ai-hero.png');
const HERO_IMAGE_PUBLIC_REL = `/images/sections/${SLUG}-hero.png`;
const HERO_IMAGE_DEST = resolve(root, 'public', HERO_IMAGE_PUBLIC_REL.replace(/^\//, ''));

// Étiquettes du blogue par langue pour la section « ressources liées » — elles
// correspondent aux articles IA existants (src/content/blog/**), pour que la
// résolution au build donne de vraies cartes.
const RELATED = {
  fr: {
    title: 'Ressources liées',
    tags: ['Intelligence artificielle'],
    ctaLabel: 'Voir toutes les ressources',
  },
  en: {
    title: 'Related resources',
    tags: ['Artificial intelligence'],
    ctaLabel: 'See all resources',
  },
};

/** Réplique localizePath() : préfixe un chemin racine-relatif avec la langue. */
function localize(path, lang) {
  if (typeof path !== 'string' || !path.startsWith('/')) return path;
  if (path === '/') return `/${lang}`;
  return `/${lang}${path}`;
}

/** Construit le tableau `sections` à partir de l'objet expertise. */
function toSections(ai, lang) {
  const contact = localize('/contact', lang);
  const rel = RELATED[lang];
  return [
    // 1 — Héros à image (porte le <h1> : surtitre accentué + suite du titre).
    {
      _bookshop_name: 'service-hero',
      type: 'service-hero',
      eyebrow: ai.hero.eyebrow,
      titleAccent: ai.hero.titleAccent,
      title: ai.hero.titleRest,
      lead: ai.hero.lead,
      ctaLabel: ai.hero.cta,
      ctaHref: contact,
      image: HERO_IMAGE_PUBLIC_REL,
      imageAlt: '',
    },
    // 2 — « De la stratégie à l'adoption » : titre simple + carte d'intro + 3 cartes.
    {
      _bookshop_name: 'numbered-cards',
      type: 'numbered-cards',
      sectionTitle: ai.fromStrategy.blockTitle,
      headingStyle: 'plain',
      leadCard: { title: ai.fromStrategy.leadCardTitle, text: ai.fromStrategy.leadCardText },
      tone: 'default',
      columns: '3',
      cardStyle: 'default',
      items: ai.interventions.map((c) => ({ number: c.n, title: c.title, text: c.text })),
    },
    // 3 — Collaboration : titre souligné + intro + 2 cartes centrées avec CTA, fond teinté.
    {
      _bookshop_name: 'numbered-cards',
      type: 'numbered-cards',
      sectionTitle: ai.collaboration.sHead,
      headingStyle: 'underline',
      intro: ai.collaboration.sIntro,
      tone: 'tint',
      columns: '2',
      cardStyle: 'center',
      items: ai.collaboration.items.map((c) => ({
        number: c.n,
        title: c.title,
        text: c.text,
        ctaLabel: c.cta,
        ctaHref: contact,
      })),
    },
    // 4 — Encadré d'appel à l'action 1.
    {
      _bookshop_name: 'callout',
      type: 'callout',
      title: ai.cta1.title,
      body: ai.cta1.text,
      ctaLabel: ai.cta1.cta,
      ctaHref: contact,
      layout: 'box',
    },
    // 5 — Domaines d'expertise (boîtes bordées).
    {
      _bookshop_name: 'feature-boxes',
      type: 'feature-boxes',
      sectionTitle: ai.areas.sHead,
      subtitle: ai.areas.sSub,
      boxes: ai.areas.items,
    },
    // 6 — Expertise multitechnologique (noms de technologies jadis codés en dur).
    {
      _bookshop_name: 'tech-columns',
      type: 'tech-columns',
      sectionTitle: ai.multiTech.sHead,
      groups: [
        {
          title: ai.multiTech.col1Title,
          items: ['OpenAI', 'Llama', 'Claude', 'Gemini'],
        },
        {
          title: ai.multiTech.col2Title,
          items: ['Copilot 365', 'Copilot (Dynamics 365)', 'ChatGPT', 'NowAssist (ServiceNow)'],
        },
        {
          title: ai.multiTech.col3Title,
          items: ['Copilot Studio', 'Azure AI Foundry', 'ServiceNow AI Platform'],
          subgroup: {
            label: ai.multiTech.openLocalLabel,
            items: ['LangChain', 'Hugging Face', 'Docker', 'Ollama'],
          },
        },
      ],
    },
    // 7 — Encadré d'appel à l'action 2 (sans texte).
    {
      _bookshop_name: 'callout',
      type: 'callout',
      title: ai.cta2.title,
      body: '',
      ctaLabel: ai.cta2.cta,
      ctaHref: contact,
      layout: 'box',
    },
    // 8 — Bassin d'experts : titre souligné + 4 cartes centrées, fond teinté.
    {
      _bookshop_name: 'numbered-cards',
      type: 'numbered-cards',
      sectionTitle: ai.expertsPanel.sHead,
      headingStyle: 'underline',
      tone: 'tint',
      columns: '2',
      cardStyle: 'center',
      items: ai.expertsPanel.items.map((c) => ({ number: c.n, title: c.title, text: c.text })),
    },
    // 9 — Conclusion (paragraphes enrichis).
    {
      _bookshop_name: 'rich-text',
      type: 'rich-text',
      title: ai.closing.blockTitle,
      paragraphs: [ai.closing.p1, ai.closing.p2],
    },
    // 10 — Bandeau vert.
    {
      _bookshop_name: 'callout',
      type: 'callout',
      title: ai.greenCta.title,
      body: ai.greenCta.text,
      ctaLabel: ai.greenCta.cta,
      ctaHref: contact,
      layout: 'banner-green',
    },
    // Bonus P-07 — ressources liées (résolues au build via le seam enrich).
    {
      _bookshop_name: 'related-posts',
      type: 'related-posts',
      title: rel.title,
      tags: rel.tags,
      ctaLabel: rel.ctaLabel,
      ctaHref: localize('/ressources', lang),
    },
  ];
}

/** Copie l'image du héros vers public/ (une seule fois). */
async function copyHeroImage() {
  try {
    await access(HERO_IMAGE_DEST);
    console.log(`• image héros : déjà présente (${HERO_IMAGE_PUBLIC_REL}) — ignorée`);
    return;
  } catch {
    /* absente — on la copie ci-dessous */
  }
  await mkdir(dirname(HERO_IMAGE_DEST), { recursive: true });
  await copyFile(HERO_IMAGE_SRC, HERO_IMAGE_DEST);
  console.log(`✓ image héros copiée → public${HERO_IMAGE_PUBLIC_REL}`);
}

await copyHeroImage();

for (const lang of ['fr', 'en']) {
  const srcFile = resolve(root, 'src/content/expertises', lang, `${SLUG}.json`);
  const destFile = resolve(root, 'src/content/services', lang, `${SLUG}.json`);

  // Idempotence : ne pas réécrire un service déjà migré.
  try {
    const existing = JSON.parse(await readFile(destFile, 'utf-8'));
    if (Array.isArray(existing.sections)) {
      console.log(`• ${lang}/${SLUG}.json : déjà migré (sections présentes) — ignoré`);
      continue;
    }
  } catch {
    /* fichier absent — on le crée ci-dessous */
  }

  const ai = JSON.parse(await readFile(srcFile, 'utf-8'));
  const out = {
    title: ai.metaTitle,
    description: ai.metaDescription,
    // INDEXABLE par défaut (inverse des campagnes) — décision explicite P-07.
    noindex: false,
    sections: toSections(ai, lang),
  };
  await mkdir(dirname(destFile), { recursive: true });
  await writeFile(destFile, JSON.stringify(out, null, 2) + '\n', 'utf-8');
  console.log(`✓ ${lang}/${SLUG}.json : ${out.sections.length} sections écrites`);
}
