'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { supabase } from '@/lib/supabase/client';
import { OrderWithItems } from '@/lib/types/order';

export function useRealtimeOrders() {
  const [orders, setOrders] = useState<OrderWithItems[]>([]);
  const [loading, setLoading] = useState(true);
  const [connectionStatus, setConnectionStatus] = useState<'CONNECTING' | 'CONNECTED' | 'DISCONNECTED' | 'ERROR' | 'RECONNECTING' | 'FAILED'>('CONNECTING');
  
  const retryCount = useRef(0);

  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Inisialisasi audio dan pancingan otomatis bray
  useEffect(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio('/sounds/notification.mp3');
      audioRef.current.volume = 0.8;
    }

    // Fungsi sakti buat ngebuka gembok audio browser
    const unlockAudio = () => {
      if (audioRef.current) {
        // Kita pancing dengan play-pause secepat kilat
        audioRef.current.play()
          .then(() => {
            audioRef.current?.pause();
            if (audioRef.current) audioRef.current.currentTime = 0;
            console.log('🔓 Audio otomatis terbuka bray! Siap tempur.');
            // Kalau sudah terbuka, hapus listener-nya biar nggak menuh-menuhin memori
            document.removeEventListener('click', unlockAudio);
            document.removeEventListener('touchstart', unlockAudio);
          })
          .catch(() => {
            // Kalau gagal (karena belum beneran interaksi), biarin aja dulu
          });
      }
    };

    document.addEventListener('click', unlockAudio);
    document.addEventListener('touchstart', unlockAudio);

    return () => {
      document.removeEventListener('click', unlockAudio);
      document.removeEventListener('touchstart', unlockAudio);
    };
  }, []);

  const playNotification = useCallback(() => {
    if (audioRef.current) {
      console.log('🎵 Mencoba membunyikan notifikasi...');
      // Reset ke awal biar bisa bunyi berkali-kali tanpa nunggu selesai
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(e => {
        console.warn('🔇 Audio masih diblokir browser bray!', e);
      });
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
      if (retryCount.current < 3) {
        retryCount.current += 1;
        setConnectionStatus('RECONNECTING');
        console.log(`Mencoba hubungkan ulang... (${retryCount.current}/3)`);
        setTimeout(fetchOrders, 2000 * retryCount.current);
      } else {
        setConnectionStatus('FAILED');
        setLoading(false);
      }
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
        if (status === 'SUBSCRIBED') {
          setConnectionStatus('CONNECTED');
          retryCount.current = 0;
        }
        if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
          if (retryCount.current < 3) {
            retryCount.current += 1;
            setConnectionStatus('RECONNECTING');
            setTimeout(fetchOrders, 2000 * retryCount.current);
          } else {
            setConnectionStatus('FAILED');
          }
        }
      });

    return () => {
      console.log(`🔌 Memutus koneksi [${channelId}]`);
      supabase.removeChannel(channel);
    };
  }, [fetchOrders, playNotification]);

  return { orders, loading, connectionStatus, playNotification, refetch: fetchOrders };
}
