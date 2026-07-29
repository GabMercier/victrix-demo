import { describe, expect, it } from 'vitest';
import { isWithinWindow } from './schedule';

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
