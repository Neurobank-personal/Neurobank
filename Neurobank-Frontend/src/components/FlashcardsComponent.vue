<template>
  <div class="flashcards-container">
    <div class="flashcards-header">
      <h2>Flashcards</h2>
      <p class="subtitle">Granska och träna med dina flashcards</p>
    </div>

    <div class="flashcards-stats">
      <div class="stat-card">
        <div class="stat-number">25</div>
        <div class="stat-label">Totala kort</div>
      </div>
      <div class="stat-card">
        <div class="stat-number">18</div>
        <div class="stat-label">Avklarade</div>
      </div>
      <div class="stat-card">
        <div class="stat-number">7</div>
        <div class="stat-label">Återstående</div>
      </div>
    </div>

    <div class="flashcards-content">
      <div class="flashcard-deck">
        <h3>Aktiv uppsättning</h3>
        <div class="flashcard" :class="{ flipped: isFlipped }" @click="flipCard">
          <div class="flashcard-inner">
            <div class="flashcard-front">
              <div class="card-type">Fråga</div>
              <div class="card-content">
                {{ currentCard.question }}
              </div>
            </div>
            <div class="flashcard-back">
              <div class="card-type">Svar</div>
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
            Föregående
          </button>
          
          <div class="card-counter">
            {{ currentIndex + 1 }} / {{ flashcards.length }}
          </div>
          
          <button class="control-btn next" @click="nextCard" :disabled="currentIndex === flashcards.length - 1">
            Nästa
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="9,18 15,12 9,6"/>
            </svg>
          </button>
        </div>

        <div class="difficulty-buttons">
          <button class="difficulty-btn easy" @click="markCard('easy')">
            Lätt
          </button>
          <button class="difficulty-btn medium" @click="markCard('medium')">
            Medium
          </button>
          <button class="difficulty-btn hard" @click="markCard('hard')">
            Svårt
          </button>
        </div>
      </div>

      <div class="flashcards-sidebar">
        <div class="progress-section">
          <h4>Framsteg idag</h4>
          <div class="progress-bar">
            <div class="progress-fill" :style="{ width: progressPercentage + '%' }"></div>
          </div>
          <p>{{ completedToday }} av {{ totalCards }} kort</p>
        </div>

        <div class="recent-activity">
          <h4>Senaste aktivitet</h4>
          <ul class="activity-list">
            <li class="activity-item">
              <span class="activity-text">Avklarade "JavaScript Grunder"</span>
              <span class="activity-time">5 min sedan</span>
            </li>
            <li class="activity-item">
              <span class="activity-text">Skapade ny uppsättning</span>
              <span class="activity-time">1 timme sedan</span>
            </li>
            <li class="activity-item">
              <span class="activity-text">Granskade 10 kort</span>
              <span class="activity-time">2 timmar sedan</span>
            </li>
          </ul>
        </div>

        <div class="create-new">
          <button class="create-btn" @click="showCreateForm = !showCreateForm">
            {{ showCreateForm ? 'Avbryt' : 'Skapa nytt kort' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Create new flashcard form -->
    <div v-if="showCreateForm" class="create-form">
      <h3>Skapa nytt flashcard</h3>
      <div class="form-group">
        <label>Fråga</label>
        <textarea v-model="newCard.question" placeholder="Skriv din fråga här..." rows="3"></textarea>
      </div>
      <div class="form-group">
        <label>Svar</label>
        <textarea v-model="newCard.answer" placeholder="Skriv svaret här..." rows="3"></textarea>
      </div>
      <div class="form-actions">
        <button class="save-btn" @click="saveNewCard">Spara kort</button>
        <button class="cancel-btn" @click="cancelCreate">Avbryt</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

interface Flashcard {
  id: number
  question: string
  answer: string
  difficulty?: 'easy' | 'medium' | 'hard'
  lastReviewed?: Date
}

const isFlipped = ref(false)
const currentIndex = ref(0)
const showCreateForm = ref(false)
const completedToday = ref(18)
const totalCards = ref(25)

const newCard = ref({
  question: '',
  answer: ''
})

const flashcards = ref<Flashcard[]>([
  {
    id: 1,
    question: "Vad är Vue.js?",
    answer: "Vue.js är ett progressivt JavaScript-ramverk för att bygga användarinterface och single-page applications."
  },
  {
    id: 2,
    question: "Vad betyder 'reactive' i Vue?",
    answer: "Reactive betyder att Vue automatiskt upptäcker ändringar i data och uppdaterar DOM:en i enlighet därmed."
  },
  {
    id: 3,
    question: "Vad är en Vue-komponent?",
    answer: "En Vue-komponent är en återanvändbar Vue-instans med ett namn, som kan användas som ett anpassat element."
  }
])

const currentCard = computed(() => flashcards.value[currentIndex.value])
const progressPercentage = computed(() => (completedToday.value / totalCards.value) * 100)

const flipCard = () => {
  isFlipped.value = !isFlipped.value
}

const nextCard = () => {
  if (currentIndex.value < flashcards.value.length - 1) {
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
  flashcards.value[currentIndex.value].difficulty = difficulty
  flashcards.value[currentIndex.value].lastReviewed = new Date()
  completedToday.value++
  nextCard()
}

const saveNewCard = () => {
  if (newCard.value.question && newCard.value.answer) {
    flashcards.value.push({
      id: Date.now(),
      question: newCard.value.question,
      answer: newCard.value.answer
    })
    totalCards.value++
    newCard.value = { question: '', answer: '' }
    showCreateForm.value = false
  }
}

const cancelCreate = () => {
  newCard.value = { question: '', answer: '' }
  showCreateForm.value = false
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

.create-form {
  background: white;
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  margin-top: 2rem;
}

.create-form h3 {
  color: #2d3748;
  margin: 0 0 1.5rem 0;
  font-size: 1.25rem;
  font-weight: 600;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  color: #4a5568;
  font-weight: 500;
  margin-bottom: 0.5rem;
}

.form-group textarea {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-size: 1rem;
  resize: vertical;
}

.form-group textarea:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.form-actions {
  display: flex;
  gap: 1rem;
}

.save-btn, .cancel-btn {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
  transition: transform 0.2s ease;
}

.save-btn {
  background: linear-gradient(135deg, #48bb78 0%, #38a169 100%);
  color: white;
}

.cancel-btn {
  background: #e2e8f0;
  color: #4a5568;
}

.save-btn:hover, .cancel-btn:hover {
  transform: translateY(-2px);
}

@media (max-width: 768px) {
  .flashcards-container {
    padding: 1rem;
  }
  
  .flashcards-content {
    grid-template-columns: 1fr;
  }
  
  .flashcards-stats {
    grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  }
  
  .control-btn {
    padding: 0.5rem 1rem;
    font-size: 0.875rem;
  }
  
  .difficulty-buttons {
    flex-direction: column;
  }
}
</style>
