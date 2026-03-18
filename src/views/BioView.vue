<template>
  <div class="bio-page">
    <div class="stub-icon">🔬</div>
    <h1 class="stub-title">Parallèle Biologique</h1>
    <p class="stub-desc">
      Combien de neurones faut-il pour construire une intelligence ?
      Compare une fourmi, un chien, un humain… et une IA !
    </p>


    <div class="coming-badge">Frise animée — En cours de développement</div>
  </div>
</template>

<script setup>

</script>

<style scoped>
.bio-page    { max-width: 720px; margin: 0 auto; text-align: center; padding: 40px 20px; }
.stub-icon   { font-size: 80px; margin-bottom: 16px; }
.stub-title  { font-family: 'Fredoka One', cursive; font-size: clamp(24px, 3vw, 36px); margin-bottom: 14px; }
.stub-desc   { font-size: 16px; color: #4b5563; line-height: 1.6; margin-bottom: 36px; }

.compare-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 16px;
  margin-bottom: 32px;
}
.entity-card {
  background: #fff;
  border-radius: var(--radius);
  padding: 22px 14px;
  box-shadow: var(--shadow);
  border-bottom: 5px solid var(--c);
}
.entity-emoji  { font-size: 48px; margin-bottom: 8px; }
.entity-name   { font-family: 'Fredoka One', cursive; font-size: 18px; margin-bottom: 6px; }
.entity-count  { font-family: 'Fredoka One', cursive; font-size: 15px; color: var(--c); }
.entity-label  { font-size: 11px; color: #9ca3af; margin-bottom: 10px; }

.bar-wrap {
  height: 8px; background: #f3f4f6; border-radius: 50px;
  overflow: hidden; margin-bottom: 12px;
}
.bar-fill {
  height: 100%; background: var(--c); border-radius: 50px;
  transition: width 1s ease;
}
.entity-skill { font-size: 12px; color: #4b5563; line-height: 1.4; }

.note-box {
  text-align: left;
  margin-bottom: 28px;
}
.note-box h3 { font-family: 'Fredoka One', cursive; font-size: 18px; margin-bottom: 10px; }
.note-box p  { font-size: 14px; color: #4b5563; line-height: 1.7; }

.coming-badge {
  display: inline-block;
  background: var(--yellow); color: var(--dark);
  font-family: 'Fredoka One', cursive; font-size: 16px;
  padding: 10px 28px; border-radius: 50px;
}
</style>
