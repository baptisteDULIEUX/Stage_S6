export const LAYER_ORDER = ['inputs', 'hidden', 'outputs']

// Nœuds : chaque nœud déclare sa couche + métadonnées visuelles optionnelles
// L'ordre d'insertion dans cet objet détermine l'ordre vertical dans chaque couche
export const NODES = {
  // ── Entrées ────────────────────────────────────────────────────────────────
  E1: { layer: 'inputs',  label: 'Moustaches',       emoji: '🥸', color: '#FF6B6B' },
  E2: { layer: 'inputs',  label: 'Oreilles pointues', emoji: '👂', color: '#4ECDC4' },
  E3: { layer: 'inputs',  label: 'Yeux ronds',        emoji: '👀', color: '#A78BFA' },
  // ── Couche cachée ──────────────────────────────────────────────────────────
  H1: { layer: 'hidden' },
  H2: { layer: 'hidden' },
  H3: { layer: 'hidden' },
  H4: { layer: 'hidden' },
  H5: { layer: 'hidden' },
  // ── Sorties ────────────────────────────────────────────────────────────────
  CHAT:  { layer: 'outputs', label: 'CHAT',  emoji: '🐱', color: '#F59E0B' },
  CHIEN: { layer: 'outputs', label: 'CHIEN', emoji: '🐶', color: '#3B82F6' },
}

// IDs groupés par couche
export const INPUT_IDS  = ['E1', 'E2', 'E3']
export const HIDDEN_IDS = ['H1', 'H2', 'H3', 'H4', 'H5']
export const OUTPUT_IDS = ['CHAT', 'CHIEN']

// ─── Topologie ───────────────────────────────────────────────────────────────
// Les connexions décrivent la structure du réseau (indépendamment des poids).
// Ici : deux couches fully-connected.

function fullyConnected(fromIds, toIds) {
  return fromIds.flatMap(from => toIds.map(to => ({ from, to })))
}

export const CONNECTIONS = [
  ...fullyConnected(INPUT_IDS,  HIDDEN_IDS),
  ...fullyConnected(HIDDEN_IDS, OUTPUT_IDS),
]

// ─── Poids par manche ────────────────────────────────────────────────────────

export const WEIGHTS_R1 = {
  // Connexions actives — réseau initial (mauvais réglage)
  'E1->H1': 2,
  'E1->H5': 2,
  'E2->H3': 3,  // trop fort → va tromper le réseau sur le chat ambigu
  'E3->H3': 2,
  'H1->CHAT':  2,
  'H5->CHAT':  2,
  'H3->CHIEN': 2,
}

export const WEIGHTS_R2 = {
  // Connexions actives — après apprentissage
  'E1->H1': 2,
  'E2->H1': 1,  //  nouveau
  'E3->H1': 1,  //  nouveau
  'E1->H5': 2,
  'E2->H5': 1,  //  nouveau
  'E3->H5': 1,  //  nouveau
  'E2->H3': 1,  //  réduit (était 3)
  'E3->H3': 2,
  'H1->CHAT':  2,
  'H5->CHAT':  2,
  'H3->CHIEN': 2,
}

// Correspondance manche → poids (manches 3 et 4 réutilisent R2)
export const WEIGHTS_BY_ROUND = [WEIGHTS_R1, WEIGHTS_R2, WEIGHTS_R2, WEIGHTS_R2]

// ─── Définition des 4 manches (données pédagogiques) ─────────────────────────
export const ROUNDS = [
  {
    id: 1,
    title: "Manche 1 — L'erreur",
    subtitle: 'Le réseau a de mauvais réglages… il va se tromper !',
    cardLabel: 'Chat ambigu',
    cardEmoji: '🐱',
    inputs: { E1: 0, E2: 1, E3: 1 },
    expectedAnswer: 'CHAT',
    learningNote: null,
    color: '#FF6B6B',
  },
  {
    id: 2,
    title: "Manche 2 — L'apprentissage",
    subtitle: 'On ajuste les poids… regarde le réseau apprendre !',
    cardLabel: 'Chat ambigu (même image)',
    cardEmoji: '🐱',
    inputs: { E1: 0, E2: 1, E3: 1 },
    expectedAnswer: 'CHAT',
    learningNote: [
      'E2→H3 : 3 → 1 (oreilles pointues moins importantes pour chien)',
      'E2→H1 : 0 → 1 et E3→H1 : 0 → 1 (renforcement chat)',
      'E2→H5 : 0 → 1 et E3→H5 : 0 → 1 (renforcement chat)',
    ],
    color: '#4ECDC4',
  },
  {
    id: 3,
    title: 'Manche 3 — Généralisation',
    subtitle: 'Nouvelle image ! Le réseau va-t-il reconnaître ce chat ?',
    cardLabel: 'Chat non ambigu',
    cardEmoji: '🐱',
    inputs: { E1: 1, E2: 1, E3: 1 },
    expectedAnswer: 'CHAT',
    learningNote: null,
    color: '#6BCB77',
  },
  {
    id: 4,
    title: 'Manche 4 — Généralisation',
    subtitle: 'Et ce chien… le réseau le reconnaît-il ?',
    cardLabel: 'Chien non ambigu',
    cardEmoji: '🐶',
    inputs: { E1: 0, E2: 0, E3: 1 },
    expectedAnswer: 'CHIEN',
    learningNote: null,
    color: '#FF9F43',
  },
]
