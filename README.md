# AI Hook Lab 🧪

**一键生成 10 个不同风格的爆款开头 Hook，让 AI 帮你找到最抓人的内容切入点。**

![主页展示](./1.主页展示.jpg)

---

## 功能特性

- 🎯 **多平台适配**：小红书、抖音、B站、YouTube、X，每个平台有独立的语气调性
- 📝 **多内容类型**：视频、图文、产品广告、教程、观点帖
- 🎨 **12 种 Hook 风格**：悬念提问、反常识、痛点直击、数字清单、情感共鸣、对比冲击、身份标签、结果承诺、好奇缺口、社交货币、故事钩子、争议挑逗
- ⚡ **一键 10 条**：根据勾选的风格按比例分配，一次生成 10 条不同风格的 Hook
- 📊 **每条结果包含**：Hook 文案 + 风格标签 + 点击欲评分（0.0-10.0）+ 推荐理由
- 📋 **一键复制**：点击复制按钮即可将文案写入剪贴板
- ⭐ **收藏系统**：收藏喜欢的 Hook，支持删除，持久保存在浏览器中
- 🕐 **历史记录**：每次生成自动保存，可随时回看，最多保留 50 批次
- 🔐 **多厂商支持**：预设 DeepSeek、智谱清言、通义千问、OpenAI，也支持自定义兼容接口
- 📱 **响应式设计**：桌面端 2 列网格 + 侧边栏，移动端单列 + Tab 切换
- 🎨 **暗黑科技风**：紫→青渐变主色调，毛玻璃微光边框，骨架屏加载动画

---

## 技术栈

| 类别 | 技术 |
|------|------|
| 框架 | Next.js 15 (App Router) |
| 语言 | TypeScript |
| 样式 | Tailwind CSS v4 |
| AI SDK | OpenAI SDK（兼容模式） |
| 持久化 | localStorage + sessionStorage |
| 部署 | Vercel |

---

## 项目结构

```
AI Hook Lab/
├── app/
│   ├── layout.tsx                  # 根布局（zh-CN）
│   ├── page.tsx                    # 主页面
│   ├── globals.css                 # 全局样式 + 动画
│   └── api/generate/
│       └── route.ts                # POST 端点，调用大模型
├── components/
│   ├── Header.tsx                  # Logo + 设置入口
│   ├── SettingsModal.tsx           # API 配置弹窗
│   ├── InputPanel.tsx              # 输入区容器
│   ├── TopicInput.tsx              # 主题输入框
│   ├── PlatformSelector.tsx        # 平台 pill 单选
│   ├── ContentTypeSelector.tsx     # 内容类型 pill 单选
│   ├── StyleSelector.tsx           # 风格 chip 多选
│   ├── ResultsGrid.tsx             # 2 列网格 + 骨架屏
│   ├── HookCard.tsx                # 单张结果卡片
│   ├── Sidebar.tsx                 # 收藏 + 历史侧边栏
│   ├── FavoritesPanel.tsx          # 收藏列表
│   ├── HistoryPanel.tsx            # 历史记录列表
│   └── Toast.tsx                   # 全局轻提示
├── hooks/
│   └── useHookLab.ts               # 核心状态管理
├── lib/
│   ├── types.ts                    # 类型定义
│   ├── constants.ts                # 平台/类型/风格/厂商常量
│   └── storage.ts                  # 本地存储工具
├── .env.local                      # 环境变量（用户自行创建）
├── next.config.ts
├── tailwind.config.ts
└── package.json
```

---

## 快速开始

### 1. 克隆项目

```bash
git clone https://github.com/Cori-anba/AI-Hook-Lab.git
cd AI-Hook-Lab
```

### 2. 安装依赖

```bash
npm install
```

### 3. 启动开发服务器

```bash
npm run dev
```

打开浏览器访问 `http://localhost:3001`。

### 4. 配置 API Key

1. 点击页面右上角「⚙ 设置」
2. 选择你的大模型厂商（DeepSeek / 智谱清言 / 通义千问 / OpenAI / 自定义）
3. 填入你的 API Key
4. 点击「保存设置」

> API Key 仅保存在浏览器 localStorage 中，不会上传到任何服务器。

### 5. 开始生成

1. 输入一个主题（如「如何做好时间管理」）
2. 选择目标平台和内容类型
3. 勾选想要的风格（默认全选）
4. 点击「⚡ 生成 10 个 Hook」
5. 浏览结果，复制或收藏你喜欢的内容

---

## 使用示例

> **场景**：你是一个家居类小红书博主，最近接了一款除螨喷雾的推广。你需要为产品广告写一个让人忍不住点进来的开头。

操作步骤：

1. **输入主题**：「宣传除螨喷雾」
2. **选择平台**：小红书
3. **选择内容类型**：产品广告
4. **风格**：全选 12 种（也可以只选「痛点直击」「反常识」「数字清单」等几个目标风格）
5. **点击生成**

AI 会在 10 秒左右返回 10 条不同风格的 Hook，每条都带有风格标签、评分和理由，直接挑选最合适的那条使用。

![使用结果](./2.使用结果.jpg)

---

## 支持的厂商

| 厂商 | Base URL | 默认模型 | 获取 API Key |
|------|----------|---------|-------------|
| DeepSeek | `https://api.deepseek.com/v1` | `deepseek-v4-flash` | [platform.deepseek.com](https://platform.deepseek.com) |
| 智谱清言 | `https://open.bigmodel.cn/api/paas/v4` | `glm-4-flash` | [open.bigmodel.cn](https://open.bigmodel.cn) |
| 通义千问 | `https://dashscope.aliyuncs.com/compatible-mode/v1` | `qwen-plus` | [dashscope.aliyun.com](https://dashscope.aliyun.com) |
| OpenAI | `https://api.openai.com/v1` | `gpt-4o` | [platform.openai.com](https://platform.openai.com) |
| 自定义 | 自行填写 | 自行填写 | 按厂商说明 |

---

## 错误处理

| 情况 | 表现 |
|------|------|
| 未配置 API Key | 自动弹出设置面板，红色提示 |
| API Key 无效 | 错误卡片 + 一键打开设置 |
| 网络异常 | 提示网络连接失败 |
| 厂商限流/不可用 | 提示稍后重试或切换厂商 |
| 主题为空 | 输入框红色抖动 + 提示文字 |
| AI 返回格式异常 | 自动尝试容错解析，失败则提示重试 |

---

## 核心设计思路

### AI 调用

项目使用 OpenAI SDK 的**兼容模式**对接各大模型厂商。后端 API Route（`app/api/generate/route.ts`）接收前端传来的配置参数，用用户的 API Key 创建客户端完成调用，Key 用后即焚。

### Prompt 设计

- **System Prompt**：将 AI 定位为「顶尖内容营销专家」，注入 5 个平台的用户画像和语气特点，要求纯 JSON 输出
- **User Prompt**：动态注入主题、平台、内容类型和风格分配表，指定每个 Hook 对应一个风格
- **风格分配**：前端勾选 N 种风格 → 后端按 `[base, base+1]` 轮询分配凑满 10 条
- **容错解析**：自动剥离 markdown 代码块包裹、清洗末尾逗号等常见 JSON 格式异常

### 数据流

```
用户输入 → 前端状态 (useHookLab) → POST /api/generate
→ OpenAI SDK 调用大模型 → 解析 JSON
→ 返回 10 条 HookItem[] → 渲染 ResultsGrid
→ 写入 localStorage（历史记录）
```

---

## 部署到 Vercel

```bash
npm i -g vercel
vercel
```

按提示完成部署。部署后用户需自行在浏览器中配置 API Key（设置面板）。

---

## 开发命令

```bash
npm run dev      # 开发服务器（端口 3001）
npm run build    # 生产构建
npm run start    # 生产启动
npm run lint     # ESLint 检查
```

---

## 后续计划

- [ ] 支持自定义风格（用户可自行创建新风格）
- [ ] Hook 结果导出（复制全部 / 导出文本文件）
- [ ] 一键重新生成单条 Hook
- [ ] 支持更多的国外内容平台
- [ ] 生成历史搜索 / 筛选
- [ ] 深色/浅色模式切换
- [ ] PWA 离线支持

---

## License

MIT
