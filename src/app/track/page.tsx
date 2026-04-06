'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { OrderWithItems } from '@/types';
import { formatPrice } from '@/lib/cart';
import { Search, Clock, CheckCircle2, Home, ClipboardList } from 'lucide-react';

function TrackContent() {
  const searchParams = useSearchParams();
  const queryId = searchParams.get('id');

  const [orderId, setOrderId] = useState(queryId || '');
  const [order, setOrder] = useState<OrderWithItems | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  interface RecentOrder {
    id: string;
    name?: string;
    time?: string;
    status?: string;
  }
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
  const [matchingOrders, setMatchingOrders] = useState<OrderWithItems[]>([]);

  // Load recent order IDs from localStorage
  useEffect(() => {
    async function fetchStatuses(mapped: RecentOrder[]) {
      const ids = mapped.map(m => m.id);
      if (ids.length === 0) return;

      const { data } = await supabase.from('orders').select('id, status').in('id', ids);
      if (data) {
        setRecentOrders(prev => prev.map(ro => {
          const match = data.find(d => d.id === ro.id);
          return match ? { ...ro, status: match.status } : ro;
        }));
      }
    }

    try {
      const stored = localStorage.getItem('angkringan_recent_orders');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          // Backward compatibility for old string array
          const mapped = parsed.map(p => typeof p === 'string' ? { id: p } : p);
          setRecentOrders(mapped);
          fetchStatuses(mapped);
        }
      }
    } catch {
      /* ignore */
    }
  }, []);

  // ... (auto search omitted here to save space but keeping it intact below)
  // Auto-search if query param provided
  useEffect(() => {
    if (queryId) {
      handleSearch(queryId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [queryId]);

  async function handleSearch(searchId?: string) {
    const rawVal = searchId || orderId;
    const queryVal = rawVal.trim();
    if (!queryVal) return;

    setLoading(true);
    setError(null);
    setOrder(null);
    setMatchingOrders([]);

    const cleanQuery = queryVal.startsWith('#') ? queryVal.slice(1) : queryVal;
    const isFullUUID = cleanQuery.length === 36 && cleanQuery.includes('-');

    let fetchedData = null;
    let fetchError = null;

    if (isFullUUID) {
      // 1. Exact UUID match
      const { data, error } = await supabase
        .from('orders')
        .select('*, order_items(*, menu_items(*))')
        .eq('id', cleanQuery)
        .single();
      fetchedData = data;
      fetchError = error;
    } else {
      // 2. Short ID match (Check in recentOrders memory)
      const matchedLocal = recentOrders.find(ro =>
        ro.id.toUpperCase().startsWith(cleanQuery.toUpperCase())
      );

      if (matchedLocal) {
        const { data, error } = await supabase
          .from('orders')
          .select('*, order_items(*, menu_items(*))')
          .eq('id', matchedLocal.id)
          .single();
        fetchedData = data;
        fetchError = error;
      } else {
        // 3. Fallback: Search by Customer Name
        const { data, error } = await supabase
          .from('orders')
          .select('*, order_items(*, menu_items(*))')
          .ilike('customer_name', `%${cleanQuery}%`)
          .order('created_at', { ascending: false })
          .limit(10);

        if (data && data.length > 1) {
          setMatchingOrders(data as OrderWithItems[]);
          setLoading(false);
          return;
        } else {
          fetchedData = data?.[0];
          fetchError = error;
        }
      }
    }

    if (fetchError || !fetchedData) {
      setError('Pesanan tidak ditemukan. Coba ketikkan Nama Pemesan (sesuai pesanan) atau id yang tertera di struk.');
    } else {
      setOrder(fetchedData as OrderWithItems);
      // Optional: automatically format input to show the found short ID or name
      if (!isFullUUID && !searchId) {
        setOrderId(`#${fetchedData.id.split('-')[0].toUpperCase()}`);
      }
    }
    setLoading(false);
  }

  const isDone = order?.status === 'done';

  return (
    <div className="max-w-xl mx-auto px-4 py-10 animate-fade-in">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-coffee-100 rounded-2xl mb-4">
          <ClipboardList size={28} className="text-coffee-700" />
        </div>
        <h1 className="font-display text-3xl font-bold text-coffee-900 mb-2">
          Lacak Pesanan
        </h1>
        <p className="text-coffee-500 text-sm">
          Ketik Nama Pemesan atau Kode Pesanan untuk melihat statusnya
        </p>
      </div>

      {/* Search */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSearch();
        }}
        className="flex gap-2 mb-6"
      >
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-coffee-400" />
          <input
            id="track-order-input"
            type="text"
            value={orderId}
            onChange={(e) => setOrderId(e.target.value)}
            placeholder="Ketik Nama atau Kode (Mis. Rangga)..."
            className="input-field pl-10 text-sm"
          />
        </div>
        <button
          type="submit"
          disabled={loading || !orderId.trim()}
          className="btn-primary flex items-center gap-1.5 px-5"
        >
          {loading ? (
            <span className="w-4 h-4 border-2 border-cream-400 border-t-cream-50 rounded-full animate-spin" />
          ) : (
            <>
              <Search size={15} />
              Cari
            </>
          )}
        </button>
      </form>

      {/* Recent Orders */}
      {recentOrders.length > 0 && !order && matchingOrders.length === 0 && (
        <div className="mb-6">
          <p className="text-xs font-medium text-coffee-400 mb-2">Pilih Pesanan Terakhirmu:</p>
          <div className="flex flex-col sm:flex-row flex-wrap gap-2">
            {recentOrders.map((ro) => {
              const shortId = ro.id.split('-')[0].toUpperCase();
              const timeStr = ro.time ? new Date(ro.time).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) : '';

              return (
                <button
                  key={ro.id}
                  onClick={() => {
                    setOrderId(ro.id);
                    handleSearch(ro.id);
                  }}
                  className="px-4 py-2.5 bg-cream-100 text-coffee-700 rounded-xl text-sm 
                             font-medium hover:bg-cream-200 transition-colors text-left sm:text-center shadow-sm"
                >
                  <div className="font-semibold text-coffee-900 border-b border-coffee-200/50 pb-1 mb-1 leading-none">
                    {ro.name ? `Atas Nama: ${ro.name}` : `Tanpa Nama`}
                  </div>
                  <div className="flex items-center gap-1.5 text-xs font-mono mt-1.5 w-full">
                    <span className="text-coffee-500">#{shortId}</span>
                    {timeStr && <span className="text-coffee-400 border-l border-coffee-200/50 pl-1.5">{timeStr}</span>}
                    {ro.status && (
                      ro.status === 'done' ? (
                        <span className="ml-auto inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-green-100 text-green-700 border border-green-200">
                          <CheckCircle2 size={10} /> Selesai
                        </span>
                      ) : (
                        <span className="ml-auto inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-warm-100 text-warm-700 border border-warm-200">
                          <Clock size={10} /> Diproses
                        </span>
                      )
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Matching Orders Disambiguation */}
      {matchingOrders.length > 0 && !order && (
        <div className="mb-6 animate-fade-in">
          <p className="text-sm font-medium text-coffee-600 mb-3">
            Ditemukan {matchingOrders.length} pesanan dengan nama tersebut. Pilih pesanan aslimu:
          </p>
          <div className="flex flex-col sm:flex-row flex-wrap gap-2">
            {matchingOrders.map((mo) => {
              const shortId = mo.id.split('-')[0].toUpperCase();
              const timeStr = new Date(mo.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });

              return (
                <button
                  key={mo.id}
                  onClick={() => {
                    setOrderId(`#${shortId}`);
                    setOrder(mo);
                    setMatchingOrders([]);
                  }}
                  className="px-4 py-2.5 bg-warm-100 border border-warm-200 text-coffee-800 rounded-xl text-sm 
                             font-medium hover:bg-warm-200 transition-colors text-left sm:text-center shadow-sm"
                >
                  <div className="font-bold text-coffee-900 border-b border-coffee-200/50 pb-1 mb-1 leading-none">
                    Atas Nama: {mo.customer_name}
                  </div>
                  <div className="flex items-center gap-1.5 text-xs font-mono mt-1.5 w-full">
                    <span className="text-coffee-500">#{shortId}</span>
                    {timeStr && <span className="text-coffee-400 border-l border-coffee-200/50 pl-1.5">{timeStr}</span>}
                    {mo.status === 'done' ? (
                      <span className="ml-auto inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-green-100 text-green-700 border border-green-200">
                        <CheckCircle2 size={10} /> Selesai
                      </span>
                    ) : (
                      <span className="ml-auto inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-warm-100 text-warm-700 border border-warm-200">
                        <Clock size={10} /> Diproses
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="text-center py-10">
          <p className="text-4xl mb-3">🔍</p>
          <p className="text-coffee-600 font-semibold">{error}</p>
          <p className="text-coffee-400 text-sm mt-1">
            Pastikan ID pesanan sudah benar. Kamu bisa menemukannya di halaman konfirmasi pesanan.
          </p>
        </div>
      )}

      {/* Order Result */}
      {order && (
        <div className="card p-5 animate-slide-up">
          {/* Status Banner */}
          <div className={`flex items-center gap-3 p-4 rounded-xl mb-4 ${isDone ? 'bg-green-50 border border-green-200' : 'bg-warm-50 border border-warm-200'
            }`}>
            {isDone ? (
              <CheckCircle2 size={24} className="text-green-500 flex-shrink-0" />
            ) : (
              <Clock size={24} className="text-warm-500 flex-shrink-0" />
            )}
            <div>
              <p className={`font-bold text-sm ${isDone ? 'text-green-800' : 'text-warm-800'}`}>
                {isDone ? 'Pesanan Selesai! 🎉' : 'Sedang Diproses...'}
              </p>
              <p className={`text-xs ${isDone ? 'text-green-600' : 'text-warm-600'}`}>
                {isDone
                  ? 'Pesananmu sudah siap. Terima kasih!'
                  : 'Pesananmu sedang disiapkan. Mohon tunggu sebentar ya!'}
              </p>
            </div>
          </div>

          {/* Order Details */}
          <div className="space-y-3">
            <div>
              <p className="text-xs text-coffee-400">Nama Pemesan</p>
              <p className="font-semibold text-coffee-900">{order.customer_name}</p>
            </div>

            {order.note && (
              <div>
                <p className="text-xs text-coffee-400">Catatan</p>
                <p className="text-coffee-700 text-sm">{order.note}</p>
              </div>
            )}

            <div>
              <p className="text-xs text-coffee-400 mb-2">Detail Pesanan</p>
              <div className="space-y-1.5">
                {order.order_items?.map((oi) => (
                  <div key={oi.id} className="flex justify-between text-sm text-coffee-700">
                    <span>{oi.menu_items?.name} × {oi.quantity}</span>
                    <span className="font-medium tabular-nums">{formatPrice(oi.subtotal)}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="border-t border-cream-200 pt-3 flex justify-between">
              <span className="font-bold text-coffee-900">Total</span>
              <span className="font-bold text-coffee-800 text-lg tabular-nums">
                {formatPrice(order.total_price)}
              </span>
            </div>

            <div>
              <p className="text-xs text-coffee-400">
                Dipesan pada:{' '}
                {new Date(order.created_at).toLocaleString('id-ID', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Back to menu */}
      {!loading && !order && !error && (
        <div className="text-center py-10 text-coffee-400">
          <p className="text-4xl mb-3">📋</p>
          <p className="text-coffee-600 text-sm">
            Masukkan ID pesanan untuk melihat statusnya di sini.
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-coffee-500 hover:text-coffee-700 
                       text-sm font-medium mt-4 transition-colors"
          >
            <Home size={14} />
            Kembali ke Menu
          </Link>
        </div>
      )}
    </div>
  );
}

export default function TrackPage() {
  return (
    <Suspense fallback={<div className="text-center py-20 text-coffee-400">Loading...</div>}>
      <TrackContent />
    </Suspense>
  );
}
