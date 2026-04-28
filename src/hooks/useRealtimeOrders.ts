'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase/client';
import { OrderWithItems } from '@/lib/types/order';

export function useRealtimeOrders() {
  const [orders, setOrders] = useState<OrderWithItems[]>([]);

  useEffect(() => {
    // 1. Ambil data awal (Fetch Initial Data)
    const fetchOrders = async () => {
      const { data } = await supabase
        .from('orders')
        .select('*, order_items(*, menu_items(*))')
        .order('created_at', { ascending: false });
      if (data) setOrders(data as OrderWithItems[]);
    };

    fetchOrders();

    // 2. Dengerin perubahan (Realtime Subscription)
    const channel = supabase
      .channel('order-updates')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, (payload) => {
        console.log('Ada perubahan bray!', payload);
        fetchOrders(); // Cara paling aman biar relasi order_items tetep sinkron
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return { orders };
}
