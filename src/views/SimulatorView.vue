<template>
  <div class="simulator">

    <!-- ══ POPUP D'ERREUR ════════════════════════════════════════════════════ -->
    <Teleport to="body">
      <div v-if="errorPopup.show" class="popup-overlay" @click.self="closeError">
        <div class="popup-card">
          <div class="popup-icon">🤔</div>
          <h2 class="popup-title">Oups ! Ce n'est pas la bonne image…</h2>
          <p class="popup-body">{{ errorPopup.message }}</p>

          <div class="popup-expected">
            <p class="popup-expected-label">La bonne combinaison était :</p>
            <div class="popup-inputs">
              <div
                v-for="id in INPUT_IDS" :key="id"
                class="popup-input-chip"
                :style="round.inputs[id] === 1
                  ? `background:${NODES[id].color}22; border-color:${NODES[id].color}`
                  : ''"
              >
                <span>{{ NODES[id].emoji }}</span>
                <span class="popup-chip-label">{{ NODES[id].label }}</span>
                <span class="popup-chip-badge"
                  :style="round.inputs[id] === 1 ? `background:${NODES[id].color}` : ''">
                  {{ round.inputs[id] }}
                </span>
              </div>
            </div>
          </div>

          <div class="popup-actions">
            <button class="btn btn-primary" @click="applyCorrectInputs">
              ✅ Appliquer les bons indices
            </button>
            <button class="btn btn-ghost" @click="closeError">
              🔄 Je veux réessayer
            </button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- ── En-tête ── -->
    <div class="sim-header">
      <h1 class="sim-title">🐱🐶 Simulateur Chat / Chien</h1>
      <p class="sim-desc">Observe comment un réseau de neurones apprend à reconnaître des animaux !</p>
    </div>

    <!-- ── Sélecteur de manche ── -->
    <div class="round-selector">
      <button
        v-for="(r, i) in ROUNDS"
        :key="r.id"
        class="round-pill"
        :class="{ active: store.currentRoundIndex === i }"
        :style="store.currentRoundIndex === i ? `background: ${r.color}` : ''"
        @click="store.goToRound(i)"
      >
        Manche {{ r.id }}
      </button>
    </div>

    <!-- ── Corps principal ── -->
    <div class="sim-body">

      <!-- Colonne gauche : carte image + inputs -->
      <aside class="sim-left">

        <div class="image-card card" :style="`border-top: 6px solid ${round.color}`">
          <div class="animal-display">{{ round.cardEmoji }}</div>
          <div class="animal-label">{{ round.cardLabel }}</div>
          <div class="round-title">{{ round.title }}</div>
        </div>

        <!-- Panneau entrées cliquables -->
        <div class="inputs-card card">
          <h3 class="section-label">📥 Entrées
            <span v-if="!store.result" class="toggle-hint">← clique pour activer</span>
          </h3>
          <div class="input-rows">
            <div
              v-for="id in INPUT_IDS" :key="id"
              class="input-row"
              :class="{
                'input-active':    userInputs[id] === 1,
                'input-clickable': !store.result,
              }"
              :style="userInputs[id] === 1
                ? `border-color: ${NODES[id].color}; background: ${NODES[id].color}18`
                : ''"
              @click="!store.result && toggleInput(id)"
            >
              <span class="input-emoji">{{ NODES[id].emoji }}</span>
              <span class="input-name">{{ NODES[id].label }}</span>
              <span
                class="input-badge"
                :style="userInputs[id] === 1
                  ? `background: ${NODES[id].color}`
                  : 'background:#e5e7eb; color:#374151'"
              >{{ userInputs[id] }}</span>
            </div>
          </div>
        </div>

        <!-- Notes d'apprentissage (manche 2) -->
        <div v-if="round.learningNote && store.result" class="learning-card card">
          <h3 class="section-label">⚙️ Poids ajustés !</h3>
          <ul class="learning-list">
            <li v-for="note in round.learningNote" :key="note">{{ note }}</li>
          </ul>
        </div>
      </aside>

      <!-- Colonne centrale : graphe + contrôles -->
      <div class="sim-center">
        <div class="graph-card card">
          <NeuronGraph
            :layer-order="LAYER_ORDER"
            :nodes="NODES"
            :connections="CONNECTIONS"
            :weights="store.currentWeights"
            :node-states="graphNodeStates"
            :threshold="2"
            :can-toggle="!store.result"
            @toggle-input="toggleInput"
          />
        </div>

        <div class="controls">
          <button class="btn btn-ghost"
            :disabled="store.currentRoundIndex === 0"
            @click="store.goToRound(store.currentRoundIndex - 1)">← Précédente</button>

          <button class="btn btn-primary"
            :disabled="!!store.result"
            @click="handleCompute">
            {{ store.result ? '✅ Calculé' : '▶ Calculer !' }}
          </button>

          <button class="btn btn-ghost"
            :disabled="!store.result"
            @click="handleReset">🔄 Reset</button>

          <button class="btn btn-teal"
            :disabled="store.currentRoundIndex === ROUNDS.length - 1"
            @click="store.goToRound(store.currentRoundIndex + 1)">Suivante →</button>
        </div>
      </div>

      <!-- Colonne droite : résultats -->
      <aside class="sim-right">

        <div class="hidden-card card">
          <h3 class="section-label">🧠 Neurones cachés</h3>
          <div class="hidden-rows">
            <div
              v-for="id in HIDDEN_IDS" :key="id"
              class="hidden-row"
              :class="{
                'hidden-active':   store.result && store.result.nodeStates[id]?.active,
                'hidden-inactive': store.result && !store.result.nodeStates[id]?.active,
              }"
            >
              <span class="hidden-label">{{ id }}</span>
              <span class="hidden-sum" v-if="store.result">
                Σ = {{ store.result.nodeStates[id]?.sum }}
              </span>
              <span class="hidden-status" v-if="store.result">
                {{ store.result.nodeStates[id]?.active ? '⚡ ACTIF' : '💤 inactif' }}
              </span>
            </div>
          </div>
          <p class="threshold-note">Seuil d'activation : Σ ≥ 2</p>
        </div>

        <!-- Résultat -->
        <div v-if="store.result" class="result-card card"
          :class="isCorrect ? 'result-correct' : 'result-wrong'">
          <div class="result-emoji">{{ isCorrect ? '🎉' : '😬' }}</div>
          <div class="result-scores">
            <div v-for="id in OUTPUT_IDS" :key="id"
              class="score-item"
              :class="{ winner: store.result.prediction === id }"
            >
              {{ NODES[id].emoji }} {{ id }} :
              <strong>{{ store.result.nodeStates[id]?.score }} pts</strong>
            </div>
          </div>
          <div class="result-verdict">
            Prédiction : <strong>{{ store.result.prediction }}</strong>
          </div>
          <div class="result-label">{{ isCorrect ? '✅ Correct !' : '❌ Raté !' }}</div>
          <p class="result-expl">{{ resultExplication }}</p>
        </div>

        <div class="explain-card card">
          <h3 class="section-label">📖 Comprendre cette manche</h3>
          <p>{{ round.subtitle }}</p>
          <div v-if="round.id === 1 && store.result" class="expl-note expl-error">
            💡 Les oreilles pointues avaient un poids trop élevé (3) pour H3,
            ce qui a trop boosté le score CHIEN même sans moustaches.
          </div>
          <div v-if="round.id === 2 && !store.result" class="expl-note expl-tip">
            🔑 L'image n'a pas changé. C'est le <strong>réseau</strong> qui a changé (ses poids).
          </div>
          <div v-if="round.id >= 3 && store.result" class="expl-note expl-gen">
            🌍 <strong>Généralisation</strong> : le réseau n'a jamais vu cette image,
            mais ses poids appris lui permettent de la classer correctement !
          </div>
        </div>
      </aside>
    </div>

    <!-- Barre de progression -->
    <div class="progress-bar-wrap">
      <div class="progress-bar"
        :style="`width: ${(store.currentRoundIndex + 1) / ROUNDS.length * 100}%`" />
    </div>
    <p class="progress-label">Manche {{ store.currentRoundIndex + 1 }} / {{ ROUNDS.length }}</p>

  </div>
</template>

<script setup>
import { ref, computed, reactive, watch } from 'vue'
import NeuronGraph from '../components/NeuronGraph.vue'
import { useSimulatorStore, ROUNDS, computeNetworkState } from '../stores/simulator.js'
import {
  NODES, CONNECTIONS, LAYER_ORDER,
  INPUT_IDS, HIDDEN_IDS, OUTPUT_IDS,
} from '../network/catDogNetwork.js'

const store = useSimulatorStore()
const round = computed(() => store.currentRound)

// ─── Entrées utilisateur ──────────────────────────────────────────────────────
// Démarrent toutes à 0. L'utilisateur les bascule avant de calculer.
const userInputs = reactive(Object.fromEntries(INPUT_IDS.map(id => [id, 0])))

function resetUserInputs() {
  INPUT_IDS.forEach(id => { userInputs[id] = 0 })
}

function toggleInput(id) {
  userInputs[id] = userInputs[id] === 1 ? 0 : 1
}

// Réinitialiser les entrées quand on change de manche
watch(() => store.currentRoundIndex, () => {
  resetUserInputs()
  store.reset()
})

// ─── État du graphe ──────────────────────────────────────────────────────────
// Pré-calculé depuis les entrées utilisateur (pour le graphe, sans validation)
const liveNetworkState = computed(() =>
  computeNetworkState(userInputs, store.currentWeights)
)

// Le graphe affiche l'état live uniquement si le calcul est validé
const graphNodeStates = computed(() =>
  store.result ? store.result.nodeStates : buildInputOnlyStates()
)

// État partiel : uniquement les entrées (pour montrer les 0/1 sans déclencher le calcul)
function buildInputOnlyStates() {
  return Object.fromEntries(
    INPUT_IDS.map(id => [id, { value: userInputs[id], active: userInputs[id] === 1 }])
  )
}

// ─── Validation et calcul ─────────────────────────────────────────────────────
const errorPopup = reactive({ show: false, message: '' })

function handleCompute() {
  // Vérifier si les entrées correspondent à la manche
  const expected = round.value.inputs
  const isValid  = INPUT_IDS.every(id => userInputs[id] === expected[id])

  if (!isValid) {
    // Construire un message d'erreur explicite
    const wrongOnes = INPUT_IDS
      .filter(id => userInputs[id] !== expected[id])
      .map(id => `${NODES[id].emoji} ${NODES[id].label} devrait être ${expected[id]}`)
      .join(', ')
    errorPopup.message = `Cette combinaison ne correspond pas à l'image de cette manche. ${wrongOnes}.`
    errorPopup.show = true
    return
  }

  // Valide : lancer le calcul
  store.computeWith(userInputs)
}

function closeError() {
  errorPopup.show = false
}

function applyCorrectInputs() {
  INPUT_IDS.forEach(id => { userInputs[id] = round.value.inputs[id] })
  errorPopup.show = false
}

function handleReset() {
  store.reset()
  resetUserInputs()
}

// ─── Résultat ─────────────────────────────────────────────────────────────────
const isCorrect = computed(() =>
  store.result?.prediction === round.value.expectedAnswer
)

const resultExplication = computed(() => {
  if (!store.result) return ''
  const id = round.value.id
  if (id === 1) return 'Le réseau s\'est trompé car les poids n\'étaient pas bien réglés.'
  if (id === 2) return 'Après ajustement des poids, le réseau reconnaît maintenant ce chat !'
  if (id === 3) return 'Même avec les moustaches en plus, le chat est bien reconnu !'
  if (id === 4) return 'Sans moustaches ni oreilles, seuls les yeux ronds activent H3 → CHIEN !'
  return ''
})
</script>

<style scoped>
/* ══ POPUP ════════════════════════════════════════════════════════════════════ */
.popup-overlay {
  position: fixed; inset: 0;
  background: rgba(0,0,0,0.45);
  display: flex; align-items: center; justify-content: center;
  z-index: 1000;
  padding: 20px;
}
.popup-card {
  background: #fff;
  border-radius: 24px;
  padding: 36px 32px;
  max-width: 480px;
  width: 100%;
  box-shadow: 0 24px 64px rgba(0,0,0,0.2);
  text-align: center;
}
.popup-icon  { font-size: 56px; margin-bottom: 12px; }
.popup-title {
  font-family: 'Fredoka One', cursive;
  font-size: 22px; color: var(--dark);
  margin-bottom: 10px;
}
.popup-body  { font-size: 14px; color: #4b5563; line-height: 1.6; margin-bottom: 24px; }

.popup-expected        { background: #f9fafb; border-radius: 14px; padding: 16px; margin-bottom: 24px; }
.popup-expected-label  { font-size: 13px; font-weight: 700; color: #374151; margin-bottom: 10px; }
.popup-inputs          { display: flex; flex-direction: column; gap: 8px; }
.popup-input-chip {
  display: flex; align-items: center; gap: 8px;
  padding: 8px 12px; border-radius: 10px;
  border: 2px solid #e5e7eb; background: #f3f4f6;
  text-align: left;
}
.popup-chip-label { flex: 1; font-size: 13px; font-weight: 600; }
.popup-chip-badge {
  width: 26px; height: 26px; border-radius: 50%;
  background: #e5e7eb; color: #fff;
  font-family: 'Fredoka One', cursive; font-size: 14px;
  display: flex; align-items: center; justify-content: center;
}
.popup-actions { display: flex; flex-direction: column; gap: 10px; }

/* ══ SIMULATEUR ═══════════════════════════════════════════════════════════════ */
.simulator { display: flex; flex-direction: column; gap: 24px; }

.sim-header { text-align: center; }
.sim-title  { font-family: 'Fredoka One', cursive; font-size: clamp(26px, 4vw, 42px); margin-bottom: 6px; }
.sim-desc   { color: #4b5563; font-size: 16px; }

.round-selector { display: flex; gap: 10px; justify-content: center; flex-wrap: wrap; }
.round-pill {
  font-family: 'Fredoka One', cursive; font-size: 15px;
  padding: 8px 22px; border-radius: 50px;
  border: 2.5px solid #e5e7eb; background: #fff; color: #374151;
  cursor: pointer;
}
.round-pill.active { color: #fff; border-color: transparent; }

.sim-body {
  display: grid;
  grid-template-columns: 240px 1fr 260px;
  gap: 20px;
  align-items: start;
}
@media (max-width: 900px) { .sim-body { grid-template-columns: 1fr; } }

.sim-left  { display: flex; flex-direction: column; gap: 16px; }
.sim-center{ display: flex; flex-direction: column; gap: 16px; }
.sim-right { display: flex; flex-direction: column; gap: 16px; }

.image-card    { text-align: center; }
.animal-display{ font-size: 72px; margin-bottom: 6px; }
.animal-label  { font-family: 'Fredoka One', cursive; font-size: 15px; color: #374151; }
.round-title   { font-size: 12px; color: #9ca3af; margin-top: 4px; }

.section-label {
  font-family: 'Fredoka One', cursive; font-size: 16px;
  margin-bottom: 12px; color: var(--dark);
  display: flex; align-items: center; gap: 8px;
}
.toggle-hint {
  font-family: 'Nunito', sans-serif;
  font-size: 11px; font-weight: 600;
  color: #9ca3af; font-style: italic;
}

.input-rows { display: flex; flex-direction: column; gap: 8px; }
.input-row  {
  display: flex; align-items: center; gap: 8px;
  padding: 8px 12px; border-radius: 12px;
  border: 2px solid transparent; background: #f9fafb;
}
.input-clickable { cursor: pointer; }
.input-clickable:hover { background: #f3f4f6; border-color: #e5e7eb; }
.input-emoji { font-size: 18px; }
.input-name  { flex: 1; font-size: 13px; font-weight: 600; }
.input-badge {
  width: 28px; height: 28px; border-radius: 50%;
  font-family: 'Fredoka One', cursive; font-size: 15px;
  display: flex; align-items: center; justify-content: center;
}

.learning-card { background: #fffbeb; border: 2px solid #fbbf24; }
.learning-list { list-style: none; display: flex; flex-direction: column; gap: 6px; }
.learning-list li {
  font-size: 12px; padding-left: 14px; position: relative;
  color: #374151; line-height: 1.4;
}
.learning-list li::before { content: '•'; position: absolute; left: 0; color: #f59e0b; }

.graph-card { padding: 16px; }
.controls   { display: flex; flex-wrap: wrap; gap: 10px; justify-content: center; }

.hidden-rows { display: flex; flex-direction: column; gap: 8px; }
.hidden-row  {
  display: flex; align-items: center; gap: 10px;
  padding: 8px 14px; border-radius: 12px;
  border: 2px solid #e5e7eb; background: #f9fafb;
}
.hidden-active   { background: #f0fdf4; border-color: #6BCB77; }
.hidden-inactive { opacity: 0.5; }
.hidden-label  { font-family: 'Fredoka One', cursive; font-size: 16px; width: 28px; }
.hidden-sum    { flex: 1; font-size: 13px; font-weight: 700; }
.hidden-status { font-size: 11px; font-weight: 700; }
.threshold-note{ margin-top: 10px; font-size: 11px; color: #6b7280; text-align: center; }

.result-card    { text-align: center; border: 3px solid #e5e7eb; }
.result-correct { border-color: #6BCB77; background: #f0fdf4; }
.result-wrong   { border-color: #FF6B6B; background: #fff5f5; }
.result-emoji   { font-size: 48px; margin-bottom: 12px; }
.result-scores  { display: flex; flex-direction: column; gap: 6px; margin-bottom: 14px; }
.score-item     { padding: 8px 16px; border-radius: 10px; background: #f3f4f6; font-size: 14px; }
.winner         { background: var(--yellow); font-weight: 800; }
.result-verdict { font-family: 'Fredoka One', cursive; font-size: 18px; margin-bottom: 4px; }
.result-label   { font-family: 'Fredoka One', cursive; font-size: 22px; margin-bottom: 8px; }
.result-expl    { font-size: 13px; color: #4b5563; line-height: 1.5; }

.expl-note { margin-top: 12px; padding: 12px 14px; border-radius: 12px; font-size: 13px; line-height: 1.5; }
.expl-error{ background: #fff5f5; border: 1.5px solid #fca5a5; }
.expl-tip  { background: #fffbeb; border: 1.5px solid #fcd34d; }
.expl-gen  { background: #f0fdf4; border: 1.5px solid #86efac; }
.explain-card p{ font-size: 14px; color: #4b5563; line-height: 1.6; }

.progress-bar-wrap { width: 100%; height: 10px; background: #e5e7eb; border-radius: 50px; overflow: hidden; }
.progress-bar { height: 100%; background: linear-gradient(90deg, var(--coral), var(--teal)); border-radius: 50px; }
.progress-label { text-align: center; font-size: 13px; color: #9ca3af; margin-top: 4px; }
</style>
