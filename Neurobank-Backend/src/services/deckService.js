const { v4: uuidv4 } = require('uuid')
const fileService = require('./fileService')

class DeckService {
    constructor() {
        this.dataFile = 'decks.json'
    }

    async getUserDecks(userId) {
        try {
            const decks = await fileService.readDecks()
            const userDecks = decks.filter(deck => deck.userId === userId)

            // Add flashcard count to each deck
            const flashcards = await fileService.readFlashcards()

            return userDecks.map(deck => ({
                ...deck,
                flashcardCount: flashcards.filter(card => card.deckId === deck.id).length
            }))
        } catch (error) {
            console.error('Error getting user decks:', error)
            throw error
        }
    }

    async getDeck(deckId) {
        try {
            const decks = await fileService.readDecks()
            const deck = decks.find(d => d.id === deckId)

            if (!deck) return null

            // Add flashcard count
            const flashcards = await fileService.readFlashcards()
            deck.flashcardCount = flashcards.filter(card => card.deckId === deckId).length

            return deck
        } catch (error) {
            console.error('Error getting deck:', error)
            throw error
        }
    }

    async createDeck(deckData) {
        try {
            const decks = await fileService.readDecks()

            const newDeck = {
                id: uuidv4(),
                name: deckData.name,
                description: deckData.description || '',
                color: deckData.color || '',
                userId: deckData.userId,
                createdAt: new Date(),
                updatedAt: new Date(),
                flashcardCount: 0
            }

            decks.push(newDeck)
            await fileService.writeDecks(decks)

            return newDeck
        } catch (error) {
            console.error('Error creating deck:', error)
            throw error
        }
    }

    async updateDeck(deckId, updates) {
        try {
            const decks = await fileService.readDecks()
            const deckIndex = decks.findIndex(d => d.id === deckId)

            if (deckIndex === -1) return null

            const updatedDeck = {
                ...decks[deckIndex],
                ...updates,
                updatedAt: new Date()
            }

            decks[deckIndex] = updatedDeck
            await fileService.writeDecks(decks)

            // Add flashcard count
            const flashcards = await fileService.readFlashcards()
            updatedDeck.flashcardCount = flashcards.filter(card => card.deckId === deckId).length

            return updatedDeck
        } catch (error) {
            console.error('Error updating deck:', error)
            throw error
        }
    }

    async deleteDeck(deckId) {
        try {
            const decks = await fileService.readDecks()
            const deckIndex = decks.findIndex(d => d.id === deckId)

            if (deckIndex === -1) return false

            // Remove deck
            decks.splice(deckIndex, 1)
            await fileService.writeDecks(decks)

            // Move flashcards from this deck to general collection (remove deckId)
            const flashcards = await fileService.readFlashcards()
            const updatedFlashcards = flashcards.map(card => {
                if (card.deckId === deckId) {
                    const { deckId: _, ...cardWithoutDeck } = card
                    return cardWithoutDeck
                }
                return card
            })

            await fileService.writeFlashcards(updatedFlashcards)

            return true
        } catch (error) {
            console.error('Error deleting deck:', error)
            throw error
        }
    }

    async getDeckFlashcards(deckId) {
        try {
            const flashcards = await fileService.readFlashcards()
            return flashcards.filter(card => card.deckId === deckId)
        } catch (error) {
            console.error('Error getting deck flashcards:', error)
            throw error
        }
    }
}

module.exports = new DeckService()
