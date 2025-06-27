<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '../stores/auth'
import AppSidebar from '../components/AppSidebar.vue'
import AppNavbar from '../components/AppNavbar.vue'

const router = useRouter()
const { currentUser, isAuthenticated, logout } = useAuth()

const sidebarOpen = ref(true)

// Omdirigera till login om inte inloggad
onMounted(() => {
  if (!isAuthenticated.value) {
    router.push('/loginpage')
  }
})

const handleLogout = () => {
  logout()
  router.push('/loginpage')
}

const toggleSidebar = () => {
  sidebarOpen.value = !sidebarOpen.value
}

const goToNotes = () => {
  router.push('/notes')
}

const goToFlashcards = () => {
  // TODO: Implementera flashcards-sidan
  console.log('Flashcards kommer snart')
}
</script>

<template>
  <div class="app-layout">
    <!-- Sidebar Navigation -->
    <AppSidebar :isOpen="sidebarOpen" @toggle="toggleSidebar" />

    <!-- Main Content -->
    <div class="main-content" :class="{ 'sidebar-closed': !sidebarOpen }">
      <!-- Header -->
      <AppNavbar 
        :isOpen="sidebarOpen" 
        @logout="handleLogout" 
      />

      <!-- Dashboard Content -->
      <div class="dashboard">
        <div class="dashboard-header">
          <h2>Home</h2>
          <p class="subtitle" v-if="currentUser">Översikt av ditt konto</p>
        </div>

        <!-- Stats Cards -->
        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-number">75</div>
            <div class="stat-label">Anteckningar</div>
          </div>
          <div class="stat-card">
            <div class="stat-number">120</div>
            <div class="stat-label">Flashcards</div>
            <div class="stat-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="22,12 18,12 15,21 9,3 6,12 2,12"/>
              </svg>
            </div>
          </div>
        </div>

        <!-- Content Grid -->
        <div class="content-grid">
          <!-- Left Column -->
          <div class="left-column">
            <!-- Notes Card -->
            <div class="content-card notes-card" @click="goToNotes">
              <div class="card-header">
                <h3>Notes</h3>
              </div>
              <div class="card-number">12</div>
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

            <!-- Recent Notes -->
            <div class="content-card recent-notes">
              <div class="card-header">
                <h3>Recent notes</h3>
              </div>
              <div class="recent-list">
                <div class="recent-item">Matematik - Derivata</div>
                <div class="recent-item">Historia - Andra världskriget</div>
                <div class="recent-item">Fysik - Termodynamik</div>
              </div>
            </div>
          </div>

          <!-- Right Column -->
          <div class="right-column">
            <!-- Flashcards Card -->
            <div class="content-card flashcards-card" @click="goToFlashcards">
              <div class="card-header">
                <h3>Flashcards</h3>
              </div>
              <div class="card-number">24</div>
            </div>

            <!-- Progress Ring -->
            <div class="content-card progress-card">
              <div class="card-header">
                <h3>Inlärning framsteg</h3>
              </div>
              <div class="progress-ring">
                <svg width="100" height="100" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="40" stroke="#e5e7eb" stroke-width="8" fill="none"/>
                  <circle cx="50" cy="50" r="40" stroke="#3b82f6" stroke-width="8" fill="none" 
                          stroke-dasharray="251.2" stroke-dashoffset="75.36" stroke-linecap="round"/>
                </svg>
                <div class="progress-text">70%</div>
              </div>
            </div>

            <!-- Next Review -->
            <div class="content-card review-card">
              <div class="card-header">
                <h3>Nästa repetition</h3>
                <div class="calendar-icon">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                    <line x1="16" y1="2" x2="16" y2="6"/>
                    <line x1="8" y1="2" x2="8" y2="6"/>
                    <line x1="3" y1="10" x2="21" y2="10"/>
                  </svg>
                </div>
              </div>
              <div class="review-info">
                <div class="review-text">I morgon</div>
              </div>
            </div>

            <!-- New Post Button -->
            <div class="new-post-btn" @click="goToNotes">
              <button class="create-btn">Nytt inlägg</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');

.app-layout {
  display: flex;
  min-height: 100vh;
  background-color: #f8f9fa;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
}

/* Main Content */
.main-content {
  flex: 1;
  margin-left: 220px;
  display: flex;
  flex-direction: column;
  transition: margin-left 0.3s ease;
}

.main-content.sidebar-closed {
  margin-left: 80px;
}

/* Dashboard */
.dashboard {
  padding: 2rem;
  flex: 1;
}

.dashboard-header {
  margin-bottom: 2rem;
}

.dashboard-header h2 {
  font-size: 2rem;
  font-weight: 600;
  color: #1f2937;
  margin: 0 0 0.5rem 0;
  font-family: 'Inter', sans-serif;
}

.subtitle {
  color: #6b7280;
  font-size: 1rem;
  margin: 0;
  font-family: 'Inter', sans-serif;
}

/* Stats Grid */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1.5rem;
  margin-bottom: 2rem;
  max-width: 600px;
}

.stat-card {
  background: white;
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  position: relative;
}

.stat-number {
  font-size: 2.5rem;
  font-weight: 700;
  color: #1f2937;
  margin-bottom: 0.25rem;
  font-family: 'Inter', sans-serif;
}

.stat-label {
  color: #6b7280;
  font-size: 0.9rem;
  font-weight: 500;
  font-family: 'Inter', sans-serif;
}

.stat-icon {
  position: absolute;
  top: 1.5rem;
  right: 1.5rem;
  color: #3b82f6;
}

/* Content Grid */
.content-grid {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 2rem;
}

.left-column, .right-column {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.content-card {
  background: white;
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  transition: all 0.2s ease;
}

.content-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.card-header h3 {
  font-size: 1.1rem;
  font-weight: 600;
  color: #1f2937;
  margin: 0;
  font-family: 'Inter', sans-serif;
}

.card-number {
  font-size: 2rem;
  font-weight: 700;
  color: #3b82f6;
  font-family: 'Inter', sans-serif;
}

/* Notes and Flashcards Cards */
.notes-card, .flashcards-card {
  cursor: pointer;
  border: 1px solid transparent;
}

.notes-card:hover, .flashcards-card:hover {
  border-color: #3b82f6;
}

/* Activity Chart */
.activity-chart {
  height: 120px;
  display: flex;
  align-items: end;
  justify-content: center;
}

.chart-bars {
  display: flex;
  align-items: end;
  gap: 0.5rem;
  height: 80px;
}

.bar {
  width: 20px;
  background-color: #3b82f6;
  border-radius: 2px 2px 0 0;
  display: flex;
  align-items: end;
  justify-content: center;
  position: relative;
}

.bar span {
  position: absolute;
  bottom: -20px;
  font-size: 0.75rem;
  color: #6b7280;
  font-weight: 500;
}

/* Recent Notes */
.recent-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.recent-item {
  padding: 0.5rem 0;
  color: #6b7280;
  font-size: 0.9rem;
  border-bottom: 1px solid #f3f4f6;
}

.recent-item:last-child {
  border-bottom: none;
}

/* Progress Ring */
.progress-card {
  text-align: center;
}

.progress-ring {
  position: relative;
  display: inline-block;
  margin: 1rem 0;
}

.progress-text {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 1.5rem;
  font-weight: 700;
  color: #3b82f6;
}

/* Review Card */
.calendar-icon {
  color: #6b7280;
}

.review-info {
  margin-top: 1rem;
}

.review-text {
  font-size: 1.25rem;
  font-weight: 600;
  color: #1f2937;
}

/* Create Button */
.new-post-btn {
  margin-top: auto;
}

.create-btn {
  width: 100%;
  padding: 1rem;
  background-color: #3b82f6;
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s ease;
  font-family: 'Inter', sans-serif;
}

.create-btn:hover {
  background-color: #2563eb;
}

/* Responsive Design */
@media (max-width: 1024px) {
  .content-grid {
    grid-template-columns: 1fr;
  }
  
  .stats-grid {
    max-width: none;
  }
  
  .main-content.sidebar-closed {
    margin-left: 80px;
  }
}

@media (max-width: 768px) {
  .main-content {
    margin-left: 0;
  }
  
  .main-content.sidebar-closed {
    margin-left: 0;
  }
  
  .dashboard {
    padding: 1rem;
  }
  
  .stats-grid {
    grid-template-columns: 1fr;
  }
  
  .content-grid {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
}
</style>