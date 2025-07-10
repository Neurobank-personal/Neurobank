<script setup lang="ts">
import { useRouter, useRoute } from "vue-router";
import { onMounted, ref } from "vue";

const router = useRouter();
const route = useRoute();
const isVisible = ref(false);

// TODO: gör om denna så att den blir mer passande till hela hemsidan

const funnyMessages = [
  "Oops! Du har hittat vår hemliga gömställe... fast det var inte så hemligt.",
  "404: Sidan har gått ut för att köpa mjölk och kom aldrig tillbaka 🥛",
  "Denna sida är på semester. Prova igen om 5 minuter... eller inte.",
  "Du har hittat det digitala Bermudatriangeln! 🛸",
  "Sidan spelar kurragömma och vinner just nu! 🙈",
];

const randomMessage =
  funnyMessages[Math.floor(Math.random() * funnyMessages.length)];

const goToLogin = () => {
  router.push("/loginpage");
};

const goBack = () => {
  router.go(-1);
};

onMounted(() => {
  setTimeout(() => {
    isVisible.value = true;
  }, 100);
});
</script>

<template>
  <div class="not-found-container" :class="{ 'fade-in': isVisible }">
    <div class="not-found-card">
      <div class="error-animation">
        <div class="floating-404">4🤖4</div>
        <div class="stars">
          <div class="star" v-for="n in 6" :key="n"></div>
        </div>
      </div>

      <h2 class="error-title">Whoops! Något gick snett! 🚀</h2>
      <p class="funny-message">{{ randomMessage }}</p>
      <p class="path-info">
        Du försökte besöka: <code class="error-path">{{ route.fullPath }}</code>
      </p>

      <div class="suggestions">
        <h3>🎯 Kanske du letade efter någon av dessa?</h3>
        <div class="suggestion-grid">
          <button @click="goToLogin" class="suggestion-btn login-btn">
            🔐 Logga in
          </button>
          <button
            @click="() => router.push('/registerpage')"
            class="suggestion-btn register-btn"
          >
            ✨ Registrera dig
          </button>
          <button
            @click="() => router.push('/home')"
            class="suggestion-btn home-btn-suggestion"
          >
            🏠 Startsida
          </button>
        </div>
      </div>

      <div class="actions">
        <button @click="goBack" class="back-btn">⬅️ Gå tillbaka</button>
        <button @click="goToLogin" class="home-btn">🚀 Till startsidan</button>
      </div>

      <div class="easter-egg">
        <p>
          🎉 Fun fact: Du är den {{ Math.floor(Math.random() * 1000) + 1 }}:e
          personen som hittar denna sida idag!
        </p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.not-found-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  opacity: 0;
  transition: opacity 0.6s ease-in-out;
}

.not-found-container.fade-in {
  opacity: 1;
}

.not-found-card {
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  padding: 3rem;
  border-radius: 20px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.2);
  width: 100%;
  max-width: 600px;
  text-align: center;
  position: relative;
  overflow: hidden;
  animation: cardBounce 0.8s ease-out;
}

@keyframes cardBounce {
  0% {
    transform: scale(0.3) rotate(-10deg);
    opacity: 0;
  }
  50% {
    transform: scale(1.1) rotate(5deg);
  }
  100% {
    transform: scale(1) rotate(0deg);
    opacity: 1;
  }
}

.error-animation {
  position: relative;
  margin-bottom: 2rem;
}

.floating-404 {
  font-size: 6rem;
  font-weight: bold;
  background: linear-gradient(45deg, #ff6b6b, #4ecdc4, #45b7d1, #96ceb4);
  background-size: 300% 300%;
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  animation: gradientShift 3s ease-in-out infinite,
    float 2s ease-in-out infinite;
}

@keyframes gradientShift {
  0% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0% 50%;
  }
}

@keyframes float {
  0%,
  100% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-10px);
  }
}

.stars {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
}

.star {
  position: absolute;
  width: 4px;
  height: 4px;
  background: #ffd700;
  border-radius: 50%;
  animation: twinkle 2s ease-in-out infinite;
}

.star:nth-child(1) {
  top: 20%;
  left: 20%;
  animation-delay: 0s;
}
.star:nth-child(2) {
  top: 30%;
  right: 30%;
  animation-delay: 0.5s;
}
.star:nth-child(3) {
  top: 60%;
  left: 10%;
  animation-delay: 1s;
}
.star:nth-child(4) {
  bottom: 40%;
  right: 20%;
  animation-delay: 1.5s;
}
.star:nth-child(5) {
  bottom: 20%;
  left: 50%;
  animation-delay: 2s;
}
.star:nth-child(6) {
  top: 10%;
  left: 70%;
  animation-delay: 2.5s;
}

@keyframes twinkle {
  0%,
  100% {
    opacity: 0;
    transform: scale(0);
  }
  50% {
    opacity: 1;
    transform: scale(1);
  }
}

.error-title {
  color: #333;
  margin: 1rem 0;
  font-size: 2rem;
  animation: slideInFromLeft 0.8s ease-out 0.3s both;
}

@keyframes slideInFromLeft {
  0% {
    transform: translateX(-100px);
    opacity: 0;
  }
  100% {
    transform: translateX(0);
    opacity: 1;
  }
}

.funny-message {
  font-size: 1.2rem;
  color: #555;
  margin: 1.5rem 0;
  font-style: italic;
  animation: slideInFromRight 0.8s ease-out 0.5s both;
}

@keyframes slideInFromRight {
  0% {
    transform: translateX(100px);
    opacity: 0;
  }
  100% {
    transform: translateX(0);
    opacity: 1;
  }
}

.path-info {
  color: #666;
  margin: 1rem 0;
}

.error-path {
  background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%);
  padding: 0.2rem 0.5rem;
  border-radius: 4px;
  color: #e74c3c;
  font-family: "Courier New", monospace;
}

.suggestions {
  margin: 2rem 0;
  animation: fadeInUp 0.8s ease-out 0.7s both;
}

@keyframes fadeInUp {
  0% {
    transform: translateY(30px);
    opacity: 0;
  }
  100% {
    transform: translateY(0);
    opacity: 1;
  }
}

.suggestions h3 {
  color: #333;
  margin-bottom: 1rem;
}

.suggestion-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 1rem;
  margin: 1rem 0;
}

.suggestion-btn {
  padding: 1rem;
  border: none;
  border-radius: 12px;
  cursor: pointer;
  font-size: 1rem;
  font-weight: 500;
  transition: all 0.3s ease;
  transform: translateY(0);
}

.suggestion-btn:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
}

.login-btn {
  background: linear-gradient(45deg, #007bff, #0056b3);
  color: white;
}

.register-btn {
  background: linear-gradient(45deg, #28a745, #218838);
  color: white;
}

.home-btn-suggestion {
  background: linear-gradient(45deg, #ffc107, #e0a800);
  color: #333;
}

.actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
  margin-top: 2rem;
  animation: fadeInUp 0.8s ease-out 0.9s both;
}

.back-btn,
.home-btn {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 25px;
  cursor: pointer;
  font-size: 1rem;
  font-weight: 500;
  transition: all 0.3s ease;
}

.back-btn {
  background: linear-gradient(45deg, #6c757d, #545b62);
  color: white;
}

.home-btn {
  background: linear-gradient(45deg, #17a2b8, #138496);
  color: white;
}

.back-btn:hover,
.home-btn:hover {
  transform: scale(1.05);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
}

.easter-egg {
  margin-top: 2rem;
  padding: 1rem;
  background: linear-gradient(135deg, #2d2d2d 0%, #1a1a1a 100%);
  border-radius: 10px;
  animation: fadeInUp 0.8s ease-out 1.1s both;
}

.easter-egg p {
  margin: 0;
  color: #6c757d;
  font-style: italic;
}

@media (max-width: 600px) {
  .actions {
    flex-direction: column;
  }

  .not-found-card {
    padding: 2rem 1rem;
    margin: 1rem;
  }

  .floating-404 {
    font-size: 4rem;
  }

  .suggestion-grid {
    grid-template-columns: 1fr;
  }
}
</style>
