# 🍢 Angkringan Kita — Project Overview & Architecture Reference ☕

Dokumen ini berisi rangkuman teknis lengkap mengenai arsitektur, konfigurasi, dependensi, struktur direktori, dan alur fitur dari proyek **Angkringan Kita**. File ini ditujukan sebagai referensi cepat agar pengembangan, *debugging*, maupun *onboarding* di masa mendatang menjadi lebih mudah dan terarah.

---

## 1. Ringkasan Proyek

* **Nama Proyek**: Angkringan Kita
* **Kategori**: E-Commerce & Kitchen Order Management (F&B / Kafe)
* **Status**: *Production-Ready* (Telah melalui optimasi SSR & RSC)
* **Live Demo**: [https://angkringan-kita.vercel.app](https://angkringan-kita.vercel.app)
* **Repository Git**: `https://github.com/RozyBrt/angkringan-kita.git`

Aplikasi ini menggabungkan dua domain utama:
1. **Sisi Pelanggan (Customer Facing)**: Pemesanan menu makanan/minuman, pemilihan nomor meja interaktif, simulasi pembayaran QRIS/Tunai, sistem diskon kupon promo, penukaran poin loyalitas, serta pelacakan pesanan secara *real-time*.
2. **Sisi Pengelola (Admin & Kitchen Display System)**: Manajemen antrean pesanan langsung (*live order queue*), alur operasional dapur, pencetakan struk pembayaran, kontrol buka/tutup toko, manajemen katalog & inventaris stok, manajemen voucher promo, serta analitik omset bisnis berbasis grafik dan ekspor CSV.

---

## 2. Tech Stack & Libraries

### Core & Framework
* **Next.js 14.2.35**: Arsitektur App Router dengan pola **Hybrid Server Components (RSC) & Client Components**.
* **React 18 & React DOM 18**: UI Library fundamental.
* **TypeScript 5**: Static typing untuk memastikan keandalan kode di seluruh model data pesanan, menu, dan aksi server.

### Styling & Design System
* **Tailwind CSS (`^3.4.1`) & PostCSS (`^8`)**:
  * Palet warna khusus bertema kafe/warm earthy (`cream`, `coffee`, `warm`) yang dikonfigurasi pada `tailwind.config.ts`.
  * Animasi kustom: `fade-in`, `slide-up`, `bounce-once`, `pulse-soft`, `coffee-fill`, `bounce-slow`.
  * Desain responsif (*mobile-first*) dengan tap-target optimal untuk perangkat seluler.

### Dependencies Utama (Berdasarkan `package.json`)
* **`@supabase/ssr` (`^0.10.0`) & `@supabase/supabase-js` (`^2.101.1`)**: 
  * Akses database Supabase (PostgreSQL), autentikasi berbasis cookie SSR pada Middleware, dan langganan WebSocket Realtime.
* **`recharts` (`^3.8.1`)**: Visualisasi grafik interaktif (Line Chart tren pendapatan & Bar Chart menu terlaris) di dashboard analitik.
* **`lucide-react` (`^1.7.0`)**: Kumpulan ikon modern yang konsisten di seluruh antarmuka.
* **`date-fns` (`^4.1.0`)**: Manipulasi, komparasi rentang hari, dan pemformatan tanggal transaksi.
* **`react-hot-toast` (`^2.6.0`)**: Notifikasi toast interaktif dan feedback aksi pengguna.

---

## 3. Backend, Database & Keamanan

### Basis Data (Supabase PostgreSQL)
Proyek menggunakan database PostgreSQL yang dikelola melalui Supabase dengan tabel utama:
1. **`menu_items`**: Menyimpan item menu, kategori (`Makanan`, `Minuman`, `Cemilan`), harga (IDR), URL gambar, flag `is_available`, serta kuantitas stok `stock_quantity` & `is_track_stock`.
2. **`orders`**: Menyimpan transaksi pesanan, nama pelanggan, nomor meja, status pesanan (`pending`, `confirmed`, `preparing`, `ready`, `served`, `cancelled`), status bayar (`unpaid`, `paid`), metode pembayaran, potongan promo, serta poin loyalitas.
3. **`order_items`**: Rincian item menu yang dipesan beserta kuantitas, catatan khusus, dan subtotal harga.
4. **`promotions`**: Konfigurasi voucher promo (kode, deskripsi, tipe diskon `fixed`/`percentage`, nilai potongan, batas minimal belanja, kuota penggunaan, dan masa berlaku).
5. **`shop_settings`**: Konfigurasi operasional toko dengan key `shop_status` (`auto`, `open`, `closed`).

### Pengamanan & Integritas Data
* **Row Level Security (RLS)**:
  * Publik dapat membaca menu aktif, kupon promo aktif, dan membuat pesanan baru (`INSERT`).
  * Hanya user terautentikasi (Admin) yang memiliki hak akses mutasi pada menu, update status pesanan, dan pengelolaan promo.
* **Middleware Auth Guard (`src/middleware.ts`)**:
  * Melindungi seluruh rute `/admin/*` menggunakan verifikasi sesi Supabase Auth berbasis cookie.
  * Otomatis mengalihkan pengunjung tak terotorisasi ke `/admin/login`.
* **Atomic Inventory Rollback**:
  * Pengembalian stok otomatis ketika pesanan berstatus dibatalkan (`cancelled`) melalui Server Actions di `src/lib/actions/orders.ts`.

---

## 4. Konfigurasi Deployment & Environment Variables

### Platform Hosting
* **Production Deployment**: **Vercel** (`https://angkringan-kita.vercel.app`).
* Kompatibel penuh dengan Serverless Function dan Edge runtime bawaan Next.js.

### Konfigurasi Environment (`.env.local` / `.env.example`)
* `NEXT_PUBLIC_SUPABASE_URL`: URL REST API endpoint proyek Supabase.
* `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Kunci publik anonim Supabase (aman untuk browser).
* `SUPABASE_SERVICE_ROLE_KEY`: Kunci rahasia service role untuk eksekusi server-side dengan akses penuh.

### Konfigurasi Remote Images (`next.config.mjs`)
Daftar host gambar eksternal yang diizinkan untuk optimasi `next/image`:
* `**.supabase.co`
* `images.unsplash.com`
* `media.istockphoto.com`

---

## 5. Struktur Direktori Proyek

```text
angkringan-kita/
├── .env.example              # Template variabel lingkungan
├── .env.local                # Kredensial lingkungan lokal (Supabase URL & Keys)
├── next.config.mjs           # Konfigurasi Next.js & remote image domain
├── package.json              # Definisi dependensi & skrip npm
├── tailwind.config.ts        # Konfigurasi tema warna & animasi Tailwind
├── tsconfig.json             # Konfigurasi compiler TypeScript & path aliases (@/*)
├── docs/                     # Dokumentasi arsitektur & fitur
│   ├── loyalty-system.md     # Spesifikasi sistem poin loyalitas
│   ├── promo-inventory.md    # Spesifikasi promo & pelacakan stok
│   ├── realtime-ops.md       # Spesifikasi WebSocket & status toko
│   ├── refactor-to-ssr.md    # Panduan pemisahan Server vs Client Components
│   └── project-overview.md   # [Dokumen ini] Ringkasan komprehensif sistem
├── supabase/                 # Skrip SQL & panduan database
│   ├── schema.sql            # Skema DDL dasar (tabel & RLS)
│   ├── promotions_migration.sql # Migrasi tabel promo & kolom diskon
│   ├── inventory_migration.sql  # Migrasi kuantitas stok inventaris
│   ├── cleanup_dummy_data.sql   # Utilitas pembersihan data pengujian
│   └── seed.sql              # Data awal menu untuk demonstrasi
└── src/
    ├── middleware.ts         # Middleware proteksi rute admin berbasis Supabase Auth
    ├── app/                  # Next.js App Router (Halaman & Layout)
    │   ├── layout.tsx        # Root layout, font, SEO metadata, Toast & Cart Provider
    │   ├── page.tsx          # Beranda: Katalog menu publik (Server Component)
    │   ├── globals.css       # Style global & utility classes
    │   ├── loading.tsx       # State loading fallback
    │   ├── error.tsx         # Boundary penanganan error
    │   ├── template.tsx      # Animasi transisi halaman
    │   ├── about/            # Halaman Profil, Cerita & Kontak
    │   ├── cart/             # Halaman Keranjang, Input Kupon & Poin
    │   ├── checkout/         # Halaman Checkout & Table Picker (1-30)
    │   ├── order-success/    # Halaman Konfirmasi Pesanan Sukses
    │   ├── track/            # Halaman Pelacakan Pesanan Realtime
    │   └── admin/            # Area Pengelola & Kasir
    │       ├── layout.tsx    # Layout khusus admin & navigasi internal
    │       ├── page.tsx      # Antrean pesanan masuk (Live Orders)
    │       ├── login/        # Halaman autentikasi admin
    │       ├── dashboard/    # Kitchen Display System & kasir pembayaran
    │       ├── menu/         # Manajemen CRUD menu & stok
    │       ├── promotions/   # Manajemen kupon diskon
    │       └── analytics/    # Dashboard grafik omset & ekspor CSV
    ├── components/           # Komponen Antarmuka (UI) Reusable
    │   ├── Navbar.tsx        # Navigasi atas publik dengan counter keranjang
    │   ├── MenuCard.tsx      # Kartu item menu pelanggan
    │   ├── MenuClient.tsx    # Komponen klien katalog menu publik
    │   ├── CartItem.tsx      # Baris item pada keranjang belanja
    │   ├── OrderCard.tsx     # Kartu pesanan pada antrean admin
    │   ├── AdminLogin.tsx    # Form otentikasi login admin
    │   └── admin/            # Komponen khusus admin
    │       ├── AdminMenuClient.tsx   # Panel kelola menu & modal form
    │       ├── AnalyticsClient.tsx   # Komponen grafik Recharts & ekspor CSV
    │       ├── OrderReceipt.tsx      # Format cetak struk kasir
    │       └── PromotionsClient.tsx  # Panel kelola kupon promo
    ├── hooks/                # Custom React Hooks
    │   ├── useCart.tsx       # Context & Hook keranjang (sinkron ke localStorage)
    │   ├── useRealtimeOrders.ts # Hook langganan WebSocket pesanan dapur
    │   └── useToast.tsx      # Context & Hook notifikasi toast
    ├── lib/                  # Logika Bisnis & Utilitas
    │   ├── cart.ts           # Helper kalkulasi harga & format mata uang IDR
    │   ├── supabase.ts       # Inisialisasi Supabase client legacy
    │   ├── actions/          # Next.js Server Actions
    │   │   ├── menu.ts       # Mutasi data menu items
    │   │   ├── orders.ts     # Checkout, update status, analitik, & rollback stok
    │   │   ├── promotions.ts # Validasi & mutasi kode promo
    │   │   └── settings.ts   # Kendali status buka/tutup toko
    │   ├── supabase/         # Inisialisasi Supabase terstandarisasi
    │   │   ├── client.ts     # Client-side Supabase instance
    │   │   └── server.ts     # Server-side Supabase instance (Service Role)
    │   └── types/            # Model tipe data internal
    │       └── order.ts      # Tipe data order, item, dan status
    └── types/
        └── index.ts          # Tipe data global (MenuItem, Category, Cart)
```

---

## 6. Alur & Fitur Utama Aplikasi

### A. Alur Pelanggan (Customer Flow)
1. **Eksplorasi Menu**: Pelanggan membuka katalog utama. Data menu dimuat cepat via SSR. Sistem memeriksa apakah toko buka atau tutup (otomatis jam 08:00–23:50 WIB atau manual).
2. **Kelola Keranjang**: Menambahkan pesanan ke keranjang (`useCart`). Di halaman `/cart`, pelanggan bisa memasukkan kupon promo aktif dan menukar poin loyalitas (cashback 10% dari riwayat order sebelumnya).
3. **Checkout & Pemilihan Meja**: Di halaman `/checkout`, pelanggan mengisi nama, catatan, memilih nomor meja (1–30) dengan sistem yang otomatis memvalidasi apakah meja sedang terisi, lalu memilih pembayaran Tunai atau QRIS.
4. **Konfirmasi & Pelacakan**: Setelah pesanan tersimpan ke Supabase via Server Action, ID pesanan dicatat di *localStorage*. Pelanggan diarahkan ke `/order-success` lalu dapat memantau status pesanan secara realtime di `/track`.

### B. Alur Pengelola & Dapur (Admin & Kitchen Flow)
1. **Otentikasi**: Admin login via email & password Supabase di `/admin/login`. Sesi disimpan aman dalam cookie yang divalidasi oleh `middleware.ts`.
2. **Live Kitchen Station**:
   * Halaman `/admin/dashboard` terhubung via Supabase Realtime Channels.
   * Pesanan baru masuk disertai efek audio notifikasi bel tanpa perlu refresh halaman.
   * Karyawan dapat memindahkan status pesanan (`pending` ➔ `preparing` ➔ `ready` ➔ `served`).
3. **Kasir & Cetak Struk**: Tombol penyelesaian pesanan memicu modal konfirmasi pembayaran serta mencetak struk fisik via `OrderReceipt.tsx`.
4. **Kendali Toko**: Saklar status toko di dashboard memungkinkan admin mengubah status menjadi `Buka`, `Tutup`, atau `Auto` yang langsung mengunci pesanan baru dari seluruh pelanggan.
5. **Business Intelligence (BI)**:
   * Halaman `/admin/analytics` menampilkan grafik tren pendapatan harian, pesanan harian, dan menu terlaris menggunakan Recharts.
   * Tombol *Export Report* memungkinkan pengunduhan rekapitulasi data penjualan mendalam dalam format CSV.

---

## 7. Panduan Menjalankan Secara Lokal

1. **Instalasi Dependencies**:
   ```bash
   npm install
   ```

2. **Konfigurasi Environment**:
   Salin `.env.example` menjadi `.env.local` dan masukkan kredensial Supabase Anda:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://<project-id>.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon-key>
   SUPABASE_SERVICE_ROLE_KEY=<service-role-key>
   ```

3. **Inisialisasi Database**:
   Jalankan file SQL di Supabase SQL Editor secara berurutan:
   * `supabase/schema.sql`
   * `supabase/promotions_migration.sql`
   * `supabase/inventory_migration.sql`
   * `supabase/seed.sql` (opsional untuk data awal)

4. **Menjalankan Server Pengembangan**:
   ```bash
   npm run dev
   ```
   Akses antarmuka melalui peramban di `http://localhost:3000`.
