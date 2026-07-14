# Guide du projet — refonte victrix.ca

> **Point d'entrée unique.** Ce document répond à « qu'est-ce qu'on est en train
> de faire, où en est-on, et où est le reste ? ». État au **14 juillet 2026**.

## La vision en trois phrases

Remplacer le site WordPress actuel par une fondation moderne — **Astro (site
statique) + CloudCannon (édition visuelle) + Cloudflare Pages (hébergement)** —
qui donne au marketing son autonomie d'édition, une vitesse et une sécurité
maximales par construction, et un coût récurrent quasi nul. La stratégie est
**« fonctionnel d'abord »** : livrer une v1 complète sur le design actuel, puis
appliquer la refonte graphique comme une « re-peau » (tout le visuel est
centralisé dans des design tokens — `src/styles/tokens.css`). Le choix de pile
est argumenté face aux sceptiques dans `analyse-criteres.md`.

## Décisions structurantes (journal)

| Date | Décision | Où c'est documenté |
|---|---|---|
| Juin 2026 | Pile Astro statique + éditeur Git, réalisation interne (vs 2 soumissions agence WordPress) | `Proposition-Refonte-victrix.docx` |
| 13 juil. | Analyse des 10 critères marketing : 7 natifs/plus forts, 2 chantiers, 1 compromis | `critères.md` + `analyse-criteres.md` |
| 13 juil. | Estimation révisée **26–34 j** (+4–7 j éditeur visuel) après lecture du cahier des charges | `analyse-criteres.md` |
| 13 juil. | Pivot éditeur visuel : **CloudCannon d'abord** (spike balisé), Tina en relève, Sveltia à retirer après verdict | `plan-pivot-editeur.md` |
| 13 juil. | Pas de nouveau dépôt : spike sur branche, dépôt de prod semé de la branche gagnante plus tard | `plan-pivot-editeur.md` |
| 14 juil. | CloudCannon connecté (site « Vic-demo », branche `spike/cloudcannon`), premier build réussi | `spike-cloudcannon.md` |
| 14 juil. | **Pas de maquettes pour l'instant** : v1 fonctionnelle sur le design actuel, refonte graphique ultérieure via tokens | ce document + `plan-2026-07-15.md` |

## Ce qui fonctionne aujourd'hui (démontrable)

- **Site bilingue FR/EN** fidèle au site actuel : accueil, expertise IA,
  ressources (blogue), contact, 404 — slugs par langue, hreflang, sitemap
  bilingue, redirections 301 des anciennes URLs.
- **Landing pages composables** (`/fr|en/campagnes/…`) : le marketing assemble
  hero / bénéfices / FAQ / formulaire / appel à l'action depuis une palette
  dans CloudCannon, avec `noindex` par défaut (critère 4 + 5).
- **Édition CloudCannon** : collections Blogue, Accueil, Expertises, Campagnes,
  Redirections en français; éditeur visuel par défaut; gabarits « + Ajouter »
  qui ne peuvent pas produire de fichier invalide.
- **Pipeline formulaires** (critère 6) : endpoint `/api/forms` (validation,
  pot de miel, Turnstile optionnel, envoi SMTP2GO, pages `/merci`) — **inerte
  tant que les clés ne sont pas posées** (voir `formulaires.md`).
- **SEO technique** (critère 7) : JSON-LD Organization partout, BlogPosting sur
  les articles, FAQPage via la section FAQ — sans plugin ni licence.
- **Brouillons** (critère 2) : interrupteur « Brouillon » sur les articles —
  visibles dans l'aperçu CloudCannon, exclus du site public; chaque branche a
  son URL de préversion partageable non indexée.
- **Portail client** : prototype maquetté (auth simulée forme OIDC/PKCE) — voir
  `portail-auth.md`. Ne pas présenter comme fonctionnel.
- **Qualité encadrée** : ESLint, 23+ tests unitaires, `astro check`, CI GitHub
  Actions, en-têtes de sécurité durcis (CSP, HSTS…), deux modes de build
  vérifiés (Cloudflare + `STATIC_ONLY` pour CloudCannon).

## Carte des documents (`docs/`)

| Document | Une ligne |
|---|---|
| `GUIDE-PROJET.md` | Ce document — point d'entrée. |
| `guide-edition.md` | Guide de l'éditeur (marketing) : publier au quotidien. |
| `critères.md` | Les 10 attentes marketing/webmestre + état WordPress actuel. |
| `analyse-criteres.md` | Réponse critère par critère + arguments anti-WP + estimation révisée. |
| `plan-pivot-editeur.md` | Le plan du pivot éditeur visuel (CloudCannon/Tina), gate à 8 critères. |
| `spike-cloudcannon.md` | Réglages CloudCannon + grille de gate à remplir. |
| `formulaires.md` | Architecture des formulaires, variables d'env, étapes d'activation. |
| `plan-2026-07-15.md` | Plan de la journée : clore la gate, décisions en attente. |
| `reunion-marketing-2026-07-09.md` | Déroulé de la démo marketing + objections/réponses. |
| `roadmap.md` | Feuille de route par jalons (M0→M4) — antérieure au pivot, à rafraîchir. |
| `portail-auth.md` | Plan directeur du portail client (Entra External ID). |
| `i18n-architecture.md` | Architecture bilingue (URLs, slugs, SEO). |
| `DEPLOYMENT.md` | Déploiement Cloudflare Pages. |
| `Proposition-Refonte-victrix.docx` | La proposition d'origine (options A/B/C, TCO 4 ans). |

## Les 10 critères marketing — état réel

| # | Critère | État |
|---|---|---|
| 1 | Éditeur visuel | 🔄 Spike CloudCannon en cours (gate à clore — grille dans `spike-cloudcannon.md`); landing = plein visuel; accueil = panneau de données (conversion Bookshop = décision en attente) |
| 2 | Preview / partage non public | ✅ Préversions par branche (noindex auto) + brouillons d'articles |
| 3 | Types de contenus | ✅ Collections typées (blogue, accueil, expertises, campagnes) — en ajouter = 1 schéma + 1 gabarit |
| 4 | Landing pages | ✅ Palette de 5 sections, autonome au CMS |
| 5 | URLs + indexation | ✅ Slugs par langue, noindex par page, sitemap cohérent |
| 6 | Formulaires | 🔶 Pipeline construit, **activation = poser les clés** (SMTP2GO + Turnstile, voir `formulaires.md`) |
| 7 | SEO / schema | ✅ JSON-LD par gabarit (Organization, BlogPosting, FAQPage) |
| 8 | Redirections | ✅ Éditables au CMS, validées au build |
| 9 | Clarity + images | 🔶 Images natives (Sharp au build); Clarity attend le bandeau de consentement Loi 25 (décision design) |
| 10 | Responsive | ✅ Garanti par les gabarits |

## Prochains jalons

1. **Clore la gate CloudCannon** (grille + vidéo + palier tarifaire) → verdict.
2. Commit/push de la ronde « fondations 2 » (une fois la vérification verte).
3. Décisions en attente (tableau dans `plan-2026-07-15.md`) : conversion
   Bookshop de l'accueil, clés formulaires, CSP Turnstile, retrait de Sveltia,
   bandeau Loi 25 + Clarity, collection Services.
4. Démo aux sceptiques (vidéo + arguments d'`analyse-criteres.md`).
5. Ensuite : port complet du contenu, dépôt de production semé de la branche.

## Reprendre le contexte (nouvelle conversation, nouvelle personne)

- **Nouvelle conversation Claude** : rien à préparer — la mémoire persistante
  du projet est mise à jour en continu et se charge automatiquement; ce
  document est le point d'entrée lisible. Dire « lis docs/GUIDE-PROJET.md »
  suffit à ancrer n'importe quelle session.
- **Nouvelle personne** : lire ce document, puis `analyse-criteres.md` (le
  pourquoi), puis `guide-edition.md` (le comment éditeur) ou
  `plan-pivot-editeur.md` (le comment technique).
- **État du code** : `git log --oneline` sur la branche `spike/cloudcannon`;
  les conventions sont dans les commentaires du code lui-même
  (`astro.config.mjs` et `cloudcannon.config.yml` sont les plus denses).
