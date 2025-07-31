export interface Deck {
  id: string;
  name: string;
  description?: string;
  color?: string;
  createdAt: string;
  updatedAt: string;
  userId: string;
  flashcardCount?: number;
}

export interface CreateDeckRequest {
  name: string;
  description?: string;
  color?: string;
  userId: string;
}

export interface UpdateDeckRequest {
  id: string;
  name?: string;
  description?: string;
  color?: string;
}