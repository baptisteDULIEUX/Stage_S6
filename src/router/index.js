import { createRouter, createWebHashHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import SimulatorView from '../views/SimulatorView.vue'
import MnistView from '../views/MnistView.vue'
import GamesView from '../views/GamesView.vue'
import BioView from '../views/BioView.vue'

const routes = [
  { path: '/',          name: 'home',      component: HomeView },
  { path: '/simulator', name: 'simulator', component: SimulatorView },
  { path: '/mnist',     name: 'mnist',     component: MnistView },
  { path: '/games',     name: 'games',     component: GamesView },
  { path: '/bio',       name: 'bio',       component: BioView },
]

export default createRouter({
  history: createWebHashHistory(),
  routes,
  scrollBehavior: () => ({ top: 0 }),
})
