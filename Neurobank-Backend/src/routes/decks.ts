import { Router, Request, Response, NextFunction } from 'express'
import deckService from '../services/deckService'
import { Deck, CreateDeckRequest, UpdateDeckRequest } from '../types/Deck'
import { Flashcard } from '../types/Flashcard'

const router = Router()

// Get all decks for a user
router.get('/user/:userId', async (req: Request<{userId: string}>, res: Response<Deck[]>, next: NextFunction) => {
    try {
        const { userId } = req.params
        const decks = await deckService.getUserDecks(userId)
        res.json(decks)
    } catch (error) {
        next(error)
    }
})

// Get a specific deck
router.get('/:deckId', async (req: Request<{deckId: string}>, res: Response<Deck | {error: string}>, next: NextFunction) => {
    try {
        const { deckId } = req.params
        const deck = await deckService.getDeck(deckId)

        if (!deck) {
            return res.status(404).json({ error: 'Deck not found' })
        }

        res.json(deck)
    } catch (error) {
        next(error)
    }
})

// Create a new deck
router.post('/', async (req: Request<{}, Deck | {error: string}, CreateDeckRequest>, res: Response<Deck | {error: string}>, next: NextFunction) => {
    try {
        const { name, description, color, userId } = req.body as CreateDeckRequest

        if (!name || !userId) {
            return res.status(400).json({ error: 'Name and userId are required' })
        }

        const deck = await deckService.createDeck({
            name,
            description,
            color,
            userId
        })

        res.status(201).json(deck)
    } catch (error) {
        next(error)
    }
})

// Update a deck
router.put('/:deckId', async (req: Request<{deckId: string}, Deck | {error: string}, Partial<Deck>>, res: Response<Deck | {error: string}>, next: NextFunction) => {
    try {
        const { deckId } = req.params
        const { name, description, color } = req.body as Partial<Deck>

        const deck = await deckService.updateDeck(deckId, {
            name,
            description,
            color
        })

        if (!deck) {
            return res.status(404).json({ error: 'Deck not found' })
        }

        res.json(deck)
    } catch (error) {
        next(error)
    }
})

// Delete a deck
router.delete('/:deckId', async (req: Request<{deckId: string}>, res: Response<{error: string} | void>, next: NextFunction) => {
    try {
        const { deckId } = req.params
        const success = await deckService.deleteDeck(deckId)

        if (!success) {
            return res.status(404).json({ error: 'Deck not found' })
        }

        res.status(204).send()
    } catch (error) {
        next(error)
    }
})

// Get flashcards for a specific deck
router.get('/:deckId/flashcards', async (req: Request<{deckId: string}>, res: Response<Flashcard[]>, next: NextFunction) => {
    try {
        const { deckId } = req.params
        const flashcards = await deckService.getDeckFlashcards(deckId)
        res.json(flashcards)
    } catch (error) {
        next(error)
    }
})

export default router
