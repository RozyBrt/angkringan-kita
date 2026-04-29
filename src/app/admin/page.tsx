'use client';

import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { OrderWithItems, OrderStatus } from '@/lib/types/order';
import AdminLogin from '@/components/AdminLogin';
import OrderCard from '@/components/OrderCard';
import {
  LogOut,
  RefreshCw,
  Clock,
  CheckCheck,
  ShoppingBag,
  Bell,
} from 'lucide-react';
import { updateOrderStatus } from '@/lib/actions/orders';

type FilterStatus = 'all' | 'pending' | 'served';

export default function AdminPage() {
  const [session, setSession] = useState<unknown>(null);
  const [sessionLoading, setSessionLoading] = useState(true);
  const [orders, setOrders] = useState<OrderWithItems[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [filter, setFilter] = useState<FilterStatus>('pending');
  const [refreshing, setRefreshing] = useState(false);
  const [newOrderIds, setNewOrderIds] = useState<Set<string>>(new Set());

  // Check auth session
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setSessionLoading(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  const fetchOrders = useCallback(async () => {
    setOrdersLoading(true);
    const { data, error } = await supabase
      .from('orders')
      .select('*, order_items(*, menu_items(*))')
      .order('created_at', { ascending: false });
 
    if (!error && data) {
      setOrders(data as unknown as OrderWithItems[]);
    }
    setOrdersLoading(false);
  }, []);

  // Fetch orders when logged in
  useEffect(() => {
    if (session) fetchOrders();
  }, [session, fetchOrders]);

  // Supabase Realtime: listen for new orders
  useEffect(() => {
    if (!session) return;

    const channel = supabase
      .channel('orders-realtime')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'orders' },
        (payload) => {
          // Fetch fresh data with relations
          fetchOrders().then(() => {
            const newId = payload.new.id as string;
            setNewOrderIds((prev) => new Set(prev).add(newId));
            // Remove "new" badge after 10 seconds
            setTimeout(() => {
              setNewOrderIds((prev) => {
                const next = new Set(prev);
                next.delete(newId);
                return next;
              });
            }, 10000);
          });
        }
      )
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'orders' },
        () => {
          fetchOrders();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [session, fetchOrders]);

  async function handleRefresh() {
    setRefreshing(true);
    await fetchOrders();
    setRefreshing(false);
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    setSession(null);
    setOrders([]);
  }

  async function handleStatusChange(orderId: string | number, status: OrderStatus) {
    // Pake Server Action biar tembus RLS bray
    const res = await updateOrderStatus(orderId, status);
    if (res.success) {
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status } : o))
      );
    } else {
      alert('Gagal update status bray: ' + res.error);
    }
  }

  // Auth loading state
  if (sessionLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <span className="w-8 h-8 border-2 border-coffee-600 border-t-coffee-300 rounded-full animate-spin" />
      </div>
    );
  }

  // Not logged in
  if (!session) {
    return <AdminLogin onLoginSuccess={() => fetchOrders()} />;
  }

  // Filter orders
  const filteredOrders = (filter === 'all'
    ? orders
    : orders.filter((o) => o.status === filter)) as OrderWithItems[];

  const pendingCount = orders.filter((o) => o.status === 'pending').length;
  const servedCount = orders.filter((o) => o.status === 'served').length;

  return (
    <div className="py-8 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-2xl font-bold text-cream-100">Pesanan Masuk</h1>
          <p className="text-coffee-400 text-sm mt-0.5">
            Total {orders.length} pesanan hari ini
          </p>
        </div>
        <div className="flex items-center gap-2">
          {newOrderIds.size > 0 && (
            <div className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-warm-600 text-white text-sm font-semibold animate-pulse-soft">
              <Bell size={15} />
              <span>{newOrderIds.size} Baru!</span>
            </div>
          )}
          <button
            id="refresh-orders"
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-coffee-800 text-coffee-300 
                       hover:text-cream-100 hover:bg-coffee-700 transition-all text-sm"
            aria-label="Refresh pesanan"
          >
            <RefreshCw size={15} className={refreshing ? 'animate-spin' : ''} />
            <span className="hidden sm:inline">Refresh</span>
          </button>
          <button
            id="admin-logout"
            onClick={handleLogout}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-coffee-800 text-coffee-400 
                       hover:text-red-400 hover:bg-red-900/30 transition-all text-sm"
          >
            <LogOut size={15} />
            <span className="hidden sm:inline">Keluar</span>
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="bg-coffee-800 rounded-2xl p-4 text-center border border-coffee-700">
          <p className="text-3xl font-bold text-cream-100">{orders.length}</p>
          <p className="text-coffee-400 text-xs mt-1 flex items-center justify-center gap-1">
            <ShoppingBag size={12} />
            Total
          </p>
        </div>
        <div className="bg-warm-900/40 rounded-2xl p-4 text-center border border-warm-800/50">
          <p className="text-3xl font-bold text-warm-300">{pendingCount}</p>
          <p className="text-warm-500 text-xs mt-1 flex items-center justify-center gap-1">
            <Clock size={12} />
            Menunggu
          </p>
        </div>
        <div className="bg-green-900/30 rounded-2xl p-4 text-center border border-green-800/40">
          <p className="text-3xl font-bold text-green-400">{servedCount}</p>
          <p className="text-green-600 text-xs mt-1 flex items-center justify-center gap-1">
            <CheckCheck size={12} />
            Selesai
          </p>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 mb-5">
        {(
          [
            { value: 'pending', label: 'Menunggu', count: pendingCount },
            { value: 'served', label: 'Selesai', count: servedCount },
            { value: 'all', label: 'Semua', count: orders.length },
          ] as { value: FilterStatus; label: string; count: number }[]
        ).map((tab) => (
          <button
            key={tab.value}
            id={`filter-${tab.value}`}
            onClick={() => setFilter(tab.value)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              filter === tab.value
                ? 'bg-coffee-500 text-white'
                : 'bg-coffee-800 text-coffee-400 hover:bg-coffee-700 hover:text-coffee-200'
            }`}
          >
            {tab.label}
            <span
              className={`text-xs px-1.5 py-0.5 rounded-full tabular-nums ${
                filter === tab.value ? 'bg-white/20' : 'bg-coffee-700'
              }`}
            >
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Orders */}
      {ordersLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="skeleton h-28 rounded-2xl" />
          ))}
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="text-center py-16 text-coffee-500">
          <p className="text-4xl mb-3">📋</p>
          <p className="font-semibold">Belum ada pesanan</p>
          <p className="text-sm mt-1 text-coffee-600">
            {filter === 'pending' ? 'Belum ada pesanan masuk' : 'Belum ada pesanan selesai'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredOrders.map((order) => (
            <OrderCard
              key={order.id}
              order={order as OrderWithItems}
              onStatusChange={handleStatusChange}
              isNew={newOrderIds.has(order.id.toString())}
            />
          ))}
        </div>
      )}
    </div>
  );
}
