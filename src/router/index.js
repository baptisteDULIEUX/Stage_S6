import { createRouter, createWebHashHistory } from 'vue-router'
import HomeView      from '../views/HomeView.vue'
import IntroView     from '../views/IntroView.vue'
import PixelsView    from '../views/PixelsView.vue'
import SimulatorView from '../views/SimulatorView.vue'
import BioView       from '../views/BioView.vue'
import GamesView     from '../views/GamesView.vue'
import MnistView     from '../views/MnistView.vue'

const routes = [
  {
    path: '/',
    name: 'home',
    component: HomeView,
    meta: { title: 'Accueil', inJourney: false },
  },
  {
    path: '/intro',
    name: 'intro',
    component: IntroView,
    meta: { title: "C'est quoi un neurone ?", stepId: 'intro', inJourney: true },
  },
  {
    path: '/pixels',
    name: 'pixels',
    component: PixelsView,
    meta: { title: 'Les pixels', stepId: 'pixels', inJourney: true },
  },
  {
    path: '/simulator',
    name: 'simulator',
    component: SimulatorView,
    meta: { title: 'Simulateur Chat/Chien', stepId: 'simulator', inJourney: true },
  },
  {
    path: '/bio',
    name: 'bio',
    component: BioView,
    meta: { title: 'Parallèle biologique', stepId: 'bio', inJourney: true },
  },
  {
    path: '/games',
    name: 'games',
    component: GamesView,
    meta: { title: 'Mini-jeux CNN', stepId: 'games', inJourney: true },
  },
  {
    path: '/mnist',
    name: 'mnist',
    component: MnistView,
    meta: { title: 'Dessine !', stepId: 'mnist', inJourney: true },
  },
]

const router = createRouter({
  history: createWebHashHistory(),
  routes,
  scrollBehavior: () => ({ top: 0 }),
})

export default router