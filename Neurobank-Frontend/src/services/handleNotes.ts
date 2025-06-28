import { NoteService } from './NoteService'
import type { CreateNoteRequest, ProcessNoteRequest, Note } from '../types/Note'

const noteService = new NoteService()

interface CreateNoteResponse {
    success: true
    note: Note
    message: string
}

interface CreateNoteError {
    success: false
    error: string
}

interface ProcessNoteResponse {
    success: true
    note: Note
    message: string
}

interface ProcessNoteError {
    success: false
    error: string
}

interface GetNotesResponse {
    success: true
    notes: Note[]
}

interface GetNotesError {
    success: false
    error: string
}

interface UpdateNoteResponse {
    success: true
    note: Note
    message: string
}

interface UpdateNoteError {
    success: false
    error: string
}

export const handleCreateNote = async (noteData: CreateNoteRequest): Promise<CreateNoteResponse | CreateNoteError> => {
    try {
        const note = await noteService.createNote(noteData)
        return {
            success: true,
            note,
            message: 'Anteckning skapad!'
        }
    } catch (error) {
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Ett fel uppstod'
        }
    }
}

export const handleProcessNote = async (request: ProcessNoteRequest): Promise<ProcessNoteResponse | ProcessNoteError> => {
    try {
        const note = await noteService.processNote(request)
        return {
            success: true,
            note,
            message: 'AI-bearbetning klar!'
        }
    } catch (error) {
        return {
            success: false,
            error: error instanceof Error ? error.message : 'AI-bearbetning misslyckades'
        }
    }
}

export const handleGetUserNotes = async (userId: string) => {
    try {
        const notes = await noteService.getUserNotes(userId)
        return {
            success: true,
            notes
        }
    } catch (error) {
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Kunde inte hämta anteckningar'
        }
    }
}

export const handleGetNotes = async (userId: string): Promise<GetNotesResponse | GetNotesError> => {
    try {
        const notes = await noteService.getUserNotes(userId)
        return {
            success: true,
            notes
        }
    } catch (error) {
        console.error('Fel vid hämtning av anteckningar:', error)
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Ett oväntat fel uppstod'
        }
    }
}

export const handleUpdateNote = async (
    noteId: string,
    updates: Partial<Pick<Note, 'title' | 'content' | 'processedContent'>>
): Promise<UpdateNoteResponse | UpdateNoteError> => {
    try {
        const note = await noteService.updateNote(noteId, updates)
        return {
            success: true,
            note,
            message: 'Anteckning uppdaterad!'
        }
    } catch (error) {
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Kunde inte uppdatera anteckning'
        }
    }
}