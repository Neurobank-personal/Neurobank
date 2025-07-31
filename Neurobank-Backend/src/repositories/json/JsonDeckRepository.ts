import { promises as fs } from "fs";
import path from "path";
import config from "../../config";
import { Deck } from "../../types/Deck";
import { IDeckRepository } from "../interfaces/IDeckRepository";

export class JsonDeckRepository implements IDeckRepository {
  private filePath: string;

  constructor() {
    this.filePath = path.join(__dirname, "../../../", config.dataDir, "decks.json");
  }

  private async ensureDataDir(): Promise<void> {
    const dataDir = path.dirname(this.filePath);
    try {
      await fs.access(dataDir);
    } catch {
      await fs.mkdir(dataDir, { recursive: true });
    }
  }

  async findAll(): Promise<Deck[]> {
    try {
      await this.ensureDataDir();
      const data = await fs.readFile(this.filePath, "utf-8");
      return JSON.parse(data) as Deck[];
    } catch {
      return [];
    }
  }

  async findById(id: string): Promise<Deck | undefined> {
    const decks = await this.findAll();
    return decks.find(deck => deck.id === id);
  }

  async findByUserId(userId: string): Promise<Deck[]> {
    const decks = await this.findAll();
    return decks.filter(deck => deck.userId === userId);
  }

  async create(deck: Deck): Promise<Deck> {
    const decks = await this.findAll();
    decks.push(deck);
    await this.save(decks);
    return deck;
  }

  async update(id: string, deckData: Partial<Deck>): Promise<Deck | undefined> {
    const decks = await this.findAll();
    const index = decks.findIndex(deck => deck.id === id);
    
    if (index === -1) {
      return undefined;
    }

    decks[index] = { ...decks[index], ...deckData };
    await this.save(decks);
    return decks[index];
  }

  async delete(id: string): Promise<boolean> {
    const decks = await this.findAll();
    const index = decks.findIndex(deck => deck.id === id);
    
    if (index === -1) {
      return false;
    }

    decks.splice(index, 1);
    await this.save(decks);
    return true;
  }

  async save(decks: Deck[]): Promise<void> {
    await this.ensureDataDir();
    await fs.writeFile(this.filePath, JSON.stringify(decks, null, 2));
  }
}