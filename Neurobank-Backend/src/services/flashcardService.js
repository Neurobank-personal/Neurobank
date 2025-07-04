const fileService = require("./fileService");

class FlashcardService {
  generateId() {
    return Date.now().toString() + Math.random().toString(36).substr(2, 9);
  }

  async createFlashcard(flashcardData, userId) {
    const allFlashcards = await fileService.readFlashcards();

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
    await fileService.writeFlashcards(allFlashcards);

    return newFlashcard;
  }

  async saveFlashcards(flashcards, userId) {
    const allFlashcards = await fileService.readFlashcards();

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
    await fileService.writeFlashcards(allFlashcards);

    return flashcardsToSave;
  }

  async getUserFlashcards(userId) {
    const allFlashcards = await fileService.readFlashcards();
    return allFlashcards.filter((card) => card.userId === userId);
  }

  async getFlashcardById(flashcardId) {
    const allFlashcards = await fileService.readFlashcards();
    return allFlashcards.find((card) => card.id === flashcardId);
  }

  async updateFlashcard(flashcardId, updates) {
    const allFlashcards = await fileService.readFlashcards();
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

    await fileService.writeFlashcards(allFlashcards);
    return allFlashcards[cardIndex];
  }

  async deleteFlashcard(flashcardId) {
    const allFlashcards = await fileService.readFlashcards();
    const filteredFlashcards = allFlashcards.filter(
      (card) => card.id !== flashcardId
    );

    if (allFlashcards.length === filteredFlashcards.length) {
      throw new Error("Flashcard not found");
    }

    await fileService.writeFlashcards(filteredFlashcards);
    return true;
  }

  async markCardReviewed(flashcardId, difficulty) {
    const updates = {
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
      Math.floor((now - lastReviewed) / (1000 * 60 * 60 * 24))
    );

    let nextReviewDays = 1; // Default minimum
    const easyCount = card.easyCount || 0;
    const reviewCount = (card.reviewCount || 0) + 1;

    if (difficulty === "easy") {
      // Progressive intervals: 7, 21, 60, 150 days max
      const easyIntervals = [7, 21, 60, 150];
      const newEasyCount = easyCount + 1;
      nextReviewDays =
        easyIntervals[Math.min(newEasyCount - 1, easyIntervals.length - 1)] ||
        150;
      updates.easyCount = newEasyCount;
    } else if (difficulty === "medium") {
      // Same interval as last time, minimum 5 days
      nextReviewDays = Math.max(5, daysSinceLastReview);
    } else if (difficulty === "hard") {
      // 60% of last interval, minimum 1 day
      nextReviewDays = Math.max(1, Math.floor(daysSinceLastReview * 0.6));
    }

    const nextReviewDate = new Date(now);
    nextReviewDate.setDate(nextReviewDate.getDate() + nextReviewDays);

    updates.nextReviewDate = nextReviewDate.toISOString();
    updates.reviewCount = reviewCount;

    return this.updateFlashcard(flashcardId, updates);
  }

  async moveExpiredCardsToRemaining(userId) {
    const allFlashcards = await fileService.readFlashcards();
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
      await fileService.writeFlashcards(updatedFlashcards);
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

    const allFlashcards = await fileService.readFlashcards();
    return allFlashcards.filter((card) => card.userId === userId);
  }
}

module.exports = new FlashcardService();
