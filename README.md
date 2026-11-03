# Music Career Simulator

Un simulateur de carrière musicale en français. Créez votre artiste, développez sa carrière et prenez les décisions qui façonneront son parcours dans l'industrie musicale.

## Objectif

Construire progressivement un jeu de gestion musical riche : création d'artiste, écriture et production, sorties, promotion, streaming, classements, récompenses, tournées, merchandising et événements de l'industrie.

## Principes

- Interface et contenu du jeu en français.
- Simulation fictive et autonome : aucune dépendance aux classements ou plateformes réels.
- Moteur de simulation séparé de l'interface.
- Sauvegarde locale et tests des mécaniques importantes.

## Stack technique

- React + TypeScript
- Vite
- Lucide pour les icônes
- Sauvegarde locale du navigateur (premier socle)

## Lancer le jeu en local

Prérequis : Node.js 20 ou supérieur.

```bash
npm install
npm run dev
```

Pour vérifier la version de production :

```bash
npm run build
npm run preview
```

## Première version

La version initiale comprend :
- création d'un artiste (nom, genre musical et pays) ;
- tableau de bord avec trésorerie, fans, popularité et énergie ;
- progression hebdomadaire ;
- écriture de chansons et catalogue ;
- sauvegarde automatique dans le navigateur.

Les autres systèmes de carrière seront développés par étapes.
