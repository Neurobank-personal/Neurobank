<template>
  <div class="deck-view-container">
    <!-- Deck Header -->
    <div class="deck-header">
      <div class="deck-info">
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
          Back to Decks
        </button>

        <div class="deck-title-section">
          <div
            class="deck-icon"
            :style="{
              backgroundColor: deck?.color || 'var(--beige)',
              color: 'white',
            }"
          >
            {{ deckId ? deck?.name?.charAt(0)?.toUpperCase() || "G" : "G" }}
          </div>
          <div>
            <h2>{{ deck?.name || "General Collection" }}</h2>
            <p class="deck-description">
              {{ deck?.description || "All your flashcards in one place" }}
            </p>
          </div>
        </div>
      </div>

      <div class="deck-actions">
        <button
          v-if="flashcards.length > 0"
          class="btn-primary study-btn"
          @click="startStudyMode"
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
          {{ remainingFlashcards.length > 0 ? "Study Mode" : "Study Complete" }}
        </button>

        <button class="btn-secondary" @click="refreshReviews">
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
            <path d="M21 3v5h-5" />
            <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
            <path d="M3 21v-5h5" />
          </svg>
          Refresh Reviews
        </button>

        <button class="btn-secondary" @click="showCreateForm = true">
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
          Add Card
        </button>
      </div>
    </div>

    <!-- Stats -->
    <div class="deck-stats">
      <div class="stat-card" @click="setFilter('all')">
        <div class="stat-number">{{ totalCards }}</div>
        <div class="stat-label">Total cards</div>
      </div>
      <div class="stat-card" @click="setFilter('completed')">
        <div class="stat-number">{{ completedCards }}</div>
        <div class="stat-label">Completed</div>
      </div>
      <div class="stat-card" @click="setFilter('remaining')">
        <div class="stat-number">{{ remainingCards }}</div>
        <div class="stat-label">Remaining</div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="loading-state">
      <div class="loading-spinner"></div>
      <p>Loading flashcards...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="error-state">
      <div class="error-icon">⚠️</div>
      <h3>Oops! Something went wrong</h3>
      <p>{{ error }}</p>
      <button class="retry-btn" @click="loadFlashcards">Try Again</button>
    </div>

    <!-- Study Mode -->
    <StudyMode
      v-else-if="studyMode"
      :flashcards="remainingFlashcards"
      :deckName="deck?.name || 'General Collection'"
      @exit="exitStudyMode"
      @markCard="handleMarkCard"
      @markCardCustom="handleMarkCardCustom"
    />

    <!-- Cards List View -->
    <div v-else-if="flashcards.length === 0" class="empty-state">
      <div class="empty-icon">📚</div>
      <h3>No flashcards in this {{ deckId ? "deck" : "collection" }} yet</h3>
      <p>Add some flashcards to get started with studying.</p>
      <button class="create-btn" @click="showCreateForm = true">
        Add Your First Card
      </button>
    </div>

    <div v-else-if="filteredFlashcards.length === 0" class="empty-state">
      <div class="empty-icon">🔍</div>
      <h3>No cards match the current filter</h3>
      <button class="btn-secondary" @click="setFilter('all')">
        Show All Cards
      </button>
    </div>

    <div v-else class="flashcards-list">
      <div class="list-header">
        <h3>
          <span v-if="cardFilter === 'all'">All Cards</span>
          <span v-else-if="cardFilter === 'completed'">Completed Cards</span>
          <span v-else-if="cardFilter === 'remaining'">Remaining Cards</span>
          ({{ filteredFlashcards.length }})
        </h3>
      </div>

      <div class="flashcards-grid">
        <div
          v-for="card in filteredFlashcards"
          :key="card.id"
          class="flashcard-item"
        >
          <div class="flashcard-item-header">
            <div class="flashcard-categories">
              <span
                v-for="category in card.categories"
                :key="category"
                class="category-tag-small"
              >
                {{ category }}
              </span>
            </div>
            <div class="flashcard-actions">
              <button
                v-if="card.status === 'completed'"
                class="action-btn reset"
                @click="resetCardToRemaining(card.id.toString())"
                title="Reset to Remaining"
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
                    d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"
                  />
                  <path d="M21 3v5h-5" />
                  <path
                    d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"
                  />
                  <path d="M3 21v-5h5" />
                </svg>
              </button>
              <button
                class="action-btn edit"
                @click="editCard(card)"
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
                @click="deleteCard(card.id)"
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
          <div class="flashcard-item-content">
            <div class="question"><strong>Q:</strong> {{ card.question }}</div>
            <div class="answer"><strong>A:</strong> {{ card.answer }}</div>
          </div>
          <div class="flashcard-item-footer">
            <div class="status-info">
              <span
                v-if="card.difficulty"
                class="difficulty-badge"
                :class="card.difficulty"
              >
                {{ card.difficulty }}
              </span>
              <span
                v-if="card.status === 'completed'"
                class="status-badge completed"
              >
                ✓ Completed
              </span>
              <span v-else class="status-badge remaining">
                📚 Ready to study
              </span>
            </div>
            <div v-if="card.nextReviewDate" class="review-info">
              <span class="next-review">
                Next: {{ formatDate(card.nextReviewDate) }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Create/Edit Card Modal -->
    <div
      v-if="showCreateForm || showEditForm"
      class="modal-overlay"
      @click="cancelForm"
    >
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>{{ showEditForm ? "Edit Card" : "Add New Card" }}</h3>
          <button class="close-btn" @click="cancelForm">&times;</button>
        </div>

        <form @submit.prevent="saveCard" class="card-form">
          <div class="form-group">
            <label>Question</label>
            <textarea
              v-model="cardForm.question"
              placeholder="Write your question here..."
              rows="3"
              required
            ></textarea>
          </div>

          <div class="form-group">
            <label>Answer</label>
            <textarea
              v-model="cardForm.answer"
              placeholder="Write the answer here..."
              rows="3"
              required
            ></textarea>
          </div>

          <div class="form-group">
            <label>Categories</label>
            <div class="categories-input">
              <div class="selected-categories">
                <span
                  v-for="category in cardForm.categories"
                  :key="category"
                  class="category-tag"
                >
                  {{ category }}
                  <button
                    type="button"
                    @click="removeCategory(category)"
                    class="remove-category"
                  >
                    ×
                  </button>
                </span>
              </div>
              <div class="add-category">
                <input
                  v-model="newCategoryInput"
                  type="text"
                  placeholder="Add category..."
                  @keyup.enter="addCategory"
                />
                <button type="button" @click="addCategory">Add</button>
              </div>
            </div>
          </div>

          <div class="form-actions">
            <button type="submit" class="save-btn" :disabled="!isFormValid">
              {{ showEditForm ? "Save Changes" : "Add Card" }}
            </button>
            <button type="button" class="cancel-btn" @click="cancelForm">
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from "vue";
import { useAuth } from "../stores/auth";
import FlashcardService from "../services/FlashcardService";
import DeckService from "../services/DeckService";
import StudyMode from "./StudyMode.vue";
import type { Flashcard } from "../types/Flashcard";
import type { Deck } from "../types/Deck";

// Props and Emits
const props = defineProps<{
  deckId: string | null;
}>();

defineEmits<{
  goBack: [];
}>();

const { getCurrentUserId } = useAuth();

// Reactive data
const deck = ref<Deck | null>(null);
const flashcards = ref<Flashcard[]>([]);
const loading = ref(true);
const error = ref("");
const studyMode = ref(false);
const cardFilter = ref<"all" | "completed" | "remaining">("all");
const showCreateForm = ref(false);
const showEditForm = ref(false);
const editingCard = ref<Flashcard | null>(null);
const newCategoryInput = ref("");

const cardForm = ref({
  question: "",
  answer: "",
  categories: [] as string[],
});

const userId = computed(() => getCurrentUserId());

// Computed values
const totalCards = computed(() => flashcards.value.length);
const completedCards = computed(
  () => flashcards.value.filter((card) => card.status === "completed").length
);
const remainingCards = computed(
  () =>
    flashcards.value.filter(
      (card) => card.status === "remaining" || !card.status
    ).length
);

const remainingFlashcards = computed(() =>
  flashcards.value.filter((card) => card.status === "remaining" || !card.status)
);

const filteredFlashcards = computed(() => {
  switch (cardFilter.value) {
    case "completed":
      return flashcards.value.filter((card) => card.status === "completed");
    case "remaining":
      return flashcards.value.filter(
        (card) => card.status === "remaining" || !card.status
      );
    default:
      return flashcards.value;
  }
});

const isFormValid = computed(
  () =>
    cardForm.value.question.trim().length > 0 &&
    cardForm.value.answer.trim().length > 0
);

// Load data on mount and when deckId changes
onMounted(() => {
  loadData();
});

watch(
  () => props.deckId,
  () => {
    loadData();
  }
);

const loadData = async () => {
  await Promise.all([loadDeck(), loadFlashcards()]);
};

const loadDeck = async () => {
  if (!props.deckId) {
    deck.value = null;
    return;
  }

  try {
    deck.value = await DeckService.getDeck(props.deckId);
  } catch (err) {
    console.error("Error loading deck:", err);
  }
};

const loadFlashcards = async () => {
  if (!userId.value) {
    error.value = "You must be logged in to view flashcards";
    loading.value = false;
    return;
  }

  try {
    loading.value = true;

    if (props.deckId) {
      flashcards.value = await DeckService.getDeckFlashcards(props.deckId);
    } else {
      // Load general collection (ALL flashcards for the user)
      flashcards.value = await FlashcardService.getUserFlashcards(userId.value);
    }

    error.value = "";
  } catch (err) {
    error.value = "Failed to load flashcards";
    console.error("Error loading flashcards:", err);
  } finally {
    loading.value = false;
  }
};

// Study Mode Functions
const startStudyMode = () => {
  studyMode.value = true;
};

const exitStudyMode = () => {
  studyMode.value = false;
};

const refreshReviews = async () => {
  if (!userId.value) return;

  try {
    loading.value = true;
    const result = await FlashcardService.refreshReviews(userId.value);

    // Reload flashcards to get updated status
    await loadFlashcards();

    if (result.movedCount > 0) {
      // Show success message
      alert(`🎉 ${result.movedCount} kort är redo för repetition igen!`);
    } else {
      alert("Inga kort är redo för repetition just nu.");
    }
  } catch (err) {
    console.error("Error refreshing reviews:", err);
    error.value = "Failed to refresh reviews";
  } finally {
    loading.value = false;
  }
};

const handleMarkCard = async (
  difficulty: "easy" | "medium" | "hard",
  cardId: string
) => {
  if (!userId.value) return;

  try {
    const updatedCard = await FlashcardService.markCardReviewed(
      cardId,
      difficulty
    );

    // Update the specific card in the local array
    const cardIndex = flashcards.value.findIndex(
      (card) => card.id.toString() === cardId
    );
    if (cardIndex !== -1) {
      flashcards.value[cardIndex] = updatedCard;
    }
  } catch (err) {
    console.error("Error marking card:", err);
    error.value = "Failed to mark card as reviewed";
  }
};

const handleMarkCardCustom = async (
  days: number,
  timeUnit: "days" | "months",
  cardId: string
) => {
  if (!userId.value) return;

  try {
    const updatedCard = await FlashcardService.markCardCustomReview(
      cardId,
      days,
      timeUnit
    );

    // Update the specific card in the local array
    const cardIndex = flashcards.value.findIndex(
      (card) => card.id.toString() === cardId
    );
    if (cardIndex !== -1) {
      flashcards.value[cardIndex] = updatedCard;
    }
  } catch (err) {
    console.error("Error marking card with custom review:", err);
    error.value = "Failed to mark card with custom review";
  }
};

const resetCardToRemaining = async (cardId: string) => {
  if (!userId.value) return;

  try {
    const updatedCard = await FlashcardService.resetCardToRemaining(cardId);

    // Update the specific card in the local array
    const cardIndex = flashcards.value.findIndex(
      (card) => card.id.toString() === cardId
    );
    if (cardIndex !== -1) {
      flashcards.value[cardIndex] = updatedCard;
    }
  } catch (err) {
    console.error("Error resetting card to remaining:", err);
    error.value = "Failed to reset card to remaining";
  }
};

// Filter Functions
const setFilter = (filter: "all" | "completed" | "remaining") => {
  cardFilter.value = filter;
};

// Card CRUD Functions
const saveCard = async () => {
  if (!userId.value || !isFormValid.value) return;

  try {
    const cardData = {
      question: cardForm.value.question.trim(),
      answer: cardForm.value.answer.trim(),
      categories: cardForm.value.categories,
      userId: userId.value,
      deckId: props.deckId || undefined,
    };

    if (showEditForm.value && editingCard.value) {
      await FlashcardService.updateFlashcard(
        editingCard.value.id.toString(),
        cardData
      );
    } else {
      await FlashcardService.createFlashcard(cardData);
    }

    await loadFlashcards();
    cancelForm();
  } catch (err) {
    console.error("Error saving card:", err);
    error.value = "Failed to save card";
  }
};

const editCard = (card: Flashcard) => {
  editingCard.value = card;
  cardForm.value = {
    question: card.question,
    answer: card.answer,
    categories: Array.isArray(card.categories)
      ? [...card.categories]
      : [card.categories],
  };
  showEditForm.value = true;
};

const deleteCard = async (cardId: number) => {
  if (!confirm("Are you sure you want to delete this card?")) return;

  try {
    await FlashcardService.deleteFlashcard(cardId.toString());
    await loadFlashcards();
  } catch (err) {
    console.error("Error deleting card:", err);
    error.value = "Failed to delete card";
  }
};

const cancelForm = () => {
  showCreateForm.value = false;
  showEditForm.value = false;
  editingCard.value = null;
  cardForm.value = {
    question: "",
    answer: "",
    categories: [],
  };
  newCategoryInput.value = "";
};

// Category Functions
const addCategory = () => {
  const category = newCategoryInput.value.trim();
  if (category && !cardForm.value.categories.includes(category)) {
    cardForm.value.categories.push(category);
    newCategoryInput.value = "";
  }
};

const removeCategory = (category: string) => {
  const index = cardForm.value.categories.indexOf(category);
  if (index > -1) {
    cardForm.value.categories.splice(index, 1);
  }
};

const formatDate = (date: Date) => {
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  if (date.toDateString() === today.toDateString()) {
    return "Today";
  } else if (date.toDateString() === tomorrow.toDateString()) {
    return "Tomorrow";
  } else if (date < today) {
    return "Overdue";
  } else {
    const diffTime = date.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return `${diffDays} days`;
  }
};
</script>

<style scoped>
@import url("https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap");

.deck-view-container {
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
  font-family: "Inter", sans-serif;
  background: transparent;
  color: #ffffff;
  min-height: 100vh;
}

/* Header Styles */
.deck-header {
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
  gap: 0.75rem;
  background: rgba(15, 23, 42, 0.7);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: #ffffff;
  padding: 0.75rem 1.25rem;
  border-radius: 12px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.3s ease;
  margin-bottom: 1rem;
}

.back-btn:hover {
  background: rgba(162, 175, 155, 0.2);
  border-color: rgba(162, 175, 155, 0.3);
  transform: translateY(-2px);
}

.deck-title-section {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.deck-icon {
  width: 48px;
  height: 48px;
  border-radius: 0.75rem;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  border: 2px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  font-weight: 600;
}

.deck-icon:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.15);
}

.deck-title-section h2 {
  font-size: 1.75rem;
  font-weight: 700;
  color: var(--sage);
  margin: 0;
}

.deck-description {
  color: var(--text-medium);
  margin: 0.25rem 0 0 0;
  font-size: 1rem;
}

.deck-actions {
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
  background: linear-gradient(135deg, var(--sage), var(--accent));
  color: white;
  font-weight: 600;
  box-shadow: 0 4px 16px rgba(162, 175, 155, 0.3);
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 32px rgba(162, 175, 155, 0.4);
}

.btn-secondary {
  background: linear-gradient(135deg, var(--sage), var(--accent));
  color: white;
  border: none;
  font-weight: 600;
  box-shadow: 0 4px 16px rgba(162, 175, 155, 0.3);
}

.btn-secondary:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 32px rgba(162, 175, 155, 0.4);
}

/* Stats */
.deck-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
}

.stat-card {
  background: linear-gradient(
    135deg,
    var(--cream) 0%,
    rgba(255, 255, 255, 0.9) 100%
  );
  border: 2px solid var(--beige);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  border-radius: 1rem;
  padding: 1.5rem;
  text-align: center;
  cursor: pointer;
  transition: all 0.2s ease;
}

.stat-card:hover {
  border-color: var(--sage);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.15);
  transform: translateY(-2px);
}

.stat-number {
  font-size: 2rem;
  font-weight: 700;
  color: var(--sage);
  margin-bottom: 0.5rem;
}

.stat-label {
  color: var(--text-medium);
  font-size: 0.875rem;
  font-weight: 500;
}

/* Cards List */
.flashcards-list {
  background: linear-gradient(
    135deg,
    var(--cream) 0%,
    rgba(255, 255, 255, 0.9) 100%
  );
  border: 2px solid var(--beige);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  border-radius: 1rem;
  padding: 2rem;
}

.list-header {
  margin-bottom: 1.5rem;
}

.list-header h3 {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--sage);
}

.flashcards-grid {
  display: grid;
  gap: 1rem;
}

.flashcard-item {
  background: linear-gradient(
    135deg,
    rgba(255, 255, 255, 0.9) 0%,
    var(--light-gray) 100%
  );
  border: 1px solid var(--beige);
  border-radius: 0.75rem;
  padding: 1.5rem;
  transition: all 0.2s ease;
}

.flashcard-item:hover {
  border-color: var(--sage);
  box-shadow: 0 4px 12px rgba(162, 175, 155, 0.2);
  transform: translateY(-1px);
}

.flashcard-item-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.flashcard-categories {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.category-tag-small {
  background: #e2e8f0;
  color: #94a3b8;
  padding: 0.25rem 0.5rem;
  border-radius: 0.5rem;
  font-size: 0.75rem;
  font-weight: 500;
}

.flashcard-actions {
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
  background: rgba(162, 175, 155, 0.1);
  color: var(--text-dark);
}

.action-btn.delete:hover {
  color: #ef4444;
  background: rgba(239, 68, 68, 0.1);
}

.action-btn.reset:hover {
  color: var(--sage);
  background: rgba(162, 175, 155, 0.15);
}

.flashcard-item-content {
  margin-bottom: 1rem;
}

.question,
.answer {
  margin-bottom: 0.75rem;
  line-height: 1.5;
  color: var(--text-dark);
}

.question strong,
.answer strong {
  color: var(--sage);
}

.flashcard-item-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 0.5rem;
}

.status-info {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}

.review-info {
  font-size: 0.75rem;
  color: var(--text-medium);
}

.next-review {
  font-weight: 500;
}

.difficulty-badge {
  padding: 0.25rem 0.5rem;
  border-radius: 0.5rem;
  font-size: 0.75rem;
  font-weight: 500;
  color: white;
}

.difficulty-badge.easy {
  background: #22c55e;
}
.difficulty-badge.medium {
  background: #eab308;
}
.difficulty-badge.hard {
  background: #ef4444;
}

.status-badge {
  padding: 0.25rem 0.5rem;
  border-radius: 0.5rem;
  font-size: 0.75rem;
  font-weight: 500;
}

.status-badge.completed {
  background: #22c55e;
  color: white;
}

.status-badge.remaining {
  background: var(--sage);
  color: white;
}

/* States */
.loading-state,
.error-state,
.empty-state {
  text-align: center;
  padding: 4rem 2rem;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-top: 4px solid var(--sage);
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
}

.retry-btn,
.create-btn {
  background: var(--sage);
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 0.5rem;
  cursor: pointer;
  font-weight: 600;
  margin-top: 1rem;
  box-shadow: 0 4px 16px rgba(162, 175, 155, 0.3);
  transition: all 0.3s ease;
}

.retry-btn:hover,
.create-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 32px rgba(162, 175, 155, 0.4);
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
  background: linear-gradient(
    135deg,
    var(--cream) 0%,
    rgba(255, 255, 255, 0.95) 100%
  );
  border: 2px solid var(--beige);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
  border-radius: 1rem;
  width: 100%;
  max-width: 600px;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid var(--beige);
}

.modal-header h3 {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--sage);
}

.close-btn {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: var(--text-medium);
  padding: 0;
  width: 2rem;
  height: 2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 0.5rem;
}

.close-btn:hover {
  background: rgba(162, 175, 155, 0.1);
  color: var(--text-dark);
}

.card-form {
  padding: 1.5rem;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: var(--text-dark);
}

.form-group input,
.form-group textarea {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid var(--beige);
  border-radius: 0.5rem;
  font-size: 1rem;
  transition: border-color 0.2s ease;
  font-family: inherit;
  background: rgba(255, 255, 255, 0.9);
  color: var(--text-dark);
}

.form-group input:focus,
.form-group textarea:focus {
  outline: none;
  border-color: var(--sage);
  box-shadow: 0 0 0 3px rgba(162, 175, 155, 0.1);
}

.categories-input {
  border: 1px solid var(--beige);
  border-radius: 0.5rem;
  padding: 0.75rem;
  background: rgba(255, 255, 255, 0.9);
}

.selected-categories {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
  margin-bottom: 0.75rem;
}

.selected-categories .category-tag {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.remove-category {
  background: none;
  border: none;
  color: white;
  cursor: pointer;
  font-size: 1rem;
  padding: 0;
  line-height: 1;
}

.add-category {
  display: flex;
  gap: 0.5rem;
}

.add-category input {
  flex: 1;
  border: 1px solid var(--beige);
  border-radius: 0.25rem;
  padding: 0.5rem;
  background: rgba(255, 255, 255, 0.9);
  color: var(--text-dark);
}

.add-category button {
  background: var(--sage);
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 0.25rem;
  cursor: pointer;
  font-size: 0.875rem;
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
  font-weight: 600;
  box-shadow: 0 4px 16px rgba(162, 175, 155, 0.3);
  transition: all 0.3s ease;
}

.save-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 32px rgba(162, 175, 155, 0.4);
}

.save-btn:disabled {
  background: var(--text-medium);
  cursor: not-allowed;
}

.cancel-btn {
  background: rgba(255, 255, 255, 0.7);
  border: 1px solid var(--beige);
  color: var(--text-medium);
  padding: 0.75rem 1.5rem;
  border-radius: 0.5rem;
  cursor: pointer;
  font-weight: 500;
}

/* Responsive Design */
@media (max-width: 768px) {
  .deck-view-container {
    padding: 1rem;
  }

  .deck-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .deck-actions {
    width: 100%;
    justify-content: space-between;
  }

  .deck-stats {
    grid-template-columns: repeat(3, 1fr);
  }

  .study-controls {
    flex-direction: column;
    gap: 1rem;
  }

  .difficulty-buttons {
    flex-direction: column;
  }

  .modal-overlay {
    padding: 0.5rem;
  }
}
</style>
