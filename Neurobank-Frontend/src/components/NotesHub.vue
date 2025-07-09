<template>
  <div class="notes-container">
    <!-- Note Folder Overview -->
    <NoteFolderOverview
      v-if="currentView === 'overview'"
      @viewFolder="viewFolder"
    />

    <!-- Note Folder View -->
    <NoteFolderView
      v-else-if="currentView === 'folder'"
      :folderId="selectedFolderId"
      @goBack="goBackToOverview"
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import NoteFolderOverview from "./NoteFolderOverview.vue";
import NoteFolderView from "./NoteFolderView.vue";

// Navigation state
const currentView = ref<"overview" | "folder">("overview");
const selectedFolderId = ref<string | null>(null);

const viewFolder = (folderId: string | null) => {
  selectedFolderId.value = folderId;
  currentView.value = "folder";
};

const goBackToOverview = () => {
  currentView.value = "overview";
  selectedFolderId.value = null;
};
</script>

<style scoped>
.notes-container {
  min-height: 100vh;
  background: #f8f9fa;
}
</style>
