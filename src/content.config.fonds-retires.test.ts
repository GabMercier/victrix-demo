import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { FOND_ALIAS, FOND_CLASSES, estFondSombre } from '../component-library/src/shared/fonds';
import { CIBLES, ROOT, fichiersJson, remplaceA, schemaDe } from '../tests/helpers/contenu-editable';

/**
 * UNE CLÉ DE FOND RETIRÉE NE CASSE PLUS LE BUILD (2026-09-22).
 *
 * L'INCIDENT, en clair. La fusion des deux aplats bleus a retiré la clé
 * `bleu-profond` de la liste fermée. Avant de la retirer, le contenu avait été
 * fouillé : zéro occurrence. Quatre heures après le déploiement, une
 * sauvegarde CloudCannon de Clément a écrit `bleu-profond` sur la page Dell
 * Technologies — son éditeur offrait encore l'option — et le build de
 * production a cassé sur `Invalid enum value […] received 'bleu-profond'`.
 *
 * LA LEÇON. « Zéro occurrence au moment du retrait » ne prouve RIEN : une liste
 * fermée est éditée en continu par des gens dont la session n'a pas la même
 * fraîcheur que le dépôt. Retirer une valeur d'un `z.enum` est donc un
 * changement CASSANT, au même titre qu'un `.min(1)` sur un champ vidable — la
 * quatrième porte de la même panne, après `null`, le texte vide et le select
 * effacé.
 *
 * LE CORRECTIF, en deux moitiés que ce test vérifie séparément :
 *  1. la clé retirée reste ACCEPTÉE par le schéma (elle ne casse plus rien) ;
 *  2. elle se RÉSOUT vers la clé en vigueur au rendu — sinon on aurait juste
 *     échangé un build rouge contre une section au fond blanc que personne ne
 *     verrait passer.
 *
 * Et une troisième moitié, la plus importante : une clé VRAIMENT inconnue doit
 * continuer d'échouer. La tolérance ne doit pas devenir un tapis sous lequel on
 * glisse les fautes de frappe.
 */
describe('une clé de fond retirée de la palette', () => {
  const alias = Object.entries(FOND_ALIAS);

  it('la table d’alias n’est pas vide — sinon ce test ne prouve rien', () => {
    expect(alias.length).toBeGreaterThan(0);
  });

  it.each(alias)('« %s » rend la MÊME chose que « %s »', (perimee, vigueur) => {
    // Les 36 composants lisent FOND_CLASSES[fond] en direct : si la table ne
    // résolvait pas l'alias, la section perdrait silencieusement son aplat.
    expect(FOND_CLASSES[perimee]).toBeDefined();
    expect(FOND_CLASSES[perimee]).toBe(FOND_CLASSES[vigueur]);
  });

  it.each(alias)('« %s » garde le caractère sombre de « %s »', (perimee, vigueur) => {
    // Un fond sombre fait inverser les textes en blanc. Perdre ce drapeau
    // donnerait du texte blanc sur fond clair — illisible, et invisible en CI.
    expect(estFondSombre(perimee)).toBe(estFondSombre(vigueur));
  });

  /**
   * Le vrai test de non-régression : on rejoue l'incident. On prend une section
   * réelle qui porte un `fond`, on y écrit la clé retirée, et on exige que la
   * validation PASSE. C'est exactement ce que CloudCannon a produit.
   */
  it('valide contre le schéma réel, là où le build avait cassé', () => {
    const cas: Array<{ fichier: string; chemin: string }> = [];

    for (const { dossier, collection } of CIBLES) {
      const schema = schemaDe(collection);
      for (const fichier of fichiersJson(join(ROOT, dossier))) {
        let donnees: unknown;
        try {
          donnees = JSON.parse(readFileSync(fichier, 'utf8'));
        } catch {
          continue;
        }
        const sections = (donnees as { sections?: unknown[] })?.sections;
        if (!Array.isArray(sections)) continue;

        const index = sections.findIndex(
          (s) => s && typeof s === 'object' && typeof (s as { fond?: unknown }).fond === 'string',
        );
        if (index === -1) continue;

        for (const [perimee] of alias) {
          const modifie = remplaceA(donnees, `sections[${index}].fond`, perimee);
          const issue = schema.safeParse(modifie);
          if (!issue.success) {
            cas.push({ fichier, chemin: `sections[${index}].fond = ${perimee}` });
          }
        }
        break; // une section par fichier suffit : c'est le schéma qu'on teste
      }
    }

    expect(cas, `Clés retirées REFUSÉES par le schéma :\n${cas.map((c) => `  ${c.fichier} — ${c.chemin}`).join('\n')}`).toEqual([]);
  });

  it('mais une clé VRAIMENT inconnue reste refusée', () => {
    // La tolérance ne doit pas avaler les fautes de frappe : « beig » pour
    // « beige » doit continuer de faire échouer la validation, bruyamment.
    // On balaie TOUTES les cibles : la première collection n'a pas forcément
    // de section à fond, et un test qui ne trouve rien ne prouve rien.
    let trouve: { schema: ReturnType<typeof schemaDe>; donnees: unknown; index: number } | null =
      null;

    for (const { dossier, collection } of CIBLES) {
      for (const f of fichiersJson(join(ROOT, dossier))) {
        let donnees: { sections?: unknown[] };
        try {
          donnees = JSON.parse(readFileSync(f, 'utf8'));
        } catch {
          continue;
        }
        const index = (donnees.sections ?? []).findIndex(
          (s) => s && typeof s === 'object' && typeof (s as { fond?: unknown }).fond === 'string',
        );
        if (index === -1) continue;
        trouve = { schema: schemaDe(collection), donnees, index };
        break;
      }
      if (trouve) break;
    }

    expect(trouve, 'aucune section avec un fond — le test ne prouverait rien').not.toBeNull();

    const { schema, donnees, index } = trouve as NonNullable<typeof trouve>;
    const modifie = remplaceA(donnees, `sections[${index}].fond`, 'beig');
    expect(schema.safeParse(modifie).success).toBe(false);
  });
});
