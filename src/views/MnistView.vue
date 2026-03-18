<template>
  <div class="mnist-view">
    <div class="mnist-header">
      <h1 class="mnist-title">✏️ Dessine un chiffre !</h1>
      <p class="mnist-desc">
        Dessine un chiffre de 0 à 9, et regarde l'IA le reconnaître en temps réel.
      </p>
    </div>

    <div v-if="!model.isReady.value" class="model-status card">
      <span v-if="model.isLoading.value">⏳ Chargement du modèle IA…</span>
      <span v-else-if="model.loadError.value" class="error-msg">
        ❌ {{ model.loadError.value }}
        <br /><small>
          Si l'erreur mentionne <strong>Float32Array</strong> ou <strong>multiple of 4</strong> : supprime le dossier <code>public/models/mnist/</code> — il contient des fichiers corrompus. Le modèle se charge automatiquement depuis Internet.
          <br />Sinon, vérifie ta connexion et ouvre la console (F12) pour plus de détails.
        </small>
      </span>
      <span v-else>⚠️ Modèle non chargé</span>
    </div>

    <div class="mnist-body">
      <div class="mnist-left card">
        <h3 class="section-label">🖊️ Ton dessin</h3>
        <DrawingCanvas
            ref="drawingCanvas"
            :size="280"
            :brush-size="20"
            :show-preview="true"
            @drawn="onDrawn"
        />
      </div>

      <div class="mnist-center card">
        <h3 class="section-label">🤖 Ce que pense l'IA</h3>
        <PredictionBars :predictions="model.predictions.value" />
      </div>

<!--      <div class="mnist-right">-->
<!--        <div class="card">-->
<!--          <h3 class="section-label">-->
<!--            🔍 Après convolution-->
<!--            <span class="layer-info">({{ convShape }})</span>-->
<!--          </h3>-->
<!--          <div class="fmap-row">-->
<!--            <div v-for="f in visibleFilters" :key="f" class="fmap-cell">-->
<!--              <p class="fmap-filter-label">Filtre {{ f + 1 }}</p>-->
<!--              <FeatureMapGrid-->
<!--                  :feature-map="model.getFeatureMap('conv1', f)"-->
<!--                  :color-mode="'heat'"-->
<!--                  :empty-message="'—'"-->
<!--              />-->
<!--            </div>-->
<!--          </div>-->
<!--        </div>-->

<!--        <div class="card">-->
<!--          <h3 class="section-label">-->
<!--            📐 Après pooling-->
<!--            <span class="layer-info">({{ poolShape }})</span>-->
<!--          </h3>-->
<!--          <div class="fmap-row">-->
<!--            <div v-for="f in visibleFilters" :key="f" class="fmap-cell">-->
<!--              <p class="fmap-filter-label">Filtre {{ f + 1 }}</p>-->
<!--              <FeatureMapGrid-->
<!--                  :feature-map="model.getFeatureMap('pool1', f)"-->
<!--                  :color-mode="'gray'"-->
<!--                  :empty-message="'—'"-->
<!--              />-->
<!--            </div>-->
<!--          </div>-->
<!--        </div>-->
<!--      </div>-->
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import DrawingCanvas from '../components/DrawingCanvas.vue'
import PredictionBars from '../components/PredictionBars.vue'
import FeatureMapGrid from '../components/FeatureMapGrid.vue'
import { useMnistModel } from '../composables/useMnistModel'
import JSConfetti from 'js-confetti'

// 1. Initialisation des modèles et outils
const model = useMnistModel()
const drawingCanvas = ref(null)



// On crée un message automatique et réactif en fonction de la prédiction
const messageAmi = computed(() => {
  const predictions = model.predictions.value
  if (!predictions) return null

  // On récupère l'index gagnant (0, 1 ou 2)
  const indexTrouve = model.getPredictedDigit()
  const score = Math.round(predictions[indexTrouve] * 100)

  if (indexTrouve === 0) {
    return `Je suis sûr à ${score}% que c'est un CHAT ! 🐱`
  } else if (indexTrouve === 1) {
    return `Je suis sûr à ${score}% que c'est un CHIEN ! 🐶`
  } else {
    return `Hmm... Je ne reconnais ni un chat, ni un chien. Essaie encore ! ❓`
  }
})

// Nettoyage de sécurité si on change de page pendant que ça tremble
onUnmounted(() => {
  document.body.classList.remove('shake-animation')
})

// 3. Cycle de vie de l'IA
onMounted(async () => {
  await model.loadModel()
  model.logLayerNames()
})

// 4. Action de dessin
async function onDrawn(canvas28) {
  if (!model.isReady.value || !canvas28) return

  // L'IA lit le chiffre
  await model.predict(canvas28)

  // On extrait les images des couches internes
  await model.extractActivations(canvas28)

  // 💡 C'est ici qu'on vérifie l'Easter Egg !
  const digitTrouve = model.getPredictedDigit()
  checkSecretCode(digitTrouve)
}

// 5. Affichage des filtres (Vue interne)
const visibleFilters = [0, 1, 2, 3]

const convShape = computed(() => {
  const act = model.activations.value?.conv1
  if (!act) return '…'
  return `${act.shape[1]}×${act.shape[2]}, ${act.shape[3]} filtres`
})

const poolShape = computed(() => {
  const act = model.activations.value?.pool1
  if (!act) return '…'
  return `${act.shape[1]}×${act.shape[2]}, ${act.shape[3]} filtres`
})
</script>

<style scoped>
.mnist-view { display: flex; flex-direction: column; gap: 24px; }
.mnist-header { text-align: center; }
.mnist-title { font-family: 'Fredoka One', cursive; font-size: clamp(26px, 4vw, 42px); margin-bottom: 6px; }
.mnist-desc { color: #4b5563; font-size: 16px; }

.model-status {
  text-align: center;
  padding: 16px;
  font-size: 15px;
  color: #374151;
  background: #fffbeb;
  border: 2px solid #fcd34d;
}
.error-msg { color: #dc2626; }
.error-msg code { background: #fee2e2; padding: 2px 6px; border-radius: 4px; font-size: 12px; }

.mnist-body {
  display: grid;
  grid-template-columns: 320px 1fr 1fr;
  gap: 20px;
  align-items: start;
}
@media (max-width: 960px) { .mnist-body { grid-template-columns: 1fr; } }

.mnist-left { display: flex; flex-direction: column; gap: 12px; align-items: center; }
.mnist-center { display: flex; flex-direction: column; gap: 12px; }
.mnist-right { display: flex; flex-direction: column; gap: 16px; }

.section-label {
  font-family: 'Fredoka One', cursive;
  font-size: 16px; margin-bottom: 12px;
  color: var(--dark);
  display: flex; align-items: center; gap: 8px;
}
.layer-info { font-family: 'Nunito', sans-serif; font-size: 11px; color: #9ca3af; font-weight: 600; }

/* Feature maps côte à côte */
.fmap-row { display: flex; gap: 10px; flex-wrap: wrap; }
.fmap-cell { display: flex; flex-direction: column; align-items: center; gap: 4px; }
.fmap-filter-label { font-size: 10px; color: #9ca3af; font-weight: 700; }
</style>

<style>
@keyframes shakeEarthquake {
  0% { transform: translate(1px, 1px) rotate(0deg); }
  10% { transform: translate(-1px, -2px) rotate(-1deg); }
  20% { transform: translate(-3px, 0px) rotate(1deg); }
  30% { transform: translate(3px, 2px) rotate(0deg); }
  40% { transform: translate(1px, -1px) rotate(1deg); }
  50% { transform: translate(-1px, 2px) rotate(-1deg); }
  60% { transform: translate(-3px, 1px) rotate(0deg); }
  70% { transform: translate(3px, 1px) rotate(-1deg); }
  80% { transform: translate(-1px, -1px) rotate(1deg); }
  90% { transform: translate(1px, 2px) rotate(0deg); }
  100% { transform: translate(1px, -2px) rotate(-1deg); }
}

.shake-animation {
  animation: shakeEarthquake 0.5s infinite;
  overflow: hidden;
}
</style>