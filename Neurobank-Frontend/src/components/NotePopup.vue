<template>
  <div class="note-popup-overlay" @click="closePopup">
    <div class="note-popup" @click.stop>
      <div class="popup-header">
        <h2>{{ note.title }}</h2>
        <button class="close-btn" @click="closePopup">
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>

      <div class="popup-content">
        <div class="note-meta">
          <div class="meta-item">
            <span class="meta-label">Skapad:</span>
            <span class="meta-value">{{ formatDate(note.createdAt) }}</span>
          </div>
          <div class="meta-item" v-if="note.updatedAt !== note.createdAt">
            <span class="meta-label">Uppdaterad:</span>
            <span class="meta-value">{{ formatDate(note.updatedAt) }}</span>
          </div>
          <div
            class="meta-item"
            v-if="note.processType && note.processType !== 'none'"
          >
            <span class="meta-label">AI-bearbetning:</span>
            <span class="meta-value">{{
              getProcessTypeLabel(note.processType)
            }}</span>
          </div>
        </div>

        <div class="note-content">
          <h3>Innehåll:</h3>
          <div class="content-text">{{ note.content }}</div>
        </div>

        <div v-if="note.processedContent" class="processed-content">
          <h3>AI-bearbetad text:</h3>
          <div class="processed-text">{{ note.processedContent }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Note {
  id: string;
  title: string;
  content: string;
  processType?: string;
  userId: string;
  createdAt: string | Date;
  updatedAt: string | Date;
  processedContent?: string;
}

interface Props {
  note: Note;
}

interface Emits {
  (e: "close"): void;
}

defineProps<Props>();
const emit = defineEmits<Emits>();

const closePopup = () => {
  emit("close");
};

const formatDate = (dateInput: string | Date) => {
  const date = dateInput instanceof Date ? dateInput : new Date(dateInput);
  return date.toLocaleString("sv-SE", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const getProcessTypeLabel = (processType: string) => {
  switch (processType) {
    case "summarize":
      return "Sammanfattning";
    case "expand":
      return "Utökning";
    default:
      return processType;
  }
};
</script>

<style scoped>
.note-popup-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  backdrop-filter: blur(8px);
}

.note-popup {
  background: rgba(15, 23, 42, 0.95);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 24px;
  width: 90vw;
  max-width: 800px;
  max-height: 90vh;
  overflow: hidden;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
  animation: popupAnimation 0.3s ease-out;
  color: #ffffff;
}

@keyframes popupAnimation {
  from {
    opacity: 0;
    transform: scale(0.9) translateY(-20px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

.popup-header {
  padding: 2rem 2rem 1rem 2rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  background: linear-gradient(135deg, #3b82f6, #8b5cf6);
  color: white;
}

.popup-header h2 {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 600;
  flex: 1;
  margin-right: 1rem;
}

.close-btn {
  background: rgba(255, 255, 255, 0.2);
  border: none;
  border-radius: 8px;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background-color 0.2s ease;
  color: white;
}

.close-btn:hover {
  background: rgba(255, 255, 255, 0.3);
}

.popup-content {
  padding: 2rem;
  overflow-y: auto;
  max-height: calc(90vh - 120px);
}

.note-meta {
  margin-bottom: 2rem;
  padding: 1rem;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  border-left: 4px solid #667eea;
}

.meta-item {
  display: flex;
  margin-bottom: 0.5rem;
}

.meta-item:last-child {
  margin-bottom: 0;
}

.meta-label {
  font-weight: 600;
  color: #4a5568;
  min-width: 120px;
}

.meta-value {
  color: #718096;
}

.note-content,
.processed-content {
  margin-bottom: 2rem;
}

.note-content h3,
.processed-content h3 {
  color: #2d3748;
  font-size: 1.25rem;
  font-weight: 600;
  margin: 0 0 1rem 0;
}

.content-text,
.processed-text {
  background: rgba(255, 255, 255, 0.05);
  padding: 1.5rem;
  border-radius: 8px;
  border-left: 4px solid #48bb78;
  white-space: pre-wrap;
  line-height: 1.7;
  color: #4a5568;
  font-size: 1rem;
}

.processed-text {
  border-left-color: #ed8936;
}

@media (max-width: 768px) {
  .note-popup {
    width: 95vw;
    margin: 1rem;
  }

  .popup-header {
    padding: 1.5rem 1.5rem 1rem 1.5rem;
  }

  .popup-header h2 {
    font-size: 1.25rem;
  }

  .popup-content {
    padding: 1.5rem;
  }

  .meta-item {
    flex-direction: column;
    gap: 0.25rem;
  }

  .meta-label {
    min-width: auto;
  }
}
</style>
