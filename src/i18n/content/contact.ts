/**
 * Copy for the Contact page, FR + EN. Template: src/pages/[lang]/contact.astro.
 * Phone numbers/emails are locale-neutral and stay in the template; only
 * human-readable text lives here. `consentText` is HTML (privacy-policy link,
 * localized at render) rendered with set:html.
 */

import type { Locale } from '../config';

const fr = {
  metaTitle: 'Contact',
  metaDescription:
    'Communiquez avec Victrix : nos bureaux de Montréal, Québec et Paris, par téléphone, par courriel ou via notre formulaire.',
  heroTitle: 'Contactez-nous',
  heroSub: 'Vous avez une question ou un projet ? N’hésitez pas à nous écrire.',
  infoTitle: 'Nos coordonnées',
  infoLabels: {
    montreal: 'Montréal',
    quebec: 'Québec',
    paris: 'Paris',
    tollFree: 'Sans frais',
    facebookAria: 'Victrix sur Facebook',
    linkedinAria: 'Victrix sur LinkedIn',
  },
  formTitle: 'Écrivez-nous',
  reqNote: 'Les champs marqués d’un astérisque (*) sont obligatoires.',
  labels: {
    firstName: 'Prénom',
    lastName: 'Nom',
    email: 'Courriel',
    phone: 'Téléphone',
    subjectLegend: 'Que souhaitez-vous aborder ?',
    subjectProjet: 'Un projet',
    subjectExpertise: 'Une expertise',
    subjectAutre: 'Autre',
    message: 'Message',
  },
  consentText:
    'En soumettant ce formulaire, je consens à recevoir des communications de Victrix et j’accepte sa <a href="{privacy}">politique de confidentialité</a>.',
  submit: 'Envoyer le message',
  statusMessage:
    'Merci ! Votre message a bien été reçu. (Formulaire de démonstration — aucun envoi réel.)',
  officesTitle: 'Nos bureaux',
  mapNote: 'Carte interactive — espace réservé',
  mapAria: 'Carte de localisation des bureaux (espace réservé)',
  offices: [
    { city: 'Montréal', lines: ['1100, boul. René-Lévesque Ouest, bureau 1900', 'Montréal (Québec) H3B 4N4'] },
    { city: 'Québec', lines: ['330, rue Saint-Vallier Est, bureau 130', 'Québec (Québec) G1K 9C5'] },
    { city: 'Paris', lines: ['France'] },
  ],
};

type ContactContent = typeof fr;

const en: ContactContent = {
  metaTitle: 'Contact',
  metaDescription:
    'Get in touch with Victrix: our offices in Montréal, Québec, and Paris, by phone, by email, or through our form.',
  heroTitle: 'Contact us',
  heroSub: 'Have a question or a project? Don’t hesitate to write to us.',
  infoTitle: 'Our contact information',
  infoLabels: {
    montreal: 'Montréal',
    quebec: 'Québec',
    paris: 'Paris',
    tollFree: 'Toll-free',
    facebookAria: 'Victrix on Facebook',
    linkedinAria: 'Victrix on LinkedIn',
  },
  formTitle: 'Write to us',
  reqNote: 'Fields marked with an asterisk (*) are required.',
  labels: {
    firstName: 'First name',
    lastName: 'Last name',
    email: 'Email',
    phone: 'Phone',
    subjectLegend: 'What would you like to discuss?',
    subjectProjet: 'A project',
    subjectExpertise: 'An area of expertise',
    subjectAutre: 'Other',
    message: 'Message',
  },
  consentText:
    'By submitting this form, I consent to receiving communications from Victrix and I accept its <a href="{privacy}">privacy policy</a>.',
  submit: 'Send message',
  statusMessage:
    'Thank you! Your message has been received. (Demo form — nothing is actually sent.)',
  officesTitle: 'Our offices',
  mapNote: 'Interactive map — placeholder',
  mapAria: 'Office location map (placeholder)',
  offices: [
    { city: 'Montréal', lines: ['1100, boul. René-Lévesque Ouest, Suite 1900', 'Montréal (Québec) H3B 4N4'] },
    { city: 'Québec', lines: ['330, rue Saint-Vallier Est, Suite 130', 'Québec (Québec) G1K 9C5'] },
    { city: 'Paris', lines: ['France'] },
  ],
};

export const contactContent: Record<Locale, ContactContent> = { fr, en };
