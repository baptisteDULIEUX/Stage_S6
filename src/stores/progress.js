import { defineStore } from 'pinia'
import { ref } from 'vue'

// ─── Définition du parcours ───────────────────────────────────────────────────
// L'ordre ici est la loi. Chaque étape débloque la suivante.
export const JOURNEY = [
    { id: 'intro',     route: '/intro',     label: "C'est quoi ?", emoji: '📖', color: '#FF6B6B' },
    { id: 'pixels',    route: '/pixels',    label: 'Les pixels',   emoji: '🖼️', color: '#FF9F43' },
    { id: 'simulator', route: '/simulator', label: 'Simulateur',   emoji: '🐾', color: '#4ECDC4' },
    { id: 'bio',       route: '/bio',       label: 'Biologie',     emoji: '🔬', color: '#6BCB77' },
    { id: 'mnist',     route: '/mnist',     label: 'Dessine !',    emoji: '✏️', color: '#4D96FF' },
    { id: 'games',     route: '/games',     label: 'Mini-jeux',    emoji: '🎮', color: '#A78BFA' },
]

const STORAGE_KEY = 'neuralkids-progress'

// ─── Store Pinia ──────────────────────────────────────────────────────────────
export const useProgressStore = defineStore('progress', () => {

    // Chargement depuis localStorage (persistance entre sessions)
    const saved = localStorage.getItem(STORAGE_KEY)
    const completedIds = ref(new Set(saved ? JSON.parse(saved) : []))

    // ── Lecture ────────────────────────────────────────────────────────────────

    /** Vrai si l'étape a été complétée */
    function isCompleted(id) {
        return completedIds.value.has(id)
    }

    /** Vrai si l'étape est accessible (= la précédente est complétée, ou c'est la 1ère) */
    function isUnlocked(id) {
        const idx = JOURNEY.findIndex(s => s.id === id)
        if (idx <= 0) return true
        return completedIds.value.has(JOURNEY[idx - 1].id)
    }

    /** Index de l'étape en cours (première non-complétée) */
    function currentIndex() {
        const idx = JOURNEY.findIndex(s => !completedIds.value.has(s.id))
        return idx === -1 ? JOURNEY.length - 1 : idx
    }

    // ── Écriture ───────────────────────────────────────────────────────────────

    /** Marque une étape comme complétée et sauvegarde */
    function completeStep(id) {
        completedIds.value.add(id)
        localStorage.setItem(STORAGE_KEY, JSON.stringify([...completedIds.value]))
    }

    /** Retourne la route de l'étape suivante (ou '/' si c'est la dernière) */
    function nextRoute(id) {
        const idx = JOURNEY.findIndex(s => s.id === id)
        if (idx !== -1 && idx < JOURNEY.length - 1) return JOURNEY[idx + 1].route
        return '/'
    }

    /** Réinitialise toute la progression */
    function reset() {
        completedIds.value = new Set()
        localStorage.removeItem(STORAGE_KEY)
    }

    return {
        completedIds,
        isCompleted,
        isUnlocked,
        currentIndex,
        completeStep,
        nextRoute,
        reset,
    }
})