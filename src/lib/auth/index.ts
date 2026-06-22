/**
 * Auth provider selection — the single mock → real swap point for auth.
 *
 * Default is the MockAuthProvider (no secrets, works out of the box). To go
 * live with Entra External ID, set the `AUTH_PROVIDER=entra` env var (and fill
 * the Entra config in entra.ts). Everything else imports `auth` from here and
 * is unaffected by the choice.
 */

import type { AuthProvider } from './types';
import { MockAuthProvider } from './mock';
import { EntraAuthProvider } from './entra';

const PROVIDER = (import.meta.env.AUTH_PROVIDER ?? 'mock').toLowerCase();

export const auth: AuthProvider =
  PROVIDER === 'entra' ? new EntraAuthProvider() : new MockAuthProvider();

export type { AuthProvider, Session, SessionUser } from './types';
