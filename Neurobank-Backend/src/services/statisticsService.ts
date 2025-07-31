import fileService from "./fileService";
import { UserStatistics, DailyStats, WeeklyStats, TotalStats, Streaks, DashboardStats } from "../types/Statistics";
import { Note } from "../types/Note";
import { Flashcard } from "../types/Flashcard";

interface TodayStatsResult {
  userStats: UserStatistics;
  todayStats: DailyStats;
}

interface RepairResult {
  wasRepaired: boolean;
  repairedStats: DailyStats[];
  discrepancies: Discrepancy[];
}

interface Discrepancy {
  date: string;
  type: "missing" | "mismatch";
  actual?: DailyStats;
  saved?: DailyStats | null;
  differences?: string[];
}

interface VerificationResult {
  stats: UserStatistics;
  wasRepaired: boolean;
  discrepancies: Discrepancy[];
}

class StatisticsService {
  generateId(): string {
    return Date.now().toString() + Math.random().toString(36).substr(2, 9);
  }

  // Hämta eller skapa användarstatistik
  async getUserStats(userId: string): Promise<UserStatistics> {
    const allStats = await fileService.readUserStats();
    let userStats = allStats.find((stats) => stats.userId === userId);

    if (!userStats) {
      userStats = {
        id: this.generateId(),
        userId,
        dailyStats: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      allStats.push(userStats);
      await fileService.writeUserStats(allStats);
    }

    return userStats;
  }

  // Hämta dagens datum i YYYY-MM-DD format
  getTodayDateString(): string {
    return new Date().toISOString().split("T")[0];
  }

  // Hämta eller skapa dagens statistik
  async getTodayStats(userId: string): Promise<TodayStatsResult> {
    const userStats = await this.getUserStats(userId);
    const today = this.getTodayDateString();

    let todayStats = userStats.dailyStats.find((day) => day.date === today);

    if (!todayStats) {
      todayStats = {
        date: today,
        notesCreated: 0,
        flashcardsStudied: 0,
        flashcardsCreated: 0,
        createdAt: new Date().toISOString(),
      };
      userStats.dailyStats.push(todayStats);
    }

    return { userStats, todayStats };
  }

  // Registrera att en note skapats
  async recordNoteCreated(userId: string): Promise<DailyStats> {
    const { userStats, todayStats } = await this.getTodayStats(userId);

    todayStats.notesCreated += 1;
    userStats.updatedAt = new Date().toISOString();

    const allStats = await fileService.readUserStats();
    const statsIndex = allStats.findIndex((stats) => stats.userId === userId);
    allStats[statsIndex] = userStats;

    await fileService.writeUserStats(allStats);
    return todayStats;
  }

  // Registrera att flashcards studerats
  async recordFlashcardStudied(userId: string, count: number = 1): Promise<DailyStats> {
    const { userStats, todayStats } = await this.getTodayStats(userId);

    todayStats.flashcardsStudied += count;
    userStats.updatedAt = new Date().toISOString();

    const allStats = await fileService.readUserStats();
    const statsIndex = allStats.findIndex((stats) => stats.userId === userId);
    allStats[statsIndex] = userStats;

    await fileService.writeUserStats(allStats);
    return todayStats;
  }

  // Registrera att flashcards skapats
  async recordFlashcardsCreated(userId: string, count: number = 1): Promise<DailyStats> {
    const { userStats, todayStats } = await this.getTodayStats(userId);

    todayStats.flashcardsCreated += count;
    userStats.updatedAt = new Date().toISOString();

    const allStats = await fileService.readUserStats();
    const statsIndex = allStats.findIndex((stats) => stats.userId === userId);
    allStats[statsIndex] = userStats;

    await fileService.writeUserStats(allStats);
    return todayStats;
  }

  // Hämta statistik för senaste 7 dagarna
  async getWeeklyStats(userId: string): Promise<WeeklyStats> {
    const userStats = await this.getUserStats(userId);
    const last7Days = this.getLast7Days();

    // Skapa en array med de senaste 7 dagarna och tillhörande statistik
    const weeklyStats: WeeklyStats = last7Days.map((date) => {
      const dayStats = userStats.dailyStats.find((day) => day.date === date);
      return {
        date,
        notesCreated: dayStats?.notesCreated || 0,
        flashcardsStudied: dayStats?.flashcardsStudied || 0,
        flashcardsCreated: dayStats?.flashcardsCreated || 0,
      };
    });

    return weeklyStats;
  }

  // Hämta de senaste 7 dagarnas datum
  getLast7Days(): string[] {
    const dates: string[] = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      dates.push(date.toISOString().split("T")[0]);
    }
    return dates;
  }

  // Beräkna total statistik
  async getTotalStats(userId: string): Promise<TotalStats> {
    const userStats = await this.getUserStats(userId);

    const totals = userStats.dailyStats.reduce(
      (acc, day) => {
        acc.totalNotesCreated += day.notesCreated;
        acc.totalFlashcardsStudied += day.flashcardsStudied;
        acc.totalFlashcardsCreated += day.flashcardsCreated;
        return acc;
      },
      {
        totalNotesCreated: 0,
        totalFlashcardsStudied: 0,
        totalFlashcardsCreated: 0,
      }
    );

    return totals;
  }

  // Beräkna streaks (för framtida utbyggnad)
  async calculateStreaks(userId: string): Promise<Streaks> {
    const userStats = await this.getUserStats(userId);
    const sortedDays = [...userStats.dailyStats].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    // Beräkna streak för notes (dagar i rad med minst 1 note)
    let noteStreak = 0;
    let flashcardStudyStreak = 0;

    const today = this.getTodayDateString();
    let currentDate = new Date(today);

    for (let i = 0; i < 365; i++) {
      // Max 365 dagar bakåt
      const dateString = currentDate.toISOString().split("T")[0];
      const dayStats = sortedDays.find((day) => day.date === dateString);

      if (dayStats && dayStats.notesCreated > 0) {
        noteStreak++;
      } else if (i === 0) {
        // Om idag inte har några notes, kolla igår
        currentDate.setDate(currentDate.getDate() - 1);
        continue;
      } else {
        break;
      }

      currentDate.setDate(currentDate.getDate() - 1);
    }

    // Återställ datum för flashcard streak
    currentDate = new Date(today);
    for (let i = 0; i < 365; i++) {
      const dateString = currentDate.toISOString().split("T")[0];
      const dayStats = sortedDays.find((day) => day.date === dateString);

      if (dayStats && dayStats.flashcardsStudied > 0) {
        flashcardStudyStreak++;
      } else if (i === 0) {
        currentDate.setDate(currentDate.getDate() - 1);
        continue;
      } else {
        break;
      }

      currentDate.setDate(currentDate.getDate() - 1);
    }

    return {
      noteStreak,
      flashcardStudyStreak,
    };
  }

  // Rensa gamla statistik (behåll bara senaste 90 dagarna)
  async cleanOldStats(userId: string): Promise<UserStatistics> {
    const userStats = await this.getUserStats(userId);
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - 90);
    const cutoffString = cutoffDate.toISOString().split("T")[0];

    userStats.dailyStats = userStats.dailyStats.filter(
      (day) => day.date >= cutoffString
    );
    userStats.updatedAt = new Date().toISOString();

    const allStats = await fileService.readUserStats();
    const statsIndex = allStats.findIndex((stats) => stats.userId === userId);
    allStats[statsIndex] = userStats;

    await fileService.writeUserStats(allStats);
    return userStats;
  }

  // Beräkna statistik direkt från källdata (för verifiering/reparation)
  // OBS: flashcardsStudied är en kumulativ räknare och beräknas inte från källdata
  async calculateActualStats(userId: string): Promise<DailyStats[]> {
    const [notes, flashcards] = await Promise.all([
      fileService.readNotes(),
      fileService.readFlashcards(),
    ]);

    const userNotes = notes.filter((note) => note.userId === userId);
    const userFlashcards = flashcards.filter((card) => card.userId === userId);

    // Beräkna daglig statistik från faktisk data
    const dailyStats = new Map<string, DailyStats>();
    const last90Days = this.getLast90Days();

    // Initiera alla dagar med 0
    last90Days.forEach((date) => {
      dailyStats.set(date, {
        date,
        notesCreated: 0,
        flashcardsStudied: 0,
        flashcardsCreated: 0,
        createdAt: new Date().toISOString(),
      });
    });

    // Räkna notes
    userNotes.forEach((note) => {
      const dateString = new Date(note.createdAt).toISOString().split("T")[0];
      if (dailyStats.has(dateString)) {
        const dayStats = dailyStats.get(dateString)!;
        dayStats.notesCreated++;
      }
    });

    // Räkna skapade flashcards
    userFlashcards.forEach((card) => {
      const dateString = new Date(card.createdAt).toISOString().split("T")[0];
      if (dailyStats.has(dateString)) {
        const dayStats = dailyStats.get(dateString)!;
        dayStats.flashcardsCreated++;
      }
    });

    // flashcardsStudied beräknas INTE från källdata eftersom det är en kumulativ räknare
    // som kan öka flera gånger per dag när samma kort studeras upprepade gånger

    return Array.from(dailyStats.values()).sort((a, b) =>
      a.date.localeCompare(b.date)
    );
  }

  // Verifiera och reparera statistik mot faktisk data
  // OBS: flashcardsStudied repareras INTE eftersom det är en kumulativ räknare
  async verifyAndRepairStats(userId: string): Promise<RepairResult> {
    const actualStats = await this.calculateActualStats(userId);
    const currentUserStats = await this.getUserStats(userId);

    // Jämför och uppdatera om nödvändigt
    let needsUpdate = false;
    const repairedStats = { ...currentUserStats };

    // Skapa en karta av befintlig statistik för enkel uppslagning
    const existingStatsMap = new Map(
      currentUserStats.dailyStats.map((day) => [day.date, day])
    );

    // Uppdatera bara notesCreated och flashcardsCreated, behåll flashcardsStudied
    const updatedDailyStats = actualStats.map((actualDay) => {
      const existingDay = existingStatsMap.get(actualDay.date);

      return {
        date: actualDay.date,
        notesCreated: actualDay.notesCreated,
        flashcardsStudied: existingDay?.flashcardsStudied || 0, // Behåll befintligt värde
        flashcardsCreated: actualDay.flashcardsCreated,
        createdAt: existingDay?.createdAt || actualDay.createdAt,
      };
    });

    // Kolla om det behövs en uppdatering (jämför bara notesCreated och flashcardsCreated)
    const needsRepair = this.detectRepairableDiscrepancies(
      currentUserStats.dailyStats,
      actualStats
    );

    if (needsRepair) {
      needsUpdate = true;
      repairedStats.dailyStats = updatedDailyStats;
      repairedStats.updatedAt = new Date().toISOString();

      const allStats = await fileService.readUserStats();
      const statsIndex = allStats.findIndex((stats) => stats.userId === userId);
      if (statsIndex >= 0) {
        allStats[statsIndex] = repairedStats;
        await fileService.writeUserStats(allStats);
      }
    }

    // För diskrepans-rapporten, använd fullständig beräknad data för jämförelse
    const fullCalculatedStats =
      await this.getCalculatedStatsWithFlashcardsStudied(userId);

    return {
      wasRepaired: needsUpdate,
      repairedStats: updatedDailyStats,
      discrepancies: this.findDiscrepancies(
        currentUserStats.dailyStats,
        fullCalculatedStats,
        true // Inkludera flashcardsStudied i jämförelsen för information
      ),
    };
  }

  // Upptäck om reparation behövs (ignorerar flashcardsStudied)
  detectRepairableDiscrepancies(savedStats: DailyStats[], actualStats: DailyStats[]): boolean {
    const savedMap = new Map(savedStats.map((day) => [day.date, day]));

    return actualStats.some((actualDay) => {
      const savedDay = savedMap.get(actualDay.date);

      if (!savedDay) {
        return true; // Saknas helt
      }

      // Kontrollera bara reparerbara fält
      return (
        savedDay.notesCreated !== actualDay.notesCreated ||
        savedDay.flashcardsCreated !== actualDay.flashcardsCreated
      );
    });
  }

  // Hitta skillnader mellan sparad och beräknad statistik
  // compareFlashcardsStudied: om flashcardsStudied ska jämföras (för informationssyfte)
  findDiscrepancies(savedStats: DailyStats[], actualStats: DailyStats[], compareFlashcardsStudied: boolean = true): Discrepancy[] {
    const discrepancies: Discrepancy[] = [];
    const savedMap = new Map(savedStats.map((day) => [day.date, day]));

    actualStats.forEach((actualDay) => {
      const savedDay = savedMap.get(actualDay.date);
      if (!savedDay) {
        discrepancies.push({
          date: actualDay.date,
          type: "missing",
          actual: actualDay,
          saved: null,
        });
      } else {
        const diffs: string[] = [];

        // Jämför alltid notesCreated och flashcardsCreated
        if (savedDay.notesCreated !== actualDay.notesCreated) {
          diffs.push(
            `notes: ${savedDay.notesCreated} → ${actualDay.notesCreated} (will be repaired)`
          );
        }

        if (savedDay.flashcardsCreated !== actualDay.flashcardsCreated) {
          diffs.push(
            `created: ${savedDay.flashcardsCreated} → ${actualDay.flashcardsCreated} (will be repaired)`
          );
        }

        // Jämför flashcardsStudied bara för information, märk att det inte repareras
        if (
          compareFlashcardsStudied &&
          actualDay.flashcardsStudied !== undefined
        ) {
          if (savedDay.flashcardsStudied !== actualDay.flashcardsStudied) {
            diffs.push(
              `studied: ${savedDay.flashcardsStudied} vs ${actualDay.flashcardsStudied} (info only - NOT repaired)`
            );
          }
        }

        if (diffs.length > 0) {
          discrepancies.push({
            date: actualDay.date,
            type: "mismatch",
            differences: diffs,
            actual: actualDay,
            saved: savedDay,
          });
        }
      }
    });

    return discrepancies;
  }

  // Hämta senaste 90 dagarnas datum
  getLast90Days(): string[] {
    const dates: string[] = [];
    for (let i = 89; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      dates.push(date.toISOString().split("T")[0]);
    }
    return dates;
  }

  // Få statistik med automatisk verifiering (långsammare men korrekt)
  async getVerifiedStats(userId: string): Promise<VerificationResult> {
    const verification = await this.verifyAndRepairStats(userId);

    if (verification.wasRepaired) {
      console.log(
        `Statistics repaired for user ${userId}:`,
        verification.discrepancies
      );
    }

    return {
      stats: await this.getUserStats(userId),
      wasRepaired: verification.wasRepaired,
      discrepancies: verification.discrepancies,
    };
  }

  // Beräkna streaks från given data
  calculateStreaksFromData(dailyStats: DailyStats[]): Streaks {
    const sortedDays = [...dailyStats].sort((a, b) =>
      b.date.localeCompare(a.date)
    );

    let noteStreak = 0;
    let flashcardStudyStreak = 0;

    for (const day of sortedDays) {
      // Räkna note streak
      if (day.notesCreated > 0) {
        noteStreak++;
      } else {
        break;
      }
    }

    // Återställ för flashcard streak
    for (const day of sortedDays) {
      // Räkna flashcard study streak
      if (day.flashcardsStudied > 0) {
        flashcardStudyStreak++;
      } else {
        break;
      }
    }

    return {
      noteStreak,
      flashcardStudyStreak,
    };
  }

  // Beräkna flashcardsStudied från källdata (endast för jämförelse, inte reparation)
  async calculateFlashcardsStudiedFromSource(userId: string): Promise<{ date: string; flashcardsStudied: number }[]> {
    const flashcards = await fileService.readFlashcards();
    const userFlashcards = flashcards.filter((card) => card.userId === userId);

    const dailyStats = new Map<string, { date: string; flashcardsStudied: number }>();
    const last90Days = this.getLast90Days();

    // Initiera alla dagar med 0
    last90Days.forEach((date) => {
      dailyStats.set(date, {
        date,
        flashcardsStudied: 0,
      });
    });

    // Räkna studerade flashcards (från lastReviewed)
    userFlashcards.forEach((card) => {
      if (card.lastReviewed) {
        const dateString = new Date(card.lastReviewed)
          .toISOString()
          .split("T")[0];
        if (dailyStats.has(dateString)) {
          const dayStats = dailyStats.get(dateString)!;
          dayStats.flashcardsStudied++;
        }
      }
    });

    return Array.from(dailyStats.values()).sort((a, b) =>
      a.date.localeCompare(b.date)
    );
  }

  // Få fullständig beräknad statistik inklusive flashcardsStudied från källdata
  // (används för API-endpoint /calculated för att visa skillnader)
  async getCalculatedStatsWithFlashcardsStudied(userId: string): Promise<DailyStats[]> {
    const [baseStats, flashcardsStudiedStats] = await Promise.all([
      this.calculateActualStats(userId),
      this.calculateFlashcardsStudiedFromSource(userId),
    ]);

    // Slå ihop data
    const flashcardsStudiedMap = new Map(
      flashcardsStudiedStats.map((day) => [day.date, day.flashcardsStudied])
    );

    const completeStats = baseStats.map((day) => ({
      ...day,
      flashcardsStudied: flashcardsStudiedMap.get(day.date) || 0,
    }));

    return completeStats;
  }
}

export default new StatisticsService();