<template>
  <div class="note-folder-overview-container">
    <div class="note-folder-overview-header">
      <h2>Note Folders</h2>
      <p class="subtitle">Organize your notes into themed collections</p>
      <button class="btn-primary" @click="showCreateFolderForm = true">
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
        >
          <path d="M12 5v14M5 12h14" />
        </svg>
        Create New Folder
      </button>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="loading-state">
      <div class="loading-spinner"></div>
      <p>Loading your folders...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="error-state">
      <div class="error-icon">⚠️</div>
      <h3>Oops! Something went wrong</h3>
      <p>{{ error }}</p>
      <button class="retry-btn" @click="loadFolders">Try Again</button>
    </div>

    <!-- Folders Grid (Always shown with General Collection) -->
    <div v-else class="folders-grid">
      <!-- General Collection Card -->
      <div
        class="folder-card general-collection"
        @click="$emit('viewFolder', null)"
      >
        <div class="folder-header">
          <div class="folder-icon general-icon">
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
          <div class="folder-actions">
            <span class="note-count">{{ generalNotesCount }}</span>
          </div>
        </div>
        <div class="folder-content">
          <h3>All Notes</h3>
          <p>All your notes in one place</p>
        </div>
        <div class="folder-footer">
          <div class="folder-meta">
            <span class="last-accessed">Always available</span>
          </div>
        </div>
      </div>

      <!-- Empty State Message (when no custom folders) -->
      <div v-if="folders.length === 0" class="empty-folder-message">
        <div class="empty-icon">
          <svg
            width="48"
            height="48"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="1.5"
          >
            <path
              d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"
            />
          </svg>
        </div>
        <h3>No custom folders yet</h3>
        <p>
          Create your first folder to organize your notes by topic or subject.
        </p>
        <button class="create-btn" @click="showCreateFolderForm = true">
          Create Your First Folder
        </button>
      </div>

      <!-- User's Custom Folders -->
      <div
        v-for="folder in folders"
        :key="folder.id"
        class="folder-card"
        :style="{ borderColor: folder.color || '#6b7280' }"
        @click="$emit('viewFolder', folder.id)"
      >
        <div class="folder-header">
          <div
            class="folder-icon"
            :style="{ backgroundColor: folder.color || '#6b7280' }"
          >
            {{ folder.name.charAt(0).toUpperCase() }}
          </div>
          <div class="folder-actions">
            <button
              class="edit-btn action-btn"
              @click.stop.prevent="editFolder(folder)"
              title="Edit folder"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
              >
                <path
                  d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"
                />
                <path d="m18.5 2.5 3 3L12 15l-4 1 1-4 9.5-9.5z" />
              </svg>
            </button>
            <button
              class="delete-btn action-btn"
              @click.stop.prevent="deleteFolder(folder.id)"
              title="Delete folder"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
              >
                <path
                  d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m3 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6h14zM10 11v6M14 11v6"
                />
              </svg>
            </button>
            <span class="note-count">{{ folder.noteCount || 0 }}</span>
          </div>
        </div>
        <div class="folder-content">
          <h3>{{ folder.name }}</h3>
          <p>{{ folder.description || "No description" }}</p>
        </div>
        <div class="folder-footer">
          <div class="folder-meta">
            <span class="folder-stats">{{ folder.noteCount || 0 }} notes</span>
            <span class="folder-date">{{ formatDate(folder.updatedAt) }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Create Folder Modal -->
    <div
      v-if="showCreateFolderForm"
      class="modal-overlay"
      @click="cancelCreateFolder"
    >
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>{{ editingFolder ? "Edit Folder" : "Create New Folder" }}</h3>
          <button class="close-btn" @click="cancelCreateFolder">&times;</button>
        </div>

        <form @submit.prevent="saveFolder" class="create-folder-form">
          <div class="form-group">
            <label>Folder Name</label>
            <input
              v-model="folderForm.name"
              type="text"
              placeholder="e.g. Personal, Work, Studies..."
              required
            />
          </div>

          <div class="form-group">
            <label>Description (Optional)</label>
            <textarea
              v-model="folderForm.description"
              placeholder="Brief description of what this folder covers..."
              rows="3"
            ></textarea>
          </div>

          <div class="form-group">
            <label>Color Theme (Optional)</label>
            <div class="color-picker">
              <div
                v-for="color in colorOptions"
                :key="color"
                class="color-option"
                :class="{ active: folderForm.color === color }"
                :style="{ backgroundColor: color }"
                @click="folderForm.color = color"
              ></div>
            </div>
          </div>

          <div class="form-actions">
            <button
              type="submit"
              class="save-btn"
              :disabled="!folderForm.name.trim()"
            >
              {{ editingFolder ? "Save Changes" : "Create Folder" }}
            </button>
            <button
              type="button"
              class="cancel-btn"
              @click="cancelCreateFolder"
            >
              Cancel
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
import NoteFolderService from "../services/NoteFolderService";
import { NoteService } from "../services/NoteService";
import type { NoteFolder } from "../types/NoteFolder";

// Emits
defineEmits<{
  viewFolder: [folderId: string | null];
}>();

const { getCurrentUserId } = useAuth();

// Reactive data
const folders = ref<NoteFolder[]>([]);
const loading = ref(true);
const error = ref("");
const showCreateFolderForm = ref(false);
const editingFolder = ref<NoteFolder | null>(null);
const generalNotesCount = ref(0);

const folderForm = ref({
  name: "",
  description: "",
  color: "",
});

const colorOptions = [
  "#ef4444",
  "#f97316",
  "#eab308",
  "#22c55e",
  "#06b6d4",
  "var(--sage)",
  "var(--accent)",
  "#ec4899",
];

const userId = computed(() => getCurrentUserId());

// Load data on mount
onMounted(async () => {
  await Promise.all([loadFolders(), loadGeneralNotesCount()]);
});

const loadFolders = async () => {
  if (!userId.value) {
    error.value = "You must be logged in to view folders";
    loading.value = false;
    return;
  }

  try {
    loading.value = true;
    folders.value = await NoteFolderService.getUserNoteFolders(userId.value);
    error.value = "";
  } catch (err) {
    error.value = "Failed to load folders";
    console.error("Error loading folders:", err);
  } finally {
    loading.value = false;
  }
};

const loadGeneralNotesCount = async () => {
  if (!userId.value) return;

  try {
    const noteService = new NoteService();
    const notes = await noteService.getUserNotes(userId.value);
    // Count ALL notes for the user (General Collection contains all notes)
    generalNotesCount.value = notes.length;
  } catch (err) {
    console.error("Error loading general notes count:", err);
  }
};

const saveFolder = async () => {
  if (!userId.value || !folderForm.value.name.trim()) return;

  try {
    if (editingFolder.value) {
      // Update existing folder
      await NoteFolderService.updateNoteFolder({
        id: editingFolder.value.id,
        ...folderForm.value,
      });
    } else {
      // Create new folder
      await NoteFolderService.createNoteFolder({
        ...folderForm.value,
        userId: userId.value,
      });
    }

    await loadFolders();
    cancelCreateFolder();
  } catch (err) {
    console.error("Error saving folder:", err);
    error.value = "Failed to save folder";
  }
};

const editFolder = (folder: NoteFolder) => {
  editingFolder.value = folder;
  folderForm.value = {
    name: folder.name,
    description: folder.description || "",
    color: folder.color || "",
  };
  showCreateFolderForm.value = true;
};

const deleteFolder = async (folderId: string) => {
  if (
    !confirm(
      "Är du säker på att du vill radera denna mapp? Alla anteckningar i denna mapp kommer att flyttas till den allmänna samlingen."
    )
  ) {
    return;
  }

  try {
    await NoteFolderService.deleteNoteFolder(folderId);
    await Promise.all([loadFolders(), loadGeneralNotesCount()]);
  } catch (err) {
    console.error("Error deleting folder:", err);
    error.value = "Kunde inte radera mappen";
  }
};

const cancelCreateFolder = () => {
  showCreateFolderForm.value = false;
  editingFolder.value = null;
  folderForm.value = {
    name: "",
    description: "",
    color: "",
  };
};

const formatDate = (date: Date) => {
  return new Date(date).toLocaleDateString("sv-SE", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};
</script>

<style scoped>
@import url("https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap");

.note-folder-overview-container {
  padding: 0;
  max-width: 1200px;
  margin: 0 auto;
  font-family: "Inter", sans-serif;
  background: transparent;
}

.note-folder-overview-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 3rem;
  flex-wrap: wrap;
  gap: 1rem;
}

.note-folder-overview-header h2 {
  font-size: 2.5rem;
  font-weight: 700;
  font-family: "Playfair Display", serif;
  color: var(--sage);
  margin: 0;
  letter-spacing: -0.02em;
}

.subtitle {
  color: var(--text-medium);
  margin: 0.5rem 0 0 0;
  font-size: 1.125rem;
  font-family: "Inter", sans-serif;
  font-weight: 400;
}

.btn-primary {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  background: linear-gradient(135deg, var(--sage), var(--accent));
  color: white;
  border: none;
  padding: 1rem 1.5rem;
  border-radius: 12px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.3s ease;
  box-shadow: 0 4px 16px rgba(162, 175, 155, 0.3);
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 32px rgba(162, 175, 155, 0.4);
}

/* Loading State */
.loading-state {
  text-align: center;
  padding: 4rem 2rem;
  color: #64748b;
}

.loading-spinner {
  width: 3rem;
  height: 3rem;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-top: 3px solid var(--sage);
  border-radius: 50%;
  margin: 0 auto 1rem;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

.error-icon,
.empty-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
  color: var(--sage);
  opacity: 0.7;
  display: flex;
  justify-content: center;
  align-items: center;
}

.empty-icon svg {
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1));
}

.retry-btn,
.create-btn {
  background: var(--sage);
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 0.5rem;
  cursor: pointer;
  font-weight: 500;
  margin-top: 1rem;
}

.empty-folder-message {
  grid-column: 1 / -1;
  text-align: center;
  padding: 4rem 2rem;
  background: var(--cream);
  border: 2px solid var(--beige);
  border-radius: 24px;
  margin-top: 1.5rem;
  color: var(--sage);
  box-shadow: 0 8px 32px rgba(162, 175, 155, 0.1);
}

.empty-folder-message h3 {
  margin: 1rem 0 0.5rem 0;
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--sage);
  font-family: "Playfair Display", serif;
}

.empty-folder-message p {
  margin: 0 0 1.5rem 0;
  color: var(--text-medium);
  font-size: 1rem;
  line-height: 1.5;
}

/* Folders Grid */
.folders-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
  margin-top: 2rem;
}

.folder-card {
  background: var(--cream);
  border: 2px solid var(--beige);
  border-radius: 24px;
  padding: 2rem;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
  box-shadow: 0 8px 32px rgba(162, 175, 155, 0.1);
}

.folder-card::before {
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
  border-radius: 24px;
}

.folder-card:hover::before {
  opacity: 1;
}

.folder-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 20px 40px rgba(162, 175, 155, 0.2);
  border-color: var(--sage);
}

.folder-card.general-collection {
  background: linear-gradient(135deg, var(--cream), var(--beige));
  border-color: var(--sage);
}

.folder-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.folder-icon {
  width: 56px;
  height: 56px;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  background: var(--beige);
  color: white;
  position: relative;
  z-index: 1;
  box-shadow: 0 8px 32px rgba(162, 175, 155, 0.3);
  font-weight: 600;
}

.folder-icon.general-icon {
  background: linear-gradient(135deg, var(--sage), var(--accent));
  color: white;
}

.folder-icon.general-icon svg {
  filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.1));
}

.folder-actions {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}

.action-btn {
  background: rgba(255, 255, 255, 0.9);
  border: 1px solid var(--beige);
  padding: 0.6rem;
  border-radius: 10px;
  cursor: pointer;
  color: var(--sage);
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(10px);
  min-width: 32px;
  min-height: 32px;
  position: relative;
  z-index: 10;
}

.action-btn:hover {
  background: var(--cream);
  transform: scale(1.05);
  box-shadow: 0 4px 12px rgba(162, 175, 155, 0.2);
}

.action-btn.delete-btn:hover {
  background: rgba(220, 53, 69, 0.1);
  color: #dc3545;
  border-color: #dc3545;
}

.edit-btn,
.delete-btn {
  background: rgba(255, 255, 255, 0.9);
  border: 1px solid var(--beige);
  padding: 0.6rem;
  border-radius: 10px;
  cursor: pointer;
  color: var(--sage);
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(10px);
  min-width: 32px;
  min-height: 32px;
  position: relative;
  z-index: 10;
}

.edit-btn:hover {
  background: var(--cream);
  transform: scale(1.05);
  box-shadow: 0 4px 12px rgba(162, 175, 155, 0.2);
}

.delete-btn:hover {
  background: rgba(220, 53, 69, 0.1);
  color: #dc3545;
  border-color: #dc3545;
  transform: scale(1.05);
  box-shadow: 0 4px 12px rgba(220, 53, 69, 0.2);
}

.note-count {
  background: var(--sage);
  color: white;
  padding: 0.25rem 0.75rem;
  border-radius: 1rem;
  font-size: 0.875rem;
  font-weight: 500;
}

.folder-content h3 {
  font-size: 1.25rem;
  font-weight: 700;
  font-family: "Playfair Display", serif;
  color: var(--sage);
  margin: 0 0 0.5rem 0;
  position: relative;
  z-index: 1;
}

.folder-content p {
  color: var(--text-medium);
  margin: 0;
  font-size: 0.875rem;
  font-family: "Inter", sans-serif;
  line-height: 1.4;
  position: relative;
  z-index: 1;
}

.folder-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 1rem;
  font-size: 0.875rem;
  color: #64748b;
  position: relative;
  z-index: 1;
}

/* Modal Styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  backdrop-filter: blur(4px);
}

.modal-content {
  background: var(--cream);
  border: 2px solid var(--beige);
  border-radius: 20px;
  box-shadow: 0 20px 40px rgba(162, 175, 155, 0.2);
  width: 100%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
  color: var(--sage);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.modal-header h3 {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
  color: #1e293b;
}

.close-btn {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #64748b;
  padding: 0;
  width: 2rem;
  height: 2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 0.5rem;
}

.close-btn:hover {
  background: rgba(255, 255, 255, 0.05);
}

.create-folder-form {
  padding: 1.5rem;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: #374151;
}

.form-group input,
.form-group textarea {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 0.5rem;
  font-size: 1rem;
  transition: border-color 0.2s ease;
}

.form-group input:focus,
.form-group textarea:focus {
  outline: none;
  border-color: var(--sage);
  box-shadow: 0 0 0 3px rgba(162, 175, 155, 0.1);
}

.color-picker {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.color-option {
  width: 2rem;
  height: 2rem;
  border-radius: 0.5rem;
  cursor: pointer;
  border: 2px solid transparent;
  transition: all 0.2s ease;
}

.color-option:hover {
  transform: scale(1.1);
}

.color-option.active {
  border-color: #1e293b;
  transform: scale(1.1);
}

.form-actions {
  display: flex;
  gap: 0.75rem;
  justify-content: flex-end;
}

.save-btn {
  background: var(--sage);
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 0.5rem;
  cursor: pointer;
  font-weight: 500;
}

.save-btn:disabled {
  background: #94a3b8;
  cursor: not-allowed;
}

.cancel-btn {
  background: rgba(255, 255, 255, 0.05);
  color: #64748b;
  border: 1px solid rgba(255, 255, 255, 0.1);
  padding: 0.75rem 1.5rem;
  border-radius: 0.5rem;
  cursor: pointer;
  font-weight: 500;
}

/* Responsive Design */
@media (max-width: 768px) {
  .note-folder-overview-container {
    padding: 1rem;
  }

  .note-folder-overview-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .folders-grid {
    grid-template-columns: 1fr;
  }

  .modal-overlay {
    padding: 0.5rem;
  }
}
</style>
