import { defineCollection as astroDefineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';
import { sanitizeRichHtml } from '../component-library/src/shared/rich';
import { FOND_KEYS, FOND_KEYS_ETENDUS, FOND_KEYS_LEGACY } from '../component-library/src/shared/fonds';
import { ICON_KEYS, LEGACY_ICON_KEYS } from '../component-library/src/shared/icons';
import { CONTACT_SERVICE_KEYS, CONTACT_SUJET_KEYS } from './lib/contact/presets';

/**
 * Tolérance aux champs VIDÉS dans CloudCannon (incident du 14 sept. 2026).
 *
 * Quand un éditeur efface un champ texte, CloudCannon enregistre `null` — pas
 * `""`. Tous nos schémas déclarent `z.string()` / `.optional()` / `.default()`
 * qui refusent `null` → `InvalidContentEntryDataError`, et le premier fichier
 * touché fait tomber TOUT le build de l'hébergeur (18 champs / 9 fichiers le
 * 14 sept., 26 / 13 le 15). Les composants traitent déjà `""` comme « absent »,
 * donc `null → ""` est la conversion sûre — appliquée EN UN SEUL ENDROIT, avant
 * validation, à toutes les collections : on remplace `defineCollection` par
 * une version qui pré-traite les données (fonction-schéma `({ image }) => …`
 * ou objet-schéma, les deux formes du fichier). Les seuls champs non-texte
 * (interrupteurs, nombres, dates) ne reçoivent jamais `null` du CMS — les
 * switches écrivent `false`, le seul `z.number()` (solutions.order) a son
 * propre repli ci-dessous. Ceinture et bretelles côté CMS :
 * `empty_type: string` sur les entrées texte de cloudcannon.config.yml.
 */
/**
 * QUAND GARDER `.min(1)` — la règle, tranchée par le lot L01 (2026-09-22).
 *
 * `nullsToEmpty` ci-dessus règle le `null` du CMS ; il ne règle PAS le champ
 * vidé qu'un `.min(1)` refuse ensuite. C'est la récidive du 18 sept. 2026 :
 * `merci.metaDescription`, vidée dans l'éditeur, a mis `staging` au rouge
 * pendant 20 sauvegardes d'affilée — plus rien de ce que Julie enregistrait
 * n'était publié, pour une méta description. Un `.min(1)` sur un champ éditable
 * est un build rouge en attente ; il ne se justifie que si le vide casse
 * VRAIMENT la page.
 *
 * `.min(1)` GARDÉ seulement quand le champ vide produirait un élément SANS NOM
 * ACCESSIBLE ou SANS DESTINATION :
 *  1. les destinations (`href`, `navHref`, `phoneHref`) ;
 *  2. les intitulés de commandes — liens, boutons, entrées de menu, options de
 *     liste blanche — y compris ceux qui n'en ont pas l'air : `footer.phone`
 *     est le TEXTE du lien `tel:`, `ressources.searchPlaceholder` et
 *     `newsletter.emailPlaceholder` sont rendus en `sr-only` et servent de
 *     LIBELLÉ à leur champ de saisie, `ressources.eyebrow` est le nom du fil
 *     d'Ariane des articles, `contact.consentText` est le libellé de la case
 *     de consentement (obligatoire) ;
 *  3. les `aria-label` — dont `footer.columns[].title` et `footer.contactTitle`,
 *     qui nomment chacun un repère `<nav>` en plus d'être un `<h2>` ;
 *  4. le titre visible de la page (son `<h1>`) et son `<title>` (`metaTitle`) ;
 *  5. `contact.labels.*` : le `name` HTML du champ en est DÉRIVÉ
 *     (src/lib/forms/field-name.ts) et deux garde-fous de build comparent la
 *     page à la définition du formulaire — vidé, le champ casse le build de
 *     toute façon, mais avec un message qui dit quoi réaligner ;
 *  6. `annonces.title` : l'identifiant de la bannière dans la LISTE du CMS.
 *     Vide, l'éditrice ne sait plus laquelle elle modifie.
 *
 * Tout le reste — méta descriptions, surtitres, chapeaux, corps de texte,
 * intitulés de colonne décoratifs, textes de substitution, confirmations —
 * prend `.default('')`, et le gabarit fait le repli : soit il n'affiche pas
 * l'élément (`{valeur && …}`, pour un titre ou un bloc décoré, sinon le vide
 * laisse un trou), soit il rend une chaîne vide, ce qui ne produit rien.
 *
 * Les `.min(1)` de TABLEAU (« au moins un élément ») restent : supprimer toutes
 * les lignes d'une liste est un autre geste que vider un champ, et une liste
 * entièrement vide est en général une vraie panne (un menu, un pied de page,
 * les sorties de la 404). Les tableaux de texte LIBRE (`formBullets`,
 * `offices[].lines`) acceptent en revanche un élément vide : le rendu le filtre.
 *
 * Le test `src/content.config.champs-vides.test.ts` vide tour à tour CHAQUE
 * chaîne de src/data et src/content/pages et échoue en nommant le champ ; la
 * liste des champs structurels y est explicite, et c'est la même que celle-ci.
 */
function nullsToEmpty(value: unknown): unknown {
  if (value === null) return '';
  // Texte enrichi (Phase 1, 2026-09-16) : toute chaîne portant du HTML passe le
  // filtre liste-blanche AU BUILD (component-library/src/shared/rich.ts) —
  // un collage depuis Word ou une balise inconnue ne peut pas casser la page.
  if (typeof value === 'string') return value.indexOf('<') === -1 ? value : sanitizeRichHtml(value);
  if (Array.isArray(value)) return value.map(nullsToEmpty);
  // Objets SIMPLES seulement : le frontmatter Markdown arrive avec de vrais
  // `Date` (champ `date:` des articles) qu'il ne faut surtout pas aplatir.
  if (typeof value === 'object' && Object.getPrototypeOf(value) === Object.prototype) {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>).map(([k, v]) => [k, nullsToEmpty(v)]),
    );
  }
  return value;
}

/**
 * LISTES FERMÉES VIDÉES AU CMS (2026-09-22, lot L-selects) — la même panne par
 * l'autre porte.
 *
 * `nullsToEmpty` règle le `null`, la règle « QUAND GARDER `.min(1)` » règle le
 * texte vidé ; restait la TROISIÈME porte : un `select` effacé dans CloudCannon
 * écrit `''`, et un `z.enum([...]).default('ivoire')` REFUSE `''` — build rouge
 * identique à l'incident du 18 sept., pour un menu déroulant remis à blanc.
 * Huit sélecteurs de section (`callout.layout`, `cta.variant`, `form.variant`,
 * les quatre de `numbered-cards`, `timeline.tone`) et cinq champs hors sections
 * étaient atteignables : leur `allow_empty` du CMS vaut `true` (absent = true).
 * Les 38 autres sont bornés par `allow_empty: false` côté CloudCannon — une
 * garde d'interface, du même genre que `empty_type: string` qui n'avait pas
 * suffi le 18/09 : le schéma ne doit pas en dépendre.
 *
 * L'ARBITRAGE, tranché par Gabriel : `.catch('<défaut>')` réparerait le vide en
 * une ligne par champ, mais avalerait AUSSI une clé mal orthographiée
 * (`fond: "beig"` deviendrait silencieusement le défaut, et personne ne verrait
 * jamais que la section n'a pas le fond demandé). On ne veut que la moitié du
 * comportement : VIDE → le défaut ; INCONNU → toujours refusé, bruyamment.
 *
 * D'où cette normalisation, guidée par le schéma lui-même et posée EN UN SEUL
 * ENDROIT comme `nullsToEmpty` : avant validation, on descend le schéma et la
 * donnée EN PARALLÈLE et on EFFACE la clé dont la valeur est `''` quand son
 * schéma est une liste fermée qui n'accepte pas `''` et qu'un `.default(…)` (ou
 * `.optional()`) peut absorber l'absence. Zod applique alors le défaut du champ
 * — celui qui est écrit à côté, jamais un défaut inventé ici. Deux propriétés
 * qui en découlent, et que le test `content.config.listes-fermees.test.ts`
 * vérifie dans les deux sens :
 *  - aucune liste à déclarer ici : elle est LUE dans le schéma, donc un `z.enum`
 *    ajouté demain est couvert le jour même, sans rien à penser ;
 *  - les listes où `''` est une valeur LÉGITIME (`fondClairOuVide` = « défaut
 *    historique du bloc », `pictogramme` = « aucune icône ») ne sont pas
 *    touchées : `''` y est dans la liste, donc jamais effacé.
 */
type DefZod = {
  typeName?: string;
  innerType?: z.ZodTypeAny;
  schema?: z.ZodTypeAny;
  type?: z.ZodTypeAny;
  shape?: () => Record<string, z.ZodTypeAny>;
  values?: readonly string[];
  discriminator?: string;
  optionsMap?: Map<unknown, z.ZodTypeAny>;
};
const defDe = (schema: z.ZodTypeAny | undefined): DefZod =>
  ((schema as unknown as { _def?: DefZod } | undefined)?._def ?? {}) as DefZod;

const estObjetSimple = (valeur: unknown): valeur is Record<string, unknown> =>
  typeof valeur === 'object' &&
  valeur !== null &&
  Object.getPrototypeOf(valeur) === Object.prototype;

/**
 * `true` si effacer la clé vaut mieux que laisser `''` : liste fermée SANS `''`
 * parmi ses valeurs, sous une enveloppe (`.default()` / `.optional()`) capable
 * d'absorber l'absence. Sinon on ne touche à rien — une liste fermée SANS repli
 * doit continuer à échouer, avec son message d'origine.
 */
function videEffacable(schema: z.ZodTypeAny): boolean {
  let courant: z.ZodTypeAny | undefined = schema;
  let absorbe = false;
  for (;;) {
    const def = defDe(courant);
    if (def.typeName === 'ZodDefault' || def.typeName === 'ZodOptional') {
      absorbe = true;
      courant = def.innerType;
    } else if (def.typeName === 'ZodNullable') courant = def.innerType;
    else if (def.typeName === 'ZodEffects') courant = def.schema;
    else break;
    if (!courant) return false;
  }
  const def = defDe(courant);
  return absorbe && def.typeName === 'ZodEnum' && !(def.values ?? []).includes('');
}

/** Descend schéma et donnée en parallèle ; renvoie une COPIE nettoyée. */
function videsVersDefauts(schema: z.ZodTypeAny | undefined, valeur: unknown): unknown {
  const def = defDe(schema);
  switch (def.typeName) {
    case 'ZodDefault':
    case 'ZodOptional':
    case 'ZodNullable':
      return videsVersDefauts(def.innerType, valeur);
    case 'ZodEffects':
      return videsVersDefauts(def.schema, valeur);
    case 'ZodArray':
      return Array.isArray(valeur)
        ? valeur.map((element) => videsVersDefauts(def.type, element))
        : valeur;
    case 'ZodDiscriminatedUnion': {
      if (!estObjetSimple(valeur)) return valeur;
      // Sections : le discriminant (`type`) désigne le seul membre à descendre.
      const option = def.optionsMap?.get(valeur[def.discriminator as string]);
      return option ? videsVersDefauts(option, valeur) : valeur;
    }
    case 'ZodObject': {
      if (!estObjetSimple(valeur)) return valeur;
      const shape = def.shape?.() ?? {};
      const sortie: Record<string, unknown> = { ...valeur };
      for (const [cle, sousSchema] of Object.entries(shape)) {
        if (!(cle in sortie)) continue;
        if (sortie[cle] === '' && videEffacable(sousSchema)) delete sortie[cle];
        else sortie[cle] = videsVersDefauts(sousSchema, sortie[cle]);
      }
      return sortie;
    }
    default:
      // Unions non discriminées (`z.union([image(), z.string()])`) : on ne
      // devine pas quel membre s'applique — la donnée passe telle quelle.
      return valeur;
  }
}

type CollectionConfig = Parameters<typeof astroDefineCollection>[0];
const defineCollection = ((config: CollectionConfig) => {
  const { schema } = config;
  /** Les deux tolérances, dans l'ordre : `null` → `''`, puis `''` → le défaut. */
  const tolerer = (resolu: z.ZodTypeAny) =>
    z.preprocess((brut) => videsVersDefauts(resolu, nullsToEmpty(brut)), resolu);
  const tolerant =
    typeof schema === 'function'
      ? (ctx: Parameters<typeof schema>[0]) => tolerer(schema(ctx))
      : schema
        ? tolerer(schema)
        : schema;
  return astroDefineCollection({ ...config, schema: tolerant } as CollectionConfig);
}) as typeof astroDefineCollection;

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
  // Défaut AJOUTÉ 2026-09-22 (L-selects) : ce select est vidable dans CloudCannon
  // (`allow_empty` absent = true) et, sans repli, un champ remis à blanc
  // mettait le build au rouge. « text » est le type le plus inoffensif — le
  // champ reste saisissable, son `name` HTML vient de son LIBELLÉ (inchangé)
  // et les deux garde-fous de build continuent de comparer page et définition.
  type: z.enum(FORM_FIELD_TYPES).default('text'),
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
  // feature-boxes, rich-text ; ÉTENDU le jour même à strategic-value,
  // offer-cards, realisations — lavis chauds de produit-child.css) ; le
  // DÉFAUT de chaque bloc = son rendu historique (blanc ou givre) — zéro
  // churn visuel sur l'existant. Palette ÉTENDUE à 10 fonds le 2026-09-17 —
  // source unique component-library/src/shared/fonds.ts (clés, classes,
  // pastilles) ; « sable » ré-accordé, gris/bleus/« pierre » ajoutés.
  // FOND_KEYS_LEGACY : clés RETIRÉES de la palette mais encore acceptées —
  // une sauvegarde CloudCannon peut porter l'ancienne valeur (c'est arrivé
  // le 2026-09-22, 4 h après la fusion des deux bleus). Elles ne sont plus
  // offertes au sélecteur ; `fondCanonique` les résout au rendu.
  const fondClair = z.enum([...FOND_KEYS, ...FOND_KEYS_LEGACY]);
  // Variante « '' = défaut historique du bloc » (form, faq) — même liste.
  const fondClairOuVide = z.enum(['', ...FOND_KEYS, ...FOND_KEYS_LEGACY]);
  // Palette ÉTENDUE (2026-09-21, demande Gabriel) : les 10 fonds clairs + les
  // fonds SOMBRES (« bleu électrique » = l'aplat Bleu Victrix). Réservée aux
  // sections qui INVERSENT leurs textes sur fond sombre — rich-text, callout,
  // stats, logo-banner, faq ; les autres gardent `fondClair`, sinon l'éditrice
  // pourrait produire du texte marine sur aplat bleu. Même liste que
  // `_select_data.fonds_etendus` (garde-fou : npm run cms:previews:check).
  const fondEtendu = z.enum([...FOND_KEYS_ETENDUS, ...FOND_KEYS_LEGACY]);
  // Pictogramme de la BANQUE partagée (2026-09-18) — source unique
  // component-library/src/shared/icons.ts : toutes les sections à icône
  // acceptent toutes les clés ('' = aucune). Les anciennes listes fermées
  // par section ont été fusionnées (scripts/migrate-icons-bank.mjs).
  // LEGACY_ICON_KEYS : anciennes clés tolérées (sauvegarde CloudCannon d'une
  // branche pas encore migrée) — résolues au rendu par iconFor.
  const pictogramme = z.enum(['', ...ICON_KEYS, ...LEGACY_ICON_KEYS]);
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
      // « Fond de section » ÉTENDU 2026-08-18 (landing-pagefinal.txt : héros
      // IVOIRE) ; défaut « givre » = rendu historique (surface-container-low).
      fond: fondClair.default('beige'),
    }),
    z.object({
      type: z.literal('benefits'),
      title: z.string(),
      intro: z.string().optional(),
      fond: fondEtendu.default('ivoire'),
      // « compact » AJOUTÉ 2026-08-05 (landing-page.css §Guide Benefits) :
      // tête réduite 16/24 + liseré bleu, cartes compactes.
      headingStyle: z.enum(['titre', 'compact']).default('titre'),
      // Compteur « 01 / 02 / 03 » de la maquette Approche (refonte 2026-09-18)
      // — vrai par défaut, décoché sur les grilles d'inventaire (Secteurs).
      numerotation: z.boolean().default(true),
      items: z.array(
        z.object({
          title: z.string(),
          description: z.string(),
          // Pictogramme au-dessus du titre (clé fermée ; vide = aucun). Depuis
          // la refonte du 2026-09-18 il est posé NU, en bleu, à sa taille
          // propre — la tuile bleu pâle ne subsiste que sur le style compact.
          // ampoule/croissance/losange AJOUTÉES 2026-08-05 (landing-page.css) ;
          // organisation/porteur/destinataire AJOUTÉES 2026-08-17 (page
          // Expertises — SVG pleins fournis, docs/design/export2/Images).
          icon: pictogramme.default(''),
          // LOGO de marque (2026-09-22) — pour ce que la banque de
          // pictogrammes ne peut pas dire. Gagne sur `icon`.
          image: z.string().default(''),
          imageAlt: z.string().default(''),
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
      // « primaire » (2026-09-17, ex-CTA final de la page Carrières) : aplat
      // Bleu Victrix PLEINE LARGEUR, contenu centré, bouton blanc en
      // majuscules — `fond` sans effet dans cette variante.
      variant: z.enum(['light', 'dark', 'nuit', 'primaire']).default('light'),
      // Fond de la SECTION derrière le panneau (le panneau garde sa `variant`).
      fond: fondClair.default('ivoire'),
    }),
    // « Renvoi vers le contact (qualification) » — 2026-09-21. Un SEUL
    // formulaire de demande sur le site : cette section pose la question de
    // qualification (tranche d'effectif) et renvoie vers /contact déjà
    // rempli. Les tranches ne sont PAS dans le contenu — elles voyagent dans
    // l'URL et viennent de shared/tailles-entreprise.ts.
    z.object({
      type: z.literal('contact-qualifier'),
      title: z.string(),
      intro: z.string().default(''),
      question: z.string(),
      // URL FINALE, préfixe de langue inclus : elle fixe aussi la langue des
      // tranches affichées.
      contactHref: z.string(),
      note: z.string().default(''),
      fond: fondClair.default('beige'),
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
      // « Fond de section » ÉTENDU 2026-08-18 (landing-pagefinal.txt : bande
      // SABLE derrière la carte). '' = défaut historique du bloc (givre en
      // carte, blanc en panneau) — le défaut dépend de la variante, d'où la
      // clé vide (patron strategic-value).
      fond: fondClairOuVide.default(''),
      // Schéma de champ PARTAGÉ avec la collection `forms` (formFieldCore,
      // défini plus haut) + règles croisées (options de select, conditions).
      fields: z.array(formFieldCore).superRefine(formFieldRules),
    }),
    z.object({
      type: z.literal('faq'),
      title: z.string(),
      fond: fondEtendu.default('ivoire'),
      items: z.array(z.object({ question: z.string(), answer: z.string() })),
    }),
    // ---- Palette additions (17 juil., P-02) — shared like everything else.
    // Image fields are PLAIN STRING paths served as-is (uploads land in
    // public/images/sections/, saved as /images/…): these components are
    // browser-safe (no astro:assets), and "" means "no image" everywhere. ----
    z.object({
      type: z.literal('testimonial'),
      fond: fondClair.default('beige'),
      quote: z.string(),
      name: z.string(),
      role: z.string().optional(),
      organization: z.string().optional(),
      photo: z.string().optional(),
    }),
    z.object({
      type: z.literal('logo-banner'),
      fond: fondEtendu.default('ivoire'),
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
      // « carte » (2026-09-16) : carte centrée qui chevauche le héros, 3 chiffres
      // avec pictogramme (parité WordPress, page Services gérés). Défaut = bande.
      style: z.enum(['bande', 'carte']).default('bande'),
      fond: fondEtendu.default('beige'),
      items: z.array(
        z.object({
          number: z.string(),
          label: z.string(),
          icon: pictogramme.default(''),
        }),
      ),
    }),
    z.object({
      type: z.literal('video'),
      fond: fondClair.default('ivoire'),
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
      fond: fondClair.default('blanc'),
      title: z.string(),
      subtitle: z.string(),
      // LOGO de la bande (2026-09-23) — chemin public servi tel quel (le logo
      // ISO). Vide = aucun logo. `imageAlt` vide = décoratif : le bon réglage
      // quand les items disent déjà « ISO 27001 » / « ISO 9001 ».
      image: z.string().default(''),
      imageAlt: z.string().default(''),
      // Re-skin 2026-08-04 — barre de confiance (patron Trust Bar) : items
      // {value,label} ; tableau vide = ancien rendu titre + sous-titre.
      // `icon` (2026-09-23) : clé de la banque partagée ; vide = la coche
      // d'origine, donc les bandes déjà posées ne changent pas d'aspect.
      items: z
        .array(z.object({ value: z.string(), label: z.string(), icon: pictogramme.default('') }))
        .default([]),
    }),
    z.object({
      type: z.literal('home-expertises'),
      fond: fondClair.default('ivoire'),
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
      fond: fondClair.default('beige'),
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
      fond: fondClair.default('ivoire'),
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
          icon: pictogramme.default(''),
        }),
      ),
    }),
    z.object({
      type: z.literal('home-partners'),
      fond: fondClair.default('ivoire'),
      title: z.string(),
      names: z.array(z.string()),
    }),
    z.object({
      type: z.literal('home-experts'),
      fond: fondEtendu.default('sable'),
      title: z.string(),
      subtitle: z.string(),
      ctaLabel: z.string(),
      ctaHref: z.string(),
    }),
    z.object({
      type: z.literal('home-latest'),
      fond: fondClair.default('ivoire'),
      title: z.string(),
      // Fidélité maquette accueil.css — sous-titre sous le titre de section.
      subtitle: z.string().default(''),
      // Libellé « Lire la suite » des cartes (contenu, pas i18n — composant
      // browser-safe) ; vide = ligne absente.
      readMoreLabel: z.string().default(''),
      ctaLabel: z.string(),
      ctaHref: z.string(),
      // ARTICLES EN VEDETTE (2026-09-23, demande du marketing pour la démo).
      // Vide = les 3 articles les PLUS RÉCENTS, comportement historique.
      // Renseigné = ces articles-là, DANS CET ORDRE.
      //
      // La valeur est le NOM DE FICHIER de l'article sans extension
      // (« certification-iso-27001-iso-9001 »), et non son slug publié : le nom
      // de fichier est l'identifiant qui APPARIE FR et EN (mécanisme
      // `postUrlSlug`, cf. le schéma `blog`), donc UNE seule liste suffit pour
      // les deux langues et elle ne casse pas quand Julie retouche un slug.
      //
      // Ce n'est volontairement PAS une liste fermée au sens de la règle 5 du
      // CLAUDE.md : les articles sont du contenu vivant, une liste `_select_data`
      // devrait être régénérée à chaque publication. Le filet est ailleurs —
      // `src/pages/[lang]/index.astro` ignore un identifiant inconnu et le
      // SIGNALE au build, plutôt que de faire échouer la construction sur une
      // faute de frappe faite au CMS.
      vedettes: z.array(z.string()).default([]),
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
      // « blanc » AJOUTÉ 2026-08-17 (expertisesparent.css §HeroSection —
      // retour user) : héros CLAIR — double dégradé blanc + beige sur la
      // photo, titre foncé, accent bleu-500, bouton 2 « verre » clair.
      overlay: z.enum(['voile', 'degrade', 'blanc']).default('voile'),
      // Chemin public (ex. /images/services/…-hero.png), servi tel quel.
      // Depuis le re-skin 2026-08-05 : PHOTO DE FOND pleine largeur voilée de
      // Bleu nuit (plus une image à droite du texte).
      image: z.string().optional(),
      imageAlt: z.string().optional(),
      // Point focal du recadrage object-cover (2026-08-25) : le héros fait
      // 600 px de haut — sur écran large, cover rogne le haut et le bas de la
      // photo. « haut » garde les visages d'une photo de groupe (réglage
      // 50 % 25 %, même valeur que le héros Carrières) ; « centre » = défaut
      // (comportement historique de toutes les pages existantes).
      imagePosition: z.enum(['centre', 'haut', 'bas']).default('centre'),
    }),
    // ---- Sections « catalogue produit » (fidélité maquette docs/produits.css
    // « Studio de création Power Platform et Dynamics 365 », 2026-08-24) —
    // recette des pages ENFANTS produits/services (patron copilot-studio).
    // Règles habituelles : images = chemins PUBLICS (browser-safe), textes
    // enrichis rendus set:html, fonds bornés à la palette officielle. ----
    // Héros catalogue : héros CLAIR deux colonnes — pastille-badge, très grand
    // titre à accent bleu, lead, boutons pilules ; photo inclinée sur halo
    // bleu à droite. Rend le SEUL <h1> (première position, jamais cumulé avec
    // service-hero).
    z.object({
      type: z.literal('product-hero'),
      badge: z.string().default(''),
      title: z.string(),
      // Sous-chaîne du titre rendue en bleu (première occurrence — patron
      // home-hero/service-hero) ; vide = titre uniforme.
      titleHighlight: z.string().default(''),
      lead: z.string().default(''),
      ctaLabel: z.string().default(''),
      ctaHref: z.string().default(''),
      cta2Label: z.string().default(''),
      cta2Href: z.string().default(''),
      image: z.string().default(''),
      imageAlt: z.string().default(''),
      fond: fondClair.default('beige'),
    }),
    // Bento métriques : tête centrée + carte Bleu nuit (titre, texte,
    // puces-métriques « verre », pictogramme filigrane) + carte claire (tuile
    // icône, titre, texte, lien). `watermark`/`icon` : clés DISTINCTES à
    // dessein (un même nom partagerait sa config _inputs CloudCannon — les
    // chemins imbriqués n'y sont pas supportés, gotcha 2026-07-20).
    z.object({
      type: z.literal('bento-metrics'),
      title: z.string(),
      intro: z.string().default(''),
      fond: fondClair.default('ivoire'),
      featured: z.object({
        title: z.string(),
        text: z.string().default(''),
        watermark: pictogramme.default(''),
        // Mêmes tuiles {value,label} que strategic-value (_structures.stat_tiles).
        stats: z.array(z.object({ value: z.string(), label: z.string() })).default([]),
      }),
      aside: z
        .object({
          icon: pictogramme.default(''),
          // LOGO de la carte latérale (2026-09-22) — cas d'usage d'origine :
          // l'insigne HappyIndex® AtWork sur Découvrir, qui ne pouvait pas
          // s'afficher faute de champ et retombait sur une coche générique.
          image: z.string().default(''),
          imageAlt: z.string().default(''),
          title: z.string(),
          text: z.string().default(''),
          linkLabel: z.string().default(''),
          linkHref: z.string().default(''),
        })
        .optional(),
    }),
    // ---- Sections « page expertise mère » (fidélité maquette
    // expertise-mere.css, 2026-08-05). Partagées comme toute la palette ;
    // images = chemins PUBLICS (browser-safe). ----
    // Bento des domaines d'expertise : grille 4 colonnes, cartes à peau
    // (blanche/bleue/ardoise) et taille (grande 2 col × 3 rangées, haute 1×2,
    // large 2×1, petite 1×1).
    z.object({
      type: z.literal('expertise-bento'),
      fond: fondClair.default('ivoire'),
      eyebrow: z.string().default(''),
      title: z.string(),
      intro: z.string().default(''),
      items: z.array(
        z.object({
          title: z.string(),
          text: z.string().default(''),
          peau: z.enum(['blanche', 'bleue', 'ardoise']).default('blanche'),
          taille: z.enum(['grande', 'haute', 'large', 'petite']).default('petite'),
          icon: pictogramme.default(''),
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
      fond: fondClair.default('beige'),
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
          icon: pictogramme.default(''),
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
      // « Fond de section » ÉTENDU 2026-08-17 (produit-child.css : lavis
      // chauds). '' = défaut historique du bloc (blanc, ou gris perle en
      // variante vitrine) — le défaut dépend de la variante, d'où la clé vide.
      fond: fondClairOuVide.default(''),
    }),
    // Offres numérotées : cartes « verre » à tuile numéro bleue et liste à
    // puces icônes, bouton primaire centré sous la grille.
    z.object({
      type: z.literal('offer-cards'),
      title: z.string(),
      intro: z.string().default(''),
      fond: fondClair.default('beige'),
      ctaLabel: z.string().default(''),
      ctaHref: z.string().default(''),
      items: z.array(
        z.object({
          number: z.string(),
          title: z.string(),
          bullets: z.array(
            z.object({
              text: z.string(),
              icon: pictogramme.default('coche'),
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
      fond: fondClair.default('ivoire'),
      linkLabel: z.string().default(''),
      linkHref: z.string().default(''),
      items: z.array(
        z.object({
          title: z.string(),
          text: z.string().default(''),
          icon: pictogramme.default(''),
        }),
      ),
    }),
    // Galerie d'images (2026-09-23, lot L10 — catalogue Ø Studio) : grille de
    // visuels que le visiteur agrandit d'un clic. Première section à accepter
    // une LISTE d'images libre ; l'agrandissement se fait par ancres `:target`,
    // sans script (les composants Bookshop sont browser-safe). Tous les champs
    // sauf la liste sont optionnels : une galerie fraîchement posée au CMS ne
    // casse rien, elle ne rend rien.
    z.object({
      type: z.literal('galerie'),
      title: z.string().default(''),
      intro: z.string().default(''),
      fond: fondClair.default('ivoire'),
      // Colonnes sur grand écran ; chaîne, parce que c'est une valeur de
      // select CloudCannon (comme numbered-cards.columns).
      colonnes: z.enum(['2', '3', '4']).default('3'),
      images: z
        .array(
          z.object({
            // Chemin PUBLIC servi tel quel ; vide = vignette non rendue.
            image: z.string().default(''),
            // Texte de remplacement — vide = image décorative pour les lecteurs
            // d'écran. Les 75 images importées de Ø Studio en ont un provisoire,
            // à réécrire au CMS (docs/migration/catalogue-ostudio.md).
            alt: z.string().default(''),
            legende: z.string().default(''),
          }),
        )
        .default([]),
    }),
    z.object({
      type: z.literal('numbered-cards'),
      fond: fondClairOuVide.default(''),
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
          // VISUEL de la carte (2026-09-22) — `icon` puise dans la banque
          // partagée, `image` accepte un LOGO de marque que la banque n'a pas
          // (Microsoft, AWS, ServiceNow…). `image` gagne quand les deux sont
          // remplis. Les deux vides = comportement d'avant.
          icon: pictogramme.default(''),
          image: z.string().default(''),
          imageAlt: z.string().default(''),
        }),
      ),
    }),
    z.object({
      type: z.literal('feature-boxes'),
      sectionTitle: z.string(),
      subtitle: z.string().optional(),
      fond: fondEtendu.default('beige'),
      // Boîtes bordées. DEUX formes acceptées depuis le 2026-09-22 : la
      // CHAÎNE historique (aucune section migrée ne casse) et l'OBJET, qui
      // seul permet à CloudCannon d'offrir une icône et un logo — un tableau
      // de chaînes n'a pas de sous-champ affichable.
      boxes: z.array(
        z.union([
          z.string(),
          z.object({
            label: z.string(),
            icon: pictogramme.default(''),
            image: z.string().default(''),
            imageAlt: z.string().default(''),
          }),
        ]),
      ),
    }),
    z.object({
      type: z.literal('tech-columns'),
      fond: fondClair.default('ivoire'),
      sectionTitle: z.string(),
      // Chaque groupe = une colonne (titre + liste), avec un sous-groupe
      // étiqueté optionnel (ex. « Sources ouvertes et locales : » + sa liste).
      groups: z.array(
        z.object({
          title: z.string(),
          // Lien optionnel du titre de colonne (2026-09-21) : pages fournisseurs
          // d'Approvisionnement TI. URL FINALE (/fr/…) ; vide = titre sans lien.
          href: z.string().default(''),
          items: z.array(z.string()),
          subgroup: z.object({ label: z.string(), items: z.array(z.string()) }).optional(),
        }),
      ),
    }),
    z.object({
      type: z.literal('callout'),
      fond: fondEtendu.default('ivoire'),
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
      fond: fondEtendu.default('ivoire'),
      // Chaque paragraphe rendu en <p set:html> (peut contenir des <strong>).
      paragraphs: z.array(z.string()),
    }),
    z.object({
      type: z.literal('related-posts'),
      fond: fondClair.default('beige'),
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
    // ---- Sections de la page Carrières (2026-09-17 — conversion de la route
    // fixe src/pages/[lang]/carrieres.astro en page « Pages générales »
    // composée de sections, fidélité maquette docs/design/carriere.css).
    // Règles habituelles : images = chemins PUBLICS (uploads
    // public/images/carrieres, browser-safe), textes riches inline (gras/
    // italique/lien), icônes en CLÉS FERMÉES dessinées par les composants
    // ('' toléré = aucun pictogramme, patron hero.eyebrowIcon). ----
    z.object({
      type: z.literal('photo-hero'),
      title: z.string(),
      sub: z.string().default(''),
      ctaLabel: z.string().default(''),
      ctaHref: z.string().default(''),
      image: z.string().default(''),
      imageAlt: z.string().default(''),
      // Défaut « haut » = réglage 50 % 25 % historique de la page Carrières.
      imagePosition: z.enum(['centre', 'haut', 'bas']).default('haut'),
    }),
    z.object({
      type: z.literal('award-card'),
      title: z.string(),
      lead: z.string().default(''),
      quote: z.string().default(''),
      // Insigne officiel de la distinction (2026-09-21) — chemin PUBLIC servi
      // tel quel ; vide = tracé « étoile lauréate » du composant.
      image: z.string().default(''),
      // Défaut « perle » (#f3f4f7) = l'ancien bg-surface-container de la page.
      fond: fondClair.default('perle'),
    }),
    z.object({
      type: z.literal('value-tiles'),
      eyebrow: z.string().default(''),
      title: z.string(),
      fond: fondEtendu.default('ivoire'),
      items: z
        .array(
          z.object({
            icon: pictogramme.default(''),
            label: z.string().default(''),
          }),
        )
        .default([]),
    }),
    z.object({
      type: z.literal('photo-features'),
      title: z.string(),
      lead: z.string().default(''),
      cardTitle: z.string().default(''),
      cardText: z.string().default(''),
      image: z.string().default(''),
      imageAlt: z.string().default(''),
      fond: fondClair.default('ivoire'),
      items: z
        .array(
          z.object({
            icon: pictogramme.default(''),
            title: z.string().default(''),
            text: z.string().default(''),
          }),
        )
        .default([]),
    }),
    z.object({
      type: z.literal('testimonial-cards'),
      title: z.string().default(''),
      // Texte sous le titre (2026-09-24) : la note globale Gartner Peer Insights
      // des fiches fournisseurs (« Note globale : 4,3 ⭐ — 2 056 avis vérifiés »).
      intro: z.string().default(''),
      // Défaut « brume » (#e5e7eb) = l'ancien bg-surface-container-high.
      fond: fondClair.default('brume'),
      items: z
        .array(
          z.object({
            image: z.string().default(''),
            quote: z.string().default(''),
            name: z.string().default(''),
            role: z.string().default(''),
          }),
        )
        .default([]),
    }),
    z.object({
      type: z.literal('text-photo'),
      title: z.string(),
      lead: z.string().default(''),
      engagementTitle: z.string().default(''),
      engagementText: z.string().default(''),
      // Pastilles texte (placeholders de la maquette) en attendant les logos
      // réels des partenaires académiques.
      partners: z.array(z.string()).default([]),
      image: z.string().default(''),
      imageAlt: z.string().default(''),
      fond: fondEtendu.default('ivoire'),
    }),
    z.object({
      type: z.literal('timeline'),
      fond: fondClairOuVide.default(''),
      title: z.string(),
      intro: z.string().optional(),
      tone: z.enum(['default', 'tint']).default('default'),
      // Jalons chronologiques (serpentin desktop, vertical mobile). Plafond
      // rendu : 24 jalons (6 rangées de 4 — classes littérales JIT, voir le
      // composant). `accent` = jalon marquant (carte Bleu nuit + gros point).
      items: z
        .array(
          z.object({
            year: z.string(),
            title: z.string().default(''),
            text: z.string().default(''),
            accent: z.boolean().default(false),
          }),
        )
        .default([]),
    }),
    z.object({
      // Catalogue de solutions (2026-09-17) : CHROME de la page catalogue
      // (ex-route fixe solutions.astro + src/i18n/content/solutions.ts). Les
      // fiches (cartes + vedette) viennent de la collection `solutions`,
      // résolues AU BUILD par src/pages/[lang]/[...slug].astro (seam enrich,
      // patron related-posts) ; le composant reste browser-safe et affiche
      // une maquette factice dans l'éditeur visuel. Valable sur une page
      // générale seulement, une par page (garde-fous route + renderer).
      type: z.literal('solutions-catalogue'),
      title: z.string().default(''),
      searchPlaceholder: z.string().default(''),
      searchAria: z.string().default(''),
      featuredBadge: z.string().default(''),
      featuredCta: z.string().default(''),
      featuredDoc: z.string().default(''),
      sectorLabel: z.string().default(''),
      sectorAll: z.string().default(''),
      typeLabel: z.string().default(''),
      typeAll: z.string().default(''),
      discover: z.string().default(''),
      emptyMessage: z.string().default(''),
      ctaTitle: z.string().default(''),
      // HTML inline (gras/italique/lien).
      ctaText: z.string().default(''),
      ctaPhone: z.string().default(''),
      ctaPhoneHref: z.string().default(''),
      ctaButton: z.string().default(''),
      // URL COMPLÈTE avec langue (convention des sections), ex. /fr/contact.
      ctaButtonHref: z.string().default(''),
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
      // H1 SEO de la page (2026-09-16, demande de Julie) : vide = le grand titre
      // du héros est le <h1> ; renseigné = ce texte devient le <h1> de la page
      // (masqué à l'écran, rendu par component-library/src/shared/astro/
      // page.astro) et le grand titre du héros passe en <h2>, styles inchangés.
      seoH1: z.string().optional(),
      // SEO de l'accueil OUVERT AU CMS (2026-09-23). Jusque-là la page n'avait
      // NI titre NI description éditables : `<title>` sortait à « Victrix »
      // tout court (BaseLayout retombe sur SITE_NAME quand `title` est absent)
      // et la description était codée en dur dans src/pages/[lang]/index.astro,
      // hors de portée de l'éditrice. Lighthouse notait quand même 100 — son
      // audit `document-title` ne juge que la PRÉSENCE de la balise, pas son
      // contenu.
      // NOMS DE CHAMPS : `seoTitle` comme partout ailleurs, mais
      // `metaDescription` (nom des pages système) et NON `description` — dans
      // cloudcannon.config.yml les `_inputs` sont indexés par NOM DE CHAMP et
      // cascadent dans les objets imbriqués : une clé `description` à la
      // racine hériterait du libellé générique « Description » prévu pour les
      // items de section (cartes, partenaires…). `metaDescription` n'existe
      // nulle part dans les _inputs de `home` : aucune collision.
      // `.default('')` + repli au rendu (règle 5 du CLAUDE.md) : un champ vidé
      // au CMS ne peut pas produire de balise vide.
      seoTitle: z.string().default(''),
      metaDescription: z.string().default(''),
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
      // Segment d'URL personnalisable (2026-08-18) : vide = le nom de fichier
      // (comportement historique). Le nom de fichier reste la CLÉ D'APPARIEMENT
      // des traductions — seul le segment d'URL change. Minuscules, chiffres
      // et traits d'union seulement ; l'unicité PAR LANGUE est vérifiée au
      // build par la route campagnes (deux pages sur la même URL = échec
      // explicite, jamais une page écrasée en silence).
      slug: z
        .string()
        .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, {
          message:
            'slug : minuscules, chiffres et traits d’union seulement (ex. offre-licences-2026)',
        })
        .or(z.literal(''))
        .default(''),
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
      // H1 SEO de la page (2026-09-16, demande de Julie) : vide = le grand titre
      // du héros est le <h1> ; renseigné = ce texte devient le <h1> de la page
      // (masqué à l'écran, rendu par component-library/src/shared/astro/
      // page.astro) et le grand titre du héros passe en <h2>, styles inchangés.
      seoH1: z.string().optional(),
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
      // H1 SEO de la page (2026-09-16, demande de Julie) : vide = le grand titre
      // du héros est le <h1> ; renseigné = ce texte devient le <h1> de la page
      // (masqué à l'écran, rendu par component-library/src/shared/astro/
      // page.astro) et le grand titre du héros passe en <h2>, styles inchangés.
      seoH1: z.string().optional(),
      // Préremplissage du formulaire Contact par les boutons de la page
      // (2026-09-17, src/lib/contact/presets.ts) : CLÉS neutres résolues en
      // libellés de la langue au rendu ; '' = défaut de la route (services :
      // « Un projet » + famille du service ; pages générales : aucun).
      contactSujet: z.enum(['', ...CONTACT_SUJET_KEYS]).default(''),
      contactService: z.enum(['', ...CONTACT_SERVICE_KEYS]).default(''),
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
 * DEPUIS LE LOT L11 (2026-09-23), une fiche peut porter des `sections` : elle a
 * alors sa PAGE (/<langue>/solutions/<slug>/, route
 * src/pages/[lang]/solutions/[slug].astro) et « Découvrir » y mène. Sans
 * `sections`, rien ne change : aucune page n'est générée et la carte garde son
 * lien `href` — c'est l'état des 9 fiches EN, dont la traduction est un travail
 * de contenu. `href` reste une SURCHARGE : rempli, il l'emporte sur la fiche
 * (ex. `o-bureau`, qui a déjà une page de service plus riche).
 *
 * Les valeurs de `sector` et `solutionType` sont LIBRES : la page catalogue
 * construit ses filtres à partir des valeurs distinctes rencontrées (ordre
 * d'apparition) — d'où la règle éditoriale « reprendre la graphie exacte ».
 */
const solutions = defineCollection({
  loader: glob({
    pattern: '**/*.json',
    base: './src/content/solutions',
    generateId: ({ entry }) => entry.replace(/\\/g, '/').replace(/\.[^/.]+$/, ''),
  }),
  schema: ({ image }) =>
    z.object({
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
      // Seul nombre du CMS : un champ vidé arrive en `""` (voir nullsToEmpty) →
      // retombe sur le défaut plutôt que de casser le build.
      order: z.preprocess((v) => (v === '' ? undefined : v), z.number().default(999)),
      href: z.string().default(''),
      docHref: z.string().default(''),
      // Service présélectionné sur Contact quand `href` y mène (2026-09-18 : le
      // champ OBLIGATOIRE « Service » restait vide en arrivant du catalogue).
      // Clé neutre (src/lib/contact/presets.ts) ; '' = repli sur le
      // `contactService` de la page qui porte le catalogue.
      contactService: z.enum(['', ...CONTACT_SERVICE_KEYS]).default(''),

      // ---- FICHE DE SOLUTION (2026-09-23, lot L11) ------------------------
      // Une entrée n'est plus seulement une CARTE du catalogue : dès qu'elle
      // porte des `sections`, elle a sa propre page /<langue>/solutions/<slug>/
      // (route src/pages/[lang]/solutions/[slug].astro) et « Découvrir » y mène.
      // `sections` VIDE = comportement d'avant, à la lettre : aucune page n'est
      // générée, la carte garde son lien. C'est le cas des 9 fiches EN, dont la
      // traduction est un travail de contenu — rien ne casse en attendant.
      sections: z.array(sectionsSchema(image)).default([]),
      // Surcharge du slug d'URL (patron services) : le nom de FICHIER apparie
      // FR et EN, ce champ permet à l'anglais de porter son URL à lui.
      slug: z.string().default(''),
      // `noindex` : les 16 fiches importées de Ø Studio sont générées à `true`
      // — elles affichent des fourchettes de prix que Ø Studio doit valider
      // (ADO #1634). À décocher fiche par fiche au CMS une fois validées.
      noindex: z.boolean().default(false),
      seoTitle: z.string().default(''),
      seoH1: z.string().default(''),
      // Préremplissage du Contact DEPUIS la fiche (le `contactService`
      // ci-dessus sert aussi au bouton de la CARTE, dans le catalogue).
      contactSujet: z.enum(['', ...CONTACT_SUJET_KEYS]).default(''),
    }),
});

/**
 * Site chrome navigation — header menu, mega menu, portal button. One JSON
 * per locale in src/data/navigation (ids "fr" / "en"),
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
// Borne de planification (collection `annonces` ci-dessous, et toute
// planification future) : vide (aucune borne) ou date/date-heure parsable.
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
          // Défaut AJOUTÉ 2026-09-22 (L-selects) : le select reste offert dans
          // CloudCannon et vidable ; sans repli, effacer un pictogramme qui ne
          // s'affiche même plus aurait suffi à faire tomber le build.
          icon: z.enum(['strategy', 'cloud', 'security', 'productivity', 'managed']).default('strategy'),
          links: z.array(navLink),
        }),
      ),
      // Re-skin chrome 2026-08-04 (Figma « Composants ») — les deux blocs sont
      // OPTIONNELS : absents, le panneau rend ses colonnes seules (JSON
      // existant valide sans changement). Hrefs SANS préfixe de langue
      // (convention navigation, localisés au rendu).
      featured: z
        .object({
          title: z.string().default(''),
          body: z.string().default(''),
          ctaLabel: z.string().min(1),
          href: navHref,
          // Chemin PUBLIC servi tel quel (ex. /images/nav/…) ; "" = pas d'image.
          image: z.string().default(''),
        })
        .optional(),
      stripe: z
        .object({
          text: z.string().default(''),
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
        categoriesTitle: z.string().default(''),
        latestTitle: z.string().default(''),
      })
      .optional(),
  }),
});

/**
 * Barres d'annonce (bibliothèque, 2026-08-20 — remplace l'objet `announce`
 * embarqué dans la navigation) : un JSON par bannière dans src/data/annonces,
 * ajoutable/supprimable au CMS (« Barres d'annonce », groupe Marketing).
 * Textes FR et EN dans le MÊME fichier — les DEUX sont OBLIGATOIRES (build
 * gate : pas de repli silencieux; une bannière sans traduction ne publie pas).
 * Fenêtre de diffusion PARTAGÉE [startAt, endAt) évaluée au BUILD
 * (src/lib/schedule.ts) ; une seule bannière s'affiche à la fois — sélection
 * par pickActiveAnnounce (la plus récemment commencée gagne), consommée via
 * src/lib/announce.ts. Le build d'édition (STATIC_ONLY) IGNORE la fenêtre
 * pour que l'éditeur voie et modifie toujours une bannière. Un site statique
 * n'applique la fenêtre qu'à la reconstruction : rebuild quotidien planifié —
 * voir operations.md § « Publication planifiée ».
 */
const annonceText = z.object({
  before: z.string(),
  strong: z.string(),
  after: z.string(),
  linkLabel: z.string().min(1),
  // LIEN PROPRE À LA LANGUE (2026-09-23) — vide = le `linkHref` commun.
  // Pourquoi : le lien commun suppose que les deux langues partagent l'URL, ce
  // qui est vrai pour /solutions ou /contact, mais FAUX dès qu'on vise une page
  // de service — leurs slugs anglais sont traduits. La campagne d'accompagnement
  // IA vit sous `intelligence-artificielle/accompagnement-ia` en français et
  // `artificial-intelligence/landing-ai-consulting` en anglais : avec le seul
  // lien commun, le bandeau anglais tombait sur un 404.
  // SANS préfixe de langue, comme le lien commun (convention navigation).
  linkHref: z.union([navHref, z.literal('')]).default(''),
});
const annonces = defineCollection({
  loader: glob({ pattern: '*.json', base: './src/data/annonces' }),
  schema: z.object({
    // Nom interne (liste du CMS seulement — jamais rendu aux visiteurs).
    title: z.string().min(1),
    enabled: z.boolean().default(true),
    startAt: scheduleBound,
    endAt: scheduleBound,
    fr: annonceText,
    en: annonceText,
    // SANS préfixe de langue (convention navigation) — localisé au rendu.
    linkHref: navHref,
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
    // Boîte de réception CloudCannon (mode PUBLIC_FORMS_ENABLED=inbox, 2026-09-16) :
    // clé de l'Inbox qui reçoit CE formulaire (champ caché `inbox_key`). Vide =
    // la clé par défaut du site (PUBLIC_FORMS_INBOX_KEY), sinon la boîte par
    // défaut. Voir src/lib/forms/mode.ts.
    inboxKey: z.string().default(''),
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
      // H1 SEO de la page (2026-09-16, demande de Julie) : vide = le grand titre
      // du héros est le <h1> ; renseigné = ce texte devient le <h1> de la page
      // (masqué à l'écran, rendu par component-library/src/shared/astro/
      // page.astro) et le grand titre du héros passe en <h2>, styles inchangés.
      seoH1: z.string().optional(),
      // Préremplissage du formulaire Contact par les boutons de la page
      // (2026-09-17, src/lib/contact/presets.ts) : CLÉS neutres résolues en
      // libellés de la langue au rendu ; '' = défaut de la route (services :
      // « Un projet » + famille du service ; pages générales : aucun).
      contactSujet: z.enum(['', ...CONTACT_SUJET_KEYS]).default(''),
      contactService: z.enum(['', ...CONTACT_SERVICE_KEYS]).default(''),
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
      socialLabel: z.string().default(''),
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
      text: z.string().default(''),
      policyLabel: z.string().min(1),
      policyHref: navHref,
      accept: z.string().min(1),
      refuse: z.string().min(1),
      // Lien « Gérer mes témoins » des pieds de page (2026-09-18, Loi 25 :
      // retirer son consentement doit être aussi simple que le donner).
      // '' = lien masqué (tolérant : jamais de build rouge sur un champ vidé).
      manage: z.string().default(''),
    }),
    notFound: z.object({
      metaTitle: z.string().min(1),
      metaDescription: z.string().default(''),
      eyebrow: z.string().default(''),
      title: z.string().min(1),
      text: z.string().default(''),
      requestedLabel: z.string().default(''),
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
    metaDescription: z.string().default(''),
    // Surtitre du héros — rétabli par la maquette « contact redesign »
    // (2026-09-21) après avoir été retiré en août. FACULTATIF : vidé au CMS,
    // il disparaît simplement du rendu.
    heroEyebrow: z.string().default(''),
    heroTitle: z.string().min(1),
    heroSub: z.string().default(''),
    infoTitle: z.string().default(''),
    // Libellés de la carte Coordonnées (les numéros vivent dans le gabarit).
    // Maquette finale 2026-08-18 : 2 rangées seulement (sans frais + courriel)
    // — l'eyebrow du héros et la mini-grille des villes sont supprimés.
    infoLabels: z.object({
      tollFree: z.string().default(''),
      email: z.string().default(''),
    }),
    // Cartes bureaux. Le gabarit apparie les téléphones PAR POSITION (Québec,
    // Montréal, Paris) — conserver cet ordre. Image = chemin PUBLIC servi tel
    // quel ("" = pas de photo), convention des sections.
    offices: z
      .array(
        z.object({
          city: z.string().default(''),
          lines: z.array(z.string()).min(1),
          image: z.string().default(''),
        }),
      )
      .min(1),
    formTitle: z.string().default(''),
    formIntro: z.string().default(''),
    formBullets: z.array(z.string()),
    reqNote: z.string().default(''),
    labels: z.object({
      firstName: z.string().min(1),
      lastName: z.string().min(1),
      email: z.string().min(1),
      phone: z.string().min(1),
      subject: z.string().min(1),
      subjectPlaceholder: z.string().default(''),
      expertise: z.string().min(1),
      expertisePlaceholder: z.string().default(''),
      // Qualification « Taille de l'entreprise » (2026-09-21) — champ
      // FACULTATIF du contrat : vidé au CMS, il disparaît du formulaire au
      // lieu de casser le build (règle « le contenu est édité par des
      // non-développeurs »). Idem companySizeOptions plus bas.
      companySize: z.string().default(''),
      companySizePlaceholder: z.string().default(''),
      request: z.string().min(1),
      message: z.string().min(1),
    }),
    // Placeholders des champs (maquette finale 2026-08-18 : « Votre prénom »,
    // « votre@courriel.com », « Écrire… »…) — les selects gardent leurs
    // placeholders dans `labels` (première option).
    placeholders: z.object({
      firstName: z.string().default(''),
      lastName: z.string().default(''),
      email: z.string().default(''),
      phone: z.string().default(''),
      request: z.string().default(''),
      message: z.string().default(''),
    }),
    subjectOptions: z.array(z.string().min(1)).min(1),
    expertiseOptions: z.array(z.string().min(1)).min(1),
    // Tranches d'effectif — liste vide = champ retiré du formulaire (voir
    // labels.companySize). Doit rester IDENTIQUE à celle de la définition
    // src/data/forms/<lang>/contact.json : contact.astro les compare au build.
    companySizeOptions: z.array(z.string().min(1)).default([]),
    // HTML restreint ({privacy} = lien vers la politique, localisé au rendu) —
    // même politique que le consentText des formulaires (contenu de dépôt).
    consentText: z.string().min(1),
    submit: z.string().min(1),
    statusMessage: z.string().default(''),
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
      // Fin de titre en bleu (maquette « ressources parent » 2026-08-18 :
      // « Perspectives et **expertises TI** ») — vide = titre d'un seul tenant.
      titleAccent: z.string().default(''),
      intro: z.string().default(''),
      filterAll: z.string().min(1),
      // Refonte « Centre de ressources » (maquette export2, 2026-08-18) —
      // textes de la barre de recherche, des cartes et du bandeau d'appel à
      // l'action. Tous éditables au CMS (collection Pages système).
      // RETIRÉS le 2026-09-21 avec l'ancien héros : `subscribeLabel` (bouton
      // « S'abonner à l'infolettre ») et `expertCard` (carte vitrée décorative)
      // — plus rien ne les affichait.
      searchPlaceholder: z.string().min(1),
      readMore: z.string().min(1),
      byline: z.string().default(''),
      newsletter: z.object({
        title: z.string().default(''),
        text: z.string().default(''),
        emailPlaceholder: z.string().min(1),
        submitLabel: z.string().min(1),
        confirmation: z.string().default(''),
      }),
      cta: z.object({
        title: z.string().default(''),
        text: z.string().default(''),
        primaryLabel: z.string().min(1),
        // Liens internes SANS préfixe de langue (même règle que `merci.links`).
        primaryHref: navHref,
        secondaryLabel: z.string().min(1),
        secondaryHref: navHref,
      }),
    }),
    recherche: z.object({
      metaTitle: z.string().min(1),
      // TOLÉRANT (2026-09-18) : voir `merci.metaDescription` ci-dessous.
      metaDescription: z.string().default(''),
      eyebrow: z.string().default(''),
      title: z.string().min(1),
      intro: z.string().default(''),
      noscript: z.string().default(''),
    }),
    merci: z.object({
      metaTitle: z.string().min(1),
      // TOLÉRANT (2026-09-18, incident) : ce champ vidé dans l'éditeur a mis
      // le build de `staging` au rouge pendant 20 sauvegardes d'affilée — plus
      // rien de ce que l'éditrice enregistrait n'était publié. Une méta
      // description n'est jamais structurellement requise (pages en noindex) :
      // vide = repli sur la description par défaut du site (BaseLayout).
      metaDescription: z.string().default(''),
      title: z.string().min(1),
      text: z.string().default(''),
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
  annonces,
  forms,
  pages,
  site,
  contact,
  pagesSysteme,
};
