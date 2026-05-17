// components/Sidebar.tsx

'use client';

import { useState } from 'react';
import { HookItem, HistoryGroup } from '@/lib/types';
import FavoritesPanel from './FavoritesPanel';
import HistoryPanel from './HistoryPanel';

interface SidebarProps {
  favorites: HookItem[];
  history: HistoryGroup[];
  onCopy: (content: string) => void;
  onViewHistory: (group: HistoryGroup) => void;
  onDeleteFavorite: (content: string) => void;
  onDeleteHistory: (id: string) => void;
}

export default function Sidebar({ favorites, history, onCopy, onViewHistory, onDeleteFavorite, onDeleteHistory }: SidebarProps) {
  const [activeTab, setActiveTab] = useState<'favorites' | 'history'>('favorites');

  return (
    <>
      {/* 移动端 Tab 切换 */}
      <div className="flex md:hidden gap-2 mb-4">
        <button
          onClick={() => setActiveTab('favorites')}
          className={`flex-1 py-2 rounded-lg text-xs font-medium transition-all
            ${activeTab === 'favorites'
              ? 'bg-purple-500/15 border border-purple-500/30 text-purple-300'
              : 'bg-[#14141f] border border-white/5 text-zinc-500'
            }`}
        >
          ⭐ 收藏 ({favorites.length})
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`flex-1 py-2 rounded-lg text-xs font-medium transition-all
            ${activeTab === 'history'
              ? 'bg-cyan-500/15 border border-cyan-500/30 text-cyan-300'
              : 'bg-[#14141f] border border-white/5 text-zinc-500'
            }`}
        >
          🕐 历史 ({history.length})
        </button>
      </div>

      {/* 移动端面板 */}
      <div className="md:hidden mb-4">
        {activeTab === 'favorites' ? (
          <FavoritesPanel favorites={favorites} onCopy={onCopy} onDelete={onDeleteFavorite} />
        ) : (
          <HistoryPanel history={history} onView={onViewHistory} onDelete={onDeleteHistory} />
        )}
      </div>

      {/* 桌面端竖列侧边栏 */}
      <aside className="hidden md:flex md:flex-col md:gap-3 md:w-48 md:flex-shrink-0">
        <FavoritesPanel favorites={favorites} onCopy={onCopy} onDelete={onDeleteFavorite} />
        <HistoryPanel history={history} onView={onViewHistory} onDelete={onDeleteHistory} />
      </aside>
    </>
  );
}
