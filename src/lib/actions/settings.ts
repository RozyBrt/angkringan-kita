'use server';

import { getSupabaseServer } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export type ShopStatus = 'auto' | 'open' | 'closed';

export async function getShopStatus(): Promise<ShopStatus> {
  try {
    const supabase = getSupabaseServer();
    const { data, error } = await supabase
      .from('shop_settings')
      .select('value')
      .eq('key', 'shop_status')
      .single();

    if (error || !data) return 'auto';
    return data.value as ShopStatus;
  } catch (err) {
    console.error('Gagal ambil status toko:', err);
    return 'auto';
  }
}

export async function updateShopStatus(status: ShopStatus) {
  try {
    const supabase = getSupabaseServer();
    const { error } = await supabase
      .from('shop_settings')
      .upsert({ key: 'shop_status', value: status }, { onConflict: 'key' });

    if (error) throw error;
    
    revalidatePath('/');
    return { success: true };
  } catch (err) {
    console.error('Gagal update status toko:', err);
    return { success: false, error: 'Gagal update status toko bray' };
  }
}
