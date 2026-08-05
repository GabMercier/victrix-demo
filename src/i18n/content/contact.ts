/**
 * Copy for the Contact page, FR + EN. Template: src/pages/[lang]/contact.astro.
 * FIDÉLITÉ MAQUETTE 2026-08-05 (docs/design/contact.css + capture user) :
 * héros centré (eyebrow « Nous joindre », « Contactez-nous ! »), carte
 * Coordonnées + 3 cartes bureaux avec photo, section formulaire 2 colonnes
 * (« Prêt à faire évoluer votre organisation ? » + panneau form2 : selects
 * Sujet/Expertise, « Précisez votre demande », consentement, envoi).
 * Phone numbers/emails are locale-neutral and stay in the template; only
 * human-readable text lives here. `consentText` is HTML (privacy-policy link,
 * localized at render) rendered with set:html.
 */

import type { Locale } from '../config';

const fr = {
  metaTitle: 'Contact',
  metaDescription:
    'Communiquez avec Victrix : nos bureaux de Montréal, Québec et Paris, par téléphone, par courriel ou via notre formulaire.',
  heroEyebrow: 'Nous joindre',
  heroTitle: 'Contactez-nous !',
  heroSub:
    'Vous avez une question ou un projet ? N’hésitez pas à nous contacter. Nos experts sont là pour vous accompagner dans votre transformation numérique.',
  infoTitle: 'Coordonnées',
  infoLabels: {
    montreal: 'Montréal',
    quebec: 'Québec',
    paris: 'Paris',
    tollFree: 'Sans frais',
    email: 'Courriel',
  },
  offices: [
    {
      city: 'Québec',
      lines: ['330 Rue Saint-Vallier Est, #130', 'Québec (QC), G1K 9C5'],
      image: '/images/contact/bureau-quebec.jpg',
    },
    {
      city: 'Montréal',
      lines: ['1100 Boul. René-Lévesque O, #1900', 'Montréal (QC), H3B 4N4'],
      image: '/images/contact/bureau-montreal.jpg',
    },
    {
      city: 'Paris',
      lines: ['9-15 rue Rouget de Lisle', 'Issy-les-Moulineaux, 92130'],
      image: '/images/contact/bureau-paris.jpg',
    },
  ],
  formTitle: 'Prêt à faire évoluer votre organisation ?',
  formIntro:
    'Remplissez le formulaire et un de nos experts TI vous contactera dans les plus brefs délais pour discuter de vos défis et objectifs.',
  formBullets: [
    'Consultation stratégique personnalisée',
    'Expertise multidisciplinaire certifiée',
    'Accompagnement de bout en bout',
  ],
  reqNote: 'Les champs marqués d’un astérisque (*) sont obligatoires.',
  labels: {
    firstName: 'Prénom',
    lastName: 'Nom',
    email: 'Courriel',
    phone: 'Téléphone',
    subject: 'De quoi souhaitez-vous parler ?',
    subjectPlaceholder: 'Sélectionnez un sujet',
    expertise: 'Expertise',
    expertisePlaceholder: 'Sélectionnez une expertise',
    request: 'Précisez votre demande',
    message: 'Message',
  },
  subjectOptions: ['Un projet', 'Une expertise', 'Une carrière', 'Autre'],
  expertiseOptions: [
    'Conseil stratégique',
    'Intelligence artificielle',
    'Cybersécurité',
    'Infonuagique',
    'Infrastructure',
    'Services gérés',
    'Autre',
  ],
  consentText:
    'En soumettant ce formulaire, vous consentez à recevoir des communications de Victrix et acceptez sa <a href="{privacy}">politique de confidentialité</a>.',
  submit: 'Envoyer le message',
  statusMessage:
    'Merci ! Votre message a bien été reçu. (Formulaire de démonstration — aucun envoi réel.)',
};

type ContactContent = typeof fr;

const en: ContactContent = {
  metaTitle: 'Contact',
  metaDescription:
    'Get in touch with Victrix: our offices in Montréal, Québec, and Paris, by phone, by email, or through our form.',
  heroEyebrow: 'Get in touch',
  heroTitle: 'Contact us!',
  heroSub:
    'Have a question or a project? Don’t hesitate to reach out. Our experts are here to support you in your digital transformation.',
  infoTitle: 'Contact information',
  infoLabels: {
    montreal: 'Montréal',
    quebec: 'Québec',
    paris: 'Paris',
    tollFree: 'Toll-free',
    email: 'Email',
  },
  offices: [
    {
      city: 'Québec',
      lines: ['330 Rue Saint-Vallier Est, #130', 'Québec (QC), G1K 9C5'],
      image: '/images/contact/bureau-quebec.jpg',
    },
    {
      city: 'Montréal',
      lines: ['1100 Boul. René-Lévesque W, #1900', 'Montréal (QC), H3B 4N4'],
      image: '/images/contact/bureau-montreal.jpg',
    },
    {
      city: 'Paris',
      lines: ['9-15 rue Rouget de Lisle', 'Issy-les-Moulineaux, 92130'],
      image: '/images/contact/bureau-paris.jpg',
    },
  ],
  formTitle: 'Ready to move your organization forward?',
  formIntro:
    'Fill out the form and one of our IT experts will contact you shortly to discuss your challenges and goals.',
  formBullets: [
    'Personalized strategic consultation',
    'Certified multidisciplinary expertise',
    'End-to-end support',
  ],
  reqNote: 'Fields marked with an asterisk (*) are required.',
  labels: {
    firstName: 'First name',
    lastName: 'Last name',
    email: 'Email',
    phone: 'Phone',
    subject: 'What would you like to talk about?',
    subjectPlaceholder: 'Select a subject',
    expertise: 'Expertise',
    expertisePlaceholder: 'Select an expertise',
    request: 'Tell us more about your request',
    message: 'Message',
  },
  subjectOptions: ['A project', 'An area of expertise', 'A career', 'Other'],
  expertiseOptions: [
    'Strategic consulting',
    'Artificial intelligence',
    'Cybersecurity',
    'Cloud computing',
    'Infrastructure',
    'Managed services',
    'Other',
  ],
  consentText:
    'By submitting this form, you consent to receiving communications from Victrix and accept its <a href="{privacy}">privacy policy</a>.',
  submit: 'Send message',
  statusMessage:
    'Thank you! Your message has been received. (Demo form — nothing is actually sent.)',
};

export const contactContent: Record<Locale, ContactContent> = { fr, en };
