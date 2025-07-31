export interface NoteFolder {
  id: string;
  name: string;
  description?: string;
  color?: string;
  createdAt: string;
  updatedAt: string;
  userId: string;
  noteCount?: number;
}

export interface CreateNoteFolderRequest {
  name: string;
  description?: string;
  color?: string;
  userId: string;
}

export interface UpdateNoteFolderRequest {
  id: string;
  name?: string;
  description?: string;
  color?: string;
}