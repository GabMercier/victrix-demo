"""`check:parite-texte` — le TEXTE de chaque page de l'ancien site est-il arrivé ?

LA QUESTION QUE L14 NE POSAIT PAS. `check:old-urls` prouve que chaque ADRESSE
de l'ancien site mène à une page (172 / 173). Il ne dit rien du CONTENU de
cette page. Le 2026-09-23, trois blocs entiers de Découvrir et deux de
l'Accueil manquaient depuis la migration sans qu'aucun garde-fou ne le voie
(lot L-contenu-perdu). 73 expertises, 24 pages et 62 articles n'avaient jamais
été comparés source ↔ cible. C'est ce que ce script mesure — et REJOUE.

CE QU'IL FAIT. Une ligne par PAGE CIBLE construite (pas par ancien alias) :
  1. le périmètre = les adresses de l'ancien site (plan de site en ligne
     `docs/migration/urls-live.csv` ∪ contenus publiés de l'export
     `docs/migration/urls-contenus.csv`, comme `check:old-urls`) ;
  2. chaque adresse est menée à sa page cible en rejouant les règles LIVRÉES
     (`dist/_cloudcannon/routing.json`, première correspondance gagne) et en
     vérifiant la page dans `dist/` — même parcours que `check:old-urls` ;
  3. la page SOURCE est téléchargée depuis victrix.ca (User-Agent navigateur)
     et mise en cache dans `docs/migration/cache-source/` — allégée de ses
     scripts, styles et SVG, pour ne pas la re-télécharger à chaque passe et
     pour survivre à la mise hors ligne de l'ancien site ;
  4. mots de la source : le contenu principal, lu par le parseur EXISTANT
     (`Blocks` d'import-pages-fournisseurs.py — titres, paragraphes, listes ;
     saute en-tête, pied, nav, formulaires), débarrassé en plus du chrome du
     thème WordPress qui vit hors de ces balises : barre promotionnelle
     (`div.sticky-info`), carrousel d'articles (`div.widget-posts-carrousel`),
     « derniers articles » des billets (`div.related`), bandeau de contact
     (`section.contact-banner`), fil d'Ariane et mention « * champs
     nécessaires » des formulaires ;
  5. mots de la cible : `<main>` seulement, sans nav, formulaires, scripts,
     ni les blocs `data-pagefind-ignore` (fil d'Ariane, articles liés
     recalculés au build) — le bandeau de consentement et le pied sont hors
     de `<main>` ;
  6. ratio cible / source, et les H2/H3 de la source ABSENTS de la cible
     (titres normalisés : casse, accents, ponctuation, espaces ; cherchés dans
     TOUT le texte de `<main>`, articles liés compris, parce qu'un titre qui
     survit en carte ou en chapeau n'est pas perdu) ;
  7. pour chaque titre absent, le TEXTE de son bloc (les paragraphes jusqu'au
     titre suivant) est-il, lui, arrivé ? Mesuré par la part des mots
     significatifs (≥ 5 lettres) du bloc retrouvés dans la cible : sous 50 %,
     c'est un BLOC PERDU (✗) ; au-dessus, un titre REFORMULÉ (≈) — la refonte
     a raccourci « Gradation de la preuve de concept » en « Gradation », le
     texte est là. Première passe (2026-09-23) : 119 pages sur 151 avaient un
     titre absent, presque toutes par reformulation ; la distinction est ce
     qui rend la liste lisible.

SIGNALÉ si ratio < 0,7 OU ≥ 1 bloc perdu. Une cible PLUS LONGUE n'est pas
un défaut. Le rapport `docs/migration/parite-texte.md` va du pire ratio au
meilleur, par rubrique (services, pages, articles, campagnes).

RAPPORT SEUL — CODE DE SORTIE 0. Même marche que `check:old-urls` : Gabriel
tranche d'abord les cas signalés (contenu perdu à restaurer / bloc abandonné
volontairement / faux positif du parseur), les exceptions assumées s'écrivent
ensuite dans `docs/migration/correspondance-urls.json` (clé
`parite_texte_assumee` : page cible → raison), et `--strict` devient alors
bloquant au gate.

Usage :
    python scripts/migration/check-parite-texte.py                  # dist/ du dépôt
    python scripts/migration/check-parite-texte.py --dist <chemin>  # build isolé (serveur de dev actif)
    python scripts/migration/check-parite-texte.py --refresh        # re-télécharge les sources
    python scripts/migration/check-parite-texte.py --strict         # code 1 s'il reste une page signalée non assumée
    npm run check:parite-texte

Sous Git Bash, passer les chemins avec MSYS_NO_PATHCONV=1 (sinon `/dist` est
réécrit en chemin Windows).
"""
import csv
import datetime
import importlib.util
import io
import json
import os
import re
import sys
import time
import unicodedata
import urllib.error
import urllib.request
from html.parser import HTMLParser

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.abspath(os.path.join(HERE, '..', '..'))


def _module(nom, fichier):
    spec = importlib.util.spec_from_file_location(nom, os.path.join(HERE, fichier))
    mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)
    return mod


base = _module('fournisseurs', 'import-pages-fournisseurs.py')   # Blocks, plain, BASE
esp = _module('extract_source_page', 'extract-source-page.py')   # nom_fichier, normalise_chemin

STRICT = '--strict' in sys.argv
REFRESH = '--refresh' in sys.argv
DIST = os.path.join(ROOT, 'dist')
if '--dist' in sys.argv:
    DIST = os.path.abspath(sys.argv[sys.argv.index('--dist') + 1])

CACHE = os.path.join(ROOT, 'docs', 'migration', 'cache-source')
INDEX_CACHE = os.path.join(CACHE, '_index.json')
RAPPORT = os.path.join(ROOT, 'docs', 'migration', 'parite-texte.md')
CORRESPONDANCE = os.path.join(ROOT, 'docs', 'migration', 'correspondance-urls.json')
REGISTRE = os.path.join(ROOT, 'docs', 'inventaire-pages.md')

SEUIL_RATIO = 0.7
SEUIL_BLOC = 0.5     # part des mots significatifs d'un bloc retrouvés dans la cible
MOTS_BLOC_MIN = 8    # en dessous, le bloc n'a pas de texte à perdre (titre + bouton)
SAUTS_MAX = 5
PAUSE = 0.25  # s entre deux téléchargements — on est poli avec le site en ligne

# Chrome du thème WordPress qui vit HORS de header/footer/nav/form (que le
# parseur saute déjà). Classes exactes, relevées le 2026-09-23 sur les trois
# gabarits (SiteOrigin, Brizy, billet).
CLASSES_CHROME = {'sticky-info', 'widget-posts-carrousel', 'related', 'contact-banner'}
RE_FIL_ARIANE = re.compile(r'^(Accueil|Home)\s*/\s', re.I)
RE_FORMULAIRE = re.compile(r'indique les champs nécessaires|indicates required fields|champs obligatoires', re.I)

# Cible : balises exclues du décompte ET de la recherche de titres.
CIBLE_EXCLUES = {'script', 'style', 'noscript', 'svg', 'template', 'nav', 'form', 'dialog', 'select', 'option'}
VOID = {'img', 'br', 'hr', 'meta', 'link', 'input', 'source', 'wbr', 'area', 'base', 'col', 'embed', 'param', 'track'}


# ------------------------------------------------------------------ outils

def mots(texte):
    return [m for m in texte.split() if re.search(r'[0-9A-Za-zÀ-ÿ]', m)]


def normalise_chemin(chemin):
    """Forme INDEXÉE : barre finale, jamais de double (comme check-old-urls)."""
    if not chemin:
        return ''
    p = chemin.strip()
    if not p.startswith('/'):
        p = '/' + p
    p = re.sub(r'/{2,}', '/', p)
    if not p.endswith('/') and not re.search(r'\.[a-z0-9]{2,5}$', p, re.I):
        p += '/'
    return p


def normalise_titre(t):
    t = unicodedata.normalize('NFKD', t)
    t = ''.join(c for c in t if not unicodedata.combining(c))
    t = t.lower().replace('œ', 'oe').replace('æ', 'ae').replace('ø', 'o')
    return re.sub(r'[^a-z0-9]+', ' ', t).strip()


def titre_utile(norme):
    """Un titre trop court ou sans lettre (« + 30 ») ne prouve rien."""
    return len(norme.replace(' ', '')) >= 3 and re.search(r'[a-z]', norme)


def mots_significatifs(texte_norme):
    """Les mots d'au moins 5 lettres, sans doublon : ce qu'un bloc a d'unique."""
    return {m for m in texte_norme.split() if len(m) >= 5 and not m.isdigit()}


def lire_csv(chemin):
    with io.open(chemin, encoding='utf-8', newline='') as fh:
        return list(csv.DictReader(fh))


# ------------------------------------------------------------- périmètre

def perimetre():
    """{chemin normalisé -> {'origines': set, 'type': str}} — l'union de L14."""
    out = {}

    def ajoute(chemin, origine, typ):
        p = normalise_chemin(chemin)
        if not p or p.startswith('/wp-content/uploads/'):
            return
        e = out.setdefault(p, {'origines': set(), 'type': typ})
        e['origines'].add(origine)

    for r in lire_csv(os.path.join(ROOT, 'docs', 'migration', 'urls-live.csv')):
        ajoute(r['chemin'], 'live', r['type'])
    for r in lire_csv(os.path.join(ROOT, 'docs', 'migration', 'urls-contenus.csv')):
        if r['statut'] == 'publish':
            ajoute(r['chemin'], 'export', r['type'])
    return out


def decisions():
    with io.open(CORRESPONDANCE, encoding='utf-8') as fh:
        d = json.load(fh)
    hors = {}
    for cle, raison in (('abandonnees', 'page abandonnée (décision : 301 vers le plus proche)'),
                        ('temporaires', 'page à recréer (302 d\'attente — L12 / L-prix)'),
                        # D19 (2026-09-24) : article passé en brouillon, 301 vers la page la
                        # plus proche — comparer son texte à cette page n'aurait aucun sens.
                        ('articles_retires', 'article retiré (D19 : brouillon + 301 vers le plus proche)')):
        for chemin in d.get(cle, {}):
            hors[normalise_chemin(chemin)] = raison
    ignorer = {normalise_chemin(c) for c in d.get('ignorer', [])}
    assumees = {normalise_chemin(k): v for k, v in d.get('parite_texte_assumee', {}).items()}
    return hors, ignorer, assumees


# ------------------------------------------------------ parcours vers dist/

def charge_routes():
    chemin = os.path.join(DIST, '_cloudcannon', 'routing.json')
    if not os.path.exists(chemin):
        sys.exit('[check:parite-texte] %s est introuvable.\n'
                 'Ce garde-fou relit les artefacts LIVRÉS : il faut un build. Lance `npm run build`,\n'
                 'ou, si le serveur de dev tourne (port 4321), builde dans une copie isolée\n'
                 '(docs/operations.md § 3.1) puis passe `--dist <chemin>/dist`.' % chemin)
    with io.open(chemin, encoding='utf-8') as fh:
        return json.load(fh).get('routes', [])


_motifs = {}


def applique(routes, chemin):
    for r in routes:
        if r['from'] == chemin:
            return r['to']
        if '(.*)' in r['from']:
            motif = _motifs.get(r['from'])
            if motif is None:
                morceaux = [re.escape(m) for m in r['from'].split('(.*)')]
                motif = _motifs[r['from']] = re.compile('^' + '(.*)'.join(morceaux) + '$')
            m = motif.match(chemin)
            if m:
                return r['to'].replace('$1', m.group(1) if m.groups() else '')
    return None


def fichier_page(chemin):
    """Le fichier construit derrière une adresse, ou None (statique Astro)."""
    p = chemin.split('#')[0].split('?')[0]
    sans = p.rstrip('/')
    for c in (os.path.join(DIST, *sans.strip('/').split('/'), 'index.html') if sans else os.path.join(DIST, 'index.html'),
              os.path.join(DIST, *(sans.strip('/') + '.html').split('/')) if sans else ''):
        if c and os.path.isfile(c):
            return c
    return None


def cible_de(routes, chemin):
    """Adresse cible normalisée + fichier construit, ou (None, None)."""
    if fichier_page(chemin):
        return chemin, fichier_page(chemin)
    courant = chemin
    for _ in range(SAUTS_MAX):
        vers = applique(routes, courant)
        if not vers:
            return None, None
        courant = vers
        f = fichier_page(courant)
        if f:
            return normalise_chemin(courant), f
    return None, None


# ----------------------------------------------------------- source (WP)

def allege(html):
    """Ce qu'on garde en cache : la page sans scripts, styles ni SVG."""
    return re.sub(r'<(script|style|noscript|svg)\b[^>]*>.*?</\1\s*>', '', html, flags=re.S | re.I)


def lit_index_cache():
    if os.path.exists(INDEX_CACHE):
        with io.open(INDEX_CACHE, encoding='utf-8') as fh:
            return json.load(fh)
    return {}


def ecrit_index_cache(idx):
    os.makedirs(CACHE, exist_ok=True)
    with io.open(INDEX_CACHE, 'w', encoding='utf-8', newline='\n') as fh:
        json.dump(dict(sorted(idx.items())), fh, ensure_ascii=False, indent=2)
        fh.write('\n')


def source_html(chemin, index):
    """HTML allégé de la page en ligne (cache d'abord), ou None + statut."""
    nom = esp.nom_fichier(chemin) + '.html'
    dest = os.path.join(CACHE, nom)
    entree = index.get(chemin)
    if entree and not REFRESH:
        if entree.get('statut') == 200 and os.path.exists(dest):
            with io.open(dest, encoding='utf-8') as fh:
                return fh.read(), 200
        if entree.get('statut') != 200:
            return None, entree.get('statut')
    url = base.BASE + chemin
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
    try:
        resp = urllib.request.urlopen(req, timeout=40)
        brut = resp.read().decode('utf8', 'ignore')
        statut, finale = resp.status, resp.geturl()
    except urllib.error.HTTPError as e:
        statut, finale, brut = e.code, url, ''
    except (urllib.error.URLError, TimeoutError, OSError) as e:
        print('  RÉSEAU %s : %s' % (chemin, e))
        return None, 'réseau'
    time.sleep(PAUSE)
    entree = {'statut': statut, 'url_finale': finale.replace(base.BASE, '') or '/',
              'telecharge_le': datetime.date.today().isoformat()}
    if statut == 200:
        html = allege(brut)
        os.makedirs(CACHE, exist_ok=True)
        with io.open(dest, 'w', encoding='utf-8', newline='\n') as fh:
            fh.write(html)
        entree['fichier'] = nom
        entree['octets'] = len(html.encode('utf-8'))
    index[chemin] = entree
    ecrit_index_cache(index)
    return (html, 200) if statut == 200 else (None, statut)


class BlocsSansChrome(base.Blocks):
    """Le parseur existant, plus un saut des éléments de chrome par CLASSE."""

    def __init__(self):
        super().__init__()
        self.chrome = None  # [tag, profondeur]

    def handle_starttag(self, tag, attrs):
        if self.chrome:
            if tag == self.chrome[0]:
                self.chrome[1] += 1
            return
        classes = set((dict(attrs).get('class') or '').split())
        if classes & CLASSES_CHROME:
            self.chrome = [tag, 1]
            self.skip += 1
            return
        super().handle_starttag(tag, attrs)

    def handle_endtag(self, tag):
        if self.chrome:
            if tag == self.chrome[0]:
                self.chrome[1] -= 1
                if self.chrome[1] == 0:
                    self.chrome = None
                    self.skip = max(0, self.skip - 1)
            return
        super().handle_endtag(tag)


def blocs_source(html):
    """Les blocs (kind, texte) du contenu principal, chrome retiré."""
    p = BlocsSansChrome()
    p.feed(html)
    blocs = []
    for kind, htm, alt in p.out:
        if kind == 'img':
            continue
        texte = base.plain(htm)
        if kind == 'p' and (RE_FIL_ARIANE.match(texte) or RE_FORMULAIRE.search(texte)):
            continue
        blocs.append((kind, texte))
    return blocs


def analyse_source(html):
    """(mots, titres, nombre de blocs) du contenu principal.

    Chaque titre : (normalisé, brut, mots significatifs du bloc qui le suit —
    jusqu'au prochain H1/H2/H3)."""
    blocs = blocs_source(html)
    n = sum(len(mots(t)) for _, t in blocs)
    titres = []
    for i, (kind, t) in enumerate(blocs):
        if kind not in ('h2', 'h3'):
            continue
        norme = normalise_titre(t)
        if not titre_utile(norme) or norme in [x[0] for x in titres]:
            continue
        corps = []
        for k2, t2 in blocs[i + 1:]:
            if k2 in ('h1', 'h2', 'h3'):
                break
            corps.append(t2)
        titres.append((norme, t, mots_significatifs(normalise_titre(' '.join(corps)))))
    return n, titres, len(blocs)


# ----------------------------------------------------------- cible (dist)

class TexteCible(HTMLParser):
    """Texte de <main> : `compte` (sans chrome ni blocs pagefind-ignore) et
    `tout` (le même, blocs pagefind-ignore compris — pour retrouver un titre)."""

    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.pile = []          # [tag, exclu, ignore]
        self.dans_main = False
        self.a_main = False
        self.compte, self.tout = [], []

    def handle_starttag(self, tag, attrs):
        if tag == 'main':
            self.dans_main = self.a_main = True
        if tag in VOID:
            if tag == 'br':
                self.compte.append(' ')
                self.tout.append(' ')
            return
        a = dict(attrs)
        exclu = tag in CIBLE_EXCLUES or (self.pile and self.pile[-1][1])
        ignore = 'data-pagefind-ignore' in a or (self.pile and self.pile[-1][2])
        self.pile.append([tag, bool(exclu), bool(ignore)])

    def handle_endtag(self, tag):
        for i in range(len(self.pile) - 1, -1, -1):
            if self.pile[i][0] == tag:
                del self.pile[i:]
                break
        if tag == 'main':
            self.dans_main = False
        # un bloc fermé sépare deux mots
        self.compte.append(' ')
        self.tout.append(' ')

    def handle_data(self, data):
        if not self.dans_main or not self.pile or self.pile[-1][1]:
            return
        self.tout.append(data)
        if not self.pile[-1][2]:
            self.compte.append(data)


def analyse_cible(fichier):
    with io.open(fichier, encoding='utf-8') as fh:
        html = fh.read()
    p = TexteCible()
    if '<main' not in html:   # pas de <main> : on lit tout le corps
        html = html.replace('<body', '<main', 1).replace('</body>', '</main>', 1)
    p.feed(html)
    texte = ' '.join(p.compte)
    return len(mots(texte)), normalise_titre(' '.join(p.tout))


# ---------------------------------------------------- fichier du dépôt

def registre():
    """ancienne adresse -> « Source du contenu » du registre de Julie."""
    out = {}
    if not os.path.exists(REGISTRE):
        return out
    motif = re.compile(r'^\| `([^`]+)` \| (FR|EN) \| (.*?) \| ([^|]*) \| ([^|]*) \| ([^|]*) \|\s*$')
    with io.open(REGISTRE, encoding='utf-8') as fh:
        for ligne in fh:
            m = motif.match(ligne)
            if m:
                out[normalise_chemin(m.group(1))] = m.group(6).strip()
    return out


def index_depot():
    """clé (nom de fichier, slug, wpUrl) -> chemin du fichier — repli du registre."""
    idx = {}
    racine = os.path.join(ROOT, 'src', 'content')
    for dossier, _sd, fichiers in os.walk(racine):
        for f in fichiers:
            if not f.endswith(('.md', '.json')):
                continue
            chemin = os.path.join(dossier, f)
            rel = os.path.relpath(chemin, ROOT).replace('\\', '/')
            with io.open(chemin, encoding='utf-8') as fh:
                texte = fh.read()
            lang = rel.split('/')[3] if len(rel.split('/')) > 4 else ''
            fm = {}
            if f.endswith('.json'):
                try:
                    fm = json.loads(texte)
                except ValueError:
                    fm = {}
            else:
                m = re.match(r'^---\n(.*?)\n---', texte, re.S)
                if m:
                    for l in m.group(1).split('\n'):
                        mm = re.match(r'^([A-Za-z0-9_]+):\s*(.*)$', l)
                        if mm:
                            fm[mm.group(1)] = mm.group(2).strip().strip('"').strip("'")
            cles = {os.path.splitext(f)[0]}
            if isinstance(fm.get('slug'), str) and fm['slug']:
                cles.add(fm['slug'].strip('/').split('/')[-1])
            if isinstance(fm.get('wpUrl'), str) and fm['wpUrl']:
                cles.add(normalise_chemin(fm['wpUrl']))
            for c in cles:
                idx.setdefault((lang, c.lower()), rel)
    return idx


def est_noindex(rel):
    if not rel or not rel.startswith('src/content/'):
        return False
    chemin = os.path.join(ROOT, *rel.split('/'))
    if not os.path.exists(chemin):
        return False
    with io.open(chemin, encoding='utf-8') as fh:
        texte = fh.read(4000)
    return bool(re.search(r'"noindex":\s*true|^noindex:\s*true', texte, re.M))


def rubrique(cible, fichier):
    if re.match(r'^/(fr|en)/ressources/[^/]+/$', cible):
        return 'articles'
    if '/campagnes/' in cible:
        return 'campagnes'
    if fichier.startswith(('src/content/services/', 'src/content/landing/')) and est_noindex(fichier):
        return 'campagnes'
    if '/services/' in cible:
        return 'services'
    return 'pages'


# ------------------------------------------------------------------ main

def main():
    sys.stdout.reconfigure(encoding='utf-8', errors='replace')
    routes = charge_routes()
    peri = perimetre()
    hors_decision, ignorer, assumees = decisions()
    reg = registre()
    idx = index_depot()
    index_cache = lit_index_cache()

    # 1. chaque adresse ancienne -> page cible
    par_cible = {}       # cible -> [adresses]
    hors = []            # (adresse, raison)
    for chemin, info in sorted(peri.items()):
        if chemin in hors_decision:
            hors.append((chemin, hors_decision[chemin]))
            continue
        cible, fichier = cible_de(routes, chemin)
        if not cible:
            hors.append((chemin, 'URL de l\'ancien CMS sans équivalent (ignorée)' if chemin in ignorer
                         else 'aucune page construite n\'y répond (voir check:old-urls)'))
            continue
        par_cible.setdefault(cible, {'fichier': fichier, 'sources': []})['sources'].append(chemin)

    # 2. les sources : téléchargement (ou cache) + analyse
    print('check:parite-texte — %d pages cibles, %d adresses anciennes' % (len(par_cible), len(peri)))
    analyses = {}   # adresse -> (mots, titres, blocs) | None
    statuts = {}
    for cible, e in par_cible.items():
        for chemin in e['sources']:
            if chemin in analyses:
                continue
            html, statut = source_html(chemin, index_cache)
            statuts[chemin] = statut
            analyses[chemin] = analyse_source(html) if html else None

    # 3. une ligne par page cible
    lignes = []
    for cible, e in par_cible.items():
        candidats = [c for c in e['sources'] if analyses.get(c)]
        if not candidats:
            for c in e['sources']:
                hors.append((c, 'source non lisible en ligne (HTTP %s)' % statuts.get(c)))
            continue
        # la source retenue : le plan de site en ligne d'abord, puis la plus fournie
        candidats.sort(key=lambda c: (0 if 'live' in peri[c]['origines'] else 1, -analyses[c][0]))
        source = candidats[0]
        n_source, titres, n_blocs = analyses[source]
        n_cible, texte_cible = analyse_cible(e['fichier'])
        mots_cible = set(texte_cible.split())
        perdus, reformules = [], []   # (titre brut, part du bloc retrouvée)
        for norme, brut, corps in titres:
            if ' %s ' % norme in ' %s ' % texte_cible:
                continue
            if len(corps) < MOTS_BLOC_MIN:
                reformules.append((brut, None))        # rien à perdre sous ce titre
                continue
            part = len(corps & mots_cible) / len(corps)
            (perdus if part < SEUIL_BLOC else reformules).append((brut, part))
        fichier = reg.get(source) or next((reg[c] for c in e['sources'] if reg.get(c)), '')
        if not fichier or not fichier.startswith('`'):
            lang = 'en' if cible.startswith('/en/') else 'fr'
            segment = cible.strip('/').split('/')[-1].lower() if cible.strip('/') not in ('fr', 'en') else 'accueil'
            rel = idx.get((lang, source)) or idx.get((lang, segment)) or idx.get(('', segment))
            fichier = fichier or ('`%s`' % rel if rel else '—')
        ratio = (n_cible / n_source) if n_source else None
        signale = (ratio is not None and ratio < SEUIL_RATIO) or bool(perdus) or n_source == 0
        lignes.append({
            'cible': cible, 'source': source, 'autres': [c for c in e['sources'] if c != source],
            'mots_source': n_source, 'mots_cible': n_cible, 'ratio': ratio,
            'perdus': perdus, 'reformules': reformules,
            'titres': len(titres), 'fichier': fichier,
            'rubrique': rubrique(cible, fichier.strip('`')), 'signale': signale,
            'assumee': assumees.get(cible, ''),
        })

    lignes.sort(key=lambda l: (l['ratio'] if l['ratio'] is not None else -1, -len(l['perdus'])))
    signalees = [l for l in lignes if l['signale']]
    sous_seuil = [l for l in lignes if l['ratio'] is not None and l['ratio'] < SEUIL_RATIO]
    blocs_perdus = [l for l in lignes if l['perdus']]
    seulement_reformules = [l for l in lignes if l['reformules'] and not l['signale']]
    non_assumees = [l for l in signalees if not l['assumee']]

    # 4. rapport
    def ratio_txt(l):
        return '—' if l['ratio'] is None else ('%.2f' % l['ratio']).replace('.', ',')

    def court(t):
        return t if len(t) <= 60 else t[:57] + '…'

    def perdus_txt(l):
        """✗ bloc perdu (part du texte retrouvée) · ≈ titre reformulé, texte là."""
        vus = ['✗ « %s » (%d %%)' % (court(t), round(part * 100)) for t, part in l['perdus'][:4]]
        reste = len(l['perdus']) - 4
        if reste > 0:
            vus.append('✗ (+%d)' % reste)
        n_ref = len(l['reformules'])
        if n_ref:
            vus.append('≈ ' + ' · '.join('« %s »' % court(t) for t, _ in l['reformules'][:3])
                       + (' (+%d)' % (n_ref - 3) if n_ref > 3 else ''))
        return '<br>'.join(vus)

    def marque(l):
        if not l['signale']:
            return ''
        return '☑ assumée — %s' % l['assumee'] if l['assumee'] else '⚠️'

    def tableau(sel):
        out = ['| | Page cible | Adresse source | Mots source | Mots cible | Ratio | Titres H2/H3 absents de la cible | Fichier du dépôt |',
               '| --- | --- | --- | ---: | ---: | ---: | --- | --- |']
        for l in sel:
            src = '`%s`' % l['source'] + (' (+%d)' % len(l['autres']) if l['autres'] else '')
            out.append('| %s | `%s` | %s | %d | %d | %s | %s | %s |' % (
                marque(l), l['cible'], src, l['mots_source'], l['mots_cible'], ratio_txt(l),
                perdus_txt(l), l['fichier']))
        return out

    n_cache = sum(1 for v in index_cache.values() if v.get('statut') == 200)
    dates = sorted({v.get('telecharge_le', '') for v in index_cache.values() if v.get('telecharge_le')})
    r = []
    r.append('# Parité du texte : l\'ancien site est-il arrivé entier ?')
    r.append('')
    r.append('> Généré par `npm run check:parite-texte` — **ne pas modifier à la main.**')
    r.append('> Mesuré contre le build `%s` et les pages EN LIGNE de victrix.ca'
             % DIST.replace(ROOT, '.').replace('\\', '/'))
    r.append('> (cache `docs/migration/cache-source/`, %d pages, téléchargées %s).'
             % (n_cache, ('le ' + dates[0]) if len(dates) == 1 else ('du %s au %s' % (dates[0], dates[-1])) if dates else '—'))
    r.append('')
    r.append('La question posée, page par page : **le texte de l\'ancienne page est-il**')
    r.append('**arrivé sur la page qui la remplace ?** `check:old-urls` prouve que chaque')
    r.append('adresse mène quelque part ; ce rapport compare les VOLUMES et les TITRES.')
    r.append('')
    r.append('## Bilan')
    r.append('')
    r.append('| | Nombre |')
    r.append('| --- | --- |')
    r.append('| Pages cibles comparées (une ligne par page construite) | %d |' % len(lignes))
    r.append('| **Signalées** (ratio < %s ou ≥ 1 bloc perdu) | **%d** |' % (str(SEUIL_RATIO).replace('.', ','), len(signalees)))
    r.append('| dont ratio cible / source < %s | %d |' % (str(SEUIL_RATIO).replace('.', ','), len(sous_seuil)))
    r.append('| dont ≥ 1 bloc perdu (titre H2/H3 ET son texte absents de la cible) | %d |' % len(blocs_perdus))
    r.append('| Adresses anciennes hors comparaison (décisions, sources illisibles, sans page) | %d |' % len(hors))
    r.append('')
    r.append('Et %d pages où un titre de la source est absent mais son texte retrouvé (≈ titre'
             % len(seulement_reformules))
    r.append('reformulé ou raccourci par la refonte) : listées, **non signalées**.')
    r.append('')
    r.append('Mots de la source : contenu principal lu par le parseur de `extract-source-page.py`')
    r.append('(titres, paragraphes, listes ; sans en-tête, pied, nav, formulaires, barre')
    r.append('promotionnelle, carrousel d\'articles, bandeau de contact, fil d\'Ariane).')
    r.append('Mots de la cible : `<main>` du build, sans nav, formulaires, scripts ni blocs')
    r.append('`data-pagefind-ignore` (fil d\'Ariane, articles liés recalculés au build).')
    r.append('**Une cible plus longue n\'est pas un défaut.** Un titre est « absent » quand,')
    r.append('normalisé (casse, accents, ponctuation), il n\'apparaît nulle part dans `<main>`.')
    r.append('Il est ✗ **bloc perdu** si moins de %d %% des mots significatifs (≥ 5 lettres) des' % round(SEUIL_BLOC * 100))
    r.append('paragraphes qui le suivent sont dans la cible (le pourcentage retrouvé est entre')
    r.append('parenthèses), ≈ **reformulé** sinon, ou si le bloc n\'a pas de texte à perdre.')
    r.append('')
    r.append('## Les %d pires, toutes rubriques confondues' % min(10, len(signalees)))
    r.append('')
    r.append('Pour la passe à la main : contenu perdu à restaurer, bloc abandonné')
    r.append('volontairement, ou faux positif du parseur — Gabriel tranche, la restauration')
    r.append('est le lot L-restaure.')
    r.append('')
    r.extend(tableau(signalees[:10]) if signalees else ['_Aucune page signalée._'])
    r.append('')
    for rub, titre in (('services', 'Services'), ('pages', 'Pages'), ('articles', 'Articles'), ('campagnes', 'Campagnes')):
        sel = [l for l in lignes if l['rubrique'] == rub]
        r.append('## %s — %d pages, %d signalées' % (titre, len(sel), sum(1 for l in sel if l['signale'])))
        r.append('')
        r.extend(tableau(sel) if sel else ['_Aucune._'])
        r.append('')
    r.append('## Hors comparaison — %d adresses anciennes' % len(hors))
    r.append('')
    r.append('Décisions déjà prises dans `correspondance-urls.json`, sources que le site en')
    r.append('ligne ne sert plus, adresses sans page construite.')
    r.append('')
    r.append('| Adresse de l\'ancien site | Pourquoi |')
    r.append('| --- | --- |')
    for chemin, raison in sorted(hors):
        r.append('| `%s` | %s |' % (chemin, raison))
    r.append('')
    regroupees = [l for l in lignes if l['autres']]
    r.append('## Adresses regroupées sur une même page cible — %d' % len(regroupees))
    r.append('')
    r.append('Plusieurs anciennes adresses mènent à la même page : la source retenue est')
    r.append('celle du plan de site en ligne (sinon la plus fournie) ; les autres sont des')
    r.append('alias, anciens slugs ou pages fusionnées.')
    r.append('')
    r.append('| Page cible | Source retenue | Autres adresses |')
    r.append('| --- | --- | --- |')
    for l in sorted(regroupees, key=lambda l: l['cible']):
        r.append('| `%s` | `%s` | %s |' % (l['cible'], l['source'], ', '.join('`%s`' % a for a in l['autres'])))
    r.append('')

    os.makedirs(os.path.dirname(RAPPORT), exist_ok=True)
    with io.open(RAPPORT, 'w', encoding='utf-8', newline='\n') as fh:
        fh.write('\n'.join(r))

    print('')
    print('  Pages cibles comparées : %d' % len(lignes))
    print('  Signalées              : %d  (%d sous le ratio %s, %d avec un bloc perdu ; %d titres seulement reformulés)'
          % (len(signalees), len(sous_seuil), SEUIL_RATIO, len(blocs_perdus), len(seulement_reformules)))
    print('  Hors comparaison       : %d adresses anciennes' % len(hors))
    print('  Cache source           : %d pages dans %s' % (n_cache, CACHE.replace(ROOT, '.').replace('\\', '/')))
    print('  Rapport                : %s' % RAPPORT.replace(ROOT, '.').replace('\\', '/'))
    if STRICT and non_assumees:
        print('\n  --strict : %d page(s) signalée(s) sans exception assumée.' % len(non_assumees))
        return 1
    return 0


if __name__ == '__main__':
    sys.exit(main())
