import { promises as fs } from "fs";
import path from "path";
import config from "../../config";
import { Note } from "../../types/Note";
import { INoteRepository } from "../interfaces/INoteRepository";

export class JsonNoteRepository implements INoteRepository {
  private filePath: string;

  constructor() {
    this.filePath = path.join(__dirname, "../../../", config.dataDir, config.notesFile);
  }

  private async ensureDataDir(): Promise<void> {
    const dataDir = path.dirname(this.filePath);
    try {
      await fs.access(dataDir);
    } catch {
      await fs.mkdir(dataDir, { recursive: true });
    }
  }

  async findAll(): Promise<Note[]> {
    try {
      await this.ensureDataDir();
      const data = await fs.readFile(this.filePath, "utf-8");
      return JSON.parse(data) as Note[];
    } catch {
      return [];
    }
  }

  async findById(id: string): Promise<Note | undefined> {
    const notes = await this.findAll();
    return notes.find(note => note.id === id);
  }

  async findByUserId(userId: string): Promise<Note[]> {
    const notes = await this.findAll();
    return notes.filter(note => note.userId === userId);
  }

  async findByFolderId(folderId: string): Promise<Note[]> {
    const notes = await this.findAll();
    return notes.filter(note => note.folderId === folderId);
  }

  async create(note: Note): Promise<Note> {
    const notes = await this.findAll();
    notes.push(note);
    await this.save(notes);
    return note;
  }

  async update(id: string, noteData: Partial<Note>): Promise<Note | undefined> {
    const notes = await this.findAll();
    const index = notes.findIndex(note => note.id === id);
    
    if (index === -1) {
      return undefined;
    }

    notes[index] = { ...notes[index], ...noteData };
    await this.save(notes);
    return notes[index];
  }

  async delete(id: string): Promise<boolean> {
    const notes = await this.findAll();
    const index = notes.findIndex(note => note.id === id);
    
    if (index === -1) {
      return false;
    }

    notes.splice(index, 1);
    await this.save(notes);
    return true;
  }

  async save(notes: Note[]): Promise<void> {
    await this.ensureDataDir();
    await fs.writeFile(this.filePath, JSON.stringify(notes, null, 2));
  }
}