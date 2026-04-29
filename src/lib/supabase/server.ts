import { createClient } from '@supabase/supabase-js';

// Fungsi buat dapetin client server (Cuma jalan di Server bray!)
export const getSupabaseServer = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('Waduh bray, konfigurasi Supabase Server belum lengkap di .env.local!');
  }

  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
};
