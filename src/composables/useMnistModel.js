import { ref, shallowRef } from 'vue'
import * as tf from '@tensorflow/tfjs'


const MODEL_URL = '/models/doodle/model.json'
export const AI_LABELS = ['Chat', 'Chien', 'Inconnu']

const LAYER_NAMES = {
  conv1:   'conv2d_1_input',
  pool1:   'max_pooling2d_1',
  flatten: 'flatten_1',
}

export function useMnistModel() {
  // 2. Remplace ref par shallowRef pour le modèle
  const model       = shallowRef(null)

  const isLoading   = ref(false)
  const loadError   = ref(null)
  const predictions = ref(null)
  const activations = ref(null)
  const isReady     = ref(false)

  async function loadModel() {
    isLoading.value = true
    loadError.value = null
    try {
      await tf.ready()

      model.value = await tf.loadLayersModel(MODEL_URL)

      // Warm-up classique
      const dummy  = tf.zeros([1, 28, 28, 1])
      const warmup = model.value.predict(dummy)
      await warmup.data()
      warmup.dispose()
      dummy.dispose()

      isReady.value = true
    } catch (err) {
      loadError.value = `Impossible de charger le modèle : ${err.message}`
      console.error(err)
    } finally {
      isLoading.value = false
    }
  }

  // ─── Prédiction ─────────────────────────────────────────────────────────────
  async function predict(canvas28) {
    if (!model.value || !canvas28) return

    const inputTensor  = canvasToTensor(canvas28)
    const outputTensor = model.value.predict(inputTensor)

    const raw = await outputTensor.data()
    const result = Array.from(raw)

    inputTensor.dispose()
    outputTensor.dispose()

    predictions.value = result
    return result
  }

  async function extractActivations(canvas28) {
    if (!model.value || !canvas28) return

    const result = {}

    // On commence avec notre image d'entrée
    let currentTensor = canvasToTensor(canvas28)

    // On fait traverser l'image manuellement couche par couche !
    for (const layer of model.value.layers) {
      // Calcul du passage dans la couche
      const nextTensor = layer.apply(currentTensor)

      // Est-ce une couche dont on veut sauvegarder l'image ?
      const targetKey = Object.keys(LAYER_NAMES).find(key => LAYER_NAMES[key] === layer.name)

      if (targetKey) {
        const raw = await nextTensor.data()
        result[targetKey] = {
          data: Array.from(raw),
          shape: nextTensor.shape,
        }
      }

      // On nettoie l'ancien tenseur de la carte graphique (crucial !)
      currentTensor.dispose()

      // Le résultat devient l'entrée de la couche suivante
      currentTensor = nextTensor
    }

    // Nettoie le tout dernier tenseur (la sortie finale)
    currentTensor.dispose()

    activations.value = result
    return result
  }

  // ─── Conversion canvas → tensor ─────────────────────────────────────────────
  function canvasToTensor(canvas) {
    return tf.tidy(() => {
      return tf.browser
          .fromPixels(canvas, 1)
          .toFloat()
          .div(tf.scalar(255))
          .expandDims(0)
    })
  }

  function getPredictedDigit() {
    if (!predictions.value) return null
    return predictions.value.indexOf(Math.max(...predictions.value))
  }

  function getFeatureMap(layerKey, filterIndex = 0) {
    const act = activations.value?.[layerKey]
    if (!act) return null

    const [, height, width, numFilters] = act.shape
    if (filterIndex >= numFilters) return null

    const grid = []
    for (let y = 0; y < height; y++) {
      const row = []
      for (let x = 0; x < width; x++) {
        const idx = (y * width + x) * numFilters + filterIndex
        row.push(act.data[idx])
      }
      grid.push(row)
    }
    return { grid, height, width }
  }

  function logLayerNames() {
    if (!model.value) return
    console.table(model.value.layers.map((l, i) => ({ index: i, name: l.name, type: l.getClassName(), outputShape: JSON.stringify(l.outputShape) })))
  }

  return { isLoading, isReady, loadError, predictions, activations, loadModel, predict, extractActivations, getPredictedDigit, getFeatureMap, logLayerNames }
}