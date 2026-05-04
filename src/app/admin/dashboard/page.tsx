'use client';

import { useState } from 'react';
import { useRealtimeOrders } from '@/hooks/useRealtimeOrders';
import { updateOrderStatus, completeAndPayOrder } from '@/lib/actions/orders';
import OrderReceipt from '@/components/admin/OrderReceipt';
import { OrderWithItems } from '@/lib/types/order';
import { 
  Clock, 
  ChefHat, 
  PackageCheck, 
  Coffee as CoffeeIcon, 
  XCircle, 
  CheckCircle2, 
  AlertCircle,
  LayoutDashboard,
  Timer,
  CheckSquare,
  Banknote,
  Printer,
  Volume2,
  TrendingUp
} from 'lucide-react';
import Link from 'next/link';

export default function AdminDashboard() {
  const { orders, connectionStatus, playNotification } = useRealtimeOrders();
  const [printingOrder, setPrintingOrder] = useState<OrderWithItems | null>(null);

  // Custom Modal State
  const [modal, setModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    type: 'confirm' | 'alert';
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: '',
    message: '',
    type: 'confirm',
    onConfirm: () => {},
  });

  // DASHBOARD STATS logic
  const stats = {
    pending: (orders || []).filter(o => o.status === 'pending' || o.status === 'confirmed').length,
    preparing: (orders || []).filter(o => o.status === 'preparing').length,
    ready: (orders || []).filter(o => o.status === 'ready').length,
  };

  const handleCompleteAndPay = async (order: OrderWithItems) => {
    setModal({
      isOpen: true,
      title: 'Proses Pembayaran?',
      message: `Selesaikan pesanan atas nama ${order.customer_name} dan cetak struk pembayarannya?`,
      type: 'confirm',
      onConfirm: async () => {
        setModal(prev => ({ ...prev, isOpen: false }));
        const res = await completeAndPayOrder(order.id);
        if (res.success) {
          const updatedOrder = { ...order, status: 'served' as const, payment_status: 'paid' as const };
          setPrintingOrder(updatedOrder);
          setTimeout(() => {
            window.print();
            setPrintingOrder(null);
          }, 300);
        } else {
          setModal({
            isOpen: true,
            title: 'Waduh, Gagal!',
            message: 'Gagal memproses pembayaran bray. Coba cek koneksi database kamu.',
            type: 'alert',
            onConfirm: () => setModal(prev => ({ ...prev, isOpen: false }))
          });
        }
      }
    });
  };

  const handleReprint = (order: OrderWithItems) => {
    setPrintingOrder(order);
    setTimeout(() => {
      window.print();
      setPrintingOrder(null);
    }, 300);
  };

  return (
    <div className="py-8 min-h-screen text-cream-100 animate-fade-in relative">
      {/* RECEIPT FOR PRINTING (Hidden in screen) */}
      {printingOrder && <OrderReceipt order={printingOrder} />}

      {/* HEADER & STATS HEADER */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end mb-10 gap-6 print:hidden">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-lg bg-coffee-600 flex items-center justify-center">
              <LayoutDashboard size={18} className="text-cream-100" />
            </div>
            <span className="text-coffee-400 font-bold text-sm uppercase tracking-widest">Manajemen Operasional</span>
          </div>
          <div className="flex items-center gap-4">
            <h1 className="font-display text-4xl font-bold text-cream-50">Dashboard Dapur 🚀</h1>
            <Link 
              href="/admin/analytics" 
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-orange-500/20 to-orange-600/20 hover:from-orange-500/30 hover:to-orange-600/30 border border-orange-500/30 text-orange-300 rounded-xl font-bold transition-all active:scale-95 shadow-[0_0_15px_rgba(237,137,54,0.15)] ml-2"
            >
              <TrendingUp size={16} className="text-orange-400" />
              <span className="text-sm">Analitik Cuan</span>
            </Link>
            <div className={`flex items-center gap-1.5 px-2 py-1 rounded-md text-[10px] font-bold border transition-colors ${
              connectionStatus === 'CONNECTED' ? 'bg-green-500/10 text-green-400 border-green-500/20' :
              connectionStatus === 'CONNECTING' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20 animate-pulse' :
              connectionStatus === 'RECONNECTING' ? 'bg-orange-500/10 text-orange-400 border-orange-500/20 animate-pulse' :
              'bg-red-500/10 text-red-400 border-red-500/50 animate-pulse shadow-[0_0_10px_rgba(239,68,68,0.3)]'
            }`}>
              <div className={`w-1.5 h-1.5 rounded-full ${
                connectionStatus === 'CONNECTED' ? 'bg-green-400' :
                connectionStatus === 'CONNECTING' ? 'bg-blue-400' :
                connectionStatus === 'RECONNECTING' ? 'bg-orange-400' :
                'bg-red-500'
              }`} />
              {connectionStatus === 'FAILED' ? 'OFFLINE' : connectionStatus}
            </div>
            <button 
              onClick={() => {
                playNotification();
                alert('🔊 Suara Aman bray! Gembok audio sudah terbuka.');
              }}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-bold border bg-coffee-800/30 text-coffee-300 border-coffee-700/50 hover:bg-coffee-700 transition-all active:scale-95"
            >
              <Volume2 size={12} />
              Test Suara
            </button>
          </div>
        </div>
        
        {/* STATS CARDS - Glassmorphism Style */}
        <div className="grid grid-cols-3 gap-3 w-full lg:w-auto">
          <StatCard 
            label="Pending" 
            value={stats.pending} 
            color="blue" 
            icon={<Timer size={16} />} 
          />
          <StatCard 
            label="Dapur" 
            value={stats.preparing} 
            color="orange" 
            icon={<ChefHat size={16} />} 
          />
          <StatCard 
            label="Siap" 
            value={stats.ready} 
            color="green" 
            icon={<CheckSquare size={16} />} 
          />
        </div>
      </div>
      
      {orders.length === 0 ? (
        /* EMPTY STATE - More Premium */
        <div className="flex flex-col items-center justify-center py-32 bg-coffee-900/20 border-2 border-dashed border-coffee-800/50 rounded-[2rem] backdrop-blur-sm print:hidden">
          <div className="w-24 h-24 bg-coffee-900/50 rounded-full flex items-center justify-center mb-6 border border-coffee-800 animate-bounce-slow">
            <span className="text-5xl">💤</span>
          </div>
          <h2 className="text-2xl font-display font-bold text-cream-200 mb-2">Belum Ada Pesanan Masuk</h2>
          <p className="text-coffee-400 max-w-xs text-center">
            Tenang bray, mending seruput kopi dulu sambil nunggu pelanggan dateng. ☕
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 print:hidden">
          {orders && orders.length > 0 && orders.map((order) => (
            <OrderCard 
              key={order.id} 
              order={order} 
              onCompleteAndPay={() => handleCompleteAndPay(order)} 
              onReprint={() => handleReprint(order)}
            />
          ))}
        </div>
      )}
      {/* CUSTOM MODAL */}
      {modal.isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in print:hidden">
          <div className="bg-white rounded-[2rem] p-8 max-w-sm w-full shadow-2xl border border-cream-100 animate-slide-up">
            <div className={`w-16 h-16 ${modal.type === 'confirm' ? 'bg-coffee-50' : 'bg-red-50'} rounded-2xl flex items-center justify-center mb-6 mx-auto`}>
              {modal.type === 'confirm' ? <Banknote size={32} className="text-coffee-600" /> : <AlertCircle size={32} className="text-red-500" />}
            </div>
            <h3 className="text-2xl font-display font-bold text-coffee-900 text-center mb-2">
              {modal.title}
            </h3>
            <p className="text-coffee-500 text-center text-sm mb-8 leading-relaxed">
              {modal.message}
            </p>
            <div className="flex gap-3">
              {modal.type === 'confirm' && (
                <button
                  onClick={() => setModal(prev => ({ ...prev, isOpen: false }))}
                  className="flex-1 py-3.5 px-4 bg-zinc-100 hover:bg-zinc-200 text-zinc-600 rounded-xl font-bold transition-all active:scale-95"
                >
                  Batal
                </button>
              )}
              <button
                onClick={modal.onConfirm}
                className={`flex-1 py-3.5 px-4 ${modal.type === 'confirm' ? 'bg-coffee-600 hover:bg-coffee-700' : 'bg-red-500 hover:bg-red-600'} text-white rounded-xl font-bold transition-all active:scale-95 shadow-lg shadow-coffee-200`}
              >
                {modal.type === 'confirm' ? 'Ya, Proses' : 'Oke Bray'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({ label, value, color, icon }: { label: string, value: number, color: 'blue' | 'orange' | 'green', icon: React.ReactNode }) {
  const colorMap = {
    blue: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
    orange: 'text-orange-400 bg-orange-500/10 border-orange-500/20',
    green: 'text-green-400 bg-green-500/10 border-green-500/20'
  };

  return (
    <div className={`px-4 py-3 rounded-2xl border backdrop-blur-md flex flex-col items-center justify-center min-w-[100px] ${colorMap[color]}`}>
      <div className="flex items-center gap-1.5 mb-1 opacity-80">
        {icon}
        <span className="text-[10px] uppercase font-black tracking-tighter">{label}</span>
      </div>
      <p className="text-2xl font-black tabular-nums">{value}</p>
    </div>
  );
}

function OrderCard({ order, onCompleteAndPay, onReprint }: { order: OrderWithItems, onCompleteAndPay: () => void, onReprint: () => void }) {
  const statusConfig = {
    pending: { label: 'Pending', class: 'bg-zinc-800/50 text-zinc-400 border-zinc-700/50', icon: <Clock size={12} /> },
    confirmed: { label: 'Confirmed', class: 'bg-blue-500/10 text-blue-400 border-blue-500/20', icon: <CheckCircle2 size={12} /> },
    preparing: { label: 'Dapur', class: 'bg-orange-500/10 text-orange-400 border-orange-500/20', icon: <ChefHat size={12} /> },
    ready: { label: 'Siap', class: 'bg-green-500/10 text-green-400 border-green-500/20', icon: <PackageCheck size={12} /> },
    served: { label: 'Selesai', class: 'bg-zinc-800/30 text-zinc-500 border-zinc-800', icon: <CoffeeIcon size={12} /> },
    cancelled: { label: 'Batal', class: 'bg-red-500/10 text-red-400 border-red-500/20', icon: <XCircle size={12} /> },
  };

  const config = statusConfig[order.status as keyof typeof statusConfig] || statusConfig.pending;
  const isPaid = order.payment_status === 'paid';

  return (
    <div className={`group bg-coffee-900/40 border ${isPaid ? 'border-green-500/30' : 'border-coffee-800/50'} rounded-[2rem] p-6 hover:bg-coffee-900/60 transition-all duration-500 backdrop-blur-sm flex flex-col shadow-2xl shadow-black/20`}>
      <div className="flex justify-between items-start mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-bold text-coffee-400 uppercase tracking-widest bg-coffee-950/50 px-2 py-0.5 rounded-md border border-coffee-800/50">
              Meja {order.table_number || '??'}
            </span>
            {isPaid && (
              <span className="text-[10px] font-bold text-green-400 uppercase tracking-widest bg-green-950/50 px-2 py-0.5 rounded-md border border-green-800/50">
                LUNAS ✅
              </span>
            )}
          </div>
          <h3 className="text-2xl font-display font-bold text-cream-50 group-hover:text-cream-400 transition-colors">{order.customer_name}</h3>
        </div>
        <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${config.class}`}>
          {config.icon}
          {config.label}
        </div>
      </div>

      <div className="space-y-3 mb-8 flex-grow max-h-[320px] overflow-y-auto pr-2 custom-scrollbar">
        {order.order_items?.map((item, idx: number) => (
          <div key={idx} className="flex justify-between items-center bg-coffee-950/30 p-3 rounded-xl border border-coffee-800/30 group-hover:border-coffee-700/50 transition-colors">
            <div className="flex flex-col">
              <span className="text-cream-200 font-medium text-sm leading-tight">
                {item.menu_items?.name || `Item #${item.menu_item_id.toString().slice(0, 4)}`}
              </span>
              <span className="text-[10px] text-coffee-500 uppercase font-bold tracking-wider mt-1">Jumlah: {item.quantity}x</span>
            </div>
            <span className="text-cream-400 font-mono text-sm font-bold bg-coffee-950/50 px-2 py-1 rounded-lg ml-4">
              {(item.subtotal || 0).toLocaleString('id-ID')}
            </span>
          </div>
        ))}
      </div>

      {order.note && (
        <div className="mb-6 p-3 bg-warm-900/10 border border-warm-800/20 rounded-xl flex items-start gap-2">
          <AlertCircle size={14} className="text-warm-400 mt-0.5 flex-shrink-0" />
          <p className="text-xs text-warm-200/70 italic leading-relaxed">&quot;{order.note}&quot;</p>
        </div>
      )}

      <div className="pt-6 border-t border-coffee-800/50 flex flex-col gap-2">
        {/* FLOW OPERASIONAL */}
        {order.status === 'pending' && (
          <button 
            onClick={() => updateOrderStatus(order.id, 'confirmed')}
            className="w-full py-3.5 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl text-sm font-bold transition-all active:scale-95 flex items-center justify-center gap-2"
          >
            <CheckCircle2 size={18} />
            Konfirmasi Pesanan
          </button>
        )}

        {order.status === 'confirmed' && (
          <button 
            onClick={() => updateOrderStatus(order.id, 'preparing')}
            className="w-full py-3.5 bg-orange-600 hover:bg-orange-500 text-white rounded-2xl text-sm font-bold transition-all active:scale-95 flex items-center justify-center gap-2"
          >
            <ChefHat size={18} />
            Mulai Masak 🔥
          </button>
        )}

        {order.status === 'preparing' && (
          <button 
            onClick={() => updateOrderStatus(order.id, 'ready')}
            className="w-full py-3.5 bg-cream-500 hover:bg-cream-400 text-coffee-950 rounded-2xl text-sm font-bold transition-all active:scale-95 flex items-center justify-center gap-2"
          >
            <PackageCheck size={18} />
            Pesanan Siap! ✅
          </button>
        )}

        {/* TOMBOL FINAL: BAYAR & PRINT */}
        {(order.status === 'ready' || (order.status === 'served' && order.payment_status === 'unpaid')) && (
          <button 
            onClick={onCompleteAndPay}
            className="w-full py-3.5 bg-green-600 hover:bg-green-500 text-white rounded-2xl text-sm font-bold transition-all active:scale-95 shadow-lg shadow-green-900/40 flex items-center justify-center gap-2"
          >
            <Banknote size={18} />
            Selesaikan & Bayar 💸
          </button>
        )}

        {/* RE-PRINT BUTTON (Kalau sudah lunas) */}
        {order.status === 'served' && order.payment_status === 'paid' && (
          <button 
            onClick={onReprint}
            className="w-full py-3.5 bg-zinc-700 hover:bg-zinc-600 text-zinc-300 rounded-xl text-sm font-bold transition-all active:scale-95 flex items-center justify-center gap-2"
          >
            <Printer size={18} />
            Cetak Ulang Struk
          </button>
        )}

        {/* BONUS: Tombol Cancel */}
        {(order.status === 'pending' || order.status === 'confirmed') && (
          <button 
            onClick={() => updateOrderStatus(order.id, 'cancelled')}
            className="w-full py-2 text-coffee-500 hover:text-red-500 text-xs transition font-bold uppercase tracking-widest flex items-center justify-center gap-1.5"
          >
            <XCircle size={14} />
            Batalkan
          </button>
        )}
      </div>
    </div>
  );
}
