<template>
  <div class="intro-page">

    <div class="intro-hero">
      <h1 class="intro-title">C'est quoi un réseau de neurones ??</h1>
      <p class="intro-sub">Avant de jouer, découvre comment fonctionne le cerveau d'une IA !</p>
    </div>

    <!-- Étapes pédagogiques -->
    <div class="steps-list">

      <!-- Étape 1 : le neurone biologique -->
      <div class="step-card card" :class="{ visible: visibleSteps >= 1 }">
        <div class="step-num">1</div>
        <div class="step-body">
          <h2 class="step-title">🧬 Dans ton cerveau…</h2>
          <p>Ton cerveau contient <strong>86 milliards de neurones</strong>. Chaque neurone reçoit des signaux de ses voisins. Si la somme des signaux est assez forte, il s'<strong>active</strong> et envoie un signal à son tour.</p>
          <div class="neuron-demo">
            <div class="neuron-inputs">
              <div
                v-for="(inp, i) in neuronInputs"
                :key="i"
                class="neuron-input-btn"
                :class="{ active: inp }"
                @click="toggleNeuronInput(i)"
              >
                {{ inp ? '⚡' : '○' }} Signal {{ i + 1 }}
              </div>
            </div>
            <div class="neuron-arrow">→</div>
            <div class="neuron-body" :class="{ firing: neuronFiring }">
              <div class="neuron-label">🧠 Neurone</div>
              <div class="neuron-sum">Σ = {{ neuronSum }}</div>
              <div class="neuron-status">{{ neuronFiring ? '⚡ ACTIF !' : '💤 inactif' }}</div>
            </div>
          </div>
          <p class="step-hint">👆 Clique sur les signaux pour les activer !</p>
        </div>
      </div>

      <div class="step-card card" :class="{ visible: visibleSteps >= 2 }">
        <div class="step-num">2</div>
        <div class="step-body">
          <h2 class="step-title">🤖 Le neurone artificiel</h2>
          <p>Un neurone artificiel fait la même chose, mais avec des <strong>nombres</strong>. Il reçoit des valeurs, les multiplie par des <strong>poids</strong> (l'importance de chaque signal), les additionne, et s'active si le total dépasse un seuil.</p>
          <div class="formula-box">
            <div class="formula">
              <span class="f-val">entrée × poids</span>
              <span class="f-op">+</span>
              <span class="f-val">entrée × poids</span>
              <span class="f-op">+</span>
              <span class="f-val">…</span>
              <span class="f-op">=</span>
              <span class="f-result">score</span>
            </div>
            <p class="formula-note">Si score ≥ seuil → neurone ACTIF !</p>
          </div>
        </div>
      </div>

      <!-- Étape 3 : le réseau -->
      <div class="step-card card" :class="{ visible: visibleSteps >= 3 }">
        <div class="step-num">3</div>
        <div class="step-body">
          <h2 class="step-title">🕸️ Un réseau de neurones</h2>
          <p>On connecte des dizaines, des milliers, des millions de neurones en couches. Les premières couches détectent des <strong>détails simples</strong> (une ligne, une courbe). Les suivantes assemblent ces détails pour reconnaître des formes plus complexes.</p>
          <div class="network-schema">
            <div class="ns-layer">
              <div class="ns-label">Entrées</div>
              <div class="ns-node inp" v-for="i in 3" :key="i">●</div>
            </div>
            <div class="ns-arrow">→</div>
            <div class="ns-layer">
              <div class="ns-label">Cachés</div>
              <div class="ns-node hid" v-for="i in 4" :key="i">●</div>
            </div>
            <div class="ns-arrow">→</div>
            <div class="ns-layer">
              <div class="ns-label">Sorties</div>
              <div class="ns-node out">🐱</div>
              <div class="ns-node out">🐶</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Étape 4 : l'apprentissage -->
      <div class="step-card card" :class="{ visible: visibleSteps >= 4 }">
        <div class="step-num">4</div>
        <div class="step-body">
          <h2 class="step-title">📚 Comment ça apprend ?</h2>
          <p>Au départ, les poids sont choisis au hasard. Le réseau se <strong>trompe</strong> souvent. Mais à chaque erreur, il ajuste un peu ses poids pour faire mieux la prochaine fois. Après des milliers d'exemples, il devient très performant !</p>
          <div class="learning-anim">
            <div class="la-step" :class="{ active: learnStep >= 1 }">1. Essai → Erreur</div>
            <div class="la-arrow">↓</div>
            <div class="la-step" :class="{ active: learnStep >= 2 }">2. Ajuste les poids</div>
            <div class="la-arrow">↓</div>
            <div class="la-step" :class="{ active: learnStep >= 3 }">3. Réessaie → Mieux !</div>
          </div>
          <button class="demo-btn" @click="animateLearning">
            {{ learnStep === 0 ? '▶ Voir l\'apprentissage' : '🔄 Rejouer' }}
          </button>
        </div>
      </div>

    </div>

    <!-- Bouton continuer -->
    <div class="continue-section">
      <p class="continue-hint">Tu as tout compris ? Alors c'est parti pour le simulateur !</p>
      <button class="btn-continue" @click="continueToNext">
        🐱 Essayer le simulateur Chat/Chien →
      </button>
    </div>

  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'

import { useProgressStore } from '../stores/progress.js'
const progress = useProgressStore()


const router   = useRouter()


// ── Animation des étapes ──────────────────────────────────────────────────────
const visibleSteps = ref(0)

onMounted(() => {
  // Révéler les étapes progressivement
  const delays = [300, 800, 1400, 2000]
  delays.forEach((d, i) => {
    setTimeout(() => { visibleSteps.value = i + 1 }, d)
  })
})

// ── Démo neurone ──────────────────────────────────────────────────────────────
const neuronInputs = ref([false, false, false])
const THRESHOLD = 2

const neuronSum = computed(() =>
  neuronInputs.value.filter(Boolean).length
)
const neuronFiring = computed(() => neuronSum.value >= THRESHOLD)

function toggleNeuronInput(i) {
  neuronInputs.value[i] = !neuronInputs.value[i]
}

// ── Démo apprentissage ────────────────────────────────────────────────────────
const learnStep = ref(0)

function animateLearning() {
  learnStep.value = 0
  setTimeout(() => { learnStep.value = 1 }, 400)
  setTimeout(() => { learnStep.value = 2 }, 1000)
  setTimeout(() => { learnStep.value = 3 }, 1800)
}

// ── Navigation ────────────────────────────────────────────────────────────────
function continueToNext() {
  progress.completeStep('intro')
  router.push(progress.nextRoute('intro'))
}
</script>

<style scoped>
.intro-page { display: flex; flex-direction: column; gap: 28px; max-width: 760px; margin: 0 auto; }

.intro-hero { text-align: center; }
.intro-title { font-family: 'Fredoka One', cursive; font-size: clamp(24px, 4vw, 38px); margin-bottom: 8px; }
.intro-sub   { font-size: 16px; color: #4b5563; }

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
  background: var(--coral, #FF6B6B); color: #fff;
  font-family: 'Fredoka One', cursive; font-size: 18px;
  display: flex; align-items: center; justify-content: center;
}
.step-body { flex: 1; }
.step-title { font-family: 'Fredoka One', cursive; font-size: 20px; margin-bottom: 10px; }
.step-body > p { font-size: 14px; color: #4b5563; line-height: 1.7; margin-bottom: 14px; }
.step-hint { font-size: 12px; color: #9ca3af; margin-top: 8px; }

/* ── Démo neurone ── */
.neuron-demo { display: flex; align-items: center; gap: 16px; flex-wrap: wrap; margin-bottom: 8px; }
.neuron-inputs { display: flex; flex-direction: column; gap: 8px; }
.neuron-input-btn {
  padding: 8px 14px; border-radius: 10px; cursor: pointer;
  border: 2px solid #e5e7eb; background: #f9fafb;
  font-family: 'Fredoka One', cursive; font-size: 13px; color: #374151;
  transition: all 0.2s;
}
.neuron-input-btn.active { background: #FFE66D; border-color: #f59e0b; color: #92400e; }
.neuron-arrow { font-size: 24px; color: #9ca3af; }
.neuron-body {
  padding: 16px 20px; border-radius: 14px; text-align: center;
  border: 3px solid #e5e7eb; background: #f9fafb; transition: all 0.3s;
  min-width: 120px;
}
.neuron-body.firing { background: #f0fdf4; border-color: #6BCB77; }
.neuron-label { font-size: 24px; margin-bottom: 4px; }
.neuron-sum   { font-family: 'Fredoka One', cursive; font-size: 18px; margin-bottom: 4px; }
.neuron-status { font-family: 'Fredoka One', cursive; font-size: 13px; color: #6b7280; }
.neuron-body.firing .neuron-status { color: #16a34a; }

/* ── Formule ── */
.formula-box { background: #f9fafb; border-radius: 12px; padding: 16px; margin-bottom: 8px; }
.formula { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; justify-content: center; margin-bottom: 8px; }
.f-val    { background: #4ECDC422; border: 1.5px solid #4ECDC4; border-radius: 8px; padding: 4px 10px; font-family: 'Fredoka One', cursive; font-size: 13px; color: #0f766e; }
.f-op     { font-family: 'Fredoka One', cursive; font-size: 18px; color: #9ca3af; }
.f-result { background: #FF6B6B22; border: 1.5px solid #FF6B6B; border-radius: 8px; padding: 4px 10px; font-family: 'Fredoka One', cursive; font-size: 13px; color: #b91c1c; }
.formula-note { text-align: center; font-size: 13px; color: #374151; font-weight: 700; }

/* ── Schéma réseau ── */
.network-schema { display: flex; align-items: center; gap: 12px; justify-content: center; flex-wrap: wrap; padding: 16px 0; }
.ns-layer { display: flex; flex-direction: column; align-items: center; gap: 6px; }
.ns-label { font-family: 'Fredoka One', cursive; font-size: 12px; color: #6b7280; margin-bottom: 4px; }
.ns-node  { width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 16px; }
.ns-node.inp { background: #FF6B6B33; border: 2px solid #FF6B6B; font-size: 14px; color: #FF6B6B; }
.ns-node.hid { background: #4ECDC433; border: 2px solid #4ECDC4; font-size: 14px; color: #4ECDC4; }
.ns-node.out { background: #FFE66D33; border: 2px solid #f59e0b; font-size: 20px; }
.ns-arrow { font-size: 22px; color: #9ca3af; }

/* ── Anim apprentissage ── */
.learning-anim { display: flex; flex-direction: column; align-items: flex-start; gap: 4px; margin-bottom: 14px; }
.la-step  {
  padding: 8px 16px; border-radius: 10px; font-family: 'Fredoka One', cursive; font-size: 14px;
  background: #f3f4f6; color: #9ca3af; transition: all 0.4s;
}
.la-step.active  { background: #f0fdf4; color: #166534; }
.la-arrow { font-size: 18px; color: #d1d5db; margin-left: 20px; }
.demo-btn {
  font-family: 'Fredoka One', cursive; font-size: 14px;
  padding: 8px 20px; border-radius: 50px; border: 2px solid #e5e7eb;
  background: #fff; color: #374151; cursor: pointer;
}

/* ── Continuer ── */
.continue-section { text-align: center; padding: 24px 0 8px; }
.continue-hint    { font-size: 15px; color: #4b5563; margin-bottom: 16px; }
.btn-continue {
  font-family: 'Fredoka One', cursive; font-size: 20px;
  padding: 16px 40px; border-radius: 50px; border: none;
  background: #FF6B6B; color: #fff; cursor: pointer;
  box-shadow: 0 8px 24px rgba(255,107,107,0.35);
}
.btn-continue:hover { transform: translateY(-2px); }
</style>
