# 🍢 Angkringan Kita (Production-Ready) ☕

[![Status](https://img.shields.io/badge/Status-COMPLETED-green.svg?style=for-the-badge)]()
[![Tech Stack](https://img.shields.io/badge/Stack-Next.js%20%7C%20Supabase%20%7C%20Tailwind-blue.svg?style=for-the-badge)]()

**Angkringan Kita** adalah platform E-Commerce *full-stack* modern yang dirancang khusus untuk operasional bisnis angkringan/cafe. Proyek ini bukan sekadar katalog menu, melainkan ekosistem bisnis lengkap yang mencakup manajemen pesanan realtime, analitik pendapatan, hingga kontrol operasional harian.

**🔗 Live Demo:** [https://angkringan-kita.vercel.app](https://angkringan-kita.vercel.app)

---

## ✨ Fitur Unggulan (Technical Highlights)

### 🛡️ Integritas & Keamanan (Enterprise Grade)
* **Atomic Inventory Management**: Implementasi mekanisme *Database Rollback*. Jika transaksi pesanan gagal, sistem otomatis mengembalikan stok ke angka semula secara atomik.
* **Hybrid Operational Control**: Admin memiliki kendali penuh untuk membuka/tutup toko secara instan (Auto/Manual) yang tersinkronisasi secara **Real-time** ke seluruh perangkat pelanggan.
* **Security Ordering Lock**: Sistem pesanan otomatis terkunci secara sistemis di seluruh halaman (Home & Checkout) saat toko dinyatakan "Tutup".

### 🏮 Pengalaman Pelanggan (Premium UX)
* **Visual Table Picker (1-30)**: Grid interaktif untuk memilih meja dengan indikator ketersediaan realtime.
* **Smart Loyalty & Promo**: Sistem poin cashback (10%) dan mesin kupon diskon dinamis yang tersimpan aman di peramban.
* **Real-time Kitchen Notification**: Notifikasi suara dan visual instan saat pesanan siap disajikan.
* **Simulasi QRIS & WA Alert**: Alur pembayaran modern dan integrasi komunikasi langsung ke kasir.

### 📊 Alat Bantu Bisnis (Admin Intelligence)
* **Business BI Dashboard**: Visualisasi grafik pendapatan 7 hari terakhir dan statistik menu terlaris.
* **CSV Data Export**: Penarikan laporan penjualan mendalam untuk kebutuhan akuntansi profesional.
* **Live Kitchen Station**: Antrean pesanan yang berbunyi dan ter-update otomatis (Zero-Refresh).

---

## 🛠️ Tech Stack

*   **Frontend**: Next.js 14 (App Router), Tailwind CSS, Framer Motion.
*   **Backend & DB**: Supabase (PostgreSQL), Realtime Channels, RLS Policies.
*   **State & Logic**: Server Actions, React Context, LocalStorage Persistence.

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
