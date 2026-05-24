import { getSupabaseServer } from '@/lib/supabase/server';
import AdminLogin from '@/components/AdminLogin';
import AdminMenuClient from '@/components/admin/AdminMenuClient';
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

export default async function AdminMenuPage() {
  const session = await getAdminSession();

  // Kalau belum login, tampilkan form login
  // AdminLogin akan memanggil router.refresh() setelah login,
  // sehingga server component ini akan re-render dengan session baru
  if (!session) {
    return <AdminLogin />;
  }

  const supabase = getSupabaseServer();
  const { data: menuData } = await supabase
    .from('menu_items')
    .select('*')
    .order('category')
    .order('name');

  const initialMenuItems = menuData ?? [];

  return <AdminMenuClient initialMenuItems={initialMenuItems} />;
}
