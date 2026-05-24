# Dokumentasi Arsitektur Next.js SSR: Dari SPA (CSR) ke Server Components (SSR) ✅

Dokumen ini mencatat hasil implementasi optimasi performa aplikasi **Angkringan Kita** dengan memindahkan rendering ke Server-Side Rendering (SSR) dan Server Components (RSC) yang diselesaikan pada 24 Mei 2026.

## Latar Belakang & Perubahan Arsitektur
Sebelumnya, proyek ini berjalan layaknya Single Page Application (SPA) tradisional di mana hampir seluruh halaman menggunakan direktif `'use client'` dan memuat data menggunakan `useEffect` di browser. Hal ini meningkatkan ukuran bundel Javascript klien dan memperlambat loading awal di perangkat berspesifikasi rendah.

Sekarang, proyek telah sepenuhnya dioptimalkan menggunakan **React Server Components (RSC)** dan Server-Side Rendering (SSR). Server kini mengambil data awal dari Supabase secara langsung sebelum halaman dikirim, mengurangi beban eksekusi JS di sisi pelanggan secara drastis.


---

## Aturan Emas (Golden Rules) Pemisahan Komponen

Jika Anda mulai melakukan *refactoring* nanti, ingat dua rumus ini:

1. **PENGAMBIL DATA (Server Component):** 
   File `page.tsx` sebaiknya **TIDAK** menggunakan `'use client'`. Tugasnya hanya mengeksekusi `supabase.from().select()`, lalu melemparkan data tersebut ke komponen anak.
2. **TUKANG INTERAKSI (Client Component):**
   Gunakan `'use client'` HANYA pada file yang berada di folder `src/components/` atau file yang membutuhkan:
   - `useState` (Contoh: input pencarian, filter kategori)
   - `useEffect`
   - `onClick`, `onChange` (Tombol, formulir)
   - *Browser API* (seperti `window.addEventListener('scroll')` pada Navbar)

---

## Pemetaan Rencana Eksekusi

### Kategori 1: Harus Dirombak (Pisah Server & Client)
Halaman ini berat karena menggabungkan *fetch* data dan interaksi.
1. **`app/page.tsx`**: Ubah jadi Server Component. *Fetch* menu di sini, lalu oper ke komponen klien `<MenuInteractive />`.
2. **`app/admin/promotions/page.tsx`**: Validasi sesi admin dan *fetch* promo di server. Oper ke `<PromotionsAdminClient />`.
3. **`app/admin/menu/page.tsx`**: Sama seperti di atas.
4. **`app/admin/dashboard/page.tsx`**: *Fetch* statistik pesanan di server, oper data ke komponen grafik *Client*.
5. **`app/admin/analytics/page.tsx`**: Sama seperti di atas.

### Kategori 2: Ubah Menjadi Statis Penuh
1. **`app/about/page.tsx`**: Hapus tulisan `'use client'`. Halaman ini hanya berisi teks/informasi, biarkan dirender secara statis oleh server. Kecepatannya akan instan.

### Kategori 3: Pertahankan 'use client' (Pengecualian)
Halaman ini memang kodratnya wajib hidup di *browser*. Biarkan saja menggunakan `'use client'`.
1. **`app/cart/page.tsx`**: Mengambil data dari `localStorage` browser. Server tidak punya akses ke keranjang ini.
2. **`app/checkout/page.tsx`**: Tergantung pada data keranjang dan merupakan formulir interaktif panjang.
3. **`app/track/page.tsx`**: Menggunakan koneksi *WebSocket* (Supabase Realtime) yang murni berjalan di *browser*.

---

## Contoh Pola Perubahan (Gambaran Singkat)

**SEBELUM (Pola Sekarang - Berat):**
```tsx
// app/page.tsx
'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'

export default function MenuPage() {
  const [data, setData] = useState([])
  useEffect(() => {
    supabase.from('menu_items').select('*').then(({data}) => setData(data))
  }, [])
  // Render tampilan interaktif dengan filter...
}
```

**SESUDAH (Pola Next.js Ideal - Cepat):**
```tsx
// 1. app/page.tsx (Server Component - Pengambil Data)
import { createClient } from '@/lib/supabase/server'
import MenuInteractive from '@/components/MenuInteractive'

export default async function MenuPage() {
  const supabase = createClient()
  const { data } = await supabase.from('menu_items').select('*')
  
  // Oper ke Client Component tanpa loading!
  return <MenuInteractive initialData={data} /> 
}
```

```tsx
// 2. src/components/MenuInteractive.tsx (Client Component - Interaksi)
'use client'
import { useState } from 'react'

export default function MenuInteractive({ initialData }) {
  const [menuItems, setMenuItems] = useState(initialData)
  // Render filter, pencarian, dan list menu di sini
}
```

*Dokumen ini diperbarui untuk mencatat keberhasilan migrasi performa ke Server-Side Rendering (SSR) demi pengalaman pelanggan Angkringan Kita yang jauh lebih cepat, hemat baterai, dan responsif.*
