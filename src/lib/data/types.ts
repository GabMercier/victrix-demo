/**
 * Portal data contracts. The dashboard depends only on these; the source
 * (mock now, Dataverse/Dynamics or another API later) is selected in ./index.ts.
 */

export type ContractStatut = 'Actif' | 'En renouvellement' | 'Expiré';

export interface Contract {
  /** Client-facing contract number, e.g. "VTX-2024-0192". */
  numero: string;
  /** Service / offering name (FR). */
  service: string;
  statut: ContractStatut;
  /** ISO date (YYYY-MM-DD). */
  dateDebut: string;
  /** ISO date (YYYY-MM-DD). */
  dateRenouvellement: string;
}

export interface ClientProfile {
  name: string;
  organisation?: string;
  courriel?: string;
}

export interface PortalDataService {
  getProfile(clientId: string): Promise<ClientProfile>;
  getContracts(clientId: string): Promise<Contract[]>;
}
