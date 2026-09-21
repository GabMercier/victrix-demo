/**
 * Garde-fou H1 (Phase 2, 2026-09-16 — recette éditeur 09/09, point 6 / Lot 3).
 *
 * Chaque page publique doit porter EXACTEMENT un <h1>. Le héros de la page
 * le rend (titre ou surtitre selon `h1Element`) ; un éditeur qui empile deux
 * héros produit deux H1, une page composée sans héros n'en a aucun.
 *
 * Fonctions pures (testées par src/lib/h1-guard.test.ts), branchées dans
 * astro.config.mjs (`victrix:h1-guard`, astro:build:done) :
 *  - ≥ 2 H1  → ERREUR (le build échoue, le site en ligne reste intact) ;
 *  - 0 H1    → AVERTISSEMENT (journal de build) ;
 * Pages hors périmètre : stubs de redirection (meta refresh), 404, recherche,
 * portail, style-guide (vitrine volontairement multi-H1).
 */

const SKIP_PATH_RE = /(^|\/)(404\.html$|style-guide\/|recherche\/|search\/|portail\/|customer-portal\/|mon-portail\/)/;

/** Nombre de <h1> ouvrants dans une page HTML. */
export function countH1(html) {
  const m = html.match(/<h1(\s|>)/gi);
  return m ? m.length : 0;
}

/** Vrai si la page n'est qu'un stub de redirection (meta refresh). */
export function isRedirectStub(html) {
  return /<meta[^>]+http-equiv=["']?refresh/i.test(html);
}

/**
 * Verdict pour une page : 'skip' | 'ok' | 'warn' | 'error'.
 * @param {string} relPath chemin relatif dans dist (séparateurs `/`)
 * @param {string} html
 */
export function h1Verdict(relPath, html) {
  if (SKIP_PATH_RE.test(relPath) || isRedirectStub(html)) return 'skip';
  const n = countH1(html);
  if (n === 1) return 'ok';
  return n === 0 ? 'warn' : 'error';
}

/**
 * Audite une liste de pages [{ path, html }] → { ok, warnings, errors, skipped }.
 * `errors`/`warnings` = listes de chemins.
 */
export function auditPages(pages) {
  const out = { ok: 0, skipped: 0, warnings: [], errors: [] };
  for (const { path, html } of pages) {
    const v = h1Verdict(path, html);
    if (v === 'skip') out.skipped += 1;
    else if (v === 'ok') out.ok += 1;
    else if (v === 'warn') out.warnings.push(path);
    else out.errors.push(`${path} (${countH1(html)} H1)`);
  }
  return out;
}
