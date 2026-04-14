<template>
  <div class="simulator-container">

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
            <button class="btn btn-primary" @click="applyCorrectInputs">✅ Appliquer les bons indices</button>
            <button class="btn btn-ghost" @click="closeError">🔄 Je veux réessayer</button>
          </div>
        </div>
      </div>
    </Teleport>

    <Teleport to="body">
      <Transition name="fade">
        <div v-if="showResultPopup && store.result" class="popup-overlay" @click.self="closeResultPopup">
          <div class="popup-card" :class="isCorrect ? 'result-correct-card' : 'result-wrong-card'">
            <div class="result-emoji">{{ isCorrect ? '🎉' : '😬' }}</div>
            <h2 class="popup-title">{{ isCorrect ? '✅ Correct !' : '❌ Raté !' }}</h2>

            <div class="result-verdict">
              Le réseau a prédit : <strong>{{ store.result.prediction }}</strong>
            </div>

            <div class="result-scores">
              <div v-for="id in OUTPUT_IDS" :key="id" class="score-item" :class="{ winner: store.result.prediction === id }">
                {{ NODES[id].emoji }} {{ id }} : <strong>{{ store.result.nodeStates[id]?.score }} pts</strong>
              </div>
            </div>

            <div class="round-explanation">
              <p class="result-expl">{{ resultExplication }}</p>

              <div class="expl-notes-container">
                <div v-if="round.id === 1" class="expl-note expl-error">
                  💡 Les oreilles pointues avaient un poids trop élevé (3) pour H3, ce qui a trop boosté le score CHIEN.
                </div>
                <div v-if="round.id === 2" class="expl-note expl-tip">
                  🔑 L'image n'a pas changé. C'est le <strong>réseau</strong> qui a changé (ses poids).
                </div>
                <div v-if="round.id >= 3" class="expl-note expl-gen">
                  🌍 <strong>Généralisation</strong> : le réseau n'a jamais vu cette image, mais ses poids appris lui permettent de la classer !
                </div>

                <div v-if="round.learningNote" class="learning-list-wrap">
                  <strong>⚙️ Poids ajustés :</strong>
                  <ul class="learning-list">
                    <li v-for="note in round.learningNote" :key="note">{{ note }}</li>
                  </ul>
                </div>
              </div>
            </div>

            <!-- Pont narratif — affiché uniquement à la dernière manche -->
            <div v-if="store.currentRoundIndex === ROUNDS.length - 1" class="bio-bridge">
              <p class="bridge-text">
                🖼️ Maintenant que tu comprends comment un réseau prend une décision,
                découvre comment une IA analyse une vraie image pixel par pixel !
              </p>
            </div>

            <div class="popup-actions-row">
              <button class="btn btn-ghost" @click="closeResultPopup">👀 Observer le graphe</button>
              <template v-if="store.currentRoundIndex < ROUNDS.length - 1">
                <button class="btn btn-primary" @click="handleNext">
                  Manche suivante ➔
                </button>
              </template>
              <template v-else>
                <button class="btn btn-teal" @click="continueToNext">
                  🖼️ Comment l'IA voit une image →
                </button>
              </template>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- ── Écran d'introduction ── -->
    <div v-if="showIntro" class="sim-intro card">

      <div class="si-header">
        <h1 class="si-title">🐱🐶 Le simulateur Chat / Chien</h1>
        <p class="si-sub">
          Tu vas faire fonctionner un vrai réseau de neurones — étape par étape !
        </p>
      </div>

      <!-- Explication des couches -->
      <div class="si-layers">
        <div class="si-layer" style="border-color:#FF6B6B">
          <div class="si-layer-icon">📥</div>
          <h3 class="si-layer-title" style="color:#FF6B6B">Couche d'entrée</h3>
          <p>Elle reçoit les informations sur l'image : moustaches, oreilles pointues, yeux ronds.
            Chaque caractéristique vaut <strong>0</strong> (absent) ou <strong>1</strong> (présent).</p>
        </div>
        <div class="si-arrow">→</div>
        <div class="si-layer" style="border-color:#4ECDC4">
          <div class="si-layer-icon">🧠</div>
          <h3 class="si-layer-title" style="color:#4ECDC4">Couche cachée</h3>
          <p>Cinq neurones intermédiaires combinent les entrées grâce à des <strong>poids</strong>.
            Chaque neurone additionne ses entrées × poids, et s'active si la somme
            dépasse le <strong>seuil</strong> (ici : 2).</p>
        </div>
        <div class="si-arrow">→</div>
        <div class="si-layer" style="border-color:#FFE66D">
          <div class="si-layer-icon">🏆</div>
          <h3 class="si-layer-title" style="color:#f59e0b">Couche de sortie</h3>
          <p>Deux neurones de sortie — CHAT et CHIEN — reçoivent les points des neurones actifs.
            Celui qui a le <strong>score le plus élevé</strong> est la prédiction du réseau.</p>
        </div>
      </div>

      <!-- Note sur les poids aléatoires -->
      <div class="si-note">
        <span class="si-note-icon">⚠️</span>
        <p>
          Au départ (manche 1), les poids ont été fixés <strong>au hasard</strong> :
          le réseau va se tromper. C'est normal — c'est comme ça qu'on voit
          pourquoi l'apprentissage est indispensable !
        </p>
      </div>

      <button class="btn btn-primary si-start" @click="startSimulator">
        ▶ Lancer le simulateur !
      </button>

    </div>

    <!-- ── Simulateur (contenu existant inchangé) ── -->
    <div v-else>
      <!-- [ tout le contenu actuel de SimulatorView ici, sans modification ] -->
    </div>

    <div class="sim-header">
      <div class="header-titles">
        <h1 class="sim-title">🐱🐶 Simulateur Chat / Chien</h1>
      </div>
      <div class="round-selector">

        <!-- Groupe 1 : Avant l'apprentissage (Manche 1) -->
        <div class="round-group">
          <span class="round-group-label avant">⚠️ Avant l'apprentissage</span>
          <button
              class="round-pill avant-pill"
              :class="{ active: store.currentRoundIndex === 0 }"
              :style="store.currentRoundIndex === 0 ? `background: ${ROUNDS[0].color}` : ''"
              @click="store.goToRound(0)"
          >
            Manche 1
          </button>
        </div>

        <!-- Séparateur -->
        <div class="round-separator">→</div>

        <!-- Groupe 2 : Après l'apprentissage (Manches 2, 3, 4) -->
        <div class="round-group">
          <span class="round-group-label apres">✅ Après l'apprentissage</span>
          <div class="round-group-pills">
            <button
                v-for="(r, i) in ROUNDS.slice(1)"
                :key="r.id"
                class="round-pill apres-pill"
                :class="{ active: store.currentRoundIndex === i + 1 }"
                :style="store.currentRoundIndex === i + 1 ? `background: ${r.color}` : ''"
                @click="store.goToRound(i + 1)"
            >
              Manche {{ r.id }}
            </button>
          </div>
        </div>

      </div>
    </div>

    <div class="sim-body-compact">

      <aside class="column side-col">
        <div class="image-card card" :style="`border-top: 5px solid ${round.color}`">
          <div class="animal-display">{{ round.cardEmoji }}</div>
          <div class="animal-label">{{ round.cardLabel }}</div>
          <div class="round-title">{{ round.title }}</div>
        </div>

        <div class="inputs-card card flex-fill">
          <h3 class="section-label">📥 Entrées
            <span v-if="!store.result" class="toggle-hint">← clique !</span>
          </h3>
          <div class="input-rows">
            <div
                v-for="id in INPUT_IDS" :key="id"
                class="input-row"
                :class="{ 'input-active': userInputs[id] === 1, 'input-clickable': !store.result }"
                :style="userInputs[id] === 1 ? `border-color: ${NODES[id].color}; background: ${NODES[id].color}18` : ''"
                @click="!store.result && toggleInput(id)"
            >
              <span class="input-emoji">{{ NODES[id].emoji }}</span>
              <span class="input-name">{{ NODES[id].label }}</span>
              <span class="input-badge" :style="userInputs[id] === 1 ? `background: ${NODES[id].color}` : 'background:#e5e7eb; color:#374151'">
                {{ userInputs[id] }}
              </span>
            </div>
          </div>
        </div>
      </aside>

      <div class="column graph-col">
        <div class="graph-card card">
          <div class="graph-wrapper-inner">
            <NeuronGraph
                :layer-order="LAYER_ORDER"
                :nodes="NODES"
                :connections="CONNECTIONS"
                :weights="store.currentWeights"
                :node-states="graphNodeStates"
                :threshold="2"
                :can-toggle="!store.result"
                :svg-width="600"
                :svg-height="550"
                @toggle-input="toggleInput"
            />
          </div>

          <div class="controls">
            <button class="btn btn-ghost" :disabled="store.currentRoundIndex === 0" @click="store.goToRound(store.currentRoundIndex - 1)">← Prec</button>
            <button class="btn btn-primary" :disabled="!!store.result" @click="handleCompute">
              {{ store.result ? '✅ Calculé' : '▶ Calculer !' }}
            </button>
            <button class="btn btn-ghost" :disabled="!store.result" @click="handleReset">🔄 Reset</button>
            <button class="btn btn-teal" :disabled="store.currentRoundIndex === ROUNDS.length - 1" @click="store.goToRound(store.currentRoundIndex + 1)">Suiv →</button>
          </div>
        </div>
      </div>

      <aside class="column side-col">
        <div class="hidden-card card flex-fill">
          <h3 class="section-label">🧠 Neurones cachés</h3>
          <div class="hidden-rows">
            <div
                v-for="id in HIDDEN_IDS" :key="id"
                class="hidden-row"
                :class="{
                'hidden-active': store.result && store.result.nodeStates[id]?.active,
                'hidden-inactive': store.result && !store.result.nodeStates[id]?.active,
              }"
            >
              <span class="hidden-label">{{ id }}</span>
              <span class="hidden-sum" v-if="store.result">Σ = {{ store.result.nodeStates[id]?.sum }}</span>
              <span class="hidden-status" v-if="store.result">{{ store.result.nodeStates[id]?.active ? '⚡ ACTIF' : '💤 inactif' }}</span>
            </div>
          </div>
          <p class="threshold-note">Seuil d'activation : Σ ≥ 2</p>
        </div>
      </aside>

    </div>
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

const showIntro = ref(true)
function startSimulator() { showIntro.value = false }
import { useProgressStore } from '../stores/progress.js'
const progress = useProgressStore()
import { useRouter } from 'vue-router'
const router = useRouter()

const store = useSimulatorStore()
const round = computed(() => store.currentRound)

function continueToNext() {
  progress.completeStep('simulator')
  router.push(progress.nextRoute('simulator'))
}

// ─── Entrées utilisateur ──────────────────────────────────────────────────────
const userInputs = reactive(Object.fromEntries(INPUT_IDS.map(id => [id, 0])))

function resetUserInputs() {
  INPUT_IDS.forEach(id => { userInputs[id] = 0 })
}

function toggleInput(id) {
  userInputs[id] = userInputs[id] === 1 ? 0 : 1
}

watch(() => store.currentRoundIndex, () => {
  resetUserInputs()
  store.reset()
  showResultPopup.value = false
})

// ─── État du graphe ──────────────────────────────────────────────────────────
const graphNodeStates = computed(() =>
    store.result ? store.result.nodeStates : buildInputOnlyStates()
)

function buildInputOnlyStates() {
  return Object.fromEntries(
      INPUT_IDS.map(id => [id, { value: userInputs[id], active: userInputs[id] === 1 }])
  )
}

// ─── Validation et calcul ─────────────────────────────────────────────────────
const errorPopup = reactive({ show: false, message: '' })
const showResultPopup = ref(false)

function handleCompute() {
  const expected = round.value.inputs
  const isValid  = INPUT_IDS.every(id => userInputs[id] === expected[id])

  if (!isValid) {
    const wrongOnes = INPUT_IDS
        .filter(id => userInputs[id] !== expected[id])
        .map(id => `${NODES[id].emoji} ${NODES[id].label} devrait être ${expected[id]}`)
        .join(', ')
    errorPopup.message = `Cette combinaison ne correspond pas à l'image. ${wrongOnes}.`
    errorPopup.show = true
    return
  }

  store.computeWith(userInputs)
  showResultPopup.value = true // Affiche la pop-up de réussite/échec
}

function closeError() { errorPopup.show = false }
function applyCorrectInputs() {
  INPUT_IDS.forEach(id => { userInputs[id] = round.value.inputs[id] })
  errorPopup.show = false
}

function handleReset() {
  store.reset()
  resetUserInputs()
  showResultPopup.value = false
}

function closeResultPopup() {
  showResultPopup.value = false
}

function handleNext() {
  showResultPopup.value = false
  if (store.currentRoundIndex < ROUNDS.length - 1) {
    store.goToRound(store.currentRoundIndex + 1)
  } else {
    store.goToRound(0)
  }
}

// ─── Résultat ─────────────────────────────────────────────────────────────────
const isCorrect = computed(() => store.result?.prediction === round.value.expectedAnswer)

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
/* ══ STRUCTURE GLOBALE SANS SCROLL ══ */
.simulator-container {
  display: flex; flex-direction: column;
  height: calc(100vh - 120px); /* Ajuster selon le header global du site */
  gap: 15px;
}

.sim-header {
  display: flex; justify-content: space-between; align-items: center;
  padding: 0 10px; flex-shrink: 0;
}
.sim-title { font-family: 'Fredoka One', cursive; font-size: 28px; margin: 0; }

.round-selector {
  display: flex;
  align-items: flex-start;  /* aligne les groupes en haut */
  gap: 10px;
  flex-wrap: wrap;
}

.round-group {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
}

.round-group-label {
  font-family: 'Nunito', sans-serif;
  font-size: 10px;
  font-weight: 800;
  padding: 2px 10px;
  border-radius: 50px;
  white-space: nowrap;
}
.round-group-label.avant {
  background: #fff5f5;
  color: #dc2626;
  border: 1.5px solid #fca5a5;
}
.round-group-label.apres {
  background: #f0fdf4;
  color: #16a34a;
  border: 1.5px solid #86efac;
}

.round-group-pills {
  display: flex;
  gap: 6px;
}

.round-pill {
  font-family: 'Fredoka One', cursive;
  font-size: 13px;
  padding: 6px 14px;
  border-radius: 50px;
  border: 2px solid #e5e7eb;
  background: #fff;
  color: #374151;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
}
.round-pill:hover { border-color: #9ca3af; }
.round-pill.active { color: #fff; border-color: transparent; }

.avant-pill { border-color: #fca5a5; }
.avant-pill:not(.active) { color: #dc2626; background: #fff5f5; }

.apres-pill { border-color: #86efac; }
.apres-pill:not(.active) { color: #16a34a; background: #f0fdf4; }

.round-separator {
  font-size: 20px;
  color: #d1d5db;
  flex-shrink: 0;
  margin-top: 14px;         /* aligné avec le milieu des boutons */
}
.sim-body-compact {
  display: grid;
  grid-template-columns: 240px 1fr 240px;
  gap: 15px;
  flex: 1;
  min-height: 0; /* Permet aux enfants de s'ajuster sans forcer le scroll */
}

@media (max-width: 900px) {
  .sim-body-compact { grid-template-columns: 1fr; height: auto; overflow-y: auto; }
}

.column { display: flex; flex-direction: column; gap: 10px; }
.card { padding: 16px; background: #fff; border-radius: 16px; box-shadow: 0 4px 12px rgba(0,0,0,0.05); margin: 0; }
.flex-fill { flex: 1; display: flex; flex-direction: column; overflow-y: auto; }

/* ── Colonnes latérales ── */
.image-card { text-align: center; padding: 10px; flex-shrink: 0; }
.animal-display { font-size: 56px; line-height: 1; margin-bottom: 5px; }
.animal-label { font-family: 'Fredoka One', cursive; font-size: 14px; color: #374151; }
.round-title { font-size: 11px; color: #9ca3af; }

.section-label { font-family: 'Fredoka One', cursive; font-size: 15px; margin-bottom: 10px; display: flex; align-items: center; gap: 8px; }
.toggle-hint { font-family: 'Nunito', sans-serif; font-size: 10px; color: #9ca3af; font-style: italic; font-weight: bold; }

.input-rows, .hidden-rows { display: flex; flex-direction: column; gap: 6px; }
.input-row, .hidden-row {
  display: flex; align-items: center; gap: 8px;
  padding: 8px 10px; border-radius: 10px;
  border: 2px solid transparent; background: #f9fafb;
}
.input-clickable { cursor: pointer; transition: background 0.2s; }
.input-clickable:hover { background: #f3f4f6; border-color: #e5e7eb; }
.input-emoji { font-size: 16px; }
.input-name { flex: 1; font-size: 12px; font-weight: 700; }
.input-badge { width: 24px; height: 24px; border-radius: 50%; font-family: 'Fredoka One', cursive; font-size: 13px; display: flex; align-items: center; justify-content: center; }

.hidden-active { background: #f0fdf4; border-color: #6BCB77; }
.hidden-inactive { opacity: 0.5; }
.hidden-label { font-family: 'Fredoka One', cursive; font-size: 14px; width: 24px; }
.hidden-sum { flex: 1; font-size: 12px; font-weight: 800; }
.hidden-status { font-size: 10px; font-weight: 800; }
.threshold-note { margin-top: auto; padding-top: 10px; font-size: 11px; color: #9ca3af; text-align: center; }

/* ── Centre (Graphe) ── */
.graph-col { min-width: 0; }
.graph-card { flex: 1; display: flex; flex-direction: column; overflow: hidden; padding: 10px; }
.graph-wrapper-inner {
  flex: 1;
  min-height: 0;
  height: 100%;
}
.controls { display: flex; gap: 8px; justify-content: center; padding-top: 10px; flex-shrink: 0; }
.btn { padding: 8px 20px; font-size: 14px; }

/* ══ POPUP ════════════════════════════════════════════════════════════════════ */
.popup-overlay {
  position: fixed; inset: 0;
  background: rgba(0,0,0,0.5); backdrop-filter: blur(3px);
  display: flex; align-items: center; justify-content: center;
  z-index: 2000; padding: 20px;
}
.popup-card {
  background: #fff; border-radius: 24px; padding: 32px;
  max-width: 480px; width: 100%; text-align: center;
  box-shadow: 0 24px 64px rgba(0,0,0,0.25);
}
.result-correct-card { border: 4px solid #6BCB77; }
.result-wrong-card { border: 4px solid #FF6B6B; }

.result-emoji { font-size: 64px; margin-bottom: 5px; line-height: 1; }
.popup-title { font-family: 'Fredoka One', cursive; font-size: 26px; margin-bottom: 15px; }
.result-verdict { font-size: 16px; margin-bottom: 20px; color: #374151; }
.result-scores { display: flex; justify-content: center; gap: 10px; margin-bottom: 20px; }
.score-item { padding: 8px 16px; background: #f3f4f6; border-radius: 12px; font-size: 14px; }
.score-item.winner { background: var(--yellow); font-weight: 800; }

.round-explanation { background: #f9fafb; border-radius: 16px; padding: 16px; margin-bottom: 24px; text-align: left; }
.result-expl { font-weight: 700; color: #1f2937; margin-bottom: 10px; font-size: 14px;}
.expl-notes-container { display: flex; flex-direction: column; gap: 10px; }
.expl-note { padding: 10px; border-radius: 8px; font-size: 13px; line-height: 1.5; }
.expl-error { background: #fff5f5; border-left: 4px solid #fca5a5; }
.expl-tip { background: #fffbeb; border-left: 4px solid #fcd34d; }
.expl-gen { background: #f0fdf4; border-left: 4px solid #86efac; }

.learning-list-wrap { background: #fff; padding: 10px; border-radius: 8px; border: 1px solid #e5e7eb; font-size: 13px; }
.learning-list { padding-left: 20px; margin-top: 5px; color: #4b5563; }

.popup-actions-row { display: flex; justify-content: center; gap: 15px; }

/* Transitions */
.fade-enter-active, .fade-leave-active { transition: opacity 0.2s, transform 0.2s; }
.fade-enter-from, .fade-leave-to { opacity: 0; transform: scale(0.95); }

.bio-bridge {
  background: #f0fdf4;
  border: 1.5px solid #86efac;
  border-radius: 14px;
  padding: 14px 18px;
  margin-bottom: 16px;
  text-align: center;
}
.bridge-text {
  font-size: 15px;
  color: #166534;
  line-height: 1.6;
}

.sim-intro {
  display: flex;
  flex-direction: column;
  gap: 28px;
  max-width: 860px;
  margin: 0 auto;
}

.si-header { text-align: center; }
.si-title  { font-family: 'Fredoka One', cursive; font-size: clamp(24px, 4vw, 38px); margin-bottom: 8px; }
.si-sub    { font-size: 16px; color: #4b5563; }

/* Couches */
.si-layers {
  display: flex;
  align-items: stretch;
  gap: 8px;
  flex-wrap: wrap;
}
.si-layer {
  flex: 1;
  min-width: 180px;
  border: 2px solid #e5e7eb;
  border-radius: 16px;
  padding: 20px 16px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.si-layer-icon  { font-size: 36px; text-align: center; }
.si-layer-title { font-family: 'Fredoka One', cursive; font-size: 17px; margin: 0; text-align: center; }
.si-layer p     { font-size: 13px; color: #4b5563; line-height: 1.7; margin: 0; }
.si-arrow       { font-size: 28px; color: #d1d5db; display: flex; align-items: center; flex-shrink: 0; }

/* Note poids aléatoires */
.si-note {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  background: #fffbeb;
  border: 1.5px solid #fcd34d;
  border-radius: 14px;
  padding: 16px;
}
.si-note-icon { font-size: 24px; flex-shrink: 0; }
.si-note p    { font-size: 14px; color: #374151; line-height: 1.7; margin: 0; }

/* Bouton start */
.si-start {
  font-size: 20px;
  padding: 16px 48px;
  align-self: center;
  box-shadow: 0 8px 24px rgba(255,107,107,0.3);
}
</style>