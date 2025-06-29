export interface Flashcard {
    id: number
    question: string
    answer: string
    categories: string[] // Changed from single category to array
    difficulty?: 'easy' | 'medium' | 'hard'
    lastReviewed?: Date
    createdAt: Date
    sourceNoteId?: string
    userId?: string
    deckId?: string // Added deckId to support deck organization
}

export interface GenerateFlashcardsRequest {
    noteIds: string[]
    userId: string
    deckId?: string // Added optional deckId for generating cards to specific deck
}

export interface GeneratedFlashcardData {
    question: string
    answer: string
    categories: string[] // Changed from single category to array
    sourceNoteId: string
}
