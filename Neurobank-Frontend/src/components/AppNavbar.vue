<script setup lang="ts">
import { ref, onMounted, onUnmounted } from "vue";
import { useAuth } from "../stores/auth";

interface Props {
  isOpen?: boolean;
}

interface Emits {
  (e: "logout"): void;
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
  background: rgba(15, 23, 42, 0.8);
  backdrop-filter: blur(20px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  padding: 1.5rem 2rem;
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
  gap: 0.75rem;
}

.brain-icon {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  border-radius: 12px;
  background: linear-gradient(135deg, #3b82f6, #8b5cf6);
  padding: 8px;
}

.brain-icon img {
  width: 24px;
  height: 24px;
  object-fit: contain;
  filter: brightness(0) invert(1);
}

.logo h1 {
  font-size: 1.5rem;
  font-weight: 700;
  color: #ffffff;
  margin: 0;
  letter-spacing: -0.5px;
  font-family: "Inter", sans-serif;
  transition: opacity 0.3s ease;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.navbar-right {
  display: flex;
  align-items: center;
}

.user-menu-container {
  position: relative;
}

.user-menu {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: linear-gradient(
    135deg,
    rgba(59, 130, 246, 0.2),
    rgba(139, 92, 246, 0.2)
  );
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  color: #e2e8f0;
}

.user-menu:hover {
  background: linear-gradient(
    135deg,
    rgba(59, 130, 246, 0.3),
    rgba(139, 92, 246, 0.3)
  );
  transform: translateY(-2px);
  box-shadow: 0 8px 32px rgba(59, 130, 246, 0.3);
}

.dropdown-menu {
  position: absolute;
  top: calc(100% + 0.75rem);
  right: 0;
  background: rgba(15, 23, 42, 0.95);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
  min-width: 240px;
  z-index: 50;
  animation: fadeIn 0.3s ease;
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
  padding: 1.5rem;
  background: linear-gradient(
    135deg,
    rgba(59, 130, 246, 0.1),
    rgba(139, 92, 246, 0.1)
  );
}

.user-info {
  text-align: left;
}

.user-name {
  font-weight: 600;
  color: #ffffff;
  font-size: 1rem;
  font-family: "Inter", sans-serif;
}

.user-email {
  color: #94a3b8;
  font-size: 0.875rem;
  margin-top: 0.25rem;
  font-family: "Inter", sans-serif;
}

.dropdown-divider {
  height: 1px;
  background: linear-gradient(
    90deg,
    transparent,
    rgba(255, 255, 255, 0.1),
    transparent
  );
  margin: 0;
}

.dropdown-items {
  padding: 0.75rem;
}

.dropdown-item {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.875rem 1rem;
  border: none;
  background: none;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  color: #94a3b8;
  font-family: "Inter", sans-serif;
  font-size: 0.9rem;
  font-weight: 500;
}

.dropdown-item:hover {
  background: rgba(255, 255, 255, 0.1);
  color: #ffffff;
  transform: translateX(4px);
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
    min-width: 220px;
  }
}
</style>
