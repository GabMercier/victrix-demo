# -*- coding: utf-8 -*-
"""
Rapatrie TOUTES les images de l'ancien site (victrix.ca, WordPress) sous
public/wp-content/… — outil REJOUABLE (lot L-restaure-pages, nuit du
2026-09-24 : « on GARDE toutes les photos de l'ancien site pour les
réutiliser », dans la médiathèque de CloudCannon).

Pourquoi un outil à part plutôt que `extract-source-page.py --images` page
par page : l'extracteur REFAIT une requête HTTP par page et écrit une fiche
Markdown par adresse dans docs/migration/campagnes/ (173 fichiers de rebut
pour un simple rapatriement). Ici on lit le CACHE LOCAL des pages sources
(docs/migration/cache-source/, index `_index.json`), on relève chaque `<img>`
(src, data-src, srcset — la plus grande variante) et on ne télécharge que ce
qui n'est PAS déjà sous public/. Même convention de chemin que
`local_image()` de import-pages-fournisseurs.py : /wp-content/uploads/… tel
quel, jamais renommé.

Usage :
    python scripts/migration/rapatrie-images-source.py            # télécharge
    python scripts/migration/rapatrie-images-source.py --check    # liste seulement

Ce qu'il ne fait PAS : optimiser (passer `npm run optimize:images` ensuite),
supprimer (jamais), toucher aux pages. Sortie : nombre d'images vues, déjà
présentes, téléchargées, en échec, et le poids ajouté.
"""
import importlib.util
import json
import os
import re
import sys
import urllib.error

sys.stdout.reconfigure(encoding='utf-8', errors='replace')

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.abspath(os.path.join(HERE, '..', '..'))
CACHE = os.path.join(ROOT, 'docs', 'migration', 'cache-source')
PUBLIC = os.path.join(ROOT, 'public')

spec = importlib.util.spec_from_file_location('fournisseurs', os.path.join(HERE, 'import-pages-fournisseurs.py'))
base = importlib.util.module_from_spec(spec)
spec.loader.exec_module(base)

CHECK = '--check' in sys.argv

# Motifs WordPress à NE PAS rapatrier : variantes redimensionnées « -300x200 »
# quand l'original existe dans la même page (on garde l'original, le plus
# grand), et tout ce qui n'est pas dans /wp-content/uploads/.
RE_IMG = re.compile(r'<img\b[^>]*>', re.I)
RE_ATTR = re.compile(r'\b(src|data-src|data-lazy-src|srcset|data-srcset)\s*=\s*["\']([^"\']*)["\']', re.I)
RE_TAILLE = re.compile(r'-\d+x\d+(?=\.[a-z]{3,4}$)', re.I)


def chemin_local(src):
    """/wp-content/... depuis une URL absolue ou relative, sinon None."""
    src = src.strip()
    if not src:
        return None
    if src.startswith(base.BASE):
        src = src[len(base.BASE):]
    elif src.startswith('http'):
        return None  # image hébergée ailleurs
    src = src.split('?')[0].split('#')[0]
    if not src.startswith('/wp-content/uploads/'):
        return None
    return src


def images_de(html):
    vus = set()
    for tag in RE_IMG.findall(html):
        for attr, val in RE_ATTR.findall(tag):
            if 'srcset' in attr:
                for cand in val.split(','):
                    url = cand.strip().split(' ')[0]
                    c = chemin_local(url)
                    if c:
                        vus.add(c)
            else:
                c = chemin_local(val)
                if c:
                    vus.add(c)
    # L'original avant ses variantes : si « x-1024x683.png » ET « x.png » sont
    # vus, on ne garde que l'original ; sinon on garde la variante (c'est tout
    # ce que la page servait).
    originaux = {RE_TAILLE.sub('', c) for c in vus}
    garde = set()
    for c in vus:
        orig = RE_TAILLE.sub('', c)
        if c == orig or orig not in vus:
            garde.add(c)
    return garde, originaux


def main():
    with open(os.path.join(CACHE, '_index.json'), encoding='utf-8') as fh:
        index = json.load(fh)
    toutes = set()
    for chemin, info in sorted(index.items()):
        fichier = os.path.join(CACHE, info.get('fichier', ''))
        if not info.get('fichier') or not os.path.exists(fichier):
            continue
        with open(fichier, encoding='utf-8', errors='ignore') as fh:
            garde, _ = images_de(fh.read())
        toutes |= garde

    deja, a_faire = [], []
    for c in sorted(toutes):
        dest = os.path.join(PUBLIC, *c.strip('/').split('/'))
        (deja if os.path.exists(dest) else a_faire).append((c, dest))

    print('Images relevées dans %d pages en cache : %d — déjà sous public/ : %d — à télécharger : %d'
          % (len(index), len(toutes), len(deja), len(a_faire)))
    if CHECK:
        for c, _ in a_faire:
            print('  ' + c)
        return

    octets, ok, echecs = 0, 0, []
    for i, (c, dest) in enumerate(a_faire, 1):
        try:
            data = base.fetch(base.BASE + c)
        except (urllib.error.HTTPError, urllib.error.URLError, OSError) as e:
            echecs.append((c, str(e)))
            continue
        os.makedirs(os.path.dirname(dest), exist_ok=True)
        with open(dest, 'wb') as fh:
            fh.write(data)
        octets += len(data)
        ok += 1
        if i % 25 == 0:
            print('  … %d/%d (%.1f Mo)' % (i, len(a_faire), octets / 1e6))
    print('Téléchargées : %d (%.1f Mo bruts, avant optimize:images) — échecs : %d' % (ok, octets / 1e6, len(echecs)))
    for c, e in echecs:
        print('  ÉCHEC %s : %s' % (c, e))


if __name__ == '__main__':
    main()
