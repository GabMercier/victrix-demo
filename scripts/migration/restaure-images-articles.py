#!/usr/bin/env python3
"""Remet dans chaque article les IMAGES du corps de l'ancien article que la
conversion a laissées tomber — à leur place, avec leur texte alternatif.

Pendant de `restaure-blocs-articles.py` pour les images (mesure :
`images-manquantes-articles.py`). Pour chaque article publié dont la page
source est dans le cache, l'outil marche les blocs de la source DANS L'ORDRE
(titres, paragraphes, items, images — même parseur que la parité), repère
dans le Markdown la ligne où vit chaque bloc de texte retrouvé, et insère une
image absente juste après la dernière ligne repérée, en Markdown :
`![alt de l'ancien site](/wp-content/uploads/…)`.

Règles :
- une image « absente » = son nom de fichier (suffixe de vignette WordPress
  `-300x200` ignoré) n'apparaît ni dans un `![…](…)` ni dans un `<img>` du
  corps ; la couverture (`coverImage`) et les icônes décoratives des encadrés
  (`idea`, `ampoule`, point d'interrogation) ne comptent pas ;
- le fichier posé est l'ORIGINAL plein format déjà sous `public/wp-content/`
  (rapatrié par `rapatrie-images-source.py`) ; s'il manque, l'image est
  signalée « à rapatrier » et rien n'est écrit ;
- une image n'est jamais insérée à l'intérieur d'un tableau, d'un encadré
  ou d'une FAQ HTML : la position glisse après la balise fermante ;
- les `<img src="https://www.victrix.ca/wp-content/…">` encore servies par
  l'ancien domaine sont réécrites en `/wp-content/…` si le fichier est là ;
- le texte nu de l'article ne change pas (vérifié avant d'écrire) ;
- rejouable : une image déjà là est retrouvée, donc ignorée.

Usage :
  python scripts/migration/restaure-images-articles.py            # essai : les diffs, rien d'écrit
  python scripts/migration/restaure-images-articles.py --apply    # écrit src/content/blog
  python scripts/migration/restaure-images-articles.py --only a,b # ces slugs seulement
"""
from __future__ import annotations

import difflib
import glob
import html as htmllib
import importlib.util
import io
import os
import re
import sys
from urllib.parse import urlparse

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.abspath(os.path.join(HERE, '..', '..'))
PUBLIC = os.path.join(ROOT, 'public')
ANCIEN_DOMAINE = 'https://www.victrix.ca'


def _module(nom, fichier):
    spec = importlib.util.spec_from_file_location(nom, os.path.join(HERE, fichier))
    mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)
    return mod


cpt = _module('check_parite_texte', 'check-parite-texte.py')
bm = _module('blocs_manquants_articles', 'blocs-manquants-articles.py')
rba = _module('restaure_blocs_articles', 'restaure-blocs-articles.py')

APPLY = '--apply' in sys.argv
ONLY = set()
if '--only' in sys.argv:
    ONLY = set(sys.argv[sys.argv.index('--only') + 1].split(','))

DECORATIVES = {'idea', 'ampoule', 'yellow-question-mark', 'yellow-question-mark-1'}
RE_IMG_MD = re.compile(r'!\[[^\]]*\]\(([^)\s]+)')
RE_IMG_HTML = re.compile(r'<img[^>]*\ssrc="([^"]+)"')
RE_ANCIEN = re.compile(r'(<img[^>]*\ssrc=")' + re.escape(ANCIEN_DOMAINE) + r'(/wp-content/[^"]+)(")')
# Blocs HTML dans lesquels on n'insère jamais (tableaux, encadrés, FAQ).
OUVRANTS = re.compile(r'<(table|aside|details|div class="article-tableau")\b', re.I)
FERMANTS = {'table': '</table>', 'aside': '</aside>', 'details': '</details>', 'div': '</div>'}


def base(url):
    """Nom de fichier normalisé : sans dossier, sans -WxH, sans extension."""
    b = os.path.basename(urlparse(url).path)
    b = re.sub(r'-\d+x\d+(?=\.\w+$)', '', b)
    return re.sub(r'\.(png|jpe?g|webp|gif|svg)$', '', b, flags=re.I).lower()


def chemin_local(src):
    """Le chemin public de l'ORIGINAL (sans -WxH) s'il existe, sinon le chemin
    exact s'il existe, sinon None."""
    p = urlparse(src).path
    if '/wp-content/uploads/' not in p:
        return None
    original = re.sub(r'-\d+x\d+(?=\.\w+$)', '', p)
    for cand in (original, p):
        if os.path.exists(os.path.join(PUBLIC, *cand.strip('/').split('/'))):
            return cand
    # même nom, autre extension (WebP produit par l'optimisation, par ex.)
    b = base(src)
    hits = glob.glob(os.path.join(PUBLIC, 'wp-content', 'uploads', '**', b + '.*'), recursive=True)
    if hits:
        return '/' + os.path.relpath(hits[0], PUBLIC).replace('\\', '/')
    return None


def sortir_du_bloc_html(lignes, pos):
    """Si la ligne `pos` est à l'intérieur d'un tableau / encadré / FAQ HTML,
    renvoie la ligne qui suit la balise fermante ; sinon `pos`."""
    pile = []
    for i, l in enumerate(lignes[:pos]):
        for m in OUVRANTS.finditer(l):
            pile.append(m.group(1).split()[0].lower())
        for tag in list(pile):
            if FERMANTS[tag] in l.lower() and l.lower().count(FERMANTS[tag]) >= 1:
                # une fermeture sur cette ligne ferme le dernier ouvert du même type
                for j in range(len(pile) - 1, -1, -1):
                    if pile[j] == tag:
                        del pile[j]
                        break
    if not pile:
        return pos
    tag = pile[-1]
    for i in range(pos, len(lignes)):
        if FERMANTS[tag] in lignes[i].lower():
            return i + 1
    return len(lignes)


def sortir_de_liste(lignes, pos):
    """Jamais entre deux items d'une liste : si la ligne d'avant est un item
    et que la liste continue, l'insertion glisse après le dernier item."""
    if pos == 0 or not rba.RE_ITEM.match(lignes[pos - 1]):
        return pos
    i = pos
    while i < len(lignes):
        if rba.RE_ITEM.match(lignes[i]):
            i += 1
            continue
        if lignes[i].strip() == '' and i + 1 < len(lignes) and rba.RE_ITEM.match(lignes[i + 1]):
            i += 1
            continue
        break
    return i


def blocs_avec_images(html):
    """[(kind, norme_ou_None, src, alt)] du contenu principal, dans l'ordre."""
    p = cpt.BlocsSansChrome()
    p.feed(html)
    out = []
    for kind, htm, alt in p.out:
        if kind == 'img':
            out.append(('img', None, htm, htmllib.unescape(alt or '').strip()))
            continue
        texte = cpt.base.plain(htm)
        if kind == 'p' and (cpt.RE_FIL_ARIANE.match(texte) or cpt.RE_FORMULAIRE.search(texte)):
            continue
        out.append((kind, cpt.normalise_titre(texte), None, None))
    return out


def restaure(corps, blocs, deja, cover_b, rapport):
    """Renvoie (nouveau corps, nb d'images posées)."""
    lignes = corps.split('\n')
    normes = [rba.norme_ligne(l) for l in lignes]
    pos, poses, vus = 0, 0, set(deja)
    for kind, norme, src, alt in blocs:
        if kind != 'img':
            if not norme or rba.RE_ARIANE.match(norme):
                continue
            i = rba.ligne_du_bloc(lignes, normes, norme, max(0, pos - 1), kind)
            if i is not None and i + 1 > pos:
                pos = i + 1
            continue
        b = base(src)
        if '/wp-content/uploads/' not in src or 'avatar' in b or b in DECORATIVES or b == cover_b or b in vus:
            continue
        vus.add(b)
        chemin = chemin_local(src)
        if not chemin:
            rapport['a_rapatrier'].append(src)
            continue
        ins = sortir_de_liste(lignes, sortir_du_bloc_html(lignes, pos))
        md = '![%s](%s)' % (alt.replace(']', ''), chemin)
        if not alt:
            rapport['alt_vides'].append(chemin)
        if ins == 0:
            rapport['en_tete'].append(chemin)
        bloc = []
        if ins > 0 and lignes[ins - 1].strip() != '':
            bloc.append('')
        bloc.append(md)
        if ins >= len(lignes) or lignes[ins].strip() != '':
            bloc.append('')
        lignes[ins:ins] = bloc
        normes[ins:ins] = [rba.norme_ligne(l) for l in bloc]
        pos = ins + len(bloc)
        poses += 1
    return '\n'.join(lignes), poses


def texte_nu(corps):
    t = re.sub(r'!\[[^\]]*\]\([^)]*\)', ' ', corps)
    t = re.sub(r'<img[^>]*>', ' ', t)
    return ' '.join(t.split())


def main():
    index = cpt.lit_index_cache()
    tot_articles = tot_images = tot_domaine = 0
    rapport = {'alt_vides': [], 'a_rapatrier': [], 'en_tete': [], 'fr_dans_en': [], 'a_la_main': []}
    for langue, chemin, fm in bm.articles():
        rel = os.path.relpath(chemin, ROOT).replace('\\', '/')
        nom = os.path.basename(chemin)[:-3]
        if ONLY and nom not in ONLY and fm.get('slug') not in ONLY:
            continue
        if str(fm.get('draft', '')).lower() == 'true':
            continue
        with io.open(chemin, encoding='utf-8', newline='') as fh:
            texte = fh.read()
        m = bm.RE_FRONT.match(texte)
        if not m:
            print('!! %s : front matter introuvable' % rel)
            continue
        tete, corps = texte[:m.end()], texte[m.end():]

        # 1. Images encore servies par l'ancien domaine → chemin local.
        def local(mm):
            p = mm.group(2)
            if os.path.exists(os.path.join(PUBLIC, *p.strip('/').split('/'))):
                return mm.group(1) + p + mm.group(3)
            rapport['a_rapatrier'].append(ANCIEN_DOMAINE + p)
            return mm.group(0)
        corps2, n_dom = RE_ANCIEN.subn(local, corps)

        # 2. Images absentes, posées à leur place.
        n_img = 0
        wp = fm.get('wpUrl', '')
        html = None
        if wp:
            html, _ = cpt.source_html(cpt.normalise_chemin(wp), index)
        if html:
            blocs = blocs_avec_images(html)
            # Page source écrite dans l'AUTRE langue (les 4 articles EN servis
            # en français par l'ancien site) : aucun bloc de texte ne peut
            # être repéré, les images tomberaient toutes en tête. Même règle
            # que restaure-blocs-articles.py : à poser à la main.
            texte_src = ' '.join(n for k, n, _, _ in blocs if k != 'img' and n)
            if bm.langue_du_texte(cpt.normalise_titre(texte_src)) not in (None, langue):
                manquantes = [chemin_local(s) or s for k, _, s, _ in blocs if k == 'img' and '/wp-content/uploads/' in s
                              and base(s) not in DECORATIVES and base(s) != (base(fm.get('coverImage', '')) if fm.get('coverImage') else '')
                              and base(s) not in {base(u) for u in RE_IMG_MD.findall(corps2)} | {base(u) for u in RE_IMG_HTML.findall(corps2)}]
                if manquantes:
                    rapport['a_la_main'].append('%s : %s' % (rel, ', '.join(dict.fromkeys(manquantes))))
                html = None
        if html:
            deja = {base(u) for u in RE_IMG_MD.findall(corps2)} | {base(u) for u in RE_IMG_HTML.findall(corps2)}
            cover_b = base(fm.get('coverImage', '')) if fm.get('coverImage') else ''
            corps3, n_img = restaure(corps2, blocs, deja, cover_b, rapport)
            if langue == 'en':
                for u in RE_IMG_MD.findall(corps3):
                    if base(u) not in deja and base(u).endswith('-fr'):
                        rapport['fr_dans_en'].append('%s : %s' % (rel, u))
        else:
            corps3 = corps2

        if not n_img and not n_dom:
            continue
        if texte_nu(corps3) != texte_nu(corps):
            print('!! %s : le texte nu changerait — rien n\'est écrit' % rel)
            continue
        tot_articles += 1
        tot_images += n_img
        tot_domaine += n_dom
        if APPLY:
            with io.open(chemin, 'w', encoding='utf-8', newline='') as fh:
                fh.write(tete + corps3)
            print('%s : %d image(s) posée(s), %d réécrite(s) en local' % (rel, n_img, n_dom))
        else:
            print('=' * 8, rel, ': %d image(s) à poser, %d à réécrire en local' % (n_img, n_dom))
            for l in difflib.unified_diff(corps.split('\n'), corps3.split('\n'), lineterm='', n=1):
                if l.startswith(('---', '+++')):
                    continue
                print('   ' + l)

    print('%s : %d article(s), %d image(s) posée(s), %d <img> réécrite(s) en local'
          % ('Écrit' if APPLY else 'Essai', tot_articles, tot_images, tot_domaine))
    if rapport['alt_vides']:
        print('  alt VIDE (à faire rédiger) : %d — %s' % (len(rapport['alt_vides']), ', '.join(os.path.basename(p) for p in rapport['alt_vides'])))
    if rapport['en_tete']:
        print('  posée(s) en tête d\'article (aucun bloc repéré avant) : %d — %s' % (len(rapport['en_tete']), ', '.join(os.path.basename(p) for p in rapport['en_tete'])))
    if rapport['fr_dans_en']:
        print('  infographie FRANÇAISE dans un article EN (à valider) : %d' % len(rapport['fr_dans_en']))
        for l in rapport['fr_dans_en']:
            print('    ' + l)
    if rapport['a_la_main']:
        print('  page source dans l\'autre langue — images à poser À LA MAIN : %d article(s)' % len(rapport['a_la_main']))
        for l in rapport['a_la_main']:
            print('    ' + l)
    if rapport['a_rapatrier']:
        print('  À RAPATRIER (fichier absent de public/) : %d — %s' % (len(rapport['a_rapatrier']), ', '.join(rapport['a_rapatrier'])))
    return 0


if __name__ == '__main__':
    sys.exit(main())
