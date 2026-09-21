import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import {
  ICONS,
  ICON_KEYS,
  LEGACY_ICON_ALIASES,
  LEGACY_ICON_KEYS,
  iconFor,
  iconSvgAttrs,
  type IconDef,
} from '../../component-library/src/shared/icons';

// Banque de pictogrammes UNIQUE (2026-09-18) — component-library/src/shared/
// icons.ts. Ces tests gardent trois promesses : la banque est saine, le
// balisage des pictogrammes au trait reste celui des maquettes, et AUCUNE
// valeur d'icône du contenu ne sort de la banque (une clé inconnue ne casse
// pas le build — iconFor renvoie null — mais l'icône disparaîtrait en silence).

function* jsonFiles(dir: string): Generator<string> {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) yield* jsonFiles(p);
    else if (name.endsWith('.json')) yield p;
  }
}

describe('banque de pictogrammes (shared/icons.ts)', () => {
  it('clés en minuscules-traits-d’union, uniques, chacune avec au moins un tracé', () => {
    expect(ICON_KEYS.length).toBeGreaterThanOrEqual(34);
    expect(new Set(ICON_KEYS).size).toBe(ICON_KEYS.length);
    for (const key of ICON_KEYS) {
      expect(key).toMatch(/^[a-z]+(-[a-z]+)*$/);
      const icon: IconDef = ICONS[key];
      expect(icon.paths.length).toBeGreaterThan(0);
      for (const d of icon.paths) expect(d).toMatch(/^[Mm]/);
    }
  });

  it('iconFor : clé vide, absente ou inconnue → null ; clé connue → son dessin', () => {
    expect(iconFor('')).toBeNull();
    expect(iconFor(undefined)).toBeNull();
    expect(iconFor(null)).toBeNull();
    expect(iconFor('inconnue')).toBeNull();
    expect(iconFor('coche')).toBe(ICONS.coche);
  });

  it('anciennes clés tolérées : résolues vers la banque, jamais homonymes d’une clé vivante', () => {
    expect(iconFor('insigne')).toBe(ICONS.coche);
    expect(iconFor('personnes')).toBe(ICONS.groupe);
    expect(iconFor('engrenages')).toBe(ICONS['engrenage-horloge']);
    for (const legacy of LEGACY_ICON_KEYS) {
      expect(ICON_KEYS as string[]).not.toContain(legacy);
      expect(ICON_KEYS as string[]).toContain(LEGACY_ICON_ALIASES[legacy]);
    }
  });

  it('attributs au trait : ordre et valeurs du balisage historique des composants', () => {
    expect(Object.entries(iconSvgAttrs(ICONS.coche, 1.8))).toEqual([
      ['viewBox', '0 0 24 24'],
      ['fill', 'none'],
      ['stroke', 'currentColor'],
      ['stroke-width', '1.8'],
      ['stroke-linecap', 'round'],
      ['stroke-linejoin', 'round'],
    ]);
  });

  it('glyphes pleins : fill currentColor, viewBox propre, aucun attribut de trait', () => {
    expect(iconSvgAttrs(ICONS.organisation, 2)).toEqual({ viewBox: '0 0 20 18', fill: 'currentColor' });
    expect(iconSvgAttrs(ICONS.coeur, 2)).toEqual({ viewBox: '0 0 24 24', fill: 'currentColor' });
    expect(ICONS.organisation.w).toBe(20);
  });

  it('contenu : toute valeur `icon` / `watermark` d’une section est une clé de la banque', () => {
    const known = new Set<string>([...ICON_KEYS, ...LEGACY_ICON_KEYS]);
    const unknown: string[] = [];
    const visit = (node: unknown, file: string, type: string) => {
      if (Array.isArray(node)) return node.forEach((n) => visit(n, file, type));
      if (!node || typeof node !== 'object') return;
      const record = node as Record<string, unknown>;
      const here = typeof record.type === 'string' ? record.type : type;
      for (const [key, value] of Object.entries(record)) {
        if ((key === 'icon' || key === 'watermark') && typeof value === 'string' && value !== '') {
          if (!known.has(value)) unknown.push(`${file} [${here}] ${key}=${value}`);
        } else visit(value, file, here);
      }
    };
    for (const file of jsonFiles('src/content')) {
      const data = JSON.parse(readFileSync(file, 'utf8')) as { sections?: unknown };
      visit(data.sections ?? [], file, '');
    }
    expect(unknown).toEqual([]);
  });
});
