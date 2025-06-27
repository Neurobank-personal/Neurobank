import type { Note, CreateNoteRequest } from '../../types/Note'

export interface INoteRepository {
    createNote(noteData: CreateNoteRequest): Promise<Note>
    findNoteById(id: string): Promise<Note | null>
    findNotesByUserId(userId: string): Promise<Note[]>
    updateNote(id: string, updates: Partial<Note>): Promise<Note>
    deleteNote(id: string): Promise<boolean>
}