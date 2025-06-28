<template>
  <div class="note-viewer">
    <div class="note-viewer-header">
      <div class="header-left">
        <div class="header-icon">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
            <polyline points="14,2 14,8 20,8"/>
            <line x1="16" y1="13" x2="8" y2="13"/>
            <line x1="16" y1="17" x2="8" y2="17"/>
            <line x1="10" y1="9" x2="8" y2="9"/>
          </svg>
        </div>
        <div class="header-text">
          <h3>{{ localNote.title }}</h3>
          <p>{{ formatDate(localNote.createdAt) }}</p>
        </div>
      </div>
      <div class="header-actions">
        <button class="action-btn close-btn" @click="$emit('close')">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="18" y1="6" x2="6" y2="18"/>
            <line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
          Close
        </button>
      </div>
    </div>

    <!-- Success/Error Messages -->
    <div v-if="successMessage" class="success-message">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
        <polyline points="22,4 12,14.01 9,11.01"/>
      </svg>
      {{ successMessage }}
    </div>

    <div v-if="errorMessage" class="error-message">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="12" cy="12" r="10"/>
        <line x1="15" y1="9" x2="9" y2="15"/>
        <line x1="9" y1="9" x2="15" y2="15"/>
      </svg>
      {{ errorMessage }}
    </div>

    <div class="note-content">
      <!-- Original Note Section -->
      <div class="note-section">
        <div class="section-header">
          <div class="section-title">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
              <polyline points="14,2 14,8 20,8"/>
            </svg>
            <h4>Original note</h4>
          </div>
          <div class="section-actions" v-if="!isEditMode">
            <button 
              class="edit-section-btn" 
              @click="startEditingOriginal"
              :disabled="isLoading"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
              </svg>
              Edit
            </button>
          </div>
        </div>
        
        <div v-if="editingOriginal" class="edit-form">
          <div class="form-group">
            <label class="form-label">Title</label>
            <input 
              v-model="editTitle" 
              class="form-input"
              :disabled="isLoading"
              placeholder="Enter title..."
            />
          </div>
          <div class="form-group">
            <label class="form-label">Content</label>
            <textarea 
              v-model="editContent" 
              class="form-textarea"
              rows="10"
              :disabled="isLoading"
              placeholder="Write your note here..."
            ></textarea>
          </div>
          <div class="form-actions">
            <button 
              class="save-btn" 
              @click="saveOriginal"
              :disabled="isLoading || !editTitle.trim() || !editContent.trim()"
            >
              <svg v-if="!isLoading" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
                <polyline points="17,21 17,13 7,13 7,21"/>
                <polyline points="7,3 7,8 15,8"/>
              </svg>
              <div v-else class="loading-spinner-small"></div>
              {{ isLoading ? 'Saving...' : 'Save changes' }}
            </button>
            <button class="cancel-btn" @click="cancelEditingOriginal" :disabled="isLoading">
              Cancel
            </button>
          </div>
        </div>
        
        <div v-else class="content-display">
          <div class="content-text">{{ localNote.content }}</div>
          <div class="content-meta">
            <span class="word-count">{{ getWordCount(localNote.content) }} words</span>
            <span class="char-count">{{ localNote.content.length }} characters</span>
            <span class="reading-time">{{ getReadingTime(localNote.content) }} min reading</span>
          </div>
        </div>
      </div>

      <!-- AI Processed Section -->
      <div v-if="localNote.processedContent" class="note-section ai-section">
        <div class="section-header">
          <div class="section-title">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"/>
            </svg>
            <h4>AI-processed version</h4>
            <span class="ai-badge">{{ getProcessTypeLabel(localNote.processType) }}</span>
          </div>
          <div class="section-actions" v-if="!isEditMode">
            <button 
              class="edit-section-btn" 
              @click="startEditingProcessed"
              :disabled="isLoading"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
              </svg>
              Edit
            </button>
          </div>
        </div>
        
        <div v-if="editingProcessed" class="edit-form">
          <div class="form-group">
            <label class="form-label">AI-processed text</label>
            <textarea 
              v-model="editProcessedContent" 
              class="form-textarea"
              rows="8"
              :disabled="isLoading"
              placeholder="Edit the AI-processed text..."
            ></textarea>
          </div>
          <div class="form-actions">
            <button 
              class="save-btn" 
              @click="saveProcessed"
              :disabled="isLoading || !editProcessedContent.trim()"
            >
              <svg v-if="!isLoading" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
                <polyline points="17,21 17,13 7,13 7,21"/>
                <polyline points="7,3 7,8 15,8"/>
              </svg>
              <div v-else class="loading-spinner-small"></div>
              {{ isLoading ? 'Saving...' : 'Save changes' }}
            </button>
            <button class="cancel-btn" @click="cancelEditingProcessed" :disabled="isLoading">
              Cancel
            </button>
          </div>
        </div>
        
        <div v-else class="content-display ai-content">
          <div class="content-text">{{ localNote.processedContent }}</div>
          <div class="content-meta">
            <span class="word-count">{{ getWordCount(localNote.processedContent || '') }} words</span>
            <span class="char-count">{{ (localNote.processedContent || '').length }} characters</span>
            <span class="reading-time">{{ getReadingTime(localNote.processedContent || '') }} min reading</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { handleUpdateNote } from '../services/handleNotes'
import type { Note } from '../types/Note'

interface Props {
  note: Note
}

const props = defineProps<Props>()
const emit = defineEmits<{
  close: []
  noteUpdated: [note: Note]
}>()

// Use reactive local copy of the note that updates immediately
const localNote = ref<Note>({ ...props.note })

// Edit states
const isEditMode = ref(false)
const editingOriginal = ref(false)
const editingProcessed = ref(false)
const isLoading = ref(false)

// Edit form data - initialize from local note
const editTitle = ref(localNote.value.title)
const editContent = ref(localNote.value.content)
const editProcessedContent = ref(localNote.value.processedContent || '')

// Messages
const successMessage = ref('')
const errorMessage = ref('')

// Watch for prop changes and update local note
watch(() => props.note, (newNote) => {
  localNote.value = { ...newNote }
  editTitle.value = newNote.title
  editContent.value = newNote.content
  editProcessedContent.value = newNote.processedContent || ''
}, { deep: true })


const startEditingOriginal = () => {
  editingOriginal.value = true
  editTitle.value = localNote.value.title
  editContent.value = localNote.value.content
}

const startEditingProcessed = () => {
  editingProcessed.value = true
  editProcessedContent.value = localNote.value.processedContent || ''
}

const cancelEditingOriginal = () => {
  editingOriginal.value = false
  editTitle.value = localNote.value.title
  editContent.value = localNote.value.content
}

const cancelEditingProcessed = () => {
  editingProcessed.value = false
  editProcessedContent.value = localNote.value.processedContent || ''
}

const saveOriginal = async () => {
  if (!editTitle.value.trim() || !editContent.value.trim()) return
  
  isLoading.value = true
  errorMessage.value = ''
  
  try {
    const result = await handleUpdateNote(props.note.id, {
      title: editTitle.value,
      content: editContent.value
    })
    
    if (result.success) {
      // Update local note immediately for UI responsiveness
      localNote.value = {
        ...localNote.value,
        title: result.note.title,
        content: result.note.content,
        updatedAt: result.note.updatedAt
      }
      
      // Emit to parent for data consistency
      emit('noteUpdated', result.note)
      editingOriginal.value = false
      successMessage.value = result.message
      
      setTimeout(() => {
        successMessage.value = ''
      }, 3000)
    } else {
      errorMessage.value = result.error
    }
    
  } catch (error) {
    errorMessage.value = 'Could not save changes'
  } finally {
    isLoading.value = false
  }
}

const saveProcessed = async () => {
  if (!editProcessedContent.value.trim()) return
  
  isLoading.value = true
  errorMessage.value = ''
  
  try {
    const result = await handleUpdateNote(props.note.id, {
      processedContent: editProcessedContent.value
    })
    
    if (result.success) {
      // Update local note immediately for UI responsiveness
      localNote.value = {
        ...localNote.value,
        processedContent: result.note.processedContent,
        updatedAt: result.note.updatedAt
      }
      
      // Emit to parent for data consistency
      emit('noteUpdated', result.note)
      editingProcessed.value = false
      successMessage.value = result.message
      
      setTimeout(() => {
        successMessage.value = ''
      }, 3000)
    } else {
      errorMessage.value = result.error
    }
    
  } catch (error) {
    errorMessage.value = 'Could not save changes'
  } finally {
    isLoading.value = false
  }
}

const formatDate = (dateInput: string | Date) => {
  const date = dateInput instanceof Date ? dateInput : new Date(dateInput)
  return date.toLocaleDateString('sv-SE', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const getWordCount = (text: string) => {
  if (!text.trim()) return 0
  return text.trim().split(/\s+/).length
}

const getReadingTime = (text: string) => {
  const wordsPerMinute = 200
  const wordCount = getWordCount(text)
  const minutes = Math.ceil(wordCount / wordsPerMinute)
  return Math.max(1, minutes)
}

const getProcessTypeLabel = (processType: string) => {
  switch (processType) {
    case 'summarize': return 'Summary'
    case 'expand': return 'Expansion'
    default: return processType
  }
}
</script>

<style scoped>
.note-viewer {
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  border: 1px solid #e2e8f0;
  margin-bottom: 2rem;
  overflow: hidden;
}

.note-viewer-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 2rem;
  border-bottom: 1px solid #e2e8f0;
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
}

.header-left {
  display: flex;
  align-items: center;
  gap: 1rem;
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
  line-height: 1.3;
}

.header-text p {
  color: #718096;
  margin: 0;
  font-size: 0.95rem;
}

.header-actions {
  display: flex;
  gap: 0.75rem;
}

.action-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  border: none;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 0.9rem;
}

.edit-btn {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.edit-btn:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}

.close-btn {
  background: #f7fafc;
  color: #4a5568;
  border: 1px solid #e2e8f0;
}

.close-btn:hover {
  background: #edf2f7;
  border-color: #cbd5e0;
}

.action-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.note-content {
  padding: 2rem;
}

.note-section {
  margin-bottom: 2rem;
}

.note-section:last-child {
  margin-bottom: 0;
}

.ai-section {
  border-top: 1px solid #e2e8f0;
  padding-top: 2rem;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.section-title svg {
  color: #667eea;
}

.section-title h4 {
  color: #2d3748;
  font-size: 1.25rem;
  font-weight: 600;
  margin: 0;
}

.ai-badge {
  background: linear-gradient(135deg, #ed8936 0%, #dd6b20 100%);
  color: white;
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.section-actions {
  display: flex;
  gap: 0.5rem;
}

.edit-section-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0.75rem;
  background: #f7fafc;
  color: #4a5568;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.edit-section-btn:hover:not(:disabled) {
  background: #edf2f7;
  border-color: #cbd5e0;
}

.edit-section-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.content-display {
  background: #f8f9fa;
  border-radius: 12px;
  padding: 1.5rem;
  border: 1px solid #e2e8f0;
}

.ai-content {
  background: linear-gradient(135deg, #fef5e7 0%, #fed7aa 100%);
  border-left: 4px solid #ed8936;
}

.content-text {
  color: #2d3748;
  line-height: 1.7;
  font-size: 1rem;
  white-space: pre-wrap;
  margin-bottom: 1rem;
}

.ai-content .content-text {
  color: #7c2d12;
}

.content-meta {
  display: flex;
  gap: 1rem;
  color: #718096;
  font-size: 0.875rem;
  padding-top: 1rem;
  border-top: 1px solid rgba(113, 128, 150, 0.2);
}

.edit-form {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  border: 2px solid #667eea;
  box-shadow: 0 0 0 4px rgba(102, 126, 234, 0.1);
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group:last-of-type {
  margin-bottom: 0;
}

.form-label {
  display: block;
  color: #4a5568;
  font-weight: 600;
  margin-bottom: 0.5rem;
  font-size: 0.95rem;
}

.form-input,
.form-textarea {
  width: 100%;
  padding: 0.875rem;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  font-size: 1rem;
  transition: all 0.2s ease;
  background: #fafafa;
  font-family: inherit;
  line-height: 1.6;
}

.form-input:focus,
.form-textarea:focus {
  outline: none;
  border-color: #667eea;
  background: white;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.form-textarea {
  resize: vertical;
  min-height: 120px;
}

.form-actions {
  display: flex;
  gap: 0.75rem;
  margin-top: 1.5rem;
  padding-top: 1.5rem;
  border-top: 1px solid #e2e8f0;
}

.save-btn,
.cancel-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  border: none;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 0.9rem;
}

.save-btn {
  background: linear-gradient(135deg, #48bb78 0%, #38a169 100%);
  color: white;
}

.save-btn:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(72, 187, 120, 0.3);
}

.save-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.cancel-btn {
  background: #f7fafc;
  color: #4a5568;
  border: 1px solid #e2e8f0;
}

.cancel-btn:hover:not(:disabled) {
  background: #edf2f7;
  border-color: #cbd5e0;
}

.loading-spinner-small {
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top: 2px solid white;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* Messages */
.success-message,
.error-message {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem 2rem;
  margin: 0;
  font-weight: 500;
}

.success-message {
  background: linear-gradient(135deg, #c6f6d5 0%, #9ae6b4 100%);
  color: #2f855a;
  border-bottom: 1px solid rgba(47, 133, 90, 0.2);
}

.error-message {
  background: linear-gradient(135deg, #fed7d7 0%, #fbb6ce 100%);
  color: #c53030;
  border-bottom: 1px solid rgba(197, 48, 48, 0.2);
}

/* Responsive Design */
@media (max-width: 768px) {
  .note-viewer-header {
    flex-direction: column;
    gap: 1rem;
    align-items: flex-start;
  }
  
  .header-actions {
    width: 100%;
    justify-content: flex-end;
  }
  
  .note-content {
    padding: 1.5rem;
  }
  
  .section-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }
  
  .content-meta {
    flex-direction: column;
    gap: 0.5rem;
  }
  
  .form-actions {
    flex-direction: column;
  }
}
</style>
