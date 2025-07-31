export interface DailyStats {
  date: string;
  notesCreated: number;
  flashcardsStudied: number;
  flashcardsCreated: number;
  createdAt?: string;
}

export interface UserStatistics {
  id: string;
  userId: string;
  dailyStats: DailyStats[];
  createdAt: string;
  updatedAt: string;
}

export interface WeeklyStats extends Array<DailyStats> {}

export interface TotalStats {
  totalNotesCreated: number;
  totalFlashcardsStudied: number;
  totalFlashcardsCreated: number;
}

export interface Streaks {
  noteStreak: number;
  flashcardStudyStreak: number;
}

export interface DashboardStats {
  weekly: WeeklyStats;
  total: TotalStats;
  streaks: Streaks;
  today: DailyStats;
}