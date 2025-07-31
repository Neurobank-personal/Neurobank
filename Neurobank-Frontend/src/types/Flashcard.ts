export interface Flashcard {
  id: string; // Changed from number to string to match backend implementation
  question: string;
  answer: string;
  categories: string[]; // Changed from single category to array
  difficulty?: "easy" | "medium" | "hard";
  lastReviewed?: Date;
  nextReviewDate?: Date; // When the card should be reviewed again
  reviewCount?: number; // How many times the card has been reviewed
  easyCount?: number; // How many times marked as easy (for calculating intervals)
  status?: "remaining" | "completed"; // Card status for spaced repetition
  createdAt: Date;
  sourceNoteId?: string;
  userId?: string;
  deckId?: string; // Added deckId to support deck organization
}

export interface GenerateFlashcardsRequest {
  noteIds: string[];
  userId: string;
  deckId?: string; // Added optional deckId for generating cards to specific deck
}

export interface GeneratedFlashcardData {
  question: string;
  answer: string;
  categories: string[]; // Changed from single category to array
  sourceNoteId: string;
}
