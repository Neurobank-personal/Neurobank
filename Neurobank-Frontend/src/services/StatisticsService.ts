import { getApiUrl } from "../config/api";
import type {
  WeeklyStats,
  TotalStats,
  Streaks,
  DailyStats,
  DashboardStats,
} from "../types/Statistics";

export class StatisticsService {
  /**
   * Get weekly statistics for a user (last 7 days)
   */
  static async getWeeklyStats(userId: string): Promise<WeeklyStats> {
    try {
      const response = await fetch(
        getApiUrl(`/api/statistics/user/${userId}/weekly`)
      );
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      return data.data;
    } catch (error) {
      console.error("Error fetching weekly stats:", error);
      throw error;
    }
  }

  /**
   * Get total statistics for a user
   */
  static async getTotalStats(userId: string): Promise<TotalStats> {
    try {
      const response = await fetch(
        getApiUrl(`/api/statistics/user/${userId}/total`)
      );
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      return data.data;
    } catch (error) {
      console.error("Error fetching total stats:", error);
      throw error;
    }
  }

  /**
   * Get streaks for a user
   */
  static async getStreaks(userId: string): Promise<Streaks> {
    try {
      const response = await fetch(
        getApiUrl(`/api/statistics/user/${userId}/streaks`)
      );
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      return data.data;
    } catch (error) {
      console.error("Error fetching streaks:", error);
      throw error;
    }
  }

  /**
   * Get today's statistics for a user
   */
  static async getTodayStats(userId: string): Promise<DailyStats> {
    try {
      const response = await fetch(
        getApiUrl(`/api/statistics/user/${userId}/today`)
      );
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      return data.data;
    } catch (error) {
      console.error("Error fetching today stats:", error);
      throw error;
    }
  }

  /**
   * Get all dashboard statistics in one request
   */
  static async getDashboardStats(userId: string): Promise<DashboardStats> {
    try {
      const response = await fetch(
        getApiUrl(`/api/statistics/user/${userId}/dashboard`)
      );
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      return data.data;
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
      throw error;
    }
  }

  /**
   * Manually record a note creation (backup)
   */
  static async recordNoteCreation(userId: string): Promise<DailyStats> {
    try {
      const response = await fetch(
        getApiUrl(`/api/statistics/user/${userId}/record/note`),
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      return data.data;
    } catch (error) {
      console.error("Error recording note creation:", error);
      throw error;
    }
  }

  /**
   * Manually record studied flashcards (backup)
   */
  static async recordFlashcardStudy(
    userId: string,
    count: number = 1
  ): Promise<DailyStats> {
    try {
      const response = await fetch(
        getApiUrl(`/api/statistics/user/${userId}/record/flashcard-study`),
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ count }),
        }
      );
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      return data.data;
    } catch (error) {
      console.error("Error recording flashcard study:", error);
      throw error;
    }
  }

  /**
   * Manually record created flashcards (backup)
   */
  static async recordFlashcardCreation(
    userId: string,
    count: number = 1
  ): Promise<DailyStats> {
    try {
      const response = await fetch(
        getApiUrl(`/api/statistics/user/${userId}/record/flashcard-creation`),
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ count }),
        }
      );
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      return data.data;
    } catch (error) {
      console.error("Error recording flashcard creation:", error);
      throw error;
    }
  }

  /**
   * Clean up old statistics data
   */
  static async cleanupOldStats(userId: string): Promise<void> {
    try {
      const response = await fetch(
        getApiUrl(`/api/statistics/user/${userId}/cleanup`),
        {
          method: "DELETE",
        }
      );
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
    } catch (error) {
      console.error("Error cleaning up old stats:", error);
      throw error;
    }
  }

  /**
   * Verify and repair statistics against source data
   */
  static async verifyAndRepairStats(userId: string): Promise<{
    wasRepaired: boolean;
    discrepancies: any[];
    discrepancyCount: number;
  }> {
    try {
      const response = await fetch(
        getApiUrl(`/api/statistics/user/${userId}/verify`),
        {
          method: "POST",
        }
      );
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      return data.data;
    } catch (error) {
      console.error("Error verifying stats:", error);
      throw error;
    }
  }

  /**
   * Get statistics with automatic verification
   */
  static async getVerifiedDashboardStats(
    userId: string
  ): Promise<DashboardStats> {
    try {
      const response = await fetch(
        getApiUrl(`/api/statistics/user/${userId}/verified`)
      );
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      return data.data;
    } catch (error) {
      console.error("Error fetching verified dashboard stats:", error);
      throw error;
    }
  }

  /**
   * Get statistics calculated directly from source data (slow but guaranteed correct)
   */
  static async getCalculatedDashboardStats(
    userId: string
  ): Promise<DashboardStats> {
    try {
      const response = await fetch(
        getApiUrl(`/api/statistics/user/${userId}/calculated`)
      );
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      return data.data;
    } catch (error) {
      console.error("Error fetching calculated dashboard stats:", error);
      throw error;
    }
  }

  /**
   * Helper function to format dates for display
   */
  static formatDateForDisplay(dateString: string): string {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return "Today";
    } else if (date.toDateString() === yesterday.toDateString()) {
      return "Yesterday";
    } else {
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });
    }
  }

  /**
   * Helper function to calculate percentage change
   */
  static calculatePercentageChange(current: number, previous: number): number {
    if (previous === 0) return current > 0 ? 100 : 0;
    return Math.round(((current - previous) / previous) * 100);
  }

  /**
   * Get previous period data for comparison
   */
  static getPreviousPeriodComparison(weeklyStats: WeeklyStats): {
    thisWeek: number;
    lastWeek: number;
    change: number;
  } {
    const thisWeekTotal = weeklyStats.reduce(
      (sum, day) =>
        sum + day.notesCreated + day.flashcardsStudied + day.flashcardsCreated,
      0
    );

    // For simplicity, count last week as 0 until we implement longer history
    const lastWeekTotal = 0;
    const change = this.calculatePercentageChange(thisWeekTotal, lastWeekTotal);

    return {
      thisWeek: thisWeekTotal,
      lastWeek: lastWeekTotal,
      change,
    };
  }

  /**
   * Format statistics for easy display in UI
   */
  static formatStatsForDisplay(stats: DashboardStats) {
    return {
      todayTotal:
        stats.today.notesCreated +
        stats.today.flashcardsStudied +
        stats.today.flashcardsCreated,
      weeklyTotal: stats.weekly.reduce(
        (sum, day) =>
          sum +
          day.notesCreated +
          day.flashcardsStudied +
          day.flashcardsCreated,
        0
      ),
      ...stats,
    };
  }
}
