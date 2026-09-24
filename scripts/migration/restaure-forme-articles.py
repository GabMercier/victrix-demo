# -*- coding: utf-8 -*-
"""
Forme des articles — convertit le HTML BRUT hérité de WordPress vers les 4
patrons de docs/plan-forme-articles.md (lot 4, nuit du 2026-09-24). Outil
REJOUABLE, idempotent : un article déjà converti ressort inchangé.

  1. <a class="article-cta" href="…">texte</a>      → <a class="btn" href="…">texte</a>
  2. « #### Le saviez-vous ? » + ce qui suit         → <aside class="article-encadre">
     jusqu'au prochain titre                            <p class="article-encadre__titre">…</p> …</aside>
  3. « **Question ?** » (gras seul) + sa réponse      → <details class="article-faq"><summary>Question ?</summary> … </details>
     jusqu'à la prochaine question / titre / HTML
  4. <table …attributs…>                              → <div class="article-tableau"><table> … </table></div>
     (attributs de présentation retirés, 1re ligne « titres » → <thead>/<th>)

AUCUN TEXTE MODIFIÉ : seules les balises et leurs attributs changent. L'outil
le VÉRIFIE lui-même (texte nu avant/après, hors l'icône décorative « ampoule »
des encadrés NIS2 qu'il retire) et refuse d'écrire un article dont le texte
aurait bougé.

Usage :
  python scripts/migration/restaure-forme-articles.py                 # essai : diffs + rapport
  python scripts/migration/restaure-forme-articles.py --apply         # écrit src/content/blog
  python scripts/migration/restaure-forme-articles.py --only dora,copilot-vs-chatgpt

Rapport article par article : nombre de CTA, encadrés, FAQ et tableaux
convertis. Ne touche pas au front matter.
"""
import difflib
import glob
import io
import os
import re
import sys

sys.stdout.reconfigure(encoding='utf-8', errors='replace')

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.abspath(os.path.join(HERE, '..', '..'))
BLOG = os.path.join(ROOT, 'src', 'content', 'blog')

APPLY = '--apply' in sys.argv
ONLY = set()
if '--only' in sys.argv:
    ONLY = {s.strip() for s in sys.argv[sys.argv.index('--only') + 1].split(',') if s.strip()}

# Le délimiteur fermant peut être COLLÉ au premier titre (`---## Titre`, 4
# articles importés ainsi — Astro les rend correctement) : on ne l'exige pas
# suivi d'un saut de ligne.
RE_FRONT = re.compile(r'^---\r?\n(.*?)\r?\n---', re.S)
RE_HEADING = re.compile(r'^#{1,6}\s')
RE_CTA = re.compile(r'<a\s+class="article-cta"\s+href="([^"]*)"\s*>(.*?)</a>', re.S)
RE_SAVIEZ = re.compile(
    r'^#{2,5}\s*(?:!\[[^\]]*\]\([^)]*\)\s*)?(Le saviez-vous\s*\??|Did you know\s*\??)\s*$', re.I)
RE_QUESTION = re.compile(r'^\*\*([^*\n]+\?)\*\*\s*$')
RE_HTML_BLOCK = re.compile(r'^<(a|div|table|aside|details|p|ul|ol|img|figure|blockquote|h[1-6])\b', re.I)
RE_TABLE = re.compile(r'<table\b[^>]*>.*?</table>', re.S | re.I)
RE_TAG_ATTRS = re.compile(r'<(table|thead|tbody|tfoot|tr|td|th)\b([^>]*)>', re.I)
RE_ATTR = re.compile(r'([a-zA-Z-]+)\s*=\s*("[^"]*"|\'[^\']*\'|[^\s>]+)')
RE_FIRST_TR = re.compile(r'<tr\b[^>]*>.*?</tr>', re.S | re.I)
RE_CELL = re.compile(r'<td\b([^>]*)>(.*?)</td>', re.S | re.I)
RE_TITLE_CELL = re.compile(r'^\s*<(h[1-6]|strong|b)\b[^>]*>(.*?)</\1>\s*$', re.S | re.I)
RE_STRIP_TAGS = re.compile(r'<[^>]+>')


# ------------------------------------------------------------- 1. CTA

def convertit_cta(corps):
    n = [0]

    def rep(m):
        n[0] += 1
        return '<a class="btn" href="%s">%s</a>' % (m.group(1), m.group(2))

    return RE_CTA.sub(rep, corps), n[0]


# ------------------------------------------------------------- 2. encadrés

def convertit_encadres(corps):
    lignes = corps.split('\n')
    out, i, n = [], 0, 0
    while i < len(lignes):
        m = RE_SAVIEZ.match(lignes[i])
        if not m:
            out.append(lignes[i])
            i += 1
            continue
        titre = m.group(1).strip()
        # Corps de l'encadré : jusqu'au prochain titre (ou fin), lignes vides de fin exclues.
        j = i + 1
        while j < len(lignes) and not RE_HEADING.match(lignes[j]):
            j += 1
        bloc = lignes[i + 1:j]
        while bloc and not bloc[0].strip():
            bloc.pop(0)
        while bloc and not bloc[-1].strip():
            bloc.pop()
        if not bloc:
            out.append(lignes[i])
            i += 1
            continue
        out.append('<aside class="article-encadre">')
        out.append('<p class="article-encadre__titre">%s</p>' % titre)
        out.append('')
        out.extend(bloc)
        out.append('')
        out.append('</aside>')
        n += 1
        i = j
    return '\n'.join(out), n


# ------------------------------------------------------------- 3. FAQ

def _groupes_faq(lignes):
    """Indices des lignes « **Question ?** » qui forment une FAQ : au moins DEUX
    questions qui se suivent (chacune suivie de sa réponse). Une question en
    gras isolée est une accroche rhétorique (« What if we told you… ? »), pas
    une FAQ — elle reste telle quelle."""
    candidats = [i for i, l in enumerate(lignes) if RE_QUESTION.match(l)]
    retenus = set()
    groupe = []
    for i in candidats:
        if groupe:
            # la question précédente enchaîne sur celle-ci sans titre ni bloc HTML entre les deux
            entre = lignes[groupe[-1] + 1:i]
            if any(RE_HEADING.match(l) or RE_HTML_BLOCK.match(l) for l in entre):
                if len(groupe) >= 2:
                    retenus.update(groupe)
                groupe = []
        groupe.append(i)
    if len(groupe) >= 2:
        retenus.update(groupe)
    return retenus


def convertit_faq(corps):
    lignes = corps.split('\n')
    faq = _groupes_faq(lignes)
    out, i, n = [], 0, 0
    while i < len(lignes):
        m = RE_QUESTION.match(lignes[i]) if i in faq else None
        if not m:
            out.append(lignes[i])
            i += 1
            continue
        # Réponse : jusqu'à la prochaine question en gras, un titre, un bloc HTML ou la fin.
        j = i + 1
        while j < len(lignes):
            l = lignes[j]
            if RE_QUESTION.match(l) or RE_HEADING.match(l) or RE_HTML_BLOCK.match(l):
                break
            j += 1
        bloc = lignes[i + 1:j]
        while bloc and not bloc[0].strip():
            bloc.pop(0)
        while bloc and not bloc[-1].strip():
            bloc.pop()
        if not bloc:
            out.append(lignes[i])
            i += 1
            continue
        out.append('<details class="article-faq">')
        out.append('<summary>%s</summary>' % m.group(1).strip())
        out.append('')
        out.extend(bloc)
        out.append('')
        out.append('</details>')
        n += 1
        i = j
        # une ligne vide entre deux FAQ successives (le HTML block doit se fermer)
        if i < len(lignes) and RE_QUESTION.match(lignes[i]):
            out.append('')
    return '\n'.join(out), n


# ------------------------------------------------------------- 4. tableaux

GARDE_ATTRS = {'colspan', 'rowspan', 'scope'}


def nettoie_attrs(m):
    tag, attrs = m.group(1).lower(), m.group(2)
    gardes = []
    for k, v in RE_ATTR.findall(attrs):
        if k.lower() in GARDE_ATTRS:
            gardes.append('%s=%s' % (k.lower(), v if v[0] in '"\'' else '"%s"' % v))
    return '<%s%s>' % (tag, (' ' + ' '.join(gardes)) if gardes else '')


def entete_depuis_premiere_ligne(table):
    """Si la 1re ligne n'a que des cellules « titre » (h*/strong seul), elle devient un <thead> de <th>."""
    if re.search(r'<thead\b', table, re.I):
        return table
    m = RE_FIRST_TR.search(table)
    if not m:
        return table
    tr = m.group(0)
    cellules = RE_CELL.findall(tr)
    if not cellules or not all(RE_TITLE_CELL.match(c) for _, c in cellules):
        return table
    ths = ''.join('<th%s>%s</th>' % (attrs, RE_TITLE_CELL.match(c).group(2).strip())
                  for attrs, c in cellules)
    nouveau_tr = '<thead>\n<tr>%s</tr>\n</thead>' % ths
    table = table[:m.start()] + nouveau_tr + table[m.end():]
    # un <tbody> qui ouvrait avant la 1re ligne doit maintenant ouvrir après le thead
    table = re.sub(r'<tbody>\s*<thead>', '<thead>', table, count=1, flags=re.I)
    table = re.sub(r'</thead>\s*(?!<tbody>)', '</thead>\n<tbody>\n', table, count=1, flags=re.I) \
        if re.search(r'</thead>\s*<tr', table, re.I) and not re.search(r'</thead>\s*<tbody', table, re.I) else table
    return table


def convertit_tables(corps):
    n = [0]

    def rep(m):
        table = m.group(0)
        deja = corps[max(0, m.start() - 40):m.start()]
        table = RE_TAG_ATTRS.sub(nettoie_attrs, table)
        table = entete_depuis_premiere_ligne(table)
        # Titres/gras imbriqués dans les <th> (ex. <th colspan="3"><h3 style>…</h3></th>,
        # ou <h4><strong>…</strong></h4> après la promotion en en-tête) : texte
        # seul — jusqu'à stabilité, pour qu'un rejeu ne change plus rien.
        while True:
            apres = re.sub(r'<th\b([^>]*)>\s*<(h[1-6]|strong|b)\b[^>]*>(.*?)</\2>\s*</th>', r'<th\1>\3</th>', table, flags=re.S | re.I)
            if apres == table:
                break
            table = apres
        n[0] += 1
        if 'article-tableau' in deja:
            return table  # déjà enveloppé (rejeu)
        return '<div class="article-tableau">\n%s\n</div>' % table

    return RE_TABLE.sub(rep, corps), n[0]


# ------------------------------------------------------------- garde-fou texte

RE_AMPOULE = re.compile(r'!\[[^\]]*\]\([^)]*ampoule[^)]*\)', re.I)


def texte_nu(md):
    t = RE_AMPOULE.sub('', md)
    t = RE_STRIP_TAGS.sub(' ', t)
    t = re.sub(r'[#*_>`|\-]+', ' ', t)
    return ' '.join(t.split())


def convertit(corps):
    corps, cta = convertit_cta(corps)
    corps, enc = convertit_encadres(corps)
    corps, faq = convertit_faq(corps)
    corps, tab = convertit_tables(corps)
    return corps, {'cta': cta, 'encadres': enc, 'faq': faq, 'tableaux': tab}


def main():
    total = {'cta': 0, 'encadres': 0, 'faq': 0, 'tableaux': 0}
    articles = 0
    for chemin in sorted(glob.glob(os.path.join(BLOG, '*', '*.md'))):
        rel = os.path.relpath(chemin, ROOT).replace('\\', '/')
        nom = os.path.basename(chemin)[:-3]
        if ONLY and nom not in ONLY and not any(o in nom for o in ONLY):
            continue
        with io.open(chemin, encoding='utf-8', newline='') as fh:
            texte = fh.read()
        m = RE_FRONT.match(texte)
        if not m:
            print('!! %s : front matter introuvable' % rel)
            continue
        tete, corps = texte[:m.end()], texte[m.end():]
        nouveau, compte = convertit(corps)
        if nouveau == corps:
            continue
        if texte_nu(nouveau) != texte_nu(corps):
            print('!! %s : le TEXTE aurait changé — article laissé tel quel' % rel)
            for l in difflib.unified_diff(texte_nu(corps).split(' '), texte_nu(nouveau).split(' '), lineterm='', n=0):
                if not l.startswith(('---', '+++', '@@')):
                    print('     ' + l)
            continue
        articles += 1
        for k in total:
            total[k] += compte[k]
        resume = ', '.join('%d %s' % (v, k) for k, v in compte.items() if v)
        if APPLY:
            with io.open(chemin, 'w', encoding='utf-8', newline='') as fh:
                fh.write(tete + nouveau)
            print('%s : %s' % (rel, resume))
        else:
            print('=' * 8, rel, ':', resume)
            for l in difflib.unified_diff(corps.split('\n'), nouveau.split('\n'), lineterm='', n=1):
                if l.startswith(('---', '+++')):
                    continue
                print('   ' + l)
    print('%s : %d article(s) — %s' % ('Écrit' if APPLY else 'Essai', articles,
                                     ', '.join('%d %s' % (v, k) for k, v in total.items())))
    return 0


if __name__ == '__main__':
    sys.exit(main())
