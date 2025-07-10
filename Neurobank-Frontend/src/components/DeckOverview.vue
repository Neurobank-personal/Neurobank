<template>
  <div class="deck-overview-container">
    <div class="deck-overview-header">
      <h2>Flashcard Decks</h2>
      <p class="subtitle">Organize your flashcards into themed collections</p>
      <button class="btn-primary" @click="showCreateDeckForm = true">
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
        Create New Deck
      </button>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="loading-state">
      <div class="loading-spinner"></div>
      <p>Loading your decks...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="error-state">
      <div class="error-icon">⚠️</div>
      <h3>Oops! Something went wrong</h3>
      <p>{{ error }}</p>
      <button class="retry-btn" @click="loadDecks">Try Again</button>
    </div>

    <!-- Decks Grid (Always shown with General Collection) -->
    <div v-else class="decks-grid">
      <!-- General Collection Card -->
      <div
        class="deck-card general-collection"
        @click="$emit('viewDeck', null)"
      >
        <div class="deck-header">
          <div class="deck-icon general-icon">
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
              <line x1="8" y1="21" x2="16" y2="21" />
              <line x1="12" y1="17" x2="12" y2="21" />
              <path d="M7 7h10M7 11h6" />
            </svg>
          </div>
          <div class="deck-actions">
            <span class="card-count">{{ generalFlashcardsCount }}</span>
          </div>
        </div>
        <div class="deck-content">
          <h3>General Collection</h3>
          <p>All your flashcards in one place</p>
        </div>
        <div class="deck-footer">
          <div class="deck-meta">
            <span class="last-studied">Always available</span>
          </div>
        </div>
      </div>

      <!-- Empty State Message (when no custom decks) -->
      <div v-if="decks.length === 0" class="empty-deck-message">
        <div class="empty-icon">
          <svg
            width="48"
            height="48"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="1.5"
          >
            <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
            <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
            <path d="M12 7v10" />
          </svg>
        </div>
        <h3>No custom decks yet</h3>
        <p>
          Create your first deck to organize your flashcards by topic or
          subject.
        </p>
        <button class="create-btn" @click="showCreateDeckForm = true">
          Create Your First Deck
        </button>
      </div>

      <!-- User's Custom Decks -->
      <div
        v-for="deck in decks"
        :key="deck.id"
        class="deck-card"
        :style="{ borderLeftColor: deck.color || '#6b7280' }"
        @click="$emit('viewDeck', deck.id)"
      >
        <div class="deck-header">
          <div
            class="deck-icon"
            :style="{ backgroundColor: deck.color || '#6b7280' }"
          >
            {{ deck.name.charAt(0).toUpperCase() }}
          </div>
          <div class="deck-actions">
            <button
              class="edit-btn"
              @click.stop="editDeck(deck)"
              title="Edit deck"
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
                <path d="m18.5 2.5 3 3L12 15l-4 1 1-4 9.5-9.5z" />
              </svg>
            </button>
            <button
              class="delete-btn"
              @click.stop="deleteDeck(deck.id)"
              title="Delete deck"
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
                  d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m3 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6h14zM10 11v6M14 11v6"
                />
              </svg>
            </button>
            <span class="card-count">{{ deck.flashcardCount || 0 }}</span>
          </div>
        </div>
        <div class="deck-content">
          <h3>{{ deck.name }}</h3>
          <p>{{ deck.description || "No description" }}</p>
        </div>
        <div class="deck-footer">
          <div class="deck-meta">
            <span class="deck-stats">{{ deck.flashcardCount || 0 }} cards</span>
            <span class="deck-date">{{ formatDate(deck.updatedAt) }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Create Deck Modal -->
    <div
      v-if="showCreateDeckForm"
      class="modal-overlay"
      @click="cancelCreateDeck"
    >
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>{{ editingDeck ? "Edit Deck" : "Create New Deck" }}</h3>
          <button class="close-btn" @click="cancelCreateDeck">&times;</button>
        </div>

        <form @submit.prevent="saveDeck" class="create-deck-form">
          <div class="form-group">
            <label>Deck Name</label>
            <input
              v-model="deckForm.name"
              type="text"
              placeholder="e.g. Psychology, Programming, History..."
              required
            />
          </div>

          <div class="form-group">
            <label>Description (Optional)</label>
            <textarea
              v-model="deckForm.description"
              placeholder="Brief description of what this deck covers..."
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
                :class="{ active: deckForm.color === color }"
                :style="{ backgroundColor: color }"
                @click="deckForm.color = color"
              ></div>
            </div>
          </div>

          <div class="form-actions">
            <button
              type="submit"
              class="save-btn"
              :disabled="!deckForm.name.trim()"
            >
              {{ editingDeck ? "Save Changes" : "Create Deck" }}
            </button>
            <button type="button" class="cancel-btn" @click="cancelCreateDeck">
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
import DeckService from "../services/DeckService";
import FlashcardService from "../services/FlashcardService";
import type { Deck } from "../types/Deck";

// Emits
defineEmits<{
  viewDeck: [deckId: string | null];
}>();

const { getCurrentUserId } = useAuth();

// Reactive data
const decks = ref<Deck[]>([]);
const loading = ref(true);
const error = ref("");
const showCreateDeckForm = ref(false);
const editingDeck = ref<Deck | null>(null);
const generalFlashcardsCount = ref(0);

const deckForm = ref({
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
  "#3b82f6",
  "#8b5cf6",
  "#ec4899",
];

const userId = computed(() => getCurrentUserId());

// Load data on mount
onMounted(async () => {
  await Promise.all([loadDecks(), loadGeneralFlashcardsCount()]);
});

const loadDecks = async () => {
  if (!userId.value) {
    error.value = "You must be logged in to view decks";
    loading.value = false;
    return;
  }

  try {
    loading.value = true;
    decks.value = await DeckService.getUserDecks(userId.value);
    error.value = "";
  } catch (err) {
    error.value = "Failed to load decks";
    console.error("Error loading decks:", err);
  } finally {
    loading.value = false;
  }
};

const loadGeneralFlashcardsCount = async () => {
  if (!userId.value) return;

  try {
    const flashcards = await FlashcardService.getUserFlashcards(userId.value);
    // Count ALL flashcards for the user (General Collection contains all cards)
    generalFlashcardsCount.value = flashcards.length;
  } catch (err) {
    console.error("Error loading general flashcards count:", err);
  }
};

const saveDeck = async () => {
  if (!userId.value || !deckForm.value.name.trim()) return;

  try {
    if (editingDeck.value) {
      // Update existing deck
      await DeckService.updateDeck({
        id: editingDeck.value.id,
        ...deckForm.value,
      });
    } else {
      // Create new deck
      await DeckService.createDeck({
        ...deckForm.value,
        userId: userId.value,
      });
    }

    await loadDecks();
    cancelCreateDeck();
  } catch (err) {
    console.error("Error saving deck:", err);
    error.value = "Failed to save deck";
  }
};

const editDeck = (deck: Deck) => {
  editingDeck.value = deck;
  deckForm.value = {
    name: deck.name,
    description: deck.description || "",
    color: deck.color || "",
  };
  showCreateDeckForm.value = true;
};

const deleteDeck = async (deckId: string) => {
  if (
    !confirm(
      "Are you sure you want to delete this deck? All flashcards in this deck will still be available in the general collection."
    )
  ) {
    return;
  }

  try {
    await DeckService.deleteDeck(deckId);
    await Promise.all([loadDecks(), loadGeneralFlashcardsCount()]);
  } catch (err) {
    console.error("Error deleting deck:", err);
    error.value = "Failed to delete deck";
  }
};

const cancelCreateDeck = () => {
  showCreateDeckForm.value = false;
  editingDeck.value = null;
  deckForm.value = {
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

.deck-overview-container {
  padding: 0;
  max-width: 1200px;
  margin: 0 auto;
  font-family: "Inter", sans-serif;
  background: transparent;
}

.deck-overview-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 3rem;
  flex-wrap: wrap;
  gap: 1rem;
}

.deck-overview-header h2 {
  font-size: 2.5rem;
  font-weight: 700;
  color: #ffffff;
  margin: 0;
  letter-spacing: -0.02em;
}

.subtitle {
  color: #94a3b8;
  margin: 0.5rem 0 0 0;
  font-size: 1.125rem;
  font-weight: 400;
}

.btn-primary {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: linear-gradient(135deg, #3b82f6, #8b5cf6);
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 0.75rem;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.3s ease;
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 20px rgba(102, 126, 234, 0.4);
}

/* Loading and Error States */
.loading-state,
.error-state,
.empty-state {
  text-align: center;
  padding: 4rem 2rem;
}

.empty-deck-message {
  grid-column: 1 / -1;
  text-align: center;
  padding: 4rem 2rem;
  background: rgba(15, 23, 42, 0.7);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 24px;
  margin-top: 1.5rem;
  color: #94a3b8;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-top: 4px solid #667eea;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 1rem;
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
  color: #94a3b8;
  display: flex;
  justify-content: center;
  align-items: center;
}

.empty-icon svg {
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1));
}

.retry-btn,
.create-btn {
  background: #667eea;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 0.5rem;
  cursor: pointer;
  font-weight: 500;
  margin-top: 1rem;
}

/* Decks Grid */
.decks-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
  margin-top: 2rem;
}

.deck-card {
  background: rgba(15, 23, 42, 0.7);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 24px;
  padding: 2rem;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.deck-card::before {
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

.deck-card:hover::before {
  opacity: 1;
}

.deck-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 20px 40px rgba(59, 130, 246, 0.2);
  border-color: rgba(59, 130, 246, 0.3);
}

.deck-card.general-collection {
  background: rgba(15, 23, 42, 0.8);
  border-color: rgba(59, 130, 246, 0.2);
}

.deck-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.deck-icon {
  width: 48px;
  height: 48px;
  border-radius: 0.75rem;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  background: rgba(255, 255, 255, 0.05);
}

.deck-icon.general-icon {
  background: linear-gradient(135deg, #3b82f6, #8b5cf6);
  color: white;
}

.deck-icon.general-icon svg {
  filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.1));
}

.deck-actions {
  display: flex;
  gap: 0.5rem;
  align-items: center;
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
  background: rgba(255, 255, 255, 0.05);
  color: #334155;
}

.action-btn.delete:hover {
  color: #ef4444;
  background: rgba(239, 68, 68, 0.1);
}

.card-count {
  background: #667eea;
  color: white;
  padding: 0.25rem 0.75rem;
  border-radius: 1rem;
  font-size: 0.875rem;
  font-weight: 500;
}

.deck-content h3 {
  font-size: 1.25rem;
  font-weight: 600;
  color: #ffffff;
  margin: 0 0 0.5rem 0;
}

.deck-content p {
  color: #94a3b8;
  margin: 0;
  font-size: 0.875rem;
  line-height: 1.4;
}

.deck-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 1rem;
  font-size: 0.875rem;
  color: #94a3b8;
}

/* Modal Styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
}

.modal-content {
  background: rgba(15, 23, 42, 0.7);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 1rem;
  width: 100%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
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
  background: rgba(255, 255, 255, 0.05);
}

.create-deck-form {
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
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
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
  border-color: rgba(255, 255, 255, 0.3);
  transform: scale(1.1);
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

/* Responsive Design */
@media (max-width: 768px) {
  .deck-overview-container {
    padding: 1rem;
  }

  .deck-overview-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .decks-grid {
    grid-template-columns: 1fr;
  }

  .modal-overlay {
    padding: 0.5rem;
  }
}
</style>
