<script setup lang="ts">
import { useRouter, useRoute } from 'vue-router';

const router = useRouter();
const route = useRoute();

const tabs = [
  { path: '/', label: '今日', icon: '📋' },
  { path: '/history', label: '历史', icon: '📅' },
  { path: '/stats', label: '统计', icon: '📊' },
];

function navigateTo(path: string): void {
  router.push(path);
}
</script>

<template>
  <div class="app-container">
    <main class="main-content">
      <router-view />
    </main>
    <nav class="tab-bar">
      <button
        v-for="tab in tabs"
        :key="tab.path"
        class="tab-item"
        :class="{ active: route.path === tab.path }"
        @click="navigateTo(tab.path)"
      >
        <span class="tab-icon">{{ tab.icon }}</span>
        <span class="tab-label">{{ tab.label }}</span>
      </button>
    </nav>
  </div>
</template>

<style scoped>
.app-container {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  min-height: 100dvh;
}

.main-content {
  flex: 1;
  overflow-y: auto;
}

.tab-bar {
  display: flex;
  justify-content: space-around;
  align-items: center;
  background: #fff;
  border-top: 1px solid #eee;
  padding: 6px 0;
  padding-bottom: max(6px, env(safe-area-inset-bottom));
  position: sticky;
  bottom: 0;
  z-index: 100;
}

.tab-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  background: none;
  border: none;
  cursor: pointer;
  padding: 6px 20px;
  border-radius: 10px;
  transition: all 0.2s;
  color: #999;
  font-size: 12px;
}

.tab-item.active {
  color: #4caf50;
  background: #f1f8e9;
}

.tab-item:hover {
  color: #66bb6a;
}

.tab-icon {
  font-size: 20px;
}

.tab-label {
  font-size: 11px;
  font-weight: 500;
}
</style>
