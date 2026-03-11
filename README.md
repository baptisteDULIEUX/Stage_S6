# 🧠 NeuralKids — FEMTO-ST

Support pédagogique interactif pour enseigner les réseaux de neurones aux enfants (8–12 ans).

## Démarrage rapide

```bash
# 1. Installer les dépendances
npm install

# 2. Lancer le serveur de développement
npm run dev

# 3. Ouvrir http://localhost:5173
```

## Structure du projet

```
src/
├── stores/
│   └── simulator.js      # Logique réseau de neurones (poids, calculs, animation)
├── components/
│   └── NeuronGraph.vue   # Visualisation SVG animée du réseau
├── views/
│   ├── HomeView.vue      # Page d'accueil
│   ├── SimulatorView.vue # ✅ Simulateur complet (4 manches)
│   ├── MnistView.vue     # 🚧 Module dessin IA (stub)
│   ├── GamesView.vue     # 🚧 Mini-jeux CNN (stub)
│   └── BioView.vue       # 🚧 Parallèle biologique (stub)
├── router/index.js
├── App.vue
└── main.js
```

## Modules

| Module | État | Description |
|--------|------|-------------|
| Simulateur Chat/Chien | ✅ Complet | 4 manches avec animation du réseau |
| Dessin IA (MNIST) | 🚧 Stub | Canevas + modèle CNN |
| Mini-jeux CNN | 🚧 Stub | Convolution, Pooling, ReLU |
| Parallèle biologique | 🚧 Stub | Frise comparative neurones |

## Technologies

- **Vue 3** (Composition API) + **Vite**
- **Pinia** pour la gestion d'état
- **Vue Router** pour la navigation
- SVG animé natif (pas de dépendance graphique externe)

## Build production

```bash
npm run build
# Fichiers dans dist/
```
