// =============================================================================
// Configuration Bookshop — bibliothèque de composants « campagnes » (landing).
//
// Emplacement IMPORTANT — ne pas déplacer ce fichier :
// - La racine Bookshop = le dossier parent du dossier `bookshop/`, donc ici
//   `component-library/src/`. Les outils CloudCannon (`npx @bookshop/generate`,
//   `@bookshop/browser`) découvrent la bibliothèque en cherchant
//   `**/bookshop.config.{js,cjs}` puis lisent `<racine>/**/*.bookshop.*`.
// - Le plugin Vite de @bookshop/astro-bookshop ne marque pour l'édition en
//   direct que les fichiers dont le chemin contient `src/.../components/`
//   (regex codée en dur dans le plugin) : d'où le niveau `src/` supplémentaire
//   (component-library/src/components/...).
// - La bibliothèque est volontairement isolée de `src/components/` du site
//   (Header, Footer, …) pour que le bundle d'édition en direct de CloudCannon
//   ne tente pas de compiler pour le navigateur des composants qui ne s'y
//   prêtent pas (i18n, astro:assets, etc.).
//
// Moteur : rendu Astro côté navigateur pour l'éditeur visuel CloudCannon.
// =============================================================================
module.exports = {
  engines: {
    "@bookshop/astro-engine": {}
  }
}
