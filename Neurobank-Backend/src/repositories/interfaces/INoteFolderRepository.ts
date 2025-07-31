import { NoteFolder } from '../../types/NoteFolder';

export interface INoteFolderRepository {
  findAll(): Promise<NoteFolder[]>;
  findById(id: string): Promise<NoteFolder | undefined>;
  findByUserId(userId: string): Promise<NoteFolder[]>;
  create(noteFolder: NoteFolder): Promise<NoteFolder>;
  update(id: string, noteFolder: Partial<NoteFolder>): Promise<NoteFolder | undefined>;
  delete(id: string): Promise<boolean>;
  save(noteFolders: NoteFolder[]): Promise<void>;
}