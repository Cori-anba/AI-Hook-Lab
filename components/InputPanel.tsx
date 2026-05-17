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
