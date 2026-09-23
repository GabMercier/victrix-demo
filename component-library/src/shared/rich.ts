/**
 * Texte enrichi des sections (Phase 1 « texte enrichi partout », 2026-09-16).
 *
 * Les champs texte des sections (lead, intro, description, text, body, quote,
 * paragraphes…) sont édités dans CloudCannon avec une entrée `type: html`
 * (barre d'outils WYSIWYG : gras, italique, lien — et paragraphes/listes pour
 * les champs « bloc »). La valeur stockée est du HTML. Deux façons de le
 * rendre, selon l'élément qui l'accueille :
 *
 *  - `inlineHtml(v)` — le texte vit DANS un `<p>`/`<span>` existant du
 *    composant (carte, citation, chapeau). L'éditeur enveloppe toujours sa
 *    valeur dans `<p>…</p>` : on retire cet emballage et on joint plusieurs
 *    paragraphes par `<br>` pour ne jamais imbriquer un bloc dans un `<p>`.
 *  - `blockHtml(v)` — le texte vit dans un `<div class="rich">` : paragraphes
 *    et listes autorisés ; un texte nu (sans balise bloc) est enveloppé dans
 *    un `<p>` pour garder le rythme vertical.
 *
 *  - `sanitizeRichHtml(v)` — filet de sécurité AU BUILD (content.config.ts,
 *    appliqué à toutes les chaînes des collections) : seules les balises et
 *    attributs de la liste blanche survivent ; tout le reste (style="…",
 *    <div>, <script>, classes inconnues) est retiré en gardant le texte. Un
 *    collage depuis Word ne peut donc pas casser la mise en page. Les
 *    composants ne dépendent PAS de ce filtre (l'éditeur visuel rend la
 *    valeur brute) — il protège le site construit.
 *
 * Module VOLONTAIREMENT sans dépendance et sans API DOM : il tourne aussi
 * dans le navigateur (édition en direct Bookshop/CloudCannon).
 */

/** Balises conservées par le filtre (minuscules). */
const ALLOWED_TAGS = new Set([
  'p',
  'br',
  'strong',
  'b',
  'em',
  'i',
  'u',
  's',
  'a',
  'ul',
  'ol',
  'li',
  'h3',
  'h4',
  'blockquote',
  'span',
  'sub',
  'sup',
]);

/** Attributs conservés, par balise. `class` n'est gardé que sur `<a>` (boutons). */
const ALLOWED_ATTRS: Record<string, Set<string>> = {
  a: new Set(['href', 'target', 'rel', 'title', 'class']),
};

/** Classes autorisées sur un lien : les styles « bouton » du site. */
const ALLOWED_LINK_CLASSES = new Set(['btn', 'btn-outline']);

const ATTR_RE = /([a-zA-Z][\w:-]*)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'>]+)))?/g;

/** Balises dont le CONTENU disparaît aussi (code, styles, cadres). */
const DROP_WITH_CONTENT_RE = /<(script|style|iframe|object|embed)\b[^>]*>[\s\S]*?<\/\1\s*>/gi;

/** Une vraie balise n'a jamais d'espace après `<` : « a < b » reste du texte. */
const TAG_RE = /<(\/?)([a-zA-Z][a-zA-Z0-9]*)([^>]*)>/g;

function rebuildAttrs(tag: string, raw: string): string {
  const allowed = ALLOWED_ATTRS[tag];
  if (!allowed) return '';
  let out = '';
  for (const m of raw.matchAll(ATTR_RE)) {
    const name = m[1].toLowerCase();
    if (!allowed.has(name)) continue;
    let value = m[2] ?? m[3] ?? m[4] ?? '';
    if (name === 'href' && /^\s*javascript:/i.test(value)) continue;
    if (name === 'class') {
      value = value
        .split(/\s+/)
        .filter((c) => ALLOWED_LINK_CLASSES.has(c))
        .join(' ');
      if (!value) continue;
    }
    out += ` ${name}="${value.replace(/"/g, '&quot;')}"`;
  }
  return out;
}

/**
 * Filtre liste-blanche. Les balises inconnues disparaissent (leur contenu
 * reste, sauf script/style/iframe) ; les attributs non listés aussi. Idempotent.
 */
export function sanitizeRichHtml(value: string): string {
  if (!value || value.indexOf('<') === -1) return value;
  const stripped = value.replace(DROP_WITH_CONTENT_RE, '');
  return stripped.replace(TAG_RE, (_m, slash: string, name: string, rest: string) => {
    const tag = name.toLowerCase();
    if (!ALLOWED_TAGS.has(tag)) return '';
    if (slash) return `</${tag}>`;
    if (tag === 'br') return '<br>';
    return `<${tag}${rebuildAttrs(tag, rest)}>`;
  });
}

const BLOCK_TAG_RE = /<(p|ul|ol|li|h[1-6]|blockquote|div)\b/i;

/**
 * Valeur d'un champ rendu DANS un élément en ligne (`<p>`, `<span>`) : retire
 * l'emballage `<p>` de l'éditeur, joint les paragraphes par `<br>`, retire les
 * listes/titres éventuels (non prévus en contexte inline : leur texte reste).
 */
export function inlineHtml(value: string | null | undefined): string {
  if (!value) return '';
  let v = String(value).trim();
  if (v.indexOf('<') === -1) return v;
  // <p>a</p><p>b</p>  →  a<br>b
  v = v
    .replace(/^\s*<p[^>]*>/i, '')
    .replace(/<\/p>\s*$/i, '')
    .replace(/<\/p>\s*<p[^>]*>/gi, '<br>');
  // Blocs résiduels (liste collée dans un champ inline) : on garde le texte.
  v = v
    .replace(/<\/?(ul|ol|h[1-6]|blockquote|div)\b[^>]*>/gi, '')
    .replace(/<li\b[^>]*>/gi, '')
    .replace(/<\/li>/gi, '<br>');
  return v.replace(/(<br>\s*)+$/i, '').trim();
}

/**
 * Valeur d'un champ rendu dans un conteneur bloc (`<div class="rich">`) :
 * un texte sans balise bloc est enveloppé dans un `<p>` ; sinon tel quel.
 */
export function blockHtml(value: string | null | undefined): string {
  if (!value) return '';
  const v = String(value).trim();
  if (!v) return '';
  return BLOCK_TAG_RE.test(v) ? v : `<p>${v}</p>`;
}

/**
 * ESPACES INSÉCABLES devant les signes doubles (2026-09-23, demande Gabriel).
 *
 * En typographie française, `: ; ! ? »` sont précédés d'une espace, et `«` en
 * est suivi. Avec une espace ORDINAIRE, le navigateur a le droit de couper la
 * ligne juste avant le signe : un « : » se retrouve alors seul en tête de
 * ligne, ce qui se voit surtout dans les grands titres. L'insécable l'interdit.
 *
 * Appliqué AU RENDU (renderer partagé) plutôt qu'au contenu : l'éditrice tape
 * une espace normale au CMS — comme tout le monde — et le site pose
 * l'insécable. Corriger les 26 titres d'aujourd'hui n'aurait rien réglé pour
 * le 27ᵉ.
 *
 * SANS EFFET EN ANGLAIS, et c'est ce qui rend la règle sûre à appliquer
 * partout sans tester la langue : l'anglais colle ses deux-points au mot
 * (« Title: subtitle »), il n'y a donc aucune espace à remplacer. Mesuré sur
 * tout le contenu : 26 occurrences en français, 0 en anglais.
 *
 * Ne touche ni aux URL (`https://`, `tel:` n'ont pas d'espace devant le
 * signe), ni aux espaces déjà insécables.
 */
export function insecables(value: string): string {
  return value.replace(/ ([:;!?»])/g, ' $1').replace(/(«) /g, '$1 ');
}

/**
 * Applique `insecables` à TOUTES les chaînes d'une valeur de section, aussi
 * profond qu'elle aille (titres, textes, items, sous-objets). Les autres types
 * (booléens, nombres, null) sont rendus tels quels.
 */
export function typographieFr<T>(valeur: T): T {
  if (typeof valeur === 'string') return insecables(valeur) as unknown as T;
  if (Array.isArray(valeur)) return valeur.map((v) => typographieFr(v)) as unknown as T;
  if (valeur && typeof valeur === 'object') {
    const out: Record<string, unknown> = {};
    for (const [cle, val] of Object.entries(valeur as Record<string, unknown>)) {
      out[cle] = typographieFr(val);
    }
    return out as unknown as T;
  }
  return valeur;
}

/** Vrai si la valeur contient au moins un caractère visible (hors balises). */
export function hasRichText(value: string | null | undefined): boolean {
  return !!value && String(value).replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').trim().length > 0;
}
