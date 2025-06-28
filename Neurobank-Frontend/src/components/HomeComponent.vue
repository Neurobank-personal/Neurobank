<template>
  <div class="dashboard">
    <div class="dashboard-header">
      <h2>Home</h2>
      <p class="subtitle" v-if="currentUser">Översikt av ditt konto</p>
    </div>

    <!-- Content Grid -->
    <div class="content-grid">
      <!-- Left Column -->
      <div class="left-column">
        <!-- Notes Card -->
        <div class="content-card notes-card" @click="$emit('navigate', 'notes')">
          <div class="card-header">
            <h3>Anteckningar</h3>
          </div>
          <div class="card-number">{{ notesCount }}</div>
        </div>

        <!-- Activity Chart -->
        <div class="content-card activity-card">
          <div class="card-header">
            <h3>Activity</h3>
          </div>
          <div class="activity-chart">
            <div class="chart-bars">
              <div class="bar" style="height: 40%"><span>M</span></div>
              <div class="bar" style="height: 60%"><span>T</span></div>
              <div class="bar" style="height: 55%"><span>W</span></div>
              <div class="bar" style="height: 80%"><span>T</span></div>
              <div class="bar" style="height: 70%"><span>F</span></div>
              <div class="bar" style="height: 90%"><span>S</span></div>
              <div class="bar" style="height: 65%"><span>S</span></div>
            </div>
          </div>
        </div>
      </div>

      <!-- Right Column -->
      <div class="right-column">
        <!-- Flashcards Card -->
        <div class="content-card flashcards-card" @click="$emit('navigate', 'flashcards')">
          <div class="card-header">
            <h3>Flashcards</h3>
          </div>
          <div class="card-number">{{ flashcardsCount }}</div>
        </div>

        <!-- Tasks Card -->
        <div class="content-card tasks-card">
          <div class="card-header">
            <h3>Uppgifter</h3>
            <button class="add-task-btn">+</button>
          </div>
          <ul class="task-list">
            <li class="task-item">
              <span class="task-text">Slutför anteckningar för kapitlet</span>
              <span class="task-priority high">Hög</span>
            </li>
            <li class="task-item">
              <span class="task-text">Granska flashcards</span>
              <span class="task-priority medium">Medium</span>
            </li>
            <li class="task-item">
              <span class="task-text">Organisera studiegrupp</span>
              <span class="task-priority low">Låg</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useAuth } from '../stores/auth'
import { NoteService } from '../services/NoteService'

const { currentUser } = useAuth()
const noteService = new NoteService()

const notesCount = ref(0)
const flashcardsCount = ref(8) // Håller flashcards som hårdkodat tills vidare

defineEmits<{
  navigate: [section: string]
}>()

const loadNotesCount = async () => {
  if (currentUser?.value?.id) {
    try {
      const notes = await noteService.getUserNotes(currentUser.value.id)
      notesCount.value = notes.length
    } catch (error) {
      console.error('Kunde inte hämta anteckningar:', error)
      notesCount.value = 0
    }
  }
}

onMounted(() => {
  loadNotesCount()
})
</script>

<style scoped>
.dashboard {
  padding: 2rem;
  background-color: #f8f9fa;
  min-height: 100vh;
}

.dashboard-header {
  margin-bottom: 2rem;
}

.dashboard-header h2 {
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

.content-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
}

.content-card {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  margin-bottom: 1.5rem;
}

.content-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.card-header h3 {
  color: #2d3748;
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
}

.card-number {
  font-size: 3rem;
  font-weight: 700;
  color: #667eea;
  text-align: center;
}

.notes-card, .flashcards-card {
  cursor: pointer;
}

.notes-card .card-number {
  color: #48bb78;
}

.flashcards-card .card-number {
  color: #ed8936;
}

.activity-chart {
  height: 120px;
  display: flex;
  align-items: end;
  justify-content: center;
}

.chart-bars {
  display: flex;
  align-items: end;
  gap: 8px;
  height: 100%;
}

.bar {
  width: 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 3px 3px 0 0;
  display: flex;
  align-items: end;
  justify-content: center;
  padding-bottom: 4px;
  min-height: 20px;
}

.bar span {
  color: white;
  font-size: 0.7rem;
  font-weight: 500;
}

.add-task-btn {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  border: none;
  background: #667eea;
  color: white;
  font-size: 1.2rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color 0.2s ease;
}

.add-task-btn:hover {
  background: #5a67d8;
}

.task-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.task-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 0;
  border-bottom: 1px solid #e2e8f0;
}

.task-item:last-child {
  border-bottom: none;
}

.task-text {
  color: #4a5568;
  font-size: 0.9rem;
}

.task-priority {
  font-size: 0.8rem;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-weight: 500;
}

.task-priority.high {
  background: #fed7d7;
  color: #c53030;
}

.task-priority.medium {
  background: #feebc8;
  color: #dd6b20;
}

.task-priority.low {
  background: #c6f6d5;
  color: #38a169;
}

@media (max-width: 768px) {
  .content-grid {
    grid-template-columns: 1fr;
  }
  
  .dashboard {
    padding: 1rem;
  }
}
</style>
