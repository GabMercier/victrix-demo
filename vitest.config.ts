import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';

// Unit tests for pure logic (i18n helpers, session-cookie crypto). These need
// no Astro/Vite pipeline, so a plain node environment keeps them fast.
export default defineConfig({
  // `astro:content` est un module VIRTUEL du pipeline Astro : absent de
  // l'environnement `node`. Le test « champs vidés » (2026-09-22, lot L01) doit
  // pourtant valider contre les schemas REELS de src/content.config.ts -- une
  // copie deriverait. Doublures minimales dans tests/stubs/ (voir leur entete).
  resolve: {
    alias: {
      'astro:content': fileURLToPath(new URL('./tests/stubs/astro-content.ts', import.meta.url)),
      'astro/loaders': fileURLToPath(new URL('./tests/stubs/astro-loaders.ts', import.meta.url)),
    },
  },
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts'],
    setupFiles: ['./vitest.setup.ts'],
  },
});
