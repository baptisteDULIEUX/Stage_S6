<template>
  <div class="pred-wrapper">

    <div v-if="!predictions" class="pred-empty">
      <p>Dessine un chien ou un chat pour voir la prédiction ! 🎨</p>
    </div>

    <div v-else class="pred-bars">
      <div
          v-for="(prob, index) in predictions"
          :key="index"
          class="bar-row"
          :class="{ 'bar-row-winner': index === predictedIndex }"
      >
        <span class="digit-label" :title="labels[index]">{{ getEmoji(index) }}</span>

        <div class="bar-track">
          <div
              class="bar-fill"
              :style="{
              width:      `${(prob * 100).toFixed(1)}%`,
              background: index === predictedIndex ? getWinnerColor(index) : defaultColor,
            }"
          />
        </div>

        <span class="bar-pct">{{ (prob * 100).toFixed(1) }}%</span>
      </div>
    </div>

    <div
        v-if="predictedIndex !== null"
        class="verdict"
        :class="{ 'verdict-unknown': predictedIndex === 2 }"
    >
      <span class="verdict-label">{{ verdictMessage }}</span>
      <span v-if="predictedIndex !== 2" class="verdict-digit">{{ getEmoji(predictedIndex) }}</span>
      <span class="verdict-conf">
        ({{ (predictions[predictedIndex] * 100).toFixed(0) }}% sûr)
      </span>
    </div>

  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  // Tableau de 3 nombres (softmax)
  predictions: { type: Array, default: null },
  // Nos nouvelles étiquettes par défaut
  labels: {
    type: Array,
    default: () => ['Chat', 'Chien', 'Inconnu']
  }
})

const defaultColor = '#d1d5db' // Gris par défaut

// On adapte la couleur selon si c'est une victoire ou la case "Inconnu"
function getWinnerColor(index) {
  if (index === 2) return '#f87171' // Rouge clair pour Inconnu
  return '#6BCB77' // Vert pour Chat ou Chien
}

// Extrait juste l'émoji pour la mise en page
function getEmoji(index) {
  const emojis = ['🐱', '🐶', '❓']
  return emojis[index] || ''
}

// On trouve l'index (0, 1, ou 2) avec le plus grand score
const predictedIndex = computed(() => {
  if (!props.predictions || props.predictions.length === 0) return null
  const max = Math.max(...props.predictions)
  return props.predictions.indexOf(max)
})

// Un message de verdict dynamique et humain
const verdictMessage = computed(() => {
  if (predictedIndex.value === 0) return "C'est un Chat !"
  if (predictedIndex.value === 1) return "C'est un Chien !"
  return "Je ne reconnais pas..."
})
</script>

<style scoped>
.pred-wrapper { display: flex; flex-direction: column; gap: 10px; }

.pred-empty {
  text-align: center;
  color: #9ca3af;
  font-size: 15px;
  padding: 24px 0;
  border: 2px dashed #e5e7eb;
  border-radius: 12px;
}

.pred-bars { display: flex; flex-direction: column; gap: 8px; }

.bar-row {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 8px;
  border-radius: 8px;
  border: 2px solid transparent;
  background: #f9fafb;
}
.bar-row-winner {
  background: #f0fdf4;
  border-color: #6BCB77;
}

/* On grossit la police pour bien voir les émojis */
.digit-label {
  font-size: 24px;
  width: 32px;
  text-align: center;
}

.bar-track {
  flex: 1;
  height: 16px;
  background: #e5e7eb;
  border-radius: 50px;
  overflow: hidden;
}
.bar-fill {
  height: 100%;
  border-radius: 50px;
  transition: width 0.3s cubic-bezier(0.4, 0, 0.2, 1), background-color 0.3s;
  min-width: 4px;
}

.bar-pct {
  font-family: 'Nunito', sans-serif;
  font-size: 13px;
  font-weight: 700;
  color: #6b7280;
  width: 50px;
  text-align: right;
}

/* ── Verdict (Chat / Chien) ── */
.verdict {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  margin-top: 12px;
  padding: 16px;
  background: #f0fdf4;
  border-radius: 14px;
  border: 2px solid #6BCB77;
  transition: all 0.3s ease;
}

/* ── Verdict (Inconnu / Erreur) ── */
.verdict-unknown {
  background: #fef2f2;
  border-color: #f87171;
}
.verdict-unknown .verdict-label {
  color: #b91c1c;
}
.verdict-unknown .verdict-conf {
  color: #ef4444;
}

.verdict-label {
  font-family: 'Nunito', sans-serif;
  font-size: 18px;
  font-weight: 800;
  color: #15803d;
}
.verdict-digit {
  font-size: 32px;
  line-height: 1;
}
.verdict-conf {
  font-size: 14px;
  color: #166534;
  font-weight: 600;
}
</style>