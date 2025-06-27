const fileService = require('./fileService')
const aiService = require('./aiService')
const { validateNote, validateProcessType } = require('../utils/validation')

class NoteService {
    generateId() {
        return Date.now().toString() + Math.random().toString(36).substr(2, 9)
    }

    async createNote(noteData) {
        validateNote(noteData)

        const { title, content, processType, userId } = noteData
        const notes = await fileService.readNotes()

        const newNote = {
            id: this.generateId(),
            title,
            content,
            processType,
            userId,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        }

        notes.push(newNote)
        await fileService.writeNotes(notes)

        return newNote
    }

    async getUserNotes(userId) {
        const notes = await fileService.readNotes()
        return notes.filter(note => note.userId === userId)
    }

    async getNoteById(noteId) {
        const notes = await fileService.readNotes()
        return notes.find(note => note.id === noteId)
    }

    async updateNote(noteId, updates) {
        const notes = await fileService.readNotes()
        const noteIndex = notes.findIndex(note => note.id === noteId)

        if (noteIndex === -1) {
            throw new Error('Anteckning hittades inte')
        }

        notes[noteIndex] = {
            ...notes[noteIndex],
            ...updates,
            updatedAt: new Date().toISOString()
        }

        await fileService.writeNotes(notes)
        return notes[noteIndex]
    }

    async processNoteWithAI(noteId, processType) {
        validateProcessType(processType)

        const note = await this.getNoteById(noteId)

        if (!note) {
            throw new Error('Anteckning hittades inte')
        }

        const processedContent = await aiService.processText(note.content, processType)

        return this.updateNote(noteId, {
            processedContent,
            processType
        })
    }

    async deleteNote(noteId) {
        const notes = await fileService.readNotes()
        const filteredNotes = notes.filter(note => note.id !== noteId)

        if (notes.length === filteredNotes.length) {
            throw new Error('Anteckning hittades inte')
        }

        await fileService.writeNotes(filteredNotes)
        return true
    }
}

module.exports = new NoteService()
