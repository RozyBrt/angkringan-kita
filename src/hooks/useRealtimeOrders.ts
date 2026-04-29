'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { supabase } from '@/lib/supabase/client';
import { OrderWithItems } from '@/lib/types/order';

export function useRealtimeOrders() {
  const [orders, setOrders] = useState<OrderWithItems[]>([]);
  const [loading, setLoading] = useState(true);
  const [connectionStatus, setConnectionStatus] = useState<'CONNECTING' | 'CONNECTED' | 'DISCONNECTED' | 'ERROR'>('CONNECTING');
  
  const retryCount = useRef(0);

  const playNotification = useCallback(() => {
    try {
      console.log('🎵 Mencoba membunyikan notifikasi...');
      const audio = new Audio('/sounds/notification.mp3');
      audio.volume = 0.8;
      audio.play().catch(e => {
        console.warn('🔇 Audio diblokir browser bray! Kamu harus klik di halaman ini dulu sekali biar suaranya bisa bunyi.', e);
      });
    } catch (e) {
      console.error('❌ Gagal memutar audio:', e);
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
    // Pancing data awal
    fetchOrders();

    // Buat nama channel unik tiap kali komponen ini muncul
    const channelId = `admin_db_${Math.random().toString(36).slice(2, 7)}`;
    const channel = supabase
      .channel(channelId)
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'orders' 
      }, (payload) => {
        console.log('🔔 NOTIFIKASI MASUK:', payload.eventType, payload);
        fetchOrders();
        
        if (payload.eventType === 'INSERT') {
          playNotification();
        }
      })
      .subscribe((status) => {
        console.log(`📡 Koneksi [${channelId}] status:`, status);
        if (status === 'SUBSCRIBED') setConnectionStatus('CONNECTED');
        if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') setConnectionStatus('ERROR');
      });

    return () => {
      console.log(`🔌 Memutus koneksi [${channelId}]`);
      supabase.removeChannel(channel);
    };
  }, [fetchOrders, playNotification]);

  return { orders, loading, connectionStatus, refetch: fetchOrders };
}
