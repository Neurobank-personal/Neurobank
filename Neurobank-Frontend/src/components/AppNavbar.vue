<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useAuth } from '../stores/auth'

interface Props {
  isOpen?: boolean
}

interface Emits {
  (e: 'logout'): void
}

withDefaults(defineProps<Props>(), {
  isOpen: true
})

const emit = defineEmits<Emits>()
const { currentUser } = useAuth()

const showDropdown = ref(false)
const isMobile = ref(false)

const toggleDropdown = () => {
  showDropdown.value = !showDropdown.value
}

const handleLogout = () => {
  showDropdown.value = false
  emit('logout')
}

const closeDropdown = () => {
  showDropdown.value = false
}

// Close dropdown when clicking outside
const handleClickOutside = (event: Event) => {
  const target = event.target as HTMLElement
  if (!target.closest('.user-menu-container')) {
    closeDropdown()
  }
}

// Check screen size
const checkScreenSize = () => {
  isMobile.value = window.innerWidth <= 768
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
  window.addEventListener('resize', checkScreenSize)
  checkScreenSize()
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
  window.removeEventListener('resize', checkScreenSize)
})
</script>

<template>
  <div class="navbar">
    <div class="navbar-left">
      <div class="logo">
        <div class="brain-icon">
          <img src="/Neurobank_logo.png" alt="Neurobank" />
        </div>
        <h1 v-show="isOpen || !isMobile">NEUROBANK</h1>
      </div>
    </div>
    <div class="navbar-right">
      <div class="user-menu-container">
        <div class="user-menu" @click="toggleDropdown">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
            <circle cx="12" cy="7" r="4"/>
          </svg>
        </div>
        
        <!-- Dropdown Menu -->
        <div v-if="showDropdown" class="dropdown-menu">
          <div class="dropdown-header" v-if="currentUser">
            <div class="user-info">
              <div class="user-name">{{ currentUser.firstName }} {{ currentUser.lastName }}</div>
              <div class="user-email">{{ currentUser.email }}</div>
            </div>
          </div>
          <div class="dropdown-divider"></div>
          <div class="dropdown-items">
            <button class="dropdown-item" @click="handleLogout">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                <polyline points="16,17 21,12 16,7"/>
                <line x1="21" y1="12" x2="9" y2="12"/>
              </svg>
              <span>Log out</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.navbar {
  background-color: white;
  border-bottom: 1px solid #e5e7eb;
  padding: 1rem 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: sticky;
  top: 0;
  z-index: 5;
}

.navbar-left {
  display: flex;
  align-items: center;
}

.logo {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.brain-icon {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.brain-icon img {
  width: 32px;
  height: 32px;
  object-fit: contain;
}

.logo h1 {
  font-size: 1.25rem;
  font-weight: 700;
  color: #1f2937;
  margin: 0;
  letter-spacing: -0.5px;
  font-family: 'Inter', sans-serif;
  transition: opacity 0.3s ease;
}

.navbar-right {
  display: flex;
  align-items: center;
}

.user-menu-container {
  position: relative;
}

.user-menu {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: #f3f4f6;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background-color 0.2s ease;
  color: #6b7280;
}

.user-menu:hover {
  background-color: #e5e7eb;
}

.dropdown-menu {
  position: absolute;
  top: calc(100% + 0.5rem);
  right: 0;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  min-width: 220px;
  z-index: 50;
  animation: fadeIn 0.2s ease;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.dropdown-header {
  padding: 1rem;
}

.user-info {
  text-align: left;
}

.user-name {
  font-weight: 600;
  color: #1f2937;
  font-size: 0.9rem;
  font-family: 'Inter', sans-serif;
}

.user-email {
  color: #6b7280;
  font-size: 0.8rem;
  margin-top: 0.25rem;
  font-family: 'Inter', sans-serif;
}

.dropdown-divider {
  height: 1px;
  background-color: #e5e7eb;
  margin: 0;
}

.dropdown-items {
  padding: 0.5rem;
}

.dropdown-item {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem;
  border: none;
  background: none;
  border-radius: 6px;
  cursor: pointer;
  transition: background-color 0.2s ease;
  color: #6b7280;
  font-family: 'Inter', sans-serif;
  font-size: 0.9rem;
}

.dropdown-item:hover {
  background-color: #f3f4f6;
  color: #374151;
}

.dropdown-item svg {
  flex-shrink: 0;
}

@media (max-width: 768px) {
  .navbar {
    padding: 1rem;
  }
  
  .logo h1 {
    display: none;
  }
  
  .dropdown-menu {
    min-width: 200px;
  }
}
</style>
