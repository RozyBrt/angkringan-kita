'use server';

import { getSupabaseServer } from '@/lib/supabase/server';
import { OrderStatus } from '@/lib/types/order';
import { revalidatePath } from 'next/cache';

export async function updateOrderStatus(orderId: string | number, newStatus: OrderStatus) {
  try {
    const supabase = getSupabaseServer();
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

export async function getRevenueStats() {
  try {
    const supabase = getSupabaseServer();
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    const { data, error } = await supabase
      .from('orders')
      .select('created_at, total_price, total_amount, status')
      .eq('payment_status', 'paid')
      .gte('created_at', sevenDaysAgo.toISOString());

    if (error) {
      console.error('Gagal narik data revenue:', error);
      return { success: false, data: [] };
    }

    // Olah data pendapatan per hari
    const dailyData: Record<string, { date: string; revenue: number; orders: number }> = {};
    
    // Inisialisasi 7 hari dengan nilai 0
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      // Format lokal ID misal: "04 May"
      const dateStr = d.toLocaleDateString('id-ID', { day: '2-digit', month: 'short' });
      dailyData[dateStr] = { date: dateStr, revenue: 0, orders: 0 };
    }

    data.forEach((order) => {
      const dateStr = new Date(order.created_at).toLocaleDateString('id-ID', { day: '2-digit', month: 'short' });
      if (dailyData[dateStr]) {
        // Handle struktur field total_price atau total_amount sesuai db kamu
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

export async function getTopItems() {
  try {
    const supabase = getSupabaseServer();
    // Kita ambil dari item pesanan yang status bayarnya paid
    const { data, error } = await supabase
      .from('order_items')
      .select(`
        quantity,
        menu_items ( name ),
        orders!inner ( payment_status )
      `)
      .eq('orders.payment_status', 'paid');

    if (error) {
      console.error('Gagal narik data top items:', error);
      return { success: false, data: [] };
    }

    // Hitung quantity per menu
    const itemCounts: Record<string, number> = {};
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    data.forEach((item: any) => {
      const menuName = item.menu_items?.name;
      if (menuName) {
        itemCounts[menuName] = (itemCounts[menuName] || 0) + item.quantity;
      }
    });

    // Sort descending dan ambil Top 5
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
