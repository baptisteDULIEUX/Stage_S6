import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

// ─── Poids (weight matrices) ────────────────────────────────────────────────
// inputToHidden[h][e] = poids de l'entrée e vers le nœud caché h
// Lignes = H1..H5, Colonnes = E1, E2, E3

const WEIGHTS_ROUND1 = {
  inputToHidden: [
    [2, 0, 0], // H1
    [0, 0, 0], // H2
    [0, 3, 2], // H3
    [0, 0, 0], // H4
    [2, 0, 0], // H5
  ],
  hiddenToOutput: [
    [2, 0], // H1 → [CHAT, CHIEN]
    [0, 0], // H2
    [0, 2], // H3
    [0, 0], // H4
    [2, 0], // H5
  ],
}

const WEIGHTS_ROUND2 = {
  inputToHidden: [
    [2, 1, 1], // H1 — renforcé
    [0, 0, 0], // H2
    [0, 1, 2], // H3 — E2→H3 réduit de 3 à 1
    [0, 0, 0], // H4
    [2, 1, 1], // H5 — renforcé
  ],
  hiddenToOutput: [
    [2, 0],
    [0, 0],
    [0, 2],
    [0, 0],
    [2, 0],
  ],
}

// ─── Définition des 4 manches ─────────────────────────────────────────────
export const ROUNDS = [
  {
    id: 1,
    title: "Manche 1 — L'erreur",
    subtitle: 'Le réseau a de mauvais réglages… il va se tromper !',
    card: 'chat-ambigu',
    cardLabel: 'Chat ambigu',
    cardEmoji: '🐱',
    inputs: [0, 1, 1], // E1=Moustaches, E2=Oreilles, E3=Yeux
    weights: WEIGHTS_ROUND1,
    expectedAnswer: 'CHAT',
    learningNote: null,
    // color: '#FF6B6B',
  },
  {
    id: 2,
    title: "Manche 2 — L'apprentissage",
    subtitle: 'On ajuste les poids… regarde le réseau apprendre !',
    card: 'chat-ambigu',
    cardLabel: 'Chat ambigu',
    cardEmoji: '🐱',
    inputs: [0, 1, 1],
    weights: WEIGHTS_ROUND2,
    expectedAnswer: 'CHAT',
    learningNote: [
      'E2→H3 : 3 → 1 (oreilles pointues moins importantes pour chien)',
      'E2→H1 : 0 → 1 et E3→H1 : 0 → 1 (renforcement chat)',
      'E2→H5 : 0 → 1 et E3→H5 : 0 → 1 (renforcement chat)',
    ],
    // color: '#4ECDC4',
  },
  {
    id: 3,
    title: 'Manche 3 — Généralisation',
    subtitle: 'Nouvelle image ! Le réseau va-t-il reconnaître ce chat ?',
    card: 'chat-clair',
    cardLabel: 'Chat non ambigu',
    cardEmoji: '🐱',
    inputs: [1, 1, 1],
    weights: WEIGHTS_ROUND2,
    expectedAnswer: 'CHAT',
    learningNote: null,
    // color: '#6BCB77',
  },
  {
    id: 4,
    title: 'Manche 4 — Généralisation',
    subtitle: 'Et ce chien… le réseau le reconnaît-il ?',
    card: 'chien-clair',
    cardLabel: 'Chien non ambigu',
    cardEmoji: '🐶',
    inputs: [0, 0, 1],
    weights: WEIGHTS_ROUND2,
    expectedAnswer: 'CHIEN',
    learningNote: null,
    // color: '#FF9F43',
  },
]

// ─── Calcul du réseau ────────────────────────────────────────────────────────
export function computeNetwork(inputs, weights) {
  const THRESHOLD = 2

  const hiddenState = weights.inputToHidden.map((row, hi) => {
    const sum = row.reduce((acc, w, ei) => acc + w * inputs[ei], 0)
    return { index: hi, label: `H${hi + 1}`, sum, active: sum >= THRESHOLD }
  })

  const outputScores = [0, 0] // [CHAT, CHIEN]
  hiddenState.forEach((h) => {
    if (h.active) {
      weights.hiddenToOutput[h.index].forEach((w, oi) => {
        outputScores[oi] += w
      })
    }
  })

  const prediction =
      outputScores[0] > outputScores[1]
          ? 'CHAT'
          : outputScores[1] > outputScores[0]
              ? 'CHIEN'
              : 'EGALITE'

  return { hiddenState, outputScores, prediction }
}

// ─── Store Pinia ─────────────────────────────────────────────────────────────
export const useSimulatorStore = defineStore('simulator', () => {
  const currentRoundIndex = ref(0)
  const result = ref(null)

  const currentRound = computed(() => ROUNDS[currentRoundIndex.value])

  const networkResult = computed(() => {
    const r = currentRound.value
    return computeNetwork(r.inputs, r.weights)
  })

  function runAnimation() {
    result.value = networkResult.value
  }

  function reset() {
    result.value = null
  }

  function goToRound(index) {
    currentRoundIndex.value = index
    reset()
  }

  function nextRound() {
    if (currentRoundIndex.value < ROUNDS.length - 1) {
      goToRound(currentRoundIndex.value + 1)
    }
  }

  function prevRound() {
    if (currentRoundIndex.value > 0) {
      goToRound(currentRoundIndex.value - 1)
    }
  }

  return {
    currentRoundIndex,
    currentRound,
    result,
    networkResult,
    runAnimation,
    reset,
    goToRound,
    nextRound,
    prevRound,
  }
})
