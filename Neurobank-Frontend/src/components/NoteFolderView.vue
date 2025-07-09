<template>
  <div class="note-folder-view-container">
    <!-- Folder Header -->
    <div class="folder-header">
      <div class="folder-info">
        <button class="back-btn" @click="$emit('goBack')">
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <polyline points="15,18 9,12 15,6" />
          </svg>
          Back to Folders
        </button>

        <div class="folder-title-section">
          <div
            class="folder-icon"
            :style="{ backgroundColor: folder?.color || '#f1f5f9' }"
          >
            {{
              folderId ? folder?.name?.charAt(0)?.toUpperCase() || "📁" : "📋"
            }}
          </div>
          <div>
            <h2>{{ folder?.name || "All Notes" }}</h2>
            <p class="folder-description">
              {{ folder?.description || "All your notes in one place" }}
            </p>
          </div>
        </div>
      </div>

      <div class="folder-actions">
        <button class="btn-primary" @click="showCreateForm = true">
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
          Add Note
        </button>
      </div>
    </div>

    <!-- Stats -->
    <div class="folder-stats">
      <div class="stat-card" @click="setFilter('all')">
        <div class="stat-number">{{ totalNotes }}</div>
        <div class="stat-label">Total notes</div>
      </div>
      <div class="stat-card" @click="setFilter('recent')">
        <div class="stat-number">{{ recentNotes }}</div>
        <div class="stat-label">Recent (7 days)</div>
      </div>
      <div class="stat-card" @click="setFilter('processed')">
        <div class="stat-number">{{ processedNotes }}</div>
        <div class="stat-label">AI Processed</div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="loading-state">
      <div class="loading-spinner"></div>
      <p>Loading notes...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="error-state">
      <div class="error-icon">⚠️</div>
      <h3>Oops! Something went wrong</h3>
      <p>{{ error }}</p>
      <button class="retry-btn" @click="loadNotes">Try Again</button>
    </div>

    <div v-else-if="notes.length === 0" class="empty-state">
      <div class="empty-icon">📝</div>
      <h3>No notes in this {{ folderId ? "folder" : "collection" }} yet</h3>
      <p>Add some notes to get started.</p>
      <button class="create-btn" @click="showCreateForm = true">
        Add Your First Note
      </button>
    </div>

    <div v-else-if="filteredNotes.length === 0" class="empty-state">
      <div class="empty-icon">🔍</div>
      <h3>No notes match the current filter</h3>
      <button class="btn-secondary" @click="setFilter('all')">
        Show All Notes
      </button>
    </div>

    <div v-else class="notes-list">
      <div class="list-header">
        <h3>
          <span v-if="noteFilter === 'all'">All Notes</span>
          <span v-else-if="noteFilter === 'recent'">Recent Notes</span>
          <span v-else-if="noteFilter === 'processed'">AI Processed Notes</span>
          ({{ filteredNotes.length }})
        </h3>
      </div>

      <div class="notes-grid">
        <div
          v-for="note in filteredNotes"
          :key="note.id"
          class="note-item"
          @click="openNoteViewer(note)"
        >
          <div class="note-item-header">
            <div class="note-title">{{ note.title }}</div>
            <div class="note-actions">
              <button
                class="action-btn edit"
                @click.stop="editNote(note)"
                title="Edit"
              >
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <path
                    d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"
                  />
                  <path
                    d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"
                  />
                </svg>
              </button>
              <button
                class="action-btn delete"
                @click.stop="deleteNote(note.id)"
                title="Delete"
              >
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <polyline points="3,6 5,6 21,6" />
                  <path
                    d="M19,6v14a2,2,0,0,1-2,2H7a2,2,0,0,1-2-2V6m3,0V4a2,2,0,0,1,2-2h4a2,2,0,0,1,2,2V6"
                  />
                </svg>
              </button>
            </div>
          </div>
          <div class="note-item-content">
            <div class="note-preview">{{ getPreviewText(note.content) }}</div>
            <div class="note-tags">
              <span
                v-if="note.processType && note.processType !== 'none'"
                class="tag ai-tag"
              >
                AI: {{ getProcessTypeLabel(note.processType) }}
              </span>
              <span v-if="note.processedContent" class="tag processed-tag">
                Processed
              </span>
            </div>
          </div>
          <div class="note-item-footer">
            <div class="note-meta">
              <span class="note-date">{{ formatDate(note.createdAt) }}</span>
              <span class="note-length"
                >{{ note.content.length }} characters</span
              >
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Create/Edit Note Modal -->
    <div
      v-if="showCreateForm || showEditForm"
      class="modal-overlay"
      @click="cancelForm"
    >
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>{{ showEditForm ? "Edit Note" : "Add New Note" }}</h3>
          <button class="close-btn" @click="cancelForm">&times;</button>
        </div>

        <form @submit.prevent="saveNote" class="note-form">
          <div class="form-group">
            <label>Title</label>
            <input
              v-model="noteForm.title"
              type="text"
              placeholder="Enter note title..."
              required
            />
          </div>

          <div class="form-group">
            <label>Content</label>
            <textarea
              v-model="noteForm.content"
              placeholder="Write your note here..."
              rows="10"
              required
            ></textarea>
          </div>

          <div class="form-group">
            <label>AI Processing</label>
            <select v-model="noteForm.processType">
              <option value="none">No processing</option>
              <option value="summarize">Let AI summarize</option>
              <option value="expand">Let AI expand the text</option>
            </select>
          </div>

          <div class="form-actions">
            <button type="submit" class="save-btn" :disabled="!isFormValid">
              {{ showEditForm ? "Save Changes" : "Add Note" }}
            </button>
            <button type="button" class="cancel-btn" @click="cancelForm">
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Note Viewer Modal -->
    <div v-if="selectedNote" class="modal-overlay" @click="closeNoteViewer">
      <div class="modal-content large" @click.stop>
        <NoteViewer
          :note="selectedNote"
          @close="closeNoteViewer"
          @noteUpdated="handleNoteUpdated"
          @noteDeleted="handleNoteDeleted"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from "vue";
import { useAuth } from "../stores/auth";
import { NoteService } from "../services/NoteService";
import NoteFolderService from "../services/NoteFolderService";
import NoteViewer from "./NoteViewer.vue";
import { handleCreateNote, handleProcessNote } from "../services/handleNotes";
import type { Note } from "../types/Note";
import type { NoteFolder } from "../types/NoteFolder";

// Props and Emits
const props = defineProps<{
  folderId: string | null;
}>();

defineEmits<{
  goBack: [];
}>();

const { getCurrentUserId } = useAuth();

// Reactive data
const folder = ref<NoteFolder | null>(null);
const notes = ref<Note[]>([]);
const loading = ref(true);
const error = ref("");
const noteFilter = ref<"all" | "recent" | "processed">("all");
const showCreateForm = ref(false);
const showEditForm = ref(false);
const editingNote = ref<Note | null>(null);
const selectedNote = ref<Note | null>(null);

const noteForm = ref({
  title: "",
  content: "",
  processType: "none" as "none" | "summarize" | "expand",
});

const userId = computed(() => getCurrentUserId());

// Computed values
const totalNotes = computed(() => notes.value.length);
const recentNotes = computed(() => {
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  return notes.value.filter((note) => new Date(note.createdAt) >= sevenDaysAgo)
    .length;
});
const processedNotes = computed(
  () => notes.value.filter((note) => note.processedContent).length
);

const filteredNotes = computed(() => {
  switch (noteFilter.value) {
    case "recent":
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      return notes.value.filter(
        (note) => new Date(note.createdAt) >= sevenDaysAgo
      );
    case "processed":
      return notes.value.filter((note) => note.processedContent);
    default:
      return notes.value;
  }
});

const isFormValid = computed(
  () =>
    noteForm.value.title.trim().length > 0 &&
    noteForm.value.content.trim().length > 0
);

// Load data on mount and when folderId changes
onMounted(() => {
  loadData();
});

watch(
  () => props.folderId,
  () => {
    loadData();
  }
);

const loadData = async () => {
  await Promise.all([loadFolder(), loadNotes()]);
};

const loadFolder = async () => {
  if (!props.folderId) {
    folder.value = null;
    return;
  }

  try {
    folder.value = await NoteFolderService.getNoteFolder(props.folderId);
  } catch (err) {
    console.error("Error loading folder:", err);
  }
};

const loadNotes = async () => {
  if (!userId.value) {
    error.value = "You must be logged in to view notes";
    loading.value = false;
    return;
  }

  try {
    loading.value = true;

    if (props.folderId) {
      notes.value = await NoteFolderService.getNoteFolderNotes(props.folderId);
    } else {
      // Load general collection (ALL notes for the user)
      const noteService = new NoteService();
      notes.value = await noteService.getUserNotes(userId.value);
    }

    error.value = "";
  } catch (err) {
    error.value = "Failed to load notes";
    console.error("Error loading notes:", err);
  } finally {
    loading.value = false;
  }
};

// Filter Functions
const setFilter = (filter: "all" | "recent" | "processed") => {
  noteFilter.value = filter;
};

// Note CRUD Functions
const saveNote = async () => {
  if (!userId.value || !isFormValid.value) return;

  try {
    const noteData = {
      title: noteForm.value.title.trim(),
      content: noteForm.value.content.trim(),
      processType: noteForm.value.processType,
      userId: userId.value,
      folderId: props.folderId || undefined,
    };

    if (showEditForm.value && editingNote.value) {
      // Update existing note
      const noteService = new NoteService();
      await noteService.updateNote(editingNote.value.id, {
        title: noteData.title,
        content: noteData.content,
      });

      // If process type changed, process the note
      if (
        noteData.processType !== "none" &&
        noteData.processType !== editingNote.value.processType
      ) {
        await handleProcessNote({
          noteId: editingNote.value.id,
          processType: noteData.processType,
        });
      }
    } else {
      // Create new note
      const result = await handleCreateNote(noteData);

      if (result.success && noteData.processType !== "none" && result.note) {
        await handleProcessNote({
          noteId: result.note.id,
          processType: noteData.processType,
        });
      }
    }

    await loadNotes();
    cancelForm();
  } catch (err) {
    console.error("Error saving note:", err);
    error.value = "Failed to save note";
  }
};

const editNote = (note: Note) => {
  editingNote.value = note;
  noteForm.value = {
    title: note.title,
    content: note.content,
    processType: note.processType,
  };
  showEditForm.value = true;
};

const deleteNote = async (noteId: string) => {
  if (!confirm("Are you sure you want to delete this note?")) return;

  try {
    const noteService = new NoteService();
    await noteService.deleteNote(noteId);
    await loadNotes();
  } catch (err) {
    console.error("Error deleting note:", err);
    error.value = "Failed to delete note";
  }
};

const cancelForm = () => {
  showCreateForm.value = false;
  showEditForm.value = false;
  editingNote.value = null;
  noteForm.value = {
    title: "",
    content: "",
    processType: "none",
  };
};

// Note Viewer Functions
const openNoteViewer = (note: Note) => {
  selectedNote.value = note;
};

const closeNoteViewer = () => {
  selectedNote.value = null;
};

const handleNoteUpdated = (updatedNote: Note) => {
  const index = notes.value.findIndex((note) => note.id === updatedNote.id);
  if (index !== -1) {
    notes.value[index] = updatedNote;
  }
  selectedNote.value = updatedNote;
};

const handleNoteDeleted = (deletedNoteId: string) => {
  const index = notes.value.findIndex((note) => note.id === deletedNoteId);
  if (index !== -1) {
    notes.value.splice(index, 1);
  }
  selectedNote.value = null;
};

// Utility Functions
const getPreviewText = (content: string): string => {
  return content.length > 120 ? content.substring(0, 120) + "..." : content;
};

const getProcessTypeLabel = (processType: string): string => {
  switch (processType) {
    case "summarize":
      return "Summary";
    case "expand":
      return "Expansion";
    default:
      return processType;
  }
};

const formatDate = (dateInput: string | Date): string => {
  const date = dateInput instanceof Date ? dateInput : new Date(dateInput);
  return date.toLocaleDateString("sv-SE", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};
</script>

<style scoped>
.note-folder-view-container {
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
  font-family: "Inter", sans-serif;
}

/* Header */
.folder-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  flex-wrap: wrap;
  gap: 1rem;
}

.back-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: transparent;
  border: 1px solid #e2e8f0;
  color: #64748b;
  padding: 0.5rem 1rem;
  border-radius: 0.5rem;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s ease;
  margin-bottom: 1rem;
}

.back-btn:hover {
  background: #f8fafc;
  border-color: #94a3b8;
}

.folder-title-section {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.folder-icon {
  width: 48px;
  height: 48px;
  border-radius: 0.75rem;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  background: #f1f5f9;
  color: white;
}

.folder-title-section h2 {
  font-size: 1.75rem;
  font-weight: 700;
  color: #1e293b;
  margin: 0;
}

.folder-description {
  color: #64748b;
  margin: 0.25rem 0 0 0;
  font-size: 1rem;
}

.folder-actions {
  display: flex;
  gap: 0.75rem;
  align-items: center;
}

.btn-primary,
.btn-secondary {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  border-radius: 0.75rem;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.3s ease;
  border: none;
}

.btn-primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(102, 126, 234, 0.3);
}

.btn-secondary {
  background: #f8fafc;
  color: #64748b;
  border: 1px solid #e2e8f0;
}

.btn-secondary:hover {
  background: #f1f5f9;
  border-color: #94a3b8;
}

/* Stats */
.folder-stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.stat-card {
  background: white;
  padding: 1.5rem;
  border-radius: 0.75rem;
  border: 1px solid #e2e8f0;
  cursor: pointer;
  transition: all 0.2s ease;
}

.stat-card:hover {
  border-color: #667eea;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.15);
}

.stat-number {
  font-size: 2rem;
  font-weight: 700;
  color: #1e293b;
  margin-bottom: 0.5rem;
}

.stat-label {
  color: #64748b;
  font-size: 0.875rem;
  font-weight: 500;
}

/* Notes List */
.notes-list {
  background: white;
  border-radius: 1rem;
  padding: 2rem;
  border: 1px solid #e2e8f0;
}

.list-header {
  margin-bottom: 1.5rem;
}

.list-header h3 {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
  color: #1e293b;
}

.notes-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 1rem;
}

.note-item {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 0.75rem;
  padding: 1.5rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.note-item:hover {
  border-color: #667eea;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.1);
}

.note-item-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
}

.note-title {
  font-weight: 600;
  color: #1e293b;
  flex: 1;
  margin-right: 1rem;
}

.note-actions {
  display: flex;
  gap: 0.5rem;
}

.action-btn {
  background: transparent;
  border: none;
  padding: 0.5rem;
  border-radius: 0.5rem;
  cursor: pointer;
  color: #64748b;
  transition: all 0.2s ease;
}

.action-btn:hover {
  background: #f1f5f9;
  color: #334155;
}

.action-btn.delete:hover {
  color: #ef4444;
  background: #fef2f2;
}

.note-item-content {
  margin-bottom: 1rem;
}

.note-preview {
  color: #64748b;
  line-height: 1.5;
  margin-bottom: 0.75rem;
}

.note-tags {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.tag {
  padding: 0.25rem 0.5rem;
  border-radius: 0.5rem;
  font-size: 0.75rem;
  font-weight: 500;
}

.ai-tag {
  background: #dbeafe;
  color: #1e40af;
}

.processed-tag {
  background: #dcfce7;
  color: #166534;
}

.note-item-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.875rem;
  color: #64748b;
}

/* States */
.loading-state,
.error-state,
.empty-state {
  text-align: center;
  padding: 4rem 2rem;
  color: #64748b;
}

.loading-spinner {
  width: 3rem;
  height: 3rem;
  border: 3px solid #e2e8f0;
  border-top: 3px solid #667eea;
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

.empty-icon,
.error-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
  opacity: 0.6;
}

.create-btn,
.retry-btn {
  background: #667eea;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 0.5rem;
  cursor: pointer;
  font-weight: 500;
  margin-top: 1rem;
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
  background: white;
  border-radius: 1rem;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
  width: 100%;
  max-width: 600px;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-content.large {
  max-width: 900px;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid #e2e8f0;
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
  background: #f1f5f9;
}

.note-form {
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
.form-group textarea,
.form-group select {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 0.5rem;
  font-size: 1rem;
  transition: border-color 0.2s ease;
  font-family: inherit;
}

.form-group input:focus,
.form-group textarea:focus,
.form-group select:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.form-actions {
  display: flex;
  gap: 0.75rem;
  justify-content: flex-end;
}

.save-btn {
  background: #667eea;
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
  background: #f8fafc;
  color: #64748b;
  border: 1px solid #e2e8f0;
  padding: 0.75rem 1.5rem;
  border-radius: 0.5rem;
  cursor: pointer;
  font-weight: 500;
}

/* Responsive Design */
@media (max-width: 768px) {
  .note-folder-view-container {
    padding: 1rem;
  }

  .folder-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .folder-actions {
    width: 100%;
    justify-content: space-between;
  }

  .folder-stats {
    grid-template-columns: repeat(3, 1fr);
  }

  .notes-grid {
    grid-template-columns: 1fr;
  }

  .modal-overlay {
    padding: 0.5rem;
  }
}
</style>
