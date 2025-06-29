import type { Deck, CreateDeckRequest, UpdateDeckRequest } from '../types/Deck'
import type { Flashcard } from '../types/Flashcard'
import { getApiUrl } from '../config/api'

class DeckService {
    async getUserDecks(userId: string): Promise<Deck[]> {
        try {
            const response = await fetch(getApiUrl(`/api/decks/user/${userId}`), {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                }
            })
            if (!response.ok) {
                throw new Error('Failed to fetch user decks')
            }
            return await response.json()
        } catch (error) {
            console.error('Error fetching user decks:', error)
            throw error
        }
    }

    async getDeck(deckId: string): Promise<Deck> {
        try {
            const response = await fetch(getApiUrl(`/api/decks/${deckId}`), {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                }
            })
            if (!response.ok) {
                throw new Error('Failed to fetch deck')
            }
            return await response.json()
        } catch (error) {
            console.error('Error fetching deck:', error)
            throw error
        }
    }

    async createDeck(deckData: CreateDeckRequest): Promise<Deck> {
        try {
            const response = await fetch(getApiUrl('/api/decks'), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(deckData)
            })
            if (!response.ok) {
                throw new Error('Failed to create deck')
            }
            return await response.json()
        } catch (error) {
            console.error('Error creating deck:', error)
            throw error
        }
    }

    async updateDeck(deckData: UpdateDeckRequest): Promise<Deck> {
        try {
            const response = await fetch(getApiUrl(`/api/decks/${deckData.id}`), {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(deckData)
            })
            if (!response.ok) {
                throw new Error('Failed to update deck')
            }
            return await response.json()
        } catch (error) {
            console.error('Error updating deck:', error)
            throw error
        }
    }

    async deleteDeck(deckId: string): Promise<void> {
        try {
            const response = await fetch(getApiUrl(`/api/decks/${deckId}`), {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                }
            })
            if (!response.ok) {
                throw new Error('Failed to delete deck')
            }
        } catch (error) {
            console.error('Error deleting deck:', error)
            throw error
        }
    }

    async getDeckFlashcards(deckId: string): Promise<Flashcard[]> {
        try {
            const response = await fetch(getApiUrl(`/api/decks/${deckId}/flashcards`), {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                }
            })
            if (!response.ok) {
                throw new Error('Failed to fetch deck flashcards')
            }
            return await response.json()
        } catch (error) {
            console.error('Error fetching deck flashcards:', error)
            throw error
        }
    }
}

export default new DeckService()
