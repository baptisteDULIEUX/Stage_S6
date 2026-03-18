<template>
  <div class="graph-wrapper">
    <svg
      :viewBox="`0 0 ${svgWidth} ${svgHeight}`"
      width="100%"
      xmlns="http://www.w3.org/2000/svg"
    >
      <!-- ══ ARÊTES ══════════════════════════════════════════════════════════ -->
      <g v-for="edge in edges" :key="edge.id">

        <path
          :d="edge.path"
          fill="none"
          :stroke="edgeStroke(edge)"
          :stroke-width="edge.weight === 0 ? 1 : Math.max(1.5, edge.weight * 0.7)"
          :stroke-dasharray="edge.weight === 0 ? '5 4' : undefined"
          :opacity="edge.weight === 0 ? 0.3 : 1"
        />

        <!-- Label du poids (seulement si > 0) -->
        <text
          v-if="edge.weight > 0"
          :x="edge.midX" :y="edge.midY - 7"
          class="edge-label"
          :fill="edgeLabelColor(edge)"
        >{{ edge.weight }}</text>

      </g>

      <!-- ══ NŒUDS ═══════════════════════════════════════════════════════════ -->

      <!-- ── Entrées ──────────────────────────────────────────────────────── -->
      <g
        v-for="id in nodesOfType('input')" :key="id"
        class="input-node-group"
        :class="{ 'input-node-disabled': !canToggle }"
        @click="canToggle && emit('toggle-input', id)"
      >
        <!-- Zone de clic invisible légèrement plus grande que l'ellipse -->
        <ellipse
          :cx="pos(id).x" :cy="pos(id).y"
          :rx="S.input.rx + 6" :ry="S.input.ry + 6"
          fill="transparent" stroke="none"
        />
        <ellipse
          :cx="pos(id).x" :cy="pos(id).y"
          :rx="S.input.rx" :ry="S.input.ry"
          :fill="inputFill(id)"
          :stroke="nodes[id].color ?? '#d1d5db'"
          :stroke-width="isActive(id) ? 2.5 : 1.5"
        />
        <!-- Hint "clique-moi" quand pas encore calculé -->
        <text
          v-if="canToggle"
          :x="pos(id).x" :y="pos(id).y - 22"
          class="node-hint"
        >cliquer</text>
        <text :x="pos(id).x" :y="pos(id).y - 7"  class="node-emoji">{{ nodes[id].emoji }}</text>
        <text :x="pos(id).x" :y="pos(id).y + 12" class="node-label-small">{{ nodes[id].label }}</text>
        <!-- Badge 0 / 1 -->
        <circle
          :cx="pos(id).x + S.input.rx - 10" :cy="pos(id).y - S.input.ry + 10" r="13"
          :fill="isActive(id) ? '#FFE66D' : '#e5e7eb'"
        />
        <text
          :x="pos(id).x + S.input.rx - 10" :y="pos(id).y - S.input.ry + 15"
          class="badge-text"
        >{{ ns(id)?.value ?? 0 }}</text>
      </g>

      <!-- ── Couches cachées ───────────────────────────────────────────────── -->
      <g v-for="id in nodesOfType('hidden')" :key="id">
        <circle
          :cx="pos(id).x" :cy="pos(id).y" :r="S.hidden.r"
          :fill="hiddenFill(id)"
          :stroke="isActive(id) ? '#38a169' : '#9ca3af'"
          :stroke-width="isActive(id) ? 2.5 : 1.5"
        />
        <text
          :x="pos(id).x"
          :y="showState && ns(id)?.sum !== undefined ? pos(id).y - 5 : pos(id).y + 5"
          class="node-label-hidden"
          :fill="isActive(id) ? '#fff' : '#374151'"
        >{{ id }}</text>
        <text
          v-if="showState && ns(id)?.sum !== undefined"
          :x="pos(id).x" :y="pos(id).y + 10"
          class="node-sum"
          :fill="isActive(id) ? '#e0fce8' : '#9ca3af'"
        >Σ={{ ns(id).sum }}</text>
      </g>

      <!-- ── Sorties ───────────────────────────────────────────────────────── -->
      <g v-for="id in nodesOfType('output')" :key="id">
        <ellipse
          :cx="pos(id).x" :cy="pos(id).y"
          :rx="S.output.rx" :ry="S.output.ry"
          :fill="outputFill(id)"
          :stroke="nodes[id].color ?? '#d1d5db'"
          :stroke-width="isWinner(id) ? 3 : 1.5"
          :opacity="showState && !isWinner(id) ? 0.4 : 1"
        />
        <text :x="pos(id).x" :y="pos(id).y - 6"  class="node-emoji">{{ nodes[id].emoji }}</text>
        <text :x="pos(id).x" :y="pos(id).y + 12" class="node-label-output">{{ nodes[id].label ?? id }}</text>
        <!-- Badge score -->
        <g v-if="showState">
          <circle
            :cx="pos(id).x + S.output.rx - 8" :cy="pos(id).y - S.output.ry + 10" r="14"
            :fill="nodes[id].color ?? '#888'"
          />
          <text
            :x="pos(id).x + S.output.rx - 8" :y="pos(id).y - S.output.ry + 15"
            class="badge-text" fill="#fff"
          >{{ ns(id)?.score ?? 0 }}</text>
        </g>
      </g>

      <!-- ══ LÉGENDE SEUIL ═══════════════════════════════════════════════════ -->
      <g v-if="showState">
        <rect
          :x="svgWidth / 2 - 90" :y="svgHeight - 30"
          width="180" height="24" rx="12"
          fill="#fff" stroke="#e5e7eb"
        />
        <text :x="svgWidth / 2" :y="svgHeight - 13" class="legend-text">
          Seuil d'activation : Σ ≥ {{ threshold }}
        </text>
      </g>
    </svg>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import {
  computePositions,
  computeEdges,
  deriveNodeTypes,
  NODE_SIZES,
} from '../composables/useNetworkLayout.js'

// ─── Props & emits ────────────────────────────────────────────────────────────
const props = defineProps({
  layerOrder:  { type: Array,  required: true },
  nodes:       { type: Object, required: true },
  connections: { type: Array,  required: true },
  weights:     { type: Object, default: () => ({}) },
  nodeStates:  { type: Object, default: null },
  threshold:   { type: Number, default: 2 },
  svgWidth:    { type: Number, default: 720 },
  svgHeight:   { type: Number, default: 620 },
  // Quand true : les nœuds d'entrée sont cliquables
  canToggle:   { type: Boolean, default: false },
})

const emit = defineEmits(['toggle-input'])

// ─── Layout ───────────────────────────────────────────────────────────────────
const positions  = computed(() => computePositions(props.layerOrder, props.nodes, props.svgWidth, props.svgHeight))
const nodeTypes  = computed(() => deriveNodeTypes(props.layerOrder, props.nodes))
const edges      = computed(() => computeEdges(props.connections, props.weights, positions.value, nodeTypes.value))

// ─── Raccourcis ───────────────────────────────────────────────────────────────
const S         = NODE_SIZES                          // alias court pour le template
const showState = computed(() => !!props.nodeStates)
const pos       = (id) => positions.value[id]
const ns        = (id) => props.nodeStates?.[id]      // nodeState

// Nœuds groupés par type (pour itérer dans le template dans le bon ordre)
const nodesOfType = (type) => computed(() =>
  props.layerOrder
    .flatMap(layerId =>
      Object.entries(props.nodes)
        .filter(([, n]) => n.layer === layerId)
        .map(([id]) => id)
    )
    .filter(id => nodeTypes.value[id] === type)
).value

// ─── État des nœuds ──────────────────────────────────────────────────────────
const isActive = (id) => showState.value && (ns(id)?.active ?? false)
const isWinner = (id) => showState.value && (ns(id)?.winner === true)

// ─── Couleurs des arêtes ─────────────────────────────────────────────────────
function isEdgeActive(edge) {
  return showState.value && edge.weight > 0 && ns(edge.from)?.active
}
function edgeStroke(edge) {
  return isEdgeActive(edge)
    ? (props.nodes[edge.from]?.color ?? '#888')
    : '#d1d5db'
}
function edgeLabelColor(edge) {
  // Labels H→sortie colorés par la destination
  if (nodeTypes.value[edge.to] === 'output') return props.nodes[edge.to]?.color ?? '#374151'
  return props.nodes[edge.from]?.color ?? '#374151'
}

// ─── Remplissages des nœuds ───────────────────────────────────────────────────
function inputFill(id) {
  if (!isActive(id)) return '#f9fafb'
  return (props.nodes[id]?.color ?? '#e5e7eb') + '22'
}
function hiddenFill(id) {
  return isActive(id) ? '#6BCB77' : '#f3f4f6'
}
function outputFill(id) {
  if (!showState.value) return '#f9fafb'
  if (isWinner(id)) return (props.nodes[id]?.color ?? '#e5e7eb') + '28'
  return '#f9fafb'
}
</script>

<style scoped>
.graph-wrapper { background: #fafafa; border-radius: 20px; padding: 8px; }

.edge-label {
  font-family: 'Nunito', sans-serif;
  font-size: 13px; font-weight: 800;
  text-anchor: middle; pointer-events: none;
}
.node-emoji        { font-size: 18px; text-anchor: middle; dominant-baseline: middle; pointer-events: none; }
.node-label-small  { font-family: 'Nunito', sans-serif; font-size: 11px; font-weight: 700; fill: #374151; text-anchor: middle; pointer-events: none; }
.node-label-hidden { font-family: 'Fredoka One', cursive; font-size: 14px; text-anchor: middle; dominant-baseline: middle; }
.node-label-output { font-family: 'Fredoka One', cursive; font-size: 13px; fill: #374151; text-anchor: middle; }
.node-sum          { font-family: 'Nunito', sans-serif; font-size: 11px; font-weight: 800; text-anchor: middle; }
.badge-text        { font-family: 'Fredoka One', cursive; font-size: 13px; text-anchor: middle; dominant-baseline: middle; }
.legend-text       { font-family: 'Nunito', sans-serif; font-size: 12px; fill: #6b7280; text-anchor: middle; }

/* ── Nœuds d'entrée interactifs ── */
.input-node-group           { cursor: pointer; }
.input-node-group:hover ellipse:nth-child(2) { filter: brightness(0.94); }
.input-node-disabled        { cursor: default; }
.input-node-disabled:hover ellipse:nth-child(2) { filter: none; }

.node-hint {
  font-family: 'Nunito', sans-serif;
  font-size: 10px;
  fill: #9ca3af;
  text-anchor: middle;
  pointer-events: none;
}
</style>
