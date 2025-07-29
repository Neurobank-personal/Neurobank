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
  background: var(--cream);
  border-right: 2px solid var(--border);
  padding: 0;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  flex-direction: column;
  box-shadow: 4px 0 20px rgba(162, 175, 155, 0.1);
  height: 100vh;
  position: fixed;
  top: 80px;
  left: 0;
  z-index: 100;
}

.sidebar.closed {
  width: 80px;
  transform: translateX(0);
}

.nav-items {
  padding: 2rem 1.5rem;
  flex: 1;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1.25rem 1.5rem;
  margin-bottom: 0.75rem;
  border-radius: 20px;
  cursor: pointer;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  color: var(--text-medium);
  font-weight: 600;
  white-space: nowrap;
  position: relative;
  overflow: hidden;
  border: 2px solid transparent;
}

.sidebar.closed .nav-item {
  justify-content: center;
  padding: 1.25rem;
}

.nav-item::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, var(--beige), var(--light-gray));
  opacity: 0;
  transition: all 0.3s ease;
  border-radius: 18px;
}

.nav-item:hover::before {
  opacity: 1;
}

.nav-item:hover {
  color: var(--sage);
  transform: translateX(8px);
  border-color: var(--border);
  box-shadow: 0 8px 24px rgba(162, 175, 155, 0.2);
}

.nav-item.active {
  background: linear-gradient(135deg, var(--sage), var(--accent));
  color: white;
  border-color: var(--sage);
  box-shadow: 0 8px 32px rgba(162, 175, 155, 0.3);
  transform: translateX(4px);
}

.nav-item.active::before {
  opacity: 0;
}

.nav-item.active::after {
  content: "";
  position: absolute;
  top: 50%;
  left: -2px;
  width: 4px;
  height: 60%;
  background: white;
  border-radius: 0 4px 4px 0;
  transform: translateY(-50%);
  box-shadow: 0 2px 8px rgba(255, 255, 255, 0.3);
}

.nav-item svg {
  flex-shrink: 0;
  position: relative;
  z-index: 1;
  filter: drop-shadow(0 2px 4px rgba(162, 175, 155, 0.1));
}

.nav-item span {
  transition: all 0.3s ease;
  position: relative;
  z-index: 1;
  font-weight: 600;
  font-family: "Inter", sans-serif;
}

.sidebar.closed .nav-item span {
  opacity: 0;
  width: 0;
  overflow: hidden;
}

/* Floating effect for active item */
.nav-item.active {
  animation: float 3s ease-in-out infinite;
}

@keyframes float {
  0%,
  100% {
    transform: translateX(4px) translateY(0px);
  }
  50% {
    transform: translateX(4px) translateY(-2px);
  }
}

@media (max-width: 768px) {
  .sidebar {
    transform: translateX(-100%);
    top: 80px;
    height: calc(100vh - 80px);
  }

  .sidebar.open {
    transform: translateX(0);
    width: 280px;
  }

  .sidebar.closed {
    transform: translateX(-100%);
  }
}
</style>
