import { ref, computed } from 'vue'
import type { User } from '../types/User'

// Global state för inloggad användare
const currentUser = ref<User | null>(null)
const isAuthenticated = computed(() => currentUser.value !== null)

export const useAuth = () => {
    const login = (user: User) => {
        currentUser.value = user
        // Spara i localStorage för att överleva page refresh
        localStorage.setItem('neurobank_current_user', JSON.stringify(user))
    }

    const logout = () => {
        currentUser.value = null
        localStorage.removeItem('neurobank_current_user')
    }

    const getCurrentUser = () => {
        return currentUser.value
    }

    const getCurrentUserId = () => {
        return currentUser.value?.id || null
    }

    // Återställ användare från localStorage vid page load
    const restoreUser = () => {
        const saved = localStorage.getItem('neurobank_current_user')
        if (saved) {
            try {
                currentUser.value = JSON.parse(saved)
            } catch (error) {
                console.error('Could not restore user from localStorage:', error)
                localStorage.removeItem('neurobank_current_user')
            }
        }
    }

    return {
        currentUser: computed(() => currentUser.value),
        isAuthenticated,
        login,
        logout,
        getCurrentUser,
        getCurrentUserId,
        restoreUser
    }
}
