import { promises as fs } from "fs";
import path from "path";
import config from "../../config";
import { NoteFolder } from "../../types/NoteFolder";
import { INoteFolderRepository } from "../interfaces/INoteFolderRepository";

export class JsonNoteFolderRepository implements INoteFolderRepository {
  private filePath: string;

  constructor() {
    this.filePath = path.join(__dirname, "../../../", config.dataDir, "noteFolders.json");
  }

  private async ensureDataDir(): Promise<void> {
    const dataDir = path.dirname(this.filePath);
    try {
      await fs.access(dataDir);
    } catch {
      await fs.mkdir(dataDir, { recursive: true });
    }
  }

  async findAll(): Promise<NoteFolder[]> {
    try {
      await this.ensureDataDir();
      const data = await fs.readFile(this.filePath, "utf-8");
      return JSON.parse(data) as NoteFolder[];
    } catch {
      return [];
    }
  }

  async findById(id: string): Promise<NoteFolder | undefined> {
    const noteFolders = await this.findAll();
    return noteFolders.find(noteFolder => noteFolder.id === id);
  }

  async findByUserId(userId: string): Promise<NoteFolder[]> {
    const noteFolders = await this.findAll();
    return noteFolders.filter(noteFolder => noteFolder.userId === userId);
  }

  async create(noteFolder: NoteFolder): Promise<NoteFolder> {
    const noteFolders = await this.findAll();
    noteFolders.push(noteFolder);
    await this.save(noteFolders);
    return noteFolder;
  }

  async update(id: string, noteFolderData: Partial<NoteFolder>): Promise<NoteFolder | undefined> {
    const noteFolders = await this.findAll();
    const index = noteFolders.findIndex(noteFolder => noteFolder.id === id);
    
    if (index === -1) {
      return undefined;
    }

    noteFolders[index] = { ...noteFolders[index], ...noteFolderData };
    await this.save(noteFolders);
    return noteFolders[index];
  }

  async delete(id: string): Promise<boolean> {
    const noteFolders = await this.findAll();
    const index = noteFolders.findIndex(noteFolder => noteFolder.id === id);
    
    if (index === -1) {
      return false;
    }

    noteFolders.splice(index, 1);
    await this.save(noteFolders);
    return true;
  }

  async save(noteFolders: NoteFolder[]): Promise<void> {
    await this.ensureDataDir();
    await fs.writeFile(this.filePath, JSON.stringify(noteFolders, null, 2));
  }
}