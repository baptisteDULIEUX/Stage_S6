<template>
  <div>
    <!-- ── Hero ── -->
    <section class="hero">
      <div class="hero-emoji">🧠</div>
      <h1 class="hero-title">Bienvenue </h1>
      <p class="hero-subtitle">
        dans le monde des réseaux de neurones !<br />
        Tu vas <strong>voir</strong>, <strong>jouer</strong> et <strong>comprendre</strong>
        comment une IA apprend à reconnaître des chats et des chiens 🐱🐶
      </p>
      <RouterLink to="/intro" class="btn btn-primary hero-cta">
        🚀 Commencer l'aventure !
      </RouterLink>
    </section>
  </div>
</template>

<script setup>
import { RouterLink } from 'vue-router'
import { JOURNEY } from '../stores/progress.js'
</script>

<style scoped>
/* ── Hero ── */
.hero {
  text-align: center;
  padding: 56px 20px 48px;
}
.hero-emoji {
  font-size: 72px;
  animation: bounce 2s ease-in-out infinite;
}
@keyframes bounce {
  0%, 100% { transform: translateY(0); }
  50%       { transform: translateY(-10px); }
}
.hero-title {
  font-family: 'Fredoka One', cursive;
  font-size: clamp(32px, 5vw, 56px);
  color: var(--dark);
  margin: 12px 0 16px;
  letter-spacing: 0.5px;
}
.hero-subtitle {
  font-size: clamp(16px, 2vw, 20px);
  color: #4b5563;
  line-height: 1.6;
  max-width: 560px;
  margin: 0 auto 32px;
}
.hero-cta {
  font-size: 20px;
  padding: 16px 44px;
  box-shadow: 0 8px 28px rgba(255, 107, 107, 0.35);
  text-decoration: none;
  display: inline-block;
}

/* ── Étapes ── */
.steps-section {
  margin: 0 0 40px;
}
.section-title {
  font-family: 'Fredoka One', cursive;
  font-size: 22px;
  margin-bottom: 28px;
  color: var(--dark);
}
.steps {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  flex-wrap: wrap;
}
.step-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  text-align: center;
  position: relative;
}
.step-num {
  width: 32px; height: 32px;
  border-radius: 50%;
  color: #fff;
  font-family: 'Fredoka One', cursive;
  font-size: 16px;
  display: flex; align-items: center; justify-content: center;
}
.step-emoji { font-size: 32px; }
.step-item h4 {
  font-family: 'Fredoka One', cursive;
  font-size: 13px;
  color: var(--dark);
  max-width: 80px;
}
.step-arrow {
  position: absolute;
  right: -18px;
  top: 28px;
  font-size: 20px;
  color: #d1d5db;
}
</style>