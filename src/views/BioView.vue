<template>
  <div class="bio-page">
    <div class="stub-icon">🔬</div>
    <h1 class="stub-title">Parallèle Biologique</h1>
    <p class="stub-desc">
      Combien de neurones faut-il pour construire une intelligence ?
      Compare une fourmi, un chien, un humain… et une IA !
    </p>

    <!-- Frise comparative -->
<!--    <div class="compare-grid">-->
<!--      <div v-for="entity in entities" :key="entity.name"-->
<!--        class="entity-card"-->
<!--        :style="`&#45;&#45;c: ${entity.color}`"-->
<!--      >-->
<!--        <div class="entity-emoji">{{ entity.emoji }}</div>-->
<!--        <h3 class="entity-name">{{ entity.name }}</h3>-->
<!--        <div class="entity-count">{{ entity.count }}</div>-->
<!--        <div class="entity-label">neurones</div>-->
<!--        &lt;!&ndash; Barre proportionnelle logarithmique &ndash;&gt;-->
<!--        <div class="bar-wrap">-->
<!--          <div class="bar-fill" :style="`width: ${entity.barPct}%`" />-->
<!--        </div>-->
<!--        <p class="entity-skill">{{ entity.skill }}</p>-->
<!--      </div>-->
<!--    </div>-->

<!--    &lt;!&ndash; Note pédagogique &ndash;&gt;-->
<!--    <div class="note-box card">-->
<!--      <h3>💡 Ce que cela veut dire</h3>-->
<!--      <p>-->
<!--        Un réseau de neurones artificiel n'a que ~1 000 connexions pour reconnaître des chiffres,-->
<!--        là où votre cerveau en a <strong>86 milliards</strong> pour tout ce que vous faites-->
<!--        (parler, ressentir, créer…). L'IA n'est donc pas « intelligente comme nous »,-->
<!--        mais <em>très efficace</em> pour une tâche précise.-->
<!--      </p>-->
<!--    </div>-->

    <div class="coming-badge">Frise en cours de développement</div>
  </div>
</template>

<script setup>
const entities = [
  { name: 'Fourmi',  emoji: '🐜', count: '250 000',   barPct: 15, skill: 'Galeries & communication',  color: '#6BCB77' },
  { name: 'Chien',   emoji: '🐕', count: '2,5 milliards', barPct: 55, skill: 'Émotions & ordres',       color: '#FF9F43' },
  { name: 'Humain',  emoji: '🧑', count: '86 milliards',  barPct: 90, skill: 'Conscience & art',         color: '#4D96FF' },
  { name: 'IA',      emoji: '🤖', count: '~1 000',    barPct:  5, skill: 'Reconnaissance de chiffres', color: '#A78BFA' },
]
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
