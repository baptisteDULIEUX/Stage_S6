import { ref, shallowRef, readonly } from 'vue'
import * as tf from '@tensorflow/tfjs'

// ─── URLs du modèle et des classes ─────────────────────────────────────────
// Le modèle DoodleNet (345 catégories)
const MODEL_URL = 'https://cdn.jsdelivr.net/gh/yining1023/doodleNet@master/model/model.json'
const CLASSES_URL = 'https://cdn.jsdelivr.net/gh/googlecreativelab/quickdraw-dataset@master/categories.txt'
// Noms des couches (à vérifier dans la console avec logLayerNames !)
const LAYER_NAMES = {
    conv1:   'conv2d_1',
    pool1:   'max_pooling2d_1',
}

export function useDoodleModel() {
    const model       = shallowRef(null)
    const classes     = ref([]) // Contiendra les 345 mots

    const isLoading   = ref(false)
    const loadError   = ref(null)
    const predictions = ref(null) // Top 3 des prédictions
    const activations = ref(null)
    const isReady     = ref(false)

    // ─── Dictionnaire Anglais -> Français (optionnel mais sympa) ──────────────
    const DICO_FR = {
        'apple': 'pomme', 'cat': 'chat', 'dog': 'chien', 'sun': 'soleil',
        'car': 'voiture', 'house': 'maison', 'tree': 'arbre', 'bicycle': 'vélo',
        'face': 'visage', 'flower': 'fleur', 'fish': 'poisson', 'bird': 'oiseau',
        // ... tu pourras en rajouter selon ce que les enfants dessinent le plus !
    }

    // ─── Chargement du Modèle ET des Classes ──────────────────────────────────
    async function loadModel() {
        isLoading.value = true
        loadError.value = null
        try {
            await tf.ready()

            // 1. On charge la liste des mots depuis le GitHub de Google
            const rawText = await fetch(CLASSES_URL).then(r => r.text())
            classes.value = rawText.split('\n').filter(c => c.trim() !== '')

            // 2. On charge le cerveau
            model.value = await tf.loadLayersModel(MODEL_URL)

            // 3. Warm-up
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

    // ─── Prédiction (Top 3) ───────────────────────────────────────────────────
    async function predict(canvas28) {
        if (!model.value || !canvas28 || classes.value.length === 0) return

        const inputTensor  = canvasToTensor(canvas28)
        const outputTensor = model.value.predict(inputTensor)

        const raw = await outputTensor.data()

        // On associe chaque score à son mot (ex: { label: "apple", score: 0.98 })
        let scores = Array.from(raw).map((prob, index) => ({
            originalLabel: classes.value[index],
            label: DICO_FR[classes.value[index]] || classes.value[index], // Traduction si elle existe
            score: prob
        }))

        // On trie du plus probable au moins probable
        scores.sort((a, b) => b.score - a.score)

        inputTensor.dispose()
        outputTensor.dispose()

        // On ne garde que les 3 meilleures prédictions pour l'interface !
        predictions.value = scores.slice(0, 3)
        return predictions.value
    }

    // ─── Extraction Eager (Inchangée) ─────────────────────────────────────────
    async function extractActivations(canvas28) {
        if (!model.value || !canvas28) return
        const result = {}
        let currentTensor = canvasToTensor(canvas28)

        for (const layer of model.value.layers) {
            const nextTensor = layer.apply(currentTensor)
            const targetKey = Object.keys(LAYER_NAMES).find(key => LAYER_NAMES[key] === layer.name)
            if (targetKey) {
                const raw = await nextTensor.data()
                result[targetKey] = { data: Array.from(raw), shape: nextTensor.shape }
            }
            currentTensor.dispose()
            currentTensor = nextTensor
        }
        currentTensor.dispose()
        activations.value = result
        return result
    }

    function canvasToTensor(canvas) {
        return tf.tidy(() => {
            // DoodleNet est entraîné sur des traits noirs sur fond blanc qu'il inverse en tenseur
            // Ton canvas dessine déjà en blanc sur noir donc c'est parfait !
            return tf.browser.fromPixels(canvas, 1).toFloat().div(tf.scalar(255)).expandDims(0)
        })
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

    return { isLoading, isReady, loadError, predictions, activations, loadModel, predict, extractActivations, getFeatureMap, logLayerNames }
}