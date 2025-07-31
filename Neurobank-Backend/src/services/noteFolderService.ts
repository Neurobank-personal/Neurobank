import { v4 as uuidv4 } from "uuid";
import { RepositoryFactory } from '../repositories/RepositoryFactory';
import { INoteFolderRepository } from '../repositories/interfaces/INoteFolderRepository';
import { INoteRepository } from '../repositories/interfaces/INoteRepository';
import { NoteFolder, CreateNoteFolderRequest, UpdateNoteFolderRequest } from "../types/NoteFolder";
import { Note } from "../types/Note";

class NoteFolderService {
  private noteFolderRepository: INoteFolderRepository;
  private noteRepository: INoteRepository;

  constructor() {
    this.noteFolderRepository = RepositoryFactory.getNoteFolderRepository();
    this.noteRepository = RepositoryFactory.getNoteRepository();
  }

  async getUserNoteFolders(userId: string): Promise<NoteFolder[]> {
    try {
      const userFolders = await this.noteFolderRepository.findByUserId(userId);

      // Add note count to each folder
      const foldersWithCount = await Promise.all(
        userFolders.map(async (folder) => {
          const folderNotes = await this.noteRepository.findByFolderId(folder.id);
          return {
            ...folder,
            noteCount: folderNotes.length,
          };
        })
      );

      return foldersWithCount;
    } catch (error) {
      console.error("Error getting user note folders:", error);
      throw error;
    }
  }

  async getNoteFolder(folderId: string): Promise<NoteFolder | null> {
    try {
      const folder = await this.noteFolderRepository.findById(folderId);

      if (!folder) return null;

      // Add note count
      const folderNotes = await this.noteRepository.findByFolderId(folderId);
      const folderWithCount: NoteFolder = {
        ...folder,
        noteCount: folderNotes.length,
      };

      return folderWithCount;
    } catch (error) {
      console.error("Error getting note folder:", error);
      throw error;
    }
  }

  async createNoteFolder(folderData: CreateNoteFolderRequest): Promise<NoteFolder> {
    try {
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

      return await this.noteFolderRepository.create(newFolder);
    } catch (error) {
      console.error("Error creating note folder:", error);
      throw error;
    }
  }

  async updateNoteFolder(folderId: string, updates: Omit<UpdateNoteFolderRequest, 'id'>): Promise<NoteFolder | null> {
    try {
      const updatesWithTimestamp = {
        ...updates,
        updatedAt: new Date().toISOString(),
      };

      const updatedFolder = await this.noteFolderRepository.update(folderId, updatesWithTimestamp);
      
      if (!updatedFolder) return null;

      // Add note count
      const folderNotes = await this.noteRepository.findByFolderId(folderId);
      updatedFolder.noteCount = folderNotes.length;

      return updatedFolder;
    } catch (error) {
      console.error("Error updating note folder:", error);
      throw error;
    }
  }

  async deleteNoteFolder(folderId: string): Promise<boolean> {
    try {
      const success = await this.noteFolderRepository.delete(folderId);
      
      if (!success) {
        throw new Error("Note folder not found");
      }

      // Move all notes in this folder to general collection (no folderId)
      const folderNotes = await this.noteRepository.findByFolderId(folderId);
      
      for (const note of folderNotes) {
        await this.noteRepository.update(note.id, {
          folderId: undefined,
          updatedAt: new Date().toISOString(),
        });
      }

      return true;
    } catch (error) {
      console.error("Error deleting note folder:", error);
      throw error;
    }
  }

  async getNoteFolderNotes(folderId: string): Promise<Note[]> {
    try {
      return await this.noteRepository.findByFolderId(folderId);
    } catch (error) {
      console.error("Error getting note folder notes:", error);
      throw error;
    }
  }
}

export default new NoteFolderService();