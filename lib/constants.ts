// lib/constants.ts

import type { AppSettings } from './types';

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

export type PlatformKey = (typeof PLATFORMS)[number]['key'];
export type ContentTypeKey = (typeof CONTENT_TYPES)[number]['key'];
export type StyleKey = (typeof STYLE_POOL)[number]['key'];

export const STORAGE_KEYS = {
  SETTINGS: 'ai-hook-lab-settings',
  FAVORITES: 'ai-hook-lab-favorites',
  HISTORY: 'ai-hook-lab-history',
} as const;

export const DEFAULT_SETTINGS = {
  apiKey: '',
  baseUrl: 'https://api.deepseek.com/v1',
  model: 'deepseek-v4-flash',
} as const satisfies AppSettings;

export const PRESET_PROVIDERS = [
  { label: 'DeepSeek', baseUrl: 'https://api.deepseek.com/v1', model: 'deepseek-v4-flash' },
  { label: '智谱清言', baseUrl: 'https://open.bigmodel.cn/api/paas/v4', model: 'glm-4-flash' },
  { label: '通义千问', baseUrl: 'https://dashscope.aliyuncs.com/compatible-mode/v1', model: 'qwen-plus' },
  { label: 'OpenAI', baseUrl: 'https://api.openai.com/v1', model: 'gpt-4o' },
  { label: '自定义', baseUrl: '', model: '' },
] as const;
