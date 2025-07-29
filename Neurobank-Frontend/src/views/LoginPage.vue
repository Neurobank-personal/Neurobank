<script setup lang="ts">
import { ref } from "vue";
import { useRouter } from "vue-router";
import { handleLogin } from "../services/handleLogin";
import { useAuth } from "../stores/auth";

const router = useRouter();
const { login } = useAuth();

const email = ref("");
const password = ref("");
const isLoading = ref(false);
const errorMessage = ref("");

const handleSubmit = async () => {
  errorMessage.value = "";

  if (!email.value || !password.value) {
    errorMessage.value = "Fill in both email and password";
    return;
  }

  isLoading.value = true;

  try {
    const result = await handleLogin(email.value, password.value);

    if (result.success && result.user) {
      // Save the user in auth store
      login({
        id: result.user.id,
        firstName: result.user.firstName,
        lastName: result.user.lastName,
        email: result.user.email,
        password: "", // We don't save the password in frontend
        createdAt: new Date(), // We can fetch this from backend later
      });

      // Navigate to homepage on successful login
      router.push("/home");
    } else {
      errorMessage.value = result.error || "Login failed";
    }
  } catch (error) {
    errorMessage.value = "An unexpected error occurred";
  } finally {
    isLoading.value = false;
  }
};

const goToRegister = () => {
  router.push("/registerpage");
};
</script>

<template>
  <div class="app-layout">
    <!-- Main Content Area -->
    <div class="main-content">
      <!-- Header with Logo -->
      <div class="header">
        <div class="logo">
          <div class="brain-icon">
            <img src="/Neurobank_logo.png" alt="Neurobank" />
          </div>
          <h1>NEUROBANK</h1>
        </div>
      </div>

      <!-- Login Section -->
      <div class="login-section">
        <div class="login-content">
          <h2>Log in</h2>
          <p class="subtitle">Your second brain for notes and flashcards</p>

          <div v-if="errorMessage" class="error-message">
            {{ errorMessage }}
          </div>

          <form @submit.prevent="handleSubmit" class="login-form">
            <div class="input-group">
              <input
                id="email"
                type="email"
                v-model="email"
                placeholder="Email"
                required
                :disabled="isLoading"
              />
            </div>

            <div class="input-group">
              <input
                id="password"
                type="password"
                v-model="password"
                placeholder="Password"
                required
                :disabled="isLoading"
              />
              <div class="forgot-password">
                <a href="#" class="forgot-link">forgot?</a>
              </div>
            </div>

            <button type="submit" class="login-btn" :disabled="isLoading">
              {{ isLoading ? "Logging in..." : "Log in" }}
            </button>
          </form>

          <div class="register-link">
            <p>
              New here?
              <button
                @click="goToRegister"
                class="link-btn"
                :disabled="isLoading"
              >
                Create account
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>

    <!-- Sidebar Navigation -->
    <div class="sidebar">
      <div
        class="floating-icon notes-floating small-icon"
        style="position: absolute; top: 15%; right: 20%"
      >
        <svg
          width="48"
          height="48"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#9ca3af"
          stroke-width="1.5"
        >
          <rect x="3" y="3" width="18" height="18" rx="3" />
          <path d="M7 7h10M7 11h10M7 15h7" />
        </svg>
      </div>

      <div
        class="floating-icon tasks-floating large-icon"
        style="position: absolute; top: 35%; left: 5%"
      >
        <svg
          width="80"
          height="80"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#9ca3af"
          stroke-width="1.5"
        >
          <circle cx="12" cy="12" r="10" />
          <path d="m9 12 2 2 4-4" />
        </svg>
      </div>

      <div
        class="floating-icon flashcards-floating medium-icon"
        style="position: absolute; top: 60%; right: 15%"
      >
        <svg
          width="64"
          height="64"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#9ca3af"
          stroke-width="1.5"
        >
          <rect x="3" y="4" width="18" height="12" rx="2" />
          <rect x="5" y="6" width="14" height="8" rx="1" />
          <path d="M12 10h4" />
        </svg>
      </div>

      <div
        class="floating-icon extra-icon small-icon"
        style="position: absolute; top: 25%; left: 15%"
      >
        <svg
          width="48"
          height="48"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#9ca3af"
          stroke-width="1.5"
        >
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
          <polyline points="7,10 12,15 17,10" />
          <line x1="12" y1="15" x2="12" y2="3" />
        </svg>
      </div>

      <div
        class="floating-icon brain-floating medium-icon"
        style="position: absolute; top: 75%; left: 10%"
      >
        <svg
          width="64"
          height="64"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#9ca3af"
          stroke-width="1.5"
        >
          <path
            d="M12 3C8.5 3 6 5.5 6 9c0 1.5.5 3 1.5 4C6.5 14 6 15.5 6 17c0 3.5 2.5 6 6 6s6-2.5 6-6c0-1.5-.5-3-1.5-4 1-1 1.5-2.5 1.5-4 0-3.5-2.5-6-6-6z"
          />
          <circle cx="9" cy="9" r="1" fill="#9ca3af" />
          <circle cx="15" cy="9" r="1" fill="#9ca3af" />
        </svg>
      </div>

      <div
        class="floating-icon star-floating small-icon"
        style="position: absolute; top: 5%; left: 40%"
      >
        <svg
          width="48"
          height="48"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#9ca3af"
          stroke-width="1.5"
        >
          <polygon
            points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"
          />
        </svg>
      </div>

      <div
        class="floating-icon settings-floating medium-icon"
        style="position: absolute; top: 45%; right: 5%"
      >
        <svg
          width="64"
          height="64"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#9ca3af"
          stroke-width="1.5"
        >
          <circle cx="12" cy="12" r="3" />
          <path
            d="M12 1v6m0 6v6m11-7h-6m-6 0H1m21-7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V8z"
          />
        </svg>
      </div>

      <div
        class="floating-icon search-floating small-icon"
        style="position: absolute; top: 85%; right: 25%"
      >
        <svg
          width="48"
          height="48"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#9ca3af"
          stroke-width="1.5"
        >
          <circle cx="11" cy="11" r="8" />
          <path d="m21 21-4.35-4.35" />
        </svg>
      </div>

      <div
        class="floating-icon folder-floating medium-icon"
        style="position: absolute; top: 8%; left: 60%"
      >
        <svg
          width="64"
          height="64"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#9ca3af"
          stroke-width="1.5"
        >
          <path
            d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"
          />
        </svg>
      </div>
    </div>
  </div>
</template>

<style scoped>
@import url("https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=Playfair+Display:wght@400;500;600;700&display=swap");

.app-layout {
  display: flex;
  min-height: 100vh;
  background: linear-gradient(
    135deg,
    var(--cream) 0%,
    var(--beige) 50%,
    var(--light-gray) 100%
  );
  font-family: "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI",
    sans-serif;
  position: relative;
  overflow: hidden;
}

.app-layout::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: radial-gradient(
      circle at 20% 80%,
      rgba(162, 175, 155, 0.1) 0%,
      transparent 50%
    ),
    radial-gradient(
      circle at 80% 20%,
      rgba(104, 185, 132, 0.1) 0%,
      transparent 50%
    );
  z-index: 0;
}

.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  position: relative;
  z-index: 1;
}

.header {
  padding: 3rem 0 2rem 4rem;
}

.logo {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.brain-icon {
  width: 96px;
  height: 96px;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  background: linear-gradient(135deg, var(--sage), var(--accent));
  border-radius: 24px;
  padding: 16px;
  box-shadow: 0 8px 32px rgba(162, 175, 155, 0.3);
  transition: all 0.3s ease;
}

.brain-icon:hover {
  transform: scale(1.05) rotate(2deg);
  box-shadow: 0 12px 40px rgba(162, 175, 155, 0.4);
}

.brain-icon img {
  width: 64px;
  height: 64px;
  object-fit: contain;
  filter: brightness(0) invert(1);
}

.logo h1 {
  font-size: 2.5rem;
  font-weight: 700;
  color: var(--text-dark);
  margin: 0;
  letter-spacing: -0.02em;
  font-family: "Playfair Display", serif;
  background: linear-gradient(135deg, var(--sage), var(--accent));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.login-section {
  flex: 1;
  display: flex;
  justify-content: flex-start;
  align-items: flex-start;
  padding: 2rem 4rem;
  padding-top: 2rem;
}

.login-content {
  width: 100%;
  max-width: 520px;
  background: rgba(250, 249, 238, 0.8);
  backdrop-filter: blur(20px);
  border: 2px solid var(--border);
  border-radius: 32px;
  padding: 3rem;
  box-shadow: 0 20px 60px rgba(162, 175, 155, 0.15);
  position: relative;
  overflow: hidden;
}

.login-content::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, var(--sage), var(--accent));
}

.login-content h2 {
  font-size: 3.5rem;
  font-weight: 600;
  color: var(--text-dark);
  margin: 0 0 0.5rem 0;
  letter-spacing: -0.02em;
  font-family: "Playfair Display", serif;
}

.subtitle {
  color: var(--text-medium);
  margin-bottom: 3rem;
  font-size: 1.25rem;
  line-height: 1.5;
  font-weight: 400;
  font-family: "Inter", sans-serif;
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.input-group {
  position: relative;
}

.input-group input {
  width: 100%;
  padding: 1.25rem 1.5rem;
  border: 2px solid var(--border);
  border-radius: 16px;
  font-size: 1rem;
  background: var(--cream);
  color: var(--text-dark);
  box-sizing: border-box;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  font-family: "Inter", sans-serif;
  font-weight: 500;
}

.input-group input::placeholder {
  color: var(--text-light);
}

.input-group input:focus {
  outline: none;
  border-color: var(--sage);
  box-shadow: 0 0 0 4px rgba(162, 175, 155, 0.1);
  transform: translateY(-1px);
}

.input-group input:disabled {
  background: var(--light-gray);
  border-color: var(--border);
  opacity: 0.6;
  cursor: not-allowed;
}

.forgot-password {
  position: absolute;
  right: 1.5rem;
  top: 50%;
  transform: translateY(-50%);
}

.forgot-link {
  color: var(--text-light);
  text-decoration: none;
  font-size: 0.9rem;
  font-family: "Inter", sans-serif;
  font-weight: 500;
  transition: color 0.3s ease;
}

.forgot-link:hover {
  color: var(--sage);
}

.login-btn {
  width: 100%;
  padding: 1.25rem 1.5rem;
  background: linear-gradient(135deg, var(--sage), var(--accent));
  color: white;
  border: none;
  border-radius: 16px;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  margin-top: 1rem;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  font-family: "Inter", sans-serif;
  box-shadow: 0 8px 24px rgba(162, 175, 155, 0.3);
  position: relative;
  overflow: hidden;
}

.login-btn::before {
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

.login-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 12px 32px rgba(162, 175, 155, 0.4);
}

.login-btn:hover:not(:disabled)::before {
  left: 100%;
}

.login-btn:disabled {
  background: var(--text-light);
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.register-link {
  text-align: left;
  margin-top: 2rem;
}

.register-link p {
  color: var(--text-medium);
  margin: 0;
  font-size: 1rem;
  font-family: "Inter", sans-serif;
  font-weight: 400;
}

.link-btn {
  background: none;
  border: none;
  color: var(--sage);
  cursor: pointer;
  font-size: inherit;
  font-weight: 600;
  text-decoration: none;
  font-family: "Inter", sans-serif;
  transition: all 0.3s ease;
  position: relative;
}

.link-btn::after {
  content: "";
  position: absolute;
  bottom: -2px;
  left: 0;
  width: 0;
  height: 2px;
  background: var(--sage);
  transition: width 0.3s ease;
}

.link-btn:hover:not(:disabled)::after {
  width: 100%;
}

.link-btn:disabled {
  color: var(--text-light);
  cursor: not-allowed;
}

.error-message {
  background: rgba(239, 68, 68, 0.1);
  border: 2px solid rgba(239, 68, 68, 0.3);
  color: #dc2626;
  padding: 1rem 1.5rem;
  border-radius: 16px;
  margin-bottom: 2rem;
  font-size: 0.95rem;
  font-family: "Inter", sans-serif;
  font-weight: 500;
}

/* Sidebar */
.sidebar {
  width: 480px;
  background: rgba(220, 207, 192, 0.4);
  backdrop-filter: blur(20px);
  border-left: 2px solid var(--border);
  padding: 2rem;
  position: relative;
  height: 100vh;
  overflow: hidden;
  z-index: 1;
}

.floating-icon {
  background-color: rgba(250, 249, 238, 0.8);
  border: 2px solid var(--border);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 8px 24px rgba(162, 175, 155, 0.2);
}

.floating-icon:hover {
  background-color: var(--sage);
  border-color: var(--sage);
  transform: scale(1.1) rotate(5deg);
  box-shadow: 0 12px 32px rgba(162, 175, 155, 0.3);
}

.floating-icon:hover svg {
  stroke: white;
}

.small-icon {
  width: 80px;
  height: 80px;
}

.medium-icon {
  width: 120px;
  height: 120px;
}

.large-icon {
  width: 160px;
  height: 160px;
}

.notes-floating {
  animation: float 8s ease-in-out infinite;
}

.tasks-floating {
  animation: float 10s ease-in-out infinite 1s;
}

.flashcards-floating {
  animation: float 7s ease-in-out infinite 3s;
}

.extra-icon {
  animation: float 9s ease-in-out infinite 5s;
}

.brain-floating {
  animation: float 6s ease-in-out infinite 2s;
}

.star-floating {
  animation: float 11s ease-in-out infinite 4s;
}

.settings-floating {
  animation: float 8.5s ease-in-out infinite 6s;
}

.search-floating {
  animation: float 7.5s ease-in-out infinite 1.5s;
}

.folder-floating {
  animation: float 9.5s ease-in-out infinite 3.5s;
}

@keyframes float {
  0%,
  100% {
    transform: translateY(0px) translateX(0px);
  }
  25% {
    transform: translateY(-8px) translateX(4px);
  }
  50% {
    transform: translateY(-15px) translateX(-3px);
  }
  75% {
    transform: translateY(-5px) translateX(6px);
  }
}

/* Enhanced floating animation */
.floating-icon {
  animation-play-state: running;
}

.floating-icon:hover {
  animation-play-state: paused;
}

/* Responsive */
@media (max-width: 1024px) {
  .sidebar {
    width: 380px;
    padding: 1.5rem;
  }

  .small-icon {
    width: 64px;
    height: 64px;
  }

  .medium-icon {
    width: 96px;
    height: 96px;
  }

  .large-icon {
    width: 128px;
    height: 128px;
  }

  .header {
    padding: 2rem 0 1rem 2rem;
  }

  .login-section {
    padding: 2rem;
    padding-top: 2rem;
  }

  .login-content {
    padding: 2.5rem;
  }
}

@media (max-width: 768px) {
  .app-layout {
    flex-direction: column;
  }

  .sidebar {
    width: 100%;
    height: 140px;
    border-left: none;
    border-top: 2px solid var(--border);
    order: 2;
    padding: 1rem;
    background: rgba(220, 207, 192, 0.6);
    backdrop-filter: blur(20px);
    display: flex;
    align-items: center;
    justify-content: center;
    flex-wrap: wrap;
    gap: 1rem;
  }

  .floating-icon {
    position: relative !important;
    animation: none;
    display: inline-flex;
    margin: 0;
  }

  .small-icon {
    width: 48px;
    height: 48px;
  }

  .medium-icon {
    width: 56px;
    height: 56px;
  }

  .large-icon {
    width: 64px;
    height: 64px;
  }

  .header {
    padding: 1.5rem 1rem 0.5rem 1rem;
  }

  .brain-icon {
    width: 72px;
    height: 72px;
  }

  .brain-icon img {
    width: 48px;
    height: 48px;
  }

  .logo h1 {
    font-size: 2rem;
  }

  .login-section {
    padding: 1rem;
    padding-top: 1rem;
  }

  .login-content {
    max-width: 100%;
    padding: 2rem;
  }

  .login-content h2 {
    font-size: 2.5rem;
  }
}
</style>
