/**
 * MockDataService — hardcoded portal data for the prototype.
 * Returns a believable Victrix client profile + a few cybersecurity contracts.
 * Swap for the Dataverse service via src/lib/data/index.ts (see dataverse.ts).
 */

import type { ClientProfile, Contract, PortalDataService } from './types';

const PROFILE: ClientProfile = {
  name: 'Camille Tremblay',
  organisation: 'Ville de Saint-Aubin',
  courriel: 'camille.tremblay@ville-saint-aubin.qc.ca',
};

const CONTRACTS: Contract[] = [
  {
    numero: 'VTX-2023-0481',
    service: 'Surveillance SOC 24/7 (détection et réponse gérées)',
    statut: 'Actif',
    dateDebut: '2023-09-01',
    dateRenouvellement: '2025-09-01',
  },
  {
    numero: 'VTX-2024-0192',
    service: 'Test d’intrusion applicatif',
    statut: 'En renouvellement',
    dateDebut: '2024-02-15',
    dateRenouvellement: '2025-02-15',
  },
  {
    numero: 'VTX-2025-0033',
    service: 'Plan de réponse aux incidents et accompagnement',
    statut: 'Actif',
    dateDebut: '2025-01-10',
    dateRenouvellement: '2026-01-10',
  },
  {
    numero: 'VTX-2022-1130',
    service: 'Audit de conformité (Loi 25)',
    statut: 'Expiré',
    dateDebut: '2022-11-30',
    dateRenouvellement: '2024-11-30',
  },
];

export class MockDataService implements PortalDataService {
  async getProfile(_clientId: string): Promise<ClientProfile> {
    return { ...PROFILE };
  }

  async getContracts(_clientId: string): Promise<Contract[]> {
    return CONTRACTS.map((c) => ({ ...c }));
  }
}
