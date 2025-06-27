<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { handleCreateNote, handleProcessNote } from '../services/handleNotes'
import { useAuth } from '../stores/auth'

const router = useRouter()
const { getCurrentUserId, isAuthenticated } = useAuth()

const title = ref('')
const content = ref('')
const processType = ref<'none' | 'summarize' | 'expand'>('none')
const isLoading = ref(false)
const errorMessage = ref('')
const successMessage = ref('')
const processedContent = ref('')

// Hämta användar-ID från auth store
const userId = computed(() => getCurrentUserId())

// Omdirigera till login om inte inloggad
onMounted(() => {
  if (!isAuthenticated.value) {
    router.push('/loginpage')
  }
})

const handleSubmit = async () => {
  if (!userId.value) {
    errorMessage.value = 'Du måste vara inloggad för att skapa anteckningar'
    router.push('/loginpage')
    return
  }

  errorMessage.value = ''
  successMessage.value = ''
  isLoading.value = true
  
  try {
    const result = await handleCreateNote({
      title: title.value,
      content: content.value,
      processType: processType.value,
      userId: userId.value
    })
    
    if (result.success) {
      successMessage.value = result.message || 'Anteckning skapad!'
      
      // Om AI-bearbetning valdes
      if (processType.value !== 'none' && result.note) {
        const processResult = await handleProcessNote({
          noteId: result.note.id,
          processType: processType.value
        })
        
        if (processResult.success && processResult.note) {
          processedContent.value = processResult.note.processedContent || ''
          successMessage.value += ' AI-bearbetning klar!'
        }
      }
      
      // Rensa formulär
      title.value = ''
      content.value = ''
      processType.value = 'none'
    } else {
      errorMessage.value = result.error || 'Ett fel uppstod'
    }
  } catch (error) {
    errorMessage.value = 'Ett oväntat fel uppstod'
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <div class="notes-container">
    <div class="notes-card">
      <h1>Skapa Anteckning</h1>
      
      <div v-if="errorMessage" class="error-message">
        {{ errorMessage }}
      </div>
      
      <div v-if="successMessage" class="success-message">
        {{ successMessage }}
      </div>
      
      <form @submit.prevent="handleSubmit" class="notes-form">
        <div class="input-group">
          <label for="title">Titel</label>
          <input 
            id="title"
            type="text" 
            v-model="title" 
            placeholder="Ange en titel för din anteckning"
            required
            :disabled="isLoading"
          />
        </div>
        
        <div class="input-group">
          <label for="content">Innehåll (upp till 20,000 tecken)</label>
          <textarea 
            id="content"
            v-model="content" 
            placeholder="Skriv din anteckning här..."
            rows="15"
            maxlength="20000"
            required
            :disabled="isLoading"
          ></textarea>
          <small>{{ content.length }}/20,000 tecken</small>
        </div>
        
        <div class="input-group">
          <label for="processType">AI-bearbetning</label>
          <select id="processType" v-model="processType" :disabled="isLoading">
            <option value="none">Ingen bearbetning</option>
            <option value="summarize">Låt AI sammanfatta</option>
            <option value="expand">Låt AI utveckla texten</option>
          </select>
        </div>
        
        <button type="submit" class="submit-btn" :disabled="isLoading">
          {{ isLoading ? 'Bearbetar...' : 'Spara anteckning' }}
        </button>
      </form>
      
      <div v-if="processedContent" class="processed-content">
        <h3>AI-bearbetad text:</h3>
        <div class="content-box">
          {{ processedContent }}
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.notes-container {
  display: flex;
  justify-content: center;
  align-items: flex-start;
  min-height: 100vh;
  padding: 2rem;
  background-color: #f5f5f5;
}

.notes-card {
  background: white;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 800px;
}

.notes-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.input-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.input-group label {
  font-weight: 500;
  color: #555;
}

.input-group input,
.input-group textarea,
.input-group select {
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
  font-family: inherit;
}

.input-group textarea {
  resize: vertical;
  min-height: 200px;
}

.input-group small {
  color: #666;
  font-size: 0.875rem;
}

.submit-btn {
  padding: 1rem;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  cursor: pointer;
}

.submit-btn:hover:not(:disabled) {
  background-color: #0056b3;
}

.submit-btn:disabled {
  background-color: #6c757d;
  cursor: not-allowed;
}

.error-message {
  background-color: #f8d7da;
  color: #721c24;
  padding: 0.75rem;
  border-radius: 4px;
  margin-bottom: 1rem;
}

.success-message {
  background-color: #d4edda;
  color: #155724;
  padding: 0.75rem;
  border-radius: 4px;
  margin-bottom: 1rem;
  border: 1px solid #c3e6cb;
}

.processed-content {
  margin-top: 2rem;
  padding-top: 2rem;
  border-top: 1px solid #eee;
}

.content-box {
  background-color: #f8f9fa;
  padding: 1rem;
  border-radius: 4px;
  border-left: 4px solid #007bff;
  white-space: pre-wrap;
  font-family: 'Arial', sans-serif;
  line-height: 1.6;
}
</style>