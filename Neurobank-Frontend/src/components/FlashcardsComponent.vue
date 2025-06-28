<template>
  <div class="flashcards-container">
    <div class="flashcards-header">
      <h2>Flashcards</h2>
      <p class="subtitle">Review and practice with your flashcards</p>
    </div>

    <div class="flashcards-stats">
      <div class="stat-card clickable" @click="showAllCards">
        <div class="stat-number">{{ totalCards }}</div>
        <div class="stat-label">Total cards</div>
      </div>
      <div class="stat-card clickable" @click="showCompletedCards">
        <div class="stat-number">{{ completedCards }}</div>
        <div class="stat-label">Completed</div>
      </div>
      <div class="stat-card clickable" @click="showRemainingCards">
        <div class="stat-number">{{ remainingCards }}</div>
        <div class="stat-label">Remaining</div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="loading-state">
      <div class="loading-spinner"></div>
      <p>Loading your flashcards...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="error-state">
      <div class="error-icon">⚠️</div>
      <h3>Oops! Something went wrong</h3>
      <p>{{ error }}</p>
      <button class="retry-btn" @click="loadFlashcards">Try Again</button>
    </div>

    <!-- Empty State -->
    <div v-else-if="flashcards.length === 0" class="empty-state">
      <div class="empty-icon">📚</div>
      <h3>No flashcards yet</h3>
      <p>Generate flashcards from your notes or create them manually to get started.</p>
      <button class="create-btn" @click="showCreateForm = true">Create Your First Card</button>
    </div>

    <!-- No filtered results -->
    <div v-else-if="filteredFlashcards.length === 0" class="empty-state">
      <div class="empty-icon">🔍</div>
      <h3>No cards match the current filter</h3>
      <p v-if="cardFilter === 'completed'">You haven't completed any cards yet. Study some cards to mark them as completed!</p>
      <p v-else-if="cardFilter === 'remaining'">All cards have been completed! Great job!</p>
      <button class="btn-secondary" @click="showAllCards">Show All Cards</button>
    </div>

    <!-- Flashcards Content -->
    <div v-else-if="activeView === 'study' && currentCard" class="flashcards-content">
      <div class="flashcard-deck">
        <h3>Active set</h3>
        <div class="flashcard-category">
          <span v-for="category in currentCard.categories" :key="category" class="category-tag">
            {{ category }}
          </span>
        </div>
        <div class="flashcard" :class="{ flipped: isFlipped }" @click="flipCard">
          <div class="flashcard-inner">
            <div class="flashcard-front">
              <div class="card-type">Question</div>
              <div class="card-content">
                {{ currentCard.question }}
              </div>
            </div>
            <div class="flashcard-back">
              <div class="card-type">Answer</div>
              <div class="card-content">
                {{ currentCard.answer }}
              </div>
            </div>
          </div>
        </div>
        
        <div class="card-controls">
          <button class="control-btn prev" @click="previousCard" :disabled="currentIndex === 0">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="15,18 9,12 15,6"/>
            </svg>
            Previous
          </button>
          
          <div class="card-counter">
            {{ currentIndex + 1 }} / {{ filteredFlashcards.length }}
          </div>
          
          <button class="control-btn next" @click="nextCard" :disabled="currentIndex === filteredFlashcards.length - 1">
            Next
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="9,18 15,12 9,6"/>
            </svg>
          </button>
        </div>

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

      <div class="flashcards-sidebar">
        <div class="progress-section">
          <h4>Overall Progress</h4>
          <div class="progress-bar">
            <div class="progress-fill" :style="{ width: progressPercentage + '%' }"></div>
          </div>
          <p>{{ completedCards }} of {{ totalCards }} cards completed</p>
        </div>

        <div class="recent-activity">
          <h4>Recent Activity</h4>
          <ul class="activity-list">
            <li class="activity-item">
              <span class="activity-text">Completed "JavaScript Basics"</span>
              <span class="activity-time">5 min ago</span>
            </li>
            <li class="activity-item">
              <span class="activity-text">Created new set</span>
              <span class="activity-time">1 hour ago</span>
            </li>
            <li class="activity-item">
              <span class="activity-text">Reviewed 10 cards</span>
              <span class="activity-time">2 hours ago</span>
            </li>
          </ul>
        </div>

        <div class="create-new">
          <button class="create-btn" @click="showCreateForm = !showCreateForm">
            {{ showCreateForm ? 'Cancel' : 'Create New Card' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Flashcards List View -->
    <div v-else-if="activeView === 'list'" class="flashcards-list-view">
      <div class="list-header">
        <div class="list-title-section">
          <h3>
            <span v-if="cardFilter === 'all'">All Flashcards</span>
            <span v-else-if="cardFilter === 'completed'">Completed Flashcards</span>
            <span v-else-if="cardFilter === 'remaining'">Remaining Flashcards</span>
          </h3>
          <button v-if="cardFilter !== 'all'" class="filter-reset-btn" @click="showAllCards">
            Show All
          </button>
        </div>
        <div class="list-controls">
          <button class="btn-secondary" @click="activeView = 'study'" v-if="filteredFlashcards.length > 0">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="2" y="3" width="20" height="14" rx="2" ry="2"/>
              <line x1="8" y1="21" x2="16" y2="21"/>
              <line x1="12" y1="17" x2="12" y2="21"/>
            </svg>
            Study Mode
          </button>
          <button class="btn-primary" @click="showCreateForm = true">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M12 5v14M5 12h14"/>
            </svg>
            Create New Card
          </button>
        </div>
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
          <div class="flashcard-content-preview">
            <div class="question-preview">
              <strong>Q:</strong> {{ card.question }}
            </div>
            <div class="answer-preview">
              <strong>A:</strong> {{ card.answer }}
            </div>
          </div>
          <div class="flashcard-meta">
            <span class="difficulty-indicator" :class="card.difficulty" v-if="card.difficulty">
              {{ card.difficulty }}
            </span>
            <span class="last-reviewed" v-if="card.lastReviewed">
              Last reviewed: {{ formatDate(card.lastReviewed) }}
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- Create new flashcard modal -->
    <div v-if="showCreateForm" class="modal-overlay" @click="cancelCreate">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3 class="create-header">Create New Flashcard</h3>
          <button class="close-btn" @click="cancelCreate">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>
        
        <div class="modal-body">
          <div v-if="error" class="error-message">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"/>
              <line x1="15" y1="9" x2="9" y2="15"/>
              <line x1="9" y1="9" x2="15" y2="15"/>
            </svg>
            {{ error }}
          </div>

          <div class="form-group">
            <label>Categories <span class="required">*</span></label>
            <div class="categories-input">
              <div class="categories-list">
                <span v-for="(category, index) in newCard.categories" :key="index" class="category-tag-input">
                  {{ category }}
                  <button type="button" @click="removeCategory(index)" class="remove-category">×</button>
                </span>
              </div>
              <div class="add-category">
                <input 
                  v-model="newCategoryInput"
                  @keypress.enter.prevent="addCategory"
                  type="text"
                  placeholder="Add category and press Enter..." 
                />
                <button type="button" @click="addCategory" class="add-category-btn" :disabled="!newCategoryInput.trim()">
                  Add
                </button>
              </div>
            </div>
            <p class="help-text">Add at least one category to organize your flashcard</p>
          </div>
          
          <div class="form-group">
            <label>Question <span class="required">*</span></label>
            <textarea 
              v-model="newCard.question" 
              placeholder="Write your question here..." 
              rows="3" 
              required
              :class="{ 'error': !newCard.question.trim() && newCard.question.length > 0 }"
            ></textarea>
            <div class="char-count">{{ newCard.question.length }}/500 characters</div>
          </div>
          
          <div class="form-group">
            <label>Answer <span class="required">*</span></label>
            <textarea 
              v-model="newCard.answer" 
              placeholder="Write the answer here..." 
              rows="3" 
              required
              :class="{ 'error': !newCard.answer.trim() && newCard.answer.length > 0 }"
            ></textarea>
            <div class="char-count">{{ newCard.answer.length }}/500 characters</div>
          </div>
        </div>
        
        <div class="modal-actions">
          <button 
            class="save-btn" 
            @click="saveNewCard"
            :disabled="!isCreateFormValid || loading"
          >
            <svg v-if="!loading" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
              <polyline points="17,21 17,13 7,13 7,21"/>
              <polyline points="7,3 7,8 15,8"/>
            </svg>
            <div v-else class="loading-spinner-small"></div>
            {{ loading ? 'Saving...' : 'Save Card' }}
          </button>
          <button class="cancel-btn" @click="cancelCreate" :disabled="loading">
            Cancel
          </button>
        </div>
      </div>
    </div>

    <!-- Edit flashcard modal -->
    <div v-if="showEditForm" class="modal-overlay" @click="cancelEdit">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>Edit Flashcard</h3>
          <button class="close-btn" @click="cancelEdit">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>
        
        <div class="modal-body">
          <div class="form-group">
            <label>Categories</label>
            <div class="categories-input">
              <div class="categories-list">
                <span v-for="(category, index) in editCardData.categories" :key="index" class="category-tag-input">
                  {{ category }}
                  <button type="button" @click="removeEditCategory(index)" class="remove-category">×</button>
                </span>
              </div>
              <div class="add-category">
                <input 
                  v-model="editCategoryInput"
                  @keypress.enter.prevent="addEditCategory"
                  type="text"
                  placeholder="Add category and press Enter..." 
                />
                <button type="button" @click="addEditCategory" class="add-category-btn">Add</button>
              </div>
            </div>
          </div>
          <div class="form-group">
            <label>Question</label>
            <textarea v-model="editCardData.question" placeholder="Write your question here..." rows="3" required></textarea>
          </div>
          <div class="form-group">
            <label>Answer</label>
            <textarea v-model="editCardData.answer" placeholder="Write the answer here..." rows="3" required></textarea>
          </div>
        </div>
        
        <div class="modal-actions">
          <button class="save-btn" @click="saveEditCard" :disabled="!editCardData.question.trim() || !editCardData.answer.trim()">
            Save Changes
          </button>
          <button class="cancel-btn" @click="cancelEdit">Cancel</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useAuth } from '../stores/auth'
import FlashcardService from '../services/FlashcardService'

const { getCurrentUserId } = useAuth()

interface LocalFlashcard {
  id: string
  question: string
  answer: string
  categories: string[]
  difficulty?: 'easy' | 'medium' | 'hard'
  lastReviewed?: Date
}

const isFlipped = ref(false)
const currentIndex = ref(0)
const showCreateForm = ref(false)
const showEditForm = ref(false)
const editingCard = ref<LocalFlashcard | null>(null)
const flashcards = ref<LocalFlashcard[]>([])
const loading = ref(true)
const error = ref('')
const activeView = ref<'study' | 'list'>('study') // New view state
const cardFilter = ref<'all' | 'completed' | 'remaining'>('all') // New filter state

const newCard = ref({
  question: '',
  answer: '',
  categories: [] as string[]
})

const editCardData = ref({
  question: '',
  answer: '',
  categories: [] as string[]
})

const newCategoryInput = ref('')
const editCategoryInput = ref('')

const userId = computed(() => getCurrentUserId())

// Computed values
const currentCard = computed(() => filteredFlashcards.value[currentIndex.value])
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
const progressPercentage = computed(() => 
  totalCards.value > 0 ? (completedCards.value / totalCards.value) * 100 : 0
)

const isCreateFormValid = computed(() => 
  newCard.value.question.trim().length > 0 && 
  newCard.value.answer.trim().length > 0 && 
  newCard.value.categories.length > 0
)

// Load flashcards on mount
onMounted(async () => {
  await loadFlashcards()
})

// Watch for filter changes and reset current index
watch(cardFilter, () => {
  currentIndex.value = 0
  isFlipped.value = false
})

// Watch for when current card becomes invalid after marking
watch(filteredFlashcards, () => {
  if (currentIndex.value >= filteredFlashcards.value.length) {
    currentIndex.value = Math.max(0, filteredFlashcards.value.length - 1)
  }
  isFlipped.value = false
})

const loadFlashcards = async () => {
  if (!userId.value) {
    error.value = 'You must be logged in to view flashcards'
    loading.value = false
    return
  }

  try {
    loading.value = true
    const userFlashcards = await FlashcardService.getUserFlashcards(userId.value)
    
    // Convert to local format
    flashcards.value = userFlashcards.map(card => ({
      id: card.id.toString(),
      question: card.question,
      answer: card.answer,
      categories: Array.isArray(card.categories) ? card.categories : [card.categories],
      difficulty: card.difficulty,
      lastReviewed: card.lastReviewed
    }))
    
    error.value = ''
  } catch (err) {
    error.value = 'Failed to load flashcards'
    console.error('Error loading flashcards:', err)
  } finally {
    loading.value = false
  }
}

const flipCard = () => {
  isFlipped.value = !isFlipped.value
}

const nextCard = () => {
  if (currentIndex.value < filteredFlashcards.value.length - 1) {
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

const markCard = async (difficulty: 'easy' | 'medium' | 'hard') => {
  if (!filteredFlashcards.value[currentIndex.value]) return
  
  try {
    const currentCard = filteredFlashcards.value[currentIndex.value]
    const cardId = currentCard.id
    await FlashcardService.markCardReviewed(cardId, difficulty)
    
    // Update local state in the original flashcards array
    const originalCardIndex = flashcards.value.findIndex(card => card.id === cardId)
    if (originalCardIndex !== -1) {
      flashcards.value[originalCardIndex].difficulty = difficulty
      flashcards.value[originalCardIndex].lastReviewed = new Date()
    }
    
    nextCard()
  } catch (err) {
    console.error('Error marking card:', err)
    error.value = 'Failed to mark card as reviewed'
  }
}

// Stat card click handlers
const showAllCards = () => {
  activeView.value = 'list'
  cardFilter.value = 'all'
  currentIndex.value = 0 // Reset index when changing filter
}

const showCompletedCards = () => {
  activeView.value = 'list'
  cardFilter.value = 'completed'
  currentIndex.value = 0 // Reset index when changing filter
}

const showRemainingCards = () => {
  activeView.value = 'list'
  cardFilter.value = 'remaining'
  currentIndex.value = 0 // Reset index when changing filter
}

const saveNewCard = async () => {
  if (!newCard.value.question.trim() || !newCard.value.answer.trim() || newCard.value.categories.length === 0) {
    error.value = 'Please fill in all fields and add at least one category'
    return
  }

  if (!userId.value) {
    error.value = 'You must be logged in to create flashcards'
    return
  }

  try {
    const flashcardData = {
      question: newCard.value.question.trim(),
      answer: newCard.value.answer.trim(),
      categories: newCard.value.categories,
      userId: userId.value
    }

    const newFlashcard = await FlashcardService.createFlashcard(flashcardData)
    
    // Add the new card to the local array
    flashcards.value.push({
      id: newFlashcard.id.toString(),
      question: newFlashcard.question,
      answer: newFlashcard.answer,
      categories: newFlashcard.categories,
      difficulty: newFlashcard.difficulty,
      lastReviewed: newFlashcard.lastReviewed
    })
    
    // Clear form and close
    newCard.value = { question: '', answer: '', categories: [] }
    newCategoryInput.value = ''
    showCreateForm.value = false
    error.value = ''
    
  } catch (err) {
    console.error('Error saving card:', err)
    error.value = err instanceof Error ? err.message : 'Failed to save card'
  }
}

const cancelCreate = () => {
  newCard.value = { question: '', answer: '', categories: [] }
  newCategoryInput.value = ''
  showCreateForm.value = false
  error.value = ''
}

// Category management functions
const addCategory = () => {
  const category = newCategoryInput.value.trim()
  if (category && !newCard.value.categories.includes(category)) {
    newCard.value.categories.push(category)
    newCategoryInput.value = ''
  }
}

const removeCategory = (index: number) => {
  newCard.value.categories.splice(index, 1)
}

// Card management functions
const editCard = (card: LocalFlashcard) => {
  editingCard.value = card
  editCardData.value = {
    question: card.question,
    answer: card.answer,
    categories: [...card.categories]
  }
  showEditForm.value = true
}

const deleteCard = async (cardId: string) => {
  if (confirm('Are you sure you want to delete this flashcard?')) {
    try {
      await FlashcardService.deleteFlashcard(cardId)
      flashcards.value = flashcards.value.filter(card => card.id !== cardId)
    } catch (err) {
      console.error('Error deleting card:', err)
      error.value = 'Failed to delete card'
    }
  }
}

// Edit card functions
const addEditCategory = () => {
  const category = editCategoryInput.value.trim()
  if (category && !editCardData.value.categories.includes(category)) {
    editCardData.value.categories.push(category)
    editCategoryInput.value = ''
  }
}

const removeEditCategory = (index: number) => {
  editCardData.value.categories.splice(index, 1)
}

const saveEditCard = async () => {
  if (!editingCard.value || !editCardData.value.question.trim() || !editCardData.value.answer.trim()) {
    return
  }

  try {
    const updates = {
      question: editCardData.value.question,
      answer: editCardData.value.answer,
      categories: editCardData.value.categories
    }

    await FlashcardService.updateFlashcard(editingCard.value.id, updates)
    
    // Update the card in the local array
    const index = flashcards.value.findIndex(card => card.id === editingCard.value!.id)
    if (index !== -1) {
      flashcards.value[index] = {
        ...flashcards.value[index],
        ...updates
      }
    }
    
    cancelEdit()
  } catch (err) {
    console.error('Error updating card:', err)
    error.value = 'Failed to update card'
  }
}

const cancelEdit = () => {
  showEditForm.value = false
  editingCard.value = null
  editCardData.value = { question: '', answer: '', categories: [] }
  editCategoryInput.value = ''
}

const formatDate = (date: Date) => {
  return new Intl.RelativeTimeFormat('en', { numeric: 'auto' }).format(
    Math.floor((date.getTime() - Date.now()) / (1000 * 60 * 60 * 24)),
    'day'
  )
}
</script>

<style scoped>
.flashcards-container {
  padding: 2rem;
  background-color: #f8f9fa;
  min-height: 100vh;
}

.flashcards-header {
  margin-bottom: 2rem;
}

.flashcards-header h2 {
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

.flashcards-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
}

.stat-card {
  background: white;
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  text-align: center;
  transition: all 0.2s ease;
}

.stat-card.clickable {
  cursor: pointer;
}

.stat-card.clickable:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  background: #fafafa;
}

.stat-card.clickable:active {
  transform: translateY(0);
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.stat-number {
  font-size: 2rem;
  font-weight: 700;
  color: #ed8936;
  margin-bottom: 0.5rem;
}

.stat-label {
  color: #4a5568;
  font-size: 0.9rem;
  font-weight: 500;
}

.flashcards-content {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 2rem;
}

.flashcard-deck {
  background: white;
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.flashcard-deck h3 {
  color: #2d3748;
  margin: 0 0 2rem 0;
  font-size: 1.5rem;
  font-weight: 600;
  text-align: center;
}

.flashcard-category {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 1rem;
  justify-content: center;
}

.category-tag {
  background: #4299e1;
  color: white;
  padding: 0.25rem 0.75rem;
  border-radius: 16px;
  font-size: 0.75rem;
  font-weight: 500;
  text-transform: capitalize;
}

.flashcard {
  width: 100%;
  height: 300px;
  perspective: 1000px;
  margin-bottom: 2rem;
  cursor: pointer;
}

.flashcard-inner {
  position: relative;
  width: 100%;
  height: 100%;
  text-align: center;
  transition: transform 0.6s;
  transform-style: preserve-3d;
}

.flashcard.flipped .flashcard-inner {
  transform: rotateY(180deg);
}

.flashcard-front, .flashcard-back {
  position: absolute;
  width: 100%;
  height: 100%;
  backface-visibility: hidden;
  border-radius: 12px;
  border: 2px solid #e2e8f0;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 2rem;
}

.flashcard-front {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.flashcard-back {
  background: linear-gradient(135deg, #48bb78 0%, #38a169 100%);
  color: white;
  transform: rotateY(180deg);
}

.card-type {
  font-size: 0.875rem;
  font-weight: 500;
  opacity: 0.8;
  margin-bottom: 1rem;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.card-content {
  font-size: 1.25rem;
  line-height: 1.6;
  font-weight: 500;
}

.card-controls {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.control-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  border: 1px solid #e2e8f0;
  background: white;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  font-weight: 500;
  color: #4a5568;
}

.control-btn:hover:not(:disabled) {
  background: #f7fafc;
  border-color: #cbd5e0;
}

.control-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.card-counter {
  font-weight: 600;
  color: #4a5568;
  padding: 0.75rem 1rem;
  background: #f7fafc;
  border-radius: 8px;
}

.difficulty-buttons {
  display: flex;
  gap: 1rem;
  justify-content: center;
}

.difficulty-btn {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
  transition: transform 0.2s ease;
}

.difficulty-btn:hover {
  transform: translateY(-2px);
}

.difficulty-btn.easy {
  background: #c6f6d5;
  color: #38a169;
}

.difficulty-btn.medium {
  background: #feebc8;
  color: #dd6b20;
}

.difficulty-btn.hard {
  background: #fed7d7;
  color: #c53030;
}

.flashcards-sidebar {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.progress-section, .recent-activity, .create-new {
  background: white;
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.progress-section h4, .recent-activity h4 {
  color: #2d3748;
  margin: 0 0 1rem 0;
  font-size: 1.125rem;
  font-weight: 600;
}

.progress-bar {
  width: 100%;
  height: 8px;
  background: #e2e8f0;
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 0.5rem;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #ed8936, #dd6b20);
  transition: width 0.3s ease;
}

.activity-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.activity-item {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 0.75rem 0;
  border-bottom: 1px solid #e2e8f0;
}

.activity-item:last-child {
  border-bottom: none;
}

.activity-text {
  color: #4a5568;
  font-size: 0.875rem;
  flex: 1;
}

.activity-time {
  color: #a0aec0;
  font-size: 0.75rem;
  white-space: nowrap;
  margin-left: 1rem;
}

.create-btn {
  width: 100%;
  padding: 0.75rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
  transition: transform 0.2s ease;
}

.create-btn:hover {
  transform: translateY(-2px);
}

/* Modern Button Styles */
.btn-primary,
.btn-secondary {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.875rem 1.5rem;
  border-radius: 12px;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  border: none;
  text-decoration: none;
  min-height: 44px;
  white-space: nowrap;
}

.btn-primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  box-shadow: 0 2px 8px rgba(102, 126, 234, 0.2);
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(102, 126, 234, 0.3);
}

.btn-primary:active {
  transform: translateY(0);
}

.btn-secondary {
  background: white;
  color: #4a5568;
  border: 2px solid #e2e8f0;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.btn-secondary:hover {
  background: #f7fafc;
  border-color: #cbd5e0;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.btn-secondary:active {
  transform: translateY(0);
}

.btn-primary svg,
.btn-secondary svg {
  width: 18px;
  height: 18px;
  stroke-width: 2;
}

/* Enhanced List Header */
.list-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: white;
  padding: 1.5rem 2rem;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  border: 1px solid #e2e8f0;
  margin-bottom: 2rem;
}

.list-title-section {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.filter-reset-btn {
  background: #f7fafc;
  color: #4a5568;
  border: 1px solid #e2e8f0;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.filter-reset-btn:hover {
  background: #edf2f7;
  border-color: #cbd5e0;
}

.list-header h3 {
  margin: 0;
  color: #2d3748;
  font-size: 1.5rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.list-header h3::before {
  content: "";
  width: 4px;
  height: 24px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 2px;
}

.list-controls {
  display: flex;
  gap: 1rem;
  align-items: center;
}

.flashcards-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
  gap: 1.5rem;
}

.flashcard-item {
  border: 1px solid #e2e8f0;
  border-radius: 16px;
  padding: 1.75rem;
  background: white;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.flashcard-item:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 30px rgba(0, 0, 0, 0.12);
  border-color: #cbd5e0;
}

.flashcard-item-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
}

.flashcard-categories {
  display: flex;
  flex-wrap: wrap;
  gap: 0.25rem;
}

.category-tag-small {
  background: linear-gradient(135deg, #4299e1 0%, #3182ce 100%);
  color: white;
  padding: 0.25rem 0.75rem;
  border-radius: 16px;
  font-size: 0.625rem;
  font-weight: 600;
  text-transform: capitalize;
  letter-spacing: 0.025em;
  box-shadow: 0 1px 3px rgba(66, 153, 225, 0.2);
}

.flashcard-actions {
  display: flex;
  gap: 0.5rem;
}

.action-btn {
  background: white;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  padding: 0.625rem;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.action-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.action-btn.edit {
  color: #4299e1;
  border-color: #4299e1;
}

.action-btn.edit:hover {
  background: #ebf8ff;
  border-color: #3182ce;
}

.action-btn.delete {
  color: #e53e3e;
  border-color: #e53e3e;
}

.action-btn.delete:hover {
  background: #fed7d7;
  border-color: #c53030;
}

.flashcard-content-preview {
  margin-bottom: 1rem;
}

.question-preview,
.answer-preview {
  margin-bottom: 0.75rem;
  line-height: 1.5;
  color: #2d3748;
}

.question-preview strong,
.answer-preview strong {
  color: #4a5568;
  margin-right: 0.5rem;
}

.flashcard-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.75rem;
  color: #718096;
}

.difficulty-indicator {
  padding: 0.25rem 0.5rem;
  border-radius: 12px;
  font-weight: 500;
  text-transform: capitalize;
}

.difficulty-indicator.easy {
  background: #c6f6d5;
  color: #38a169;
}

.difficulty-indicator.medium {
  background: #feebc8;
  color: #dd6b20;
}

.difficulty-indicator.hard {
  background: #fed7d7;
  color: #c53030;
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
  backdrop-filter: blur(4px);
}

.modal-content {
  background: white;
  border-radius: 16px;
  max-width: 600px;
  max-height: 90vh;
  width: 90%;
  overflow-y: auto;
  box-shadow: 0 20px 25px rgba(0, 0, 0, 0.15);
  border: 1px solid #e2e8f0;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem 2rem;
  border-bottom: 1px solid #e2e8f0;
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  border-radius: 16px 16px 0 0;
}

.modal-header h3 {
  margin: 0;
  color: #2d3748;
  font-size: 1.25rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.modal-header h3::before {
  content: "✏️";
  font-size: 1.125rem;
}

.close-btn {
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 8px;
  color: #718096;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.close-btn:hover {
  background-color: #f7fafc;
  color: #2d3748;
  transform: scale(1.1);
}

.modal-body {
  padding: 2rem;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  padding: 1.5rem 2rem;
  border-top: 1px solid #e2e8f0;
  background: #f8f9fa;
  border-radius: 0 0 16px 16px;
}

/* Create Modal Specific Styles */
.create-header::before {
  content: "➕";
  font-size: 1.125rem;
  margin-right: 0.5rem;
}

.modal-body .error-message {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  background: linear-gradient(135deg, #fed7d7 0%, #fbb6ce 100%);
  color: #c53030;
  padding: 1rem 1.25rem;
  border-radius: 12px;
  margin-bottom: 1.5rem;
  border-left: 4px solid #e53e3e;
  font-weight: 500;
}

.modal-body .required {
  color: #e53e3e;
  font-weight: 700;
}

.modal-body .help-text {
  margin-top: 0.5rem;
  color: #718096;
  font-size: 0.875rem;
  font-style: italic;
}

.modal-body .char-count {
  text-align: right;
  margin-top: 0.5rem;
  color: #a0aec0;
  font-size: 0.75rem;
}

.modal-body textarea.error {
  border-color: #e53e3e;
  background: #fef5f5;
}

/* Enhanced Modal Form Styling */
.modal-body .form-group {
  margin-bottom: 1.5rem;
}

.modal-body .form-group label {
  display: block;
  margin-bottom: 0.5rem;
  color: #2d3748;
  font-weight: 600;
  font-size: 0.95rem;
}

.modal-body .categories-input {
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  padding: 1rem;
  background: #f8f9fa;
  transition: border-color 0.2s ease;
}

.modal-body .categories-input:focus-within {
  border-color: #667eea;
  background: white;
}

.modal-body .categories-list {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 0.75rem;
  min-height: 24px;
}

.modal-body .category-tag-input {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 0.375rem 0.75rem;
  border-radius: 20px;
  font-size: 0.875rem;
  font-weight: 500;
}

.modal-body .remove-category {
  background: rgba(255, 255, 255, 0.2);
  border: none;
  color: white;
  border-radius: 50%;
  width: 18px;
  height: 18px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  transition: background-color 0.2s ease;
}

.modal-body .remove-category:hover {
  background: rgba(255, 255, 255, 0.3);
}

.modal-body .add-category {
  display: flex;
  gap: 0.5rem;
}

.modal-body .add-category input {
  flex: 1;
  padding: 0.5rem;
  border: 1px solid #cbd5e0;
  border-radius: 8px;
  font-size: 0.875rem;
  transition: border-color 0.2s ease;
}

.modal-body .add-category input:focus {
  outline: none;
  border-color: #667eea;
}

.modal-body .add-category-btn {
  padding: 0.5rem 1rem;
  background: #4299e1;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 0.875rem;
  font-weight: 500;
  transition: all 0.2s ease;
}

.modal-body .add-category-btn:hover:not(:disabled) {
  background: #3182ce;
}

.modal-body .add-category-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.modal-body textarea {
  width: 100%;
  padding: 1rem;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  font-size: 1rem;
  line-height: 1.5;
  resize: vertical;
  transition: all 0.2s ease;
  background: #f8f9fa;
  font-family: inherit;
}

.modal-body textarea:focus {
  outline: none;
  border-color: #667eea;
  background: white;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

/* Enhanced Modal Action Buttons */
.modal-actions .save-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.875rem 1.5rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  min-height: 44px;
}

.modal-actions .save-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(102, 126, 234, 0.3);
}

.modal-actions .save-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.modal-actions .cancel-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.875rem 1.5rem;
  background: white;
  color: #4a5568;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  min-height: 44px;
}

.modal-actions .cancel-btn:hover:not(:disabled) {
  background: #f7fafc;
  border-color: #cbd5e0;
  transform: translateY(-1px);
}

.modal-actions .cancel-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* Responsive Modal Design */
@media (max-width: 768px) {
  .modal-content {
    width: 95%;
    margin: 1rem;
    max-height: 95vh;
  }
  
  .modal-header,
  .modal-body,
  .modal-actions {
    padding-left: 1rem;
    padding-right: 1rem;
  }
  
  .modal-actions {
    flex-direction: column-reverse;
    gap: 0.75rem;
  }
  
  .modal-body .add-category {
    flex-direction: column;
    gap: 0.75rem;
  }

  .modal-body .add-category input {
    width: 100%;
  }
}
</style>
