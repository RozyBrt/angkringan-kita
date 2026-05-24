# 🍢 Angkringan Kita (Production-Ready) ☕

[![Status](https://img.shields.io/badge/Status-COMPLETED-green.svg?style=for-the-badge)]()
[![Tech Stack](https://img.shields.io/badge/Stack-Next.js%20%7C%20Supabase%20%7C%20Tailwind-blue.svg?style=for-the-badge)]()

**Angkringan Kita** adalah platform E-Commerce *full-stack* modern yang dirancang khusus untuk operasional bisnis angkringan/cafe. Proyek ini bukan sekadar katalog menu, melainkan ekosistem bisnis lengkap yang mencakup manajemen pesanan realtime, analitik pendapatan, hingga kontrol operasional harian.

**🔗 Live Demo:** [https://angkringan-kita.vercel.app](https://angkringan-kita.vercel.app)

---

## ✨ Fitur Unggulan (Technical Highlights)

### 🛡️ Integritas & Keamanan (Enterprise Grade)
* **Hybrid SSR & React Server Components**: Menggunakan kekuatan *Server-Side Rendering* (SSR) dan *React Server Components* (RSC) untuk pemrosesan data menu awal, kalkulasi statistik analitik, serta validasi rute admin di sisi server. Menghasilkan loading LCP yang luar biasa cepat, ramah baterai, dan performa mulus pada perangkat berspesifikasi rendah (*smartphone mid-to-low range*).
* **Seamless Auth SSR Session**: Integrasi `@supabase/ssr` (`createBrowserClient`) untuk sinkronisasi sesi admin yang aman berbasis cookie. Mencegah status login admin hilang secara tidak sengaja ketika halaman dimuat ulang (*refresh*).
* **Atomic Inventory Management**: Mekanisme *Database Rollback* tingkat basis data. Jika transaksi pesanan gagal di tengah jalan, sistem otomatis mengembalikan kuantitas stok ke angka semula secara atomik.
* **Hybrid Operational Control**: Admin memiliki kendali penuh untuk membuka/tutup toko secara instan (Auto/Manual) yang tersinkronisasi secara **Real-time** ke seluruh perangkat pelanggan melalui WebSocket.
* **Security Ordering Lock**: Sistem pesanan otomatis terkunci secara sistemis di seluruh halaman (Home & Checkout) saat toko dinyatakan "Tutup".

### 🏮 Pengalaman Pelanggan (Premium UX)
* **Smart Scheduler & Closed Banner**: Waktu operasional otomatis (Buka pukul **08:00 s.d 23:50 WIB**). Jika pelanggan membuka platform di luar jam operasional (misal jam 2 pagi), sistem secara cerdas menampilkan spanduk informatif mengenai jadwal buka toko dan mengunci tombol pemesanan.
* **Visual Table Picker (1-30)**: Grid interaktif untuk memilih nomor meja makan pelanggan dengan indikator ketersediaan secara realtime.
* **Smart Loyalty & Promo**: Sistem perhitungan poin cashback (10%) otomatis dan mesin kupon diskon dinamis yang tersimpan aman di peramban lokal pelanggan.
* **Real-time Kitchen Notification**: Notifikasi suara dan visual instan saat pesanan siap disajikan dari stasiun dapur.
* **Simulasi QRIS & WA Alert**: Alur pembayaran digital modern dan integrasi komunikasi langsung ke kasir via WhatsApp API.

### 📊 Alat Bantu Bisnis (Admin Intelligence)
* **Business BI Dashboard**: Visualisasi grafik pendapatan 7 hari terakhir dan statistik menu terlaris menggunakan library visualisasi modern.
* **CSV Data Export**: Penarikan laporan penjualan mendalam untuk kebutuhan akuntansi profesional.
* **Live Kitchen Station**: Antrean pesanan yang berbunyi dan ter-update otomatis (Zero-Refresh).

---

## 🛠️ Tech Stack

*   **Frontend**: Next.js 14 (App Router - Hybrid Server & Client Components), Tailwind CSS, Framer Motion.
*   **Backend & DB**: Supabase (PostgreSQL), Realtime Channels, RLS (Row Level Security) Policies.
*   **State & Logic**: Server Actions, React Context, `@supabase/ssr` (Cookie-based Auth Syncing), LocalStorage Persistence.

---

## 🚀 Cara Menjalankan Secara Lokal

1. **Clone & Install**:
   ```bash
   git clone https://github.com/RozyBrt/angkringan-kita.git
   cd angkringan-kita
   npm install
   ```

2. **Environment Variables**: Buat file `.env.local` dan isi kredensial Supabase Anda.

3. **Database Setup**: Jalankan query SQL di Supabase Editor secara berurutan:
   * `supabase/schema.sql` (Schema Dasar)
   * `supabase/promotions_migration.sql` (Promo & Marketing)
   * `supabase/seed.sql` (Data Awal)

4. **Run Server**:
   ```bash
   npm run dev
   ```

---

## 🏁 Project Status: FINISHED

Proyek ini telah melalui fase pengembangan intensif selama 33 hari dan telah mencapai status **Production-Ready**. Seluruh fitur utama, pengamanan data, dan optimalisasi performa telah diimplementasikan sesuai standar *engineering* modern.

💡 *Dibuat dengan ❤️ — Menghubungkan Tradisi dengan Teknologi.*
