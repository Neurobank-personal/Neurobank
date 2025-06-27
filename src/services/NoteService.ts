import type { INoteRepository } from './interfaces/INoteRepository'
import { JsonNoteRepository } from './repositories/JsonNoteRepository'
import type { Note, CreateNoteRequest, ProcessNoteRequest } from '../types/Note'

export class NoteService {
    private noteRepository: INoteRepository

    constructor() {
        this.noteRepository = new JsonNoteRepository()
    }

    async createNote(noteData: CreateNoteRequest): Promise<Note> {
        this.validateNoteData(noteData)
        return await this.noteRepository.createNote(noteData)
    }

    async processNote(request: ProcessNoteRequest): Promise<Note> {
        const response = await fetch('http://localhost:3001/api/notes/process', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(request)
        })

        if (!response.ok) {
            const error = await response.json()
            throw new Error(error.error || 'AI-bearbetning misslyckades')
        }

        return await response.json()
    }

    async getUserNotes(userId: string): Promise<Note[]> {
        return await this.noteRepository.findNotesByUserId(userId)
    }

    private validateNoteData(noteData: CreateNoteRequest): void {
        if (!noteData.title || noteData.title.trim().length === 0) {
            throw new Error('Titel krävs')
        }

        if (!noteData.content || noteData.content.trim().length === 0) {
            throw new Error('Innehåll krävs')
        }

        if (noteData.content.length > 50000) {
            throw new Error('Innehåll för långt (max 50,000 tecken)')
        }
    }
}