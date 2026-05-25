import { getSupabaseServer } from '@/lib/supabase/server';
import AdminMenuClient from '@/components/admin/AdminMenuClient';

export default async function AdminMenuPage() {
  const supabase = getSupabaseServer();
  const { data: menuData } = await supabase
    .from('menu_items')
    .select('*')
    .order('category')
    .order('name');

  const initialMenuItems = menuData ?? [];

  return <AdminMenuClient initialMenuItems={initialMenuItems} />;
}
