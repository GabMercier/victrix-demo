"""Import des pages « fournisseur » (Approvisionnement TI) du site WordPress — 2026-09-21.

Les 9 pages FR + 9 pages EN sous /expertise/approvisionnement-ti/ (Check Point,
Microsoft, ServiceNow, CrowdStrike, Zscaler, Cisco, Palo Alto, Dell, HPE) ont été
bâties avec Brizy : la migration d'origine les avait REPORTÉES
(docs/migration/staging/services/rapport-expertises.md) et elles n'ont jamais
été reprises — la redirection /expertise/* les envoyait donc vers un 404.

Elles partagent UN gabarit ; ce script le lit dans le HTML publié et le pose sur
des sections EXISTANTES (aucun nouveau composant) :

  accroche + h1 + chapeau + image   → service-hero
  « chef de file » : 3 chiffres      → stats        (+ paragraphes → rich-text)
  bandeau d'appel                    → callout
  solutions (h3 + paragraphes)       → numbered-cards
  avis Gartner Peer Insights         → testimonial-cards
  « votre partenaire stratégique »   → rich-text
  appel final                        → cta « nuit »
  formulaire Brizy (#product-form)   → NON repris : boutons → page Contact

Rejouable : réécrit les 18 fichiers à chaque passage (le contenu fait foi sur le
site WordPress tant que la bascule n'a pas eu lieu). Après la bascule, NE PLUS
LE LANCER — l'éditrice travaille dans CloudCannon.

    python scripts/migration/import-pages-fournisseurs.py
    npm run build ; npm run fix:links ; npm run build ; npm run check:links -- --strict

(`fix:links` ramène les liens d'articles de l'ancien site — `/sase-cloud/` — vers
`/fr/ressources/…` ; les liens `/expertise/…` sont déjà réécrits ici.)
"""
import json
import os
import re
import sys
import urllib.request
from html.parser import HTMLParser

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
BASE = 'https://www.victrix.ca'
VENDORS = [
    'check-point', 'solutions-microsoft', 'servicenow', 'crowdstrike-falcon', 'zscaler',
    'cisco', 'palo-alto-networks', 'dell-technologies', 'hpe-networking',
]
EN_SLUG = {'solutions-microsoft': 'microsoft-solutions'}
TXT = {
    'fr': {'eyebrow': 'Approvisionnement TI', 'demo': 'Demandez une démo', 'contact': '/fr/contact',
           'quote': 'Demandez une estimation', 'service': 'Approvisionnement TI'},
    'en': {'eyebrow': 'IT Procurement', 'demo': 'Request a demo', 'contact': '/en/contact',
           'quote': 'Request a quote', 'service': 'IT Procurement'},
}
SKIP = {'script', 'style', 'noscript', 'svg', 'header', 'footer', 'nav', 'form'}
BLOCK = {'h1', 'h2', 'h3', 'h4', 'h5', 'p', 'li'}
INLINE = {'strong': 'strong', 'b': 'strong', 'em': 'em', 'i': 'em'}


def new_href(href):
    """URL de l'ancien site → URL FINALE du nouveau (règle 7 du CLAUDE.md)."""
    if href.startswith(BASE):
        href = href[len(BASE):]
    if not href.startswith('/'):
        return href
    m = re.match(r'^/en/expertise/(.*)$', href)
    if m:
        return '/en/services/' + m.group(1)
    m = re.match(r'^/expertise/(.*)$', href)
    if m:
        return '/fr/services/' + m.group(1)
    return href


class Blocks(HTMLParser):
    """Blocs de texte (titres, paragraphes) avec leur HTML en ligne, et images."""

    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.skip, self.cur, self.buf, self.out = 0, None, [], []

    def handle_starttag(self, tag, attrs):
        a = dict(attrs)
        if tag in SKIP:
            self.skip += 1
        if self.skip:
            return
        if tag in BLOCK and self.cur is None:
            self.cur, self.buf = tag, []
        elif self.cur and tag in INLINE:
            self.buf.append(f'<{INLINE[tag]}>')
        elif self.cur and tag == 'a' and a.get('href') and not a['href'].startswith('#'):
            self.buf.append(f'<a href="{new_href(a["href"])}">')
            self.open_a = True
        elif self.cur and tag == 'br':
            self.buf.append(' ')
        if tag == 'img':
            src = a.get('src') or a.get('data-src') or ''
            if src and not src.startswith('data:'):
                self.out.append(('img', src, a.get('alt', '')))

    def handle_endtag(self, tag):
        if tag in SKIP:
            self.skip = max(0, self.skip - 1)
            return
        if self.skip:
            return
        if self.cur and tag in INLINE:
            self.buf.append(f'</{INLINE[tag]}>')
        elif self.cur and tag == 'a' and getattr(self, 'open_a', False):
            self.buf.append('</a>')
            self.open_a = False
        if tag == self.cur:
            html = re.sub(r'\s+', ' ', ''.join(self.buf)).strip()
            html = re.sub(r'<(strong|em)>\s*</\1>', '', html)
            if re.sub(r'<[^>]+>', '', html).strip():
                self.out.append((tag, html, ''))
            self.cur = None

    def handle_data(self, data):
        if self.cur and not self.skip:
            self.buf.append(data.replace('&', '&amp;').replace('<', '&lt;').replace('>', '&gt;'))


def fetch(url):
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
    return urllib.request.urlopen(req, timeout=40).read()


def plain(html):
    return re.sub(r'<[^>]+>', '', html).replace('&amp;', '&').replace('&lt;', '<').replace('&gt;', '>').strip()


def local_image(src):
    """Télécharge l'image dans public/ au même chemin /wp-content/… (convention du dépôt)."""
    path = src[len(BASE):] if src.startswith(BASE) else src
    if not path.startswith('/wp-content/'):
        return ''
    dest = os.path.join(ROOT, 'public', *path.strip('/').split('/'))
    if not os.path.exists(dest):
        os.makedirs(os.path.dirname(dest), exist_ok=True)
        with open(dest, 'wb') as fh:
            fh.write(fetch(BASE + path))
    return path


def build(lang, vendor):
    slug = EN_SLUG.get(vendor, vendor) if lang == 'en' else vendor
    url = f'{BASE}/en/expertise/it-procurement/{slug}/' if lang == 'en' else f'{BASE}/expertise/approvisionnement-ti/{slug}/'
    html = fetch(url).decode('utf8', 'ignore')
    t = TXT[lang]
    title_tag = re.search(r'<title>([^<]+)', html)
    desc_tag = re.search(r'<meta name="description" content="([^"]*)"', html)
    unescape = HTMLParser().unescape if hasattr(HTMLParser, 'unescape') else __import__('html').unescape
    seo_title = unescape(title_tag.group(1)).strip() if title_tag else ''
    description = unescape(desc_tag.group(1)).strip() if desc_tag else ''

    parser = Blocks()
    parser.feed(html)
    blocks = parser.out

    # --- avant le premier h2 : accroche, h1, chapeau, image de héros
    first_h2 = next(i for i, b in enumerate(blocks) if b[0] == 'h2')
    head = blocks[:first_h2]
    tagline = next((plain(b[1]) for b in head if b[0] == 'h4'), '')
    h1 = next(plain(b[1]) for b in head if b[0] == 'h1')
    h1_at = next(i for i, b in enumerate(head) if b[0] == 'h1')
    lead = [b[1] for b in head[h1_at:] if b[0] == 'p']
    hero_imgs = [b for b in blocks[:first_h2 + 1] if b[0] == 'img' and 'logo' not in (b[1] + b[2]).lower()]
    if not hero_imgs:  # l'image suit parfois le premier h2
        hero_imgs = [b for b in blocks if b[0] == 'img' and 'logo' not in (b[1] + b[2]).lower()]
    image, image_alt = (local_image(hero_imgs[0][1]), hero_imgs[0][2]) if hero_imgs else ('', '')

    # --- segments par h2
    segs = []
    for b in blocks[first_h2:]:
        if b[0] == 'h2':
            segs.append({'title': plain(b[1]), 'items': []})
        elif b[0] != 'img':
            segs[-1]['items'].append(b)
    count = lambda seg, kind: sum(1 for b in seg['items'] if b[0] == kind)
    is_form = lambda seg: any(re.search(r'champs nécessaires|required fields|indicates required', plain(b[1]), re.I) for b in seg['items'])
    segs = [s for s in segs if not is_form(s)]
    stats_seg = segs[0]
    reviews = next((s for s in segs[1:] if count(s, 'h5') >= 2), None)
    solutions = max((s for s in segs[1:] if s is not reviews), key=lambda s: count(s, 'h3'))
    others = [s for s in segs[1:] if s is not reviews and s is not solutions]

    sections = [{
        '_bookshop_name': 'service-hero', 'type': 'service-hero', 'eyebrow': t['eyebrow'], 'titleAccent': '',
        'title': h1, 'titleHighlight': '', 'lead': plain(lead[0]) if lead else '', 'ctaLabel': t['demo'],
        'ctaHref': t['contact'], 'image': image, 'imageAlt': image_alt,
    }]

    # chiffres : h3 = valeur, p suivant = libellé ; le reste = texte
    numbers, body, items = [], [], stats_seg['items']
    i = 0
    while i < len(items):
        kind, htm, _ = items[i]
        if kind == 'h3' and i + 1 < len(items) and items[i + 1][0] == 'p':
            numbers.append({'number': plain(htm), 'label': plain(items[i + 1][1]), 'icon': ''})
            i += 2
            continue
        if kind == 'p':
            body.append(htm)
        i += 1
    # le héros ne garde que le 1er paragraphe (lisibilité sur la photo) ; la suite ouvre le texte
    body = lead[1:] + body
    if numbers:
        sections.append({'_bookshop_name': 'stats', 'type': 'stats', 'title': stats_seg['title'], 'style': 'carte',
                         'fond': 'beige', 'items': numbers})
    if body:
        sections.append({'_bookshop_name': 'rich-text', 'type': 'rich-text', 'title': '' if numbers else stats_seg['title'],
                         'fond': 'ivoire', 'paragraphs': body})

    def callout(seg, fond):
        return {'_bookshop_name': 'callout', 'type': 'callout', 'fond': fond, 'title': seg['title'],
                'body': ' '.join(f'<p>{b[1]}</p>' for b in seg['items'] if b[0] == 'p'), 'ctaLabel': t['quote'],
                'ctaHref': t['contact'], 'layout': 'box'}

    before = [s for s in others if segs.index(s) < segs.index(solutions)]
    after = [s for s in others if segs.index(s) > segs.index(solutions)]
    for seg in before:
        sections.append(callout(seg, 'ivoire'))

    # solutions : h3 (parfois deux h3 d'affilée = sur-titre + titre) puis paragraphes
    cards, intro, pending = [], [], ''
    for kind, htm, _ in solutions['items']:
        if kind == 'h3':
            if cards and not cards[-1]['text'] and not pending:
                pending = cards.pop()['title']
            title = f'{pending} {plain(htm)}'.strip() if pending else plain(htm)
            pending = ''
            cards.append({'title': title, 'text': []})
        elif kind in ('p', 'li'):
            (cards[-1]['text'] if cards else intro).append(htm)
    sections.append({
        '_bookshop_name': 'numbered-cards', 'type': 'numbered-cards', 'fond': 'beige', 'sectionTitle': solutions['title'],
        'headingStyle': 'plain', 'intro': ' '.join(intro), 'tone': 'tint', 'columns': '3', 'cardStyle': 'default',
        'items': [{'number': f'{n:02d}', 'title': c['title'], 'text': '<br><br>'.join(c['text']), 'ctaLabel': '', 'ctaHref': ''}
                  for n, c in enumerate(cards, 1)],
    })

    # avis : « citation » puis h5 = fonction de l'auteur ; la note globale ouvre le texte
    if reviews:
        quotes, rating = [], ''
        for kind, htm, _ in reviews['items']:
            text = plain(htm)
            if kind == 'p' and re.match(r'^[«“"]', text):
                quotes.append({'image': '', 'quote': text.strip('«»“”"  '), 'name': '', 'role': ''})
            elif kind == 'p' and not quotes and not rating:
                rating = re.sub(r'[⭐★]+\s*', '', text).replace('  ', ' ')
            elif kind == 'h5' and quotes and not quotes[-1]['role'] and not re.search(r'⭐|★|^—|Note globale|Overall', text):
                quotes[-1]['role'] = text
        for q in quotes:
            q['name'] = 'Gartner Peer Insights'
        if quotes:
            sections.append({'_bookshop_name': 'testimonial-cards', 'type': 'testimonial-cards',
                             'title': reviews['title'], 'fond': 'ivoire', 'items': quotes})

    for seg in after[:-1]:
        sections.append({'_bookshop_name': 'rich-text', 'type': 'rich-text', 'title': seg['title'], 'fond': 'beige',
                         'paragraphs': [b[1] for b in seg['items'] if b[0] == 'p']})
    final = after[-1] if after else {'title': t['demo'], 'items': []}
    sections.append({
        '_bookshop_name': 'cta', 'type': 'cta', 'title': final['title'],
        'body': ' '.join(plain(b[1]) for b in final['items'] if b[0] == 'p'), 'ctaLabel': t['demo'],
        'ctaHref': t['contact'], 'cta2Label': '', 'cta2Href': '', 'variant': 'nuit', 'fond': 'ivoire',
    })

    page = {
        '_schema': 'default', 'title': h1, 'description': description, 'noindex': False,
        'slug': f'it-procurement/{slug}' if lang == 'en' else '', 'seoTitle': seo_title, 'seoH1': '',
        'contactSujet': '', 'contactService': '', 'sections': sections,
    }
    dest = os.path.join(ROOT, 'src', 'content', 'services', lang, 'approvisionnement-ti', f'{vendor}.json')
    os.makedirs(os.path.dirname(dest), exist_ok=True)
    with open(dest, 'w', encoding='utf8', newline='\n') as fh:
        json.dump(page, fh, ensure_ascii=False, indent=2)
        fh.write('\n')
    return f'{lang}/{vendor}: {len(sections)} sections, {len(numbers)} chiffres, {len(cards)} solutions, ' \
           f'{len(sections[-2].get("items", [])) if reviews else 0} avis, accroche « {tagline[:40]} »'


if __name__ == '__main__':
    failed = 0
    for vendor in VENDORS:
        for lang in ('fr', 'en'):
            try:
                print(build(lang, vendor))
            except Exception as exc:  # noqa: BLE001 — on veut la liste complète des échecs
                failed += 1
                print(f'ÉCHEC {lang}/{vendor}: {exc!r}')
    sys.exit(1 if failed else 0)
