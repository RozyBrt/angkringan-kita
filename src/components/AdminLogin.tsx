'use client';

import { useState, FormEvent } from 'react';
import { supabase } from '@/lib/supabase';
import { Lock, LogIn, Coffee } from 'lucide-react';

interface AdminLoginProps {
  onLoginSuccess: () => void;
}

export default function AdminLogin({ onLoginSuccess }: AdminLoginProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleLogin(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      setError('Email atau password salah. Coba lagi ya!');
      setLoading(false);
    } else {
      onLoginSuccess();
    }
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12">
      <div className="w-full max-w-sm">
        {/* Icon */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-coffee-800 
                          rounded-2xl text-cream-100 mb-4">
            <Coffee size={28} />
          </div>
          <h1 className="font-display text-2xl font-bold text-cream-100">Login Admin</h1>
          <p className="text-coffee-400 text-sm mt-1">Masuk untuk kelola pesanan</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label
              htmlFor="admin-email"
              className="block text-sm font-medium text-coffee-300 mb-1.5"
            >
              Email
            </label>
            <input
              id="admin-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@example.com"
              required
              autoComplete="email"
              className="w-full px-4 py-3 rounded-xl bg-coffee-800 border border-coffee-700
                         text-cream-100 placeholder-coffee-500 focus:outline-none 
                         focus:ring-2 focus:ring-coffee-500 focus:border-transparent
                         transition-all duration-200"
            />
          </div>

          <div>
            <label
              htmlFor="admin-password"
              className="block text-sm font-medium text-coffee-300 mb-1.5"
            >
              Password
            </label>
            <div className="relative">
              <Lock
                size={15}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-coffee-500"
              />
              <input
                id="admin-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                autoComplete="current-password"
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-coffee-800 border border-coffee-700
                           text-cream-100 placeholder-coffee-500 focus:outline-none 
                           focus:ring-2 focus:ring-coffee-500 focus:border-transparent
                           transition-all duration-200"
              />
            </div>
          </div>

          {error && (
            <div className="bg-red-900/40 border border-red-800/60 text-red-300 
                            rounded-xl px-4 py-3 text-sm">
              {error}
            </div>
          )}

          <button
            id="admin-login-btn"
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-3 px-5
                       bg-coffee-500 hover:bg-coffee-400 text-white font-semibold 
                       rounded-xl transition-all duration-200 active:scale-95
                       disabled:opacity-50 disabled:cursor-not-allowed mt-2"
          >
            {loading ? (
              <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <LogIn size={16} />
                Masuk
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
