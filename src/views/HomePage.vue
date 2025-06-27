<script setup lang="ts">
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '../stores/auth'

const router = useRouter()
const { currentUser, isAuthenticated, logout } = useAuth()

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

const goToNotes = () => {
  router.push('/notes')
}
</script>

<template>
  <div class="home-container">
    <div class="home-card">
      <div class="header">
        <h1>Välkommen till Neurobank</h1>
        <div v-if="currentUser" class="user-info">
          <span>Inloggad som: {{ currentUser.firstName }} {{ currentUser.lastName }}</span>
          <button @click="handleLogout" class="logout-btn">Logga ut</button>
        </div>
      </div>
      
      <div class="actions">
        <button @click="goToNotes" class="action-btn">
          📝 Skapa Anteckning
        </button>
        <button class="action-btn" disabled>
          📚 Mina Anteckningar (Kommer snart)
        </button>
        <button class="action-btn" disabled>
          🔍 Sök (Kommer snart)
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.home-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background-color: #f5f5f5;
  padding: 2rem;
}

.home-card {
  background: white;
  padding: 3rem;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 600px;
  text-align: center;
}

.header {
  margin-bottom: 3rem;
}

.header h1 {
  color: #333;
  margin-bottom: 1rem;
  font-size: 2.5rem;
}

.user-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: #f8f9fa;
  padding: 1rem;
  border-radius: 8px;
  margin-top: 1rem;
}

.user-info span {
  color: #666;
  font-weight: 500;
}

.logout-btn {
  background-color: #dc3545;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9rem;
}

.logout-btn:hover {
  background-color: #c82333;
}

.actions {
  display: grid;
  gap: 1rem;
  grid-template-columns: 1fr;
}

.action-btn {
  padding: 1.5rem;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1.1rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.action-btn:hover:not(:disabled) {
  background-color: #0056b3;
  transform: translateY(-2px);
}

.action-btn:disabled {
  background-color: #6c757d;
  cursor: not-allowed;
  opacity: 0.6;
}

@media (max-width: 600px) {
  .home-card {
    padding: 2rem 1rem;
  }
  
  .header h1 {
    font-size: 2rem;
  }
  
  .user-info {
    flex-direction: column;
    gap: 1rem;
  }
}
</style>