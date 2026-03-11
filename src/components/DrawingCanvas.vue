<template>
  <div class="canvas-wrapper">

    <!-- Canvas de dessin principal -->
    <canvas
      ref="canvasEl"
      class="drawing-canvas"
      :width="size"
      :height="size"
      @mousedown="startDraw"
      @mousemove="draw"
      @mouseup="stopDraw"
      @mouseleave="stopDraw"
      @touchstart.prevent="startDrawTouch"
      @touchmove.prevent="drawTouch"
      @touchend.prevent="stopDraw"
    />

    <!-- Bouton effacer -->
    <button class="btn-clear" @click="clear">🗑️ Effacer</button>

    <!-- Aperçu 28×28 (debug pédagogique) -->
    <div v-if="showPreview" class="preview-block">
      <p class="preview-label">Ce que voit l'IA (28×28)</p>
      <canvas
        ref="previewEl"
        class="preview-canvas"
        :width="28"
        :height="28"
      />
    </div>

  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'

// ─── Props & emits ────────────────────────────────────────────────────────────
const props = defineProps({
  size:        { type: Number,  default: 280 },  // taille du canvas de dessin
  brushSize:   { type: Number,  default: 18  },  // épaisseur du trait
  showPreview: { type: Boolean, default: true },  // afficher l'aperçu 28×28
})

// Émet le canvas pré-traité dès qu'un tracé se termine
const emit = defineEmits(['drawn'])

// ─── Refs ─────────────────────────────────────────────────────────────────────
const canvasEl  = ref(null)
const previewEl = ref(null)
const isDrawing = ref(false)
let   lastX     = 0
let   lastY     = 0

// ─── Initialisation du canvas ─────────────────────────────────────────────────
onMounted(() => {
  const ctx = canvasEl.value.getContext('2d')
  ctx.fillStyle = '#000'       // fond noir (comme MNIST)
  ctx.fillRect(0, 0, props.size, props.size)
  ctx.strokeStyle = '#fff'     // trait blanc
  ctx.lineWidth   = props.brushSize
  ctx.lineCap     = 'round'
  ctx.lineJoin    = 'round'
})

// ─── Dessin souris ────────────────────────────────────────────────────────────
function getPos(e) {
  const rect = canvasEl.value.getBoundingClientRect()
  // Facteur de correction si le canvas CSS est différent de sa taille réelle
  const scaleX = props.size / rect.width
  const scaleY = props.size / rect.height
  return {
    x: (e.clientX - rect.left) * scaleX,
    y: (e.clientY - rect.top)  * scaleY,
  }
}

function startDraw(e) {
  isDrawing.value = true
  const { x, y } = getPos(e)
  lastX = x
  lastY = y
  // Point unique pour un simple clic
  const ctx = canvasEl.value.getContext('2d')
  ctx.beginPath()
  ctx.arc(x, y, props.brushSize / 2, 0, Math.PI * 2)
  ctx.fillStyle = '#fff'
  ctx.fill()
}

function draw(e) {
  if (!isDrawing.value) return
  const ctx     = canvasEl.value.getContext('2d')
  const { x, y } = getPos(e)
  ctx.beginPath()
  ctx.moveTo(lastX, lastY)
  ctx.lineTo(x, y)
  ctx.stroke()
  lastX = x
  lastY = y
}

function stopDraw() {
  if (!isDrawing.value) return
  isDrawing.value = false
  processAndEmit()
}

// ─── Dessin tactile ───────────────────────────────────────────────────────────
function getTouchPos(e) {
  const rect  = canvasEl.value.getBoundingClientRect()
  const touch = e.touches[0]
  const scaleX = props.size / rect.width
  const scaleY = props.size / rect.height
  return {
    x: (touch.clientX - rect.left) * scaleX,
    y: (touch.clientY - rect.top)  * scaleY,
  }
}

function startDrawTouch(e) {
  isDrawing.value = true
  const { x, y } = getTouchPos(e)
  lastX = x
  lastY = y
}

function drawTouch(e) {
  if (!isDrawing.value) return
  const ctx     = canvasEl.value.getContext('2d')
  const { x, y } = getTouchPos(e)
  ctx.beginPath()
  ctx.moveTo(lastX, lastY)
  ctx.lineTo(x, y)
  ctx.stroke()
  lastX = x
  lastY = y
}

// ─── Effacer ──────────────────────────────────────────────────────────────────
function clear() {
  const ctx = canvasEl.value.getContext('2d')
  ctx.fillStyle = '#000'
  ctx.fillRect(0, 0, props.size, props.size)
  // Effacer aussi l'aperçu
  if (previewEl.value) {
    const pCtx = previewEl.value.getContext('2d')
    pCtx.fillStyle = '#000'
    pCtx.fillRect(0, 0, 28, 28)
  }
  emit('drawn', null)
}

// ─── Prétraitement → 28×28 ────────────────────────────────────────────────────
// C'est l'étape clé : on extrait la bounding-box du tracé, on la centre,
// puis on redimensionne à 28×28 dans un canvas temporaire.
function processAndEmit() {
  const src = canvasEl.value
  const ctx = src.getContext('2d')

  // 1. Trouver la bounding-box du contenu dessiné
  const bb = getBoundingBox(ctx, props.size)

  if (!bb) {
    // Canvas vide
    emit('drawn', null)
    return
  }

  // 2. Créer un canvas temporaire 28×28
  const tmp    = document.createElement('canvas')
  tmp.width    = 28
  tmp.height   = 28
  const tCtx   = tmp.getContext('2d')

  // Fond noir
  tCtx.fillStyle = '#000'
  tCtx.fillRect(0, 0, 28, 28)

  // 3. Calculer une zone centrée avec une marge de 2px
  const margin   = 2
  const maxSide  = Math.max(bb.w, bb.h)
  const destSize = 28 - margin * 2
  const scale    = destSize / maxSide
  const destW    = bb.w * scale
  const destH    = bb.h * scale
  const destX    = (28 - destW) / 2
  const destY    = (28 - destH) / 2

  // 4. Copier la zone bounding-box → 28×28 centré
  tCtx.drawImage(src, bb.x, bb.y, bb.w, bb.h, destX, destY, destW, destH)

  // 5. Mettre à jour l'aperçu si activé
  if (props.showPreview && previewEl.value) {
    const pCtx = previewEl.value.getContext('2d')
    pCtx.drawImage(tmp, 0, 0)
  }

  // 6. Émettre le canvas 28×28 traité
  emit('drawn', tmp)
}

// Scanne le canvas pixel par pixel pour trouver les bornes du tracé blanc
function getBoundingBox(ctx, size) {
  const data = ctx.getImageData(0, 0, size, size).data
  let minX = size, minY = size, maxX = 0, maxY = 0
  let found = false

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      // Canal rouge (suffisant car on dessine en blanc = R,G,B tous > 0)
      const r = data[(y * size + x) * 4]
      if (r > 10) {     // seuil léger pour ignorer l'antialiasing
        found = true
        if (x < minX) minX = x
        if (x > maxX) maxX = x
        if (y < minY) minY = y
        if (y > maxY) maxY = y
      }
    }
  }

  if (!found) return null
  return { x: minX, y: minY, w: maxX - minX + 1, h: maxY - minY + 1 }
}

// Exposer clear() pour que le parent puisse effacer programmatiquement
defineExpose({ clear })
</script>

<style scoped>
.canvas-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}

.drawing-canvas {
  border-radius: 16px;
  border: 3px solid #e5e7eb;
  cursor: crosshair;
  touch-action: none;   /* désactive le scroll tactile sur le canvas */
  /* Le canvas s'adapte à la largeur du parent mais garde le ratio */
  max-width: 100%;
  box-shadow: 0 4px 16px rgba(0,0,0,0.12);
}

.btn-clear {
  font-family: 'Fredoka One', cursive;
  font-size: 15px;
  padding: 8px 22px;
  border-radius: 50px;
  border: 2px solid #e5e7eb;
  background: #fff;
  color: #374151;
  cursor: pointer;
}
.btn-clear:hover { background: #f9fafb; border-color: #d1d5db; }

.preview-block {
  text-align: center;
}
.preview-label {
  font-size: 11px;
  color: #9ca3af;
  margin-bottom: 6px;
}
.preview-canvas {
  /* Agrandi visuellement mais les données restent 28×28 */
  width: 84px;
  height: 84px;
  image-rendering: pixelated;   /* pas de lissage → on voit les pixels */
  border: 2px solid #e5e7eb;
  border-radius: 8px;
}
</style>
