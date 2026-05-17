// app/layout.tsx

import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'AI Hook Lab - AI 爆款文案 Hook 生成器',
  description: '输入主题，选择平台和内容类型，AI 一键生成 10 个不同风格的爆款开头 Hook',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN">
      <body className="bg-[#0a0a0f] text-white antialiased min-h-screen">
        {children}
      </body>
    </html>
  );
}
