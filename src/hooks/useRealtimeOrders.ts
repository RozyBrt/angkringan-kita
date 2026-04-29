'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { supabase } from '@/lib/supabase/client';
import { OrderWithItems } from '@/lib/types/order';

export function useRealtimeOrders() {
  const [orders, setOrders] = useState<OrderWithItems[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<'CONNECTING' | 'CONNECTED' | 'DISCONNECTED' | 'ERROR'>('CONNECTING');
  
  const retryCount = useRef(0);
  const MAX_RETRIES = 3;

  const playNotification = useCallback(() => {
    try {
      const audio = new Audio('/sounds/notification.mp3');
      audio.play().catch(e => console.warn('Audio play blocked:', e));
    } catch (e) {
      console.error('Audio error:', e);
    }
  }, []);

  const fetchOrders = useCallback(async () => {
    try {
      const { data, error: fetchError } = await supabase
        .from('orders')
        .select('*, order_items(*, menu_items(*))')
        .order('created_at', { ascending: false });
      
      if (fetchError) throw fetchError;
      if (data) setOrders(data as OrderWithItems[]);
      setLoading(false);
      setConnectionStatus('CONNECTED');
      retryCount.current = 0; // Reset retry kalau sukses
    } catch (err) {
      console.error('Fetch error:', err);
      setConnectionStatus('ERROR');
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let channel: any;

    const setupSubscription = () => {
      channel = supabase
        .channel('db-changes')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, (payload) => {
          if (payload.eventType === 'INSERT') playNotification();
          fetchOrders();
        })
        .subscribe((status) => {
          console.log('Realtime Status:', status);
          if (status === 'SUBSCRIBED') {
            setConnectionStatus('CONNECTED');
            retryCount.current = 0;
          } else if (status === 'CLOSED' || status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
            setConnectionStatus('ERROR');
            
            // RECONNECT LOGIC (Max 3x)
            if (retryCount.current < MAX_RETRIES) {
              retryCount.current++;
              console.log(`Reconnecting... (${retryCount.current}/${MAX_RETRIES})`);
              setConnectionStatus('CONNECTING');
              setTimeout(setupSubscription, 3000); // Tunggu 3 detik sebelum coba lagi
            } else {
              setError('Koneksi gagal setelah beberapa kali percobaan. Silakan refresh halaman.');
            }
          }
        });
    };

    fetchOrders();
    setupSubscription();

    return () => {
      if (channel) supabase.removeChannel(channel);
    };
  }, [fetchOrders, playNotification]);

  return { orders, loading, error, connectionStatus, refetch: fetchOrders };
}
