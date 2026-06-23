import { defineConfig } from 'vitest/config';

// Unit tests for pure logic (i18n helpers, session-cookie crypto). These need
// no Astro/Vite pipeline, so a plain node environment keeps them fast.
export default defineConfig({
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts'],
    setupFiles: ['./vitest.setup.ts'],
  },
});
