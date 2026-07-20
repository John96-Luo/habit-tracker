import type { DayRecord, WeeklyStats, MonthlyStats } from '../types/todo';
import { MAX_TODOS_PER_DAY } from '../utils/constants';
import { getWeekStart, getWeekEnd, getMonthStart, getMonthEnd, formatDate, getDaysInMonth } from '../utils/date';

/**
 * 统计计算组合式函数
 * 所有统计方法都是纯函数，输入 records + 日期 → 输出统计结果
 */
export function useStats() {
  /** 获取周统计 */
  function getWeeklyStats(records: DayRecord[], date: Date = new Date()): WeeklyStats {
    const weekStart = getWeekStart(date);
    const weekEnd = getWeekEnd(date);
    const daysInWeek = 7;

    const dailyDetail: { date: string; done: 0 | 1 | 2 | 3 }[] = [];
    let completed = 0;

    // 遍历本周每一天
    const start = new Date(weekStart);
    for (let i = 0; i < daysInWeek; i++) {
      const current = new Date(start);
      current.setDate(start.getDate() + i);
      const dateStr = formatDate(current);

      const record = records.find((r) => r.date === dateStr);
      const doneCount = record
        ? (record.todos.filter((t) => t.done).length as 0 | 1 | 2 | 3)
        : 0;

      completed += doneCount;
      dailyDetail.push({ date: dateStr, done: doneCount });
    }

    const total = MAX_TODOS_PER_DAY * daysInWeek; // 21

    return {
      weekStart,
      weekEnd,
      total: total as 21,
      completed,
      rate: total > 0 ? completed / total : 0,
      dailyDetail,
    };
  }

  /** 获取月统计 */
  function getMonthlyStats(records: DayRecord[], year: number, month: number): MonthlyStats {
    const monthStart = formatDate(new Date(year, month, 1));
    const daysInMonth = getDaysInMonth(year, month);
    const monthEnd = formatDate(new Date(year, month, daysInMonth));

    const dailyDetail: { date: string; done: 0 | 1 | 2 | 3 }[] = [];
    let completed = 0;

    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = formatDate(new Date(year, month, day));
      const record = records.find((r) => r.date === dateStr);
      const doneCount = record
        ? (record.todos.filter((t) => t.done).length as 0 | 1 | 2 | 3)
        : 0;

      completed += doneCount;
      dailyDetail.push({ date: dateStr, done: doneCount });
    }

    const total = MAX_TODOS_PER_DAY * daysInMonth;

    return {
      monthStart,
      monthEnd,
      daysInMonth,
      total,
      completed,
      rate: total > 0 ? completed / total : 0,
      dailyDetail,
    };
  }

  /** 获取某一天的完成详情 */
  function getDailyDetail(records: DayRecord[], date: string): DayRecord | undefined {
    return records.find((r) => r.date === date);
  }

  return {
    getWeeklyStats,
    getMonthlyStats,
    getDailyDetail,
  };
}
