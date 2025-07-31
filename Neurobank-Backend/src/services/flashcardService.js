const dataService = require("./dataService");
const statisticsService = require("./statisticsService");

class FlashcardService {
  generateId() {
    return Date.now().toString() + Math.random().toString(36).substr(2, 9);
  }

  async createFlashcard(flashcardData, userId) {
    const allFlashcards = await dataService.getFlashcards();

    const newFlashcard = {
      id: this.generateId(),
      question: flashcardData.question,
      answer: flashcardData.answer,
      categories: Array.isArray(flashcardData.categories)
        ? flashcardData.categories
        : [flashcardData.categories],
      difficulty: null,
      userId,
      sourceNoteId: null,
      deckId: flashcardData.deckId || null, // Added deckId support
      lastReviewed: null,
      nextReviewDate: null,
      reviewCount: 0,
      easyCount: 0,
      status: "remaining", // New cards start as remaining
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    allFlashcards.push(newFlashcard);
    await dataService.saveFlashcards(allFlashcards);

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

  async saveFlashcards(flashcards, userId) {
    const allFlashcards = await dataService.getFlashcards();

    const flashcardsToSave = flashcards.map((card) => ({
      id: this.generateId(),
      question: card.question,
      answer: card.answer,
      categories: Array.isArray(card.categories)
        ? card.categories
        : [card.categories],
      difficulty: card.difficulty || null,
      userId,
      sourceNoteId: card.sourceNoteId || null,
      deckId: card.deckId || null, // Added deckId support
      lastReviewed: null,
      nextReviewDate: null,
      reviewCount: 0,
      easyCount: 0,
      status: "remaining", // New cards start as remaining
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }));

    allFlashcards.push(...flashcardsToSave);
    await dataService.saveFlashcards(allFlashcards);

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

    return flashcardsToSave;
  }

  async getUserFlashcards(userId) {
    const allFlashcards = await dataService.getFlashcards();
    return allFlashcards.filter((card) => card.userId === userId);
  }

  async getFlashcardById(flashcardId) {
    const allFlashcards = await dataService.getFlashcards();
    return allFlashcards.find((card) => card.id === flashcardId);
  }

  async updateFlashcard(flashcardId, updates) {
    const allFlashcards = await dataService.getFlashcards();
    const cardIndex = allFlashcards.findIndex(
      (card) => card.id === flashcardId
    );

    if (cardIndex === -1) {
      throw new Error("Flashcard not found");
    }

    allFlashcards[cardIndex] = {
      ...allFlashcards[cardIndex],
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    await dataService.saveFlashcards(allFlashcards);
    return allFlashcards[cardIndex];
  }

  async deleteFlashcard(flashcardId) {
    const allFlashcards = await dataService.getFlashcards();
    const filteredFlashcards = allFlashcards.filter(
      (card) => card.id !== flashcardId
    );

    if (allFlashcards.length === filteredFlashcards.length) {
      throw new Error("Flashcard not found");
    }

    await dataService.saveFlashcards(filteredFlashcards);
    return true;
  }

  async markCardReviewed(flashcardId, difficulty) {
    console.log("markCardReviewed called with:", flashcardId, difficulty);

    const updates = {
      difficulty,
      lastReviewed: new Date().toISOString(),
      status: "completed",
    };

    console.log("Getting flashcard by ID...");
    // Calculate next review date based on difficulty and previous intervals
    const card = await this.getFlashcardById(flashcardId);
    if (!card) {
      console.log("Flashcard not found!");
      throw new Error("Flashcard not found");
    }

    console.log("Found card:", card.id);

    const now = new Date();
    const lastReviewed = card.lastReviewed
      ? new Date(card.lastReviewed)
      : new Date(card.createdAt);
    const daysSinceLastReview = Math.max(
      1,
      Math.floor((now - lastReviewed) / (1000 * 60 * 60 * 24))
    );

    let nextReviewDays = 1; // Default minimum
    const easyCount = card.easyCount || 0;
    const reviewCount = (card.reviewCount || 0) + 1;

    console.log("Calculating review intervals...");

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

    console.log("Updating flashcard...");
    const updatedCard = await this.updateFlashcard(flashcardId, updates);

    console.log("Recording statistics...");
    // Registrera statistik för studerad flashcard
    try {
      await statisticsService.recordFlashcardStudied(card.userId, 1);
    } catch (error) {
      console.error("Failed to record flashcard study in statistics:", error);
    }

    console.log("markCardReviewed completed successfully");
    return updatedCard;
  }

  async markCardCustomReview(flashcardId, days, timeUnit) {
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

    const updates = {
      difficulty: "custom",
      lastReviewed: now.toISOString(),
      status: "completed",
      nextReviewDate: nextReviewDate.toISOString(),
      reviewCount: reviewCount,
    };

    return this.updateFlashcard(flashcardId, updates);
  }

  async moveExpiredCardsToRemaining(userId) {
    const allFlashcards = await dataService.getFlashcards();
    const userFlashcards = allFlashcards.filter(
      (card) => card.userId === userId
    );
    const now = new Date();
    let movedCount = 0;

    const updatedFlashcards = allFlashcards.map((card) => {
      if (
        card.userId === userId &&
        card.status === "completed" &&
        card.nextReviewDate &&
        new Date(card.nextReviewDate) <= now
      ) {
        movedCount++;
        return {
          ...card,
          status: "remaining",
          updatedAt: new Date().toISOString(),
        };
      }
      return card;
    });

    if (movedCount > 0) {
      await dataService.saveFlashcards(updatedFlashcards);
    }

    return movedCount;
  }

  async resetCardToRemaining(flashcardId) {
    const updates = {
      status: "remaining",
      nextReviewDate: null,
    };

    return this.updateFlashcard(flashcardId, updates);
  }

  async getUserFlashcards(userId) {
    // First move expired cards back to remaining
    await this.moveExpiredCardsToRemaining(userId);

    const allFlashcards = await dataService.getFlashcards();
    return allFlashcards.filter((card) => card.userId === userId);
  }
}

module.exports = new FlashcardService();
