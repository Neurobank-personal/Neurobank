export interface Flashcard {
  id: string;
  question: string;
  answer: string;
  categories: string[];
  difficulty?: "easy" | "medium" | "hard" | "custom" | null;
  lastReviewed?: string | null;
  nextReviewDate?: string | null;
  reviewCount?: number;
  easyCount?: number;
  status?: "remaining" | "completed";
  createdAt: string;
  updatedAt?: string;
  sourceNoteId?: string | null;
  userId?: string;
  deckId?: string | null;
}

export interface GenerateFlashcardsRequest {
  noteIds: string[];
  userId: string;
  deckId?: string;
}

export interface GeneratedFlashcardData {
  question: string;
  answer: string;
  categories: string[];
  sourceNoteId: string;
}