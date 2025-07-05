export interface DailyStats {
  date: string;
  notesCreated: number;
  flashcardsStudied: number;
  flashcardsCreated: number;
  createdAt?: string;
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

export interface UserStatistics {
  id: string;
  userId: string;
  dailyStats: DailyStats[];
  createdAt: string;
  updatedAt: string;
}

export interface DashboardStats {
  weekly: WeeklyStats;
  total: TotalStats;
  streaks: Streaks;
  today: DailyStats;
}

// Hjälptyper för UI
export interface StatsSummary {
  title: string;
  value: number;
  change?: number;
  icon: string;
  color: string;
}

export interface ChartDataPoint {
  date: string;
  value: number;
  label?: string;
}

export interface ActivityHeatmapData {
  date: string;
  count: number;
  level: 0 | 1 | 2 | 3 | 4; // 0 = ingen aktivitet, 4 = högsta aktivitet
}
