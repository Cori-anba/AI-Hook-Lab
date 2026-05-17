// components/ContentTypeSelector.tsx

'use client';

import { CONTENT_TYPES } from '@/lib/constants';

interface ContentTypeSelectorProps {
  value: string;
  onChange: (v: string) => void;
}

export default function ContentTypeSelector({ value, onChange }: ContentTypeSelectorProps) {
  return (
    <div className="mb-4">
      <span className="text-xs text-zinc-500 mr-3">类型</span>
      <div className="inline-flex flex-wrap gap-2">
        {CONTENT_TYPES.map((ct) => (
          <button
            key={ct.key}
            onClick={() => onChange(ct.key)}
            className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all duration-200
              ${value === ct.key
                ? 'bg-cyan-500/15 border border-cyan-500/30 text-cyan-300'
                : 'bg-white/[0.03] border border-white/5 text-zinc-500 hover:border-white/15 hover:text-zinc-400'
              }`}
          >
            {ct.label}
          </button>
        ))}
      </div>
    </div>
  );
}
