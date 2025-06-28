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
}

export interface GenerateFlashcardsRequest {
    noteIds: string[]
    userId: string
}

export interface GeneratedFlashcardData {
    question: string
    answer: string
    categories: string[] // Changed from single category to array
    sourceNoteId: string
}
