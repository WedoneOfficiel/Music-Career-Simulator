# Music Career Simulator

**Version 1.0 — écosystème d'applications musicales simulées**

Un jeu de gestion de carrière musicale en français, jouable depuis GitHub Pages. Le joueur crée un artiste et pilote sa carrière au moyen d'un ensemble d'applications intégrées qui partagent les mêmes données de simulation.

## Applications intégrées

- **Spotify** : interface de streaming simulée, discographie, titres populaires, lecteur visuel et classement mondial.
- **Spotify for Artists** : tableau de bord d'audience, streams, abonnés, titres principaux, pays d'écoute et campagnes de promotion.
- **X** : fil d'actualité et publication de messages.
- **TikTok** : publication de vidéos et estimation des vues, likes, commentaires et partages. Les vidéos peuvent stimuler les écoutes pendant plusieurs semaines ; les concepts liés aux challenges et aux tendances ont un potentiel supérieur.
- **Instagram** : profil artiste, grille de publications, stories et Reels simulés.
- **Apple Music** : espace d'écoute et classements des titres et albums.

## Systèmes de carrière

- Création d'artiste avec nom, genre, pays, portrait et réglages de départ (argent, fans, popularité).
- Studio : création de titres, publication de singles et d'albums.
- Simulation hebdomadaire des écoutes, revenus, abonnés, popularité et classements.
- Campagnes promotionnelles payantes avec effet temporaire sur les écoutes.
- Réseaux sociaux persistants : publications, audience et métriques qui évoluent au fil des semaines.
- Labels, concerts, billetterie, merchandising et biographie évolutive.
- Sauvegarde automatique locale dans le navigateur.

## Comment fonctionne l'écosystème

Les applications ne sont pas indépendantes : elles lisent et modifient le même état de carrière. Une vidéo TikTok ou un Reel peut créer un multiplicateur temporaire sur les écoutes ; une campagne achetée dans Spotify for Artists augmente temporairement le potentiel de streaming ; les écoutes influencent les classements, les revenus et les évolutions de carrière.

## Simulation et limites

Les interfaces et les données sont reproduites **à l'intérieur du jeu** : aucun compte Spotify, Apple Music, TikTok, Instagram ou X n'est connecté. Il s'agit d'un univers fictif, pas d'une connexion aux services réels ni d'une copie de leurs données en direct. Les lecteurs sont visuels : aucun catalogue commercial réel n'est diffusé. Les chiffres et rémunérations sont des estimations ludiques.

Les artistes concurrents, leurs sorties, les médias et les classements sont générés par le simulateur. La priorité est donnée à la progression de l'artiste du joueur.

## Développement local

Prérequis : Node.js 20 ou supérieur.

```bash
npm install
npm run dev
```

Vérification de production :

```bash
npm run build
npm run preview
```

## Publication

Le dépôt construit l'application avec Vite et la publie automatiquement sur GitHub Pages à chaque mise à jour de `main`.

Jeu : https://wedoneofficiel.github.io/Music-Career-Simulator/
