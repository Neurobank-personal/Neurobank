const express = require('express')
const router = express.Router()
const flashcardService = require('../services/flashcardService')

// Skapa ny flashcard
router.post('/', async (req, res, next) => {
    try {
        const { question, answer, categories, userId, deckId } = req.body

        if (!question || !answer || !userId) {
            return res.status(400).json({
                error: 'Question, answer, and userId are required'
            })
        }

        const newFlashcard = await flashcardService.createFlashcard({
            question,
            answer,
            categories: categories || [],
            deckId
        }, userId)

        res.status(201).json(newFlashcard)
    } catch (error) {
        next(error)
    }
})

// Hämta användarens flashcards
router.get('/user/:userId', async (req, res, next) => {
    try {
        const userFlashcards = await flashcardService.getUserFlashcards(req.params.userId)
        res.json(userFlashcards)
    } catch (error) {
        next(error)
    }
})

// Hämta specifik flashcard
router.get('/:flashcardId', async (req, res, next) => {
    try {
        const flashcard = await flashcardService.getFlashcardById(req.params.flashcardId)
        if (!flashcard) {
            return res.status(404).json({ error: 'Flashcard not found' })
        }
        res.json(flashcard)
    } catch (error) {
        next(error)
    }
})

// Uppdatera flashcard
router.put('/:flashcardId', async (req, res, next) => {
    try {
        const updatedFlashcard = await flashcardService.updateFlashcard(req.params.flashcardId, req.body)
        res.json(updatedFlashcard)
    } catch (error) {
        next(error)
    }
})

// Markera flashcard som granskad
router.patch('/:flashcardId/review', async (req, res, next) => {
    try {
        const { difficulty } = req.body

        if (!difficulty || !['easy', 'medium', 'hard'].includes(difficulty)) {
            return res.status(400).json({
                error: 'Valid difficulty (easy, medium, hard) is required'
            })
        }

        const updatedFlashcard = await flashcardService.markCardReviewed(req.params.flashcardId, difficulty)
        res.json(updatedFlashcard)
    } catch (error) {
        next(error)
    }
})

// Ta bort flashcard
router.delete('/:flashcardId', async (req, res, next) => {
    try {
        await flashcardService.deleteFlashcard(req.params.flashcardId)
        res.json({ success: true })
    } catch (error) {
        next(error)
    }
})

module.exports = router
