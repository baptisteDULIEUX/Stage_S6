<template>
  <div class="pred-wrapper">

    <div v-if="!predictions" class="pred-empty">
      <p> Dessine un chien ou un chat pour voir la prédiction !</p>
    </div>

    <div v-else class="pred-bars">
      <div
          v-for="(prob, digit) in predictions"
          :key="digit"
          class="bar-row"
          :class="{ 'bar-row-winner': digit === predictedDigit }"
      >
        <!-- Label chiffre -->
        <span class="digit-label">{{ digit }}</span>

        <!-- Barre de progression -->
        <div class="bar-track">
          <div
              class="bar-fill"
              :style="{
              width:      `${(prob * 100).toFixed(1)}%`,
              background: digit === predictedDigit ? winnerColor : defaultColor,
            }"
          />
        </div>

        <!-- Pourcentage -->
        <span class="bar-pct">{{ (prob * 100).toFixed(1) }}%</span>
      </div>
    </div>

    <!-- Verdict -->
    <div v-if="predictedDigit !== null" class="verdict">
      <span class="verdict-label">L'IA dit :</span>
      <span class="verdict-digit">{{ predictedDigit }}</span>
      <span class="verdict-conf">
        ({{ (predictions[predictedDigit] * 100).toFixed(0) }}% sûre)
      </span>
    </div>

  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  // Tableau de 10 nombres entre 0 et 1 (softmax)
  predictions: { type: Array, default: null },
})

const winnerColor  = '#6BCB77'
const defaultColor = '#d1d5db'

const predictedDigit = computed(() => {
  if (!props.predictions) return null
  const max = Math.max(...props.predictions)
  return props.predictions.indexOf(max)
})
</script>

<style scoped>
.pred-wrapper { display: flex; flex-direction: column; gap: 10px; }

.pred-empty {
  text-align: center;
  color: #9ca3af;
  font-size: 15px;
  padding: 24px 0;
}

.pred-bars { display: flex; flex-direction: column; gap: 5px; }

.bar-row {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 4px 6px;
  border-radius: 8px;
  border: 2px solid transparent;
}
.bar-row-winner {
  background: #f0fdf4;
  border-color: #6BCB77;
}

.digit-label {
  font-family: 'Fredoka One', cursive;
  font-size: 18px;
  width: 20px;
  text-align: center;
  color: #374151;
}

.bar-track {
  flex: 1;
  height: 14px;
  background: #f3f4f6;
  border-radius: 50px;
  overflow: hidden;
}
.bar-fill {
  height: 100%;
  border-radius: 50px;
  /* Transition douce quand la valeur change */
  transition: width 0.25s ease, background 0.2s;
  min-width: 3px;
}

.bar-pct {
  font-family: 'Nunito', sans-serif;
  font-size: 11px;
  font-weight: 700;
  color: #6b7280;
  width: 44px;
  text-align: right;
}

/* ── Verdict ── */
.verdict {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  margin-top: 8px;
  padding: 14px;
  background: #f0fdf4;
  border-radius: 14px;
  border: 2px solid #6BCB77;
}
.verdict-label {
  font-family: 'Nunito', sans-serif;
  font-size: 15px;
  font-weight: 700;
  color: #374151;
}
.verdict-digit {
  font-family: 'Fredoka One', cursive;
  font-size: 42px;
  color: #374151;
  line-height: 1;
}
.verdict-conf {
  font-size: 13px;
  color: #6b7280;
}
</style>
