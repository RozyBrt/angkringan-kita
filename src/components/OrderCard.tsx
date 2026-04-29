'use client';

import { OrderWithItems, OrderStatus } from '@/lib/types/order';
import { formatPrice } from '@/lib/cart';
import { updateOrderStatus } from '@/lib/actions/orders';
import { CheckCheck, Clock, ChevronDown, ChevronUp, Sparkles } from 'lucide-react';
import { useState } from 'react';

interface OrderCardProps {
  order: OrderWithItems;
  onStatusChange: (orderId: string | number, status: OrderStatus) => void;
  isNew?: boolean;
}

export default function OrderCard({ order, onStatusChange, isNew = false }: OrderCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [updating, setUpdating] = useState(false);

  async function handleUpdate(nextStatus: OrderStatus) {
    setUpdating(true);
    const res = await updateOrderStatus(order.id, nextStatus);
    if (res.success) {
      onStatusChange(order.id, nextStatus);
    } else {
      alert('Gagal update status: ' + res.error);
    }
    setUpdating(false);
  }

  async function handlePay() {
    setUpdating(true);
    const { completeAndPayOrder } = await import('@/lib/actions/orders');
    const res = await completeAndPayOrder(order.id);
    if (res.success) {
      onStatusChange(order.id, 'served');
    } else {
      alert('Gagal proses pembayaran: ' + res.error);
    }
    setUpdating(false);
  }

  const createdAt = new Date(order.created_at).toLocaleString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  const statusConfig = {
    pending: { label: 'Menunggu', nextLabel: 'Konfirmasi', nextStatus: 'confirmed', color: 'bg-coffee-600 text-white' },
    confirmed: { label: 'Dikonfirmasi', nextLabel: 'Mulai Masak', nextStatus: 'preparing', color: 'bg-blue-600 text-white' },
    preparing: { label: 'Dimasak', nextLabel: 'Siap Sajikan', nextStatus: 'ready', color: 'bg-orange-600 text-white' },
    ready: { label: 'Siap', nextLabel: 'Selesai & Bayar', nextStatus: 'served', color: 'bg-green-600 text-white' },
    served: { label: 'Selesai', nextLabel: null, nextStatus: null, color: 'bg-coffee-700 text-coffee-400' },
    cancelled: { label: 'Dibatalkan', nextLabel: null, nextStatus: null, color: 'bg-red-900/30 text-red-400' },
  };

  const config = statusConfig[order.status as keyof typeof statusConfig] || statusConfig.pending;

  return (
    <div
      className={`rounded-2xl border transition-all duration-200 overflow-hidden ${
        isNew
          ? 'bg-coffee-800 border-warm-500 ring-2 ring-warm-500/30 animate-pulse-soft'
          : order.status === 'served'
          ? 'bg-coffee-900/60 border-coffee-800 opacity-70'
          : 'bg-coffee-800 border-coffee-700'
      }`}
    >
      {/* Header */}
      <div className="p-4 flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className="font-bold text-cream-100 text-base">
              {order.customer_name} <span className="text-coffee-400 font-mono text-sm ml-1">#{order.id.toString().split('-')[0].toUpperCase()}</span>
            </span>
            {isNew && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold bg-warm-500 text-white">
                <Sparkles size={10} />
                Baru!
              </span>
            )}
            <span className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border border-coffee-700 bg-coffee-900/50 text-coffee-300`}>
              {config.label}
            </span>
          </div>
          <p className="text-coffee-400 text-xs">{createdAt}</p>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          <span className="font-bold text-cream-200 text-sm tabular-nums">
            {formatPrice(order.total_price)}
          </span>
          <button
            onClick={() => setExpanded((v) => !v)}
            className="text-coffee-400 hover:text-coffee-200 transition-colors p-1"
          >
            {expanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </button>
        </div>
      </div>

      {/* Expanded items */}
      {expanded && (
        <div className="px-4 pb-4 border-t border-coffee-700/50 pt-3 space-y-1.5 animate-fade-in">
          {order.order_items?.map((oi) => (
            <div key={oi.id} className="flex justify-between text-sm">
              <span className="text-coffee-300">
                {oi.menu_items?.name} × {oi.quantity}
              </span>
              <span className="text-coffee-200 font-medium tabular-nums">
                {formatPrice(oi.subtotal)}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Action */}
      <div className="px-4 pb-4">
        {config.nextLabel && (
          <button
            onClick={() => config.nextStatus === 'served' ? handlePay() : handleUpdate(config.nextStatus as any)}
            disabled={updating}
            className={`w-full py-2.5 rounded-xl font-semibold text-sm transition-all duration-200 
                        active:scale-95 flex items-center justify-center gap-2 ${config.color}
                        disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {updating ? (
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                {config.nextLabel}
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
}
