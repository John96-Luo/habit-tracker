import type { TodoItem, DayRecord } from '../types/todo';
import { MAX_TODOS_PER_DAY } from '../utils/constants';

/**
 * 创建三个默认的空 TodoItem
 */
function createEmptyTodos(): [TodoItem, TodoItem, TodoItem] {
  return [0, 1, 2].map((order) => ({
    id: crypto.randomUUID(),
    content: '',
    done: false,
    order: order as 0 | 1 | 2,
  })) as [TodoItem, TodoItem, TodoItem];
}

/**
 * 三件事数据操作组合式函数
 * 提供增删改查的纯函数（无副作用，不依赖 store）
 */
export function useTodos() {
  /** 根据日期获取当天的 DayRecord，不存在则创建 */
  function getOrCreateDayRecord(records: DayRecord[], date: string): { record: DayRecord; isNew: boolean } {
    const existing = records.find((r) => r.date === date);
    if (existing) {
      return { record: existing, isNew: false };
    }
    const newRecord: DayRecord = {
      date,
      todos: createEmptyTodos(),
    };
    return { record: newRecord, isNew: true };
  }

  /** 更新某个 todo 的内容 */
  function updateTodoContent(record: DayRecord, todoId: string, content: string): DayRecord {
    return {
      ...record,
      todos: record.todos.map((t) =>
        t.id === todoId ? { ...t, content } : t
      ) as DayRecord['todos'],
    };
  }

  /** 切换某个 todo 的完成状态 */
  function toggleTodo(record: DayRecord, todoId: string): DayRecord {
    return {
      ...record,
      todos: record.todos.map((t) =>
        t.id === todoId ? { ...t, done: !t.done } : t
      ) as DayRecord['todos'],
    };
  }

  /** 重新排序 todos（拖拽后调用） */
  function reorderTodos(record: DayRecord, draggedId: string, targetOrder: number): DayRecord {
    const todos = [...record.todos];
    const draggedIndex = todos.findIndex((t) => t.id === draggedId);
    if (draggedIndex === -1) return record;

    const draggedItem = { ...todos[draggedIndex], order: targetOrder as 0 | 1 | 2 };
    const targetItem = { ...todos[targetOrder], order: todos[draggedIndex].order };

    todos[draggedIndex] = targetItem;
    todos[targetOrder] = draggedItem;

    // 按 order 排序
    todos.sort((a, b) => a.order - b.order);

    return { ...record, todos: todos as DayRecord['todos'] };
  }

  /** 获取今天的 todos（按 order 排序） */
  function getTodayTodos(records: DayRecord[], date: string): DayRecord {
    const { record } = getOrCreateDayRecord(records, date);
    return record;
  }

  return {
    createEmptyTodos,
    getOrCreateDayRecord,
    updateTodoContent,
    toggleTodo,
    reorderTodos,
    getTodayTodos,
  };
}
