# AI Hook Lab — 产品与技术设计文档

> 日期：2026-05-17  
> 状态：已确认，待实现

---

## 一、产品概述

AI Hook Lab 是一个 AI 爆款文案开头生成工具。用户输入主题、选择平台和内容类型，AI 一次性生成 10 个不同风格的 Hook 文案，每条附带风格标签、点击欲评分和推荐理由。支持复制、收藏、历史记录回看。

- **目标用户**：内容创作者、自媒体运营、短视频博主
- **不做登录，不做数据库**，纯前端 + API Route 架构，可部署至 Vercel
- **核心价值**：帮助创作者快速找到爆款开头的灵感方向

---

## 二、技术栈

| 层级 | 选型 |
|------|------|
| 框架 | Next.js 15 (App Router) |
| 语言 | TypeScript |
| 样式 | Tailwind CSS |
| AI 调用 | OpenAI SDK（兼容模式，对应用户自定义 Base URL） |
| 运行时 | Vercel (Edge 或 Serverless) |
| 持久化 | localStorage（收藏 + 历史） + sessionStorage（设置） |

---

## 三、页面结构（单页应用）

```
app/page.tsx
├── Header（Logo + 设置按钮）
├── InputPanel（主题输入 + 平台选择 + 内容类型 + 风格多选 + 生成按钮）
├── MainContent（flex row）
│   ├── Sidebar（收藏面板 + 历史面板，桌面竖列，移动端顶部 Tab）
│   └── ResultsGrid（2 列 × 5 行，移动端单列）
│       └── HookCard × 10
└── SettingsModal（厂商选择 + Base URL + 模型名 + API Key）
└── Toast（全局轻提示）
```

---

## 四、视觉设计

- **风格方向**：暗黑科技风
  - 背景色：`#0a0a0f`
  - 卡片色：`#14141f`
  - 主色调：紫到青渐变 `#a855f7 → #06b6d4`
  - 边框：带透明度的微光边框
  - 按钮：渐变发光效果
- **响应式**：桌面端侧边栏 + 两栏网格；移动端 Tab + 单列滚动
- **Hook 卡片布局（方案 B）**：左侧大号渐变色评分 + 右侧文案/标签/理由 + 底部操作按钮

### 交互反馈

- 生成按钮：加载态 → 渐变呼吸动画 + 骨架屏卡片
- 卡片入场：stagger 动画，依次淡入
- 复制/收藏：Toast 轻提示
- 输入验证：空值时输入框红色抖动

---

## 五、平台与内容类型

### 平台（5 个，单选）

小红书 | 抖音 | B站 | YouTube | X

### 内容类型（5 个，单选）

视频 | 图文 | 产品广告 | 教程 | 观点帖

### 风格池（12 种，多选，默认全选）

| # | 风格 | 说明 |
|---|------|------|
| 1 | 悬念提问 | 用问题制造好奇心缺口 |
| 2 | 反常识 | 颠覆认知，制造冲突感 |
| 3 | 痛点直击 | 直接戳中用户焦虑/困境 |
| 4 | 数字清单 | "3 个方法""5 个真相"结构化承诺 |
| 5 | 情感共鸣 | 共情用户处境 |
| 6 | 对比冲击 | 前后/优劣对比制造张力 |
| 7 | 身份标签 | 人群定向，制造归属感 |
| 8 | 结果承诺 | 暗示看完能获得的具体收益 |
| 9 | 好奇缺口 | 故意留信息差 |
| 10 | 社交货币 | 转发有面子/有用 |
| 11 | 故事钩子 | 真实/虚构故事片段开头 |
| 12 | 争议挑逗 | 引发讨论和站队 |

**分配逻辑**：用户勾选 N 种风格，后端按比例分配凑满 10 条（如 3 种 → [4, 3, 3]）。

---

## 六、API 设计

### 端点

`POST /api/generate`

### 请求体

```typescript
{
  topic: string;
  platform: string;
  contentType: string;
  styles: string[];
  apiKey: string;      // 用户自己的 Key，不落盘
  baseUrl: string;     // 厂商兼容接口
  model: string;       // 模型名称
}
```

### 返回体

```typescript
{
  hooks: {
    content: string;     // Hook 文案
    style: string;       // 风格标签
    score: number;       // 点击欲评分 (0.0 - 10.0)
    reason: string;      // 推荐理由
  }[];
  generatedAt: string;   // ISO 时间戳
}
```

### 安全原则

- API Key 在 sessionStorage 保存，请求时由前端携带
- 后端用后即焚，不写日志不落盘
- 不使用 process.env 处理用户 Key

### Prompt 策略

- System Prompt：定义角色 + 严格 JSON 输出格式
- User Prompt：注入 topic / platform / contentType / styleAllocation
- JSON 解析兜底：剥离 markdown 包裹符，处理末尾逗号等常见异常

---

## 七、状态管理

| 数据 | 存储 | 说明 |
|------|------|------|
| 用户设置（API Key 等） | sessionStorage | 关标签页即清 |
| 收藏列表 | localStorage | 持久保留 |
| 历史记录 | localStorage | 保留最近 50 批次 |

### localStorage Key

- `ai-hook-lab-favorites`：`HookItem[]`
- `ai-hook-lab-history`：`{ id, topic, platform, contentType, hooks[], generatedAt }[]`

### 收藏去重

同文案内容去重，再点取消收藏。

---

## 八、错误处理矩阵

| 场景 | 处理 |
|------|------|
| 未配置 API Key | 弹出设置面板，红色提示，聚焦输入框 |
| API Key 无效 (401/403) | 错误卡片："API Key 无效，请检查" + 打开设置按钮 |
| 网络错误 | "网络连接失败，请检查网络" |
| 模型限流/不可用 (429/503) | "服务繁忙，请稍后重试" + 建议切换厂商 |
| AI 返回格式异常 | JSON fallback 解析 → 失败则显示原始文本 |
| 主题为空 | 输入框红色边框 + 抖动 + 提示 |
| 返回数量不对 | 前端校验后提示"生成结果数量不符预期" |
| localStorage 异常 | try-catch 包裹所有读写，静默降级 |

---

## 九、不在范围（v1 不做）

- 用户登录 / 注册
- 数据库 / 后端存储
- 多语言 / i18n
- Hook 卡片展开详情页（现有内联展示已足够）
- 分享功能
- 付费/订阅

---

## 十、组件清单

| 组件 | 文件路径 | 职责 |
|------|---------|------|
| Page | `app/page.tsx` | 主页面，组合所有子组件 |
| Header | `components/Header.tsx` | Logo + 设置入口 |
| InputPanel | `components/InputPanel.tsx` | 输入区容器 |
| TopicInput | `components/TopicInput.tsx` | 主题文本框 |
| PlatformSelector | `components/PlatformSelector.tsx` | 平台 pill 单选 |
| ContentTypeSelector | `components/ContentTypeSelector.tsx` | 内容类型 pill 单选 |
| StyleSelector | `components/StyleSelector.tsx` | 风格 chip 多选 |
| ResultsGrid | `components/ResultsGrid.tsx` | 2 列网格容器 |
| HookCard | `components/HookCard.tsx` | 单张结果卡片 |
| Sidebar | `components/Sidebar.tsx` | 收藏 + 历史侧边栏 |
| FavoritesPanel | `components/FavoritesPanel.tsx` | 收藏列表 |
| HistoryPanel | `components/HistoryPanel.tsx` | 历史记录列表 |
| SettingsModal | `components/SettingsModal.tsx` | API 配置弹窗 |
| Toast | `components/Toast.tsx` | 全局轻提示 |
| useHookLab | `hooks/useHookLab.ts` | 核心状态管理 Hook |
