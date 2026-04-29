'use client';

import { OrderWithItems } from '@/lib/types/order';
import { formatPrice } from '@/lib/cart';

interface OrderReceiptProps {
  order: OrderWithItems;
}

export default function OrderReceipt({ order }: OrderReceiptProps) {
  const dateStr = new Date(order.created_at).toLocaleString('id-ID', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });

  return (
    <div className="print-only hidden print:block bg-white text-black p-4 w-[80mm] mx-auto font-mono text-[10px] leading-tight">
      {/* CSS untuk mematikan elemen lain saat print */}
      <style jsx global>{`
        @media print {
          /* Sembunyikan isi body tapi jangan pake display:none */
          body {
            visibility: hidden;
            background: white;
          }
          /* Pastikan container luar nggak makan tempat */
          #root, .__next {
            height: 0 !important;
            overflow: hidden !important;
          }
          /* Tampilkan cuma area struk secara absolut di paling atas */
          .print-only {
            visibility: visible;
            display: block !important;
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            padding: 0;
            margin: 0;
          }
          .print-only * {
            visibility: visible;
          }
          /* Hilangkan header/footer bawaan browser */
          @page {
            margin: 0;
            size: auto;
          }
        }
      `}</style>

      <div className="text-center mb-4">
        <h2 className="text-sm font-bold uppercase">Angkringan Kita</h2>
        <p>Jl. Kenangan No. 69, Jakarta</p>
        <p>WA: 0812-3456-7890</p>
        <div className="border-b border-dashed border-black my-2"></div>
        <p className="font-bold">STRUK PEMBAYARAN</p>
        <p>#{order.order_code || order.id.toString().slice(0, 8)}</p>
      </div>

      <div className="space-y-1 mb-4">
        <div className="flex justify-between">
          <span>Tgl:</span>
          <span>{dateStr}</span>
        </div>
        <div className="flex justify-between">
          <span>Kasir:</span>
          <span>Admin</span>
        </div>
        <div className="flex justify-between">
          <span>Meja:</span>
          <span className="font-bold">{order.table_number || '-'}</span>
        </div>
        <div className="flex justify-between">
          <span>Nama:</span>
          <span>{order.customer_name}</span>
        </div>
      </div>

      <div className="border-b border-dashed border-black mb-2"></div>

      <div className="space-y-2 mb-4">
        {order.order_items.map((item, idx) => (
          <div key={idx}>
            <div className="flex justify-between font-bold">
              <span>{item.menu_items?.name || `Item #${item.menu_item_id}`}</span>
            </div>
            <div className="flex justify-between">
              <span>{item.quantity} x {formatPrice(item.price || (item.subtotal / item.quantity))}</span>
              <span>{formatPrice(item.subtotal)}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="border-b border-dashed border-black mb-2"></div>

      <div className="space-y-1 mb-4 text-sm font-bold">
        <div className="flex justify-between">
          <span>TOTAL</span>
          <span>{formatPrice(order.total_amount || order.total_price || 0)}</span>
        </div>
        <div className="flex justify-between">
          <span>METODE</span>
          <span>{order.payment_method || 'Tunai'}</span>
        </div>
        <div className="flex justify-between text-base">
          <span>STATUS</span>
          <span>LUNAS</span>
        </div>
      </div>

      <div className="text-center mt-6 italic space-y-1">
        <p>"Matur nuwun bray, ojo lali mampir meneh!"</p>
        <p className="text-[8px] not-italic opacity-50">Powered by Angkringan Kita Digital</p>
      </div>
    </div>
  );
}
