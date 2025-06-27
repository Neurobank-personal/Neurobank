<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { handleLogin } from '../services/handleLogin'

const router = useRouter()

const email = ref('')
const password = ref('')
const isLoading = ref(false)
const errorMessage = ref('')

const handleSubmit = async () => {
  errorMessage.value = ''
  
  if (!email.value || !password.value) {
    errorMessage.value = 'Fyll i både e-post och lösenord'
    return
  }
  
  isLoading.value = true
  
  try {
    const result = await handleLogin(email.value, password.value)
    
    if (result.success) {
      // Navigera till homepage vid lyckad inloggning
      router.push('/homepage')
    } else {
      errorMessage.value = result.error || 'Inloggning misslyckades'
    }
  } catch (error) {
    errorMessage.value = 'Ett oväntat fel uppstod'
  } finally {
    isLoading.value = false
  }
}

const goToRegister = () => {
  router.push('/registerpage')
}
</script>

<template>
  <div class="login-container">
    <div class="login-card">
      <h1>Logga in</h1>
      
      <div v-if="errorMessage" class="error-message">
        {{ errorMessage }}
      </div>
      
      <form @submit.prevent="handleSubmit" class="login-form">
        <div class="input-group">
          <label for="email">E-post</label>
          <input 
            id="email"
            type="email" 
            v-model="email" 
            placeholder="din@email.com"
            required
            :disabled="isLoading"
          />
        </div>
        
        <div class="input-group">
          <label for="password">Lösenord</label>
          <input 
            id="password"
            type="password" 
            v-model="password" 
            placeholder="Ditt lösenord"
            required
            :disabled="isLoading"
          />
        </div>
        
        <button type="submit" class="login-btn" :disabled="isLoading">
          {{ isLoading ? 'Loggar in...' : 'Logga in' }}
        </button>
      </form>
      
      <div class="register-link">
        <p>Har du inget konto? 
          <button @click="goToRegister" class="link-btn" :disabled="isLoading">Registrera dig här</button>
        </p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background-color: #f5f5f5;
}

.login-card {
  background: white;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 400px;
}

.login-card h1 {
  text-align: center;
  margin-bottom: 2rem;
  color: #333;
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
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

.input-group input {
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
}

.input-group input:focus {
  outline: none;
  border-color: #007bff;
}

.input-group input:disabled {
  background-color: #f8f9fa;
  opacity: 0.6;
  cursor: not-allowed;
}

.login-btn {
  padding: 0.75rem;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  cursor: pointer;
  margin-top: 1rem;
}

.login-btn:hover:not(:disabled) {
  background-color: #0056b3;
}

.login-btn:disabled {
  background-color: #6c757d;
  cursor: not-allowed;
}

.register-link {
  text-align: center;
  margin-top: 1.5rem;
  padding-top: 1rem;
  border-top: 1px solid #eee;
}

.register-link p {
  color: #666;
  margin: 0;
}

.link-btn {
  background: none;
  border: none;
  color: #007bff;
  cursor: pointer;
  text-decoration: underline;
  font-size: inherit;
}

.link-btn:hover:not(:disabled) {
  color: #0056b3;
}

.link-btn:disabled {
  color: #6c757d;
  cursor: not-allowed;
}

.error-message {
  background-color: #f8d7da;
  color: #721c24;
  padding: 0.75rem;
  border-radius: 4px;
  margin-bottom: 1rem;
  border: 1px solid #f5c6cb;
}
</style>