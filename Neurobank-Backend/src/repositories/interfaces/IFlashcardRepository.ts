import { Flashcard } from '../../types/Flashcard';

export interface IFlashcardRepository {
  findAll(): Promise<Flashcard[]>;
  findById(id: string): Promise<Flashcard | undefined>;
  findByUserId(userId: string): Promise<Flashcard[]>;
  findByDeckId(deckId: string): Promise<Flashcard[]>;
  findBySourceNoteId(sourceNoteId: string): Promise<Flashcard[]>;
  create(flashcard: Flashcard): Promise<Flashcard>;
  update(id: string, flashcard: Partial<Flashcard>): Promise<Flashcard | undefined>;
  delete(id: string): Promise<boolean>;
  save(flashcards: Flashcard[]): Promise<void>;
}