# AI Hook Lab 实现计划

> **面向执行 Agent：** 必需子技能：使用 superpowers:subagent-driven-development（推荐）或 superpowers:executing-plans 逐任务执行。步骤使用 checkbox（`- [ ]`）语法追踪。

**目标：** 从空目录开始，构建完整的 AI Hook Lab 单页应用——用户输入主题、选择平台/内容类型/风格，一键生成 10 个不同风格的爆款 Hook 文案。

**架构：** Next.js 15 App Router 单页应用，一个 API Route 代理大模型调用，前端用自定义 Hook 集中管理状态，localStorage/sessionStorage 做客户端持久化，Tailwind CSS 暗黑科技风。

**技术栈：** Next.js 15 + TypeScript + Tailwind CSS + OpenAI SDK

**文件结构（最终产物）：**
```
AI Hook Lab/
├── app/
│   ├── layout.tsx
│   ├── page.tsx
│   ├── globals.css
│   └── api/generate/
│       └── route.ts
├── components/
│   ├── Header.tsx
│   ├── SettingsModal.tsx
│   ├── InputPanel.tsx
│   ├── TopicInput.tsx
│   ├── PlatformSelector.tsx
│   ├── ContentTypeSelector.tsx
│   ├── StyleSelector.tsx
│   ├── ResultsGrid.tsx
│   ├── HookCard.tsx
│   ├── Sidebar.tsx
│   ├── FavoritesPanel.tsx
│   ├── HistoryPanel.tsx
│   └── Toast.tsx
├── hooks/
│   └── useHookLab.ts
├── lib/
│   ├── types.ts
│   ├── constants.ts
│   └── storage.ts
├── .env.local
├── next.config.ts
├── tailwind.config.ts
└── package.json
```

---

### Task 1: 项目初始化

**文件：**
- 创建：所有脚手架文件（通过 create-next-app）
- 创建：`.env.local`

- [ ] **Step 1: 使用 create-next-app 初始化项目**

```bash
cd "c:\Users\10295\Desktop\Code Collection\AI Hook Lab"
npx create-next-app@latest . --typescript --tailwind --eslint --app --no-src-dir --import-alias="@/*" --turbopack
```

- [ ] **Step 2: 安装 OpenAI SDK**

```bash
npm install openai
```

- [ ] **Step 3: 创建 .env.local 模板**

```bash
# 用户自行填入 API Key（此文件不提交）
# 如果不部署到 Vercel，也可以本地开发使用
# OPENAI_API_KEY=sk-your-key-here
```

注意：`.env.local` 仅存放开发者本地调试用的 Key。用户的密钥通过前端设置面板输入，存在 sessionStorage 中，每次请求由前端传给 API Route。

- [ ] **Step 4: 验证项目能启动**

```bash
npm run dev
```

预期：`http://localhost:3000` 显示 Next.js 默认页面。

---

### Task 2: 类型定义与常量

**文件：**
- 创建：`lib/types.ts`
- 创建：`lib/constants.ts`

- [ ] **Step 1: 编写类型定义**

```typescript
// lib/types.ts

/** 单条 Hook 结果 */
export interface HookItem {
  id: string;
  content: string;   // Hook 文案
  style: string;      // 风格标签
  score: number;      // 点击欲评分 0.0-10.0
  reason: string;     // 推荐理由
}

/** 一次生成的历史记录 */
export interface HistoryGroup {
  id: string;
  topic: string;
  platform: string;
  contentType: string;
  selectedStyles: string[];
  hooks: HookItem[];
  generatedAt: string; // ISO 时间戳
}

/** 用户设置 */
export interface AppSettings {
  apiKey: string;
  baseUrl: string;
  model: string;
}

/** API 请求 */
export interface GenerateRequest {
  topic: string;
  platform: string;
  contentType: string;
  styles: string[];
  apiKey: string;
  baseUrl: string;
  model: string;
}

/** API 响应 */
export interface GenerateResponse {
  hooks: HookItem[];
  generatedAt: string;
}

/** Toast 消息类型 */
export type ToastType = 'success' | 'error' | 'info';

/** Toast 消息 */
export interface ToastMessage {
  id: number;
  text: string;
  type: ToastType;
}
```

- [ ] **Step 2: 编写常量定义**

```typescript
// lib/constants.ts

export const PLATFORMS = [
  { key: 'xiaohongshu', label: '小红书' },
  { key: 'douyin', label: '抖音' },
  { key: 'bilibili', label: 'B站' },
  { key: 'youtube', label: 'YouTube' },
  { key: 'x', label: 'X' },
] as const;

export const CONTENT_TYPES = [
  { key: 'video', label: '视频' },
  { key: 'image-text', label: '图文' },
  { key: 'product-ad', label: '产品广告' },
  { key: 'tutorial', label: '教程' },
  { key: 'opinion', label: '观点帖' },
] as const;

export const STYLE_POOL = [
  { key: 'suspense-question', label: '悬念提问', desc: '用问题制造好奇心缺口' },
  { key: 'counter-intuitive', label: '反常识', desc: '颠覆认知，制造冲突感' },
  { key: 'pain-point', label: '痛点直击', desc: '直接戳中用户焦虑/困境' },
  { key: 'numbered-list', label: '数字清单', desc: '"3个方法""5个真相"结构化承诺' },
  { key: 'empathy', label: '情感共鸣', desc: '共情用户处境' },
  { key: 'contrast', label: '对比冲击', desc: '前后/优劣对比制造张力' },
  { key: 'identity-label', label: '身份标签', desc: '人群定向，制造归属感' },
  { key: 'result-promise', label: '结果承诺', desc: '暗示看完能获得的具体收益' },
  { key: 'curiosity-gap', label: '好奇缺口', desc: '故意留信息差' },
  { key: 'social-currency', label: '社交货币', desc: '转发有面子/有用' },
  { key: 'story-hook', label: '故事钩子', desc: '真实/虚构故事片段开头' },
  { key: 'controversy', label: '争议挑逗', desc: '引发讨论和站队' },
] as const;

export const STORAGE_KEYS = {
  SETTINGS: 'ai-hook-lab-settings',
  FAVORITES: 'ai-hook-lab-favorites',
  HISTORY: 'ai-hook-lab-history',
} as const;

export const DEFAULT_SETTINGS = {
  apiKey: '',
  baseUrl: 'https://api.deepseek.com/v1',
  model: 'deepseek-chat',
} as const;

export const PRESET_PROVIDERS = [
  { label: 'DeepSeek', baseUrl: 'https://api.deepseek.com/v1', model: 'deepseek-chat' },
  { label: '智谱清言', baseUrl: 'https://open.bigmodel.cn/api/paas/v4', model: 'glm-4-flash' },
  { label: '通义千问', baseUrl: 'https://dashscope.aliyuncs.com/compatible-mode/v1', model: 'qwen-plus' },
  { label: 'OpenAI', baseUrl: 'https://api.openai.com/v1', model: 'gpt-4o' },
  { label: '自定义', baseUrl: '', model: '' },
] as const;
```

---

### Task 3: 本地存储工具

**文件：**
- 创建：`lib/storage.ts`

- [ ] **Step 1: 编写存储工具函数**

```typescript
// lib/storage.ts

import { AppSettings, HookItem, HistoryGroup } from './types';
import { STORAGE_KEYS, DEFAULT_SETTINGS } from './constants';

function safeGet<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function safeSet(key: string, value: unknown): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // 配额满或隐私模式，静默降级
  }
}

// ---- 设置（sessionStorage） ----

export function getSettings(): AppSettings {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEYS.SETTINGS);
    if (!raw) return { ...DEFAULT_SETTINGS };
    return JSON.parse(raw) as AppSettings;
  } catch {
    return { ...DEFAULT_SETTINGS };
  }
}

export function saveSettings(settings: AppSettings): void {
  try {
    sessionStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  } catch {
    // 静默降级
  }
}

// ---- 收藏（localStorage） ----

export function getFavorites(): HookItem[] {
  return safeGet<HookItem[]>(STORAGE_KEYS.FAVORITES, []);
}

export function saveFavorites(favorites: HookItem[]): void {
  safeSet(STORAGE_KEYS.FAVORITES, favorites);
}

export function isFavorite(content: string): boolean {
  const favorites = getFavorites();
  return favorites.some((f) => f.content === content);
}

export function toggleFavorite(item: HookItem): boolean {
  const favorites = getFavorites();
  const index = favorites.findIndex((f) => f.content === item.content);
  if (index >= 0) {
    favorites.splice(index, 1);
    saveFavorites(favorites);
    return false; // 已取消收藏
  } else {
    favorites.unshift(item);
    saveFavorites(favorites);
    return true; // 已收藏
  }
}

// ---- 历史记录（localStorage） ----

const MAX_HISTORY = 50;

export function getHistory(): HistoryGroup[] {
  return safeGet<HistoryGroup[]>(STORAGE_KEYS.HISTORY, []);
}

export function addHistory(group: HistoryGroup): void {
  const history = getHistory();
  history.unshift(group);
  // 超出上限时移除最早的
  if (history.length > MAX_HISTORY) {
    history.splice(MAX_HISTORY);
  }
  safeSet(STORAGE_KEYS.HISTORY, history);
}
```

---

### Task 4: 核心状态 Hook

**文件：**
- 创建：`hooks/useHookLab.ts`

- [ ] **Step 1: 编写 useHookLab**

```typescript
// hooks/useHookLab.ts

'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { HookItem, HistoryGroup, AppSettings, ToastMessage } from '@/lib/types';
import { DEFAULT_SETTINGS } from '@/lib/constants';
import { getSettings, saveSettings, getFavorites, toggleFavorite, getHistory, addHistory } from '@/lib/storage';

let toastIdCounter = 0;

export function useHookLab() {
  // 输入状态
  const [topic, setTopic] = useState('');
  const [platform, setPlatform] = useState('xiaohongshu');
  const [contentType, setContentType] = useState('video');
  const [selectedStyles, setSelectedStyles] = useState<string[]>([
    'suspense-question', 'counter-intuitive', 'pain-point', 'numbered-list',
    'empathy', 'contrast', 'identity-label', 'result-promise',
    'curiosity-gap', 'social-currency', 'story-hook', 'controversy',
  ]);

  // 结果状态
  const [hooks, setHooks] = useState<HookItem[] | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 设置
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [settingsOpen, setSettingsOpen] = useState(false);

  // 收藏
  const [favorites, setFavorites] = useState<HookItem[]>([]);

  // 历史
  const [history, setHistory] = useState<HistoryGroup[]>([]);

  // Toast
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // 初始化：从存储加载
  useEffect(() => {
    setSettings(getSettings());
    setFavorites(getFavorites());
    setHistory(getHistory());
  }, []);

  const showToast = useCallback((text: string, type: ToastMessage['type'] = 'success') => {
    const id = ++toastIdCounter;
    setToasts((prev) => [...prev, { id, text, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 2500);
  }, []);

  const removeToast = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // 生成
  const generate = useCallback(async () => {
    if (!topic.trim()) {
      setError('请输入主题');
      return;
    }
    if (!settings.apiKey.trim()) {
      setSettingsOpen(true);
      setError('请先配置 API Key');
      return;
    }
    if (selectedStyles.length === 0) {
      setError('请至少选择一种风格');
      return;
    }

    setError(null);
    setIsGenerating(true);
    setHooks(null);

    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: topic.trim(),
          platform,
          contentType,
          styles: selectedStyles,
          apiKey: settings.apiKey,
          baseUrl: settings.baseUrl,
          model: settings.model,
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        const msg = (errData as { error?: string }).error || `请求失败 (${res.status})`;
        throw new Error(msg);
      }

      const data = await res.json();

      if (!data.hooks || !Array.isArray(data.hooks) || data.hooks.length !== 10) {
        throw new Error('生成结果数量不符预期');
      }

      const newHooks: HookItem[] = data.hooks;
      setHooks(newHooks);

      // 写入历史
      const historyGroup: HistoryGroup = {
        id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
        topic: topic.trim(),
        platform,
        contentType,
        selectedStyles,
        hooks: newHooks,
        generatedAt: data.generatedAt || new Date().toISOString(),
      };
      addHistory(historyGroup);
      setHistory(getHistory());

      showToast('已生成 10 个 Hook', 'success');
    } catch (err) {
      const message = err instanceof Error ? err.message : '未知错误';
      setError(message);
      showToast(message, 'error');
    } finally {
      setIsGenerating(false);
    }
  }, [topic, platform, contentType, selectedStyles, settings, showToast]);

  // 复制
  const copyHook = useCallback(async (content: string) => {
    try {
      await navigator.clipboard.writeText(content);
      showToast('已复制到剪贴板', 'success');
    } catch {
      showToast('复制失败', 'error');
    }
  }, [showToast]);

  // 收藏切换
  const handleToggleFavorite = useCallback((item: HookItem) => {
    const added = toggleFavorite(item);
    setFavorites(getFavorites());
    showToast(added ? '已收藏' : '已取消收藏', 'success');
  }, [showToast]);

  // 保存设置
  const handleSaveSettings = useCallback((newSettings: AppSettings) => {
    saveSettings(newSettings);
    setSettings(newSettings);
    setSettingsOpen(false);
    showToast('设置已保存', 'success');
  }, [showToast]);

  // 查看历史记录
  const viewHistory = useCallback((group: HistoryGroup) => {
    setTopic(group.topic);
    setPlatform(group.platform);
    setContentType(group.contentType);
    setSelectedStyles(group.selectedStyles);
    setHooks(group.hooks);
    setError(null);
    showToast('已加载历史记录', 'info');
  }, [showToast]);

  return {
    // 输入
    topic, setTopic,
    platform, setPlatform,
    contentType, setContentType,
    selectedStyles, setSelectedStyles,
    // 结果
    hooks, isGenerating, error, setError,
    // 设置
    settings, settingsOpen, setSettingsOpen, handleSaveSettings,
    // 收藏
    favorites, handleToggleFavorite, isFavorite: (content: string) => favorites.some((f) => f.content === content),
    // 历史
    history, viewHistory,
    // Toast
    toasts, removeToast,
    // 操作
    generate, copyHook,
  };
}
```

---

### Task 5: Toast 组件

**文件：**
- 创建：`components/Toast.tsx`

- [ ] **Step 1: 编写 Toast 组件**

```typescript
// components/Toast.tsx

'use client';

import { ToastMessage } from '@/lib/types';

interface ToastProps {
  toasts: ToastMessage[];
  onRemove: (id: number) => void;
}

export default function Toast({ toasts, onRemove }: ToastProps) {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex flex-col gap-2 items-center pointer-events-none">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          onClick={() => onRemove(toast.id)}
          className={`pointer-events-auto px-5 py-3 rounded-xl text-sm font-medium shadow-lg backdrop-blur-sm cursor-pointer
            transition-all duration-300 animate-[slideUp_0.3s_ease-out]
            ${toast.type === 'success' ? 'bg-emerald-500/20 border border-emerald-500/30 text-emerald-300' : ''}
            ${toast.type === 'error' ? 'bg-red-500/20 border border-red-500/30 text-red-300' : ''}
            ${toast.type === 'info' ? 'bg-sky-500/20 border border-sky-500/30 text-sky-300' : ''}
          `}
        >
          {toast.text}
        </div>
      ))}
    </div>
  );
}
```

- [ ] **Step 2: 在 globals.css 中添加 Toast 动画**

在 `app/globals.css` 末尾添加：

```css
@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(16px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
```

---

### Task 6: API Route

**文件：**
- 创建：`app/api/generate/route.ts`

- [ ] **Step 1: 编写 API Route**

```typescript
// app/api/generate/route.ts

import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { HookItem } from '@/lib/types';

const SYSTEM_PROMPT = `你是一位顶尖的内容营销专家，专门为各大内容平台撰写爆款开头 Hook。
你必须严格按照 JSON 格式返回结果，不附加任何解释文字。

平台特点参考：
- 小红书：年轻女性为主，语气亲切真实，多用 emoji 和口语化表达
- 抖音：快节奏，前 3 秒抓人，语气强冲击力
- B站：Z 世代，梗文化，可以幽默/中二
- YouTube：信息密度高，专业感，中长句
- X（Twitter）：极简犀利，一句话炸裂

每个 Hook 必须：
- 长度 20-60 字
- 符合指定平台的调性和用户画像
- 真正有"让人忍不住想点开"的冲击力`;

function allocateStyles(styles: string[], total: number): string[] {
  const n = styles.length;
  const base = Math.floor(total / n);
  const remainder = total - base * n;
  const allocation: string[] = [];
  for (let i = 0; i < n; i++) {
    const count = i < remainder ? base + 1 : base;
    for (let j = 0; j < count; j++) {
      allocation.push(styles[i]);
    }
  }
  return allocation;
}

function extractJson(text: string): string {
  // 剥离 markdown 代码块
  let cleaned = text.trim();
  if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```\w*\n?/, '').replace(/\n?```$/, '');
  }
  // 处理末尾逗号
  cleaned = cleaned.replace(/,(\s*[}\]])/g, '$1');
  return cleaned;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { topic, platform, contentType, styles, apiKey, baseUrl, model } = body;

    // 参数校验
    if (!topic?.trim()) {
      return NextResponse.json({ error: '请输入主题' }, { status: 400 });
    }
    if (!apiKey?.trim()) {
      return NextResponse.json({ error: '请先配置 API Key' }, { status: 401 });
    }
    if (!styles?.length) {
      return NextResponse.json({ error: '请至少选择一种风格' }, { status: 400 });
    }

    const styleAllocation = allocateStyles(styles, 10);

    const platformLabels: Record<string, string> = {
      xiaohongshu: '小红书', douyin: '抖音', bilibili: 'B站',
      youtube: 'YouTube', x: 'X',
    };
    const contentTypeLabels: Record<string, string> = {
      video: '视频', 'image-text': '图文', 'product-ad': '产品广告',
      tutorial: '教程', opinion: '观点帖',
    };
    const styleLabels: Record<string, string> = {
      'suspense-question': '悬念提问', 'counter-intuitive': '反常识',
      'pain-point': '痛点直击', 'numbered-list': '数字清单',
      'empathy': '情感共鸣', 'contrast': '对比冲击',
      'identity-label': '身份标签', 'result-promise': '结果承诺',
      'curiosity-gap': '好奇缺口', 'social-currency': '社交货币',
      'story-hook': '故事钩子', 'controversy': '争议挑逗',
    };

    const styleList = styleAllocation
      .map((s, i) => `${i + 1}. ${styleLabels[s] || s}`)
      .join('\n');

    const userMessage = `主题：${topic.trim()}
平台：${platformLabels[platform] || platform}
内容类型：${contentTypeLabels[contentType] || contentType}
要求：生成 10 条 Hook，按以下顺序分配风格（每条对应一个风格）：
${styleList}

返回一个纯 JSON 对象：
{
  "hooks": [
    { "content": "Hook文案", "style": "风格名称（中文）", "score": 8.5, "reason": "一句话解释为什么这个hook有效" }
  ]
}
score 为 0.0-10.0 的点击欲评分，客观评估。必须恰好返回 10 条。`;

    const client = new OpenAI({
      apiKey,
      baseURL: baseUrl || 'https://api.deepseek.com/v1',
      timeout: 60000,
    });

    const completion = await client.chat.completions.create({
      model: model || 'deepseek-chat',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: userMessage },
      ],
      temperature: 0.9,
      max_tokens: 4096,
    });

    const rawContent = completion.choices[0]?.message?.content;
    if (!rawContent) {
      return NextResponse.json({ error: 'AI 未返回内容，请重试' }, { status: 502 });
    }

    let parsed: { hooks: HookItem[] };
    try {
      parsed = JSON.parse(extractJson(rawContent));
    } catch {
      return NextResponse.json({
        error: 'AI 返回格式异常，请重试',
        raw: rawContent.slice(0, 500),
      }, { status: 502 });
    }

    if (!parsed.hooks || !Array.isArray(parsed.hooks)) {
      return NextResponse.json({ error: 'AI 返回格式异常，请重试' }, { status: 502 });
    }

    // 补齐 ID
    const hooks: HookItem[] = parsed.hooks.slice(0, 10).map((h, i) => ({
      id: `hook-${Date.now()}-${i}`,
      content: h.content || '',
      style: h.style || styleAllocation[i] || '未知',
      score: typeof h.score === 'number' ? Math.min(10, Math.max(0, h.score)) : 7.0,
      reason: h.reason || '',
    }));

    // 补齐不足 10 条（极端情况）
    while (hooks.length < 10) {
      hooks.push({
        id: `hook-${Date.now()}-${hooks.length}`,
        content: '生成失败，请重试',
        style: '未知',
        score: 0,
        reason: '此条生成时出现异常',
      });
    }

    return NextResponse.json({
      hooks,
      generatedAt: new Date().toISOString(),
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : '服务器内部错误';
    const status =
      (err as { status?: number }).status === 401 ? 401 :
      (err as { status?: number }).status === 429 ? 429 :
      500;

    // 不暴露内部 details 到前端
    if (status === 401) {
      return NextResponse.json({ error: 'API Key 无效，请检查后重试' }, { status: 401 });
    }
    if (status === 429) {
      return NextResponse.json({ error: '服务繁忙，请稍后重试或切换厂商' }, { status: 429 });
    }

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
```

---

### Task 7: Header 组件

**文件：**
- 创建：`components/Header.tsx`

- [ ] **Step 1: 编写 Header**

```typescript
// components/Header.tsx

'use client';

interface HeaderProps {
  onOpenSettings: () => void;
}

export default function Header({ onOpenSettings }: HeaderProps) {
  return (
    <header className="flex items-center gap-3 pb-5 border-b border-white/5">
      <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-purple-500 to-cyan-400 flex items-center justify-center">
        <span className="text-white font-bold text-sm">H</span>
      </div>
      <h1 className="text-xl font-bold tracking-tight text-white">
        AI Hook Lab
      </h1>
      <span className="text-xs text-zinc-600 bg-white/5 px-2 py-0.5 rounded-full">
        Beta
      </span>
      <button
        onClick={onOpenSettings}
        className="ml-auto px-4 py-2 rounded-lg border border-white/10 text-sm text-zinc-400
                   hover:border-white/20 hover:text-zinc-200 transition-all duration-200"
      >
        ⚙ 设置
      </button>
    </header>
  );
}
```

---

### Task 8: SettingsModal 组件

**文件：**
- 创建：`components/SettingsModal.tsx`

- [ ] **Step 1: 编写 SettingsModal**

```typescript
// components/SettingsModal.tsx

'use client';

import { useState } from 'react';
import { AppSettings } from '@/lib/types';
import { PRESET_PROVIDERS, DEFAULT_SETTINGS } from '@/lib/constants';

interface SettingsModalProps {
  open: boolean;
  settings: AppSettings;
  error?: string | null;
  onSave: (settings: AppSettings) => void;
  onClose: () => void;
}

export default function SettingsModal({ open, settings, error, onSave, onClose }: SettingsModalProps) {
  const [apiKey, setApiKey] = useState(settings.apiKey);
  const [baseUrl, setBaseUrl] = useState(settings.baseUrl);
  const [model, setModel] = useState(settings.model);
  const [preset, setPreset] = useState('');

  if (!open) return null;

  const handlePresetChange = (index: number) => {
    const p = PRESET_PROVIDERS[index];
    setPreset(String(index));
    if (p.label !== '自定义') {
      setBaseUrl(p.baseUrl);
      setModel(p.model);
    }
  };

  const handleSave = () => {
    onSave({ apiKey: apiKey.trim(), baseUrl: baseUrl.trim(), model: model.trim() });
  };

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) onClose();
  };

  return (
    <div
      className="fixed inset-0 z-40 flex items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={handleOverlayClick}
    >
      <div className="bg-[#14141f] border border-white/10 rounded-2xl p-6 w-full max-w-md mx-4 shadow-2xl">
        <h2 className="text-lg font-bold text-white mb-5">API 设置</h2>

        {/* 厂商选择 */}
        <label className="block text-sm text-zinc-400 mb-2">厂商</label>
        <div className="grid grid-cols-3 gap-2 mb-4">
          {PRESET_PROVIDERS.map((p, i) => (
            <button
              key={p.label}
              onClick={() => handlePresetChange(i)}
              className={`px-3 py-2 rounded-lg text-xs font-medium transition-all
                ${preset === String(i)
                  ? 'bg-purple-500/20 border border-purple-500/40 text-purple-300'
                  : 'bg-white/5 border border-white/5 text-zinc-400 hover:border-white/15'
                }`}
            >
              {p.label}
            </button>
          ))}
        </div>

        {/* Base URL */}
        <label className="block text-sm text-zinc-400 mb-1.5">Base URL</label>
        <input
          type="text"
          value={baseUrl}
          onChange={(e) => { setBaseUrl(e.target.value); setPreset(''); }}
          placeholder="https://api.deepseek.com/v1"
          className="w-full bg-[#0a0a14] border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white
                     placeholder:text-zinc-600 focus:outline-none focus:border-purple-500/40 transition-colors mb-4"
        />

        {/* 模型名称 */}
        <label className="block text-sm text-zinc-400 mb-1.5">模型名称</label>
        <input
          type="text"
          value={model}
          onChange={(e) => { setModel(e.target.value); setPreset(''); }}
          placeholder="deepseek-chat"
          className="w-full bg-[#0a0a14] border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white
                     placeholder:text-zinc-600 focus:outline-none focus:border-purple-500/40 transition-colors mb-4"
        />

        {/* API Key */}
        <label className="block text-sm text-zinc-400 mb-1.5">API Key</label>
        <input
          type="password"
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
          placeholder="sk-..."
          className={`w-full bg-[#0a0a14] border rounded-lg px-3 py-2.5 text-sm text-white
                     placeholder:text-zinc-600 focus:outline-none focus:border-purple-500/40 transition-colors mb-1
                     ${error ? 'border-red-500/50' : 'border-white/10'}`}
          autoFocus={!!error}
        />
        {error && (
          <p className="text-red-400 text-xs mb-3">{error}</p>
        )}
        <p className="text-xs text-zinc-600 mb-5">
          密钥仅保存在浏览器中，不会上传到任何服务器
        </p>

        {/* 按钮 */}
        <div className="flex gap-3">
          <button
            onClick={handleSave}
            disabled={!apiKey.trim()}
            className="flex-1 py-2.5 rounded-lg font-medium text-sm
                       bg-gradient-to-r from-purple-500 to-cyan-400 text-white
                       hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
          >
            保存设置
          </button>
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-lg border border-white/10 text-sm text-zinc-400
                       hover:text-zinc-200 hover:border-white/20 transition-all"
          >
            取消
          </button>
        </div>
      </div>
    </div>
  );
}
```

---

### Task 9: 输入区子组件

**文件：**
- 创建：`components/TopicInput.tsx`
- 创建：`components/PlatformSelector.tsx`
- 创建：`components/ContentTypeSelector.tsx`
- 创建：`components/StyleSelector.tsx`
- 创建：`components/InputPanel.tsx`

- [ ] **Step 1: TopicInput**

```typescript
// components/TopicInput.tsx

'use client';

interface TopicInputProps {
  value: string;
  onChange: (v: string) => void;
  hasError: boolean;
}

export default function TopicInput({ value, onChange, hasError }: TopicInputProps) {
  return (
    <div className="mb-4">
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="输入你的主题，例如：如何做好时间管理..."
        className={`w-full bg-[#0a0a14] border rounded-xl px-4 py-3.5 text-sm text-white
                   placeholder:text-zinc-600 focus:outline-none focus:border-purple-500/50
                   transition-all duration-200
                   ${hasError
                     ? 'border-red-500/50 animate-[shake_0.4s_ease-in-out]'
                     : 'border-white/10'
                   }`}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            const btn = document.getElementById('generate-btn');
            btn?.click();
          }
        }}
      />
      {hasError && (
        <p className="text-red-400 text-xs mt-1.5 ml-1">请输入主题</p>
      )}
    </div>
  );
}
```

- [ ] **Step 2: PlatformSelector**

```typescript
// components/PlatformSelector.tsx

'use client';

import { PLATFORMS } from '@/lib/constants';

interface PlatformSelectorProps {
  value: string;
  onChange: (v: string) => void;
}

export default function PlatformSelector({ value, onChange }: PlatformSelectorProps) {
  return (
    <div className="mb-4">
      <span className="text-xs text-zinc-500 mr-3">平台</span>
      <div className="inline-flex flex-wrap gap-2">
        {PLATFORMS.map((p) => (
          <button
            key={p.key}
            onClick={() => onChange(p.key)}
            className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all duration-200
              ${value === p.key
                ? 'bg-purple-500/15 border border-purple-500/30 text-purple-300'
                : 'bg-white/[0.03] border border-white/5 text-zinc-500 hover:border-white/15 hover:text-zinc-400'
              }`}
          >
            {p.label}
          </button>
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 3: ContentTypeSelector**

```typescript
// components/ContentTypeSelector.tsx

'use client';

import { CONTENT_TYPES } from '@/lib/constants';

interface ContentTypeSelectorProps {
  value: string;
  onChange: (v: string) => void;
}

export default function ContentTypeSelector({ value, onChange }: ContentTypeSelectorProps) {
  return (
    <div className="mb-4">
      <span className="text-xs text-zinc-500 mr-3">类型</span>
      <div className="inline-flex flex-wrap gap-2">
        {CONTENT_TYPES.map((ct) => (
          <button
            key={ct.key}
            onClick={() => onChange(ct.key)}
            className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all duration-200
              ${value === ct.key
                ? 'bg-cyan-500/15 border border-cyan-500/30 text-cyan-300'
                : 'bg-white/[0.03] border border-white/5 text-zinc-500 hover:border-white/15 hover:text-zinc-400'
              }`}
          >
            {ct.label}
          </button>
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 4: StyleSelector**

```typescript
// components/StyleSelector.tsx

'use client';

import { STYLE_POOL } from '@/lib/constants';

interface StyleSelectorProps {
  selected: string[];
  onChange: (styles: string[]) => void;
}

export default function StyleSelector({ selected, onChange }: StyleSelectorProps) {
  const toggle = (key: string) => {
    if (selected.includes(key)) {
      onChange(selected.filter((s) => s !== key));
    } else {
      onChange([...selected, key]);
    }
  };

  const selectAll = () => onChange(STYLE_POOL.map((s) => s.key));
  const deselectAll = () => onChange([]);

  return (
    <div className="mb-4">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-xs text-zinc-500">风格</span>
        <button onClick={selectAll} className="text-xs text-zinc-600 hover:text-zinc-400 transition-colors">
          全选
        </button>
        <button onClick={deselectAll} className="text-xs text-zinc-600 hover:text-zinc-400 transition-colors">
          清空
        </button>
        <span className="text-xs text-zinc-700 ml-auto">
          已选 {selected.length}/{STYLE_POOL.length}
        </span>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {STYLE_POOL.map((s) => {
          const isSelected = selected.includes(s.key);
          return (
            <button
              key={s.key}
              onClick={() => toggle(s.key)}
              title={s.desc}
              className={`px-3 py-1.5 rounded-full text-xs transition-all duration-200
                ${isSelected
                  ? 'bg-purple-500/15 border border-purple-500/30 text-purple-300'
                  : 'bg-white/[0.03] border border-white/5 text-zinc-600 hover:border-white/10'
                }`}
            >
              {s.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
```

- [ ] **Step 5: InputPanel（组合容器）**

```typescript
// components/InputPanel.tsx

'use client';

import TopicInput from './TopicInput';
import PlatformSelector from './PlatformSelector';
import ContentTypeSelector from './ContentTypeSelector';
import StyleSelector from './StyleSelector';

interface InputPanelProps {
  topic: string;
  onTopicChange: (v: string) => void;
  platform: string;
  onPlatformChange: (v: string) => void;
  contentType: string;
  onContentTypeChange: (v: string) => void;
  selectedStyles: string[];
  onStylesChange: (v: string[]) => void;
  isGenerating: boolean;
  onGenerate: () => void;
  topicError: boolean;
}

export default function InputPanel({
  topic, onTopicChange, platform, onPlatformChange,
  contentType, onContentTypeChange, selectedStyles, onStylesChange,
  isGenerating, onGenerate, topicError,
}: InputPanelProps) {
  return (
    <div className="bg-[#14141f] border border-white/[0.07] rounded-2xl p-5 mb-6">
      <TopicInput value={topic} onChange={onTopicChange} hasError={topicError} />
      <PlatformSelector value={platform} onChange={onPlatformChange} />
      <ContentTypeSelector value={contentType} onChange={onContentTypeChange} />
      <StyleSelector selected={selectedStyles} onChange={onStylesChange} />

      <button
        id="generate-btn"
        onClick={onGenerate}
        disabled={isGenerating}
        className="w-full py-3 rounded-xl font-semibold text-sm text-white
                   bg-gradient-to-r from-purple-500 to-cyan-400
                   hover:shadow-lg hover:shadow-purple-500/25
                   transition-all duration-300
                   disabled:opacity-50 disabled:cursor-not-allowed
                   relative overflow-hidden"
      >
        {isGenerating ? (
          <span className="flex items-center justify-center gap-2">
            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            生成中...
          </span>
        ) : (
          '⚡ 生成 10 个 Hook'
        )}
      </button>
    </div>
  );
}
```

---

### Task 10: HookCard 组件

**文件：**
- 创建：`components/HookCard.tsx`

- [ ] **Step 1: 编写 HookCard**

```typescript
// components/HookCard.tsx

'use client';

import { HookItem } from '@/lib/types';

interface HookCardProps {
  hook: HookItem;
  isFavorited: boolean;
  onCopy: (content: string) => void;
  onToggleFavorite: (hook: HookItem) => void;
  index: number;
}

export default function HookCard({ hook, isFavorited, onCopy, onToggleFavorite, index }: HookCardProps) {
  return (
    <div
      className="bg-[#14141f] border border-white/[0.07] rounded-xl p-4
                 hover:border-purple-500/20 transition-all duration-300
                 animate-[fadeIn_0.4s_ease-out]"
      style={{ animationDelay: `${index * 80}ms`, animationFillMode: 'backwards' }}
    >
      <div className="flex gap-3">
        {/* 评分 */}
        <div className="flex-shrink-0 text-center w-12">
          <div className="text-2xl font-extrabold bg-gradient-to-b from-purple-400 to-cyan-400 bg-clip-text text-transparent">
            {hook.score.toFixed(1)}
          </div>
          <div className="text-[10px] text-zinc-600 mt-0.5">点击欲</div>
        </div>

        {/* 内容 */}
        <div className="flex-1 min-w-0">
          <p className="text-sm text-zinc-200 leading-relaxed mb-2">
            {hook.content}
          </p>
          <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-medium
                           bg-purple-500/10 text-purple-300 border border-purple-500/20">
            {hook.style}
          </span>

          <p className="text-xs text-zinc-600 mt-2 leading-relaxed">
            💡 {hook.reason}
          </p>

          {/* 操作 */}
          <div className="flex gap-3 mt-3 pt-2 border-t border-white/5">
            <button
              onClick={() => onCopy(hook.content)}
              className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors flex items-center gap-1"
            >
              📋 复制
            </button>
            <button
              onClick={() => onToggleFavorite(hook)}
              className={`text-xs transition-colors flex items-center gap-1
                ${isFavorited ? 'text-amber-400' : 'text-zinc-500 hover:text-amber-400'}`}
            >
              ⭐ {isFavorited ? '已收藏' : '收藏'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: 在 globals.css 中添加卡片入场动画**

```css
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(12px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
```

---

### Task 11: ResultsGrid 组件

**文件：**
- 创建：`components/ResultsGrid.tsx`

- [ ] **Step 1: 编写 ResultsGrid**

```typescript
// components/ResultsGrid.tsx

'use client';

import { HookItem } from '@/lib/types';
import HookCard from './HookCard';

interface ResultsGridProps {
  hooks: HookItem[] | null;
  isGenerating: boolean;
  isFavorited: (content: string) => boolean;
  onCopy: (content: string) => void;
  onToggleFavorite: (hook: HookItem) => void;
}

function SkeletonCard({ index }: { index: number }) {
  return (
    <div
      className="bg-[#14141f] border border-white/[0.05] rounded-xl p-4 animate-pulse"
      style={{ animationDelay: `${index * 80}ms` }}
    >
      <div className="flex gap-3">
        <div className="w-12 h-12 bg-white/5 rounded-lg flex-shrink-0" />
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-white/5 rounded w-full" />
          <div className="h-4 bg-white/5 rounded w-3/4" />
          <div className="h-3 bg-white/5 rounded w-1/3" />
        </div>
      </div>
    </div>
  );
}

export default function ResultsGrid({ hooks, isGenerating, isFavorited, onCopy, onToggleFavorite }: ResultsGridProps) {
  // 空态
  if (!hooks && !isGenerating) {
    return (
      <div className="flex-1 flex items-center justify-center py-20">
        <div className="text-center">
          <div className="text-5xl mb-4">🧪</div>
          <p className="text-zinc-500 text-sm">输入主题，AI 为你生成 10 个爆款 Hook</p>
          <p className="text-zinc-700 text-xs mt-1">支持小红书 · 抖音 · B站 · YouTube · X</p>
        </div>
      </div>
    );
  }

  // 骨架屏
  if (isGenerating) {
    return (
      <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-3 content-start">
        {Array.from({ length: 10 }).map((_, i) => (
          <SkeletonCard key={i} index={i} />
        ))}
      </div>
    );
  }

  // 结果
  if (hooks) {
    return (
      <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-3 content-start">
        {hooks.map((hook, i) => (
          <HookCard
            key={hook.id}
            hook={hook}
            index={i}
            isFavorited={isFavorited(hook.content)}
            onCopy={onCopy}
            onToggleFavorite={onToggleFavorite}
          />
        ))}
      </div>
    );
  }

  return null;
}
```

---

### Task 12: 侧边栏子组件

**文件：**
- 创建：`components/FavoritesPanel.tsx`
- 创建：`components/HistoryPanel.tsx`
- 创建：`components/Sidebar.tsx`

- [ ] **Step 1: FavoritesPanel**

```typescript
// components/FavoritesPanel.tsx

'use client';

import { HookItem } from '@/lib/types';

interface FavoritesPanelProps {
  favorites: HookItem[];
  onCopy: (content: string) => void;
}

export default function FavoritesPanel({ favorites, onCopy }: FavoritesPanelProps) {
  return (
    <div className="bg-[#14141f] border border-white/[0.07] rounded-xl p-3">
      <h3 className="text-xs font-semibold text-zinc-300 mb-2 flex items-center gap-1.5">
        <span className="text-amber-400">⭐</span> 收藏
        {favorites.length > 0 && (
          <span className="text-[10px] text-zinc-600 ml-auto">{favorites.length}</span>
        )}
      </h3>

      {favorites.length === 0 ? (
        <p className="text-xs text-zinc-700 text-center py-3">暂无收藏</p>
      ) : (
        <div className="space-y-2 max-h-64 overflow-y-auto custom-scrollbar">
          {favorites.map((item) => (
            <div
              key={item.id}
              className="bg-white/[0.02] border border-white/[0.04] rounded-lg p-2.5 group cursor-pointer
                         hover:border-purple-500/20 transition-all"
              onClick={() => onCopy(item.content)}
            >
              <p className="text-xs text-zinc-400 leading-relaxed line-clamp-2">{item.content}</p>
              <div className="flex items-center gap-1 mt-1.5">
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-purple-500/10 text-purple-400">
                  {item.style}
                </span>
                <span className="text-[10px] text-zinc-600 ml-auto">
                  {item.score.toFixed(1)}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 2: HistoryPanel**

```typescript
// components/HistoryPanel.tsx

'use client';

import { HistoryGroup } from '@/lib/types';

const platformLabels: Record<string, string> = {
  xiaohongshu: '小红书', douyin: '抖音', bilibili: 'B站',
  youtube: 'YouTube', x: 'X',
};

const contentTypeLabels: Record<string, string> = {
  video: '视频', 'image-text': '图文', 'product-ad': '产品广告',
  tutorial: '教程', opinion: '观点帖',
};

interface HistoryPanelProps {
  history: HistoryGroup[];
  onView: (group: HistoryGroup) => void;
}

export default function HistoryPanel({ history, onView }: HistoryPanelProps) {
  return (
    <div className="bg-[#14141f] border border-white/[0.07] rounded-xl p-3">
      <h3 className="text-xs font-semibold text-zinc-300 mb-2 flex items-center gap-1.5">
        <span className="text-sky-400">🕐</span> 历史
        {history.length > 0 && (
          <span className="text-[10px] text-zinc-600 ml-auto">{history.length}</span>
        )}
      </h3>

      {history.length === 0 ? (
        <p className="text-xs text-zinc-700 text-center py-3">暂无记录</p>
      ) : (
        <div className="space-y-2 max-h-64 overflow-y-auto custom-scrollbar">
          {history.map((group) => (
            <button
              key={group.id}
              onClick={() => onView(group)}
              className="w-full text-left bg-white/[0.02] border border-white/[0.04] rounded-lg p-2.5
                         hover:border-cyan-500/20 transition-all"
            >
              <p className="text-xs text-zinc-400 truncate">{group.topic}</p>
              <div className="flex items-center gap-1 mt-1.5">
                <span className="text-[10px] text-zinc-600">
                  {platformLabels[group.platform] || group.platform}
                </span>
                <span className="text-[10px] text-zinc-700">·</span>
                <span className="text-[10px] text-zinc-600">
                  {contentTypeLabels[group.contentType] || group.contentType}
                </span>
                <span className="text-[10px] text-zinc-600 ml-auto">
                  {new Date(group.generatedAt).toLocaleDateString('zh-CN')}
                </span>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 3: Sidebar（桌面竖列 / 移动端 Tab）**

```typescript
// components/Sidebar.tsx

'use client';

import { useState } from 'react';
import { HookItem, HistoryGroup } from '@/lib/types';
import FavoritesPanel from './FavoritesPanel';
import HistoryPanel from './HistoryPanel';

interface SidebarProps {
  favorites: HookItem[];
  history: HistoryGroup[];
  onCopy: (content: string) => void;
  onViewHistory: (group: HistoryGroup) => void;
}

export default function Sidebar({ favorites, history, onCopy, onViewHistory }: SidebarProps) {
  const [activeTab, setActiveTab] = useState<'favorites' | 'history'>('favorites');

  return (
    <>
      {/* 移动端 Tab 切换 */}
      <div className="flex md:hidden gap-2 mb-4">
        <button
          onClick={() => setActiveTab('favorites')}
          className={`flex-1 py-2 rounded-lg text-xs font-medium transition-all
            ${activeTab === 'favorites'
              ? 'bg-purple-500/15 border border-purple-500/30 text-purple-300'
              : 'bg-[#14141f] border border-white/5 text-zinc-500'
            }`}
        >
          ⭐ 收藏 ({favorites.length})
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`flex-1 py-2 rounded-lg text-xs font-medium transition-all
            ${activeTab === 'history'
              ? 'bg-cyan-500/15 border border-cyan-500/30 text-cyan-300'
              : 'bg-[#14141f] border border-white/5 text-zinc-500'
            }`}
        >
          🕐 历史 ({history.length})
        </button>
      </div>

      {/* 移动端面板 */}
      <div className="md:hidden mb-4">
        {activeTab === 'favorites' ? (
          <FavoritesPanel favorites={favorites} onCopy={onCopy} />
        ) : (
          <HistoryPanel history={history} onView={onViewHistory} />
        )}
      </div>

      {/* 桌面端竖列侧边栏 */}
      <aside className="hidden md:flex md:flex-col md:gap-3 md:w-48 md:flex-shrink-0">
        <FavoritesPanel favorites={favorites} onCopy={onCopy} />
        <HistoryPanel history={history} onView={onViewHistory} />
      </aside>
    </>
  );
}
```

---

### Task 13: 主页面组装

**文件：**
- 创建：`app/layout.tsx`（修改已有）
- 创建：`app/page.tsx`（覆写已有）
- 创建：`app/globals.css`（覆写已有）

- [ ] **Step 1: 根布局 layout.tsx**

```typescript
// app/layout.tsx

import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'AI Hook Lab - AI 爆款文案 Hook 生成器',
  description: '输入主题，选择平台和内容类型，AI 一键生成 10 个不同风格的爆款开头 Hook',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN">
      <body className="bg-[#0a0a0f] text-white antialiased min-h-screen">
        {children}
      </body>
    </html>
  );
}
```

- [ ] **Step 2: 主页面 page.tsx**

```typescript
// app/page.tsx

'use client';

import { useHookLab } from '@/hooks/useHookLab';
import Header from '@/components/Header';
import SettingsModal from '@/components/SettingsModal';
import InputPanel from '@/components/InputPanel';
import Sidebar from '@/components/Sidebar';
import ResultsGrid from '@/components/ResultsGrid';
import Toast from '@/components/Toast';

export default function HomePage() {
  const hookLab = useHookLab();

  return (
    <main className="max-w-5xl mx-auto px-4 py-6 md:py-10 min-h-screen">
      {/* 顶部 */}
      <Header onOpenSettings={() => hookLab.setSettingsOpen(true)} />

      <div className="mt-6">
        {/* 输入区 */}
        <InputPanel
          topic={hookLab.topic}
          onTopicChange={(v) => { hookLab.setTopic(v); hookLab.setError(null); }}
          platform={hookLab.platform}
          onPlatformChange={hookLab.setPlatform}
          contentType={hookLab.contentType}
          onContentTypeChange={hookLab.setContentType}
          selectedStyles={hookLab.selectedStyles}
          onStylesChange={hookLab.setSelectedStyles}
          isGenerating={hookLab.isGenerating}
          onGenerate={hookLab.generate}
          topicError={hookLab.error === '请输入主题'}
        />

        {/* 错误提示（非 topic 空值错误） */}
        {hookLab.error && hookLab.error !== '请输入主题' && (
          <div className="mb-4 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-300 text-sm flex items-start gap-2">
            <span>❌</span>
            <div>
              <p>{hookLab.error}</p>
              {(hookLab.error.includes('API Key') || hookLab.error.includes('请先配置')) && (
                <button
                  onClick={() => hookLab.setSettingsOpen(true)}
                  className="mt-1 text-red-400 underline underline-offset-2 text-xs"
                >
                  打开设置
                </button>
              )}
            </div>
          </div>
        )}

        {/* 中间区域：侧边栏 + 结果 */}
        <div className="flex flex-col md:flex-row md:gap-4">
          <Sidebar
            favorites={hookLab.favorites}
            history={hookLab.history}
            onCopy={hookLab.copyHook}
            onViewHistory={hookLab.viewHistory}
          />
          <ResultsGrid
            hooks={hookLab.hooks}
            isGenerating={hookLab.isGenerating}
            isFavorited={hookLab.isFavorite}
            onCopy={hookLab.copyHook}
            onToggleFavorite={hookLab.handleToggleFavorite}
          />
        </div>
      </div>

      {/* 设置弹窗 */}
      <SettingsModal
        open={hookLab.settingsOpen}
        settings={hookLab.settings}
        error={hookLab.error?.includes('API Key') || hookLab.error?.includes('请先配置') ? hookLab.error : null}
        onSave={hookLab.handleSaveSettings}
        onClose={() => hookLab.setSettingsOpen(false)}
      />

      {/* Toast */}
      <Toast toasts={hookLab.toasts} onRemove={hookLab.removeToast} />
    </main>
  );
}
```

- [ ] **Step 3: 全局样式 globals.css**

```css
/* app/globals.css */

@import "tailwindcss";

:root {
  --bg-primary: #0a0a0f;
  --bg-card: #14141f;
}

body {
  background-color: var(--bg-primary);
}

/* 自定义滚动条 */
.custom-scrollbar::-webkit-scrollbar {
  width: 4px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.08);
  border-radius: 2px;
}
.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.15);
}

/* 主题输入框抖动 */
@keyframes shake {
  0%, 100% { transform: translateX(0); }
  20% { transform: translateX(-4px); }
  40% { transform: translateX(4px); }
  60% { transform: translateX(-4px); }
  80% { transform: translateX(4px); }
}

/* 卡片入场 */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(12px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Toast 上滑 */
@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(16px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
```

- [ ] **Step 4: 配置 tailwind.config.ts（如需要自定义颜色）**

如果不使用 Tailwind v4 的 `@import "tailwindcss"` 语法，而是使用 v3 的 `tailwind.config.ts`：

```typescript
// tailwind.config.ts

import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './hooks/**/*.{js,ts,jsx,tsx,mdx}',
    './lib/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          bg: '#0a0a0f',
          card: '#14141f',
        },
      },
    },
  },
  plugins: [],
};

export default config;
```

---

### Task 14: 验证与测试

- [ ] **Step 1: 运行开发服务器**

```bash
npm run dev
```

验证以下场景：
1. 页面加载 → 看到空态引导
2. 点击「设置」→ 设置弹窗打开 → 选择厂商或自定义 → 填入 API Key → 保存
3. 输入主题 + 选择平台/类型/风格 → 点击生成 → 骨架屏 → 10 张卡片依次淡入
4. 点击复制 → Toast 提示
5. 点击收藏 → 侧边栏收藏数更新 → 再次点击取消收藏
6. 刷新页面 → 收藏和历史记录保留
7. 不填 API Key 点生成 → 弹出设置面板 + 红色提示
8. 不填主题点生成 → 输入框抖动 + 提示
9. 缩小浏览器窗口 → 移动端布局：侧边栏变 Tab，结果变单列

- [ ] **Step 2: 构建检查**

```bash
npm run build
```

预期：无 TypeScript 错误，构建成功。

---

### Task 15: 提交（可选）

如果项目目录已初始化为 git 仓库：

```bash
git add -A
git commit -m "feat: AI Hook Lab 完整初始实现"
```

若尚未初始化 git：

```bash
git init
git add -A
git commit -m "feat: AI Hook Lab 完整初始实现"
```
