const express = require('express')
const router = express.Router()
const noteService = require('../services/noteService')

// Skapa ny anteckning
router.post('/', async (req, res, next) => {
    try {
        const newNote = await noteService.createNote(req.body)
        res.status(201).json(newNote)
    } catch (error) {
        next(error)
    }
})

// Hämta användarens anteckningar
router.get('/user/:userId', async (req, res, next) => {
    try {
        const userNotes = await noteService.getUserNotes(req.params.userId)
        res.json(userNotes)
    } catch (error) {
        next(error)
    }
})

// Hämta specifik anteckning
router.get('/:noteId', async (req, res, next) => {
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
router.put('/:noteId', async (req, res, next) => {
    try {
        const updatedNote = await noteService.updateNote(req.params.noteId, req.body)
        res.json(updatedNote)
    } catch (error) {
        next(error)
    }
})

// Ta bort anteckning
router.delete('/:noteId', async (req, res, next) => {
    try {
        await noteService.deleteNote(req.params.noteId)
        res.json({ success: true })
    } catch (error) {
        next(error)
    }
})

// Bearbeta anteckning med AI
router.post('/process', async (req, res, next) => {
    try {
        const { noteId, processType } = req.body

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

module.exports = router
