import fileService from "./fileService";
import { v4 as uuidv4 } from "uuid";
import { NoteFolder, CreateNoteFolderRequest, UpdateNoteFolderRequest } from "../types/NoteFolder";
import { Note } from "../types/Note";

class NoteFolderService {
  private dataFile: string = "noteFolders.json";

  async getUserNoteFolders(userId: string): Promise<NoteFolder[]> {
    try {
      const folders = await fileService.readNoteFolders();
      const userFolders = folders.filter((folder) => folder.userId === userId);

      // Add note count to each folder
      const notes = await fileService.readNotes();

      return userFolders.map((folder) => ({
        ...folder,
        noteCount: notes.filter((note) => note.folderId === folder.id).length,
      }));
    } catch (error) {
      console.error("Error getting user note folders:", error);
      throw error;
    }
  }

  async getNoteFolder(folderId: string): Promise<NoteFolder | null> {
    try {
      const folders = await fileService.readNoteFolders();
      const folder = folders.find((f) => f.id === folderId);

      if (!folder) return null;

      // Add note count
      const notes = await fileService.readNotes();
      const folderWithCount: NoteFolder = {
        ...folder,
        noteCount: notes.filter((note) => note.folderId === folderId).length,
      };

      return folderWithCount;
    } catch (error) {
      console.error("Error getting note folder:", error);
      throw error;
    }
  }

  async createNoteFolder(folderData: CreateNoteFolderRequest): Promise<NoteFolder> {
    try {
      const folders = await fileService.readNoteFolders();

      const newFolder: NoteFolder = {
        id: uuidv4(),
        name: folderData.name,
        description: folderData.description || "",
        color: folderData.color || "",
        userId: folderData.userId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        noteCount: 0,
      };

      folders.push(newFolder);
      await fileService.writeNoteFolders(folders);

      return newFolder;
    } catch (error) {
      console.error("Error creating note folder:", error);
      throw error;
    }
  }

  async updateNoteFolder(folderId: string, updates: Omit<UpdateNoteFolderRequest, 'id'>): Promise<NoteFolder | null> {
    try {
      const folders = await fileService.readNoteFolders();
      const folderIndex = folders.findIndex((f) => f.id === folderId);

      if (folderIndex === -1) return null;

      const updatedFolder: NoteFolder = {
        ...folders[folderIndex],
        ...updates,
        updatedAt: new Date().toISOString(),
      };

      folders[folderIndex] = updatedFolder;
      await fileService.writeNoteFolders(folders);

      // Add note count
      const notes = await fileService.readNotes();
      updatedFolder.noteCount = notes.filter(
        (note) => note.folderId === folderId
      ).length;

      return updatedFolder;
    } catch (error) {
      console.error("Error updating note folder:", error);
      throw error;
    }
  }

  async deleteNoteFolder(folderId: string): Promise<boolean> {
    try {
      const folders = await fileService.readNoteFolders();
      const filteredFolders = folders.filter(
        (folder) => folder.id !== folderId
      );

      if (folders.length === filteredFolders.length) {
        throw new Error("Note folder not found");
      }

      // Move all notes in this folder to general collection (no folderId)
      const notes = await fileService.readNotes();
      const updatedNotes = notes.map((note) => {
        if (note.folderId === folderId) {
          return {
            ...note,
            folderId: undefined,
            updatedAt: new Date().toISOString(),
          };
        }
        return note;
      });

      await fileService.writeNoteFolders(filteredFolders);
      await fileService.writeNotes(updatedNotes);

      return true;
    } catch (error) {
      console.error("Error deleting note folder:", error);
      throw error;
    }
  }

  async getNoteFolderNotes(folderId: string): Promise<Note[]> {
    try {
      const notes = await fileService.readNotes();
      return notes.filter((note) => note.folderId === folderId);
    } catch (error) {
      console.error("Error getting note folder notes:", error);
      throw error;
    }
  }
}

export default new NoteFolderService();