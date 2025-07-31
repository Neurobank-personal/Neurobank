import { Router, Request, Response, NextFunction } from 'express'
import noteService from '../services/noteService'
import { Note, CreateNoteRequest, ProcessNoteRequest } from '../types/Note'

const router = Router()

// Skapa ny anteckning
router.post('/', async (req: Request<{}, Note, CreateNoteRequest>, res: Response<Note>, next: NextFunction) => {
    try {
        const newNote = await noteService.createNote(req.body as CreateNoteRequest)
        res.status(201).json(newNote)
    } catch (error) {
        next(error)
    }
})

// Hämta användarens anteckningar
router.get('/user/:userId', async (req: Request<{userId: string}>, res: Response<Note[]>, next: NextFunction) => {
    try {
        const userNotes = await noteService.getUserNotes(req.params.userId)
        res.json(userNotes)
    } catch (error) {
        next(error)
    }
})

// Hämta specifik anteckning
router.get('/:noteId', async (req: Request<{noteId: string}>, res: Response<Note | {error: string}>, next: NextFunction) => {
    try {
        const note = await noteService.getNoteById(req.params.noteId)
        if (!note) {
            return res.status(404).json({ error: 'Anteckning hittades inte' })
        }
        res.json(note)
    } catch (error) {
        next(error)
    }
})

// Uppdatera anteckning
router.put('/:noteId', async (req: Request<{noteId: string}, Note, Partial<Note>>, res: Response<Note>, next: NextFunction) => {
    try {
        const updatedNote = await noteService.updateNote(req.params.noteId, req.body as Partial<Note>)
        res.json(updatedNote)
    } catch (error) {
        next(error)
    }
})

// Partiell uppdatering av anteckning
router.patch('/:noteId', async (req: Request<{noteId: string}, Note, Partial<Note>>, res: Response<Note>, next: NextFunction) => {
    try {
        const updatedNote = await noteService.updateNote(req.params.noteId, req.body as Partial<Note>)
        res.json(updatedNote)
    } catch (error) {
        next(error)
    }
})

// Ta bort anteckning
router.delete('/:noteId', async (req: Request<{noteId: string}>, res: Response<{success: boolean}>, next: NextFunction) => {
    try {
        await noteService.deleteNote(req.params.noteId)
        res.json({ success: true })
    } catch (error) {
        next(error)
    }
})

// Bearbeta anteckning med AI
router.post('/process', async (req: Request<{}, Note | {error: string}, ProcessNoteRequest>, res: Response<Note | {error: string}>, next: NextFunction) => {
    try {
        const { noteId, processType } = req.body as ProcessNoteRequest

        if (!noteId || !processType) {
            return res.status(400).json({
                error: 'noteId och processType krävs'
            })
        }

        const processedNote = await noteService.processNoteWithAI(noteId, processType)
        res.json(processedNote)
    } catch (error) {
        next(error)
    }
})

interface GenerateFlashcardsRequest {
    noteIds: string[];
    userId: string;
    deckId?: string;
}

// Generera flashcards från anteckningar
router.post('/generate-flashcards', async (req: Request<{}, any | {error: string}, GenerateFlashcardsRequest>, res: Response<any | {error: string}>, next: NextFunction) => {
    try {
        const { noteIds, userId, deckId } = req.body as GenerateFlashcardsRequest

        if (!noteIds || !Array.isArray(noteIds) || noteIds.length === 0) {
            return res.status(400).json({
                error: 'noteIds krävs och måste vara en array med minst ett ID'
            })
        }

        if (!userId) {
            return res.status(400).json({
                error: 'userId krävs'
            })
        }

        const flashcards = await noteService.generateFlashcardsFromNotes(noteIds, userId, deckId)
        res.json(flashcards)
    } catch (error) {
        next(error)
    }
})

export default router
