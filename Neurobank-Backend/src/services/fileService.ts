import { promises as fs } from "fs";
import path from "path";
import config from "../config";
import { User } from "../types/User";
import { Note } from "../types/Note";
import { Flashcard } from "../types/Flashcard";
import { Deck } from "../types/Deck";
import { UserStatistics } from "../types/Statistics";
import { Task } from "../types/Task";
import { NoteFolder } from "../types/NoteFolder";

class FileService {
  private dataDir: string;
  private usersFile: string;
  private notesFile: string;
  private flashcardsFile: string;

  constructor() {
    this.dataDir = path.join(__dirname, "../../", config.dataDir);
    this.usersFile = path.join(this.dataDir, config.usersFile);
    this.notesFile = path.join(this.dataDir, config.notesFile);
    this.flashcardsFile = path.join(this.dataDir, "flashcards.json");
  }

  async ensureDataDir(): Promise<void> {
    try {
      await fs.access(this.dataDir);
    } catch {
      await fs.mkdir(this.dataDir, { recursive: true });
    }
  }

  async readFile<T>(filePath: string, defaultValue: T = [] as unknown as T): Promise<T> {
    try {
      await this.ensureDataDir();
      const data = await fs.readFile(filePath, "utf-8");
      return JSON.parse(data) as T;
    } catch {
      return defaultValue;
    }
  }

  async writeFile<T>(filePath: string, data: T): Promise<void> {
    await this.ensureDataDir();
    await fs.writeFile(filePath, JSON.stringify(data, null, 2));
  }

  async readUsers(): Promise<User[]> {
    return this.readFile<User[]>(this.usersFile, []);
  }

  async writeUsers(users: User[]): Promise<void> {
    return this.writeFile(this.usersFile, users);
  }

  async readNotes(): Promise<Note[]> {
    return this.readFile<Note[]>(this.notesFile, []);
  }

  async writeNotes(notes: Note[]): Promise<void> {
    return this.writeFile(this.notesFile, notes);
  }

  async readFlashcards(): Promise<Flashcard[]> {
    return this.readFile<Flashcard[]>(this.flashcardsFile, []);
  }

  async writeFlashcards(flashcards: Flashcard[]): Promise<void> {
    return this.writeFile(this.flashcardsFile, flashcards);
  }

  async readDecks(): Promise<Deck[]> {
    const decksFile = path.join(this.dataDir, "decks.json");
    return this.readFile<Deck[]>(decksFile, []);
  }

  async writeDecks(decks: Deck[]): Promise<void> {
    const decksFile = path.join(this.dataDir, "decks.json");
    return this.writeFile(decksFile, decks);
  }

  async readUserStats(): Promise<UserStatistics[]> {
    const userStatsFile = path.join(this.dataDir, "userStats.json");
    return this.readFile<UserStatistics[]>(userStatsFile, []);
  }

  async writeUserStats(userStats: UserStatistics[]): Promise<void> {
    const userStatsFile = path.join(this.dataDir, "userStats.json");
    return this.writeFile(userStatsFile, userStats);
  }

  async readTasks(): Promise<Task[]> {
    const tasksFile = path.join(this.dataDir, "tasks.json");
    return this.readFile<Task[]>(tasksFile, []);
  }

  async writeTasks(tasks: Task[]): Promise<void> {
    const tasksFile = path.join(this.dataDir, "tasks.json");
    return this.writeFile(tasksFile, tasks);
  }

  async readNoteFolders(): Promise<NoteFolder[]> {
    const noteFoldersFile = path.join(this.dataDir, "noteFolders.json");
    return this.readFile<NoteFolder[]>(noteFoldersFile, []);
  }

  async writeNoteFolders(noteFolders: NoteFolder[]): Promise<void> {
    const noteFoldersFile = path.join(this.dataDir, "noteFolders.json");
    return this.writeFile(noteFoldersFile, noteFolders);
  }
}

export default new FileService();