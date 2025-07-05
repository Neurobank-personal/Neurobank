const express = require("express");
const router = express.Router();
const statisticsService = require("../services/statisticsService");

// GET /api/statistics/user/:userId/weekly
// Hämta veckostatistik för användare
router.get("/user/:userId/weekly", async (req, res, next) => {
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
router.get("/user/:userId/total", async (req, res, next) => {
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
router.get("/user/:userId/streaks", async (req, res, next) => {
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
router.get("/user/:userId/today", async (req, res, next) => {
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
router.get("/user/:userId/dashboard", async (req, res, next) => {
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
router.post("/user/:userId/record/note", async (req, res, next) => {
  try {
    const { userId } = req.params;
    const todayStats = await statisticsService.recordNoteCreated(userId);

    res.json({
      success: true,
      message: "Note creation recorded",
      data: todayStats,
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/statistics/user/:userId/record/flashcard-study
// Manuellt registrera att flashcards studerats (backup endpoint)
router.post("/user/:userId/record/flashcard-study", async (req, res, next) => {
  try {
    const { userId } = req.params;
    const { count = 1 } = req.body;
    const todayStats = await statisticsService.recordFlashcardStudied(
      userId,
      count
    );

    res.json({
      success: true,
      message: "Flashcard study recorded",
      data: todayStats,
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/statistics/user/:userId/record/flashcard-creation
// Manuellt registrera att flashcards skapats (backup endpoint)
router.post(
  "/user/:userId/record/flashcard-creation",
  async (req, res, next) => {
    try {
      const { userId } = req.params;
      const { count = 1 } = req.body;
      const todayStats = await statisticsService.recordFlashcardsCreated(
        userId,
        count
      );

      res.json({
        success: true,
        message: "Flashcard creation recorded",
        data: todayStats,
      });
    } catch (error) {
      next(error);
    }
  }
);

// DELETE /api/statistics/user/:userId/cleanup
// Rensa gamla statistikdata (behåll bara senaste 90 dagarna)
router.delete("/user/:userId/cleanup", async (req, res, next) => {
  try {
    const { userId } = req.params;
    await statisticsService.cleanOldStats(userId);

    res.json({
      success: true,
      message: "Old statistics cleaned up",
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/statistics/user/:userId/verify
// Verifiera och reparera statistik mot faktisk data
router.post("/user/:userId/verify", async (req, res, next) => {
  try {
    const { userId } = req.params;
    const verification = await statisticsService.verifyAndRepairStats(userId);

    res.json({
      success: true,
      message: verification.wasRepaired
        ? "Statistics repaired"
        : "Statistics verified as correct",
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
router.get("/user/:userId/verified", async (req, res, next) => {
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
router.get("/user/:userId/calculated", async (req, res, next) => {
  try {
    const { userId } = req.params;
    const calculatedStats =
      await statisticsService.getCalculatedStatsWithFlashcardsStudied(userId);

    // Beräkna totaler och streaks från den beräknade datan
    const totals = calculatedStats.reduce(
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

    // Enkla streaks från beräknad data
    const streaks = await statisticsService.calculateStreaksFromData(
      calculatedStats
    );

    // Dagens data
    const today = statisticsService.getTodayDateString();
    const todayStats = calculatedStats.find((day) => day.date === today) || {
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
        source: "calculated",
        note: "This data is calculated directly from source files. Note: flashcardsStudied shows unique cards reviewed, not total study sessions.",
      },
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
