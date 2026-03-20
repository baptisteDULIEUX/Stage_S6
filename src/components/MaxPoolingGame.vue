<template>
  <div class="mp-game">

    <!-- ── Écran de départ ── -->
    <div v-if="gameState === 'start'" class="start-screen">
      <div class="start-icon">📐</div>
      <h2 class="start-title">MaxPooling</h2>
      <p class="start-sub">L'IA réduit l'image en gardant seulement les valeurs les plus importantes.</p>
      <div class="start-rule">
        🔲 L'image est divisée en groupes <strong>2×2</strong><br>
        👆 Clique sur la <strong>plus grande valeur</strong> de chaque groupe<br>
        ♾️ Les manches s'enchaînent à l'infini<br>
        ⏱ Tu as <strong>{{ TIME_LIMIT }} secondes</strong> — fais le max de groupes !
      </div>
      <button class="game-btn primary" @click="startGame">▶ Lancer le chrono !</button>
    </div>

    <!-- ── Jeu ── -->
    <template v-else-if="gameState === 'playing'">

      <div class="stats-bar">
        <div class="stat-chip score">🏆 {{ score }} <span>groupes résolus</span></div>
        <div class="stat-chip">🔄 Manche {{ currentRound }}</div>
      </div>

      <div class="timer-wrap">
        <div class="timer-row">
          <div class="timer-label" :class="{ warning: timerSec <= 6 }">⏱ {{ timerSec }}s</div>
          <div class="timer-track">
            <div
                class="timer-fill"
                :class="{ warning: timerSec <= 6 }"
                :style="`width: ${timerSec / TIME_LIMIT * 100}%`"
            />
          </div>
        </div>
      </div>

      <Transition name="flash">
        <div v-if="roundFlash" class="round-flash">🎊 Manche complète ! Continue !</div>
      </Transition>

      <div class="group-explain">
        Groupe {{ groupStep + 1 }}/4 — valeurs :
        <strong>{{ activeGroupVals.join(', ') }}</strong>
        → lequel est le plus grand ?
      </div>

      <div class="game-layout">

        <!-- Image 4×4 -->
        <div>
          <p class="section-label">🖼️ Image (4×4)</p>
          <div class="source-grid">
            <div
                v-for="(val, idx) in image"
                :key="idx"
                class="src-cell"
                :class="cellClass(idx)"
                @click="handleClick(idx)"
            >{{ val }}</div>
          </div>
        </div>

        <div class="arrow">→</div>

        <!-- Résultat 2×2 -->
        <div>
          <p class="section-label">📐 Réduite (2×2)</p>
          <div class="result-grid">
            <div
                v-for="i in 4"
                :key="i"
                class="res-cell"
                :class="{ filled: i - 1 < roundResults.length }"
            >
              {{ i - 1 < roundResults.length ? roundResults[i - 1] : '?' }}
            </div>
          </div>
        </div>

      </div>

      <div class="feedback-row" :class="feedback">
        <template v-if="feedback === 'correct'">✅ Bonne valeur !</template>
        <template v-else-if="feedback === 'wrong'">Pas le plus grand, cherche encore !</template>
        <template v-else>Clique sur la plus grande valeur du groupe !</template>
      </div>

    </template>

    <!-- ── Game over ── -->
    <div v-else-if="gameState === 'over'" class="gameover">
      <div class="go-emoji">{{ scoreEmoji }}</div>
      <h2 class="go-title">Temps écoulé !</h2>
      <div class="go-score">{{ score }}</div>
      <div class="go-label">groupes résolus en {{ TIME_LIMIT }}s</div>
      <div class="go-medals">
        <div class="medal">
          <div class="medal-val">{{ Math.floor(score / 4) }}</div>
          <div class="medal-lbl">manches complètes</div>
        </div>
        <div class="medal">
          <div class="medal-val">{{ score % 4 }}/4</div>
          <div class="medal-lbl">groupes en cours</div>
        </div>
        <div class="medal">
          <div class="medal-val">{{ score > 0 ? (TIME_LIMIT / score).toFixed(1) : '-' }}s</div>
          <div class="medal-lbl">par groupe</div>
        </div>
      </div>
      <p class="go-msg">{{ scoreMsg }}</p>
      <button class="game-btn primary" @click="startGame">🔄 Rejouer</button>
    </div>

  </div>
</template>

<script setup>
import { ref, computed, onUnmounted } from 'vue'

const TIME_LIMIT = 20

// ─── État ─────────────────────────────────────────────────────────────────────
const gameState   = ref('start')
const image       = ref([])
const groupStep   = ref(0)
const roundResults = ref([])
const score       = ref(0)
const timerSec    = ref(TIME_LIMIT)
const feedback    = ref('')
const wrongIdx    = ref(-1)
const roundFlash  = ref(false)
let   timerInterval = null

// ─── Calculs ──────────────────────────────────────────────────────────────────
const currentRound = computed(() => Math.floor(score.value / 4) + 1)

function groupCells(g) {
  const row = Math.floor(g / 2) * 2
  const col = (g % 2) * 2
  return [row * 4 + col, row * 4 + col + 1, (row + 1) * 4 + col, (row + 1) * 4 + col + 1]
}

function maxOfGroup(g) {
  return Math.max(...groupCells(g).map(i => image.value[i]))
}

const activeGroupVals = computed(() =>
    groupCells(groupStep.value).map(i => image.value[i])
)

// ─── Classes CSS dynamiques ───────────────────────────────────────────────────
function cellClass(idx) {
  const active = groupCells(groupStep.value)
  const maxVal = maxOfGroup(groupStep.value)

  // Cellule appartenant à un groupe déjà résolu
  for (let g = 0; g < groupStep.value; g++) {
    if (groupCells(g).includes(idx)) return 'dimmed'
  }

  if (!active.includes(idx)) return ''

  if (feedback.value === 'correct' && image.value[idx] === maxVal) return 'active-group selected'
  if (feedback.value === 'wrong'   && idx === wrongIdx.value)      return 'active-group wrong-sel'
  if (feedback.value === 'wrong'   && image.value[idx] === maxVal) return 'active-group is-max'
  return 'active-group'
}

// ─── Logique ──────────────────────────────────────────────────────────────────
function rnd(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min }

function newRound() {
  image.value   = Array.from({ length: 16 }, () => rnd(1, 9))
  groupStep.value  = 0
  roundResults.value = []
  feedback.value   = ''
  wrongIdx.value   = -1
}

function startGame() {
  score.value    = 0
  timerSec.value = TIME_LIMIT
  gameState.value = 'playing'
  newRound()
  clearInterval(timerInterval)
  timerInterval = setInterval(() => {
    timerSec.value--
    if (timerSec.value <= 0) {
      clearInterval(timerInterval)
      timerSec.value  = 0
      gameState.value = 'over'
    }
  }, 1000)
}

function handleClick(idx) {
  if (gameState.value !== 'playing' || feedback.value === 'correct') return
  const cells  = groupCells(groupStep.value)
  if (!cells.includes(idx)) return

  const val    = image.value[idx]
  const maxVal = maxOfGroup(groupStep.value)

  if (val === maxVal) {
    feedback.value = 'correct'
    score.value++
    roundResults.value.push(val)
    setTimeout(() => {
      groupStep.value++
      feedback.value = ''
      wrongIdx.value = -1
      if (groupStep.value >= 4) {
        roundFlash.value = true
        setTimeout(() => {
          roundFlash.value = false
          newRound()
        }, 600)
      }
    }, 500)
  } else {
    wrongIdx.value = idx
    feedback.value = 'wrong'
    setTimeout(() => {
      feedback.value = ''
      wrongIdx.value = -1
    }, 400)
  }
}

// ─── Messages de fin ──────────────────────────────────────────────────────────
const scoreEmoji = computed(() => {
  const s = score.value
  if (s === 0) return '😅'
  if (s < 5)  return '🙂'
  if (s < 10) return '😄'
  if (s < 16) return '🤩'
  return '🔥'
})

const scoreMsg = computed(() => {
  const s = score.value
  if (s === 0) return 'Pas de panique, tu vas t\'améliorer !'
  if (s < 5)  return 'Bon début ! Tu as compris le principe.'
  if (s < 10) return 'Bien joué ! Tu connais le MaxPooling.'
  if (s < 16) return 'Excellent ! Tu es vraiment rapide !'
  return 'Incroyable ! Tu es plus rapide qu\'un GPU !'
})

onUnmounted(() => clearInterval(timerInterval))
</script>

<style scoped>
.mp-game { display: flex; flex-direction: column; gap: 14px; }

/* ── Départ ── */
.start-screen { text-align: center; padding: 16px 0; display: flex; flex-direction: column; align-items: center; gap: 14px; }
.start-icon  { font-size: 60px; line-height: 1; }
.start-title { font-family: 'Fredoka One', cursive; font-size: 26px; }
.start-sub   { font-size: 14px; color: #4b5563; line-height: 1.6; max-width: 340px; }
.start-rule  {
  background: #fff; border: 1.5px solid #e5e7eb; border-radius: 14px;
  padding: 12px 16px; font-size: 13px; color: #374151;
  max-width: 320px; line-height: 1.9; text-align: left;
}

/* ── Stats ── */
.stats-bar  { display: flex; gap: 10px; flex-wrap: wrap; }
.stat-chip  {
  background: #fff; border: 1.5px solid #e5e7eb; border-radius: 50px;
  padding: 6px 16px; font-family: 'Fredoka One', cursive; font-size: 15px;
  color: #374151; display: flex; align-items: center; gap: 6px;
}
.stat-chip span { font-size: 12px; color: #9ca3af; font-family: 'Nunito', sans-serif; font-weight: 700; }
.stat-chip.score { background: #4ECDC422; border-color: #4ECDC4; color: #0f766e; }

/* ── Timer ── */
.timer-row   { display: flex; align-items: center; gap: 10px; }
.timer-label { font-family: 'Fredoka One', cursive; font-size: 20px; min-width: 46px; }
.timer-label.warning { color: #FF6B6B; }
.timer-track { flex: 1; height: 14px; background: #f3f4f6; border-radius: 50px; overflow: hidden; }
.timer-fill  { height: 100%; background: #4ECDC4; border-radius: 50px; transition: width 0.1s linear; }
.timer-fill.warning { background: #FF6B6B; }

/* ── Flash manche ── */
.round-flash { text-align: center; padding: 8px; font-family: 'Fredoka One', cursive; font-size: 16px; color: #0f766e; background: #f0fdf4; border-radius: 10px; }
.flash-enter-active, .flash-leave-active { transition: opacity 0.2s; }
.flash-enter-from, .flash-leave-to       { opacity: 0; }

/* ── Explication ── */
.group-explain {
  background: #fff; border: 1.5px solid #4ECDC488;
  border-radius: 12px; padding: 10px 14px;
  font-size: 13px; color: #4b5563; text-align: center;
}

/* ── Layout ── */
.game-layout { display: grid; grid-template-columns: auto auto auto; gap: 14px; align-items: center; }
@media (max-width: 480px) { .game-layout { grid-template-columns: 1fr; } }
.section-label { font-family: 'Fredoka One', cursive; font-size: 13px; color: #6b7280; margin-bottom: 8px; text-align: center; }
.arrow { font-family: 'Fredoka One', cursive; font-size: 26px; color: #9ca3af; text-align: center; }

/* ── Image source ── */
.source-grid { display: grid; grid-template-columns: repeat(4, 52px); gap: 3px; }
.src-cell {
  width: 52px; height: 52px; border-radius: 8px;
  display: flex; align-items: center; justify-content: center;
  font-family: 'Fredoka One', cursive; font-size: 20px;
  border: 2px solid #e5e7eb; background: #f9fafb; color: #374151;
  transition: all 0.15s; cursor: pointer;
}
.src-cell.active-group { border-color: #4ECDC4; background: #4ECDC411; }
.src-cell.is-max       { background: #FFE66D; border-color: #f59e0b; }
.src-cell.selected     { background: #f0fdf4; border-color: #6BCB77; }
.src-cell.wrong-sel    { background: #fff5f5; border-color: #FF6B6B; animation: shake 0.3s; }
.src-cell.dimmed       { opacity: 0.3; cursor: default; }
@keyframes shake { 0%,100%{transform:translateX(0)} 25%{transform:translateX(-4px)} 75%{transform:translateX(4px)} }

/* ── Résultat ── */
.result-grid { display: grid; grid-template-columns: repeat(2, 60px); gap: 4px; }
.res-cell {
  width: 60px; height: 60px; border-radius: 12px;
  display: flex; align-items: center; justify-content: center;
  font-family: 'Fredoka One', cursive; font-size: 22px;
  border: 2px dashed #e5e7eb; color: #9ca3af; background: #f9fafb;
  transition: all 0.25s;
}
.res-cell.filled { background: #f0fdf4; border: 2px solid #6BCB77; color: #166534; animation: pop 0.25s; }
@keyframes pop { 0%,100%{transform:scale(1)} 50%{transform:scale(1.1)} }

/* ── Feedback ── */
.feedback-row { text-align: center; font-family: 'Fredoka One', cursive; font-size: 16px; min-height: 22px; }
.feedback-row.correct { color: #16a34a; }
.feedback-row.wrong   { color: #dc2626; }

/* ── Game over ── */
.gameover  { text-align: center; padding: 16px 0; display: flex; flex-direction: column; align-items: center; gap: 12px; }
.go-emoji  { font-size: 60px; line-height: 1; }
.go-title  { font-family: 'Fredoka One', cursive; font-size: 26px; }
.go-score  { font-family: 'Fredoka One', cursive; font-size: 56px; color: #4ECDC4; line-height: 1; }
.go-label  { font-size: 14px; color: #9ca3af; }
.go-medals { display: flex; gap: 10px; flex-wrap: wrap; justify-content: center; }
.medal     { background: #fff; border: 1.5px solid #e5e7eb; border-radius: 12px; padding: 10px 18px; text-align: center; }
.medal-val { font-family: 'Fredoka One', cursive; font-size: 22px; color: #374151; }
.medal-lbl { font-size: 11px; color: #9ca3af; }
.go-msg    { font-size: 15px; color: #4b5563; line-height: 1.6; max-width: 340px; }

/* ── Boutons ── */
.game-btn {
  font-family: 'Fredoka One', cursive; font-size: 17px;
  padding: 12px 30px; border-radius: 50px; border: none; cursor: pointer;
}
.game-btn.primary { background: #4ECDC4; color: #fff; }
</style>
