'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase/client';
import { OrderWithItems } from '@/lib/types/order';
import { formatPrice } from '@/lib/cart';
import { CheckCircle2, Home, Clock } from 'lucide-react';

function OrderSuccessContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('id');
  const [order, setOrder] = useState<OrderWithItems | null>(null);
  const [loading, setLoading] = useState(true);

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

  return (
    <div className="max-w-md mx-auto px-4 py-12 text-center animate-slide-up">
      {/* Success icon */}
      <div className="flex justify-center mb-6">
        <div className="w-24 h-24 bg-green-50 rounded-full flex items-center justify-center
                        border-4 border-green-100">
          <CheckCircle2 size={48} className="text-green-500" strokeWidth={1.5} />
        </div>
      </div>

      <h1 className="font-display text-3xl font-bold text-coffee-900 mb-2">
        Pesanan Masuk! 🎉
      </h1>
      <p className="text-coffee-500 mb-8">
        Pesananmu sudah kami terima. Tunggu sebentar ya, segera kami proses!
      </p>

      {order && (
        <>
          <div className="bg-coffee-100 border border-coffee-200 rounded-2xl p-4 mb-6">
            <p className="text-xs text-coffee-500 font-medium uppercase tracking-widest mb-1">
              Nomor Pesanan
            </p>
            <p className="font-display font-bold text-4xl tracking-wider text-coffee-900">
              #{order.order_code || order.id.toString().split('-')[0].toUpperCase()}
            </p>
          </div>

          <div className="bg-white rounded-2xl border border-cream-100 p-5 mb-6 text-left space-y-4">
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
                  <div
                    key={oi.id}
                    className="flex justify-between text-sm text-coffee-700"
                  >
                    <span>
                      {oi.menu_items?.name} × {oi.quantity}
                    </span>
                    <span className="font-medium tabular-nums">
                      {formatPrice(oi.subtotal)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="border-t border-cream-200 pt-3 flex justify-between">
              <span className="font-bold text-coffee-900">Total</span>
              <span className="font-bold text-coffee-800 text-lg tabular-nums">
                {formatPrice(order.total_amount || order.total_price || 0)}
              </span>
            </div>
          </div>
        </>
      )}

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
            href={`https://wa.me/6281234567890?text=${encodeURIComponent(`Halo min, saya pesen yaa\n\nNama: *${order.customer_name}*\nID Pesanan: ${order.order_code || order.id}\nCatatan: ${order.note || '-'}\nTotal: *${formatPrice(order.total_amount || order.total_price || 0)}*\n\nBisa langsung diproses? Makasih.`)}`}
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
