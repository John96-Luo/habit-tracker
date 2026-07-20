<script setup lang="ts">
import { computed, ref } from 'vue';
import { useTodoStore } from '../stores/todoStore';
import { getMonthGrid, getDaysInMonth, formatDate } from '../utils/date';

const store = useTodoStore();

const now = new Date();
const currentYear = ref(now.getFullYear());
const currentMonth = ref(now.getMonth()); // 0-indexed

const monthStats = computed(() => {
  return store.getMonthStats(currentYear.value, currentMonth.value);
});

const monthGrid = computed(() => {
  return getMonthGrid(currentYear.value, currentMonth.value);
});

const weekHeaders = ['一', '二', '三', '四', '五', '六', '日'];

function prevMonth(): void {
  if (currentMonth.value === 0) {
    currentMonth.value = 11;
    currentYear.value--;
  } else {
    currentMonth.value--;
  }
}

function nextMonth(): void {
  if (currentMonth.value === 11) {
    currentMonth.value = 0;
    currentYear.value++;
  } else {
    currentMonth.value++;
  }
}

function getCellColor(day: number): string {
  const dateStr = formatDate(new Date(currentYear.value, currentMonth.value, day));
  const detail = monthStats.value.dailyDetail.find((d) => d.date === dateStr);
  if (!detail || detail.done === 0) return 'cell-empty';
  if (detail.done === 1) return 'cell-low';
  if (detail.done === 2) return 'cell-mid';
  return 'cell-high';
}

function getTooltip(day: number): string {
  const dateStr = formatDate(new Date(currentYear.value, currentMonth.value, day));
  const detail = monthStats.value.dailyDetail.find((d) => d.date === dateStr);
  if (!detail || detail.done === 0) return `${dateStr}: 0/3`;
  return `${dateStr}: ${detail.done}/3`;
}

const monthLabel = computed(() => {
  return `${currentYear.value}年${currentMonth.value + 1}月`;
});

const todayStr = formatDate(now);
</script>

<template>
  <div class="page">
    <header class="header">
      <h1 class="title">统计数据</h1>
    </header>

    <!-- 本周统计 -->
    <section class="section">
      <h2 class="section-title">本周进度</h2>
      <div class="weekly-card">
        <div class="weekly-numbers">
          <span class="weekly-completed">{{ store.weeklyStats.completed }}</span>
          <span class="weekly-separator">/</span>
          <span class="weekly-total">{{ store.weeklyStats.total }}</span>
        </div>
        <div class="progress-bar">
          <div
            class="progress-fill"
            :style="{ width: (store.weeklyStats.rate * 100) + '%' }"
          ></div>
        </div>
        <div class="weekly-rate">
          完成率 {{ Math.round(store.weeklyStats.rate * 100) }}%
        </div>
      </div>
    </section>

    <!-- 月度热力图 -->
    <section class="section">
      <div class="month-header">
        <button class="month-nav" @click="prevMonth">&lt;</button>
        <h2 class="section-title">{{ monthLabel }}</h2>
        <button class="month-nav" @click="nextMonth">&gt;</button>
      </div>

      <div class="heatmap">
        <div class="heatmap-weekdays">
          <span v-for="day in weekHeaders" :key="day" class="weekday">
            {{ day }}
          </span>
        </div>
        <div class="heatmap-grid">
          <template v-for="(row, rowIndex) in monthGrid" :key="rowIndex">
            <div
              v-for="(day, colIndex) in row"
              :key="`${rowIndex}-${colIndex}`"
              class="cell"
              :class="[
                day !== null ? getCellColor(day) : 'cell-null',
                day !== null && formatDate(new Date(currentYear, currentMonth, day)) === todayStr ? 'cell-today' : '',
              ]"
              :title="day !== null ? getTooltip(day) : ''"
            >
              <span v-if="day !== null" class="cell-day">{{ day }}</span>
            </div>
          </template>
        </div>
      </div>

      <div class="legend">
        <span class="legend-item"><span class="dot cell-empty"></span> 0</span>
        <span class="legend-item"><span class="dot cell-low"></span> 1</span>
        <span class="legend-item"><span class="dot cell-mid"></span> 2</span>
        <span class="legend-item"><span class="dot cell-high"></span> 3</span>
      </div>

      <div class="month-summary">
        本月完成 <strong>{{ monthStats.completed }}</strong> / {{ monthStats.total }} 件，
        日均完成率 <strong>{{ Math.round(monthStats.rate * 100) }}%</strong>
      </div>
    </section>
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

.section {
  margin-bottom: 32px;
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  color: #1a1a2e;
  margin: 0 0 12px;
}

.weekly-card {
  background: #f8f9fa;
  border-radius: 12px;
  padding: 20px;
  text-align: center;
}

.weekly-numbers {
  margin-bottom: 12px;
}

.weekly-completed {
  font-size: 36px;
  font-weight: 700;
  color: #4caf50;
}

.weekly-separator {
  font-size: 24px;
  color: #ccc;
  margin: 0 4px;
}

.weekly-total {
  font-size: 24px;
  color: #999;
}

.progress-bar {
  height: 8px;
  background: #e0e0e0;
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 8px;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #66bb6a, #43a047);
  border-radius: 4px;
  transition: width 0.3s ease;
}

.weekly-rate {
  font-size: 14px;
  color: #666;
}

.month-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}

.month-header .section-title {
  margin-bottom: 0;
}

.month-nav {
  background: #f0f0f0;
  border: none;
  border-radius: 8px;
  padding: 4px 12px;
  font-size: 16px;
  cursor: pointer;
  color: #666;
}

.month-nav:hover {
  background: #e0e0e0;
}

.heatmap-weekdays {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 4px;
  margin-bottom: 4px;
}

.weekday {
  text-align: center;
  font-size: 12px;
  color: #999;
  padding: 4px 0;
}

.heatmap-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 4px;
}

.cell {
  aspect-ratio: 1;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 13px;
  transition: transform 0.15s;
  cursor: default;
}

.cell:hover {
  transform: scale(1.15);
}

.cell-null {
  background: transparent;
}

.cell-empty {
  background: #f0f0f0;
  color: #aaa;
}

.cell-low {
  background: #c8e6c9;
  color: #2e7d32;
}

.cell-mid {
  background: #66bb6a;
  color: #fff;
}

.cell-high {
  background: #2e7d32;
  color: #fff;
}

.cell-today {
  box-shadow: 0 0 0 2px #1a1a2e;
}

.cell-day {
  font-size: 12px;
}

.legend {
  display: flex;
  justify-content: center;
  gap: 12px;
  margin-top: 12px;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: #888;
}

.dot {
  width: 14px;
  height: 14px;
  border-radius: 4px;
  display: inline-block;
}

.month-summary {
  margin-top: 16px;
  text-align: center;
  font-size: 14px;
  color: #666;
  background: #f8f9fa;
  border-radius: 8px;
  padding: 12px;
}
</style>
