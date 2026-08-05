/**
 * Copy for the Careers page, FR + EN. Template: src/pages/[lang]/carrieres.astro.
 * FIDÉLITÉ MAQUETTE 2026-08-05 (docs/design/carriere.css + capture user +
 * docs/design/Export HTML/Carrieres.html) : héros photo + voile, carte
 * « Happy At Work », valeurs (5 tuiles), « Pourquoi rejoindre notre
 * équipe? » (photo + carte flottante + 4 atouts), témoignages (2 cartes),
 * responsabilité sociale (photo + partenaires), CTA final bleu.
 * Icônes en CLÉS FERMÉES rendues en SVG par le gabarit (jamais de markup ici).
 * La maquette n'a PAS de liste de postes (Annexe B des arbitrages) : les CTA
 * « Postulez »/« Contactez-nous » pointent vers /contact (localisé au rendu).
 */

import type { Locale } from '../config';

const fr = {
  metaTitle: 'Carrières',
  metaDescription:
    'Rejoignez Victrix : une équipe passionnée, un environnement de travail certifié Happy At Work et de réelles opportunités de carrière en TI.',
  hero: {
    title: 'La vie chez Victrix',
    sub: 'Parcourez nos offres d’emploi et trouvez l’opportunité que vous attendiez!',
    ctaLabel: 'Postulez',
  },
  happy: {
    title: 'Happy At Work',
    lead: 'Victrix est certifiée HappyIndex® AtWork 2024 des entreprises «où l’on est heureux de travailler».',
    quote:
      'Cette distinction est décernée à la suite d’une enquête participative, qui permet aux salariés de s’exprimer anonymement sur leur expérience au quotidien dans l’entreprise.',
  },
  values: {
    eyebrow: 'Culture',
    title: 'Nos valeurs',
    items: [
      { icon: 'etoile', label: 'Excellence' },
      { icon: 'groupe', label: 'Collaboration' },
      { icon: 'ampoule', label: 'Innovation' },
      { icon: 'poignee', label: 'Engagement' },
      { icon: 'insigne', label: 'Intégrité' },
    ],
  },
  join: {
    title: 'Pourquoi rejoindre notre équipe?',
    lead: 'Victrix valorise ses employés et offre un environnement de travail enrichissant. Nous sommes toujours à la recherche de personnes talentueuses et motivées.',
    cardTitle: 'Un environnement stimulant',
    cardText: 'Contribuez à notre succès et épanouissez-vous au sein d’une équipe passionnée.',
    features: [
      {
        icon: 'croissance',
        title: 'Développement personnel',
        text: 'Accompagnement continu dans vos aspirations professionnelles.',
      },
      {
        icon: 'progression',
        title: 'Évolution de carrière',
        text: 'Opportunités réelles de progression au sein du groupe.',
      },
      {
        icon: 'coeur',
        title: 'Bien-être au travail',
        text: 'Équilibre vie professionnelle et vie personnelle respecté.',
      },
      {
        icon: 'formation',
        title: 'Compétences et formation',
        text: 'Programmes de formation pour rester à la pointe des TI.',
      },
    ],
  },
  testimonials: {
    title: 'Ce que nos experts disent',
    items: [
      {
        image: '/images/carrieres/temoignage-mikael.png',
        quote:
          '«Victrix me permet de sortir de ma zone de confort et de relever de nouveaux défis sur le plan personnel et professionnel.»',
        name: 'Mikaël',
        role: 'Architecte Cloud',
      },
      {
        image: '/images/carrieres/temoignage-daniel.png',
        quote:
          '«Victrix me permet de faire de la formation continue. Le parcours est étonnamment bonifié et me permet de devenir encore meilleur dans mon domaine.»',
        name: 'Daniel',
        role: 'Conseiller',
      },
    ],
  },
  social: {
    title: 'Notre responsabilité sociale et nos engagements',
    lead: 'Des activités à buts sociaux et associatifs sont organisées tous les mois afin de célébrer nos succès et nous retrouver tous ensemble pour créer des moments mémorables.',
    engagementTitle: 'Engagement pour les jeunes talents',
    engagementText:
      'Nous collaborons activement avec les institutions académiques pour soutenir la relève en TI.',
    partners: ['Partner 1', 'Partner 2'],
  },
  cta: {
    title: 'Vous souhaitez en apprendre davantage sur nos opportunités de carrière?',
    text: 'Écrivez-nous ou planifiez une rencontre avec nos équipes de recrutement dès aujourd’hui.',
    label: 'Contactez-nous',
  },
};

type CarrieresContent = typeof fr;

const en: CarrieresContent = {
  metaTitle: 'Careers',
  metaDescription:
    'Join Victrix: a passionate team, a Happy At Work certified environment, and real IT career opportunities.',
  hero: {
    title: 'Life at Victrix',
    sub: 'Browse our job openings and find the opportunity you have been waiting for!',
    ctaLabel: 'Apply',
  },
  happy: {
    title: 'Happy At Work',
    lead: 'Victrix is HappyIndex® AtWork 2024 certified among companies “where people are happy to work”.',
    quote:
      'This distinction is awarded following a participative survey that lets employees speak anonymously about their day-to-day experience within the company.',
  },
  values: {
    eyebrow: 'Culture',
    title: 'Our values',
    items: [
      { icon: 'etoile', label: 'Excellence' },
      { icon: 'groupe', label: 'Collaboration' },
      { icon: 'ampoule', label: 'Innovation' },
      { icon: 'poignee', label: 'Commitment' },
      { icon: 'insigne', label: 'Integrity' },
    ],
  },
  join: {
    title: 'Why join our team?',
    lead: 'Victrix values its employees and offers a rewarding work environment. We are always looking for talented, motivated people.',
    cardTitle: 'A stimulating environment',
    cardText: 'Contribute to our success and thrive within a passionate team.',
    features: [
      {
        icon: 'croissance',
        title: 'Personal development',
        text: 'Ongoing support for your professional aspirations.',
      },
      {
        icon: 'progression',
        title: 'Career growth',
        text: 'Real opportunities for advancement within the group.',
      },
      {
        icon: 'coeur',
        title: 'Well-being at work',
        text: 'A respected balance between professional and personal life.',
      },
      {
        icon: 'formation',
        title: 'Skills and training',
        text: 'Training programs to stay at the leading edge of IT.',
      },
    ],
  },
  testimonials: {
    title: 'What our experts say',
    items: [
      {
        image: '/images/carrieres/temoignage-mikael.png',
        quote:
          '“Victrix lets me step out of my comfort zone and take on new challenges, both personally and professionally.”',
        name: 'Mikaël',
        role: 'Cloud Architect',
      },
      {
        image: '/images/carrieres/temoignage-daniel.png',
        quote:
          '“Victrix lets me pursue continuous training. The journey keeps getting better and makes me even stronger in my field.”',
        name: 'Daniel',
        role: 'Consultant',
      },
    ],
  },
  social: {
    title: 'Our social responsibility and commitments',
    lead: 'Social and community activities are organized every month to celebrate our successes and bring everyone together to create memorable moments.',
    engagementTitle: 'Committed to young talent',
    engagementText:
      'We actively collaborate with academic institutions to support the next generation in IT.',
    partners: ['Partner 1', 'Partner 2'],
  },
  cta: {
    title: 'Want to learn more about our career opportunities?',
    text: 'Write to us or schedule a meeting with our recruitment teams today.',
    label: 'Contact us',
  },
};

export const carrieresContent: Record<Locale, CarrieresContent> = { fr, en };
