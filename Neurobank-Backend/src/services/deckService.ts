import { v4 as uuidv4 } from 'uuid';
import fileService from './fileService';
import { Deck, CreateDeckRequest, UpdateDeckRequest } from '../types/Deck';
import { Flashcard } from '../types/Flashcard';

class DeckService {
    private dataFile: string = 'decks.json';

    async getUserDecks(userId: string): Promise<Deck[]> {
        try {
            const decks = await fileService.readDecks();
            const userDecks = decks.filter(deck => deck.userId === userId);

            // Add flashcard count to each deck
            const flashcards = await fileService.readFlashcards();

            return userDecks.map(deck => ({
                ...deck,
                flashcardCount: flashcards.filter(card => card.deckId === deck.id).length
            }));
        } catch (error) {
            console.error('Error getting user decks:', error);
            throw error;
        }
    }

    async getDeck(deckId: string): Promise<Deck | null> {
        try {
            const decks = await fileService.readDecks();
            const deck = decks.find(d => d.id === deckId);

            if (!deck) return null;

            // Add flashcard count
            const flashcards = await fileService.readFlashcards();
            const deckWithCount: Deck = {
                ...deck,
                flashcardCount: flashcards.filter(card => card.deckId === deckId).length
            };

            return deckWithCount;
        } catch (error) {
            console.error('Error getting deck:', error);
            throw error;
        }
    }

    async createDeck(deckData: CreateDeckRequest): Promise<Deck> {
        try {
            const decks = await fileService.readDecks();

            const newDeck: Deck = {
                id: uuidv4(),
                name: deckData.name,
                description: deckData.description || '',
                color: deckData.color || '',
                userId: deckData.userId,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                flashcardCount: 0
            };

            decks.push(newDeck);
            await fileService.writeDecks(decks);

            return newDeck;
        } catch (error) {
            console.error('Error creating deck:', error);
            throw error;
        }
    }

    async updateDeck(deckId: string, updates: Omit<UpdateDeckRequest, 'id'>): Promise<Deck | null> {
        try {
            const decks = await fileService.readDecks();
            const deckIndex = decks.findIndex(d => d.id === deckId);

            if (deckIndex === -1) return null;

            const updatedDeck: Deck = {
                ...decks[deckIndex],
                ...updates,
                updatedAt: new Date().toISOString()
            };

            decks[deckIndex] = updatedDeck;
            await fileService.writeDecks(decks);

            // Add flashcard count
            const flashcards = await fileService.readFlashcards();
            updatedDeck.flashcardCount = flashcards.filter(card => card.deckId === deckId).length;

            return updatedDeck;
        } catch (error) {
            console.error('Error updating deck:', error);
            throw error;
        }
    }

    async deleteDeck(deckId: string): Promise<boolean> {
        try {
            const decks = await fileService.readDecks();
            const deckIndex = decks.findIndex(d => d.id === deckId);

            if (deckIndex === -1) return false;

            // Remove deck
            decks.splice(deckIndex, 1);
            await fileService.writeDecks(decks);

            // Move flashcards from this deck to general collection (remove deckId)
            const flashcards = await fileService.readFlashcards();
            const updatedFlashcards = flashcards.map(card => {
                if (card.deckId === deckId) {
                    const { deckId: _, ...cardWithoutDeck } = card;
                    return { ...cardWithoutDeck, deckId: null };
                }
                return card;
            });

            await fileService.writeFlashcards(updatedFlashcards);

            return true;
        } catch (error) {
            console.error('Error deleting deck:', error);
            throw error;
        }
    }

    async getDeckFlashcards(deckId: string): Promise<Flashcard[]> {
        try {
            const flashcards = await fileService.readFlashcards();
            return flashcards.filter(card => card.deckId === deckId);
        } catch (error) {
            console.error('Error getting deck flashcards:', error);
            throw error;
        }
    }
}

export default new DeckService();