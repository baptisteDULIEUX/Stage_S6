<!--PixelsView.vue-->

<template>
  <div class="pixels-page">

    <div class="pixels-hero">
      <h1 class="pixels-title">Comment un ordinateur lit une image ?</h1>
      <p class="pixels-sub">
        Dans le simulateur, l'IA regardait 3 indices. Mais une vraie image, comment ça marche ?
      </p>
    </div>

    <div class="steps-list">

      <!-- Étape 1 : pixels -->
      <div class="step-card card" :class="{ visible: visibleSteps >= 1 }">
        <div class="step-num" style="background:#4ECDC4">1</div>
        <div class="step-body">
          <h2 class="step-title">Une image = une grille de cases</h2>
          <p>Une image numérique est découpée en milliers de petits carrés appelés <strong>pixels</strong>. Chaque pixel a une couleur. En noir et blanc, chaque pixel est juste un <strong>nombre entre 0 et 255</strong> : 0 = noir, 255 = blanc.</p>
          <div class="pixel-demo">
            <canvas ref="pixelCanvas" class="pixel-canvas" width="7" height="7" />
            <div class="pixel-grid-numbers" id="pixel-numbers"></div>
          </div>
          <p class="step-hint">C'est exactement comme ça que l'IA "voit" ton dessin !</p>
        </div>
      </div>

      <!-- Étape 2 : grille interactive -->
      <div class="step-card card" :class="{ visible: visibleSteps >= 2 }">
        <div class="step-num" style="background:#A78BFA">2</div>
        <div class="step-body">
          <h2 class="step-title"> Dessine et vois les nombres !</h2>
          <p>Clique sur les cases pour les allumer. Regarde comment chaque case devient un nombre que l'IA peut lire.</p>
          <div class="interactive-grid-wrap">
            <div class="grid-section">
              <p class="grid-label">Ton dessin</p>
              <div class="interactive-grid">
                <div
                  v-for="(val, i) in grid"
                  :key="i"
                  class="grid-cell"
                  :style="`background: rgb(${255-val},${255-val},${255-val})`"
                  @click="toggleCell(i)"
                  @mouseover="isDragging && toggleCell(i, true)"
                  @mousedown="isDragging = true"
                  @mouseup="isDragging = false"
                />
              </div>
              <button class="clear-btn" @click="clearGrid">🗑️ Effacer</button>
            </div>
            <div class="arrow-sep">→</div>
            <div class="grid-section">
              <p class="grid-label">Ce que voit l'IA</p>
              <div class="numbers-grid">
                <div
                  v-for="(val, i) in grid"
                  :key="i"
                  class="num-cell"
                  :class="{ lit: val > 0 }"
                >{{ val }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Étape 3 : transition vers le dessin -->
      <div class="step-card card" :class="{ visible: visibleSteps >= 3 }">
        <div class="step-num" style="background:#FF6B6B">3</div>
        <div class="step-body">
          <h2 class="step-title">🐱🐶 Du simulateur au dessin</h2>
          <p>Dans le simulateur, tu as vu un réseau regarder <strong>3 indices</strong> (moustaches, oreilles, yeux). Dans le prochain module, le réseau va regarder une image entière pour deviner si c'est un chat ou un chien !</p>
          <p>Le principe est <strong>exactement le même</strong> — juste beaucoup plus de chiffres à analyser !</p>
        </div>
      </div>

    </div>

    <!-- Continuer -->
    <div class="continue-section">
      <p class="continue-hint">Prêt à dessiner un chat ou un chien pour que l'IA le devine ?</p>
      <button class="btn-continue" @click="continueToNext">
        ✏️ Dessiner et tester l'IA →
      </button>
    </div>

  </div>
</template>

<script setup>
import { ref, onMounted, nextTick } from 'vue'
import { useRouter } from 'vue-router'


const router   = useRouter()

// ── Animation des étapes ──────────────────────────────────────────────────────
const visibleSteps = ref(0)

onMounted(() => {
  const delays = [200, 700, 1300]
  delays.forEach((d, i) => {
    setTimeout(() => { visibleSteps.value = i + 1 }, d)
  })
  setTimeout(drawPixelDemo, 400)
})

// ── Démo canvas pixel ─────────────────────────────────────────────────────────
const pixelCanvas = ref(null)

function drawPixelDemo() {
  if (!pixelCanvas.value) return
  const ctx = pixelCanvas.value.getContext('2d')
  // Dessiner un petit chat stylisé en 7×7
  const pattern = [
    0,   0,   0,   0,   0,   0,   0,
    0, 255, 255,   0, 255, 255,   0,
    0, 200, 200, 200, 200, 200,   0,
    0, 180, 150, 180, 150, 180,   0,
    0, 200, 200, 200, 200, 200,   0,
    0,   0, 200, 200, 200,   0,   0,
    0,   0,   0,   0,   0,   0,   0,
  ]
  pattern.forEach((v, i) => {
    const x = i % 7, y = Math.floor(i / 7)
    ctx.fillStyle = `rgb(${v},${v},${v})`
    ctx.fillRect(x, y, 1, 1)
  })
}

// ── Grille interactive ────────────────────────────────────────────────────────
const GRID_SIZE = 8
const grid = ref(Array(GRID_SIZE * GRID_SIZE).fill(0))
const isDragging = ref(false)

function toggleCell(i, onlyOn = false) {
  if (onlyOn) {
    grid.value[i] = 255
  } else {
    grid.value[i] = grid.value[i] > 0 ? 0 : 255
  }
}

function clearGrid() {
  grid.value = Array(GRID_SIZE * GRID_SIZE).fill(0)
}

// ── Navigation ────────────────────────────────────────────────────────────────
function continueToNext() {
  progress.completeStep('pixels')
  router.push(progress.nextRoute('pixels'))
}
</script>

<style scoped>
.pixels-page { display: flex; flex-direction: column; gap: 28px; max-width: 760px; margin: 0 auto; }

.pixels-hero { text-align: center; }
.pixels-title { font-family: 'Fredoka One', cursive; font-size: clamp(22px, 4vw, 36px); margin-bottom: 8px; }
.pixels-sub   { font-size: 15px; color: #4b5563; line-height: 1.6; max-width: 560px; margin: 0 auto; }

/* ── Étapes ── */
.steps-list { display: flex; flex-direction: column; gap: 20px; }

.step-card {
  display: flex; gap: 20px; align-items: flex-start;
  opacity: 0; transform: translateY(16px);
  transition: opacity 0.5s ease, transform 0.5s ease;
}
.step-card.visible { opacity: 1; transform: translateY(0); }

.step-num {
  width: 40px; height: 40px; border-radius: 50%; flex-shrink: 0;
  color: #fff; font-family: 'Fredoka One', cursive; font-size: 18px;
  display: flex; align-items: center; justify-content: center;
}
.step-body { flex: 1; }
.step-title { font-family: 'Fredoka One', cursive; font-size: 20px; margin-bottom: 10px; }
.step-body > p { font-size: 14px; color: #4b5563; line-height: 1.7; margin-bottom: 12px; }
.step-hint { font-size: 12px; color: #9ca3af; }

/* ── Démo pixel canvas ── */
.pixel-demo { display: flex; align-items: flex-start; gap: 20px; flex-wrap: wrap; margin-bottom: 8px; }
.pixel-canvas {
  width: 112px; height: 112px;
  image-rendering: pixelated;
  border: 2px solid #e5e7eb; border-radius: 8px;
}

/* ── Grille interactive ── */
.interactive-grid-wrap {
  display: flex; align-items: center; gap: 16px; flex-wrap: wrap;
  margin-bottom: 12px;
}
.grid-section { display: flex; flex-direction: column; align-items: center; gap: 8px; }
.grid-label   { font-family: 'Fredoka One', cursive; font-size: 13px; color: #6b7280; }
.arrow-sep    { font-size: 24px; color: #9ca3af; flex-shrink: 0; }

.interactive-grid {
  display: grid;
  grid-template-columns: repeat(8, 36px);
  gap: 2px;
  //cursor: crosshair;
}
.grid-cell {
  width: 36px; height: 36px; border-radius: 4px;
  border: 1px solid #e5e7eb; transition: background 0.1s;
}
.grid-cell:hover { border-color: #4ECDC4; }

.numbers-grid {
  display: grid;
  grid-template-columns: repeat(8, 34px);
  gap: 2px;
}
.num-cell {
  width: 34px; height: 34px; border-radius: 4px;
  display: flex; align-items: center; justify-content: center;
  font-family: 'Fredoka One', cursive; font-size: 10px;
  border: 1px solid #e5e7eb; color: #9ca3af; background: #f9fafb;
  transition: all 0.1s;
}
.num-cell.lit { background: #f0fdf4; border-color: #6BCB77; color: #166534; }

.clear-btn {
  font-family: 'Fredoka One', cursive; font-size: 13px;
  padding: 6px 16px; border-radius: 50px; border: 1.5px solid #e5e7eb;
  background: #fff; color: #374151; cursor: pointer;
}

/* ── Comparaison ── */
.comparison-box {
  display: flex; align-items: center; gap: 16px;
  justify-content: center; flex-wrap: wrap;
  margin: 14px 0; padding: 16px;
  background: #f9fafb; border-radius: 14px;
}
.comp-item  { text-align: center; }
.comp-emoji { font-size: 36px; margin-bottom: 6px; }
.comp-title { font-family: 'Fredoka One', cursive; font-size: 16px; margin-bottom: 4px; }
.comp-desc  { font-size: 12px; color: #6b7280; }
.comp-arrow { font-family: 'Fredoka One', cursive; font-size: 18px; color: #9ca3af; }

/* ── Continuer ── */
.continue-section { text-align: center; padding: 24px 0 8px; }
.continue-hint    { font-size: 15px; color: #4b5563; margin-bottom: 16px; }
.btn-continue {
  font-family: 'Fredoka One', cursive; font-size: 20px;
  padding: 16px 40px; border-radius: 50px; border: none;
  background: #4ECDC4; color: #fff; cursor: pointer;
  box-shadow: 0 8px 24px rgba(78,205,196,0.35);
}
.btn-continue:hover { transform: translateY(-2px); }
</style>
