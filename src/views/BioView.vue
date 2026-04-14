<template>
  <div class="bio-page">

    <div class="bio-header">
      <h1 class="bio-title">🔬 Parallèle Biologique</h1>
      <p class="bio-desc">
        Combien de neurones faut-il pour construire une intelligence ?
        Compare une fourmi, un chien, un humain… et une IA !
      </p>
    </div>

    <div class="bio-body">



      <!-- Jeu d'association -->
      <div class="game-card card">
        <h2 class="section-label">🎮 A toi de jouer !</h2>
        <p class="game-intro">
          Maintenant que tu as vu les chiffres, sauras-tu les retrouver ?
          Associe chaque etre vivant a son nombre de neurones et a sa capacite !
        </p>
        <BioMatchingGame @complete="onGameComplete" />
      </div>

      <!-- Bouton de continuation — apparait apres le jeu termine -->
      <Transition name="slide-up">
        <div v-if="gameCompleted" class="continue-card card">
          <div class="continue-inner">
            <div class="continue-emoji">🎉</div>
            <div class="continue-text">
              <h3 class="continue-title">Bravo, tu connais les neurones !</h3>
              <p class="continue-sub">
                Maintenant on va plonger dans le fonctionnement d'une IA qui analyse des images.
                Pret(e) pour dessiner ?
              </p>
            </div>
            <button class="btn-continue" @click="continueToNext">
              Terminer le parcours
            </button>
          </div>
        </div>
      </Transition>

    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import BioMatchingGame from '../components/BioMatchingGame.vue'
import { useProgressStore } from '../stores/progress.js'

const router   = useRouter()
const progress = useProgressStore()

// -- Donnees frise -------------------------------------------------------------
const RAW = [
  { name: 'Fourmi', emoji: '🐜', color: '#6BCB77', neurons: '250 000',      neuronsRaw: 250000,      skill: 'construit des galeries complexes' },
  { name: 'Chien',  emoji: '🐶', color: '#FF9F43', neurons: '530 millions', neuronsRaw: 530000000,   skill: 'reconnait les emotions humaines'  },
  { name: 'Humain', emoji: '🧑', color: '#4ECDC4', neurons: '86 milliards', neuronsRaw: 86000000000, skill: 'parle, cree et imagine'           },
  { name: 'ChatGPT', emoji: '🤖', color: '#A78BFA', neurons: '~175 milliards', neuronsRaw: 175000000000, skill: 'génère du texte et répond aux questions' }]

const logMin = Math.log10(Math.min(...RAW.map(e => e.neuronsRaw)))
const logMax = Math.log10(Math.max(...RAW.map(e => e.neuronsRaw)))

const entities = RAW.map(e => ({
  ...e,
  logPct: Math.round((Math.log10(e.neuronsRaw) - logMin) / (logMax - logMin) * 100),
}))

// -- Gestion fin de jeu -------------------------------------------------------
const gameCompleted = ref(false)

function onGameComplete() {
  gameCompleted.value = true
}

// -- Navigation ---------------------------------------------------------------
function continueToNext() {
  progress.completeStep('bio')
  router.push('/recap')
}
</script>

<style scoped>
.bio-page   { display: flex; flex-direction: column; gap: 24px; }
.bio-header { text-align: center; }
.bio-title  { font-family: 'Fredoka One', cursive; font-size: clamp(26px, 4vw, 42px); margin-bottom: 6px; }
.bio-desc   { color: #4b5563; font-size: 16px; }

.bio-body { display: flex; flex-direction: column; gap: 24px; }

.section-label { font-family: 'Fredoka One', cursive; font-size: 18px; margin-bottom: 16px; }
.game-intro    { font-size: 14px; color: #4b5563; line-height: 1.6; margin-bottom: 20px; max-width: 520px; }

/* -- Frise -- */
.frise-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(130px, 1fr));
  gap: 14px;
  margin-bottom: 24px;
}
.entity-card {
  background: #f9fafb; border-radius: 14px; padding: 16px 12px;
  text-align: center; border: 1.5px solid #e5e7eb;
}
.entity-emoji { font-size: 40px; line-height: 1; margin-bottom: 8px; }
.entity-name  { font-family: 'Fredoka One', cursive; font-size: 15px; margin-bottom: 4px; }
.entity-count { font-family: 'Fredoka One', cursive; font-size: 13px; margin-bottom: 6px; }
.entity-skill { font-size: 11px; color: #6b7280; line-height: 1.4; }

/* -- Barres -- */
.bars-section { }
.bars-label   { font-size: 12px; color: #9ca3af; font-weight: 700; margin-bottom: 10px; }
.bar-row      { display: flex; align-items: center; gap: 10px; margin-bottom: 8px; }
.bar-emoji    { font-size: 18px; width: 24px; text-align: center; flex-shrink: 0; }
.bar-track    { flex: 1; height: 16px; background: #f3f4f6; border-radius: 50px; overflow: hidden; }
.bar-fill     { height: 100%; border-radius: 50px; transition: width 1s ease; }
.bar-count    { font-family: 'Fredoka One', cursive; font-size: 12px; color: #6b7280; white-space: nowrap; min-width: 90px; text-align: right; }

/* -- Carte continuation -- */
.continue-card {
  border: 2.5px solid #6BCB77;
  background: #f0fdf4;
}
.continue-inner {
  display: flex;
  align-items: center;
  gap: 20px;
  flex-wrap: wrap;
}
.continue-emoji { font-size: 48px; flex-shrink: 0; }
.continue-text  { flex: 1; min-width: 200px; }
.continue-title {
  font-family: 'Fredoka One', cursive;
  font-size: 20px;
  color: #166534;
  margin-bottom: 6px;
}
.continue-sub {
  font-size: 14px;
  color: #4b5563;
  line-height: 1.6;
}
.btn-continue {
  font-family: 'Fredoka One', cursive;
  font-size: 17px;
  padding: 14px 28px;
  border-radius: 50px;
  border: none;
  background: #6BCB77;
  color: #fff;
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.2s;
  flex-shrink: 0;
}
.btn-continue:hover {
  background: #4caf57;
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(107, 203, 119, 0.4);
}

/* -- Transition -- */
.slide-up-enter-active { transition: opacity 0.4s ease, transform 0.4s ease; }
.slide-up-enter-from   { opacity: 0; transform: translateY(20px); }
</style>