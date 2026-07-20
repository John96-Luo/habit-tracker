<script setup lang="ts">
import { onMounted, computed } from 'vue';
import { useTodoStore } from '../stores/todoStore';
import { DEBOUNCE_DELAY } from '../utils/constants';

const store = useTodoStore();

let debounceTimer: ReturnType<typeof setTimeout> | null = null;
const dayRecord = computed(() => store.getTodayRecord());

onMounted(() => {
  store.checkAndRefreshToday();
});

function onInput(todoId: string, event: Event): void {
  const value = (event.target as HTMLInputElement).value;
  if (debounceTimer) clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => {
    store.updateContent(todoId, value);
  }, DEBOUNCE_DELAY);
}

function onBlur(todoId: string, event: Event): void {
  if (debounceTimer) clearTimeout(debounceTimer);
  const value = (event.target as HTMLInputElement).value;
  store.updateContent(todoId, value);
}

function onToggle(todoId: string): void {
  store.toggle(todoId);
}

/** 生成友好的中文日期 */
function friendlyDate(dateStr: string): string {
  const parts = dateStr.split('-');
  const weekdays = ['日', '一', '二', '三', '四', '五', '六'];
  const d = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
  const month = d.getMonth() + 1;
  const day = d.getDate();
  const weekday = weekdays[d.getDay()];
  return `${month}月${day}日 周${weekday}`;
}

// 拖拽处理
let draggedId: string | null = null;

function onDragStart(todoId: string, event: DragEvent): void {
  draggedId = todoId;
  if (event.dataTransfer) {
    event.dataTransfer.effectAllowed = 'move';
  }
}

function onDragOver(event: DragEvent): void {
  event.preventDefault();
  if (event.dataTransfer) {
    event.dataTransfer.dropEffect = 'move';
  }
}

function onDrop(targetOrder: number): void {
  if (draggedId === null) return;
  store.reorder(draggedId, targetOrder);
  draggedId = null;
}

function onDragEnd(): void {
  draggedId = null;
}
</script>

<template>
  <div class="page">
    <header class="header">
      <h1 class="title">今天最重要的三件事</h1>
      <p class="date">{{ friendlyDate(store.todayStr) }}</p>
    </header>

    <div class="todo-list">
      <div
        v-for="(todo, index) in dayRecord.todos"
        :key="todo.id"
        class="todo-item"
        :class="{ 'is-done': todo.done }"
        draggable="true"
        @dragstart="onDragStart(todo.id, $event)"
        @dragover="onDragOver"
        @drop="onDrop(index)"
        @dragend="onDragEnd"
      >
        <span class="drag-handle" aria-label="拖拽排序">⋮⋮</span>
        <input
          type="text"
          class="todo-input"
          :value="todo.content"
          :placeholder="`第${index + 1}件最重要的事是…`"
          @input="onInput(todo.id, $event)"
          @blur="onBlur(todo.id, $event)"
        />
        <button
          class="check-btn"
          :class="{ checked: todo.done }"
          @click="onToggle(todo.id)"
          :aria-label="todo.done ? '标记为未完成' : '标记为已完成'"
        >
          <span v-if="todo.done" class="check-icon">✓</span>
        </button>
      </div>
    </div>

    <div class="weekly-progress">
      <div class="progress-text">
        本周 {{ store.weeklyStats.completed }}/{{ store.weeklyStats.total }}
      </div>
      <div class="progress-bar">
        <div
          class="progress-fill"
          :style="{ width: (store.weeklyStats.rate * 100) + '%' }"
        ></div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.page {
  max-width: 480px;
  margin: 0 auto;
  padding: 24px 16px;
  min-height: 100vh;
}

.header {
  text-align: center;
  margin-bottom: 32px;
}

.title {
  font-size: 22px;
  font-weight: 700;
  color: #1a1a2e;
  margin: 0 0 4px;
}

.date {
  font-size: 14px;
  color: #888;
  margin: 0;
}

.todo-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 32px;
}

.todo-item {
  display: flex;
  align-items: center;
  gap: 10px;
  background: #f8f9fa;
  border-radius: 12px;
  padding: 8px 12px;
  transition: background 0.2s, opacity 0.2s;
  cursor: grab;
}

.todo-item:active {
  cursor: grabbing;
}

.todo-item.is-done {
  opacity: 0.6;
  background: #eef7ee;
}

.drag-handle {
  color: #ccc;
  font-size: 16px;
  cursor: grab;
  user-select: none;
  line-height: 1;
  letter-spacing: -2px;
  padding: 4px 0;
}

.todo-input {
  flex: 1;
  border: none;
  background: transparent;
  font-size: 16px;
  color: #333;
  outline: none;
  padding: 6px 0;
}

.todo-input::placeholder {
  color: #bbb;
}

.is-done .todo-input {
  text-decoration: line-through;
  color: #999;
}

.check-btn {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  border: 2px solid #d0d0d0;
  background: transparent;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: all 0.2s;
  padding: 0;
}

.check-btn.checked {
  background: #4caf50;
  border-color: #4caf50;
}

.check-icon {
  color: white;
  font-size: 14px;
  font-weight: bold;
}

.weekly-progress {
  padding: 16px;
  background: #f8f9fa;
  border-radius: 12px;
}

.progress-text {
  font-size: 14px;
  color: #666;
  margin-bottom: 8px;
  text-align: center;
}

.progress-bar {
  height: 8px;
  background: #e0e0e0;
  border-radius: 4px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #66bb6a, #43a047);
  border-radius: 4px;
  transition: width 0.3s ease;
}
</style>
