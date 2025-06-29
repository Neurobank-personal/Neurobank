<template>
  <div class="deck-overview-container">
    <div class="deck-overview-header">
      <h2>Flashcard Decks</h2>
      <p class="subtitle">Organize your flashcards into themed collections</p>
      <button class="btn-primary" @click="showCreateDeckForm = true">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M12 5v14M5 12h14"/>
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
      <div class="deck-card general-collection" @click="$emit('viewDeck', null)">
        <div class="deck-header">
          <div class="deck-icon">🎯</div>
          <div class="deck-actions">
            <span class="card-count">{{ generalFlashcardsCount }}</span>
          </div>
        </div>
        <div class="deck-content">
          <h3>General Collection</h3>
          <p>All unorganized flashcards</p>
        </div>
        <div class="deck-footer">
          <div class="deck-meta">
            <span class="last-studied">Always available</span>
          </div>
        </div>
      </div>

      <!-- Empty State Message (when no custom decks) -->
      <div v-if="decks.length === 0" class="empty-deck-message">
        <div class="empty-icon">📚</div>
        <h3>No custom decks yet</h3>
        <p>Create your first deck to organize your flashcards by topic or subject.</p>
        <button class="create-btn" @click="showCreateDeckForm = true">Create Your First Deck</button>
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
          <div class="deck-icon" :style="{ backgroundColor: deck.color || '#6b7280' }">
            {{ deck.name.charAt(0).toUpperCase() }}
          </div>
          <div class="deck-actions">
            <button class="edit-btn" @click.stop="editDeck(deck)" title="Edit deck">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                <path d="m18.5 2.5 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
              </svg>
            </button>
            <button class="delete-btn" @click.stop="deleteDeck(deck.id)" title="Delete deck">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m3 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6h14zM10 11v6M14 11v6"/>
              </svg>
            </button>
            <span class="card-count">{{ deck.flashcardCount || 0 }}</span>
          </div>
        </div>
        <div class="deck-content">
          <h3>{{ deck.name }}</h3>
          <p>{{ deck.description || 'No description' }}</p>
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
    <div v-if="showCreateDeckForm" class="modal-overlay" @click="cancelCreateDeck">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>{{ editingDeck ? 'Edit Deck' : 'Create New Deck' }}</h3>
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
            <button type="submit" class="save-btn" :disabled="!deckForm.name.trim()">
              {{ editingDeck ? 'Save Changes' : 'Create Deck' }}
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
import { ref, computed, onMounted } from 'vue'
import { useAuth } from '../stores/auth'
import DeckService from '../services/DeckService'
import FlashcardService from '../services/FlashcardService'
import type { Deck } from '../types/Deck'

// Emits
defineEmits<{
  viewDeck: [deckId: string | null]
}>()

const { getCurrentUserId } = useAuth()

// Reactive data
const decks = ref<Deck[]>([])
const loading = ref(true)
const error = ref('')
const showCreateDeckForm = ref(false)
const editingDeck = ref<Deck | null>(null)
const generalFlashcardsCount = ref(0)

const deckForm = ref({
  name: '',
  description: '',
  color: ''
})

const colorOptions = [
  '#ef4444', '#f97316', '#eab308', '#22c55e', 
  '#06b6d4', '#3b82f6', '#8b5cf6', '#ec4899'
]

const userId = computed(() => getCurrentUserId())

// Load data on mount
onMounted(async () => {
  await Promise.all([loadDecks(), loadGeneralFlashcardsCount()])
})

const loadDecks = async () => {
  if (!userId.value) {
    error.value = 'You must be logged in to view decks'
    loading.value = false
    return
  }

  try {
    loading.value = true
    decks.value = await DeckService.getUserDecks(userId.value)
    error.value = ''
  } catch (err) {
    error.value = 'Failed to load decks'
    console.error('Error loading decks:', err)
  } finally {
    loading.value = false
  }
}

const loadGeneralFlashcardsCount = async () => {
  if (!userId.value) return

  try {
    const flashcards = await FlashcardService.getUserFlashcards(userId.value)
    // Count flashcards that don't belong to any deck
    generalFlashcardsCount.value = flashcards.filter(card => !card.deckId).length
  } catch (err) {
    console.error('Error loading general flashcards count:', err)
  }
}

const saveDeck = async () => {
  if (!userId.value || !deckForm.value.name.trim()) return

  try {
    if (editingDeck.value) {
      // Update existing deck
      await DeckService.updateDeck({
        id: editingDeck.value.id,
        ...deckForm.value
      })
    } else {
      // Create new deck
      await DeckService.createDeck({
        ...deckForm.value,
        userId: userId.value
      })
    }
    
    await loadDecks()
    cancelCreateDeck()
  } catch (err) {
    console.error('Error saving deck:', err)
    error.value = 'Failed to save deck'
  }
}

const editDeck = (deck: Deck) => {
  editingDeck.value = deck
  deckForm.value = {
    name: deck.name,
    description: deck.description || '',
    color: deck.color || ''
  }
  showCreateDeckForm.value = true
}

const deleteDeck = async (deckId: string) => {
  if (!confirm('Are you sure you want to delete this deck? All flashcards in this deck will be moved to the general collection.')) {
    return
  }

  try {
    await DeckService.deleteDeck(deckId)
    await Promise.all([loadDecks(), loadGeneralFlashcardsCount()])
  } catch (err) {
    console.error('Error deleting deck:', err)
    error.value = 'Failed to delete deck'
  }
}

const cancelCreateDeck = () => {
  showCreateDeckForm.value = false
  editingDeck.value = null
  deckForm.value = {
    name: '',
    description: '',
    color: ''
  }
}

const formatDate = (date: Date) => {
  return new Date(date).toLocaleDateString('sv-SE', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');

.deck-overview-container {
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
  font-family: 'Inter', sans-serif;
}

.deck-overview-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  flex-wrap: wrap;
  gap: 1rem;
}

.deck-overview-header h2 {
  font-size: 2rem;
  font-weight: 700;
  color: #1e293b;
  margin: 0;
}

.subtitle {
  color: #64748b;
  margin: 0.5rem 0 0 0;
  font-size: 1rem;
}

.btn-primary {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
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
.loading-state, .error-state, .empty-state {
  text-align: center;
  padding: 4rem 2rem;
}

.empty-deck-message {
  grid-column: 1 / -1;
  text-align: center;
  padding: 3rem 2rem;
  background: #f8fafc;
  border: 2px dashed #cbd5e1;
  border-radius: 1rem;
  margin-top: 1rem;
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

/* Decks Grid */
.decks-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
  margin-top: 2rem;
}

.deck-card {
  background: white;
  border: 2px solid #e2e8f0;
  border-radius: 1rem;
  padding: 1.5rem;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
}

.deck-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
  border-color: #667eea;
}

.deck-card.general-collection {
  background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
  border-color: #94a3b8;
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
  background: #f1f5f9;
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
  color: #1e293b;
  margin: 0 0 0.5rem 0;
}

.deck-content p {
  color: #64748b;
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
  color: #64748b;
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
  max-width: 500px;
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
  border-color: #1e293b;
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
