// ─────────────────────────────────────────────────────────────────────────────
// useMnistModel.js
// Composable Vue 3 qui gère :
//   - le chargement du modèle TensorFlow.js
//   - la prédiction depuis un canvas 28×28
//   - l'extraction des activations intermédiaires (feature maps)
// ─────────────────────────────────────────────────────────────────────────────
import { ref, readonly } from 'vue'
import * as tf from '@tensorflow/tfjs'

// ─── URL du modèle ────────────────────────────────────────────────────────────
// Chargement depuis le CDN officiel Google — aucun fichier local nécessaire.
// Le fichier de poids binaire se télécharge directement en mémoire,
// ce qui évite tout problème de corruption lors d'un téléchargement manuel.
const MODEL_URL = 'https://storage.googleapis.com/tfjs-models/tfjs/mnist_transfer_cnn_v1/model.json'

// ─── Noms des couches à visualiser ───────────────────────────────────────────
// Noms des couches du modèle mnist_transfer_cnn_v1
// Pour voir tous les noms disponibles : appelle logLayerNames() dans la console
const LAYER_NAMES = {
  conv1:   'conv2d_Conv2D1',
  pool1:   'max_pooling2d_MaxPooling2D1',
  flatten: 'flatten_Flatten1',
}

export function useMnistModel() {
  // ─── État réactif ───────────────────────────────────────────────────────────
  const model       = ref(null)
  const isLoading   = ref(false)
  const loadError   = ref(null)
  const predictions = ref(null)   // Float32Array de 10 probabilités
  const activations = ref(null)   // { conv1: tensor, pool1: tensor }
  const isReady     = ref(false)

  // ─── Chargement du modèle ───────────────────────────────────────────────────
  async function loadModel() {
    isLoading.value = true
    loadError.value = null
    try {
      model.value = await tf.loadLayersModel(MODEL_URL)

      // Warm-up : force l'initialisation du backend WebGL/WASM
      const dummy  = tf.zeros([1, 28, 28, 1])
      const warmup = model.value.predict(dummy)
      await warmup.data()   // attend que le backend soit prêt
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

    // PAS de tf.tidy() ici — il disposerait les tensors pendant la convolution
    // On gère la mémoire manuellement avec dispose()
    const inputTensor  = canvasToTensor(canvas28)
    const outputTensor = model.value.predict(inputTensor)

    // .data() est async, contrairement à .dataSync() qui bloque le thread
    const raw = await outputTensor.data()
    const result = Array.from(raw)

    inputTensor.dispose()
    outputTensor.dispose()

    predictions.value = result
    return result
  }

  // ─── Extraction des activations intermédiaires ───────────────────────────────
  async function extractActivations(canvas28) {
    if (!model.value || !canvas28) return

    const result = {}

    for (const [key, layerName] of Object.entries(LAYER_NAMES)) {
      try {
        const layer = model.value.getLayer(layerName)
        if (!layer) continue

        const subModel = tf.model({
          inputs:  model.value.inputs,
          outputs: layer.output,
        })

        // Créer un tensor FRAIS pour chaque sous-modèle
        // (réutiliser le même tensor après dispose() causerait l'erreur)
        const inputTensor  = canvasToTensor(canvas28)
        const activation   = subModel.predict(inputTensor)
        const raw          = await activation.data()   // async — pas de blocage

        result[key] = {
          data:  Array.from(raw),
          shape: activation.shape,
        }

        activation.dispose()
        inputTensor.dispose()
        subModel.dispose()
      } catch (err) {
        console.warn(`Couche "${layerName}" introuvable :`, err.message)
      }
    }

    activations.value = result
    return result
  }

  // ─── Conversion canvas → tensor ─────────────────────────────────────────────
  // Transforme un canvas 28×28 en tensor [1, 28, 28, 1] normalisé entre 0 et 1
  function canvasToTensor(canvas) {
    return tf.browser
      .fromPixels(canvas, 1)          // 1 canal = niveaux de gris
      .toFloat()
      .div(tf.scalar(255))            // normaliser 0-255 → 0-1
      .expandDims(0)                  // ajouter dimension batch → [1, 28, 28, 1]
  }

  // ─── Utilitaires ─────────────────────────────────────────────────────────────

  // Retourne l'index du chiffre prédit (celui avec la plus haute probabilité)
  function getPredictedDigit() {
    if (!predictions.value) return null
    return predictions.value.indexOf(Math.max(...predictions.value))
  }

  // Retourne une feature map spécifique sous forme de tableau 2D (grille de pixels)
  // layerKey : 'conv1' | 'pool1'
  // filterIndex : index du filtre (ex: 0 pour le premier filtre)
  function getFeatureMap(layerKey, filterIndex = 0) {
    const act = activations.value?.[layerKey]
    if (!act) return null

    const [, height, width, numFilters] = act.shape
    if (filterIndex >= numFilters) return null

    // Extraire la grille 2D pour ce filtre
    const grid = []
    for (let y = 0; y < height; y++) {
      const row = []
      for (let x = 0; x < width; x++) {
        // Index dans le tableau plat : [batch=0, y, x, filter]
        const idx = (y * width + x) * numFilters + filterIndex
        row.push(act.data[idx])
      }
      grid.push(row)
    }
    return { grid, height, width }
  }

  // Inspecter les couches disponibles (utile pour déboguer les noms)
  function logLayerNames() {
    if (!model.value) return
    console.table(
      model.value.layers.map((l, i) => ({
        index: i,
        name: l.name,
        type: l.getClassName(),
        outputShape: JSON.stringify(l.outputShape),
      }))
    )
  }

  return {
    // État
    isLoading:   readonly(isLoading),
    isReady:     readonly(isReady),
    loadError:   readonly(loadError),
    predictions: readonly(predictions),
    activations: readonly(activations),

    // Méthodes
    loadModel,
    predict,
    extractActivations,
    getPredictedDigit,
    getFeatureMap,
    logLayerNames,
  }
}
