/**
 * Portal data-source selection — the single mock → real swap point for data.
 *
 * Default is the in-memory mock. Set `PORTAL_DATA=dataverse` to use the
 * Dataverse service (once implemented). The dashboard imports `portalData`
 * from here and is unaffected by the choice.
 */

import type { PortalDataService } from './types';
import { MockDataService } from './mock';
import { DataverseDataService } from './dataverse';

const SOURCE = (import.meta.env.PORTAL_DATA ?? 'mock').toLowerCase();

export const portalData: PortalDataService =
  SOURCE === 'dataverse' ? new DataverseDataService() : new MockDataService();

export type { Contract, ContractStatut, ClientProfile, PortalDataService } from './types';
