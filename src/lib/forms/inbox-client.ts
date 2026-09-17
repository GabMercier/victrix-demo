/**
 * Mode « inbox » — côté NAVIGATEUR : à la soumission d'un formulaire marqué
 * [data-inbox-form], compose l'objet du courriel (`_subject`) depuis les
 * valeurs saisies et pose le Reply-To (`_replyto`) = courriel du visiteur.
 * Le FORMAT vit dans inbox.ts (pur, testé) ; ici seulement la lecture du DOM,
 * pilotée par les attributs data-inbox-* posés au build par les trois
 * gabarits (form.astro, contact.astro, ressources/index.astro) :
 *
 *   data-inbox-prefix    clé du formulaire (inboxFormKey) — obligatoire
 *   data-inbox-sujet     name d'un <select> dont l'option choisie porte
 *                        data-key (clé neutre du sujet, presets.ts) → « /clé »
 *   data-inbox-details   names (virgules) dont les valeurs forment la partie
 *                        lisible, jointes par « · »
 *   data-inbox-name      names (virgules) joints par un espace = nom du visiteur
 *   data-inbox-fallback  name de repli quand le nom est vide (courriel)
 *   data-inbox-replyto   name du champ courriel copié dans `_replyto`
 *
 * Progressive enhancement : sans ce module, `_subject` garde sa valeur
 * statique et `_replyto` n'est pas envoyé. L'écouteur `submit` ne se
 * déclenche qu'après la validation native (jamais sur un envoi refusé) et ne
 * bloque rien : le POST natif suit (data-astro-reload). Lié sur
 * astro:page-load (le ClientRouter remplace le DOM à chaque navigation) ;
 * idempotent (data-inbox-bound).
 */
import { composeInboxSubject } from './inbox';

const splitNames = (raw: string | undefined): string[] =>
  (raw ?? '')
    .split(',')
    .map((name) => name.trim())
    .filter(Boolean);

function valueOf(form: HTMLFormElement, name: string): string {
  const el = form.elements.namedItem(name);
  if (
    el instanceof HTMLInputElement ||
    el instanceof HTMLSelectElement ||
    el instanceof HTMLTextAreaElement
  ) {
    return el.value ?? '';
  }
  return '';
}

/** Clé neutre (data-key) de l'option choisie d'une liste déroulante, ou ''. */
function selectedKey(form: HTMLFormElement, name: string): string {
  const el = form.elements.namedItem(name);
  if (!(el instanceof HTMLSelectElement)) return '';
  const option = el.selectedOptions[0];
  return option ? (option.dataset.key ?? '') : '';
}

/** Lie tous les formulaires [data-inbox-form] de `root` (idempotent). */
export function bindInboxForms(root: ParentNode = document): void {
  root.querySelectorAll<HTMLFormElement>('form[data-inbox-form]').forEach((form) => {
    if (form.dataset.inboxBound) return;
    form.dataset.inboxBound = '1';
    form.addEventListener('submit', () => {
      const ds = form.dataset;
      const subjectInput = form.elements.namedItem('_subject');
      if (subjectInput instanceof HTMLInputElement) {
        subjectInput.value = composeInboxSubject({
          key: ds.inboxPrefix ?? '',
          sujetKey: ds.inboxSujet ? selectedKey(form, ds.inboxSujet) : '',
          details: splitNames(ds.inboxDetails).map((name) => valueOf(form, name)),
          name: splitNames(ds.inboxName)
            .map((name) => valueOf(form, name).trim())
            .filter(Boolean)
            .join(' '),
          fallback: ds.inboxFallback ? valueOf(form, ds.inboxFallback) : '',
          staticSubject: subjectInput.defaultValue,
        });
      }
      const email = ds.inboxReplyto ? valueOf(form, ds.inboxReplyto).trim() : '';
      if (email) {
        const existing = form.elements.namedItem('_replyto');
        const reply =
          existing instanceof HTMLInputElement
            ? existing
            : form.appendChild(
                Object.assign(document.createElement('input'), { type: 'hidden', name: '_replyto' }),
              );
        reply.value = email;
      }
    });
  });
}
