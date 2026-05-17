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

  if (isGenerating) {
    return (
      <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-3 content-start">
        {Array.from({ length: 10 }).map((_, i) => (
          <SkeletonCard key={i} index={i} />
        ))}
      </div>
    );
  }

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
