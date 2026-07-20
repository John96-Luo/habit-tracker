import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { AppData, DayRecord } from '../types/todo';
import { loadFromStorage, saveToStorage, exportData as exportStorage, importData as importStorage } from '../utils/storage';
import { getTodayStr } from '../utils/date';
import { useTodos } from '../composables/useTodos';
import { useStats } from '../composables/useStats';
import { MAX_TODOS_PER_DAY } from '../utils/constants';

const { getOrCreateDayRecord, updateTodoContent, toggleTodo, reorderTodos } = useTodos();
const { getWeeklyStats, getMonthlyStats } = useStats();

export const useTodoStore = defineStore('todos', () => {
  // 从 localStorage 加载数据
  const appData = ref<AppData>(loadFromStorage());

  // 当前日期
  const todayStr = ref(getTodayStr());

  /** 所有记录 */
  const records = computed(() => appData.value.records);

  /** 确保今日记录存在 */
  function ensureTodayRecord(): DayRecord {
    const { record, isNew } = getOrCreateDayRecord(appData.value.records, todayStr.value);
    if (isNew) {
      appData.value.records.unshift(record);
      persist();
    }
    return record;
  }

  /** 获取今日记录 */
  function getTodayRecord(): DayRecord {
    return ensureTodayRecord();
  }

  /** 更新 todo 内容 */
  function updateContent(todoId: string, content: string): void {
    const record = getTodayRecord();
    const updated = updateTodoContent(record, todoId, content);
    replaceRecord(updated);
    persist();
  }

  /** 切换 todo 完成状态 */
  function toggle(todoId: string): void {
    const record = getTodayRecord();
    const updated = toggleTodo(record, todoId);
    replaceRecord(updated);
    persist();
  }

  /** 重新排序 */
  function reorder(draggedId: string, targetOrder: number): void {
    const record = getTodayRecord();
    const updated = reorderTodos(record, draggedId, targetOrder);
    replaceRecord(updated);
    persist();
  }

  /** 删除某天记录 */
  function deleteRecord(date: string): void {
    appData.value.records = appData.value.records.filter((r) => r.date !== date);
    persist();
  }

  /** 导出数据 */
  function exportData(): string {
    return exportStorage(appData.value);
  }

  /** 导入数据 */
  function importDataFrom(json: string): void {
    const imported = importStorage(json);
    appData.value = imported;
    persist();
  }

  /** 本周统计（computed 缓存） */
  const weeklyStats = computed(() => {
    return getWeeklyStats(appData.value.records);
  });

  /** 本月统计（computed 缓存） */
  const monthlyStats = computed(() => {
    const now = new Date();
    return getMonthlyStats(appData.value.records, now.getFullYear(), now.getMonth());
  });

  /** 获取指定月份统计 */
  function getMonthStats(year: number, month: number) {
    return getMonthlyStats(appData.value.records, year, month);
  }

  /** 检查是否为今日 */
  function checkAndRefreshToday(): void {
    const current = getTodayStr();
    if (current !== todayStr.value) {
      todayStr.value = current;
      ensureTodayRecord();
    }
  }

  // 替换 records 中的某条记录
  function replaceRecord(updated: DayRecord): void {
    const index = appData.value.records.findIndex((r) => r.date === updated.date);
    if (index !== -1) {
      appData.value.records[index] = updated;
    }
  }

  // 持久化到 localStorage
  function persist(): void {
    saveToStorage(appData.value);
  }

  return {
    appData,
    todayStr,
    records,
    weeklyStats,
    monthlyStats,
    ensureTodayRecord,
    getTodayRecord,
    updateContent,
    toggle,
    reorder,
    deleteRecord,
    exportData,
    importDataFrom,
    getMonthStats,
    checkAndRefreshToday,
  };
});
