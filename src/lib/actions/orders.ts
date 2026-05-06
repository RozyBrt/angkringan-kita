'use server';

import { getSupabaseServer } from '@/lib/supabase/server';
import { OrderStatus } from '@/lib/types/order';
import { revalidatePath } from 'next/cache';
import { validatePromoCode } from './promotions';

export async function updateOrderStatus(orderId: string | number, newStatus: OrderStatus) {
  try {
    const supabase = getSupabaseServer();

    // LOGIKA BALIKIN STOK (Kalau Cancelled)
    if (newStatus === 'cancelled') {
      // 1. Cek dulu status sebelumnya, jangan sampai stok balik dua kali
      const { data: currentOrder, error: orderError } = await supabase
        .from('orders')
        .select('status')
        .eq('id', orderId)
        .single();
      
      if (orderError) throw orderError;

      // Cuma balikin stok kalau status sebelumnya BUKAN cancelled
      if (currentOrder.status !== 'cancelled') {
        const { data: orderItems, error: itemsError } = await supabase
          .from('order_items')
          .select('menu_item_id, quantity')
          .eq('order_id', orderId);

        if (itemsError) throw itemsError;

        for (const item of orderItems) {
          const { data: menuData, error: menuError } = await supabase
            .from('menu_items')
            .select('stock_quantity, is_track_stock')
            .eq('id', item.menu_item_id)
            .single();

          if (menuError) throw menuError;

          if (menuData.is_track_stock && menuData.stock_quantity !== null) {
            const newStock = menuData.stock_quantity + item.quantity;
            // Kalau stok balik lagi > 0, otomatis jadi tersedia lagi
            const isAvailable = newStock > 0;

            await supabase
              .from('menu_items')
              .update({ 
                stock_quantity: newStock,
                is_available: isAvailable
              })
              .eq('id', item.menu_item_id);
          }
        }
      }
    }
    
    const { error } = await supabase
      .from('orders')
      .update({ status: newStatus })
      .eq('id', orderId);

    if (error) {
      console.error('Gagal update status:', error);
      return { success: false, error: error.message };
    }

    revalidatePath('/admin/dashboard');
    return { success: true };
  } catch (err) {
    console.error('Runtime error in updateOrderStatus:', err);
    return { success: false, error: err instanceof Error ? err.message : 'Terjadi kesalahan internal server' };
  }
}

export async function checkoutOrder(payload: {
  customerName: string;
  tableNumber: string | null;
  note: string | null;
  total: number;
  finalTotal: number;
  promoCode?: string | null;
  discountAmount?: number;
  items: Array<{ menu_item_id: string; quantity: number; price: number; subtotal: number }>;
}) {
  try {
    const supabase = getSupabaseServer();

    // 0. Validasi Promo Server-Side (The Loophole Fix 🛡️)
    let secureFinalTotal = payload.total;
    let secureDiscount = 0;

    if (payload.promoCode) {
      const promoCheck = await validatePromoCode(payload.promoCode, payload.total);
      if (!promoCheck.success) {
        return { success: false, error: promoCheck.error || 'Promo tidak valid bray.' };
      }
      secureFinalTotal = promoCheck.finalTotal!;
      secureDiscount = promoCheck.discountAmount!;
    }

    // 1. Validasi Meja
    if (payload.tableNumber) {
      const { data: existingOrder } = await supabase
        .from('orders')
        .select('id')
        .eq('table_number', payload.tableNumber)
        .not('status', 'in', '("served","cancelled")')
        .maybeSingle();

      if (existingOrder) {
        return { success: false, error: `Waduh bray, Meja ${payload.tableNumber} masih ada pesanan aktif. Silakan tunggu atau pilih meja lain ya!` };
      }
    }

    // 2. Validasi & Potong Stock
    const errors: string[] = [];
    const itemsToUpdate: { id: string | number; newStock: number; isAvailable: boolean }[] = [];

    for (const item of payload.items) {
      const { data: menuData, error: menuError } = await supabase
        .from('menu_items')
        .select('name, stock_quantity, is_track_stock, is_available')
        .eq('id', item.menu_item_id)
        .single();

      if (menuError || !menuData) continue;

      // Cek apakah menu beneran tersedia (pake logika yang sama kayak MenuCard)
      const isEffectivelyAvailable = menuData.is_available && (!menuData.is_track_stock || (menuData.stock_quantity ?? 0) > 0);

      if (!isEffectivelyAvailable) {
        errors.push(`${menuData.name} sudah habis`);
        continue;
      }

      if (menuData.is_track_stock && menuData.stock_quantity !== null) {
        if (menuData.stock_quantity < item.quantity) {
          errors.push(`Stok ${menuData.name} tidak cukup (Sisa: ${menuData.stock_quantity})`);
          continue;
        }

        // Kalau aman, kita simpan dulu rencana updatenya
        const newStock = menuData.stock_quantity - item.quantity;
        itemsToUpdate.push({
          id: item.menu_item_id,
          newStock,
          isAvailable: newStock > 0
        });
      }
    }

    // Kalau ada error, kita kasih tau semuanya sekaligus bray!
    if (errors.length > 0) {
      return { 
        success: false, 
        error: `Waduh bray, ada masalah sama pesananmu: ${errors.join(', ')}. Tolong sesuaikan keranjangmu ya!` 
      };
    }

    // 2.5 Eksekusi Potong Stok (Kalau semua item aman)
    for (const update of itemsToUpdate) {
      const { error: updateError } = await supabase
        .from('menu_items')
        .update({ 
          stock_quantity: update.newStock,
          is_available: update.isAvailable
        })
        .eq('id', update.id);
      
      if (updateError) throw updateError;
    }

    // 3. Create Order
    const pointsEarned = Math.floor(secureFinalTotal * 0.1); // 10% dari total akhir
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        customer_name: payload.customerName.trim(),
        table_number: payload.tableNumber || null,
        note: payload.note || null,
        total_price: payload.total,
        total_amount: secureFinalTotal,
        promo_code_used: payload.promoCode || null,
        discount_amount: secureDiscount,
        points_earned: pointsEarned,
        status: 'pending',
      })
      .select()
      .single();

    if (orderError) {
      // REM DARURAT: Balikin stok kalau gagal bikin pesanan utama
      for (const update of itemsToUpdate) {
        const { data: menu } = await supabase.from('menu_items').select('stock_quantity').eq('id', update.id).single();
        if (menu) {
          await supabase.from('menu_items').update({ 
            stock_quantity: menu.stock_quantity + (payload.items.find(i => i.menu_item_id === update.id)?.quantity || 0),
            is_available: true
          }).eq('id', update.id);
        }
      }
      throw orderError;
    }

    // 4. Create Order Items
    const orderItems = payload.items.map((item) => ({
      order_id: order.id,
      menu_item_id: item.menu_item_id,
      quantity: item.quantity,
      price: item.price,
      subtotal: item.subtotal,
    }));

    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(orderItems);

    if (itemsError) {
      // REM DARURAT: Balikin stok kalau gagal bikin detail item
      for (const update of itemsToUpdate) {
        const { data: menu } = await supabase.from('menu_items').select('stock_quantity').eq('id', update.id).single();
        if (menu) {
          await supabase.from('menu_items').update({ 
            stock_quantity: menu.stock_quantity + (payload.items.find(i => i.menu_item_id === update.id)?.quantity || 0),
            is_available: true
          }).eq('id', update.id);
        }
      }
      // Hapus juga order utama yang tadi udah telanjur masuk
      await supabase.from('orders').delete().eq('id', order.id);
      throw itemsError;
    }

    // 4.5 Increment promo usage count
    if (payload.promoCode) {
      // Ambil count terbaru dulu baru kita tambahin 1 bray
      const { data: promoData } = await supabase
        .from('promotions')
        .select('usage_count')
        .eq('code', payload.promoCode.toUpperCase())
        .single();
      
      if (promoData) {
        await supabase
          .from('promotions')
          .update({ usage_count: promoData.usage_count + 1 })
          .eq('code', payload.promoCode.toUpperCase());
      }
    }

    return { success: true, orderId: order.id, orderCode: order.order_code, pointsEarned };

  } catch (err) {
    console.error('Runtime error in checkoutOrder:', err);
    let errorMsg = 'Terjadi kesalahan internal server saat checkout';
    if (err instanceof Error) {
      errorMsg = err.message;
    } else if (typeof err === 'object' && err !== null && 'message' in err) {
      errorMsg = String(err.message);
    } else {
      errorMsg = JSON.stringify(err);
    }
    return { success: false, error: errorMsg };
  }
}

export async function completeAndPayOrder(orderId: string | number, paymentMethod: string = 'Tunai') {
  try {
    const supabase = getSupabaseServer();
    const { error } = await supabase
      .from('orders')
      .update({ 
        status: 'served',
        payment_status: 'paid',
        payment_method: paymentMethod,
        served_at: new Date().toISOString()
      })
      .eq('id', orderId);

    if (error) {
      console.error('Gagal menyelesaikan pesanan:', error);
      return { success: false, error: error.message };
    }

    revalidatePath('/admin/dashboard');
    return { success: true };
  } catch (err) {
    console.error('Runtime error in completeAndPayOrder:', err);
    return { success: false, error: err instanceof Error ? err.message : 'Terjadi kesalahan internal server' };
  }
}

export async function getRevenueStats(days: number = 7) {
  try {
    const supabase = getSupabaseServer();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - (days - 1));
    startDate.setHours(0, 0, 0, 0);

    const { data, error } = await supabase
      .from('orders')
      .select('created_at, total_price, total_amount, status')
      .eq('payment_status', 'paid')
      .gte('created_at', startDate.toISOString());

    if (error) {
      console.error('Gagal narik data revenue:', error);
      return { success: false, data: [] };
    }

    // Olah data pendapatan per hari
    const dailyData: Record<string, { date: string; revenue: number; orders: number }> = {};
    
    // Inisialisasi X hari dengan nilai 0
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toLocaleDateString('id-ID', { day: '2-digit', month: 'short' });
      dailyData[dateStr] = { date: dateStr, revenue: 0, orders: 0 };
    }

    data.forEach((order) => {
      const dateStr = new Date(order.created_at).toLocaleDateString('id-ID', { day: '2-digit', month: 'short' });
      if (dailyData[dateStr]) {
        const amount = Number(order.total_amount || order.total_price || 0);
        dailyData[dateStr].revenue += amount;
        dailyData[dateStr].orders += 1;
      }
    });

    const result = Object.values(dailyData);
    return { success: true, data: result };
  } catch (err) {
    console.error('Runtime error in getRevenueStats:', err);
    return { success: false, data: [] };
  }
}

export async function getTopItems(days: number = 7) {
  try {
    const supabase = getSupabaseServer();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - (days - 1));
    startDate.setHours(0, 0, 0, 0);

    const { data, error } = await supabase
      .from('order_items')
      .select(`
        quantity,
        menu_items ( name ),
        orders!inner ( payment_status, created_at )
      `)
      .eq('orders.payment_status', 'paid')
      .gte('orders.created_at', startDate.toISOString());

    if (error) {
      console.error('Gagal narik data top items:', error);
      return { success: false, data: [] };
    }

    const itemCounts: Record<string, number> = {};
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    data.forEach((item: any) => {
      const menuName = item.menu_items?.name;
      if (menuName) {
        itemCounts[menuName] = (itemCounts[menuName] || 0) + item.quantity;
      }
    });

    const result = Object.entries(itemCounts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);

    return { success: true, data: result };
  } catch (err) {
    console.error('Runtime error in getTopItems:', err);
    return { success: false, data: [] };
  }
}
