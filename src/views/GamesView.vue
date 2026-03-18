<template>
  <div class="stub-page">
    <div class="stub-icon">🎮</div>
    <h1 class="stub-title">Mini-jeux CNN</h1>
    <p class="stub-desc">
      Plonge dans les 3 couches d'un réseau convolutif… en jouant !
    </p>


    <div class="coming-badge">En cours de développement</div>
  </div>
</template>

<script setup></script>

<style scoped>
.stub-page   { max-width: 700px; margin: 0 auto; text-align: center; padding: 40px 20px; }
.stub-icon   { font-size: 80px; margin-bottom: 16px; }
.stub-title  { font-family: 'Fredoka One', cursive; font-size: clamp(24px, 3vw, 36px); margin-bottom: 14px; }
.stub-desc   { font-size: 16px; color: #4b5563; line-height: 1.6; margin-bottom: 32px; }

.games-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(190px, 1fr));
  gap: 20px;
  margin-bottom: 32px;
}
.game-card {
  background: #fff;
  border-radius: var(--radius);
  padding: 24px 16px;
  box-shadow: var(--shadow);
  border-top: 5px solid var(--c);
  position: relative;
}
.game-num {
  position: absolute; top: -14px; left: 50%; transform: translateX(-50%);
  width: 28px; height: 28px; border-radius: 50%;
  background: var(--c); color: #fff;
  font-family: 'Fredoka One', cursive; font-size: 15px;
  display: flex; align-items: center; justify-content: center;
}
.game-icon { font-size: 40px; margin: 8px 0 10px; }
.game-card h3 { font-family: 'Fredoka One', cursive; font-size: 18px; margin-bottom: 8px; }
.game-card p  { font-size: 13px; color: #4b5563; line-height: 1.5; margin-bottom: 12px; }
.game-badge {
  display: inline-block; padding: 4px 12px; border-radius: 50px;
  background: var(--c); color: #fff; font-size: 11px; font-weight: 700;
}

.coming-badge {
  display: inline-block;
  background: var(--yellow); color: var(--dark);
  font-family: 'Fredoka One', cursive; font-size: 16px;
  padding: 10px 28px; border-radius: 50px;
}
</style>
