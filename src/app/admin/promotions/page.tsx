import { getSupabaseServer } from '@/lib/supabase/server';
import AdminLogin from '@/components/AdminLogin';
import PromotionsClient from '@/components/admin/PromotionsClient';
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';

async function getAdminSession() {
  const cookieStore = cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
      },
    }
  );
  const { data } = await supabase.auth.getSession();
  return data.session;
}

export default async function AdminPromotions() {
  const session = await getAdminSession();

  // Kalau belum login, tampilkan form login
  // AdminLogin akan memanggil router.refresh() setelah login,
  // sehingga server component ini akan re-render dengan session baru
  if (!session) {
    return <AdminLogin />;
  }

  const supabase = getSupabaseServer();
  const { data: promoData } = await supabase
    .from('promotions')
    .select('*')
    .order('created_at', { ascending: false });

  const initialPromos = promoData ?? [];

  return <PromotionsClient initialPromos={initialPromos} />;
}
