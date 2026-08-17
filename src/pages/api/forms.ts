/**
 * /api/forms — the forms backend (contrat « formulaires », docs/formulaires.md).
 *
 * POST: receives the no-JS <form method="POST"> submissions from the Bookshop
 * « form » sections (rendered as real forms only when PUBLIC_FORMS_ENABLED is
 * set). Locale-neutral on purpose, like /auth/*: under the "prefix both" i18n
 * routing, non-prefixed *pages* 404 but endpoints are served, and one endpoint
 * must serve both locales anyway (the hidden `lang` field disambiguates).
 *
 * Response contract — the visitor NEVER sees a raw error page:
 *   - success, demo mode, or honeypot → 303 See Other to /<lang>/merci/
 *   - validation or Turnstile failure → 303 back to the source page + ?erreur=1
 *   - anything unexpected            → 303 to the locale home + ?erreur=1
 * (303 forces the follow-up request to be a GET — a 302 after POST is
 * technically allowed to re-POST; 303 is the standard POST-redirect-GET code.)
 *
 * GET: a tiny JSON status. Required for TWO reasons: a quick smoke check in
 * production, and — critically — the STATIC_ONLY (CloudCannon) build
 * force-prerenders every route; a POST-only endpoint would emit no file there
 * (Astro only invokes GET at build time). With this GET the editing build
 * bakes a harmless status file instead.
 */
import type { APIRoute } from 'astro';
import {
  parseFormBody,
  parseNameList,
  sanitizeLang,
  sanitizeSourcePath,
  validateSubmission,
  formatSubmissionText,
  reflectCheckboxes,
  MAX_PAYLOAD_BYTES,
  TURNSTILE_TOKEN_FIELD,
  FORM_ID_FIELD,
  REQUIRED_LIST_FIELD,
  EMAIL_LIST_FIELD,
  CHECKBOX_LIST_FIELD,
} from '../../lib/forms/validation';
import {
  buildRegistry,
  resolveForm,
  requiredFieldNames,
  emailFieldNames,
  checkboxFieldNames,
  selectFieldViolations,
} from '../../lib/forms/registry';
import { verifyTurnstileToken } from '../../lib/forms/turnstile';
import { sendEmail } from '../../lib/forms/smtp2go';
import { confirmationEmail } from '../../lib/forms/confirmation';

// Registre des formulaires (« forms v2 ») — les définitions de src/data/forms/
// sont EMBARQUÉES dans le bundle au build (workerd n'a pas de système de
// fichiers) : c'est la liste blanche. Voir src/lib/forms/registry.ts.
const FORM_REGISTRY = buildRegistry(
  import.meta.glob('../../data/forms/**/*.json', { eager: true }) as Record<string, unknown>,
);

// On-demand (Cloudflare Pages Function), same idiom as src/pages/auth/*.
// STATIC_ONLY builds flip this back to prerendered — hence the GET above.
export const prerender = false;

/**
 * Runtime env lookup with a fallback chain, in order:
 *   1. `locals.runtime.env` — the documented Astro 5 Cloudflare-adapter home of
 *      Pages vars/secrets at runtime (workerd has NO process.env). `runtime`
 *      isn't declared on App.Locals (src/env.d.ts belongs to the portal
 *      workstream), so it's reached through a narrow structural cast.
 *   2. `import.meta.env` — `astro dev` / build-time .env values.
 *   3. `process.env` — plain-node fallback (guarded: absent in workerd).
 */
function envValue(locals: unknown, key: string): string | undefined {
  const runtimeEnv = (locals as { runtime?: { env?: Record<string, unknown> } } | undefined)
    ?.runtime?.env;
  const candidates: unknown[] = [
    runtimeEnv?.[key],
    (import.meta.env as Record<string, unknown>)[key],
    typeof process !== 'undefined' ? process.env?.[key] : undefined,
  ];
  for (const value of candidates) {
    if (typeof value === 'string' && value !== '') return value;
  }
  return undefined;
}

/** 303 See Other — the POST-redirect-GET status (see the header comment). */
function seeOther(location: string): Response {
  return new Response(null, { status: 303, headers: { Location: location } });
}

export const GET: APIRoute = () => {
  return new Response(
    JSON.stringify({ service: 'forms', status: 'ok' }),
    { status: 200, headers: { 'Content-Type': 'application/json; charset=utf-8' } },
  );
};

export const POST: APIRoute = async ({ request, locals }) => {
  // Last-resort target while `lang`/`source` are still unknown or untrusted.
  let failure = seeOther('/fr/?erreur=1');

  try {
    // Oversize guard BEFORE buffering the body: Content-Length first (cheap,
    // but optional/spoofable), then the decoded text length as the real check.
    const declared = Number(request.headers.get('content-length') ?? '0');
    if (declared > MAX_PAYLOAD_BYTES) return failure;
    const body = await request.text();
    if (body.length > MAX_PAYLOAD_BYTES) return failure;

    const fields = parseFormBody(body);
    const lang = sanitizeLang(fields['lang']);
    const source = sanitizeSourcePath(fields['source'], lang);
    // From here on, failures return the visitor to the form they came from.
    failure = seeOther(`${source}?erreur=1`);
    const thanks = seeOther(`/${lang}/merci/`);

    // Forms v2 — un `_formId` présent bascule le registre en source de vérité :
    // les listes requis/courriel annoncées par le client sont ÉCRASÉES par
    // celles dérivées de la définition (même dérivation de noms que la section,
    // src/lib/forms/field-name.ts), et un id inconnu est un échec de
    // validation (la liste blanche, c'est le registre).
    const formId = (fields[FORM_ID_FIELD] ?? '').trim();
    const formDef = formId !== '' ? resolveForm(FORM_REGISTRY, lang, formId) : undefined;
    if (formId !== '' && !formDef) {
      console.warn(`[api/forms] formId inconnu: ${lang}/${formId}`);
      return failure;
    }
    if (formDef) {
      // P-05 : les requis sont évalués AVEC les valeurs soumises — un champ
      // requis dont la condition d'affichage (showIf, définie dans le
      // formulaire) n'est pas satisfaite n'est pas exigé. Toujours depuis la
      // définition, jamais depuis une liste envoyée par le client.
      fields[REQUIRED_LIST_FIELD] = requiredFieldNames(formDef, fields).join(',');
      fields[EMAIL_LIST_FIELD] = emailFieldNames(formDef).join(',');
      fields[CHECKBOX_LIST_FIELD] = checkboxFieldNames(formDef).join(',');
    }

    const result = validateSubmission(fields);
    if (!result.ok) {
      console.warn('[api/forms] validation refusée:', result.errors.join(' | '));
      return failure;
    }
    // Honeypot tripped: PRETEND success (bots must not learn they were caught),
    // send nothing, store nothing.
    if (result.spam) return thanks;

    // P-05 — liste blanche des selects : une valeur hors des options de la
    // définition est un POST forgé (le <select> rendu n'offre que la liste).
    // Après le pot de miel : un robot pris ne doit rien apprendre de plus.
    if (formDef) {
      const selectErrors = selectFieldViolations(formDef, fields);
      if (selectErrors.length > 0) {
        console.warn('[api/forms] select refusé:', selectErrors.join(' | '));
        return failure;
      }
    }

    // Turnstile — verified only when the server secret is configured; without
    // it the widget (if any) is decorative and the honeypot is the only gate.
    const turnstileSecret = envValue(locals, 'TURNSTILE_SECRET_KEY');
    if (turnstileSecret) {
      const check = await verifyTurnstileToken(
        turnstileSecret,
        fields[TURNSTILE_TOKEN_FIELD] ?? '',
        // Pages puts the visitor IP here; optional but tightens the check.
        request.headers.get('cf-connecting-ip') ?? undefined,
      );
      if (!check.ok) {
        console.warn('[api/forms] turnstile refusé:', (check.errorCodes ?? []).join(', '));
        return failure;
      }
    }

    // P-05 — reflet des cases (Loi 25) : chaque case devient « oui »/« non »
    // dans le courriel, jamais d'omission silencieuse. Liste depuis la
    // définition (v2) ou depuis le champ `_cases` annoncé par la section
    // (mode inline, plomberie strippée du contenu par META_FIELDS).
    reflectCheckboxes(
      result.data,
      formDef ? checkboxFieldNames(formDef) : parseNameList(fields[CHECKBOX_LIST_FIELD]),
    );

    const text = formatSubmissionText(result.data, { lang, source });

    // Demo mode — any SMTP2GO var missing: log the would-be email server-side
    // (visible in the Pages Function logs / dev console) and still thank the
    // visitor. Lets the whole flow be demoed with zero provisioning.
    const apiKey = envValue(locals, 'SMTP2GO_API_KEY');
    // Destinataire PAR FORMULAIRE (défini dans src/data/forms/, jamais dans le
    // POST); '' dans la définition → repli sur le destinataire global.
    const to = formDef?.toEmail || envValue(locals, 'FORMS_TO_EMAIL');
    const from = envValue(locals, 'FORMS_FROM_EMAIL');
    const subject = formDef?.subject
      ? `${formDef.subject} — ${source} (${lang})`
      : `Formulaire victrix — ${source} (${lang})`;
    if (!apiKey || !to || !from) {
      console.log(
        `[api/forms] mode démo (SMTP2GO non configuré) — courriel simulé (destinataire: ${to ?? 'aucun'}, objet: ${subject}):\n${text}`,
      );
      return thanks;
    }

    const sent = await sendEmail({
      apiKey,
      to,
      from,
      subject,
      textBody: text,
    });
    if (!sent.ok) {
      // A failed SEND is an ops problem (quota, unverified sender…), not a
      // visitor mistake: log loudly, but don't bounce them back to retry —
      // that only trains double submissions.
      console.error('[api/forms] envoi SMTP2GO échoué:', sent.error);
    }

    // P-08 — courriel de confirmation au VISITEUR (2e envoi, indépendant du
    // premier). Adresse : le premier champ courriel dérivé de la DÉFINITION
    // (forms v2) ou de la liste `_courriels` annoncée par la section (mode
    // inline) — sa valeur a déjà passé la validation de format. Gabarit fixe
    // par langue (src/lib/forms/confirmation.ts) : rien du contenu soumis n'y
    // est recopié. Échec NON bloquant : la demande est reçue et notifiée.
    const visitorEmailField = (
      formDef ? emailFieldNames(formDef) : parseNameList(fields[EMAIL_LIST_FIELD])
    )[0];
    const visitorEmail = visitorEmailField ? result.data[visitorEmailField] : undefined;
    if (visitorEmail) {
      const confirmation = confirmationEmail(lang);
      const confirmed = await sendEmail({
        apiKey,
        to: visitorEmail,
        from,
        subject: confirmation.subject,
        textBody: confirmation.textBody,
      });
      if (!confirmed.ok) {
        console.error('[api/forms] envoi de confirmation (P-08) échoué:', confirmed.error);
      }
    }
    return thanks;
  } catch (err) {
    // Contract: never surface an HTML error page from this endpoint.
    console.error('[api/forms]', err);
    return failure;
  }
};
