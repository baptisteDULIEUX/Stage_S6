<template>
  <div class="app-root">

    <!-- ── Header ── -->
    <header class="app-header">
      <div class="header-inner">

        <!-- Brand -->
        <RouterLink to="/" class="nav-brand">
          <p>home</p>
        </RouterLink>

        <!-- Barre de progression du parcours -->
        <nav class="journey-bar" aria-label="Parcours">
          <div class="journey-track">
            <template v-for="(step, idx) in JOURNEY" :key="step.id">

              <!-- Ligne de connexion entre étapes -->
              <div
                  v-if="idx > 0"
                  class="journey-connector"
                  :class="{ done: progress.isCompleted(JOURNEY[idx - 1].id) }"
              />

              <!-- Pastille d'étape -->
              <button
                  class="journey-step"
                  :class="{
                  completed:  progress.isCompleted(step.id),
                  current:    isCurrent(idx),
                  locked:     !progress.isUnlocked(step.id) && !progress.isCompleted(step.id),
                }"
                  :style="stepStyle(step, idx)"
                  :disabled="!progress.isUnlocked(step.id) && !progress.isCompleted(step.id)"
                  :title="step.label"
                  @click="navigate(step)"
              >
                <span class="step-emoji">
                  {{ progress.isCompleted(step.id) ? '✅' : progress.isUnlocked(step.id) ? step.emoji : '🔒' }}
                </span>
                <span class="step-label">{{ step.label }}</span>
              </button>

            </template>
          </div>
        </nav>

        <!-- Bouton reset (petit, discret) -->
        <button class="reset-btn" title="Recommencer depuis le début" @click="confirmReset">
          🔄
        </button>

      </div>
    </header>

    <!-- ── Contenu principal ── -->
    <main class="main-content">
      <RouterView v-slot="{ Component }">
        <Transition name="page" mode="out-in">
          <component :is="Component" />
        </Transition>
      </RouterView>
    </main>


    <!-- ── Popup de confirmation reset ── -->
    <Teleport to="body">
      <Transition name="fade">
        <div v-if="showResetConfirm" class="overlay" @click.self="showResetConfirm = false">
          <div class="reset-popup">
            <div class="reset-emoji">🔄</div>
            <h3 class="reset-title">Recommencer ?</h3>
            <p class="reset-msg">Tu vas perdre toute ta progression. Tu es sûr(e) ?</p>
            <div class="reset-actions">
              <button class="btn-cancel" @click="showResetConfirm = false">Annuler</button>
              <button class="btn-confirm" @click="doReset">Oui, recommencer !</button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { RouterLink, RouterView, useRouter, useRoute } from 'vue-router'
import { useProgressStore, JOURNEY } from './stores/progress.js'

const progress = useProgressStore()
const router   = useRouter()
const route    = useRoute()

// ── Helpers ───────────────────────────────────────────────────────────────────
function isCurrent(idx) {
  return route.meta?.stepId === JOURNEY[idx].id
}

function stepStyle(step, idx) {
  const completed = progress.isCompleted(step.id)
  const current   = isCurrent(idx)
  const unlocked  = progress.isUnlocked(step.id)
  if (completed) return { '--step-color': step.color, background: step.color + '22', borderColor: step.color }
  if (current)   return { '--step-color': step.color, background: step.color,        borderColor: step.color, color: '#fff' }
  if (unlocked)  return { '--step-color': step.color, borderColor: step.color + '88' }
  return {}
}

function navigate(step) {
  if (progress.isUnlocked(step.id) || progress.isCompleted(step.id)) {
    router.push(step.route)
  }
}

// ── Reset ─────────────────────────────────────────────────────────────────────
const showResetConfirm = ref(false)

function confirmReset() { showResetConfirm.value = true }

function doReset() {
  progress.reset()
  showResetConfirm.value = false
  router.push('/')
}
</script>

<style>
/* ── Reset & variables globales ── */
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

:root {
  --coral:   #FF6B6B;
  --teal:    #4ECDC4;
  --yellow:  #FFE66D;
  --green:   #6BCB77;
  --blue:    #4D96FF;
  --orange:  #FF9F43;
  --purple:  #A78BFA;
  --dark:    #2D3047;
  --bg:      #FFF9F0;
  --card-bg: #FFFFFF;
  --radius:  18px;
  --shadow:  0 6px 24px rgba(45, 48, 71, 0.10);
}

html, body {
  font-family: 'Nunito', sans-serif;
  background: var(--bg);
  color: var(--dark);
  min-height: 100vh;
}

/* ── Layout ── */
.app-root {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.main-content {
  flex: 1;
  max-width: 1100px;
  width: 100%;
  margin: 0 auto;
  padding: 32px 20px 60px;
}

/* ── Header ── */
.app-header {
  background: var(--dark);
  box-shadow: 0 3px 16px rgba(0,0,0,0.18);
  position: sticky;
  top: 0;
  z-index: 100;
}

.header-inner {
  max-width: 1100px;
  margin: 0 auto;
  padding: 0 20px;
  height: 64px;
  display: flex;
  align-items: center;
  gap: 16px;
}

/* Brand */
.nav-brand {
  font-family: 'Fredoka One', cursive;
  font-size: 20px;
  color: var(--yellow);
  text-decoration: none;
  white-space: nowrap;
  display: flex;
  align-items: center;
  gap: 6px;
  flex-shrink: 0;
}

/* ── Barre de parcours ── */
.journey-bar {
  flex: 1;
  overflow-x: auto;
  scrollbar-width: none;
}
.journey-bar::-webkit-scrollbar { display: none; }

.journey-track {
  display: flex;
  align-items: center;
  gap: 0;
  padding: 4px 0;
  min-width: max-content;
  margin: 0 auto;
}

/* Ligne de connexion */
.journey-connector {
  width: 24px;
  height: 2px;
  background: #4b5563;
  flex-shrink: 0;
  transition: background 0.4s;
}
.journey-connector.done {
  background: var(--green);
}

/* Pastille */
.journey-step {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  background: transparent;
  border: 2px solid #4b5563;
  border-radius: 50px;
  padding: 4px 10px;
  cursor: pointer;
  transition: all 0.25s;
  flex-shrink: 0;
  min-width: 72px;
}
.journey-step:not(:disabled):hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.25);
}
.journey-step:disabled {
  cursor: not-allowed;
  opacity: 0.45;
}
.journey-step.current {
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(0,0,0,0.30);
}

.step-emoji {
  font-size: 18px;
  line-height: 1;
}
.step-label {
  font-family: 'Fredoka One', cursive;
  font-size: 10px;
  color: #cbd5e1;
  white-space: nowrap;
  line-height: 1;
}
.journey-step.completed .step-label { color: var(--step-color, #6BCB77); }
.journey-step.current   .step-label { color: #fff; }

/* ── Bouton reset ── */
.reset-btn {
  background: none;
  border: none;
  font-size: 16px;
  cursor: pointer;
  opacity: 0.4;
  transition: opacity 0.2s, transform 0.2s;
  flex-shrink: 0;
  padding: 4px;
}
.reset-btn:hover { opacity: 0.9; transform: rotate(180deg); }

/* ── Footer ── */
.footer {
  text-align: center;
  padding: 16px;
  font-size: 12px;
  color: #9ca3af;
  background: #f9fafb;
  border-top: 1px solid #e5e7eb;
}

/* ── Popup reset ── */
.overlay {
  position: fixed; inset: 0;
  background: rgba(0,0,0,0.5);
  display: flex; align-items: center; justify-content: center;
  z-index: 999;
  padding: 20px;
}
.reset-popup {
  background: #fff;
  border-radius: 24px;
  padding: 36px 32px;
  max-width: 380px;
  width: 100%;
  text-align: center;
  box-shadow: 0 24px 64px rgba(0,0,0,0.25);
}
.reset-emoji { font-size: 52px; margin-bottom: 12px; line-height: 1; }
.reset-title { font-family: 'Fredoka One', cursive; font-size: 24px; margin-bottom: 10px; }
.reset-msg   { font-size: 15px; color: #4b5563; line-height: 1.6; margin-bottom: 24px; }
.reset-actions { display: flex; gap: 12px; justify-content: center; }

.btn-cancel {
  padding: 10px 24px; border-radius: 50px; border: 2px solid #e5e7eb;
  background: #fff; font-family: 'Fredoka One', cursive; font-size: 15px;
  cursor: pointer; color: #374151; transition: all 0.2s;
}
.btn-cancel:hover { border-color: #9ca3af; }

.btn-confirm {
  padding: 10px 24px; border-radius: 50px; border: none;
  background: var(--coral); color: #fff;
  font-family: 'Fredoka One', cursive; font-size: 15px;
  cursor: pointer; transition: all 0.2s;
}
.btn-confirm:hover { background: #e85555; transform: translateY(-1px); }

/* ── Transitions de page ── */
.page-enter-active, .page-leave-active { transition: opacity 0.2s, transform 0.2s; }
.page-enter-from  { opacity: 0; transform: translateY(12px); }
.page-leave-to    { opacity: 0; transform: translateY(-8px); }

.fade-enter-active, .fade-leave-active { transition: opacity 0.2s; }
.fade-enter-from, .fade-leave-to       { opacity: 0; }

/* ── Utilitaires globaux (card, btn) ── */
.card {
  background: var(--card-bg);
  border-radius: var(--radius);
  box-shadow: var(--shadow);
  padding: 24px;
}
.btn {
  font-family: 'Fredoka One', cursive;
  font-size: 15px;
  padding: 10px 22px;
  border-radius: 50px;
  border: none;
  cursor: pointer;
  transition: all 0.2s;
}
.btn:disabled { opacity: 0.4; cursor: not-allowed; }
.btn-primary { background: var(--coral);  color: #fff; }
.btn-primary:hover:not(:disabled)  { background: #e85555; transform: translateY(-2px); }
.btn-teal    { background: var(--teal);   color: #fff; }
.btn-teal:hover:not(:disabled)     { background: #38b2ac; transform: translateY(-2px); }
.btn-ghost   { background: #f3f4f6; color: var(--dark); border: 2px solid #e5e7eb; }
.btn-ghost:hover:not(:disabled)    { background: #e5e7eb; }
</style>