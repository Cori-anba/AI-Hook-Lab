// components/TopicInput.tsx

'use client';

interface TopicInputProps {
  value: string;
  onChange: (v: string) => void;
  hasError: boolean;
}

export default function TopicInput({ value, onChange, hasError }: TopicInputProps) {
  return (
    <div className="mb-4">
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="输入你的主题，例如：如何做好时间管理..."
        className={`w-full bg-[#0a0a14] border rounded-xl px-4 py-3.5 text-sm text-white
                   placeholder:text-zinc-600 focus:outline-none focus:border-purple-500/50
                   transition-all duration-200
                   ${hasError
                     ? 'border-red-500/50 animate-[shake_0.4s_ease-in-out]'
                     : 'border-white/10'
                   }`}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            const btn = document.getElementById('generate-btn');
            btn?.click();
          }
        }}
      />
      {hasError && (
        <p className="text-red-400 text-xs mt-1.5 ml-1">请输入主题</p>
      )}
    </div>
  );
}
