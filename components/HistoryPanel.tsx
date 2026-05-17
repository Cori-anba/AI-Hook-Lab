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
