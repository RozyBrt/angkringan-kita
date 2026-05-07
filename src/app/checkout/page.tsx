'use client';

import { useState, FormEvent, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useCart } from '@/hooks/useCart';
import { formatPrice } from '@/lib/cart';
import { checkoutOrder, getOccupiedTables } from '@/lib/actions/orders';
import { ArrowLeft, Send, User, Hash, MessageSquare, QrCode, CheckCheck, Tag, Star, X } from 'lucide-react';
import { useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';

// QRIS Modal Component
function QRISModal({
  orderCode,
  totalAmount,
  pointsEarned,
  customerName,
  onConfirmPayment,
}: {
  orderCode: string;
  totalAmount: number;
  pointsEarned: number;
  customerName: string;
  onConfirmPayment: () => void;
}) {
  const [confirming, setConfirming] = useState(false);

  async function handleConfirmPayment() {
    setConfirming(true);
    onConfirmPayment();
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in overflow-y-auto">
      <div className="bg-white rounded-3xl w-full max-w-sm shadow-2xl animate-slide-up my-4">
        {/* Header */}
        <div className="bg-coffee-900 rounded-t-3xl p-5 text-center">
          <div className="inline-flex items-center gap-2 bg-warm-500/20 text-warm-300 border border-warm-500/30 
                          px-3 py-1 rounded-full text-xs font-medium mb-3">
            <QrCode size={12} />
            Pembayaran QRIS
          </div>
          <p className="text-coffee-300 text-xs">Pesanan #{orderCode}</p>
          <p className="text-cream-50 font-display text-2xl font-bold mt-1">
            {formatPrice(totalAmount)}
          </p>
        </div>

        {/* QRIS Image */}
        <div className="p-5">
          <div className="bg-cream-50 border-2 border-cream-200 rounded-2xl p-4 flex flex-col items-center">
            {/* QR Code Visual (Pattern beneran tapi dummy) */}
            <div className="relative w-44 h-44 mb-3">
              <svg viewBox="0 0 200 200" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
                {/* Corner squares */}
                <rect x="10" y="10" width="50" height="50" fill="none" stroke="#3b1f0a" strokeWidth="8" rx="4"/>
                <rect x="20" y="20" width="30" height="30" fill="#3b1f0a" rx="2"/>
                <rect x="140" y="10" width="50" height="50" fill="none" stroke="#3b1f0a" strokeWidth="8" rx="4"/>
                <rect x="150" y="20" width="30" height="30" fill="#3b1f0a" rx="2"/>
                <rect x="10" y="140" width="50" height="50" fill="none" stroke="#3b1f0a" strokeWidth="8" rx="4"/>
                <rect x="20" y="150" width="30" height="30" fill="#3b1f0a" rx="2"/>
                {/* Data dots pattern */}
                {[70,80,90,100,110,120,130].map((x) => 
                  [70,80,90,100,110,120,130].map((y) => 
                    (Math.sin(x * y) > 0.3) && (
                      <rect key={`${x}-${y}`} x={x} y={y} width="7" height="7" fill="#3b1f0a" rx="1"/>
                    )
                  )
                )}
                {[70,90,110,130].map(x =>
                  [10,20,30,40,50,150,160,170,180].map(y =>
                    (Math.cos(x + y) > 0.2) && (
                      <rect key={`a-${x}-${y}`} x={x} y={y} width="7" height="7" fill="#3b1f0a" rx="1"/>
                    )
                  )
                )}
                {[10,20,30,40,50,150,160,170,180].map(x =>
                  [70,90,110,130].map(y =>
                    (Math.sin(x * 0.3 + y * 0.7) > 0.1) && (
                      <rect key={`b-${x}-${y}`} x={x} y={y} width="7" height="7" fill="#3b1f0a" rx="1"/>
                    )
                  )
                )}
                {/* Center logo placeholder */}
                <rect x="85" y="85" width="30" height="30" fill="white" rx="4"/>
                <text x="100" y="105" textAnchor="middle" fontSize="16" fill="#c2724f">☕</text>
              </svg>
            </div>
            <div className="text-center">
              <p className="text-xs font-bold text-coffee-700 uppercase tracking-widest">Angkringan Kita</p>
              <p className="text-[10px] text-coffee-400 mt-0.5">NMID: ID1026007012345</p>
            </div>
          </div>

          {/* Info */}
          <div className="mt-4 space-y-2 text-xs text-coffee-600">
            <div className="flex justify-between">
              <span>Nama Pemesan</span>
              <span className="font-semibold">{customerName}</span>
            </div>
            <div className="flex justify-between">
              <span>Total Bayar</span>
              <span className="font-bold text-coffee-900">{formatPrice(totalAmount)}</span>
            </div>
            {pointsEarned > 0 && (
              <div className="flex justify-between bg-amber-50 rounded-lg px-3 py-1.5">
                <span className="flex items-center gap-1 text-amber-700">
                  <Star size={11} fill="currentColor" />
                  Poin yang akan didapat
                </span>
                <span className="font-bold text-amber-700">+{pointsEarned}</span>
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="px-5 pb-5 space-y-2">
          <button
            id="confirm-payment-btn"
            onClick={handleConfirmPayment}
            disabled={confirming}
            className="w-full flex items-center justify-center gap-2 py-3.5 px-4 
                       bg-green-500 hover:bg-green-600 text-white font-bold rounded-2xl 
                       transition-all active:scale-95 shadow-lg shadow-green-200 
                       disabled:opacity-70 disabled:cursor-not-allowed text-sm"
          >
            {confirming ? (
              <><span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> Memproses...</>
            ) : (
              <><CheckCheck size={18} /> Saya Sudah Bayar</>
            )}
          </button>
          <p className="text-center text-[10px] text-coffee-400 leading-relaxed">
            Scan QR di atas menggunakan aplikasi perbankan atau dompet digital apapun. 
            Tombol konfirmasi akan mengirim pesananmu ke dapur.
          </p>
        </div>
      </div>
    </div>
  );
}

import { getShopStatus, ShopStatus } from '@/lib/actions/settings';

function CheckoutContent() {
  const searchParams = useSearchParams();
  const { cart, total, emptyCart } = useCart();
  const router = useRouter();

  // Ambil data promo dari URL param
  const promoCodeParam = searchParams.get('promo');
  const discountAmountParam = Number(searchParams.get('discount') || 0);
  const pointsUsedParam = Number(searchParams.get('points_used') || 0);
  const finalTotalParam = Number(searchParams.get('final') || total);

  // Shop Status State
  const [isShopOpen, setIsShopOpen] = useState(true);

  // Gunakan finalTotalParam kalau ada promo valid, kalau tidak pakai total keranjang
  const hasPromo = promoCodeParam && discountAmountParam > 0;
  const effectiveFinal = hasPromo ? finalTotalParam : total;
  const effectiveDiscount = hasPromo ? discountAmountParam : 0;

  const [customerName, setCustomerName] = useState('');
  const [tableNumber, setTableNumber] = useState('');
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);
  const [isDone, setIsDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Table Selection State
  const [occupiedTables, setOccupiedTables] = useState<string[]>([]);
  const [showTablePicker, setShowTablePicker] = useState(false);
  const [fetchingTables, setFetchingTables] = useState(false);

  useEffect(() => {
    async function init() {
      setFetchingTables(true);
      
      // Cek Status Toko Bray
      const status = await getShopStatus();
      if (status === 'open') {
        setIsShopOpen(true);
      } else if (status === 'closed') {
        setIsShopOpen(false);
      } else {
        const hours = new Date().getHours();
        setIsShopOpen(hours >= 17 && hours <= 23);
      }

      const res = await getOccupiedTables();
      if (res.success && res.data) {
        setOccupiedTables(res.data as string[]);
      }
      setFetchingTables(false);
    }
    
    init();

    // REALTIME: Dengerin perubahan meja DAN status toko bray! 📡
    const tableChannel = supabase
      .channel('table-availability')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'orders' },
        async () => {
          const res = await getOccupiedTables();
          if (res.success && res.data) {
            setOccupiedTables(res.data as string[]);
          }
        }
      )
      .subscribe();

    const settingsChannel = supabase
      .channel('checkout-settings')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'shop_settings' },
        (payload) => {
          const newData = payload.new as { key: string, value: string };
          if (newData && newData.key === 'shop_status') {
            const newStatus = newData.value as ShopStatus;
            if (newStatus === 'open') {
              setIsShopOpen(true);
            } else if (newStatus === 'closed') {
              setIsShopOpen(false);
            } else {
              const hours = new Date().getHours();
              setIsShopOpen(hours >= 17 && hours <= 23);
            }
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(tableChannel);
      supabase.removeChannel(settingsChannel);
    };
  }, []);

  // QRIS Modal state
  const [showQRIS, setShowQRIS] = useState(false);
  const [orderResult, setOrderResult] = useState<{
    orderId: string;
    orderCode: string;
    pointsEarned: number;
  } | null>(null);

  if (cart.items.length === 0 && !loading && !isDone && !showQRIS) {
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
    if (!tableNumber) {
      setError('Pilih nomor meja dulu bray!');
      return;
    }

    if (!isShopOpen) {
      setError('Maaf bray, toko sedang tutup. Pesanan tidak bisa diproses.');
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
        finalTotal: effectiveFinal,
        promoCode: promoCodeParam || null,
        discountAmount: effectiveDiscount,
        items,
      });

      if (!res.success) {
        setError(res.error || 'Terjadi kesalahan saat memproses pesanan.');
        setLoading(false);
        return;
      }

      // Simpan poin ke localStorage
      const pointsEarned = res.pointsEarned || 0;
      try {
        const existingPoints = parseInt(localStorage.getItem('angkringan_loyalty_points') || '0', 10);
        // Tambah poin baru DAN potong poin yang dipake bray
        const newTotal = existingPoints + pointsEarned - pointsUsedParam;
        localStorage.setItem('angkringan_loyalty_points', String(Math.max(0, newTotal)));
      } catch { /* ignore */ }

      // Simpan riwayat pesanan
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

      setIsDone(true);
      setOrderResult({
        orderId: res.orderId,
        orderCode: res.orderCode || '',
        pointsEarned,
      });

      // Tampilkan QRIS modal
      setShowQRIS(true);
      setLoading(false);

      // Kosongkan keranjang di background
      setTimeout(() => emptyCart(), 500);

    } catch (err) {
      console.error(err);
      const errorMessage = err instanceof Error ? err.message : 'Gagal mengirim pesanan. Coba lagi ya!';
      setError(errorMessage);
      setLoading(false);
    }
  }

  function handlePaymentConfirmed() {
    // Redirect ke halaman sukses setelah pelanggan konfirmasi bayar
    router.push(`/order-success?id=${orderResult?.orderId}&points=${orderResult?.pointsEarned || 0}`);
  }

  return (
    <>
      {/* QRIS Payment Modal */}
      {showQRIS && orderResult && (
        <QRISModal
          orderCode={orderResult.orderCode}
          totalAmount={effectiveFinal}
          pointsEarned={orderResult.pointsEarned}
          customerName={customerName}
          onConfirmPayment={handlePaymentConfirmed}
        />
      )}

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
            <label className="block text-sm font-semibold text-coffee-800 mb-2">
              <span className="flex items-center gap-1.5">
                <Hash size={14} />
                Nomor Meja <span className="text-warm-500">*</span>
              </span>
            </label>
            
            <div className="flex flex-col gap-2">
              {tableNumber ? (
                <div className="flex items-center justify-between p-4 bg-coffee-100 border-2 border-coffee-200 rounded-2xl animate-fade-in">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-coffee-800 text-white rounded-xl flex items-center justify-center font-bold font-display">
                      {tableNumber}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-coffee-900">Meja Terpilih</p>
                      <p className="text-xs text-coffee-500 uppercase tracking-tighter">Angkringan Kita — Meja {tableNumber}</p>
                    </div>
                  </div>
                  <button 
                    type="button"
                    onClick={() => setShowTablePicker(true)}
                    className="text-xs font-bold text-coffee-600 hover:text-coffee-800 underline"
                  >
                    Ganti
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setShowTablePicker(true)}
                  className="w-full flex items-center justify-between p-4 bg-white border-2 border-dashed border-coffee-200 rounded-2xl hover:border-coffee-400 hover:bg-coffee-50 transition-all text-coffee-500"
                >
                  <span className="text-sm">Klik untuk pilih nomor meja...</span>
                  <div className="w-8 h-8 bg-coffee-100 rounded-lg flex items-center justify-center">
                    <Hash size={16} className="text-coffee-600" />
                  </div>
                </button>
              )}
            </div>
            {/* Validasi Meja Kosong */}
            <input type="hidden" name="table_number" value={tableNumber} required />
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

          {/* Order Summary */}
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

            <div className="space-y-1.5 border-t border-cream-300 pt-2.5">
              {effectiveDiscount > 0 && (
                <>
                  <div className="flex justify-between text-sm text-coffee-500">
                    <span>Subtotal</span>
                    <span className="tabular-nums">{formatPrice(total)}</span>
                  </div>
                  <div className="flex justify-between text-sm text-green-600 font-medium">
                    <span className="flex items-center gap-1">
                      <Tag size={12} />
                      Diskon ({promoCodeParam})
                    </span>
                    <span className="tabular-nums">- {formatPrice(effectiveDiscount)}</span>
                  </div>
                </>
              )}
              {pointsUsedParam > 0 && (
                <div className="flex justify-between text-sm text-amber-600 font-medium">
                  <span className="flex items-center gap-1">
                    <Star size={12} fill="currentColor" />
                    Tukar Poin
                  </span>
                  <span className="tabular-nums">- {formatPrice(pointsUsedParam)}</span>
                </div>
              )}
              <div className="flex justify-between pt-1">
                <span className="font-bold text-coffee-900 text-sm">Total Bayar</span>
                <div className="text-right">
                  {(effectiveDiscount > 0 || pointsUsedParam > 0) && (
                    <p className="text-xs text-coffee-400 line-through tabular-nums">{formatPrice(total)}</p>
                  )}
                  <span className="font-bold text-coffee-800 text-base tabular-nums">
                    {formatPrice(effectiveFinal)}
                  </span>
                </div>
              </div>

              {/* Poin preview */}
              <div className="flex items-center justify-between bg-amber-50 border border-amber-100 rounded-lg px-3 py-1.5 mt-1">
                <span className="text-xs text-amber-700 flex items-center gap-1">
                  <Star size={11} fill="currentColor" />
                  Poin yang akan kamu dapat
                </span>
                <span className="text-xs font-bold text-amber-700">+{Math.floor(effectiveFinal * 0.1)} poin</span>
              </div>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading || isDone || !isShopOpen}
            className={`w-full flex items-center justify-center gap-2 text-base py-3.5 rounded-2xl font-bold transition-all active:scale-95 shadow-lg ${
              !isShopOpen 
                ? 'bg-zinc-200 text-zinc-400 cursor-not-allowed shadow-none' 
                : 'bg-coffee-700 hover:bg-coffee-800 text-cream-50 shadow-coffee-200'
            }`}
          >
            {loading ? (
              <><span className="w-4 h-4 border-2 border-cream-400 border-t-cream-50 rounded-full animate-spin" /> Memproses...</>
            ) : isDone ? (
              <><Send size={16} /> Berhasil!</>
            ) : !isShopOpen ? (
              <>Toko Sedang Tutup 🌙</>
            ) : (
              <><QrCode size={16} /> Lanjut ke Pembayaran QRIS</>
            )}
          </button>
        </form>
      </div>

      {/* Table Picker Modal bray! */}
      {showTablePicker && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-[2.5rem] w-full max-w-md shadow-2xl animate-slide-up max-h-[90vh] flex flex-col">
            {/* Modal Header */}
            <div className="p-6 border-b border-cream-100 flex items-center justify-between">
              <div>
                <h3 className="text-xl font-display font-bold text-coffee-900">Pilih Meja</h3>
                <p className="text-xs text-coffee-500 mt-0.5">Silakan pilih meja yang kosong bray</p>
              </div>
              <button 
                onClick={() => setShowTablePicker(false)}
                className="w-10 h-10 rounded-full bg-cream-50 flex items-center justify-center text-coffee-400 hover:text-coffee-900 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Table Grid */}
            <div className="p-6 overflow-y-auto custom-scrollbar flex-grow">
              {fetchingTables ? (
                <div className="flex flex-col items-center justify-center py-20 text-coffee-300">
                  <div className="w-8 h-8 border-3 border-coffee-100 border-t-coffee-600 rounded-full animate-spin mb-3" />
                  <p className="text-xs font-medium italic">Mengecek ketersediaan meja...</p>
                </div>
              ) : (
                <div className="grid grid-cols-5 gap-3">
                  {Array.from({ length: 30 }).map((_, i) => {
                    const num = (i + 1).toString();
                    const isOccupied = occupiedTables.includes(num);
                    const isSelected = tableNumber === num;

                    return (
                      <button
                        key={num}
                        disabled={isOccupied}
                        onClick={() => {
                          setTableNumber(num);
                          setShowTablePicker(false);
                        }}
                        type="button"
                        className={`
                          aspect-square rounded-2xl flex flex-col items-center justify-center transition-all relative overflow-hidden
                          ${isOccupied 
                            ? 'bg-red-50 text-red-300 border-red-100 cursor-not-allowed opacity-60' 
                            : isSelected 
                              ? 'bg-coffee-800 text-white border-coffee-900 scale-95 shadow-inner' 
                              : 'bg-cream-50 text-coffee-700 border-cream-200 hover:border-coffee-400 hover:bg-cream-100'
                          }
                          border-2
                        `}
                      >
                        <span className="text-lg font-display font-black leading-none">{num}</span>
                        <span className="text-[8px] uppercase font-bold tracking-tighter mt-1">
                          {isOccupied ? 'Penuh' : isSelected ? 'Pilih' : 'Kosong'}
                        </span>
                        {isOccupied && (
                          <div className="absolute top-1 right-1">
                            <X size={8} />
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-6 bg-cream-50 rounded-b-[2.5rem] flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-cream-200 border border-cream-300" />
                  <span className="text-[10px] font-bold text-coffee-600 uppercase">Kosong</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-100 border border-red-200" />
                  <span className="text-[10px] font-bold text-red-400 uppercase">Penuh</span>
                </div>
              </div>
              <p className="text-[10px] text-coffee-400 italic">Tersedia 30 Meja</p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={<div className="text-center py-20 text-coffee-400">Loading...</div>}>
      <CheckoutContent />
    </Suspense>
  );
}
