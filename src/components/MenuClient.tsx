'use client';

import { useState, useEffect } from 'react';
import { MenuItem, Category } from '@/types';
import { supabase } from '@/lib/supabase';
import MenuCard from '@/components/MenuCard';
import { Coffee, Flame, UtensilsCrossed, Search } from 'lucide-react';
import { ShopStatus } from '@/lib/actions/settings';

const CATEGORIES: { label: string; value: Category | 'Semua'; icon: React.ReactNode }[] = [
  { label: 'Semua', value: 'Semua', icon: <Flame size={15} /> },
  { label: 'Minuman', value: 'Minuman', icon: <Coffee size={15} /> },
  { label: 'Cemilan', value: 'Cemilan', icon: <UtensilsCrossed size={15} /> },
  { label: 'Makanan', value: 'Makanan', icon: <UtensilsCrossed size={15} /> },
];

interface MenuClientProps {
  initialMenuItems: MenuItem[];
  initialShopStatus: ShopStatus;
}

export default function MenuClient({ initialMenuItems, initialShopStatus }: MenuClientProps) {
  const [menuItems, setMenuItems] = useState<MenuItem[]>(initialMenuItems);
  const [selectedCategory, setSelectedCategory] = useState<Category | 'Semua'>('Semua');
  const [searchQuery, setSearchQuery] = useState('');
  const [isOpen, setIsOpen] = useState<boolean>(() => {
    // Hitung status buka saat init berdasarkan data dari server
    if (initialShopStatus === 'open') return true;
    if (initialShopStatus === 'closed') return false;
    // Mode AUTO: Ikutin jadwal jam (17:00 - 23:00)
    const hours = new Date().getHours();
    return hours >= 17 && hours <= 23;
  });

  useEffect(() => {
    // REAL-TIME: Dengerin perubahan di tabel menu_items
    const menuChannel = supabase
      .channel('realtime_menu')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'menu_items' },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setMenuItems((prev) => [...prev, payload.new as MenuItem].sort((a, b) => a.name.localeCompare(b.name)));
          } else if (payload.eventType === 'UPDATE') {
            setMenuItems((prev) =>
              prev.map((item) => (item.id === payload.new.id ? (payload.new as MenuItem) : item))
            );
          } else if (payload.eventType === 'DELETE') {
            setMenuItems((prev) => prev.filter((item) => item.id !== payload.old.id));
          }
        }
      )
      .subscribe();

    // REAL-TIME: Dengerin perubahan status toko bray!
    const settingsChannel = supabase
      .channel('realtime_settings')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'shop_settings' },
        (payload) => {
          const newData = payload.new as { key: string, value: string };
          if (newData && newData.key === 'shop_status') {
            const newStatus = newData.value as ShopStatus;
            if (newStatus === 'open') {
              setIsOpen(true);
            } else if (newStatus === 'closed') {
              setIsOpen(false);
            } else {
              const now = new Date();
              setIsOpen(now.getHours() >= 17 && now.getHours() <= 23);
            }
          }
        }
      )
      .subscribe();

    // Re-check status tiap 1 menit bray (buat jaga-jaga jadwal AUTO)
    // Status 'open'/'closed' dari server akan masuk via Realtime di atas
    // interval ini sebagai safety net kalau Realtime lambat
    const interval = setInterval(() => {
      // intentionally empty — Realtime handles status changes
    }, 60000);

    return () => {
      supabase.removeChannel(menuChannel);
      supabase.removeChannel(settingsChannel);
      clearInterval(interval);
    };
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
      <div className="relative rounded-3xl bg-coffee-900 overflow-hidden mb-10 shadow-xl border border-coffee-800">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=800&q=80')] bg-cover bg-center opacity-20 mix-blend-overlay"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-coffee-900 to-transparent"></div>
        <div className="relative p-8 md:p-12 text-center flex flex-col items-center">
          <div className={`inline-flex items-center gap-2 border px-4 py-1.5 rounded-full text-sm font-medium mb-4 backdrop-blur-sm ${
            isOpen
              ? 'bg-warm-500/20 text-warm-200 border-warm-500/30'
              : 'bg-red-500/20 text-red-200 border-red-500/30'
          }`}>
            <span className={`w-2 h-2 rounded-full ${isOpen ? 'bg-green-400 animate-pulse-soft' : 'bg-red-400'}`} />
            {isOpen ? 'Kami Buka Sekarang' : 'Tutup Sementara'}
          </div>
          <h1 className="font-display text-4xl sm:text-5xl md:text-6xl font-bold text-cream-50 mb-3 drop-shadow-md">
            Selamat Datang di <span className="text-warm-400">Angkringan Kita</span>
          </h1>
          <p className="text-coffee-200 text-base md:text-lg max-w-md mx-auto leading-relaxed mt-2 text-shadow-sm">
            Tempat di mana rasa otentik bertemu dengan kehangatan. Pilih menu favoritmu dan pesan sekarang juga! ☕🍢
          </p>
        </div>
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

      {/* "Tutup" Banner */}
      {!isOpen && (
        <div className="mb-8 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center gap-3 animate-fade-in">
          <span className="text-2xl">🌙</span>
          <div>
            <p className="text-red-200 font-bold text-sm">Maaf, Kami Sedang Tutup</p>
            <p className="text-red-300/70 text-xs">Menu tetap bisa dilihat, tapi pemesanan sedang dinonaktifkan sementara.</p>
          </div>
        </div>
      )}

      {/* Menu grid */}
      {filtered.length === 0 ? (
        <div className="text-center py-20 text-coffee-400">
          <p className="text-5xl mb-4">🍃</p>
          <p className="font-semibold text-lg text-coffee-600">Belum ada menu di sini</p>
          <p className="text-sm mt-1">Coba pilih kategori atau kata kunci yang lain</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((item) => (
            <MenuCard key={item.id} item={item} isShopOpen={isOpen} />
          ))}
        </div>
      )}
    </div>
  );
}
