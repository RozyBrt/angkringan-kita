'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase/client';
import { OrderWithItems, OrderStatus } from '@/lib/types/order';
import { formatPrice } from '@/lib/cart';
import { Search, Clock, CheckCircle2, Home, ClipboardList, AlertCircle, ChefHat, PackageCheck, Coffee, Trash2, X } from 'lucide-react';

function TrackContent() {
  const searchParams = useSearchParams();
  const queryId = searchParams.get('id');

  const [orderId, setOrderId] = useState(queryId || '');
  const [order, setOrder] = useState<OrderWithItems | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  interface RecentOrder {
    id: string;
    order_code?: string;
    name?: string;
    time?: string;
    status?: string;
  }
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
  const [matchingOrders, setMatchingOrders] = useState<OrderWithItems[]>([]);
  
  // Custom Modal State
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
  });

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

  const clearAllHistory = () => {
    setConfirmModal({
      isOpen: true,
      title: 'Hapus Semua Riwayat?',
      message: 'Semua daftar pesanan terakhirmu akan dihapus permanen dari browser ini.',
      onConfirm: () => {
        localStorage.removeItem('angkringan_recent_orders');
        setRecentOrders([]);
        setConfirmModal(prev => ({ ...prev, isOpen: false }));
      }
    });
  };

  const removeHistoryItem = (e: React.MouseEvent, id: string | number) => {
    e.stopPropagation();
    setConfirmModal({
      isOpen: true,
      title: 'Hapus Pesanan Ini?',
      message: 'Pesanan ini akan dihapus dari daftar riwayat terakhirmu.',
      onConfirm: () => {
        const updated = recentOrders.filter(ro => ro.id !== id);
        setRecentOrders(updated);
        localStorage.setItem('angkringan_recent_orders', JSON.stringify(updated));
        setConfirmModal(prev => ({ ...prev, isOpen: false }));
      }
    });
  };

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
      // 2. Try matching order_code (8-digit)
      const { data: codeData } = await supabase
        .from('orders')
        .select('*, order_items(*, menu_items(*))')
        .eq('order_code', cleanQuery.toUpperCase())
        .maybeSingle();

      if (codeData) {
        fetchedData = codeData;
      } else {
        // 3. Try matching short ID from local history
        const matchedLocal = recentOrders.find(ro =>
          ro.id.toString().toUpperCase().startsWith(cleanQuery.toUpperCase()) ||
          ro.order_code?.toUpperCase() === cleanQuery.toUpperCase()
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
          // 4. Fallback: Search by Customer Name
          const { data, error } = await supabase
            .from('orders')
            .select('*, order_items(*, menu_items(*))')
            .ilike('customer_name', `%${cleanQuery}%`)
            .order('created_at', { ascending: false });
          
          if (data && data.length > 0) {
            if (data.length === 1) {
              // Only one result, fetch full details
              const { data: fullOrder } = await supabase
                .from('orders')
                .select('*, order_items(*, menu_items(*))')
                .eq('id', data[0].id)
                .single();
              fetchedData = fullOrder;
            } else {
              setMatchingOrders(data as OrderWithItems[]);
              setLoading(false);
              return;
            }
          } else {
            fetchError = error || { message: 'Pesanan tidak ditemukan' };
          }
        }
      }
    }

    if (fetchError || !fetchedData) {
      setError('Pesanan tidak ditemukan. Coba ketikkan Nama Pemesan (sesuai pesanan) atau id yang tertera di struk.');
    } else {
      const orderData = fetchedData as unknown as OrderWithItems;
      setOrder(orderData);
      // Optional: automatically format input to show the found short ID or name
      if (!isFullUUID && !searchId) {
        setOrderId(`#${orderData.order_code || orderData.id.toString().split('-')[0].toUpperCase()}`);
      }
    }
    setLoading(false);
  }

  // Realtime subscription for the current order
  useEffect(() => {
    if (!order?.id) return;

    const channel = supabase
      .channel(`order-${order.id}`)
      .on('postgres_changes', 
          { event: 'UPDATE', schema: 'public', table: 'orders', filter: `id=eq.${order.id}` }, 
          (payload) => {
            console.log('Update status bray!', payload.new);
            setOrder(prev => prev ? { ...prev, ...payload.new } as OrderWithItems : null);
          }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [order?.id]);

  const getStatusDisplay = (status: OrderStatus) => {
    switch (status) {
      case 'pending':
        return { 
          title: 'Menunggu Konfirmasi', 
          desc: 'Pesananmu sudah masuk, tunggu kasir ngecek ya!', 
          color: 'text-yellow-600', 
          bgColor: 'bg-yellow-50', 
          borderColor: 'border-yellow-200',
          icon: <Clock size={24} className="text-yellow-500" />
        };
      case 'confirmed':
        return { 
          title: 'Dikonfirmasi', 
          desc: 'Pesananmu sudah diterima, siap-siap masuk dapur!', 
          color: 'text-blue-600', 
          bgColor: 'bg-blue-50', 
          borderColor: 'border-blue-200',
          icon: <CheckCircle2 size={24} className="text-blue-500" />
        };
      case 'preparing':
        return { 
          title: 'Sedang Dimasak 🔥', 
          desc: 'Sabar ya, koki lagi beraksi buat pesananmu.', 
          color: 'text-orange-600', 
          bgColor: 'bg-orange-50', 
          borderColor: 'border-orange-200',
          icon: <ChefHat size={24} className="text-orange-500" />
        };
      case 'ready':
        return { 
          title: 'Siap Diambil/Diantar! ✅', 
          desc: 'Pesananmu sudah matang dan siap dinikmati.', 
          color: 'text-green-600', 
          bgColor: 'bg-green-50', 
          borderColor: 'border-green-200',
          icon: <PackageCheck size={24} className="text-green-500" />
        };
      case 'served':
        return { 
          title: 'Sudah Disajikan ☕', 
          desc: 'Selamat menikmati! Jangan lupa bayar ya bray.', 
          color: 'text-zinc-600', 
          bgColor: 'bg-zinc-50', 
          borderColor: 'border-zinc-200',
          icon: <Coffee size={24} className="text-zinc-500" />
        };
      case 'cancelled':
        return { 
          title: 'Dibatalkan ❌', 
          desc: 'Maaf bray, pesananmu dibatalkan.', 
          color: 'text-red-600', 
          bgColor: 'bg-red-50', 
          borderColor: 'border-red-200',
          icon: <AlertCircle size={24} className="text-red-500" />
        };
      default:
        return { 
          title: 'Sedang Diproses...', 
          desc: 'Mohon tunggu sebentar ya!', 
          color: 'text-zinc-500', 
          bgColor: 'bg-zinc-50', 
          borderColor: 'border-zinc-200',
          icon: <Clock size={24} className="text-zinc-500" />
        };
    }
  };

  const statusInfo = order ? getStatusDisplay(order.status as OrderStatus) : null;

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
        <div className="mb-10 animate-fade-in">
          <div className="flex justify-between items-end mb-3">
            <p className="text-xs font-bold text-coffee-400 uppercase tracking-widest">Pesanan Terakhirmu</p>
            <button 
              onClick={clearAllHistory}
              className="text-[10px] font-bold text-red-400 hover:text-red-600 transition-colors flex items-center gap-1"
            >
              <Trash2 size={10} /> Hapus Semua
            </button>
          </div>
          <div className="flex flex-col sm:flex-row flex-wrap gap-2">
            {recentOrders.map((ro) => {
              const displayId = ro.order_code || ro.id.toString().split('-')[0].toUpperCase();
              const timeStr = ro.time ? new Date(ro.time).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) : '';

              return (
                <div key={ro.id} className="relative group/item">
                  <button
                    onClick={() => {
                      setOrderId(`#${displayId}`);
                      handleSearch(ro.id.toString());
                    }}
                    className="w-full sm:w-auto px-4 py-2.5 bg-coffee-50 border border-coffee-100 text-coffee-800 rounded-xl text-sm 
                               font-medium hover:bg-coffee-100 transition-colors text-left sm:text-center shadow-sm pr-8 sm:pr-4"
                  >
                    <div className="font-bold text-coffee-900 border-b border-coffee-200/50 pb-1 mb-1 leading-none">
                      Atas Nama: {ro.name || 'Pelanggan'}
                    </div>
                    <div className="flex items-center gap-1.5 text-xs font-mono mt-1.5 w-full">
                      <span className="text-coffee-500">#{displayId}</span>
                      {timeStr && <span className="text-coffee-400 border-l border-coffee-200/50 pl-1.5">{timeStr}</span>}
                      {ro.status && (
                        ro.status === 'served' ? (
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
                  <button 
                    onClick={(e) => removeHistoryItem(e, ro.id)}
                    className="absolute top-1 right-1 p-1 text-coffee-300 hover:text-red-500 opacity-0 group-hover/item:opacity-100 transition-opacity bg-white/50 rounded-lg backdrop-blur-sm sm:static sm:opacity-0 sm:hidden lg:flex lg:absolute"
                    title="Hapus dari riwayat"
                  >
                    <X size={12} />
                  </button>
                </div>
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
              const displayId = mo.order_code || mo.id.toString().split('-')[0].toUpperCase();
              const timeStr = new Date(mo.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });

              return (
                <button
                  key={mo.id}
                  onClick={() => {
                    setOrderId(`#${displayId}`);
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
                    <span className="text-coffee-500">#{displayId}</span>
                    {timeStr && <span className="text-coffee-400 border-l border-coffee-200/50 pl-1.5">{timeStr}</span>}
                    {mo.status === 'served' ? (
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
          {statusInfo && (
            <div className={`flex items-center gap-3 p-4 rounded-xl mb-4 border ${statusInfo.bgColor} ${statusInfo.borderColor}`}>
              <div className="flex-shrink-0">
                {statusInfo.icon}
              </div>
              <div>
                <p className={`font-bold text-sm ${statusInfo.color}`}>
                  {statusInfo.title}
                </p>
                <p className={`text-xs ${statusInfo.color} opacity-80`}>
                  {statusInfo.desc}
                </p>
              </div>
            </div>
          )}

          <div className="mb-6 p-4 bg-coffee-50 rounded-xl">
            <p className="text-[10px] text-coffee-400 font-bold uppercase tracking-widest mb-0.5">
              Nomor Pesanan
            </p>
            <p className="font-display font-bold text-2xl text-coffee-900">
              #{order.order_code || order.id.toString().split('-')[0].toUpperCase()}
            </p>
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
                {formatPrice(order.total_amount || order.total_price || 0)}
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
      {/* CUSTOM CONFIRM MODAL */}
      {confirmModal.isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-[2rem] p-8 max-w-sm w-full shadow-2xl border border-cream-100 animate-slide-up">
            <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center mb-6 mx-auto">
              <Trash2 size={32} className="text-red-500" />
            </div>
            <h3 className="text-2xl font-display font-bold text-coffee-900 text-center mb-2">
              {confirmModal.title}
            </h3>
            <p className="text-coffee-500 text-center text-sm mb-8 leading-relaxed">
              {confirmModal.message}
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
                className="flex-1 py-3.5 px-4 bg-zinc-100 hover:bg-zinc-200 text-zinc-600 rounded-xl font-bold transition-all active:scale-95"
              >
                Batal
              </button>
              <button
                onClick={confirmModal.onConfirm}
                className="flex-1 py-3.5 px-4 bg-red-500 hover:bg-red-600 text-white rounded-xl font-bold transition-all active:scale-95 shadow-lg shadow-red-200"
              >
                Ya, Hapus
              </button>
            </div>
          </div>
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
