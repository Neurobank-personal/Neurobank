<script setup lang="ts">
interface Props {
  isOpen?: boolean
  currentSection?: string
}

interface Emits {
  (e: 'toggle'): void
  (e: 'navigate', section: string): void
}

withDefaults(defineProps<Props>(), {
  isOpen: true,
  currentSection: 'home'
})

const emit = defineEmits<Emits>()

const navigateToSection = (section: string) => {
  emit('navigate', section)
}
</script>

<template>
  <div class="sidebar" :class="{ 'open': isOpen, 'closed': !isOpen }">
    <!-- Toggle Button -->
    <div class="sidebar-header">
      <button class="toggle-btn" @click="emit('toggle')">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="3" y1="6" x2="21" y2="6"/>
          <line x1="3" y1="12" x2="21" y2="12"/>
          <line x1="3" y1="18" x2="21" y2="18"/>
        </svg>
      </button>
    </div>
    
    <!-- Navigation Items -->
    <div class="nav-items">
      <div 
        class="nav-item" 
        :class="{ active: currentSection === 'home' }"
        @click="navigateToSection('home')"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
          <polyline points="9,22 9,12 15,12 15,22"/>
        </svg>
        <span v-show="isOpen">Home</span>
      </div>
      <div 
        class="nav-item" 
        :class="{ active: currentSection === 'notes' }"
        @click="navigateToSection('notes')"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
          <polyline points="14,2 14,8 20,8"/>
          <line x1="16" y1="13" x2="8" y2="13"/>
          <line x1="16" y1="17" x2="8" y2="17"/>
          <line x1="10" y1="9" x2="8" y2="9"/>
        </svg>
        <span v-show="isOpen">Notes</span>
      </div>
      <div 
        class="nav-item" 
        :class="{ active: currentSection === 'flashcards' }"
        @click="navigateToSection('flashcards')"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <rect x="3" y="4" width="18" height="12" rx="2"/>
          <rect x="5" y="6" width="14" height="8" rx="1"/>
          <path d="M12 10h4"/>
        </svg>
        <span v-show="isOpen">Flashcards</span>
      </div>
      <div 
        class="nav-item" 
        :class="{ active: currentSection === 'tasks' }"
        @click="navigateToSection('tasks')"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M9 12l2 2 4-4"/>
          <path d="M21 12c0 4.97-4.03 9-9 9s-9-4.03-9-9 4.03-9 9-9 9 4.03 9 9z"/>
        </svg>
        <span v-show="isOpen">Tasks</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.sidebar {
  width: 220px;
  background-color: white;
  border-right: 1px solid #e5e7eb;
  padding: 0;
  position: fixed;
  height: 100vh;
  z-index: 10;
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;
}

.sidebar.closed {
  width: 80px;
}

.sidebar-header {
  padding: 1rem;
  display: flex;
  justify-content: flex-start;
}

.sidebar.closed .sidebar-header {
  justify-content: center;
}

.toggle-btn {
  background: none;
  border: none;
  padding: 0.5rem;
  border-radius: 6px;
  cursor: pointer;
  color: #6b7280;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.toggle-btn:hover {
  background-color: #f3f4f6;
  color: #374151;
}

.nav-items {
  padding: 1rem;
  flex: 1;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  margin-bottom: 0.5rem;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  color: #6b7280;
  font-weight: 500;
  white-space: nowrap;
}

.sidebar.closed .nav-item {
  justify-content: center;
  padding: 0.75rem;
}

.nav-item:hover {
  background-color: #f3f4f6;
  color: #374151;
}

.nav-item.active {
  background-color: #3b82f6;
  color: white;
}

.nav-item svg {
  flex-shrink: 0;
}

.nav-item span {
  transition: opacity 0.2s ease;
}

.sidebar.closed .nav-item span {
  opacity: 0;
  width: 0;
  overflow: hidden;
}

@media (max-width: 768px) {
  .sidebar {
    transform: translateX(-100%);
  }
  
  .sidebar.open {
    transform: translateX(0);
    width: 220px;
  }
}
</style>
