// API Configuration
export const API_CONFIG = {
    BASE_URL: import.meta.env.VITE_API_URL || 'http://localhost:3001',
    ENDPOINTS: {
        USERS: '/api/users',
        NOTES: '/api/notes',
        NOTES_PROCESS: '/api/notes/process',
        FLASHCARDS: '/api/flashcards',
        DECKS: '/api/decks'
    }
} as const

export const getApiUrl = (endpoint: string) => {
    return `${API_CONFIG.BASE_URL}${endpoint}`
}
