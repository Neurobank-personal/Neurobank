<template>
  <div class="flashcards-container">
    <!-- Deck Overview -->
    <DeckOverview 
      v-if="currentView === 'overview'"
      @viewDeck="viewDeck"
    />

    <!-- Deck View -->
    <DeckView 
      v-else-if="currentView === 'deck'"
      :deckId="selectedDeckId"
      @goBack="goBackToOverview"
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import DeckOverview from './DeckOverview.vue'
import DeckView from './DeckView.vue'

// Navigation state
const currentView = ref<'overview' | 'deck'>('overview')
const selectedDeckId = ref<string | null>(null)

const viewDeck = (deckId: string | null) => {
  selectedDeckId.value = deckId
  currentView.value = 'deck'
}

const goBackToOverview = () => {
  currentView.value = 'overview'
  selectedDeckId.value = null
}
</script>

<style scoped>
.flashcards-container {
  min-height: 100vh;
}
</style>
