# 每日三件事 · 技术架构文档 (TECH ARCH)

> 版本：v1.0 | 日期：2026-07-20 | 对应代码：Phase 1 MVP

---

## 1. 技术栈

| 类别 | 技术 | 版本 | 选型理由 |
|------|------|------|----------|
| 框架 | Vue 3（组合式 API） | ^3.5 | 轻量、响应式、适合单页应用 |
| 语言 | TypeScript | ~6.0 | 类型安全，strict 模式 |
| 构建工具 | Vite | ^8.1 | 极速冷启动（~798ms）和 HMR |
| 样式引擎 | UnoCSS | ^66.7 | 按需生成原子 CSS，比 Tailwind 更轻 |
| 状态管理 | Pinia | ^4.0 | Vue 3 官方推荐，组合式 API 风格 |
| 路由 | Vue Router 4 | ^4.6 | Hash 模式（兼容静态部署） |
| 数据存储 | localStorage（原生） | — | 零依赖，JSON 序列化 |
| 包管理器 | pnpm | ^11 | 快速、节省磁盘空间 |

### 明确不引入的依赖

- ❌ **日期库**（date-fns/dayjs）→ 原生 `Date` 封装
- ❌ **UI 组件库**（Element/Vuetify/NaiveUI）→ 全部手写 Scoped CSS
- ❌ **拖拽库**（SortableJS/vuedraggable）→ HTML5 Drag & Drop API
- ❌ **图表库**（ECharts/Chart.js）→ 纯 CSS Grid 热力图
- ❌ **HTTP 库**（Axios）→ 无网络请求需求

---

## 2. 项目结构

```
habit-tracker/
├── documents/
│   ├── PRD.md                  # 产品需求文档
│   └── TECH_ARCH.md            # 技术架构文档（本文件）
├── public/
│   └── favicon.svg
├── src/
│   ├── types/
│   │   └── todo.ts             # TodoItem, DayRecord, AppData, WeeklyStats, MonthlyStats
│   ├── utils/
│   │   ├── constants.ts        # MAX_TODOS_PER_DAY(3), DEBOUNCE_DELAY(300ms), STORAGE_KEY
│   │   ├── date.ts             # formatDate, getWeekStart, getMonthGrid 等原生日期工具
│   │   └── storage.ts          # loadFromStorage, saveToStorage, exportData, importData
│   ├── composables/
│   │   ├── useStorage.ts       # localStorage 读写 + watch 自动持久化
│   │   ├── useTodos.ts         # 三件事纯函数（增删改查、排序）
│   │   └── useStats.ts         # 周/月统计纯函数（输入 records → 输出 stats）
│   ├── stores/
│   │   └── todoStore.ts        # Pinia Store：全局状态 + 动作 + computed 统计缓存
│   ├── router/
│   │   └── index.ts            # Hash 路由：/  /history  /stats
│   ├── pages/
│   │   ├── Today.vue           # 今日页（输入+勾选+拖拽+周进度条）
│   │   ├── History.vue         # 历史页（日期倒序卡片列表）
│   │   └── Stats.vue           # 统计页（周进度 + 月热力图 + 月度汇总）
│   ├── components/             # 预留目录（Phase 1 未拆分独立组件）
│   ├── App.vue                 # 根组件（flex 布局 + 底部 Tab 导航）
│   ├── main.ts                 # 入口（注册 Pinia / Router / UnoCSS）
│   └── style.css               # 全局 CSS Reset
├── index.html                  # SPA 入口（lang=zh-CN, theme-color=#4caf50）
├── package.json
├── vite.config.ts              # Vite + Vue Plugin + UnoCSS Plugin
├── uno.config.ts               # UnoCSS 配置（presetUno + presetAttributify）
├── tsconfig.json               # TypeScript 项目引用
├── tsconfig.app.json           # 应用 TS 配置（extends @vue/tsconfig, strict）
└── tsconfig.node.json          # Vite 配置文件 TS 配置
```

---

## 3. 架构层次

```
┌─────────────────────────────────────────┐
│               Pages (视图层)              │
│   Today.vue  /  History.vue  /  Stats.vue │
│   - 组合组件 + store 交互                 │
│   - Scoped CSS 本地样式                   │
└─────────────────┬───────────────────────┘
                  │ useStore()
┌─────────────────▼───────────────────────┐
│           Store (状态管理层)              │
│   todoStore.ts (Pinia)                   │
│   - state: appData, todayStr             │
│   - getters: records, weeklyStats,       │
│              monthlyStats (computed)     │
│   - actions: CRUD + export/import        │
│   → 每次 action 后立即 persist()         │
└─────────────────┬───────────────────────┘
                  │ 调用纯函数
┌─────────────────▼───────────────────────┐
│        Composables (逻辑层/纯函数)        │
│   useTodos.ts   → Todo 增删改查           │
│   useStats.ts   → 周/月统计计算            │
│   useStorage.ts → localStorage 持久化     │
└─────────────────┬───────────────────────┘
                  │
┌─────────────────▼───────────────────────┐
│           Utils (工具层)                  │
│   date.ts      → 原生 Date 封装           │
│   storage.ts   → localStorage CRUD       │
│   constants.ts → 全局常量                 │
└─────────────────┬───────────────────────┘
                  │
┌─────────────────▼───────────────────────┐
│         Types (类型定义层)                │
│   todo.ts      → 全部 TS 接口定义          │
└─────────────────────────────────────────┘
```

### 数据流

```
用户操作 → Page 调用 Store Action
                    ↓
              composable 纯函数处理
                    ↓
              appData 响应式更新
                    ↓
              persist() → localStorage
                    ↓
              computed stats 自动重算
                    ↓
              Vue 模板自动重渲染
```

---

## 4. 数据模型

### 4.1 TypeScript 类型定义

```typescript
// types/todo.ts

interface TodoItem {
  id: string;            // crypto.randomUUID()
  content: string;       // 可为空字符串
  done: boolean;
  order: 0 | 1 | 2;     // 固定三项
}

interface DayRecord {
  date: string;          // "YYYY-MM-DD"
  todos: [TodoItem, TodoItem, TodoItem];  // 固定长度3元组
}

interface AppData {
  version: number;       // 当前为 1
  records: DayRecord[];  // 日期倒序
}

interface WeeklyStats {
  weekStart: string;
  weekEnd: string;
  total: 21;             // 3 × 7 = 21 固定
  completed: number;
  rate: number;
  dailyDetail: { date: string; done: 0|1|2|3 }[];
}

interface MonthlyStats {
  monthStart: string;
  monthEnd: string;
  daysInMonth: number;
  total: number;
  completed: number;
  rate: number;
  dailyDetail: { date: string; done: 0|1|2|3 }[];
}
```

### 4.2 localStorage 存储结构

- **键**：`habit-tracker-data`
- **值**：JSON 序列化的 `AppData`

```json
{
  "version": 1,
  "records": [
    {
      "date": "2026-07-20",
      "todos": [
        { "id": "uuid-1", "content": "完成项目报告", "done": true, "order": 0 },
        { "id": "uuid-2", "content": "运动30分钟", "done": false, "order": 1 },
        { "id": "uuid-3", "content": "", "done": false, "order": 2 }
      ]
    }
  ]
}
```

---

## 5. 核心实现

### 5.1 数据持久化（双写策略）

每次 Store action 执行后**立即**调用 `persist()` 写入 localStorage，确保数据不丢失。

```typescript
// stores/todoStore.ts
function updateContent(todoId: string, content: string): void {
  const record = getTodayRecord();
  const updated = updateTodoContent(record, todoId, content);
  replaceRecord(updated);
  persist();  // ← 每次操作立即持久化
}
```

**初始化流程**：
1. 应用启动 → Pinia Store 创建 → `loadFromStorage()`
2. 若 localStorage 无数据 → 返回 `{ version: 1, records: [] }`
3. 若存在但版本号低于当前 → `migrateData()` 执行迁移

### 5.2 输入防抖（300ms）

```typescript
// pages/Today.vue
function onInput(todoId: string, event: Event): void {
  if (debounceTimer) clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => {
    store.updateContent(todoId, value);
  }, DEBOUNCE_DELAY);  // 300ms
}

function onBlur(todoId: string, event: Event): void {
  if (debounceTimer) clearTimeout(debounceTimer);
  store.updateContent(todoId, value);  // ← 失焦立即保存
}
```

### 5.3 拖拽排序（HTML5 Drag & Drop）

```typescript
// pages/Today.vue — 模板中绑定原生事件
@dragstart="onDragStart(todo.id, $event)"
@dragover="onDragOver"
@drop="onDrop(index)"
@dragend="onDragEnd"
```

拖拽完成后，交换两个 TodoItem 的 `order` 字段并重新排序数组，一次性持久化。

### 5.4 统计计算（computed 缓存）

周/月统计不持久化，通过 Pinia 的 `computed` 实时计算，Vue 自动缓存。

```typescript
// stores/todoStore.ts
const weeklyStats = computed(() => {
  return getWeeklyStats(appData.value.records);
});
```

`getWeeklyStats()` 是纯函数：输入 `records[] + Date` → 输出 `WeeklyStats`，复杂度 O(n)。

### 5.5 日历热力图

`getMonthGrid(year, month)` 函数生成二维数组 `(number | null)[][]`，每行 7 列（周一至周日）。

```css
/* 4级颜色映射 */
.cell-empty { background: #f0f0f0; }  /* 0/3 */
.cell-low   { background: #c8e6c9; }  /* 1/3 */
.cell-mid   { background: #66bb6a; }  /* 2/3 */
.cell-high  { background: #2e7d32; }  /* 3/3 */
.cell-today { box-shadow: 0 0 0 2px #1a1a2e; }
```

### 5.6 跨午夜处理

```typescript
// stores/todoStore.ts
function checkAndRefreshToday(): void {
  const current = getTodayStr();
  if (current !== todayStr.value) {
    todayStr.value = current;
    ensureTodayRecord();  // 自动创建新一天的空记录
  }
}
```

`Today.vue` 的 `onMounted` 中调用此方法。

### 5.7 路由设计

| 路径 | 名称 | 组件 | 说明 |
|------|------|------|------|
| `/#/` | today | Today.vue | 今日三件事（默认首页） |
| `/#/history` | history | History.vue | 历史记录列表 |
| `/#/stats` | stats | Stats.vue | 统计页面 |

使用 `createWebHashHistory()`，兼容静态托管平台（Vercel / Cloudflare Pages）。

---

## 6. 页面组件关系

```
App.vue
├── <router-view>           → 路由出口
│   ├── Today.vue           → 使用 todoStore
│   │   ├── 内联 TodoItem   → 输入框 + 勾选框 + 拖拽手柄
│   │   └── 内联 WeeklyProgress → 进度条
│   ├── History.vue         → 使用 todoStore.records
│   │   └── 内联历史卡片     → 日期 + 三件事列表 + 删除
│   └── Stats.vue           → 使用 todoStore (weeklyStats, getMonthStats)
│       ├── 内联周统计卡片
│       └── 内联月热力图     → 基于 getMonthGrid() + dailyDetail
└── <nav class="tab-bar">   → 底部 Tab 导航（今日 | 历史 | 统计）
```

---

## 7. 路由配置

使用 `createWebHashHistory()`（Hash 模式），适配 Vercel/Cloudflare Pages 等静态托管平台的 SPA 路由。

| 路径 | 名称 | 组件（懒加载） |
|------|------|---------------|
| `/#/` | today | `() => import('../pages/Today.vue')` |
| `/#/history` | history | `() => import('../pages/History.vue')` |
| `/#/stats` | stats | `() => import('../pages/Stats.vue')` |

---

## 8. 配置说明

### 8.1 Vite 配置

```typescript
// vite.config.ts
export default defineConfig({
  plugins: [vue(), UnoCSS()],
});
```

插件链：Vue SFC 编译 → UnoCSS 按需生成 CSS。

### 8.2 UnoCSS 配置

```typescript
// uno.config.ts
export default defineConfig({
  presets: [presetUno(), presetAttributify()],
  shortcuts: {
    'page': 'max-w-480px mx-auto px-4 pt-6 pb-24 min-h-screen',
  },
});
```

当前以 Scoped CSS 为主，UnoCSS 提供基础原子类作为补充。

### 8.3 TypeScript 严格模式

```json
{
  "strict": true,
  "noUnusedLocals": true,
  "noUnusedParameters": true,
  "noFallthroughCasesInSwitch": true
}
```

### 8.4 HTML Meta

```html
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
<meta name="theme-color" content="#4caf50" />
```

禁用用户缩放（防止移动端输入时意外缩放），绿色主题色。

---

## 9. 构建 & 部署

### 开发

```bash
pnpm install          # 安装依赖
pnpm dev              # 启动开发服务器 → http://localhost:5173
```

### 生产构建

```bash
pnpm build            # vue-tsc 类型检查 + vite build → dist/
pnpm preview          # 本地预览生产构建
```

### 部署目标

| 平台 | 配置要求 |
|------|----------|
| Vercel | 自动检测 Vite，无需额外配置 |
| Cloudflare Pages | 构建命令 `pnpm build`，输出 `dist/` |

输出为纯静态文件（HTML + CSS + JS），无服务端依赖。

---

## 10. 版本迁移机制

`storage.ts` 中预留了数据迁移框架：

```typescript
function migrateData(data: AppData): AppData {
  // 未来版本迁移逻辑在此添加
  // 例：if (data.version === 1) { data.records = transform(data.records); }
  data.version = CURRENT_VERSION;
  return data;
}
```

- `loadFromStorage()` 读取时自动检测 `version` 字段
- 版本低于当前时自动执行迁移
- 迁移函数保持幂等性，确保数据不丢失

---

## 11. 代码规范

| 规范 | 示例 |
|------|------|
| 组件文件 | `PascalCase.vue` → `Today.vue` |
| 组合式函数 | `useCamelCase.ts` → `useTodos.ts` |
| 工具函数 | `camelCase.ts` → `date.ts` |
| 类型接口 | PascalCase → `TodoItem`, `DayRecord` |
| 常量 | `UPPER_SNAKE_CASE` → `MAX_TODOS_PER_DAY` |
| 缩进 | 2 空格 |
| 引号 | 单引号 |
| 分号 | 始终使用 |
| 组件写法 | `<script setup lang="ts">` 语法糖 |


## 12. 依赖清单

### 运行时依赖

| 包名 | 版本 | 用途 |
|------|------|------|
| `vue` | ^3.5.39 | 前端框架 |
| `vue-router` | ^4.6.4 | SPA 路由 |
| `pinia` | ^4.0.2 | 全局状态管理 |

### 开发依赖

| 包名 | 版本 | 用途 |
|------|------|------|
| `vite` | ^8.1.1 | 构建工具 |
| `@vitejs/plugin-vue` | ^6.0.7 | Vue SFC 编译 |
| `typescript` | ~6.0.2 | 类型检查 |
| `vue-tsc` | ^3.3.5 | Vue + TS 类型检查 |
| `unocss` | ^66.7.5 | 原子 CSS 引擎 |
| `@unocss/preset-uno` | ^66.7.5 | UnoCSS 默认预设 |
| `@unocss/preset-attributify` | ^66.7.5 | 属性化模式预设 |
| `@vue/tsconfig` | ^0.9.1 | Vue TS 配置基础 |
| `@types/node` | ^24.13.2 | Node.js 类型定义 |
