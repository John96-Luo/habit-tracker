import type { AppData } from '../types/todo';
import { STORAGE_KEY, CURRENT_VERSION } from './constants';

/**
 * 从 localStorage 读取应用数据
 * 若不存在则初始化默认数据结构
 */
export function loadFromStorage(): AppData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return createDefaultData();
    }

    const parsed: AppData = JSON.parse(raw);

    // 版本迁移（预留）
    if (parsed.version < CURRENT_VERSION) {
      return migrateData(parsed);
    }

    return parsed;
  } catch {
    console.warn('Failed to read from localStorage, using default data');
    return createDefaultData();
  }
}

/** 将应用数据写入 localStorage */
export function saveToStorage(data: AppData): void {
  try {
    data.version = CURRENT_VERSION;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    console.error('Failed to write to localStorage:', e);
  }
}

/** 导出数据为 JSON 字符串 */
export function exportData(data: AppData): string {
  return JSON.stringify(data, null, 2);
}

/** 从 JSON 字符串导入数据 */
export function importData(json: string): AppData {
  const parsed = JSON.parse(json);
  if (!parsed.version || !Array.isArray(parsed.records)) {
    throw new Error('Invalid data format');
  }
  return parsed as AppData;
}

/** 创建默认数据结构 */
function createDefaultData(): AppData {
  return {
    version: CURRENT_VERSION,
    records: [],
  };
}

/** 数据版本迁移（当前版本为1，预留未来迁移逻辑） */
function migrateData(data: AppData): AppData {
  // 未来版本迁移逻辑在此处添加
  data.version = CURRENT_VERSION;
  return data;
}
