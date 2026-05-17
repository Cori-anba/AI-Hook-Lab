// lib/types.ts

import type { PlatformKey, ContentTypeKey, StyleKey } from './constants';

/** 单条 Hook 结果 */
export interface HookItem {
  id: string;
  content: string;   // Hook 文案
  style: string;      // 风格标签（对应 StyleKey）
  score: number;      // 点击欲评分 0.0-10.0
  reason: string;     // 推荐理由
}

/** 一次生成的历史记录 */
export interface HistoryGroup {
  id: string;
  topic: string;
  platform: PlatformKey;
  contentType: ContentTypeKey;
  selectedStyles: StyleKey[];
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
  platform: PlatformKey;
  contentType: ContentTypeKey;
  styles: StyleKey[];
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
