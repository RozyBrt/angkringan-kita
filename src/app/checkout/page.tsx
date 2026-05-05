'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useCart } from '@/hooks/useCart';
import { formatPrice } from '@/lib/cart';
import { checkoutOrder } from '@/lib/actions/orders';
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
        <div className="w-24 h-24 bg-coffee-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <MessageSquare size={32} className="text-coffee-400" />
        </div>
        <h2 className="text-2xl font-display font-semibold text-coffee-900 mb-2">Keranjang Kosong</h2>
        <p className="text-coffee-600 mb-8">Pilih menu dulu bray, masa mau bayar angin.</p>
        <Link href="/" className="btn-primary inline-flex items-center gap-2">
          <ArrowLeft size={18} />
          Balik ke Menu
        </Link>
      </div>
    );
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!customerName.trim()) {
      setError('Nama pemesan harus diisi ya bray!');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const cleanTableNumber = tableNumber.trim();
      const noteText = [
        cleanTableNumber ? `Meja: ${cleanTableNumber}` : '',
        note,
      ]
        .filter(Boolean)
        .join(' | ');

      const items = cart.items.map((item) => ({
        menu_item_id: item.menuItem.id,
        quantity: item.quantity,
        price: item.menuItem.price,
        subtotal: item.menuItem.price * item.quantity,
      }));

      const res = await checkoutOrder({
        customerName: customerName.trim(),
        tableNumber: cleanTableNumber || null,
        note: noteText || null,
        total,
        items
      });

      if (!res.success) {
        setError(res.error || 'Terjadi kesalahan saat memproses pesanan.');
        setLoading(false);
        return;
      }

      // Tandai sebagai selesai agar UI tidak berubah saat keranjang dikosongkan
      setIsDone(true);

      // Simpan riwayat pesanan (lengkap dengan nama) ke localStorage untuk tracking
      try {
        const stored = localStorage.getItem('angkringan_recent_orders');
        let recent: Array<{ id: string; order_code?: string; name?: string; time?: string } | string> = [];
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed)) recent = parsed;
        }

        recent.unshift({
          id: res.orderId,
          order_code: res.orderCode,
          name: customerName.trim(),
          time: new Date().toISOString()
        });

        localStorage.setItem('angkringan_recent_orders', JSON.stringify(recent.slice(0, 5)));
      } catch { /* ignore */ }

      router.push(`/order-success?id=${res.orderId}`);

      // Kosongkan keranjang di background
      setTimeout(() => {
        emptyCart();
      }, 1000);

    } catch (err) {
      console.error(err);
      const errorMessage = err instanceof Error ? err.message : 'Gagal mengirim pesanan. Coba lagi ya!';
      setError(errorMessage);
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
