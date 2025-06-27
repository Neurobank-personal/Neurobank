<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { handleRegister } from '../services/handleRegister'

const router = useRouter()

const firstName = ref('')
const lastName = ref('')
const email = ref('')
const password = ref('')
const confirmPassword = ref('')
const isLoading = ref(false)
const errorMessage = ref('')

const handleSubmit = async () => {
  errorMessage.value = ''
  
  if (password.value !== confirmPassword.value) {
    errorMessage.value = 'Lösenorden matchar inte!'
    return
  }
  
  isLoading.value = true
  
  try {
    const result = await handleRegister({
      firstName: firstName.value,
      lastName: lastName.value,
      email: email.value,
      password: password.value
    })
    
    if (result.success) {
      alert('Registrering lyckades! Du kan nu logga in.')
      router.push('/loginpage')
    } else {
      errorMessage.value = result.error || 'Ett fel uppstod'
    }
  } catch (error) {
    errorMessage.value = 'Ett oväntat fel uppstod'
  } finally {
    isLoading.value = false
  }
}

const goToLogin = () => {
  router.push('/loginpage')
}
</script>

<template>
  <div class="register-container">
    <div class="register-card">
      <h1>Skapa konto</h1>
      
      <div v-if="errorMessage" class="error-message">
        {{ errorMessage }}
      </div>
      
      <form @submit.prevent="handleSubmit" class="register-form">
        <div class="name-row">
          <div class="input-group">
            <label for="firstName">Förnamn</label>
            <input 
              id="firstName"
              type="text" 
              v-model="firstName" 
              placeholder="Ditt förnamn"
              required
              :disabled="isLoading"
            />
          </div>
          
          <div class="input-group">
            <label for="lastName">Efternamn</label>
            <input 
              id="lastName"
              type="text" 
              v-model="lastName" 
              placeholder="Ditt efternamn"
              required
              :disabled="isLoading"
            />
          </div>
        </div>
        
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
            placeholder="Välj ett lösenord (minst 6 tecken)"
            required
            :disabled="isLoading"
          />
        </div>
        
        <div class="input-group">
          <label for="confirmPassword">Bekräfta lösenord</label>
          <input 
            id="confirmPassword"
            type="password" 
            v-model="confirmPassword" 
            placeholder="Bekräfta ditt lösenord"
            required
            :disabled="isLoading"
          />
        </div>
        
        <button type="submit" class="register-btn" :disabled="isLoading">
          {{ isLoading ? 'Skapar konto...' : 'Skapa konto' }}
        </button>
      </form>
      
      <div class="login-link">
        <p>Har du redan ett konto? 
          <button @click="goToLogin" class="link-btn" :disabled="isLoading">Logga in här</button>
        </p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.register-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background-color: #f5f5f5;
}

.register-card {
  background: white;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 450px;
}

.register-card h1 {
  text-align: center;
  margin-bottom: 2rem;
  color: #333;
}

.register-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.name-row {
  display: flex;
  gap: 1rem;
}

.input-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  flex: 1;
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

.register-btn {
  padding: 0.75rem;
  background-color: #28a745;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  cursor: pointer;
  margin-top: 1rem;
}

.register-btn:hover:not(:disabled) {
  background-color: #218838;
}

.register-btn:disabled {
  background-color: #6c757d;
  cursor: not-allowed;
}

.login-link {
  text-align: center;
  margin-top: 1.5rem;
  padding-top: 1rem;
  border-top: 1px solid #eee;
}

.login-link p {
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