'use server';

import { supabase } from '@/lib/supabase/client';
import { OrderStatus } from '@/lib/types/order';
import { revalidatePath } from 'next/cache';

export async function updateOrderStatus(orderId: string | number, newStatus: OrderStatus) {
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
