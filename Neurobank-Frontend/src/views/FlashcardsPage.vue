<script setup lang="ts">
import { onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import { useAuth } from "../stores/auth";
import AppSidebar from "../components/AppSidebar.vue";
import AppNavbar from "../components/AppNavbar.vue";
import FlashcardsHub from "../components/FlashcardsHub.vue";

const router = useRouter();
const { isAuthenticated, logout } = useAuth();

const sidebarOpen = ref(true);

// Omdirigera till login om inte inloggad
onMounted(() => {
  if (!isAuthenticated.value) {
    router.push("/loginpage");
  }
});

const handleLogout = () => {
  logout();
  router.push("/loginpage");
};

const toggleSidebar = () => {
  sidebarOpen.value = !sidebarOpen.value;
};

const navigateToSection = (section: string) => {
  const routes: Record<string, string> = {
    home: "/home",
    notes: "/notes",
    flashcards: "/flashcards",
    tasks: "/tasks",
  };

  if (routes[section]) {
    router.push(routes[section]);
  }
};
</script>

<template>
  <div class="app-layout">
    <!-- Top Navigation Bar -->
    <AppNavbar
      :isOpen="sidebarOpen"
      @logout="handleLogout"
      @toggle="toggleSidebar"
    />

    <!-- Content with Sidebar -->
    <div class="content-layout">
      <!-- Sidebar Navigation -->
      <AppSidebar
        :isOpen="sidebarOpen"
        :currentSection="'flashcards'"
        @toggle="toggleSidebar"
        @navigate="navigateToSection"
      />

      <!-- Main Content -->
      <div class="main-content" :class="{ 'sidebar-closed': !sidebarOpen }">
        <!-- Dynamic Content Area -->
        <div class="content-area">
          <FlashcardsHub />
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
@import url("https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=Playfair+Display:wght@400;500;600;700&display=swap");

.app-layout {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background: linear-gradient(135deg, var(--cream) 0%, var(--light-gray) 100%);
  font-family: "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI",
    sans-serif;
}

/* Content Layout with Sidebar */
.content-layout {
  position: relative;
  flex: 1;
  min-height: calc(100vh - 80px); /* Subtract navbar height */
}

/* Main Content */
.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  transition: margin-left 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  min-height: 100%;
  margin-left: 280px; /* Account for fixed sidebar */
  padding: 2rem;
  overflow-y: auto;
  max-height: calc(100vh - 80px);
}

.main-content.sidebar-closed {
  margin-left: 80px; /* Account for closed sidebar */
}

@media (max-width: 768px) {
  .main-content {
    margin-left: 0;
    padding: 1rem;
  }

  .main-content.sidebar-closed {
    margin-left: 0;
  }
}

/* Content Area */
.content-area {
  flex: 1;
  overflow-y: auto;
  padding: 2.5rem;
  background: transparent;
}

/* Responsive Design */
@media (max-width: 1024px) {
  .main-content.sidebar-closed {
    margin-left: 80px;
  }

  .content-area {
    padding: 2rem;
  }
}

@media (max-width: 768px) {
  .main-content {
    margin-left: 0;
  }

  .main-content.sidebar-closed {
    margin-left: 0;
  }

  .content-area {
    padding: 1.5rem;
  }
}
</style>
