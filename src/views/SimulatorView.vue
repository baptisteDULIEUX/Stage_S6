<template>
  <div class="simulator">

    <!-- ── En-tête ── -->
    <div class="sim-header">
      <h1 class="sim-title">Simulateur Chat / Chien</h1>
      <p class="sim-desc">Observe comment un réseau de neurones apprend à faire la différence entre un chien et un chat !</p>
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

        <!-- Carte image -->
        <!--        border-top: 6px solid ${round.color} à rajouter dans la div       -->
        <div class="image-card card" :style="``">
          <div class="animal-display">{{ round.cardEmoji }}</div>
          <div class="animal-label">{{ round.cardLabel }}</div>
          <div class="round-title">{{ round.title }}</div>
        </div>

        <!-- Tableau des entrées -->
        <div class="inputs-card card">
          <h3 class="section-label">Entrées détectées</h3>
          <div class="input-rows">
            <div
                v-for="(inp, i) in inputDefs"
                :key="inp.id"
                class="input-row"
                :class="{ 'input-active': round.inputs[i] === 1 }"
                :style="round.inputs[i] === 1
                ? `border-color: ${inputColors[i]}; background: ${inputColors[i]}18`
                : ''"
            >
              <span class="input-emoji">{{ inp.emoji }}</span>
              <span class="input-name">{{ inp.label }}</span>
              <span
                  class="input-badge"
                  :style="round.inputs[i] === 1 ? `background: ${inputColors[i]}` : 'background:#e5e7eb'"
              >
                {{ round.inputs[i] }}
              </span>
            </div>
          </div>
        </div>

        <!-- Panneau apprentissage (manche 2 uniquement) -->
        <Transition name="slide">
          <div v-if="round.learningNote && store.result" class="learning-card card">
            <h3 class="section-label">Poids ajustés !</h3>
            <ul class="learning-list">
              <li v-for="note in round.learningNote" :key="note">{{ note }}</li>
            </ul>
          </div>
        </Transition>
      </aside>

      <!-- Colonne centrale : graphe + contrôles -->
      <div class="sim-center">

        <!-- Graphe -->
        <div class="graph-card card">
          <NeuronGraph
              :inputs="round.inputs"
              :weights="round.weights"
              :hidden-state="store.networkResult.hiddenState"
              :result="store.result"
          />
        </div>

        <!-- Contrôles -->
        <div class="controls">
          <button
              class="btn btn-ghost"
              :disabled="store.currentRoundIndex === 0"
              @click="store.prevRound()"
          >Précédente</button>

          <button
              class="btn btn-primary"
              :disabled="!!store.result"
              @click="store.runAnimation()"
          >
            <span v-if="!store.result">Calculer !</span>
            <span v-else>Calculé</span>
          </button>

          <button
              class="btn btn-ghost"
              :disabled="!store.result"
              @click="store.reset()"
          >Reset</button>

          <button
              class="btn btn-teal"
              :disabled="store.currentRoundIndex === ROUNDS.length - 1"
              @click="store.nextRound()"
          >Suivante</button>
        </div>
      </div>

      <!-- Colonne droite : résultats + explication -->
      <aside class="sim-right">

        <!-- Neurones cachés -->
        <div class="hidden-card card">
          <h3 class="section-label">Neurones cachés</h3>
          <div class="hidden-rows">
            <div
                v-for="(h, i) in store.networkResult.hiddenState"
                :key="h.label"
                class="hidden-row"
                :class="{
                'hidden-active':   store.result && h.active,
                'hidden-inactive': store.result && !h.active,
              }"
            >
              <span class="hidden-label">{{ h.label }}</span>
              <span class="hidden-sum" v-if="store.result">
                Σ = {{ h.sum }}
              </span>
              <span class="hidden-status" v-if="store.result">
                {{ h.active ? 'ACTIF' : 'inactif' }}
              </span>
            </div>
          </div>
          <p class="threshold-note">Seuil d'activation : Σ ≥ 2</p>
        </div>

        <!-- Résultat -->
        <Transition name="pop">
          <div v-if="store.result" class="result-card card"
               :class="isCorrect ? 'result-correct' : 'result-wrong'"
          >
            <div class="result-emoji">{{ resultEmoji }}</div>
            <div class="result-scores">
              <div class="score-item" :class="{ winner: store.result.prediction === 'CHAT' }">
                CHAT : <strong>{{ store.result.outputScores[0] }} pts</strong>
              </div>
              <div class="score-item" :class="{ winner: store.result.prediction === 'CHIEN' }">
                CHIEN : <strong>{{ store.result.outputScores[1] }} pts</strong>
              </div>
            </div>
            <div class="result-verdict">
              Prédiction : <strong>{{ store.result.prediction }}</strong>
            </div>
            <div class="result-label">{{ isCorrect ? 'Correct !' : 'Raté !' }}</div>
            <p class="result-expl">{{ resultExplication }}</p>
          </div>
        </Transition>

        <!-- Explication manche -->
        <div class="explain-card card">
          <h3 class="section-label">Comprendre cette manche</h3>
          <p>{{ round.subtitle }}</p>
          <div v-if="round.id === 1 && store.result" class="expl-note expl-error">
            💡 Pourquoi l'erreur ? Les oreilles pointues avaient un poids trop élevé pour H3,
            ce qui a trop boosté le score CHIEN même sans moustaches.
          </div>
          <div v-if="round.id === 2 && !store.result" class="expl-note expl-tip">
            🔑 L'image n'a pas changé. C'est le <strong>réseau</strong> qui a changé (ses poids).
          </div>
          <div v-if="round.id >= 3 && store.result" class="expl-note expl-gen">
             <strong>Généralisation</strong> : le réseau n'a jamais vu cette image,
            mais ses poids appris lui permettent de la classer correctement !
          </div>
        </div>

      </aside>
    </div>

    <!-- ── Barre de progression ── -->
<!--    <div class="progress-bar-wrap">-->
<!--      <div class="progress-bar" :style="`width: ${progressPct}%`" />-->
<!--    </div>-->
<!--    <p class="progress-label">Manche {{ store.currentRoundIndex + 1 }} / {{ ROUNDS.length }}</p>-->

  </div>
</template>

<script setup>
import { computed } from 'vue'
import NeuronGraph from '../components/NeuronGraph.vue'
import { useSimulatorStore, ROUNDS } from '../stores/simulator.js'

const store = useSimulatorStore()
const round = computed(() => store.currentRound)

const inputDefs = [
  { id: 'E1', label: 'Moustaches',       emoji: '' },
  { id: 'E2', label: 'Oreilles pointues', emoji: '' },
  { id: 'E3', label: 'Yeux ronds',        emoji: '' },
]
const inputColors = ['#FF6B6B', '#4ECDC4', '#A78BFA']

const isCorrect = computed(() =>
    store.result?.prediction === round.value.expectedAnswer
)
const resultEmoji = computed(() => {
  if (!store.result) return ''
  return isCorrect.value ? 'O' : 'X'
})
const resultExplication = computed(() => {
  if (!store.result) return ''
  const r = round.value
  if (r.id === 1) return 'Le réseau s\'est trompé car les poids n\'étaient pas bien réglés.'
  if (r.id === 2) return 'Après ajustement des poids, le réseau reconnaît maintenant ce chat !'
  if (r.id === 3) return 'Même avec moustaches en plus, le chat est bien reconnu. Le réseau généralise !'
  if (r.id === 4) return 'Sans moustaches ni oreilles, seuls les yeux ronds activent H3 → CHIEN !'
  return ''
})

const progressPct = computed(() =>
    ((store.currentRoundIndex + 1) / ROUNDS.length) * 100
)
</script>

<style scoped>
.simulator { display: flex; flex-direction: column; gap: 24px; }

/* ── En-tête ── */
.sim-header { text-align: center; }
.sim-title {
  font-family: 'Fredoka One', cursive;
  font-size: clamp(26px, 4vw, 42px);
  margin-bottom: 6px;
}
.sim-desc { color: #4b5563; font-size: 16px; }

/* ── Sélecteur manches ── */
.round-selector {
  display: flex;
  gap: 10px;
  justify-content: center;
  flex-wrap: wrap;
}
.round-pill {
  font-family: 'Fredoka One', cursive;
  font-size: 15px;
  padding: 8px 22px;
  border-radius: 50px;
  border: 2.5px solid #e5e7eb;
  background: #fff;
  color: #374151;
  //cursor: pointer;
  transition: all 0.2s;
}
/*.round-pill:hover { border-color: #9ca3af; }*/
.round-pill.active { color: #fff; /*border-color: transparent*/; }

/* ── Corps ── */
.sim-body {
  display: grid;
  grid-template-columns: 240px 1fr 260px;
  gap: 20px;
  align-items: start;
}
@media (max-width: 900px) {
  .sim-body { grid-template-columns: 1fr; }
}

/* ── Colonne gauche ── */
.sim-left { display: flex; flex-direction: column; gap: 16px; }
.image-card { text-align: center; }
.animal-display {
  font-size: 72px;
  margin-bottom: 6px;
}
.animal-label { font-family: 'Fredoka One', cursive; font-size: 15px; color: #374151; }
.round-title  { font-size: 12px; color: #9ca3af; margin-top: 4px; }

.section-label {
  font-family: 'Fredoka One', cursive;
  font-size: 16px;
  margin-bottom: 12px;
  color: var(--dark);
}

.inputs-card { padding: 20px; }
.input-rows { display: flex; flex-direction: column; gap: 8px; }
.input-row {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  border-radius: 12px;
  border: 2px solid transparent;
  background: #f9fafb;
  transition: all 0.4s ease;
}
.input-emoji  { font-size: 18px; }
.input-name   { flex: 1; font-size: 13px; font-weight: 600; }
.input-badge  {
  width: 28px; height: 28px;
  border-radius: 50%;
  color: #fff;
  font-family: 'Fredoka One', cursive;
  font-size: 15px;
  display: flex; align-items: center; justify-content: center;
  transition: background 0.4s;
}

.learning-card { background: #fffbeb; border: 2px solid #fbbf24; }
.learning-list  { list-style: none; display: flex; flex-direction: column; gap: 6px; }
.learning-list li {
  font-size: 12px;
  padding-left: 14px;
  position: relative;
  color: #374151;
  line-height: 1.4;
}
.learning-list li::before { content: '•'; position: absolute; left: 0; color: #f59e0b; }

/* ── Colonne centrale ── */
.sim-center { display: flex; flex-direction: column; gap: 16px; }
.graph-card { padding: 16px; }
.controls   {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  justify-content: center;
}

/* ── Colonne droite ── */
.sim-right { display: flex; flex-direction: column; gap: 16px; }

.hidden-rows { display: flex; flex-direction: column; gap: 8px; }
.hidden-row {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 14px;
  border-radius: 12px;
  border: 2px solid #e5e7eb;
  background: #f9fafb;
  transition: all 0.4s ease;
}
.hidden-active   { background: #f0fdf4; border-color: #6BCB77; }
.hidden-inactive { opacity: 0.5; }
.hidden-label    { font-family: 'Fredoka One', cursive; font-size: 16px; width: 28px; }
.hidden-sum      { flex: 1; font-size: 13px; font-weight: 700; color: #374151; }
.hidden-status   { font-size: 11px; font-weight: 700; }
.threshold-note  { margin-top: 10px; font-size: 11px; color: #6b7280; text-align: center; }

/* ── Résultat ── */
.result-card {
  text-align: center;
  border: 3px solid #e5e7eb;
}
.result-correct { border-color: #6BCB77; background: #f0fdf4; }
.result-wrong   { border-color: #FF6B6B; background: #fff5f5; }
.result-emoji   { font-size: 48px; margin-bottom: 12px; }
.result-scores  { display: flex; flex-direction: column; gap: 6px; margin-bottom: 14px; }
.score-item     {
  padding: 8px 16px;
  border-radius: 10px;
  background: #f3f4f6;
  font-size: 14px;
}
.winner { background: var(--yellow); font-weight: 800; }
.result-verdict {
  font-family: 'Fredoka One', cursive;
  font-size: 18px;
  margin-bottom: 4px;
}
.result-label {
  font-family: 'Fredoka One', cursive;
  font-size: 22px;
  margin-bottom: 8px;
}
.result-expl { font-size: 13px; color: #4b5563; line-height: 1.5; }

/* ── Explication ── */
.expl-note {
  margin-top: 12px;
  padding: 12px 14px;
  border-radius: 12px;
  font-size: 13px;
  line-height: 1.5;
}
.expl-error { background: #fff5f5; border: 1.5px solid #fca5a5; }
.expl-tip   { background: #fffbeb; border: 1.5px solid #fcd34d; }
.expl-gen   { background: #f0fdf4; border: 1.5px solid #86efac; }
.explain-card p { font-size: 14px; color: #4b5563; line-height: 1.6; }

/* ── Barre de progression ── */
.progress-bar-wrap {
  width: 100%;
  height: 10px;
  background: #e5e7eb;
  border-radius: 50px;
  overflow: hidden;
}
.progress-bar {
  height: 100%;
  background: linear-gradient(90deg, var(--coral), var(--teal));
  border-radius: 50px;
  transition: width 0.5s ease;
}
.progress-label {
  text-align: center;
  font-size: 13px;
  color: #9ca3af;
  margin-top: 4px;
}

/* ── Transitions ── */
.slide-enter-active, .slide-leave-active { transition: none; }
.slide-enter-from, .slide-leave-to { opacity: 0; }
.pop-enter-active { animation: none; }
</style>
