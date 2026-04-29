'use client';

import { useEffect } from 'react';
import { RefreshCcw, Home, AlertTriangle } from 'lucide-react';
import Link from 'next/link';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log error ke console atau service monitoring (Sentry, etc)
    console.error('Crash Massal:', error);
  }, [error]);

  return (
    <div className="min-h-screen bg-coffee-950 flex flex-col items-center justify-center p-6 text-center">
      <div className="w-24 h-24 bg-red-500/10 border border-red-500/20 rounded-[2.5rem] flex items-center justify-center mb-8 animate-bounce-slow">
        <AlertTriangle size={48} className="text-red-500" />
      </div>

      <h1 className="text-4xl md:text-5xl font-display font-bold text-cream-50 mb-4">
        Waduh, Sistem Oleng bray! 😵‍💫
      </h1>
      
      <p className="text-coffee-400 max-w-md mx-auto mb-10 leading-relaxed">
        Sepertinya ada masalah teknis yang bikin aplikasi kita kaget. Tenang bray, kopinya jangan ditumpahin dulu. Coba klik tombol di bawah buat nyegerin suasana.
      </p>

      <div className="flex flex-col sm:flex-row gap-4">
        <button
          onClick={() => reset()}
          className="px-8 py-4 bg-cream-500 hover:bg-cream-400 text-coffee-950 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all active:scale-95 shadow-xl shadow-cream-500/10"
        >
          <RefreshCcw size={20} />
          Coba Lagi
        </button>
        
        <Link
          href="/"
          className="px-8 py-4 bg-coffee-900 hover:bg-coffee-800 text-cream-200 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all active:scale-95 border border-coffee-800"
        >
          <Home size={20} />
          Balik ke Beranda
        </Link>
      </div>

      <div className="mt-16 pt-8 border-t border-coffee-900 w-full max-w-xs">
        <p className="text-[10px] text-coffee-600 font-mono uppercase tracking-widest">
          Error Log: {error.digest || 'Unknown Stack'}
        </p>
      </div>
    </div>
  );
}
