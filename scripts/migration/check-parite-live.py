"""Compare le site EN LIGNE (victrix.ca, aujourd'hui) au contenu du dépôt.

Pourquoi : l'export WXR date du 2026-07-23. Le site a bougé depuis (slugs
d'articles renommés, pages ajoutées). Le plan de site de Yoast, lui, est à
jour — c'est donc la meilleure référence pour vérifier qu'on ne perd rien.

Ce que l'outil fait :
  1. lit les plans de site de victrix.ca (ou le cache
     docs/migration/urls-live.csv avec --cache) ;
  2. indexe TOUT le contenu du dépôt (blog, services, pages, solutions,
     landing) avec, pour chacun, son slug, son nom de fichier et son `wpUrl`
     quand il existe ;
  3. écrit docs/migration/parite-live.md : ce qui manque, ce dont le slug a
     dérivé (→ redirection à écrire), et ce que le dépôt a en plus.

    python scripts/migration/check-parite-live.py           # va chercher en ligne
    python scripts/migration/check-parite-live.py --cache    # relit le CSV local

Le plan de site EXCLUT les pages `noindex` : les pages de campagne cachées
n'y sont pas, par construction. Elles se listent avec
scripts/migration/extract-source-page.py et la liste que fournit le marketing.
"""
import csv
import io
import json
import os
import re
import sys
import urllib.request

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.abspath(os.path.join(HERE, '..', '..'))
BASE = 'https://www.victrix.ca'
UA = 'Mozilla/5.0'
CACHE = os.path.join(ROOT, 'docs', 'migration', 'urls-live.csv')
RAPPORT = os.path.join(ROOT, 'docs', 'migration', 'parite-live.md')


def fetch(url):
    req = urllib.request.Request(url, headers={'User-Agent': UA})
    return urllib.request.urlopen(req, timeout=40).read().decode('utf-8', 'replace')


def urls_en_ligne():
    idx = fetch(BASE + '/sitemap_index.xml')
    out = []
    for sm in re.findall(r'<loc>([^<]+)</loc>', idx):
        nom = sm.rsplit('/', 1)[-1].replace('-sitemap.xml', '')
        if nom in ('author', 'category'):
            continue
        body = fetch(sm)
        for bloc in re.findall(r'<url>(.*?)</url>', body, re.S):
            loc = re.search(r'<loc>([^<]+)</loc>', bloc)
            mod = re.search(r'<lastmod>([^<]+)</lastmod>', bloc)
            if loc:
                out.append({'type': nom, 'url': loc.group(1),
                            'chemin': loc.group(1).replace(BASE, '') or '/',
                            'modifie': mod.group(1) if mod else ''})
    with io.open(CACHE, 'w', encoding='utf-8', newline='') as fh:
        w = csv.DictWriter(fh, fieldnames=['type', 'url', 'chemin', 'modifie'])
        w.writeheader()
        w.writerows(out)
    return out


def lit_cache():
    with io.open(CACHE, encoding='utf-8') as fh:
        return list(csv.DictReader(fh))


# Renommages VOULUS entre l'ancien site et la refonte : dernier segment de
# l'URL en ligne -> nom de fichier (ou slug) dans le dépôt. Tenir cette table
# à la main : c'est la mémoire des décisions de la migration.
ALIAS = {
    '(accueil)': 'accueil',
    'decouvrir-victrix': 'decouvrir',
    'discover-victrix': 'decouvrir',
    'carriere': 'carrieres',
    'careers': 'carrieres',
    'ressources': 'ressources',
    'resources-center': 'ressources',
    'mon-portail': 'connexion',
    'customer-portal': 'connexion',
    'page-de-remerciement': 'merci',
    'thank-you-page': 'merci',
    'conditions-dutilisation': 'conditions-utilisation',
    'terms-of-use': 'conditions-utilisation',
    'politique-de-confidentialite': 'politique-confidentialite',
    'privacy-policy': 'politique-confidentialite',
    'no-access': 'acces-refuse',
    'contact': 'contact',
    'contactez-nous': 'contact',
    # articles renommés sur le site EN LIGNE après l'export du 23/07
    'zero-trust-network-access-ztna-modele-de-cybersecurite-optimal': 'zero-trust-network-access-ztna',
    'zero-trust-network-access-ztna-ultimate-cybersecurity-model': 'zero-trust-network-access-ztna',
}


# Pages du nouveau site qui sont des ROUTES (pas des fichiers de contenu) :
# leur texte vit dans src/data. Sans cette table, la comparaison les compte
# comme « perdues ».
ROUTES = {
    'contact': 'src/pages/[lang]/contact.astro',
    'merci': 'src/pages/[lang]/merci.astro',
    'connexion': 'src/pages/[lang]/portail/',
    'ressources': 'src/pages/[lang]/ressources/',
    'recherche': 'src/pages/[lang]/recherche.astro',
    'accueil': 'src/pages/[lang]/index.astro',
    'acces-refuse': 'src/pages/[lang]/portail/',
}


def langue_de(chemin):
    return 'en' if chemin.startswith('/en/') or chemin == '/en' else 'fr'


def frontmatter(texte):
    m = re.match(r'^---\n(.*?)\n---', texte, re.S)
    if not m:
        return {}
    out = {}
    for ligne in m.group(1).split('\n'):
        mm = re.match(r'^([A-Za-z0-9_]+):\s*(.*)$', ligne)
        if mm:
            out[mm.group(1)] = mm.group(2).strip().strip('"').strip("'")
    return out


def index_depot():
    """{clé de rapprochement -> [description de l'entrée…]}"""
    idx = {}

    def ajoute(cle, info):
        if cle:
            idx.setdefault(cle.strip('/').lower(), []).append(info)

    racine = os.path.join(ROOT, 'src', 'content')
    for dossier, _sd, fichiers in os.walk(racine):
        for f in fichiers:
            if not f.endswith(('.md', '.json')):
                continue
            chemin = os.path.join(dossier, f)
            rel = os.path.relpath(chemin, ROOT).replace('\\', '/')
            collection = rel.split('/')[2] if len(rel.split('/')) > 3 else '?'
            nom = os.path.splitext(f)[0]
            texte = io.open(chemin, encoding='utf-8').read()
            if f.endswith('.md'):
                fm = frontmatter(texte)
            else:
                try:
                    fm = json.loads(texte)
                except ValueError:
                    fm = {}
            # langue = premier segment sous la collection (src/content/<coll>/<lang>/…)
            morceaux = rel.split('/')
            lang = morceaux[3] if len(morceaux) > 4 and morceaux[3] in ('fr', 'en') else ''
            info = {'fichier': rel, 'collection': collection, 'nom': nom, 'lang': lang,
                    'slug': (fm.get('slug') or '') if isinstance(fm.get('slug'), str) else '',
                    'wpUrl': (fm.get('wpUrl') or '') if isinstance(fm.get('wpUrl'), str) else ''}
            ajoute(nom, info)
            if info['slug']:
                ajoute(info['slug'].split('/')[-1], info)
            if info['wpUrl']:
                ajoute(info['wpUrl'], info)
                ajoute(info['wpUrl'].strip('/').split('/')[-1], info)
    return idx


def main(argv):
    lignes_live = lit_cache() if '--cache' in argv else urls_en_ligne()
    print('URL en ligne (plan de site) :', len(lignes_live))
    idx = index_depot()
    print('clés indexées dans le dépôt :', len(idx))

    absents, derive, trouves = [], [], []
    for r in lignes_live:
        chemin = r['chemin']
        lang = langue_de(chemin)
        dernier = chemin.strip('/').split('/')[-1].lower() if chemin.strip('/') not in ('', 'en') else '(accueil)'
        # un renommage VOULU reste une redirection à écrire : on le compte dans
        # la dérive, pas dans « retrouvé sans rien à faire ».
        renomme = dernier in ALIAS and ALIAS[dernier] != dernier
        dernier = ALIAS.get(dernier, dernier)

        def bons(infos):
            """Entrées de la bonne langue (ou sans langue) d'abord."""
            memes = [i for i in (infos or []) if i['lang'] in (lang, '')]
            return memes or None

        par_url = bons(idx.get(chemin.strip('/').lower())) or bons(idx.get(chemin.lower()))
        par_slug = bons(idx.get(dernier))
        trouve = None
        if par_url:
            trouve = par_url[0]
        elif par_slug:
            trouve = par_slug[0]
        elif dernier in ROUTES:
            trouve = {'fichier': ROUTES[dernier], 'collection': 'route',
                      'nom': dernier, 'lang': lang, 'slug': dernier, 'wpUrl': ''}
        if trouve is not None:
            (derive if renomme else trouves).append((r, trouve) if renomme else (r, trouve, 'ok'))
        else:
            # dérive de slug : un fichier du dépôt dont le nom ressemble
            proches = []
            mots = set(re.split(r'[-/]', dernier)) - {'fr', 'en', ''}
            for cle, infos in idx.items():
                for i in infos:
                    if i['lang'] not in (lang, ''):
                        continue
                    communs = mots & (set(re.split(r'[-/]', cle)) - {'fr', 'en', ''})
                    if len(communs) >= max(2, len(mots) - 2):
                        proches.append((len(communs), i))
            if proches:
                proches.sort(key=lambda t: -t[0])
                derive.append((r, proches[0][1]))
            else:
                absents.append(r)

    vus = {t[1]['fichier'] for t in trouves} | {d[1]['fichier'] for d in derive}
    en_trop = sorted({i['fichier'] for lst in idx.values() for i in lst} - vus)

    out = []
    out.append('# Parité avec le site EN LIGNE')
    out.append('')
    out.append('> Généré par `scripts/migration/check-parite-live.py` à partir des plans')
    out.append('> de site de victrix.ca. **Les pages `noindex` (campagnes cachées) n\'y sont')
    out.append('> pas** : le plan de site les exclut par construction.')
    out.append('')
    out.append('| | Nombre |')
    out.append('| --- | --- |')
    out.append('| URL en ligne examinées | %d |' % len(lignes_live))
    out.append('| Retrouvées dans le dépôt | %d |' % len(trouves))
    out.append('| **Slug différent** (redirection à écrire) | **%d** |' % len(derive))
    out.append('| **Sans équivalent trouvé** | **%d** |' % len(absents))
    out.append('')

    out.append('## 1. URL en ligne sans équivalent dans le dépôt')
    out.append('')
    if absents:
        out.append('| Type | URL en ligne | Modifiée le |')
        out.append('| --- | --- | --- |')
        for r in absents:
            out.append('| %s | `%s` | %s |' % (r['type'], r['chemin'], (r['modifie'] or '')[:10]))
    else:
        out.append('Aucune. ✅')
    out.append('')

    out.append('## 2. Slug qui a dérivé entre le site en ligne et le dépôt')
    out.append('')
    out.append('Chaque ligne est une **redirection 301 à écrire** : l\'URL de gauche est')
    out.append('celle qui circule aujourd\'hui (Google, LinkedIn, courriels).')
    out.append('')
    if derive:
        out.append('| URL en ligne | Fichier du dépôt | Slug du dépôt |')
        out.append('| --- | --- | --- |')
        for r, info in derive:
            out.append('| `%s` | `%s` | `%s` |' % (r['chemin'], info['fichier'],
                                                   info['slug'] or info['nom']))
    else:
        out.append('Aucune. ✅')
    out.append('')

    out.append('## 3. Contenus du dépôt qui ne correspondent à aucune URL en ligne')
    out.append('')
    out.append('Normal pour : pages neuves de la refonte, pages de campagne `noindex`,')
    out.append('démos. À relire quand même.')
    out.append('')
    for f in en_trop:
        out.append('- `%s`' % f)
    out.append('')

    with io.open(RAPPORT, 'w', encoding='utf-8', newline='\n') as fh:
        fh.write('\n'.join(out))
    print('rapport ->', os.path.relpath(RAPPORT, ROOT).replace('\\', '/'))
    print('  sans equivalent : %d | slug derive : %d | dans le depot seulement : %d'
          % (len(absents), len(derive), len(en_trop)))
    return 1 if absents else 0


if __name__ == '__main__':
    sys.exit(main(sys.argv[1:]))
