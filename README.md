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

### Untuk Pelanggan (*Customer*)
* **Katalog Interaktif**: Browse menu kopi, makanan, dan cemilan dengan mudah. Dibalut animasi *skeleton loading* dan *page transitions* yang amat rapi.
* **Keranjang Belanja (Cart)**: Tambah / kurangi barang belanjaan, dengan detail perhitungan harga total yang tersimpan otomatis di *Local Storage*.
* **Checkout Cepat**: Formulir pemesanan ringkas. Setelah proses berhasil, pelanggan mendapat resi/nomor tunggu.
* **Hubungi via WhatsApp**: Tersedia pintasan otomatis (*WA Alert*) untuk pelanggan langsung menghubungi nomor kasir apabila ada pesanan tambahan/urgent.
* **Lacak Pesanan Cerdas (Intelligent Search)**: Pelanggan dapat memantau apakah pesanannya sedang "Diproses" atau "Selesai", asyiknya tanpa harus memasukkan UUID panjang! Aplikasi mendukung pemanggilan pesanan lewat *Kode Pesanan Asli* (misal: `#7FAA`), berdasarkan data riwayat peramban (*Smart Local History*), atau kamu cukup ketikkan *Nama Pemesan*.
* **Visual Table Picker 🪑**: Pelanggan dapat memilih 1 dari 30 meja yang tersedia melalui grid interaktif. Status meja (Kosong/Penuh) terupdate secara **Real-time**, sehingga tidak ada lagi tabrakan nomor meja.
* **Sistem Kupon & Promo 🎟️**: Pelanggan bisa memasukkan kode promo di keranjang untuk mendapatkan diskon (Persentase atau Potongan Harga). Sistem dilengkapi validasi *minimum order* dan kuota pemakaian.
* **Simulasi QRIS 💳**: Pengalaman pembayaran modern dengan tampilan QRIS yang bersih dan instruksi pembayaran yang jelas.
* **Loyalty Points ⭐**: Setiap transaksi sukses, pelanggan akan menabung poin loyalitas (10% dari total belanja) yang tersimpan otomatis di perangkat mereka untuk kunjungan berikutnya.
* **Notifikasi Status Pesanan 🔔**: Dilengkapi Supabase Realtime di halaman sukses. Pelanggan akan menerima notifikasi otomatis (*Toast* & Suara) saat admin mengubah status pesanan menjadi "Ready".

### Untuk Admin Web
* **Dashboard Tersembunyi**: Diakses secara rahasia melalui tautan bawah (`/admin`) dengan *email + password*.
* **Live Orders (Supabase Realtime)**: Tak perlu tegang me-*refresh* layar kasir. Jika pembeli menekan pesan, order akan otomatis berbunyi dan muncul di antrean Admin dengan lencana **"Baru!"**.
* **Analytical Dashboard 📊**: Pantau performa bisnis dengan grafik pendapatan harian, statistik menu terlaris, dan ringkasan cuan mingguan secara visual.
* **Export Laporan Penjualan (CSV) 📂**: Admin dapat menarik laporan penjualan mendalam (detail pesanan, diskon, poin, metode bayar) ke format CSV untuk pembukuan profesional.
* **Manajemen Etalase (Toko Menu CRUD)**: Kasir dapat menambahkan menu baru, mengedit harga/tipe, atau menonaktifkan hidangan yang habis (**Tandai Habis**) dengan satu kali klik.
* **Kelola Promo Realtime 🎫**: Halaman khusus Admin untuk membuat, memantau, dan menonaktifkan kode promo secara *real-time*.


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

### 3. Konfigurasi Database & Auth (Supabase)
1. Buat proyek baru di [Supabase Dashboard](https://supabase.com/dashboard).
2. Temukan file kredensial rahasiamu di bagian **Settings > API**.
3. Buat file bernama `.env.local` di *folder* utama aplikasi (gunakan `.env.example` sebagai referensi), isikan sesuai data proyekmu:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://[YOUR_PROJECT_REF].supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=ey...[YOUR_ANON_KEY]...
   SUPABASE_SERVICE_ROLE_KEY=ey...[YOUR_SERVICE_ROLE_KEY]...
   ```
4. **Setup Tabel:** Buka **SQL Editor** pada web Supabase. Jalankan *query* secara berurutan:
   - Jalankan `supabase/schema.sql` (Struktur dasar).
   - Jalankan `supabase/promotions_migration.sql` (Sistem marketing & promo).
   - Jalankan `supabase/seed.sql` (Data menu awal).
5. **Setup Autentikasi Admin:**
   - Masuk ke menu **Authentication > Providers** di Supabase.
   - Pastikan **Email** sudah *Enabled*.
   - (Opsional) Matikan opsi *Confirm Email* agar kamu bisa langsung login setelah membuat akun tanpa verifikasi email.
6. **Bikin Akun Admin:**
   - Masuk ke menu **Authentication > Users**.
   - Klik **Add User** > **Create New User**.
   - Masukkan Email dan Password untuk login admin kamu. Akun inilah yang akan kamu gunakan untuk masuk ke halaman `/admin`.

### 4. Mulai Server Lokal
Ketikan perintah berikut di terminal:
```bash
npm run dev
```
Buka **`http://localhost:3000`** di browsermu dan mulailah mencoba berjualan!

---

💡 *Dibuat dengan ❤️ — Nikmati setiap tegukan.*
