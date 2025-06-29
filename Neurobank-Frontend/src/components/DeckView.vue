<template>
  <div class="deck-view-container">
    <!-- Deck Header -->
    <div class="deck-header">
      <div class="deck-info">
        <button class="back-btn" @click="$emit('goBack')">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="15,18 9,12 15,6"/>
          </svg>
          Back to Decks
        </button>
        
        <div class="deck-title-section">
          <div class="deck-icon" :style="{ backgroundColor: deck?.color || '#f1f5f9' }">
            {{ deckId ? '📋' : '🎯' }}
          </div>
          <div>
            <h2>{{ deck?.name || 'General Collection' }}</h2>
            <p class="deck-description">
              {{ deck?.description || 'All unorganized flashcards' }}
            </p>
          </div>
        </div>
      </div>

      <div class="deck-actions">
        <button 
          v-if="filteredFlashcards.length > 0"
          class="btn-primary study-btn" 
          @click="startStudyMode"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="2" y="3" width="20" height="14" rx="2" ry="2"/>
            <line x1="8" y1="21" x2="16" y2="21"/>
            <line x1="12" y1="17" x2="12" y2="21"/>
          </svg>
          Study Mode
        </button>
        
        <button class="btn-secondary" @click="showCreateForm = true">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M12 5v14M5 12h14"/>
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
      v-else-if="studyMode && filteredFlashcards.length > 0"
      :flashcards="filteredFlashcards"
      :deckName="deck?.name || 'General Collection'"
      @exit="exitStudyMode"
      @markCard="handleMarkCard"
    />

    <!-- Cards List View -->
    <div v-else-if="flashcards.length === 0" class="empty-state">
      <div class="empty-icon">📚</div>
      <h3>No flashcards in this {{ deckId ? 'deck' : 'collection' }} yet</h3>
      <p>Add some flashcards to get started with studying.</p>
      <button class="create-btn" @click="showCreateForm = true">Add Your First Card</button>
    </div>

    <div v-else-if="filteredFlashcards.length === 0" class="empty-state">
      <div class="empty-icon">🔍</div>
      <h3>No cards match the current filter</h3>
      <button class="btn-secondary" @click="setFilter('all')">Show All Cards</button>
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
        <div v-for="card in filteredFlashcards" :key="card.id" class="flashcard-item">
          <div class="flashcard-item-header">
            <div class="flashcard-categories">
              <span v-for="category in card.categories" :key="category" class="category-tag-small">
                {{ category }}
              </span>
            </div>
            <div class="flashcard-actions">
              <button class="action-btn edit" @click="editCard(card)" title="Edit">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                </svg>
              </button>
              <button class="action-btn delete" @click="deleteCard(card.id)" title="Delete">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <polyline points="3,6 5,6 21,6"/>
                  <path d="M19,6v14a2,2,0,0,1-2,2H7a2,2,0,0,1-2-2V6m3,0V4a2,2,0,0,1,2-2h4a2,2,0,0,1,2,2V6"/>
                </svg>
              </button>
            </div>
          </div>
          <div class="flashcard-item-content">
            <div class="question">
              <strong>Q:</strong> {{ card.question }}
            </div>
            <div class="answer">
              <strong>A:</strong> {{ card.answer }}
            </div>
          </div>
          <div class="flashcard-item-footer">
            <span v-if="card.difficulty" class="difficulty-badge" :class="card.difficulty">
              {{ card.difficulty }}
            </span>
            <span v-if="card.lastReviewed" class="reviewed-badge">
              ✓ Completed
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- Create/Edit Card Modal -->
    <div v-if="showCreateForm || showEditForm" class="modal-overlay" @click="cancelForm">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>{{ showEditForm ? 'Edit Card' : 'Add New Card' }}</h3>
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
                <span v-for="category in cardForm.categories" :key="category" class="category-tag">
                  {{ category }}
                  <button type="button" @click="removeCategory(category)" class="remove-category">×</button>
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
              {{ showEditForm ? 'Save Changes' : 'Add Card' }}
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
import { ref, computed, onMounted, watch } from 'vue'
import { useAuth } from '../stores/auth'
import FlashcardService from '../services/FlashcardService'
import DeckService from '../services/DeckService'
import StudyMode from './StudyMode.vue'
import type { Flashcard } from '../types/Flashcard'
import type { Deck } from '../types/Deck'

// Props and Emits
const props = defineProps<{
  deckId: string | null
}>()

defineEmits<{
  goBack: []
}>()

const { getCurrentUserId } = useAuth()

// Reactive data
const deck = ref<Deck | null>(null)
const flashcards = ref<Flashcard[]>([])
const loading = ref(true)
const error = ref('')
const studyMode = ref(false)
const cardFilter = ref<'all' | 'completed' | 'remaining'>('all')
const showCreateForm = ref(false)
const showEditForm = ref(false)
const editingCard = ref<Flashcard | null>(null)
const newCategoryInput = ref('')

const cardForm = ref({
  question: '',
  answer: '',
  categories: [] as string[]
})

const userId = computed(() => getCurrentUserId())

// Computed values
const totalCards = computed(() => flashcards.value.length)
const completedCards = computed(() => 
  flashcards.value.filter(card => card.lastReviewed).length
)
const remainingCards = computed(() => 
  flashcards.value.filter(card => !card.lastReviewed).length
)

const filteredFlashcards = computed(() => {
  switch (cardFilter.value) {
    case 'completed':
      return flashcards.value.filter(card => card.lastReviewed)
    case 'remaining':
      return flashcards.value.filter(card => !card.lastReviewed)
    default:
      return flashcards.value
  }
})

const isFormValid = computed(() => 
  cardForm.value.question.trim().length > 0 && 
  cardForm.value.answer.trim().length > 0
)

// Load data on mount and when deckId changes
onMounted(() => {
  loadData()
})

watch(() => props.deckId, () => {
  loadData()
})

const loadData = async () => {
  await Promise.all([loadDeck(), loadFlashcards()])
}

const loadDeck = async () => {
  if (!props.deckId) {
    deck.value = null
    return
  }

  try {
    deck.value = await DeckService.getDeck(props.deckId)
  } catch (err) {
    console.error('Error loading deck:', err)
  }
}

const loadFlashcards = async () => {
  if (!userId.value) {
    error.value = 'You must be logged in to view flashcards'
    loading.value = false
    return
  }

  try {
    loading.value = true
    
    if (props.deckId) {
      flashcards.value = await DeckService.getDeckFlashcards(props.deckId)
    } else {
      // Load general collection (flashcards without deckId)
      const allFlashcards = await FlashcardService.getUserFlashcards(userId.value)
      flashcards.value = allFlashcards.filter(card => !card.deckId)
    }
    
    error.value = ''
  } catch (err) {
    error.value = 'Failed to load flashcards'
    console.error('Error loading flashcards:', err)
  } finally {
    loading.value = false
  }
}

// Study Mode Functions
const startStudyMode = () => {
  studyMode.value = true
}

const exitStudyMode = () => {
  studyMode.value = false
}

const handleMarkCard = async (difficulty: 'easy' | 'medium' | 'hard', cardId: string) => {
  if (!userId.value) return

  try {
    await FlashcardService.updateFlashcard(cardId, {
      difficulty,
      lastReviewed: new Date()
    })
    
    await loadFlashcards()
  } catch (err) {
    console.error('Error marking card:', err)
  }
}

// Filter Functions
const setFilter = (filter: 'all' | 'completed' | 'remaining') => {
  cardFilter.value = filter
}

// Card CRUD Functions
const saveCard = async () => {
  if (!userId.value || !isFormValid.value) return

  try {
    const cardData = {
      question: cardForm.value.question.trim(),
      answer: cardForm.value.answer.trim(),
      categories: cardForm.value.categories,
      userId: userId.value,
      deckId: props.deckId || undefined
    }

    if (showEditForm.value && editingCard.value) {
      await FlashcardService.updateFlashcard(editingCard.value.id.toString(), cardData)
    } else {
      await FlashcardService.createFlashcard(cardData)
    }
    
    await loadFlashcards()
    cancelForm()
  } catch (err) {
    console.error('Error saving card:', err)
    error.value = 'Failed to save card'
  }
}

const editCard = (card: Flashcard) => {
  editingCard.value = card
  cardForm.value = {
    question: card.question,
    answer: card.answer,
    categories: Array.isArray(card.categories) ? [...card.categories] : [card.categories]
  }
  showEditForm.value = true
}

const deleteCard = async (cardId: number) => {
  if (!confirm('Are you sure you want to delete this card?')) return

  try {
    await FlashcardService.deleteFlashcard(cardId.toString())
    await loadFlashcards()
  } catch (err) {
    console.error('Error deleting card:', err)
    error.value = 'Failed to delete card'
  }
}

const cancelForm = () => {
  showCreateForm.value = false
  showEditForm.value = false
  editingCard.value = null
  cardForm.value = {
    question: '',
    answer: '',
    categories: []
  }
  newCategoryInput.value = ''
}

// Category Functions
const addCategory = () => {
  const category = newCategoryInput.value.trim()
  if (category && !cardForm.value.categories.includes(category)) {
    cardForm.value.categories.push(category)
    newCategoryInput.value = ''
  }
}

const removeCategory = (category: string) => {
  const index = cardForm.value.categories.indexOf(category)
  if (index > -1) {
    cardForm.value.categories.splice(index, 1)
  }
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');

.deck-view-container {
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
  font-family: 'Inter', sans-serif;
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
  background: #f1f5f9;
}

.deck-title-section h2 {
  font-size: 1.75rem;
  font-weight: 700;
  color: #1e293b;
  margin: 0;
}

.deck-description {
  color: #64748b;
  margin: 0.25rem 0 0 0;
  font-size: 1rem;
}

.deck-actions {
  display: flex;
  gap: 0.75rem;
  align-items: center;
}

.btn-primary, .btn-secondary {
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
  box-shadow: 0 4px 20px rgba(102, 126, 234, 0.4);
}

.btn-secondary {
  background: #f8fafc;
  color: #374151;
  border: 1px solid #e2e8f0;
}

.btn-secondary:hover {
  background: #f1f5f9;
  border-color: #94a3b8;
}

/* Stats */
.deck-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
}

.stat-card {
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 1rem;
  padding: 1.5rem;
  text-align: center;
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

/* Cards List */
.flashcards-list {
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

.flashcards-grid {
  display: grid;
  gap: 1rem;
}

.flashcard-item {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 0.75rem;
  padding: 1.5rem;
  transition: all 0.2s ease;
}

.flashcard-item:hover {
  border-color: #667eea;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.1);
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
  color: #64748b;
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

.flashcard-item-content {
  margin-bottom: 1rem;
}

.question, .answer {
  margin-bottom: 0.75rem;
  line-height: 1.5;
}

.question strong, .answer strong {
  color: #667eea;
}

.flashcard-item-footer {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}

.difficulty-badge {
  padding: 0.25rem 0.5rem;
  border-radius: 0.5rem;
  font-size: 0.75rem;
  font-weight: 500;
  color: white;
}

.difficulty-badge.easy { background: #22c55e; }
.difficulty-badge.medium { background: #eab308; }
.difficulty-badge.hard { background: #ef4444; }

.reviewed-badge {
  background: #22c55e;
  color: white;
  padding: 0.25rem 0.5rem;
  border-radius: 0.5rem;
  font-size: 0.75rem;
  font-weight: 500;
}

/* States */
.loading-state, .error-state, .empty-state {
  text-align: center;
  padding: 4rem 2rem;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #e2e8f0;
  border-top: 4px solid #667eea;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 1rem;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.error-icon, .empty-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.retry-btn, .create-btn {
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
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
}

.modal-content {
  background: white;
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
  color: #374151;
}

.form-group input,
.form-group textarea {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 0.5rem;
  font-size: 1rem;
  transition: border-color 0.2s ease;
  font-family: inherit;
}

.form-group input:focus,
.form-group textarea:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.categories-input {
  border: 1px solid #d1d5db;
  border-radius: 0.5rem;
  padding: 0.75rem;
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
  border: 1px solid #e2e8f0;
  border-radius: 0.25rem;
  padding: 0.5rem;
}

.add-category button {
  background: #667eea;
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
