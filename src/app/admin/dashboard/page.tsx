'use client';

import { useRealtimeOrders } from '@/hooks/useRealtimeOrders';
import { updateOrderStatus } from '@/lib/actions/orders';

export default function AdminDashboard() {
  const { orders } = useRealtimeOrders();

  // DASHBOARD STATS logic
  const stats = {
    pending: orders.filter(o => o.status === 'pending' || o.status === 'confirmed').length,
    preparing: orders.filter(o => o.status === 'preparing').length,
    ready: orders.filter(o => o.status === 'ready').length,
  };

  return (
    <div className="p-8 bg-zinc-950 min-h-screen text-white">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
        <h1 className="text-3xl font-bold">Dashboard Angkringan Kita 🚀</h1>

        {/* STATS CARDS */}
        <div className="flex gap-4">
          <div className="bg-zinc-900 border border-zinc-800 px-4 py-2 rounded-xl">
            <p className="text-zinc-500 text-xs uppercase font-bold tracking-wider">Pending</p>
            <p className="text-xl font-bold text-blue-400">{stats.pending}</p>
          </div>
          <div className="bg-zinc-900 border border-zinc-800 px-4 py-2 rounded-xl">
            <p className="text-zinc-500 text-xs uppercase font-bold tracking-wider">Masak</p>
            <p className="text-xl font-bold text-orange-400">{stats.preparing}</p>
          </div>
          <div className="bg-zinc-900 border border-zinc-800 px-4 py-2 rounded-xl">
            <p className="text-zinc-500 text-xs uppercase font-bold tracking-wider">Siap</p>
            <p className="text-xl font-bold text-green-400">{stats.ready}</p>
          </div>
        </div>
      </div>

      {orders.length === 0 ? (
        /* EMPTY STATE */
        <div className="flex flex-col items-center justify-center py-32 opacity-50 border-2 border-dashed border-zinc-800 rounded-3xl">
          <span className="text-6xl mb-4">💤</span>
          <p className="text-xl font-medium">Belum ada pesanan masuk...</p>
          <p className="text-sm">Santai dulu ga si. ☕</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {orders.map((order) => (
            <div key={order.id} className="p-6 bg-zinc-900 border border-zinc-800 rounded-2xl shadow-xl flex flex-col">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <p className="text-zinc-500 text-sm">Meja {order.table_number || '?'}</p>
                  <h3 className="text-xl font-bold">{order.customer_name}</h3>
                </div>
                <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${order.status === 'pending' ? 'bg-zinc-800 text-zinc-400' :
                  order.status === 'confirmed' ? 'bg-blue-900/30 text-blue-400 border border-blue-800' :
                    order.status === 'preparing' ? 'bg-orange-900/30 text-orange-400 border border-orange-800' :
                      order.status === 'ready' ? 'bg-green-900/30 text-green-400 border border-green-800' :
                        'bg-zinc-800 text-zinc-500'
                  }`}>
                  {order.status}
                </span>
              </div>

              <div className="space-y-2 mb-6 flex-grow">
                {order.order_items?.map((item, idx) => (
                  <div key={idx} className="flex justify-between text-sm">
                    <span className="text-zinc-300">
                      {item.menu_items?.name || `Item #${item.menu_item_id.toString().slice(0, 8)}...`}
                      <span className="text-zinc-500 ml-1">x{item.quantity}</span>
                    </span>
                    <span className="text-zinc-400 font-mono text-xs">
                      {(item.subtotal || 0).toLocaleString('id-ID')}
                    </span>
                  </div>
                ))}
              </div>

              <div className="pt-4 border-t border-zinc-800 flex flex-col gap-2">
                {/* STEP 1: Dari Pending ke Confirmed */}
                {order.status === 'pending' && (
                  <button
                    onClick={() => updateOrderStatus(order.id, 'confirmed')}
                    className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 rounded-lg text-sm font-bold transition shadow-lg shadow-blue-900/20"
                  >
                    Konfirmasi Pesanan 🤝
                  </button>
                )}

                {/* STEP 2: Dari Confirmed ke Preparing */}
                {order.status === 'confirmed' && (
                  <button
                    onClick={() => updateOrderStatus(order.id, 'preparing')}
                    className="w-full py-2.5 bg-orange-600 hover:bg-orange-500 rounded-lg text-sm font-bold transition shadow-lg shadow-orange-900/20"
                  >
                    Mulai Masak 🔥
                  </button>
                )}

                {/* STEP 3: Dari Preparing ke Ready */}
                {order.status === 'preparing' && (
                  <button
                    onClick={() => updateOrderStatus(order.id, 'ready')}
                    className="w-full py-2.5 bg-purple-600 hover:bg-purple-500 rounded-lg text-sm font-bold transition shadow-lg shadow-purple-900/20"
                  >
                    Pesanan Siap! ✅
                  </button>
                )}

                {/* STEP 4: Dari Ready ke Served (Selesai) */}
                {order.status === 'ready' && (
                  <button
                    onClick={() => updateOrderStatus(order.id, 'served')}
                    className="w-full py-2.5 bg-zinc-700 hover:bg-zinc-600 rounded-lg text-sm font-bold transition"
                  >
                    Sajikan ke Meja ☕
                  </button>
                )}

                {/* BONUS: Tombol Cancel */}
                {(order.status === 'pending' || order.status === 'confirmed') && (
                  <button
                    onClick={() => updateOrderStatus(order.id, 'cancelled')}
                    className="w-full py-1.5 text-zinc-500 hover:text-red-500 text-xs transition font-medium"
                  >
                    Batalkan Pesanan ❌
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
