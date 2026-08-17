import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

/**
 * Content collections (Astro Content Layer).
 *  - `blog` — Markdown articles in src/content/blog (folder collection, Sveltia).
 *  - `home` — singleton homepage content in src/content/home/accueil.json (Sveltia).
 *  - `landing` — section-based campaign pages in src/content/landing, edited
 *    visually in CloudCannon (cloudcannon.config.yml at the repo root); Sveltia
 *    does not manage this collection.
 *  - `expertises` — per-locale JSON for the expertise pages (today: the AI page,
 *    migrated out of src/i18n/content/ai.ts so CloudCannon can edit it); Sveltia
 *    does not manage this collection either.
 *
 * Field names are kept clean to mirror the CMS configs (public/admin/config.yml
 * for Sveltia, cloudcannon.config.yml for CloudCannon).
 */

const blog = defineCollection({
  loader: glob({
    pattern: '**/*.md',
    base: './src/content/blog',
    // Derive the entry id from the FILE PATH only ("<locale>/<filename>").
    // Astro's default generateId uses a `slug` frontmatter field AS the id when
    // present — which would strip the "<locale>/<filename>" pairing key the blog
    // helpers depend on (postLocale, postKey, findCounterpart). Here `slug` is a
    // URL-only field, so we ignore it for id generation. See src/i18n/blog.ts.
    generateId: ({ entry }) => entry.replace(/\\/g, '/').replace(/\.[^/.]+$/, ''),
  }),
  // Clean, CMS-friendly field names — mirror these in cloudcannon.config.yml.
  schema: z.object({
    title: z.string(),
    date: z.coerce.date(),
    excerpt: z.string(),
    // CHEMIN PUBLIC servi tel quel (ex. /wp-content/uploads/2025/07/….jpg) —
    // décision du branchement (2026-07-29) : le corps Markdown migré référence
    // déjà ces chemins verbatim, la couverture suit la même convention (les
    // images des sections aussi). L'ancien `image()` (asset optimisé) est
    // parti avec les 3 articles démo. `.optional()` : quelques articles WP
    // n'avaient pas d'image mise en avant.
    coverImage: z.string().optional(),
    tags: z.array(z.string()).default([]),
    // Maillage Services ↔ Ressources (2026-08-17) : étiquettes THÉMATIQUES
    // consommées par la section « Ressources liées » — DISTINCTES des `tags`
    // (catégories héritées de WordPress, qui alimentent les filtres de l'index
    // du blogue et le méga-menu Ressources ; y verser des thèmes multiplierait
    // les onglets). Vocabulaire aligné sur les expertises : Cybersécurité,
    // Intelligence artificielle, Infonuagique, Productivité, Services gérés,
    // Conseil stratégique (miroirs EN dans les fichiers en/).
    topics: z.array(z.string()).default([]),
    // Optional per-locale URL slug (SEO). When unset the filename is used, so
    // FR can keep its filename-based URLs while EN sets an English slug. The
    // filename still pairs the FR/EN translations — see src/i18n/blog.ts.
    slug: z.string().optional(),
    // Draft flag (CloudCannon switch « Brouillon »). Drafts are EXCLUDED from
    // routes/listings on the public site, but the STATIC_ONLY (CloudCannon
    // editing) build keeps them so editors can preview before publishing —
    // the single switch lives in filterPublished() (src/i18n/blog.ts).
    // `.default(false)` keeps every existing post published without touching
    // its frontmatter.
    draft: z.boolean().default(false),
    // --- Champs hérités de WordPress (branchement Phase 6) ---
    // <title> SEO propre (le suffixe « | Victrix » d'origine est retiré au
    // câblage — BaseLayout appose déjà le nom du site).
    seoTitle: z.string().optional(),
    // Quelques articles (vidéo notamment) étaient noindex sur WP.
    noindex: z.boolean().default(false),
    // URL WordPress d'origine — carburant de l'audit zéro-404 / génération des
    // redirections (Phase 2). Jamais rendu.
    wpUrl: z.string().optional(),
  }),
});

/**
 * Champs de formulaire — SCHÉMA PARTAGÉ entre la section « form » (champs
 * inline, dans sectionsSchema ci-dessous) et la collection `forms`
 * (définitions réutilisables). C'est LE point de synchronisation du contrat
 * de champ; les autres endroits à tenir alignés (P-05) :
 * src/lib/forms/registry.ts (FormFieldDef) → component-library/src/components/
 * form/form.astro (rendu) → cloudcannon.config.yml (_structures.form_fields)
 * → schemas/form-*.json → docs/formulaires.md §4-5.
 *
 * Les clés étendues (P-05) sont TOUTES optionnelles : les définitions
 * existantes (sans ces clés) restent valides telles quelles, et les « formes
 * vides » que pose l'éditeur CloudCannon (options: [], value: '',
 * showIf: {field:'', equals:''}) sont valides aussi — la sémantique « pas de
 * condition » est showIf.field === '' (jamais null : voir le commentaire
 * _structures de cloudcannon.config.yml sur les null).
 */
const FORM_FIELD_TYPES = [
  'text',
  'email',
  'tel',
  'textarea',
  'select',
  'checkbox',
  'hidden',
] as const;

const formFieldCore = z.object({
  label: z.string(),
  type: z.enum(FORM_FIELD_TYPES),
  required: z.boolean(),
  // PRÉSENTATION seulement (re-skin formulaires 2026-08-04, maquettes Figma
  // form1/form2) : « demi » = le champ occupe une demi-rangée (deux champs
  // demi consécutifs partagent une rangée, ex. Prénom / Nom). Absent ou
  // « plein » = pleine largeur. Le serveur l'ignore.
  width: z.enum(['plein', 'demi']).optional(),
  // select seulement : la liste des choix (au moins un non vide — règle croisée).
  options: z.array(z.string()).optional(),
  // hidden seulement : la valeur émise. Jetons {{page.titre|chemin|slug|langue}}
  // (résolus au build via le seam enrich de la route campagnes) et
  // {{url.<param>}} EXACT (rempli dans le navigateur au chargement) — voir
  // src/lib/forms/hidden-tokens.ts.
  value: z.string().optional(),
  // Condition d'affichage : le champ n'apparaît que si le champ pilote —
  // désigné par son LIBELLÉ exact — vaut `equals`. Ergonomie navigateur; côté
  // serveur, le registre ré-évalue la condition pour les champs requis
  // (formulaires liés `_formId` seulement — docs/formulaires.md §5).
  showIf: z.object({ field: z.string(), equals: z.string() }).optional(),
});

type FormFieldInput = z.infer<typeof formFieldCore>;

/**
 * Règles croisées d'un tableau de champs (superRefine des DEUX usages) —
 * build-gate en français, même philosophie que les garde-fous navigation et
 * redirects : un contenu invalide casse le build en nommant la faute et le
 * champ. Limites délibérées : pilote de condition = select ou checkbox
 * (l'égalité sur du texte libre est fragile), pas de chaînage (un pilote
 * conditionnel créerait des cascades ambiguës), pas de condition sur un champ
 * caché (toujours soumis).
 */
function formFieldRules(fields: FormFieldInput[], ctx: z.RefinementCtx): void {
  const activeShowIf = (f: FormFieldInput) =>
    f.showIf && f.showIf.field.trim() !== '' ? f.showIf : null;
  fields.forEach((field, i) => {
    const name = field.label.trim() !== '' ? `« ${field.label} »` : `n° ${i + 1}`;
    if (field.type === 'select') {
      const options = (field.options ?? []).filter((o) => o.trim() !== '');
      if (options.length === 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: [i, 'options'],
          message: `Le champ ${name} (liste déroulante) exige au moins une option`,
        });
      }
    }
    const cond = activeShowIf(field);
    if (!cond) return;
    if (field.type === 'hidden') {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: [i, 'showIf'],
        message: `Le champ caché ${name} ne peut pas porter de condition d'affichage (il est toujours soumis)`,
      });
      return;
    }
    if (cond.equals.trim() === '') {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: [i, 'showIf', 'equals'],
        message: `Condition du champ ${name} : la valeur attendue est vide`,
      });
    }
    const pilotIndex = fields.findIndex((f) => f.label === cond.field);
    if (pilotIndex === -1 || pilotIndex === i) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: [i, 'showIf', 'field'],
        message: `Condition du champ ${name} : champ pilote « ${cond.field} » introuvable dans ce formulaire (recopier le libellé exact d'un autre champ)`,
      });
      return;
    }
    const pilot = fields[pilotIndex];
    if (pilot.type !== 'select' && pilot.type !== 'checkbox') {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: [i, 'showIf', 'field'],
        message: `Condition du champ ${name} : le pilote « ${cond.field} » doit être une liste déroulante ou une case à cocher`,
      });
    }
    if (activeShowIf(pilot)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: [i, 'showIf', 'field'],
        message: `Condition du champ ${name} : le pilote « ${cond.field} » est lui-même conditionnel (chaînage interdit)`,
      });
    }
  });
}

/**
 * Shared `sections` palette — ONE discriminated union used by BOTH the `home`
 * and `landing` collections, so CloudCannon's single generated `sections`
 * palette (the per-component .bookshop.yml specs under component-library, all
 * tagged `structures: [sections]`) is valid in either collection: home
 * sections can appear on a
 * campaign and vice-versa (a deliberate single-palette choice).
 *
 * Discriminated on `type` (the same key the pages switch on, the renderer keys
 * on, and CloudCannon uses as id_key). `_bookshop_name` is stripped like every
 * unknown key — do NOT add .strict() (it would fail the build mid-edit, when
 * CloudCannon's visual editor adds that key). Optional string fields use
 * .optional() and the components treat "" as absent, so a freshly-added blank
 * section never fails validation.
 *
 * `image` is threaded in from the collection's `schema: ({ image }) => …`
 * context (the only place Astro exposes the image() helper). The home-solution
 * image accepts a resolved image OR a plain string ("" on a fresh section, or a
 * not-yet-uploaded path) so adding the section never breaks the build; the page
 * resolves it with getImage only when it is a real image.
 */
function sectionsSchema(image: () => z.ZodTypeAny) {
  // « Fond de section » (2026-08-17, demande user) : lavis de fond au CHOIX,
  // BORNÉ à la palette officielle (esprit P-16 : un select, jamais de couleur
  // libre). 5 fonds CLAIRS seulement — les textes/liens restent lisibles sans
  // re-design ; les peaux SOMBRES restent des `variant` par composant (cta
  // « nuit », etc.). PILOTE sur 6 blocs génériques (benefits, cta, faq, stats,
  // feature-boxes, rich-text) ; le DÉFAUT de chaque bloc = son rendu
  // historique (blanc ou givre) — zéro churn visuel sur l'existant.
  const fondClair = z.enum(['blanc', 'givre', 'ivoire', 'beige', 'sable']);
  return z.discriminatedUnion('type', [
    // ---- Campaign landing sections (frozen contract) ----
    z.object({
      type: z.literal('hero'),
      eyebrow: z.string().optional(),
      title: z.string(),
      subtitle: z.string().optional(),
      ctaLabel: z.string().optional(),
      ctaHref: z.string().optional(),
      // Champs AJOUTÉS 2026-08-05 (landing-page.css — contrat gelé intact,
      // tous par défaut vides) : héros clair 2 colonnes de la landing.
      titleAccent: z.string().default(''),
      image: z.string().default(''),
      cta2Label: z.string().default(''),
      cta2Href: z.string().default(''),
      eyebrowIcon: z.enum(['livre', '']).default(''),
      ctaIcon: z.enum(['telechargement', '']).default(''),
    }),
    z.object({
      type: z.literal('benefits'),
      title: z.string(),
      intro: z.string().optional(),
      fond: fondClair.default('blanc'),
      // « compact » AJOUTÉ 2026-08-05 (landing-page.css §Guide Benefits) :
      // tête réduite 16/24 + liseré bleu, cartes compactes.
      headingStyle: z.enum(['titre', 'compact']).default('titre'),
      items: z.array(
        z.object({
          title: z.string(),
          description: z.string(),
          // Fidélité maquette expertise-mere.css (2026-08-05) : icône de la
          // tuile pâle au-dessus du titre (clé fermée ; vide = pas de tuile).
          // ampoule/croissance/losange AJOUTÉES 2026-08-05 (landing-page.css) ;
          // organisation/porteur/destinataire AJOUTÉES 2026-08-17 (page
          // Expertises — SVG pleins fournis, docs/design/export2/Images).
          icon: z
            .enum([
              'dossier',
              'personne',
              'groupe',
              'ampoule',
              'croissance',
              'losange',
              'organisation',
              'porteur',
              'destinataire',
              '',
            ])
            .default(''),
        }),
      ),
    }),
    z.object({
      type: z.literal('cta'),
      title: z.string(),
      body: z.string().optional(),
      ctaLabel: z.string(),
      ctaHref: z.string(),
      // Fidélité maquette produit-enfant.css (2026-08-05) : second bouton
      // CONTOUR à droite du principal ; vides = absent (contrat gelé intact).
      cta2Label: z.string().default(''),
      cta2Href: z.string().default(''),
      // « nuit » (produit-enfant.css) : panneau anthracite, contenu centré,
      // sans décor — les deux valeurs historiques sont inchangées.
      variant: z.enum(['light', 'dark', 'nuit']).default('light'),
      // Fond de la SECTION derrière le panneau (le panneau garde sa `variant`).
      fond: fondClair.default('blanc'),
    }),
    z.object({
      type: z.literal('form'),
      title: z.string(),
      intro: z.string().optional(),
      submitLabel: z.string(),
      consentText: z.string().optional(),
      // Re-skin 2026-08-04 (maquettes Figma) : « carte » = carte blanche à
      // liseré bleu (form1, campagnes) ; « panneau » = panneau beige, bouton
      // en largeur auto (form2).
      variant: z.enum(['carte', 'panneau']).default('carte'),
      // Formulaires v2 : référence un formulaire de la collection `forms`
      // (src/data/forms/<lang>/<formId>.json). Non vide → les champs,
      // submitLabel et consentText du FORMULAIRE remplacent ceux ci-dessous
      // (résolus au build par la route campagnes via le seam `enrich`; un id
      // inconnu fait échouer le build). Vide/absent → mode historique : les
      // champs inline ci-dessous, rendu inchangé.
      formId: z.string().optional(),
      // Schéma de champ PARTAGÉ avec la collection `forms` (formFieldCore,
      // défini plus haut) + règles croisées (options de select, conditions).
      fields: z.array(formFieldCore).superRefine(formFieldRules),
    }),
    z.object({
      type: z.literal('faq'),
      title: z.string(),
      fond: fondClair.default('blanc'),
      items: z.array(z.object({ question: z.string(), answer: z.string() })),
    }),
    // ---- Palette additions (17 juil., P-02) — shared like everything else.
    // Image fields are PLAIN STRING paths served as-is (uploads land in
    // public/images/sections/, saved as /images/…): these components are
    // browser-safe (no astro:assets), and "" means "no image" everywhere. ----
    z.object({
      type: z.literal('testimonial'),
      quote: z.string(),
      name: z.string(),
      role: z.string().optional(),
      organization: z.string().optional(),
      photo: z.string().optional(),
    }),
    z.object({
      type: z.literal('logo-banner'),
      title: z.string().optional(),
      badge: z.string().optional(),
      items: z.array(
        z.object({
          name: z.string(),
          logo: z.string().optional(),
          description: z.string().optional(),
        }),
      ),
    }),
    z.object({
      type: z.literal('stats'),
      title: z.string().optional(),
      fond: fondClair.default('givre'),
      items: z.array(z.object({ number: z.string(), label: z.string() })),
    }),
    z.object({
      type: z.literal('video'),
      title: z.string(),
      intro: z.string().optional(),
      // "" until the editor pastes the URL — the facade renders disabled.
      videoUrl: z.string(),
      posterImage: z.string().optional(),
      ctaLabel: z.string().optional(),
    }),
    // ---- Home sections (composable home — mirror the home-* components) ----
    z.object({
      type: z.literal('home-hero'),
      eyebrow: z.string().optional(),
      title: z.string(),
      // Fidélité maquette accueil.css (2026-08-04) : sous-chaîne du titre
      // rendue en Bleu Victrix (« vraiment ») ; vide = titre uniforme.
      titleAccent: z.string().default(''),
      subtitle: z.string(),
      ctaLabel: z.string(),
      ctaHref: z.string(),
      // Re-skin 2026-08-04 (patron maquette Accueil) — chaîne vide = absent :
      // photo de fond (chemin PUBLIC servi tel quel) + second bouton contour.
      image: z.string().default(''),
      cta2Label: z.string().default(''),
      cta2Href: z.string().default(''),
    }),
    z.object({
      type: z.literal('home-iso'),
      title: z.string(),
      subtitle: z.string(),
      // Re-skin 2026-08-04 — barre de confiance (patron Trust Bar) : items
      // {value,label} ; tableau vide = ancien rendu titre + sous-titre.
      items: z.array(z.object({ value: z.string(), label: z.string() })).default([]),
    }),
    z.object({
      type: z.literal('home-expertises'),
      sectionTitle: z.string(),
      // Re-skin 2026-08-04 — paragraphe d'appui (maquette bento : SOUS le titre).
      intro: z.string().default(''),
      learnMore: z.string(),
      // Fidélité maquette accueil.css — lien en haut à droite de la section
      // (« Voir toutes nos expertises → ») ; vides = pas de lien.
      ctaLabel: z.string().default(''),
      ctaHref: z.string().default(''),
      items: z.array(
        z.object({
          number: z.string(), // hérité (plus rendu depuis le re-skin tuiles)
          title: z.string(),
          accent: z.string(), // hérité (plus rendu — accents multicolores retirés)
          description: z.string(),
          href: z.string(),
          // Visuel de la tuile (chemin PUBLIC) ; requis pour la variante image.
          image: z.string().default(''),
          // Fidélité maquette (bento « Nos services ») : peau de la carte.
          // image = photo + voile nuit, titre 30px (sans image : placeholder
          // gris clair + « V » filigrane) ; claire = blanche bordée ;
          // bleue = aplat Bleu Victrix + « V » filigrane ; nuit = aplat navy.
          variant: z.enum(['image', 'claire', 'bleue', 'nuit']).default('claire'),
          // Libellé du lien de CETTE carte ; vide = learnMore de la section.
          linkLabel: z.string().default(''),
          // Référence bento 2026-08-11 : carte LARGE (2 colonnes sur 3) —
          // ex. Cybersécurité en tête de grille. Additif, défaut false.
          wide: z.boolean().default(false),
          // `icon` RETIRÉ 2026-08-17 (correction user : aucun pictogramme
          // dans les tuiles) — une clé résiduelle dans le JSON est ignorée.
        }),
      ),
    }),
    z.object({
      type: z.literal('home-solution'),
      eyebrow: z.string(),
      title: z.string(),
      body: z.string(),
      ctaLabel: z.string(),
      ctaHref: z.string(),
      // Resolved image when the path is real; plain string ("") otherwise.
      image: z.union([image(), z.string()]),
      // Re-skin 2026-08-04 — carte statistique flottante (ex. « 24/7 ») ;
      // chaînes vides = pas de carte.
      statValue: z.string().default(''),
      statLabel: z.string().default(''),
      statText: z.string().default(''),
      // Fidélité maquette accueil.css (« Libérez votre équipe ») : petites
      // tuiles de caractéristiques sous le corps ; tableau vide = aucune.
      features: z.array(z.object({ label: z.string(), text: z.string() })).default([]),
    }),
    // Fidélité maquette accueil.css — « Nos solutions phares » : 3 cartes
    // sombres photo + dégradé noir, icône + titre + texte + lien. Images =
    // chemins PUBLICS servis tels quels (browser-safe, règle des sections).
    z.object({
      type: z.literal('home-solutions'),
      title: z.string(),
      // Lien en haut à droite (« Voir toutes nos solutions → ») ; vides = absent.
      ctaLabel: z.string().default(''),
      ctaHref: z.string().default(''),
      items: z.array(
        z.object({
          title: z.string(),
          text: z.string(),
          image: z.string().default(''),
          href: z.string(),
          // Libellé du lien de la carte (ex. « Découvrir Ø Studio »).
          ctaLabel: z.string().default(''),
          // Icône décorative de la carte (clé fermée ; vide = aucune).
          icon: z.enum(['ecran', 'bouclier', 'nuage', '']).default(''),
        }),
      ),
    }),
    z.object({
      type: z.literal('home-partners'),
      title: z.string(),
      names: z.array(z.string()),
    }),
    z.object({
      type: z.literal('home-experts'),
      title: z.string(),
      subtitle: z.string(),
      ctaLabel: z.string(),
      ctaHref: z.string(),
    }),
    z.object({
      type: z.literal('home-latest'),
      title: z.string(),
      // Fidélité maquette accueil.css — sous-titre sous le titre de section.
      subtitle: z.string().default(''),
      // Libellé « Lire la suite » des cartes (contenu, pas i18n — composant
      // browser-safe) ; vide = ligne absente.
      readMoreLabel: z.string().default(''),
      ctaLabel: z.string(),
      ctaHref: z.string(),
    }),
    // ---- Sections « services » (P-07) — port fidèle de la page expertise IA
    // vers des sections composables GÉNÉRIQUES et réutilisables (partagées
    // comme tout le reste de la palette : disponibles sur services, landings
    // ET accueil). Règles habituelles : champs optionnels en .optional() (le
    // composant traite "" comme absent), images = chemins publics servis tels
    // quels (browser-safe, aucun astro:assets). Les champs de texte enrichi
    // (lead, intro, paragraphs) peuvent contenir des <strong> rendus set:html
    // — même politique que la page expertise d'origine (contenu de dépôt). ----
    z.object({
      type: z.literal('service-hero'),
      eyebrow: z.string().optional(),
      // Fidélité maquette produit-enfant.css (2026-08-05) : « badge » = chip
      // bleu plein au lieu du texte bleu pâle.
      eyebrowStyle: z.enum(['texte', 'badge']).default('texte'),
      // Le <h1> = surtitre accentué (bloc, optionnel) + `title`. `title` est
      // requis : cette section porte le SEUL <h1> de la page (première position).
      titleAccent: z.string().optional(),
      title: z.string(),
      // Sous-chaîne du titre rendue en bleu clair (première occurrence —
      // patron home-hero) ; vide = titre uniforme.
      titleHighlight: z.string().default(''),
      lead: z.string().optional(),
      ctaLabel: z.string().optional(),
      ctaHref: z.string().optional(),
      // Fidélité maquette expertise-mere.css (2026-08-05) : second bouton
      // « verre » translucide à droite du principal ; vides = absent.
      cta2Label: z.string().default(''),
      cta2Href: z.string().default(''),
      // « degrade » (produit-enfant.css) : voile en dégradé anthracite
      // gauche→droite au lieu du voile Bleu nuit uniforme.
      overlay: z.enum(['voile', 'degrade']).default('voile'),
      // Chemin public (ex. /images/services/…-hero.png), servi tel quel.
      // Depuis le re-skin 2026-08-05 : PHOTO DE FOND pleine largeur voilée de
      // Bleu nuit (plus une image à droite du texte).
      image: z.string().optional(),
      imageAlt: z.string().optional(),
    }),
    // ---- Sections « page expertise mère » (fidélité maquette
    // expertise-mere.css, 2026-08-05). Partagées comme toute la palette ;
    // images = chemins PUBLICS (browser-safe). ----
    // Bento des domaines d'expertise : grille 4 colonnes, cartes à peau
    // (blanche/bleue/ardoise) et taille (grande 2 col × 3 rangées, haute 1×2,
    // large 2×1, petite 1×1).
    z.object({
      type: z.literal('expertise-bento'),
      eyebrow: z.string().default(''),
      title: z.string(),
      intro: z.string().default(''),
      items: z.array(
        z.object({
          title: z.string(),
          text: z.string().default(''),
          peau: z.enum(['blanche', 'bleue', 'ardoise']).default('blanche'),
          taille: z.enum(['grande', 'haute', 'large', 'petite']).default('petite'),
          icon: z
            .enum(['fenetre', 'graphique', 'personnes', 'engrenage', 'document', 'code', ''])
            .default(''),
          image: z.string().default(''),
          href: z.string().default(''),
        }),
      ),
    }),
    // Bandeau marquee de technologies (fond Bleu nuit, défilement continu).
    z.object({
      type: z.literal('tech-marquee'),
      // Libellé d'accessibilité du bandeau (les noms défilent, aria-hidden).
      ariaLabel: z.string().default(''),
      items: z.array(z.string()),
    }),
    // Solutions exclusives : carte vedette (badge, titre, texte, lien, image)
    // + cartes outils (tuile icône, titre, texte, lien).
    z.object({
      type: z.literal('exclusive-tools'),
      title: z.string(),
      intro: z.string().default(''),
      featured: z
        .object({
          badge: z.string().default(''),
          title: z.string(),
          text: z.string().default(''),
          ctaLabel: z.string().default(''),
          href: z.string().default(''),
          image: z.string().default(''),
        })
        .optional(),
      items: z.array(
        z.object({
          title: z.string(),
          text: z.string().default(''),
          ctaLabel: z.string().default(''),
          href: z.string().default(''),
          icon: z.enum(['calendrier', 'etoile', '']).default(''),
        }),
      ),
    }),
    // ---- Sections « page produit enfant » (fidélité maquette
    // produit-enfant.css, 2026-08-05). Partagées comme toute la palette ;
    // images = chemins PUBLICS (browser-safe). ----
    // Valeur stratégique : image sur halo bleu flouté à gauche, titre à liseré
    // bleu + paragraphes + tuiles statistiques à droite.
    z.object({
      type: z.literal('strategic-value'),
      title: z.string(),
      // Chaque paragraphe rendu en <p set:html> (peut contenir des <strong> —
      // contenu de dépôt, même politique que rich-text).
      paragraphs: z.array(z.string()),
      image: z.string().default(''),
      imageAlt: z.string().default(''),
      // Tuiles statistiques (liseré gauche bleu) ; tableau vide = pas de rangée.
      stats: z.array(z.object({ value: z.string(), label: z.string() })).default([]),
      // Champs AJOUTÉS 2026-08-05 (landing-page.css §Studio Section — contrat
      // intact, tous par défaut vides) : « vitrine » = texte à gauche/image
      // encadrée blanc à droite, tuiles « verre », badge chip, puces cochées,
      // carte flottante sur l'image (rendue si cardTitle ET image).
      variant: z.enum(['produit', 'vitrine']).default('produit'),
      badge: z.string().default(''),
      bullets: z.array(z.string()).default([]),
      cardTitle: z.string().default(''),
      cardText: z.string().default(''),
    }),
    // Offres numérotées : cartes « verre » à tuile numéro bleue et liste à
    // puces icônes, bouton primaire centré sous la grille.
    z.object({
      type: z.literal('offer-cards'),
      title: z.string(),
      intro: z.string().default(''),
      ctaLabel: z.string().default(''),
      ctaHref: z.string().default(''),
      items: z.array(
        z.object({
          number: z.string(),
          title: z.string(),
          bullets: z.array(
            z.object({
              text: z.string(),
              icon: z.enum(['coche', 'document', 'cible', 'carte', '']).default('coche'),
            }),
          ),
        }),
      ),
    }),
    // Réalisations : tête titre + texte à gauche, lien à liseré bleu à droite,
    // grille de 4 cartes blanches bordées (icône, titre, texte).
    z.object({
      type: z.literal('realisations'),
      title: z.string(),
      intro: z.string().default(''),
      linkLabel: z.string().default(''),
      linkHref: z.string().default(''),
      items: z.array(
        z.object({
          title: z.string(),
          text: z.string().default(''),
          icon: z.enum(['trousse', 'casque', 'groupe', 'marteau', '']).default(''),
        }),
      ),
    }),
    z.object({
      type: z.literal('numbered-cards'),
      sectionTitle: z.string(),
      // 'plain' = titre centré simple ; 'underline' = titre + liseré vert.
      headingStyle: z.enum(['plain', 'underline']).default('plain'),
      intro: z.string().optional(),
      // Carte d'introduction en surimpression (liseré vert), optionnelle.
      leadCard: z.object({ title: z.string(), text: z.string() }).optional(),
      tone: z.enum(['default', 'tint']).default('default'),
      // Nombre de colonnes de la grille (chaîne — valeur de select CloudCannon).
      columns: z.enum(['2', '3']).default('3'),
      cardStyle: z.enum(['default', 'center']).default('default'),
      items: z.array(
        z.object({
          number: z.string(),
          title: z.string(),
          text: z.string(),
          // CTA par carte (optionnel — rendu seulement si libellé ET lien).
          ctaLabel: z.string().optional(),
          ctaHref: z.string().optional(),
        }),
      ),
    }),
    z.object({
      type: z.literal('feature-boxes'),
      sectionTitle: z.string(),
      subtitle: z.string().optional(),
      fond: fondClair.default('givre'),
      // Liste de libellés simples (boîtes bordées) — tableau de chaînes.
      boxes: z.array(z.string()),
    }),
    z.object({
      type: z.literal('tech-columns'),
      sectionTitle: z.string(),
      // Chaque groupe = une colonne (titre + liste), avec un sous-groupe
      // étiqueté optionnel (ex. « Sources ouvertes et locales : » + sa liste).
      groups: z.array(
        z.object({
          title: z.string(),
          items: z.array(z.string()),
          subgroup: z.object({ label: z.string(), items: z.array(z.string()) }).optional(),
        }),
      ),
    }),
    z.object({
      type: z.literal('callout'),
      title: z.string(),
      body: z.string().optional(),
      ctaLabel: z.string().optional(),
      ctaHref: z.string().optional(),
      // 'box' = encadré centré (fond surface) ; 'banner-green' = bandeau vert
      // large (titre/texte à gauche, bouton à droite).
      layout: z.enum(['box', 'banner-green']).default('box'),
    }),
    z.object({
      type: z.literal('rich-text'),
      title: z.string().optional(),
      fond: fondClair.default('blanc'),
      // Chaque paragraphe rendu en <p set:html> (peut contenir des <strong>).
      paragraphs: z.array(z.string()),
    }),
    z.object({
      type: z.literal('related-posts'),
      title: z.string(),
      ctaLabel: z.string().optional(),
      ctaHref: z.string().optional(),
      // Étiquettes du blogue : un article correspond s'il en partage AU MOINS
      // une. Les cartes sont résolues AU BUILD par la route (seam enrich,
      // patron EXACT de home-latest — cartes pré-résolues en données simples) ;
      // le composant reste browser-safe et affiche des cartes factices dans
      // l'éditeur visuel (données injectées absentes).
      tags: z.array(z.string()).default([]),
    }),
  ]);
}

// Editable homepage content (singleton per locale). Migrated from a nested data
// object to a `sections` array (see scripts/migrate-home-to-sections.mjs) so the
// home is composed and live-edited in CloudCannon through the shared Bookshop
// renderer, exactly like the campaign landings. Rendered by
// src/pages/[lang]/index.astro. Stored as JSON (still a "file" collection).
const home = defineCollection({
  loader: glob({ pattern: '**/*.json', base: './src/content/home' }),
  schema: ({ image }) =>
    z.object({
      sections: z.array(sectionsSchema(image)),
    }),
});

/**
 * Campaign landing pages ("campagnes") — the frozen landing section contract.
 *
 * Each entry is src/content/landing/<locale>/<slug>.md and renders at
 * /<locale>/campagnes/<slug>/ (src/pages/[lang]/campagnes/[slug].astro). The
 * page is built ONLY from `sections`; the Markdown body is ignored. Sections
 * map 1:1 onto the Bookshop components in component-library/src/components —
 * keep this schema, the components' Props, and the CloudCannon structures
 * palette (cloudcannon.config.yml) in sync.
 *
 * Gotchas:
 *  - Sections are spread verbatim into their components (no localizePath
 *    pass), so `ctaHref` values are stored as FINAL URLs — locale prefix
 *    included (e.g. "/fr/contact", not "/contact").
 *  - CloudCannon's visual editor adds an extra `_bookshop_name` key to
 *    inserted sections. Zod objects STRIP unknown keys by default — do not
 *    add .strict() here, it would fail the build mid-edit.
 *  - Optional string fields use .optional(): CloudCannon structure defaults
 *    must use empty strings (""), not blank YAML values (which parse to null
 *    and null fails .optional()). The components treat "" as absent.
 */
const landing = defineCollection({
  loader: glob({
    pattern: '**/*.md',
    base: './src/content/landing',
    // Same id trick as `blog`: "<locale>/<filename>", so the shared filename
    // pairs FR/EN translations. Landing has no per-locale `slug` frontmatter
    // (yet) — the filename IS the URL slug in both locales.
    generateId: ({ entry }) => entry.replace(/\\/g, '/').replace(/\.[^/.]+$/, ''),
  }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      description: z.string().optional(),
      // Campaign pages are UNINDEXED unless a page explicitly opts in — paid
      // traffic destinations shouldn't leak into organic search results.
      noindex: z.boolean().default(true),
      // P-04 — en-tête de campagne par page. Bloc OPTIONNEL : absent → header
      // normal du site (parité octet). Politique des modes résolue par
      // src/lib/chrome/header-config.ts (complet / allégé / personnalisé,
      // recherche opt-in hors complet — amendement 28/07). Les hrefs sont des
      // URLs FINALES, préfixe de langue inclus (même règle que ctaHref des
      // sections). Chaînes vides = absent (convention CloudCannon).
      header: z
        .object({
          mode: z.enum(['complet', 'allege', 'personnalise']).default('complet'),
          // Bornés à 5 : un menu de campagne reste court (pas de méga-menus).
          links: z.array(z.object({ label: z.string(), href: z.string() })).max(5).default([]),
          // CTA PLAT (ctaLabel/ctaHref, pas d'objet cta{label,href}) : mêmes
          // noms que les sections → hérite des _inputs CloudCannon existants
          // (« Libellé du bouton » / « Lien du bouton »). Vides = retomber sur
          // le bouton portail.
          ctaLabel: z.string().default(''),
          ctaHref: z.string().default(''),
          showAnnounce: z.boolean().default(false),
          showLangSwitch: z.boolean().default(true),
          showSearch: z.boolean().default(false),
        })
        .optional(),
      // P-04 — pied de page : « allege » = logo + barre légale seulement.
      // Champ PLAT (pas d'objet `footer.mode`) : les _inputs CloudCannon
      // cascadent par NOM DE CHAMP SEUL, et `mode` est déjà le select 3 valeurs
      // de l'en-tête — un second `mode` à 2 valeurs entrerait en collision.
      footerMode: z.enum(['complet', 'allege']).default('complet'),
      // Shared `sections` union (see sectionsSchema above) — the same palette
      // the home page uses; the campaign route (src/pages/[lang]/campagnes/
      // [slug].astro) renders it through the shared Bookshop renderer.
      sections: z.array(sectionsSchema(image)),
    }),
});

/**
 * Services — pages composables PUBLIQUES et INDEXABLES (P-07). Même contrat de
 * `sections` que `landing` (union sectionsSchema PARTAGÉE), rendues par
 * src/pages/[lang]/services/[slug].astro à travers le renderer Bookshop
 * partagé (édition visuelle live, comme les campagnes et l'accueil).
 *
 * DIFFÉRENCE DÉLIBÉRÉE avec `landing` : `noindex` par défaut à FALSE — un
 * service est une page de contenu destinée au référencement organique
 * (l'inverse exact des campagnes, trafic payant → noindex par défaut). Un
 * éditeur peut tout de même masquer un service précis (interrupteur).
 *
 * ids "<locale>/<fichier>" (même patron que blog/landing) : le nom de fichier
 * partagé apparie les traductions FR/EN et sert de slug d'URL dans les deux
 * langues. L'expertise IA a été migrée ici comme premier service via
 * scripts/migrate-expertise-to-service.mjs (machine-fidèle, rejouable).
 */
const services = defineCollection({
  loader: glob({
    pattern: '**/*.json',
    base: './src/content/services',
    generateId: ({ entry }) => entry.replace(/\\/g, '/').replace(/\.[^/.]+$/, ''),
  }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      description: z.string().optional(),
      // INDEXABLE par défaut — inverse des campagnes (décision explicite P-07).
      noindex: z.boolean().default(false),
      // Surcharge du SOUS-CHEMIN d'URL complet (branchement 2026-07-29, même
      // logique que le `slug` du blogue) : les fichiers EN gardent le chemin
      // FR (appariement par fichier homonyme) mais rendent leur URL anglaise
      // d'origine — ex. en/cybersecurite/zero-trust.json porte
      // slug: "cybersecurity/zero-trust". Absent → le chemin du fichier fait
      // l'URL. Peut contenir des « / » (services imbriqués sur 2 niveaux).
      slug: z.string().optional(),
      // <title> SEO hérité de WordPress (suffixe « | Victrix » retiré au
      // câblage — BaseLayout appose déjà le nom du site).
      seoTitle: z.string().optional(),
      sections: z.array(sectionsSchema(image)),
    }),
});

// NOTE ARCHITECTURE (2026-07-30) : l'ancienne collection `expertises` (page
// artisanale /expertises/intelligence-artificielle) a été RETIRÉE — les
// expertises sont devenues des SERVICES composables (collection `services`,
// P-07; confirmation utilisateur). L'ancienne URL est redirigée en 301 vers
// /services/intelligence-artificielle (astro.config.mjs, bloc `redirects`).

/**
 * Solutions — entrées du CATALOGUE de solutions Ø Studio (page
 * /[lang]/solutions, fidélité maquette solutions-catalogue.css 2026-08-05,
 * BASE — voir docs/design/solutions-catalogue-plan.md pour l'organisation
 * complète). Une entrée JSON par solution, ids "<locale>/<fichier>" (même
 * patron que blog/landing/services : le nom de fichier apparie FR/EN).
 *
 * PAS de pages de détail pour l'instant — `href`/`docHref` pointent vers une
 * cible existante (ex. /contact) ou restent vides (lien masqué). Les valeurs
 * de `sector` et `solutionType` sont LIBRES : la page catalogue construit ses
 * filtres à partir des valeurs distinctes rencontrées (ordre d'apparition).
 */
const solutions = defineCollection({
  loader: glob({
    pattern: '**/*.json',
    base: './src/content/solutions',
    generateId: ({ entry }) => entry.replace(/\\/g, '/').replace(/\.[^/.]+$/, ''),
  }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    // Chemin PUBLIC servi tel quel ("" = vignette de remplacement grise).
    image: z.string().default(''),
    // Chip du haut de vignette (filtre « Secteurs d'activité »).
    sector: z.string(),
    // Chip du pied de carte (filtre « Types de solution »).
    solutionType: z.string(),
    // true → l'entrée alimente le panneau vedette (bleu nuit) en tête de
    // catalogue (la première trouvée dans l'ordre `order` gagne).
    featured: z.boolean().default(false),
    // Ordre d'affichage dans la grille (croissant).
    order: z.number().default(999),
    href: z.string().default(''),
    docHref: z.string().default(''),
  }),
});

/**
 * Site chrome navigation — header menu, mega menu, announcement bar, portal
 * button. One JSON per locale in src/data/navigation (ids "fr" / "en"),
 * edited in CloudCannon (« Navigation » collection, cloudcannon.config.yml)
 * and consumed by src/components/Header.astro at build.
 *
 * Gotchas:
 *  - Hrefs are stored WITHOUT a locale prefix ("/contact", not "/fr/contact")
 *    and localized at render via localizePath() — the SAME convention as the
 *    old src/i18n/ui.ts nav, but the OPPOSITE of page sections (ctaHref),
 *    which store final URLs. The CloudCannon input comments say so.
 *  - This schema is the build gate: an invalid link fails the build naming
 *    the offending file — broken navigation can never reach the site.
 *  - `icon` is capped to the five keys drawn as inline SVGs in Header.astro
 *    (megaIcons) — adding an icon means drawing it there first.
 */
// Borne de planification : vide (aucune borne) ou date/date-heure parsable.
// Garde-fou build : une date fautive saisie au CMS casse le build avec un
// message clair plutôt que d'être ignorée en silence (schedule.ts est
// volontairement tolérant — c'est ICI que la validation vit).
const scheduleBound = z
  .string()
  .default('')
  .refine((v) => v.trim() === '' || !Number.isNaN(new Date(v).valueOf()), {
    message:
      'Date invalide — utiliser le sélecteur de date, format ISO (ex. 2026-08-01 ou 2026-08-01T09:00), ou laisser vide.',
  });

const navHref = z
  .string()
  .min(1, 'Lien requis')
  .refine(
    (v) => (v.startsWith('/') && !v.startsWith('//')) || v.startsWith('https://'),
    { message: 'Lien invalide : chemin commençant par « / » (sans « // ») ou URL https://' },
  );
// Un lien de navigation porte SOIT `href` (mode par défaut — les liens actuels
// sont inchangés), SOIT `service` (P-07, méga-menu dynamique E.3) : une
// référence à la collection `services` par son identifiant. Header.astro calcule
// alors l'URL finale (/<lang>/services/<slug>) DEPUIS la collection et FAIT
// ÉCHOUER le build si le slug n'existe pas — même philosophie de garde-fou que
// les autres liens (src/lib/navigation/service-links.ts, prouvé par test).
// "" (chaîne vide) = non renseigné, JAMAIS null (convention du dépôt). Règles
// du build-gate : href ET service vides = erreur (lien sans cible) ; href ET
// service renseignés = erreur (SOIT l'un SOIT l'autre — un lien n'a qu'une
// cible) ; quand href est seul, son format est validé sur la valeur BRUTE
// (navHref) — une espace de tête (« /contact ») se localiserait en « /fr/ /contact »
// (404) : elle DOIT échouer, préservant le garde-fou P-01.
const navLink = z
  .object({
    label: z.string().min(1, 'Libellé requis'),
    href: z.string().optional(),
    service: z.string().optional(),
  })
  .superRefine((v, ctx) => {
    // « Renseigné ? » via trim (une espace seule = non renseigné). La VALIDATION
    // du format, elle, porte sur la valeur BRUTE (plus bas) — on ne toilette pas
    // un href fautif, on le rejette.
    const rawHref = v.href ?? '';
    const rawService = v.service ?? '';
    const hrefEmpty = rawHref.trim() === '';
    const serviceEmpty = rawService.trim() === '';
    if (hrefEmpty && serviceEmpty) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['href'],
        message: 'Lien requis : renseigner « href » (ex. /contact) ou « service » (identifiant d’un service).',
      });
      return;
    }
    // SOIT href SOIT service, jamais les deux : un lien n'a qu'une cible.
    // resolveNavHref garde une précédence défensive (service > href) comme
    // filet, mais cette combinaison ne doit pas être offerte à l'auteur.
    if (!hrefEmpty && !serviceEmpty) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['service'],
        message: 'Renseigner « href » OU « service », pas les deux : un lien n’a qu’une seule cible.',
      });
      return;
    }
    // href seul : valider la valeur BRUTE (pas de trim) pour conserver le
    // message et la portée du garde-fou P-01.
    if (!hrefEmpty) {
      const r = navHref.safeParse(rawHref);
      if (!r.success) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['href'],
          message: r.error.issues[0]?.message ?? 'Lien invalide',
        });
      }
    }
  });
const navigation = defineCollection({
  loader: glob({ pattern: '*.json', base: './src/data/navigation' }),
  schema: z.object({
    items: z.array(navLink).min(1),
    portal: z.object({
      label: z.string().min(1),
      visible: z.boolean().default(true),
    }),
    // Fidélité maquette 2026-08-04 : le bouton d'action du header (« Contact »
    // en bleu) — le portail devient un lien texte. Optionnel : absent, le
    // portail reste le bouton (comportement historique).
    cta: z
      .object({
        label: z.string().min(1),
        href: navHref,
      })
      .optional(),
    mega: z.object({
      parentHref: navHref,
      // Fidélité maquette 2026-08-04 : le MÊME panneau peut s'ouvrir sous
      // PLUSIEURS entrées du menu (Expertises + Services + Produits). Parents
      // SUPPLÉMENTAIRES optionnels — le garde-fou build couvre l'ensemble.
      parentHrefs: z.array(navHref).default([]),
      ariaLabel: z.string().min(1),
      columns: z.array(
        z.object({
          title: z.string().min(1),
          href: navHref,
          // Hérité : plus rendu depuis le re-skin chrome 2026-08-04 (les têtes
          // de colonne Figma sont textuelles) — champ conservé au contrat.
          icon: z.enum(['strategy', 'cloud', 'security', 'productivity', 'managed']),
          links: z.array(navLink),
        }),
      ),
      // Re-skin chrome 2026-08-04 (Figma « Composants ») — les deux blocs sont
      // OPTIONNELS : absents, le panneau rend ses colonnes seules (JSON
      // existant valide sans changement). Hrefs SANS préfixe de langue
      // (convention navigation, localisés au rendu).
      featured: z
        .object({
          title: z.string().min(1),
          body: z.string().default(''),
          ctaLabel: z.string().min(1),
          href: navHref,
          // Chemin PUBLIC servi tel quel (ex. /images/nav/…) ; "" = pas d'image.
          image: z.string().default(''),
        })
        .optional(),
      stripe: z
        .object({
          text: z.string().min(1),
          links: z
            .array(z.object({ label: z.string().min(1), href: navHref }))
            .max(2)
            .default([]),
        })
        .optional(),
    }),
    // Méga-menu RESSOURCES (parité victrix.ca, 2026-07-29) : contrairement au
    // méga-menu services (colonnes rédigées à la main ci-dessus), celui-ci est
    // LARGEMENT GÉNÉRÉ AU BUILD par Header.astro — les catégories viennent des
    // étiquettes réelles du blogue (blogCategories, src/i18n/blog.ts) et les
    // « derniers articles » de la collection (jamais de liste d'articles à
    // maintenir à la main dans la nav). Seuls les TEXTES sont éditables ici.
    // Optionnel : son absence retire simplement le panneau (menu simple).
    megaRessources: z
      .object({
        parentHref: navHref,
        ariaLabel: z.string().min(1),
        // Texte d'introduction de la colonne de gauche + libellé du bouton
        // (le bouton pointe parentHref — le centre de ressources).
        intro: z.string(),
        ctaLabel: z.string().min(1),
        categoriesTitle: z.string().min(1),
        latestTitle: z.string().min(1),
      })
      .optional(),
    announce: z.object({
      enabled: z.boolean().default(true),
      // Fenêtre de diffusion PLANIFIÉE (2026-07-30, demande marketing) :
      // Header.astro ne rend la barre que si l'instant du BUILD est dans
      // [startAt, endAt) — src/lib/schedule.ts. "" = pas de borne. Le build
      // d'édition (STATIC_ONLY) IGNORE la fenêtre pour que l'éditeur voie et
      // modifie toujours la bannière. Un site statique n'applique la fenêtre
      // qu'à la reconstruction : rebuild quotidien planifié — voir
      // operations.md § « Publication planifiée ».
      startAt: scheduleBound,
      endAt: scheduleBound,
      before: z.string(),
      strong: z.string(),
      after: z.string(),
      linkLabel: z.string().min(1),
      linkHref: navHref,
    }),
  }),
});

/**
 * Formulaires réutilisables (« formulaires v2 ») — un JSON par formulaire dans
 * src/data/forms/<lang>/ (ids "fr/contact", "en/contact"…; même nom de
 * fichier = paire de traduction, comme partout). Une section « form » les
 * référence par `formId` (= nom du fichier sans .json).
 *
 * Ce schéma est le build-gate des définitions; côté exécution, /api/forms
 * embarque les mêmes fichiers via import.meta.glob (src/lib/forms/registry.ts)
 * et résout destinataire/sujet/champs DEPUIS le registre — le client n'envoie
 * qu'un identifiant. `toEmail` vide = repli sur FORMS_TO_EMAIL.
 */
const forms = defineCollection({
  loader: glob({
    pattern: '**/*.json',
    base: './src/data/forms',
    // "<locale>/<fichier>" (même patron que blog/landing) — l'id complet est
    // la clé du registre serveur.
    generateId: ({ entry }) => entry.replace(/\\/g, '/').replace(/\.[^/.]+$/, ''),
  }),
  schema: z.object({
    name: z.string().min(1, 'Nom interne requis'),
    toEmail: z
      .string()
      .email('Courriel destinataire invalide')
      .or(z.literal(''))
      .default(''),
    subject: z.string().default(''),
    submitLabel: z.string().min(1, 'Libellé du bouton requis'),
    consentText: z.string().default(''),
    // Schéma de champ PARTAGÉ avec la section « form » (formFieldCore) — ici
    // le libellé est exigé non vide (une définition réutilisable se doit
    // d'être complète) et le formulaire doit avoir au moins un champ.
    fields: z
      .array(formFieldCore.extend({ label: z.string().min(1, 'Libellé de champ requis') }))
      .min(1, 'Au moins un champ')
      .superRefine(formFieldRules),
  }),
});

/**
 * Pages génériques (2026-08-11) — pages composables de PREMIER NIVEAU d'URL
 * (/decouvrir, /expertises, /produits, /secteurs, /tarification,
 * /centre-de-confiance, pages légales…), rendues par la route attrape-tout
 * src/pages/[lang]/[...slug].astro. Patron EXACT de la collection `services`
 * (mêmes sections composables, même appariement fr/en par nom de fichier,
 * même surcharge `slug`), seule l'URL change : PAS de préfixe /services/.
 *
 * Créée pour remplacer les « liens morts assumés » de la nav/du footer par des
 * pages placeholder ÉDITABLES au CMS (langage officiel — plus de message 404
 * « prototype »). Les placeholders naissent noindex:true ; passer noindex à
 * false quand le vrai contenu arrive.
 */
const pages = defineCollection({
  loader: glob({
    pattern: '**/*.json',
    base: './src/content/pages',
    generateId: ({ entry }) => entry.replace(/\\/g, '/').replace(/\.[^/.]+$/, ''),
  }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      description: z.string().optional(),
      // Placeholder par défaut → masqué des moteurs (l'inverse des services) ;
      // basculer à false quand la page a son vrai contenu.
      noindex: z.boolean().default(true),
      slug: z.string().optional(),
      seoTitle: z.string().optional(),
      sections: z.array(sectionsSchema(image)),
    }),
});

/**
 * Textes du site (2026-08-11) — chaînes d'interface ÉDITABLES au CMS, un JSON
 * par langue dans src/data/site (patron de la collection navigation).
 *
 * RÈGLE DE PÉRIMÈTRE (décision user 2026-08-11) : cette collection ne contient
 * que le texte TRANSVERSAL — ce qui s'affiche sur toutes les pages sans
 * appartenir à aucune (pied de page, bandeau de consentement). Le texte propre
 * à une page s'édite AVEC sa page (collections pages/services/landing/blog…) —
 * ne pas y verser le chrome du blogue, de la recherche, du catalogue, etc.
 * Exception assumée : la page 404, qui n'a aucune entrée de collection où
 * vivre. Le bandeau promo, lui, vit déjà dans la collection `navigation`.
 *
 * Les chaînes d'ACCESSIBILITÉ (aria-labels, lien d'évitement) restent dans
 * src/i18n/ui.ts : ce n'est pas du contenu, un éditeur n'a pas à y toucher.
 */
const site = defineCollection({
  loader: glob({ pattern: '*.json', base: './src/data/site' }),
  schema: z.object({
    // Pied de page — visible sur toutes les pages (Footer.astro + le pied
    // allégé des campagnes, CampaignFooter.astro, qui n'en lit que `legal` et
    // `contactTitle`). Liens internes SANS préfixe de langue (navHref).
    footer: z.object({
      columns: z
        .array(
          z.object({
            title: z.string().min(1),
            links: z
              .array(z.object({ label: z.string().min(1), href: navHref }))
              .min(1),
          }),
        )
        .min(1),
      contactTitle: z.string().min(1),
      // Coordonnées affichées dans la colonne Contact du pied de page.
      email: z.string().email('Courriel invalide'),
      phone: z.string().min(1),
      // Numéro composable (tel:), sans espaces ni ponctuation.
      phoneHref: z.string().min(1),
      socialLabel: z.string().min(1),
      // Puce du pied de page = accès au portail client.
      contactCta: z.object({ label: z.string().min(1), href: navHref }),
      // Liens sociaux TEXTE. '#' hérité tant que les URLs réelles ne sont pas
      // fournies — d'où un z.string() simple ici (navHref refuserait '#').
      social: z.array(z.object({ label: z.string().min(1), href: z.string().min(1) })),
      legal: z.array(z.object({ label: z.string().min(1), href: navHref })),
    }),
    // Bandeau de consentement Loi 25 (P-10) — visible sur toutes les pages via
    // BaseLayout. Formulation à portée légale : éditable sans développeur.
    consent: z.object({
      text: z.string().min(1),
      policyLabel: z.string().min(1),
      policyHref: navHref,
      accept: z.string().min(1),
      refuse: z.string().min(1),
    }),
    notFound: z.object({
      metaTitle: z.string().min(1),
      metaDescription: z.string().min(1),
      eyebrow: z.string().min(1),
      title: z.string().min(1),
      text: z.string().min(1),
      requestedLabel: z.string().min(1),
      // Mêmes règles que la nav : liens internes SANS préfixe de langue
      // (la page 404 localise via localizePath).
      links: z
        .array(
          z.object({
            label: z.string().min(1),
            href: navHref,
            primary: z.boolean().default(false),
          }),
        )
        .min(1),
    }),
  }),
});

/**
 * Page Contact (2026-08-12) — contenu de la page /contact, un JSON par langue
 * dans src/data/contact (patron de la collection `site` : fichiers verrouillés,
 * éditeur de données). Migré de src/i18n/content/contact.ts pour rendre la page
 * éditable au CMS — le texte propre à une page s'édite avec sa page (règle de
 * périmètre de la collection `site`). La MISE EN PAGE reste dans le gabarit
 * src/pages/[lang]/contact.astro (les numéros de téléphone y demeurent aussi :
 * neutres de langue, décision du re-skin 2026-08-05).
 */
const contact = defineCollection({
  loader: glob({ pattern: '*.json', base: './src/data/contact' }),
  schema: z.object({
    metaTitle: z.string().min(1),
    metaDescription: z.string().min(1),
    heroEyebrow: z.string().min(1),
    heroTitle: z.string().min(1),
    heroSub: z.string().min(1),
    infoTitle: z.string().min(1),
    // Libellés de la carte Coordonnées (les numéros vivent dans le gabarit).
    infoLabels: z.object({
      montreal: z.string().min(1),
      quebec: z.string().min(1),
      paris: z.string().min(1),
      tollFree: z.string().min(1),
      email: z.string().min(1),
    }),
    // Cartes bureaux. Le gabarit apparie les téléphones PAR POSITION (Québec,
    // Montréal, Paris) — conserver cet ordre. Image = chemin PUBLIC servi tel
    // quel ("" = pas de photo), convention des sections.
    offices: z
      .array(
        z.object({
          city: z.string().min(1),
          lines: z.array(z.string().min(1)).min(1),
          image: z.string().default(''),
        }),
      )
      .min(1),
    formTitle: z.string().min(1),
    formIntro: z.string().min(1),
    formBullets: z.array(z.string().min(1)),
    reqNote: z.string().min(1),
    labels: z.object({
      firstName: z.string().min(1),
      lastName: z.string().min(1),
      email: z.string().min(1),
      phone: z.string().min(1),
      subject: z.string().min(1),
      subjectPlaceholder: z.string().min(1),
      expertise: z.string().min(1),
      expertisePlaceholder: z.string().min(1),
      request: z.string().min(1),
      message: z.string().min(1),
    }),
    subjectOptions: z.array(z.string().min(1)).min(1),
    expertiseOptions: z.array(z.string().min(1)).min(1),
    // HTML restreint ({privacy} = lien vers la politique, localisé au rendu) —
    // même politique que le consentText des formulaires (contenu de dépôt).
    consentText: z.string().min(1),
    submit: z.string().min(1),
    statusMessage: z.string().min(1),
  }),
});

/**
 * Page Carrières (2026-08-12) — contenu de la page /carrieres, un JSON par
 * langue dans src/data/carrieres (même patron que `contact`). Migré de
 * src/i18n/content/carrieres.ts. Les icônes restent des CLÉS FERMÉES rendues
 * en SVG par le gabarit (jamais de markup dans le contenu) — un choix hors
 * liste casse le build avec un message clair. Les photos de section (héros,
 * équipe, responsabilité sociale) restent dans le gabarit (re-skin à venir
 * avec les visuels authentiques) ; seuls les portraits des témoignages sont
 * du contenu.
 */
const carrieres = defineCollection({
  loader: glob({ pattern: '*.json', base: './src/data/carrieres' }),
  schema: z.object({
    metaTitle: z.string().min(1),
    metaDescription: z.string().min(1),
    hero: z.object({
      title: z.string().min(1),
      sub: z.string().min(1),
      ctaLabel: z.string().min(1),
    }),
    happy: z.object({
      title: z.string().min(1),
      lead: z.string().min(1),
      quote: z.string().min(1),
    }),
    values: z.object({
      eyebrow: z.string().min(1),
      title: z.string().min(1),
      items: z
        .array(
          z.object({
            icon: z.enum(['etoile', 'groupe', 'ampoule', 'poignee', 'insigne']),
            label: z.string().min(1),
          }),
        )
        .min(1),
    }),
    join: z.object({
      title: z.string().min(1),
      lead: z.string().min(1),
      cardTitle: z.string().min(1),
      cardText: z.string().min(1),
      features: z
        .array(
          z.object({
            icon: z.enum(['croissance', 'progression', 'coeur', 'formation']),
            title: z.string().min(1),
            text: z.string().min(1),
          }),
        )
        .min(1),
    }),
    // `cards` (pas `items`) : la carte _inputs de CloudCannon est PLATE par nom
    // de champ — un second `items` de forme différente (values.items) entrerait
    // en collision. Nom distinct = configuration d'éditeur sans ambiguïté.
    testimonials: z.object({
      title: z.string().min(1),
      cards: z
        .array(
          z.object({
            image: z.string().default(''),
            quote: z.string().min(1),
            name: z.string().min(1),
            role: z.string().min(1),
          }),
        )
        .min(1),
    }),
    social: z.object({
      title: z.string().min(1),
      lead: z.string().min(1),
      engagementTitle: z.string().min(1),
      engagementText: z.string().min(1),
      // Pastilles texte (placeholders de la maquette) en attendant les logos
      // réels des partenaires académiques.
      partners: z.array(z.string().min(1)),
    }),
    cta: z.object({
      title: z.string().min(1),
      text: z.string().min(1),
      label: z.string().min(1),
    }),
  }),
});

/**
 * Pages système (2026-08-12) — textes des trois pages « outils » qui n'ont pas
 * de collection de contenu où vivre : l'index du blogue (/ressources), la
 * recherche (/recherche) et la confirmation d'envoi (/merci). Un JSON par
 * langue dans src/data/pages-systeme, un BLOC par page (le pendant de la
 * collection `site`, qui elle ne porte que le transversal — règle de
 * périmètre). Les chaînes d'accessibilité et l'interface Pagefind restent dans
 * src/i18n/ui.ts (interface, pas contenu).
 *
 * Le bloc `ressources` alimente aussi le fil d'Ariane des articles et le titre
 * du flux RSS (le nom public de la section « Ressources » n'est défini qu'ici).
 */
const pagesSysteme = defineCollection({
  loader: glob({ pattern: '*.json', base: './src/data/pages-systeme' }),
  schema: z.object({
    ressources: z.object({
      eyebrow: z.string().min(1),
      title: z.string().min(1),
      intro: z.string().min(1),
      filterAll: z.string().min(1),
    }),
    recherche: z.object({
      metaTitle: z.string().min(1),
      metaDescription: z.string().min(1),
      eyebrow: z.string().min(1),
      title: z.string().min(1),
      intro: z.string().min(1),
      noscript: z.string().min(1),
    }),
    merci: z.object({
      metaTitle: z.string().min(1),
      metaDescription: z.string().min(1),
      title: z.string().min(1),
      text: z.string().min(1),
      // Mêmes règles que la 404 : liens internes SANS préfixe de langue.
      links: z
        .array(
          z.object({
            label: z.string().min(1),
            href: navHref,
            primary: z.boolean().default(false),
          }),
        )
        .min(1),
    }),
  }),
});

export const collections = {
  blog,
  home,
  landing,
  services,
  solutions,
  navigation,
  forms,
  pages,
  site,
  contact,
  carrieres,
  pagesSysteme,
};
