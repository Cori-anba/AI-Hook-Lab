// hooks/useHookLab.ts

'use client';

import { useState, useCallback, useEffect } from 'react';
import { HookItem, HistoryGroup, AppSettings, ToastMessage } from '@/lib/types';
import { DEFAULT_SETTINGS, type PlatformKey, type ContentTypeKey, type StyleKey } from '@/lib/constants';
import { getSettings, saveSettings, getFavorites, toggleFavorite, removeFavorite, getHistory, addHistory, removeHistory } from '@/lib/storage';

let toastIdCounter = 0;

export function useHookLab() {
  // 输入状态
  const [topic, setTopic] = useState('');
  const [platform, setPlatform] = useState<PlatformKey>('xiaohongshu');
  const [contentType, setContentType] = useState<ContentTypeKey>('video');
  const [selectedStyles, setSelectedStyles] = useState<StyleKey[]>([
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

  // 删除收藏
  const handleDeleteFavorite = useCallback((content: string) => {
    removeFavorite(content);
    setFavorites(getFavorites());
    showToast('已删除收藏', 'info');
  }, [showToast]);

  // 删除历史记录
  const handleDeleteHistory = useCallback((id: string) => {
    removeHistory(id);
    setHistory(getHistory());
    showToast('已删除记录', 'info');
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
    favorites, handleToggleFavorite, handleDeleteFavorite,
    isFavorite: (content: string) => favorites.some((f) => f.content === content),
    // 历史
    history, viewHistory, handleDeleteHistory,
    // Toast
    toasts, removeToast,
    // 操作
    generate, copyHook,
  };
}
