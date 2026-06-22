/// <reference types="astro/client" />

/** Project env flags — the mock → real swap points (see the lib index modules). */
interface ImportMetaEnv {
  /** Auth provider: 'mock' (default) | 'entra'. */
  readonly AUTH_PROVIDER?: string;
  /** Portal data source: 'mock' (default) | 'dataverse'. */
  readonly PORTAL_DATA?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

declare namespace App {
  interface Locals {
    /** Set by src/middleware.ts on guarded portal routes. */
    session?: import('./lib/auth/types').Session | null;
  }
}
