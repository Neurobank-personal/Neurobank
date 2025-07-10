<template>
  <div class="statistics-component">
    <div class="stats-header">
      <h2>Your Progress</h2>
      <div class="header-actions">
        <button @click="verifyStats" class="verify-btn" :disabled="loading">
          {{
            verifying
              ? "Verifying..."
              : "Verify - debug to sync with actual database"
          }}
        </button>
        <button @click="refreshStats" class="refresh-btn" :disabled="loading">
          {{ loading ? "Loading..." : "Refresh" }}
        </button>
      </div>
    </div>

    <div v-if="loading" class="loading">Loading statistics...</div>

    <div v-else-if="error" class="error">
      Error loading statistics: {{ error }}
    </div>

    <div
      v-if="verificationResult"
      class="verification-result"
      :class="{
        success:
          verificationResult.includes('correct') ||
          verificationResult.includes('Repaired'),
      }"
    >
      {{ verificationResult }}
    </div>

    <div v-else-if="stats" class="stats-content">
      <!-- Summary Cards -->
      <div class="summary-grid">
        <div class="summary-card notes-summary">
          <div class="summary-header">
            <h3>Notes</h3>
          </div>
          <div class="summary-value">{{ stats.total.totalNotesCreated }}</div>
          <div class="summary-label">Total Created</div>
        </div>

        <div class="summary-card flashcards-summary">
          <div class="summary-header">
            <h3>Flashcards</h3>
          </div>
          <div class="summary-value">
            {{ stats.total.totalFlashcardsCreated }}
          </div>
          <div class="summary-label">Total Created</div>
        </div>

        <div class="summary-card study-summary">
          <div class="summary-header">
            <h3>Study Sessions</h3>
          </div>
          <div class="summary-value">
            {{ stats.total.totalFlashcardsStudied }}
          </div>
          <div class="summary-label">Cards Studied</div>
        </div>

        <div class="summary-card streak-summary">
          <div class="summary-header">
            <h3>Current Streak</h3>
          </div>
          <div class="summary-value">
            {{
              Math.max(
                stats.streaks.noteStreak,
                stats.streaks.flashcardStudyStreak
              )
            }}
          </div>
          <div class="summary-label">Days Active</div>
        </div>
      </div>
      <!-- Today's statistics -->
      <div class="stats-section">
        <h3>Today</h3>
        <div class="stats-grid">
          <div class="stat-item">
            <div class="stat-value">{{ stats.today.notesCreated }}</div>
            <div class="stat-label">Notes Created</div>
          </div>
          <div class="stat-item">
            <div class="stat-value">{{ stats.today.flashcardsStudied }}</div>
            <div class="stat-label">Flashcards Studied</div>
          </div>
          <div class="stat-item">
            <div class="stat-value">{{ stats.today.flashcardsCreated }}</div>
            <div class="stat-label">Flashcards Created</div>
          </div>
        </div>
      </div>

      <!-- Streaks -->
      <div class="stats-section">
        <h3>Streaks</h3>
        <div class="stats-grid">
          <div class="stat-item">
            <div class="stat-value">{{ stats.streaks.noteStreak }}</div>
            <div class="stat-label">Days with Notes</div>
          </div>
          <div class="stat-item">
            <div class="stat-value">
              {{ stats.streaks.flashcardStudyStreak }}
            </div>
            <div class="stat-label">Days with Study</div>
          </div>
        </div>
      </div>

      <!-- Weekly overview -->
      <div class="stats-section">
        <h3>Last 7 Days</h3>
        <div class="weekly-chart">
          <div
            v-for="day in stats.weekly"
            :key="day.date"
            class="day-column"
            :title="`${formatDate(day.date)}: ${getDayTotal(day)} activities`"
          >
            <div class="day-label">{{ formatDate(day.date) }}</div>
            <div class="day-bars">
              <div
                class="bar notes-bar"
                :style="{
                  height: getBarHeight(day.notesCreated, maxDailyValue),
                }"
                :title="`${day.notesCreated} notes`"
              ></div>
              <div
                class="bar flashcards-studied-bar"
                :style="{
                  height: getBarHeight(day.flashcardsStudied, maxDailyValue),
                }"
                :title="`${day.flashcardsStudied} studied`"
              ></div>
              <div
                class="bar flashcards-created-bar"
                :style="{
                  height: getBarHeight(day.flashcardsCreated, maxDailyValue),
                }"
                :title="`${day.flashcardsCreated} created`"
              ></div>
            </div>
          </div>
        </div>
        <div class="chart-legend">
          <div class="legend-item">
            <div class="legend-color notes-bar"></div>
            <span>Notes created</span>
          </div>
          <div class="legend-item">
            <div class="legend-color flashcards-studied-bar"></div>
            <span>Flashcards studied</span>
          </div>
          <div class="legend-item">
            <div class="legend-color flashcards-created-bar"></div>
            <span>Flashcards created</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from "vue";
import { StatisticsService } from "../services/StatisticsService";
import type { DashboardStats, DailyStats } from "../types/Statistics";

// Props
interface Props {
  userId: string;
}

const props = defineProps<Props>();

// Reactive state
const stats = ref<DashboardStats | null>(null);
const loading = ref(false);
const error = ref<string | null>(null);
const verifying = ref(false);
const verificationResult = ref<string | null>(null);

// Computed properties
const maxDailyValue = computed(() => {
  if (!stats.value?.weekly) return 1;
  return Math.max(
    ...stats.value.weekly.map((day) =>
      Math.max(day.notesCreated, day.flashcardsStudied, day.flashcardsCreated)
    ),
    1
  );
});

// Methods
const loadStats = async () => {
  if (!props.userId) return;

  loading.value = true;
  error.value = null;

  try {
    stats.value = await StatisticsService.getDashboardStats(props.userId);
  } catch (err) {
    error.value = err instanceof Error ? err.message : "Okänt fel";
    console.error("Error loading statistics:", err);
  } finally {
    loading.value = false;
  }
};

const refreshStats = async () => {
  await loadStats();
};

const verifyStats = async () => {
  if (!props.userId) return;

  verifying.value = true;
  verificationResult.value = null;

  try {
    const verification = await StatisticsService.verifyAndRepairStats(
      props.userId
    );

    if (verification.wasRepaired) {
      verificationResult.value = `Repaired ${verification.discrepancyCount} discrepancies`;
      // Reload stats after repair
      await loadStats();
    } else {
      verificationResult.value = "Statistics verified as correct";
    }

    // Clear message after 3 seconds
    setTimeout(() => {
      verificationResult.value = null;
    }, 3000);
  } catch (err) {
    verificationResult.value = "Verification failed";
    console.error("Error verifying statistics:", err);
  } finally {
    verifying.value = false;
  }
};

const formatDate = (dateString: string): string => {
  return StatisticsService.formatDateForDisplay(dateString);
};

const getDayTotal = (day: DailyStats): number => {
  return day.notesCreated + day.flashcardsStudied + day.flashcardsCreated;
};

const getBarHeight = (value: number, max: number): string => {
  const minHeight = 2; // Minimum height in pixels
  const maxHeight = 60; // Maximum height in pixels
  const height =
    value === 0 ? minHeight : Math.max(minHeight, (value / max) * maxHeight);
  return `${height}px`;
};

// Lifecycle
onMounted(() => {
  loadStats();
});

// Expose methods for parent components
defineExpose({
  refreshStats,
});
</script>

<style scoped>
.statistics-component {
  padding: 2.5rem;
  background: rgba(15, 23, 42, 0.7);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 24px;
  margin: 3rem 0;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
}

.stats-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2.5rem;
}

.stats-header h2 {
  margin: 0;
  color: #ffffff;
  font-size: 2rem;
  font-weight: 700;
  letter-spacing: -0.02em;
}

.header-actions {
  display: flex;
  gap: 1rem;
}

.refresh-btn,
.verify-btn {
  background: linear-gradient(135deg, #3b82f6, #8b5cf6);
  color: white;
  border: none;
  border-radius: 12px;
  padding: 0.75rem 1.5rem;
  cursor: pointer;
  font-size: 0.875rem;
  font-weight: 600;
  transition: all 0.3s ease;
  box-shadow: 0 4px 16px rgba(59, 130, 246, 0.3);
}

.refresh-btn:hover,
.verify-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 32px rgba(59, 130, 246, 0.4);
}

.verify-btn {
  background: #2ecc71;
}

.refresh-btn:hover:not(:disabled) {
  background: #2980b9;
}

.verify-btn:hover:not(:disabled) {
  background: #27ae60;
}

.refresh-btn:disabled,
.verify-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.loading,
.error {
  text-align: center;
  padding: 2rem;
  color: #94a3b8;
  font-size: 1.125rem;
}

.error {
  color: #ef4444;
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.2);
  border-radius: 12px;
}

.verification-result {
  padding: 1rem;
  margin: 1rem 0;
  border-radius: 12px;
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.2);
  color: #ef4444;
  text-align: center;
  font-size: 0.875rem;
  font-weight: 500;
}

.verification-result.success {
  background: rgba(34, 197, 94, 0.1);
  border: 1px solid rgba(34, 197, 94, 0.2);
  color: #22c55e;
}

.stats-content {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.summary-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2.5rem;
}

.summary-card {
  background: rgba(15, 23, 42, 0.5);
  backdrop-filter: blur(10px);
  padding: 2rem;
  border-radius: 20px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.summary-card::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(
    135deg,
    rgba(59, 130, 246, 0.1),
    rgba(147, 51, 234, 0.1)
  );
  opacity: 0;
  transition: opacity 0.3s ease;
}

.summary-card:hover::before {
  opacity: 1;
}

.summary-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 20px 40px rgba(59, 130, 246, 0.2);
  border-color: rgba(59, 130, 246, 0.3);
}

.notes-summary {
  border-left: 4px solid #3b82f6;
}

.flashcards-summary {
  border-left: 4px solid #f59e0b;
}

.study-summary {
  border-left: 4px solid #10b981;
}

.streak-summary {
  border-left: 4px solid #ef4444;
}

.summary-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.summary-header h3 {
  margin: 0;
  color: #ffffff;
  font-size: 1rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  position: relative;
  z-index: 1;
}

.summary-value {
  font-size: 2.5rem;
  font-weight: 700;
  color: #ffffff;
  margin-bottom: 0.5rem;
  line-height: 1;
  position: relative;
  z-index: 1;
}

.summary-label {
  font-size: 0.875rem;
  color: #94a3b8;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  font-weight: 500;
  position: relative;
  z-index: 1;
}

.stats-section {
  background: rgba(15, 23, 42, 0.5);
  backdrop-filter: blur(10px);
  padding: 2rem;
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
}

.stats-section h3 {
  margin: 0 0 1.5rem 0;
  color: #ffffff;
  font-size: 1.25rem;
  font-weight: 600;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 1rem;
}

.stat-item {
  text-align: center;
  padding: 1.5rem;
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  transition: all 0.3s ease;
}

.stat-item:hover {
  background: rgba(255, 255, 255, 0.1);
  transform: translateY(-2px);
}

.stat-value {
  font-size: 1.875rem;
  font-weight: 700;
  color: #ffffff;
  margin-bottom: 0.5rem;
}

.stat-label {
  font-size: 0.75rem;
  color: #94a3b8;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  font-weight: 500;
}

.weekly-chart {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  height: 100px;
  margin-bottom: 1.5rem;
  padding: 1rem;
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
}

.day-column {
  display: flex;
  flex-direction: column;
  align-items: center;
  flex: 1;
  margin: 0 2px;
}

.day-label {
  font-size: 0.75rem;
  color: #94a3b8;
  margin-bottom: 0.5rem;
  text-align: center;
  font-weight: 500;
}

.day-bars {
  display: flex;
  align-items: flex-end;
  justify-content: center;
  gap: 1px;
  height: 60px;
}

.bar {
  width: 8px;
  border-radius: 4px 4px 0 0;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
}

.notes-bar {
  background: linear-gradient(180deg, #3b82f6, #1d4ed8);
}

.flashcards-studied-bar {
  background: linear-gradient(180deg, #10b981, #047857);
}

.flashcards-created-bar {
  background: linear-gradient(
    180deg,
    rgba(245, 158, 11, 0.8),
    rgba(217, 119, 6, 0.9)
  );
}

.chart-legend {
  display: flex;
  justify-content: center;
  gap: 1.5rem;
  font-size: 0.75rem;
  color: #94a3b8;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 500;
}

.legend-color {
  width: 12px;
  height: 12px;
  border-radius: 3px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

@media (max-width: 768px) {
  .statistics-component {
    padding: 15px;
  }

  .summary-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 15px;
  }

  .summary-card {
    padding: 20px;
  }

  .summary-value {
    font-size: 24px;
  }

  .stats-grid {
    grid-template-columns: 1fr;
  }

  .weekly-chart {
    height: 80px;
  }

  .day-bars {
    height: 40px;
  }

  .bar {
    width: 6px;
  }
}

@media (max-width: 480px) {
  .summary-grid {
    grid-template-columns: 1fr;
  }

  .stats-header {
    flex-direction: column;
    gap: 10px;
    text-align: center;
  }

  .header-actions {
    justify-content: center;
  }
}
</style>
