/**
 * Nom de champ HTML stable dérivé du libellé — LOGIQUE PARTAGÉE entre la
 * section Bookshop « form » (component-library/.../form/form.astro, rendue
 * dans le NAVIGATEUR par l'éditeur visuel CloudCannon) et le serveur (registre
 * des formulaires, src/lib/forms/registry.ts, consommé par /api/forms). Les
 * deux côtés DOIVENT dériver le même nom du même libellé — c'est le contrat
 * qui permet au serveur de reconstruire les listes de champs requis/courriel
 * depuis la définition du formulaire, sans faire confiance au client.
 *
 * Uniquement des opérations de chaînes, AUCUN import : ce module doit rester
 * exécutable tel quel dans le bundle d'édition en direct de CloudCannon
 * (même règle que JsonLd.astro — voir faq.astro).
 *
 * Dérivation : accents décomposés puis retirés (NFD), minuscules, tout le
 * reste → tirets. Libellé vide → repli positionnel (« champ-N »). La plage
 * des diacritiques (U+0300 à U+036F, détachés par NFD) est construite via
 * fromCharCode plutôt qu'écrite en littéral : des caractères combinants
 * invisibles dans la source seraient trop faciles à corrompre.
 */
const DIACRITIQUES = new RegExp(
  `[${String.fromCharCode(0x0300)}-${String.fromCharCode(0x036f)}]`,
  'g',
);

export function fieldName(label: string, index: number): string {
  const slug = (label ?? '')
    .normalize('NFD')
    .replace(DIACRITIQUES, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return slug || `champ-${index + 1}`;
}
