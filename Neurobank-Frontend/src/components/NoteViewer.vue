<template>
  <div class="note-viewer">
    <div class="note-viewer-header">
      <div class="header-left">
        <div class="header-icon">
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
        <div class="header-text">
          <h3>{{ localNote.title }}</h3>
          <p>{{ formatDate(localNote.createdAt) }}</p>
        </div>
      </div>
      <div class="header-actions">
        <button
          class="action-btn delete-btn"
          @click="showDeleteConfirm = true"
          :disabled="isLoading"
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <polyline points="3,6 5,6 21,6" />
            <path
              d="M19,6v14a2,2,0,0,1-2,2H7a2,2,0,0,1-2-2V6m3,0V4a2,2,0,0,1,2-2h4a2,2,0,0,1,2,2V6"
            />
            <line x1="10" y1="11" x2="10" y2="17" />
            <line x1="14" y1="11" x2="14" y2="17" />
          </svg>
          Delete
        </button>
        <button class="action-btn close-btn" @click="$emit('close')">
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
          Close
        </button>
      </div>
    </div>

    <!-- Success/Error Messages -->
    <div v-if="successMessage" class="success-message">
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
      >
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
        <polyline points="22,4 12,14.01 9,11.01" />
      </svg>
      {{ successMessage }}
    </div>

    <div v-if="errorMessage" class="error-message">
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
      >
        <circle cx="12" cy="12" r="10" />
        <line x1="15" y1="9" x2="9" y2="15" />
        <line x1="9" y1="9" x2="15" y2="15" />
      </svg>
      {{ errorMessage }}
    </div>

    <div class="note-content">
      <!-- Original Note Section -->
      <div class="note-section">
        <div class="section-header">
          <div class="section-title">
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <path
                d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"
              />
              <polyline points="14,2 14,8 20,8" />
            </svg>
            <h4>Original note</h4>
          </div>
          <div class="section-actions" v-if="!isEditMode">
            <button
              class="edit-section-btn"
              @click="startEditingOriginal"
              :disabled="isLoading"
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
                <path
                  d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"
                />
              </svg>
              Edit
            </button>
          </div>
        </div>

        <div v-if="editingOriginal" class="edit-form">
          <div class="form-group">
            <label class="form-label">Title</label>
            <input
              v-model="editTitle"
              class="form-input"
              :disabled="isLoading"
              placeholder="Enter title..."
            />
          </div>
          <div class="form-group">
            <label class="form-label">Content</label>
            <textarea
              v-model="editContent"
              class="form-textarea"
              rows="10"
              :disabled="isLoading"
              placeholder="Write your note here..."
            ></textarea>
          </div>
          <div class="form-actions">
            <button
              class="save-btn"
              @click="saveOriginal"
              :disabled="isLoading || !editTitle.trim() || !editContent.trim()"
            >
              <svg
                v-if="!isLoading"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
              >
                <path
                  d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"
                />
                <polyline points="17,21 17,13 7,13 7,21" />
                <polyline points="7,3 7,8 15,8" />
              </svg>
              <div v-else class="loading-spinner-small"></div>
              {{ isLoading ? "Saving..." : "Save changes" }}
            </button>
            <button
              class="cancel-btn"
              @click="cancelEditingOriginal"
              :disabled="isLoading"
            >
              Cancel
            </button>
          </div>
        </div>

        <div v-else class="content-display">
          <div class="content-text">{{ localNote.content }}</div>
          <div class="content-meta">
            <span class="word-count"
              >{{ getWordCount(localNote.content) }} words</span
            >
            <span class="char-count"
              >{{ localNote.content.length }} characters</span
            >
            <span class="reading-time"
              >{{ getReadingTime(localNote.content) }} min reading</span
            >
          </div>
        </div>
      </div>

      <!-- AI Processed Section -->
      <div v-if="localNote.processedContent" class="note-section ai-section">
        <div class="section-header">
          <div class="section-title">
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <path
                d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
              />
            </svg>
            <h4>AI-processed version</h4>
            <span class="ai-badge">{{
              getProcessTypeLabel(localNote.processType)
            }}</span>
          </div>
          <div class="section-actions" v-if="!isEditMode">
            <button
              class="edit-section-btn"
              @click="startEditingProcessed"
              :disabled="isLoading"
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
                <path
                  d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"
                />
              </svg>
              Edit
            </button>
          </div>
        </div>

        <div v-if="editingProcessed" class="edit-form">
          <div class="form-group">
            <label class="form-label">AI-processed text</label>
            <textarea
              v-model="editProcessedContent"
              class="form-textarea"
              rows="8"
              :disabled="isLoading"
              placeholder="Edit the AI-processed text..."
            ></textarea>
          </div>
          <div class="form-actions">
            <button
              class="save-btn"
              @click="saveProcessed"
              :disabled="isLoading || !editProcessedContent.trim()"
            >
              <svg
                v-if="!isLoading"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
              >
                <path
                  d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"
                />
                <polyline points="17,21 17,13 7,13 7,21" />
                <polyline points="7,3 7,8 15,8" />
              </svg>
              <div v-else class="loading-spinner-small"></div>
              {{ isLoading ? "Saving..." : "Save changes" }}
            </button>
            <button
              class="cancel-btn"
              @click="cancelEditingProcessed"
              :disabled="isLoading"
            >
              Cancel
            </button>
          </div>
        </div>

        <div v-else class="content-display ai-content">
          <div class="content-text">{{ localNote.processedContent }}</div>
          <div class="content-meta">
            <span class="word-count"
              >{{ getWordCount(localNote.processedContent || "") }} words</span
            >
            <span class="char-count"
              >{{ (localNote.processedContent || "").length }} characters</span
            >
            <span class="reading-time"
              >{{ getReadingTime(localNote.processedContent || "") }} min
              reading</span
            >
          </div>
        </div>
      </div>
    </div>

    <!-- Delete Confirmation Modal -->
    <div
      v-if="showDeleteConfirm"
      class="modal-overlay"
      @click="showDeleteConfirm = false"
    >
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>Delete Note</h3>
          <button class="close-btn" @click="showDeleteConfirm = false">
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

        <div class="modal-body">
          <div class="warning-icon">
            <svg
              width="48"
              height="48"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <path
                d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"
              />
              <line x1="12" y1="9" x2="12" y2="13" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
          </div>
          <h4>Are you sure you want to delete this note?</h4>
          <p>
            "<strong>{{ localNote.title }}</strong
            >" will be permanently deleted. This action cannot be undone.
          </p>

          <div v-if="deleteError" class="error-message">
            {{ deleteError }}
          </div>

          <div class="modal-actions">
            <button
              class="btn-secondary"
              @click="showDeleteConfirm = false"
              :disabled="isDeleting"
            >
              Cancel
            </button>
            <button
              class="btn-danger"
              @click="confirmDelete"
              :disabled="isDeleting"
            >
              <svg
                v-if="!isDeleting"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
              >
                <polyline points="3,6 5,6 21,6" />
                <path
                  d="M19,6v14a2,2,0,0,1-2,2H7a2,2,0,0,1-2-2V6m3,0V4a2,2,0,0,1,2-2h4a2,2,0,0,1,2,2V6"
                />
                <line x1="10" y1="11" x2="10" y2="17" />
                <line x1="14" y1="11" x2="14" y2="17" />
              </svg>
              <div v-else class="loading-spinner-small"></div>
              {{ isDeleting ? "Deleting..." : "Delete Note" }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from "vue";
import { handleUpdateNote, handleDeleteNote } from "../services/handleNotes";
import type { Note } from "../types/Note";

interface Props {
  note: Note;
}

const props = defineProps<Props>();
const emit = defineEmits<{
  close: [];
  noteUpdated: [note: Note];
  noteDeleted: [noteId: string];
}>();

// Use reactive local copy of the note that updates immediately
const localNote = ref<Note>({ ...props.note });

// Edit states
const isEditMode = ref(false);
const editingOriginal = ref(false);
const editingProcessed = ref(false);
const isLoading = ref(false);

// Delete states
const showDeleteConfirm = ref(false);
const isDeleting = ref(false);
const deleteError = ref("");

// Edit form data - initialize from local note
const editTitle = ref(localNote.value.title);
const editContent = ref(localNote.value.content);
const editProcessedContent = ref(localNote.value.processedContent || "");

// Messages
const successMessage = ref("");
const errorMessage = ref("");

// Watch for prop changes and update local note
watch(
  () => props.note,
  (newNote) => {
    localNote.value = { ...newNote };
    editTitle.value = newNote.title;
    editContent.value = newNote.content;
    editProcessedContent.value = newNote.processedContent || "";
  },
  { deep: true }
);

const startEditingOriginal = () => {
  editingOriginal.value = true;
  editTitle.value = localNote.value.title;
  editContent.value = localNote.value.content;
};

const startEditingProcessed = () => {
  editingProcessed.value = true;
  editProcessedContent.value = localNote.value.processedContent || "";
};

const cancelEditingOriginal = () => {
  editingOriginal.value = false;
  editTitle.value = localNote.value.title;
  editContent.value = localNote.value.content;
};

const cancelEditingProcessed = () => {
  editingProcessed.value = false;
  editProcessedContent.value = localNote.value.processedContent || "";
};

const saveOriginal = async () => {
  if (!editTitle.value.trim() || !editContent.value.trim()) return;

  isLoading.value = true;
  errorMessage.value = "";

  try {
    const result = await handleUpdateNote(props.note.id, {
      title: editTitle.value,
      content: editContent.value,
    });

    if (result.success) {
      // Update local note immediately for UI responsiveness
      localNote.value = {
        ...localNote.value,
        title: result.note.title,
        content: result.note.content,
        updatedAt: result.note.updatedAt,
      };

      // Emit to parent for data consistency
      emit("noteUpdated", result.note);
      editingOriginal.value = false;
      successMessage.value = result.message;

      setTimeout(() => {
        successMessage.value = "";
      }, 3000);
    } else {
      errorMessage.value = result.error;
    }
  } catch (error) {
    errorMessage.value = "Could not save changes";
  } finally {
    isLoading.value = false;
  }
};

const saveProcessed = async () => {
  if (!editProcessedContent.value.trim()) return;

  isLoading.value = true;
  errorMessage.value = "";

  try {
    const result = await handleUpdateNote(props.note.id, {
      processedContent: editProcessedContent.value,
    });

    if (result.success) {
      // Update local note immediately for UI responsiveness
      localNote.value = {
        ...localNote.value,
        processedContent: result.note.processedContent,
        updatedAt: result.note.updatedAt,
      };

      // Emit to parent for data consistency
      emit("noteUpdated", result.note);
      editingProcessed.value = false;
      successMessage.value = result.message;

      setTimeout(() => {
        successMessage.value = "";
      }, 3000);
    } else {
      errorMessage.value = result.error;
    }
  } catch (error) {
    errorMessage.value = "Could not save changes";
  } finally {
    isLoading.value = false;
  }
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

const confirmDelete = async () => {
  isDeleting.value = true;
  deleteError.value = "";

  try {
    const result = await handleDeleteNote(props.note.id);

    if (result.success) {
      emit("noteDeleted", props.note.id);
      emit("close");
    } else {
      deleteError.value = result.error;
    }
  } catch (error) {
    deleteError.value = "Ett oväntat fel uppstod vid radering";
  } finally {
    isDeleting.value = false;
  }
};

const formatDate = (dateInput: string | Date) => {
  const date = dateInput instanceof Date ? dateInput : new Date(dateInput);
  return date.toLocaleDateString("sv-SE", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const getWordCount = (text: string) => {
  if (!text.trim()) return 0;
  return text.trim().split(/\s+/).length;
};

const getReadingTime = (text: string) => {
  const wordsPerMinute = 200;
  const wordCount = getWordCount(text);
  const minutes = Math.ceil(wordCount / wordsPerMinute);
  return Math.max(1, minutes);
};
</script>

<style scoped>
.note-viewer {
  background: rgba(15, 23, 42, 0.7);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.1);
  margin-bottom: 2rem;
  overflow: hidden;
}

.note-viewer-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 2rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
}

.header-left {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.header-icon {
  width: 48px;
  height: 48px;
  background: linear-gradient(135deg, #3b82f6, #8b5cf6);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  flex-shrink: 0;
}

.header-text h3 {
  color: #ffffff;
  font-size: 1.5rem;
  font-weight: 600;
  margin: 0 0 0.25rem 0;
  line-height: 1.3;
}

.header-text p {
  color: #94a3b8;
  margin: 0;
  font-size: 0.95rem;
}

.header-actions {
  display: flex;
  gap: 0.75rem;
}

.action-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  border: none;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 0.9rem;
}

.edit-btn {
  background: linear-gradient(135deg, #3b82f6, #8b5cf6);
  color: white;
}

.edit-btn:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}

.close-btn {
  background: rgba(255, 255, 255, 0.1);
  color: #4a5568;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.close-btn:hover {
  background: #edf2f7;
  border-color: rgba(255, 255, 255, 0.1);
}

.delete-btn {
  background: linear-gradient(135deg, #e53e3e 0%, #c53030 100%);
  color: white;
  margin-right: 0.5rem;
}

.delete-btn:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(229, 62, 62, 0.3);
}

.action-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.note-content {
  padding: 2rem;
}

.note-section {
  margin-bottom: 2rem;
}

.note-section:last-child {
  margin-bottom: 0;
}

.ai-section {
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  padding-top: 2rem;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.section-title svg {
  color: #667eea;
}

.section-title h4 {
  color: #ffffff;
  font-size: 1.25rem;
  font-weight: 600;
  margin: 0;
}

.ai-badge {
  background: linear-gradient(135deg, #ed8936 0%, #dd6b20 100%);
  color: white;
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.section-actions {
  display: flex;
  gap: 0.5rem;
}

.edit-section-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0.75rem;
  background: rgba(255, 255, 255, 0.1);
  color: #4a5568;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 6px;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.edit-section-btn:hover:not(:disabled) {
  background: #edf2f7;
  border-color: rgba(255, 255, 255, 0.1);
}

.edit-section-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.content-display {
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
  border-radius: 16px;
  padding: 2rem;
  border: 1px solid rgba(255, 255, 255, 0.1);
  transition: all 0.3s ease;
}

.content-display:hover {
  background: rgba(255, 255, 255, 0.08);
}

.ai-content {
  background: rgba(251, 146, 60, 0.1);
  backdrop-filter: blur(10px);
  border-left: 4px solid #f59e0b;
  border-radius: 16px;
}

.content-text {
  color: #ffffff;
  line-height: 1.7;
  font-size: 1rem;
  white-space: pre-wrap;
  margin-bottom: 1rem;
}

.ai-content .content-text {
  color: #fbbf24;
}

.content-meta {
  display: flex;
  gap: 1rem;
  color: #94a3b8;
  font-size: 0.875rem;
  padding-top: 1rem;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.edit-form {
  background: rgba(15, 23, 42, 0.7);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 1.5rem;
  border: 2px solid #667eea;
  box-shadow: 0 0 0 4px rgba(102, 126, 234, 0.1);
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group:last-of-type {
  margin-bottom: 0;
}

.form-label {
  display: block;
  color: #4a5568;
  font-weight: 600;
  margin-bottom: 0.5rem;
  font-size: 0.95rem;
}

.form-input,
.form-textarea {
  width: 100%;
  padding: 0.875rem;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  font-size: 1rem;
  transition: all 0.2s ease;
  background: rgba(255, 255, 255, 0.05);
  font-family: inherit;
  line-height: 1.6;
}

.form-input:focus,
.form-textarea:focus {
  outline: none;
  border-color: #667eea;
  background: rgba(15, 23, 42, 0.7);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.form-textarea {
  resize: vertical;
  min-height: 120px;
}

.form-actions {
  display: flex;
  gap: 0.75rem;
  margin-top: 1.5rem;
  padding-top: 1.5rem;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.save-btn,
.cancel-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  border: none;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 0.9rem;
}

.save-btn {
  background: linear-gradient(135deg, #48bb78 0%, #38a169 100%);
  color: white;
}

.save-btn:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(72, 187, 120, 0.3);
}

.save-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.cancel-btn {
  background: rgba(255, 255, 255, 0.1);
  color: #4a5568;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.cancel-btn:hover:not(:disabled) {
  background: #edf2f7;
  border-color: rgba(255, 255, 255, 0.1);
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
  border-radius: 16px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
  max-width: 480px;
  width: 90%;
  max-height: 90vh;
  overflow-y: auto;
  animation: modalSlideIn 0.3s ease-out;
}

@keyframes modalSlideIn {
  from {
    opacity: 0;
    transform: scale(0.9) translateY(-20px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.5rem 2rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.modal-header h3 {
  color: #ffffff;
  font-size: 1.25rem;
  font-weight: 600;
  margin: 0;
}

.modal-header .close-btn {
  padding: 0.5rem;
  background: transparent;
  border: none;
  color: #718096;
  cursor: pointer;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal-header .close-btn:hover {
  background: rgba(255, 255, 255, 0.1);
  color: #4a5568;
}

.modal-body {
  padding: 2rem;
  text-align: center;
}

.warning-icon {
  margin: 0 auto 1.5rem;
  color: #ed8936;
}

.modal-body h4 {
  color: #ffffff;
  font-size: 1.1rem;
  font-weight: 600;
  margin: 0 0 1rem 0;
}

.modal-body p {
  color: #4a5568;
  line-height: 1.6;
  margin: 0 0 1.5rem 0;
}

.modal-actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
  margin-top: 2rem;
}

.btn-secondary {
  padding: 0.75rem 1.5rem;
  background: rgba(255, 255, 255, 0.1);
  color: #4a5568;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.btn-secondary:hover:not(:disabled) {
  background: #edf2f7;
  border-color: rgba(255, 255, 255, 0.1);
}

.btn-danger {
  padding: 0.75rem 1.5rem;
  background: linear-gradient(135deg, #e53e3e 0%, #c53030 100%);
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.btn-danger:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(229, 62, 62, 0.3);
}

.btn-secondary:disabled,
.btn-danger:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.loading-spinner-small {
  width: 16px;
  height: 16px;
  border: 2px solid transparent;
  border-top: 2px solid currentColor;
  border-radius: 50%;
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

.error-message {
  background: rgba(239, 68, 68, 0.2);
  color: #c53030;
  padding: 1rem;
  border-radius: 8px;
  margin: 1rem 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9rem;
}

/* Responsive Design */
@media (max-width: 768px) {
  .note-viewer-header {
    flex-direction: column;
    gap: 1rem;
    align-items: flex-start;
  }

  .header-actions {
    width: 100%;
    justify-content: flex-end;
  }

  .note-content {
    padding: 1.5rem;
  }

  .section-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }

  .content-meta {
    flex-direction: column;
    gap: 0.5rem;
  }

  .form-actions {
    flex-direction: column;
  }
}
</style>
