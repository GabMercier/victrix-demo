#!/usr/bin/env node
/**
 * genere-fiches-solutions.mjs — Écrit les FICHES du catalogue Ø Studio
 * (src/content/solutions/fr/<slug>.json) à partir de l'export du lot L10
 * (docs/migration/catalogue-ostudio/<slug>.json). Lot L11.
 *
 * IL NE TOUCHE JAMAIS AU RÉSEAU. La source est l'export, pas le WordPress :
 * c'est ce qui rend ce script rejouable après le démantèlement du
 * sous-domaine, et ce qui sépare « rapatrier » (L10) de « poser sur le site »
 * (L11).
 *
 * IL NE RÉÉCRIT JAMAIS UNE FICHE DÉJÀ COMPOSÉE. Dès qu'un fichier porte des
 * `sections`, il est SAUTÉ et signalé — le contenu appartient alors à
 * l'éditrice, qui l'aura retouché dans CloudCannon. `--force` passe outre,
 * explicitement, et c'est le seul moyen d'écraser. C'est la leçon de
 * `convert-articles.mjs` : un générateur qui écrase est un générateur qu'on
 * ne peut plus relancer.
 *
 * Ce qu'il écrit, fiche par fiche :
 *  - les 9 fiches EXISTANTES gardent tous leurs champs de carte (titre,
 *    description, vignette, secteur, type, ordre, vedette) — seules les
 *    `sections` sont ajoutées ;
 *  - les 7 NOUVELLES sont créées de bout en bout ; leur `sector` et leur
 *    `solutionType` viennent de la table PROPOSITIONS ci-dessous, à relire
 *    par le marketing (les filtres du catalogue sont construits à partir des
 *    valeurs distinctes : une graphie nouvelle = un filtre de plus) ;
 *  - `href` : vidé quand il vaut `/contact`, pour que « Découvrir » mène à la
 *    FICHE. Un `href` qui pointe ailleurs est une SURCHARGE VOULUE et reste
 *    intact (`o-bureau` garde sa page de service, plus riche que la fiche).
 *
 * Les quatre sections d'une fiche (docs/plan-import-catalogue-ostudio.md §4) :
 *   product-hero (titre, intro, maquette, bouton vers le formulaire)
 *   bento-metrics (« En bref » : les 4 faits + renvoi vers la page Ø Studio)
 *   galerie (les captures d'écran restantes — absente s'il n'y en a pas)
 *   form (formId `o-studio` ; son champ caché « Page d'origine » nomme la
 *         solution dans le courriel, sans rien ajouter)
 *
 * Usage :
 *   node scripts/migration/genere-fiches-solutions.mjs
 *   node scripts/migration/genere-fiches-solutions.mjs --check   # n'écrit rien, code 1 si une fiche manque
 *   node scripts/migration/genere-fiches-solutions.mjs --force   # RÉÉCRIT les sections existantes
 */
import { existsSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const args = process.argv.slice(2);
const CHECK = args.includes('--check');
const FORCE = args.includes('--force');

const EXPORT_DIR = join(ROOT, 'docs/migration/catalogue-ostudio');
const FICHES_DIR = join(ROOT, 'src/content/solutions/fr');

/** Page de service Ø Studio — cible du renvoi de la carte claire du bento. */
const PAGE_O_STUDIO = '/fr/services/productivite/o-studio/';

/**
 * Secteur et type des 7 NOUVELLES fiches — à relire par le marketing.
 *
 * Ce ne sont pas les « Client » de la source (« Secteur de la Santé »,
 * « Secteur manufacturier »…) : les deux listes du catalogue sont des FILTRES,
 * et leurs valeurs existantes tiennent plus du thème que du secteur strict
 * (Chantier, RH, Innovation, Éducation, Modernisation, Travail hybride,
 * Gouvernance, Municipalité, Finance). Reprendre la graphie exacte est la
 * règle : une variante crée un filtre de plus. « Santé » est la SEULE valeur
 * nouvelle introduite ici, faute d'équivalent.
 */
const PROPOSITIONS = {
  'gouvernance-power-platform': { sector: 'Gouvernance', solutionType: 'Power Platform' },
  'registre-applications': { sector: 'Gouvernance', solutionType: 'Power Platform' },
  'gestion-contractuelle': { sector: 'Santé', solutionType: 'Automatisation' },
  'gestion-recrutement': { sector: 'RH', solutionType: 'Automatisation' },
  'onboarding-employe': { sector: 'RH', solutionType: 'Automatisation' },
  'comptes-depenses': { sector: 'Finance', solutionType: 'Automatisation' },
  'traitement-factures': { sector: 'Finance', solutionType: 'Automatisation' },
};

/** Ordre d'affichage des nouvelles, à la suite des 9 existantes (pas de 10). */
const ORDRE_DEPART = 90;

const rel = (p) => p.replace(ROOT, '').replace(/^[\\/]/, '').replace(/\\/g, '/');

// ---------------------------------------------------------------------------
// Construction des sections
// ---------------------------------------------------------------------------

/** Les 4 faits, dans l'ordre de la source, en pastilles {value,label}. */
const faitsEnStats = (fiche) =>
  fiche.faits.map((f) => ({ value: f.valeur, label: f.libelle }));

function sectionsDe(fiche) {
  const sections = [];
  const [maquette, ...captures] = fiche.images;

  // 1. Héros produit — la maquette de tête, le titre, l'introduction, et un
  //    bouton vers l'ancre du formulaire (`#formulaire`, posée par form.astro).
  sections.push({
    _bookshop_name: 'product-hero',
    type: 'product-hero',
    badge: 'Solution Ø Studio',
    title: fiche.titre,
    titleHighlight: '',
    lead: fiche.intro,
    ctaLabel: 'Parler à un expert',
    ctaHref: '#formulaire',
    cta2Label: 'Voir le catalogue',
    cta2Href: '/fr/solutions/',
    image: maquette ? maquette.fichier : '',
    imageAlt: maquette ? maquette.alt : '',
    fond: 'beige',
  });

  // 2. « En bref » — les 4 faits de la source (Client, Coût, Délai,
  //    Technologies) en pastilles, et la carte claire qui renvoie vers la page
  //    de service Ø Studio.
  sections.push({
    _bookshop_name: 'bento-metrics',
    type: 'bento-metrics',
    title: 'En bref',
    intro: '',
    fond: 'ivoire',
    featured: {
      title: fiche.titre,
      text: '',
      watermark: 'eclair',
      stats: faitsEnStats(fiche),
    },
    aside: {
      icon: 'coche',
      image: '',
      imageAlt: '',
      title: 'Conçue par Ø Studio',
      text: 'Notre studio de création Power Platform et Dynamics 365 personnalise la solution à vos processus.',
      linkLabel: 'Découvrir Ø Studio',
      linkHref: PAGE_O_STUDIO,
    },
  });

  // 3. Galerie — les captures d'écran restantes. Quatre fiches de la source
  //    n'ont qu'une seule image (une photo d'illustration) : elles n'ont donc
  //    pas de galerie du tout, plutôt qu'une section vide.
  if (captures.length > 0) {
    sections.push({
      _bookshop_name: 'galerie',
      type: 'galerie',
      title: 'Aperçu de l’application',
      intro: '',
      colonnes: captures.length >= 6 ? '3' : '2',
      fond: 'blanc',
      images: captures.map((img) => ({ image: img.fichier, alt: img.alt, legende: '' })),
    });
  }

  // 4. Formulaire — le `o-studio` existant. Son champ caché « Page d'origine »
  //    (jetons {{page.titre}} / {{page.chemin}}, résolus par la route) nomme la
  //    solution dans le courriel sans qu'on ait à ajouter quoi que ce soit.
  sections.push({
    _bookshop_name: 'form',
    type: 'form',
    title: 'Parlez-nous de votre projet',
    intro: fiche.invitation,
    submitLabel: 'Demander une consultation',
    consentText: '',
    variant: 'carte',
    formId: 'o-studio',
    fond: '',
    fields: [],
  });

  return sections;
}

// ---------------------------------------------------------------------------
// Exécution
// ---------------------------------------------------------------------------

const exports_ = readdirSync(EXPORT_DIR)
  .filter((f) => f.endsWith('.json') && !f.startsWith('_'))
  .map((f) => JSON.parse(readFileSync(join(EXPORT_DIR, f), 'utf8')))
  .sort((a, b) => Number(a.nouvelle) - Number(b.nouvelle) || a.slug.localeCompare(b.slug));

if (exports_.length === 0) {
  console.error(`ÉCHEC : aucun export dans ${rel(EXPORT_DIR)} — rejouer export-catalogue-ostudio.mjs.`);
  process.exit(1);
}

const bilan = { crees: [], completes: [], sautes: [], ecarts: [], inchanges: [] };
let ordre = ORDRE_DEPART;

for (const fiche of exports_) {
  const chemin = join(FICHES_DIR, `${fiche.slug}.json`);
  const existe = existsSync(chemin);
  const actuel = existe ? JSON.parse(readFileSync(chemin, 'utf8')) : null;

  if (actuel && Array.isArray(actuel.sections) && actuel.sections.length > 0 && !FORCE) {
    bilan.sautes.push(fiche.slug);
    continue;
  }

  const proposition = PROPOSITIONS[fiche.slug] ?? {};
  const maquette = fiche.images[0];

  // Les champs de CARTE existants l'emportent toujours : ils ont été écrits à
  // la main (vignette choisie, secteur et type relus, ordre, vedette).
  const sortie = {
    _schema: actuel?._schema ?? 'default',
    title: actuel?.title ?? fiche.titre,
    description: actuel?.description ?? fiche.intro,
    image: actuel?.image ?? (maquette ? maquette.fichier : ''),
    sector: actuel?.sector ?? proposition.sector ?? '',
    solutionType: actuel?.solutionType ?? proposition.solutionType ?? '',
    featured: actuel?.featured ?? false,
    order: actuel?.order ?? (ordre += 10) - 10,
    // « Découvrir » doit mener à la FICHE : `/contact` était le repli d'avant,
    // quand la fiche n'existait pas. Tout autre lien est une surcharge voulue.
    href: actuel && actuel.href && !/^\/contact\/?$/.test(actuel.href) ? actuel.href : '',
    docHref: actuel?.docHref ?? '',
    contactService: actuel?.contactService ?? '',
    // Les prix de la source sont publics et non validés (ADO #1634).
    noindex: actuel?.noindex ?? true,
    seoTitle: actuel?.seoTitle ?? '',
    seoH1: actuel?.seoH1 ?? '',
    contactSujet: actuel?.contactSujet ?? '',
    slug: actuel?.slug ?? '',
    sections: sectionsDe(fiche),
  };

  const texte = `${JSON.stringify(sortie, null, 2)}\n`;
  const avant = existe ? readFileSync(chemin, 'utf8') : null;
  if (avant === texte) {
    bilan.inchanges.push(fiche.slug);
    continue;
  }
  if (CHECK) {
    bilan.ecarts.push(`${rel(chemin)} — ${existe ? 'sections à (re)générer' : 'fiche absente'}`);
    continue;
  }
  writeFileSync(chemin, texte, 'utf8');
  (existe ? bilan.completes : bilan.crees).push(fiche.slug);
}

console.log(
  `Fiches : ${exports_.length} | créées : ${bilan.crees.length} | complétées : ${bilan.completes.length} | ` +
    `inchangées : ${bilan.inchanges.length} | sautées (déjà composées) : ${bilan.sautes.length}`,
);
if (bilan.crees.length) console.log(`  créées     : ${bilan.crees.join(', ')}`);
if (bilan.completes.length) console.log(`  complétées : ${bilan.completes.join(', ')}`);
if (bilan.sautes.length) {
  console.log(`  sautées    : ${bilan.sautes.join(', ')}`);
  console.log('             (déjà composées — « --force » pour les réécrire, ce qui EFFACE les retouches du CMS)');
}

if (CHECK && bilan.ecarts.length) {
  console.error(`\n✗ ${bilan.ecarts.length} fiche(s) à générer :`);
  for (const e of bilan.ecarts) console.error(`  - ${e}`);
  console.error('Rejouer sans --check.');
  process.exit(1);
}
console.log('✓ Fiches conformes à l’export.');
