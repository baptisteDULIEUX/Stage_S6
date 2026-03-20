<template>
  <div class="conv-game">

    <!-- ── Victoire ── -->
    <div v-if="finished" class="victory">
      <div class="victory-emoji">🎉</div>
      <h2 class="victory-title">Image filtrée !</h2>
      <p class="victory-sub">
        Tu viens d'aider l'IA à passer un filtre sur l'image.<br>
        Ces 9 valeurs forment une nouvelle image qui met en valeur certains motifs (bords, formes…).
      </p>
      <div class="victory-grid">
        <div v-for="(v, i) in outputs" :key="i" class="victory-cell">{{ v }}</div>
      </div>
      <button class="game-btn" @click="init">🔄 Nouvelle image</button>
    </div>

    <template v-else>
      <div class="intro-box">
        La <strong>loupe</strong> glisse sur l'image case par case.
        Pour chaque case, une seule multiplication ! Choisis la bonne réponse pour avancer.
      </div>

      <div class="game-area">

        <!-- Image 4×4 -->
        <div>
          <p class="section-label">🖼️ Image (4×4)</p>
          <div class="img-grid">
            <div
                v-for="(val, idx) in image"
                :key="idx"
                class="img-cell"
                :class="{
                'in-window': isInWindow(idx),
                'is-focus':  imgIdx(step) === idx,
                'is-done':   isDone(idx),
              }"
            >
              {{ val }}
              <span v-if="isDone(idx)" class="cell-mini">={{ resultOf(idx) }}</span>
            </div>
          </div>
          <p class="img-note">Jaune = case active</p>
        </div>

        <!-- Filtre 3×3 -->
        <div>
          <p class="section-label">🔍 Filtre</p>
          <div class="filter-grid">
            <div
                v-for="(val, idx) in kernel"
                :key="idx"
                class="filter-cell"
                :class="{ active: idx === step }"
            >{{ val }}</div>
          </div>
          <p class="img-note">Bleu foncé = valeur active</p>
        </div>

        <!-- Question -->
        <div>
          <p class="section-label">🧮 Calcule !</p>
          <div class="question-card">
            <div class="question-math">
              <span class="q-img">{{ image[imgIdx(step)] }}</span>
              <span class="q-op">×</span>
              <span class="q-flt">{{ kernel[step] }}</span>
              <span class="q-op">=</span>
              <span class="q-unk">?</span>
            </div>
            <div class="choices">
              <button
                  v-for="c in choices"
                  :key="c"
                  class="choice-btn"
                  :class="{
                  correct: feedback === 'correct' && c === correctAnswer,
                  wrong:   feedback === 'wrong'   && c === wrongChoice,
                }"
                  :disabled="feedback === 'correct'"
                  @click="handleChoice(c)"
              >{{ c }}</button>
            </div>
            <div class="feedback-msg" :class="feedback">
              <template v-if="feedback === 'correct'">✅ Exact !</template>
              <template v-if="feedback === 'wrong'">Essaie encore !</template>
            </div>
          </div>

          <div class="dots">
            <div
                v-for="i in TOTAL"
                :key="i"
                class="dot"
                :class="{ done: i-1 < step, current: i-1 === step }"
            />
          </div>
          <p class="progress-text">Case {{ step + 1 }} / {{ TOTAL }}</p>
        </div>
      </div>

      <!-- Image filtrée en cours -->
      <div v-if="step > 0">
        <p class="section-label">✨ Image filtrée (en cours…)</p>
        <div class="result-grid">
          <div
              v-for="i in TOTAL"
              :key="i"
              class="result-cell"
              :class="{ filled: i-1 < outputs.length }"
          >
            {{ i-1 < outputs.length ? outputs[i-1] : '?' }}
          </div>
        </div>
        <p class="img-note">Chaque case = pixel × filtre → l'IA détecte des formes !</p>
      </div>
    </template>

  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const TOTAL = 9

const image   = ref([])
const kernel  = ref([])
const step    = ref(0)
const outputs = ref([])
const feedback   = ref('')
const wrongChoice = ref(null)

// Index dans le tableau image (4×4) correspondant à l'étape courante
function imgIdx(s) {
  const row = Math.floor(s / 3)
  const col = s % 3
  return row * 4 + col
}

function isInWindow(i) {
  const r = Math.floor(i / 4), c = i % 4
  return r < 3 && c < 3
}

function isDone(i) {
  for (let s = 0; s < step.value; s++) {
    if (imgIdx(s) === i) return true
  }
  return false
}

function resultOf(i) {
  for (let s = 0; s < step.value; s++) {
    if (imgIdx(s) === i) return outputs.value[s]
  }
  return null
}

const correctAnswer = computed(() =>
    image.value[imgIdx(step.value)] * kernel.value[step.value]
)

const choices = computed(() => {
  const correct = correctAnswer.value
  const set = new Set([correct])
  while (set.size < 4) {
    set.add(Math.floor(Math.random() * Math.max(18, correct + 6)))
  }
  return [...set].sort(() => Math.random() - 0.5)
})

const finished = computed(() => step.value >= TOTAL)

function rnd(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min }

function init() {
  image.value  = Array.from({ length: 16 }, () => rnd(1, 9))
  kernel.value = Array.from({ length: 9  }, () => rnd(0, 2))
  step.value   = 0
  outputs.value = []
  feedback.value   = ''
  wrongChoice.value = null
}

function handleChoice(choice) {
  if (choice === correctAnswer.value) {
    feedback.value = 'correct'
    outputs.value.push(choice)
    setTimeout(() => {
      step.value++
      feedback.value   = ''
      wrongChoice.value = null
    }, 700)
  } else {
    wrongChoice.value = choice
    feedback.value = 'wrong'
    setTimeout(() => {
      feedback.value   = ''
      wrongChoice.value = null
    }, 500)
  }
}

init()
</script>

<style scoped>
.conv-game { display: flex; flex-direction: column; gap: 20px; }

.intro-box {
  background: var(--color-background-secondary, #f9fafb);
  border-left: 4px solid #FF6B6B;
  border-radius: 0 12px 12px 0;
  padding: 10px 14px;
  font-size: 14px;
  color: #4b5563;
  line-height: 1.6;
}

.section-label {
  font-family: 'Fredoka One', cursive;
  font-size: 13px; color: #6b7280; margin-bottom: 8px;
}

/* ── Layout ── */
.game-area {
  display: grid;
  grid-template-columns: auto auto 1fr;
  gap: 20px;
  align-items: start;
}
@media (max-width: 580px) { .game-area { grid-template-columns: 1fr; } }

/* ── Image ── */
.img-grid { display: grid; grid-template-columns: repeat(4, 50px); gap: 4px; }
.img-cell {
  width: 50px; height: 50px; border-radius: 10px;
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  font-family: 'Fredoka One', cursive; font-size: 19px;
  background: #f9fafb; border: 2px solid #e5e7eb;
  color: #374151; transition: all 0.2s; position: relative;
}
.img-cell.in-window { background: #FF6B6B11; border-color: #FF6B6B88; }
.img-cell.is-focus  { background: #FFE66D; border: 3px solid #f59e0b; transform: scale(1.1); z-index: 2; }
.img-cell.is-done   { background: #f0fdf4; border-color: #86efac; }
.cell-mini { font-size: 10px; color: #16a34a; font-family: 'Nunito', sans-serif; font-weight: 800; }
.img-note  { font-size: 11px; color: #9ca3af; margin-top: 6px; text-align: center; }

/* ── Filtre ── */
.filter-grid { display: grid; grid-template-columns: repeat(3, 44px); gap: 4px; }
.filter-cell {
  width: 44px; height: 44px; border-radius: 8px;
  display: flex; align-items: center; justify-content: center;
  font-family: 'Fredoka One', cursive; font-size: 18px;
  background: #4ECDC422; border: 2px solid #4ECDC488;
  color: #374151; transition: all 0.2s;
}
.filter-cell.active { background: #4ECDC4; border-color: #4ECDC4; color: #fff; transform: scale(1.1); }

/* ── Question ── */
.question-card {
  background: #fff; border: 1px solid #e5e7eb;
  border-radius: 16px; padding: 16px; min-width: 190px;
}
.question-math {
  display: flex; align-items: center; gap: 8px;
  justify-content: center;
  font-family: 'Fredoka One', cursive; font-size: 30px;
  margin-bottom: 14px;
}
.q-img { color: #FF6B6B; }
.q-flt { color: #4ECDC4; }
.q-op  { color: #9ca3af; font-size: 22px; }
.q-unk { color: #9ca3af; }
.choices { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom: 8px; }
.choice-btn {
  padding: 10px; border-radius: 12px;
  font-family: 'Fredoka One', cursive; font-size: 22px;
  border: 2.5px solid #e5e7eb; background: #f9fafb;
  color: #374151; cursor: pointer; transition: all 0.1s;
}
.choice-btn:hover:not(:disabled) { background: #FF6B6B22; border-color: #FF6B6B; transform: scale(1.05); }
.choice-btn:disabled { cursor: default; }
.choice-btn.correct { background: #f0fdf4; border-color: #6BCB77; color: #166534; }
.choice-btn.wrong   { background: #fff5f5; border-color: #FF6B6B; animation: shake 0.3s; }
@keyframes shake { 0%,100%{transform:translateX(0)} 25%{transform:translateX(-5px)} 75%{transform:translateX(5px)} }

.feedback-msg { font-family: 'Fredoka One', cursive; font-size: 14px; text-align: center; min-height: 20px; }
.feedback-msg.correct { color: #16a34a; }
.feedback-msg.wrong   { color: #dc2626; }

/* ── Progression ── */
.dots { display: flex; gap: 6px; justify-content: center; margin: 10px 0 4px; flex-wrap: wrap; }
.dot  { width: 12px; height: 12px; border-radius: 50%; background: #e5e7eb; transition: background 0.2s; }
.dot.done    { background: #6BCB77; }
.dot.current { background: #FF6B6B; }
.progress-text { font-size: 12px; color: #9ca3af; text-align: center; }

/* ── Résultat ── */
.result-grid { display: grid; grid-template-columns: repeat(3, 50px); gap: 4px; margin-top: 8px; }
.result-cell {
  width: 50px; height: 50px; border-radius: 10px;
  display: flex; align-items: center; justify-content: center;
  font-family: 'Fredoka One', cursive; font-size: 18px;
  border: 2px dashed #e5e7eb; color: #9ca3af;
  background: #f9fafb; transition: all 0.3s;
}
.result-cell.filled { background: #f0fdf4; border: 2px solid #86efac; color: #166534; }

/* ── Victoire ── */
.victory { text-align: center; padding: 16px 0; display: flex; flex-direction: column; align-items: center; gap: 14px; }
.victory-emoji { font-size: 60px; line-height: 1; }
.victory-title { font-family: 'Fredoka One', cursive; font-size: 26px; }
.victory-sub   { font-size: 14px; color: #4b5563; line-height: 1.6; max-width: 360px; }
.victory-grid  { display: grid; grid-template-columns: repeat(3, 56px); gap: 5px; }
.victory-cell  {
  width: 56px; height: 56px; border-radius: 10px;
  display: flex; align-items: center; justify-content: center;
  font-family: 'Fredoka One', cursive; font-size: 20px;
  background: #f0fdf4; border: 2px solid #86efac; color: #166534;
}
.game-btn {
  font-family: 'Fredoka One', cursive; font-size: 16px;
  padding: 12px 28px; border-radius: 50px; border: none;
  background: #FF6B6B; color: #fff; cursor: pointer;
}
</style>
