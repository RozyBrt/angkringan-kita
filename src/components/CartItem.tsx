'use client';

import { Minus, Plus, Trash2 } from 'lucide-react';
import Image from 'next/image';
import { CartItem as CartItemType } from '@/types';
import { useCart } from '@/hooks/useCart';
import { formatPrice } from '@/lib/cart';
import { useState } from 'react';

interface CartItemProps {
  item: CartItemType;
}

export default function CartItem({ item }: CartItemProps) {
  const { updateItemQuantity } = useCart();
  const [imgError, setImgError] = useState(false);

  const subtotal = item.menuItem.price * item.quantity;

  return (
    <div className="flex items-center gap-3 p-4 bg-white rounded-2xl border border-cream-100 
                    hover:border-cream-200 transition-all duration-200 animate-slide-up">
      {/* Thumbnail */}
      <div className="relative w-16 h-16 flex-shrink-0 rounded-xl overflow-hidden bg-cream-100">
        {item.menuItem.image_url && !imgError ? (
          <Image
            src={item.menuItem.image_url}
            alt={item.menuItem.name}
            fill
            className="object-cover"
            onError={() => setImgError(true)}
            sizes="64px"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-coffee-300 text-xl">
            ☕
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-coffee-900 text-sm leading-snug truncate">
          {item.menuItem.name}
        </p>
        <p className="text-coffee-500 text-xs">{formatPrice(item.menuItem.price)}</p>
        <p className="text-coffee-700 font-bold text-sm mt-0.5">{formatPrice(subtotal)}</p>
      </div>

      {/* Quantity controls */}
      <div className="flex items-center gap-1.5">
        <button
          onClick={() => updateItemQuantity(item.menuItem.id, item.quantity - 1)}
          aria-label="Kurangi jumlah"
          className="w-8 h-8 flex items-center justify-center rounded-lg 
                     bg-cream-100 text-coffee-700 hover:bg-cream-200 
                     active:scale-90 transition-all"
        >
          {item.quantity === 1 ? <Trash2 size={14} className="text-red-500" /> : <Minus size={14} />}
        </button>

        <span className="w-7 text-center font-bold text-coffee-900 text-sm tabular-nums">
          {item.quantity}
        </span>

        <button
          onClick={() => updateItemQuantity(item.menuItem.id, item.quantity + 1)}
          aria-label="Tambah jumlah"
          className="w-8 h-8 flex items-center justify-center rounded-lg 
                     bg-coffee-700 text-cream-50 hover:bg-coffee-800 
                     active:scale-90 transition-all"
        >
          <Plus size={14} />
        </button>
      </div>
    </div>
  );
}
