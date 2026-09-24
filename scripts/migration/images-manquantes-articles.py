#!/usr/bin/env python3
"""Articles — les IMAGES du corps de l'ancien article absentes de notre Markdown.

Pendant de `blocs-manquants-articles.py`, qui ne juge que le TEXTE : ici, pour
chaque article publié (`draft` ≠ true) dont la page source est dans le cache
(`docs/migration/cache-source/`), on relève les `<img>` du corps de l'ancien
article (zone `<article>`, sans les cartes d'articles liés, sans la vignette
`wp-post-image` ni l'image de couverture) et on cherche chacune, par NOM DE
FICHIER (suffixe de vignette WordPress `-300x200` ignoré), dans le corps du
Markdown. Le rapport dit aussi si le fichier est déjà dans `public/wp-content/`
(rapatrié par `rapatrie-images-source.py`) ou reste à rapatrier, et compte les
`<img src="https://www.victrix.ca/...">` qui pointent encore vers l'ancien
domaine (elles casseront à sa mise hors ligne).

Usage : python scripts/migration/images-manquantes-articles.py [--json]
Sortie : docs/migration/images-manquantes-articles.md (+ résumé en console).
Aucun fichier de contenu n'est modifié. Code de sortie 0 (rapport seul).
"""
from __future__ import annotations

import glob
import json
import os
import re
import sys

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
CACHE = os.path.join(ROOT, "docs", "migration", "cache-source")
PUBLIC = os.path.join(ROOT, "public")
BLOG = os.path.join(ROOT, "src", "content", "blog")
RAPPORT = os.path.join(ROOT, "docs", "migration", "images-manquantes-articles.md")
ANCIEN_DOMAINE = "https://www.victrix.ca"

# Icônes décoratives des encadrés/FAQ de l'ancien thème : leur absence est un
# choix de forme (lot L-forme-articles), pas une perte de contenu.
DECORATIVES = {"idea", "ampoule", "yellow-question-mark", "yellow-question-mark-1"}


def base(url: str) -> str:
    """Nom de fichier normalisé : sans dossier, sans -WxH, sans extension."""
    url = url.split("?")[0].split("#")[0]
    b = os.path.basename(url)
    b = re.sub(r"-\d+x\d+(?=\.\w+$)", "", b)
    b = re.sub(r"\.(png|jpe?g|webp|gif|svg)$", "", b, flags=re.I)
    return b.lower()


def equivalents(md_imgs: set[str]) -> set[str]:
    """Même fichier téléversé deux fois dans WordPress : `ztna-victrix-1.jpg`
    est la copie de `ztna-victrix.jpg` (un chiffre seul en suffixe). Repli
    seulement, après l'échec du nom exact."""
    return {re.sub(r"-\d$", "", b) for b in md_imgs}


def front_matter(raw: str) -> tuple[str, str]:
    m = re.match(r"^---\r?\n(.*?)\r?\n---", raw, re.S)
    return (m.group(1), raw[m.end():]) if m else ("", raw)


def champ(fm: str, cle: str) -> str | None:
    m = re.search(r'^' + cle + r':\s*"?([^"\n]+?)"?\s*$', fm, re.M)
    return m.group(1).strip() if m else None


def images_source(html: str) -> list[str]:
    a = html.find("<article")
    z = html.find("</article>", a) if a >= 0 else -1
    art = html[a:z] if a >= 0 and z > a else html
    # cartes « articles liés » du gabarit WordPress
    art = re.sub(r'<(div|article)[^>]*class="[^"]*\bcard\b[^"]*"[^>]*>.*?</\1>', "", art, flags=re.S)
    out: list[str] = []
    for tag in re.findall(r"<img[^>]*>", art):
        if "wp-post-image" in tag or "avatar" in tag:
            continue
        s = re.search(r'\s(?:data-src|src)="([^"]+)"', tag)
        if not s or "wp-content/uploads" not in s.group(1):
            continue
        b = base(s.group(1))
        if b not in out:
            out.append(b)
    return out


def images_markdown(body: str) -> tuple[set[str], list[str]]:
    refs = re.findall(r'!\[[^\]]*\]\(([^)\s]+)', body)
    refs += re.findall(r'<img[^>]*\ssrc="([^"]+)"', body)
    anciennes = [u for u in refs if u.startswith(ANCIEN_DOMAINE)]
    return {base(u) for u in refs}, anciennes


def dans_public(b: str) -> bool:
    return bool(glob.glob(os.path.join(PUBLIC, "wp-content", "uploads", "**", b + ".*"), recursive=True))


def main() -> int:
    lignes = []
    n_compares = n_absentes = n_decoratives = n_ancien = 0
    sans_source = []
    for md in sorted(glob.glob(os.path.join(BLOG, "*", "*.md"))):
        rel = os.path.relpath(md, ROOT).replace("\\", "/")
        raw = open(md, encoding="utf-8").read()
        fm, body = front_matter(raw)
        if (champ(fm, "draft") or "").lower() == "true":
            continue
        wp = champ(fm, "wpUrl")
        if not wp:
            sans_source.append((rel, "sans `wpUrl`"))
            continue
        cache = os.path.join(CACHE, wp.strip("/").replace("/", "-") + ".html")
        if not os.path.exists(cache):
            sans_source.append((rel, "source absente du cache"))
            continue
        html = open(cache, encoding="utf-8", errors="replace").read()
        cover = champ(fm, "coverImage")
        src = [b for b in images_source(html) if not (cover and b == base(cover))]
        md_imgs, anciennes = images_markdown(body)
        n_compares += 1
        n_ancien += len(anciennes)
        eq = equivalents(md_imgs)
        absentes = [b for b in src if b not in md_imgs and re.sub(r"-\d$", "", b) not in eq]
        contenu = [b for b in absentes if b not in DECORATIVES]
        deco = [b for b in absentes if b in DECORATIVES]
        n_absentes += len(contenu)
        n_decoratives += len(deco)
        if contenu or anciennes:
            lignes.append({
                "fichier": rel,
                "source": ANCIEN_DOMAINE + wp,
                "images_source": len(src),
                "absentes": [{"nom": b, "dans_public": dans_public(b)} for b in contenu],
                "decoratives": deco,
                "ancien_domaine": len(anciennes),
            })

    if "--json" in sys.argv:
        print(json.dumps(lignes, ensure_ascii=False, indent=2))
        return 0

    out = []
    out.append("# Articles — les images de l’ancien site absentes de nos articles\n")
    out.append("> Généré par `python scripts/migration/images-manquantes-articles.py`.")
    out.append("> Source : le cache des pages EN LIGNE, `docs/migration/cache-source/`.")
    out.append("> **Aucun fichier de contenu n’est modifié.**\n")
    out.append("| | |\n| --- | --- |")
    out.append(f"| Articles comparés | **{n_compares}** |")
    out.append(f"| Articles avec une image de contenu absente ou servie par l’ancien domaine | **{len(lignes)}** |")
    out.append(f"| Images de contenu absentes du Markdown (hors couverture) | **{n_absentes}** |")
    out.append(f"| Icônes décoratives absentes (choix de forme, hors décompte) | {n_decoratives} |")
    out.append(f"| `<img>` encore servies par `{ANCIEN_DOMAINE}` | **{n_ancien}** |")
    out.append(f"| Articles sans source comparable | {len(sans_source)} |\n")
    out.append("**Comment lire.** Une image est « absente » quand son NOM de fichier (suffixe")
    out.append("de vignette `-300x200` ignoré) n’apparaît ni dans un `![…](…)` ni dans un")
    out.append("`<img>` du corps de l’article. « dans public » = le fichier est déjà rapatrié")
    out.append("sous `public/wp-content/`, il ne reste qu’à le poser à sa place dans le texte.\n")
    out.append("## Articles à reprendre\n")
    out.append("| Article | Images de contenu absentes | Servies par l’ancien domaine | Source |")
    out.append("| --- | --- | --- | --- |")
    for l in sorted(lignes, key=lambda l: (-len(l["absentes"]), l["fichier"])):
        out.append(f"| `{l['fichier']}` | **{len(l['absentes'])}** / {l['images_source']} | {l['ancien_domaine'] or ''} | <{l['source']}> |")
    out.append("\n## Le détail\n")
    for l in sorted(lignes, key=lambda l: l["fichier"]):
        out.append(f"### `{l['fichier']}`\n")
        for a in l["absentes"]:
            out.append(f"- `{a['nom']}` — {'dans public' if a['dans_public'] else '**À RAPATRIER**'}")
        if l["decoratives"]:
            out.append(f"- icônes décoratives non reprises : {', '.join('`' + d + '`' for d in l['decoratives'])}")
        if l["ancien_domaine"]:
            out.append(f"- **{l['ancien_domaine']} `<img>` pointent encore vers `{ANCIEN_DOMAINE}`** (à réécrire en `/wp-content/…`)")
        out.append("")
    if sans_source:
        out.append("## Articles sans source comparable\n")
        for rel, why in sans_source:
            out.append(f"- `{rel}` — {why}")
        out.append("")
    with open(RAPPORT, "w", encoding="utf-8", newline="\n") as f:
        f.write("\n".join(out))

    print(f"images-manquantes-articles — {n_compares} articles compares")
    print(f"  Images de contenu absentes : {n_absentes} dans {len([l for l in lignes if l['absentes']])} articles")
    print(f"  Icones decoratives (hors decompte) : {n_decoratives}")
    print(f"  <img> servies par l'ancien domaine : {n_ancien}")
    print(f"  Rapport : {os.path.relpath(RAPPORT, ROOT)}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
