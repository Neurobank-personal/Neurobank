import { createRouter, createWebHistory } from "vue-router";
import { useAuth } from "../stores/auth";

import HomePage from "../views/HomePage.vue";
import LoginPage from "../views/LoginPage.vue";
import RegisterPage from "../views/RegisterPage.vue";
import NotesPage from "../views/NotesPage.vue";
import TasksPage from "../views/TasksPage.vue";
import FlashcardsPage from "../views/FlashcardsPage.vue";
import NotFoundPage from "../views/NotFoundPage.vue";

const routes = [
  {
    path: "/",
    redirect: "/home",
  },
  {
    path: "/home",
    component: HomePage,
    meta: { requiresAuth: true },
  },
  {
    path: "/notes",
    component: NotesPage,
    meta: { requiresAuth: true },
  },
  {
    path: "/tasks",
    component: TasksPage,
    meta: { requiresAuth: true },
  },
  {
    path: "/flashcards",
    component: FlashcardsPage,
    meta: { requiresAuth: true },
  },
  {
    path: "/loginpage",
    component: LoginPage,
  },
  {
    path: "/registerpage",
    component: RegisterPage,
  },
  // Backward compatibility - redirect gamla homepage till /home
  {
    path: "/homepage",
    redirect: "/home",
  },
  {
    path: "/:pathMatch(.*)*",
    name: "NotFound",
    component: NotFoundPage,
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

// Route guard för autentisering
router.beforeEach((to, _from, next) => {
  const { isAuthenticated } = useAuth();

  if (to.meta.requiresAuth && !isAuthenticated.value) {
    next("/loginpage");
  } else if (
    (to.path === "/loginpage" || to.path === "/registerpage") &&
    isAuthenticated.value
  ) {
    next("/home");
  } else {
    next();
  }
});

export default router;
