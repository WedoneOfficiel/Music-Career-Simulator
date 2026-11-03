# Music Career Simulator

Un jeu de gestion de carrière musicale en français, jouable directement depuis GitHub Pages.

## Vision

Créer un artiste et piloter sa carrière de bout en bout. Le jeu utilise un univers fictif : les artistes concurrents, leurs titres, les classements, les médias et les événements sont générés par la simulation. La priorité est donnée à la progression de l'artiste du joueur, pas à la reproduction de l'histoire musicale réelle.

## Systèmes déjà intégrés (alpha 0.2)

- Création d'artiste avec choix du nom, genre, pays et portrait par URL.
- Réglage libre du point de départ : trésorerie, nombre de fans et popularité.
- Studio : écriture de chansons, publication de singles et d'albums.
- Simulations hebdomadaires de Spotify, Apple Music, YouTube et radio.
- Revenus estimés par plateforme, trésorerie et croissance de la fanbase.
- Classement mondial fictif avec concurrents générés et positions des titres du joueur.
- Fil d'actualité automatique : sorties, bilans hebdomadaires et évolutions dans les charts.
- Contrats de labels et commissions sur les revenus.
- Programmation de concerts, jauges, billetterie et recettes.
- Merchandising avec ventes hebdomadaires automatiques.
- Biographie évolutive qui enregistre les sorties et les performances.
- Sauvegarde automatique locale dans le navigateur.

## Simulation et données

Les plateformes, les revenus, les classements, les concurrents et les comptes médias sont entièrement fictifs et simulés. Aucun compte Spotify, Apple Music, YouTube, X, Instagram ou Wikipédia n'est connecté. Les chiffres ne représentent pas des rémunérations réelles.

Les systèmes sont reliés par le passage de semaine : les sorties génèrent des écoutes, les écoutes influencent les classements et la popularité, les résultats alimentent le fil d'actualité et la biographie, tandis que les fans influencent les ventes de merchandising et la billetterie.

## Développement local

Prérequis : Node.js 20 ou supérieur.

```bash
npm install
npm run dev
```

Vérifier la version de production :

```bash
npm run build
npm run preview
```

## Publication GitHub Pages

Le dépôt est configuré pour construire l'application avec Vite et la publier automatiquement sur GitHub Pages à chaque mise à jour de la branche `main`.

URL du jeu : https://wedoneofficiel.github.io/Music-Career-Simulator/
