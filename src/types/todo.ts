/** 单件事项 */
export interface TodoItem {
  id: string;            // 使用 crypto.randomUUID()
  content: string;       // 用户输入的文字，可为空字符串（代表未填写）
  done: boolean;         // 是否勾选完成
  order: 0 | 1 | 2;     // 固定3件，order 0/1/2
}

/** 某一天的全部记录（每天固定3件） */
export interface DayRecord {
  date: string;          // 格式 "YYYY-MM-DD"
  todos: [TodoItem, TodoItem, TodoItem];  // 固定长度3的元组
}

/** 全局存储结构（localStorage 只存这一个键） */
export interface AppData {
  version: number;       // 当前为 1
  records: DayRecord[];  // 按日期倒序（最新在前），便于列表展示
}

/** 周统计结果（计算得出） */
export interface WeeklyStats {
  weekStart: string;     // "YYYY-MM-DD"
  weekEnd: string;
  total: 21;             // 固定 3*7
  completed: number;     // 0~21
  rate: number;          // 0~1
  dailyDetail: { date: string; done: 0 | 1 | 2 | 3 }[];
}

/** 月统计结果 */
export interface MonthlyStats {
  monthStart: string;
  monthEnd: string;
  daysInMonth: number;
  total: number;
  completed: number;
  rate: number;
  dailyDetail: { date: string; done: 0 | 1 | 2 | 3 }[];
}
