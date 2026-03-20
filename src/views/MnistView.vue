<template>
  <div class="mnist-view">

    <div class="mnist-header">
      <h1 class="mnist-title">Dessine un chien/chat !</h1>
      <p class="mnist-desc">
        Dessine un chien ou un chat, et regarde l'IA le reconnaître en temps réel.
      </p>
    </div>

    <!-- Bandeau état du modèle -->
    <div v-if="!model.isReady.value" class="model-status card">
      <span v-if="model.isLoading.value"> Chargement du modèle IA…</span>
      <span v-else-if="model.loadError.value" class="error-msg">
         {{ model.loadError.value }}
        <br><small>
          Si l'erreur mentionne <strong>Float32Array</strong> ou <strong>multiple of 4</strong> :
          supprime le dossier <code>public/models/mnist/</code> — il contient des fichiers corrompus.
          Le modèle se charge automatiquement depuis Internet.
          <br>Sinon, vérifie ta connexion et ouvre la console (F12) pour plus de détails.
        </small>
      </span>
      <span v-else>️ Modèle non chargé</span>
    </div>

    <div class="mnist-body">

      <!-- Colonne gauche : dessin -->
      <div class="mnist-left card">
        <h3 class="section-label">🖊️ Ton dessin</h3>
        <DrawingCanvas
            ref="drawingCanvas"
            :size="420"
            :brush-size="10"
            :show-preview="true"
            @drawn="onDrawn"
        />
      </div>

      <!-- Colonne centre : prédiction -->
      <div class="mnist-center card">
        <h3 class="section-label">🤖 Ce que pense l'IA</h3>
        <PredictionBars :predictions="model.predictions.value" />
      </div>

<!--      &lt;!&ndash; Colonne droite : activations &ndash;&gt;-->
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

<!--        &lt;!&ndash; Explication pédagogique &ndash;&gt;-->
<!--        <div class="explain-card card">-->
<!--          <h3 class="section-label">📖 Comment ça marche ?</h3>-->
<!--          <div class="explain-steps">-->
<!--            <div class="explain-step">-->
<!--              <span class="step-icon">🔍</span>-->
<!--              <div>-->
<!--                <strong>Convolution</strong>-->
<!--                <p>Un petit filtre (loupe) glisse sur l'image pour détecter des motifs : bords, courbes…</p>-->
<!--              </div>-->
<!--            </div>-->
<!--            <div class="explain-step">-->
<!--              <span class="step-icon">📐</span>-->
<!--              <div>-->
<!--                <strong>Pooling</strong>-->
<!--                <p>On garde seulement la valeur la plus forte dans chaque zone 2×2. L'image est réduite de moitié.</p>-->
<!--              </div>-->
<!--            </div>-->
<!--            <div class="explain-step">-->
<!--              <span class="step-icon">📊</span>-->
<!--              <div>-->
<!--                <strong>Décision</strong>-->
<!--                <p>Les informations restantes sont combinées pour donner un score à chaque chiffre (0–9).</p>-->
<!--              </div>-->
<!--            </div>-->
<!--          </div>-->
<!--        </div>-->

<!--      </div>-->
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import DrawingCanvas   from '../components/DrawingCanvas.vue'
import PredictionBars  from '../components/PredictionBars.vue'
import FeatureMapGrid  from '../components/FeatureMapGrid.vue'
import { useMnistModel } from '../composables/useMnistModel.js'

const model        = useMnistModel()
const drawingCanvas = ref(null)

// Charger le modèle au montage
onMounted(async () => {
  await model.loadModel()
  // Affiche les noms de couches dans la console (F12) pour vérifier
  model.logLayerNames()
})

// Appelé chaque fois que l'utilisateur termine un tracé
async function onDrawn(canvas28) {
  if (!model.isReady.value || !canvas28) return
  await model.predict(canvas28)
  await model.extractActivations(canvas28)
}

// Afficher les 4 premiers filtres de convolution
const visibleFilters = [0, 1, 2, 3]

// Formes des couches pour l'affichage (ex: "26×26")
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
.mnist-view   { display: flex; flex-direction: column; gap: 24px; }
.mnist-header { text-align: center; }
.mnist-title  { font-family: 'Fredoka One', cursive; font-size: clamp(26px, 4vw, 42px); margin-bottom: 6px; }
.mnist-desc   { color: #4b5563; font-size: 16px; }

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
  grid-template-columns: 460px 1fr;
  gap: 20px;
  align-items: start;
}
@media (max-width: 1000px) { .mnist-body { grid-template-columns: 1fr; } }

.mnist-left   { display: flex; flex-direction: column; gap: 12px; align-items: center; }
.mnist-center { display: flex; flex-direction: column; gap: 12px; }
.mnist-right  { display: flex; flex-direction: column; gap: 16px; }

.section-label {
  font-family: 'Fredoka One', cursive;
  font-size: 16px; margin-bottom: 12px;
  color: var(--dark);
  display: flex; align-items: center; gap: 8px;
}
.layer-info { font-family: 'Nunito', sans-serif; font-size: 11px; color: #9ca3af; font-weight: 600; }

/* Feature maps côte à côte */
.fmap-row  { display: flex; gap: 10px; flex-wrap: wrap; }
.fmap-cell { display: flex; flex-direction: column; align-items: center; gap: 4px; }
.fmap-filter-label { font-size: 10px; color: #9ca3af; font-weight: 700; }

/* Explications */
.explain-steps { display: flex; flex-direction: column; gap: 12px; }
.explain-step  { display: flex; gap: 12px; align-items: flex-start; }
.step-icon     { font-size: 24px; flex-shrink: 0; }
.explain-step strong { display: block; font-size: 14px; margin-bottom: 2px; }
.explain-step p      { font-size: 12px; color: #4b5563; line-height: 1.5; margin: 0; }
</style>
