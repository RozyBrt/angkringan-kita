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
