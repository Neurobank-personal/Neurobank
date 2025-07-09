<script setup lang="ts">
import { onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import { useAuth } from "../stores/auth";
import AppSidebar from "../components/AppSidebar.vue";
import AppNavbar from "../components/AppNavbar.vue";
import TasksComponent from "../components/TasksComponent.vue";

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
    <!-- Sidebar Navigation -->
    <AppSidebar
      :isOpen="sidebarOpen"
      :currentSection="'tasks'"
      @toggle="toggleSidebar"
      @navigate="navigateToSection"
    />

    <!-- Main Content -->
    <div class="main-content" :class="{ 'sidebar-closed': !sidebarOpen }">
      <!-- Header -->
      <AppNavbar :isOpen="sidebarOpen" @logout="handleLogout" />

      <!-- Dynamic Content Area -->
      <div class="content-area">
        <TasksComponent />
      </div>
    </div>
  </div>
</template>

<style scoped>
@import url("https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap");

.app-layout {
  display: flex;
  min-height: 100vh;
  background-color: #f8f9fa;
  font-family: "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI",
    sans-serif;
}

/* Main Content */
.main-content {
  flex: 1;
  margin-left: 220px;
  display: flex;
  flex-direction: column;
  transition: margin-left 0.3s ease;
}

.main-content.sidebar-closed {
  margin-left: 80px;
}

/* Content Area */
.content-area {
  flex: 1;
  overflow-y: auto;
}

/* Responsive Design */
@media (max-width: 1024px) {
  .main-content.sidebar-closed {
    margin-left: 80px;
  }
}

@media (max-width: 768px) {
  .main-content {
    margin-left: 0;
  }

  .main-content.sidebar-closed {
    margin-left: 0;
  }
}
</style>
