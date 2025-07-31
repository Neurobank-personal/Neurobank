import { v4 as uuidv4 } from 'uuid';
import { RepositoryFactory } from '../repositories/RepositoryFactory';
import { IDeckRepository } from '../repositories/interfaces/IDeckRepository';
import { IFlashcardRepository } from '../repositories/interfaces/IFlashcardRepository';
import { Deck, CreateDeckRequest, UpdateDeckRequest } from '../types/Deck';
import { Flashcard } from '../types/Flashcard';

class DeckService {
    private deckRepository: IDeckRepository;
    private flashcardRepository: IFlashcardRepository;

    constructor() {
        this.deckRepository = RepositoryFactory.getDeckRepository();
        this.flashcardRepository = RepositoryFactory.getFlashcardRepository();
    }

    async getUserDecks(userId: string): Promise<Deck[]> {
        try {
            const userDecks = await this.deckRepository.findByUserId(userId);

            // Add flashcard count to each deck
            const decksWithCount = await Promise.all(
                userDecks.map(async (deck) => {
                    const deckFlashcards = await this.flashcardRepository.findByDeckId(deck.id);
                    return {
                        ...deck,
                        flashcardCount: deckFlashcards.length
                    };
                })
            );

            return decksWithCount;
        } catch (error) {
            console.error('Error getting user decks:', error);
            throw error;
        }
    }

    async getDeck(deckId: string): Promise<Deck | null> {
        try {
            const deck = await this.deckRepository.findById(deckId);

            if (!deck) return null;

            // Add flashcard count
            const deckFlashcards = await this.flashcardRepository.findByDeckId(deckId);
            const deckWithCount: Deck = {
                ...deck,
                flashcardCount: deckFlashcards.length
            };

            return deckWithCount;
        } catch (error) {
            console.error('Error getting deck:', error);
            throw error;
        }
    }

    async createDeck(deckData: CreateDeckRequest): Promise<Deck> {
        try {
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

            return await this.deckRepository.create(newDeck);
        } catch (error) {
            console.error('Error creating deck:', error);
            throw error;
        }
    }

    async updateDeck(deckId: string, updates: Omit<UpdateDeckRequest, 'id'>): Promise<Deck | null> {
        try {
            const updatesWithTimestamp = {
                ...updates,
                updatedAt: new Date().toISOString()
            };

            const updatedDeck = await this.deckRepository.update(deckId, updatesWithTimestamp);
            
            if (!updatedDeck) return null;

            // Add flashcard count
            const deckFlashcards = await this.flashcardRepository.findByDeckId(deckId);
            updatedDeck.flashcardCount = deckFlashcards.length;

            return updatedDeck;
        } catch (error) {
            console.error('Error updating deck:', error);
            throw error;
        }
    }

    async deleteDeck(deckId: string): Promise<boolean> {
        try {
            const success = await this.deckRepository.delete(deckId);
            
            if (!success) return false;

            // Move flashcards from this deck to general collection (remove deckId)
            const deckFlashcards = await this.flashcardRepository.findByDeckId(deckId);
            
            for (const card of deckFlashcards) {
                await this.flashcardRepository.update(card.id, { deckId: null });
            }

            return true;
        } catch (error) {
            console.error('Error deleting deck:', error);
            throw error;
        }
    }

    async getDeckFlashcards(deckId: string): Promise<Flashcard[]> {
        try {
            return await this.flashcardRepository.findByDeckId(deckId);
        } catch (error) {
            console.error('Error getting deck flashcards:', error);
            throw error;
        }
    }
}

export default new DeckService();