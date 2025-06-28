import type { Flashcard } from '../types/Flashcard'
import { getApiUrl } from '../config/api'

class FlashcardService {
    async createFlashcard(flashcardData: { question: string; answer: string; categories: string[]; userId: string }): Promise<Flashcard> {
        try {
            const response = await fetch(getApiUrl('/api/flashcards'), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(flashcardData),
            })

            if (!response.ok) {
                const errorData = await response.json()
                throw new Error(errorData.error || 'Failed to create flashcard')
            }

            const flashcard = await response.json()
            return {
                ...flashcard,
                createdAt: new Date(flashcard.createdAt),
                lastReviewed: flashcard.lastReviewed ? new Date(flashcard.lastReviewed) : undefined
            }
        } catch (error) {
            console.error('Error creating flashcard:', error)
            throw error
        }
    }

    async generateFromNotes(noteIds: string[], userId: string): Promise<Flashcard[]> {
        try {
            const response = await fetch(getApiUrl('/api/notes/generate-flashcards'), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ noteIds, userId }),
            })

            if (!response.ok) {
                const errorData = await response.json()
                throw new Error(errorData.error || 'Failed to generate flashcards')
            }

            const flashcards = await response.json()

            // Convert string dates to Date objects
            return flashcards.map((card: any) => ({
                ...card,
                createdAt: new Date(card.createdAt),
                lastReviewed: card.lastReviewed ? new Date(card.lastReviewed) : undefined
            }))
        } catch (error) {
            console.error('Error generating flashcards:', error)
            throw error
        }
    }

    async getUserFlashcards(userId: string): Promise<Flashcard[]> {
        try {
            const response = await fetch(getApiUrl(`/api/flashcards/user/${userId}`), {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                }
            })

            if (!response.ok) {
                const errorData = await response.json()
                throw new Error(errorData.error || 'Failed to fetch flashcards')
            }

            const flashcards = await response.json()

            // Convert string dates to Date objects
            return flashcards.map((card: any) => ({
                ...card,
                createdAt: new Date(card.createdAt),
                lastReviewed: card.lastReviewed ? new Date(card.lastReviewed) : undefined
            }))
        } catch (error) {
            console.error('Error fetching flashcards:', error)
            throw error
        }
    }

    async updateFlashcard(id: string, updates: Partial<Flashcard>): Promise<Flashcard> {
        try {
            const response = await fetch(getApiUrl(`/api/flashcards/${id}`), {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(updates),
            })

            if (!response.ok) {
                const errorData = await response.json()
                throw new Error(errorData.error || 'Failed to update flashcard')
            }

            const flashcard = await response.json()
            return {
                ...flashcard,
                createdAt: new Date(flashcard.createdAt),
                lastReviewed: flashcard.lastReviewed ? new Date(flashcard.lastReviewed) : undefined
            }
        } catch (error) {
            console.error('Error updating flashcard:', error)
            throw error
        }
    }

    async markCardReviewed(id: string, difficulty: 'easy' | 'medium' | 'hard'): Promise<Flashcard> {
        try {
            const response = await fetch(getApiUrl(`/api/flashcards/${id}/review`), {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ difficulty }),
            })

            if (!response.ok) {
                const errorData = await response.json()
                throw new Error(errorData.error || 'Failed to mark card as reviewed')
            }

            const flashcard = await response.json()
            return {
                ...flashcard,
                createdAt: new Date(flashcard.createdAt),
                lastReviewed: flashcard.lastReviewed ? new Date(flashcard.lastReviewed) : undefined
            }
        } catch (error) {
            console.error('Error marking card as reviewed:', error)
            throw error
        }
    }

    async deleteFlashcard(id: string): Promise<void> {
        try {
            const response = await fetch(getApiUrl(`/api/flashcards/${id}`), {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                }
            })

            if (!response.ok) {
                const errorData = await response.json()
                throw new Error(errorData.error || 'Failed to delete flashcard')
            }
        } catch (error) {
            console.error('Error deleting flashcard:', error)
            throw error
        }
    }
}

export default new FlashcardService()
