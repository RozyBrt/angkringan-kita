'use client';

import { useEffect, useState } from 'react';
import { MenuItem, Category } from '@/types';
import { supabase } from '@/lib/supabase';
import MenuCard from '@/components/MenuCard';
import { Coffee, Flame, UtensilsCrossed, Search } from 'lucide-react';

const CATEGORIES: { label: string; value: Category | 'Semua'; icon: React.ReactNode }[] = [
  { label: 'Semua', value: 'Semua', icon: <Flame size={15} /> },
  { label: 'Minuman', value: 'Minuman', icon: <Coffee size={15} /> },
  { label: 'Cemilan', value: 'Cemilan', icon: <UtensilsCrossed size={15} /> },
  { label: 'Makanan', value: 'Makanan', icon: <UtensilsCrossed size={15} /> },
];

export default function MenuPage() {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<Category | 'Semua'>('Semua');
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchMenu() {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('menu_items')
          .select('*')
          .order('category')
          .order('name');

        if (error) throw error;
        setMenuItems(data ?? []);
      } catch (err) {
        setError('Gagal memuat menu. Coba refresh halaman ya!');
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchMenu();
  }, []);

  const filtered = menuItems.filter((item) => {
    const matchCategory = selectedCategory === 'Semua' || item.category === selectedCategory;
    const matchSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        item.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCategory && matchSearch;
  });

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Hero */}
      <div className="text-center mb-10">
        <div className="inline-flex items-center gap-2 bg-coffee-100 text-coffee-700 
                        px-4 py-1.5 rounded-full text-sm font-medium mb-4">
          <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse-soft" />
          Buka Sekarang
        </div>
        <h1 className="font-display text-4xl sm:text-5xl font-bold text-coffee-900 mb-3">
          Menu Hari Ini
        </h1>
        <p className="text-coffee-500 text-base max-w-sm mx-auto leading-relaxed">
          Pilih yang kamu suka, pesan langsung, dan nikmati selagi hangat ☕
        </p>
      </div>

      {/* Search */}
      <div className="relative mb-5">
        <Search size={17} className="absolute left-4 top-1/2 -translate-y-1/2 text-coffee-400" />
        <input
          id="menu-search"
          type="text"
          placeholder="Cari menu..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="input-field pl-11"
        />
      </div>

      {/* Category filter */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-7 no-scrollbar">
        {CATEGORIES.filter((cat) => {
          if (cat.value === 'Semua') return true;
          return menuItems.some((item) => item.category === cat.value);
        }).map((cat) => (
          <button
            key={cat.value}
            id={`category-${cat.value}`}
            onClick={() => setSelectedCategory(cat.value)}
            className={`category-chip flex items-center gap-1.5 ${
              selectedCategory === cat.value
                ? 'category-chip-active'
                : 'category-chip-inactive'
            }`}
          >
            {cat.icon}
            {cat.label}
          </button>
        ))}
      </div>

      {/* Error state */}
      {error && (
        <div className="text-center py-16 text-coffee-500">
          <p className="text-4xl mb-3">😕</p>
          <p className="font-semibold">{error}</p>
        </div>
      )}

      {/* Loading skeleton */}
      {loading && !error && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="card overflow-hidden animate-fade-in">
              <div className="skeleton h-44 w-full" />
              <div className="p-4 space-y-2">
                <div className="skeleton h-4 w-3/4 rounded-full" />
                <div className="skeleton h-3 w-full rounded-full" />
                <div className="skeleton h-3 w-2/3 rounded-full" />
                <div className="flex justify-between items-center pt-1">
                  <div className="skeleton h-5 w-20 rounded-full" />
                  <div className="skeleton h-9 w-24 rounded-xl" />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Menu grid */}
      {!loading && !error && (
        <>
          {filtered.length === 0 ? (
            <div className="text-center py-20 text-coffee-400">
              <p className="text-5xl mb-4">🍃</p>
              <p className="font-semibold text-lg text-coffee-600">Belum ada menu di sini</p>
              <p className="text-sm mt-1">Coba pilih kategori atau kata kunci yang lain</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filtered.map((item) => (
                <MenuCard key={item.id} item={item} />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
