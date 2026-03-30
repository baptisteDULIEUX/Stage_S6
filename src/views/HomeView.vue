<template>
  <div class="home">
    <!-- ── Hero ── -->
    <section class="hero">
      <h1 class="hero-title">Comment pense une IA ?</h1>
      <p class="hero-subtitle">
        Découvre les réseaux de neurones en jouant ! <br />
        Tu vas <strong>voir</strong> une IA apprendre à reconnaître des chats et des chiens 🐱🐶
      </p>
      <RouterLink to="/simulator" class="btn btn-primary hero-cta">
        🚀 Commencer l'aventure !
      </RouterLink>
    </section>
  </div>
</template>

<script setup>
import { RouterLink } from 'vue-router'
</script>

<style scoped>
/* ── Hero ── */
.hero {
  text-align: center;
  padding: 56px 20px 48px;
}
.hero-emoji { font-size: 72px; }
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
.hero-cta { font-size: 20px; padding: 16px 44px; box-shadow: 0 8px 28px rgba(255,107,107,0.35); }

/* ── Modules ── */
.modules { margin: 40px 0; }
.section-title {
  font-family: 'Fredoka One', cursive;
  font-size: 26px;
  margin-bottom: 24px;
  color: var(--dark);
}
.module-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(230px, 1fr));
  gap: 20px;
}
.module-card {
  background: #fff;
  border-radius: var(--radius);
  padding: 28px 22px;
  text-decoration: none;
  color: var(--dark);
  border: 2.5px solid transparent;
  box-shadow: var(--shadow);
  transition: transform 0.2s, border-color 0.2s, box-shadow 0.2s;
  position: relative;
  overflow: hidden;
}
.module-card::before {
  content: '';
  position: absolute;
  top: 0; left: 0; right: 0;
  height: 5px;
  background: var(--accent);
  border-radius: var(--radius) var(--radius) 0 0;
}
.module-card:hover {
  border-color: var(--accent);
  box-shadow: 0 12px 32px rgba(0,0,0,0.12);
}
.module-icon { font-size: 44px; margin-bottom: 12px; }
.module-card h3 { font-family: 'Fredoka One', cursive; font-size: 18px; margin-bottom: 8px; }
.module-card p  { font-size: 14px; color: #4b5563; line-height: 1.5; }
.module-tag {
  display: inline-block;
  margin-top: 14px;
  padding: 4px 14px;
  border-radius: 50px;
  font-size: 12px;
  font-weight: 700;
  background: var(--accent);
  color: #fff;
}
.module-tag.coming { background: #e5e7eb; color: #6b7280; }

/* ── Steps ── */
.steps-section { margin: 0; }
.steps {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin-top: 28px;
  flex-wrap: wrap;
}
.step {
  flex: 1;
  min-width: 160px;
  max-width: 220px;
  text-align: center;
  padding: 20px 16px;
  background: var(--bg);
  border-radius: 16px;
}
.step-num {
  width: 36px; height: 36px;
  border-radius: 50%;
  background: var(--dark);
  color: var(--yellow);
  font-family: 'Fredoka One', cursive;
  font-size: 18px;
  display: flex; align-items: center; justify-content: center;
  margin: 0 auto 8px;
}
.step-emoji { font-size: 36px; margin-bottom: 8px; }
.step h4 { font-family: 'Fredoka One', cursive; font-size: 18px; margin-bottom: 6px; }
.step p  { font-size: 13px; color: #4b5563; line-height: 1.5; }
.step-arrow { font-size: 28px; color: #d1d5db; flex-shrink: 0; }
</style>
