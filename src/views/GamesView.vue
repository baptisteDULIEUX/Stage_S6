<template>
  <div class="games-view">

    <div class="games-header">
      <h1 class="games-title">🎮 Mini-jeux CNN</h1>
      <p class="games-desc">Plonge dans les 3 couches d'un réseau convolutif… en jouant !</p>
    </div>

    <!-- Sélecteur de jeu -->
    <div class="game-selector">
      <button
          v-for="g in games"
          :key="g.id"
          class="game-pill"
          :class="{ active: activeGame === g.id }"
          :style="activeGame === g.id ? `background:${g.color}` : ''"
          @click="activeGame = g.id"
      >
        {{ g.icon }} {{ g.label }}
        <span v-if="g.coming" class="coming-tag">Bientôt</span>
      </button>
    </div>

    <!-- Jeu actif -->
    <div class="game-panel card">

      <!-- Convolution -->
      <template v-if="activeGame === 'conv'">
        <div class="game-intro">
          <h2 class="game-name" style="color:#FF6B6B;">🔍 Convolution</h2>
          <p class="game-explain">
            Un <strong>filtre</strong> (la loupe) glisse sur l'image case par case.
            À chaque position, il multiplie la valeur du pixel par la valeur du filtre.
            C'est comme ça que l'IA détecte des bords, des courbes, des formes !
          </p>
        </div>
        <ConvolutionGame />
      </template>

      <!-- Pooling -->
      <template v-else-if="activeGame === 'pool'">
        <div class="game-intro">
          <h2 class="game-name" style="color:#4ECDC4;">📐 MaxPooling</h2>
          <p class="game-explain">
            Après la convolution, l'IA <strong>réduit la taille de l'image</strong> en gardant
            seulement la valeur la plus forte dans chaque zone 2×2.
            C'est le MaxPooling : on garde l'essentiel, on jette le reste !
          </p>
        </div>
        <MaxPoolingGame />
      </template>

      <!-- ReLU -->
      <template v-else-if="activeGame === 'relu'">
        <div class="game-intro">
          <h2 class="game-name" style="color:#A78BFA;">⚡ Fonction ReLU</h2>
          <p class="game-explain">
            La <strong>ReLU</strong> (Rectified Linear Unit) est une fonction d'activation très simple :
            elle transforme toutes les valeurs <strong>négatives en 0</strong> et laisse les positives inchangées.
            Mémorise où elles se cachent !
          </p>
        </div>
        <ReluGame />
      </template>

    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import ConvolutionGame from '../components/ConvolutionGame.vue'
import MaxPoolingGame  from '../components/MaxPoolingGame.vue'
import ReluGame        from '../components/ReluGame.vue'

const activeGame = ref('conv')

const games = [
  { id: 'conv', label: 'Convolution', icon: '🔍', color: '#FF6B6B', coming: false },
  { id: 'pool', label: 'MaxPooling',  icon: '📐', color: '#4ECDC4', coming: false },
  { id: 'relu', label: 'ReLU', icon: '⚡', color: '#A78BFA', coming: false },
]
</script>

<style scoped>
.games-view   { display: flex; flex-direction: column; gap: 24px; }
.games-header { text-align: center; }
.games-title  { font-family: 'Fredoka One', cursive; font-size: clamp(26px, 4vw, 42px); margin-bottom: 6px; }
.games-desc   { color: #4b5563; font-size: 16px; }

.game-selector { display: flex; gap: 10px; justify-content: center; flex-wrap: wrap; }
.game-pill {
  font-family: 'Fredoka One', cursive; font-size: 15px;
  padding: 8px 22px; border-radius: 50px;
  border: 2.5px solid #e5e7eb; background: #fff; color: #374151;
  cursor: pointer; display: flex; align-items: center; gap: 8px;
}
.game-pill.active { color: #fff; border-color: transparent; }
.coming-tag {
  font-family: 'Nunito', sans-serif; font-size: 10px; font-weight: 800;
  background: #e5e7eb; color: #6b7280; padding: 2px 8px; border-radius: 50px;
}

.game-panel { padding: 28px; }

.game-intro { margin-bottom: 24px; }
.game-name  { font-family: 'Fredoka One', cursive; font-size: 22px; margin-bottom: 8px; }
.game-explain { font-size: 14px; color: #4b5563; line-height: 1.7; max-width: 560px; }

.coming-soon { text-align: center; padding: 40px 20px; }
.coming-icon  { font-size: 64px; margin-bottom: 12px; }
.coming-title { font-family: 'Fredoka One', cursive; font-size: 28px; margin-bottom: 8px; }
.coming-sub   { font-size: 15px; color: #4b5563; margin-bottom: 20px; }
.coming-badge {
  display: inline-block; background: #FFE66D; color: #374151;
  font-family: 'Fredoka One', cursive; font-size: 15px;
  padding: 8px 24px; border-radius: 50px;
}
</style>