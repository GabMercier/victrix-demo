import { describe, expect, it } from 'vitest';
import {
  CONSENT_MAX_AGE_DAYS,
  CONSENT_REVISION,
  cookieDomains,
  isAnalyticsCookie,
  readConsent,
  serializeConsent,
} from './record';

const NOW = new Date('2026-09-21T12:00:00.000Z');
const daysAgo = (n: number) => new Date(NOW.getTime() - n * 86_400_000);

describe('consentement — enregistrement du choix', () => {
  it('relit un choix qu’il vient d’écrire', () => {
    const record = readConsent(serializeConsent('accepted', NOW), NOW);
    expect(record).toEqual({ choice: 'accepted', date: NOW.toISOString(), revision: CONSENT_REVISION });
    expect(readConsent(serializeConsent('refused', NOW), NOW)?.choice).toBe('refused');
  });

  it('redemande quand rien n’est stocké ou que le format est inconnu', () => {
    expect(readConsent(null, NOW)).toBeNull();
    expect(readConsent('', NOW)).toBeNull();
    expect(readConsent('{pas du json', NOW)).toBeNull();
    expect(readConsent('42', NOW)).toBeNull();
    expect(readConsent(JSON.stringify({ choice: 'peut-etre', date: NOW.toISOString(), revision: 1 }), NOW)).toBeNull();
  });

  it('redemande pour l’ancien format (chaîne nue, sans date)', () => {
    expect(readConsent('accepted', NOW)).toBeNull();
    expect(readConsent('refused', NOW)).toBeNull();
  });

  it('périme le choix après la durée maximale, pas avant', () => {
    expect(readConsent(serializeConsent('accepted', daysAgo(CONSENT_MAX_AGE_DAYS - 1)), NOW)?.choice).toBe('accepted');
    expect(readConsent(serializeConsent('accepted', daysAgo(CONSENT_MAX_AGE_DAYS + 1)), NOW)).toBeNull();
    expect(readConsent(serializeConsent('refused', daysAgo(CONSENT_MAX_AGE_DAYS + 1)), NOW)).toBeNull();
  });

  it('redemande si la date est invalide ou dans le futur', () => {
    expect(readConsent(JSON.stringify({ choice: 'accepted', date: 'hier', revision: CONSENT_REVISION }), NOW)).toBeNull();
    expect(readConsent(serializeConsent('accepted', daysAgo(-2)), NOW)).toBeNull();
  });

  it('redemande quand la révision a changé (portée du consentement modifiée)', () => {
    const old = JSON.stringify({ choice: 'accepted', date: NOW.toISOString(), revision: CONSENT_REVISION - 1 });
    expect(readConsent(old, NOW)).toBeNull();
  });
});

describe('consentement — témoins à effacer au refus', () => {
  it('reconnaît les témoins GA4 et rien d’autre', () => {
    for (const name of ['_ga', '_ga_ABC123', '_gid', '_gat', '_gat_gtag_UA_1', '_gac_UA-1', '_gcl_au']) {
      expect(isAnalyticsCookie(name), name).toBe(true);
    }
    for (const name of ['victrix-consent', 'cf_clearance', 'session', 'ga']) {
      expect(isAnalyticsCookie(name), name).toBe(false);
    }
  });

  it('couvre l’hôte et ses domaines parents', () => {
    expect(cookieDomains('www.victrix.ca')).toEqual(['', 'www.victrix.ca', '.www.victrix.ca', '.victrix.ca']);
    expect(cookieDomains('victrix.ca')).toEqual(['', 'victrix.ca', '.victrix.ca']);
    expect(cookieDomains('localhost')).toEqual(['', 'localhost']);
    expect(cookieDomains('127.0.0.1')).toEqual(['', '127.0.0.1']);
  });
});
