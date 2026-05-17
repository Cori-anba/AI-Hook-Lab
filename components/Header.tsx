// components/Header.tsx

'use client';

interface HeaderProps {
  onOpenSettings: () => void;
}

export default function Header({ onOpenSettings }: HeaderProps) {
  return (
    <header className="flex items-center gap-3 pb-5 border-b border-white/5">
      <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-purple-500 to-cyan-400 flex items-center justify-center">
        <span className="text-white font-bold text-sm">H</span>
      </div>
      <h1 className="text-xl font-bold tracking-tight text-white">
        AI Hook Lab
      </h1>
      <span className="text-xs text-zinc-600 bg-white/5 px-2 py-0.5 rounded-full">
        Beta
      </span>
      <button
        onClick={onOpenSettings}
        className="ml-auto px-4 py-2 rounded-lg border border-white/10 text-sm text-zinc-400
                   hover:border-white/20 hover:text-zinc-200 transition-all duration-200"
      >
        ⚙ 设置
      </button>
    </header>
  );
}
