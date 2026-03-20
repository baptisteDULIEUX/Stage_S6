<template>
  <div class="bio-game">

    <!-- ── Départ ── -->
    <div v-if="phase === 'start'" class="start-screen">
      <div class="start-icon">🧠</div>
      <h2 class="start-title">Qui a combien de neurones ?</h2>
      <p class="start-sub">Glisse chaque carte sur le bon animal !</p>
      <div class="start-rule">
        🃏 En bas : les cartes
        <strong style="color:#0f766e">neurones</strong> et
        <strong style="color:#5b21b6">capacités</strong><br>
        🐾 En haut : les animaux à compléter<br>
        👆 Glisse chaque carte dans la bonne case !
      </div>
      <button class="game-btn" @click="initGame">▶ Commencer !</button>
    </div>

    <!-- ── Jeu ── -->
    <template v-else-if="phase === 'game'">

      <div class="stats-bar">
        <div class="chip" :class="{ done: totalPlaced === PAIRS.length * 2 }">
          ✅ {{ totalPlaced }} / {{ PAIRS.length * 2 }} cartes placées
        </div>
        <div class="chip">✖ {{ errors }} erreur{{ errors > 1 ? 's' : '' }}</div>
      </div>

      <div class="feedback-row" :class="feedback">
        <template v-if="feedback === 'correct'">✅ Bonne carte !</template>
        <template v-else-if="feedback === 'wrong'">Ce n'est pas le bon animal !</template>
        <template v-else>Glisse les cartes dans la bonne case !</template>
      </div>

      <!-- Zones animaux (drop targets) -->
      <div class="animals-row">
        <div
            v-for="p in PAIRS" :key="p.id"
            class="animal-zone"
            :data-id="p.id"
            :class="{
            'drag-over':  dragOverZone === p.id,
            'complete':   isComplete(p.id),
            'wrong-drop': wrongZone === p.id,
          }"
            @dragover.prevent="dragOverZone = p.id"
            @dragleave="dragOverZone = null"
            @drop.prevent="onDrop(p.id)"
        >
          <div class="az-emoji">{{ p.emoji }}</div>
          <div class="az-name">{{ p.name }}</div>
          <div class="az-slots">
            <div class="az-slot" :class="placed[`${p.id}-neurons`] ? 'filled neurons' : 'empty'">
              {{ placed[`${p.id}-neurons`] ? p.neurons : 'neurones ?' }}
            </div>
            <div class="az-slot" :class="placed[`${p.id}-skill`] ? 'filled skill' : 'empty'">
              {{ placed[`${p.id}-skill`] ? p.skill : 'capacité ?' }}
            </div>
          </div>
        </div>
      </div>

      <!-- Cartes à glisser -->
      <div>
        <p class="pool-label">🃏 Glisse ces cartes sur le bon animal !</p>
        <div class="cards-pool">
          <div
              v-for="card in availableCards"
              :key="card.key"
              class="drag-card"
              :class="card.cls"
              draggable="true"
              @dragstart="onDragStart(card.key)"
              @dragend="onDragEnd"
              @touchstart.prevent="onTouchStart($event, card.key)"
              @touchmove.prevent="onTouchMove"
              @touchend.prevent="onTouchEnd"
          >
            {{ card.label }}
          </div>
        </div>
      </div>

    </template>

    <!-- ── Victoire ── -->
    <div v-else-if="phase === 'victory'" class="victory">
      <div class="victory-emoji">{{ victoryEmoji }}</div>
      <h2 class="victory-title">Toutes les cartes placées !</h2>
      <p class="victory-sub">{{ victoryMsg }}</p>
      <div class="medals">
        <div class="medal">
          <div class="medal-val">{{ PAIRS.length * 2 }}</div>
          <div class="medal-lbl">cartes placées</div>
        </div>
        <div class="medal">
          <div class="medal-val">{{ errors }}</div>
          <div class="medal-lbl">erreurs</div>
        </div>
        <div class="medal">
          <div class="medal-val">{{ accuracy }}%</div>
          <div class="medal-lbl">précision</div>
        </div>
      </div>
      <button class="game-btn" @click="initGame">🔄 Rejouer</button>
    </div>

  </div>
</template>

<script setup>
import { ref, computed, reactive } from 'vue'

// ─── Données ──────────────────────────────────────────────────────────────────
const PAIRS = [
  { id: 0, emoji: '🐜', name: 'Fourmi',  neurons: '250 000 neurones',        skill: 'construit des galeries complexes' },
  { id: 1, emoji: '🐶', name: 'Chien',   neurons: '530 millions de neurones', skill: 'reconnaît les émotions humaines'  },
  { id: 2, emoji: '🧑', name: 'Humain',  neurons: '86 milliards de neurones', skill: 'parle, crée et imagine'           },
  { id: 3, emoji: '🤖', name: 'IA',      neurons: '~1 000 neurones',          skill: 'reconnaît des chiffres dessinés'  },
]

// ─── État ─────────────────────────────────────────────────────────────────────
const phase       = ref('start')
const placed      = reactive({})  // clé: 'id-type' → true
const errors      = ref(0)
const feedback    = ref('')
const dragOverZone = ref(null)
const wrongZone   = ref(null)

// Drag & drop
let dragKey    = null

// Touch
let touchKey   = null
let touchClone = null

// ─── Computed ─────────────────────────────────────────────────────────────────
const totalPlaced = computed(() => Object.keys(placed).length)

function isComplete(id) {
  return placed[`${id}-neurons`] && placed[`${id}-skill`]
}

const availableCards = computed(() => {
  const all = [
    ...PAIRS.map(p => ({ key: `${p.id}-neurons`, label: p.neurons, cls: 'neurons-card' })),
    ...PAIRS.map(p => ({ key: `${p.id}-skill`,   label: p.skill,   cls: 'skill-card'   })),
  ]
  return all.filter(c => !placed[c.key]).sort(() => Math.random() - 0.5)
})

const accuracy = computed(() =>
    Math.round(PAIRS.length * 2 / (PAIRS.length * 2 + errors.value) * 100)
)

const victoryEmoji = computed(() => {
  const e = errors.value
  if (e === 0) return '🏆'
  if (e < 3)  return '🎯'
  if (e < 6)  return '😄'
  return '🙂'
})

const victoryMsg = computed(() => {
  const e = errors.value
  if (e === 0) return 'Parfait ! Aucune erreur !'
  if (e < 3)  return 'Très bien, presque parfait !'
  return 'Bien joué, tu as tout trouvé !'
})

// ─── Logique ──────────────────────────────────────────────────────────────────
function initGame() {
  Object.keys(placed).forEach(k => delete placed[k])
  errors.value      = 0
  feedback.value    = ''
  dragOverZone.value = null
  wrongZone.value   = null
  dragKey           = null
  phase.value       = 'game'
}

function applyDrop(cardKey, zoneId) {
  const [cardId] = cardKey.split('-')
  if (parseInt(cardId) === zoneId) {
    placed[cardKey] = true
    feedback.value  = 'correct'
    if (totalPlaced.value >= PAIRS.length * 2) {
      setTimeout(() => { phase.value = 'victory' }, 500)
    }
  } else {
    errors.value++
    feedback.value = 'wrong'
    wrongZone.value = zoneId
    setTimeout(() => { wrongZone.value = null }, 400)
  }
}

// ─── Drag souris ──────────────────────────────────────────────────────────────
function onDragStart(key) {
  dragKey = key
}

function onDragEnd() {
  dragKey = null
  dragOverZone.value = null
}

function onDrop(zoneId) {
  dragOverZone.value = null
  if (!dragKey) return
  applyDrop(dragKey, zoneId)
  dragKey = null
}

// ─── Touch (tablettes) ────────────────────────────────────────────────────────
function onTouchStart(e, key) {
  touchKey = key
  const src = e.currentTarget
  touchClone = src.cloneNode(true)
  Object.assign(touchClone.style, {
    position: 'fixed', pointerEvents: 'none', opacity: '0.85',
    zIndex: '9999', borderRadius: '12px', padding: '8px 12px',
    fontFamily: "'Fredoka One', cursive", fontSize: '12px',
    background: key.includes('neurons') ? '#e0fafa' : '#ede9fe',
    border: `2px solid ${key.includes('neurons') ? '#4ECDC4' : '#A78BFA'}`,
    color: key.includes('neurons') ? '#0f766e' : '#5b21b6',
  })
  document.body.appendChild(touchClone)
  moveTouchClone(e.touches[0])
}

function onTouchMove(e) {
  moveTouchClone(e.touches[0])
  document.querySelectorAll('.animal-zone').forEach(z => z.classList.remove('drag-over'))
  const el = document.elementFromPoint(e.touches[0].clientX, e.touches[0].clientY)
  el?.closest('.animal-zone')?.classList.add('drag-over')
}

function onTouchEnd(e) {
  if (touchClone) { touchClone.remove(); touchClone = null }
  document.querySelectorAll('.animal-zone').forEach(z => z.classList.remove('drag-over'))
  const touch = e.changedTouches[0]
  const el = document.elementFromPoint(touch.clientX, touch.clientY)
  const zone = el?.closest('.animal-zone')
  if (zone && touchKey) {
    const zoneId = parseInt(zone.dataset.id)
    applyDrop(touchKey, zoneId)
  }
  touchKey = null
}

function moveTouchClone(touch) {
  if (!touchClone) return
  touchClone.style.left = (touch.clientX - 60) + 'px'
  touchClone.style.top  = (touch.clientY - 20) + 'px'
}
</script>

<style scoped>
.bio-game { display: flex; flex-direction: column; gap: 14px; }

/* ── Départ ── */
.start-screen { text-align: center; padding: 16px 0; display: flex; flex-direction: column; align-items: center; gap: 14px; }
.start-icon  { font-size: 60px; line-height: 1; }
.start-title { font-family: 'Fredoka One', cursive; font-size: 24px; }
.start-sub   { font-size: 14px; color: #4b5563; line-height: 1.6; max-width: 340px; }
.start-rule  {
  background: #f9fafb; border: 1.5px solid #e5e7eb; border-radius: 14px;
  padding: 12px 16px; font-size: 13px; color: #374151;
  max-width: 320px; line-height: 1.9; text-align: left;
}

/* ── Stats ── */
.stats-bar { display: flex; gap: 10px; flex-wrap: wrap; }
.chip { background: #f9fafb; border: 1.5px solid #e5e7eb; border-radius: 50px; padding: 5px 14px; font-family: 'Fredoka One', cursive; font-size: 14px; color: #6b7280; }
.chip.done { background: #f0fdf4; color: #166534; border-color: #86efac; }

/* ── Feedback ── */
.feedback-row { text-align: center; font-family: 'Fredoka One', cursive; font-size: 15px; min-height: 22px; color: #6b7280; }
.feedback-row.correct { color: #16a34a; }
.feedback-row.wrong   { color: #dc2626; }

/* ── Zones animaux ── */
.animals-row { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; }
@media (max-width: 500px) { .animals-row { grid-template-columns: repeat(2, 1fr); } }

.animal-zone {
  border-radius: 16px; border: 2.5px dashed #e5e7eb;
  background: #f9fafb; padding: 10px 8px; text-align: center;
  min-height: 160px; transition: all 0.15s;
}
.animal-zone.drag-over  { border-color: #4ECDC4; background: #4ECDC411; transform: scale(1.03); }
.animal-zone.complete   { border-color: #6BCB77; border-style: solid; background: #f0fdf4; }
.animal-zone.wrong-drop { border-color: #FF6B6B; border-style: solid; animation: shake 0.3s; }
@keyframes shake { 0%,100%{transform:translateX(0)} 25%{transform:translateX(-5px)} 75%{transform:translateX(5px)} }

.az-emoji { font-size: 34px; line-height: 1; margin-bottom: 4px; }
.az-name  { font-family: 'Fredoka One', cursive; font-size: 14px; margin-bottom: 8px; }
.az-slots { display: flex; flex-direction: column; gap: 5px; }
.az-slot  {
  border-radius: 8px; padding: 5px 6px; font-size: 10px;
  line-height: 1.3; min-height: 30px;
  display: flex; align-items: center; justify-content: center; text-align: center;
}
.az-slot.empty   { border: 1.5px dashed #e5e7eb; color: #9ca3af; }
.az-slot.filled  { font-family: 'Fredoka One', cursive; font-size: 10px; color: #fff; }
.az-slot.neurons { background: #4ECDC4; }
.az-slot.skill   { background: #A78BFA; }

/* ── Cartes à glisser ── */
.pool-label  { font-family: 'Fredoka One', cursive; font-size: 14px; color: #6b7280; margin-bottom: 10px; text-align: center; }
.cards-pool  { display: flex; flex-wrap: wrap; gap: 8px; justify-content: center; min-height: 40px; }
.drag-card   {
  border-radius: 12px; padding: 8px 12px;
  font-family: 'Fredoka One', cursive; font-size: 12px; line-height: 1.3;
  border: 2px solid; cursor: grab; transition: transform 0.1s;
  user-select: none; text-align: center; max-width: 140px;
}
.drag-card:active     { cursor: grabbing; }
.drag-card.neurons-card { background: #e0fafa; border-color: #4ECDC4; color: #0f766e; }
.drag-card.skill-card   { background: #ede9fe; border-color: #A78BFA; color: #5b21b6; }
.drag-card:hover { transform: scale(1.05); }

/* ── Victoire ── */
.victory { text-align: center; padding: 16px 0; display: flex; flex-direction: column; align-items: center; gap: 12px; }
.victory-emoji { font-size: 60px; line-height: 1; }
.victory-title { font-family: 'Fredoka One', cursive; font-size: 24px; }
.victory-sub   { font-size: 14px; color: #4b5563; line-height: 1.6; max-width: 340px; }
.medals { display: flex; gap: 10px; flex-wrap: wrap; justify-content: center; }
.medal  { background: #fff; border: 1.5px solid #e5e7eb; border-radius: 12px; padding: 10px 18px; text-align: center; }
.medal-val { font-family: 'Fredoka One', cursive; font-size: 22px; }
.medal-lbl { font-size: 11px; color: #9ca3af; }

/* ── Bouton ── */
.game-btn { font-family: 'Fredoka One', cursive; font-size: 17px; padding: 12px 28px; border-radius: 50px; border: none; background: #4ECDC4; color: #fff; cursor: pointer; }
</style>
