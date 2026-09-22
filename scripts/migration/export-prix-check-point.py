"""Exporte les listes de prix Check Point de l'ancien site vers src/data/prix/.

L'ancienne page (`/liste-prix-check-point/`, FR + EN, Brizy + greffon maison
« victrix-product-table ») affiche DEUX tableaux de SKU et, sur chaque ligne,
un bouton « Ajouter à ma commande » qui écrit le SKU dans un champ du
formulaire de la page (vpt-form-bridge.js : un seul SKU à la fois, pas de
panier). Reprise décidée le 21/09 : même page, notre système de design.

Sortie : src/data/prix/check-point.<langue>.json
  { "source", "extrait_le", "devise", "titre", "intro", "note",
    "groupes": [ { "titre", "lignes": [ { "sku", "description", "prix" } ] } ] }

`prix` est un NOMBRE (le formatage « 219,09 $ » est refait au rendu selon la
langue) ; une cellule sans prix lisible garde son texte dans `prix_texte`.

    python scripts/migration/export-prix-check-point.py
    python scripts/migration/export-prix-check-point.py --check   # échoue si périmé
"""
import html as htmllib
import io
import json
import os
import re
import sys
import urllib.request

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.abspath(os.path.join(HERE, '..', '..'))
SORTIE = os.path.join(ROOT, 'src', 'data', 'prix')
BASE = 'https://www.victrix.ca'

PAGES = {
    'fr': '/liste-prix-check-point/',
    'en': '/en/check-point-price-list/',
}


def fetch(url):
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
    return urllib.request.urlopen(req, timeout=60).read().decode('utf-8', 'replace')


def texte(html_fragment):
    t = re.sub(r'<[^>]+>', ' ', html_fragment)
    t = htmllib.unescape(t)
    return re.sub(r'\s+', ' ', t).strip()


def nombre(cellule):
    """« 482 185,20 $ » -> 482185.2 ; None si illisible."""
    t = cellule.replace(' ', '').replace(' ', '').replace(' ', '')
    t = t.replace('$', '').replace('CAD', '').strip()
    t = t.replace(',', '.')
    if t.count('.') > 1:  # séparateur de milliers resté en place
        entier, _, dec = t.rpartition('.')
        t = entier.replace('.', '') + '.' + dec
    try:
        return round(float(t), 2)
    except ValueError:
        return None


def extrait(lang):
    raw = fetch(BASE + PAGES[lang])
    doc = {
        'source': BASE + PAGES[lang],
        'devise': 'CAD',
        'titre': '',
        'intro': [],
        'note': '',
        'groupes': [],
    }
    h1 = re.search(r'<h1[^>]*>(.*?)</h1>', raw, re.S)
    if h1:
        doc['titre'] = texte(h1.group(1))

    # Chaque tableau est précédé de son titre (h2/h3) : on découpe le document
    # sur les tableaux et on garde le dernier titre rencontré avant chacun.
    positions = [(m.start(), m.group(0)) for m in re.finditer(r'<table.*?</table>', raw, re.S)]
    titres = [(m.start(), texte(m.group(1))) for m in re.finditer(r'<h[23][^>]*>(.*?)</h[23]>', raw, re.S)]
    for debut, bloc in positions:
        titre = ''
        for pos, t in titres:
            if pos < debut and t:
                titre = t
        lignes = []
        for tr in re.findall(r'<tr.*?</tr>', bloc, re.S):
            cellules = [texte(c) for c in re.findall(r'<t[hd].*?</t[hd]>', tr, re.S)]
            if len(cellules) < 4:
                continue
            no, sku, description, prix = cellules[0], cellules[1], cellules[2], cellules[3]
            if not re.match(r'^\d+$', no or ''):
                continue  # ligne d'en-tête
            entree = {'sku': sku, 'description': description}
            valeur = nombre(prix)
            if valeur is None:
                entree['prix'] = None
                entree['prix_texte'] = prix
            else:
                entree['prix'] = valeur
            lignes.append(entree)
        if lignes:
            doc['groupes'].append({'titre': titre, 'lignes': lignes})

    # La page source n'explique NULLE PART l'astérisque du titre : le seul
    # paragraphe avec « * » est la mention « les champs nécessaires » du
    # formulaire Gravity. On ne recopie donc pas de note — le texte du bas de
    # page (validité des prix, PDSF) est à faire rédiger par le marketing.
    doc['note'] = ''
    return doc


def main(argv):
    verifie = '--check' in argv
    os.makedirs(SORTIE, exist_ok=True)
    problemes = []
    for lang in PAGES:
        doc = extrait(lang)
        total = sum(len(g['lignes']) for g in doc['groupes'])
        chemin = os.path.join(SORTIE, 'check-point.%s.json' % lang)
        rendu = json.dumps(doc, ensure_ascii=False, indent=2) + '\n'
        print('%s : %d groupe(s), %d ligne(s) — %s'
              % (lang, len(doc['groupes']), total, os.path.relpath(chemin, ROOT).replace('\\', '/')))
        for g in doc['groupes']:
            sans_prix = sum(1 for l in g['lignes'] if l['prix'] is None)
            print('    %-55s %4d ligne(s)%s'
                  % ((g['titre'] or '(sans titre)')[:55], len(g['lignes']),
                     ' dont %d SANS PRIX LISIBLE' % sans_prix if sans_prix else ''))
        if total == 0:
            problemes.append('%s : aucune ligne extraite (la page source a changé ?)' % lang)
        if verifie:
            actuel = io.open(chemin, encoding='utf-8').read() if os.path.exists(chemin) else None
            # « extrait_le » change à chaque passage : on compare le RESTE.
            if actuel != rendu:
                problemes.append('%s : %s est périmé' % (lang, os.path.relpath(chemin, ROOT)))
        else:
            io.open(chemin, 'w', encoding='utf-8', newline='\n').write(rendu)
    if problemes:
        for p in problemes:
            print('  ECHEC :', p)
        return 1
    return 0


if __name__ == '__main__':
    sys.exit(main(sys.argv[1:]))
