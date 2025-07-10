<script setup lang="ts">
import { ref } from "vue";
import { useRouter } from "vue-router";
import { handleRegister } from "../services/handleRegister";

const router = useRouter();

const firstName = ref("");
const lastName = ref("");
const email = ref("");
const password = ref("");
const confirmPassword = ref("");
const isLoading = ref(false);
const errorMessage = ref("");

const handleSubmit = async () => {
  errorMessage.value = "";

  if (password.value !== confirmPassword.value) {
    errorMessage.value = "Passwords do not match!";
    return;
  }

  isLoading.value = true;

  try {
    const result = await handleRegister({
      firstName: firstName.value,
      lastName: lastName.value,
      email: email.value,
      password: password.value,
    });

    if (result.success) {
      alert("Registration successful! You can now log in.");
      router.push("/loginpage");
    } else {
      errorMessage.value = result.error || "An error occurred";
    }
  } catch (error) {
    errorMessage.value = "An unexpected error occurred";
  } finally {
    isLoading.value = false;
  }
};

const goToLogin = () => {
  router.push("/loginpage");
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

      <!-- Register Section -->
      <div class="register-section">
        <div class="register-content">
          <h2>Create Account</h2>
          <p class="subtitle">Create your second brain</p>

          <div v-if="errorMessage" class="error-message">
            {{ errorMessage }}
          </div>

          <form @submit.prevent="handleSubmit" class="register-form">
            <div class="name-row">
              <div class="input-group">
                <input
                  id="firstName"
                  type="text"
                  v-model="firstName"
                  placeholder="First name"
                  required
                  :disabled="isLoading"
                />
              </div>

              <div class="input-group">
                <input
                  id="lastName"
                  type="text"
                  v-model="lastName"
                  placeholder="Last name"
                  required
                  :disabled="isLoading"
                />
              </div>
            </div>

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
                placeholder="Password (at least 6 characters)"
                required
                :disabled="isLoading"
              />
            </div>

            <div class="input-group">
              <input
                id="confirmPassword"
                type="password"
                v-model="confirmPassword"
                placeholder="Confirm password"
                required
                :disabled="isLoading"
              />
            </div>

            <button type="submit" class="register-btn" :disabled="isLoading">
              {{ isLoading ? "Creating account..." : "Create account" }}
            </button>
          </form>

          <div class="login-link">
            <p>
              Already have an account?
              <button @click="goToLogin" class="link-btn" :disabled="isLoading">
                Log in here
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>

    <!-- Sidebar with Different Icons -->
    <div class="sidebar">
      <div
        class="floating-icon user-floating large-icon"
        style="position: absolute; top: 20%; left: 10%"
      >
        <svg
          width="80"
          height="80"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#9ca3af"
          stroke-width="1.5"
        >
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
          <circle cx="12" cy="7" r="4" />
        </svg>
      </div>

      <div
        class="floating-icon lock-floating medium-icon"
        style="position: absolute; top: 10%; right: 20%"
      >
        <svg
          width="64"
          height="64"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#9ca3af"
          stroke-width="1.5"
        >
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
          <circle cx="12" cy="16" r="1" />
          <path d="M7 11V7a5 5 0 0 1 10 0v4" />
        </svg>
      </div>

      <div
        class="floating-icon mail-floating small-icon"
        style="position: absolute; top: 45%; left: 20%"
      >
        <svg
          width="48"
          height="48"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#9ca3af"
          stroke-width="1.5"
        >
          <path
            d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"
          />
          <polyline points="22,6 12,13 2,6" />
        </svg>
      </div>

      <div
        class="floating-icon shield-floating medium-icon"
        style="position: absolute; top: 65%; right: 15%"
      >
        <svg
          width="64"
          height="64"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#9ca3af"
          stroke-width="1.5"
        >
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          <path d="M9 12l2 2 4-4" />
        </svg>
      </div>

      <div
        class="floating-icon edit-floating small-icon"
        style="position: absolute; top: 35%; right: 5%"
      >
        <svg
          width="48"
          height="48"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#9ca3af"
          stroke-width="1.5"
        >
          <path
            d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"
          />
          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
        </svg>
      </div>

      <div
        class="floating-icon check-floating large-icon"
        style="position: absolute; top: 80%; left: 25%"
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
          <polyline points="9,12 12,15 16,11" />
        </svg>
      </div>

      <div
        class="floating-icon key-floating medium-icon"
        style="position: absolute; top: 5%; left: 45%"
      >
        <svg
          width="64"
          height="64"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#9ca3af"
          stroke-width="1.5"
        >
          <circle cx="7" cy="7" r="3" />
          <path
            d="M10 9h10a2 2 0 0 1 2 2v2a2 2 0 0 1-2 2H12l-2-4h-2a2 2 0 0 1-2-2V7"
          />
        </svg>
      </div>
    </div>
  </div>
</template>

<style scoped>
@import url("https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap");

.app-layout {
  display: flex;
  min-height: 100vh;
  background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%);
  font-family: "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI",
    sans-serif;
}

.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.header {
  padding: 2rem 0 1rem 4rem;
}

.logo {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.brain-icon {
  width: 84px;
  height: 84px;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.brain-icon img {
  width: 84px;
  height: 84px;
  object-fit: contain;
}

.logo h1 {
  font-size: 2rem;
  font-weight: 700;
  color: #1f2937;
  margin: 0;
  letter-spacing: -0.5px;
  font-family: "Inter", sans-serif;
}

.register-section {
  flex: 1;
  display: flex;
  justify-content: flex-start;
  align-items: flex-start;
  padding: 2rem 4rem;
  padding-top: 3rem;
}

.register-content {
  width: 100%;
  max-width: 520px;
}

.register-content h2 {
  font-size: 3rem;
  font-weight: 400;
  color: #1f2937;
  margin: 0 0 0.5rem 0;
  letter-spacing: -1px;
  font-family: "Inter", sans-serif;
}

.subtitle {
  color: #6b7280;
  margin-bottom: 3rem;
  font-size: 1.125rem;
  line-height: 1.5;
  font-weight: 400;
  font-family: "Inter", sans-serif;
}

.register-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.name-row {
  display: flex;
  gap: 1rem;
}

.input-group {
  flex: 1;
}

.input-group input {
  width: 100%;
  padding: 1rem 1.25rem;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  font-size: 1rem;
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-sizing: border-box;
  transition: all 0.2s ease;
  font-family: "Inter", sans-serif;
  font-weight: 400;
}

.input-group input:focus {
  outline: none;
  border-color: #10b981;
  box-shadow: 0 0 0 4px rgba(16, 185, 129, 0.1);
}

.input-group input:disabled {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.1);
  opacity: 0.6;
  cursor: not-allowed;
}

.register-btn {
  width: 100%;
  padding: 1rem 1.25rem;
  background-color: #10b981;
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  margin-top: 1rem;
  transition: background-color 0.2s ease;
  font-family: "Inter", sans-serif;
}

.register-btn:hover:not(:disabled) {
  background-color: #059669;
}

.register-btn:disabled {
  background-color: #9ca3af;
  cursor: not-allowed;
}

.login-link {
  text-align: left;
  margin-top: 2rem;
}

.login-link p {
  color: #6b7280;
  margin: 0;
  font-size: 1rem;
  font-family: "Inter", sans-serif;
  font-weight: 400;
}

.link-btn {
  background: none;
  border: none;
  color: #10b981;
  cursor: pointer;
  font-size: inherit;
  font-weight: 500;
  text-decoration: none;
  font-family: "Inter", sans-serif;
}

.link-btn:hover:not(:disabled) {
  text-decoration: underline;
}

.link-btn:disabled {
  color: #9ca3af;
  cursor: not-allowed;
}

.error-message {
  background-color: #fef2f2;
  color: #dc2626;
  padding: 0.75rem 1rem;
  border-radius: 8px;
  margin-bottom: 1.5rem;
  border: 1px solid rgba(239, 68, 68, 0.3);
  font-size: 0.9rem;
  font-family: "Inter", sans-serif;
}

/* Sidebar */
.sidebar {
  width: 420px;
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  padding: 2rem;
  border: none;
  position: relative;
  height: 100vh;
  overflow: hidden;
}

.floating-icon {
  background-color: transparent;
  border: none;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.4s ease;
  box-shadow: none;
}

.floating-icon:hover {
  background-color: transparent;
  border: none;
  transform: scale(1.1);
  box-shadow: none;
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

.user-floating {
  animation: float 9s ease-in-out infinite;
}

.lock-floating {
  animation: float 7s ease-in-out infinite 1s;
}

.mail-floating {
  animation: float 8s ease-in-out infinite 2s;
}

.shield-floating {
  animation: float 10s ease-in-out infinite 3s;
}

.edit-floating {
  animation: float 6s ease-in-out infinite 4s;
}

.check-floating {
  animation: float 8.5s ease-in-out infinite 5s;
}

.key-floating {
  animation: float 7.5s ease-in-out infinite 1.5s;
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

/* Responsive */
@media (max-width: 1024px) {
  .sidebar {
    width: 340px;
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

  .register-section {
    padding: 2rem;
    padding-top: 2rem;
  }
}

@media (max-width: 768px) {
  .app-layout {
    flex-direction: column;
  }

  .sidebar {
    width: 100%;
    height: 120px;
    border: none;
    border-top: 1px solid rgba(255, 255, 255, 0.1);
    order: 2;
    padding: 1rem;
    background: rgba(255, 255, 255, 0.05);
    backdrop-filter: blur(10px);
  }

  .floating-icon {
    position: relative !important;
    animation: none;
    display: inline-flex;
    margin: 0.5rem;
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

  .register-section {
    padding: 1rem;
    padding-top: 2rem;
  }

  .register-content h2 {
    font-size: 2.5rem;
  }

  .register-content {
    max-width: 100%;
  }

  .name-row {
    flex-direction: column;
    gap: 1.5rem;
  }
}
</style>
