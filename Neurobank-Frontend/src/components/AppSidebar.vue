<script setup lang="ts">
interface Props {
  isOpen?: boolean;
  currentSection?: string;
}

interface Emits {
  (e: "toggle"): void;
  (e: "navigate", section: string): void;
}

withDefaults(defineProps<Props>(), {
  isOpen: true,
  currentSection: "home",
});

const emit = defineEmits<Emits>();

const navigateToSection = (section: string) => {
  emit("navigate", section);
};
</script>

<template>
  <div class="sidebar" :class="{ open: isOpen, closed: !isOpen }">
    <!-- Toggle Button -->
    <div class="sidebar-header">
      <button class="toggle-btn" @click="emit('toggle')">
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
        >
          <line x1="3" y1="6" x2="21" y2="6" />
          <line x1="3" y1="12" x2="21" y2="12" />
          <line x1="3" y1="18" x2="21" y2="18" />
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
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
        >
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
          <polyline points="9,22 9,12 15,12 15,22" />
        </svg>
        <span v-show="isOpen">Home</span>
      </div>
      <div
        class="nav-item"
        :class="{ active: currentSection === 'notes' }"
        @click="navigateToSection('notes')"
      >
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
        >
          <path
            d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"
          />
          <polyline points="14,2 14,8 20,8" />
          <line x1="16" y1="13" x2="8" y2="13" />
          <line x1="16" y1="17" x2="8" y2="17" />
          <line x1="10" y1="9" x2="8" y2="9" />
        </svg>
        <span v-show="isOpen">Notes</span>
      </div>
      <div
        class="nav-item"
        :class="{ active: currentSection === 'flashcards' }"
        @click="navigateToSection('flashcards')"
      >
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
        >
          <rect x="3" y="4" width="18" height="12" rx="2" />
          <rect x="5" y="6" width="14" height="8" rx="1" />
          <path d="M12 10h4" />
        </svg>
        <span v-show="isOpen">Flashcards</span>
      </div>
      <div
        class="nav-item"
        :class="{ active: currentSection === 'tasks' }"
        @click="navigateToSection('tasks')"
      >
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
        >
          <path d="M9 12l2 2 4-4" />
          <path
            d="M21 12c0 4.97-4.03 9-9 9s-9-4.03-9-9 4.03-9 9-9 9 4.03 9 9z"
          />
        </svg>
        <span v-show="isOpen">Tasks</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.sidebar {
  width: 280px;
  background: rgba(15, 23, 42, 0.9);
  backdrop-filter: blur(10px);
  border-right: 1px solid rgba(255, 255, 255, 0.1);
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
  padding: 2rem 1.5rem 1rem;
  display: flex;
  justify-content: flex-start;
  align-items: center;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.sidebar.closed .sidebar-header {
  justify-content: center;
  padding: 2rem 1rem 1rem;
}

.toggle-btn {
  background: rgba(255, 255, 255, 0.1);
  border: none;
  padding: 0.75rem;
  border-radius: 12px;
  cursor: pointer;
  color: #e2e8f0;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(10px);
}

.toggle-btn:hover {
  background: rgba(255, 255, 255, 0.2);
  color: #ffffff;
  transform: translateY(-2px);
}

.nav-items {
  padding: 1.5rem;
  flex: 1;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem 1.25rem;
  margin-bottom: 0.75rem;
  border-radius: 16px;
  cursor: pointer;
  transition: all 0.3s ease;
  color: #94a3b8;
  font-weight: 500;
  white-space: nowrap;
  position: relative;
  overflow: hidden;
}

.sidebar.closed .nav-item {
  justify-content: center;
  padding: 1rem;
}

.nav-item::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(
    135deg,
    rgba(59, 130, 246, 0.1),
    rgba(147, 51, 234, 0.1)
  );
  opacity: 0;
  transition: opacity 0.3s ease;
  border-radius: 16px;
}

.nav-item:hover::before {
  opacity: 1;
}

.nav-item:hover {
  color: #ffffff;
  transform: translateX(8px);
  box-shadow: 0 8px 32px rgba(59, 130, 246, 0.3);
}

.nav-item.active {
  background: linear-gradient(135deg, #3b82f6, #8b5cf6);
  color: white;
  box-shadow: 0 8px 32px rgba(59, 130, 246, 0.4);
  transform: translateX(4px);
}

.nav-item.active::before {
  opacity: 0;
}

.nav-item svg {
  flex-shrink: 0;
  position: relative;
  z-index: 1;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1));
}

.nav-item span {
  transition: all 0.3s ease;
  position: relative;
  z-index: 1;
  font-weight: 600;
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
    width: 280px;
  }
}
</style>
