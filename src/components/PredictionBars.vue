<template>
  <div class="predictions-container">
    <div v-if="!predictions" class="no-prediction">
      Dessine quelque chose pour voir !
    </div>

    <div v-else class="prediction-list">
      <div
          v-for="(item, index) in predictions"
          :key="item.label"
          class="pred-row"
          :class="{ 'pred-winner': index === 0 }"
      >
        <div class="pred-label">{{ item.label }}</div>

        <div class="bar-bg">
          <div
              class="bar-fill"
              :style="{ width: `${(item.score * 100).toFixed(1)}%` }"
          ></div>
        </div>

        <div class="pred-score">{{ (item.score * 100).toFixed(0) }}%</div>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  predictions: {
    type: Array, // Reçoit [{ label: 'pomme', score: 0.98 }, ...]
    default: null
  }
})
</script>

<style scoped>
/* Un peu de CSS pour de belles barres */
.pred-row { display: flex; align-items: center; gap: 10px; margin-bottom: 12px; }
.pred-winner { font-weight: bold; color: #10B981; font-size: 1.1em; }
.pred-label { width: 80px; text-transform: capitalize; text-align: right; }
.bar-bg { flex: 1; height: 20px; background: #e5e7eb; border-radius: 10px; overflow: hidden; }
.bar-fill { height: 100%; background: #10B981; transition: width 0.2s ease; }
.pred-score { width: 40px; font-variant-numeric: tabular-nums; }
</style>