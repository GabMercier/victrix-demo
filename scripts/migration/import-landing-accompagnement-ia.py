"""Import de la page de campagne « Accompagnement en IA » (FR + EN) — 2026-09-21.

Page Brizy CACHÉE du site WordPress (noindex, absente du plan de site — trouvée
en suivant les liens) :
  /expertise/intelligence-artificielle/accompagnement-ia/
  /en/expertise/artificial-intelligence/landing-ai-consulting/
Reprise comme page ENFANT de service, au même chemin : la redirection
`/expertise/*` → `/fr/services/*` y mène sans règle de plus. Elle reste `noindex`
(page de campagne, comme sur le site d'origine).

Brizy écrit ses sur-titres en paragraphes TOUT EN MAJUSCULES : on segmente la page
sur ces sur-titres, puis chaque segment va sur une section EXISTANTE :

  héros                        → service-hero
  VOS ENJEUX                   → rich-text (liste) + testimonial (citation signée)
  QUI ÊTES-VOUS ? (3 profils)  → numbered-cards
  POURQUOI VICTRIX             → numbered-cards (2 colonnes) + rich-text (certifications)
  CE QUE VOUS Y GAGNEZ         → offer-cards
  appel intermédiaire          → callout
  NOS CAPACITÉS                → tech-columns
  appel final                  → cta « nuit »
  formulaire Brizy             → NON repris : boutons → page Contact

Non repris : les deux photos d'ambiance des blocs « Qui êtes-vous » et « Pourquoi
Victrix » (aucune section texte + photo n'a ce gabarit) — à ajouter au CMS au besoin.

    python scripts/migration/import-landing-accompagnement-ia.py
    npm run build ; npm run fix:links ; npm run build ; npm run check:links -- --strict
"""
import html as htmllib
import importlib.util
import json
import os
import re
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
spec = importlib.util.spec_from_file_location('fournisseurs', os.path.join(HERE, 'import-pages-fournisseurs.py'))
base = importlib.util.module_from_spec(spec)
spec.loader.exec_module(base)

PAGES = {
    'fr': {
        'url': '/expertise/intelligence-artificielle/accompagnement-ia/',
        'file': 'fr/intelligence-artificielle/accompagnement-ia.json', 'slug': '',
        'cta': 'Planifiez une consultation', 'contact': '/fr/contact', 'certs': 'Nos certifications et désignations',
    },
    'en': {
        'url': '/en/expertise/artificial-intelligence/landing-ai-consulting/',
        'file': 'en/intelligence-artificielle/accompagnement-ia.json', 'slug': 'artificial-intelligence/landing-ai-consulting',
        'cta': 'Schedule a consultation', 'contact': '/en/contact', 'certs': None,
    },
}


def is_caps(text):
    letters = [c for c in text if c.isalpha()]
    return len(letters) >= 6 and sum(1 for c in letters if c.isupper()) / len(letters) > 0.9


def ul(items):
    return '<ul>' + ''.join(f'<li>{i}</li>' for i in items) + '</ul>'


def groups_of(items, with_lists=True):
    """[(h3, [p…], [li…])] à partir d'une suite de blocs."""
    out = []
    for kind, htm, _ in items:
        if kind == 'h3':
            out.append([base.plain(htm), [], []])
        elif out and kind == 'p':
            out[-1][1].append(htm)
        elif out and kind == 'li':
            out[-1][2].append(htm)
    return out


def build(lang):
    cfg = PAGES[lang]
    raw = base.fetch(base.BASE + cfg['url']).decode('utf8', 'ignore')
    seo_title = htmllib.unescape(re.search(r'<title>([^<]+)', raw).group(1)).strip()
    description = htmllib.unescape(re.search(r'<meta name="description" content="([^"]*)"', raw).group(1)).strip()
    parser = base.Blocks()
    parser.feed(raw)
    blocks = parser.out

    # segments : un sur-titre en majuscules ouvre un segment ; un h2 aussi (appels à l'action)
    segs = []
    for b in blocks:
        kind, htm, _ = b
        text = base.plain(htm) if kind != 'img' else ''
        if kind == 'p' and is_caps(text):
            segs.append({'label': text, 'h2': '', 'items': []})
        elif kind == 'h2':
            segs.append({'label': '', 'h2': text, 'items': []})
        elif segs:
            segs[-1]['items'].append(b)
    caps = [s for s in segs if s['label']]
    h2s = [s for s in segs if s['h2'] and not any(re.search(r'champs nécessaires|required', base.plain(b[1]), re.I) for b in s['items'] if b[0] != 'img')]
    if len(caps) != 9 or len(h2s) != 2:
        raise RuntimeError(f'{lang}: gabarit inattendu ({len(caps)} sur-titres, {len(h2s)} appels) — relire la page source')
    hero, enjeux, qui, p1, p2, p3, pourquoi, gains, capacites = caps
    mid, final = h2s
    ps = lambda seg: [b[1] for b in seg['items'] if b[0] == 'p']
    lis = lambda seg: [b[1] for b in seg['items'] if b[0] == 'li']

    hero_img = next((b for b in hero['items'] if b[0] == 'img'), None)
    h1 = next(base.plain(b[1]) for b in hero['items'] if b[0] == 'h1')
    hero_ps = ps(hero)
    sections = [{
        '_bookshop_name': 'service-hero', 'type': 'service-hero', 'eyebrow': hero['label'].capitalize(), 'titleAccent': '',
        'title': h1, 'titleHighlight': '', 'lead': base.plain(hero_ps[0]), 'ctaLabel': cfg['cta'], 'ctaHref': cfg['contact'],
        'image': base.local_image(hero_img[1]) if hero_img else '', 'imageAlt': hero_img[2] if hero_img else '',
    }]

    # VOS ENJEUX : titre, intro, liste ; puis la citation (« … ») signée : nom, fonction
    e_ps = ps(enjeux)
    q_at = next(i for i, p in enumerate(e_ps) if re.match(r'^\s*[«“"]', base.plain(p)))
    quote, (name, role) = e_ps[q_at:-2], [base.plain(p) for p in e_ps[-2:]]
    sections.append({'_bookshop_name': 'rich-text', 'type': 'rich-text', 'title': base.plain(e_ps[0]), 'fond': 'ivoire',
                     'paragraphs': hero_ps[1:] + e_ps[1:q_at] + [ul(lis(enjeux))]})
    role_parts = [x.strip() for x in role.rsplit(',', 1)]
    sections.append({'_bookshop_name': 'testimonial', 'type': 'testimonial', 'fond': 'beige',
                     'quote': ' '.join(base.plain(p).strip('«»“”"  ') for p in quote), 'name': name,
                     'role': role_parts[0], 'organization': role_parts[1] if len(role_parts) > 1 else '', 'photo': ''})

    # QUI ÊTES-VOUS : trois profils (sur-titre + h3 + paragraphes)
    q_ps = ps(qui)
    personas = []
    for n, seg in enumerate((p1, p2, p3), 1):
        (title, texts, _), = groups_of(seg['items'])[:1]
        personas.append({'number': f'{n:02d}', 'title': title, 'ctaLabel': '', 'ctaHref': '',
                         'text': f'<strong>{seg["label"].capitalize()}</strong><br><br>' + '<br><br>'.join(texts)})
    sections.append({'_bookshop_name': 'numbered-cards', 'type': 'numbered-cards', 'fond': 'ivoire', 'sectionTitle': base.plain(q_ps[0]),
                     'headingStyle': 'plain', 'intro': ' '.join(q_ps[1:]), 'tone': 'default', 'columns': '3',
                     'cardStyle': 'default', 'items': personas})

    # POURQUOI VICTRIX : arguments (h3 + p) ; le dernier h3 à liste = certifications
    w_ps = [b[1] for b in pourquoi['items'][:next(i for i, b in enumerate(pourquoi['items']) if b[0] == 'h3')] if b[0] == 'p']
    reasons = groups_of(pourquoi['items'])
    certs = [g for g in reasons if g[2]]
    sections.append({'_bookshop_name': 'numbered-cards', 'type': 'numbered-cards', 'fond': 'beige', 'sectionTitle': base.plain(w_ps[0]),
                     'headingStyle': 'plain', 'intro': ' '.join(w_ps[1:]), 'tone': 'tint', 'columns': '2', 'cardStyle': 'default',
                     'items': [{'number': f'{n:02d}', 'title': g[0], 'text': '<br><br>'.join(g[1]), 'ctaLabel': '', 'ctaHref': ''}
                               for n, g in enumerate([g for g in reasons if not g[2]], 1)]})
    for g in certs:
        sections.append({'_bookshop_name': 'rich-text', 'type': 'rich-text', 'title': g[0], 'fond': 'ivoire',
                         'paragraphs': g[1] + [ul(g[2])]})

    # CE QUE VOUS Y GAGNEZ : une carte par rôle, puces
    g_ps = ps(gains)
    sections.append({'_bookshop_name': 'offer-cards', 'type': 'offer-cards', 'title': base.plain(g_ps[0]), 'intro': ' '.join(g_ps[1:]),
                     'fond': 'beige', 'ctaLabel': '', 'ctaHref': '',
                     'items': [{'number': f'{n:02d}', 'title': g[0], 'bullets': [{'text': base.plain(li), 'icon': 'coche'} for li in g[2]]}
                               for n, g in enumerate(groups_of(gains['items']), 1)]})

    sections.append({'_bookshop_name': 'callout', 'type': 'callout', 'fond': 'ivoire', 'title': mid['h2'], 'body': '',
                     'ctaLabel': cfg['cta'], 'ctaHref': cfg['contact'], 'layout': 'box'})

    # NOS CAPACITÉS : colonnes (h3 + puces)
    c_ps = [b[1] for b in capacites['items'][:next(i for i, b in enumerate(capacites['items']) if b[0] == 'h3')] if b[0] == 'p']
    sections.append({'_bookshop_name': 'tech-columns', 'type': 'tech-columns', 'fond': 'beige', 'sectionTitle': base.plain(c_ps[0]),
                     'groups': [{'title': g[0], 'href': '', 'items': [base.plain(x) for x in g[1] + g[2]]}
                                for g in groups_of(capacites['items'])]})

    f_ps = [base.plain(p) for p in ps(final)]
    sections.append({'_bookshop_name': 'cta', 'type': 'cta', 'title': final['h2'],
                     'body': f_ps[0] if f_ps else '', 'ctaLabel': cfg['cta'], 'ctaHref': cfg['contact'],
                     'cta2Label': '', 'cta2Href': '', 'variant': 'nuit', 'fond': 'ivoire'})

    page = {'_schema': 'default', 'title': h1, 'description': description, 'noindex': True, 'slug': cfg['slug'],
            'seoTitle': seo_title, 'seoH1': '', 'contactSujet': '', 'contactService': '', 'sections': sections}
    dest = os.path.join(base.ROOT, 'src', 'content', 'services', *cfg['file'].split('/'))
    os.makedirs(os.path.dirname(dest), exist_ok=True)
    with open(dest, 'w', encoding='utf8', newline='\n') as fh:
        json.dump(page, fh, ensure_ascii=False, indent=2)
        fh.write('\n')
    return f'{lang}: {len(sections)} sections — {" > ".join(s["type"] for s in sections)}'


if __name__ == '__main__':
    for lang in PAGES:
        print(build(lang))
