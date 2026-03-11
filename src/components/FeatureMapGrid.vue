<template>
  <div class="fmap-wrapper">

    <div v-if="!featureMap" class="fmap-empty">
      <p>{{ emptyMessage }}</p>
    </div>

    <div v-else class="fmap-content">
      <!-- Sélecteur de filtre si plusieurs filtres disponibles -->
      <div v-if="numFilters > 1" class="filter-selector">
        <span class="filter-label">Filtre :</span>
        <button
          v-for="i in numFilters"
          :key="i - 1"
          class="filter-btn"
          :class="{ active: selectedFilter === i - 1 }"
          @click="selectedFilter = i - 1"
        >{{ i }}</button>
      </div>

      <!-- Grille de pixels : un canvas par feature map -->
      <div class="grid-area">
        <canvas
          ref="fmapCanvas"
          class="fmap-canvas"
          :width="featureMap.width"
          :height="featureMap.height"
        />
        <p class="grid-info">
          {{ featureMap.width }}×{{ featureMap.height }} pixels
        </p>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, watch, computed, nextTick } from 'vue'

const props = defineProps({
  // Objet retourné par useMnistModel().getFeatureMap()
  // Shape : { grid: number[][], height: number, width: number }
  featureMap:   { type: Object, default: null },
  numFilters:   { type: Number, default: 1 },
  emptyMessage: { type: String, default: '✏️ Dessine pour voir les activations' },
  // Palette de couleur : 'gray' | 'heat'
  colorMode:    { type: String, default: 'gray' },
})

const fmapCanvas    = ref(null)
const selectedFilter = ref(0)

// Redessiner le canvas dès que la feature map ou le filtre change
watch(
  [() => props.featureMap, selectedFilter],
  () => nextTick(() => renderFeatureMap()),
  { immediate: true }
)

function renderFeatureMap() {
  if (!props.featureMap || !fmapCanvas.value) return

  const { grid, width, height } = props.featureMap
  const canvas = fmapCanvas.value
  const ctx    = canvas.getContext('2d')
  const img    = ctx.createImageData(width, height)

  // Trouver min/max pour normaliser l'affichage
  const flat = grid.flat()
  const min  = Math.min(...flat)
  const max  = Math.max(...flat)
  const range = max - min || 1

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      // Valeur normalisée entre 0 et 1
      const norm  = (grid[y][x] - min) / range
      const idx   = (y * width + x) * 4

      if (props.colorMode === 'heat') {
        // Palette "chaleur" : noir → rouge → jaune → blanc
        const r = Math.min(255, norm * 2 * 255)
        const g = Math.min(255, Math.max(0, (norm - 0.5) * 2 * 255))
        img.data[idx + 0] = r
        img.data[idx + 1] = g
        img.data[idx + 2] = 0
      } else {
        // Niveaux de gris classiques
        const v = Math.round(norm * 255)
        img.data[idx + 0] = v
        img.data[idx + 1] = v
        img.data[idx + 2] = v
      }
      img.data[idx + 3] = 255  // opacité pleine
    }
  }

  ctx.putImageData(img, 0, 0)
}
</script>

<style scoped>
.fmap-wrapper { display: flex; flex-direction: column; gap: 8px; }

.fmap-empty {
  text-align: center;
  color: #9ca3af;
  font-size: 13px;
  padding: 16px 0;
}

.filter-selector {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
}
.filter-label {
  font-size: 12px;
  font-weight: 700;
  color: #374151;
}
.filter-btn {
  width: 28px; height: 28px;
  border-radius: 6px;
  border: 2px solid #e5e7eb;
  background: #fff;
  font-size: 12px; font-weight: 700;
  cursor: pointer;
  color: #374151;
}
.filter-btn.active {
  background: var(--teal, #4ECDC4);
  border-color: var(--teal, #4ECDC4);
  color: #fff;
}

.grid-area { display: flex; flex-direction: column; align-items: center; gap: 4px; }

.fmap-canvas {
  /* Agrandir visuellement (les données restent à la taille réelle) */
  width:  112px;
  height: 112px;
  image-rendering: pixelated;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
}

.grid-info {
  font-size: 10px;
  color: #9ca3af;
}
</style>
