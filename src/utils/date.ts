/**
 * 日期工具函数（全部使用原生 Date 实现，零第三方依赖）
 */

/** 将 Date 对象格式化为 "YYYY-MM-DD" 字符串 */
export function formatDate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/** 获取今天的日期字符串 */
export function getTodayStr(): string {
  return formatDate(new Date());
}

/** 获取本周一的日期字符串（周一为一周起始） */
export function getWeekStart(date: Date = new Date()): string {
  const d = new Date(date);
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day; // 周日视为上周最后一天
  d.setDate(d.getDate() + diff);
  return formatDate(d);
}

/** 获取本周日的日期字符串 */
export function getWeekEnd(date: Date = new Date()): string {
  const d = new Date(date);
  const day = d.getDay();
  const diff = day === 0 ? 0 : 7 - day;
  d.setDate(d.getDate() + diff);
  return formatDate(d);
}

/** 获取本月第一天的日期字符串 */
export function getMonthStart(date: Date = new Date()): string {
  const d = new Date(date.getFullYear(), date.getMonth(), 1);
  return formatDate(d);
}

/** 获取本月最后一天的日期字符串 */
export function getMonthEnd(date: Date = new Date()): string {
  const d = new Date(date.getFullYear(), date.getMonth() + 1, 0);
  return formatDate(d);
}

/** 解析 "YYYY-MM-DD" 字符串为 Date 对象 */
export function parseDate(dateStr: string): Date {
  const [y, m, d] = dateStr.split('-').map(Number);
  return new Date(y, m - 1, d);
}

/** 判断两个日期字符串是否是同一天 */
export function isSameDay(a: string, b: string): boolean {
  return a === b;
}

/** 判断是否在今天之前 */
export function isBeforeToday(dateStr: string): boolean {
  return dateStr < getTodayStr();
}

/** 获取一个月的天数 */
export function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

/** 获取某月第一天是星期几（0=周日, 1=周一, ..., 6=周六） */
export function getFirstDayOfMonth(year: number, month: number): number {
  return new Date(year, month, 1).getDay();
}

/**
 * 生成指定月份的日历网格数据
 * 返回一个二维数组，每行7天，包含填充空白
 */
export function getMonthGrid(year: number, month: number): (number | null)[][] {
  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);
  // 将周日(0)转换为6，周一(1)转换为0
  const startOffset = firstDay === 0 ? 6 : firstDay - 1;

  const grid: (number | null)[][] = [];
  let currentRow: (number | null)[] = [];

  // 填充前面的空白
  for (let i = 0; i < startOffset; i++) {
    currentRow.push(null);
  }

  for (let day = 1; day <= daysInMonth; day++) {
    currentRow.push(day);
    if (currentRow.length === 7) {
      grid.push(currentRow);
      currentRow = [];
    }
  }

  // 填充末尾空白
  if (currentRow.length > 0) {
    while (currentRow.length < 7) {
      currentRow.push(null);
    }
    grid.push(currentRow);
  }

  return grid;
}
