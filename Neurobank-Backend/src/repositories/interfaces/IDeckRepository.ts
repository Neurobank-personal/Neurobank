import { Deck } from '../../types/Deck';

export interface IDeckRepository {
  findAll(): Promise<Deck[]>;
  findById(id: string): Promise<Deck | undefined>;
  findByUserId(userId: string): Promise<Deck[]>;
  create(deck: Deck): Promise<Deck>;
  update(id: string, deck: Partial<Deck>): Promise<Deck | undefined>;
  delete(id: string): Promise<boolean>;
  save(decks: Deck[]): Promise<void>;
}