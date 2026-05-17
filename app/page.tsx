// app/page.tsx

'use client';

import { useHookLab } from '@/hooks/useHookLab';
import type { PlatformKey, ContentTypeKey, StyleKey } from '@/lib/constants';
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
          onPlatformChange={(v) => hookLab.setPlatform(v as PlatformKey)}
          contentType={hookLab.contentType}
          onContentTypeChange={(v) => hookLab.setContentType(v as ContentTypeKey)}
          selectedStyles={hookLab.selectedStyles}
          onStylesChange={(v) => hookLab.setSelectedStyles(v as StyleKey[])}
          isGenerating={hookLab.isGenerating}
          onGenerate={hookLab.generate}
          topicError={hookLab.error === '请输入主题'}
        />

        {/* 错误提示 */}
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
