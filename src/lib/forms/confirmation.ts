/**
 * P-08 — courriel de confirmation au VISITEUR (2e envoi SMTP2GO, après la
 * notification à l'équipe — src/pages/api/forms.ts).
 *
 * Gabarit texte par langue, volontairement SOBRE : on ne recopie PAS les
 * réponses du visiteur (un texte fixe ne peut pas servir d'injection de
 * contenu, et ne divulgue rien si la boîte de réception est compromise).
 * L'échec de CET envoi est non bloquant (journalisé côté serveur) : la
 * soumission est déjà reçue et notifiée à l'équipe — un courriel de courtoisie
 * raté ne doit jamais renvoyer le visiteur en erreur.
 *
 * Le sans-frais 1-888-680-8181 est le même que la carte Coordonnées de la
 * page Contact (gabarit — neutre de langue).
 */

export interface ConfirmationEmail {
  subject: string;
  textBody: string;
}

const FR: ConfirmationEmail = {
  subject: 'Nous avons bien reçu votre message — Victrix',
  textBody: [
    'Bonjour,',
    '',
    'Nous confirmons la réception de votre message. Un membre de notre équipe vous répondra dans les meilleurs délais.',
    '',
    'Si votre demande est urgente, appelez-nous sans frais au 1-888-680-8181.',
    '',
    'Merci de votre confiance,',
    'L’équipe Victrix',
    '',
    '— Ce message automatique confirme uniquement la réception de votre soumission sur notre site. Vos renseignements sont recueillis et utilisés pour traiter votre demande, conformément à la Loi 25.',
  ].join('\n'),
};

const EN: ConfirmationEmail = {
  subject: 'We have received your message — Victrix',
  textBody: [
    'Hello,',
    '',
    'This confirms that we have received your message. A member of our team will get back to you as soon as possible.',
    '',
    'If your request is urgent, call us toll-free at 1-888-680-8181.',
    '',
    'Thank you for your trust,',
    'The Victrix team',
    '',
    '— This automated message only confirms that your submission was received. Your information is collected and used to process your request, in accordance with Law 25.',
  ].join('\n'),
};

/** Gabarit de confirmation pour la langue demandée (repli : FR). */
export function confirmationEmail(lang: string): ConfirmationEmail {
  return lang === 'en' ? EN : FR;
}
