import { watch } from 'vue';
import type { AppData } from '../types/todo';
import { loadFromStorage, saveToStorage, exportData, importData } from '../utils/storage';

/**
 * localStorage 持久化组合式函数
 * 封装 localStorage 读写，自动处理 JSON 序列化/反序列化
 * 数据变更时自动同步到 localStorage
 */
export function useStorage() {
  const data = loadFromStorage();

  // 监听数据变化，自动写入 localStorage
  watch(
    () => data,
    (newData) => {
      saveToStorage(newData as AppData);
    },
    { deep: true }
  );

  return {
    data,
    loadData: loadFromStorage,
    saveData: () => saveToStorage(data),
    exportData: () => exportData(data),
    importData: (json: string) => {
      const imported = importData(json);
      Object.assign(data, imported);
    },
  };
}
