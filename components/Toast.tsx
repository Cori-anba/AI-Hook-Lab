// components/Toast.tsx

'use client';

import { ToastMessage } from '@/lib/types';

interface ToastProps {
  toasts: ToastMessage[];
  onRemove: (id: number) => void;
}

export default function Toast({ toasts, onRemove }: ToastProps) {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex flex-col gap-2 items-center pointer-events-none">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          onClick={() => onRemove(toast.id)}
          className={`pointer-events-auto px-5 py-3 rounded-xl text-sm font-medium shadow-lg backdrop-blur-sm cursor-pointer
            transition-all duration-300 animate-[slideUp_0.3s_ease-out]
            ${toast.type === 'success' ? 'bg-emerald-500/20 border border-emerald-500/30 text-emerald-300' : ''}
            ${toast.type === 'error' ? 'bg-red-500/20 border border-red-500/30 text-red-300' : ''}
            ${toast.type === 'info' ? 'bg-sky-500/20 border border-sky-500/30 text-sky-300' : ''}
          `}
        >
          {toast.text}
        </div>
      ))}
    </div>
  );
}
