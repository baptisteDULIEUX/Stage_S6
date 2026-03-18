import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import {
  ROUNDS, CONNECTIONS, WEIGHTS_BY_ROUND,
  INPUT_IDS, HIDDEN_IDS, OUTPUT_IDS,
} from '../network/catDogNetwork.js'

export { ROUNDS }

// ─── Calcul du réseau (pur JS, pas de Vue) ───────────────────────────────────
//
// Retourne : nodeStates — une map id → état
//   entrées  : { value: 0|1, active: bool }
//   cachés   : { sum: number, active: bool }
//   sorties  : { score: number, winner: bool }
export function computeNetworkState(inputValues, weights, threshold = 2) {
  const nodeStates = {}

  // 1. États des entrées
  INPUT_IDS.forEach(id => {
    const value = inputValues[id] ?? 0
    nodeStates[id] = { value, active: value === 1 }
  })

  // 2. États des nœuds cachés
  HIDDEN_IDS.forEach(id => {
    const sum = CONNECTIONS
      .filter(c => c.to === id)
      .reduce((acc, c) => {
        const w = weights[`${c.from}->${c.to}`] ?? 0
        return acc + (nodeStates[c.from]?.active ? w : 0)
      }, 0)
    nodeStates[id] = { sum, active: sum >= threshold }
  })

  // 3. Scores des sorties
  OUTPUT_IDS.forEach(id => {
    const score = CONNECTIONS
      .filter(c => c.to === id)
      .reduce((acc, c) => {
        const w = weights[`${c.from}->${c.to}`] ?? 0
        return acc + (nodeStates[c.from]?.active ? w : 0)
      }, 0)
    nodeStates[id] = { score, winner: false }
  })

  // 4. Prédiction
  const scores    = OUTPUT_IDS.map(id => nodeStates[id].score)
  const maxScore  = Math.max(...scores)
  const winnerIdx = scores.indexOf(maxScore)
  const prediction = scores.filter(s => s === maxScore).length === 1
    ? OUTPUT_IDS[winnerIdx]
    : 'EGALITE'

  if (prediction !== 'EGALITE') {
    nodeStates[prediction].winner = true
  }

  return { nodeStates, prediction }
}

// ─── Store Pinia ─────────────────────────────────────────────────────────────
export const useSimulatorStore = defineStore('simulator', () => {
  const currentRoundIndex = ref(0)
  const result = ref(null)

  const currentRound   = computed(() => ROUNDS[currentRoundIndex.value])
  const currentWeights = computed(() => WEIGHTS_BY_ROUND[currentRoundIndex.value])

  const networkResult = computed(() =>
    computeNetworkState(currentRound.value.inputs, currentWeights.value)
  )

  function compute() {
    result.value = networkResult.value
  }

  // Calcule depuis des entrées fournies (ex : saisie utilisateur validée)
  function computeWith(inputs) {
    result.value = computeNetworkState(inputs, currentWeights.value)
  }

  function reset() {
    result.value = null
  }

  function goToRound(index) {
    currentRoundIndex.value = index
    reset()
  }

  function nextRound() {
    if (currentRoundIndex.value < ROUNDS.length - 1) goToRound(currentRoundIndex.value + 1)
  }

  function prevRound() {
    if (currentRoundIndex.value > 0) goToRound(currentRoundIndex.value - 1)
  }

  return {
    currentRoundIndex, currentRound, currentWeights,
    result, networkResult,
    compute, computeWith, reset, goToRound, nextRound, prevRound,
  }
})
