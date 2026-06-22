/**
 * Copy for the "Intelligence artificielle" expertise page, FR + EN.
 * The template lives at src/pages/[lang]/expertises/intelligence-artificielle.astro
 * and renders from `aiContent[lang]`. Fields containing <strong> are rendered
 * with set:html (trusted, in-repo content). All CTAs link to /contact (localized
 * at render). Tech/brand names in the multi-tech grid are locale-neutral and
 * stay in the template.
 */

import type { Locale } from '../config';

const fr = {
  metaTitle: 'Intelligence artificielle',
  metaDescription:
    'Services-conseils et d’intégration en intelligence artificielle adaptés à votre organisation : stratégie, agents sur mesure, adoption sécurisée de l’IA générative.',
  hero: {
    eyebrow: 'Intelligence artificielle',
    titleAccent: 'Services-conseils et d’intégration en IA',
    titleRest: 'adaptés à votre organisation',
    lead: 'Adoptez l’intelligence artificielle de façon sécuritaire et responsable, avec une approche qui intègre les personnes, les processus et la gestion du changement à chaque étape. Profitez de l’accompagnement de nos conseillers pour sélectionner et adopter des solutions d’IA qui répondent à vos défis. Grâce à notre expertise multitechnologique, nous assurons une <strong>mise en œuvre et une adoption réussies</strong>, alignées sur vos objectifs d’affaires.',
    cta: 'Parler à un expert en IA',
  },
  fromStrategy: {
    blockTitle: 'Mettez l’IA au service des entreprises et des organisations publiques',
    leadCardTitle: 'Avec Victrix, passez de la stratégie à l’adoption',
    leadCardText:
      'Nos conseillers en intelligence artificielle peuvent intervenir à différentes étapes, selon votre niveau de maturité ou d’adoption de l’IA. Voici ce que couvrent nos interventions et services en IA.',
  },
  interventions: [
    { n: '01', title: 'Exploration et analyse des opportunités', text: 'Repérez et priorisez les cas d’usage les plus prometteurs, puis élaborez une feuille de route claire pour lancer vos premières initiatives concrètes en IA.' },
    { n: '02', title: 'Développement d’agents et de solutions d’IA sur mesure', text: 'Concevez et déployez des solutions précises pour automatiser ou optimiser vos processus prioritaires, avec un accompagnement complet, du prototype au déploiement.' },
    { n: '03', title: 'Adoption sécurisée de l’IA générative', text: 'Structurez l’adoption de l’IA générative dans votre organisation grâce à un plan solide, du soutien aux utilisateurs et des formations ciblées, en mettant de l’avant les bonnes pratiques.' },
  ],
  collaboration: {
    sHead: 'Comment Victrix travaille avec vos équipes pour une adoption fluide et sécuritaire de l’IA',
    sIntro:
      'Que vous ayez un projet ciblé ou une initiative d’envergure, nous collaborons avec vos équipes pour <strong>évaluer les besoins</strong>, <strong>définir les objectifs</strong> et <strong>respecter vos échéances</strong>. Notre approche collaborative assure une adoption fluide et sécuritaire de l’IA, tout en maximisant la valeur pour votre organisation.',
    items: [
      { n: '01', title: 'Expertise continue', text: 'Nous mettons à votre disposition des experts en IA pour du conseil et du développement à long terme. Vous bénéficiez d’un accompagnement continu pour assurer le suivi, l’évolution et l’amélioration de vos projets.', cta: 'Je choisis un accompagnement continu' },
      { n: '02', title: 'Expertise sur mesure', text: 'Nous mobilisons nos experts pour vos projets spécifiques, en ajustant notre accompagnement selon vos priorités et vos échéances afin d’offrir une assistance ciblée qui garantit des résultats à la hauteur de vos attentes.', cta: 'J’ai un projet spécifique' },
    ],
  },
  cta1: {
    title: 'Des questions sur un projet en intelligence artificielle ?',
    text: 'Nos experts vous accompagnent à chaque étape pour assurer le succès de tous vos projets d’IA.',
    cta: 'Consulter un spécialiste',
  },
  areas: {
    sHead: 'Expertise en intelligence artificielle',
    sSub: 'Nos domaines d’expertise en IA',
    items: [
      'Agents personnalisés et interconnectés pour des processus standardisés',
      'Personnalisation des grands modèles de langage (LLM) selon vos domaines ou vos données',
      'Consultation stratégique, gouvernance et feuille de route',
      'Gestion du changement et adoption de l’IA',
      'Sécurité et conformité des données',
    ],
  },
  multiTech: {
    sHead: 'Expertise multitechnologique',
    col1Title: 'Grands modèles de langage (LLM)',
    col2Title: 'Agents intégrés',
    col3Title: 'Technologies et environnements de développement',
    openLocalLabel: 'Sources ouvertes et locales :',
  },
  cta2: { title: 'Prêt à démarrer votre projet d’intelligence artificielle ?', cta: 'Consulter nos experts' },
  expertsPanel: {
    sHead: 'Interventions structurées et ciblées, soutenues par un bassin diversifié d’experts en IA',
    items: [
      { n: '01', title: 'Consultation stratégique', text: 'Des conseillers d’expérience issus de notre équipe, de notre écosystème mondial et de nos partenaires spécialisés en IA.' },
      { n: '02', title: 'Architecture technologique et d’affaires', text: 'Des ingénieurs séniors reconnus comme experts en IA par nos clients.' },
      { n: '03', title: 'Expertise des solutions', text: 'Des spécialistes capables d’intervenir en cybersécurité, en ERP/CRM, en gestion des données et en moteurs de recherche intelligents.' },
      { n: '04', title: 'Analyse, développement et gestion du changement', text: 'Des experts qui vous accompagnent en analyse, en développement et en gestion du changement, forts d’une expérience concrète en projets d’IA et en preuves de concept.' },
    ],
  },
  closing: {
    blockTitle: 'Victrix accélère l’adoption de l’IA dans votre organisation',
    p1: 'Porté par un <strong>écosystème d’expertise</strong> qui englobe la technologie, la gouvernance des données, la cybersécurité et les services gérés, Victrix est votre partenaire stratégique pour la gestion de vos projets d’IA.',
    p2: 'Notre accompagnement en intelligence artificielle simplifie le déploiement, la stratégie et votre <strong>feuille de route en IA</strong>, peu importe votre niveau de maturité.',
  },
  greenCta: {
    title: 'Rencontrez nos conseillers en IA',
    text: 'Profitez de l’expertise de nos spécialistes en intelligence artificielle pour ajouter une réelle valeur à vos processus et accélérer l’atteinte de vos objectifs.',
    cta: 'Adoptez l’IA avec Victrix',
  },
};

type AiContent = typeof fr;

const en: AiContent = {
  metaTitle: 'Artificial Intelligence',
  metaDescription:
    'AI consulting and integration services tailored to your organization: strategy, custom agents, secure adoption of generative AI.',
  hero: {
    eyebrow: 'Artificial intelligence',
    titleAccent: 'AI consulting and integration services',
    titleRest: 'tailored to your organization',
    lead: 'Adopt artificial intelligence in a secure and responsible way, with an approach that integrates people, processes, and change management at every step. Benefit from the guidance of our consultants to select and adopt AI solutions that address your challenges. Thanks to our multi-technology expertise, we ensure <strong>successful implementation and adoption</strong>, aligned with your business objectives.',
    cta: 'Talk to an AI expert',
  },
  fromStrategy: {
    blockTitle: 'Put AI to work for businesses and public organizations',
    leadCardTitle: 'With Victrix, move from strategy to adoption',
    leadCardText:
      'Our artificial intelligence consultants can step in at different stages, depending on your level of AI maturity or adoption. Here is what our AI interventions and services cover.',
  },
  interventions: [
    { n: '01', title: 'Exploring and analyzing opportunities', text: 'Identify and prioritize the most promising use cases, then build a clear roadmap to launch your first concrete AI initiatives.' },
    { n: '02', title: 'Developing custom AI agents and solutions', text: 'Design and deploy precise solutions to automate or optimize your priority processes, with end-to-end guidance from prototype to deployment.' },
    { n: '03', title: 'Secure adoption of generative AI', text: 'Structure the adoption of generative AI across your organization through a solid plan, user support, and targeted training, putting best practices front and centre.' },
  ],
  collaboration: {
    sHead: 'How Victrix works with your teams for smooth and secure AI adoption',
    sIntro:
      'Whether you have a targeted project or a large-scale initiative, we collaborate with your teams to <strong>assess needs</strong>, <strong>define objectives</strong>, and <strong>meet your deadlines</strong>. Our collaborative approach ensures smooth and secure AI adoption while maximizing value for your organization.',
    items: [
      { n: '01', title: 'Ongoing expertise', text: 'We provide you with AI experts for long-term consulting and development. You benefit from continuous guidance to ensure the follow-up, evolution, and improvement of your projects.', cta: 'I want ongoing support' },
      { n: '02', title: 'Tailored expertise', text: 'We mobilize our experts for your specific projects, adjusting our support according to your priorities and deadlines to deliver targeted assistance that ensures results that meet your expectations.', cta: 'I have a specific project' },
    ],
  },
  cta1: {
    title: 'Questions about an artificial intelligence project?',
    text: 'Our experts support you at every step to ensure the success of all your AI projects.',
    cta: 'Consult a specialist',
  },
  areas: {
    sHead: 'Artificial intelligence expertise',
    sSub: 'Our areas of AI expertise',
    items: [
      'Custom, interconnected agents for standardized processes',
      'Customization of large language models (LLMs) to your domains or your data',
      'Strategic consulting, governance, and roadmap',
      'Change management and AI adoption',
      'Data security and compliance',
    ],
  },
  multiTech: {
    sHead: 'Multi-technology expertise',
    col1Title: 'Large language models (LLMs)',
    col2Title: 'Integrated agents',
    col3Title: 'Technologies and development environments',
    openLocalLabel: 'Open-source and local:',
  },
  cta2: { title: 'Ready to start your artificial intelligence project?', cta: 'Consult our experts' },
  expertsPanel: {
    sHead: 'Structured, targeted interventions backed by a diverse pool of AI experts',
    items: [
      { n: '01', title: 'Strategic consulting', text: 'Experienced advisors from our team, our global ecosystem, and our specialized AI partners.' },
      { n: '02', title: 'Technology and business architecture', text: 'Senior engineers recognized as AI experts by our clients.' },
      { n: '03', title: 'Solution expertise', text: 'Specialists who can step in on cybersecurity, ERP/CRM, data management, and intelligent search engines.' },
      { n: '04', title: 'Analysis, development, and change management', text: 'Experts who support you in analysis, development, and change management, drawing on hands-on experience in AI projects and proofs of concept.' },
    ],
  },
  closing: {
    blockTitle: 'Victrix accelerates AI adoption in your organization',
    p1: 'Driven by an <strong>ecosystem of expertise</strong> that spans technology, data governance, cybersecurity, and managed services, Victrix is your strategic partner for managing your AI projects.',
    p2: 'Our artificial intelligence support simplifies deployment, strategy, and your <strong>AI roadmap</strong>, whatever your level of maturity.',
  },
  greenCta: {
    title: 'Meet our AI consultants',
    text: 'Tap into the expertise of our artificial intelligence specialists to add real value to your processes and accelerate the achievement of your objectives.',
    cta: 'Adopt AI with Victrix',
  },
};

export const aiContent: Record<Locale, AiContent> = { fr, en };
