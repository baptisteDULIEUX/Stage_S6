<template>
  <div class="app-root">
    <!-- ── Navigation ── -->
    <nav class="navbar">
      <RouterLink to="/" class="nav-brand">
        <span>loraine ipsum</span>
      </RouterLink>
      <div class="nav-links">
        <RouterLink to="/" class="nav-item" active-class="nav-active" exact>
           Accueil
        </RouterLink>
        <RouterLink to="/simulator" class="nav-item" active-class="nav-active">
          Simulateur
        </RouterLink>
        <RouterLink to="/mnist" class="nav-item" active-class="nav-active">
          Dessin IA
        </RouterLink>
        <RouterLink to="/games" class="nav-item" active-class="nav-active">
          Mini-jeux
        </RouterLink>
        <RouterLink to="/bio" class="nav-item" active-class="nav-active">
          Biologie
        </RouterLink>
      </div>
    </nav>

    <!-- ── Contenu ── -->
    <main class="main-content">
      <RouterView v-slot="{ Component }">
        <Transition name="page" mode="out-in">
          <component :is="Component" />
        </Transition>
      </RouterView>
    </main>

    <!-- ── Footer ── -->
    <footer class="footer">
      <span>FEMTO-ST Sciences & Technologies · Support pédagogique IA · 2026</span>
    </footer>
  </div>
</template>

<script setup>
import { RouterLink, RouterView } from 'vue-router'
</script>

<style>
/* ── Reset & variables globales ── */
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

:root {
  --coral:   #FF6B6B;
  --teal:    #4ECDC4;
  --yellow:  #FFE66D;
  --green:   #6BCB77;
  --blue:    #4D96FF;
  --orange:  #FF9F43;
  --purple:  #A78BFA;
  --dark:    #2D3047;
  --bg:      #FFF9F0;
  --card-bg: #FFFFFF;
  --radius:  18px;
  --shadow:  0 6px 24px rgba(45, 48, 71, 0.10);
}

html, body {
  font-family: 'Nunito', sans-serif;
  background: var(--bg);
  color: var(--dark);
  min-height: 100vh;
}

/* ── Layout ── */
.app-root {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}
.main-content {
  flex: 1;
  max-width: 1100px;
  width: 100%;
  margin: 0 auto;
  padding: 32px 20px 60px;
}

/* ── Navbar ── */
.navbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 28px;
  height: 64px;
  background: var(--dark);
  box-shadow: 0 3px 12px rgba(0,0,0,0.15);
  position: sticky;
  top: 0;
  z-index: 100;
  gap: 16px;
}

.nav-brand {
  font-family: 'Fredoka One', cursive;
  font-size: 22px;
  color: var(--yellow);
  text-decoration: none;
  display: flex;
  align-items: center;
  gap: 6px;
  white-space: nowrap;
}
.nav-brand span { letter-spacing: 0.5px; }

.nav-links {
  display: flex;
  align-items: center;
  gap: 4px;
  flex-wrap: wrap;
}

.nav-item {
  font-family: 'Nunito', sans-serif;
  font-weight: 700;
  font-size: 14px;
  color: #cbd5e1;
  text-decoration: none;
  padding: 6px 14px;
  border-radius: 50px;
  transition: all 0.2s;
}
.nav-item:hover   { background: rgba(255,255,255,0.1); color: #fff; }
.nav-active       { background: var(--coral) !important; color: #fff !important; }

/* ── Footer ── */
.footer {
  text-align: center;
  padding: 16px;
  font-size: 12px;
  color: #9ca3af;
  background: #f9fafb;
  border-top: 1px solid #e5e7eb;
}

/* ── Transition de page ── */
.page-enter-active, .page-leave-active { transition: opacity 0.2s, transform 0.2s; }
.page-enter-from  { opacity: 0; transform: translateY(12px); }
.page-leave-to    { opacity: 0; transform: translateY(-8px); }

/* ── Utilitaires communs ── */
.card {
  background: var(--card-bg);
  border-radius: var(--radius);
  box-shadow: var(--shadow);
  padding: 28px;
}
.btn {
  font-family: 'Fredoka One', cursive;
  font-size: 18px;
  border: none;
  border-radius: 50px;
  padding: 12px 32px;
  cursor: pointer;
  transition: transform 0.15s, box-shadow 0.15s;
  display: inline-flex;
  align-items: center;
  gap: 8px;
}
.btn:hover:not(:disabled) { transform: translateY(-2px) scale(1.03); box-shadow: 0 8px 20px rgba(0,0,0,0.15); }
.btn:active:not(:disabled) { transform: scale(0.97); }
.btn:disabled { opacity: 0.5; cursor: not-allowed; }
.btn-primary  { background: var(--coral);  color: #fff; }
.btn-teal     { background: var(--teal);   color: #fff; }
.btn-ghost    { background: #e5e7eb;       color: var(--dark); }
</style>
