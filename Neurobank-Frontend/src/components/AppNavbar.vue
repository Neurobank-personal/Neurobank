<script setup lang="ts">
import { ref, onMounted, onUnmounted } from "vue";
import { useAuth } from "../stores/auth";

interface Props {
  isOpen?: boolean;
}

interface Emits {
  (e: "logout"): void;
  (e: "toggle"): void;
}

withDefaults(defineProps<Props>(), {
  isOpen: true,
});

const emit = defineEmits<Emits>();
const { currentUser } = useAuth();

const showDropdown = ref(false);
const isMobile = ref(false);

const toggleDropdown = () => {
  showDropdown.value = !showDropdown.value;
};

const handleLogout = () => {
  showDropdown.value = false;
  emit("logout");
};

const closeDropdown = () => {
  showDropdown.value = false;
};

// Close dropdown when clicking outside
const handleClickOutside = (event: Event) => {
  const target = event.target as HTMLElement;
  if (!target.closest(".user-menu-container")) {
    closeDropdown();
  }
};

// Check screen size
const checkScreenSize = () => {
  isMobile.value = window.innerWidth <= 768;
};

onMounted(() => {
  document.addEventListener("click", handleClickOutside);
  window.addEventListener("resize", checkScreenSize);
  checkScreenSize();
});

onUnmounted(() => {
  document.removeEventListener("click", handleClickOutside);
  window.removeEventListener("resize", checkScreenSize);
});
</script>

<template>
  <div class="navbar">
    <div class="navbar-left">
      <button class="sidebar-toggle" @click="$emit('toggle')">
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
      <div class="logo">
        <div class="brain-icon">
          <img src="/Neurobank_logo.png" alt="Neurobank" />
        </div>
        <h1>NEUROBANK</h1>
      </div>
    </div>
    <div class="navbar-right">
      <div class="user-menu-container">
        <div class="user-menu" @click="toggleDropdown">
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
          </svg>
        </div>

        <!-- Dropdown Menu -->
        <div v-if="showDropdown" class="dropdown-menu">
          <div class="dropdown-header" v-if="currentUser">
            <div class="user-info">
              <div class="user-name">
                {{ currentUser.firstName }} {{ currentUser.lastName }}
              </div>
              <div class="user-email">{{ currentUser.email }}</div>
            </div>
          </div>
          <div class="dropdown-divider"></div>
          <div class="dropdown-items">
            <button class="dropdown-item" @click="handleLogout">
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
              >
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <polyline points="16,17 21,12 16,7" />
                <line x1="21" y1="12" x2="9" y2="12" />
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
  background: rgba(250, 249, 238, 0.95);
  backdrop-filter: blur(20px);
  border-bottom: 2px solid rgba(162, 175, 155, 0.2);
  padding: 1.5rem 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: sticky;
  top: 0;
  left: 0;
  right: 0;
  z-index: 50;
  box-shadow: 0 4px 20px rgba(162, 175, 155, 0.1);
  width: 100%;
}

.navbar-left {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.sidebar-toggle {
  background: var(--sage);
  border: none;
  padding: 0.875rem;
  border-radius: 16px;
  cursor: pointer;
  color: white;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 16px rgba(162, 175, 155, 0.3);
  position: relative;
  overflow: hidden;
}

.sidebar-toggle::before {
  content: "";
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(
    90deg,
    transparent,
    rgba(255, 255, 255, 0.2),
    transparent
  );
  transition: left 0.5s ease;
}

.sidebar-toggle:hover {
  background: var(--accent);
  transform: translateY(-2px) scale(1.05);
  box-shadow: 0 6px 24px rgba(162, 175, 155, 0.4);
}

.sidebar-toggle:hover::before {
  left: 100%;
}

.logo {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.brain-icon {
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  border-radius: 16px;
  background: linear-gradient(135deg, var(--sage), var(--accent));
  padding: 10px;
  box-shadow: 0 4px 16px rgba(162, 175, 155, 0.3);
  transition: all 0.3s ease;
}

.brain-icon:hover {
  transform: scale(1.05);
  box-shadow: 0 6px 24px rgba(162, 175, 155, 0.4);
}

.brain-icon img {
  width: 28px;
  height: 28px;
  object-fit: contain;
  filter: brightness(0) invert(1);
}

.logo h1 {
  font-size: 1.75rem;
  font-weight: 700;
  color: var(--text-dark);
  margin: 0;
  letter-spacing: -0.02em;
  font-family: "Playfair Display", serif;
  transition: opacity 0.3s ease;
  background: linear-gradient(135deg, var(--sage), var(--accent));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.navbar-right {
  display: flex;
  align-items: center;
}

.user-menu-container {
  position: relative;
}

.user-menu {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: var(--beige);
  border: 2px solid var(--border);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  color: var(--sage);
  box-shadow: 0 4px 16px rgba(162, 175, 155, 0.2);
}

.user-menu:hover {
  background: var(--sage);
  color: white;
  border-color: var(--sage);
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(162, 175, 155, 0.3);
}

.dropdown-menu {
  position: absolute;
  top: calc(100% + 1rem);
  right: 0;
  background: var(--cream);
  border: 2px solid var(--border);
  border-radius: 20px;
  box-shadow: 0 20px 40px rgba(162, 175, 155, 0.15);
  min-width: 260px;
  z-index: 50;
  animation: fadeIn 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  overflow: hidden;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-10px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.dropdown-header {
  padding: 2rem;
  background: linear-gradient(135deg, var(--beige), var(--light-gray));
  position: relative;
}

.dropdown-header::after {
  content: "";
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: linear-gradient(90deg, var(--sage), var(--accent));
}

.user-info {
  text-align: left;
}

.user-name {
  font-weight: 600;
  color: var(--text-dark);
  font-size: 1.1rem;
  font-family: "Inter", sans-serif;
}

.user-email {
  color: var(--text-medium);
  font-size: 0.9rem;
  margin-top: 0.25rem;
  font-family: "Inter", sans-serif;
}

.dropdown-divider {
  height: 1px;
  background: linear-gradient(90deg, transparent, var(--border), transparent);
  margin: 0;
}

.dropdown-items {
  padding: 1rem;
}

.dropdown-item {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem 1.25rem;
  border: none;
  background: none;
  border-radius: 16px;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  color: var(--text-medium);
  font-family: "Inter", sans-serif;
  font-size: 0.95rem;
  font-weight: 500;
}

.dropdown-item:hover {
  background: var(--sage);
  color: white;
  transform: translateX(4px);
  box-shadow: 0 4px 12px rgba(162, 175, 155, 0.2);
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
    min-width: 240px;
  }

  .brain-icon {
    width: 40px;
    height: 40px;
  }

  .brain-icon img {
    width: 24px;
    height: 24px;
  }
}
</style>
