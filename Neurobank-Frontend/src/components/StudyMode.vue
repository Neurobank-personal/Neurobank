<template>
  <div class="study-mode">
    <div class="study-header">
      <h3>Study Mode - {{ deckName }}</h3>
      <button class="exit-study-btn" @click="$emit('exit')">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M18 6L6 18M6 6l12 12"/>
        </svg>
        Exit Study
      </button>
    </div>

    <div v-if="currentCard" class="flashcard-container">
      <div class="flashcard-categories">
        <span v-for="category in currentCard.categories" :key="category" class="category-tag">
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
        <button class="control-btn prev" @click="previousCard" :disabled="currentIndex === 0">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="15,18 9,12 15,6"/>
          </svg>
          Previous
        </button>
        
        <div class="card-counter">
          {{ currentIndex + 1 }} / {{ totalCards }}
        </div>
        
        <button class="control-btn next" @click="nextCard" :disabled="currentIndex === totalCards - 1">
          Next
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="9,18 15,12 9,6"/>
          </svg>
        </button>
      </div>

      <div class="difficulty-buttons">
        <button class="difficulty-btn easy" @click="markCard('easy')">Easy</button>
        <button class="difficulty-btn medium" @click="markCard('medium')">Medium</button>
        <button class="difficulty-btn hard" @click="markCard('hard')">Hard</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import type { Flashcard } from '../types/Flashcard'

// Props
const props = defineProps<{
  flashcards: Flashcard[]
  deckName: string
}>()

// Emits
const emit = defineEmits<{
  exit: []
  markCard: [difficulty: 'easy' | 'medium' | 'hard', cardId: string]
}>()

// Reactive data
const currentIndex = ref(0)
const isFlipped = ref(false)

// Computed values
const currentCard = computed(() => {
  const card = props.flashcards[currentIndex.value]
  if (!card) return null
  
  return {
    id: card.id.toString(),
    question: card.question,
    answer: card.answer,
    categories: Array.isArray(card.categories) ? card.categories : [card.categories],
    difficulty: card.difficulty,
    lastReviewed: card.lastReviewed,
    deckId: card.deckId
  }
})

const totalCards = computed(() => props.flashcards.length)

// Methods
const flipCard = () => {
  isFlipped.value = !isFlipped.value
}

const nextCard = () => {
  if (currentIndex.value < props.flashcards.length - 1) {
    currentIndex.value++
    isFlipped.value = false
  }
}

const previousCard = () => {
  if (currentIndex.value > 0) {
    currentIndex.value--
    isFlipped.value = false
  }
}

const markCard = (difficulty: 'easy' | 'medium' | 'hard') => {
  if (!currentCard.value) return
  
  console.log('Marking card:', difficulty, currentCard.value.id)
  console.log('Current index before:', currentIndex.value)
  console.log('Total flashcards:', props.flashcards.length)
  
  emit('markCard', difficulty, currentCard.value.id)
  
  // Use setTimeout to ensure the emit completes first
  setTimeout(() => {
    // Auto-advance to next card
    if (currentIndex.value < props.flashcards.length - 1) {
      // Go to next card
      console.log('Moving to next card')
      currentIndex.value++
      isFlipped.value = false
    } else {
      // Reached the end - show completion message or exit
      console.log('Reached end of deck')
      alert('🎉 Grattis! Du har gått igenom alla kort i detta deck!')
      emit('exit')
    }
    console.log('Current index after:', currentIndex.value)
  }, 100)
}

// Reset when flashcards change (but preserve current index if possible)
watch(() => props.flashcards, (newFlashcards, oldFlashcards) => {
  console.log('Flashcards changed:', newFlashcards.length, 'cards')
  // Only reset if the number of cards changed significantly
  if (!oldFlashcards || newFlashcards.length !== oldFlashcards.length) {
    console.log('Resetting to first card due to length change')
    currentIndex.value = 0
    isFlipped.value = false
  }
}, { deep: true })
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');

.study-mode {
  background: white;
  border-radius: 1.5rem;
  padding: 2rem;
  border: 1px solid #e2e8f0;
  font-family: 'Inter', sans-serif;
}

.study-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.study-header h3 {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
  color: #1e293b;
}

.exit-study-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: #ef4444;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 0.5rem;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s ease;
}

.exit-study-btn:hover {
  background: #dc2626;
  transform: translateY(-1px);
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
  background: white;
  border: 2px solid #e2e8f0;
  border-radius: 1rem;
  display: flex;
  flex-direction: column;
  padding: 2rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.flashcard-back {
  transform: rotateY(180deg);
  background: #f8fafc;
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
  color: #1e293b;
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
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  color: #374151;
  padding: 0.75rem 1rem;
  border-radius: 0.5rem;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s ease;
}

.control-btn:hover:not(:disabled) {
  background: #f1f5f9;
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
  color: #64748b;
  background: #f8fafc;
  padding: 0.5rem 1rem;
  border-radius: 0.5rem;
  border: 1px solid #e2e8f0;
}

.difficulty-buttons {
  display: flex;
  gap: 0.75rem;
  justify-content: center;
}

.difficulty-btn {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 0.5rem;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s ease;
  min-width: 80px;
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
  
  .difficulty-btn {
    width: 100%;
  }
}
</style>
