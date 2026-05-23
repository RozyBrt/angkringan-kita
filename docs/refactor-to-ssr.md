# Panduan Refactor Next.js: Dari SPA (CSR) ke Server Components (SSR)

Dokumen ini adalah catatan untuk referensi di masa mendatang jika tim memutuskan untuk mengoptimalkan performa aplikasi **Angkringan Kita**.

## Latar Belakang Masalah
Saat ini, proyek dibangun menggunakan kerangka kerja Next.js 14, namun hampir seluruh file (terutama file halaman utama di `src/app/**/page.tsx`) menggunakan direktif `'use client'`. 
Selain itu, pengambilan data ke Supabase dilakukan menggunakan `useEffect` dari sisi *browser*.

**Dampak:**
Aplikasi bertindak persis seperti Single Page Application (SPA) biasa (misal: Vite/React jadul). Dampak negatifnya adalah membengkaknya **Javascript Bundle Size**. HP pelanggan (terutama berspesifikasi rendah) harus mengunduh dan mengeksekusi semua logika Javascript ini hanya untuk menampilkan menu, yang bisa menyebabkan web terasa lambat atau *lag* saat pertama kali dibuka.

## Tujuan Refactor
Memanfaatkan fitur utama Next.js yaitu **React Server Components (RSC)**.
Server akan mengambil data ke Supabase secara kilat dan merakit HTML di sisi server, sehingga HP pelanggan hanya menerima hasil jadinya saja (jauh lebih cepat dan ringan).

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

*Dokumen ini dibuat agar tim *engineering* memiliki arah yang jelas jika sewaktu-waktu isu performa *loading* awal mulai dikeluhkan oleh pelanggan.*
