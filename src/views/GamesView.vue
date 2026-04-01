<template>
  <div class="games-page">

    <div class="games-header">
      <h1 class="games-title">🎮 Les coulisses de l'IA</h1>
      <p class="games-desc">
        Comment l'IA analyse une image ? Elle utilise 3 opérations magiques.
        Lis l'explication… puis joue pour la comprendre !
      </p>
    </div>

    <!-- ── SECTION 1 : ReLU ─────────────────────────────────────────────── -->
    <section class="game-section" id="relu">
      <div class="section-expl">
        <div class="section-badge" style="background: #A78BFA22; color: #7c3aed; border-color: #A78BFA66;">
          ⚡ Étape 1
        </div>
        <h2 class="section-title" style="color: #7c3aed;">Fonction ReLU</h2>
        <p class="section-body">
          Après ses calculs, le réseau obtient des nombres positifs <em>et</em> négatifs.
          La <strong>ReLU</strong> fait une chose très simple :
          elle efface tous les négatifs (→ 0) et laisse les positifs intacts.
        </p>
        <p class="section-body">
          C'est comme un filtre : <strong>on garde ce qui compte, on jette le bruit.</strong>
          Sans ça, les erreurs se multiplieraient à chaque couche.
        </p>
        <div class="section-formula">
          <span class="formula-neg">-5 → 0</span>
          <span class="formula-sep">·</span>
          <span class="formula-pos">+3 → 3</span>
          <span class="formula-sep">·</span>
          <span class="formula-neg">-1 → 0</span>
          <span class="formula-sep">·</span>
          <span class="formula-pos">+7 → 7</span>
        </div>
      </div>
      <div class="section-game card">
        <ReluGame />
      </div>
    </section>

    <div class="section-divider">↓</div>

    <!-- ── SECTION 2 : Convolution ──────────────────────────────────────── -->
    <section class="game-section reverse" id="conv">
      <div class="section-expl">
        <div class="section-badge" style="background: #FF6B6B22; color: #dc2626; border-color: #FF6B6B66;">
          🔍 Étape 2
        </div>
        <h2 class="section-title" style="color: #dc2626;">Convolution</h2>
        <p class="section-body">
          L'IA ne regarde pas l'image entière d'un coup.
          Elle utilise une petite <strong>loupe 3×3</strong> (un filtre) qui glisse sur l'image case par case.
        </p>
        <p class="section-body">
          À chaque position, elle multiplie les pixels sous la loupe par les valeurs du filtre et additionne.
          Résultat : une nouvelle image qui <strong>met en valeur les bords, les courbes, les formes.</strong>
        </p>
        <div class="section-formula">
          <span class="formula-label">pixel × filtre = nouvelle valeur</span>
        </div>
      </div>
      <div class="section-game card">
        <ConvolutionGame />
      </div>
    </section>

    <div class="section-divider">↓</div>

    <!-- ── SECTION 3 : MaxPooling ───────────────────────────────────────── -->
    <section class="game-section" id="pool">
      <div class="section-expl">
        <div class="section-badge" style="background: #4ECDC422; color: #0f766e; border-color: #4ECDC466;">
          📐 Étape 3
        </div>
        <h2 class="section-title" style="color: #0f766e;">MaxPooling</h2>
        <p class="section-body">
          Après la convolution, l'image est grande et lourde à traiter.
          Le <strong>MaxPooling</strong> la réduit de moitié en gardant uniquement
          la valeur la plus forte dans chaque zone 2×2.
        </p>
        <p class="section-body">
          <strong>On garde l'essentiel, on jette le reste.</strong>
          L'IA devient plus rapide sans perdre les informations importantes.
        </p>
        <div class="section-formula">
          <div class="pool-example">
            <div class="pool-grid">
              <span class="pool-cell">3</span><span class="pool-cell winner">8</span>
              <span class="pool-cell">1</span><span class="pool-cell">4</span>
            </div>
            <span class="formula-sep">→</span>
            <span class="pool-result">8</span>
          </div>
        </div>
      </div>
      <div class="section-game card">
        <MaxPoolingGame />
      </div>
    </section>

    <!-- ── Bouton continuer ─────────────────────────────────────────────── -->
    <div class="continue-wrap">
      <p class="continue-hint">🎉 Tu as exploré toutes les couches de l'IA !</p>
      <button class="btn-continue" @click="continueToNext">
        🏆 Terminer le parcours →
      </button>
    </div>

  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { useProgressStore } from '../stores/progress.js'
import ReluGame        from '../components/ReluGame.vue'
import ConvolutionGame from '../components/ConvolutionGame.vue'
import MaxPoolingGame  from '../components/MaxPoolingGame.vue'

const router   = useRouter()
const progress = useProgressStore()

function continueToNext() {
  progress.completeStep('games')
  router.push(progress.nextRoute('games'))
}
</script>

<style scoped>
.games-page {
  display: flex;
  flex-direction: column;
  gap: 0;
  max-width: 1060px;
  margin: 0 auto;
}

/* ── Header ── */
.games-header {
  text-align: center;
  padding: 12px 0 36px;
}
.games-title {
  font-family: 'Fredoka One', cursive;
  font-size: clamp(26px, 4vw, 40px);
  margin-bottom: 10px;
}
.games-desc {
  font-size: 16px;
  color: #4b5563;
  line-height: 1.7;
  max-width: 580px;
  margin: 0 auto;
}

/* ── Section ── */
.game-section {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 32px;
  align-items: start;
  padding: 40px 0;
}
.game-section.reverse {
  direction: rtl;
}
.game-section.reverse > * {
  direction: ltr;
}

@media (max-width: 720px) {
  .game-section,
  .game-section.reverse {
    grid-template-columns: 1fr;
    direction: ltr;
  }
}

/* ── Côté explication ── */
.section-expl {
  display: flex;
  flex-direction: column;
  gap: 14px;
  padding-top: 8px;
}
.section-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 14px;
  border-radius: 50px;
  border: 1.5px solid;
  font-family: 'Fredoka One', cursive;
  font-size: 13px;
  align-self: flex-start;
}
.section-title {
  font-family: 'Fredoka One', cursive;
  font-size: clamp(22px, 3vw, 30px);
  line-height: 1.1;
}
.section-body {
  font-size: 15px;
  color: #374151;
  line-height: 1.75;
}

/* ── Formule visuelle ── */
.section-formula {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
  background: #f9fafb;
  border-radius: 14px;
  padding: 12px 16px;
  margin-top: 4px;
}
.formula-neg   { font-family: 'Fredoka One', cursive; font-size: 14px; color: #dc2626; background: #fee2e2; padding: 4px 10px; border-radius: 8px; }
.formula-pos   { font-family: 'Fredoka One', cursive; font-size: 14px; color: #16a34a; background: #dcfce7; padding: 4px 10px; border-radius: 8px; }
.formula-sep   { font-size: 18px; color: #9ca3af; }
.formula-label { font-family: 'Fredoka One', cursive; font-size: 14px; color: #374151; }

/* Exemple MaxPooling */
.pool-example {
  display: flex;
  align-items: center;
  gap: 12px;
}
.pool-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 4px;
}
.pool-cell {
  width: 36px; height: 36px;
  display: flex; align-items: center; justify-content: center;
  background: #f3f4f6; border-radius: 8px;
  font-family: 'Fredoka One', cursive; font-size: 16px;
  border: 1.5px solid #e5e7eb;
}
.pool-cell.winner {
  background: #dcfce7; border-color: #86efac; color: #166534;
}
.pool-result {
  font-family: 'Fredoka One', cursive; font-size: 28px; color: #166534;
}

/* ── Côté jeu ── */
.section-game {
  min-height: 300px;
}

/* ── Séparateur ── */
.section-divider {
  text-align: center;
  font-size: 28px;
  color: #d1d5db;
  padding: 8px 0;
}

/* ── Bouton continuer ── */
.continue-wrap {
  text-align: center;
  padding: 48px 0 16px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 14px;
}
.continue-hint {
  font-size: 18px;
  color: #4b5563;
  font-family: 'Fredoka One', cursive;
}
.btn-continue {
  font-family: 'Fredoka One', cursive;
  font-size: 20px;
  padding: 16px 48px;
  border-radius: 50px;
  border: none;
  background: #A78BFA;
  color: #fff;
  cursor: pointer;
  box-shadow: 0 8px 28px rgba(167, 139, 250, 0.4);
  transition: all 0.2s;
}
.btn-continue:hover {
  transform: translateY(-2px);
  box-shadow: 0 12px 32px rgba(167, 139, 250, 0.5);
}
</style>