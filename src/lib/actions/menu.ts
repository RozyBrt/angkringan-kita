'use server';

import { getSupabaseServer } from '@/lib/supabase/server';
import { MenuItem } from '@/types';
import { revalidatePath } from 'next/cache';

export async function createMenuItem(payload: Partial<MenuItem>) {
  try {
    const supabase = getSupabaseServer();
    const { data, error } = await supabase
      .from('menu_items')
      .insert(payload)
      .select()
      .single();

    if (error) {
      console.error('Gagal tambah menu:', error);
      return { success: false, error: error.message };
    }

    revalidatePath('/admin/menu');
    return { success: true, data };
  } catch (err) {
    console.error('Runtime error in createMenuItem:', err);
    return { success: false, error: err instanceof Error ? err.message : 'Terjadi kesalahan internal server' };
  }
}

export async function updateMenuItem(id: string | number, payload: Partial<MenuItem>) {
  try {
    const supabase = getSupabaseServer();
    const { data, error } = await supabase
      .from('menu_items')
      .update(payload)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Gagal update menu:', error);
      return { success: false, error: error.message };
    }

    revalidatePath('/admin/menu');
    return { success: true, data };
  } catch (err) {
    console.error('Runtime error in updateMenuItem:', err);
    return { success: false, error: err instanceof Error ? err.message : 'Terjadi kesalahan internal server' };
  }
}

export async function deleteMenuItem(id: string | number) {
  try {
    const supabase = getSupabaseServer();
    const { error } = await supabase
      .from('menu_items')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Gagal hapus menu:', error);
      return { success: false, error: error.message };
    }

    revalidatePath('/admin/menu');
    return { success: true };
  } catch (err) {
    console.error('Runtime error in deleteMenuItem:', err);
    return { success: false, error: err instanceof Error ? err.message : 'Terjadi kesalahan internal server' };
  }
}

export async function toggleMenuItemAvailability(id: string | number, currentStatus: boolean) {
  return updateMenuItem(id, { is_available: !currentStatus });
}
