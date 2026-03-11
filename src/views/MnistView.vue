<template>
  <div class="stub-page">
    <div class="stub-icon">✏️</div>
    <h1 class="stub-title">Module MNIST — Dessin en temps réel</h1>
    <p class="stub-desc">
      Dessine un chiffre de 0 à 9 sur un canevas, et regarde une IA
      le reconnaître instantanément grâce à un réseau convolutif (CNN) !
    </p>

<!--    <div class="stub-features">-->
<!--      <div class="feature-item">-->
<!--        <span>🎨</span>-->
<!--        <div>-->
<!--          <strong>Canevas de dessin libre</strong>-->
<!--          <p>Dessine directement avec la souris ou le doigt</p>-->
<!--        </div>-->
<!--      </div>-->
<!--      <div class="feature-item">-->
<!--        <span>🔍</span>-->
<!--        <div>-->
<!--          <strong>Visualisation CNN couche par couche</strong>-->
<!--          <p>Convolution → Pooling → Flatten → Décision</p>-->
<!--        </div>-->
<!--      </div>-->
<!--      <div class="feature-item">-->
<!--        <span>📊</span>-->
<!--        <div>-->
<!--          <strong>Probabilités en temps réel</strong>-->
<!--          <p>Barres de confiance pour chaque chiffre 0–9</p>-->
<!--        </div>-->
<!--      </div>-->
<!--    </div>-->

    <div class="coming-badge">En cours de développement</div>
  </div>
</template>

<script setup></script>

<style scoped>
.stub-page {
  max-width: 600px;
  margin: 0 auto;
  text-align: center;
  padding: 40px 20px;
}
.stub-icon  { font-size: 80px; margin-bottom: 16px; }
.stub-title {
  font-family: 'Fredoka One', cursive;
  font-size: clamp(24px, 3vw, 36px);
  margin-bottom: 14px;
}
.stub-desc { font-size: 16px; color: #4b5563; line-height: 1.6; margin-bottom: 32px; }

.stub-features {
  display: flex;
  flex-direction: column;
  gap: 14px;
  text-align: left;
  background: #fff;
  border-radius: var(--radius);
  padding: 24px;
  box-shadow: var(--shadow);
  margin-bottom: 28px;
}
.feature-item {
  display: flex;
  gap: 16px;
  align-items: flex-start;
}
.feature-item > span { font-size: 28px; flex-shrink: 0; }
.feature-item strong { display: block; font-size: 15px; margin-bottom: 2px; }
.feature-item p      { font-size: 13px; color: #6b7280; }

.coming-badge {
  display: inline-block;
  background: var(--yellow);
  color: var(--dark);
  font-family: 'Fredoka One', cursive;
  font-size: 16px;
  padding: 10px 28px;
  border-radius: 50px;
}
</style>
