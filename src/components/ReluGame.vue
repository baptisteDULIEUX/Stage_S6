<template>
  <div class="relu-game">

    <!-- ── Écran de départ ── -->
    <div v-if="phase === 'start'" class="start-screen">
      <div class="start-icon">⚡</div>
      <h2 class="start-title">Mémoire ReLU</h2>
      <p class="start-sub">La ReLU transforme les valeurs négatives en 0. Mais d'abord… il faut les retrouver de mémoire !</p>
      <div class="start-rule">
        👀 Observe la grille pendant <strong>{{ OBSERVE_SECS }} secondes</strong><br>
        🔄 Les cartes se retournent face cachée<br>
        🧠 Clique sur les emplacements des <strong>cases rouges</strong><br>
        📋 <strong>{{ MAX_ROUNDS }} tableaux</strong> — fais le meilleur score !
      </div>
      <button class="game-btn" @click="startGame">▶ Je suis prêt !</button>
    </div>

    <!-- ── Jeu ── -->
    <template v-else-if="phase === 'observe' || phase === 'recall' || phase === 'result'">

      <div class="stats-bar">
        <div class="stat-chip score">⚡ {{ totalFound }} <span>trouvées au total</span></div>
        <div class="stat-chip">📋 Tableau {{ round }}/{{ MAX_ROUNDS }}</div>
      </div>

      <!-- Bandeau phase -->
      <div class="phase-banner" :class="phase">
        <template v-if="phase === 'observe'">
          👀 Mémorise les cases rouges !
          <span class="countdown">{{ countdown }}</span>
        </template>
        <template v-else-if="phase === 'recall'">
          🧠 Retrouve les cases négatives !
          ({{ negFound }}/{{ negTotal }} trouvées)
        </template>
        <template v-else-if="phase === 'result'">
          ✅ Tableau {{ round }}/{{ MAX_ROUNDS }} terminé !
        </template>
      </div>

      <!-- Résultat de la manche -->
      <div v-if="phase === 'result'" class="round-result">
        <div class="rr-title">
          {{ roundEmoji }} {{ roundFound }}/{{ negTotal }} cases négatives trouvées
        </div>
        <div class="rr-stats">
          ✅ {{ roundFound }} correctes &nbsp;|&nbsp;
          ❌ {{ roundMissed }} manquées &nbsp;|&nbsp;
          ✖ {{ roundWrong }} erreurs
        </div>
        <button class="game-btn" @click="nextRound">
          {{ round < MAX_ROUNDS ? 'Tableau suivant →' : 'Voir mon score final !' }}
        </button>
      </div>

      <!-- Grille -->
      <div class="relu-grid">
        <div
            v-for="(val, i) in values"
            :key="i"
            class="card-wrap"
        >
          <div class="card-inner" :class="{ flipped: phase !== 'observe' }">

            <!-- Face avant (visible pendant observation) -->
            <div class="card-face card-front" :class="isNeg[i] ? 'negative' : 'positive'">
              {{ val }}
              <span class="card-tag">{{ isNeg[i] ? 'négatif !' : 'positif ✓' }}</span>
            </div>

            <!-- Face arrière (cachée) -->
            <div
                class="card-face card-back"
                :class="backClass(i)"
                @click="handleCardClick(i)"
            >
              <template v-if="userClicked[i] === 'correct'">✅</template>
              <template v-else-if="revealed[i]">❌</template>
              <template v-else-if="userClicked[i] === 'wrong'">✖</template>
              <template v-else>?</template>
            </div>

          </div>
        </div>
      </div>

      <!-- Barre de progression (phase recall) -->
      <div v-if="phase === 'recall'" class="progress-wrap">
        <div class="progress-labels">
          <span>Trouvées</span>
          <span>{{ negFound }} / {{ negTotal }}</span>
        </div>
        <div class="progress-track">
          <div class="progress-fill" :style="`width: ${negTotal > 0 ? negFound/negTotal*100 : 0}%`" />
        </div>
      </div>

      <div v-if="phase === 'recall'" class="feedback-row" :class="feedback">
        <template v-if="feedback === 'correct'">✅ Bonne mémoire !</template>
        <template v-else-if="feedback === 'wrong'">Cette case était positive !</template>
      </div>

    </template>

    <!-- ── Game over ── -->
    <div v-else-if="phase === 'over'" class="gameover">
      <div class="go-emoji">{{ overEmoji }}</div>
      <h2 class="go-title">Score final !</h2>
      <div class="go-score">{{ successPct }}%</div>
      <div class="go-label">de cases négatives retrouvées</div>
      <div class="score-board">
        <div class="sb-box">
          <div class="sb-val found">{{ totalFound }}</div>
          <div class="sb-lbl">trouvées</div>
        </div>
        <div class="sb-box">
          <div class="sb-val missed">{{ totalMissed }}</div>
          <div class="sb-lbl">manquées</div>
        </div>
        <div class="sb-box">
          <div class="sb-val wrong">{{ totalWrong }}</div>
          <div class="sb-lbl">erreurs</div>
        </div>
      </div>
      <p class="go-msg">{{ overMsg }}</p>
      <button class="game-btn" @click="startGame">🔄 Rejouer</button>
    </div>

  </div>
</template>

<script setup>
import { ref, computed, onUnmounted } from 'vue'

const OBSERVE_SECS = 3
const MAX_ROUNDS   = 6

// ─── État ─────────────────────────────────────────────────────────────────────
const phase       = ref('start')
const values      = ref([])
const isNeg       = ref([])
const userClicked = ref([])   // null | 'correct' | 'wrong'
const revealed    = ref([])   // true = négatif manqué révélé après manche
const countdown   = ref(OBSERVE_SECS)
const feedback    = ref('')
const round       = ref(0)

// Scores cumulés
const totalFound  = ref(0)
const totalMissed = ref(0)
const totalWrong  = ref(0)

// Scores de la manche courante
const roundFound  = ref(0)
const roundMissed = ref(0)
const roundWrong  = ref(0)

let countInterval = null

// ─── Computed ─────────────────────────────────────────────────────────────────
const negTotal = computed(() => isNeg.value.filter(Boolean).length)
const negFound = computed(() => userClicked.value.filter(v => v === 'correct').length)

const roundEmoji = computed(() => {
  if (roundMissed.value === 0 && roundWrong.value === 0) return '🏆'
  if (roundMissed.value === 0) return '🎯'
  if (roundWrong.value > 2)   return '😅'
  return '👍'
})

const successPct = computed(() => {
  const total = totalFound.value + totalMissed.value
  return total > 0 ? Math.round(totalFound.value / total * 100) : 0
})

const overEmoji = computed(() => {
  const p = successPct.value
  if (p >= 90) return '🏆'
  if (p >= 70) return '🤩'
  if (p >= 50) return '😄'
  if (p >= 30) return '🙂'
  return '😅'
})

const overMsg = computed(() => {
  const p = successPct.value
  if (p >= 90) return 'Mémoire parfaite ! Tu es un vrai neurone ReLU !'
  if (p >= 70) return 'Excellent ! Tu te souviens très bien.'
  if (p >= 50) return 'Bien joué ! Ta mémoire s\'améliore.'
  return 'Entraîne-toi encore, tu vas y arriver !'
})

// ─── Classes dynamiques ───────────────────────────────────────────────────────
function backClass(i) {
  if (userClicked.value[i] === 'correct') return 'correct-pick'
  if (userClicked.value[i] === 'wrong')   return 'wrong-pick'
  if (revealed.value[i])                  return 'missed'
  if (phase.value === 'result' && !isNeg.value[i]) return 'revealed-pos'
  return ''
}

// ─── Logique ──────────────────────────────────────────────────────────────────
function rnd(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min }

function newRound() {
  round.value++
  const negCount = rnd(3, 5)
  values.value   = Array.from({ length: 12 }, () => rnd(1, 9))
  isNeg.value    = new Array(12).fill(false)

  const indices = [...Array(12).keys()]
      .sort(() => Math.random() - 0.5)
      .slice(0, negCount)
  indices.forEach(i => {
    isNeg.value[i]  = true
    values.value[i] = -rnd(1, 9)
  })

  userClicked.value = new Array(12).fill(null)
  revealed.value    = new Array(12).fill(false)
  feedback.value    = ''
  roundFound.value  = 0
  roundMissed.value = 0
  roundWrong.value  = 0
}

function startGame() {
  round.value       = 0
  totalFound.value  = 0
  totalMissed.value = 0
  totalWrong.value  = 0
  newRound()
  startObserve()
}

function startObserve() {
  phase.value    = 'observe'
  countdown.value = OBSERVE_SECS
  clearInterval(countInterval)
  countInterval = setInterval(() => {
    countdown.value--
    if (countdown.value <= 0) {
      clearInterval(countInterval)
      phase.value = 'recall'
    }
  }, 1000)
}

function handleCardClick(i) {
  if (phase.value !== 'recall') return
  if (userClicked.value[i] !== null) return

  if (isNeg.value[i]) {
    userClicked.value[i] = 'correct'
    roundFound.value++
    feedback.value = 'correct'
    if (negFound.value === negTotal.value) {
      setTimeout(() => endRound(), 400)
    }
  } else {
    userClicked.value[i] = 'wrong'
    roundWrong.value++
    feedback.value = 'wrong'
    setTimeout(() => { feedback.value = '' }, 500)
  }
}

function endRound() {
  // Révéler les négatifs manqués
  isNeg.value.forEach((neg, i) => {
    if (neg && userClicked.value[i] !== 'correct') {
      revealed.value[i] = true
      roundMissed.value++
    }
  })
  totalFound.value  += roundFound.value
  totalMissed.value += roundMissed.value
  totalWrong.value  += roundWrong.value
  phase.value = 'result'
}

function nextRound() {
  if (round.value >= MAX_ROUNDS) {
    phase.value = 'over'
    return
  }
  newRound()
  startObserve()
}

onUnmounted(() => clearInterval(countInterval))
</script>

<style scoped>
.relu-game { display: flex; flex-direction: column; gap: 14px; }

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
.stat-chip.score { background: #A78BFA22; border-color: #A78BFA; color: #5b21b6; }

/* ── Bandeau phase ── */
.phase-banner {
  text-align: center; border-radius: 12px; padding: 10px 14px;
  font-family: 'Fredoka One', cursive; font-size: 17px; transition: all 0.3s;
}
.phase-banner.observe { background: #fffbeb; border: 2px solid #fcd34d; color: #92400e; }
.phase-banner.recall  { background: #f5f3ff; border: 2px solid #A78BFA; color: #5b21b6; }
.phase-banner.result  { background: #f0fdf4; border: 2px solid #86efac; color: #166534; }
.countdown { font-size: 36px; margin-left: 8px; }

/* ── Résultat manche ── */
.round-result {
  background: #f9fafb; border: 1.5px solid #e5e7eb;
  border-radius: 14px; padding: 14px; text-align: center;
}
.rr-title { font-family: 'Fredoka One', cursive; font-size: 18px; margin-bottom: 6px; }
.rr-stats { font-size: 13px; color: #4b5563; }

/* ── Grille ── */
.relu-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; }

/* Effet flip */
.card-wrap  { perspective: 600px; height: 70px; }
.card-inner {
  width: 100%; height: 100%;
  transform-style: preserve-3d;
  transition: transform 0.4s ease;
  position: relative;
}
.card-inner.flipped { transform: rotateY(180deg); }

.card-face {
  position: absolute; inset: 0; border-radius: 12px; border: 2.5px solid;
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  backface-visibility: hidden; -webkit-backface-visibility: hidden;
  font-family: 'Fredoka One', cursive; font-size: 22px; gap: 2px;
}

/* Face avant */
.card-front.negative { background: #fee2e2; border-color: #fca5a5; color: #dc2626; }
.card-front.positive { background: #f0fdf4; border-color: #86efac; color: #166534; }
.card-tag { font-family: 'Nunito', sans-serif; font-size: 9px; font-weight: 800; }
.card-front.negative .card-tag { color: #b91c1c; }
.card-front.positive .card-tag { color: #15803d; }

/* Face arrière */
.card-back {
  transform: rotateY(180deg);
  background: #f5f3ff; border-color: #c4b5fd;
  cursor: pointer; font-size: 26px;
}
.card-back:hover { background: #ede9fe; border-color: #A78BFA; }
.card-back.correct-pick { background: #f0fdf4; border-color: #6BCB77; cursor: default; }
.card-back.wrong-pick   { background: #fff5f5; border-color: #fca5a5; animation: shake 0.3s; }
.card-back.missed       { background: #fee2e2; border-color: #fca5a5; cursor: default; }
.card-back.revealed-pos { background: #f0fdf4; border-color: #86efac; cursor: default; }

@keyframes shake {
  0%,100% { transform: rotateY(180deg) translateX(0); }
  25%      { transform: rotateY(180deg) translateX(-5px); }
  75%      { transform: rotateY(180deg) translateX(5px); }
}

/* ── Progression ── */
.progress-wrap   { }
.progress-labels { display: flex; justify-content: space-between; font-size: 12px; color: #6b7280; margin-bottom: 4px; font-weight: 700; }
.progress-track  { height: 10px; background: #f3f4f6; border-radius: 50px; overflow: hidden; }
.progress-fill   { height: 100%; background: #A78BFA; border-radius: 50px; transition: width 0.2s; }

/* ── Feedback ── */
.feedback-row { text-align: center; font-family: 'Fredoka One', cursive; font-size: 16px; min-height: 22px; }
.feedback-row.correct { color: #16a34a; }
.feedback-row.wrong   { color: #dc2626; }

/* ── Game over ── */
.gameover  { text-align: center; padding: 16px 0; display: flex; flex-direction: column; align-items: center; gap: 12px; }
.go-emoji  { font-size: 60px; line-height: 1; }
.go-title  { font-family: 'Fredoka One', cursive; font-size: 26px; }
.go-score  { font-family: 'Fredoka One', cursive; font-size: 56px; color: #A78BFA; line-height: 1; }
.go-label  { font-size: 14px; color: #9ca3af; }
.go-msg    { font-size: 15px; color: #4b5563; line-height: 1.6; max-width: 340px; }

.score-board { display: flex; gap: 10px; flex-wrap: wrap; justify-content: center; }
.sb-box      { background: #fff; border: 1.5px solid #e5e7eb; border-radius: 12px; padding: 10px 18px; text-align: center; }
.sb-val      { font-family: 'Fredoka One', cursive; font-size: 24px; }
.sb-val.found  { color: #16a34a; }
.sb-val.missed { color: #dc2626; }
.sb-val.wrong  { color: #f59e0b; }
.sb-lbl { font-size: 11px; color: #9ca3af; }

/* ── Bouton ── */
.game-btn {
  font-family: 'Fredoka One', cursive; font-size: 17px;
  padding: 12px 28px; border-radius: 50px; border: none;
  background: #A78BFA; color: #fff; cursor: pointer; margin-top: 6px;
}
</style>