'use client';

import { OrderWithItems } from '@/types';
import { formatPrice } from '@/lib/cart';
import { supabase } from '@/lib/supabase';
import { CheckCheck, Clock, ChevronDown, ChevronUp, Sparkles } from 'lucide-react';
import { useState } from 'react';

interface OrderCardProps {
  order: OrderWithItems;
  onStatusChange: (orderId: string, status: 'pending' | 'done') => void;
  isNew?: boolean;
}

export default function OrderCard({ order, onStatusChange, isNew = false }: OrderCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [updating, setUpdating] = useState(false);

  const isDone = order.status === 'done';

  async function toggleStatus() {
    setUpdating(true);
    const newStatus = isDone ? 'pending' : 'done';

    const { error } = await supabase
      .from('orders')
      .update({ status: newStatus })
      .eq('id', order.id);

    if (!error) {
      onStatusChange(order.id, newStatus);
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

  return (
    <div
      className={`rounded-2xl border transition-all duration-200 overflow-hidden ${
        isNew
          ? 'bg-coffee-800 border-warm-500 ring-2 ring-warm-500/30 animate-pulse-soft'
          : isDone
          ? 'bg-coffee-900/60 border-coffee-800 opacity-70'
          : 'bg-coffee-800 border-coffee-700'
      }`}
    >
      {/* Header */}
      <div className="p-4 flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className="font-bold text-cream-100 text-base">
              {order.customer_name}
            </span>
            {isNew && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold bg-warm-500 text-white">
                <Sparkles size={10} />
                Baru!
              </span>
            )}
            {isDone ? (
              <span className="badge-done">
                <CheckCheck size={11} />
                Selesai
              </span>
            ) : (
              <span className="badge-pending">
                <Clock size={11} />
                Menunggu
              </span>
            )}
          </div>
          <p className="text-coffee-400 text-xs">{createdAt}</p>
          {order.note && (
            <p className="text-coffee-300 text-xs mt-1 italic">📝 {order.note}</p>
          )}
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          <span className="font-bold text-cream-200 text-sm tabular-nums">
            {formatPrice(order.total_price)}
          </span>
          <button
            onClick={() => setExpanded((v) => !v)}
            className="text-coffee-400 hover:text-coffee-200 transition-colors p-1"
            aria-label={expanded ? 'Ciutkan' : 'Buka detail'}
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
        <button
          id={`toggle-order-${order.id}`}
          onClick={toggleStatus}
          disabled={updating}
          className={`w-full py-2.5 rounded-xl font-semibold text-sm transition-all duration-200 
                      active:scale-95 flex items-center justify-center gap-2
                      ${
                        isDone
                          ? 'bg-coffee-700 text-coffee-300 hover:bg-coffee-600'
                          : 'bg-green-600 text-white hover:bg-green-500'
                      }
                      disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          {updating ? (
            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : isDone ? (
            <>
              <Clock size={15} />
              Tandai Menunggu
            </>
          ) : (
            <>
              <CheckCheck size={15} />
              Tandai Selesai
            </>
          )}
        </button>
      </div>
    </div>
  );
}
