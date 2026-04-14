<template>
  <div class="recap-page">

    <!-- ── Félicitations ── -->
    <div class="congrats-section">
      <div class="confetti-emoji">🎉</div>
      <h1 class="congrats-title">Bravo, tu as tout exploré !</h1>
      <p class="congrats-sub">
        Tu viens de découvrir comment fonctionne une vraie intelligence artificielle —
        de ses neurones jusqu'à ses décisions. C'est pas rien ! 🧠✨
      </p>
    </div>

    <!-- ── Étapes complétées ── -->
    <div class="steps-section card">
      <h2 class="section-title">📍 Ton parcours</h2>
      <div class="steps-grid">
        <div
            v-for="step in JOURNEY_RECAP"
            :key="step.id"
            class="step-recap-card"
            :style="`border-left: 5px solid ${step.color}`"
        >
          <div class="step-recap-header">
            <span class="step-recap-emoji">{{ step.emoji }}</span>
            <div>
              <h3 class="step-recap-title" :style="`color: ${step.color}`">{{ step.label }}</h3>
              <span class="step-check">✅ Complété</span>
            </div>
          </div>
          <p class="step-recap-desc">{{ step.learned }}</p>
        </div>
      </div>
    </div>

    <!-- ── Concepts clés ── -->
    <div class="concepts-section card">
      <h2 class="section-title">🧠 Les concepts que tu connais maintenant</h2>
      <div class="concepts-grid">
        <div
            v-for="concept in CONCEPTS"
            :key="concept.name"
            class="concept-card"
            :style="`background: ${concept.color}15; border: 1.5px solid ${concept.color}44`"
        >
          <div class="concept-icon">{{ concept.emoji }}</div>
          <h3 class="concept-name" :style="`color: ${concept.color}`">{{ concept.name }}</h3>
          <p class="concept-def">{{ concept.def }}</p>
        </div>
      </div>
    </div>

    <!-- ── Actions ── -->
    <div class="actions-section">
      <button class="btn-restart" @click="restart">
        🔄 Recommencer le parcours
      </button>
      <RouterLink to="/" class="btn-home">
        🏠 Retour à l'accueil
      </RouterLink>
    </div>

  </div>
</template>

<script setup>
import { RouterLink, useRouter } from 'vue-router'
import { useProgressStore } from '../stores/progress.js'

const router   = useRouter()
const progress = useProgressStore()

// ── Parcours avec ce qu'on y a appris ────────────────────────────────────────
const JOURNEY_RECAP = [
  {
    id: 'intro',
    emoji: '📖',
    label: "C'est quoi un neurone ?",
    color: '#FF6B6B',
    learned: "Un neurone reçoit des signaux, les additionne et s'active si la somme dépasse un seuil. Des millions de neurones connectés forment un réseau capable d'apprendre.",
  },
  {
    id: 'simulator',
    emoji: '🐾',
    label: 'Simulateur Chat / Chien',
    color: '#4ECDC4',
    learned: "Tu as fait fonctionner un réseau de 10 neurones en 4 manches : erreur, apprentissage des poids, puis généralisation sur de nouveaux exemples.",
  },
  {
    id: 'pixels',
    emoji: '🖼️',
    label: 'Les pixels',
    color: '#FF9F43',
    learned: "Une image numérique est une grille de pixels. Chaque pixel est un nombre entre 0 (noir) et 255 (blanc) que l'IA peut lire et analyser.",
  },
  {
    id: 'games',
    emoji: '🎨',
    label: 'Jeux CNN & Dessin',
    color: '#A78BFA',
    learned: "Tu as découvert les trois étapes d'un réseau convolutif : la convolution détecte les formes, le MaxPooling réduit l'image, ReLU efface les valeurs négatives.",
  },
  {
    id: 'bio',
    emoji: '🔬',
    label: 'Parallèle biologique',
    color: '#6BCB77',
    learned: "Une fourmi a 250 000 neurones, un humain 86 milliards, et ChatGPT ~175 milliards de paramètres — mais chacun fait des choses très différentes !",
  },
]

// ── Concepts clés ─────────────────────────────────────────────────────────────
const CONCEPTS = [
  {
    emoji: '⚡',
    name: 'Neurone',
    color: '#FF6B6B',
    def: "Unité de base d'un réseau. Il reçoit des entrées, les pondère et s'active si leur somme dépasse un seuil.",
  },
  {
    emoji: '⚖️',
    name: 'Poids',
    color: '#FF9F43',
    def: "Valeurs qui définissent l'importance de chaque connexion. Ils sont ajustés pendant l'apprentissage.",
  },
  {
    emoji: '🎯',
    name: 'Seuil',
    color: '#4ECDC4',
    def: "Valeur limite : si la somme des entrées × poids dépasse le seuil, le neurone s'active.",
  },
  {
    emoji: '🔍',
    name: 'Convolution',
    color: '#4D96FF',
    def: "Un filtre glisse sur l'image pour détecter des motifs (bords, courbes, formes…).",
  },
  {
    emoji: '📐',
    name: 'MaxPooling',
    color: '#4ECDC4',
    def: "Réduit l'image en ne gardant que la valeur la plus grande de chaque bloc 2×2.",
  },
  {
    emoji: '⚡',
    name: 'ReLU',
    color: '#A78BFA',
    def: "Fonction d'activation qui remplace toutes les valeurs négatives par 0.",
  },
]

// ── Navigation ────────────────────────────────────────────────────────────────
function restart() {
  progress.reset()
  router.push('/intro')
}
</script>

<style scoped>
.recap-page {
  display: flex;
  flex-direction: column;
  gap: 32px;
  max-width: 900px;
  margin: 0 auto;
}

/* ── Félicitations ── */
.congrats-section {
  text-align: center;
  padding: 32px 20px 0;
}
.confetti-emoji {
  font-size: 72px;
  animation: bounce 2s ease-in-out infinite;
  line-height: 1;
  margin-bottom: 16px;
}
@keyframes bounce {
  0%, 100% { transform: translateY(0) rotate(-5deg); }
  50%       { transform: translateY(-12px) rotate(5deg); }
}
.congrats-title {
  font-family: 'Fredoka One', cursive;
  font-size: clamp(28px, 4vw, 48px);
  color: var(--dark);
  margin-bottom: 12px;
}
.congrats-sub {
  font-size: 18px;
  color: #4b5563;
  line-height: 1.7;
  max-width: 560px;
  margin: 0 auto;
}

/* ── Section titre ── */
.section-title {
  font-family: 'Fredoka One', cursive;
  font-size: 22px;
  margin-bottom: 20px;
  color: var(--dark);
}

/* ── Étapes ── */
.steps-grid {
  display: flex;
  flex-direction: column;
  gap: 14px;
}
.step-recap-card {
  background: #f9fafb;
  border-radius: 14px;
  padding: 16px 18px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.step-recap-header {
  display: flex;
  align-items: center;
  gap: 14px;
}
.step-recap-emoji { font-size: 28px; flex-shrink: 0; }
.step-recap-title {
  font-family: 'Fredoka One', cursive;
  font-size: 17px;
  margin: 0 0 2px;
}
.step-check {
  font-size: 12px;
  font-weight: 700;
  color: #16a34a;
}
.step-recap-desc {
  font-size: 14px;
  color: #4b5563;
  line-height: 1.7;
  margin: 0;
  padding-left: 42px;
}

/* ── Concepts ── */
.concepts-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 14px;
}
.concept-card {
  border-radius: 14px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.concept-icon { font-size: 28px; }
.concept-name {
  font-family: 'Fredoka One', cursive;
  font-size: 17px;
  margin: 0;
}
.concept-def {
  font-size: 13px;
  color: #4b5563;
  line-height: 1.7;
  margin: 0;
}

/* ── Actions ── */
.actions-section {
  display: flex;
  gap: 16px;
  justify-content: center;
  flex-wrap: wrap;
  padding-bottom: 40px;
}
.btn-restart {
  font-family: 'Fredoka One', cursive;
  font-size: 17px;
  padding: 14px 32px;
  border-radius: 50px;
  border: 2.5px solid var(--dark);
  background: #fff;
  color: var(--dark);
  cursor: pointer;
  transition: all 0.2s;
}
.btn-restart:hover {
  background: var(--dark);
  color: var(--yellow);
  transform: translateY(-2px);
}
.btn-home {
  font-family: 'Fredoka One', cursive;
  font-size: 17px;
  padding: 14px 32px;
  border-radius: 50px;
  background: var(--coral);
  color: #fff;
  text-decoration: none;
  transition: all 0.2s;
}
.btn-home:hover {
  background: #e85555;
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(255,107,107,0.35);
}
</style>