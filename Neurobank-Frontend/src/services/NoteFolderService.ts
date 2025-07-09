import { getApiUrl } from "../config/api";
import type {
  NoteFolder,
  CreateNoteFolderRequest,
  UpdateNoteFolderRequest,
} from "../types/NoteFolder";

class NoteFolderService {
  async createNoteFolder(
    folderData: CreateNoteFolderRequest
  ): Promise<NoteFolder> {
    try {
      const response = await fetch(getApiUrl("/api/note-folders"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(folderData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create note folder");
      }

      const folder = await response.json();
      return {
        ...folder,
        createdAt: new Date(folder.createdAt),
        updatedAt: new Date(folder.updatedAt),
      };
    } catch (error) {
      console.error("Error creating note folder:", error);
      throw error;
    }
  }

  async getUserNoteFolders(userId: string): Promise<NoteFolder[]> {
    try {
      const response = await fetch(
        getApiUrl(`/api/note-folders/user/${userId}`)
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to load note folders");
      }

      const folders = await response.json();
      return folders.map((folder: any) => ({
        ...folder,
        createdAt: new Date(folder.createdAt),
        updatedAt: new Date(folder.updatedAt),
      }));
    } catch (error) {
      console.error("Error loading note folders:", error);
      throw error;
    }
  }

  async getNoteFolder(folderId: string): Promise<NoteFolder> {
    try {
      const response = await fetch(getApiUrl(`/api/note-folders/${folderId}`));

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to load note folder");
      }

      const folder = await response.json();
      return {
        ...folder,
        createdAt: new Date(folder.createdAt),
        updatedAt: new Date(folder.updatedAt),
      };
    } catch (error) {
      console.error("Error loading note folder:", error);
      throw error;
    }
  }

  async updateNoteFolder(
    updates: UpdateNoteFolderRequest
  ): Promise<NoteFolder> {
    try {
      const response = await fetch(
        getApiUrl(`/api/note-folders/${updates.id}`),
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(updates),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update note folder");
      }

      const folder = await response.json();
      return {
        ...folder,
        createdAt: new Date(folder.createdAt),
        updatedAt: new Date(folder.updatedAt),
      };
    } catch (error) {
      console.error("Error updating note folder:", error);
      throw error;
    }
  }

  async deleteNoteFolder(folderId: string): Promise<boolean> {
    try {
      const response = await fetch(getApiUrl(`/api/note-folders/${folderId}`), {
        method: "DELETE",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to delete note folder");
      }

      return true;
    } catch (error) {
      console.error("Error deleting note folder:", error);
      throw error;
    }
  }

  async getNoteFolderNotes(folderId: string): Promise<any[]> {
    try {
      const response = await fetch(
        getApiUrl(`/api/note-folders/${folderId}/notes`)
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to load folder notes");
      }

      return await response.json();
    } catch (error) {
      console.error("Error loading folder notes:", error);
      throw error;
    }
  }
}

export default new NoteFolderService();
