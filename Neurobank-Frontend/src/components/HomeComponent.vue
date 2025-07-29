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
                <span class="item-meta">{{ notesCount }} notes</span>
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
                <span class="item-meta">{{ flashcardsCount }} cards</span>
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
                  <span class="task-title">All tasks completed!</span>
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
  padding: 2rem;
  background: linear-gradient(135deg, var(--cream), var(--beige));
  border-radius: 32px;
  border: 2px solid var(--border);
  box-shadow: 0 8px 32px rgba(162, 175, 155, 0.1);
  position: relative;
  overflow: hidden;
}

.dashboard-header::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, var(--sage), var(--accent));
}

.welcome-section {
  text-align: left;
}

.greeting {
  color: var(--text-dark);
  font-size: 3rem;
  font-weight: 700;
  margin: 0 0 0.5rem 0;
  letter-spacing: -0.02em;
  font-family: "Playfair Display", serif;
  background: linear-gradient(135deg, var(--sage), var(--accent));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.subtitle {
  color: var(--text-medium);
  margin: 0;
  font-size: 1.25rem;
  font-weight: 400;
  font-family: "Inter", sans-serif;
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
  gap: 2rem;
}

.stats-overview {
  display: grid;
  grid-template-columns: 1fr;
  gap: 2rem;
}

.stat-card {
  background: var(--cream);
  border: 2px solid var(--border);
  border-radius: 28px;
  padding: 2.5rem;
  position: relative;
  overflow: hidden;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;
  box-shadow: 0 8px 32px rgba(162, 175, 155, 0.1);
}

.stat-card::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, var(--beige), var(--light-gray));
  opacity: 0;
  transition: all 0.4s ease;
}

.stat-card:hover::before {
  opacity: 1;
}

.stat-card:hover {
  transform: translateY(-12px) scale(1.02);
  box-shadow: 0 24px 48px rgba(162, 175, 155, 0.2);
  border-color: var(--sage);
}

.stat-card::after {
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

.stat-card:hover::after {
  transform: scaleX(1);
}

.card-icon {
  width: 56px;
  height: 56px;
  background: linear-gradient(135deg, var(--sage), var(--accent));
  border-radius: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 2rem;
  color: white;
  position: relative;
  z-index: 1;
  box-shadow: 0 8px 24px rgba(162, 175, 155, 0.3);
  transition: all 0.3s ease;
}

.stat-card:hover .card-icon {
  transform: scale(1.1) rotate(5deg);
  box-shadow: 0 12px 32px rgba(162, 175, 155, 0.4);
}

.card-content {
  position: relative;
  z-index: 1;
  flex: 1;
}

.card-content h3 {
  color: var(--text-light);
  font-size: 0.875rem;
  font-weight: 700;
  letter-spacing: 0.15em;
  margin: 0 0 1.5rem 0;
  font-family: "Inter", sans-serif;
  text-transform: uppercase;
}

.card-item {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.item-title {
  color: var(--text-dark);
  font-size: 1.25rem;
  font-weight: 600;
  font-family: "Inter", sans-serif;
}

.item-meta {
  color: var(--text-medium);
  font-size: 0.95rem;
  font-family: "Inter", sans-serif;
}

.card-action {
  position: absolute;
  top: 2.5rem;
  right: 2.5rem;
  width: 40px;
  height: 40px;
  background: var(--beige);
  border: 2px solid var(--border);
  border-radius: 12px;
  color: var(--sage);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  z-index: 2;
}

.card-action:hover {
  background: var(--sage);
  color: white;
  border-color: var(--sage);
  transform: scale(1.1);
  box-shadow: 0 4px 16px rgba(162, 175, 155, 0.3);
}

.tasks-card {
  grid-column: 1 / -1;
}

.tasks-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-top: 1.5rem;
}

.task-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: var(--beige);
  border-radius: 16px;
  border: 2px solid transparent;
  transition: all 0.3s ease;
}

.task-item:hover {
  border-color: var(--border);
  background: var(--light-gray);
}

.task-checkbox {
  width: 24px;
  height: 24px;
}

.task-checkbox input[type="checkbox"] {
  width: 24px;
  height: 24px;
  border: 2px solid var(--border);
  border-radius: 8px;
  background: var(--cream);
  cursor: pointer;
  appearance: none;
  position: relative;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.task-checkbox input[type="checkbox"]:checked {
  background: linear-gradient(135deg, var(--sage), var(--accent));
  border-color: var(--sage);
  transform: scale(1.1);
}

.task-checkbox input[type="checkbox"]:checked::after {
  content: "✓";
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: white;
  font-size: 14px;
  font-weight: bold;
}

.task-title {
  color: var(--text-dark);
  font-size: 1rem;
  font-weight: 500;
  flex: 1;
  font-family: "Inter", sans-serif;
}

.task-title.completed {
  color: var(--text-light);
  text-decoration: line-through;
}

/* Animation for cards */
.stat-card {
  animation: fadeInUp 0.6s ease forwards;
}

.stat-card:nth-child(1) {
  animation-delay: 0.1s;
}
.stat-card:nth-child(2) {
  animation-delay: 0.2s;
}
.stat-card:nth-child(3) {
  animation-delay: 0.3s;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
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

  .dashboard-header {
    padding: 1.5rem;
    margin-bottom: 2rem;
  }

  .greeting {
    font-size: 2.5rem;
  }

  .stats-grid,
  .stats-overview {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }

  .stat-card {
    padding: 2rem;
  }

  .card-icon {
    width: 48px;
    height: 48px;
  }
}
</style>
