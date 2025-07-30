const { v4: uuidv4 } = require("uuid");
const dataService = require("./dataService");

class DeckService {
  constructor() {
    this.dataFile = "decks.json";
  }

  async getUserDecks(userId) {
    try {
      const decks = await dataService.getDecks();
      const userDecks = decks.filter((deck) => deck.userId === userId);

      // Add flashcard count to each deck
      const flashcards = await dataService.getFlashcards();

      return userDecks.map((deck) => ({
        ...deck,
        flashcardCount: flashcards.filter((card) => card.deckId === deck.id)
          .length,
      }));
    } catch (error) {
      console.error("Error getting user decks:", error);
      throw error;
    }
  }

  async getDeck(deckId) {
    try {
      const decks = await dataService.getDecks();
      const deck = decks.find((d) => d.id === deckId);

      if (!deck) return null;

      // Add flashcard count
      const flashcards = await dataService.getFlashcards();
      deck.flashcardCount = flashcards.filter(
        (card) => card.deckId === deckId
      ).length;

      return deck;
    } catch (error) {
      console.error("Error getting deck:", error);
      throw error;
    }
  }

  async createDeck(deckData) {
    try {
      const decks = await dataService.getDecks();

      const newDeck = {
        id: uuidv4(),
        name: deckData.name,
        description: deckData.description || "",
        color: deckData.color || "",
        userId: deckData.userId,
        createdAt: new Date(),
        updatedAt: new Date(),
        flashcardCount: 0,
      };

      decks.push(newDeck);
      await dataService.saveDecks(decks);

      return newDeck;
    } catch (error) {
      console.error("Error creating deck:", error);
      throw error;
    }
  }

  async updateDeck(deckId, updates) {
    try {
      const decks = await dataService.getDecks();
      const deckIndex = decks.findIndex((d) => d.id === deckId);

      if (deckIndex === -1) return null;

      const updatedDeck = {
        ...decks[deckIndex],
        ...updates,
        updatedAt: new Date(),
      };

      decks[deckIndex] = updatedDeck;
      await dataService.saveDecks(decks);

      // Add flashcard count
      const flashcards = await dataService.getFlashcards();
      updatedDeck.flashcardCount = flashcards.filter(
        (card) => card.deckId === deckId
      ).length;

      return updatedDeck;
    } catch (error) {
      console.error("Error updating deck:", error);
      throw error;
    }
  }

  async deleteDeck(deckId) {
    try {
      const decks = await dataService.getDecks();
      const deckIndex = decks.findIndex((d) => d.id === deckId);

      if (deckIndex === -1) return false;

      // Remove deck
      decks.splice(deckIndex, 1);
      await dataService.saveDecks(decks);

      // Move flashcards from this deck to general collection (remove deckId)
      const flashcards = await dataService.getFlashcards();
      const updatedFlashcards = flashcards.map((card) => {
        if (card.deckId === deckId) {
          const { deckId: _, ...cardWithoutDeck } = card;
          return cardWithoutDeck;
        }
        return card;
      });

      await dataService.saveFlashcards(updatedFlashcards);

      return true;
    } catch (error) {
      console.error("Error deleting deck:", error);
      throw error;
    }
  }

  async getDeckFlashcards(deckId) {
    try {
      const flashcards = await dataService.getFlashcards();
      return flashcards.filter((card) => card.deckId === deckId);
    } catch (error) {
      console.error("Error getting deck flashcards:", error);
      throw error;
    }
  }
}

module.exports = new DeckService();
