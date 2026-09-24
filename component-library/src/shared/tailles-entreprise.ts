/**
 * Tranches d'effectif — SOURCE UNIQUE (2026-09-21).
 *
 * Reprend la qualification de l'ancien formulaire « évaluation de posture de
 * sécurité » (src/data/forms/<lang>/campagne-evaluation.json), retiré de la
 * page Cybersécurité au profit d'un renvoi vers le formulaire Contact unique :
 * la section `contact-qualifier` pose un lien par tranche
 * (`/<lang>/contact?taille=<libellé>`) et le Contact rouvre le champ
 * correspondant quand « Service » vaut Cybersécurité.
 *
 * Les libellés voyagent DANS l'URL et doivent donc être identiques des deux
 * côtés — c'est un accord de VALEURS, pas de clés : `companySizeOptions` de
 * src/data/contact/<lang>.json et le champ « Taille de l'entreprise » de
 * src/data/forms/<lang>/contact.json. Le test
 * src/lib/contact/tailles-entreprise.test.ts compare les trois, et les deux
 * listes sont masquées dans CloudCannon (`_inputs … hidden`) pour qu'une
 * reformulation ne les désaligne pas en silence.
 *
 * Les tranches couvrent tout l'éventail : PAS d'option « Autre » (toute
 * entreprise a un effectif) — l'ancien formulaire en avait une, doublée d'un
 * champ texte « Précisez la taille » devenu inutile.
 *
 * Fichier browser-safe (aucun import) : utilisable tel quel dans le bundle
 * d'édition en direct de CloudCannon.
 */
export const TAILLES_ENTREPRISE = {
  fr: [
    'Moins de 50 employés',
    '50 à 249 employés',
    '250 à 999 employés',
    '1 000 employés et plus',
  ],
  en: [
    'Fewer than 50 employees',
    '50 to 249 employees',
    '250 to 999 employees',
    '1,000 employees or more',
  ],
} as const;

export type LangueTaille = keyof typeof TAILLES_ENTREPRISE;

/** Tranches de la langue d'une URL de contact (`/en/…` → en, sinon fr). */
export function taillesPourHref(href: string): readonly string[] {
  return /^\/en(\/|$)/.test(href ?? '') ? TAILLES_ENTREPRISE.en : TAILLES_ENTREPRISE.fr;
}
