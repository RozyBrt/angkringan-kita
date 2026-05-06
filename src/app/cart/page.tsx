'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useCart } from '@/hooks/useCart';
import { formatPrice } from '@/lib/cart';
import CartItem from '@/components/CartItem';
import { validatePromoCode, hasActivePromotions } from '@/lib/actions/promotions';
import { ShoppingBag, Trash2, ArrowLeft, ArrowRight, Tag, X, CheckCircle2, Loader2 } from 'lucide-react';

export default function CartPage() {
  const { cart, total, emptyCart, itemCount } = useCart();

  const [promoCode, setPromoCode] = useState('');
  const [promoLoading, setPromoLoading] = useState(false);
  const [promoError, setPromoError] = useState<string | null>(null);
  const [isPromoVisible, setIsPromoVisible] = useState(false);
  const [appliedPromo, setAppliedPromo] = useState<{
    code: string;
    description: string;
    discount_type: 'fixed' | 'percentage';
    value: number;
    min_order_amount: number;
  } | null>(null);

  // Hitung ulang diskon tiap kali total atau promo berubah bray
  let discountAmount = 0;
  if (appliedPromo) {
    if (appliedPromo.discount_type === 'percentage') {
      discountAmount = Math.round(total * (appliedPromo.value / 100));
    } else {
      discountAmount = Math.min(appliedPromo.value, total);
    }
  }
  const finalTotal = total - discountAmount;

  useEffect(() => {
    async function checkPromos() {
      const active = await hasActivePromotions();
      setIsPromoVisible(active);
    }
    checkPromos();
  }, []);

  // Drop promo if total falls below minimum
  useEffect(() => {
    if (appliedPromo && total < appliedPromo.min_order_amount) {
      setAppliedPromo(null);
      setPromoError(`Promo ${appliedPromo.code} dibatalkan karena pesanan kurang dari Rp ${appliedPromo.min_order_amount.toLocaleString('id-ID')}.`);
    } else if (appliedPromo && total >= appliedPromo.min_order_amount) {
      setPromoError(null);
    }
  }, [total, appliedPromo]);

  async function handleApplyPromo() {
    if (!promoCode.trim()) return;
    setPromoLoading(true);
    setPromoError(null);

    const result = await validatePromoCode(promoCode.trim(), total);

    if (!result.success) {
      setPromoError(result.error || 'Kode promo tidak valid.');
      setPromoLoading(false);
      return;
    }

    setAppliedPromo({
      code: result.promo!.code,
      description: result.promo!.description,
      discount_type: result.promo!.discount_type,
      value: result.promo!.value,
      min_order_amount: result.promo!.min_order_amount,
    });
    setPromoCode('');
    setPromoLoading(false);
  }

  function handleRemovePromo() {
    setAppliedPromo(null);
    setPromoError(null);
  }

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

      {/* Promo Code Section */}
      {(isPromoVisible || appliedPromo) && (
        <div className="bg-white rounded-2xl border border-cream-100 p-5 mb-4">
          <h2 className="font-semibold text-coffee-800 mb-3 flex items-center gap-2 text-sm">
            <Tag size={16} className="text-warm-500" />
            Kode Promo
          </h2>

          {appliedPromo ? (
            <div className="flex items-center justify-between bg-green-50 border border-green-200 rounded-xl px-4 py-3">
              <div className="flex items-center gap-2">
                <CheckCircle2 size={16} className="text-green-500 flex-shrink-0" />
                <div>
                  <p className="text-sm font-bold text-green-700">{appliedPromo.code}</p>
                  <p className="text-xs text-green-600">{appliedPromo.description}</p>
                </div>
              </div>
              <button
                onClick={handleRemovePromo}
                className="p-1 text-green-400 hover:text-red-500 transition-colors"
                title="Hapus promo"
              >
                <X size={16} />
              </button>
            </div>
          ) : (
            <div className="flex gap-2">
              <input
                id="promo-code-input"
                type="text"
                value={promoCode}
                onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                onKeyDown={(e) => e.key === 'Enter' && handleApplyPromo()}
                placeholder="Contoh: ANGKRING10"
                className="input-field flex-1 text-sm uppercase tracking-widest"
              />
              <button
                id="apply-promo-btn"
                onClick={handleApplyPromo}
                disabled={promoLoading || !promoCode.trim()}
                className="px-4 py-2.5 bg-warm-500 hover:bg-warm-600 text-white font-semibold text-sm 
                           rounded-xl transition-all active:scale-95 disabled:opacity-50 
                           disabled:cursor-not-allowed flex items-center gap-1.5"
              >
                {promoLoading ? <Loader2 size={15} className="animate-spin" /> : 'Pakai'}
              </button>
            </div>
          )}

          {promoError && (
            <p className="text-red-500 text-xs mt-2 flex items-center gap-1">
              <X size={12} />
              {promoError}
            </p>
          )}
        </div>
      )}

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

        <div className="space-y-2 border-t border-cream-200 pt-3">
          <div className="flex justify-between text-sm text-coffee-600">
            <span>Subtotal</span>
            <span className="tabular-nums">{formatPrice(total)}</span>
          </div>

          {appliedPromo && (
            <div className="flex justify-between text-sm text-green-600 font-medium">
              <span className="flex items-center gap-1">
                <Tag size={12} />
                Diskon ({appliedPromo.code})
              </span>
              <span className="tabular-nums">- {formatPrice(discountAmount)}</span>
            </div>
          )}

          <div className="flex justify-between pt-2 border-t border-cream-200">
            <span className="font-bold text-coffee-900">Total</span>
            <div className="text-right">
              {appliedPromo && (
                <p className="text-xs text-coffee-400 line-through tabular-nums">{formatPrice(total)}</p>
              )}
              <span className="font-bold text-coffee-800 text-lg tabular-nums">
                {formatPrice(finalTotal)}
              </span>
            </div>
          </div>

          {/* Poin preview */}
          <div className="flex items-center justify-between bg-amber-50 border border-amber-100 rounded-xl px-3 py-2 mt-2">
            <span className="text-xs text-amber-700 font-medium">⭐ Poin yang akan kamu dapat</span>
            <span className="text-xs font-bold text-amber-700">+{Math.floor(finalTotal * 0.1)} poin</span>
          </div>
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
          href={`/checkout?promo=${appliedPromo?.code || ''}&discount=${discountAmount}&final=${finalTotal}`}
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
