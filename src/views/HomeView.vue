<template>
  <div class="home">
    <!-- ── Hero ── -->
    <section class="hero">
<!--      <div class="hero-emoji">🧠</div>-->
      <h1 class="hero-title">Comment pense une IA ?</h1>
      <p class="hero-subtitle">
        Découvre les réseaux de neurones en jouant ! <br />
        Tu vas <strong>voir</strong> une IA apprendre à reconnaître des chats et des chiens
      </p>
      <RouterLink to="/simulator" class="btn btn-primary hero-cta">
        Commencer l'aventure !
      </RouterLink>
    </section>

    <!-- ── Modules ── -->
    <section class="modules">
      <h2 class="section-title">Ce que tu vas explorer</h2>
      <div class="module-grid">

        <RouterLink to="/simulator" class="module-card" style="--accent: #FF6B6B">
<!--          <div class="module-icon">🐱🐶</div>-->
          <h3>Simulateur Chat / Chien</h3>
          <p>Joue le rôle d'un neurone et observe comment le réseau apprend !</p>
          <span class="module-tag">Jouer !</span>
        </RouterLink>

        <RouterLink to="/mnist" class="module-card" style="--accent: #4ECDC4">
<!--          <div class="module-icon">✏️</div>-->
          <h3>Dessine un chiffre</h3>
          <p>Dessine un chiffre et regarde l'IA le deviner en temps réel !</p>
          <span class="module-tag coming">Bientôt</span>
        </RouterLink>

        <RouterLink to="/games" class="module-card" style="--accent: #A78BFA">
<!--          <div class="module-icon">🎮</div>-->
          <h3>Mini-jeux CNN</h3>
          <p>Convolution, Pooling, ReLU… deviens expert en 3 mini-jeux !</p>
          <span class="module-tag coming">Bientôt</span>
        </RouterLink>

        <RouterLink to="/bio" class="module-card" style="--accent: #6BCB77">
<!--          <div class="module-icon">🔬</div>-->
          <h3>Parallèle Biologique</h3>
          <p>Compare les neurones d'une fourmi, d'un humain et d'une IA !</p>
          <span class="module-tag coming">Bientôt</span>
        </RouterLink>

      </div>
    </section>

    <!-- ── L'essentiel en 3 étapes ── -->
<!--    <section class="steps-section card">-->
<!--      <h2 class="section-title" style="text-align:center">Comment fonctionne un réseau de neurones ?</h2>-->
<!--      <div class="steps">-->
<!--        <div class="step">-->
<!--          <div class="step-num">1</div>-->
<!--          <div class="step-emoji">👁️</div>-->
<!--          <h4>Observer</h4>-->
<!--          <p>Le réseau regarde des <strong>caractéristiques</strong> : moustaches, oreilles pointues, yeux ronds…</p>-->
<!--        </div>-->
<!--        <div class="step-arrow">→</div>-->
<!--        <div class="step">-->
<!--          <div class="step-num">2</div>-->
<!--          <div class="step-emoji">⚖️</div>-->
<!--          <h4>Peser</h4>-->
<!--          <p>Chaque indice est multiplié par un <strong>poids</strong> — certains indices comptent plus que d'autres.</p>-->
<!--        </div>-->
<!--        <div class="step-arrow">→</div>-->
<!--        <div class="step">-->
<!--          <div class="step-num">3</div>-->
<!--          <div class="step-emoji">📚</div>-->
<!--          <h4>Apprendre</h4>-->
<!--          <p>En cas d'erreur, on <strong>ajuste les poids</strong> pour que le réseau soit meilleur la prochaine fois.</p>-->
<!--        </div>-->
<!--      </div>-->
<!--    </section>-->
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
  animation: fade-up 0.6s ease;
}
/*
@keyframes fade-up {
  from { opacity: 0; transform: translateY(20px); }
  to   { opacity: 1; transform: translateY(0); }
}
.hero-emoji {
  font-size: 72px;
  animation: bounce 1.8s ease-in-out infinite;
}
@keyframes bounce {
  0%, 100% { transform: translateY(0); }
  50%       { transform: translateY(-10px); }
}
*/

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

/*Ajouter:   border: 2.5px solid transparent;*/
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
/*Ajouter: background: var(--accent);*/
.module-card::before {
  content: '';
  position: absolute;
  top: 0; left: 0; right: 0;
  height: 5px;

  border-radius: var(--radius) var(--radius) 0 0;
}

/*Ajouter: border-color: var(--accent);*/
.module-card:hover {
  transform: translateY(-4px);

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
