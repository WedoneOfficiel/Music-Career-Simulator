# Music Career Simulator

**Simulateur de carrière musicale — version de développement 1.1**

Un jeu de gestion en français, jouable sur GitHub Pages. L'artiste, sa discographie, ses audiences, ses contrats, ses campagnes et ses performances sont stockés dans une sauvegarde locale unique, partagée entre les différents modules.

## Modules de carrière

- **Identité** : nom, genre, origine, âge, biographie et portrait centralisés. La même photo est réutilisée dans les profils des applications.
- **Studio & sorties** : écriture individuelle ou par lot, singles, albums studio, EP, compilations et projets live préparés depuis les tournées.
- **Classements** : classements d'artistes, d'albums et de chansons pour les États-Unis, le Royaume-Uni et la France. Les tableaux affichent position actuelle, rang précédent, pic, semaines et streams.
- **Labels** : catalogue de maisons fictives inspirées de groupes et de stratégies du secteur, négociation de durée, nombre et type de projets, royalties, avance et budget marketing. Création d'un label indépendant.
- **Promotion** : centre de campagnes unique pour les plateformes. Le recrutement d'un manager débloque des canaux supplémentaires.
- **Tournées** : salles réelles, capacités, tarifs standards et VIP, setlists, albums associés et préparation d'albums live.
- **Merchandising** : création de produits reliés à un projet, prix et coût de fabrication. La mise en vente est une action volontaire ; seuls les produits actifs génèrent des ventes simulées.
- **Wikipédia** : page encyclopédique fictive, infobox, biographie, chiffres clés et tableaux séparés pour albums, EP et chansons, avec streams Spotify, classement actuel et pic.
- **Médias & presse** : revue de presse et critiques fictives associées aux projets publiés.

## Applications simulées

- **Spotify** : discographie, titres populaires et classements par territoire et catégorie.
- **Spotify for Artists** : audience, streams, abonnés et suivi des sorties.
- **X** : publications du joueur et actualités générées par des comptes médias pop fictifs/inspirés de médias existants.
- **TikTok** et **Instagram** : publications, médias et statistiques simulées.
- **Apple Music** : catalogue et classements simulés.

Les applications sont regroupées sous un seul onglet pour éviter de dupliquer les systèmes de promotion et les données de carrière.

## Simulation

Les classements sont générés séparément par marché et par catégorie. Les streams Spotify alimentent les classements affichés dans Spotify et dans l'onglet général. Les tournées, les campagnes, les publications sociales, les contrats et le merchandising influencent la progression et les finances.

Les projets live sont préparés à partir des setlists de concerts terminés, puis publiés depuis le studio. Les produits dérivés restent en préparation tant que le joueur ne les met pas en vente.

## Limites

Le jeu est une simulation fictive : aucun compte Spotify, Apple Music, X, Instagram ou TikTok n'est connecté. Les interfaces, médias, critiques, audiences, classements, salles et revenus sont des données de jeu. Les maisons de disques du catalogue sont des noms fictifs inspirés de l'industrie et ne représentent pas des offres réelles. Les comptes de presse du fil sont des personnages simulés, pas des comptes officiels connectés.

La sauvegarde est locale au navigateur et à l'appareil. Pensez à exporter ou préserver vos données avant de vider les données du navigateur.

## Développement

Prérequis : Node.js 20 ou supérieur.

```bash
npm install
npm run dev
npm run build
```

Jeu : https://wedoneofficiel.github.io/Music-Career-Simulator/
