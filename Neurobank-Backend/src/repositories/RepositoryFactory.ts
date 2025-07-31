// Repository Interfaces
import { IUserRepository } from './interfaces/IUserRepository';
import { INoteRepository } from './interfaces/INoteRepository';
import { IFlashcardRepository } from './interfaces/IFlashcardRepository';
import { IDeckRepository } from './interfaces/IDeckRepository';
import { ITaskRepository } from './interfaces/ITaskRepository';
import { INoteFolderRepository } from './interfaces/INoteFolderRepository';
import { IStatisticsRepository } from './interfaces/IStatisticsRepository';

// JSON Implementations
import { JsonUserRepository } from './json/JsonUserRepository';
import { JsonNoteRepository } from './json/JsonNoteRepository';
import { JsonFlashcardRepository } from './json/JsonFlashcardRepository';
import { JsonDeckRepository } from './json/JsonDeckRepository';
import { JsonTaskRepository } from './json/JsonTaskRepository';
import { JsonNoteFolderRepository } from './json/JsonNoteFolderRepository';
import { JsonStatisticsRepository } from './json/JsonStatisticsRepository';

export type RepositoryType = 'json' | 'supabase';

export class RepositoryFactory {
  private static repositoryType: RepositoryType = 'json'; // Default to JSON

  static setRepositoryType(type: RepositoryType): void {
    this.repositoryType = type;
  }

  static getUserRepository(): IUserRepository {
    switch (this.repositoryType) {
      case 'json':
        return new JsonUserRepository();
      // case 'supabase':
      //   return new SupabaseUserRepository();
      default:
        return new JsonUserRepository();
    }
  }

  static getNoteRepository(): INoteRepository {
    switch (this.repositoryType) {
      case 'json':
        return new JsonNoteRepository();
      // case 'supabase':
      //   return new SupabaseNoteRepository();
      default:
        return new JsonNoteRepository();
    }
  }

  static getFlashcardRepository(): IFlashcardRepository {
    switch (this.repositoryType) {
      case 'json':
        return new JsonFlashcardRepository();
      // case 'supabase':
      //   return new SupabaseFlashcardRepository();
      default:
        return new JsonFlashcardRepository();
    }
  }

  static getDeckRepository(): IDeckRepository {
    switch (this.repositoryType) {
      case 'json':
        return new JsonDeckRepository();
      // case 'supabase':
      //   return new SupabaseDeckRepository();
      default:
        return new JsonDeckRepository();
    }
  }

  static getTaskRepository(): ITaskRepository {
    switch (this.repositoryType) {
      case 'json':
        return new JsonTaskRepository();
      // case 'supabase':
      //   return new SupabaseTaskRepository();
      default:
        return new JsonTaskRepository();
    }
  }

  static getNoteFolderRepository(): INoteFolderRepository {
    switch (this.repositoryType) {
      case 'json':
        return new JsonNoteFolderRepository();
      // case 'supabase':
      //   return new SupabaseNoteFolderRepository();
      default:
        return new JsonNoteFolderRepository();
    }
  }

  static getStatisticsRepository(): IStatisticsRepository {
    switch (this.repositoryType) {
      case 'json':
        return new JsonStatisticsRepository();
      // case 'supabase':
      //   return new SupabaseStatisticsRepository();
      default:
        return new JsonStatisticsRepository();
    }
  }
}