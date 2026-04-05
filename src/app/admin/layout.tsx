import { ReactNode } from 'react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Admin — Angkringan Kita',
  description: 'Dashboard admin untuk mengelola pesanan masuk.',
  robots: 'noindex, nofollow',
};

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-coffee-950">
      <div className="bg-coffee-900 border-b border-coffee-800">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center gap-3">
          <span className="text-xl">⚙️</span>
          <span className="font-display text-cream-100 font-semibold text-lg">
            Admin Panel
          </span>
          <span className="text-coffee-500 text-sm">— Angkringan Kita</span>
        </div>
      </div>
      <div className="max-w-5xl mx-auto px-4">{children}</div>
    </div>
  );
}
