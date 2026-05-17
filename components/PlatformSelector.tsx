// components/PlatformSelector.tsx

'use client';

import { PLATFORMS } from '@/lib/constants';

interface PlatformSelectorProps {
  value: string;
  onChange: (v: string) => void;
}

export default function PlatformSelector({ value, onChange }: PlatformSelectorProps) {
  return (
    <div className="mb-4">
      <span className="text-xs text-zinc-500 mr-3">平台</span>
      <div className="inline-flex flex-wrap gap-2">
        {PLATFORMS.map((p) => (
          <button
            key={p.key}
            onClick={() => onChange(p.key)}
            className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all duration-200
              ${value === p.key
                ? 'bg-purple-500/15 border border-purple-500/30 text-purple-300'
                : 'bg-white/[0.03] border border-white/5 text-zinc-500 hover:border-white/15 hover:text-zinc-400'
              }`}
          >
            {p.label}
          </button>
        ))}
      </div>
    </div>
  );
}
