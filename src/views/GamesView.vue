<template>
  <div class="games-page">

    <!-- ══════════════════════════════════════════════════════════════
         SECTION 1 — MODULE DESSIN
    ══════════════════════════════════════════════════════════════ -->
    <div class="page-header">
      <h1 class="page-title">✏️ Dessine, l'IA devine !</h1>
      <p class="page-desc">
        Dessine un chat ou un chien et regarde l'IA reconnaître ton dessin en temps réel.
      </p>
    </div>

    <!-- Etat du modele -->
    <div v-if="!model.isReady.value" class="model-status card">
      <div v-if="model.isLoading.value" class="status-loading">
        <span class="spinner">⏳</span> Chargement du modèle IA…
      </div>
      <div v-else-if="model.loadError.value" class="status-error">
        ⚠️ {{ model.loadError.value }}
        <br><small>Vérifie ta connexion et ouvre la console (F12) pour plus de détails.</small>
      </div>
    </div>

    <!-- Zone dessin + prediction -->
    <div class="drawing-section card">
      <div class="drawing-layout">

        <!-- Canvas -->
        <div class="drawing-col">
          <h2 class="section-label">🖊️ Ton dessin</h2>
          <DrawingCanvas
              ref="drawingCanvas"
              :size="380"
              :brush-size="10"
              :show-preview="true"
              @drawn="onDrawn"
          />
        </div>

        <!-- Prediction -->
        <div class="prediction-col">
          <h2 class="section-label">🤖 Ce que pense l'IA</h2>
          <PredictionBars :predictions="model.predictions.value" />

          <!-- Explication rapide du CNN -->
<!--          <div class="cnn-mini-explain">-->
<!--            <h3 class="mini-explain-title">💡 Comment l'IA voit ton dessin</h3>-->
<!--            <div class="cnn-steps">-->
<!--              <div class="cnn-step">-->
<!--                <span class="cnn-step-icon" style="background:#FF6B6B22; color:#FF6B6B">🔍</span>-->
<!--                <div>-->
<!--                  <strong>Convolution</strong>-->
<!--                  <p>Des filtres repèrent les bords et les formes</p>-->
<!--                </div>-->
<!--              </div>-->
<!--              <div class="cnn-arrow">↓</div>-->
<!--              <div class="cnn-step">-->
<!--                <span class="cnn-step-icon" style="background:#4ECDC422; color:#4ECDC4">📐</span>-->
<!--                <div>-->
<!--                  <strong>MaxPooling</strong>-->
<!--                  <p>L'image est réduite en gardant l'essentiel</p>-->
<!--                </div>-->
<!--              </div>-->
<!--              <div class="cnn-arrow">↓</div>-->
<!--              <div class="cnn-step">-->
<!--                <span class="cnn-step-icon" style="background:#A78BFA22; color:#A78BFA">⚡</span>-->
<!--                <div>-->
<!--                  <strong>ReLU</strong>-->
<!--                  <p>Les valeurs négatives sont effacées</p>-->
<!--                </div>-->
<!--              </div>-->
<!--              <div class="cnn-arrow">↓</div>-->
<!--              <div class="cnn-step">-->
<!--                <span class="cnn-step-icon" style="background:#6BCB7722; color:#6BCB77">🏆</span>-->
<!--                <div>-->
<!--                  <strong>Décision</strong>-->
<!--                  <p>🐱 Chat ou 🐶 Chien ?</p>-->
<!--                </div>-->
<!--              </div>-->
<!--            </div>-->
<!--            <p class="scroll-hint">👇 Joue aux mini-jeux ci-dessous pour comprendre chaque étape !</p>-->
<!--          </div>-->
        </div>

      </div>
    </div>

    <!-- ══════════════════════════════════════════════════════════════
         SEPARATEUR
    ══════════════════════════════════════════════════════════════ -->
    <div class="section-divider">
      <div class="divider-line" />
      <span class="divider-label">🎮 Comment ça marche ? Joue pour comprendre !</span>
      <div class="divider-line" />
    </div>

    <!-- ══════════════════════════════════════════════════════════════
         SECTION 2 — CONVOLUTION
    ══════════════════════════════════════════════════════════════ -->
    <div class="game-section">
      <div class="game-explain card" style="--accent:#FF6B6B; border-left-color:#FF6B6B">
        <div class="explain-header">
          <span class="explain-num" style="background:#FF6B6B">1</span>
          <div>
            <h2 class="explain-title" style="color:#FF6B6B">🔍 La Convolution</h2>
            <p class="explain-sub">La première étape : détecter les formes</p>
          </div>
        </div>
        <div class="explain-body">
          <p>
            Imagine une <strong>loupe magique</strong> qui glisse sur ton dessin, case par case.
            À chaque position, elle regarde un petit carré de 3×3 pixels et le multiplie par un
            <strong>filtre</strong> — une grille de nombres qui cherche un motif particulier
            (un bord, une courbe, un coin…).
          </p>
          <p>
            Le résultat est une nouvelle image qui <strong>met en évidence</strong> ce motif
            partout où il apparaît. L'IA utilise des dizaines de filtres différents en même temps !
          </p>
          <div class="explain-visual">
            <div class="visual-box" style="border-color:#FF6B6B22">
              <div class="visual-label">Image 4×4</div>
              <div class="mini-grid grid-4">
                <div v-for="(v,i) in [2,5,3,1,8,2,3,6,1,3,2,4,5,0,1,2]" :key="'c'+i" class="mini-cell">{{v}}</div>
              </div>
            </div>
            <div class="visual-op">×</div>
            <div class="visual-box" style="border-color:#FF6B6B22">
              <div class="visual-label">Filtre 3×3</div>
              <div class="mini-grid grid-3">
                <div v-for="(v,i) in [0,1,0,1,0,1,0,1,0]" :key="'f'+i" class="mini-cell filt">{{v}}</div>
              </div>
            </div>
            <div class="visual-op">=</div>
            <div class="visual-box" style="border-color:#FF6B6B22">
              <div class="visual-label">Résultat 3×3</div>
              <div class="mini-grid grid-3">
                <div v-for="(v,i) in ['?','?','?','?','?','?','?','?','?']" :key="'r'+i" class="mini-cell res">{{v}}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="game-container card">
        <h3 class="game-title">🎮 À toi de jouer — Convolution !</h3>
        <ConvolutionGame />
      </div>
    </div>

    <!-- ══════════════════════════════════════════════════════════════
         SECTION 3 — MAXPOOLING
    ══════════════════════════════════════════════════════════════ -->
    <div class="game-section">
      <div class="game-explain card" style="border-left-color:#4ECDC4">
        <div class="explain-header">
          <span class="explain-num" style="background:#4ECDC4">2</span>
          <div>
            <h2 class="explain-title" style="color:#4ECDC4">📐 Le MaxPooling</h2>
            <p class="explain-sub">Réduire sans perdre l'essentiel</p>
          </div>
        </div>
        <div class="explain-body">
          <p>
            Après la convolution, l'image est souvent très grande. Le <strong>MaxPooling</strong>
            la réduit de moitié en découpant l'image en blocs de <strong>2×2 pixels</strong>,
            puis en ne gardant que la <strong>valeur la plus grande</strong> de chaque bloc.
          </p>
          <p>
            C'est comme résumer un paragraphe en une phrase : on garde l'information la plus
            importante et on jette le reste. Ça rend l'IA plus rapide et plus robuste aux
            petits décalages dans le dessin !
          </p>
          <div class="explain-visual">
            <div class="visual-box" style="border-color:#4ECDC422">
              <div class="visual-label">Bloc 2×2</div>
              <div class="mini-grid grid-2">
                <div v-for="(v,i) in [3,8,1,5]" :key="'p'+i" class="mini-cell" :class="{winner: v===8}">{{v}}</div>
              </div>
            </div>
            <div class="visual-op">→ garde le max →</div>
            <div class="visual-box" style="border-color:#4ECDC422">
              <div class="visual-label">Résultat</div>
              <div class="mini-grid grid-1">
                <div class="mini-cell winner big">8</div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="game-container card">
        <h3 class="game-title">🎮 À toi de jouer — MaxPooling !</h3>
        <MaxPoolingGame />
      </div>
    </div>

    <!-- ══════════════════════════════════════════════════════════════
         SECTION 4 — RELU
    ══════════════════════════════════════════════════════════════ -->
    <div class="game-section">
      <div class="game-explain card" style="border-left-color:#A78BFA">
        <div class="explain-header">
          <span class="explain-num" style="background:#A78BFA">3</span>
          <div>
            <h2 class="explain-title" style="color:#A78BFA">⚡ La fonction ReLU</h2>
            <p class="explain-sub">Effacer le négatif, garder le positif</p>
          </div>
        </div>
        <div class="explain-body">
          <p>
            Après les calculs de convolution, certaines valeurs deviennent <strong>négatives</strong>.
            La fonction <strong>ReLU</strong> (Rectified Linear Unit) applique une règle simple :
            toute valeur négative devient <strong>0</strong>, les positives restent intactes.
          </p>
          <p>
            C'est un filtre "anti-négatif" : il garde uniquement les neurones
            <strong>actifs</strong> (qui ont détecté quelque chose) et éteint les autres.
            Sans ReLU, le réseau apprendrait beaucoup moins bien !
          </p>
          <div class="explain-visual relu-visual">
            <div class="relu-col">
              <div class="visual-label">Avant ReLU</div>
              <div class="relu-values">
                <div v-for="(v,i) in [-3, 7, -1, 4, -5, 2]" :key="'b'+i" class="relu-val" :class="{neg: v<0}">{{v}}</div>
              </div>
            </div>
            <div class="visual-op">→ ReLU →</div>
            <div class="relu-col">
              <div class="visual-label">Après ReLU</div>
              <div class="relu-values">
                <div v-for="(v,i) in [0, 7, 0, 4, 0, 2]" :key="'a'+i" class="relu-val" :class="{zero: v===0}">{{v}}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="game-container card">
        <h3 class="game-title">🎮 À toi de jouer — ReLU !</h3>
        <ReluGame />
      </div>
    </div>

    <!-- ══════════════════════════════════════════════════════════════
         BOUTON FIN DE PARCOURS
    ══════════════════════════════════════════════════════════════ -->
    <div class="finish-card card">
      <div class="finish-inner">
        <div class="finish-emoji">🏆</div>
        <div class="finish-text">
          <h2 class="finish-title">Tu as tout compris !</h2>
          <p class="finish-sub">
            Convolution, MaxPooling, ReLU… tu connais maintenant les briques d'une vraie IA !
            Retourne dessiner et regarde l'IA en action. 🎨
          </p>
        </div>
        <button class="btn-finish" @click="continueToNext">
          ✅ Terminer le parcours !
        </button>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import DrawingCanvas   from '../components/DrawingCanvas.vue'
import PredictionBars  from '../components/PredictionBars.vue'
import ConvolutionGame from '../components/ConvolutionGame.vue'
import MaxPoolingGame  from '../components/MaxPoolingGame.vue'
import ReluGame        from '../components/ReluGame.vue'
import { useDoodleModel }    from '../composables/useDoodleModel.js'
import { useProgressStore } from '../stores/progress.js'

const router   = useRouter()
const progress = useProgressStore()
const model    = useDoodleModel()
const drawingCanvas = ref(null)

onMounted(async () => {
  await model.loadModel()
  model.logLayerNames()
})

async function onDrawn(canvas28) {
  if (!model.isReady.value || !canvas28) return
  await model.predict(canvas28)
  await model.extractActivations(canvas28)
}

function continueToNext() {
  progress.completeStep('games')
  router.push('/')
}
</script>

<style scoped>
.games-page { display: flex; flex-direction: column; gap: 32px; }

/* -- Header -- */
.page-header { text-align: center; }
.page-title  { font-family: 'Fredoka One', cursive; font-size: clamp(28px, 4vw, 44px); margin-bottom: 8px; }
.page-desc   { font-size: 16px; color: #4b5563; line-height: 1.6; }

/* -- Etat modele -- */
.model-status { text-align: center; padding: 14px; background: #fffbeb; border: 2px solid #fcd34d; }
.status-loading { font-size: 15px; color: #374151; }
.status-error   { font-size: 14px; color: #dc2626; }
.spinner { display: inline-block; animation: spin 1s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }

/* -- Section dessin -- */
.drawing-layout {
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 28px;
  align-items: start;
}
@media (max-width: 800px) { .drawing-layout { grid-template-columns: 1fr; } }

.drawing-col, .prediction-col { display: flex; flex-direction: column; gap: 16px; }
.section-label { font-family: 'Fredoka One', cursive; font-size: 18px; margin-bottom: 4px; }

/* -- Mini explication CNN -- */
.cnn-mini-explain {
  background: #f9fafb; border-radius: 14px; padding: 16px; border: 1.5px solid #e5e7eb;
}
.mini-explain-title { font-family: 'Fredoka One', cursive; font-size: 15px; margin-bottom: 12px; }
.cnn-steps  { display: flex; flex-direction: column; gap: 4px; }
.cnn-step   { display: flex; align-items: flex-start; gap: 10px; }
.cnn-step-icon {
  width: 32px; height: 32px; border-radius: 8px;
  display: flex; align-items: center; justify-content: center; font-size: 16px; flex-shrink: 0;
}
.cnn-step strong { font-family: 'Fredoka One', cursive; font-size: 13px; display: block; }
.cnn-step p      { font-size: 12px; color: #6b7280; margin: 0; line-height: 1.4; }
.cnn-arrow       { font-size: 13px; color: #d1d5db; text-align: center; margin-left: 40px; }
.scroll-hint     { margin-top: 12px; font-size: 12px; color: #9ca3af; text-align: center; border-top: 1px solid #e5e7eb; padding-top: 10px; }

/* -- Separateur -- */
.section-divider { display: flex; align-items: center; gap: 16px; margin: 4px 0; }
.divider-line    { flex: 1; height: 2px; background: #e5e7eb; border-radius: 2px; }
.divider-label   { font-family: 'Fredoka One', cursive; font-size: 15px; color: #6b7280; white-space: nowrap; }

/* -- Sections jeux -- */
.game-section { display: flex; flex-direction: column; gap: 16px; }

/* -- Explication jeu -- */
.game-explain { border-left: 5px solid #e5e7eb; }
.explain-header { display: flex; align-items: flex-start; gap: 14px; margin-bottom: 16px; }
.explain-num {
  width: 36px; height: 36px; border-radius: 50%; background: #FF6B6B; color: #fff;
  font-family: 'Fredoka One', cursive; font-size: 20px;
  display: flex; align-items: center; justify-content: center; flex-shrink: 0;
}
.explain-title { font-family: 'Fredoka One', cursive; font-size: 22px; margin-bottom: 2px; }
.explain-sub   { font-size: 13px; color: #6b7280; }
.explain-body  { display: flex; flex-direction: column; gap: 12px; }
.explain-body p { font-size: 14px; color: #374151; line-height: 1.7; }

/* -- Visuel explicatif -- */
.explain-visual {
  display: flex; align-items: center; gap: 12px; flex-wrap: wrap;
  margin-top: 8px; padding: 16px; background: #f9fafb; border-radius: 12px;
}
.visual-box {
  display: flex; flex-direction: column; align-items: center; gap: 6px;
  border: 2px solid #e5e7eb; border-radius: 10px; padding: 10px 12px; background: #fff;
}
.visual-label { font-family: 'Fredoka One', cursive; font-size: 11px; color: #6b7280; }
.visual-op    { font-family: 'Fredoka One', cursive; font-size: 18px; color: #9ca3af; }

.mini-grid { display: grid; gap: 2px; }
.grid-4 { grid-template-columns: repeat(4, 24px); }
.grid-3 { grid-template-columns: repeat(3, 24px); }
.grid-2 { grid-template-columns: repeat(2, 24px); }
.grid-1 { grid-template-columns: repeat(1, 38px); }

.mini-cell {
  width: 24px; height: 24px; border-radius: 4px;
  display: flex; align-items: center; justify-content: center;
  font-family: 'Fredoka One', cursive; font-size: 10px;
  background: #f3f4f6; color: #374151; border: 1px solid #e5e7eb;
}
.mini-cell.filt   { background: #dbeafe; color: #1d4ed8; border-color: #93c5fd; }
.mini-cell.res    { background: #fef3c7; color: #92400e; border-color: #fcd34d; }
.mini-cell.winner { background: #dcfce7; color: #166534; border-color: #86efac; font-size: 12px; }
.mini-cell.big    { width: 38px; height: 38px; font-size: 18px; }

/* ReLU visuel */
.relu-visual  { gap: 16px; }
.relu-col     { display: flex; flex-direction: column; align-items: center; gap: 8px; }
.relu-values  { display: flex; gap: 4px; flex-wrap: wrap; justify-content: center; }
.relu-val {
  width: 32px; height: 32px; border-radius: 8px;
  display: flex; align-items: center; justify-content: center;
  font-family: 'Fredoka One', cursive; font-size: 13px;
  background: #dcfce7; color: #166534; border: 1.5px solid #86efac;
}
.relu-val.neg  { background: #fee2e2; color: #dc2626; border-color: #fca5a5; }
.relu-val.zero { background: #f3f4f6; color: #9ca3af; border-color: #e5e7eb; }

/* -- Container jeu -- */
.game-title {
  font-family: 'Fredoka One', cursive; font-size: 18px;
  margin-bottom: 16px; padding-bottom: 12px; border-bottom: 2px solid #f3f4f6;
}

/* -- Fin de parcours -- */
.finish-card { border: 2.5px solid var(--yellow); background: linear-gradient(135deg, #fffbeb, #fff9f0); }
.finish-inner { display: flex; align-items: center; gap: 20px; flex-wrap: wrap; }
.finish-emoji { font-size: 56px; flex-shrink: 0; animation: pulse 2s ease-in-out infinite; }
@keyframes pulse { 0%,100% { transform: scale(1); } 50% { transform: scale(1.1); } }
.finish-text  { flex: 1; min-width: 200px; }
.finish-title { font-family: 'Fredoka One', cursive; font-size: 22px; margin-bottom: 6px; }
.finish-sub   { font-size: 14px; color: #4b5563; line-height: 1.6; }
.btn-finish {
  font-family: 'Fredoka One', cursive; font-size: 18px; padding: 14px 32px;
  border-radius: 50px; border: none; background: var(--dark); color: var(--yellow);
  cursor: pointer; white-space: nowrap; flex-shrink: 0; transition: all 0.2s;
}
.btn-finish:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(45,48,71,0.3); }
</style>