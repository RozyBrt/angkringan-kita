'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ShoppingCart, Coffee } from 'lucide-react';
import { useCart } from '@/hooks/useCart';
import { useState, useEffect } from 'react';

export default function Navbar() {
  const pathname = usePathname();
  const { itemCount } = useCart();
  const [scrolled, setScrolled] = useState(false);
  const [bouncing, setBouncing] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (itemCount > 0) {
      setBouncing(true);
      const t = setTimeout(() => setBouncing(false), 400);
      return () => clearTimeout(t);
    }
  }, [itemCount]);

  const isAdmin = pathname?.startsWith('/admin');

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-white/90 backdrop-blur-md shadow-md border-b border-cream-100'
          : 'bg-cream-50/80 backdrop-blur-sm'
      }`}
    >
      <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link
          href="/"
          className="flex items-center gap-2 group"
          aria-label="Angkringan Kita - Halaman Utama"
        >
          <span className="p-1.5 bg-coffee-700 rounded-xl text-cream-50 group-hover:bg-coffee-800 transition-colors">
            <Coffee size={18} strokeWidth={2.5} />
          </span>
          <span className="font-display font-semibold text-coffee-900 text-lg leading-none">
            Angkringan<br />
            <span className="text-coffee-500 text-sm font-normal">Kita ☕</span>
          </span>
        </Link>

        {/* Nav links */}
        <div className="flex items-center gap-2">
          {!isAdmin && (
            <Link
              href="/"
              className={`hidden sm:flex px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                pathname === '/'
                  ? 'text-coffee-800 bg-coffee-100'
                  : 'text-coffee-600 hover:text-coffee-800 hover:bg-cream-100'
              }`}
            >
              Menu
            </Link>
          )}

          {!isAdmin && (
            <Link
              href="/cart"
              id="cart-button"
              className={`relative flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-semibold transition-all duration-200 ${
                pathname === '/cart'
                  ? 'bg-coffee-700 text-cream-50 shadow-md'
                  : 'bg-white text-coffee-700 border border-coffee-200 hover:bg-coffee-50'
              }`}
            >
              <ShoppingCart size={17} />
              <span className="hidden sm:inline">Keranjang</span>
              {itemCount > 0 && (
                <span
                  className={`absolute -top-2 -right-2 min-w-[20px] h-5 flex items-center justify-center
                    bg-warm-500 text-white text-xs font-bold rounded-full px-1
                    ${bouncing ? 'animate-bounce-once' : ''}`}
                >
                  {itemCount}
                </span>
              )}
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
