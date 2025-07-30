const dataService = require("./dataService");
const { v4: uuidv4 } = require("uuid");

class NoteFolderService {
  constructor() {
    this.dataFile = "noteFolders.json";
  }

  async getUserNoteFolders(userId) {
    try {
      const folders = await dataService.getNoteFolders();
      const userFolders = folders.filter((folder) => folder.userId === userId);

      // Add note count to each folder
      const notes = await dataService.getNotes();

      return userFolders.map((folder) => ({
        ...folder,
        noteCount: notes.filter((note) => note.folderId === folder.id).length,
      }));
    } catch (error) {
      console.error("Error getting user note folders:", error);
      throw error;
    }
  }

  async getNoteFolder(folderId) {
    try {
      const folders = await dataService.getNoteFolders();
      const folder = folders.find((f) => f.id === folderId);

      if (!folder) return null;

      // Add note count
      const notes = await dataService.getNotes();
      folder.noteCount = notes.filter(
        (note) => note.folderId === folderId
      ).length;

      return folder;
    } catch (error) {
      console.error("Error getting note folder:", error);
      throw error;
    }
  }

  async createNoteFolder(folderData) {
    try {
      const folders = await dataService.getNoteFolders();

      const newFolder = {
        id: uuidv4(),
        name: folderData.name,
        description: folderData.description || "",
        color: folderData.color || "",
        userId: folderData.userId,
        createdAt: new Date(),
        updatedAt: new Date(),
        noteCount: 0,
      };

      folders.push(newFolder);
      await dataService.saveNoteFolders(folders);

      return newFolder;
    } catch (error) {
      console.error("Error creating note folder:", error);
      throw error;
    }
  }

  async updateNoteFolder(folderId, updates) {
    try {
      const folders = await dataService.getNoteFolders();
      const folderIndex = folders.findIndex((f) => f.id === folderId);

      if (folderIndex === -1) return null;

      const updatedFolder = {
        ...folders[folderIndex],
        ...updates,
        updatedAt: new Date(),
      };

      folders[folderIndex] = updatedFolder;
      await dataService.saveNoteFolders(folders);

      // Add note count
      const notes = await dataService.getNotes();
      updatedFolder.noteCount = notes.filter(
        (note) => note.folderId === folderId
      ).length;

      return updatedFolder;
    } catch (error) {
      console.error("Error updating note folder:", error);
      throw error;
    }
  }

  async deleteNoteFolder(folderId) {
    try {
      const folders = await dataService.getNoteFolders();
      const filteredFolders = folders.filter(
        (folder) => folder.id !== folderId
      );

      if (folders.length === filteredFolders.length) {
        throw new Error("Note folder not found");
      }

      // Move all notes in this folder to general collection (no folderId)
      const notes = await dataService.getNotes();
      const updatedNotes = notes.map((note) => {
        if (note.folderId === folderId) {
          return {
            ...note,
            folderId: null,
            updatedAt: new Date().toISOString(),
          };
        }
        return note;
      });

      await dataService.saveNoteFolders(filteredFolders);
      await dataService.saveNotes(updatedNotes);

      return true;
    } catch (error) {
      console.error("Error deleting note folder:", error);
      throw error;
    }
  }

  async getNoteFolderNotes(folderId) {
    try {
      const notes = await dataService.getNotes();
      return notes.filter((note) => note.folderId === folderId);
    } catch (error) {
      console.error("Error getting note folder notes:", error);
      throw error;
    }
  }
}

module.exports = new NoteFolderService();
