import type { INoteRepository } from '../interfaces/INoteRepository'
import type { Note, CreateNoteRequest } from '../../types/Note'
import { getApiUrl, API_CONFIG } from '../../config/api'

export class JsonNoteRepository implements INoteRepository {
    private readonly apiUrl = getApiUrl(API_CONFIG.ENDPOINTS.NOTES)

    async createNote(noteData: CreateNoteRequest): Promise<Note> {
        const response = await fetch(this.apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(noteData)
        })

        if (!response.ok) {
            const error = await response.json()
            throw new Error(error.error || 'Kunde inte skapa anteckning')
        }

        return await response.json()
    }

    async findNotesByUserId(userId: string): Promise<Note[]> {
        const response = await fetch(`${this.apiUrl}/user/${userId}`)

        if (!response.ok) {
            throw new Error('Kunde inte hämta anteckningar')
        }

        return await response.json()
    }

    async updateNote(id: string, updates: Partial<Note>): Promise<Note> {
        const response = await fetch(`${this.apiUrl}/${id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updates)
        })

        if (!response.ok) {
            const error = await response.json()
            throw new Error(error.error || 'Kunde inte uppdatera anteckning')
        }

        return await response.json()
    }

    async findNoteById(id: string): Promise<Note | null> {
        const response = await fetch(`${this.apiUrl}/${id}`)

        if (response.status === 404) return null
        if (!response.ok) throw new Error('Kunde inte hämta anteckning')

        return await response.json()
    }

    async deleteNote(id: string): Promise<boolean> {
        const response = await fetch(`${this.apiUrl}/${id}`, {
            method: 'DELETE'
        })

        return response.ok
    }
}