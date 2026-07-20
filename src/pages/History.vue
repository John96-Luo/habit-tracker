<script setup lang="ts">
import { computed } from 'vue';
import { useTodoStore } from '../stores/todoStore';

const store = useTodoStore();

// 按日期倒序排列
const sortedRecords = computed(() => {
  return [...store.records].sort((a, b) => b.date.localeCompare(a.date));
});

function doneCountStr(count: number): string {
  return `${count}`;
}

function deleteRecord(date: string): void {
  if (confirm('确定要删除这天的记录吗？')) {
    store.deleteRecord(date);
  }
}
</script>

<template>
  <div class="page">
    <header class="header">
      <h1 class="title">历史记录</h1>
    </header>

    <div v-if="sortedRecords.length === 0" class="empty">
      <p>还没有任何记录</p>
      <p class="sub">每天打开应用，记录今天最重要的三件事吧</p>
    </div>

    <div class="history-list">
      <div
        v-for="record in sortedRecords"
        :key="record.date"
        class="history-card"
      >
        <div class="card-header">
          <span class="card-date">{{ record.date }}</span>
          <span class="card-status">
            ✅ {{ doneCountStr(record.todos.filter(t => t.done).length) }}/3
          </span>
          <button class="delete-btn" @click="deleteRecord(record.date)" title="删除">×</button>
        </div>
        <ul class="card-todos">
          <li
            v-for="todo in record.todos"
            :key="todo.id"
            :class="{ done: todo.done }"
          >
            <span class="todo-bullet" :class="{ checked: todo.done }">
              {{ todo.done ? '✓' : '○' }}
            </span>
            <span class="todo-text">{{ todo.content || '（未填写）' }}</span>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<style scoped>
.page {
  max-width: 480px;
  margin: 0 auto;
  padding: 24px 16px 100px;
  min-height: 100vh;
}

.header {
  text-align: center;
  margin-bottom: 24px;
}

.title {
  font-size: 22px;
  font-weight: 700;
  color: #1a1a2e;
  margin: 0;
}

.empty {
  text-align: center;
  padding: 60px 20px;
  color: #999;
}

.empty .sub {
  font-size: 14px;
  margin-top: 8px;
}

.history-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.history-card {
  background: #f8f9fa;
  border-radius: 12px;
  padding: 16px;
  transition: background 0.2s;
}

.card-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 10px;
}

.card-date {
  font-size: 14px;
  font-weight: 600;
  color: #1a1a2e;
}

.card-status {
  font-size: 14px;
  color: #666;
  margin-left: auto;
}

.delete-btn {
  background: none;
  border: none;
  font-size: 20px;
  color: #ccc;
  cursor: pointer;
  padding: 0 4px;
  line-height: 1;
}

.delete-btn:hover {
  color: #e53935;
}

.card-todos {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.card-todos li {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 15px;
  color: #444;
}

.card-todos li.done .todo-text {
  text-decoration: line-through;
  color: #aaa;
}

.todo-bullet {
  font-size: 14px;
  color: #ccc;
  flex-shrink: 0;
}

.todo-bullet.checked {
  color: #4caf50;
}

.todo-text {
  color: #444;
}
</style>
