<template>
  <div class="notes-container">
    <!-- Navigation Header -->
    <div class="notes-header">
      <h2>Notes</h2>
      <p class="subtitle">Create and manage your notes with AI support</p>
    </div>

    <!-- Main Navigation Tabs -->
    <div class="tabs">
      <button
        class="tab-btn"
        :class="{ active: activeTab === 'browse' }"
        @click="activeTab = 'browse'"
      >
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
        >
          <path
            d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"
          />
        </svg>
        Browse folders
      </button>
      <button
        class="tab-btn"
        :class="{ active: activeTab === 'create' }"
        @click="activeTab = 'create'"
      >
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
        >
          <path d="M12 5v14M5 12h14" />
        </svg>
        Create new
      </button>
      <button
        class="tab-btn"
        :class="{ active: activeTab === 'list' }"
        @click="activeTab = 'list'"
      >
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
        >
          <path d="M3 12h18m-9-6v12" />
          <path d="M8 6h13M8 12h13M8 18h13" />
        </svg>
        My notes ({{ notes.length }})
      </button>
    </div>

    <!-- Browse Folders Tab -->
    <div v-if="activeTab === 'browse'" class="tab-content">
      <NotesHub />
    </div>

    <!-- Create Note Tab -->
    <div v-if="activeTab === 'create'" class="tab-content">
      <div class="create-note-layout">
        <!-- Left Side - Form -->
        <div class="create-note-main">
          <div class="create-note-header">
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
              <h3>Create new note</h3>
              <p>Write your note and let AI help you process it</p>
            </div>
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

          <form @submit.prevent="handleSubmit" class="modern-form">
            <div class="form-row">
              <div class="input-wrapper">
                <label for="title" class="input-label">
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                  >
                    <path d="M4 6h16M4 12h16M4 18h7" />
                  </svg>
                  Title
                </label>
                <input
                  id="title"
                  type="text"
                  v-model="title"
                  placeholder="Enter a descriptive title for your note"
                  required
                  :disabled="isLoading"
                  class="modern-input"
                />
              </div>
            </div>

            <div class="form-row">
              <div class="input-wrapper">
                <label for="content" class="input-label">
                  <svg
                    width="16"
                    height="16"
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
                  Content
                </label>
                <div class="textarea-container">
                  <textarea
                    id="content"
                    v-model="content"
                    placeholder="Write your note here... You can use markdown format to structure the text."
                    rows="12"
                    maxlength="20000"
                    required
                    :disabled="isLoading"
                    class="modern-textarea"
                  ></textarea>
                  <div class="character-count">
                    <span :class="{ 'near-limit': content.length > 18000 }">
                      {{ content.length.toLocaleString() }}/20,000 characters
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div class="form-row">
              <div class="input-wrapper">
                <label class="input-label">
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                  >
                    <path
                      d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                    />
                  </svg>
                  AI Processing
                </label>
                <div class="ai-process-selector">
                  <button
                    type="button"
                    class="process-option"
                    :class="{ active: processType === 'none' }"
                    @click="processType = 'none'"
                    :disabled="isLoading"
                  >
                    <div class="option-icon">
                      <svg
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="2"
                      >
                        <circle cx="12" cy="12" r="10" />
                        <line x1="15" y1="9" x2="9" y2="15" />
                        <line x1="9" y1="9" x2="15" y2="15" />
                      </svg>
                    </div>
                    <div class="option-content">
                      <div class="option-title">No processing</div>
                      <div class="option-desc">Save the note as it is</div>
                    </div>
                  </button>

                  <button
                    type="button"
                    class="process-option"
                    :class="{ active: processType === 'summarize' }"
                    @click="processType = 'summarize'"
                    :disabled="isLoading"
                  >
                    <div class="option-icon summarize">
                      <svg
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="2"
                      >
                        <path d="M4 6h16M4 12h12M4 18h8" />
                      </svg>
                    </div>
                    <div class="option-content">
                      <div class="option-title">Summarize</div>
                      <div class="option-desc">
                        AI creates a shorter version
                      </div>
                    </div>
                  </button>

                  <button
                    type="button"
                    class="process-option"
                    :class="{ active: processType === 'expand' }"
                    @click="processType = 'expand'"
                    :disabled="isLoading"
                  >
                    <div class="option-icon expand">
                      <svg
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="2"
                      >
                        <path d="M3 12h18m-9-6v12" />
                        <path d="M8 6h13M8 12h13M8 18h13" />
                      </svg>
                    </div>
                    <div class="option-content">
                      <div class="option-title">Expand</div>
                      <div class="option-desc">
                        AI expands and improves the text
                      </div>
                    </div>
                  </button>
                </div>
                <p class="help-text">
                  AI can help you improve your note by summarizing or expanding
                  the content.
                </p>
              </div>

              <!-- Folder Selection -->
              <div class="form-group">
                <label for="folder-select">
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                  >
                    <path
                      d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"
                    />
                  </svg>
                  Folder
                </label>
                <select
                  id="folder-select"
                  v-model="selectedFolderId"
                  class="modern-select"
                >
                  <option :value="null">All Notes (No folder)</option>
                  <option
                    v-for="folder in noteFolders"
                    :key="folder.id"
                    :value="folder.id"
                  >
                    {{ folder.name }}
                  </option>
                </select>
                <p class="form-hint">
                  Choose a folder to organize your note, or leave unselected for
                  general collection.
                </p>
              </div>
            </div>

            <div class="form-actions">
              <button
                type="submit"
                class="primary-btn"
                :disabled="isLoading || !title.trim() || !content.trim()"
              >
                <svg
                  v-if="!isLoading"
                  width="20"
                  height="20"
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
                {{ isLoading ? "Processing..." : "Save note" }}
              </button>

              <button
                type="button"
                class="secondary-btn"
                @click="clearForm"
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
                </svg>
                Clear
              </button>
            </div>
          </form>
        </div>

        <!-- Right Side - Tips and Preview -->
        <div class="create-note-sidebar">
          <div class="tips-card">
            <div class="tips-header">
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
              <h4>Tips for good notes</h4>
            </div>
            <ul class="tips-list">
              <li>Use descriptive titles that make it easy to find later</li>
              <li>Structure the text with headings and paragraphs</li>
              <li>Include important keywords for better searchability</li>
              <li>Use AI processing to improve quality</li>
            </ul>
          </div>

          <div v-if="content.length > 10" class="preview-card">
            <div class="preview-header">
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
              >
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
              <h4>Preview</h4>
            </div>
            <div class="preview-content">
              <h5>{{ title || "Untitled" }}</h5>
              <p>{{ getPreviewText(content) }}</p>
            </div>
          </div>

          <div class="stats-card">
            <div class="stats-header">
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
              >
                <polyline points="22,12 18,12 15,21 9,3 6,12 2,12" />
              </svg>
              <h4>Statistics</h4>
            </div>
            <div class="stats-grid">
              <div class="stat-item">
                <span class="stat-value">{{ getWordCount(content) }}</span>
                <span class="stat-label">Words</span>
              </div>
              <div class="stat-item">
                <span class="stat-value">{{ content.length }}</span>
                <span class="stat-label">Characters</span>
              </div>
              <div class="stat-item">
                <span class="stat-value">{{ getReadingTime(content) }}</span>
                <span class="stat-label">Min reading</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- AI Processed Content -->
      <div v-if="processedContent" class="processed-result">
        <div class="processed-header">
          <div class="processed-icon">
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <path
                d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
              />
            </svg>
          </div>
          <div class="processed-text">
            <h3>AI-processed text</h3>
            <p>
              Your note has been processed by AI according to your preferences
            </p>
          </div>
        </div>
        <div class="processed-content-box">
          {{ processedContent }}
        </div>
      </div>
    </div>

    <!-- Notes List Tab -->
    <div v-if="activeTab === 'list'" class="tab-content">
      <!-- Note Viewer Component -->
      <NoteViewer
        v-if="selectedNote"
        :note="selectedNote"
        @close="closeNoteViewer"
        @noteUpdated="handleNoteUpdated"
        @noteDeleted="handleNoteDeleted"
      />

      <!-- Notes List -->
      <div v-else>
        <!-- Flashcard Generation Toolbar -->
        <div v-if="notes.length > 0" class="notes-toolbar">
          <div class="toolbar-left">
            <h3>Your Notes</h3>
            <p class="notes-count">{{ notes.length }} notes available</p>
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
              :disabled="notes.length === 0"
            >
              {{
                selectedNoteIds.length === notes.length
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
        <div v-if="loadingNotes" class="loading-state">
          <div class="loading-spinner"></div>
          <p>Laddar anteckningar...</p>
        </div>

        <div v-else-if="notes.length === 0" class="empty-state">
          <svg
            width="80"
            height="80"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="1"
          >
            <path
              d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"
            />
            <polyline points="14,2 14,8 20,8" />
            <line x1="16" y1="13" x2="8" y2="13" />
            <line x1="16" y1="17" x2="8" y2="17" />
            <line x1="10" y1="9" x2="8" y2="9" />
          </svg>
          <h3>Inga anteckningar än</h3>
          <p>
            Skapa din första anteckning genom att klicka på "Skapa ny" fliken.
          </p>
          <button class="create-first-btn" @click="activeTab = 'create'">
            Skapa din första anteckning
          </button>
        </div>

        <div v-else class="notes-grid">
          <div
            v-for="note in notes"
            :key="note.id"
            class="note-card"
            :class="{ selected: isNoteSelected(note.id) }"
          >
            <div class="note-selection">
              <label class="checkbox-container" @click.stop>
                <input
                  type="checkbox"
                  :checked="isNoteSelected(note.id)"
                  @change="toggleNoteSelection(note.id)"
                />
                <span class="checkmark"></span>
              </label>
            </div>
            <div class="note-content" @click="openNoteViewer(note)">
              <div class="note-card-header">
                <h3>{{ note.title }}</h3>
                <div class="note-date">
                  {{ formatRelativeDate(note.createdAt) }}
                </div>
              </div>
              <div class="note-preview">
                {{ getPreviewText(note.content) }}
              </div>
              <div class="note-card-footer">
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
                <div class="note-length">
                  {{ note.content.length }} characters
                </div>
              </div>
            </div>
          </div>
        </div>
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
          <div v-if="!generatingFlashcards && generatedFlashcards.length === 0">
            <p class="generation-info">
              Generate flashcards from {{ selectedNoteIds.length }} selected
              note{{ selectedNoteIds.length > 1 ? "s" : "" }}. AI will create
              questions and answers based on the most important content and
              categorize them.
            </p>

            <!-- Deck Selection -->
            <div class="form-group">
              <label for="deck-select">Add to Deck (Optional)</label>
              <select
                id="deck-select"
                v-model="selectedDeckId"
                class="deck-select"
              >
                <option :value="null">General Collection (No deck)</option>
                <option v-for="deck in decks" :key="deck.id" :value="deck.id">
                  {{ deck.name }}
                </option>
              </select>
              <p class="form-hint">
                Choose a deck to organize your flashcards, or leave unselected
                for general collection.
              </p>
            </div>

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
            <p>Generating flashcards with AI...</p>
            <p class="loading-subtitle">This may take a few moments</p>
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
import { ref, computed, onMounted } from "vue";
import {
  handleCreateNote,
  handleProcessNote,
  handleGetNotes,
} from "../services/handleNotes";
import { useAuth } from "../stores/auth";
import NoteViewer from "./NoteViewer.vue";
import NotesHub from "./NotesHub.vue";
import FlashcardService from "../services/FlashcardService";
import NoteFolderService from "../services/NoteFolderService";
import DeckService from "../services/DeckService";
import type { Note } from "../types/Note";
import type { Flashcard } from "../types/Flashcard";
import type { Deck } from "../types/Deck";
import type { NoteFolder } from "../types/NoteFolder";

const { getCurrentUserId } = useAuth();

// Create note form data
const title = ref("");
const content = ref("");
const processType = ref<"none" | "summarize" | "expand">("none");
const isLoading = ref(false);
const errorMessage = ref("");
const successMessage = ref("");
const processedContent = ref("");

// Notes list data
const activeTab = ref<"browse" | "create" | "list">("browse");
const notes = ref<Note[]>([]);
const loadingNotes = ref(false);
const selectedNote = ref<Note | null>(null);

// Flashcard generation data
const selectedNoteIds = ref<string[]>([]);
const showFlashcardModal = ref(false);
const generatingFlashcards = ref(false);
const generatedFlashcards = ref<Flashcard[]>([]);
const flashcardError = ref("");
const selectedDeckId = ref<string | null>(null);
const decks = ref<Deck[]>([]);

// Note folder data
const selectedFolderId = ref<string | null>(null);
const noteFolders = ref<NoteFolder[]>([]);

// Hämta användar-ID från auth store
const userId = computed(() => getCurrentUserId());

// Load notes and decks when component mounts
onMounted(async () => {
  await Promise.all([loadNotes(), loadDecks(), loadNoteFolders()]);
});

const loadNotes = async () => {
  if (!userId.value) return;

  loadingNotes.value = true;
  try {
    const result = await handleGetNotes(userId.value);
    if (result.success) {
      notes.value = result.notes.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    }
  } catch (error) {
    console.error("Fel vid laddning av anteckningar:", error);
  } finally {
    loadingNotes.value = false;
  }
};

const loadDecks = async () => {
  if (!userId.value) return;

  try {
    decks.value = await DeckService.getUserDecks(userId.value);
  } catch (error) {
    console.error("Error loading decks:", error);
  }
};

const loadNoteFolders = async () => {
  if (!userId.value) return;

  try {
    noteFolders.value = await NoteFolderService.getUserNoteFolders(
      userId.value
    );
  } catch (error) {
    console.error("Error loading note folders:", error);
  }
};

const handleSubmit = async () => {
  if (!userId.value) {
    errorMessage.value = "Du måste vara inloggad för att skapa anteckningar";
    return;
  }

  errorMessage.value = "";
  successMessage.value = "";
  isLoading.value = true;

  try {
    const result = await handleCreateNote({
      title: title.value,
      content: content.value,
      processType: processType.value,
      userId: userId.value,
      folderId: selectedFolderId.value || undefined,
    });

    if (result.success) {
      successMessage.value = result.message || "Anteckning skapad!";

      // Om AI-bearbetning valdes
      if (processType.value !== "none" && result.note) {
        const processResult = await handleProcessNote({
          noteId: result.note.id,
          processType: processType.value,
        });

        if (processResult.success && processResult.note) {
          processedContent.value = processResult.note.processedContent || "";
          successMessage.value += " AI-bearbetning klar!";
        }
      }

      // Clear form
      title.value = "";
      content.value = "";
      processType.value = "none";
      processedContent.value = "";
      selectedFolderId.value = null;

      // Reload notes and switch to list tab
      await loadNotes();
      activeTab.value = "list";
    } else {
      errorMessage.value = result.error || "Ett fel uppstod";
    }
  } catch (error) {
    errorMessage.value = "Ett oväntat fel uppstod";
  } finally {
    isLoading.value = false;
  }
};

const openNoteViewer = (note: Note) => {
  selectedNote.value = note;
};

const closeNoteViewer = () => {
  selectedNote.value = null;
};

const handleNoteUpdated = (updatedNote: Note) => {
  // Update the note in the notes array
  const index = notes.value.findIndex((note) => note.id === updatedNote.id);
  if (index !== -1) {
    notes.value[index] = updatedNote;
  }
};

const handleNoteDeleted = (deletedNoteId: string) => {
  // Remove the note from the notes array
  const index = notes.value.findIndex((note) => note.id === deletedNoteId);
  if (index !== -1) {
    notes.value.splice(index, 1);
  }
  // Close the note viewer since the note is deleted
  selectedNote.value = null;
  // Also remove from selected notes if it was selected
  const selectedIndex = selectedNoteIds.value.indexOf(deletedNoteId);
  if (selectedIndex !== -1) {
    selectedNoteIds.value.splice(selectedIndex, 1);
  }
};

const formatRelativeDate = (dateInput: string | Date) => {
  const date = dateInput instanceof Date ? dateInput : new Date(dateInput);
  const now = new Date();
  const diffInMinutes = Math.floor(
    (now.getTime() - date.getTime()) / (1000 * 60)
  );

  if (diffInMinutes < 1) return "Just now";
  if (diffInMinutes < 60) return `${diffInMinutes} min ago`;

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24)
    return `${diffInHours} hour${diffInHours > 1 ? "s" : ""} ago`;

  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7)
    return `${diffInDays} day${diffInDays > 1 ? "s" : ""} ago`;

  return date.toLocaleDateString("sv-SE", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

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

const clearForm = () => {
  title.value = "";
  content.value = "";
  processType.value = "none";
  processedContent.value = "";
  errorMessage.value = "";
  successMessage.value = "";
  selectedFolderId.value = null;
};

const getWordCount = (text: string) => {
  if (!text.trim()) return 0;
  return text.trim().split(/\s+/).length;
};

const getReadingTime = (text: string) => {
  const wordsPerMinute = 200;
  const wordCount = getWordCount(text);
  const minutes = Math.ceil(wordCount / wordsPerMinute);
  return minutes;
};

// Flashcard functions
const toggleNoteSelection = (noteId: string) => {
  const index = selectedNoteIds.value.indexOf(noteId);
  if (index > -1) {
    selectedNoteIds.value.splice(index, 1);
  } else {
    selectedNoteIds.value.push(noteId);
  }
};

const selectAllNotes = () => {
  if (selectedNoteIds.value.length === notes.value.length) {
    selectedNoteIds.value = [];
  } else {
    selectedNoteIds.value = notes.value.map((note) => note.id);
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
    const flashcards = await FlashcardService.generateFromNotes(
      selectedNoteIds.value,
      userId.value,
      selectedDeckId.value || undefined
    );
    generatedFlashcards.value = flashcards;

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
</script>

<style scoped>
.notes-container {
  padding: 2rem;
  background-color: #f8f9fa;
  min-height: 100vh;
}

.notes-header {
  margin-bottom: 2rem;
}

.notes-header h2 {
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

/* Tabs */
.tabs {
  display: flex;
  background: white;
  border-radius: 12px;
  padding: 0.5rem;
  margin-bottom: 2rem;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  gap: 0.5rem;
}

.tab-btn {
  flex: 1;
  padding: 1rem 1.5rem;
  border: none;
  background: transparent;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
  color: #718096;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.tab-btn:hover {
  background: #f7fafc;
  color: #4a5568;
}

.tab-btn.active {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.tab-btn svg {
  width: 20px;
  height: 20px;
}

/* Tab Content */
.tab-content {
  animation: fadeIn 0.3s ease-in;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Create Note Layout */
.create-note-layout {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 2rem;
  margin-bottom: 2rem;
}

.create-note-main {
  background: white;
  border-radius: 16px;
  padding: 2rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  border: 1px solid #e2e8f0;
}

.create-note-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 2rem;
  padding-bottom: 1.5rem;
  border-bottom: 1px solid #e2e8f0;
}

.header-icon {
  width: 48px;
  height: 48px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  flex-shrink: 0;
}

.header-text h3 {
  color: #2d3748;
  font-size: 1.5rem;
  font-weight: 600;
  margin: 0 0 0.25rem 0;
}

.header-text p {
  color: #718096;
  margin: 0;
  font-size: 0.95rem;
}

/* Modern Form Styles */
.modern-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.form-row {
  display: flex;
  flex-direction: column;
}

.input-wrapper {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.input-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #4a5568;
  font-weight: 600;
  font-size: 0.95rem;
}

.input-label svg {
  color: #667eea;
}

.modern-input,
.modern-select {
  width: 100%;
  padding: 1rem;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  font-size: 1rem;
  transition: all 0.2s ease;
  background: #fafafa;
}

.modern-input:focus,
.modern-select:focus {
  outline: none;
  border-color: #667eea;
  background: white;
  box-shadow: 0 0 0 4px rgba(102, 126, 234, 0.1);
}

.textarea-container {
  position: relative;
}

.modern-textarea {
  width: 100%;
  padding: 1rem;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  font-size: 1rem;
  resize: vertical;
  min-height: 200px;
  transition: all 0.2s ease;
  background: #fafafa;
  font-family: inherit;
  line-height: 1.6;
}

.modern-textarea:focus {
  outline: none;
  border-color: #667eea;
  background: white;
  box-shadow: 0 0 0 4px rgba(102, 126, 234, 0.1);
}

.character-count {
  display: flex;
  justify-content: flex-end;
  margin-top: 0.5rem;
  font-size: 0.875rem;
  color: #718096;
}

.character-count .near-limit {
  color: #e53e3e;
  font-weight: 600;
}

.help-text {
  color: #718096;
  font-size: 0.875rem;
  margin: 0;
  font-style: italic;
}

.form-actions {
  display: flex;
  gap: 1rem;
  margin-top: 1rem;
}

.primary-btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 1rem 1.5rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.primary-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(102, 126, 234, 0.3);
}

.primary-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.secondary-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 1rem 1.5rem;
  background: #f7fafc;
  color: #4a5568;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.secondary-btn:hover:not(:disabled) {
  background: #edf2f7;
  border-color: #cbd5e0;
}

.loading-spinner-small {
  width: 20px;
  height: 20px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top: 2px solid white;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

/* Sidebar Cards */
.create-note-sidebar {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.tips-card,
.preview-card,
.stats-card {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  border: 1px solid #e2e8f0;
}

.tips-header,
.preview-header,
.stats-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.tips-header h4,
.preview-header h4,
.stats-header h4 {
  color: #2d3748;
  font-size: 1rem;
  font-weight: 600;
  margin: 0;
}

.tips-header svg,
.preview-header svg,
.stats-header svg {
  color: #667eea;
}

.tips-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.tips-list li {
  padding: 0.5rem 0;
  color: #4a5568;
  font-size: 0.9rem;
  line-height: 1.5;
  border-bottom: 1px solid #f1f5f9;
  position: relative;
  padding-left: 1.5rem;
}

.tips-list li:last-child {
  border-bottom: none;
}

.tips-list li::before {
  content: "•";
  color: #667eea;
  position: absolute;
  left: 0;
  font-weight: bold;
}

.preview-content h5 {
  color: #2d3748;
  font-size: 1rem;
  font-weight: 600;
  margin: 0 0 0.5rem 0;
}

.preview-content p {
  color: #4a5568;
  font-size: 0.9rem;
  line-height: 1.5;
  margin: 0;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
}

.stat-item {
  text-align: center;
  padding: 0.75rem;
  background: #f8f9fa;
  border-radius: 8px;
}

.stat-value {
  display: block;
  color: #667eea;
  font-size: 1.25rem;
  font-weight: 700;
  margin-bottom: 0.25rem;
}

.stat-label {
  color: #718096;
  font-size: 0.75rem;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

/* Processed Result */
.processed-result {
  background: white;
  border-radius: 16px;
  padding: 2rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  border: 1px solid #e2e8f0;
  margin-top: 2rem;
}

.processed-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #e2e8f0;
}

.processed-icon {
  width: 40px;
  height: 40px;
  background: linear-gradient(135deg, #ed8936 0%, #dd6b20 100%);
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  flex-shrink: 0;
}

.processed-text h3 {
  color: #2d3748;
  font-size: 1.25rem;
  font-weight: 600;
  margin: 0 0 0.25rem 0;
}

.processed-text p {
  color: #718096;
  margin: 0;
  font-size: 0.9rem;
}

.processed-content-box {
  background: linear-gradient(135deg, #fef5e7 0%, #fed7aa 100%);
  padding: 1.5rem;
  border-radius: 12px;
  border-left: 4px solid #ed8936;
  white-space: pre-wrap;
  line-height: 1.7;
  color: #7c2d12;
  font-size: 1rem;
}

/* AI Process Selector */
.ai-process-selector {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-top: 0.5rem;
}

.process-option {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem 1.25rem;
  background: white;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
  text-align: left;
  font-family: inherit;
  width: 100%;
}

.process-option:hover {
  border-color: #cbd5e0;
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.process-option.active {
  border-color: #667eea;
  background: linear-gradient(135deg, #f7fafc 0%, #edf2f7 100%);
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.process-option:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.process-option:disabled:hover {
  border-color: #e2e8f0;
  transform: none;
  box-shadow: none;
}

.option-icon {
  width: 40px;
  height: 40px;
  background: #f7fafc;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #718096;
  transition: all 0.2s ease;
  flex-shrink: 0;
}

.process-option.active .option-icon {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.option-icon.summarize {
  background: #e6fffa;
  color: #319795;
}

.process-option.active .option-icon.summarize {
  background: linear-gradient(135deg, #319795 0%, #2c7a7b 100%);
  color: white;
}

.option-icon.expand {
  background: #fef5e7;
  color: #d69e2e;
}

.process-option.active .option-icon.expand {
  background: linear-gradient(135deg, #d69e2e 0%, #b7791f 100%);
  color: white;
}

.option-content {
  flex: 1;
}

.option-title {
  font-weight: 600;
  color: #2d3748;
  font-size: 1rem;
  margin-bottom: 0.25rem;
}

.option-desc {
  color: #718096;
  font-size: 0.875rem;
  line-height: 1.4;
}

.process-option.active .option-title {
  color: #667eea;
}

/* Enhanced Messages */
.error-message,
.success-message {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem 1.25rem;
  border-radius: 12px;
  margin-bottom: 1.5rem;
  font-weight: 500;
}

.error-message {
  background: linear-gradient(135deg, #fed7d7 0%, #fbb6ce 100%);
  color: #c53030;
  border-left: 4px solid #e53e3e;
}

.success-message {
  background: linear-gradient(135deg, #c6f6d5 0%, #9ae6b4 100%);
  color: #2f855a;
  border-left: 4px solid #38a169;
}

/* Responsive Design for Create Note */
@media (max-width: 1024px) {
  .create-note-layout {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }

  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .ai-process-selector {
    gap: 0.5rem;
  }

  .process-option {
    padding: 0.875rem 1rem;
    gap: 0.75rem;
  }

  .option-icon {
    width: 36px;
    height: 36px;
  }

  .option-title {
    font-size: 0.9rem;
  }

  .option-desc {
    font-size: 0.8rem;
  }
}

@media (max-width: 768px) {
  .create-note-main,
  .processed-result {
    padding: 1.5rem;
  }

  .create-note-header {
    flex-direction: column;
    align-items: flex-start;
    text-align: center;
  }

  .form-actions {
    flex-direction: column;
  }

  .stats-grid {
    grid-template-columns: 1fr;
  }

  .modern-input,
  .modern-textarea,
  .modern-select {
    padding: 0.875rem;
  }
}

/* Loading State */
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 2rem;
  color: #718096;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid #e2e8f0;
  border-top: 3px solid #667eea;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 1rem;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

/* Empty State */
.empty-state {
  text-align: center;
  padding: 4rem 2rem;
  color: #718096;
}

.empty-state svg {
  color: #cbd5e0;
  margin-bottom: 1.5rem;
}

.empty-state h3 {
  color: #4a5568;
  font-size: 1.5rem;
  margin: 0 0 1rem 0;
}

.empty-state p {
  margin: 0 0 2rem 0;
  font-size: 1rem;
}

.create-first-btn {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: transform 0.2s ease;
}

.create-first-btn:hover {
  transform: translateY(-2px);
}

/* Notes Grid */
.notes-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 1.5rem;
}

.note-card {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  transition: all 0.2s ease;
  border: 1px solid transparent;
}

.note-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
  border-color: #667eea;
}

.note-card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
}

.note-card-header h3 {
  color: #2d3748;
  font-size: 1.25rem;
  font-weight: 600;
  margin: 0;
  flex: 1;
  margin-right: 1rem;
  line-height: 1.3;
}

.note-date {
  color: #a0aec0;
  font-size: 0.875rem;
  white-space: nowrap;
}

.note-preview {
  color: #4a5568;
  line-height: 1.6;
  margin-bottom: 1rem;
  font-size: 0.9rem;
}

.note-card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.note-tags {
  display: flex;
  gap: 0.5rem;
}

.tag {
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 500;
}

.ai-tag {
  background: #e6fffa;
  color: #319795;
}

.processed-tag {
  background: #fef5e7;
  color: #d69e2e;
}

.note-length {
  color: #a0aec0;
  font-size: 0.75rem;
}

/* Messages */
.error-message {
  background-color: #fed7d7;
  color: #c53030;
  padding: 1rem;
  border-radius: 8px;
  margin-bottom: 1rem;
  border-left: 4px solid #e53e3e;
}

.success-message {
  background-color: #c6f6d5;
  color: #38a169;
  padding: 1rem;
  border-radius: 8px;
  margin-bottom: 1rem;
  border-left: 4px solid #48bb78;
}

/* Responsive Design */
@media (max-width: 768px) {
  .notes-container {
    padding: 1rem;
  }

  .notes-grid {
    grid-template-columns: 1fr;
  }

  .tab-btn {
    padding: 0.75rem 1rem;
    font-size: 0.875rem;
  }

  .tab-btn svg {
    width: 16px;
    height: 16px;
  }

  .notes-form,
  .processed-content {
    padding: 1.5rem;
  }

  .note-card {
    padding: 1rem;
  }

  .note-card-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }

  .note-card-header h3 {
    margin-right: 0;
  }
}

/* Flashcard Generation Styles */
.notes-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: white;
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  margin-bottom: 2rem;
}

.toolbar-left h3 {
  margin: 0;
  color: #2d3748;
  font-size: 1.25rem;
  font-weight: 600;
}

.notes-count {
  margin: 0.25rem 0 0 0;
  color: #718096;
  font-size: 0.875rem;
}

.toolbar-right {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.selection-info {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #4a5568;
  font-size: 0.875rem;
}

.flashcard-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.flashcard-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Note Card with Selection */
.note-card {
  position: relative;
  transition: all 0.2s ease;
}

.note-card.selected {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
  border: 2px solid #4299e1;
}

.note-selection {
  position: absolute;
  top: 1rem;
  left: 1rem;
  z-index: 2;
}

.checkbox-container {
  position: relative;
  display: block;
  cursor: pointer;
  font-size: 22px;
  user-select: none;
}

.checkbox-container input {
  position: absolute;
  opacity: 0;
  cursor: pointer;
  height: 0;
  width: 0;
}

.checkmark {
  position: absolute;
  top: 0;
  left: 0;
  height: 20px;
  width: 20px;
  background-color: #fff;
  border: 2px solid #e2e8f0;
  border-radius: 4px;
  transition: all 0.2s ease;
}

.checkbox-container:hover input ~ .checkmark {
  border-color: #4299e1;
}

.checkbox-container input:checked ~ .checkmark {
  background-color: #4299e1;
  border-color: #4299e1;
}

.checkmark:after {
  content: "";
  position: absolute;
  display: none;
}

.checkbox-container input:checked ~ .checkmark:after {
  display: block;
}

.checkbox-container .checkmark:after {
  left: 6px;
  top: 2px;
  width: 6px;
  height: 10px;
  border: solid white;
  border-width: 0 2px 2px 0;
  transform: rotate(45deg);
}

.note-content {
  cursor: pointer;
  padding-left: 3rem;
}

/* Modal Styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  border-radius: 12px;
  max-width: 800px;
  max-height: 90vh;
  width: 90%;
  overflow-y: auto;
  box-shadow: 0 20px 25px rgba(0, 0, 0, 0.1);
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
  color: #2d3748;
  font-size: 1.25rem;
  font-weight: 600;
}

.close-btn {
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 6px;
  color: #718096;
  transition: all 0.2s ease;
}

.close-btn:hover {
  background-color: #f7fafc;
  color: #2d3748;
}

.modal-body {
  padding: 1.5rem;
}

.generation-info {
  color: #4a5568;
  margin: 0 0 1.5rem 0;
  line-height: 1.6;
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

.deck-select {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 0.5rem;
  font-size: 1rem;
  background: white;
  color: #374151;
  transition: border-color 0.2s ease;
}

.deck-select:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.form-hint {
  font-size: 0.875rem;
  color: #64748b;
  margin: 0.5rem 0 0 0;
  line-height: 1.4;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 2rem;
}

.loading-subtitle {
  color: #718096;
  font-size: 0.875rem;
  margin: 0.5rem 0 0 0;
}

/* Flashcards Result */
.result-header {
  margin-bottom: 2rem;
}

.result-header h4 {
  margin: 0;
  color: #2d3748;
  font-size: 1.125rem;
  font-weight: 600;
}

.result-subtitle {
  margin: 0.5rem 0 0 0;
  color: #718096;
  font-size: 0.875rem;
}

.flashcards-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  max-height: 400px;
  overflow-y: auto;
}

.flashcard-preview {
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 1rem;
  background: #f7fafc;
}

.flashcard-categories {
  margin-bottom: 0.75rem;
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.category-tag {
  display: inline-block;
  background: #4299e1;
  color: white;
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.flashcard-content {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.flashcard-question,
.flashcard-answer {
  color: #2d3748;
  line-height: 1.5;
}

.flashcard-question strong,
.flashcard-answer strong {
  color: #4a5568;
  margin-right: 0.5rem;
}

/* Button Styles */
.btn-primary,
.btn-secondary {
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  border: none;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
}

.btn-primary {
  background: #4299e1;
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background: #3182ce;
}

.btn-primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-secondary {
  background: #f7fafc;
  color: #4a5568;
  border: 1px solid #e2e8f0;
}

.btn-secondary:hover {
  background: #edf2f7;
  border-color: #cbd5e0;
}

@media (max-width: 768px) {
  .notes-toolbar {
    flex-direction: column;
    align-items: stretch;
    gap: 1rem;
  }

  .toolbar-right {
    justify-content: space-between;
  }

  .modal-content {
    width: 95%;
    margin: 1rem;
  }

  .modal-actions {
    flex-direction: column;
  }

  .flashcards-list {
    max-height: 300px;
  }
}
</style>
