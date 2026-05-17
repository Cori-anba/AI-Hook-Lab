// components/HookCard.tsx

'use client';

import { HookItem } from '@/lib/types';

interface HookCardProps {
  hook: HookItem;
  isFavorited: boolean;
  onCopy: (content: string) => void;
  onToggleFavorite: (hook: HookItem) => void;
  index: number;
}

export default function HookCard({ hook, isFavorited, onCopy, onToggleFavorite, index }: HookCardProps) {
  return (
    <div
      className="bg-[#14141f] border border-white/[0.07] rounded-xl p-4
                 hover:border-purple-500/20 transition-all duration-300
                 animate-[fadeIn_0.4s_ease-out]"
      style={{ animationDelay: `${index * 80}ms`, animationFillMode: 'backwards' }}
    >
      <div className="flex gap-3">
        {/* 评分 */}
        <div className="flex-shrink-0 text-center w-12">
          <div className="text-2xl font-extrabold bg-gradient-to-b from-purple-400 to-cyan-400 bg-clip-text text-transparent">
            {hook.score.toFixed(1)}
          </div>
          <div className="text-[10px] text-zinc-600 mt-0.5">点击欲</div>
        </div>

        {/* 内容 */}
        <div className="flex-1 min-w-0">
          <p className="text-sm text-zinc-200 leading-relaxed mb-2">
            {hook.content}
          </p>
          <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-medium
                           bg-purple-500/10 text-purple-300 border border-purple-500/20">
            {hook.style}
          </span>

          <p className="text-xs text-zinc-600 mt-2 leading-relaxed">
            💡 {hook.reason}
          </p>

          {/* 操作 */}
          <div className="flex gap-3 mt-3 pt-2 border-t border-white/5">
            <button
              onClick={() => onCopy(hook.content)}
              className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors flex items-center gap-1"
            >
              📋 复制
            </button>
            <button
              onClick={() => onToggleFavorite(hook)}
              className={`text-xs transition-colors flex items-center gap-1
                ${isFavorited ? 'text-amber-400' : 'text-zinc-500 hover:text-amber-400'}`}
            >
              ⭐ {isFavorited ? '已收藏' : '收藏'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
