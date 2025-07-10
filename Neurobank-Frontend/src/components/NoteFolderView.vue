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
            :style="{
              backgroundColor: folder?.color || 'rgba(255, 255, 255, 0.1)',
            }"
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
      <!-- Flashcard Generation Toolbar -->
      <div v-if="notes.length > 0" class="flashcard-toolbar">
        <div class="toolbar-left">
          <h3>
            <span v-if="noteFilter === 'all'">All Notes</span>
            <span v-else-if="noteFilter === 'recent'">Recent Notes</span>
            <span v-else-if="noteFilter === 'processed'"
              >AI Processed Notes</span
            >
            ({{ filteredNotes.length }})
          </h3>
        </div>
        <div class="toolbar-right">
          <div class="selection-info" v-if="selectedNoteIds.length > 0">
            <span>{{ selectedNoteIds.length }} selected</span>
            <button class="btn-secondary" @click="selectedNoteIds = []">
              Clear
            </button>
          </div>
          <button
            class="btn-secondary"
            @click="selectAllNotes"
            :disabled="filteredNotes.length === 0"
          >
            {{
              selectedNoteIds.length === filteredNotes.length
                ? "Deselect All"
                : "Select All"
            }}
          </button>
          <button
            class="btn-primary flashcard-btn"
            @click="startFlashcardGeneration"
            :disabled="!canGenerateFlashcards"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
              <line x1="8" y1="21" x2="16" y2="21" />
              <line x1="12" y1="17" x2="12" y2="21" />
            </svg>
            Generate Flashcards ({{ selectedNoteIds.length }})
          </button>
        </div>
      </div>

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
          :class="{ selected: isNoteSelected(note.id) }"
        >
          <div class="note-checkbox">
            <input
              type="checkbox"
              :id="`note-${note.id}`"
              :checked="isNoteSelected(note.id)"
              @change="toggleNoteSelection(note.id)"
            />
          </div>

          <div class="note-content" @click="openNoteViewer(note)">
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

    <!-- Flashcard Generation Modal -->
    <div
      v-if="showFlashcardModal"
      class="modal-overlay"
      @click="closeFlashcardModal"
    >
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>Generate Flashcards</h3>
          <button class="close-btn" @click="closeFlashcardModal">
            <svg
              width="24"
              height="24"
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

        <div class="modal-body">
          <div v-if="!generatingFlashcards && generatedFlashcards.length === 0">
            <p class="generation-info">
              Generate flashcards from {{ selectedNoteIds.length }} selected
              note{{ selectedNoteIds.length > 1 ? "s" : "" }}. AI will create
              questions and answers based on the most important content and
              categorize them.
            </p>

            <div v-if="flashcardError" class="error-message">
              {{ flashcardError }}
            </div>

            <div class="modal-actions">
              <button class="btn-secondary" @click="closeFlashcardModal">
                Cancel
              </button>
              <button
                class="btn-primary"
                @click="generateFlashcards"
                :disabled="generatingFlashcards"
              >
                Generate Flashcards
              </button>
            </div>
          </div>

          <div v-else-if="generatingFlashcards" class="loading-state">
            <div class="loading-spinner"></div>
            <h4>Generating flashcards...</h4>
            <p>AI is creating flashcards from your selected notes</p>
          </div>

          <div
            v-else-if="generatedFlashcards.length > 0"
            class="flashcards-result"
          >
            <div class="result-header">
              <h4>Generated {{ generatedFlashcards.length }} Flashcards</h4>
              <p class="result-subtitle">Review your new flashcards below</p>
            </div>

            <div class="flashcards-list">
              <div
                v-for="(flashcard, index) in generatedFlashcards"
                :key="index"
                class="flashcard-preview"
              >
                <div class="flashcard-categories">
                  <span
                    v-for="category in flashcard.categories"
                    :key="category"
                    class="category-tag"
                  >
                    {{ category }}
                  </span>
                </div>
                <div class="flashcard-content">
                  <div class="flashcard-question">
                    <strong>Q:</strong> {{ flashcard.question }}
                  </div>
                  <div class="flashcard-answer">
                    <strong>A:</strong> {{ flashcard.answer }}
                  </div>
                </div>
              </div>
            </div>

            <div class="modal-actions">
              <button class="btn-primary" @click="closeFlashcardModal">
                Done
              </button>
            </div>
          </div>
        </div>
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

// Flashcard generation data
const selectedNoteIds = ref<string[]>([]);
const showFlashcardModal = ref(false);
const generatingFlashcards = ref(false);
const generatedFlashcards = ref<any[]>([]);
const flashcardError = ref("");
const selectedDeckId = ref<string | null>(null);
// const decks = ref<any[]>([]);

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

// Flashcard Functions
const toggleNoteSelection = (noteId: string) => {
  const index = selectedNoteIds.value.indexOf(noteId);
  if (index > -1) {
    selectedNoteIds.value.splice(index, 1);
  } else {
    selectedNoteIds.value.push(noteId);
  }
};

const selectAllNotes = () => {
  if (selectedNoteIds.value.length === filteredNotes.value.length) {
    selectedNoteIds.value = [];
  } else {
    selectedNoteIds.value = filteredNotes.value.map((note) => note.id);
  }
};

const startFlashcardGeneration = () => {
  if (selectedNoteIds.value.length === 0) {
    flashcardError.value =
      "Please select at least one note to generate flashcards";
    return;
  }
  showFlashcardModal.value = true;
  flashcardError.value = "";
};

const generateFlashcards = async () => {
  if (!userId.value || selectedNoteIds.value.length === 0) {
    flashcardError.value = "Please select notes and ensure you are logged in";
    return;
  }

  generatingFlashcards.value = true;
  flashcardError.value = "";

  try {
    // Here you would call the actual flashcard service
    // For now, just simulate the process
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Mock generated flashcards
    generatedFlashcards.value = [
      {
        question: "Sample question from your notes",
        answer: "Sample answer",
        categories: ["General"],
      },
    ];

    // Clear selection after successful generation
    selectedNoteIds.value = [];
  } catch (error) {
    flashcardError.value =
      error instanceof Error ? error.message : "Failed to generate flashcards";
    console.error("Error generating flashcards:", error);
  } finally {
    generatingFlashcards.value = false;
  }
};

const closeFlashcardModal = () => {
  showFlashcardModal.value = false;
  generatedFlashcards.value = [];
  flashcardError.value = "";
  selectedDeckId.value = null;
};

const isNoteSelected = (noteId: string) => {
  return selectedNoteIds.value.includes(noteId);
};

const canGenerateFlashcards = computed(() => {
  return selectedNoteIds.value.length > 0 && !generatingFlashcards.value;
});

// Utility Functions
const getPreviewText = (content: string) => {
  const maxLength = 150;
  if (content.length <= maxLength) return content;
  return content.slice(0, maxLength) + "...";
};

const getProcessTypeLabel = (processType: string) => {
  switch (processType) {
    case "summarize":
      return "Summary";
    case "expand":
      return "Expansion";
    default:
      return processType;
  }
};

const formatDate = (dateInput: string | Date) => {
  const date = dateInput instanceof Date ? dateInput : new Date(dateInput);
  return date.toLocaleDateString("sv-SE", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

const closeNoteViewer = () => {
  selectedNote.value = null;
};

const handleNoteUpdated = (updatedNote: Note) => {
  const index = notes.value.findIndex((note) => note.id === updatedNote.id);
  if (index !== -1) {
    notes.value[index] = updatedNote;
  }
};

const handleNoteDeleted = (deletedNoteId: string) => {
  const index = notes.value.findIndex((note) => note.id === deletedNoteId);
  if (index !== -1) {
    notes.value.splice(index, 1);
  }
  selectedNote.value = null;
};

// const getNoteTitleById = (noteId: string) => {
//   const note = notes.value.find((note) => note.id === noteId);
//   return note ? note.title : "Unknown Note";
// };
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
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: #94a3b8;
  padding: 0.5rem 1rem;
  border-radius: 0.5rem;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s ease;
  margin-bottom: 1rem;
}

.back-btn:hover {
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
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
  background: rgba(255, 255, 255, 0.1);
  color: white;
}

.folder-title-section h2 {
  font-size: 1.75rem;
  font-weight: 700;
  color: #ffffff;
  margin: 0;
}

.folder-description {
  color: #94a3b8;
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
  background: linear-gradient(135deg, #3b82f6, #8b5cf6);
  color: white;
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(102, 126, 234, 0.3);
}

.btn-secondary {
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: #94a3b8;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.btn-secondary:hover {
  background: rgba(255, 255, 255, 0.1);
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
  background: rgba(15, 23, 42, 0.7);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  padding: 1.5rem;
  border-radius: 0.75rem;
  border: 1px solid rgba(255, 255, 255, 0.1);
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
  color: #ffffff;
  margin-bottom: 0.5rem;
}

.stat-label {
  color: #94a3b8;
  font-size: 0.875rem;
  font-weight: 500;
}

/* Notes List */
.notes-list {
  background: rgba(15, 23, 42, 0.7);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 1rem;
  padding: 2rem;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.flashcard-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem 2rem;
  background: rgba(15, 23, 42, 0.7);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  margin-bottom: 2rem;
  gap: 1rem;
}

.toolbar-left h3 {
  color: #ffffff;
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
}

.toolbar-right {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.selection-info {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  color: #94a3b8;
  font-size: 0.9rem;
}

.flashcard-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.notes-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 1rem;
}

.note-item {
  position: relative;
  background: rgba(15, 23, 42, 0.7);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  padding: 0;
  transition: all 0.3s ease;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.note-item.selected {
  border-color: rgba(59, 130, 246, 0.5);
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.2);
}

.note-checkbox {
  position: absolute;
  top: 1rem;
  left: 1rem;
  z-index: 2;
}

.note-checkbox input[type="checkbox"] {
  width: 18px;
  height: 18px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 4px;
  background: rgba(15, 23, 42, 0.8);
  cursor: pointer;
  transition: all 0.2s ease;
}

.note-checkbox input[type="checkbox"]:checked {
  background: linear-gradient(135deg, #3b82f6, #8b5cf6);
  border-color: #3b82f6;
}

.note-content {
  padding: 1.5rem;
  padding-left: 3rem; /* Make room for checkbox */
  cursor: pointer;
  flex: 1;
}

.note-content:hover {
  background: rgba(255, 255, 255, 0.05);
}

.note-item-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
}

.note-title {
  font-weight: 600;
  color: #ffffff;
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
  color: #94a3b8;
  transition: all 0.2s ease;
}

.action-btn:hover {
  background: rgba(255, 255, 255, 0.1);
  color: #334155;
}

.action-btn.delete:hover {
  color: #ef4444;
  background: rgba(239, 68, 68, 0.2);
}

.note-item-content {
  margin-bottom: 1rem;
}

.note-preview {
  color: #94a3b8;
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
  color: #94a3b8;
}

/* States */
.loading-state,
.error-state,
.empty-state {
  text-align: center;
  padding: 4rem 2rem;
  color: #94a3b8;
}

.loading-spinner {
  width: 3rem;
  height: 3rem;
  border: 1px solid rgba(255, 255, 255, 0.1);
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
  background: rgba(15, 23, 42, 0.7);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.1);
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
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.modal-header h3 {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
  color: #ffffff;
}

.close-btn {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #94a3b8;
  padding: 0;
  width: 2rem;
  height: 2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 0.5rem;
}

.close-btn:hover {
  background: rgba(255, 255, 255, 0.1);
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
  color: #ffffff;
}

.form-group input,
.form-group textarea,
.form-group select {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid rgba(255, 255, 255, 0.15);
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
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: #94a3b8;
  border: 1px solid rgba(255, 255, 255, 0.1);
  padding: 0.75rem 1.5rem;
  border-radius: 0.5rem;
  cursor: pointer;
  font-weight: 500;
}

/* Flashcard Toolbar */
.flashcard-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem 2rem;
  background: rgba(15, 23, 42, 0.7);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  margin-bottom: 2rem;
  gap: 1rem;
}

.toolbar-left h3 {
  color: #ffffff;
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
}

.toolbar-right {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.selection-info {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  color: #94a3b8;
  font-size: 0.9rem;
}

.flashcard-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

/* Flashcard Modal Styles */
.flashcards-result {
  max-height: 400px;
  overflow-y: auto;
}

.result-header {
  margin-bottom: 1.5rem;
  text-align: center;
}

.result-header h4 {
  color: #ffffff;
  margin: 0 0 0.5rem 0;
  font-size: 1.25rem;
}

.result-subtitle {
  color: #94a3b8;
  margin: 0;
}

.flashcards-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.flashcard-preview {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 1rem;
}

.flashcard-categories {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 0.75rem;
}

.category-tag {
  background: rgba(59, 130, 246, 0.2);
  color: #60a5fa;
  padding: 0.25rem 0.5rem;
  border-radius: 6px;
  font-size: 0.75rem;
  font-weight: 500;
}

.flashcard-content {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.flashcard-question,
.flashcard-answer {
  color: #e2e8f0;
  line-height: 1.5;
}

.flashcard-question strong,
.flashcard-answer strong {
  color: #60a5fa;
}

.generation-info {
  color: #94a3b8;
  margin-bottom: 1.5rem;
  line-height: 1.6;
}

.error-message {
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.3);
  color: #fca5a5;
  padding: 0.75rem;
  border-radius: 8px;
  margin-bottom: 1rem;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 1.5rem;
}

.loading-state {
  text-align: center;
  padding: 2rem;
}

.loading-state h4 {
  color: #ffffff;
  margin: 1rem 0 0.5rem 0;
}

.loading-state p {
  color: #94a3b8;
  margin: 0;
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
