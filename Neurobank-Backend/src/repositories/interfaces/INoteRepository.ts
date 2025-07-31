import { Note } from '../../types/Note';

export interface INoteRepository {
  findAll(): Promise<Note[]>;
  findById(id: string): Promise<Note | undefined>;
  findByUserId(userId: string): Promise<Note[]>;
  findByFolderId(folderId: string): Promise<Note[]>;
  create(note: Note): Promise<Note>;
  update(id: string, note: Partial<Note>): Promise<Note | undefined>;
  delete(id: string): Promise<boolean>;
  save(notes: Note[]): Promise<void>;
}