export interface Note {
  id: string;
  title: string;
  content: string;
  processType: "none" | "summarize" | "expand";
  processedContent?: string;
  userId: string;
  folderId?: string | undefined;
  createdAt: string;
  updatedAt: string;
}

export interface CreateNoteRequest {
  title: string;
  content: string;
  processType: "none" | "summarize" | "expand";
  userId: string;
  folderId?: string;
}

export interface ProcessNoteRequest {
  noteId: string;
  processType: "summarize" | "expand";
}