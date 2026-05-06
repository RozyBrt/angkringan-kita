'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase/client';
import { OrderWithItems } from '@/lib/types/order';
import { formatPrice } from '@/lib/cart';
import { CheckCircle2, Home, Clock, Star, Tag, Sparkles } from 'lucide-react';

function OrderSuccessContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('id');
  const pointsFromParam = Number(searchParams.get('points') || 0);
  
  const [order, setOrder] = useState<OrderWithItems | null>(null);
  const [loading, setLoading] = useState(true);
  const [totalPoints, setTotalPoints] = useState(0);

  useEffect(() => {
    // Ambil total poin dari localStorage
    try {
      const pts = parseInt(localStorage.getItem('angkringan_loyalty_points') || '0', 10);
      setTotalPoints(pts);
    } catch { /* ignore */ }
  }, []);

  useEffect(() => {
    if (!orderId) {
      setLoading(false);
      return;
    }
    async function fetchOrder() {
      const { data, error } = await supabase
        .from('orders')
        .select('*, order_items(*, menu_items(*))')
        .eq('id', orderId)
        .single();

      if (!error && data) setOrder(data as OrderWithItems);
      setLoading(false);
    }
    fetchOrder();
  }, [orderId]);

  if (loading) {
    return (
      <div className="text-center py-20 text-coffee-400">
        <span className="inline-block w-8 h-8 border-3 border-coffee-300 border-t-coffee-700 rounded-full animate-spin" />
      </div>
    );
  }

  if (!orderId || !order) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center animate-fade-in">
        <p className="text-5xl mb-4">🤔</p>
        <h1 className="font-display text-2xl font-bold text-coffee-900 mb-3">
          Pesanan Tidak Ditemukan
        </h1>
        <p className="text-coffee-500 mb-6">
          Sepertinya kamu belum melakukan pemesanan atau link-nya sudah tidak valid.
        </p>
        <Link href="/" className="btn-primary inline-flex items-center gap-2">
          <Home size={16} />
          Kembali ke Menu
        </Link>
      </div>
    );
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const orderAny = order as any;
  const discountAmount = orderAny.discount_amount || 0;
  const promoCode = orderAny.promo_code_used || null;
  const originalTotal = orderAny.total_price || orderAny.total_amount || 0;
  const finalTotal = orderAny.total_amount || originalTotal;
  const earnedPoints = orderAny.points_earned || pointsFromParam;

  return (
    <div className="max-w-md mx-auto px-4 py-10 text-center animate-slide-up">
      {/* Success Icon */}
      <div className="flex justify-center mb-5">
        <div className="relative">
          <div className="w-24 h-24 bg-green-50 rounded-full flex items-center justify-center border-4 border-green-100">
            <CheckCircle2 size={48} className="text-green-500" strokeWidth={1.5} />
          </div>
          <div className="absolute -top-1 -right-1 w-8 h-8 bg-amber-400 rounded-full flex items-center justify-center shadow-lg">
            <Sparkles size={16} className="text-white" />
          </div>
        </div>
      </div>

      <h1 className="font-display text-3xl font-bold text-coffee-900 mb-1">
        Pesanan Masuk! 🎉
      </h1>
      <p className="text-coffee-500 mb-6 text-sm">
        Pesananmu sudah kami terima dan sedang masuk ke dapur. Ditunggu ya!
      </p>

      {/* Order Code */}
      <div className="bg-coffee-100 border border-coffee-200 rounded-2xl p-4 mb-4">
        <p className="text-xs text-coffee-500 font-medium uppercase tracking-widest mb-1">
          Nomor Pesanan
        </p>
        <p className="font-display font-bold text-4xl tracking-wider text-coffee-900">
          #{order.order_code || order.id.toString().split('-')[0].toUpperCase()}
        </p>
      </div>

      {/* Points Banner */}
      {earnedPoints > 0 && (
        <div className="bg-gradient-to-r from-amber-400 to-orange-400 rounded-2xl p-4 mb-4 text-white shadow-lg shadow-amber-200">
          <div className="flex items-center justify-between">
            <div className="text-left">
              <p className="text-xs font-medium opacity-90">Poin Kamu Bertambah!</p>
              <p className="font-display font-bold text-2xl">+{earnedPoints} Poin ⭐</p>
              <p className="text-xs opacity-80 mt-0.5">Total poin kamu: {totalPoints} poin</p>
            </div>
            <Star size={40} className="opacity-30" fill="white" />
          </div>
        </div>
      )}

      {/* Order Detail */}
      <div className="bg-white rounded-2xl border border-cream-100 p-5 mb-5 text-left space-y-4">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-xs text-coffee-400 mb-0.5">Nama Pemesan</p>
            <p className="font-bold text-coffee-900">{order.customer_name}</p>
          </div>
          <span className="badge-pending">
            <Clock size={11} />
            Menunggu
          </span>
        </div>

        {order.note && (
          <div>
            <p className="text-xs text-coffee-400 mb-0.5">Catatan</p>
            <p className="text-coffee-700 text-sm">{order.note}</p>
          </div>
        )}

        <div>
          <p className="text-xs text-coffee-400 mb-2">Pesanan</p>
          <div className="space-y-1.5">
            {order.order_items?.map((oi) => (
              <div key={oi.id} className="flex justify-between text-sm text-coffee-700">
                <span>{oi.menu_items?.name} × {oi.quantity}</span>
                <span className="font-medium tabular-nums">{formatPrice(oi.subtotal)}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Pricing breakdown */}
        <div className="space-y-1.5 border-t border-cream-200 pt-3">
          {discountAmount > 0 && (
            <>
              <div className="flex justify-between text-sm text-coffee-500">
                <span>Subtotal</span>
                <span className="tabular-nums">{formatPrice(originalTotal)}</span>
              </div>
              <div className="flex justify-between text-sm text-green-600 font-medium">
                <span className="flex items-center gap-1">
                  <Tag size={12} />
                  Diskon ({promoCode})
                </span>
                <span className="tabular-nums">- {formatPrice(discountAmount)}</span>
              </div>
            </>
          )}
          <div className="flex justify-between">
            <span className="font-bold text-coffee-900">Total Dibayar</span>
            <span className="font-bold text-coffee-800 text-lg tabular-nums">
              {formatPrice(finalTotal)}
            </span>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row justify-center gap-3">
        <Link
          href="/"
          id="back-to-menu"
          className="btn-secondary inline-flex justify-center items-center gap-2"
        >
          <Home size={16} />
          Kembali ke Menu
        </Link>
        {order && (
          <a
            href={`https://wa.me/6281234567890?text=${encodeURIComponent(`Halo min, saya pesen yaa\n\nNama: *${order.customer_name}*\nID Pesanan: ${order.order_code || order.id}\nCatatan: ${order.note || '-'}\nTotal: *${formatPrice(finalTotal)}*\n\nBisa langsung diproses? Makasih.`)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 bg-[#25D366] text-white font-semibold px-5 py-2.5 rounded-xl hover:bg-[#20bd5a] active:scale-95 transition-all shadow-md"
          >
            💬 Kabari Via WA
          </a>
        )}
      </div>
    </div>
  );
}

export default function OrderSuccessPage() {
  return (
    <Suspense fallback={<div className="text-center py-20 text-coffee-400">Loading...</div>}>
      <OrderSuccessContent />
    </Suspense>
  );
}
