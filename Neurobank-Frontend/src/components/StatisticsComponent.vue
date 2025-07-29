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
  padding: 3rem;
  background: var(--cream);
  border: 2px solid var(--border);
  border-radius: 32px;
  margin: 3rem 0;
  box-shadow: 0 20px 60px rgba(162, 175, 155, 0.15);
  position: relative;
  overflow: hidden;
}

.statistics-component::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, var(--sage), var(--accent));
}

.stats-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 3rem;
}

.stats-header h2 {
  margin: 0;
  color: var(--text-dark);
  font-size: 2.5rem;
  font-weight: 700;
  letter-spacing: -0.02em;
  font-family: "Playfair Display", serif;
  background: linear-gradient(135deg, var(--sage), var(--accent));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.header-actions {
  display: flex;
  gap: 1rem;
}

.refresh-btn,
.verify-btn {
  background: linear-gradient(135deg, var(--sage), var(--accent));
  color: white;
  border: none;
  border-radius: 16px;
  padding: 1rem 1.5rem;
  cursor: pointer;
  font-size: 0.9rem;
  font-weight: 600;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 4px 16px rgba(162, 175, 155, 0.3);
  font-family: "Inter", sans-serif;
  position: relative;
  overflow: hidden;
}

.refresh-btn::before,
.verify-btn::before {
  content: "";
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(
    90deg,
    transparent,
    rgba(255, 255, 255, 0.2),
    transparent
  );
  transition: left 0.5s ease;
}

.refresh-btn:hover,
.verify-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 32px rgba(162, 175, 155, 0.4);
}

.refresh-btn:hover:not(:disabled)::before,
.verify-btn:hover:not(:disabled)::before {
  left: 100%;
}

.verify-btn {
  background: linear-gradient(135deg, var(--accent), #5ba06f);
}

.refresh-btn:disabled,
.verify-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.loading,
.error {
  text-align: center;
  padding: 2rem;
  color: var(--text-medium);
  font-size: 1.125rem;
  font-family: "Inter", sans-serif;
}

.error {
  color: #dc2626;
  background: rgba(239, 68, 68, 0.1);
  border: 2px solid rgba(239, 68, 68, 0.2);
  border-radius: 16px;
}

.verification-result {
  padding: 1.5rem;
  margin: 1rem 0;
  border-radius: 16px;
  background: rgba(239, 68, 68, 0.1);
  border: 2px solid rgba(239, 68, 68, 0.2);
  color: #dc2626;
  text-align: center;
  font-size: 0.95rem;
  font-weight: 500;
  font-family: "Inter", sans-serif;
}

.verification-result.success {
  background: rgba(34, 197, 94, 0.1);
  border: 2px solid rgba(34, 197, 94, 0.2);
  color: #16a34a;
}

.stats-content {
  display: flex;
  flex-direction: column;
  gap: 2.5rem;
}

.summary-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 2rem;
  margin-bottom: 3rem;
}

.summary-card {
  background: var(--beige);
  padding: 2.5rem;
  border-radius: 24px;
  border: 2px solid var(--border);
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
  box-shadow: 0 8px 32px rgba(162, 175, 155, 0.1);
}

.summary-card::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, var(--light-gray), var(--cream));
  opacity: 0;
  transition: all 0.4s ease;
}

.summary-card:hover::before {
  opacity: 1;
}

.summary-card:hover {
  transform: translateY(-12px) scale(1.02);
  box-shadow: 0 24px 48px rgba(162, 175, 155, 0.2);
  border-color: var(--sage);
}

.summary-card::after {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, var(--sage), var(--accent));
  transform: scaleX(0);
  transition: transform 0.3s ease;
}

.summary-card:hover::after {
  transform: scaleX(1);
}

.notes-summary::after {
  background: linear-gradient(90deg, var(--sage), var(--accent));
}

.flashcards-summary::after {
  background: linear-gradient(90deg, #f59e0b, #fbbf24);
}

.study-summary::after {
  background: linear-gradient(90deg, #10b981, #34d399);
}

.streak-summary::after {
  background: linear-gradient(90deg, #ef4444, #f87171);
}

.summary-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.summary-header h3 {
  margin: 0;
  color: var(--text-dark);
  font-size: 1rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  position: relative;
  z-index: 1;
  font-family: "Inter", sans-serif;
}

.summary-value {
  font-size: 3rem;
  font-weight: 800;
  color: var(--text-dark);
  margin-bottom: 0.5rem;
  line-height: 1;
  position: relative;
  z-index: 1;
  font-family: "Playfair Display", serif;
}

.summary-label {
  font-size: 0.9rem;
  color: var(--text-medium);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  font-weight: 600;
  position: relative;
  z-index: 1;
  font-family: "Inter", sans-serif;
}

.stats-section {
  background: var(--beige);
  padding: 2.5rem;
  border-radius: 24px;
  border: 2px solid var(--border);
  box-shadow: 0 8px 32px rgba(162, 175, 155, 0.1);
  position: relative;
  overflow: hidden;
}

.stats-section::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: linear-gradient(90deg, var(--sage), var(--accent));
}

.stats-section h3 {
  margin: 0 0 2rem 0;
  color: var(--text-dark);
  font-size: 1.5rem;
  font-weight: 600;
  font-family: "Playfair Display", serif;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 1.5rem;
}

.stat-item {
  text-align: center;
  padding: 2rem;
  background: var(--cream);
  border: 2px solid var(--border);
  border-radius: 20px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 4px 16px rgba(162, 175, 155, 0.1);
}

.stat-item:hover {
  background: var(--light-gray);
  transform: translateY(-4px);
  border-color: var(--sage);
  box-shadow: 0 8px 24px rgba(162, 175, 155, 0.2);
}

.stat-value {
  font-size: 2.25rem;
  font-weight: 700;
  color: var(--text-dark);
  margin-bottom: 0.5rem;
  font-family: "Playfair Display", serif;
}

.stat-label {
  font-size: 0.8rem;
  color: var(--text-medium);
  text-transform: uppercase;
  letter-spacing: 0.1em;
  font-weight: 600;
  font-family: "Inter", sans-serif;
}

.weekly-chart {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  height: 120px;
  margin-bottom: 2rem;
  padding: 1.5rem;
  background: var(--cream);
  border: 2px solid var(--border);
  border-radius: 20px;
  box-shadow: 0 4px 16px rgba(162, 175, 155, 0.1);
}

.day-column {
  display: flex;
  flex-direction: column;
  align-items: center;
  flex: 1;
  margin: 0 3px;
}

.day-label {
  font-size: 0.8rem;
  color: var(--text-medium);
  margin-bottom: 0.75rem;
  text-align: center;
  font-weight: 600;
  font-family: "Inter", sans-serif;
}

.day-bars {
  display: flex;
  align-items: flex-end;
  justify-content: center;
  gap: 2px;
  height: 80px;
}

.bar {
  width: 10px;
  border-radius: 6px 6px 0 0;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(162, 175, 155, 0.2);
}

.bar:hover {
  transform: scale(1.1);
}

.notes-bar {
  background: linear-gradient(180deg, var(--sage), var(--sage));
}

.flashcards-studied-bar {
  background: linear-gradient(180deg, var(--accent), #3d7c5a);
}

.flashcards-created-bar {
  background: linear-gradient(180deg, #f59e0b, #d97706);
}

.chart-legend {
  display: flex;
  justify-content: center;
  gap: 2rem;
  font-size: 0.8rem;
  color: var(--text-medium);
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-weight: 600;
  font-family: "Inter", sans-serif;
}

.legend-color {
  width: 14px;
  height: 14px;
  border-radius: 4px;
  box-shadow: 0 2px 4px rgba(162, 175, 155, 0.2);
}

/* Animation for cards */
.summary-card {
  animation: fadeInUp 0.6s ease forwards;
}

.summary-card:nth-child(1) {
  animation-delay: 0.1s;
}
.summary-card:nth-child(2) {
  animation-delay: 0.2s;
}
.summary-card:nth-child(3) {
  animation-delay: 0.3s;
}
.summary-card:nth-child(4) {
  animation-delay: 0.4s;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@media (max-width: 768px) {
  .statistics-component {
    padding: 2rem;
  }

  .stats-header {
    flex-direction: column;
    gap: 1rem;
    text-align: center;
  }

  .stats-header h2 {
    font-size: 2rem;
  }

  .summary-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 1.5rem;
  }

  .summary-card {
    padding: 2rem;
  }

  .summary-value {
    font-size: 2.5rem;
  }

  .stats-grid {
    grid-template-columns: 1fr;
  }

  .weekly-chart {
    height: 100px;
    padding: 1rem;
  }

  .day-bars {
    height: 60px;
  }

  .bar {
    width: 8px;
  }

  .header-actions {
    justify-content: center;
  }
}

@media (max-width: 480px) {
  .summary-grid {
    grid-template-columns: 1fr;
  }

  .statistics-component {
    padding: 1.5rem;
  }

  .stats-header h2 {
    font-size: 1.75rem;
  }

  .chart-legend {
    flex-direction: column;
    gap: 1rem;
  }
}
</style>
