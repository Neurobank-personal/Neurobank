<template>
  <div class="dashboard">
    <!-- Welcome Header -->
    <div class="dashboard-header">
      <div class="welcome-section">
        <h1 class="greeting">Good afternoon</h1>
        <p class="subtitle" v-if="currentUser">
          Welcome back to your workspace
        </p>
      </div>
    </div>

    <!-- Dashboard Grid -->
    <div class="dashboard-grid">
      <!-- Quick Stats Cards -->
      <div class="stats-section">
        <div class="stats-grid">
          <!-- Notes Card -->
          <div class="stat-card notes-card" @click="$emit('navigate', 'notes')">
            <div class="card-icon">
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
              >
                <path
                  d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"
                />
                <polyline points="14,2 14,8 20,8" />
                <line x1="16" y1="13" x2="8" y2="13" />
                <line x1="16" y1="17" x2="8" y2="17" />
                <line x1="10" y1="9" x2="8" y2="9" />
              </svg>
            </div>
            <div class="card-content">
              <h3>NOTES</h3>
              <div class="card-item">
                <span class="item-title">Weekly notes</span>
                <span class="item-meta">Updated Aug 21, 2023</span>
              </div>
            </div>
            <button class="card-action">
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
              >
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
            </button>
          </div>

          <!-- Flashcards Card -->
          <div
            class="stat-card flashcards-card"
            @click="$emit('navigate', 'flashcards')"
          >
            <div class="card-icon">
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
              >
                <rect x="3" y="4" width="18" height="12" rx="2" />
                <rect x="5" y="6" width="14" height="8" rx="1" />
                <path d="M12 10h4" />
              </svg>
            </div>
            <div class="card-content">
              <h3>FLASHCARDS</h3>
              <div class="card-item">
                <span class="item-title">August 2023</span>
                <span class="item-meta">{{ flashcardsCount }} new cards</span>
              </div>
            </div>
            <button class="card-action">
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
              >
                <polyline points="9,18 15,12 9,6" />
              </svg>
            </button>
          </div>
        </div>

        <!-- Tasks Section -->
        <div class="stats-overview">
          <div class="stat-card tasks-card">
            <div class="card-content">
              <h3>TO DO</h3>
              <div class="tasks-list">
                <div
                  class="task-item"
                  v-for="task in pendingTasks.slice(0, 3)"
                  :key="task.id"
                >
                  <div class="task-checkbox">
                    <input type="checkbox" @change="completeTask(task)" />
                  </div>
                  <span class="task-title">{{ task.title }}</span>
                </div>
                <div v-if="pendingTasks.length === 0" class="task-item">
                  <div class="task-checkbox">
                    <input type="checkbox" checked />
                  </div>
                  <span class="task-title completed"
                    >All tasks completed! 🎉</span
                  >
                </div>
              </div>
            </div>
            <button class="card-action" @click="$emit('navigate', 'tasks')">
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
              >
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Statistics Section -->
    <StatisticsComponent v-if="currentUser?.id" :userId="currentUser.id" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from "vue";
import { useAuth } from "../stores/auth";
import { NoteService } from "../services/NoteService";
import FlashcardService from "../services/FlashcardService";
import { TaskService } from "../services/TaskService";
import StatisticsComponent from "./StatisticsComponent.vue";
import type { Task } from "../types/Task";

const { currentUser } = useAuth();
const noteService = new NoteService();
const taskService = new TaskService();

const notesCount = ref(0);
const flashcardsCount = ref(0);
const allTasks = ref<Task[]>([]);
const tasksCount = ref(0);

defineEmits<{
  navigate: [section: string];
}>();

const loadNotesCount = async () => {
  if (currentUser?.value?.id) {
    try {
      const notes = await noteService.getUserNotes(currentUser.value.id);
      notesCount.value = notes.length;
    } catch (error) {
      console.error("Could not fetch notes:", error);
      notesCount.value = 0;
    }
  }
};

const loadFlashcardsCount = async () => {
  if (currentUser?.value?.id) {
    try {
      const flashcards = await FlashcardService.getUserFlashcards(
        currentUser.value.id
      );
      flashcardsCount.value = flashcards.length;
    } catch (error) {
      console.error("Could not fetch flashcards:", error);
      flashcardsCount.value = 0;
    }
  }
};

const loadTasksCount = async () => {
  if (currentUser?.value?.id) {
    try {
      const tasks = await taskService.getUserTasks(currentUser.value.id);
      allTasks.value = tasks;
      tasksCount.value = tasks.length;
    } catch (error) {
      console.error("Could not fetch tasks:", error);
      tasksCount.value = 0;
      allTasks.value = [];
    }
  }
};

// Computed property for pending tasks
const pendingTasks = computed(() =>
  allTasks.value.filter((task) => task.status === "pending")
);

const completeTask = async (task: Task) => {
  try {
    await taskService.toggleTaskStatus(task.id, "completed");
    await loadTasksCount(); // Reload tasks to update the list
  } catch (error) {
    console.error("Error completing task:", error);
  }
};

onMounted(() => {
  loadNotesCount();
  loadFlashcardsCount();
  loadTasksCount();
});
</script>

<style scoped>
.dashboard {
  padding: 0;
  background: transparent;
  min-height: 100vh;
}

.dashboard-header {
  margin-bottom: 3rem;
}

.welcome-section {
  text-align: left;
}

.greeting {
  color: #ffffff;
  font-size: 2.5rem;
  font-weight: 700;
  margin: 0 0 0.5rem 0;
  letter-spacing: -0.02em;
}

.subtitle {
  color: #94a3b8;
  margin: 0;
  font-size: 1.125rem;
  font-weight: 400;
}

.dashboard-grid {
  display: grid;
  gap: 2rem;
}

.stats-section {
  display: grid;
  gap: 2rem;
}

.stats-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
}

.stats-overview {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
}

.stat-card {
  background: rgba(15, 23, 42, 0.7);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 24px;
  padding: 2rem;
  position: relative;
  overflow: hidden;
  transition: all 0.3s ease;
  cursor: pointer;
}

.stat-card::before {
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

.stat-card:hover::before {
  opacity: 1;
}

.stat-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 20px 40px rgba(59, 130, 246, 0.2);
  border-color: rgba(59, 130, 246, 0.3);
}

.card-icon {
  width: 48px;
  height: 48px;
  background: linear-gradient(135deg, #3b82f6, #8b5cf6);
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 1.5rem;
  color: white;
  position: relative;
  z-index: 1;
}

.card-content {
  position: relative;
  z-index: 1;
  flex: 1;
}

.card-content h3 {
  color: #94a3b8;
  font-size: 0.875rem;
  font-weight: 600;
  letter-spacing: 0.1em;
  margin: 0 0 1rem 0;
}

.card-item {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.item-title {
  color: #ffffff;
  font-size: 1.125rem;
  font-weight: 600;
}

.item-meta {
  color: #64748b;
  font-size: 0.875rem;
}

.card-action {
  position: absolute;
  top: 2rem;
  right: 2rem;
  width: 32px;
  height: 32px;
  background: rgba(255, 255, 255, 0.1);
  border: none;
  border-radius: 8px;
  color: #94a3b8;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  z-index: 2;
}

.card-action:hover {
  background: rgba(255, 255, 255, 0.2);
  color: #ffffff;
}

.tasks-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-top: 1rem;
}

.task-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 0;
}

.task-checkbox {
  width: 20px;
  height: 20px;
}

.task-checkbox input[type="checkbox"] {
  width: 20px;
  height: 20px;
  border: 2px solid #374151;
  border-radius: 6px;
  background: transparent;
  cursor: pointer;
  appearance: none;
  position: relative;
  transition: all 0.3s ease;
}

.task-checkbox input[type="checkbox"]:checked {
  background: linear-gradient(135deg, #3b82f6, #8b5cf6);
  border-color: #3b82f6;
}

.task-checkbox input[type="checkbox"]:checked::after {
  content: "✓";
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: white;
  font-size: 12px;
  font-weight: bold;
}

.task-title {
  color: #e2e8f0;
  font-size: 0.875rem;
  font-weight: 500;
  flex: 1;
}

.task-title.completed {
  color: #64748b;
  text-decoration: line-through;
}

/* Responsive Design */
@media (max-width: 1024px) {
  .stats-grid,
  .stats-overview {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .dashboard {
    padding: 0;
  }

  .greeting {
    font-size: 2rem;
  }

  .stats-grid,
  .stats-overview {
    grid-template-columns: 1fr;
    gap: 1rem;
  }

  .stat-card {
    padding: 1.5rem;
  }
}
</style>
