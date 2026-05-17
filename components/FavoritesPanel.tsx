// components/FavoritesPanel.tsx

'use client';

import { HookItem } from '@/lib/types';

interface FavoritesPanelProps {
  favorites: HookItem[];
  onCopy: (content: string) => void;
}

export default function FavoritesPanel({ favorites, onCopy }: FavoritesPanelProps) {
  return (
    <div className="bg-[#14141f] border border-white/[0.07] rounded-xl p-3">
      <h3 className="text-xs font-semibold text-zinc-300 mb-2 flex items-center gap-1.5">
        <span className="text-amber-400">⭐</span> 收藏
        {favorites.length > 0 && (
          <span className="text-[10px] text-zinc-600 ml-auto">{favorites.length}</span>
        )}
      </h3>

      {favorites.length === 0 ? (
        <p className="text-xs text-zinc-700 text-center py-3">暂无收藏</p>
      ) : (
        <div className="space-y-2 max-h-64 overflow-y-auto custom-scrollbar">
          {favorites.map((item) => (
            <div
              key={item.id}
              className="bg-white/[0.02] border border-white/[0.04] rounded-lg p-2.5 group cursor-pointer
                         hover:border-purple-500/20 transition-all"
              onClick={() => onCopy(item.content)}
            >
              <p className="text-xs text-zinc-400 leading-relaxed line-clamp-2">{item.content}</p>
              <div className="flex items-center gap-1 mt-1.5">
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-purple-500/10 text-purple-400">
                  {item.style}
                </span>
                <span className="text-[10px] text-zinc-600 ml-auto">
                  {item.score.toFixed(1)}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
