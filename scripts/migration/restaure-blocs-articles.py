#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
restaure-blocs-articles.py — REMET dans nos articles les blocs de l'ancien
site que blocs-manquants-articles.py déclare absents, À LEUR PLACE.

POURQUOI (2026-09-23, urgence articles de Julie). La deuxième passe du rapport
a révélé 158 blocs absents dans 27 articles — presque tous des TITRES H2 que
la conversion WordPress a laissés tomber, plus les questions des FAQ et les
intitulés d'encadrés. Les recoller à la main, article par article, en
relisant l'ancien site à côté du nouveau, c'est le travail de deux jours que
Julie avait estimé. Ici, la place de chaque bloc se déduit de l'ORDRE de la
source : on marche les blocs de l'ancienne page dans l'ordre, on repère dans
le Markdown la ligne où chaque bloc RETROUVÉ vit, et un bloc absent est
inséré juste après la dernière ligne repérée. Les articles ont été convertis
depuis ces mêmes pages : l'ordre y est le même.

CE QU'IL ÉCRIT. Du Markdown nu : `## `/`### `/`#### ` pour un titre, `- ` pour
un item de liste, `> ` pour une citation, le texte tel quel pour un
paragraphe, et **en gras** pour un bloc court (question d'une FAQ, intitulé
d'encadré) — la source ne dit pas de quoi il s'agissait. Les liens du bloc
d'origine ne sont PAS reconstitués (la source est lue en texte nu) : à
remettre au CMS s'il y en avait. Il ne touche à rien d'autre dans le fichier.

Usage :
  python scripts/migration/restaure-blocs-articles.py            # essai : diffs, rien d'écrit
  python scripts/migration/restaure-blocs-articles.py --apply    # écrit src/content/blog
  python scripts/migration/restaure-blocs-articles.py --only servicenow-itsm,sase-cloud

Préalable : `npm run build` (la comparaison se fait sur dist/, comme le
rapport). Rejouable : un bloc déjà remis est retrouvé, donc ignoré.
"""
import difflib
import importlib.util
import io
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


bm = _module('blocs_manquants_articles', 'blocs-manquants-articles.py')
cpt = bm.cpt

APPLY = '--apply' in sys.argv
ONLY = set()
if '--only' in sys.argv:
    ONLY = set(sys.argv[sys.argv.index('--only') + 1].split(','))

RE_LIEN = re.compile(r'\[([^\]]*)\]\([^)]*\)')
RE_BALISE = re.compile(r'<[^>]+>')
RE_MARQUEUR = re.compile(r'^\s*(#{1,6}\s+|[-*+]\s+|\d+\.\s+|>\s*)')
# Item de liste Markdown — ou HTML brut (`<li>`), fréquent dans les articles
# convertis (tableaux, encadrés).
RE_ITEM = re.compile(r'^\s*([-*+]\s+|\d+\.\s+|<li\b)')
RE_ARIANE = re.compile(r'^\s*(Home|Accueil)\s*»')


def norme_ligne(ligne):
    """Le texte nu d'une ligne Markdown, normalisé comme un bloc source."""
    t = RE_LIEN.sub(r'\1', ligne)
    t = RE_BALISE.sub(' ', t)
    t = RE_MARQUEUR.sub('', t)
    t = t.replace('**', ' ').replace('__', ' ')
    return cpt.normalise_titre(t)


FENETRE = 6
# Plus exigeant que le rapport (0,5 sur la page entière) : dans une fenêtre
# de quelques lignes, la moitié des mots d'une réponse de FAQ se retrouve
# trop facilement dans l'introduction qui traite du même sujet.
SEUIL_FENETRE = 0.6


def ligne_du_bloc(lignes_brutes, lignes_normes, norme, depuis, kind):
    """Index de la ligne qui porte ce bloc retrouvé, cherchée d'abord à partir
    de `depuis` (l'ordre de la source), puis depuis le début. None sinon.

    Mot pour mot sur UNE ligne d'abord ; sinon, la moitié des mots
    significatifs dans une fenêtre de FENETRE lignes consécutives (un
    paragraphe coupé par des retours à la ligne, les cellules d'un tableau).
    Le rapport, lui, juge sur le sac de mots de la PAGE entière : un bloc
    peut y passer pour présent alors que ses mots sont éparpillés dans
    d'autres paragraphes — ici on exige qu'il vive quelque part dans le
    fichier, sans quoi il est « repêché » et remis.
    """
    sig = cpt.mots_significatifs(norme)
    ordre = list(range(depuis, len(lignes_normes))) + list(range(0, depuis))
    # Un item de liste ne vit que sur une ligne de liste : ailleurs, ses mots
    # sont ceux d'un titre ou d'un paragraphe voisin (« Portails en
    # libre-service… » retrouvé dans le H3 « …avec des portails en libre-
    # service »), et l'item manque bel et bien.
    if kind == 'li':
        ordre = [i for i in ordre if RE_ITEM.match(lignes_brutes[i])]
    mots_bloc = set(norme.split())

    def derniere(i, taille):
        """La dernière ligne de la fenêtre [i, i+taille) qui porte un mot du
        bloc : c'est APRÈS elle qu'un bloc absent doit s'insérer, pas après
        la première ligne de la fenêtre."""
        j_max = i
        for j in range(i, min(i + taille, len(lignes_normes))):
            if lignes_normes[j] and mots_bloc & set(lignes_normes[j].split()):
                j_max = j
        return j_max

    # 1. Mot pour mot sur UNE ligne.
    for i in ordre:
        if lignes_normes[i] and ' %s ' % norme in ' %s ' % lignes_normes[i]:
            return i
    # Un TITRE ne se cherche que mot pour mot (même règle que le rapport) :
    # ses quelques mots se retrouvent presque toujours dans le paragraphe
    # qui traite du même sujet (« Ensuring Compliance through Penetration
    # Testing » — cinq mots, tous dans la section conformité).
    if kind in bm.TITRES:
        return None
    if kind == 'li':
        # Un item reformulé : la moitié de ses mots significatifs sur UNE
        # ligne de liste suffit.
        if len(sig) >= bm.MOTS_MIN:
            for i in ordre:
                if lignes_normes[i] and len(sig & set(lignes_normes[i].split())) / len(sig) >= 0.5:
                    return i
        return None
    # 2. Mot pour mot sur trois lignes consécutives (un paragraphe coupé par
    #    des retours à la ligne : « Dominic Lajoie » / « CEO, Victrix »).
    for i in ordre:
        if lignes_normes[i] and ' %s ' % norme in ' %s ' % ' '.join(lignes_normes[i:i + 3]):
            return derniere(i, 3)
    # 3. Sac de mots dans une fenêtre de FENETRE lignes.
    if len(sig) >= bm.MOTS_MIN:
        for i in ordre:
            if not lignes_normes[i]:
                continue
            fenetre = ' '.join(lignes_normes[i:i + FENETRE])
            if len(sig & set(fenetre.split())) / len(sig) >= SEUIL_FENETRE:
                return derniere(i, FENETRE)
    return None


def markdown_du_bloc(v):
    kind, texte = v['type'], ' '.join(v['texte'].split())
    if kind == 'h2':
        return '## ' + texte
    if kind == 'h3':
        return '### ' + texte
    if kind == 'h4':
        return '#### ' + texte
    if kind == 'li':
        return '- ' + texte
    if kind == 'blockquote':
        return '> ' + texte
    if v.get('court'):
        return '**%s**' % texte
    return texte


def restaure(corps, verdicts):
    """Renvoie (nouveau corps, nb de blocs insérés)."""
    lignes = corps.split('\n')
    normes = [norme_ligne(l) for l in lignes]
    pos = 0            # prochaine ligne d'insertion (après la dernière retrouvée)
    inseres = 0
    precedent_li = False   # le bloc précédent était un item inséré
    for v in verdicts:
        # Fil d'Ariane anglais (« Home » Resources center » … ») : le parseur
        # source ne filtre que le français. Ses mots sont ceux du titre, qu'il
        # retrouverait n'importe où — et la position sauterait avec lui.
        if RE_ARIANE.match(v['texte']):
            continue
        if v['statut'] == 'ok':
            norme = cpt.normalise_titre(v['texte'])
            i = ligne_du_bloc(lignes, normes, norme, max(0, pos - 1), v['type'])
            if i is not None:
                if i + 1 > pos:
                    pos = i + 1
                precedent_li = False
                continue
            # Présent dans la PAGE d'après le rapport, introuvable dans le
            # FICHIER : repêché. Pas pour un intitulé de bouton ni deux mots
            # (chrome de la page, libellés partagés).
            if len(norme.split()) < 3 or bm.RE_BOUTON.search(norme):
                precedent_li = False
                continue
            v = dict(v, statut='manquant', repeche=True)
        if v['statut'] != 'manquant':
            continue
        # Absent de la PAGE d'après le rapport, mais présent dans le FICHIER
        # (un tableau HTML, un bloc que le parseur de la page écarte) : on ne
        # double pas.
        if not v.get('repeche'):
            i = ligne_du_bloc(lignes, normes, cpt.normalise_titre(v['texte']), max(0, pos - 1), v['type'])
            if i is not None:
                if i + 1 > pos:
                    pos = i + 1
                precedent_li = False
                continue
        md = markdown_du_bloc(v)
        if v['type'] == 'li' and precedent_li:
            # Items consécutifs : une seule liste, sans ligne vide entre eux.
            lignes.insert(pos, md)
            normes.insert(pos, norme_ligne(md))
            pos += 1
        else:
            # Une ligne vide AVANT le bloc ; celle qui suit la ligne retrouvée
            # (déjà dans le fichier) sépare le bloc du suivant.
            if pos > 0 and lignes[pos - 1].strip() != '':
                lignes.insert(pos, '')
                normes.insert(pos, '')
                pos += 1
            lignes.insert(pos, md)
            normes.insert(pos, norme_ligne(md))
            pos += 1
            if pos < len(lignes) and lignes[pos].strip() != '':
                lignes.insert(pos, '')
                normes.insert(pos, '')
                pos += 1
        precedent_li = v['type'] == 'li'
        inseres += 1
    return '\n'.join(lignes), inseres


def main():
    index = cpt.lit_index_cache()
    total_articles = total_blocs = 0
    for langue, chemin, fm in bm.articles():
        rel = os.path.relpath(chemin, ROOT).replace('\\', '/')
        slug = fm.get('slug') or os.path.basename(chemin)[:-3]
        if ONLY and slug not in ONLY and os.path.basename(chemin)[:-3] not in ONLY:
            continue
        wp = fm.get('wpUrl', '')
        if not wp:
            continue
        html, _ = cpt.source_html(cpt.normalise_chemin(wp), index)
        if not html:
            continue
        page = os.path.join(bm.DIST, langue, 'ressources', slug, 'index.html')
        if not os.path.exists(page):
            print('!! %s : page absente de dist/ (npm run build ?)' % rel)
            continue
        blocs = cpt.blocs_source(html)
        if bm.langue_du_texte(cpt.normalise_titre(' '.join(b for _, b in blocs))) not in (None, langue):
            continue
        verdicts = bm.juge_blocs(langue, blocs, bm.texte_cible(page))
        if not any(v['statut'] == 'manquant' for v in verdicts):
            continue

        with io.open(chemin, encoding='utf-8', newline='') as fh:
            texte = fh.read()
        m = bm.RE_FRONT.match(texte)
        if not m:
            print('!! %s : front matter introuvable' % rel)
            continue
        fin = m.end()
        tete, corps = texte[:fin], texte[fin:]
        nouveau, n = restaure(corps, verdicts)
        if not n:
            continue
        total_articles += 1
        total_blocs += n
        if APPLY:
            with io.open(chemin, 'w', encoding='utf-8', newline='') as fh:
                fh.write(tete + nouveau)
            print('%s : %d bloc(s) remis' % (rel, n))
        else:
            print('=' * 8, rel, ': %d bloc(s) à remettre' % n)
            for l in difflib.unified_diff(corps.split('\n'), nouveau.split('\n'),
                                          lineterm='', n=1):
                if l.startswith(('---', '+++')):
                    continue
                print('   ' + l)
    print('%s : %d article(s), %d bloc(s)' % ('Écrit' if APPLY else 'Essai', total_articles, total_blocs))
    return 0


if __name__ == '__main__':
    sys.exit(main())
