# Angkringan Kita ☕

Aplikasi e-commerce sederhana dan modern untuk pemesanan menu angkringan secara online. Dibangun untuk memberikan pengalaman memesan yang cepat, halus (*user-friendly*), dan nyaman bagi pembeli maupun admin.

**🔗 Live Demo:** [https://angkringan-kita.vercel.app](https://angkringan-kita.vercel.app)

---

## 🛠️ Tech Stack & Teknologi

Proyek ini dibangun menggunakan kumpulan teknologi modern (Modern Stack):

- **[Next.js 14 (App Router)](https://nextjs.org/)** – Kerangka kerja React untuk antarmuka yang cepat dan optimal (SEO-friendly).
- **[Tailwind CSS](https://tailwindcss.com/)** – Penyusunan *styling* desain utilitas (dengan palet warna *warm-earthy* buatan khusus).
- **[Supabase](https://supabase.com/)** – Layanan Database PostgreSQL sekaligus Auth & pengamanan data (*Row Level Security*).
- **[TypeScript](https://www.typescriptlang.org/)** – Untuk keamanan penulisan struktur data (tipe menu, cart, pesanan).
- **[Lucide React](https://lucide.dev/)** – Koleksi ikon UI yang mulus dan estetik.
- **Vercel** – Hosting otomatis (CI/CD).

---

## ✨ Fitur Utama

### Untuk Pelanggan (Customer)
* **Katalog Interaktif**: Browse menu kopi, makanan, dan cemilan dengan mudah. Dibalut animasi skeleton loading yang rapi.
* **Keranjang Belanja (Cart)**: Tambah / kurangi barang belanjaan, dengan detail perhitungan harga total yang tersimpan otomatis di perangkat (Local Storage).
* **Checkout Cepat**: Formulir pemesanan sederhana (Nama, Meja, dan Catatan).
* **Status Real-time**: Pembeli dialihkan ke halaman kesuksesan dengan nomor pesanan khusus.

### Untuk Admin Web
* **Dashboard Tersembunyi**: Diakses secara rahasia melalui `/admin` atau klik khusus pada tulisan logo di ujung paling bawah (*footer*).
* **Sistem Auth**: Terlindungi kata sandi yang ditauntukan secara aman dari sistem autentikasi Supabase.
* **Manajemen Pesanan Mulus**: Filter pesanan ("Menunggu" vs "Selesai"), penghitungan statistik, dan pembaruan status hanya dalam satu kali klik.

---

## 🚀 Cara Menjalankan di Komputer Lokal (Development)

Jika kamu ingin mengembangkan kode proyek ini *(clone)* di komputermu sendiri:

### 1. Prasyarat
- [Node.js](https://nodejs.org/en/) & `npm` ter-install.
- Akun [Supabase](https://supabase.com) untuk *database*.

### 2. Instalasi Aplikasi
1. Lakukan *Clone* ke komputermu:
   ```bash
   git clone https://github.com/RozyBrt/angkringan-kita.git
   ```
2. Pindah ke direktori, lalu install semua *dependency*:
   ```bash
   cd angkringan-kita
   npm install
   ```

### 3. Konfigurasi Database (Supabase)
1. Buat proyek baru di [Supabase Dashboard](https://supabase.com/dashboard).
2. Temukan file kredensial rahasiamu di bagian **Settings > API**.
3. Buat file bernama `.env.local` di *folder* utama aplikasi, isikan kode berikut:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://[YOUR_PROJECT_REF].supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=ey...[YOUR_ANON_KEY]...
   ```
4. Buka **SQL Editor** pada web Supabase. Jalankan *query* yang ada di dalam file `supabase/schema.sql` lalu dilanjut mengeksekusi `supabase/seed.sql` untuk membuat tabel dan menanam menu-menu awal.

### 4. Mulai Server Lokal
Ketikan perintah berikut di terminal:
```bash
npm run dev
```
Buka **`http://localhost:3000`** di browsermu dan mulailah mencoba berjualan!

---

💡 *Dibuat dengan ❤️ — Nikmati setiap tegukan.*
