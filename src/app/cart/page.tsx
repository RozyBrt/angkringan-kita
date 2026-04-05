'use client';

import Link from 'next/link';
import { useCart } from '@/hooks/useCart';
import { formatPrice } from '@/lib/cart';
import CartItem from '@/components/CartItem';
import { ShoppingBag, Trash2, ArrowLeft, ArrowRight } from 'lucide-react';

export default function CartPage() {
  const { cart, total, emptyCart, itemCount } = useCart();

  if (cart.items.length === 0) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center animate-fade-in">
        <div className="text-7xl mb-6">🛒</div>
        <h1 className="font-display text-3xl font-bold text-coffee-900 mb-3">
          Keranjang Kamu
        </h1>
        <p className="text-coffee-500 mb-8">Keranjang kamu masih kosong. Yuk, pilih menu dulu!</p>
        <Link href="/" className="btn-primary inline-flex items-center gap-2">
          <ArrowLeft size={16} />
          Lihat Menu
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto px-4 py-8 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-3xl font-bold text-coffee-900">Keranjang Kamu</h1>
          <p className="text-coffee-500 text-sm mt-1">{itemCount} item dipilih</p>
        </div>
        <button
          id="clear-cart"
          onClick={emptyCart}
          className="btn-danger flex items-center gap-1.5"
          aria-label="Kosongkan keranjang"
        >
          <Trash2 size={14} />
          Kosongkan
        </button>
      </div>

      {/* Cart items */}
      <div className="space-y-3 mb-6">
        {cart.items.map((item) => (
          <CartItem key={item.menuItem.id} item={item} />
        ))}
      </div>

      {/* Order summary */}
      <div className="bg-white rounded-2xl border border-cream-100 p-5 mb-5">
        <h2 className="font-semibold text-coffee-800 mb-4 flex items-center gap-2">
          <ShoppingBag size={17} />
          Ringkasan Pesanan
        </h2>

        <div className="space-y-2 mb-4">
          {cart.items.map((item) => (
            <div key={item.menuItem.id} className="flex justify-between text-sm text-coffee-600">
              <span>
                {item.menuItem.name} × {item.quantity}
              </span>
              <span className="font-medium tabular-nums">
                {formatPrice(item.menuItem.price * item.quantity)}
              </span>
            </div>
          ))}
        </div>

        <div className="border-t border-cream-200 pt-3 flex justify-between">
          <span className="font-bold text-coffee-900">Total</span>
          <span className="font-bold text-coffee-800 text-lg tabular-nums">
            {formatPrice(total)}
          </span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Link
          href="/"
          className="btn-secondary flex items-center justify-center gap-2 flex-1"
        >
          <ArrowLeft size={16} />
          Tambah Lagi
        </Link>
        <Link
          href="/checkout"
          id="checkout-button"
          className="btn-primary flex items-center justify-center gap-2 flex-1"
        >
          Pesan Sekarang
          <ArrowRight size={16} />
        </Link>
      </div>
    </div>
  );
}
