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
    <div className="min-h-screen bg-coffee-950 flex flex-col items-center justify-center p-6 text-center relative overflow-hidden">
      {/* Background Ornaments */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-coffee-800/30 rounded-full blur-3xl" />
      <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-warm-900/20 rounded-full blur-3xl" />

      {/* Glassmorphism Card */}
      <div className="relative z-10 bg-coffee-900/40 backdrop-blur-xl border border-coffee-800/50 p-10 md:p-14 rounded-[3rem] shadow-2xl max-w-2xl w-full flex flex-col items-center">
        <div className="w-24 h-24 bg-red-500/10 border border-red-500/20 rounded-[2.5rem] flex items-center justify-center mb-8 animate-bounce-slow shadow-inner">
          <AlertTriangle size={48} className="text-red-400 drop-shadow-[0_0_15px_rgba(248,113,113,0.5)]" />
        </div>

        <h1 className="text-4xl md:text-5xl font-display font-black text-cream-50 mb-4 tracking-tight drop-shadow-md">
          Sistem Oleng! 😵‍💫
        </h1>

        <p className="text-coffee-300 max-w-md mx-auto mb-10 leading-relaxed text-lg">
          Koneksi atau sistem lagi ngadat nih. Tenang, kopinya jangan ditumpahin dulu. Coba klik tombol di bawah buat nge-reset aplikasinya.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 w-full justify-center">
          <button
            onClick={() => reset()}
            className="px-8 py-4 bg-cream-500 hover:bg-cream-400 text-coffee-950 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all duration-300 active:scale-95 shadow-[0_0_20px_rgba(212,196,173,0.3)] hover:shadow-[0_0_30px_rgba(212,196,173,0.5)]"
          >
            <RefreshCcw size={20} className="animate-spin-slow" />
            Coba Lagi
          </button>

          <Link
            href="/"
            className="px-8 py-4 bg-coffee-900/50 hover:bg-coffee-800 text-cream-200 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all duration-300 active:scale-95 border border-coffee-700/50 hover:border-coffee-600 backdrop-blur-md"
          >
            <Home size={20} />
            Balik ke Beranda
          </Link>
        </div>

        <div className="mt-12 pt-6 border-t border-coffee-800/50 w-full max-w-sm">
          <p className="text-[10px] text-coffee-500 font-mono uppercase tracking-widest bg-coffee-950/50 px-3 py-2 rounded-lg inline-block border border-coffee-800/30">
            Error Log: {error.digest || error.message || 'Unknown Stack'}
          </p>
        </div>
      </div>
    </div>
  );
}
