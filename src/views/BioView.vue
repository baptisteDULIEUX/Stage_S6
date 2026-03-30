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
        <h2 class="section-label">🎮 À toi de jouer !</h2>
        <p class="game-intro">
          Maintenant que tu as vu les chiffres, sauras-tu les retrouver ?
          Associe chaque être vivant à son nombre de neurones et à sa capacité !
        </p>
        <BioMatchingGame />
      </div>

    </div>
  </div>
</template>

<script setup>
import BioMatchingGame from '../components/BioMatchingGame.vue'

const RAW = [
  { name: 'Fourmi', emoji: '🐜', color: '#6BCB77', neurons: '250 000',        neuronsRaw: 250000,       skill: 'construit des galeries complexes' },
  { name: 'Chien',  emoji: '🐶', color: '#FF9F43', neurons: '530 millions',   neuronsRaw: 530000000,    skill: 'reconnaît les émotions humaines'  },
  { name: 'Humain', emoji: '🧑', color: '#4ECDC4', neurons: '86 milliards',   neuronsRaw: 86000000000,  skill: 'parle, crée et imagine'           },
  { name: 'IA',     emoji: '🤖', color: '#A78BFA', neurons: '~1 000',         neuronsRaw: 1000,         skill: 'reconnaît des chiffres dessinés'  },
]

const logMin = Math.log10(Math.min(...RAW.map(e => e.neuronsRaw)))
const logMax = Math.log10(Math.max(...RAW.map(e => e.neuronsRaw)))

const entities = RAW.map(e => ({
  ...e,
  logPct: Math.round((Math.log10(e.neuronsRaw) - logMin) / (logMax - logMin) * 100),
}))
</script>

<style scoped>
.bio-page   { display: flex; flex-direction: column; gap: 24px; }
.bio-header { text-align: center; }
.bio-title  { font-family: 'Fredoka One', cursive; font-size: clamp(26px, 4vw, 42px); margin-bottom: 6px; }
.bio-desc   { color: #4b5563; font-size: 16px; }

.bio-body { display: flex; flex-direction: column; gap: 24px; }

.section-label { font-family: 'Fredoka One', cursive; font-size: 18px; margin-bottom: 16px; }
.game-intro    { font-size: 14px; color: #4b5563; line-height: 1.6; margin-bottom: 20px; max-width: 520px; }

/* ── Frise ── */
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

/* ── Barres ── */
.bars-section { }
.bars-label   { font-size: 12px; color: #9ca3af; font-weight: 700; margin-bottom: 10px; }
.bar-row      { display: flex; align-items: center; gap: 10px; margin-bottom: 8px; }
.bar-emoji    { font-size: 18px; width: 24px; text-align: center; flex-shrink: 0; }
.bar-track    { flex: 1; height: 16px; background: #f3f4f6; border-radius: 50px; overflow: hidden; }
.bar-fill     { height: 100%; border-radius: 50px; transition: width 1s ease; }
.bar-count    { font-family: 'Fredoka One', cursive; font-size: 12px; color: #6b7280; white-space: nowrap; min-width: 90px; text-align: right; }
</style>
