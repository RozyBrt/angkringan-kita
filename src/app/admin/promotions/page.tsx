import { getSupabaseServer } from '@/lib/supabase/server';
import PromotionsClient from '@/components/admin/PromotionsClient';

export default async function AdminPromotions() {
  const supabase = getSupabaseServer();
  const { data: promoData } = await supabase
    .from('promotions')
    .select('*')
    .order('created_at', { ascending: false });

  const initialPromos = promoData ?? [];

  return <PromotionsClient initialPromos={initialPromos} />;
}
