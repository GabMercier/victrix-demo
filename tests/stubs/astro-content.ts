/**
 * Doublure de `astro:content` pour les tests unitaires (2026-09-22, lot L01).
 *
 * Pourquoi : `src/content.config.ts` est la SEULE source de vérité des schémas,
 * et le test « champs vidés » doit valider contre ces schémas-là, pas contre une
 * copie qui dériverait. Or `astro:content` est un module VIRTUEL, fourni par le
 * pipeline Astro : il n'existe pas dans l'environnement `node` de vitest
 * (vitest.config.ts). On l'aiguille donc ici.
 *
 * La doublure est fidèle sur les deux seules choses que `content.config.ts`
 * importe : `z` (c'est le zod d'Astro lui-même, via `astro/zod` — même version,
 * mêmes messages) et `defineCollection`, dont la vraie implémentation se borne
 * à renvoyer sa configuration. Rien n'est simulé au-delà.
 */
import { z } from 'astro/zod';

export { z };

/** `defineCollection` d'Astro = identité (elle ne sert qu'au typage). */
export const defineCollection = <T>(config: T): T => config;
