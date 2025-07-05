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
  padding: 20px;
  background: #f8f9fa;
  border-radius: 12px;
  margin: 20px 0;
}

.stats-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.stats-header h2 {
  margin: 0;
  color: #2c3e50;
}

.header-actions {
  display: flex;
  gap: 10px;
}

.refresh-btn,
.verify-btn {
  background: #3498db;
  color: white;
  border: none;
  border-radius: 6px;
  padding: 8px 12px;
  cursor: pointer;
  font-size: 14px;
  transition: background-color 0.2s;
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
  padding: 20px;
  color: #666;
}

.error {
  color: #e74c3c;
  background: #fadbd8;
  border-radius: 6px;
}

.verification-result {
  padding: 10px;
  margin: 10px 0;
  border-radius: 6px;
  background: #fadbd8;
  color: #e74c3c;
  text-align: center;
  font-size: 14px;
}

.verification-result.success {
  background: #d5f4e6;
  color: #2ecc71;
}

.stats-content {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.summary-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

.summary-card {
  background: white;
  padding: 24px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border-left: 4px solid;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.summary-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.notes-summary {
  border-left-color: #3498db;
}

.flashcards-summary {
  border-left-color: #f39c12;
}

.study-summary {
  border-left-color: #2ecc71;
}

.streak-summary {
  border-left-color: #e74c3c;
}

.summary-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.summary-header h3 {
  margin: 0;
  color: #2c3e50;
  font-size: 16px;
  font-weight: 600;
}

.summary-value {
  font-size: 32px;
  font-weight: bold;
  color: #2c3e50;
  margin-bottom: 4px;
  line-height: 1;
}

.summary-label {
  font-size: 14px;
  color: #718096;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.stats-section {
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.stats-section h3 {
  margin: 0 0 15px 0;
  color: #2c3e50;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 15px;
}

.stat-item {
  text-align: center;
  padding: 15px;
  background: #f8f9fa;
  border-radius: 6px;
}

.stat-value {
  font-size: 24px;
  font-weight: bold;
  color: #2c3e50;
  margin-bottom: 5px;
}

.stat-label {
  font-size: 12px;
  color: #666;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.weekly-chart {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  height: 100px;
  margin-bottom: 15px;
  padding: 10px;
  background: #f8f9fa;
  border-radius: 6px;
}

.day-column {
  display: flex;
  flex-direction: column;
  align-items: center;
  flex: 1;
  margin: 0 2px;
}

.day-label {
  font-size: 10px;
  color: #666;
  margin-bottom: 5px;
  text-align: center;
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
  border-radius: 2px 2px 0 0;
  transition: height 0.3s ease;
}

.notes-bar {
  background: #3498db;
}

.flashcards-studied-bar {
  background: #2ecc71;
}

.flashcards-created-bar {
  background: #f39c12;
}

.chart-legend {
  display: flex;
  justify-content: center;
  gap: 20px;
  font-size: 12px;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 5px;
}

.legend-color {
  width: 12px;
  height: 12px;
  border-radius: 2px;
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
