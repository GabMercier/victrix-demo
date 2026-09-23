#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
blocs-manquants-articles.py — QUELS BLOCS de l'ancien site ne sont pas arrivés
dans nos articles ? Un rapport par article, bloc par bloc, texte prêt à coller.

POURQUOI CET OUTIL EXISTE (2026-09-23, demande de Julie).
`check:parite-texte` répond déjà « le texte de cette page est-il arrivé ? »,
mais à la maille de la PAGE : un ratio de mots, et les blocs qui suivent un
titre H2/H3. Julie, en révisant les 62 articles, trouve des choses qu'il ne
signale pas — une bulle « Le saviez-vous ? », un paragraphe d'introduction,
une liste. C'est logique : un encadré de 40 mots perdu dans un article de 1 200
ne fait pas tomber le ratio sous 0,7, et s'il ne suit pas un titre, il n'est
comparé nulle part.

Ici on descend d'un cran : CHAQUE bloc de la source (titre, paragraphe, item de
liste, citation) est cherché dans la page construite. Ce qui ne s'y retrouve
pas est listé, avec son texte, pour que la remise se fasse par copier-coller
plutôt qu'en relisant l'ancien site à côté du nouveau.

CE QU'IL NE FAIT PAS. Il n'écrit RIEN dans src/content : la restauration reste
un geste humain (l'éditrice a retouché des articles depuis la migration, et
`convert-articles.mjs` ne doit pas être relancé — voir docs/operations.md).
Il ne juge pas la FORME non plus : un encadré rendu en paragraphe simple, une
FAQ aplatie en titres, un bouton devenu un lien nu comptent comme « présents »,
parce que leur texte est là. C'est un autre sujet, et il est nommé dans le
rapport.

SOURCE : le cache des pages EN LIGNE (`docs/migration/cache-source/`, celui de
`check-parite-texte.py`), pas l'export WordPress — c'est précisément parce que
l'export a perdu ces blocs qu'ils manquent.

Usage :
  python scripts/migration/blocs-manquants-articles.py            # après un build
  python scripts/migration/blocs-manquants-articles.py --json     # + sortie machine
  python scripts/migration/blocs-manquants-articles.py --seuil 0.6
"""
import importlib.util
import io
import json
import os
import re
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.abspath(os.path.join(HERE, '..', '..'))


def _module(nom, fichier):
    spec = importlib.util.spec_from_file_location(nom, os.path.join(HERE, fichier))
    mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)
    return mod


# On REJOUE la mécanique de check-parite-texte plutôt que de la recopier :
# normalisation, retrait du chrome, découpe en blocs et lecture du cache y sont
# déjà réglées, avec leurs pièges (classes de chrome du thème, fil d'Ariane,
# mentions de formulaire).
cpt = _module('check_parite_texte', 'check-parite-texte.py')

BLOG = os.path.join(ROOT, 'src', 'content', 'blog')
DIST = os.path.join(ROOT, 'dist')
RAPPORT = os.path.join(ROOT, 'docs', 'migration', 'blocs-manquants-articles.md')
SORTIE_JSON = os.path.join(ROOT, 'docs', 'migration', 'blocs-manquants-articles.json')

JSON_AUSSI = '--json' in sys.argv
SEUIL = 0.5
if '--seuil' in sys.argv:
    SEUIL = float(sys.argv[sys.argv.index('--seuil') + 1])

# En dessous de ce nombre de mots SIGNIFICATIFS (≥ 5 lettres), un bloc n'a pas
# assez de matière pour qu'on tranche : « En savoir plus », « Nos services »…
# On les compte à part plutôt que de les déclarer perdus à tort.
MOTS_MIN = 5
# Les TITRES ne passent pas par le sac de mots (voir main) ; un bloc court est
# tout de même signalé « à vérifier » dès qu'il fait MOTS_MIN_COURT mots et
# qu'il ne ressemble pas à un bouton.
TITRES = ('h2', 'h3', 'h4')
MOTS_MIN_COURT = 3
RE_BOUTON = re.compile(
    r'^(en savoir plus|contactez nous|contact us|learn more|read more|lire la suite|'
    r'nous contacter|demander une demo|request a demo|home|accueil)\b'
)

# ---------------------------------------------------------------------------
# LANGUE DU BLOC — le filtre sans lequel ce rapport est inutilisable.
#
# Mesuré au premier essai : les 4 articles les plus « amputés » (servicenow-itsm,
# servicenow-itom, sase-cloud, zero-trust EN — 170 blocs, 4 300 mots) n'avaient
# rien perdu du tout. Leurs pages `/en/…` de l'ancien site étaient restées EN
# FRANÇAIS, et nos articles anglais sont, eux, traduits : chaque bloc français
# de la source était donc introuvable dans une cible anglaise, et signalé comme
# perdu. C'est l'inverse d'une perte — c'est une traduction faite depuis.
#
# Détection par mots-outils : ils sont fréquents, courts, et ne se confondent
# pas d'une langue à l'autre. On ne tranche qu'avec assez d'indices (≥ 3) et
# une langue nettement majoritaire (le double de l'autre) ; sinon on ne décide
# pas, et le bloc est jugé normalement.
MOTS_OUTILS = {
    'fr': {'le', 'la', 'les', 'des', 'une', 'pour', 'avec', 'dans', 'vous', 'nous',
           'est', 'sont', 'que', 'qui', 'plus', 'sur', 'aux', 'leur', 'ses', 'par',
           'ont', 'cette', 'ces', 'vos', 'nos', 'aussi', 'tout', 'mais', 'donc',
           'en', 'et', 'de', 'du', 'au', 'ou'},
    'en': {'the', 'and', 'of', 'to', 'with', 'for', 'your', 'that', 'this', 'are',
           'from', 'their', 'more', 'can', 'you', 'have', 'has', 'which', 'these',
           'its', 'our', 'they', 'when', 'while', 'about', 'into'},
}


def langue_du_texte(norme):
    """'fr', 'en', ou None quand les indices ne suffisent pas à trancher."""
    mots = norme.split()
    compte = {lg: sum(1 for m in mots if m in outils) for lg, outils in MOTS_OUTILS.items()}
    fr, en = compte['fr'], compte['en']
    if fr + en < 3:
        # Peu d'indices, mais tous du même côté (« [Partie 1] Meilleures
        # pratiques en sécurité opérationnelle : la maintenance » — deux
        # mots-outils français, aucun anglais) : on tranche quand même.
        if fr >= 2 and en == 0:
            return 'fr'
        if en >= 2 and fr == 0:
            return 'en'
        return None
    if fr >= en * 2:
        return 'fr'
    if en >= fr * 2:
        return 'en'
    return None

RE_FRONT = re.compile(r'^---\r?\n(.*?)\r?\n---', re.S)


def front_matter(texte):
    """Les champs simples du front matter (suffisant : title, slug, wpUrl)."""
    m = RE_FRONT.match(texte)
    if not m:
        return {}
    out = {}
    for ligne in m.group(1).split('\n'):
        if ':' not in ligne or ligne.startswith(' ') or ligne.startswith('-'):
            continue
        cle, _, val = ligne.partition(':')
        out[cle.strip()] = val.strip().strip('"\'')
    return out


def texte_cible(fichier):
    """Tout le texte de la page construite, normalisé (même parseur que cpt)."""
    with io.open(fichier, encoding='utf-8') as fh:
        html = fh.read()
    p = cpt.TexteCible()
    if '<main' not in html:
        html = html.replace('<body', '<main', 1).replace('</body>', '</main>', 1)
    p.feed(html)
    return cpt.normalise_titre(' '.join(p.tout))


def articles():
    """(langue, chemin du .md, front matter) pour chaque article du dépôt."""
    for langue in ('fr', 'en'):
        dossier = os.path.join(BLOG, langue)
        if not os.path.isdir(dossier):
            continue
        for nom in sorted(os.listdir(dossier)):
            if not nom.endswith('.md'):
                continue
            chemin = os.path.join(dossier, nom)
            with io.open(chemin, encoding='utf-8') as fh:
                fm = front_matter(fh.read())
            yield langue, chemin, fm


def juge_blocs(langue, blocs, cible):
    """Un verdict par bloc de la source, DANS L'ORDRE de la source.

    statut : 'ok' (retrouvé), 'manquant' (à remettre — `court` dit si c'est un
    bloc court « à vérifier »), 'court' (trop court pour juger, ignoré),
    'autre' (écrit dans l'autre langue), 'vide'. Partagé avec
    restaure-blocs-articles.py, qui remet les 'manquant' à leur place.
    """
    mots_cible = set(cible.split())
    verdicts = []
    for kind, brut in blocs:
        v = {'type': kind, 'texte': brut.strip(), 'mots': len(cpt.mots(brut)),
             'part': 1.0, 'court': False, 'statut': 'ok'}
        verdicts.append(v)
        norme = cpt.normalise_titre(brut)
        if not norme:
            v['statut'] = 'vide'
            continue
        # Retrouvé mot pour mot : rien à dire.
        if ' %s ' % norme in ' %s ' % cible:
            continue
        # Bloc écrit dans l'AUTRE langue que l'article : la source n'était
        # pas traduite à l'époque et nous l'avons traduite depuis. Ce n'est
        # pas une perte (voir MOTS_OUTILS).
        if langue_du_texte(norme) not in (None, langue):
            v['statut'] = 'autre'
            continue
        significatifs = cpt.mots_significatifs(norme)
        titre = kind in TITRES
        if len(significatifs) < MOTS_MIN and not titre:
            # Trop court pour le jugement par sac de mots, et pas retrouvé
            # mot pour mot : signalé à part, comme « à vérifier » — c'est
            # là que vivent les questions d'une FAQ et les intitulés
            # d'encadrés (« Quand la réglementation DORA entre-t-elle en
            # vigueur ? »), que la première passe comptait sans les nommer.
            # Un item de liste est court par nature (« Pacemakers ») : deux
            # mots suffisent pour le signaler.
            plancher = 2 if kind == 'li' else MOTS_MIN_COURT
            if len(norme.split()) >= plancher and not RE_BOUTON.search(norme):
                v.update(part=0.0, court=True, statut='manquant')
            else:
                v['statut'] = 'court'
            continue
        if titre:
            # Un TITRE est court par nature : ses mots pris un à un se
            # retrouvent presque toujours ailleurs dans la page (« DORA »,
            # « sécurité »). Ne compte que le mot pour mot (testé plus
            # haut) ; ici il n'a pas été retrouvé → perdu, avec la part de
            # ses mots de 4 lettres et plus à titre indicatif.
            mots_titre = {m for m in norme.split() if len(m) >= 4 and not m.isdigit()}
            if not cpt.titre_utile(norme) or not mots_titre:
                v['statut'] = 'court'
                continue
            v.update(part=round(len(mots_titre & mots_cible) / len(mots_titre), 2),
                     statut='manquant')
            continue
        part = len(significatifs & mots_cible) / len(significatifs)
        v['part'] = round(part, 2)
        if part < SEUIL:
            v['statut'] = 'manquant'
    return verdicts


def main():
    index = cpt.lit_index_cache()
    lignes = []
    sans_source = []
    sans_page = []
    source_autre_langue = []

    for langue, chemin, fm in articles():
        rel = os.path.relpath(chemin, ROOT).replace('\\', '/')
        wp = fm.get('wpUrl', '')
        slug = fm.get('slug') or os.path.basename(chemin)[:-3]

        if not wp:
            sans_source.append((rel, 'aucun champ wpUrl'))
            continue

        html, statut = cpt.source_html(cpt.normalise_chemin(wp), index)
        if not html:
            sans_source.append((rel, 'source absente du cache (statut %s)' % statut))
            continue

        page = os.path.join(DIST, langue, 'ressources', slug, 'index.html')
        if not os.path.exists(page):
            sans_page.append((rel, os.path.relpath(page, ROOT).replace('\\', '/')))
            continue

        cible = texte_cible(page)
        mots_cible = set(cible.split())
        blocs = cpt.blocs_source(html)

        # PAGE SOURCE dans l'autre langue (2026-09-23, deuxième passe) : le
        # filtre par bloc laissait passer les items de liste et les titres
        # courts (« Sécurité: Fonctionnalités de sécurité… » — 2 mots-outils,
        # pas 3), soit 46 faux « blocs perdus » sur 4 articles EN dont la
        # source /en/ était restée en français. On tranche donc d'abord à la
        # maille de la PAGE : si la source entière est dans l'autre langue,
        # l'article est une traduction faite depuis, il n'a rien perdu, et il
        # est listé à part plutôt que comparé bloc par bloc.
        langue_source = langue_du_texte(cpt.normalise_titre(' '.join(b for _, b in blocs)))
        if langue_source not in (None, langue):
            source_autre_langue.append((rel, wp, langue_source))
            continue

        verdicts = juge_blocs(langue, blocs, cible)
        manquants = [v for v in verdicts if v['statut'] == 'manquant']
        courts = sum(1 for v in verdicts if v['statut'] == 'court')
        autre_langue = sum(1 for v in verdicts if v['statut'] == 'autre')

        lignes.append({
            'fichier': rel,
            'langue': langue,
            'titre': fm.get('title', ''),
            'slug': slug,
            'source': wp,
            'manquants': manquants,
            'mots_manquants': sum(b['mots'] for b in manquants),
            'courts_non_juges': courts,
            'autre_langue': autre_langue,
        })

    lignes.sort(key=lambda l: (-l['mots_manquants'], l['fichier']))
    touches = [l for l in lignes if l['manquants']]

    # ------------------------------------------------------------- rapport
    r = []
    w = r.append
    w('# Articles — les blocs de l’ancien site qui ne sont pas chez nous')
    w('')
    w('> Généré par `python scripts/migration/blocs-manquants-articles.py`')
    w('> (après un `npm run build`). Source : le cache des pages EN LIGNE,')
    w('> `docs/migration/cache-source/`. **Aucun fichier de contenu n’est modifié.**')
    w('')
    w('| | |')
    w('| --- | --- |')
    w('| Articles comparés | **%d** |' % len(lignes))
    w('| Articles avec au moins un bloc absent | **%d** |' % len(touches))
    w('| Blocs absents au total | **%d** |' % sum(len(l['manquants']) for l in touches))
    w('| Mots concernés | **%d** |' % sum(l['mots_manquants'] for l in touches))
    if sans_source:
        w('| Articles sans source comparable | %d |' % len(sans_source))
    if sans_page:
        w('| Articles absents de `dist/` (build à refaire ?) | %d |' % len(sans_page))
    total_courts = sum(1 for l in touches for b in l['manquants'] if b.get('court'))
    if total_courts:
        w('| … dont blocs courts « à vérifier » | %d |' % total_courts)
    if source_autre_langue:
        w('| Articles écartés — source entière dans l’autre langue | %d |' % len(source_autre_langue))
    total_autre = sum(l['autre_langue'] for l in lignes)
    if total_autre:
        w('| Blocs écartés — écrits dans l’autre langue | %d |' % total_autre)
    w('')
    w('**Comment lire.** Un paragraphe ou un item de liste est « absent » quand moins')
    w('de %d %% de ses mots significatifs (≥ 5 lettres) se retrouvent dans la page'
      % round(SEUIL * 100))
    w('construite. Un TITRE est « absent » dès qu’il n’est pas retrouvé mot pour mot')
    w('(ses mots pris un à un se retrouvent presque toujours ailleurs) — le pourcentage')
    w('indiqué est alors celui de ses mots de 4 lettres et plus, à titre indicatif.')
    w('Un bloc court (moins de %d mots significatifs, au moins %d mots : la question'
      % (MOTS_MIN, MOTS_MIN_COURT))
    w('d’une FAQ, l’intitulé d’un encadré) non retrouvé mot pour mot est signalé')
    w('« à vérifier » ; les intitulés de boutons ne le sont jamais.')
    w('')
    w('**Ce que ce rapport ne dit pas** : il juge le TEXTE, pas la FORME. Un encadré')
    w('« Le saviez-vous ? » rendu en paragraphe simple, une FAQ aplatie en titres ou')
    w('un bouton devenu un lien nu comptent comme présents — leur texte est là. La')
    w('mise en forme de ces éléments est un sujet distinct.')
    w('')

    if touches:
        w('## Articles à reprendre, du plus touché au moins touché')
        w('')
        w('| Article | Langue | Blocs absents | Mots | Source |')
        w('| --- | --- | --- | --- | --- |')
        for l in touches:
            w('| `%s` | %s | **%d** | %d | [%s](https://www.victrix.ca%s) |'
              % (l['slug'], l['langue'].upper(), len(l['manquants']), l['mots_manquants'],
                 l['source'], l['source']))
        w('')

        w('## Le détail, prêt à coller')
        w('')
        for l in touches:
            w('### `%s` — %s' % (l['fichier'], l['titre']))
            w('')
            w('Source : <https://www.victrix.ca%s>' % l['source'])
            w('')
            for b in l['manquants']:
                etiquette = b['type'].upper()
                if b.get('court'):
                    w('- **[%s]** (%d mots — court, à vérifier)' % (etiquette, b['mots']))
                else:
                    w('- **[%s]** (%d mots, %d %% retrouvé)' % (etiquette, b['mots'], round(b['part'] * 100)))
                w('')
                w('  > %s' % b['texte'].replace('\n', ' ').strip())
                w('')
            w('')

    if source_autre_langue:
        w('## Articles écartés — la page source est dans l’autre langue')
        w('')
        w('L’ancien site servait ces pages `/en/…` EN FRANÇAIS ; nos articles anglais')
        w('sont des traductions faites depuis. Rien n’y est perdu, mais rien n’y est')
        w('comparable bloc par bloc non plus : à relire avec la version FR à côté.')
        w('')
        for rel, wp, lg in source_autre_langue:
            w('- `%s` — source <https://www.victrix.ca%s> en %s' % (rel, wp, lg.upper()))
        w('')
    if sans_source:
        w('## Articles sans source comparable')
        w('')
        for rel, pourquoi in sans_source:
            w('- `%s` — %s' % (rel, pourquoi))
        w('')
    if sans_page:
        w('## Articles absents de `dist/`')
        w('')
        w('Refaire un `npm run build` puis relancer.')
        w('')
        for rel, attendu in sans_page:
            w('- `%s` — attendu : `%s`' % (rel, attendu))
        w('')

    with io.open(RAPPORT, 'w', encoding='utf-8', newline='') as fh:
        fh.write('\n'.join(r) + '\n')

    if JSON_AUSSI:
        with io.open(SORTIE_JSON, 'w', encoding='utf-8', newline='') as fh:
            fh.write(json.dumps(lignes, ensure_ascii=False, indent=2) + '\n')

    print('  Articles comparés      : %d' % len(lignes))
    print('  Avec un bloc absent    : %d' % len(touches))
    print('  Blocs absents          : %d (%d mots)'
          % (sum(len(l['manquants']) for l in touches),
             sum(l['mots_manquants'] for l in touches)))
    if source_autre_langue:
        print('  Source en autre langue : %d (écartés)' % len(source_autre_langue))
    if sans_source:
        print('  Sans source comparable : %d' % len(sans_source))
    if sans_page:
        print('  Absents de dist/       : %d  (npm run build ?)' % len(sans_page))
    print('  Rapport                : %s' % RAPPORT.replace(ROOT, '.').replace('\\', '/'))
    return 0


if __name__ == '__main__':
    sys.exit(main())
