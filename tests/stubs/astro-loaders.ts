/**
 * Doublure de `astro/loaders` pour les tests unitaires (2026-09-22, lot L01).
 *
 * `src/content.config.ts` appelle `glob({ pattern, base })` pour déclarer OÙ
 * vivent les fichiers d'une collection. Le test « champs vidés » lit les
 * fichiers lui-même et ne se sert que des SCHÉMAS : le chargeur n'a donc rien à
 * charger, il doit seulement exister et rendre sa configuration inspectable —
 * le test s'en sert pour vérifier qu'aucun dossier de contenu n'échappe à sa
 * table de correspondance.
 */
export interface GlobConfig {
  pattern: string | string[];
  base: string;
  generateId?: (options: { entry: string }) => string;
}

export const glob = (config: GlobConfig) => ({ name: 'glob', config });
