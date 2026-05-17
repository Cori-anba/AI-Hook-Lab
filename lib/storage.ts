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

export function removeFavorite(content: string): void {
  const favorites = getFavorites();
  const filtered = favorites.filter((f) => f.content !== content);
  saveFavorites(filtered);
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

export function removeHistory(id: string): void {
  const history = getHistory();
  const filtered = history.filter((h) => h.id !== id);
  safeSet(STORAGE_KEYS.HISTORY, filtered);
}
