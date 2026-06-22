/**
 * DataverseDataService — STUB for the real portal data source.
 *
 * Where the Dynamics/Dataverse Web API (or any backend) plugs in. Called
 * SERVER-SIDE with the signed-in client's identity, so a client only ever sees
 * their own records. To enable: implement the two methods, then set the
 * `PORTAL_DATA=dataverse` env var (see src/lib/data/index.ts).
 */

import type { ClientProfile, Contract, PortalDataService } from './types';

/**
 * TODO(real): fill from the Dataverse environment. Store as env vars, not in repo.
 */
const DATAVERSE = {
  // e.g. "https://<org>.crm3.dynamics.com/api/data/v9.2"
  apiUrl: '' /* TODO(real): Dataverse Web API base URL */,
  // Logical names of the table + columns that back portal contracts.
  contractsEntitySet: 'vtx_contracts' /* TODO(real): confirm entity set name */,
};

export class DataverseDataService implements PortalDataService {
  async getProfile(_clientId: string): Promise<ClientProfile> {
    // TODO(real): GET a contact/account by the signed-in user's id and map →
    // ClientProfile. Acquire a token for the Dataverse scope server-side (e.g.
    // on-behalf-of the user, or a confidential client) — never expose it to the
    // browser.
    throw new Error('DataverseDataService.getProfile not implemented — set PORTAL_DATA=mock or implement this.');
  }

  async getContracts(_clientId: string): Promise<Contract[]> {
    // TODO(real): query the contracts entity filtered to THIS client, e.g.
    //   GET `${DATAVERSE.apiUrl}/${DATAVERSE.contractsEntitySet}` +
    //       `?$select=vtx_numero,vtx_service,vtx_statut,vtx_datedebut,vtx_daterenouvellement` +
    //       `&$filter=_vtx_client_value eq ${clientId}`
    // then map each row → Contract. Enforce row-level access server-side.
    throw new Error('DataverseDataService.getContracts not implemented — set PORTAL_DATA=mock or implement this.');
  }
}
