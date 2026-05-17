// components/StyleSelector.tsx

'use client';

import { STYLE_POOL } from '@/lib/constants';

interface StyleSelectorProps {
  selected: string[];
  onChange: (styles: string[]) => void;
}

export default function StyleSelector({ selected, onChange }: StyleSelectorProps) {
  const toggle = (key: string) => {
    if (selected.includes(key)) {
      onChange(selected.filter((s) => s !== key));
    } else {
      onChange([...selected, key]);
    }
  };

  const selectAll = () => onChange(STYLE_POOL.map((s) => s.key));
  const deselectAll = () => onChange([]);

  return (
    <div className="mb-4">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-xs text-zinc-500">风格</span>
        <button onClick={selectAll} className="text-xs text-zinc-600 hover:text-zinc-400 transition-colors">
          全选
        </button>
        <button onClick={deselectAll} className="text-xs text-zinc-600 hover:text-zinc-400 transition-colors">
          清空
        </button>
        <span className="text-xs text-zinc-700 ml-auto">
          已选 {selected.length}/{STYLE_POOL.length}
        </span>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {STYLE_POOL.map((s) => {
          const isSelected = selected.includes(s.key);
          return (
            <button
              key={s.key}
              onClick={() => toggle(s.key)}
              title={s.desc}
              className={`px-3 py-1.5 rounded-full text-xs transition-all duration-200
                ${isSelected
                  ? 'bg-purple-500/15 border border-purple-500/30 text-purple-300'
                  : 'bg-white/[0.03] border border-white/5 text-zinc-600 hover:border-white/10'
                }`}
            >
              {s.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
