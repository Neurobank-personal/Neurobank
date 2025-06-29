const fileService = require('./fileService')

class FlashcardService {
    generateId() {
        return Date.now().toString() + Math.random().toString(36).substr(2, 9)
    }

    async createFlashcard(flashcardData, userId) {
        const allFlashcards = await fileService.readFlashcards()

        const newFlashcard = {
            id: this.generateId(),
            question: flashcardData.question,
            answer: flashcardData.answer,
            categories: Array.isArray(flashcardData.categories) ? flashcardData.categories : [flashcardData.categories],
            difficulty: null,
            userId,
            sourceNoteId: null,
            deckId: flashcardData.deckId || null, // Added deckId support
            lastReviewed: null,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        }

        allFlashcards.push(newFlashcard)
        await fileService.writeFlashcards(allFlashcards)

        return newFlashcard
    }

    async saveFlashcards(flashcards, userId) {
        const allFlashcards = await fileService.readFlashcards()

        const flashcardsToSave = flashcards.map(card => ({
            id: this.generateId(),
            question: card.question,
            answer: card.answer,
            categories: Array.isArray(card.categories) ? card.categories : [card.categories],
            difficulty: card.difficulty || null,
            userId,
            sourceNoteId: card.sourceNoteId || null,
            deckId: card.deckId || null, // Added deckId support
            lastReviewed: null,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        }))

        allFlashcards.push(...flashcardsToSave)
        await fileService.writeFlashcards(allFlashcards)

        return flashcardsToSave
    }

    async getUserFlashcards(userId) {
        const allFlashcards = await fileService.readFlashcards()
        return allFlashcards.filter(card => card.userId === userId)
    }

    async getFlashcardById(flashcardId) {
        const allFlashcards = await fileService.readFlashcards()
        return allFlashcards.find(card => card.id === flashcardId)
    }

    async updateFlashcard(flashcardId, updates) {
        const allFlashcards = await fileService.readFlashcards()
        const cardIndex = allFlashcards.findIndex(card => card.id === flashcardId)

        if (cardIndex === -1) {
            throw new Error('Flashcard not found')
        }

        allFlashcards[cardIndex] = {
            ...allFlashcards[cardIndex],
            ...updates,
            updatedAt: new Date().toISOString()
        }

        await fileService.writeFlashcards(allFlashcards)
        return allFlashcards[cardIndex]
    }

    async deleteFlashcard(flashcardId) {
        const allFlashcards = await fileService.readFlashcards()
        const filteredFlashcards = allFlashcards.filter(card => card.id !== flashcardId)

        if (allFlashcards.length === filteredFlashcards.length) {
            throw new Error('Flashcard not found')
        }

        await fileService.writeFlashcards(filteredFlashcards)
        return true
    }

    async markCardReviewed(flashcardId, difficulty) {
        return this.updateFlashcard(flashcardId, {
            difficulty,
            lastReviewed: new Date().toISOString()
        })
    }
}

module.exports = new FlashcardService()
