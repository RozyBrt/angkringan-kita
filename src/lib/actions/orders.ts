'use server';

import { getSupabaseServer } from '@/lib/supabase/server';
import { OrderStatus } from '@/lib/types/order';
import { revalidatePath } from 'next/cache';

export async function updateOrderStatus(orderId: string | number, newStatus: OrderStatus) {
  try {
    const supabase = getSupabaseServer();

    // Auto-Decrement Logic: Kalau status berubah ke confirmed, kurangi stok
    if (newStatus === 'confirmed') {
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
          const newStock = Math.max(0, menuData.stock_quantity - item.quantity);
          const isAvailable = newStock > 0;

          const { error: updateError } = await supabase
            .from('menu_items')
            .update({ 
              stock_quantity: newStock,
              is_available: isAvailable
            })
            .eq('id', item.menu_item_id);

          if (updateError) throw updateError;
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
  items: Array<{ menu_item_id: string; quantity: number; price: number; subtotal: number }>;
}) {
  try {
    const supabase = getSupabaseServer();

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

    // 2. Validasi Stock
    for (const item of payload.items) {
      const { data: menuData, error: menuError } = await supabase
        .from('menu_items')
        .select('name, stock_quantity, is_track_stock, is_available')
        .eq('id', item.menu_item_id)
        .single();

      if (menuError || !menuData) continue;

      if (!menuData.is_available) {
         return { success: false, error: `Maaf, ${menuData.name} lagi kosong nih!` };
      }

      if (menuData.is_track_stock && menuData.stock_quantity !== null) {
        if (menuData.stock_quantity < item.quantity) {
          return { success: false, error: `Stok ${menuData.name} nggak cukup! Sisa: ${menuData.stock_quantity} porsi.` };
        }
      }
    }

    // 3. Create Order
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        customer_name: payload.customerName.trim(),
        table_number: payload.tableNumber || null,
        note: payload.note || null,
        total_price: payload.total,
        total_amount: payload.total,
        status: 'pending',
      })
      .select()
      .single();

    if (orderError) throw orderError;

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

    if (itemsError) throw itemsError;

    return { success: true, orderId: order.id, orderCode: order.order_code };

  } catch (err) {
    console.error('Runtime error in checkoutOrder:', err);
    return { success: false, error: err instanceof Error ? err.message : 'Terjadi kesalahan internal server saat checkout' };
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
