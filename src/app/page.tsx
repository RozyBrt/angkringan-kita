import { getSupabaseServer } from '@/lib/supabase/server';
import { getShopStatus } from '@/lib/actions/settings';
import MenuClient from '@/components/MenuClient';

export default async function MenuPage() {
  // Fetch data awal di server — cepat, tidak perlu nunggu browser!
  const [menuRes, shopStatus] = await Promise.all([
    getSupabaseServer()
      .from('menu_items')
      .select('*')
      .order('category')
      .order('name'),
    getShopStatus(),
  ]);

  const initialMenuItems = menuRes.data ?? [];

  return (
    <MenuClient
      initialMenuItems={initialMenuItems}
      initialShopStatus={shopStatus}
    />
  );
}
