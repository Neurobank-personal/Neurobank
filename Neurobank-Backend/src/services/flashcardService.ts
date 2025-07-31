import { RepositoryFactory } from '../repositories/RepositoryFactory';
import { IFlashcardRepository } from '../repositories/interfaces/IFlashcardRepository';
import statisticsService from "./statisticsService";
import { Flashcard } from "../types/Flashcard";

interface CreateFlashcardData {
  question: string;
  answer: string;
  categories: string[] | string;
  deckId?: string | null;
}

interface SaveFlashcardData {
  question: string;
  answer: string;
  categories: string[] | string;
  difficulty?: "easy" | "medium" | "hard" | "custom" | null;
  sourceNoteId?: string | null;
  deckId?: string | null;
}

class FlashcardService {
  private flashcardRepository: IFlashcardRepository;

  constructor() {
    this.flashcardRepository = RepositoryFactory.getFlashcardRepository();
  }

  generateId(): string {
    return Date.now().toString() + Math.random().toString(36).substr(2, 9);
  }

  async createFlashcard(flashcardData: CreateFlashcardData, userId: string): Promise<Flashcard> {
    const newFlashcard: Flashcard = {
      id: this.generateId(),
      question: flashcardData.question,
      answer: flashcardData.answer,
      categories: Array.isArray(flashcardData.categories)
        ? flashcardData.categories
        : [flashcardData.categories],
      difficulty: null,
      userId,
      sourceNoteId: null,
      deckId: flashcardData.deckId || null,
      lastReviewed: null,
      nextReviewDate: null,
      reviewCount: 0,
      easyCount: 0,
      status: "remaining",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await this.flashcardRepository.create(newFlashcard);

    // Registrera statistik för skapad flashcard
    try {
      await statisticsService.recordFlashcardsCreated(userId, 1);
    } catch (error) {
      console.error(
        "Failed to record flashcard creation in statistics:",
        error
      );
    }

    return newFlashcard;
  }

  async saveFlashcards(flashcards: SaveFlashcardData[], userId: string): Promise<Flashcard[]> {
    const flashcardsToSave: Flashcard[] = flashcards.map((card) => ({
      id: this.generateId(),
      question: card.question,
      answer: card.answer,
      categories: Array.isArray(card.categories)
        ? card.categories
        : [card.categories],
      difficulty: card.difficulty || null,
      userId,
      sourceNoteId: card.sourceNoteId || null,
      deckId: card.deckId || null,
      lastReviewed: null,
      nextReviewDate: null,
      reviewCount: 0,
      easyCount: 0,
      status: "remaining",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }));

    // Create each flashcard using repository
    const savedFlashcards: Flashcard[] = [];
    for (const card of flashcardsToSave) {
      const savedCard = await this.flashcardRepository.create(card);
      savedFlashcards.push(savedCard);
    }

    // Registrera statistik för skapade flashcards
    try {
      await statisticsService.recordFlashcardsCreated(
        userId,
        flashcardsToSave.length
      );
    } catch (error) {
      console.error(
        "Failed to record flashcard creation in statistics:",
        error
      );
    }

    return savedFlashcards;
  }

  async getUserFlashcards(userId: string): Promise<Flashcard[]> {
    // First move expired cards back to remaining
    await this.moveExpiredCardsToRemaining(userId);

    return await this.flashcardRepository.findByUserId(userId);
  }

  async getFlashcardById(flashcardId: string): Promise<Flashcard | undefined> {
    return await this.flashcardRepository.findById(flashcardId);
  }

  async updateFlashcard(flashcardId: string, updates: Partial<Omit<Flashcard, 'id' | 'createdAt'>>): Promise<Flashcard> {
    const updatesWithTimestamp = {
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    const updatedCard = await this.flashcardRepository.update(flashcardId, updatesWithTimestamp);
    
    if (!updatedCard) {
      throw new Error("Flashcard not found");
    }

    return updatedCard;
  }

  async deleteFlashcard(flashcardId: string): Promise<boolean> {
    const success = await this.flashcardRepository.delete(flashcardId);
    
    if (!success) {
      throw new Error("Flashcard not found");
    }
    
    return success;
  }

  async markCardReviewed(flashcardId: string, difficulty: "easy" | "medium" | "hard"): Promise<Flashcard> {
    const updates: Partial<Flashcard> = {
      difficulty,
      lastReviewed: new Date().toISOString(),
      status: "completed",
    };

    // Calculate next review date based on difficulty and previous intervals
    const card = await this.getFlashcardById(flashcardId);
    if (!card) {
      throw new Error("Flashcard not found");
    }

    const now = new Date();
    const lastReviewed = card.lastReviewed
      ? new Date(card.lastReviewed)
      : new Date(card.createdAt);
    const daysSinceLastReview = Math.max(
      1,
      Math.floor((now.getTime() - lastReviewed.getTime()) / (1000 * 60 * 60 * 24))
    );

    let nextReviewDays = 1; // Default minimum
    const easyCount = card.easyCount || 0;
    const reviewCount = (card.reviewCount || 0) + 1;

    if (difficulty === "easy") {
      // Progressive intervals: 1, 2, 3, 5, 8, 13, 20, 30, 45, 70, 100, 150, 210, 270, 300 days max
      const easyIntervals = [
        1, 2, 3, 5, 8, 13, 20, 30, 45, 70, 100, 150, 210, 270, 300,
      ];
      const newEasyCount = easyCount + 1;
      nextReviewDays =
        easyIntervals[Math.min(newEasyCount - 1, easyIntervals.length - 1)] ||
        300;
      updates.easyCount = newEasyCount;
    } else if (difficulty === "medium") {
      // Same interval as last time, minimum 5 days
      nextReviewDays = Math.max(5, daysSinceLastReview);

      // If card had an easy streak, reduce easy count slightly
      if (easyCount > 0) {
        updates.easyCount = Math.max(0, easyCount - 1);
      }
    } else if (difficulty === "hard") {
      // 60% of last interval, minimum 1 day
      nextReviewDays = Math.max(1, Math.floor(daysSinceLastReview * 0.6));

      // If card had an easy streak, reduce easy count more significantly
      if (easyCount > 0) {
        updates.easyCount = Math.max(0, easyCount - 2);
      }
    }

    const nextReviewDate = new Date(now);
    nextReviewDate.setDate(nextReviewDate.getDate() + nextReviewDays);

    updates.nextReviewDate = nextReviewDate.toISOString();
    updates.reviewCount = reviewCount;

    const updatedCard = await this.updateFlashcard(flashcardId, updates);

    // Registrera statistik för studerad flashcard
    try {
      await statisticsService.recordFlashcardStudied(card.userId!, 1);
    } catch (error) {
      console.error("Failed to record flashcard study in statistics:", error);
    }

    return updatedCard;
  }

  async markCardCustomReview(flashcardId: string, days: number, timeUnit: "days" | "months"): Promise<Flashcard> {
    const card = await this.getFlashcardById(flashcardId);
    if (!card) {
      throw new Error("Flashcard not found");
    }

    const now = new Date();
    const reviewCount = (card.reviewCount || 0) + 1;

    // Calculate the next review date based on custom input
    // If timeUnit is "months", multiply days by 30 (assuming 30 days per month)
    const actualDays = timeUnit === "months" ? days * 30 : days;

    const nextReviewDate = new Date(now);
    nextReviewDate.setDate(nextReviewDate.getDate() + actualDays);

    const updates: Partial<Flashcard> = {
      difficulty: "custom",
      lastReviewed: now.toISOString(),
      status: "completed",
      nextReviewDate: nextReviewDate.toISOString(),
      reviewCount: reviewCount,
    };

    return this.updateFlashcard(flashcardId, updates);
  }

  async moveExpiredCardsToRemaining(userId: string): Promise<number> {
    const userFlashcards = await this.flashcardRepository.findByUserId(userId);
    const now = new Date();
    let movedCount = 0;

    for (const card of userFlashcards) {
      if (
        card.status === "completed" &&
        card.nextReviewDate &&
        new Date(card.nextReviewDate) <= now
      ) {
        await this.flashcardRepository.update(card.id, {
          status: "remaining",
          updatedAt: new Date().toISOString(),
        });
        movedCount++;
      }
    }

    return movedCount;
  }

  async resetCardToRemaining(flashcardId: string): Promise<Flashcard> {
    const updates: Partial<Flashcard> = {
      status: "remaining",
      nextReviewDate: null,
    };

    return this.updateFlashcard(flashcardId, updates);
  }
}

export default new FlashcardService();