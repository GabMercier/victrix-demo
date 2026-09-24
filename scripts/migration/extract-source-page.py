"""Extrait le contenu d'une page de l'ANCIEN site dans un fichier de relecture.

Outil rejouable, sans effet de bord sur le contenu du dépôt : il écrit
`docs/migration/campagnes/<nom>.md` — le texte de la page dans l'ordre, bloc
par bloc, avec les images et leurs `alt`. C'est le support qui sert à décider
« on reprend / on abandonne », puis à écrire l'import.

Il réutilise le parseur de `import-pages-fournisseurs.py` (mêmes règles : on
saute header/footer/nav/form, les liens sont réécrits vers les URL FINALES du
nouveau site).

    python scripts/migration/extract-source-page.py /liste-prix-check-point/
    python scripts/migration/extract-source-page.py --liste docs/migration/campagnes-a-extraire.txt
    python scripts/migration/extract-source-page.py --images /voeux-des-fetes/

Options :
    --images   télécharge aussi les images dans public/wp-content/… (sinon
               elles sont seulement listées avec leur URL d'origine)
    --liste F  lit un chemin par ligne dans le fichier F (# = commentaire)

Les pages en BROUILLON sur WordPress ne sont pas servies en ligne : elles
n'existent que dans l'export WXR (C:\\Repo\\Victrix\\siteWP\\export) — cet
outil ne les voit pas, il le dit et sort en code 0.
"""
import html as htmllib
import importlib.util
import os
import re
import sys
import urllib.error

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.abspath(os.path.join(HERE, '..', '..'))
spec = importlib.util.spec_from_file_location('fournisseurs', os.path.join(HERE, 'import-pages-fournisseurs.py'))
base = importlib.util.module_from_spec(spec)
spec.loader.exec_module(base)

SORTIE = os.path.join(ROOT, 'docs', 'migration', 'campagnes')


def meta(raw, name):
    m = re.search(r'<meta[^>]+name=["\']' + name + r'["\'][^>]+content=["\']([^"\']*)["\']', raw, re.I)
    return htmllib.unescape(m.group(1)).strip() if m else ''


def nom_fichier(chemin):
    parts = [p for p in chemin.strip('/').split('/') if p]
    return '-'.join(parts) or 'accueil'


def normalise_chemin(c):
    """Accepte une URL complète, un chemin, ou un chemin sans « / » au début.

    Git Bash réécrit un argument commençant par « / » en chemin Windows
    (« /voeux/ » → « C:/Program Files/Git/voeux/ ») : on récupère la queue.
    """
    c = c.replace('\\', '/')
    if c.startswith(base.BASE):
        c = c[len(base.BASE):]
    m = re.match(r'^[A-Za-z]:/.*?/Git/(.*)$', c)
    if m:
        c = '/' + m.group(1)
    if not c.startswith('/'):
        c = '/' + c
    if not c.endswith('/'):
        c += '/'
    return c


def extrait(chemin, telecharge_images):
    chemin = normalise_chemin(chemin)
    url = base.BASE + chemin
    try:
        raw = base.fetch(url).decode('utf8', 'ignore')
    except urllib.error.HTTPError as e:
        print('  %s -> HTTP %s (brouillon ou supprimée : voir l\'export WXR)' % (chemin, e.code))
        return None

    titre = re.search(r'<title[^>]*>(.*?)</title>', raw, re.S)
    titre = htmllib.unescape(re.sub(r'\s+', ' ', titre.group(1))).strip() if titre else ''
    robots = meta(raw, 'robots')
    parser = base.Blocks()
    parser.feed(raw)
    blocs = parser.out

    lignes = []
    lignes.append('# %s' % (titre or chemin))
    lignes.append('')
    lignes.append('> Extrait de %s par `scripts/migration/extract-source-page.py`.' % url)
    lignes.append('> **Titre SEO** : %s' % (titre or '—'))
    lignes.append('> **Méta description** : %s' % (meta(raw, 'description') or '—'))
    lignes.append('> **Robots** : %s' % (robots or '(aucune balise)'))
    lignes.append('> **Moteur** : %s' % ('Brizy' if 'brz-' in raw else
                                         'SiteOrigin' if 'siteorigin' in raw else 'autre'))
    mots = len(re.sub(r'<[^>]+>', ' ', raw).split())
    lignes.append('> **Poids** : %d blocs de texte, %d images, ~%d mots dans la page servie.'
                  % (sum(1 for b in blocs if b[0] != 'img'),
                     sum(1 for b in blocs if b[0] == 'img'), mots))
    lignes.append('')
    lignes.append('## Contenu, dans l\'ordre')
    lignes.append('')

    images = []
    for kind, htm, alt in blocs:
        if kind == 'img':
            src = htm if htm.startswith('http') else base.BASE + htm
            images.append((src, alt))
            lignes.append('- **[image %d]** `%s` — alt : %s' % (len(images), src, alt or '**VIDE**'))
            if telecharge_images:
                base.local_image(src)
        else:
            lignes.append('- **%s** — %s' % (kind, htm))
    lignes.append('')
    lignes.append('## Images (%d)' % len(images))
    lignes.append('')
    if images:
        lignes.append('| # | Fichier source | Texte alternatif |')
        lignes.append('| --- | --- | --- |')
        for i, (src, alt) in enumerate(images, 1):
            lignes.append('| %d | `%s` | %s |' % (i, src.replace(base.BASE, ''), alt or '**à rédiger**'))
    else:
        lignes.append('Aucune image dans le corps de la page.')
    lignes.append('')

    os.makedirs(SORTIE, exist_ok=True)
    dest = os.path.join(SORTIE, nom_fichier(chemin) + '.md')
    with open(dest, 'w', encoding='utf-8', newline='\n') as fh:
        fh.write('\n'.join(lignes))
    print('  %s -> %s (%d blocs, %d images)'
          % (chemin, os.path.relpath(dest, ROOT).replace('\\', '/'),
             sum(1 for b in blocs if b[0] != 'img'), len(images)))
    return dest


def main(argv):
    telecharge = '--images' in argv
    argv = [a for a in argv if a != '--images']
    chemins = []
    if '--liste' in argv:
        i = argv.index('--liste')
        for ligne in open(argv[i + 1], encoding='utf-8'):
            ligne = ligne.split('#')[0].strip()
            if ligne:
                chemins.append(ligne)
        argv = argv[:i] + argv[i + 2:]
    chemins += [a for a in argv if not a.startswith('--')]
    if not chemins:
        print(__doc__)
        return 1
    print('Extraction de %d page(s) :' % len(chemins))
    for c in chemins:
        extrait(c, telecharge)
    return 0


if __name__ == '__main__':
    sys.exit(main(sys.argv[1:]))
