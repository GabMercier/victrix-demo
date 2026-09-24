#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
blocs-manquants-pages.py — QUELS BLOCS (et quelles IMAGES) de l'ancien site ne
sont pas arrivés dans nos PAGES (services, pages générales, campagnes) ?
Le pendant de `blocs-manquants-articles.py` pour tout ce qui n'est pas un
article. Un rapport par page, bloc par bloc, texte prêt à coller.

POURQUOI (2026-09-23, demande de Gabriel). `check:parite-texte` juge à la
maille de la PAGE (ratio de mots + titres H2/H3). La page Intelligence
artificielle y sort à 1,01 et « titres reformulés », et pourtant : la fin
d'un paragraphe manque (« …et des recommandations pour le déploiement et
l'optimisation de la donnée »), un lien est tombé (ServiceNow AI Platform →
/ia-servicenow/), et l'image de héros n'est pas celle de l'ancienne page. La
consigne : « on peut reformuler et formater avec notre gabarit, mais il ne
faut RIEN perdre ». Ce script descend donc au BLOC, comme pour les articles.

CE QU'IL FAIT.
  1. même périmètre et même parcours que `check-parite-texte.py` (ancienne
     adresse → règles livrées → page construite dans `dist/`) ; une ligne par
     page cible, articles EXCLUS (couverts par blocs-manquants-articles.py) ;
  2. chaque bloc de la source (titre, paragraphe, item, citation) est cherché
     dans le `<main>` construit — mêmes verdicts que pour les articles
     (`juge_blocs`) : mot pour mot, sac de mots significatifs, titres au mot
     près, blocs courts « à vérifier », autre langue écartée ;
  3. IMAGES : chaque `<img>` de contenu de la source (sous /wp-content/uploads/,
     hors logos/icônes de moins de 3 lettres de nom) est cherchée dans la page
     construite par son NOM DE FICHIER (sans le suffixe de taille WordPress
     `-300x200`, `-scaled`, ni l'extension — un JPG passé en WebP compte comme
     présent). La première image de la source est marquée « héros ».
  4. LIENS : les `href` internes des blocs retrouvés sont comparés aux liens de
     la cible (après normalisation /fr/… et anciennes URL → nouvelles via les
     règles livrées) : un lien de la source absent de la cible est listé.

CE QU'IL NE FAIT PAS. Il n'écrit RIEN dans src/content : pour les pages, la
remise est un geste humain (le contenu est édité au CMS depuis la migration).
Il ne juge pas la FORME.

Usage :
  python scripts/migration/blocs-manquants-pages.py            # après un build
  python scripts/migration/blocs-manquants-pages.py --json     # + sortie machine
  python scripts/migration/blocs-manquants-pages.py --dist <chemin>/dist
  python scripts/migration/blocs-manquants-pages.py --only intelligence-artificielle,cybersecurite
"""
import importlib.util
import io
import json
import os
import re
import sys
from html.parser import HTMLParser

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.abspath(os.path.join(HERE, '..', '..'))


def _module(nom, fichier):
    spec = importlib.util.spec_from_file_location(nom, os.path.join(HERE, fichier))
    mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)
    return mod


cpt = _module('check_parite_texte', 'check-parite-texte.py')      # périmètre, parcours, cache, parseurs
bma = _module('blocs_manquants_articles', 'blocs-manquants-articles.py')  # juge_blocs, langue_du_texte

DIST = cpt.DIST
RAPPORT = os.path.join(ROOT, 'docs', 'migration', 'blocs-manquants-pages.md')
SORTIE_JSON = os.path.join(ROOT, 'docs', 'migration', 'blocs-manquants-pages.json')
JSON_AUSSI = '--json' in sys.argv
ONLY = set()
if '--only' in sys.argv:
    ONLY = {s.strip() for s in sys.argv[sys.argv.index('--only') + 1].split(',') if s.strip()}

RE_TAILLE_WP = re.compile(r'-(\d{2,4}x\d{2,4}|scaled)$')
# Le logo de Victrix lui-même (héros des pages de campagne), signatures, favicon :
# jamais du contenu. Les logos de PARTENAIRES et de CERTIFICATIONS, eux, en sont
# (Julie les réclame sur Cybersécurité et Productivité) : ils sont comptés à part.
RE_HORS_CONTENU = re.compile(r'logo-victrix|victrix-logo|signature|favicon')
RE_LOGO = re.compile(r'logo|icon|icone|badge|pastille|certif|techno-|partner|partenaire')
# Widgets de l'ancien thème que la refonte ne reprend pas comme tels : le
# carrousel d'équipe et l'intitulé du formulaire de contact de bas de page.
# Listés à part, hors décompte — la décision reste visible.
WIDGETS = {'rencontrez nos experts', 'meet our experts', 'parlons de vos projets',
           "let's talk about your projects", 'lets talk about your projects'}
# Un bloc absent dont la plupart des mots sont là est REFORMULÉ, pas perdu :
# la consigne est « on peut reformuler, il ne faut rien perdre ».
SEUIL_REFORMULE = 0.6
# Un paragraphe retrouvé (≥ 50 %) auquel il manque AU MOINS ce nombre de mots
# significatifs est « amputé » : une phrase ou une fin de phrase a sauté.
MOTS_AMPUTE = 3
BASE = cpt.base.BASE


def part_retrouvee(norme, mots_cible, longueur=4):
    """Part des mots de ≥ `longueur` lettres du bloc présents dans la cible, et les absents."""
    ms = [m for m in dict.fromkeys(norme.split()) if len(m) >= longueur and not m.isdigit()]
    if not ms:
        return None, []
    absents = [m for m in ms if m not in mots_cible]
    return 1 - len(absents) / len(ms), absents


# ------------------------------------------------------------------ images

def cle_image(src):
    """Nom de fichier comparable : sans dossier, sans suffixe de taille WP, sans extension."""
    nom = src.split('?')[0].split('#')[0].rstrip('/').split('/')[-1].lower()
    nom = re.sub(r'\.(jpe?g|png|webp|gif|svg|avif)$', '', nom)
    return RE_TAILLE_WP.sub('', nom)


def images_source(html):
    """Les images de CONTENU de la source, dans l'ordre (chrome retiré)."""
    p = cpt.BlocsSansChrome()
    p.feed(html)
    vues, out = set(), []
    for kind, src, alt in p.out:
        if kind != 'img':
            continue
        chemin = src[len(BASE):] if src.startswith(BASE) else src
        if not chemin.startswith('/wp-content/uploads/'):
            continue
        k = cle_image(chemin)
        if not k or len(k) < 3 or k in vues or RE_HORS_CONTENU.search(k):
            continue
        vues.add(k)
        logo = bool(RE_LOGO.search(k) or RE_LOGO.search((alt or '').lower()) or chemin.lower().endswith('.svg'))
        out.append({'src': chemin, 'alt': alt or '', 'cle': k, 'logo': logo})
    return out


class ImagesEtLiensCible(HTMLParser):
    """`<img src>` et `<a href>` de `<main>` (nav et formulaires exclus)."""

    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.dans_main = False
        self.exclu = 0
        self.pile = []          # [tag, pagefind-ignore ?]
        self.images, self.liens = [], []

    def handle_starttag(self, tag, attrs):
        a = dict(attrs)
        if tag == 'main':
            self.dans_main = True
        if tag in ('nav', 'form', 'script', 'style', 'template'):
            self.exclu += 1
        ignore = 'data-pagefind-ignore' in a or (self.pile and self.pile[-1][1])
        if tag not in cpt.VOID:
            self.pile.append([tag, bool(ignore)])
        if not self.dans_main or self.exclu:
            return
        if tag in ('img', 'source'):
            for attr in ('src', 'srcset', 'data-src'):
                if a.get(attr):
                    for morceau in a[attr].split(','):
                        self.images.append(morceau.strip().split(' ')[0])
        # Les liens des blocs recalculés au build (articles liés, fil d'Ariane)
        # ne viennent pas du contenu : ils ne comptent pas.
        if tag == 'a' and a.get('href') and not ignore:
            self.liens.append(a['href'])
        style = a.get('style') or ''
        for m in re.finditer(r'url\(([^)]+)\)', style):
            self.images.append(m.group(1).strip('\'" '))

    def handle_endtag(self, tag):
        for i in range(len(self.pile) - 1, -1, -1):
            if self.pile[i][0] == tag:
                del self.pile[i:]
                break
        if tag == 'main':
            self.dans_main = False
        if tag in ('nav', 'form', 'script', 'style', 'template'):
            self.exclu = max(0, self.exclu - 1)


def images_et_liens_cible(fichier):
    with io.open(fichier, encoding='utf-8') as fh:
        html = fh.read()
    if '<main' not in html:
        html = html.replace('<body', '<main', 1).replace('</body>', '</main>', 1)
    p = ImagesEtLiensCible()
    p.feed(html)
    return {cle_image(s) for s in p.images if cle_image(s)}, set(p.liens)


# ------------------------------------------------------------------- liens

RE_HREF = re.compile(r'href="([^"]+)"')


def normalise_lien(href):
    """Chemin comparable d'un lien interne, ou None (externe, ancre, mailto)."""
    h = href.strip()
    if not h or h.startswith(('#', 'mailto:', 'tel:', 'javascript:')):
        return None
    if h.startswith('http'):
        if not h.startswith(BASE) and 'victrix.ca' not in h.split('/')[2]:
            return None
        h = '/' + h.split('/', 3)[3] if h.count('/') >= 3 else '/'
    if not h.startswith('/'):
        return None
    return cpt.normalise_chemin(h)


def liens_source(blocs_html):
    """Les liens internes portés par les blocs de la source (chemin normalisé)."""
    out = []
    for htm in blocs_html:
        for href in RE_HREF.findall(htm):
            n = normalise_lien(href)
            if n and n not in out:
                out.append(n)
    return out


def lien_arrive(routes, chemin, liens_cible_normes):
    """Le lien de la source est-il dans la cible, tel quel ou via sa page de destination ?"""
    if chemin in liens_cible_normes:
        return True
    courant = chemin
    for _ in range(cpt.SAUTS_MAX):
        vers = cpt.applique(routes, courant)
        if not vers:
            break
        courant = cpt.normalise_chemin(vers)
        if courant in liens_cible_normes:
            return True
    # /expertise/x/ → /fr/services/x/ n'est pas toujours une règle : tolérer le dernier segment
    seg = chemin.rstrip('/').split('/')[-1]
    return any(l.rstrip('/').split('/')[-1] == seg for l in liens_cible_normes if l.count('/') > 2)


# -------------------------------------------------------------------- main

def blocs_source_html(html):
    """Comme cpt.blocs_source, mais garde le HTML en ligne (pour les liens)."""
    p = cpt.BlocsSansChrome()
    p.feed(html)
    blocs, htmls = [], []
    for kind, htm, alt in p.out:
        if kind == 'img':
            continue
        texte = cpt.base.plain(htm)
        if kind == 'p' and (cpt.RE_FIL_ARIANE.match(texte) or cpt.RE_FORMULAIRE.search(texte)):
            continue
        blocs.append((kind, texte))
        htmls.append(htm)
    return blocs, htmls


def main():
    sys.stdout.reconfigure(encoding='utf-8', errors='replace')
    routes = cpt.charge_routes()
    peri = cpt.perimetre()
    hors_decision, ignorer, _assumees = cpt.decisions()
    reg = cpt.registre()
    idx = cpt.index_depot()
    index_cache = cpt.lit_index_cache()

    par_cible = {}
    for chemin, info in sorted(peri.items()):
        if chemin in hors_decision:
            continue
        cible, fichier = cpt.cible_de(routes, chemin)
        if not cible:
            continue
        par_cible.setdefault(cible, {'fichier': fichier, 'sources': []})['sources'].append(chemin)

    lignes, ecartes = [], []
    for cible, e in par_cible.items():
        # le fichier du dépôt (même recette que check-parite-texte)
        fichier = reg.get(e['sources'][0]) or next((reg[c] for c in e['sources'] if reg.get(c)), '')
        lang = 'en' if cible.startswith('/en/') else 'fr'
        segment = cible.strip('/').split('/')[-1].lower() if cible.strip('/') not in ('fr', 'en') else 'accueil'
        if not fichier or not fichier.startswith('`'):
            rel = idx.get((lang, e['sources'][0])) or idx.get((lang, segment)) or idx.get(('', segment))
            fichier = fichier or (rel or '—')
        fichier = fichier.strip('`')
        if cpt.rubrique(cible, fichier) == 'articles':
            continue
        if ONLY and not any(o in cible or o in fichier for o in ONLY):
            continue

        analyses = {}
        for c in e['sources']:
            html, statut = cpt.source_html(c, index_cache)
            if html:
                analyses[c] = html
        if not analyses:
            ecartes.append((cible, 'source non lisible en ligne'))
            continue
        candidats = sorted(analyses, key=lambda c: (0 if 'live' in peri[c]['origines'] else 1,
                                                      -len(cpt.mots(' '.join(t for _, t in cpt.blocs_source(analyses[c]))))))
        source = candidats[0]
        html = analyses[source]
        blocs, htmls = blocs_source_html(html)
        langue_source = bma.langue_du_texte(cpt.normalise_titre(' '.join(b for _, b in blocs)))
        if langue_source not in (None, lang):
            ecartes.append((cible, 'page source entière en %s (traduction faite depuis)' % langue_source.upper()))
            continue

        texte = bma.texte_cible(e['fichier'])
        mots_cible = set(texte.split())
        verdicts = bma.juge_blocs(lang, blocs, texte)
        manquants, reformules, amputes, widgets = [], [], [], []
        for v in verdicts:
            norme = cpt.normalise_titre(v['texte'])
            if v['statut'] == 'manquant' and norme.rstrip(' !?.:') in WIDGETS:
                v['statut'] = 'widget'
                widgets.append(v)
            elif v['statut'] == 'manquant':
                part, absents = part_retrouvee(norme, mots_cible)
                if part is not None and part >= SEUIL_REFORMULE:
                    v.update(statut='reformule', part=round(part, 2), absents=absents)
                    reformules.append(v)
                else:
                    v['absents'] = absents
                    manquants.append(v)
            elif v['statut'] == 'ok' and v['type'] not in bma.TITRES and ' %s ' % norme not in ' %s ' % texte:
                _part, absents = part_retrouvee(norme, mots_cible, longueur=5)
                if len(absents) >= MOTS_AMPUTE:
                    v.update(statut='ampute', absents=absents)
                    amputes.append(v)

        # images
        imgs_cible, liens_cible = images_et_liens_cible(e['fichier'])
        imgs = images_source(html)
        imgs_absentes = []
        premiere_photo = next((i for i, im in enumerate(imgs) if not im['logo']), None)
        for i, im in enumerate(imgs):
            if im['cle'] not in imgs_cible:
                imgs_absentes.append(dict(im, heros=(i == premiere_photo)))

        # liens des blocs RETROUVÉS (un lien d'un bloc manquant est déjà couvert par le bloc)
        liens_cible_normes = {normalise_lien(l) for l in liens_cible} - {None}
        liens_perdus = []
        for (kind, _t), htm, v in zip(blocs, htmls, verdicts):
            if v['statut'] not in ('ok', 'ampute', 'reformule'):
                continue
            for l in liens_source([htm]):
                if l in ('/', '/en/', '/fr/', '/contact/', '/en/contact/'):
                    continue
                if not lien_arrive(routes, l, liens_cible_normes) and l not in [x['lien'] for x in liens_perdus]:
                    liens_perdus.append({'lien': l, 'bloc': v['texte'][:90]})

        lignes.append({
            'cible': cible, 'source': source, 'fichier': fichier, 'langue': lang,
            'rubrique': cpt.rubrique(cible, fichier),
            'blocs': len(blocs), 'manquants': manquants, 'reformules': reformules, 'amputes': amputes,
            'widgets': widgets,
            'mots_manquants': sum(b['mots'] for b in manquants),
            'images': len(imgs), 'images_absentes': imgs_absentes,
            'liens_perdus': liens_perdus,
        })

    def poids(l):
        return l['mots_manquants'] + 2 * len(l['amputes']) + 3 * len(l['images_absentes']) + 2 * len(l['liens_perdus'])

    lignes.sort(key=lambda l: (-poids(l), l['cible']))
    touches = [l for l in lignes if l['manquants'] or l['amputes'] or l['images_absentes'] or l['liens_perdus']]
    n_heros = sum(1 for l in lignes for im in l['images_absentes'] if im['heros'])
    n_logos = sum(1 for l in lignes for im in l['images_absentes'] if im['logo'])
    n_photos = sum(len(l['images_absentes']) for l in lignes) - n_logos
    n_reformules = sum(len(l['reformules']) for l in lignes)
    n_widgets = sum(len(l['widgets']) for l in lignes)

    r = []
    w = r.append
    w('# Pages — les blocs, images et liens de l’ancien site qui ne sont pas chez nous')
    w('')
    w('> Généré par `python scripts/migration/blocs-manquants-pages.py` (après un')
    w('> `npm run build`). Source : le cache des pages EN LIGNE, `docs/migration/cache-source/`.')
    w('> Articles exclus (voir `blocs-manquants-articles.md`). **Aucun fichier de contenu n’est modifié.**')
    w('')
    w('| | |')
    w('| --- | --- |')
    w('| Pages comparées | **%d** |' % len(lignes))
    w('| Pages avec au moins un écart (bloc, phrase, image ou lien) | **%d** |' % len(touches))
    w('| Blocs de texte absents | **%d** (%d mots) |' % (sum(len(l['manquants']) for l in lignes), sum(l['mots_manquants'] for l in lignes)))
    w('| … dont blocs courts « à vérifier » | %d |' % sum(1 for l in lignes for b in l['manquants'] if b.get('court')))
    w('| Paragraphes retrouvés mais AMPUTÉS (≥ %d mots significatifs perdus) | **%d** |' % (MOTS_AMPUTE, sum(len(l['amputes']) for l in lignes)))
    w('| Images de la source absentes de la cible | **%d** : %d photos (dont %d images de héros) + %d logos, pictos ou certifications |'
      % (n_photos + n_logos, n_photos, n_heros, n_logos))
    w('| Liens internes de la source absents de la cible | **%d** |' % sum(len(l['liens_perdus']) for l in lignes))
    w('| Blocs seulement REFORMULÉS (≥ %d %% des mots présents) — listés, non comptés | %d |' % (round(SEUIL_REFORMULE * 100), n_reformules))
    w('| Widgets de l’ancien thème (carrousel d’équipe, intitulé du formulaire) — hors décompte | %d |' % n_widgets)
    if ecartes:
        w('| Pages écartées (source illisible ou dans l’autre langue) | %d |' % len(ecartes))
    w('')
    w('**Comment lire.** Mêmes règles que pour les articles : un paragraphe ou un item')
    w('est « absent » quand moins de 50 % de ses mots significatifs (≥ 5 lettres) sont dans')
    w('la page construite ; un titre, dès qu’il n’est pas retrouvé mot pour mot ; un bloc')
    w('court non retrouvé est « à vérifier ». Comme la consigne autorise la reformulation,')
    w('un bloc absent dont ≥ %d %% des mots de 4 lettres et plus sont dans la page est classé' % round(SEUIL_REFORMULE * 100))
    w('« reformulé » : listé en une ligne, hors décompte. À l’inverse, un paragraphe jugé')
    w('présent auquel il manque ≥ %d mots significatifs est « amputé » : une phrase ou une' % MOTS_AMPUTE)
    w('fin de phrase a sauté — les mots absents sont nommés. Une IMAGE est absente quand')
    w('aucun fichier de même nom (suffixe de taille WordPress et extension ignorés) n’est')
    w('servi dans le `<main>` de la cible — la première image de la source est l’image de')
    w('héros ; logos et icônes ne comptent pas. Un LIEN est absent quand un bloc retrouvé')
    w('portait un lien interne que la cible ne porte plus dans son CONTENU (ni tel quel,')
    w('ni vers sa destination après redirection ; articles liés et fil d’Ariane exclus).')
    w('')
    w('**Ce que ce rapport ne dit pas** : il juge le TEXTE, pas la FORME ni le choix')
    w('éditorial. Un titre absent peut être un widget abandonné volontairement')
    w('(« Rencontrez nos experts » = carrousel d’équipe) : Gabriel et Julie tranchent.')
    w('')
    for rub, titre in (('services', 'Services'), ('pages', 'Pages'), ('campagnes', 'Campagnes')):
        sel = [l for l in touches if l['rubrique'] == rub]
        tot = [l for l in lignes if l['rubrique'] == rub]
        w('## %s — %d pages, %d avec un écart' % (titre, len(tot), len(sel)))
        w('')
        if sel:
            w('| Page cible | Blocs absents | Mots | Amputés | Images absentes | Liens absents | Fichier |')
            w('| --- | ---: | ---: | ---: | ---: | ---: | --- |')
            for l in sel:
                w('| `%s` | %d | %d | %d | %d%s | %d | `%s` |' % (
                    l['cible'], len(l['manquants']), l['mots_manquants'], len(l['amputes']), len(l['images_absentes']),
                    ' (héros)' if any(i['heros'] for i in l['images_absentes']) else '',
                    len(l['liens_perdus']), l['fichier']))
        else:
            w('_Aucune._')
        w('')

    w('## Le détail, page par page (du plus touché au moins touché)')
    w('')
    for l in touches:
        w('### `%s` — `%s`' % (l['cible'], l['fichier']))
        w('')
        w('Source : <https://www.victrix.ca%s> (%d blocs, %d images)' % (l['source'], l['blocs'], l['images']))
        w('')
        for b in l['manquants']:
            et = b['type'].upper()
            if b.get('court'):
                w('- **[%s]** (%d mots — court, à vérifier)' % (et, b['mots']))
            else:
                w('- **[%s]** (%d mots, %d %% retrouvé)' % (et, b['mots'], round(b['part'] * 100)))
            w('')
            w('  > %s' % b['texte'].replace('\n', ' ').strip())
            w('')
        for b in l['amputes']:
            w('- **[%s AMPUTÉ]** (%d mots ; mots absents : %s)' % (b['type'].upper(), b['mots'], ', '.join(b['absents'])))
            w('')
            w('  > %s' % b['texte'].replace('\n', ' ').strip())
            w('')
        for im in l['images_absentes']:
            et = 'IMAGE DE HÉROS' if im['heros'] else ('LOGO / PICTO' if im['logo'] else 'IMAGE')
            w('- **[%s]** `%s`%s' % (et, im['src'], (' — alt : « %s »' % im['alt']) if im['alt'] else ''))
        for lp in l['liens_perdus']:
            w('- **[LIEN]** `%s` — porté par « %s… »' % (lp['lien'], lp['bloc']))
        if l['reformules']:
            w('- Reformulés (texte là, hors décompte) : %s' % ' · '.join(
                '[%s] « %s »' % (b['type'].upper(), b['texte'][:70] + ('…' if len(b['texte']) > 70 else ''))
                for b in l['reformules']))
        if l['widgets']:
            w('- Widgets de l’ancien thème non repris (hors décompte) : %s' % ' · '.join('« %s »' % b['texte'] for b in l['widgets']))
        w('')
    if ecartes:
        w('## Pages écartées')
        w('')
        for cible, pourquoi in sorted(ecartes):
            w('- `%s` — %s' % (cible, pourquoi))
        w('')

    with io.open(RAPPORT, 'w', encoding='utf-8', newline='\n') as fh:
        fh.write('\n'.join(r) + '\n')
    if JSON_AUSSI:
        with io.open(SORTIE_JSON, 'w', encoding='utf-8', newline='\n') as fh:
            fh.write(json.dumps(lignes, ensure_ascii=False, indent=2) + '\n')

    print('  Pages comparées        : %d' % len(lignes))
    print('  Avec un écart          : %d' % len(touches))
    print('  Blocs absents          : %d (%d mots)' % (sum(len(l['manquants']) for l in lignes), sum(l['mots_manquants'] for l in lignes)))
    print('  Paragraphes amputés    : %d' % sum(len(l['amputes']) for l in lignes))
    print('  Images absentes        : %d (héros : %d)' % (sum(len(l['images_absentes']) for l in lignes), n_heros))
    print('  Reformulés (non comptés): %d' % n_reformules)
    print('  Liens absents          : %d' % sum(len(l['liens_perdus']) for l in lignes))
    if ecartes:
        print('  Écartées               : %d' % len(ecartes))
    print('  Rapport                : %s' % RAPPORT.replace(ROOT, '.').replace('\\', '/'))
    return 0


if __name__ == '__main__':
    sys.exit(main())
