import { promises as fs } from "fs";
import path from "path";
import config from "../../config";
import { Flashcard } from "../../types/Flashcard";
import { IFlashcardRepository } from "../interfaces/IFlashcardRepository";

export class JsonFlashcardRepository implements IFlashcardRepository {
  private filePath: string;

  constructor() {
    this.filePath = path.join(__dirname, "../../../", config.dataDir, "flashcards.json");
  }

  private async ensureDataDir(): Promise<void> {
    const dataDir = path.dirname(this.filePath);
    try {
      await fs.access(dataDir);
    } catch {
      await fs.mkdir(dataDir, { recursive: true });
    }
  }

  async findAll(): Promise<Flashcard[]> {
    try {
      await this.ensureDataDir();
      const data = await fs.readFile(this.filePath, "utf-8");
      return JSON.parse(data) as Flashcard[];
    } catch {
      return [];
    }
  }

  async findById(id: string): Promise<Flashcard | undefined> {
    const flashcards = await this.findAll();
    return flashcards.find(flashcard => flashcard.id === id);
  }

  async findByUserId(userId: string): Promise<Flashcard[]> {
    const flashcards = await this.findAll();
    return flashcards.filter(flashcard => flashcard.userId === userId);
  }

  async findByDeckId(deckId: string): Promise<Flashcard[]> {
    const flashcards = await this.findAll();
    return flashcards.filter(flashcard => flashcard.deckId === deckId);
  }

  async findBySourceNoteId(sourceNoteId: string): Promise<Flashcard[]> {
    const flashcards = await this.findAll();
    return flashcards.filter(flashcard => flashcard.sourceNoteId === sourceNoteId);
  }

  async create(flashcard: Flashcard): Promise<Flashcard> {
    const flashcards = await this.findAll();
    flashcards.push(flashcard);
    await this.save(flashcards);
    return flashcard;
  }

  async update(id: string, flashcardData: Partial<Flashcard>): Promise<Flashcard | undefined> {
    const flashcards = await this.findAll();
    const index = flashcards.findIndex(flashcard => flashcard.id === id);
    
    if (index === -1) {
      return undefined;
    }

    flashcards[index] = { ...flashcards[index], ...flashcardData };
    await this.save(flashcards);
    return flashcards[index];
  }

  async delete(id: string): Promise<boolean> {
    const flashcards = await this.findAll();
    const index = flashcards.findIndex(flashcard => flashcard.id === id);
    
    if (index === -1) {
      return false;
    }

    flashcards.splice(index, 1);
    await this.save(flashcards);
    return true;
  }

  async save(flashcards: Flashcard[]): Promise<void> {
    await this.ensureDataDir();
    await fs.writeFile(this.filePath, JSON.stringify(flashcards, null, 2));
  }
}