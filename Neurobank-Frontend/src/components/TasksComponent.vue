<template>
  <div class="tasks">
    <div class="tasks-header">
      <h2>Tasks</h2>
      <button class="add-btn" @click="showAddTaskModal = true">
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
        >
          <line x1="12" y1="5" x2="12" y2="19" />
          <line x1="5" y1="12" x2="19" y2="12" />
        </svg>
        Add Task
      </button>
    </div>

    <!-- Filter Tabs -->
    <div class="filter-tabs">
      <button
        v-for="filter in filters"
        :key="filter.value"
        class="filter-tab"
        :class="{ active: currentFilter === filter.value }"
        @click="currentFilter = filter.value"
      >
        {{ filter.label }}
        <span class="count">{{ getFilteredTasksCount(filter.value) }}</span>
      </button>
    </div>

    <!-- Tasks List -->
    <div class="tasks-container">
      <div v-if="filteredTasks.length === 0" class="empty-state">
        <svg
          width="64"
          height="64"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="1"
        >
          <path d="M9 12l2 2 4-4" />
          <path
            d="M21 12c0 4.97-4.03 9-9 9s-9-4.03-9-9 4.03-9 9-9 9 4.03 9 9z"
          />
        </svg>
        <h3>No tasks found</h3>
        <p>{{ getEmptyStateMessage() }}</p>
      </div>

      <div v-else class="tasks-list">
        <div
          v-for="task in filteredTasks"
          :key="task.id"
          class="task-item"
          :class="{
            completed: task.status === 'completed',
            overdue: isOverdue(task),
          }"
        >
          <div class="task-checkbox">
            <input
              type="checkbox"
              :checked="task.status === 'completed'"
              @change="toggleTaskStatus(task)"
            />
          </div>

          <div class="task-content" @click="editTask(task)">
            <div class="task-title">{{ task.title }}</div>
            <div v-if="task.description" class="task-description">
              {{ task.description }}
            </div>
            <div class="task-meta">
              <span class="task-priority" :class="task.priority">{{
                task.priority
              }}</span>
              <span v-if="task.dueDate" class="task-due-date">
                Due: {{ formatDate(task.dueDate) }}
              </span>
              <span class="task-created"
                >Created: {{ formatDate(task.createdAt) }}</span
              >
            </div>
          </div>

          <div class="task-actions">
            <button
              class="action-btn edit"
              @click="editTask(task)"
              title="Edit task"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
              >
                <path d="M12 20h9" />
                <path
                  d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"
                />
              </svg>
            </button>
            <button
              class="action-btn delete"
              @click="deleteTask(task)"
              title="Delete task"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
              >
                <polyline points="3,6 5,6 21,6" />
                <path
                  d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"
                />
                <line x1="10" y1="11" x2="10" y2="17" />
                <line x1="14" y1="11" x2="14" y2="17" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Add/Edit Task Modal -->
    <div
      v-if="showAddTaskModal || showEditTaskModal"
      class="modal-overlay"
      @click="closeModals"
    >
      <div class="modal" @click.stop>
        <div class="modal-header">
          <h3>{{ isEditing ? "Edit Task" : "Add New Task" }}</h3>
          <button class="close-btn" @click="closeModals">
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <form @submit.prevent="saveTask" class="task-form">
          <div class="form-group">
            <label for="title">Title*</label>
            <input
              id="title"
              v-model="taskForm.title"
              type="text"
              required
              placeholder="Enter task title"
            />
          </div>

          <div class="form-group">
            <label for="description">Description</label>
            <textarea
              id="description"
              v-model="taskForm.description"
              placeholder="Enter task description (optional)"
              rows="3"
            ></textarea>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label for="priority">Priority</label>
              <div class="custom-select">
                <select id="priority" v-model="taskForm.priority">
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
                <div class="select-arrow">
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                  >
                    <polyline points="6,9 12,15 18,9" />
                  </svg>
                </div>
              </div>
            </div>

            <div class="form-group">
              <label for="dueDate">Due Date</label>
              <input id="dueDate" v-model="taskForm.dueDate" type="date" />
            </div>
          </div>

          <div class="form-actions">
            <button type="button" class="btn-secondary" @click="closeModals">
              Cancel
            </button>
            <button
              type="submit"
              class="btn-primary"
              :disabled="!taskForm.title.trim()"
            >
              {{ isEditing ? "Update Task" : "Add Task" }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { useAuth } from "../stores/auth";
import { TaskService } from "../services/TaskService";
import type { Task, CreateTaskRequest, UpdateTaskRequest } from "../types/Task";

const { currentUser } = useAuth();
const taskService = new TaskService();

const tasks = ref<Task[]>([]);
const showAddTaskModal = ref(false);
const showEditTaskModal = ref(false);
const currentFilter = ref<"all" | "pending" | "completed">("all");
const editingTask = ref<Task | null>(null);

const taskForm = ref({
  title: "",
  description: "",
  priority: "medium" as "low" | "medium" | "high",
  dueDate: "",
});

const filters = [
  { label: "All", value: "all" as const },
  { label: "Pending", value: "pending" as const },
  { label: "Completed", value: "completed" as const },
];

const isEditing = computed(() => editingTask.value !== null);

const filteredTasks = computed(() => {
  if (currentFilter.value === "all") return tasks.value;
  return tasks.value.filter((task) => task.status === currentFilter.value);
});

const getFilteredTasksCount = (filter: "all" | "pending" | "completed") => {
  if (filter === "all") return tasks.value.length;
  return tasks.value.filter((task) => task.status === filter).length;
};

const getEmptyStateMessage = () => {
  switch (currentFilter.value) {
    case "pending":
      return "No pending tasks. Great job!";
    case "completed":
      return "No completed tasks yet.";
    default:
      return "Create your first task to get started.";
  }
};

const isOverdue = (task: Task) => {
  if (!task.dueDate || task.status === "completed") return false;
  return new Date(task.dueDate) < new Date();
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString("sv-SE");
};

const loadTasks = async () => {
  if (currentUser?.value?.id) {
    try {
      console.log("Loading tasks for user:", currentUser.value.id);
      tasks.value = await taskService.getUserTasks(currentUser.value.id);
      console.log("Loaded tasks:", tasks.value);
    } catch (error) {
      console.error("Could not fetch tasks:", error);
    }
  }
};

const resetForm = () => {
  taskForm.value = {
    title: "",
    description: "",
    priority: "medium",
    dueDate: "",
  };
};

const closeModals = () => {
  showAddTaskModal.value = false;
  showEditTaskModal.value = false;
  editingTask.value = null;
  resetForm();
};

const editTask = (task: Task) => {
  editingTask.value = task;
  taskForm.value = {
    title: task.title,
    description: task.description || "",
    priority: task.priority,
    dueDate: task.dueDate || "",
  };
  showEditTaskModal.value = true;
};

const saveTask = async () => {
  if (!currentUser?.value?.id) {
    console.error("No current user found");
    return;
  }

  console.log("Saving task:", taskForm.value);

  try {
    if (isEditing.value && editingTask.value) {
      // Update existing task
      const updates: UpdateTaskRequest = {
        title: taskForm.value.title,
        description: taskForm.value.description || undefined,
        priority: taskForm.value.priority,
        dueDate: taskForm.value.dueDate || undefined,
      };
      console.log("Updating task:", editingTask.value.id, updates);
      await taskService.updateTask(editingTask.value.id, updates);
    } else {
      // Create new task
      const newTask: CreateTaskRequest = {
        title: taskForm.value.title,
        description: taskForm.value.description || undefined,
        priority: taskForm.value.priority,
        dueDate: taskForm.value.dueDate || undefined,
      };
      console.log("Creating new task for user:", currentUser.value.id, newTask);
      await taskService.createTask(currentUser.value.id, newTask);
    }

    await loadTasks();
    closeModals();
    console.log("Task saved successfully");
  } catch (error) {
    console.error("Error saving task:", error);
    alert("Failed to save task. Please try again.");
  }
};

const toggleTaskStatus = async (task: Task) => {
  try {
    const newStatus = task.status === "completed" ? "pending" : "completed";
    await taskService.toggleTaskStatus(task.id, newStatus);
    await loadTasks();
  } catch (error) {
    console.error("Error toggling task status:", error);
  }
};

const deleteTask = async (task: Task) => {
  if (confirm(`Are you sure you want to delete "${task.title}"?`)) {
    try {
      await taskService.deleteTask(task.id);
      await loadTasks();
    } catch (error) {
      console.error("Error deleting task:", error);
    }
  }
};

onMounted(() => {
  loadTasks();

  // Check if there's a task to edit from localStorage
  const taskToEdit = localStorage.getItem("editTask");
  if (taskToEdit) {
    try {
      const task = JSON.parse(taskToEdit) as Task;
      editTask(task);
      localStorage.removeItem("editTask"); // Clean up
    } catch (error) {
      console.error("Error parsing task to edit:", error);
      localStorage.removeItem("editTask");
    }
  }
});
</script>

<style scoped>
.tasks {
  padding: 0;
  background: transparent;
  min-height: 100vh;
}

.tasks-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 3rem;
  padding: 2rem;
  background: linear-gradient(135deg, var(--cream), var(--beige));
  border: 2px solid var(--beige);
  border-radius: 20px;
  box-shadow: 0 8px 32px rgba(162, 175, 155, 0.1);
}

.tasks-header h2 {
  color: var(--sage);
  font-size: 2.5rem;
  font-weight: 700;
  font-family: "Playfair Display", serif;
  margin: 0;
  letter-spacing: -0.02em;
}

.add-btn {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  background: linear-gradient(135deg, var(--sage), var(--accent));
  color: white;
  border: none;
  border-radius: 16px;
  padding: 1rem 1.5rem;
  font-weight: 600;
  font-family: "Inter", sans-serif;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 4px 16px rgba(162, 175, 155, 0.3);
  position: relative;
  overflow: hidden;
}

.add-btn::before {
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

.add-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 32px rgba(162, 175, 155, 0.4);
}

.add-btn:hover::before {
  left: 100%;
}

.filter-tabs {
  display: flex;
  gap: 1rem;
  margin-bottom: 2.5rem;
  flex-wrap: wrap;
}

.filter-tab {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  background: var(--cream);
  border: 2px solid var(--beige);
  border-radius: 12px;
  padding: 1rem 1.5rem;
  cursor: pointer;
  transition: all 0.3s ease;
  font-weight: 600;
  font-family: "Inter", sans-serif;
  color: var(--sage);
}

.filter-tab:hover {
  border-color: var(--sage);
  background: var(--light-gray);
  color: var(--sage);
}

.filter-tab.active {
  background: linear-gradient(135deg, var(--sage), var(--beige));
  color: var(--cream);
  border-color: var(--sage);
  box-shadow: 0 4px 16px rgba(162, 175, 155, 0.3);
}

.count {
  background: rgba(250, 249, 238, 0.5);
  border-radius: 12px;
  padding: 0.25rem 0.75rem;
  font-size: 0.75rem;
  font-weight: 600;
}

.filter-tab.active .count {
  background: rgba(255, 255, 255, 0.3);
}

.tasks-container {
  background: transparent;
  border-radius: 12px;
  padding: 0;
}

.empty-state {
  text-align: center;
  padding: 4rem 2rem;
  background: rgba(15, 23, 42, 0.7);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 24px;
  color: #94a3b8;
}

.empty-state svg {
  margin-bottom: 1.5rem;
  opacity: 0.6;
  color: #64748b;
}

.empty-state h3 {
  margin: 0 0 0.75rem 0;
  font-size: 1.5rem;
  font-weight: 600;
  color: #ffffff;
}

.empty-state p {
  margin: 0;
  opacity: 0.8;
  font-size: 1rem;
}

.tasks-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.task-item {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  padding: 1.5rem;
  background: rgba(15, 23, 42, 0.7);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  transition: all 0.3s ease;
  color: #ffffff;
}

.task-item:hover {
  border-color: rgba(162, 175, 155, 0.3);
  background: rgba(59, 130, 246, 0.1);
  transform: translateY(-2px);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
}

.task-item.completed {
  opacity: 0.6;
  background: rgba(15, 23, 42, 0.5);
}

.task-item.overdue {
  border-color: rgba(239, 68, 68, 0.5);
  background: rgba(239, 68, 68, 0.1);
}

.task-checkbox input {
  width: 18px;
  height: 18px;
  cursor: pointer;
}

.task-content {
  flex: 1;
  cursor: pointer;
}

.task-title {
  font-weight: 600;
  color: #ffffff;
  margin-bottom: 0.25rem;
  line-height: 1.4;
}

.task-item.completed .task-title {
  text-decoration: line-through;
  color: #94a3b8;
}

.task-description {
  color: #94a3b8;
  font-size: 0.9rem;
  margin-bottom: 0.5rem;
  line-height: 1.4;
}

.task-meta {
  display: flex;
  align-items: center;
  gap: 1rem;
  font-size: 0.75rem;
  color: #64748b;
}

.task-priority {
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-weight: 500;
  text-transform: uppercase;
}

.task-priority.high {
  background: rgba(239, 68, 68, 0.15);
  color: #c53030;
}

.task-priority.medium {
  background: rgba(251, 146, 60, 0.15);
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

.task-actions {
  display: flex;
  gap: 0.5rem;
}

.action-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.action-btn.edit {
  background: rgba(162, 175, 155, 0.2);
  color: var(--sage);
  border: 1px solid rgba(162, 175, 155, 0.3);
}

.action-btn.edit:hover {
  background: rgba(162, 175, 155, 0.3);
  color: #ffffff;
}

.action-btn.delete {
  background: rgba(239, 68, 68, 0.2);
  color: #ef4444;
  border: 1px solid rgba(239, 68, 68, 0.3);
}

.action-btn.delete:hover {
  background: rgba(239, 68, 68, 0.3);
  color: #ffffff;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(162, 175, 155, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  backdrop-filter: blur(8px);
}

.modal {
  background: var(--cream);
  border: 2px solid var(--border);
  border-radius: 24px;
  padding: 2rem;
  width: 90%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
  color: var(--text-dark);
  box-shadow: 0 20px 60px var(--shadow);
  position: relative;
}

.modal::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, var(--sage), var(--accent));
  border-radius: 24px 24px 0 0;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.modal-header h3 {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--text-dark);
  font-family: "Playfair Display", serif;
}

.close-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border: 2px solid var(--border);
  border-radius: 12px;
  background: var(--beige);
  color: var(--text-medium);
  cursor: pointer;
  transition: all 0.3s ease;
}

.close-btn:hover {
  background: var(--light-gray);
  border-color: var(--sage);
  transform: translateY(-2px);
}

.task-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.form-group label {
  font-weight: 600;
  color: var(--text-dark);
  font-size: 0.9rem;
  font-family: "Inter", sans-serif;
}

.form-group input,
.form-group textarea {
  padding: 1rem;
  background: var(--cream);
  border: 2px solid var(--border);
  border-radius: 16px;
  font-size: 1rem;
  transition: all 0.3s ease;
  color: var(--text-dark);
  font-family: "Inter", sans-serif;
}

.form-group input::placeholder,
.form-group textarea::placeholder {
  color: var(--text-light);
}

.form-group input:focus,
.form-group textarea:focus {
  outline: none;
  border-color: var(--sage);
  box-shadow: 0 0 0 4px rgba(162, 175, 155, 0.1);
  transform: translateY(-1px);
}

.custom-select {
  position: relative;
}

.custom-select select {
  width: 100%;
  padding: 1rem 2.5rem 1rem 1rem;
  background: var(--cream);
  border: 2px solid var(--border);
  border-radius: 16px;
  font-size: 1rem;
  cursor: pointer;
  appearance: none;
  -webkit-appearance: none;
  -moz-appearance: none;
  color: var(--text-dark);
  font-family: "Inter", sans-serif;
  transition: all 0.3s ease;
  font-weight: 600;
}

.custom-select select:hover {
  border-color: var(--sage);
  box-shadow: 0 2px 8px rgba(162, 175, 155, 0.1);
}

.custom-select select:focus {
  outline: none;
  border-color: var(--sage);
  box-shadow: 0 0 0 4px rgba(162, 175, 155, 0.1);
  transform: translateY(-1px);
}

.custom-select .select-arrow {
  position: absolute;
  right: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  pointer-events: none;
  color: var(--text-light);
  transition: all 0.3s ease;
}

.custom-select:hover .select-arrow {
  color: var(--sage);
  transform: translateY(-50%) scale(1.1);
}

.custom-select select:focus + .select-arrow {
  color: var(--sage);
}

.form-actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  margin-top: 1.5rem;
}

.btn-secondary,
.btn-primary {
  padding: 1rem 2rem;
  border-radius: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  border: none;
  font-family: "Inter", sans-serif;
}

.btn-secondary {
  background: var(--beige);
  color: var(--text-medium);
  border: 2px solid var(--border);
}

.btn-secondary:hover {
  background: var(--light-gray);
  border-color: var(--sage);
  transform: translateY(-2px);
}

.btn-primary {
  background: linear-gradient(135deg, var(--sage), var(--accent));
  color: white;
  border: none;
  box-shadow: 0 4px 16px rgba(162, 175, 155, 0.3);
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(162, 175, 155, 0.4);
}

.btn-primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

@media (max-width: 768px) {
  .tasks {
    padding: 1rem;
  }

  .tasks-header {
    flex-direction: column;
    gap: 1rem;
    align-items: stretch;
  }

  .filter-tabs {
    flex-wrap: wrap;
  }

  .form-row {
    grid-template-columns: 1fr;
  }

  .form-actions {
    flex-direction: column;
  }

  .task-item {
    flex-direction: column;
    gap: 0.75rem;
  }

  .task-checkbox {
    align-self: flex-start;
  }

  .task-actions {
    align-self: flex-end;
  }
}
</style>
