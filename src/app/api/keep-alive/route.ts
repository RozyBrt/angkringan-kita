import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getSupabaseServer } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  // Verifikasi token Vercel Cron jika CRON_SECRET dikonfigurasi di Environment Variables
  const authHeader = request.headers.get('authorization');
  if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // Inisialisasi client: prioritaskan service role, fallback ke anon key
    let supabase;
    if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
      supabase = getSupabaseServer();
    } else {
      supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        { auth: { persistSession: false } }
      );
    }

    // Jalankan query ringan ke Supabase untuk menjaga status database tetap aktif (tidak di-pause)
    const { data, error } = await supabase
      .from('shop_settings')
      .select('key, value')
      .limit(1);

    if (error) {
      // Fallback query ke menu_items bila shop_settings belum terisi
      const { data: menuData, error: menuError } = await supabase
        .from('menu_items')
        .select('id')
        .limit(1);

      if (menuError) {
        return NextResponse.json(
          {
            status: 'error',
            message: menuError.message,
            timestamp: new Date().toISOString(),
          },
          { status: 500 }
        );
      }

      return NextResponse.json({
        status: 'success',
        message: 'Supabase keep-alive ping succeeded (fallback menu_items)',
        data: menuData,
        timestamp: new Date().toISOString(),
      });
    }

    return NextResponse.json({
      status: 'success',
      message: 'Supabase keep-alive ping succeeded',
      data,
      timestamp: new Date().toISOString(),
    });
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json(
      {
        status: 'error',
        message: errorMessage,
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
