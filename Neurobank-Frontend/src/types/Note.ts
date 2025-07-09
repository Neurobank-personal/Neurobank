export interface Note {
  id: string;
  title: string;
  content: string;
  processType: "none" | "summarize" | "expand";
  processedContent?: string;
  userId: string;
  folderId?: string; // Added folderId to support note folder organization
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateNoteRequest {
  title: string;
  content: string;
  processType: "none" | "summarize" | "expand";
  userId: string;
  folderId?: string; // Added optional folderId for creating notes in specific folders
}

export interface ProcessNoteRequest {
  noteId: string;
  processType: "summarize" | "expand";
}
