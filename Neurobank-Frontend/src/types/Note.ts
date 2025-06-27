export interface Note {
    id: string
    title: string
    content: string
    processType: 'none' | 'summarize' | 'expand'
    processedContent?: string
    userId: string
    createdAt: Date
    updatedAt: Date
}

export interface CreateNoteRequest {
    title: string
    content: string
    processType: 'none' | 'summarize' | 'expand'
    userId: string
}

export interface ProcessNoteRequest {
    noteId: string
    processType: 'summarize' | 'expand'
}