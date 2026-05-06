'use server';

import { getSupabaseServer } from '@/lib/supabase/server';

export interface PromoValidationResult {
  success: boolean;
  error?: string;
  promo?: {
    code: string;
    description: string;
    discount_type: 'fixed' | 'percentage';
    value: number;
    min_order_amount: number;
  };
  discountAmount?: number;
  finalTotal?: number;
}

export async function validatePromoCode(
  code: string,
  orderTotal: number
): Promise<PromoValidationResult> {
  try {
    const supabase = getSupabaseServer();

    const { data: promo, error } = await supabase
      .from('promotions')
      .select('*')
      .eq('code', code.toUpperCase().trim())
      .eq('is_active', true)
      .single();

    if (error || !promo) {
      return { success: false, error: 'Kode promo tidak ditemukan atau sudah tidak aktif bray.' };
    }

    // Cek expired
    if (promo.valid_until && new Date(promo.valid_until) < new Date()) {
      return { success: false, error: 'Kode promo ini sudah kadaluarsa bray.' };
    }

    // Cek minimum order
    if (promo.min_order_amount && orderTotal < promo.min_order_amount) {
      return {
        success: false,
        error: `Minimum pesanan Rp ${promo.min_order_amount.toLocaleString('id-ID')} untuk pakai promo ini bray.`
      };
    }

    // Cek usage limit
    if (promo.usage_limit !== null && promo.usage_count >= promo.usage_limit) {
      return { success: false, error: 'Kuota promo ini sudah habis bray.' };
    }

    // Hitung diskon
    let discountAmount = 0;
    if (promo.discount_type === 'percentage') {
      discountAmount = Math.round(orderTotal * (promo.value / 100));
    } else {
      discountAmount = Math.min(promo.value, orderTotal);
    }

    const finalTotal = Math.max(0, orderTotal - discountAmount);

    return {
      success: true,
      promo: {
        code: promo.code,
        description: promo.description || '',
        discount_type: promo.discount_type,
        value: promo.value,
        min_order_amount: promo.min_order_amount || 0,
      },
      discountAmount,
      finalTotal,
    };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Gagal validasi promo, coba lagi bray.',
    };
  }
}

export async function createPromotion(payload: any) {
  try {
    const supabase = getSupabaseServer();
    const { data, error } = await supabase
      .from('promotions')
      .insert([payload])
      .select()
      .single();

    if (error) throw error;
    return { success: true, data };
  } catch (err) {
    console.error(err);
    return { success: false, error: err instanceof Error ? err.message : 'Gagal tambah promo' };
  }
}

export async function updatePromotion(id: string, payload: any) {
  try {
    const supabase = getSupabaseServer();
    const { data, error } = await supabase
      .from('promotions')
      .update(payload)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return { success: true, data };
  } catch (err) {
    console.error(err);
    return { success: false, error: err instanceof Error ? err.message : 'Gagal update promo' };
  }
}

export async function deletePromotion(id: string) {
  try {
    const supabase = getSupabaseServer();
    const { error } = await supabase
      .from('promotions')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return { success: true };
  } catch (err) {
    console.error(err);
    return { success: false, error: err instanceof Error ? err.message : 'Gagal hapus promo' };
  }
}

export async function hasActivePromotions() {
  try {
    const supabase = getSupabaseServer();
    const { count, error } = await supabase
      .from('promotions')
      .select('*', { count: 'exact', head: true })
      .eq('is_active', true)
      .or(`valid_until.is.null,valid_until.gt.${new Date().toISOString()}`);

    if (error) throw error;
    return (count || 0) > 0;
  } catch (err) {
    console.error(err);
    return false;
  }
}
