<template>
  <div class="study-mode">
    <div class="study-header">
      <h3>Study Mode - {{ deckName }}</h3>
      <button class="exit-study-btn" @click="$emit('exit')">
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
        >
          <path d="M18 6L6 18M6 6l12 12" />
        </svg>
        Exit Study
      </button>
    </div>

    <div v-if="currentCard" class="flashcard-container">
      <div class="flashcard-categories">
        <span
          v-for="category in currentCard.categories"
          :key="category"
          class="category-tag"
        >
          {{ category }}
        </span>
      </div>

      <div class="flashcard" :class="{ flipped: isFlipped }" @click="flipCard">
        <div class="flashcard-inner">
          <div class="flashcard-front">
            <div class="card-type">Question</div>
            <div class="card-content">{{ currentCard.question }}</div>
          </div>
          <div class="flashcard-back">
            <div class="card-type">Answer</div>
            <div class="card-content">{{ currentCard.answer }}</div>
          </div>
        </div>
      </div>

      <div class="study-controls">
        <button
          class="control-btn prev"
          @click="previousCard"
          :disabled="currentIndex === 0"
        >
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
          Previous
        </button>

        <div class="card-counter">
          {{ currentIndex + 1 }} / {{ totalCards }}
        </div>

        <button
          class="control-btn next"
          @click="nextCard"
          :disabled="currentIndex === totalCards - 1"
        >
          Next
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <polyline points="9,18 15,12 9,6" />
          </svg>
        </button>
      </div>

      <div class="review-actions">
        <div class="difficulty-buttons">
          <button class="difficulty-btn easy" @click="markCard('easy')">
            Easy
          </button>
          <button class="difficulty-btn medium" @click="markCard('medium')">
            Medium
          </button>
          <button class="difficulty-btn hard" @click="markCard('hard')">
            Hard
          </button>
        </div>
      </div>

      <div class="custom-review">
        <div class="custom-review-header">
          <span class="custom-label">Schedule Next Review</span>
          <span class="custom-subtitle"
            >Choose next time to review this card and move on to the next</span
          >
        </div>
        <div class="custom-review-inputs">
          <div class="number-input-wrapper">
            <input
              type="number"
              v-model="customDays"
              :min="1"
              :max="30"
              placeholder="1-30"
              class="custom-input"
              :class="{ 'input-valid': isCustomInputValid && customDays }"
            />
            <div class="number-controls">
              <button
                type="button"
                class="number-btn increment"
                @click="incrementDays"
                :disabled="customDays !== null && customDays >= 30"
              >
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="3"
                >
                  <polyline points="18,15 12,9 6,15"></polyline>
                </svg>
              </button>
              <button
                type="button"
                class="number-btn decrement"
                @click="decrementDays"
                :disabled="customDays !== null && customDays <= 1"
              >
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="3"
                >
                  <polyline points="6,9 12,15 18,9"></polyline>
                </svg>
              </button>
            </div>
          </div>

          <div class="custom-select-wrapper">
            <select v-model="customTimeUnit" class="custom-select">
              <option value="days">Days</option>
              <option value="months">Months</option>
            </select>
            <div class="select-icon">
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
              >
                <polyline points="6,9 12,15 18,9"></polyline>
              </svg>
            </div>
          </div>

          <button
            class="custom-btn"
            @click="markCardCustom"
            :disabled="!isCustomInputValid"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <path d="M8 2v4" />
              <path d="M16 2v4" />
              <rect x="3" y="4" width="18" height="18" rx="2" />
              <path d="M3 10h18" />
            </svg>
            Schedule Review
          </button>
        </div>
      </div>
    </div>

    <!-- Completion State -->
    <div v-else-if="showCompletion" class="completion-container">
      <div class="completion-card">
        <div class="completion-header">
          <h2 class="completion-title">Study Complete!</h2>
          <p class="completion-message">
            Excellent work! You've completed all available flashcards for now.
            Your consistent learning habit is building strong knowledge
            foundations.
          </p>
        </div>

        <div class="completion-actions">
          <button class="btn-primary" @click="$emit('exit')">
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16,17 21,12 16,7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
            Return to Collection
          </button>
        </div>
      </div>
    </div>

    <!-- No Cards State -->
    <div v-else class="empty-state">
      <div class="empty-icon">📚</div>
      <h3>No cards to study</h3>
      <p>All cards have been completed or there are no cards in this deck.</p>
      <button class="btn-secondary" @click="$emit('exit')">Go Back</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from "vue";
import type { Flashcard } from "../types/Flashcard";

// Props
const props = defineProps<{
  flashcards: Flashcard[];
  deckName: string;
}>();

// Emits
const emit = defineEmits<{
  exit: [];
  markCard: [difficulty: "easy" | "medium" | "hard", cardId: string];
  markCardCustom: [days: number, timeUnit: "days" | "months", cardId: string];
}>();

// Reactive data
const currentIndex = ref(0);
const isFlipped = ref(false);
const showCompletion = ref(false);
const customDays = ref<number | null>(null);
const customTimeUnit = ref<"days" | "months">("days");

// Computed values
const currentCard = computed(() => {
  const card = props.flashcards[currentIndex.value];
  if (!card) return null;

  return {
    id: card.id.toString(),
    question: card.question,
    answer: card.answer,
    categories: Array.isArray(card.categories)
      ? card.categories
      : [card.categories],
    difficulty: card.difficulty,
    lastReviewed: card.lastReviewed,
    deckId: card.deckId,
  };
});

const totalCards = computed(() => props.flashcards.length);

// Computed for custom review validation
const isCustomInputValid = computed(() => {
  return (
    customDays.value !== null && customDays.value >= 1 && customDays.value <= 30
  );
});

// Methods
const flipCard = () => {
  isFlipped.value = !isFlipped.value;
};

const nextCard = () => {
  if (currentIndex.value < props.flashcards.length - 1) {
    currentIndex.value++;
    isFlipped.value = false;
  }
};

const previousCard = () => {
  if (currentIndex.value > 0) {
    currentIndex.value--;
    isFlipped.value = false;
  }
};

const markCard = (difficulty: "easy" | "medium" | "hard") => {
  if (!currentCard.value) return;

  console.log("Marking card:", difficulty, currentCard.value.id);
  console.log("Current index before:", currentIndex.value);
  console.log("Total flashcards:", props.flashcards.length);

  emit("markCard", difficulty, currentCard.value.id);

  // Do not auto-advance! The card will be removed from the list and the current index
  // will automatically point to the next card since the array shrinks.
  // Just reset the flip state
  isFlipped.value = false;
};

const markCardCustom = () => {
  if (!currentCard.value || !isCustomInputValid.value) return;

  console.log(
    "Marking card with custom review:",
    customDays.value,
    customTimeUnit.value,
    currentCard.value.id
  );

  emit(
    "markCardCustom",
    customDays.value!,
    customTimeUnit.value,
    currentCard.value.id
  );

  // Reset custom input and flip state
  customDays.value = null;
  customTimeUnit.value = "days";
  isFlipped.value = false;
};

const incrementDays = () => {
  if (customDays.value === null) {
    customDays.value = 1;
  } else if (customDays.value < 30) {
    customDays.value++;
  }
};

const decrementDays = () => {
  if (customDays.value === null) {
    customDays.value = 1;
  } else if (customDays.value > 1) {
    customDays.value--;
  }
};

// Reset when flashcards change (but preserve current index if possible)
watch(
  () => props.flashcards,
  (newFlashcards) => {
    console.log("Flashcards changed:", newFlashcards.length, "cards");

    // If no cards left, show completion screen
    if (newFlashcards.length === 0) {
      console.log("No cards left, showing completion screen");
      showCompletion.value = true;
      return;
    }

    // Hide completion screen if we have cards again
    showCompletion.value = false;

    // If current index is beyond the new array length, adjust it
    if (currentIndex.value >= newFlashcards.length) {
      console.log("Adjusting index to last available card");
      currentIndex.value = newFlashcards.length - 1;
      isFlipped.value = false;
    }

    // If the number of cards decreased (card was marked), keep current index
    // The card at the current index will now be the next card automatically
  },
  { deep: true }
);
</script>

<style scoped>
@import url("https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap");

.study-mode {
  background: rgba(15, 23, 42, 0.7);
  backdrop-filter: blur(20px);
  border-radius: 24px;
  padding: 2.5rem;
  border: 1px solid rgba(255, 255, 255, 0.1);
  font-family: "Inter", sans-serif;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
  color: #ffffff;
}

.study-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 3rem;
}

.study-header h3 {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 700;
  color: #ffffff;
  letter-spacing: -0.02em;
}

.exit-study-btn {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  background: linear-gradient(135deg, #ef4444, #dc2626);
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 12px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.3s ease;
  box-shadow: 0 4px 16px rgba(239, 68, 68, 0.3);
}

.exit-study-btn:hover {
  background: linear-gradient(135deg, #dc2626, #b91c1c);
  transform: translateY(-2px);
  box-shadow: 0 8px 32px rgba(239, 68, 68, 0.4);
}

.flashcard-container {
  max-width: 600px;
  margin: 0 auto;
}

.flashcard-categories {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1rem;
  justify-content: center;
  flex-wrap: wrap;
}

.category-tag {
  background: #667eea;
  color: white;
  padding: 0.25rem 0.75rem;
  border-radius: 1rem;
  font-size: 0.75rem;
  font-weight: 500;
}

.flashcard {
  perspective: 1000px;
  height: 300px;
  margin-bottom: 2rem;
  cursor: pointer;
}

.flashcard-inner {
  position: relative;
  width: 100%;
  height: 100%;
  transition: transform 0.6s;
  transform-style: preserve-3d;
}

.flashcard.flipped .flashcard-inner {
  transform: rotateY(180deg);
}

.flashcard-front,
.flashcard-back {
  position: absolute;
  width: 100%;
  height: 100%;
  backface-visibility: hidden;
  background: rgba(15, 23, 42, 0.7);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 1rem;
  display: flex;
  flex-direction: column;
  padding: 2rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.flashcard-back {
  transform: rotateY(180deg);
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.card-type {
  font-size: 0.875rem;
  font-weight: 600;
  color: #667eea;
  margin-bottom: 1rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.card-content {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  font-size: 1.25rem;
  line-height: 1.6;
  color: #ffffff;
}

.study-controls {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.control-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: #ffffff;
  padding: 0.75rem 1rem;
  border-radius: 0.5rem;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s ease;
}

.control-btn:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.05);
  border-color: #94a3b8;
  transform: translateY(-1px);
}

.control-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.card-counter {
  font-size: 1rem;
  font-weight: 600;
  color: #94a3b8;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  padding: 0.5rem 1rem;
  border-radius: 0.5rem;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.review-actions {
  display: flex;
  justify-content: center;
  margin-top: 1.5rem;
  margin-bottom: 1.5rem;
}

.difficulty-buttons {
  display: flex;
  gap: 0.75rem;
  justify-content: center;
}

.custom-review {
  width: 100%;
  max-width: 500px;
  margin: 0 auto;
  padding: 1rem;
  background: linear-gradient(
    135deg,
    rgba(255, 255, 255, 0.05) 0%,
    rgba(255, 255, 255, 0.1) 100%
  );
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 0.75rem;
  transition: all 0.2s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.custom-review:hover {
  border-color: #cbd5e1;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
  transform: translateY(-1px);
}

.custom-review-header {
  text-align: center;
  margin-bottom: 1rem;
}

.custom-label {
  display: block;
  font-size: 0.875rem;
  font-weight: 600;
  color: #475569;
  text-transform: uppercase;
  letter-spacing: 0.025em;
  margin-bottom: 0.25rem;
}

.custom-subtitle {
  display: block;
  font-size: 0.75rem;
  color: #94a3b8;
  font-weight: 400;
}

.custom-review-inputs {
  display: flex;
  gap: 1rem;
  align-items: center;
  justify-content: center;
  flex-wrap: wrap;
}

.number-input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.custom-input {
  width: 70px;
  padding: 0.625rem 0.75rem;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 0.5rem;
  font-size: 0.875rem;
  font-weight: 600;
  text-align: center;
  transition: all 0.2s ease;
  background: rgba(15, 23, 42, 0.7);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  appearance: none;
  -webkit-appearance: none;
  -moz-appearance: textfield;
}

.custom-input::-webkit-outer-spin-button,
.custom-input::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

.custom-input:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 4px rgba(102, 126, 234, 0.1);
  transform: scale(1.02);
}

.custom-input.input-valid {
  border-color: #22c55e;
  background: rgba(34, 197, 94, 0.1);
}

.number-controls {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.number-btn {
  width: 22px;
  height: 18px;
  border: none;
  background: linear-gradient(135deg, #3b82f6, #8b5cf6);
  color: white;
  border-radius: 0.25rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.15s ease;
  font-size: 0;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.number-btn:hover:not(:disabled) {
  background: linear-gradient(135deg, #5a67d8 0%, #6b46c1 100%);
  transform: scale(1.1);
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
}

.number-btn:disabled {
  background: #cbd5e1;
  cursor: not-allowed;
  opacity: 0.6;
}

.number-btn svg {
  pointer-events: none;
}

.custom-select-wrapper {
  position: relative;
  display: inline-block;
}

.custom-select {
  appearance: none;
  -webkit-appearance: none;
  -moz-appearance: none;
  padding: 0.625rem 2rem 0.625rem 0.875rem;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 0.5rem;
  font-size: 0.875rem;
  font-weight: 600;
  background: rgba(15, 23, 42, 0.7);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  cursor: pointer;
  transition: all 0.2s ease;
  min-width: 90px;
}

.custom-select:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 4px rgba(102, 126, 234, 0.1);
}

.select-icon {
  position: absolute;
  right: 0.625rem;
  top: 50%;
  transform: translateY(-50%);
  pointer-events: none;
  color: #94a3b8;
  transition: color 0.2s ease;
}

.custom-select:focus + .select-icon {
  color: #667eea;
}

.custom-btn {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.625rem 1.5rem;
  background: linear-gradient(135deg, #3b82f6, #8b5cf6);
  color: white;
  border: none;
  border-radius: 0.5rem;
  font-size: 0.8rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
  box-shadow: 0 2px 8px rgba(102, 126, 234, 0.2);
  min-width: 140px;
  justify-content: center;
}

.custom-btn:hover:not(:disabled) {
  background: linear-gradient(135deg, #5a67d8 0%, #6b46c1 100%);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}

.custom-btn:disabled {
  background: #cbd5e1;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.custom-btn svg {
  opacity: 0.9;
}

.difficulty-buttons {
  display: flex;
  gap: 0.75rem;
}

.difficulty-btn {
  padding: 1rem 2rem;
  border: none;
  border-radius: 0.75rem;
  cursor: pointer;
  font-weight: 600;
  font-size: 1rem;
  transition: all 0.2s ease;
  min-width: 100px;
}

.difficulty-btn.easy {
  background: #22c55e;
  color: white;
}

.difficulty-btn.medium {
  background: #eab308;
  color: white;
}

.difficulty-btn.hard {
  background: #ef4444;
  color: white;
}

.difficulty-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

/* Completion Screen */
.completion-container {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  padding: 2rem;
}

.completion-card {
  background: rgba(15, 23, 42, 0.7);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 1.5rem;
  padding: 3rem;
  text-align: center;
  max-width: 500px;
  width: 100%;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
}

.completion-header {
  margin-bottom: 2rem;
}

.completion-title {
  font-size: 2rem;
  font-weight: 700;
  margin-bottom: 1rem;
  color: #ffffff;
  background: linear-gradient(135deg, #3b82f6, #8b5cf6);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.completion-message {
  font-size: 1rem;
  line-height: 1.6;
  color: #94a3b8;
  margin: 0;
}

.completion-actions {
  display: flex;
  justify-content: center;
}

.btn-primary {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: #667eea;
  color: white;
  border: none;
  padding: 1rem 2rem;
  border-radius: 0.75rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 1rem;
}

.btn-primary:hover {
  background: #5a67d8;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}

/* Empty State */
.empty-state {
  text-align: center;
  padding: 3rem;
  color: #94a3b8;
}

.empty-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
  opacity: 0.6;
}

.empty-state h3 {
  font-size: 1.5rem;
  margin-bottom: 0.5rem;
  color: #ffffff;
}

.empty-state p {
  margin-bottom: 2rem;
  line-height: 1.6;
}

.btn-secondary {
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: #94a3b8;
  border: 1px solid rgba(255, 255, 255, 0.1);
  padding: 0.75rem 1.5rem;
  border-radius: 0.75rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-secondary:hover {
  background: rgba(255, 255, 255, 0.05);
  border-color: #cbd5e1;
  transform: translateY(-1px);
}

/* Responsive Design */
@media (max-width: 768px) {
  .study-mode {
    padding: 1rem;
  }

  .study-header {
    flex-direction: column;
    gap: 1rem;
    align-items: flex-start;
  }

  .flashcard {
    height: 250px;
  }

  .flashcard-front,
  .flashcard-back {
    padding: 1.5rem;
  }

  .card-content {
    font-size: 1.1rem;
  }

  .study-controls {
    flex-direction: column;
    gap: 1rem;
  }

  .difficulty-buttons {
    flex-direction: column;
    width: 100%;
  }

  .review-actions {
    margin-top: 1rem;
    margin-bottom: 1rem;
  }

  .difficulty-buttons {
    flex-direction: column;
    width: 100%;
    gap: 0.75rem;
  }

  .difficulty-btn {
    width: 100%;
    padding: 1.25rem 2rem;
    font-size: 1.1rem;
  }

  .custom-review {
    padding: 1rem;
    margin: 0 1rem;
    max-width: none;
  }

  .custom-review-header {
    margin-bottom: 1rem;
  }

  .custom-label {
    font-size: 0.8rem;
  }

  .custom-subtitle {
    font-size: 0.7rem;
  }

  .custom-review-inputs {
    flex-direction: column;
    gap: 0.875rem;
    width: 100%;
  }

  .number-input-wrapper {
    width: 100%;
    max-width: 160px;
    justify-content: center;
  }

  .custom-input {
    width: 80px;
    padding: 0.75rem 0.875rem;
    font-size: 0.9rem;
  }

  .custom-select-wrapper {
    width: 100%;
    max-width: 160px;
  }

  .custom-select {
    width: 100%;
    padding: 0.75rem 2rem 0.75rem 0.875rem;
    font-size: 0.9rem;
  }

  .custom-btn {
    width: 100%;
    max-width: 160px;
    padding: 0.75rem 1.5rem;
    font-size: 0.85rem;
  }

  .difficulty-btn {
    width: 100%;
  }

  .completion-card {
    padding: 2rem;
    margin: 1rem;
  }

  .completion-title {
    font-size: 1.75rem;
  }

  .completion-message {
    font-size: 0.95rem;
  }

  .btn-primary {
    padding: 0.875rem 1.5rem;
    font-size: 0.95rem;
  }
}
</style>
