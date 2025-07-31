import { Router, Request, Response, NextFunction } from 'express'
import statisticsService from '../services/statisticsService'
import { DailyStats, WeeklyStats, TotalStats, Streaks, DashboardStats } from '../types/Statistics'

const router = Router()

interface StatisticsResponse<T> {
  success: boolean;
  data: T;
}

interface RecordFlashcardStudyRequest {
  count?: number;
}

interface RecordFlashcardCreationRequest {
  count?: number;
}

interface VerificationResponse {
  success: boolean;
  message: string;
  data: {
    wasRepaired: boolean;
    discrepancies: any[];
    discrepancyCount: number;
  };
}

interface VerifiedStatsResponse {
  success: boolean;
  data: any;
  meta: {
    wasRepaired: boolean;
    discrepancies: any[];
  };
}

interface CalculatedStatsResponse {
  success: boolean;
  data: {
    weekly: DailyStats[];
    total: TotalStats;
    streaks: Streaks;
    today: DailyStats;
  };
  meta: {
    source: string;
    note: string;
  };
}

// GET /api/statistics/user/:userId/weekly
// Hämta veckostatistik för användare
router.get('/user/:userId/weekly', async (req: Request<{userId: string}>, res: Response<StatisticsResponse<WeeklyStats>>, next: NextFunction) => {
  try {
    const { userId } = req.params;
    const weeklyStats = await statisticsService.getWeeklyStats(userId);

    res.json({
      success: true,
      data: weeklyStats,
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/statistics/user/:userId/total
// Hämta total statistik för användare
router.get('/user/:userId/total', async (req: Request<{userId: string}>, res: Response<StatisticsResponse<TotalStats>>, next: NextFunction) => {
  try {
    const { userId } = req.params;
    const totalStats = await statisticsService.getTotalStats(userId);

    res.json({
      success: true,
      data: totalStats,
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/statistics/user/:userId/streaks
// Hämta streaks för användare
router.get('/user/:userId/streaks', async (req: Request<{userId: string}>, res: Response<StatisticsResponse<Streaks>>, next: NextFunction) => {
  try {
    const { userId } = req.params;
    const streaks = await statisticsService.calculateStreaks(userId);

    res.json({
      success: true,
      data: streaks,
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/statistics/user/:userId/today
// Hämta dagens statistik för användare
router.get('/user/:userId/today', async (req: Request<{userId: string}>, res: Response<StatisticsResponse<DailyStats>>, next: NextFunction) => {
  try {
    const { userId } = req.params;
    const { todayStats } = await statisticsService.getTodayStats(userId);

    res.json({
      success: true,
      data: todayStats,
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/statistics/user/:userId/dashboard
// Hämta all relevant statistik för dashboard
router.get('/user/:userId/dashboard', async (req: Request<{userId: string}>, res: Response<StatisticsResponse<DashboardStats>>, next: NextFunction) => {
  try {
    const { userId } = req.params;

    const [weeklyStats, totalStats, streaks, { todayStats }] =
      await Promise.all([
        statisticsService.getWeeklyStats(userId),
        statisticsService.getTotalStats(userId),
        statisticsService.calculateStreaks(userId),
        statisticsService.getTodayStats(userId),
      ]);

    res.json({
      success: true,
      data: {
        weekly: weeklyStats,
        total: totalStats,
        streaks: streaks,
        today: todayStats,
      },
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/statistics/user/:userId/record/note
// Manuellt registrera att en note skapats (backup endpoint)
router.post('/user/:userId/record/note', async (req: Request<{userId: string}>, res: Response<{success: boolean; message: string; data: DailyStats}>, next: NextFunction) => {
  try {
    const { userId } = req.params;
    const todayStats = await statisticsService.recordNoteCreated(userId);

    res.json({
      success: true,
      message: 'Note creation recorded',
      data: todayStats,
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/statistics/user/:userId/record/flashcard-study
// Manuellt registrera att flashcards studerats (backup endpoint)
router.post('/user/:userId/record/flashcard-study', async (req: Request<{userId: string}, {success: boolean; message: string; data: DailyStats}, RecordFlashcardStudyRequest>, res: Response<{success: boolean; message: string; data: DailyStats}>, next: NextFunction) => {
  try {
    const { userId } = req.params;
    const { count = 1 } = req.body as RecordFlashcardStudyRequest;
    const todayStats = await statisticsService.recordFlashcardStudied(
      userId,
      count
    );

    res.json({
      success: true,
      message: 'Flashcard study recorded',
      data: todayStats,
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/statistics/user/:userId/record/flashcard-creation
// Manuellt registrera att flashcards skapats (backup endpoint)
router.post(
  '/user/:userId/record/flashcard-creation',
  async (req: Request<{userId: string}, {success: boolean; message: string; data: DailyStats}, RecordFlashcardCreationRequest>, res: Response<{success: boolean; message: string; data: DailyStats}>, next: NextFunction) => {
    try {
      const { userId } = req.params;
      const { count = 1 } = req.body as RecordFlashcardCreationRequest;
      const todayStats = await statisticsService.recordFlashcardsCreated(
        userId,
        count
      );

      res.json({
        success: true,
        message: 'Flashcard creation recorded',
        data: todayStats,
      });
    } catch (error) {
      next(error);
    }
  }
);

// DELETE /api/statistics/user/:userId/cleanup
// Rensa gamla statistikdata (behåll bara senaste 90 dagarna)
router.delete('/user/:userId/cleanup', async (req: Request<{userId: string}>, res: Response<{success: boolean; message: string}>, next: NextFunction) => {
  try {
    const { userId } = req.params;
    await statisticsService.cleanOldStats(userId);

    res.json({
      success: true,
      message: 'Old statistics cleaned up',
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/statistics/user/:userId/verify
// Verifiera och reparera statistik mot faktisk data
router.post('/user/:userId/verify', async (req: Request<{userId: string}>, res: Response<VerificationResponse>, next: NextFunction) => {
  try {
    const { userId } = req.params;
    const verification = await statisticsService.verifyAndRepairStats(userId);

    res.json({
      success: true,
      message: verification.wasRepaired
        ? 'Statistics repaired'
        : 'Statistics verified as correct',
      data: {
        wasRepaired: verification.wasRepaired,
        discrepancies: verification.discrepancies,
        discrepancyCount: verification.discrepancies.length,
      },
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/statistics/user/:userId/verified
// Hämta statistik med automatisk verifiering
router.get('/user/:userId/verified', async (req: Request<{userId: string}>, res: Response<VerifiedStatsResponse>, next: NextFunction) => {
  try {
    const { userId } = req.params;
    const result = await statisticsService.getVerifiedStats(userId);

    res.json({
      success: true,
      data: result.stats,
      meta: {
        wasRepaired: result.wasRepaired,
        discrepancies: result.discrepancies,
      },
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/statistics/user/:userId/calculated
// Hämta statistik beräknad direkt från källdata (långsamt men garanterat korrekt)
router.get('/user/:userId/calculated', async (req: Request<{userId: string}>, res: Response<CalculatedStatsResponse>, next: NextFunction) => {
  try {
    const { userId } = req.params;
    const calculatedStats =
      await statisticsService.getCalculatedStatsWithFlashcardsStudied(userId);

    // Beräkna totaler och streaks från den beräknade datan
    const totals = calculatedStats.reduce(
      (acc: TotalStats, day: DailyStats) => {
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

    // Enkla streaks från beräknad data
    const streaks = await statisticsService.calculateStreaksFromData(
      calculatedStats
    );

    // Dagens data
    const today = statisticsService.getTodayDateString();
    const todayStats = calculatedStats.find((day: DailyStats) => day.date === today) || {
      date: today,
      notesCreated: 0,
      flashcardsStudied: 0,
      flashcardsCreated: 0,
    };

    res.json({
      success: true,
      data: {
        weekly: calculatedStats.slice(-7),
        total: totals,
        streaks: streaks,
        today: todayStats,
      },
      meta: {
        source: 'calculated',
        note: 'This data is calculated directly from source files. Note: flashcardsStudied shows unique cards reviewed, not total study sessions.',
      },
    });
  } catch (error) {
    next(error);
  }
});

export default router
