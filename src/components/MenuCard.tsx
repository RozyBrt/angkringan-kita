'use client';

import Image from 'next/image';
import { Plus, ImageOff } from 'lucide-react';
import { MenuItem } from '@/types';
import { useCart } from '@/hooks/useCart';
import { formatPrice } from '@/lib/cart';
import { useState } from 'react';

interface MenuCardProps {
  item: MenuItem;
}

export default function MenuCard({ item }: MenuCardProps) {
  const { addItem, cart } = useCart();
  const [added, setAdded] = useState(false);
  const [imgError, setImgError] = useState(false);

  const cartItem = cart.items.find((i) => i.menuItem.id === item.id);
  const quantity = cartItem?.quantity ?? 0;

  const handleAdd = () => {
    if (!item.is_available) return;
    addItem(item);
    setAdded(true);
    setTimeout(() => setAdded(false), 800);
  };

  return (
    <article
      className={`card overflow-hidden flex flex-col group transition-all duration-300 ${
        !item.is_available ? 'opacity-60' : 'hover:-translate-y-1'
      }`}
    >
      {/* Image */}
      <div className="relative w-full h-44 bg-cream-100 overflow-hidden">
        {item.image_url && !imgError ? (
          <Image
            src={item.image_url}
            alt={item.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
            onError={() => setImgError(true)}
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-coffee-300 gap-2">
            <ImageOff size={32} />
            <span className="text-xs">Foto belum tersedia</span>
          </div>
        )}

        {/* Category badge */}
        <span className="absolute top-2 left-2 px-2.5 py-1 bg-coffee-700/90 text-cream-50 
                         text-xs font-medium rounded-full backdrop-blur-sm">
          {item.category}
        </span>

        {/* Unavailable overlay */}
        {!item.is_available && (
          <div className="absolute inset-0 bg-coffee-900/50 flex items-center justify-center">
            <span className="bg-white/90 text-coffee-800 text-xs font-semibold px-3 py-1 rounded-full">
              Habis
            </span>
          </div>
        )}

        {/* Quantity indicator */}
        {quantity > 0 && (
          <div className="absolute top-2 right-2 min-w-[24px] h-6 flex items-center justify-center
                          bg-warm-500 text-white text-xs font-bold rounded-full px-1.5 shadow-md">
            {quantity}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4 flex flex-col flex-1">
        <h3 className="font-display font-semibold text-coffee-900 text-base leading-snug mb-1">
          {item.name}
        </h3>
        <p className="text-coffee-500 text-xs leading-relaxed flex-1 mb-3 line-clamp-2">
          {item.description}
        </p>
        <div className="flex items-center justify-between mt-auto">
          <span className="font-bold text-coffee-700 text-base">
            {formatPrice(item.price)}
          </span>
          <button
            id={`add-to-cart-${item.id}`}
            onClick={handleAdd}
            disabled={!item.is_available}
            aria-label={`Tambah ${item.name} ke keranjang`}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-semibold 
                        transition-all duration-200 active:scale-90
                        ${
                          added
                            ? 'bg-green-500 text-white scale-105'
                            : item.is_available
                            ? 'bg-coffee-700 text-cream-50 hover:bg-coffee-800 shadow-sm hover:shadow'
                            : 'bg-cream-200 text-coffee-300 cursor-not-allowed'
                        }`}
          >
            <Plus size={15} strokeWidth={2.5} />
            {added ? 'Ditambah!' : 'Tambah'}
          </button>
        </div>
      </div>
    </article>
  );
}
