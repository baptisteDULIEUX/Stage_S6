git <template>
  <div class="graph-wrapper">
    <svg
        viewBox="0 0 720 640"
        width="100%"
        xmlns="http://www.w3.org/2000/svg"
        class="network-svg"
    >
      <!-- ══ 1. Arêtes Entrées → Cachés ══ -->
      <g class="edges-layer">
        <g v-for="edge in inputToHiddenEdges" :key="edge.id">
          <path
              :d="edge.path"
              class="edge-base"
              :class="{
              'edge-zero':   edge.weight === 0,
              'edge-active': computed_result && edge.weight > 0 && isInputActive(edge.inputIdx),
            }"
              fill="none"
              :stroke="computed_result && edge.weight > 0 && isInputActive(edge.inputIdx)
              ? inputColors[edge.inputIdx] : undefined"
              :stroke-width="edge.weight === 0 ? 1 : Math.max(1.5, edge.weight * 0.8)"
          />
          <text
              v-if="edge.weight > 0"
              :x="edge.midX"
              :y="edge.midY - 6"
              class="edge-label"
              :fill="inputColors[edge.inputIdx]"
          >{{ edge.weight }}</text>
        </g>
      </g>

      <!-- ══ 2. Arêtes Cachés → Sorties ══ -->
      <g class="edges-layer">
        <g v-for="edge in hiddenToOutputEdges" :key="edge.id">
          <path
              :d="edge.path"
              class="edge-base"
              :class="{
              'edge-zero':   edge.weight === 0,
              'edge-active': computed_result && edge.weight > 0 && isHiddenActive(edge.hiddenIdx),
            }"
              fill="none"
              :stroke="computed_result && edge.weight > 0 && isHiddenActive(edge.hiddenIdx)
              ? outputColors[edge.outputIdx] : undefined"
              :stroke-width="edge.weight === 0 ? 1 : 2.5"
          />
          <text
              v-if="edge.weight > 0"
              :x="edge.midX"
              :y="edge.midY - 6"
              class="edge-label"
              :fill="outputColors[edge.outputIdx]"
          >{{ edge.weight }}</text>
        </g>
      </g>

      <!-- ══ 3. Nœuds Entrées ══ -->
      <g v-for="(node, i) in inputNodes" :key="node.id">
        <ellipse
            :cx="node.x" :cy="node.y"
            rx="68" ry="36"
            class="node-input"
            :style="inputs[i] === 1 ? `fill: ${inputColors[i]}22; stroke: ${inputColors[i]}` : ''"
        />
        <text :x="node.x" :y="node.y - 8" class="node-emoji">{{ node.emoji }}</text>
        <text :x="node.x" :y="node.y + 10" class="node-label-input">{{ node.label }}</text>
        <circle :cx="node.x + 60" :cy="node.y - 26" r="14"
                :style="inputs[i] === 1 ? 'fill:#FFE66D' : 'fill:#e0e0e0'" />
        <text :x="node.x + 60" :y="node.y - 21" class="badge-text">{{ inputs[i] }}</text>
      </g>

      <!-- ══ 4. Nœuds Cachés ══ -->
      <g v-for="(node, i) in hiddenNodes" :key="node.id">
        <circle
            :cx="node.x" :cy="node.y" r="28"
            class="node-hidden"
            :class="{
            'node-hidden-active':   computed_result && hiddenState[i]?.active,
            'node-hidden-inactive': computed_result && !hiddenState[i]?.active,
          }"
        />
        <text :x="node.x" :y="node.y - 4" class="node-label-hidden">{{ node.id }}</text>
        <text
            v-if="computed_result"
            :x="node.x" :y="node.y + 12"
            class="node-sum"
            :fill="hiddenState[i]?.active ? '#fff' : '#aaa'"
        >{{ hiddenState[i]?.sum }}</text>
      </g>

      <!-- ══ 5. Nœuds Sortie ══ -->
      <g v-for="(node, i) in outputNodes" :key="node.id">
        <ellipse
            :cx="node.x" :cy="node.y"
            rx="58" ry="34"
            class="node-output"
            :class="{
            'node-output-winner': computed_result && result?.prediction === node.id,
            'node-output-loser':  computed_result && result?.prediction !== node.id,
          }"
            :style="computed_result && result?.prediction === node.id
            ? `fill: ${outputColors[i]}33; stroke: ${outputColors[i]}; stroke-width: 3` : ''"
        />
        <text :x="node.x" :y="node.y - 6" class="node-emoji">{{ node.emoji }}</text>
        <text :x="node.x" :y="node.y + 12" class="node-label-output">{{ node.id }}</text>
        <g v-if="computed_result">
          <circle :cx="node.x + 48" :cy="node.y - 28" r="16"
                  :style="`fill: ${outputColors[i]}`" />
          <text :x="node.x + 48" :y="node.y - 22" class="score-text">
            {{ result?.outputScores[i] }}
          </text>
        </g>
      </g>

      <!-- ══ 6. Légende seuil ══ -->
      <g v-if="computed_result">
        <rect x="270" y="598" width="180" height="28" rx="14"
              fill="#fff" stroke="#ccc" stroke-width="1" />
        <text x="360" y="617" class="legend-text">Seuil d'activation : ≥ 2</text>
      </g>
    </svg>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  inputs:      { type: Array,  default: () => [0, 0, 0] },
  weights:     { type: Object, required: true },
  hiddenState: { type: Array,  default: () => [] },
  result:      { type: Object, default: null },
})

// Tout s'affiche dès que result est disponible
const computed_result = computed(() => !!props.result)

// ── Helpers ───────────────────────────────────────────────────────────────────
const isInputActive  = (idx) => props.inputs[idx] === 1
const isHiddenActive = (idx) => props.hiddenState[idx]?.active

// ── Palette ───────────────────────────────────────────────────────────────────
const inputColors  = ['#FF6B6B', '#4ECDC4', '#A78BFA']   // E1, E2, E3
const outputColors = ['#F59E0B', '#3B82F6']                // CHAT, CHIEN

// ── Positions des nœuds ───────────────────────────────────────────────────────
const inputNodes = [
  { id: 'E1', label: 'Moustaches',     emoji: '', x: 100, y: 140 },
  { id: 'E2', label: 'Oreilles ptues', emoji: '', x: 100, y: 320 },
  { id: 'E3', label: 'Yeux ronds',     emoji: '', x: 100, y: 500 },
]

const hiddenNodes = [
  { id: 'H1', x: 330, y: 90  },
  { id: 'H2', x: 330, y: 210 },
  { id: 'H3', x: 330, y: 330 },
  { id: 'H4', x: 330, y: 450 },
  { id: 'H5', x: 330, y: 570 },
]

const outputNodes = [
  { id: 'CHAT',  emoji: '', x: 590, y: 220 },
  { id: 'CHIEN', emoji: '', x: 590, y: 440 },
]

// ── Construction des chemins SVG (cubique bezier) ────────────────────────────
function makePath(x1, y1, x2, y2) {
  const dx = x2 - x1
  return `M ${x1} ${y1} C ${x1 + dx * 0.45} ${y1}, ${x2 - dx * 0.45} ${y2}, ${x2} ${y2}`
}

function midPoint(x1, y1, x2, y2) {
  return { x: (x1 + x2) / 2, y: (y1 + y2) / 2 }
}

// Arêtes Entrées → Cachés
const inputToHiddenEdges = computed(() => {
  const edges = []
  inputNodes.forEach((inp, ei) => {
    hiddenNodes.forEach((hid, hi) => {
      const weight = props.weights.inputToHidden[hi][ei]
      const mid = midPoint(inp.x + 68, inp.y, hid.x - 28, hid.y)
      edges.push({
        id:       `e-${ei}-${hi}`,
        inputIdx:  ei,
        hiddenIdx: hi,
        weight,
        path:    makePath(inp.x + 68, inp.y, hid.x - 28, hid.y),
        midX:    mid.x,
        midY:    mid.y,
      })
    })
  })
  return edges
})

// Arêtes Cachés → Sorties
const hiddenToOutputEdges = computed(() => {
  const edges = []
  hiddenNodes.forEach((hid, hi) => {
    outputNodes.forEach((out, oi) => {
      const weight = props.weights.hiddenToOutput[hi][oi]
      const mid = midPoint(hid.x + 28, hid.y, out.x - 58, out.y)
      edges.push({
        id:        `h-${hi}-${oi}`,
        hiddenIdx:  hi,
        outputIdx:  oi,
        weight,
        path:     makePath(hid.x + 28, hid.y, out.x - 58, out.y),
        midX:     mid.x,
        midY:     mid.y,
      })
    })
  })
  return edges
})
</script>

<style scoped>
.graph-wrapper {
  background: #fafafa;
  border-radius: 20px;
  padding: 8px;
}

/* ── Arêtes ── */
.edge-base  { stroke: #d1d5db; }
.edge-zero  { stroke: #e9ecef; stroke-dasharray: 4 4; }
.edge-active { stroke-linecap: round; }

/* ── Labels arêtes ── */
.edge-label {
  font-family: 'Nunito', sans-serif;
  font-size: 13px;
  font-weight: 800;
  text-anchor: middle;
  pointer-events: none;
}

/* ── Nœuds Entrées ── */
.node-input { stroke: #d1d5db; stroke-width: 2; fill: #f3f4f6; }

/* ── Nœuds Cachés ── */
.node-hidden         { stroke: #9ca3af;  stroke-width: 2;   fill: #f3f4f6; }
.node-hidden-active  { fill: #6BCB77;    stroke: #38a169;   stroke-width: 3; }
.node-hidden-inactive{ fill: #f3f4f6;    stroke: #d1d5db;   stroke-width: 1.5; }

/* ── Nœuds Sortie ── */
.node-output        { stroke: #d1d5db; stroke-width: 2; fill: #f9fafb; }
.node-output-winner { stroke-width: 3; }
.node-output-loser  { opacity: 0.4; }

/* ── Textes ── */
.node-emoji { font-size: 20px; text-anchor: middle; pointer-events: none; }
.node-label-input {
  font-family: 'Nunito', sans-serif;
  font-size: 12px; font-weight: 700; fill: #374151; text-anchor: middle;
}
.node-label-hidden {
  font-family: 'Fredoka One', cursive;
  font-size: 16px; fill: #374151; text-anchor: middle;
}
.node-label-output {
  font-family: 'Fredoka One', cursive;
  font-size: 14px; fill: #374151; text-anchor: middle;
}
.node-sum   { font-family: 'Nunito', sans-serif; font-size: 13px; font-weight: 900; text-anchor: middle; }
.badge-text { font-family: 'Fredoka One', cursive; font-size: 14px; fill: #374151; text-anchor: middle; }
.score-text { font-family: 'Fredoka One', cursive; font-size: 15px; fill: #fff; text-anchor: middle; }
.legend-text{ font-family: 'Nunito', sans-serif; font-size: 12px; fill: #6b7280; text-anchor: middle; }
</style>
