// components/SettingsModal.tsx

'use client';

import { useState } from 'react';
import { AppSettings } from '@/lib/types';
import { PRESET_PROVIDERS } from '@/lib/constants';

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
