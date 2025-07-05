<template>
  <div class="dashboard">
    <div class="dashboard-header">
      <h2>Home</h2>
      <p class="subtitle" v-if="currentUser">Overview of your account</p>
    </div>

    <!-- Content Grid -->
    <div class="content-grid">
      <!-- Left Column -->
      <div class="left-column">
        <!-- Notes Card -->
        <div
          class="content-card notes-card"
          @click="$emit('navigate', 'notes')"
        >
          <div class="card-header">
            <h3>Notes</h3>
          </div>
          <div class="card-number">{{ notesCount }}</div>
        </div>

        <!-- Flashcards Card -->
        <div
          class="content-card flashcards-card"
          @click="$emit('navigate', 'flashcards')"
        >
          <div class="card-header">
            <h3>Flashcards</h3>
          </div>
          <div class="card-number">{{ flashcardsCount }}</div>
        </div>
      </div>

      <!-- Right Column -->
      <div class="right-column">
        <!-- Tasks Card -->
        <div class="content-card tasks-card">
          <div class="card-header">
            <h3>Pending Tasks</h3>
            <button class="add-task-btn" @click="$emit('navigate', 'tasks')">
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
          <div class="tasks-container-home">
            <div v-if="pendingTasks.length === 0" class="no-tasks">
              <p>No pending tasks! 🎉</p>
            </div>
            <div v-else class="tasks-list">
              <div
                v-for="task in pendingTasks.slice(0, 15)"
                :key="task.id"
                class="task-item"
                :class="{ overdue: isTaskOverdue(task) }"
              >
                <div class="task-checkbox">
                  <input type="checkbox" @change="completeTask(task)" />
                </div>
                <div class="task-content" @click="editTask(task)">
                  <div class="task-title">{{ task.title }}</div>
                  <div class="task-meta">
                    <span class="task-priority" :class="task.priority">{{
                      task.priority
                    }}</span>
                    <span v-if="task.dueDate" class="task-due-date">
                      Due: {{ formatTaskDate(task.dueDate) }}
                    </span>
                  </div>
                </div>
              </div>
              <div v-if="pendingTasks.length > 15" class="more-tasks">
                <button
                  @click="$emit('navigate', 'tasks')"
                  class="view-all-btn"
                >
                  View all {{ pendingTasks.length }} pending tasks
                </button>
              </div>
            </div>
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

const emit = defineEmits<{
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

// Task-related functions
const isTaskOverdue = (task: Task) => {
  if (!task.dueDate || task.status === "completed") return false;
  return new Date(task.dueDate) < new Date();
};

const formatTaskDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString("sv-SE");
};

const completeTask = async (task: Task) => {
  try {
    await taskService.toggleTaskStatus(task.id, "completed");
    await loadTasksCount(); // Reload tasks to update the list
  } catch (error) {
    console.error("Error completing task:", error);
  }
};

const editTask = (task: Task) => {
  // Store the task to edit in localStorage temporarily
  localStorage.setItem("editTask", JSON.stringify(task));
  // Navigate to tasks page
  emit("navigate", "tasks");
};

onMounted(() => {
  loadNotesCount();
  loadFlashcardsCount();
  loadTasksCount();
});
</script>

<style scoped>
.dashboard {
  padding: 2rem;
  background-color: #f8f9fa;
  min-height: 100vh;
}

.dashboard-header {
  margin-bottom: 2rem;
}

.dashboard-header h2 {
  color: #2d3748;
  font-size: 2rem;
  font-weight: 600;
  margin: 0;
}

.subtitle {
  color: #718096;
  margin: 0.5rem 0 0 0;
  font-size: 1rem;
}

.content-grid {
  display: flex;
  gap: 2rem;
  align-items: flex-start;
}

.left-column {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.right-column {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.content-card {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.content-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.card-header h3 {
  color: #2d3748;
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
}

.card-number {
  font-size: 3rem;
  font-weight: 700;
  color: #667eea;
  text-align: center;
}

.notes-card,
.flashcards-card {
  cursor: pointer;
}

.notes-card .card-number {
  color: #48bb78;
}

.flashcards-card .card-number {
  color: #ed8936;
}

.tasks-card .card-number {
  color: #667eea;
}

.activity-chart {
  height: 140px;
  display: flex;
  align-items: end;
  justify-content: center;
}

.chart-bars {
  display: flex;
  align-items: end;
  gap: 8px;
  height: 100%;
}

.bar-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  height: 100%;
  justify-content: end;
}

.activity-count {
  font-size: 0.75rem;
  font-weight: 600;
  color: #4a5568;
  margin-bottom: 4px;
  min-height: 16px;
  display: flex;
  align-items: center;
}

.bar {
  width: 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 3px 3px 0 0;
  display: flex;
  align-items: end;
  justify-content: center;
  padding-bottom: 4px;
  min-height: 20px;
}

.bar.flashcard-bar {
  background: linear-gradient(135deg, #ed8936 0%, #dd6b20 100%);
}

.bar span {
  color: white;
  font-size: 0.7rem;
  font-weight: 500;
}

/* Task-related styles */
.tasks-card {
  min-height: 220px; /* Match the combined height of notes + flashcards + gap */
  display: flex;
  flex-direction: column;
  height: fit-content;
}

.tasks-container-home {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 220px;
}

.add-task-btn {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: none;
  background: #667eea;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.add-task-btn:hover {
  background: #5a67d8;
}

.no-tasks {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  color: #718096;
  min-height: 220px;
}

.no-tasks p {
  margin: 0;
  font-size: 1rem;
}

.tasks-list {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  max-height: 350px;
  overflow-y: auto;
  padding-right: 4px;
}

/* Custom scrollbar for tasks list */
.tasks-list::-webkit-scrollbar {
  width: 4px;
}

.tasks-list::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 2px;
}

.tasks-list::-webkit-scrollbar-thumb {
  background: #cbd5e0;
  border-radius: 2px;
}

.tasks-list::-webkit-scrollbar-thumb:hover {
  background: #a0aec0;
}

.task-item {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  padding: 0.75rem;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  transition: all 0.2s ease;
  background: white;
}

.task-item:hover {
  border-color: #cbd5e0;
  background: #f9fafb;
  transform: translateX(2px);
}

.task-item.overdue {
  border-color: #fed7d7;
  background: #fef5e7;
}

.task-checkbox input {
  width: 16px;
  height: 16px;
  cursor: pointer;
  margin-top: 2px;
}

.task-content {
  flex: 1;
  cursor: pointer;
}

.task-title {
  font-weight: 600;
  color: #2d3748;
  margin-bottom: 0.25rem;
  font-size: 0.9rem;
  line-height: 1.3;
  transition: color 0.2s ease;
}

.task-meta {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.75rem;
  color: #a0aec0;
  flex-wrap: wrap;
}

.task-priority {
  padding: 0.125rem 0.375rem;
  border-radius: 3px;
  font-weight: 500;
  text-transform: uppercase;
  font-size: 0.625rem;
}

.task-priority.high {
  background: #fed7d7;
  color: #c53030;
}

.task-priority.medium {
  background: #feebc8;
  color: #dd6b20;
}

.task-priority.low {
  background: #c6f6d5;
  color: #38a169;
}

.task-due-date {
  font-weight: 500;
}

.task-item.overdue .task-due-date {
  color: #e53e3e;
  font-weight: 600;
}

.more-tasks {
  margin-top: 0.5rem;
  text-align: center;
  padding-top: 0.5rem;
  border-top: 1px solid #e2e8f0;
}

.view-all-btn {
  background: none;
  border: none;
  color: #667eea;
  font-size: 0.85rem;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 4px;
  transition: all 0.2s ease;
  font-weight: 500;
}

.view-all-btn:hover {
  background: #f7fafc;
  color: #5a67d8;
}

@media (max-width: 768px) {
  .content-grid {
    grid-template-columns: 1fr;
  }

  .dashboard {
    padding: 1rem;
  }
}
</style>
