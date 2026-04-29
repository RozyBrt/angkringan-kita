'use server';

import { getSupabaseServer } from '@/lib/supabase/server';
import { OrderStatus } from '@/lib/types/order';
import { revalidatePath } from 'next/cache';

export async function updateOrderStatus(orderId: string | number, newStatus: OrderStatus) {
  const supabase = getSupabaseServer();
  const { error } = await supabase
    .from('orders')
    .update({ status: newStatus })
    .eq('id', orderId);

  if (error) {
    console.error('Gagal update status:', error);
    return { success: false, error: error.message };
  }

  revalidatePath('/admin/dashboard'); // Biar data di dashboard langsung seger
  return { success: true };
}

export async function completeAndPayOrder(orderId: string | number, paymentMethod: string = 'Tunai') {
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
}
