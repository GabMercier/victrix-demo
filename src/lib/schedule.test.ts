import { describe, expect, it } from 'vitest';
import { isWithinWindow, pickActiveAnnounce } from './schedule';

const now = new Date('2026-07-30T12:00:00Z');

describe('isWithinWindow', () => {
  it('sans bornes : toujours visible', () => {
    expect(isWithinWindow(now)).toBe(true);
    expect(isWithinWindow(now, '', '')).toBe(true);
    expect(isWithinWindow(now, '   ', '')).toBe(true);
  });

  it('borne de début : INCLUSE', () => {
    expect(isWithinWindow(now, '2026-07-30T12:00:00Z')).toBe(true); // pile au début
    expect(isWithinWindow(now, '2026-07-30T12:00:01Z')).toBe(false); // 1 s avant
    expect(isWithinWindow(now, '2026-01-01')).toBe(true); // passée
  });

  it('borne de fin : EXCLUE', () => {
    expect(isWithinWindow(now, '', '2026-07-30T12:00:00Z')).toBe(false); // pile à la fin
    expect(isWithinWindow(now, '', '2026-07-30T12:00:01Z')).toBe(true); // 1 s avant la fin
    expect(isWithinWindow(now, '', '2030-01-01')).toBe(true); // future
  });

  it('fenêtre complète', () => {
    expect(isWithinWindow(now, '2026-07-01', '2026-08-01')).toBe(true);
    expect(isWithinWindow(now, '2026-08-01', '2026-09-01')).toBe(false); // pas commencée
    expect(isWithinWindow(now, '2026-06-01', '2026-07-01')).toBe(false); // terminée
  });

  it('date invalide = pas de borne (défensif — zod la refuse au build)', () => {
    expect(isWithinWindow(now, 'pas-une-date', 'n/importe')).toBe(true);
  });
});

// Fabrique compacte : id + surcharges (enabled par défaut, sans bornes).
const banner = (id: string, extra: Partial<Parameters<typeof pickActiveAnnounce>[0][number]> = {}) => ({
  id,
  enabled: true,
  startAt: '',
  endAt: '',
  ...extra,
});

describe('pickActiveAnnounce', () => {
  it('liste vide ou tout désactivé : aucune bannière (normal ET staticOnly)', () => {
    expect(pickActiveAnnounce([], now)).toBeUndefined();
    expect(pickActiveAnnounce([], now, true)).toBeUndefined();
    const offs = [banner('a', { enabled: false }), banner('b', { enabled: false })];
    expect(pickActiveAnnounce(offs, now)).toBeUndefined();
    expect(pickActiveAnnounce(offs, now, true)).toBeUndefined();
  });

  it('une seule bannière active sans bornes : choisie', () => {
    expect(pickActiveAnnounce([banner('promo')], now)?.id).toBe('promo');
  });

  it('fenêtre : pas-commencée et terminée sont exclues', () => {
    const entries = [
      banner('future', { startAt: '2026-08-01' }), // après now (2026-07-30)
      banner('passee', { endAt: '2026-07-01' }),
      banner('courante', { startAt: '2026-07-01', endAt: '2026-08-01' }),
    ];
    expect(pickActiveAnnounce(entries, now)?.id).toBe('courante');
  });

  it('chevauchement : la plus récemment COMMENCÉE gagne', () => {
    const entries = [
      banner('ancienne', { startAt: '2026-06-01' }),
      banner('recente', { startAt: '2026-07-15' }),
    ];
    expect(pickActiveAnnounce(entries, now)?.id).toBe('recente');
    // L'ordre d'entrée est indifférent.
    expect(pickActiveAnnounce([...entries].reverse(), now)?.id).toBe('recente');
  });

  it('startAt vide (« depuis toujours ») perd contre toute bannière datée', () => {
    const entries = [banner('permanente'), banner('datee', { startAt: '2026-07-01' })];
    expect(pickActiveAnnounce(entries, now)?.id).toBe('datee');
  });

  it('égalité de startAt : id alphabétique, quel que soit l’ordre d’entrée', () => {
    const entries = [
      banner('zebre', { startAt: '2026-07-01' }),
      banner('alpha', { startAt: '2026-07-01' }),
    ];
    expect(pickActiveAnnounce(entries, now)?.id).toBe('alpha');
    expect(pickActiveAnnounce([...entries].reverse(), now)?.id).toBe('alpha');
  });

  it('staticOnly (éditeur visuel) : fenêtre ignorée, mais pas l’interrupteur', () => {
    const entries = [
      banner('future', { startAt: '2030-01-01' }),
      banner('eteinte', { enabled: false }),
    ];
    // Une bannière à venir reste visible pour l'éditeur…
    expect(pickActiveAnnounce(entries, now, true)?.id).toBe('future');
    // …mais une bannière désactivée jamais ; premier id « Affichée » gagne.
    const plusieurs = [banner('b'), banner('a', { enabled: false }), banner('c')];
    expect(pickActiveAnnounce(plusieurs, now, true)?.id).toBe('b');
  });

  it('startAt invalide = sans borne (défensif — zod la refuse au build)', () => {
    const entries = [banner('cassee', { startAt: 'pas-une-date' }), banner('datee', { startAt: '2026-07-01' })];
    expect(pickActiveAnnounce(entries, now)?.id).toBe('datee');
  });
});
