/**
 * Mode des formulaires — UN seul endroit qui lit PUBLIC_FORMS_ENABLED, partagé
 * par form.astro (section « form »), contact.astro et la carte infolettre.
 *
 * Trois valeurs (2026-09-16, ajout du mode « inbox ») :
 *   - absente / autre → 'none'   : maquette non fonctionnelle (bouton inerte),
 *                                  zéro changement visuel — le défaut.
 *   - "1"             → 'worker' : vrai <form method="POST" action="/api/forms">
 *                                  (Function Cloudflare + SMTP2GO, Turnstile).
 *   - "inbox"         → 'inbox'  : vrai <form method="POST"> dont l'action est
 *                                  la page Merci de la langue ; l'hébergement
 *                                  CloudCannon intercepte le POST, l'enregistre
 *                                  dans la boîte de réception (Inbox) liée au
 *                                  site, le transmet aux destinataires configurés
 *                                  là-bas, puis redirige vers l'action. Aucun
 *                                  récepteur à déployer. La boîte visée est
 *                                  choisie par le champ caché `inbox_key`
 *                                  (obligatoire quand la boîte n'est pas celle
 *                                  par défaut du site).
 *
 * Pur (aucun import Astro) : testable en node nu (mode.test.ts) et compilable
 * dans le bundle navigateur de l'éditeur visuel, comme field-name.ts.
 */
export type FormsBackend = 'none' | 'worker' | 'inbox';

export type FormsEnv = Record<string, string | undefined>;

/** Lit PUBLIC_FORMS_ENABLED (voir l'entête). */
export function formsBackend(env: FormsEnv): FormsBackend {
  const v = (env.PUBLIC_FORMS_ENABLED ?? '').trim().toLowerCase();
  if (v === '1') return 'worker';
  if (v === 'inbox') return 'inbox';
  return 'none';
}

/**
 * Attribut `action` du <form> : undefined en maquette (le <form> reste sans
 * action, parité octet), /api/forms côté worker, la page Merci de la langue
 * côté inbox (CloudCannon redirige vers l'action une fois le POST capté).
 */
export function formAction(backend: FormsBackend, lang: string): string | undefined {
  if (backend === 'worker') return '/api/forms';
  if (backend === 'inbox') return `/${lang === 'en' ? 'en' : 'fr'}/merci/`;
  return undefined;
}

/**
 * Clé de boîte de réception CloudCannon à émettre (champ caché `inbox_key`) :
 * la clé de la DÉFINITION du formulaire (src/data/forms/<lang>/<id>.json,
 * champ « Boîte de réception CloudCannon ») si renseignée, sinon la clé par
 * défaut du site (variable de build PUBLIC_FORMS_INBOX_KEY — une par
 * environnement : dev, staging, prod), sinon '' = boîte par défaut du site
 * (pas de champ caché émis).
 */
export function resolveInboxKey(definitionKey: string | undefined, env: FormsEnv): string {
  const own = (definitionKey ?? '').trim();
  if (own !== '') return own;
  return (env.PUBLIC_FORMS_INBOX_KEY ?? '').trim();
}

/**
 * Clé de site Cloudflare Turnstile à rendre (widget) : PUBLIC_TURNSTILE_SITE_KEY
 * dès qu'un VRAI formulaire existe (worker OU inbox, 2026-09-18), jamais en
 * maquette. Qui vérifie le jeton : côté worker, /api/forms (TURNSTILE_SECRET_KEY) ;
 * côté inbox, la boîte CloudCannon elle-même (fournisseur Turnstile + clé
 * secrète réglés sur la boîte, « Require CAPTCHA » coché sur le lien site ↔
 * boîte — docs/formulaires.md §7). Ordre obligatoire : widget rendu (clé de
 * site posée + build) AVANT de cocher « Require CAPTCHA », sinon toute
 * soumission reçoit la page 401 CloudCannon.
 */
export function resolveTurnstileSiteKey(backend: FormsBackend, env: FormsEnv): string {
  if (backend === 'none') return '';
  return (env.PUBLIC_TURNSTILE_SITE_KEY ?? '').trim();
}
