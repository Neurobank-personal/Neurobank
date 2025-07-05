import type { INoteRepository } from "./interfaces/INoteRepository";
import { JsonNoteRepository } from "./repositories/JsonNoteRepository";
import type {
  Note,
  CreateNoteRequest,
  ProcessNoteRequest,
} from "../types/Note";
import { getApiUrl, API_CONFIG } from "../config/api";

export class NoteService {
  private noteRepository: INoteRepository;

  constructor() {
    this.noteRepository = new JsonNoteRepository();
  }

  async createNote(noteData: CreateNoteRequest): Promise<Note> {
    this.validateNoteData(noteData);
    return await this.noteRepository.createNote(noteData);
  }

  async processNote(request: ProcessNoteRequest): Promise<Note> {
    const response = await fetch(
      getApiUrl(API_CONFIG.ENDPOINTS.NOTES_PROCESS),
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(request),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "AI-bearbetning misslyckades");
    }

    return await response.json();
  }

  async getUserNotes(userId: string): Promise<Note[]> {
    return await this.noteRepository.findNotesByUserId(userId);
  }

  async updateNote(
    noteId: string,
    updates: Partial<Pick<Note, "title" | "content" | "processedContent">>
  ): Promise<Note> {
    return await this.noteRepository.updateNote(noteId, updates);
  }

  async deleteNote(noteId: string): Promise<boolean> {
    return await this.noteRepository.deleteNote(noteId);
  }

  private validateNoteData(noteData: CreateNoteRequest): void {
    if (!noteData.title || noteData.title.trim().length === 0) {
      throw new Error("Titel krävs");
    }

    if (!noteData.content || noteData.content.trim().length === 0) {
      throw new Error("Innehåll krävs");
    }

    if (noteData.content.length > 50000) {
      throw new Error("Innehåll för långt (max 50,000 tecken)");
    }
  }
}
