'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useCart } from '@/hooks/useCart';
import { formatPrice } from '@/lib/cart';
import { supabase } from '@/lib/supabase';
import { ArrowLeft, Send, User, Hash, MessageSquare } from 'lucide-react';

export default function CheckoutPage() {
  const { cart, total, emptyCart } = useCart();
  const router = useRouter();

  const [customerName, setCustomerName] = useState('');
  const [tableNumber, setTableNumber] = useState('');
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);
  const [isDone, setIsDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Hanya tampilkan 'Kosong' jika benar-benar kosong dan tidak sedang/telah memesan
  if (cart.items.length === 0 && !loading && !isDone) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center animate-fade-in">
        <p className="text-5xl mb-4">🛒</p>
        <h1 className="font-display text-2xl font-bold text-coffee-900 mb-3">
          Keranjang Kosong
        </h1>
        <p className="text-coffee-500 mb-6">Tambahin menu dulu sebelum checkout ya!</p>
        <Link href="/" className="btn-primary inline-flex items-center gap-2">
          <ArrowLeft size={16} />
          Lihat Menu
        </Link>
      </div>
    );
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!customerName.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const noteText = [
        tableNumber ? `Meja: ${tableNumber}` : '',
        note,
      ]
        .filter(Boolean)
        .join(' | ');

      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          customer_name: customerName.trim(),
          note: noteText || null,
          total_price: total,
          status: 'pending',
        })
        .select()
        .single();

      if (orderError) throw orderError;

      const orderItems = cart.items.map((item) => ({
        order_id: order.id,
        menu_item_id: item.menuItem.id,
        quantity: item.quantity,
        subtotal: item.menuItem.price * item.quantity,
      }));

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);

      if (itemsError) throw itemsError;

      // Tandai sebagai selesai agar UI tidak berubah saat keranjang dikosongkan
      setIsDone(true);
      router.push(`/order-success?id=${order.id}`);
      
      // Kosongkan keranjang di background
      setTimeout(() => {
        emptyCart();
      }, 1000);

    } catch (err: any) {
      console.error(err);
      setError(err?.message || 'Gagal mengirim pesanan. Coba lagi ya!');
      setLoading(false);
    }
  }

  return (
    <div className="max-w-xl mx-auto px-4 py-8 animate-fade-in">
      <div className="mb-7">
        <Link
          href="/cart"
          className="inline-flex items-center gap-1.5 text-coffee-500 hover:text-coffee-700 
                     text-sm font-medium transition-colors mb-4"
        >
          <ArrowLeft size={15} />
          Kembali ke Keranjang
        </Link>
        <h1 className="font-display text-3xl font-bold text-coffee-900">Checkout</h1>
        <p className="text-coffee-500 text-sm mt-1">Isi detail pesananmu dulu ya</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label htmlFor="customer-name" className="block text-sm font-semibold text-coffee-800 mb-2">
            <span className="flex items-center gap-1.5">
              <User size={14} />
              Nama Kamu <span className="text-warm-500">*</span>
            </span>
          </label>
          <input
            id="customer-name"
            type="text"
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
            placeholder="Contoh: Budi"
            required
            className="input-field"
          />
        </div>

        <div>
          <label htmlFor="table-number" className="block text-sm font-semibold text-coffee-800 mb-2">
            <span className="flex items-center gap-1.5">
              <Hash size={14} />
              Nomor Meja <span className="text-coffee-400 font-normal">(opsional)</span>
            </span>
          </label>
          <input
            id="table-number"
            type="text"
            value={tableNumber}
            onChange={(e) => setTableNumber(e.target.value)}
            placeholder="Contoh: 5"
            className="input-field"
          />
        </div>

        <div>
          <label htmlFor="order-note" className="block text-sm font-semibold text-coffee-800 mb-2">
            <span className="flex items-center gap-1.5">
              <MessageSquare size={14} />
              Catatan Pesanan <span className="text-coffee-400 font-normal">(opsional)</span>
            </span>
          </label>
          <textarea
            id="order-note"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Contoh: Es kopi jangan terlalu manis"
            rows={3}
            className="input-field resize-none"
          />
        </div>

        <div className="bg-cream-50 rounded-2xl border border-cream-200 p-4">
          <h2 className="font-semibold text-coffee-800 text-sm mb-3">Pesananmu</h2>
          <div className="space-y-1.5 mb-3">
            {cart.items.map((item) => (
              <div key={item.menuItem.id} className="flex justify-between text-sm text-coffee-600">
                <span className="truncate mr-2">{item.menuItem.name} × {item.quantity}</span>
                <span className="font-medium tabular-nums flex-shrink-0">
                  {formatPrice(item.menuItem.price * item.quantity)}
                </span>
              </div>
            ))}
          </div>
          <div className="border-t border-cream-300 pt-2.5 flex justify-between">
            <span className="font-bold text-coffee-900 text-sm">Total</span>
            <span className="font-bold text-coffee-800 text-base tabular-nums">
              {formatPrice(total)}
            </span>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading || isDone}
          className="btn-primary w-full flex items-center justify-center gap-2 text-base py-3.5"
        >
          {loading ? (
            <><span className="w-4 h-4 border-2 border-cream-400 border-t-cream-50 rounded-full animate-spin" /> Memproses...</>
          ) : isDone ? (
            <><Send size={16} /> Berhasil!</>
          ) : (
            <><Send size={16} /> Konfirmasi Pesanan</>
          )}
        </button>
      </form>
    </div>
  );
}
