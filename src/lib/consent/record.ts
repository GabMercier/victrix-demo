/**
 * Consentement Loi 25 — l'ENREGISTREMENT du choix (2026-09-21).
 *
 * Le bandeau maison (`src/components/ConsentBanner.astro`) remplace Axeptio.
 * Décision du 21/09 : on FINIT ce bandeau plutôt que d'embarquer une
 * bibliothèque — GA4 est le seul traceur prévu, une fenêtre de préférences par
 * catégorie n'aurait rien à montrer (à revoir si ZoomInfo/Clarity reviennent :
 * `docs/plan-consentement-loi25.md`).
 *
 * Ce module est la partie PURE (testée) : format du choix mémorisé, péremption,
 * témoins à effacer au refus. Browser-safe, aucune dépendance.
 *
 * Format (`localStorage['victrix-consent']`) :
 *   {"choice":"accepted"|"refused","date":"<ISO>","revision":1}
 *  - `date`     : le choix PÉRIME après `CONSENT_MAX_AGE_DAYS` → redemandé ;
 *  - `revision` : à INCRÉMENTER quand la portée change (nouveau traceur, nouvelle
 *    catégorie) → tout le monde est redemandé.
 * L'ancien format (chaîne nue « accepted »/« refused », sans date) est traité
 * comme une absence de choix : on redemande.
 *
 * Limite assumée (à écrire dans la politique) : la trace vit dans le navigateur
 * du visiteur ; il n'y a PAS de registre côté serveur (hébergement statique).
 */

export const CONSENT_KEY = 'victrix-consent';
export const CONSENT_REVISION = 1;
/** ≈ 6 mois — durée recommandée pour redemander le consentement. */
export const CONSENT_MAX_AGE_DAYS = 182;

export type ConsentChoice = 'accepted' | 'refused';

export interface ConsentRecord {
  choice: ConsentChoice;
  date: string;
  revision: number;
}

export function serializeConsent(choice: ConsentChoice, now: Date = new Date()): string {
  const record: ConsentRecord = { choice, date: now.toISOString(), revision: CONSENT_REVISION };
  return JSON.stringify(record);
}

/**
 * Choix VALIDE mémorisé, ou `null` s'il faut (re)demander : rien de stocké,
 * format inconnu ou ancien, révision dépassée, choix périmé, date dans le futur.
 */
export function readConsent(raw: string | null | undefined, now: Date = new Date()): ConsentRecord | null {
  if (!raw) return null;
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return null;
  }
  if (!parsed || typeof parsed !== 'object') return null;
  const { choice, date, revision } = parsed as Partial<ConsentRecord>;
  if (choice !== 'accepted' && choice !== 'refused') return null;
  if (revision !== CONSENT_REVISION) return null;
  const at = typeof date === 'string' ? Date.parse(date) : NaN;
  if (Number.isNaN(at)) return null;
  const ageDays = (now.getTime() - at) / 86_400_000;
  if (ageDays < 0 || ageDays > CONSENT_MAX_AGE_DAYS) return null;
  return { choice, date: date as string, revision };
}

/** Témoins de mesure d'audience (GA4) à effacer quand le visiteur refuse. */
export function isAnalyticsCookie(name: string): boolean {
  return /^(_ga|_gid|_gat|_gac_|_gcl_)/.test(name);
}

/**
 * Domaines sur lesquels tenter l'effacement : GA4 pose ses témoins sur le
 * domaine enregistrable (`.victrix.ca`), pas sur l'hôte (`www.victrix.ca`) —
 * un témoin ne s'efface qu'avec le MÊME domaine que celui de sa pose.
 * `www.victrix.ca` → ['', 'www.victrix.ca', '.www.victrix.ca', '.victrix.ca'].
 */
export function cookieDomains(hostname: string): string[] {
  const domains = ['', hostname];
  const parts = hostname.split('.');
  if (parts.length < 2 || /^[\d.]+$/.test(hostname)) return domains;
  for (let i = 0; i <= parts.length - 2; i += 1) domains.push(`.${parts.slice(i).join('.')}`);
  return domains;
}
