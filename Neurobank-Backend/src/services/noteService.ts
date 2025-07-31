import fileService from "./fileService";
import aiService from "./aiService";
import flashcardService from "./flashcardService";
import statisticsService from "./statisticsService";
import { validateNote, validateProcessType } from "../utils/validation";
import { Note, CreateNoteRequest, ProcessNoteRequest } from "../types/Note";
import { Flashcard } from "../types/Flashcard";

class NoteService {
  generateId(): string {
    return Date.now().toString() + Math.random().toString(36).substr(2, 9);
  }

  async createNote(noteData: CreateNoteRequest): Promise<Note> {
    validateNote(noteData);

    const { title, content, processType, userId, folderId } = noteData;
    const notes = await fileService.readNotes();

    const newNote: Note = {
      id: this.generateId(),
      title,
      content,
      processType,
      userId,
      folderId: folderId || undefined,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    notes.push(newNote);
    await fileService.writeNotes(notes);

    // Registrera statistik för skapad note
    try {
      await statisticsService.recordNoteCreated(userId);
    } catch (error) {
      console.error("Failed to record note creation in statistics:", error);
    }

    return newNote;
  }

  async getUserNotes(userId: string): Promise<Note[]> {
    const notes = await fileService.readNotes();
    return notes.filter((note) => note.userId === userId);
  }

  async getNoteById(noteId: string): Promise<Note | undefined> {
    const notes = await fileService.readNotes();
    return notes.find((note) => note.id === noteId);
  }

  async updateNote(noteId: string, updates: Partial<Omit<Note, 'id' | 'createdAt'>>): Promise<Note> {
    const notes = await fileService.readNotes();
    const noteIndex = notes.findIndex((note) => note.id === noteId);

    if (noteIndex === -1) {
      throw new Error("Anteckning hittades inte");
    }

    notes[noteIndex] = {
      ...notes[noteIndex],
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    await fileService.writeNotes(notes);
    return notes[noteIndex];
  }

  async processNoteWithAI(noteId: string, processType: "summarize" | "expand"): Promise<Note> {
    validateProcessType(processType);

    const note = await this.getNoteById(noteId);

    if (!note) {
      throw new Error("Anteckning hittades inte");
    }

    const processedContent = await aiService.processText(
      note.content,
      processType
    );

    return this.updateNote(noteId, {
      processedContent,
      processType,
    });
  }

  async deleteNote(noteId: string): Promise<boolean> {
    const notes = await fileService.readNotes();
    const filteredNotes = notes.filter((note) => note.id !== noteId);

    if (notes.length === filteredNotes.length) {
      throw new Error("Anteckning hittades inte");
    }

    await fileService.writeNotes(filteredNotes);
    return true;
  }

  async generateFlashcardsFromNotes(noteIds: string[], userId: string, deckId: string | null = null): Promise<Flashcard[]> {
    // Hämta alla specificerade anteckningar
    const notes = await fileService.readNotes();
    const selectedNotes = notes.filter(
      (note) => noteIds.includes(note.id) && note.userId === userId
    );

    if (selectedNotes.length === 0) {
      throw new Error("Inga anteckningar hittades för de angivna ID:na");
    }

    // Generera flashcards med AI
    const generatedCards = await aiService.generateFlashcards(selectedNotes);

    // Konvertera och spara flashcards
    const flashcardsToSave = generatedCards.map((card: any) => ({
      question: card.question,
      answer: card.answer,
      categories: Array.isArray(card.category)
        ? card.category
        : [card.category],
      sourceNoteId: selectedNotes.length === 1 ? selectedNotes[0].id : null,
      deckId: deckId,
    }));

    // Spara flashcards i databasen
    const savedFlashcards = await flashcardService.saveFlashcards(
      flashcardsToSave,
      userId
    );

    return savedFlashcards;
  }
}

export default new NoteService();